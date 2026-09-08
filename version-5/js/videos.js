/* ===================================================
   Jayco — Video library
   ---------------------------------------------------
   Renders js/video-data.js. One category filter, a card
   grid, and a player that is BUILT ON OPEN.

   That last part is the point of the file. Seventy
   <iframe>s rendered up front would load seventy
   YouTube players — tens of megabytes of third-party
   script and a set of cookies — before anyone has
   pressed play. So
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
     its uploads. It is noise repeated sixty-odd times down a page that already
     says whose videos these are, so it comes off the card — the full title is
     still what the player prints and what the link goes to. */
  const shortTitle = (t) => t.replace(/\s*[-–]\s*Jayco RV\s*$/, '');

  let filter = '';
  /* applyFilter() runs once before anything is chosen; that pass must not move
     focus or animate a scroll. */
  let booted = false;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
               data-fallback="https://i.ytimg.com/vi/${esc(v.id)}/hqdefault.jpg" />
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

  /* ---------- The two views ----------
     Unfiltered: a shelf per category, each a rail. Filtered: the grid, holding
     that category alone. Only one is ever built — see the note in videos.html.

     The rails are the site's card-rail idiom (type.html's feature rails, the
     floorplans catalog): the track scrolls, the arrows are geometry read off
     scrollLeft rather than a counter, so a swipe, a trackpad flick and a click
     all leave the buttons telling the truth. */
  function shelf(c) {
    const items = DATA.items.filter((v) => v.cat === c.id);
    if (!items.length) return '';
    return `<section class="vd-shelf" data-shelf="${esc(c.id)}"
      aria-labelledby="vd-sh-${esc(c.id)}">
      <div class="vd-shelf-head">
        <h2 class="vd-shelf-h" id="vd-sh-${esc(c.id)}">${esc(c.name)}</h2>
        <div class="vd-shelf-tools">
          <button type="button" class="vd-shelf-all" data-cat="${esc(c.id)}">
            See all ${items.length}</button>
          <span class="vd-arrows">
            <button type="button" class="vd-arrow" data-rail="${esc(c.id)}" data-dir="-1"
              aria-label="Scroll ${esc(c.name)} left" disabled>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>
            </button>
            <button type="button" class="vd-arrow" data-rail="${esc(c.id)}" data-dir="1"
              aria-label="Scroll ${esc(c.name)} right">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>
            </button>
          </span>
        </div>
      </div>
      <ul class="vd-rail" id="vd-rail-${esc(c.id)}" role="list">${items.map(card).join('')}</ul>
    </section>`;
  }

  function renderShelves() {
    $('#vd-grid').innerHTML = '';
    $('#vd-grid').hidden = true;
    $('#vd-shelves').innerHTML = DATA.categories.map(shelf).join('');
    $('#vd-shelves').hidden = false;
    /* Bound per rail rather than delegated: a scroll event does not bubble, and
       one listener up on the wrapper leaves the arrows painting whatever they
       said when the shelf was built. Position is read from scrollLeft and never
       counted, so a swipe, a trackpad flick and a click all leave the buttons
       telling the truth. Passive — this only paints two buttons. */
    $$('.vd-shelf').forEach((el) => {
      const track = $('.vd-rail', el);
      if (track) track.addEventListener('scroll', () => syncRail(el), { passive: true });
    });
    wireThumbs();
    syncRails();
  }

  function renderGrid(items) {
    $('#vd-shelves').innerHTML = '';
    $('#vd-shelves').hidden = true;
    $('#vd-grid').innerHTML = items.map(card).join('');
    $('#vd-grid').hidden = false;
    wireThumbs();
  }

  /* ---------- Rail geometry ----------
     A whole card-widths' worth of what is on screen, so the half-visible card at
     the edge becomes the first full one after a click and nothing is scrolled
     past unseen. Measured off a real card rather than computed from the CSS
     width, which would have to be kept in step by hand across the breakpoints. */
  function railStep(track) {
    const c = $('.vd-card', track);
    if (!c) return track.clientWidth;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const step = c.getBoundingClientRect().width + gap;
    return step * Math.max(1, Math.floor(track.clientWidth / step));
  }

  function syncRail(shelfEl) {
    const track = $('.vd-rail', shelfEl);
    if (!track) return;
    const max = track.scrollWidth - track.clientWidth;
    const at = track.scrollLeft;
    shelfEl.classList.toggle('is-static', max < 2);
    const arrows = $$('.vd-arrow', shelfEl);
    if (arrows[0]) arrows[0].disabled = at <= 1;
    if (arrows[1]) arrows[1].disabled = at >= max - 1;
  }

  /* One read pass, then one write pass: interleaving them across seven shelves
     is seven forced layouts. */
  function syncRails() {
    const shelves = $$('.vd-shelf');
    const m = shelves.map((el) => {
      const t = $('.vd-rail', el);
      return t ? { max: t.scrollWidth - t.clientWidth, at: t.scrollLeft } : null;
    });
    shelves.forEach((el, i) => {
      if (!m[i]) return;
      el.classList.toggle('is-static', m[i].max < 2);
      const a = $$('.vd-arrow', el);
      if (a[0]) a[0].disabled = m[i].at <= 1;
      if (a[1]) a[1].disabled = m[i].at >= m[i].max - 1;
    });
  }

  function wireThumbs() {
    /* maxresdefault is the one thumbnail size YouTube does not guarantee, and at
       seventy videos two of them do not have it (the Jay Feather Air 19MBS and
       the Jay Flight 250BH reviews).

       THE SIZE IS THE TELL, NOT AN ERROR. i.ytimg.com answers a missing
       thumbnail with 404 AND a real 120x90 grey placeholder in the body — so
       the image LOADS, and the error handler this used to rely on alone never
       ran. It was right for eleven videos that all had one and silently wrong
       for the two that do not.

       hqdefault rather than mqdefault as the fallback: 480x360 always exists,
       and the card is wider than mqdefault's 320. */
    const swap = (img) => {
      if (!img.dataset.fallback) return;
      img.src = img.dataset.fallback;
      img.dataset.fallback = '';
    };
    $$('.vd-thumb-img').forEach((img) => {
      img.addEventListener('error', () => swap(img));
      img.addEventListener('load', () => { if (img.naturalWidth <= 120) swap(img); });
      /* A cached thumbnail can be done loading before this runs. */
      if (img.complete && img.naturalWidth && img.naturalWidth <= 120) swap(img);
    });
  }

  function applyFilter() {
    const shown = DATA.items.filter(matches);
    if (filter) renderGrid(shown); else renderShelves();

    $('#vd-count').textContent = filter
      ? shown.length + ' in ' + catName(filter)
      : 'All ' + DATA.items.length + ' videos';
    $('#vd-empty').hidden = shown.length > 0;
    $$('.vd-cat').forEach((b) => {
      const on = b.dataset.cat === filter;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    /* Switching views REPLACES the cards, so whatever held focus is gone from
       the document and focus has fallen to <body> — which teleports a keyboard
       user to the top of the page. Park it on the count instead: it is the live
       region, so the new total is announced at the same moment. Not on the first
       paint, where nothing has been chosen yet and stealing focus would fight
       the reader. */
    const a = document.activeElement;
    if (booted && (!a || a === document.body)) $('#vd-count').focus({ preventScroll: true });
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
    /* Delegated on the wrapper rather than on the grid, because the cards move
       between two containers that are rebuilt under it. */
    $('.vd-grid-wrap').addEventListener('click', (e) => {
      const b = e.target.closest('.vd-card-btn');
      if (b) { play(b.dataset.video, b); return; }

      /* A shelf heading's "See all" is the same act as its chip. */
      const all = e.target.closest('.vd-shelf-all');
      if (all) {
        filter = all.dataset.cat;
        applyFilter();
        $('#vd-count').focus({ preventScroll: true });
        return;
      }

      const arrow = e.target.closest('.vd-arrow');
      if (arrow) {
        const track = $('#vd-rail-' + arrow.dataset.rail);
        if (track) {
          track.scrollBy({ left: Number(arrow.dataset.dir) * railStep(track),
            behavior: reduceMotion ? 'auto' : 'smooth' });
        }
      }
    });

    /* One rAF-debounced resize for all seven rails, not one listener each. */
    let rq = 0;
    window.addEventListener('resize', () => {
      if (rq) return;
      rq = requestAnimationFrame(() => { rq = 0; syncRails(); });
    });
    $('#vd-player').addEventListener('click', (e) => { if (e.target.dataset.vdClose) close(); });
    $('#vd-player-x').addEventListener('click', close);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && open()) { e.stopPropagation(); close(); return; }
      trapTab(e);
    });
  }

  renderCats();
  wire();
  applyFilter();
  booted = true;
  /* A rail measured before its thumbnails land measures wrong. */
  window.addEventListener('load', syncRails, { once: true });
}());

/* ===================================================
   Page motion — hero parallax
   ---------------------------------------------------
   Ported from initHeroParallax() in blog.js. The travel
   is READ FROM THE CSS rather than written twice: the
   --vd-drift token sets both the negative inset on
   .vd-hero-media and the distance moved here, so the
   plate cannot travel further than its own overhang and
   pull a bare edge into the frame.

   'top top', not 'top bottom'. The hero is already on
   screen when the page loads, so a start of 'top bottom'
   is a point it is long past — the plate would jump to
   mid-travel on the first scroll rather than beginning
   at rest.

   scrub true and ease 'none' so it tracks the scrollbar
   rather than performing.

   Under prefers-reduced-motion the stylesheet sets the
   token to 0% and this returns before binding, which is
   one code path rather than two.
   =================================================== */
(function () {
  'use strict';

  function initHeroParallax() {
    if (typeof window.gsap === 'undefined' || typeof window.ScrollTrigger === 'undefined') return;
    const page = document.querySelector('.videos-page');
    const media = document.querySelector('.vd-hero-media');
    const hero = document.querySelector('.vd-hero');
    if (!page || !media || !hero) return;

    const px = parseFloat(getComputedStyle(page).getPropertyValue('--vd-drift')) || 0;
    if (!px) return;

    window.gsap.fromTo(media, { yPercent: -px / 2 }, {
      yPercent: px / 2, ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
    });
  }

  if (window.gsap && window.ScrollTrigger) initHeroParallax();
  else document.addEventListener('jayco:animations-ready', initHeroParallax, { once: true });
}());
