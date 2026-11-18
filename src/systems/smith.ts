// https://en.wikipedia.org/wiki/Smith_set
import { ElectionResult } from "../generic";
import { createDefinition, startElection, castWith, validRanked, Definition, Election, RankedBallot } from "./helpers";
import { pairwise, smithSet, toResult } from "./helpers";

export { createDefinition, startElection };
export const castBallot = castWith(validRanked);
export type SmithElection = Election<Definition, RankedBallot>;

// Smallest set whose members all beat everyone outside it. A set larger than one is returned as a tie.
export const getElectionResults = (election: SmithElection): ElectionResult => {
  const { options } = election.definition;
  return toResult(smithSet(options, pairwise(options, election.ballots)));
};
