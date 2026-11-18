// https://en.wikipedia.org/wiki/Ranked_pairs
import { ElectionResult } from "../generic";
import { createDefinition, startElection, castWith, validRanked, Definition, Election, RankedBallot } from "./helpers";
import { pairwise, beats, toResult } from "./helpers";

export { createDefinition, startElection };
export const castBallot = castWith(validRanked);
export type RankedPairsElection = Election<Definition, RankedBallot>;

// Lock in pairwise victories from largest margin down, skipping any that would form a cycle.
// ponytail: equal margins are locked in option order, not by the tie-breaking ranking from the spec
export const getElectionResults = (election: RankedPairsElection): ElectionResult => {
  const { options } = election.definition;
  const d = pairwise(options, election.ballots);
  const margin = ([a, b]: Array<string>) => d[a][b] - d[b][a];
  const victories = options
    .flatMap((a) => options.filter((b) => beats(d, a, b)).map((b) => [a, b]))
    .sort((x, y) => margin(y) - margin(x));
  const locked: Record<string, Array<string>> = Object.fromEntries(options.map((o) => [o, []]));
  const reaches = (from: string, to: string): boolean =>
    from === to || locked[from].some((next) => reaches(next, to));
  for (const [a, b] of victories) if (!reaches(b, a)) locked[a].push(b);
  return toResult(options.filter((o) => !options.some((x) => locked[x].includes(o))));
};
