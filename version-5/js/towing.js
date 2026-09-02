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
        });
      });
    });
  });
  if (!ROWS.length) return;

  const LIGHTEST = Math.min.apply(null, ROWS.map((r) => r.gvwr));
  /* Fifth wheels and toy haulers need a bed and a fifth-wheel hitch, which a
     tow rating on its own does not give you. Flagged per group rather than
     buried in the legal note. */
  const NEEDS_BED = { 'fifth-wheels': 1, 'toy-haulers': 1 };

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
      <div class="tc-card-links">
        <a href="build-price.html?model=${esc(r.slug)}&amp;step=floorplan">Build this floorplan</a>
        <a href="floorplans.html">See the drawing</a>
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
      <section class="tc-group" aria-labelledby="tc-g-${esc(g.cat.id)}">
        <div class="tc-group-head">
          <h3 class="tc-group-name" id="tc-g-${esc(g.cat.id)}">${esc(g.cat.name)}</h3>
          <span class="tc-group-n">${g.rows.length}</span>
          ${NEEDS_BED[g.cat.id]
            ? '<span class="tc-group-note">Needs a pickup bed and a fifth-wheel hitch</span>' : ''}
        </div>
        <ul class="tc-cards" role="list">${g.rows.map(resultCard).join('')}</ul>
      </section>`).join('');

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

    syncURL();
    if (window.ScrollTrigger) requestAnimationFrame(() => window.ScrollTrigger.refresh());
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

  function wireShare() {
    $('#tc-copy').addEventListener('click', () => {
      const note = $('#tc-copy-note');
      const url = location.href;
      const done = () => { note.textContent = 'Link copied — it opens on this same list.'; };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done, () => {
          note.textContent = 'Could not copy. The link is in the address bar.';
        });
      } else {
        note.textContent = 'The link is in the address bar.';
      }
    });

    $('#tc-print').addEventListener('click', () => window.print());

    $('#tc-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const form = e.target, note = $('#tc-form-note');
      if (!form.checkValidity()) { form.reportValidity(); return; }
      if (!canPost) {
        note.textContent = 'Sending needs the published site — this is a local preview.';
        return;
      }
      fetch(location.pathname, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form)).toString(),
      }).then(() => {
        form.hidden = true;
        note.textContent = 'On its way — the list for ' + lbs(capacity) + '.';
      }).catch(() => { note.textContent = 'That did not send. Try again in a moment.'; });
    });
  }

  function wire() {
    $('#tc-lbs').addEventListener('input', (e) => {
      const v = num(e.target.value);
      if (v) setCapacity(v, 'field');
    });
    $('#tc-range').addEventListener('input', (e) => setCapacity(num(e.target.value), 'range'));
    $('#tc-go').addEventListener('click', () => {
      setCapacity(num($('#tc-lbs').value) || DEFAULT);
      $('#tc-count').focus({ preventScroll: false });
    });
    wireShare();
  }

  readURL();
  wire();
  render();
}());
