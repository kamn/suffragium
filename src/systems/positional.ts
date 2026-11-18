// https://en.wikipedia.org/wiki/Positional_voting
// Borda, Dowdall and plurality are all special cases of this with different weights.
import { ElectionResult } from "../generic";
import { dedup, startElection, castWith, validRanked, zeroes, best, Definition, Election, RankedBallot } from "./helpers";

export { startElection };
export type PositionalDefinition = Definition & { weights: Array<number> };
export type PositionalElection = Election<PositionalDefinition, RankedBallot>;
// weights[i] = points for being ranked i+1th; positions past the end score 0.
export const createDefinition = (options: Array<string>, weights: Array<number>): PositionalDefinition => ({
  options: dedup(options),
  weights,
});
export const castBallot = castWith<PositionalDefinition, RankedBallot>(validRanked);

export const getElectionResults = (election: PositionalElection): ElectionResult => {
  const scores = zeroes(election.definition.options);
  for (const b of election.ballots) b.selection.forEach((x, i) => (scores[x] += election.definition.weights[i] ?? 0));
  return best(scores);
};
