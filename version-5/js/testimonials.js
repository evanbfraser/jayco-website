/* ===================================================
   Jayco — testimonials page
   ---------------------------------------------------
   Two blocks: the review carousel and the photograph
   strip. The long-form owner-story grid this page used
   to carry was removed; JAYCO_STORIES is still in
   js/testimonial-data.js with its provenance intact, in
   case it comes back, but nothing renders it now.
   =================================================== */

/* ===================================================
   Recent reviews — the carousel
   ---------------------------------------------------
   Geometry ported from floorplans.js's card rails.
   Position is read from scrollLeft rather than kept in
   a counter, so a swipe, a trackpad flick and the
   arrows all leave the progress bar telling the truth.
   =================================================== */
(function () {
  'use strict';

  const DATA = window.JAYCO_REVIEWS;
  const $ = (s, c) => (c || document).querySelector(s);
  const track = $('#tm-rev-track');
  if (!DATA || !DATA.items || !DATA.items.length || !track) return;

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* Relative, because "3 days ago" is what the reference reads like and what a
     reviews block is usually saying. The exact date rides along in <time
     datetime> so the real value is never lost — and anything older than a month
     prints as a date, since "47 days ago" is arithmetic, not information. */
  function when(iso) {
    const then = new Date(iso + 'T12:00:00'), now = new Date();
    const days = Math.round((now - then) / 86400000);
    if (!isFinite(days)) return '';
    if (days <= 0) return 'today';
    if (days === 1) return '1 day ago';
    if (days < 7) return days + ' days ago';
    if (days < 14) return '1 week ago';
    if (days < 31) return Math.floor(days / 7) + ' weeks ago';
    return then.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }

  /* No avatar photographs. The widget these come from shows each reviewer's
     Google profile picture, hotlinked from googleusercontent.com — not ours to
     re-serve, and it would break the moment someone changed theirs. A monogram
     is what that widget itself falls back to. */
  const initial = (name) => (name || '?').trim().charAt(0).toUpperCase();

  const stars = (n) =>
    `<span class="tm-rev-stars" role="img" aria-label="${n} out of 5 stars">` +
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2z"/></svg>'
      .repeat(Math.max(0, Math.min(5, n))) + '</span>';

  const card = (r, i) => `
    <li class="tm-rev-card">
      <blockquote class="tm-rev-bubble">
        <p class="tm-rev-quote">${esc(r.quote)}</p>
        ${stars(r.stars)}
      </blockquote>
      <figcaption class="tm-rev-who">
        <span class="tm-rev-avatar" data-i="${i % 6}" aria-hidden="true">${esc(initial(r.name))}</span>
        <span class="tm-rev-meta">
          <span class="tm-rev-name">${esc(r.name)}</span>
          <time class="tm-rev-when" datetime="${esc(r.date)}">${esc(when(r.date))}</time>
        </span>
      </figcaption>
    </li>`;

  track.innerHTML = DATA.items.map(card).join('');

  /* The hero tagline's count. Written from the data rather than typed into the
     markup, where it went stale once already — and it had to move here when the
     owner-story grid that used to own it was removed. */
  const WORDS = ['no', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven',
    'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve'];
  const label = $('#tm-hero-count');
  if (label) {
    const n = DATA.items.length;
    label.textContent = (WORDS[n] || String(n)) + (n === 1 ? ' owner' : ' owners');
  }

  const bar = $('#tm-rev-bar');
  const navs = Array.from(document.querySelectorAll('[data-rev-dir]'));

  function step() {
    const c = $('.tm-rev-card', track);
    if (!c) return track.clientWidth;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return c.getBoundingClientRect().width + gap;
  }
  /* A whole card-widths' worth of what is on screen, so the partly-visible card
     at the edge becomes the first fully-visible one after a click. */
  function page() {
    const st = step();
    return st ? st * Math.max(1, Math.floor(track.clientWidth / st)) : track.clientWidth;
  }

  function sync() {
    const max = track.scrollWidth - track.clientWidth;
    const p = max > 2 ? track.scrollLeft / max : 0;
    if (bar) bar.style.transform = 'scaleX(' + (0.12 + p * 0.88).toFixed(4) + ')';
    navs.forEach((b) => {
      b.disabled = max <= 2 ||
        (b.dataset.revDir === 'prev' ? track.scrollLeft < 4 : track.scrollLeft >= max - 4);
    });
  }

  navs.forEach((b) => b.addEventListener('click', () => {
    track.scrollBy({ left: (b.dataset.revDir === 'next' ? 1 : -1) * page(), behavior: 'smooth' });
  }));
  track.addEventListener('scroll', () => requestAnimationFrame(sync), { passive: true });
  window.addEventListener('resize', () => requestAnimationFrame(sync));
  requestAnimationFrame(sync);
}());

/* ===================================================
   Owner gallery — the expanding strip
   ---------------------------------------------------
   One photograph open, the rest held as narrow pills,
   advancing on its own.

   Width is animated through flex-grow rather than a
   width in px: the panels have to share whatever the
   container is, and a px width would need recomputing
   on every resize.

   28 photographs will not fit as pills at a readable
   size, so the strip scrolls and the active panel is
   kept in view. It reads as a filmstrip advancing
   rather than a set that has overflowed.
   =================================================== */
(function () {
  'use strict';

  const G = window.JAYCO_GALLERY;
  const strip = document.querySelector('#tm-gal');
  if (!G || !G.items || !G.items.length || !strip) return;

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const HOLD = 3000;

  strip.innerHTML = G.items.map((it, i) => `
    <button type="button" class="tm-gal-panel${i === 0 ? ' is-open' : ''}"
            data-i="${i}" aria-pressed="${i === 0 ? 'true' : 'false'}">
      <img src="${esc(G.base + it.slug)}-900.webp"
           srcset="${esc(G.base + it.slug)}-900.webp 900w, ${esc(G.base + it.slug)}-1500.webp 1500w"
           sizes="(max-width: 700px) 90vw, 60vw"
           alt="${esc(it.alt)}" width="900" height="600"
           loading="${i < 4 ? 'eager' : 'lazy'}" decoding="async" />
    </button>`).join('');

  const panels = Array.from(strip.querySelectorAll('.tm-gal-panel'));
  let at = 0, timer = null, stopped = false;

  /* One pill plus one gap — the distance the strip moves per step.

     CACHED, and measured only while nothing is animating. Measuring it inside
     show() reads whichever panel is mid-shrink from its open width, which sent
     the strip 1,800px past the mark. Refreshed on resize, where the clamp on
     the pill width can land somewhere new. */
  let STRIDE = 0;
  function measure() {
    const closed = panels.find((p) => !p.classList.contains('is-open'));
    const gap = parseFloat(getComputedStyle(strip).columnGap) || 0;
    if (closed) STRIDE = closed.getBoundingClientRect().width + gap;
  }
  const stride = () => STRIDE || 0;
  measure();
  window.addEventListener('resize', () => { measure(); show(at); });

  function show(i, scroll) {
    at = (i + panels.length) % panels.length;
    panels.forEach((p, n) => {
      const on = n === at;
      p.classList.toggle('is-open', on);
      p.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    if (scroll === false) return;
    /* LEFT-aligned to the page gutter, not centred: the reference puts the open
       photograph at the left with the pills running off to its right, and
       centring also left the open panel flush to the viewport edge, out of line
       with the heading above it.

       scrollTo on the strip, never scrollIntoView — that would scroll the PAGE
       to the strip as well, dragging the reader down the document every few
       seconds while it advances. */
    /* Computed, not measured. offsetLeft is the layout as it stands RIGHT NOW,
       and right now the previous panel is still 760px wide and shrinking over
       0.62s — so reading it scrolls to where the panel used to be and lands
       hundreds of pixels out. Every panel before the open one is a pill, so the
       position it is arriving at is arithmetic. */
    strip.scrollTo({ left: Math.max(0, at * stride()),
                     behavior: reduced.matches ? 'auto' : 'smooth' });
  }

  function tick() { show(at + 1); }
  function play() {
    if (stopped || reduced.matches) return;
    clearInterval(timer); timer = setInterval(tick, HOLD);
  }
  function pause() { clearInterval(timer); timer = null; }

  strip.addEventListener('click', (e) => {
    const b = e.target.closest('.tm-gal-panel');
    if (b) show(+b.dataset.i);
  });

  /* Arrow keys move between panels the way a row of related controls should. */
  strip.addEventListener('keydown', (e) => {
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    show(at + d);
    panels[at].focus();
  });

  /* Pause while someone is looking at or tabbing through it. Not a substitute
     for the button — a pointer user who wants it still should not have to keep
     the cursor parked on it — but it stops the strip moving under a click. */
  ['mouseenter', 'focusin'].forEach((ev) => strip.addEventListener(ev, pause));
  ['mouseleave', 'focusout'].forEach((ev) => strip.addEventListener(ev, () => {
    if (!strip.matches(':hover') && !strip.contains(document.activeElement)) play();
  }));

  const btn = document.querySelector('#tm-gal-pause');

  /* The arrows do what clicking a pill does, and they also STOP the auto-run.
     Someone reaching for a control is steering; having it carry on advancing
     under them two seconds later is the strip arguing back. */
  document.querySelectorAll('[data-gal-dir]').forEach((a) => {
    a.addEventListener('click', () => {
      show(at + (a.dataset.galDir === 'next' ? 1 : -1));
      if (!stopped && btn) btn.click();
    });
  });

  const btnLabel = document.querySelector('#tm-gal-pause-label');
  if (btn) {
    btn.addEventListener('click', () => {
      stopped = !stopped;
      btn.setAttribute('aria-pressed', stopped ? 'true' : 'false');
      btn.classList.toggle('is-paused', stopped);
      if (btnLabel) btnLabel.textContent = stopped ? 'Play' : 'Pause';
      if (stopped) pause(); else play();
    });
  }

  /* Under reduced motion the strip does not advance by itself at all, so the
     control would be a button that pauses nothing. */
  if (reduced.matches) {
    if (btn) btn.hidden = true;
  } else {
    play();
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pause(); else play();
  });

  show(0, false);
}());
