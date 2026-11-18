import { test, expect } from "bun:test";
import { run, tennessee, tennesseeCities } from "./helpers";
import {
  supplementary, combinedApproval, positional, tideman, condorcetIrv, dasguptaMaskin, dodgson,
  graduatedMajorityJudgment, quadratic, irv,
  satisfactionApproval, thiele, limited, largestRemainder, huntingtonHill, multipleRandomBallots, sortition,
  equalShares, expandingApprovals, minimaxApproval, kBorda, quotaBorda, cpoStv, schulzeStv,
  maximalLotteries, fractionalApproval, biproportional, mixed, liquidDemocracy,
} from "../index";

const winner = (w: string) => ({ result: "winner" as const, winner: w });
const tie = (...ties: Array<string>) => ({ result: "tie" as const, ties });
const winners = (...w: Array<string>) => ({ result: "winners" as const, winners: w });
const scores = (s: Record<string, number>) => ({
  selection: Object.entries(s).map(([selection, score]) => ({ selection, score })),
});
type Ranked = Array<[{ selection: Array<string> }, number]>;

// A>B 6-3, B>C 7-2, C>A 5-4: a cycle with no Condorcet winner.
const cycle: Ranked = [
  [{ selection: ["A", "B", "C"] }, 4],
  [{ selection: ["B", "C", "A"] }, 3],
  [{ selection: ["C", "A", "B"] }, 2],
];

// ---------- single winner, ranked ----------

test.each([
  ["tideman", tideman],
  ["condorcetIrv", condorcetIrv],
  ["dasguptaMaskin", dasguptaMaskin],
  ["dodgson", dodgson],
] as const)("%s - Tennessee picks the Condorcet winner", (_, system: any) => {
  expect(run(system, system.createDefinition(tennesseeCities), tennessee)).toEqual(winner("Nashville"));
});

test("Condorcet-IRV - fixes IRV's Tennessee result", () => {
  expect(run(irv, irv.createDefinition(tennesseeCities), tennessee)).toEqual(winner("Knoxville"));
  expect(run(condorcetIrv, condorcetIrv.createDefinition(tennesseeCities), tennessee)).toEqual(winner("Nashville"));
});

test("Cycle - Tideman, Condorcet-IRV, Dodgson pick A; Dasgupta-Maskin ties on Borda", () => {
  const def = tideman.createDefinition(["A", "B", "C"]);
  expect(run(tideman, def, cycle)).toEqual(winner("A")); // C has fewest firsts; then A beats B
  expect(run(condorcetIrv, def, cycle)).toEqual(winner("A")); // IRV: C out, A 6 - B 3
  expect(run(dodgson, def, cycle)).toEqual(winner("A")); // A needs 1 swap, B 2, C 3
  expect(run(dasguptaMaskin, def, cycle)).toEqual(tie("A", "B")); // Borda A 19, B 19, C 16
});

test("Dodgson - scores", () => {
  const def = dodgson.createDefinition(["A", "B", "C"]);
  const election = cycle.reduce((e, [b, n]) => {
    for (let i = 0; i < n; i++) e = (dodgson.castBallot(e, b) as any).data;
    return e;
  }, dodgson.startElection(def));
  const { pairwise } = require("../systems/helpers");
  const d = pairwise(def.options, election.ballots);
  expect(["A", "B", "C"].map((c) => dodgson.dodgsonScore(c, def.options, election.ballots, d))).toEqual([1, 2, 3]);
});

test("Positional - weights reproduce plurality and Borda", () => {
  expect(run(positional, positional.createDefinition(tennesseeCities, [1]), tennessee)).toEqual(winner("Memphis"));
  expect(run(positional, positional.createDefinition(tennesseeCities, [4, 3, 2, 1]), tennessee)).toEqual(winner("Nashville"));
});

test("Supplementary - only two preferences, so Tennessee goes to Memphis", () => {
  const truncated: Ranked = tennessee.map(([b, n]) => [{ selection: b.selection.slice(0, 2) }, n]);
  expect(run(supplementary, supplementary.createDefinition(tennesseeCities), truncated)).toEqual(winner("Memphis"));
  const e = supplementary.startElection(supplementary.createDefinition(["a", "b", "c"]));
  expect(supplementary.castBallot(e, { selection: ["a", "b", "c"] }).result).toBe("failure");
});

// ---------- single winner, rated ----------

test("Combined approval - against votes count", () => {
  const def = combinedApproval.createDefinition(["a", "b"]);
  expect(run(combinedApproval, def, [[scores({ a: 1 }), 3], [scores({ a: -1, b: 1 }), 2]])).toEqual(winner("b"));
  expect(combinedApproval.castBallot(combinedApproval.startElection(def), scores({ a: 2 })).result).toBe("failure");
});

test("Graduated majority judgment - score formula", () => {
  // median 2, 40% above, 20% below → 2 + 0.2 / (2 * 0.4)
  expect(graduatedMajorityJudgment.gmjScore([1, 2, 2, 3, 4])).toBeCloseTo(2.25);
  expect(graduatedMajorityJudgment.gmjScore([0, 2, 2, 2, 2])).toBeCloseTo(1.875);
  const ballots: Array<[ReturnType<typeof scores>, number]> = [
    [scores({ a: 1, b: 2 }), 1], [scores({ a: 2, b: 2 }), 1], [scores({ a: 2, b: 2 }), 1],
    [scores({ a: 3, b: 2 }), 1], [scores({ a: 4, b: 0 }), 1],
  ];
  expect(run(graduatedMajorityJudgment, graduatedMajorityJudgment.createDefinition(["a", "b"]), ballots)).toEqual(winner("a"));
});

test("Quadratic - votes cost their square", () => {
  const def = quadratic.createDefinition(["a", "b"], 9);
  expect(run(quadratic, def, [[scores({ a: 3 }), 1], [scores({ a: -1, b: 2 }), 2]])).toEqual(winner("b")); // a 1, b 4
  expect(quadratic.castBallot(quadratic.startElection(def), scores({ a: 3, b: 1 })).result).toBe("failure");
});

// ---------- lotteries & delegation ----------

test("Maximal lotteries - Condorcet winner gets probability 1, a symmetric cycle is uniform", () => {
  const r = run(maximalLotteries, maximalLotteries.createDefinition(tennesseeCities), tennessee);
  expect(r.probabilities.Nashville).toBeCloseTo(1);
  const rps: Ranked = [
    [{ selection: ["A", "B", "C"] }, 1],
    [{ selection: ["B", "C", "A"] }, 1],
    [{ selection: ["C", "A", "B"] }, 1],
  ];
  const p = run(maximalLotteries, maximalLotteries.createDefinition(["A", "B", "C"]), rps).probabilities;
  for (const o of ["A", "B", "C"]) expect(p[o]).toBeCloseTo(1 / 3);
});

test("Maximal lotteries - uneven cycle", () => {
  // margins A>B 3, B>C 5, C>A 1 → p ∝ (5, 1, 3)
  const p = run(maximalLotteries, maximalLotteries.createDefinition(["A", "B", "C"]), cycle).probabilities;
  expect(p.A).toBeCloseTo(5 / 9);
  expect(p.B).toBeCloseTo(1 / 9);
  expect(p.C).toBeCloseTo(3 / 9);
});

test("Fractional approval - conditional utilitarian shares", () => {
  const p = run(fractionalApproval, fractionalApproval.createDefinition(["a", "b", "c"]), [
    [{ selection: ["a", "b"] }, 6],
    [{ selection: ["c"] }, 4],
  ]).probabilities;
  expect(p).toEqual({ a: 0.3, b: 0.3, c: 0.4 });
});

test("Liquid democracy - delegation chains, loops and dead ends", () => {
  const def = liquidDemocracy.createDefinition(["a", "b"]);
  const result = run(liquidDemocracy, def, [
    [{ voter: "alice", selection: "a" }, 1],
    [{ voter: "bob", delegate: "alice" }, 1],
    [{ voter: "carol", delegate: "bob" }, 1],
    [{ voter: "dave", selection: "b" }, 1],
    [{ voter: "erin", selection: "b" }, 1],
    [{ voter: "x", delegate: "y" }, 1],
    [{ voter: "y", delegate: "x" }, 1],
    [{ voter: "zed", delegate: "nobody" }, 1],
  ]);
  expect(result).toEqual(winner("a")); // a 3, b 2; the loop and dead end are lost
  const e = liquidDemocracy.startElection(def);
  const cast = (liquidDemocracy.castBallot(e, { voter: "alice", selection: "a" }) as any).data;
  expect(liquidDemocracy.castBallot(cast, { voter: "alice", selection: "b" }).result).toBe("failure");
  expect(liquidDemocracy.castBallot(e, { voter: "bob", delegate: "bob" }).result).toBe("failure");
  expect(liquidDemocracy.castBallot(e, { voter: "bob", selection: "a", delegate: "x" }).result).toBe("failure");
});

// ---------- multi-winner ----------

// 6 voters like a and b, 4 voters like c. Two seats.
const majorityMinority: Ranked = [
  [{ selection: ["a", "b"] }, 6],
  [{ selection: ["c"] }, 4],
];

test.each([
  ["equalShares", equalShares],
  ["expandingApprovals", expandingApprovals],
  ["minimaxApproval", minimaxApproval],
  ["quotaBorda", quotaBorda],
] as const)("%s - minority gets a seat", (_, system: any) => {
  expect(run(system, system.createDefinition(["a", "b", "c"], 2), majorityMinority)).toEqual(winners("a", "c"));
});

test("Satisfaction approval - splitting your vote costs the majority", () => {
  expect(run(satisfactionApproval, satisfactionApproval.createDefinition(["a", "b", "c"], 2), majorityMinority)).toEqual(winners("c", "a"));
});

test("Thiele - weights select the rule", () => {
  const cc = thiele.createDefinition(["a", "b", "c"], 2, [1, 0]); // Chamberlin–Courant
  const block = thiele.createDefinition(["a", "b", "c"], 2, [1, 1]);
  expect(run(thiele, cc, majorityMinority)).toEqual(winners("a", "c"));
  expect(run(thiele, block, majorityMinority)).toEqual(winners("a", "b"));
});

test("Block approval - majority sweeps", () => {
  expect(run(limited, limited.createBlockApprovalDefinition(["a", "b", "c"], 2), majorityMinority)).toEqual(winners("a", "b"));
});

test("k-Borda - top two Borda scores", () => {
  expect(run(kBorda, kBorda.createDefinition(tennesseeCities, 2), tennessee)).toEqual(winners("Nashville", "Chattanooga"));
});

// https://en.wikipedia.org/wiki/Largest_remainders_method#Example (votes / 100)
const lrParties: Array<[{ selection: string }, number]> = [
  [{ selection: "Yellows" }, 470], [{ selection: "Whites" }, 160], [{ selection: "Reds" }, 158],
  [{ selection: "Greens" }, 120], [{ selection: "Blues" }, 61], [{ selection: "Pinks" }, 31],
];
const lrNames = ["Yellows", "Whites", "Reds", "Greens", "Blues", "Pinks"];

test("Largest remainder - Hare and Droop", () => {
  expect(run(largestRemainder, largestRemainder.createDefinition(lrNames, 10, "hare"), lrParties).seats).toEqual({
    Yellows: 5, Whites: 2, Reds: 1, Greens: 1, Blues: 1, Pinks: 0,
  });
  expect(run(largestRemainder, largestRemainder.createDefinition(lrNames, 10, "droop"), lrParties).seats).toEqual({
    Yellows: 5, Whites: 2, Reds: 2, Greens: 1, Blues: 0, Pinks: 0,
  });
});

test("Largest remainder - Imperiali never over-allocates", () => {
  const r = run(largestRemainder, largestRemainder.createDefinition(["A", "B"], 2, "imperiali"), [
    [{ selection: "A" }, 2], [{ selection: "B" }, 2],
  ]);
  expect(r.seats).toEqual({ A: 1, B: 1 }); // quota 1 → 2 + 2 seats, trimmed to 2
});

test("Huntington-Hill - every party with votes gets a first seat", () => {
  const r = run(huntingtonHill, huntingtonHill.createDefinition(["A", "B", "C", "D"], 8), [
    [{ selection: "A" }, 100], [{ selection: "B" }, 80], [{ selection: "C" }, 30], [{ selection: "D" }, 20],
  ]);
  expect(r.seats).toEqual({ A: 3, B: 3, C: 1, D: 1 });
});

test("Multiple random ballots / sortition committee - distinct, seeded", () => {
  const def = multipleRandomBallots.createDefinition(7, ["a", "b", "c"], 2);
  const ballots: Array<[{ selection: string }, number]> = [[{ selection: "a" }, 5], [{ selection: "b" }, 5]];
  const r = run(multipleRandomBallots, def, ballots);
  expect([...r.winners].sort()).toEqual(["a", "b"]); // c has no ballots, so can't be drawn
  expect(run(multipleRandomBallots, def, ballots)).toEqual(r);
  const s = sortition.getCommitteeResults(sortition.startElection(sortition.createBasicDefinition(3, ["a", "b", "c", "d"])), 2);
  expect(new Set(s.winners).size).toBe(2);
});

// https://en.wikipedia.org/wiki/Single_transferable_vote#Example
const food: Ranked = [
  [{ selection: ["Oranges"] }, 4],
  [{ selection: ["Pears", "Oranges"] }, 2],
  [{ selection: ["Chocolate", "Strawberries"] }, 8],
  [{ selection: ["Chocolate", "Bonbons"] }, 4],
  [{ selection: ["Strawberries"] }, 1],
  [{ selection: ["Bonbons"] }, 1],
];
const foods = ["Oranges", "Pears", "Chocolate", "Strawberries", "Bonbons"];

test.each([
  ["cpoStv", cpoStv],
  ["schulzeStv", schulzeStv],
] as const)("%s - Wikipedia food election", (_, system: any) => {
  const r: any = run(system, system.createDefinition(foods, 3), food);
  expect([...r.winners].sort()).toEqual(["Chocolate", "Oranges", "Strawberries"]);
});

test("Biproportional - region and party totals both hold", () => {
  const def = biproportional.createDefinition(["A", "B"], { X: 10, Y: 10 });
  const r = run(biproportional, def, [
    [{ selection: "A", region: "X" }, 600], [{ selection: "B", region: "X" }, 400],
    [{ selection: "A", region: "Y" }, 400], [{ selection: "B", region: "Y" }, 600],
  ]);
  expect(r.seats).toEqual({ X: { A: 6, B: 4 }, Y: { A: 4, B: 6 } });

  const uneven = biproportional.createDefinition(["A", "B", "C"], { X: 7, Y: 3 });
  const s = run(biproportional, uneven, [
    [{ selection: "A", region: "X" }, 500], [{ selection: "B", region: "X" }, 300], [{ selection: "C", region: "X" }, 100],
    [{ selection: "A", region: "Y" }, 50], [{ selection: "B", region: "Y" }, 150], [{ selection: "C", region: "Y" }, 100],
  ]).seats;
  expect(Object.values(s.X).reduce((a, b) => a + b)).toBe(7);
  expect(Object.values(s.Y).reduce((a, b) => a + b)).toBe(3);
  // national Sainte-Laguë: A 550, B 450, C 200 over 10 seats → 4, 4, 2
  const party = (p: string) => s.X[p] + s.Y[p];
  expect([party("A"), party("B"), party("C")]).toEqual([4, 4, 2]);
});

test("Mixed - parallel stacks list seats, MMP compensates", () => {
  const districts = { north: { ann: "A", bo: "B" }, south: { cy: "A", di: "B" } };
  const ballots: Array<[{ district: string; candidate: string; selection: string }, number]> = [
    [{ district: "north", candidate: "ann", selection: "A" }, 6],
    [{ district: "north", candidate: "bo", selection: "B" }, 4],
    [{ district: "south", candidate: "cy", selection: "B" }, 6],
    [{ district: "south", candidate: "di", selection: "B" }, 4],
  ];
  // A wins both districts; list votes A 6, B 14.
  const parallel = run(mixed, mixed.createParallelDefinition(["A", "B"], districts, 2), ballots);
  expect(parallel.districtWinners).toEqual({ north: "ann", south: "cy" });
  expect(parallel.seats).toEqual({ A: 3, B: 1 }); // 2 districts + list A 1 (6 > 14/3), B 1
  const mmp = run(mixed, mixed.createMmpDefinition(["A", "B"], districts, 2), ballots);
  expect(mmp.seats).toEqual({ A: 2, B: 3 }); // share of 4 seats: A 1, B 3; A keeps an overhang seat
});
