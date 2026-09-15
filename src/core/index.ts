import { REFERENCES } from "./data";
import { toMeters, fromMeters, counterpartUnit, allConversions } from "./convert";
import type { UnitConversion } from "./convert";
import { rankComparisons } from "./rank";
import type { PreferenceWeights } from "./rank";
import { formatComparison, formatConversionValue } from "./format";
import type { TranslationResult, Unit } from "./types";

export type { ReferenceObject, Comparison, TranslationResult, Unit, Category } from "./types";
export type { PreferenceWeights } from "./rank";
export { REFERENCES } from "./data";
export { buildSession } from "./game";
export type { Round } from "./game";
export { buildLearnSession } from "./learn";
export type { LearnRound } from "./learn";
export {
  loadProfile,
  saveProfile,
  recordRound,
  preferenceWeights,
  categoryBreakdown,
  listProfileNames,
  recordLearnRound,
  learnAccuracy,
} from "./profile";
export type { Profile, LearnStats } from "./profile";

/**
 * Public entry point — pure function, no side effects, no I/O. This is the whole
 * surface a future embed/widget/SDK would call. `weights` (from a local profile
 * built in Play mode) personalizes ranking; omit for neutral (1.0) ranking.
 */
export function translate(value: number, unit: Unit, weights?: PreferenceWeights): TranslationResult {
  const meters = toMeters(value, unit);
  const comparisons = rankComparisons(meters, REFERENCES, 3, weights);
  return { meters, inputValue: value, inputUnit: unit, comparisons };
}

export function counterpart(value: number, unit: Unit): { value: number; unit: Unit } {
  const meters = toMeters(value, unit);
  const cUnit = counterpartUnit(unit);
  return { value: fromMeters(meters, cUnit), unit: cUnit };
}

export { formatComparison, formatConversionValue };
export { allConversions };
export type { UnitConversion };
