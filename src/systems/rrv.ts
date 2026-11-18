// https://en.wikipedia.org/wiki/Reweighted_range_voting
import { MultiWinnerResult } from "../generic";
import { dedup, startElection as start, castWith, validScores, scoreOf, zeroes, topK, SeatsDefinition, Election, ScoreBallot } from "./helpers";

export type RrvDefinition = SeatsDefinition & { maxScore: number };
export type RrvElection = Election<RrvDefinition, ScoreBallot>;
export const startElection = (definition: RrvDefinition): RrvElection => start<RrvDefinition, ScoreBallot>(definition);

export const createDefinition = (options: Array<string>, seats: number, maxScore: number): RrvDefinition => ({
  options: dedup(options),
  seats,
  maxScore,
});
export const castBallot = castWith((d: RrvDefinition, b: ScoreBallot) => validScores(d, b, d.maxScore));

// Elect one at a time; each ballot is weighted 1 / (1 + (its scores for winners so far) / maxScore).
export const getElectionResults = (election: RrvElection): MultiWinnerResult => {
  const { options, seats, maxScore } = election.definition;
  const winners: Array<string> = [];
  while (winners.length < Math.min(seats, options.length)) {
    const scores = zeroes(options.filter((o) => !winners.includes(o)));
    for (const b of election.ballots) {
      const weight = 1 / (1 + winners.reduce((s, w) => s + scoreOf(b, w), 0) / maxScore);
      for (const v of b.selection) if (v.selection in scores) scores[v.selection] += weight * v.score;
    }
    winners.push(topK(scores, 1)[0]);
  }
  return { result: "winners", winners };
};
