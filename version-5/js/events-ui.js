/* ===================================================
   Jayco — Events, shared by events.html and event.html
   ---------------------------------------------------
   Dates, status and the one list row both pages draw.
   Status is computed against the reader's own today, so
   the pages never need editing as a show passes.
   =================================================== */

window.JAYCO_EVENTS_UI = (function () {
  'use strict';

  const DATA = window.JAYCO_EVENTS || { events: [], collections: {}, regions: { US: {}, CA: {} } };
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'];
  const SHORT = MONTHS.map((m) => m.slice(0, 3));

  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  /* 'YYYY-MM-DD' as a local calendar day, never through Date's UTC parse,
     which puts a date on the previous day for everyone west of Greenwich */
  function day(s) {
    if (!s) return null;
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  function today() {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), t.getDate());
  }

  function status(e) {
    const t = today();
    const s = day(e.start), en = day(e.end) || s;
    if (en && en < t) return 'past';
    if (s && s <= t) return 'now';
    return 'upcoming';
  }
  const STATUS_LABEL = { past: 'Ended', now: 'Happening now', upcoming: 'Upcoming' };

  /* "Jan 15–20, 2024", "Jan 30 – Feb 2, 2025", "Through Apr 30, 2025" */
  function range(e, long) {
    const names = long ? MONTHS : SHORT;
    const s = day(e.start), en = day(e.end);
    if (!s && en) return 'Through ' + names[en.getMonth()] + ' ' + en.getDate() + ', ' + en.getFullYear();
    if (!s) return '';
    const y = s.getFullYear();
    if (!en || +en === +s) return `${names[s.getMonth()]} ${s.getDate()}, ${y}`;
    if (s.getMonth() === en.getMonth() && en.getFullYear() === y) {
      return `${names[s.getMonth()]} ${s.getDate()}–${en.getDate()}, ${y}`;
    }
    if (en.getFullYear() === y) {
      return `${names[s.getMonth()]} ${s.getDate()} – ${names[en.getMonth()]} ${en.getDate()}, ${y}`;
    }
    return `${names[s.getMonth()]} ${s.getDate()}, ${y} – ${names[en.getMonth()]} ${en.getDate()}, ${en.getFullYear()}`;
  }

  function regionName(e) {
    if (!e.region) return '';
    const set = DATA.regions[e.country === 'CA' ? 'CA' : 'US'] || {};
    return set[e.region] || e.region;
  }
  function place(e) {
    return [e.city, regionName(e)].filter(Boolean).join(', ') || (e.country === 'CA' ? 'Canada' : '');
  }

  const KIND = { show: 'RV show', dealer: 'Dealer show', giveaway: 'Giveaway', rally: 'Owner rally' };
  const href = (e) => 'event.html?event=' + encodeURIComponent(e.slug);

  function imgSrc(img, w) { return `../assets/events/web/${img.base}-${w}.webp`; }

  function row(e) {
    const st = status(e);
    const s = day(e.start) || day(e.end);
    const units = (e.units || []).map((u) => `<span class="evl-unit">${esc(u)}</span>`).join('');
    return `
      <li class="evl-row is-${st}">
        <a class="evl-link" href="${href(e)}">
          <span class="evl-date" aria-hidden="true">
            <span class="evl-date-m">${s ? SHORT[s.getMonth()] : ''}</span>
            <span class="evl-date-d">${e.start ? day(e.start).getDate() : '—'}</span>
          </span>
          <span class="evl-main">
            <span class="evl-name">${esc(e.title)}</span>
            <span class="evl-meta">
              <span>${esc(range(e))}</span>
              ${place(e) ? `<span>${esc(place(e))}</span>` : ''}
            </span>
          </span>
          <span class="evl-tags">
            ${units}
            ${st !== 'upcoming' ? `<span class="evl-status is-${st}">${STATUS_LABEL[st]}</span>` : ''}
          </span>
          <svg class="evl-go" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>
        </a>
      </li>`;
  }

  return { DATA, MONTHS, SHORT, esc, day, today, status, STATUS_LABEL, range, place, regionName, KIND, href, imgSrc, row };
}());
