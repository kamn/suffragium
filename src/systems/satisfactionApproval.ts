// https://en.wikipedia.org/wiki/Satisfaction_approval_voting
import { MultiWinnerResult } from "../generic";
import { dedup, startElection, castWith, validRanked, zeroes, topK, SeatsDefinition, Election, RankedBallot } from "./helpers";

export { startElection };
export type ApprovalCommitteeElection = Election<SeatsDefinition, RankedBallot>;
export const createDefinition = (options: Array<string>, seats: number): SeatsDefinition => ({ options: dedup(options), seats });
// Each ballot lists the options the voter approves of.
export const castBallot = castWith<SeatsDefinition, RankedBallot>(validRanked);

// Each ballot's single vote is split evenly among the options it approves; the top totals win.
export const getElectionResults = (election: ApprovalCommitteeElection): MultiWinnerResult => {
  const totals = zeroes(election.definition.options);
  for (const b of election.ballots) for (const x of b.selection) totals[x] += 1 / b.selection.length;
  return { result: "winners", winners: topK(totals, election.definition.seats) };
};
