import { describe, expect, it, beforeEach } from "vitest";
import { buildLearnSession } from "../src/core/learn";
import { loadProfile, recordLearnRound, learnAccuracy } from "../src/core/profile";

describe("buildLearnSession", () => {
  it("produces the requested round count with 4 distinct options each", () => {
    const session = buildLearnSession(10);
    expect(session.length).toBe(10);
    for (const round of session) {
      expect(round.options.length).toBe(4);
      expect(new Set(round.options).size).toBe(4); // no duplicate options
      expect(round.options).toContain(round.targetFt);
      expect(round.clue.length).toBeGreaterThan(0);
    }
  });

  it("never repeats the same target distance within one session", () => {
    const session = buildLearnSession(10);
    const targets = session.map((r) => r.targetFt);
    expect(new Set(targets).size).toBe(targets.length);
  });
});

describe("Learn accuracy tracking", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("is null before any rounds are played", () => {
    const profile = loadProfile("Nia");
    expect(learnAccuracy(profile)).toBeNull();
  });

  it("computes accuracy from correct/played counts and persists it", () => {
    let profile = loadProfile("Nia");
    profile = recordLearnRound(profile, true);
    profile = recordLearnRound(profile, true);
    profile = recordLearnRound(profile, false);
    expect(learnAccuracy(profile)).toBeCloseTo(2 / 3, 5);

    const reloaded = loadProfile("Nia");
    expect(reloaded.learn.played).toBe(3);
    expect(reloaded.learn.correct).toBe(2);
  });

  it("backfills `learn` for a profile saved before this field existed", () => {
    localStorage.setItem(
      "ngenway-measure:profiles",
      JSON.stringify({
        OldProfile: {
          name: "OldProfile",
          roundsPlayed: 5,
          stats: {
            standardized: { shown: 2, picked: 1 },
            vehicle: { shown: 0, picked: 0 },
            embodied: { shown: 0, picked: 0 },
            everyday: { shown: 0, picked: 0 },
            landmark: { shown: 0, picked: 0 },
          },
          // no `learn` field -- simulates a profile saved before Learn mode existed
        },
      })
    );
    const profile = loadProfile("OldProfile");
    expect(profile.learn).toEqual({ played: 0, correct: 0 });
    expect(learnAccuracy(profile)).toBeNull();
  });
});
