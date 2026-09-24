/* ===================================================
   Jayco — Build & Price data
   ---------------------------------------------------
   SINGLE SOURCE OF TRUTH for the configurator.
   Swap these values for exact factory data any time —
   no UI code needs to change.

   DATA PROVENANCE
   • categories, model names, model years, and basePrice
     are REAL 2027 MSRP "Starting at" figures from jayco.com.
   • specs and the floorplans below are computed from the 181
     real 2027 plans in build-data.js — sleeps, length and
     weight ranges are measured, not typed.
   • The floorplans here are a FALLBACK ONLY: the three real
     cheapest plans per model, so a page loading without
     build-data.js still shows plans that exist. The builder
     itself uses build-data.js and never reads these.
   • Nothing in this file is invented any more. Exterior paint
     and options moved to build-data.js as Jayco's own
     published figures.
   =================================================== */

window.JAYCO = (function () {
  'use strict';

  /* The invented option palettes that used to live here are gone. They gave
     every model the same five made-up paint colours, four made-up décors and
     six made-up packages. build-data.js now carries Jayco's own per-plan
     options and real full-body paint, harvested from jayco.com, and build.js
     falls back to a single "As shown" finish rather than to fiction. */

  /* ---- Categories ---- */
  const categories = [
    { id: 'travel-trailers', name: 'Travel Trailers',              type: 'towable',   image: '../assets/jayco-travel-trailer-landscape-v2.jpg' },
    { id: 'destination',     name: 'Destination Trailers',         type: 'towable',   image: '../assets/jayco-destination-trailer-landscape.jpg' },
    { id: 'fifth-wheels',    name: 'Fifth Wheels',                 type: 'towable',   image: '../assets/jayco-fifth-wheel-landscape-v2.jpg' },
    { id: 'toy-haulers',     name: 'Toy Haulers',                  type: 'towable',   image: '../assets/jayco-toy-hauler-landscape-v2.jpg' },
    { id: 'class-b',         name: 'Class B Motorhomes',           type: 'motorized', image: '../assets/jayco-class-b-landscape-v2.jpg' },
    { id: 'class-c',         name: 'Class C Motorhomes',           type: 'motorized', image: '../assets/jayco-class-c-landscape-v2.jpg' },
    { id: 'super-c',         name: 'Super C Motorhomes',           type: 'motorized', image: '../assets/jayco-class-super-c-landscape-v2.jpg' },
    { id: 'class-a',         name: 'Class A Motorhomes',           type: 'motorized', image: '../assets/jayco-class-a-landscape-v2.jpg' },
  ];

  /* short floorplan factory to keep the data readable */
  const fp = (name, price, sleeps, length, slides) => ({ id: name.toLowerCase(), name, price, sleeps, length, slides });

  /* ---- Models (order within a category defines prev/next) ---- */
  const models = {
    /* ===== TRAVEL TRAILERS ===== */
    'jay-flight': {
      name: 'Jay Flight', category: 'travel-trailers', year: 2027, basePrice: 17468,
      tagline: 'America’s favorite travel trailer.',
      img: '../assets/models/Jayco-jay-flight-slx-travel-trailer.png',
      /* Ranges computed from the 35 real 2027 floorplans in build-data.js, not
         typed by hand. Sleeps 2–11, 16′ 1″–40′ 4″, 2,450–8,655 lbs dry. */
      specs: { Sleeps: 'Up to 11', Length: '16–40 ft', 'Dry Weight': '2,450–8,655 lbs' },
      /* FALLBACK ONLY. build-price.html loads build-data.js, which supplies all
         35 real floorplans with Jayco's own specs and supersedes this list. The
         three here are the real cheapest three so that a page which somehow
         loads without build-data.js still shows plans that exist — the previous
         195RB / 264BH / 287BHS are not 2027 Jay Flight plans at all. */
      floorplans: [ fp('130BH', 0, 4, '16′ 1″', 0), fp('130RD', 450, 4, '', 0), fp('140TB', 1050, 2, '', 0) ],
    },
    'jay-feather-air-sl': {
      name: 'Jay Feather Air SL', category: 'travel-trailers', year: 2027, basePrice: 20618,
      tagline: 'Ultra-light. Ready for anything.',
      img: '../assets/models/jayco-jay-feather-air-sl-2027.png',
      specs: { Sleeps: 'Up to 6', Length: '18–22 ft', 'Dry Weight': '2,515–2,920 lbs' },
      floorplans: [ fp('15TBSL', 0, 2, '17′ 6″', 0), fp('17BHSL', 375, 6, '21′ 3″', 0) ],
    },
    'jay-feather-air': {
      name: 'Jay Feather Air', category: 'travel-trailers', year: 2027, basePrice: 30968,
      tagline: 'Light towing, full comfort.',
      img: '../assets/models/jayco-jay-feather-air-2027.png',
      specs: { Sleeps: 'Up to 8', Length: '20–23 ft', 'Dry Weight': '3,675–4,325 lbs' },
      floorplans: [ fp('15MRB', 0, 4, '20′ 2″', 0), fp('16DB', 2175, 8, '22′ 11″', 0), fp('16RB', 2550, 4, '20′ 2″', 1) ],
    },
    'jay-feather-sl': {
      name: 'Jay Feather SL', category: 'travel-trailers', year: 2027, basePrice: 37943,
      tagline: 'Small footprint, big feel.',
      img: '../assets/models/jayco-jay-feather-sl-2027.png',
      specs: { Sleeps: 'Up to 10', Length: '30 ft', 'Dry Weight': '5,310–5,555 lbs' },
      floorplans: [ fp('25RLSL', 0, 6, '30′ 1″', 1), fp('26BHSL', 150, 10, '30′ 5″', 1) ],
    },
    'jay-feather': {
      name: 'Jay Feather', category: 'travel-trailers', year: 2027, basePrice: 37493,
      tagline: 'Travel Light. Live Fully.',
      img: '../assets/models/jayco-jay-feather-2027.png',
      specs: { Sleeps: 'Up to 11', Length: '23–36 ft', 'Dry Weight': '4,655–7,335 lbs' },
      floorplans: [ fp('18RBF', 0, 4, '23′ 1″', 1), fp('19MRK', 2160, 4, '23′ 4″', 1), fp('21MML', 3735, 3, '25′ 5″', 1) ],
    },
    'eagle-tt': {
      name: 'Eagle Travel Trailers', category: 'travel-trailers', year: 2027, basePrice: 51368,
      tagline: 'Residential luxury you can tow.',
      img: '../assets/models/Jayco-eagle-travel-trailer.png',
      specs: { Sleeps: 'Up to 8', Length: '28–36 ft', 'Dry Weight': '6,785–9,790 lbs' },
      floorplans: [ fp('230MLCS', 0, 2, '27′ 7″', 1), fp('265FKDS', 8250, 2, '31′ 7″', 0), fp('294CKBS', 17482, 4, '34′ 9″', 1) ],
    },

    /* ===== DESTINATION ===== */
    'jay-flight-bungalow': {
      name: 'Jay Flight Bungalow', category: 'destination', year: 2027, basePrice: 66368,
      tagline: 'Home base for the long stay.',
      img: '../assets/models/Jayco-bungalow-destination-trailer.png',
      specs: { Sleeps: 'Up to 9', Length: '40–42 ft', 'Dry Weight': '10,355–11,750 lbs' },
      floorplans: [ fp('401FLTS', 0, 4, '40′ 4″', 1), fp('401LOFT', 8100, 8, '42′ 0″', 1), fp('404LOFT', 8100, 8, '42′ 0″', 1) ],
    },

    /* ===== FIFTH WHEELS ===== */
    'eagle-sle-fw': {
      name: 'Eagle SLE Fifth Wheel', category: 'fifth-wheels', year: 2027, basePrice: 52643,
      tagline: 'Lighter tow. Eagle comfort.',
      img: '../assets/models/Jayco-eagle-sle-fifth-wheel.png',
      specs: { Sleeps: 'Up to 8', Length: '29–33 ft', 'Dry Weight': '7,855–9,163 lbs' },
      floorplans: [ fp('24MLE', 0, 4, '29′ 3″', 1), fp('28BHU', 2985, 8, '33′ 5″', 1), fp('28RKS', 4500, 4, '29′ 8″', 0) ],
    },
    'eagle-fw': {
      name: 'Eagle Fifth Wheels', category: 'fifth-wheels', year: 2027, basePrice: 68993,
      tagline: 'The benchmark for luxury fifth wheels.',
      img: '../assets/models/Jayco-eagle-fifth-wheel.png',
      specs: { Sleeps: 'Up to 8', Length: '33–43 ft', 'Dry Weight': '9,160–12,800 lbs' },
      floorplans: [ fp('29DDB', 0, 6, '33′ 5″', 1), fp('29RLC', 750, 4, '32′ 11″', 1), fp('31QBH', 6000, 7, '35′ 5″', 1) ],
    },
    'north-point': {
      name: 'North Point', category: 'fifth-wheels', year: 2027, basePrice: 112425,
      tagline: 'Luxury That Leads the Way.',
      img: '../assets/models/Jayco-north-point-fifth-wheel.png',
      specs: { Sleeps: 'Up to 8', Length: '34–45 ft', 'Unloaded Weight': '12,815–15,350 lbs' },
      floorplans: [ fp('310RLTS', 0, 4, '34′ 3″', 1), fp('365RKTS', 7643, 4, '38′ 8″', 1), fp('381CKRE', 13193, 4, '40′ 9″', 1) ],
    },
    'pinnacle': {
      name: 'Pinnacle', category: 'fifth-wheels', year: 2027, basePrice: 140568,
      tagline: 'The Height of Life on the Road.',
      img: '../assets/models/Jayco-pinnacle-fifth-wheel.png',
      specs: { Sleeps: 'Up to 8', Length: '35–44 ft', 'Unloaded Weight': '13,645–16,360 lbs' },
      floorplans: [ fp('32RLTS', 0, 4, '34′ 10″', 1), fp('36FBTS', 8982, 4, '39′ 2″', 1), fp('38FBRK', 13175, 4, '42′ 5″', 1) ],
    },

    /* ===== TOY HAULERS ===== */
    'seismic-tt': {
      name: 'Seismic Travel Trailer Toy Hauler', category: 'toy-haulers', year: 2027, basePrice: 67868,
      tagline: 'Haul your toys in style.',
      img: '../assets/models/jayco-seismic-tt-2027.png',
      specs: { Sleeps: 'Up to 6', Length: '26–33 ft', 'Dry Weight': '7,445–8,640 lbs' },
      floorplans: [ fp('214', 0, 6, '25′ 7″', 1), fp('265', 10125, 6, '32′ 8″', 1) ],
    },
    'seismic-fw': {
      name: 'Seismic Fifth Wheel Toy Hauler', category: 'toy-haulers', year: 2027, basePrice: 119280,
      tagline: 'Garage, home & command center.',
      img: '../assets/models/jayco-seismic-fw-2027.png',
      specs: { Sleeps: 'Up to 8', Length: '40–47 ft', 'Dry Weight': '13,490–16,075 lbs' },
      floorplans: [ fp('359', 0, 6, '40′ 0″', 1), fp('399', 12713, 8, '45′ 2″', 1), fp('395', 13763, 7, '45′ 8″', 1) ],
    },

    /* ===== CLASS B ===== */
    'comet': {
      name: 'Comet', category: 'class-b', year: 2027, basePrice: 131175,
      tagline: 'Compact camper van, endless range.',
      img: '../assets/models/Jayco-comet-class-b.png',
      specs: { Sleeps: 'Up to 2', Length: '18 ft', Chassis: 'Ram ProMaster' },
      floorplans: [ fp('18C', 0, 2, '17′ 10″', 0) ],
    },
    'swift': {
      name: 'Swift', category: 'class-b', year: 2027, basePrice: 150300,
      tagline: 'Adventure Moves Fast.',
      img: '../assets/models/Jayco-swift-class-b.png',
      specs: { Sleeps: 'Up to 2', Length: '21 ft', Chassis: 'Ram ProMaster' },
      floorplans: [ fp('20E', 0, 2, '20′ 11″', 0), fp('20T', 0, 2, '20′ 11″', 0) ],
    },
    'terrain': {
      name: 'Terrain', category: 'class-b', year: 2027, basePrice: 203625,
      tagline: 'Go anywhere. Stay comfortable.',
      img: '../assets/models/Jayco-terrain-class-b.png',
      specs: { Sleeps: 'Up to 4', Length: '24 ft', Chassis: 'Mercedes Sprinter 4x4' },
      floorplans: [ fp('19AG - Generator', 0, 0, '23′ 6″', 0), fp('19YG - Generator', 19493, 0, '', 0), fp('19A - Lithium', 22500, 0, '23′ 6″', 0) ],
    },

    /* ===== CLASS C ===== */
    'redhawk-se': {
      name: 'Redhawk SE', category: 'class-c', year: 2027, basePrice: 123068,
      tagline: 'Family motorhome value.',
      img: '../assets/models/Jayco-redhawk-class-c.png',
      specs: { Sleeps: 'Up to 7', Length: '22–33 ft', Chassis: 'Ford E-450' },
      floorplans: [ fp('20LF - Ford Chassis', 0, 4, '21′ 11″', 0), fp('22E - Chevrolet Chassis - Limited Availability', 2400, 4, '25′ 2″', 1), fp('22EF - Ford Chassis', 2400, 4, '24′ 8″', 0) ],
    },
    'redhawk': {
      name: 'Redhawk', category: 'class-c', year: 2027, basePrice: 157043,
      tagline: 'More space, more standard.',
      img: '../assets/models/jayco-redhawk-2027.png',
      specs: { Sleeps: 'Up to 5', Length: '27–29 ft', Chassis: 'Ford E-450' },
      floorplans: [ fp('24B', 0, 5, '26′ 8″', 1), fp('26M', 3375, 5, '28′ 8″', 1) ],
    },
    'greyhawk': {
      name: 'Greyhawk', category: 'class-c', year: 2027, basePrice: 172793,
      tagline: 'Go Further. Live Greater.',
      img: '../assets/models/Jayco-greyhawk-class-c.png',
      specs: { Sleeps: 'Up to 7', Length: '30–33 ft', Chassis: 'Ford E-450' },
      floorplans: [ fp('27U', 0, 5, '29′ 11″', 1), fp('29MV', 375, 5, '32′ 6″', 1), fp('31F', 2175, 7, '32′ 6″', 1) ],
    },
    'greyhawk-xl': {
      name: 'Greyhawk XL', category: 'class-c', year: 2027, basePrice: 277050,
      tagline: 'Extra length, extra living.',
      img: '../assets/models/Jayco-greyhawk-sl-class-c.png',
      specs: { Sleeps: 'Up to 7', Length: '33–35 ft', Chassis: 'Ford E-450' },
      floorplans: [ fp('32U', 0, 5, '33′ 5″', 1), fp('33F', 7500, 7, '34′ 11″', 1) ],
    },
    'seneca-xt': {
      name: 'Seneca XT', category: 'super-c', year: 2027, basePrice: 343875,
      tagline: 'Diesel Super C, right-sized.',
      img: '../assets/models/Jayco-seneca-xt-super-c.png',
      specs: { Sleeps: 'Up to 5', Length: '34–37 ft', Chassis: 'Freightliner S2RV' },
      floorplans: [ fp('32U', 0, 4, '34′ 3″', 0), fp('35L', 5175, 5, '37′ 4″', 0) ],
    },
    'seneca': {
      name: 'Seneca', category: 'super-c', year: 2027, basePrice: 380693,
      tagline: 'The Super C standard.',
      img: '../assets/models/jayco-seneca-2027.png',
      specs: { Sleeps: 'Up to 9', Length: '39 ft', Chassis: 'Freightliner S2RV' },
      floorplans: [ fp('37K', 0, 6, '39′ 4″', 1), fp('37L', 3307, 9, '39′ 4″', 1), fp('37M', 6607, 8, '39′ 4″', 1) ],
    },
    'seneca-prestige': {
      name: 'Seneca Prestige', category: 'super-c', year: 2027, basePrice: 431100,
      tagline: 'The pinnacle of Super C luxury.',
      img: '../assets/models/Jayco-seneca-super-c.png',
      specs: { Sleeps: 'Up to 8', Length: '39–40 ft', Chassis: 'Freightliner S2RV' },
      floorplans: [ fp('37K', 0, 0, '', 0), fp('37L', 9000, 0, '', 0), fp('37M', 9000, 0, '', 0) ],
    },

    /* ===== CLASS A ===== */
    'alante-se': {
      name: 'Alante SE', category: 'class-a', year: 2027, basePrice: 161693,
      tagline: 'Class A living, approachable price.',
      img: '../assets/models/Jayco-alante-se-class-a.png',
      specs: { Sleeps: 'Up to 5', Length: '30 ft', Chassis: 'Ford F-53' },
      floorplans: [ fp('27ASE', 0, 5, '29′ 11″', 1) ],
    },
    'alante': {
      name: 'Alante', category: 'class-a', year: 2027, basePrice: 187043,
      tagline: 'Big Adventures Start Here.',
      img: '../assets/models/Jayco-alante-class-a.png',
      specs: { Sleeps: 'Up to 7', Length: '30–32 ft', Chassis: 'Ford F-53' },
      floorplans: [ fp('27A', 0, 5, '29′ 11″', 1), fp('29S', 3300, 5, '31′ 4″', 1), fp('29F', 3450, 7, '32′ 2″', 1) ],
    },
    'precept': {
      name: 'Precept', category: 'class-a', year: 2027, basePrice: 227693,
      tagline: 'Drive with confidence and class.',
      img: '../assets/models/jayco-precept-2027.png',
      specs: { Sleeps: 'Up to 9', Length: '33–39 ft', Chassis: 'Ford F-53' },
      floorplans: [ fp('31UL', 0, 7, '33′ 0″', 1), fp('34B', 3750, 6, '36′ 11″', 1), fp('34G', 9765, 7, '36′ 6″', 1) ],
    },
    'precept-prestige': {
      name: 'Precept Prestige', category: 'class-a', year: 2027, basePrice: 265725,
      tagline: 'Class A luxury, fully loaded.',
      img: '../assets/models/Jayco-precept-class-a.png',
      specs: { Sleeps: 'Up to 9', Length: '38–39 ft', Chassis: 'Ford F-53' },
      floorplans: [ fp('36U', 0, 6, '38′ 2″', 1), fp('36B', 4193, 9, '38′ 8″', 1), fp('36H', 6293, 7, '38′ 8″', 1) ],
    },
  };

  return { categories, models };
})();

/* ---------------------------------------------------
   Which slugs have a real model.html page.

   The records themselves live in model-data.js, which is 64KB to describe two
   models and is deliberately loaded by model.html alone — index.html and
   type.html both say so where they omit it. But every page that links to a
   model needs to know whether model.html?model=<slug> is a real destination or
   a dead one, and that question is a list of strings, not 64KB.

   So it lives here, in the library every page already loads. Add a slug when
   you add a detail record. model-data.js checks this list against its own keys
   the moment it loads and warns in the console if the two have drifted, so the
   duplication cannot go quietly wrong.
   --------------------------------------------------- */
window.JAYCO_MODEL_PAGES = ['swift', 'jay-feather', 'greyhawk'];

/* ---------------------------------------------------
   Which floorplans have a Matterport walkthrough.

   Jayco's own scans, harvested from the "360°" button on each floorplan page
   at jayco.com. Only the capture id is stored — the host is written once, in
   JAYCO_TOUR_URL below, so a change of platform is one edit rather than
   a hundred and thirty-five.

   Re-harvested 2026-09-24 from all 209 jayco.com floorplan pages: 135 of our
   181 plans have a scan. A plan missing here has no 360° button on jayco.com.
   Pinnacle 39FBRL's page carries two scans; this is the one its page embeds.

   It lives HERE, in the light library every page loads, for the same reason
   JAYCO_MODEL_PAGES does: two pages need the answer and only one of them loads
   model-data.js. The model page renders these as its "View 360° Tour" button
   and the configurator as the 3D control on the floorplan card; keeping the
   ids in model-data.js would have meant either a second copy in build-data.js
   or 64KB of model records loaded into build-price.html to reach a string.

   Keyed model slug first, because plan codes are not unique across the lineup
   — several models publish a 24FK. Plan ids are lowercased to match
   build-data.js; JAYCO_TOUR_URL lowercases what it is given, so callers can
   pass either case.
   --------------------------------------------------- */
window.JAYCO_TOURS = {
  'alante': {
    '29s': '7dkZsAyJr2U',
  },
  'alante-se': {
    '27ase': 'AQ2PH3E6jvK',
  },
  'eagle-fw': {
    '29rlc': 'Sy3LUEtxCX7',
    '31qbh': 'Eihhg2F9kLN',
    '28rlt': 'w1dDsCAYeHs',
    '31rlt': 'N36RNrSJfgq',
    '321rsts': '7L1FrKVRFTA',
    '335lsts': 'hCSMdq6QmTN',
    '365ukts': '2jvZyMMb42k',
    '367tbts': 'QacZx989bVD',
    '355mbqs': '8cbivC8fbLi',
  },
  'eagle-sle-fw': {
    '24mle': 'Rvb3yPNBTRe',
    '28bhu': 'i7unw7HC3af',
    '28rks': 'TFo2eF4uBVb',
    '30rlt': 'bYy7NHy7YMe',
  },
  'eagle-tt': {
    '265fkds': 'v2pKWFeXpgo',
    '294ckbs': 'GhP4vpTJCzf',
    '312bhok': 'eNqyTaxP1Rd',
    '320mkts': '1Wpip88xMKz',
  },
  'greyhawk': {
    '27u': 'MS4auzGZkd9',
    '30z-csa': '5DPntrZM8iX',
  },
  'greyhawk-xl': {
    '32u': 'WBuefPPPoat',
  },
  'jay-feather': {
    '18rbf': 'ZXK81dW5BzW',
    '19mrk': 'dPPsKuKYr2W',
    '21mml': 'Ujr3WT8Vnxn',
    '21mbh': '5uijhpVu1ym',
    '23rk': '9GR5kfu29CF',
    '25rb': 'nHT6XTvNyAz',
    '25bh': 'hC84MC3emEz',
    '23mbd': 'LPDBt7fkUpn',
    '24fk': 'LuiPLPmW6Ed',
    '27bh': 'nmzZHq3wCT4',
    '29bhb': 'kuEjvCcL8Tg',
    '27mk': 'j7i3th8UMmS',
    '26fk': 'hGZZv1CeN5P',
    '30rkb': '4GuJB9u464t',
    '29qbh': 'guqqhXsbD9z',
    '33bh': '7V2pTdRB6sG',
  },
  'jay-feather-air': {
    '15mrb': 'kQRb9sb3AZD',
    '16db': 'ehnu7bWQRXD',
    '16rb': 'EStZ839yGcp',
    '19mbs': '4Sk4x6ywBdf',
    '18fbs': 'xdVmfReAgpL',
  },
  'jay-feather-air-sl': {
    '15tbsl': 'oQaDiwZATHK',
    '17bhsl': '4cFGbcFp7bu',
  },
  'jay-feather-sl': {
    '25rlsl': 'ctKqaZxdFyS',
    '26bhsl': 'hMLjXoqrQYf',
  },
  'jay-flight': {
    '130bh': 'cde7bRujaSS',
    '130rd-': 'qV3t11P5PmE',
    '140tb': '9BWRDUGAroG',
    '170bh': 'cNKiU64xKtN',
    '170fq': 'suHzbBK4Umk',
    '130bhw': 'cde7bRujaSS',
    '130rdw': 'qV3t11P5PmE',
    '140tbw': '9BWRDUGAroG',
    '172db': 'CNYem9ksAZD',
    '170bhw': 'cNKiU64xKtN',
    '170fqw': 'suHzbBK4Umk',
    '172dbw': 'CNYem9ksAZD',
    '175bh': 'jzuV82yL8ME',
    '175fq': 'GjQUB2NA433',
    '178dbs': 'E7CeyWJAi2k',
    '250bh': 'PKp2ob6274U',
    '175bhw': 'jzuV82yL8ME',
    '175fqw': 'GjQUB2NA433',
    '178dbsw': 'E7CeyWJAi2k',
    '250bhw': 'xLkkMbCq6c9',
    '180lk': 'SYUGrHL94wc',
    '197mb': '99VKKUr61p1',
    '180lkw': 'SYUGrHL94wc',
    '197mbw': '99VKKUr61p1',
    '210qb': 'HwHJn12pCzZ',
    '260bh': 'xpJKxCy6ZM4',
    '270bhs': 'ukmPYFX68d1',
    '210qbw': 'HwHJn12pCzZ',
    '260bhw': 'xpJKxCy6ZM4',
    '200mks': 'xLkkMbCq6c9',
    '245bhs': 'HD3iE8v97SE',
    '261bhs': 'BefqDc9qav3',
    '262rls': 'SRtvhbr6fWQ',
    '200mksw': 'xLkkMbCq6c9',
    '265mws': 'YcK9UExAFrx',
    '225mls': 'pphZC68nRH3',
    '263bhs': 'WzxazF8xUzQ',
    '245bhsw': 'HD3iE8v97SE',
    '265th': 'ZYoPjk9SnoW',
    '261bhsw': 'BefqDc9qav3',
    '262rlsw': 'SRtvhbr6fWQ',
    '265mwsw': 'YcK9UExAFrx',
    '225mlsw': 'pphZC68nRH3',
    '263bhsw': 'WzxazF8xUzQ',
    '280bhs': 'Tk62BZT7kBV',
    '330tbs': 'w9aM7TxxNh1',
    '295tbs': 'TxeWVqDVesF',
    '321bds': 'SLBtifqcGUD',
    '290rls': 'ijaRmE7MhGB',
    '325bht': 'pB4KocDqeUy',
    '380dqs': 'nsnz5tYDPvN',
    '333bts': 'oiAk7yWzudh',
    '334rts': 'uaRv4MHDfAQ',
    '270bhsw': 'ukmPYFX68d1',
    '280bhsw': 'Tk62BZT7kBV',
    '335bhs': 'znM6o6Ncf1N',
  },
  'jay-flight-bungalow': {
    '401flts': '4igxLCoJHjB',
    '401loft': 'VivCHiqmpZ2',
    '404loft': 'S1MaZ5WJCsH',
    '402rlts': 'mjpky4JDA2p',
  },
  'north-point': {
    '310rlts': '5RiBViJpYpy',
    '365rkts': 's8JkkSd7cww',
    '381ckre': 'buHQaByaAAm',
    '395dsdb': 'WEKGEZS9GRt',
    '361rlbh': 'G4JK1r3jiTQ',
    '375tbdb': 'kPZFfHfQwc4',
    '391tbbh': 'aew7AcrmHWE',
  },
  'pinnacle': {
    '32rlts': 'Q4BvCEMq3Jf',
    '36fbts': 'vntDm1Fipsn',
    '38fbrk': 'UN4ovD6GsMi',
    '38ssws': 'A5evBQfBkX5',
    '39dsdb': 'LfVzy6JYXpf',
    '39flok': 'LY5bkRywpfD',
    '39fbrl': '96dyCqkTm9i',
  },
  'precept': {
    '31ul': 'tmJkuzq7FsH',
    '36c': 'X6NFN2Rhc3V',
  },
  'redhawk': {
    '24b': 'T8XQTgbMAmr',
    '26m': 'ECWniaFTg64',
  },
  'seismic-fw': {
    '399': 'yjhLXbCxX18',
    '413': '8k6Jfddv98p',
  },
  'seismic-tt': {
    '214': '6SS8xyum5Mv',
  },
  'seneca': {
    '37k': 'YtrpmD7sDpW',
    '37l': 'MEnwWzf6nhm',
    '37m': 'zfLFuxXrH9q',
  },
  'seneca-prestige': {
    '37k': 'Zbsuzj6bX9d',
    '37l': 'T4r3BKBSNeR',
    '37m': 'FnttGyCwsxt',
  },
  'swift': {
    '20t': 'PgNjsbhY4xw',
  },
};

/* The one place the tour URL is built. Returns null for a plan with no scan,
   which is what both callers test — a missing tour is the common case, not an
   error. */
window.JAYCO_TOUR_URL = function (slug, planId) {
  const plans = (window.JAYCO_TOURS || {})[slug];
  const id = plans && planId != null && plans[String(planId).toLowerCase()];
  return id ? 'https://my.matterport.com/show/?m=' + id : null;
};
