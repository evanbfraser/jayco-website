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
    if (!header) return;

    /* PLACEHOLDER HREFS in the nav. View Inventory points at a page that is
       still to be built, and "#" is what the site already uses for a
       destination that does not exist yet — the footer is full of them. Left
       bare, though, a click on a header pill scrolls the document to the top,
       and Lenis smooth-scrolls the whole way, which reads as the button
       misfiring rather than as nothing happening. The footer's stubs are quiet
       text links and are deliberately left alone; this is scoped to the two
       action rows, and to "#" alone, so pointing the href at a real page takes
       it out of the net. */
    document.querySelectorAll('.nav-actions a[href="#"], .mm-actions a[href="#"]')
      .forEach((a) => a.addEventListener('click', (e) => e.preventDefault()));

    // Fade-in opacity as user scrolls — fully dark at 320px
    const MAX_OPACITY  = 0.88;
    const FULL_SCROLL  = 320;

    /* Pages that open on a dark hero can let the bar start transparent. Pages
       that open on a light ground cannot — the logo and nav are white, so at
       0% they would sit invisible on canvas until the first scroll. Those set
       data-header="solid" on <body> and get the full state immediately.
       This has to be a JS opt-out, not CSS: the scroll handler below writes
       header.style.background inline, which outranks any stylesheet rule. */
    if (document.body.dataset.header === 'solid') {
      header.style.background = `rgba(0, 0, 0, ${MAX_OPACITY})`;
      header.classList.add('scrolled');
      return;
    }

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

  /* ---------- Desktop navigation ----------
     The six links on the left of the bar become two kinds of menu.

     RVs opens the model drawer, after porsche.com's: a white panel of RV types
     down the left, and beside it a Surface panel of that type's models, each a
     render with its sleeps and length. No prices: the menu is for finding a
     model, and the model and type pages carry the MSRP. Choosing a type, by
     hover, click or arrow key, swaps the second panel. The page behind is
     dimmed and held still, since the drawer is the size of a page.

     The other five open a dropdown of their pages under the link.

     Nothing here is typed twice. The types and models come from models-data.js,
     which every page loads, and the dropdowns from the footer's own columns,
     the list initMobileMenu() already mirrors, so the bar, the phone menu and
     the footer cannot disagree. Built at boot rather than with the animations,
     so the menus work even if GSAP never arrives.

     Hover opens a menu after a short pause, so a pointer crossing the bar on its
     way somewhere else opens nothing; once one is open, moving to another link
     switches straight to it. Click and the keyboard open them too. Only above
     1280px, where the bar shows these links; narrower widths use the phone menu. */
  function initDesktopNav() {
    const header = document.getElementById('site-header');
    const list = header && header.querySelector('.nav-left');
    const data = window.JAYCO;
    if (!list) return;

    const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const CHEVRON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>';
    const ARROW = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
    /* a link that leaves for another site says so, and opens in a new tab */
    const OUT = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8"/></svg>';
    const wide = window.matchMedia('(min-width: 1280px)');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

    /* footer columns by heading: "Find Your RV" -> [{label, href}] */
    const columns = {};
    document.querySelectorAll('.footer-col').forEach((col) => {
      const h = col.querySelector('h4');
      if (!h) return;
      columns[h.textContent.trim().toLowerCase()] = Array.from(col.querySelectorAll('ul a'))
        .map((a) => ({ label: a.textContent.trim(), href: a.getAttribute('href') || '#',
          external: a.getAttribute('target') === '_blank' }));
    });

    const menus = [];      // { trigger, panel, kind, open(), close() }
    let current = null;
    let openTimer = 0, closeTimer = 0;

    /* ---------------- RVs: the model drawer ---------------- */
    function buildDrawer(trigger) {
      if (!data || !data.categories || !data.models) return null;

      const pages = window.JAYCO_MODEL_PAGES || [];
      const modelHref = (slug, cat) => pages.indexOf(slug) !== -1
        ? 'model.html?model=' + slug : 'type.html?type=' + cat;

      const byCat = {};
      Object.keys(data.models).forEach((slug) => {
        const m = data.models[slug];
        (byCat[m.category] = byCat[m.category] || []).push(Object.assign({ slug: slug }, m));
      });
      const cats = data.categories.filter((c) => (byCat[c.id] || []).length);
      if (!cats.length) return null;

      /* the footer's RVs column, less the eight types the drawer already lists */
      const typeHref = /type\.html/;
      const extras = (columns.rvs || []).filter((l) => !typeHref.test(l.href));

      const row = (c) => {
        const ms = byCat[c.id];
        return `
          <button type="button" class="dn-type" role="tab" id="dn-type-${c.id}"
                  aria-selected="false" aria-controls="dn-models" tabindex="-1" data-cat="${c.id}">
            <span class="dn-type-text">
              <span class="dn-type-name">${esc(c.name)}</span>
              <span class="dn-type-meta">${ms.length} model${ms.length > 1 ? 's' : ''}</span>
            </span>
            ${CHEVRON}
          </button>`;
      };
      const group = (type, label) => {
        const rows = cats.filter((c) => c.type === type).map(row).join('');
        return rows ? `<div class="dn-group" role="presentation">
          <span class="dn-group-label" role="presentation">${label}</span>${rows}</div>` : '';
      };

      const drawer = document.createElement('div');
      drawer.className = 'dn-drawer';
      drawer.id = 'dn-drawer';
      drawer.hidden = true;
      drawer.innerHTML = `
        <div class="dn-scrim" data-dn-close="1"></div>
        <div class="dn-panels" role="region" aria-label="RVs">
          <nav class="dn-types" aria-label="RV types" data-lenis-prevent>
            <div class="dn-typelist" role="tablist" aria-orientation="vertical" aria-label="RV types">
              ${group('towable', 'Towable')}
              ${group('motorized', 'Motorized')}
            </div>
            ${extras.length ? `<ul class="dn-extras">${extras.map((l) =>
              `<li><a class="dn-extra" href="${esc(l.href)}">${esc(l.label)}${ARROW}</a></li>`).join('')}
              <li><a class="dn-extra" href="quiz.html">Not sure? Take the RV Finder Quiz${ARROW}</a></li></ul>` : ''}
          </nav>
          <section class="dn-models" id="dn-models" role="tabpanel" data-lenis-prevent></section>
          <button type="button" class="dn-close" aria-label="Close the RVs menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
        </div>`;
      document.body.appendChild(drawer);

      const panel = drawer.querySelector('#dn-models');
      const tabs = Array.from(drawer.querySelectorAll('.dn-type'));
      let active = null, swapTimer = 0, hoverTimer = 0;

      /* The model panel for one type, written when the type is chosen, so the
         renders of the seven types nobody looks at are never requested. */
      function modelsHtml(c) {
        const ms = byCat[c.id];
        const cards = ms.map((m) => {
          const s = m.specs || {};
          const chips = [
            s.Sleeps ? 'Sleeps ' + String(s.Sleeps).replace(/^Up to/, 'up to') : '',
            s.Length || '',
          ].filter(Boolean);
          return `
            <li>
              <a class="dn-model" href="${modelHref(m.slug, c.id)}">
                <span class="dn-model-name">${esc(m.name)}</span>
                <span class="dn-model-art">
                  <img src="../assets/models/web/${m.slug}.webp" alt="" width="400" height="248" decoding="async" />
                </span>
                <span class="dn-model-foot">
                  <span class="dn-chips">${chips.map((t) => `<span class="dn-chip">${esc(t)}</span>`).join('')}</span>
                </span>
              </a>
            </li>`;
        }).join('');
        return `
          <div class="dn-models-inner">
            <header class="dn-models-head">
              <h2 class="dn-models-title">${esc(c.name)}</h2>
              <a class="dn-models-all" href="type.html?type=${c.id}">Explore ${esc(c.name)}${ARROW}</a>
            </header>
            <ul class="dn-model-grid">${cards}</ul>
          </div>
          <div class="dn-models-foot">
            <a class="btn-primary dn-foot-btn" href="build-price.html?type=${c.id}">Build &amp; Price</a>
            <a class="btn-secondary-light dn-foot-btn" href="floorplans.html">View All Floorplans</a>
          </div>`;
      }

      function select(id, instant) {
        const c = cats.find((x) => x.id === id);
        if (!c || id === active) return;
        active = id;
        tabs.forEach((t) => {
          const on = t.dataset.cat === id;
          t.classList.toggle('is-on', on);
          t.setAttribute('aria-selected', on ? 'true' : 'false');
          t.tabIndex = on ? 0 : -1;
        });
        panel.setAttribute('aria-labelledby', 'dn-type-' + id);
        clearTimeout(swapTimer);
        /* the old set leaves before the new one arrives — a straight swap under
           a moving pointer reads as a flicker */
        if (instant || reduce.matches || !panel.firstChild) {
          panel.innerHTML = modelsHtml(c);
          panel.scrollTop = 0;
          return;
        }
        panel.classList.add('is-swapping');
        swapTimer = setTimeout(() => {
          panel.innerHTML = modelsHtml(c);
          panel.scrollTop = 0;
          panel.classList.remove('is-swapping');
        }, 120);
      }

      tabs.forEach((t, i) => {
        t.addEventListener('click', () => select(t.dataset.cat));
        t.addEventListener('focus', () => select(t.dataset.cat));
        /* a short pause before a hover commits, so a diagonal run from the
           list toward a card does not flip the panel through every type the
           pointer crosses on the way */
        t.addEventListener('pointerenter', (e) => {
          if (e.pointerType !== 'mouse') return;
          clearTimeout(hoverTimer);
          hoverTimer = setTimeout(() => select(t.dataset.cat), 90);
        });
        t.addEventListener('pointerleave', () => clearTimeout(hoverTimer));
        t.addEventListener('keydown', (e) => {
          let n = null;
          if (e.key === 'ArrowDown') n = (i + 1) % tabs.length;
          if (e.key === 'ArrowUp') n = (i - 1 + tabs.length) % tabs.length;
          if (e.key === 'Home') n = 0;
          if (e.key === 'End') n = tabs.length - 1;
          if (e.key === 'ArrowRight') {
            e.preventDefault();
            const first = panel.querySelector('a');
            if (first) first.focus();
            return;
          }
          if (n === null) return;
          e.preventDefault();
          tabs[n].focus();
        });
      });
      panel.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowLeft' || !e.target.closest('.dn-model')) return;
        e.preventDefault();
        const on = tabs.find((t) => t.dataset.cat === active);
        if (on) on.focus();
      });

      /* Opens on the type the reader is already looking at, when the page says:
         a type page's ?type=, or a model's own category. Otherwise the first. */
      function startingType() {
        const q = new URLSearchParams(location.search);
        const t = q.get('type');
        if (t && byCat[t]) return t;
        const m = data.models[q.get('model')];
        if (m && byCat[m.category]) return m.category;
        return cats[0].id;
      }

      let hideTimer = 0;
      const menu = {
        trigger: trigger, panel: drawer, kind: 'drawer',
        contains: (el) => drawer.contains(el),
        open(viaKeyboard) {
          clearTimeout(hideTimer);
          select(active || startingType(), true);
          /* the panels start under the bar, whatever height it is at */
          drawer.style.setProperty('--dn-top', Math.round(header.getBoundingClientRect().bottom) + 'px');
          drawer.hidden = false;
          document.body.classList.add('dn-locked');
          if (window.__jaycoLenis && window.__jaycoLenis.stop) window.__jaycoLenis.stop();
          requestAnimationFrame(() => requestAnimationFrame(() => drawer.classList.add('is-open')));
          if (viaKeyboard) {
            const on = tabs.find((t) => t.dataset.cat === active);
            if (on) on.focus();
          }
        },
        close() {
          drawer.classList.remove('is-open');
          document.body.classList.remove('dn-locked');
          if (window.__jaycoLenis && window.__jaycoLenis.start) window.__jaycoLenis.start();
          clearTimeout(hideTimer);
          hideTimer = setTimeout(() => { drawer.hidden = true; }, reduce.matches ? 0 : 420);
        },
      };

      drawer.addEventListener('click', (e) => {
        if (e.target.closest('[data-dn-close]') || e.target.closest('.dn-close')) {
          closeAll(true);
        } else if (e.target.closest('a')) {
          closeAll(false);
        }
      });
      return menu;
    }

    /* ---------------- The other five: dropdowns ---------------- */
    function buildDropdown(li, trigger, links, n) {
      const panel = document.createElement('div');
      panel.className = 'dn-drop';
      panel.id = 'dn-drop-' + n;
      panel.hidden = true;
      panel.innerHTML = `<ul class="dn-drop-list">${links.map((l) => `
        <li><a class="dn-drop-link${l.external ? ' is-external' : ''}" href="${esc(l.href)}"${
          l.external ? ' target="_blank" rel="noopener noreferrer"' : ''}><span>${esc(l.label)}</span>${
          l.external ? OUT + '<span class="sr-only"> (opens in a new tab)</span>' : ARROW}</a></li>`).join('')}
      </ul>`;
      li.appendChild(panel);
      /* stubs the footer carries as "#" do nothing, rather than jumping the page
         to the top — the same rule initHeader applies to the action pills */
      panel.querySelectorAll('a[href="#"]').forEach((a) => {
        a.setAttribute('aria-disabled', 'true');
        a.addEventListener('click', (e) => e.preventDefault());
      });

      let hideTimer = 0;
      return {
        trigger: trigger, panel: panel, kind: 'drop',
        contains: (el) => li.contains(el),
        open(viaKeyboard) {
          clearTimeout(hideTimer);
          panel.hidden = false;
          requestAnimationFrame(() => requestAnimationFrame(() => panel.classList.add('is-open')));
          if (viaKeyboard) {
            const first = panel.querySelector('a');
            if (first) first.focus();
          }
        },
        close() {
          panel.classList.remove('is-open');
          clearTimeout(hideTimer);
          hideTimer = setTimeout(() => { panel.hidden = true; }, reduce.matches ? 0 : 220);
        },
      };
    }

    /* ---------------- wiring ---------------- */
    function openMenu(menu, viaKeyboard) {
      clearTimeout(openTimer);
      clearTimeout(closeTimer);
      if (current === menu) return;
      if (current) closeMenu(current);
      current = menu;
      menu.trigger.setAttribute('aria-expanded', 'true');
      menu.trigger.classList.add('is-open');
      header.classList.add('dn-active');
      header.classList.toggle('dn-drawer-open', menu.kind === 'drawer');
      menu.open(viaKeyboard);
    }
    function closeMenu(menu) {
      menu.trigger.setAttribute('aria-expanded', 'false');
      menu.trigger.classList.remove('is-open');
      menu.close();
    }
    function closeAll(refocus) {
      clearTimeout(openTimer);
      clearTimeout(closeTimer);
      if (!current) return;
      const was = current;
      closeMenu(was);
      current = null;
      header.classList.remove('dn-active', 'dn-drawer-open');
      if (refocus) was.trigger.focus();
    }

    Array.from(list.children).forEach((li, n) => {
      const a = li.querySelector('a');
      if (!a) return;
      const label = a.textContent.trim();
      const key = label.toLowerCase();

      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'dn-trigger';
      trigger.setAttribute('aria-expanded', 'false');
      trigger.innerHTML = `<span>${esc(label)}</span>`;

      let menu = null;
      if (key === 'rvs') menu = buildDrawer(trigger);
      else if ((columns[key] || []).length) menu = buildDropdown(li, trigger, columns[key], n);
      if (!menu) return;              // no data: leave the plain link in place

      trigger.setAttribute('aria-controls', menu.panel.id);
      a.replaceWith(trigger);
      li.classList.add('dn-item');
      menus.push(menu);

      /* e.detail is 0 for a keyboard press, which moves focus into the menu */
      trigger.addEventListener('click', (e) => {
        clearTimeout(openTimer);
        const keyboard = e.detail === 0;
        if (current !== menu) { openMenu(menu, keyboard); return; }
        /* a click that lands just after hover opened the menu is the same
           intent arriving late, not a request to close it */
        if (trigger.dataset.hoverOpened === '1') return;
        closeAll(keyboard);
      });
      trigger.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); openMenu(menu, true); }
      });

      li.addEventListener('pointerenter', (e) => {
        if (e.pointerType !== 'mouse' || !finePointer.matches || !wide.matches) return;
        clearTimeout(closeTimer);
        clearTimeout(openTimer);
        if (current === menu) return;
        const delay = current ? 0 : (menu.kind === 'drawer' ? 220 : 140);
        openTimer = setTimeout(() => {
          openMenu(menu, false);
          trigger.dataset.hoverOpened = '1';
          setTimeout(() => { trigger.dataset.hoverOpened = ''; }, 500);
        }, delay);
      });
      /* Dropdowns close once the pointer has left the link and its panel. The
         drawer does not: it covers the page, and a pointer drifting onto its
         scrim is not a decision to close it. */
      li.addEventListener('pointerleave', (e) => {
        if (e.pointerType !== 'mouse') return;
        clearTimeout(openTimer);
        if (current !== menu || menu.kind !== 'drop') return;
        closeTimer = setTimeout(() => { if (current === menu) closeAll(false); }, 260);
      });
    });

    if (!menus.length) return;

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && current) { e.preventDefault(); closeAll(true); }
    });
    /* a press outside the bar and the open menu dismisses it */
    document.addEventListener('pointerdown', (e) => {
      if (!current) return;
      if (header.contains(e.target) || current.contains(e.target)) return;
      closeAll(false);
    });
    /* tabbing out of a dropdown closes it; the drawer is left to Escape, since
       Tab moves from its type list to the models beside it */
    document.addEventListener('focusin', (e) => {
      if (!current || current.kind !== 'drop') return;
      if (!current.contains(e.target)) closeAll(false);
    });
    window.addEventListener('scroll', () => { if (current && current.kind === 'drop') closeAll(false); }, { passive: true });
    wide.addEventListener('change', () => { if (!wide.matches) closeAll(false); });
  }

  /* ---------- Phone menu ----------
     Below 1280px the hamburger opens a white sheet over the whole screen, after
     porsche.com's phone menu. It is a stack of screens rather than an accordion:
     tapping a row slides its screen in from the right, with a back arrow and the
     screen's name in a bar across the top and a round close beside them.

       Menu                RVs, Find Your RV, Shop & Tools, Owners, Resources,
                           About; the three header actions pinned to the foot
       RVs                 the eight types, Towable then Motorized, and the
                           footer's other RVs links
       a type              its models as cards (render, sleeps, length), with
                           Build & Price and View All Floorplans pinned below
       any other section   its pages, from the footer column of the same name

     The same data as the desktop drawer (initDesktopNav): models-data.js for the
     types and models, the footer columns for everything else. No prices, for the
     same reason as there. A type's screen is written the first time it is
     opened, so no render is fetched for a type nobody looks at.

     The hamburger stays the only way in, and the sheet's own close is the way
     out; openSearch() still closes it through the hamburger's click. */
  function initMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const menu      = document.getElementById('mobile-menu');
    if (!hamburger || !menu) return;

    const data = window.JAYCO;
    const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const CHEVRON = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>';
    const ARROW = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
    const BACK = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>';
    const OUT = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8"/></svg>';
    const CLOSE = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

    /* the section names, in the bar's order, and each one's pages from the footer */
    /* The label only: by now initDesktopNav() has put each dropdown's own links
       inside its <li>, so the item's whole text is no longer just its name. */
    const sections = Array.from(document.querySelectorAll('.nav-left > li'))
      .map((li) => { const t = li.querySelector('.dn-trigger, a'); return (t || li).textContent.trim(); })
      .filter(Boolean);
    const columns = {};
    document.querySelectorAll('.footer-col').forEach((col) => {
      const h = col.querySelector('h4');
      if (!h) return;
      columns[h.textContent.trim().toLowerCase()] = Array.from(col.querySelectorAll('ul a'))
        .map((a) => ({ label: a.textContent.trim(), href: a.getAttribute('href') || '#',
          external: a.getAttribute('target') === '_blank' }));
    });
    /* the header's action pills, read rather than retyped */
    const actions = Array.from(document.querySelectorAll('.nav-actions a'))
      .map((a) => ({ label: a.textContent.trim(), href: a.getAttribute('href') || '#',
        primary: a.classList.contains('btn-nav-filled') }));

    const byCat = {};
    let cats = [];
    if (data && data.models && data.categories) {
      Object.keys(data.models).forEach((slug) => {
        const m = data.models[slug];
        (byCat[m.category] = byCat[m.category] || []).push(Object.assign({ slug: slug }, m));
      });
      cats = data.categories.filter((c) => (byCat[c.id] || []).length);
    }
    const pages = window.JAYCO_MODEL_PAGES || [];
    const modelHref = (slug, cat) => pages.indexOf(slug) !== -1
      ? 'model.html?model=' + slug : 'type.html?type=' + cat;

    /* ---- one screen ---- */
    let uid = 0;
    function screen(id, title, body, foot) {
      const tid = 'pm-title-' + (uid++);
      return `
        <section class="pm-view" data-view="${id}" aria-labelledby="${tid}" hidden>
          <div class="pm-bar">
            ${id === 'root'
              ? `<span class="pm-title pm-title--root" id="${tid}">Menu</span>`
              : `<button type="button" class="pm-icon pm-back" data-back aria-label="Back">${BACK}</button>
                 <h2 class="pm-title" id="${tid}" tabindex="-1">${esc(title)}</h2>`}
            <button type="button" class="pm-icon pm-close" data-close aria-label="Close the menu">${CLOSE}</button>
          </div>
          <div class="pm-body" data-lenis-prevent>${body}</div>
          ${foot ? `<div class="pm-foot">${foot}</div>` : ''}
        </section>`;
    }
    const row = (label, target, meta) => `
      <li><button type="button" class="pm-row" data-go="${target}">
        <span class="pm-row-text"><span class="pm-row-label">${esc(label)}</span>${
          meta ? `<span class="pm-row-meta">${esc(meta)}</span>` : ''}</span>${CHEVRON}
      </button></li>`;
    const link = (l) => `
      <li><a class="pm-link" href="${esc(l.href)}"${l.href === '#' ? ' aria-disabled="true"' : ''}${
        l.external ? ' target="_blank" rel="noopener noreferrer"' : ''}>
        <span>${esc(l.label)}</span>${l.external ? OUT + '<span class="sr-only"> (opens in a new tab)</span>' : ARROW}</a></li>`;

    const views = { };
    const rootRows = sections.map((name) => {
      const key = name.toLowerCase();
      if (key === 'rvs' && cats.length) return row(name, 'rvs');
      if ((columns[key] || []).length) { views['sec-' + key] = { title: name, links: columns[key] }; return row(name, 'sec-' + key); }
      return '';
    }).join('');

    const foot = actions.length ? `<div class="pm-actions">${actions.map((a) =>
      `<a class="${a.primary ? 'btn-primary' : 'btn-secondary-light'} pm-action" href="${esc(a.href)}">${esc(a.label)}</a>`).join('')}</div>` : '';

    function rvsScreen() {
      const group = (type, label) => {
        const rows = cats.filter((c) => c.type === type).map((c) =>
          row(c.name, 'type-' + c.id, byCat[c.id].length + (byCat[c.id].length > 1 ? ' models' : ' model'))).join('');
        return rows ? `<p class="pm-group">${label}</p><ul class="pm-list">${rows}</ul>` : '';
      };
      const extras = (columns.rvs || []).filter((l) => !/type\.html/.test(l.href));
      return screen('rvs', 'RVs',
        group('towable', 'Towable') + group('motorized', 'Motorized') +
        `<ul class="pm-links pm-links--quiet">${extras.map(link).join('')}${link({ label: 'Not sure? Take the RV Finder Quiz', href: 'quiz.html' })}</ul>`);
    }

    function typeScreen(id) {
      const c = cats.find((x) => x.id === id);
      const cards = byCat[id].map((m) => {
        const s = m.specs || {};
        const chips = [s.Sleeps ? 'Sleeps ' + String(s.Sleeps).replace(/^Up to/, 'up to') : '', s.Length || '']
          .filter(Boolean).map((t) => `<span class="pm-chip">${esc(t)}</span>`).join('');
        return `
          <li><a class="pm-card" href="${modelHref(m.slug, id)}">
            <span class="pm-card-name">${esc(m.name)}</span>
            <span class="pm-card-art"><img src="../assets/models/web/${m.slug}.webp" alt="" width="400" height="248" decoding="async" /></span>
            <span class="pm-chips">${chips}</span>
          </a></li>`;
      }).join('');
      return screen('type-' + id, c.name,
        `<a class="pm-explore" href="type.html?type=${id}">Explore ${esc(c.name)}${ARROW}</a>
         <ul class="pm-cards">${cards}</ul>`,
        `<div class="pm-actions">
           <a class="btn-primary pm-action" href="build-price.html?type=${id}">Build &amp; Price</a>
           <a class="btn-secondary-light pm-action" href="floorplans.html">View All Floorplans</a>
         </div>`);
    }

    menu.className = 'mobile-menu pm-sheet';
    menu.setAttribute('role', 'dialog');
    menu.setAttribute('aria-modal', 'true');
    menu.setAttribute('aria-label', 'Menu');
    menu.innerHTML = screen('root', 'Menu', `<ul class="pm-list pm-list--root">${rootRows}</ul>`, foot);

    /* ---- the stack ---- */
    let stack = ['root'];
    const viewEl = (id) => menu.querySelector(`.pm-view[data-view="${id}"]`);

    function ensure(id) {
      if (viewEl(id)) return viewEl(id);
      let html = '';
      if (id === 'rvs') html = rvsScreen();
      else if (id.indexOf('type-') === 0) html = typeScreen(id.slice(5));
      else if (views[id]) html = screen(id, views[id].title, `<ul class="pm-links">${views[id].links.map(link).join('')}</ul>`);
      if (!html) return null;
      menu.insertAdjacentHTML('beforeend', html);
      const el = viewEl(id);
      el.querySelectorAll('a[aria-disabled="true"]').forEach((a) => a.addEventListener('click', (e) => e.preventDefault()));
      return el;
    }

    /* Screens sit side by side: the one on show at 0, those behind it off to
       the left, the one arriving from the right. Only the two in motion are
       unhidden, so a screen reader reads one screen at a time. */
    function show(nextId, dir) {
      const from = viewEl(stack[stack.length - 1]);
      const to = ensure(nextId);
      if (!to || to === from) return;
      if (dir > 0) stack.push(nextId); else stack.pop();

      to.hidden = false;
      to.classList.remove('is-left', 'is-right', 'is-on');
      to.classList.add(dir > 0 ? 'is-right' : 'is-left');
      void to.offsetWidth;                         // commit the start position
      to.classList.remove('is-right', 'is-left');
      to.classList.add('is-on');
      if (from) {
        from.classList.remove('is-on');
        from.classList.add(dir > 0 ? 'is-left' : 'is-right');
        setTimeout(() => { if (!from.classList.contains('is-on')) from.hidden = true; }, reduce.matches ? 0 : 460);
      }
      const body = to.querySelector('.pm-body');
      if (dir > 0 && body) body.scrollTop = 0;
      const focusTo = dir > 0 ? to.querySelector('.pm-title[tabindex]') : from && menu.querySelector(`[data-go="${from.dataset.view}"]`);
      if (focusTo) focusTo.focus({ preventScroll: true });
    }

    function reset() {
      menu.querySelectorAll('.pm-view').forEach((v) => {
        const root = v.dataset.view === 'root';
        v.hidden = !root;
        v.classList.remove('is-left', 'is-right');
        v.classList.toggle('is-on', root);
      });
      stack = ['root'];
    }
    reset();

    menu.addEventListener('click', (e) => {
      const go = e.target.closest('[data-go]');
      if (go) { show(go.dataset.go, 1); return; }
      if (e.target.closest('[data-back]')) { if (stack.length > 1) show(stack[stack.length - 2], -1); return; }
      if (e.target.closest('[data-close]')) { setMenu(false); hamburger.focus(); return; }
      const a = e.target.closest('a');
      if (a && a.getAttribute('aria-disabled') !== 'true' && a.getAttribute('href') !== '#') setMenu(false);
    });
    menu.querySelectorAll('.pm-actions a[href="#"]').forEach((a) =>
      a.addEventListener('click', (e) => e.preventDefault()));

    // ----- open / close the whole menu -----
    let resetTimer = 0;
    function setMenu(open) {
      clearTimeout(resetTimer);
      if (open) reset();
      hamburger.classList.toggle('open', open);
      menu.classList.toggle('open', open);
      document.body.classList.toggle('menu-open', open);
      hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
      menu.setAttribute('aria-hidden', open ? 'false' : 'true');
      if (window.__jaycoLenis) window.__jaycoLenis[open ? 'stop' : 'start']();
      if (open) {
        const first = menu.querySelector('.pm-view.is-on .pm-row, .pm-view.is-on .pm-close');
        setTimeout(() => { if (first) first.focus({ preventScroll: true }); }, 60);
      } else {
        /* back to the first screen once it is out of sight */
        resetTimer = setTimeout(reset, 450);
      }
    }

    hamburger.addEventListener('click', () => {
      setMenu(!menu.classList.contains('open'));
    });

    document.addEventListener('keydown', (e) => {
      if (!menu.classList.contains('open')) return;
      if (e.key === 'Escape') { setMenu(false); hamburger.focus(); return; }
      /* the sheet covers the page, so Tab stays inside the screen on show */
      if (e.key !== 'Tab') return;
      const on = menu.querySelector('.pm-view.is-on');
      const f = on ? Array.from(on.querySelectorAll('button, a[href], [tabindex="-1"]'))
        .filter((el) => el.offsetParent !== null && el.getAttribute('tabindex') !== '-1') : [];
      if (!f.length) return;
      const i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && (i === f.length - 1 || i === -1)) { e.preventDefault(); f[0].focus(); }
    });

    /* widening past the phone menu's range closes it */
    window.matchMedia('(min-width: 1280px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });
  }

  /* ---------- Site search ----------
     The header's search button on every page, a matching button beside the
     hamburger below 1280px (where the header's actions are folded away), and
     "/" or Ctrl/Cmd+K from the keyboard. The panel itself — js/search.js,
     css/search.css and the generated js/search-index.js — is NOT loaded with the
     page. It arrives the first time a reader reaches for search, or hovers a
     search button, so thirty pages do not each carry a site's worth of titles
     most readers never search.

     Bound at boot rather than in initAnimations(), so search works even if the
     animation libraries never arrive. Bump SEARCH_VERSION whenever search.js,
     search.css or the index is rebuilt. */
  const SEARCH_VERSION = 'v5-search-9';
  const SEARCH_ICON = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
  let searchLoading = null;

  function loadSearch() {
    if (window.JAYCO_SEARCH_UI) return Promise.resolve(window.JAYCO_SEARCH_UI);
    if (searchLoading) return searchLoading;
    window.JAYCO_SEARCH_VERSION = SEARCH_VERSION;
    searchLoading = new Promise((resolve, reject) => {
      /* The stylesheet first, and the panel is not shown until it has landed,
         so it never appears unstyled for a frame. */
      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = 'css/search.css?v=' + SEARCH_VERSION;
      const cssReady = new Promise((done) => { css.onload = done; css.onerror = done; });
      document.head.appendChild(css);
      const js = document.createElement('script');
      js.src = 'js/search.js?v=' + SEARCH_VERSION;
      js.onload = () => cssReady.then(() => {
        if (window.JAYCO_SEARCH_UI) resolve(window.JAYCO_SEARCH_UI);
        else { searchLoading = null; reject(new Error('search did not start')); }
      });
      js.onerror = () => { searchLoading = null; reject(new Error('search failed to load')); };
      document.body.appendChild(js);
    });
    return searchLoading;
  }

  function openSearch(from) {
    /* Search opened from inside the phone menu's reach closes the menu first,
       through its own toggle, so its state and aria stay in step. */
    const menu = document.getElementById('mobile-menu');
    const burger = document.getElementById('hamburger');
    if (menu && burger && menu.classList.contains('open')) burger.click();
    loadSearch().then((ui) => ui.open(from)).catch(() => {});
  }

  function initSearch() {
    const burger = document.getElementById('hamburger');
    if (burger && !document.querySelector('.gs-trigger')) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'gs-trigger';
      b.setAttribute('aria-label', 'Search');
      b.innerHTML = SEARCH_ICON;
      burger.parentNode.insertBefore(b, burger);
    }
    const TRIGGERS = '.nav-search-btn, .gs-trigger';
    const warm = () => loadSearch().then((ui) => ui.warm()).catch(() => {});
    document.querySelectorAll(TRIGGERS).forEach((b) => {
      b.setAttribute('aria-haspopup', 'dialog');
      b.addEventListener('pointerenter', warm, { once: true });
      b.addEventListener('focus', warm, { once: true });
    });
    document.addEventListener('click', (e) => {
      const b = e.target.closest(TRIGGERS);
      if (!b) return;
      e.preventDefault();
      openSearch(b);
    });
    /* "/" and Ctrl/Cmd+K — the two a keyboard reader tries first. "/" never
       fires while they are typing into a field of their own. */
    document.addEventListener('keydown', (e) => {
      if (document.body.classList.contains('gs-open')) return;
      const t = e.target;
      const inField = t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
      const k = (e.key || '').toLowerCase();
      if ((k === '/' && !inField && !e.metaKey && !e.ctrlKey && !e.altKey) ||
          (k === 'k' && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        openSearch(document.activeElement);
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

  /* ---------- Class Scroller — Towable / Motorized pinned accordion ---------- */
  function initClassScroller() {
    const stage  = document.querySelector('.cs-stage');
    if (!stage) return;
    const groups = gsap.utils.toArray('.cs-group');      // [towable, driveable]
    if (groups.length < 2) return;

    // ---- active group (accordion) ----
    let activeGroup = -1;
    function setGroup(idx) {
      if (idx === activeGroup) return;
      activeGroup = idx;
      groups.forEach((g, i) => g.classList.toggle('is-active', i === idx));
    }

    // Desktop only: pin the stage; first half = towable, second half = driveable.
    // The right-hand column is a single looping video, so unlike v2 there is no
    // per-vehicle image swap and no auto-cycle — the buttons are hover-styled only.
    const mm = gsap.matchMedia();
    mm.add('(min-width: 901px)', () => {
      setGroup(0);

      const trigger = ScrollTrigger.create({
        trigger: stage,
        start: 'top top',
        end: () => '+=' + Math.round(window.innerHeight * 0.9),
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        // Pinned sections must refresh in DOM order, otherwise a later pin measures its
        // start before an earlier pin's spacer exists. #builtfor is created late (it waits
        // on a large video), so creation order can't be relied on — set the order here.
        // Highest refreshes first: #categories (3) > #builtfor (2) > #final-cta (default 0).
        refreshPriority: 3,
        onUpdate(self) {
          // Dead zone around the midpoint. A single 0.5 threshold means a scroll that
          // settles right on the boundary — or Lenis' inertia overshooting and easing
          // back — can retrigger the swap mid-transition. Going up needs 0.55, coming
          // back down needs 0.45, so each direction commits before the other can undo it.
          if (self.progress > 0.55) setGroup(1);
          else if (self.progress < 0.45) setGroup(0);
        },
      });

      return () => {
        trigger.kill();
        groups.forEach((g) => g.classList.remove('is-active'));
        activeGroup = -1;
      };
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
      observer.disconnect();          // one-shot — nothing left to watch
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
    /* DESIGN.md is explicit that prefers-reduced-motion "disables all of it, and
       every section must be legible with the animation layer dead" — and this
       handler was the one place that carried on regardless, fading and sliding
       every [data-animation] section on every page.

       Skipping is the safe direction: the resting state of a gsap.from() is the
       visible one, so a section that is never animated is simply already there. */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

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
    cursor.innerHTML = '<span class="cursor-label cursor-label--article">Read Article</span><span class="cursor-label cursor-label--specs">View Model<br>Specs</span><span class="cursor-label cursor-label--chat">Let\'s Chat</span>';
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

    // Grow + intensify glow over interactive elements (exclude news cards and
    // specs buttons — they use their own states). .model-tile is the builder's
    // clickable model card: a <div>, so none of the element selectors catch it.
    const HOVERS   = 'a, button, [role="button"], .cs-vehicle-btn, .model-tile';
    /* The model page's 3D-tour button was listed here while it drove its own
       .tour state. It is now a labelled button in the floorplan CTA row and
       takes the same generic hover as the Build button beside it. */
    const OWN_STATE = '.news-card, .model-specs-btn, .hero-chat-btn';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(HOVERS) && !e.target.closest(OWN_STATE)) {
        cursor.classList.add('hovering');
      }
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(HOVERS) && !e.target.closest(OWN_STATE)) {
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

      /* Follow the card's own link rather than hardcoding one. The card already
         knows where that model goes, and reading it here means the panel can
         never drift from the card it opened out of. */
      const cta = document.createElement('a');
      cta.className = 'model-specs-cta';
      cta.href = card.getAttribute('href') || '#';
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
    /* .quiz-video is the type page's quiz band — same iOS throttling applies
       there, and it was the video this guard was originally written for. */
    const videos = document.querySelectorAll('.hero-bg video, .cs-video, .quiz-video');
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
    initClassScroller();   // pinned — must init before later pinned sections (DOM order)
    initDealerMap();
    initBuiltFor();   // pinned scroll-scrub video (#builtfor, below the dealer map)
    initDifference();
    initModelCarousel();
    initModelSpecs();
    initSectionAnimations();
    initQuizCards();
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
  initSearch();
  initDesktopNav();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runLoader);
  } else {
    runLoader();
  }

}());
