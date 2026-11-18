import { test, expect } from "bun:test";
import { run, tennessee, tennesseeCities } from "./helpers";
import { kemeny } from "../index";

test("Kemeny - Tennessee", () => {
  expect(run(kemeny, kemeny.createDefinition(tennesseeCities), tennessee)).toEqual({ result: "winner", winner: "Nashville" });
});

test("Kemeny - Tie", () => {
  const result = run(kemeny, kemeny.createDefinition(["a", "b"]), [
    [{ selection: ["a", "b"] }, 10],
    [{ selection: ["b", "a"] }, 10],
  ]);
  expect(result).toEqual({ result: "tie", ties: ["a", "b"] });
});

test("Kemeny - Invalid Ballot", () => {
  const election = kemeny.startElection(kemeny.createDefinition(["a", "b"]));
  expect(kemeny.castBallot(election, { selection: ["a", "z"] }).result).toBe("failure");
  expect(kemeny.castBallot(election, { selection: ["a", "a"] }).result).toBe("failure");
});
