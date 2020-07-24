import {
  createDefinition,
  startElection,
  castBallot,
  getElectionResults,
} from "../systems/fptp";
import { addBallotIgnoreError } from "./helpers";

test("First Past The Post - Definition", () => {
  const definition = createDefinition(["a", "a", "b", "c"]);
  expect(definition.options.length).toBe(3);
});

test("First Past The Post - Invalid Ballot - 1", () => {
  const definition = createDefinition(["a", "b", "c"]);
  const election = startElection(definition);
  const ballotResult = castBallot(election, { selection: "z" });
  expect(ballotResult.result).toBe("failure");
});

test("Basic First Past The Post - 1", () => {
  const definition = createDefinition(["a", "b", "c"]);
  let election = startElection(definition);
  election = addBallotIgnoreError(election, { selection: "a" }, castBallot);
  election = addBallotIgnoreError(election, { selection: "a" }, castBallot);
  election = addBallotIgnoreError(election, { selection: "b" }, castBallot);
  election = addBallotIgnoreError(election, { selection: "c" }, castBallot);
  const result = getElectionResults(election);
  expect(result.result).toBe("winner");
  if (result.result === "winner") {
    expect(result.winner).toBe("a");
  }
});

test("First Past The Post - Tie - 1", () => {
  const definition = createDefinition(["a", "b", "c"]);
  let election = startElection(definition);
  election = addBallotIgnoreError(election, { selection: "a" }, castBallot);
  election = addBallotIgnoreError(election, { selection: "b" }, castBallot);
  election = addBallotIgnoreError(election, { selection: "c" }, castBallot);
  const result = getElectionResults(election);
  expect(result.result).toBe("tie");
});
