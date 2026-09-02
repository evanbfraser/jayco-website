/* ===================================================
   Jayco — RV type overview page renderer
   ---------------------------------------------------
   Reads ?type=<category-id> and builds every section.

   TWO DATA LAYERS. The categories themselves come from
   window.JAYCO (models-data.js) — that is what makes a
   category real. window.JAYCO_TYPE adds photography and
   copy for the ones that have been shot and written.
   A category with no record still gets a working page:
   synth() below builds one entirely out of facts already
   in models-data.js, and every band whose data is absent
   removes itself. Fewer sections, never invented ones.

   Runs synchronously at parse time — the script sits at
   the end of <body>, so all containers already exist and
   the markup is in place before app.js binds the FAQ
   accordion on DOMContentLoaded. Motion is deferred to
   the 'jayco:animations-ready' event app.js fires once
   GSAP + Lenis are live; this page never creates a
   second Lenis instance or a second ScrollTrigger
   registration.
   =================================================== */

(function () {
  'use strict';

  const DATA = window.JAYCO_TYPE || {};
  const FB   = window.JAYCO_TYPE_FALLBACK || {};
  const LIB  = window.JAYCO || {};
  const CATS = LIB.categories || [];
  const MODELS = LIB.models || {};
  if (!CATS.length) return;                 // no library, no page

  /* Validity is decided by models-data.js, NOT by which categories have been
     photographed. Resolving against JAYCO_TYPE instead would send ?type=class-a
     silently to the fifth wheels page — a real category answering to the wrong
     name is worse than a thinner page. */
  /* The default is the first category that has been WRITTEN AND PHOTOGRAPHED,
     not simply the first category in the library. version-4 got this for free
     by holding a single record; here models-data.js decides which categories
     exist and type-data.js decides which have real content, so the default has
     to ask the second question. Without it a bare type.html landed on Travel
     Trailers and showed the thin synthesised page, while the one fully authored
     page was reachable only by naming it in the query string. Follows
     automatically as more categories are authored. */
  const DEFAULT_ID = (CATS.filter((c) => DATA[c.id])[0] || CATS[0]).id;

  const params = new URLSearchParams(window.location.search);
  const asked = params.get('type') || DEFAULT_ID;
  const known = CATS.some((c) => c.id === asked);
  const id  = known ? asked : DEFAULT_ID;
  const cat = CATS.find((c) => c.id === id);
  /* asked for a category that does not exist — keep the address bar honest
     about which one is actually on screen */
  if (id !== asked && window.history && window.history.replaceState) {
    window.history.replaceState({}, '', 'type.html?type=' + id);
  }

  /* ---------- helpers (the model page's, verbatim) ---------- */
  const $ = (sel) => document.querySelector(sel);
  const money = (n) => '$' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  /* Fill a container, or do nothing if the page doesn't have one. Every
     renderer goes through this: an unguarded innerHTML on a container that was
     removed from type.html would throw and kill every later section. */
  function set(sel, html) {
    const el = $(sel);
    if (el) el.innerHTML = html;
    return !!el;
  }
  function drop(sel) {                    // remove a section this type has no data for
    const el = $(sel);
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }

  /* ---------- The synthesised record ----------
     Everything below is a READ of models-data.js plus the two shared assets in
     JAYCO_TYPE_FALLBACK. No fact here is authored: the name, the towable /
     motorized split, the model year and the lineup all already exist as data,
     and re-typing them into JAYCO_TYPE is how a second copy starts to drift
     (that file says so itself, in its own header).

     What is deliberately ABSENT is as important as what is present: no intro
     prose, no feature bands. Those need photography and writing that only
     exists for a category someone has actually shot, and each renderer removes
     its own section when the data is missing. */
  function synth(c) {
    const slugs = Object.keys(MODELS).filter((s) => MODELS[s].category === c.id);
    const years = slugs.map((s) => MODELS[s].year).filter(Boolean);
    return {
      id: c.id,
      name: c.name,
      typeLabel: c.type === 'motorized' ? 'Motorized' : 'Towable',
      year: years.length ? Math.max.apply(null, years) : null,
      hero: {
        poster: (FB.stills || {})[c.id] || c.image,
        heading: c.name,
        /* Structural, not copy: the two things anyone can do from any page. */
        ctas: [
          { label: 'Build & Price', href: 'build-price.html', style: 'primary' },
          { label: 'Find a Dealer', href: 'dealers.html', style: 'secondary' },
        ],
      },
      lineup: {
        label: 'The Lineup',
        /* A navigational label, not a product claim — and it reads correctly
           for all eight: "All Fifth Wheels." / "All Class B Motorhomes." */
        heading: 'All ' + c.name + '.',
        models: slugs,
      },
      quiz: FB.quiz,
      faq: FB.faq,
    };
  }

  /* Shallow on purpose. An authored record replaces a whole sub-object rather
     than half-filling it — a deep merge would pair authored hero copy with a
     synthesised poster, which is exactly the mismatch nobody would catch. */
  const type = Object.assign(synth(cat), DATA[id] || {});

  /* A section head is the eyebrow + heading pair. DESIGN.md: the tracked
     uppercase eyebrow names a section's category — it is not stamped on every
     block, so `label` is optional and the head renders without it. */
  function head(label, heading, body) {
    return `
      <div class="tp-section-head">
        ${label ? `<span class="section-label">${esc(label)}</span>` : ''}
        ${heading ? `<h2 class="section-heading dark">${heading}</h2>` : ''}
        ${body ? `<p class="section-body">${esc(body)}</p>` : ''}
      </div>`;
  }

  /* ---------- Hero ----------
     One full-bleed looping shot of the category and the name over it. This is
     the page's single authored motion moment — nothing below it pins, scrubs
     or hinges. */
  function renderHero() {
    const h = type.hero || {};
    /* reduced motion gets the poster frame instead of the looping video */
    const stillOnly = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const media = h.video && !stillOnly
      ? `<video class="tp-hero-video" src="${h.video}" poster="${h.poster || ''}" muted loop playsinline preload="auto" autoplay></video>`
      : `<img class="tp-hero-img" src="${h.poster || ''}" alt="${esc(type.name)}" />`;

    const ctas = (h.ctas || []).map((c) =>
      `<a href="${c.href}" class="btn-${c.style === 'secondary' ? 'secondary' : 'primary'}">${esc(c.label)}</a>`
    ).join('');

    /* filter(Boolean) so a category with no year cannot print "undefined · Towable" */
    const eyebrow = [type.year, type.typeLabel].filter(Boolean).map(esc).join(' &nbsp;·&nbsp; ');

    /* A still hero gets a shorter band. A category photograph standing in for a
       looping film should not claim the full cinematic 100vh — and the plate is
       portrait, so less of it has to be thrown away. */
    const hero = $('#tp-hero');
    if (hero && !(h.video && !stillOnly)) hero.classList.add('tp-hero--still');

    set('#tp-hero', `
      <div class="tp-hero-media">${media}</div>
      <div class="tp-hero-overlay"></div>
      <div class="tp-hero-content">
        ${eyebrow ? `<span class="tp-hero-eyebrow">${eyebrow}</span>` : ''}
        <h1 class="tp-hero-heading">${esc(h.heading || type.name)}</h1>
        ${h.sub ? `<p class="tp-hero-tagline">${esc(h.sub)}</p>` : ''}
        <div class="tp-hero-ctas">${ctas}</div>
      </div>
      <div class="scroll-indicator">
        <span>Scroll</span>
        <svg class="scroll-arrow" width="16" height="24" viewBox="0 0 16 24" fill="none">
          <path d="M8 0v20M1 13l7 7 7-7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>`);

    document.title = [type.year, 'Jayco', type.name].filter(Boolean).join(' ') +
      ' — Models, Features & Pricing';
  }

  /* ---------- Intro ----------
     Eyebrow and headline on the left, the prose answering them on the right.
     Two columns rather than one centred block: the headline gets to be a
     headline, and the body keeps its 65–75 character measure without the page
     having to be narrow. */
  function renderIntro() {
    const i = type.intro;
    if (!i) { drop('#tp-intro'); return; }

    set('#tp-intro', `
      <div class="tp-intro-inner">
        <div class="tp-intro-head">
          ${i.label ? `<span class="section-label">${esc(i.label)}</span>` : ''}
          <h2 class="section-heading dark">${i.heading}</h2>
        </div>
        <div class="tp-intro-body">
          ${(i.body || []).map((p) => `<p class="section-body">${esc(p)}</p>`).join('')}
        </div>
      </div>`);
  }

  /* ---------- The lineup ----------
     Every card is a READ of window.JAYCO.models — the name, tagline, price and
     specs on screen are the same objects the homepage carousel and the model
     page quote. A slug missing from the library is skipped, not rendered as a
     blank card.

     WHERE A CARD GOES. A model with its own detail page goes there. Everything
     else goes to the builder with that model preselected — a real, complete
     page for all 27. Deliberately NOT this category page: that is the page the
     card is already on. The stub test matches app.js's exploreHref and
     model-detail.js's renderSimilar; all three have to agree. */
  function renderLineup() {
    const l = type.lineup;
    const lib = MODELS;
    const detail = window.JAYCO_MODEL_DETAIL || {};
    const hrefFor = (s) => (detail[s] && !detail[s].stub)
      ? 'model.html?model=' + s
      : 'build-price.html?model=' + s;
    const slugs = ((l && l.models) || []).filter((s) => lib[s]);
    if (!slugs.length) { drop('#tp-lineup'); return; }

    const cards = slugs.map((s) => {
      const m = lib[s];
      /* value over label, the way a spec reads on a card — the library stores
         them label-first, so the pair is flipped here, not in the data */
      const stats = Object.keys(m.specs || {}).slice(0, 3).map((k) => `
        <div class="tp-model-stat">
          <span class="tp-model-stat-value">${esc(m.specs[k])}</span>
          <span class="tp-model-stat-label">${esc(k)}</span>
        </div>`).join('');

      return `
        <a class="tp-model-card" href="${hrefFor(s)}">
          <h3 class="tp-model-name">${esc(m.name)}</h3>
          <p class="tp-model-tagline">${esc(m.tagline)}</p>
          <span class="tp-model-price">Starting at ${money(m.basePrice)}${m.year ? ' · ' + m.year : ''}</span>
          <div class="tp-model-media"><img src="${m.img}" alt="${esc(m.name)}" loading="lazy" /></div>
          <div class="tp-model-stats">${stats}</div>
        </a>`;
    }).join('');

    /* THE CLOSING ASK, and why it is written here rather than in type-data.js.
       `type` is a SHALLOW merge — Object.assign(synth(cat), DATA[id]) above —
       so an authored category replaces the whole `lineup` sub-object. Putting
       the CTA in synth()'s lineup would mean fifth wheels, the one fully
       authored category, is the single page that loses it, and every category
       authored after this one would have to remember to retype it. It is the
       same ask for all eight either way: structural, not copy, exactly like
       the hero's Build & Price / Find a Dealer pair. */
    set('#tp-lineup', `
      <div class="tp-lineup-inner">
        ${head(l.label, l.heading, l.body)}
        <div class="tp-model-grid" data-count="${slugs.length}">${cards}</div>
        <div class="tp-lineup-cta">
          <h3 class="tp-lineup-cta-heading">Ready to walk through one?</h3>
          <a href="#" class="btn-primary">View Our Dealer Inventory</a>
        </div>
      </div>`);

    /* PLACEHOLDER HREF. The dealer inventory page is coming; "#" is what every
       unbuilt destination in this site already uses (the footer's Brochures,
       Reviews & Testimonials, Value Calculator). Left bare it would send a
       click to the top of the document — and Lenis would smooth-scroll the
       whole way, which reads as the button doing something wrong rather than
       nothing. When the page ships, point the href at it and delete this. */
    const cta = $('.tp-lineup-cta a');
    if (cta) cta.addEventListener('click', (e) => e.preventDefault());
  }

  /* ---------- What makes it this type ----------
     Two sections, outside then inside. Each is one full-bleed photograph with
     the section's headline standing on it, and then the four detail cards
     BELOW the photograph as a rail you scroll.

     The cards used to sit on the photograph, one at a time, revealed by a
     pinned scrub. Off it they are four cards you can compare, and the section
     scrolls like the rest of the page. The band runs edge to edge so it is
     square and unshadowed; the card images are inset so they round — radius
     follows bleed.

     Both sections come out of one loop rather than two hand-written blocks:
     they are the same component with different content, and a category that
     supplies only one of them renders only one.

     The arrows are the model page's rail buttons, markup and all — same glyph,
     same 46px circle, same disabled-at-the-end behaviour. They sit BELOW the
     cards, on a rule that closes the section, so they follow the track in the
     markup as well as on the page: a control that comes after what it controls
     is the order a keyboard walks it in. aria-controls points at the track,
     which is why the id is built from the section id. */
  function renderFeatures() {
    const sections = type.featureSections || [];
    if (!sections.length) { drop('#tp-features'); return; }

    const arrow = (id, dir, d) => `
      <button type="button" class="tp-feat-nav" data-dir="${dir}"
              aria-label="${dir === 'prev' ? 'Previous' : 'Next'} features"
              aria-controls="tp-feat-${esc(id)}-track">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>
      </button>`;

    set('#tp-features', sections.map((s) => `
      <section class="tp-feat" aria-labelledby="tp-feat-${esc(s.id)}-h">
        <div class="tp-feat-band">
          <div class="tp-feat-stage">
            <img src="${s.band.src}" alt="${esc(s.band.alt)}" loading="lazy" />
            <div class="tp-feat-scrim" aria-hidden="true"></div>
          </div>
          <div class="tp-feat-content">
            <div class="tp-feat-head">
              ${s.label ? `<span class="section-label light">${esc(s.label)}</span>` : ''}
              <h2 class="tp-feat-heading" id="tp-feat-${esc(s.id)}-h">${s.heading}</h2>
            </div>
          </div>
        </div>
        <div class="tp-feat-rail">
          <ul class="tp-feat-cards" id="tp-feat-${esc(s.id)}-track" role="list">
            ${(s.cards || []).map((c) => `
              <li class="tp-feat-card">
                <div class="tp-feat-card-media">
                  <img src="${c.image.src}" alt="${esc(c.image.alt)}" loading="lazy" />
                </div>
                <h3 class="tp-feat-card-title">${esc(c.title)}</h3>
                <p class="tp-feat-card-body">${esc(c.body)}</p>
              </li>`).join('')}
          </ul>
          <div class="tp-feat-controls">
            <span class="tp-feat-rule" aria-hidden="true"></span>
            ${arrow(s.id, 'prev', 'M15 5l-7 7 7 7')}
            ${arrow(s.id, 'next', 'M9 5l7 7-7 7')}
          </div>
        </div>
      </section>`).join(''));
  }

  /* ---------- The card rails ----------
     Native scroll with arrows on top of it — the model page's video rail,
     restated for this markup and for one rail per feature section.

     Bound at boot rather than from initMotion(), because these buttons are not
     motion: they have to work with GSAP absent and under prefers-reduced-
     motion, where the scroll jumps instead of gliding.

     Position is read from scrollLeft, never from a counter, so a swipe, a
     trackpad flick and an arrow all leave the buttons telling the truth. */
  function initFeatureRails() {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    Array.prototype.forEach.call(document.querySelectorAll('.tp-feat-rail'), (rail) => {
      const track = rail.querySelector('.tp-feat-cards');
      const prev  = rail.querySelector('[data-dir="prev"]');
      const next  = rail.querySelector('[data-dir="next"]');
      if (!track || !prev || !next) return;

      /* measured, not computed from the CSS card width — the two would
         otherwise have to be kept in sync by hand across the breakpoints */
      function step() {
        const card = track.querySelector('.tp-feat-card');
        if (!card) return track.clientWidth;
        const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
        return card.getBoundingClientRect().width + gap;
      }
      /* a whole card-widths' worth of what is on screen: the partly-visible
         card at the right edge becomes the first fully-visible one after the
         click, so nothing is ever scrolled past unseen. The lead padding is
         subtracted because at rest it holds no card — count from where the row
         actually starts. */
      function page() {
        const s = step();
        if (!s) return track.clientWidth;
        const lead = parseFloat(getComputedStyle(track).paddingLeft) || 0;
        return s * Math.max(1, Math.floor((track.clientWidth - lead) / s));
      }
      function go(dir) {
        track.scrollBy({ left: dir * page(), behavior: reduce ? 'auto' : 'smooth' });
      }
      function sync() {
        const max = track.scrollWidth - track.clientWidth;
        /* a rail with nothing past the right edge has nothing to page through,
           so the pair goes rather than sitting there greyed out at both ends */
        rail.classList.toggle('is-static', max < 2);
        prev.disabled = track.scrollLeft <= 1;
        next.disabled = track.scrollLeft >= max - 1;
      }

      prev.addEventListener('click', () => go(-1));
      next.addEventListener('click', () => go(1));
      track.addEventListener('scroll', sync, { passive: true });
      window.addEventListener('resize', sync);
      /* the cards are sized off the frame, so the first honest measurement is
         after layout, not during the render pass */
      requestAnimationFrame(sync);
    });
  }

  /* ---------- Quiz CTA ----------
     The homepage's .quiz-section component with this category's copy — same
     classes, so it inherits that section's layout and the video-visibility
     handling in app.js.

     The media takes a video, a still, or both. The homepage uses its
     model-morph clip here, but that clip is a Class B camper van: on a category
     page it would put the wrong vehicle beside the question, so a category
     brings its own footage.

     A category with both gets the clip, and the still becomes its poster —
     except under prefers-reduced-motion, where the still is the whole answer.
     An autoplaying loop is motion, and DESIGN.md requires every section to
     read with the animation layer dead. Same rule renderHero() follows. */
  function renderQuiz() {
    const q = type.quiz;
    if (!q) { drop('#tp-quiz'); return; }

    const stillOnly = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const still = q.image
      ? `<img class="quiz-still" src="${q.image.src}" alt="${esc(q.image.alt)}" loading="lazy" />`
      : '';

    const media = (q.video && !stillOnly)
      ? `<video class="quiz-video" autoplay muted loop playsinline preload="metadata"${
           q.image ? ` poster="${q.image.src}"` : ''}>
           <source src="${q.video}" type="video/mp4">
         </video>`
      : still;

    set('#tp-quiz', `
      <div class="quiz-inner">
        <div class="quiz-text">
          ${q.label ? `<span class="section-label">${esc(q.label)}</span>` : ''}
          <h2 class="section-heading">${q.heading}</h2>
          ${q.body ? `<p class="section-body">${esc(q.body)}</p>` : ''}
          ${q.cta ? `<a href="${q.cta.href}" class="btn-primary">${esc(q.cta.label)}</a>` : ''}
        </div>
        <div class="quiz-media">${media}</div>
      </div>`);
  }

  /* ---------- FAQ ----------
     The homepage's component, unchanged. app.js binds .faq-question on
     DOMContentLoaded, which is after this file has run. */
  function renderFaqs() {
    const f = type.faq;
    const items = (f && f.items) || [];
    if (!items.length) { drop('#faq'); return; }

    set('#faq', `
      <div class="faq-inner">
        <div class="faq-header">
          <span class="section-label">${esc(f.label || 'Frequently Asked Questions')}</span>
          <h2 class="section-heading dark">${f.heading || 'Questions, answered.'}</h2>
        </div>
        <div class="faq-list">
          ${items.map((it) => `
            <div class="faq-item">
              <button class="faq-question" aria-expanded="false">
                <span>${esc(it.q)}</span>
                <span class="faq-icon" aria-hidden="true"></span>
              </button>
              <div class="faq-answer"><p>${esc(it.a)}</p></div>
            </div>`).join('')}
        </div>
      </div>`);
  }

  /* ---------- The feature bands ----------
     The photograph's arrival. No pin: the page scrolls normally past these
     sections, and the band plays against that scroll rather than holding the
     page still while it does.

     Progress runs from the band's top edge entering at the bottom of the
     viewport to it settling near the top — about one screen of ordinary
     scrolling — and inside that:

       0.00 → 0.92   the photograph un-rounds and grows to full width
       0.45 → 0.95   the headline rises in over it

     The overlap is the point. The headline starts arriving while the frame is
     still opening, so the two read as one movement rather than a slab that
     stops and then a caption that appears.

     Two curves, because the two beats want different shapes. `glide` is a
     quadratic out and carries the expansion: the frame is a third narrower
     than the window when it starts, and a power3 spent nearly all of that in
     the first fifth of the scroll — the growth has to be the thing you watch,
     not something that has already happened. `ramp` is the page's power3.out
     arrival curve and carries the headline, which does land rather than
     travel.

     A SECOND trigger per band runs the parallax, over the whole time the band
     is on screen rather than only its arrival — that is what a drift is. It is
     kept separate rather than folded into paint() because the two want
     different spans, and one trigger cannot have two.

     The expansion is the design system's one permitted animated radius — the
     bleed hinge — a photograph un-rounding as it reaches full width, settling
     on a correct static value at both ends.

     Progress drives inline styles rather than a timeline of tweens so that
     scrubbing backwards is exact: every frame is computed from `self.progress`
     alone, with no state carried between frames. */
  function initFeatureBands() {
    const bands = gsap.utils.toArray('.tp-feat-band');
    if (!bands.length) return;

    const clamp01 = (n) => Math.max(0, Math.min(1, n));
    /* power3.out — quick off the mark, settling slowly. The page's arrival
       curve: it happens once and should feel like it lands. */
    const ramp = (p, a, b) => {
      const t = clamp01((p - a) / (b - a));
      return 1 - Math.pow(1 - t, 3);
    };
    /* power2.out — the same shape with far less of it front-loaded, so the
       expansion is spread across the scroll instead of finishing in the first
       few frames of it. */
    const glide = (p, a, b) => {
      const t = clamp01((p - a) / (b - a));
      return 1 - Math.pow(1 - t, 2);
    };
    /* Half the travel each way, in percent of the image's own height. The
       image is 124% of the stage with 12% of headroom above and below (see
       --fp-drift in type.css); 8% of 124 is 9.9 — comfortably inside the 12
       there is, with room left for the sub-pixel rounding that decides whether
       a hairline of background shows at the edge. */
    const DRIFT = 8;

    const mm = gsap.matchMedia();

    /* Above 860px only — DESIGN.md unpins scroll sections at that width, and
       while nothing pins here any more, a band that is already nearly as wide
       as the screen has no expansion worth watching. Below it the CSS resting
       state is the whole design. */
    mm.add('(min-width: 861px) and (prefers-reduced-motion: no-preference)', () => {
      bands.forEach((band) => {
        const stage = band.querySelector('.tp-feat-stage');
        const head  = band.querySelector('.tp-feat-head');
        const img   = band.querySelector('.tp-feat-stage > img');
        if (!stage || !head) return;

        function paint(p) {
          /* 1 = inset and rounded, 0 = full-bleed and square */
          stage.style.setProperty('--exp', String(1 - glide(p, 0, 0.92)));

          const h = ramp(p, 0.45, 0.95);
          head.style.opacity = String(h);
          head.style.transform = 'translateY(' + ((1 - h) * 26) + 'px)';
        }
        /* 0 = band's top edge at the bottom of the window, 1 = its bottom edge
           at the top. The photograph runs UP inside its frame as the page runs
           up, so it travels further than the band does and the crop keeps
           changing under it — the direction .parallax-bg already uses on the
           homepage, centred here rather than anchored at the top because this
           frame is entered from both ends. */
        function drift(p) {
          if (img) img.style.transform = 'translate3d(0,' + ((p - 0.5) * -2 * DRIFT).toFixed(3) + '%,0)';
        }

        const st = ScrollTrigger.create({
          trigger: band,
          start: 'top bottom',
          /* not 'top top': the band is well short of the viewport, so held to
             the very top it would still be opening when it is fully on screen.
             18% leaves the last of the movement above the fold. */
          end: 'top 18%',
          scrub: true,
          onUpdate(self) { paint(self.progress); },
          /* a resize recomputes start/end; repaint against the new progress
             rather than leaving the last frame from the old geometry */
          onRefresh(self) { paint(self.progress); },
        });

        const dt = ScrollTrigger.create({
          trigger: band,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
          onUpdate(self) { drift(self.progress); },
          onRefresh(self) { drift(self.progress); },
        });
        drift(dt.progress);

        /* onUpdate does not fire while progress is still 0, so without this the
           first frame would be whatever CSS says — and CSS has to rest on the
           finished state for the reduced-motion and sub-861px layouts.
           Painting here closes that gap; it runs while the loader is still
           covering the page, so nothing flashes. */
        paint(st.progress);
      });

      ScrollTrigger.refresh();

      /* matchMedia kills the ScrollTriggers itself; the inline styles they
         wrote are ours to clear, or the static layout inherits opacity 0. */
      return () => {
        bands.forEach((band) => {
          const stage = band.querySelector('.tp-feat-stage');
          const head  = band.querySelector('.tp-feat-head');
          const img   = band.querySelector('.tp-feat-stage > img');
          if (stage) stage.style.removeProperty('--exp');
          if (head) { head.style.opacity = ''; head.style.transform = ''; }
          if (img) img.style.transform = '';
        });
      };
    });
  }

  /* ---------- Motion ----------
     The shared quiet handoff and nothing else: copy arrives once, media
     drifts. DESIGN.md allows one authored motion moment per page and this
     page spends it on the hero video. */
  function initMotion() {
    if (!window.gsap || !window.ScrollTrigger) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    /* The feature bands own their own headline — everything else on the page,
       the card rails now included, uses the quiet handoff below.

       The RAIL is the target, not the cards inside it: the track is a scroll
       container on both axes, so a card translating 14px down would push
       against its own overflow. Fading the block moves nothing inside it, and
       four cards sharing a top edge would have fired together anyway. */
    const REVEAL = [
      '.tp-section-head', '.tp-intro-head', '.tp-intro-body', '.tp-model-card',
      '.tp-lineup-cta', '.tp-feat-rail',
    ].join(',');

    gsap.utils.toArray(REVEAL).forEach((el) => {
      gsap.from(el, {
        opacity: 0, y: 14, duration: 0.5, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
      });
    });

    initFeatureBands();

    ScrollTrigger.refresh();
    /* lazy images land after this — one more pass once they have */
    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  }

  /* ---------- Boot ---------- */
  renderHero();
  renderIntro();
  renderLineup();
  renderFeatures();
  initFeatureRails();
  renderQuiz();
  renderFaqs();

  document.addEventListener('jayco:animations-ready', initMotion);
}());
