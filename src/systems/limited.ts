// https://en.wikipedia.org/wiki/Limited_voting
// Also covers SNTV (votesPerBallot = 1), block voting (votesPerBallot = seats) and block approval (unlimited).
import { MultiWinnerResult } from "../generic";
import { dedup, startElection, castWith, validRanked, zeroes, topK, SeatsDefinition, Election, RankedBallot } from "./helpers";

export { startElection };
export type LimitedDefinition = SeatsDefinition & { votesPerBallot: number };
export type LimitedElection = Election<LimitedDefinition, RankedBallot>;

export const createDefinition = (options: Array<string>, seats: number, votesPerBallot: number): LimitedDefinition => ({
  options: dedup(options),
  seats,
  votesPerBallot,
});
// https://en.wikipedia.org/wiki/Single_non-transferable_vote
export const createSntvDefinition = (options: Array<string>, seats: number) => createDefinition(options, seats, 1);
// https://en.wikipedia.org/wiki/Plurality_block_voting
export const createBlockDefinition = (options: Array<string>, seats: number) => createDefinition(options, seats, seats);
// https://en.wikipedia.org/wiki/Multiwinner_approval_voting (approve as many as you like, top k win)
export const createBlockApprovalDefinition = (options: Array<string>, seats: number) =>
  createDefinition(options, seats, dedup(options).length);

// Each ballot lists up to votesPerBallot distinct options (order doesn't matter).
export const castBallot = castWith(
  (d: LimitedDefinition, b: RankedBallot) => validRanked(d, b) && b.selection.length <= d.votesPerBallot
);

// Most votes take the seats; ties at the cut go to option order.
export const getElectionResults = (election: LimitedElection): MultiWinnerResult => {
  const votes = zeroes(election.definition.options);
  for (const b of election.ballots) for (const x of b.selection) votes[x]++;
  return { result: "winners", winners: topK(votes, election.definition.seats) };
};
