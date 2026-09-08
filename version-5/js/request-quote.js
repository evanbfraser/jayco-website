/* ===================================================
   Jayco — Request a Quote (request-quote.html)
   ---------------------------------------------------
   A three-step picker and the form it feeds. Class,
   then model, then floorplan — each answer narrowing
   the next question, because a quote for "a Jayco" is
   not a quote and the dealer needs the plan code.

   THE FORM'S MARKUP IS NOT HERE AND CANNOT BE. Netlify
   detects forms by post-processing the literal HTML in
   the publish directory — netlify.toml has
   publish = "." and no build command — so a form built
   by JS is invisible to that pass and its name is never
   registered. Every field, the four hidden ones
   included, is written out in request-quote.html; this
   file only ever WRITES VALUES INTO fields the page
   already declared, and reads the rest back out. Same
   rule quiz.js, brochure-form.js and buyers-guide.js
   all carry.

   NOTHING IS EMAILED FROM THIS BUILD and no dealer is
   contacted. A submission is filed with Netlify and
   read by a human. The success copy says a dealer will
   be in touch rather than quoting a number this page
   has no way to know, which is the line the builder's
   own quote modal already draws.

   NO PRICES ANYWHERE. build.js shows MSRP because a
   configurator has to; here a price would be answering
   the question the visitor came to ask. The 20 plans
   Jayco publishes with a NEW badge and no pricing are
   therefore fully selectable on this page, where
   build.js has to grey them out.

   DATA
   • Classes, models, model years and taglines come from
     models-data.js (window.JAYCO) — real 2027 records
     from jayco.com.
   • Floorplans come from build-data.js
     (window.JAYCO_BUILD): all 181 real plans with
     Jayco's own drawings, sleeps and lengths. The three
     fallback plans on each models-data record stand in
     if that file is somehow absent, which is the same
     contract build.js works to.
   =================================================== */

(function () {
  'use strict';

  const JAYCO = window.JAYCO;
  const form = document.getElementById('rq-form');
  if (!JAYCO || !form) return;

  const BUILD = window.JAYCO_BUILD || {};

  const $ = (s, c) => (c || document).querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* index.html's own class chips (.cs-vehicle-img there), so the eight
     silhouettes a visitor met on the home page are the eight they pick from
     here. They are not in models-data.js — that record's `image` is a 1200²
     photograph, which is a different thing wearing a -landscape- filename. */
  const CLASS_ART = {
    'travel-trailers': '../assets/jayco-travel-trailer-button.png',
    'destination':     '../assets/jayco-destination-trailer-button.png',
    'fifth-wheels':    '../assets/jayco-fifth-wheel-button.png',
    'toy-haulers':     '../assets/jayco-toy-hauler-button.png',
    'class-b':         '../assets/jayco-class-b-button.png',
    /* A GREYHAWK, not the file named for the class. jayco-class-c-button.png
       is a Seneca XT — a Super C on a heavy truck chassis — so the Class C
       chip and the Super C chip were showing the same kind of coach and the
       one thing the picker exists to distinguish was invisible. Trimmed to
       its own bounds from models/Jayco-greyhawk-class-c.png, the way every
       other button in this set is trimmed. */
    'class-c':         '../assets/jayco-greyhawk-class-c-button.png',
    'super-c':         '../assets/jayco-super-c-button.png',
    'class-a':         '../assets/jayco-class-a-button.png',
  };

  const state = { cat: null, model: null, plan: null };

  const cat = (id) => JAYCO.categories.find((c) => c.id === id) || null;
  const modelsIn = (catId) => Object.keys(JAYCO.models)
    .filter((id) => JAYCO.models[id].category === catId);
  /* build-data's 181 real plans where they exist, the model record's three
     fallbacks where they do not. Both shapes carry name/sleeps/length, which is
     all a picker prints; only build-data carries a drawing. */
  const plansFor = (slug) => (BUILD[slug] && BUILD[slug].floorplans)
    || (JAYCO.models[slug] && JAYCO.models[slug].floorplans) || [];

  /* ---------- Steps ----------
     Three states and nothing else. `locked` is a step whose question has no
     answer yet — visible, so the reader can see how long this is, but plainly
     not their turn. `open` is the one being answered. `done` collapses to its
     own answer printed in the header, which is what makes the page get SHORTER
     as it is filled in rather than longer. */
  const step = (name) => document.getElementById('rq-step-' + name);

  function setStep(name, mode) {
    const el = step(name);
    el.dataset.state = mode;
    $('.rq-step-body', el).hidden = mode !== 'open';
    $('.rq-step-change', el).hidden = mode !== 'done';
  }

  /* The header line for a finished step. Plain English, not an id: "Travel
     Trailers", "2027 Jay Flight", "264BH". */
  function setChoice(name, text) {
    $('.rq-step-choice', step(name)).textContent = text || '';
  }

  /* One place decides what every step is doing, from the three values in
     `state`. Called after any change, so there is no path where two steps think
     they are open. */
  function sync() {
    setStep('class', state.cat ? 'done' : 'open');
    setStep('model', !state.cat ? 'locked' : (state.model ? 'done' : 'open'));
    setStep('plan', !state.model ? 'locked' : (state.plan ? 'done' : 'open'));

    setChoice('class', state.cat ? cat(state.cat).name : '');
    setChoice('model', state.model ? JAYCO.models[state.model].year + ' ' + JAYCO.models[state.model].name : '');
    setChoice('plan', state.plan ? planName(state.plan) : '');

    writeForm();
    /* Opening and closing three panels changes the height of everything below
       them, and the hero's scrub is measured against the document. */
    if (window.ScrollTrigger) requestAnimationFrame(() => window.ScrollTrigger.refresh());
  }

  function planName(id) {
    const p = plansFor(state.model).find((x) => String(x.id) === String(id));
    return p ? p.name : '';
  }

  /* ---------- Rendering ----------
     A locked step's options are never built. Thirty-five floorplan drawings for
     a model nobody has chosen is 35 requests for nothing, and the grids are
     rebuilt from `state` every time anyway. */
  function renderClasses() {
    $('#rq-classes').innerHTML = JAYCO.categories.map((c) => `
      <button type="button" class="rq-opt rq-class" data-cat="${esc(c.id)}"
              aria-pressed="${state.cat === c.id}">
        <span class="rq-class-media">
          <img class="rq-class-img" src="${esc(CLASS_ART[c.id] || c.image)}" alt=""
               decoding="async" />
        </span>
        <span class="rq-class-name">${esc(c.name)}</span>
      </button>`).join('');
  }

  function renderModels() {
    const list = state.cat ? modelsIn(state.cat) : [];
    $('#rq-models').innerHTML = list.map((id) => {
      const m = JAYCO.models[id];
      const n = plansFor(id).length;
      return `
      <button type="button" class="rq-opt rq-model" data-model="${esc(id)}"
              aria-pressed="${state.model === id}">
        <span class="rq-model-media">
          <img class="rq-model-img" src="${esc(m.img)}" alt="" loading="lazy" decoding="async" />
        </span>
        <span class="rq-model-year">${esc(m.year)}</span>
        <span class="rq-model-name">${esc(m.name)}</span>
        <span class="rq-model-tagline">${esc(m.tagline)}</span>
        <span class="rq-model-plans">${n} floorplan${n === 1 ? '' : 's'}</span>
      </button>`;
    }).join('');
  }

  function renderPlans() {
    const list = state.model ? plansFor(state.model) : [];
    $('#rq-plans').innerHTML = list.map((p) => {
      /* Sleeps and length are published per plan on jayco.com but not for every
         one of them; the caption prints what exists and says nothing where
         Jayco says nothing. */
      const bits = [];
      if (p.sleeps) bits.push('Sleeps ' + p.sleeps);
      if (p.length) bits.push(p.length);
      return `
      <button type="button" class="rq-opt rq-plan" data-plan="${esc(p.id)}"
              aria-pressed="${String(state.plan) === String(p.id)}">
        <span class="rq-plan-media"${p.img ? '' : ' hidden'}>
          ${p.isNew ? '<span class="rq-plan-new">New</span>' : ''}
          ${p.img ? `<img class="rq-plan-img" src="${esc(p.img)}" alt="" loading="lazy" decoding="async" />` : ''}
        </span>
        <span class="rq-plan-name">${esc(p.name)}</span>
        <span class="rq-plan-specs">${esc(bits.join(' · '))}</span>
      </button>`;
    }).join('');

    /* A drawing that never arrives leaves a card with a white hole in it. The
       card keeps its name and closes the gap instead — blog-ui.js's wireCards()
       does the same thing for post thumbnails. */
    Array.prototype.slice.call(document.querySelectorAll('#rq-plans .rq-plan-img'))
      .forEach((img) => {
        img.addEventListener('error', function () {
          const media = this.closest('.rq-plan-media');
          if (media) media.hidden = true;
        }, { once: true });
      });
  }

  /* ---------- Into the form ----------
     Four hidden inputs, declared in the HTML so Netlify registers them, filled
     from `state`. The names are what a person reading the submission sees, so
     they carry model NAMES rather than slugs — "2027 Jay Flight", not
     "jay-flight". */
  function writeForm() {
    const m = state.model ? JAYCO.models[state.model] : null;
    $('#rq-in-class').value = state.cat ? cat(state.cat).name : '';
    $('#rq-in-model').value = m ? m.name : '';
    $('#rq-in-year').value = m ? String(m.year) : '';
    $('#rq-in-plan').value = state.plan ? planName(state.plan) : '';

    const ready = !!(state.cat && state.model && state.plan);
    $('#rq-step-form').dataset.state = ready ? 'open' : 'locked';
    $('#rq-form-body').hidden = !ready;
    $('#rq-form-wait').hidden = ready;
    $('#rq-summary-build').textContent = ready
      ? m.year + ' ' + m.name + ' · ' + planName(state.plan) + ' · ' + cat(state.cat).name
      : '';
  }

  /* ---------- Moving between steps ----------
     A raw hash jump desyncs Lenis's internal targetScroll and the next wheel
     tick snaps back, so the offset is computed and handed to lenis.scrollTo —
     floorplans.js's scrollToSection() carries the same note. The header is
     fixed, so the target is offset by its height rather than landing under it. */
  function goTo(el) {
    if (!el) return;
    const header = document.getElementById('site-header');
    const pad = (header ? header.offsetHeight : 0) + 16;
    const y = el.getBoundingClientRect().top + window.pageYOffset - pad;
    const lenis = window.__jaycoLenis;
    if (lenis && lenis.scrollTo) lenis.scrollTo(y, { immediate: false });
    else window.scrollTo({ top: y, behavior: 'smooth' });
  }

  /* Delegated, because all three grids are rebuilt from scratch on every
     change and per-button listeners would have to be rebound each time. */
  document.getElementById('rq-steps').addEventListener('click', (e) => {
    const change = e.target.closest('.rq-step-change');
    if (change) {
      const name = change.closest('.rq-step').dataset.step;
      /* Reopening a step DROPS the answers below it. A floorplan belongs to one
         model; keeping "264BH" selected while the model changes to a Seneca is
         how a dealer receives a request for a plan that does not exist. */
      if (name === 'class') { state.cat = null; state.model = null; state.plan = null; renderClasses(); }
      if (name === 'model') { state.model = null; state.plan = null; renderModels(); }
      if (name === 'plan') { state.plan = null; renderPlans(); }
      sync();
      goTo(step(name));
      return;
    }

    const c = e.target.closest('.rq-class');
    if (c) {
      state.cat = c.dataset.cat; state.model = null; state.plan = null;
      renderClasses(); renderModels();
      sync(); goTo(step('model'));
      return;
    }
    const m = e.target.closest('.rq-model');
    if (m) {
      state.model = m.dataset.model; state.plan = null;
      renderModels(); renderPlans();
      sync(); goTo(step('plan'));
      return;
    }
    const p = e.target.closest('.rq-plan');
    if (p) {
      state.plan = p.dataset.plan;
      renderPlans();
      sync(); goTo(document.getElementById('rq-step-form'));
    }
  });

  /* ---------- Arriving with a choice already made ----------
     model.html, the floorplan catalog and Build & Price all know which coach
     the reader is looking at. ?model=jay-flight&plan=264bh lands them on the
     form with the first two or three steps already answered, which is the whole
     difference between a quote request and a fresh start. build.js reads the
     same ?model= parameter. */
  function fromUrl() {
    const q = new URLSearchParams(location.search);
    const slug = q.get('model');
    if (!slug || !JAYCO.models[slug]) return;
    state.cat = JAYCO.models[slug].category;
    state.model = slug;
    const plan = q.get('plan');
    if (plan && plansFor(slug).some((p) => String(p.id).toLowerCase() === plan.toLowerCase())) {
      state.plan = plansFor(slug).find((p) => String(p.id).toLowerCase() === plan.toLowerCase()).id;
    }
  }

  /* ---------- Parallax ----------
     The hero plate, scrubbed linearly across its pass — ease 'none' and scrub
     true, so it tracks the scrollbar rather than performing, at the small
     magnitude DESIGN.md asks for. The travel is read from the CSS so the JS can
     never drift further than the media overhangs, which is what stops a bare
     edge appearing at either end.

     The hero starts on screen, so its trigger runs from the top of the page
     rather than 'top bottom' — measured that way it would already be
     part-drifted before the reader had touched anything. buyers-guide.js
     carries the same note.

     Under prefers-reduced-motion the stylesheet sets the drift to 0 and this
     returns before binding. */
  function initParallax() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    const hero = $('.rq-hero');
    const media = $('.rq-hero-media');
    const px = parseFloat(getComputedStyle(document.querySelector('.rq-page'))
      .getPropertyValue('--rq-drift')) || 0;
    if (!hero || !media || !px) return;
    gsap.fromTo(media, { yPercent: -px / 2 }, {
      yPercent: px / 2,
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
    });
  }

  /* ---------- Submitting ---------- */
  /* quiz.js guards its POST on location.protocol === 'file:', which misses
     http://localhost — where the fetch fires and 404s, because Netlify's form
     handler only exists on the deployed site. Both are checked here. */
  const canPost = location.protocol !== 'file:' &&
    !/^(localhost|127\.|0\.0\.0\.0|\[::1\])$/.test(location.hostname.replace(/\]$/, ']'));

  function succeed(name) {
    const m = JAYCO.models[state.model];
    $('#rq-form-body').hidden = true;
    $('#rq-done-body').textContent = (name ? 'Thanks, ' + name + '. ' : '')
      + 'Your request for a ' + m.year + ' ' + m.name + ' ' + planName(state.plan)
      + ' is filed. A Jayco dealer near you will be in touch with a no-obligation quote — '
      + 'pricing is theirs to set, which is why it is not on this page.';
    $('#rq-done').hidden = false;
    /* Focus the heading of what replaced the form, or a screen reader is left
       reading the page from wherever the submit button used to be. */
    $('#rq-done-h').focus();
    if (window.ScrollTrigger) requestAnimationFrame(() => window.ScrollTrigger.refresh());
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    /* Belt and braces: the form is hidden until all three are set, but a
       submission with no coach in it is the one thing this page must not file. */
    if (!state.cat || !state.model || !state.plan) {
      $('#rq-note').textContent = 'Choose a class, a model and a floorplan first.';
      goTo(step('class'));
      return;
    }
    const first = $('#rq-first').value.trim();

    if (!canPost) {
      $('#rq-note').textContent = 'Sending needs the published site — this is a local preview.';
      succeed(first);
      return;
    }
    const data = new URLSearchParams(new FormData(form));
    fetch(location.pathname, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: data.toString(),
    }).then(() => succeed(first)).catch(() => {
      $('#rq-note').textContent = 'That did not send. Try again in a moment.';
    });
  });

  /* ---------- Start ---------- */
  fromUrl();
  renderClasses();
  if (state.cat) renderModels();
  if (state.model) renderPlans();
  sync();
  document.addEventListener('jayco:animations-ready', initParallax, { once: true });
}());
