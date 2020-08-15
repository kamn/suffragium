// https://en.wikipedia.org/wiki/Approval_voting

import { Result, ElectionResult } from "../generic";
import { dedup } from "./helpers";
import { string } from "random-js";

export type IrvElectionDefinition = {
  options: Array<string>;
};

export type IrvBallot = {
  selection: Array<string>;
};

export type IrvElection = {
  definition: IrvElectionDefinition;
  ballots: Array<IrvBallot>;
};

export const createDefinition = (
  options: Array<string>
): IrvElectionDefinition => {
  return {
    options: dedup(options),
  };
};

export const startElection = (
  definition: IrvElectionDefinition
): IrvElection => {
  return {
    definition,
    ballots: [],
  };
};

const isValidBallot = (election: IrvElection, ballot: IrvBallot) => {
  return ballot.selection.reduce((r, x) => {
    return r && election.definition.options.includes(x);
  }, true);
};

export const castBallot = (
  election: IrvElection,
  ballot: IrvBallot
): Result<IrvElection> => {
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

const getSummarizedDefault = (election: IrvElection) => {
  return election.definition.options.reduce((r, option) => {
    r[option] = 0;
    return r;
  }, {});
};

const getMajority = (results: Record<string, number>) => {
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

const hasMajority = (results: Record<string, number>, total: number) => {
  const sorted = Object.entries(results).sort((a, b) => {
    return b[1] - a[1];
  });
  return (sorted[0][1] > (total/2))
}

const getLowestSelections = (results: Record<string, number>) => {
  let lowestSelections = []
  const sorted = Object.entries(results).sort((a, b) => {
    return b[1] - a[1];
  }).reverse()
  lowestSelections.push(sorted[0][0])
  for(let i = 1; i < sorted.length; i++) {
    if(sorted[i][1] === sorted[0][1]) {
      lowestSelections.push(sorted[i][0]) 
    }
  }
  return lowestSelections
}

const getElectionResultsRecursive = (election: IrvElection, excluded: Array<string>) => {

  if (excluded.length === election.definition.options.length) {
    return {
      result: "nowinner"
    }
  }

  const beginningResults = getSummarizedDefault(election);
  excluded.map(x => {
    delete beginningResults[x]
  })
  const results = election.ballots.reduce((results, ballot) => {
    const includedWinners = ballot.selection.filter(x => !excluded.includes(x))
    const topIncluded = includedWinners[0]
    if(topIncluded !== undefined) {
      results[topIncluded] += 1
    } 
    return results
  }, beginningResults)
  if(hasMajority(results, election.ballots.length)) {
    const winners = getMajority(results);
    if(winners.length === 1) {
      return {
        result: "winner",
        winner: winners[0],
      };
    } else {
      //NOTE: I am not sure a tie is possible
      return {
        result: "tie",
        ties: winners,
      };
    }
  } else {
    const lowestSelections = getLowestSelections(results);
    return getElectionResultsRecursive(election, [...excluded, ...lowestSelections])
  }
}

export const getElectionResults = (
  election: IrvElection
): ElectionResult => {
  return getElectionResultsRecursive(election, [])
};