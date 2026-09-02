/* ===================================================
   Jayco — Brochures
   ---------------------------------------------------
   One card per model, from window.JAYCO — the same 27
   records every other page reads. Nothing is harvested
   or invented here, and there is no brochure data file:
   a brochure IS a model, so the model list is the list.

   THE FACETS ARE DERIVED, NOT WRITTEN
   jayco.com/brochures/ filters by Model Year, Product
   Type, Literature Type and Language. All four are
   reproduced here, but their options are computed from
   the data rather than typed in, so the page can never
   offer a filter the library cannot honour.

   Today that resolves to one facet that narrows
   anything — Product Type — and three that list a
   single value: every model in models-data.js is a
   2027, there is one kind of literature, and one
   language. They are still rendered, as dropdowns with
   an "All" option and whatever the data holds, which is
   what jayco.com does and what keeps them honest: the
   options are the library, so a year that does not
   exist can never be offered. They fill in on their own
   the day a second value lands.

   Product Type carries the tow-or-drive split as
   optgroups rather than a second control, so one
   dropdown holds both levels of the question.
   =================================================== */

(function () {
  'use strict';

  const JAYCO = window.JAYCO;
  if (!JAYCO || !JAYCO.models) return;

  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.prototype.slice.call((c || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- Index ----------
     In category order, so the grid reads the way the lineup does everywhere
     else on the site rather than in object-key order. */
  const ROWS = [];
  JAYCO.categories.forEach((cat) => {
    Object.keys(JAYCO.models).forEach((slug) => {
      const m = JAYCO.models[slug];
      if (!m || m.category !== cat.id) return;
      ROWS.push({
        slug: slug,
        name: m.name,
        year: m.year,
        tagline: m.tagline || '',
        catId: cat.id,
        catName: cat.name,
        catType: cat.type,          // towable | motorized
        /* The 400x248 derivative, not the 1.4MB print PNG in m.img. Same path
           the floorplans catalog uses; all 27 keys are covered. */
        img: '../assets/models/web/' + slug + '.webp',
        fallbackImg: m.img,
        lang: 'English',
        kind: 'Brochure',
        pass: true,
        el: null,
      });
    });
  });

  /* One value per facet, not a set: these are dropdowns, and a <select> picks
     one thing. '' means "All". */
  const state = { year: '', type: '', kind: '', lang: '' };

  function matches(r) {
    if (state.year && String(r.year) !== state.year) return false;
    if (state.type && r.catId !== state.type) return false;
    if (state.kind && r.kind !== state.kind) return false;
    if (state.lang && r.lang !== state.lang) return false;
    return true;
  }
  const activeCount = () => ['year', 'type', 'kind', 'lang'].filter((k) => state[k]).length;

  /* ---------- Facets ----------
     Each facet declares how to read its value off a row. render() counts the
     distinct values and decides, on that alone, whether it is a control or a
     fact. Nothing below hard-codes 2027, English or Brochure. */
  const FACETS = [
    { id: 'year', label: 'Model Year', all: 'All Model Years', get: (r) => String(r.year) },
    { id: 'type', label: 'Product Type', all: 'All Product Types', get: (r) => r.catId },
    { id: 'kind', label: 'Literature Type', all: 'All Literature', get: (r) => r.kind },
    { id: 'lang', label: 'Language', all: 'All Languages', get: (r) => r.lang },
  ];

  const distinct = (get) => {
    const seen = [];
    ROWS.forEach((r) => { const v = get(r); if (seen.indexOf(v) < 0) seen.push(v); });
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
    $('#br-facets').innerHTML = FACETS.map((f) => {
      const opts = [{ value: '', label: f.all }].concat(
        f.id === 'type' ? typeOptions() : distinct(f.get).map((v) => ({ value: v, label: v })));
      return `<div class="br-facet">
        <span class="br-facet-label" id="br-lab-${f.id}">${esc(f.label)}</span>
        <div class="br-dd" data-facet="${f.id}">
          <button type="button" class="br-dd-trigger" id="br-dd-${f.id}"
                  aria-haspopup="listbox" aria-expanded="false"
                  aria-labelledby="br-lab-${f.id} br-dd-val-${f.id}">
            <span class="br-dd-value" id="br-dd-val-${f.id}">${esc(f.all)}</span>
            <span class="br-dd-chev" aria-hidden="true"></span>
          </button>
          <ul class="br-dd-list" role="listbox" tabindex="-1" hidden
              aria-labelledby="br-lab-${f.id}">
            ${opts.map((o, i) => o.head
              ? `<li class="br-dd-head" role="presentation">${esc(o.head)}</li>`
              : `<li class="br-dd-opt" role="option" id="br-o-${f.id}-${i}"
                   data-value="${esc(o.value)}" aria-selected="${o.value === '' ? 'true' : 'false'}">
                   <span class="br-dd-opt-label">${esc(o.label)}</span>
                   <span class="br-dd-opt-n"></span>
                 </li>`).join('')}
          </ul>
        </div>
      </div>`;
    }).join('');
  }

  /* Towable and Motorized as headings inside the one list rather than a control
     of their own: it is the same question one level up, and nesting it keeps
     four dropdowns from becoming five. */
  function typeOptions() {
    const out = [];
    ['towable', 'motorized'].forEach((t) => {
      const cats = JAYCO.categories.filter((c) => c.type === t && ROWS.some((r) => r.catId === c.id));
      if (!cats.length) return;
      out.push({ head: t === 'towable' ? 'Towable' : 'Motorized' });
      cats.forEach((c) => out.push({ value: c.id, label: c.name }));
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
      const dd = $('.br-dd[data-facet="' + f.id + '"]');
      if (!dd) return;
      const base = baseWithout(f.id);
      let chosen = f.all;
      $$('.br-dd-opt', dd).forEach((o) => {
        const v = o.dataset.value;
        const n = v ? base.filter((r) => String(f.get(r)) === v).length : base.length;
        $('.br-dd-opt-n', o).textContent = n;
        const on = v === state[f.id];
        o.setAttribute('aria-selected', on ? 'true' : 'false');
        if (on) chosen = $('.br-dd-opt-label', o).textContent;
        /* An option that leads nowhere is disabled rather than removed —
           removing it would reshuffle the list under an open panel. */
        o.classList.toggle('is-dead', !n && !on);
      });
      $('#br-dd-val-' + f.id).textContent = chosen;
      dd.classList.toggle('is-set', !!state[f.id]);
    });
    $('#br-clear').hidden = !activeCount();
  }

  /* ---------- Cards ---------- */
  function card(r, i) {
    return `<li class="br-card" data-slug="${esc(r.slug)}">
      <div class="br-card-media">
        <img class="br-card-img" src="${esc(r.img)}" alt="" width="400" height="248"
          decoding="async"${i < 6 ? '' : ' loading="lazy"'} />
      </div>
      <div class="br-card-body">
        <span class="br-card-meta">${esc(r.year)} · ${esc(r.catName)}</span>
        <h3 class="br-card-name">${esc(r.name)}</h3>
        ${r.tagline ? `<p class="br-card-tagline">${esc(r.tagline)}</p>` : ''}
      </div>
      <button type="button" class="br-card-cta" data-brochure-open="${esc(r.slug)}"
        aria-label="Request the ${esc(r.year + ' ' + r.name)} brochure">Request Brochure</button>
    </li>`;
  }

  function renderGrid() {
    $('#br-grid').innerHTML = ROWS.map(card).join('');
    ROWS.forEach((r) => {
      r.el = $('.br-card[data-slug="' + r.slug + '"]');
      /* The print PNG is the fallback if a derivative is ever missing. */
      const img = r.el && $('.br-card-img', r.el);
      if (img) img.addEventListener('error', function () { this.src = r.fallbackImg; }, { once: true });
    });
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

    $('#br-count').textContent = shown.length === ROWS.length
      ? 'All ' + ROWS.length + ' brochures'
      : shown.length + ' of ' + ROWS.length + ' brochures';
    $('#br-empty').hidden = shown.length > 0;
    paintFacets();

    /* A filter that hides the card holding focus drops it to <body> and
       teleports a keyboard user to the top. Park it on the count instead — it
       is the live region, so the new total is announced at the same moment. */
    const a = document.activeElement;
    if (hidden.length && (!a || a === document.body || hidden.some((el) => el.contains(a)))) {
      $('#br-count').focus({ preventScroll: true });
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
  const listOf = (dd) => $('.br-dd-list', dd);
  const isOpen = (dd) => !listOf(dd).hidden;
  let cursor = 0;

  function paintCursor(dd) {
    const opts = $$('.br-dd-opt', dd);
    opts.forEach((o, i) => o.classList.toggle('is-cursor', i === cursor));
    const at = opts[cursor];
    if (at) {
      listOf(dd).setAttribute('aria-activedescendant', at.id);
      if (at.scrollIntoView) at.scrollIntoView({ block: 'nearest' });
    }
  }

  function closeAll(except) {
    $$('.br-dd').forEach((dd) => {
      if (dd === except || !isOpen(dd)) return;
      listOf(dd).hidden = true;
      $('.br-dd-trigger', dd).setAttribute('aria-expanded', 'false');
      listOf(dd).removeAttribute('aria-activedescendant');
      $$('.br-dd-opt', dd).forEach((o) => o.classList.remove('is-cursor'));
    });
  }

  function openList(dd) {
    closeAll(dd);
    const list = listOf(dd);
    list.hidden = false;
    $('.br-dd-trigger', dd).setAttribute('aria-expanded', 'true');
    /* open on the current selection, not on wherever the cursor last was */
    const opts = $$('.br-dd-opt', dd);
    const sel = opts.findIndex((o) => o.getAttribute('aria-selected') === 'true');
    cursor = sel === -1 ? 0 : sel;
    paintCursor(dd);
    list.focus();
  }

  function closeList(dd, refocus) {
    closeAll(null);
    if (refocus) $('.br-dd-trigger', dd).focus();
  }

  function commit(dd, opt) {
    if (!opt || opt.classList.contains('is-dead')) return;
    state[dd.dataset.facet] = opt.dataset.value;
    closeList(dd, true);
    applyFilters();
  }

  function wire() {
    const facets = $('#br-facets');

    facets.addEventListener('click', (e) => {
      const trig = e.target.closest('.br-dd-trigger');
      if (trig) {
        const dd = trig.closest('.br-dd');
        isOpen(dd) ? closeList(dd, false) : openList(dd);
        return;
      }
      const opt = e.target.closest('.br-dd-opt');
      if (opt) commit(opt.closest('.br-dd'), opt);
    });

    facets.addEventListener('keydown', (e) => {
      const dd = e.target.closest('.br-dd');
      if (!dd) return;
      const onTrigger = !!e.target.closest('.br-dd-trigger');

      if (onTrigger && ['ArrowDown', 'ArrowUp', 'Enter', ' '].indexOf(e.key) > -1) {
        e.preventDefault(); openList(dd); return;
      }
      if (!isOpen(dd)) return;

      const opts = $$('.br-dd-opt', dd);
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
      if (!e.target.closest('.br-dd')) closeAll(null);
    });

    $('#br-clear').addEventListener('click', () => {
      FACETS.forEach((f) => { state[f.id] = ''; });
      closeAll(null);
      applyFilters();
      $('#br-count').focus({ preventScroll: true });
    });
  }

  /* ---------- Hero parallax ----------
     The page's one authored motion moment, which DESIGN.md allows exactly one
     of. Everything below it uses the shared handoff and nothing else pins,
     scrubs or hinges.

     Small and linear, the way the rest of the site drifts its media: ease
     'none' and scrub true, so it tracks the scrollbar rather than performing.
     The travel is read from --br-drift so the CSS owns the headroom and the JS
     cannot drift further than the media overhangs — which is what stops a bare
     edge appearing at the top or bottom of the band.

     Attached on jayco:animations-ready rather than DOMContentLoaded: app.js
     owns the single ScrollTrigger registration and dispatches that when it is
     ready. Under prefers-reduced-motion the CSS sets --br-drift to 0, so the
     guard below leaves the image exactly where it sits. */
  function initParallax() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    const media = $('.br-hero-media');
    const hero = $('.br-hero');
    if (!media || !hero) return;

    const drift = parseFloat(getComputedStyle(document.querySelector('.brochures-page'))
      .getPropertyValue('--br-drift')) || 0;
    if (!drift) return;

    gsap.fromTo(media,
      { yPercent: -drift / 2 },
      {
        yPercent: drift / 2,
        ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
      });
  }

  /* ---------- Boot ---------- */
  if (!ROWS.length) return;
  renderFacets();
  renderGrid();
  wire();
  applyFilters();
  window.addEventListener('load', refresh, { once: true });
  document.addEventListener('jayco:animations-ready', initParallax, { once: true });
}());
