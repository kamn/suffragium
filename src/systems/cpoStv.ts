// https://en.wikipedia.org/wiki/CPO-STV
import { MultiWinnerResult } from "../generic";
import { dedup, startElection, castWith, validRanked, zeroes, combinations, schulzeWinners, SeatsDefinition, Election, RankedBallot } from "./helpers";

export { startElection };
export type RankedCommitteeElection = Election<SeatsDefinition, RankedBallot>;
export const createDefinition = (options: Array<string>, seats: number): SeatsDefinition => ({ options: dedup(options), seats });
export const castBallot = castWith<SeatsDefinition, RankedBallot>(validRanked);

const EPSILON = 1e-9;

// Compare committees A and B: drop everyone in neither, move votes to the next preference among
// A ∪ B, and move surpluses (over the Droop quota) of candidates in both. A committee's score is
// the votes its members hold. Returns [score A, score B].
const compare = (ballots: Array<RankedBallot>, a: Array<string>, b: Array<string>, quota: number) => {
  const pool = dedup([...a, ...b]);
  const both = a.filter((x) => b.includes(x));
  const weights = ballots.map(() => 1);
  const capped = new Set<string>();
  for (;;) {
    const tops = ballots.map((ballot) => ballot.selection.find((x) => pool.includes(x) && !capped.has(x)));
    const tally = zeroes(pool);
    tops.forEach((t, i) => t !== undefined && (tally[t] += weights[i]));
    const over = both.find((x) => !capped.has(x) && tally[x] > quota + EPSILON);
    if (over === undefined) {
      const score = (c: Array<string>) => c.reduce((s, x) => s + (capped.has(x) ? quota : tally[x]), 0);
      return [score(a), score(b)];
    }
    const keep = (tally[over] - quota) / tally[over];
    tops.forEach((t, i) => t === over && (weights[i] *= keep));
    capped.add(over);
  }
};

// Every committee is compared with every other; the Condorcet-winning committee wins,
// with Schulze on score margins when there's a cycle.
// ponytail: C(n, seats)² comparisons, small elections only; a tied result returns the first committee
export const getElectionResults = (election: RankedCommitteeElection): MultiWinnerResult => {
  const { options, seats } = election.definition;
  const quota = Math.floor(election.ballots.length / (seats + 1)) + 1;
  const committees = combinations(options, Math.min(seats, options.length));
  const keys = committees.map((c) => JSON.stringify(c));
  const margin: Record<string, Record<string, number>> = Object.fromEntries(keys.map((k) => [k, {}]));
  committees.forEach((a, i) =>
    committees.slice(i + 1).forEach((b, j) => {
      const [sa, sb] = compare(election.ballots, a, b, quota);
      margin[keys[i]][keys[i + 1 + j]] = sa - sb;
      margin[keys[i + 1 + j]][keys[i]] = sb - sa;
    })
  );
  const [winner] = schulzeWinners(keys, (x, y) => Math.max(0, margin[x][y]));
  return { result: "winners", winners: JSON.parse(winner) };
};
