// https://en.wikipedia.org/wiki/Schulze_method
import { ElectionResult } from "../generic";
import { createDefinition, startElection, castWith, validRanked, Definition, Election, RankedBallot } from "./helpers";
import { pairwise, beats, toResult } from "./helpers";

export { createDefinition, startElection };
export const castBallot = castWith(validRanked);
export type SchulzeElection = Election<Definition, RankedBallot>;

// Strength of the strongest path of pairwise wins (widest path); winners are never beaten on path strength.
export const getElectionResults = (election: SchulzeElection): ElectionResult => {
  const { options } = election.definition;
  const d = pairwise(options, election.ballots);
  const p = Object.fromEntries(
    options.map((a) => [a, Object.fromEntries(options.map((b) => [b, beats(d, a, b) ? d[a][b] : 0]))])
  );
  for (const i of options)
    for (const j of options)
      for (const k of options)
        if (i !== j && j !== k && i !== k) p[j][k] = Math.max(p[j][k], Math.min(p[j][i], p[i][k]));
  return toResult(options.filter((a) => options.every((b) => p[a][b] >= p[b][a])));
};
