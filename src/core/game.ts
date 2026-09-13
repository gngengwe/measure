import { REFERENCES } from "./data";
import { toMeters } from "./convert";
import { rankComparisons } from "./rank";
import type { Comparison, Unit } from "./types";

export interface Round {
  value: number;
  unit: Unit;
  options: Comparison[];
}

/**
 * Curated distances spanning the dataset's usable scale range. Not random within an
 * arbitrary continuous range — an unconstrained random value is likely to land where
 * the seed dataset has thin coverage (see REFERENCE_DATA.md's known gap) and produce
 * a round with 0-1 options, which isn't a meaningful choice.
 */
const DISTANCE_POOL: Array<{ value: number; unit: Unit }> = [
  { value: 6, unit: "in" },
  { value: 1, unit: "ft" },
  { value: 2, unit: "ft" },
  { value: 3, unit: "ft" },
  { value: 5, unit: "ft" },
  { value: 8, unit: "ft" },
  { value: 10, unit: "ft" },
  { value: 15, unit: "ft" },
  { value: 20, unit: "ft" },
  { value: 25, unit: "ft" },
  { value: 30, unit: "ft" },
  { value: 40, unit: "ft" },
  { value: 50, unit: "ft" },
  { value: 75, unit: "ft" },
  { value: 100, unit: "ft" },
  { value: 150, unit: "ft" },
  { value: 200, unit: "ft" },
  { value: 300, unit: "ft" },
  { value: 50, unit: "yd" },
  { value: 100, unit: "yd" },
  { value: 200, unit: "yd" },
  { value: 500, unit: "ft" },
  { value: 1000, unit: "ft" },
  { value: 0.1, unit: "mi" },
  { value: 0.25, unit: "mi" },
  { value: 0.5, unit: "mi" },
  { value: 1, unit: "mi" },
];

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Build a session of rounds using neutral (unpersonalized) ranking — the game exists
 * to discover preference, so it must not already be shaped by it. Skips any distance
 * that doesn't produce at least 2 real options (no meaningful choice to make).
 */
export function buildSession(roundCount = 20): Round[] {
  const rounds: Round[] = [];
  for (const d of shuffle(DISTANCE_POOL)) {
    if (rounds.length >= roundCount) break;
    const meters = toMeters(d.value, d.unit);
    const options = rankComparisons(meters, REFERENCES, 3);
    if (options.length < 2) continue;
    rounds.push({ value: d.value, unit: d.unit, options });
  }
  return rounds;
}
