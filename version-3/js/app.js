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

    // Fade-in opacity as user scrolls — fully dark at 320px
    const MAX_OPACITY  = 0.88;
    const FULL_SCROLL  = 320;

    function updateHeaderBg() {
      const scrollY   = window.scrollY;
      const opacity   = Math.min(scrollY / FULL_SCROLL, 1) * MAX_OPACITY;
      header.style.background = `rgba(0, 0, 0, ${opacity})`;

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

  /* ---------- Hero Intro — word-by-word reveal on scroll ---------- */
  function initHero() {
    console.log('[Jayco v3] hero build: intro-1');
    const intro = document.querySelector('#hero-intro');
    if (!intro) return;
    const words   = intro.querySelectorAll('.hero-heading .word');
    const points  = intro.querySelectorAll('.hero-point');

    // Reduced motion: show everything, no animation.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set([...words, ...points], { opacity: 1, y: 0 });
      return;
    }

    // The intro now sits below the video hero — reveal it as it scrolls into view.
    const tl = gsap.timeline({
      scrollTrigger: { trigger: intro, start: 'top 75%', toggleActions: 'play none none none' },
    });
    tl.to(words,  { opacity: 1, y: 0, stagger: 0.16, duration: 1.0, ease: 'power2.out' })
      .to(points, { opacity: 1, y: 0, stagger: 0.12, duration: 0.8, ease: 'power2.out' }, '-=0.4');
  }

  /* ---------- Hero CTAs — "How can we help?" → pills grow in L→R → chatbot pops in ---------- */
  function initHeroCtas() {
    const wrap = document.querySelector('.hero-ctas');
    if (!wrap || typeof gsap === 'undefined') return;
    const prompt = wrap.querySelector('.hero-ctas-prompt');
    const pills  = wrap.querySelectorAll('.hero-cta');
    const bot    = wrap.querySelector('.hero-chatbot');
    const scrim  = document.querySelector('.hero-cta-scrim');

    // Reduced motion: just show everything (CSS already forces opacity:1).
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set([prompt, ...pills, bot, scrim], { opacity: 1, scale: 1, clearProps: 'transform' });
      return;
    }

    gsap.set(prompt, { opacity: 0, y: 12 });
    gsap.set(pills,  { opacity: 0, scale: 0.4, transformOrigin: 'left center' });  // grow out from the left
    gsap.set(bot,    { opacity: 0, scale: 0 });
    gsap.set(scrim,  { opacity: 0 });

    gsap.timeline({ delay: 1.2 })
      .to(prompt, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0)
      .to(scrim,  { opacity: 1, duration: 0.9, ease: 'power2.out' }, 0.4)   // gradient eases in once the text appears
      .to(pills,  { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)', stagger: 0.16 }, 0.7)
      .to(bot,    { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(2.2)' }, '+=0.05');
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

  /* ---------- Category Cards — each card triggers independently ---------- */
  function initCategories() {
    // Section header
    const header = document.querySelector('.categories-header');
    if (header) {
      gsap.from(header.children, {
        opacity: 0,
        y: 20,
        stagger: 0.18,
        duration: 1.6,
        ease: 'power1.out',
        scrollTrigger: {
          trigger: header,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      });
    }

    // Each card gets its own scroll trigger so they reveal one by one as user scrolls
    document.querySelectorAll('.category-card').forEach((card) => {
      gsap.from(card, {
        opacity: 0,
        y: 32,
        duration: 1.5,
        ease: 'power1.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 90%',
          toggleActions: 'play none none reverse',
        },
      });
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

  /* ---------- Lifestyle Section ---------- */
  function initNewsCards() {
    const cursor = document.querySelector('.cursor');

    document.querySelectorAll('.news-card').forEach((card) => {
      const video = card.querySelector('.news-card-video');
      if (!video) return;

      const showFirstFrame = () => { video.currentTime = 0.001; };
      if (video.readyState >= 1) {
        showFirstFrame();
      } else {
        video.addEventListener('loadedmetadata', showFirstFrame, { once: true });
      }

      const activate = () => {
        video.play();
        if (cursor) cursor.classList.add('reading');
      };
      const deactivate = () => {
        video.pause();
        video.currentTime = 0.001;
        if (cursor) cursor.classList.remove('reading');
      };

      card.addEventListener('mouseenter', activate);
      card.addEventListener('mouseleave', deactivate);

      // also activate the "Read Article" cursor when hovering the video/image directly
      // (the absolutely-positioned <video> is the element under the pointer there)
      const media = card.querySelector('.news-card-media');
      if (media) media.addEventListener('mouseenter', activate);
      video.addEventListener('mouseenter', activate);
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

  /* ---------- Next Adventure — layered parallax ---------- */
  function initFinalCta() {
    const section = document.getElementById('final-cta');
    if (!section) return;
    console.log('[Jayco v3] adventure: parallax-layers-1');

    const layers = [
      section.querySelector('.adv-l1'),
      section.querySelector('.adv-l2'),
      section.querySelector('.adv-l3'),
      section.querySelector('.adv-l4'),
    ].filter(Boolean);
    // foreground layers drift up most → rising layers cover the line below them
    // (kept within the layer overflow so no edge ever shows)
    const rates = [-6, -11, -18, -25];   // ~1.4× quicker drift on scroll
    const cta   = section.querySelector('.adv-cta');

    function drift() {
      const vh   = window.innerHeight;
      const rect = section.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (vh - rect.top) / (vh + rect.height)));
      layers.forEach((layer, i) => {
        layer.style.transform = `translate3d(0, ${(progress * rates[i]).toFixed(2)}%, 0)`;
      });
    }

    drift();
    if (typeof lenis !== 'undefined' && lenis) {
      lenis.on('scroll', drift);
    } else {
      window.addEventListener('scroll', drift, { passive: true });
    }
    window.addEventListener('resize', drift);

    // CTA (body + buttons) reveals when the section comes into view.
    if (cta && typeof ScrollTrigger !== 'undefined') {
      gsap.fromTo(cta,
        { opacity: 0, y: 24 },
        {
          opacity: 1, y: 0, duration: 1.0, ease: 'power2.out',
          scrollTrigger: { trigger: section, start: 'top 55%', toggleActions: 'play none none reverse' },
        }
      );
    }
  }

  /* ---------- Footer Reveal ---------- */
  function initFooter() {
    const footer = document.querySelector('.site-footer');
    if (!footer) return;
    // Animate the footer's CONTENT, not the <footer> itself — so its dark #080604
    // background stays painted (seamless with the FAQ above) and no white shows through.
    const content = footer.querySelectorAll('.footer-inner, .footer-bottom');
    gsap.from(content, {
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
    cursor.innerHTML = '<span class="cursor-label cursor-label--article">Read Article</span><span class="cursor-label cursor-label--review">What People<br>Are Saying</span>';
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

    // Grow + intensify glow over interactive elements (exclude news cards and review buttons — they use their own states)
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest('a, button, [role="button"], .category-card') && !e.target.closest('.news-card')) {
        cursor.classList.add('hovering');
      }
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest('a, button, [role="button"], .category-card') && !e.target.closest('.news-card')) {
        cursor.classList.remove('hovering');
      }
    });
  }

  /* ---------- Dealer Locator Map ---------- */
  function initDealerMap() {
    if (!document.getElementById('dealer-map')) return;
    if (typeof L === 'undefined') return;

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
  }

  /* ---------- Dealer text card — parallax (drifts at a different speed than the map) ---------- */
  function initDealerParallax() {
    const section = document.getElementById('dealer-locator');
    const ui = section && section.querySelector('.dealer-ui');
    if (!ui) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    function drift() {
      const vh = window.innerHeight;
      const rect = section.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (vh - rect.top) / (vh + rect.height)));
      const offset = (progress - 0.5) * 300;   // ±150px drift — strong parallax vs the static map
      // keep the vertical centering, add the scroll drift on top
      ui.style.transform = `translateY(calc(-50% + ${offset.toFixed(1)}px))`;
    }

    drift();
    if (typeof lenis !== 'undefined' && lenis) lenis.on('scroll', drift);
    else window.addEventListener('scroll', drift, { passive: true });
    window.addEventListener('resize', drift);
  }

  /* ---------- News banner — background image parallax ---------- */
  function initNewsParallax() {
    const section = document.getElementById('news-cta');
    const img = section && section.querySelector('.news-cta-img');
    if (!img) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;  // keep the static scale

    function drift() {
      const vh = window.innerHeight;
      const rect = section.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (vh - rect.top) / (vh + rect.height)));
      const offset = (progress - 0.5) * img.offsetHeight * 0.12;   // ±6% of image height, within the 8% scale overflow
      img.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0) scale(1.16)`;
    }

    drift();
    if (typeof lenis !== 'undefined' && lenis) lenis.on('scroll', drift);
    else window.addEventListener('scroll', drift, { passive: true });
    window.addEventListener('resize', drift);
  }

  /* ---------- Built For — line-draw journey ---------- */
  function initBuildJourney() {
    const section = document.getElementById('build-journey');
    if (!section || typeof gsap === 'undefined') return;
    console.log('[Jayco v3] build journey: trail-dot-1');

    const svg   = section.querySelector('.bj-line-svg');
    const base  = section.querySelector('.bj-line-base');
    const trail = section.querySelector('.bj-line-trail');
    const dot   = section.querySelector('.bj-dot');
    const topo  = section.querySelector('.bj-topo');
    const diff  = section.querySelector('.bj-diff');
    const beats = Array.from(section.querySelectorAll('.bj-beat'));

    // deterministic "random" swing factors (stable across resizes) for the extra turns
    const FACTORS = [0.55, -0.85, 0.4, -0.65, 0.95, -0.5, 0.75, -0.9, 0.6, -0.75, 0.85, -0.45, 0.7, -0.8];

    // Smooth the waypoints into a flowing curve (Catmull-Rom -> cubic Bézier).
    // Passes through every point; rounded turns instead of sharp corners.
    function toSmoothPath(p) {
      if (p.length < 3) return 'M ' + p.map((q) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(' L ');
      const k = 1;                              // smoothing/tension (1 = standard Catmull-Rom; lower = tighter)
      let d = `M ${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}`;
      for (let i = 0; i < p.length - 1; i++) {
        const p0 = p[i - 1] || p[i];
        const p1 = p[i];
        const p2 = p[i + 1];
        const p3 = p[i + 2] || p2;
        const c1x = p1[0] + ((p2[0] - p0[0]) / 6) * k;
        const c1y = p1[1] + ((p2[1] - p0[1]) / 6) * k;
        const c2x = p2[0] - ((p3[0] - p1[0]) / 6) * k;
        const c2y = p2[1] - ((p3[1] - p1[1]) / 6) * k;
        d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
      }
      return d;
    }

    // Build a meandering route that wanders (extra random turns) and tucks toward each image.
    let pathLen = 0;
    function buildPath() {
      if (!svg || !base || window.innerWidth <= 768) return;
      const W = section.clientWidth;
      const H = section.offsetHeight;
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      const cx = W / 2;
      const A    = Math.min(W * 0.18, 230);   // swing amplitude
      const LEAD = Math.min(H * 0.05, 120);
      const INTER = 2;                          // extra random waypoints between beats

      let fi = 0;
      const nextF = () => FACTORS[(fi++) % FACTORS.length];
      const pts = [[cx, 0], [cx, LEAD]];
      let prevY = LEAD;

      beats.forEach((beat) => {
        const by = beat.offsetTop + beat.offsetHeight / 2;
        const bx = cx + (beat.dataset.side === 'left' ? -A : A);
        for (let s = 1; s <= INTER; s++) {
          const t = s / (INTER + 1);
          pts.push([cx + nextF() * A, prevY + (by - prevY) * t]);
        }
        pts.push([bx, by]);   // route tucks to the image
        prevY = by;
      });
      // wander down to the bottom and recenter
      pts.push([cx + nextF() * A, prevY + (H - prevY) * 0.45]);
      pts.push([cx, H - LEAD]);
      pts.push([cx, H]);

      const d = toSmoothPath(pts);
      base.setAttribute('d', d);
      trail.setAttribute('d', d);
      pathLen = base.getTotalLength();
      // base line is fully visible (#77badb); trail (white) is hidden until the dot passes
      trail.style.strokeDasharray = pathLen;
      if (trail.style.strokeDashoffset === '') trail.style.strokeDashoffset = pathLen;
      placeDot(currentProgress);
    }

    function placeDot(p) {
      if (!pathLen || !dot) return;
      trail.style.strokeDashoffset = pathLen * (1 - p);   // white fills in behind the dot
      const pt = base.getPointAtLength(pathLen * p);
      dot.style.left = (pt.x - dot.offsetWidth / 2) + 'px';
      dot.style.top  = (pt.y - dot.offsetHeight / 2) + 'px';
    }

    let currentProgress = 0;
    if (svg && base && typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.create({
        trigger: section,
        start: 'top center',
        end: 'bottom bottom',
        scrub: true,
        onRefresh: buildPath,
        onUpdate: (self) => { currentProgress = self.progress; placeDot(self.progress); },
      });
      buildPath();
    }

    // Each beat's image and copy reveal as the route reaches it.
    beats.forEach((beat) => {
      const img   = beat.querySelector('.bj-img');
      const title = beat.querySelector('.bj-title');
      const body  = beat.querySelector('.bj-body');
      const fromX = beat.dataset.side === 'right' ? 40 : -40;

      gsap.set(img,  { opacity: 0, x: fromX });
      gsap.set([title, body], { opacity: 0, y: 28 });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: beat, start: 'top 72%', toggleActions: 'play none none reverse' },
        defaults: { ease: 'power2.out' },
      });
      tl.to(img,   { opacity: 1, x: 0, duration: 0.8 }, 0)
        .to(title, { opacity: 1, y: 0, duration: 0.6 }, 0.25)
        .to(body,  { opacity: 1, y: 0, duration: 0.6 }, 0.4);
    });

    // End of the section: the warranty block reveals while the topo map + route line fade away.
    if (diff) {
      gsap.to(diff, {
        opacity: 1, y: 0, duration: 0.9, ease: 'power2.out',
        scrollTrigger: { trigger: diff, start: 'top 82%', toggleActions: 'play none none reverse' },
      });
      const fade = [topo, svg, dot].filter(Boolean);
      gsap.to(fade, {
        opacity: 0, ease: 'none',
        scrollTrigger: { trigger: diff, start: 'top 92%', end: 'top 48%', scrub: true },
      });
    }
  }

  /* ---------- Popular Models Carousel ---------- */
  function initModelCarousel() {
    const track   = document.getElementById('models-track');
    if (!track) return;
    console.log('[Jayco v3] popular models: favorites-1');

    const cards   = track.querySelectorAll('.fav-card');
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

  /* ---------- Model Types — centered coverflow carousel ---------- */
  function initModelTypes() {
    const track = document.getElementById('mt-track');
    if (!track) return;
    console.log('[Jayco v3] model carousel: coverflow-2 (bottom-aligned + grow)');

    const viewport = track.parentElement;            // .mt-viewport
    const slides   = Array.from(track.querySelectorAll('.mt-slide'));
    const prevBtn  = document.getElementById('mt-prev');
    const nextBtn  = document.getElementById('mt-next');
    const caption  = document.getElementById('mt-caption');
    const nameEl   = caption && caption.querySelector('.mt-name');
    const tagEl    = caption && caption.querySelector('.mt-tagline');
    const btnEl    = caption && caption.querySelector('.mt-btn');
    const buildImg = caption && caption.querySelector('.mt-build-img');
    const n = slides.length;
    if (!n || !prevBtn || !nextBtn || !caption) return;
    let current = 0;

    // center the active slide; recomputed whenever the viewport (section) width changes.
    // animate=false snaps instantly (used while the section width is animating on scroll).
    function applyTransform(animate) {
      // offsetWidth = unscaled layout width (getBoundingClientRect would include the scale transform)
      const slideW = slides[0].offsetWidth;
      const gap    = parseFloat(getComputedStyle(track).gap) || 0;
      const vp     = viewport.clientWidth;
      const offset = (vp - slideW) / 2 - current * (slideW + gap);
      track.style.transition = animate ? '' : 'none';   // '' falls back to the CSS 0.6s ease
      track.style.transform  = `translateX(${offset}px)`;
    }

    function goTo(index) {
      current = Math.max(0, Math.min(index, n - 1));
      applyTransform(true);
      slides.forEach((s, k) => s.classList.toggle('is-active', k === current));
      prevBtn.classList.toggle('disabled', current === 0);
      nextBtn.classList.toggle('disabled', current === n - 1);

      // caption shows the centered model (text appears once centered)
      const s = slides[current];
      const name = s.dataset.name || '';
      nameEl.textContent = name;
      tagEl.textContent  = s.dataset.tagline || '';
      btnEl.textContent  = 'Explore ' + name;
      // Build Yours button shows the centered model's image
      if (buildImg) {
        const img = s.querySelector('.mt-img');
        buildImg.src = img ? img.getAttribute('src') : '';
        buildImg.alt = name;
      }
      gsap.fromTo(caption, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
    }

    prevBtn.addEventListener('click', () => { if (current > 0) goTo(current - 1); });
    nextBtn.addEventListener('click', () => { if (current < n - 1) goTo(current + 1); });
    slides.forEach((s, i) => s.addEventListener('click', () => { if (i !== current) goTo(i); }));
    window.addEventListener('resize', () => applyTransform(false));

    // Headlines stack in one spot and replace each other on scroll: 1 → 2 → 3.
    const header   = document.querySelector('.model-carousel-header');
    const mcSection = document.querySelector('.model-carousel');
    const mcLines  = header ? header.querySelectorAll('.mc-line') : [];
    if (header && mcLines.length >= 3 && mcSection && typeof ScrollTrigger !== 'undefined') {
      gsap.set(mcLines, { opacity: 0, y: 28 });
      const swap = gsap.timeline({
        defaults: { ease: 'sine.inOut', duration: 1 },
        // scrub:1 adds ~1s of inertia so the crossfade glides instead of snapping with the scroll
        scrollTrigger: { trigger: mcSection, start: 'top 82%', end: 'top 6%', scrub: 1 },
      });
      swap
        .to(mcLines[0], { opacity: 1, y: 0 },   0.0)   // 1st appears
        .to(mcLines[0], { opacity: 0, y: -28 }, 1.6)   // 1st leaves up…  (overlaps 2nd's entrance → true crossfade)
        .to(mcLines[1], { opacity: 1, y: 0 },   1.6)   // …2nd replaces it in place
        .to(mcLines[1], { opacity: 0, y: -28 }, 3.2)
        .to(mcLines[2], { opacity: 1, y: 0 },   3.2);  // 3rd replaces it, stays
    }

    goTo(0);
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

  /* ---------- Newsletter Signup ---------- */
  function initNewsletter() {
    const form = document.querySelector('.nl-form');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const box = form.closest('.newsletter-box');
      form.style.display = 'none';
      const note = box && box.querySelector('.nl-note');
      if (note) note.textContent = 'Thanks for subscribing! Keep an eye on your inbox.';
    });
  }

  /* ---------- Init All ---------- */
  function initAnimations() {
    gsap.registerPlugin(ScrollTrigger);
    initLenis();
    initHeader();
    initHero();
    initHeroCtas();
initParallax();
    initDealerMap();
    initDealerParallax();
    initNewsParallax();
    initBuildJourney();
    initModelTypes();
    initModelCarousel();
    initCategories();
    initSectionAnimations();
    initCursor();
    initNewsCards();
    initFinalCta();
    initFaq();
    initNewsletter();
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
