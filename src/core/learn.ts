import { REFERENCES } from "./data";
import { toMeters } from "./convert";
import { rankComparisons } from "./rank";
import { formatComparison } from "./format";
import { shuffle } from "./util";

export interface LearnRound {
  targetFt: number;
  clue: string; // the single best neutral comparison for the target, e.g. "≈ 1 basketball court (NBA)"
  options: number[]; // 4 distances in feet, shuffled, one of which equals targetFt
}

/**
 * This is the inverse of Translate: instead of number -> comparison, it's
 * comparison -> number. Reuses the exact same ranking/formatting pipeline so the
 * clue a player sees here is always consistent with what Translate would show for
 * that distance — no separately-authored quiz content to keep in sync.
 */
// Includes 750 alongside 500/1000 so the top of the range still has 3 plausible
// (same-order-of-magnitude) distractors rather than falling back to arbitrary ones.
const DISTANCE_POOL_FT = [10, 15, 20, 30, 50, 75, 100, 150, 200, 300, 500, 750, 1000];

function pickDistractors(target: number, pool: number[], count: number): number[] {
  const candidates = pool.filter((v) => v !== target);
  const plausible = candidates.filter((v) => v >= target * 0.3 && v <= target * 3.5);
  const source = plausible.length >= count ? plausible : candidates;
  return shuffle(source).slice(0, count);
}

function buildRound(targetFt: number): LearnRound | null {
  const meters = toMeters(targetFt, "ft");
  const [best] = rankComparisons(meters, REFERENCES, 1);
  if (!best) return null;

  const distractors = pickDistractors(targetFt, DISTANCE_POOL_FT, 3);
  if (distractors.length < 3) return null;

  return {
    targetFt,
    clue: formatComparison(best),
    options: shuffle([targetFt, ...distractors]),
  };
}

export function buildLearnSession(roundCount = 10): LearnRound[] {
  const rounds: LearnRound[] = [];
  for (const targetFt of shuffle(DISTANCE_POOL_FT)) {
    if (rounds.length >= roundCount) break;
    const round = buildRound(targetFt);
    if (round) rounds.push(round);
  }
  return rounds;
}
