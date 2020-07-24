import { Result, ElectionResult } from "../generic";
import { dedup } from "./helpers";

// https://en.wikipedia.org/wiki/Bucklin_voting

export type BucklinElectionDefinition = {
  options: Array<string>;
};

export type BucklinBallot = {
  selection: Array<string>;
};

export type BucklinElection = {
  definition: BucklinElectionDefinition;
  ballots: Array<BucklinBallot>;
};

export const createDefinition = (
  options: Array<string>
): BucklinElectionDefinition => {
  return {
    options: dedup(options),
  };
};

export const startElection = (
  definition: BucklinElectionDefinition
): BucklinElection => {
  return {
    definition,
    ballots: [],
  };
};

const isValidBallot = (election: BucklinElection, ballot: BucklinBallot) => {
  return ballot.selection.reduce((r, x) => {
    return r && election.definition.options.includes(x);
  }, true);
};

export const castBallot = (
  election: BucklinElection,
  ballot: BucklinBallot
): Result<BucklinElection> => {
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

const getSummarizedDefault = (election: BucklinElection) => {
  return election.definition.options.reduce((r, option) => {
    r[option] = 0;
    return r;
  }, {});
};

const getMajority = (results: any, totalBallots: number) => {
  const sorted = Object.entries(results).sort((a, b) => {
    // @ts-ignore
    return b[1] - a[1];
  });
  const topSorted = sorted[0];
  const selection = topSorted[0];
  const topCountedVotes = topSorted[1];
  if (totalBallots / 2 < topCountedVotes) {
    return selection;
  }
  return undefined;
};

const hasMajority = (results: any, totalBallots: number) => {
  const majorityWinner = getMajority(results, totalBallots);
  return majorityWinner ? true : false;
};

const noMoreRounds = (election: BucklinElection, round: number) => {
  return round >= election.definition.options.length;
};

const getIndexOrDefault = (xs: Array<any>, i: number, otherwise: any) => {
  if (i < xs.length) {
    return xs[i];
  } else {
    return otherwise;
  }
};

const getElectionResultsRecur = (
  election: BucklinElection,
  round: number,
  totalBallots: number,
  results: any
): ElectionResult => {
  if (noMoreRounds(election, round)) {
    return {
      result: "nowinner",
    };
  }

  const newResults = election.ballots.reduce((r, ballot) => {
    const vote = getIndexOrDefault(ballot.selection, round, undefined);
    if (vote) {
      r[vote] = r[vote] + 1;
    }
    return r;
  }, results);

  if (hasMajority(newResults, totalBallots)) {
    const majorityWinner = getMajority(newResults, totalBallots);
    return {
      result: "winner",
      winner: majorityWinner,
    };
  } else {
    return getElectionResultsRecur(
      election,
      round + 1,
      totalBallots,
      newResults
    );
  }
};

export const getElectionResults = (
  election: BucklinElection
): ElectionResult => {
  const beginningResults = getSummarizedDefault(election);
  const startRound = 0;
  const totalBallots = election.ballots.length;
  return getElectionResultsRecur(
    election,
    startRound,
    totalBallots,
    beginningResults
  );
};
