# NGenWay Measure — Product

## Core proposition
NGenWay Measure makes abstract quantities intuitive by translating them into familiar,
contextual, and eventually personalized references.

## Problem
People can understand a measurement numerically ("100 ft") without being able to
perceive it intuitively (what 100 ft looks/feels like).

## Positioning decision
Measure is being built as a **demo / proof-of-concept**, not a standalone consumer
business. The defensible asset is the reference dataset + ranking algorithm + UX
pattern — designed so the core translation logic can later be embedded/licensed into
higher-frequency contexts (navigation, cooking, real estate, fitness, AR tools) rather
than relying on Measure itself to sustain daily-active usage.

Practical implication: core logic lives in an isolated module, independent of UI framework
and app shell, so it can be lifted into a widget/SDK later without a rewrite.

## Product progression
1. **Translator** — convert a distance into intuitive references. (v0.1)
2. **Teacher** — train users to estimate and internalize distances. (later)
3. **Perceptual layer** — context/personalization/navigation/AR. (future, not scoped)

## Governing principle
Don't merely convert the measurement. Make the quantity perceptible enough to support
judgment and action.

## v0.1.1 addition: Play mode (preference-discovery game)
Added after initial v0.1 review felt too form-like. A second mode alongside Translate:
enter a name (local profile, not an account), answer 10 rounds of "which comparison
makes sense to you" (neutral ranking, not yet personalized — the game must not be
shaped by the preference it's trying to discover), see a category breakdown, then
"play 10 more" or move to Translate, which is now weighted by what was learned.
This pulls the "which helped most" feedback loop and local personalization forward
from their originally-deferred v0.2 slot — see MVP_SPEC.md for the mechanics
(profile storage, weighting formula, round generation). Still no backend, no
accounts, no cross-device sync: everything lives in that browser's localStorage.

## v0.1.3 addition: Learn mode (Stage 2 "Teacher")
Added once Translate + Play were testing well. A third mode: enter/pick a name, see a
single comparison clue (the same top-ranked neutral comparison Translate would show —
no separately-authored quiz content), guess the real distance from 4 multiple-choice
options, get immediate right/wrong feedback with the correct answer revealed, 10 rounds
per session. Lifetime accuracy persists per local profile and is shown on the name
screen and after each session — the point is to make "am I getting better at this
without the app" visible, which is the product's stated differentiator. Confetti only
fires at 70%+ session accuracy (Play mode's always fires — Learn mode's is earned).

Deliberately the *inverse* of Translate (comparison → number, instead of number →
comparison) rather than a photo-based "how far is it" guess (the original mockup 3 used
a photo backdrop, which needs camera/AR-adjacent work still out of scope). See
`MVP_SPEC.md` for the mechanics.

## v0.1 non-goals
- Native app
- AR measurement / camera
- Live navigation integration
- Driving interaction
- Accounts / cloud personalization / backend (local-only personalization is now in
  scope via Play mode, above — this excludes only server-side/cross-device accounts)
- Photo/scene-based distance guessing (mockup 3's original camera-backdrop version —
  Learn mode above covers the same "guess the distance" goal without it)
- Any measurement category other than distance
- Novelty analogy generation (e.g. "38 baguettes")

## Source
Full exploratory chat preserved at `context/full-chat.md` (originally
`NGenWay_Measure_full_chat.md`) — context only, not a spec. Where this file conflicts
with the chat, this file controls.
