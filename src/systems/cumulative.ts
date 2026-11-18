// https://en.wikipedia.org/wiki/Cumulative_voting
import { MultiWinnerResult } from "../generic";
import { dedup, startElection as start, castWith, validScores, zeroes, topK, SeatsDefinition, Election, ScoreBallot } from "./helpers";

export type CumulativeDefinition = SeatsDefinition & { points: number };
export type CumulativeElection = Election<CumulativeDefinition, ScoreBallot>;
export const startElection = (definition: CumulativeDefinition): CumulativeElection => start<CumulativeDefinition, ScoreBallot>(definition);

export const createDefinition = (options: Array<string>, seats: number, points: number): CumulativeDefinition => ({
  options: dedup(options),
  seats,
  points,
});

// Each ballot spreads at most `points` among the options, stacking as many as it likes on one.
export const castBallot = castWith(
  (d: CumulativeDefinition, b: ScoreBallot) =>
    validScores(d, b) && b.selection.reduce((sum, v) => sum + v.score, 0) <= d.points
);

// Most points take the seats; ties at the cut go to option order.
export const getElectionResults = (election: CumulativeElection): MultiWinnerResult => {
  const totals = zeroes(election.definition.options);
  for (const b of election.ballots) for (const v of b.selection) totals[v.selection] += v.score;
  return { result: "winners", winners: topK(totals, election.definition.seats) };
};
