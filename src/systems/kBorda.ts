// https://en.wikipedia.org/wiki/Multiwinner_voting (k-Borda)
import { MultiWinnerResult } from "../generic";
import { dedup, startElection, castWith, validRanked, zeroes, topK, SeatsDefinition, Election, RankedBallot } from "./helpers";

export { startElection };
export type RankedCommitteeElection = Election<SeatsDefinition, RankedBallot>;
export const createDefinition = (options: Array<string>, seats: number): SeatsDefinition => ({ options: dedup(options), seats });
export const castBallot = castWith<SeatsDefinition, RankedBallot>(validRanked);
import { bordaScores } from "./helpers";

// The k highest Borda scores win.
export const getElectionResults = (election: RankedCommitteeElection): MultiWinnerResult => ({
  result: "winners",
  winners: topK(bordaScores(election.definition.options, election.ballots), election.definition.seats),
});
