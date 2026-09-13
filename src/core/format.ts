import type { Comparison } from "./types";

const QUALIFIER_BY_CATEGORY: Record<string, string> = {
  vehicle: "sizes vary",
  embodied: "varies by person",
  landmark: "varies a lot by city",
};

function roundMultiplier(ratio: number, countable: boolean | undefined): number {
  if (countable) return Math.round(ratio);
  if (ratio >= 3) return Math.round(ratio);
  return Math.round(ratio * 2) / 2;
}

function formatMultiplier(n: number): string {
  const whole = Math.floor(n);
  const frac = n - whole;
  if (frac === 0.5) return whole === 0 ? "½" : `${whole}½`;
  return String(n);
}

export function formatComparison(comparison: Comparison): string {
  const { reference, ratio } = comparison;
  const rounded = roundMultiplier(ratio, reference.countable);
  const isPlural = rounded !== 1;
  const name = isPlural ? reference.pluralName : reference.name;

  let line = `≈ ${formatMultiplier(rounded)} ${name}`;

  if (reference.variability === "medium" || reference.variability === "high") {
    const qualifier = QUALIFIER_BY_CATEGORY[reference.category] ?? "varies";
    line += ` (${qualifier})`;
  }

  return line;
}
