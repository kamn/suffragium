// https://en.wikipedia.org/wiki/Maximal_lotteries
import { LotteryResult } from "../generic";
import { createDefinition, startElection, castWith, validRanked, pairwise, combinations, Definition, Election, RankedBallot } from "./helpers";

export { createDefinition, startElection };
export const castBallot = castWith(validRanked);
export type MaximalLotteriesElection = Election<Definition, RankedBallot>;

const EPSILON = 1e-9;

// Solve rows·x = rhs by Gaussian elimination. Undefined if inconsistent or not unique.
const solve = (rows: Array<Array<number>>, rhs: Array<number>): Array<number> | undefined => {
  const m = rows.map((r, i) => [...r, rhs[i]]);
  const n = rows[0].length;
  for (let col = 0, row = 0; col < n; col++, row++) {
    const pivot = m.slice(row).reduce((p, r, i) => (Math.abs(r[col]) > Math.abs(m[p][col]) ? row + i : p), row);
    if (Math.abs(m[pivot][col]) < EPSILON) return undefined;
    [m[row], m[pivot]] = [m[pivot], m[row]];
    for (let r = 0; r < m.length; r++) {
      if (r === row) continue;
      const f = m[r][col] / m[row][col];
      for (let c = col; c <= n; c++) m[r][c] -= f * m[row][c];
    }
  }
  if (m.slice(n).some((r) => Math.abs(r[n]) > 1e-7)) return undefined;
  return m.slice(0, n).map((r, i) => r[n] / r[i]);
};

// The lottery p over options that no other option beats in expectation: for every y,
// sum_x p[x] * margin(x, y) >= 0. Found by trying supports smallest-first.
// ponytail: support enumeration is exponential in options; fine for a dozen or so (an LP solver scales)
export const getElectionResults = (election: MaximalLotteriesElection): LotteryResult => {
  const { options } = election.definition;
  const d = pairwise(options, election.ballots);
  const m = (x: string, y: string) => d[x][y] - d[y][x];
  for (let size = 1; size <= options.length; size++) {
    for (const support of combinations(options, size)) {
      const rows = [...support.map((y) => support.map((x) => m(x, y))), support.map(() => 1)];
      const p = solve(rows, [...support.map(() => 0), 1]);
      if (!p || p.some((x) => x < -EPSILON)) continue;
      const stable = options.every((y) => support.reduce((s, x, i) => s + p[i] * m(x, y), 0) >= -EPSILON);
      if (stable) {
        const probabilities = Object.fromEntries(options.map((o) => [o, 0]));
        support.forEach((x, i) => (probabilities[x] = Math.max(0, p[i])));
        return { result: "lottery", probabilities };
      }
    }
  }
  return { result: "lottery", probabilities: {} };
};
