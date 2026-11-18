// https://en.wikipedia.org/wiki/Nanson%27s_method
import { ElectionResult } from "../generic";
import { createDefinition, startElection, castWith, validRanked, Definition, Election, RankedBallot } from "./helpers";
import { bordaScores, toResult } from "./helpers";

export { createDefinition, startElection };
export const castBallot = castWith(validRanked);
export type NansonElection = Election<Definition, RankedBallot>;

// Repeatedly drop every option with a below-average Borda score.
export const getElectionResults = (election: NansonElection): ElectionResult => {
  let remaining = election.definition.options;
  while (remaining.length > 1) {
    const scores = bordaScores(remaining, election.ballots);
    const average = Object.values(scores).reduce((a, b) => a + b, 0) / remaining.length;
    const kept = remaining.filter((o) => scores[o] >= average);
    if (kept.length === remaining.length) break;
    remaining = kept;
  }
  return toResult(remaining);
};
