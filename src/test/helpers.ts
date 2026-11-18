import { Result } from "../generic";

export const addBallotIgnoreError = <T1, T2>(
  election: T1,
  ballot: T2,
  castBallot: (election: T1, ballot: T2) => Result<T1>
): T1 => {
  const result = castBallot(election, ballot);
  if (result.result === "failure") {
    return election;
  } else {
    return result.data;
  }
};

export const repeatBallot = <T1, T2>(
  election: T1,
  ballot: T2,
  count: number,
  castBallot: (election: T1, ballot: T2) => Result<T1>
) => {
  for (let i = 0; i < count; i++) {
    election = addBallotIgnoreError(election, ballot, castBallot);
  }
  return election;
};

// Build an election from [ballot, count] pairs and count it. Throws on an invalid ballot.
export const run = <D, E, B, R>(
  system: {
    startElection: (d: D) => E;
    castBallot: (e: E, b: B) => Result<E>;
    getElectionResults: (e: E) => R;
  },
  definition: D,
  ballots: Array<[B, number]>
): R => {
  let election = system.startElection(definition);
  for (const [ballot, count] of ballots) {
    for (let i = 0; i < count; i++) {
      const r = system.castBallot(election, ballot);
      if (r.result === "failure") throw new Error(`invalid ballot ${JSON.stringify(ballot)}`);
      election = r.data;
    }
  }
  return system.getElectionResults(election);
};

// https://en.wikipedia.org/wiki/Condorcet_method#Example:_Voting_on_the_location_of_Tennessee's_capital
export const tennessee: Array<[{ selection: Array<string> }, number]> = [
  [{ selection: ["Memphis", "Nashville", "Chattanooga", "Knoxville"] }, 42],
  [{ selection: ["Nashville", "Chattanooga", "Knoxville", "Memphis"] }, 26],
  [{ selection: ["Chattanooga", "Knoxville", "Nashville", "Memphis"] }, 15],
  [{ selection: ["Knoxville", "Chattanooga", "Nashville", "Memphis"] }, 17],
];
export const tennesseeCities = ["Memphis", "Nashville", "Chattanooga", "Knoxville"];
