// https://en.wikipedia.org/wiki/Proportional_approval_voting
import { MultiWinnerResult } from "../generic";
import { dedup, startElection, castWith, validRanked, zeroes, topK, SeatsDefinition, Election, RankedBallot } from "./helpers";

export { startElection };
export type ApprovalCommitteeElection = Election<SeatsDefinition, RankedBallot>;
export const createDefinition = (options: Array<string>, seats: number): SeatsDefinition => ({ options: dedup(options), seats });
// Each ballot lists the options the voter approves of.
export const castBallot = castWith<SeatsDefinition, RankedBallot>(validRanked);

const harmonic = (n: number) => Array.from({ length: n }, (_, i) => 1 / (i + 1)).reduce((a, b) => a + b, 0);

const combinations = (xs: Array<string>, k: number): Array<Array<string>> =>
  k === 0 ? [[]] : xs.flatMap((x, i) => combinations(xs.slice(i + 1), k - 1).map((c) => [x, ...c]));

// The committee maximising sum over voters of 1 + 1/2 + ... + 1/(approved members elected).
// ponytail: brute force over every committee, C(n, seats) blows up past ~20 options; ties go to option order
export const getElectionResults = (election: ApprovalCommitteeElection): MultiWinnerResult => {
  const { options, seats } = election.definition;
  const value = (committee: Array<string>) =>
    election.ballots.reduce((sum, b) => sum + harmonic(b.selection.filter((x) => committee.includes(x)).length), 0);
  const committees = combinations(options, Math.min(seats, options.length));
  const winners = committees.reduce((bestSoFar, c) => (value(c) > value(bestSoFar) + 1e-9 ? c : bestSoFar));
  return { result: "winners", winners };
};
