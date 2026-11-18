// https://en.wikipedia.org/wiki/Multiwinner_approval_voting#Minimax_approval_voting
import { MultiWinnerResult } from "../generic";
import { dedup, startElection, castWith, validRanked, zeroes, topK, SeatsDefinition, Election, RankedBallot } from "./helpers";

export { startElection };
export type ApprovalCommitteeElection = Election<SeatsDefinition, RankedBallot>;
export const createDefinition = (options: Array<string>, seats: number): SeatsDefinition => ({ options: dedup(options), seats });
// Each ballot lists the options the voter approves of.
export const castBallot = castWith<SeatsDefinition, RankedBallot>(validRanked);
import { combinations } from "./helpers";

// The committee whose largest disagreement with any voter (approved-but-not-elected plus
// elected-but-not-approved) is smallest.
// ponytail: brute force over every committee; ties go to option order
export const getElectionResults = (election: ApprovalCommitteeElection): MultiWinnerResult => {
  const { options, seats } = election.definition;
  const worst = (c: Array<string>) =>
    Math.max(0, ...election.ballots.map((b) => b.selection.filter((x) => !c.includes(x)).length + c.filter((x) => !b.selection.includes(x)).length));
  const winners = combinations(options, Math.min(seats, options.length)).reduce((a, c) => (worst(c) < worst(a) ? c : a));
  return { result: "winners", winners };
};
