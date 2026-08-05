/* ===================================================
   Jayco — Build & Price: per-model build data
   ---------------------------------------------------
   Loaded ONLY by build-price.html. It stays out of
   models-data.js because that file is also served to
   the homepage, which has no use for 181 spec sheets.

   build.js merges this over the base record in
   window.JAYCO.models.

   PROVENANCE — every figure is Jayco's own, harvested
   from jayco.com and not typed by hand.
   • The plan list per model comes from
     jayco.com/sitemap-rvs/ (the /floorplans/ and
     /gallery/ index URLs share the same 3-segment
     shape and had to be excluded, or they scrape as
     empty plans).
   • MSRP, sleeps, length, weights, tanks and the
     option list come from each plan's own page.
   • Drawings are /uploads/rvs/floorplans/<id>-<CODE>.png
     re-encoded to WebP (128MB -> 8.4MB). Each is
     matched to its plan by the Jayco floorplan id in
     the filename, never by parsing the code — both
     175BH and 175BHW exist at different prices.
   • `price` is a DELTA from the model's basePrice in
     models-data.js. Verified: for all 27 models that
     basePrice equals the cheapest plan's MSRP exactly,
     so every delta is >= 0 and basePrice + price is
     the plan's real MSRP.

   TWO DELIBERATE SHAPES
   • Full-body PAINT is hoisted out of the option list
     into `exterior`, because the builder has an
     Exterior step for exactly that. Leaving it in
     options would both bury it and let a build charge
     for two paint jobs at once.
   • `weight` is the UNLOADED vehicle weight and is
     therefore absent on motorhomes, which publish only
     GVWR/GCWR. Labelling those "Dry weight" on a card
     would be wrong; they stay in the full spec sheet.

   WHAT JAYCO HAS NOT PUBLISHED — left absent, never
   invented. build.js renders only the fields present.
   • 20 of 181 plans carry a NEW badge with no price
     -> isNew: true, price null, not selectable.
   • Eagle TT, Eagle SLE FW, Eagle FW and Seismic TT
     publish no option list at all; their Packages &
     Options step says so rather than showing filler.
   • No interior decor is published anywhere on
     jayco.com. Only the Jay Flight has a real swatch
     (supplied by hand). Every other model gets a
     single "As shown" entry, which build.js renders as
     the sole-option panel. Dropping real swatches in
     later is a data-only change.
   =================================================== */

window.JAYCO_BUILD = (function () {
  'use strict';

  /* One folder for every builder drawing, named <model>__<plan>.webp. */
  const F = '../assets/model%20details/builder/floorplans/';
  const D = '../assets/model%20details/builder/decor/';
  const jf = (id, name, price, rest) =>
    Object.assign({ id, name, price, img: F + rest.__m + '__' + id + '.webp' },
                  (delete rest.__m, rest));

  /* ---------- alante : 3 floorplans, 7 options, 1 exterior ---------- */
  const alante = {
    exterior: [
      { id: "as-shown", name: "As shown", price: 0 },
    ],
    /* Jayco's published interior design(s) for this model, from the
       Interior Design panel on each floorplan page. Identical across
       every plan in the model, so it lives at model level. */
    interior: [
      { id: "coastal", name: "Coastal", price: 0, image: D + "alante__coastal.webp" },
      { id: "glendale", name: "Glendale", price: 0, image: D + "alante__glendale.webp" },
    ],
    options: {
      "2319": { name: "Customer Value Package", price: 9923, mandatory: true },
      "2320": { name: "Drop-down overhead bunk in cab area with 750 lb. capacity", price: 3293 },
      "2596": { name: "15 cu. ft. 12V Refrigerator", price: 743 },
      "2321": { name: "Theater seating (29S)", price: 743 },
      "2313": { name: "Coastal", price: 593 },
      "2322": { name: "Smart TV in Bedroom", price: 383 },
      "2323": { name: "Canadian Standards", price: 293 },
    },
    floorplans: [
      jf("27a", "27A", 0, { __m: "alante", sleeps: 5, length: "29' 11\"", slide: true, optionIds: ["2313", "2319", "2320", "2322", "2323", "2596"], specs: { "Weights": { "Gross Vehicle Weight Rating (lbs)": "18,000", "Gross Combined Weight Rating (lbs)": "23,000" }, "Measurements": { "Exterior Length (overall)": "29' 11\"", "Exterior Height (with A/C)": "12' 5\"", "Exterior Width": "8' 5\"", "Exterior Width (with slides out)": "11' 3\"", "Interior Height (main)": "7' 0\"", "Awning Length": "18' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "72.0", "Gray Water Capacity (gals)": "50.0", "Black Tank Capacity (gals)": "49.0", "Propane Unit (lbs)": "56", "Fuel Tank Capacity (gals)": "80" }, "Miscellaneous": { "Sleeps": "up to 5", "Water Heater": "Tankless", "Furnace BTU": "30000", "Tire Size": "245/70R19.5G", "Engine Size": "7.3L 2V DEVCT NA PFI V8", "Exterior Cargo Capacity (cu. ft.)": "78" } } }),
      jf("29s", "29S", 3300, { __m: "alante", sleeps: 5, length: "31' 4\"", slide: true, optionIds: ["2313", "2319", "2320", "2321", "2322", "2323"], specs: { "Weights": { "Gross Vehicle Weight Rating (lbs)": "18,000", "Gross Combined Weight Rating (lbs)": "23,000" }, "Measurements": { "Exterior Length (overall)": "31' 4\"", "Exterior Height (with A/C)": "12' 5\"", "Exterior Width": "8' 5\"", "Exterior Width (with slides out)": "9' 11\"", "Interior Height (main)": "7' 0\"", "Awning Length": "23' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "72.0", "Gray Water Capacity (gals)": "49.0", "Black Tank Capacity (gals)": "50.0", "Propane Unit (lbs)": "56", "Fuel Tank Capacity (gals)": "80" }, "Miscellaneous": { "Sleeps": "up to 5", "Water Heater": "Tankless", "Furnace BTU": "30000", "Tire Size": "245/70R19.5G", "Engine Size": "7.3L 2V DEVCT NA PFI V8", "Exterior Cargo Capacity (cu. ft.)": "88" } } }),
      jf("29f", "29F", 3450, { __m: "alante", sleeps: 7, length: "32' 2\"", slide: true, optionIds: ["2313", "2319", "2320", "2322", "2323", "2596"], specs: { "Weights": { "Gross Vehicle Weight Rating (lbs)": "18,000", "Gross Combined Weight Rating (lbs)": "23,000" }, "Measurements": { "Exterior Length (overall)": "32' 2\"", "Exterior Height (with A/C)": "12' 5\"", "Exterior Width": "8' 5\"", "Exterior Width (with slides out)": "9' 2\"", "Interior Height (main)": "7' 0\"", "Awning Length": "23' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "72.0", "Gray Water Capacity (gals)": "40.0", "Black Tank Capacity (gals)": "49.0", "Propane Unit (lbs)": "56", "Fuel Tank Capacity (gals)": "80" }, "Miscellaneous": { "Sleeps": "up to 7", "Water Heater": "Tankless", "Furnace BTU": "30000", "Tire Size": "245/70R19.5G", "Engine Size": "7.3L 2V DEVCT NA PFI V8", "Exterior Cargo Capacity (cu. ft.)": "124" } } }),
    ],
  };

  /* ---------- alante-se : 1 floorplans, 4 options, 1 exterior ---------- */
  const alante_se = {
    exterior: [
      { id: "as-shown", name: "As shown", price: 0 },
    ],
    /* Jayco publishes no Interior Design panel for this model. */
    interior: [ { id: 'as-shown', name: 'As shown', price: 0 } ],
    options: {
      "2326": { name: "Customer Value Package", price: 15600, mandatory: true },
      "2327": { name: "Hydraulic Leveling Jacks", price: 3893 },
      "2437": { name: "Dual A/C's", price: 1193 },
      "2595": { name: "Canadian Standards", price: 293 },
    },
    floorplans: [
      jf("27ase", "27ASE", 0, { __m: "alante-se", sleeps: 5, length: "29' 11\"", slide: true, optionIds: ["2326", "2327", "2595", "2437"], specs: { "Weights": { "Gross Vehicle Weight Rating (lbs)": "18,000", "Gross Combined Weight Rating (lbs)": "23,000" }, "Measurements": { "Exterior Length (overall)": "29' 11\"", "Exterior Height (with A/C)": "12' 5\"", "Exterior Width": "8' 5\"", "Exterior Width (with slides out)": "11' 3\"", "Interior Height (main)": "7' 0\"", "Awning Length": "18' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "72.0", "Gray Water Capacity (gals)": "50.0", "Black Tank Capacity (gals)": "49.0", "Propane Unit (lbs)": "56", "Fuel Tank Capacity (gals)": "80" }, "Miscellaneous": { "Sleeps": "up to 5", "Water Heater": "Tankless", "Furnace BTU": "30000", "Tire Size": "245/70R19.5G", "Engine Size": "7.3L 2V DEVCT NA PFI V8", "Exterior Cargo Capacity (cu. ft.)": "78" } } }),
    ],
  };

  /* ---------- comet : 1 floorplans, 2 options, 1 exterior ---------- */
  const comet = {
    exterior: [
      { id: "as-shown", name: "As shown", price: 0 },
    ],
    /* Jayco's published interior design(s) for this model, from the
       Interior Design panel on each floorplan page. Identical across
       every plan in the model, so it lives at model level. */
    interior: [
      { id: "acadia", name: "Acadia", price: 0, image: D + "comet__acadia.webp" },
    ],
    options: {
      "2567": { name: "Customer Value Package", price: 13350, mandatory: true },
      "2568": { name: "Option - 200W Solar Panel", price: 743 },
    },
    floorplans: [
      jf("18c", "18C", 0, { __m: "comet", sleeps: 2, length: "17' 10\"", optionIds: ["2567", "2568"], specs: { "Weights": { "Gross Vehicle Weight Rating (lbs)": "8,550", "Gross Combined Weight Rating (lbs)": "12,000" }, "Measurements": { "Exterior Length (overall)": "17' 10\"", "Exterior Height (with A/C)": "9' 3\"", "Exterior Width": "6' 11\"", "Interior Height (main)": "6' 2\"", "Awning Length": "10' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "21.0", "Gray Water Capacity (gals)": "24.0", "Black Tank Capacity (gals)": "4.8", "Fuel Tank Capacity (gals)": "24" }, "Miscellaneous": { "Sleeps": "up to 2", "Tire Size": "LT225/75R 16E", "Engine Size": "3.6L V6 Gas" } } }),
    ],
  };

  /* ---------- eagle-fw : 11 floorplans, 0 options, 1 exterior ---------- */
  const eagle_fw = {
    exterior: [
      { id: "as-shown", name: "As shown", price: 0 },
    ],
    /* Jayco's published interior design(s) for this model, from the
       Interior Design panel on each floorplan page. Identical across
       every plan in the model, so it lives at model level. */
    interior: [
      { id: "calli-linen", name: "Calli Linen", price: 0, image: D + "eagle-fw__calli-linen.webp" },
    ],
    options: {},   /* Jayco publishes no option list for this model */
    floorplans: [
      jf("29ddb", "29DDB", 0, { __m: "eagle-fw", sleeps: 6, length: "33' 5\"", weight: "9,160", slide: true, specs: { "Weights": { "Dry Hitch Weight (lbs)": "1,784", "Unloaded Vehicle Weight (lbs)": "9,160", "Cargo Carrying Capacity (lbs)": "1,835", "Gross Vehicle Weight Rating (lbs)": "10,995" }, "Measurements": { "Length": "33' 5\"", "Exterior Height": "11' 9\"", "Exterior Height (with A/C)": "12' 8\"", "Exterior Height (with 2nd A/C)": "13' 2\"", "Exterior Width": "8' 0\"", "Exterior Width (with slides out)": "11' 0\"", "Interior Height (main)": "8' 5\"", "Interior Height (upper deck)": "6' 2\"", "Awning Length": "19' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "51.0", "Gray Water Capacity (gals)": "82.0", "Black Tank Capacity (gals)": "45.0", "Propane Unit (lbs)": "60" }, "Miscellaneous": { "Sleeps": "up to 6", "Water Heater": "Tankless", "# of outside storage compartments": "3", "Furnace BTU": "35000", "Tire Size": "ST225/75R15'E'" } } }),
      jf("29rlc", "29RLC", 750, { __m: "eagle-fw", sleeps: 4, length: "32' 11\"", weight: "9,420", slide: true, specs: { "Weights": { "Dry Hitch Weight (lbs)": "1,745", "Unloaded Vehicle Weight (lbs)": "9,420", "Cargo Carrying Capacity (lbs)": "1,780", "Gross Vehicle Weight Rating (lbs)": "11,200" }, "Measurements": { "Length": "32' 11\"", "Exterior Height": "12' 3\"", "Exterior Height (with A/C)": "12' 3\"", "Exterior Height (with 2nd A/C)": "13' 1\"", "Exterior Width": "8' 0\"", "Exterior Width (with slides out)": "13' 0\"", "Interior Height (main)": "8' 5\"", "Interior Height (upper deck)": "6' 3\"", "Awning Length": "15' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "51.0", "Gray Water Capacity (gals)": "82.0", "Black Tank Capacity (gals)": "45.0", "Propane Unit (lbs)": "60" }, "Miscellaneous": { "Sleeps": "up to 4", "Water Heater": "Tankless", "# of outside storage compartments": "2", "Furnace BTU": "35000", "Tire Size": "ST225/75R15'E'" } } }),
      jf("31qbh", "31QBH", 6000, { __m: "eagle-fw", sleeps: 7, length: "35' 5\"", weight: "9,690", slide: true, specs: { "Weights": { "Dry Hitch Weight (lbs)": "1,965", "Unloaded Vehicle Weight (lbs)": "9,690", "Cargo Carrying Capacity (lbs)": "2,010", "Gross Vehicle Weight Rating (lbs)": "11,700" }, "Measurements": { "Length": "35' 5\"", "Exterior Height": "10' 7\"", "Exterior Height (with A/C)": "12' 0\"", "Exterior Height (with 2nd A/C)": "13' 1\"", "Exterior Width": "8' 1\"", "Exterior Width (with slides out)": "11' 1\"", "Interior Height (main)": "6' 2\"", "Awning Length": "19' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "51.0", "Gray Water Capacity (gals)": "82.0", "Black Tank Capacity (gals)": "45.0", "Propane Unit (lbs)": "60" }, "Miscellaneous": { "Sleeps": "up to 7", "Water Heater": "Tankless", "# of outside storage compartments": "3", "Furnace BTU": "35000", "Tire Size": "ST225/75R15'E'" } } }),
      jf("28rlt", "28RLT", 6750, { __m: "eagle-fw", specs: { "Miscellaneous": { "Water Heater": "Tankless", "# of outside storage compartments": "2", "Furnace BTU": "35000" } } }),
      jf("31rlt", "31RLT", 7500, { __m: "eagle-fw", sleeps: 4, length: "32' 11\"", weight: "9,800", slide: true, specs: { "Weights": { "Dry Hitch Weight (lbs)": "1,900", "Unloaded Vehicle Weight (lbs)": "9,800", "Cargo Carrying Capacity (lbs)": "1,800", "Gross Vehicle Weight Rating (lbs)": "11,600" }, "Measurements": { "Length": "32' 11\"", "Exterior Height": "12' 2\"", "Exterior Height (with A/C)": "12' 4\"", "Exterior Height (with 2nd A/C)": "12' 11\"", "Exterior Width": "8' 1\"", "Exterior Width (with slides out)": "13' 0\"", "Interior Height (main)": "8' 5\"", "Interior Height (upper deck)": "6' 3\"", "Awning Length": "15' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "52.0", "Gray Water Capacity (gals)": "82.0", "Black Tank Capacity (gals)": "45.0", "Propane Unit (lbs)": "60" }, "Miscellaneous": { "Sleeps": "up to 4", "Water Heater": "Tankless", "# of outside storage compartments": "2", "Tire Size": "ST225/75R15'E'" } } }),
      jf("321rsts", "321RSTS", 13984, { __m: "eagle-fw", sleeps: 4, length: "35' 5\"", weight: "10,845", slide: true, specs: { "Weights": { "Dry Hitch Weight (lbs)": "2,080", "Unloaded Vehicle Weight (lbs)": "10,845", "Cargo Carrying Capacity (lbs)": "2,355", "Gross Vehicle Weight Rating (lbs)": "13,200" }, "Measurements": { "Length": "35' 5\"", "Exterior Height": "12' 8\"", "Exterior Height (with A/C)": "12' 7\"", "Exterior Height (with 2nd A/C)": "13' 5\"", "Exterior Width": "8' 1\"", "Exterior Width (with slides out)": "14' 1\"", "Interior Height (main)": "8' 7\"", "Interior Height (upper deck)": "6' 6\"", "Awning Length": "17' 0\"", "Awning Length 2": "10' 6\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "81.0", "Gray Water Capacity (gals)": "87.0", "Black Tank Capacity (gals)": "50.0", "Propane Unit (lbs)": "60" }, "Miscellaneous": { "Sleeps": "up to 4", "Water Heater": "Tankless", "# of outside storage compartments": "2", "Furnace BTU": "35000", "Tire Size": "ST235/80R16'H'" } } }),
      jf("335lsts", "335LSTS", 22867, { __m: "eagle-fw", sleeps: 4, length: "37' 4\"", weight: "11,475", slide: true, specs: { "Weights": { "Dry Hitch Weight (lbs)": "2,360", "Unloaded Vehicle Weight (lbs)": "11,475", "Cargo Carrying Capacity (lbs)": "2,325", "Gross Vehicle Weight Rating (lbs)": "13,800" }, "Measurements": { "Length": "37' 4\"", "Exterior Height": "12' 7\"", "Exterior Height (with A/C)": "12' 10\"", "Exterior Height (with 2nd A/C)": "13' 4\"", "Exterior Width": "8' 1\"", "Exterior Width (with slides out)": "14' 0\"", "Interior Height (main)": "8' 7\"", "Interior Height (upper deck)": "6' 6\"", "Awning Length": "19' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "81.0", "Gray Water Capacity (gals)": "87.0", "Black Tank Capacity (gals)": "50.0", "Propane Unit (lbs)": "60" }, "Miscellaneous": { "Sleeps": "up to 4", "Water Heater": "Tankles", "# of outside storage compartments": "2", "Furnace BTU": "35000", "Tire Size": "ST235/80R16'H'" } } }),
      jf("365ukts", "365UKTS", 22867, { __m: "eagle-fw", sleeps: 6, length: "36' 9\"", weight: "11,135", slide: true, specs: { "Weights": { "Dry Hitch Weight (lbs)": "2,085", "Unloaded Vehicle Weight (lbs)": "11,135", "Cargo Carrying Capacity (lbs)": "2,265", "Gross Vehicle Weight Rating (lbs)": "13,400" }, "Measurements": { "Length": "36' 9\"", "Exterior Height": "12' 7\"", "Exterior Height (with A/C)": "13' 3\"", "Exterior Height (with 2nd A/C)": "13' 3\"", "Exterior Width": "8' 1\"", "Exterior Width (with slides out)": "14' 2\"", "Interior Height (main)": "6' 6\"", "Interior Height (upper deck)": "8' 8\"", "Awning Length": "17' 0\"", "Awning Length 2": "11' 6\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "81.0", "Gray Water Capacity (gals)": "87.0", "Black Tank Capacity (gals)": "50.0", "Propane Unit (lbs)": "60" }, "Miscellaneous": { "Sleeps": "up to 6", "Water Heater": "Tankless", "# of outside storage compartments": "2", "Tire Size": "ST235/80R16'H'" } } }),
      jf("367tbts", "367TBTS", 23625, { __m: "eagle-fw", sleeps: 5, length: "40' 9\"", weight: "12,525", slide: true, specs: { "Weights": { "Dry Hitch Weight (lbs)": "2,380", "Unloaded Vehicle Weight (lbs)": "12,525", "Cargo Carrying Capacity (lbs)": "2,375", "Gross Vehicle Weight Rating (lbs)": "14,900" }, "Measurements": { "Length": "40' 9\"", "Exterior Height": "12' 6\"", "Exterior Height (with A/C)": "11' 2\"", "Exterior Height (with 2nd A/C)": "12' 10\"", "Exterior Width": "8' 1\"", "Exterior Width (with slides out)": "14' 0\"", "Interior Height (main)": "8' 7\"", "Interior Height (upper deck)": "6' 7\"", "Awning Length": "20' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "81.0", "Gray Water Capacity (gals)": "87.0", "Black Tank Capacity (gals)": "87.0", "Propane Unit (lbs)": "60" }, "Miscellaneous": { "Sleeps": "up to 5", "Water Heater": "Tankless", "# of outside storage compartments": "3", "Furnace BTU": "35000", "Tire Size": "ST235/80R16'H'" } } }),
      jf("360dbok", "360DBOK", 24306, { __m: "eagle-fw", sleeps: 6, length: "42' 10\"", weight: "12,800", slide: true, specs: { "Weights": { "Dry Hitch Weight (lbs)": "2,695", "Unloaded Vehicle Weight (lbs)": "12,800", "Cargo Carrying Capacity (lbs)": "2,195", "Gross Vehicle Weight Rating (lbs)": "14,995" }, "Measurements": { "Length": "42' 10\"", "Exterior Height": "12' 7\"", "Exterior Height (with A/C)": "13' 3\"", "Exterior Height (with 2nd A/C)": "13' 4\"", "Exterior Width": "8' 1\"", "Exterior Width (with slides out)": "14' 0\"", "Interior Height (main)": "8' 7\"", "Interior Height (upper deck)": "6' 7\"", "Awning Length": "17' 0\"", "Awning Length 2": "10' 6\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "81.0", "Gray Water Capacity (gals)": "87.0", "Black Tank Capacity (gals)": "87.0", "Propane Unit (lbs)": "60" }, "Miscellaneous": { "Sleeps": "up to 6", "Water Heater": "Tankless", "# of outside storage compartments": "2", "Furnace BTU": "35000", "Tire Size": "ST235/80R16'H'" } } }),
      jf("355mbqs", "355MBQS", 24556, { __m: "eagle-fw", sleeps: 8, length: "40' 11\"", weight: "12,775", slide: true, specs: { "Weights": { "Dry Hitch Weight (lbs)": "2,455", "Unloaded Vehicle Weight (lbs)": "12,775", "Cargo Carrying Capacity (lbs)": "2,625", "Gross Vehicle Weight Rating (lbs)": "15,400" }, "Measurements": { "Length": "40' 11\"", "Exterior Height": "12' 6\"", "Exterior Height (with A/C)": "12' 9\"", "Exterior Height (with 2nd A/C)": "13' 5\"", "Exterior Width": "8' 1\"", "Exterior Width (with slides out)": "14' 0\"", "Interior Height (main)": "8' 7\"", "Interior Height (upper deck)": "6' 7\"", "Awning Length": "21' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "81.0", "Gray Water Capacity (gals)": "87.0", "Black Tank Capacity (gals)": "50.0", "Propane Unit (lbs)": "60" }, "Miscellaneous": { "Sleeps": "up to 8", "Water Heater": "Tankless", "# of outside storage compartments": "2", "Furnace BTU": "35000", "Tire Size": "ST235/80R16'H'" } } }),
    ],
  };

  /* ---------- eagle-sle-fw : 4 floorplans, 0 options, 1 exterior ---------- */
  const eagle_sle_fw = {
    exterior: [
      { id: "as-shown", name: "As shown", price: 0 },
    ],
    /* Jayco's published interior design(s) for this model, from the
       Interior Design panel on each floorplan page. Identical across
       every plan in the model, so it lives at model level. */
    interior: [
      { id: "calli-sand", name: "Calli Sand", price: 0, image: D + "eagle-sle-fw__calli-sand.webp" },
    ],
    options: {},   /* Jayco publishes no option list for this model */
    floorplans: [
      jf("24mle", "24MLE", 0, { __m: "eagle-sle-fw", sleeps: 4, length: "29' 3\"", weight: "7,855", slide: true, specs: { "Weights": { "Dry Hitch Weight (lbs)": "1,485", "Unloaded Vehicle Weight (lbs)": "7,855", "Cargo Carrying Capacity (lbs)": "1,645", "Gross Vehicle Weight Rating (lbs)": "9,500" }, "Measurements": { "Exterior Length (overall)": "29' 3\"", "Length": "29' 0\"", "Exterior Height": "12' 3\"", "Exterior Height (with A/C)": "12' 3\"", "Exterior Width": "8' 1\"", "Exterior Width (with slides out)": "11' 1\"", "Interior Height (main)": "8' 5\"", "Awning Length": "16' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "52.0", "Gray Water Capacity (gals)": "82.0", "Black Tank Capacity (gals)": "45.0", "Propane Unit (lbs)": "60" }, "Miscellaneous": { "Sleeps": "up to 4", "Water Heater": "Tankless", "# of outside storage compartments": "2", "Furnace BTU": "30000", "Tire Size": "ST225/75R15'E'" } } }),
      jf("28bhu", "28BHU", 2985, { __m: "eagle-sle-fw", sleeps: 8, length: "33' 5\"", weight: "8,540", slide: true, specs: { "Weights": { "Dry Hitch Weight (lbs)": "1,600", "Unloaded Vehicle Weight (lbs)": "8,540", "Cargo Carrying Capacity (lbs)": "1,455", "Gross Vehicle Weight Rating (lbs)": "9,995" }, "Measurements": { "Length": "33' 5\"", "Exterior Height": "12' 4\"", "Exterior Height (with A/C)": "12' 10\"", "Exterior Height (with 2nd A/C)": "13' 2\"", "Exterior Width": "8' 1\"", "Exterior Width (with slides out)": "11' 1\"", "Interior Height (main)": "8' 5\"", "Interior Height (upper deck)": "6' 3\"", "Awning Length": "19' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "51.0", "Gray Water Capacity (gals)": "82.0", "Black Tank Capacity (gals)": "45.0", "Propane Unit (lbs)": "60" }, "Miscellaneous": { "Sleeps": "up to 8", "Water Heater": "Tankless", "Furnace BTU": "35000", "Tire Size": "ST225/75R15'E'" } } }),
      jf("28rks", "28RKS", 4500, { __m: "eagle-sle-fw", sleeps: 4, length: "29' 8\"", weight: "8,175", specs: { "Weights": { "Dry Hitch Weight (lbs)": "1,550", "Unloaded Vehicle Weight (lbs)": "8,175", "Cargo Carrying Capacity (lbs)": "1,820", "Gross Vehicle Weight Rating (lbs)": "9,995" }, "Measurements": { "Length": "29' 8\"", "Exterior Height": "12' 10\"", "Exterior Height (with A/C)": "12' 6\"", "Exterior Height (with 2nd A/C)": "13' 1\"", "Exterior Width": "8' 1\"", "Interior Height (main)": "8' 5\"", "Interior Height (upper deck)": "6' 2\"", "Awning Length": "17' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "51.0", "Gray Water Capacity (gals)": "82.0", "Black Tank Capacity (gals)": "45.0", "Propane Unit (lbs)": "60" }, "Miscellaneous": { "Sleeps": "up to 4", "Water Heater": "Tankless", "# of outside storage compartments": "1", "Tire Size": "ST225/75R15'E'" } } }),
      jf("30rlt", "30RLT", 10875, { __m: "eagle-sle-fw", sleeps: 4, length: "32' 11\"", weight: "9,163", slide: true, specs: { "Weights": { "Dry Hitch Weight (lbs)": "1,800", "Unloaded Vehicle Weight (lbs)": "9,163", "Cargo Carrying Capacity (lbs)": "1,737", "Gross Vehicle Weight Rating (lbs)": "10,900" }, "Measurements": { "Length": "32' 11\"", "Exterior Height": "12' 1\"", "Exterior Height (with A/C)": "12' 3\"", "Exterior Height (with 2nd A/C)": "13' 0\"", "Exterior Width": "8' 1\"", "Exterior Width (with slides out)": "13' 1\"", "Interior Height (main)": "8' 5\"", "Interior Height (upper deck)": "6' 3\"", "Awning Length": "15' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "52.0", "Gray Water Capacity (gals)": "82.0", "Black Tank Capacity (gals)": "45.0", "Propane Unit (lbs)": "60" }, "Miscellaneous": { "Sleeps": "up to 4", "Water Heater": "Tankless", "# of outside storage compartments": "1", "Tire Size": "ST225/75R15'E'" } } }),
    ],
  };

  /* ---------- eagle-tt : 6 floorplans, 0 options, 1 exterior ---------- */
  const eagle_tt = {
    exterior: [
      { id: "as-shown", name: "As shown", price: 0 },
    ],
    /* Jayco publishes no Interior Design panel for this model. */
    interior: [ { id: 'as-shown', name: 'As shown', price: 0 } ],
    options: {},   /* Jayco publishes no option list for this model */
    floorplans: [
      jf("230mlcs", "230MLCS", 0, { __m: "eagle-tt", sleeps: 2, length: "27' 7\"", weight: "6,785", slide: true, specs: { "Weights": { "Dry Hitch Weight (lbs)": "780", "Unloaded Vehicle Weight (lbs)": "6,785", "Cargo Carrying Capacity (lbs)": "1,615", "Gross Vehicle Weight Rating (lbs)": "8,400" }, "Measurements": { "Exterior Length (overall)": "27' 7\"", "Length": "24' 7\"", "Exterior Height": "10' 11\"", "Exterior Height (with A/C)": "11' 8\"", "Exterior Width": "8' 0\"", "Exterior Width (with slides out)": "11' 0\"", "Interior Height (main)": "7' 0\"", "Interior Height (upper deck)": "7' 0\"", "Awning Length": "19' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "52.0", "Gray Water Capacity (gals)": "74.0", "Black Tank Capacity (gals)": "37.0", "Propane Unit (lbs)": "40" }, "Miscellaneous": { "Sleeps": "up to 2", "Water Heater": "Tankless", "# of outside storage compartments": "2", "Furnace BTU": "35000", "Tire Size": "ST225/75R15'E'" } } }),
      jf("265fkds", "265FKDS", 8250, { __m: "eagle-tt", sleeps: 2, length: "31' 7\"", weight: "7,820", specs: { "Weights": { "Dry Hitch Weight (lbs)": "1,170", "Unloaded Vehicle Weight (lbs)": "7,820", "Cargo Carrying Capacity (lbs)": "1,178", "Gross Vehicle Weight Rating (lbs)": "9,800" }, "Measurements": { "Exterior Length (overall)": "31' 7\"", "Length": "28' 8\"", "Exterior Height": "11' 0\"", "Exterior Height (with A/C)": "11' 8\"", "Exterior Height (with 2nd A/C)": "11' 8\"", "Exterior Width": "8' 0\"", "Interior Height (main)": "7' 1\"", "Interior Height (upper deck)": "7' 1\"", "Awning Length": "21' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "52.0", "Gray Water Capacity (gals)": "74.0", "Black Tank Capacity (gals)": "37.0", "Propane Unit (lbs)": "40" }, "Miscellaneous": { "Sleeps": "up to 2", "Water Heater": "Tankless", "# of outside storage compartments": "5", "Tire Size": "ST225/75R15'E'" } } }),
      jf("294ckbs", "294CKBS", 17482, { __m: "eagle-tt", sleeps: 4, length: "34' 9\"", weight: "9,590", slide: true, specs: { "Weights": { "Dry Hitch Weight (lbs)": "1,200", "Unloaded Vehicle Weight (lbs)": "9,590", "Cargo Carrying Capacity (lbs)": "2,110", "Gross Vehicle Weight Rating (lbs)": "11,700" }, "Measurements": { "Length": "34' 9\"", "Exterior Height": "11' 2\"", "Exterior Height (with A/C)": "11' 11\"", "Exterior Height (with 2nd A/C)": "11' 11\"", "Exterior Width": "8' 1\"", "Exterior Width (with slides out)": "14' 0\"", "Interior Height (main)": "7' 1\"", "Interior Height (upper deck)": "7' 1\"", "Awning Length": "14' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "52.0", "Gray Water Capacity (gals)": "74.0", "Black Tank Capacity (gals)": "37.0", "Propane Unit (lbs)": "40" }, "Miscellaneous": { "Sleeps": "up to 4", "Water Heater": "Tankless", "# of outside storage compartments": "3", "Furnace BTU": "35000", "Tire Size": "ST235/80R16'H'" } } }),
      jf("312bhok", "312BHOK", 18750, { __m: "eagle-tt", sleeps: 8, length: "35' 6\"", weight: "9,790", slide: true, specs: { "Weights": { "Dry Hitch Weight (lbs)": "1,220", "Unloaded Vehicle Weight (lbs)": "9,790", "Cargo Carrying Capacity (lbs)": "2,205", "Gross Vehicle Weight Rating (lbs)": "11,995" }, "Measurements": { "Length": "35' 6\"", "Exterior Height": "11' 5\"", "Exterior Height (with A/C)": "11' 10\"", "Exterior Width": "8' 1\"", "Exterior Width (with slides out)": "14' 1\"", "Interior Height (main)": "7' 0\"", "Interior Height (upper deck)": "7' 0\"", "Awning Length": "21' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "52.0", "Gray Water Capacity (gals)": "74.0", "Black Tank Capacity (gals)": "37.0", "Propane Unit (lbs)": "40" }, "Miscellaneous": { "Sleeps": "up to 8", "Water Heater": "Tankless", "# of outside storage compartments": "2", "Furnace BTU": "35000", "Tire Size": "ST235/80R16'H'" } } }),
      jf("270ddbr", "270DDBR", null, { __m: "eagle-tt", isNew: true }),
      jf("320mkts", "320MKTS", null, { __m: "eagle-tt", sleeps: 4, length: "33' 8\"", weight: "9,340", slide: true, isNew: true, specs: { "Weights": { "Dry Hitch Weight (lbs)": "1,110", "Unloaded Vehicle Weight (lbs)": "9,340", "Cargo Carrying Capacity (lbs)": "2,160", "Gross Vehicle Weight Rating (lbs)": "11,500" }, "Measurements": { "Length": "33' 8\"", "Exterior Height": "11' 2\"", "Exterior Height (with A/C)": "11' 10\"", "Exterior Width": "8' 1\"", "Exterior Width (with slides out)": "13' 2\"", "Interior Height (main)": "7' 0\"", "Awning Length": "19' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "52.0", "Gray Water Capacity (gals)": "74.0", "Black Tank Capacity (gals)": "37.0", "Propane Unit (lbs)": "40" }, "Miscellaneous": { "Sleeps": "up to 4", "Water Heater": "Tankless", "# of outside storage compartments": "3", "Furnace BTU": "35000", "Tire Size": "ST235/80R16'H'" } } }),
    ],
  };

  /* ---------- greyhawk : 5 floorplans, 10 options, 6 exterior ---------- */
  const greyhawk = {
    exterior: [
      { id: "standard", name: "Standard graphics", price: 0 },
      { id: "2413", name: "Alaska Full-Body Paint", price: 16493 },
      { id: "2412", name: "Arizona Full-Body Paint", price: 16493 },
      { id: "2409", name: "California Full-Body Paint", price: 16493 },
      { id: "2411", name: "Idaho Full-Body Paint", price: 16493 },
      { id: "2410", name: "Utah Full-Body Paint", price: 16493 },
    ],
    /* Jayco's published interior design(s) for this model, from the
       Interior Design panel on each floorplan page. Identical across
       every plan in the model, so it lives at model level. */
    interior: [
      { id: "coastal", name: "Coastal", price: 0, image: D + "greyhawk__coastal.webp" },
      { id: "glendale", name: "Glendale", price: 0, image: D + "greyhawk__glendale.webp" },
    ],
    options: {
      "2416": { name: "Customer Value Package", price: 12750, mandatory: true },
      "2419": { name: "Blackout Package (Wheels, Grill, Bumper and Mirrors)", price: 4943 },
      "2422": { name: "Aluminum Rims", price: 2393 },
      "2421": { name: "Dual A/C Units", price: 1193 },
      "2688": { name: "Theater Seating Fabric ILO Sofa", price: 893 },
      "2687": { name: "Theater Seating ILO Sofa", price: 893 },
      "2415": { name: "Coastal", price: 593 },
      "2423": { name: "Folding Windshield Sun Shade", price: 488 },
      "2420": { name: "LED HD Smart TV in bedroom", price: 383 },
      "2424": { name: "Canadian Standards", price: 293 },
    },
    floorplans: [
      jf("27u", "27U", 0, { __m: "greyhawk", sleeps: 5, length: "29' 11\"", slide: true, optionIds: ["2415", "2416", "2419", "2420", "2421", "2422", "2423", "2424", "2687", "2688"], specs: { "Weights": { "Gross Vehicle Weight Rating (lbs)": "14,500", "Gross Combined Weight Rating (lbs)": "22,000" }, "Measurements": { "Exterior Length (overall)": "29' 11\"", "Exterior Height (with A/C)": "11' 8\"", "Exterior Width": "8' 4\"", "Exterior Width (with slides out)": "10' 4\"", "Interior Height (main)": "7' 0\"", "Awning Length": "18' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "42.0", "Gray Water Capacity (gals)": "41.0", "Black Tank Capacity (gals)": "31.0", "Propane Unit (lbs)": "56", "Fuel Tank Capacity (gals)": "55" }, "Miscellaneous": { "Sleeps": "up to 5", "Water Heater": "Tankless", "Furnace BTU": "30000", "Tire Size": "LT225/75R16E", "Engine Size": "7.3L 2V DEVCT NA PFI V8", "Exterior Cargo Capacity (cu. ft.)": "37" } } }),
      jf("29mv", "29MV", 375, { __m: "greyhawk", sleeps: 5, length: "32' 6\"", slide: true, optionIds: ["2415", "2416", "2419", "2420", "2421", "2422", "2423", "2424", "2687", "2688"], specs: { "Weights": { "Gross Vehicle Weight Rating (lbs)": "14,500", "Gross Combined Weight Rating (lbs)": "22,000" }, "Measurements": { "Exterior Length (overall)": "32' 6\"", "Exterior Height (with A/C)": "11' 8\"", "Exterior Width": "8' 4\"", "Exterior Width (with slides out)": "10' 4\"", "Interior Height (main)": "7' 0\"", "Awning Length": "16' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "47.0", "Gray Water Capacity (gals)": "41.0", "Black Tank Capacity (gals)": "32.0", "Propane Unit (lbs)": "56", "Fuel Tank Capacity (gals)": "55" }, "Miscellaneous": { "Sleeps": "up to 5", "Water Heater": "Tankless", "Furnace BTU": "30000", "Tire Size": "LT225/75R16E", "Engine Size": "7.3L 2V DEVCT NA PFI V8", "Exterior Cargo Capacity (cu. ft.)": "55" } } }),
      jf("31f", "31F", 2175, { __m: "greyhawk", sleeps: 7, length: "32' 6\"", slide: true, optionIds: ["2415", "2416", "2419", "2420", "2421", "2422", "2423", "2424", "2687", "2688"], specs: { "Weights": { "Gross Vehicle Weight Rating (lbs)": "14,500", "Gross Combined Weight Rating (lbs)": "22,000" }, "Measurements": { "Exterior Length (overall)": "32' 6\"", "Exterior Height (with A/C)": "11' 8\"", "Exterior Width": "8' 4\"", "Exterior Width (with slides out)": "9' 10\"", "Interior Height (main)": "7' 0\"", "Awning Length": "18' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "47.0", "Gray Water Capacity (gals)": "41.0", "Black Tank Capacity (gals)": "31.0", "Propane Unit (lbs)": "56" }, "Miscellaneous": { "Sleeps": "up to 7", "Water Heater": "Tankless", "Furnace BTU": "30000", "Tire Size": "LT225/75R16E", "Engine Size": "7.3L 2V DEVCT NA PFI V8", "Exterior Cargo Capacity (cu. ft.)": "51" } } }),
      jf("30z", "30Z", 2475, { __m: "greyhawk", sleeps: 6, length: "32' 6\"", slide: true, optionIds: ["2415", "2416", "2419", "2420", "2421", "2422", "2423", "2424", "2687", "2688"], specs: { "Weights": { "Gross Vehicle Weight Rating (lbs)": "14,500", "Gross Combined Weight Rating (lbs)": "22,000" }, "Measurements": { "Exterior Length (overall)": "32' 6\"", "Exterior Height (with A/C)": "11' 8\"", "Exterior Width": "8' 4\"", "Exterior Width (with slides out)": "10' 2\"", "Interior Height (main)": "7' 0\"", "Awning Length": "18' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "43.0", "Gray Water Capacity (gals)": "41.0", "Black Tank Capacity (gals)": "31.0", "Propane Unit (lbs)": "56", "Fuel Tank Capacity (gals)": "55" }, "Miscellaneous": { "Sleeps": "up to 6", "Water Heater": "Tankless", "Furnace BTU": "30000", "Tire Size": "LT225/75R16E", "Engine Size": "7.3L 2V DEVCT NA PFI V8", "Exterior Cargo Capacity (cu. ft.)": "95" } } }),
      jf("30z-csa", "30Z", 2475, { __m: "greyhawk", sleeps: 6, length: "32' 6\"", slide: true, optionIds: ["2415", "2416", "2419", "2420", "2421", "2422", "2423", "2424", "2687", "2688"], specs: { "Weights": { "Gross Vehicle Weight Rating (lbs)": "14,500", "Gross Combined Weight Rating (lbs)": "22,000" }, "Measurements": { "Exterior Length (overall)": "32' 6\"", "Exterior Height (with A/C)": "11' 8\"", "Exterior Width": "8' 4\"", "Exterior Width (with slides out)": "10' 2\"", "Interior Height (main)": "7' 0\"", "Awning Length": "18' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "43.0", "Gray Water Capacity (gals)": "41.0", "Black Tank Capacity (gals)": "31.0", "Propane Unit (lbs)": "56", "Fuel Tank Capacity (gals)": "55" }, "Miscellaneous": { "Sleeps": "up to 6", "Water Heater": "Tankless", "Furnace BTU": "30000", "Tire Size": "LT225/75R16E", "Engine Size": "7.3L 2V DEVCT NA PFI V8", "Exterior Cargo Capacity (cu. ft.)": "95" } } }),
    ],
  };

  /* ---------- greyhawk-xl : 2 floorplans, 10 options, 5 exterior ---------- */
  const greyhawk_xl = {
    exterior: [
      { id: "standard", name: "Standard graphics", price: 0 },
      { id: "2344", name: "Harvest Moon Full-Body Paint", price: 8095 },
      { id: "2346", name: "Icy Blast Full-Body Paint", price: 8095 },
      { id: "2345", name: "Summer Solstice Full-Body Paint", price: 8095 },
      { id: "2347", name: "Winter Equinox Full-Body Paint", price: 8095 },
    ],
    /* Jayco publishes no Interior Design panel for this model. */
    interior: [ { id: 'as-shown', name: 'As shown', price: 0 } ],
    options: {
      "2606": { name: "Desert Edition", price: 28493 },
      "2605": { name: "Golden State Edition", price: 28493 },
      "2438": { name: "Customer Value Package", price: 25493, mandatory: true },
      "2601": { name: "Aluminum Rims", price: 2993 },
      "2603": { name: "Chassis Upcharge - F600 (32U)", price: 2993 },
      "2604": { name: "Power Theater Seating", price: 2093 },
      "2600": { name: "Dual A/C units 15,000 and 13,500 BTU", price: 1193 },
      "2602": { name: "Folding Windshield Sun Shade", price: 488 },
      "2599": { name: "LED HD Smart TV in Bedroom", price: 413 },
      "2607": { name: "Canadian Standards", price: 293 },
    },
    floorplans: [
      jf("32u", "32U", 0, { __m: "greyhawk-xl", sleeps: 5, length: "33' 5\"", slide: true, optionIds: ["2599", "2600", "2601", "2602", "2603", "2604", "2605", "2606", "2607", "2438"], specs: { "Weights": { "Gross Vehicle Weight Rating (lbs)": "19,500", "Gross Combined Weight Rating (lbs)": "31,500" }, "Measurements": { "Exterior Length (overall)": "33' 5\"", "Exterior Height (with A/C)": "12' 6\"", "Exterior Width": "8' 5\"", "Exterior Width (with slides out)": "11' 3\"", "Interior Height (main)": "7' 0\"", "Awning Length": "20' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "42.5", "Gray Water Capacity (gals)": "31.0", "Black Tank Capacity (gals)": "31.0", "Propane Unit (lbs)": "24", "Furnace, Auto-ignition (BTU output)": "30000", "Fuel Tank Capacity (gals)": "67" }, "Miscellaneous": { "Sleeps": "up to 5", "Water Heater": "Tankless", "# of outside storage compartments": "7", "Tire Size": "225/70R19.5G", "Engine Size": "6.7L Power Stroke V8 Turbo Diesel", "Exterior Cargo Capacity (cu. ft.)": "58" } } }),
      jf("33f", "33F", 7500, { __m: "greyhawk-xl", sleeps: 7, length: "34' 11\"", slide: true, optionIds: ["2599", "2600", "2601", "2602", "2604", "2605", "2606", "2607", "2438"], specs: { "Weights": { "Gross Vehicle Weight Rating (lbs)": "22,000", "Gross Combined Weight Rating (lbs)": "34,000" }, "Measurements": { "Exterior Length (overall)": "34' 11\"", "Exterior Height (with A/C)": "12' 6\"", "Exterior Width": "8' 5\"", "Exterior Width (with slides out)": "10' 8\"", "Interior Height (main)": "7' 0\"", "Awning Length": "18' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "53.0", "Gray Water Capacity (gals)": "32.0", "Black Tank Capacity (gals)": "32.0", "Propane Unit (lbs)": "24", "Fuel Tank Capacity (gals)": "67" }, "Miscellaneous": { "Sleeps": "up to 7", "Water Heater": "Tankless", "Furnace BTU": "30000", "Tire Size": "245/70R19.5G", "Engine Size": "6.7L Power Stroke V8 Turbo Diesel", "Exterior Cargo Capacity (cu. ft.)": "64" } } }),
    ],
  };

  /* ---------- jay-feather : 16 floorplans, 16 options, 1 exterior ---------- */
  const jay_feather = {
    exterior: [
      { id: "as-shown", name: "As shown", price: 0 },
    ],
    /* Jayco's published interior design(s) for this model, from the
       Interior Design panel on each floorplan page. Identical across
       every plan in the model, so it lives at model level. */
    interior: [
      { id: "dune-gray", name: "Dune Gray", price: 0, image: D + "jay-feather__dune-gray.webp" },
    ],
    options: {
      "2499": { name: "Customer Value Package", price: 6000, mandatory: true },
      "2501": { name: "JaySport Package", price: 4500, mandatory: true },
      "2502": { name: "Premier Package", price: 2243 },
      "2503": { name: "Overlander II Solar Package - Replaces Overlander Solar I Package", price: 1193 },
      "2505": { name: "2nd 13,500 BTU A/C in Bedroom", price: 1043 },
      "2511": { name: "Theater Seating with Table Trays IPO Dinette", price: 1043 },
      "2506": { name: "50 AMP Service with 2nd A/C Prep", price: 488 },
      "2508": { name: "120V Heated Tank Pads", price: 413 },
      "2510": { name: "Theater seating IPO Tri-Fold Sofa", price: 368 },
      "2504": { name: "15,000 BTU A/C", price: 300 },
      "2515": { name: "King Bed", price: 293 },
      "2509": { name: "App Monitored In-Stem TPMS", price: 270 },
      "2513": { name: "Free Standing Table with 4 Chairs", price: 233 },
      "2500": { name: "Canadian Standards", price: 210 },
      "2507": { name: "30 lb. LP gas bottles with auto regulator, ABS cover, and fill gauge", price: 113 },
      "2514": { name: "Furniture Cup Holder Tables (1 pair)", price: 113 },
    },
    floorplans: [
      jf("18rbf", "18RBF", 0, { __m: "jay-feather", sleeps: 4, length: "23' 1\"", weight: "4,655", slide: true, optionIds: ["2499", "2500", "2501", "2502", "2503", "2504", "2506", "2507", "2508", "2509", "2514", "2515"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "490", "Unloaded Vehicle Weight (lbs)": "4,655", "Cargo Carrying Capacity (lbs)": "1,545", "Gross Vehicle Weight Rating (lbs)": "6,200" }, "Measurements": { "Exterior Length (overall)": "23' 1\"", "Length": "20' 1\"", "Exterior Height": "10' 0\"", "Exterior Height (with A/C)": "10' 9\"", "Exterior Width": "8' 0\"", "Exterior Width (with slides out)": "11' 0\"", "Interior Height (main)": "6' 6\"", "Awning Length": "14' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "55.0", "Gray Water Capacity (gals)": "38.0", "Black Tank Capacity (gals)": "38.0", "Propane Unit (lbs)": "40" }, "Miscellaneous": { "Sleeps": "up to 4", "Water Heater": "Tankless", "# of outside storage compartments": "2", "Furnace BTU": "20000", "Tire Size": "ST205/75R14'D'" } } }),
      jf("19mrk", "19MRK", 2160, { __m: "jay-feather", sleeps: 4, length: "23' 4\"", weight: "4,885", slide: true, optionIds: ["2499", "2500", "2501", "2502", "2503", "2504", "2507", "2508", "2509"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "555", "Unloaded Vehicle Weight (lbs)": "4,885", "Cargo Carrying Capacity (lbs)": "1,515", "Gross Vehicle Weight Rating (lbs)": "6,400" }, "Measurements": { "Exterior Length (overall)": "23' 4\"", "Length": "20' 3\"", "Exterior Height": "10' 0\"", "Exterior Height (with A/C)": "10' 9\"", "Exterior Width": "8' 0\"", "Exterior Width (with slides out)": "10' 11\"", "Interior Height (main)": "6' 6\"", "Awning Length": "15' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "55.0", "Gray Water Capacity (gals)": "38.0", "Black Tank Capacity (gals)": "30.5", "Propane Unit (lbs)": "40" }, "Miscellaneous": { "Sleeps": "up to 4", "Water Heater": "Tankless", "# of outside storage compartments": "2", "Furnace BTU": "20000", "Tire Size": "ST205/75R14'D'" } } }),
      jf("21mml", "21MML", 3735, { __m: "jay-feather", sleeps: 3, length: "25' 5\"", weight: "5,095", slide: true, optionIds: ["2499", "2500", "2501", "2502", "2503", "2504", "2506", "2507", "2508", "2509"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "580", "Unloaded Vehicle Weight (lbs)": "5,095", "Cargo Carrying Capacity (lbs)": "1,405", "Gross Vehicle Weight Rating (lbs)": "6,500" }, "Measurements": { "Exterior Length (overall)": "25' 5\"", "Exterior Height": "9' 11\"", "Exterior Height (with A/C)": "10' 7\"", "Exterior Width": "8' 0\"", "Exterior Width (with slides out)": "9' 10\"", "Interior Height (main)": "6' 6\"", "Awning Length": "15' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "55.0", "Gray Water Capacity (gals)": "30.5", "Black Tank Capacity (gals)": "30.5" }, "Miscellaneous": { "Sleeps": "up to 3", "Water Heater": "Tankless", "# of outside storage compartments": "2", "Furnace BTU": "35000", "Tire Size": "ST205/75R14'D'" } } }),
      jf("21mbh", "21MBH", 4575, { __m: "jay-feather", sleeps: 6, optionIds: ["2499", "2500", "2501", "2502", "2503", "2504", "2507", "2508", "2509", "2511"], specs: { "Miscellaneous": { "Sleeps": "up to 6", "# of outside storage compartments": "3", "Tire Size": "ST205/75R14'D'" } } }),
      jf("23rk", "23RK", 6225, { __m: "jay-feather", sleeps: 6, length: "28' 7\"", weight: "5,765", slide: true, optionIds: ["2499", "2500", "2501", "2502", "2503", "2504", "2505", "2506", "2507", "2508", "2509", "2514", "2515"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "665", "Unloaded Vehicle Weight (lbs)": "5,765", "Cargo Carrying Capacity (lbs)": "1,635", "Gross Vehicle Weight Rating (lbs)": "7,400" }, "Measurements": { "Exterior Length (overall)": "28' 7\"", "Length": "25' 6\"", "Exterior Height": "9' 11\"", "Exterior Height (with A/C)": "10' 8\"", "Exterior Width": "8' 0\"", "Exterior Width (with slides out)": "10' 11\"", "Interior Height (main)": "6' 6\"", "Awning Length": "20' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "55.0", "Gray Water Capacity (gals)": "61.0", "Black Tank Capacity (gals)": "30.5", "Propane Unit (lbs)": "40" }, "Miscellaneous": { "Sleeps": "up to 6", "Water Heater": "Tankless", "# of outside storage compartments": "3", "Furnace BTU": "35000", "Tire Size": "ST205/75R14'D'" } } }),
      jf("25rb", "25RB", 7380, { __m: "jay-feather", sleeps: 6, length: "30' 1\"", weight: "6,130", slide: true, optionIds: ["2499", "2500", "2501", "2502", "2503", "2504", "2505", "2506", "2507", "2508", "2509", "2510", "2513", "2514", "2515"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "715", "Unloaded Vehicle Weight (lbs)": "6,130", "Cargo Carrying Capacity (lbs)": "1,470", "Gross Vehicle Weight Rating (lbs)": "7,600" }, "Measurements": { "Exterior Length (overall)": "30' 1\"", "Length": "27' 2\"", "Exterior Height": "10' 3\"", "Exterior Height (with A/C)": "11' 0\"", "Exterior Height (with 2nd A/C)": "11' 0\"", "Exterior Width": "8' 0\"", "Exterior Width (with slides out)": "11' 0\"", "Interior Height (main)": "6' 8\"", "Awning Length": "19' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "55.0", "Gray Water Capacity (gals)": "61.0", "Black Tank Capacity (gals)": "38.0", "Propane Unit (lbs)": "40" }, "Miscellaneous": { "Sleeps": "up to 6", "Water Heater": "Tankless", "# of outside storage compartments": "2", "Furnace BTU": "35000", "Tire Size": "ST205/75R14'D'" } } }),
      jf("25bh", "25BH", 8250, { __m: "jay-feather", sleeps: 8, length: "29' 8\"", weight: "6,015", slide: true, optionIds: ["2499", "2500", "2501", "2502", "2503", "2504", "2505", "2506", "2507", "2508", "2509", "2511", "2515"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "665", "Unloaded Vehicle Weight (lbs)": "6,015", "Cargo Carrying Capacity (lbs)": "1,585", "Gross Vehicle Weight Rating (lbs)": "7,600" }, "Measurements": { "Exterior Length (overall)": "29' 8\"", "Length": "26' 7\"", "Exterior Height": "9' 11\"", "Exterior Height (with A/C)": "10' 9\"", "Exterior Width": "8' 0\"", "Exterior Width (with slides out)": "10' 11\"", "Interior Height (main)": "6' 6\"", "Awning Length": "21' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "55.0", "Gray Water Capacity (gals)": "76.0", "Black Tank Capacity (gals)": "38.0", "Propane Unit (lbs)": "40" }, "Miscellaneous": { "Sleeps": "up to 8", "Water Heater": "Tankless", "# of outside storage compartments": "3", "Furnace BTU": "35000", "Tire Size": "ST205/75R14'D'" } } }),
      jf("23mbd", "23MBD", 8925, { __m: "jay-feather", sleeps: 7, length: "28' 0\"", weight: "6,045", slide: true, optionIds: ["2499", "2500", "2501", "2502", "2503", "2504", "2505", "2506", "2507", "2508", "2509", "2511"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "660", "Unloaded Vehicle Weight (lbs)": "6,045", "Cargo Carrying Capacity (lbs)": "1,455", "Gross Vehicle Weight Rating (lbs)": "7,500" }, "Measurements": { "Exterior Length (overall)": "28' 0\"", "Length": "25' 2\"", "Exterior Height": "10' 2\"", "Exterior Height (with A/C)": "11' 0\"", "Exterior Width": "8' 0\"", "Exterior Width (with slides out)": "11' 0\"", "Interior Height (main)": "6' 9\"", "Awning Length": "20' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "55.0", "Gray Water Capacity (gals)": "76.0", "Black Tank Capacity (gals)": "40.0", "Propane Unit (lbs)": "40", "Propane Unit (lbs) (Optional)": "60" }, "Miscellaneous": { "Sleeps": "up to 7", "Water Heater": "Tankless", "# of outside storage compartments": "4", "Furnace BTU": "35000", "Tire Size": "ST205/75R14'D'" } } }),
      jf("24fk", "24FK", 9000, { __m: "jay-feather", sleeps: 2, length: "27' 0\"", weight: "5,830", slide: true, optionIds: ["2499", "2500", "2501", "2502", "2503", "2504", "2505", "2506", "2507", "2508", "2509", "2514", "2515"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "830", "Unloaded Vehicle Weight (lbs)": "5,830", "Cargo Carrying Capacity (lbs)": "1,670", "Gross Vehicle Weight Rating (lbs)": "7,500" }, "Measurements": { "Exterior Length (overall)": "27' 0\"", "Length": "24' 2\"", "Exterior Height": "10' 2\"", "Exterior Height (with A/C)": "11' 1\"", "Exterior Width": "8' 0\"", "Exterior Width (with slides out)": "10' 11\"", "Interior Height (main)": "6' 9\"", "Awning Length": "16' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "55.0", "Gray Water Capacity (gals)": "76.0", "Black Tank Capacity (gals)": "38.0", "Propane Unit (lbs)": "40", "Propane Unit (lbs) (Optional)": "60" }, "Miscellaneous": { "Sleeps": "up to 2", "Water Heater": "Tankless", "# of outside storage compartments": "2", "Furnace BTU": "35000", "Tire Size": "ST205/75R14'D'" } } }),
      jf("27bh", "27BH", 11502, { __m: "jay-feather", sleeps: 10, length: "32' 3\"", weight: "6,725", slide: true, optionIds: ["2499", "2500", "2501", "2502", "2503", "2504", "2505", "2506", "2507", "2508", "2509", "2510", "2513", "2514", "2515"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "860", "Unloaded Vehicle Weight (lbs)": "6,725", "Cargo Carrying Capacity (lbs)": "1,475", "Gross Vehicle Weight Rating (lbs)": "8,200" }, "Measurements": { "Exterior Length (overall)": "32' 3\"", "Length": "29' 5\"", "Exterior Height": "10' 6\"", "Exterior Height (with A/C)": "11' 3\"", "Exterior Width": "8' 0\"", "Exterior Width (with slides out)": "11' 0\"", "Interior Height (main)": "6' 10\"", "Awning Length": "20' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "55.0", "Gray Water Capacity (gals)": "76.0", "Black Tank Capacity (gals)": "38.0", "Propane Unit (lbs)": "40" }, "Miscellaneous": { "Sleeps": "up to 10", "Water Heater": "Tankless", "# of outside storage compartments": "2", "Furnace BTU": "35000", "Tire Size": "ST225/75R15'E'" } } }),
      jf("29bhb", "29BHB", 12825, { __m: "jay-feather", sleeps: 10, length: "34' 0\"", weight: "7,055", slide: true, optionIds: ["2499", "2500", "2501", "2502", "2503", "2504", "2505", "2506", "2507", "2508", "2509", "2510", "2515"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "790", "Unloaded Vehicle Weight (lbs)": "7,055", "Cargo Carrying Capacity (lbs)": "1,645", "Gross Vehicle Weight Rating (lbs)": "8,700" }, "Measurements": { "Exterior Length (overall)": "34' 0\"", "Length": "31' 2\"", "Exterior Height": "10' 5\"", "Exterior Height (with A/C)": "11' 3\"", "Exterior Width": "8' 0\"", "Exterior Width (with slides out)": "11' 0\"", "Interior Height (main)": "6' 9\"", "Awning Length": "20' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "55.0", "Gray Water Capacity (gals)": "68.5", "Black Tank Capacity (gals)": "30.5", "Propane Unit (lbs)": "40" }, "Miscellaneous": { "Sleeps": "up to 10", "Water Heater": "Tankless", "# of outside storage compartments": "4", "Furnace BTU": "35000", "Tire Size": "ST225/75R15'E'" } } }),
      jf("27mk", "27MK", 14107, { __m: "jay-feather", sleeps: 6, length: "33' 2\"", weight: "7,090", slide: true, optionIds: ["2499", "2500", "2501", "2502", "2503", "2504", "2505", "2506", "2507", "2508", "2509", "2510", "2513", "2514", "2515"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "785", "Unloaded Vehicle Weight (lbs)": "7,090", "Cargo Carrying Capacity (lbs)": "1,760", "Gross Vehicle Weight Rating (lbs)": "8,850" }, "Measurements": { "Exterior Length (overall)": "33' 2\"", "Length": "30' 7\"", "Exterior Height": "10' 6\"", "Exterior Height (with A/C)": "11' 3\"", "Exterior Width": "8' 0\"", "Exterior Width (with slides out)": "13' 1\"", "Interior Height (main)": "6' 9\"", "Awning Length": "10' 6\"", "Awning Length 2": "8' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "55.0", "Gray Water Capacity (gals)": "70.0", "Black Tank Capacity (gals)": "30.0", "Propane Unit (lbs)": "40" }, "Miscellaneous": { "Sleeps": "up to 6", "Water Heater": "Tankless", "# of outside storage compartments": "2", "Furnace BTU": "35000", "Tire Size": "ST225/75R15'E'" } } }),
      jf("26fk", "26FK", 14385, { __m: "jay-feather", sleeps: 4, length: "33' 10\"", weight: "7,210", slide: true, optionIds: ["2499", "2500", "2501", "2502", "2503", "2504", "2505", "2506", "2507", "2508", "2509", "2513", "2514", "2515"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "1,030", "Unloaded Vehicle Weight (lbs)": "7,210", "Cargo Carrying Capacity (lbs)": "1,490", "Gross Vehicle Weight Rating (lbs)": "8,700" }, "Measurements": { "Exterior Length (overall)": "33' 10\"", "Length": "31' 0\"", "Exterior Height": "10' 5\"", "Exterior Height (with A/C)": "11' 3\"", "Exterior Width": "8' 0\"", "Exterior Width (with slides out)": "11' 0\"", "Interior Height (main)": "6' 10\"", "Awning Length": "20' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "55.0", "Gray Water Capacity (gals)": "90.0", "Black Tank Capacity (gals)": "30.0", "Propane Unit (lbs)": "40" }, "Miscellaneous": { "Sleeps": "up to 4", "Water Heater": "Tankless", "# of outside storage compartments": "3", "Furnace BTU": "35000", "Tire Size": "ST225/75R15'E'" } } }),
      jf("30rkb", "30RKB", 15292, { __m: "jay-feather", sleeps: 6, length: "35' 10\"", weight: "7,250", slide: true, optionIds: ["2499", "2500", "2501", "2502", "2503", "2504", "2505", "2506", "2507", "2508", "2509", "2510", "2514", "2515"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "980", "Unloaded Vehicle Weight (lbs)": "7,250", "Cargo Carrying Capacity (lbs)": "1,745", "Gross Vehicle Weight Rating (lbs)": "8,995" }, "Measurements": { "Exterior Length (overall)": "35' 10\"", "Length": "33' 2\"", "Exterior Height": "10' 5\"", "Exterior Height (with A/C)": "11' 3\"", "Exterior Width": "8' 0\"", "Exterior Width (with slides out)": "11' 0\"", "Interior Height (main)": "6' 9\"", "Awning Length": "20' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "55.0", "Gray Water Capacity (gals)": "98.0", "Black Tank Capacity (gals)": "30.0", "Propane Unit (lbs)": "40" }, "Miscellaneous": { "Sleeps": "up to 6", "Water Heater": "Tankless", "# of outside storage compartments": "3", "Furnace BTU": "35000", "Tire Size": "ST225/75R15'E'" } } }),
      jf("29qbh", "29QBH", 15750, { __m: "jay-feather", sleeps: 11, length: "36' 1\"", weight: "7,335", slide: true, optionIds: ["2499", "2500", "2501", "2502", "2503", "2504", "2505", "2506", "2507", "2508", "2509", "2510", "2513", "2514", "2515"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "835", "Unloaded Vehicle Weight (lbs)": "7,335", "Cargo Carrying Capacity (lbs)": "1,660", "Gross Vehicle Weight Rating (lbs)": "8,995" }, "Measurements": { "Exterior Length (overall)": "36' 1\"", "Length": "33' 3\"", "Exterior Height": "10' 6\"", "Exterior Height (with A/C)": "11' 2\"", "Exterior Height (with 2nd A/C)": "11' 2\"", "Exterior Width": "8' 0\"", "Exterior Width (with slides out)": "10' 11\"", "Interior Height (main)": "6' 9\"", "Awning Length": "20' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "55.0", "Gray Water Capacity (gals)": "60.0", "Black Tank Capacity (gals)": "30.0", "Propane Unit (lbs)": "40" }, "Miscellaneous": { "Sleeps": "up to 11", "Water Heater": "Tankless", "# of outside storage compartments": "3", "Furnace BTU": "35000", "Tire Size": "ST225/75R15'E'" } } }),
      jf("33bh", "33BH", null, { __m: "jay-feather", isNew: true, specs: { "Miscellaneous": { "Water Heater": "Tankless" } } }),
    ],
  };

  /* ---------- jay-feather-air : 5 floorplans, 11 options, 1 exterior ---------- */
  const jay_feather_air = {
    exterior: [
      { id: "as-shown", name: "As shown", price: 0 },
    ],
    /* Jayco's published interior design(s) for this model, from the
       Interior Design panel on each floorplan page. Identical across
       every plan in the model, so it lives at model level. */
    interior: [
      { id: "dune-gray", name: "Dune Gray", price: 0, image: D + "jay-feather-air__dune-gray.webp" },
    ],
    options: {
      "2485": { name: "Customer Value Package", price: 6000, mandatory: true },
      "2487": { name: "Jay Air Package", price: 4500, mandatory: true },
      "2488": { name: "Baja Edition Package", price: 1425 },
      "2489": { name: "Overlander II Solar Package - Replaces Overlander Solar I Package", price: 1193 },
      "2493": { name: "120V Heated Tank Pads", price: 413 },
      "2490": { name: "15,000 BTU A/C", price: 300 },
      "2486": { name: "Canadian Standards", price: 210 },
      "2495": { name: "2", price: 188 },
      "2491": { name: "MaxxAir® Vent Fan", price: 143 },
      "2494": { name: "App Monitored In-Stem TPMS", price: 135 },
      "2492": { name: "30 lb. LP gas bottles with auto regulator, ABS cover, and fill gauge", price: 113 },
    },
    floorplans: [
      jf("15mrb", "15MRB", 0, { __m: "jay-feather-air", sleeps: 4, length: "20' 2\"", weight: "3,675", optionIds: ["2485", "2486", "2487", "2488", "2489", "2490", "2491", "2492", "2493", "2494", "2495"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "410", "Unloaded Vehicle Weight (lbs)": "3,675", "Cargo Carrying Capacity (lbs)": "1,320", "Gross Vehicle Weight Rating (lbs)": "4,995" }, "Measurements": { "Exterior Length (overall)": "20' 2\"", "Length": "17' 1\"", "Exterior Height": "9' 8\"", "Exterior Height (with A/C)": "10' 5\"", "Exterior Width": "8' 0\"", "Interior Height (main)": "6' 6\"", "Awning Length": "13' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "55.0", "Gray Water Capacity (gals)": "38.0", "Black Tank Capacity (gals)": "30.5" }, "Miscellaneous": { "Sleeps": "up to 4", "Water Heater": "Tankless", "# of outside storage compartments": "2", "Furnace BTU": "20000", "Tire Size": "ST225/75R15'E'" } } }),
      jf("16db", "16DB", 2175, { __m: "jay-feather-air", sleeps: 8, length: "22' 11\"", weight: "4,055", optionIds: ["2485", "2486", "2487", "2488", "2489", "2490", "2491", "2492", "2493", "2494", "2495"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "520", "Unloaded Vehicle Weight (lbs)": "4,055", "Cargo Carrying Capacity (lbs)": "1,445", "Gross Vehicle Weight Rating (lbs)": "5,500" }, "Measurements": { "Exterior Length (overall)": "22' 11\"", "Length": "19' 10\"", "Exterior Height": "9' 5\"", "Exterior Height (with A/C)": "10' 5\"", "Exterior Width": "8' 0\"", "Interior Height (main)": "6' 6\"", "Awning Length": "15' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "55.0", "Gray Water Capacity (gals)": "38.0", "Black Tank Capacity (gals)": "38.0", "Propane Unit (lbs)": "40" }, "Miscellaneous": { "Sleeps": "up to 8", "Water Heater": "Tankless", "# of outside storage compartments": "3", "Furnace BTU": "20000", "Tire Size": "ST225/75R'15'E" } } }),
      jf("16rb", "16RB", 2550, { __m: "jay-feather-air", sleeps: 4, length: "20' 2\"", weight: "3,840", slide: true, optionIds: ["2485", "2486", "2487", "2488", "2489", "2490", "2491", "2492", "2493", "2494", "2495"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "440", "Unloaded Vehicle Weight (lbs)": "3,840", "Cargo Carrying Capacity (lbs)": "1,155", "Gross Vehicle Weight Rating (lbs)": "4,995" }, "Measurements": { "Exterior Length (overall)": "20' 2\"", "Exterior Height": "9' 9\"", "Exterior Height (with A/C)": "10' 5\"", "Exterior Width": "8' 0\"", "Exterior Width (with slides out)": "9' 3\"", "Interior Height (main)": "6' 6\"", "Awning Length": "13' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "55.0", "Gray Water Capacity (gals)": "38.0", "Black Tank Capacity (gals)": "30.5", "Propane Unit (lbs)": "40", "Propane Unit (lbs) (Optional)": "60" }, "Miscellaneous": { "Sleeps": "up to 4", "Water Heater": "Tankless", "# of outside storage compartments": "2", "Furnace BTU": "20000", "Tire Size": "ST225/75R'15'E" } } }),
      jf("19mbs", "19MBS", 5700, { __m: "jay-feather-air", sleeps: 8, length: "23' 1\"", weight: "4,325", slide: true, optionIds: ["2485", "2486", "2487", "2488", "2489", "2490", "2491", "2492", "2493", "2494", "2495"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "580", "Unloaded Vehicle Weight (lbs)": "4,325", "Cargo Carrying Capacity (lbs)": "1,475", "Gross Vehicle Weight Rating (lbs)": "5,800" }, "Measurements": { "Exterior Length (overall)": "23' 1\"", "Length": "20' 1\"", "Exterior Height": "9' 8\"", "Exterior Height (with A/C)": "10' 6\"", "Exterior Width": "8' 0\"", "Exterior Width (with slides out)": "10' 4\"", "Interior Height (main)": "6' 6\"", "Awning Length": "15' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "55.0", "Gray Water Capacity (gals)": "38.0", "Black Tank Capacity (gals)": "38.0", "Propane Unit (lbs)": "40", "Propane Unit (lbs) (Optional)": "60" }, "Miscellaneous": { "Sleeps": "up to 8", "Water Heater": "Tankless", "# of outside storage compartments": "3", "Furnace BTU": "20000", "Tire Size": "ST225/75R16'E'" } } }),
      jf("18fbs", "18FBS", null, { __m: "jay-feather-air", sleeps: 3, length: "21' 4\"", weight: "3,880", slide: true, isNew: true, specs: { "Weights": { "Dry Hitch Weight (lbs)": "440", "Unloaded Vehicle Weight (lbs)": "3,880", "Cargo Carrying Capacity (lbs)": "1,115", "Gross Vehicle Weight Rating (lbs)": "4,995" }, "Measurements": { "Exterior Length (overall)": "21' 4\"", "Length": "18' 2\"", "Exterior Height": "9' 6\"", "Exterior Height (with A/C)": "10' 4\"", "Exterior Width": "8' 0\"", "Exterior Width (with slides out)": "9' 2\"", "Interior Height (main)": "6' 6\"", "Awning Length": "13' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "55.0", "Gray Water Capacity (gals)": "30.5", "Black Tank Capacity (gals)": "30.5", "Propane Unit (lbs)": "40" }, "Miscellaneous": { "Sleeps": "up to 3", "Water Heater": "Tankless", "# of outside storage compartments": "2", "Furnace BTU": "20000", "Tire Size": "ST225/75R15'E'" } } }),
    ],
  };

  /* ---------- jay-feather-air-sl : 3 floorplans, 3 options, 1 exterior ---------- */
  const jay_feather_air_sl = {
    exterior: [
      { id: "as-shown", name: "As shown", price: 0 },
    ],
    /* Jayco's published interior design(s) for this model, from the
       Interior Design panel on each floorplan page. Identical across
       every plan in the model, so it lives at model level. */
    interior: [
      { id: "dune-gray", name: "Dune Gray", price: 0, image: D + "jay-feather-air-sl__dune-gray.webp" },
    ],
    options: {
      "2496": { name: "Customer Value Package", price: 6000, mandatory: true },
      "2498": { name: "Overlander I Solar Package", price: 443 },
      "2497": { name: "Canadian Standards", price: 210 },
    },
    floorplans: [
      jf("15tbsl", "15TBSL", 0, { __m: "jay-feather-air-sl", sleeps: 2, length: "17' 6\"", weight: "2,515", optionIds: ["2496", "2497", "2498"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "230", "Unloaded Vehicle Weight (lbs)": "2,515", "Cargo Carrying Capacity (lbs)": "985", "Gross Vehicle Weight Rating (lbs)": "3,500" }, "Measurements": { "Exterior Length (overall)": "17' 6\"", "Length": "13' 7\"", "Exterior Height": "9' 5\"", "Exterior Height (with A/C)": "10' 1\"", "Exterior Width": "8' 0\"", "Interior Height (main)": "6' 6\"", "Awning Length": "9' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "30.0", "Gray Water Capacity (gals)": "20.0", "Black Tank Capacity (gals)": "30.0", "Propane Unit (lbs)": "20" }, "Miscellaneous": { "Sleeps": "up to 2", "Water Heater": "Tankless", "Furnace BTU": "19000", "Tire Size": "ST205/75R14'D'" } } }),
      jf("17bhsl", "17BHSL", 375, { __m: "jay-feather-air-sl", sleeps: 6, length: "21' 3\"", weight: "2,880", optionIds: ["2496", "2497", "2498"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "290", "Unloaded Vehicle Weight (lbs)": "2,880", "Cargo Carrying Capacity (lbs)": "870", "Gross Vehicle Weight Rating (lbs)": "3,750" }, "Measurements": { "Exterior Length (overall)": "21' 3\"", "Length": "17' 4\"", "Exterior Height": "9' 4\"", "Exterior Height (with A/C)": "10' 1\"", "Exterior Width": "8' 0\"", "Interior Height (main)": "6' 6\"", "Awning Length": "10' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "30.0", "Gray Water Capacity (gals)": "20.0", "Black Tank Capacity (gals)": "20.0", "Propane Unit (lbs)": "20" }, "Miscellaneous": { "Sleeps": "up to 6", "Water Heater": "Tankless", "# of outside storage compartments": "1", "Furnace BTU": "19000", "Tire Size": "ST205/75R14'D'" } } }),
      jf("17rbsl", "17RBSL", null, { __m: "jay-feather-air-sl", sleeps: 4, length: "21' 7\"", weight: "2,920", isNew: true, specs: { "Weights": { "Dry Hitch Weight (lbs)": "310", "Unloaded Vehicle Weight (lbs)": "2,920", "Cargo Carrying Capacity (lbs)": "830", "Gross Vehicle Weight Rating (lbs)": "3,750" }, "Measurements": { "Exterior Length (overall)": "21' 7\"", "Length": "18' 1\"", "Exterior Height": "9' 4\"", "Exterior Height (with A/C)": "10' 1\"", "Exterior Width": "8' 0\"", "Interior Height (main)": "6' 6\"", "Awning Length": "10' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "30.0", "Gray Water Capacity (gals)": "20.0", "Black Tank Capacity (gals)": "30.0", "Propane Unit (lbs)": "20" }, "Miscellaneous": { "Sleeps": "up to 4", "Water Heater": "Tankless", "# of outside storage compartments": "1", "Furnace BTU": "19000", "Tire Size": "ST205/75R14'D'" } } }),
    ],
  };

  /* ---------- jay-feather-sl : 2 floorplans, 8 options, 1 exterior ---------- */
  const jay_feather_sl = {
    exterior: [
      { id: "as-shown", name: "As shown", price: 0 },
    ],
    /* Jayco's published interior design(s) for this model, from the
       Interior Design panel on each floorplan page. Identical across
       every plan in the model, so it lives at model level. */
    interior: [
      { id: "dune-gray", name: "Dune Gray", price: 0, image: D + "jay-feather-sl__dune-gray.webp" },
    ],
    options: {
      "2523": { name: "Customer Value Package", price: 6000, mandatory: true },
      "2530": { name: "Theater Seating IPO Jack-Knife Sofa", price: 1343 },
      "2527": { name: "2nd 13,500 A/C in Bedroom", price: 893 },
      "2529": { name: "Tri-Fold Sofa IPO Jack-Knife Sofa", price: 743 },
      "2528": { name: "50 AMP Service with 2nd A/C Prep", price: 488 },
      "2525": { name: "Overlander I Solar Package", price: 443 },
      "2526": { name: "15,000 BTU A/C", price: 300 },
      "2524": { name: "Canadian Standards", price: 210 },
    },
    floorplans: [
      jf("25rlsl", "25RLSL", 0, { __m: "jay-feather-sl", sleeps: 6, length: "30' 1\"", weight: "5,310", slide: true, optionIds: ["2523", "2524", "2525", "2526", "2527", "2528", "2529", "2530"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "560", "Unloaded Vehicle Weight (lbs)": "5,310", "Cargo Carrying Capacity (lbs)": "1,490", "Gross Vehicle Weight Rating (lbs)": "6,800" }, "Measurements": { "Exterior Length (overall)": "30' 1\"", "Length": "27' 0\"", "Exterior Height": "9' 11\"", "Exterior Height (with A/C)": "10' 9\"", "Exterior Width": "8' 0\"", "Exterior Width (with slides out)": "10' 11\"", "Interior Height (main)": "6' 6\"", "Awning Length": "19' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "55.0", "Gray Water Capacity (gals)": "38.0", "Black Tank Capacity (gals)": "38.0", "Propane Unit (lbs)": "40" }, "Miscellaneous": { "Sleeps": "up to 6", "Water Heater": "Tankless", "# of outside storage compartments": "2", "Furnace BTU": "20000", "Tire Size": "ST205/75R14'D'" } } }),
      jf("26bhsl", "26BHSL", 150, { __m: "jay-feather-sl", sleeps: 10, length: "30' 5\"", weight: "5,555", slide: true, optionIds: ["2523", "2524", "2525", "2526", "2527", "2528", "2529", "2530"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "680", "Unloaded Vehicle Weight (lbs)": "5,555", "Cargo Carrying Capacity (lbs)": "1,645", "Gross Vehicle Weight Rating (lbs)": "7,200" }, "Measurements": { "Exterior Length (overall)": "30' 5\"", "Length": "27' 5\"", "Exterior Height": "9' 10\"", "Exterior Height (with A/C)": "10' 9\"", "Exterior Width": "8' 0\"", "Exterior Width (with slides out)": "10' 11\"", "Interior Height (main)": "6' 6\"", "Awning Length": "19' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "55.0", "Gray Water Capacity (gals)": "38.0", "Black Tank Capacity (gals)": "38.0", "Propane Unit (lbs)": "40" }, "Miscellaneous": { "Sleeps": "up to 10", "Water Heater": "Tankless", "# of outside storage compartments": "3", "Furnace BTU": "20000", "Tire Size": "ST205/75R14'D'" } } }),
    ],
  };

  /* ---------- jay-flight : 58 floorplans, 29 options, 1 exterior ---------- */
  const jay_flight = {
    exterior: [
      { id: "as-shown", name: "As shown", price: 0 },
    ],
    /* Jayco's published interior design(s) for this model, from the
       Interior Design panel on each floorplan page. Identical across
       every plan in the model, so it lives at model level. */
    interior: [
      { id: "dune-gray", name: "Dune Gray", price: 0, image: D + "jay-flight__dune-gray.webp" },
    ],
    options: {
      "2533": { name: "Customer Value Package Double Axle", price: 5250, mandatory: true },
      "2531": { name: "Customer Value Package Single Axle", price: 5250, mandatory: true },
      "2532": { name: "Customer Value Package Sports Edition", price: 5250, mandatory: true },
      "2559": { name: "Baja Package (Western Built Units Only - Select Double Axles)", price: 1493 },
      "2555": { name: "Theater Seating", price: 1343 },
      "2554": { name: "Tri-Fold Sofa", price: 1193 },
      "2558": { name: "Baja Edition Package (Western Built Units Only - Select Single Axles)", price: 1125 },
      "2675": { name: "2nd A/C Requires 50 AMP Service Double Axle", price: 893 },
      "2544": { name: "3rd A/C Double Axle", price: 893 },
      "2541": { name: "Elite Package (Optional on Slideout Models)", price: 893 },
      "2557": { name: "Front Bunks with Dinette", price: 893 },
      "2542": { name: "Overlander I Solar Package Double Axle", price: 893 },
      "2553": { name: "Tri-Fold Sofa", price: 743 },
      "2548": { name: "50 in. TV", price: 675 },
      "2536": { name: "13,500 BTU roof mount A/C Single Axle", price: 593 },
      "2549": { name: "Fiberglass Sidewalls Double Axle", price: 593 },
      "2550": { name: "Aluminum Rims Double Axles", price: 525 },
      "2552": { name: "Free Standing Table and (4) Chairs", price: 473 },
      "2545": { name: "50 AMP Service", price: 443 },
      "2537": { name: "Fiberglass Sidewalls Single Axle", price: 443 },
      "2539": { name: "Outside Griddle with LP Quick Connect Hose", price: 443 },
      "2535": { name: "Overlander I Solar Package Single Axle", price: 443 },
      "2546": { name: "32 in. TV", price: 413 },
      "2547": { name: "40 in. TV", price: 413 },
      "2543": { name: "15,000 BTU Roof Mount A/C", price: 300 },
      "2551": { name: "Outside Griddle", price: 293 },
      "2538": { name: "Aluminum Rims Single Axle", price: 263 },
      "2540": { name: "Canadian Standards", price: 210 },
      "2556": { name: "King Bed", price: 143 },
    },
    floorplans: [
      jf("130bh", "130BH", 0, { __m: "jay-flight", sleeps: 4, length: "16' 1\"", weight: "2,460", sport: true, optionIds: ["2532", "2540"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "240", "Unloaded Vehicle Weight (lbs)": "2,460", "Cargo Carrying Capacity (lbs)": "1,040", "Gross Vehicle Weight Rating (lbs)": "3,500" }, "Measurements": { "Exterior Length (overall)": "16' 1\"", "Length": "12' 10\"", "Exterior Height": "9' 6\"", "Exterior Width": "8' 0\"", "Interior Height (main)": "6' 6\"", "Awning Length": "8' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "30.0", "Gray Water Capacity (gals)": "19.0", "Black Tank Capacity (gals)": "39.0", "Propane Unit (lbs)": "20" }, "Miscellaneous": { "Sleeps": "up to 4", "Water Heater": "Tankless", "# of outside storage compartments": "1", "Furnace BTU": "19000", "Tire Size": "ST205/75R14'D'" } } }),
      jf("130rd-", "130RD", 450, { __m: "jay-flight", sleeps: 4, sport: true, optionIds: ["2532", "2540"], specs: { "Miscellaneous": { "Sleeps": "up to 4", "Water Heater": "Tankless", "# of outside storage compartments": "1", "Tire Size": "ST205/75R14'D'" } } }),
      jf("140tb", "140TB", 1050, { __m: "jay-flight", sleeps: 2, sport: true, optionIds: ["2532", "2540"], specs: { "Miscellaneous": { "Sleeps": "up to 2", "Water Heater": "Tankless", "# of outside storage compartments": "1", "Tire Size": "ST205/75R14'D'" } } }),
      jf("170bh", "170BH", 1275, { __m: "jay-flight", sleeps: 6, length: "21' 3\"", weight: "3,000", sport: true, optionIds: ["2532", "2540"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "325", "Unloaded Vehicle Weight (lbs)": "3,000", "Cargo Carrying Capacity (lbs)": "750", "Gross Vehicle Weight Rating (lbs)": "3,750" }, "Measurements": { "Exterior Length (overall)": "21' 3\"", "Length": "167' 5\"", "Exterior Height": "9' 5\"", "Exterior Width": "8' 0\"", "Interior Height (main)": "6' 6\"", "Awning Length": "10' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "30.0", "Gray Water Capacity (gals)": "19.9", "Black Tank Capacity (gals)": "19.9", "Propane Unit (lbs)": "20" }, "Miscellaneous": { "Sleeps": "up to 6", "Water Heater": "Tankless", "# of outside storage compartments": "1", "Furnace BTU": "19000", "Tire Size": "ST205/75R14'D'" } } }),
      jf("170fq", "170FQ", 1275, { __m: "jay-flight", sleeps: 4, length: "21' 5\"", weight: "3,060", sport: true, optionIds: ["2532", "2540"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "275", "Unloaded Vehicle Weight (lbs)": "3,060", "Cargo Carrying Capacity (lbs)": "790", "Gross Vehicle Weight Rating (lbs)": "3,850" }, "Measurements": { "Exterior Length (overall)": "21' 5\"", "Length": "17' 7\"", "Exterior Height": "9' 5\"", "Exterior Height (with A/C)": "10' 1\"", "Exterior Width": "8' 0\"", "Interior Height (main)": "6' 6\"", "Awning Length": "10' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "30.0", "Gray Water Capacity (gals)": "19.9", "Black Tank Capacity (gals)": "19.9" }, "Miscellaneous": { "Sleeps": "up to 4", "Water Heater": "Tankless", "# of outside storage compartments": "1", "Furnace BTU": "19000", "Tire Size": "ST205/75R14'D'" } } }),
      jf("130bhw", "130BHW", 1500, { __m: "jay-flight", sleeps: 4, length: "16' 1\"", weight: "2,450", sport: true, optionIds: ["2532", "2540"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "260", "Unloaded Vehicle Weight (lbs)": "2,450", "Cargo Carrying Capacity (lbs)": "1,050", "Gross Vehicle Weight Rating (lbs)": "3,500" }, "Measurements": { "Exterior Length (overall)": "16' 1\"", "Length": "12' 10\"", "Exterior Height": "9' 7\"", "Exterior Width": "8' 0\"", "Interior Height (main)": "6' 6\"", "Awning Length": "8' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "30.0", "Gray Water Capacity (gals)": "19.9", "Black Tank Capacity (gals)": "40.0", "Propane Unit (lbs)": "20" }, "Miscellaneous": { "Sleeps": "up to 4", "Water Heater": "Tankless", "# of outside storage compartments": "1", "Furnace BTU": "19000", "Tire Size": "ST205/75R14'D'" } } }),
      jf("130rdw", "130RDW", 1950, { __m: "jay-flight", sleeps: 4, length: "16' 1\"", weight: "2,530", sport: true, optionIds: ["2532", "2540"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "230", "Unloaded Vehicle Weight (lbs)": "2,530", "Cargo Carrying Capacity (lbs)": "970", "Gross Vehicle Weight Rating (lbs)": "3,500" }, "Measurements": { "Exterior Length (overall)": "16' 1\"", "Length": "12' 10\"", "Exterior Height": "9' 7\"", "Exterior Width": "8' 0\"", "Interior Height (main)": "6' 6\"", "Awning Length": "8' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "30.0", "Gray Water Capacity (gals)": "40.0", "Black Tank Capacity (gals)": "19.9", "Propane Unit (lbs)": "20" }, "Miscellaneous": { "Sleeps": "up to 4", "Water Heater": "Tankless", "# of outside storage compartments": "1", "Furnace BTU": "19000", "Tire Size": "ST205/75R14'D'" } } }),
      jf("140tbw", "140TBW", 2550, { __m: "jay-flight", sleeps: 2, length: "17' 6\"", weight: "2,565", sport: true, optionIds: ["2532", "2540"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "310", "Unloaded Vehicle Weight (lbs)": "2,565", "Cargo Carrying Capacity (lbs)": "935", "Gross Vehicle Weight Rating (lbs)": "3,500" }, "Measurements": { "Exterior Length (overall)": "17' 6\"", "Length": "13' 0\"", "Exterior Height": "9' 7\"", "Exterior Width": "8' 0\"", "Interior Height (main)": "6' 6\"", "Awning Length": "8' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "30.0", "Gray Water Capacity (gals)": "19.9", "Black Tank Capacity (gals)": "40.0", "Propane Unit (lbs)": "20" }, "Miscellaneous": { "Sleeps": "up to 2", "Water Heater": "Tankless", "# of outside storage compartments": "1", "Furnace BTU": "19000", "Tire Size": "ST205/75R14'D'" } } }),
      jf("172db", "172DB", 2850, { __m: "jay-flight", sleeps: 6, length: "22' 5\"", weight: "3,270", sport: true, optionIds: ["2532", "2540"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "405", "Unloaded Vehicle Weight (lbs)": "3,270", "Cargo Carrying Capacity (lbs)": "725", "Gross Vehicle Weight Rating (lbs)": "3,995" }, "Measurements": { "Exterior Length (overall)": "22' 5\"", "Length": "18' 6\"", "Exterior Height": "9' 5\"", "Exterior Width": "8' 0\"", "Interior Height (main)": "6' 6\"", "Awning Length": "13' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "30.0", "Gray Water Capacity (gals)": "39.0", "Black Tank Capacity (gals)": "39.0", "Propane Unit (lbs)": "20" }, "Miscellaneous": { "Sleeps": "up to 6", "Water Heater": "Tankless", "# of outside storage compartments": "1", "Furnace BTU": "19000", "Tire Size": "ST205/75R14'D'" } } }),
      jf("170bhw", "170BHW", 2925, { __m: "jay-flight", sleeps: 4, length: "21' 3\"", weight: "2,880", sport: true, optionIds: ["2532", "2540"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "330", "Unloaded Vehicle Weight (lbs)": "2,880", "Cargo Carrying Capacity (lbs)": "870", "Gross Vehicle Weight Rating (lbs)": "3,750" }, "Measurements": { "Exterior Length (overall)": "21' 3\"", "Length": "17' 6\"", "Exterior Height": "9' 6\"", "Exterior Width": "8' 0\"", "Interior Height (main)": "6' 6\"", "Awning Length": "10' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "30.0", "Gray Water Capacity (gals)": "19.9", "Black Tank Capacity (gals)": "19.9", "Propane Unit (lbs)": "20" }, "Miscellaneous": { "Sleeps": "up to 4", "Water Heater": "Tankless", "# of outside storage compartments": "1", "Furnace BTU": "19000", "Tire Size": "ST205/75R14'D'" } } }),
      jf("170fqw", "170FQW", 2925, { __m: "jay-flight", sleeps: 4, length: "21' 5\"", weight: "2,940", sport: true, optionIds: ["2532", "2540"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "280", "Unloaded Vehicle Weight (lbs)": "2,940", "Cargo Carrying Capacity (lbs)": "910", "Gross Vehicle Weight Rating (lbs)": "3,850" }, "Measurements": { "Exterior Length (overall)": "21' 5\"", "Length": "17' 8\"", "Exterior Height": "9' 7\"", "Exterior Width": "8' 0\"", "Interior Height (main)": "6' 6\"", "Awning Length": "12' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "30.0", "Gray Water Capacity (gals)": "19.9", "Black Tank Capacity (gals)": "19.9", "Propane Unit (lbs)": "20" }, "Miscellaneous": { "Sleeps": "up to 4", "Water Heater": "Tankless", "# of outside storage compartments": "1", "Furnace BTU": "19000", "Tire Size": "ST205/75R15'D'" } } }),
      jf("172dbw", "172DBW", 5100, { __m: "jay-flight", sleeps: 6, length: "22' 5\"", weight: "3,180", sport: true, optionIds: ["2532", "2540"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "415", "Unloaded Vehicle Weight (lbs)": "3,180", "Cargo Carrying Capacity (lbs)": "815", "Gross Vehicle Weight Rating (lbs)": "3,995" }, "Measurements": { "Exterior Length (overall)": "22' 5\"", "Length": "18' 7\"", "Exterior Height": "9' 7\"", "Exterior Height (with A/C)": "10' 1\"", "Exterior Width": "8' 0\"", "Interior Height (main)": "6' 6\"", "Awning Length": "13' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "30.0", "Gray Water Capacity (gals)": "40.0", "Black Tank Capacity (gals)": "40.0", "Propane Unit (lbs)": "20" }, "Miscellaneous": { "Sleeps": "up to 6", "Water Heater": "Tankless", "# of outside storage compartments": "2", "Furnace BTU": "19000", "Tire Size": "ST205/75R14'D'" } } }),
      jf("175bh", "175BH", 5175, { __m: "jay-flight", sleeps: 6, length: "22' 3\"", weight: "3,285", optionIds: ["2531", "2535", "2536", "2537", "2538", "2539", "2540"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "340", "Unloaded Vehicle Weight (lbs)": "3,285", "Cargo Carrying Capacity (lbs)": "1,315", "Gross Vehicle Weight Rating (lbs)": "4,600" }, "Measurements": { "Exterior Length (overall)": "22' 3\"", "Length": "18' 4\"", "Exterior Height": "6' 6\"", "Exterior Height (with A/C)": "10' 4\"", "Exterior Width": "8' 0\"", "Interior Height (main)": "6' 6\"", "Awning Length": "12' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "30.0", "Gray Water Capacity (gals)": "19.9", "Black Tank Capacity (gals)": "19.9", "Propane Unit (lbs)": "20" }, "Miscellaneous": { "Sleeps": "up to 6", "Water Heater": "Tankless", "# of outside storage compartments": "1", "Furnace BTU": "19000", "Tire Size": "ST225/75R15'E'" } } }),
      jf("175fq", "175FQ", 5175, { __m: "jay-flight", sleeps: 4, length: "22' 1\"", weight: "3,260", optionIds: ["2531", "2535", "2536", "2537", "2538", "2539", "2540"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "305", "Unloaded Vehicle Weight (lbs)": "3,260", "Cargo Carrying Capacity (lbs)": "1,240", "Gross Vehicle Weight Rating (lbs)": "4,500" }, "Measurements": { "Exterior Length (overall)": "22' 1\"", "Length": "18' 1\"", "Exterior Height": "9' 6\"", "Exterior Height (with A/C)": "10' 3\"", "Exterior Width": "8' 0\"", "Interior Height (main)": "6' 6\"", "Awning Length": "12' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "30.0", "Gray Water Capacity (gals)": "19.9", "Black Tank Capacity (gals)": "19.9", "Propane Unit (lbs)": "20" }, "Miscellaneous": { "Sleeps": "up to 4", "Water Heater": "Tankless", "# of outside storage compartments": "1", "Furnace BTU": "19000", "Tire Size": "ST225/75R15'E'" } } }),
      jf("178dbs", "178DBS", 6300, { __m: "jay-flight", sleeps: 8, length: "23' 7\"", weight: "3,730", slide: true, sport: true, optionIds: ["2532", "2540"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "515", "Unloaded Vehicle Weight (lbs)": "3,730", "Cargo Carrying Capacity (lbs)": "1,070", "Gross Vehicle Weight Rating (lbs)": "4,800" }, "Measurements": { "Exterior Length (overall)": "23' 7\"", "Length": "19' 9\"", "Exterior Height": "9' 7\"", "Exterior Height (with A/C)": "10' 3\"", "Exterior Width": "8' 0\"", "Exterior Width (with slides out)": "10' 4\"", "Interior Height (main)": "6' 6\"", "Awning Length": "10' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "30.0", "Gray Water Capacity (gals)": "39.0", "Black Tank Capacity (gals)": "39.0", "Propane Unit (lbs)": "20" }, "Miscellaneous": { "Sleeps": "up to 8", "Water Heater": "Tankless", "# of outside storage compartments": "3", "Furnace BTU": "19000", "Tire Size": "ST225/75R15'E\"" } } }),
      jf("250bh", "250BH", 6681, { __m: "jay-flight", sleeps: 10, length: "27' 7\"", weight: "4,200", sport: true, optionIds: ["2532", "2540"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "460", "Unloaded Vehicle Weight (lbs)": "4,200", "Cargo Carrying Capacity (lbs)": "1,800", "Gross Vehicle Weight Rating (lbs)": "6,000" }, "Measurements": { "Exterior Length (overall)": "27' 7\"", "Length": "23' 8\"", "Exterior Height": "9' 6\"", "Exterior Height (with A/C)": "10' 1\"", "Exterior Width": "8' 0\"", "Interior Height (main)": "6' 6\"", "Awning Length": "12' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "52.0", "Gray Water Capacity (gals)": "39.0", "Black Tank Capacity (gals)": "39.0", "Propane Unit (lbs)": "20" }, "Miscellaneous": { "Sleeps": "up to 10", "Water Heater": "Tankless", "# of outside storage compartments": "3", "Furnace BTU": "19000", "Tire Size": "ST205/75R14'D'" } } }),
      jf("175bhw", "175BHW", 7050, { __m: "jay-flight", sleeps: 6, length: "22' 3\"", weight: "3,260", optionIds: ["2531", "2536", "2537", "2538", "2539", "2540", "2558"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "345", "Unloaded Vehicle Weight (lbs)": "3,260", "Cargo Carrying Capacity (lbs)": "1,340", "Gross Vehicle Weight Rating (lbs)": "4,600" }, "Measurements": { "Exterior Length (overall)": "22' 3\"", "Length": "18' 4\"", "Exterior Height": "9' 6\"", "Exterior Height (with A/C)": "10' 1\"", "Exterior Width": "8' 0\"", "Interior Height (main)": "6' 6\"", "Awning Length": "12' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "30.0", "Gray Water Capacity (gals)": "19.9", "Black Tank Capacity (gals)": "19.9", "Propane Unit (lbs)": "20" }, "Miscellaneous": { "Sleeps": "up to 6", "Water Heater": "Tankless", "# of outside storage compartments": "1", "Furnace BTU": "19000", "Tire Size": "ST225/75R15'E'" } } }),
      jf("175fqw", "175FQW", 7050, { __m: "jay-flight", sleeps: 4, length: "22' 1\"", weight: "3,190", optionIds: ["2531", "2536", "2537", "2538", "2539", "2540", "2558"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "345", "Unloaded Vehicle Weight (lbs)": "3,190", "Cargo Carrying Capacity (lbs)": "1,310", "Gross Vehicle Weight Rating (lbs)": "4,500" }, "Measurements": { "Exterior Length (overall)": "22' 1\"", "Length": "18' 2\"", "Exterior Height": "9' 8\"", "Exterior Height (with A/C)": "10' 2\"", "Exterior Width": "8' 0\"", "Interior Height (main)": "6' 6\"", "Awning Length": "12' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "30.0", "Gray Water Capacity (gals)": "19.9", "Black Tank Capacity (gals)": "19.9", "Propane Unit (lbs)": "20" }, "Miscellaneous": { "Sleeps": "up to 4", "Water Heater": "Tankless", "# of outside storage compartments": "1", "Furnace BTU": "19000", "Tire Size": "ST225/75R15'E'" } } }),
      jf("178dbsw", "178DBSW", 8550, { __m: "jay-flight", sleeps: 8, length: "23' 7\"", weight: "3,615", slide: true, sport: true, optionIds: ["2532", "2540"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "505", "Unloaded Vehicle Weight (lbs)": "3,615", "Cargo Carrying Capacity (lbs)": "1,185", "Gross Vehicle Weight Rating (lbs)": "4,800" }, "Measurements": { "Exterior Length (overall)": "23' 7\"", "Length": "19' 9\"", "Exterior Height": "9' 8\"", "Exterior Height (with A/C)": "10' 2\"", "Exterior Width": "8' 0\"", "Exterior Width (with slides out)": "10' 4\"", "Interior Height (main)": "6' 6\"", "Awning Length": "10' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "30.0", "Gray Water Capacity (gals)": "40.0", "Black Tank Capacity (gals)": "40.0", "Propane Unit (lbs)": "20" }, "Miscellaneous": { "Sleeps": "up to 8", "Water Heater": "Tankless", "# of outside storage compartments": "3", "Furnace BTU": "19000", "Tire Size": "ST225/75R15'E\"" } } }),
      jf("250bhw", "250BHW", 8556, { __m: "jay-flight", sleeps: 10, length: "27' 7\"", weight: "4,100", sport: true, optionIds: ["2532", "2540"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "480", "Unloaded Vehicle Weight (lbs)": "4,100", "Cargo Carrying Capacity (lbs)": "1,900", "Gross Vehicle Weight Rating (lbs)": "6,000" }, "Measurements": { "Exterior Length (overall)": "27' 7\"", "Length": "23' 8\"", "Exterior Height": "9' 7\"", "Exterior Height (with A/C)": "10' 2\"", "Exterior Width": "8' 0\"", "Interior Height (main)": "6' 6\"", "Awning Length": "12' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "84.0", "Gray Water Capacity (gals)": "40.0", "Black Tank Capacity (gals)": "40.0", "Propane Unit (lbs)": "40" }, "Miscellaneous": { "Sleeps": "up to 10", "Water Heater": "Tankless", "# of outside storage compartments": "3", "Furnace BTU": "19000", "Tire Size": "ST205/75R14'D'" } } }),
      jf("180lk", "180LK", 8700, { __m: "jay-flight", sleeps: 4, length: "22' 9\"", weight: "3,555", slide: true, optionIds: ["2531", "2535", "2536", "2537", "2538", "2539", "2540"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "370", "Unloaded Vehicle Weight (lbs)": "3,555", "Cargo Carrying Capacity (lbs)": "1,245", "Gross Vehicle Weight Rating (lbs)": "4,800" }, "Measurements": { "Exterior Length (overall)": "22' 9\"", "Exterior Height": "9' 9\"", "Exterior Height (with A/C)": "10' 3\"", "Exterior Width": "8' 0\"", "Exterior Width (with slides out)": "9' 1\"", "Interior Height (main)": "6' 6\"", "Awning Length": "13' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "30.0", "Gray Water Capacity (gals)": "20.0", "Black Tank Capacity (gals)": "20.0", "Propane Unit (lbs)": "20" }, "Miscellaneous": { "Sleeps": "up to 4", "Water Heater": "Tankless", "# of outside storage compartments": "2", "Furnace BTU": "19000", "Tire Size": "ST225/75R15'E'" } } }),
      jf("197mb", "197MB", 9975, { __m: "jay-flight", sleeps: 8, length: "23' 7\"", weight: "3,965", slide: true, optionIds: ["2531", "2535", "2536", "2537", "2538", "2539", "2540"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "610", "Unloaded Vehicle Weight (lbs)": "3,965", "Cargo Carrying Capacity (lbs)": "1,030", "Gross Vehicle Weight Rating (lbs)": "4,995" }, "Measurements": { "Exterior Length (overall)": "23' 7\"", "Length": "19' 9\"", "Exterior Height": "9' 7\"", "Exterior Height (with A/C)": "10' 2\"", "Exterior Width": "8' 0\"", "Exterior Width (with slides out)": "10' 4\"", "Interior Height (main)": "6' 6\"", "Awning Length": "13' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "30.0", "Gray Water Capacity (gals)": "39.0", "Black Tank Capacity (gals)": "39.0", "Propane Unit (lbs)": "20" }, "Miscellaneous": { "Sleeps": "up to 8", "Water Heater": "Tankless", "# of outside storage compartments": "2", "Furnace BTU": "19000", "Tire Size": "ST225/75R15'E'" } } }),
      jf("180lkw", "180LKW", 10575, { __m: "jay-flight", sleeps: 4, length: "22' 9\"", weight: "3,645", slide: true, optionIds: ["2531", "2536", "2537", "2538", "2539", "2540", "2558"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "415", "Unloaded Vehicle Weight (lbs)": "3,645", "Cargo Carrying Capacity (lbs)": "1,305", "Gross Vehicle Weight Rating (lbs)": "4,950" }, "Measurements": { "Exterior Length (overall)": "22' 9\"", "Length": "18' 10\"", "Exterior Height": "9' 7\"", "Exterior Height (with A/C)": "10' 2\"", "Exterior Width": "8' 0\"", "Exterior Width (with slides out)": "9' 1\"", "Interior Height (main)": "6' 6\"", "Awning Length": "13' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "30.0", "Gray Water Capacity (gals)": "20.0", "Black Tank Capacity (gals)": "20.0", "Propane Unit (lbs)": "20" }, "Miscellaneous": { "Sleeps": "up to 4", "Water Heater": "Tankless", "# of outside storage compartments": "1", "Furnace BTU": "19000", "Tire Size": "ST225/75R15'E'" } } }),
      jf("197mbw", "197MBW", 11850, { __m: "jay-flight", sleeps: 8, length: "23' 7\"", weight: "3,900", slide: true, optionIds: ["2531", "2536", "2537", "2538", "2539", "2540", "2558"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "605", "Unloaded Vehicle Weight (lbs)": "3,900", "Cargo Carrying Capacity (lbs)": "1,250", "Gross Vehicle Weight Rating (lbs)": "5,150" }, "Measurements": { "Exterior Length (overall)": "23' 7\"", "Length": "19' 8\"", "Exterior Height": "9' 8\"", "Exterior Height (with A/C)": "10' 3\"", "Exterior Width": "8' 0\"", "Exterior Width (with slides out)": "10' 4\"", "Interior Height (main)": "6' 6\"", "Awning Length": "13' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "30.0", "Gray Water Capacity (gals)": "40.0", "Black Tank Capacity (gals)": "40.0" }, "Miscellaneous": { "Sleeps": "up to 8", "Water Heater": "Tankless", "# of outside storage compartments": "2", "Furnace BTU": "19000", "Tire Size": "ST225/75R15'E'" } } }),
      jf("210qb", "210QB", 11938, { __m: "jay-flight", sleeps: 6, length: "25' 8\"", weight: "4,275", optionIds: ["2533", "2539", "2540", "2542", "2543", "2546", "2549", "2550"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "450", "Unloaded Vehicle Weight (lbs)": "4,275", "Cargo Carrying Capacity (lbs)": "1,725", "Gross Vehicle Weight Rating (lbs)": "6,000" }, "Measurements": { "Exterior Length (overall)": "25' 8\"", "Length": "21' 9\"", "Exterior Height": "9' 10\"", "Exterior Height (with A/C)": "10' 6\"", "Exterior Width": "8' 0\"", "Interior Height (main)": "6' 9\"", "Awning Length": "16' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "52.0", "Gray Water Capacity (gals)": "39.0", "Black Tank Capacity (gals)": "39.0", "Propane Unit (lbs)": "40" }, "Miscellaneous": { "Sleeps": "up to 6", "Water Heater": "Tankless", "# of outside storage compartments": "2", "Furnace BTU": "20000", "Tire Size": "ST205/75R14'D'" } } }),
      jf("260bh", "260BH", 11938, { __m: "jay-flight", sleeps: 8, length: "29' 5\"", weight: "4,750", optionIds: ["2533", "2539", "2540", "2542", "2543", "2546", "2549", "2550", "2553", "2555"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "520", "Unloaded Vehicle Weight (lbs)": "4,750", "Cargo Carrying Capacity (lbs)": "1,750", "Gross Vehicle Weight Rating (lbs)": "6,500" }, "Measurements": { "Exterior Length (overall)": "29' 5\"", "Length": "25' 5\"", "Exterior Height": "9' 10\"", "Exterior Height (with A/C)": "10' 6\"", "Exterior Width": "8' 0\"", "Interior Height (main)": "6' 9\"", "Awning Length": "16' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "52.0", "Gray Water Capacity (gals)": "39.0", "Black Tank Capacity (gals)": "39.0", "Propane Unit (lbs)": "40" }, "Miscellaneous": { "Sleeps": "up to 8", "Water Heater": "Tankless", "# of outside storage compartments": "2", "Furnace BTU": "20000", "Tire Size": "ST205/75R14'D'" } } }),
      jf("270bhs", "270BHS", 13650, { __m: "jay-flight", sleeps: 10, length: "31' 10\"", weight: "5,590", slide: true, sport: true, optionIds: ["2532", "2540"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "725", "Unloaded Vehicle Weight (lbs)": "5,590", "Cargo Carrying Capacity (lbs)": "1,410", "Gross Vehicle Weight Rating (lbs)": "7,000" }, "Measurements": { "Exterior Length (overall)": "31' 10\"", "Length": "28' 4\"", "Exterior Height": "9' 11\"", "Exterior Height (with A/C)": "10' 9\"", "Exterior Width": "8' 0\"", "Exterior Width (with slides out)": "11' 0\"", "Interior Height (main)": "6' 6\"", "Awning Length": "14' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "52.0", "Gray Water Capacity (gals)": "39.0", "Black Tank Capacity (gals)": "39.0", "Propane Unit (lbs)": "20" }, "Miscellaneous": { "Sleeps": "up to 10", "Water Heater": "Tankless", "# of outside storage compartments": "2", "Furnace BTU": "19000", "Tire Size": "ST205/75R14'D'" } } }),
      jf("210qbw", "210QBW", 13813, { __m: "jay-flight", sleeps: 6, length: "25' 8\"", weight: "4,420", optionIds: ["2533", "2539", "2540", "2543", "2546", "2549", "2550", "2559"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "500", "Unloaded Vehicle Weight (lbs)": "4,420", "Cargo Carrying Capacity (lbs)": "1,780", "Gross Vehicle Weight Rating (lbs)": "6,200" }, "Measurements": { "Exterior Length (overall)": "25' 8\"", "Length": "21' 9\"", "Exterior Height": "10' 6\"", "Exterior Height (with A/C)": "11' 0\"", "Exterior Width": "8' 0\"", "Interior Height (main)": "6' 9\"", "Awning Length": "16' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "84.0", "Gray Water Capacity (gals)": "40.0", "Black Tank Capacity (gals)": "32.5", "Propane Unit (lbs)": "40" }, "Miscellaneous": { "Sleeps": "up to 6", "Water Heater": "Tankless", "# of outside storage compartments": "2", "Furnace BTU": "20000", "Tire Size": "ST205/75R14'D'" } } }),
      jf("260bhw", "260BHW", 13813, { __m: "jay-flight", sleeps: 10, length: "29' 5\"", weight: "4,905", optionIds: ["2533", "2539", "2540", "2543", "2546", "2549", "2550", "2559"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "545", "Unloaded Vehicle Weight (lbs)": "4,905", "Cargo Carrying Capacity (lbs)": "1,895", "Gross Vehicle Weight Rating (lbs)": "6,800" }, "Measurements": { "Exterior Length (overall)": "29' 5\"", "Length": "25' 5\"", "Exterior Height": "9' 11\"", "Exterior Height (with A/C)": "10' 5\"", "Exterior Width": "8' 0\"", "Interior Height (main)": "6' 9\"", "Awning Length": "16' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "84.0", "Gray Water Capacity (gals)": "40.0", "Black Tank Capacity (gals)": "40.0", "Propane Unit (lbs)": "40" }, "Miscellaneous": { "Sleeps": "up to 10", "Water Heater": "Tankless", "# of outside storage compartments": "2", "Furnace BTU": "20000", "Tire Size": "ST205/75R14'D'" } } }),
      jf("211mbw", "211MBW", 14625, { __m: "jay-flight", sleeps: 8, length: "24' 6\"", weight: "4,265", optionIds: ["2533", "2539", "2540", "2543", "2546", "2549", "2550", "2559"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "540", "Unloaded Vehicle Weight (lbs)": "4,265", "Cargo Carrying Capacity (lbs)": "2,035", "Gross Vehicle Weight Rating (lbs)": "6,300" }, "Measurements": { "Exterior Length (overall)": "24' 6\"", "Length": "20' 9\"", "Exterior Height": "10' 5\"", "Exterior Height (with A/C)": "11' 0\"", "Exterior Width": "8' 0\"", "Interior Height (main)": "6' 9\"", "Awning Length": "13' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "84.0", "Gray Water Capacity (gals)": "40.0", "Black Tank Capacity (gals)": "40.0", "Propane Unit (lbs)": "40", "Propane Unit (lbs) (Optional)": "60" }, "Miscellaneous": { "Sleeps": "up to 8", "Water Heater": "Tankless", "# of outside storage compartments": "3", "Furnace BTU": "19000", "Tire Size": "ST205/75R14'D'" } } }),
      jf("200mks", "200MKS", 15525, { __m: "jay-flight", sleeps: 2, length: "24' 7\"", weight: "4,965", slide: true, optionIds: ["2533", "2539", "2540", "2541", "2542", "2543", "2546", "2550"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "550", "Unloaded Vehicle Weight (lbs)": "4,965", "Cargo Carrying Capacity (lbs)": "1,535", "Gross Vehicle Weight Rating (lbs)": "6,500" }, "Measurements": { "Exterior Length (overall)": "24' 7\"", "Length": "21' 3\"", "Exterior Height": "10' 4\"", "Exterior Height (with A/C)": "11' 2\"", "Exterior Width": "8' 0\"", "Exterior Width (with slides out)": "11' 0\"", "Interior Height (main)": "6' 9\"", "Awning Length": "17' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "52.0", "Gray Water Capacity (gals)": "39.0", "Black Tank Capacity (gals)": "39.0", "Propane Unit (lbs)": "40" }, "Miscellaneous": { "Sleeps": "up to 2", "Water Heater": "Tankless", "# of outside storage compartments": "2", "Furnace BTU": "20000", "Tire Size": "ST205/75R14'D'" } } }),
      jf("245bhs", "245BHS", 16575, { __m: "jay-flight", sleeps: 8, length: "28' 7\"", weight: "5,555", slide: true, optionIds: ["2533", "2539", "2540", "2541", "2542", "2543", "2546", "2550"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "640", "Unloaded Vehicle Weight (lbs)": "5,555", "Cargo Carrying Capacity (lbs)": "1,645", "Gross Vehicle Weight Rating (lbs)": "7,200" }, "Measurements": { "Exterior Length (overall)": "28' 7\"", "Length": "25' 2\"", "Exterior Height": "10' 6\"", "Exterior Height (with A/C)": "11' 0\"", "Exterior Width": "8' 0\"", "Exterior Width (with slides out)": "11' 0\"", "Interior Height (main)": "6' 9\"", "Awning Length": "9' 9\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "52.0", "Gray Water Capacity (gals)": "39.0", "Black Tank Capacity (gals)": "39.0" }, "Miscellaneous": { "Sleeps": "up to 8", "Water Heater": "Tankless", "# of outside storage compartments": "2", "Furnace BTU": "30000", "Tire Size": "ST205/75R14'D'" } } }),
      jf("261bhs", "261BHS", 17938, { __m: "jay-flight", sleeps: 10, length: "30' 4\"", weight: "5,975", slide: true, optionIds: ["2675", "2533", "2539", "2540", "2541", "2542", "2543", "2545", "2547", "2550", "2553", "2555"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "745", "Unloaded Vehicle Weight (lbs)": "5,975", "Cargo Carrying Capacity (lbs)": "1,625", "Gross Vehicle Weight Rating (lbs)": "7,600" }, "Measurements": { "Exterior Length (overall)": "30' 4\"", "Length": "26' 11\"", "Exterior Height": "10' 5\"", "Exterior Height (with A/C)": "11' 1\"", "Exterior Width": "8' 0\"", "Exterior Width (with slides out)": "11' 0\"", "Interior Height (main)": "6' 9\"", "Awning Length": "16' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "52.0", "Gray Water Capacity (gals)": "39.0", "Black Tank Capacity (gals)": "39.0", "Propane Unit (lbs)": "40" }, "Miscellaneous": { "Sleeps": "up to 10", "Water Heater": "Tankless", "# of outside storage compartments": "2", "Furnace BTU": "20000", "Tire Size": "ST205/75R14'D'" } } }),
      jf("262rls", "262RLS", 18313, { __m: "jay-flight", sleeps: 6, length: "31' 1\"", weight: "6,205", slide: true, optionIds: ["2675", "2533", "2539", "2540", "2541", "2542", "2543", "2545", "2547", "2550", "2552", "2554"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "815", "Unloaded Vehicle Weight (lbs)": "6,205", "Cargo Carrying Capacity (lbs)": "1,695", "Gross Vehicle Weight Rating (lbs)": "7,900" }, "Measurements": { "Exterior Length (overall)": "31' 1\"", "Length": "27' 8\"", "Exterior Height": "10' 5\"", "Exterior Height (with A/C)": "11' 0\"", "Exterior Width": "8' 0\"", "Exterior Width (with slides out)": "11' 0\"", "Interior Height (main)": "6' 9\"", "Awning Length": "18' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "52.0", "Gray Water Capacity (gals)": "39.0", "Black Tank Capacity (gals)": "39.0", "Propane Unit (lbs)": "40" }, "Miscellaneous": { "Sleeps": "up to 6", "Water Heater": "Tankless", "# of outside storage compartments": "2", "Furnace BTU": "20000", "Tire Size": "ST205/75R14'D'" } } }),
      jf("200mksw", "200MKSW", 18525, { __m: "jay-flight", sleeps: 2, length: "24' 7\"", weight: "4,840", slide: true, optionIds: ["2533", "2539", "2540", "2541", "2543", "2546", "2550"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "520", "Unloaded Vehicle Weight (lbs)": "4,840", "Cargo Carrying Capacity (lbs)": "1,660", "Gross Vehicle Weight Rating (lbs)": "6,500" }, "Measurements": { "Exterior Length (overall)": "24' 7\"", "Length": "21' 2\"", "Exterior Height": "10' 5\"", "Exterior Height (with A/C)": "11' 0\"", "Exterior Width": "8' 0\"", "Exterior Width (with slides out)": "11' 0\"", "Interior Height (main)": "6' 9\"", "Awning Length": "17' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "76.0", "Gray Water Capacity (gals)": "40.0", "Black Tank Capacity (gals)": "40.0", "Propane Unit (lbs)": "40" }, "Miscellaneous": { "Sleeps": "up to 2", "Water Heater": "Tankless", "# of outside storage compartments": "2", "Furnace BTU": "20000", "Tire Size": "ST205/75R14'D'" } } }),
      jf("265mws", "265MWS", 18675, { __m: "jay-flight", sleeps: 6, length: "29' 10\"", weight: "5,770", slide: true, optionIds: ["2675", "2533", "2539", "2540", "2541", "2542", "2543", "2545", "2547", "2550", "2552", "2553", "2555"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "570", "Unloaded Vehicle Weight (lbs)": "5,770", "Cargo Carrying Capacity (lbs)": "1,930", "Gross Vehicle Weight Rating (lbs)": "7,700" }, "Measurements": { "Exterior Length (overall)": "29' 10\"", "Length": "27' 0\"", "Exterior Height": "10' 5\"", "Exterior Height (with A/C)": "11' 0\"", "Exterior Width": "8' 0\"", "Exterior Width (with slides out)": "11' 0\"", "Interior Height (main)": "6' 9\"", "Awning Length": "18' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "52.0", "Gray Water Capacity (gals)": "39.0", "Black Tank Capacity (gals)": "39.0", "Propane Unit (lbs)": "40" }, "Miscellaneous": { "Sleeps": "up to 6", "Water Heater": "Tankless", "# of outside storage compartments": "2", "Furnace BTU": "20000", "Tire Size": "ST205/75R14'D'" } } }),
      jf("225mls", "225MLS", 18907, { __m: "jay-flight", sleeps: 4, length: "27' 1\"", weight: "5,280", slide: true, optionIds: ["2533", "2539", "2540", "2541", "2542", "2543", "2546", "2550"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "555", "Unloaded Vehicle Weight (lbs)": "5,280", "Cargo Carrying Capacity (lbs)": "1,620", "Gross Vehicle Weight Rating (lbs)": "6,900" }, "Measurements": { "Exterior Length (overall)": "27' 1\"", "Length": "23' 8\"", "Exterior Height": "10' 3\"", "Exterior Height (with A/C)": "11' 0\"", "Exterior Width": "8' 0\"", "Exterior Width (with slides out)": "10' 0\"", "Interior Height (main)": "6' 9\"", "Awning Length": "18' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "52.0", "Gray Water Capacity (gals)": "39.0", "Black Tank Capacity (gals)": "39.0", "Propane Unit (lbs)": "40", "Propane Unit (lbs) (Optional)": "60" }, "Miscellaneous": { "Sleeps": "up to 4", "Water Heater": "Tankless", "# of outside storage compartments": "2", "Furnace BTU": "30000", "Tire Size": "ST205/75R14'D'" } } }),
      jf("263bhs", "263BHS", 19425, { __m: "jay-flight", sleeps: 10, length: "32' 6\"", weight: "6,335", slide: true, optionIds: ["2675", "2533", "2539", "2540", "2541", "2542", "2543", "2545", "2547", "2550", "2553", "2555"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "785", "Unloaded Vehicle Weight (lbs)": "6,335", "Cargo Carrying Capacity (lbs)": "1,865", "Gross Vehicle Weight Rating (lbs)": "8,200" }, "Measurements": { "Exterior Length (overall)": "32' 6\"", "Length": "29' 3\"", "Exterior Height": "10' 5\"", "Exterior Height (with A/C)": "11' 0\"", "Exterior Width": "8' 0\"", "Exterior Width (with slides out)": "11' 0\"", "Interior Height (main)": "6' 9\"", "Awning Length": "20' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "52.0", "Gray Water Capacity (gals)": "39.0", "Black Tank Capacity (gals)": "39.0", "Propane Unit (lbs)": "40" }, "Miscellaneous": { "Sleeps": "up to 10", "Water Heater": "Tankless", "# of outside storage compartments": "3", "Furnace BTU": "20000", "Tire Size": "ST205/75R14'D'" } } }),
      jf("245bhsw", "245BHSW", 19575, { __m: "jay-flight", sleeps: 6, length: "28' 7\"", weight: "5,460", slide: true, optionIds: ["2533", "2539", "2540", "2541", "2543", "2546", "2550"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "630", "Unloaded Vehicle Weight (lbs)": "5,460", "Cargo Carrying Capacity (lbs)": "1,540", "Gross Vehicle Weight Rating (lbs)": "7,000" }, "Measurements": { "Exterior Length (overall)": "28' 7\"", "Length": "25' 3\"", "Exterior Height": "10' 6\"", "Exterior Height (with A/C)": "11' 0\"", "Exterior Width": "8' 0\"", "Exterior Width (with slides out)": "11' 0\"", "Interior Height (main)": "6' 9\"", "Awning Length": "14' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "76.0", "Gray Water Capacity (gals)": "40.0", "Black Tank Capacity (gals)": "40.0", "Propane Unit (lbs)": "40" }, "Miscellaneous": { "Sleeps": "up to 6", "Water Heater": "Tankless", "# of outside storage compartments": "2", "Furnace BTU": "30000", "Tire Size": "ST205/75R14'D'" } } }),
      jf("265th", "265TH", 20257, { __m: "jay-flight", sleeps: 4, length: "30' 4\"", weight: "5,260", toyHauler: true, optionIds: ["2675", "2533", "2540", "2542", "2543", "2545", "2546", "2549", "2550", "2551"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "885", "Unloaded Vehicle Weight (lbs)": "5,260", "Cargo Carrying Capacity (lbs)": "3,240", "Gross Vehicle Weight Rating (lbs)": "8,500" }, "Measurements": { "Exterior Length (overall)": "30' 4\"", "Length": "27' 2\"", "Exterior Height": "10' 1\"", "Exterior Height (with A/C)": "10' 9\"", "Exterior Width": "8' 0\"", "Interior Height (main)": "6' 9\"", "Awning Length": "16' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "52.0", "Gray Water Capacity (gals)": "39.0", "Black Tank Capacity (gals)": "39.0", "Propane Unit (lbs)": "40" }, "Miscellaneous": { "Sleeps": "up to 4", "Water Heater": "Tankless", "# of outside storage compartments": "2", "Furnace BTU": "20000", "Tire Size": "ST225/75R15'E'" } } }),
      jf("261bhsw", "261BHSW", 20938, { __m: "jay-flight", sleeps: 10, length: "30' 3\"", weight: "5,765", slide: true, optionIds: ["2675", "2533", "2539", "2540", "2541", "2543", "2545", "2547", "2550", "2553", "2555"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "805", "Unloaded Vehicle Weight (lbs)": "5,765", "Cargo Carrying Capacity (lbs)": "1,835", "Gross Vehicle Weight Rating (lbs)": "7,600" }, "Measurements": { "Exterior Length (overall)": "30' 3\"", "Length": "26' 11\"", "Exterior Height": "10' 5\"", "Exterior Height (with A/C)": "11' 0\"", "Exterior Width": "8' 0\"", "Exterior Width (with slides out)": "11' 0\"", "Interior Height (main)": "6' 9\"", "Awning Length": "16' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "76.0", "Gray Water Capacity (gals)": "40.0", "Black Tank Capacity (gals)": "40.0", "Propane Unit (lbs)": "40" }, "Miscellaneous": { "Sleeps": "up to 10", "Water Heater": "Tankless", "# of outside storage compartments": "2", "Furnace BTU": "20000", "Tire Size": "ST205/75R14'D'" } } }),
      jf("262rlsw", "262RLSW", 21313, { __m: "jay-flight", sleeps: 6, length: "31' 1\"", weight: "6,290", slide: true, optionIds: ["2675", "2533", "2539", "2540", "2541", "2543", "2545", "2547", "2550", "2552", "2554", "2555"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "840", "Unloaded Vehicle Weight (lbs)": "6,290", "Cargo Carrying Capacity (lbs)": "1,810", "Gross Vehicle Weight Rating (lbs)": "8,100" }, "Measurements": { "Exterior Length (overall)": "31' 1\"", "Length": "27' 9\"", "Exterior Height": "10' 8\"", "Exterior Height (with A/C)": "11' 2\"", "Exterior Width": "8' 0\"", "Exterior Width (with slides out)": "11' 0\"", "Interior Height (main)": "6' 9\"", "Awning Length": "18' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "76.0", "Gray Water Capacity (gals)": "40.0", "Black Tank Capacity (gals)": "40.0", "Propane Unit (lbs)": "40" }, "Miscellaneous": { "Sleeps": "up to 6", "Water Heater": "Tankless", "# of outside storage compartments": "2", "Furnace BTU": "20000", "Tire Size": "ST225/75R14'E'" } } }),
      jf("265mwsw", "265MWSW", 21675, { __m: "jay-flight", sleeps: 4, optionIds: ["2675", "2533", "2539", "2540", "2541", "2543", "2545", "2547", "2550", "2552", "2555"], specs: { "Miscellaneous": { "Sleeps": "up to 4", "Water Heater": "Tankless", "# of outside storage compartments": "2", "Tire Size": "ST205/75R14'D'" } } }),
      jf("225mlsw", "225MLSW", 21907, { __m: "jay-flight", sleeps: 6, length: "27' 1\"", weight: "5,220", slide: true, optionIds: ["2533", "2539", "2540", "2541", "2543", "2546", "2550"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "520", "Unloaded Vehicle Weight (lbs)": "5,220", "Cargo Carrying Capacity (lbs)": "1,775", "Gross Vehicle Weight Rating (lbs)": "6,995" }, "Measurements": { "Exterior Length (overall)": "27' 1\"", "Length": "23' 9\"", "Exterior Height": "10' 6\"", "Exterior Height (with A/C)": "11' 0\"", "Exterior Width": "8' 0\"", "Exterior Width (with slides out)": "10' 0\"", "Interior Height (main)": "6' 9\"", "Awning Length": "18' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "76.0", "Gray Water Capacity (gals)": "40.0", "Black Tank Capacity (gals)": "40.0", "Propane Unit (lbs)": "40" }, "Miscellaneous": { "Sleeps": "up to 6", "Water Heater": "Tankless", "# of outside storage compartments": "2", "Furnace BTU": "30000", "Tire Size": "ST205/75R14'D'" } } }),
      jf("263bhsw", "263BHSW", 22425, { __m: "jay-flight", sleeps: 10, length: "32' 6\"", weight: "6,250", slide: true, optionIds: ["2675", "2533", "2539", "2540", "2541", "2543", "2545", "2547", "2550", "2553", "2555"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "770", "Unloaded Vehicle Weight (lbs)": "6,250", "Cargo Carrying Capacity (lbs)": "1,950", "Gross Vehicle Weight Rating (lbs)": "8,200" }, "Measurements": { "Exterior Length (overall)": "32' 6\"", "Length": "29' 3\"", "Exterior Height": "10' 8\"", "Exterior Height (with A/C)": "11' 3\"", "Exterior Width": "8' 0\"", "Exterior Width (with slides out)": "11' 0\"", "Interior Height (main)": "8' 0\"", "Awning Length": "20' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "76.0", "Gray Water Capacity (gals)": "80.0", "Black Tank Capacity (gals)": "40.0", "Propane Unit (lbs)": "40" }, "Miscellaneous": { "Sleeps": "up to 10", "Water Heater": "Tankless", "# of outside storage compartments": "3", "Furnace BTU": "20000", "Tire Size": "ST225/75R14'E'" } } }),
      jf("280bhs", "280BHS", 22650, { __m: "jay-flight", sleeps: 10, length: "34' 1\"", weight: "6,515", slide: true, optionIds: ["2675", "2533", "2539", "2540", "2541", "2542", "2543", "2545", "2547", "2550", "2553", "2555"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "775", "Unloaded Vehicle Weight (lbs)": "6,515", "Cargo Carrying Capacity (lbs)": "1,985", "Gross Vehicle Weight Rating (lbs)": "8,500" }, "Measurements": { "Exterior Length (overall)": "34' 1\"", "Length": "30' 6\"", "Exterior Height": "10' 5\"", "Exterior Height (with A/C)": "11' 1\"", "Exterior Width": "8' 0\"", "Exterior Width (with slides out)": "11' 0\"", "Interior Height (main)": "6' 9\"", "Awning Length": "18' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "52.0", "Gray Water Capacity (gals)": "39.0", "Black Tank Capacity (gals)": "39.0", "Propane Unit (lbs)": "40" }, "Miscellaneous": { "Sleeps": "up to 10", "Water Heater": "Tankless", "# of outside storage compartments": "3", "Furnace BTU": "20000", "Tire Size": "ST225/75R15'E'" } } }),
      jf("330tbs", "330TBS", 23925, { __m: "jay-flight", sleeps: 10, length: "37' 7\"", weight: "7,280", slide: true, optionIds: ["2675", "2533", "2539", "2540", "2541", "2542", "2543", "2544", "2545", "2546", "2550", "2553", "2555"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "880", "Unloaded Vehicle Weight (lbs)": "7,280", "Cargo Carrying Capacity (lbs)": "2,020", "Gross Vehicle Weight Rating (lbs)": "9,300" }, "Measurements": { "Exterior Length (overall)": "37' 7\"", "Length": "34' 2\"", "Exterior Height": "10' 8\"", "Exterior Height (with A/C)": "11' 3\"", "Exterior Width": "8' 0\"", "Exterior Width (with slides out)": "11' 0\"", "Interior Height (main)": "6' 9\"", "Awning Length": "20' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "52.0", "Gray Water Capacity (gals)": "78.0", "Black Tank Capacity (gals)": "78.0", "Propane Unit (lbs)": "40" }, "Miscellaneous": { "Sleeps": "up to 10", "Water Heater": "Tankless", "# of outside storage compartments": "2", "Furnace BTU": "20000", "Tire Size": "ST225/75R15'E'" } } }),
      jf("295tbs", "295TBS", 24300, { __m: "jay-flight", sleeps: 9, length: "36' 10\"", weight: "7,180", slide: true, optionIds: ["2675", "2533", "2539", "2540", "2541", "2542", "2543", "2544", "2545", "2547", "2550", "2553", "2555"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "840", "Unloaded Vehicle Weight (lbs)": "7,180", "Cargo Carrying Capacity (lbs)": "2,120", "Gross Vehicle Weight Rating (lbs)": "9,300" }, "Measurements": { "Exterior Length (overall)": "36' 10\"", "Length": "33' 5\"", "Exterior Height": "10' 7\"", "Exterior Height (with A/C)": "11' 3\"", "Exterior Width": "8' 0\"", "Exterior Width (with slides out)": "11' 0\"", "Interior Height (main)": "6' 9\"", "Awning Length": "18' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "52.0", "Gray Water Capacity (gals)": "39.0", "Black Tank Capacity (gals)": "39.0" }, "Miscellaneous": { "Sleeps": "up to 9", "Water Heater": "Tankless", "# of outside storage compartments": "2", "Furnace BTU": "30000", "Tire Size": "ST225/75R15'E'" } } }),
      jf("321bds", "321BDS", 26775, { __m: "jay-flight", sleeps: 11, length: "36' 4\"", weight: "7,810", slide: true, optionIds: ["2675", "2533", "2539", "2540", "2541", "2542", "2543", "2544", "2545", "2547", "2550", "2553", "2555"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "1,030", "Unloaded Vehicle Weight (lbs)": "7,810", "Cargo Carrying Capacity (lbs)": "1,990", "Gross Vehicle Weight Rating (lbs)": "9,800" }, "Measurements": { "Exterior Length (overall)": "36' 4\"", "Length": "32' 11\"", "Exterior Height": "10' 7\"", "Exterior Height (with A/C)": "11' 2\"", "Exterior Width": "8' 0\"", "Exterior Width (with slides out)": "11' 0\"", "Interior Height (main)": "6' 9\"", "Awning Length": "18' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "52.0", "Gray Water Capacity (gals)": "32.5", "Black Tank Capacity (gals)": "39.0", "Propane Unit (lbs)": "40" }, "Miscellaneous": { "Sleeps": "up to 11", "Water Heater": "Tankless", "# of outside storage compartments": "3", "Furnace BTU": "35000", "Tire Size": "ST225/75R15'E'" } } }),
      jf("290rls", "290RLS", 30225, { __m: "jay-flight", sleeps: 6, length: "34' 9\"", weight: "7,575", slide: true, optionIds: ["2675", "2533", "2539", "2540", "2541", "2542", "2543", "2544", "2545", "2547", "2550", "2552", "2553", "2555"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "710", "Unloaded Vehicle Weight (lbs)": "7,575", "Cargo Carrying Capacity (lbs)": "2,025", "Gross Vehicle Weight Rating (lbs)": "9,600" }, "Measurements": { "Exterior Length (overall)": "34' 9\"", "Length": "31' 5\"", "Exterior Height": "10' 6\"", "Exterior Height (with A/C)": "11' 2\"", "Exterior Width": "8' 0\"", "Exterior Width (with slides out)": "13' 0\"", "Interior Height (main)": "6' 9\"", "Awning Length": "12' 0\"", "Awning Length 2": "10' 6\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "52.0", "Gray Water Capacity (gals)": "39.0", "Black Tank Capacity (gals)": "39.0", "Propane Unit (lbs)": "40" }, "Miscellaneous": { "Sleeps": "up to 6", "Water Heater": "Tankless", "# of outside storage compartments": "2", "Furnace BTU": "35000", "Tire Size": "ST225/75R15'E'" } } }),
      jf("325bht", "325BHT", 31800, { __m: "jay-flight", sleeps: 11, length: "38' 4\"", weight: "8,475", slide: true, optionIds: ["2533", "2539", "2540", "2541", "2542", "2543", "2545", "2546", "2550", "2553", "2555", "2556"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "1,080", "Unloaded Vehicle Weight (lbs)": "8,475", "Cargo Carrying Capacity (lbs)": "2,125", "Gross Vehicle Weight Rating (lbs)": "10,600" }, "Measurements": { "Exterior Length (overall)": "38' 4\"", "Length": "34' 11\"", "Exterior Height": "10' 7\"", "Exterior Height (with A/C)": "11' 2\"", "Exterior Height (with 2nd A/C)": "11' 2\"", "Exterior Width": "8' 0\"", "Exterior Width (with slides out)": "11' 0\"", "Interior Height (main)": "6' 9\"", "Awning Length": "20' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "52.0", "Gray Water Capacity (gals)": "78.0", "Black Tank Capacity (gals)": "39.0" }, "Miscellaneous": { "Sleeps": "up to 11", "Water Heater": "Tankless", "# of outside storage compartments": "3", "Furnace BTU": "35000", "Tire Size": "ST225/75R15'E'" } } }),
      jf("380dqs", "380DQS", 32332, { __m: "jay-flight", sleeps: 8, length: "40' 4\"", weight: "8,430", slide: true, optionIds: ["2675", "2533", "2539", "2540", "2541", "2542", "2543", "2544", "2545", "2547", "2550", "2553", "2555", "2556", "2557"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "1,070", "Unloaded Vehicle Weight (lbs)": "8,430", "Cargo Carrying Capacity (lbs)": "2,070", "Gross Vehicle Weight Rating (lbs)": "10,500" }, "Measurements": { "Exterior Length (overall)": "40' 4\"", "Length": "37' 0\"", "Exterior Height": "10' 7\"", "Exterior Height (with A/C)": "11' 2\"", "Exterior Height (with 2nd A/C)": "11' 2\"", "Exterior Width": "8' 0\"", "Exterior Width (with slides out)": "11' 0\"", "Interior Height (main)": "6' 9\"", "Awning Length": "19' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "52.0", "Gray Water Capacity (gals)": "78.0", "Black Tank Capacity (gals)": "39.0", "Propane Unit (lbs)": "40" }, "Miscellaneous": { "Sleeps": "up to 8", "Water Heater": "Tankless", "# of outside storage compartments": "3", "Furnace BTU": "35000", "Tire Size": "ST225/75R15'E'" } } }),
      jf("333bts", "333BTS", 34275, { __m: "jay-flight", sleeps: 11, length: "37' 10\"", weight: "8,375", slide: true, optionIds: ["2675", "2533", "2539", "2540", "2541", "2542", "2543", "2544", "2545", "2547", "2550", "2553", "2555"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "1,180", "Unloaded Vehicle Weight (lbs)": "8,375", "Cargo Carrying Capacity (lbs)": "2,125", "Gross Vehicle Weight Rating (lbs)": "10,500" }, "Measurements": { "Exterior Length (overall)": "37' 10\"", "Length": "34' 5\"", "Exterior Height": "10' 7\"", "Exterior Height (with A/C)": "11' 3\"", "Exterior Width": "7' 2\"", "Exterior Width (with slides out)": "13' 1\"", "Interior Height (main)": "6' 9\"", "Awning Length": "20' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "52.0", "Gray Water Capacity (gals)": "71.5", "Black Tank Capacity (gals)": "39.0", "Propane Unit (lbs)": "40" }, "Miscellaneous": { "Sleeps": "up to 11", "Water Heater": "Tankless", "# of outside storage compartments": "2", "Furnace BTU": "35000", "Tire Size": "ST225/75R15'E'" } } }),
      jf("334rts", "334RTS", 35407, { __m: "jay-flight", sleeps: 8, length: "37' 10\"", weight: "8,655", slide: true, optionIds: ["2675", "2533", "2539", "2540", "2541", "2542", "2543", "2544", "2545", "2548", "2550", "2552", "2553", "2556"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "1,035", "Unloaded Vehicle Weight (lbs)": "8,655", "Cargo Carrying Capacity (lbs)": "1,945", "Gross Vehicle Weight Rating (lbs)": "10,600" }, "Measurements": { "Exterior Length (overall)": "37' 10\"", "Length": "34' 5\"", "Exterior Height": "10' 7\"", "Exterior Height (with A/C)": "11' 2\"", "Exterior Height (with 2nd A/C)": "11' 2\"", "Exterior Width": "8' 0\"", "Exterior Width (with slides out)": "13' 10\"", "Interior Height (main)": "6' 9\"", "Awning Length": "14' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "52.0", "Gray Water Capacity (gals)": "71.5", "Black Tank Capacity (gals)": "39.0", "Propane Unit (lbs)": "40" }, "Miscellaneous": { "Sleeps": "up to 8", "Water Heater": "Tankless", "# of outside storage compartments": "3", "Furnace BTU": "35000", "Tire Size": "ST225/75R15'E'" } } }),
      jf("270bhsw", "270BHSW", null, { __m: "jay-flight", sleeps: 10, length: "31' 10\"", weight: "5,380", slide: true, sport: true, isNew: true, specs: { "Weights": { "Dry Hitch Weight (lbs)": "760", "Unloaded Vehicle Weight (lbs)": "5,380", "Cargo Carrying Capacity (lbs)": "1,620", "Gross Vehicle Weight Rating (lbs)": "7,000" }, "Measurements": { "Exterior Length (overall)": "31' 10\"", "Length": "28' 6\"", "Exterior Height": "10' 2\"", "Exterior Height (with A/C)": "10' 9\"", "Exterior Width": "8' 0\"", "Exterior Width (with slides out)": "11' 0\"", "Interior Height (main)": "6' 6\"", "Awning Length": "14' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "84.0", "Gray Water Capacity (gals)": "40.0", "Black Tank Capacity (gals)": "40.0", "Propane Unit (lbs)": "20" }, "Miscellaneous": { "Sleeps": "up to 10", "Water Heater": "Tankless", "# of outside storage compartments": "2", "Furnace BTU": "19000", "Tire Size": "ST205/75R14'D'" } } }),
      jf("270mks", "270MKS", null, { __m: "jay-flight", isNew: true, specs: { "Measurements": { "Exterior Height (with A/C)": "18' 0\"" }, "Miscellaneous": { "Water Heater": "Tankless" } } }),
      jf("280bhsw", "280BHSW", null, { __m: "jay-flight", sleeps: 10, isNew: true, specs: { "Miscellaneous": { "Sleeps": "up to 10", "Water Heater": "Tankless", "# of outside storage compartments": "2" } } }),
      jf("335bhs", "335BHS", null, { __m: "jay-flight", sleeps: 10, length: "37' 7\"", weight: "6,925", slide: true, isNew: true, specs: { "Weights": { "Dry Hitch Weight (lbs)": "975", "Unloaded Vehicle Weight (lbs)": "6,925", "Cargo Carrying Capacity (lbs)": "2,075", "Gross Vehicle Weight Rating (lbs)": "9,000" }, "Measurements": { "Exterior Length (overall)": "37' 7\"", "Length": "34' 2\"", "Exterior Height": "11' 4\"", "Exterior Height (with A/C)": "11' 4\"", "Exterior Height (with 2nd A/C)": "11' 4\"", "Exterior Width": "8' 0\"", "Exterior Width (with slides out)": "11' 0\"", "Interior Height (main)": "6' 9\"", "Awning Length": "14' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "52.0", "Gray Water Capacity (gals)": "39.0", "Black Tank Capacity (gals)": "39.0", "Propane Unit (lbs)": "40" }, "Miscellaneous": { "Sleeps": "up to 10", "Water Heater": "Tankless", "# of outside storage compartments": "3", "Furnace BTU": "20000", "Tire Size": "ST225/75R15'E'" } } }),
    ],
  };

  /* ---------- jay-flight-bungalow : 6 floorplans, 6 options, 1 exterior ---------- */
  const jay_flight_bungalow = {
    exterior: [
      { id: "as-shown", name: "As shown", price: 0 },
    ],
    /* Jayco's published interior design(s) for this model, from the
       Interior Design panel on each floorplan page. Identical across
       every plan in the model, so it lives at model level. */
    interior: [
      { id: "dune-gray", name: "Dune Gray", price: 0, image: D + "jay-flight-bungalow__dune-gray.webp" },
    ],
    options: {
      "2561": { name: "Customer Value Package", price: 6300, mandatory: true },
      "2564": { name: "3rd 13,500 BTU A/C", price: 1493 },
      "2565": { name: "Fiberglass Sidewalls", price: 1193 },
      "2560": { name: "Canadian Standards", price: 233 },
      "2563": { name: "Residential Plumbing Package", price: 195 },
      "2566": { name: "King Bed", price: 90 },
    },
    floorplans: [
      jf("401flts", "401FLTS", 0, { __m: "jay-flight-bungalow", sleeps: 4, length: "40' 4\"", weight: "10,355", slide: true, optionIds: ["2560", "2561", "2563", "2564", "2565", "2566"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "1,515", "Unloaded Vehicle Weight (lbs)": "10,355", "Cargo Carrying Capacity (lbs)": "1,645", "Gross Vehicle Weight Rating (lbs)": "12,000" }, "Measurements": { "Exterior Length (overall)": "40' 4\"", "Length": "37' 5\"", "Exterior Height": "12' 0\"", "Exterior Height (with A/C)": "12' 7\"", "Exterior Height (with 2nd A/C)": "12' 7\"", "Exterior Width": "8' 0\"", "Exterior Width (with slides out)": "13' 6\"", "Interior Height (main)": "8' 0\"", "Awning Length": "20' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "52.0", "Gray Water Capacity (gals)": "39.0", "Black Tank Capacity (gals)": "39.0", "Propane Unit (lbs)": "60" }, "Miscellaneous": { "Sleeps": "up to 4", "Water Heater": "Tankless", "Furnace BTU": "35000", "Tire Size": "ST235/80R16'E'" } } }),
      jf("401loft", "401LOFT", 8100, { __m: "jay-flight-bungalow", sleeps: 8, length: "42' 0\"", weight: "11,575", slide: true, optionIds: ["2560", "2561", "2563", "2564", "2565", "2566"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "1,465", "Unloaded Vehicle Weight (lbs)": "11,575", "Cargo Carrying Capacity (lbs)": "1,825", "Gross Vehicle Weight Rating (lbs)": "13,400" }, "Measurements": { "Exterior Length (overall)": "42' 0\"", "Length": "39' 2\"", "Exterior Height": "12' 10\"", "Exterior Height (with A/C)": "13' 1\"", "Exterior Height (with 2nd A/C)": "13' 1\"", "Exterior Width": "8' 0\"", "Exterior Width (with slides out)": "13' 6\"", "Interior Height (main)": "8' 10\"", "Interior Height (upper deck)": "8' 0\"", "Awning Length": "20' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "52.0", "Gray Water Capacity (gals)": "32.5", "Black Tank Capacity (gals)": "39.0", "Propane Unit (lbs)": "40", "Propane Unit (lbs) (Optional)": "60" }, "Miscellaneous": { "Sleeps": "up to 8", "Water Heater": "Tankless", "Furnace BTU": "40000", "Tire Size": "ST235/80R16'E'" } } }),
      jf("404loft", "404LOFT", 8100, { __m: "jay-flight-bungalow", sleeps: 8, length: "42' 0\"", weight: "11,750", slide: true, optionIds: ["2560", "2561", "2563", "2564", "2565", "2566"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "1,610", "Unloaded Vehicle Weight (lbs)": "11,750", "Cargo Carrying Capacity (lbs)": "1,850", "Gross Vehicle Weight Rating (lbs)": "13,600" }, "Measurements": { "Exterior Length (overall)": "42' 0\"", "Length": "38' 11\"", "Exterior Height": "12' 10\"", "Exterior Height (with A/C)": "13' 1\"", "Exterior Height (with 2nd A/C)": "13' 1\"", "Exterior Width": "8' 0\"", "Exterior Width (with slides out)": "13' 6\"", "Interior Height (main)": "8' 11\"", "Awning Length": "18' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "52.0", "Gray Water Capacity (gals)": "117.0", "Black Tank Capacity (gals)": "39.0", "Propane Unit (lbs)": "60" }, "Miscellaneous": { "Sleeps": "up to 8", "Water Heater": "Tankless", "Furnace BTU": "40000", "Tire Size": "ST235/80R16'E'" } } }),
      jf("402dlft", "402DLFT", null, { __m: "jay-flight-bungalow", sleeps: 7, isNew: true, specs: { "Miscellaneous": { "Sleeps": "up to 7", "Water Heater": "Tankless", "# of outside storage compartments": "1", "Tire Size": "ST235/80R16'E'" } } }),
      jf("402rlts", "402RLTS", null, { __m: "jay-flight-bungalow", sleeps: 4, isNew: true, specs: { "Miscellaneous": { "Sleeps": "up to 4", "Water Heater": "Tankless", "# of outside storage compartments": "1", "Tire Size": "ST235/80R16'E'" } } }),
      jf("jayloft", "JayLoft", null, { __m: "jay-flight-bungalow", sleeps: 9, isNew: true, specs: { "Miscellaneous": { "Sleeps": "up to 9", "Water Heater": "Tankless", "# of outside storage compartments": "1", "Tire Size": "ST235/80R16'E'" } } }),
    ],
  };

  /* ---------- north-point : 8 floorplans, 13 options, 1 exterior ---------- */
  const north_point = {
    exterior: [
      { id: "as-shown", name: "As shown", price: 0 },
    ],
    /* Jayco publishes no Interior Design panel for this model. */
    interior: [ { id: 'as-shown', name: 'As shown', price: 0 } ],
    options: {
      "2632": { name: "Luxury Package", price: 10200 },
      "2638": { name: "7000 Watt Onan Dual Fuel Generator (Incl. Generator Prep)", price: 7343 },
      "2633": { name: "5-Star Handling Package", price: 5993 },
      "2310": { name: "Customer Value Package", price: 4500 },
      "2639": { name: "Dual Pane Tinted Safety Glass Windows", price: 2543 },
      "2641": { name: "Slideout Awnings (4)", price: 1343 },
      "2635": { name: "Overlander II Solar Package", price: 1193 },
      "2636": { name: "3rd A/C in Living Area (15K BTU)", price: 1043 },
      "2640": { name: "Slideout Awnings (3)", price: 1043 },
      "2634": { name: "Extreme Weather Package", price: 893 },
      "2637": { name: "Generator Prep", price: 743 },
      "2642": { name: "Outside Halo® Griddle for JayPort System", price: 675 },
      "2644": { name: "Queen Residential Foam Top Mattress", price: 75 },
    },
    floorplans: [
      jf("310rlts", "310RLTS", 0, { __m: "north-point", sleeps: 4, length: "34' 3\"", weight: "12,815", slide: true, optionIds: ["2310", "2632", "2633", "2634", "2635", "2636", "2637", "2638", "2639", "2640", "2642", "2644"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "2,485", "Unloaded Vehicle Weight (lbs)": "12,815", "Cargo Carrying Capacity (lbs)": "3,185", "Gross Vehicle Weight Rating (lbs)": "16,000" }, "Measurements": { "Exterior Length (overall)": "34' 3\"", "Exterior Height": "12' 7\"", "Exterior Height (with A/C)": "13' 5\"", "Exterior Height (with 2nd A/C)": "13' 5\"", "Exterior Width": "8' 6\"", "Exterior Width (with slides out)": "14' 6\"", "Interior Height (main)": "8' 6\"", "Interior Height (upper deck)": "6' 8\"", "Awning Length": "16' 0\"", "Awning Length 2": "10' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "75.0", "Gray Water Capacity (gals)": "87.0", "Black Tank Capacity (gals)": "50.0", "Propane Unit (lbs)": "120" }, "Miscellaneous": { "Sleeps": "up to 4", "Water Heater": "Tankless", "# of outside storage compartments": "2", "Furnace BTU": "40000", "Tire Size": "ST215/75R17.5'J'" } } }),
      jf("365rkts", "365RKTS", 7643, { __m: "north-point", sleeps: 4, length: "38' 8\"", weight: "14,075", slide: true, optionIds: ["2310", "2632", "2633", "2634", "2635", "2636", "2637", "2638", "2639", "2640", "2642", "2644"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "2,665", "Unloaded Vehicle Weight (lbs)": "14,075", "Cargo Carrying Capacity (lbs)": "3,225", "Gross Vehicle Weight Rating (lbs)": "17,300" }, "Measurements": { "Length": "38' 8\"", "Exterior Height": "12' 6\"", "Exterior Height (with A/C)": "13' 3\"", "Exterior Height (with 2nd A/C)": "13' 3\"", "Exterior Width": "8' 6\"", "Exterior Width (with slides out)": "14' 6\"", "Interior Height (main)": "8' 6\"", "Interior Height (upper deck)": "6' 8\"", "Awning Length": "15' 0\"", "Awning Length 2": "16' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "75.0", "Gray Water Capacity (gals)": "87.0", "Black Tank Capacity (gals)": "50.0", "Propane Unit (lbs)": "120" }, "Miscellaneous": { "Sleeps": "up to 4", "Water Heater": "Tankless", "Furnace BTU": "40000", "Tire Size": "ST215/75R17.5'J'" } } }),
      jf("381ckre", "381CKRE", 13193, { __m: "north-point", sleeps: 4, length: "40' 9\"", weight: "14,805", slide: true, optionIds: ["2310", "2632", "2633", "2634", "2635", "2636", "2637", "2638", "2639", "2641", "2642", "2644"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "3,010", "Unloaded Vehicle Weight (lbs)": "14,805", "Cargo Carrying Capacity (lbs)": "3,190", "Gross Vehicle Weight Rating (lbs)": "17,995" }, "Measurements": { "Length": "40' 9\"", "Exterior Height": "12' 6\"", "Exterior Height (with A/C)": "13' 3\"", "Exterior Height (with 2nd A/C)": "13' 3\"", "Exterior Width": "8' 6\"", "Exterior Width (with slides out)": "13' 7\"", "Interior Height (main)": "8' 7\"", "Interior Height (upper deck)": "6' 8\"", "Awning Length": "15' 0\"", "Awning Length 2": "17' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "75.0", "Gray Water Capacity (gals)": "87.0", "Black Tank Capacity (gals)": "50.0", "Propane Unit (lbs)": "120" }, "Miscellaneous": { "Sleeps": "up to 4", "Furnace BTU": "40000", "Tire Size": "ST215/75R17.5'J'" } } }),
      jf("395dsdb", "395DSDB", 18068, { __m: "north-point", sleeps: 8, length: "44' 6\"", weight: "15,350", slide: true, optionIds: ["2310", "2632", "2633", "2634", "2635", "2636", "2637", "2638", "2639", "2641", "2642", "2644"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "3,125", "Unloaded Vehicle Weight (lbs)": "15,350", "Cargo Carrying Capacity (lbs)": "3,450", "Gross Vehicle Weight Rating (lbs)": "18,800" }, "Measurements": { "Length": "44' 6\"", "Exterior Height": "12' 7\"", "Exterior Height (with A/C)": "13' 3\"", "Exterior Height (with 2nd A/C)": "13' 3\"", "Exterior Width": "8' 6\"", "Exterior Width (with slides out)": "14' 6\"", "Interior Height (main)": "8' 7\"", "Interior Height (upper deck)": "6' 8\"", "Awning Length": "16' 0\"", "Awning Length 2": "11' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "75.0", "Gray Water Capacity (gals)": "124.0", "Black Tank Capacity (gals)": "87.0", "Propane Unit (lbs)": "120" }, "Miscellaneous": { "Sleeps": "up to 8", "Water Heater": "Tankless", "Furnace BTU": "40000", "Tire Size": "ST215/75R17.5'H'" } } }),
      jf("361rlbh", "361RLBH", null, { __m: "north-point", isNew: true }),
      jf("375tbdb", "375TBDB", null, { __m: "north-point", isNew: true }),
      jf("380fbrk", "380FBRK", null, { __m: "north-point", isNew: true, specs: { "Miscellaneous": { "Water Heater": "Tankless" } } }),
      jf("391tbbh", "391TBBH", null, { __m: "north-point", isNew: true }),
    ],
  };

  /* ---------- pinnacle : 8 floorplans, 15 options, 4 exterior ---------- */
  const pinnacle = {
    exterior: [
      { id: "standard", name: "Standard graphics", price: 0 },
      { id: "2631", name: "Midnight Charcoal Full-body Paint", price: 17393 },
      { id: "2629", name: "Midnight Gold Full-body Paint", price: 17393 },
      { id: "2630", name: "Silver Metallic Full-body Paint", price: 17393 },
    ],
    /* Jayco publishes no Interior Design panel for this model. */
    interior: [ { id: 'as-shown', name: 'As shown', price: 0 } ],
    options: {
      "2627": { name: "Pinnacle Luxury Package", price: 12450 },
      "2624": { name: "MORryde Independent Suspension with shocks, 8K axles and disc brakes (ABS N/A)", price: 11843 },
      "2617": { name: "7000 Watt Onan Dual Fuel Generator (Incl. Generator Prep)", price: 7343 },
      "2628": { name: "5-Star Handling Package", price: 5993 },
      "2626": { name: "Customer Value Package", price: 4500 },
      "2623": { name: "8K hydraulic disc brake package (ABS N/A with disc brakes)", price: 4043 },
      "2618": { name: "Dual Pane Tinted Safety Glass Windows", price: 2543 },
      "2622": { name: "7K hydraulic disc brake package (ABS N/A with disc brakes)", price: 2393 },
      "2620": { name: "Slideout awnings (4)", price: 1343 },
      "2614": { name: "3rd A/C in Living Area (15K BTU)", price: 1043 },
      "2619": { name: "Slideout Awning (3)", price: 1043 },
      "2616": { name: "Generator Prep", price: 743 },
      "2615": { name: "20 cu. ft. 12V Refrigerator", price: 675 },
      "2621": { name: "Outside HALO® Griddle for JayPort System", price: 675 },
      "2625": { name: "Queen Residential Foam Top Mattress", price: 75 },
    },
    floorplans: [
      jf("32rlts", "32RLTS", 0, { __m: "pinnacle", sleeps: 4, length: "34' 10\"", weight: "13,645", slide: true, optionIds: ["2614", "2615", "2616", "2617", "2618", "2619", "2621", "2622", "2625", "2626", "2627", "2628"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "2,705", "Unloaded Vehicle Weight (lbs)": "13,645", "Cargo Carrying Capacity (lbs)": "2,955", "Gross Vehicle Weight Rating (lbs)": "16,600" }, "Measurements": { "Length": "34' 10\"", "Exterior Height": "12' 7\"", "Exterior Height (with A/C)": "13' 3\"", "Exterior Height (with 2nd A/C)": "13' 4\"", "Exterior Width": "8' 6\"", "Exterior Width (with slides out)": "14' 6\"", "Interior Height (main)": "8' 6\"", "Interior Height (upper deck)": "6' 8\"", "Awning Length": "16' 0\"", "Awning Length 2": "10' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "75.0", "Gray Water Capacity (gals)": "87.0", "Black Tank Capacity (gals)": "50.0", "Propane Unit (lbs)": "120" }, "Miscellaneous": { "Sleeps": "up to 4", "Water Heater": "Tankless", "# of outside storage compartments": "2", "Furnace BTU": "40000", "Tire Size": "ST215/75R17.5'H'" } } }),
      jf("36fbts", "36FBTS", 8982, { __m: "pinnacle", sleeps: 4, length: "39' 2\"", weight: "14,270", slide: true, optionIds: ["2614", "2615", "2616", "2617", "2618", "2619", "2621", "2623", "2624", "2625", "2626", "2627", "2628"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "2,540", "Unloaded Vehicle Weight (lbs)": "14,270", "Cargo Carrying Capacity (lbs)": "3,230", "Gross Vehicle Weight Rating (lbs)": "17,500" }, "Measurements": { "Length": "39' 2\"", "Exterior Height": "12' 7\"", "Exterior Height (with A/C)": "13' 3\"", "Exterior Height (with 2nd A/C)": "13' 3\"", "Exterior Width": "8' 6\"", "Exterior Width (with slides out)": "14' 6\"", "Interior Height (main)": "8' 6\"", "Interior Height (upper deck)": "6' 8\"", "Awning Length": "19' 0\"", "Awning Length 2": "11' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "75.0", "Gray Water Capacity (gals)": "87.0", "Black Tank Capacity (gals)": "87.0", "Propane Unit (lbs)": "120" }, "Miscellaneous": { "Sleeps": "up to 4", "Water Heater": "Tankless", "# of outside storage compartments": "2", "Furnace BTU": "40000", "Tire Size": "ST215/75R17.5'H'" } } }),
      jf("38fbrk", "38FBRK", 13175, { __m: "pinnacle", sleeps: 4, length: "42' 5\"", weight: "15,475", slide: true, optionIds: ["2614", "2615", "2616", "2617", "2618", "2619", "2621", "2623", "2624", "2625", "2626", "2627", "2628"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "3,035", "Unloaded Vehicle Weight (lbs)": "15,475", "Cargo Carrying Capacity (lbs)": "2,752", "Gross Vehicle Weight Rating (lbs)": "18,200" }, "Measurements": { "Length": "42' 5\"", "Exterior Height": "12' 8\"", "Exterior Height (with A/C)": "13' 5\"", "Exterior Height (with 2nd A/C)": "13' 5\"", "Exterior Width": "8' 6\"", "Exterior Width (with slides out)": "14' 3\"", "Interior Height (main)": "8' 6\"", "Interior Height (upper deck)": "6' 7\"", "Awning Length": "19' 0\"", "Awning Length 2": "15' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "75.0", "Gray Water Capacity (gals)": "87.0", "Black Tank Capacity (gals)": "87.0", "Propane Unit (lbs)": "120" }, "Miscellaneous": { "Sleeps": "up to 4", "Water Heater": "Tankless", "# of outside storage compartments": "2", "Furnace BTU": "40000", "Tire Size": "ST215/75R17.5'H'" } } }),
      jf("38ssws", "38SSWS", 17000, { __m: "pinnacle", sleeps: 4, length: "41' 7\"", weight: "15,625", slide: true, optionIds: ["2614", "2615", "2616", "2617", "2618", "2620", "2621", "2623", "2624", "2625", "2626", "2627", "2628"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "3,370", "Unloaded Vehicle Weight (lbs)": "15,625", "Cargo Carrying Capacity (lbs)": "3,075", "Gross Vehicle Weight Rating (lbs)": "18,700" }, "Measurements": { "Length": "41' 7\"", "Exterior Height": "12' 7\"", "Exterior Height (with A/C)": "13' 4\"", "Exterior Height (with 2nd A/C)": "13' 4\"", "Exterior Width": "8' 6\"", "Exterior Width (with slides out)": "13' 6\"", "Interior Height (main)": "8' 6\"", "Interior Height (upper deck)": "6' 7\"", "Awning Length": "21' 0\"", "Awning Length 2": "11' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "75.0", "Gray Water Capacity (gals)": "87.0", "Black Tank Capacity (gals)": "50.0", "Propane Unit (lbs)": "120" }, "Miscellaneous": { "Sleeps": "up to 4", "Water Heater": "Tankless", "# of outside storage compartments": "1", "Tire Size": "ST215/75R17.5'H'" } } }),
      jf("39dsdb", "39DSDB", 17675, { __m: "pinnacle", sleeps: 8, length: "43' 8\"", weight: "16,360", slide: true, optionIds: ["2614", "2615", "2616", "2617", "2618", "2623", "2624", "2625", "2626", "2627", "2628"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "3,170", "Unloaded Vehicle Weight (lbs)": "16,360", "Cargo Carrying Capacity (lbs)": "2,840", "Gross Vehicle Weight Rating (lbs)": "19,200" }, "Measurements": { "Length": "43' 8\"", "Exterior Height": "12' 7\"", "Exterior Height (with A/C)": "13' 4\"", "Exterior Height (with 2nd A/C)": "13' 4\"", "Exterior Width": "8' 6\"", "Exterior Width (with slides out)": "14' 6\"", "Interior Height (main)": "8' 6\"", "Interior Height (upper deck)": "6' 8\"", "Awning Length": "16' 0\"", "Awning Length 2": "11' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "75.0", "Gray Water Capacity (gals)": "124.0", "Black Tank Capacity (gals)": "87.0", "Propane Unit (lbs)": "120" }, "Miscellaneous": { "Sleeps": "up to 8", "Water Heater": "Tankless", "# of outside storage compartments": "2", "Tire Size": "ST215/75R17.5'H'" } } }),
      jf("39flok", "39FLOK", 22550, { __m: "pinnacle", sleeps: 6, length: "42' 11\"", weight: "15,920", slide: true, optionIds: ["2614", "2615", "2616", "2617", "2618", "2620", "2623", "2624", "2625", "2626", "2627", "2628"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "3,085", "Unloaded Vehicle Weight (lbs)": "15,920", "Cargo Carrying Capacity (lbs)": "2,880", "Gross Vehicle Weight Rating (lbs)": "18,800" }, "Measurements": { "Length": "42' 11\"", "Exterior Height": "12' 6\"", "Exterior Height (with A/C)": "13' 3\"", "Exterior Height (with 2nd A/C)": "13' 3\"", "Exterior Width": "8' 6\"", "Exterior Width (with slides out)": "14' 6\"", "Interior Height (main)": "8' 6\"", "Interior Height (upper deck)": "6' 7\"", "Awning Length": "14' 0\"", "Awning Length 2": "14' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "75.0", "Gray Water Capacity (gals)": "82.5", "Black Tank Capacity (gals)": "74.0", "Propane Unit (lbs)": "120" }, "Miscellaneous": { "Sleeps": "up to 6", "Water Heater": "Tankless", "# of outside storage compartments": "2", "Tire Size": "ST215/75R17.5'H'" } } }),
      jf("38rlmd", "38RLMD", null, { __m: "pinnacle", isNew: true }),
      jf("39fbrl", "39FBRL", null, { __m: "pinnacle", isNew: true, specs: { "Tank Capacities": { "Propane Unit (lbs)": "120" }, "Miscellaneous": { "Water Heater": "Tankless", "# of outside storage compartments": "2" } } }),
    ],
  };

  /* ---------- precept : 5 floorplans, 8 options, 4 exterior ---------- */
  const precept = {
    exterior: [
      { id: "standard", name: "Standard graphics", price: 0 },
      { id: "2367", name: "Black Bird Full-Body Paint", price: 17993 },
      { id: "2365", name: "Blue Bird Full-Body Paint", price: 17993 },
      { id: "2366", name: "Cardinal Full-Body Paint", price: 17993 },
    ],
    /* Jayco's published interior design(s) for this model, from the
       Interior Design panel on each floorplan page. Identical across
       every plan in the model, so it lives at model level. */
    interior: [
      { id: "coastal", name: "Coastal", price: 0, image: D + "precept__coastal.webp" },
      { id: "glendale", name: "Glendale", price: 0, image: D + "precept__glendale.webp" },
    ],
    options: {
      "2368": { name: "Customer Value Package", price: 11250, mandatory: true },
      "2369": { name: "Drop-Down Overhead Bunk in Cab Area with 750 lb. Capacity", price: 3293 },
      "2445": { name: "Stackable Washer/Dryer (36C)", price: 2393 },
      "2375": { name: "Fabric Sofa/Theater Option (36A) (STD 34G, 36C)", price: 2018 },
      "2372": { name: "Combination Washer/Dryer (34B, 34G, 36A)", price: 1943 },
      "2371": { name: "Coastal", price: 593 },
      "2446": { name: "15 cu. ft. 12V Refrigerator", price: 443 },
      "2376": { name: "Canadian Standards", price: 293 },
    },
    floorplans: [
      jf("31ul", "31UL", 0, { __m: "precept", sleeps: 7, length: "33' 0\"", slide: true, optionIds: ["2371", "2368", "2369", "2376", "2446"], specs: { "Weights": { "Gross Vehicle Weight Rating (lbs)": "22,000", "Gross Combined Weight Rating (lbs)": "26,000" }, "Measurements": { "Exterior Length (overall)": "33' 0\"", "Exterior Height (with A/C)": "12' 10\"", "Exterior Width": "8' 5\"", "Exterior Width (with slides out)": "12' 11\"", "Interior Height (main)": "7' 0\"", "Awning Length": "16' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "72.0", "Gray Water Capacity (gals)": "40.0", "Black Tank Capacity (gals)": "50.0", "Propane Unit (lbs)": "56", "Fuel Tank Capacity (gals)": "80" }, "Miscellaneous": { "Sleeps": "up to 7", "Tire Size": "235/80R22.5G", "Engine Size": "7.3L 2V DEVCT NA PFI V8", "Exterior Cargo Capacity (cu. ft.)": "108" } } }),
      jf("34b", "34B", 3750, { __m: "precept", sleeps: 6, length: "36' 11\"", slide: true, optionIds: ["2371", "2368", "2369", "2372", "2376", "2446"], specs: { "Weights": { "Gross Vehicle Weight Rating (lbs)": "22,000", "Gross Combined Weight Rating (lbs)": "26,000" }, "Measurements": { "Exterior Length (overall)": "36' 11\"", "Exterior Height (with A/C)": "12' 10\"", "Exterior Width": "8' 5\"", "Exterior Width (with slides out)": "12' 7\"", "Interior Height (main)": "7' 0\"", "Awning Length": "18' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "72.0", "Gray Water Capacity (gals)": "40.0", "Black Tank Capacity (gals)": "40.0", "Propane Unit (lbs)": "56", "Fuel Tank Capacity (gals)": "80" }, "Miscellaneous": { "Sleeps": "up to 6", "Tire Size": "235/80R22.5G", "Engine Size": "7.3L 2V DEVCT NA PFI V8", "Exterior Cargo Capacity (cu. ft.)": "117" } } }),
      jf("34g", "34G", 9765, { __m: "precept", sleeps: 7, length: "36' 6\"", slide: true, optionIds: ["2371", "2368", "2369", "2372", "2375", "2376", "2446"], specs: { "Weights": { "Gross Vehicle Weight Rating (lbs)": "22,000", "Gross Combined Weight Rating (lbs)": "26,000" }, "Measurements": { "Exterior Length (overall)": "36' 6\"", "Exterior Height (with A/C)": "12' 10\"", "Exterior Width": "8' 5\"", "Exterior Width (with slides out)": "12' 3\"", "Interior Height (main)": "7' 0\"", "Awning Length": "23' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "72.0", "Gray Water Capacity (gals)": "73.0", "Black Tank Capacity (gals)": "50.0", "Propane Unit (lbs)": "56", "Fuel Tank Capacity (gals)": "80" }, "Miscellaneous": { "Sleeps": "up to 7", "Tire Size": "235/80R22.5G", "Engine Size": "7.3L 2V DEVCT NA PFI V8", "Exterior Cargo Capacity (cu. ft.)": "155" } } }),
      jf("36a", "36A", 12675, { __m: "precept", sleeps: 9, length: "38' 10\"", slide: true, optionIds: ["2371", "2368", "2369", "2372", "2375", "2376", "2446"], specs: { "Weights": { "Gross Vehicle Weight Rating (lbs)": "24,000", "Gross Combined Weight Rating (lbs)": "30,000" }, "Measurements": { "Exterior Length (overall)": "38' 10\"", "Exterior Height (with A/C)": "12' 10\"", "Exterior Width": "8' 5\"", "Exterior Width (with slides out)": "12' 11\"", "Interior Height (main)": "7' 0\"", "Awning Length": "12' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "72.0", "Gray Water Capacity (gals)": "40.0", "Black Tank Capacity (gals)": "40.0", "Propane Unit (lbs)": "56", "Fuel Tank Capacity (gals)": "80" }, "Miscellaneous": { "Sleeps": "up to 9", "Tire Size": "255/80R22.5G", "Engine Size": "7.3L 2V DEVCT NA PFI V8", "Exterior Cargo Capacity (cu. ft.)": "111" } } }),
      jf("36c", "36C", 18082, { __m: "precept", sleeps: 7, length: "38' 10\"", slide: true, optionIds: ["2371", "2368", "2369", "2375", "2376", "2445", "2446"], specs: { "Weights": { "Gross Vehicle Weight Rating (lbs)": "24,000", "Gross Combined Weight Rating (lbs)": "30,000" }, "Measurements": { "Exterior Length (overall)": "38' 10\"", "Exterior Height (with A/C)": "12' 10\"", "Exterior Width": "8' 5\"", "Exterior Width (with slides out)": "12' 9\"", "Interior Height (main)": "7' 0\"", "Awning Length": "20' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "72.0", "Gray Water Capacity (gals)": "72.0", "Black Tank Capacity (gals)": "72.0", "Propane Unit (lbs)": "56", "Fuel Tank Capacity (gals)": "80" }, "Miscellaneous": { "Sleeps": "up to 7", "Tire Size": "255/80R22.5G", "Engine Size": "7.3L 2V DEVCT NA PFI V8", "Exterior Cargo Capacity (cu. ft.)": "134" } } }),
    ],
  };

  /* ---------- precept-prestige : 3 floorplans, 6 options, 5 exterior ---------- */
  const precept_prestige = {
    exterior: [
      { id: "standard", name: "Standard graphics", price: 0 },
      { id: "2380", name: "Greenwood Full-Body Paint", price: 30 },
      { id: "2377", name: "Hamilton Full-Body Paint", price: 30 },
      { id: "2379", name: "Noblesville Full-Body Paint", price: 30 },
      { id: "2378", name: "Westfield Full-Body Paint", price: 30 },
    ],
    /* Jayco's published interior design(s) for this model, from the
       Interior Design panel on each floorplan page. Identical across
       every plan in the model, so it lives at model level. */
    interior: [
      { id: "avalon", name: "Avalon", price: 0, image: D + "precept-prestige__avalon.webp" },
      { id: "bridgewood", name: "Bridgewood", price: 0, image: D + "precept-prestige__bridgewood.webp" },
    ],
    options: {
      "2383": { name: "Customer Value Package", price: 11250, mandatory: true },
      "2384": { name: "Drop-Down Overhead Bunk in Cab Area with 750 lb. Capacity", price: 3293 },
      "2389": { name: "Stackable Washer/Dryer (36H)", price: 2393 },
      "2387": { name: "120 in. Straight Reclining Sofa (36H)", price: 2093 },
      "2385": { name: "Fabric Sofa/Theater Option (36B, 36H)", price: 2018 },
      "2388": { name: "Combination Washer/Dryer (36B, 36U)", price: 1943 },
    },
    floorplans: [
      jf("36u", "36U", 0, { __m: "precept-prestige", sleeps: 6, length: "38' 2\"", slide: true, optionIds: ["2383", "2384", "2388"], specs: { "Weights": { "Gross Vehicle Weight Rating (lbs)": "24,000", "Gross Combined Weight Rating (lbs)": "30,000" }, "Measurements": { "Exterior Length (overall)": "38' 2\"", "Exterior Height (with A/C)": "12' 10\"", "Exterior Width": "8' 5\"", "Exterior Width (with slides out)": "13' 7\"", "Interior Height (main)": "7' 0\"", "Awning Length": "17' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "72.0", "Gray Water Capacity (gals)": "50.0", "Black Tank Capacity (gals)": "31.0", "Propane Unit (lbs)": "83", "Fuel Tank Capacity (gals)": "80" }, "Miscellaneous": { "Sleeps": "up to 6", "Tire Size": "255/80R22.5G", "Engine Size": "7.3L 2V DEVCT NA PFI V8", "Exterior Cargo Capacity (cu. ft.)": "100" } } }),
      jf("36b", "36B", 4193, { __m: "precept-prestige", sleeps: 9, length: "38' 8\"", slide: true, optionIds: ["2383", "2384", "2385", "2388"], specs: { "Weights": { "Gross Vehicle Weight Rating (lbs)": "24,000", "Gross Combined Weight Rating (lbs)": "30,000" }, "Measurements": { "Exterior Length (overall)": "38' 8\"", "Exterior Height (with A/C)": "12' 10\"", "Exterior Width": "8' 5\"", "Exterior Width (with slides out)": "13' 4\"", "Interior Height (main)": "7' 0\"", "Awning Length": "12' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "72.0", "Gray Water Capacity (gals)": "50.0", "Black Tank Capacity (gals)": "31.0", "Propane Unit (lbs)": "83", "Fuel Tank Capacity (gals)": "80" }, "Miscellaneous": { "Sleeps": "up to 9", "Tire Size": "255/80R22.5G", "Engine Size": "7.3L 2V DEVCT NA PFI V8", "Exterior Cargo Capacity (cu. ft.)": "107" } } }),
      jf("36h", "36H", 6293, { __m: "precept-prestige", sleeps: 7, length: "38' 8\"", slide: true, optionIds: ["2383", "2384", "2385", "2387", "2389"], specs: { "Weights": { "Gross Vehicle Weight Rating (lbs)": "24,000", "Gross Combined Weight Rating (lbs)": "30,000" }, "Measurements": { "Exterior Length (overall)": "38' 8\"", "Exterior Height (with A/C)": "12' 10\"", "Exterior Width": "8' 5\"", "Exterior Width (with slides out)": "12' 11\"", "Interior Height (main)": "7' 0\"", "Awning Length": "23' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "72.0", "Gray Water Capacity (gals)": "40.0", "Black Tank Capacity (gals)": "40.0", "Propane Unit (lbs)": "83", "Fuel Tank Capacity (gals)": "80" }, "Miscellaneous": { "Sleeps": "up to 7", "Tire Size": "255/80R22.5G", "Engine Size": "7.3L 2V DEVCT NA PFI V8", "Exterior Cargo Capacity (cu. ft.)": "111" } } }),
    ],
  };

  /* ---------- redhawk : 2 floorplans, 9 options, 1 exterior ---------- */
  const redhawk = {
    exterior: [
      { id: "as-shown", name: "As shown", price: 0 },
    ],
    /* Jayco's published interior design(s) for this model, from the
       Interior Design panel on each floorplan page. Identical across
       every plan in the model, so it lives at model level. */
    interior: [
      { id: "coastal", name: "Coastal", price: 0, image: D + "redhawk__coastal.webp" },
      { id: "glendale", name: "Glendale", price: 0, image: D + "redhawk__glendale.webp" },
    ],
    options: {
      "2452": { name: "Customer Value Package", price: 11250, mandatory: true },
      "2447": { name: "Automatic Hydraulic Leveling Jacks", price: 3893 },
      "2450": { name: "Dual 13,500 BTU A/C Units with Power Management System (26M)", price: 1193 },
      "2449": { name: "200W Solar Panel with Dual Controller and Second House Battery", price: 893 },
      "2673": { name: "Sofa Theater Seating Fabric ILO Dinette (24B, 26M)", price: 743 },
      "2448": { name: "Theater Seating ILO Dinette and Additional TV in Cab-Over (24B, 26M)", price: 743 },
      "2454": { name: "Coastal", price: 593 },
      "2451": { name: "Folding Windshield Sun Shade", price: 488 },
      "2453": { name: "Canadian Standards", price: 293 },
    },
    floorplans: [
      jf("24b", "24B", 0, { __m: "redhawk", sleeps: 5, length: "26' 8\"", slide: true, optionIds: ["2454", "2673", "2447", "2448", "2449", "2451", "2452", "2453"], specs: { "Weights": { "Gross Vehicle Weight Rating (lbs)": "14,500", "Gross Combined Weight Rating (lbs)": "22,000" }, "Measurements": { "Exterior Length (overall)": "26' 8\"", "Exterior Height (with A/C)": "11' 6\"", "Exterior Width": "8' 4\"", "Exterior Width (with slides out)": "11' 2\"", "Interior Height (main)": "7' 0\"", "Awning Length": "16' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "42.0", "Gray Water Capacity (gals)": "40.0", "Black Tank Capacity (gals)": "31.0", "Propane Unit (lbs)": "41", "Fuel Tank Capacity (gals)": "55" }, "Miscellaneous": { "Sleeps": "up to 5", "Tire Size": "LT225/75R16E", "Engine Size": "7.3L 2V DEVCT NA PFI V8", "Exterior Cargo Capacity (cu. ft.)": "30" } } }),
      jf("26m", "26M", 3375, { __m: "redhawk", sleeps: 5, length: "28' 8\"", slide: true, optionIds: ["2454", "2673", "2447", "2448", "2449", "2450", "2451", "2452", "2453"], specs: { "Weights": { "Gross Vehicle Weight Rating (lbs)": "14,500", "Gross Combined Weight Rating (lbs)": "22,000" }, "Measurements": { "Exterior Length (overall)": "28' 8\"", "Exterior Height (with A/C)": "11' 6\"", "Exterior Width": "8' 4\"", "Exterior Width (with slides out)": "12' 2\"", "Interior Height (main)": "7' 0\"", "Awning Length": "19' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "43.0", "Gray Water Capacity (gals)": "40.0", "Black Tank Capacity (gals)": "31.0", "Propane Unit (lbs)": "41", "Fuel Tank Capacity (gals)": "55" }, "Miscellaneous": { "Sleeps": "up to 5", "Tire Size": "LT225/75R16E", "Engine Size": "7.3L 2V DEVCT NA PFI V8", "Exterior Cargo Capacity (cu. ft.)": "21" } } }),
    ],
  };

  /* ---------- redhawk-se : 11 floorplans, 4 options, 1 exterior ---------- */
  const redhawk_se = {
    exterior: [
      { id: "as-shown", name: "As shown", price: 0 },
    ],
    /* Jayco's published interior design(s) for this model, from the
       Interior Design panel on each floorplan page. Identical across
       every plan in the model, so it lives at model level. */
    interior: [
      { id: "avalon", name: "Avalon", price: 0, image: D + "redhawk-se__avalon.webp" },
    ],
    options: {
      "2395": { name: "Customer Value Package", price: 9750, mandatory: true },
      "2392": { name: "Automatic Hydraulic Leveling Jacks", price: 3893 },
      "2393": { name: "200W Solar Panel with Dual Controller and Second House Battery", price: 893 },
      "2394": { name: "Canadian Standards", price: 293 },
    },
    floorplans: [
      jf("20lf", "20LF - Ford Chassis", 0, { __m: "redhawk-se", sleeps: 4, length: "21' 11\"", optionIds: ["2392", "2393", "2394", "2395"], specs: { "Weights": { "Gross Vehicle Weight Rating (lbs)": "12,500", "Gross Combined Weight Rating (lbs)": "18,500" }, "Measurements": { "Exterior Length (overall)": "21' 11\"", "Exterior Height (with A/C)": "11' 6\"", "Exterior Width": "8' 4\"", "Interior Height (main)": "7' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "26.0", "Gray Water Capacity (gals)": "31.0", "Black Tank Capacity (gals)": "31.0", "Fuel Tank Capacity (gals)": "55" }, "Miscellaneous": { "Sleeps": "up to 4", "Furnace BTU": "30000", "Tire Size": "LT225/75R16E", "Engine Size": "7.3L 2V DEVCT NA PFI V8" } } }),
      jf("22e", "22E - Chevrolet Chassis - Limited Availability", 2400, { __m: "redhawk-se", sleeps: 4, length: "25' 2\"", slide: true, optionIds: ["2392", "2393", "2394", "2395"], specs: { "Weights": { "Gross Vehicle Weight Rating (lbs)": "14,200", "Gross Combined Weight Rating (lbs)": "20,000" }, "Measurements": { "Exterior Length (overall)": "25' 2\"", "Exterior Height (with A/C)": "11' 6\"", "Exterior Width": "8' 4\"", "Exterior Width (with slides out)": "8' 4\"", "Interior Height (main)": "7' 0\"", "Awning Length": "16' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "43.0", "Gray Water Capacity (gals)": "40.0", "Black Tank Capacity (gals)": "31.0", "Propane Unit (lbs)": "41" }, "Miscellaneous": { "Sleeps": "up to 4", "Tire Size": "LT225/75R16E", "Engine Size": "6.6L DI/VVT V8" } } }),
      jf("22ef", "22EF - Ford Chassis", 2400, { __m: "redhawk-se", sleeps: 4, length: "24' 8\"", optionIds: ["2392", "2393", "2394", "2395"], specs: { "Weights": { "Gross Vehicle Weight Rating (lbs)": "12,500", "Gross Combined Weight Rating (lbs)": "18,500" }, "Measurements": { "Exterior Length (overall)": "24' 8\"", "Exterior Height (with A/C)": "11' 6\"", "Exterior Width": "8' 4\"", "Interior Height (main)": "7' 0\"", "Awning Length": "16' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "43.0", "Gray Water Capacity (gals)": "40.0", "Black Tank Capacity (gals)": "31.0" }, "Miscellaneous": { "Sleeps": "up to 4", "Tire Size": "LT225/75R16E", "Engine Size": "7.3L Vortec V8" } } }),
      jf("22t", "22T - Chevrolet Chassis - Limited Availability", 3000, { __m: "redhawk-se", sleeps: 4, length: "25' 2\"", optionIds: ["2392", "2393", "2394", "2395"], specs: { "Weights": { "Gross Vehicle Weight Rating (lbs)": "14,200", "Gross Combined Weight Rating (lbs)": "22,000" }, "Measurements": { "Exterior Length (overall)": "25' 2\"", "Exterior Height (with A/C)": "11' 6\"", "Exterior Width": "8' 4\"", "Interior Height (main)": "7' 0\"", "Awning Length": "16' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "43.0", "Gray Water Capacity (gals)": "41.0", "Black Tank Capacity (gals)": "31.0" }, "Miscellaneous": { "Sleeps": "up to 4", "Tire Size": "LT225/75R16E", "Engine Size": "6.6L Vortec V8" } } }),
      jf("22tf", "22TF - Ford Chassis", 3000, { __m: "redhawk-se", sleeps: 4, length: "24' 8\"", optionIds: ["2392", "2393", "2394", "2395"], specs: { "Weights": { "Gross Vehicle Weight Rating (lbs)": "12,500", "Gross Combined Weight Rating (lbs)": "18,500" }, "Measurements": { "Exterior Length (overall)": "24' 8\"", "Exterior Height (with A/C)": "11' 6\"", "Exterior Width": "8' 4\"", "Interior Height (main)": "7' 0\"", "Awning Length": "16' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "43.0", "Gray Water Capacity (gals)": "41.0", "Black Tank Capacity (gals)": "31.0" }, "Miscellaneous": { "Sleeps": "up to 4", "Tire Size": "LT225/75R16E", "Engine Size": "7.3L Vortec V8" } } }),
      jf("22a", "22A - Chevrolet Chassis - Limited Availability", 3900, { __m: "redhawk-se", sleeps: 5, length: "25' 2\"", slide: true, optionIds: ["2392", "2393", "2394", "2395"], specs: { "Weights": { "Gross Vehicle Weight Rating (lbs)": "14,200", "Gross Combined Weight Rating (lbs)": "20,000" }, "Measurements": { "Exterior Length (overall)": "25' 2\"", "Exterior Height (with A/C)": "11' 6\"", "Exterior Width": "8' 4\"", "Exterior Width (with slides out)": "10' 2\"", "Interior Height (main)": "7' 0\"", "Awning Length": "16' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "43.0", "Gray Water Capacity (gals)": "40.0", "Black Tank Capacity (gals)": "32.0", "Propane Unit (lbs)": "41" }, "Miscellaneous": { "Sleeps": "up to 5", "Tire Size": "LT225/75R16E", "Engine Size": "6.6L Vortec V8", "Exterior Cargo Capacity (cu. ft.)": "48" } } }),
      jf("22af", "22AF - Ford Chassis", 3900, { __m: "redhawk-se", sleeps: 5, length: "24' 8\"", optionIds: ["2392", "2393", "2394", "2395"], specs: { "Weights": { "Gross Vehicle Weight Rating (lbs)": "12,500", "Gross Combined Weight Rating (lbs)": "18,500" }, "Measurements": { "Exterior Length (overall)": "24' 8\"", "Exterior Height (with A/C)": "11' 6\"", "Exterior Width": "8' 4\"", "Interior Height (main)": "7' 0\"", "Awning Length": "16' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "44.0", "Gray Water Capacity (gals)": "40.0", "Black Tank Capacity (gals)": "32.0" }, "Miscellaneous": { "Sleeps": "up to 5", "Tire Size": "LT225/75R16E", "Engine Size": "7.3L Vortec V8" } } }),
      jf("22c", "22C - Chevrolet Chassis - Limited Availability", 3900, { __m: "redhawk-se", sleeps: 5, length: "25' 2\"", slide: true, optionIds: ["2392", "2393", "2394", "2395"], specs: { "Weights": { "Gross Vehicle Weight Rating (lbs)": "14,200", "Gross Combined Weight Rating (lbs)": "20,000" }, "Measurements": { "Exterior Length (overall)": "25' 2\"", "Exterior Height (with A/C)": "11' 6\"", "Exterior Width": "8' 4\"", "Exterior Width (with slides out)": "11' 0\"", "Interior Height (main)": "7' 0\"", "Awning Length": "13' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "43.0", "Gray Water Capacity (gals)": "40.0", "Black Tank Capacity (gals)": "31.0", "Propane Unit (lbs)": "41" }, "Miscellaneous": { "Sleeps": "up to 5", "Tire Size": "LT225/75R16E", "Engine Size": "6.6L Vortec V8", "Exterior Cargo Capacity (cu. ft.)": "23" } } }),
      jf("22cf", "22CF - Ford Chassis", 3900, { __m: "redhawk-se", sleeps: 5, length: "24' 8\"", optionIds: ["2392", "2393", "2394", "2395"], specs: { "Weights": { "Gross Vehicle Weight Rating (lbs)": "12,500", "Gross Combined Weight Rating (lbs)": "18,500" }, "Measurements": { "Exterior Length (overall)": "24' 8\"", "Exterior Height (with A/C)": "11' 6\"", "Exterior Width": "8' 4\"", "Interior Height (main)": "7' 0\"", "Awning Length": "13' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "44.0", "Gray Water Capacity (gals)": "40.0", "Black Tank Capacity (gals)": "31.0" }, "Miscellaneous": { "Sleeps": "up to 5", "Tire Size": "LT225/75R16E", "Engine Size": "7.3L Vortec V8" } } }),
      jf("29kf", "29KF - Ford Chassis", 14490, { __m: "redhawk-se", sleeps: 5, length: "32' 7\"", slide: true, optionIds: ["2392", "2393", "2394", "2395"], specs: { "Weights": { "Gross Vehicle Weight Rating (lbs)": "14,500", "Gross Combined Weight Rating (lbs)": "22,000" }, "Measurements": { "Exterior Length (overall)": "32' 7\"", "Exterior Height (with A/C)": "11' 6\"", "Exterior Width": "8' 4\"", "Exterior Width (with slides out)": "10' 2\"", "Interior Height (main)": "7' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "43.5", "Gray Water Capacity (gals)": "41.0", "Black Tank Capacity (gals)": "32.0", "Propane Unit (lbs)": "41" }, "Miscellaneous": { "Sleeps": "up to 5", "Tire Size": "LT225/75R16E", "Engine Size": "7.3L 2V DEVCT NA PFI V8", "Exterior Cargo Capacity (cu. ft.)": "89" } } }),
      jf("31ff", "31FF - Ford Chassis", 23175, { __m: "redhawk-se", sleeps: 7, length: "32' 7\"", slide: true, optionIds: ["2392", "2393", "2394", "2395"], specs: { "Weights": { "Gross Vehicle Weight Rating (lbs)": "14,500", "Gross Combined Weight Rating (lbs)": "22,000" }, "Measurements": { "Exterior Length (overall)": "32' 7\"", "Exterior Height (with A/C)": "11' 6\"", "Exterior Width": "8' 4\"", "Exterior Width (with slides out)": "9' 10\"", "Interior Height (main)": "7' 0\"", "Awning Length": "18' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "47.0", "Gray Water Capacity (gals)": "41.0", "Black Tank Capacity (gals)": "31.0", "Propane Unit (lbs)": "41", "Fuel Tank Capacity (gals)": "55" }, "Miscellaneous": { "Sleeps": "up to 7", "Tire Size": "LT225/75R16E", "Engine Size": "7.3L 2V DEVCT NA PFI V8", "Exterior Cargo Capacity (cu. ft.)": "50" } } }),
    ],
  };

  /* ---------- seismic-fw : 4 floorplans, 1 options, 6 exterior ---------- */
  const seismic_fw = {
    exterior: [
      { id: "standard", name: "Standard graphics", price: 0 },
      { id: "2610", name: "Charcoal full-body paint", price: 17393 },
      { id: "2611", name: "Metallic Blue full-body paint", price: 17393 },
      { id: "2612", name: "Metallic Copper full-body paint", price: 17393 },
      { id: "2613", name: "Metallic Red full-body paint", price: 17393 },
      { id: "2609", name: "Titanium full-body paint", price: 17393 },
    ],
    /* Jayco's published interior design(s) for this model, from the
       Interior Design panel on each floorplan page. Identical across
       every plan in the model, so it lives at model level. */
    interior: [
      { id: "dune-gray", name: "Dune Gray", price: 0, image: D + "seismic-fw__dune-gray.webp" },
    ],
    options: {
      "2685": { name: "Slideout Awnings", price: 893 },
    },
    floorplans: [
      jf("359", "359", 0, { __m: "seismic-fw", sleeps: 6, length: "40' 0\"", weight: "13,490", slide: true, optionIds: ["2685"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "2,875", "Unloaded Vehicle Weight (lbs)": "13,490", "Cargo Carrying Capacity (lbs)": "4,010", "Gross Vehicle Weight Rating (lbs)": "17,500" }, "Measurements": { "Length": "40' 0\"", "Exterior Height": "12' 7\"", "Exterior Height (with A/C)": "13' 3\"", "Exterior Height (with 2nd A/C)": "13' 3\"", "Exterior Width": "8' 6\"", "Exterior Width (with slides out)": "11' 6\"", "Interior Height (main)": "8' 3\"", "Interior Height (upper deck)": "6' 4\"", "Awning Length": "17' 0\"", "Awning Length 2": "11' 0\"", "Garage Length": "11' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "106.0", "Gray Water Capacity (gals)": "87.0", "Black Tank Capacity (gals)": "87.0", "Propane Unit (lbs)": "60" }, "Miscellaneous": { "Sleeps": "up to 6", "Water Heater": "Tankless", "# of outside storage compartments": "2", "Furnace BTU": "35000", "Tire Size": "ST215/75R17.5'H'" } } }),
      jf("399", "399", 12713, { __m: "seismic-fw", sleeps: 8, length: "45' 2\"", weight: "15,585", slide: true, optionIds: ["2685"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "3,265", "Unloaded Vehicle Weight (lbs)": "15,585", "Cargo Carrying Capacity (lbs)": "5,415", "Gross Vehicle Weight Rating (lbs)": "21,000" }, "Measurements": { "Length": "45' 2\"", "Exterior Height": "12' 6\"", "Exterior Height (with A/C)": "13' 3\"", "Exterior Height (with 2nd A/C)": "13' 3\"", "Exterior Width": "8' 6\"", "Exterior Width (with slides out)": "13' 6\"", "Interior Height (main)": "8' 3\"", "Interior Height (upper deck)": "6' 4\"", "Awning Length": "21' 0\"", "Awning Length 2": "11' 0\"", "Garage Length": "13' 6\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "106.0", "Gray Water Capacity (gals)": "87.0", "Black Tank Capacity (gals)": "87.0", "Propane Unit (lbs)": "60" }, "Miscellaneous": { "Sleeps": "up to 8", "Water Heater": "Tankless", "# of outside storage compartments": "2", "Furnace BTU": "35000", "Tire Size": "ST215/75R17.5'H'" } } }),
      jf("395", "395", 13763, { __m: "seismic-fw", sleeps: 7, length: "45' 8\"", weight: "16,075", slide: true, optionIds: ["2685"], specs: { "Weights": { "Dry Hitch Weight (lbs)": "3,450", "Unloaded Vehicle Weight (lbs)": "16,075", "Cargo Carrying Capacity (lbs)": "4,925", "Gross Vehicle Weight Rating (lbs)": "21,000" }, "Measurements": { "Length": "45' 8\"", "Exterior Height": "12' 5\"", "Exterior Height (with A/C)": "13' 3\"", "Exterior Height (with 2nd A/C)": "13' 3\"", "Exterior Width": "8' 6\"", "Exterior Width (with slides out)": "14' 6\"", "Interior Height (main)": "8' 3\"", "Interior Height (upper deck)": "6' 4\"", "Awning Length": "21' 0\"", "Awning Length 2": "11' 0\"", "Garage Length": "13' 6\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "106.0", "Gray Water Capacity (gals)": "87.0", "Black Tank Capacity (gals)": "87.0", "Propane Unit (lbs)": "60" }, "Miscellaneous": { "Sleeps": "up to 7", "Water Heater": "Tankless", "# of outside storage compartments": "1", "Furnace BTU": "35000", "Tire Size": "ST215/75R17.5'H'" } } }),
      jf("413", "413", null, { __m: "seismic-fw", sleeps: 6, length: "47' 0\"", weight: "15,985", slide: true, isNew: true, specs: { "Weights": { "Dry Hitch Weight (lbs)": "3,470", "Unloaded Vehicle Weight (lbs)": "15,985", "Cargo Carrying Capacity (lbs)": "4,815", "Gross Vehicle Weight Rating (lbs)": "20,800" }, "Measurements": { "Exterior Length (overall)": "47' 0\"", "Length": "46' 8\"", "Exterior Height": "12' 7\"", "Exterior Height (with A/C)": "13' 3\"", "Exterior Height (with 2nd A/C)": "13' 3\"", "Exterior Width": "8' 6\"", "Exterior Width (with slides out)": "11' 0\"", "Interior Height (main)": "8' 3\"", "Interior Height (upper deck)": "6' 4\"", "Awning Length": "21' 0\"", "Awning Length 2": "8' 0\"", "Garage Length": "14' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "106.0", "Gray Water Capacity (gals)": "87.0", "Black Tank Capacity (gals)": "50.0", "Propane Unit (lbs)": "60" }, "Miscellaneous": { "Sleeps": "up to 6", "Water Heater": "Tankless", "Furnace BTU": "35000", "Tire Size": "215/75R17.5'H'" } } }),
    ],
  };

  /* ---------- seismic-tt : 3 floorplans, 0 options, 1 exterior ---------- */
  const seismic_tt = {
    exterior: [
      { id: "as-shown", name: "As shown", price: 0 },
    ],
    /* Jayco publishes no Interior Design panel for this model. */
    interior: [ { id: 'as-shown', name: 'As shown', price: 0 } ],
    options: {},   /* Jayco publishes no option list for this model */
    floorplans: [
      jf("214", "214", 0, { __m: "seismic-tt", sleeps: 6, length: "25' 7\"", weight: "7,445", slide: true, specs: { "Weights": { "Dry Hitch Weight (lbs)": "1,045", "Unloaded Vehicle Weight (lbs)": "7,445", "Cargo Carrying Capacity (lbs)": "4,255", "Gross Vehicle Weight Rating (lbs)": "11,700" }, "Measurements": { "Length": "25' 7\"", "Exterior Height": "11' 11\"", "Exterior Height (with A/C)": "12' 8\"", "Exterior Width": "8' 6\"", "Exterior Width (with slides out)": "11' 6\"", "Interior Height (main)": "7' 6\"", "Interior Height (upper deck)": "7' 11\"", "Awning Length": "17' 0\"", "Garage Length": "14' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "106.0", "Gray Water Capacity (gals)": "74.0", "Black Tank Capacity (gals)": "37.0", "Propane Unit (lbs)": "40" }, "Miscellaneous": { "Sleeps": "up to 6", "Water Heater": "Tankless", "Furnace BTU": "35000", "Tire Size": "ST235/80R16'E'" } } }),
      jf("265", "265", 10125, { __m: "seismic-tt", sleeps: 6, length: "32' 8\"", weight: "8,640", slide: true, specs: { "Weights": { "Dry Hitch Weight (lbs)": "1,270", "Unloaded Vehicle Weight (lbs)": "8,640", "Cargo Carrying Capacity (lbs)": "4,610", "Gross Vehicle Weight Rating (lbs)": "13,250" }, "Measurements": { "Length": "32' 8\"", "Exterior Height": "11' 11\"", "Exterior Height (with A/C)": "12' 8\"", "Exterior Width": "8' 6\"", "Exterior Width (with slides out)": "11' 6\"", "Interior Height (main)": "8' 1\"", "Interior Height (upper deck)": "8' 0\"", "Awning Length": "21' 0\"", "Garage Length": "15' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "106.0", "Gray Water Capacity (gals)": "67.0", "Black Tank Capacity (gals)": "40.0", "Propane Unit (lbs)": "40", "Fuel Tank Capacity (gals)": "30" }, "Miscellaneous": { "Sleeps": "up to 6", "Water Heater": "Tankless", "Furnace BTU": "35000", "Tire Size": "ST235/80R16'E'" } } }),
      jf("286", "286", null, { __m: "seismic-tt", sleeps: 6, isNew: true, specs: { "Measurements": { "Exterior Width": "8' 6\"", "Awning Length": "21' 0\"", "Garage Length": "16' 6\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "106.0", "Gray Water Capacity (gals)": "74.0", "Black Tank Capacity (gals)": "37.0", "Propane Unit (lbs)": "40", "Fuel Tank Capacity (gals)": "30" }, "Miscellaneous": { "Sleeps": "up to 6", "Water Heater": "Tankless", "Furnace BTU": "35000" } } }),
    ],
  };

  /* ---------- seneca : 3 floorplans, 8 options, 6 exterior ---------- */
  const seneca = {
    exterior: [
      { id: "standard", name: "Standard graphics", price: 0 },
      { id: "2677", name: "Golden Eclipse Full-Body Paint", price: 30 },
      { id: "2678", name: "Midnight Shadow Full-Body Paint", price: 30 },
      { id: "2679", name: "Ocean Blue Full-Body Paint", price: 30 },
      { id: "2680", name: "Starlight Silver Full-Body Paint", price: 30 },
      { id: "2676", name: "Trinity Black Full-Body Paint", price: 30 },
    ],
    /* Jayco's published interior design(s) for this model, from the
       Interior Design panel on each floorplan page. Identical across
       every plan in the model, so it lives at model level. */
    interior: [
      { id: "beachwood", name: "Beachwood", price: 0, image: D + "seneca__beachwood.webp" },
      { id: "oakmont", name: "Oakmont", price: 0, image: D + "seneca__oakmont.webp" },
    ],
    options: {
      "2665": { name: "Customer Value Package", price: 27750, mandatory: true },
      "2668": { name: "Stackable washer/dryer (37K)", price: 2393 },
      "2667": { name: "Combination washer/dryer (37L, 37M)", price: 2093 },
      "2666": { name: "Power theater seating (37L) (STD on 37M)", price: 893 },
      "2670": { name: "Starlink satellite internet system with KING Jack™ antenna IPO Winegard Connect 2.0", price: 893 },
      "2672": { name: "Fabric Package - Oakmont", price: 593 },
      "2669": { name: "Hide-a-bed sofa ILO theater seating (37M)", price: 143 },
      "2674": { name: "Wood Options", price: 30 },
    },
    floorplans: [
      jf("37k", "37K", 0, { __m: "seneca", sleeps: 6, length: "39' 4\"", slide: true, optionIds: ["2672", "2674", "2665", "2668", "2670"], specs: { "Weights": { "Gross Vehicle Weight Rating (lbs)": "31,000", "Gross Combined Weight Rating (lbs)": "43,000" }, "Measurements": { "Exterior Length (overall)": "39' 4\"", "Exterior Height (with A/C)": "13' 4\"", "Exterior Width": "8' 5\"", "Exterior Width (with slides out)": "13' 7\"", "Interior Height (main)": "7' 0\"", "Awning Length": "17' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "72.0", "Gray Water Capacity (gals)": "51.0", "Black Tank Capacity (gals)": "40.0", "Propane Unit (lbs)": "83", "Fuel Tank Capacity (gals)": "100" }, "Miscellaneous": { "Sleeps": "up to 6", "Tire Size": "275/80R22.5G", "Engine Size": "Cummins ISB-300 6.7L", "Exterior Cargo Capacity (cu. ft.)": "155" } } }),
      jf("37l", "37L", 3307, { __m: "seneca", sleeps: 9, length: "39' 4\"", slide: true, optionIds: ["2672", "2674", "2665", "2666", "2667", "2670"], specs: { "Weights": { "Gross Vehicle Weight Rating (lbs)": "31,000", "Gross Combined Weight Rating (lbs)": "43,000" }, "Measurements": { "Exterior Length (overall)": "39' 4\"", "Exterior Height (with A/C)": "13' 4\"", "Exterior Width": "8' 5\"", "Exterior Width (with slides out)": "12' 11\"", "Interior Height (main)": "7' 0\"", "Awning Length": "18' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "72.0", "Gray Water Capacity (gals)": "50.0", "Black Tank Capacity (gals)": "50.0", "Propane Unit (lbs)": "83", "Fuel Tank Capacity (gals)": "100" }, "Miscellaneous": { "Sleeps": "up to 9", "Tire Size": "275/80R22.5G", "Engine Size": "Cummins ISB-300 6.7L", "Exterior Cargo Capacity (cu. ft.)": "157" } } }),
      jf("37m", "37M", 6607, { __m: "seneca", sleeps: 8, length: "39' 4\"", slide: true, optionIds: ["2672", "2674", "2665", "2669", "2667", "2670"], specs: { "Weights": { "Gross Vehicle Weight Rating (lbs)": "31,000", "Gross Combined Weight Rating (lbs)": "43,000" }, "Measurements": { "Exterior Length (overall)": "39' 4\"", "Exterior Height (with A/C)": "13' 4\"", "Exterior Width": "8' 5\"", "Exterior Width (with slides out)": "12' 11\"", "Interior Height (main)": "7' 0\"", "Awning Length": "18' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "72.0", "Gray Water Capacity (gals)": "50.0", "Black Tank Capacity (gals)": "50.0", "Propane Unit (lbs)": "83", "Fuel Tank Capacity (gals)": "100" }, "Miscellaneous": { "Sleeps": "up to 8", "Tire Size": "275/80R22.5G", "Engine Size": "Cummins ISB-300 6.7L", "Exterior Cargo Capacity (cu. ft.)": "157" } } }),
    ],
  };

  /* ---------- seneca-prestige : 3 floorplans, 15 options, 8 exterior ---------- */
  const seneca_prestige = {
    exterior: [
      { id: "standard", name: "Standard graphics", price: 0 },
      { id: "2569", name: "Carbon Grey Full-Body Paint", price: 30 },
      { id: "2570", name: "Crimson Charge Full-Body Paint", price: 30 },
      { id: "2571", name: "Lunar Black Full-Body Paint", price: 30 },
      { id: "2585", name: "Sapphire Blue Full-Body Paint", price: 30 },
      { id: "2586", name: "Sterling Silver Full-Body Paint", price: 30 },
      { id: "2587", name: "White Frost Full-Body Paint", price: 30 },
      { id: "2689", name: "White Mist Full-Body Paint", price: 30 },
    ],
    /* Jayco's published interior design(s) for this model, from the
       Interior Design panel on each floorplan page. Identical across
       every plan in the model, so it lives at model level. */
    interior: [
      { id: "bridle", name: "Bridle", price: 0, image: D + "seneca-prestige__bridle.webp" },
      { id: "saddle", name: "Saddle", price: 0, image: D + "seneca-prestige__saddle.webp" },
      { id: "trail", name: "Trail", price: 0, image: D + "seneca-prestige__trail.webp" },
      { id: "tribeca", name: "Tribeca", price: 0, image: D + "seneca-prestige__tribeca.webp" },
    ],
    options: {
      "2572": { name: "Customer Value Package", price: 30750, mandatory: true },
      "2583": { name: "California Emissions Chassis", price: 17993 },
      "2584": { name: "Blackout Package (wheels, grille, bumper and mirrors)", price: 5243 },
      "2577": { name: "Stackable washer/dryer", price: 2543 },
      "2581": { name: "Canadian Shaw® TRAV'LER® satellite dish", price: 1943 },
      "2573": { name: "12V basement fridge/freezer on slideout tray", price: 1343 },
      "2579": { name: "Winegard® TRAV’LER® satellite dish - DIRECTV®", price: 1343 },
      "2580": { name: "Winegard® TRAV’LER® satellite dish - Dish Network®", price: 1343 },
      "2574": { name: "Power theater seating (37L only)(STD on 37M)", price: 893 },
      "2578": { name: "Starlink satellite internet system", price: 893 },
      "2582": { name: "Canadian Standards", price: 353 },
      "2576": { name: "Freestanding table with 4 chairs (N/A 37L)", price: 143 },
      "2575": { name: "Hide-a-bed sofa ILO theater seating (37M only)", price: 143 },
      "2592": { name: "Fabric Package - Tribeca (WOOD OPTION INCLUDED)", price: 30 },
      "2589": { name: "Wood Options (Only available for Bridle, Saddle and Trail Fabric Packages)", price: 30 },
    },
    floorplans: [
      jf("37k", "37K", 0, { __m: "seneca-prestige", optionIds: ["2589", "2592", "2572", "2573", "2576", "2577", "2578", "2579", "2580", "2581", "2584", "2583", "2582"] }),
      jf("37l", "37L", 9000, { __m: "seneca-prestige", optionIds: ["2589", "2592", "2572", "2574", "2577", "2578", "2579", "2580", "2581", "2584", "2583", "2582"] }),
      jf("37m", "37M", 9000, { __m: "seneca-prestige", optionIds: ["2589", "2592", "2572", "2575", "2576", "2577", "2578", "2579", "2580", "2581", "2584", "2583", "2582"] }),
    ],
  };

  /* ---------- seneca-xt : 2 floorplans, 5 options, 6 exterior ---------- */
  const seneca_xt = {
    exterior: [
      { id: "standard", name: "Standard graphics", price: 0 },
      { id: "2396", name: "Blindfold Full-Body Paint", price: 20 },
      { id: "2397", name: "Deep River Full-Body Paint", price: 20 },
      { id: "2398", name: "Hibernate Full-Body Paint", price: 20 },
      { id: "2399", name: "Midnight Full-Body Paint", price: 20 },
      { id: "2400", name: "Voyage Full-Body Paint", price: 20 },
    ],
    /* Jayco's published interior design(s) for this model, from the
       Interior Design panel on each floorplan page. Identical across
       every plan in the model, so it lives at model level. */
    interior: [
      { id: "bradford", name: "Bradford", price: 0, image: D + "seneca-xt__bradford.webp" },
    ],
    options: {
      "2402": { name: "Customer Value Package", price: 31050, mandatory: true },
      "2406": { name: "Combination Washer/Dryer (35L)", price: 1943 },
      "2405": { name: "Power Theater Seating (32U, 35L)", price: 1125 },
      "2404": { name: "12V Refrigerator", price: 443 },
      "2407": { name: "Canadian Standards", price: 353 },
    },
    floorplans: [
      jf("32u", "32U", 0, { __m: "seneca-xt", sleeps: 4, length: "34' 3\"", optionIds: ["2402", "2404", "2405", "2407"], specs: { "Weights": { "Gross Vehicle Weight Rating (lbs)": "22,000", "Gross Combined Weight Rating (lbs)": "34,000" }, "Measurements": { "Exterior Length (overall)": "34' 3\"", "Exterior Height (with A/C)": "12' 6\"", "Exterior Width": "8' 5\"", "Interior Height (main)": "7' 0\"", "Awning Length": "20' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "60.0", "Gray Water Capacity (gals)": "38.0", "Black Tank Capacity (gals)": "30.0", "Fuel Tank Capacity (gals)": "67" }, "Miscellaneous": { "Sleeps": "up to 4", "Furnace BTU": "30000", "Tire Size": "245/70R19.5G", "Engine Size": "6.7L Power Stroke V8 Turbo Diesel" } } }),
      jf("35l", "35L", 5175, { __m: "seneca-xt", sleeps: 5, length: "37' 4\"", optionIds: ["2402", "2404", "2405", "2406", "2407"], specs: { "Weights": { "Gross Vehicle Weight Rating (lbs)": "22,000", "Gross Combined Weight Rating (lbs)": "34,000" }, "Measurements": { "Exterior Length (overall)": "37' 4\"", "Exterior Height (with A/C)": "12' 6\"", "Exterior Width": "8' 5\"", "Interior Height (main)": "7' 0\"", "Awning Length": "17' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "60.0", "Gray Water Capacity (gals)": "30.0", "Black Tank Capacity (gals)": "30.0", "Fuel Tank Capacity (gals)": "67" }, "Miscellaneous": { "Sleeps": "up to 5", "Furnace BTU": "30000", "Tire Size": "245/70R19.5G", "Engine Size": "6.7L Power Stroke V8 Turbo Diesel", "Exterior Cargo Capacity (cu. ft.)": "120" } } }),
    ],
  };

  /* ---------- swift : 2 floorplans, 8 options, 1 exterior ---------- */
  const swift = {
    exterior: [
      { id: "as-shown", name: "As shown", price: 0 },
    ],
    /* Jayco's published interior design(s) for this model, from the
       Interior Design panel on each floorplan page. Identical across
       every plan in the model, so it lives at model level. */
    interior: [
      { id: "acadia", name: "Acadia", price: 0, image: D + "swift__acadia.webp" },
    ],
    options: {
      "2646": { name: "50.5 in. x 79.75 in. pop- top", price: 13493 },
      "2645": { name: "Customer Value Package", price: 11250, mandatory: true },
      "2649": { name: "(2) additional cab seats with slide and recline features ILO bench seat (20E Only)", price: 2843 },
      "2647": { name: "250W roof-mounted solar panel with integrated control panel (pop-top option only)", price: 1275 },
      "2648": { name: "200W roof-mounted solar panel with integrated control panel (N/A with pop-top option)", price: 525 },
      "2650": { name: "Canadian Standards", price: 293 },
      "2652": { name: "Ceramic", price: 30 },
      "2651": { name: "Silver", price: 30 },
    },
    floorplans: [
      jf("20e", "20E", 0, { __m: "swift", sleeps: 2, length: "20' 11\"", optionIds: ["2651", "2652", "2645", "2646", "2647", "2648", "2649", "2650"], specs: { "Weights": { "Gross Vehicle Weight Rating (lbs)": "9,350", "Gross Combined Weight Rating (lbs)": "12,000" }, "Measurements": { "Exterior Length (overall)": "20' 11\"", "Exterior Height (with A/C)": "9' 3\"", "Exterior Width": "6' 11\"", "Interior Height (main)": "6' 2\"", "Awning Length": "13' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "21.0", "Gray Water Capacity (gals)": "20.0", "Black Tank Capacity (gals)": "10.0", "Fuel Tank Capacity (gals)": "24" }, "Miscellaneous": { "Sleeps": "up to 2", "Tire Size": "LT225/75R 16E", "Engine Size": "3.6L V6 Gas" } } }),
      jf("20t", "20T", 0, { __m: "swift", sleeps: 2, length: "20' 11\"", optionIds: ["2651", "2652", "2645", "2648", "2650"], specs: { "Weights": { "Gross Vehicle Weight Rating (lbs)": "9,350", "Gross Combined Weight Rating (lbs)": "12,000" }, "Measurements": { "Exterior Length (overall)": "20' 11\"", "Exterior Height (with A/C)": "9' 3\"", "Exterior Width": "6' 11\"", "Interior Height (main)": "6' 2\"", "Awning Length": "13' 0\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "24.0", "Gray Water Capacity (gals)": "13.0", "Black Tank Capacity (gals)": "12.0", "Fuel Tank Capacity (gals)": "24" }, "Miscellaneous": { "Sleeps": "up to 2", "Water Heater": "Tankless", "Tire Size": "LT225/75R 16E", "Engine Size": "3.6L V6 Gas" } } }),
    ],
  };

  /* ---------- terrain : 4 floorplans, 6 options, 1 exterior ---------- */
  const terrain = {
    exterior: [
      { id: "as-shown", name: "As shown", price: 0 },
    ],
    /* Jayco's published interior design(s) for this model, from the
       Interior Design panel on each floorplan page. Identical across
       every plan in the model, so it lives at model level. */
    interior: [
      { id: "timberland", name: "Timberland", price: 0, image: D + "terrain__timberland.webp" },
    ],
    options: {
      "2657": { name: "Customer Value Package", price: 19125, mandatory: true },
      "2658": { name: "Rear spare tire with tire mount", price: 1493 },
      "2686": { name: "Canadian Standards", price: 293 },
      "2659": { name: "Standard Sandstone", price: 30 },
      "2663": { name: "Standard Selenite Van", price: 30 },
      "2661": { name: "Standard Silver", price: 30 },
    },
    floorplans: [
      jf("19ag", "19AG - Generator", 0, { __m: "terrain", length: "23' 6\"", optionIds: ["2659", "2661", "2663", "2657", "2658", "2686"], specs: { "Weights": { "Gross Vehicle Weight Rating (lbs)": "9,050", "Gross Combined Weight Rating (lbs)": "13,930" }, "Measurements": { "Exterior Length (overall)": "23' 6\"", "Exterior Height (with A/C)": "10' 1\"", "Exterior Width": "6' 10\"", "Interior Height (main)": "6' 2\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "21.0", "Gray Water Capacity (gals)": "19.0", "Black Tank Capacity (gals)": "5.5", "Furnace, Auto-ignition (BTU output)": "17000", "Fuel Tank Capacity (gals)": "24" }, "Miscellaneous": { "Furnace BTU": "17000" } } }),
      jf("19yg", "19YG - Generator", 19493, { __m: "terrain", optionIds: ["2659", "2661", "2663", "2657", "2658", "2686"] }),
      jf("19a", "19A - Lithium", 22500, { __m: "terrain", length: "23' 6\"", optionIds: ["2659", "2661", "2663", "2657", "2658", "2686"], specs: { "Weights": { "Gross Vehicle Weight Rating (lbs)": "9,050", "Gross Combined Weight Rating (lbs)": "13,930" }, "Measurements": { "Exterior Length (overall)": "23' 6\"", "Exterior Height (with A/C)": "10' 1\"", "Exterior Width": "6' 10\"", "Interior Height (main)": "6' 2\"" }, "Tank Capacities": { "Fresh Water Capacity (gals)": "21.0", "Gray Water Capacity (gals)": "19.0", "Black Tank Capacity (gals)": "5.5", "Furnace, Auto-ignition (BTU output)": "17000", "Fuel Tank Capacity (gals)": "24" } } }),
      jf("19y", "19Y - Lithium", 43500, { __m: "terrain", optionIds: ["2659", "2661", "2663", "2657", "2658", "2686"] }),
    ],
  };

  return {
    "alante": alante,
    "alante-se": alante_se,
    "comet": comet,
    "eagle-fw": eagle_fw,
    "eagle-sle-fw": eagle_sle_fw,
    "eagle-tt": eagle_tt,
    "greyhawk": greyhawk,
    "greyhawk-xl": greyhawk_xl,
    "jay-feather": jay_feather,
    "jay-feather-air": jay_feather_air,
    "jay-feather-air-sl": jay_feather_air_sl,
    "jay-feather-sl": jay_feather_sl,
    "jay-flight": jay_flight,
    "jay-flight-bungalow": jay_flight_bungalow,
    "north-point": north_point,
    "pinnacle": pinnacle,
    "precept": precept,
    "precept-prestige": precept_prestige,
    "redhawk": redhawk,
    "redhawk-se": redhawk_se,
    "seismic-fw": seismic_fw,
    "seismic-tt": seismic_tt,
    "seneca": seneca,
    "seneca-prestige": seneca_prestige,
    "seneca-xt": seneca_xt,
    "swift": swift,
    "terrain": terrain,
  };
}());
