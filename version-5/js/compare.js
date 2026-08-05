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

  function renderFilters() {
    const cats = JAYCO.categories.map((c) => {
      const n = ROWS.filter((r) => r.category === c.id).length;
      if (!n) return '';
      return `<button type="button" class="cat-chip${state.cats.has(c.id) ? ' active' : ''}"
        data-facet="cat" data-id="${esc(c.id)}">${esc(c.name)} <span class="cmp-n">${n}</span></button>`;
    }).join('');

    /* Models narrow to whatever categories are selected, so the list stays
       usable instead of showing 27 at once — and they run in CATEGORY order,
       matching the Type chips directly above. Alphabetical put Alante next to
       Comet and buried Swift, which reads as a random list when the control
       above it is grouped by type. */
    const modelIds = JAYCO.categories
      .flatMap((c) => Object.keys(BUILD).filter((id) => JAYCO.models[id].category === c.id))
      .filter((id) => !state.cats.size || state.cats.has(JAYCO.models[id].category));
    const models = modelIds.map((id) => {
      const n = ROWS.filter((r) => r.modelId === id).length;
      return `<button type="button" class="cat-chip cat-chip--sm${state.models.has(id) ? ' active' : ''}"
        data-facet="model" data-id="${esc(id)}">${esc(JAYCO.models[id].name)} <span class="cmp-n">${n}</span></button>`;
    }).join('');

    const sleeps = SLEEPS.map((s) => `<button type="button" class="cat-chip cat-chip--sm${state.sleeps.has(s) ? ' active' : ''}"
      data-facet="sleeps" data-id="${s}">${s === 10 ? '10+' : s}</button>`).join('');

    $('#cmp-filters').innerHTML = `
      <div class="cmp-facet">
        <h2 class="cmp-facet-head">Type of RV</h2>
        <div class="cmp-chips">${cats}</div>
      </div>
      <div class="cmp-facet">
        <h2 class="cmp-facet-head">Model</h2>
        <div class="cmp-chips cmp-chips--wrap">${models}</div>
      </div>
      <div class="cmp-facet">
        <h2 class="cmp-facet-head">Sleeps</h2>
        <div class="cmp-chips">${sleeps}</div>
      </div>
      ${featureFacet()}
      <div class="cmp-facet">
        <h2 class="cmp-facet-head">Price</h2>
        ${rangeCtl('price', RANGE.price, state.price, money)}
      </div>
      <div class="cmp-facet">
        <h2 class="cmp-facet-head">Length</h2>
        ${rangeCtl('length', RANGE.length, state.length, (v) => feet(v) + ' ft')}
      </div>
      <div class="cmp-facet">
        <!-- "towables only" carries what the removed paragraph explained: Jayco
             publishes no dry weight for any motorhome, so this range never hides
             one. The behaviour is unchanged — see matches(). -->
        <h2 class="cmp-facet-head">Dry weight <span class="cmp-facet-note">towables only</span></h2>
        ${rangeCtl('weight', RANGE.weight, state.weight, (v) => v.toLocaleString('en-US') + ' lb')}
      </div>`;
  }

  /* Jayco publishes 28 feature keys but only ships data for 17 of them; the
     other 11 are empty columns in their own database, so floorplan-features.js
     omits them rather than offering chips that can never match.

     Counts are contextual — how many results survive if you add THIS chip —
     which means measuring against a base set with the features facet itself
     neutralised. Counting against the current results would show every chip as
     its own intersection and read as nonsense the moment two are active. */
  function featureFacet() {
    /* Each chip's count neutralises only ITSELF, so both bases are needed:
       one with the feature keys cleared, one with slide cleared. */
    const heldFeat = state.features, heldSlide = state.slide;
    state.features = new Set();
    const base = ROWS.filter(matches);
    state.features = heldFeat;
    state.slide = false;
    const baseSlide = ROWS.filter(matches);
    state.slide = heldSlide;

    /* Slide-out is ours, from Jayco's spec sheets, not one of their 28 filter
       keys — but it answers the same question as the Layout chips, so it leads
       that group instead of sitting in a one-chip facet of its own. */
    const slideN = baseSlide.filter((r) => r.slide).length;
    const slide = (!slideN && !heldSlide) ? '' :
      `<button type="button" class="cat-chip cat-chip--sm${heldSlide ? ' active' : ''}"
        data-facet="slide" data-id="1">Slide-out <span class="cmp-n">${slideN}</span></button>`;

    const groups = FEAT.groups.map((g, i) => {
      let chips = g.keys.map((k) => {
        const n = base.filter((r) => r.features.indexOf(k) > -1).length;
        const on = heldFeat.has(k);
        if (!n && !on) return '';            // never offer a dead end
        return `<button type="button" class="cat-chip cat-chip--sm${on ? ' active' : ''}"
          data-facet="feature" data-id="${esc(k)}">${esc(FEAT.labels[k] || k)} <span class="cmp-n">${n}</span></button>`;
      }).join('');
      if (i === 0) chips = slide + chips;    // Layout leads, and Slide-out leads it
      return chips
        ? `<h3 class="cmp-facet-sub">${esc(g.name)}</h3><div class="cmp-chips">${chips}</div>`
        : '';
    }).join('');

    /* Should the harvested feature data ever go missing, Slide-out still needs
       somewhere to live — it is our own field and does not depend on it. */
    const body = groups || (slide ? `<h3 class="cmp-facet-sub">Layout</h3><div class="cmp-chips">${slide}</div>` : '');
    if (!body) return '';

    return `<div class="cmp-facet">
      <h2 class="cmp-facet-head">Features</h2>
      ${body}
      <p class="cmp-facet-hint">Jayco's own floorplan data. Chips combine — a plan has to have all of them.</p>
    </div>`;
  }

  /* Two range inputs sharing a track. The pair is clamped so the low thumb can
     never cross the high one. */
  function rangeCtl(id, full, cur, fmt) {
    const [lo, hi] = full;
    return `<div class="cmp-range" data-range="${id}">
      <div class="cmp-range-vals"><span id="cmp-${id}-lo">${fmt(cur[0])}</span><span id="cmp-${id}-hi">${fmt(cur[1])}</span></div>
      <div class="cmp-range-track">
        <input type="range" min="${lo}" max="${hi}" value="${cur[0]}" data-edge="0" aria-label="Minimum" />
        <input type="range" min="${lo}" max="${hi}" value="${cur[1]}" data-edge="1" aria-label="Maximum" />
      </div>
    </div>`;
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
    $('#cmp-count').textContent = rows.length === ROWS.length
      ? `All ${ROWS.length} floorplans`
      : `${rows.length} of ${ROWS.length} floorplans`;

    /* With the filters behind a drawer, the badge is the only thing telling
       anyone the results are narrowed. It has to be exact. */
    const n = activeCount();
    const badge = $('#cmp-filter-n');
    badge.hidden = !n;
    badge.textContent = n;
    $('#cmp-filter-btn').setAttribute('aria-label', n ? `Filters, ${n} active` : 'Filters');
    $('#cmp-clear').hidden = !n;
    $('#cmp-drawer-n').textContent = rows.length === 1 ? '1 floorplan' : rows.length + ' floorplans';
  }

  function activeCount() {
    let n = state.cats.size + state.models.size + state.sleeps.size + state.features.size;
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
     the sticky results bar leaves behind — measured rather than assumed, because
     the bar's height moves with the header shrink and the wrapping of its own
     contents. Same reasoning as measureTray above. */
  function measureChart() {
    const bar = $('#cmp-bar');
    if (bar) {
      const top = parseFloat(getComputedStyle(bar).top) || 0;
      const h = bar.getBoundingClientRect().height;
      document.documentElement.style.setProperty('--cmp-chart-top', Math.round(top + h) + 'px');
    }
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
            <span class="cmp-col-render-box"><img class="cmp-col-render" src="${esc(r.modelImg)}" alt="" /></span>
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

  /* ---------- Filter drawer ----------
     Modal at every width, so it takes the usual four: focus in, focus trapped,
     focus back out, and the page behind it held still. */
  const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])';
  let lastFocus = null;

  const drawerOpen = () => $('#cmp-drawer').classList.contains('is-open');

  function setDrawer(open) {
    const d = $('#cmp-drawer'), b = $('#cmp-drawer-backdrop'), t = $('#cmp-filter-btn');
    if (open === drawerOpen()) return;
    if (open) lastFocus = document.activeElement;
    d.classList.toggle('is-open', open);
    b.classList.toggle('is-open', open);
    d.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (open) d.removeAttribute('inert'); else d.setAttribute('inert', '');
    t.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.classList.toggle('cmp-drawer-open', open);

    /* Lenis drives the scroll on this site from its own rAF loop, so
       body{overflow:hidden} alone does not stop the page moving under the panel. */
    const lenis = window.__jaycoLenis;
    if (lenis && lenis.stop) { if (open) lenis.stop(); else lenis.start(); }

    if (open) {
      $('#cmp-drawer-x').focus();
    } else {
      if (lastFocus && lastFocus.focus) lastFocus.focus();
      lastFocus = null;
      /* The grid re-rendered behind the backdrop while this was open; every
         ScrollTrigger below it is still measured against the old height. */
      refresh();
    }
  }

  /* inert takes the background out of the tab order on its own in current
     browsers, but Safari below 15.5 ignores it outright — so the cycle is
     also held manually rather than trusted to it. */
  function trapTab(e) {
    if (e.key !== 'Tab' || !drawerOpen()) return;
    const d = $('#cmp-drawer');
    const f = Array.from(d.querySelectorAll(FOCUSABLE)).filter((el) => el.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (!d.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function clearAll() {
    state.cats.clear(); state.models.clear(); state.sleeps.clear();
    state.features.clear(); state.slide = false;
    state.price = RANGE.price.slice(); state.length = RANGE.length.slice(); state.weight = RANGE.weight.slice();
    renderFilters(); renderGrid(); refresh();
  }

  /* ---------- Wiring ---------- */
  function wire() {
    $('#cmp-filters').addEventListener('click', (e) => {
      const b = e.target.closest('[data-facet]');
      if (!b) return;
      e.preventDefault();
      const id = b.dataset.id, f = b.dataset.facet;
      if (f === 'cat')    { toggle(state.cats, id); state.models.clear(); }
      if (f === 'model')  { toggle(state.models, id); }
      if (f === 'sleeps') { toggle(state.sleeps, +id); }
      if (f === 'feature'){ toggle(state.features, id); }
      if (f === 'slide')  { state.slide = !state.slide; }
      renderFilters(); renderGrid(); refresh();
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
      renderGrid(); refresh();
    });

    $('#cmp-clear').addEventListener('click', clearAll);
    $('#cmp-drawer-reset').addEventListener('click', clearAll);

    $('#cmp-filter-btn').addEventListener('click', () => setDrawer(true));
    $('#cmp-drawer-x').addEventListener('click', () => setDrawer(false));
    $('#cmp-drawer-apply').addEventListener('click', () => setDrawer(false));
    $('#cmp-drawer-backdrop').addEventListener('click', () => setDrawer(false));

    /* Safe at document level: app.js's own Escape handler is guarded on
       .mobile-menu.open, so the two never both fire. */
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawerOpen()) { setDrawer(false); return; }
      trapTab(e);
    });

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
  renderGrid();
  renderTray();
  if (state.picked.length >= 2) renderCompare();
  wire();
  window.addEventListener('load', () => { refresh(); measureTray(); }, { once: true });
  window.addEventListener('resize', measureTray);
}());
