/* ===================================================
   Jayco Homepage — Main JS
   Lenis + GSAP + ScrollTrigger
   =================================================== */

(function () {
  'use strict';

  /* ---------- Loader ---------- */
  const loader    = document.getElementById('loader');
  const loaderBar = document.getElementById('loader-bar');
  const loaderPct = document.getElementById('loader-percent');

  function runLoader() {
    let pct = 0;
    const target = 100;
    const step = () => {
      pct = Math.min(pct + Math.random() * 6 + 2, target);
      const display = Math.floor(pct);
      loaderBar.style.width = display + '%';
      loaderPct.textContent = display + '%';
      if (pct < target) {
        requestAnimationFrame(step);
      } else {
        setTimeout(hideLoader, 320);
      }
    };
    requestAnimationFrame(step);
  }

  function hideLoader() {
    loader.classList.add('hidden');
    initAnimations();
  }

  /* ---------- Lenis Smooth Scroll ---------- */
  let lenis;

  function initLenis() {
    lenis = new Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* ---------- Header ---------- */
  function initHeader() {
    const header    = document.getElementById('site-header');
    const hamburger = document.getElementById('hamburger');
    const nav       = document.getElementById('main-nav');

    // Fade to Jayco blue as user scrolls — fully blue at 320px
    const MAX_OPACITY  = 0.96;
    const FULL_SCROLL  = 320;

    function updateHeaderBg() {
      const scrollY   = window.scrollY;
      const opacity   = Math.min(scrollY / FULL_SCROLL, 1) * MAX_OPACITY;
      header.style.background = `rgba(0, 122, 194, ${opacity})`;

      if (scrollY > 60) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    window.addEventListener('scroll', updateHeaderBg, { passive: true });
    updateHeaderBg(); // set correct state on load

    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      nav.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (nav.classList.contains('open') && !nav.contains(e.target) && !hamburger.contains(e.target)) {
        hamburger.classList.remove('open');
        nav.classList.remove('open');
      }
    });
  }

  /* ---------- Hero — image slider + progress dots + corner video ---------- */
  function initHeroSlider() {
    console.log('[Jayco v2] hero build: slider-2 (kenburns + eyebrow + video title + play cursor)');
    const slides = gsap.utils.toArray('.hero-slide');
    const panels = gsap.utils.toArray('.hero-panel');
    const dots   = gsap.utils.toArray('.hero-dot');
    const n = slides.length;
    if (!n || panels.length !== n || dots.length !== n) return;

    const DURATION = 4;   // seconds per slide
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let current = -1;
    let tween = null;

    function goTo(i) {
      if (i === current) return;
      const prev = current;
      current = i;
      slides.forEach((s, k) => s.classList.toggle('is-active', k === i));
      panels.forEach((p, k) => p.classList.toggle('is-active', k === i));
      dots.forEach((d, k) => d.classList.toggle('is-active', k === i));
      if (prev >= 0) gsap.set(dots[prev].querySelector('.hero-dot-fill'), { width: '0%' });

      if (tween) tween.kill();
      if (reduce) return;                          // no auto-advance with reduced motion
      const fill = dots[i].querySelector('.hero-dot-fill');
      tween = gsap.fromTo(fill, { width: '0%' }, {
        width: '100%', duration: DURATION, ease: 'none',
        onComplete: () => goTo((i + 1) % n),
      });
    }

    dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

    // pause/resume the countdown when the tab is hidden
    document.addEventListener('visibilitychange', () => {
      if (!tween) return;
      if (document.hidden) tween.pause(); else tween.resume();
    });

    goTo(0);

    // ---- corner video → fullscreen ----
    const opener = document.querySelector('.hero-video');
    const modal  = document.querySelector('.hero-video-modal');
    const full   = modal && modal.querySelector('.hero-video-full');
    const closeBtn = modal && modal.querySelector('.hero-video-close');
    if (opener && modal && full) {
      const open = () => {
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        if (lenis) lenis.stop();
        full.currentTime = 0;
        full.muted = false;
        full.play().catch(() => {});
      };
      const close = () => {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (lenis) lenis.start();
        full.pause();
      };
      opener.addEventListener('click', open);
      if (closeBtn) closeBtn.addEventListener('click', close);
      modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('is-open')) close(); });
    }
  }

  /* ---------- Section Parallax ---------- */
  function initParallax() {
    const items = Array.from(document.querySelectorAll('.parallax-section'))
      .map((section) => ({ section, bg: section.querySelector('.parallax-bg') }))
      .filter(({ bg }) => bg !== null);

    if (!items.length) return;

    items.forEach(({ bg }) => { bg.style.transform = 'translateY(0%)'; });

    lenis.on('scroll', () => {
      const vh = window.innerHeight;
      items.forEach(({ section, bg }) => {
        const rect     = section.getBoundingClientRect();
        const progress = Math.max(0, Math.min(1, (vh - rect.top) / (vh + rect.height)));
        bg.style.transform = `translateY(${progress * -18}%)`;
      });
    });
  }

  /* ---------- Class Scroller — Towable / Driveable pinned accordion ---------- */
  function initClassScroller() {
    console.log('[Jayco v2] class-scroller build: groups-2 (full img, smoother, quicker)');
    const stage  = document.querySelector('.cs-stage');
    if (!stage) return;
    const groups = gsap.utils.toArray('.cs-group');      // [towable, driveable]
    const slides = gsap.utils.toArray('.cs-slide');
    if (groups.length < 2 || !slides.length) return;
    const GROUP_KEYS = groups.map((g) => g.dataset.group);

    // ---- right-side image carousel ----
    let slideTimer = null;
    let shownSlide = null;
    function show(slide) {
      if (shownSlide === slide) return;
      if (shownSlide) shownSlide.classList.remove('is-shown');
      slide.classList.add('is-shown');
      shownSlide = slide;
    }
    function startCarousel(groupKey) {
      if (slideTimer) { clearInterval(slideTimer); slideTimer = null; }
      const set = slides.filter((s) => s.dataset.group === groupKey);
      if (!set.length) return;
      let i = 0;
      show(set[0]);
      slideTimer = setInterval(() => { i = (i + 1) % set.length; show(set[i]); }, 2200);
    }

    // ---- active group (accordion) ----
    let activeGroup = -1;
    function setGroup(idx) {
      if (idx === activeGroup) return;
      activeGroup = idx;
      groups.forEach((g, i) => g.classList.toggle('is-active', i === idx));
      startCarousel(GROUP_KEYS[idx]);
    }

    // Desktop only: pin the stage; first half = towable, second half = driveable.
    const mm = gsap.matchMedia();
    mm.add('(min-width: 901px)', () => {
      setGroup(0);

      // Hover a vehicle button → show that vehicle, pause auto-cycle; leave → resume.
      const btnHandlers = [];
      stage.querySelectorAll('.cs-vehicle-btn').forEach((btn) => {
        const enter = () => {
          if (slideTimer) { clearInterval(slideTimer); slideTimer = null; }
          const slide = slides.find((s) => s.dataset.vehicle === btn.dataset.vehicle);
          if (slide) show(slide);
        };
        const leave = () => startCarousel(GROUP_KEYS[activeGroup]);
        btn.addEventListener('mouseenter', enter);
        btn.addEventListener('mouseleave', leave);
        btnHandlers.push([btn, enter, leave]);
      });

      const trigger = ScrollTrigger.create({
        trigger: stage,
        start: 'top top',
        end: () => '+=' + Math.round(window.innerHeight * 0.9),
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate(self) { setGroup(self.progress < 0.5 ? 0 : 1); },
      });

      return () => {
        trigger.kill();
        if (slideTimer) { clearInterval(slideTimer); slideTimer = null; }
        btnHandlers.forEach(([btn, enter, leave]) => {
          btn.removeEventListener('mouseenter', enter);
          btn.removeEventListener('mouseleave', leave);
        });
        groups.forEach((g) => g.classList.remove('is-active'));
        activeGroup = -1;
      };
    });
  }

  /* ---------- Section Scroll Animations ---------- */
  const animConfig = {
    'fade-up':    { from: { opacity: 0, y: 20  },                         dur: 1.6, ease: 'power1.out' },
    'slide-right':{ from: { opacity: 0, x: -40 },                         dur: 1.6, ease: 'power1.out' },
    'slide-left': { from: { opacity: 0, x:  40 },                         dur: 1.6, ease: 'power1.out' },
    'scale-up':   { from: { opacity: 0, scale: 0.96 },                    dur: 1.7, ease: 'power1.out' },
    'stagger-up': { from: { opacity: 0, y: 20  },                         dur: 1.5, ease: 'power1.out' },
    'clip-reveal':{ from: { opacity: 0, clipPath: 'inset(100% 0 0 0)' },  dur: 1.8, ease: 'power2.inOut' },
  };

  function initSectionAnimations() {
    document.querySelectorAll('[data-animation]').forEach((section) => {
      const type = section.dataset.animation;
      const cfg  = animConfig[type];
      if (!cfg) return;

      const targets = section.querySelectorAll(
        '.section-label, .section-heading, .section-body, .btn-link, .btn-primary, .btn-secondary, .btn-secondary-light, .stat'
      );
      if (!targets.length) return;

      const isPersist = section.dataset.persist === 'true';

      gsap.from(targets, {
        ...cfg.from,
        stagger: 0.2,
        duration: cfg.dur,
        ease: cfg.ease,
        scrollTrigger: {
          trigger: section,
          start:  'top 70%',
          toggleActions: isPersist ? 'play none none none' : 'play none none reverse',
        },
      });
    });
  }

  /* ---------- News — pinned scroll reveal (text, then cards one at a time) ---------- */
  function initNewsSection() {
    const section = document.getElementById('news-cta');
    if (!section) return;
    console.log('[Jayco v2] news build: cat-2 (pinned reveal)');
    const bg    = section.querySelector('.parallax-bg');
    const head  = section.querySelectorAll('.news-cta-head > *');
    const cards = gsap.utils.toArray(section.querySelectorAll('.news-cat-card'));
    if (!head.length || cards.length < 3) return;

    const mm = gsap.matchMedia();

    // Desktop: pin the section and scrub a long scroll. First you just see the TOP of
    // the background image (an initial hold), then the text appears, then each category
    // card one at a time — while the background slowly pans down.
    mm.add('(min-width: 861px) and (prefers-reduced-motion: no-preference)', () => {
      gsap.set([...head, ...cards], { opacity: 0, y: 40 });
      if (bg) gsap.set(bg, { yPercent: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=150%',
          pin: true,
          scrub: true,
        },
      });
      // Brief hold on the bg, then reveal text, then the three cards one at a time.
      tl.to(head, { opacity: 1, y: 0, stagger: 0.12, duration: 0.5, ease: 'power2.out' }, 0.35)
        .to(cards[0], { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }, '+=0.2')
        .to(cards[1], { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }, '+=0.25')
        .to(cards[2], { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }, '+=0.25')
        .to({}, { duration: 0.3 });   // small trailing hold
      // Background pans from its top across the whole pinned scroll.
      if (bg) tl.fromTo(bg, { yPercent: 0 }, { yPercent: -16, ease: 'none', duration: tl.duration() }, 0);

      return () => {
        gsap.set([...head, ...cards], { clearProps: 'opacity,transform' });
        if (bg) gsap.set(bg, { clearProps: 'transform' });
      };
    });

    // Mobile / reduced motion: no pin — keep everything visible.
    mm.add('(max-width: 860px), (prefers-reduced-motion: reduce)', () => {
      gsap.set([...head, ...cards], { opacity: 1, y: 0 });
    });
  }

  /* ---------- Stats Counter ---------- */
  function initCounters() {
    document.querySelectorAll('.stat-number').forEach((el) => {
      const target   = parseFloat(el.dataset.value);
      const decimals = parseInt(el.dataset.decimals || '0');
      gsap.from(el, {
        textContent: 0,
        duration: 2.2,
        ease: 'power1.out',
        snap: { textContent: decimals === 0 ? 1 : 0.01 },
        scrollTrigger: {
          trigger: el.closest('.stats-section') || el,
          start: 'top 70%',
          toggleActions: 'play none none reverse',
        },
        onUpdate() {
          const val = parseFloat(this.targets()[0].textContent);
          el.textContent = decimals === 0
            ? Math.round(val).toString()
            : val.toFixed(decimals);
        },
      });
    });
  }

  /* ---------- Marquee Scroll ---------- */
  function initMarquee() {
    const track = document.getElementById('marquee-track');
    if (!track) return;

    gsap.to(track, {
      xPercent: -30,
      ease: 'none',
      scrollTrigger: {
        trigger: '.marquee-section',
        start: 'top bottom',
        end:   'bottom top',
        scrub: true,
      },
    });

    gsap.from('.marquee-section', {
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.marquee-section',
        start: 'top 90%',
        toggleActions: 'play none none reverse',
      },
    });
  }

  /* ---------- Footer Reveal ---------- */
  function initFooter() {
    const footer = document.querySelector('.site-footer');
    if (!footer) return;
    gsap.from(footer, {
      opacity: 0,
      y: 20,
      duration: 1.2,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: footer,
        start: 'top 95%',
        toggleActions: 'play none none none',
      },
    });
  }

  /* ---------- Custom Cursor ---------- */
  function initCursor() {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const cursor = document.createElement('div');
    cursor.className = 'cursor';
    cursor.innerHTML = '<span class="cursor-label cursor-label--specs">View Model<br>Specs</span><span class="cursor-label cursor-label--article">Read Articles</span><span class="cursor-label cursor-label--play"><svg width="16" height="18" viewBox="0 0 16 18" fill="currentColor" aria-hidden="true"><path d="M15 9 0 18V0z"/></svg><span class="cursor-label-text">Play Video</span></span>';
    document.body.appendChild(cursor);

    // xPercent/yPercent centres the circle on the exact pointer position
    gsap.set(cursor, { xPercent: -50, yPercent: -50 });

    document.addEventListener('mousemove', (e) => {
      // gsap.set = no animation, 1:1 with the real cursor
      gsap.set(cursor, { x: e.clientX, y: e.clientY });
      cursor.classList.add('visible');
    });

    // relatedTarget === null means the pointer left the browser viewport entirely
    window.addEventListener('mouseout', (e) => {
      if (!e.relatedTarget) cursor.classList.remove('visible');
    });
    window.addEventListener('mouseover', (e) => {
      if (!e.relatedTarget) cursor.classList.add('visible');
    });

    // Grow + intensify glow over interactive elements (exclude news cards, review buttons and the hero video — they use their own states)
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest('a, button, [role="button"], .cs-vehicle-btn') && !e.target.closest('.model-specs-btn') && !e.target.closest('.hero-video') && !e.target.closest('.news-cat-card')) {
        cursor.classList.add('hovering');
      }
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest('a, button, [role="button"], .cs-vehicle-btn') && !e.target.closest('.model-specs-btn') && !e.target.closest('.hero-video') && !e.target.closest('.news-cat-card')) {
        cursor.classList.remove('hovering');
      }
    });

    // Hero corner video → cursor expands into a play button with "Play Video" (same family as the article cursor)
    const heroVideo = document.querySelector('.hero-video');
    if (heroVideo) {
      heroVideo.addEventListener('mouseenter', () => cursor.classList.add('playing'));
      heroVideo.addEventListener('mouseleave', () => cursor.classList.remove('playing'));
    }

    // News category cards → cursor expands with "Read Articles" (same family as the Specs cursor)
    document.querySelectorAll('.news-cat-card').forEach((card) => {
      card.addEventListener('mouseenter', () => cursor.classList.add('reading'));
      card.addEventListener('mouseleave', () => cursor.classList.remove('reading'));
    });
  }

  /* ---------- Dealer Locator Map ---------- */
  function initDealerMap() {
    if (!document.getElementById('dealer-map')) return;
    if (typeof L === 'undefined') return;
    console.log('[Jayco v2] dealer build: split-1 (1/3 text + 2/3 map)');

    const map = L.map('dealer-map', {
      center: [39.5, -98.35],
      zoom: 4,
      zoomControl: false,
      scrollWheelZoom: false,
      dragging: true,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 18,
    }).addTo(map);

    function makeMarkerIcon() {
      const delay = (Math.random() * 3).toFixed(2);
      return L.divIcon({
        className: 'dealer-marker',
        html: `<div class="dealer-marker-dot" style="--pulse-delay:${delay}s"></div>`,
        iconSize: [10, 10],
        iconAnchor: [5, 5],
        popupAnchor: [0, -8],
      });
    }

    const dealers = [
      { name: 'Jayco of Chicago',      lat: 41.88,  lng: -87.63 },
      { name: 'Jayco of Minneapolis',  lat: 44.98,  lng: -93.27 },
      { name: 'Jayco of Detroit',      lat: 42.33,  lng: -83.05 },
      { name: 'Jayco of Cleveland',    lat: 41.50,  lng: -81.69 },
      { name: 'Jayco of Indianapolis', lat: 39.77,  lng: -86.16 },
      { name: 'Jayco of Columbus',     lat: 39.96,  lng: -82.99 },
      { name: 'Jayco of St. Louis',    lat: 38.63,  lng: -90.20 },
      { name: 'Jayco of Kansas City',  lat: 39.10,  lng: -94.58 },
      { name: 'Jayco of Denver',       lat: 39.74,  lng: -104.98 },
      { name: 'Jayco of Phoenix',      lat: 33.45,  lng: -112.07 },
      { name: 'Jayco of Las Vegas',    lat: 36.17,  lng: -115.14 },
      { name: 'Jayco of Los Angeles',  lat: 34.05,  lng: -118.24 },
      { name: 'Jayco of San Diego',    lat: 32.72,  lng: -117.16 },
      { name: 'Jayco of Sacramento',   lat: 38.58,  lng: -121.49 },
      { name: 'Jayco of Seattle',      lat: 47.61,  lng: -122.33 },
      { name: 'Jayco of Portland',     lat: 45.52,  lng: -122.68 },
      { name: 'Jayco of Dallas',       lat: 32.78,  lng: -96.80  },
      { name: 'Jayco of Houston',      lat: 29.76,  lng: -95.37  },
      { name: 'Jayco of Atlanta',      lat: 33.75,  lng: -84.39  },
      { name: 'Jayco of Nashville',    lat: 36.17,  lng: -86.78  },
      { name: 'Jayco of Miami',        lat: 25.77,  lng: -80.19  },
      { name: 'Jayco of Charlotte',    lat: 35.23,  lng: -80.84  },
      { name: 'Jayco of Philadelphia', lat: 39.95,  lng: -75.17  },
      { name: 'Jayco of Boston',       lat: 42.36,  lng: -71.06  },
      { name: 'Jayco of New York',     lat: 40.71,  lng: -74.01  },
      { name: 'Jayco of Birmingham',   lat: 33.52,  lng: -86.80  },
      { name: 'Jayco of Anchorage',    lat: 61.22,  lng: -149.90 },
      { name: 'Jayco of Little Rock',  lat: 34.75,  lng: -92.29  },
      { name: 'Jayco of Hartford',     lat: 41.76,  lng: -72.68  },
      { name: 'Jayco of Wilmington',   lat: 39.74,  lng: -75.55  },
      { name: 'Jayco of Honolulu',     lat: 21.31,  lng: -157.82 },
      { name: 'Jayco of Boise',        lat: 43.62,  lng: -116.21 },
      { name: 'Jayco of Des Moines',   lat: 41.59,  lng: -93.62  },
      { name: 'Jayco of Wichita',      lat: 37.69,  lng: -97.34  },
      { name: 'Jayco of Louisville',   lat: 38.25,  lng: -85.76  },
      { name: 'Jayco of New Orleans',  lat: 29.95,  lng: -90.07  },
      { name: 'Jayco of Portland ME',  lat: 43.66,  lng: -70.26  },
      { name: 'Jayco of Baltimore',    lat: 39.29,  lng: -76.61  },
      { name: 'Jayco of Jackson',      lat: 32.30,  lng: -90.18  },
      { name: 'Jayco of Billings',     lat: 45.78,  lng: -108.50 },
      { name: 'Jayco of Omaha',        lat: 41.26,  lng: -96.00  },
      { name: 'Jayco of Manchester',   lat: 42.99,  lng: -71.46  },
      { name: 'Jayco of Newark',       lat: 40.74,  lng: -74.17  },
      { name: 'Jayco of Albuquerque',  lat: 35.08,  lng: -106.65 },
      { name: 'Jayco of Fargo',        lat: 46.88,  lng: -96.79  },
      { name: 'Jayco of Oklahoma City',lat: 35.47,  lng: -97.52  },
      { name: 'Jayco of Providence',   lat: 41.82,  lng: -71.42  },
      { name: 'Jayco of Columbia',     lat: 34.00,  lng: -81.03  },
      { name: 'Jayco of Sioux Falls',  lat: 43.55,  lng: -96.73  },
      { name: 'Jayco of Salt Lake City',lat: 40.76, lng: -111.89 },
      { name: 'Jayco of Burlington',   lat: 44.48,  lng: -73.21  },
      { name: 'Jayco of Richmond',     lat: 37.54,  lng: -77.43  },
      { name: 'Jayco of Charleston',   lat: 38.35,  lng: -81.63  },
      { name: 'Jayco of Milwaukee',    lat: 43.04,  lng: -87.91  },
      { name: 'Jayco of Cheyenne',     lat: 41.14,  lng: -104.82 },
    ];

    dealers.forEach((d) => {
      L.marker([d.lat, d.lng], { icon: makeMarkerIcon() })
        .addTo(map)
        .bindPopup(`<strong style="font-family:sans-serif;font-size:0.8rem">${d.name}</strong>`);
    });

    const cityLookup = {
      'chicago':     [41.88,  -87.63],
      'los angeles': [34.05, -118.24],
      'new york':    [40.71,  -74.01],
      'dallas':      [32.78,  -96.80],
      'denver':      [39.74, -104.98],
      'seattle':     [47.61, -122.33],
      'atlanta':     [33.75,  -84.39],
      'phoenix':     [33.45, -112.07],
      'miami':       [25.77,  -80.19],
      'houston':     [29.76,  -95.37],
      'boston':      [42.36,  -71.06],
      'nashville':   [36.17,  -86.78],
      'portland':    [45.52, -122.68],
    };

    function handleSearch() {
      const val = document.getElementById('dealer-search-input').value.toLowerCase().trim();
      const match = Object.entries(cityLookup).find(([k]) => val.includes(k));
      if (match) {
        map.flyTo(match[1], 8, { duration: 1.4 });
      }
    }

    document.getElementById('dealer-search-btn').addEventListener('click', handleSearch);
    document.getElementById('dealer-search-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSearch();
    });

    // The map lives in a 2/3-width grid card now — make Leaflet re-measure so
    // tiles fill it with no grey gutter, and re-fit when it stacks on mobile.
    setTimeout(() => map.invalidateSize(), 200);
    window.addEventListener('resize', () => map.invalidateSize());
  }

  /* ---------- Built For — scroll-scrubbed exterior→interior video ---------- */
  function initBuiltFor() {
    const section = document.getElementById('builtfor');
    if (!section) return;
    console.log('[Jayco v2] builtfor build: scrub-1 (expand + video scrub + text crossfade)');

    const stage = section.querySelector('.builtfor-stage');
    const video = section.querySelector('.builtfor-video');
    const lines = section.querySelectorAll('.builtfor-line');
    const btn   = section.querySelector('.builtfor-btn');
    if (!stage || !video || lines.length < 2) return;

    const clamp01 = (n) => Math.max(0, Math.min(1, n));

    const mm = gsap.matchMedia();

    // ---- Desktop: pinned scroll-scrub, container expands, text crossfades ----
    mm.add('(min-width: 861px) and (prefers-reduced-motion: no-preference)', () => {
      let onSeeked = null;
      let onLoaded = null;

      function setupScrollVideo() {
        const duration       = video.duration || 1;
        const scrollDistance = Math.round(duration * 160);

        // Prime the decode pipeline so the first frame paints and seeking is reliable.
        video.play().then(() => video.pause()).catch(() => {});

        // Rapid scroll issues seeks faster than the decoder finishes them, and
        // overlapping seeks get dropped. Track the pending seek and only apply the
        // latest once the previous resolves, so the frame keeps tracking scroll.
        let seeking = false;
        let pendingTime = null;
        function seekTo(time) {
          if (seeking) { pendingTime = time; return; }
          seeking = true;
          video.currentTime = time;
        }
        onSeeked = () => {
          seeking = false;
          if (pendingTime !== null) {
            const next = pendingTime;
            pendingTime = null;
            seekTo(next);
          }
        };
        video.addEventListener('seeked', onSeeked);

        const trigger = ScrollTrigger.create({
          trigger:       section,
          start:         'top top',
          end:           `+=${scrollDistance}`,
          pin:           true,
          anticipatePin: 1,
          scrub:         true,
          onUpdate(self) {
            const p = self.progress;
            // scrub the footage exterior → interior
            seekTo(p * duration);
            // expand the container from content-width to full-bleed over the first 25%
            // (CSS computes the inset from --exp using the same clamp as the dealer padding)
            const e = Math.min(p / 0.25, 1);
            stage.style.setProperty('--exp', String(1 - e));
            // crossfade the headline around mid-scroll (video reaches the interior)
            lines[0].style.opacity = clamp01((0.55 - p) / 0.15);
            lines[1].style.opacity = clamp01((p - 0.45) / 0.15);
            // reveal the "Why Jayco" button once the second headline is in
            if (btn) {
              const b = clamp01((p - 0.62) / 0.08);
              btn.style.opacity = b;
              btn.style.transform = `translateY(${(1 - b) * 12}px)`;
              btn.style.pointerEvents = b > 0.9 ? 'auto' : 'none';
            }
          },
        });

        // Sync the frame to the current scroll position (handles late load inside the pin).
        seekTo(trigger.progress * duration);
        ScrollTrigger.refresh();
      }

      // Wait for real frame data (HAVE_CURRENT_DATA), not just metadata.
      if (video.readyState >= 2) {
        setupScrollVideo();
      } else {
        onLoaded = setupScrollVideo;
        video.addEventListener('loadeddata', onLoaded, { once: true });
      }

      // matchMedia auto-kills the ScrollTrigger; clean up our own listeners + inline styles.
      return () => {
        if (onSeeked) video.removeEventListener('seeked', onSeeked);
        if (onLoaded) video.removeEventListener('loadeddata', onLoaded);
        stage.style.removeProperty('--exp');
        lines[0].style.opacity = '';
        lines[1].style.opacity = '';
        if (btn) { btn.style.opacity = ''; btn.style.transform = ''; btn.style.pointerEvents = ''; }
      };
    });

    // ---- Mobile / reduced-motion: full-width looping video, both lines shown ----
    mm.add('(max-width: 860px), (prefers-reduced-motion: reduce)', () => {
      stage.style.clipPath = 'none';
      video.loop = true;
      video.play().catch(() => {});
      return () => {
        video.loop = false;
        stage.style.clipPath = '';
      };
    });
  }

  /* ---------- Popular Models Carousel ---------- */
  function initModelCarousel() {
    const track   = document.getElementById('models-track');
    if (!track) return;

    const cards   = track.querySelectorAll('.model-card');
    const prevBtn = document.getElementById('models-prev');
    const nextBtn = document.getElementById('models-next');
    const visible  = 3;
    const maxIndex = cards.length - visible;
    let current    = 0;

    function cardWidth() {
      return cards[0].getBoundingClientRect().width;
    }
    function gapPx() {
      return parseFloat(getComputedStyle(track).gap) || 28;
    }

    function goTo(index) {
      current = Math.max(0, Math.min(index, maxIndex));
      track.style.transform = `translateX(-${current * (cardWidth() + gapPx())}px)`;
      prevBtn.classList.toggle('disabled', current === 0);
      nextBtn.classList.toggle('disabled', current === maxIndex);
    }

    prevBtn.addEventListener('click', () => { if (current > 0) goTo(current - 1); });
    nextBtn.addEventListener('click', () => { if (current < maxIndex) goTo(current + 1); });

    const header = document.querySelector('.models-header');
    if (header) {
      gsap.from(header.children, {
        opacity: 0, y: 20, stagger: 0.18, duration: 1.6, ease: 'power1.out',
        scrollTrigger: { trigger: header, start: 'top 85%', toggleActions: 'play none none reverse' },
      });
    }

    goTo(0);
  }

  /* ---------- Model Card Specs ---------- */
  const modelSpecs = {
    'North Point': {
      tagline: 'Luxury That Leads the Way',
      specs: [
        ['Type', 'Luxury Fifth Wheel'],
        ['Sleeps', 'Up to 9'],
        ['Length', '36’ 0”–44’ 9”'],
        ['Unloaded Weight', '13,375–16,195 lbs.'],
        ['Floorplans', '8'],
      ],
    },
    'Alante': {
      tagline: 'Big Adventure, Made Easy',
      specs: [
        ['Type', 'Class A Gas Motorhome'],
        ['Sleeps', 'Up to 8'],
        ['Length', '29’ 11”–32’ 2”'],
        ['Floorplans', '3'],
        ['Chassis', 'Ford® F53'],
        ['GVWR', '18,000 lbs.'],
      ],
    },
    'Pinnacle': {
      tagline: 'The Height of Life on the Road',
      specs: [
        ['Type', 'Luxury Fifth Wheel'],
        ['Sleeps', 'Up to 6'],
        ['Length', '36’ 0”–44’ 6”'],
        ['Unloaded Weight', '13,545–15,870 lbs.'],
        ['Floorplans', '6'],
      ],
    },
    'Greyhawk': {
      tagline: 'More Comfort for Every Mile',
      specs: [
        ['Type', 'Class C Gas Motorhome'],
        ['Sleeps', 'Up to 7'],
        ['Length', '29’ 11”–32’ 6”'],
        ['Chassis', 'Ford® E-450'],
        ['GVWR', '14,500 lbs.'],
        ['Engine', '7.3L V8, 325 hp'],
      ],
    },
    'Jay Feather': {
      tagline: 'Lightweight Freedom, Full-Sized Comfort',
      specs: [
        ['Type', 'Lightweight Travel Trailer'],
        ['Sleeps', 'Up to 10'],
        ['Length', 'Approximately 24’–36’'],
        ['Unloaded Weight', '4,755–6,970 lbs.'],
        ['Floorplans', '16'],
      ],
    },
    'Swift': {
      tagline: 'Your Next Adventure Starts Here',
      specs: [
        ['Type', 'Class B Camper Van'],
        ['Sleeps', '2 standard; up to 4 with available pop-top'],
        ['Length', '20’ 11”'],
        ['Floorplans', '3'],
        ['Chassis', 'RAM® ProMaster 3500'],
        ['Interior', 'Full kitchen and wet bath'],
      ],
    },
  };

  function initModelSpecs() {
    console.log('[Jayco v2] models build: specs-1');
    document.querySelectorAll('.model-card').forEach((card) => {
      const modelName = card.querySelector('.card-top h3')?.textContent.trim();
      const data = modelSpecs[modelName];
      const btn  = card.querySelector('.model-specs-btn');
      if (!data || !btn) return;

      // Build the blue specs panel
      const panel = document.createElement('div');
      panel.className = 'model-specs-panel';
      panel.setAttribute('aria-hidden', 'true');

      const name = document.createElement('h4');
      name.className = 'model-specs-name';
      name.textContent = modelName;

      // Model render image (reuse the card's build image), shown above the tagline
      const buildImg = card.querySelector('.model-build-img');
      let img = null;
      if (buildImg) {
        img = document.createElement('img');
        img.className = 'model-specs-img';
        img.src = buildImg.getAttribute('src');
        img.alt = modelName;
      }

      const tagline = document.createElement('p');
      tagline.className = 'model-specs-tagline';
      tagline.textContent = data.tagline;

      const list = document.createElement('ul');
      list.className = 'model-specs-list';
      data.specs.forEach(([k, v]) => {
        const li = document.createElement('li');
        const ks = document.createElement('span');
        ks.className = 'spec-k';
        ks.textContent = k;
        const vs = document.createElement('span');
        vs.className = 'spec-v';
        vs.textContent = v;
        li.append(ks, vs);
        list.appendChild(li);
      });

      const cta = document.createElement('a');
      cta.className = 'model-specs-cta';
      cta.href = '#';
      cta.textContent = 'Learn More';

      if (img) panel.append(img);
      panel.append(name, tagline, list, cta);
      card.appendChild(panel);

      const setOpen = (open) => {
        card.classList.toggle('is-specs', open);
        panel.setAttribute('aria-hidden', open ? 'false' : 'true');
      };

      // Open the specs panel on CLICK of the icon (toggle); never trigger the card's link.
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const open = !card.classList.contains('is-specs');
        setOpen(open);
        // panel open → icon is now an X (close), so drop the "View Model Specs" cursor;
        // panel closed → still hovering the icon, so bring it back
        const cursor = document.querySelector('.cursor');
        if (cursor) cursor.classList.toggle('specs', !open);
      });
      // Clicks inside the open panel shouldn't bubble to the card link (the Learn More link still works).
      panel.addEventListener('click', (e) => e.stopPropagation());
    });
  }

  /* ---------- Specs Cursor ---------- */
  function initSpecsCursor() {
    const cursor = document.querySelector('.cursor');
    if (!cursor) return;

    document.querySelectorAll('.model-specs-btn').forEach((btn) => {
      const card = btn.closest('.model-card');
      btn.addEventListener('mouseenter', () => {
        if (card && card.classList.contains('is-specs')) return;   // panel already open → no "View Model Specs"
        cursor.classList.add('specs');
      });
      btn.addEventListener('mouseleave', () => cursor.classList.remove('specs'));
    });
  }

  /* ---------- Find Your Match — needs slider (typed phrases) ---------- */
  function initFeatureSlider() {
    console.log('[Jayco v2] feature build: slider-2 (needs crossfade + typed phrase)');
    const section = document.querySelector('#feature');
    if (!section) return;
    const content = section.querySelector('.feature-content');
    const slides  = gsap.utils.toArray('.feature-slide');
    const textEl  = section.querySelector('.feature-word-text');
    const n = slides.length;
    if (!n || !textEl) return;

    // Phrase per slide — order matches the images
    const phrases = [
      'holds all my gear',
      'perfect for my family',
      'is peak comfort',
      'is a smooth ride',
      'can go off-road',
      'allows me to work',
      'entertains my guests',
    ];

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let started = false;
    let index = 0;

    function showSlide(i) {
      slides.forEach((s, k) => s.classList.toggle('is-active', k === i));
    }

    const wait = (ms) => new Promise((res) => setTimeout(res, ms));

    async function typeOut(text) {
      for (let i = 1; i <= text.length; i++) {
        textEl.textContent = text.slice(0, i);
        await wait(55);
      }
    }
    async function eraseAll() {
      for (let i = textEl.textContent.length - 1; i >= 0; i--) {
        textEl.textContent = textEl.textContent.slice(0, i);
        await wait(28);
      }
    }

    async function runLoop() {
      textEl.textContent = '';
      while (true) {
        showSlide(index);          // crossfade the matching image in
        await typeOut(phrases[index]);
        await wait(1600);
        await eraseAll();
        await wait(280);
        index = (index + 1) % n;
      }
    }

    // fade the content in on first view, then start typing
    gsap.set(content, { opacity: 0, y: 16 });
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting || started) return;
      started = true;
      gsap.to(content, {
        opacity: 1, y: 0, duration: 0.9, ease: 'power2.out',
        onComplete: () => {
          if (reduce) { showSlide(0); textEl.textContent = phrases[0]; }
          else runLoop();
        },
      });
    }, { threshold: 0.3 });
    observer.observe(section);
  }

  /* ---------- FAQ Accordion ---------- */
  function initFaq() {
    document.querySelectorAll('.faq-question').forEach((btn) => {
      btn.addEventListener('click', () => {
        const item     = btn.closest('.faq-item');
        const isOpen   = item.classList.contains('is-open');

        // Close any open item
        document.querySelectorAll('.faq-item.is-open').forEach((open) => {
          open.classList.remove('is-open');
          open.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        });

        // Open this one unless it was already open
        if (!isOpen) {
          item.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  /* ---------- Jayco Difference — scroll reveal (logo, then statements one by one) ---------- */
  function initDifference() {
    const section = document.getElementById('difference');
    if (!section) return;
    console.log('[Jayco v2] difference build: anim-1');
    const icon  = section.querySelector('.diff-icon');
    const stats = gsap.utils.toArray(section.querySelectorAll('.diff-stat'));
    if (!icon || !stats.length) return;

    // Reduced motion: leave everything visible, no animation.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap.set([icon, ...stats], { opacity: 0, y: 24 });

    const tl = gsap.timeline({
      scrollTrigger: { trigger: section, start: 'top 78%', toggleActions: 'play none none reverse' },
    });
    tl.to(icon, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' })
      .to(stats, { opacity: 1, y: 0, duration: 0.6, stagger: 0.2, ease: 'power2.out' }, '-=0.15');
  }

  /* ---------- Init All ---------- */
  function initAnimations() {
    gsap.registerPlugin(ScrollTrigger);
    initLenis();
    initHeader();
    initHeroSlider();
    initParallax();
    initClassScroller();   // pinned — must init before later pinned sections (DOM order)
    initDealerMap();
    initBuiltFor();   // pinned scroll-scrub video (#builtfor, below the dealer map)
    initDifference();
    initModelCarousel();
    initModelSpecs();
    initSectionAnimations();
    initFeatureSlider();
    initCursor();
    initNewsSection();
    initSpecsCursor();
    initFaq();
    initFooter();
    ScrollTrigger.refresh();
  }

  /* ---------- Boot ---------- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runLoader);
  } else {
    runLoader();
  }

}());
