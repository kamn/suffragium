// https://en.wikipedia.org/wiki/Contingent_vote (instant two-round system)
import { ElectionResult } from "../generic";
import { createDefinition, startElection, castWith, validRanked, Definition, Election, RankedBallot } from "./helpers";
import { firstChoices, best, toResult } from "./helpers";

export { createDefinition, startElection };
export const castBallot = castWith(validRanked);
export type ContingentElection = Election<Definition, RankedBallot>;

// Majority of first preferences wins outright; otherwise everyone but the top two
// is eliminated at once and the finalists face a runoff. Ties for second all advance.
export const getElectionResults = (election: ContingentElection): ElectionResult => {
  const { options } = election.definition;
  if (options.length < 2) return toResult(options);
  const first = firstChoices(options, election.ballots);
  const counts = Object.values(first).sort((a, b) => b - a);
  if (counts[0] > election.ballots.length / 2) return best(first);
  const finalists = options.filter((o) => first[o] >= counts[1]);
  return best(firstChoices(finalists, election.ballots));
};
