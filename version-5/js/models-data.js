/* ===================================================
   Jayco — Build & Price data
   ---------------------------------------------------
   SINGLE SOURCE OF TRUTH for the configurator.
   Swap these values for exact factory data any time —
   no UI code needs to change.

   DATA PROVENANCE
   • categories, model names, model years, and basePrice
     are REAL 2027 MSRP "Starting at" figures from jayco.com.
   • Floorplans are REAL Jayco plan codes for the six hero
     models (North Point, Pinnacle, Jay Feather, Swift,
     Greyhawk, Alante). Every other model carries 2–3
     REPRESENTATIVE floorplans as a seed — extend from each
     model's jayco.com page when you want full coverage.
   • Exterior paint, interior décor, and package PRICE DELTAS
     are realistic placeholders. Jayco uses no-haggle dealer
     pricing and does not publish per-option MSRP deltas, so
     these are standardized per towable/motorized line. Names
     mirror real Jayco options where possible.
   =================================================== */

window.JAYCO = (function () {
  'use strict';

  /* ---- Shared option sets (referenced by category type) ---- */
  const palettes = {
    /* Towable exterior graphics / sidewall accents */
    towableExterior: [
      { id: 'juniper',   name: 'Juniper',    hex: '#6B7A5E', price: 0 },
      { id: 'stone-gray',name: 'Stone Gray', hex: '#8C8A85', price: 0 },
      { id: 'sandstone', name: 'Sandstone',  hex: '#C9B79C', price: 395 },
      { id: 'midnight',  name: 'Midnight',   hex: '#2C3038', price: 395 },
      { id: 'espresso',  name: 'Espresso',   hex: '#4A3B31', price: 395 },
    ],
    /* Motorized full-body paint schemes */
    motorizedExterior: [
      { id: 'glacier',      name: 'Glacier',       hex: '#E7E4DE', price: 0 },
      { id: 'graphite',     name: 'Graphite',      hex: '#3A3D42', price: 0 },
      { id: 'bronze',       name: 'Bronze',        hex: '#7A5C3E', price: 1995 },
      { id: 'sapphire',     name: 'Sapphire',      hex: '#2A4A6B', price: 1995 },
      { id: 'copper-canyon',name: 'Copper Canyon', hex: '#8C5A3C', price: 1995 },
    ],
    /* Towable interior décor */
    interiorTowable: [
      { id: 'farmhouse', name: 'Modern Farmhouse', hex: '#D8CFC0', price: 0 },
      { id: 'stone',     name: 'Stone',            hex: '#B3A897', price: 0 },
      { id: 'slate',     name: 'Slate',            hex: '#4A4E54', price: 0 },
      { id: 'driftwood', name: 'Driftwood',        hex: '#9A8B77', price: 0 },
    ],
    /* Motorized interior décor */
    interiorMotorized: [
      { id: 'cognac',       name: 'Cognac Leather', hex: '#7A4B2E', price: 0 },
      { id: 'stone-gray-in',name: 'Stone Gray',     hex: '#8C8880', price: 0 },
      { id: 'charcoal',     name: 'Charcoal',       hex: '#3C3B39', price: 0 },
      { id: 'natural-linen',name: 'Natural Linen',  hex: '#CDBFA6', price: 895 },
    ],
    /* Towable option packages */
    packagesTowable: [
      { id: 'customer-value',  name: 'Customer Value Package', desc: 'Power awning, upgraded appliances & convenience group.', price: 0,    recommended: true },
      { id: 'overlander-solar',name: 'Overlander Solar Package',desc: '190W roof solar with charge controller & inverter prep.', price: 1495 },
      { id: 'jaycommand',      name: 'JAYCOMMAND Smart RV',     desc: 'App-based control of lighting, climate, tanks & more.', price: 1295 },
      { id: 'all-weather',     name: 'All-Weather Package',     desc: 'Heated & enclosed underbelly with ducted furnace.', price: 895 },
      { id: 'exterior-kitchen',name: 'Exterior Kitchen',        desc: 'Slide-out griddle, sink & storage.', price: 650 },
      { id: 'second-ac',       name: 'Second A/C Unit',         desc: '15,000 BTU roof-mounted second air conditioner.', price: 1150 },
    ],
    /* Motorized option packages */
    packagesMotorized: [
      { id: 'customer-value-m', name: 'Customer Value Package',    desc: 'Convenience, comfort & appearance upgrade group.', price: 0,    recommended: true },
      { id: 'jayride',          name: 'JAYRIDE Chassis Package',   desc: 'Sway control, upgraded shocks & steering stabilizer.', price: 1895, recommended: true },
      { id: 'solar-inverter',   name: 'Solar & Inverter Package',  desc: '200W solar with 2000W pure-sine inverter.', price: 2495 },
      { id: 'adaptive-safety',  name: 'Adaptive Safety Suite',     desc: 'Adaptive cruise, lane-departure & collision mitigation.', price: 1650 },
      { id: 'theater-seating',  name: 'Theater Seating',           desc: 'Dual reclining power theater seats.', price: 995 },
      { id: 'ext-entertainment',name: 'Exterior Entertainment',    desc: 'Weatherproof TV, speakers & second refrigerator.', price: 1250 },
    ],
  };

  /* ---- Categories (type drives which palettes apply) ---- */
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
      specs: { Sleeps: 'Up to 10', Length: '21’33 ft', 'Dry Weight': '3,970–7,600 lbs' },
      floorplans: [ fp('195RB', 0, 4, '21′ 8″', 1), fp('264BH', 1850, 8, '30′ 6″', 1), fp('287BHS', 2650, 10, '33′ 7″', 2) ],
    },
    'jay-feather-air-sl': {
      name: 'Jay Feather Air SL', category: 'travel-trailers', year: 2027, basePrice: 20618,
      tagline: 'Ultra-light. Ready for anything.',
      img: '../assets/models/Jayco-jay-feather-air-travel-trailer.png',
      specs: { Sleeps: 'Up to 5', Length: '19–23 ft', 'Dry Weight': '3,300–4,100 lbs' },
      floorplans: [ fp('16BH', 0, 5, '19′ 11″', 0), fp('19RBM', 1200, 3, '22′ 6″', 0) ],
    },
    'jay-feather-air': {
      name: 'Jay Feather Air', category: 'travel-trailers', year: 2027, basePrice: 30968,
      tagline: 'Light towing, full comfort.',
      img: '../assets/models/Jayco-jay-feather-air-travel-trailer.png',
      specs: { Sleeps: 'Up to 7', Length: '22–27 ft', 'Dry Weight': '4,200–5,300 lbs' },
      floorplans: [ fp('21MML', 0, 5, '25′ 6″', 1), fp('24BH', 1650, 7, '28′ 2″', 1) ],
    },
    'jay-feather-sl': {
      name: 'Jay Feather SL', category: 'travel-trailers', year: 2027, basePrice: 37943,
      tagline: 'Small footprint, big feel.',
      img: '../assets/models/Jayco-jay-feather-travel-trailer.png',
      specs: { Sleeps: 'Up to 5', Length: '22–25 ft', 'Dry Weight': '4,600–5,200 lbs' },
      floorplans: [ fp('171BH', 0, 4, '22′ 1″', 0), fp('183RB', 1100, 3, '24′ 4″', 1) ],
    },
    'jay-feather': {
      name: 'Jay Feather', category: 'travel-trailers', year: 2027, basePrice: 37493,
      tagline: 'Travel Light. Live Fully.',
      img: '../assets/models/Jayco-jay-feather-travel-trailer.png',
      specs: { Sleeps: 'Up to 7', Length: '20–30 ft', 'Dry Weight': '4,300–6,000 lbs' },
      floorplans: [ fp('19MRK', 0, 2, '22′ 11″', 0), fp('21MML', 1250, 4, '25′ 6″', 1), fp('24RL', 2400, 4, '28′ 11″', 1), fp('27BHB', 3200, 7, '32′ 11″', 1) ],
    },
    'eagle-tt': {
      name: 'Eagle Travel Trailers', category: 'travel-trailers', year: 2027, basePrice: 51368,
      tagline: 'Residential luxury you can tow.',
      img: '../assets/models/Jayco-eagle-travel-trailer.png',
      specs: { Sleeps: 'Up to 8', Length: '32–36 ft', 'Dry Weight': '7,200–8,300 lbs' },
      floorplans: [ fp('284BHOK', 0, 8, '33′ 4″', 2), fp('294RKDS', 1900, 4, '35′ 6″', 2) ],
    },

    /* ===== DESTINATION ===== */
    'jay-flight-bungalow': {
      name: 'Jay Flight Bungalow', category: 'destination', year: 2027, basePrice: 66368,
      tagline: 'Home base for the long stay.',
      img: '../assets/models/Jayco-bungalow-destination-trailer.png',
      specs: { Sleeps: 'Up to 8', Length: '37–40 ft', 'Dry Weight': '9,100–9,900 lbs' },
      floorplans: [ fp('40BHQS', 0, 8, '40′ 3″', 3), fp('40LOFT', 2100, 8, '40′ 3″', 3), fp('40RLTS', 1600, 4, '40′ 3″', 3) ],
    },

    /* ===== FIFTH WHEELS ===== */
    'eagle-sle-fw': {
      name: 'Eagle SLE Fifth Wheel', category: 'fifth-wheels', year: 2027, basePrice: 52643,
      tagline: 'Lighter tow. Eagle comfort.',
      img: '../assets/models/Jayco-eagle-sle-fifth-wheel.png',
      specs: { Sleeps: 'Up to 6', Length: '33–36 ft', 'Dry Weight': '9,400–10,300 lbs' },
      floorplans: [ fp('261RBOK', 0, 4, '33′ 1″', 2), fp('284CKTS', 1750, 6, '34′ 9″', 2) ],
    },
    'eagle-fw': {
      name: 'Eagle Fifth Wheels', category: 'fifth-wheels', year: 2027, basePrice: 68993,
      tagline: 'The benchmark for luxury fifth wheels.',
      img: '../assets/models/Jayco-eagle-fifth-wheel.png',
      specs: { Sleeps: 'Up to 7', Length: '35–41 ft', 'Dry Weight': '11,000–12,800 lbs' },
      floorplans: [ fp('317RLOK', 0, 4, '35′ 11″', 3), fp('355MBQS', 2600, 6, '41′ 5″', 4) ],
    },
    'north-point': {
      name: 'North Point', category: 'fifth-wheels', year: 2027, basePrice: 112425,
      tagline: 'Luxury That Leads the Way.',
      img: '../assets/models/Jayco-north-point-fifth-wheel.png',
      specs: { Sleeps: 'Up to 9', Length: '36–45 ft', 'Unloaded Weight': '13,375–16,195 lbs' },
      floorplans: [ fp('310RLTS', 0, 4, '35′ 11″', 3), fp('377RLBH', 3600, 8, '42′ 3″', 5), fp('382FLRB', 4200, 6, '42′ 5″', 5), fp('390CKDS', 5400, 6, '43′ 9″', 5) ],
    },
    'pinnacle': {
      name: 'Pinnacle', category: 'fifth-wheels', year: 2027, basePrice: 140568,
      tagline: 'The Height of Life on the Road.',
      img: '../assets/models/Jayco-pinnacle-fifth-wheel.png',
      specs: { Sleeps: 'Up to 6', Length: '36–41 ft', 'Unloaded Weight': '13,900–15,700 lbs' },
      floorplans: [ fp('32RLTS', 0, 4, '36′ 0″', 4), fp('36FBTS', 3400, 4, '39′ 11″', 5), fp('36SSWS', 3900, 6, '39′ 11″', 5), fp('38FLWS', 5200, 6, '41′ 3″', 5) ],
    },

    /* ===== TOY HAULERS ===== */
    'seismic-tt': {
      name: 'Seismic Travel Trailer Toy Hauler', category: 'toy-haulers', year: 2027, basePrice: 67868,
      tagline: 'Haul your toys in style.',
      img: '../assets/models/Jayco-seismic-toy-hauler.png',
      specs: { Sleeps: 'Up to 7', Length: '33–38 ft', 'Dry Weight': '9,600–11,200 lbs' },
      floorplans: [ fp('3512', 0, 6, '38′ 11″', 2), fp('3413', 1400, 7, '37′ 6″', 2) ],
    },
    'seismic-fw': {
      name: 'Seismic Fifth Wheel Toy Hauler', category: 'toy-haulers', year: 2027, basePrice: 119280,
      tagline: 'Garage, home & command center.',
      img: '../assets/models/Jayco-seismic-toy-hauler.png',
      specs: { Sleeps: 'Up to 8', Length: '41–44 ft', 'Dry Weight': '15,900–17,400 lbs' },
      floorplans: [ fp('403', 0, 6, '43′ 11″', 3), fp('4113', 2900, 8, '44′ 5″', 4) ],
    },

    /* ===== CLASS B ===== */
    'comet': {
      name: 'Comet', category: 'class-b', year: 2027, basePrice: 131175,
      tagline: 'Compact camper van, endless range.',
      img: '../assets/models/Jayco-comet-class-b.png',
      specs: { Sleeps: 'Up to 2', Length: '19–21 ft', Chassis: 'Ram ProMaster' },
      floorplans: [ fp('20A', 0, 2, '20′ 11″', 0), fp('20T', 900, 2, '20′ 11″', 0) ],
    },
    'swift': {
      name: 'Swift', category: 'class-b', year: 2027, basePrice: 150300,
      tagline: 'Adventure Moves Fast.',
      img: '../assets/models/Jayco-swift-class-b.png',
      specs: { Sleeps: 'Up to 2', Length: '20–21 ft', Chassis: 'Ram ProMaster' },
      floorplans: [ fp('20E', 0, 2, '20′ 11″', 0), fp('20T', 0, 2, '20′ 11″', 0) ],
    },
    'terrain': {
      name: 'Terrain', category: 'class-b', year: 2027, basePrice: 203625,
      tagline: 'Go anywhere. Stay comfortable.',
      img: '../assets/models/Jayco-terrain-class-b.png',
      specs: { Sleeps: 'Up to 4', Length: '24 ft', Chassis: 'Mercedes Sprinter 4x4' },
      floorplans: [ fp('24E', 0, 4, '24′ 0″', 0), fp('24M', 1250, 2, '24′ 0″', 0) ],
    },

    /* ===== CLASS C ===== */
    'redhawk-se': {
      name: 'Redhawk SE', category: 'class-c', year: 2027, basePrice: 123068,
      tagline: 'Family motorhome value.',
      img: '../assets/models/Jayco-redhawk-class-c.png',
      specs: { Sleeps: 'Up to 7', Length: '24–32 ft', Chassis: 'Ford E-450' },
      floorplans: [ fp('22A', 0, 4, '24′ 3″', 1), fp('26N', 2200, 7, '28′ 4″', 2) ],
    },
    'redhawk': {
      name: 'Redhawk', category: 'class-c', year: 2027, basePrice: 157043,
      tagline: 'More space, more standard.',
      img: '../assets/models/Jayco-redhawk-class-c.png',
      specs: { Sleeps: 'Up to 8', Length: '26–32 ft', Chassis: 'Ford E-450' },
      floorplans: [ fp('24B', 0, 5, '25′ 11″', 1), fp('31XL', 3400, 8, '32′ 10″', 2) ],
    },
    'greyhawk': {
      name: 'Greyhawk', category: 'class-c', year: 2027, basePrice: 172793,
      tagline: 'Go Further. Live Greater.',
      img: '../assets/models/Jayco-greyhawk-class-c.png',
      specs: { Sleeps: 'Up to 8', Length: '26–33 ft', Chassis: 'Ford E-450' },
      floorplans: [ fp('24B', 0, 5, '26′ 3″', 1), fp('26FK', 2100, 4, '27′ 11″', 2), fp('29MV', 3600, 8, '31′ 8″', 2), fp('31F', 4400, 8, '32′ 10″', 2) ],
    },
    'greyhawk-xl': {
      name: 'Greyhawk XL', category: 'class-c', year: 2027, basePrice: 277050,
      tagline: 'Extra length, extra living.',
      img: '../assets/models/Jayco-greyhawk-sl-class-c.png',
      specs: { Sleeps: 'Up to 9', Length: '32–34 ft', Chassis: 'Ford E-450' },
      floorplans: [ fp('32U', 0, 8, '33′ 4″', 2), fp('34G', 2600, 9, '34′ 8″', 2) ],
    },
    'seneca-xt': {
      name: 'Seneca XT', category: 'super-c', year: 2027, basePrice: 343875,
      tagline: 'Diesel Super C, right-sized.',
      img: '../assets/models/Jayco-seneca-xt-super-c.png',
      specs: { Sleeps: 'Up to 6', Length: '32–33 ft', Chassis: 'Freightliner S2RV' },
      floorplans: [ fp('32M', 0, 6, '33′ 0″', 2), fp('32K', 3200, 4, '33′ 0″', 2) ],
    },
    'seneca': {
      name: 'Seneca', category: 'super-c', year: 2027, basePrice: 380693,
      tagline: 'The Super C standard.',
      img: '../assets/models/Jayco-seneca-super-c.png',
      specs: { Sleeps: 'Up to 8', Length: '37–39 ft', Chassis: 'Freightliner S2RV' },
      floorplans: [ fp('37K', 0, 6, '38′ 6″', 3), fp('37L', 4200, 8, '38′ 6″', 3) ],
    },
    'seneca-prestige': {
      name: 'Seneca Prestige', category: 'super-c', year: 2027, basePrice: 431100,
      tagline: 'The pinnacle of Super C luxury.',
      img: '../assets/models/Jayco-seneca-super-c.png',
      specs: { Sleeps: 'Up to 8', Length: '39–40 ft', Chassis: 'Freightliner S2RV' },
      floorplans: [ fp('37MP', 0, 6, '39′ 2″', 3), fp('37LP', 4800, 8, '39′ 2″', 3) ],
    },

    /* ===== CLASS A ===== */
    'alante-se': {
      name: 'Alante SE', category: 'class-a', year: 2027, basePrice: 161693,
      tagline: 'Class A living, approachable price.',
      img: '../assets/models/Jayco-alante-se-class-a.png',
      specs: { Sleeps: 'Up to 6', Length: '27–30 ft', Chassis: 'Ford F-53' },
      floorplans: [ fp('27A', 0, 4, '28′ 11″', 2), fp('29S', 2400, 6, '30′ 8″', 2) ],
    },
    'alante': {
      name: 'Alante', category: 'class-a', year: 2027, basePrice: 187043,
      tagline: 'Big Adventures Start Here.',
      img: '../assets/models/Jayco-alante-class-a.png',
      specs: { Sleeps: 'Up to 7', Length: '26–32 ft', Chassis: 'Ford F-53' },
      floorplans: [ fp('26X', 0, 4, '27′ 11″', 1), fp('27A', 1600, 4, '28′ 11″', 2), fp('29S', 2800, 6, '30′ 8″', 2), fp('31R', 3600, 7, '32′ 3″', 2) ],
    },
    'precept': {
      name: 'Precept', category: 'class-a', year: 2027, basePrice: 227693,
      tagline: 'Drive with confidence and class.',
      img: '../assets/models/Jayco-precept-class-a.png',
      specs: { Sleeps: 'Up to 8', Length: '31–36 ft', Chassis: 'Ford F-53' },
      floorplans: [ fp('31UL', 0, 6, '32′ 7″', 2), fp('36A', 3900, 8, '37′ 3″', 3) ],
    },
    'precept-prestige': {
      name: 'Precept Prestige', category: 'class-a', year: 2027, basePrice: 265725,
      tagline: 'Class A luxury, fully loaded.',
      img: '../assets/models/Jayco-precept-class-a.png',
      specs: { Sleeps: 'Up to 8', Length: '33–37 ft', Chassis: 'Ford F-53' },
      floorplans: [ fp('34BP', 0, 6, '35′ 5″', 3), fp('36CP', 3400, 8, '37′ 3″', 3) ],
    },
  };

  return { categories, palettes, models };
})();
