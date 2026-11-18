// https://en.wikipedia.org/wiki/Score_voting
import { ElectionResult } from "../generic";
import { createDefinition, startElection as start, castWith, validScores, zeroes, best, Definition, Election, ScoreBallot } from "./helpers";

export { createDefinition };
export type ScoreElection = Election<Definition, ScoreBallot>;
export const startElection = (definition: Definition): ScoreElection => start<Definition, ScoreBallot>(definition);
export const castBallot = castWith((d: Definition, b: ScoreBallot) => validScores(d, b));

// Highest total score wins.
export const getElectionResults = (election: ScoreElection): ElectionResult => {
  const totals = zeroes(election.definition.options);
  for (const b of election.ballots) for (const v of b.selection) totals[v.selection] += v.score;
  return best(totals);
};
