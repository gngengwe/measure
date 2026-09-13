# Image briefs for NGenWay Measure

All seven assets are now generated and saved in `public/images/` under the filenames
below. The app uses them directly, with emoji fallbacks if a category image fails to load.
See [IMAGE_GENERATION.md](IMAGE_GENERATION.md) for the exact prompts used with the built-in
image generation tool. The original briefs below remain the design reference.

**Shared style prefix** — use this before each individual prompt so the set looks cohesive:

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
- Square images, 512px+ is plenty — the code displays
  these small, so it downscales fine; don't worry about matching exact pixel sizes.
- The installed assets are PNGs with actual alpha transparency so they blend with both
  light and dark backgrounds. Preserve that transparency when replacing them.
