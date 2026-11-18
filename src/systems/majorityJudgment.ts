// https://en.wikipedia.org/wiki/Majority_judgment
import { ElectionResult } from "../generic";
import { createDefinition, startElection as start, castWith, validScores, scoreOf, toResult, Definition, Election, ScoreBallot } from "./helpers";

export { createDefinition };
export type MajorityJudgmentElection = Election<Definition, ScoreBallot>;
export const startElection = (definition: Definition): MajorityJudgmentElection => start<Definition, ScoreBallot>(definition);
// Grades are numbers, higher is better. An option a ballot leaves out gets grade 0.
export const castBallot = castWith((d: Definition, b: ScoreBallot) => validScores(d, b));

// Medians in removal order: take the lower median, remove it, repeat. Comparing these
// sequences is the standard majority judgment tie-break.
const medians = (grades: Array<number>) => {
  const g = [...grades].sort((a, b) => a - b);
  const out: Array<number> = [];
  while (g.length) out.push(g.splice(Math.floor((g.length - 1) / 2), 1)[0]);
  return out;
};

const compare = (a: Array<number>, b: Array<number>) => {
  const i = a.findIndex((x, j) => x !== b[j]);
  return i === -1 ? 0 : a[i] - b[i];
};

export const getElectionResults = (election: MajorityJudgmentElection): ElectionResult => {
  const { options } = election.definition;
  const seq = Object.fromEntries(options.map((o) => [o, medians(election.ballots.map((b) => scoreOf(b, o)))]));
  const top = options.reduce<Array<string>>((acc, o) => {
    if (acc.length === 0) return [o];
    const c = compare(seq[o], seq[acc[0]]);
    return c > 0 ? [o] : c === 0 ? [...acc, o] : acc;
  }, []);
  return toResult(top);
};
