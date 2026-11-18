// https://en.wikipedia.org/wiki/Condorcet%E2%80%93IRV_hybrid_method
import { ElectionResult } from "../generic";
import { createDefinition, startElection, castWith, validRanked, Definition, Election, RankedBallot } from "./helpers";
import { pairwise, condorcetWinner } from "./helpers";
import { getElectionResults as irvResults } from "./irv";

export { createDefinition, startElection };
export const castBallot = castWith(validRanked);
export type CondorcetIrvElection = Election<Definition, RankedBallot>;

// Condorcet winner if there is one, otherwise instant-runoff.
export const getElectionResults = (election: CondorcetIrvElection): ElectionResult => {
  const { options } = election.definition;
  const winner = condorcetWinner(options, pairwise(options, election.ballots));
  return winner !== undefined ? { result: "winner", winner } : irvResults(election);
};
