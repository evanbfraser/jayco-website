/* ===================================================
   Jayco — Brochures
   ---------------------------------------------------
   The whole library, from brochures-library.js: 595
   entries across eleven model years and three
   languages, harvested from jayco.com/brochures/.
   See that file's header for how it was taken.

   IT USED TO BE THE MODEL LIST. The page was built on
   window.JAYCO — 27 records, every one a 2027 English
   brochure — on the reasoning that a brochure IS a
   model. That is true of the current lineup and false
   of the library, which keeps a decade of back years
   and carries French and Spanish editions the model
   list has no room for.

   THE FACETS ARE STILL DERIVED, NOT WRITTEN, and that
   is why the change cost so little: Model Year,
   Product Type, Literature Type and Language all read
   their options out of the data. When the data grew
   from 27 rows to 595 the controls grew with it. Three
   facets that used to list a single value and narrow
   nothing now narrow properly.

   PRODUCT TYPE KEEPS THE TOW-OR-DRIVE SPLIT as
   optgroups, so one dropdown still holds both levels
   of the question. The eight types are Jayco's own,
   harvested from the filter rather than mapped onto
   this site's categories.

   THE DOWNLOAD GOES TO JAYCO. Each card links to the
   PDF on jayco.com, which is what jayco.com's own
   cards do. The lead-capture modal is not wired to
   these cards: it is built around JAYCO.models and can
   only name one of 27 current coaches, so it cannot
   speak for a 2018 flyer.
   =================================================== */

(function () {
  'use strict';

  const LIB = window.JAYCO_BROCHURE_LIBRARY;
  if (!LIB || !LIB.items || !LIB.items.length) return;

  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.prototype.slice.call((c || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- Index ----------
     Newest year first, then by model, which is the order the library itself
     lists them in and the order a reader looking for "the 2024 one" wants. */
  const ROWS = LIB.items.map((it) => ({
    id: it.id,
    name: it.model,
    year: it.year,
    type: it.type,              // Jayco's own product type
    kind: it.lit,               // Brochure | Flyer
    lang: it.langName,          // English | French | Spanish
    langCode: it.lang,
    pdf: it.pdf,
    img: it.cover,
    coverW: it.coverW,
    coverH: it.coverH,
    pass: true,
    el: null,
  }));

  /* One value per facet, not a set: these are dropdowns, and a <select> picks
     one thing. '' means "All". */
  const state = { year: '', type: '', kind: '', lang: '' };

  function matches(r) {
    if (state.year && String(r.year) !== state.year) return false;
    if (state.type && r.type !== state.type) return false;
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
    { id: 'type', label: 'Product Type', all: 'All Product Types', get: (r) => r.type },
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
  /* Jayco's eight product types, split the way the rest of this site splits a
     lineup. The membership is spelled out rather than inferred from the word
     "Motorhome", because Camping Trailers and Destination Travel Trailers are
     towables whose names say neither. Any type the harvest adds later that is
     not listed here still appears — it falls through to Towable's tail rather
     than vanishing from the control. */
  const MOTORIZED = ['Class A Motorhomes', 'Class B Motorhomes', 'Class C Motorhomes'];

  function typeOptions() {
    const present = distinct((r) => r.type);
    const out = [];
    [['Towable', (t) => MOTORIZED.indexOf(t) < 0],
     ['Motorized', (t) => MOTORIZED.indexOf(t) >= 0]].forEach((pair) => {
      const list = present.filter(pair[1]).sort();
      if (!list.length) return;
      out.push({ head: pair[0] });
      list.forEach((t) => out.push({ value: t, label: t }));
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

  /* ---------- Cards ----------
     The cover is Jayco's own, stored locally at 300px wide; the download is
     Jayco's PDF, linked rather than copied so it cannot go stale. An <a> and
     not a <button>: it navigates, and a keyboard user is owed the difference.

     Language is printed only when it is not English, so 378 of 595 cards do
     not carry a badge saying the obvious. */
  function card(r, i) {
    return `<li class="br-card" data-id="${esc(r.id)}">
      <div class="br-card-media">
        <img class="br-card-img" src="${esc(r.img)}" alt=""
          width="${r.coverW}" height="${r.coverH}"
          decoding="async"${i < 8 ? '' : ' loading="lazy"'} />
      </div>
      <div class="br-card-body">
        <span class="br-card-meta">${esc(r.year)} · ${esc(r.type)}</span>
        <h3 class="br-card-name">${esc(r.name)}</h3>
        <p class="br-card-tagline">${esc(r.kind)}${r.langCode !== 'en' ? ' · ' + esc(r.lang) : ''}</p>
      </div>
      <a class="br-card-cta" href="${esc(r.pdf)}" target="_blank" rel="noopener"
        aria-label="Download the ${esc(r.year + ' ' + r.name + ' ' + r.kind)} — PDF on jayco.com"
        >Download ${esc(r.kind)}</a>
    </li>`;
  }

  function renderGrid() {
    $('#br-grid').innerHTML = ROWS.map(card).join('');
    ROWS.forEach((r) => { r.el = $('.br-card[data-id="' + r.id + '"]'); });
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

  /* ---------- The cards arriving ----------
     The page has no data-animation on the grid section for the reason stated in
     brochures.html: app.js runs ONE staggered gsap.from() over everything inside
     such a section, and 27 cards would be a stagger minutes long with every
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
     transform inline, and an inline transform beats .br-card:hover { transform:
     translateY(-3px) } for good — 'all' because gsap also writes translate /
     rotate / scale of its own, and clearing the transform alone would leave
     those behind. The transition is suppressed for the duration for the same
     reason in reverse: .br-card transitions transform over 0.3s, which would
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
