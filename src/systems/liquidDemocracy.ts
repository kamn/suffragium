// https://en.wikipedia.org/wiki/Liquid_democracy
import { ElectionResult, Result } from "../generic";
import { createDefinition, startElection as start, zeroes, best, Definition, Election } from "./helpers";

// Either vote directly (selection) or hand your vote to another voter (delegate).
export type LiquidBallot = { voter: string; selection?: string; delegate?: string };
export type LiquidElection = Election<Definition, LiquidBallot>;
export { createDefinition };
export const startElection = (definition: Definition): LiquidElection => start<Definition, LiquidBallot>(definition);

export const castBallot = (election: LiquidElection, ballot: LiquidBallot): Result<LiquidElection> => {
  const direct = ballot.selection !== undefined && ballot.delegate === undefined && election.definition.options.includes(ballot.selection);
  const delegated = ballot.selection === undefined && ballot.delegate !== undefined && ballot.delegate !== ballot.voter;
  const fresh = !election.ballots.some((b) => b.voter === ballot.voter);
  return fresh && (direct || delegated)
    ? { result: "success", data: { ...election, ballots: [...election.ballots, ballot] } }
    : { result: "failure" };
};

// Follow each delegation chain to a direct vote; chains that loop or end at a non-voter are lost.
// The resolved votes are counted first-past-the-post.
export const getElectionResults = (election: LiquidElection): ElectionResult => {
  const byVoter = new Map(election.ballots.map((b) => [b.voter, b]));
  const totals = zeroes(election.definition.options);
  for (const b of election.ballots) {
    const seen = new Set<string>();
    let at: LiquidBallot | undefined = b;
    while (at && at.selection === undefined && !seen.has(at.voter)) {
      seen.add(at.voter);
      at = byVoter.get(at.delegate!);
    }
    if (at?.selection !== undefined) totals[at.selection]++;
  }
  return best(totals);
};
