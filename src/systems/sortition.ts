import { ElectionResult, MultiWinnerResult } from "../generic";
import { Random, MersenneTwister19937 } from "random-js";
import { dedup } from "./helpers";

type SortitionElectionDefinition = {
  options: Array<string>;
  seed: number;
};

type FirstPastThePostElection = {
  definition: SortitionElectionDefinition;
};

export const createBasicDefinition = (
  seed: number,
  options: Array<string>
): SortitionElectionDefinition => {
  return {
    options: dedup(options),
    seed,
  };
};

export const startElection = (
  definition: SortitionElectionDefinition
): FirstPastThePostElection => {
  return {
    definition,
  };
};

export const getElectionResults = (
  election: FirstPastThePostElection
): ElectionResult => {
  const random = new Random(
    MersenneTwister19937.seed(election.definition.seed)
  );
  const option = random.pick(election.definition.options);

  return {
    result: "winner",
    winner: option,
  };
};

// Multi-winner sortition: draw `seats` options at random.
export const getCommitteeResults = (election: FirstPastThePostElection, seats: number): MultiWinnerResult => {
  const random = new Random(MersenneTwister19937.seed(election.definition.seed));
  const { options } = election.definition;
  return { result: "winners", winners: random.sample(options, Math.min(seats, options.length)) };
};
