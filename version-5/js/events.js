/* ===================================================
   Jayco — Events (events.html)
   ---------------------------------------------------
   Two parts, both from js/events-data.js through
   js/events-ui.js:

   • WHAT'S ON. Anything happening today, else the next
     event within 60 days, as one large card. When there
     is neither, the section stays hidden rather than
     leading with a show that ended in spring.

   • THE SHOW SEASON. One season at a time — the year
     that has the soonest upcoming show, else the latest
     year — grouped by month, filtered by RV type, state
     or province and a search. Every choice is written to
     the address (?season=&units=&region=&q=) so a
     filtered list can be shared, and read back on load.
   =================================================== */

(function () {
  'use strict';

  const UI = window.JAYCO_EVENTS_UI;
  const monthsEl = document.getElementById('evl-months');
  if (!UI || !monthsEl) return;

  const { DATA, MONTHS, esc, day, today, status, range, place, KIND, href, imgSrc } = UI;
  const $ = (s) => document.querySelector(s);
  const events = DATA.events.slice().sort((a, b) => (a.start || a.end).localeCompare(b.start || b.end));
  const year = (e) => (e.start || e.end).slice(0, 4);

  /* ---------- What's on ---------- */
  (function feature() {
    const t = today();
    const soon = new Date(t); soon.setDate(soon.getDate() + 60);
    const now = events.filter((e) => status(e) === 'now');
    const next = events.filter((e) => status(e) === 'upcoming' && day(e.start) <= soon);
    const pick = now.concat(next).sort((a, b) =>
      (b.body ? 1 : 0) - (a.body ? 1 : 0) || a.start.localeCompare(b.start))[0];
    if (!pick) return;

    const st = status(pick);
    $('#evl-now-label').textContent = st === 'now' ? 'Happening now' : 'Coming up';
    $('#evl-now-h').textContent = st === 'now' ? 'Where to find Jayco this week.' : 'Where to find Jayco next.';
    const img = pick.img;
    $('#evl-feature').innerHTML = `
      <a class="evl-card" href="${href(pick)}">
        ${img ? `<span class="evl-card-media"><img src="${imgSrc(img, 1400)}" srcset="${imgSrc(img, 800)} 800w, ${imgSrc(img, 1400)} ${img.size[0]}w"
              sizes="(max-width: 900px) 92vw, 52vw" width="${img.size[0]}" height="${img.size[1]}" alt="" decoding="async" /></span>` : ''}
        <span class="evl-card-body">
          <span class="evl-card-kicker"><span class="evl-status is-${st}">${UI.STATUS_LABEL[st]}</span>${esc(KIND[pick.kind] || 'Event')}</span>
          <span class="evl-card-h">${esc(pick.title)}</span>
          <span class="evl-card-facts">
            <span>${esc(range(pick, true))}</span>
            ${pick.venue ? `<span>${esc(pick.venue)}${pick.booth ? ', ' + esc(pick.booth) : ''}</span>` : ''}
            ${place(pick) ? `<span>${esc(place(pick))}</span>` : ''}
          </span>
          ${pick.summary ? `<span class="evl-card-p">${esc(pick.summary)}</span>` : ''}
          <span class="evl-card-go">Event details</span>
        </span>
      </a>`;
    $('#evl-now').hidden = false;
  }());

  /* ---------- The show season ---------- */
  /* every kind is listed: the giveaway and the Jubilee belong in their month too */
  const listed = events;
  const seasons = Array.from(new Set(listed.map(year))).sort().reverse();
  const upcomingYear = (events.find((e) => status(e) !== 'past') || {}).start;
  const params = new URLSearchParams(location.search);

  const state = {
    season: seasons.indexOf(params.get('season')) !== -1 ? params.get('season')
      : (upcomingYear && seasons.indexOf(upcomingYear.slice(0, 4)) !== -1 ? upcomingYear.slice(0, 4) : seasons[0]),
    units: ['Towable', 'Motorized'].indexOf(params.get('units')) !== -1 ? params.get('units') : '',
    region: params.get('region') || '',
    q: params.get('q') || '',
  };

  $('#evl-seasons').innerHTML = seasons.map((s) =>
    `<button type="button" class="evl-season" data-season="${s}" aria-pressed="false">${s}</button>`).join('');

  const unitsSel = $('#evl-units');
  const regionSel = $('#evl-region');
  const qInput = $('#evl-q');
  unitsSel.value = state.units;
  qInput.value = state.q;

  /* Regions offered are the ones that season actually has, US then Canada,
     by name, so the list never offers a place with nothing in it. */
  function fillRegions() {
    const inSeason = listed.filter((e) => year(e) === state.season && e.region);
    const seen = {};
    inSeason.forEach((e) => { seen[(e.country || 'US') + ':' + e.region] = UI.regionName(e); });
    const opt = (c, label) => {
      const keys = Object.keys(seen).filter((k) => k.indexOf(c + ':') === 0)
        .sort((a, b) => seen[a].localeCompare(seen[b]));
      return keys.length ? `<optgroup label="${label}">${keys.map((k) =>
        `<option value="${k.split(':')[1]}">${esc(seen[k])}</option>`).join('')}</optgroup>` : '';
    };
    regionSel.innerHTML = '<option value="">Everywhere</option>' + opt('US', 'United States') + opt('CA', 'Canada');
    regionSel.value = Array.prototype.some.call(regionSel.options, (o) => o.value === state.region) ? state.region : '';
    state.region = regionSel.value;
  }

  const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  function render(write) {
    document.querySelectorAll('.evl-season').forEach((b) =>
      b.setAttribute('aria-pressed', b.dataset.season === state.season ? 'true' : 'false'));

    const words = norm(state.q).split(/\s+/).filter(Boolean);
    const rows = listed.filter((e) => year(e) === state.season)
      .filter((e) => !state.units || !e.units || e.units.indexOf(state.units) !== -1)
      .filter((e) => !state.region || e.region === state.region)
      .filter((e) => {
        const hay = norm([e.title, e.city, UI.regionName(e), e.venue, e.dealer].join(' '));
        return words.every((w) => hay.indexOf(w) !== -1);
      });

    /* Upcoming first, then past. Anything happening now or still to come
       leads, in date order; everything that has ended follows under its own
       heading, most recent month first, since the show that just ended is the
       one most likely to be looked for. Past months fold behind their heading
       unless a filter or search is on — someone looking for a show by name
       wants to see it, past or not. */
    const filtering = !!(state.q || state.region || state.units);
    const byMonth = (list) => {
      const out = {};
      list.forEach((e) => {
        const d = day(e.start) || day(e.end);
        (out[d.getMonth()] = out[d.getMonth()] || []).push(e);
      });
      return out;
    };
    const count = (n) => `${n} ${n === 1 ? 'event' : 'events'}`;
    const upcoming = rows.filter((e) => status(e) !== 'past');
    const ended = rows.filter((e) => status(e) === 'past');

    const openMonth = (m, list, id) => `
      <section class="evl-month" aria-labelledby="${id}">
        <div class="evl-month-sum is-static">
          <h4 class="evl-month-h" id="${id}">${MONTHS[m]} <span>${state.season}</span></h4>
          <span class="evl-month-n">${count(list.length)}</span>
        </div>
        <ul class="evl-rows" role="list">${list.map(UI.row).join('')}</ul>
      </section>`;
    const foldedMonth = (m, list) => `
      <details class="evl-month is-past">
        <summary class="evl-month-sum">
          <h4 class="evl-month-h">${MONTHS[m]} <span>${state.season}</span></h4>
          <span class="evl-month-n">${count(list.length)} · Ended</span>
          <svg class="evl-month-chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
        </summary>
        <ul class="evl-rows" role="list">${list.map(UI.row).join('')}</ul>
      </details>`;

    const up = byMonth(upcoming);
    const done = byMonth(ended);
    const upHtml = Object.keys(up).map(Number).sort((a, b) => a - b)
      .map((m) => openMonth(m, up[m], 'evl-up-' + m)).join('');
    const doneHtml = Object.keys(done).map(Number).sort((a, b) => b - a)
      .map((m) => (filtering ? openMonth(m, done[m], 'evl-past-' + m) : foldedMonth(m, done[m]))).join('');

    monthsEl.innerHTML =
      (upcoming.length ? `
      <div class="evl-group" aria-labelledby="evl-group-up">
        <h3 class="evl-group-h" id="evl-group-up">Upcoming <span>${count(upcoming.length)}</span></h3>
        ${upHtml}
      </div>` : '') +
      (ended.length ? `
      <div class="evl-group is-past" aria-labelledby="evl-group-past">
        <h3 class="evl-group-h" id="evl-group-past">Past events <span>${count(ended.length)}</span></h3>
        ${doneHtml}
      </div>` : '');

    const past = rows.filter((e) => status(e) === 'past').length;
    $('#evl-empty').hidden = rows.length > 0;
    $('#evl-count').textContent = rows.length
      ? `${rows.length} ${rows.length === 1 ? 'event' : 'events'} in ${state.season}` +
        (past === rows.length ? ', all of them past' : past ? `, ${past} past` : '')
      : '';

    if (write && window.history && window.history.replaceState) {
      const p = new URLSearchParams();
      p.set('season', state.season);
      if (state.units) p.set('units', state.units);
      if (state.region) p.set('region', state.region);
      if (state.q) p.set('q', state.q);
      window.history.replaceState(null, '', location.pathname + '?' + p.toString());
    }
  }

  $('#evl-seasons').addEventListener('click', (e) => {
    const b = e.target.closest('.evl-season');
    if (!b) return;
    state.season = b.dataset.season;
    fillRegions();
    render(true);
  });
  unitsSel.addEventListener('change', () => { state.units = unitsSel.value; render(true); });
  regionSel.addEventListener('change', () => { state.region = regionSel.value; render(true); });
  let qt = 0;
  qInput.addEventListener('input', () => {
    clearTimeout(qt);
    qt = setTimeout(() => { state.q = qInput.value.trim(); render(true); }, 120);
  });

  fillRegions();
  render(false);
}());
