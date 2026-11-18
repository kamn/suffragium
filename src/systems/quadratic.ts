// https://en.wikipedia.org/wiki/Quadratic_voting
import { ElectionResult } from "../generic";
import { dedup, startElection as start, castWith, validRanked, zeroes, best, Definition, Election, ScoreBallot } from "./helpers";

export type QuadraticDefinition = Definition & { credits: number };
export type QuadraticElection = Election<QuadraticDefinition, ScoreBallot>;
export const createDefinition = (options: Array<string>, credits: number): QuadraticDefinition => ({ options: dedup(options), credits });
export const startElection = (definition: QuadraticDefinition): QuadraticElection => start<QuadraticDefinition, ScoreBallot>(definition);

// score = votes cast for (negative = against) an option; n votes cost n² credits.
export const castBallot = castWith(
  (d: QuadraticDefinition, b: ScoreBallot) =>
    validRanked(d, { selection: b.selection.map((v) => v.selection) }) &&
    b.selection.every((v) => Number.isInteger(v.score)) &&
    b.selection.reduce((cost, v) => cost + v.score * v.score, 0) <= d.credits
);

export const getElectionResults = (election: QuadraticElection): ElectionResult => {
  const totals = zeroes(election.definition.options);
  for (const b of election.ballots) for (const v of b.selection) totals[v.selection] += v.score;
  return best(totals);
};
