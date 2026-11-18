// https://en.wikipedia.org/wiki/Graduated_majority_judgment
import { ElectionResult } from "../generic";
import { createDefinition, startElection as start, castWith, validScores, scoreOf, best, Definition, Election, ScoreBallot } from "./helpers";

export { createDefinition };
export type GraduatedMajorityJudgmentElection = Election<Definition, ScoreBallot>;
export const startElection = (definition: Definition): GraduatedMajorityJudgmentElection =>
  start<Definition, ScoreBallot>(definition);
// Grades are numbers, higher is better. An option a ballot leaves out gets grade 0.
export const castBallot = castWith((d: Definition, b: ScoreBallot) => validScores(d, b));

// score = median + (above - below) / (2 (1 - above - below)), where above/below are the shares
// of grades strictly above/below the median. Highest score wins.
export const gmjScore = (grades: Array<number>) => {
  const g = [...grades].sort((a, b) => a - b);
  if (g.length === 0) return 0;
  const mid = g.length / 2;
  const median = g.length % 2 ? g[Math.floor(mid)] : (g[mid - 1] + g[mid]) / 2;
  const above = g.filter((x) => x > median).length / g.length;
  const below = g.filter((x) => x < median).length / g.length;
  // ponytail: when every grade sits off a between-grades median, the formula is 0/0; use the median
  return above + below >= 1 ? median : median + (above - below) / (2 * (1 - above - below));
};

export const getElectionResults = (election: GraduatedMajorityJudgmentElection): ElectionResult =>
  best(
    Object.fromEntries(
      election.definition.options.map((o) => [o, gmjScore(election.ballots.map((b) => scoreOf(b, o)))])
    )
  );
