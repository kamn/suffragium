import { Result, ElectionResult } from "../generic";
import { dedup } from "./helpers";

// https://en.wikipedia.org/wiki/Bucklin_voting

export type BordaElectionDefinition = {
  options: Array<string>;
};

export type BordaBallot = {
  selection: Array<string>;
};

export type BordaElection = {
  definition: BordaElectionDefinition;
  ballots: Array<BordaBallot>;
};

export const createDefinition = (
  options: Array<string>
): BordaElectionDefinition => {
  return {
    options: dedup(options),
  };
};

export const startElection = (
  definition: BordaElectionDefinition
): BordaElection => {
  return {
    definition,
    ballots: [],
  };
};

const isValidBallot = (election: BordaElection, ballot: BordaBallot) => {
  return ballot.selection.reduce((r, x) => {
    return r && election.definition.options.includes(x);
  }, true);
};

export const castBallot = (
  election: BordaElection,
  ballot: BordaBallot
): Result<BordaElection> => {
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

const getSummarizedDefault = (election: BordaElection) => {
  return election.definition.options.reduce((r, option) => {
    r[option] = 0;
    return r;
  }, {});
};

const getMajority = (results: Record<string, number>, totalBallots: number) => {
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

const hasMajority = (results: Record<string, number>, totalBallots: number) => {
  const majorityWinner = getMajority(results, totalBallots);
  return majorityWinner ? true : false;
};


export const getElectionResults = (
  election: BordaElection
): ElectionResult => {
  const beginningResults = getSummarizedDefault(election);
  const totalOptions = election.definition.options.length;
  const results = election.ballots.reduce((results, ballot) => {
    ballot.selection.map((selection, index) => {
      results[selection] += (totalOptions - index)
    })
    return results
  }, beginningResults)
  const winners = getMajority(results, election.ballots.length);
  if(winners.length === 1) {
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
