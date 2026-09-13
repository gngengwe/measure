import type { Category, Comparison, ReferenceObject } from "./types";

const CLEAN_VALUES = [0.5, 1, 1.5, 2, 3, 4, 5, 7, 10];
const COARSE_CLEAN_VALUES = [5, 10, 15, 20, 25, 40, 50, 75, 100];

const RELIABILITY_BY_VARIABILITY: Record<ReferenceObject["variability"], number> = {
  low: 1.0,
  medium: 0.7,
  high: 0.4,
};

function nearestClean(ratio: number, countable: boolean | undefined): number {
  const set = countable ? COARSE_CLEAN_VALUES : CLEAN_VALUES;
  return set.reduce((best, c) => (Math.abs(ratio - c) < Math.abs(ratio - best) ? c : best), set[0]);
}

function ratioSimplicity(ratio: number, countable: boolean | undefined): number {
  const nearest = nearestClean(ratio, countable);
  return Math.max(0, 1 - Math.min(1, Math.abs(ratio - nearest) / nearest));
}

function scoreReference(meters: number, ref: ReferenceObject): Comparison | null {
  const ratio = meters / ref.canonicalLength;

  // Hard absurdity floor/ceiling regardless of per-reference range.
  const absoluteMin = 0.3;
  const absoluteMax = ref.countable ? (ref.maxUsefulRatio === 60 ? 60 : 150) : 15;
  if (ratio < absoluteMin || ratio > absoluteMax) return null;

  if (ratio < ref.minUsefulRatio || ratio > ref.maxUsefulRatio) return null;

  const reliability = RELIABILITY_BY_VARIABILITY[ref.variability];
  const simplicity = ratioSimplicity(ratio, ref.countable);
  const score = simplicity * reliability * ref.familiarity;

  return { reference: ref, ratio, score };
}

/**
 * Rank all references for a target distance (meters) and pick up to `count`
 * comparisons from distinct categories, highest score first per category.
 */
export function rankComparisons(
  meters: number,
  references: ReferenceObject[],
  count = 3
): Comparison[] {
  const candidates = references
    .map((ref) => scoreReference(meters, ref))
    .filter((c): c is Comparison => c !== null)
    .sort((a, b) => b.score - a.score);

  const picked: Comparison[] = [];
  const usedCategories = new Set<Category>();

  for (const candidate of candidates) {
    if (picked.length >= count) break;
    if (usedCategories.has(candidate.reference.category)) continue;

    // Skip near-duplicate physical lengths even across categories — e.g. a door
    // height and a queen bed are both ~2.03m, and showing both wastes a slot
    // without adding any new intuition.
    const isNearDuplicateLength = picked.some(
      (p) =>
        Math.abs(p.reference.canonicalLength - candidate.reference.canonicalLength) /
          candidate.reference.canonicalLength <
        0.1
    );
    if (isNearDuplicateLength) continue;

    picked.push(candidate);
    usedCategories.add(candidate.reference.category);
  }

  return picked;
}
