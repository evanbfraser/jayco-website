/* ===================================================
   Jayco — Value Tool
   ---------------------------------------------------
   Pick towable or motorhome, rate each feature from
   "skimp on it" to "spring for it", reveal the result.

   THIS FILE OWNS NO CONTENT. The features it asks
   about are the Jayco Difference's own list, read out
   of jayco-difference-data.js; the classes it points
   at afterwards are counted out of models-data.js and
   build-data.js at render time. A second copy of
   either would drift the moment one was edited.

   NO PRICES ON A FEATURE, ANYWHERE. What a roof system
   would cost as an option on another brand is not a
   figure this site holds, so the result never puts one
   on it. The only money on the page is a category's
   real "starting at" MSRP, which models-data.js does
   hold.
   =================================================== */
(function () {
  const DIFF = window.JAYCO_DIFFERENCE;
  const JAY = window.JAYCO;
  /* JAYCO_BUILD IS THE MODEL MAP ITSELF, not a wrapper with a .models on it —
     the same read new-to-rving.js makes. Going through .models returns undefined
     and every floorplan count silently comes out zero. */
  const BUILD = window.JAYCO_BUILD || {};
  const root = document.getElementById('value-tool');
  if (!root || !DIFF) return;

  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.prototype.slice.call((c || document).querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const usd = (n) => '$' + Math.round(n).toLocaleString('en-US');

  /* Five stops rather than a free scale: the question is how much something
     matters, and people do not hold a hundred-point opinion about a roof. The
     middle is the default so an untouched slider reads as "no strong view"
     rather than as a nil score the reader never gave. */
  const STOPS = ['Skimp on it', 'Not fussed', 'No strong view', 'Worth having', 'Spring for it'];
  const MID = 2;

  /* One flat list per group. The Difference page groups its features into rows
     for its photographs; that grouping is about pictures, not priorities, so it
     is flattened here. Names are unique inside a group, which is what makes the
     name usable as the key. */
  const featuresOf = (g) => g.rows.reduce((all, r) => all.concat(r.features), []);

  /* ---------- The photographs ----------
     One per feature, taken from jayco.com/value-tool/, which pairs every
     feature with a picture. Keyed on the feature NAME because that is what the
     Difference data carries — it has no image field of its own, and adding one
     there would put this page's assets in another page's data file.

     THREE OF THESE ARE A JUDGEMENT RATHER THAN A MATCH. Jayco's tool asks about
     a slightly different set than the Difference page lists, so JaySMART
     lighting, JAYCOMMAND and NuvoH2O have no photograph of their own on the
     source page; they take the closest honest picture instead, and the alt text
     describes what is actually shown rather than what the feature is. */
  const IMG = {
    'Magnum Truss™ Roof System':
      ['roof', 'A man standing on the roof of a Jayco fifth wheel, sweeping it clear'],
    'Stronghold VBL™ Laminated Walls':
      ['walls', 'Two people holding up a cutaway section of a Jayco laminated wall'],
    'Custom Frames':
      ['frames', 'A bare steel Jayco trailer frame on the factory floor'],
    'The Jayco 2+3 Warranty':
      ['warranty', 'A family at camp beside a Jayco travel trailer, with a 2+3 year warranty badge'],
    /* The two lists name the same subject differently — 'Overlander Solar
       Packages' on the towable side, plain 'Solar Power' on the motorized one.
       Both keys, one photograph. */
    'Overlander Solar Packages':
      ['solar', 'An aerial view of a Jayco coach with roof solar panels, camped on grass'],
    'Solar Power':
      ['solar', 'An aerial view of a Jayco coach with roof solar panels, camped on grass'],
    'JAYCOMMAND® Smart RV System':
      ['jaycommand', 'A couple and their dog in the lounge of a Jayco motorhome'],
    'JaySMART™ Lighting':
      ['jaysmart', 'A Jayco travel trailer parked in a meadow of red wildflowers'],
    'NuvoH2O™ Water Filtration':
      ['water', 'Two people preparing food in the galley of a Jayco motorhome'],
    'Custom Interior Design':
      ['interior', 'The galley of a Jayco travel trailer, white cabinetry and a wood floor'],
    'The JRide® Ride and Handling Package':
      ['jride', 'A Jayco motorhome parked in the desert, two people walking back towards it'],
    'One-Piece Seamless Front Caps':
      ['frontcap', 'A Jayco Greyhawk Class C parked on grass with its awning out'],
    '120" Windshield':
      ['windshield', 'The view forward through the windshield of a Jayco motorhome onto desert scrub'],
    'Safety Belts on All Seats':
      ['belts', 'A Jayco dinette with a seat belt fitted and flowers on the table'],
    'Brake Lighting and Back-Up Camera':
      ['brake', 'A Jayco Class C at dusk with its rear lights lit'],
    'Bunk Ratings':
      ['bunks', 'A bunk in a Jayco coach with its ladder in place'],
    'Catalytic Converter Theft Deterrent':
      ['catalytic', 'A Jayco Class C motorhome carrying CatStrap theft-deterrent branding'],
    'Towing Capability':
      ['towing', 'A Jayco Super C towing a trailer along a gravel road'],
  };

  const plate = (name) => {
    const m = IMG[name];
    if (!m) return '';
    return `<div class="vt-item-media">
          <img class="vt-item-img" src="../assets/value-tool/web/${esc(m[0])}-800.webp"
               srcset="../assets/value-tool/web/${esc(m[0])}-500.webp 500w,
                       ../assets/value-tool/web/${esc(m[0])}-800.webp 800w"
               sizes="(max-width: 1023px) 92vw, 44vw"
               width="800" height="600" loading="lazy" decoding="async"
               alt="${esc(m[1])}" />
        </div>`;
  };

  let group = null;                 // the chosen DIFF group
  let score = {};                   // feature name -> 0..4

  /* ---------- Step one ---------- */
  const types = $('#vt-types');
  types.innerHTML = DIFF.groups.map((g, i) => `
    <button type="button" class="vt-type" role="radio" aria-checked="false"
            data-group="${esc(g.id)}" id="vt-type-${esc(g.id)}">
      <span class="vt-type-name">${esc(g.label)}</span>
      <span class="vt-type-sub">${esc(featuresOf(g).length)} features to weigh</span>
    </button>`).join('');

  types.addEventListener('click', (e) => {
    const b = e.target.closest('.vt-type');
    if (b) choose(b.dataset.group);
  });

  function choose(id) {
    group = DIFF.groups.find((g) => g.id === id) || null;
    $$('.vt-type', types).forEach((b) => {
      const on = b.dataset.group === id;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-checked', String(on));
    });
    score = {};
    featuresOf(group).forEach((f) => { score[f.name] = MID; });
    drawRate();
    $('#vt-result').hidden = true;
    $('#vt-step2').hidden = false;
    $('#vt-step2').scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  /* ---------- Step two ---------- */
  function drawRate() {
    if (!group) return;
    $('#vt-rate-lead').textContent =
      'Move each one towards the end that sounds like you. Leave it in the middle if you have no '
      + 'strong view — the result only reports what you actually said.';
    $('#vt-rate').innerHTML = featuresOf(group).map((f, i) => `
      <li class="vt-item">
        ${plate(f.name)}
        <div class="vt-item-head">
          <h3 class="vt-item-name" id="vt-f-${i}">${esc(f.name)}</h3>
          <span class="vt-item-read" id="vt-r-${i}">${esc(STOPS[MID])}</span>
        </div>
        <p class="vt-item-body">${esc(f.body)}</p>
        <input class="vt-slider" type="range" min="0" max="4" step="1" value="${MID}"
               data-i="${i}" data-name="${esc(f.name)}"
               aria-labelledby="vt-f-${i}" aria-valuetext="${esc(STOPS[MID])}" />
        <div class="vt-ends-label" aria-hidden="true">
          <span>Skimp on it</span><span>Spring for it</span>
        </div>
      </li>`).join('');
    $$('.vt-slider', $('#vt-rate')).forEach(fill);
  }

  /* The filled part of the track is a CSS custom property rather than a second
     element, so the paint stays on the range itself. Written here because CSS
     cannot read an input's value. */
  const fill = (r) => {
    r.style.setProperty('--vt-slider-pos',
      (Number(r.value) / Number(r.max)) * 100 + '%');
  };

  $('#vt-rate').addEventListener('input', (e) => {
    const r = e.target.closest('.vt-slider');
    if (!r) return;
    const v = Number(r.value);
    score[r.dataset.name] = v;
    r.setAttribute('aria-valuetext', STOPS[v]);
    $('#vt-r-' + r.dataset.i).textContent = STOPS[v];
    fill(r);
  });

  /* ---------- The result ----------
     Ranked by what was said, and honest about a reader who said nothing: if
     every slider is still in the middle, there is no priority to report and the
     result says that rather than inventing a top three out of source order. */
  function classes() {
    if (!JAY) return [];
    return JAY.categories.filter((c) => c.type === group.id).map((c) => {
      let models = 0, plans = 0, price = [];
      Object.keys(JAY.models).forEach((slug) => {
        const m = JAY.models[slug];
        if (!m || m.category !== c.id) return;
        models++; price.push(m.basePrice);
        plans += ((BUILD[slug] || {}).floorplans || []).length;
      });
      return { id: c.id, name: c.name, models: models, plans: plans,
               from: price.length ? Math.min.apply(null, price) : null };
    }).filter((c) => c.models > 0);
  }

  $('#vt-reveal').addEventListener('click', () => {
    if (!group) return;
    const feats = featuresOf(group);
    const rated = feats.map((f) => ({ f: f, v: score[f.name] }));
    const high = rated.filter((r) => r.v > MID).sort((a, b) => b.v - a.v);
    const low = rated.filter((r) => r.v < MID).sort((a, b) => a.v - b.v);
    const out = $('#vt-result');

    const cats = classes();
    const where = `
      <div class="vt-where">
        <h3 class="vt-res-sub">Where to start looking</h3>
        <p class="vt-res-note">Every ${esc(group.id === 'towable' ? 'towable' : 'motorhome')} class
          in the 2027 lineup, counted from the catalogue rather than typed.</p>
        <ul class="vt-class-list" role="list">
          ${cats.map((c) => `
            <li class="vt-class">
              <a class="vt-class-name" href="type.html?type=${esc(c.id)}">${esc(c.name)}</a>
              <span class="vt-class-n">${c.models} model${c.models === 1 ? '' : 's'} ·
                ${c.plans} floorplan${c.plans === 1 ? '' : 's'}${c.from ? ' · from ' + esc(usd(c.from)) : ''}</span>
            </li>`).join('')}
        </ul>
      </div>`;

    if (!high.length && !low.length) {
      out.innerHTML = `
        <div class="vt-res-head">
          <span class="section-label">Your result</span>
          <h2 class="vt-res-h">You have not told it anything yet.</h2>
          <p class="vt-res-lead">Every slider is still in the middle, so there is nothing to rank.
            Move a few towards either end and reveal it again — or read
            <a href="jayco-difference.html">the Jayco Difference</a>, which is the same list with
            the reasoning attached.</p>
        </div>${where}`;
    } else {
      out.innerHTML = `
        <div class="vt-res-head">
          <span class="section-label">Your result</span>
          <h2 class="vt-res-h">${high.length
            ? 'What you said matters most.'
            : 'What you said you could live without.'}</h2>
          <p class="vt-res-lead">${high.length
            ? 'These are the ones you moved towards <em>spring for it</em>, in the order you '
              + 'rated them — with what Jayco does about each, in Jayco\'s own words.'
            : 'You did not mark anything as worth paying extra for, so here is the other end of '
              + 'it: the features you were happiest to skimp on.'}</p>
        </div>
        <ul class="vt-res-list" role="list">
          ${(high.length ? high : low).map((r) => `
            <li class="vt-res-item">
              <span class="vt-res-rank">${esc(STOPS[r.v])}</span>
              <h3 class="vt-res-name">${esc(r.f.name)}</h3>
              <p class="vt-res-body">${esc(r.f.body)}</p>
            </li>`).join('')}
        </ul>
        ${high.length && low.length ? `
          <p class="vt-res-note vt-res-skip">You were happy to skimp on
            ${low.map((r) => '<strong>' + esc(r.f.name) + '</strong>').join(', ')} — worth knowing
            when a dealer offers it as an upgrade.</p>` : ''}
        ${where}`;
    }
    out.hidden = false;
    out.scrollIntoView({ block: 'start', behavior: 'smooth' });
  });

  $('#vt-reset').addEventListener('click', () => {
    if (!group) return;
    featuresOf(group).forEach((f) => { score[f.name] = MID; });
    drawRate();
    $('#vt-result').hidden = true;
  });

  /* Nothing is chosen on arrival: step one is a real question, and preselecting
     "towable" would answer it for two thirds of the lineup's buyers. */
  $('#vt-step2').hidden = true;

  /* ---------- Parallax ----------
     The hero plate only. Same construction as every other page here: the travel
     is read from the CSS so the JS cannot drift past the media overhang, and
     the reduced-motion block sets it to 0 so this returns before binding. */
  document.addEventListener('jayco:animations-ready', () => {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    const page = $('.vt-page');
    const px = page ? parseFloat(getComputedStyle(page).getPropertyValue('--vt-drift')) || 0 : 0;
    const hero = $('.vt-hero'), media = $('.vt-hero-media');
    if (!px || !hero || !media) return;
    gsap.fromTo(media, { yPercent: -px / 2 }, {
      yPercent: px / 2, ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
    });
  }, { once: true });
}());
