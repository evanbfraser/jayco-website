#!/usr/bin/env node
/* ===================================================
   Jayco — build the site search index
   ---------------------------------------------------
   Reads the data files the pages already load, plus the
   pages themselves, and writes js/search-index.js: one
   compact row per searchable thing. js/search.js loads
   that file the first time a reader opens search, so no
   page carries it until then.

   RE-RUN WHENEVER A DATA FILE OR A PAGE CHANGES:
     node version-5/tools/build-search-index.js
   (any working directory — paths resolve from this
   file). Then bump SEARCH_VERSION in js/app.js so
   browsers fetch the new index instead of a cached one.

   ROW SHAPE: [type, title, meta, url, image, keywords, external, tags, year]
     type      class | model | floorplan | blog | video |
               manual | brochure | page | dealer
     title     what the result is called
     meta      one line under it — the useful facts, never
               the title again
     url       where it goes, relative to version-5/
     image     a relative or absolute image, or '' for none
               (a relative path that does not exist on disk
               is dropped here rather than 404ing later)
     keywords  lower-case words that match but are never shown
     external  1 when the link leaves the site (a PDF)
     tags      words that count as strongly as the title without
               being shown: a model's class, a floorplan's model
               and class, a dealer's city and state. Without them a
               search for "class c" ranked a 2017 brochure titled
               "Class C Brochure" above the Class C models, whose
               names do not say "Class C".
     year      the model year or publication year, or omitted —
               search.js ranks older brochures, manuals, videos and
               articles a little lower than current ones
     (tags and year are left off the end of a row that has neither)

   Everything below is taken from the data as it stands;
   nothing is written that a data file or page does not say.
   =================================================== */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');           // version-5/
const JS = path.join(ROOT, 'js');
const OUT = path.join(JS, 'search-index.js');

/* ---------- The data files, loaded the way the pages load them ---------- */
const win = {};
win.window = win;
const sandbox = vm.createContext({ window: win, console });
[
  'models-data.js', 'model-data.js', 'build-data.js', 'blog-data.js',
  'video-data.js', 'manuals-data.js', 'brochures-library.js', 'dealer-data.js',
].forEach((f) => vm.runInContext(fs.readFileSync(path.join(JS, f), 'utf8'), sandbox, { filename: f }));

const JAYCO = win.JAYCO;
const DETAIL = win.JAYCO_MODEL_DETAIL || {};
const BUILD = win.JAYCO_BUILD || {};
const BLOG = win.JAYCO_BLOG;
const VIDEOS = win.JAYCO_VIDEOS;
const MANUALS = win.JAYCO_MANUALS || [];
const BROCHURES = win.JAYCO_BROCHURE_LIBRARY;
const DEALERS = win.JAYCO_DEALERS;

/* ---------- Helpers ---------- */
const clean = (s) => String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
const ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: '’', lsquo: '‘',
  rdquo: '”', ldquo: '“', ndash: '–', mdash: '—', hellip: '…',
  trade: '™', reg: '®', deg: '°', times: '×', rarr: '→',
};
const decode = (s) => String(s)
  .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
  .replace(/&([a-z]+);/gi, (m, n) => (ENTITIES[n.toLowerCase()] != null ? ENTITIES[n.toLowerCase()] : ' '));
const text = (html) => clean(decode(String(html || '').replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, ' ')));

const STOP = new Set(['a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'how', 'in', 'is',
  'it', 'its', 'of', 'on', 'or', 'that', 'the', 'this', 'to', 'was', 'what', 'when', 'where', 'which',
  'who', 'why', 'with', 'you', 'your']);
/* Lower-case, de-accented, de-duplicated words — the same normalising search.js
   applies to a query, so a keyword and a typed word meet on equal terms. */
function keywords(...parts) {
  const seen = new Set();
  const list = parts.flat().join(' ').toLowerCase()
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9+]+/g, ' ')
    .split(' ');
  return list
    /* A single letter survives only straight after "class": "Class C" has to
       stay searchable as its two words (dropping the "c" once cost every Class C
       model its class), and "a" is otherwise a stop word. search.js keeps the
       same letter on the query side. */
    .filter((w, i) => w && (w.length > 1 ? !STOP.has(w) : list[i - 1] === 'class'))
    .filter((w) => !seen.has(w) && seen.add(w))
    .join(' ');
}
function truncate(s, n) {
  s = clean(s);
  if (s.length <= n) return s;
  const cut = s.slice(0, n);
  const sp = cut.lastIndexOf(' ');
  return (sp > n * 0.6 ? cut.slice(0, sp) : cut).replace(/[\s,;:.–—-]+$/, '') + '…';
}
function exists(rel) {
  if (!rel) return false;
  if (/^https?:/i.test(rel)) return true;
  try { return fs.existsSync(path.resolve(ROOT, decodeURIComponent(rel))); } catch (e) { return false; }
}
const money = (n) => '$' + Math.round(n).toLocaleString('en-US');
const DOT = ' · ';

const rows = [];
function add(type, title, meta, url, img, kw, external, tags, year) {
  const row = [type, clean(title), clean(meta), url, exists(img) ? img : '', kw || '', external ? 1 : 0];
  if (tags || year) row.push(tags || '');
  if (year) row.push(Number(year));
  rows.push(row);
}

/* ---------- RV types and models ---------- */
const catById = Object.fromEntries(JAYCO.categories.map((c) => [c.id, c]));
const namesByCat = {};
Object.values(JAYCO.models).forEach((m) => { (namesByCat[m.category] = namesByCat[m.category] || []).push(m.name); });

JAYCO.categories.forEach((c) => {
  const names = namesByCat[c.id] || [];
  if (!names.length) return;
  const motor = c.type === 'motorized';
  add('class', c.name, 'RV type' + DOT + names.length + ' model' + (names.length === 1 ? '' : 's'),
    'type.html?type=' + c.id, c.image,
    keywords(c.type, motor ? 'motorhome motorized drivable' : 'towable trailer', names));
});

/* A model with a real detail record goes to its own page; everything else to
   its type page, which still shows its card — the rule app.js's phone menu
   uses, including the stub check. */
const modelHref = (slug, cat) =>
  (DETAIL[slug] && !DETAIL[slug].stub) ? 'model.html?model=' + slug : 'type.html?type=' + cat;

/* Words a model is shopped by that its record does not spell out, so the
   popular searches in js/search.js land on the coaches they mean.
     ALIAS  the name a line is sold under. models-data calls it "Jay Flight";
            Jayco's brochures, awards and dealer lists all call it the
            "Jay Flight SLX".
     LIGHT  the lightweight lines, by what the data itself says: a tagline built
            on "light" ("Ultra-light.", "Light towing", "Travel Light",
            "Lighter tow") or the Jay Feather name, Jayco's lightweight family. */
const ALIAS = { 'jay-flight': 'slx' };
const isLight = (m) => /\blight/i.test(m.tagline || '') || /feather/i.test(m.name);

Object.entries(JAYCO.models).forEach(([slug, m]) => {
  const c = catById[m.category] || {};
  add('model', m.name,
    [c.name, m.basePrice ? 'Starting at ' + money(m.basePrice) : ''].filter(Boolean).join(DOT),
    modelHref(slug, m.category), m.img,
    keywords(m.tagline, c.type, (m.floorplans || []).map((f) => f.name)), false,
    keywords(c.name, c.type === 'motorized' ? 'motorhome' : 'towable trailer',
      ALIAS[slug] || '', isLight(m) ? 'lightweight light' : ''), m.year);
});

/* ---------- Floorplans ----------
   floorplans.html?plan=<model>__<plan> — the catalog's own row key. The page
   scrolls to that card and marks it (floorplans.js focusPlan). "BH" in a Jayco
   floorplan code is a bunkhouse, the one code worth a synonym. */
Object.entries(BUILD).forEach(([slug, b]) => {
  const m = JAYCO.models[slug];
  if (!m || !Array.isArray(b.floorplans)) return;
  const c = catById[m.category] || {};
  b.floorplans.forEach((f) => {
    add('floorplan', m.name + ' ' + f.name,
      [f.sleeps ? 'Sleeps ' + f.sleeps : '', f.length, c.name].filter(Boolean).join(DOT),
      'floorplans.html?plan=' + encodeURIComponent(slug + '__' + f.id), f.img,
      keywords('floorplan floor plan layout'), false,
      keywords(m.name, c.name, ALIAS[slug] || '',
        /bh/i.test(f.name) ? 'bunkhouse bunk bunks' : '',
        /* "Family-friendly": a bunkhouse, or a plan that sleeps eight or more —
           the two things a family shopping a floorplan is counting. */
        (/bh/i.test(f.name) || f.sleeps >= 8) ? 'family friendly' : ''), m.year);
  });
});

/* ---------- Blog ----------
   Some post titles arrive in capitals. blog-ui.js sets them in title case for
   display; this does the same, so a result reads the way the card does. */
const SMALL = new Set(['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'from', 'in', 'into', 'nor',
  'of', 'on', 'or', 'the', 'to', 'up', 'vs', 'with']);
const ACR = { RV: 'RV', RVS: 'RVs', USA: 'USA', US: 'US', KOA: 'KOA', DIY: 'DIY', PDI: 'PDI', LED: 'LED',
  GPS: 'GPS', TV: 'TV', AC: 'AC', FAQ: 'FAQ', FAQS: 'FAQs', II: 'II', III: 'III', BBQ: 'BBQ', NPS: 'NPS',
  BLM: 'BLM', RVIA: 'RVIA', RVDA: 'RVDA', HQ: 'HQ', '4X4': '4x4', AWD: 'AWD', '4WD': '4WD' };
function displayTitle(t) {
  t = clean(t);
  const letters = t.replace(/[^A-Za-z]/g, '');
  if (letters.length < 4 || letters !== letters.toUpperCase()) return t;
  const parts = t.split(/(\s+)/);
  const idx = parts.map((p, i) => (/\S/.test(p) ? i : -1)).filter((i) => i >= 0);
  const firstI = idx[0], lastI = idx[idx.length - 1];
  return parts.map((p, i) => {
    if (!/\S/.test(p)) return p;
    return p.split('-').map((seg, j) => {
      const bare = seg.replace(/[^A-Za-z0-9']/g, '');
      if (!bare) return seg;
      if (ACR[bare.toUpperCase()]) return seg.replace(bare, ACR[bare.toUpperCase()]);
      const low = seg.toLowerCase();
      if (j === 0 && i !== firstI && i !== lastI && SMALL.has(bare.toLowerCase())) return low;
      return low.replace(/[a-z]/, (ch) => ch.toUpperCase());
    }).join('-');
  }).join('');
}
const topicName = Object.fromEntries((BLOG.topics || []).map((t) => [t.id, t.name]));
BLOG.posts.forEach((p) => {
  const topics = (p.topics || []).map((id) => topicName[id]).filter(Boolean);
  add('blog', displayTitle(p.title), [topics[0], p.date].filter(Boolean).join(DOT),
    'blog-post.html?post=' + encodeURIComponent(p.slug), '../assets/blog/web/' + p.slug + '-400.webp',
    keywords('blog article', topics, truncate(p.excerpt || '', 160)), false,
    '', Number(String(p.iso || '').slice(0, 4)) || 0);
});

/* ---------- Videos ----------
   videos.html?v=<YouTube id> opens the page's own player (videos.js). */
const videoCat = Object.fromEntries(VIDEOS.categories.map((c) => [c.id, c.name]));
VIDEOS.items.forEach((v) => {
  const m = v.slug && JAYCO.models[v.slug];
  add('video', v.title.replace(/\s*[-–]\s*Jayco RV\s*$/, ''),
    [videoCat[v.cat], v.year].filter(Boolean).join(DOT),
    'videos.html?v=' + encodeURIComponent(v.id), 'https://i.ytimg.com/vi/' + v.id + '/hqdefault.jpg',
    keywords('video watch', videoCat[v.cat]), false,
    m ? keywords(m.name) : '', v.year);
});

/* ---------- Owner resources ----------
   Manuals and brochures open their PDF on jayco.com directly. Brochures are the
   English editions only: the library carries each one in up to eight
   languages, and eight identical titles in a result list is noise. */
const yearSpan = (ys) => {
  const a = (ys || []).slice().sort();
  if (!a.length) return '';
  return a[0] === a[a.length - 1] ? String(a[0]) : a[0] + '–' + a[a.length - 1];
};
MANUALS.forEach((x) => {
  add('manual', x.name, [x.kind, yearSpan(x.years), 'PDF'].filter(Boolean).join(DOT), x.pdf, x.cover,
    keywords('manual owners guide pdf', x.kind), true,
    keywords(x.types), Math.max(0, ...(x.years || [0])));
});
BROCHURES.items.filter((b) => b.lang === 'en').forEach((b) => {
  add('brochure', b.model + ' ' + (b.lit || 'Brochure'), [b.year, b.type, 'PDF'].filter(Boolean).join(DOT),
    b.pdf, b.cover, keywords('brochure literature pdf'), true,
    keywords(b.type), b.year);
});

/* ---------- Dealers ----------
   dealers.html?q=<City, ST> — the text a reader would type into the dealer
   search, which dealers.js runs on arrival: an exact city anchors the map there
   and sorts dealers by distance from it. A dealer with no state (some
   international ones) goes to its country instead. */
const COUNTRY = { US: 'United States', CA: 'Canada', BR: 'Brazil', CL: 'Chile', JP: 'Japan', KR: 'South Korea',
  OM: 'Oman', QA: 'Qatar', AE: 'United Arab Emirates', GB: 'United Kingdom', AU: 'Australia', MX: 'Mexico',
  NZ: 'New Zealand' };
const REGION = { AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado',
  CT: 'Connecticut', DE: 'Delaware', DC: 'District of Columbia', FL: 'Florida', GA: 'Georgia', HI: 'Hawaii',
  ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana',
  ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi',
  MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma',
  OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota',
  TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington',
  WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming', AB: 'Alberta', BC: 'British Columbia',
  MB: 'Manitoba', NB: 'New Brunswick', NL: 'Newfoundland and Labrador', NS: 'Nova Scotia', NT: 'Northwest Territories',
  NU: 'Nunavut', ON: 'Ontario', PE: 'Prince Edward Island', QC: 'Quebec', SK: 'Saskatchewan', YT: 'Yukon' };
DEALERS.dealers.forEach((d) => {
  const place = [d.city, d.state].filter(Boolean).join(', ');
  const where = (d.country === 'US' || d.country === 'CA')
    ? place
    : [place, COUNTRY[d.country] || d.country].filter(Boolean).join(', ');
  const url = d.city && d.state
    ? 'dealers.html?q=' + encodeURIComponent(d.city + ', ' + d.state)
    : 'dealers.html?country=' + encodeURIComponent(d.country);
  add('dealer', d.name, [where, d.phone].filter(Boolean).join(DOT), url, '',
    keywords('dealer dealership', d.zip, COUNTRY[d.country] || ''), false,
    keywords(d.city, d.state, REGION[d.state] || ''));
});

/* ---------- Pages ----------
   Title from <title>; the line under it from the hero's tagline (or the first
   real paragraph); keywords from the page's H1, H2s and FAQ questions. EXTRA
   is the few words a reader types when this page is exactly what they want —
   "warranty", "factory tour", "solar" — and they are TAGS, matched as strongly
   as the title, so the page leads the videos and articles that merely mention
   the word. The four query-driven templates are left out — they are not pages a
   reader can arrive at without a record. */
const SKIP = new Set(['blog-category.html', 'blog-post.html', 'model.html', 'type.html']);
const EXTRA = {
  'index.html': 'home homepage',
  'jayco-difference.html': 'warranty 2+3 construction magnum truss stronghold climate shield jride jaysmart quality features',
  'visit-us.html': 'factory tour tours plant visitors center middlebury indiana visit',
  'pdi.html': 'pre-delivery inspection pdi quality',
  'manuals.html': 'owners manual manuals owner guide pdf',
  'brochures.html': 'brochure brochures catalog literature pdf',
  'dealers.html': 'dealer dealers dealership locator find near me',
  'build-price.html': 'build price configure configurator msrp options',
  'request-quote.html': 'quote pricing price request',
  'quiz.html': 'quiz rv finder which rv right for me',
  'towing.html': 'towing calculator tow capacity truck hitch',
  'tow-vs-drive.html': 'tow vs drive towable motorhome guide',
  'value-tool.html': 'value calculator hidden value tool',
  'compare.html': 'compare comparison side by side',
  'floorplans.html': 'floorplans floor plans layouts catalog',
  'awards.html': 'awards award winning dsi readers choice',
  'our-story.html': 'history story founded 1968 bontrager company about',
  'rd.html': 'research development engineering innovation testing',
  'safety.html': 'safety jaysmart lighting seat belts',
  'solar.html': 'solar overlander off grid sustainability',
  'testimonials.html': 'reviews testimonials owner stories',
  'top-selling.html': 'best selling top popular',
  'new-to-rving.html': 'beginner first rv new guide',
  'buyers-guide.html': 'buying guide how to buy',
  'videos.html': 'videos walkthrough youtube',
  'blog.html': 'blog articles news tips',
};
fs.readdirSync(ROOT).filter((f) => f.endsWith('.html') && !SKIP.has(f)).sort().forEach((f) => {
  const html = fs.readFileSync(path.join(ROOT, f), 'utf8');
  let title = text((html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || '');
  title = title.replace(/\s*\(v5\)\s*$/, '').replace(/\s+[—-]\s+Jayco$/, '');
  if (f === 'index.html') title = 'Home';
  const main = (html.match(/<main[\s\S]*?<\/main>/i) || [html])[0];
  const tag = main.match(/<p[^>]*class="[^"]*(?:hero-tagline|hero-sub|hero-lead|tagline)[^"]*"[^>]*>([\s\S]*?)<\/p>/i);
  let desc = tag ? text(tag[1]) : '';
  if (!desc) {
    desc = [...main.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map((m) => text(m[1])).find((s) => s.length > 50) || '';
  }
  const h1 = text((main.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1] || '');
  const h2 = [...main.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)].map((m) => text(m[1]));
  const faq = [...main.matchAll(/class="faq-question"[^>]*>\s*<span>([\s\S]*?)<\/span>/gi)].map((m) => text(m[1]));
  add('page', title, truncate(desc, 110), f, '', keywords(h1, h2, faq), false, keywords(EXTRA[f] || ''));
});

/* ---------- Write ---------- */
const built = new Date().toISOString().slice(0, 10);
const counts = rows.reduce((o, r) => { o[r[0]] = (o[r[0]] || 0) + 1; return o; }, {});
const body =
  '/* GENERATED by tools/build-search-index.js on ' + built + ' — do not edit by hand.\n' +
  '   Re-run: node version-5/tools/build-search-index.js, then bump SEARCH_VERSION in js/app.js.\n' +
  '   Row: [type, title, meta, url, image, keywords, external] */\n' +
  'window.JAYCO_SEARCH_INDEX = {\n  "built": ' + JSON.stringify(built) + ',\n  "items": [\n' +
  rows.map((r) => '    ' + JSON.stringify(r)).join(',\n') + '\n  ]\n};\n';
fs.writeFileSync(OUT, body);
console.log('Wrote ' + path.relative(process.cwd(), OUT) + ': ' + rows.length + ' rows, ' +
  Math.round(Buffer.byteLength(body) / 1024) + ' KB');
console.log(counts);
