/* ===================================================
   Jayco — Owner's Manuals
   ---------------------------------------------------
   PORTED FROM brochures.js, which is the page this one
   was asked to be like: the same four-facet filter, the
   same listbox dropdowns with live counts, the same
   card reveal and the same hero parallax. Restated
   rather than shared, per the house rule — a change to
   one is a deliberate change to both.

   WHAT IS DIFFERENT, and why.

   • ONE ROW IS A DOCUMENT, NOT A MODEL. Brochures are
     one per model, so that page reads window.JAYCO.
     A manual covers a FAMILY — one towable manual for
     all four towable classes — so this reads
     manuals-data.js, and the Product Type facet
     matches on a manual's `covers` list rather than on
     one category id. Pick Fifth Wheels and the two
     towable manuals answer, because those are the ones
     that cover it.

   • NO COVER IMAGE. Jayco publishes no artwork per
     manual, so the card is icon-led rather than showing
     a picture this repo does not have.

   • THE ACTION IS A LINK, NOT A MODAL. The brochure
     card opens the request form; there is no equivalent
     for manuals here and no PDFs in this repo, so the
     button takes the site's convention for a
     destination that does not exist yet, which app.js
     neutralises.
   =================================================== */
(function () {
  'use strict';

  const DOCS = window.JAYCO_MANUALS;
  if (!DOCS || !DOCS.length) return;

  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.prototype.slice.call((c || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* Jayco's eight type names split cleanly in two, and nothing else does. Kept
     here rather than read from models-data.js because these manuals reach back
     to models the 2027 catalogue no longer carries. */
  const MOTORIZED = ['Class A Motorhomes', 'Class B Motorhomes', 'Class C Motorhomes'];

  const ROWS = DOCS.map((d, i) => ({
    slug: 'm' + i,
    name: d.name,
    years: d.years,
    yearsText: d.years.length === 1 ? String(d.years[0])
      : d.years[0] + '\u2013' + d.years[d.years.length - 1],
    newest: Math.max.apply(null, d.years),
    kind: d.kind,
    types: d.types,
    typesText: d.types.join(', '),
    pdf: d.pdf,
    cover: d.cover || '',
    coverW: d.coverW || 0,
    coverH: d.coverH || 0,
    lang: 'English',
    pass: true,
    el: null,
  }));

  /* One value per facet, not a set: these are dropdowns, and a <select> picks
     one thing. '' means "All". */
  const state = { year: '', type: '', kind: '', lang: '' };

  function matches(r) {
    /* A document can be listed under several model years. */
    if (state.year && r.years.indexOf(Number(state.year)) < 0) return false;
    /* And it can cover several classes. */
    if (state.type && r.types.indexOf(state.type) < 0) return false;
    if (state.kind && r.kind !== state.kind) return false;
    if (state.lang && r.lang !== state.lang) return false;
    return true;
  }
  const activeCount = () => ['year', 'type', 'kind', 'lang'].filter((k) => state[k]).length;

  /* ---------- Facets ----------
     Each facet declares how to read its value off a row. render() counts the
     distinct values and decides, on that alone, whether it is a control or a
     fact. Nothing below hard-codes 2027 or English. */
  const FACETS = [
    { id: 'year', label: 'Model Year', all: 'All Model Years',
      get: (r) => r.years, has: (r, v) => r.years.indexOf(Number(v)) > -1 },
    { id: 'type', label: 'Product Type', all: 'All Product Types',
      get: (r) => r.types, has: (r, v) => r.types.indexOf(v) > -1 },
    { id: 'kind', label: 'Literature Type', all: 'All Literature', get: (r) => r.kind },
    { id: 'lang', label: 'Language', all: 'All Languages', get: (r) => r.lang },
  ];

  /* Flattens an array-valued getter — years and types are both lists — so a
     facet's option set is every value that appears, not every list. Years come
     back newest first; the rest keep the order they were met in. */
  const distinct = (get) => {
    const seen = [];
    ROWS.forEach((r) => {
      const v = get(r);
      (Array.isArray(v) ? v : [v]).forEach((x) => { if (seen.indexOf(x) < 0) seen.push(x); });
    });
    return seen;
  };

  /* ---------- The dropdowns ----------
     Not a <select>. A native popup is drawn by the OS: its width, colour and
     radius cannot be set, so it would open as a grey system list under a white
     field and read as something borrowed from another page. This is the listbox
     pattern the model page's floorplan selector already uses — the list holds
     focus while open and points at the cursor with aria-activedescendant, so
     the options themselves never take focus and the roving-tabindex dance the
     tablists use cannot fight it.

     The panel is absolutely positioned with left:0 right:0, so it is the
     trigger's width by construction rather than by a number kept in sync. */
  function renderFacets() {
    $('#mn-facets').innerHTML = FACETS.map((f) => {
      const opts = [{ value: '', label: f.all }].concat(
        f.id === 'type' ? typeOptions()
          : (f.id === 'year' ? distinct(f.get).slice().sort((a, b) => b - a) : distinct(f.get))
              .map((v) => ({ value: String(v), label: String(v) })));
      return `<div class="mn-facet">
        <span class="mn-facet-label" id="mn-lab-${f.id}">${esc(f.label)}</span>
        <div class="mn-dd" data-facet="${f.id}">
          <button type="button" class="mn-dd-trigger" id="mn-dd-${f.id}"
                  aria-haspopup="listbox" aria-expanded="false"
                  aria-labelledby="mn-lab-${f.id} mn-dd-val-${f.id}">
            <span class="mn-dd-value" id="mn-dd-val-${f.id}">${esc(f.all)}</span>
            <span class="mn-dd-chev" aria-hidden="true"></span>
          </button>
          <ul class="mn-dd-list" role="listbox" tabindex="-1" hidden
              aria-labelledby="mn-lab-${f.id}">
            ${opts.map((o, i) => o.head
              ? `<li class="mn-dd-head" role="presentation">${esc(o.head)}</li>`
              : `<li class="mn-dd-opt" role="option" id="mn-o-${f.id}-${i}"
                   data-value="${esc(o.value)}" aria-selected="${o.value === '' ? 'true' : 'false'}">
                   <span class="mn-dd-opt-label">${esc(o.label)}</span>
                   <span class="mn-dd-opt-n"></span>
                 </li>`).join('')}
          </ul>
        </div>
      </div>`;
    }).join('');
  }

  /* Towable and Motorized as headings inside the one list rather than a control
     of their own: it is the same question one level up, and nesting it keeps
     four dropdowns from becoming five. */
  /* Towable and Motorized as headings inside the one list rather than a control
     of their own: it is the same question one level up. */
  function typeOptions() {
    const all = distinct((r) => r.types);
    const out = [];
    [['Towable', (n) => MOTORIZED.indexOf(n) < 0], ['Motorized', (n) => MOTORIZED.indexOf(n) > -1]]
      .forEach((g) => {
        const names = all.filter(g[1]).sort();
        if (!names.length) return;
        out.push({ head: g[0] });
        names.forEach((n) => out.push({ value: n, label: n }));
      });
    return out;
  }

  function baseWithout(facet) {
    const held = state[facet];
    state[facet] = '';
    const rows = ROWS.filter(matches);
    state[facet] = held;
    return rows;
  }

  /* Patch, never rebuild: re-rendering a list mid-interaction closes the panel
     and drops focus. Each option carries how many survive if you pick it,
     measured against a base with that option's own facet neutralised —
     counting against the current results would show every option as its own
     intersection and read as nonsense the moment two are set. */
  function paintFacets() {
    FACETS.forEach((f) => {
      const dd = $('.mn-dd[data-facet="' + f.id + '"]');
      if (!dd) return;
      const base = baseWithout(f.id);
      let chosen = f.all;
      $$('.mn-dd-opt', dd).forEach((o) => {
        const v = o.dataset.value;
        const n = v
          ? base.filter((r) => (f.has ? f.has(r, v) : String(f.get(r)) === v)).length
          : base.length;
        $('.mn-dd-opt-n', o).textContent = n;
        const on = v === state[f.id];
        o.setAttribute('aria-selected', on ? 'true' : 'false');
        if (on) chosen = $('.mn-dd-opt-label', o).textContent;
        /* An option that leads nowhere is disabled rather than removed —
           removing it would reshuffle the list under an open panel. */
        o.classList.toggle('is-dead', !n && !on);
      });
      $('#mn-dd-val-' + f.id).textContent = chosen;
      dd.classList.toggle('is-set', !!state[f.id]);
    });
    $('#mn-clear').hidden = !activeCount();
  }

  /* ---------- Cards ---------- */
  /* THE FALLBACK, not the usual case. Jayco does publish cover artwork per
     manual — this file previously said it did not, which was wrong, and the
     card led with a document mark because of it. The artwork is now harvested
     and stored locally, so the mark is only reached by a row that has none:
     a manual added to the data before its cover is pulled. Keeping it means
     such a row still renders as a card rather than as a hole. */
  const DOC_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7z"/>
      <path d="M14 2v5h5M9 13h6M9 17h6"/></svg>`;

  function card(r) {
    return `<li class="mn-card" data-slug="${esc(r.slug)}">
      ${r.cover
        ? `<span class="mn-card-cover"><img class="mn-card-cover-img" src="${esc(r.cover)}"
             alt="" width="${r.coverW}" height="${r.coverH}" loading="lazy" decoding="async" /></span>`
        : `<span class="mn-card-icon" aria-hidden="true">${DOC_ICON}</span>`}
      <div class="mn-card-body">
        <span class="mn-card-meta">${esc(r.yearsText)} &middot; ${esc(r.kind)}</span>
        <h3 class="mn-card-name">${esc(r.name)}</h3>
        <p class="mn-card-covers"><span class="mn-card-covers-k">Covers</span>
          ${esc(r.typesText)}</p>
      </div>
      <a class="mn-card-cta" href="${esc(r.pdf)}" target="_blank" rel="noopener"
        aria-label="Download the ${esc(r.yearsText + ' ' + r.name)} as a PDF (opens on jayco.com)"
        >Download PDF</a>
    </li>`;
  }

  function renderGrid() {
    $('#mn-grid').innerHTML = ROWS.map(card).join('');
    ROWS.forEach((r) => { r.el = $('.mn-card[data-slug="' + r.slug + '"]'); });
  }

  function applyFilters() {
    ROWS.forEach((r) => { r.pass = matches(r); });
    const shown = ROWS.filter((r) => r.pass);

    const hidden = [];
    ROWS.forEach((r) => {
      if (!r.el) return;
      if (!r.pass && !r.el.hidden) hidden.push(r.el);
      r.el.hidden = !r.pass;
    });

    $('#mn-count').textContent = shown.length === ROWS.length
      ? 'All ' + ROWS.length + ' manuals'
      : shown.length + ' of ' + ROWS.length + ' manuals';
    $('#mn-empty').hidden = shown.length > 0;
    paintFacets();

    /* A filter that hides the card holding focus drops it to <body> and
       teleports a keyboard user to the top. Park it on the count instead — it
       is the live region, so the new total is announced at the same moment. */
    const a = document.activeElement;
    if (hidden.length && (!a || a === document.body || hidden.some((el) => el.contains(a)))) {
      $('#mn-count').focus({ preventScroll: true });
    }

    refresh();
  }

  /* Filtering changes document height, and every ScrollTrigger on the page
     caches its start/end against the old layout — the footer's reveal is set
     with gsap.from(opacity:0) and would stay invisible forever. */
  let queued = 0;
  function refresh() {
    if (queued || !window.ScrollTrigger) return;
    queued = requestAnimationFrame(() => { queued = 0; window.ScrollTrigger.refresh(); });
  }

  /* ---------- Listbox behaviour ---------- */
  const listOf = (dd) => $('.mn-dd-list', dd);
  const isOpen = (dd) => !listOf(dd).hidden;
  let cursor = 0;

  function paintCursor(dd) {
    const opts = $$('.mn-dd-opt', dd);
    opts.forEach((o, i) => o.classList.toggle('is-cursor', i === cursor));
    const at = opts[cursor];
    if (at) {
      listOf(dd).setAttribute('aria-activedescendant', at.id);
      if (at.scrollIntoView) at.scrollIntoView({ block: 'nearest' });
    }
  }

  function closeAll(except) {
    $$('.mn-dd').forEach((dd) => {
      if (dd === except || !isOpen(dd)) return;
      listOf(dd).hidden = true;
      $('.mn-dd-trigger', dd).setAttribute('aria-expanded', 'false');
      listOf(dd).removeAttribute('aria-activedescendant');
      $$('.mn-dd-opt', dd).forEach((o) => o.classList.remove('is-cursor'));
    });
  }

  function openList(dd) {
    closeAll(dd);
    const list = listOf(dd);
    list.hidden = false;
    $('.mn-dd-trigger', dd).setAttribute('aria-expanded', 'true');
    /* open on the current selection, not on wherever the cursor last was */
    const opts = $$('.mn-dd-opt', dd);
    const sel = opts.findIndex((o) => o.getAttribute('aria-selected') === 'true');
    cursor = sel === -1 ? 0 : sel;
    paintCursor(dd);
    list.focus();
  }

  function closeList(dd, refocus) {
    closeAll(null);
    if (refocus) $('.mn-dd-trigger', dd).focus();
  }

  function commit(dd, opt) {
    if (!opt || opt.classList.contains('is-dead')) return;
    state[dd.dataset.facet] = opt.dataset.value;
    closeList(dd, true);
    applyFilters();
  }

  function wire() {
    const facets = $('#mn-facets');

    facets.addEventListener('click', (e) => {
      const trig = e.target.closest('.mn-dd-trigger');
      if (trig) {
        const dd = trig.closest('.mn-dd');
        isOpen(dd) ? closeList(dd, false) : openList(dd);
        return;
      }
      const opt = e.target.closest('.mn-dd-opt');
      if (opt) commit(opt.closest('.mn-dd'), opt);
    });

    facets.addEventListener('keydown', (e) => {
      const dd = e.target.closest('.mn-dd');
      if (!dd) return;
      const onTrigger = !!e.target.closest('.mn-dd-trigger');

      if (onTrigger && ['ArrowDown', 'ArrowUp', 'Enter', ' '].indexOf(e.key) > -1) {
        e.preventDefault(); openList(dd); return;
      }
      if (!isOpen(dd)) return;

      const opts = $$('.mn-dd-opt', dd);
      const live = opts.filter((o) => !o.classList.contains('is-dead'));
      let next = null;
      if (e.key === 'ArrowDown') next = live[Math.min(live.indexOf(opts[cursor]) + 1, live.length - 1)];
      else if (e.key === 'ArrowUp') next = live[Math.max(live.indexOf(opts[cursor]) - 1, 0)];
      else if (e.key === 'Home') next = live[0];
      else if (e.key === 'End') next = live[live.length - 1];
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); commit(dd, opts[cursor]); return; }
      else if (e.key === 'Escape' || e.key === 'Tab') {
        /* Tab closes but does not swallow: the focus should move on. */
        closeList(dd, e.key === 'Escape');
        if (e.key === 'Escape') e.preventDefault();
        return;
      } else return;

      e.preventDefault();
      if (next) { cursor = opts.indexOf(next); paintCursor(dd); }
    });

    /* A click anywhere else closes it — including on another part of the page,
       which is what a native popup does. */
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.mn-dd')) closeAll(null);
    });

    $('#mn-clear').addEventListener('click', () => {
      FACETS.forEach((f) => { state[f.id] = ''; });
      closeAll(null);
      applyFilters();
      $('#mn-count').focus({ preventScroll: true });
    });
  }

  /* ---------- Hero parallax ----------
     The page's one authored motion moment, which DESIGN.md allows exactly one
     of. Everything below it uses the shared handoff and nothing else pins,
     scrubs or hinges.

     Small and linear, the way the rest of the site drifts its media: ease
     'none' and scrub true, so it tracks the scrollbar rather than performing.
     The travel is read from --mn-drift so the CSS owns the headroom and the JS
     cannot drift further than the media overhangs — which is what stops a bare
     edge appearing at the top or bottom of the band.

     Attached on jayco:animations-ready rather than DOMContentLoaded: app.js
     owns the single ScrollTrigger registration and dispatches that when it is
     ready. Under prefers-reduced-motion the CSS sets --mn-drift to 0, so the
     guard below leaves the image exactly where it sits. */
  function initParallax() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    const media = $('.mn-hero-media');
    const hero = $('.mn-hero');
    if (!media || !hero) return;

    const drift = parseFloat(getComputedStyle(document.querySelector('.manuals-page'))
      .getPropertyValue('--mn-drift')) || 0;
    if (!drift) return;

    gsap.fromTo(media,
      { yPercent: -drift / 2 },
      {
        yPercent: drift / 2,
        ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
      });
  }

  /* ---------- The cards arriving ----------
     The page has no data-animation on the grid section for the reason stated in
     manuals.html: app.js runs ONE staggered gsap.from() over everything inside
     such a section, and a full grid of cards would be a stagger minutes long with every
     button invisible until its turn came. This is that arrival, done per row
     instead of per page.

     An IntersectionObserver rather than a ScrollTrigger per card, because the
     grid REFLOWS: a filter hides cards and every card below moves up, and a
     ScrollTrigger caches its start against the layout it was built in. A card
     that is display:none never intersects, so a filtered-out card simply waits,
     and arrives properly the first time a filter lets it back on screen —
     whereas a stale trigger can fire while the card is hidden and spend the
     animation on nothing.

     The stagger comes free from the observer: cards crossing the line together
     are one row, and one row is one callback, so the entries of a single call
     ARE the group to sweep across. Nothing has to know how many columns there
     are or recompute it on resize.

     clearProps: 'all' at the end, not just a resting state: gsap leaves its
     transform inline, and an inline transform beats .mn-card:hover { transform:
     translateY(-3px) } for good — 'all' because gsap also writes translate /
     rotate / scale of its own, and clearing the transform alone would leave
     those behind. The transition is suppressed for the duration for the same
     reason in reverse: .mn-card transitions transform over 0.3s, which would
     sit between gsap and the screen and smear every frame. */
  function initCardReveal() {
    if (typeof gsap === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const cards = ROWS.map((r) => r.el).filter(Boolean);
    if (!cards.length || !('IntersectionObserver' in window)) return;

    const io = new IntersectionObserver((entries, obs) => {
      const arriving = entries.filter((e) => e.isIntersecting).map((e) => e.target);
      if (!arriving.length) return;
      arriving.forEach((el) => obs.unobserve(el));
      /* Entries are not promised in document order, and the sweep has to run
         left to right. */
      arriving.sort((a, b) =>
        (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) ? -1 : 1);

      gsap.to(arriving, {
        opacity: 1, y: 0,
        duration: 0.55, ease: 'power2.out',
        stagger: 0.07,
        clearProps: 'all',
      });
    }, { rootMargin: '0px 0px -10% 0px' });

    /* Hidden here rather than in the stylesheet: the resting state a reader
       gets with this script dead, or with reduced motion on, is the visible
       one. */
    gsap.set(cards, { opacity: 0, y: 24, transition: 'none' });
    cards.forEach((el) => io.observe(el));
  }

  /* ---------- Boot ---------- */
  if (!ROWS.length) return;
  renderFacets();
  renderGrid();
  wire();
  applyFilters();
  window.addEventListener('load', refresh, { once: true });
  document.addEventListener('jayco:animations-ready', () => {
    initParallax();
    initCardReveal();
  }, { once: true });
}());
