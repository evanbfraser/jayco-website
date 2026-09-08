/* ===================================================
   Jayco — The Jayco Difference (jayco-difference.html)
   ---------------------------------------------------
   One switch and two lists. The content is in
   jayco-difference-data.js with its provenance; this
   file draws it and handles the toggle.

   THE TOGGLE IS A TABLIST, not two buttons that hide
   things. Switching between towable and motorized is
   the same question a tab answers — one of a small,
   known set, each with a panel — so it gets the roles,
   the roving tabindex and the arrow keys that come with
   that. A reader on a keyboard should not have to tab
   through nine features to reach the other kind of RV.

   IT IS NOT index.html's .cs-group. That control looks
   related and is not: it is an accordion that expands
   two panels in place, where this replaces one set with
   another. Porting it would have meant inheriting an
   interaction the wireframe does not ask for.

   Both panels are RENDERED at load and one is hidden.
   The lists are twenty short records between them, so
   there is nothing to gain by building on demand, and
   having both in the DOM is what lets the browser find
   text on the inactive panel.

   NO PRICES AND NO CLAIMS THIS SITE CANNOT BACK. Every
   figure printed here — 50% more roof load, 24 months
   or 24,000 miles, 750 lb bunks, a 120" windshield — is
   Jayco's own, quoted from the pages named in the data
   file's header.
   =================================================== */

(function () {
  'use strict';

  const DATA = window.JAYCO_DIFFERENCE;
  const root = document.getElementById('jd-groups');
  if (!DATA || !root) return;

  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.prototype.slice.call((c || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- Icons ----------
     Twelve symbols for twenty features, reused where two features are the same
     kind of thing. Jayco publishes no photography PER FEATURE, so a callout is
     marked with a symbol rather than a stock picture of something that is not
     the part being described. The photographs on this page belong to the ROW,
     which is a subject — how it is built, what you get once it is yours — and
     that is a thing a photograph can honestly show.

     All one weight, all 24x24, all stroked rather than filled, so a row of them
     reads as a set. aria-hidden on every one: the feature's name is right
     beside it and a screen reader gains nothing from "shield". */
  /* TWO SHAPES OF ENTRY, on purpose.
     A STRING is the original 24x24 line art — stroked, one weight.
     An OBJECT {vb, d} is one of the supplied icons: a solid Illustrator
     export with its own viewBox, drawn with fill rather than stroke.
     icon() below reads the type and wraps each accordingly, so the two
     can sit in one table instead of needing two.

     ELEVEN OF THE TWENTY FEATURES HAVE A SUPPLIED ICON. The six that do
     not — JaySMART lighting, NuvoH2O, interior design, the catalytic lock,
     towing and bunk ratings — keep their line art, so those cards read
     lighter than the ones beside them. See the note in the CSS.

     'brake' IS A NEW KEY. Brake lighting and JaySMART lighting used to
     share 'light'; the supplied icon is specifically a brake light, and
     putting it on an interior lighting feature would be wrong. */
  /* TWO SHAPES OF ENTRY, on purpose.
     A STRING is the original 24x24 line art — stroked, one weight.
     An OBJECT {vb, d} is a supplied icon: a solid Illustrator export with
     its own viewBox, drawn with fill rather than stroke. icon() below reads
     the type and wraps each accordingly.

     NINETEEN OF THE TWENTY FEATURES NOW HAVE A SUPPLIED ICON. The one that
     does not is NuvoH2O water filtration, which keeps its line art and is
     therefore the only card on the page drawn in the lighter style.

     'brake' IS A SEPARATE KEY FROM 'light'. The two used to share one;
     brake lighting and JaySMART interior lighting have their own icons now
     and must not be collapsed back together. */
  const ICONS = {
    roof: { vb: '0 0 85.4 43.5', d: '<path d="M85,.4c-.2-.3-.6-.4-.9-.4h-32.1c-.3,0-.4,0-.8.2L.7,31.3c-.2.2-.7.5-.7,1.1v9.7c0,.7.6,1.3,1.3,1.3h44.9c.3,0,.5-.1.9-.4l37.7-31.1c.4-.3.5-.7.5-1.1V1.4c0-.4,0-.8-.3-1ZM44.8,40.9H2.7v-7h42v7ZM45.6,31.1H6.1L52.3,2.7h28l-34.7,28.4ZM82.7,10.4l-35.3,29.1v-6.5L82.7,4.1v6.3Z"/>' },
    wall: { vb: '0 0 64.9 49.6', d: '<path d="M64.2.7c-.5-.5-1.1-.7-1.7-.7H2.4C1.1,0,0,1.1,0,2.4v44.8c0,.6.3,1.3.7,1.7.5.5,1.1.7,1.7.7h60c.6,0,1.3-.3,1.7-.7.5-.5.7-1.1.7-1.7V2.4c0-.6-.3-1.3-.7-1.7ZM44.5,15.9V2.6h17.8v13.3h-17.8ZM55.7,24.1c-.3.1-.6.3-1,.4-1,.4-2.3,1-3.1.9v-7c0,0,10.7,0,10.7,0v5.5c-.4,0-.9,0-1.4-.1-1.7-.2-3.9-.4-5.1.3ZM42,15.9h-2l-.8-2.2c-.7-1.8-2.2-3.2-4.1-3.7l-1.3-.3c-1.3-.3-2.2-1.4-2.5-2.7l-.8-4.3h11.5v13.3ZM36.8,14.5l2.3,6.3c.5,1.5,1.7,2.7,3.1,3.4l7.2,3.3c1.5.7,3.2.7,4.7,0,.2,0,.5-.2.8-.4,1-.5,2.5-1.1,3.3-1l4.1.3v20.6H2.6V2.6h25.3l.9,4.8c.4,2.3,2.1,4.1,4.4,4.7,1.5.3,3.1.8,3.6,2.4ZM49.1,24.5l-5.9-2.7h0c-1.3-.5-1.8-2.1-2.3-3.3h0c0,0,8.2,0,8.2,0v6Z"/>' },
    frame: { vb: '0 0 64.6 50.7', d: '<path d="M64.3,22.7h.3c0-.1,0-.2,0-.3,0,0,0,0,0-.1L52.3.6l-.3-.3c0,0-.1-.1-.2-.1,0,0-.1,0-.2-.1,0,0-.2,0-.2,0h-.3c0,0-.1,0-.3,0h-.2s-.2.2-.2.2c0,0-.1,0-.2.2,0,0,0,0-.1.2,0,0,0,.1,0,.2,0,0,0,.2,0,.2v25.9s-35.1,0-35.1,0V1c0,0,0-.1,0-.2,0,0,0-.1,0-.2,0,0,0-.1-.1-.2,0,0-.1-.1-.1-.1h-.2c0-.2-.1-.2-.2-.2,0,0,0,0-.2,0h0s-.2,0-.2,0c0,0-.1,0-.2,0,0,0-.2,0-.2,0,0,0-.1,0-.2.1,0,0-.1,0-.1.1L.1,22.2c0,0,0,.1,0,.2,0,0,0,.1,0,.2v27c0,.2,0,.3,0,.5h0c0,.2.1.3.2.3,0,0,.2.2.3.2h.1c.1.1.3.1.4.1h62.3c.2,0,.3,0,.5-.1h.1c0-.1.2-.2.2-.3l.2-.2h0c0-.2,0-.3,0-.4v-26.9s-.3,0-.3,0ZM61.5,48.4h-12.8l-2.1-7.3h10.8l4.1,7.3ZM46.4,48.4h-12.9v-7.3h10.8l2.1,7.3ZM44,32.1l-.9-3h7.5l1.7,3h-8.3ZM33.4,38.9v-4.5h8.8l1.3,4.5h-10.2ZM44.6,34.4h8.9l2.5,4.5h-10.2l-1.3-4.5ZM33.4,32.1v-3h7.3l.9,3h-8.2ZM62.3,23v22.2l-9.9-17.6V5.5l9.9,17.6ZM31.2,29.1v3h-8.4l.9-3h7.5ZM31.2,41.2v7.3h-13.1l2.1-7.3h11ZM17.8,41.2l-2.1,7.3H3.1l4.3-7.3h10.4ZM19.8,34.4l-1.3,4.5h-9.7l2.7-4.5h8.3ZM12.8,32.1l1.8-3h6.8l-.9,3h-7.7ZM31.2,34.4v4.5h-10.3l1.3-4.5h9ZM12.7,5.3v22.4L2.3,45.4v-22.4L12.7,5.3ZM14.4.7h0s0,0,0,0h0Z"/>' },
    shield: { vb: '0 0 42.9 50.4', d: '<path d="M19.1,30.4c.3.3.6.4,1,.4s.7-.1,1-.4l13.8-13.8c.3-.3.4-.6.4-1,0-.4-.1-.7-.4-1-.3-.3-.6-.4-1-.4h0c-.4,0-.7.1-.9.4l-12.9,12.9-6.3-6.3c-.5-.5-1.4-.5-1.9,0-.5.5-.5,1.4,0,1.9l7.2,7.2Z"/> <path d="M41.7,5.9c-3.6-.3-6-2-7.5-5.1-.2-.5-.7-.8-1.2-.8H9.9c-.5,0-1,.3-1.2.8-1.3,2.9-3.7,4.6-7.5,5-.7,0-1.2.7-1.2,1.3v19c0,7.9,4.3,15.1,11.3,18.9,4.8,2.6,9.5,5.1,9.5,5.1.2.1.4.2.6.2s.4,0,.6-.2c0,0,4.7-2.5,9.5-5.1,7-3.7,11.3-11,11.3-18.9V7.2c0-.7-.5-1.3-1.2-1.3ZM32.1,2.7c1.7,3.2,4.4,5.1,8.1,5.7v17.8c0,6.9-3.8,13.2-9.9,16.5l-8.9,4.8-8.9-4.8c-6.1-3.3-9.8-9.6-9.8-16.5V8.4c3.8-.7,6.5-2.6,8.1-5.7h21.4Z"/>' },
    solar: { vb: '0 0 52.9 52.9', d: '<path d="M7.6,10.2c-.6-.6-.6-1.7,0-2.3s1.7-.6,2.3,0l2.9,2.9c.6.6.6,1.7,0,2.3-.3.3-.7.5-1.2.5s-.8-.2-1.2-.5l-2.9-2.9ZM41.2,13.6c.4,0,.8-.2,1.2-.5l2.9-2.9c.6-.6.6-1.7,0-2.3-.6-.6-1.7-.6-2.3,0l-2.9,2.9c-.6.6-.6,1.7,0,2.3.3.3.7.5,1.2.5ZM5.8,25H1.7c-.9,0-1.7.7-1.7,1.7s.7,1.7,1.7,1.7h4.1c.9,0,1.7-.7,1.7-1.7s-.7-1.7-1.7-1.7ZM26.4,7.4c.9,0,1.7-.7,1.7-1.7V1.7c0-.9-.7-1.7-1.7-1.7s-1.7.7-1.7,1.7v4.1c0,.9.7,1.7,1.7,1.7ZM41.7,26.7c0,4-1.7,7.8-4.6,10.6-2.9,2.8-6.6,4.4-10.7,4.4s-7.8-1.6-10.7-4.4c-2.9-2.8-4.5-6.6-4.6-10.6,0,0,0-.2,0-.3,0-4,1.6-7.8,4.4-10.7,2.9-2.9,6.7-4.6,10.9-4.6s8,1.6,10.9,4.6c2.8,2.9,4.4,6.6,4.4,10.7s0,.2,0,.3ZM38.4,26.4c0-3.2-1.2-6.1-3.4-8.4-2.3-2.3-5.3-3.6-8.5-3.6s-6.3,1.3-8.5,3.6c-2.2,2.2-3.4,5.2-3.4,8.4h0c0,.1,0,.1,0,.2,0,3.2,1.3,6.1,3.6,8.4,2.2,2.2,5.2,3.4,8.4,3.4s6.1-1.2,8.4-3.4c2.3-2.2,3.5-5.2,3.6-8.4,0,0,0,0,0-.1h0ZM10.8,40l-2.9,2.9c-.6.6-.6,1.7,0,2.3s.7.5,1.2.5.8-.2,1.2-.5l2.9-2.9c.6-.6.6-1.7,0-2.3-.6-.6-1.7-.6-2.3,0ZM51.2,25h-4.1c-.9,0-1.7.7-1.7,1.7s.7,1.7,1.7,1.7h4.1c.9,0,1.7-.7,1.7-1.7s-.7-1.7-1.7-1.7ZM42.1,40c-.6-.6-1.7-.6-2.3,0-.6.6-.6,1.7,0,2.3l2.9,2.9c.3.3.7.5,1.2.5s.8-.2,1.2-.5c.6-.6.6-1.7,0-2.3l-2.9-2.9ZM26.4,45.5c-.9,0-1.7.7-1.7,1.7v4.1c0,.9.7,1.7,1.7,1.7s1.7-.7,1.7-1.7v-4.1c0-.9-.7-1.7-1.7-1.7Z"/>' },
    tech: { vb: '0 0 31 55.9', d: '<path d="M24.6,0H6.4C2.9,0,0,2.9,0,6.4v43.2c0,3.5,2.9,6.4,6.4,6.4h18.3c3.5,0,6.4-2.9,6.4-6.4V6.4c0-3.5-2.9-6.4-6.4-6.4ZM28.2,6.4v43.2c0,2-1.6,3.6-3.6,3.6H6.4c-2,0-3.6-1.6-3.6-3.6V6.4c0-2,1.6-3.6,3.6-3.6h18.3c2,0,3.6,1.6,3.6,3.6ZM17.4,8.1c0,1-.9,1.9-1.9,1.9s-1.9-.9-1.9-1.9.9-1.9,1.9-1.9,1.9.8,1.9,1.9Z"/>' },
    ride: { vb: '0 0 83.3 44.9', d: '<path d="M15.2,37.9c0,.1,0,.2,0,.3h0s0,0,0,0c.2,2.2,2.1,4,4.3,4s4.1-1.7,4.3-4h0s0,0,0,0c0,0,0-.2,0-.3,0-2.4-2-4.3-4.3-4.3s-4.3,1.9-4.3,4.3h0ZM61.6,23.8c.7,0,1.3.6,1.3,1.3s-.6,1.3-1.3,1.3h-3.7c-.7,0-1.3-.6-1.3-1.3s.6-1.3,1.3-1.3h3.7ZM79.5,21.9h.5c.9,0,1.7.4,2.3.9h0c.5.7.9,1.4.9,2.3v3.8c0,.9-.4,1.7-.9,2.3-.6.6-1.4.9-2.3.9h-.5v6.2c0,.7-.6,1.3-1.3,1.3h-6.1c-.3,1.2-1,2.3-1.8,3.2-1.3,1.3-3,2.1-5,2.1s-3.7-.8-5-2.1c-.9-.9-1.5-2-1.8-3.2H26.3c-.3,1.2-1,2.3-1.8,3.2-1.3,1.3-3,2.1-5,2.1s-3.7-.8-5-2.1c-.9-.9-1.5-2-1.8-3.2H4c-1.1,0-2.1-.4-2.8-1.2h0c-.7-.8-1.1-1.8-1.1-2.8v-8.7c0-1.1.4-2.1,1.2-2.8.7-.7,1.7-1.2,2.8-1.2h1.3v-10.1c0-.1,0-.2,0-.3L7.1,1.1C7.2.5,7.8,0,8.4,0h55.4c.4,0,.8.2,1,.4l9.8,9.5c.1.1.2.3.3.5l4.5,9.6c0,.2.1.4.1.6v1.4h0ZM80.1,24.6h-.5v4.9h.5c.1,0,.3,0,.4-.2s.2-.2.2-.4v-3.8c0-.1,0-.2-.1-.3h0c0-.1-.2-.2-.4-.2h0ZM15.5,19.3h15.5V7.6h-15.5v11.7ZM32.4,21.9H14.2c-.7,0-1.3-.6-1.3-1.3V6.2c0-.7.6-1.3,1.3-1.3h36.4c.7,0,1.3.6,1.3,1.3v14.4c0,.7-.6,1.3-1.3,1.3h-18.2ZM33.7,19.3h15.5V7.6h-15.5v11.7ZM12.5,26.5c-.7,0-1.3-.6-1.3-1.3s.6-1.3,1.3-1.3h38.1c.7,0,1.3.6,1.3,1.3s-.6,1.3-1.3,1.3H12.5ZM56.4,4.9h6.1c.4,0,.8.2,1,.5l7.3,7.7c.2.3.4.6.4.9v6.6c0,.7-.6,1.3-1.3,1.3h-13.5c-.7,0-1.3-.6-1.3-1.3V6.2c0-.7.6-1.3,1.3-1.3h0ZM62,7.6h-4.2v11.7h10.8v-4.8l-6.6-6.9h0ZM8,37h4.6c0-.7.3-1.5.6-2.1h-5.2v2.1h0ZM60.9,37.9c0,.1,0,.2,0,.3h0s0,0,0,0c.2,2.2,2.1,4,4.3,4s4.1-1.7,4.3-4h0s0,0,0,0c0-.1,0-.2,0-.3,0-2.4-2-4.3-4.3-4.3s-4.3,1.9-4.3,4.3h0ZM72.2,37h4.6v-2.1h-5.2c.3.7.5,1.4.6,2.1h0ZM26.5,37h31.8c0-.7.3-1.5.6-2.1H25.9c.3.7.5,1.4.6,2.1h0ZM4,37h1.3v-11.2h-1.3c-.4,0-.7.1-.9.4-.2.2-.4.6-.4.9v8.7c0,.3.1.6.3.9h0c.2.3.6.4.9.4h0ZM65.3,30.8c1.5,0,2.9.5,4.1,1.3h7.5v-11.3l-4.3-9.1-9.3-9.1H9.6l-1.6,10.3v19.2h7.5c1.2-.8,2.6-1.3,4.1-1.3s2.9.5,4.1,1.3h37.5c1.2-.8,2.6-1.3,4.1-1.3h0Z"/>' },
    cap: { vb: '0 0 69.7 37.3', d: '<path d="M16.6,0C12.1,0,8.2,3,6.9,7.3L0,30.8c0,.1,0,.2,0,.4v5c0,.7.6,1.2,1.2,1.2h67.2c.7,0,1.2-.6,1.2-1.2v-5h0c0-.1,0-.2,0-.4l-6.8-23.4c-1.3-4.3-5.2-7.3-9.7-7.3H16.6ZM16.6,2.5h17v1.2h-1.2c-2,0-3.7,1.7-3.7,3.7s1.7,3.7,3.7,3.7h5c2,0,3.7-1.7,3.7-3.7s-1.7-3.7-3.7-3.7h-1.3v-1.2h17c3.4,0,6.4,2.2,7.4,5.5l6.4,21.9h-11.5l.7-2.1c.1-.3,0-.7,0-1-.2-.3-.4-.5-.8-.6l-23.6-6.2c-.7-.2-1.3.2-1.5.9,0,.3,0,.7.1.9.2.3.4.5.8.6l22.4,5.9-.5,1.6h-16l.7-2.1c.1-.3,0-.7,0-1-.2-.3-.4-.5-.8-.6l-23.6-6.2h0c-.7-.2-1.3.2-1.5.9,0,.3,0,.7.1.9.2.3.4.5.8.6l22.4,5.9-.5,1.6H2.9l6.4-21.9c1-3.3,3.9-5.5,7.4-5.5h0ZM17.9,4.9c-.1,0-.2,0-.3,0-.3,0-.6.2-.8.5l-4.5,6.3c-.2.3-.3.6-.2.9,0,.3.2.6.5.8.3.2.6.3.9.2.3,0,.6-.2.8-.5l4.5-6.3c.2-.3.3-.6.2-.9,0-.3-.2-.6-.5-.8-.2-.1-.4-.2-.6-.2h0ZM32.4,6.2h5c.7,0,1.2.5,1.2,1.3s-.5,1.2-1.2,1.2h-5c-.7,0-1.2-.5-1.2-1.2s.5-1.3,1.2-1.3ZM22.5,6.2c-.1,0-.2,0-.3,0-.3,0-.6.2-.8.5l-6.2,8.7c-.2.3-.3.6-.2.9,0,.3.2.6.5.8.6.4,1.3.3,1.7-.3l6.2-8.7c.2-.3.3-.6.2-.9,0-.3-.2-.6-.5-.8-.2-.1-.4-.2-.6-.2h0ZM2.5,32.4h64.7v2.5H2.5v-2.5Z"/>' },
    view: { vb: '0 0 68 36.4', d: '<path d="M67.6,19.2c-2.6,3.5-5.6,6.4-8.8,8.8-7.4,5.6-16.2,8.4-24.9,8.4s-17.5-2.8-24.9-8.4c-3.2-2.4-6.2-5.4-8.8-8.8-.5-.6-.4-1.4,0-2,2.6-3.5,5.6-6.4,8.8-8.8C16.5,2.8,25.3,0,34,0s17.5,2.8,24.9,8.4c3.2,2.4,6.2,5.4,8.8,8.8.5.6.4,1.4,0,2h0ZM34,7.3c3,0,5.7,1.2,7.7,3.2,2,2,3.2,4.7,3.2,7.7s-1.2,5.7-3.2,7.7c-2,2-4.7,3.2-7.7,3.2s-5.7-1.2-7.7-3.2c-2-2-3.2-4.7-3.2-7.7s1.2-5.7,3.2-7.7,4.7-3.2,7.7-3.2ZM39.4,12.8c-1.4-1.4-3.3-2.2-5.4-2.2s-4,.9-5.4,2.2-2.2,3.3-2.2,5.4.9,4,2.2,5.4,3.3,2.2,5.4,2.2,4-.9,5.4-2.2,2.2-3.3,2.2-5.4-.9-4-2.2-5.4h0ZM56.9,25.4c2.7-2,5.2-4.4,7.4-7.2-2.2-2.8-4.7-5.2-7.4-7.2-6.8-5.2-14.9-7.7-22.9-7.7s-16.1,2.6-22.9,7.7c-2.7,2-5.2,4.4-7.4,7.2,2.2,2.8,4.7,5.2,7.4,7.2,6.8,5.2,14.9,7.7,22.9,7.7s16.1-2.6,22.9-7.7Z"/>' },
    belt: { vb: '0 0 68.5 68.5', d: '<path d="M23,30.5c-.6-.6-1.4-.9-2.3-.9s-1.7.3-2.3.9l-9.5,9.5c-1.2,1.2-1.2,3.3,0,4.5l1,1L.9,54.7c-.6.6-.9,1.4-.9,2.2s.3,1.6.9,2.2l8.6,8.6c.6.6,1.4.9,2.2.9h0c.8,0,1.6-.3,2.2-.9l9.1-9.1,1,1c.6.6,1.4.9,2.3.9s1.7-.3,2.3-.9l9.5-9.5c.6-.6.9-1.4.9-2.3s-.3-1.7-.9-2.3l-15-15ZM11.1,66l-8.6-8.6c-.3-.3-.3-.8,0-1.1l9.1-9.1,9.7,9.7-9.1,9.1c-.3.3-.8.3-1.1,0ZM23.8,56l-11.3-11.3s0,0,0,0l-1.8-1.8c-.3-.3-.3-.9,0-1.2l9.5-9.5c.2-.2.4-.3.6-.3s.5,0,.6.3l15,15c.2.2.3.4.3.6s0,.5-.3.6l-9.5,9.5c-.3.3-.9.3-1.2,0l-1.9-1.9s0,0,0,0ZM68.5,11.7c0-.8-.3-1.6-.9-2.2L59,.9c-.6-.6-1.4-.9-2.2-.9s-1.6.3-2.2.9l-5.5,5.5-1.3-1.3c-.5-.5-1.3-.8-2-.8h0c-.8,0-1.5.3-2,.8l-8.6,8.6c-.9.9-1.4,2.1-1.4,3.4s.5,2.4,1.3,3.3l-6.2,6.2c-.5.5-.8,1.3-.8,2s.3,1.5.8,2l1.8,1.8s0,0,0,0l5.2,5.2s0,0,0,0l1.8,1.8c.5.5,1.3.8,2,.8h0c.8,0,1.5-.3,2-.8l6.2-6.2c.9.8,2.1,1.3,3.3,1.3h0c1.3,0,2.5-.5,3.4-1.4l8.6-8.6c.5-.5.8-1.3.8-2s-.3-1.5-.8-2l-1.3-1.3,5.5-5.5c.6-.6.9-1.4.9-2.2ZM48.9,30.9l-11.3-11.3s0,0,0,0l-.7-.7c-1-1-1-2.5,0-3.5l8.6-8.6c.2-.2.6-.2.8,0l1.3,1.3-1.4,1.4c-.6.6-.9,1.4-.9,2.2s.3,1.6.9,2.2l8.6,8.6c.6.6,1.4.9,2.2.9s1.6-.3,2.2-.9l1.4-1.4,1.3,1.3c.1.1.2.2.2.4s0,.3-.2.4l-8.6,8.6c-1,1-2.5,1-3.5,0l-.7-.7s0,0,0,0ZM59.6,18.6s0,0,0,0l-2.2,2.2c-.3.3-.8.3-1.1,0l-8.6-8.6c-.3-.3-.3-.8,0-1.1l2.3-2.3s0,0,0,0,0,0,0,0l6.3-6.3c.1-.1.3-.2.5-.2h0c.2,0,.4,0,.5.2l8.6,8.6c.3.3.3.8,0,1.1l-6.3,6.3s0,0,0,0ZM39.5,37.9l-1-1,2.6-2.6c.8-.8.8-2.2,0-3l-3.8-3.8c-.4-.4-.9-.6-1.5-.6h0c-.6,0-1.1.2-1.5.6l-2.6,2.6-1-1c-.1-.1-.2-.2-.2-.4s0-.3.2-.4l6.2-6.2,9.7,9.7-6.2,6.2c-.2.2-.6.2-.8,0ZM33.3,31.7l2.5-2.5,3.5,3.5-2.5,2.5-3.5-3.5ZM27,54l5.5-5.5c.5-.5.5-1.2,0-1.6l-10.9-10.9c-.4-.4-1.2-.4-1.6,0l-5.5,5.5c-.5.5-.5,1.2,0,1.6l10.9,10.9c.2.2.5.3.8.3s.6-.1.8-.3ZM26.2,51.5l-9.2-9.2,3.9-3.9,9.2,9.2-3.9,3.9Z"/>' },
    brake: { vb: '0 0 56 72', d: '<path d="M16.6,64.9c.1.4,0,.8,0,1.1l-2.8,5.3c-.2.5-.7.8-1.3.8h0c-.8,0-1.4-.7-1.4-1.4,0-.2,0-.5.2-.7l2.8-5.3c.3-.5.8-.8,1.3-.8s.5,0,.7.2c.3.2.6.5.7.8ZM11.3,60.7c-.6-.5-1.5-.4-2,.2l-4,4.4c-.2.3-.4.6-.4,1,0,.8.6,1.4,1.4,1.4h0c.4,0,.8-.2,1.1-.5l4.1-4.5c.5-.6.4-1.5-.2-2ZM7.7,56.5c-.2-.3-.5-.5-.9-.6,0,0-.2,0-.3,0-.3,0-.6,0-.8.2l-5,3.2c-.4.3-.7.7-.7,1.2s.1.7.4,1c.5.5,1.2.6,1.8.2l5-3.2c.7-.5.9-1.4.5-2ZM55.3,59.3l-5-3.2c-.3-.2-.5-.2-.8-.2-.5,0-1,.2-1.2.7-.2.3-.3.7-.2,1.1,0,.4.3.7.7.9l5,3.2c.6.4,1.6.2,2-.4.4-.7.2-1.6-.4-2ZM37.3,34.3c-.8,0-1.4.6-1.4,1.4v8.1c0,.8.6,1.4,1.4,1.4s1.4-.6,1.4-1.4v-8.1c0-.8-.6-1.4-1.4-1.4ZM46.7,60.8c-.3-.3-.6-.4-1-.4h0c-.4,0-.7.1-1,.4-.6.6-.6,1.5,0,2l4,4.4c.3.3.7.4,1,.4.3,0,.7-.1.9-.4.3-.3.5-.6.5-1,0-.4,0-.8-.4-1l-4.1-4.4ZM36.7,61c-1.3.7-2.8,1-4.3,1h-8.8c-1.5,0-3-.4-4.4-1-4.9-2-8.1-6.3-8.1-10.9v-24h-1.5c-.8,0-1.4-.6-1.4-1.4s.6-1.4,1.4-1.4h1.5v-10.7C11.1,5.7,16.6,0,23,0h9.9c7.1,0,11.9,5,11.9,12.5v10.2h1.5c.8,0,1.4.6,1.4,1.4s-.6,1.4-1.4,1.4h-1.5v24.5c0,4.6-3.2,8.8-8.2,10.9ZM14,23.2h.8v-.3c.8-4.2,4.5-7.3,8.8-7.3h8.7c4.1,0,7.7,2.8,8.7,6.9v.3h1v-10.2c0-6-3.4-9.6-9-9.6h-9.9c-2.2,0-4.4.9-6.1,2.7-1.9,1.9-2.9,4.4-2.9,7v10.7ZM38.4,24.1c-.2-3.1-2.8-5.6-6-5.6h-8.7c-3.2,0-5.8,2.5-6,5.6h0c0,0,1.6,3.6,1.6,3.6l.3-.2c1.2-.6,2.6-1,4-1h8.7c1.4,0,2.8.3,4,1l.3.2,1.6-3.5h0ZM38.4,54.3l-1.6-3.1-.3.2c-1.3.6-2.7.9-4.1.9h-8.8c-1.4,0-2.8-.3-4.1-.9l-.3-.2-1.6,3.1h0c.2,1.8,1.3,3.3,2.8,4.1,1.2.5,2.5.7,3.8.8h7.5c1.3,0,2.6-.3,3.8-.8,1.5-.8,2.6-2.2,2.8-3.9h0ZM41.2,53.5l.3-.8c.3-.8.5-1.7.5-2.6v-24.5s-1.1,0-1.1,0l-2.2,4.9c0,.1-.1.3-.2.4-.5.6-1.4.6-2,.1-1.1-1-2.5-1.5-4-1.6h-8.7c-1.5,0-2.9.6-4,1.6-.1,0-.2.2-.4.2-.7.3-1.6,0-1.9-.7l-2-4.4h-1.3v24c0,.9.2,1.8.5,2.6l.3.8,2.6-5c0,0,0-.2.2-.2.5-.6,1.4-.7,2-.2,1.2.9,2.6,1.4,4,1.4h8.8c1.5,0,2.9-.5,4.1-1.4,0,0,.1-.1.2-.1.7-.4,1.6,0,1.9.6l2.6,5ZM18.6,33.8c-.8,0-1.4.6-1.4,1.4v8.7c0,.8.6,1.4,1.4,1.4s1.4-.6,1.4-1.4v-8.7c0-.8-.6-1.4-1.4-1.4ZM42.1,64.7c-.3-.5-.8-.8-1.3-.8s-.5,0-.7.2c-.7.4-1,1.2-.6,2l2.8,5.3c.3.5.7.8,1.3.8h0c.2,0,.5,0,.7-.2.3-.2.6-.5.7-.8.1-.4,0-.8,0-1.1l-2.8-5.3Z"/>' },
    light: { vb: '0 0 63.4 61.2', d: '<path d="M8.1,31.7c0,.7-.6,1.4-1.4,1.4H1.4c-.7,0-1.4-.6-1.4-1.4s.6-1.4,1.4-1.4h5.4c.7,0,1.4.6,1.4,1.4ZM15,13.1l-3.8-3.8c-.5-.5-1.4-.5-1.9,0-.5.5-.5,1.4,0,1.9l3.8,3.8c.5.5,1.4.5,1.9,0s.5-1.4,0-1.9ZM31.7,8.1c.7,0,1.4-.6,1.4-1.4V1.4c0-.7-.6-1.4-1.4-1.4s-1.4.6-1.4,1.4v5.4c0,.7.6,1.4,1.4,1.4ZM62.1,30.4h-5.4c-.7,0-1.4.6-1.4,1.4s.6,1.4,1.4,1.4h5.4c.7,0,1.4-.6,1.4-1.4s-.6-1.4-1.4-1.4ZM52.2,9.3l-3.8,3.8c-.5.5-.5,1.4,0,1.9.5.5,1.4.5,1.9,0l3.8-3.8c.5-.5.5-1.4,0-1.9-.5-.5-1.4-.5-1.9,0ZM43.5,18.3c3,2.9,4.9,7,4.9,11.5s-.5,4.5-1.4,6.4c-.9,2.1-2.3,3.9-3.9,5.4-1.1,1-2,2.1-2.7,3.3-.4.7-.7,1.5-1,2.3h4.4c.7,0,1.4.6,1.4,1.4s-.6,1.4-1.4,1.4h-4.7v5.2c0,1.7-.7,3.2-1.8,4.3-1.1,1.1-2.6,1.8-4.3,1.8h-2.7c-1.7,0-3.2-.7-4.3-1.8-1.1-1.1-1.8-2.6-1.8-4.3v-5.2h-4.7c-.7,0-1.4-.6-1.4-1.4s.6-1.4,1.4-1.4h4.4c-.2-.8-.6-1.6-1-2.3-.7-1.2-1.6-2.3-2.7-3.3-1.7-1.5-3-3.3-3.9-5.4-.9-2-1.4-4.2-1.4-6.4,0-4.5,1.9-8.6,4.9-11.5,3-2.9,7.2-4.7,11.8-4.7s8.8,1.8,11.8,4.7ZM36.5,55.1v-5.2h-9.5v5.2c0,.9.4,1.8,1,2.4.6.6,1.5,1,2.4,1h2.7c.9,0,1.8-.4,2.4-1,.6-.6,1-1.5,1-2.4ZM45.8,29.8c0-3.7-1.6-7.1-4.1-9.6-2.5-2.5-6.1-4-10-4s-7.4,1.5-10,4c-2.5,2.4-4.1,5.8-4.1,9.6s.4,3.7,1.1,5.3c.8,1.7,1.9,3.2,3.3,4.5,1.3,1.2,2.4,2.5,3.2,4h0c.6,1.1,1.1,2.3,1.4,3.6h3.7v-10.4s-5.1-6-5.1-6c-.5-.6-.4-1.4.1-1.9.6-.5,1.4-.4,1.9.1l4.4,5.2,4.4-5.2c.5-.6,1.3-.6,1.9-.1.6.5.6,1.3.1,1.9l-5.1,6v10.4h3.7c.3-1.3.8-2.5,1.4-3.6.8-1.5,1.9-2.8,3.2-4,1.4-1.3,2.5-2.8,3.3-4.5.7-1.6,1.1-3.4,1.1-5.3Z"/>' },
    tow: { vb: '0 0 87.6 40.3', d: '<path d="M82,0c-3.1,0-5.6,2.5-5.6,5.6v11.9c0,6.4-5.1,11.6-11.4,11.6h0c-4.6,0-8.8-2.8-10.6-7.1-1.2-2.9-3.2-5.4-5.8-7.2-2.6-1.8-5.7-2.7-8.8-2.7h-5.1v-4c0-2.5-2-4.5-4.5-4.5H4.5C2,3.6,0,5.6,0,8.1v19.2c0,2.5,2,4.5,4.5,4.5h25.7c2.5,0,4.5-2,4.5-4.5v-4h5.1c1.9,0,3.6,1.1,4.2,2.9,1.7,4.2,4.6,7.7,8.3,10.3,3.7,2.5,8.1,3.9,12.6,3.9h0c12.4,0,22.5-10.3,22.5-22.8V5.6c0-3.1-2.5-5.6-5.6-5.6ZM32.2,27.3c0,1.1-.9,1.9-1.9,1.9H4.5c-1.1,0-1.9-.9-1.9-1.9V8.1c0-1.1.9-1.9,1.9-1.9h25.7c1.1,0,1.9.9,1.9,1.9v19.2ZM85,17.5c0,11.1-8.9,20.1-19.9,20.2h0c-4,0-7.9-1.2-11.2-3.4-3.3-2.2-5.9-5.4-7.4-9.1-1.1-2.7-3.7-4.5-6.7-4.5h-5.1v-6h5.1c5.4,0,10.2,3.3,12.2,8.2,2.1,5.3,7.3,8.8,13,8.8h0c7.7,0,13.9-6.4,13.9-14.2V5.6c0-1.6,1.3-3,3-3s3,1.3,3,3v11.9ZM14.3,10.3c-3.6,1.5-5.6,5.2-4.8,9,.3,1.6,1.1,3,2.1,4,0,0,0,0,0,0,1.5,1.5,3.5,2.4,5.8,2.4h0c2.1,0,4.2-.8,5.7-2.4,2.7-2.7,3.1-7,1-10.2-2.1-3.2-6.2-4.4-9.8-3ZM12.8,14.7c1-1.5,2.7-2.4,4.5-2.4,1,0,2,.3,2.8.8l-7.5,7.5c-.1-.2-.3-.5-.4-.7-.7-1.7-.5-3.6.5-5.1ZM21.2,21.6c-1.3,1.3-3.1,1.8-4.9,1.5-.6-.1-1.2-.4-1.8-.7l7.5-7.5c.1.2.3.5.4.7.8,2,.4,4.4-1.2,6Z"/>' },
    interior: { vb: '0 0 64.4 51.7', d: '<path d="M26.8,34.1c.7,0,1.3-.6,1.3-1.3s-.6-1.3-1.3-1.3H8c-.7,0-1.3.6-1.3,1.3s.6,1.3,1.3,1.3h18.8Z"/> <path d="M64.2,17.4c-.2-.4-.6-.6-1.1-.6h-10.2l.4-.7c.7-1.1.7-2.5,0-3.7-.5-.9-1.3-1.5-2.3-1.7,1.1-1.6,2-2.7,2-4.7,0-3.2-2.6-5.9-5.8-5.9h-17.3c-1.6,0-3,.6-4.1,1.7,0,0-.2.2-.2.2-.1.1-24,26-24.1,26.1,0,0,0,0,0,.1C.5,29.2,0,30.4,0,31.8v2c0,2.1,1.1,3.9,2.7,4.9-1.6,1.3-2.7,3.4-2.7,5.7,0,4,3.3,7.3,7.3,7.3h37.9c.3,0,.6-.1.8-.3.1-.1.2-.2.3-.4l17.9-32.4c.2-.4.2-.9,0-1.3ZM50.2,13c.6,0,.8.4.9.5,0,.2.3.6,0,1.1l-14.8,24.2c-.1-.2-.3-.4-.4-.5-.6-.6-1.3-1-2.1-1.2.2-.2.3-.5.5-.8,0,0,0,0,0,0l15.3-23.3h.7ZM27.5,3.5c.6-.6,1.4-1,2.3-1h17.3c1.8,0,3.3,1.5,3.3,3.3s-.2,1.2-.5,1.7l-15.3,23.3c-.4-2.8-2.8-4.9-5.8-4.9H6.8c0,0,20.7-22.4,20.7-22.4ZM5.9,37.1c-1.8,0-3.3-1.5-3.3-3.3v-2c0-.9.3-1.6.9-2.2h.1c.6-.7,1.4-1.1,2.3-1.1h23.1c1.8,0,3.3,1.5,3.3,3.3v2c0,1.8-1.5,3.3-3.3,3.3-21.7,0-22.8,0-23.1,0ZM44.4,49.1H7.3c-2.6,0-4.7-2.1-4.7-4.7s2.1-4.7,4.7-4.7h21.7s0,0,0,0h3.9c.5,0,.9.2,1.2.5.3.3.5.7.5,1.2s0,.5-.1.7l-.2.4c-.3.4-.8.6-1.3.6H12c-.7,0-1.3.6-1.3,1.3s.6,1.3,1.3,1.3h20.8c1.5,0,3-.7,3.8-2.3l14.7-23.9h9.6l-16.5,29.8Z"/>' },
    lock: { vb: '0 0 37.9 56.4', d: '<path d="M33.3,20.6H7.6v-5.8c0-6.3,5.1-11.3,11.3-11.3s11.3,5.1,11.3,11.3.8,1.7,1.7,1.7,1.7-.8,1.7-1.7c0-8.2-6.6-14.8-14.8-14.8S4.2,6.6,4.2,14.8v5.9c-2.3.3-4.2,2.2-4.2,4.6v26.5c0,2.6,2.1,4.7,4.7,4.7h28.6c2.6,0,4.7-2.1,4.7-4.7v-26.5c0-2.6-2.1-4.7-4.7-4.7ZM34.5,25.3v26.5c0,.7-.5,1.2-1.2,1.2H4.7c-.7,0-1.2-.5-1.2-1.2v-26.5c0-.7.5-1.2,1.2-1.2h28.6c.7,0,1.2.5,1.2,1.2ZM19,32.6c-2.9,0-5.3,2.4-5.3,5.3s1.5,4.3,3.6,5v2.8c0,1,.8,1.7,1.7,1.7s1.7-.8,1.7-1.7v-2.8c2.1-.7,3.6-2.8,3.6-5s-2.4-5.3-5.3-5.3ZM20.8,37.9c0,1-.8,1.9-1.9,1.9s-1.9-.8-1.9-1.9.8-1.9,1.9-1.9,1.9.8,1.9,1.9Z"/>' },
    bunk: { vb: '0 0 76.7 62.3', d: '<path d="M75.3,0c-.8,0-1.4.6-1.4,1.4v6h-9.4V1.4C64.4.6,63.8,0,63,0s-1.4.6-1.4,1.4v11.4H23.6c-.7-3.7-3.9-6.3-7.6-6.3h-5.8V1.4c0-.8-.6-1.4-1.4-1.4H1.4C.6,0,0,.6,0,1.4v59.5c0,.8.6,1.4,1.4,1.4h7.3c.8,0,1.4-.6,1.4-1.4v-1.3s0-22.4,0-22.4h0v-14.8h51.4v38.4c0,.8.6,1.4,1.4,1.4s1.4-.6,1.4-1.4v-6h9.4s0,6,0,6c0,.8.6,1.4,1.4,1.4s1.4-.6,1.4-1.4V1.4C76.7.6,76.1,0,75.3,0ZM64.4,16.4v-6h9.4v6h-9.4ZM64.4,25.3v-6h9.4v6h-9.4ZM64.4,34.2v-6h9.4v6h-9.4ZM64.4,43.1v-6h9.4v6h-9.4ZM73.9,46v6h-9.4v-6h9.4ZM10.2,9.4h5.8c2.2,0,4,1.4,4.7,3.4h-10.5v-3.4ZM10.2,19.6v-3.9h51.4v3.9H10.2ZM7.3,2.9v56.6H2.9V2.9h4.4Z"/>' },
    water: '<path d="M12 3s6 6.5 6 10.5A6 6 0 0 1 6 13.5C6 9.5 12 3 12 3z"/>',
  };

  const icon = (key) => {
    const v = ICONS[key] || ICONS.shield;
    if (typeof v === 'object') {
      return `<svg viewBox="${v.vb}" fill="currentColor" aria-hidden="true">${v.d}</svg>`;
    }
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      ${v}</svg>`;
  };

  /* ---------- Render ----------
     A run of rows, each one a photograph at the width of the FAQ container,
     its title over the foot of the plate, and its highlights on a rail
     underneath with a pair of arrows below that.

     The page scrolls normally. An earlier build pinned each row and drew the
     rail from the scroll position; that is gone, and the rail is an ordinary
     horizontal scroller — arrows, swipe or trackpad. Nothing about reading
     this page now depends on a scroll effect running at all. */
  const callout = (f) => `<li class="jd-callout">
      <span class="jd-callout-icon">${icon(f.icon)}</span>
      <div class="jd-callout-text">
        <h3 class="jd-callout-name">${esc(f.name)}</h3>
        <p class="jd-callout-body">${esc(f.body)}</p>
      </div>
    </li>`;

  const row = (r) => `
    <section class="jd-row">
      <div class="jd-row-media">
        <div class="jd-row-plate">
          <img class="jd-row-img" src="../assets/jayco-difference/web/${esc(r.img)}-1200.webp"
               srcset="../assets/jayco-difference/web/${esc(r.img)}-800.webp 800w,
                       ../assets/jayco-difference/web/${esc(r.img)}-1200.webp 1200w"
               sizes="(max-width: 900px) 92vw, calc(100vw - 200px)"
               alt="${esc(r.alt)}" loading="lazy" decoding="async" />
        </div>
        <div class="jd-row-scrim" aria-hidden="true"></div>
        <h3 class="jd-row-title">${esc(r.title)}</h3>
      </div>
      <ul class="jd-cards" role="list" data-n="${r.features.length}">${r.features.map(callout).join('')}</ul>
    </section>`;

  root.innerHTML = DATA.groups.map((g, i) => `
    <section class="jd-panel" id="jd-panel-${esc(g.id)}" role="tabpanel"
             aria-labelledby="jd-tab-${esc(g.id)}" tabindex="0"${i ? ' hidden' : ''}>
      <div class="jd-panel-head">
        <h2 class="jd-panel-title">${esc(g.title)}</h2>
        <p class="jd-panel-lead">${esc(g.lead)}</p>
      </div>
      ${g.rows.map(row).join('')}
    </section>`).join('');

  $('#jd-tabs').innerHTML = DATA.groups.map((g, i) => `
    <button type="button" class="jd-tab${i ? '' : ' is-on'}" id="jd-tab-${esc(g.id)}"
            role="tab" aria-selected="${i ? 'false' : 'true'}"
            aria-controls="jd-panel-${esc(g.id)}" tabindex="${i ? '-1' : '0'}"
            data-group="${esc(g.id)}">${esc(g.label)}</button>`).join('');

  /* ---------- The switch ---------- */
  const tabs = () => $$('#jd-tabs .jd-tab');

  function select(id, focus) {
    DATA.groups.forEach((g) => {
      const on = g.id === id;
      const tab = $('#jd-tab-' + g.id);
      tab.classList.toggle('is-on', on);
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
      $('#jd-panel-' + g.id).hidden = !on;
    });
    if (focus) $('#jd-tab-' + id).focus();
    /* The panel that just opened has never been measured — its rows had no
       layout while it was hidden, so every parallax trigger in it was computed
       against a zero-height box. The panels are different heights too, so the
       triggers BELOW them move as well. One refresh fixes both. */
    requestAnimationFrame(refreshParallax);
  }

  $('#jd-tabs').addEventListener('click', (e) => {
    const t = e.target.closest('.jd-tab');
    if (t) select(t.dataset.group, false);
  });

  /* Arrow keys move between tabs, Home and End jump to the ends — the roving
     tabindex above is what keeps the group a single tab stop. */
  $('#jd-tabs').addEventListener('keydown', (e) => {
    const list = tabs();
    const i = list.indexOf(document.activeElement);
    if (i < 0) return;
    let next = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % list.length;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + list.length) % list.length;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = list.length - 1;
    if (next < 0) return;
    e.preventDefault();
    select(list[next].dataset.group, true);
  });

  /* ---------- Parallax ----------
     The hero plate, scrubbed across its own pass — ease 'none' and scrub true,
     so it tracks the scrollbar rather than performing. The travel is read from
     the CSS so the JS cannot drift further than the media overhangs, and the
     trigger runs from the top of the page because the hero starts on screen.
     towing.js and request-quote.js carry the same note. */
  function initParallax() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    const px = parseFloat(getComputedStyle(document.querySelector('.jd-page'))
      .getPropertyValue('--jd-drift')) || 0;
    if (!px) return;

    const drift = (el, trigger, start, end) => {
      if (!el || !trigger) return;
      gsap.fromTo(el, { yPercent: -px / 2 }, {
        yPercent: px / 2, ease: 'none',
        scrollTrigger: { trigger: trigger, start: start, end: end, scrub: true },
      });
    };

    /* The hero starts ON SCREEN, so its pass runs from the top of the document
       to the point the band leaves. 'top bottom' would be a start it is already
       past, and the plate would jump to mid-travel on the first scroll. */
    drift($('.jd-hero-media'), $('.jd-hero'), 'top top', 'bottom top');

    /* Every row plate, in BOTH panels — including the hidden one. Binding it
       now and refreshing on the tab switch is simpler than binding lazily and
       tracking which rows have been done; a trigger on a hidden element is
       harmless until it is measured, and select() measures it. */
    $$('.jd-row').forEach((r) => {
      drift($('.jd-row-plate', r), $('.jd-row-media', r), 'top bottom', 'bottom top');
    });
  }

  /* Called when a panel opens. Every trigger recomputes against the layout that
     now exists, which is what a panel that was hidden at bind time needs. */
  function refreshParallax() {
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
  }

  /* Nothing on this page runs without GSAP any more — the highlights are a
     static grid, so the only thing left to bind is the parallax. */
  document.addEventListener('jayco:animations-ready', initParallax, { once: true });
}());
