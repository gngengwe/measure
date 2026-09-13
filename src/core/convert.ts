import type { Unit } from "./types";

// meters per unit
const UNIT_TO_METERS: Record<Unit, number> = {
  in: 0.0254,
  ft: 0.3048,
  yd: 0.9144,
  mi: 1609.344,
  cm: 0.01,
  m: 1,
  km: 1000,
};

export function toMeters(value: number, unit: Unit): number {
  return value * UNIT_TO_METERS[unit];
}

export function fromMeters(meters: number, unit: Unit): number {
  return meters / UNIT_TO_METERS[unit];
}

/** Metric/imperial counterpart shown alongside the entered value. */
export function counterpartUnit(unit: Unit): Unit {
  const imperial: Unit[] = ["in", "ft", "yd", "mi"];
  const isImperial = imperial.includes(unit);
  if (!isImperial) {
    // pick the imperial unit that best fits the metric input's scale
    return "ft";
  }
  return "m";
}
