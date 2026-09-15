# NGenWay Measure

[![CI](https://github.com/gngengwe/measure/actions/workflows/ci.yml/badge.svg)](https://github.com/gngengwe/measure/actions/workflows/ci.yml)

Translates abstract distances into familiar, intuitive references — "100 ft" becomes
"≈ 1 basketball court / ≈ 7 car lengths / ≈ 41 steps."

v0.1 scope, decisions, and rationale: see `PRODUCT.md`, `MVP_SPEC.md`,
`REFERENCE_DATA.md`, `ACCEPTANCE_TESTS.md`. Original exploratory chat: `context/full-chat.md`
(context only — the docs above are authoritative where they conflict).

## Develop

```
npm install
npm run dev        # http://localhost:5173
npm test           # vitest — structural acceptance criteria + golden regression case
npm run typecheck  # tsc --noEmit
npm run build      # static output to dist/
```

CI (`.github/workflows/ci.yml`) runs typecheck + test + build on every push to `master`.

## Architecture

Core translation logic (`src/core/`) is a pure, dependency-free TypeScript module with no
DOM/UI coupling — deliberately isolated so it can be lifted into a widget/embed/SDK later
without a rewrite (see the positioning decision in `PRODUCT.md`). `src/main.ts` is the only
file that touches the DOM.
