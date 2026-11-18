// https://en.wikipedia.org/wiki/Quota_Borda_system
import { MultiWinnerResult } from "../generic";
import { dedup, startElection, castWith, validRanked, zeroes, topK, SeatsDefinition, Election, RankedBallot } from "./helpers";

export { startElection };
export type RankedCommitteeElection = Election<SeatsDefinition, RankedBallot>;
export const createDefinition = (options: Array<string>, seats: number): SeatsDefinition => ({ options: dedup(options), seats });
export const castBallot = castWith<SeatsDefinition, RankedBallot>(validRanked);
import { bordaScores } from "./helpers";

// Droop quota. For r = 1, 2, ...: voters whose top r choices are the same set S form a solid
// coalition; each full quota of them guarantees one seat (up to r) from S, filled by Borda score.
// Seats still empty go to the highest Borda scores.
// ponytail: coalitions are checked in rank order, not Dummett's full mutual-majority bookkeeping
export const getElectionResults = (election: RankedCommitteeElection): MultiWinnerResult => {
  const { options, seats } = election.definition;
  const { ballots } = election;
  const k = Math.min(seats, options.length);
  const quota = Math.floor(ballots.length / (seats + 1)) + 1;
  const borda = bordaScores(options, ballots);
  const byBorda = (xs: Array<string>) => [...xs].sort((a, b) => borda[b] - borda[a]);
  const winners: Array<string> = [];
  for (let r = 1; r <= k && winners.length < k; r++) {
    const coalitions = new Map<string, number>();
    for (const b of ballots) {
      if (b.selection.length === 0) continue;
      const key = JSON.stringify([...b.selection.slice(0, r)].sort());
      coalitions.set(key, (coalitions.get(key) ?? 0) + 1);
    }
    for (const [key, count] of coalitions) {
      const group: Array<string> = JSON.parse(key);
      const owed = Math.min(group.length, Math.floor(count / quota)) - group.filter((x) => winners.includes(x)).length;
      for (const x of byBorda(group.filter((x) => !winners.includes(x))).slice(0, Math.max(0, owed))) {
        if (winners.length < k) winners.push(x);
      }
    }
  }
  return { result: "winners", winners: [...winners, ...byBorda(options.filter((o) => !winners.includes(o))).slice(0, k - winners.length)] };
};
