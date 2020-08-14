// https://en.wikipedia.org/wiki/Approval_voting

import { Result, ElectionResult } from "../generic";
import { dedup } from "./helpers";

export type ApprovalElectionDefinition = {
  options: Array<string>;
};

export type ApprovalBallot = {
  selection: Array<string>;
};

export type ApprovalElection = {
  definition: ApprovalElectionDefinition;
  ballots: Array<ApprovalBallot>;
};

export const createDefinition = (
  options: Array<string>
): ApprovalElectionDefinition => {
  return {
    options: dedup(options),
  };
};

export const startElection = (
  definition: ApprovalElectionDefinition
): ApprovalElection => {
  return {
    definition,
    ballots: [],
  };
};

const isValidBallot = (election: ApprovalElection, ballot: ApprovalBallot) => {
  return ballot.selection.reduce((r, x) => {
    return r && election.definition.options.includes(x);
  }, true);
};

export const castBallot = (
  election: ApprovalElection,
  ballot: ApprovalBallot
): Result<ApprovalElection> => {
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

const getSummarizedDefault = (election: ApprovalElection) => {
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

export const getElectionResults = (
  election: ApprovalElection
): ElectionResult => {
  const beginningResults = getSummarizedDefault(election);
  const results = election.ballots.reduce((results, ballot) => {
    ballot.selection.map((selection) => {
      results[selection] += 1
    })
    return results
  }, beginningResults)
  const winners = getMajority(results);
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