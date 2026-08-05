/* ===================================================
   Jayco — RV Selector Quiz controller
   ---------------------------------------------------
   The state machine, the rendering and the one authored
   motion moment. All scoring lives in quiz-score.js and
   all copy lives in quiz-data.js; this file decides what
   is on screen and what happens when you touch it.

   Runs at parse time like every page script here, and
   defers motion to app.js's 'jayco:animations-ready'.
   Never creates a second Lenis or registers ScrollTrigger.
   =================================================== */

(function () {
  'use strict';

  const Q = window.JAYCO_QUIZ;
  const S = window.JAYCO_QUIZ_SCORE;
  if (!Q || !S) return;

  const $ = (sel) => document.querySelector(sel);
  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const money = (n) => '$' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* A towable answer opens the whole towable side; the tow gate, the toy
     hauler answer and the destination gate do the narrowing from there. The
     motorized side is narrowed by MQ instead, because "how big a vehicle do
     you want to drive" IS the category question. */
  const TOWABLE_CATEGORIES = ['travel-trailers', 'fifth-wheels', 'destination', 'toy-haulers'];

  /* ---------- Token index ----------
     token -> { qid, groupKey, option }. Built from the data, so decoding a
     shared link is position-independent: reordering the questions cannot
     silently resolve someone's answers against different meanings. */
  const TOKENS = {};
  Q.questions.forEach((q) => {
    (q.options || []).forEach((o) => { TOKENS[o.token] = { qid: q.id, group: null, option: o }; });
    (q.groups || []).forEach((g) => g.options.forEach((o) => {
      TOKENS[o.token] = { qid: q.id, group: g.key, option: o };
    }));
  });
  TOKENS.flip = { qid: 'flip', group: null, option: { token: 'flip' } };

  /* Set by boot() when a shared link is too old to resolve. Printed on the
     intro screen, which is where a stale link now lands. */
  let notice = null;

  /* ---------- State ----------
     `picks` is the ordered record of what was chosen — it is the state, and
     both the answers and the shareable link are derived from it. `trail` is
     the screens actually visited, kept separately because going back has to
     pop the path that was taken, not recompute it: recomputing loses the
     branch at exactly the moment you are editing the answer that caused it. */
  const state = { picks: [], trail: [], screen: null, result: null };

  function answersOf(picks) {
    const a = {};
    picks.forEach((p) => {
      if (p.token === 'flip') { a._flip = true; return; }
      const t = TOKENS[p.token];
      if (t && t.option.sets) Object.assign(a, t.option.sets);
      if (t && t.option.needsHeadroom) a.towNeed = t.option.needsHeadroom;
      if (t && t.option.addCategories) a.addCategories = t.option.addCategories.slice();
    });

    /* The helper resolves the fork by score. Tie goes to towable — lower entry
       cost and the broadest lineup — which is also why the "prefer to drive
       instead?" flip on the result is load-bearing rather than decorative:
       only three of the nine helper combinations resolve motorized. */
    const help = picks.filter((p) => TOKENS[p.token] && TOKENS[p.token].qid === 'help');
    if (help.length === 2) {
      let drive = 0, tow = 0;
      help.forEach((p) => {
        const sc = TOKENS[p.token].option.score || {};
        drive += sc.drive || 0; tow += sc.tow || 0;
      });
      a.family = drive > tow ? 'motorized' : 'towable';
      a._helped = true;
    }

    if (a._flip) {
      a.family = a.family === 'motorized' ? 'towable' : 'motorized';
      delete a.categories;
      delete a.addCategories;
    }

    if (a.family === 'towable') {
      a.categories = TOWABLE_CATEGORIES.slice();
    } else if (a.family === 'motorized' && !a.categories) {
      /* Flipped into motorized without ever seeing MQ. Derive a sensible size
         from the capacity they already gave us rather than asking again. */
      a.categories = (a.sleeps && a.sleeps >= 3) ? ['class-c'] : ['class-b'];
    }
    return a;
  }

  const answers = () => answersOf(state.picks);

  /* ---------- Flow ---------- */
  function shows(q, a) { return !q.when || q.when(a); }

  function nextId(a, trail) {
    const seen = {};
    trail.forEach((id) => { seen[id] = true; });
    for (let i = 0; i < Q.questions.length; i++) {
      const q = Q.questions[i];
      if (!seen[q.id] && shows(q, a)) return q.id;
    }
    return 'result';
  }

  /* Honest, and it can change exactly once — when the helper resolves the fork
     and the motorized side turns out to be one screen longer. Returns null
     while the branch is genuinely unknown, and the counter then says
     "Question 2" rather than inventing a total. */
  function total(a, trail) {
    if (a.family === undefined || a.family === null) return null;
    const seen = {};
    trail.forEach((id) => { seen[id] = true; });
    let remaining = 0;
    Q.questions.forEach((q) => { if (!seen[q.id] && shows(q, a)) remaining++; });
    return trail.length + remaining;
  }

  const questionById = (id) => Q.questions.filter((q) => q.id === id)[0];

  /* ---------- URL ----------
     Readable dot-separated tokens in the order they were chosen, plus the
     schema version. Short enough for an SMS and legible in print. */
  function link() {
    const base = location.origin + location.pathname;
    if (!state.picks.length) return base;
    return base + '?v=' + Q.meta.version + '&a=' + state.picks.map((p) => p.token).join('.');
  }

  function decode() {
    const p = new URLSearchParams(location.search);
    const a = p.get('a');
    if (!a) return null;
    if (String(p.get('v')) !== String(Q.meta.version)) return { stale: true };

    const picks = [];
    const toks = a.split('.').filter(Boolean);
    for (let i = 0; i < toks.length; i++) {
      const t = TOKENS[toks[i]];
      if (!t) return { stale: true };                    // unknown token
      picks.push({ qid: t.qid, group: t.group, token: toks[i] });
    }
    /* Replay the walk and check each token was legal where it appears. A link
       that decodes but describes an impossible path is stale, not valid. */
    const trail = [];
    let acc = [];
    for (let i = 0; i < picks.length; i++) {
      const pick = picks[i];
      if (pick.token === 'flip') { acc.push(pick); continue; }
      const want = nextId(answersOf(acc), trail);
      if (want !== pick.qid) {
        /* The two helper groups live on one screen, so the second token
           repeats its question id — that is expected, not a break. */
        if (!(trail.length && trail[trail.length - 1] === pick.qid)) return { stale: true };
      }
      acc.push(pick);
      if (trail[trail.length - 1] !== pick.qid) trail.push(pick.qid);
    }
    return { picks: picks, trail: trail };
  }

  /* replaceState only: a half-finished quiz in the address bar is noise, and
     compare.js sets the same convention. The exception is the result, which is
     the thing worth linking to. */
  function syncUrl() {
    if (!window.history || !history.replaceState) return;
    history.replaceState({}, '', state.screen === 'result' ? link() : location.pathname);
  }

  /* ---------- Rendering ---------- */

  function chevron() {
    return '<svg class="qz-choice-chev" width="16" height="16" viewBox="0 0 24 24" fill="none" ' +
      'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ' +
      'aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>';
  }

  function choiceRow(o, checked, label) {
    return '<button type="button" class="qz-choice" role="radio" data-token="' + esc(o.token) + '"' +
      ' aria-checked="' + (checked ? 'true' : 'false') + '" tabindex="' + (checked ? '0' : '-1') + '">' +
      '<span class="qz-choice-mark" aria-hidden="true"></span>' +
      '<span class="qz-choice-text">' +
        '<span class="qz-choice-label">' + esc(label || o.label) + '</span>' +
        (o.clarifier ? '<span class="qz-choice-note">' + esc(o.clarifier) + '</span>' : '') +
      '</span>' + chevron() + '</button>';
  }

  function groupHtml(opts, labelText, groupKey, picked) {
    const id = 'qzg-' + (groupKey || 'main');
    return '<div class="qz-group" data-group="' + esc(groupKey || '') + '">' +
      (labelText ? '<span class="qz-group-label" id="' + id + '">' + esc(labelText) + '</span>' : '') +
      '<div class="qz-choices" role="radiogroup"' +
        (labelText ? ' aria-labelledby="' + id + '"' : ' aria-labelledby="qz-ask"') + '>' +
        opts.map((o) => choiceRow(o, picked === o.token)).join('') +
      '</div></div>';
  }

  function renderQuestion(id) {
    const q = questionById(id);
    const a = answers();

    /* S4's labels come from the real MSRP of whatever survived the earlier
       answers, so the budget question is asked in money rather than in the
       words value / mid / premium — which this data cannot support anyway
       (the authored tiers contradict the prices). Falls back to plain words
       when there is too little left to band. */
    let opts = q.options || [];
    if (q.dynamic === 'priceBands') {
      const bands = S.priceBands(a);
      if (bands) opts = opts.map((o, i) => Object.assign({}, o, { clarifier: bands[i] }));
    }

    const pickedFor = (gk) => {
      const p = state.picks.filter((x) => x.qid === id && x.group === (gk || null));
      return p.length ? p[p.length - 1].token : null;
    };

    const body = q.groups
      ? q.groups.map((g) => groupHtml(g.options, g.label, g.key, pickedFor(g.key))).join('')
      : groupHtml(opts, null, null, pickedFor(null));

    /* The screens both paths share can carry one photograph per path — see the
       note over `photos` in quiz-data.js. `a.family` is null on the fork
       itself and until the helper resolves it, and a question may name only
       one family, so `photo`/`alt` remain the answer in every other case. */
    const perPath = q.photos && a.family && q.photos[a.family];
    const shot = perPath
      ? { src: perPath.src, alt: perPath.alt || q.alt || '' }
      : { src: q.photo, alt: q.alt || '' };

    const canBack = state.trail.length > 1;

    return '<div class="qz-screen qz-screen--q">' +
      '<div class="qz-spread">' +
        '<div class="qz-col">' +
          '<h2 class="qz-ask" id="qz-ask" tabindex="-1">' + esc(q.question) + '</h2>' +
          (q.why ? '<p class="qz-why">' + esc(q.why) + '</p>' : '') +
          body +
          '<div class="qz-footrow">' +
            (canBack ? '<button type="button" class="qz-back" id="qz-back">' +
              '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
              'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
              '<path d="M15 18l-6-6 6-6"/></svg>Back</button>' : '') +
          '</div>' +
        '</div>' +
        /* One photograph, chosen to show what this screen is asking about —
           and on the screens both paths share, chosen for the path as well. */
        '<div class="qz-media">' +
          '<img class="qz-media-img" src="' + esc(shot.src) + '" alt="' + esc(shot.alt) + '" />' +
        '</div>' +
      '</div></div>';
  }

  /* ---------- Enlarged floorplan ----------
     One modal for the page, built the first time someone asks for it and kept
     afterwards — the result screen is repainted on every retake, and a modal
     rebuilt each time would leak one per visit.

     Its structure and its two hard-won details are model.html's: the closed
     state is the [hidden] attribute rather than a visibility transition,
     because Chrome flips a discrete visibility transition halfway through the
     fade and focus() inside a still-hidden subtree is a silent no-op; and
     Lenis is stopped on open, because it keeps scrolling the page under a
     fixed overlay no matter what overflow says. */
  let zoom = null;

  /* `btn` is the zoom button that asked for it, and it is not optional: the
     image element is seeded from it at build time so the document never
     carries an image tag with no source. The file is already on the page
     behind the modal, so seeding costs no request. */
  function zoomModal(btn) {
    if (zoom) return zoom;

    const el = document.createElement('div');
    el.className = 'qz-zoom';
    el.hidden = true;
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', 'Floorplan, enlarged');
    el.innerHTML =
      '<div class="qz-zoom-scrim" data-zoom-close="1"></div>' +
      '<button type="button" class="qz-zoom-close" aria-label="Close the enlarged floorplan">' +
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
          'stroke-width="1.9" stroke-linecap="round" aria-hidden="true">' +
          '<path d="M6 6l12 12M18 6L6 18"/></svg>' +
      '</button>' +
      '<div class="qz-zoom-inner">' +
        '<img class="qz-zoom-img" src="' + esc(btn.dataset.zoomSrc) + '" alt="" />' +
        '<span class="qz-zoom-caption"></span>' +
      '</div>';
    document.body.appendChild(el);

    const img = el.querySelector('.qz-zoom-img');
    const cap = el.querySelector('.qz-zoom-caption');
    const close = el.querySelector('.qz-zoom-close');
    let returnTo = null;
    let hideT = null;

    function open(btn) {
      /* set before the modal is shown, so it never appears mid-swap */
      img.src = btn.dataset.zoomSrc;
      img.alt = btn.getAttribute('aria-label').replace(/^Enlarge the /, '');
      cap.textContent = btn.dataset.zoomCaption || '';
      returnTo = btn;
      clearTimeout(hideT);
      el.hidden = false;
      document.body.style.overflow = 'hidden';
      if (window.__jaycoLenis && window.__jaycoLenis.stop) window.__jaycoLenis.stop();
      close.focus();
      requestAnimationFrame(() => el.classList.add('is-open'));
    }

    function shut() {
      if (el.hidden) return;
      el.classList.remove('is-open');
      document.body.style.overflow = '';
      if (window.__jaycoLenis && window.__jaycoLenis.start) window.__jaycoLenis.start();
      if (returnTo && document.body.contains(returnTo)) returnTo.focus();
      returnTo = null;
      clearTimeout(hideT);
      hideT = setTimeout(() => { el.hidden = true; }, 320);
    }

    close.addEventListener('click', shut);
    el.addEventListener('click', (e) => { if (e.target.dataset.zoomClose) shut(); });
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { e.preventDefault(); shut(); return; }
      /* the close button is the only focusable thing in here, so the trap is
         simply: Tab cannot leave */
      if (e.key === 'Tab') { e.preventDefault(); close.focus(); }
    });

    zoom = { open: open, close: shut };
    return zoom;
  }

  /* ---------- Intro ----------
     Screen zero, and it is built on the same spread as every question: copy on
     the left, one photograph on the right, in the same frame at the same size.
     So pressing the button moves the words and leaves the shape standing,
     rather than replacing one kind of page with another.

     All of its copy lives in quiz-data.js with the questions. */
  function renderIntro() {
    const i = Q.intro || {};
    const note = notice ? '<p class="qz-note qz-note--stale">' + esc(notice) + '</p>' : '';
    notice = null;

    return '<div class="qz-screen qz-screen--intro">' +
      '<div class="qz-spread">' +
        '<div class="qz-col qz-col--intro">' +
          (i.label ? '<span class="section-label">' + esc(i.label) + '</span>' : '') +
          '<h1 class="qz-intro-heading" id="qz-ask" tabindex="-1">' + esc(i.heading) + '</h1>' +
          '<p class="qz-intro-body">' + esc(i.body) + '</p>' +
          note +
          '<div class="qz-intro-ctas">' +
            '<button type="button" class="btn-primary" id="qz-start">' + esc(i.cta) + '</button>' +
            (i.skip ? '<a class="btn-link" href="' + esc(i.skip.href) + '">' +
              esc(i.skip.label) + '</a>' : '') +
          '</div>' +
        '</div>' +
        '<div class="qz-media">' +
          '<img class="qz-media-img" src="' + esc(i.photo) + '" alt="' + esc(i.alt || '') + '" />' +
        '</div>' +
      '</div></div>';
  }

  /* ---------- Result ---------- */

  /* Follows the site's own link policy, exactly as type-page.js does: a model
     page only where a real, non-stub detail record exists, and the builder for
     everything else — which is a complete page for all 27.

     It reads JAYCO_MODEL_PAGES, not JAYCO_MODEL_DETAIL. The detail records are
     64KB and only model.html loads them, so testing for them here was testing
     an object that is always empty on this page — which quietly sent every
     alternate card to the builder, Swift and Jay Feather included. The full
     registry still wins where it exists, since it is the source the list is
     checked against. */
  function hasModelPage(slug) {
    const d = window.JAYCO_MODEL_DETAIL;
    if (d && d[slug]) return !d[slug].stub;
    return (window.JAYCO_MODEL_PAGES || []).indexOf(slug) >= 0;
  }

  function modelHref(slug) {
    return hasModelPage(slug) ? 'model.html?model=' + slug : 'build-price.html?model=' + slug;
  }

  /* Where View Details goes. Only Swift and Jay Feather have a model page
     today, and model.html redirects an unknown slug to Swift — so pointing the
     other 25 at it would answer "tell me about the Pinnacle" with a camper van.
     They go to their category overview instead: a real, complete page that
     carries this model in its lineup, one click from here. Every model page
     built upgrades its own line automatically. */
  function detailsHref(slug) {
    if (hasModelPage(slug)) return 'model.html?model=' + slug;
    const lib = (window.JAYCO && window.JAYCO.models) || {};
    const cat = lib[slug] && lib[slug].category;
    return cat ? 'type.html?type=' + cat : 'compare.html';
  }

  /* Five of the 27 lines appear at two or fewer of the 428 harvested dealers —
     Alante SE at none at all. That is a hole in what Jayco published, not a
     fact about the market, so those hand off to the sibling those same dealers
     do stock, and the sub-label says so before anyone clicks.

     Which lines those are is recorded in quiz-data.js as `dealerFallback`,
     verified against the harvest. It is NOT counted here: doing so would mean
     loading all 428 dealer records on this page to answer one question the
     data already answers. */
  function dealerLink(row) {
    if (!row.dealerFallback) {
      return { href: 'dealers.html?model=' + encodeURIComponent(row.dealerName), note: null };
    }
    return {
      href: 'dealers.html?model=' + encodeURIComponent(row.dealerFallback),
      note: 'Jayco does not list ' + row.name + ' dealers separately, so this shows dealers who ' +
            'carry the ' + row.dealerFallback + '.',
    };
  }

  /* Each line echoes an answer AND names a number. "Roomy" is an adjective;
     "the 33F sleeps 7" is a reason. */
  function whyLines(r) {
    const a = r.asked || {};
    const out = [];
    const p = r.primary;

    if (a.sleeps) {
      const plan = r.plans[0];
      if (plan && typeof plan.plan.sleeps === 'number') {
        out.push('You said ' + (a.sleeps >= 5 ? 'five or more' : a.sleeps === 2 ? 'one or two' : 'three or four') +
          ' on board. The ' + plan.plan.name + ' sleeps ' + plan.plan.sleeps +
          (plan.features.indexOf('bunkhouse') >= 0 ? ' and has a bunkhouse' : '') + '.');
      } else if (p.sleepsMax != null) {
        out.push('You said ' + (a.sleeps >= 5 ? 'five or more' : 'a smaller group') +
          ' on board. The ' + p.name + ' sleeps up to ' + p.sleepsMax + '.');
      }
    }

    if (a.towVehicle && p.family === 'towable' && p.towVehicle !== 'delivered') {
      const words = { suv: 'an SUV', half_ton: 'a half-ton pickup',
                      three_quarter_ton: 'a three-quarter-ton', one_ton: 'a one-ton' };
      out.push('It is built to tow behind ' + (words[p.towVehicle] || 'your vehicle') +
        ', which is what you told us you drive.');
    } else if (p.family === 'motorized' && a.towNeed && p.towHeadroom) {
      out.push('You are towing behind it. This one is rated to pull ' +
        money(p.towHeadroom).replace('$', '') + ' lb.');
    }

    if (a.campStyle && p.campStyleFit.indexOf(a.campStyle) === 0) {
      const w = { offgrid: 'off the grid', mixed: 'a mix of campgrounds and open country',
                  hookups: 'sites with full hookups' };
      out.push('It suits ' + w[a.campStyle] + ', which is where you said you park.');
    }
    if (out.length < 3 && a.cadence) {
      const w = { weekend: 'weekends', extended: 'weeks at a time', fulltime: 'living in it' };
      out.push('Set up for ' + w[a.cadence] + '.');
    }
    if (out.length < 3) {
      out.push('Starts at ' + money(p.basePrice) + ' — ' + p.planCount +
        (p.planCount === 1 ? ' floorplan' : ' floorplans') + ' in the ' + p.year + ' line.');
    }
    return out.slice(0, 3);
  }

  /* A floorplan is a drawing to read, not a destination. The card used to be a
     link to the builder, which meant the only thing you could do with a
     floorplan was leave it. Now it is a plain card with one control: enlarge,
     because the dimensions printed on the drawing are unreadable at card width
     — the same reason model.html puts a zoom on its own floorplan stage. */
  function planCard(row, entry) {
    const p = entry.plan;
    const price = p.price == null
      ? '<span class="qz-card-price qz-card-price--tbd">Price not published yet</span>'
      : '<span class="qz-card-price">' + money(row.basePrice + p.price) + '</span>';
    const stats = [];
    if (typeof p.sleeps === 'number') stats.push(['Sleeps', p.sleeps]);
    if (p.length) stats.push(['Length', p.length]);
    const label = row.name + ' ' + p.name + ' floorplan';
    return '<div class="qz-card qz-card--plan">' +
      (p.img ? '<span class="qz-card-media">' +
        '<img src="' + esc(p.img) + '" alt="' + esc(label) + '" loading="lazy" />' +
        '<button type="button" class="qz-zoom-btn" data-zoom-src="' + esc(p.img) + '"' +
          ' data-zoom-caption="' + esc(row.name + ' ' + p.name) + '"' +
          ' aria-label="Enlarge the ' + esc(label) + '">' +
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
            'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/>' +
          '</svg>' +
        '</button></span>' : '') +
      '<span class="qz-card-name">' + esc(p.name) + '</span>' +
      '<span class="qz-card-stats">' + stats.map((s) =>
        '<span class="qz-card-stat"><b>' + esc(s[1]) + '</b>' + esc(s[0]) + '</span>').join('') + '</span>' +
      price + '</div>';
  }

  /* The type page's lineup card, restated — same order, same content, same
     three published specs. type.css says of it: "This is .md-similar-card from
     model.css, restated… If the card changes on one page it must be changed on
     the other." This is now the third copy, and the same rule applies.

     One thing the other two do not have is dropped rather than kept: the
     alternates carry a role ("One step down", "One step up"), and showing it
     would make this a different card. alt.role is still in the data if it is
     wanted back as an eyebrow. */
  function altCard(alt) {
    const r = alt.row;
    const stats = Object.keys(r.specs || {}).slice(0, 3).map((k) =>
      '<div class="qz-sim-stat">' +
        '<span class="qz-sim-stat-value">' + esc(r.specs[k]) + '</span>' +
        '<span class="qz-sim-stat-label">' + esc(k) + '</span>' +
      '</div>').join('');

    return '<a class="qz-sim-card" href="' + esc(modelHref(r.slug)) + '">' +
      '<h3 class="qz-sim-name">' + esc(r.name) + '</h3>' +
      '<p class="qz-sim-tagline">' + esc(r.tagline) + '</p>' +
      '<span class="qz-sim-price">Starting at ' + money(r.basePrice) +
        (r.year ? ' · ' + esc(r.year) : '') + '</span>' +
      '<div class="qz-sim-media"><img src="' + esc(r.img) + '" alt="' + esc(r.name) +
        '" loading="lazy" /></div>' +
      '<div class="qz-sim-stats">' + stats + '</div>' +
    '</a>';
  }

  function renderResult() {
    const a = answers();
    const r = S.score(a);
    state.result = r;

    if (r.dead) {
      return '<div class="qz-screen"><div class="qz-dead">' +
        '<span class="qz-eyebrow">No match</span>' +
        '<h1 class="qz-name" id="qz-ask" tabindex="-1">We cannot answer this one honestly.</h1>' +
        '<p class="qz-why">' + esc(r.reason) + ' Rather than point you at something your ' +
        'vehicle may not be rated to pull, here is the whole line-up to look through.</p>' +
        '<div class="qz-next"><a href="compare.html" class="btn-primary">Compare all floorplans</a>' +
        '<button type="button" class="btn-link" id="qz-retake">Start again</button></div>' +
        '</div></div>';
    }

    const p = r.primary;
    const dl = dealerLink(p);
    const notes = r.relaxations.map((x) =>
      '<li class="qz-why-item qz-why-item--note">' + esc(x.message) + '</li>').join('');
    const why = whyLines(r).map((t) => '<li class="qz-why-item">' + esc(t) + '</li>').join('');

    const planHead = p.planCount > r.plans.length
      ? r.plans.length + ' of ' + p.planCount + ' ' + p.name + ' floorplans'
      : (r.plans.length === 1 ? 'The ' + p.name + ' floorplan' : p.name + ' floorplans');

    /* ---- The four actions ----
       View Details leads and takes the blue, because reading about the model is
       what comes before configuring one. Where it goes when the model has no
       page of its own is detailsHref()'s problem, not this grid's.

       Download Brochure has nothing behind it. There is no PDF in this repo,
       and jayco.com publishes none either — its brochure page is a request
       form. The href matches the placeholder model.html already ships on its
       own brochure panel, so both go live the day the PDFs arrive; until then
       this is the one control on the page that does not do what it says. */
    /* One row, ordinary pills. .btn-secondary is the dark-ground outline
       variant — .btn-secondary-light would be ink on ink here. */
    const btn = (href, label, primary) =>
      '<a class="' + (primary ? 'btn-primary' : 'btn-secondary') + '" href="' + esc(href) + '">' +
      esc(label) + '</a>';

    const actions = '<div class="qz-band-ctas">' +
      btn(detailsHref(p.slug), 'View Details', true) +
      btn('build-price.html?model=' + p.slug, 'Build & Price', false) +
      btn('#', 'Download Brochure', false) +
      btn(dl.href, 'Find It at a Dealer', false) +
      '</div>' +
      (dl.note ? '<p class="qz-actions-note">' + esc(dl.note) + '</p>' : '');

    /* Offered only when the helper picked the branch for them — of the nine
       helper combinations only three resolve motorized, so someone who
       genuinely wanted to drive can end up towing. */
    const flip = (a._helped && !a._flip)
      ? '<p class="qz-next-note">Picked the wrong side? <button type="button" class="btn-link" ' +
        'id="qz-flip">Show me ' + (a.family === 'towable' ? 'motorhomes' : 'towables') +
        ' instead</button></p>' : '';

    /* The model's three published specs, plus what it starts at. Same
       value-over-label vocabulary as .md-stats on the model page — see
       model.css:408 — because it is the same job on a different page.
       Values are ink here, not the model page's blue: this screen already
       spends its blue on the confetti and the leading tile. */
    const specs = Object.keys(p.specs || {}).slice(0, 3)
      .map((k) => [p.specs[k], k])
      .concat([[money(p.basePrice), 'Starting at']]);

    const statRow = '<div class="qz-stats">' + specs.map((s) =>
      '<div class="qz-stat">' +
        '<span class="qz-stat-value">' + esc(s[0]) + '</span>' +
        '<span class="qz-stat-label">' + esc(s[1]) + '</span>' +
      '</div>').join('') + '</div>';

    /* ---- The reveal ----
       One viewport, and everything in it is in the DOM from the first frame.
       revealResult() only animates opacity and transform on top of a finished
       screen, so a blocked GSAP or a reduced-motion preference leaves this
       standing rather than empty. .qz-beat is the line that announces the
       match and then gets out of the way; aria-hidden because #qz-say has
       already said it to a screen reader, and hearing it twice is noise. */
    const reveal =
      '<div class="qz-reveal">' +
        '<p class="qz-beat" aria-hidden="true">Your Next Adventure</p>' +
        /* No eyebrow. "Your Next Adventure" has just been on screen at this
           size; labelling the name "Your match" underneath it said the same
           thing twice in a smaller voice. */
        '<div class="qz-hero">' +
          '<h1 class="qz-name" id="qz-ask" tabindex="-1">' + esc(p.name) + '</h1>' +
          '<div class="qz-hero-media">' +
            '<img src="' + esc(p.img) + '" alt="' + esc(p.year + ' Jayco ' + p.name) + '" />' +
          '</div>' +
          '<p class="qz-tagline">' + esc(p.tagline) + '</p>' +
        '</div>' +
        statRow +
      '</div>';

    return '<div class="qz-result">' +
      reveal +

      /* The reasons and the actions share one dark band running the full width
         of the viewport — the page's only dark ground, and the reason the
         actions read as the end of the argument rather than a fifth section. */
      '<section class="qz-band">' +
        '<div class="qz-band-inner">' +
          /* No `.light` here: that modifier belongs to .section-heading, and
             on .qz-h2 it silently does nothing. quiz.css colours it in the
             .qz-band scope instead. */
          '<h2 class="qz-h2">Why this one</h2>' +
          '<ul class="qz-why-list">' + notes + why + '</ul>' +
          actions +
        '</div>' +
      '</section>' +

      (r.plans.length ? '<section class="qz-section">' +
        '<div class="qz-section-head"><h2 class="qz-h2">' + esc(planHead) + '</h2>' +
          (p.planCount > r.plans.length
            ? '<a href="compare.html" class="btn-link">See all ' + p.planCount + '</a>' : '') +
        '</div>' +
        '<div class="qz-grid">' + r.plans.map((e) => planCard(p, e)).join('') + '</div>' +
      '</section>' : '') +

      /* The alternates used to sit here. They are now "Similar Options", below
         the email ask — see fillSimilar(). */

      /* Every action this page offers now sits under the price, where someone
         meets them before reading rather than after scrolling. What is left at
         the bottom is the one thing that is not an action: the offer to swap
         sides when the helper — not the visitor — picked the branch. On the
         paths where the visitor chose for themselves there is nothing to say,
         and the section drops rather than closing on an empty box. */
      (flip ? '<section class="qz-section"><div class="qz-next">' + flip + '</div></section>' : '') +
      '</div>';
  }

  /* ---------- Confetti ----------
     One burst, fired the instant the RV lands, from behind it. Canvas rather
     than DOM nodes: ninety elements being transformed every frame is ninety
     style recalculations, where a canvas is one.

     Colours are read from the stylesheet, not written here, so the burst
     cannot drift from the palette the rest of the page uses.

     The handle is module-scope so paint() can cancel a burst that is still
     running when someone retakes the quiz — otherwise the frame loop outlives
     the canvas it was drawing into. */
  let confettiRAF = null;

  function stopConfetti() {
    if (confettiRAF) { cancelAnimationFrame(confettiRAF); confettiRAF = null; }
    const old = document.querySelector('.qz-confetti');
    if (old && old.parentNode) old.parentNode.removeChild(old);
  }

  function confettiBurst(stage, origin) {
    if (!stage || !origin) return;
    stopConfetti();

    const css = getComputedStyle(document.documentElement);
    const tint = (name, fallback) => (css.getPropertyValue(name) || '').trim() || fallback;
    const COLORS = [
      tint('--blue', '#007AC2'),
      tint('--blue-light', '#0F90E0'),
      tint('--blue-dark', '#005E96'),
      tint('--warm-gray', '#E8E4DE'),
      tint('--navy', '#0F0B09'),
    ];

    const box = stage.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cv = document.createElement('canvas');
    cv.className = 'qz-confetti';
    cv.setAttribute('aria-hidden', 'true');
    cv.width = Math.round(box.width * dpr);
    cv.height = Math.round(box.height * dpr);
    stage.appendChild(cv);

    const ctx = cv.getContext('2d');
    ctx.scale(dpr, dpr);

    /* Fired upward and outward in a fan, not a full circle: pieces thrown down
       from behind the coach would be under it before anyone saw them. */
    const N = 90;
    const bits = [];
    for (let i = 0; i < N; i++) {
      const angle = (-Math.PI / 2) + (Math.random() - 0.5) * 2.2;   /* up, ±63° */
      const speed = 7 + Math.random() * 11;
      bits.push({
        x: origin.x + (Math.random() - 0.5) * box.width * 0.22,
        y: origin.y + (Math.random() - 0.5) * 24,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        w: 5 + Math.random() * 6,
        h: 8 + Math.random() * 8,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.35,
        color: COLORS[(Math.random() * COLORS.length) | 0],
        life: 0,
      });
    }

    /* Twice as long in the air. Doubling LIFE alone would not have done it —
       the pieces were leaving the bottom of the stage long before their life
       ran out, and anything past the edge is culled. So gravity halves too:
       they rise about as high, hang, and drift down at half the rate. */
    const GRAVITY = 0.17;
    const DRAG = 0.994;
    const LIFE = 300;                       /* ~5s at 60fps */

    function frame() {
      ctx.clearRect(0, 0, box.width, box.height);
      let alive = 0;
      for (let i = 0; i < bits.length; i++) {
        const b = bits[i];
        b.life++;
        if (b.life > LIFE) continue;
        b.vx *= DRAG;
        b.vy = b.vy * DRAG + GRAVITY;
        b.x += b.vx;
        b.y += b.vy;
        b.rot += b.vr;
        if (b.y - b.h > box.height) continue;
        alive++;
        /* fades over the last third of its life rather than blinking out */
        ctx.globalAlpha = b.life > LIFE * 0.66
          ? Math.max(0, 1 - (b.life - LIFE * 0.66) / (LIFE * 0.34)) : 1;
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.rot);
        ctx.fillStyle = b.color;
        /* scaleY on the height gives the flutter of a piece turning edge-on */
        ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h * Math.abs(Math.cos(b.rot * 1.6)));
        ctx.restore();
      }
      if (alive) { confettiRAF = requestAnimationFrame(frame); }
      else { stopConfetti(); }
    }
    confettiRAF = requestAnimationFrame(frame);
  }

  /* ---------- The reveal ----------
     Runs after the result has painted, on a screen that is already complete.
     Every step is opacity and transform only, so nothing here can leave the
     page in a state a visitor cannot read.

     The opening line plays once per session. Someone flipping to the other
     side, or coming back to a result they have already seen, gets the entrance
     without being told again that we found their match. */
  let beatPlayed = false;

  function revealResult() {
    const root = $('#qz-stage').firstElementChild;
    const reveal = root && root.querySelector('.qz-reveal');
    if (!reveal) return;                         /* the dead end has no reveal */

    const beat  = reveal.querySelector('.qz-beat');
    const name  = reveal.querySelector('.qz-name');
    const media = reveal.querySelector('.qz-hero-media');
    const tag   = reveal.querySelector('.qz-tagline');
    const stats = Array.prototype.slice.call(reveal.querySelectorAll('.qz-stat'));
    const first = !beatPlayed;

    /* No GSAP, or a reduced-motion preference: the screen is already finished.
       The beat is the one element that only makes sense in motion — as a
       static line it repeats the eyebrow underneath it — so it goes. */
    if (!window.gsap || reduced()) {
      if (beat && beat.parentNode) beat.parentNode.removeChild(beat);
      return;
    }

    const g = window.gsap;
    /* Small offsets and a slight scale, because the movement is meant to be
       felt rather than watched — the previous 26px rise and 0.94 scale read as
       a slide. Everything moves less and takes longer. */
    g.set([name, media, tag], { opacity: 0 });
    g.set(name, { y: 14, scale: 0.975 });
    g.set(media, { y: 40 });
    g.set(stats, { opacity: 0, y: 14 });

    /* Absolute positions, not relative offsets. Written as '-=0.3' from each
       other these drift: every duration change moves everything after it, and
       the sequence had once quietly grown to 3.3s with the confetti firing a
       second late. The numbers on the right ARE the storyboard:

         0.0   the line arrives, slowly
         0.8   it is fully there, and it holds
         2.2   it begins to leave — a long fade, not a cut
         2.6   the name rises through it, so for half a second both are
               present at partial opacity. That crossfade is what makes the
               handover read as one thought rather than two slides.
         3.1   the coach
         3.5   confetti, as the coach settles
         3.7   the tagline, then the specs

       BEAT is subtracted for every result after the first, so a repeat starts
       on the name rather than waiting out a silence where the line used to be. */
    const BEAT = 2.6;
    const tl = g.timeline();
    const at = (t) => Math.max(0, first ? t : t - BEAT);

    if (first) {
      beatPlayed = true;
      g.set(beat, { opacity: 0, y: 10 });
      tl.to(beat, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, 0)
        /* power1.inOut, not power2.in: an eased-in fade accelerates away and
           reads as a cut at the end. This leaves evenly. */
        .to(beat, { opacity: 0, y: -12, duration: 0.9, ease: 'power1.inOut',
          onComplete: () => { if (beat.parentNode) beat.parentNode.removeChild(beat); } }, 2.2);
    } else if (beat && beat.parentNode) {
      beat.parentNode.removeChild(beat);
    }

    tl.to(name,  { opacity: 1, y: 0, scale: 1, duration: 1.1, ease: 'power2.out' }, at(2.6))
      .to(media, { opacity: 1, y: 0, duration: 1.0, ease: 'power2.out' }, at(3.1))
      /* fired as the coach settles, from just behind it */
      .add(() => {
        const box = reveal.getBoundingClientRect();
        const m = media.getBoundingClientRect();
        confettiBurst(reveal, {
          x: m.left - box.left + m.width / 2,
          y: m.top - box.top + m.height * 0.62,
        });
      }, at(3.5))
      .to(tag,   { opacity: 1, duration: 0.7, ease: 'power2.out' }, at(3.7))
      .to(stats, { opacity: 1, y: 0, duration: 0.6, stagger: 0.09, ease: 'power2.out' }, at(3.9));
  }

  /* ---------- Screen swap + the one authored motion moment ----------
     The incoming screen is rendered FIRST and the outgoing one is animated as
     a clone on top of it. So with prefers-reduced-motion, or if the GSAP CDN
     never loads, this degrades to an instant swap and nothing is lost.

     `choreo` says the incoming screen brings its own entrance — the result
     does — so the generic fade-up is skipped rather than fighting it. */
  function paint(html, announce, choreo) {
    const stage = $('#qz-stage');
    const old = stage.firstElementChild;
    const canAnimate = window.gsap && !reduced() && old;
    /* A burst still in flight belongs to the screen being replaced. */
    stopConfetti();

    let ghost = null;
    if (canAnimate) {
      ghost = old.cloneNode(true);
      ghost.classList.add('qz-ghost');
      ghost.setAttribute('aria-hidden', 'true');
      stage.appendChild(ghost);
    }
    stage.innerHTML = '';
    stage.insertAdjacentHTML('afterbegin', html);
    if (ghost) stage.appendChild(ghost);

    if (canAnimate) {
      window.gsap.to(ghost, {
        opacity: 0, y: -12, duration: 0.42, ease: 'power2.out',
        onComplete: () => { if (ghost.parentNode) ghost.parentNode.removeChild(ghost); },
      });
      if (!choreo) {
        window.gsap.from(stage.firstElementChild, {
          opacity: 0, y: 12, duration: 0.42, ease: 'power2.out',
        });
      }
    }

    wireScreen();
    updateProgress();

    const h = $('#qz-ask');
    if (h) h.focus({ preventScroll: true });
    if (announce) $('#qz-say').textContent = announce;

    /* The page height changes by thousands of pixels between a question and
       the result. Every ScrollTrigger caches the layout it was created
       against, so without this the footer's reveal never fires and it stays
       invisible for good — the bug compare.js documents at its own refresh. */
    if (window.ScrollTrigger) requestAnimationFrame(() => window.ScrollTrigger.refresh());
    if (window.__jaycoLenis) window.__jaycoLenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  }

  function updateProgress() {
    const bar = $('#qz-progress');
    if (!bar) return;
    /* The rail belongs to the questions: null is the moment before the first
       paint, 'intro' is before the quiz has started, 'result' is after it. */
    const isQ = !!state.screen && state.screen !== 'intro' && state.screen !== 'result';
    bar.hidden = !isQ;
    if (!isQ) return;

    const a = answers();
    const n = state.trail.length;
    const t = total(a, state.trail);
    /* Questions completed, not questions shown — so the rail is honestly empty
       on the first screen. A 2% floor keeps a mark visible there rather than
       rendering what looks like a broken control. */
    const pct = t ? Math.max(2, Math.round(((n - 1) / t) * 100)) : 2;
    /* clip-path, not width — see .qz-rail-fill in quiz.css. */
    $('#qz-rail-fill').style.clipPath = 'inset(0 ' + (100 - pct) + '% 0 0)';
    $('#qz-rail').setAttribute('aria-valuenow', String(pct));
    $('#qz-count').textContent = t ? 'Question ' + n + ' of ' + t : 'Question ' + n;
  }

  function go(id, announce) {
    state.screen = id;
    if (id === 'intro') paint(renderIntro(), null);
    else if (id === 'result') {
      paint(renderResult(), 'Your match is ready.', true);
      showSave(true);
      revealResult();
    }
    else {
      showSave(false);
      const q = questionById(id);
      const t = total(answers(), state.trail);
      paint(renderQuestion(id),
        'Question ' + state.trail.length + (t ? ' of ' + t : '') + '. ' + q.question);
    }
    syncUrl();
  }

  function showSave(on) {
    const el = $('#qz-save');
    if (el) { el.hidden = !on; if (on) fillSave(); }
    fillSimilar(on);
  }

  /* The section quiz.html declares — or one built here if it is not there.
     Every stylesheet and script on this site is cache-busted with ?v=, but the
     HTML that references them is not, and cannot be: it is the entry point.
     So a browser holding an older quiz.html gets the new JS and the new CSS
     against markup that has no #qz-similar in it, and this section silently
     never appears. Building it on demand makes the page whole either way.

     The email form CANNOT be treated this way — Netlify's build-time parser
     only sees literal markup — which is why that one stays declared and this
     one may be created. */
  function similarHost() {
    let el = $('#qz-similar');
    if (el) return el;
    const save = $('#qz-save');
    if (!save || !save.parentNode) return null;
    el = document.createElement('section');
    el.className = 'qz-section qz-similar';
    el.id = 'qz-similar';
    el.hidden = true;
    save.parentNode.insertBefore(el, save.nextSibling);
    return el;
  }

  /* Two cards, below the email ask. alternates() returns up to three — one
     step down, one step up, and sometimes a different shape — and this takes
     the first two, which are the two closest to the match. Emptied rather than
     just hidden on the way back to a question, so a stale pair cannot flash
     when the next result paints. */
  function fillSimilar(on) {
    const el = similarHost();
    if (!el) return;
    const r = state.result;
    const alts = (on && r && !r.dead) ? r.alternates.slice(0, 2) : [];
    if (!alts.length) { el.hidden = true; el.innerHTML = ''; return; }
    /* A flipped result can come back with only one alternate. One card in a
       two-column grid sits off to the left under a centred heading, which
       reads as a missing card rather than a single option. */
    el.innerHTML =
      '<h2 class="qz-h2 qz-similar-head">Similar Options</h2>' +
      '<div class="qz-sim-grid" data-count="' + alts.length + '">' +
        alts.map(altCard).join('') +
      '</div>';
    el.hidden = false;
  }

  function advance() {
    const a = answers();
    const id = nextId(a, state.trail);
    if (id === 'result') { go('result'); return; }
    state.trail.push(id);
    go(id);
  }

  function choose(token) {
    const t = TOKENS[token];
    if (!t) return;
    const qid = state.screen;
    /* Re-answering replaces, never appends, and everything chosen after this
       point is dropped — those answers belong to a path that no longer exists. */
    const cut = state.picks.findIndex((p) => p.qid === qid && p.group === t.group);
    if (cut >= 0) state.picks = state.picks.slice(0, cut);
    state.picks = state.picks.filter((p) => state.trail.indexOf(p.qid) >= 0 || p.qid === qid);
    state.picks.push({ qid: qid, group: t.group, token: token });

    const q = questionById(qid);
    if (q && q.groups) {
      /* One screen, two groups: repaint in place until both are answered. */
      const done = q.groups.every((g) =>
        state.picks.some((p) => p.qid === qid && p.group === g.key));
      if (!done) { paint(renderQuestion(qid), null); return; }
    }
    advance();
  }

  function back() {
    if (state.trail.length < 2) { state.trail = []; go('intro'); return; }
    state.trail.pop();
    const id = state.trail[state.trail.length - 1];
    /* Answers are NOT discarded — coming back to a question you already
       answered should show what you picked, and returning to a branch you had
       left should restore it. activePath filtering in choose() handles the
       stale ones. */
    go(id);
  }

  /* ---------- Keyboard ----------
     Radio semantics on purpose. Arrows move focus WITHOUT selecting, so a
     keyboard user can read every option before committing — which "click
     advances" would otherwise make impossible. */
  function onKey(e) {
    const row = e.target.closest && e.target.closest('.qz-choice');
    if (!row) return;
    const group = row.closest('.qz-choices');
    const rows = Array.prototype.slice.call(group.querySelectorAll('.qz-choice'));
    const i = rows.indexOf(row);
    let j = -1;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') j = (i + 1) % rows.length;
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') j = (i - 1 + rows.length) % rows.length;
    else if (e.key === 'Home') j = 0;
    else if (e.key === 'End') j = rows.length - 1;
    if (j >= 0) {
      e.preventDefault();
      rows.forEach((r) => r.setAttribute('tabindex', '-1'));
      rows[j].setAttribute('tabindex', '0');
      rows[j].focus();
    }
  }

  /* Everything here is scoped to the screen that just went in, never to the
     stage. For 0.42s after a swap the stage also holds a CLONE of the screen
     that is leaving — same classes, same ids — so a stage-wide query binds
     handlers to controls that are on their way out, and asks the new question
     about the old question's answers. That is what put a swap layer on the
     tow-vehicle screen, whose answers have no photographs at all. */
  function wireScreen() {
    const root = $('#qz-stage').firstElementChild;
    if (!root) return;
    root.querySelectorAll('.qz-choice').forEach((b) => {
      b.addEventListener('click', () => choose(b.dataset.token));
    });
    root.querySelectorAll('.qz-zoom-btn').forEach((b) => {
      b.addEventListener('click', () => zoomModal(b).open(b));
    });
    const s = root.querySelector('#qz-start'); if (s) s.addEventListener('click', start);
    const b = root.querySelector('#qz-back'); if (b) b.addEventListener('click', back);
    const rt = root.querySelector('#qz-retake'); if (rt) rt.addEventListener('click', restart);
    const fl = root.querySelector('#qz-flip'); if (fl) fl.addEventListener('click', () => {
      state.picks.push({ qid: 'flip', group: null, token: 'flip' });
      go('result');
    });
  }

  /* Retaking returns to the intro, not to question one: it is the same screen
     the first visit began on, and the button there is the moment someone
     decides to answer rather than a screen they arrive mid-thought. */
  function restart() {
    state.picks = []; state.trail = []; state.result = null;
    if (window.history && history.replaceState) history.replaceState({}, '', location.pathname);
    go('intro');
  }

  /* The intro's button, and the only way into question one. */
  function start() {
    state.trail = [];
    advance();
  }

  /* ---------- Email the results ----------
     link() still runs: the address is submitted as a hidden field so whoever
     reads the submission can reopen the exact match. It is simply no longer
     shown on the page — email is the only way out of here now. */
  function fillSave() {
    const r = state.result;
    if (!r || r.dead) { $('#qz-save').hidden = true; return; }
    $('#qz-f-link').value = link();
    $('#qz-f-match').value = r.primary.name + ' (' + r.primary.slug + ')';
    $('#qz-f-alts').value = r.alternates.map((x) => x.row.name).join(', ');
    $('#qz-f-answers').value = state.picks.map((p) => p.token).join('.');
  }

  function wireSave() {
    const form = $('#qz-email-form');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const note = $('#qz-form-note');

      /* Netlify's form handler only exists on the deployed site. Saying so
         beats a spinner that never resolves. */
      if (location.protocol === 'file:') {
        note.textContent = 'Sending needs the published site.';
        return;
      }

      const data = new URLSearchParams(new FormData(form));
      fetch(location.pathname, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: data.toString(),
      }).then((res) => {
        if (!res.ok) throw new Error(res.status);
        /* WORTH KNOWING: this says the results are on their way, and the POST
           only files the submission with Netlify — nothing in this repo sends
           mail. Wiring an actual send (a Netlify function, or a form
           notification with the match in the body) is what makes this sentence
           true. It is written as an outcome because that is the flow the page
           is designed around; it should not ship to real traffic until the
           send exists. */
        form.hidden = true;
        note.textContent = 'On its way — check your inbox for your match.';
      }).catch(() => {
        note.textContent = 'That did not send. Try again in a moment.';
      });
    });
  }

  /* ---------- Boot ---------- */
  function boot() {
    wireSave();
    const d = decode();
    if (d && d.stale) {
      /* A link from an earlier version of the quiz. The questions have moved
         under it, so resolving its tokens anyway would quietly answer
         different questions with them. Fail out loud instead — the notice is
         set before the first paint and the intro prints it above its button. */
      notice = 'That link was made with an earlier version of the quiz and the questions ' +
               'have changed since. It only takes a minute to retake.';
      go('intro');
      return;
    }
    if (d && d.picks && d.picks.length) {
      state.picks = d.picks;
      state.trail = d.trail;
      /* A link can be valid but unfinished — someone copies the address bar
         halfway through, or trims the tail by accident. Those tokens are real
         answers, so pick the quiz up where they stop rather than scoring a
         result out of two answers and presenting it as a match. */
      const id = nextId(answers(), state.trail);
      if (id === 'result') { go('result'); return; }
      state.trail.push(id);
      go(id);
      return;
    }
    go('intro');
  }

  document.addEventListener('keydown', onKey);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
}());
