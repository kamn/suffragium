// https://en.wikipedia.org/wiki/Random_ballot (multi-winner variant)
import { MultiWinnerResult } from "../generic";
import { Random, MersenneTwister19937 } from "random-js";
import { dedup, startElection as start, castWith, validSingle, SeatsDefinition, Election, SingleBallot } from "./helpers";

export type MultipleRandomBallotsDefinition = SeatsDefinition & { seed: number };
export type MultipleRandomBallotsElection = Election<MultipleRandomBallotsDefinition, SingleBallot>;
export const createDefinition = (seed: number, options: Array<string>, seats: number): MultipleRandomBallotsDefinition => ({
  options: dedup(options),
  seats,
  seed,
});
export const startElection = (definition: MultipleRandomBallotsDefinition): MultipleRandomBallotsElection =>
  start<MultipleRandomBallotsDefinition, SingleBallot>(definition);
export const castBallot = castWith<MultipleRandomBallotsDefinition, SingleBallot>(validSingle);

// Draw ballots at random until `seats` different options have been picked (or no ballots for others remain).
export const getElectionResults = (election: MultipleRandomBallotsElection): MultiWinnerResult => {
  const random = new Random(MersenneTwister19937.seed(election.definition.seed));
  const winners: Array<string> = [];
  while (winners.length < election.definition.seats) {
    const left = election.ballots.filter((b) => !winners.includes(b.selection));
    if (left.length === 0) break;
    winners.push(random.pick(left).selection);
  }
  return { result: "winners", winners };
};
