// https://en.wikipedia.org/wiki/Single_transferable_vote
import { MultiWinnerResult } from "../generic";
import { dedup, startElection, castWith, validRanked, zeroes, topK, SeatsDefinition, Election, RankedBallot } from "./helpers";

export { startElection };
export type StvElection = Election<SeatsDefinition, RankedBallot>;
export const createDefinition = (options: Array<string>, seats: number): SeatsDefinition => ({ options: dedup(options), seats });
export const castBallot = castWith<SeatsDefinition, RankedBallot>(validRanked);

// Droop quota. Each round the top candidate at/over quota is elected and the surplus moves on
// (every ballot that elected them keeps surplus/total of its weight); otherwise the lowest is eliminated.
// ponytail: simple fractional transfer, not Meek/Warren; elimination ties go to option order
export const getElectionResults = (election: StvElection): MultiWinnerResult => {
  const { ballots } = election;
  const { seats } = election.definition;
  const quota = Math.floor(ballots.length / (seats + 1)) + 1;
  const weights = ballots.map(() => 1);
  const elected: Array<string> = [];
  let hopeful = election.definition.options;
  while (elected.length < seats && hopeful.length > 0) {
    if (hopeful.length <= seats - elected.length) {
      elected.push(...hopeful);
      break;
    }
    const tops = ballots.map((b) => b.selection.find((x) => hopeful.includes(x)));
    const tally = zeroes(hopeful);
    tops.forEach((t, i) => t !== undefined && (tally[t] += weights[i]));
    const [leader] = topK(tally, 1);
    if (tally[leader] >= quota) {
      const keep = (tally[leader] - quota) / tally[leader];
      tops.forEach((t, i) => t === leader && (weights[i] *= keep));
      elected.push(leader);
      hopeful = hopeful.filter((o) => o !== leader);
    } else {
      const [loser] = topK(Object.fromEntries(hopeful.map((o) => [o, -tally[o]])), 1);
      hopeful = hopeful.filter((o) => o !== loser);
    }
  }
  return { result: "winners", winners: elected };
};
