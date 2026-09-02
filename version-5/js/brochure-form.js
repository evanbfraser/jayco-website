/* ===================================================
   Jayco — Brochure request form
   ---------------------------------------------------
   A COMPONENT, not a page script. Loaded by both
   brochures.html and model.html, which is why it lives
   in its own pair of files rather than being ported
   into two page stylesheets: compare.css's port-and-
   rename rule exists so a reader who greps a class
   finds one owner, and duplicating a component that is
   identical by design is the drift that rule guards
   against. Putting it in style.css instead would ship
   modal CSS to six pages that never open it and bump
   the shared token across all of them.

   THE MARKUP IS NOT HERE, AND CANNOT BE.
   Netlify detects forms by post-processing the literal
   HTML in the publish directory — netlify.toml has
   publish = "." and no build command. A form built by
   JS is invisible to that pass and its name is never
   registered, which is the rule quiz.js states: "the
   build-time parser only sees literal markup." So the
   <form> is written statically into every page that
   submits it, with every field it should record —
   including the hidden ones. This file only ever writes
   VALUES into inputs it did not create.

   Submissions route by the form-name value in the body
   rather than by the URL posted to, so one registration
   serves both pages.

   NOTHING IS EMAILED. A submission is filed with
   Netlify and read by a human; no PDF exists yet. The
   success copy says so rather than promising an inbox.
   =================================================== */

(function () {
  'use strict';

  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.prototype.slice.call((c || document).querySelectorAll(s));
  const modal = () => document.getElementById('brf-modal');
  if (!modal()) return;

  const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea,[tabindex]:not([tabindex="-1"])';
  let lastFocus = null;

  const JAYCO = window.JAYCO || { models: {}, categories: [] };
  const catName = (id) => {
    const c = (JAYCO.categories || []).find((x) => x.id === id);
    return c ? c.name : '';
  };
  const label = (slug) => {
    const m = JAYCO.models[slug];
    return m ? m.year + ' ' + m.name : '';
  };

  /* The select's options are data, not schema: Netlify registers the FIELD from
     the static markup, and records whatever value is submitted for it. So the
     <select name="model"> is written into the page and its options are filled
     in from the same 27 records the rest of the site reads — which keeps this
     list from drifting out of step with models-data.js. */
  function fillModels() {
    const sel = $('#brf-model');
    if (!sel || sel.options.length > 1) return;
    (JAYCO.categories || []).forEach((cat) => {
      const slugs = Object.keys(JAYCO.models).filter((s) => JAYCO.models[s].category === cat.id);
      if (!slugs.length) return;
      const group = document.createElement('optgroup');
      group.label = cat.name;
      slugs.forEach((s) => {
        const o = document.createElement('option');
        o.value = s;
        o.textContent = label(s);
        group.appendChild(o);
      });
      sel.appendChild(group);
    });
  }

  function syncReadable() {
    const sel = $('#brf-model');
    const slug = sel ? sel.value : '';
    $('#brf-model-name').value = slug ? label(slug) + (catName(JAYCO.models[slug].category)
      ? ' — ' + catName(JAYCO.models[slug].category) : '') : '';
  }

  /* ---------- Open / close ----------
     Manners copied from the floorplans catalog's modal: `hidden` rather than a
     transitioned visibility (Chrome flips a discrete visibility transition
     halfway through a fade, and focus() inside a hidden subtree is a silent
     no-op), Lenis stopped because it keeps scrolling the page under a fixed
     overlay whatever overflow says, and the return target passed IN from the
     click rather than read off document.activeElement, since a click does not
     reliably focus a <button>. */
  function open(slug, from) {
    fillModels();
    const el = modal();
    lastFocus = from || document.activeElement;

    $('#brf-ask').hidden = false;
    $('#brf-done').hidden = true;
    $('#brf-note').textContent = '';

    const sel = $('#brf-model');
    if (slug && JAYCO.models[slug]) {
      sel.value = slug;
      $('#brf-title').textContent = 'Request the ' + label(slug) + ' brochure';
      $('#brf-lede').textContent = 'Tell us where to send it. You can change the model below.';
    } else {
      $('#brf-title').textContent = 'Request a brochure';
      $('#brf-lede').textContent = 'Pick the coach you are looking at and tell us where to send it.';
    }
    syncReadable();

    el.hidden = false;
    document.body.classList.add('brf-on');
    const l = window.__jaycoLenis;
    if (l && l.stop) l.stop();
    $('#brf-x').focus();
  }

  function close() {
    const el = modal();
    if (el.hidden) return;
    el.hidden = true;
    document.body.classList.remove('brf-on');
    const l = window.__jaycoLenis;
    if (l && l.start) l.start();
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
    lastFocus = null;
  }

  /* inert takes the background out of the tab order on its own in current
     browsers, but Safari below 15.5 ignores it — so the cycle is held manually
     rather than trusted to it. */
  function trapTab(e) {
    if (e.key !== 'Tab' || modal().hidden) return;
    const f = $$(FOCUSABLE, modal()).filter((el) => el.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (!modal().contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* ---------- Submit ----------
     quiz.js guards its POST on location.protocol === 'file:', which misses
     http://localhost — where the fetch fires and 404s, because Netlify's form
     handler only exists on the deployed site. Both are checked here. */
  const canPost = location.protocol !== 'file:' &&
    !/^(localhost|127\.|0\.0\.0\.0|\[::1\])$/.test(location.hostname.replace(/\]$/, ']'));

  function succeed(slug) {
    $('#brf-ask').hidden = true;
    $('#brf-done').hidden = false;
    /* Says what actually happens. Nothing in this repo sends mail and there is
       no PDF yet, so "look for it in your inbox" would be a lie. */
    $('#brf-done-body').textContent = slug && JAYCO.models[slug]
      ? 'We have your request for the ' + label(slug) +
        ' brochure. The 2027 literature is still being finished — it goes out as soon as that model’s file is ready.'
      : 'We have your request. The 2027 literature is still being finished — your brochure goes out as soon as it is ready.';
    $('#brf-done-title').focus();
  }

  function wire() {
    const form = $('#brf-form');

    document.addEventListener('click', (e) => {
      const t = e.target.closest('[data-brochure-open]');
      if (t) { e.preventDefault(); open(t.dataset.brochureOpen, t); return; }
      if (e.target.closest('#brf-x, #brf-done-x') || e.target.dataset.brfClose) close();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal().hidden) { e.stopPropagation(); close(); return; }
      trapTab(e);
    });

    $('#brf-model').addEventListener('change', syncReadable);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      syncReadable();
      const slug = $('#brf-model').value;

      if (!canPost) {
        $('#brf-note').textContent = 'Sending needs the published site — this is a local preview.';
        succeed(slug);
        return;
      }
      const data = new URLSearchParams(new FormData(form));
      fetch(location.pathname, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: data.toString(),
      }).then(() => succeed(slug)).catch(() => {
        $('#brf-note').textContent = 'That did not send. Try again in a moment.';
      });
    });

    /* ?model=<slug> opens it prefilled — after the loader, not behind it:
       #loader is z-index 9999 and this panel is 1100, so opening on
       DOMContentLoaded would put the dialog under the splash for its duration. */
    const want = new URLSearchParams(location.search).get('model');
    if (want && JAYCO.models[want]) {
      document.addEventListener('jayco:animations-ready', () => open(want, null), { once: true });
    }
  }

  wire();
}());
