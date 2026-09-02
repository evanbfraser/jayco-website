/* ===================================================
   Jayco — Owner stories
   ---------------------------------------------------
   Renders js/testimonial-data.js and nothing else. No
   filtering, no sorting, no paging: nine cards is a
   wall you read, not a set you narrow, and a control
   over nine items is chrome pretending to be a feature.

   Every card prints its attribution — name, coach,
   place, year — and links to the jayco.com story it
   came from. That link is not decoration. PRODUCT.md
   forbids inventing testimonials, and a quote whose
   source a reader can open is the only version of this
   page that can prove it did not.
   =================================================== */

(function () {
  'use strict';

  const DATA = window.JAYCO_STORIES;
  const $ = (s, c) => (c || document).querySelector(s);
  if (!DATA || !DATA.items || !DATA.items.length) return;

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* The attribution line under a quote: coach, place and year, whichever of
     them the source actually gave. Joined with a middot the way every other
     meta line on this site is. */
  function meta(it) {
    return [it.model, it.place, it.year].filter(Boolean).map(esc).join(' · ');
  }

  /* A <blockquote> with the attribution in a <figcaption> outside it, which is
     the pairing the spec asks for — the caption is about the quote, not part of
     what was said. `cite` carries the source URL for anything reading the
     markup rather than the page. */
  function card(it) {
    return `<li class="tm-card">
      <figure class="tm-figure">
        <span class="tm-mark" aria-hidden="true">&ldquo;</span>
        <blockquote class="tm-quote" cite="${esc(it.source)}">
          <p>${esc(it.quote)}</p>
        </blockquote>
        <figcaption class="tm-attrib">
          <span class="tm-name">${esc(it.name)}</span>
          ${meta(it) ? `<span class="tm-meta">${meta(it)}</span>` : ''}
          ${it.note ? `<span class="tm-note-line">${esc(it.note)}</span>` : ''}
          <a class="tm-src" href="${esc(it.source)}" target="_blank" rel="noopener noreferrer"
             aria-label="Read ${esc(it.name)}&#39;s full story on jayco.com — opens in a new tab">
            Read the full story
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M7 17L17 7M9 7h8v8"/></svg>
          </a>
        </figcaption>
      </figure>
    </li>`;
  }

  $('#tm-grid').innerHTML = DATA.items.map(card).join('');

  /* Voices and households are different numbers — the Brewers answered
     separately, so they are two cards and one family. Both are counted from the
     data rather than written into the markup, where the first version of this
     line went stale within the hour. */
  const WORDS = ['no', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven',
    'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve'];
  const say = (n) => WORDS[n] || String(n);

  const homes = new Set(DATA.items.map((it) => it.family || it.name)).size;
  const label = $('#tm-hero-count');
  if (label) {
    label.textContent = DATA.items.length === homes
      ? say(homes) + ' owners,'
      : say(DATA.items.length) + ' owners, ' + say(homes).toLowerCase() + ' families,';
  }
}());

/* ===================================================
   Recent reviews — the carousel
   ---------------------------------------------------
   Its own IIFE, not appended to the block above: that
   one returns early when JAYCO_STORIES is missing, and
   the reviews should not disappear with the stories.

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
   Owner gallery — the drifting mosaic
   ---------------------------------------------------
   Tiles are laid into a grid with varying spans, then
   the COLUMNS drift at slightly different rates as the
   section passes. DESIGN.md sets the magnitude: "media
   scrubs linearly across its pass through the viewport
   at small magnitudes — 6% drift". Bigger than that and
   a mosaic starts to shear.

   Everything is gsap.from(), never gsap.to(): the
   resting state is the visible one, so if GSAP fails to
   load the gallery is simply a static mosaic rather
   than 28 invisible tiles.
   =================================================== */
(function () {
  'use strict';

  const G = window.JAYCO_GALLERY;
  const mount = document.querySelector('#tm-gal');
  if (!G || !G.items || !G.items.length || !mount) return;

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* A repeating rhythm of tile shapes rather than random sizing: random reflows
     on every load and cannot be designed against. Six shapes over four columns
     never lines up into an obvious band. */
  const SHAPE = ['tall', 'wide', 'std', 'std', 'tall', 'std', 'std', 'wide'];

  mount.innerHTML = G.items.map((it, i) => `
    <figure class="tm-gal-tile is-${SHAPE[i % SHAPE.length]}" data-col="${i % 4}">
      <img src="${esc(G.base + it.slug)}-900.webp"
           srcset="${esc(G.base + it.slug)}-900.webp 900w, ${esc(G.base + it.slug)}-1500.webp 1500w"
           sizes="(max-width: 700px) 92vw, (max-width: 1100px) 46vw, 30vw"
           alt="${esc(it.alt)}" width="900" height="600"
           loading="lazy" decoding="async" />
    </figure>`).join('');

  function animate() {
    const gsap = window.gsap;
    if (!gsap || !window.ScrollTrigger) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const tiles = Array.from(mount.querySelectorAll('.tm-gal-tile'));

    /* Arrival. Batched so 28 tiles are one handful of triggers rather than 28,
       and start:'top 92%' so a tile is already moving before it is fully in. */
    window.ScrollTrigger.batch(tiles, {
      start: 'top 92%',
      onEnter: (batch) => gsap.from(batch, {
        y: 34, opacity: 0, duration: 0.7, ease: 'power2.out',
        stagger: 0.06, overwrite: true,
      }),
    });

    /* The drift. Columns 1 and 3 rise a little faster than 0 and 2 — the
       difference is the effect; a uniform drift just moves the whole block. */
    if (window.innerWidth > 700) {
      tiles.forEach((t) => {
        const col = +t.dataset.col;
        const shift = [0, -6, -2, -5][col] || 0;
        if (!shift) return;
        gsap.to(t, {
          yPercent: shift, ease: 'none',
          scrollTrigger: { trigger: mount, start: 'top bottom', end: 'bottom top', scrub: true },
        });
      });
    }
  }

  if (window.gsap && window.ScrollTrigger) animate();
  else document.addEventListener('jayco:animations-ready', animate, { once: true });
}());
