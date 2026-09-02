/* ===================================================
   Jayco — Model Detail page renderer (motorized template)
   ---------------------------------------------------
   Reads ?model=<slug> (default: swift) from
   window.JAYCO_MODEL_DETAIL and builds every section.

   Runs synchronously at parse time — the script sits at the
   end of <body>, so all containers already exist and the
   markup is in place before app.js binds the FAQ accordion.
   Motion is deferred to the 'jayco:animations-ready' event
   that app.js fires once GSAP + Lenis are live.
   =================================================== */

(function () {
  'use strict';

  const DATA = window.JAYCO_MODEL_DETAIL || {};
  const params = new URLSearchParams(window.location.search);
  const asked = params.get('model') || 'swift';
  const slug = DATA[asked] ? asked : Object.keys(DATA)[0];
  const model = DATA[slug];
  if (!model) return;
  // asked for a model that has no detail record yet — show the fallback, but keep
  // the address bar honest about which one is on screen
  if (slug !== asked && window.history && window.history.replaceState) {
    window.history.replaceState({}, '', 'model.html?model=' + slug);
  }

  /* ---------- helpers ---------- */
  const $  = (sel) => document.querySelector(sel);
  const money = (n) => '$' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  /* Fill a container, or do nothing if the page doesn't have one. Every
     renderer goes through this: an unguarded innerHTML on a container that was
     removed from model.html used to throw and kill every later section. */
  function set(sel, html) {
    const el = $(sel);
    if (el) el.innerHTML = html;
    return !!el;
  }
  function drop(sel) {                    // remove a section the model has no data for
    const el = $(sel);
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }

  /* The sticky sub-nav, declared once. renderSubnav() keeps the entries whose
     container actually survived rendering, so link order follows this table
     rather than the order the renderers happen to run in. */
  const NAV = [
    { id: 'md-intro',     label: 'Overview' },
    { id: 'md-scenery',   label: 'Gallery'  },
    { id: 'md-plan',      label: 'Layout'   },
    { id: 'md-features',  label: 'Features' },
    { id: 'md-cutaway', label: 'Construction' },
    { id: 'md-videos',    label: 'Videos'   },
    { id: 'md-specs',     label: 'Specs'    },
    { id: 'md-pricing',   label: 'Pricing'  },
    /* No FAQ entry: it now sits below the CTAs at the very end of the page, so
       a link to it would jump past everything the sub-nav exists to move
       between. The section keeps its id — it is still a valid anchor target
       from elsewhere. */
  ];

  /* Height of the fixed header + floating sub-nav, read from the same custom
     properties the 768px breakpoint overrides — so mobile needs no second
     number. Replaces the hard-coded 110 / 160 this file used to carry. */
  function navOffset() {
    const page = document.querySelector('.model-page');
    if (!page) return 146;
    const css = getComputedStyle(page);
    const header = parseFloat(css.getPropertyValue('--md-header-h')) || 86;
    const bar    = parseFloat(css.getPropertyValue('--md-subnav-h')) || 60;
    return header + bar + 24;
  }

  /* ---------- Hero ---------- */
  function renderHero() {
    const h = model.hero || {};
    /* reduced motion gets the poster frame instead of the looping video */
    const stillOnly = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const media = h.video && !stillOnly
      ? `<video class="md-hero-video" src="${h.video}" poster="${h.poster || ''}" muted loop playsinline preload="auto" autoplay></video>`
      : `<img class="md-hero-img" src="${h.poster || ''}" alt="${esc(model.name)}" />`;

    const ctas = (h.ctas || []).map((c) =>
      `<a href="${c.href}" class="btn-${c.style === 'secondary' ? 'secondary' : 'primary'}">${esc(c.label)}</a>`
    ).join('');

    set('#md-hero', `
      <div class="md-hero-media">${media}</div>
      <div class="md-hero-overlay"></div>
      <div class="md-hero-content">
        <span class="md-hero-eyebrow">${model.year} &nbsp;·&nbsp; ${esc(model.categoryLabel)}</span>
        <h1 class="md-hero-heading">${esc(h.heading || model.name)}</h1>
        ${h.sub ? `<p class="md-hero-tagline">${esc(h.sub)}</p>` : ''}
        <p class="md-hero-price">Starting at <strong>${money(model.priceFrom)}</strong></p>
        <div class="md-hero-ctas">${ctas}</div>
      </div>
      <div class="scroll-indicator">
        <span>Scroll</span>
        <svg class="scroll-arrow" width="16" height="24" viewBox="0 0 16 24" fill="none">
          <path d="M8 0v20M1 13l7 7 7-7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>`);

    document.title = `${model.year} ${model.name} — Jayco ${model.categoryLabel}`;
    /* Per-model CSS hook. The intro render's width is tuned to Swift's 1.71:1
       van; a differently-proportioned render needs its own rule rather than a
       compromise that suits neither. Inert for Swift — it just gains the
       attribute. Queried here rather than reusing navOffset()'s `page`, which
       is scoped to that function. */
    const pageEl = document.querySelector('.model-page');
    if (pageEl) pageEl.dataset.model = slug;
  }

  /* ---------- Intro (carries the high-level stats) ----------
     The stat tiles used to be their own section. Alone they were a stat row
     anchored to nothing; under the render they read as callouts of the object
     in front of you. */
  function renderIntro() {
    const i = model.intro;
    if (!i) { drop('#md-intro'); return; }

    const body = (i.body || []).map((p) => `<p class="section-body">${p}</p>`).join('');

    const stats = (model.highlights || []).map((s) => `
      <div class="md-stat">
        <span class="md-stat-value">${esc(s.value)}</span>
        <span class="md-stat-label">${esc(s.label)}</span>
        ${s.note ? `<span class="md-stat-note">${esc(s.note)}</span>` : ''}
      </div>`).join('');

    set('#md-intro', `
      <div class="md-intro-text">
        <span class="section-label">${esc(i.label)}</span>
        <h2 class="section-heading dark">${i.heading}</h2>
        ${body}
      </div>
      ${i.image ? `<figure class="md-intro-media${i.image.type === 'render' ? ' md-intro-media--render' : ''}">
        <img src="${i.image.type === 'render' ? i.image.src : (i.image.wide || i.image.src)}" alt="${esc(i.image.alt)}" loading="lazy"
             ${i.image.w && i.image.h ? `width="${i.image.w}" height="${i.image.h}"` : ''}
             ${i.image.inkCentre ? `data-ink-centre="${i.image.inkCentre}"` : ''} />
      </figure>` : ''}
      ${stats ? `<div class="md-stats">${stats}</div>` : ''}`);
  }

  /* ---------- Scenery band + detail carousel ----------
     A full-bleed exterior with the headline in its bottom-left corner, then a
     centre-snapping row of large photographs: one in focus, its neighbours
     bleeding off both edges. Only the focused frame is captioned — the copy
     lives in one block under the row and swaps as the row moves, so the eye has
     a single place to read rather than twelve competing ones.

     The track is rendered twice; the second set is an aria-hidden clone so the
     auto-advance can wrap without ever running out of runway (see
     initSceneryCarousel). */
  function renderScenery() {
    const s = model.scenery;
    if (!s || !s.items || !s.items.length) { drop('#md-scenery'); return; }

    const cards = (clone) => s.items.map((it) => `
      <figure class="md-scenery-card"${clone ? ' aria-hidden="true"' : ''}>
        <img src="${it.src}" alt="${clone ? '' : esc(it.alt)}" loading="lazy" />
      </figure>`).join('');

    /* one tick per real frame — position and, while it plays, time to the next */
    const ticks = s.items.map((it, i) => `
      <button class="md-scenery-tick" data-go="${i}" aria-label="${esc(it.title)}"><i></i></button>`).join('');

    const band = s.image ? `
      <div class="md-scenery-band">
        <img class="md-scenery-band-img" src="${s.image.wide || s.image.src}" alt="${esc(s.image.alt)}" loading="lazy" />
        <div class="md-scenery-band-scrim" aria-hidden="true"></div>
        <div class="md-scenery-band-copy">
          <h2 class="md-scenery-band-heading">${esc(s.heading || '')}</h2>
        </div>
      </div>` : '';

    set('#md-scenery', `
      ${band}
      <div class="md-scenery-carousel">
        <div class="md-scenery-track" id="md-scenery-track">${cards(false)}${cards(true)}</div>
        <div class="md-scenery-foot">
          <div class="md-scenery-caption" id="md-scenery-caption" aria-live="polite">
            <h3 class="md-scenery-title" id="md-scenery-title"></h3>
            <p class="section-body md-scenery-body" id="md-scenery-body"></p>
          </div>
          <div class="md-scenery-controls">
            <button class="md-scenery-btn" id="md-scenery-prev" aria-label="Previous detail">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>
            </button>
            <div class="md-scenery-rail" id="md-scenery-rail">${ticks}</div>
            <button class="md-scenery-btn" id="md-scenery-next" aria-label="Next detail">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>
            </button>
            <button class="md-scenery-btn md-scenery-btn--play" id="md-scenery-play" aria-label="Pause the slideshow" aria-pressed="false">
              <svg class="md-scenery-ico-pause" width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><rect x="6.5" y="5" width="3.6" height="14" rx="1.1"/><rect x="13.9" y="5" width="3.6" height="14" rx="1.1"/></svg>
              <svg class="md-scenery-ico-play" width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.2v13.6a1 1 0 0 0 1.53.85l10.2-6.8a1 1 0 0 0 0-1.7L9.53 4.35A1 1 0 0 0 8 5.2z"/></svg>
            </button>
          </div>
        </div>
      </div>`);
  }

  /* Scenery carousel — centre-snapping frames, one caption, one progress rail.

     The track holds the cards twice over, so "next" always has somewhere to go:
     once a full set has scrolled past, the position is rolled back by exactly
     one set's width onto visually identical content. The roll-back only fires
     when the track is at rest — rewriting scrollLeft mid-glide would cancel the
     browser's smooth scroll and show the seam it exists to hide.

     Everything downstream reads from scrollLeft rather than from a counter the
     JS keeps: a drag, a trackpad swipe and an arrow all move the same number,
     so the caption and the rail cannot drift out of step with what is on
     screen. Cards snap centre, so frame k rests at exactly k * step. */
  function initSceneryCarousel() {
    const track = $('#md-scenery-track');
    if (!track) return;
    const items = (model.scenery && model.scenery.items) || [];
    const carousel = track.parentElement;
    const prev  = $('#md-scenery-prev');
    const next  = $('#md-scenery-next');
    const play  = $('#md-scenery-play');
    const rail  = $('#md-scenery-rail');
    const capEl = $('#md-scenery-caption');
    const titEl = $('#md-scenery-title');
    const bodEl = $('#md-scenery-body');
    const ticks = rail ? Array.prototype.slice.call(rail.querySelectorAll('.md-scenery-tick')) : [];
    const setSize = items.length;
    if (!setSize) return;

    const AUTO_MS = 5200;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    /* the rail's fill is a CSS animation — hand it the same number so the tick
       finishes filling exactly as the next frame starts moving */
    if (rail) rail.style.setProperty('--tick-dur', AUTO_MS + 'ms');

    /* one frame's travel. Measured, not computed from the card width in CSS —
       the two would have to be kept in sync by hand. */
    function step() {
      const card = track.querySelector('.md-scenery-card');
      if (!card) return track.clientWidth * 0.8;
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return card.getBoundingClientRect().width + gap;
    }
    function setWidth() { return setSize * step(); }
    function indexAt()  { const s = step(); return s ? Math.round(track.scrollLeft / s) : 0; }

    /* ---- caption + rail ---- */
    let active = -1, swap = 0;
    function writeCaption() {
      const it = items[active];
      if (!it || !capEl) return;
      titEl.textContent = it.title;
      bodEl.textContent = it.body;
    }
    function setActive(i, immediate) {
      if (i === active || !items[i]) return;
      active = i;

      ticks.forEach((t, n) => {
        t.classList.toggle('is-on', n === i);
        t.setAttribute('aria-current', n === i ? 'true' : 'false');
      });
      /* restart the fill: removing the class alone does not rewind a running
         animation, so force a reflow between the two writes */
      const on = ticks[i];
      if (on) { on.classList.remove('is-filling'); void on.offsetWidth; on.classList.add('is-filling'); }

      if (!capEl) return;
      if (immediate) { writeCaption(); return; }
      /* the copy leaves before the next line arrives — a straight text swap
         under a moving photograph reads as a glitch. The 220 matches the exit
         transition in model.css; the entry is slower and eased there. */
      capEl.classList.add('is-out');
      clearTimeout(swap);
      swap = setTimeout(() => {
        writeCaption();
        capEl.classList.remove('is-out');
      }, 220);
    }

    let ticking = false;
    function onScroll() {
      scheduleWrap();
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        setActive(indexAt() % setSize);
      });
    }
    track.addEventListener('scroll', onScroll, { passive: true });

    /* ---- movement ----
       Driven frame by frame rather than by scrollTo({behavior:'smooth'}): the
       native curve is short and roughly linear, which on a frame this large
       reads as a lurch. Mandatory snapping has to come off for the duration —
       every scrollLeft write is an instant scroll to the browser, and it would
       re-snap each one straight back to the nearest frame. Turning it on again
       at the end costs nothing, because the animation lands on a snap point. */
    const GLIDE_MS = 900;
    let settleAt = 0, raf = 0;
    function glide(left) {
      cancelAnimationFrame(raf);
      const from = track.scrollLeft;
      const dist = left - from;
      settleAt = Date.now() + GLIDE_MS + 120;
      if (!dist) return;
      if (reduce) { track.scrollLeft = left; return; }

      track.classList.add('is-gliding');
      const t0 = performance.now();
      raf = requestAnimationFrame(function frame(now) {
        const p = Math.min(1, (now - t0) / GLIDE_MS);
        /* ease in, ease out — slow off the mark, slow into the stop */
        const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
        track.scrollLeft = from + dist * e;
        if (p < 1) raf = requestAnimationFrame(frame);
        else track.classList.remove('is-gliding');
      });
    }
    function go(dir) {
      const w = setWidth();
      /* stepping back off the front: jump forward onto the clone of the same
         frame first, so there is a card to the left to reveal */
      if (dir < 0 && track.scrollLeft <= 2 && w) track.scrollLeft += w;
      glide(track.scrollLeft + dir * step());
    }
    function jumpTo(i) {
      /* stay in whichever set we are currently in, so the jump is never longer
         than it looks — the two sets are identical anyway */
      const base = indexAt() >= setSize ? setSize : 0;
      glide((base + i) * step());
    }

    let idle = 0;
    function scheduleWrap() {
      clearTimeout(idle);
      idle = setTimeout(() => {
        if (Date.now() < settleAt) return scheduleWrap();   /* still gliding */
        const w = setWidth();
        if (w && track.scrollLeft >= w - 1) track.scrollLeft -= w;
      }, 180);
    }

    /* ---- auto-advance ---- */
    let timer = null, paused = reduce, onscreen = true, dragging = false, focused = false;

    function tick() {
      if (paused || dragging || focused || !onscreen || document.hidden) return;
      go(1);
    }
    function restart() {
      clearInterval(timer);
      if (paused) return;
      timer = setInterval(tick, AUTO_MS);
    }
    function setPaused(next) {
      paused = next;
      if (rail) {
        rail.classList.toggle('is-paused', paused);
        /* reduced motion never starts a fill, so a paused tick would read as
           empty rather than as "this one" — show it full instead. If the
           visitor presses play anyway, that is a choice: let it animate. */
        rail.classList.toggle('is-static', reduce && paused);
      }
      if (play) {
        play.classList.toggle('is-paused', paused);
        play.setAttribute('aria-pressed', paused ? 'true' : 'false');
        play.setAttribute('aria-label', paused ? 'Play the slideshow' : 'Pause the slideshow');
      }
      restart();
    }
    setPaused(paused);   /* paints the button and the rail into their start state */

    if (prev) prev.addEventListener('click', () => { go(-1); restart(); });
    if (next) next.addEventListener('click', () => { go(1);  restart(); });
    if (play) play.addEventListener('click', () => setPaused(!paused));
    ticks.forEach((t) => t.addEventListener('click', () => {
      jumpTo(parseInt(t.dataset.go, 10) || 0);
      restart();
    }));

    /* keyboard focus inside the carousel holds it still; hover does not — the
       row is viewport-wide, so a cursor resting anywhere near it would stop the
       slideshow for the whole time someone is reading the caption */
    carousel.addEventListener('focusin',  () => { focused = true; });
    carousel.addEventListener('focusout', () => { focused = false; });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        entries.forEach((en) => { onscreen = en.isIntersecting; });
      }, { threshold: 0.15 }).observe(carousel);
    }

    /* ---- drag to scroll (pointer, not touch — touch has native momentum) ---- */
    let startX = 0, startScroll = 0;
    function onMove(e) {
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 5) track.classList.add('is-dragging');
      track.scrollLeft = startScroll - dx;
    }
    function onUp() {
      dragging = false;
      track.classList.remove('is-dragging');
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onUp);
      restart();
    }
    track.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch' || dragging) return;
      /* a hand on the track outranks an animation in flight */
      cancelAnimationFrame(raf);
      track.classList.remove('is-gliding');
      dragging = true;
      startX = e.clientX;
      startScroll = track.scrollLeft;
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
      document.addEventListener('pointercancel', onUp);
    });

    /* first paint: frame one, written straight in rather than faded */
    setActive(0, true);
    window.addEventListener('resize', () => setActive(indexAt() % setSize, true));
  }

  /* ---------- The Layout ----------
     One stage per floorplan: the drawing, full width, with the two things
     there are to do with a drawing sitting on it — enlarge it, or walk it.

     It used to carry numbered hotspots and a crossfading panel of zone
     photographs beside it. That was the page's signature component and it is
     gone: it asked the reader to work through six call-outs to learn what the
     drawing already says, it halved the width of the drawing to make room for
     itself, and it only ever ran on two of this site's eighteen plans — Swift's
     two and Jay Feather's 19MRK — so fifteen plans showed a bare drawing with
     no controls at all. Every plan now gets the same component, and the
     photography those zones carried is what the Gallery and the feature bands
     are for.

     The hotspot DATA is still in model-data.js and nothing reads it. Left
     rather than deleted: it is authored copy and photography, and its own
     comment there now says it is unrendered. */
  /* ---------- The tablist driver ----------
     Still lifted out of a renderer, though only the cutaway uses it now — the
     floorplan stage was the second caller. Kept here rather than folded into
     renderCutaway because the shape is general and this is where it is
     documented.

     The contract, identical in both places: exactly one dot and one panel are
     `.is-on`, nothing ever closes, the DOM is the state, and arrows move
     selection with focus. Below 900px every panel is already visible, so a tap
     scrolls to the matching one instead of switching.

     Returns its select(i) so a caller can drive the diagram — renderPlan uses
     it to reset a floorplan back to zone 1 when you switch to it. Returns a
     no-op for a diagram with no dots, so the call site never has to guard. */
  function bindDiagram(root, dotSel, panelSel) {
    const dots = Array.prototype.slice.call(root.querySelectorAll(dotSel));
    if (!dots.length) return function () {};
    const panels = root.querySelectorAll(panelSel);
    const stacked = () => window.matchMedia('(max-width: 900px)').matches;

    function select(i) {
      dots.forEach((d, n) => {
        const on = n === i;
        d.classList.toggle('is-on', on);
        d.setAttribute('aria-selected', on ? 'true' : 'false');
        d.tabIndex = on ? 0 : -1;
      });
      panels.forEach((z, n) => z.classList.toggle('is-on', n === i));
    }

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        select(i);
        if (stacked() && panels[i]) {
          const top = panels[i].getBoundingClientRect().top + window.scrollY - navOffset();
          if (window.__jaycoLenis) window.__jaycoLenis.scrollTo(top);
          else window.scrollTo({ top: top, behavior: 'smooth' });
        }
      });
      dot.addEventListener('keydown', (e) => {
        const last = dots.length - 1;
        let next = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = i === last ? 0 : i + 1;
        if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   next = i === 0 ? last : i - 1;
        if (e.key === 'Home') next = 0;
        if (e.key === 'End')  next = last;
        if (next === null) return;
        e.preventDefault();
        select(next);
        dots[next].focus();
      });
    });

    return select;
  }

  function renderPlan() {
    const plans = model.floorplans || [];
    if (!plans.length) { drop('#md-plan'); return; }

    const p0 = model.plan || {};
    const showFilter = plans.length >= 4 && (model.floorplanFilters || []).length > 0;
    const filterRow = showFilter ? `
      <div class="md-fp-filter" id="md-fp-filter">
        <span class="md-fp-filter-label">Narrow it down</span>
        <div class="md-fp-chips">
          ${model.floorplanFilters.map((f) => `<button class="md-chip" data-filter="${f.id}">${esc(f.label)}</button>`).join('')}
          <button class="md-chip md-chip--clear" data-filter="__clear">Clear</button>
        </div>
      </div>` : '';

    /* The floorplan selector only earns its place when there is a choice to
       make. A listbox rather than a <select>: the open panel has to carry the
       band's frosted treatment, which a native option list cannot.
       `note` is a differentiator pulled from data that already exists —
       specs carries a ['Best for', …] pair — rather than a new field. */
    const planNote = (p) => {
      const hit = (p.specs || []).find((s) => s[0] === 'Best for');
      return hit ? hit[1] : '';
    };
    const selector = plans.length > 1 ? `
      <div class="md-fp-select" id="md-fp-select">
        <span class="md-fp-select-label" id="md-fp-select-label">Select Your Floorplan</span>
        <div class="md-fp-select-shell">
          <button type="button" class="md-fp-select-trigger" id="md-fp-select-trigger"
                  aria-haspopup="listbox" aria-expanded="false"
                  aria-labelledby="md-fp-select-label md-fp-select-value">
            <span class="md-fp-select-value" id="md-fp-select-value">${esc(plans[0].name)}</span>
            <svg class="md-fp-select-chev" width="18" height="18" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
                 stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
          </button>
          <!-- data-cols is set once, from the plan count: past ten options a
               single column runs longer than the list is allowed to be and the
               visitor is scrolling a dropdown. --fp-rows is ceil(n/3), which is
               what pins the grid to exactly three columns however many plans a
               model has — see .md-fp-select-list[data-cols="3"] in model.css. -->
          <ul class="md-fp-select-list" id="md-fp-select-list" role="listbox" tabindex="-1"
              aria-labelledby="md-fp-select-label" hidden
              ${plans.length >= 10 ? `data-cols="3" style="--fp-rows:${Math.ceil(plans.length / 3)}"` : ''}>
            ${plans.map((p, i) => {
              const note = planNote(p);
              /* The thumbnail is the same file as the drawing on the page, so it
                 is already in cache — a purpose-built small export would cost a
                 request to save bytes that are already spent. alt="" and an
                 aria-hidden wrapper: the option's accessible name is its text,
                 and a plan shape at 62px tells a screen reader nothing. */
              return `<li class="md-fp-option" role="option" id="fp-opt-${p.id}"
                  aria-selected="${i === 0 ? 'true' : 'false'}" data-plan="${p.id}">
                <span class="md-fp-option-thumb" aria-hidden="true">
                  <img src="${p.image}" alt="" ${i === 0 ? '' : 'loading="lazy"'} decoding="async" />
                </span>
                <span class="md-fp-option-text">
                  <span class="md-fp-option-name">${esc(p.name)}</span>
                  ${note ? `<span class="md-fp-option-note">${esc(note)}</span>` : ''}
                </span>
              </li>`;
            }).join('')}
          </ul>
        </div>
      </div>` : '';

    /* Every spec row below is guarded, because Jayco's own data is ragged: the
       Jay Feather 33BH has no published price and the 21MBH no published
       length. Unguarded, esc(undefined) prints "undefined" and money(null)
       prints "$0" — a fabricated figure sitting next to real ones. "Pricing to
       come" is build.js:363's exact wording, so the model page and the builder
       say the same thing about the same plan.
       Kept as a JS comment rather than an HTML one: this template runs once per
       floorplan, and Jay Feather would ship sixteen copies of it. */
    const panels = plans.map((p, i) => {
      const first = i === 0;

      const planAlt = esc(model.name + ' ' + p.name + ' floorplan');

      const stage = `
        <div class="md-plan-stage">
          <!-- Only the open panel's drawing is eager. Swift has two plans so this
               never mattered; Jay Feather has sixteen, fifteen of them hidden. -->
          <img class="md-plan-drawing" src="${p.image}" alt="${planAlt}"
               ${first ? '' : 'loading="lazy"'} decoding="async" />
        </div>`;

      /* The container the drawing sits in, and the rail that is now the whole
         point of it: enlarge the drawing, or walk the plan.

         Labelled, not the bare icons this rail carried when the zone panel was
         beside it and these were a footnote to it. They are the component's two
         actions now, and an unlabelled glyph in a corner is not how you say
         that. Sized and worded like the configurator's floorplan-card pair, so
         a visitor meets the same two controls in both places.

         The tour is an <a> and the zoom a <button>, because one leaves the site
         and the other opens a dialog. Which plans have a scan comes from
         JAYCO_TOURS via model-data.js's tour360; the CTA row below used to carry
         this button and no longer does, since two of the same control a hundred
         pixels apart is one too many.

         The BUTTON IS ON EVERY PLAN whether or not Jayco has scanned it. Swift's
         20E has no tour and its 20T does, and a rail that changes shape between
         two tabs of the same selector reads as a rendering fault rather than as
         a fact about the plan. Without a scan it is a disabled <button> instead
         of the <a>: `disabled` is what says unavailable without inventing a
         convention, it keeps the control out of the tab order, and assistive
         technology announces it — where an <a> with no href is not a control any
         of them can describe. Full colour either way, which is the call already
         made on the configurator's floorplan cards. */
      const zoomIcon = `
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/>
              </svg>`;
      const tourIcon = `
              <svg width="19" height="19" viewBox="0 0 216 216" fill="currentColor"
                   aria-hidden="true" focusable="false">
                <path d="M33.8,62.1v-.4s0-13,0-13c0-8.2,6.6-14.8,14.8-14.8h13c2.1,0,3.7,1.7,3.7,3.7s-1.7,3.7-3.7,3.7h-13c-4.1,0-7.4,3.3-7.4,7.4v13c0,2.1-1.7,3.7-3.7,3.7s-3.5-1.5-3.7-3.3ZM154.3,41.4h13.4c3.9.2,7,3.4,7,7.4v13h0c0,2.1,1.7,3.7,3.7,3.7s3.7-1.7,3.7-3.7v-13c0-7.9-6.2-14.4-14.1-14.8h-.8s-13,0-13,0c-2.1,0-3.7,1.7-3.7,3.7s1.7,3.7,3.7,3.7ZM150.3,133.3l-40.8,19c-1,.5-2.1.5-3.1,0l-40.8-19c-1.3-.6-2.1-1.9-2.1-3.4v-43.5c0-1.4.8-2.8,2.1-3.4l40.8-19,.4-.2c.9-.3,1.9-.3,2.8.2l40.8,19c1.3.6,2.1,1.9,2.1,3.4v43.5c0,1.4-.8,2.8-2.1,3.4ZM104.3,107.8l-33.4-15.6v35.3l33.4,15.6v-35.3ZM140,86.4l-32-14.9-32,14.9,32,14.9,32-14.9ZM145.1,92.2l-33.4,15.6v35.3l33.4-15.6v-35.3ZM61.6,174.9h-13c-4,0-7.2-3.1-7.4-7v-.4s0-13,0-13c0-2.1-1.7-3.7-3.7-3.7s-3.7,1.7-3.7,3.7v13.7c.4,7.8,6.9,14.1,14.8,14.1h13c2.1,0,3.7-1.7,3.7-3.7s-1.7-3.7-3.7-3.7ZM178.4,150.8c-2.1,0-3.7,1.7-3.7,3.7v13.4c-.2,3.8-3.2,6.8-7,7h-.4s-13,0-13,0c-2.1,0-3.7,1.7-3.7,3.7s1.7,3.7,3.7,3.7h13.7c7.6-.4,13.7-6.5,14.1-14.1v-.8s0-13,0-13c0-2.1-1.7-3.7-3.7-3.7Z"/>
              </svg>`;
      const stageBox = `
        <div class="md-plan-stage-box">
          ${stage}
          <div class="md-plan-tools">
            <button type="button" class="md-plan-tool md-plan-zoom" data-plan="${p.id}"
                    aria-label="Enlarge the ${esc(p.name)} floorplan">
              ${zoomIcon}<span class="md-plan-tool-label">Enlarge</span>
            </button>
            ${p.tour360 ? `
            <a class="md-plan-tool md-plan-tool--tour" href="${esc(p.tour360)}"
               target="_blank" rel="noopener noreferrer"
               aria-label="View the 3D tour of the ${esc(p.name)} floorplan — opens in a new tab">
              ${tourIcon}<span class="md-plan-tool-label">View 3D Tour</span>
            </a>` : `
            <button type="button" class="md-plan-tool md-plan-tool--tour" disabled aria-disabled="true"
                    aria-label="No 3D tour yet for the ${esc(p.name)} floorplan">
              ${tourIcon}<span class="md-plan-tool-label">View 3D Tour</span>
            </button>`}
          </div>
        </div>`;

      const body = stageBox;

      return `
      <div class="md-fp-panel${first ? ' is-active' : ''}"
           ${plans.length > 1 ? `role="group" aria-label="${esc(p.name)} floorplan"` : ''}
           id="fp-panel-${p.id}"
           data-plan="${p.id}">
        ${body}
        <div class="md-fp-info">
          <h3 class="md-fp-name">${esc(p.name)}</h3>
          <p class="md-fp-blurb">${esc(p.blurb)}</p>
          <ul class="md-fp-specs">
            ${p.sleeps ? `<li><span>Sleeps</span><span>${esc(p.sleeps)}</span></li>` : ''}
            ${p.length ? `<li><span>Length</span><span>${esc(p.length)}</span></li>` : ''}
            ${(p.specs || []).map(([k, v]) => `<li><span>${esc(k)}</span><span>${esc(v)}</span></li>`).join('')}
            <li><span>Starting at</span><span>${
              p.price == null ? 'Pricing to come' : money(p.price)}</span></li>
          </ul>
          <!-- Build, then all of them side by side. The primary keeps the
               leading slot it has on every other band, and the second is an
               outline button so the row still has a single obvious action.

               "View All Floorplans" goes to the configurator's floorplan step,
               which is the one view on the site that puts every plan in a model
               up at once, each with its drawing. It carries &step=floorplan
               because build-price.html otherwise opens on the model step with
               the model merely preselected — see applyDeepLink() in build.js,
               which grew the parameter for this link.

               The 3D tour was the third button here. It has moved onto the
               drawing itself, where it is one of that component's two actions —
               see .md-plan-tools above. -->
          <div class="md-fp-ctas">
            <a href="build-price.html?model=${slug}" class="btn-primary">Build This Floorplan</a>
            <a href="build-price.html?model=${slug}&amp;step=floorplan"
               class="btn-secondary-light">View All Floorplans</a>
          </div>
        </div>
      </div>`;
    }).join('');

    /* .light throughout: this section is the page's one dark band */
    set('#md-plan', `
      <div class="md-section-head">
        <span class="section-label light">${esc(p0.label || 'Floorplans')}</span>
        <h2 class="section-heading light">${esc(p0.heading || `${plans.length} way${plans.length > 1 ? 's' : ''} to lay out ${model.name}.`)}</h2>
        ${p0.body ? `<p class="section-body light">${esc(p0.body)}</p>` : ''}
      </div>
      ${filterRow}
      ${selector}
      <div class="md-fp-panels" id="md-fp-panels">${panels}</div>
      <p class="md-fp-empty" id="md-fp-empty" hidden>No floorplan matches every filter — clear one to see more.</p>`);

    /* ---- plan switching ---- */
    const optionEls = Array.from(document.querySelectorAll('.md-fp-option'));
    const panelEls  = Array.from(document.querySelectorAll('.md-fp-panel'));
    const trigger   = $('#md-fp-select-trigger');
    const listEl    = $('#md-fp-select-list');
    const valueEl   = $('#md-fp-select-value');

    function select(id) {
      optionEls.forEach((o) => {
        o.setAttribute('aria-selected', o.dataset.plan === id ? 'true' : 'false');
      });
      const chosen = plans.find((p) => p.id === id);
      if (valueEl && chosen) valueEl.textContent = chosen.name;
      panelEls.forEach((p) => {
        const on = p.dataset.plan === id;
        p.classList.toggle('is-active', on);
        /* the panel that is opening carries the only image left in it, and it
           was rendered lazy because it was hidden — promote it so the drawing
           is not fetched after the panel is already on screen */
        if (!on) return;
        const art = p.querySelector('.md-plan-drawing');
        if (art) art.loading = 'eager';
      });
      /* the panel swap changes document height — the scrubbed parallax below
         it would otherwise keep its stale start/end */
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
    }

    /* ---- the listbox ----
       The list holds focus while open and points at the cursor option with
       aria-activedescendant, so the options themselves never take focus — the
       roving-tabindex dance the tablists here use would fight the listbox
       pattern. .is-cursor is the visible counterpart of that pointer. */
    if (trigger && listEl) {
      let cursor = 0;   /* index the keyboard is sitting on, not the selection */

      const visible = () => optionEls.filter((o) => !o.classList.contains('is-hidden'));

      function paintCursor() {
        optionEls.forEach((o, i) => o.classList.toggle('is-cursor', i === cursor));
        const at = optionEls[cursor];
        if (at) {
          listEl.setAttribute('aria-activedescendant', at.id);
          /* The list scrolls once a model has enough plans to overflow it, so
             arrowing down has to bring the cursor with it. 'nearest' keeps the
             list still when the option is already in view. */
          if (at.scrollIntoView) at.scrollIntoView({ block: 'nearest' });
        }
      }

      function openList() {
        listEl.hidden = false;
        trigger.setAttribute('aria-expanded', 'true');
        /* open on the current selection, not on wherever the cursor last was */
        const sel = optionEls.findIndex((o) => o.getAttribute('aria-selected') === 'true');
        cursor = sel === -1 ? 0 : sel;
        paintCursor();
        listEl.focus();
      }

      function closeList(refocus) {
        listEl.hidden = true;
        trigger.setAttribute('aria-expanded', 'false');
        listEl.removeAttribute('aria-activedescendant');
        optionEls.forEach((o) => o.classList.remove('is-cursor'));
        if (refocus) trigger.focus();
      }

      const isOpen = () => !listEl.hidden;

      function commit(i) {
        const opt = optionEls[i];
        if (!opt) return;
        select(opt.dataset.plan);
        closeList(true);
      }

      trigger.addEventListener('click', () => (isOpen() ? closeList(false) : openList()));
      trigger.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openList();
        }
      });

      listEl.addEventListener('keydown', (e) => {
        const shown = visible();
        if (!shown.length) return;
        const pos  = shown.indexOf(optionEls[cursor]);
        const last = shown.length - 1;
        let next = null;
        if (e.key === 'ArrowDown') next = pos >= last ? 0 : pos + 1;
        if (e.key === 'ArrowUp')   next = pos <= 0 ? last : pos - 1;
        if (e.key === 'Home')      next = 0;
        if (e.key === 'End')       next = last;
        /* Once the list lays out in columns it is a 2D field, so left and right
           should move by a column rather than do nothing. The grid is
           column-major — DOM order runs down column one, then column two — so a
           column is exactly `rows` steps, and up/down keep meaning what they
           look like. Clamped rather than wrapped: falling off the side of a
           grid and reappearing on the far edge reads as a glitch. */
        const rows = parseInt(listEl.style.getPropertyValue('--fp-rows'), 10);
        if (rows > 0 && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
          const step = e.key === 'ArrowRight' ? rows : -rows;
          next = Math.min(last, Math.max(0, pos + step));
        }
        if (next !== null) {
          e.preventDefault();
          cursor = optionEls.indexOf(shown[next]);
          paintCursor();
          return;
        }
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); commit(cursor); return; }
        if (e.key === 'Escape' || e.key === 'Tab') {
          /* Tab closes too, or focus would land inside a list the sighted
             visitor can no longer see */
          if (e.key === 'Escape') e.preventDefault();
          closeList(true);
        }
      });

      optionEls.forEach((o, i) => {
        o.addEventListener('click', () => commit(i));
        o.addEventListener('mousemove', () => { cursor = i; paintCursor(); });
      });

      /* pointerdown, not click: a mousedown that starts outside should dismiss
         before the click ever resolves */
      document.addEventListener('pointerdown', (e) => {
        if (isOpen() && !e.target.closest('#md-fp-select')) closeList(false);
      });
    }

    /* ---- Floorplan zoom ----
       One modal serves every plan and reads the live drawing when it opens, so
       it can never drift out of step with the dropdown. It is appended to
       <body> rather than left inside the section: Lenis can transform a scroll
       wrapper, and position:fixed inside a transformed ancestor resolves
       against that ancestor instead of the viewport.
       Closed state is visibility+opacity, not [hidden] — visibility already
       takes it out of the a11y tree and out of hit-testing, and it leaves the
       fade able to run in both directions without a timer to undo display. */
    const zoomBtns = Array.from(document.querySelectorAll('.md-plan-zoom'));
    if (zoomBtns.length) {
      const modal = document.createElement('div');
      modal.className = 'md-zoom';
      modal.hidden = true;
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-label', 'Floorplan, enlarged');
      modal.innerHTML = `
        <div class="md-zoom-scrim" data-zoom-close="1"></div>
        <button type="button" class="md-zoom-close" aria-label="Close the enlarged floorplan">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="1.9" stroke-linecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18"/>
          </svg>
        </button>
        <div class="md-zoom-inner">
          <!-- seeded with the first plan so the document never carries an image
               with an empty src; openZoom overwrites both from the live drawing.
               The file is already on the page, so this costs no extra request. -->
          <img class="md-zoom-img" src="${plans[0].image}"
               alt="${esc(model.name + ' ' + plans[0].name + ' floorplan')}" />
          <span class="md-zoom-caption">${esc(model.name + ' ' + plans[0].name)}</span>
        </div>`;
      document.body.appendChild(modal);

      const zImg   = modal.querySelector('.md-zoom-img');
      const zCap   = modal.querySelector('.md-zoom-caption');
      const zClose = modal.querySelector('.md-zoom-close');
      let returnTo = null;

      let hideT = null;

      function openZoom(btn) {
        const panel = document.querySelector('.md-fp-panel.is-active');
        const art   = panel && panel.querySelector('.md-plan-drawing');
        if (!art) return;
        const plan = plans.find((p) => p.id === panel.dataset.plan);
        zImg.src = art.src;
        zImg.alt = art.alt;
        zCap.textContent = plan ? model.name + ' ' + plan.name : '';
        returnTo = btn || null;
        clearTimeout(hideT);         /* a previous close may still be fading */
        modal.hidden = false;        /* display:flex, opacity still 0 */
        /* Lenis keeps scrolling the page under a fixed overlay, so stopping it
           is the actual scroll lock here; overflow:hidden covers the no-Lenis
           case and native touch scrolling. */
        document.body.style.overflow = 'hidden';
        if (window.__jaycoLenis && window.__jaycoLenis.stop) window.__jaycoLenis.stop();
        /* Focus straight away: display:none -> flex is not a transition, so the
           button is focusable the moment the attribute comes off. The fade is
           kicked off on the next frame — starting it in this tick would give the
           browser no 0-opacity state to animate from. */
        zClose.focus();
        requestAnimationFrame(() => modal.classList.add('is-open'));
      }

      function closeZoom() {
        if (modal.hidden) return;
        modal.classList.remove('is-open');
        document.body.style.overflow = '';
        if (window.__jaycoLenis && window.__jaycoLenis.start) window.__jaycoLenis.start();
        if (returnTo) returnTo.focus();
        returnTo = null;
        /* back to display:none once the fade is done, so it leaves the
           accessibility tree rather than lingering as a transparent layer */
        clearTimeout(hideT);
        hideT = setTimeout(() => { modal.hidden = true; }, 320);
      }

      zoomBtns.forEach((b) => b.addEventListener('click', () => openZoom(b)));
      zClose.addEventListener('click', closeZoom);
      modal.addEventListener('click', (e) => {
        if (e.target.dataset.zoomClose) closeZoom();
      });
      modal.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { e.preventDefault(); closeZoom(); return; }
        /* the close button is the only focusable thing in here, so the trap is
           simply: Tab cannot leave */
        if (e.key === 'Tab') { e.preventDefault(); zClose.focus(); }
      });
    }

    if (!showFilter) return;

    /* chip filtering — a plan survives only if it matches every active chip */
    const active = new Set();
    const chips  = Array.from(document.querySelectorAll('.md-chip'));
    const empty  = $('#md-fp-empty');

    function applyFilters() {
      const matches = plans.filter((p) =>
        Array.from(active).every((id) => {
          const f = model.floorplanFilters.find((x) => x.id === id);
          return f ? f.match(p) : true;
        })
      );
      const ids = matches.map((p) => p.id);
      /* filters hide options in the dropdown now, not tabs in a row */
      optionEls.forEach((o) => o.classList.toggle('is-hidden', ids.indexOf(o.dataset.plan) === -1));
      empty.hidden = ids.length > 0;
      const current = document.querySelector('.md-fp-panel.is-active');
      if (ids.length && (!current || ids.indexOf(current.dataset.plan) === -1)) {
        select(ids[0]);                                    /* select() refreshes */
      } else if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();                           /* hiding options also moves things */
      }
    }

    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        if (chip.dataset.filter === '__clear') {
          active.clear();
          chips.forEach((c) => c.classList.remove('is-on'));
        } else {
          const id = chip.dataset.filter;
          if (active.has(id)) { active.delete(id); chip.classList.remove('is-on'); }
          else                { active.add(id);    chip.classList.add('is-on'); }
        }
        applyFilters();
      });
    });
  }

  /* ---------- Pricing ----------

     One figure or two. A model whose floorplans all cost the same (Swift) says
     one number; a model whose floorplans span sixteen thousand dollars says
     both ends, because a lone "from" price reads as the price and sets up a
     surprise at the dealer.

     The range is set in model-data.js rather than derived from the floorplan
     table on purpose: the copy beside it names the two floorplans by code, and
     a silently-derived pair would drift out of step with that sentence the
     first time a plan is added. What runs here instead is the check — the pair
     is proved against the same table the floorplan list prints from, so the
     two can never disagree without saying so. */
  function priceRangeCheck(p) {
    const priced = (model.floorplans || [])
      .map((f) => f.price).filter((n) => typeof n === 'number');
    if (priced.length < 2) return;
    const low = Math.min.apply(null, priced);
    const high = Math.max.apply(null, priced);
    if (p.msrp !== low || (p.msrpHigh != null && p.msrpHigh !== high)) {
      console.warn('[jayco] pricing range is out of step with the floorplan table. '
        + 'Shown ' + money(p.msrp) + (p.msrpHigh ? '–' + money(p.msrpHigh) : '')
        + ', floorplans run ' + money(low) + '–' + money(high) + '. '
        + 'Fix pricing.msrp / pricing.msrpHigh in model-data.js — and the '
        + 'floorplan codes named in msrpNote, which will have moved too.');
    }
  }

  /* Ranges set smaller than a single figure. Two prices and a dash is more than
     twice the characters, and at the display size it would wrap mid-range on
     any laptop; the number is still the largest thing in the card. */
  /* The star is a link to the note beneath, not decoration, so it carries a
     real reference rather than sitting in the DOM as a bare glyph a screen
     reader would read as "asterisk" and leave unexplained. On a range it goes
     on the HIGH end — the last figure the eye lands on, and the one someone is
     most likely to read as what they will pay. */
  const STAR = '<sup class="md-price-star" aria-hidden="true">*</sup>';

  function priceFigure(p) {
    if (p.msrpHigh == null) {
      return `<span class="md-price-msrp-value">${money(p.msrp)}${STAR}</span>`;
    }
    return `<span class="md-price-msrp-value md-price-msrp-value--range">`
      + `<span class="md-price-end">${money(p.msrp)}</span>`
      /* The dash is shape, not speech — an en dash is read out inconsistently
         and sometimes not at all, which would leave two prices and nothing
         joining them. Spoken as the word instead. */
      + `<span class="md-price-dash" aria-hidden="true">–</span>`
      + `<span class="sr-only"> to </span>`
      + `<span class="md-price-end">${money(p.msrpHigh)}${STAR}</span>`
      + `</span>`;
  }

  function renderPricing() {
    const p = model.pricing;
    if (!p) { drop('#md-pricing'); return; }
    priceRangeCheck(p);

    const mandatory = p.mandatory ? `
      <div class="md-price-card md-price-card--pkg">
        <div class="md-price-card-head">
          <span class="md-price-tag">${esc(p.mandatory.note || 'Included')}</span>
          <h3>${esc(p.mandatory.name)}</h3>
          <span class="md-price-figure">${money(p.mandatory.price)}</span>
        </div>
        <ul class="md-price-list">
          ${p.mandatory.items.map((i) => `<li>${esc(i)}</li>`).join('')}
        </ul>
      </div>` : '';

    const options = (p.options || []).length ? `
      <div class="md-price-card">
        <div class="md-price-card-head">
          <span class="md-price-tag">Popular options</span>
          <h3>Make it yours</h3>
        </div>
        <ul class="md-price-options">
          ${p.options.map((o) => `
            <li>
              <div class="md-opt-text">
                <span class="md-opt-name">${esc(o.name)}</span>
                ${o.note ? `<span class="md-opt-note">${esc(o.note)}</span>` : ''}
              </div>
              <span class="md-opt-price">${money(o.price)}</span>
            </li>`).join('')}
        </ul>
      </div>` : '';

    set('#md-pricing', `
      <div class="md-pricing-inner">
        <div class="md-price-lead">
          <div class="md-section-head md-section-head--left">
            <h2 class="section-heading dark">${esc(p.heading)}</h2>
            <div class="md-price-msrp">
              <!-- The figure is labelled rather than left to speak for itself:
                   this is one number on a page that also quotes a price per
                   floorplan and a price per package, and "MSRP starting at"
                   says which of them it is. -->
              <span class="md-price-msrp-label">MSRP starting at</span>
              ${priceFigure(p)}
              <p class="md-price-star-note">
                <span class="md-price-star" aria-hidden="true">*</span>
                ${esc(p.starNote)}
              </p>
              <span class="md-price-msrp-note">${esc(p.msrpNote)}</span>
            </div>
          </div>
        </div>
        <div class="md-price-cards">${mandatory}${options}</div>
      </div>
      <p class="md-price-disclaimer">${esc(p.disclaimer)}</p>`);
  }

  /* ---------- Features ----------
     A photo-free reference list. One eyebrow for the section, the categories as
     a tab row, and the chosen category's rows in a surface panel below it.
     The row is a <dt>/<dd> pair because that is what it is — a name and its
     description — wrapped in a div so each pair can be its own grid. The rows
     keep the spec table's idiom (hairline separators, the same 42% key column)
     so this section and the specs below it read as one reference zone. */
  function renderFeatures() {
    const groups = (model.featureGroups || []).filter((g) => g.items && g.items.length);
    if (!groups.length) { drop('#md-features'); return; }

    const f = model.features || {};

    set('#md-features', `
      <div class="md-features-inner">
        <div class="md-section-head">
          <span class="section-label">${esc(f.label || 'Features')}</span>
          <h2 class="section-heading dark">${esc(f.heading || 'Standard equipment.')}</h2>
          ${f.body ? `<p class="section-body">${esc(f.body)}</p>` : ''}
        </div>
        <!-- --i carries each group's index into CSS. Below 768px the tab row
             becomes an accordion, and the stylesheet uses --i to interleave
             every header with its own panel via flex order — same markup, same
             single-open behaviour, no duplicated headings. -->
        <div class="md-feat-tabs" id="md-feat-tabs" role="tablist" aria-label="Feature categories">
          ${groups.map((g, i) => `
            <button type="button" class="md-feat-tab${i === 0 ? ' is-active' : ''}" role="tab"
                    id="feat-tab-${g.id}" aria-controls="feat-panel-${g.id}"
                    aria-selected="${i === 0 ? 'true' : 'false'}" tabindex="${i === 0 ? '0' : '-1'}"
                    style="--i:${i}" data-group="${g.id}"><span class="md-feat-tab-label">${esc(g.name)}</span><span class="md-feat-chev" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg></span></button>`).join('')}
        </div>
        <div class="md-feat-panels">
          ${groups.map((g, i) => `
            <div class="md-feat-panel${i === 0 ? ' is-active' : ''}" role="tabpanel"
                 id="feat-panel-${g.id}" aria-labelledby="feat-tab-${g.id}"
                 style="--i:${i}" data-group="${g.id}" tabindex="0">
              <dl class="md-featlist">
                ${g.items.map((it) => `
                  <div class="md-featrow">
                    <dt class="md-feat-title">${esc(it.title)}</dt>
                    <dd class="md-feat-body">${esc(it.body)}</dd>
                  </div>`).join('')}
              </dl>
            </div>`).join('')}
        </div>
      </div>`);

    /* Tab wiring — the tablist pattern the floorplan zones use: one tab in the
       tab order at a time, arrows to move between them. Without the arrow keys
       every category after the first is unreachable from the keyboard. */
    const tabs   = Array.from(document.querySelectorAll('.md-feat-tab'));
    const panels = Array.from(document.querySelectorAll('.md-feat-panel'));

    /* Below 768px the same control is drawn as an accordion (see model.css).
       The interaction is identical — one group open at a time — but the ARIA
       has to follow the picture: a stack of headers each sitting directly above
       its own content is a disclosure set, not a tab strip, and announcing
       "tab 2 of 4, selected" over an accordion is worse than saying nothing.
       So the roles are swapped at the breakpoint rather than left on one story
       that is wrong at one of the two sizes. */
    const accordion = window.matchMedia('(max-width: 768px)');
    const tablist = document.getElementById('md-feat-tabs');

    function applyMode() {
      const acc = accordion.matches;
      if (tablist) {
        if (acc) tablist.removeAttribute('role');
        else tablist.setAttribute('role', 'tablist');
      }
      tabs.forEach((t) => {
        const on = t.classList.contains('is-active');
        if (acc) {
          t.removeAttribute('role');
          t.removeAttribute('aria-selected');
          t.setAttribute('aria-expanded', on ? 'true' : 'false');
          t.tabIndex = 0;               // every header is reachable by Tab
        } else {
          t.setAttribute('role', 'tab');
          t.removeAttribute('aria-expanded');
          t.setAttribute('aria-selected', on ? 'true' : 'false');
          t.tabIndex = on ? 0 : -1;     // roving tabindex, arrows move between
        }
      });
      panels.forEach((p) => p.setAttribute('role', acc ? 'region' : 'tabpanel'));
    }

    function selectGroup(id) {
      tabs.forEach((t) => {
        const on = t.dataset.group === id;
        t.classList.toggle('is-active', on);
      });
      panels.forEach((p) => p.classList.toggle('is-active', p.dataset.group === id));
      applyMode();                      // rewrites selected/expanded for the mode in play
      /* categories hold 3–5 rows, so a switch changes document height — the
         scrubbed parallax further down would otherwise keep stale start/end */
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
    }

    applyMode();
    accordion.addEventListener('change', applyMode);

    tabs.forEach((t, i) => {
      t.addEventListener('click', () => selectGroup(t.dataset.group));
      t.addEventListener('keydown', (e) => {
        /* Arrow-key roving belongs to the tab strip. In accordion mode every
           header is in the tab order already, so hijacking the arrows would
           fight the page scroll. */
        if (accordion.matches) return;
        const last = tabs.length - 1;
        let next = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = i === last ? 0 : i + 1;
        if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   next = i === 0 ? last : i - 1;
        if (e.key === 'Home') next = 0;
        if (e.key === 'End')  next = last;
        if (next === null) return;
        e.preventDefault();
        selectGroup(tabs[next].dataset.group);
        tabs[next].focus();
      });
    });
  }

  /* ---------- Full specifications ---------- */

  /* ---------- Cutaway ----------
     A sibling of the floorplan hotspots, not a reuse of them: those
     dereference `h.image` unguarded and throw without a photograph per pin,
     and these pins have none. Jayco publishes the eight construction element
     names and no description under any of them, so a name is the whole
     callout — `body` is optional and stays empty until approved copy exists.

     Full-width art with the deck beneath it, rather than the floorplan's
     side-by-side split: this is a rendered diagram with eight pins on
     structural members, and at ~770px the pins would crowd the roofline. */
  function renderCutaway() {
    const c = model.cutaway;
    if (!c || !c.image || !c.pins || !c.pins.length) { drop('#md-cutaway'); return; }

    const im = c.image;
    /* The diagram's meaning IS its callout list, so the alt enumerates them —
       same reasoning as the floorplan drawing's alt. */
    const alt = esc((im.alt || (model.name + ' construction cutaway')) + ': ' +
      c.pins.map((x) => x.title.toLowerCase()).join(', '));

    const pins = c.pins.map((h, n) => `
      <button type="button" class="md-cutaway-pin${n === 0 ? ' is-on' : ''}" role="tab"
              id="cut-tab-${n}" aria-controls="cut-panel-${n}"
              aria-selected="${n === 0 ? 'true' : 'false'}" tabindex="${n === 0 ? '0' : '-1'}"
              style="left:${h.x}%;top:${h.y}%">
        <span aria-hidden="true">${n + 1}</span><span class="sr-only">${esc(h.title)}</span>
      </button>`).join('');

    const panels = c.pins.map((h, n) => `
      <article class="md-cutaway-panel${n === 0 ? ' is-on' : ''}" role="tabpanel"
               id="cut-panel-${n}" aria-labelledby="cut-tab-${n}" tabindex="0">
        <span class="md-cutaway-num" aria-hidden="true">${n + 1}</span>
        <h3 class="md-cutaway-title">${esc(h.title)}</h3>
        ${h.body ? `<p class="md-cutaway-body">${esc(h.body)}</p>` : ''}
      </article>`).join('');

    set('#md-cutaway', `
      <div class="md-cutaway-inner">
        <div class="md-section-head">
          <span class="section-label">${esc(c.label || 'Construction')}</span>
          <h2 class="section-heading dark">${esc(c.heading || 'How it is built.')}</h2>
          ${c.body ? `<p class="section-body">${esc(c.body)}</p>` : ''}
        </div>

        <figure class="md-cutaway-figure">
          <div class="md-cutaway-stage">
            <img class="md-cutaway-art" src="${im.src}"
                 ${im.mid ? `srcset="${im.mid} 1100w, ${im.src} ${im.w || 1636}w"
                 sizes="(max-width: 900px) 92vw, min(1344px, 92vw)"` : ''}
                 ${im.w ? `width="${im.w}" height="${im.h}"` : ''}
                 alt="${alt}" loading="lazy" decoding="async" />
            <!-- unstyled on purpose: it carries role="tablist" and nothing else.
                 Giving it position or padding moves every pin off the art. -->
            <div class="md-cutaway-pins" role="tablist" aria-label="Construction elements">${pins}</div>
          </div>
        </figure>

        <div class="md-cutaway-panels">${panels}</div>
        ${c.note ? `<p class="md-cutaway-note">${esc(c.note)}</p>` : ''}
      </div>`);

    const root = $('#md-cutaway');
    if (root) bindDiagram(root, '.md-cutaway-pin', '.md-cutaway-panel');
  }

  /* ---------- Videos ----------
     Facades, not embeds. Eight YouTube iframes on load would pull megabytes of
     player script and cookies before anyone has asked to watch anything, so a
     card is a thumbnail and a button until it is clicked; only then is the
     iframe built, and only for the one that was clicked.
     youtube-nocookie.com, so a visitor who never presses play is never
     tracked.

     A rail rather than a grid: eight portrait cards stacked 4x2 was a thousand
     pixels of page for a section nobody has asked to watch yet. One row that
     runs off the right edge says there is more without spending the height.

     The head is contained and the rail is not — the rail is a sibling of the
     inner, not a child, so it can run to the viewport edge while the heading
     and arrows stay on the page's 1440 spine. Its lead padding puts card one
     back on that same spine, so only the right side bleeds. */
  function renderVideos() {
    const v = model.videos;
    const items = (v && v.items) || [];
    if (!items.length) { drop('#md-videos'); return; }

    const arrow = (dir, d) => `
      <button type="button" class="md-video-nav" id="md-video-${dir}"
              aria-label="${dir === 'prev' ? 'Previous' : 'Next'} videos" aria-controls="md-video-track">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>
      </button>`;

    set('#md-videos', `
      <div class="md-videos-inner">
        <div class="md-videos-head">
          <div class="md-section-head">
            <span class="section-label">${esc(v.label || 'Videos')}</span>
            <h2 class="section-heading dark">${esc(v.heading || 'Watch the walkthroughs.')}</h2>
            ${v.body ? `<p class="section-body">${esc(v.body)}</p>` : ''}
          </div>
          <div class="md-video-controls">
            ${arrow('prev', 'M15 5l-7 7 7 7')}
            ${arrow('next', 'M9 5l7 7-7 7')}
          </div>
        </div>
      </div>
      <ul class="md-video-track" id="md-video-track" role="list">
          ${items.map((it) => `
            <li class="md-video">
              <button type="button" class="md-video-btn" data-video="${esc(it.id)}"
                      aria-label="Play video: ${esc(it.title)}">
                <span class="md-video-thumb">
                  <img src="https://i.ytimg.com/vi/${esc(it.id)}/maxresdefault.jpg"
                       alt="" aria-hidden="true" loading="lazy" decoding="async"
                       onerror="this.src='https://i.ytimg.com/vi/${esc(it.id)}/hqdefault.jpg'" />
                  <span class="md-video-play" aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5.2v13.6a1 1 0 0 0 1.53.85l10.2-6.8a1 1 0 0 0 0-1.7L9.53 4.35A1 1 0 0 0 8 5.2z"/>
                    </svg>
                  </span>
                </span>
                <span class="md-video-text">
                  <span class="md-video-title">${esc(it.title)}</span>
                  ${it.note ? `<span class="md-video-note">${esc(it.note)}</span>` : ''}
                </span>
              </button>
            </li>`).join('')}
      </ul>`);

    document.querySelectorAll('.md-video-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.video;
        const card = btn.closest('.md-video');
        const frame = document.createElement('iframe');
        frame.className = 'md-video-frame';
        frame.src = `https://www.youtube-nocookie.com/embed/${id}?rel=0&autoplay=1`;
        frame.title = btn.querySelector('.md-video-title').textContent;
        frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        frame.allowFullscreen = true;
        /* The button becomes the player plus its caption. It is replaced, not
           hidden: leaving a spent "play" control in the tab order in front of a
           live iframe gives keyboard users a button that does nothing. */
        const text = btn.querySelector('.md-video-text');
        card.classList.add('is-playing');
        btn.replaceWith(frame, text);
        frame.focus();
      });
    });
  }

  /* Video rail — native scroll, arrows on top of it.

     No auto-advance and no clone track, unlike the scenery carousel: that one
     is a slideshow you watch, this one is a shelf you pick from. A rail that
     moves on its own while you are reading eight titles is a nuisance, and
     wrapping past the last video would hide the fact that you have seen them
     all — which is exactly what the disabled arrow is there to say.

     Position is read from scrollLeft, never from a counter, so a swipe, a
     trackpad flick and an arrow all leave the buttons telling the truth. */
  function initVideoCarousel() {
    const track = $('#md-video-track');
    const prev  = $('#md-video-prev');
    const next  = $('#md-video-next');
    if (!track || !prev || !next) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* measured, not computed from the CSS card width — the two would otherwise
       have to be kept in sync by hand across three breakpoints */
    function step() {
      const card = track.querySelector('.md-video');
      if (!card) return track.clientWidth;
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return card.getBoundingClientRect().width + gap;
    }
    /* a whole card-widths' worth of what is on screen: the partly-visible card
       at the right edge becomes the first fully-visible one after the click,
       so nothing is ever scrolled past unseen.

       The lead padding is subtracted because at rest it holds no card — count
       from where the row actually starts. Once scrolled that space does carry
       cards, so a later click overlaps by one rather than skipping one, which
       is the side to err on. */
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
      prev.disabled = track.scrollLeft <= 1;
      next.disabled = track.scrollLeft >= max - 1;
    }

    prev.addEventListener('click', () => go(-1));
    next.addEventListener('click', () => go(1));
    track.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    /* the cards are sized off the track's width, so the first honest
       measurement is after layout, not during the render pass */
    requestAnimationFrame(sync);
  }

  function renderSpecs() {
    const s = model.specs;
    if (!s || !s.groups || !s.groups.length) { drop('#md-specs'); return; }

    const cols = s.columns || [];
    const head = `<tr><th class="md-spec-key">Specification</th>${cols.map((c, i) =>
      `<th class="md-spec-col md-spec-col-${i}">${esc(c)}</th>`).join('')}</tr>`;

    /* a group header carries one line saying what its numbers mean — a figure
       without that line is data, not persuasion */
    const body = s.groups.map((g) => `
      <tr class="md-spec-group"><th colspan="${cols.length + 1}">
        <span class="md-spec-group-name">${esc(g.group)}</span>
        ${g.note ? `<span class="md-spec-group-note">${esc(g.note)}</span>` : ''}
      </th></tr>
      ${g.rows.map((r) => `
        <tr>
          <td class="md-spec-key">${esc(r[0])}</td>
          ${cols.map((_, i) => `<td class="md-spec-col md-spec-col-${i}">${esc(r[i + 1] != null ? r[i + 1] : '—')}</td>`).join('')}
        </tr>`).join('')}`).join('');

    const toggle = cols.length > 1 ? `
      <div class="md-spec-switch" id="md-spec-switch">
        ${cols.slice(0, 3).map((c, i) => `<button class="md-spec-switch-btn${i === 0 ? ' is-active' : ''}" data-col="${i}">${esc(c)}</button>`).join('')}
      </div>` : '';

    set('#md-specs', `
      <div class="md-specs-inner">
        <div class="md-section-head">
          <h2 class="section-heading dark">${esc(s.heading)}</h2>
        </div>
        ${toggle}
        <div class="md-spec-table-wrap">
          <table class="md-spec-table is-col-0">
            <thead>${head}</thead>
            <tbody>${body}</tbody>
          </table>
        </div>
        ${s.footnote ? `<p class="md-spec-foot">${esc(s.footnote)}</p>` : ''}
      </div>`);

    /* the switch only matters at mobile widths, where one column shows at a time */
    const table = document.querySelector('.md-spec-table');
    document.querySelectorAll('.md-spec-switch-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.md-spec-switch-btn').forEach((b) => b.classList.toggle('is-active', b === btn));
        table.className = 'md-spec-table is-col-' + btn.dataset.col;
      });
    });
  }

  /* ---------- See it in person (+ brochure, compare) ----------
     The page's whole job is to get someone standing next to the coach, so the
     dealer ask leads the closing band and everything else sits beneath it. */
  function renderCtas() {
    const v = model.visit;
    const b = model.brochure;
    const c = model.compare;
    if (!v && !b && !c) { drop('#md-ctas'); return; }

    /* An array, the same shape hero.ctas already uses, so a second ask needs
       data and not a second template. The single-`cta` form is still accepted:
       a record written before this band took two buttons keeps working, and
       gets the primary it always had. */
    const visitCtas = (v && (v.ctas || (v.cta ? [v.cta] : [])))
      .map((c) => `<a href="${c.href}" class="btn-${
        c.style === 'secondary' ? 'secondary' : 'primary'}">${esc(c.label)}</a>`).join('');

    const visit = v ? `
      <div class="md-cta-lead">
        <span class="section-label light">${esc(v.label)}</span>
        <h2 class="md-cta-heading light">${esc(v.heading)}</h2>
        <p class="md-cta-body light">${esc(v.body)}</p>
        <div class="md-cta-ctas">${visitCtas}</div>
        ${v.note ? `<span class="md-cta-note">${esc(v.note)}</span>` : ''}
      </div>` : '';

    /* The two quieter asks sit side by side as a matched pair of panels: the
       brochure on its photograph, compare on the band navy. Same geometry and
       centred content, so they read as two of the same thing rather than a
       photo block next to a text block. */
    const secondary = (b || c) ? `
      <div class="md-cta-secondary">
        ${b ? `
        <div class="md-cta-panel md-cta-panel--photo">
          ${b.image ? `
            <img class="md-cta-panel-bg" src="${b.image}" alt="" aria-hidden="true" loading="lazy" />
            <div class="md-cta-panel-scrim" aria-hidden="true"></div>` : ''}
          <div class="md-cta-panel-text">
            <h3>${esc(b.heading)}</h3>
            <p>${esc(b.body)}</p>
            <!-- data-brochure-open hands this to the shared request form
                 (js/brochure-form.js), prefilled with this model. The href is a
                 real page rather than "#", so it still goes somewhere with JS
                 off — and that is also what takes it out of the preventDefault
                 net below, exactly as that comment asks. -->
            <a href="${b.cta.href}" class="btn-secondary"${
              b.cta.open ? ` data-brochure-open="${esc(b.cta.open)}"` : ''}>${esc(b.cta.label)}</a>
          </div>
        </div>` : ''}
        ${c ? `
        <div class="md-cta-panel md-cta-panel--solid">
          <div class="md-cta-panel-text">
            <h3>${esc(c.heading)}</h3>
            <p>${esc(c.body)}</p>
            <a href="${c.cta.href}" class="btn-secondary">${esc(c.cta.label)}</a>
          </div>
        </div>` : ''}
      </div>` : '';

    set('#md-ctas', `<div class="md-cta-inner">${visit}${secondary}</div>`);

    /* PLACEHOLDER HREFS. Two destinations on this band do not exist yet — the
       dealer inventory page, and the brochure PDF, which has never been in the
       repo. "#" is what the site already uses for those (the footer is full of
       them), but left bare a click scrolls the document to the top and Lenis
       smooth-scrolls the whole way, which reads as the button misfiring rather
       than as nothing happening. Scoped to this section and to "#" alone, so
       pointing either href at a real page takes it out of the net. */
    const band = $('#md-ctas');
    if (band) {
      band.querySelectorAll('a[href="#"]').forEach((a) => {
        a.addEventListener('click', (e) => e.preventDefault());
      });
    }
  }

  /* ---------- Similar models (from the shared models-data.js) ---------- */
  function renderSimilar() {
    const lib = (window.JAYCO && window.JAYCO.models) || {};
    const slugs = (model.similar || []).filter((s) => lib[s] && s !== slug);
    /* a slug with no real detail record would fall back to THIS model and
       silently show the wrong vehicle — send those to their own category
       overview, which shows that model's real card rather than another's page */
    const hrefFor = (s) => (DATA[s] && !DATA[s].stub)
      ? `model.html?model=${s}`
      : 'type.html?type=' + ((lib[s] && lib[s].category) || '');
    if (!slugs.length) { drop('#md-similar'); return; }

    const cards = slugs.map((s) => {
      const m = lib[s];
      /* value over label, the way a spec reads on a card — the library stores
         them label-first, so the pair is flipped here, not in the data */
      const stats = Object.keys(m.specs || {}).slice(0, 3).map((k) => `
        <div class="md-similar-stat">
          <span class="md-similar-stat-value">${esc(m.specs[k])}</span>
          <span class="md-similar-stat-label">${esc(k)}</span>
        </div>`).join('');

      return `
        <a class="md-similar-card" href="${hrefFor(s)}">
          <h3 class="md-similar-name">${esc(m.name)}</h3>
          <p class="md-similar-tagline">${esc(m.tagline)}</p>
          <span class="md-similar-price">Starting at ${money(m.basePrice)}${m.year ? ' · ' + m.year : ''}</span>
          <div class="md-similar-media"><img src="${m.img}" alt="${esc(m.name)}" loading="lazy" /></div>
          <div class="md-similar-stats">${stats}</div>
        </a>`;
    }).join('');

    set('#md-similar', `
      <div class="md-section-head">
        <h2 class="section-heading dark">More ways to go.</h2>
      </div>
      <div class="md-similar-grid">${cards}</div>`);
  }

  /* ---------- FAQ (markup matches style.css so app.js initFaq drives it) ---------- */
  function renderFaqs() {
    const faqs = model.faqs || [];
    const list = $('#md-faq-list');
    if (!faqs.length || !list) { drop('#faq'); return; }

    list.innerHTML = faqs.map((f) => `
      <div class="faq-item">
        <button class="faq-question" aria-expanded="false">
          <span>${esc(f.q)}</span>
          <span class="faq-icon" aria-hidden="true"></span>
        </button>
        <div class="faq-answer"><p>${esc(f.a)}</p></div>
      </div>`).join('');
  }

  /* ---------- Sticky sub-nav ---------- */
  function renderSubnav() {
    const wrap  = $('#md-subnav');
    const links = $('#md-subnav-links');
    if (!wrap || !links) return;

    const model_el = $('#md-subnav-model');
    if (model_el) model_el.textContent = `${model.year} ${model.name}`;

    /* only the sections that actually rendered */
    const items = NAV.filter((n) => document.getElementById(n.id));
    if (!items.length) { drop('#md-subnav'); return; }

    /* the highlight is one element that slides between items, not a background
       that blinks on and off each link */
    links.innerHTML = items.map((n) =>
      `<li><a href="#${n.id}" data-target="${n.id}">${esc(n.label)}</a></li>`).join('')
      + '<li class="md-subnav-pill" aria-hidden="true"></li>';
    const pill = links.querySelector('.md-subnav-pill');

    links.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.getElementById(a.dataset.target);
        if (!target) return;
        /* land on the section's first real content, not on its top padding */
        const head = target.querySelector(
          '.md-section-head, .md-intro-text, .faq-header, .md-scenery-band, .md-pricing-inner, .md-specs-inner');
        const top = (head || target).getBoundingClientRect().top + window.scrollY - navOffset() - 16;
        if (window.__jaycoLenis) window.__jaycoLenis.scrollTo(top);
        else window.scrollTo({ top, behavior: 'smooth' });
      });
    });

    /* Park the highlight under whichever link is active.
       Liquid stretch (same motion as the Tiffin model pages): the pill first
       expands to span both the old and the new link, then contracts onto the
       target — so it reads as one elastic shape travelling the bar. */
    const hasGSAP = typeof gsap !== 'undefined';
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function movePill(animate) {
      if (!pill) return;
      const active = links.querySelector('a.is-active');
      if (!active) { pill.style.opacity = '0'; return; }

      const left  = active.offsetLeft;
      const width = active.offsetWidth;
      pill.style.height = active.offsetHeight + 'px';

      const isFirst = !pill.style.opacity || pill.style.opacity === '0';
      pill.style.opacity = '1';

      if (isFirst || !animate || !hasGSAP || reduceMotion) {
        if (hasGSAP) gsap.killTweensOf(pill);
        pill.style.left  = left + 'px';
        pill.style.width = width + 'px';
        return;
      }

      const curLeft   = parseFloat(pill.style.left)  || left;
      const curWidth  = parseFloat(pill.style.width) || width;
      const spanLeft  = Math.min(curLeft, left);
      const spanRight = Math.max(curLeft + curWidth, left + width);

      gsap.killTweensOf(pill);
      gsap.timeline()
        .to(pill, { left: spanLeft, width: spanRight - spanLeft, duration: 0.24, ease: 'power3.out' })
        .to(pill, { left: left,     width: width,                duration: 0.36, ease: 'power4.inOut' });
    }

    /* show once the hero is behind us; highlight the section in view */
    const hero = $('#md-hero');
    let currentId = null;

    function update() {
      /* visible once the hero has cleared the bar's own resting line — derived
         from navOffset() so landing on the first section can never scroll to a
         position that hides the bar you just used */
      const past = hero
        ? hero.getBoundingClientRect().bottom <= navOffset() + 8
        : window.scrollY > 400;
      wrap.classList.toggle('is-visible', past);

      let activeId = items.length ? items[0].id : null;
      const line = navOffset() + 8;
      items.forEach((n) => {
        const el = document.getElementById(n.id);
        if (el && el.getBoundingClientRect().top <= line) activeId = n.id;
      });
      if (activeId === currentId) return;

      links.querySelectorAll('a').forEach((a) =>
        a.classList.toggle('is-active', a.dataset.target === activeId));
      // the first placement shouldn't slide in from the left edge
      movePill(currentId !== null);
      currentId = activeId;
    }

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', () => movePill(false));
    // the bar's own scroll (mobile) doesn't move the pill — it lives in the same
    // scrolling content — but a late web-font swap changes link widths
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => movePill(false));
    }
    update();
  }

  /* ---------- Scroll reveals (after GSAP is live) ---------- */
  function initMotion() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    /* hero copy */
    gsap.from('#md-hero .md-hero-eyebrow, #md-hero .md-hero-heading, #md-hero .md-hero-tagline, #md-hero .md-hero-price, #md-hero .md-hero-ctas', {
      opacity: 0, y: 26, stagger: 0.12, duration: 1.1, ease: 'power2.out', delay: 0.15,
    });

    /* ---------- The quiet handoff ----------
       One config for every arriving block on the page. Text arrives; media
       never fades, it drifts (below). Short, and it does not reverse — a
       reveal that plays backwards on scroll-up makes the page twitch. */
    const REVEAL = [
      '.md-section-head', '.md-intro-text',
      '.md-scenery-band-copy',
      /* the tab row and the panel deck, not the rows or the panels themselves:
         an inactive panel is display:none, so ScrollTrigger cannot measure it
         and a tween there would strand it at opacity 0 when its tab is picked */
      '.md-feat-tabs', '.md-feat-panels',
      '.md-price-card', '.md-similar-card', '.md-cta-lead',
      '.md-intro-media--render',       /* a cut-out has no crop to hide a drift */
    ].join(',');

    gsap.utils.toArray(REVEAL).forEach((el) => {
      gsap.from(el, {
        opacity: 0, y: 14, duration: 0.5, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
      });
    });

    /* ---------- The stat row reads itself out ----------
       The stats sit on one line, so per-element triggers would fire them all at
       once. One trigger on the row instead, stagger left to right in DOM order,
       so the eye is walked across the numbers rather than shown a block. */
    gsap.utils.toArray('.md-stats').forEach((row) => {
      gsap.from(row.querySelectorAll('.md-stat'), {
        /* the gap between starts is longer than the fade itself, so each number
           lands before the next one begins — a stagger shorter than its own
           duration just reads as the whole row appearing at once */
        opacity: 0, y: 16, duration: 0.38, ease: 'power2.out', stagger: 0.24,
        scrollTrigger: { trigger: row, start: 'top 90%', toggleActions: 'play none none none' },
      });
    });

    /* The bleed hinge lived here — the feature bands were the only thing that
       ever emitted .md-hinge, and they no longer carry photographs. Its removal
       leaves the floorplan stage below as the page's single authored moment,
       which is what the design system asks for. */

    /* ---------- The one authored moment: the drawing draws itself ----------
       The stage opens from an inset rounded panel to full width and the drawing
       fades up inside it. The numerals used to count in 1…6 after that — they
       were the moment itself, and they went with the hotspots; the expansion
       carries it alone now.
       once:true — a focal moment that replays on scroll-back is a party trick.

       It runs for EVERY plan now. The gate used to be `has a hotspot`, which
       meant the moment fired on three of eighteen plans and the other fifteen
       opened with a static drawing for no reason the reader could see. */
    const stage = document.querySelector('#md-plan .md-fp-panel.is-active .md-plan-stage');
    if (stage) {
      /* --exp is scrubbed through a proxy object and written with
         setProperty, the same way the homepage drives its stage
         (app.js initBuiltFor). Tweening the custom property directly is not
         reliable inside a calc()'d clip-path. It is set to 1 in onStart, not
         at creation, so a timeline that never fires leaves the stage open. */
      const exp = { v: 1 };
      const writeExp = () => stage.style.setProperty('--exp', String(exp.v));

      gsap.timeline({
        scrollTrigger: { trigger: '#md-plan', start: 'top 72%', once: true, invalidateOnRefresh: false },
        defaults: { ease: 'power3.out' },
        onStart() {
          /* resolve the panel now, not at creation: the visitor may have
             switched floorplans before this ever fired */
          const live = document.querySelector('#md-plan .md-fp-panel.is-active .md-plan-stage') || stage;
          if (live !== stage) return;
          stage.classList.add('is-drawing');
          exp.v = 1; writeExp();
        },
        onComplete() {
          stage.style.setProperty('--exp', '0');
          stage.classList.remove('is-drawing');   /* stop clipping focus rings */
        },
      })
        .to(exp, { v: 0, duration: 0.7, ease: 'power4.out', onUpdate: writeExp })
        .from(stage.querySelector('.md-plan-drawing'), { opacity: 0, duration: 0.5, ease: 'power2.out' }, 0.25);
    }

    /* ---------- Full-bleed photography — vertical drift ----------
       Same feel and magnitude as the homepage news banner (app.js
       initNewsParallax: ±6% of the image's own height, linear, across the
       element's full pass through the viewport) — but on ScrollTrigger rather
       than a lenis 'scroll' handler, since this page carries a dozen of them.
       Travel is derived from the CSS headroom so the two can never disagree:
       yPercent is a % of the IMAGE's height while --md-drift is a % of the
       WINDOW's height, hence d / (1 + 2d). */
    const SAFETY = 0.85;                 /* sub-pixel margin at the extremes */
    const page   = document.querySelector('.model-page');
    const MEDIA  = '.md-scenery-band-img,'
                 + '.md-intro-media:not(.md-intro-media--render) > img';

    gsap.matchMedia().add(
      { phone: '(max-width: 768px)', desktop: '(min-width: 769px)' },
      () => {
        const d = parseFloat(getComputedStyle(page).getPropertyValue('--md-drift')) || 0;
        const travel = (d / (100 + 2 * d)) * 100 * SAFETY;
        if (!travel) return;

        gsap.utils.toArray(MEDIA).forEach((im) => {
          gsap.fromTo(im, { yPercent: -travel }, {
            yPercent: travel, ease: 'none',
            scrollTrigger: {
              trigger: im.parentElement,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
              invalidateOnRefresh: true,
            },
          });
        });
        /* matchMedia reverts the inline transforms and kills these triggers
           when the breakpoint flips — no manual teardown, no stale duplicates */
      }
    );

    /* hero video drifts a little slower than the page */
    const video = document.querySelector('.md-hero-video, .md-hero-img');
    if (video) {
      gsap.to(video, {
        yPercent: 12, ease: 'none',
        scrollTrigger: { trigger: '#md-hero', start: 'top top', end: 'bottom top', scrub: true },
      });
    }

    /* app.js only observes the homepage's videos — this one loops for the life
       of a very long page unless we stop it offscreen */
    const heroVid = document.querySelector('.md-hero-video');
    if (heroVid && 'IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) heroVid.play().catch(() => {});
          else heroVid.pause();
        });
      }, { threshold: 0.1 }).observe(heroVid);
    }

    ScrollTrigger.refresh();
    /* lazy images land after this — one more pass once they have */
    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  }

  /* The 3D tour used to drive its own labelled cursor — the dot swelling to
     120px of frosted glass reading "View 3D Model", the way .news-card and the
     specs button do. That earned its keep when the tour was an unlabelled glyph
     on the drawing. Now that it is a button that says what it is, in a row
     beside Build, a 120px disc would cover the thing it is describing and give
     one of two adjacent buttons a state the other does not have. Removed, along
     with the .cursor.tour styling in style.css and its label in app.js. */

  /* ---------- Studio crease alignment ----------
     The intro's backdrop is a studio cyclorama, and its floor line has to run
     through the middle of the coach standing on it. Nothing in CSS can do that
     on its own: the seam's position depends on the section's height, and the
     coach's position depends on how the copy above it happens to reflow, so the
     two drift apart at every width (63px at 1440, 150px at 768).

     This measures both and sets --md-crease-lift, which model.css turns into
     how far the backdrop hangs above the section — see the note over .md-intro
     for why lifting the box moves the seam and background-position cannot. */
  const BG_W = 2400, BG_H = 1292;   /* model-background-v2.jpg */
  const CREASE = 806 / BG_H;        /* the seam, measured off the alpha/luma gradient */

  function initCreaseAlign() {
    const sec = document.getElementById('md-intro');
    const img = sec && sec.querySelector('.md-intro-media--render img');
    /* A record with no cut-out render — the Comet template, or an intro that
       uses a full-bleed photograph instead — has no coach to centre on, so the
       lift stays unset and the backdrop sits where it always did. */
    if (!sec || !img) return;

    /* The render's own figure, not a constant here: a differently-padded export
       has a different visual centre. 0.5 is the honest guess for one that has
       not been measured. */
    const ink = parseFloat(img.dataset.inkCentre) || 0.5;

    function align() {
      const W = sec.offsetWidth, H = sec.offsetHeight;
      if (!W || !H || img.offsetHeight < 2) return;   // not laid out yet

      /* offsetTop/offsetHeight, never getBoundingClientRect. The coach is in the
         REVEAL list further down and a rect read taken during that 0.5s tween
         would include its 14px y offset, aligning the seam to a position the
         coach is about to leave. Offsets ignore transforms. Do not "fix" this. */
      let el = img, top = 0;
      while (el && el !== sec) { top += el.offsetTop; el = el.offsetParent; }
      const target = top + ink * img.offsetHeight;

      /* Where the seam lands for a given lift. Covers both cover regimes: the
         section is taller than the backdrop below ~2400px and wider above it,
         and the two crop along different axes. max() picks the regime. */
      const creaseAt = (T) => {
        const boxH = H + T;
        const rH = BG_H * Math.max(W / BG_W, boxH / BG_H);
        return -T + (boxH - rH) / 2 + CREASE * rH;
      };

      /* Iterated rather than solved, because which regime applies depends on
         the answer. The derivative is -0.376 when the box is tall and -0.5 when
         it is wide; stepping by d/0.4 settles in two or three passes either way. */
      let T = 0;
      for (let i = 0; i < 6; i++) {
        const d = creaseAt(T) - target;
        if (Math.abs(d) < 0.5) break;
        T += d / 0.4;
      }
      /* Never negative: the pseudo is pinned to the section's bottom, so any
         lift >= 0 still covers the full section and no --surface band can show.
         The upper rail is only a guard against a pathological measurement. */
      T = Math.max(0, Math.min(T, 2 * H));
      sec.style.setProperty('--md-crease-lift', Math.round(T) + 'px');
    }

    /* Coalesce: several of these fire together on a resize. */
    let queued = 0;
    const schedule = () => {
      if (queued) return;
      queued = requestAnimationFrame(() => { queued = 0; align(); });
    };

    align();
    /* The render is loading="lazy". With width/height on the tag its box is
       reserved at parse time so the first pass is already right, but a cold
       load still needs this for the natural-size case. */
    if (img.complete && img.naturalWidth) schedule();
    else img.addEventListener('load', schedule, { once: true });
    /* Width changes, the 768px breakpoint flip, copy reflow — all one signal. */
    if (typeof ResizeObserver !== 'undefined') new ResizeObserver(schedule).observe(sec);
    /* The web font swap reflows the copy above the coach and moves everything. */
    if (document.fonts) {
      if (document.fonts.ready) document.fonts.ready.then(schedule);
      document.fonts.addEventListener('loadingdone', schedule);
    }
    window.addEventListener('load', schedule, { once: true });
    window.addEventListener('pageshow', (e) => { if (e.persisted) schedule(); });
  }

  /* ---------- Boot ---------- */
  renderHero();
  renderIntro();
  renderScenery();
  renderPlan();
  renderFeatures();
  renderCutaway();
  renderVideos();
  renderSpecs();
  renderPricing();
  renderFaqs();
  renderCtas();
  renderSimilar();
  renderSubnav();
  initSceneryCarousel();
  initVideoCarousel();
  initCreaseAlign();

  document.addEventListener('jayco:animations-ready', initMotion);
}());
