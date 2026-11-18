// https://electowiki.org/wiki/3-2-1_voting
import { ElectionResult } from "../generic";
import { createDefinition, startElection as start, castWith, validScores, scoreOf, zeroes, topK, best, toResult, Definition, Election, ScoreBallot } from "./helpers";

export { createDefinition };
export type ThreeTwoOneElection = Election<Definition, ScoreBallot>;
export const startElection = (definition: Definition): ThreeTwoOneElection => start<Definition, ScoreBallot>(definition);
// Ratings: 2 = good, 1 = OK, 0 = bad. An option a ballot leaves out counts as bad.
export const castBallot = castWith(
  (d: Definition, b: ScoreBallot) => validScores(d, b, 2) && b.selection.every((v) => Number.isInteger(v.score))
);

// 3 semifinalists with the most "good", 2 finalists among them with the fewest "bad",
// then the finalist rated higher on more ballots wins.
export const getElectionResults = (election: ThreeTwoOneElection): ElectionResult => {
  const { options } = election.definition;
  const { ballots } = election;
  if (options.length < 2) return toResult(options);
  const count = (rating: number) => {
    const c = zeroes(options);
    for (const b of ballots) for (const o of options) if (scoreOf(b, o) === rating) c[o]++;
    return c;
  };
  const good = count(2);
  const bad = count(0);
  const semis = topK(good, 3);
  const [a, b] = topK(Object.fromEntries(semis.map((o) => [o, -bad[o]])), 2);
  const runoff = { [a]: 0, [b]: 0 };
  for (const ballot of ballots) {
    const diff = scoreOf(ballot, a) - scoreOf(ballot, b);
    if (diff > 0) runoff[a]++;
    if (diff < 0) runoff[b]++;
  }
  return best(runoff);
};
