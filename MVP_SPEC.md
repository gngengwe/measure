# NGenWay Measure — v0.1 MVP Spec

## Scope
Pure translator. No accounts, no persistence, no feedback capture, no learning mode.
Input a distance → output 3 ranked, distinct-category comparisons + the raw measurement.

## Platform
Static TypeScript web app / PWA. No backend. Deployable as a static site.

## Input
- Number + unit picker: `ft`, `yd`, `mi`, `in`, `m`, `cm`, `km`
- Live: results update as the number is typed (debounced ~150ms) or the unit is changed —
  no submit button. Revised after initial v0.1 felt too form-like/manual in first review.
- Quick-pick chips for common distances (10ft/20ft/50ft/100ft/100yd/500ft/1mi) let a user
  explore with zero typing; tapping one fills the inputs and shows the result immediately.
- No autocomplete/voice in v0.1.

## Output
- Always echo the parsed input in both the entered unit and its metric/imperial counterpart
  (e.g. `100 ft (≈30.5 m)`).
- Exactly 3 comparisons, each from a **distinct category** (see categories below).
- Each comparison line: `≈ {multiplier} {reference name}` e.g. `≈ 6–7 car lengths`.
- A shareable result URL: `measure.ngengwe.com/?d=100&u=ft` (query-param driven, so the
  result screen is fully derivable from the URL — this is what makes sharing free to add).
- **On-demand full conversion table** (v0.1.2 addition, from tester feedback): a "Show exact
  conversions" toggle beneath the comparisons reveals the value converted into all 7 units
  (in, ft, yd, mi, cm, m, km), via `allConversions()`/`formatConversionValue()` in
  `src/core/convert.ts` and `format.ts`. Collapsed by default — testers wanted the analogies
  to stay the headline, with exact numbers available but not forced on them. The open/closed
  state persists while browsing Translate (chips, typing) but resets on mode switch/reload.

## Data model

```ts
type Category = "standardized" | "vehicle" | "embodied" | "everyday" | "landmark";

interface ReferenceObject {
  id: string;
  name: string;              // display name, e.g. "basketball court (length)"
  category: Category;
  canonicalLength: number;   // meters, single source of truth
  variability: "low" | "medium" | "high"; // how much real-world instances vary
  minUsefulRatio: number;    // e.g. 0.5  — below this, comparison reads as awkward
  maxUsefulRatio: number;    // e.g. 8    — above this, comparison reads as awkward
  source: string;            // provenance note, e.g. "FIBA court length, standardized"
  locale?: string;           // optional, e.g. "US" if not globally applicable
  countable?: boolean;       // true for "steps"/"minutes"-style references — see note below
  familiarity: number;       // 0-1, hand-set: general-public recognizability as a size ref
}

interface Comparison {
  reference: ReferenceObject;
  multiplier: number;        // targetLength / canonicalLength
  score: number;              // ranking output, 0–1
}
```

## Ranking algorithm

For a target distance `d` (meters), for every reference object `r`:

```
ratio = d / r.canonicalLength

# 1. scale fit — is the ratio inside the object's useful range at all?
if ratio < r.minUsefulRatio or ratio > r.maxUsefulRatio:
    scaleFit = 0   # disqualifying, not just penalized
else:
    scaleFit = 1

# 2. ratio simplicity — reward ratios close to cognitively clean values
cleanValues = [0.5, 1, 1.5, 2, 3, 4, 5, 7, 10]
ratioSimplicity = max(1 - (abs(ratio - c) / c) for c in cleanValues if c is nearest) 
# implementation: find nearest cleanValue, score = 1 - min(1, abs(ratio-nearest)/nearest)

# 3. reliability — standardized objects score higher than high-variance ones
reliability = { low: 1.0, medium: 0.7, high: 0.4 }[r.variability]

# 4. familiarity — per-reference weight (0-1), hand-set in the seed dataset for v0.1.
# NOT derived from category: category is a diversity bucket only. A per-category
# default would rank a shipping container (technically standardized, low variance)
# above a basketball court for "100 ft," which is wrong — most people can picture a
# basketball court far more readily than a 20ft container. See REFERENCE_DATA.md.
familiarity = r.familiarity

# 5. userPreference — fixed at 1.0 for all references in v0.1 (no accounts/history)
userPreference = 1.0

score = scaleFit * ratioSimplicity * reliability * familiarity * userPreference
```

**Selection:** sort all non-disqualified (`scaleFit == 1`) references by `score` descending,
then greedily pick the top 3 **from distinct categories** (skip a candidate if its category
is already represented in the picks, to force variety — this directly encodes the
"3 deliberately different representations" decision).

**Fallback:** if fewer than 3 categories qualify at a given scale, show as many as qualify
(2 or even 1) rather than forcing an awkward comparison. Never show a comparison with
`ratio < 0.3` or `ratio > 15` even if nothing else qualifies — better to show fewer than
to show something absurd (this directly implements the "no 0.073 football fields, no 17.4
cars" rule from the research).

**Countable references (steps, walking-minutes):** unlike physical-object comparisons,
counting repetitions is itself intuitive ("40 steps," "5 minutes' walk" both read fine even
at high multipliers). References flagged `countable: true`:
- get an extended `maxUsefulRatio` (up to ~150 for steps, ~60 for walking-minutes) instead
  of the ~8–10 ceiling used for object comparisons
- use a coarser clean-value set for `ratioSimplicity` — `[5, 10, 15, 20, 25, 40, 50, 75, 100]`
  instead of the `[0.5, 1, 1.5, 2, 3, 4, 5, 7, 10]` set used for object comparisons
- are still subject to `scaleFit` disqualification below `minUsefulRatio` (e.g. "1 step" for
  a 2 ft distance is fine; "0.1 steps" is not)

## Copy rules
- Round multipliers to the nearest sensible unit: whole numbers ≥3, halves below that
  (e.g. "≈ 1½ basketball courts", never "≈ 1.47 basketball courts").
- Always use "≈" not "=".
- Never state a reference as exact; `variability: high` references get a qualifier in copy,
  e.g. "≈ about 7 car lengths (car sizes vary)".

## Play mode (v0.1.1 addition)

**Profile:** `{ name, roundsPlayed, stats: Record<Category, {shown, picked}> }`, keyed by
name in `localStorage` under `ngenway-measure:profiles`. No accounts, no sync — this is a
local-device profile a person names themselves; multiple people can each have one on a
shared device (see `src/core/profile.ts`).

**Session:** 10 rounds (dropped from an initial 20 after review felt like too long a commitment), each a random distance drawn from a curated pool spanning the
dataset's usable scale range (`src/core/game.ts`'s `DISTANCE_POOL` — not a raw continuous
random value, which would too often land in the thin-coverage gap noted in
`REFERENCE_DATA.md` and produce a round with <2 options). Each round's options are ranked
with **neutral** weighting (no `preferenceWeights` passed in) — the game exists to discover
preference, so showing already-personalized options would contaminate the discovery.

**Recording:** on each pick, every category *shown* that round gets `shown += 1`, and the
picked category gets `picked += 1`. This is what lets `preferenceWeights()` compute a real
pick-rate per category, not just a count of picks.

**Weighting formula** (`src/core/profile.ts` `preferenceWeights`): a category stays neutral
(no entry, i.e. multiplier 1.0) until it's been shown at least 3 times (`MIN_SAMPLE`);
once it has, `weight = 0.7 + 0.6 * pickRate`. This keeps the personalization nudge in a
0.7-1.3 band — noticeable, but never able to override `scaleFit`/`ratioSimplicity`
disqualification on its own. The formula is a first-pass editorial choice, not derived from
data — same caveat as the dataset's familiarity values.

**Translate integration:** once a profile exists (played at least one round), Translate
mode passes that profile's `preferenceWeights()` into `translate()` and shows a
"Personalized for {name}" note whenever at least one category has enough samples to be
weighted.

## Learn mode (v0.1.3 addition)

**Round generation** (`src/core/learn.ts`): a target distance in feet is drawn from a
curated pool (`DISTANCE_POOL_FT`, 10-1000ft). The clue is the single top-ranked *neutral*
comparison for that distance from the same `rankComparisons()`/`formatComparison()`
pipeline Translate uses — so the quiz never shows content that could contradict what
Translate would say for the same number. 3 distractor distances are drawn from the same
pool, preferring ones within roughly 0.3x-3.5x of the target so choices stay plausible
rather than trivially eliminable; falls back to any other pool value if fewer than 3
plausible ones exist (this is why 750 was added to the pool alongside 500/1000 — the top
of the range needs same-order-of-magnitude neighbors too).

**Session:** 10 rounds, no target distance repeats within a session (`shuffle()` over the
pool, now factored into `src/core/util.ts` and shared with Play mode's `game.ts`).

**Scoring:** per-profile `learn: { played, correct }` on the existing `Profile` type
(`src/core/profile.ts`). `recordLearnRound()` updates it; `learnAccuracy()` returns
`correct/played`, or `null` before any rounds are played. Profiles saved before this field
existed are backfilled with `{ played: 0, correct: 0 }` in `loadProfile()` rather than
crashing.

**Feedback:** on answer, the picked button turns green (correct) or terracotta
(incorrect); if incorrect, the actually-correct option also turns green so the right
answer is visible before auto-advancing (~1.3s, longer than Play mode's ~350ms since
there's more to read). Session summary shows this session's score plus lifetime accuracy;
confetti only at 70%+ session accuracy (unlike Play mode, which always confettis — Learn
mode's is meant to feel earned, not automatic).

## Explicit non-goals for v0.1
See `PRODUCT.md`.
