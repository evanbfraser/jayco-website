/* ===================================================
   Jayco — Newsroom (newsroom.html)
   ---------------------------------------------------
   The newest release large, then every release as a
   card, filterable by year — jayco.com's own archive
   years. ?year= deep-links one, and the address keeps up.
   The card is shared with news.html's "More news", so it
   lives on window.JAYCO_NEWS_UI.
   =================================================== */

window.JAYCO_NEWS_UI = (function () {
  'use strict';
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'];
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const date = (s) => { const [y, m, d] = s.split('-').map(Number); return `${MONTHS[m - 1]} ${d}, ${y}`; };
  const href = (a) => 'news.html?article=' + encodeURIComponent(a.slug);
  const src = (a, w) => `../assets/newsroom/web/${a.img}-${w}.webp`;

  function media(a, lead) {
    if (!a.img) {
      return `<span class="nw-media is-blank" aria-hidden="true"><img class="nw-blank-logo" src="../assets/jayco-logo-white.svg" width="210" height="141" alt="" loading="lazy" decoding="async" /></span>`;
    }
    const w = a.size[0];
    return `<span class="nw-media${a.graphic ? ' is-graphic' : ''}">
      <img src="${src(a, lead ? 1400 : 800)}" srcset="${src(a, 800)} ${Math.min(800, w)}w, ${src(a, 1400)} ${w}w"
           sizes="${lead ? '(max-width: 900px) 92vw, 58vw' : '(max-width: 600px) 92vw, (max-width: 1100px) 46vw, 30vw'}"
           width="${w}" height="${a.size[1]}" alt="" loading="${lead ? 'eager' : 'lazy'}" decoding="async" />
    </span>`;
  }

  function card(a) {
    return `
      <li class="nw-card">
        <a class="nw-card-link" href="${href(a)}">
          ${media(a, false)}
          <span class="nw-card-body">
            <time class="nw-date" datetime="${a.date}">${date(a.date)}</time>
            <span class="nw-card-h">${esc(a.title)}</span>
          </span>
        </a>
      </li>`;
  }

  return { esc, date, href, media, card, src };
}());

(function () {
  'use strict';
  const DATA = window.JAYCO_NEWS;
  const UI = window.JAYCO_NEWS_UI;
  const grid = document.getElementById('nwl-grid');
  if (!DATA || !grid) return;

  const $ = (s) => document.querySelector(s);
  const all = DATA.articles.slice().sort((a, b) => b.date.localeCompare(a.date));
  const lead = all[0];

  $('#nwl-lead').innerHTML = `
    <a class="nw-lead" href="${UI.href(lead)}">
      ${UI.media(lead, true)}
      <span class="nw-lead-body">
        <span class="section-label">Latest</span>
        <time class="nw-date" datetime="${lead.date}">${UI.date(lead.date)}</time>
        <span class="nw-lead-h">${UI.esc(lead.title)}</span>
        ${lead.excerpt ? `<span class="nw-lead-p">${UI.esc(lead.excerpt)}</span>` : ''}
        <span class="nw-lead-go">Read the release</span>
      </span>
    </a>`;

  const years = Array.from(new Set(all.map((a) => a.date.slice(0, 4))));
  const params = new URLSearchParams(location.search);
  let year = years.indexOf(params.get('year')) !== -1 ? params.get('year') : '';

  $('#nwl-years').innerHTML =
    `<button type="button" class="nw-year" data-year="" aria-pressed="false">All</button>` +
    years.map((y) => `<button type="button" class="nw-year" data-year="${y}" aria-pressed="false">${y}</button>`).join('');

  function render(write) {
    const list = (year ? all.filter((a) => a.date.slice(0, 4) === year) : all.slice(1));
    grid.innerHTML = list.map(UI.card).join('');
    document.querySelectorAll('.nw-year').forEach((b) =>
      b.setAttribute('aria-pressed', b.dataset.year === year ? 'true' : 'false'));
    $('#nwl-count').textContent = year
      ? `${list.length} ${list.length === 1 ? 'release' : 'releases'} in ${year}`
      : `${all.length} releases, ${years[years.length - 1]}–${years[0]}`;
    if (write && window.history && window.history.replaceState) {
      window.history.replaceState(null, '', location.pathname + (year ? '?year=' + year : ''));
    }
  }

  $('#nwl-years').addEventListener('click', (e) => {
    const b = e.target.closest('.nw-year');
    if (!b) return;
    year = b.dataset.year;
    render(true);
  });
  render(false);
}());
