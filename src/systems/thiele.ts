// https://en.wikipedia.org/wiki/Thiele%27s_voting_rules
// weights [1, 1/2, 1/3, ...] = PAV, [1, 1, 1, ...] = block approval, [1, 0, 0, ...] = Chamberlin–Courant.
import { MultiWinnerResult } from "../generic";
import { dedup, startElection, castWith, validRanked, combinations, SeatsDefinition, Election, RankedBallot } from "./helpers";

export { startElection };
export type ThieleDefinition = SeatsDefinition & { weights: Array<number> };
export type ThieleElection = Election<ThieleDefinition, RankedBallot>;
export const createDefinition = (options: Array<string>, seats: number, weights: Array<number>): ThieleDefinition => ({
  options: dedup(options),
  seats,
  weights,
});
// Each ballot lists the options the voter approves of.
export const castBallot = castWith<ThieleDefinition, RankedBallot>(validRanked);

// A voter with j approved winners contributes weights[0] + ... + weights[j-1]; the best committee wins.
// ponytail: brute force over every committee, C(n, seats) blows up past ~20 options; ties go to option order
export const bestCommittee = (options: Array<string>, seats: number, ballots: Array<RankedBallot>, weights: Array<number>) => {
  const value = (committee: Array<string>) =>
    ballots.reduce((sum, b) => {
      const j = b.selection.filter((x) => committee.includes(x)).length;
      return sum + weights.slice(0, j).reduce((a, w) => a + w, 0);
    }, 0);
  return combinations(options, Math.min(seats, options.length)).reduce((bestSoFar, c) =>
    value(c) > value(bestSoFar) + 1e-9 ? c : bestSoFar
  );
};

export const getElectionResults = (election: ThieleElection): MultiWinnerResult => {
  const { options, seats, weights } = election.definition;
  return { result: "winners", winners: bestCommittee(options, seats, election.ballots, weights) };
};
