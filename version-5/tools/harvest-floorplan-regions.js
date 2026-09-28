#!/usr/bin/env node
/* Harvest jayco.com's floorplan order, per region.

   jayco.com's floorplan lists are gated on a region: its "Please select your
   region" picker POSTs r=<region> to /rvs/setregion/ and the lists that follow
   come back for that region only. Five regions stand behind the 65 options:
     1  US East      2  US West      11 Canada East
     12 Canada West  21 Other Country
   They differ in WHICH plans show (Jay Flight's West lineup is its "W" plans;
   Canada gets CSA builds of Greyhawk 30Z and the Melbournes) and every list is
   in Jayco's own hand-set order, which is not alphabetical (Eagle Fifth Wheel
   opens 260KC, 29RLC, 31RLT, 29DDB).

   For each region this sets the region once, reads every 2027 model's
   /floorplans/ page, and keeps the plan slugs in page order.

   Writes version-5/js/floorplan-regions.js (window.JAYCO_REGIONS):
     options  the picker, in jayco.com's order: { label, value, group }
     order    { <our model slug>: { <region>: [plan slugs] } }

   Run from anywhere:  node version-5/tools/harvest-floorplan-regions.js
   Needs Node 18+ (global fetch). Re-run when Jayco changes a lineup. */

const fs = require('fs');
const path = require('path');

const BASE = 'https://www.jayco.com';
const OUT = path.join(__dirname, '..', 'js', 'floorplan-regions.js');
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)';

/* jayco.com's model paths -> this site's model slugs. Models jayco.com lists
   that this site does not carry yet are left out. */
const MODELS = {
  'class-a-motorhomes/2027-Alante-se': 'alante-se',
  'class-a-motorhomes/2027-alante': 'alante',
  'class-a-motorhomes/2027-precept-prestige': 'precept-prestige',
  'class-a-motorhomes/2027-precept': 'precept',
  'class-b-motorhomes/2027-comet': 'comet',
  'class-b-motorhomes/2027-swift': 'swift',
  'class-b-motorhomes/2027-terrain': 'terrain',
  'class-c-motorhomes/2027-greyhawk-xl': 'greyhawk-xl',
  'class-c-motorhomes/2027-greyhawk': 'greyhawk',
  'class-c-motorhomes/2027-redhawk-se': 'redhawk-se',
  'class-c-motorhomes/2027-redhawk': 'redhawk',
  'class-c-motorhomes/2027-seneca-prestige': 'seneca-prestige',
  'class-c-motorhomes/2027-seneca-xt': 'seneca-xt',
  'class-c-motorhomes/2027-seneca': 'seneca',
  'destination-travel-trailer/2027-jay-flight-bungalow': 'jay-flight-bungalow',
  'fifth-wheels/2027-eagle-fifth-wheels': 'eagle-fw',
  'fifth-wheels/2027-eagle-sle-fifth-wheels': 'eagle-sle-fw',
  'fifth-wheels/2027-north-point': 'north-point',
  'fifth-wheels/2027-pinnacle': 'pinnacle',
  'toy-haulers/2027-seismic-travel-trailer': 'seismic-tt',
  'toy-haulers/2027-seismic': 'seismic-fw',
  'travel-trailers/2027-eagle-travel-trailers': 'eagle-tt',
  'travel-trailers/2027-jay-feather-air-sl': 'jay-feather-air-sl',
  'travel-trailers/2027-jay-feather-air': 'jay-feather-air',
  'travel-trailers/2027-jay-feather-sl': 'jay-feather-sl',
  'travel-trailers/2027-jay-feather': 'jay-feather',
  'travel-trailers/2027-jay-flight': 'jay-flight',
};

function cookieJar() {
  const jar = {};
  return {
    take(res) {
      const all = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
      all.forEach((c) => { const [kv] = c.split(';'); const i = kv.indexOf('='); jar[kv.slice(0, i)] = kv.slice(i + 1); });
    },
    header() { return Object.entries(jar).map(([k, v]) => k + '=' + v).join('; '); },
  };
}

async function get(url, jar) {
  const res = await fetch(url, { headers: { 'User-Agent': UA, Cookie: jar.header() } });
  jar.take(res);
  if (!res.ok) throw new Error(res.status + ' ' + url);
  return res.text();
}

function regionOptions(html) {
  const i = html.indexOf('id="region-select"');
  const sel = html.slice(i, html.indexOf('</select>', i));
  const out = [];
  let group = '';
  const re = /<optgroup label="([^"]*)"|(<\/optgroup>)|<option value="([^"]+)"[^>]*>([^<]*)<\/option>/g;
  let m;
  while ((m = re.exec(sel))) {
    if (m[1] != null) group = m[1];
    else if (m[2]) group = '';                    // "Other Country" sits outside both groups
    else out.push({ label: m[4].trim(), value: m[3], group });
  }
  return out;
}

function planSlugs(html, modelPath) {
  const esc = modelPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp('href="/rvs/' + esc + '/([a-z0-9-]+)/"', 'g');
  const out = [];
  let m;
  while ((m = re.exec(html))) if (m[1] !== 'floorplans' && out.indexOf(m[1]) < 0) out.push(m[1]);
  return out;
}

(async () => {
  const first = await get(BASE + '/rvs/floorplans/', cookieJar());
  const options = regionOptions(first);
  const regions = Array.from(new Set(options.map((o) => o.value)));
  console.log(options.length + ' options, regions ' + regions.join(', '));

  const order = {};
  for (const r of regions) {
    const jar = cookieJar();
    await get(BASE + '/rvs/floorplans/', jar);
    const res = await fetch(BASE + '/rvs/setregion/', {
      method: 'POST',
      headers: { 'User-Agent': UA, Cookie: jar.header(), 'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'r=' + encodeURIComponent(r),
    });
    jar.take(res);
    for (const [p, slug] of Object.entries(MODELS)) {
      const list = planSlugs(await get(BASE + '/rvs/' + p + '/floorplans/', jar), p);
      if (!list.length) console.warn('  region ' + r + ': no plans for ' + slug);
      (order[slug] = order[slug] || {})[r] = list;
    }
    console.log('region ' + r + ' done');
  }

  const today = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(OUT,
    '/* GENERATED by tools/harvest-floorplan-regions.js on ' + today + ' — do not edit by hand.\n' +
    '   jayco.com\'s region picker, and each model\'s floorplans in jayco.com\'s own\n' +
    '   order for each region (1 US East, 2 US West, 11 Canada East, 12 Canada West,\n' +
    '   21 Other Country). Slugs are jayco.com\'s; floorplans.js matches them to\n' +
    '   build-data ids ignoring punctuation ("130rd-" = "130rd", "30z-csa" = "30zcsa"). */\n' +
    'window.JAYCO_REGIONS = ' + JSON.stringify({ harvested: today, options, order }) + ';\n');
  console.log('wrote ' + OUT);
})().catch((e) => { console.error(e); process.exit(1); });
