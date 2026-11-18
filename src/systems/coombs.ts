// https://en.wikipedia.org/wiki/Coombs%27_method
import { ElectionResult } from "../generic";
import { createDefinition, startElection, castWith, validRanked, Definition, Election, RankedBallot } from "./helpers";
import { firstChoices, zeroes, best, toResult } from "./helpers";

export { createDefinition, startElection };
export const castBallot = castWith(validRanked);
export type CoombsElection = Election<Definition, RankedBallot>;

// Until someone has a majority of first preferences, eliminate whoever is ranked last most.
// ponytail: "last" = lowest remaining option a ballot lists; partial ballots don't spread last place over unranked options
export const getElectionResults = (election: CoombsElection): ElectionResult => {
  const { ballots } = election;
  let remaining = election.definition.options;
  while (remaining.length > 0) {
    const first = firstChoices(remaining, ballots);
    if (remaining.some((o) => first[o] > ballots.length / 2)) return best(first);
    const last = zeroes(remaining);
    for (const b of ballots) {
      const listed = b.selection.filter((x) => remaining.includes(x));
      if (listed.length) last[listed[listed.length - 1]]++;
    }
    const most = Math.max(...Object.values(last));
    const out = remaining.filter((o) => last[o] === most);
    if (out.length === remaining.length) return best(first);
    remaining = remaining.filter((o) => !out.includes(o));
  }
  return toResult([]);
};
