import { test, expect } from "bun:test";
import { run } from "./helpers";
import { stv, dhondt, sainteLague, limited, cumulative, pav, spav, phragmen, rrv } from "../index";

const winners = (...w: Array<string>) => ({ result: "winners" as const, winners: w });

// https://en.wikipedia.org/wiki/Single_transferable_vote#Example
test("STV - Wikipedia food election", () => {
  const def = stv.createDefinition(["Oranges", "Pears", "Chocolate", "Strawberries", "Bonbons"], 3);
  const result = run(stv, def, [
    [{ selection: ["Oranges"] }, 4],
    [{ selection: ["Pears", "Oranges"] }, 2],
    [{ selection: ["Chocolate", "Strawberries"] }, 8],
    [{ selection: ["Chocolate", "Bonbons"] }, 4],
    [{ selection: ["Strawberries"] }, 1],
    [{ selection: ["Bonbons"] }, 1],
  ]);
  expect(result).toEqual(winners("Chocolate", "Oranges", "Strawberries"));
});

// https://en.wikipedia.org/wiki/D%27Hondt_method#Example (votes / 1000)
const parties: Array<[{ selection: string }, number]> = [
  [{ selection: "A" }, 100],
  [{ selection: "B" }, 80],
  [{ selection: "C" }, 30],
  [{ selection: "D" }, 20],
];

test("D'Hondt - favours large parties", () => {
  expect(run(dhondt, dhondt.createDefinition(["A", "B", "C", "D"], 8), parties)).toEqual({
    result: "seats" as const,
    seats: { A: 4, B: 3, C: 1, D: 0 },
  });
});

test("Sainte-Laguë - same votes, more proportional", () => {
  expect(run(sainteLague, sainteLague.createDefinition(["A", "B", "C", "D"], 8), parties)).toEqual({
    result: "seats" as const,
    seats: { A: 3, B: 3, C: 1, D: 1 },
  });
});

// 6 voters like a and b, 4 voters like c. Two seats.
const majorityMinority: Array<[{ selection: Array<string> }, number]> = [
  [{ selection: ["a", "b"] }, 6],
  [{ selection: ["c"] }, 4],
];

test("Block voting - majority sweeps", () => {
  expect(run(limited, limited.createBlockDefinition(["a", "b", "c"], 2), majorityMinority)).toEqual(winners("a", "b"));
});

test.each([
  ["pav", pav],
  ["spav", spav],
  ["phragmen", phragmen],
] as const)("%s - minority gets a seat", (_, system: any) => {
  expect(run(system, system.createDefinition(["a", "b", "c"], 2), majorityMinority)).toEqual(winners("a", "c"));
});

test("RRV - minority gets a seat", () => {
  const ballots: Array<[{ selection: Array<{ selection: string; score: number }> }, number]> = [
    [{ selection: [{ selection: "a", score: 10 }, { selection: "b", score: 10 }] }, 6],
    [{ selection: [{ selection: "c", score: 10 }] }, 4],
  ];
  expect(run(rrv, rrv.createDefinition(["a", "b", "c"], 2, 10), ballots)).toEqual(winners("a", "c"));
  const e = rrv.startElection(rrv.createDefinition(["a"], 1, 10));
  expect(rrv.castBallot(e, { selection: [{ selection: "a", score: 11 }] }).result).toBe("failure");
});

test("SNTV - one vote each, organised minority wins a seat", () => {
  const result = run(limited, limited.createSntvDefinition(["a", "b", "c"], 2), [
    [{ selection: ["a"] }, 3],
    [{ selection: ["b"] }, 3],
    [{ selection: ["c"] }, 4],
  ]);
  expect(result).toEqual(winners("c", "a"));
  const e = limited.startElection(limited.createSntvDefinition(["a", "b"], 1));
  expect(limited.castBallot(e, { selection: ["a", "b"] }).result).toBe("failure");
});

test("Cumulative - minority stacks its points", () => {
  const result = run(cumulative, cumulative.createDefinition(["a", "b", "c"], 2, 2), [
    [{ selection: [{ selection: "a", score: 1 }, { selection: "b", score: 1 }] }, 6],
    [{ selection: [{ selection: "c", score: 2 }] }, 4],
  ]);
  expect(result).toEqual(winners("c", "a"));
  const e = cumulative.startElection(cumulative.createDefinition(["a", "b"], 1, 2));
  expect(cumulative.castBallot(e, { selection: [{ selection: "a", score: 2 }, { selection: "b", score: 1 }] }).result).toBe("failure");
});
