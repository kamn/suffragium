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
