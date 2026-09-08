/* ===================================================
   Jayco — Our Story
   ---------------------------------------------------
   Builds the timeline from our-story-data.js and gives
   it three pieces of motion, all of them small:

     • the hero plate drifts, the way every hero on this
       site drifts;
     • the spine fills as you move down the run, so the
       page reports how far through the history you are;
     • each entry arrives once, as it reaches you.

   THE ARRIVALS ARE AN INTERSECTIONOBSERVER, NOT A
   SCROLLTRIGGER PER CARD. Thirty triggers would each
   cache a start against a layout that changes as the
   photographs load, and a stale one can spend its
   animation while the card is still off screen. An
   observer measures at the moment of crossing instead,
   and the stagger comes free: entries that cross
   together are one callback.

   THE SPINE IS THE ONE SCRUBBED THING, because it is
   the one thing that has to track the scrollbar rather
   than fire once.
   =================================================== */
(function () {
  const DATA = window.JAYCO_STORY;
  const track = document.getElementById('os-track');
  if (!DATA || !DATA.length || !track) return;

  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.prototype.slice.call((c || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- Build ----------
     A HORIZONTAL RAIL THE READER OPTS THROUGH, and nothing about it is forced.
     The page is never pinned and the vertical scroll is never hijacked: the
     rail is an ordinary horizontal scroller, and the run stops at the end of
     each decade with a card that ASKS whether to carry on. Say no and you have
     read the 1960s and moved on; say yes and the next decade is appended and
     the rail takes you to it.

     That is the whole point of the pattern. A scroll-jacked timeline decides
     for the reader how long they are going to spend on a company's history.
     This one lets them decide, a decade at a time. */
  const ERAS = [];
  DATA.forEach((m) => {
    if (!ERAS.length || ERAS[ERAS.length - 1].name !== m.era) ERAS.push({ name: m.era, items: [] });
    ERAS[ERAS.length - 1].items.push(m);
  });

  let shown = 1;                       /* how many decades have been asked for */

  const card = (m, i) => `
    <li class="os-item${m.big ? ' is-big' : ''}" data-i="${i}">
      <article class="os-card">
        ${m.img ? `<div class="os-card-media">
          <img class="os-card-img" src="../assets/our-story/web/${esc(m.img)}.webp"
               alt="${esc(m.alt || '')}" loading="lazy" decoding="async" />
        </div>` : ''}
        <div class="os-card-body">
          <span class="os-year">${esc(m.year)}</span>
          <h3 class="os-head">${esc(m.head)}</h3>
          <p class="os-body">${esc(m.body)}</p>
        </div>
      </article>
    </li>`;

  /* The ask. It names what comes next rather than saying "more", because
     "the 1980s" is a reason to carry on and "more" is not. */
  const ask = (next) => `
    <li class="os-ask">
      <div class="os-ask-in">
        <span class="os-ask-k">That is the ${esc(ERAS[shown - 1].name)}</span>
        <h3 class="os-ask-h">Keep going?</h3>
        <p class="os-ask-b">${esc(next.items.length)} more from the ${esc(next.name)}.</p>
        <button type="button" class="btn-primary os-ask-go">Continue to the ${esc(next.name)}</button>
      </div>
    </li>`;

  const end = () => `
    <li class="os-ask is-end">
      <div class="os-ask-in">
        <span class="os-ask-k">2021</span>
        <h3 class="os-ask-h">That is all of it.</h3>
        <p class="os-ask-b">Fifty-eight years, from a folding camper to four divisions.</p>
        <a class="btn-primary" href="jayco-difference.html">What came out of it</a>
      </div>
    </li>`;

  function render() {
    let html = '<div class="os-topo" aria-hidden="true"></div>'
      + '<div class="os-rail" id="os-rail" tabindex="0" role="region"'
      + ' aria-label="Jayco history, scroll sideways">'
      + '<svg class="os-route" id="os-route" aria-hidden="true">'
      +   '<path class="os-route-base" id="os-route-base"/>'
      +   '<path class="os-route-trail" id="os-route-trail"/>'
      + '</svg>'
      + '<span class="os-dot" id="os-dot" aria-hidden="true"></span>'
      + '<ol class="os-list" id="os-list">';
    let n = 0;
    ERAS.slice(0, shown).forEach((era) => {
      html += `<li class="os-era"><span class="os-era-tag">${esc(era.name)}</span></li>`;
      era.items.forEach((m) => { html += card(m, n++); });
    });
    html += (shown < ERAS.length ? ask(ERAS[shown]) : end());
    track.innerHTML = html + '</ol></div>'
      + '<div class="os-nav">'
      +   '<span class="os-nav-at" id="os-nav-at" role="status" aria-live="polite"></span>'
      +   '<div class="os-nav-btns">'
      +     '<button type="button" class="os-arrow" data-dir="-1" aria-label="Scroll back">' + ARROW(-1) + '</button>'
      +     '<button type="button" class="os-arrow" data-dir="1" aria-label="Scroll on">' + ARROW(1) + '</button>'
      +   '</div>'
      + '</div>';
  }

  const ARROW = (d) => `<svg width="17" height="17" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"
      aria-hidden="true"><path d="${d < 0 ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'}"/></svg>`;

  /* ---------- The topographic ground ----------
     The tile height is pinned to a WHOLE PIXEL. Left to CSS, background-size:
     100% auto gives a fractional height, and a repeated background on a
     fractional boundary blends its anti-aliased edge row on every repeat, which
     draws a faint line across the map. Rounding removes the sub-pixel boundary;
     the aspect shifts by under two hundredths of a percent. */
  const TILE_W = 3035.3, TILE_H = 5383.9 * 2;   /* the mirrored pair */
  function sizeTopo() {
    const topo = $('.os-topo');
    if (!topo) return;
    const w = topo.clientWidth;
    if (!w) return;
    topo.style.backgroundSize = '100% ' + Math.round(w / TILE_W * TILE_H) + 'px';
  }

  /* ---------- The route ----------
     PORTED FROM initBuildJourney() IN version-3's app.js — a meandering line
     over a topographic ground with a lit dot running it. Turned on its side
     here: the run is horizontal, so the line crosses the rail and the dot is
     driven by the RAIL'S OWN scrollLeft rather than by the page. That is what
     keeps the page scroll free — nothing here reads window position at all.

     The wander uses a fixed factor table rather than Math.random: the path is
     rebuilt whenever the rail resizes, and a random one would redraw itself
     differently every time. */
  const FACTORS = [0.55, -0.85, 0.40, -0.65, 0.95, -0.50, 0.75,
                   -0.90, 0.60, -0.75, 0.85, -0.45, 0.70, -0.80];

  function smooth(pts) {
    if (pts.length < 3) return 'M ' + pts.map((q) => q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join(' L ');
    let d = 'M ' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1);
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || pts[i + 1];
      const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
      const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += ' C ' + c1x.toFixed(1) + ' ' + c1y.toFixed(1) + ' ' + c2x.toFixed(1) + ' '
         + c2y.toFixed(1) + ' ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1);
    }
    return d;
  }

  let routeLen = 0;

  function buildRoute() {
    const rail = $('#os-rail'), list = $('#os-list');
    const svg = $('#os-route'), base = $('#os-route-base'), trail = $('#os-route-trail');
    if (!rail || !list || !svg || !base) return;
    const W = list.scrollWidth, H = rail.clientHeight;
    if (!W || !H) return;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.style.width = W + 'px';
    const mid = H * 0.5, A = Math.min(H * 0.16, 90);
    let fi = 0;
    const next = () => FACTORS[(fi++) % FACTORS.length];

    const pts = [[0, mid]];
    /* THE ROUTE STOPS AT THE LAST ENTRY, not at the ask. The ask is the
       question at the end of the road, not another place on it — and running
       the line and the lit dot through a translucent card put both straight
       across its heading. */
    $$('.os-item, .os-era', list).forEach((el) => {
      const cx = el.offsetLeft + el.offsetWidth / 2;
      pts.push([cx - el.offsetWidth * 0.3, mid + next() * A]);
      pts.push([cx, mid + next() * A * 0.5]);
    });
    /* End where the entries end, so the dot never lands on the question. */
    const last = $$('.os-item', list).pop();
    pts.push([last ? last.offsetLeft + last.offsetWidth : W, mid]);

    const d = smooth(pts);
    base.setAttribute('d', d);
    trail.setAttribute('d', d);
    routeLen = base.getTotalLength();
    trail.style.strokeDasharray = routeLen;
    placeDot();
  }

  function placeDot() {
    const rail = $('#os-rail'), base = $('#os-route-base'),
          trail = $('#os-route-trail'), dot = $('#os-dot');
    if (!rail || !base || !routeLen || !dot) return;
    const max = rail.scrollWidth - rail.clientWidth;
    /* Where the reader is, not how far the page has scrolled. With nothing to
       scroll the whole route counts as travelled. */
    const p = max > 0 ? Math.min(1, Math.max(0, rail.scrollLeft / max)) : 1;
    trail.style.strokeDashoffset = routeLen * (1 - p);
    const pt = base.getPointAtLength(routeLen * p);
    /* The dot lives INSIDE the rail, so it scrolls with the content and its
       position is in content coordinates — no scrollLeft correction. The two
       cancel: as progress carries the dot right through the content, the
       content travels left by the same scroll, so the dot sweeps across the
       visible rail rather than running off it. */
    dot.style.transform = 'translate(' + (pt.x - 9) + 'px,' + (pt.y - 9) + 'px)';
    const at = $('#os-nav-at');
    if (at) {
      const eras = ERAS.slice(0, shown).map((e) => e.name);
      at.textContent = eras.length === ERAS.length
        ? 'All ' + DATA.length + ' moments, 1968 to 2021'
        : eras[0] + (eras.length > 1 ? '\u2013' + eras[eras.length - 1] : '') + ' so far';
    }
  }

  /* ---------- Arrivals ----------
     Newly appended entries only. Anything already read keeps its place. */
  function arrive(els) {
    if (!els.length) return;
    if (typeof gsap === 'undefined'
        || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.from(els, { opacity: 0, y: 22, duration: 0.5, ease: 'power2.out',
                     stagger: 0.06, clearProps: 'all' });
  }

  /* ---------- Wiring ----------
     THE CLICK DELEGATION IS BOUND ONCE, on the track, which survives every
     re-render. Binding it per render stacked a listener each time: one press of
     Continue then fired two, three, four handlers, shown ran past the end of
     the decade list and the next press threw on ERAS[shown - 1]. The rail
     element itself IS replaced by render(), so only its scroll listener is
     re-attached — that one is bound to the new node each time. */
  let railQueued = 0;
  function wireRail() {
    const rail = $('#os-rail');
    if (!rail) return;
    rail.addEventListener('scroll', () => {
      if (railQueued) return;
      railQueued = requestAnimationFrame(() => { railQueued = 0; placeDot(); });
    }, { passive: true });
  }

  function wireOnce() {
    track.addEventListener('click', (e) => {
      const go = e.target.closest('.os-ask-go');
      if (go) {
        if (shown >= ERAS.length) return;      /* nothing left to ask for */
        const rail0 = $('#os-rail');
        const from = rail0 ? rail0.scrollLeft : 0;
        const added = ERAS[shown].items.length;
        shown += 1;
        render();
        const r = $('#os-rail');
        r.scrollLeft = from;                   /* stay where they were */
        sizeTopo();                            /* render() replaced .os-topo */
        buildRoute();
        wireRail();                            /* new node, new scroll listener */
        /* Take them to the decade they asked for, by their own scroll. */
        const era = $$('.os-era', r)[shown - 1];
        if (era) r.scrollTo({ left: Math.max(0, era.offsetLeft - 24), behavior: 'smooth' });
        arrive($$('.os-item', r).slice(-added));
        return;
      }
      const arrow = e.target.closest('.os-arrow');
      if (arrow) {
        const rail = $('#os-rail');
        if (!rail) return;
        const step = Math.round(rail.clientWidth * 0.8) * (Number(arrow.dataset.dir) || 1);
        rail.scrollBy({ left: step, behavior: 'smooth' });
      }
    });
  }

  /* ---------- Hero parallax ----------
     The travel is read from the CSS so the JS cannot drift past the media
     overhang; the reduced-motion block sets it to 0 and this returns first. */
  function initParallax() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    const page = $('.os-page');
    const px = page ? parseFloat(getComputedStyle(page).getPropertyValue('--os-drift')) || 0 : 0;
    const hero = $('.os-hero'), media = $('.os-hero-media');
    if (!px || !hero || !media) return;
    gsap.fromTo(media, { yPercent: -px / 2 }, {
      yPercent: px / 2, ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
    });
  }

  /* ---------- Boot ----------
     The rail is built immediately, not on the animation handoff. It is the
     content of the section, not an effect on it: with GSAP blocked or slow the
     reader still gets a timeline they can scroll and continue through, and only
     the hero drift and the arrival stagger are lost. */
  render();
  wireOnce();
  wireRail();
  sizeTopo();
  buildRoute();

  let rt = null;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => { sizeTopo(); buildRoute(); }, 150);
  });
  window.addEventListener('load', () => { sizeTopo(); buildRoute(); }, { once: true });

  document.addEventListener('jayco:animations-ready', initParallax, { once: true });
}());
