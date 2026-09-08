/* ===================================================
   Jayco — Tow vs. Drive Guide (tow-vs-drive.html)
   ---------------------------------------------------
   The comparison table is COMPUTED, not typed. Every
   number in it is measured at load from the same two
   files the rest of the site reads — models-data.js for
   models and starting prices, build-data.js for the 181
   floorplans and their published lengths and weights.

   That is the rule towing.js already sets on this site:
   "no data file of its own: the weights are already on
   the site, and a second copy would drift." A guide
   whose figures disagree with the floorplan catalog is
   worse than no guide, and typing them here is how that
   happens the first time Jayco publishes a new model.

   WHAT IS NOT COMPUTED. The three rows at the foot of
   the table — what you drive, what happens at camp,
   what there is to maintain — are structural facts
   about the two shapes, not measurements, so they are
   written in the markup. They state nothing a
   photograph could not show: a trailer needs something
   to pull it, a motorhome does not, and unhitching
   leaves you a vehicle where breaking camp does not.

   NO LEGAL CLAIMS. Licensing is set per state by weight
   and length and this build has no data for it, so the
   FAQ says to check rather than answering for fifty
   states. PRODUCT.md's rule about absences.
   =================================================== */

(function () {
  'use strict';

  const JAYCO = window.JAYCO;
  const BUILD = window.JAYCO_BUILD || {};
  const table = document.getElementById('tvd-figures');
  if (!JAYCO || !table) return;

  const $ = (s, c) => (c || document).querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const num = (s) => (s == null || s === '' ? null : parseInt(String(s).replace(/,/g, ''), 10));
  const usd = (n) => '$' + n.toLocaleString('en-US');
  const lbs = (n) => n.toLocaleString('en-US') + ' lbs';
  /* Jayco publishes lengths as feet and inches — 34' 3" — so they are parsed to
     a number to be compared and printed back as whole feet. */
  const feet = (s) => {
    const m = /^(\d+)'\s*(\d+)?/.exec(String(s || ''));
    return m ? Number(m[1]) + (Number(m[2] || 0) / 12) : null;
  };

  /* ---------- Measure ---------- */
  const side = { towable: blank(), motorized: blank() };
  function blank() { return { models: 0, plans: 0, price: [], len: [], gvwr: [] }; }

  JAYCO.categories.forEach((cat) => {
    const bucket = side[cat.type];
    if (!bucket) return;
    Object.keys(JAYCO.models).forEach((slug) => {
      const m = JAYCO.models[slug];
      if (!m || m.category !== cat.id) return;
      bucket.models++;
      bucket.price.push(m.basePrice);
      ((BUILD[slug] || {}).floorplans || []).forEach((f) => {
        bucket.plans++;
        const L = feet(f.length);
        if (L) bucket.len.push(L);
        const w = num(((f.specs || {}).Weights || {})['Gross Vehicle Weight Rating (lbs)']);
        if (w) bucket.gvwr.push(w);
      });
    });
  });
  if (!side.towable.plans || !side.motorized.plans) return;

  const lo = (a) => Math.min.apply(null, a);
  const hi = (a) => Math.max.apply(null, a);
  const span = (a, unit) => Math.round(lo(a)) + '–' + Math.round(hi(a)) + ' ' + unit;

  /* ---------- The rows ----------
     Measured first, then the three that are true of the shape rather than of
     any particular coach. */
  const ROWS = [
    { label: 'Starting price',
      tow: usd(lo(side.towable.price)), mot: usd(lo(side.motorized.price)),
      note: 'Jayco’s own “starting at” figure for the cheapest model in each group.' },
    { label: 'Floorplans to choose from',
      tow: String(side.towable.plans), mot: String(side.motorized.plans),
      note: 'Every published 2027 floorplan, counted.' },
    { label: 'Models',
      tow: String(side.towable.models), mot: String(side.motorized.models) },
    { label: 'Length',
      tow: span(side.towable.len, 'ft'), mot: span(side.motorized.len, 'ft') },
    { label: 'Loaded weight',
      tow: span(side.towable.gvwr, 'lbs').replace(/(\d)(?=(\d{3})+\b)/g, '$1,'),
      mot: span(side.motorized.gvwr, 'lbs').replace(/(\d)(?=(\d{3})+\b)/g, '$1,'),
      note: 'Gross vehicle weight rating — the most it may weigh loaded.' },
    { label: 'What you drive',
      tow: 'Your own truck or SUV', mot: 'The RV itself', plain: true },
    { label: 'Once you are parked',
      tow: 'Unhitch and the vehicle is yours', mot: 'Break camp, or bring a car to tow', plain: true },
    { label: 'Engines to maintain',
      tow: 'None — it is a trailer', mot: 'One, plus its chassis', plain: true },
  ];

  table.innerHTML = ROWS.map((r) => `
    <div class="tvd-row${r.plain ? ' is-plain' : ''}">
      <div class="tvd-cell tvd-cell--label">
        <span class="tvd-label">${esc(r.label)}</span>
        ${r.note ? `<span class="tvd-note">${esc(r.note)}</span>` : ''}
      </div>
      <div class="tvd-cell tvd-cell--tow"><span class="tvd-head" aria-hidden="true">Towable</span>${esc(r.tow)}</div>
      <div class="tvd-cell tvd-cell--mot"><span class="tvd-head" aria-hidden="true">Motorized</span>${esc(r.mot)}</div>
    </div>`).join('');

  /* The one sentence under the table, also measured — it is the difference the
     rest of the page is about. */
  const gap = lo(side.motorized.price) - lo(side.towable.price);
  const sub = $('#tvd-figures-sub');
  if (sub) {
    sub.textContent = 'The cheapest way into a Jayco towable is ' + usd(gap) +
      ' below the cheapest way into a motorhome — and there are ' +
      (side.towable.plans - side.motorized.plans) + ' more floorplans to choose from. ' +
      'What that buys you, and what it costs you, is the rest of this page.';
  }

  /* ---------- Parallax ----------
     The hero plate, scrubbed across its own pass, at the small magnitude
     DESIGN.md asks for. The travel is read from the CSS so the JS cannot drift
     past the media overhangs; under prefers-reduced-motion the stylesheet sets
     it to 0 and this returns before binding. towing.js carries the same note. */
  document.addEventListener('jayco:animations-ready', () => {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    const hero = $('.tvd-hero'), media = $('.tvd-hero-media');
    const px = parseFloat(getComputedStyle(document.querySelector('.tvd-page'))
      .getPropertyValue('--tvd-drift')) || 0;
    if (!hero || !media || !px) return;
    gsap.fromTo(media, { yPercent: -px / 2 }, {
      yPercent: px / 2, ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
    });
  }, { once: true });
}());
