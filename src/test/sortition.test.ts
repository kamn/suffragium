import {
  createBasicDefinition,
  startElection,
  getElectionResults,
} from "../systems/sortition";

test("Sortition - Definition", () => {
  const definition = createBasicDefinition(123210, ["a", "a", "b", "c"]);
  expect(definition.options.length).toBe(3);
});

test("Basic Sortition - 1", () => {
  const definition = createBasicDefinition(123210, ["a", "b", "c"]);
  const election = startElection(definition);
  const result = getElectionResults(election);
  expect(result.result).toBe("winner");
  if (result.result === "winner") {
    expect(result.winner).toBe("b");
  }
});

test("Basic Sortition - 2", () => {
  const definition = createBasicDefinition(123214, ["a", "b", "c"]);
  const election = startElection(definition);
  const result = getElectionResults(election);
  expect(result.result).toBe("winner");
  if (result.result === "winner") {
    expect(result.winner).toBe("c");
  }
});
