// https://en.wikipedia.org/wiki/Tideman_alternative_method
import { ElectionResult } from "../generic";
import { createDefinition, startElection, castWith, validRanked, Definition, Election, RankedBallot } from "./helpers";
import { pairwise, smithSet, firstChoices, toResult } from "./helpers";

export { createDefinition, startElection };
export const castBallot = castWith(validRanked);
export type TidemanElection = Election<Definition, RankedBallot>;

// Cut to the Smith set, eliminate the fewest first choices, repeat. Options tied for fewest all go.
export const getElectionResults = (election: TidemanElection): ElectionResult => {
  let remaining = election.definition.options;
  while (remaining.length > 1) {
    const smith = smithSet(remaining, pairwise(remaining, election.ballots));
    if (smith.length === 1) return toResult(smith);
    const first = firstChoices(smith, election.ballots);
    const low = Math.min(...Object.values(first));
    const kept = smith.filter((o) => first[o] !== low);
    if (kept.length === 0) return toResult(smith);
    remaining = kept;
  }
  return toResult(remaining);
};
