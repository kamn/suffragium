import { Result, ElectionResult } from "../generic";
import { Random, MersenneTwister19937 } from "random-js";
import { dedup } from "./helpers";

type RandomBallotElectionDefinition = {
  options: Array<string>;
  seed: number;
};

type RandomBallotElection = {
  definition: RandomBallotElectionDefinition;
  ballots: Array<RandomBallot>;
};

export type RandomBallot = {
  selection: string;
};


export const createDefinition = (
  seed: number,
  options: Array<string>
): RandomBallotElectionDefinition => {
  return {
    options: dedup(options),
    seed,
  };
};

export const startElection = (
  definition: RandomBallotElectionDefinition
): RandomBallotElection => {
  return {
    definition,
    ballots: []
  };
};

const isValidBallot = (election: RandomBallotElection, ballot: RandomBallot) => {
  return election.definition.options.includes(ballot.selection);
};

export const castBallot = (
  election: RandomBallotElection,
  ballot: RandomBallot
): Result<RandomBallotElection> => {
  if (isValidBallot(election, ballot)) {
    return {
      result: "success",
      data: { ...election, ballots: election.ballots.concat([ballot]) },
    };
  } else {
    return {
      result: "failure",
    };
  }
};

export const getElectionResults = (
  election: RandomBallotElection
): ElectionResult => {
  const random = new Random(
    MersenneTwister19937.seed(election.definition.seed)
  );
  const option = random.pick(election.ballots).selection;

  return {
    result: "winner",
    winner: option,
  };
};
