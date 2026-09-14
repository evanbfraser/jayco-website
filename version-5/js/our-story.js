/* ===================================================
   Jayco — Our Story
   ---------------------------------------------------
   Builds the timeline from our-story-data.js and gives
   it three pieces of motion, all of them small:

     • the hero plate drifts, the way every hero on this
       site drifts;
     • the route fills and its dot travels as the rail
       scrolls, so the page reports how far through the
       history you are;
     • each entry arrives once, as it comes into view;
     • the photograph above the timeline opens out as it
       scrolls in, and its line arrives word by word.

   THE ARRIVALS ARE AN INTERSECTIONOBSERVER, NOT A
   SCROLLTRIGGER PER CARD. Thirty triggers would each
   cache a start against a layout that changes as the
   photographs load, and a stale one can spend its
   animation while the card is still off screen. An
   observer measures at the moment of crossing instead,
   and the stagger comes free: entries that cross
   together are one callback.
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
     A HORIZONTAL RAIL CARRYING THE WHOLE HISTORY, and nothing about it is
     forced. The page is never pinned and the vertical scroll is never hijacked:
     the rail is an ordinary horizontal scroller — swipe, trackpad, arrow keys or
     the two buttons under it — and the reader moves along it at their own pace.

     EVERY DECADE IS ON THE RAIL FROM THE START. It used to stop at the end of
     each decade on a card asking whether to carry on, and append the next one
     on a yes. The client asked for those cards to go on 2026-09-13, so the run
     is 1968 to 2021 in one piece, with the decade tags as the only breaks. */
  const ERAS = [];
  DATA.forEach((m) => {
    if (!ERAS.length || ERAS[ERAS.length - 1].name !== m.era) ERAS.push({ name: m.era, items: [] });
    ERAS[ERAS.length - 1].items.push(m);
  });
  const FIRST = DATA[0].year;
  const LAST = DATA[DATA.length - 1].year;

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

  const ARROW = (d) => `<svg width="17" height="17" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"
      aria-hidden="true"><path d="${d < 0 ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'}"/></svg>`;

  function render() {
    let html = '<div class="os-rail" id="os-rail" tabindex="0" role="region"'
      + ' aria-label="Jayco history, scroll sideways">'
      + '<svg class="os-route" id="os-route" aria-hidden="true">'
      +   '<path class="os-route-base" id="os-route-base"/>'
      +   '<path class="os-route-trail" id="os-route-trail"/>'
      + '</svg>'
      + '<span class="os-dot" id="os-dot" aria-hidden="true"></span>'
      + '<ol class="os-list" id="os-list">';
    let n = 0;
    ERAS.forEach((era) => {
      html += `<li class="os-era" data-era="${esc(era.name)}"><span class="os-era-tag">${esc(era.name)}</span></li>`;
      era.items.forEach((m) => { html += card(m, n++); });
    });
    track.innerHTML = html + '</ol></div>'
      + '<div class="os-nav">'
      +   '<span class="os-nav-at" id="os-nav-at" role="status" aria-live="polite"></span>'
      +   '<div class="os-nav-btns">'
      +     '<button type="button" class="os-arrow" data-dir="-1" aria-label="Scroll back">' + ARROW(-1) + '</button>'
      +     '<button type="button" class="os-arrow" data-dir="1" aria-label="Scroll on">' + ARROW(1) + '</button>'
      +   '</div>'
      + '</div>';
  }

  /* ---------- The topographic ground ----------
     .os-topo is in the HTML, a direct child of the blue section, so it covers
     the whole band — heading and all — rather than only the rail.

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
    $$('.os-item, .os-era', list).forEach((el) => {
      const cx = el.offsetLeft + el.offsetWidth / 2;
      pts.push([cx - el.offsetWidth * 0.3, mid + next() * A]);
      pts.push([cx, mid + next() * A * 0.5]);
    });
    /* End where the entries end. */
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

    /* The decade the reader is in: the last decade tag at or left of a line a
       third of the way across the rail. Written only when it changes, because
       the status is a live region and would otherwise announce on every frame. */
    const at = $('#os-nav-at');
    if (at) {
      const look = rail.scrollLeft + rail.clientWidth * 0.35;
      let era = ERAS[0].name;
      $$('.os-era', rail).forEach((el) => { if (el.offsetLeft <= look) era = el.dataset.era; });
      const text = 'The ' + era + ' · ' + DATA.length + ' moments, ' + FIRST + ' to ' + LAST;
      if (at.textContent !== text) at.textContent = text;
    }
  }

  /* ---------- Arrivals ----------
     Every entry, and each decade tag, arrives once as it comes into view —
     whether that is the section scrolling up the page or the rail scrolling
     sideways. ONE observer against the viewport covers both, because an
     observer's intersection is clipped by every scrolling ancestor: a card
     still past the rail's right edge does not count as visible until the rail
     brings it in. Entries crossing in the same callback stagger.

     The waiting state is only ever set here, so with no JavaScript, no
     IntersectionObserver or reduced motion, every card simply stands. */
  function initArrivals() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!('IntersectionObserver' in window)) return;
    const els = $$('.os-item, .os-era', track);
    els.forEach((el) => el.classList.add('is-waiting'));
    const io = new IntersectionObserver((entries) => {
      let k = 0;
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        io.unobserve(el);
        el.style.transitionDelay = Math.min(k++ * 80, 400) + 'ms';
        el.classList.remove('is-waiting');
        el.addEventListener('transitionend', () => { el.style.transitionDelay = ''; }, { once: true });
      });
    /* A low threshold, so a card peeking in at the rail's edge comes in rather
       than standing as an empty sliver — on a phone the rail shows little more
       than one card, and an edge of the next is usually in view. */
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
    els.forEach((el) => io.observe(el));
  }

  /* ---------- Wiring ---------- */
  function wire() {
    const rail = $('#os-rail');
    if (!rail) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

    let queued = 0;
    rail.addEventListener('scroll', () => {
      if (queued) return;
      queued = requestAnimationFrame(() => { queued = 0; placeDot(); });
    }, { passive: true });

    /* SIDEWAYS GESTURES BELONG TO THE RAIL. Lenis listens for wheel events on
       the window and cancels them to run its own smooth scroll — including a
       trackpad swipe across the rail, whose small vertical component was
       enough for Lenis to take it, so the rail's native sideways scroll kept
       being cut off mid-gesture. That tug-of-war is the other half of the
       jumping. A mostly-horizontal wheel event now stops here, before it
       reaches Lenis, and the browser scrolls the rail natively; a mostly
       vertical one carries on up and scrolls the page as it always has. */
    rail.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) e.stopPropagation();
    }, { passive: true });

    /* ---- The arrows glide ----
       An eased scroll the page runs itself rather than scrollBy's smooth
       behaviour, which differs by browser and used to fight the snap. Each
       press lands on the card or decade tag nearest a screen's-width step,
       measured from where the last glide was headed so quick presses add up,
       and the target is clamped to the rail's ends — so a glide never stops
       part-way into a card or runs past the last one. Any hand on the rail
       (a wheel, a touch, a press) cancels a glide in flight. */
    let glide = null;
    const stopGlide = () => { if (glide) { cancelAnimationFrame(glide.raf); glide = null; } };
    const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    function glideTo(target) {
      const max = rail.scrollWidth - rail.clientWidth;
      target = Math.max(0, Math.min(max, Math.round(target)));
      stopGlide();
      const from = rail.scrollLeft;
      const dist = target - from;
      if (Math.abs(dist) < 1) return;
      if (reduce.matches) { rail.scrollLeft = target; return; }
      const dur = Math.min(950, Math.max(480, Math.abs(dist) * 0.55));
      const t0 = performance.now();
      glide = { target: target, raf: 0 };
      const step = (now) => {
        const t = Math.min(1, (now - t0) / dur);
        rail.scrollLeft = from + dist * easeInOut(t);
        if (t < 1) glide.raf = requestAnimationFrame(step);
        else glide = null;
      };
      glide.raf = requestAnimationFrame(step);
    }

    ['wheel', 'touchstart', 'pointerdown'].forEach((type) => {
      rail.addEventListener(type, stopGlide, { passive: true });
    });

    track.addEventListener('click', (e) => {
      const arrow = e.target.closest('.os-arrow');
      if (!arrow) return;
      const dir = Number(arrow.dataset.dir) || 1;
      const base = glide ? glide.target : rail.scrollLeft;
      const raw = base + dir * rail.clientWidth * 0.8;
      /* Stops are every card's and every decade tag's left edge, in the rail's
         own scroll coordinates: offsetLeft is taken against the list, which
         starts at scrollLeft 0 inside the rail's padding, so an edge at
         offsetLeft lines up with the gutter at exactly that scroll. */
      let best = raw, bestD = Infinity;
      $$('.os-item, .os-era', rail).forEach((el) => {
        const x = el.offsetLeft;
        if ((x - base) * dir <= 1) return;          /* only stops in the direction of travel */
        const d = Math.abs(x - raw);
        if (d < bestD) { bestD = d; best = x; }
      });
      glideTo(best);
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

  /* ---------- The story band ----------
     PORTED FROM initFeatureBands() IN type-page.js, and named there. The
     photograph above the timeline opens out to the page frame as it scrolls
     in, drifting inside its frame, and "Every model has a story." arrives word
     by word in its bottom-left corner — all scrubbed, so it runs backwards on
     the way up.

     --exp is set on the band, where the stage's clip and the line's position
     both read it, and rests at 0: the page frame, never the window's edges. The
     expansion is desktop-only for the reason type-page.js gives: a band that is
     already nearly the width of a phone has no growth worth watching. The words
     arrive at every width. Under reduced motion none of it binds, and the
     matchMedia cleanup puts every inline style back if that setting changes. */
  function initBand() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    const band = $('.os-band');
    const stage = band && $('.os-band-stage', band);
    if (!stage) return;
    const img = $('.os-band-img', band);
    const words = $$('.os-band-w', band);
    const wide = window.matchMedia('(min-width: 861px)');

    const clamp01 = (n) => Math.max(0, Math.min(1, n));
    /* power2.out, spread across the scroll — type-page.js's expansion curve. */
    const glide = (p, a, b) => { const t = clamp01((p - a) / (b - a)); return 1 - Math.pow(1 - t, 2); };
    /* power3.out, quick off the mark and settling — its arrival curve. */
    const ramp = (p, a, b) => { const t = clamp01((p - a) / (b - a)); return 1 - Math.pow(1 - t, 3); };
    /* Percent of the image's own height, each way; see --os-band-drift. */
    const DRIFT = 7;

    gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
      function paint(p) {
        band.style.setProperty('--exp', wide.matches ? String(1 - glide(p, 0, 0.9)) : '0');
        /* Each word starts a little after the one before, and the first does
           not start until the frame has mostly opened, so the line lands on the
           photograph rather than on the page beside it. */
        words.forEach((w, i) => {
          const h = ramp(p, 0.42 + i * 0.06, 0.74 + i * 0.06);
          w.style.opacity = String(h);
          w.style.transform = 'translateY(' + ((1 - h) * 0.5).toFixed(3) + 'em)';
        });
      }
      function drift(p) {
        if (img) img.style.transform = 'translate3d(0,' + ((p - 0.5) * -2 * DRIFT).toFixed(3) + '%,0)';
      }

      /* From the band's top at the bottom of the window to its top 15% of the
         way down: short of the very top, so the last of the movement is still
         above the fold rather than finishing out of sight. */
      const st = ScrollTrigger.create({
        trigger: band, start: 'top bottom', end: 'top 15%', scrub: true,
        onUpdate(self) { paint(self.progress); },
        onRefresh(self) { paint(self.progress); },
      });
      const dt = ScrollTrigger.create({
        trigger: band, start: 'top bottom', end: 'bottom top', scrub: true,
        onUpdate(self) { drift(self.progress); },
        onRefresh(self) { drift(self.progress); },
      });
      /* onUpdate does not fire at progress 0, so paint the first frame now. */
      paint(st.progress);
      drift(dt.progress);

      return () => {
        band.style.removeProperty('--exp');
        words.forEach((w) => { w.style.opacity = ''; w.style.transform = ''; });
        if (img) img.style.transform = '';
      };
    });
  }

  /* ---------- Boot ----------
     The rail is built immediately, not on the animation handoff. It is the
     content of the section, not an effect on it: with GSAP blocked or slow the
     reader still gets a timeline they can scroll, and only the hero drift is
     lost. */
  render();
  wire();
  sizeTopo();
  buildRoute();
  initArrivals();

  let rt = null;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => { sizeTopo(); buildRoute(); }, 150);
  });
  window.addEventListener('load', () => { sizeTopo(); buildRoute(); }, { once: true });

  document.addEventListener('jayco:animations-ready', () => { initParallax(); initBand(); }, { once: true });
}());
