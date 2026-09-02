/* ===================================================
   Jayco — Build & Price configurator

   Ported from version-1. In v1 this file carried its own copy of the
   shell — loader, Lenis, header and custom cursor — because that page
   deliberately did not load app.js. Here it does, so all four have been
   removed rather than duplicated: two Lenis instances on one document
   fight over scroll, and two loader drivers race the same progress bar.

   What app.js now owns for this page:
     • loader          initLoader()
     • smooth scroll   initLenis()      — the single window.__jaycoLenis
     • header          initHeader()     — see data-header="solid" on <body>
     • cursor          initCursor()     — incl. the .model-tile hover glow

   What stays here: the configurator itself.
   =================================================== */

(function () {
  'use strict';

  const JAYCO = window.JAYCO;
  /* Off window rather than as a bare global, so a page that somehow loads this
     without models-data.js renders cards with no 3D control instead of dying
     on a ReferenceError at the first floorplan. */
  const TOUR_URL = window.JAYCO_TOUR_URL || (() => null);
  const $  = (sel, ctx) => (ctx || document).querySelector(sel);

  /* ============ CONFIGURATOR ============ */
  const STEPS = [
    { id: 'model',     label: 'Model' },
    { id: 'floorplan', label: 'Floorplan' },
    { id: 'exterior',  label: 'Exterior' },
    { id: 'interior',  label: 'Interior' },
    { id: 'packages',  label: 'Packages & Options' },
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

  /* Per-model build data — real floorplans, drawings, exterior paint and
     Jayco's own per-plan option lists. All 27 models now have a record. */
  const BUILD = window.JAYCO_BUILD || {};
  const buildOf = (m) => (m ? BUILD[state.modelId] : null) || null;

  /* The last-resort option list. This used to be a set of invented palettes —
     five made-up paint colours and six made-up packages, shown identically for
     every model. They are gone: a builder that quotes prices must not offer
     things the factory does not sell. If a record is ever missing, the steps
     say there is one finish and no options rather than inventing a catalogue. */
  const AS_SHOWN = [{ id: 'as-shown', name: 'As shown', price: 0 }];

  /* The floorplan list is the build record's when there is one, because those
     are the real drawings and specs; otherwise the model's own short list. */
  function floorplansOf(m) {
    const b = buildOf(m);
    return (b && b.floorplans) || m.floorplans || [];
  }
  const planOf = (m) => floorplansOf(m).find((f) => f.id === state.floorplanId) || null;

  /* Jayco publishes options per FLOORPLAN, not per model — a single-axle Sport
     plan and a double-axle slideout plan share almost none. So the Packages
     step reads the selected plan's own list and resolves each id against the
     one catalogue. */
  function packagesFor(m) {
    const b = buildOf(m), fp = planOf(m);
    if (!b || !fp || !fp.optionIds) return null;
    return fp.optionIds
      .map((id) => Object.assign({ id }, b.options[id]))
      .filter((o) => o.name);
  }

  function optionSets(m) {
    const b = buildOf(m);
    return {
      /* Full-body paint, where Jayco sells it — hoisted out of the option list
         in build-data.js so the Exterior step is what charges for it, once. */
      exterior: (b && b.exterior && b.exterior.length) ? b.exterior : AS_SHOWN,
      /* No décor is published anywhere on jayco.com, so every model bar the Jay
         Flight has a single entry and renders as the sole-option panel. */
      interior: (b && b.interior && b.interior.length) ? b.interior : AS_SHOWN,
      /* Empty is a real answer: four models publish no option list at all, and
         the step says so instead of showing filler. */
      packages: packagesFor(m) || [],
    };
  }

  /* Jayco marks some packages "(Mandatory)" — they are priced into every build
     of that plan and cannot be removed. They start selected and their cards are
     locked. Re-seeded whenever the plan changes, since the mandatory item
     differs between single-axle, double-axle and Sport plans. */
  function seedPackages() {
    const sets = optionSets(model());
    state.packageIds = new Set((sets.packages || []).filter((p) => p.mandatory).map((p) => p.id));
  }

  function selectModel(id, reseed) {
    if (!JAYCO.models[id]) return;
    state.modelId = id;
    if (reseed !== false) {
      const m = model();
      /* A plan with no published price cannot be the default — the build would
         open on a floorplan it cannot total. */
      const plans = floorplansOf(m);
      state.floorplanId = (plans.find((f) => !f.isNew) || plans[0]).id;
      const sets = optionSets(m);
      state.exteriorId  = sets.exterior[0].id;
      state.interiorId  = sets.interior[0].id;
      seedPackages();
    }
  }

  function lineItems() {
    const m = model();
    if (!m) return [];
    const sets = optionSets(m);
    const items = [{ label: 'Base MSRP', sub: m.name, price: m.basePrice, base: true }];
    const fp = planOf(m) || m.floorplans.find((f) => f.id === state.floorplanId);
    /* A NEW plan has price null. Adding null would make the running total NaN,
       so it contributes 0 and the summary labels it instead. */
    /* The picture rides on the line item, so the summary's thumbnail and the
       row it belongs to can never drift apart — they are one object. The
       sidebar ignores these fields; only the summary reads them. */
    if (fp) items.push({ label: 'Floorplan', sub: fp.name, price: fp.price || 0, tbd: fp.isNew,
      img: fp.img, alt: `${m.name} ${fp.name} floorplan`, art: true,
      zoom: fp.img, zoomCaption: `${m.name} ${fp.name}` });
    const ex = sets.exterior.find((o) => o.id === state.exteriorId);
    /* Nine models sell full-body paint and Jayco publishes no photograph of
       any of it — the render is the standard finish whatever is chosen. So the
       exterior row carries a picture only if one ever exists; today none does,
       and the row is text, which is the truth. */
    if (ex) items.push({ label: 'Exterior', sub: ex.name, price: ex.price,
      img: ex.image, alt: `${m.name} in ${ex.name}`,
      zoom: ex.image, zoomCaption: `${m.name} — ${ex.name}` });
    const inr = sets.interior.find((o) => o.id === state.interiorId);
    if (inr) items.push({ label: 'Interior', sub: inr.name, price: inr.price,
      img: inr.image, hex: inr.hex, alt: `${inr.name} décor`,
      zoom: inr.image || null, zoomCaption: `${m.name} — ${inr.name}` });
    sets.packages.forEach((p) => {
      if (state.packageIds.has(p.id)) items.push({ label: 'Package', sub: p.name, price: p.price });
    });
    return items;
  }
  const total = () => lineItems().reduce((s, i) => s + i.price, 0);

  /* ----- render: floating step tracker ----- */
  const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';
  /* The tracker is built ONCE and then only has classes flipped on it.
     It used to re-write innerHTML on every render, which threw away and
     recreated every pill — nothing can animate across a step change if the
     elements it would animate no longer exist. Keeping the nodes is what lets
     the highlight travel instead of teleport. */
  let stepsBuilt = false;
  let lastPainted = -1;

  function buildSteps() {
    /* The highlight is one element shared by all six pills rather than a
       background on whichever is active — that is the whole trick: a single
       box can be animated from one pill's geometry to the next, and because
       its width interpolates too, a wide pill visibly narrows into a short one
       instead of one box vanishing while another appears.
       It is an <li> so the <ol> stays valid, and aria-hidden because it is
       decoration; the pills keep their own accessible names. */
    $('#steps-list').innerHTML =
      '<li class="steps-marker" aria-hidden="true"></li>' +
      STEPS.map((s, i) => `<li><button type="button" class="step-pill" data-step="${i}">
        <span class="step-num"><span class="step-num-inner">${i + 1}</span></span><span class="step-label">${s.label}</span></button></li>`).join('');
    stepsBuilt = true;
  }

  function renderSteps() {
    if (!stepsBuilt) buildSteps();
    const pills = Array.from(document.querySelectorAll('.step-pill'));
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    pills.forEach((pill, i) => {
      const reachable = i === 0 || (state.modelId && i <= state.maxReached);
      const done = i < state.step;
      const wasDone = pill.classList.contains('done');
      pill.classList.toggle('reachable', reachable);
      pill.classList.toggle('done', done);
      pill.classList.toggle('active', i === state.step);
      pill.disabled = !reachable;

      /* Swap the numeral for a tick the moment a step is completed, and let it
         arrive rather than blink — this is the small reward for finishing a
         step, so it should register. */
      const inner = pill.querySelector('.step-num-inner');
      if (done !== wasDone && inner) {
        inner.innerHTML = done ? CHECK : String(i + 1);
        if (!still && typeof gsap !== 'undefined') {
          gsap.fromTo(inner, { scale: 0.2, opacity: 0, rotate: done ? -35 : 0 },
            { scale: 1, opacity: 1, rotate: 0, duration: 0.42, ease: 'power3.out' });
        }
      }
    });

    /* The number on the step just arrived at gives one soft pulse, so the eye
       lands on it after the highlight finishes travelling. */
    if (!still && typeof gsap !== 'undefined' && state.step !== lastPainted && lastPainted !== -1) {
      const num = pills[state.step] && pills[state.step].querySelector('.step-num');
      if (num) gsap.fromTo(num, { scale: 0.72 }, { scale: 1, duration: 0.5, delay: 0.12, ease: 'power3.out' });
    }
    lastPainted = state.step;

    const fill = $('#steps-rail-fill');
    if (fill) fill.style.width = (LAST ? (state.step / LAST) * 100 : 0) + '%';
    followActiveStep();
    moveStepMarker();
  }

  /* Move the shared highlight onto the active pill.
     Measured in the list's SCROLL-CONTENT coordinates (rect delta plus
     scrollLeft), not viewport ones, so the marker stays glued to its pill when
     the rail is scrolled sideways on a phone. */
  let markerPlaced = false;
  function moveStepMarker() {
    const list = $('#steps-list');
    const marker = list && list.querySelector('.steps-marker');
    const pill = list && list.querySelector('.step-pill.active');
    if (!marker || !pill) return;
    const lr = list.getBoundingClientRect(), pr = pill.getBoundingClientRect();
    const x = (pr.left - lr.left) + list.scrollLeft;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* First paint drops it in place — animating in from x:0 on load would look
       like the tracker was still loading. */
    if (!markerPlaced || still || typeof gsap === 'undefined') {
      if (typeof gsap !== 'undefined') gsap.set(marker, { x, width: pr.width, height: pr.height, opacity: 1 });
      else { marker.style.transform = 'translateX(' + x + 'px)'; marker.style.width = pr.width + 'px'; marker.style.height = pr.height + 'px'; marker.style.opacity = '1'; }
      markerPlaced = true;
      return;
    }
    /* power3.out, not a back/elastic ease: the highlight should arrive and
       settle, not overshoot and wobble. The slight vertical squash on the way
       is what sells it as one object stretching across rather than a box being
       slid — it recovers before the travel ends. */
    gsap.timeline()
      .to(marker, { x, width: pr.width, height: pr.height, duration: 0.55, ease: 'power3.out' }, 0)
      .to(marker, { scaleY: 0.86, duration: 0.16, ease: 'power2.out' }, 0)
      .to(marker, { scaleY: 1, duration: 0.42, ease: 'power3.out' }, 0.16);
  }

  /* Keep the current step in view in the tracker.
     With the labels showing, the six pills are wider than a phone, so the rail
     scrolls — and without this the active step would sit off-screen from
     Exterior onward, leaving the tracker apparently stuck on "Model".
     Measured off getBoundingClientRect rather than offsetLeft: the pills are
     nested in <li>s and offsetParent is not reliably the scroller.
     Only the rail's own scrollLeft is touched, never the page — scrollIntoView
     here would drag the whole document sideways and vertically. */
  function followActiveStep() {
    const list = $('#steps-list');
    if (!list) return;
    const active = list.querySelector('.step-pill.active');
    if (!active) return;
    const max = list.scrollWidth - list.clientWidth;
    if (max <= 0) { paintStepFades(); return; }   // everything already fits
    const lr = list.getBoundingClientRect(), ar = active.getBoundingClientRect();
    const want = list.scrollLeft + (ar.left - lr.left) - (lr.width - ar.width) / 2;
    const to = Math.max(0, Math.min(max, want));
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!still && typeof list.scrollTo === 'function') list.scrollTo({ left: to, behavior: 'smooth' });
    else list.scrollLeft = to;
    paintStepFades();
  }

  /* Fade only the side that actually has a pill scrolled out of frame. */
  function paintStepFades() {
    const list = $('#steps-list');
    const track = list && list.closest('.steps-track');
    if (!track) return;
    const max = list.scrollWidth - list.clientWidth;
    track.classList.toggle('fade-l', list.scrollLeft > 2);
    track.classList.toggle('fade-r', list.scrollLeft < max - 2);
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
    const plans = floorplansOf(m);

    /* Jayco's own three stats, and only the ones it actually publishes for that
       plan — several of the newest carry a code and a drawing and nothing else,
       and an empty "— Length" cell reads as a broken card rather than as
       information Jayco has not released yet. */
    const stat = (v, label) => (v ? `<span class="fp-spec"><b>${v}</b>${label}</span>` : '');

    const cards = plans.map((f) => {
      /* Each plan gets its OWN drawing. This used to render modelImg(m) — the
         model's hero render — on every card, so all 35 looked identical. */
      const media = f.img
        ? `<img class="fp-card-drawing" src="${f.img}" alt="${m.name} ${f.name} floorplan" loading="lazy" />`
        : `<img src="${modelImg(m)}" alt="" loading="lazy" />`;
      const badges = [
        f.isNew ? '<span class="fp-badge fp-badge--new">New</span>' : '',
        f.sport ? '<span class="fp-badge">Sport Edition</span>' : '',
        f.toyHauler ? '<span class="fp-badge">Toy Hauler</span>' : '',
        f.slide && !f.sport ? '<span class="fp-badge">Slide-out</span>' : '',
      ].join('');
      const price = f.isNew
        ? '<span class="fp-card-price fp-card-price--tbd">Pricing to come</span>'
        : `<span class="fp-card-price${f.price === 0 ? ' included' : ''}">${delta(f.price)}</span>`;
      /* The tools are SIBLINGS of the card, not children of it. The card is a
         <button> — picking the plan is the whole point of this step — and a
         button inside a button is invalid markup that browsers resolve however
         they like. Wrapping all of it in a positioned div keeps each control
         its own element, and means they still work on a plan whose card is
         disabled because Jayco has not priced it yet.

         Jayco has scanned some floorplans and not others, but the control is on
         EVERY card either way: a row where the pair appears and disappears
         reads as a rendering fault, and a plan with no walkthrough is worth
         saying out loud rather than leaving the reader to notice an absence.
         Dimmed and disabled is how this site already says "there is nothing
         this way" — the same treatment .md-video-nav and .tp-feat-nav use at
         the end of a rail.

         Which plans have one comes from the shared map in models-data.js — the
         same one the model page's "View 360° Tour" button reads — so a new scan
         lights up in both places from one edit. The icon is the model page's,
         inlined for the same reason it is inlined there.

         It sits LEFT of the zoom because the two are not peers: the zoom is a
         closer look at what is already on the card, the tour leaves the site.
         Reading order puts the smaller step first.

         An <a> when there is somewhere to go and a disabled <button> when there
         is not, rather than one element in two states: a link with no href is
         not a control any assistive technology can describe, and `disabled` is
         the attribute that says unavailable without inventing a convention. */
      const tour = TOUR_URL(state.modelId, f.id);
      const tourIcon = `
          <svg width="20" height="20" viewBox="0 0 216 216" fill="currentColor" aria-hidden="true" focusable="false">
            <path d="M33.8,62.1v-.4s0-13,0-13c0-8.2,6.6-14.8,14.8-14.8h13c2.1,0,3.7,1.7,3.7,3.7s-1.7,3.7-3.7,3.7h-13c-4.1,0-7.4,3.3-7.4,7.4v13c0,2.1-1.7,3.7-3.7,3.7s-3.5-1.5-3.7-3.3ZM154.3,41.4h13.4c3.9.2,7,3.4,7,7.4v13h0c0,2.1,1.7,3.7,3.7,3.7s3.7-1.7,3.7-3.7v-13c0-7.9-6.2-14.4-14.1-14.8h-.8s-13,0-13,0c-2.1,0-3.7,1.7-3.7,3.7s1.7,3.7,3.7,3.7ZM150.3,133.3l-40.8,19c-1,.5-2.1.5-3.1,0l-40.8-19c-1.3-.6-2.1-1.9-2.1-3.4v-43.5c0-1.4.8-2.8,2.1-3.4l40.8-19,.4-.2c.9-.3,1.9-.3,2.8.2l40.8,19c1.3.6,2.1,1.9,2.1,3.4v43.5c0,1.4-.8,2.8-2.1,3.4ZM104.3,107.8l-33.4-15.6v35.3l33.4,15.6v-35.3ZM140,86.4l-32-14.9-32,14.9,32,14.9,32-14.9ZM145.1,92.2l-33.4,15.6v35.3l33.4-15.6v-35.3ZM61.6,174.9h-13c-4,0-7.2-3.1-7.4-7v-.4s0-13,0-13c0-2.1-1.7-3.7-3.7-3.7s-3.7,1.7-3.7,3.7v13.7c.4,7.8,6.9,14.1,14.8,14.1h13c2.1,0,3.7-1.7,3.7-3.7s-1.7-3.7-3.7-3.7ZM178.4,150.8c-2.1,0-3.7,1.7-3.7,3.7v13.4c-.2,3.8-3.2,6.8-7,7h-.4s-13,0-13,0c-2.1,0-3.7,1.7-3.7,3.7s1.7,3.7,3.7,3.7h13.7c7.6-.4,13.7-6.5,14.1-14.1v-.8s0-13,0-13c0-2.1-1.7-3.7-3.7-3.7Z"/>
          </svg>`;
      /* The label is inside the button, so it is the accessible name unless an
         aria-label overrides it — and it is overridden on both, because "View
         3D Tour" on its own does not say WHICH floorplan when a screen reader
         is walking sixteen of them in a row. */
      const tourLabel = '<span class="fp-tour-label">View 3D Tour</span>';
      const tourBtn = tour
        ? `<a class="fp-tour" href="${tour}" target="_blank" rel="noopener noreferrer"
             aria-label="View the 3D tour of the ${m.name} ${f.name} floorplan — opens in a new tab">${tourIcon}${tourLabel}</a>`
        : `<button type="button" class="fp-tour" disabled aria-disabled="true"
             aria-label="No 3D tour yet for the ${m.name} ${f.name} floorplan">${tourIcon}${tourLabel}</button>`;
      const zoomBtn = f.img ? `
        <button type="button" class="fp-zoom" data-zoom="${f.img}"
                data-zoom-caption="${m.name} ${f.name}"
                aria-label="Enlarge the ${m.name} ${f.name} floorplan">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/>
          </svg>
        </button>` : '';
      /* The tour half is always there now, so the row always is — but the guard
         stays: an empty absolutely-positioned box over the drawing is a hit
         target that swallows clicks meant for the card, and this is the only
         thing standing between that and a future plan with neither control. */
      const tools = (tourBtn || zoomBtn)
        ? `<div class="fp-card-tools">${tourBtn}${zoomBtn}</div>` : '';

      return `
      <div class="fp-card-wrap">
      <button type="button" class="fp-card${state.floorplanId === f.id ? ' selected' : ''}${f.isNew ? ' is-new' : ''}"
              data-select="fp" data-id="${f.id}"${f.isNew ? ' disabled aria-disabled="true"' : ''}>
        <span class="fp-card-media">${media}<span class="fp-card-plan">${f.name}</span></span>
        <span class="fp-card-body">
          ${badges ? `<span class="fp-badges">${badges}</span>` : ''}
          <span class="fp-specs">
            ${stat(f.sleeps, 'Sleeps')}
            ${stat(f.length, 'Length')}
            ${stat(f.weight ? f.weight + ' lb' : '', 'Dry weight')}
          </span>
          ${price}
        </span>
      </button>${tools}</div>`;
    }).join('');

    const newCount = plans.filter((f) => f.isNew).length;
    const note = newCount
      ? ` ${newCount} plan${newCount > 1 ? 's are' : ' is'} too new for Jayco to have published pricing — your dealer can quote ${newCount > 1 ? 'them' : 'it'}.`
      : '';
    return `<div class="step-head"><h2>Choose a floorplan</h2>
        <p>${plans.length} ${m.name} layout${plans.length > 1 ? 's' : ''}.${note}</p></div>
      <div class="option-grid option-grid--fp">${cards}</div>`;
  }

  function renderSwatchStep(kind, title, sub) {
    const m = model();
    const sel = kind === 'exterior' ? state.exteriorId : state.interiorId;
    const opts = optionSets(m)[kind];

    /* SOLE OPTION.
       A single card in a chooser reads as a grid that failed to load — there is
       nothing to compare it against and nothing to decide. So when a model
       offers exactly one, the step stops pretending to be a chooser: it shows
       the thing full width, names it, and says plainly that it is the only one.
       The option stays selected in state, so the summary and the running total
       are unchanged. */
    if (opts.length === 1) {
      const o = opts[0];
      /* Exterior has no swatch of its own — the coach as built IS the finish,
         so the model render is the honest picture of it. Interior has the real
         décor strip. */
      const img = o.image || (kind === 'exterior' ? modelImg(m) : '');
      const what = kind === 'exterior' ? 'exterior finish' : 'interior décor';
      /* The chooser's own words have to go too. "Choose your exterior / Select
         a paint or graphics scheme" above a panel that says there is nothing to
         choose is the step contradicting itself. */
      title = kind === 'exterior' ? 'Your exterior' : 'Your interior';
      sub   = kind === 'exterior'
        ? `How the ${m.year} ${m.name} is finished.`
        : `The décor the ${m.year} ${m.name} is built with.`;
      return `<div class="step-head"><h2>${title}</h2><p>${sub}</p></div>
        <div class="sole-option">
          ${img ? `<div class="sole-option-media"><img src="${img}" alt="${m.name} — ${o.name} ${what}" /></div>` : ''}
          <div class="sole-option-body">
            <span class="sole-option-eyebrow">${kind === 'exterior' ? 'Exterior' : 'Décor'}</span>
            <h3 class="sole-option-name">${o.name}</h3>
            <p class="sole-option-note">The ${m.year} ${m.name} is offered in a single ${what}, so there is
               nothing to choose here — ${o.name} is what you get, and it is included in the price.</p>
            <span class="sole-option-price">Included</span>
          </div>
        </div>`;
    }

    /* A real decor photograph beats a flat hex chip where one was supplied; the
       palette entries have no image and keep the chip. */
    const cards = opts.map((o) => `
      <button type="button" class="swatch${o.image ? ' swatch--photo' : ''}${sel === o.id ? ' selected' : ''}" data-select="${kind === 'exterior' ? 'ex' : 'in'}" data-id="${o.id}">
        ${o.image
          ? `<span class="swatch-photo"><img src="${o.image}" alt="${o.name} décor" loading="lazy" /></span>`
          : `<span class="swatch-chip" style="background:${o.hex}"></span>`}
        <span class="swatch-name">${o.name}</span>
        <span class="swatch-price${o.price === 0 ? ' included' : ''}">${delta(o.price)}</span>
      </button>`).join('');
    return `<div class="step-head"><h2>${title}</h2><p>${sub}</p></div><div class="swatch-grid">${cards}</div>`;
  }

  function renderPackagesStep() {
    const m = model();
    const pkgs = optionSets(m).packages;
    const fp = planOf(m);
    const check = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';
    const cards = pkgs.map((p) => `
      <button type="button" class="pkg-card${state.packageIds.has(p.id) ? ' selected' : ''}${p.mandatory ? ' is-locked' : ''}"
              data-select="pkg" data-id="${p.id}"${p.mandatory ? ' aria-disabled="true"' : ''}>
        <span class="pkg-check">${check}</span>
        <span class="pkg-info">
          <span class="pkg-name">${p.name}${
            p.mandatory ? '<span class="pkg-badge pkg-badge--req">Required</span>'
                        : (p.recommended ? '<span class="pkg-badge">Recommended</span>' : '')}</span>
          ${p.desc ? `<span class="pkg-desc">${p.desc}</span>` : ''}
        </span>
        <span class="pkg-price${p.price === 0 ? ' included' : ''}">${delta(p.price)}</span>
      </button>`).join('');
    /* The list is the SELECTED plan's, so say which — otherwise switching
       floorplans silently changes what is on offer here. */
    const scope = fp && fp.optionIds
      ? `Options Jayco lists for the ${fp.name}. Required packages are priced into every build of this plan.`
      : 'Select any upgrades — your price updates instantly.';

    /* Everything selectable comes first; the spec sheet sits underneath as
       reference. A plan Jayco has not costed yet has no option list at all, so
       the choices block collapses and the specs stand alone rather than leaving
       an empty heading above nothing. */
    const choices = pkgs && pkgs.length
      ? `<div class="pkg-list">${cards}</div>`
      : `<p class="step-note">Jayco has not published an option list for the ${fp ? fp.name : 'this plan'} yet.</p>`;

    return `<div class="step-head"><h2>Packages &amp; Options</h2><p>${scope}</p></div>
      ${choices}
      ${renderSpecSheet(fp, m)}`;
  }

  /* ----- the selected floorplan's full specifications -----
     Jayco's own four groups, in Jayco's own order, printed as they are
     published. Only groups that exist are rendered: the newest plans have a
     code, a drawing and almost nothing else, and an empty "Weights" table reads
     as a fault rather than as data Jayco has not released. */
  function renderSpecSheet(fp, m) {
    const specs = fp && fp.specs;
    if (!specs) {
      return `<section class="spec-sheet">
        <h3 class="spec-sheet-head">Full specifications</h3>
        <p class="step-note">Jayco has not published specifications for the ${fp ? fp.name : 'selected plan'} yet.</p>
      </section>`;
    }
    const groups = Object.keys(specs).map((g) => {
      const rows = Object.keys(specs[g]).map((k) =>
        `<div class="spec-row"><dt>${k}</dt><dd>${specs[g][k]}</dd></div>`).join('');
      return `<div class="spec-group">
        <h4 class="spec-group-head">${g}</h4>
        <dl class="spec-rows">${rows}</dl>
      </div>`;
    }).join('');
    return `<section class="spec-sheet">
      <h3 class="spec-sheet-head">Full specifications</h3>
      <p class="spec-sheet-sub">${m.year} ${m.name} ${fp.name}, as published by Jayco.</p>
      <div class="spec-groups">${groups}</div>
    </section>`;
  }

  /* ----- the build, in pictures -----
     The review used to be the model render and then six lines of type, which
     meant the two things the visitor actually chose to LOOK at — the floorplan
     drawing and the décor — were named on this step and shown nowhere.

     Each picture now sits IN ITS OWN ROW, under the label that names it, so a
     selection and the thing it selected are one block rather than two columns
     the eye has to pair up. Under rather than beside, because a picture beside
     the text is capped by the row's height and these two want to be looked at:
     a floorplan's printed dimensions and a décor strip's six labelled swatches
     are the reason to look at either. Below the text they take the room.

     Nothing is rendered for a row with no picture. The leading-slot version of
     this needed an empty box on four of six rows to keep the labels in one
     column; under the text there is nothing to hold open — every label starts
     at the row's own left edge whatever follows it.

     Both pictures still open the enlarged view. data-zoom is all it takes: the
     delegated handler on #step-panel already runs this modal for the floorplan
     cards, and the aria-label has to open with "Enlarge the" because
     openZoom() strips exactly that to build the enlarged image's alt. */
  function renderThumb(i) {
    if (!i.img && !i.hex) return '';
    const media = i.img
      ? `<img src="${i.img}" alt="${i.alt}" loading="lazy" />`
      : `<span class="rl-chip" style="background:${i.hex}" role="img" aria-label="${i.alt}"></span>`;
    /* The frame is an inner element, not the button itself: it is what clips
       the picture to a rounded rectangle, and keeping the clip off the button
       leaves the badge free to sit wherever it reads best. */
    const frame = `<span class="rl-thumb-frame${i.art ? ' rl-thumb-frame--art' : ''}">${media}</span>`;
    /* A <button> only where there is something to open — a thumbnail that
       looks clickable and is not is worse than one that plainly is not. A flat
       hex chip has nothing to enlarge. */
    if (!i.zoom) return `<span class="rl-thumb">${frame}</span>`;
    return `<button type="button" class="rl-thumb rl-thumb--open"
              data-zoom="${i.zoom}" data-zoom-caption="${i.zoomCaption}"
              aria-label="Enlarge the ${i.alt}">${frame}
        <span class="rl-thumb-zoom" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/>
          </svg>
        </span>
      </button>`;
  }

  function renderSummaryStep() {
    const m = model();
    const rows = lineItems().map((i) => `
      <div class="review-line">
        <div class="rl-head">
          <span class="rl-label">${i.label}<b>${i.sub}</b></span>
          <span class="rl-val${!i.base && i.price === 0 ? ' included' : ''}">${i.base ? fmt(i.price) : (i.tbd ? 'Pricing to come' : delta(i.price))}</span>
        </div>
        ${renderThumb(i)}
      </div>`).join('');
    return `<div class="step-head"><h2>Review your build</h2><p>Here's your ${m.year} ${m.name} as configured.</p></div>
      <div class="summary-review">
        <figure class="summary-visual">
          <figcaption class="sv-cap">
            <span class="sv-eyebrow">Model</span><span class="sv-name">${m.year} ${m.name}</span>
          </figcaption>
          <span class="sv-media"><img src="${modelImg(m)}" alt="${m.year} ${m.name}" /></span>
        </figure>
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

  /* ----- the enlarged floorplan -----
     A drawing at card width is a smear: the printed dimensions on it are the
     reason to look at a floorplan at all, and they are unreadable at 330px.
     Same component the model page and the quiz result ship, and the same two
     details that were paid for once already: the closed state is the [hidden]
     attribute rather than a transitioned visibility — Chrome flips a discrete
     visibility transition halfway through a fade, and focus() inside a hidden
     subtree is a silent no-op — and Lenis is stopped on open, because it keeps
     scrolling the page under a fixed overlay whatever overflow says.

     Built on first use and kept: the panel is re-rendered on every step, and a
     modal rebuilt with it would leak one per visit. */
  let zoomUI = null;

  function openZoom(btn) {
    if (!zoomUI) {
      const el = document.createElement('div');
      el.className = 'bp-zoom';
      el.hidden = true;
      el.setAttribute('role', 'dialog');
      el.setAttribute('aria-modal', 'true');
      el.setAttribute('aria-label', 'Floorplan, enlarged');
      el.innerHTML =
        '<div class="bp-zoom-scrim" data-zoom-close="1"></div>' +
        '<button type="button" class="bp-zoom-close" aria-label="Close the enlarged floorplan">' +
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
            'stroke-width="1.9" stroke-linecap="round" aria-hidden="true">' +
            '<path d="M6 6l12 12M18 6L6 18"/></svg>' +
        '</button>' +
        '<div class="bp-zoom-inner">' +
          '<img class="bp-zoom-img" src="' + btn.dataset.zoom + '" alt="" />' +
          '<span class="bp-zoom-caption"></span>' +
        '</div>';
      document.body.appendChild(el);

      const close = el.querySelector('.bp-zoom-close');
      let hideT = null, returnTo = null;

      const shut = () => {
        if (el.hidden) return;
        el.classList.remove('is-open');
        document.body.style.overflow = '';
        if (window.__jaycoLenis && window.__jaycoLenis.start) window.__jaycoLenis.start();
        if (returnTo && document.body.contains(returnTo)) returnTo.focus();
        returnTo = null;
        clearTimeout(hideT);
        hideT = setTimeout(() => { el.hidden = true; }, 320);
      };

      close.addEventListener('click', shut);
      el.addEventListener('click', (e) => { if (e.target.dataset.zoomClose) shut(); });
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { e.preventDefault(); shut(); return; }
        /* the close button is the only focusable thing in here, so the trap is
           simply: Tab cannot leave */
        if (e.key === 'Tab') { e.preventDefault(); close.focus(); }
      });

      zoomUI = {
        el: el,
        img: el.querySelector('.bp-zoom-img'),
        cap: el.querySelector('.bp-zoom-caption'),
        close: close,
        open: (from) => {
          zoomUI.img.src = from.dataset.zoom;
          zoomUI.img.alt = from.getAttribute('aria-label').replace(/^Enlarge the /, '');
          zoomUI.cap.textContent = from.dataset.zoomCaption || '';
          returnTo = from;
          clearTimeout(hideT);
          el.hidden = false;
          document.body.style.overflow = 'hidden';
          if (window.__jaycoLenis && window.__jaycoLenis.stop) window.__jaycoLenis.stop();
          close.focus();
          requestAnimationFrame(() => el.classList.add('is-open'));
        },
      };
    }
    zoomUI.open(btn);
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
      /* Clearing the src is not enough — an image element with none still
         paints the browser's placeholder box, which is what sat in the summary
         panel before any model was picked. Hide the element itself. */
      $('#summary-img').removeAttribute('src');
      $('#summary-img').hidden = true;
      $('#summary-lines').innerHTML = '<li class="summary-line"><span class="sl-label">No model selected yet</span></li>';
      return;
    }
    $('#summary-img').src = modelImg(m);
    $('#summary-img').alt = m.name;
    $('#summary-img').hidden = false;
    $('#summary-name').textContent = m.name;
    $('#summary-cat').textContent = categoryOf(m).name;
    $('#summary-year').textContent = m.year;

    $('#summary-lines').innerHTML = lineItems().map((i) => `
      <li class="summary-line">
        <span class="sl-label">${i.label}<small>${i.sub}</small></span>
        <span class="sl-val${!i.base && i.price === 0 ? ' included' : ''}">${i.base ? fmt(i.price) : (i.tbd ? 'TBD' : delta(i.price))}</span>
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
    /* The Summary panel already lists every line, the total and the CTAs, so on
       that step the sticky sidebar (and the mobile price bar) would repeat the
       same figures twice on one screen. The flag lets CSS drop them and give
       the review the full width. */
    $('#builder').classList.toggle('is-summary', STEPS[state.step].id === 'summary');
    renderSteps();
    renderPanel();
    renderSidebar();
    renderNav();

    /* Every step swap replaces the whole panel and moves the document height by
       thousands of pixels — the floorplan grid alone is 35 cards. Every
       ScrollTrigger on the page caches its start/end against the layout at the
       moment it was created, so without this they all measure against a page
       that no longer exists.
       What that broke: app.js reveals the footer with gsap.from(..., opacity:0)
       on a ScrollTrigger. `from` sets opacity to 0 immediately and only restores
       it when the trigger fires; with a stale trigger point that never happened,
       so the footer sat at opacity 0 permanently — present, full height, and
       invisible. Worse on phones, where the page is three times taller and the
       cached position is further out.
       In a rAF so the new panel has been laid out before anything is measured. */
    if (window.ScrollTrigger) requestAnimationFrame(() => window.ScrollTrigger.refresh());
  }

  /* ----- navigation ----- */
  /* Put the viewport back at the top of the builder for the incoming step.
     This has to go through Lenis rather than window.scrollTo(). app.js hands
     the page scroll to a Lenis instance that rewrites scrollTop from its own
     RAF loop every frame, so a native scroll does not stick — Lenis overwrites
     it on the next frame from its own, still-stale, target. Selecting a
     floorplan two thirds of the way down the 35-card grid used to land on the
     Exterior step at ~820px, with the heading 600px above the viewport, and
     the user had to scroll up to see what they had just moved to.
     Immediate, not smooth: the panel underneath has already been replaced, so
     animating back up would be a journey through content that is no longer
     there. */
  function toTopOfBuilder() {
    const lenis = window.__jaycoLenis;
    if (lenis && typeof lenis.scrollTo === 'function') {
      /* the step swap changed the document height; refresh Lenis's cached
         limit before it clamps the new target against the old one */
      if (typeof lenis.resize === 'function') lenis.resize();
      lenis.scrollTo(0, { immediate: true });
      return;
    }
    window.scrollTo(0, 0);
  }

  function goStep(i) {
    i = Math.max(0, Math.min(LAST, i));
    if (i > 0 && !state.modelId) return;
    state.step = i;
    /* Render first: the scroll has to be measured against the height of the
       step being moved TO, not the one being left. */
    render();
    toTopOfBuilder();
  }
  /* cycleModel() lived here and drove the summary panel's prev/next arrows.
     Removed with them — the model is picked from the cards in step 1.
     MODEL_ORDER stays: it still orders the model grid and its count feeds the
     step-1 blurb. */

  /* ----- events ----- */
  function wireEvents() {
    // step tabs
    $('#steps-list').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-step]');
      if (btn && !btn.disabled) goStep(+btn.dataset.step);
    });
    /* Keep the edge fades honest while the user drags the rail, and while the
       smooth scroll from followActiveStep() is still running — the call right
       after scrollTo() reads the pre-animation offset. */
    $('#steps-list').addEventListener('scroll', paintStepFades, { passive: true });
    window.addEventListener('resize', paintStepFades);

    // panel selections (delegated) — actions first (more specific), then selections
    $('#step-panel').addEventListener('click', (e) => {
      /* Before anything else: the zoom sits over the card and must not read as
         a click on it. It is a sibling rather than a child, so this is about
         order, not about stopping propagation. */
      const zoomBtn = e.target.closest('[data-zoom]');
      if (zoomBtn) { openZoom(zoomBtn); return; }

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
        /* The whole card is the button. Picking a model IS starting the build,
           so anywhere on the tile does what "Build Yours" does rather than
           quietly selecting it and leaving the user to find a second control.
           The two real buttons inside the card still take precedence — the
           specs toggle returns above, and "Build Yours" runs the same path — so
           this only catches the card's own dead space. */
        if (kind === 'model') { selectModel(id); goStep(1); return; }
        /* Changing the plan changes which options exist — Jayco lists them per
           floorplan — so the selection is rebuilt rather than carried across,
           which would leave a double-axle package attached to a single-axle
           plan that never offered it. */
        /* Picking a plan is the decision this step exists for, so it carries
           the user forward rather than leaving them to find Next. The other
           steps do NOT auto-advance: exterior, interior and packages are all
           places you may want to compare or change your mind before moving on. */
        if (kind === 'fp') {
          state.floorplanId = id;
          seedPackages();
          goStep(state.step + 1);
          return;
        }
        if (kind === 'ex') { state.exteriorId = id; }
        if (kind === 'in') { state.interiorId = id; }
        if (kind === 'pkg') {
          const pk = (optionSets(model()).packages || []).find((p) => p.id === id);
          if (pk && pk.mandatory) return;        // priced into every build of this plan
          state.packageIds.has(id) ? state.packageIds.delete(id) : state.packageIds.add(id);
        }
        renderPanel(); renderSidebar();
      }
    });

    $('#build-back').addEventListener('click', () => goStep(state.step - 1));
    $('#build-next').addEventListener('click', () => goStep(state.step + 1));
    $('#mobile-next').addEventListener('click', () => goStep(state.step + 1));
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
    const params = new URLSearchParams(window.location.search);
    const q = params.get('model');
    if (!q || !JAYCO.models[q]) return;
    selectModel(q);
    state.catFilter = JAYCO.models[q].category;

    /* ?step= opens further in than the model step. Only meaningful with a
       model, which is why it sits inside that branch: a step with nothing
       selected is a panel with nothing in it, and goStep() would bounce it
       back anyway.

       Named, not numbered — STEPS is reordered from time to time and a link
       written elsewhere in the site should not have to know that Floorplan is
       index 1. Unknown names are ignored rather than clamped: a typo landing
       someone on Summary is worse than a typo doing nothing.

       Added for the model page's "View All Floorplans" button, which wants the
       floorplan grid and not the model picker. */
    const step = STEPS.findIndex((st) => st.id === params.get('step'));
    if (step > 0) { state.step = step; state.maxReached = step; }
  }

  /* ============ INIT ============ */
  function init() {
    applyDeepLink();
    wireEvents();
    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
