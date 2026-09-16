/* ===================================================
   Jayco — One release (news.html?article=<slug>)
   ---------------------------------------------------
   The title, date and picture are in js/news-data.js,
   which the page already has; the body is one file under
   js/news/, injected as a <script> once the page knows
   which — see js/blog-post.js for why a script tag and
   not fetch(). onerror lands in the same not-found panel
   as a bad slug.

   The dateline ("Middlebury, Ind –") was lifted out of
   the first paragraph when the release was read; it goes
   back in front of it here, set as a dateline.
   =================================================== */

(function () {
  'use strict';

  const DATA = window.JAYCO_NEWS;
  if (!DATA) return;
  const $ = (s) => document.querySelector(s);

  /* newsroom.js carries the shared card, but this page loads news.js alone,
     so the few helpers it needs are restated rather than loading a list page's
     script onto an article */
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'];
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const date = (s) => { const [y, m, d] = s.split('-').map(Number); return `${MONTHS[m - 1]} ${d}, ${y}`; };
  const src = (a, w) => `../assets/newsroom/web/${a.img}-${w}.webp`;

  const slug = (new URLSearchParams(location.search).get('article') || '').toLowerCase();
  const a = DATA.articles.find((x) => x.slug === slug);

  function missing() {
    $('#nwd-loading').hidden = true;
    $('#nwd-h').textContent = 'Article not found';
    $('#nwd-missing').hidden = false;
    document.title = 'Article not found — Jayco Newsroom (v5)';
  }
  if (!a) { missing(); return; }

  document.title = a.title + ' — Jayco Newsroom (v5)';
  $('#nwd-h').textContent = a.title;
  $('#nwd-date').innerHTML = `<time datetime="${a.date}">${date(a.date)}</time>`;
  if (window.JAYCO_SHARE) window.JAYCO_SHARE.mount($('#nwd-share'), { title: a.title });

  if (a.img) {
    const img = $('#nwd-img');
    img.src = src(a, 1400);
    img.srcset = `${src(a, 800)} ${Math.min(800, a.size[0])}w, ${src(a, 1400)} ${a.size[0]}w`;
    img.sizes = '(max-width: 900px) 92vw, 1040px';
    img.width = a.size[0];
    img.height = a.size[1];
    if (a.graphic) $('#nwd-frame').classList.add('is-graphic');
    img.addEventListener('error', () => { $('#nwd-figure').hidden = true; }, { once: true });
    $('#nwd-figure').hidden = false;
  }

  const s = document.createElement('script');
  s.src = 'js/news/' + encodeURIComponent(a.slug) + '.js?v=v5-nw-1';
  s.onload = () => {
    const b = window.JAYCO_NEWS_ARTICLE;
    if (!b || b.slug !== a.slug) { missing(); return; }
    $('#nwd-loading').hidden = true;
    if (b.subtitle) { $('#nwd-sub').textContent = b.subtitle; $('#nwd-sub').hidden = false; }

    const body = $('#nwd-body');
    body.innerHTML = b.html;
    const first = body.querySelector('p');
    if (b.dateline && first) {
      first.insertAdjacentHTML('afterbegin',
        `<span class="nwd-dateline">${esc(b.dateline.replace(/\s*[–—-]+\s*$/, ''))} — </span>`);
    }
    if (b.about) {
      $('#nwd-about-h').textContent = b.about.heading;
      $('#nwd-about-body').innerHTML = b.about.html;
      $('#nwd-about').hidden = false;
    }
    if (window.JAYCO_SHARE) window.JAYCO_SHARE.mount($('#nwd-share-end'), { title: a.title, label: 'Share this article' });
    document.querySelectorAll('#nwd-body a[href^="http"], #nwd-about a[href^="http"]').forEach((l) => {
      l.target = '_blank';
      l.rel = 'noopener noreferrer';
    });
  };
  s.onerror = missing;
  document.body.appendChild(s);

  /* ---------- more news: the three nearest in time ---------- */
  const others = DATA.articles.filter((x) => x.slug !== a.slug)
    .sort((x, y) => Math.abs(Date.parse(x.date) - Date.parse(a.date)) - Math.abs(Date.parse(y.date) - Date.parse(a.date)))
    .slice(0, 3)
    .sort((x, y) => y.date.localeCompare(x.date));
  const card = (x) => `
    <li class="nw-card">
      <a class="nw-card-link" href="news.html?article=${encodeURIComponent(x.slug)}">
        ${x.img
          ? `<span class="nw-media${x.graphic ? ' is-graphic' : ''}"><img src="${src(x, 800)}" width="${Math.min(800, x.size[0])}"
               height="${Math.round(x.size[1] * Math.min(800, x.size[0]) / x.size[0])}" alt="" loading="lazy" decoding="async" /></span>`
          : `<span class="nw-media is-blank" aria-hidden="true"><img class="nw-blank-logo" src="../assets/jayco-logo-white.svg" width="210" height="141" alt="" loading="lazy" decoding="async" /></span>`}
        <span class="nw-card-body">
          <time class="nw-date" datetime="${x.date}">${date(x.date)}</time>
          <span class="nw-card-h">${esc(x.title)}</span>
        </span>
      </a>
    </li>`;
  $('#nwd-more-grid').innerHTML = others.map(card).join('');
  $('#nwd-more').hidden = false;
}());
