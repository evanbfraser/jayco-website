/* ===================================================
   Jayco — the About pages
   pdi.html, visit-us.html, solar.html, awards.html,
   safety.html, rd.html
   ---------------------------------------------------
   ONE SCRIPT FOR SIX PAGES, matching css/about.css.
   Most of what follows is shared — the arrival reveal
   and the parallax — and the page-specific parts are
   guarded on a body class and return immediately when
   they are not on their own page.

   MOTION IS BORROWED, NOT CREATED. app.js owns the one
   Lenis instance and the one ScrollTrigger
   registration; this attaches on the
   'jayco:animations-ready' event it fires and never
   makes a second of either. Under prefers-reduced-motion
   the stylesheet sets --ab-drift to 0 and the parallax
   block returns before binding, so there is no second
   code path.

   THE ARRIVAL HIDES NOTHING UNTIL IT CAN SHOW IT.
   .ab-rise is only given its hidden state under
   .ab-armed, and .ab-armed is set on <html> by this
   file. A reader whose JS never runs, or whose browser
   throws before this line, sees every section — the
   failure mode is "no animation", not "no page".

   THE SWEEP IS NOT OPTIONAL. our-story.html shipped an
   IntersectionObserver-only reveal and 26 of its 30
   entries could stay permanently invisible, because a
   reader who lands below the fold never intersects
   anything above it. The sweep below reveals anything
   already past the top of the viewport, unanimated, and
   runs once at boot as well as on the observer.
   =================================================== */

(function () {
  'use strict';

  const $  = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));

  const page = $('.ab-page');
  if (!page) return;

  /* ---------------------------------------------------
     Arrival
     --------------------------------------------------- */
  function initRise() {
    const items = $$('.ab-rise');
    if (!items.length) return;
    document.documentElement.classList.add('ab-armed');

    /* Anything whose bottom is already above the fold has been scrolled past —
       reveal it with no transition, because animating something the reader
       cannot see is a frame budget spent on nothing. */
    const sweep = () => {
      items.forEach((el) => {
        if (el.classList.contains('is-in')) return;
        if (el.getBoundingClientRect().top < window.innerHeight * 0.92) {
          el.classList.add('is-in');
        }
      });
    };

    if (!('IntersectionObserver' in window)) { items.forEach((el) => el.classList.add('is-in')); return; }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.01 });

    items.forEach((el) => io.observe(el));
    sweep();
    /* A second sweep after layout settles: images without an intrinsic size can
       move a section below the fold between boot and first paint. */
    window.addEventListener('load', sweep, { once: true });
  }

  /* ---------------------------------------------------
     100% PDI — the ramp
     The page's one authored motion moment. Each row's
     rule fills to the share of the lineup being
     inspected at that date, so the bar IS the claim
     rather than a decoration beside it.
     --------------------------------------------------- */
  function initRamp() {
    const ramp = $('.pdi-ramp');
    if (!ramp) return;
    const rows = $$('.pdi-ramp-row', ramp);
    if (!rows.length) return;

    const fill = () => rows.forEach((row) => {
      const pct = parseFloat(row.getAttribute('data-pct')) || 0;
      const bar = $('.pdi-ramp-fill', row);
      if (bar) bar.style.width = pct + '%';
      if (pct >= 100) row.classList.add('is-full');
    });

    if (!('IntersectionObserver' in window)) { fill(); return; }
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      fill();
      io.disconnect();
    }, { threshold: 0.25 });
    io.observe(ramp);
    /* Already scrolled past it: fill immediately rather than never. */
    if (ramp.getBoundingClientRect().bottom < 0) { fill(); io.disconnect(); }
  }

  /* ---------------------------------------------------
     100% PDI — what gets checked
     Each card rises as it scrolls in and its blue tick
     draws itself, staggered across the cards that arrive
     together. Same safety as .ab-rise: the hidden state
     exists only under .pdi-armed, which is never set
     under prefers-reduced-motion or without an observer.
     --------------------------------------------------- */
  function initChecks() {
    const list = $('.pdi-checks');
    if (!list) return;
    const cards = $$('.pdi-check', list);
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!cards.length || still || !('IntersectionObserver' in window)) return;
    list.classList.add('pdi-armed');

    const io = new IntersectionObserver((entries) => {
      const arriving = [];
      entries.forEach((e) => {
        if (e.isIntersecting) { arriving.push(e); return; }
        /* Already scrolled past (a reload mid-page, an anchor jump): show it
           ticked, with no delay, rather than leave it hidden above the fold. */
        if (e.boundingClientRect.bottom < 0) {
          e.target.style.setProperty('--pdi-delay', '0ms');
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
      arriving
        .sort((a, b) => (a.boundingClientRect.top - b.boundingClientRect.top) ||
                        (a.boundingClientRect.left - b.boundingClientRect.left))
        .forEach((e, i) => {
          e.target.style.setProperty('--pdi-delay', (i * 120) + 'ms');
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.2 });

    cards.forEach((el) => io.observe(el));
  }

  /* ---------------------------------------------------
     Watch it (pdi.html, solar.html)
     The photograph starts centred, inset inside the page
     frame, and opens to the frame as it scrolls up;
     --exp is the hinge the stylesheet reads, as on
     our-story.js's band. Once it has opened, .is-open
     brings in the headline and the play button. Scrubbed,
     so scrolling back closes it again.
     --------------------------------------------------- */
  function initWatch() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    const bands = $$('.ab-watch');
    if (!bands.length) return;
    const clamp01 = (n) => Math.max(0, Math.min(1, n));
    /* power2.out across the scroll, the band's expansion curve. */
    const glide = (p) => 1 - Math.pow(1 - clamp01(p), 2);

    gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
      const undo = bands.map((band) => {
        band.classList.add('is-armed');
        const paint = (p) => {
          band.style.setProperty('--exp', String(1 - glide(p)));
          band.classList.toggle('is-open', p >= 0.9);
        };
        /* From the band's top near the foot of the window to its centre at the
           centre of the window: fully open while all of it is on screen. */
        const st = ScrollTrigger.create({
          trigger: band, start: 'top 90%', end: 'center center', scrub: true,
          onUpdate(self) { paint(self.progress); },
          onRefresh(self) { paint(self.progress); },
        });
        paint(st.progress);
        return () => {
          band.classList.remove('is-armed', 'is-open');
          band.style.removeProperty('--exp');
        };
      });
      return () => undo.forEach((fn) => fn());
    });
  }

  /* ---------------------------------------------------
     Award-Winning RVs — the list and its filter
     --------------------------------------------------- */
  function initAwards() {
    const list = $('#aw-list');
    if (!list) return;
    const DATA = window.JAYCO_AWARDS;
    if (!DATA || !DATA.years) return;

    const esc = (s) => String(s).replace(/[&<>"]/g, (c) => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]
    ));

    /* The product cell. `what` is null on every award given to the brand rather
       than to a coach — see the header of awards-data.js — and printing the
       brand name there would turn sixty brand awards into sixty product wins.
       Those rows say so instead, and the note carries the category. */
    const what = (row) => (row.what
      ? '<b>' + esc(row.what) + '</b>' + (row.note ? ' — ' + esc(row.note) : '')
      : (row.note ? esc(row.note) : 'Jayco'));

    /* The awarding body's own mark, alt="" ON PURPOSE. The badge says the same
       thing the three cells beside it already say — award, category, coach —
       so giving it alt text would make a screen reader read every row twice.
       It is decoration here in the strict sense: the information is the row.

       lazy on all of them: 63 marks, and a filtered view renders only one
       year's worth, so most are never in the viewport at all. */
    const badge = (row, cls) => (row.badge
      ? '<span class="' + cls + '">' +
          '<img src="../assets/awards/badges/' + esc(row.badge) + '" alt="" ' +
          'loading="lazy" decoding="async" />' +
        '</span>'
      : '<span class="' + cls + '" aria-hidden="true"></span>');

    /* The text is the same three lines on both kinds of card, in the same
       order, so a featured award reads exactly like the plain one beside it. */
    const text = (row) => (
      '<span class="aw-card-award">' + esc(row.award) + '</span>' +
      '<span class="aw-card-what">' + what(row) + '</span>' +
      '<span class="aw-card-by">' + esc(row.by) + '</span>'
    );

    /* Every card is a link, to wherever Jayco's own awards page sends it — the
       winning coach, the lineup, or the article announcing the award — and it
       leaves the site the same way theirs does, in a new tab. The accessible
       name is set outright: read from the content it would be the photograph's
       description, then the award, then its category and body, run together
       with no pauses. A row with no href still renders, as a plain block. */
    const label = (row) => [row.award, row.what, row.note, row.by].filter(Boolean).join(', ') +
      ' (opens in a new tab)';

    const link = (row, cls, inner) => (row.href
      ? '<a class="' + cls + '" href="' + esc(row.href) + '" target="_blank" rel="noopener noreferrer" ' +
          'aria-label="' + esc(label(row)) + '">' + inner + '</a>'
      : '<div class="' + cls + '">' + inner + '</div>');

    const cardHTML = (row) => (
      '<li class="aw-item aw-rise">' +
        link(row, 'aw-card',
          badge(row, 'aw-card-badge') +
          '<span class="aw-card-body">' + text(row) + '</span>') +
      '</li>'
    );

    /* A featured award: the client's photograph, with the awarding body's mark
       and the award's name laid over it on a two-stop scrim (DESIGN.md > Media
       card — text never sits on the raw photograph). */
    const photoHTML = (row) => {
      const p = row.photo, base = '../assets/awards/web/' + esc(p.file);
      return '<li class="aw-item aw-item--photo aw-rise">' +
        link(row, 'aw-card aw-card--photo',
          '<img class="aw-photo" src="' + base + '-1600.webp" ' +
            'srcset="' + base + '-1000.webp 1000w, ' + base + '-1600.webp 1600w" ' +
            'sizes="(max-width: 1024px) 92vw, 45vw" ' +
            'style="object-position: ' + esc(p.focus || '50% 50%') + '" ' +
            'alt="' + esc(p.alt) + '" loading="lazy" decoding="async" />' +
          '<span class="aw-photo-scrim" aria-hidden="true"></span>' +
          '<span class="aw-photo-body">' +
            badge(row, 'aw-photo-badge') +
            '<span class="aw-photo-text">' + text(row) + '</span>' +
          '</span>') +
      '</li>';
    };

    /* Featured awards lead their year, each a two-column photograph sharing its
       row with two plain cards, and they STAGGER: the first photograph takes the
       right half of its row, the next the left, and so on — card, card, photo /
       photo, card, card / card, card, photo — then the rest four across.
       Interleaved HERE rather than placed by the grid, so the reading order a
       screen reader and the Tab key follow is the order on screen. The rest keep
       Jayco's own order. */
    function ordered(rows) {
      const photos = rows.filter((r) => r.photo);
      const rest = rows.filter((r) => !r.photo);
      const out = [];
      let k = 0;
      photos.forEach((p, i) => {
        const pair = rest.slice(k, k + 2);
        k += pair.length;
        if (i % 2 === 0) out.push(...pair, p);
        else out.push(p, ...pair);
      });
      return out.concat(rest.slice(k));
    }

    const rowHTML = (row) => (row.photo ? photoHTML(row) : cardHTML(row));

    /* ---- The cards arriving ----
       Each card rises into place the first time it scrolls into view, and does
       not reverse. Cards that arrive together — a row coming up from the foot
       of the screen — are staggered by reading order, top then left, capped so
       the last of a batch is never more than half a second behind the first.

       Not .ab-rise: that list is collected once at boot, and these cards are
       rebuilt every time the year filter changes. So the observer lives here
       and arm() re-observes whatever render() just drew — which also means a
       filter click brings its cards in the same way a scroll does.

       Same safety as .ab-rise: the hidden state exists only under .aw-armed,
       set below, so a reader whose JS dies sees every card. Under
       prefers-reduced-motion the list is never armed at all. */
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let io = null;
    if (!still && 'IntersectionObserver' in window) {
      list.classList.add('aw-armed');
      io = new IntersectionObserver((entries) => {
        const pos = (el) => el.getBoundingClientRect();
        entries
          .filter((e) => e.isIntersecting)
          .map((e) => e.target)
          .sort((a, b) => (pos(a).top - pos(b).top) || (pos(a).left - pos(b).left))
          .forEach((el, i) => {
            el.style.setProperty('--aw-delay', Math.min(i, 7) * 70 + 'ms');
            el.classList.add('is-in');
            io.unobserve(el);
          });
      }, { rootMargin: '0px 0px -6% 0px', threshold: 0.12 });
    }

    function arm() {
      if (!io) return;
      io.disconnect();   // the cards it was watching were just replaced
      $$('.aw-rise', list).forEach((el) => {
        /* Already scrolled past — a reader who landed lower down the page.
           Shown, not animated: there is no one watching it arrive. */
        if (el.getBoundingClientRect().bottom < 0) el.classList.add('is-in');
        else io.observe(el);
      });
    }

    const total = DATA.years.reduce((n, y) => n + y.rows.length, 0);
    let shown = null;   /* null = every year */

    function render() {
      const years = shown === null ? DATA.years : DATA.years.filter((y) => y.year === shown);
      list.innerHTML = years.map((y) => (
        '<li class="aw-year">' +
          '<h3 class="aw-year-h">' + y.year + '</h3>' +
          '<ul class="aw-cards">' + ordered(y.rows).map(rowHTML).join('') + '</ul>' +
        '</li>'
      )).join('');

      arm();

      /* #aw-count is .sr-only: it is no longer printed on the page, and exists so
         that changing the filter is announced to a screen reader. The pressed pill
         alone does not announce how much the list changed by. */
      const n = years.reduce((a, y) => a + y.rows.length, 0);
      const count = $('#aw-count');
      if (count) {
        count.textContent = shown === null
          ? 'All ' + total + ' Jayco awards, ' +
            DATA.years[DATA.years.length - 1].year + ' to ' + DATA.years[0].year + '.'
          : n + (n === 1 ? ' award' : ' awards') + ' in ' + shown + '.';
      }
    }

    /* The filter. Built from the data so a new model year in awards-data.js
       gets a pill without anybody remembering to add one. */
    const bar = $('#aw-filters');
    if (bar) {
      bar.innerHTML =
        '<button class="aw-filter" type="button" data-year="all" aria-pressed="true">All years</button>' +
        DATA.years.map((y) => (
          '<button class="aw-filter" type="button" data-year="' + y.year + '" aria-pressed="false">' + y.year + '</button>'
        )).join('');

      bar.addEventListener('click', (e) => {
        const btn = e.target.closest('.aw-filter');
        if (!btn) return;
        const y = btn.getAttribute('data-year');
        shown = y === 'all' ? null : parseInt(y, 10);
        $$('.aw-filter', bar).forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
        render();
      });
    }

    render();
  }

  /* ---------------------------------------------------
     Safety — the JaySMART demonstration
     The page's one authored motion moment. A lighting
     system can only really be explained by showing it,
     so this plays each of the four signals on a night
     scene of a trailer in perspective — the rear, the
     side and the front cap — with the light each lamp
     throws on the trailer and the ground.

     LEGIBLE STOPPED. Every signal has a sentence under
     it saying what it does, and the buttons are the
     control — nothing here depends on the animation to
     be understood. Under prefers-reduced-motion the
     flashing never starts and the lamps hold their lit
     state, which is the same information without the
     movement.
     --------------------------------------------------- */
  function initSignal() {
    const rig = $('.sf-signal');
    if (!rig) return;
    const say  = $('.sf-signal-say', rig);
    const btns = $$('.sf-sig-btn', rig);
    /* Every lamp group, and every pool or wash of light it throws, carries
       data-g: the circuit it is on. A frame names the circuits that are fully
       lit and the ones at running-light level; everything else is dark. */
    const parts = $$('[data-g]', rig);
    if (!parts.length || !btns.length) return;

    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* One timer for the whole rig. Every mode that blinks reuses it, so a mode
       change can never leave a second interval running behind the first —
       which is the bug that makes a demo like this drift out of phase. */
    let timer = null;
    const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
    const show = (frame) => parts.forEach((el) => {
      const g = el.getAttribute('data-g');
      const on = frame.on.indexOf(g) !== -1;
      el.classList.toggle('is-on', on);
      el.classList.toggle('is-dim', !on && frame.dim.indexOf(g) !== -1);
    });

    /* The roofline, side and front markers are running lights: at night they
       are already on before any signal is given. */
    const RUNNING = ['roof', 'side', 'front'];
    const IDLE = { on: [], dim: RUNNING };
    const DARK = { on: [], dim: [] };

    /* Alternate the lit and unlit frames every `ms`. Given `times`, stop after
       that many flashes and hold the lit frame. Under reduced motion there is
       no flashing: the lit frame is simply held. */
    const flash = (lit, unlit, ms, times) => {
      show(lit);
      if (still) return;
      let n = 0;
      timer = setInterval(() => {
        n += 1;
        if (times && n >= times * 2 - 1) { stop(); show(lit); return; }
        show(n % 2 ? unlit : lit);
      }, ms);
    };

    /* Jayco's own descriptions of what each signal does. JaySMART stands for
       Safety Markers And Reverse Travel. The trailer is seen from its left, so
       a turn is drawn to that side: the rear strip on that corner, the side
       markers and the front cap. */
    const MODES = {
      brake: {
        say: 'Brake. The rear SMART lights flash three times, then hold steady — so the driver behind you sees the stop before they see the trailer.',
        run: () => flash(
          { on: ['roof', 'strip-l', 'strip-r', 'brake', 'pool-red', 'wash-red'], dim: [] },
          IDLE, 220, 3),
      },
      turn: {
        say: 'Turn. The rear, side and front SMART lights flash together on the side you are turning to, so a long trailer signals along its whole length.',
        run: () => flash(
          { on: ['strip-r', 'side', 'front', 'pool-side', 'pool-front', 'wash-side', 'wash-front'], dim: ['roof'] },
          { on: [], dim: ['roof'] }, 420),
      },
      hazard: {
        say: 'Hazard. Every SMART light flashes in unison — the trailer reads as one object rather than a set of unrelated lamps.',
        run: () => flash(
          { on: ['roof', 'strip-l', 'strip-r', 'brake', 'side', 'front',
                 'pool-red', 'pool-side', 'pool-front', 'wash-red', 'wash-side', 'wash-front'], dim: [] },
          DARK, 480),
      },
      reverse: {
        say: 'Reverse. The reverse lamps and the markers come on together, which is the difference between backing into a site you can see and one you cannot.',
        run: () => show({ on: ['rev-top', 'rev-low', 'pool-white', 'wash-white'], dim: RUNNING }),
      },
    };

    function play(name, btn) {
      stop();
      btns.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      const mode = MODES[name];
      if (!mode) return;
      if (say) say.textContent = mode.say;
      mode.run();
    }

    rig.addEventListener('click', (e) => {
      const btn = e.target.closest('.sf-sig-btn');
      if (!btn) return;
      play(btn.getAttribute('data-signal'), btn);
    });

    /* Opens on brake, because that is the signal the system was built for and
       the one with a behaviour worth watching. */
    play('brake', btns[0]);

    /* A demo running in a section nobody is looking at is a timer burning
       battery. Stop it when the rig leaves the viewport, resume when it
       returns. */
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const btn = btns.filter((b) => b.getAttribute('aria-pressed') === 'true')[0] || btns[0];
            play(btn.getAttribute('data-signal'), btn);
          } else { stop(); }
        });
      }, { threshold: 0.15 });
      io.observe(rig);
    }
  }

  /* ---------------------------------------------------
     Visit Us — one pin on one map
     Leaflet on OpenStreetMap's own tiles, tinted toward
     the palette by a filter on the tile pane (about.css),
     with a Jayco-blue pin carrying the white logo. No key
     and no account. Leaflet is loaded by visit-us.html
     only; dealers.js owns the multi-marker locator.
     --------------------------------------------------- */
  const VU_POPUP = '<b>Jayco Visitors Center</b><br>903 S. Main Street<br>Middlebury, IN 46540';

  function initMap() {
    const el = $('#vu-map');
    if (!el || typeof L === 'undefined') return;   /* offline or blocked: the address above still reads */

    const lat = parseFloat(el.getAttribute('data-lat'));
    const lng = parseFloat(el.getAttribute('data-lng'));
    if (!isFinite(lat) || !isFinite(lng)) return;

    const map = L.map(el, { scrollWheelZoom: false, zoomControl: true, attributionControl: true })
      .setView([lat, lng], 15);

    /* OpenStreetMap's own tiles, because they still render without a key. CARTO's
       free styles now answer an unkeyed request with HTTP 200 and a PNG that has
       "API KEY REQUIRED" printed across it — nothing errors, it only shows in the
       picture. FOR PRODUCTION, BUY TILES: OSM's tile policy is for modest use,
       and a Jayco site belongs on a keyed provider, not the volunteer servers. */
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    /* A teardrop drawn in CSS (.vu-pin-head), point down, with the logo upright
       inside it. The icon box is exactly the drop, so anchoring on its bottom
       centre puts the tip on the address. */
    L.marker([lat, lng], {
      title: 'Jayco Visitors Center',
      icon: L.divIcon({
        className: 'vu-pin',
        html: '<span class="vu-pin-head"><img src="../assets/jayco-logo-white.svg" alt="" width="36" height="24"></span>',
        iconSize: [56, 68], iconAnchor: [28, 68], popupAnchor: [0, -62],
      }),
    }).addTo(map).bindPopup(VU_POPUP);
  }

  /* ---------------------------------------------------
     Parallax
     Each plate scrubbed across its own pass at the small
     magnitude DESIGN.md asks for. The travel is read
     from the CSS so the JS cannot drift past the media
     overhangs — one number, --ab-drift, sets both the
     negative inset and the distance moved.
     --------------------------------------------------- */
  function initParallax() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    const px = parseFloat(getComputedStyle(page).getPropertyValue('--ab-drift')) || 0;
    if (!px) return;   /* reduced motion: the stylesheet set it to 0 */

    const drift = (el, trigger, start, end) => {
      if (!el || !trigger) return;
      gsap.fromTo(el, { yPercent: -px / 2 }, {
        yPercent: px / 2, ease: 'none',
        scrollTrigger: { trigger: trigger, start: start, end: end, scrub: true },
      });
    };

    /* The hero starts ON SCREEN, so its pass runs from the top of the document
       to the point the band leaves — 'top bottom' would be a start it is
       already past, and the plate would jump to mid-travel on the first
       scroll. */
    drift($('.ab-hero-media'), $('.ab-hero'), 'top top', 'bottom top');

    /* Everything else enters from below, so each runs its full crossing. */
    $$('.ab-band-media-wrap').forEach((w) => drift($('.ab-band-media', w), w, 'top bottom', 'bottom top'));
    $$('.ab-cta-band').forEach((b) => drift($('.ab-cta-media', b), b, 'top bottom', 'bottom top'));
  }

  /* ---------------------------------------------------
     Chapter links (solar.html)
     The intro's links to each chapter. With Lenis running,
     a native anchor jump would fight it, so the scroll goes
     through Lenis, offset for the fixed header; the hash is
     still written to the URL. Without Lenis the browser's
     own jump and scroll-margin-top do the same job.
     --------------------------------------------------- */
  function initChapters() {
    const links = $$('.ab-chapter-link');
    if (!links.length) return;
    links.forEach((a) => a.addEventListener('click', (e) => {
      const target = document.getElementById(a.getAttribute('href').slice(1));
      const l = window.__jaycoLenis;
      if (!target || !l || !l.scrollTo) return;
      e.preventDefault();
      const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      /* A number, not the element: Lenis resolves an element target against
         its own animated scroll, which is stale when the page arrived at the
         links by a native scroll. The divider, not the section, lands under
         the header, so the section's top padding does not leave a gap. */
      const mark = $('.ab-chapter-mark', target) || target;
      const y = mark.getBoundingClientRect().top + window.scrollY - 96;
      l.scrollTo(Math.max(0, y), { immediate: still });
      history.replaceState(null, '', '#' + target.id);
    }));
  }

  /* ---------------------------------------------------
     Video player
     Any [data-yt] link opens the page's #ab-player dialog
     and plays that YouTube video in it; without the
     script the link is just a link to YouTube. Manners
     ported from videos.js: the iframe is injected on open
     and removed on close (hiding it would leave the film
     playing), Lenis is stopped while it is open, Tab is
     held inside it, Escape and the scrim close it, and
     focus goes back to the button that opened it. A
     modified click (new tab) is left alone.
     --------------------------------------------------- */
  function initPlayer() {
    const dlg = $('#ab-player');
    if (!dlg) return;
    const frame = $('#ab-player-frame', dlg);
    const title = $('#ab-player-title', dlg);
    const out = $('#ab-player-out', dlg);
    const FOCUSABLE = 'a[href],button:not([disabled]),iframe,[tabindex]:not([tabindex="-1"])';
    const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    let lastFocus = null;
    const isOpen = () => !dlg.hidden;

    function play(id, name, from) {
      lastFocus = from || document.activeElement;
      /* youtube-nocookie, and autoplay because the click WAS the play. */
      frame.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) +
        '?autoplay=1&rel=0" title="' + esc(name) + '" frameborder="0" allow="accelerometer; ' +
        'autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" ' +
        'referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>';
      title.textContent = name;
      out.href = 'https://www.youtube.com/watch?v=' + encodeURIComponent(id);
      out.setAttribute('aria-label', 'Watch "' + name + '" on YouTube — opens in a new tab');
      dlg.hidden = false;
      document.body.classList.add('ab-playing');
      const l = window.__jaycoLenis;
      if (l && l.stop) l.stop();
      $('#ab-player-x', dlg).focus();
    }

    function close() {
      if (!isOpen()) return;
      frame.innerHTML = '';
      dlg.hidden = true;
      document.body.classList.remove('ab-playing');
      const l = window.__jaycoLenis;
      if (l && l.start) l.start();
      if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
      lastFocus = null;
    }

    document.addEventListener('click', (e) => {
      const link = e.target.closest('[data-yt]');
      if (link) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        play(link.getAttribute('data-yt'), link.getAttribute('data-yt-title') || 'Video', link);
        return;
      }
      if (isOpen() && e.target.closest('[data-ab-close]')) close();
    });

    document.addEventListener('keydown', (e) => {
      if (!isOpen()) return;
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key !== 'Tab') return;
      const f = $$(FOCUSABLE, dlg).filter((el) => el.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (!dlg.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
      else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  /* ---------------------------------------------------
     Boot
     The content parts run on DOM ready; only the motion
     waits for app.js to hand over.
     --------------------------------------------------- */
  function boot() {
    initAwards();
    initSignal();
    initMap();
    initRamp();
    initChecks();
    initPlayer();
    initChapters();
    initRise();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();

  document.addEventListener('jayco:animations-ready', () => {
    initParallax();
    initWatch();
  }, { once: true });
}());
