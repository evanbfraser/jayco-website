/* ===================================================
   Jayco — Video library
   ---------------------------------------------------
   Renders js/video-data.js. One category filter, a card
   grid, and a player that is BUILT ON OPEN.

   That last part is the point of the file. Eleven
   <iframe>s rendered up front would load eleven YouTube
   players — several megabytes of third-party script and
   a set of cookies — before anyone has pressed play. So
   the cards are images and buttons, the thumbnails come
   from i.ytimg.com, and nothing reaches YouTube's player
   until a card is clicked. The frame is destroyed again
   on close, because an iframe left in the DOM keeps the
   player alive and the audio with it.
   =================================================== */

(function () {
  'use strict';

  const DATA = window.JAYCO_VIDEOS;
  const JAYCO = window.JAYCO || { models: {} };
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.prototype.slice.call((c || document).querySelectorAll(s));
  if (!DATA || !DATA.items || !DATA.items.length) return;

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* The channel suffix is on every title because that is how the channel names
     its uploads. It is noise repeated eleven times down a page that already
     says whose videos these are, so it comes off the card — the full title is
     still what the player prints and what the link goes to. */
  const shortTitle = (t) => t.replace(/\s*[-–]\s*Jayco RV\s*$/, '');

  let filter = '';

  const matches = (v) => !filter || v.cat === filter;
  const catName = (id) => {
    const c = DATA.categories.find((x) => x.id === id);
    return c ? c.name : '';
  };

  /* ---------- Cards ---------- */
  function card(v) {
    const model = v.slug && JAYCO.models[v.slug];
    return `<li class="vd-card" data-cat="${esc(v.cat)}">
      <button type="button" class="vd-card-btn" data-video="${esc(v.id)}"
        aria-label="Play: ${esc(shortTitle(v.title))}">
        <span class="vd-thumb">
          <img class="vd-thumb-img" src="https://i.ytimg.com/vi/${esc(v.id)}/maxresdefault.jpg"
               alt="" width="1280" height="720" loading="lazy" decoding="async"
               data-fallback="https://i.ytimg.com/vi/${esc(v.id)}/mqdefault.jpg" />
          <span class="vd-play" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </span>
          ${v.short ? '<span class="vd-badge">Short</span>' : ''}
        </span>
        <span class="vd-card-cat">${esc(catName(v.cat))}</span>
        <span class="vd-card-title">${esc(shortTitle(v.title))}</span>
      </button>
      ${model ? `<a class="vd-card-model" href="${esc(modelHref(v.slug))}">See the ${esc(model.name)}</a>` : ''}
    </li>`;
  }

  /* Only Swift and Jay Feather have a model page; everything else goes to its
     category. NOT app.js's exploreHref, which tests JAYCO_MODEL_DETAIL — an
     object only model.html loads, so on this page it is empty and every model
     would fall through. quiz.js already paid for that bug. */
  function modelHref(slug) {
    const d = window.JAYCO_MODEL_DETAIL;
    const has = (d && d[slug]) ? !d[slug].stub
      : (window.JAYCO_MODEL_PAGES || []).indexOf(slug) >= 0;
    if (has) return 'model.html?model=' + slug;
    const m = JAYCO.models[slug];
    return m ? 'type.html?type=' + m.category : 'index.html';
  }

  function renderCats() {
    const btn = (id, label, n) =>
      `<button type="button" class="vd-cat" data-cat="${esc(id)}" aria-pressed="${id === filter}">
        ${esc(label)} <span class="vd-n">${n}</span></button>`;
    $('#vd-cats').innerHTML = btn('', 'All', DATA.items.length) +
      DATA.categories.map((c) => btn(c.id, c.name,
        DATA.items.filter((v) => v.cat === c.id).length)).join('');
  }

  function renderGrid() {
    $('#vd-grid').innerHTML = DATA.items.map(card).join('');
    /* maxresdefault is present for all eleven today, but it is the one
       thumbnail size YouTube does not guarantee — fall back rather than show a
       broken card if that ever changes. */
    $$('.vd-thumb-img').forEach((img) => {
      img.addEventListener('error', function () {
        if (this.dataset.fallback) { this.src = this.dataset.fallback; this.dataset.fallback = ''; }
      });
    });
  }

  function applyFilter() {
    let n = 0;
    const hidden = [];
    $$('.vd-card').forEach((el) => {
      const on = !filter || el.dataset.cat === filter;
      if (!on && !el.hidden) hidden.push(el);
      el.hidden = !on;
      if (on) n++;
    });
    $('#vd-count').textContent = filter
      ? n + ' in ' + catName(filter)
      : 'All ' + DATA.items.length + ' videos';
    $('#vd-empty').hidden = n > 0;
    $$('.vd-cat').forEach((b) => {
      const on = b.dataset.cat === filter;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    /* A filter that hides the card holding focus drops it to <body> and
       teleports a keyboard user to the top. Park it on the count instead — it
       is the live region, so the new total is announced at the same moment. */
    const a = document.activeElement;
    if (hidden.length && (!a || a === document.body || hidden.some((el) => el.contains(a)))) {
      $('#vd-count').focus({ preventScroll: true });
    }
    if (window.ScrollTrigger) requestAnimationFrame(() => window.ScrollTrigger.refresh());
  }

  /* ---------- Player ----------
     Manners from the floorplans catalog's modal: `hidden` rather than a
     transitioned visibility, Lenis stopped because it keeps scrolling the page
     under a fixed overlay whatever overflow says, the return target passed in
     from the click (a click does not reliably focus a <button>), and Tab held
     manually as well as trusted to inert, which Safari below 15.5 ignores. */
  const FOCUSABLE = 'a[href],button:not([disabled]),iframe,[tabindex]:not([tabindex="-1"])';
  let lastFocus = null;
  const open = () => !$('#vd-player').hidden;

  function play(id, from) {
    const v = DATA.items.find((x) => x.id === id);
    if (!v) return;
    lastFocus = from || document.activeElement;

    const frame = $('#vd-player-frame');
    frame.classList.toggle('is-short', !!v.short);
    $('.vd-player-panel').classList.toggle('is-short', !!v.short);
    /* youtube-nocookie, and autoplay because the click WAS the play. */
    frame.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) +
      '?autoplay=1&rel=0" title="' + esc(v.title) + '" frameborder="0" allow="accelerometer; ' +
      'autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" ' +
      'referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>';

    $('#vd-player-title').textContent = shortTitle(v.title);
    $('#vd-player-out').href = 'https://www.youtube.com/watch?v=' + encodeURIComponent(id);
    $('#vd-player-out').setAttribute('aria-label',
      'Watch "' + shortTitle(v.title) + '" on YouTube — opens in a new tab');

    $('#vd-player').hidden = false;
    document.body.classList.add('vd-playing');
    const l = window.__jaycoLenis;
    if (l && l.stop) l.stop();
    $('#vd-player-x').focus();
  }

  function close() {
    if (!open()) return;
    /* Emptying the frame is what stops the video. Hiding the dialog would leave
       the player running and audible behind it. */
    $('#vd-player-frame').innerHTML = '';
    $('#vd-player').hidden = true;
    document.body.classList.remove('vd-playing');
    const l = window.__jaycoLenis;
    if (l && l.start) l.start();
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
    lastFocus = null;
  }

  function trapTab(e) {
    if (e.key !== 'Tab' || !open()) return;
    const d = $('#vd-player');
    const f = $$(FOCUSABLE, d).filter((el) => el.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (!d.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function wire() {
    $('#vd-cats').addEventListener('click', (e) => {
      const b = e.target.closest('.vd-cat');
      if (!b) return;
      filter = b.dataset.cat;
      applyFilter();
    });
    $('#vd-grid').addEventListener('click', (e) => {
      const b = e.target.closest('.vd-card-btn');
      if (b) play(b.dataset.video, b);
    });
    $('#vd-player').addEventListener('click', (e) => { if (e.target.dataset.vdClose) close(); });
    $('#vd-player-x').addEventListener('click', close);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && open()) { e.stopPropagation(); close(); return; }
      trapTab(e);
    });
  }

  renderCats();
  renderGrid();
  wire();
  applyFilter();
}());
