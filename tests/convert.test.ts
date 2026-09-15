import { describe, expect, it } from "vitest";
import { allConversions } from "../src/core/convert";
import { formatConversionValue } from "../src/core/format";

describe("allConversions", () => {
  it("returns all 7 units for a 100 ft input, in the fixed display order", () => {
    const result = allConversions(100, "ft");
    expect(result.map((c) => c.unit)).toEqual(["in", "ft", "yd", "mi", "cm", "m", "km"]);
  });

  it("round-trips the input unit back to the original value", () => {
    const result = allConversions(100, "ft");
    const ft = result.find((c) => c.unit === "ft")!;
    expect(ft.value).toBeCloseTo(100, 6);
  });

  it("matches known conversions for 100 ft", () => {
    const result = allConversions(100, "ft");
    const byUnit = Object.fromEntries(result.map((c) => [c.unit, c.value]));
    expect(byUnit.m).toBeCloseTo(30.48, 2);
    expect(byUnit.yd).toBeCloseTo(33.333, 2);
    expect(byUnit.in).toBeCloseTo(1200, 2);
    expect(byUnit.km).toBeCloseTo(0.03048, 5);
  });
});

describe("formatConversionValue", () => {
  it("uses whole numbers at 100+", () => {
    expect(formatConversionValue(1200)).toBe("1,200");
  });

  it("uses 1 decimal at 10-99", () => {
    expect(formatConversionValue(30.48)).toBe("30.5");
  });

  it("uses 2 decimals at 1-9", () => {
    expect(formatConversionValue(3.048)).toBe("3.05");
  });

  it("uses 3 decimals below 1 so small units like miles stay readable", () => {
    expect(formatConversionValue(0.030_48)).toBe("0.03");
  });

  it("strips trailing zeros rather than padding", () => {
    expect(formatConversionValue(100)).toBe("100");
    expect(formatConversionValue(2)).toBe("2");
  });
});
