import { repeatBallot } from "./helpers";
import { randomBallot } from "../index";

const {
  createDefinition,
  startElection,
  castBallot,
  getElectionResults
} = randomBallot


test("Random Ballot - Definition", () => {
  const definition = createDefinition(1234, ["a", "a", "b", "b", "c"]);
  expect(definition.options.length).toBe(3);
});

test("Random Ballot - Invalid Ballot - 1", () => {
  const definition = createDefinition(1234, ["a", "b", "c"]);
  const election = startElection(definition);
  const ballotResult = castBallot(election, { selection: "z" });
  expect(ballotResult.result).toBe("failure");
});

test("Basic Random Ballot - 1", () => {
  const definition = createDefinition(1234, [
    "Memphis",
    "Nashville",
    "Chattanooga",
    "Knoxville",
  ]);
  let election = startElection(definition);

  const ballotMemphis = {
    selection: "Memphis",
  };
  const ballotNashville = {
    selection: "Nashville",
  };
  const ballotChattanooga = {
    selection: "Chattanooga",
  };
  const ballotKnoxville = {
    selection: "Knoxville",
  };
  election = repeatBallot(election, ballotMemphis, 42, castBallot);
  election = repeatBallot(election, ballotNashville, 26, castBallot);
  election = repeatBallot(election, ballotChattanooga, 15, castBallot);
  election = repeatBallot(election, ballotKnoxville, 17, castBallot);
  const result = getElectionResults(election);
  expect(result.result).toBe("winner");
  if (result.result === "winner") {
    expect(result.winner).toBe("Chattanooga");
  }
});

test("Basic Random Ballot - 2", () => {
  const definition = createDefinition(4444, [
    "Memphis",
    "Nashville",
    "Chattanooga",
    "Knoxville",
  ]);
  let election = startElection(definition);

  const ballotMemphis = {
    selection: "Memphis",
  };
  const ballotNashville = {
    selection: "Nashville",
  };
  const ballotChattanooga = {
    selection: "Chattanooga",
  };
  const ballotKnoxville = {
    selection: "Knoxville",
  };
  election = repeatBallot(election, ballotMemphis, 42, castBallot);
  election = repeatBallot(election, ballotNashville, 26, castBallot);
  election = repeatBallot(election, ballotChattanooga, 15, castBallot);
  election = repeatBallot(election, ballotKnoxville, 17, castBallot);
  const result = getElectionResults(election);
  expect(result.result).toBe("winner");
  if (result.result === "winner") {
    expect(result.winner).toBe("Nashville");
  }
});
