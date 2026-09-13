# Gemini image prompts for NGenWay Measure

Generate each of these in the Gemini app (gemini.google.com or the mobile app), download
the result, and send me the files — I'll drop them into `public/images/` under the exact
filename listed. The code already points at these paths with a graceful fallback (emoji
icons, no mascot), so nothing breaks in the meantime and nothing else needs to change once
you hand them over — just tell me the filenames if you don't rename them to match.

**Shared style prefix** — paste this before each individual prompt so the set looks
cohesive (Gemini doesn't remember style across separate chats/generations):

> Flat vector illustration, minimalist, thick clean rounded outlines, no gradients, no
> drop shadows, no text or lettering anywhere in the image. Color palette limited to forest
> green (#1f6f54), mint green (#4cc9a0), warm amber (#f4b942), terracotta (#e0663e), and
> charcoal (#1c1c1a) linework — plus white or transparent background. Centered composition,
> square 1:1 aspect ratio, friendly and approachable, works recognizably even at very small
> (22px) icon size.

## 1. `mascot.png` — header icon
Displayed at 36x36px next to the wordmark on every screen.

> [style prefix] A cute, simple mascot character built from a measuring tape or ruler —
> friendly rounded eyes, small smile, maybe the tape measure curls into a body shape.
> Square format, character centered and filling most of the frame, no background clutter.

## 2. `mascot-celebrate.png` — completion screen
Displayed at 96x96px on the "you finished the game" summary screen.

> [style prefix] The same measuring-tape mascot from before, now celebrating: arms raised,
> holding the ruler/tape up like a trophy, small stars or motion lines around it to suggest
> excitement. Same character design and color palette as the header mascot — this should
> look like the same character, just happier.

## 3-7. Category icons
Each displayed small (~22px) next to a comparison option or breakdown bar. Keep these
simple single-subject icons, not scenes — they need to read instantly at tiny size.

- **`icon-standardized.png`** (courts, doors, containers): > [style prefix] A simple
  basketball hoop and backboard, side view, icon style.
- **`icon-vehicle.png`** (cars, buses, trucks): > [style prefix] A simple car, side-profile
  silhouette, icon style.
- **`icon-embodied.png`** (height, steps, body): > [style prefix] A simple standing person
  silhouette with arms slightly out, icon style.
- **`icon-everyday.png`** (paper, phone, bed): > [style prefix] A simple smartphone, front
  view, icon style.
- **`icon-landmark.png`** (city blocks): > [style prefix] A simple city skyline made of 3-4
  simple building silhouettes, icon style.

## Format notes
- Square images, any resolution Gemini gives you (512px+ is plenty — the code displays
  these small, so it downscales fine; don't worry about matching exact pixel sizes).
- PNG preferred. If Gemini can't produce a transparent background, a plain white or
  off-white (#fafaf9) background is fine too — it'll blend with the app's light background;
  it just won't blend as cleanly in dark mode, which is an acceptable tradeoff for now.
- Send whichever ones you get — this doesn't have to happen all at once, and the emoji
  fallback covers anything not yet generated.
