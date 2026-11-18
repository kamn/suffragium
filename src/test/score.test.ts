import { test, expect } from "bun:test";
import { run } from "./helpers";
import { score, stars, majorityJudgment, threeTwoOne, antiPlurality } from "../index";

const winner = (w: string) => ({ result: "winner" as const, winner: w });
const scores = (s: Record<string, number>) => ({
  selection: Object.entries(s).map(([selection, score]) => ({ selection, score })),
});

test("Score vs STAR - runoff overturns the score leader", () => {
  const ballots: Array<[ReturnType<typeof scores>, number]> = [
    [scores({ a: 4, b: 5 }), 2],
    [scores({ a: 5, b: 0 }), 1],
  ];
  // Totals a 13, b 10; but 2 of 3 voters prefer b.
  expect(run(score, score.createDefinition(["a", "b", "c"]), ballots)).toEqual(winner("a"));
  expect(run(stars, stars.createDefinition(["a", "b", "c"]), ballots)).toEqual(winner("b"));
});

test("STAR - runoff tie goes to higher total", () => {
  const ballots: Array<[ReturnType<typeof scores>, number]> = [
    [scores({ a: 5, b: 0 }), 1],
    [scores({ a: 3, b: 4 }), 1],
  ];
  expect(run(stars, stars.createDefinition(["a", "b"]), ballots)).toEqual(winner("a"));
});

test("Score - rejects negative or unknown", () => {
  const e = score.startElection(score.createDefinition(["a"]));
  expect(score.castBallot(e, scores({ a: -1 })).result).toBe("failure");
  expect(score.castBallot(e, scores({ z: 1 })).result).toBe("failure");
});

test("Majority Judgment - median beats mean", () => {
  const ballots: Array<[ReturnType<typeof scores>, number]> = [
    [scores({ a: 4, b: 3 }), 2],
    [scores({ a: 0, b: 3 }), 1],
  ];
  // a: grades [0,4,4] median 4; b: [3,3,3] median 3. Score totals would pick b (9 vs 8).
  expect(run(majorityJudgment, majorityJudgment.createDefinition(["a", "b"]), ballots)).toEqual(winner("a"));
  expect(run(score, score.createDefinition(["a", "b"]), ballots)).toEqual(winner("b"));
});

test("Majority Judgment - tie-break removes medians", () => {
  const ballots: Array<[ReturnType<typeof scores>, number]> = [
    [scores({ a: 1, b: 2 }), 1],
    [scores({ a: 2, b: 2 }), 1],
    [scores({ a: 3, b: 0 }), 1],
  ];
  // Both medians 2; then a's lower median of [1,3] is 1, b's of [0,2] is 0.
  expect(run(majorityJudgment, majorityJudgment.createDefinition(["a", "b"]), ballots)).toEqual(winner("a"));
});

test("3-2-1 - semifinal, final, runoff", () => {
  const ballots: Array<[ReturnType<typeof scores>, number]> = [
    [scores({ a: 2, b: 1, c: 1, d: 0 }), 1],
    [scores({ a: 2, b: 2, c: 1, d: 0 }), 1],
    [scores({ a: 2, b: 0, c: 2, d: 2 }), 1],
    [scores({ a: 0, b: 2, c: 1, d: 0 }), 1],
    [scores({ a: 0, b: 1, c: 2, d: 0 }), 1],
    [scores({ a: 0, b: 1, c: 2, d: 0 }), 1],
  ];
  // Semis a,c,b (most good); finalists c (0 bad), b (1 bad); a has 3 bad. Runoff c 3 - b 2.
  expect(run(threeTwoOne, threeTwoOne.createDefinition(["a", "b", "c", "d"]), ballots)).toEqual(winner("c"));
  const e = threeTwoOne.startElection(threeTwoOne.createDefinition(["a"]));
  expect(threeTwoOne.castBallot(e, scores({ a: 3 })).result).toBe("failure");
  expect(threeTwoOne.castBallot(e, scores({ a: 1.5 })).result).toBe("failure");
});

test("Anti-plurality - fewest votes against", () => {
  const def = antiPlurality.createDefinition(["a", "b", "c"]);
  expect(run(antiPlurality, def, [[{ selection: "a" }, 3], [{ selection: "b" }, 1]])).toEqual(winner("c"));
  expect(antiPlurality.castBallot(antiPlurality.startElection(def), { selection: "z" }).result).toBe("failure");
});
