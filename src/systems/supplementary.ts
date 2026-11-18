// https://en.wikipedia.org/wiki/Supplementary_vote
import { createDefinition, startElection, castWith, validRanked, Definition, Election, RankedBallot } from "./helpers";
import { getElectionResults as contingentResults } from "./contingent";

export { createDefinition, startElection };
export type SupplementaryElection = Election<Definition, RankedBallot>;
// A contingent vote where each ballot may rank at most two options.
export const castBallot = castWith((d: Definition, b: RankedBallot) => validRanked(d, b) && b.selection.length <= 2);
export const getElectionResults = contingentResults;
