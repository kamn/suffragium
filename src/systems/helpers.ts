import { Result, ElectionResult } from "../generic";

export const dedup = <T>(xs: Array<T>): Array<T> => {
  return [...new Set(xs)];
};

export type Definition = { options: Array<string> };
export type SeatsDefinition = Definition & { seats: number };
export type Election<D, B> = { definition: D; ballots: Array<B> };

export type SingleBallot = { selection: string };
export type RankedBallot = { selection: Array<string> };
export type ScoreBallot = { selection: Array<{ selection: string; score: number }> };

export const createDefinition = (options: Array<string>): Definition => ({
  options: dedup(options),
});

export const startElection = <D, B = RankedBallot>(definition: D): Election<D, B> => ({
  definition,
  ballots: [],
});

export const castWith =
  <D, B>(isValid: (definition: D, ballot: B) => boolean) =>
  (election: Election<D, B>, ballot: B): Result<Election<D, B>> =>
    isValid(election.definition, ballot)
      ? { result: "success", data: { ...election, ballots: [...election.ballots, ballot] } }
      : { result: "failure" };

export const validSingle = (d: Definition, b: SingleBallot) => d.options.includes(b.selection);

export const validRanked = (d: Definition, b: RankedBallot) =>
  b.selection.every((x) => d.options.includes(x)) && dedup(b.selection).length === b.selection.length;

export const validScores = (d: Definition, b: ScoreBallot, max = Infinity) =>
  validRanked(d, { selection: b.selection.map((v) => v.selection) }) &&
  b.selection.every((v) => Number.isFinite(v.score) && v.score >= 0 && v.score <= max);

export const scoreOf = (b: ScoreBallot, option: string) =>
  b.selection.find((v) => v.selection === option)?.score ?? 0;

export const zeroes = (options: Array<string>): Record<string, number> =>
  Object.fromEntries(options.map((o) => [o, 0]));

export const toResult = (winners: Array<string>): ElectionResult =>
  winners.length === 0
    ? { result: "nowinner" }
    : winners.length === 1
    ? { result: "winner", winner: winners[0] }
    : { result: "tie", ties: winners };

const EPSILON = 1e-9; // fractional scores (Dowdall, STV weights) must still tie

// Highest score wins; several sharing the top score is a tie.
export const best = (scores: Record<string, number>, sign = 1): ElectionResult => {
  const entries = Object.entries(scores);
  if (entries.length === 0) return { result: "nowinner" };
  const top = Math.max(...entries.map(([, s]) => s * sign));
  return toResult(entries.filter(([, s]) => Math.abs(s * sign - top) < EPSILON).map(([o]) => o));
};

export const lowest = (scores: Record<string, number>) => best(scores, -1);

// ponytail: ties at the cut are broken by option order; no random/lot tie-break
export const topK = (scores: Record<string, number>, k: number): Array<string> =>
  Object.keys(scores)
    .sort((a, b) => scores[b] - scores[a])
    .slice(0, k);

// Count each ballot for its highest-ranked option still in `remaining`.
export const firstChoices = (remaining: Array<string>, ballots: Array<RankedBallot>) => {
  const counts = zeroes(remaining);
  for (const b of ballots) {
    const top = b.selection.find((x) => remaining.includes(x));
    if (top !== undefined) counts[top]++;
  }
  return counts;
};

// Borda over `remaining`: n points for first, n-1 for second, ...; unranked get 0.
export const bordaScores = (remaining: Array<string>, ballots: Array<RankedBallot>) => {
  const scores = zeroes(remaining);
  for (const b of ballots) {
    b.selection.filter((x) => remaining.includes(x)).forEach((x, i) => (scores[x] += remaining.length - i));
  }
  return scores;
};

export type Pairwise = Record<string, Record<string, number>>;

// d[a][b] = ballots ranking a above b. Ranked options beat unranked ones.
export const pairwise = (options: Array<string>, ballots: Array<RankedBallot>): Pairwise => {
  const d: Pairwise = Object.fromEntries(options.map((a) => [a, zeroes(options)]));
  for (const { selection } of ballots) {
    const rank = (o: string) => (selection.includes(o) ? selection.indexOf(o) : Infinity);
    for (const a of options) for (const b of options) if (rank(a) < rank(b)) d[a][b]++;
  }
  return d;
};

export const beats = (d: Pairwise, a: string, b: string) => d[a][b] > d[b][a];

export const condorcetWinner = (options: Array<string>, d: Pairwise) =>
  options.find((a) => options.every((b) => a === b || beats(d, a, b)));

// Transitive closure of a relation (Floyd–Warshall).
export const closure = (options: Array<string>, rel: (a: string, b: string) => boolean) => {
  const r = Object.fromEntries(options.map((a) => [a, Object.fromEntries(options.map((b) => [b, rel(a, b)]))]));
  for (const k of options) for (const i of options) for (const j of options) r[i][j] ||= r[i][k] && r[k][j];
  return r;
};

// Highest-averages seat allocation (D'Hondt, Sainte-Laguë).
export const allocateSeats = (
  votes: Record<string, number>,
  seats: number,
  divisor: (seatsSoFar: number) => number
): Record<string, number> => {
  const won = zeroes(Object.keys(votes));
  for (let i = 0; i < seats; i++) {
    const [next] = topK(Object.fromEntries(Object.keys(votes).map((p) => [p, votes[p] / divisor(won[p])])), 1);
    if (next === undefined) break;
    won[next]++;
  }
  return won;
};
