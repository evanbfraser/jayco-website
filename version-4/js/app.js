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
    // other page scripts (model-detail.js) scroll through the same instance
    window.__jaycoLenis = lenis;
  }

  /* ---------- Header ---------- */
  function initHeader() {
    const header    = document.getElementById('site-header');

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
  }

  /* ---------- Mobile full-screen menu ----------
     Builds the RVs → category → model accordion from window.JAYCO,
     and drives open/close + nested expand behaviour. */
  function initMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const menu      = document.getElementById('mobile-menu');
    if (!hamburger || !menu) return;

    // ----- build the RVs accordion from the model data -----
    const data = window.JAYCO;
    const catsWrap = document.getElementById('mm-rvs-cats');
    if (data && catsWrap) {
      const priceFmt = (n) =>
        '$' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

      // only models with a detail record get a working Explore link
      const detail = window.JAYCO_MODEL_DETAIL || {};
      const exploreHref = (id) => (detail[id] ? 'model.html?model=' + id : '#');

      // group models by category id, preserving data order
      // (each row carries its slug so it can link to the model detail page)
      const byCat = {};
      Object.keys(data.models).forEach((id) => {
        const m = data.models[id];
        (byCat[m.category] = byCat[m.category] || []).push(Object.assign({ slug: id }, m));
      });

      data.categories.forEach((cat) => {
        const models = byCat[cat.id];
        if (!models || !models.length) return;   // skip empty classes

        const rows = models.map((m) => `
          <div class="mm-model">
            <img class="mm-model-img" src="${m.img}" alt="" loading="lazy" />
            <div class="mm-model-text">
              <span class="mm-model-name">${m.name}</span>
              <span class="mm-model-price">Starting at ${priceFmt(m.basePrice)}</span>
              <div class="mm-model-ctas">
                <a href="${exploreHref(m.slug)}" class="mm-model-cta mm-model-discover">Explore</a>
                <a href="#" class="mm-model-cta mm-model-build">Build Yours</a>
              </div>
            </div>
          </div>`).join('');

        const group = document.createElement('div');
        group.className = 'mm-cat';
        group.innerHTML = `
          <button class="mm-cat-btn" aria-expanded="false">
            <span>${cat.name}</span>
            <svg class="mm-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
          </button>
          <div class="mm-cat-panel">${rows}</div>`;
        catsWrap.appendChild(group);
      });
    }

    // ----- build the remaining nav groups from the footer columns -----
    // The footer already lists every sub-page per section; mirror it here so the
    // two stay in sync. RVs is handled above (model browser), so skip that column.
    const nav = menu.querySelector('.mm-nav');
    let panelId = 0;
    document.querySelectorAll('.footer-col').forEach((col) => {
      const heading = col.querySelector('h4');
      const links   = col.querySelectorAll('ul a');
      if (!heading || !links.length) return;
      if (heading.textContent.trim().toLowerCase() === 'rvs') return;  // special-cased above

      const id = `mm-sub-${panelId++}`;
      const items = Array.from(links).map((a) =>
        `<a href="${a.getAttribute('href') || '#'}" class="mm-sublink">${a.textContent.trim()}</a>`
      ).join('');

      const group = document.createElement('div');
      group.className = 'mm-group';
      group.innerHTML = `
        <button class="mm-top" data-target="${id}" aria-expanded="false">
          <span>${heading.textContent.trim()}</span>
          <svg class="mm-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
        </button>
        <div class="mm-panel" id="${id}"><div class="mm-sublinks">${items}</div></div>`;
      nav.appendChild(group);
    });

    // ----- generic accordion toggle (works for RVs panel + category panels) -----
    function bindToggle(btn, panel) {
      btn.addEventListener('click', () => {
        const open = panel.classList.toggle('open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }
    // top-level expandable groups (currently just RVs)
    menu.querySelectorAll('.mm-top[data-target]').forEach((btn) => {
      const panel = document.getElementById(btn.dataset.target);
      if (panel) bindToggle(btn, panel);
    });
    // category rows (built above)
    menu.querySelectorAll('.mm-cat-btn').forEach((btn) => {
      bindToggle(btn, btn.nextElementSibling);
    });

    // ----- open / close the whole menu -----
    function setMenu(open) {
      hamburger.classList.toggle('open', open);
      menu.classList.toggle('open', open);
      document.body.classList.toggle('menu-open', open);
      hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
      menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    }

    hamburger.addEventListener('click', () => {
      setMenu(!menu.classList.contains('open'));
    });

    // close when any real link inside the menu is tapped
    menu.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => setMenu(false));
    });

    // close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('open')) setMenu(false);
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
      const prime = () => {
        const p = video.play();
        if (p && p.then) p.then(() => video.pause()).catch(() => {});
      };
      prime();
      // iOS in Low Power Mode refuses play() until a gesture — retry on first touch
      document.addEventListener('touchstart', prime, { once: true, passive: true });

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
        // centre the section in the viewport before pinning — it is shorter than
        // 100vh on mobile, so 'top top' would leave it hanging with a gap below.
        // For a full-height section this resolves to the same point as 'top top'.
        start:         'center center',
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
    // iOS is unreliable about firing loadeddata for a never-played video, so listen
    // on several events and run once, whichever arrives first.
    let didSetup = false;
    const runSetup = () => {
      // without a real duration the scrub distance would collapse to ~1px
      if (didSetup || !isFinite(video.duration) || video.duration <= 0) return;
      didSetup = true;
      setupScrollVideo();
    };

    if (video.readyState >= 2) {
      runSetup();
    } else {
      ['loadeddata', 'loadedmetadata', 'canplay'].forEach((ev) => {
        video.addEventListener(ev, runSetup);
      });
      // iOS may not begin fetching on its own with preload="auto"
      try { video.load(); } catch (e) {}
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
    cursor.innerHTML = '<span class="cursor-label cursor-label--article">Read Article</span><span class="cursor-label cursor-label--specs">View Model<br>Specs</span><span class="cursor-label cursor-label--chat">Let\'s Chat</span><span class="cursor-label cursor-label--tour">View 3D Model</span>';
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

    // Grow + intensify glow over interactive elements (exclude news cards, specs
    // buttons and the floorplan 3D tour — they each expand into a labelled state)
    const OWN_STATE = '.news-card, .model-specs-btn, .hero-chat-btn, .md-plan-360';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest('a, button, [role="button"], .category-card') && !e.target.closest(OWN_STATE)) {
        cursor.classList.add('hovering');
      }
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest('a, button, [role="button"], .category-card') && !e.target.closest(OWN_STATE)) {
        cursor.classList.remove('hovering');
      }
    });
  }

  /* ---------- Dealer Locator Map ---------- */
  function initDealerMap() {
    if (!document.getElementById('dealer-map')) return;
    if (typeof L === 'undefined') return;

    const map = L.map('dealer-map', {
      // shifted north of the old US-only center so the Canadian dealers sit in frame
      center: [43.5, -96],
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

      // ---- Canada ----
      { name: 'Jayco of Vancouver',    lat: 49.28,  lng: -123.12 },
      { name: 'Jayco of Kelowna',      lat: 49.89,  lng: -119.50 },
      { name: 'Jayco of Calgary',      lat: 51.05,  lng: -114.07 },
      { name: 'Jayco of Edmonton',     lat: 53.55,  lng: -113.49 },
      { name: 'Jayco of Saskatoon',    lat: 52.13,  lng: -106.67 },
      { name: 'Jayco of Regina',       lat: 50.45,  lng: -104.62 },
      { name: 'Jayco of Winnipeg',     lat: 49.90,  lng:  -97.14 },
      { name: 'Jayco of Thunder Bay',  lat: 48.38,  lng:  -89.25 },
      { name: 'Jayco of London',       lat: 42.98,  lng:  -81.25 },
      { name: 'Jayco of Toronto',      lat: 43.65,  lng:  -79.38 },
      { name: 'Jayco of Ottawa',       lat: 45.42,  lng:  -75.70 },
      { name: 'Jayco of Montreal',     lat: 45.50,  lng:  -73.57 },
      { name: 'Jayco of Quebec City',  lat: 46.81,  lng:  -71.21 },
      { name: 'Jayco of Moncton',      lat: 46.09,  lng:  -64.78 },
      { name: 'Jayco of Halifax',      lat: 44.65,  lng:  -63.58 },
      { name: "Jayco of St. John's",   lat: 47.56,  lng:  -52.71 },
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
      'vancouver':   [49.28, -123.12],
      'calgary':     [51.05, -114.07],
      'edmonton':    [53.55, -113.49],
      'winnipeg':    [49.90,  -97.14],
      'toronto':     [43.65,  -79.38],
      'ottawa':      [45.42,  -75.70],
      'montreal':    [45.50,  -73.57],
      'quebec':      [46.81,  -71.21],
      'halifax':     [44.65,  -63.58],
      'saskatoon':   [52.13, -106.67],
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

    const stage = section.querySelector('.builtfor-stage');
    const video = section.querySelector('.builtfor-video');
    const lines = section.querySelectorAll('.builtfor-line');
    const btn   = section.querySelector('.builtfor-btn');
    if (!stage || !video || lines.length < 2) return;

    const clamp01 = (n) => Math.max(0, Math.min(1, n));

    const mm = gsap.matchMedia();

    // ---- Pinned scroll-scrub, container expands, text crossfades (all widths) ----
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      let onSeeked = null;
      let onLoaded = null;

      function setupScrollVideo() {
        const duration       = video.duration || 1;
        // shorter scrub on phones — 160px/sec would be a very long pin on a small viewport
        const pxPerSecond    = window.innerWidth <= 860 ? 100 : 160;
        const scrollDistance = Math.round(duration * pxPerSecond);

        // Prime the decode pipeline so the first frame paints and seeking is reliable.
        const prime = () => {
          const p = video.play();
          if (p && p.then) p.then(() => video.pause()).catch(() => {});
        };
        prime();
        // iOS in Low Power Mode refuses play() until a gesture — retry on first touch
        document.addEventListener('touchstart', prime, { once: true, passive: true });

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
          refreshPriority: 2,   // DOM-order pin refresh — see #categories
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
      // iOS is unreliable about firing loadeddata for a never-played video, so
      // listen on several events and run once, whichever arrives first.
      let didSetup = false;
      const runSetup = () => {
        // without a real duration the scrub distance would collapse to ~1px
        if (didSetup || !isFinite(video.duration) || video.duration <= 0) return;
        didSetup = true;
        setupScrollVideo();
      };
      const LOAD_EVENTS = ['loadeddata', 'loadedmetadata', 'canplay'];

      if (video.readyState >= 2) {
        runSetup();
      } else {
        onLoaded = runSetup;
        LOAD_EVENTS.forEach((ev) => video.addEventListener(ev, onLoaded));
        // iOS may not begin fetching on its own with preload="auto"
        try { video.load(); } catch (e) {}
      }

      // matchMedia auto-kills the ScrollTrigger; clean up our own listeners + inline styles.
      return () => {
        if (onSeeked) video.removeEventListener('seeked', onSeeked);
        if (onLoaded) LOAD_EVENTS.forEach((ev) => video.removeEventListener(ev, onLoaded));
        stage.style.removeProperty('--exp');
        lines[0].style.opacity = '';
        lines[1].style.opacity = '';
        if (btn) { btn.style.opacity = ''; btn.style.transform = ''; btn.style.pointerEvents = ''; }
      };
    });

    // ---- Reduced motion: full-width looping video, both lines shown ----
    mm.add('(prefers-reduced-motion: reduce)', () => {
      stage.style.clipPath = 'none';
      video.loop = true;
      video.play().catch(() => {});
      return () => {
        video.loop = false;
        stage.style.clipPath = '';
      };
    });
  }

  /* ---------- Jayco Difference — icon + stats reveal ---------- */
  function initDifference() {
    const section = document.getElementById('difference');
    if (!section) return;
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

  /* ---------- Popular Models Carousel ---------- */
  function initModelCarousel() {
    const track   = document.getElementById('models-track');
    if (!track) return;

    const cards   = track.querySelectorAll('.model-card');
    const prevBtn = document.getElementById('models-prev');
    const nextBtn = document.getElementById('models-next');
    let current = 0;

    // mobile shows a single card (plus a peek of the next), desktop shows three
    function visibleCount() {
      return window.innerWidth <= 768 ? 1 : 3;
    }
    function maxIndex() {
      return Math.max(0, cards.length - visibleCount());
    }

    function cardWidth() {
      return cards[0].getBoundingClientRect().width;
    }
    function gapPx() {
      return parseFloat(getComputedStyle(track).gap) || 28;
    }

    function goTo(index) {
      const last = maxIndex();
      current = Math.max(0, Math.min(index, last));
      track.style.transform = `translateX(-${current * (cardWidth() + gapPx())}px)`;
      prevBtn.classList.toggle('disabled', current === 0);
      nextBtn.classList.toggle('disabled', current === last);
    }

    prevBtn.addEventListener('click', () => { if (current > 0) goTo(current - 1); });
    nextBtn.addEventListener('click', () => { if (current < maxIndex()) goTo(current + 1); });

    // card width is viewport-relative on mobile — re-measure when it changes
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => goTo(current), 150);
    });

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

  /* ---------- Autoplay videos — play only while on screen ----------
     iOS Safari throttles multiple inline videos buffering/decoding at once,
     which left the quiz video blank on mobile. Gate playback on visibility. */
  function initVideoVisibility() {
    const videos = document.querySelectorAll('.hero-bg video, .quiz-video');
    if (!videos.length || !('IntersectionObserver' in window)) return;

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const v = entry.target;
        if (entry.isIntersecting) {
          // play() rejects if the gesture/power policy blocks it — harmless
          const p = v.play();
          if (p && p.catch) p.catch(() => {});
        } else if (!v.paused) {
          v.pause();
        }
      });
    }, { threshold: 0.1 });

    videos.forEach((v) => io.observe(v));
  }

  /* ---------- Hero AI Chat Button — "Let's Chat" cursor ---------- */
  function initChatCursor() {
    const cursor = document.querySelector('.cursor');
    const btn = document.getElementById('hero-chat-btn');
    if (!cursor || !btn) return;

    btn.addEventListener('mouseenter', () => cursor.classList.add('chat'));
    btn.addEventListener('mouseleave', () => cursor.classList.remove('chat'));
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
    initMobileMenu();
    initHero();
initParallax();
    initDealerMap();
    initBuiltFor();   // pinned scroll-scrub video (#builtfor, below the dealer map)
    initDifference();
    initModelCarousel();
    initModelSpecs();
    initCategories();
    initSectionAnimations();
    initCursor();
    initNewsCards();
    initNewsParallax();
    initSpecsCursor();
    initChatCursor();
    initVideoVisibility();
    initFinalCta();
    initFaq();
    initNewsletter();
    initFooter();
    ScrollTrigger.refresh();
    // page-specific scripts (model-detail.js) register their own ScrollTriggers
    // once GSAP + Lenis are live
    document.dispatchEvent(new CustomEvent('jayco:animations-ready'));
  }

  /* ---------- Boot ---------- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runLoader);
  } else {
    runLoader();
  }

}());
