// https://en.wikipedia.org/wiki/Combined_approval_voting
import { ElectionResult } from "../generic";
import { createDefinition, startElection as start, castWith, validRanked, zeroes, best, Definition, Election, ScoreBallot } from "./helpers";

export { createDefinition };
export type CombinedApprovalElection = Election<Definition, ScoreBallot>;
export const startElection = (definition: Definition): CombinedApprovalElection => start<Definition, ScoreBallot>(definition);
// Each option gets +1 (for), 0 (abstain) or -1 (against).
export const castBallot = castWith(
  (d: Definition, b: ScoreBallot) =>
    validRanked(d, { selection: b.selection.map((v) => v.selection) }) && b.selection.every((v) => [-1, 0, 1].includes(v.score))
);

export const getElectionResults = (election: CombinedApprovalElection): ElectionResult => {
  const totals = zeroes(election.definition.options);
  for (const b of election.ballots) for (const v of b.selection) totals[v.selection] += v.score;
  return best(totals);
};
