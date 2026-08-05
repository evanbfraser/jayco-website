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

    set('#tp-lineup', `
      <div class="tp-lineup-inner">
        ${head(l.label, l.heading, l.body)}
        <div class="tp-model-grid" data-count="${slugs.length}">${cards}</div>
      </div>`);
  }

  /* ---------- What makes it this type ----------
     Two sections, outside then inside. Each is a headline, one full-bleed
     photograph carrying the section, then four cards that arrive as the row
     scrolls up. The band runs edge to edge so it is square and unshadowed; the
     card images are inset so they round — radius follows bleed.

     Both come out of one loop rather than two hand-written blocks: they are
     the same component with different content, and a category that supplies
     only one of them renders only one. */
  function renderFeatures() {
    const sections = type.featureSections || [];
    if (!sections.length) { drop('#tp-features'); return; }

    set('#tp-features', sections.map((s) => `
      <section class="tp-feat" aria-labelledby="tp-feat-${esc(s.id)}-h">
        <div class="tp-feat-stage">
          <img src="${s.band.src}" alt="${esc(s.band.alt)}" loading="lazy" />
          <div class="tp-feat-scrim" aria-hidden="true"></div>
        </div>
        <div class="tp-feat-content">
          <div class="tp-feat-head">
            ${s.label ? `<span class="section-label light">${esc(s.label)}</span>` : ''}
            <h2 class="tp-feat-heading" id="tp-feat-${esc(s.id)}-h">${s.heading}</h2>
          </div>
          <ul class="tp-feat-cards" role="list">
            ${(s.cards || []).map((c) => `
              <li class="tp-feat-card">
                <div class="tp-feat-card-media">
                  <img src="${c.image.src}" alt="${esc(c.image.alt)}" loading="lazy" />
                </div>
                <h3 class="tp-feat-card-title">${esc(c.title)}</h3>
                <p class="tp-feat-card-body">${esc(c.body)}</p>
              </li>`).join('')}
          </ul>
        </div>
      </section>`).join(''));
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

  /* ---------- The feature stages ----------
     Each section pins and plays one sequence against the scroll wheel:

       0.00 → 0.16   the photograph un-rounds and grows to fill the viewport
       0.18 → 0.30   the headline rises in over it
       0.32 → 0.92   the four cards arrive, one at a time
       0.92 → 1.00   a beat with all four up, then the pin releases into the
                     next section

     This is the page's authored motion moment, and it is the same machinery
     the homepage's #builtfor block uses: gsap.matchMedia, a pinned ScrollTrigger
     with scrub, and progress mapped onto a CSS custom property. The expansion
     is the design system's one permitted animated radius — the bleed hinge —
     a photograph un-rounding as it reaches full width, settling on a correct
     static value at both ends.

     Progress drives inline styles rather than a timeline of tweens so that
     scrubbing backwards is exact: every frame is computed from `self.progress`
     alone, with no state carried between frames. */
  function initFeatureStages() {
    const sections = gsap.utils.toArray('.tp-feat');
    if (!sections.length) return;

    const clamp01 = (n) => Math.max(0, Math.min(1, n));
    /* Two curves, because the two kinds of beat want different shapes.

       `ramp` is power3.out — quick off the mark, settling slowly. That is the
       page's arrival curve, and it is what the expansion and the headline use:
       they happen once and should feel like they land.

       `blend` is a cubic in-out, slow at both ends. The cards use it, because a
       card leaving and a card arriving are the same event seen twice; an
       out-curve there makes the handoff snap at the start of each fade. Eased
       at both ends the swap reads as one continuous movement. */
    const ramp = (p, a, b) => {
      const t = clamp01((p - a) / (b - a));
      return 1 - Math.pow(1 - t, 3);
    };
    const blend = (p, a, b) => {
      const t = clamp01((p - a) / (b - a));
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    const mm = gsap.matchMedia();

    /* Pinned scrub. Above 860px only — DESIGN.md unpins scroll sections at that
       width, and a 1.5-viewport pin on a phone is a long time to be held in one
       place for four short paragraphs. */
    mm.add('(min-width: 861px) and (prefers-reduced-motion: no-preference)', () => {
      sections.forEach((section, i) => {
        const stage = section.querySelector('.tp-feat-stage');
        const head  = section.querySelector('.tp-feat-head');
        const cards = Array.prototype.slice.call(section.querySelectorAll('.tp-feat-card'));
        if (!stage || !head || !cards.length) return;

        /* One card is on screen at a time, in a fixed slot beside the image.
           Each owns an equal segment: it fades in at the top of its segment,
           holds, then fades out at the bottom — and the next one does not
           begin arriving until the previous has fully gone. They occupy the
           same grid cell, so any overlap would show two cards through each
           other; a clean handoff with a beat of empty slot is the trade.

           The last card is the exception: it holds from its arrival to the end
           of the pin, so the section releases on a readable card rather than
           on an empty frame. */
        const FIRST = 0.26, LAST = 0.96;
        const seg = (LAST - FIRST) / cards.length;
        /* Just over a quarter of the segment at each end, so every card runs
           fade-in → a hold longer than either fade → fade-out. Against the
           2.4-viewport pin below that is roughly 380px of scroll per card, of
           which ~170px is a full-opacity hold. */
        const fade = seg * 0.28;

        /* Every frame is computed from progress alone, with no state carried
           between frames, so scrubbing backwards is exact. */
        function paint(p) {
          /* 1 = inset and rounded, 0 = full-bleed and square */
          stage.style.setProperty('--exp', String(1 - ramp(p, 0, 0.16)));

          const h = ramp(p, 0.18, 0.30);
          head.style.opacity = String(h);
          head.style.transform = 'translateY(' + ((1 - h) * 26) + 'px)';

          const last = cards.length - 1;
          cards.forEach((card, n) => {
            const a = FIRST + n * seg;
            const inp = blend(p, a, a + fade);
            const out = n === last ? 0 : blend(p, a + seg - fade, a + seg);
            const c = Math.max(0, inp - out);
            card.style.opacity = String(c);
            /* rises in, and keeps rising on the way out — the slot is fixed, so
               the travel is what separates one card from the next */
            card.style.transform = 'translateY(' + ((1 - inp) * 22 - out * 14) + 'px)';
            /* a card that is not on screen is not a tab stop or a hit target */
            card.style.pointerEvents = c > 0.9 ? 'auto' : 'none';
            card.setAttribute('aria-hidden', c < 0.5 ? 'true' : 'false');
          });
        }

        const st = ScrollTrigger.create({
          trigger: section,
          start: 'top top',
          /* 2.4 viewports, not 1.6 — the extra scroll goes to the cards, so
             each one holds long enough to be read rather than skimmed */
          end: () => '+=' + Math.round(window.innerHeight * 2.4),
          pin: true,
          anticipatePin: 1,
          scrub: true,
          /* pins refresh in DOM order; #builtfor on the homepage sits above
             these and uses 2, so these take 1 and 0 */
          refreshPriority: 1 - i,
          onUpdate(self) { paint(self.progress); },
          /* a resize recomputes start/end; repaint against the new progress
             rather than leaving the last frame from the old geometry */
          onRefresh(self) { paint(self.progress); },
        });

        /* onUpdate does not fire while progress is still 0, so without this the
           first frame would be whatever CSS says — and CSS has to leave the
           headline and cards visible for the reduced-motion and sub-861px
           layouts. Painting here closes that gap; it runs while the loader is
           still covering the page, so nothing flashes. */
        paint(st.progress);
      });

      ScrollTrigger.refresh();

      /* matchMedia kills the ScrollTriggers itself; the inline styles they
         wrote are ours to clear, or the static layout inherits opacity 0. */
      return () => {
        sections.forEach((section) => {
          const stage = section.querySelector('.tp-feat-stage');
          const head  = section.querySelector('.tp-feat-head');
          if (stage) stage.style.removeProperty('--exp');
          if (head) { head.style.opacity = ''; head.style.transform = ''; }
          section.querySelectorAll('.tp-feat-card').forEach((card) => {
            card.style.opacity = '';
            card.style.transform = '';
            card.style.pointerEvents = '';
            card.removeAttribute('aria-hidden');
          });
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

    /* The feature stages own their own copy — everything else on the page uses
       the quiet handoff below. */
    const REVEAL = [
      '.tp-section-head', '.tp-intro-head', '.tp-intro-body', '.tp-model-card',
    ].join(',');

    gsap.utils.toArray(REVEAL).forEach((el) => {
      gsap.from(el, {
        opacity: 0, y: 14, duration: 0.5, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
      });
    });

    initFeatureStages();

    ScrollTrigger.refresh();
    /* lazy images land after this — one more pass once they have */
    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  }

  /* ---------- Boot ---------- */
  renderHero();
  renderIntro();
  renderLineup();
  renderFeatures();
  renderQuiz();
  renderFaqs();

  document.addEventListener('jayco:animations-ready', initMotion);
}());
