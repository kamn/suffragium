// https://en.wikipedia.org/wiki/Anti-plurality_voting
import { ElectionResult } from "../generic";
import { createDefinition, startElection as start, castWith, validSingle, zeroes, lowest, Definition, Election, SingleBallot } from "./helpers";

export { createDefinition };
export type AntiPluralityElection = Election<Definition, SingleBallot>;
export const startElection = (definition: Definition): AntiPluralityElection => start<Definition, SingleBallot>(definition);
// Each ballot names the option the voter is voting AGAINST.
export const castBallot = castWith(validSingle);

// Fewest votes against wins.
export const getElectionResults = (election: AntiPluralityElection): ElectionResult => {
  const against = zeroes(election.definition.options);
  for (const b of election.ballots) against[b.selection]++;
  return lowest(against);
};
