/* ===================================================
   Jayco — Top-selling RVs (top-selling.html)
   ---------------------------------------------------
   Renders js/top-selling-data.js: three model years,
   each grouped by product type, each model a render, a
   Learn More and a sales sheet.

   THE YEAR IS A TABLIST, NOT THREE PAGES. The panes are
   the same page seen three ways, and a reader comparing
   the 2027 Pinnacle sheet with the 2025 one should not
   lose their place in the list to a navigation. All
   three panes are built once and shown by turns —
   there are 51 rows in total, which is cheap, and it
   means switching years cannot flash.

   The tab pattern is the one model.html's spec tabs
   already use here: roving tabindex, arrows move,
   aria-selected says which is live.
   =================================================== */

(function () {
  'use strict';

  const DATA = window.JAYCO_TOP_SELLING;
  const JAYCO = window.JAYCO || { models: {} };
  if (!DATA || !DATA.years || !DATA.years.length) return;

  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.prototype.slice.call((c || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const ART = '../assets/top-selling/';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Learn More goes to the model's own page where this site carries it, and to
     the product type otherwise — see the note in top-selling-data.js. NOT
     app.js's exploreHref, which tests JAYCO_MODEL_DETAIL: that object is only
     loaded by model.html, so here it is empty and every model would fall
     through to its category. videos.js already paid for that bug. */
  function learnHref(m, groupId) {
    const d = window.JAYCO_MODEL_DETAIL;
    if (m.slug) {
      const has = (d && d[m.slug]) ? !d[m.slug].stub
        : (window.JAYCO_MODEL_PAGES || []).indexOf(m.slug) >= 0;
      if (has) return 'model.html?model=' + encodeURIComponent(m.slug);
      const model = JAYCO.models[m.slug];
      if (model) return 'type.html?type=' + encodeURIComponent(model.category);
    }
    return 'type.html?type=' + encodeURIComponent(groupId);
  }

  /* The card is type.css's .tp-model-card, ported and renamed: Surface panel,
     the name in the display face, the tagline on its blue rule, the cut-out
     standing on the panel and three specs ruled across the foot. The house rule
     is port, rename, and name the source — a reader who greps .ts-card finds
     one owner, and a change to the type page's card is not silently a change
     to this one.

     TWO DIFFERENCES, BOTH DELIBERATE. There is no price: it moves with options,
     destination and dealer, and a number on a card that Build & Price would
     contradict is worse than no number. And the card is not itself a link —
     it ends in two buttons that go to different places, and a link wrapping
     two links is not a thing a browser will render. */
  function card(m, groupId, year) {
    const model = m.slug ? JAYCO.models[m.slug] : null;
    const specs = (model && model.specs) || {};
    const stats = Object.keys(specs).slice(0, 3).map((k) => `
      <div class="ts-card-stat">
        <span class="ts-card-stat-value">${esc(specs[k])}</span>
        <span class="ts-card-stat-label">${esc(k)}</span>
      </div>`).join('');

    /* The sheet opens in a new tab rather than navigating: a PDF that replaces
       the page leaves the reader in a viewer with no way back to the list they
       were working through. download= names the file something meaningful when
       they save it, rather than 41-Jay-Feather-Air.pdf. */
    const file = ART + 'sheets/' + m.key + '.pdf';
    return `<li class="ts-card">
      <h4 class="ts-card-name">${esc(m.name)}</h4>
      ${model && model.tagline ? `<p class="ts-card-tagline">${esc(model.tagline)}</p>` : ''}
      <div class="ts-card-media">
        <!-- No width/height attributes: these renders are a mix of 3:2 and 16:9
             and a pair of numbers here would be wrong for half of them. The box
             around it carries the ratio instead, so nothing shifts as they
             load. -->
        <img class="ts-card-img" src="${esc(ART + 'web/' + m.key + '.webp')}" alt=""
             loading="lazy" decoding="async" />
      </div>
      ${stats ? `<div class="ts-card-stats">${stats}</div>` : ''}
      <div class="ts-card-actions">
        <a class="btn-secondary-light ts-learn" href="${esc(learnHref(m, groupId))}">Learn More</a>
        <a class="btn-primary ts-sheet" href="${esc(file)}"
           download="Jayco-${esc(m.name.replace(/[^A-Za-z0-9]+/g, '-'))}-${esc(year)}-Sales-Sheet.pdf"
           target="_blank" rel="noopener">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 3v12"/><path d="M7 12l5 5 5-5"/><path d="M4 21h16"/>
          </svg>
          <span>Download Sales Sheet</span>
        </a>
      </div>
    </li>`;
  }

  /* Each product type is a RAIL, not a grid: Class C runs to six models in
     every year and a grid of six 400px cards is two rows that read as two
     groups. The rail is the site's own card-rail idiom (the floorplans catalog,
     the type page's feature rails) — the track scrolls, the arrows are geometry
     read off scrollLeft rather than a counter, so a swipe, a trackpad flick and
     a click all leave the buttons telling the truth. */
  function group(g, year) {
    const rail = 'ts-rail-' + year + '-' + g.id;
    return `<section class="ts-group" aria-labelledby="ts-g-${esc(year)}-${esc(g.id)}">
      <div class="ts-group-head">
        <h3 class="ts-group-h" id="ts-g-${esc(year)}-${esc(g.id)}">${esc(g.cat)}</h3>
        <span class="ts-arrows">
          <button type="button" class="ts-arrow" data-rail="${esc(rail)}" data-dir="-1"
            aria-label="Scroll ${esc(g.cat)} left" disabled>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
              aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>
          </button>
          <button type="button" class="ts-arrow" data-rail="${esc(rail)}" data-dir="1"
            aria-label="Scroll ${esc(g.cat)} right">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
              aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>
          </button>
        </span>
      </div>
      <ul class="ts-rail" id="${esc(rail)}" role="list">${g.models.map((m) => card(m, g.id, year)).join('')}</ul>
    </section>`;
  }

  function pane(y, i) {
    return `<div class="ts-pane" id="ts-pane-${esc(y.year)}" role="tabpanel"
      aria-labelledby="ts-tab-${esc(y.year)}" tabindex="0"${i ? ' hidden' : ''}>
      ${y.groups.map((g) => group(g, y.year)).join('')}
    </div>`;
  }

  /* ---------- Rail geometry ----------
     A whole card-widths' worth of what is on screen, so the half-visible card
     at the edge becomes the first full one after a click and nothing is
     scrolled past unseen. Measured off a real card rather than computed from
     the CSS width, which would have to be kept in step by hand across the
     breakpoints. */
  function railStep(track) {
    const c = $('.ts-card', track);
    if (!c) return track.clientWidth;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const step = c.getBoundingClientRect().width + gap;
    return step * Math.max(1, Math.floor(track.clientWidth / step));
  }

  function syncRail(sec) {
    const track = $('.ts-rail', sec);
    if (!track) return;
    const max = track.scrollWidth - track.clientWidth;
    const at = track.scrollLeft;
    sec.classList.toggle('is-static', max < 2);
    const a = $$('.ts-arrow', sec);
    if (a[0]) a[0].disabled = at <= 1;
    if (a[1]) a[1].disabled = at >= max - 1;
  }

  /* One read pass, then one write pass: interleaving them across every rail on
     a pane is a forced layout per rail. */
  function syncRails() {
    const secs = $$('.ts-pane:not([hidden]) .ts-group');
    const m = secs.map((sec) => {
      const t = $('.ts-rail', sec);
      return t ? { max: t.scrollWidth - t.clientWidth, at: t.scrollLeft } : null;
    });
    secs.forEach((sec, i) => {
      if (!m[i]) return;
      sec.classList.toggle('is-static', m[i].max < 2);
      const a = $$('.ts-arrow', sec);
      if (a[0]) a[0].disabled = m[i].at <= 1;
      if (a[1]) a[1].disabled = m[i].at >= m[i].max - 1;
    });
  }

  /* ---------- Reading ----------
     Three posts named in top-selling-data.js, resolved against the blog index
     so their titles, dates, standfirsts and pictures have one copy on this site
     and follow the archive if it ever changes.

     NAMED, NOT MATCHED. This was a rule — the newest of the blog's Shopping
     Tips topic, narrowed to the ones actually about buying — and the rule was
     the problem: that topic has not been added to since July 2024, so a page
     about the current model year carried three two-year-old cards. Jayco files
     its recent buying advice under Ambassador, Why Buy Jayco and Product
     Features instead, which no single-topic rule reaches. Currency won over
     tidiness, and the three are listed by hand.

     A slug that is not in the index is skipped rather than drawn as a broken
     card, and the section removes itself if fewer than three survive — or if
     the blog index is not loaded at all. */
  function reading() {
    const BLOG = window.JAYCO_BLOG;
    const sec = $('#ts-reading');
    if (!sec || !BLOG || !BLOG.posts || !DATA.reading) return;
    const posts = DATA.reading
      .map((slug) => BLOG.posts.find((p) => p.slug === slug))
      .filter(Boolean);
    if (posts.length < 3) return;

    /* The archive's own title rule, borrowed rather than restated — 59 of
       Jayco's post titles are in capitals and this page prints three of them.
       blog-ui.js owns it; if that file is ever not loaded here the titles fall
       back to Jayco's own text rather than breaking. */
    const UI = window.JAYCO_BLOG_UI;
    const title = (p) => (UI && UI.displayTitle ? UI.displayTitle(p.title) : p.title);
    const img = (slug) => '../assets/blog/web/' + slug;
    /* Both widths offered, the way the archive's own cards do it: a card is
       about 420px wide here, which the 400 covers exactly once and at half the
       resolution any 2x screen wants. */
    const SIZES = '(max-width: 768px) 92vw, (max-width: 1023px) 46vw, 31vw';
    $('#ts-reading-grid').innerHTML = posts.map((p) => `<li class="ts-read">
      <a class="ts-read-link" href="blog-post.html?post=${encodeURIComponent(p.slug)}">
        <span class="ts-read-media">
          <img class="ts-read-img" src="${esc(img(p.slug) + '-400.webp')}"
               srcset="${esc(img(p.slug) + '-400.webp 400w, ' + img(p.slug) + '-1000.webp 1000w')}"
               sizes="${esc(SIZES)}" alt=""
               width="400" height="225" loading="lazy" decoding="async" />
        </span>
        <span class="ts-read-date">${esc(p.date)}</span>
        <h3 class="ts-read-title">${esc(title(p))}</h3>
        <p class="ts-read-excerpt">${esc(p.excerpt)}</p>
        <span class="ts-read-more">Learn More
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M7 17L17 7"/><path d="M8 7h9v9"/>
          </svg>
        </span>
      </a>
    </li>`).join('');

    $$('.ts-read-img').forEach((el) => {
      el.addEventListener('error', function () {
        const m = this.closest('.ts-read-media');
        if (m) m.remove();
      }, { once: true });
    });
    sec.hidden = false;
  }

  /* ---------- Hero parallax ----------
     The page's one authored motion moment, which DESIGN.md allows exactly one
     of. Small and linear — ease 'none' and scrub true, so it tracks the
     scrollbar rather than performing. The travel is read from --ts-drift so the
     CSS owns the headroom and the JS cannot drift further than the media
     overhangs, which is what stops a bare edge appearing at the top or bottom
     of the band. Under prefers-reduced-motion the CSS sets that to 0 and the
     guard below leaves the picture where it sits. */
  function initParallax() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    const media = $('.ts-hero-media');
    const hero = $('.ts-hero');
    if (!media || !hero) return;
    const drift = parseFloat(getComputedStyle(document.querySelector('.ts-page'))
      .getPropertyValue('--ts-drift')) || 0;
    if (!drift) return;
    gsap.fromTo(media, { yPercent: -drift / 2 }, {
      yPercent: drift / 2,
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
    });
  }

  function render() {
    $('#ts-tabs').innerHTML = DATA.years.map((y, i) =>
      `<button type="button" class="ts-tab${i ? '' : ' is-on'}" id="ts-tab-${esc(y.year)}"
        role="tab" aria-selected="${i ? 'false' : 'true'}"
        aria-controls="ts-pane-${esc(y.year)}" tabindex="${i ? '-1' : '0'}"
        data-year="${esc(y.year)}">${esc(y.year)}</button>`).join('');
    $('#ts-panes').innerHTML = DATA.years.map(pane).join('');

    /* A render that never arrives leaves a card with a hole where the coach
       should be; the name and both buttons still do their job without it. */
    $$('.ts-card-img').forEach((img) => {
      img.addEventListener('error', function () {
        const m = this.closest('.ts-card-media');
        if (m) m.remove();
      }, { once: true });
    });

    /* Bound per rail rather than delegated: a scroll event does not bubble, and
       one listener on an ancestor would leave the arrows painting whatever they
       said when the pane was built. Passive — this only paints two buttons. */
    $$('.ts-group').forEach((sec) => {
      const track = $('.ts-rail', sec);
      if (track) track.addEventListener('scroll', () => syncRail(sec), { passive: true });
    });
    syncRails();
  }

  function show(year) {
    DATA.years.forEach((y) => {
      const on = y.year === year;
      const tab = $('#ts-tab-' + y.year);
      const p = $('#ts-pane-' + y.year);
      tab.classList.toggle('is-on', on);
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
      tab.tabIndex = on ? 0 : -1;
      p.hidden = !on;
    });
    /* Swapping panes changes the document height, and every ScrollTrigger on
       the page caches its start against the old layout — the footer's reveal is
       a gsap.from(opacity:0) and would stay invisible. */
    /* The new pane's rails have never been measured — they were built inside a
       hidden box, where scrollWidth and clientWidth are both 0. */
    requestAnimationFrame(syncRails);
    if (window.ScrollTrigger) requestAnimationFrame(() => window.ScrollTrigger.refresh());
  }

  function wire() {
    /* Delegated on the panes wrapper: the arrows live inside three panes that
       are shown by turns. */
    $('#ts-panes').addEventListener('click', (e) => {
      const arrow = e.target.closest('.ts-arrow');
      if (!arrow) return;
      const track = document.getElementById(arrow.dataset.rail);
      if (!track) return;
      track.scrollBy({ left: Number(arrow.dataset.dir) * railStep(track),
        behavior: reduceMotion ? 'auto' : 'smooth' });
    });

    /* One rAF-debounced resize for every rail, not one listener each. */
    let rq = 0;
    window.addEventListener('resize', () => {
      if (rq) return;
      rq = requestAnimationFrame(() => { rq = 0; syncRails(); });
    });

    const tabs = $('#ts-tabs');
    tabs.addEventListener('click', (e) => {
      const b = e.target.closest('.ts-tab');
      if (b) show(b.dataset.year);
    });
    /* Arrows move between years and take focus with them, which is what a
       tablist is expected to do; Home and End jump to the ends. */
    tabs.addEventListener('keydown', (e) => {
      const list = $$('.ts-tab');
      const at = list.indexOf(document.activeElement);
      if (at < 0) return;
      let next = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = list[(at + 1) % list.length];
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = list[(at - 1 + list.length) % list.length];
      else if (e.key === 'Home') next = list[0];
      else if (e.key === 'End') next = list[list.length - 1];
      else return;
      e.preventDefault();
      show(next.dataset.year);
      next.focus();
    });
  }

  render();
  reading();
  wire();
  /* A rail measured before its renders land measures wrong. */
  window.addEventListener('load', syncRails, { once: true });
  document.addEventListener('jayco:animations-ready', initParallax, { once: true });
}());
