// https://en.wikipedia.org/wiki/Minimax_Condorcet_method
import { ElectionResult } from "../generic";
import { createDefinition, startElection, castWith, validRanked, Definition, Election, RankedBallot } from "./helpers";
import { pairwise, lowest } from "./helpers";

export { createDefinition, startElection };
export const castBallot = castWith(validRanked);
export type MinimaxElection = Election<Definition, RankedBallot>;

// Winner is the option whose largest pairwise opposition is smallest.
export const getElectionResults = (election: MinimaxElection): ElectionResult => {
  const { options } = election.definition;
  const d = pairwise(options, election.ballots);
  return lowest(Object.fromEntries(options.map((x) => [x, Math.max(0, ...options.map((y) => d[y][x]))])));
};
