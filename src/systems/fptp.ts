import { Result, ElectionResult } from "../generic";
import { dedup } from "./helpers";

type FirstPastThePostElectionDefinition = {
  options: Array<string>;
};

type FirstPastThePostBallot = {
  selection: string;
};

type FirstPastThePostElection = {
  definition: FirstPastThePostElectionDefinition;
  ballots: Array<FirstPastThePostBallot>;
};

export const createDefinition = (
  options: Array<string>
): FirstPastThePostElectionDefinition => {
  return {
    options: dedup(options),
  };
};

export const startElection = (
  definition: FirstPastThePostElectionDefinition
): FirstPastThePostElection => {
  return {
    definition,
    ballots: [],
  };
};

const isValidBallot = (
  election: FirstPastThePostElection,
  ballot: FirstPastThePostBallot
) => {
  return election.definition.options.includes(ballot.selection);
};

export const castBallot = (
  election: FirstPastThePostElection,
  ballot: FirstPastThePostBallot
): Result<FirstPastThePostElection> => {
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

const getSummarizedDefault = (election: FirstPastThePostElection) => {
  return election.definition.options.reduce((r, option) => {
    r[option] = 0;
    return r;
  }, {});
};

const getWinners = (results: any): Array<string> => {
  const sorted = Object.entries(results).sort((a, b) => {
    // @ts-ignore
    return b[1] - a[1];
  });

  return sorted
    .reduce((r, x) => {
      if (r.length === 0) {
        return r.concat([x]);
      } else {
        const first = r[0];
        if (x[1] === first[1]) {
          return r.concat([x]);
        }
        return r;
      }
    }, [])
    .map((x) => x[0]);
};
export const getElectionResults = (
  election: FirstPastThePostElection
): ElectionResult => {
  const beginningResults = getSummarizedDefault(election);

  const results = election.ballots.reduce((r, ballot) => {
    const vote = ballot.selection;
    r[vote] = r[vote] + 1;
    return r;
  }, beginningResults);

  const winners = getWinners(results);

  if (winners.length === 1) {
    return {
      result: "winner",
      winner: winners[0],
    };
  } else {
    return {
      result: "tie",
      ties: winners,
    };
  }
};
