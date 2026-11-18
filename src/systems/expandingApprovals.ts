// https://en.wikipedia.org/wiki/Expanding_approvals_rule
import { MultiWinnerResult } from "../generic";
import { dedup, startElection, castWith, validRanked, zeroes, topK, SeatsDefinition, Election, RankedBallot } from "./helpers";

export { startElection };
export type RankedCommitteeElection = Election<SeatsDefinition, RankedBallot>;
export const createDefinition = (options: Array<string>, seats: number): SeatsDefinition => ({ options: dedup(options), seats });
export const castBallot = castWith<SeatsDefinition, RankedBallot>(validRanked);

const EPSILON = 1e-9;

// Hare quota n/k. Look at each voter's top 1, then top 2, ... choices. Whenever a candidate's
// supporters (weighted) reach the quota, elect it and spend one quota of their weight proportionally.
// ponytail: seats left after every rank is exhausted go to the best-supported remaining candidates
export const getElectionResults = (election: RankedCommitteeElection): MultiWinnerResult => {
  const { options, seats } = election.definition;
  const { ballots } = election;
  const k = Math.min(seats, options.length);
  const quota = ballots.length / seats;
  const weights = ballots.map(() => 1);
  const winners: Array<string> = [];
  let support = zeroes(options);
  for (let depth = 1; depth <= options.length && winners.length < k; depth++) {
    while (winners.length < k) {
      support = zeroes(options.filter((o) => !winners.includes(o)));
      ballots.forEach((b, i) => b.selection.slice(0, depth).forEach((x) => x in support && (support[x] += weights[i])));
      const [leader] = topK(support, 1);
      if (leader === undefined || support[leader] < quota - EPSILON || support[leader] === 0) break;
      const keep = 1 - quota / support[leader];
      ballots.forEach((b, i) => b.selection.slice(0, depth).includes(leader) && (weights[i] *= keep));
      winners.push(leader);
    }
  }
  const rest = topK(Object.fromEntries(options.filter((o) => !winners.includes(o)).map((o) => [o, support[o] ?? 0])), k - winners.length);
  return { result: "winners", winners: [...winners, ...rest] };
};
