// https://en.wikipedia.org/wiki/Largest_remainders_method
import { SeatResult } from "../generic";
import { dedup, startElection as start, castWith, validSingle, zeroes, topK, SeatsDefinition, Election, SingleBallot } from "./helpers";

const quotas = {
  hare: (votes: number, seats: number) => votes / seats,
  droop: (votes: number, seats: number) => Math.floor(votes / (seats + 1)) + 1,
  hagenbachBischoff: (votes: number, seats: number) => votes / (seats + 1),
  imperiali: (votes: number, seats: number) => votes / (seats + 2),
};

export type LargestRemainderDefinition = SeatsDefinition & { quota: keyof typeof quotas };
export type LargestRemainderElection = Election<LargestRemainderDefinition, SingleBallot>;
// Options are parties; each ballot names one party.
export const createDefinition = (
  parties: Array<string>,
  seats: number,
  quota: keyof typeof quotas = "hare"
): LargestRemainderDefinition => ({ options: dedup(parties), seats, quota });
export const startElection = (definition: LargestRemainderDefinition): LargestRemainderElection =>
  start<LargestRemainderDefinition, SingleBallot>(definition);
export const castBallot = castWith<LargestRemainderDefinition, SingleBallot>(validSingle);

// Each party gets floor(votes / quota) seats; leftover seats go to the largest remainders.
export const getElectionResults = (election: LargestRemainderElection): SeatResult => {
  const { options, seats, quota } = election.definition;
  const votes = zeroes(options);
  for (const b of election.ballots) votes[b.selection]++;
  const total = election.ballots.length;
  if (total === 0) return { result: "seats", seats: zeroes(options) };
  const q = quotas[quota](total, seats);
  const won = Object.fromEntries(options.map((p) => [p, Math.floor(votes[p] / q)]));
  const remainders = Object.fromEntries(options.map((p) => [p, votes[p] / q - won[p]]));
  const left = seats - Object.values(won).reduce((a, b) => a + b, 0);
  if (left >= 0) for (const p of topK(remainders, left)) won[p]++;
  // Small quotas (Imperiali) can hand out too many seats; take them back from the smallest remainders.
  else for (const p of topK(Object.fromEntries(options.filter((p) => won[p] > 0).map((p) => [p, -remainders[p]])), -left)) won[p]--;
  return { result: "seats", seats: won };
};
