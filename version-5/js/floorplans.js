/* ===================================================
   Jayco — Floorplans, a model-grouped catalog
   ---------------------------------------------------
   A second view over the same data compare.html reads:
   window.JAYCO_BUILD (181 real floorplans with Jayco's
   own drawings, MSRP and spec sheets), window.JAYCO
   and window.JAYCO_FEATURES. Nothing is harvested or
   invented here, and the two pages must never quote
   different answers — matches() below is compare.js's
   function with three facets removed, not a rewrite.

   WHY THIS PAGE IS NOT compare.html
   Compare is convergent: you know roughly what you
   want, you narrow on numbers, you pick three and read
   a spec table. This is divergent — scanning 181 shapes
   before you know what you want. So the drawing is the
   card rather than a thumbnail under a photograph, the
   181 plans sit under the 27 models that build them in
   Jayco's own category order, and the filters stay on
   screen instead of hiding in a drawer, because on a
   browse surface the axes are half the information.
   Filtering empties whole MODELS out of the catalog,
   which is the question a flat grid cannot answer.

   THE ONE RULE THAT SHAPES THE FILTERS
   A plan that has no value for a facet is never removed
   by that facet. Jayco publishes no unloaded weight for
   ANY motorhome — 0 of 47 — and 20 plans have no price,
   24 no published length. Missing means unknown, not
   out-of-range.

   THE THREE EXCEPTIONS
   compare.js's header names only the first. The other
   two are in its code and are reproduced here, so the
   two pages agree:
     1. FEATURES — window.JAYCO_FEATURES is Jayco's own
        published answer for every plan it still lists,
        so an absent flag is a published "no". Chips AND.
     2. SLEEPS — an explicit pick is a real question, so
        it rejects the 17 plans with no published sleeps.
        On this page that is louder than on compare:
        seneca-prestige (3 plans) and terrain (4) publish
        sleeps on NO plan, so one chip empties two whole
        model sections. The facet says so in a hint.
     3. SLIDE-OUT — `slide` is !!f.slide, so absent is a
        published no rather than an unknown.
   =================================================== */

(function () {
  'use strict';

  const JAYCO = window.JAYCO;
  const BUILD = window.JAYCO_BUILD || {};
  const FEAT = window.JAYCO_FEATURES || { labels: {}, groups: [], plans: {} };
  const TOUR = window.JAYCO_TOUR_URL || function () { return null; };
  if (!JAYCO || !JAYCO.models) return;

  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.prototype.slice.call((c || document).querySelectorAll(s));

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = (n) => '$' + Math.round(n).toLocaleString('en-US');

  /* Lengths arrive as strings with primes: 29′ 11″. Compared as inches.
     Ported verbatim from compare.js so the two pages bucket identically. */
  function inches(s) {
    const m = /(\d+)\s*['′]\s*(?:(\d+)\s*["″])?/.exec(s || '');
    return m ? (+m[1]) * 12 + (+(m[2] || 0)) : null;
  }
  const int = (s) => (s == null || s === '' ? null : parseInt(String(s).replace(/,/g, ''), 10));
  const feet = (i) => (i == null ? null : Math.round(i / 12));

  /* build-data stores straight quotes; the site sets primes everywhere else. */
  const prettyLen = (s) => (s == null ? null : String(s).replace(/'/g, '′').replace(/"/g, '″'));
  /* Screen readers read ′ and ″ as nothing at all, so the accessible name
     spells them. 23' 1" → "23 feet 1 inch". */
  function spokenLen(s) {
    const i = inches(s);
    if (i == null) return null;
    const ft = Math.floor(i / 12), inch = i % 12;
    return ft + (ft === 1 ? ' foot' : ' feet') + (inch ? ' ' + inch + (inch === 1 ? ' inch' : ' inches') : '');
  }

  /* ---------- Model page policy ----------
     NOT app.js's exploreHref, which is private to initMobileMenu() and tests
     window.JAYCO_MODEL_DETAIL — an object only model.html loads. On this page
     it is empty, so that test would send every model to the fallback, Swift and
     Jay Feather included. quiz.js already paid for this exact bug; this is its
     shape. The registry is the answer; the detail records only override it
     where they exist, to catch the deliberate stub:true 'comet' record.

     The fallback is type.html, NOT quiz.js's build-price.html: every section
     head already carries its own Build & Price CTA, and two buttons pointing at
     the same place is not a choice. */
  function hasModelPage(slug) {
    const d = window.JAYCO_MODEL_DETAIL;
    if (d && d[slug]) return !d[slug].stub;
    return (window.JAYCO_MODEL_PAGES || []).indexOf(slug) >= 0;
  }

  /* ---------- Index ----------
     Flattened once at boot so filtering is a synchronous pass over plain
     numbers rather than re-parsing 181 strings on every click. */
  const ROWS = [];
  const SECTIONS = [];

  JAYCO.categories.forEach((cat) => {
    Object.keys(BUILD).forEach((modelId) => {
      const m = JAYCO.models[modelId];
      if (!m || m.category !== cat.id) return;

      const rows = (BUILD[modelId].floorplans || []).map((f) => {
        const row = {
          key: modelId + '__' + f.id,
          modelId: modelId, model: m.name, planId: f.id, name: f.name,
          category: m.category, catType: cat.type,
          img: f.img,
          price: f.price == null ? null : m.basePrice + f.price,
          sleeps: f.sleeps || null,
          lengthText: prettyLen(f.length), lengthIn: inches(f.length),
          weight: int(f.weight),
          slide: !!f.slide, sport: !!f.sport, isNew: !!f.isNew, toyHauler: !!f.toyHauler,
          specs: f.specs || null,
          features: FEAT.plans[modelId + '__' + f.id] || [],
          tour: TOUR(modelId, f.id),
          pass: true, el: null,
        };
        ROWS.push(row);
        return row;
      });
      if (!rows.length) return;

      SECTIONS.push({
        modelId: modelId, model: m.name, year: m.year,
        catId: cat.id, catName: cat.name, catType: cat.type,
        img: m.img, rows: rows, total: rows.length,
        /* A 400px webp derivative of the model render. The originals in
           assets/models/ average 1.4MB, and 27 section heads would pull ~38MB
           of decoration to introduce 46KB line drawings — lazy loading defers
           that, it does not reduce it. Generated once with cwebp, committed
           alongside the source; the full-size PNG is the fallback if a
           derivative is ever missing. All 27 are 400x248, so the size hint on
           the tag is exact and the heads do not shift when they land. */
        render: '../assets/models/web/' + modelId + '.webp',
        href: hasModelPage(modelId) ? 'model.html?model=' + modelId : 'type.html?type=' + cat.id,
        /* Always the model name, never the category — a row headed "Jay Feather
           Air" whose button says "Explore Travel Trailers" reads as a link to
           something else. The destination still differs (25 of 27 models have no
           page of their own and land on their category), but the label names
           what you clicked from.

           No article: "Explore Jay Feather" and "Explore Eagle Travel Trailers"
           both read, where "Explore the Eagle Travel Trailers" does not. */
        hrefLabel: 'Explore ' + m.name,
        el: null, countEl: null, metaEl: null, jumpEl: null, jumpCountEl: null, rail: null,
      });
    });
  });

  const span = (key) => {
    const v = ROWS.map((r) => r[key]).filter((x) => x != null);
    return v.length ? [Math.min.apply(null, v), Math.max.apply(null, v)] : [0, 0];
  };
  const RANGE = { price: span('price'), length: span('lengthIn') };

  const state = {
    types: new Set(),
    features: new Set(),
    sleeps: new Set(),
    slide: false,
    price: RANGE.price.slice(),
    length: RANGE.length.slice(),
    /* Display state, deliberately outside the facets: the jump list navigates,
       it does not filter, and matches() must never read this. */
    activeModel: null,
  };

  const SLEEPS = [2, 4, 6, 8, 10];

  /* ---------- Matching ----------
     compare.js's matches(), minus the cats, models and weight facets this page
     does not offer. The three exceptions in the header are the three places a
     null is allowed to reject. */
  const within = (v, lo, hi) => v == null || (v >= lo && v <= hi);

  function matches(r) {
    if (state.types.size && !state.types.has(r.catType)) return false;
    if (state.sleeps.size) {
      /* the 10+ bucket is stored as 10 and means "10 or more" */
      const hit = Array.from(state.sleeps).some((s) => (s === 10 ? r.sleeps >= 10 : r.sleeps === s));
      if (r.sleeps != null && !hit) return false;
      if (r.sleeps == null) return false;   // an explicit sleeps pick is a real question
    }
    /* AND, the way Jayco's own filter combines them: every chosen feature must
       be present, not any of them. */
    if (state.features.size) {
      for (const f of state.features) if (r.features.indexOf(f) < 0) return false;
    }
    if (state.slide && !r.slide) return false;
    if (!within(r.price, state.price[0], state.price[1])) return false;
    if (!within(r.lengthIn, state.length[0], state.length[1])) return false;
    return true;
  }

  function activeCount() {
    let n = state.types.size + state.sleeps.size + state.features.size;
    if (state.slide) n++;
    ['price', 'length'].forEach((k) => {
      if (state[k][0] !== RANGE[k][0] || state[k][1] !== RANGE[k][1]) n++;
    });
    return n;
  }

  /* ---------- Contextual counts ----------
     Each chip's count is "how many survive if you ADD this one", which means
     measuring against a base with that chip's own facet neutralised. Counting
     against the current results would show every chip as its own intersection
     and read as nonsense the moment two are on. compare.js does this for
     Features and Slide-out; here it is generalised to every chip facet, since
     all of them are permanently on screen. */
  function baseWithout(facet) {
    let held;
    if (facet === 'type')    { held = state.types;    state.types = new Set(); }
    if (facet === 'sleeps')  { held = state.sleeps;   state.sleeps = new Set(); }
    if (facet === 'feature') { held = state.features; state.features = new Set(); }
    if (facet === 'slide')   { held = state.slide;    state.slide = false; }
    const rows = ROWS.filter(matches);
    if (facet === 'type')    state.types = held;
    if (facet === 'sleeps')  state.sleeps = held;
    if (facet === 'feature') state.features = held;
    if (facet === 'slide')   state.slide = held;
    return rows;
  }

  function chipCount(facet, id) {
    const base = baseWithout(facet);
    if (facet === 'type')    return base.filter((r) => r.catType === id).length;
    if (facet === 'slide')   return base.filter((r) => r.slide).length;
    if (facet === 'feature') return base.filter((r) => r.features.indexOf(id) > -1).length;
    if (facet === 'sleeps') {
      const s = +id;
      return base.filter((r) => (s === 10 ? r.sleeps >= 10 : r.sleeps === s)).length;
    }
    return 0;
  }

  /* ---------- Facets (rendered once, patched thereafter) ---------- */
  const chip = (facet, id, label) =>
    `<button type="button" class="fpc-chip" data-facet="${esc(facet)}" data-id="${esc(id)}"
      aria-pressed="false">${esc(label)} <span class="fpc-n"></span></button>`;

  /* The coarsest cut there is, and the one people arrive already knowing the
     answer to: do you tow it or drive it. compare.html promotes the same pair
     out of its drawer into the results bar for that reason; here it leads the
     rail. Bigger than the layout chips because it is a different order of
     question, but the same data contract — data-facet/data-id and a .fpc-n
     count — so paintChips(), clearAll() and the click handler need no cases
     for it. */
  const typeBtn = (id, label) =>
    `<button type="button" class="fpc-type-btn" data-facet="type" data-id="${id}"
      aria-pressed="false">${label} <span class="fpc-n"></span></button>`;

  function rangeCtl(id, full, fmt) {
    const [lo, hi] = full;
    return `<div class="fpc-range" data-range="${id}">
      <div class="fpc-range-vals"><span id="fpc-${id}-lo">${esc(fmt(lo))}</span><span id="fpc-${id}-hi">${esc(fmt(hi))}</span></div>
      <div class="fpc-range-track">
        <input type="range" min="${lo}" max="${hi}" value="${lo}" data-edge="0" aria-label="Minimum" />
        <input type="range" min="${lo}" max="${hi}" value="${hi}" data-edge="1" aria-label="Maximum" />
      </div>
    </div>`;
  }

  /* Two bars drawn in CSS rather than an SVG: the vertical one rotates out to
     turn + into −, which cannot be done to a single path. Same construction as
     style.css's .faq-icon, which is this site's existing plus/minus. */
  const CHEV = '<span class="fpc-acc-icon" aria-hidden="true"></span>';

  /* Closed on landing, all of them. Seventeen layout chips, five sleeps buckets
     and two range sliders open at once is a wall, and the rail's job on arrival
     is to show what the axes ARE, not to spend the whole column on one of them.

     Type is the exception and stays open — it is the coarsest cut, the one
     people arrive already knowing the answer to, and it is two buttons rather
     than a list.

     A closed accordion hides its own state, so each summary carries a count of
     what is active inside it. Without that a filtered page has no visible
     explanation, which reads as a bug. */
  /* `clearable: false` for a group that navigates rather than filters — it has
     no state, so it gets no summary and no ×. */
  const acc = (group, title, body, clearable) =>
    `<details class="fpc-acc" data-group="${group}">
      <summary class="fpc-acc-sum">
        <span class="fpc-acc-title">${esc(title)}</span>
        <span class="fpc-acc-val" data-acc-n="${group}" hidden></span>
        ${clearable === false ? '' :
          `<button type="button" class="fpc-acc-x" data-facet-clear="${group}" hidden
            aria-label="Clear ${esc(title)}">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>`}
        ${CHEV}
      </summary>
      <div class="fpc-acc-body">${body}</div>
    </details>`;

  function renderFacets() {
    /* Type first, then Layout — "what shape is it" is the question this page
       exists to answer, and it is still the opposite of compare, which leads
       with price and length. Slide-out is ours, from Jayco's spec sheets rather
       than one of their 28 filter keys, but it answers the same question as the
       Layout chips, so it leads that group. */
    const groups = FEAT.groups.map((g, i) => {
      let chips = g.keys.map((k) => chip('feature', k, FEAT.labels[k] || k)).join('');
      if (i === 0) chips = chip('slide', '1', 'Slide-out') + chips;
      return `<h3 class="fpc-facet-sub">${esc(g.name)}</h3><div class="fpc-chips">${chips}</div>`;
    }).join('');

    /* Should the harvested feature file ever go missing, Slide-out still needs
       somewhere to live: it is our own field and does not depend on it. */
    const layoutBody = (groups || `<div class="fpc-chips">${chip('slide', '1', 'Slide-out')}</div>`) +
      `<p class="fpc-facet-hint">Jayco's own floorplan data. Chips combine — a plan has to have all of them.</p>`;

    const sleepsBody =
      `<div class="fpc-chips">${SLEEPS.map((n) => chip('sleeps', n, n === 10 ? '10+' : String(n))).join('')}</div>
       <p class="fpc-facet-hint">Terrain and Seneca Prestige publish no sleeping capacity and drop out while this is on.</p>`;

    /* The type pair renders into the collapsed BAR, not here — it is the one
       control that stays visible when the panel is shut. It keeps the same
       data-facet/data-id contract as every chip, which is why paintChips() and
       the click handler are both scoped to #fpc-rail rather than to this form. */
    $('#fpc-types').innerHTML = typeBtn('motorized', 'Motorized') + typeBtn('towable', 'Towable');

    $('#fpc-facets').innerHTML = `
      ${acc('layout', 'Layout', layoutBody)}
      ${acc('sleeps', 'Sleeps', sleepsBody)}
      ${acc('price', 'Price', rangeCtl('price', RANGE.price, money))}
      ${acc('length', 'Length', rangeCtl('length', RANGE.length, (v) => feet(v) + ' ft'))}
      ${acc('model', 'Model By Name',
        `<nav class="fpc-jump" id="fpc-jump" aria-label="Jump to a model"></nav>`, false)}`;
  }

  /* What a closed accordion says it is doing. Names values when there are few,
     counts them when there are many, and never repeats the facet's own name —
     the title is right beside it. En dash, because the middle dot is already
     this repo's list separator. */
  const LABEL = {};
  (FEAT.groups || []).forEach((g) => g.keys.forEach((k) => { LABEL[k] = FEAT.labels[k] || k; }));

  function rangeSummary(g, fmt) {
    const [lo, hi] = state[g], [LO, HI] = RANGE[g];
    if (lo === LO && hi === HI) return '';
    if (lo === LO) return 'Under ' + fmt(hi);
    if (hi === HI) return 'From ' + fmt(lo);
    return fmt(lo) + ' – ' + fmt(hi);
  }

  function facetSummary(g) {
    if (g === 'layout') {
      const names = (state.slide ? ['Slide-out'] : [])
        .concat(Array.from(state.features).map((k) => LABEL[k] || k));
      if (!names.length) return '';
      return names.length <= 2 ? names.join(', ') : names.length + ' selected';
    }
    if (g === 'sleeps') {
      const v = Array.from(state.sleeps).sort((a, b) => a - b)
        .map((n) => (n === 10 ? '10+' : String(n)));
      if (!v.length) return '';
      return v.length <= 2 ? v.join(', ') : v.length + ' selected';
    }
    if (g === 'price') return rangeSummary('price', money);
    if (g === 'length') return rangeSummary('length', (v) => feet(v) + ' ft');
    return '';
  }

  /* Resets one facet without opening it. */
  function clearFacet(g) {
    if (g === 'layout') { state.features.clear(); state.slide = false; }
    else if (g === 'sleeps') state.sleeps.clear();
    else if (g === 'price' || g === 'length') {
      state[g] = RANGE[g].slice();
      /* paintChips() does not touch the range inputs, so without this the thumbs
         stay where they were while the state says full range. */
      paintRanges();
    }
    /* The × is about to be hidden, which would drop focus to <body> and send a
       keyboard user to the top of the page. Park it on the row it belongs to. */
    const sum = $('.fpc-acc[data-group="' + g + '"] .fpc-acc-sum');
    if (sum) sum.focus();
    applyFilters();
  }

  /* How many filters are live inside each closed accordion. "model" is absent
     on purpose: that list navigates, it does not filter, so it has no state to
     report. */
  function groupActive(g) {
    if (g === 'layout') return state.features.size + (state.slide ? 1 : 0);
    if (g === 'sleeps') return state.sleeps.size;
    if (g === 'price' || g === 'length')
      return (state[g][0] !== RANGE[g][0] || state[g][1] !== RANGE[g][1]) ? 1 : 0;
    return 0;
  }

  /* Patch, never rebuild. compare.js re-renders its whole facet block on every
     click, which throws away the chip the user just pressed and drops keyboard
     focus to <body>. That is survivable in a drawer with a close button; it is
     not survivable when the chips are the page's permanent primary control. */
  function paintChips() {
    /* Scoped to the RAIL, not to #fpc-facets. The type pair lives in the
       collapsed bar, outside the facets form — scoped to the form these
       buttons would silently stop being painted, with no console error. */
    $$('#fpc-rail [data-facet]').forEach((b) => {
      const facet = b.dataset.facet, id = b.dataset.id;
      const on = facet === 'slide' ? state.slide
        : facet === 'type' ? state.types.has(id)
        : facet === 'sleeps' ? state.sleeps.has(+id)
        : state.features.has(id);
      const n = chipCount(facet, id);
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      /* Dim, do not remove. compare.js drops a 0-count chip from the DOM
         ("never offer a dead end"), which on a permanent rail would pull a
         control out from under the cursor mid-click. Disabled-and-dimmed is
         what this site already means by "nothing this way" — .tp-feat-nav and
         the model page's tour button both say it that way. */
      b.disabled = !n && !on;
      const nEl = b.querySelector('.fpc-n');
      if (nEl) nEl.textContent = n;
    });

    $$('#fpc-facets .fpc-acc').forEach((d) => {
      const g = d.dataset.group;
      const n = groupActive(g);
      const text = facetSummary(g);
      const val = $('[data-acc-n]', d);
      if (val) { val.hidden = !text; val.textContent = text; }
      const x = $('[data-facet-clear]', d);
      if (x) x.hidden = !n;
      d.classList.toggle('has-active', !!n);
    });
    const n = activeCount();
    $('#fpc-clear').hidden = !n;
    const badge = $('#fpc-trigger-n');
    badge.hidden = !n;
    badge.textContent = n;
    $('#fpc-trigger').setAttribute('aria-label',
      n ? 'Filters, ' + n + ' active' : 'Filters');
  }

  function paintRanges() {
    [['price', money], ['length', (v) => feet(v) + ' ft']].forEach(([id, fmt]) => {
      const wrap = $('.fpc-range[data-range="' + id + '"]');
      if (!wrap) return;
      const inputs = $$('input', wrap);
      inputs[0].value = state[id][0];
      inputs[1].value = state[id][1];
      $('#fpc-' + id + '-lo').textContent = fmt(state[id][0]);
      $('#fpc-' + id + '-hi').textContent = fmt(state[id][1]);
    });
  }

  /* ---------- Jump index ----------
     Navigate, don't filter. This is why there is no Model facet: picking a
     model here scrolls to it and leaves the rest of the catalog in view, which
     is what a catalog is for. */
  /* Runs AFTER renderFacets(), which is what creates #fpc-jump inside the
     "Model By Name" accordion. */
  function renderJump() {
    let html = '';
    JAYCO.categories.forEach((cat) => {
      const secs = SECTIONS.filter((s) => s.catId === cat.id);
      if (!secs.length) return;
      html += `<h3 class="fpc-jump-cat">${esc(cat.name)}</h3><ul class="fpc-jump-list" role="list">` +
        secs.map((s) => `<li><a class="fpc-jump-link" href="#fpc-m-${esc(s.modelId)}"
          data-jump="${esc(s.modelId)}">${esc(s.model)} <span class="fpc-jump-n">${s.total}</span></a></li>`).join('') +
        '</ul>';
    });
    $('#fpc-jump').innerHTML = html;
    SECTIONS.forEach((s) => {
      s.jumpEl = $('#fpc-jump [data-jump="' + s.modelId + '"]');
      s.jumpCountEl = s.jumpEl && s.jumpEl.querySelector('.fpc-jump-n');
    });
  }

  /* ---------- Catalog (rendered once, never again) ----------
     181 cards and 27 rails are built one time. compare.js argues against
     re-rendering for a much smaller change; here a re-render would also throw
     away 27 scroll positions and 27 sets of rail listeners. Filtering toggles
     `hidden` and patches text — see applyFilters(). */
  const ARROW = { prev: 'M15 5l-7 7 7 7', next: 'M9 5l7 7-7 7' };
  const arrow = (id, dir) =>
    `<button type="button" class="fpc-nav" data-dir="${dir}" aria-controls="fpc-track-${esc(id)}"
      aria-label="${dir === 'prev' ? 'Previous' : 'Next'} floorplans">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="${ARROW[dir]}"/></svg></button>`;

  function badges(r) {
    const b = [];
    if (r.isNew) b.push('<span class="fpc-badge fpc-badge--new">New</span>');
    if (r.sport) b.push('<span class="fpc-badge">Sport Edition</span>');
    if (r.toyHauler) b.push('<span class="fpc-badge">Toy hauler</span>');
    if (r.slide) b.push('<span class="fpc-badge">Slide-out</span>');
    /* No "3D tour" badge any more: the card carries a real View 3D Tour control
       now, and a badge announcing what the button beside it already says is
       noise. */
    return b.length ? `<div class="fpc-badges">${b.join('')}</div>` : '';
  }

  function specLine(r) {
    const p = [];
    if (r.sleeps) p.push('Sleeps ' + r.sleeps);
    if (r.lengthText) p.push(r.lengthText);
    if (r.weight) p.push(r.weight.toLocaleString('en-US') + ' lbs');
    return p.join(' · ');
  }

  /* ---------- Card tools ----------
     Ported from build.js's floorplan card, which worked all of this out once:

     The tour sits LEFT of the zoom because the two are not peers — the zoom is
     a closer look at what is already on the card, the tour leaves the site, and
     reading order puts the smaller step first.

     An <a> when there is somewhere to go and a disabled <button> when there is
     not, rather than one element in two states: a link with no href is not a
     control any assistive technology can describe, and `disabled` is the
     attribute that says unavailable without inventing a convention.

     The control is on EVERY card either way. Jayco has scanned 15 of 181
     floorplans; a row where the pair appears and disappears reads as a
     rendering fault, and a plan with no walkthrough is worth saying out loud
     rather than leaving the reader to notice an absence.

     Both carry an aria-label, because "View 3D Tour" on its own does not say
     WHICH floorplan when a screen reader is walking fifty-eight of them. */
  const TOUR_ICON = `<svg width="18" height="18" viewBox="0 0 216 216" fill="currentColor" aria-hidden="true" focusable="false"><path d="M33.8,62.1v-.4s0-13,0-13c0-8.2,6.6-14.8,14.8-14.8h13c2.1,0,3.7,1.7,3.7,3.7s-1.7,3.7-3.7,3.7h-13c-4.1,0-7.4,3.3-7.4,7.4v13c0,2.1-1.7,3.7-3.7,3.7s-3.5-1.5-3.7-3.3ZM154.3,41.4h13.4c3.9.2,7,3.4,7,7.4v13h0c0,2.1,1.7,3.7,3.7,3.7s3.7-1.7,3.7-3.7v-13c0-7.9-6.2-14.4-14.1-14.8h-.8s-13,0-13,0c-2.1,0-3.7,1.7-3.7,3.7s1.7,3.7,3.7,3.7ZM150.3,133.3l-40.8,19c-1,.5-2.1.5-3.1,0l-40.8-19c-1.3-.6-2.1-1.9-2.1-3.4v-43.5c0-1.4.8-2.8,2.1-3.4l40.8-19,.4-.2c.9-.3,1.9-.3,2.8.2l40.8,19c1.3.6,2.1,1.9,2.1,3.4v43.5c0,1.4-.8,2.8-2.1,3.4ZM104.3,107.8l-33.4-15.6v35.3l33.4,15.6v-35.3ZM140,86.4l-32-14.9-32,14.9,32,14.9,32-14.9ZM145.1,92.2l-33.4,15.6v35.3l33.4-15.6v-35.3ZM61.6,174.9h-13c-4,0-7.2-3.1-7.4-7v-.4s0-13,0-13c0-2.1-1.7-3.7-3.7-3.7s-3.7,1.7-3.7,3.7v13.7c.4,7.8,6.9,14.1,14.8,14.1h13c2.1,0,3.7-1.7,3.7-3.7s-1.7-3.7-3.7-3.7ZM178.4,150.8c-2.1,0-3.7,1.7-3.7,3.7v13.4c-.2,3.8-3.2,6.8-7,7h-.4s-13,0-13,0c-2.1,0-3.7,1.7-3.7,3.7s1.7,3.7,3.7,3.7h13.7c7.6-.4,13.7-6.5,14.1-14.1v-.8s0-13,0-13c0-2.1-1.7-3.7-3.7-3.7Z"/></svg>`;
  const ZOOM_ICON = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/></svg>`;

  function tools(r) {
    const who = esc(r.model + ' ' + r.name);
    const label = '<span class="fpc-tour-label">View 3D Tour</span>';
    const tour = r.tour
      ? `<a class="fpc-tour" href="${esc(r.tour)}" target="_blank" rel="noopener noreferrer"
           aria-label="View the 3D tour of the ${who} floorplan — opens in a new tab">${TOUR_ICON}${label}</a>`
      : `<button type="button" class="fpc-tour" disabled aria-disabled="true"
           aria-label="No 3D tour yet for the ${who} floorplan">${TOUR_ICON}${label}</button>`;
    return `<div class="fpc-card-tools">${tour}
      <button type="button" class="fpc-zoom" data-key="${esc(r.key)}"
        aria-label="Enlarge the ${who} floorplan">${ZOOM_ICON}</button></div>`;
  }

  /* The card is no longer a single <button>. It carries three controls of its
     own now, and a button inside a button is markup browsers resolve however
     they like — so the drawing, the figures and the badges are plain content,
     and View Details is the control that opens the panel. */
  function card(r) {
    const price = r.price == null
      ? '<p class="fpc-price fpc-price--tbd">Pricing to come</p>'
      : `<p class="fpc-price"><span class="fpc-price-label">MSRP Starting at</span>
           <span class="fpc-price-fig">${esc(money(r.price))}</span></p>`;
    return `<li class="fpc-card">
      <div class="fpc-well">
        <img class="fpc-drawing" src="${esc(r.img)}" alt="" loading="lazy" decoding="async" />
        ${tools(r)}
      </div>
      <div class="fpc-card-body">
        <h3 class="fpc-code">${esc(r.name)}</h3>
        <p class="fpc-spec">${esc(specLine(r))}</p>
        ${price}
        ${badges(r)}
      </div>
      <button type="button" class="fpc-details" data-key="${esc(r.key)}"
        aria-label="View details for the ${esc(r.model + ' ' + r.name)}">View Details</button>
    </li>`;
  }

  function section(s) {
    return `<section class="fpc-model" id="fpc-m-${esc(s.modelId)}" data-model="${esc(s.modelId)}"
      aria-labelledby="fpc-h-${esc(s.modelId)}">
      <!-- The head is the row's FIRST CELL, not a band above it: the model is
           what the row is, so it reads as the label on the left and the
           floorplans as its contents to the right. It stays put while the rail
           pages, which is the point — it is outside the scroller. -->
      <div class="fpc-model-row">
        <header class="fpc-model-head">
          <img class="fpc-model-render" src="${esc(s.render)}" alt="" width="400" height="248"
            loading="lazy" decoding="async" />
          <div class="fpc-model-id">
            <span class="fpc-model-cat">${esc(s.year)} · ${esc(s.catName)}</span>
            <h2 class="fpc-model-name" id="fpc-h-${esc(s.modelId)}">${esc(s.model)}</h2>
            <p class="fpc-model-meta" data-meta="${esc(s.modelId)}"></p>
          </div>
          <div class="fpc-model-ctas">
            <a class="btn-secondary-light" href="${esc(s.href)}">${esc(s.hrefLabel)}</a>
            <a class="btn-primary" href="build-price.html?model=${esc(s.modelId)}&amp;step=floorplan">Build &amp; Price</a>
          </div>
        </header>
        <div class="fpc-cardrail">
          <ul class="fpc-cards" id="fpc-track-${esc(s.modelId)}" role="list">${s.rows.map(card).join('')}</ul>
          <div class="fpc-controls">
            <span class="fpc-rule" aria-hidden="true"></span>
            ${arrow(s.modelId, 'prev')}${arrow(s.modelId, 'next')}
          </div>
        </div>
      </div>
    </section>`;
  }

  function renderCatalog() {
    $('#fpc-catalog').innerHTML = SECTIONS.map(section).join('');
    SECTIONS.forEach((s) => {
      s.el = $('#fpc-m-' + s.modelId);
      s.metaEl = $('[data-meta="' + s.modelId + '"]', s.el);
      const render = $('.fpc-model-render', s.el);
      if (render) render.addEventListener('error', function () { this.src = s.img; }, { once: true });
      s.rows.forEach((r) => { r.el = $('.fpc-details[data-key="' + r.key + '"]', s.el).closest('.fpc-card'); });
    });
  }

  /* ---------- Rails ----------
     Ported from type-page.js initFeatureRails(). step(), page(), go() and
     sync() are geometry only: position is read from scrollLeft rather than a
     counter, so a swipe, a trackpad flick and an arrow all leave the buttons
     telling the truth, and it works with GSAP absent and under reduced motion.

     Three changes, all forced by going from 2 rails to 27:
       1. ONE shared rAF-debounced resize handler. type-page.js binds one per
          rail; at 27 that is 27 forced layouts per resize tick, continuously
          during a window drag.
       2. ONE boot rAF syncing every rail in a read loop then a write loop,
          rather than 27 separate requestAnimationFrame(sync) calls.
       3. sync() is EXPOSED so applyFilters() can re-measure. Load-bearing:
          sync() on a display:none track reads scrollWidth === clientWidth === 0,
          computes max < 2 and permanently stamps is-static — so a section
          filtered out and back in would return with no arrows.
     Arrow clicks are delegated on the catalog rather than bound per rail. */
  function initRails() {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    SECTIONS.forEach((s) => {
      const rail = $('.fpc-cardrail', s.el);
      const track = $('.fpc-cards', s.el);
      const prev = $('[data-dir="prev"]', s.el);
      const next = $('[data-dir="next"]', s.el);
      if (!rail || !track || !prev || !next) return;

      /* measured, not computed from the CSS card width — the two would
         otherwise have to be kept in sync by hand across the breakpoints */
      function step() {
        const c = $('.fpc-card', track);
        if (!c) return track.clientWidth;
        const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
        return c.getBoundingClientRect().width + gap;
      }
      /* a whole card-widths' worth of what is on screen: the partly-visible
         card at the right edge becomes the first fully-visible one after the
         click, so nothing is ever scrolled past unseen. */
      function page() {
        const st = step();
        if (!st) return track.clientWidth;
        const lead = parseFloat(getComputedStyle(track).paddingLeft) || 0;
        return st * Math.max(1, Math.floor((track.clientWidth - lead) / st));
      }

      s.rail = {
        track: track,
        go: (dir) => track.scrollBy({ left: dir * page(), behavior: reduce ? 'auto' : 'smooth' }),
        /* split so applyFilters() can read all 27 and then write all 27,
           instead of interleaving and forcing 27 layouts */
        read: () => (s.el.hidden ? null : { max: track.scrollWidth - track.clientWidth, at: track.scrollLeft }),
        write: (m) => {
          if (!m) return;
          rail.classList.toggle('is-static', m.max < 2);
          prev.disabled = m.at <= 1;
          next.disabled = m.at >= m.max - 1;
        },
      };
      track.addEventListener('scroll', () => s.rail.write(s.rail.read()), { passive: true });
    });
  }

  function syncAllRails() {
    const m = SECTIONS.map((s) => (s.rail ? s.rail.read() : null));
    SECTIONS.forEach((s, i) => { if (s.rail) s.rail.write(m[i]); });
  }

  /* ---------- Filtering ----------
     Three separated passes: think, then write, then measure. Interleaving the
     rail syncs with the hide writes would force 54 layouts instead of two. */
  function applyFilters() {
    /* PASS 1 — pure JS, no DOM */
    ROWS.forEach((r) => { r.pass = matches(r); });
    let total = 0;
    SECTIONS.forEach((s) => {
      const on = s.rows.filter((r) => r.pass);
      s.n = on.length;
      total += s.n;
      const prices = on.map((r) => r.price).filter((p) => p != null);
      const sleeps = on.map((r) => r.sleeps).filter((v) => v != null);
      s.from = prices.length ? Math.min.apply(null, prices) : null;
      s.upTo = sleeps.length ? Math.max.apply(null, sleeps) : null;
    });

    /* PASS 2 — writes only */
    const hidden = [];
    ROWS.forEach((r) => { if (r.el) r.el.hidden = !r.pass; });
    SECTIONS.forEach((s) => {
      if (!s.el) return;
      if (!s.n && !s.el.hidden) hidden.push(s.el);
      s.el.hidden = !s.n;
      const plans = s.n === s.total
        ? s.n + (s.n === 1 ? ' floorplan' : ' floorplans')
        : s.n + ' of ' + s.total + ' floorplans';
      const bits = [plans];
      if (s.from != null) bits.push('from ' + money(s.from));
      if (s.upTo != null) bits.push('sleeps up to ' + s.upTo);
      if (s.metaEl) s.metaEl.textContent = bits.join(' · ');
      if (s.jumpEl) {
        s.jumpEl.classList.toggle('is-empty', !s.n);
        s.jumpEl.setAttribute('aria-disabled', s.n ? 'false' : 'true');
      }
      if (s.jumpCountEl) s.jumpCountEl.textContent = s.n;
    });

    const models = SECTIONS.filter((s) => s.n).length;
    const countText = total === ROWS.length
      ? 'All ' + ROWS.length + ' floorplans'
      : total + ' of ' + ROWS.length + ' floorplans, in ' + models + (models === 1 ? ' model' : ' models');
    $('#fpc-count').textContent = countText;
    /* The phone's visible copy. Same string, no live region — see the note on
       the element in floorplans.html. */
    $('#fpc-panel-count').textContent = countText;
    $('#fpc-empty').hidden = total > 0;
    paintChips();

    /* A filter that hides the section holding focus drops it to <body> and
       teleports a keyboard user to the top of the page. Park it on the count
       instead — it is the live region, so the new total is announced at the
       same moment. */
    const a = document.activeElement;
    if (!a || a === document.body || hidden.some((el) => el.contains(a))) {
      if (hidden.length) $('#fpc-count').focus({ preventScroll: true });
    }

    /* PASS 3 — one rAF: measure, then let ScrollTrigger re-measure */
    requestAnimationFrame(() => { syncAllRails(); refresh(); });
  }

  /* Filtering changes document height on every click, and every ScrollTrigger
     on the page caches its start/end against the old layout — the footer's
     reveal is set with gsap.from(opacity:0) and would stay invisible forever. */
  let queued = 0;
  function refresh() {
    if (queued || !window.ScrollTrigger) return;
    queued = requestAnimationFrame(() => { queued = 0; window.ScrollTrigger.refresh(); });
  }

  function clearAll() {
    state.types.clear(); state.sleeps.clear(); state.features.clear();
    state.slide = false;
    state.price = RANGE.price.slice();
    state.length = RANGE.length.slice();
    paintRanges();
    applyFilters();
  }

  /* ---------- Detail modal ----------
     Built once in the HTML and patched per plan; a modal rebuilt on every open
     leaks one per visit. Closed state is the `hidden` attribute rather than a
     transitioned visibility — Chrome flips a discrete visibility transition
     halfway through a fade, and focus() inside a hidden subtree is a silent
     no-op. Both rules are build.js's, paid for once already. */
  const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])';
  let lastFocus = null, openEl = null;
  const anyOpen = () => !!openEl;

  /* Two overlays, one set of manners: focus in, focus trapped, focus back out,
     and the page behind held still. Lenis keeps scrolling the page under a
     fixed overlay whatever overflow says, so it is stopped rather than trusted. */
  function show(el, focusEl, from) {
    if (openEl) hide();
    lastFocus = from || document.activeElement;
    openEl = el;
    el.hidden = false;
    document.body.classList.add('fpc-modal-on');
    const l = window.__jaycoLenis;
    if (l && l.stop) l.stop();
    focusEl.focus();
  }

  function hide() {
    if (!openEl) return;
    openEl.hidden = true;
    openEl = null;
    document.body.classList.remove('fpc-modal-on');
    const l = window.__jaycoLenis;
    if (l && l.start) l.start();
    /* back to the control that opened it, not the top of the page */
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
    lastFocus = null;
  }

  function specTable(r) {
    if (!r.specs) return '<p class="fpc-modal-nospec">Jayco has not published a specification sheet for this floorplan yet.</p>';
    return Object.keys(r.specs).map((group) => {
      /* Jayco's sheets store straight quotes; prettyLen sets them as primes so a
         value in this table matches the same figure in the line above it. No
         spec value contains a quote for any other reason. */
      const rows = Object.keys(r.specs[group]).map((k) =>
        `<tr><th scope="row">${esc(k)}</th><td>${esc(prettyLen(r.specs[group][k]))}</td></tr>`).join('');
      return `<h4 class="fpc-modal-specgroup">${esc(group)}</h4><table class="fpc-modal-table"><tbody>${rows}</tbody></table>`;
    }).join('');
  }

  function openDetail(key, src) {
    const r = ROWS.find((x) => x.key === key);
    if (!r) return;
    /* The card is the return target, passed in rather than read off
       document.activeElement: a click does not reliably focus a <button>
       (Safari notably does not), and closing would then drop focus to
       <body> and send the reader back to the top of a 27-section page. */
    lastFocus = src || document.activeElement;

    $('#fpc-modal-img').src = r.img;
    $('#fpc-modal-img').alt = r.model + ' ' + r.name + ' floorplan';
    $('#fpc-modal-model').textContent = r.model;
    $('#fpc-modal-title').textContent = r.name;
    $('#fpc-modal-meta').textContent = specLine(r) || 'Specifications to come.';
    $('#fpc-modal-price').textContent = r.price == null ? 'Pricing to come' : money(r.price);
    $('#fpc-modal-flags').innerHTML = r.features.map((k) =>
      `<span class="fpc-flag">${esc(FEAT.labels[k] || k)}</span>`).join('');
    $('#fpc-modal-specs').innerHTML = specTable(r);

    /* Both tour elements stay in the DOM and swap `hidden`: an <a> cannot be
       patched into a disabled <button>, and a link with no href is not a
       control any assistive technology can describe. */
    const tour = $('#fpc-modal-tour'), off = $('#fpc-modal-tour-off');
    if (r.tour) { tour.href = r.tour; tour.hidden = false; off.hidden = true; }
    else { tour.hidden = true; off.hidden = false; }
    off.setAttribute('aria-label', 'No 3D tour yet for the ' + r.name + ' floorplan');

    $('#fpc-modal-build').href = 'build-price.html?model=' + r.modelId + '&step=floorplan';
    $('#fpc-modal-compare').href = 'compare.html?c=' + r.key;

    show($('#fpc-modal'), $('#fpc-modal-x'), src);
  }

  function openZoom(key, src) {
    const r = ROWS.find((x) => x.key === key);
    if (!r) return;
    $('#fpc-zoom-img').src = r.img;
    $('#fpc-zoom-img').alt = r.model + ' ' + r.name + ' floorplan';
    $('#fpc-zoom-cap').textContent = r.model + ' ' + r.name;
    show($('#fpc-zoom'), $('#fpc-zoom-x'), src);
  }

  /* inert takes the background out of the tab order on its own in current
     browsers, but Safari below 15.5 ignores it outright — so the cycle is also
     held manually rather than trusted to it. */
  function trapTab(e) {
    if (e.key !== 'Tab') return;
    /* The sheet joins the same cycle. It is not one of the two overlays, so
       anyOpen() does not see it — but on a phone it covers the page just as
       completely, and inert alone is not enough on older Safari. */
    const d = anyOpen() ? openEl
      : (panelOpen() && sheetMode() ? $('#fpc-panel') : null);
    if (!d) return;
    const f = $$(FOCUSABLE, d).filter((el) => el.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (!d.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* ---------- Jump + spy ----------
     A raw hash jump desyncs Lenis's internal targetScroll and the next wheel
     tick snaps back, so the offset is computed and handed to lenis.scrollTo.
     The markup keeps a real href so the no-JS path still works. */
  function scrollToSection(modelId) {
    const s = SECTIONS.find((x) => x.modelId === modelId);
    if (!s || !s.el || s.el.hidden) return;
    const lenis = window.__jaycoLenis;
    const y = s.el.getBoundingClientRect().top + window.pageYOffset - lineY();
    if (lenis && lenis.scrollTo) lenis.scrollTo(y, { immediate: false });
    else window.scrollTo({ top: y, behavior: 'smooth' });
    jumpHold = true;
    setActive(modelId);
  }

  /* IntersectionObserver, never a Lenis scroll callback: app.js runs
     getBoundingClientRect() inside lenis.on('scroll') for two elements, and 27
     would be 27 forced layouts per frame. */
  /* The reading line sits just under the header; a section is current once its
     head crosses it.

     IntersectionObserver never fires while an element merely moves around
     inside the root, so the line cannot be read directly — but it does not have
     to be. Sections are stacked flush, so the moment one section's head crosses
     the line is exactly the moment the previous section's foot leaves it, and
     THAT is an exit event. The observer supplies the timing; the threshold
     below decides the answer.

     Below 1024 the filter rail unsticks into a bar at the top of the viewport,
     and the line has to clear that too — measured, because the bar's height
     changes with the disclosure and the wrapping of its own contents. */
  const BAND_TOP = 84, BAND_BOTTOM_PCT = 0.88;
  /* Asks the rail where it actually is rather than re-deriving it from a
     breakpoint: it is fixed beside the catalog above 1024 and static above it
     below, and only a rail that is pinned to the top of the viewport is an
     obstruction the scroll has to clear. Reading the computed position means
     the two cannot drift when the CSS changes. */
  function lineY() {
    const rail = $('#fpc-rail');
    if (!rail) return BAND_TOP;
    /* Measures the collapsed BAR, not the container. The container is 62px tall
       shut and ~705px open, so reading it would swing the line by 640px every
       time the panel toggled. The bar is the top obstruction in both states.
       Below 1024 the rail is static and in flow, so it obstructs nothing. */
    if (getComputedStyle(rail).position !== 'fixed') return BAND_TOP;
    const bar = $('#fpc-bar');
    return BAND_TOP + (bar ? Math.round(bar.getBoundingClientRect().height) : 0);
  }

  /* A jump's destination stays current until the reader scrolls, and the
     observer is muted for the duration — a long jump passes sections whose
     images lazy-load on the way, which changes their heights and leaves the
     scroll landing short of the target, so the destination's head never crosses
     the reading line and the observer correctly reports the section above it.
     Released on the first wheel, touch or key, not on a timer. */
  let jumpHold = false;

  function setActive(modelId) {
    if (modelId === state.activeModel) return;
    state.activeModel = modelId;
    SECTIONS.forEach((s) => {
      if (s.jumpEl) s.jumpEl.classList.toggle('is-current', s.modelId === modelId);
    });
  }

  function initSpy() {
    if (!window.IntersectionObserver) return;
    const seen = new Set();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        const id = en.target.dataset.model;
        if (en.isIntersecting) seen.add(id); else seen.delete(id);
      });
      /* Nothing intersecting happens between two short sections and past the
         last one; hold the previous highlight rather than blanking the index. */
      if (!seen.size || jumpHold) return;

      /* Two sections intersect wherever one ends and the next begins, and the
         earlier of the pair is the one just LEFT — taking the first in document
         order lags the highlight by a whole model. So: the last section whose
         head has crossed the band, falling back to the first still below it.
         Measured here rather than read from entry.boundingClientRect, which is
         a snapshot from whenever that element last crossed a threshold and is
         stale for everything else. The callback fires on crossings, not per
         frame, and seen is never more than a few. */
      const inView = SECTIONS.filter((s) => seen.has(s.modelId));
      /* Two sections touch the line only at a boundary, and the earlier of the
         pair is the one being left. Take the last whose head has crossed it;
         fall back to the first still below, which is the state at the very top
         of the page. */
      const line = lineY() + 2;
      const passed = inView.filter((s) => s.el.getBoundingClientRect().top <= line);
      const next = passed.length ? passed[passed.length - 1] : inView[0];
      if (next) setActive(next.modelId);
    }, { rootMargin: '-' + BAND_TOP + 'px 0px -' + Math.round((1 - BAND_BOTTOM_PCT) * 100) + '% 0px',
         threshold: 0 });
    SECTIONS.forEach((s) => { if (s.el) io.observe(s.el); });
  }

  /* ---------- Open / close ----------
     A disclosure: the page behind stays scrollable and clickable, so there is no
     scroll lock, no inert, and no focus trap to maintain. */
  const panelOpen = () => $('#fpc-rail').classList.contains('is-open');

  /* Below 1024 the same control is a SHEET, not a disclosure: it covers the
     screen, so a page still scrolling behind it is content moving unseen under
     the reader's thumb. Live, not cached — a phone rotating from 820 to 1180
     crosses this line, and setPanel() has to be told the truth on the way out
     as well as the way in. */
  const SHEET = window.matchMedia('(max-width: 1023px)');
  const sheetMode = () => SHEET.matches;

  /* Lenis keeps scrolling the window under a fixed overlay whatever overflow
     says, so it is stopped rather than trusted — the same call show()/hide()
     make for the detail and zoom overlays above. */
  function lockPage(on) {
    document.body.classList.toggle('fpc-sheet-on', on);
    const l = window.__jaycoLenis;
    if (l) { if (on && l.stop) l.stop(); else if (!on && l.start) l.start(); }
    /* inert covers the tab order in current browsers; trapTab() is the manual
       belt for Safari under 15.5, which ignores it outright.

       Every child of <main> EXCEPT the rail. The rail lives inside <main>, so
       inert on <main> itself would take the sheet down with the page — every
       control in it dead to a finger and gone from the accessibility tree. That
       fails silently in a test, because el.click() fires on an inert element
       just fine; only real input is blocked. */
    const rail = $('#fpc-rail'), main = rail && rail.closest('main');
    if (main) Array.from(main.children).forEach((el) => {
      if (el === rail) return;
      if (on) el.setAttribute('inert', ''); else el.removeAttribute('inert');
    });
  }

  function setPanel(open) {
    if (open === panelOpen()) return;
    $('#fpc-rail').classList.toggle('is-open', open);
    $('#fpc-trigger').setAttribute('aria-expanded', open ? 'true' : 'false');
    if (sheetMode() || !open) lockPage(open && sheetMode());
    if (open) {
      /* Not the trigger — it is about to cross-fade to visibility:hidden, and
         focus on an invisible element is the worst outcome. */
      const first = $('#fpc-clear').hidden ? $('.fpc-acc-sum') : $('#fpc-clear');
      if (first) first.focus();
    } else {
      /* rAF, never transitionend: under prefers-reduced-motion the transition is
         `none` and transitionend never fires, which would kill the focus restore
         silently. And focus() into a still-hidden subtree is a no-op, so the
         class has to land first. */
      requestAnimationFrame(() => $('#fpc-trigger').focus());
    }
  }

  /* Crossing the breakpoint with the sheet open would otherwise strand a locked,
     inert page behind a panel that is no longer covering it. */
  SHEET.addEventListener('change', () => {
    if (panelOpen()) lockPage(sheetMode());
    else lockPage(false);
  });

  /* ---------- Wiring ---------- */
  const toggle = (set, v) => (set.has(v) ? set.delete(v) : set.add(v));

  function wire() {
    /* Bound to the RAIL for the same reason paintChips() queries it: the type
       pair sits in the collapsed bar, outside the facets form. */
    $('#fpc-rail').addEventListener('click', (e) => {
      /* FIRST, and preventDefault rather than stopPropagation: the toggle is
         <summary>'s DEFAULT ACTION, which fires after propagation finishes, so
         stopping the bubble alone would still open the accordion. Before the
         [data-facet] lookup too, or that would match as well and act twice. */
      const x = e.target.closest('[data-facet-clear]');
      if (x) { e.preventDefault(); e.stopPropagation(); clearFacet(x.dataset.facetClear); return; }
      const b = e.target.closest('[data-facet]');
      if (!b || b.disabled) return;
      const id = b.dataset.id;
      if (b.dataset.facet === 'type') toggle(state.types, id);
      else if (b.dataset.facet === 'sleeps') toggle(state.sleeps, +id);
      else if (b.dataset.facet === 'feature') toggle(state.features, id);
      else if (b.dataset.facet === 'slide') state.slide = !state.slide;
      applyFilters();
    });

    $('#fpc-rail').addEventListener('input', (e) => {
      const input = e.target;
      if (input.type !== 'range') return;
      const wrap = input.closest('[data-range]');
      const id = wrap.dataset.range, edge = +input.dataset.edge;
      const v = +input.value;
      /* clamped so the low thumb can never cross the high one */
      if (edge === 0) state[id][0] = Math.min(v, state[id][1]);
      else state[id][1] = Math.max(v, state[id][0]);
      input.value = state[id][edge];
      const fmt = id === 'price' ? money : (n) => feet(n) + ' ft';
      $('#fpc-' + id + '-lo').textContent = fmt(state[id][0]);
      $('#fpc-' + id + '-hi').textContent = fmt(state[id][1]);
      applyFilters();
    });

    $('#fpc-clear').addEventListener('click', clearAll);
    $('#fpc-trigger').addEventListener('click', () => setPanel(!panelOpen()));
    $('#fpc-panel-x').addEventListener('click', () => setPanel(false));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && panelOpen() && $('#fpc-modal').hidden && $('#fpc-zoom').hidden) {
        e.stopPropagation();
        setPanel(false);
      }
    });

    $('#fpc-jump').addEventListener('click', (e) => {
      const a = e.target.closest('[data-jump]');
      if (!a) return;
      e.preventDefault();
      scrollToSection(a.dataset.jump);
    });

    /* One listener for 181 cards and 54 arrows. */
    $('#fpc-catalog').addEventListener('click', (e) => {
      const nav = e.target.closest('.fpc-nav');
      if (nav) {
        const s = SECTIONS.find((x) => x.el && x.el.contains(nav));
        if (s && s.rail) s.rail.go(nav.dataset.dir === 'prev' ? -1 : 1);
        return;
      }
      const z = e.target.closest('.fpc-zoom');
      if (z) { openZoom(z.dataset.key, z); return; }
      const d = e.target.closest('.fpc-details');
      if (d) openDetail(d.dataset.key, d);
    });

    $('#fpc-modal-x').addEventListener('click', hide);
    $('#fpc-zoom-x').addEventListener('click', hide);
    $$('.fpc-overlay').forEach((o) => o.addEventListener('click', (e) => {
      if (e.target.dataset.close) hide();
    }));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && anyOpen()) { e.stopPropagation(); hide(); }
      trapTab(e);
    });

    ['wheel', 'touchstart', 'keydown'].forEach((ev) => {
      window.addEventListener(ev, () => { jumpHold = false; }, { passive: true });
    });

    /* One shared, rAF-debounced resize for all 27 rails. */
    let rq = 0;
    window.addEventListener('resize', () => {
      if (rq) return;
      rq = requestAnimationFrame(() => { rq = 0; syncAllRails(); });
    });

  }

  /* ---------- Boot ---------- */
  if (!ROWS.length || !SECTIONS.length) return;

  $('#fpc-sub').textContent =
    ROWS.length + ' floorplans across ' + SECTIONS.length +
    " models, with Jayco's own drawings and published specifications.";

  renderFacets();
  renderJump();
  renderCatalog();
  initRails();
  wire();
  applyFilters();
  initSpy();

  /* A rail measured before its drawings land measures wrong, so every rail is
     re-read once the page has actually loaded. */
  window.addEventListener('load', () => { syncAllRails(); refresh(); }, { once: true });
}());
