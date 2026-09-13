# NGenWay Measure — v0.1 MVP Spec

## Scope
Pure translator. No accounts, no persistence, no feedback capture, no learning mode.
Input a distance → output 3 ranked, distinct-category comparisons + the raw measurement.

## Platform
Static TypeScript web app / PWA. No backend. Deployable as a static site.

## Input
- Number + unit picker: `ft`, `yd`, `mi`, `in`, `m`, `cm`, `km`
- Single field, single submit (button or Enter) — no autocomplete/voice in v0.1

## Output
- Always echo the parsed input in both the entered unit and its metric/imperial counterpart
  (e.g. `100 ft (≈30.5 m)`).
- Exactly 3 comparisons, each from a **distinct category** (see categories below).
- Each comparison line: `≈ {multiplier} {reference name}` e.g. `≈ 6–7 car lengths`.
- A shareable result URL: `measure.ngengwe.com/?d=100&u=ft` (query-param driven, so the
  result screen is fully derivable from the URL — this is what makes sharing free to add).

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

## Explicit non-goals for v0.1
See `PRODUCT.md`.
