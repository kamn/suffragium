// https://en.wikipedia.org/wiki/Proportional_approval_voting
import { MultiWinnerResult } from "../generic";
import { dedup, startElection, castWith, validRanked, zeroes, topK, SeatsDefinition, Election, RankedBallot } from "./helpers";

export { startElection };
export type ApprovalCommitteeElection = Election<SeatsDefinition, RankedBallot>;
export const createDefinition = (options: Array<string>, seats: number): SeatsDefinition => ({ options: dedup(options), seats });
// Each ballot lists the options the voter approves of.
export const castBallot = castWith<SeatsDefinition, RankedBallot>(validRanked);
import { bestCommittee } from "./thiele";

// Thiele's method with harmonic weights 1, 1/2, 1/3, ...
export const getElectionResults = (election: ApprovalCommitteeElection): MultiWinnerResult => {
  const { options, seats } = election.definition;
  const harmonic = options.map((_, i) => 1 / (i + 1));
  return { result: "winners", winners: bestCommittee(options, seats, election.ballots, harmonic) };
};
