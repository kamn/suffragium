import { repeatBallot } from "./helpers";
import { stars } from "../index";
const {
  createDefinition,
  startElection,
  castBallot,
  getElectionResults,
} = stars

test("Stars - Definition", () => {
  const definition = createDefinition(["a", "a", "b", "b", "c"]);
  expect(definition.options.length).toBe(3);
});

test("Stars - Invalid Ballot - 1", () => {
  const definition = createDefinition(["a", "b", "c"]);
  const election = startElection(definition);
  const ballotResult = castBallot(election, { 
    selection: [
      {selection: "a", score: 0}, 
      {selection: "b" , score: 0}, 
      {selection: "z", score: 0}] });
  expect(ballotResult.result).toBe("failure");
});

test("Basic Stars - 1", () => {
  const definition = createDefinition([
    "Memphis",
    "Nashville",
    "Chattanooga",
    "Knoxville",
  ]);
  let election = startElection(definition);

  const ballotMemphis = {
    selection: [{selection: "Memphis", score: 0}],
  };
  const ballotNashville = {
    selection: [{selection: "Nashville", score: 1}],
  };
  const ballotChattanooga = {
    selection: [{selection: "Chattanooga", score: 2}],
  };
  const ballotKnoxville = {
    selection: [{selection: "Knoxville", score: 3 }],
  };
  election = repeatBallot(election, ballotMemphis, 42, castBallot);
  election = repeatBallot(election, ballotNashville, 26, castBallot);
  election = repeatBallot(election, ballotChattanooga, 15, castBallot);
  election = repeatBallot(election, ballotKnoxville, 17, castBallot);
  const result = getElectionResults(election);
  //expect(result.result).toBe("nowinner");
});


test("Basic Stars - 2", () => {
  const definition = createDefinition([
    "Memphis",
    "Nashville",
    "Chattanooga",
    "Knoxville",
  ]);
  let election = startElection(definition);

  const ballotMemphis = {
    selection: [{selection: "Memphis", score: 0}, {selection: "Nashville", score: 1}, {selection: "Chattanooga", score: 2}, {selection: "Knoxville", score: 3 }],
  };
  const ballotNashville = {
    selection: [{selection: "Nashville", score: 1}, {selection: "Chattanooga", score: 2}, {selection: "Knoxville", score: 3 }, {selection: "Memphis", score: 0}],
  };
  const ballotChattanooga = {
    selection: [{selection: "Chattanooga", score: 2}, {selection: "Knoxville", score: 3 }, {selection: "Nashville", score: 1}, {selection: "Memphis", score: 0}],
  };
  const ballotKnoxville = {
    selection: [{selection: "Knoxville", score: 3 }, {selection: "Chattanooga", score: 2}, {selection: "Nashville", score: 1}, {selection: "Memphis", score: 0}],
  };
  election = repeatBallot(election, ballotMemphis, 42, castBallot);
  election = repeatBallot(election, ballotNashville, 26, castBallot);
  election = repeatBallot(election, ballotChattanooga, 15, castBallot);
  election = repeatBallot(election, ballotKnoxville, 17, castBallot);
  const result = getElectionResults(election);
  expect(result.result).toBe("winner");
  if (result.result === "winner") {
    expect(result.winner).toBe("Knoxville");
  }
});

test("Basic Stars Tie - 1", () => {
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

  //election = repeatBallot(election, ballotMemphis, 10, castBallot);
  //election = repeatBallot(election, ballotNashville, 10, castBallot);
  //const result = getElectionResults(election);
  //expect(result.result).toBe("nowinner");

});

const addSeven = (n) => n + 7;

