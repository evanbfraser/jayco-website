/* ===================================================
   Jayco — Tow capability calculator
   ---------------------------------------------------
   Computes from window.JAYCO_BUILD and window.JAYCO.
   No data file of its own: the weights are already on
   the site, and a second copy would drift.

   THE ONE DECISION THAT MAKES THIS HONEST
   A tow rating is compared against each trailer's GROSS
   VEHICLE WEIGHT RATING — the most it may weigh loaded —
   never against its dry weight.

   The gap is not academic. Of 115 towable floorplans
   with published weights:
       5,000 lb rating -> 25 fit by GVWR, 39 by dry
       7,500 lb rating -> 51 fit by GVWR, 73 by dry
      10,000 lb rating -> 78 fit by GVWR, 92 by dry
   Matching on the dry figure at 7,500 lbs would hand
   somebody twenty-two trailers that go over their limit
   the first time they fill the fresh-water tank. Dry
   weight is shown on every card, because the difference
   is the useful part — but it is never the filter.

   WHAT IS EXCLUDED, AND SAID OUT LOUD
   47 motorized floorplans: driven, not towed, so a tow
   rating tells you nothing about them.
   19 towable floorplans with no published GVWR: left
   out rather than estimated. The count says so.
   =================================================== */

(function () {
  'use strict';

  const JAYCO = window.JAYCO;
  const BUILD = window.JAYCO_BUILD || {};
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.prototype.slice.call((c || document).querySelectorAll(s));
  if (!JAYCO || !JAYCO.models) return;

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const num = (s) => (s == null || s === '' ? null : parseInt(String(s).replace(/,/g, ''), 10));
  const lbs = (n) => n.toLocaleString('en-US') + ' lbs';

  const MIN = 1000, MAX = 25000, DEFAULT = 7500;

  /* ---------- Index ----------
     Towables only, and only those Jayco has published a GVWR for. Both
     exclusions are counted so the page can state them rather than quietly
     shrink. */
  const ROWS = [];
  let towableTotal = 0, noRating = 0, motorized = 0;

  JAYCO.categories.filter((c) => c.type === 'motorized').forEach((cat) => {
    Object.keys(BUILD).forEach((slug) => {
      const m = JAYCO.models[slug];
      if (m && m.category === cat.id) motorized += (BUILD[slug].floorplans || []).length;
    });
  });

  JAYCO.categories.filter((c) => c.type === 'towable').forEach((cat) => {
    Object.keys(BUILD).forEach((slug) => {
      const m = JAYCO.models[slug];
      if (!m || m.category !== cat.id) return;
      (BUILD[slug].floorplans || []).forEach((f) => {
        towableTotal++;
        const w = (f.specs || {}).Weights || {};
        const gvwr = num(w['Gross Vehicle Weight Rating (lbs)']);
        if (!gvwr) { noRating++; return; }
        ROWS.push({
          slug: slug, model: m.name, plan: f.name,
          catId: cat.id, catName: cat.name,
          gvwr: gvwr,
          dry: num(f.weight) || num(w['Unloaded Vehicle Weight (lbs)']),
          hitch: num(w['Dry Hitch Weight (lbs)']),
          cargo: num(w['Cargo Carrying Capacity (lbs)']),
          length: f.length || null,
          sleeps: f.sleeps || null,
          /* The 400x248 derivative, not the 1.4MB print PNG in m.img — the same
             path brochures.js and the floorplan catalog use, and all 27 keys
             are covered. The full-size render is kept as the fallback. */
          art: '../assets/models/web/' + slug + '.webp',
          artFallback: m.img,
          /* Jayco's own drawing for this exact plan, straight off the build
             record. 1400x716 line art on white. */
          draw: f.img || null,
        });
      });
    });
  });
  if (!ROWS.length) return;

  const LIGHTEST = Math.min.apply(null, ROWS.map((r) => r.gvwr));
  const HEAVIEST = Math.max.apply(null, ROWS.map((r) => r.gvwr));

  /* ---------- Reach ----------
     One record per towable class: where its floorplans start and stop on the
     scale, and how many there are. Computed once, because a trailer's GVWR
     does not change when the slider moves — only how many of them are under
     it does.

     The four spans barely overlap, which is why the chart is worth drawing:
     travel trailers 3,500-11,995, destination 12,000-13,600, fifth wheels
     9,500-19,200, toy haulers 11,700-21,000. One look says which kinds of
     trailer are open, which are half open and which are not on the table. */
  const SPANS = JAYCO.categories
    .filter((c) => c.type === 'towable')
    .map((c) => {
      const g = ROWS.filter((r) => r.catId === c.id).map((r) => r.gvwr);
      return g.length ? { id: c.id, name: c.name, min: Math.min.apply(null, g),
                          max: Math.max.apply(null, g), total: g.length } : null;
    })
    .filter(Boolean);

  /* The scale the bars are drawn on, rounded out to whole tons so the ends are
     readable numbers rather than 3,500 and 21,000 exactly. */
  const SCALE_MIN = Math.floor(LIGHTEST / 1000) * 1000;
  const SCALE_MAX = Math.ceil(HEAVIEST / 1000) * 1000;
  const pos = (n) => Math.max(0, Math.min(100,
    ((n - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100));
  /* Fifth wheels and toy haulers need a bed and a fifth-wheel hitch, which a
     tow rating on its own does not give you. Flagged per group rather than
     buried in the legal note. */
  const NEEDS_BED = { 'fifth-wheels': 1, 'toy-haulers': 1 };

  /* View Model Details goes to the model's own page where this site carries
     one, and to the product type otherwise. Ported from top-selling.js's
     learnHref(), whose note carries the reason it does NOT use app.js's
     exploreHref: that tests JAYCO_MODEL_DETAIL, which only model.html loads, so
     here it is empty and every model would fall through to its category.
     videos.js already paid for that bug once. */
  function modelHref(slug) {
    const d = window.JAYCO_MODEL_DETAIL;
    const has = (d && d[slug]) ? !d[slug].stub
      : (window.JAYCO_MODEL_PAGES || []).indexOf(slug) >= 0;
    if (has) return 'model.html?model=' + encodeURIComponent(slug);
    return 'type.html?type=' + encodeURIComponent(JAYCO.models[slug].category);
  }

  let capacity = DEFAULT;

  const fits = (r) => r.gvwr <= capacity;
  /* Within 10% of the limit is not "no", but it is not room either — once you
     load a trailer toward its rating there is nothing left for the margin
     everyone recommends keeping. */
  const tight = (r) => r.gvwr > capacity * 0.9;

  /* ---------- Render ---------- */
  function resultCard(r) {
    const head = capacity - r.gvwr;
    return `<li class="tc-card${tight(r) ? ' is-tight' : ''}">
      <div class="tc-card-media">
        <span class="tc-card-shot tc-card-shot--model">
          <img class="tc-card-img" src="${esc(r.art)}" data-fallback="${esc(r.artFallback || '')}"
               alt="" loading="lazy" decoding="async" width="400" height="248" />
        </span>
        ${r.draw ? `<span class="tc-card-shot tc-card-shot--plan">
          <img class="tc-card-img" src="${esc(r.draw)}"
               alt="" loading="lazy" decoding="async" width="1400" height="716" />
        </span>` : ''}
      </div>
      <div class="tc-card-head">
        <span class="tc-card-model">${esc(r.model)}</span>
        <h4 class="tc-card-plan">${esc(r.plan)}</h4>
      </div>
      <dl class="tc-card-specs">
        <div class="tc-spec tc-spec--lead">
          <dt>Loaded (GVWR)</dt><dd>${esc(lbs(r.gvwr))}</dd>
        </div>
        <div class="tc-spec"><dt>Dry</dt><dd>${r.dry ? esc(lbs(r.dry)) : '—'}</dd></div>
        <div class="tc-spec"><dt>Hitch</dt><dd>${r.hitch ? esc(lbs(r.hitch)) : '—'}</dd></div>
        <div class="tc-spec"><dt>Headroom</dt><dd>${esc(lbs(head))}</dd></div>
      </dl>
      ${tight(r) ? '<p class="tc-tight-note">Within 10% of your limit — little margin once loaded.</p>' : ''}
      <div class="tc-card-actions">
        <a class="btn-secondary-light" href="${esc(modelHref(r.slug))}">View Model Details</a>
        <a class="btn-primary" href="build-price.html?model=${esc(r.slug)}&amp;step=floorplan">Build This Floorplan</a>
      </div>
    </li>`;
  }

  function render() {
    const on = ROWS.filter(fits);
    const box = $('#tc-results');

    /* Grouped by category, in the lineup's own order, because "what can I tow"
       splits first into what kind of hitch you need. */
    const groups = JAYCO.categories
      .filter((c) => c.type === 'towable')
      /* Lightest first, not heaviest. Sorted the other way the cards nearest
         the limit lead every group, so a page of amber "little margin" flags is
         the first thing you see — and the trailer with the most headroom is the
         more useful answer to "what can I tow" anyway. */
      .map((c) => ({ cat: c, rows: on.filter((r) => r.catId === c.id).sort((a, b) => a.gvwr - b.gvwr) }))
      .filter((g) => g.rows.length);

    box.innerHTML = groups.map((g) => `
      <section class="tc-group" data-cat="${esc(g.cat.id)}" aria-labelledby="tc-g-${esc(g.cat.id)}">
        <div class="tc-group-head">
          <h3 class="tc-group-name" id="tc-g-${esc(g.cat.id)}">${esc(g.cat.name)}</h3>
          <span class="tc-group-n">${g.rows.length}</span>
          ${NEEDS_BED[g.cat.id]
            ? '<span class="tc-group-note">Needs a pickup bed and a fifth-wheel hitch</span>' : ''}
        </div>
        <ul class="tc-cards" role="list">${g.rows.map(resultCard).join('')}</ul>
      </section>`).join('');

    /* Built from the SAME `groups` the cards came from, in the same pass, so
       the two cannot disagree about which classes exist at this capacity. A
       class with nothing under the limit has no group and gets no link. */
    const jump = $('#tc-jump');
    jump.innerHTML = groups.map((g) => `
      <a class="tc-jump-link" href="#tc-g-${esc(g.cat.id)}" data-jump="${esc(g.cat.id)}">
        ${esc(g.cat.name)} <span class="tc-jump-n">${g.rows.length}</span>
      </a>`).join('');
    /* Shown whenever anything fits, INCLUDING when only one class does. That is
       the default view — at 7,500 lbs, the figure this page opens on, travel
       trailers are the only class under the limit — so hiding a lone pill would
       mean the nav is missing exactly when most people first see the page. With
       one class it reads as a label for what follows, which is still true. */
    jump.hidden = !groups.length;

    $('#tc-count').textContent = on.length
      ? on.length + (on.length === 1 ? ' floorplan' : ' floorplans') + ' you can tow'
      : 'Nothing fits that yet';
    /* Says what was measured and what was left out, every time — a count with
       no denominator is the part of a tool like this people misread. */
    $('#tc-sub').textContent = on.length
      ? 'Measured against ' + lbs(capacity) + ' loaded, not dry, across ' + ROWS.length +
        ' Jayco towables with published weights. ' + noRating +
        ' more have no published rating yet; ' + motorized +
        ' motorhome floorplans are driven rather than towed and are not counted.'
      : 'The lightest Jayco towable is ' + lbs(LIGHTEST) + ' loaded. ' + motorized +
        ' motorhome floorplans are driven rather than towed.';
    $('#tc-empty').hidden = on.length > 0;

    /* Carried into the form so a submission says what was asked and what came
       back, rather than an email address on its own. */
    $('#tc-form-capacity').value = String(capacity);
    $('#tc-form-matches').value = on.length + ' of ' + ROWS.length + ' towables at ' + lbs(capacity);

    renderReach(on);
    wireCardImages(box);
    syncURL();
    if (window.ScrollTrigger) requestAnimationFrame(() => window.ScrollTrigger.refresh());
  }

  /* Redrawn on every change, because the fill on each bar and the count beside
     it are the only parts that move — the spans themselves are fixed. */
  function renderReach(on) {
    const chart = $('#tc-reach-chart');
    if (!chart) return;

    const rows = SPANS.map((sp) => {
      const fit = on.filter((r) => r.catId === sp.id).length;
      const left = pos(sp.min), right = pos(sp.max);
      /* The filled part runs from the class's own start to whichever comes
         first: the reader's capacity or the end of the class. */
      const capStop = Math.max(left, Math.min(right, pos(capacity)));
      const wide = Math.max(right - left, 0.6);   // a one-plan class still needs a bar
      return `
      <div class="tc-reach-row${fit ? '' : ' is-out'}">
        <div class="tc-reach-key">
          <span class="tc-reach-name">${esc(sp.name)}</span>
          <span class="tc-reach-n">${fit} of ${sp.total}</span>
        </div>
        <div class="tc-reach-track">
          <span class="tc-reach-span" style="left:${left.toFixed(2)}%;width:${wide.toFixed(2)}%">
            <span class="tc-reach-fill" style="width:${(((capStop - left) / wide) * 100).toFixed(2)}%"></span>
          </span>
          <span class="tc-reach-mark" style="left:${pos(capacity).toFixed(2)}%"></span>
        </div>
      </div>`;
    }).join('');

    /* The marker is one line across the whole chart rather than a tick per row:
       the rows share a scale, and the point of the picture is seeing a single
       limit cut through four classes at once. */
    /* The capacity is drawn INSIDE each track rather than as one line down the
       whole chart. A continuous line read better on a wide screen but it ran
       straight through the class names on a narrow one, and a label with a rule
       through it is worse than four aligned segments. They line up anyway — the
       four tracks share one scale — so the limit still reads as one cut. */
    chart.innerHTML =
      `<div class="tc-reach-rows">
         ${rows}
         <div class="tc-reach-marker" style="left:${pos(capacity).toFixed(2)}%">
           <span class="tc-reach-marker-label">${esc(lbs(capacity))}</span>
         </div>
       </div>
       <div class="tc-reach-axis">
         <span>${esc(lbs(SCALE_MIN))}</span><span>${esc(lbs(SCALE_MAX))}</span>
       </div>`;

    /* The written version of the same picture, for a screen reader and for the
       label above it. */
    chart.setAttribute('aria-label', SPANS.map((sp) => {
      const fit = on.filter((r) => r.catId === sp.id).length;
      return sp.name + ': ' + fit + ' of ' + sp.total;
    }).join('. '));

    $('#tc-reach-cap').textContent = lbs(capacity);

    /* What another 1,000 lbs would open up. Real, computed, and the single most
       useful thing this page can tell somebody still choosing a tow vehicle —
       at 7,500 lbs it is another 13 floorplans. Said only when it is true. */
    const more = ROWS.filter((r) => r.gvwr <= capacity + 1000).length - on.length;
    const pct = Math.round((on.length / ROWS.length) * 100);
    $('#tc-reach-sub').textContent = on.length
      ? 'That is ' + pct + '% of the ' + ROWS.length + ' Jayco towables with a published rating' +
        (more ? '. Another 1,000 lbs would add ' + more +
          (more === 1 ? ' more floorplan.' : ' more floorplans.') : '.')
      : 'The lightest Jayco towable is ' + lbs(LIGHTEST) + ' loaded.';
  }

  /* A picture that never arrives leaves a card with a hole in it. The model
     render falls back to the full-size print PNG named on the element; the
     floorplan drawing has nothing to fall back to, so its box is removed and
     the card closes the gap. brochures.js and blog-ui.js both draw the same
     line. Rebound on every render because the grid is rewritten each time. */
  function wireCardImages(box) {
    $$('.tc-card-img', box).forEach((img) => {
      img.addEventListener('error', function () {
        const alt = this.dataset.fallback;
        if (alt) { this.dataset.fallback = ''; this.src = alt; return; }
        const shot = this.closest('.tc-card-shot');
        if (shot) shot.remove();
      });
    });
  }

  /* ---------- Parallax ----------
     The hero plate, scrubbed linearly across its pass — ease 'none' and scrub
     true, so it tracks the scrollbar rather than performing, at the small
     magnitude DESIGN.md asks for. The travel is read from the CSS so the JS can
     never drift further than the media overhangs, which is what stops a bare
     edge appearing at either end.

     The hero starts on screen, so the trigger runs from the top of the page
     rather than 'top bottom' — measured that way it would already be
     part-drifted before the reader had touched anything. buyers-guide.js and
     request-quote.js carry the same note.

     Under prefers-reduced-motion the stylesheet sets --tc-drift to 0 and this
     returns before binding. */
  function initParallax() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    const hero = $('.tc-hero');
    const media = $('.tc-hero-media');
    const px = parseFloat(getComputedStyle(document.querySelector('.towing-page'))
      .getPropertyValue('--tc-drift')) || 0;
    if (!hero || !media || !px) return;
    gsap.fromTo(media, { yPercent: -px / 2 }, {
      yPercent: px / 2,
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
    });
  }

  /* ---------- Jumping to a class ----------
     Ported from floorplans.js's scrollToSection(), whose note carries the
     reason it is not a bare hash jump: that desyncs Lenis's internal
     targetScroll and the next wheel tick snaps the page back, so the offset is
     computed and handed to lenis.scrollTo instead. The header is fixed, so the
     group would otherwise land underneath it.

     Delegated to the nav, which is rewritten on every render. */
  function goToGroup(catId) {
    const sec = $('.tc-group[data-cat="' + catId + '"]');
    if (!sec) return;
    const header = document.getElementById('site-header');
    const y = sec.getBoundingClientRect().top + window.pageYOffset -
      ((header ? header.offsetHeight : 0) + 16);
    const lenis = window.__jaycoLenis;
    if (lenis && lenis.scrollTo) lenis.scrollTo(y, { immediate: false });
    else window.scrollTo({ top: y, behavior: 'smooth' });
  }

  /* ---------- Input ---------- */
  const clamp = (n) => Math.min(MAX, Math.max(MIN, n));

  function setCapacity(n, from) {
    capacity = clamp(Math.round(n / 50) * 50);
    if (from !== 'field') $('#tc-lbs').value = capacity;
    if (from !== 'range') $('#tc-range').value = capacity;
    render();
  }

  /* replaceState, never pushState: nothing else in this repo creates history
     entries, and a slider that added one per drag would bury the back button. */
  function syncURL() {
    if (!window.history || !window.history.replaceState) return;
    window.history.replaceState({}, '', 'towing.html?lbs=' + capacity);
  }

  function readURL() {
    const v = num(new URLSearchParams(window.location.search).get('lbs'));
    if (v) capacity = clamp(v);
    $('#tc-lbs').value = capacity;
    $('#tc-range').value = capacity;
  }

  /* ---------- Share ---------- */
  const canPost = location.protocol !== 'file:' &&
    !/^(localhost|127\.|0\.0\.0\.0)/.test(location.hostname);

  /* ---------- The PDF ----------
     Drawn here, at click time, by jsPDF. Loaded from the CDN ONLY when somebody
     asks for it: the library is 364KB, and paying that on every page load for a
     button most readers never press is not a trade worth making. The button
     says so while it waits.

     Deliberately NOT the browser's print dialog wearing a PDF label. That was
     the old behaviour and it produced whatever the page happened to look like;
     this is a sheet laid out for the job — the capacity at the top, then every
     matching floorplan grouped by class with the three weights that matter, and
     the caveat at the foot so the sheet cannot be read without it. */
  let pdfLib = null;
  function loadPdfLib() {
    if (pdfLib) return pdfLib;
    pdfLib = new Promise((resolve, reject) => {
      const el = document.createElement('script');
      el.src = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js';
      el.onload = () => (window.jspdf && window.jspdf.jsPDF)
        ? resolve(window.jspdf.jsPDF) : reject(new Error('no jsPDF'));
      el.onerror = () => reject(new Error('blocked'));
      document.head.appendChild(el);
    });
    /* A failed load must not poison the button for the rest of the session. */
    pdfLib.catch(() => { pdfLib = null; });
    return pdfLib;
  }

  function drawPdf(JsPDF) {
    const doc = new JsPDF({ unit: 'mm', format: 'a4' });
    const L = 16, R = 194, BOTTOM = 280;
    let y = 22;

    const page = () => { doc.addPage(); y = 22; };
    const room = (n) => { if (y + n > BOTTOM) page(); };

    doc.setFont('helvetica', 'bold'); doc.setFontSize(20);
    doc.text('What you can tow', L, y); y += 8;

    doc.setFont('helvetica', 'normal'); doc.setFontSize(10.5);
    doc.setTextColor(90);
    const on = ROWS.filter(fits);
    doc.text('Towing capacity: ' + lbs(capacity), L, y); y += 5;
    doc.text(on.length + (on.length === 1 ? ' floorplan' : ' floorplans')
      + ' out of ' + ROWS.length + ' Jayco towables with a published rating.', L, y); y += 5;
    doc.text('Matched on gross vehicle weight rating — what a trailer may weigh LOADED,'
      + ' not its dry weight.', L, y); y += 5;
    doc.text('Generated ' + new Date().toLocaleDateString('en-US',
      { year: 'numeric', month: 'long', day: 'numeric' }) + ' · jayco.com', L, y); y += 9;

    doc.setDrawColor(200); doc.line(L, y, R, y); y += 8;

    const cols = [L, 96, 126, 156];
    SPANS.forEach((sp) => {
      const rows = on.filter((r) => r.catId === sp.id).sort((a, b) => a.gvwr - b.gvwr);
      if (!rows.length) return;
      room(24);
      doc.setTextColor(0); doc.setFont('helvetica', 'bold'); doc.setFontSize(12);
      doc.text(sp.name + '  (' + rows.length + ')', L, y); y += 6;

      doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(120);
      doc.text('MODEL & FLOORPLAN', cols[0], y);
      doc.text('LOADED', cols[1], y); doc.text('DRY', cols[2], y); doc.text('HITCH', cols[3], y);
      y += 4;
      doc.setDrawColor(225); doc.line(L, y, R, y); y += 4.5;

      doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.setTextColor(40);
      rows.forEach((r) => {
        room(7);
        doc.text(doc.splitTextToSize(r.model + ' ' + r.plan, 76)[0], cols[0], y);
        doc.text(lbs(r.gvwr), cols[1], y);
        doc.text(r.dry ? lbs(r.dry) : '—', cols[2], y);
        doc.text(r.hitch ? lbs(r.hitch) : '—', cols[3], y);
        y += 5.4;
      });
      y += 5;
    });

    /* The caveat travels with the sheet. A printed list of trailers somebody
       carries onto a lot, with no note saying what it does not account for, is
       the one version of this page that could actually mislead. */
    room(34);
    doc.setDrawColor(200); doc.line(L, y, R, y); y += 6;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(0);
    doc.text('BEFORE YOU TOW ANYTHING', L, y); y += 5;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(90);
    doc.splitTextToSize(
      'This is a shortlist, not a clearance to tow. It does not account for your tongue or pin '
      + 'weight limit, gross combined weight rating, payload left after passengers and cargo, '
      + 'hitch class, brake controller, axle ratio, altitude, or the weight of anything already '
      + 'in the truck. Any one of those can rule out a trailer listed here. Fifth wheels and toy '
      + 'haulers need a pickup with a bed and a fifth-wheel or gooseneck hitch. Weights are '
      + "Jayco's published figures and are subject to change; options add weight. Verify against "
      + "the trailer's own weight label and your vehicle's manual, and have a dealer confirm the "
      + 'match before purchase.', R - L).forEach((line) => { room(5); doc.text(line, L, y); y += 4; });

    doc.save('jayco-what-you-can-tow-' + capacity + 'lbs.pdf');
  }

  function wireTake() {
    const btn = $('#tc-pdf'), note = $('#tc-pdf-note');
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      const label = btn.textContent;
      btn.disabled = true; btn.textContent = 'Building…'; note.textContent = '';
      loadPdfLib().then((JsPDF) => {
        drawPdf(JsPDF);
        note.textContent = 'Saved — ' + ROWS.filter(fits).length + ' floorplans at ' + lbs(capacity) + '.';
      }).catch(() => {
        note.textContent = 'The PDF builder could not load. Check your connection and try again.';
      }).then(() => { btn.disabled = false; btn.textContent = label; });
    });

    $('#tc-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const form = e.target, fnote = $('#tc-form-note');
      if (!form.checkValidity()) { form.reportValidity(); return; }
      if (!canPost) {
        fnote.textContent = 'Sending needs the published site — this is a local preview.';
        return;
      }
      fetch(location.pathname, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form)).toString(),
      }).then(() => {
        form.hidden = true;
        fnote.textContent = 'On its way — the list for ' + lbs(capacity) + '.';
      }).catch(() => { fnote.textContent = 'That did not send. Try again in a moment.'; });
    });
  }

  function wire() {
    $('#tc-lbs').addEventListener('input', (e) => {
      const v = num(e.target.value);
      if (v) setCapacity(v, 'field');
    });
    $('#tc-range').addEventListener('input', (e) => setCapacity(num(e.target.value), 'range'));
    $('#tc-jump').addEventListener('click', (e) => {
      const a = e.target.closest('[data-jump]');
      if (!a) return;
      e.preventDefault();
      goToGroup(a.dataset.jump);
    });
    wireTake();
  }

  readURL();
  wire();
  render();
  document.addEventListener('jayco:animations-ready', initParallax, { once: true });
}());
