/* ===================================================
   Jayco — Owner stories
   ---------------------------------------------------
   Renders js/testimonial-data.js and nothing else. No
   filtering, no sorting, no paging: nine cards is a
   wall you read, not a set you narrow, and a control
   over nine items is chrome pretending to be a feature.

   Every card prints its attribution — name, coach,
   place, year — and links to the jayco.com story it
   came from. That link is not decoration. PRODUCT.md
   forbids inventing testimonials, and a quote whose
   source a reader can open is the only version of this
   page that can prove it did not.
   =================================================== */

(function () {
  'use strict';

  const DATA = window.JAYCO_STORIES;
  const $ = (s, c) => (c || document).querySelector(s);
  if (!DATA || !DATA.items || !DATA.items.length) return;

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* The attribution line under a quote: coach, place and year, whichever of
     them the source actually gave. Joined with a middot the way every other
     meta line on this site is. */
  function meta(it) {
    return [it.model, it.place, it.year].filter(Boolean).map(esc).join(' · ');
  }

  /* A <blockquote> with the attribution in a <figcaption> outside it, which is
     the pairing the spec asks for — the caption is about the quote, not part of
     what was said. `cite` carries the source URL for anything reading the
     markup rather than the page. */
  function card(it) {
    return `<li class="tm-card">
      <figure class="tm-figure">
        <span class="tm-mark" aria-hidden="true">&ldquo;</span>
        <blockquote class="tm-quote" cite="${esc(it.source)}">
          <p>${esc(it.quote)}</p>
        </blockquote>
        <figcaption class="tm-attrib">
          <span class="tm-name">${esc(it.name)}</span>
          ${meta(it) ? `<span class="tm-meta">${meta(it)}</span>` : ''}
          ${it.note ? `<span class="tm-note-line">${esc(it.note)}</span>` : ''}
          <a class="tm-src" href="${esc(it.source)}" target="_blank" rel="noopener noreferrer"
             aria-label="Read ${esc(it.name)}&#39;s full story on jayco.com — opens in a new tab">
            Read the full story
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M7 17L17 7M9 7h8v8"/></svg>
          </a>
        </figcaption>
      </figure>
    </li>`;
  }

  $('#tm-grid').innerHTML = DATA.items.map(card).join('');

  /* Voices and households are different numbers — the Brewers answered
     separately, so they are two cards and one family. Both are counted from the
     data rather than written into the markup, where the first version of this
     line went stale within the hour. */
  const WORDS = ['no', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven',
    'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve'];
  const say = (n) => WORDS[n] || String(n);

  const homes = new Set(DATA.items.map((it) => it.family || it.name)).size;
  const label = $('#tm-hero-count');
  if (label) {
    label.textContent = DATA.items.length === homes
      ? say(homes) + ' owners,'
      : say(DATA.items.length) + ' owners, ' + say(homes).toLowerCase() + ' families,';
  }
}());
