# NGenWay Measure — Seed Reference Dataset (v0.1)

24 references, ~2 in through ~1 mile. Every dimension below is a well-established
standard or commonly-cited average — treat as **directionally correct for a demo**, not
as verified-against-primary-source for production/legal use. Flag any figure you want
double-checked against a primary standard before shipping publicly.

Legend: **var** = variability (low/med/high) → drives `reliability`. **fam** = familiarity
(0-1, hand-set general-public recognizability as a size reference — see MVP_SPEC.md for
why this is per-item, not per-category).

| id | name | category | length (m) | var | fam | min–max ratio | countable | source / note |
|---|---|---|---|---|---|---|---|---|---|
| credit_card | credit card | standardized | 0.0856 | low | 0.85 | 0.3–10 | | ISO/IEC 7810 ID-1 card, 85.60mm |
| smartphone | smartphone | everyday | 0.150 | med | 0.85 | 0.3–10 | | typical modern phone length (~5.5–6.5in) |
| letter_paper | sheet of paper (long edge) | standardized | 0.2794 | low | 0.80 | 0.3–10 | | US Letter 11in long edge (A4 close: 297mm) |
| adult_hand | adult hand length | embodied | 0.18 | med | 0.70 | 0.3–10 | | wrist-to-fingertip, anthropometric average |
| adult_foot | adult foot/shoe length | embodied | 0.26 | med | 0.60 | 0.3–10 | | average adult foot length |
| door_width | door width | standardized | 0.86 | med | 0.75 | 0.3–10 | | typical interior/exterior door, 32–36in |
| arm_reach | arm's reach | embodied | 0.65 | med | 0.55 | 0.3–10 | | average forearm+hand reach segment |
| adult_height | adult height | embodied | 1.70 | med | 0.85 | 0.3–10 | | global average adult height (varies by region/sex) |
| door_height | door height | standardized | 2.03 | low | 0.70 | 0.3–10 | | standard residential door height, 80in |
| queen_bed | queen bed length | everyday | 2.03 | low | 0.65 | 0.3–10 | | industry-standard queen mattress, 80in |
| walking_step | walking step | embodied | 0.75 | high | 0.75 | 0.3–150 | ✓ | average adult stride length (~2.5ft; varies by height/sex) |
| parking_space | parking space length | standardized | 5.50 | med | 0.60 | 0.3–10 | | typical US stall length, 18ft |
| sedan | sedan car length | vehicle | 4.50 | med | 0.90 | 0.3–10 | | average compact/mid-size sedan |
| suv | SUV length | vehicle | 4.90 | med | 0.75 | 0.3–10 | | average SUV |
| shipping_container | shipping container (20ft) | standardized | 6.10 | low | 0.40 | 0.3–10 | | ISO 668 20ft container, 19'10.5" — standardized but not intuitively pictured |
| school_bus | school bus length | vehicle | 12.2 | med | 0.85 | 0.3–10 | US | typical US school bus, ~40ft — iconic, widely recognized via media even outside US |
| semi_truck | semi-truck + trailer | vehicle | 22.0 | med | 0.55 | 0.3–10 | US | tractor + 53ft trailer, legal length varies by state |
| bowling_lane | bowling lane | standardized | 18.29 | low | 0.35 | 0.3–10 | | USBC/WTBA regulation, foul line to head pin, 60ft |
| volleyball_court | volleyball court length | standardized | 18.0 | low | 0.40 | 0.3–10 | | FIVB regulation |
| tennis_court | tennis court length | standardized | 23.77 | low | 0.55 | 0.3–10 | | ITF regulation, 78ft |
| basketball_court_fiba | basketball court (international) | standardized | 28.0 | low | 0.85 | 0.3–10 | | FIBA regulation |
| basketball_court_nba | basketball court (NBA) | standardized | 28.65 | low | 0.85 | 0.3–10 | US | NBA regulation, 94ft |
| olympic_pool | Olympic swimming pool length | standardized | 50.0 | low | 0.60 | 0.3–10 | | FINA long-course regulation |
| soccer_pitch | soccer/football pitch length | standardized | 105.0 | med | 0.85 | 0.3–10 | | FIFA-recommended for international matches; 100–110m allowed. Consider raising familiarity further for football-first locales (e.g. CDMX test group) once locale weighting exists |
| football_field | American football field | standardized | 109.7 | low | 0.75 | 0.3–10 | US | NFL/NCAA, includes end zones, 120yd |
| city_block | city block | landmark | 100.0 | high | 0.70 | 0.3–10 | | rough global typical — varies enormously by city; high caveat |
| walking_minute | 1 minute of walking | embodied | 80.0 | high | 0.60 | 0.3–60 | ✓ | ~5km/h average walking pace |

Familiarity values are a first-pass editorial judgment call, not measured data — expect to
retune after real user feedback (this is exactly what the v0.2 "which helped most" signal
is for).

## Known gap — flagged, not solved in v0.1
No reference above ~500m/0.3mi besides `walking_minute` and repeated `city_block`. The
original research scope wanted coverage to 1 mile; v0.1 will feel thin for 0.5–1mi inputs
(likely falls back to "N city blocks" or "N minutes walking," which is honest but weaker).
Acceptable for v0.1 — do not backfill with invented "familiar drive" style references (too
unreliable per the ranking rules); revisit if user testing shows 0.5mi+ inputs are common.

## Cultural-fit caveat (from the CDMX test-audience blind spot)
`school_bus`, `football_field`, `basketball_court_nba` are US-flavored. Keep them in the
dataset (they're broadly recognized even outside the US via media), but when reading CDMX
test feedback, watch specifically for confusion on these three before concluding the whole
translation concept failed.
