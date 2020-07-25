import { Result, ElectionResult } from "../generic";
import { dedup } from "./helpers";

// https://en.wikipedia.org/wiki/Copeland%27s_method

export type CopelandElectionDefinition = {
  options: Array<string>;
};

export type CopelandBallot = {
  selection: Array<string>;
};

export type CopelandElection = {
  definition: CopelandElectionDefinition;
  ballots: Array<CopelandBallot>;
};

export const createDefinition = (
  options: Array<string>
): CopelandElectionDefinition => {
  return {
    options: dedup(options),
  };
};

export const startElection = (
  definition: CopelandElectionDefinition
): CopelandElection => {
  return {
    definition,
    ballots: [],
  };
};

const isValidBallot = (election: CopelandElection, ballot: CopelandBallot) => {
  return ballot.selection.reduce((r, x) => {
    return r && election.definition.options.includes(x);
  }, true);
};

export const castBallot = (
  election: CopelandElection,
  ballot: CopelandBallot
): Result<CopelandElection> => {
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

const getSummarizedDefault = (election: CopelandElection) => {
  return election.definition.options.reduce((r, option) => {
    r[option] = 0;
    return r;
  }, {});
};

export const getAllOptionPairs = (
  options: Array<string>
): Array<[string, string]> => {
  const pairs = [];
  for (let i = 0; i < options.length; i++) {
    for (let y = i + 1; y < options.length; y++) {
      const firstOption = options[i];
      const secondOption = options[y];
      pairs.push([firstOption, secondOption]);
    }
  }
  return pairs;
};

const comparePair = (
  election: CopelandElection,
  pair: [string, string]
): string => {
  let emptyComparision = {};
  emptyComparision[pair[0]] = 0;
  emptyComparision[pair[1]] = 0;
  emptyComparision = election.ballots.reduce((r, x) => {
    const firstPairIndex = x.selection.indexOf(pair[0]);
    const secondPairIndex = x.selection.indexOf(pair[1]);
    if (firstPairIndex < secondPairIndex && firstPairIndex !== -1) {
      r[pair[0]] = r[pair[0]] + 1;
    } else if (firstPairIndex > secondPairIndex && secondPairIndex !== -1) {
      r[pair[1]] = r[pair[1]] + 1;
    }
    return r;
  }, emptyComparision);
  if (emptyComparision[pair[0]] > emptyComparision[pair[1]]) {
    return pair[0];
  } else if (emptyComparision[pair[0]] < emptyComparision[pair[1]]) {
    return pair[1];
  } else {
    // TODO: What to do in case of a tie?
    return "";
  }
};

const getWinners = (results: Record<string, number>): Array<string> => {
  const sorted = Object.entries(results).sort((a, b) => {
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
  election: CopelandElection
): ElectionResult => {
  const beginningResults = getSummarizedDefault(election);
  const allPairs = getAllOptionPairs(election.definition.options);
  const result = allPairs.reduce((r, x) => {
    const firstPairVal = x[0];
    const secondPairVal = x[1];
    const compResult = comparePair(election, x);
    if (compResult === firstPairVal) {
      r[firstPairVal] = r[firstPairVal] + 1;
    } else if (compResult === secondPairVal) {
      r[secondPairVal] = r[secondPairVal] + 1;
    } else {
      // TODO: What about this case?
    }
    return r;
  }, beginningResults);

  const winners = getWinners(result);
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
