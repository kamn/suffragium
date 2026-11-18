// https://en.wikipedia.org/wiki/Schulze_STV
import { MultiWinnerResult } from "../generic";
import { dedup, startElection, castWith, validRanked, zeroes, combinations, schulzeWinners, SeatsDefinition, Election, RankedBallot } from "./helpers";

export { startElection };
export type RankedCommitteeElection = Election<SeatsDefinition, RankedBallot>;
export const createDefinition = (options: Array<string>, seats: number): SeatsDefinition => ({ options: dedup(options), seats });
export const castBallot = castWith<SeatsDefinition, RankedBallot>(validRanked);

// Committees A = S+a and B = S+b differing by one candidate are compared by the largest z such
// that every member of A can be given z votes from voters who rank that member above b. By Hall's
// theorem that is the minimum over subsets T of A of (voters preferring some member of T to b) / |T|.
// The winning committee is the Schulze winner over these links.
// ponytail: no "proportional completion" for partial ballots (unranked = below every ranked option);
// exponential in options and seats; a tied result returns the first committee
export const getElectionResults = (election: RankedCommitteeElection): MultiWinnerResult => {
  const { options, seats } = election.definition;
  const { ballots } = election;
  const prefers = (sel: Array<string>, c: string, b: string) => {
    const rank = (o: string) => (sel.includes(o) ? sel.indexOf(o) : Infinity);
    return rank(c) < rank(b);
  };
  const strength = (a: Array<string>, b: Array<string>) => {
    const [out] = b.filter((x) => !a.includes(x));
    return Math.min(
      ...Array.from({ length: a.length }, (_, i) => i + 1).flatMap((size) =>
        combinations(a, size).map((t) => ballots.filter((v) => t.some((c) => prefers(v.selection, c, out))).length / size)
      )
    );
  };
  const committees = combinations(options, Math.min(seats, options.length));
  const keys = committees.map((c) => JSON.stringify(c));
  const differByOne = (a: Array<string>, b: Array<string>) => a.filter((x) => !b.includes(x)).length === 1;
  const n: Record<string, Record<string, number>> = Object.fromEntries(keys.map((k) => [k, {}]));
  committees.forEach((a, i) => committees.forEach((b, j) => (n[keys[i]][keys[j]] = i !== j && differByOne(a, b) ? strength(a, b) : 0)));
  const [winner] = schulzeWinners(keys, (x, y) => (n[x][y] > n[y][x] ? n[x][y] : 0));
  return { result: "winners", winners: JSON.parse(winner) };
};
