import { Result, ElectionResult } from "../generic";
import { dedup, zeroes, scoreOf, best, toResult } from "./helpers";

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

// Scoring round picks the two highest totals; the automatic runoff goes to whichever
// finalist more voters scored higher. A runoff tie goes to the higher total.
export const getElectionResults = (election: StarsElection): ElectionResult => {
  const { options } = election.definition;
  const totals = zeroes(options);
  for (const b of election.ballots) for (const v of b.selection) totals[v.selection] += v.score;
  if (options.length < 2) return toResult(options);
  const ranked = [...options].sort((a, b) => totals[b] - totals[a]);
  const cut = totals[ranked[1]];
  const finalists = options.filter((o) => totals[o] >= cut);
  // ponytail: a 3+-way tie for the finals is reported as a tie, no official tiebreaker rounds
  if (finalists.length > 2) return toResult(finalists);
  const [a, b] = finalists;
  const runoff = { [a]: 0, [b]: 0 };
  for (const ballot of election.ballots) {
    const diff = scoreOf(ballot, a) - scoreOf(ballot, b);
    if (diff > 0) runoff[a]++;
    if (diff < 0) runoff[b]++;
  }
  return runoff[a] === runoff[b] ? best({ [a]: totals[a], [b]: totals[b] }) : best(runoff);
};
