// https://en.wikipedia.org/wiki/Smith_set
import { ElectionResult } from "../generic";
import { createDefinition, startElection, castWith, validRanked, Definition, Election, RankedBallot } from "./helpers";
import { pairwise, closure, toResult } from "./helpers";

export { createDefinition, startElection };
export const castBallot = castWith(validRanked);
export type SmithElection = Election<Definition, RankedBallot>;

// Smallest set whose members all beat everyone outside it. A set larger than one is returned as a tie.
export const getElectionResults = (election: SmithElection): ElectionResult => {
  const { options } = election.definition;
  const d = pairwise(options, election.ballots);
  const reach = closure(options, (a, b) => d[a][b] >= d[b][a]);
  return toResult(options.filter((a) => options.every((b) => reach[a][b])));
};
