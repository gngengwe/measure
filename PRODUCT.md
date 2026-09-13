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

## v0.1 non-goals
- Native app
- AR measurement / camera
- Live navigation integration
- Driving interaction
- Accounts / cloud personalization / backend
- "Which helped most" feedback capture (deferred to v0.2)
- Learning/quiz mode (deferred to v0.3)
- Any measurement category other than distance
- Novelty analogy generation (e.g. "38 baguettes")

## Source
Full exploratory chat preserved at `context/full-chat.md` (originally
`NGenWay_Measure_full_chat.md`) — context only, not a spec. Where this file conflicts
with the chat, this file controls.
