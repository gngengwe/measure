import { describe, expect, it, beforeEach } from "vitest";
import { loadProfile, recordRound, preferenceWeights, categoryBreakdown } from "../src/core/profile";
import { buildSession } from "../src/core/game";

// jsdom provides localStorage in the vitest environment config below.

describe("profile + preference weighting", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stays neutral until a category has enough samples", () => {
    let profile = loadProfile("Alex");
    profile = recordRound(profile, ["vehicle", "standardized"], "vehicle");
    const weights = preferenceWeights(profile);
    expect(weights.vehicle).toBeUndefined(); // only 1 sample, below MIN_SAMPLE
  });

  it("weights a consistently-picked category above 1.0 once it has enough samples", () => {
    let profile = loadProfile("Alex");
    for (let i = 0; i < 5; i++) {
      profile = recordRound(profile, ["vehicle", "standardized"], "vehicle");
    }
    const weights = preferenceWeights(profile);
    expect(weights.vehicle).toBeGreaterThan(1.0);
    expect(weights.standardized).toBeLessThan(1.0);
  });

  it("persists across loadProfile calls (localStorage round-trip)", () => {
    let profile = loadProfile("Sam");
    profile = recordRound(profile, ["embodied", "everyday"], "embodied");
    const reloaded = loadProfile("Sam");
    expect(reloaded.roundsPlayed).toBe(1);
    expect(reloaded.stats.embodied.picked).toBe(1);
  });

  it("categoryBreakdown only includes categories that were actually shown", () => {
    let profile = loadProfile("Jo");
    profile = recordRound(profile, ["vehicle"], "vehicle");
    const breakdown = categoryBreakdown(profile);
    expect(breakdown.every((b) => b.shown > 0)).toBe(true);
    expect(breakdown.find((b) => b.category === "landmark")).toBeUndefined();
  });
});

describe("buildSession", () => {
  it("produces the requested round count with at least 2 options each", () => {
    const session = buildSession(20);
    expect(session.length).toBe(20);
    for (const round of session) {
      expect(round.options.length).toBeGreaterThanOrEqual(2);
    }
  });
});
