// https://en.wikipedia.org/wiki/Method_of_equal_shares (approval ballots, every seat costs 1)
import { MultiWinnerResult } from "../generic";
import { dedup, startElection, castWith, validRanked, zeroes, topK, SeatsDefinition, Election, RankedBallot } from "./helpers";

export { startElection };
export type ApprovalCommitteeElection = Election<SeatsDefinition, RankedBallot>;
export const createDefinition = (options: Array<string>, seats: number): SeatsDefinition => ({ options: dedup(options), seats });
// Each ballot lists the options the voter approves of.
export const castBallot = castWith<SeatsDefinition, RankedBallot>(validRanked);

const EPSILON = 1e-9;

// Each voter starts with budget/n. Repeatedly elect the candidate its approvers can pay for
// with the smallest per-voter share rho (voters short of rho pay all they have).
const run = (election: ApprovalCommitteeElection, totalBudget: number) => {
  const { options, seats } = election.definition;
  const { ballots } = election;
  const budget = ballots.map(() => totalBudget / ballots.length);
  const winners: Array<string> = [];
  while (winners.length < seats) {
    let pick: string | undefined;
    let pickRho = Infinity;
    for (const c of options.filter((o) => !winners.includes(o))) {
      const shares = ballots.flatMap((b, i) => (b.selection.includes(c) ? [budget[i]] : [])).sort((a, b) => a - b);
      if (shares.reduce((a, b) => a + b, 0) < 1 - EPSILON) continue;
      let left = 1;
      let rho = Infinity;
      for (let j = 0; j < shares.length; j++) {
        if (shares[j] * (shares.length - j) >= left - EPSILON) {
          rho = left / (shares.length - j);
          break;
        }
        left -= shares[j];
      }
      if (rho < pickRho - EPSILON) [pick, pickRho] = [c, rho];
    }
    if (pick === undefined) break;
    ballots.forEach((b, i) => b.selection.includes(pick!) && (budget[i] -= Math.min(budget[i], pickRho)));
    winners.push(pick);
  }
  return winners;
};

// "Add1" completion: if the seats aren't filled, raise the total budget by 1 and rerun.
// ponytail: the rerun that first fills the seats is used as-is (capped at seats), and
// candidates nobody approves fill any remainder in option order
export const getElectionResults = (election: ApprovalCommitteeElection): MultiWinnerResult => {
  const { options, seats } = election.definition;
  const k = Math.min(seats, options.length);
  let winners: Array<string> = [];
  for (let extra = 0; extra <= election.ballots.length && winners.length < k; extra++) winners = run(election, seats + extra);
  const rest = options.filter((o) => !winners.includes(o)).slice(0, k - winners.length);
  return { result: "winners", winners: [...winners, ...rest] };
};
