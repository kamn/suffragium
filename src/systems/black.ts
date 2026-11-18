// https://en.wikipedia.org/wiki/Condorcet_method#Black
import { ElectionResult } from "../generic";
import { createDefinition, startElection, castWith, validRanked, Definition, Election, RankedBallot } from "./helpers";
import { pairwise, condorcetWinner, bordaScores, best } from "./helpers";

export { createDefinition, startElection };
export const castBallot = castWith(validRanked);
export type BlackElection = Election<Definition, RankedBallot>;

// Condorcet winner if there is one, otherwise the Borda winner.
export const getElectionResults = (election: BlackElection): ElectionResult => {
  const { options } = election.definition;
  const winner = condorcetWinner(options, pairwise(options, election.ballots));
  return winner !== undefined ? { result: "winner", winner } : best(bordaScores(options, election.ballots));
};
