// https://en.wikipedia.org/wiki/Kemeny%E2%80%93Young_method
import { ElectionResult } from "../generic";
import { createDefinition, startElection, castWith, validRanked, Definition, Election, RankedBallot } from "./helpers";
import { pairwise, toResult, dedup } from "./helpers";

export { createDefinition, startElection };
export const castBallot = castWith(validRanked);
export type KemenyElection = Election<Definition, RankedBallot>;

const permutations = (xs: Array<string>): Array<Array<string>> =>
  xs.length <= 1
    ? [xs]
    : xs.flatMap((x, i) => permutations([...xs.slice(0, i), ...xs.slice(i + 1)]).map((p) => [x, ...p]));

// The ranking(s) agreeing with the most voter pairwise preferences; their top option wins.
// ponytail: brute force over n! rankings, fine to ~8 options; needs an ILP solver beyond that
export const getElectionResults = (election: KemenyElection): ElectionResult => {
  const { options } = election.definition;
  const d = pairwise(options, election.ballots);
  const agreement = (p: Array<string>) =>
    p.reduce((sum, a, i) => sum + p.slice(i + 1).reduce((s, b) => s + d[a][b], 0), 0);
  const rankings = options.length ? permutations(options) : [];
  const top = Math.max(...rankings.map(agreement));
  return toResult(dedup(rankings.filter((p) => agreement(p) === top).map((p) => p[0])));
};
