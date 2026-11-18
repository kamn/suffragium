type SuccessResult<T> = {
  result: "success";
  data: T;
};

type FailureResult = {
  result: "failure";
};
export type Result<T> = SuccessResult<T> | FailureResult;

type ElectionNoWinnerResult = {
  result: "nowinner";
};

type ElectionWinnerResult = {
  result: "winner";
  winner: string;
};

type ElectionTieResult = {
  result: "tie";
  ties: Array<string>;
};

export type ElectionResult =
  | ElectionNoWinnerResult
  | ElectionWinnerResult
  | ElectionTieResult;

// Multi-winner systems: elected candidates in the order they were elected.
export type MultiWinnerResult = {
  result: "winners";
  winners: Array<string>;
};

// Party-list systems: seats won per party.
export type SeatResult = {
  result: "seats";
  seats: Record<string, number>;
};
