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

// Probabilistic systems: chance each option is chosen (sums to 1).
export type LotteryResult = {
  result: "lottery";
  probabilities: Record<string, number>;
};

// Biproportional apportionment: seats per region per party.
export type RegionSeatResult = {
  result: "seats-by-region";
  seats: Record<string, Record<string, number>>;
};

// Mixed systems: who won each district plus total seats per party.
export type MixedResult = {
  result: "mixed";
  districtWinners: Record<string, string>;
  seats: Record<string, number>;
};
