import { repeatBallot } from "./helpers";
import { borda } from "../index";

const {
  createDefinition,
  startElection,
  castBallot,
  getElectionResults,
} = borda


test("Borda - Definition", () => {
  const definition = createDefinition(["a", "a", "b", "b", "c"]);
  expect(definition.options.length).toBe(3);
});

test("Borda - Invalid Ballot - 1", () => {
  const definition = createDefinition(["a", "b", "c"]);
  const election = startElection(definition);
  const ballotResult = castBallot(election, { selection: ["a", "b", "z"] });
  expect(ballotResult.result).toBe("failure");
});

test("Basic Borda - 1", () => {
  const definition = createDefinition([
    "Memphis",
    "Nashville",
    "Chattanooga",
    "Knoxville",
  ]);
  let election = startElection(definition);

  const ballotMemphis = {
    selection: ["Memphis", "Nashville", "Chattanooga", "Knoxville"],
  };
  const ballotNashville = {
    selection: ["Nashville", "Chattanooga", "Knoxville", "Memphis"],
  };
  const ballotChattanooga = {
    selection: ["Chattanooga", "Knoxville", "Nashville", "Memphis"],
  };
  const ballotKnoxville = {
    selection: ["Knoxville", "Chattanooga", "Nashville", "Memphis"],
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

test("Basic Borda Tie - 1", () => {
  const definition = createDefinition([
    "Memphis",
    "Nashville"
  ]);
  let election = startElection(definition);

  const ballotMemphis = {
    selection: ["Memphis", "Nashville"],
  };
  const ballotNashville = {
    selection: ["Nashville", "Memphis"],
  };

  election = repeatBallot(election, ballotMemphis, 10, castBallot);
  election = repeatBallot(election, ballotNashville, 10, castBallot);
  const result = getElectionResults(election);
  expect(result.result).toBe("tie");
  if (result.result === "tie") {
    expect(result.ties).toStrictEqual(["Memphis","Nashville"]);
  }
});
