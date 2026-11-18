import { test, expect } from "bun:test";
import { run, tennessee, tennesseeCities } from "./helpers";
import { contingent, dowdall, coombs, baldwin, nanson, minimax, rankedPairs, schulze, black, smith, schwartz } from "../index";

const winner = (w: string) => ({ result: "winner" as const, winner: w });
const tie = (...ties: Array<string>) => ({ result: "tie" as const, ties });

// Nashville is the Condorcet winner, so every Condorcet method must pick it.
test.each([
  ["minimax", minimax],
  ["rankedPairs", rankedPairs],
  ["schulze", schulze],
  ["black", black],
  ["baldwin", baldwin],
  ["nanson", nanson],
  ["smith", smith],
  ["schwartz", schwartz],
  ["coombs", coombs],
  ["contingent", contingent],
  ["dowdall", dowdall],
] as const)("%s - Tennessee", (_, system: any) => {
  expect(run(system, system.createDefinition(tennesseeCities), tennessee)).toEqual(winner("Nashville"));
});

test.each([
  ["contingent", contingent],
  ["dowdall", dowdall],
  ["coombs", coombs],
  ["baldwin", baldwin],
  ["nanson", nanson],
  ["minimax", minimax],
  ["rankedPairs", rankedPairs],
  ["schulze", schulze],
  ["black", black],
  ["smith", smith],
  ["schwartz", schwartz],
] as const)("%s - even split is a tie, bad ballots rejected", (_, system: any) => {
  const def = system.createDefinition(["a", "b"]);
  expect(run(system, def, [[{ selection: ["a", "b"] }, 5], [{ selection: ["b", "a"] }, 5]])).toEqual(tie("a", "b"));
  expect(system.castBallot(system.startElection(def), { selection: ["a", "z"] }).result).toBe("failure");
  expect(system.castBallot(system.startElection(def), { selection: ["b", "b"] }).result).toBe("failure");
});

// https://en.wikipedia.org/wiki/Schulze_method#Example
const schulzeExample: Array<[{ selection: Array<string> }, number]> = [
  ["ACBED", 5], ["ADECB", 5], ["BEDAC", 8], ["CABED", 3],
  ["CAEBD", 7], ["CBADE", 2], ["DCEBA", 7], ["EBADC", 8],
].map(([s, n]) => [{ selection: (s as string).split("") }, n as number]);

test("Schulze - Wikipedia example (no Condorcet winner)", () => {
  expect(run(schulze, schulze.createDefinition(["A", "B", "C", "D", "E"]), schulzeExample)).toEqual(winner("E"));
});

test("Ranked Pairs / Minimax - Schulze example", () => {
  const def = rankedPairs.createDefinition(["A", "B", "C", "D", "E"]);
  expect(run(rankedPairs, def, schulzeExample)).toEqual(winner("A"));
  expect(run(minimax, def, schulzeExample)).toEqual(winner("E"));
});

// Margins: A ties B, B beats C, C beats A.
const smithVsSchwartz: Array<[{ selection: Array<string> }, number]> = [
  [{ selection: ["B", "C", "A"] }, 2],
  [{ selection: ["C", "A", "B"] }, 1],
  [{ selection: ["A", "B", "C"] }, 1],
];

test("Smith vs Schwartz", () => {
  const def = smith.createDefinition(["A", "B", "C"]);
  expect(run(smith, def, smithVsSchwartz)).toEqual(tie("A", "B", "C"));
  expect(run(schwartz, def, smithVsSchwartz)).toEqual(winner("B"));
});

test("Condorcet cycle - Smith set is everyone, Black falls back to Borda", () => {
  const cycle: Array<[{ selection: Array<string> }, number]> = [
    [{ selection: ["A", "B", "C"] }, 4],
    [{ selection: ["B", "C", "A"] }, 3],
    [{ selection: ["C", "A", "B"] }, 2],
  ];
  const def = smith.createDefinition(["A", "B", "C"]);
  expect(run(smith, def, cycle)).toEqual(tie("A", "B", "C"));
  // Borda: A 4*3+3*1+2*2=19, B 4*2+3*3+2*1=19, C 4*1+3*2+2*3=16
  expect(run(black, def, cycle)).toEqual(tie("A", "B"));
});

test("Contingent - Memphis/Nashville runoff picks Nashville, plurality winner loses", () => {
  // First preferences: Memphis 42, Nashville 26 → runoff 42 vs 58.
  expect(run(contingent, contingent.createDefinition(tennesseeCities), tennessee)).toEqual(winner("Nashville"));
});

test("Coombs differs from IRV", () => {
  // IRV drops C (fewest firsts) and A beats B 7-5. Coombs drops B (most lasts: 7) and C beats A 8-4.
  const ballots: Array<[{ selection: Array<string> }, number]> = [
    [{ selection: ["A", "C", "B"] }, 4],
    [{ selection: ["B", "C", "A"] }, 5],
    [{ selection: ["C", "A", "B"] }, 3],
  ];
  expect(run(coombs, coombs.createDefinition(["A", "B", "C"]), ballots)).toEqual(winner("C"));
});
