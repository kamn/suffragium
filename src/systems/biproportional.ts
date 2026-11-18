// https://en.wikipedia.org/wiki/Biproportional_apportionment
import { RegionSeatResult } from "../generic";
import { dedup, startElection as start, castWith, zeroes, allocateSeats, Definition, Election } from "./helpers";

export type BiproportionalDefinition = Definition & { regions: Record<string, number> };
export type BiproportionalBallot = { selection: string; region: string };
export type BiproportionalElection = Election<BiproportionalDefinition, BiproportionalBallot>;

// Options are parties; regions maps each region to its seat count.
export const createDefinition = (parties: Array<string>, regions: Record<string, number>): BiproportionalDefinition => ({
  options: dedup(parties),
  regions,
});
export const startElection = (definition: BiproportionalDefinition): BiproportionalElection =>
  start<BiproportionalDefinition, BiproportionalBallot>(definition);
export const castBallot = castWith(
  (d: BiproportionalDefinition, b: BiproportionalBallot) => d.options.includes(b.selection) && b.region in d.regions
);

// Find D with sum(round(value / D)) === target by bisection (sum only falls as D grows).
const fitDivisor = (values: Array<number>, target: number) => {
  let [lo, hi] = [1e-9, values.reduce((a, b) => a + b, 0) * 2 + 1];
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const seats = values.reduce((s, v) => s + Math.round(v / mid), 0);
    if (seats === target) return mid;
    if (seats > target) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
};

// Party totals come from Sainte-Laguë over the whole country; then region and party divisors are
// adjusted in turn until every region and every party has exactly its seats (Sainte-Laguë rounding).
// ponytail: alternating scaling, capped at 1000 rounds; exact ties in rounding can leave totals off by one
export const getElectionResults = (election: BiproportionalElection): RegionSeatResult => {
  const parties = election.definition.options;
  const regionSeats = election.definition.regions;
  const regions = Object.keys(regionSeats);
  const votes = Object.fromEntries(regions.map((r) => [r, zeroes(parties)]));
  for (const b of election.ballots) votes[b.region][b.selection]++;
  const partyVotes = zeroes(parties);
  for (const r of regions) for (const p of parties) partyVotes[p] += votes[r][p];
  const totalSeats = Object.values(regionSeats).reduce((a, b) => a + b, 0);
  const partySeats = allocateSeats(partyVotes, totalSeats, (s) => 2 * s + 1);
  const rd = Object.fromEntries(regions.map((r) => [r, 1]));
  const pd = Object.fromEntries(parties.map((p) => [p, 1]));
  const seatsAt = (r: string, p: string) => Math.round(votes[r][p] / (rd[r] * pd[p]));
  const balanced = () =>
    regions.every((r) => parties.reduce((s, p) => s + seatsAt(r, p), 0) === regionSeats[r]) &&
    parties.every((p) => regions.reduce((s, r) => s + seatsAt(r, p), 0) === partySeats[p]);
  for (let i = 0; i < 1000 && !balanced(); i++) {
    for (const r of regions) rd[r] = fitDivisor(parties.map((p) => votes[r][p] / pd[p]), regionSeats[r]);
    for (const p of parties) pd[p] = fitDivisor(regions.map((r) => votes[r][p] / rd[r]), partySeats[p]);
  }
  return {
    result: "seats-by-region",
    seats: Object.fromEntries(regions.map((r) => [r, Object.fromEntries(parties.map((p) => [p, seatsAt(r, p)]))])),
  };
};
