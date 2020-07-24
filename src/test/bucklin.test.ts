import { repeatBallot } from "./helpers";
import {
  createDefinition,
  startElection,
  castBallot,
  getElectionResults,
} from "../systems/bucklin";

test("Bucklin - Definition", () => {
  const definition = createDefinition(["a", "a", "b", "b", "c"]);
  expect(definition.options.length).toBe(3);
});

test("Bucklin - Invalid Ballot - 1", () => {
  const definition = createDefinition(["a", "b", "c"]);
  const election = startElection(definition);
  const ballotResult = castBallot(election, { selection: ["a", "b", "z"] });
  expect(ballotResult.result).toBe("failure");
});

test("Basic Bucklin - 1", () => {
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
