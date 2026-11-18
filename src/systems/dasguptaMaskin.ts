// https://en.wikipedia.org/wiki/Comparison_of_electoral_systems (Dasgupta–Maskin method)
import { ElectionResult } from "../generic";
import { createDefinition, startElection, castWith, validRanked, Definition, Election, RankedBallot } from "./helpers";
import { pairwise, smithSet, bordaScores, best } from "./helpers";

export { createDefinition, startElection };
export const castBallot = castWith(validRanked);
export type DasguptaMaskinElection = Election<Definition, RankedBallot>;

// Borda count restricted to the Smith set (so a Condorcet winner always wins).
export const getElectionResults = (election: DasguptaMaskinElection): ElectionResult => {
  const { options } = election.definition;
  return best(bordaScores(smithSet(options, pairwise(options, election.ballots)), election.ballots));
};
