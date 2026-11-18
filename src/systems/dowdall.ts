// https://en.wikipedia.org/wiki/Borda_count#Dowdall_system_(Nauru)
import { ElectionResult } from "../generic";
import { createDefinition, startElection, castWith, validRanked, Definition, Election, RankedBallot } from "./helpers";
import { zeroes, best } from "./helpers";

export { createDefinition, startElection };
export const castBallot = castWith(validRanked);
export type DowdallElection = Election<Definition, RankedBallot>;

// 1 point for first, 1/2 for second, 1/3 for third, ...
export const getElectionResults = (election: DowdallElection): ElectionResult => {
  const scores = zeroes(election.definition.options);
  for (const b of election.ballots) b.selection.forEach((x, i) => (scores[x] += 1 / (i + 1)));
  return best(scores);
};
