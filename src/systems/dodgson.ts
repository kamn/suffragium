// https://en.wikipedia.org/wiki/Dodgson%27s_method
import { ElectionResult } from "../generic";
import { createDefinition, startElection, castWith, validRanked, pairwise, lowest, Definition, Election, RankedBallot, Pairwise } from "./helpers";

export { createDefinition, startElection };
export const castBallot = castWith(validRanked);
export type DodgsonElection = Election<Definition, RankedBallot>;

// Fewest swaps of adjacent preferences (across all ballots) needed to make c a Condorcet winner.
// Only moving c upward ever helps, so each ballot just picks how far to lift c; we search that
// with a DP over "swaps still needed against each rival".
// ponytail: DP state space is the product of those needs, so large margins with many options blow up (it's NP-hard)
export const dodgsonScore = (c: string, options: Array<string>, ballots: Array<RankedBallot>, d: Pairwise): number => {
  const rivals = options.filter((y) => y !== c);
  const need0 = rivals.map((y) => {
    const margin = d[y][c] - d[c][y];
    return margin < 0 ? 0 : Math.floor(margin / 2) + 1;
  });
  let states = new Map<string, number>([[need0.join(","), 0]]);
  for (const { selection } of ballots) {
    const above = selection.includes(c) ? selection.slice(0, selection.indexOf(c)) : selection;
    const next = new Map(states);
    for (const [key, cost] of states) {
      const need = key.split(",").map(Number);
      for (let t = 1; t <= above.length; t++) {
        const passed = above[above.length - t];
        const i = rivals.indexOf(passed);
        need[i] = Math.max(0, need[i] - 1);
        const k = need.join(",");
        if ((next.get(k) ?? Infinity) > cost + t) next.set(k, cost + t);
      }
    }
    states = next;
  }
  return states.get(rivals.map(() => 0).join(",")) ?? Infinity;
};

export const getElectionResults = (election: DodgsonElection): ElectionResult => {
  const { options } = election.definition;
  const d = pairwise(options, election.ballots);
  return lowest(Object.fromEntries(options.map((c) => [c, dodgsonScore(c, options, election.ballots, d)])));
};
