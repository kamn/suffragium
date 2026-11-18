// https://en.wikipedia.org/wiki/Sequential_proportional_approval_voting
import { MultiWinnerResult } from "../generic";
import { dedup, startElection, castWith, validRanked, zeroes, topK, SeatsDefinition, Election, RankedBallot } from "./helpers";

export { startElection };
export type ApprovalCommitteeElection = Election<SeatsDefinition, RankedBallot>;
export const createDefinition = (options: Array<string>, seats: number): SeatsDefinition => ({ options: dedup(options), seats });
// Each ballot lists the options the voter approves of.
export const castBallot = castWith<SeatsDefinition, RankedBallot>(validRanked);

// Elect one at a time; a ballot that already has k approved winners counts 1/(k+1) toward the rest.
export const getElectionResults = (election: ApprovalCommitteeElection): MultiWinnerResult => {
  const { options, seats } = election.definition;
  const winners: Array<string> = [];
  while (winners.length < Math.min(seats, options.length)) {
    const scores = zeroes(options.filter((o) => !winners.includes(o)));
    for (const b of election.ballots) {
      const weight = 1 / (1 + b.selection.filter((x) => winners.includes(x)).length);
      for (const x of b.selection) if (x in scores) scores[x] += weight;
    }
    winners.push(topK(scores, 1)[0]);
  }
  return { result: "winners", winners };
};
