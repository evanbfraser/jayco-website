/* ===================================================
   Jayco — FAQs (faqs.html)
   ---------------------------------------------------
   Builds the topic chips and the grouped accordion from
   js/faqs-data.js, then filters by topic and by search.

   BUILT ONCE, FILTERED BY HIDING. app.js binds the
   accordion to each .faq-question when the animations
   start, one listener per button, so this renders every
   question once, before that happens, and a filter only
   toggles `hidden`. Re-rendering would leave the new
   buttons unbound.

   ?topic=<id> opens on one topic, and the address keeps
   up as the topic changes so a view can be shared.
   =================================================== */

(function () {
  'use strict';

  const DATA = window.JAYCO_FAQS;
  const groupsEl = document.getElementById('ofq-groups');
  if (!DATA || !groupsEl) return;

  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const text = (html) => html.replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ');
  /* lowercased, accents and apostrophes dropped, punctuation to spaces, and
     padded, so a search word can be matched from the start of a word:
     "vin" finds VIN, not "driving" */
  const norm = (s) => ' ' + s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, '').replace(/[^a-z0-9+]+/g, ' ').trim() + ' ';

  const cats = DATA.categories;
  const total = cats.reduce((n, c) => n + c.items.length, 0);

  /* ---- chips ---- */
  $('#ofq-topics').innerHTML =
    `<button type="button" class="ofq-topic" data-topic="" aria-pressed="true">All<span class="ofq-n">${total}</span></button>` +
    cats.map((c) => `<button type="button" class="ofq-topic" data-topic="${c.id}" aria-pressed="false">${
      esc(c.name)}<span class="ofq-n">${c.items.length}</span></button>`).join('');

  /* ---- groups ---- */
  groupsEl.innerHTML = cats.map((c) => `
    <section class="ofq-group" data-topic="${c.id}" aria-labelledby="ofq-g-${c.id}">
      <h3 class="ofq-group-h" id="ofq-g-${c.id}">${esc(c.name)}</h3>
      <div class="faq-list">${c.items.map((it) => `
        <div class="faq-item" data-search="${esc(norm(it.q + ' ' + text(it.a)))}">
          <button class="faq-question" aria-expanded="false">
            <span>${esc(it.q)}</span>
            <span class="faq-icon" aria-hidden="true"></span>
          </button>
          <div class="faq-answer">${it.a}</div>
        </div>`).join('')}
      </div>
    </section>`).join('');

  const chips = Array.prototype.slice.call(document.querySelectorAll('.ofq-topic'));
  const groups = Array.prototype.slice.call(groupsEl.querySelectorAll('.ofq-group'));
  const input = $('#ofq-q');
  const count = $('#ofq-count');
  const empty = $('#ofq-empty');

  const params = new URLSearchParams(location.search);
  let topic = cats.some((c) => c.id === params.get('topic')) ? params.get('topic') : '';

  function apply(write) {
    const words = norm(input.value).split(' ').filter(Boolean);
    let shown = 0;
    groups.forEach((g) => {
      const inTopic = !topic || g.dataset.topic === topic;
      let n = 0;
      g.querySelectorAll('.faq-item').forEach((item) => {
        const hit = inTopic && words.every((w) => item.dataset.search.indexOf(' ' + w) !== -1);
        item.hidden = !hit;
        if (!hit && item.classList.contains('is-open')) {
          item.classList.remove('is-open');
          item.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        }
        if (hit) n++;
      });
      g.hidden = n === 0;
      shown += n;
    });
    chips.forEach((c) => c.setAttribute('aria-pressed', c.dataset.topic === topic ? 'true' : 'false'));
    empty.hidden = shown > 0;
    const name = topic ? cats.find((c) => c.id === topic).name : null;
    count.textContent = words.length || topic
      ? `${shown} ${shown === 1 ? 'question' : 'questions'}${name ? ' in ' + name : ''}`
      : `${total} questions`;

    if (write && window.history && window.history.replaceState) {
      const q = topic ? '?topic=' + topic : '';
      window.history.replaceState(null, '', location.pathname + q);
    }
  }

  chips.forEach((c) => c.addEventListener('click', () => {
    topic = c.dataset.topic;
    apply(true);
  }));
  input.addEventListener('input', () => apply(false));
  apply(false);

  /* A question opened from a search result is the answer someone came for:
     a single match opens itself. */
  input.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const visible = groupsEl.querySelectorAll('.faq-item:not([hidden])');
    if (visible.length === 1) visible[0].querySelector('.faq-question').click();
  });
}());
