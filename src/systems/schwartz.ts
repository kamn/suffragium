// https://en.wikipedia.org/wiki/Schwartz_set
import { ElectionResult } from "../generic";
import { createDefinition, startElection, castWith, validRanked, Definition, Election, RankedBallot } from "./helpers";
import { pairwise, beats, closure, toResult } from "./helpers";

export { createDefinition, startElection };
export const castBallot = castWith(validRanked);
export type SchwartzElection = Election<Definition, RankedBallot>;

// Union of the minimal sets nobody outside beats. A set larger than one is returned as a tie.
export const getElectionResults = (election: SchwartzElection): ElectionResult => {
  const { options } = election.definition;
  const d = pairwise(options, election.ballots);
  const reach = closure(options, (a, b) => beats(d, a, b));
  return toResult(options.filter((a) => options.every((b) => !reach[b][a] || reach[a][b])));
};
