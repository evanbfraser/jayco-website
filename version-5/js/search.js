/* ===================================================
   Jayco — Site search
   ---------------------------------------------------
   The full-screen search panel, on every page. app.js
   loads this file (and css/search.css) the first time a
   reader reaches for search — the header's button, the
   one beside the hamburger, "/" or Ctrl/Cmd+K — and this
   file loads js/search-index.js, the rows written by
   tools/build-search-index.js, the first time it opens.

   MODELLED ON THOR MOTOR COACH'S SEARCH (reviewed
   2026-09-13): one panel, results live as you type,
   filters with counts, one result style, Load more, and
   popular searches before anything is typed. Three things
   it deliberately does not copy:
     • counts that fall to zero for every other group once
       a filter is picked — here they always count the query;
     • a description line that repeats the name;
     • filter boxes stacked above the results on a phone,
       which pushed the first result off the screen — here
       they are one row that scrolls sideways.
   =================================================== */
(function () {
  'use strict';
  if (window.JAYCO_SEARCH_UI) return;

  const VERSION = window.JAYCO_SEARCH_VERSION || 'dev';
  const PAGE = 12;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.prototype.slice.call((c || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- What there is to find ----------
     GROUPS are the filters, in order. TYPES are the kinds of row in the index:
     the label shown on a result, whether its image is shown whole (renders,
     drawings, covers) or cropped (photographs), and a small weight that breaks
     ties between equally good matches in favour of the thing a reader most
     likely wants — a model before an article that mentions it. */
  const GROUPS = [
    { id: 'all', label: 'All results' },
    { id: 'models', label: 'Models', types: ['class', 'model'] },
    { id: 'floorplans', label: 'Floorplans', types: ['floorplan'] },
    { id: 'blog', label: 'Blog', types: ['blog'] },
    { id: 'videos', label: 'Videos', types: ['video'] },
    { id: 'owners', label: 'Owner resources', types: ['manual', 'brochure'] },
    { id: 'pages', label: 'Pages', types: ['page'] },
    { id: 'dealers', label: 'Dealers', types: ['dealer'] },
  ];
  const GROUP_OF = {};
  GROUPS.forEach((g) => (g.types || []).forEach((t) => { GROUP_OF[t] = g.id; }));

  /* `age` is how much a row loses per year behind the newest year in the index —
     so a current brochure, manual, video or article leads the same one from
     2017. Models, floorplans, pages and dealers do not age. */
  const TYPES = {
    class:     { label: 'RV type',        fit: 'cover',   weight: 18 },
    model:     { label: 'Model',          fit: 'contain', weight: 16 },
    page:      { label: 'Page',                           weight: 8 },
    floorplan: { label: 'Floorplan',      fit: 'contain', weight: 4 },
    video:     { label: 'Video',          fit: 'cover',   weight: 3, age: 2 },
    manual:    { label: "Owner's manual", fit: 'contain', weight: 3, age: 2.5 },
    blog:      { label: 'Article',        fit: 'cover',   weight: 2, age: 1 },
    dealer:    { label: 'Dealer',                         weight: 2 },
    brochure:  { label: 'Brochure',       fit: 'contain', weight: 1, age: 2.5 },
  };

  /* A static site has no search log to learn from, so these are the client's
     list (2026-09-13): the classes people shop by, the best-known lines, the
     kinds of coach families ask for, and the two owner errands. Each one returns
     results — "Lightweight RVs", "Family-Friendly Floorplans" and "Jay Flight
     SLX" only do because tools/build-search-index.js tags the rows they mean. */
  const POPULAR = ['Travel Trailers', 'Fifth Wheels', 'Motorhomes', 'Jay Flight SLX', 'Jay Feather',
    'Lightweight RVs', 'Family-Friendly Floorplans', 'Bunkhouse RVs', 'Find a Dealer', 'Owner’s Manuals'];
  const QUICK = [
    ['Build & Price', 'build-price.html'],
    ['Find a Dealer', 'dealers.html'],
    ['All Floorplans', 'floorplans.html'],
    ['RV Finder Quiz', 'quiz.html'],
    ["Owner's Manuals", 'manuals.html'],
  ];

  const icon = (d, size) => '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" ' +
    'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
  const I_SEARCH = icon('<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>', 22);
  const I_CLOSE = icon('<path d="M18 6 6 18M6 6l12 12"/>', 22);
  const I_CLEAR = icon('<path d="M18 6 6 18M6 6l12 12"/>', 18);
  const I_ARROW = icon('<path d="M5 12h14M13 6l6 6-6 6"/>', 18);
  const I_OUT = icon('<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>', 18);
  const I_PAGE = icon('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>', 26);
  const I_PIN = icon('<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>', 26);

  /* ---------- Matching ----------
     Plain word matching, not fuzzy: every word typed has to be found, as a whole
     word or the start of one, in a row's title, its hidden keywords or its meta
     line — in that order of value. A title hit beats a keyword hit beats a meta
     hit; a query that IS the title, or starts it, earns more again.

     Normalising is the same on both sides (tools/build-search-index.js does it
     to the keywords): lower case, accents and apostrophes gone, punctuation to
     spaces, and a light plural trim, so "haulers" finds "Toy Hauler" and
     "owner's manuals" finds "Owner's Manual". A single letter only counts as a
     whole word, so "class c" narrows to Class C rather than to every word that
     starts with c. */
  const STOP = new Set(['a', 'an', 'and', 'the', 'of', 'for', 'to', 'in', 'on', 'at', 'by', 'with',
    'my', 'me', 'near', 'jayco', 'rv', 'rvs']);
  const norm = (s) => String(s == null ? '' : s)
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9+]+/g, ' ')
    .trim();
  const stem = (w) => {
    if (w.length > 4 && w.endsWith('ies')) return w.slice(0, -3) + 'y';
    if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1);
    return w;
  };
  /* The few ways people write the same thing. Stop words are dropped only when
     something else is left, so a search for "RV" alone still searches. */
  function queryWords(q) {
    const s = (' ' + norm(q) + ' ')
      .replace(/ 5th /g, ' fifth ')
      .replace(/ floor plans? /g, ' floorplan ')
      .replace(/ camper vans? /g, ' class b ')
      .replace(/ fw /g, ' fifth wheel ')
      .replace(/ tt /g, ' travel trailer ');
    const all = s.trim().split(' ').filter(Boolean);
    /* A single letter straight after "class" is part of the class — "class a"
       must not lose its "a" to the stop words. */
    const kept = all.filter((w, i) => !STOP.has(w) || (w.length === 1 && all[i - 1] === 'class'));
    return kept.length ? kept : all;
  }

  let ITEMS = null;
  let NEWEST = 0;
  const words = (s) => norm(s).split(' ').filter(Boolean).map(stem);
  /* Row: [type, title, meta, url, image, keywords, external, tags, year] — see
     tools/build-search-index.js. `tags` match as strongly as the title. */
  function prepare(rows) {
    const items = rows.map((r, i) => {
      const tn = norm(r[1]);
      return {
        i: i, type: r[0], title: r[1], meta: r[2], url: r[3], img: r[4], ext: !!r[6],
        year: Number(r[8]) || 0,
        tn: tn,
        t: tn.split(' ').filter(Boolean).map(stem),
        g: words(r[7]),
        k: words(r[5]),
        m: words(r[2]),
      };
    }).filter((it) => TYPES[it.type]);
    NEWEST = items.reduce((y, it) => Math.max(y, it.year), 0);
    return items;
  }
  function hit(words, tok, exact, prefix) {
    let best = 0;
    for (let j = 0; j < words.length; j++) {
      if (words[j] === tok) return exact;
      if (!best && prefix && words[j].startsWith(tok)) best = prefix;
    }
    return best;
  }
  function score(it, toks, phrase) {
    let s = 0;
    for (let j = 0; j < toks.length; j++) {
      const tok = toks[j];
      const pre = tok.length > 1;
      const a = hit(it.t, tok, 12, pre ? 8 : 0) || hit(it.g, tok, 12, pre ? 8 : 0);
      if (a) { s += a; continue; }
      const b = hit(it.k, tok, 5, pre ? 3.5 : 0);
      if (b) { s += b; continue; }
      const c = hit(it.m, tok, 3, pre ? 2 : 0);
      if (c) { s += c; continue; }
      return 0;
    }
    if (it.tn === phrase) s += 25;
    else if (phrase.indexOf(' ') > 0 && it.tn.startsWith(phrase)) s += 12;
    else if (phrase.indexOf(' ') > 0 && it.tn.indexOf(phrase) >= 0) s += 8;
    const T = TYPES[it.type];
    const aged = T.age && it.year && NEWEST ? Math.max(0, NEWEST - it.year) * T.age : 0;
    /* Never to zero: zero means "no match", and an old match is still a match. */
    return Math.max(0.1, s + T.weight - aged);
  }
  function find(q) {
    const words = queryWords(q);
    if (!words.length) return [];
    const toks = words.map(stem);
    const phrase = words.join(' ');
    const out = [];
    ITEMS.forEach((it) => { const s = score(it, toks, phrase); if (s) out.push([s, it]); });
    out.sort((x, y) => (y[0] - x[0]) || (x[1].i - y[1].i));
    return out.map((x) => x[1]);
  }

  /* The typed words, marked where they START a word in the title. Found on the
     raw title and escaped in pieces, so a match never lands inside an entity. */
  function markTitle(title, words) {
    const low = title.toLowerCase();
    const ranges = [];
    words.forEach((w) => {
      if (!w) return;
      let from = 0;
      let at;
      while ((at = low.indexOf(w, from)) !== -1) {
        const before = at === 0 ? ' ' : low[at - 1];
        const after = low[at + w.length] || ' ';
        if (!/[a-z0-9]/.test(before) && (w.length > 1 || !/[a-z0-9]/.test(after))) ranges.push([at, at + w.length]);
        from = at + 1;
      }
    });
    if (!ranges.length) return esc(title);
    ranges.sort((a, b) => a[0] - b[0]);
    const merged = [];
    ranges.forEach((r) => {
      const last = merged[merged.length - 1];
      if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
      else merged.push([r[0], r[1]]);
    });
    let html = '';
    let pos = 0;
    merged.forEach((r) => {
      html += esc(title.slice(pos, r[0])) + '<mark>' + esc(title.slice(r[0], r[1])) + '</mark>';
      pos = r[1];
    });
    return html + esc(title.slice(pos));
  }

  /* ---------- The index ---------- */
  let indexing = null;
  let indexFailed = false;
  function loadIndex() {
    if (ITEMS) return Promise.resolve();
    if (indexing) return indexing;
    indexFailed = false;
    indexing = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'js/search-index.js?v=' + encodeURIComponent(VERSION);
      s.onload = () => {
        const data = window.JAYCO_SEARCH_INDEX;
        if (data && Array.isArray(data.items)) { ITEMS = prepare(data.items); resolve(); return; }
        indexFailed = true; indexing = null; reject(new Error('search index is empty'));
      };
      s.onerror = () => { indexFailed = true; indexing = null; reject(new Error('search index failed to load')); };
      document.body.appendChild(s);
    });
    return indexing;
  }

  /* ---------- The panel ---------- */
  const chip = (q) => '<button type="button" class="gs-chip" data-q="' + esc(q) + '">' + esc(q) + '</button>';
  const el = document.createElement('div');
  el.className = 'gs';
  el.id = 'gs';
  el.hidden = true;
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  el.setAttribute('aria-labelledby', 'gs-title');
  el.innerHTML = `
    <div class="gs-head">
      <div class="gs-frame gs-head-in">
        <h2 class="gs-title" id="gs-title">Search</h2>
        <button type="button" class="gs-close" aria-label="Close search">${I_CLOSE}</button>
      </div>
    </div>
    <div class="gs-body">
      <div class="gs-frame">
        <form class="gs-form" role="search" action="#" novalidate>
          <label class="gs-sr" for="gs-input">Search models, floorplans, articles, videos, manuals, pages and dealers</label>
          <span class="gs-form-icon">${I_SEARCH}</span>
          <input class="gs-input" id="gs-input" type="search" autocomplete="off" autocapitalize="off"
                 spellcheck="false" enterkeyhint="search" placeholder="What are you looking for?" />
          <button type="button" class="gs-clear" aria-label="Clear search" hidden>${I_CLEAR}</button>
        </form>
        <div class="gs-layout is-idle">
          <div class="gs-side">
            <p class="gs-side-h" id="gs-filters-h">Filter results</p>
            <div class="gs-filters" role="group" aria-labelledby="gs-filters-h">
              ${GROUPS.map((g) => `<button type="button" class="gs-filter" data-group="${g.id}" aria-pressed="${g.id === 'all'}"><span class="gs-filter-name">${esc(g.label)}</span><span class="gs-filter-n"></span></button>`).join('')}
            </div>
          </div>
          <div class="gs-main">
            <p class="gs-status" role="status" aria-live="polite"></p>
            <div class="gs-idle">
              <section class="gs-idle-sec" aria-labelledby="gs-pop-h">
                <h3 class="gs-sec-h" id="gs-pop-h">Popular searches</h3>
                <div class="gs-chips">${POPULAR.map(chip).join('')}</div>
              </section>
              <section class="gs-idle-sec" aria-labelledby="gs-quick-h">
                <h3 class="gs-sec-h" id="gs-quick-h">Quick links</h3>
                <ul class="gs-quick" role="list">${QUICK.map((q) => `<li><a class="gs-quick-link" href="${esc(q[1])}">${esc(q[0])}${I_ARROW}</a></li>`).join('')}</ul>
              </section>
            </div>
            <ol class="gs-list" role="list" hidden></ol>
            <div class="gs-more-wrap" hidden><button type="button" class="btn-secondary-light gs-more">Load more</button></div>
            <div class="gs-empty" hidden></div>
          </div>
        </div>
      </div>
    </div>`;
  document.body.appendChild(el);

  const input = $('.gs-input', el);
  const clearBtn = $('.gs-clear', el);
  const layout = $('.gs-layout', el);
  const status = $('.gs-status', el);
  const idle = $('.gs-idle', el);
  const list = $('.gs-list', el);
  const moreWrap = $('.gs-more-wrap', el);
  const more = $('.gs-more', el);
  const empty = $('.gs-empty', el);
  const body = $('.gs-body', el);

  const st = { group: 'all', shown: PAGE, lastQ: null, results: [], trigger: null };

  function setStatus(t) { if (status.textContent !== t) status.textContent = t; }

  function item(r, words) {
    const T = TYPES[r.type];
    const thumb = r.img
      ? `<span class="gs-thumb${T.fit === 'contain' ? ' is-contain' : ''}"><img src="${esc(r.img)}" alt="" loading="lazy" decoding="async" /></span>`
      : `<span class="gs-thumb is-icon">${r.type === 'dealer' ? I_PIN : I_PAGE}</span>`;
    const ext = r.ext ? ' target="_blank" rel="noopener"' : '';
    const note = r.ext ? '<span class="gs-sr"> (PDF, opens in a new tab)</span>' : '';
    return `<li class="gs-item"><a class="gs-link" href="${esc(r.url)}"${ext}>
      ${thumb}
      <span class="gs-text">
        <span class="gs-type">${esc(T.label)}</span>
        <span class="gs-name">${markTitle(r.title, words)}${note}</span>
        ${r.meta ? `<span class="gs-meta">${esc(r.meta)}</span>` : ''}
      </span>
      <span class="gs-go" aria-hidden="true">${r.ext ? I_OUT : I_ARROW}</span>
    </a></li>`;
  }

  /* Counts always come from the whole result set, whichever filter is on, and a
     filter with nothing in it is disabled rather than hidden, so the row of
     filters does not rearrange itself under the reader's pointer as they type. */
  function paintFilters() {
    const counts = { all: st.results.length };
    st.results.forEach((r) => { const g = GROUP_OF[r.type]; counts[g] = (counts[g] || 0) + 1; });
    $$('.gs-filter', el).forEach((b) => {
      const n = counts[b.dataset.group] || 0;
      const on = b.dataset.group === st.group;
      b.setAttribute('aria-pressed', String(on));
      $('.gs-filter-n', b).textContent = String(n);
      b.disabled = !n && !on;
    });
  }

  function render() {
    const raw = input.value;
    const q = raw.trim();
    clearBtn.hidden = !raw;

    if (!q) {
      layout.classList.add('is-idle');
      idle.hidden = false;
      list.hidden = true; list.innerHTML = ''; moreWrap.hidden = true; empty.hidden = true;
      setStatus('');
      st.lastQ = null;
      return;
    }
    layout.classList.remove('is-idle');
    idle.hidden = true;

    if (!ITEMS) {
      list.hidden = true; list.innerHTML = ''; moreWrap.hidden = true; empty.hidden = true;
      const p = loadIndex();
      setStatus(indexFailed ? 'Search could not load. Check your connection and try again.' : 'Loading search…');
      p.then(render, () => setStatus('Search could not load. Check your connection and try again.'));
      return;
    }

    if (q !== st.lastQ) { st.results = find(q); st.lastQ = q; }
    paintFilters();
    const words = queryWords(q);
    const group = GROUPS.find((g) => g.id === st.group) || GROUPS[0];
    const pool = st.group === 'all' ? st.results : st.results.filter((r) => GROUP_OF[r.type] === st.group);

    if (!pool.length) {
      list.hidden = true; list.innerHTML = ''; moreWrap.hidden = true;
      empty.hidden = false;
      const n = st.results.length;
      if (n) {
        setStatus('No ' + group.label.toLowerCase() + ' for “' + q + '”');
        empty.innerHTML = '<p class="gs-empty-b">There ' + (n === 1 ? 'is 1 result' : 'are ' + n + ' results') +
          ' for it in other groups.</p><button type="button" class="btn-secondary-light gs-show-all">Show all results</button>';
      } else {
        setStatus('No results for “' + q + '”');
        empty.innerHTML = '<p class="gs-empty-b">Check the spelling, or try a model name, a floorplan code like 250BH,' +
          ' or a city for dealers.</p><div class="gs-chips">' + POPULAR.slice(0, 6).map(chip).join('') + '</div>';
      }
      return;
    }

    empty.hidden = true;
    const n = pool.length;
    setStatus(n + ' result' + (n === 1 ? '' : 's') + ' for “' + q + '”' +
      (st.group === 'all' ? '' : ' in ' + group.label));
    list.hidden = false;
    list.innerHTML = pool.slice(0, st.shown).map((r) => item(r, words)).join('');
    const left = n - Math.min(st.shown, n);
    moreWrap.hidden = left <= 0;
    if (left > 0) more.textContent = 'Load more (' + left + ' more)';
  }

  /* ---------- Behaviour ---------- */
  let typing = 0;
  input.addEventListener('input', () => {
    clearBtn.hidden = !input.value;
    st.shown = PAGE;
    clearTimeout(typing);
    typing = setTimeout(render, 90);
  });

  /* Down arrow or Enter moves into the results; there is no separate results
     page to submit to. Up from the first result comes back to the field. */
  input.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowDown' && e.key !== 'Enter') return;
    e.preventDefault();
    clearTimeout(typing);
    render();
    const first = !list.hidden && $('.gs-link', list);
    if (first) first.focus();
  });
  list.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    const links = $$('.gs-link', list);
    const i = links.indexOf(document.activeElement);
    if (i < 0) return;
    e.preventDefault();
    if (e.key === 'ArrowDown') (links[i + 1] || links[i]).focus();
    else (i === 0 ? input : links[i - 1]).focus();
  });
  $('.gs-form', el).addEventListener('submit', (e) => e.preventDefault());

  /* A thumbnail that fails to load leaves its grey well rather than a broken
     image icon. */
  list.addEventListener('error', (e) => {
    if (e.target.tagName !== 'IMG') return;
    const well = e.target.parentNode;
    e.target.remove();
    if (well) well.classList.add('is-broken');
  }, true);

  clearBtn.addEventListener('click', () => {
    input.value = '';
    st.group = 'all';
    st.shown = PAGE;
    render();
    input.focus();
  });

  el.addEventListener('click', (e) => {
    const f = e.target.closest('.gs-filter');
    if (f) {
      if (f.disabled) return;
      st.group = f.dataset.group;
      st.shown = PAGE;
      render();
      return;
    }
    const c = e.target.closest('.gs-chip');
    if (c) {
      input.value = c.dataset.q;
      st.group = 'all';
      st.shown = PAGE;
      render();
      input.focus();
      return;
    }
    if (e.target.closest('.gs-show-all')) {
      st.group = 'all';
      st.shown = PAGE;
      render();
      const first = $('.gs-link', list);
      if (first) first.focus();
      return;
    }
    if (e.target.closest('.gs-more')) {
      const before = st.shown;
      st.shown += PAGE;
      render();
      const next = $$('.gs-link', list)[before];
      if (next) next.focus();
    }
  });

  /* ---------- Open and close ----------
     Manners from the site's other overlays (videos.js, floorplans.js): Lenis
     stopped while it is open, because it keeps scrolling the page under a fixed
     layer whatever overflow says; focus held inside it; Escape closes it and
     goes no further, so it cannot also close something underneath; and focus
     returns to whatever opened it. */
  const FOCUSABLE = 'a[href],button:not([disabled]),input,[tabindex]:not([tabindex="-1"])';
  let closing = 0;

  function open(from) {
    clearTimeout(closing);
    st.trigger = from && from.focus ? from : document.activeElement;
    el.hidden = false;
    void el.offsetWidth;                      // let the fade start from the hidden state
    el.classList.add('is-open');
    document.body.classList.add('gs-open');
    const l = window.__jaycoLenis;
    if (l && l.stop) l.stop();
    loadIndex().catch(() => {});
    render();
    body.scrollTop = 0;
    input.focus({ preventScroll: true });
    if (input.value) input.select();
  }

  function close() {
    if (el.hidden || !el.classList.contains('is-open')) return;
    el.classList.remove('is-open');
    document.body.classList.remove('gs-open');
    const l = window.__jaycoLenis;
    if (l && l.start) l.start();
    closing = setTimeout(() => { el.hidden = true; }, reduceMotion.matches ? 0 : 260);
    const t = st.trigger;
    st.trigger = null;
    if (t && document.contains(t) && t.focus) t.focus({ preventScroll: true });
  }

  $('.gs-close', el).addEventListener('click', close);
  document.addEventListener('keydown', (e) => {
    if (el.hidden || !el.classList.contains('is-open')) return;
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); return; }
    if (e.key !== 'Tab') return;
    const f = $$(FOCUSABLE, el).filter((x) => x.offsetParent !== null);
    if (!f.length) return;
    const first = f[0];
    const last = f[f.length - 1];
    if (!el.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }, true);

  window.JAYCO_SEARCH_UI = {
    open: open,
    close: close,
    /* Called on hover or focus of a search button, so the index is usually
       already here by the time the panel opens. */
    warm: () => { loadIndex().catch(() => {}); },
  };
}());
