// https://en.wikipedia.org/wiki/Schulze_method
import { ElectionResult } from "../generic";
import { createDefinition, startElection, castWith, validRanked, Definition, Election, RankedBallot } from "./helpers";
import { pairwise, beats, toResult, schulzeWinners } from "./helpers";

export { createDefinition, startElection };
export const castBallot = castWith(validRanked);
export type SchulzeElection = Election<Definition, RankedBallot>;

// Strength of the strongest path of pairwise wins (widest path); winners are never beaten on path strength.
export const getElectionResults = (election: SchulzeElection): ElectionResult => {
  const { options } = election.definition;
  const d = pairwise(options, election.ballots);
  return toResult(schulzeWinners(options, (a, b) => (beats(d, a, b) ? d[a][b] : 0)));
};
