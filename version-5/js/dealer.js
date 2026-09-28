/* ===================================================
   Jayco — one dealer's page (dealer.html?dealer=<slug>)
   ---------------------------------------------------
   What jayco.com's /dealers/<slug>/ page carries — name, a contact form,
   phone, address with directions, and the models carried — read from the
   same dealer-data.js the locator uses, so the two never disagree. Adds the
   nearest other dealers, which jayco.com's page does not have.
   =================================================== */
(function () {
  'use strict';

  const ALL = (window.JAYCO_DEALERS && window.JAYCO_DEALERS.dealers) || [];
  const LINEUP = window.JAYCO || { categories: [], models: {} };
  const PAGES = window.JAYCO_MODEL_PAGES || [];

  const $ = (sel) => document.querySelector(sel);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = (n) => '$' + Math.round(n).toLocaleString('en-US');

  if (!$('#dealer')) return;

  /* /dealers/<slug> on Netlify rewrites here with the slug as ?dealer= */
  const slug = new URLSearchParams(location.search).get('dealer') || '';
  const d = ALL.find((x) => x.slug === slug);

  if (!d) {
    ['#dd-main', '#dd-models', '#dd-nearby'].forEach((s) => { const el = $(s); if (el) el.remove(); });
    $('#dd-title').textContent = 'Dealer not found';
    $('#dd-missing').hidden = false;
    document.title = 'Dealer not found — Jayco (v5)';
    return;
  }

  /* ---------- Place and distance (as dealers.js words them) ---------- */
  const NA = new Set(['US', 'CA']);
  let names = null;
  try { names = new Intl.DisplayNames(['en'], { type: 'region' }); } catch (e) { /* older browsers */ }
  const countryName = (c) => (names && c ? names.of(c) : c) || '';
  const hasPos = (x) => typeof x.lat === 'number' && typeof x.lng === 'number';
  function place(x) {
    const line = [[x.city, x.state].filter(Boolean).join(', '), x.zip].filter(Boolean).join(' ');
    return NA.has(x.country) ? line : [line, countryName(x.country)].filter(Boolean).join(', ');
  }
  function km(a, b) {
    const r = Math.PI / 180;
    const h = Math.sin((b.lat - a.lat) * r / 2) ** 2 +
      Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin((b.lng - a.lng) * r / 2) ** 2;
    return 12742 * Math.asin(Math.sqrt(h));
  }
  const distanceLabel = (k) => d.country === 'US'
    ? Math.round(k * 0.621371).toLocaleString('en-US') + ' mi'
    : Math.round(k).toLocaleString('en-US') + ' km';

  const address = [d.street, place(d)].filter(Boolean).join(', ');
  const directions = 'https://maps.google.com/maps?daddr=' + encodeURIComponent(address);
  const tel = d.phone ? 'tel:' + d.phone.replace(/[^\d+]/g, '') : '';
  const cityLine = [d.city, d.state].filter(Boolean).join(', ') + (NA.has(d.country) ? '' : ', ' + countryName(d.country));

  document.title = `${d.name}, ${cityLine} — Jayco Dealer (v5)`;

  /* ---------- Head ---------- */
  $('#dd-title').textContent = d.name;
  $('#dd-place').textContent = cityLine;
  $('#dd-actions').innerHTML = [
    tel ? `<a class="btn-primary" href="${esc(tel)}">Call ${esc(d.phone)}</a>` : '',
    `<a class="btn-secondary-light" href="${esc(directions)}" target="_blank" rel="noopener">Get Directions</a>`,
    /* "#" until the dealer inventory page is built, as on the locator */
    `<a class="btn-secondary-light dd-inventory" href="#">View Inventory</a>`,
  ].join('');
  $('.dd-inventory').addEventListener('click', (e) => e.preventDefault());

  /* ---------- Details card ---------- */
  const PIN = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
      stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>`;
  const PHONE = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
      stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>`;
  $('#dd-info').innerHTML = `
    <div class="dd-info-row">
      <span class="dd-info-ico">${PIN}</span>
      <div>
        <h2 class="dd-info-label">Address</h2>
        <p class="dd-info-val">${[d.street, place(d)].filter(Boolean).map(esc).join('<br />')}</p>
        <a class="dd-link" href="${esc(directions)}" target="_blank" rel="noopener">Get directions</a>
      </div>
    </div>
    ${d.phone ? `
    <div class="dd-info-row">
      <span class="dd-info-ico">${PHONE}</span>
      <div>
        <h2 class="dd-info-label">Phone</h2>
        <p class="dd-info-val"><a class="dd-tel" href="${esc(tel)}">${esc(d.phone)}</a></p>
      </div>
    </div>` : ''}`;

  /* ---------- Models carried ----------
     Jayco's dealer records name models the way their own dropdown does
     ("Eagle Fifth Wheel", "Jay Flight SLX 8"); the lineup here names them per
     model page. Exact names match themselves; these are the rest. Anything
     still unmatched is a line outside the 2027 lineup, listed by name. */
  const ALIAS = {
    'Eagle Fifth Wheel': 'eagle-fw', 'Eagle Travel Trailer': 'eagle-tt', 'Eagle SLE FW': 'eagle-sle-fw',
    'Seismic Fifth Wheel': 'seismic-fw', 'Seismic Travel Trailer': 'seismic-tt',
    'Jay Flight SLX': 'jay-flight', 'Jay Flight SLX 7': 'jay-flight', 'Jay Flight SLX 8': 'jay-flight',
  };
  const byName = {};
  Object.keys(LINEUP.models).forEach((s) => { byName[LINEUP.models[s].name] = s; });

  const carried = [];      // lineup slugs, deduped
  const other = [];        // names outside the lineup
  (d.models || []).forEach((n) => {
    const s = ALIAS[n] || byName[n];
    if (s && LINEUP.models[s]) { if (carried.indexOf(s) < 0) carried.push(s); }
    else if (other.indexOf(n) < 0) other.push(n);
  });

  const modelHref = (s) => PAGES.indexOf(s) >= 0
    ? 'model.html?model=' + s : 'type.html?type=' + LINEUP.models[s].category;

  if (!carried.length && !other.length) {
    $('#dd-models').remove();
  } else {
    const groups = LINEUP.categories
      .map((c) => ({ c, slugs: carried.filter((s) => LINEUP.models[s].category === c.id) }))
      .filter((g) => g.slugs.length);
    $('#dd-models').innerHTML = `
      <div class="dd-inner">
        <div class="dd-section-head">
          <span class="section-label">Models Carried</span>
          <h2 class="section-heading dark" id="dd-models-h">What you can see here.</h2>
        </div>
        ${groups.map((g) => `
        <div class="dd-group">
          <h3 class="dd-group-h">${esc(g.c.name)} <span class="dd-group-n">${g.slugs.length}</span></h3>
          <ul class="dd-model-grid" role="list">
            ${g.slugs.map((s) => {
              const m = LINEUP.models[s];
              return `
              <li>
                <a class="dd-model" href="${modelHref(s)}">
                  <span class="dd-model-art"><img src="${esc(m.img)}" alt="" loading="lazy" decoding="async" /></span>
                  <span class="dd-model-name">${esc(m.name)}</span>
                  <span class="dd-model-price">MSRP Starting At ${money(m.basePrice)}</span>
                </a>
              </li>`;
            }).join('')}
          </ul>
        </div>`).join('')}
        ${other.length ? `<p class="dd-other"><span>Also carries</span> ${other.map(esc).join(', ')}</p>` : ''}
      </div>`;
  }

  /* ---------- The form ---------- */
  $('#dd-in-dealer').value = `${d.name} — ${address}`;
  $('#dd-in-slug').value = d.slug;
  $('#dd-contact-h').textContent = 'Contact ' + d.name;
  if (d.country !== 'US') {
    $('#dd-zip-label').textContent = 'Postal code';
    $('#dd-zip').placeholder = d.country === 'CA' ? 'V3A 5E8' : 'Postal code';
  }
  $('#dd-model').insertAdjacentHTML('beforeend', carried
    .map((s) => `<option>${esc(LINEUP.models[s].year + ' ' + LINEUP.models[s].name)}</option>`).join(''));

  /* Netlify's form handler only exists on the deployed site; locally the POST
     would 404, so the page says so and shows the sent state anyway. */
  const canPost = location.protocol !== 'file:' &&
    !/^(localhost|127\.|0\.0\.0\.0|\[::1\])$/.test(location.hostname.replace(/\]$/, ']'));
  const form = $('#dd-form');
  function succeed(first) {
    form.hidden = true;
    $('#dd-contact-sub').hidden = true;
    $('#dd-done-body').textContent = (first ? 'Thanks, ' + first + '. ' : '') +
      'Your message is on its way to ' + d.name + ', and they will reply by email' +
      (d.phone ? ' or give you a call. You can also reach them now at ' + d.phone + '.' : '.');
    $('#dd-done').hidden = false;
    $('#dd-done-h').focus();
    if (window.ScrollTrigger) requestAnimationFrame(() => window.ScrollTrigger.refresh());
  }
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const first = $('#dd-first').value.trim();
    if (!canPost) {
      $('#dd-note').textContent = 'Sending needs the published site — this is a local preview.';
      succeed(first);
      return;
    }
    fetch(location.pathname, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(new FormData(form)).toString(),
    }).then(() => succeed(first)).catch(() => {
      $('#dd-note').textContent = 'That did not send. Try again in a moment.';
    });
  });

  /* ---------- Nearby ----------
     The three closest other dealers in the same country. None without
     coordinates, since a distance from a guessed point would be invented. */
  const near = hasPos(d) ? ALL
    .filter((x) => x !== d && x.country === d.country && hasPos(x) &&
      !(x.lat === d.lat && x.lng === d.lng && x.name === d.name))
    .map((x) => ({ x, k: km(d, x) }))
    .sort((a, b) => a.k - b.k)
    .slice(0, 3) : [];
  if (!near.length) {
    $('#dd-nearby').remove();
  } else {
    $('#dd-nearby').innerHTML = `
      <div class="dd-inner">
        <div class="dd-section-head">
          <span class="section-label">Nearby</span>
          <h2 class="section-heading dark" id="dd-nearby-h">Other dealers close by.</h2>
        </div>
        <ul class="dd-near-grid" role="list">
          ${near.map(({ x, k }) => `
          <li>
            <a class="dd-near" href="dealer.html?dealer=${encodeURIComponent(x.slug)}">
              <span class="dd-near-dist">${distanceLabel(k)}</span>
              <span class="dd-near-name">${esc(x.name)}</span>
              <span class="dd-near-addr">${[x.street, place(x)].filter(Boolean).map(esc).join('<br />')}</span>
            </a>
          </li>`).join('')}
        </ul>
        <a class="btn-secondary-light dd-all" href="dealers.html">See all dealers</a>
      </div>`;
  }
}());
