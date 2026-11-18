// https://en.wikipedia.org/wiki/Huntington%E2%80%93Hill_method
import { SeatResult } from "../generic";
import { dedup, startElection as start, castWith, validSingle, zeroes, allocateSeats, SeatsDefinition, Election, SingleBallot } from "./helpers";

export type PartyListElection = Election<SeatsDefinition, SingleBallot>;
export const startElection = (definition: SeatsDefinition): PartyListElection => start<SeatsDefinition, SingleBallot>(definition);
// Options are parties; each ballot names one party.
export const createDefinition = (parties: Array<string>, seats: number): SeatsDefinition => ({ options: dedup(parties), seats });
export const castBallot = castWith<SeatsDefinition, SingleBallot>(validSingle);

// Highest averages with divisor sqrt(s(s+1)): any party with votes gets a first seat before anyone gets a second.
export const getElectionResults = (election: PartyListElection): SeatResult => {
  const votes = zeroes(election.definition.options);
  for (const b of election.ballots) votes[b.selection]++;
  return { result: "seats", seats: allocateSeats(votes, election.definition.seats, (s) => Math.sqrt(s * (s + 1))) };
};
