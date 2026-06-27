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

  /* ---------- Hero Entry Animations ---------- */
  function initHero() {
    const eyebrow  = document.querySelector('.hero-eyebrow');
    const words    = document.querySelectorAll('.hero-heading .word');
    const tagline  = document.querySelector('.hero-tagline');
    const ctas     = document.querySelector('.hero-ctas');

    const tl = gsap.timeline({ delay: 0.4 });

    tl.to(eyebrow, { opacity: 1, y: 0, duration: 1.0, ease: 'power2.out' })
      .to(words, { opacity: 1, y: 0, stagger: 0.16, duration: 1.2, ease: 'power2.out' }, '-=0.5')
      .to(tagline, { opacity: 1, y: 0, duration: 1.0, ease: 'power2.out' }, '-=0.4')
      .to(ctas,    { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out' }, '-=0.4');
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

      card.addEventListener('mouseenter', () => {
        video.play();
        if (cursor) cursor.classList.add('reading');
      });
      card.addEventListener('mouseleave', () => {
        video.pause();
        video.currentTime = 0.001;
        if (cursor) cursor.classList.remove('reading');
      });
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

  /* ---------- Final CTA ---------- */
  function initFinalCta() {
    const section  = document.getElementById('final-cta');
    if (!section) return;
    const video    = section.querySelector('.final-cta-video');
    const children = section.querySelectorAll('.section-label, .cta-heading, .cta-body, .cta-buttons');

    // Hide text until video finishes
    gsap.set(children, { opacity: 0, y: 28 });

    if (!video) return;

    function setupScrollVideo() {
      const duration       = video.duration;
      const scrollDistance = Math.round(duration * 180);

      // Prime the decode pipeline so the first frame paints and seeking is reliable.
      // The video is muted, so autoplay policies allow this.
      video.play().then(() => video.pause()).catch(() => {});

      // Rapid scroll issues seeks faster than the decoder can finish them, and
      // overlapping seeks get dropped — which is what leaves the video stuck on
      // frame 0. Track the pending seek and only apply the latest target once the
      // previous one resolves, so the frame keeps tracking scroll.
      let seeking    = false;
      let pendingTime = null;

      function seekTo(time) {
        if (seeking) {
          pendingTime = time;
          return;
        }
        seeking = true;
        video.currentTime = time;
      }

      video.addEventListener('seeked', () => {
        seeking = false;
        if (pendingTime !== null) {
          const next = pendingTime;
          pendingTime = null;
          seekTo(next);
        }
      });

      let revealed = false;

      const trigger = ScrollTrigger.create({
        trigger:       section,
        start:         'top top',
        end:           `+=${scrollDistance}`,
        pin:           true,
        anticipatePin: 1,
        scrub:         true,
        onUpdate(self) {
          seekTo(self.progress * duration);

          const threshold = (duration - 2) / duration;
          if (self.progress >= threshold && !revealed) {
            revealed = true;
            gsap.to(children, {
              opacity: 1,
              y: 0,
              stagger: 0.18,
              duration: 1.0,
              ease: 'power2.out',
            });
          } else if (self.progress < threshold && revealed) {
            revealed = false;
            gsap.to(children, { opacity: 0, y: 28, duration: 0.25 });
          }
        },
      });

      ScrollTrigger.refresh();

      // If the video finished loading while the user was already inside the pinned
      // range, sync the frame to the current scroll position instead of frame 0.
      seekTo(trigger.progress * duration);
    }

    // Wait for actual frame data (HAVE_CURRENT_DATA), not just metadata — otherwise
    // seeks fire before any frame is buffered and the video stays on frame 0.
    if (video.readyState >= 2) {
      setupScrollVideo();
    } else {
      video.addEventListener('loadeddata', setupScrollVideo, { once: true });
    }
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
      if (e.target.closest('a, button, [role="button"], .category-card') && !e.target.closest('.news-card') && !e.target.closest('.model-review-btn')) {
        cursor.classList.add('hovering');
      }
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest('a, button, [role="button"], .category-card') && !e.target.closest('.news-card') && !e.target.closest('.model-review-btn')) {
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

  /* ---------- Crafted For — Pinned Wipe Section ---------- */
  function initCraftedSection() {
    const section = document.getElementById('crafted');
    if (!section) return;

    const panel2           = document.getElementById('crafted-panel-2');
    const panel3           = document.getElementById('crafted-panel-3');
    const panel4           = document.getElementById('crafted-panel-4');
    const wordRoad         = document.getElementById('word-road');
    const wordComfort      = document.getElementById('word-comfort');
    const wordYou          = document.getElementById('word-you');
    const wordExploration  = document.getElementById('word-exploration');

    const stats = section.querySelectorAll('.crafted-stat');

    gsap.set([panel2, panel3, panel4], { yPercent: 100 });
    gsap.set(wordRoad,    { opacity: 1, y: 0 });
    gsap.set([wordComfort, wordYou, wordExploration], { opacity: 0, y: 30 });
    gsap.set(stats, { opacity: 0, y: 14 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: '+=400%',
        scrub: true,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
      },
    });

    tl
      .to(panel2,          { yPercent: 0,  ease: 'none',        duration: 1    }, 0)
      .to(wordRoad,        { opacity: 0,   y: -30, duration: 0.2, ease: 'power1.in'  }, 0.35)
      .fromTo(wordComfort, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.25, ease: 'power1.out' }, 0.6)
      .to(panel3,              { yPercent: 0,  ease: 'none',        duration: 1    }, 1)
      .to(wordComfort,         { opacity: 0,   y: -30, duration: 0.2, ease: 'power1.in'  }, 1.35)
      .fromTo(wordExploration, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.25, ease: 'power1.out' }, 1.6)
      .to(panel4,              { yPercent: 0,  ease: 'none',        duration: 1    }, 2)
      .to(wordExploration,     { opacity: 0,   y: -30, duration: 0.2, ease: 'power1.in'  }, 2.35)
      .fromTo(wordYou,         { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.25, ease: 'power1.out' }, 2.6);

    stats.forEach((stat, i) => {
      tl.to(stat, { opacity: 1, y: 0, duration: 0.18, ease: 'power1.out' }, 3.0 + i * 0.2);
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

  /* ---------- Model Card Reviews ---------- */
  const modelReviews = {
    'Greyhawk': [
      { headline: 'A home that goes everywhere.', review: 'We\'ve crossed 22 states in our Greyhawk. The living space feels genuinely residential — full kitchen, comfortable beds, and enough storage for months on the road.', byline: 'Mark & Linda H. — Ohio' },
      { headline: 'Family adventures redefined.', review: 'Four kids and a dog. The Greyhawk handles it all with ease. Storage is incredible and the kids love their own sleeping space.', byline: 'The Williams Family — Georgia' },
      { headline: 'Worth every penny.', review: 'Retired last year and bought the Greyhawk. It\'s been flawless across 14,000 miles. Build quality is head and shoulders above anything else I tested.', byline: 'Don F. — Arizona' },
    ],
    'Alante': [
      { headline: 'Grand touring at its best.', review: 'The Alante drives like a dream and lives even better. We park it at campgrounds and people stop to ask about it every single time.', byline: 'Robert & Jan S. — California' },
      { headline: 'Full-time living, no compromises.', review: 'We sold our house and hit the road in an Alante. A year in and we couldn\'t be happier — it has everything we need and more.', byline: 'Chris & Amy D. — Colorado' },
      { headline: 'Our home on wheels.', review: 'The quality of the cabinetry, the slide-outs, the kitchen — everything is top tier. Jayco clearly put thought into every detail.', byline: 'Tom K. — Tennessee' },
    ],
    'Swift': [
      { headline: 'Light, quick, and incredibly capable.', review: 'Hitches up in minutes and handles mountain passes with no drama. We\'ve taken it to Glacier, Zion, and Acadia — it never skips a beat.', byline: 'Jake M. — Montana' },
      { headline: 'Perfect for weekend warriors.', review: 'We use it almost every weekend from May to October. Setup is fast, tow weight is manageable, and the interior is surprisingly well-appointed.', byline: 'Sarah & Ben T. — Colorado' },
      { headline: 'Converted us to RV life.', review: 'We were tent campers for 20 years. The Swift changed everything — comfortable, well-built, and priced just right.', byline: 'Paul & Diane N. — Wisconsin' },
    ],
    'Pinnacle': [
      { headline: 'Luxury that actually delivers.', review: 'I\'ve owned three fifth wheels over the years. The Pinnacle is in a different class entirely — fit, finish, and feature list are all exceptional.', byline: 'Gary L. — Texas' },
      { headline: 'Our retirement dream come true.', review: 'Spent a year researching fifth wheels before choosing the Pinnacle. Best decision we ever made. The master suite alone is worth it.', byline: 'Frank & Mary B. — Florida' },
      { headline: 'Neighbors keep asking for a tour.', review: 'Everyone at the campground wants to see inside. The kitchen layout, the fireplace, the bedroom — it genuinely feels like a luxury apartment.', byline: 'Kevin & Trish O. — Michigan' },
    ],
    'North Point': [
      { headline: 'Sets the standard for luxury.', review: 'We\'ve stayed in five-star hotels that don\'t feel this premium. The attention to detail in the North Point is remarkable.', byline: 'David & Susan M. — California' },
      { headline: 'Full-timing made effortless.', review: 'Three years full-time in our North Point. The quality holds up beautifully and Jayco support has been outstanding every step of the way.', byline: 'Jim & Carla W. — Texas' },
      { headline: 'Nothing else comes close.', review: 'Looked at everything on the market before settling on the North Point. Once you step inside, the competition simply doesn\'t exist.', byline: 'Ray P. — Colorado' },
    ],
    'Jay Feather': [
      { headline: 'Light enough, fun enough, perfect enough.', review: 'At 6,200 lbs, our half-ton tows it without breaking a sweat. Interior is thoughtfully designed with storage for all our gear.', byline: 'Alex T. — Oregon' },
      { headline: 'The ultimate getaway machine.', review: 'We leave Friday evening and we\'re set up at the campsite by dark. The Jay Feather makes weekend trips feel completely effortless.', byline: 'Meg & Chris R. — Washington' },
      { headline: 'Our first trailer, and our best.', review: 'Easy to tow, quick to set up, and comfortable enough to stay a week. Couldn\'t have chosen a better first RV.', byline: 'Lisa & Tom P. — Idaho' },
    ],
  };

  function initModelReviews() {
    document.querySelectorAll('.model-card').forEach((card) => {
      const modelName = card.querySelector('.card-top h3')?.textContent.trim();
      const reviews   = modelReviews[modelName];
      if (!reviews?.length) return;

      const modal        = card.querySelector('.model-review-modal');
      const headline     = modal.querySelector('.model-review-headline');
      const text         = modal.querySelector('.model-review-text');
      const byline       = modal.querySelector('.model-review-byline');
      const reviewBtn    = card.querySelector('.model-review-btn');
      const nextBtn      = modal.querySelector('.model-review-next');
      const closeBtn     = modal.querySelector('.model-review-close');
      const reviewImgEl  = modal.querySelector('.model-review-model-img');
      const buildImg     = card.querySelector('.model-build-img');
      if (reviewImgEl && buildImg) {
        reviewImgEl.src = buildImg.getAttribute('src');
        reviewImgEl.alt = modelName;
      }

      let idx = 0;

      function showReview(i) {
        const r = reviews[i];
        headline.textContent = r.headline;
        text.textContent     = r.review;
        byline.textContent   = r.byline;
      }

      reviewBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showReview(idx);
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
      });

      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        idx = (idx + 1) % reviews.length;
        showReview(idx);
      });

      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
      });
    });
  }

  /* ---------- Review Cursor ---------- */
  function initReviewCursor() {
    const cursor = document.querySelector('.cursor');
    if (!cursor) return;

    document.querySelectorAll('.model-review-btn').forEach((btn) => {
      btn.addEventListener('mouseenter', () => cursor.classList.add('reviewing'));
      btn.addEventListener('mouseleave', () => cursor.classList.remove('reviewing'));
    });
  }

  /* ---------- Quiz Prompt Cards ---------- */
  function initQuizCards() {
    const section = document.querySelector('#feature');
    const card    = section ? section.querySelector('.quiz-card') : null;
    const textEl  = card ? card.querySelector('.quiz-card-text') : null;
    if (!textEl) return;

    const questions = [
      'What is a great model for my family?',
      'I need a full size kitchen.',
      'I need off-road capability.',
      'What size RV can I tow?',
      'I need to be able to sleep 6 people.',
      'What is the water capacity?',
      'I need this to be a smooth drive.',
      "I'm more interested in comfort.",
    ];

    let started = false;
    let index   = 0;

    const wait = (ms) => new Promise((res) => setTimeout(res, ms));

    async function typeOut(text) {
      for (let i = 1; i <= text.length; i++) {
        textEl.textContent = text.slice(0, i);
        await wait(48);
      }
    }

    async function eraseAll() {
      const len = textEl.textContent.length;
      for (let i = len - 1; i >= 0; i--) {
        textEl.textContent = textEl.textContent.slice(0, i);
        await wait(24);
      }
    }

    async function runLoop() {
      while (true) {
        await typeOut(questions[index]);
        await wait(1800);
        await eraseAll();
        await wait(320);
        index = (index + 1) % questions.length;
      }
    }

    gsap.set(card, { opacity: 0, y: 16 });

    const observer = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting || started) return;
      started = true;
      gsap.to(card, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power2.out',
        onComplete: runLoop,
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

  /* ---------- Init All ---------- */
  function initAnimations() {
    gsap.registerPlugin(ScrollTrigger);
    initLenis();
    initHeader();
    initHero();
initParallax();
    initDealerMap();
    initCraftedSection();
    initModelCarousel();
    initModelReviews();
    initCategories();
    initSectionAnimations();
    initQuizCards();
    initCursor();
    initNewsCards();
    initReviewCursor();
    initFinalCta();
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
