import { REFERENCES } from "./data";
import { toMeters, fromMeters, counterpartUnit } from "./convert";
import { rankComparisons } from "./rank";
import { formatComparison } from "./format";
import type { TranslationResult, Unit } from "./types";

export type { ReferenceObject, Comparison, TranslationResult, Unit, Category } from "./types";
export { REFERENCES } from "./data";

/**
 * Public entry point — pure function, no side effects, no I/O. This is the whole
 * surface a future embed/widget/SDK would call.
 */
export function translate(value: number, unit: Unit): TranslationResult {
  const meters = toMeters(value, unit);
  const comparisons = rankComparisons(meters, REFERENCES, 3);
  return { meters, inputValue: value, inputUnit: unit, comparisons };
}

export function counterpart(value: number, unit: Unit): { value: number; unit: Unit } {
  const meters = toMeters(value, unit);
  const cUnit = counterpartUnit(unit);
  return { value: fromMeters(meters, cUnit), unit: cUnit };
}

export { formatComparison };
