# RV Selector Quiz — Flow Spec

Feature for the jayco.com redesign: an adaptive quiz that guides a shopper from "no idea where to start" to a specific model recommendation. Companion data file: `jayco-rv-models.json` (all 33 Jayco 2026 lines + scoring attributes). Keep recommendation logic reading from that JSON — do not hard-code model names in components.

## Parameters
- **Length:** 7–8 questions.
- **Outcome:** one best-fit model line + 2–3 alternates.
- **First fork:** motorized (drive your home) vs. towable (tow a camper). "Motorized vs. driveable" is the same thing; the real split is motorized vs. towable.

## Principles
1. Decide, don't quiz — ask about trips/life, infer the RV type. Never ask "Class A/B/C?" up front.
2. One big fork, early — resolve motorized vs. towable in Q1, with a helper for the undecided.
3. Adaptive, not linear — branch on the fork, converge on shared questions. Each user sees only 7–8 screens.
4. Always show a way out — "I already know what I want" → catalog.
5. Recommend with humility — one primary + 2–3 alternates.

## Screen-by-screen flow

**Landing** — "Find your perfect Jayco." Two CTAs: `Take the quiz` and `I already know what I want` (→ catalog).

**Q1 — Drive it or tow it?** Copy: "How do you picture your ideal trip?"
- Drive my home on wheels → `family = motorized`
- Tow a camper behind me → `family = towable`
- Not sure → decision helper

**Helper (only if "not sure")** — resolve with a lean score.
- H1 "Own a truck or capable SUV?" → pickup `tow+2`, SUV `tow+1`, no/car `drive+2`
- H2 "At camp, one vehicle or two?" → all-in-one `drive+2`, keep daily driver free `tow+2`, save money up front `tow+1`
- Resolve: higher score wins the branch. **Tie → towable** (lower entry cost, broadest lineup); surface a "prefer to drive instead?" toggle on the result.

### Motorized branch
**MQ — size & driving comfort** "How big a vehicle are you comfortable driving?"
- Nimble like a van → `class_b`
- Mid-size, roomier → `class_c`
- Go big → `class_a`
- (If later `sleeps 5+` conflicts with `class_b`, override toward `class_c` and explain — a van sleeps 2–4.)

### Towable branch
**TQ1 — tow vehicle** "What will you tow it with?"
- SUV/crossover → `travel_trailer`
- Half-ton pickup → `travel_trailer` (+ entry `fifth_wheel` eligible)
- ¾-ton+ truck → `fifth_wheel` eligible
- Not sure → treat as half-ton, favor lighter options

**TQ2 — toys?** "Need to bring ATVs/bikes/gear?"
- Yes → `toy_hauler` (Seismic). Half-ton → Seismic Travel Trailer; ¾-ton+ → Seismic Fifth Wheel.
- Maybe → toy hauler or large TT
- No → standard floorplan

### Shared profiling (all users)
- **S1 sleeping capacity** — 1–2 / 3–4 / 5+ → filters `sleeps` range
- **S2 camp style** — off-grid / mixed / hookups → matches `campStyleFit`
- **S3 cadence** — weekend / extended / full-time → matches `cadenceFit`
- **S4 budget** — value / mid / premium → matches `tier`
- Optional **skippable** email capture before the result. Never gate the result behind a required form.

**Result** — hero match + 3 "why this fits" bullets echoing their answers + 2–3 alternate compare cards + next steps (View floorplans / Build & price / Find a dealer / Email results / Retake).

## Scoring
1. Branch selects the **type** (hard filter on `type` / `family`, plus tow-vehicle gate for fifth wheels).
2. Filter candidates whose `sleeps` range covers S1.
3. Score remaining by tier match (S4), `campStyleFit` (S2), `cadenceFit` (S3). Weight tier highest, then capacity fit, then camp/cadence as tie-breakers.
4. Primary = top score. Alternates = nearest lines one tier up and one down within the same type (plus one adjacent type where relevant, e.g. a large TT next to an entry fifth wheel).
5. Keep weights in a config object so marketing can tune without a redesign.

Special cases: `toyHauler = true` only surfaces when TQ2 = yes. `destination_trailer` (Jay Flight Bungalow) only surfaces when S3 = full-time/seasonal on the towable branch.

## Open items
- UX-writing pass on copy (current copy is directional).
- Confirm line-level recommendations vs. category hand-off.
- Email capture: pre-result (skippable) vs. post-result only.
- Wire `jayco-rv-models.json` into the scoring module; consider sourcing it from the CMS so line changes don't need a deploy.
