// https://en.wikipedia.org/wiki/D%27Hondt_method
import { SeatResult } from "../generic";
import { dedup, startElection as start, castWith, validSingle, zeroes, allocateSeats, SeatsDefinition, Election, SingleBallot } from "./helpers";

export type PartyListElection = Election<SeatsDefinition, SingleBallot>;
export const startElection = (definition: SeatsDefinition): PartyListElection => start<SeatsDefinition, SingleBallot>(definition);
// Options are parties; each ballot names one party.
export const createDefinition = (parties: Array<string>, seats: number): SeatsDefinition => ({ options: dedup(parties), seats });
export const castBallot = castWith<SeatsDefinition, SingleBallot>(validSingle);

// Highest averages, D'Hondt (divisors 1, 2, 3, ...).
export const getElectionResults = (election: PartyListElection): SeatResult => {
  const votes = zeroes(election.definition.options);
  for (const b of election.ballots) votes[b.selection]++;
  return { result: "seats", seats: allocateSeats(votes, election.definition.seats, (s) => s + 1) };
};
