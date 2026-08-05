/* ===================================================
   Jayco — Build & Price configurator
   Shell bits (loader / header / cursor / Lenis) mirror app.js
   so this page runs ONLY what it needs.
   =================================================== */

(function () {
  'use strict';

  const JAYCO = window.JAYCO;
  const $  = (sel, ctx) => (ctx || document).querySelector(sel);

  /* ============ SHELL: Loader ============ */
  const loader    = $('#loader');
  const loaderBar = $('#loader-bar');
  const loaderPct = $('#loader-percent');

  function runLoader() {
    let pct = 0;
    const step = () => {
      pct = Math.min(pct + Math.random() * 8 + 3, 100);
      const d = Math.floor(pct);
      loaderBar.style.width = d + '%';
      loaderPct.textContent = d + '%';
      if (pct < 100) requestAnimationFrame(step);
      else setTimeout(() => loader.classList.add('hidden'), 250);
    };
    requestAnimationFrame(step);
  }

  /* ============ SHELL: Lenis smooth scroll ============ */
  function initLenis() {
    if (typeof Lenis === 'undefined' || typeof gsap === 'undefined') return;
    const lenis = new Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* ============ SHELL: Header ============ */
  function initHeader() {
    const header    = $('#site-header');
    const hamburger = $('#hamburger');
    const nav       = $('#main-nav');
    if (!header) return;

    // The builder has a light background at the top (no dark hero), so keep the
    // header in its solid "scrolled" state at all times so the logo/nav stay legible.
    header.style.background = 'rgba(0,0,0,0.88)';
    header.classList.add('scrolled');

    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      nav.classList.toggle('open');
    });
    document.addEventListener('click', (e) => {
      if (nav.classList.contains('open') && !nav.contains(e.target) && !hamburger.contains(e.target)) {
        hamburger.classList.remove('open');
        nav.classList.remove('open');
      }
    });
  }

  /* ============ SHELL: Custom cursor ============ */
  function initCursor() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const cursor = document.createElement('div');
    cursor.className = 'cursor';
    document.body.appendChild(cursor);
    gsap.set(cursor, { xPercent: -50, yPercent: -50 });

    document.addEventListener('mousemove', (e) => {
      gsap.set(cursor, { x: e.clientX, y: e.clientY });
      cursor.classList.add('visible');
    });
    window.addEventListener('mouseout',  (e) => { if (!e.relatedTarget) cursor.classList.remove('visible'); });
    window.addEventListener('mouseover', (e) => { if (!e.relatedTarget) cursor.classList.add('visible'); });
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest('a, button, [role="button"], input, label, .model-tile')) cursor.classList.add('hovering');
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest('a, button, [role="button"], input, label, .model-tile')) cursor.classList.remove('hovering');
    });
  }

  /* ============ CONFIGURATOR ============ */
  const STEPS = [
    { id: 'model',     label: 'Model' },
    { id: 'floorplan', label: 'Floorplan' },
    { id: 'exterior',  label: 'Exterior' },
    { id: 'interior',  label: 'Interior' },
    { id: 'packages',  label: 'Packages' },
    { id: 'summary',   label: 'Summary' },
  ];
  const LAST = STEPS.length - 1;

  // flat model order → drives prev/next model switching
  const MODEL_ORDER = JAYCO.categories.flatMap((c) =>
    Object.keys(JAYCO.models).filter((id) => JAYCO.models[id].category === c.id)
  );

  const state = {
    step: 0,
    maxReached: 0,
    catFilter: null,          // model-step category filter (null = all)
    modelId: null,
    floorplanId: null,
    exteriorId: null,
    interiorId: null,
    packageIds: new Set(),
  };

  /* ----- helpers ----- */
  const fmt = (n) => '$' + Math.round(n).toLocaleString('en-US');
  const delta = (n) => (n > 0 ? '+ ' + fmt(n) : 'Included');
  const model = () => JAYCO.models[state.modelId];
  const categoryOf = (m) => JAYCO.categories.find((c) => c.id === m.category);
  const modelImg = (m) => m.img || categoryOf(m).image;

  function optionSets(m) {
    const motor = categoryOf(m).type === 'motorized';
    const p = JAYCO.palettes;
    return {
      exterior: motor ? p.motorizedExterior : p.towableExterior,
      interior: motor ? p.interiorMotorized : p.interiorTowable,
      packages: motor ? p.packagesMotorized : p.packagesTowable,
    };
  }

  function selectModel(id, reseed) {
    if (!JAYCO.models[id]) return;
    state.modelId = id;
    if (reseed !== false) {
      const m = model(), sets = optionSets(m);
      state.floorplanId = m.floorplans[0].id;
      state.exteriorId  = sets.exterior[0].id;
      state.interiorId  = sets.interior[0].id;
      state.packageIds  = new Set();
    }
  }

  function lineItems() {
    const m = model();
    if (!m) return [];
    const sets = optionSets(m);
    const items = [{ label: 'Base MSRP', sub: m.name, price: m.basePrice, base: true }];
    const fp = m.floorplans.find((f) => f.id === state.floorplanId);
    if (fp) items.push({ label: 'Floorplan', sub: fp.name, price: fp.price });
    const ex = sets.exterior.find((o) => o.id === state.exteriorId);
    if (ex) items.push({ label: 'Exterior', sub: ex.name, price: ex.price });
    const inr = sets.interior.find((o) => o.id === state.interiorId);
    if (inr) items.push({ label: 'Interior', sub: inr.name, price: inr.price });
    sets.packages.forEach((p) => {
      if (state.packageIds.has(p.id)) items.push({ label: 'Package', sub: p.name, price: p.price });
    });
    return items;
  }
  const total = () => lineItems().reduce((s, i) => s + i.price, 0);

  /* ----- render: floating step tracker ----- */
  const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';
  function renderSteps() {
    const html = STEPS.map((s, i) => {
      const reachable = i === 0 || (state.modelId && i <= state.maxReached);
      const done = i < state.step;
      const cls = ['step-pill'];
      if (reachable) cls.push('reachable');
      if (done) cls.push('done');
      if (i === state.step) cls.push('active');
      return `<li><button type="button" class="${cls.join(' ')}" data-step="${i}"${reachable ? '' : ' disabled'}>
        <span class="step-num">${done ? CHECK : i + 1}</span><span class="step-label">${s.label}</span></button></li>`;
    }).join('');
    $('#steps-list').innerHTML = html;
    const fill = $('#steps-rail-fill');
    if (fill) fill.style.width = (LAST ? (state.step / LAST) * 100 : 0) + '%';
  }

  /* ----- render: main panel ----- */
  function renderPanel() {
    const panel = $('#step-panel');
    const s = STEPS[state.step].id;
    if (s !== 'model' && !state.modelId) { state.step = 0; }
    panel.innerHTML = ({
      model: renderModelStep,
      floorplan: renderFloorplanStep,
      exterior: () => renderSwatchStep('exterior', 'Choose your exterior', 'Select a paint or graphics scheme.'),
      interior: () => renderSwatchStep('interior', 'Choose your interior', 'Pick a décor package for the cabin.'),
      packages: renderPackagesStep,
      summary: renderSummaryStep,
    }[STEPS[state.step].id])();

    if (typeof gsap !== 'undefined') {
      gsap.fromTo(panel.children, { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out' });
    }
  }

  function renderModelStep() {
    const chips = [{ id: null, name: 'All' }].concat(JAYCO.categories)
      .map((c) => `<button type="button" class="cat-chip${state.catFilter === (c.id || null) ? ' active' : ''}" data-select="cat" data-id="${c.id == null ? '' : c.id}">${c.name}</button>`)
      .join('');

    const ids = MODEL_ORDER.filter((id) => !state.catFilter || JAYCO.models[id].category === state.catFilter);
    const tiles = ids.map((id) => {
      const m = JAYCO.models[id];
      const cat = categoryOf(m);
      const specRows = Object.entries(m.specs).map(([k, v]) =>
        `<li><span class="spec-k">${k}</span><span class="spec-v">${v}</span></li>`).join('');
      return `<div class="model-tile${state.modelId === id ? ' selected' : ''}" data-select="model" data-id="${id}">
        <button type="button" class="model-specs-btn" data-action="specs" data-id="${id}" aria-label="View model specs">
          <img class="model-specs-icon" src="../assets/icon-specs-v2.svg" alt="" />
        </button>
        <div class="model-tile-media"><img src="${modelImg(m)}" alt="${m.name}" loading="lazy" /></div>
        <div class="model-tile-body">
          <span class="model-tile-cat">${cat.name}</span>
          <span class="model-tile-name">${m.name}</span>
          <span class="model-tile-price">Starting at <b>${fmt(m.basePrice)}</b></span>
          <button type="button" class="model-tile-build" data-action="build" data-id="${id}">Build Yours</button>
        </div>
        <div class="model-specs-panel" aria-hidden="true">
          <img class="model-specs-img" src="${modelImg(m)}" alt="" />
          <h4 class="model-specs-name">${m.name}</h4>
          <p class="model-specs-tagline">${m.tagline}</p>
          <ul class="model-specs-list">${specRows}</ul>
          <button type="button" class="model-specs-cta" data-action="build" data-id="${id}">Build Yours</button>
        </div>
      </div>`;
    }).join('');

    return `<div class="step-head"><h2>Select your model</h2><p>Choose from the full 2027 Jayco lineup — ${MODEL_ORDER.length} models across ${JAYCO.categories.length} categories.</p></div>
      <div class="cat-chips">${chips}</div>
      <div class="model-grid">${tiles}</div>`;
  }

  function renderFloorplanStep() {
    const m = model();
    const cards = m.floorplans.map((f) => `
      <button type="button" class="fp-card${state.floorplanId === f.id ? ' selected' : ''}" data-select="fp" data-id="${f.id}">
        <span class="fp-card-media"><img src="${modelImg(m)}" alt="" loading="lazy" /><span class="fp-card-plan">${f.name}</span></span>
        <span class="fp-card-body">
          <span class="fp-specs">
            <span class="fp-spec"><b>${f.sleeps}</b>Sleeps</span>
            <span class="fp-spec"><b>${f.length}</b>Length</span>
            <span class="fp-spec"><b>${f.slides}</b>Slides</span>
          </span>
          <span class="fp-card-price${f.price === 0 ? ' included' : ''}">${delta(f.price)}</span>
        </span>
      </button>`).join('');
    return `<div class="step-head"><h2>Choose a floorplan</h2><p>${m.name} layouts — sleeping capacity, length and slide-outs.</p></div>
      <div class="option-grid">${cards}</div>`;
  }

  function renderSwatchStep(kind, title, sub) {
    const sel = kind === 'exterior' ? state.exteriorId : state.interiorId;
    const opts = optionSets(model())[kind];
    const cards = opts.map((o) => `
      <button type="button" class="swatch${sel === o.id ? ' selected' : ''}" data-select="${kind === 'exterior' ? 'ex' : 'in'}" data-id="${o.id}">
        <span class="swatch-chip" style="background:${o.hex}"></span>
        <span class="swatch-name">${o.name}</span>
        <span class="swatch-price${o.price === 0 ? ' included' : ''}">${delta(o.price)}</span>
      </button>`).join('');
    return `<div class="step-head"><h2>${title}</h2><p>${sub}</p></div><div class="swatch-grid">${cards}</div>`;
  }

  function renderPackagesStep() {
    const pkgs = optionSets(model()).packages;
    const check = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';
    const cards = pkgs.map((p) => `
      <button type="button" class="pkg-card${state.packageIds.has(p.id) ? ' selected' : ''}" data-select="pkg" data-id="${p.id}">
        <span class="pkg-check">${check}</span>
        <span class="pkg-info">
          <span class="pkg-name">${p.name}${p.recommended ? '<span class="pkg-badge">Recommended</span>' : ''}</span>
          <span class="pkg-desc">${p.desc}</span>
        </span>
        <span class="pkg-price${p.price === 0 ? ' included' : ''}">${delta(p.price)}</span>
      </button>`).join('');
    return `<div class="step-head"><h2>Add packages &amp; options</h2><p>Select any upgrades — your price updates instantly.</p></div>
      <div class="pkg-list">${cards}</div>`;
  }

  function renderSummaryStep() {
    const m = model();
    const rows = lineItems().map((i) => `
      <div class="review-line">
        <span class="rl-label">${i.label}<b>${i.sub}</b></span>
        <span class="rl-val${!i.base && i.price === 0 ? ' included' : ''}">${i.base ? fmt(i.price) : delta(i.price)}</span>
      </div>`).join('');
    return `<div class="step-head"><h2>Review your build</h2><p>Here's your ${m.year} ${m.name} as configured.</p></div>
      <div class="summary-review">
        <div class="summary-review-media"><img src="${modelImg(m)}" alt="${m.name}" /></div>
        <div>
          <div class="review-lines">${rows}</div>
          <div class="review-total"><span class="rt-label">Total MSRP as built</span><span class="rt-val">${fmt(total())}</span></div>
          <div class="review-ctas">
            <button type="button" class="btn-primary" data-action="quote">Request a Quote</button>
            <a class="btn-print" href="index.html#dealer"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>Find a Dealer</a>
            <button type="button" class="btn-print" data-action="print"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>Print</button>
          </div>
        </div>
      </div>`;
  }

  /* ----- render: sidebar ----- */
  function renderSidebar() {
    const m = model();
    const totalStr = m ? fmt(total()) : '$0';
    $('#summary-total').textContent = totalStr;
    $('#mobile-total').textContent  = totalStr;

    if (!m) {
      $('#summary-name').textContent = 'Select a model';
      $('#summary-cat').textContent = '';
      $('#summary-year').textContent = '';
      $('#summary-img').removeAttribute('src');
      $('#summary-lines').innerHTML = '<li class="summary-line"><span class="sl-label">No model selected yet</span></li>';
      return;
    }
    $('#summary-img').src = modelImg(m);
    $('#summary-img').alt = m.name;
    $('#summary-name').textContent = m.name;
    $('#summary-cat').textContent = categoryOf(m).name;
    $('#summary-year').textContent = m.year;

    $('#summary-lines').innerHTML = lineItems().map((i) => `
      <li class="summary-line">
        <span class="sl-label">${i.label}<small>${i.sub}</small></span>
        <span class="sl-val${!i.base && i.price === 0 ? ' included' : ''}">${i.base ? fmt(i.price) : delta(i.price)}</span>
      </li>`).join('');
  }

  /* ----- render: nav buttons ----- */
  function renderNav() {
    const back = $('#build-back'), next = $('#build-next'), mnext = $('#mobile-next');
    back.hidden = state.step === 0;
    const onLast = state.step === LAST;
    const blocked = state.step === 0 && !state.modelId;
    [next, mnext].forEach((b) => {
      b.hidden = onLast;
      b.disabled = blocked;
      b.style.opacity = blocked ? '0.45' : '';
    });
  }

  function render() {
    state.maxReached = Math.max(state.maxReached, state.step);
    renderSteps();
    renderPanel();
    renderSidebar();
    renderNav();
  }

  /* ----- navigation ----- */
  function goStep(i) {
    i = Math.max(0, Math.min(LAST, i));
    if (i > 0 && !state.modelId) return;
    state.step = i;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    render();
  }
  function cycleModel(dir) {
    const cur = state.modelId ? MODEL_ORDER.indexOf(state.modelId) : -1;
    const nextIdx = (cur + dir + MODEL_ORDER.length) % MODEL_ORDER.length;
    selectModel(MODEL_ORDER[nextIdx]);
    render();
  }

  /* ----- events ----- */
  function wireEvents() {
    // step tabs
    $('#steps-list').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-step]');
      if (btn && !btn.disabled) goStep(+btn.dataset.step);
    });

    // panel selections (delegated) — actions first (more specific), then selections
    $('#step-panel').addEventListener('click', (e) => {
      const act = e.target.closest('[data-action]');
      if (act) {
        const a = act.dataset.action;
        if (a === 'specs') {                    // toggle the model's blue specs overlay
          const card = act.closest('.model-tile');
          if (card) card.classList.toggle('is-specs');
          return;
        }
        if (a === 'build') { selectModel(act.dataset.id); goStep(1); return; }
        if (a === 'quote') { openQuote(); return; }
        if (a === 'print') { window.print(); return; }
        return;
      }
      // ignore stray clicks inside an open specs panel (don't re-select the card)
      if (e.target.closest('.model-specs-panel')) return;

      const sel = e.target.closest('[data-select]');
      if (sel) {
        const id = sel.dataset.id, kind = sel.dataset.select;
        if (kind === 'cat') { state.catFilter = id || null; renderPanel(); return; }
        if (kind === 'model') { selectModel(id); render(); return; }
        if (kind === 'fp') { state.floorplanId = id; }
        if (kind === 'ex') { state.exteriorId = id; }
        if (kind === 'in') { state.interiorId = id; }
        if (kind === 'pkg') { state.packageIds.has(id) ? state.packageIds.delete(id) : state.packageIds.add(id); }
        renderPanel(); renderSidebar();
      }
    });

    $('#build-back').addEventListener('click', () => goStep(state.step - 1));
    $('#build-next').addEventListener('click', () => goStep(state.step + 1));
    $('#mobile-next').addEventListener('click', () => goStep(state.step + 1));
    $('#model-prev').addEventListener('click', () => cycleModel(-1));
    $('#model-next').addEventListener('click', () => cycleModel(1));
    $('#summary-quote').addEventListener('click', openQuote);

    wireQuoteModal();
  }

  /* ----- quote modal ----- */
  function openQuote() {
    if (!state.modelId) return;
    const m = model();
    $('#quote-sub').textContent = `A Jayco dealer will reach out with a no-obligation quote on your ${m.name} (${fmt(total())} as built).`;
    $('#quote-form').hidden = false;
    $('#quote-body').hidden = false;
    $('#quote-success').hidden = true;
    $('#quote-modal').classList.add('open');
    $('#quote-modal').setAttribute('aria-hidden', 'false');
  }
  function closeQuote() {
    $('#quote-modal').classList.remove('open');
    $('#quote-modal').setAttribute('aria-hidden', 'true');
    $('#quote-form').reset();
  }
  function wireQuoteModal() {
    $('#quote-close').addEventListener('click', closeQuote);
    $('#quote-backdrop').addEventListener('click', closeQuote);
    $('#quote-done').addEventListener('click', closeQuote);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && $('#quote-modal').classList.contains('open')) closeQuote();
    });
    $('#quote-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const m = model();
      $('#quote-success-sub').textContent = `Thanks! A dealer near you will be in touch about your ${m.year} ${m.name} build (${fmt(total())}).`;
      $('#quote-body').hidden = true;
      $('#quote-success').hidden = false;
    });
  }

  /* ----- deep link ?model= ----- */
  function applyDeepLink() {
    const q = new URLSearchParams(window.location.search).get('model');
    if (q && JAYCO.models[q]) {
      selectModel(q);
      state.catFilter = JAYCO.models[q].category;
    }
  }

  /* ============ INIT ============ */
  function init() {
    initLenis();
    initHeader();
    initCursor();
    applyDeepLink();
    wireEvents();
    render();
    runLoader();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
