/* ===================================================
   Jayco — All RVs (all-rvs.html)
   ---------------------------------------------------
   Every RV class on one page, grouped towable then
   motorized, each card linking to its type.html
   overview.

   WHAT LIVES HERE AND WHAT DOES NOT
   • Names, the towable / motorized split, model counts
     and starting prices are READ from window.JAYCO
     (models-data.js); floorplan counts from
     window.JAYCO_BUILD (build-data.js). Retyping them
     here is how two pages start quoting different
     figures for the same class.
   • The one-paragraph description per class is the only
     authored copy. It is adapted from the type rail on
     new-to-rving.js (START), rewritten in Jayco's own
     voice; a change to one should be a deliberate
     change to the other.
   • Photography is the new-to-rving portrait plates,
     already exported at 500 and 800 wide.
   =================================================== */

(function () {
  'use strict';

  const JAYCO = window.JAYCO;
  const BUILD = window.JAYCO_BUILD || {};
  if (!JAYCO) return;

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const usd = (n) => '$' + Math.round(n).toLocaleString('en-US');

  /* Keyed by category id. Order on the page comes from models-data.js, so a
     new class lands in its group without touching the layout. */
  const CLASSES = {
    'travel-trailers': { img: 'type-tt',
      alt: 'A Jayco travel trailer with its awning out in a mountain meadow, a picnic table laid beneath it under heavy cloud',
      desc: 'The classic first RV. Hitch it to the back of an SUV or pickup and choose from family bunkhouses to ultra-light couples’ coaches, at the lowest price of entry in our lineup.' },
    'destination': { img: 'type-dt',
      alt: 'A long Jayco destination trailer on a gravel pad beside a lake at sunset, picnic table and fire ring in front of it under tall pines',
      desc: 'Built to be towed to a spot and stayed in. Residential fittings, tall windows and a layout closer to a small vacation home than to something you move every weekend.' },
    'fifth-wheels': { img: 'type-fw',
      alt: 'A Jayco Pinnacle fifth wheel on a grass pitch under heavy cloud, awning out over a rug, table and chairs, a bike parked alongside',
      desc: 'Hitches in the bed of a pickup, which puts a raised bedroom over the truck and makes a long coach easier to tow and place. The most home you can tow.' },
    'toy-haulers': { img: 'type-th',
      alt: 'A Jayco Seismic toy hauler parked on desert sand with its awning out, prickly pear in the foreground',
      desc: 'A garage at the back with a ramp door, so the bikes or the side-by-side ride inside. Once it is unloaded, the garage becomes more living space.' },
    'class-b': { img: 'type-b',
      alt: 'A Jayco Class B camper van beside a shallow creek in autumn woods, its awning out over two camp chairs at the water’s edge',
      desc: 'A camper van that drives like one. No tow vehicle, nothing that will not fit a normal parking space — the smallest step from a car that is still a full RV.' },
    'class-c': { img: 'type-c',
      alt: 'A Jayco Class C motorhome parked among pines at golden hour, awning out and two people sitting in camp chairs in its shade',
      desc: 'The easy way into a motorhome. A familiar van-style cab, a cab-over bunk and a layout that drives and parks more easily than a Class A.' },
    'super-c': { img: 'type-sc',
      alt: 'A Jayco Super C motorhome on a heavy-duty truck chassis parked among red rock formations in the desert, slide-out extended',
      desc: 'A Class C body on a heavy-duty diesel truck chassis, built for what it will pull and carry — the answer when a big trailer or a second vehicle has to come too.' },
    'class-a': { img: 'type-a',
      alt: 'A Jayco Alante Class A motorhome parked in a wooded clearing with its awning out over camp chairs and a table',
      desc: 'Our largest motorhomes, with a flat front and a full-width windshield. The most living space you can drive, from approachable gas coaches to fully loaded luxury.' },
  };

  /* The two group intros are the homepage's class scroller copy (index.html
     #categories), so the two pages say the same thing about each half. */
  const GROUPS = [
    { type: 'towable', label: 'Towable', heading: 'Bring More Adventure Along',
      body: 'From lightweight travel trailers to spacious fifth wheels, find a towable built for wherever the road takes you.' },
    { type: 'motorized', label: 'Motorized', heading: 'Put Adventure in the Driver’s Seat',
      body: 'Explore motorhomes designed to make every mile more comfortable, capable, and memorable.' },
  ];

  function stats(catId) {
    let models = 0, plans = 0; const price = [];
    Object.keys(JAYCO.models).forEach((slug) => {
      const m = JAYCO.models[slug];
      if (!m || m.category !== catId) return;
      models++;
      if (m.basePrice) price.push(m.basePrice);
      plans += ((BUILD[slug] || {}).floorplans || []).length;
    });
    return { models, plans, from: price.length ? Math.min.apply(null, price) : null };
  }

  function card(cat) {
    const c = CLASSES[cat.id] || {};
    const n = stats(cat.id);
    if (!n.models) return '';
    const plate = c.img
      ? `<img class="ar-card-img"
             src="../assets/new-to-rving/web/${esc(c.img)}-800.webp"
             srcset="../assets/new-to-rving/web/${esc(c.img)}-500.webp 500w,
                     ../assets/new-to-rving/web/${esc(c.img)}-800.webp 800w"
             sizes="(max-width: 599px) 88vw, (max-width: 1023px) 44vw, 22vw"
             width="800" height="1066" alt="${esc(c.alt)}"
             loading="lazy" decoding="async" />`
      : `<img class="ar-card-img" src="${esc(cat.image)}" alt="" loading="lazy" decoding="async" />`;
    /* Floorplans are only counted when build-data.js has loaded; without it the
       meta line says models alone rather than "0 floorplans". */
    const meta = n.models + ' model' + (n.models === 1 ? '' : 's') +
      (n.plans ? ' · ' + n.plans + ' floorplan' + (n.plans === 1 ? '' : 's') : '');
    return `<li class="ar-card">
      <a class="ar-card-link" href="type.html?type=${esc(cat.id)}">
        <div class="ar-card-plate">
          ${plate}
          <span class="ar-card-scrim" aria-hidden="true"></span>
          <h3 class="ar-card-name">${esc(cat.name)}</h3>
        </div>
        <div class="ar-card-body">
          <span class="ar-card-meta">${esc(meta)}</span>
          ${c.desc ? `<p class="ar-card-desc">${esc(c.desc)}</p>` : ''}
          <div class="ar-card-foot">
            <span class="ar-card-from">${n.from ? '<span class="ar-card-from-label">MSRP Starting At</span>' + usd(n.from) : ''}</span>
            <span class="ar-card-more">Explore<span class="sr-only"> ${esc(cat.name)}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </span>
          </div>
        </div>
      </a>
    </li>`;
  }

  const root = document.getElementById('ar-groups');
  if (root) {
    root.innerHTML = GROUPS.map((g) => {
      const cards = JAYCO.categories.filter((c) => c.type === g.type).map(card).join('');
      if (!cards) return '';
      return `<section class="ar-group" aria-labelledby="ar-group-${g.type}">
        <div class="ar-group-head">
          <span class="section-label">${esc(g.label)}</span>
          <h2 class="section-heading dark" id="ar-group-${g.type}">${esc(g.heading)}</h2>
          <p class="section-body">${esc(g.body)}</p>
        </div>
        <ul class="ar-grid">${cards}</ul>
      </section>`;
    }).join('');
  }

  /* The page head's count line, read from the same data as the cards. */
  const sub = document.getElementById('ar-count');
  if (sub) {
    const models = Object.keys(JAYCO.models).length;
    let plans = 0;
    Object.keys(BUILD).forEach((slug) => { plans += ((BUILD[slug] || {}).floorplans || []).length; });
    sub.textContent = JAYCO.categories.length + ' classes · ' + models + ' models' +
      (plans ? ' · ' + plans + ' floorplans' : '');
  }
}());
