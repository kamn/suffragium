// https://en.wikipedia.org/wiki/Phragmen%27s_voting_rules (sequential Phragmén)
import { MultiWinnerResult } from "../generic";
import { dedup, startElection, castWith, validRanked, zeroes, topK, SeatsDefinition, Election, RankedBallot } from "./helpers";

export { startElection };
export type ApprovalCommitteeElection = Election<SeatsDefinition, RankedBallot>;
export const createDefinition = (options: Array<string>, seats: number): SeatsDefinition => ({ options: dedup(options), seats });
// Each ballot lists the options the voter approves of.
export const castBallot = castWith<SeatsDefinition, RankedBallot>(validRanked);

// Each seat costs 1 unit of load, shared by its approvers. Elect whichever candidate would leave
// its approvers with the lowest maximum load, then raise those approvers' loads to that level.
export const getElectionResults = (election: ApprovalCommitteeElection): MultiWinnerResult => {
  const { options, seats } = election.definition;
  const { ballots } = election;
  const load = ballots.map(() => 0);
  const winners: Array<string> = [];
  while (winners.length < Math.min(seats, options.length)) {
    const newLoad: Record<string, number> = {};
    for (const c of options.filter((o) => !winners.includes(o))) {
      const approvers = ballots.map((b, i) => (b.selection.includes(c) ? i : -1)).filter((i) => i >= 0);
      newLoad[c] = approvers.length ? (1 + approvers.reduce((s, i) => s + load[i], 0)) / approvers.length : Infinity;
    }
    const [next] = topK(Object.fromEntries(Object.entries(newLoad).map(([c, l]) => [c, -l])), 1);
    ballots.forEach((b, i) => b.selection.includes(next) && (load[i] = newLoad[next]));
    winners.push(next);
  }
  return { result: "winners", winners };
};
