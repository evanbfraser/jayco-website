---
name: Jayco
description: The Modern Outfitter — plain-spoken, sturdy, built for use, with photography doing the selling.
colors:
  jayco-blue: "#007AC2"
  jayco-blue-deep: "#005E96"
  jayco-blue-bright: "#0F90E0"
  ink: "#0F0B09"
  canvas: "#FBFCFE"
  surface: "#F4F2EF"
  bone: "#F5F2EE"
  dune: "#E8E4DE"
  text-strong: "#1A1410"
  text-muted: "#5C5652"
  hairline: "rgba(15,11,9,0.12)"
typography:
  display:
    fontFamily: "Host Grotesk, system-ui, sans-serif"
    fontSize: "clamp(5rem, 10vw, 11.5rem)"
    fontWeight: 900
    lineHeight: 0.9
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Host Grotesk, system-ui, sans-serif"
    fontSize: "clamp(2.4rem, 3.8vw, 3.8rem)"
    fontWeight: 800
    lineHeight: 0.98
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Host Grotesk, system-ui, sans-serif"
    fontSize: "1.6rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Host Grotesk, system-ui, sans-serif"
    fontSize: "clamp(0.92rem, 1.1vw, 1.05rem)"
    fontWeight: 400
    lineHeight: 1.78
    letterSpacing: "normal"
  label:
    fontFamily: "Host Grotesk, system-ui, sans-serif"
    fontSize: "0.68rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.22em"
rounded:
  pill: "50px"
  card: "20px"
  panel: "24px"
  feature: "32px"
  field: "14px"
  hairline-chip: "4px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "clamp(2rem, 3.5vw, 3.5rem)"
  lg: "clamp(4rem, 7vw, 7rem)"
  xl: "clamp(7rem, 13vw, 13rem)"
  gutter: "6vw"
components:
  button-primary:
    backgroundColor: "{colors.jayco-blue}"
    textColor: "#FFFFFF"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.9rem 2.2rem"
  button-primary-hover:
    backgroundColor: "{colors.jayco-blue-deep}"
    textColor: "#FFFFFF"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "#FFFFFF"
    rounded: "{rounded.pill}"
    padding: "0.88rem 2.2rem"
  button-secondary-light:
    backgroundColor: "transparent"
    textColor: "{colors.text-strong}"
    rounded: "{rounded.pill}"
    padding: "0.88rem 2.2rem"
  button-link:
    backgroundColor: "transparent"
    textColor: "{colors.jayco-blue}"
    padding: "0 0 2px 0"
  card-media:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
  panel-surface:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
    padding: "clamp(2.5rem, 4.5vw, 4.5rem) clamp(2rem, 3.4vw, 3.5rem)"
  control-round:
    backgroundColor: "rgba(255,255,255,0.92)"
    textColor: "{colors.text-strong}"
    rounded: "50%"
    size: "57px"
  input-field:
    backgroundColor: "#FFFFFF"
    textColor: "{colors.text-strong}"
    rounded: "{rounded.field}"
    padding: "1.05rem 1.1rem"
---

# Design System: Jayco

## Overview

**Creative north star: The Modern Outfitter.**

Jayco makes equipment for people who go outside. The design language is the same: plain-spoken, sturdy, built for use. Photography does the selling — real coaches in real places, at real scale — and everything else gets out of its way. Type is one family at honest weights. Blue is a signal, not a mood: it marks the way forward and nothing else. Space is generous because the products are large and the decisions are expensive.

The tone is confident without hype. Copy names the thing — "20 feet 11 inches", "276 hp", "fits a standard parking space" — because specificity is what persuades a buyer spending six figures. Adjectives are what a competitor writes when they have nothing to measure.

**Anti-reference:** the RV-industry default of stock lifestyle photography behind a gradient scrim, gold-and-burgundy "luxury" cues, exclamation marks, and specs dumped as a wall of unexplained numbers.

## Colors

**Jayco Blue `#007AC2`** is the only accent, and it is rationed. It appears on primary actions, active navigation, section eyebrows, and one hero figure — the price. It never becomes a background wash, a gradient, or a mood. **Blue Deep `#005E96`** is its pressed/hover state; **Blue Bright `#0F90E0`** exists for eyebrow text on dark photography where the base blue loses legibility.

Three grounds carry the whole site:

- **Canvas `#FBFCFE`** — the default page. A blue-leaning near-white, cool enough that the warm photography reads as warm against it.
- **Surface `#E2E4E7`** — the panel tone, for every content surface sitting *on* canvas: model cards, floorplan panels, media wells, the builder's summary. It is a **cool** grey, and deliberately so: the product photography is cut-out renders of white and near-white coaches, and against the warm off-white this tone used to be (`#F4F2EF`) they dissolved into their own background. Against a cool ground they hold an edge. **Surface Hover `#D4D6D9`** is one step down in the same family, for a card that is a link.
- **Ink `#0F0B09`** — a warm near-black, never pure black. The hero scrim, the closing CTA band, and the footer.

**Band Navy `#012638`** is the one dark *blue* ground, as distinct from Ink, which is a warm near-black. It carries full-width bands that need to feel like part of the product rather than a scrim: the model page's floorplan section and the quiz result's reasons-and-actions band. It is a ground only — never type, never a border.

**Dune `#E8E4DE`** is the warm neutral that structure is drawn in: hairlines, card edges, dividers, and the occasional quiet fill. It stayed warm when Surface went cool — a rule is not a ground, and a site of cool panels ruled in cool lines loses the warmth entirely.

**Bone `#F5F2EE`** is warm, and no longer a ground. It survives for the dealer map, whose palette is warm throughout — land, roads, borders — and would read wrong with one cool member in it.

Text is **Text Strong `#1A1410`** and **Text Muted `#5C5652`** — both warm, never gray-blue, and both still comfortably past AA on the cooler Surface (14.3:1 and 5.7:1). On a colored or photographic ground, secondary text tints from that ground; it never falls back to gray.

**Hairline `rgba(15,11,9,0.12)`** is a structural color, not a decorative one. It separates rows, columns and groups where a card would be too much container.

## Typography

**Host Grotesk carries everything** — display and body, 300–800 plus italics, loaded from Google Fonts. A single family is deliberate: the voice is plain, and a second face would be decoration.

The scale is weight-led, not size-led:

| Role | Size | Weight | Use |
|---|---|---|---|
| Display | `clamp(5rem, 10vw, 11.5rem)` | 900 | Page hero only. One per page. |
| Headline | `clamp(2.4rem, 3.8vw, 3.8rem)` | 800 | Section headings. |
| Title | `1.6rem` | 700 | Card and sub-section heads. |
| Body | `clamp(0.92rem, 1.1vw, 1.05rem)` | 400 | Prose, at `1.78` line-height. |
| Label | `0.68rem` | 600 | The blue eyebrow, `0.22em` tracked, uppercase. |

Rules: display tracking never loosens past `-0.01em` and never tightens past `-0.04em`. Body measure stays 65–75 characters. Headings get **more space above than below** — they belong to the content beneath them. Never set a heading in a gradient; emphasis comes from weight and size.

**The blue eyebrow is a system, not a habit.** It names a section's category (`POPULAR MODELS`, `THE CLASS B LIFE`). It is not applied to every block on a page simply because a block exists.

## Layout

No global content frame — the page is `6vw` gutters (`--page-pad`) and lets wide screens breathe. Editorial pages may cap a text spine at `1440px` so headings and media share one left edge; when they do, that spine governs *every* block on the page, including media.

Vertical rhythm runs on a three-step scale: `xl` `clamp(7rem, 13vw, 13rem)` between major sections, `lg` `clamp(4rem, 7vw, 7rem)` from a headline to its media, `md` `clamp(2rem, 3.5vw, 3.5rem)` inside a group. Sibling rhythm uses `gap`, not margins.

Breakpoints: `1280px` (dense grids relax), `1024px` (two columns become one), `900px` (paired image/text stacks), `860px` (pinned scroll sections unpin), `768px` (phone — carousels become swipeable and run off the right edge, tables become column-switchers). `@media (pointer: coarse)` disables the custom cursor.

Text measure is capped at `640px` (`--measure`) inside a wider frame; a body paragraph never runs the full width of a 1440px spine.

## Elevation & Depth

**Tonal first; shadow only to lift.** Depth comes from the three grounds and the hairline, not from stacked shadows. A section change is a tone change.

Shadow is reserved for objects that genuinely sit above the page:

- Resting card: `0 4px 24px rgba(15,11,9,0.14)`
- Floating control (carousel arrow, sub-nav bar): `0 4px 16px rgba(15,11,9,0.1)`, `0 6px 24px rgba(15,11,9,0.08)`
- Hover lift: `0 16px 40px rgba(15,11,9,0.2)`, or `0 18px 44px rgba(0,0,0,0.4)` on dark grounds
- Primary action hover: `0 8px 20px rgba(0,122,194,0.3)` — the one colored shadow, and only under blue

Every shadow carries a real y-offset and a soft blur. A zero-offset colored halo is decoration and does not belong here. Full-bleed media never carries a shadow — it has no edge to lift from.

## Shapes

**Radius follows bleed, not size.** This is the load-bearing rule of the system:

- Media **inset** inside the gutters rounds at `20px` (`--radius-card`), whatever its scale — a 16:10 thumbnail and a viewport-wide video block get the same corner.
- Media that runs **edge-to-edge** is square, with no radius and no shadow.
- The only permitted *animated* radius is the transition between those two states (the "bleed hinge"): a photograph un-rounding as it expands to full width, or rounding in as it contracts. It always settles on a correct static value.

Other shapes: actions are pills (`50px`) with no exception; round controls are true circles at `57px`; content panels round at `20px`, larger editorial panels at `24–32px`; form fields at `14px`. Cut-out product renders on transparency get no radius at all — there is no box to round.

Borders are `1px` hairlines or `1.5px` on outline buttons. A colored left-border on a card or callout is not part of this system.

## Components

**Component philosophy: quiet chrome, loud photography.** Controls are calm and consistent so the imagery carries the emotion. If a control is competing with a photograph, the control is wrong.

- **Primary button** — Jayco Blue pill, white 0.82rem label at `0.06em` tracking, `0.9rem 2.2rem` padding. Hover wipes to Blue Deep via a 200%-wide background-position transition (0.45s) and lifts with a blue shadow. Never uppercase.
- **Secondary button** — same geometry, transparent fill, `1.5px` border. Two variants: white border on dark/photographic grounds, `rgba(15,11,9,0.22)` on light. Hover wipes to a tinted fill.
- **Text link** — blue label, `1.5px` transparent bottom border that becomes solid on hover. Used where a button would be too loud.
- **Media card** — Surface ground, `20px` radius, `overflow:hidden`, image scales `1.03–1.1` on hover over `0.45–1.2s`. Text over a card image sits on a two-stop dark gradient, never on the raw photograph.
- **Surface panel** — Surface ground, `20px`, generous internal padding, used for content that is not photography (spec tables, floorplan info, forms).
- **Round control** — `57px` circle, `rgba(255,255,255,0.92)` with `blur(8px)` backdrop and a hairline border, for carousel navigation. Disabled state is `opacity: 0.35`, never hidden.
- **Floating nav bar** — pill-shaped, translucent white with `blur(18px)`, hairline border, soft shadow; the active item is a filled blue-tinted pill that slides between positions.
- **Input** — white, `14px` radius, no border at rest, `0 0 0 2px` Jayco Blue focus ring.
- **Accordion row** — hairline top and bottom, no fill, no card.

**Motion** is owned by one Lenis instance and one GSAP ScrollTrigger registration (`version-5/js/app.js`); page scripts attach via the `jayco:animations-ready` event and never create a second instance. Media scrubs linearly across its pass through the viewport (`ease: 'none'`, `scrub: true`) at small magnitudes — ±6% drift, 12 yPercent. Copy arrives once at `power2.out` over ~0.5s and does not reverse. Interactive feedback is 120–150ms. The easing signature is `cubic-bezier(0.16, 1, 0.3, 1)`, used for interactive feedback and for arrival. Chrome that changes **shape** rather than position — the header collapsing on scroll, the filter panel expanding out of its collapsed bar — runs `cubic-bezier(0.4, 0, 0.2, 1)` over ~0.55s instead: gentler into the move, with a longer tail, which is what a large box needs to read as flowing rather than being resized. Those are the only two curves. Bounce and elastic are not part of this system. `prefers-reduced-motion` disables all of it, and every section must be legible with the animation layer dead.

## Do's and Don'ts

**Do**

- Let one photograph carry a section. Full-bleed, square, drifting slowly.
- Ration the blue. If a page has more than one blue emphasis per screen, one of them is decoration.
- Name the number, then explain it. A spec without a narrative line is data, not persuasion.
- Give a heading more space above than below it.
- Keep the radius rule: inset rounds at 20px, full-bleed is square.
- **One authored motion moment per page.** Everything else uses the shared quiet handoff — arriving text, drifting media, nothing else. A page with eleven distinct transitions reads as less crafted, not more.
- Keep controls quiet, consistent, and in the pill vocabulary.

**Don't**

- Don't round a full-bleed image, and don't shadow one.
- Don't put a tracked uppercase eyebrow over every section. It names a category; it is not a section separator.
- Don't build a page out of same-size cards of icon + heading + text — and never nest a card inside a card.
- Don't set gradient text, and don't reach for glass or blur as decoration rather than as a specific effect.
- Don't use a colored `border-left` above 1px on cards, list items or callouts.
- Don't animate every section's entrance identically, or reinterpret a scrolled page as a staggered list.
- Don't substitute stock photography for a Jayco product. The coach in the frame must be the coach on the page.
- Don't introduce a second typeface. Host Grotesk has the range.
- Don't state a claim the product can't prove — no invented testimonials, review scores, or benchmarks.
