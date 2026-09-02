# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Three real audiences, all served by the same site. No single one has been ranked primary; when they conflict, ask rather than assume.

- **New buyers.** People shopping for an RV, spanning the whole journey: from someone who does not yet know a Class B from a fifth wheel and is comparing RV *types*, through to a shopper down to two floorplans of one model who needs specs, pricing and a dealer. They arrive from search and from the Jayco brand, research across several sessions and devices, and convert offline — the purchase happens at a dealership, not on the site.
- **Owners.** People who already own a Jayco and return for support: manuals, warranty coverage, recalls (US and Canadian), parts, the Wingmate app, the Ambassador program, Jayco University, change-of-ownership. Task-driven, often mid-trip or mid-problem, and unimpressed by marketing.
- **Dealerships.** The 300+ North American dealer network, using the site as a resource — the Dealer Marketing Hub, brochures, model data and specs they rely on when selling.

## Product Purpose

The Jayco brand site. It exists to move prospective buyers from "what kind of RV do I even want" to a specific model, floorplan and configuration, and then to a dealer — while remaining the place existing owners come back to for support and dealers come for materials.

Success is a shopper arriving at a dealer already knowing which Jayco they want, and an owner solving their problem without calling anyone.

## Positioning

Jayco, Inc. — a Thor Industries company, building RVs for more than 55 years. The claim the site is built on is *support around the product, not just the product*: a 2-year limited / 3-year structural warranty, 100% PDI (pre-delivery inspection) on every coach, and 300+ dealers across North America — expressed on the homepage as "Built for the Road. Built for Life." and "Every Jayco is backed by industry-leading support — before, during, and long after the sale."

The lineup spans towables and motorized: travel trailers, destination trailers, fifth wheels, toy haulers, Class A, Class B and Class C. This breadth is itself positioning — the site has to make an unfamiliar category navigable, hence the RV Finder Quiz, Tow vs. Drive guide, and New to RVing content sitting at the same level as the model pages.

## Operating Context

- **Offline conversion.** No transaction happens on the site. The terminal actions are Build & Price, Find a Dealer, Request a Quote and Download Brochure. Every surface is measured by whether it gets someone to one of those.
- **Long, interrupted research.** Buying an RV is a months-long, high-consideration decision. Visitors leave and return; comparison, saved configurations and brochures matter more than a single-session funnel.
- **Model-year cadence.** Content is versioned by model year (the Swift on the site is a 2027). Specs, pricing and floorplans change annually and per-floorplan, so model content is data-driven, not hand-authored per page.
- **Dealer network dependency.** The dealer locator, dealer marketing hub and inventory-adjacent flows assume an independent dealer network, not company-owned retail.
- **Full information architecture is defined.** `Jayco website.pdf` at the repo root is the approved sitemap: eight top-level areas (RVs, Find Your RV, Shop & Tools, Owners, About, Resources, Build & Price, Find a Dealer) with module-level breakdowns for roughly 60 page types. It is the scope of record for what this site eventually contains.

## Capabilities and Constraints

- **Static site, no framework.** Hand-written HTML, CSS and vanilla JS per version. No build step, no package.json, no component library. Deployed on Netlify (`netlify.toml` publishes the repo root and 302-redirects `/` to `/version-5/`).
- **Runtime dependencies are CDN-loaded**: GSAP + ScrollTrigger, Lenis smooth scroll, Leaflet for the dealer map. `js/app.js` owns the single Lenis instance and the ScrollTrigger registration; page scripts hook the `jayco:animations-ready` event rather than initialising their own.
- **version-5 is the direction.** The version-5 homepage is client-approved. It supersedes version-1 (recorded in git as "the original approved design") through version-4, which are frozen and kept for reference only. Future production work lands in `version-5/`, and pages built in an earlier version are ported forward rather than linked across — two versions of a page will quote different specs from their own `models-data.js`.
- **Built so far, all in `version-5/`:** the homepage, the RV type overview (`type.html`, one page per category), the model detail template (`model.html`, driven by `js/model-data.js`, currently populated for the 2027 Swift), Build & Price (`build-price.html`), floorplan comparison (`compare.html`) and the dealer locator (`dealers.html`, 428 harvested dealers). Everything else in the sitemap is unbuilt.
- **The model detail page is a template, not a one-off.** It renders from a data object and degrades section by section — a model with no cutaway art, no 360 tours or no floorplan filters drops those bands rather than breaking.
- **Terminology to use exactly as the industry does:** floorplan (one word), Class A / B / C, towable vs. motorized, fifth wheel, toy hauler, PDI, GVWR, GCWR, dry weight, JRide, JaySMART, Wingmate.
- **The type overview is a template too, and degrades further.** A category with photography and written copy (Fifth Wheels) renders hero, intro, lineup, feature bands, quiz and FAQ. A category with neither still gets a working page: `type-page.js` synthesises the record from `models-data.js` and each band with no data removes itself. Nothing on a synthesised page is authored — the FAQ and quiz copy are the homepage's, verbatim.
- **Undecided:** which sitemap surface is built next; whether model content will eventually come from a CMS or feed rather than a JS data file.

## Brand Commitments

This is a commissioned Jayco engagement. The following are supplied facts, not copywriting — preserve them verbatim and do not invent variants, round the numbers, or add claims of the same kind:

- Legal line: "© 2026 Jayco, Inc. All rights reserved. A Thor Industries Company."
- Warranty: 2-year limited / 3-year structural (asset: `assets/warranty_2+3.svg`).
- "For more than 55 years" of operation; "more than 300 dealers across North America"; 100% PDI on every unit.
- Registered marks and program names: Jayco®, JRide®, JaySMART, ParkSense®, Wingmate, Jayco University, Ambassador Program, Overlander packages.
- Model pricing shown on the site is real MSRP (e.g. 2027 Swift from $150,300, 20E and 20T floorplans) and must not be adjusted for design convenience.
- Logo and all model photography, renders, floorplan drawings and video are licensed client assets under `assets/`. Use them as supplied; do not substitute stock imagery for a Jayco product.
- **Voice:** plain, concrete, confident. Short declaratives — "Live Without Limits", "Any road, any time", "Van life, without the leap", "Built for the road ahead." Specifics over adjectives (say "20 feet 11 inches" and "276 hp", not "spacious" and "powerful"). No exclamation marks, no hype, no second-person hard sell.

## Evidence on Hand

- `Jayco website.pdf` — the full approved sitemap and page-module IA (repo root).
- `assets/` — Jayco logo, warranty badge, category and lifestyle photography, model renders, hero and section video.
- `assets/model details/swift/` — the 2027 Swift photo set, floorplan drawings (20E, 20T), hero video and web-optimised exports at 2000/1100/800px tiers.
- `version-5/js/model-data.js` — real Swift product data: specs, floorplans, standard and optional equipment with prices, feature copy, FAQs.
- `version-5/js/build-data.js` — all 181 real 2027 floorplans with MSRP, sleeps, length, weights, tanks and per-plan options; `js/floorplan-features.js` adds Jayco's own 17 feature flags for 161 of them.
- `version-5/js/dealer-data.js` — 428 dealers harvested from jayco.com with addresses, phones and coordinates. `hasService` is null on every record and must stay that way until real data arrives.
- Real proof points in the copy: warranty, 55+ years, 300+ dealers, 100% PDI, award recognition.

**Absences future work must not fabricate:** there are no customer testimonials, no review scores, no case studies, no press quotes, no dealer inventory data and no analytics in this repo. The Reviews & Testimonials page in the sitemap has no source content yet. Do not invent any of them to fill a layout — request them.

## Product Principles

1. **Orientation before persuasion.** A first-time visitor cannot choose a floorplan before they know which RV type fits their life. Every entry point has to answer "where do I start" before it sells.
2. **Specifics are the argument.** The product is technical and expensive; concrete numbers, dimensions and named systems persuade where adjectives do not.
3. **The dealer is the destination.** Design toward Build & Price, Find a Dealer, Request a Quote and Download Brochure. A beautiful page that ends nowhere has failed.
4. **Owners are not an afterthought.** Support content shares the site with marketing content and must stay findable and task-shaped — never buried beneath the sales journey.
5. **Templates, not pages.** Model, floorplan and resource content repeats across a large lineup and changes every model year. Build systems that take data and degrade gracefully, not one-off layouts.

## Accessibility & Inclusion

The footer carries a standing Accessibility link, so an accessibility statement is a live commitment. No specific standard (WCAG level) has been established for this engagement — confirm with Jayco before treating one as required.

Product-specific needs already in evidence: the audience skews toward older adults, so type sizes, contrast and touch targets carry more weight than usual; the site is used in the field on phones with poor connectivity, so weight and offline-tolerance matter; motion is heavy across the site (scroll-scrubbed video, parallax, pinned sections) and `prefers-reduced-motion` is honoured in the existing code — that must not regress.
