/* ===================================================
   Jayco — Buyer's Guide (buyers-guide.html)
   ---------------------------------------------------
   One form and its two states. The markup is NOT here
   and cannot be: Netlify detects forms by post-
   processing the literal HTML in the publish directory,
   so a form built by JS is invisible to that pass and
   its name is never registered. This file only ever
   reads values out of fields the page already wrote —
   the same rule quiz.js and brochure-form.js carry.

   NOTHING IS EMAILED FROM THIS BUILD. A submission is
   filed with Netlify and read by a human; there is no
   mail server behind it and no PDF in the repo. The
   success copy says the guide is being sent rather than
   handing over a file that does not exist, which is the
   line brochure-form.js already draws.
   =================================================== */

(function () {
  'use strict';

  const $ = (s, c) => (c || document).querySelector(s);
  const form = $('#bg-form');
  if (!form) return;

  /* quiz.js guards its POST on location.protocol === 'file:', which misses
     http://localhost — where the fetch fires and 404s, because Netlify's form
     handler only exists on the deployed site. Both are checked here. */
  const canPost = location.protocol !== 'file:' &&
    !/^(localhost|127\.|0\.0\.0\.0|\[::1\])$/.test(location.hostname.replace(/\]$/, ']'));

  /* The panel is REPLACED rather than added to: the form has been answered, and
     leaving it on screen invites a second submission of the same address. */
  function succeed(email) {
    const done = $('#bg-done');
    $('#bg-form').closest('.bg-get-panel').hidden = true;
    $('#bg-done-body').textContent = email
      ? 'The Buyer’s Guide is on its way to ' + email + '. It is one PDF, and we will not send you anything else unless you ask.'
      : 'The Buyer’s Guide is on its way. It is one PDF, and we will not send you anything else unless you ask.';
    done.hidden = false;
    /* Focus the heading of what replaced the form, or a screen reader is left
       reading the page from wherever the submit button used to be. */
    $('#bg-done-h').focus();
    if (window.ScrollTrigger) requestAnimationFrame(() => window.ScrollTrigger.refresh());
  }

  /* ---------- The questions ----------
     Five, one at a time, on a loop that does not end. They are what a reader
     arrives holding, said back to them beside the field asking for their email
     — the page's one authored motion moment, which DESIGN.md allows exactly one
     of, and there is nothing else moving here.

     A GSAP timeline rather than a CSS animation with five delays: the hold is
     one number here instead of five keyframe percentages recomputed by hand
     whenever a question is added or dropped. repeat -1 is the endless part.

     Arrival is 0.5s at power2.out, DESIGN.md's arrival curve; the question
     leaving goes at the same time as the next one arrives, so the panel is
     never empty and never shows two at once.

     Under prefers-reduced-motion nothing is bound at all — .bg-ask.is-on in the
     stylesheet leaves the first question sitting there, which is the section
     read with the animation layer dead. */
  function asks() {
    if (typeof gsap === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const items = Array.prototype.slice.call(document.querySelectorAll('#bg-asks .bg-ask'));
    if (items.length < 2) return;

    const HOLD = 3.2;   // seconds a question stays put
    const MOVE = 0.5;   // the swap itself

    gsap.set(items, { opacity: 0, y: 12 });
    gsap.set(items[0], { opacity: 1, y: 0 });
    items.forEach((el) => el.classList.remove('is-on'));

    /* immediateRender: false is load-bearing. A fromTo renders its FROM state
       the moment it is built, not when it is reached — so building five of them
       up front set every question to opacity 0, the first one included, and the
       panel opened empty until the loop came round. */
    const tl = gsap.timeline({ repeat: -1 });
    items.forEach((el, i) => {
      const next = items[(i + 1) % items.length];
      tl.to(el, { opacity: 0, y: -12, duration: MOVE, ease: 'power2.in' }, '+=' + HOLD)
        .fromTo(next, { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: MOVE, ease: 'power2.out', immediateRender: false }, '<');
    });
  }

  /* ---------- Parallax ----------
     Two plates, both scrubbed linearly across their pass through the viewport —
     ease 'none' and scrub true, so they track the scrollbar rather than
     performing, at the small magnitudes DESIGN.md asks for. The travel is read
     from the CSS so the JS can never drift further than the media overhangs,
     which is what stops a bare edge appearing at either end.

     The hero moves through its own band; the panel picture moves inside the box
     the form sets the height of, with the questions sitting still on top of it —
     they are a sibling of the picture, not a child, so they do not ride along.

     Under prefers-reduced-motion the stylesheet sets both drifts to 0 and the
     guard below leaves each picture where it sits. */
  function drift(el, trigger, prop) {
    if (!el || !trigger) return;
    const px = parseFloat(getComputedStyle(document.querySelector('.bg-page'))
      .getPropertyValue(prop)) || 0;
    if (!px) return;
    gsap.fromTo(el, { yPercent: -px / 2 }, {
      yPercent: px / 2,
      ease: 'none',
      scrollTrigger: { trigger: trigger, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  }

  function initParallax() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    /* The hero starts on screen, so its trigger is its own band from the top of
       the page rather than 'top bottom' — measured that way it would already be
       part-drifted before the reader had touched anything. */
    const hero = $('.bg-hero');
    const media = $('.bg-hero-media');
    const heroPx = parseFloat(getComputedStyle(document.querySelector('.bg-page'))
      .getPropertyValue('--bg-drift')) || 0;
    if (hero && media && heroPx) {
      gsap.fromTo(media, { yPercent: -heroPx / 2 }, {
        yPercent: heroPx / 2,
        ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
      });
    }
    drift($('.bg-get-img'), $('.bg-get-media'), '--bg-panel-drift');
  }

  asks();
  document.addEventListener('jayco:animations-ready', initParallax, { once: true });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const email = $('#bg-email').value.trim();

    if (!canPost) {
      $('#bg-note').textContent = 'Sending needs the published site — this is a local preview.';
      succeed(email);
      return;
    }
    const data = new URLSearchParams(new FormData(form));
    fetch(location.pathname, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: data.toString(),
    }).then(() => succeed(email)).catch(() => {
      $('#bg-note').textContent = 'That did not send. Try again in a moment.';
    });
  });
}());
