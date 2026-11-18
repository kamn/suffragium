// https://en.wikipedia.org/wiki/Nanson%27s_method#Baldwin_method
import { ElectionResult } from "../generic";
import { createDefinition, startElection, castWith, validRanked, Definition, Election, RankedBallot } from "./helpers";
import { bordaScores, toResult } from "./helpers";

export { createDefinition, startElection };
export const castBallot = castWith(validRanked);
export type BaldwinElection = Election<Definition, RankedBallot>;

// Repeatedly drop the lowest Borda score (recounted each round). Options tied for lowest all go.
export const getElectionResults = (election: BaldwinElection): ElectionResult => {
  let remaining = election.definition.options;
  while (remaining.length > 1) {
    const scores = bordaScores(remaining, election.ballots);
    const low = Math.min(...Object.values(scores));
    const kept = remaining.filter((o) => scores[o] !== low);
    if (kept.length === 0) break;
    remaining = kept;
  }
  return toResult(remaining);
};
