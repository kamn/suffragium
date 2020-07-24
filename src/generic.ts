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
