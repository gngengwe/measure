import { describe, expect, it } from "vitest";
import { translate, formatComparison } from "../src/core";
import type { Unit } from "../src/core";

describe("golden case: 100 ft (ACCEPTANCE_TESTS.md worked example)", () => {
  it("returns basketball court, car lengths, and steps in that order", () => {
    const result = translate(100, "ft");
    const lines = result.comparisons.map(formatComparison);

    expect(lines[0]).toContain("basketball court");
    expect(lines[1]).toContain("car length");
    expect(lines[2]).toContain("step");
  });

  it("does not let shipping container outrank basketball court", () => {
    const result = translate(100, "ft");
    const ids = result.comparisons.map((c) => c.reference.id);
    expect(ids[0]).toBe("basketball_court_nba");
    expect(ids).not.toContain("shipping_container");
  });
});

describe("structural acceptance criteria across the full test corpus", () => {
  const corpus: Array<{ value: number; unit: Unit }> = [
    { value: 6, unit: "in" },
    { value: 3, unit: "ft" },
    { value: 10, unit: "ft" },
    { value: 20, unit: "ft" },
    { value: 50, unit: "ft" },
    { value: 100, unit: "ft" },
    { value: 100, unit: "yd" },
    { value: 500, unit: "ft" },
    { value: 0.25, unit: "mi" },
    { value: 1, unit: "mi" },
  ];

  for (const { value, unit } of corpus) {
    it(`${value} ${unit}: distinct categories, sane ratios`, () => {
      const result = translate(value, unit);

      expect(result.comparisons.length).toBeLessThanOrEqual(3);

      const categories = result.comparisons.map((c) => c.reference.category);
      expect(new Set(categories).size).toBe(categories.length);

      for (const c of result.comparisons) {
        const ceiling = c.reference.countable ? c.reference.maxUsefulRatio : 15;
        expect(c.ratio).toBeGreaterThanOrEqual(0.3);
        expect(c.ratio).toBeLessThanOrEqual(ceiling);
      }
    });
  }
});
