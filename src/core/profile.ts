import type { Category } from "./types";
import type { PreferenceWeights } from "./rank";

const CATEGORIES: Category[] = ["standardized", "vehicle", "embodied", "everyday", "landmark"];
const STORAGE_KEY = "ngenway-measure:profiles";
const MIN_SAMPLE = 3; // don't weight a category until it's been shown at least this many times

interface CategoryStats {
  shown: number;
  picked: number;
}

export interface Profile {
  name: string;
  roundsPlayed: number;
  stats: Record<Category, CategoryStats>;
}

function emptyStats(): Record<Category, CategoryStats> {
  const stats = {} as Record<Category, CategoryStats>;
  for (const c of CATEGORIES) stats[c] = { shown: 0, picked: 0 };
  return stats;
}

function readStore(): Record<string, Profile> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeStore(store: Record<string, Profile>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // localStorage unavailable (private mode, disabled, quota) — game still works
    // for the session, it just won't persist. Not worth surfacing as an error.
  }
}

export function listProfileNames(): string[] {
  return Object.keys(readStore()).sort((a, b) => a.localeCompare(b));
}

export function loadProfile(name: string): Profile {
  const store = readStore();
  return store[name] ?? { name, roundsPlayed: 0, stats: emptyStats() };
}

export function saveProfile(profile: Profile): void {
  const store = readStore();
  store[profile.name] = profile;
  writeStore(store);
}

/** Record one round's outcome: which categories were offered, which one was picked. */
export function recordRound(
  profile: Profile,
  shownCategories: Category[],
  pickedCategory: Category
): Profile {
  const stats = { ...profile.stats };
  for (const c of shownCategories) {
    stats[c] = { ...stats[c], shown: stats[c].shown + 1 };
  }
  stats[pickedCategory] = { ...stats[pickedCategory], picked: stats[pickedCategory].picked + 1 };

  const updated: Profile = { ...profile, stats, roundsPlayed: profile.roundsPlayed + 1 };
  saveProfile(updated);
  return updated;
}

/**
 * Convert pick rate per category into a ranking weight. Neutral (1.0) until a
 * category has enough samples; otherwise scaled into a modest 0.7-1.3 band so
 * preference nudges results without letting it override scale-fit/simplicity.
 */
export function preferenceWeights(profile: Profile): PreferenceWeights {
  const weights: PreferenceWeights = {};
  for (const c of CATEGORIES) {
    const { shown, picked } = profile.stats[c];
    if (shown < MIN_SAMPLE) continue;
    const pickRate = picked / shown;
    weights[c] = 0.7 + 0.6 * pickRate;
  }
  return weights;
}

export function categoryBreakdown(profile: Profile): Array<{ category: Category; pickRate: number; shown: number }> {
  return CATEGORIES.map((category) => {
    const { shown, picked } = profile.stats[category];
    return { category, pickRate: shown > 0 ? picked / shown : 0, shown };
  })
    .filter((c) => c.shown > 0)
    .sort((a, b) => b.pickRate - a.pickRate);
}
