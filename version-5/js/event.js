/* ===================================================
   Jayco — One event (event.html?event=<slug>)
   ---------------------------------------------------
   Everything from js/events-data.js through
   js/events-ui.js. The facts panel is built from what
   the record has and nothing else: no venue line for a
   show Jayco listed by city only, no booth unless one is
   named. A show row has no text of its own, so its body
   is one sentence built from Jayco's own note on its show
   lists — a Jayco display and a Jayco sales rep — and the
   show's website.

   Add to calendar is an .ics made here, all-day, so it
   lands on the right dates in any time zone.
   =================================================== */

(function () {
  'use strict';

  const UI = window.JAYCO_EVENTS_UI;
  if (!UI) return;
  const { DATA, MONTHS, esc, day, status, STATUS_LABEL, range, place, KIND, imgSrc } = UI;
  const $ = (s) => document.querySelector(s);

  const slug = (new URLSearchParams(location.search).get('event') || '').toLowerCase();
  const e = DATA.events.find((x) => x.slug === slug);

  if (!e) {
    $('#evd-h').textContent = 'Event not found';
    document.querySelector('.evd-grid').hidden = true;
    $('#evd-missing').hidden = false;
    document.title = 'Event not found — Jayco (v5)';
    return;
  }

  const st = status(e);
  document.title = `${e.title} — Jayco Events (v5)`;
  $('#evd-h').textContent = e.title;
  $('#evd-status').textContent = STATUS_LABEL[st];
  $('#evd-status').className = 'evd-status evl-status is-' + st;
  $('#evd-kind').textContent = KIND[e.kind] || 'Event';
  $('#evd-when').textContent = [range(e, true), place(e)].filter(Boolean).join('  ·  ');

  /* ---------- picture ---------- */
  if (e.img) {
    const img = $('#evd-img');
    img.src = imgSrc(e.img, 1400);
    img.srcset = `${imgSrc(e.img, 800)} 800w, ${imgSrc(e.img, 1400)} ${e.img.size[0]}w`;
    img.sizes = '(max-width: 900px) 92vw, 60vw';
    img.width = e.img.size[0];
    img.height = e.img.size[1];
    /* A show's picture is the month banner it was listed under, and it
       carries that month in its own lettering — alt says so, rather than
       pretending it is a photograph of this show. */
    img.alt = e.body ? '' : 'Jayco show-season banner for ' + MONTHS[(day(e.start) || day(e.end)).getMonth()];
    $('#evd-figure').hidden = false;
  }

  /* ---------- body ---------- */
  const collection = e.list && DATA.collections[e.list];
  let body = '';
  if (e.body) {
    body = e.body;
    (e.gallery || []).forEach((g) => {
      if (!g.base) return;
      body += `<figure class="evd-inline"><img src="${imgSrc(g, 1400)}" width="${g.size[0]}" height="${g.size[1]}"
                 loading="lazy" decoding="async" alt="${esc(g.alt)}" /></figure>`;
    });
    if (e.agenda) body += `<h2>Agenda</h2>${e.agenda}`;
  } else {
    const where = place(e) ? ` in ${esc(place(e))}` : '';
    const verb = st === 'past' ? 'had' : 'has';
    body = e.kind === 'dealer'
      ? `<p>${esc(e.dealer || 'A Jayco dealer')} ${verb} the latest Jayco RVs at ${esc(e.title.replace(/^.*? – /, ''))}${where}, ${esc(range(e, true))}, with experts on hand to answer questions.</p>`
      : `<p>${esc(e.title)}${where} ${verb} a Jayco display and a Jayco sales rep, ${esc(range(e, true))} — ` +
        `the chance to explore the ${e.units && e.units.length === 1 ? esc(e.units[0].toLowerCase()) + ' ' : ''}lineup in person, ` +
        `with product experts and well-informed dealers.</p>`;
    /* Jayco's note on its show lists, reworded for one show: "the shows below"
       has nothing below it on this page. */
    if (collection && collection.note) {
      body += '<p class="evd-note">Jayco’s show list is subject to change. It is accurate at the time of ' +
        'publishing, so check the show’s own website before you go.</p>';
    }
  }
  $('#evd-body').innerHTML = body;
  $('#evd-body').querySelectorAll('a[href^="http"]').forEach((a) => {
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  });

  /* ---------- facts ---------- */
  const fact = (label, html) => html ? `<div class="evd-fact"><dt>${label}</dt><dd>${html}</dd></div>` : '';
  const addressLine = e.address || [e.venue, place(e)].filter(Boolean).join(', ');
  const mapQ = encodeURIComponent([e.venue, e.address || place(e)].filter(Boolean).join(', '));
  const links = (e.links || (e.link ? [e.link] : []))
    .filter((l) => !/^mailto:/.test(l.href));
  const mail = (e.links || []).find((l) => /^mailto:/.test(l.href));

  $('#evd-facts').innerHTML = `
    <dl class="evd-dl">
      ${fact('When', esc(range(e, true)) + (e.time ? `<span class="evd-sub">${esc(e.time)}</span>` : '') +
        (e.period ? `<span class="evd-sub">${esc(e.period)}</span>` : ''))}
      ${fact('Where', [e.venue ? `<strong>${esc(e.venue)}</strong>` : '', esc(e.address || place(e))].filter(Boolean).join('<br>'))}
      ${fact('Find Jayco', e.booth ? esc(e.booth) + (e.dealer ? ` · ${esc(e.dealer)} display` : '') : '')}
      ${fact('With', !e.booth && e.dealer ? esc(e.dealer) : '')}
      ${fact('RVs', e.units ? e.units.map(esc).join(' and ') : '')}
    </dl>
    <div class="evd-actions">
      ${links.map((l, i) => `<a class="${i === 0 ? 'btn-primary' : 'btn-secondary-light'} evd-btn" href="${esc(l.href)}"
          target="_blank" rel="noopener noreferrer">${esc(l.label === e.title ? 'Show website' : l.label)}<span class="sr-only"> (opens in a new tab)</span></a>`).join('')}
      ${addressLine ? `<a class="evd-textlink" href="https://www.google.com/maps/search/?api=1&amp;query=${mapQ}"
          target="_blank" rel="noopener noreferrer">Directions<span class="sr-only"> (opens Google Maps in a new tab)</span></a>` : ''}
      ${st !== 'past' && e.start ? `<a class="evd-textlink" id="evd-ics" href="#" download="${esc(e.slug)}.ics">Add to calendar</a>` : ''}
      ${mail ? `<a class="evd-textlink" href="${esc(mail.href)}">${esc(mail.label)}</a>` : ''}
    </div>
    <a class="evd-dealer" href="dealers.html${e.city ? '?q=' + encodeURIComponent(e.city) : ''}">
      <span class="evd-dealer-h">${st === 'past' ? 'Missed it?' : 'Can’t make it?'}</span>
      <span class="evd-dealer-p">Find a Jayco dealer${e.city ? ' near ' + esc(e.city) : ''}.</span>
    </a>`;

  const ics = $('#evd-ics');
  if (ics) {
    const d = (s) => s.replace(/-/g, '');
    const endPlus = day(e.end || e.start); endPlus.setDate(endPlus.getDate() + 1);
    const pad = (n) => String(n).padStart(2, '0');
    const endStr = `${endPlus.getFullYear()}${pad(endPlus.getMonth() + 1)}${pad(endPlus.getDate())}`;
    const icsEsc = (s) => String(s).replace(/[,;\\]/g, (m) => '\\' + m);
    const text = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Jayco//Events//EN', 'BEGIN:VEVENT',
      `UID:${e.slug}@jayco-events`, `DTSTART;VALUE=DATE:${d(e.start)}`, `DTEND;VALUE=DATE:${endStr}`,
      `SUMMARY:${icsEsc(e.title)}`,
      addressLine ? `LOCATION:${icsEsc(addressLine)}` : '',
      `URL:${location.href}`, 'END:VEVENT', 'END:VCALENDAR',
    ].filter(Boolean).join('\r\n');
    ics.href = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(text);
  }

  /* ---------- also that month ---------- */
  const d0 = day(e.start) || day(e.end);
  const same = DATA.events.filter((x) => x.slug !== e.slug && (x.start || x.end).slice(0, 7) === (e.start || e.end).slice(0, 7))
    .sort((a, b) => (a.start || a.end).localeCompare(b.start || b.end));
  if (same.length) {
    $('#evd-more-h').textContent = `Also in ${MONTHS[d0.getMonth()]} ${d0.getFullYear()}.`;
    const shown = same.slice(0, 8);
    $('#evd-more-rows').innerHTML = shown.map(UI.row).join('');
    if (same.length > shown.length) {
      $('#evd-more-rows').insertAdjacentHTML('afterend',
        `<a class="btn-secondary-light evd-more-all" href="events.html?season=${d0.getFullYear()}">All ${same.length + 1} events that month</a>`);
    }
    $('#evd-more').hidden = false;
  }
}());
