import { Result, ElectionResult } from "../generic";
import { dedup } from "./helpers";

// https://en.wikipedia.org/wiki/STAR_voting

export type StarsElectionDefinition = {
  options: Array<string>;
};

export type StarsVote = {
  selection: string,
  score: number,
}

export type StarsBallot = {
  selection: Array<StarsVote>;
};

export type StarsElection = {
  definition: StarsElectionDefinition;
  ballots: Array<StarsBallot>;
};

export const createDefinition = (
  options: Array<string>
): StarsElectionDefinition => {
  return {
    options: dedup(options),
  };
};

export const startElection = (
  definition: StarsElectionDefinition
): StarsElection => {
  return {
    definition,
    ballots: [],
  };
};

const isValidBallot = (election: StarsElection, ballot: StarsBallot) => {
  return ballot.selection.reduce((r, x) => {
    return r && election.definition.options.includes(x.selection);
  }, true);
};

export const castBallot = (
  election: StarsElection,
  ballot: StarsBallot
): Result<StarsElection> => {
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

const getSummarizedDefault = (election: StarsElection) => {
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

const selectFrontRunners = () => {
  
  //TODO: What is there are more than two frontrunners(a 3 way tie or a tie for second)
  return []
}
export const getElectionResults = (
  election: StarsElection
): ElectionResult => {
  const beginningResults = getSummarizedDefault(election);
  const totalOptions = election.definition.options.length;
  const results = election.ballots.reduce((results, ballot) => {
    ballot.selection.map((vote, index) => {
      const selection = vote.selection
      results[selection] += vote.score
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
