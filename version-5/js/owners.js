/* ===================================================
   Jayco — the Owners pages
   owner-services.html, warranty.html, recalls.html,
   jayco-companion.html
   ---------------------------------------------------
   The shared editorial behavior (arrival, parallax) is
   about.js's; these pages load it too. This file is the
   things only an owner page does, each guarded on its
   own markup and inert everywhere else:
     • the contact form on Owner Services
     • the sticky section bar on Owner Services
     • the United States / Canada switch on Recalls
   =================================================== */

(function () {
  'use strict';

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));

  /* ---------------------------------------------------
     Owner Services: contact form
     Netlify records the POST; the page never leaves.
     --------------------------------------------------- */
  function initContact() {
    const form = $('#ows-form');
    if (!form) return;
    const dept = $('#ows-dept');
    const vin = $('#ows-vin');
    const vinField = $('#ows-vin-field');
    const note = $('#ows-note');

    /* Three of jayco.com's four department forms require a VIN, and Sales does
       not ask for one. The field follows the choice rather than asking a
       shopper for a number they do not have yet. */
    function syncVin() {
      const sales = dept.value === 'sales';
      vin.required = !!dept.value && !sales;
      vinField.hidden = sales;
      if (sales) vin.value = '';
    }
    dept.addEventListener('change', syncVin);
    syncVin();

    /* the same rule brochure-form.js keeps: posting needs the published site */
    const canPost = location.protocol !== 'file:' &&
      !/^(localhost|127\.|0\.0\.0\.0|\[::1\])$/.test(location.hostname);

    function done() {
      form.hidden = true;
      const box = $('#ows-done');
      box.hidden = false;
      const h = $('#ows-done-h');
      if (h) h.focus();
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      if (vin.required && vin.value.replace(/\s/g, '').length !== 17) {
        vin.setCustomValidity('A VIN is 17 characters.');
        form.reportValidity();
        return;
      }
      if (!canPost) {
        note.textContent = 'Sending needs the published site — this is a local preview.';
        done();
        return;
      }
      note.textContent = 'Sending…';
      fetch(location.pathname, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form)).toString(),
      }).then((r) => {
        if (!r.ok) throw new Error(r.status);
        done();
      }).catch(() => {
        note.textContent = 'That did not send. Try again in a moment, or call 800-283-8267.';
      });
    });
    vin.addEventListener('input', () => vin.setCustomValidity(''));
  }

  /* ---------------------------------------------------
     Recalls: United States / Canada
     A tablist when JS runs; both panels, headed, when it
     does not. #canada in the address opens on Canada, and
     choosing a tab keeps the address in step so the link
     can be shared.
     --------------------------------------------------- */
  function initRecalls() {
    const bar = $('.orc-switch');
    if (!bar) return;
    const tabs = $$('.orc-tab', bar);
    const panels = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls')));
    bar.hidden = false;
    document.documentElement.classList.add('orc-armed');

    function select(i, focus, write) {
      tabs.forEach((t, n) => {
        const on = n === i;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        panels[n].hidden = !on;
      });
      if (focus) tabs[i].focus();
      if (write && window.history && window.history.replaceState) {
        const hash = tabs[i].dataset.country === 'canada' ? '#canada' : '';
        window.history.replaceState(null, '', location.pathname + location.search + hash);
      }
    }

    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(i, false, true));
      t.addEventListener('keydown', (e) => {
        let n = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = (i + 1) % tabs.length;
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = (i - 1 + tabs.length) % tabs.length;
        if (e.key === 'Home') n = 0;
        if (e.key === 'End') n = tabs.length - 1;
        if (n === null) return;
        e.preventDefault();
        select(n, true, true);
      });
    });

    const fromHash = () => (location.hash === '#canada' ? 1 : 0);
    select(fromHash(), false, false);
    window.addEventListener('hashchange', () => select(fromHash(), false, false));
    /* a link to #canada from elsewhere on the page (the FAQ does this) */
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href$="#canada"]');
      if (!a || a.pathname !== location.pathname) return;
      e.preventDefault();
      select(1, false, true);
      bar.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  /* ---------------------------------------------------
     Owner Services: the sticky section bar
     Three jobs. It sits under the header wherever the
     header's foot is (the header compacts as the page
     scrolls, and is shorter on a phone). It marks the
     section in view with the sliding blue pill. And its
     links scroll through the one Lenis instance, landing
     each section below the header and the bar rather than
     under them.
     --------------------------------------------------- */
  function initJump() {
    const nav = $('#ow-jump');
    if (!nav) return;
    const bar = $('.ow-jump-bar', nav);
    const pill = $('.ow-jump-pill', nav);
    const links = $$('a', bar);
    const targets = links.map((a) => document.getElementById(a.getAttribute('href').slice(1)));
    const header = document.getElementById('site-header');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let current = null;

    const headerFoot = () => (header ? Math.round(header.getBoundingClientRect().bottom) : 86);
    const clearance = () => headerFoot() + nav.getBoundingClientRect().height + 36;

    function place(a) {
      if (!a) { pill.style.opacity = '0'; return; }
      const w = bar.scrollWidth;
      pill.style.setProperty('--pw', w + 'px');
      pill.style.setProperty('--pl', a.offsetLeft + 'px');
      pill.style.setProperty('--pr', (w - a.offsetLeft - a.offsetWidth) + 'px');
      pill.style.opacity = '1';
      /* on a phone the bar scrolls sideways; keep the active link in it */
      const l = a.offsetLeft, r = l + a.offsetWidth;
      if (l < bar.scrollLeft || r > bar.scrollLeft + bar.clientWidth) {
        bar.scrollTo({ left: l - 24, behavior: reduce ? 'auto' : 'smooth' });
      }
    }

    function update() {
      nav.style.setProperty('--ow-stick', headerFoot() + 'px');
      const line = clearance() + 8;
      let active = null;
      targets.forEach((t, i) => {
        if (t && t.getBoundingClientRect().top <= line) active = links[i];
      });
      /* past the last section's end, nothing is "in view" any more */
      const last = targets[targets.length - 1];
      if (last && last.getBoundingClientRect().bottom < line) active = null;
      if (active === current) return;
      if (current) current.classList.remove('is-active');
      if (active) active.classList.add('is-active');
      current = active;
      links.forEach((a) => (a === active ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
      place(active);
    }

    links.forEach((a, i) => a.addEventListener('click', (e) => {
      const t = targets[i];
      if (!t) return;
      e.preventDefault();
      /* land the section's heading under the bar, not its top padding */
      const head = t.querySelector('.ab-sec-head, .ab-band-grid') || t;
      const y = head.getBoundingClientRect().top + window.scrollY - clearance();
      if (window.__jaycoLenis) window.__jaycoLenis.scrollTo(y, { immediate: reduce });
      else window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
      if (window.history && window.history.replaceState) window.history.replaceState(null, '', '#' + t.id);
    }));

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { ticking = false; update(); });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => { update(); place(current); });
    /* the header compacts over half a second after the scroll that set it
       off, so the bar follows it again once it has finished */
    if (header) header.addEventListener('transitionend', () => update());
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => place(current));
    update();
  }

  initContact();
  initRecalls();
  initJump();
}());
