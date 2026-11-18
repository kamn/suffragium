// https://en.wikipedia.org/wiki/Fractional_approval_voting (conditional utilitarian rule)
import { LotteryResult } from "../generic";
import { createDefinition, startElection, castWith, validRanked, zeroes, Definition, Election, RankedBallot } from "./helpers";

export { createDefinition, startElection };
export type FractionalApprovalElection = Election<Definition, RankedBallot>;
// Each ballot lists the options the voter approves of.
export const castBallot = castWith(validRanked);

// Each voter controls 1/n of the probability and splits it evenly among the options they
// approve that have the most approvals overall.
export const getElectionResults = (election: FractionalApprovalElection): LotteryResult => {
  const { options } = election.definition;
  const { ballots } = election;
  const approvals = zeroes(options);
  for (const b of ballots) for (const x of b.selection) approvals[x]++;
  const probabilities = zeroes(options);
  const voting = ballots.filter((b) => b.selection.length > 0);
  for (const b of voting) {
    const top = Math.max(...b.selection.map((x) => approvals[x]));
    const favourites = b.selection.filter((x) => approvals[x] === top);
    for (const x of favourites) probabilities[x] += 1 / voting.length / favourites.length;
  }
  return { result: "lottery", probabilities };
};
