// https://en.wikipedia.org/wiki/Mixed_electoral_system
// Parallel voting: https://en.wikipedia.org/wiki/Parallel_voting
// Mixed-member proportional / additional member: https://en.wikipedia.org/wiki/Mixed-member_proportional_representation
import { MixedResult } from "../generic";
import { dedup, startElection as start, castWith, zeroes, topK, allocateSeats, Definition, Election } from "./helpers";

export type MixedDefinition = Definition & {
  kind: "parallel" | "mmp";
  // district → candidate → party
  districts: Record<string, Record<string, string>>;
  listSeats: number;
};
// Two votes: a candidate in your district and a party list.
export type MixedBallot = { district: string; candidate: string; selection: string };
export type MixedElection = Election<MixedDefinition, MixedBallot>;

const create =
  (kind: MixedDefinition["kind"]) =>
  (parties: Array<string>, districts: Record<string, Record<string, string>>, listSeats: number): MixedDefinition => ({
    kind,
    options: dedup(parties),
    districts,
    listSeats,
  });
export const createParallelDefinition = create("parallel");
export const createMmpDefinition = create("mmp");
export const startElection = (definition: MixedDefinition): MixedElection => start<MixedDefinition, MixedBallot>(definition);
export const castBallot = castWith(
  (d: MixedDefinition, b: MixedBallot) => d.options.includes(b.selection) && b.candidate in (d.districts[b.district] ?? {})
);

// Districts are first-past-the-post. List seats use Sainte-Laguë on the party votes:
// parallel adds them on top; MMP tops each party up to its proportional share of all seats.
// ponytail: district ties go to candidate order; MMP keeps overhang seats with no levelling seats
export const getElectionResults = (election: MixedElection): MixedResult => {
  const { options, districts, listSeats, kind } = election.definition;
  const districtWinners: Record<string, string> = {};
  const seats = zeroes(options);
  for (const [district, candidates] of Object.entries(districts)) {
    const votes = zeroes(Object.keys(candidates));
    for (const b of election.ballots) if (b.district === district) votes[b.candidate]++;
    const [winner] = topK(votes, 1);
    if (winner === undefined) continue;
    districtWinners[district] = winner;
    seats[candidates[winner]]++;
  }
  const listVotes = zeroes(options);
  for (const b of election.ballots) listVotes[b.selection]++;
  const sainteLague = (s: number) => 2 * s + 1;
  if (kind === "parallel") {
    const list = allocateSeats(listVotes, listSeats, sainteLague);
    for (const p of options) seats[p] += list[p];
  } else {
    const share = allocateSeats(listVotes, Object.keys(districts).length + listSeats, sainteLague);
    for (const p of options) seats[p] = Math.max(seats[p], share[p]);
  }
  return { result: "mixed", districtWinners, seats };
};
