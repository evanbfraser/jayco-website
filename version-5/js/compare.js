/* ===================================================
   Jayco — Compare floorplans
   ---------------------------------------------------
   A view over data that already exists. Every figure on
   this page comes from window.JAYCO_BUILD (181 real
   floorplans with Jayco's own drawings, MSRP and spec
   sheets) and window.JAYCO.models. Nothing is harvested
   or invented here.

   THE ONE RULE THAT SHAPES THE FILTERS
   A plan that has no value for a facet is never removed
   by that facet. Jayco publishes no unloaded weight for
   ANY motorhome — 0 of 47 — so a weight range applied
   naively would silently delete every Class A/B/C from
   the results and read as a broken page. Same for the 20
   unreleased plans with no price and the 24 with no
   published length. Missing means unknown, not
   out-of-range.

   THE ONE EXCEPTION: FEATURES
   window.JAYCO_FEATURES is Jayco's own published answer
   for every plan it still lists, harvested once from
   their floorplan filter (see floorplan-features.js for
   the provenance). Because that coverage is complete, an
   absent flag there is a published "no", not an unknown —
   so the Features facet DOES reject it. That is the
   opposite of price/length/weight, where the gaps are
   Jayco's rather than the plan's.
   =================================================== */

(function () {
  'use strict';

  const JAYCO = window.JAYCO;
  const BUILD = window.JAYCO_BUILD || {};
  const FEAT = window.JAYCO_FEATURES || { labels: {}, groups: [], plans: {} };
  const $ = (s, c) => (c || document).querySelector(s);

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = (n) => '$' + Math.round(n).toLocaleString('en-US');

  /* Lengths arrive as strings with primes: 29′ 11″. Compared as inches. */
  function inches(s) {
    const m = /(\d+)\s*['′]\s*(?:(\d+)\s*["″])?/.exec(s || '');
    return m ? (+m[1]) * 12 + (+(m[2] || 0)) : null;
  }
  const int = (s) => (s == null || s === '' ? null : parseInt(String(s).replace(/,/g, ''), 10));
  const feet = (i) => (i == null ? null : Math.round(i / 12));

  /* ---------- Index ----------
     Flattened once at boot so filtering is a synchronous pass over plain
     numbers rather than re-parsing 181 strings on every keystroke. */
  const ROWS = [];
  Object.keys(BUILD).forEach((modelId) => {
    const m = JAYCO.models[modelId];
    if (!m) return;
    const cat = JAYCO.categories.find((c) => c.id === m.category);
    (BUILD[modelId].floorplans || []).forEach((f) => {
      ROWS.push({
        key: modelId + '__' + f.id,
        modelId: modelId,
        model: m.name,
        modelImg: m.img,
        year: m.year,
        category: m.category,
        catName: cat ? cat.name : m.category,
        catType: cat ? cat.type : '',      // towable | motorized
        name: f.name,
        img: f.img,
        /* price is a delta from basePrice; null on plans Jayco has not costed */
        price: f.price == null ? null : m.basePrice + f.price,
        sleeps: f.sleeps || null,
        lengthText: f.length || null,
        lengthIn: inches(f.length),
        weight: int(f.weight),
        slide: !!f.slide,
        sport: !!f.sport,
        isNew: !!f.isNew,
        specs: f.specs || null,
        features: FEAT.plans[modelId + '__' + f.id] || [],
      });
    });
  });

  const NUM = (arr) => arr.filter((v) => v != null);
  const RANGE = {
    price:  [Math.min(...NUM(ROWS.map((r) => r.price))),    Math.max(...NUM(ROWS.map((r) => r.price)))],
    length: [Math.min(...NUM(ROWS.map((r) => r.lengthIn))), Math.max(...NUM(ROWS.map((r) => r.lengthIn)))],
    weight: [Math.min(...NUM(ROWS.map((r) => r.weight))),   Math.max(...NUM(ROWS.map((r) => r.weight)))],
  };

  const state = {
    /* 'towable' / 'motorized' — the bar's two buttons. One level coarser than
       `cats`, over the same axis: every category is one or the other, and
       r.catType is read straight off the category record. */
    types: new Set(),
    cats: new Set(),
    models: new Set(),
    sleeps: new Set(),
    features: new Set(),
    slide: false,
    price:  RANGE.price.slice(),
    length: RANGE.length.slice(),
    weight: RANGE.weight.slice(),
    picked: [],            // ordered, max 3
  };
  const MAX = 3;

  /* A facet only ever rejects a row that HAS a value outside the range. */
  const within = (v, lo, hi) => v == null || (v >= lo && v <= hi);

  function matches(r) {
    if (state.types.size && !state.types.has(r.catType)) return false;
    if (state.cats.size && !state.cats.has(r.category)) return false;
    if (state.models.size && !state.models.has(r.modelId)) return false;
    if (state.sleeps.size) {
      /* the 10+ bucket is stored as 10 and means "10 or more" */
      const hit = Array.from(state.sleeps).some((s) => (s === 10 ? r.sleeps >= 10 : r.sleeps === s));
      if (r.sleeps != null && !hit) return false;
      if (r.sleeps == null) return false;   // an explicit sleeps pick is a real question
    }
    /* AND, the way Jayco's own filter combines them: every chosen feature must
       be present, not any of them. See the header note on why this facet is
       allowed to reject a plan that lacks the flag. */
    if (state.features.size) {
      for (const f of state.features) if (r.features.indexOf(f) < 0) return false;
    }
    if (state.slide && !r.slide) return false;
    if (!within(r.price, state.price[0], state.price[1])) return false;
    if (!within(r.lengthIn, state.length[0], state.length[1])) return false;
    if (!within(r.weight, state.weight[0], state.weight[1])) return false;
    return true;
  }
  const results = () => ROWS.filter(matches);

  /* ---------- Filters ---------- */
  const SLEEPS = [2, 4, 6, 8, 10];

  /* ---------- The rail ----------
     The filter component from floorplans.css / floorplans.js, ported here under
     cmp- names — port, rename, and name the source, which is the rule the top
     of compare.css sets. Same pinned white container, same accordions closed on
     landing, same plus/minus, same tow-or-drive pair held out of them.

     The facets are this page's own, not the catalog's: compare filters by MODEL
     where the catalog navigates to one, and it keeps the dry-weight range the
     catalog drops. The chrome is shared; the taxonomy is not.

     BUILT ONCE, THEN PATCHED. The drawer this replaces called renderFilters()
     on every chip click and re-innerHTML'd the whole block. In a drawer that
     only cost you the focus ring. In a rail of accordions it would slam every
     open one shut on every click, so nothing below ever destroys a node — see
     paintFilters(). */
  const ICON = '<span class="cmp-acc-icon" aria-hidden="true"></span>';

  const chip = (facet, id, label, sm) =>
    `<button type="button" class="cat-chip${sm ? ' cat-chip--sm' : ''}"
      data-facet="${esc(facet)}" data-id="${esc(id)}" aria-pressed="false">${esc(label)}
      <span class="cmp-n"></span></button>`;

  /* [data-acc-n] is REPURPOSED, not replaced — paintFilters() patches this node
     and never rebuilds the form, so the node has to survive. It was a count
     badge; it is now the row's summary text, with a x beside it that clears
     that one facet. A <button> inside <summary> is conforming. */
  const acc = (group, title, body) =>
    `<details class="cmp-acc" data-group="${group}">
      <summary class="cmp-acc-sum">
        <span class="cmp-acc-title">${esc(title)}</span>
        <span class="cmp-acc-n" data-acc-n="${group}" hidden></span>
        <button type="button" class="cmp-acc-x" data-facet-clear="${group}" hidden
                aria-label="Clear ${esc(title)}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
        ${ICON}
      </summary>
      <div class="cmp-acc-body">${body}</div>
    </details>`;

  function rangeCtl(id, full, fmt) {
    const [lo, hi] = full;
    return `<div class="cmp-range" data-range="${id}">
      <div class="cmp-range-vals"><span id="cmp-${id}-lo">${esc(fmt(lo))}</span><span id="cmp-${id}-hi">${esc(fmt(hi))}</span></div>
      <div class="cmp-range-track">
        <input type="range" min="${lo}" max="${hi}" value="${lo}" data-edge="0" aria-label="Minimum" />
        <input type="range" min="${lo}" max="${hi}" value="${hi}" data-edge="1" aria-label="Maximum" />
      </div>
    </div>`;
  }

  /* Every chip that the data can back is rendered, once. Which of them are
     reachable right now is a paint, not a re-render — see paintFilters(). */
  function renderFilters() {
    const cats = JAYCO.categories
      .filter((c) => ROWS.some((r) => r.category === c.id))
      .map((c) => chip('cat', c.id, c.name)).join('');

    /* Models run in CATEGORY order, matching the Type of RV chips above.
       Alphabetical put Alante next to Comet and buried Swift, which reads as a
       random list when the control above it is grouped by type. */
    const models = JAYCO.categories
      .flatMap((c) => Object.keys(BUILD).filter((id) => JAYCO.models[id] && JAYCO.models[id].category === c.id))
      .map((id) => chip('model', id, JAYCO.models[id].name, true)).join('');

    const sleeps = SLEEPS.map((n) => chip('sleeps', n, n === 10 ? '10+' : String(n), true)).join('');

    /* Jayco publishes 28 feature keys but ships data for 17; floorplan-features.js
       omits the empty columns rather than offering chips that can never match.
       Slide-out is ours, from the spec sheets rather than one of their keys, but
       it answers the same question as the Layout group, so it leads it. */
    const groups = (FEAT.groups || []).map((g, i) => {
      let c = g.keys.map((k) => chip('feature', k, FEAT.labels[k] || k, true)).join('');
      if (i === 0) c = chip('slide', '1', 'Slide-out', true) + c;
      return `<h3 class="cmp-facet-sub">${esc(g.name)}</h3><div class="cmp-chips">${c}</div>`;
    }).join('');
    const featureBody = (groups || `<div class="cmp-chips">${chip('slide', '1', 'Slide-out', true)}</div>`) +
      `<p class="cmp-facet-hint">Jayco's own floorplan data. Chips combine — a plan has to have all of them.</p>`;

    $('#cmp-filters').innerHTML =
      acc('cat', 'Type of RV', `<div class="cmp-chips">${cats}</div>`) +
      acc('model', 'Model', `<div class="cmp-chips">${models}</div>`) +
      acc('sleeps', 'Sleeps', `<div class="cmp-chips">${sleeps}</div>`) +
      acc('feature', 'Features', featureBody) +
      acc('price', 'Price', rangeCtl('price', RANGE.price, money)) +
      acc('length', 'Length', rangeCtl('length', RANGE.length, (v) => feet(v) + ' ft')) +
      acc('weight', 'Dry weight',
        `${rangeCtl('weight', RANGE.weight, (v) => v.toLocaleString('en-US') + ' lb')}
         <p class="cmp-facet-hint">Towables only. Jayco publishes no dry weight for any
         motorhome, so this range never hides one — see the note in this file's header.</p>`);
  }

  /* ---------- Contextual counts ----------
     Each chip's count is "how many survive if you ADD this one", measured
     against a base with that chip's own facet neutralised. Counting against the
     current results would show every chip as its own intersection and read as
     nonsense the moment two are on. */
  function baseWithout(facet) {
    const held = {
      cat: state.cats, model: state.models, sleeps: state.sleeps,
      feature: state.features, slide: state.slide,
    };
    if (facet === 'cat') state.cats = new Set();
    if (facet === 'model') state.models = new Set();
    if (facet === 'sleeps') state.sleeps = new Set();
    if (facet === 'feature') state.features = new Set();
    if (facet === 'slide') state.slide = false;
    const rows = ROWS.filter(matches);
    state.cats = held.cat; state.models = held.model; state.sleeps = held.sleeps;
    state.features = held.feature; state.slide = held.slide;
    return rows;
  }

  function chipCount(facet, id, base) {
    if (facet === 'cat') return base.filter((r) => r.category === id).length;
    if (facet === 'model') return base.filter((r) => r.modelId === id).length;
    if (facet === 'slide') return base.filter((r) => r.slide).length;
    if (facet === 'feature') return base.filter((r) => r.features.indexOf(id) > -1).length;
    if (facet === 'sleeps') {
      const n = +id;
      return base.filter((r) => (n === 10 ? r.sleeps >= 10 : r.sleeps === n)).length;
    }
    return 0;
  }

  const isOn = (facet, id) =>
    facet === 'cat' ? state.cats.has(id)
    : facet === 'model' ? state.models.has(id)
    : facet === 'sleeps' ? state.sleeps.has(+id)
    : facet === 'slide' ? state.slide
    : state.features.has(id);

  /* ---------- What a closed accordion says it is doing ----------
     Names values when there are few, counts them when there are many, and never
     repeats the facet's own name — the title is right beside it. En dash,
     because the middle dot is already this repo's list separator.

     Type of RV and Model count from two, not three: their names run to eight
     words ("Class C Motorhomes & Super C Motorhomes") and will not fit beside a
     title and an x inside 268px. */
  function names(list) {
    if (!list.length) return '';
    return list.length === 1 ? list[0] : list.length + ' selected';
  }

  function rangeSummary(g, fmt) {
    const [lo, hi] = state[g], [LO, HI] = RANGE[g];
    if (lo === LO && hi === HI) return '';
    if (lo === LO) return 'Under ' + fmt(hi);
    if (hi === HI) return 'From ' + fmt(lo);
    return fmt(lo) + ' – ' + fmt(hi);
  }

  function facetSummary(g) {
    if (g === 'cat') return names(Array.from(state.cats).map((id) => {
      const c = JAYCO.categories.find((x) => x.id === id); return c ? c.name : id;
    }));
    if (g === 'model') return names(Array.from(state.models)
      .map((id) => (JAYCO.models[id] ? JAYCO.models[id].name : id)));
    if (g === 'sleeps') {
      const v = Array.from(state.sleeps).sort((a, b) => a - b)
        .map((n) => (n === 10 ? '10+' : String(n)));
      return v.length <= 2 ? v.join(', ') : v.length + ' selected';
    }
    if (g === 'feature') {
      const v = (state.slide ? ['Slide-out'] : [])
        .concat(Array.from(state.features).map((k) => (FEAT.labels && FEAT.labels[k]) || k));
      return v.length <= 2 ? v.join(', ') : v.length + ' selected';
    }
    if (g === 'price')  return rangeSummary('price', money);
    if (g === 'length') return rangeSummary('length', (v) => feet(v) + ' ft');
    if (g === 'weight') return rangeSummary('weight', (v) => v.toLocaleString('en-US') + ' lb');
    return '';
  }

  /* Resets one facet without opening it. Note the asymmetry with the type pair
     and the cat chips, which both wipe model picks when they change: clearing is
     SUBTRACTIVE, and throwing away picks the user made in another facet because
     they tidied this one is a surprise. So cat clears cats only. */
  function clearFacet(g) {
    if (g === 'cat') state.cats.clear();
    else if (g === 'model') state.models.clear();
    else if (g === 'sleeps') state.sleeps.clear();
    else if (g === 'feature') { state.features.clear(); state.slide = false; }
    else state[g] = RANGE[g].slice();   /* paintFilters() repaints the thumbs inline */
    /* The x is about to be hidden, which would drop focus to <body> and send a
       keyboard user to the top of the page. Park it on the row it belongs to. */
    const sum = document.querySelector('.cmp-acc[data-group="' + g + '"] .cmp-acc-sum');
    if (sum) sum.focus();
    paintFilters(); renderGrid(); refresh();
  }

  /* How many filters are live inside each closed accordion — without it a
     narrowed page has no visible explanation, which reads as a bug. */
  function groupActive(g) {
    if (g === 'cat') return state.cats.size;
    if (g === 'model') return state.models.size;
    if (g === 'sleeps') return state.sleeps.size;
    if (g === 'feature') return state.features.size + (state.slide ? 1 : 0);
    return (state[g][0] !== RANGE[g][0] || state[g][1] !== RANGE[g][1]) ? 1 : 0;
  }

  /* Patch, never rebuild. Nothing here creates or destroys a node, so an open
     accordion stays open and the chip you just pressed keeps focus. */
  function paintFilters() {
    const bases = {};
    ['cat', 'model', 'sleeps', 'feature', 'slide'].forEach((f) => { bases[f] = baseWithout(f); });

    Array.from(document.querySelectorAll('#cmp-filters [data-facet]')).forEach((b) => {
      const f = b.dataset.facet, id = b.dataset.id;
      const on = isOn(f, id);
      const n = chipCount(f, id, bases[f]);
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      /* Dimmed rather than dropped. The drawer removed a dead chip from the DOM
         ("never offer a dead end"), which it could afford because it rebuilt
         every time. A rail that rebuilt would close its accordions, and a rail
         that removed chips would reshuffle the list under the cursor. */
      b.disabled = !n && !on;
      const nEl = b.querySelector('.cmp-n');
      if (nEl) nEl.textContent = n;
    });

    Array.from(document.querySelectorAll('#cmp-filters .cmp-acc')).forEach((d) => {
      const g = d.dataset.group;
      const n = groupActive(g);
      const text = facetSummary(g);
      const val = d.querySelector('[data-acc-n]');
      if (val) { val.hidden = !text; val.textContent = text; }
      const x = d.querySelector('[data-facet-clear]');
      if (x) x.hidden = !n;
      d.classList.toggle('has-active', !!n);
    });

    ['price', 'length', 'weight'].forEach((id) => {
      const wrap = $('.cmp-range[data-range="' + id + '"]');
      if (!wrap) return;
      const inputs = Array.from(wrap.querySelectorAll('input[type=range]'));
      inputs[0].value = state[id][0];
      inputs[1].value = state[id][1];
      const fmt = id === 'price' ? money : id === 'length' ? (v) => feet(v) + ' ft'
        : (v) => v.toLocaleString('en-US') + ' lb';
      $('#cmp-' + id + '-lo').textContent = fmt(state[id][0]);
      $('#cmp-' + id + '-hi').textContent = fmt(state[id][1]);
    });

    /* The trigger's count is required, not decoration: collapsed, it is the only
       thing on screen saying why the grid is narrowed. */
    const n = activeCount();
    $('#cmp-clear').hidden = !n;
    const badge = $('#cmp-trigger-n');
    badge.hidden = !n;
    badge.textContent = n;
    $('#cmp-trigger').setAttribute('aria-label', n ? 'Filters, ' + n + ' active' : 'Filters');
  }

  /* ---------- Grid ---------- */
  /* The label and its tick are the only part of the pick button that changes with
     state, and both card() and paintPicks() write it — so it lives in one place.
     Deliberately just the INNER html: paintPicks patches the existing button
     rather than replacing it, which is what keeps focus on the control the user
     just pressed. */
  const pickInner = (on) =>
    `<span class="cmp-pick-box">${on ? '&#10003;' : ''}</span>${on ? 'Comparing' : 'Compare'}`;

  const pickBtn = (key, on, full) =>
    `<button type="button" class="cmp-pick" data-key="${esc(key)}" ${full ? 'disabled' : ''}
             aria-pressed="${on ? 'true' : 'false'}">${pickInner(on)}</button>`;

  function card(r) {
    const on = state.picked.indexOf(r.key) > -1;
    const full = state.picked.length >= MAX && !on;
    const badges = [
      r.isNew ? '<span class="fp-badge fp-badge--new">New</span>' : '',
      r.sport ? '<span class="fp-badge">Sport Edition</span>' : '',
      r.slide && !r.sport ? '<span class="fp-badge">Slide-out</span>' : '',
    ].join('');
    const stat = (v, l) => (v ? `<span class="fp-spec"><b>${esc(v)}</b>${l}</span>` : '');
    return `
    <article class="cmp-card fp-card${on ? ' is-comparing' : ''}${full ? ' is-full' : ''}" data-key="${esc(r.key)}">
      <span class="fp-card-media">
        <span class="cmp-media-render">
          <img class="cmp-media-render-img" src="${esc(r.modelImg)}" alt="" loading="lazy" />
          <span class="cmp-media-note">Exterior images may differ.</span>
        </span>
        <span class="cmp-media-plan">
          <img class="fp-card-drawing" src="${esc(r.img)}" alt="${esc(r.model + ' ' + r.name)} floorplan" loading="lazy" />
          <span class="fp-card-plan">${esc(r.name)}</span>
        </span>
      </span>
      <span class="fp-card-body">
        <span class="cmp-card-name">${esc(r.model)}</span>
        <span class="cmp-card-model">${esc(r.year)} &middot; ${esc(r.catName)}</span>
        ${badges ? `<span class="fp-badges">${badges}</span>` : ''}
        <span class="fp-specs">
          ${stat(r.sleeps, 'Sleeps')}
          ${stat(r.lengthText, 'Length')}
          ${stat(r.weight ? r.weight.toLocaleString('en-US') + ' lb' : '', 'Dry weight')}
        </span>
        <span class="cmp-card-foot">
          <span class="fp-card-price${r.price == null ? ' fp-card-price--tbd' : ''}">${r.price == null ? 'Pricing to come' : money(r.price)}</span>
          ${pickBtn(r.key, on, full)}
        </span>
      </span>
    </article>`;
  }

  function renderGrid() {
    const rows = results();
    $('#cmp-grid').innerHTML = rows.map(card).join('');
    $('#cmp-empty').hidden = rows.length > 0;
    const countText = rows.length === ROWS.length
      ? `All ${ROWS.length} floorplans`
      : `${rows.length} of ${ROWS.length} floorplans`;
    $('#cmp-count').textContent = countText;
    /* The phone's visible copy. Same string, no live region. */
    $('#cmp-panel-count').textContent = countText;

    /* The per-accordion badges say which facet is narrowing things now; the
       count above says by how much. paintFilters() owns both. */
    renderTypeBar();
  }

  /* Counts are of the whole library, not of the current results — they say how
     many floorplans the button would show, which is what a filter control is
     asked. Computed from ROWS so they cannot drift from the grid. */
  function renderTypeBar() {
    document.querySelectorAll('.cmp-type-btn').forEach((b) => {
      const t = b.dataset.type;
      b.setAttribute('aria-pressed', state.types.has(t) ? 'true' : 'false');
      const n = b.querySelector('.cmp-n');
      if (n && !n.textContent) n.textContent = ROWS.filter((r) => r.catType === t).length;
    });
  }

  function activeCount() {
    let n = state.types.size + state.cats.size + state.models.size + state.sleeps.size + state.features.size;
    if (state.slide) n++;
    ['price', 'length', 'weight'].forEach((k) => {
      if (state[k][0] !== RANGE[k][0] || state[k][1] !== RANGE[k][1]) n++;
    });
    return n;
  }

  /* ---------- Tray ---------- */
  /* The tray's height changes with width — it stacks on a phone — and two
     things have to clear it: the chat button, which v5 pins to the same
     bottom-right corner at the same z-index, and the page's own bottom padding.
     Measured rather than guessed: a hard-coded offset was still overlapping at
     390px because the stacked tray is taller than any single constant. */
  function measureTray() {
    const tray = $('#cmp-tray');
    const h = tray.hidden ? 0 : Math.round(tray.getBoundingClientRect().height);
    document.documentElement.style.setProperty('--cmp-tray-h', h + 'px');
    measureChart();
  }

  /* On a phone the chart is its own scroll pane so its header row can pin.
     That only works if the pane has a bounded height, and the bound is whatever
     sits above it. That used to be the sticky results bar; with the filters in
     the rail there is no bar, so the site header is the whole obstruction —
     still measured rather than assumed, because it shrinks on first scroll. */
  function measureChart() {
    const hdr = $('#site-header');
    document.documentElement.style.setProperty('--cmp-chart-top',
      Math.round(hdr ? hdr.getBoundingClientRect().height : 68) + 'px');
    /* "Side by side" pins under the bar, so it costs the pane its height too.
       Zero when the comparison has not been opened. */
    const head = $('.cmp-view-head');
    document.documentElement.style.setProperty(
      '--cmp-view-head-h', head ? Math.round(head.getBoundingClientRect().height) + 'px' : '0px');
  }

  function renderTray() {
    const tray = $('#cmp-tray');
    tray.hidden = state.picked.length === 0;
    document.body.classList.toggle('has-tray', state.picked.length > 0);
    $('#cmp-tray-slots').innerHTML = state.picked.map((k) => {
      const r = ROWS.find((x) => x.key === k);
      return `<li class="cmp-slot">
        <img src="${esc(r.img)}" alt="" loading="lazy" />
        <span class="cmp-slot-name">${esc(r.name)}<small>${esc(r.model)}</small></span>
        <button type="button" class="cmp-slot-x" data-drop="${esc(k)}" aria-label="Remove ${esc(r.name)}">&times;</button>
      </li>`;
    }).join('');
    $('#cmp-tray-count').textContent = state.picked.length + ' of ' + MAX;
    $('#cmp-tray-go').disabled = state.picked.length < 2;
    measureTray();
  }

  /* Patch the cards in place rather than re-rendering the grid.
     A full re-render on every pick would rebuild 181 cards and 362 images,
     throw away the button the user just pressed (so keyboard focus lands back
     at the top of the document) and re-run image layout for a state change
     that touches at most one card plus the disabled flag on the rest. */
  function paintPicks() {
    const full = state.picked.length >= MAX;
    Array.from(document.querySelectorAll('.cmp-card')).forEach((el) => {
      const on = state.picked.indexOf(el.dataset.key) > -1;
      el.classList.toggle('is-comparing', on);
      el.classList.toggle('is-full', full && !on);
      const btn = $('.cmp-pick', el);
      if (!btn) return;
      btn.disabled = full && !on;
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.innerHTML = pickInner(on);
    });
  }

  function pick(key) {
    const i = state.picked.indexOf(key);
    if (i > -1) state.picked.splice(i, 1);
    else {
      if (state.picked.length >= MAX) return;   // refuse the 4th outright
      state.picked.push(key);
    }
    syncURL();
    paintPicks(); renderTray();
    if (!$('#cmp-view').hidden) renderCompare();
    refresh();
  }

  /* ---------- Compare table ----------
     Ported from version-4's renderSpecs(): a label column plus one column per
     plan, rows unioned across the columns so a spec one plan publishes and
     another does not still gets a row, filled with an em dash. Group keys are
     stable across Jayco's data; row keys are not. */
  const GROUPS = ['Weights', 'Measurements', 'Tank Capacities', 'Miscellaneous'];

  function renderCompare() {
    const cols = state.picked.map((k) => ROWS.find((x) => x.key === k)).filter(Boolean);
    const view = $('#cmp-view');
    if (cols.length < 2) { view.hidden = true; view.innerHTML = ''; return; }

    const head = `<tr><th class="cmp-key">Specification</th>${cols.map((r, i) => `
      <th class="cmp-col cmp-col-${i}">
        <span class="cmp-col-head">
          <span class="cmp-col-media">
            <span class="cmp-col-render-box"><img class="cmp-col-render" src="${esc(r.modelImg)}" alt="" /><span class="cmp-media-note">Exterior images may differ.</span></span>
            <span class="cmp-col-plan-box"><img class="cmp-col-plan" src="${esc(r.img)}" alt="${esc(r.model + ' ' + r.name)} floorplan" /></span>
          </span>
          <span class="cmp-col-text">
            <span class="cmp-col-name">${esc(r.name)}</span>
            <span class="cmp-col-model"><span class="cmp-col-year">${esc(r.year)} </span>${esc(r.model)}</span>
            <span class="cmp-col-price">${r.price == null ? 'Pricing to come' : money(r.price)}</span>
          </span>
        </span>
      </th>`).join('')}</tr>`;

    /* The headline four first — they are why someone opened this view. */
    const lead = [
      ['Sleeps',     cols.map((r) => (r.sleeps || null))],
      ['Length',     cols.map((r) => r.lengthText)],
      ['Dry weight', cols.map((r) => (r.weight ? r.weight.toLocaleString('en-US') + ' lb' : null))],
      ['Slide-out',  cols.map((r) => (r.slide ? 'Yes' : 'No'))],
    ];

    const body = [];
    body.push(groupRow('At a glance', cols.length));
    lead.forEach(([label, vals]) => body.push(specRow(label, vals)));

    GROUPS.forEach((g) => {
      /* union of row keys, in the order Jayco lists them */
      const keys = [];
      cols.forEach((r) => Object.keys((r.specs && r.specs[g]) || {}).forEach((k) => {
        if (keys.indexOf(k) === -1) keys.push(k);
      }));
      if (!keys.length) return;
      body.push(groupRow(g, cols.length));
      keys.forEach((k) => body.push(specRow(k, cols.map((r) => (r.specs && r.specs[g] && r.specs[g][k]) || null))));
    });

    /* No column switcher. On a phone the table scrolls sideways instead, which
       keeps all three plans in one continuous surface — the whole point of the
       view is reading them against each other, and a switcher made that a memory
       test. The spec label column stays pinned so a row never loses its name. */
    view.hidden = false;
    view.innerHTML = `
      <div class="cmp-table-scroll" tabindex="0" role="region" aria-label="Floorplan specifications, scrolls sideways">
        <div class="cmp-view-head">
          <h2 class="cmp-view-title">Side by side</h2>
        </div>
        <table class="cmp-table">
          <thead>${head}</thead>
          <tbody>${body.join('')}</tbody>
        </table>
      </div>`;

    measureChart();   // the head only exists now, and the pane is sized against it
  }

  /* The label is wrapped rather than set directly on the cell so it can be made
     sticky on a phone. A sticky element is clamped to its containing block, and
     this cell already spans the whole table — no room to shift, so sticking the
     cell itself does nothing. The span has the full cell to slide within. */
  const groupRow = (name, n) =>
    `<tr class="cmp-group"><th colspan="${n + 1}"><span class="cmp-group-label">${esc(name)}</span></th></tr>`;

  function specRow(label, vals) {
    return `<tr>
      <td class="cmp-key">${esc(label)}</td>
      ${vals.map((v, i) => `<td class="cmp-col cmp-col-${i}">${v == null || v === '' ? '&mdash;' : esc(v)}</td>`).join('')}
    </tr>`;
  }

  /* ---------- URL ----------
     replaceState, never pushState: nothing else in this repo creates history
     entries, and a filter click that added one would break the back button. */
  function syncURL() {
    if (!window.history || !window.history.replaceState) return;
    const q = state.picked.length ? '?c=' + state.picked.join(',') : '';
    window.history.replaceState({}, '', 'compare.html' + q);
  }
  function readURL() {
    const c = new URLSearchParams(window.location.search).get('c');
    if (!c) return;
    c.split(',').forEach((k) => {
      if (state.picked.length < MAX && ROWS.some((r) => r.key === k) && state.picked.indexOf(k) === -1) {
        state.picked.push(k);
      }
    });
  }

  /* Filtering changes document height on every click, and every ScrollTrigger
     on the page caches its start/end against the old layout — the footer's
     reveal is set with gsap.from(opacity:0) and would stay invisible forever. */
  let queued = 0;
  function refresh() {
    if (queued || !window.ScrollTrigger) return;
    queued = requestAnimationFrame(() => { queued = 0; window.ScrollTrigger.refresh(); });
  }

  function toTop() {
    const lenis = window.__jaycoLenis;
    if (lenis && lenis.scrollTo) { if (lenis.resize) lenis.resize(); lenis.scrollTo(0, { immediate: true }); return; }
    window.scrollTo(0, 0);
  }

  /* ---------- Accordions ---------- */
  /* <details> does the open/close itself. All this adds is the plus/minus,
     which is CSS, and keeping the rail's own scroll from reaching the page —
     that is what data-lenis-prevent on the rail is for. */

  function clearAll() {
    state.types.clear();
    state.cats.clear(); state.models.clear(); state.sleeps.clear();
    state.features.clear(); state.slide = false;
    state.price = RANGE.price.slice(); state.length = RANGE.length.slice(); state.weight = RANGE.weight.slice();
    paintFilters(); renderGrid(); refresh();
  }

  /* ---------- Open / close ----------
     A disclosure: the page behind stays scrollable and clickable, so there is no
     scroll lock, no inert, and no focus trap to maintain. */
  const panelOpen = () => $('#cmp-rail').classList.contains('is-open');

  /* Below 1024 the same control is a SHEET, not a disclosure: it covers the
     screen, so a page still scrolling behind it is content moving unseen under
     the reader's thumb. Live, not cached — a phone rotating from 820 to 1180
     crosses this line, and setPanel() has to be told the truth on the way out
     as well as the way in. */
  const SHEET = window.matchMedia('(max-width: 1023px)');
  const sheetMode = () => SHEET.matches;

  const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])';

  /* Lenis keeps scrolling the window under a fixed overlay whatever overflow
     says, so it is stopped rather than trusted. */
  function lockPage(on) {
    document.body.classList.toggle('cmp-sheet-on', on);
    const l = window.__jaycoLenis;
    if (l) { if (on && l.stop) l.stop(); else if (!on && l.start) l.start(); }
    /* inert covers the tab order in current browsers; trapTab() is the manual
       belt for Safari under 15.5, which ignores it outright.

       Every child of <main> EXCEPT the rail. The rail lives inside <main>, so
       inert on <main> itself would take the sheet down with the page — every
       control in it dead to a finger and gone from the accessibility tree. That
       fails silently in a test, because el.click() fires on an inert element
       just fine; only real input is blocked. */
    const rail = $('#cmp-rail'), main = rail && rail.closest('main');
    if (main) Array.from(main.children).forEach((el) => {
      if (el === rail) return;
      if (on) el.setAttribute('inert', ''); else el.removeAttribute('inert');
    });
  }

  /* The sheet covers the page, so the tab cycle has to stay inside it. */
  function trapTab(e) {
    if (e.key !== 'Tab' || !panelOpen() || !sheetMode()) return;
    const d = $('#cmp-panel');
    const f = Array.from(d.querySelectorAll(FOCUSABLE)).filter((el) => el.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (!d.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* Crossing the breakpoint with the sheet open would otherwise strand a locked,
     inert page behind a panel that is no longer covering it. */
  SHEET.addEventListener('change', () => lockPage(panelOpen() && sheetMode()));

  function setPanel(open) {
    if (open === panelOpen()) return;
    $('#cmp-rail').classList.toggle('is-open', open);
    $('#cmp-trigger').setAttribute('aria-expanded', open ? 'true' : 'false');
    lockPage(open && sheetMode());
    if (open) {
      /* Not the trigger — it is about to cross-fade to visibility:hidden, and
         focus on an invisible element is the worst outcome. */
      const first = $('#cmp-clear').hidden ? $('.cmp-acc-sum') : $('#cmp-clear');
      if (first) first.focus();
    } else {
      /* rAF, never transitionend: under prefers-reduced-motion the transition is
         `none` and transitionend never fires, which would kill the focus restore
         silently. And focus() into a still-hidden subtree is a no-op, so the
         class has to land first. */
      requestAnimationFrame(() => $('#cmp-trigger').focus());
    }
  }

  /* ---------- Wiring ---------- */
  function wire() {
    document.addEventListener('keydown', trapTab, true);
    $('#cmp-trigger').addEventListener('click', () => setPanel(!panelOpen()));
    $('#cmp-panel-x').addEventListener('click', () => setPanel(false));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && panelOpen()) setPanel(false);
    });

    $('#cmp-filters').addEventListener('click', (e) => {
      /* FIRST, and preventDefault rather than stopPropagation: the toggle is
         <summary>'s DEFAULT ACTION, which fires after propagation finishes, so
         stopping the bubble alone would still open the accordion. Before the
         [data-facet] lookup too, or that would match as well and act twice. */
      const x = e.target.closest('[data-facet-clear]');
      if (x) { e.preventDefault(); e.stopPropagation(); clearFacet(x.dataset.facetClear); return; }
      const b = e.target.closest('[data-facet]');
      if (!b || b.disabled) return;
      e.preventDefault();
      const id = b.dataset.id, f = b.dataset.facet;
      if (f === 'cat')    { toggle(state.cats, id); state.models.clear(); }
      if (f === 'model')  { toggle(state.models, id); }
      if (f === 'sleeps') { toggle(state.sleeps, +id); }
      if (f === 'feature'){ toggle(state.features, id); }
      if (f === 'slide')  { state.slide = !state.slide; }
      paintFilters(); renderGrid(); refresh();
    });

    $('#cmp-filters').addEventListener('input', (e) => {
      const el = e.target;
      if (el.type !== 'range') return;
      const wrap = el.closest('[data-range]'), id = wrap.dataset.range;
      const inputs = Array.from(wrap.querySelectorAll('input[type=range]'));
      let lo = +inputs[0].value, hi = +inputs[1].value;
      if (lo > hi) { if (el.dataset.edge === '0') hi = lo; else lo = hi; inputs[0].value = lo; inputs[1].value = hi; }
      state[id] = [lo, hi];
      const fmt = id === 'price' ? money : id === 'length' ? (v) => feet(v) + ' ft' : (v) => v.toLocaleString('en-US') + ' lb';
      $('#cmp-' + id + '-lo').textContent = fmt(lo);
      $('#cmp-' + id + '-hi').textContent = fmt(hi);
      paintFilters(); renderGrid(); refresh();
    });

    /* Two independent toggles rather than a segmented control: neither pressed
       and both pressed both mean "everything", which is what someone poking at
       a pair of buttons expects, and it costs no extra state to allow.
       Picking one drops any category already chosen in the drawer that the type
       excludes — otherwise Motorized + Fifth Wheels would sit there as an
       active pair that can only ever return an empty grid. Models go with them,
       exactly as they do when a category is toggled. */
    $('#cmp-types').addEventListener('click', (e) => {
      const b = e.target.closest('[data-type]');
      if (!b) return;
      toggle(state.types, b.dataset.type);
      if (state.types.size) {
        Array.from(state.cats).forEach((id) => {
          const c = JAYCO.categories.find((x) => x.id === id);
          if (!c || !state.types.has(c.type)) state.cats.delete(id);
        });
        state.models.clear();
      }
      paintFilters(); renderGrid(); refresh();
    });

    $('#cmp-clear').addEventListener('click', clearAll);

    $('#cmp-grid').addEventListener('click', (e) => {
      const b = e.target.closest('.cmp-pick');
      if (b && !b.disabled) { pick(b.dataset.key); return; }
      const c = e.target.closest('.cmp-card');
      if (c && !c.classList.contains('is-full')) pick(c.dataset.key);
    });

    $('#cmp-tray').addEventListener('click', (e) => {
      const x = e.target.closest('[data-drop]');
      if (x) { pick(x.dataset.drop); return; }
      if (e.target.closest('#cmp-tray-clear')) {
        state.picked = []; syncURL(); renderGrid(); renderTray();
        $('#cmp-view').hidden = true; $('#cmp-view').innerHTML = ''; refresh(); return;
      }
      if (e.target.closest('#cmp-tray-go')) { renderCompare(); refresh(); scrollToView(); }
    });
  }

  function scrollToView() {
    const v = $('#cmp-view');
    if (v.hidden) return;
    const lenis = window.__jaycoLenis;
    /* Land the chart clear of the sticky results bar rather than a fixed 90px.
       The bar is what "Side by side" used to disappear behind, and its height
       moves with the viewport — so ask for the measured value. */
    const pane = $('.cmp-table-scroll', v) || v;
    const clear = parseFloat(getComputedStyle(document.documentElement)
      .getPropertyValue('--cmp-chart-top')) || 90;
    const y = pane.getBoundingClientRect().top + window.pageYOffset - clear - 8;
    if (lenis && lenis.scrollTo) lenis.scrollTo(y, { immediate: false });
    else window.scrollTo({ top: y, behavior: 'smooth' });
  }

  const toggle = (set, v) => (set.has(v) ? set.delete(v) : set.add(v));

  /* ---------- Boot ---------- */
  if (!ROWS.length) return;
  $('#cmp-sub').textContent =
    `${ROWS.length} floorplans across ${Object.keys(BUILD).length} models, with Jayco's own drawings and published specifications.`;
  readURL();
  renderFilters();
  paintFilters();
  renderGrid();
  renderTray();
  if (state.picked.length >= 2) renderCompare();
  wire();
  window.addEventListener('load', () => { refresh(); measureTray(); }, { once: true });
  window.addEventListener('resize', measureTray);
}());
