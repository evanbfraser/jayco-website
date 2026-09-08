/* ===================================================
   Jayco — New to RVing? (new-to-rving.html)
   ---------------------------------------------------
   A first page for somebody who has not bought one yet,
   and the answer to every "how many" on it is measured
   rather than written.

   ONE INDEX, BUILT ONCE. Every band on this page —
   sleeping capacity, what a tow rating reaches, what a
   budget reaches — is counted off the same flattened
   list of the 181 real floorplans in build-data.js.
   towing.js sets the rule this follows: "no data file
   of its own: the weights are already on the site, and
   a second copy would drift."

   REAL MSRP, not the base price. build-data stores each
   plan's `price` as a DELTA from its model's basePrice
   in models-data.js, so a plan's real starting figure
   is the sum. That is what the spend bands count.

   EVERY BAND STATES ITS DENOMINATOR, and they differ:
   161 of the 181 plans carry a published price (Jayco
   badges 20 as NEW with no pricing yet), 164 publish
   sleeping capacity, and 115 towables publish a gross
   weight rating. A count with no denominator is the
   part of a page like this people misread, so each
   section says what it counted and what it left out.

   THE TRAVEL STYLES ARE AUTHORED, and so are the RV
   types each one recommends — see STYLES below. They do
   NOT read the quiz's cadenceFit/campStyleFit data, as
   an earlier build of that section did, so they do not
   follow the lineup on their own. The count printed
   beside each recommended type is still measured.

   THE THREE ARTICLES are real posts, resolved by slug
   against blog-data.js and drawn with blog-ui.js's own
   card, so they match every other post card on the site
   and their titles run through the same sentence-case
   rule.
   =================================================== */

(function () {
  'use strict';

  const JAYCO = window.JAYCO;
  const BUILD = window.JAYCO_BUILD || {};
  const QUIZ = window.JAYCO_QUIZ;
  const UI = window.JAYCO_BLOG_UI;
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.prototype.slice.call((c || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const num = (s) => (s == null || s === '' ? null : parseInt(String(s).replace(/,/g, ''), 10));
  const usd = (n) => '$' + Math.round(n).toLocaleString('en-US');

  /* ---------- The index ---------- */
  const PLANS = [];
  if (JAYCO) {
    Object.keys(BUILD).forEach((slug) => {
      const m = JAYCO.models[slug];
      if (!m) return;
      const cat = JAYCO.categories.find((c) => c.id === m.category);
      (BUILD[slug].floorplans || []).forEach((f) => {
        const w = (f.specs || {}).Weights || {};
        PLANS.push({
          type: cat ? cat.type : null,
          /* null where Jayco has not published a price — a NEW badge — rather
             than a guess at one. */
          msrp: f.price == null ? null : m.basePrice + f.price,
          sleeps: f.sleeps || null,
          gvwr: num(w['Gross Vehicle Weight Rating (lbs)']),
        });
      });
    });
  }

  /* ---------- The pickers ----------
     Two sections on this page work the same way: options on the left, the RV
     types that suit the chosen one on the right. They share this renderer
     rather than carrying two copies of it.

     THE OPTIONS, THEIR MATCHES AND THEIR REASONS ARE AUTHORED — supplied for
     this page rather than derived. An earlier build read the quiz's own
     cadenceFit/campStyleFit arrays; this does not. What that means in practice:
     if the lineup changes, the class lists below do NOT follow it, and somebody
     has to revisit them.

     WHAT IS STILL MEASURED is the floorplan count printed beside each class,
     read from build-data.js at render time. So the recommendation is editorial
     and the number attached to it is not.

     THE ORDER OF EACH LIST IS DELIBERATE and is left exactly as written — these
     are ranked recommendations, so nothing re-sorts them. */
  const catName = (id) => {
    const c = JAYCO.categories.find((x) => x.id === id);
    return c ? c.name : id;
  };
  const plansOf = (slug) => ((BUILD[slug] || {}).floorplans || []);

  /* Floorplans per category, and per category at or above a sleeping capacity.
     Both counted once, at load. */
  const CAT_TOTAL = {};
  Object.keys(BUILD).forEach((slug) => {
    const m = JAYCO && JAYCO.models[slug];
    if (!m) return;
    CAT_TOTAL[m.category] = (CAT_TOTAL[m.category] || 0) + plansOf(slug).length;
  });

  function sleepsAtLeast(catId, min) {
    let n = 0;
    Object.keys(BUILD).forEach((slug) => {
      const m = JAYCO.models[slug];
      if (!m || m.category !== catId) return;
      n += plansOf(slug).filter((f) => f.sleeps && f.sleeps >= min).length;
    });
    return n;
  }

  /* One picker, two input shapes. `items` carry the label, the sub-line, the
     ranked class list, the reason, and a function returning the count line for
     a class. Pass mode 'slider' and the options become stops on a range input
     instead of a stack of buttons — the answer panel is identical either way.

     A CLASS WITH NOTHING BEHIND IT IS DROPPED. count() may return null to say
     "this class has no floorplan that qualifies", and such a row is not
     rendered. On the tow slider that is load-bearing rather than tidy-up: the
     lightest Jayco toy hauler is 11,700 lbs, so listing toy haulers under a
     7,500 lb rating would be pointing somebody at something their vehicle
     cannot legally pull. */
  /* ---------- Scroll to the answer, on a phone only ----------
     PORTED FROM goToGroup() IN towing.js — same header offset, same Lenis with
     a plain-scroll fallback. Restated rather than shared, per the house rule,
     and renamed because it lands on a panel rather than a group; a change to
     one is a deliberate change to both.

     ONLY BELOW 900px. Above that .ntr-ask is two columns and the answer sits
     beside the question, already on screen — scrolling there would move a panel
     the reader can see perfectly well. 900px is where new-to-rving.css collapses
     .ntr-ask to one column, and the two have to stay in step: widen the CSS
     without widening this and the page starts scrolling on a layout that never
     needed it. */
  const stacked = window.matchMedia('(max-width: 900px)');
  function showAnswer(panel) {
    if (!panel || !stacked.matches) return;
    const header = document.getElementById('site-header');
    const y = panel.getBoundingClientRect().top + window.pageYOffset -
      ((header ? header.offsetHeight : 0) + 16);
    const lenis = window.__jaycoLenis;
    if (lenis && lenis.scrollTo) lenis.scrollTo(y, { immediate: false });
    else window.scrollTo({ top: y, behavior: 'smooth' });
  }

  function picker(prefix, items, mode) {
    const wrap = document.getElementById(prefix);
    const opts = document.getElementById(prefix + '-opts');
    const out = document.getElementById(prefix + '-result');
    if (!wrap || !opts || !out || !JAYCO) return;

    /* The first option is chosen on arrival, so the answer panel opens with a
       real recommendation rather than an empty half of the band. */
    let picked = 0;

    function drawResult() {
      const it = items[picked];
      if (!it) { out.innerHTML = ''; return; }
      /* A class the lineup no longer carries is dropped rather than printed as
         a dead link — the recommendation is authored, so it can outlive the
         category it names. */
      const rows = it.cats
        .map((c) => (typeof c === 'string' ? { id: c, label: null } : c))
        .filter((c) => JAYCO.categories.some((x) => x.id === c.id))
        .map((c) => ({ id: c.id, label: c.label || catName(c.id), count: it.count(c.id) }))
        .filter((c) => c.count !== null);
      out.innerHTML = `
        <p class="ntr-ask-rhead">${esc(it.head)}</p>
        <ul class="ntr-ask-list" role="list">
          ${rows.map((r) => `
            <li class="ntr-ask-row">
              <a class="ntr-ask-cat" href="type.html?type=${esc(r.id)}">${esc(r.label)}</a>
              <span class="ntr-ask-count">${esc(r.count)}</span>
            </li>`).join('')}
        </ul>
        <p class="ntr-ask-why-r"><span class="ntr-ask-why-k">Why:</span> ${esc(it.why)}</p>`;
    }

    if (mode === 'slider') {
      /* A range with one stop per item. The value is an INDEX, not a weight, so
         the stops stay evenly spaced however uneven the ratings are — and
         aria-valuetext carries the rating, or a screen reader would announce
         "2 of 4" and say nothing useful. */
      opts.innerHTML = `
        <input class="ntr-slider" id="${esc(prefix)}-range" type="range"
               min="0" max="${items.length - 1}" step="1" value="${picked}"
               aria-label="Towing capacity" />
        <ul class="ntr-slider-ticks" role="list" aria-hidden="true">
          ${items.map((it) => `<li>${esc(it.tick || it.label)}</li>`).join('')}
        </ul>
        <p class="ntr-slider-read" id="${esc(prefix)}-read"></p>`;

      const range = document.getElementById(prefix + '-range');
      const read = document.getElementById(prefix + '-read');
      const sync = () => {
        const it = items[picked];
        range.setAttribute('aria-valuetext', it.label);
        read.innerHTML = `<span class="ntr-slider-val">${esc(it.label)}</span>
          <span class="ntr-slider-sub">${esc(it.sub)}</span>`;
        opts.style.setProperty('--ntr-slider-pos',
          (items.length > 1 ? (picked / (items.length - 1)) * 100 : 0) + '%');
      };
      range.addEventListener('input', () => {
        picked = Number(range.value);
        sync(); drawResult();
      });
      /* 'change', NOT 'input'. A range fires input on every step of a drag, and
         scrolling the page on each one would pull the slider out from under the
         finger still holding it. change fires once, when the finger lifts. */
      range.addEventListener('change', () => showAnswer(out));
      sync();
      drawResult();
      return;
    }

    opts.innerHTML = items.map((it, i) => `
      <button type="button" class="ntr-ask-opt${i === picked ? ' is-on' : ''}"
              role="radio" aria-checked="${i === picked}" data-i="${i}">
        <span class="ntr-ask-opt-label">${esc(it.label)}</span>
        <span class="ntr-ask-opt-sub">${esc(it.sub)}</span>
      </button>`).join('');

    opts.addEventListener('click', (e) => {
      const b = e.target.closest('.ntr-ask-opt');
      if (!b) return;
      picked = Number(b.dataset.i);
      $$('.ntr-ask-opt', opts).forEach((x) => {
        const on = x === b;
        x.classList.toggle('is-on', on);
        x.setAttribute('aria-checked', String(on));
      });
      drawResult();
      showAnswer(out);
    });

    drawResult();
  }

  /* ---------- How do you want to RV? ---------- */
  const HEAD_STYLE = 'Based on your travel style, start with these RV types:';
  picker('ntr-ask', [
    { label: 'Weekend Escapes',
      sub: 'Easy setup, smaller footprints and flexibility.',
      head: HEAD_STYLE,
      cats: ['class-b', 'travel-trailers', 'class-c'],
      count: (id) => (CAT_TOTAL[id] || 0) + ' floorplans',
      why: 'Easy to get on the road, manageable for shorter trips, and available in a wide range of sizes. Class B models are especially good for quick, flexible travel, while smaller travel trailers and Class C motorhomes give you more room without feeling oversized.' },
    { label: 'Family Adventures',
      sub: 'More sleeping space, storage and room to spread out.',
      head: HEAD_STYLE,
      cats: ['travel-trailers', 'fifth-wheels', 'class-c', 'class-a'],
      count: (id) => (CAT_TOTAL[id] || 0) + ' floorplans',
      why: 'These RVs tend to offer more sleeping capacity, storage and living space for families. Travel trailers provide lots of floorplan choices, while fifth wheels and larger motorhomes can add separate bedrooms, bunks and more room to spread out.' },
    { label: 'Long Road Trips',
      sub: 'Comfort, amenities and plenty of living space.',
      head: HEAD_STYLE,
      cats: ['fifth-wheels', 'class-a', 'class-c', 'super-c'],
      count: (id) => (CAT_TOTAL[id] || 0) + ' floorplans',
      why: 'For longer trips, comfort and storage become more important. These RV types can provide larger kitchens, bathrooms, bedrooms and living areas, along with the space needed to carry more gear for extended travel.' },
    { label: 'Off-the-Grid Trips',
      sub: 'Capability, storage and features designed for more remote travel.',
      head: HEAD_STYLE,
      cats: ['travel-trailers', 'toy-haulers', 'class-b', 'class-c'],
      count: (id) => (CAT_TOTAL[id] || 0) + ' floorplans',
      why: 'These options can work well for travelers looking for flexibility and access to more remote destinations. Travel trailers and Class B models can keep the footprint smaller, while toy haulers provide added room for bikes, ATVs and outdoor gear.' },
  ]);

  /* ---------- How much space do you need? ----------
     COUNTED AS "AT LEAST", not as a band. Sleeping capacity is a maximum, not a
     requirement: a couple can perfectly well travel in a Class C that sleeps
     four, and Jayco's own quiz treats the answer the same way. Counted as an
     exact band instead, two of these recommendations would have read "0
     floorplans" — no Jayco Class C sleeps fewer than four, and no Class A
     fewer than five — which would have made a sound recommendation look
     broken. */
  const HEAD_SLEEP = 'Based on how many you need to sleep, start with these RV types:';
  const sleepCount = (min) => (id) => {
    const n = sleepsAtLeast(id, min);
    return n + ' floorplan' + (n === 1 ? '' : 's') + ' sleep ' + min + ' or more';
  };
  picker('ntr-space', [
    { label: 'Sleeps 1–2',
      sub: 'Solo travellers and couples.',
      head: HEAD_SLEEP,
      cats: ['class-b', 'travel-trailers', 'class-c'],
      count: sleepCount(2),
      why: 'Great for solo travelers or couples who want something easier to drive, tow and maneuver without giving up the essentials.' },
    { label: 'Sleeps 3–4',
      sub: 'A couple with room to spare, or a small family.',
      head: HEAD_SLEEP,
      cats: ['travel-trailers', 'class-c', 'class-a'],
      count: sleepCount(3),
      why: 'A good fit for couples who want extra room or smaller families who need flexible sleeping space, more storage and a comfortable living area.' },
    { label: 'Sleeps 5–6',
      sub: 'A family, usually with bunks.',
      head: HEAD_SLEEP,
      cats: ['travel-trailers', 'fifth-wheels', 'class-c', 'class-a'],
      count: sleepCount(5),
      why: 'These RVs offer more family-friendly floorplans, including bunks, convertible sleeping areas and additional storage for longer trips.' },
    { label: 'Sleeps 7+',
      sub: 'Larger families and groups.',
      head: HEAD_SLEEP,
      cats: ['travel-trailers', 'fifth-wheels', 'class-a', 'super-c'],
      count: sleepCount(7),
      why: "Best for larger families or groups who need multiple sleeping areas, larger living spaces and more room for everyone's gear." },
  ]);

  /* ---------- Understand the main RV types ----------
     ALL EIGHT NOW, IN A SCROLL RAIL. This was three cards — travel trailer,
     Class C, Class B — on the reasoning that they are the three Jayco itself
     points a newcomer at, with the other five one link away. The client asked
     for the whole lineup, so the whole lineup is here.

     THE ORDER IS STILL THE EDITORIAL ONE. Those three lead the rail, in their
     original order, because a first card still carries more weight than an
     eighth and Jayco's own guidance has not changed: its blog calls the Jay
     Flight travel trailer the best RV for first-time users, calls the Class C
     a way into the motorized segment, and runs a Class B primer of its own.
     The remaining five follow, towables before motorized. Alphabetical or
     price order would have thrown that away for nothing.

     A RAIL RATHER THAN A TALLER GRID: eight portrait plates stacked three-up
     is three rows deep and pushes the next question off the screen entirely.
     Scrolling keeps the section one band tall whatever is in it. */
  const START = [
    { id: 'travel-trailers', img: 'type-tt',
      alt: 'A Jayco travel trailer with its awning out in a mountain meadow, a picnic table laid beneath it under heavy cloud',
      why: 'The usual first RV, and the one Jayco points first-timers at: family floorplans across a wide spread of lengths and weights, at the lowest price of entry in the lineup.' },
    { id: 'class-c', img: 'type-c',
      alt: 'A Jayco Class C motorhome parked among pines at golden hour, awning out and two people sitting in camp chairs in its shade',
      why: 'The usual way into a motorhome. You drive it rather than tow it, and it places and parks more easily than a Class A — the cab you sit in is one you already recognise.' },
    { id: 'class-b', img: 'type-b',
      alt: 'A Jayco Class B camper van beside a shallow creek in autumn woods, its awning out over two camp chairs at the water\'s edge',
      why: 'A van, and it drives like one — no separate tow vehicle, nothing that will not fit a normal parking space. The smallest step from a car that is still an RV.' },
    { id: 'fifth-wheels', img: 'type-fw',
      alt: 'A Jayco Pinnacle fifth wheel on a grass pitch under heavy cloud, awning out over a rug, table and chairs, a bike parked alongside',
      why: 'Hitches in the bed of a pickup rather than behind it, which puts a floor of living space over the truck and makes a long trailer easier to place. It does need a pickup, and a fairly capable one.' },
    { id: 'toy-haulers', img: 'type-th',
      alt: 'A Jayco Seismic toy hauler parked on desert sand with its awning out, prickly pear in the foreground',
      why: 'A garage at the back with a ramp door, so the bikes or the quad travel inside rather than on a rack. Once it is unloaded the garage is more living space.' },
    { id: 'destination', img: 'type-dt',
      alt: 'A long Jayco destination trailer on a gravel pad beside a lake at sunset, picnic table and fire ring in front of it under tall pines',
      why: 'Built to be towed to a spot and stayed in — residential fittings, tall windows, and a layout closer to a small holiday home than to something you move every weekend.' },
    { id: 'class-a', img: 'type-a',
      alt: 'A Jayco Alante Class A motorhome parked in a wooded clearing with its awning out over camp chairs and a table',
      why: 'The largest motorhome here, on its own chassis behind a flat front and a full-width windscreen. The most living space you can drive, and the most of it to place.' },
    { id: 'super-c', img: 'type-sc',
      alt: 'A Jayco Super C motorhome on a heavy-duty truck chassis parked among red rock formations in the desert, slide-out extended',
      why: 'A Class C body on a heavy commercial truck chassis. You choose it for what it will pull and carry — the answer when a big trailer or a second vehicle has to come too.' },
  ];

  function stats(catId) {
    let models = 0, plans = 0; const price = [];
    Object.keys(JAYCO.models).forEach((slug) => {
      const m = JAYCO.models[slug];
      if (!m || m.category !== catId) return;
      models++; price.push(m.basePrice);
      plans += ((BUILD[slug] || {}).floorplans || []).length;
    });
    return { models: models, plans: plans, from: price.length ? Math.min.apply(null, price) : null };
  }

  const types = $('#ntr-types');
  if (types && JAYCO) {
    types.innerHTML = START.map((s) => {
      const cat = JAYCO.categories.find((c) => c.id === s.id);
      if (!cat) return '';
      const n = stats(s.id);
      /* The type's own portrait plate carrying ONE thing — its name — and the
         rest of the card set below it on the page ground. The plate keeps the
         sitewide --scrim-card (bottom-weighted, top untouched), which now has
         only a single line to hold up rather than four stacked items.

         The text below is .bl-card in blog.css: media plate, then meta, then
         body, on no card chrome at all. Ported rather than shared, per the
         house rule — a change to one is a deliberate change to both. */
      return `<li class="ntr-type">
        <a class="ntr-type-link" href="type.html?type=${esc(s.id)}">
          <div class="ntr-type-plate">
            <img class="ntr-type-img"
                 src="../assets/new-to-rving/web/${esc(s.img)}-800.webp"
                 srcset="../assets/new-to-rving/web/${esc(s.img)}-500.webp 500w,
                         ../assets/new-to-rving/web/${esc(s.img)}-800.webp 800w"
                 sizes="(max-width: 768px) 78vw, (max-width: 1023px) 44vw, 28vw"
                 width="800" height="1066" alt="${esc(s.alt)}"
                 loading="lazy" decoding="async" />
            <span class="ntr-type-scrim" aria-hidden="true"></span>
            <h3 class="ntr-type-name">${esc(cat.name)}</h3>
          </div>
          <div class="ntr-type-body">
            <span class="ntr-type-meta">${n.models} model${n.models === 1 ? '' : 's'} ·
              ${n.plans} floorplan${n.plans === 1 ? '' : 's'}</span>
            <p class="ntr-type-why">${esc(s.why)}</p>
            <span class="ntr-type-from">${n.from ? 'From ' + usd(n.from) : ''}</span>
          </div>
        </a>
      </li>`;
    }).join('');
  }

  /* ---------- The type rail's arrows ----------
     The rail scrolls natively, so this drives scrollLeft rather than moving a
     track with a transform the way initModelCarousel() in app.js does. Native
     scrolling is what gives the rail its swipe on a phone and its scroll-into-
     view when a keyboard tabs onto a card three along; a transform would have
     taken both away and the arrows would then be the ONLY way through.

     ONE CARD PER PRESS, measured rather than assumed: the card width is a
     clamp() and the gap is a clamp(), so both are read back off the layout at
     the moment of the press and stay right through a resize or a zoom.

     The buttons are disabled at the ends, and the whole nav is hidden if the
     rail ever fits without scrolling — a control that cannot do anything should
     not be offered. */
  function initTypeRail() {
    const rail = document.getElementById('ntr-types');
    const nav = document.getElementById('ntr-rail-nav');
    const prev = document.getElementById('ntr-rail-prev');
    const next = document.getElementById('ntr-rail-next');
    if (!rail || !nav || !prev || !next) return;

    const still = window.matchMedia('(prefers-reduced-motion: reduce)');

    function step() {
      const card = rail.querySelector('.ntr-type');
      if (!card) return Math.round(rail.clientWidth * 0.8);
      const cs = getComputedStyle(rail);
      const gap = parseFloat(cs.columnGap || cs.gap) || 0;
      return Math.round(card.getBoundingClientRect().width + gap);
    }

    function sync() {
      const max = rail.scrollWidth - rail.clientWidth;
      nav.hidden = max <= 1;
      /* A rounding slack of 1px: scrollLeft is fractional on a zoomed or
         hi-dpi layout and an exact comparison never reaches the end. */
      prev.disabled = rail.scrollLeft <= 1;
      next.disabled = rail.scrollLeft >= max - 1;
    }

    function go(dir) {
      rail.scrollBy({ left: dir * step(), behavior: still.matches ? 'auto' : 'smooth' });
    }

    prev.addEventListener('click', () => go(-1));
    next.addEventListener('click', () => go(1));
    rail.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    sync();
  }
  initTypeRail();

  /* ---------- What can you tow? ----------
     A slider, one stop per rating. Matched on GROSS weight — the most a trailer
     may weigh loaded — never on dry weight. towing.js carries the full
     argument: at 7,500 lbs the dry figure would hand somebody twenty-two
     trailers that go over their limit the first time they fill the water tank.

     TWO OF THE SUPPLIED RECOMMENDATIONS CANNOT BE TOWED at the rating they were
     given, and the count() below returns null for them so they do not render:
     the lightest Jayco toy hauler is the Seismic 214 at 11,700 lbs, so no toy
     hauler fits under 7,500 or under 10,000. A tow rating is a hard ceiling —
     unlike sleeping capacity, there is no reading of the question that rescues
     it — and printing the row anyway would point somebody at something their
     vehicle cannot legally pull. Raise the rating or drop the class to bring
     them back. */
  function towUnder(catId, limit) {
    let n = 0;
    Object.keys(BUILD).forEach((slug) => {
      const m = JAYCO.models[slug];
      if (!m || m.category !== catId) return;
      const cat = JAYCO.categories.find((c) => c.id === catId);
      if (!cat || cat.type !== 'towable') return;
      n += plansOf(slug).filter((f) => {
        const g = num(((f.specs || {}).Weights || {})['Gross Vehicle Weight Rating (lbs)']);
        return g && g <= limit;
      }).length;
    });
    return n;
  }
  const towCount = (limit) => (id) => {
    const n = towUnder(id, limit);
    return n ? n + ' floorplan' + (n === 1 ? '' : 's') + ' under ' + limit.toLocaleString('en-US') + ' lbs' : null;
  };

  const HEAD_TOW = 'Based on what you can tow, start with these RV types:';
  picker('ntr-tow', [
    { label: 'Up to 5,000 lbs', tick: '5,000',
      sub: 'Many mid-size SUVs and crossovers.',
      head: HEAD_TOW,
      cats: [{ id: 'travel-trailers', label: 'Lightweight Travel Trailers' }],
      count: towCount(5000),
      why: 'A good starting point for smaller tow vehicles. Focus on compact, lightweight travel trailers that leave enough capacity for passengers, gear and supplies.' },
    { label: 'Up to 7,500 lbs', tick: '7,500',
      sub: 'A typical half-ton pickup.',
      head: HEAD_TOW,
      cats: [{ id: 'travel-trailers', label: 'Travel Trailers' },
             { id: 'toy-haulers', label: 'Lightweight Toy Haulers' }],
      count: towCount(7500),
      why: 'More towing capacity opens up larger travel trailers with additional sleeping space, storage and amenities, along with select lighter toy-hauler options.' },
    { label: 'Up to 10,000 lbs', tick: '10,000',
      sub: 'A well-equipped half-ton, or a three-quarter-ton.',
      head: HEAD_TOW,
      cats: [{ id: 'travel-trailers', label: 'Travel Trailers' },
             { id: 'toy-haulers', label: 'Toy Haulers' },
             { id: 'fifth-wheels', label: 'Select Fifth Wheels' }],
      count: towCount(10000),
      why: 'This range gives you access to much of the travel-trailer lineup and begins to open the door to larger floorplans and select fifth-wheel or toy-hauler configurations.' },
    { label: 'Up to 15,000 lbs', tick: '15,000',
      sub: 'Three-quarter-ton and up.',
      head: HEAD_TOW,
      cats: [{ id: 'travel-trailers', label: 'Travel Trailers' },
             { id: 'fifth-wheels', label: 'Fifth Wheels' },
             { id: 'toy-haulers', label: 'Toy Haulers' }],
      count: towCount(15000),
      why: 'Higher-capacity tow vehicles give you the widest range of towable options, including larger fifth wheels and toy haulers with more living space, storage and residential-style amenities.' },
  ], 'slider');

  /* ---------- What should you expect to spend? ----------
     A slider, one stop per band, on REAL MSRP: build-data stores each plan's
     `price` as a delta from its model's basePrice in models-data.js, so a
     plan's starting figure is the sum of the two. Counted only across the
     plans Jayco has actually priced — it badges 20 of the 181 as new with no
     figure yet, and those are left out rather than guessed at.

     TWO EDITS TO THE SUPPLIED LISTS, both about how they render rather than
     about what they claim:
       • The first band listed "Travel Trailers" and "Lightweight Travel
         Trailers" separately. Both are the travel-trailers category, so as two
         rows they would have been the same link with the same count printed
         twice. Merged into one.
       • The last band listed "Class A, Class B, Class C and Super C
         Motorhomes" as a single entry. Split into its four classes, because
         each then carries its own count — 12, 6, 9 and 8 — where one merged
         row could only have carried a total that matched no link. */
  const priceIn = (catId, lo, hi) => {
    let n = 0;
    Object.keys(BUILD).forEach((slug) => {
      const m = JAYCO.models[slug];
      if (!m || m.category !== catId) return;
      n += plansOf(slug).filter((f) => {
        if (f.price == null) return false;
        const price = m.basePrice + f.price;
        return price >= lo && price < hi;
      }).length;
    });
    return n;
  };
  const priceCount = (lo, hi) => (id) => {
    const n = priceIn(id, lo, hi);
    return n ? n + ' floorplan' + (n === 1 ? '' : 's') + ' in this range' : null;
  };

  const HEAD_SPEND = 'Based on your budget, start with these RV types:';
  picker('ntr-spend', [
    { label: 'Under $40K', tick: '$40K',
      sub: 'Where most first RVs sit.',
      head: HEAD_SPEND,
      cats: [{ id: 'travel-trailers', label: 'Travel Trailers' }],
      count: priceCount(0, 40000),
      why: 'A strong entry point for first-time buyers, with plenty of compact and family-friendly towable options that keep the initial investment lower.' },
    { label: '$40K–$80K', tick: '$80K',
      sub: 'Larger trailers, and the first fifth wheels.',
      head: HEAD_SPEND,
      cats: [{ id: 'travel-trailers', label: 'Travel Trailers' },
             { id: 'toy-haulers', label: 'Toy Haulers' },
             { id: 'fifth-wheels', label: 'Select Fifth Wheels' }],
      count: priceCount(40000, 80000),
      why: 'This range opens up larger floorplans, more amenities and additional storage, along with select fifth-wheel and toy-hauler options.' },
    { label: '$80K–$150K', tick: '$150K',
      sub: 'Premium towables, and the way into motorized.',
      head: HEAD_SPEND,
      cats: [{ id: 'fifth-wheels', label: 'Fifth Wheels' },
             { id: 'toy-haulers', label: 'Toy Haulers' },
             { id: 'class-b', label: 'Class B Motorhomes' },
             { id: 'class-c', label: 'Select Class C Motorhomes' }],
      count: priceCount(80000, 150000),
      why: 'A higher budget brings in more premium towables and begins to open up motorized RVs, with more residential-style features, technology and comfort.' },
    { label: '$150K and up', tick: '$150K+',
      sub: 'The broadest selection, and the largest coaches.',
      head: HEAD_SPEND,
      cats: [{ id: 'class-a', label: 'Class A Motorhomes' },
             { id: 'class-b', label: 'Class B Motorhomes' },
             { id: 'class-c', label: 'Class C Motorhomes' },
             { id: 'super-c', label: 'Super C Motorhomes' },
             { id: 'fifth-wheels', label: 'Premium Fifth Wheels' }],
      count: priceCount(150000, Infinity),
      why: 'This range gives you access to the broadest selection of larger, more feature-rich RVs, including premium motorhomes and luxury towables.' },
  ], 'slider');

  /* ---------- Helpful articles ----------
     Real posts, by slug. A slug that stops resolving drops that card rather
     than rendering an empty one, and the section removes itself if none
     survive. */
  const READING = [
    'a-shopping-guide-for-new-rvers',
    'rving-for-beginners',
    '46-thought-starters-and-tips-for-new-rv-shoppers',
  ];
  const posts = $('#ntr-posts');
  if (posts && UI) {
    const found = READING.map(UI.bySlug).filter(Boolean);
    if (found.length) { posts.innerHTML = UI.cards(found); UI.wireCards(posts); }
    else { const band = posts.closest('.ntr-reading'); if (band) band.hidden = true; }
  }

  /* ---------- Parallax ----------
     The hero plate and the three CTA photographs, each scrubbed across its own
     pass at the small magnitude DESIGN.md asks for. The travel is read from the
     CSS so the JS cannot drift past the media overhangs — one number, --ntr-drift,
     sets both the negative inset and the distance moved, and they cannot fall
     out of step. Under prefers-reduced-motion the stylesheet sets it to 0 and
     this returns before binding anything. */
  document.addEventListener('jayco:animations-ready', () => {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    const page = $('.ntr-page');
    const px = page ? parseFloat(getComputedStyle(page).getPropertyValue('--ntr-drift')) || 0 : 0;
    if (!px) return;

    const drift = (el, trigger, start, end) => {
      if (!el || !trigger) return;
      gsap.fromTo(el, { yPercent: -px / 2 }, {
        yPercent: px / 2, ease: 'none',
        scrollTrigger: { trigger: trigger, start: start, end: end, scrub: true },
      });
    };

    /* The hero starts ON SCREEN, so its pass runs from the top of the document
       to the point the band leaves — 'top bottom' would be a start it is
       already past, and the plate would jump to mid-travel on the first
       scroll. */
    drift($('.ntr-hero-media'), $('.ntr-hero'), 'top top', 'bottom top');

    /* The CTA bands all enter from below, so each one runs the full crossing:
       from the moment its top clears the fold to the moment its bottom leaves
       the top. */
    document.querySelectorAll('.ntr-cta-band').forEach((band) => {
      drift(band.querySelector('.ntr-cta-media'), band, 'top bottom', 'bottom top');
    });

    /* ---------- The film band ----------
       Scroll IS the transport control. The video has no autoplay, no loop and
       no controls; the only thing that ever moves it is this, mapping the
       band's crossing of the viewport onto currentTime. Stop scrolling and the
       truck stops with you.

       Bound only after loadedmetadata, because duration is NaN before it and
       the whole mapping depends on it. The seek is wrapped: a browser will
       throw on currentTime if the range is not seekable yet, and a throw here
       would take the ScrollTrigger tick down with it.

       The play/pause is not a mistake. iOS will not paint a seeked frame from a
       video it has never decoded, so this primes it once and immediately stops
       it; muted + playsinline is what lets that happen without a gesture, and
       the catch covers the browsers that refuse anyway. */
    const film = $('.ntr-film'), vid = $('.ntr-film-video');
    if (film && vid) {
      const bind = () => {
        const dur = vid.duration;
        if (!dur || !isFinite(dur)) return;
        try {
          const pr = vid.play();
          if (pr && pr.then) pr.then(() => vid.pause()).catch(() => {});
        } catch (e) { /* refused: the poster stands in until the first seek */ }
        const at = { t: 0 };
        gsap.to(at, {
          t: dur, ease: 'none',
          scrollTrigger: { trigger: film, start: 'top bottom', end: 'bottom top', scrub: true },
          onUpdate: () => {
            if (vid.readyState < 1) return;
            try { vid.currentTime = at.t; } catch (e) {}
          },
        });
      };
      if (vid.readyState >= 1) bind();
      else vid.addEventListener('loadedmetadata', bind, { once: true });
    }
  }, { once: true });
}());
