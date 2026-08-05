/* ===================================================
   Jayco — Model Detail data (motorized template)
   ---------------------------------------------------
   One record per model. model-detail.js renders every
   section from these fields, so adding another
   motorized model is a data-only change.

   TEMPLATE RULES the renderer follows
   • floorplanFilters  → the filter row renders only when a
     model has 4+ floorplans (Swift has 2, so it is skipped).
   • cutaway           → the cutaway band renders only when the
     model supplies one (Swift has no cutaway art).
   • any featureGroup with an empty items[] is skipped.

   DATA PROVENANCE
   • Swift specs, MSRP, floorplan codes, package and option
     pricing are the real 2027 figures from jayco.com.
   • Photography is Jayco/Entegra studio + lifestyle assets
     supplied for this build (some studio shots are of the
     equivalent MY25 coach, which shares the interior).
   =================================================== */

window.JAYCO_MODEL_DETAIL = (function () {
  'use strict';

  /* Folder name contains a space — keep every path URL-encoded. */
  const IMG = '../assets/model%20details/swift/web/';
  const img   = (f) => IMG + f;
  const wide  = (f) => IMG + 'wide/' + f;     /* 2000px — full-bleed media */
  const mid   = (f) => IMG + 'mid/' + f;      /* 1100px — contained media */
  const thumb = (f) => IMG + 'thumbs/' + f;   /*  800px — gallery grid */
  /* one filename → every size the page needs (full-size `src` is the lightbox).
     `wide` only resolves for files that were exported at 2000px — the renderer
     falls back to `src` when a full-bleed slot has no wide version. */
  const WIDE = [
    '20251016-0323.jpg', '20251016-3113.jpg', '20251016-3165.jpg', '20251016-3170.jpg',
    '20251016-3200.jpg', '20251016-3274.jpg', '20251016-3424.jpg', '20251016-3439.jpg',
    '20251016-4338.jpg', 'ethos-btf-lagun-table.jpg', 'swift-20y-firefly.jpg',
    'swift-20y-kitchen.jpg', 'swift-20y-wetbath.jpg', 'swift-ext-btf.jpg',
  ];
  const shot = (file, alt) => ({
    src: img(file),
    wide: WIDE.indexOf(file) !== -1 ? wide(file) : img(file),
    mid: mid(file),
    thumb: thumb(file),
    alt,
  });

  /* Scenery carousel cards. One 1600px export each and the copy that rides
     under it — these never open the lightbox, so there is no thumb or wide. */
  const card = (file, alt, title, body) => ({ src: img(file), alt, title, body });

  const swift = {
    slug: 'swift',
    name: 'Swift',
    year: 2027,
    category: 'class-b',
    categoryLabel: 'Class B Motorhome',
    priceFrom: 150300,

    hero: {
      video:   img('swift-hero.mp4'),
      poster:  img('swift-hero-poster.jpg'),
      heading: 'Swift',
      sub: 'A camper van that parks in a normal spot, drives like the van it is, and sleeps you wherever the day ends.',
      ctas: [
        { label: 'Build & Price', href: '#', style: 'primary' },   /* v4 has no builder page yet */
        { label: 'Find a Dealer', href: 'index.html#dealer-locator', style: 'secondary' },
      ],
    },

    /* ---- Intro: Class B persona — couples & solo travellers entering van life ---- */
    intro: {
      label: 'The Class B Life',
      heading: 'Van life,<br>without the leap.',
      body: [
        'Meet the Swift: 20 feet 11 inches of van life that parks like a daily driver and turns any open road into a weekend plan.',
        'Inside, a real galley, private wet bath, ready-made bed and off-grid power keep adventure easy. The bright 2027 interior adds durable coin flooring for wet boots, sandy dogs and everything in between.',
      ],
      /* type:'render' — a cut-out studio render on transparency, shown whole on
         the page background rather than cropped full-bleed like a photograph */
      image: {
        src: img('swift-render-34-1773.webp'),
        alt: '2027 Jayco Swift camper van, three-quarter front view',
        type: 'render',
        /* Intrinsic size. Without these the img has no aspect to reserve and
           its box is 0px tall until the lazy load lands, which jumps the whole
           intro by ~370px and makes the first crease measurement meaningless. */
        w: 1773,
        h: 1036,
        /* Where the coach's visible middle sits in that box, as a fraction.
           Measured from the alpha channel: the ink runs y 0..1003 of 1036, so
           there is 3% transparent padding at the bottom and none at the top and
           the visual centre is at 0.4841, not 0.5. This is a property of THIS
           export — a differently-padded render needs its own figure, which is
           why it lives here and not as a constant in model-detail.js. It is
           what the studio crease is aligned to. */
        inkCentre: 0.4841,
      },
    },

    /* ---- Three ways it fits — NOT RENDERED ----
       The section was removed from the page; nothing reads `fits` any more.
       Kept as archive alongside `gallery` below — the renderer, its markup and
       its CSS are gone. */
    fits: {
      label: 'How it fits',
      heading: 'Three ways to use it.',
      blocks: [
        {
          eyebrow: 'Weekends',
          title: 'Leave on Friday, no planning required.',
          body: 'It is already packed and it already fits your driveway. Point it at a forecast on Friday afternoon and go.',
          image: shot('20251016-3165.jpg', 'Swift parked at a creek with the awning out and camp chairs by the water'),
        },
        {
          eyebrow: 'Off-grid',
          title: 'Three days out with nothing plugged in.',
          body: 'Two house batteries, a 2,000W inverter and up to 250W of roof solar — plus a 2,800W generator when the weather turns.',
          image: shot('20251016-3424.jpg', 'Swift at a riverside camp at sunset'),
        },
        {
          eyebrow: 'Every day',
          title: 'The rest of the week, it is just a van.',
          body: 'Twenty feet eleven inches. It parks in a standard space, clears most garages and takes the school run without comment.',
          image: shot('20251016-4338.jpg', 'Couple at the river beside the Swift'),
        },
      ],
    },

    /* ---- High-level specs strip (rendered inside the intro) ---- */
    highlights: [
      { value: '2',                   label: 'Sleeps',      note: 'Up to 4 with pop-top' },
      { value: '20′ 11″',   label: 'Length',      note: 'Fits a standard space' },
      { value: 'ProMaster 3500',      label: 'Chassis',     note: 'RAM®, 9-speed auto' },
      { value: '276 hp',              label: 'Engine',      note: '3.6L V6, 250 lb-ft' },
      { value: '24 gal',              label: 'Fresh water', note: '21 gal on the 20E' },
      { value: '2',                   label: 'Floorplans',  note: '20E and 20T' },
    ],

    /* ---- Scenery band + detail carousel ----
       Closes the orientation: one full-bleed exterior carrying the section's
       headline, then the studio detail set beneath it. Ordered as a walk
       through the coach — live, cook, sleep, stow, wash — not by filename. */
    scenery: {
      heading: 'Small van. Big scenery.',
      image: shot('20251016-3200.jpg', 'Swift parked on a rock ledge beside a creek in autumn woods'),
      items: [
        card('swift-gallery-3.jpg',
          'Front lounge looking forward past the swivelled cab seats to the windshield',
          'A lounge that seats the crew',
          'Bench seating, a table that moves with you and a window on the world — the front half lives as a living room until you need it to be a cockpit.'),
        card('swift-gallery-7.jpg',
          'Galley with the two-burner range, stainless sink and faucet under a side window',
          'A galley you will actually cook in',
          'Two-burner range, deep stainless sink and a covered prep surface with a window right over it.'),
        card('swift-gallery-1.jpg',
          'Looking aft from the galley to the rear bed, made up with blankets',
          'Dinner, dishes, lights out',
          'The kitchen sits mid-coach with the bed just behind it, so the whole evening happens in about three steps.'),
        card('swift-gallery-8.jpg',
          'Rear doors open on the storage garage and drawers beneath the bed',
          'The garage under the bed',
          'Open the rear doors and the space beneath the mattress swallows bikes, boards, coolers and wet gear.'),
        card('swift-gallery-11.jpg',
          'Wet bath with shower head, sink and toilet',
          'A private bath on board',
          'A full wet bath with a proper shower head, sink and toilet — no campground negotiation required.'),
        card('swift-gallery-12.jpg',
          'Shower valve and ShowerMiser control in the wet bath',
          'Water that lasts the weekend',
          'ShowerMiser returns cold water to the fresh tank while it heats, instead of sending it down the drain.'),
        card('swift-gallery-2.jpg',
          'Cabin looking forward with both cab seats swivelled toward the lounge',
          'The cab joins the room',
          'Both front seats swivel back to face the cabin, which makes the driver’s seat the best chair in the house.'),
        card('swift-gallery-4.jpg',
          'Ceiling-mounted television folded down above the cab seats',
          'A screen that folds away',
          'The display swings down from the ceiling for the lounge or the bed, then tucks back up out of the way.'),
        card('swift-gallery-5.jpg',
          'Driver’s view of the ProMaster dash and touchscreen with mountains ahead',
          'Drives like a daily driver',
          'The RAM® ProMaster cockpit — 9-speed automatic, touchscreen, and a footprint that fits a standard parking space.'),
        card('swift-gallery-6.jpg',
          'Full-length overhead cabinets running down the cabin wall',
          'Storage overhead, not underfoot',
          'Upper cabinets run the length of the cabin, so the floor stays clear for the part where you actually live.'),
        card('swift-gallery-10.jpg',
          'Two deep galley drawers pulled open beside the range',
          'Drawers where you need them',
          'Deep drawers pull out beside the range, with more storage tucked below the galley counter.'),
        card('swift-gallery-9.jpg',
          'Firefly control panel showing lights, tanks and battery status',
          'One panel runs the coach',
          'Lights, tanks, climate and battery state all report to a single screen inside the door.'),
      ],
    },

    /* ---- Gallery — NOT RENDERED ----
       The scenery carousel above replaced this section; nothing reads `gallery`
       any more. Kept because the picks and their alt text took work and the
       template may want a second photo set again, but treat it as archive: the
       renderer, its markup and its CSS are gone. */
    gallery: {
      label: 'Gallery',
      heading: 'See it in its element.',
      hero: shot('swift-gallery-hero.jpg', 'Swift parked at a creek in the woods, side door open and camp chairs out'),
      items: [
        /* 20251016-3200 is the scenery band's full-bleed shot — kept out of here
           so the same photograph does not appear twice on one page */
        shot('20251016-3069.jpg', 'Rear bed with the side door open to the river'),
        shot('swift-ftb.jpg', 'Galley and rear bed inside the Swift'),
        shot('20251016-4338.jpg', 'Couple at the river beside the Swift'),
        shot('20251016-3077.jpg', 'Looking forward through the cabin to the swivelling cab seats'),
        shot('swift-20y-wetbath.jpg', 'Private wet bath with shower and skylight'),
        shot('20251016-0323.jpg', 'Swift driving a tree-lined highway'),
        shot('swift-ext-btf.jpg', 'Rear doors open on the storage garage'),
        shot('20251016-3239.jpg', 'Side profile of the Swift at the water’s edge'),
        shot('20251016-3439.jpg', 'Aerial view of the Swift parked beside a creek'),
        shot('swift-btf.jpg', 'Front lounge with swivelling cab seats and table'),
        shot('20251016-3274.jpg', 'Patio awning extended over the camp site'),
      ],
    },

    /* ---- The Layout — the page's signature section ----
       Each floorplan carries `hotspots`: numbered points on the drawing, each
       one opening the real photograph of that zone. x/y are percentages of the
       drawing box, measured off the 1800×920 export — keep the stage padding-
       free or every dot desyncs from the art. A plan with no `hotspots` falls
       back to the plain drawing + info panel. */
    plan: {
      label: 'The Layout',
      heading: 'Twenty-one feet, laid out.',
      body: 'Two ways to arrange the same van. Tap a number to see what that corner actually looks like.',
    },

    /* filters render only at 4+ plans; the Swift's two are shown side by side. */
    floorplanFilters: [
      { id: 'sleeps-4', label: 'Sleeps 4+',    match: (fp) => fp.sleepsMax >= 4 },
      { id: 'garage',   label: 'Gear garage',  match: (fp) => fp.tags.indexOf('garage') !== -1 },
      { id: 'twin',     label: 'Twin beds',    match: (fp) => fp.tags.indexOf('twin') !== -1 },
      { id: 'poptop',   label: 'Pop-top ready',match: (fp) => fp.tags.indexOf('poptop') !== -1 },
    ],

    floorplans: [
      {
        id: '20E',
        name: '20E',
        image: img('floorplan-20e.webp'),
        price: 150300,
        sleeps: 'Up to 2',
        sleepsMax: 4,
        length: '20′ 11″',
        tags: ['garage', 'poptop'],
        blurb: 'Rear garage layout. The back of the coach is left open for bikes, boards and bins, with the bed lifting over the top of it — and the optional pop-top doubles your sleeping capacity when the weekend grows.',
        specs: [
          ['Fresh water', '21 gal'],
          ['Grey / black', '20 / 10 gal'],
          ['Best for', 'Gear haulers'],
          ['Pop-top', 'Available'],
        ],
        tour360: null,
        hotspots: [
          { id: 'cab', x: 80, y: 41, eyebrow: 'Drive',
            title: 'Cab',
            body: 'Both 6-way seats swivel into the lounge once you stop, so the front of the van becomes the front of the room.',
            image: shot('swift-20y-dash.jpg', 'Swift cab with the dash, phone mount and swivel seats') },
          { id: 'lounge', x: 63, y: 44, eyebrow: 'Sit',
            title: 'Bench seating & pop-top',
            body: 'Belted bench seating behind the cab. The optional pop-top opens overhead — 50.5″ × 79.75″ of extra bed.',
            stat: 'Sleeps 2 more',
            image: shot('swift-20y-seating.jpg', 'Lounge seating with the cab seats swivelled around') },
          { id: 'bath', x: 38, y: 15, eyebrow: 'Wash',
            title: 'Wet bath',
            body: 'A proper enclosed shower and toilet, 25″ × 46.25″, with the Aqua-View SHOWERMI$TER stretching every gallon of the 21-gallon tank.',
            stat: '25″ × 46.25″',
            image: shot('swift-20y-wetbath.jpg', 'Wet bath with shower fittings and a skylight') },
          { id: 'galley', x: 44, y: 63, eyebrow: 'Cook',
            title: 'Galley',
            body: 'Two-burner cooktop, stainless sink with a covered basin, fridge and real counter beside the door — where you actually want it, next to the awning.',
            image: shot('swift-20y-kitchen.jpg', 'Galley with two-burner cooktop and stainless sink') },
          { id: 'bed', x: 11, y: 16, eyebrow: 'Sleep',
            title: 'Murphy bed',
            body: 'A 59″ × 73″ bed that folds down over the garage at night and disappears in the morning. The floor underneath stays yours all day.',
            stat: '59″ × 73″',
            image: shot('ethos-btf-bed.jpg', 'Rear bed made up across the back of the coach') },
          { id: 'garage', x: 16, y: 39, eyebrow: 'Load',
            title: 'Gear garage',
            body: 'The whole rear opens for bikes, boards and bins, with 32.38″ of clearance under the bed and pull-out trays in the floor.',
            stat: '32.38″ clear',
            image: shot('swift-20y-rear-storage.jpg', 'Rear storage area under the bed with pull-out trays') },
        ],
      },
      {
        id: '20T',
        name: '20T',
        image: img('floorplan-20t.webp'),
        price: 150300,
        sleeps: 'Up to 2',
        sleepsMax: 2,
        length: '20′ 11″',
        tags: ['twin'],
        blurb: 'The most popular Swift. Galley forward, dual twin beds aft that convert to a king, and the wet bath tucked in the rear corner — the layout for travellers who want to sleep separately and still have a bathroom.',
        specs: [
          ['Fresh water', '24 gal'],
          ['Grey / black', '13 / 12 gal'],
          ['Best for', 'Two travellers'],
          ['Beds', 'Twins or king'],
        ],
        /* Jayco's own Matterport scan of the 20T, lifted from the "360°" button
           and the embedded iframe on jayco.com/rvs/class-b-motorhomes/2027-swift/20t/.
           The 20E page carries no tour, which is why that plan stays null — the
           button only renders for plans that actually have a walkthrough. The
           field keeps its 360 name because that is the capture format; the
           button is labelled "3D Tour" per the client's wording. */
        tour360: 'https://my.matterport.com/show/?m=PgNjsbhY4xw',
        hotspots: [
          { id: 'cab', x: 80, y: 41, eyebrow: 'Drive',
            title: 'Cab',
            body: 'Both 6-way seats swivel into the lounge once you stop, so the front of the van becomes the front of the room.',
            image: shot('swift-20y-dash.jpg', 'Swift cab with the dash, phone mount and swivel seats') },
          { id: 'galley', x: 55, y: 27, eyebrow: 'Cook',
            title: 'Galley',
            body: 'Sink, fridge and microwave run along the street side with the counter continuing aft — you cook facing the doorway, not a wall.',
            image: shot('swift-20y-ftb.jpg', 'Galley counter looking aft toward the beds') },
          { id: 'beds', x: 22, y: 25, eyebrow: 'Sleep',
            title: 'Twin beds, or a king',
            body: 'A 30″ × 74″ and a 30″ × 80″ twin, each with its own window. Drop the table between them and they become one king.',
            stat: '30″ × 80″',
            image: shot('ethos-ftb.jpg', 'Twin beds made up with the table stowed between them') },
          { id: 'entry', x: 57, y: 68, eyebrow: 'Camp',
            title: 'Entry & awning',
            body: 'The door lands you in the middle of the van, under 13 feet of powered awning with an LED strip along its edge.',
            stat: '13′ awning',
            image: shot('20251016-3274.jpg', 'Patio awning extended over the camp site') },
          { id: 'bath', x: 12, y: 20, eyebrow: 'Wash',
            title: 'Wet bath',
            body: 'Tucked into the rear corner at 25″ × 43″, with the 24-gallon fresh tank behind it — the largest in the Swift line.',
            stat: '25″ × 43″',
            image: shot('swift-20y-showermiser.jpg', 'Wet bath shower fittings with the SHOWERMI$TER control') },
          { id: 'storage', x: 8, y: 62, eyebrow: 'Stow',
            title: 'Wardrobe & storage',
            body: 'A full-height wardrobe opposite the bath, overhead lockers down both sides, and drawers under the beds.',
            image: shot('swift-20y-cabinets-under-bed.jpg', 'Storage cabinets and drawers under the bed') },
        ],
      },
    ],

    /* ---- Pricing ---- */
    pricing: {
      label: 'Pricing',
      heading: 'What it costs.',
      msrp: 150300,
      msrpNote: 'Starting MSRP, 2027 Swift. Excludes freight, dealer prep, taxes and title.',
      mandatory: {
        name: 'Customer Value Package',
        price: 11250,
        note: 'Required on every Swift',
        items: [
          'JRide® — Hellwig helper springs and premium heavy-duty suspension',
          'Electric patio awning with LED light strip',
          'Truma Combi® G Comfort Plus water heater and furnace',
          '6-way adjustable driver and passenger seats',
          '2,000W inverter',
        ],
      },
      options: [
        { name: 'Pop-top roof — 50.5″ x 79.5″', price: 13493, note: '20E only. Sleeps two more.' },
        { name: 'Rear cabin seats', price: 2843, note: 'Two extra seats with slide and recline' },
        { name: '250W roof solar with control panel', price: 1275, note: 'Pop-top coaches' },
        { name: '200W roof solar with control panel', price: 525, note: 'Standard roof' },
        { name: 'Exterior colour — Silver or Ceramic', price: 30, note: 'Either scheme' },
      ],
      disclaimer: 'Jayco publishes no-haggle MSRP. Your dealer confirms final pricing, availability and any regional fees.',
    },

    /* ---- Features ----
       One eyebrow for the whole section, then five categories of plain
       title/body rows. No images by design: the Gallery and the Layout section
       already carry the photography, and this section's job is to be the
       scannable list of what the coach comes with. Adding a photo here would
       mean rebuilding the renderer, not adding a field. */
    features: {
      label: 'Features',
      heading: 'Standard on every Swift.',
    },

    featureGroups: [
      {
        id: 'living',
        name: 'Living & Comfort',
        items: [
          { title: 'A room, not a corridor', body: 'Swivel the cab seats, drop the table, and the front half of the van becomes the living room. Six foot two of standing height means you do it without stooping.' },
          { title: 'Beds that convert', body: 'Dual twins on the 20T slide together into a king; the 20E lifts its bed over the garage.' },
          { title: 'Seamless cabinetry', body: 'Technoform overhead lockers close flush and stay closed — no rattles at speed.' },
          { title: 'JBL portable speaker', body: 'Docks and charges on board, then comes with you down to the water.' },
          { title: 'Coin flooring', body: 'New for 2027 — quick to wipe down, unbothered by wet boots and sandy dogs.' },
        ],
      },
      {
        id: 'kitchen',
        name: 'Kitchen & Bath',
        items: [
          { title: 'Full galley', body: 'Two-burner cooktop, stainless sink with a covered basin, refrigerator and real counter space beside the door.' },
          { title: 'Private wet bath', body: 'A proper enclosed shower and toilet in a 20-foot van — a thing most vans this size ask you to do without.' },
          { title: 'SHOWERMI$TER', body: 'Aqua-View’s shower control pauses the flow at temperature, so a 21-gallon tank lasts a lot more than one shower.' },
          /* filtration sits on the fresh-water fill, but what it delivers is the tap */
          { title: 'Water filtration', body: 'On the fresh-water fill — what comes out of the tap beats what went into the tank.' },
        ],
      },
      {
        id: 'power',
        name: 'Power & Climate',
        items: [
          { title: '2,800W gas generator', body: 'Runs the air conditioner and charges the house bank without a hookup, off the same fuel you drive on.' },
          { title: 'Power that lasts the night', body: 'Two 12V AGM house batteries, a 2,000W inverter, 30-amp service and up to 250W of roof solar.' },
          { title: 'Firefly multiplex control', body: 'Lighting, climate, awning, generator, tank levels and battery state — the whole coach from one touchscreen.' },
          { title: '30-amp shore power', body: 'Detachable cord, so nothing stays tethered to the coach when you leave.' },
        ],
      },
      {
        id: 'driving',
        name: 'Driving & Safety',
        items: [
          { title: 'RAM® ProMaster 3500', body: '3.6L V6 making 276 hp and 250 lb-ft through a 9-speed automatic. Front-wheel drive, low step-in, 6′ 2″ of standing room.' },
          { title: 'JRide® ride and handling', body: 'Hellwig helper springs and premium heavy-duty suspension — less wander in the ruts, less lean in the corners, less work at the wheel.' },
          { title: 'A cockpit that works parked', body: 'Backup camera, ParkSense® sensors, stability control and hill-start assist come standard on the chassis — and both 6-way cab seats swivel into the lounge once you stop.' },
          { title: 'Range you can plan around', body: '24-gallon fuel tank on regular gas, 9,350 lb GVWR and a 12,000 lb GCWR — fill up anywhere, park anywhere.' },
          { title: 'Safety equipment standard', body: 'Smoke alarm, carbon monoxide detector and fire extinguisher on every coach.' },
        ],
      },
      {
        id: 'exterior',
        name: 'Exterior & Storage',
        items: [
          { title: 'Electric patio awning', body: '13 feet of shade with an integrated LED light strip. One button out, one button back.' },
          { title: 'Rear storage garage', body: 'On the 20E, the rear opens onto a garage for bikes, boards and bins — with the bed lifting over the top.' },
          { title: '3,500 lb hitch receiver', body: 'Dual 4/7-pin connector — a small trailer, a rack or a boat still comes along.' },
        ],
      },
    ],

    /* ---- Videos ----
       Jayco's "Top 10 Features & Benefits" series for the Swift, from the
       model's page on jayco.com. `id` is the YouTube id; the titles here are
       shortened to the feature itself — every source title carries the same
       "– Swift Class B Motorhome - Top 10 Features & Benefits – Jayco RV"
       tail, which in a grid of eight is eight repetitions of nothing. */
    videos: {
      label: 'Videos',
      heading: 'Ten features, explained.',
      items: [
        { id: 'jzE0z-i0-44', title: 'ProMaster chassis',   note: 'The van underneath it all.' },
        { id: 'O7hw0YABBIs', title: 'JRide',               note: 'Ride and handling package.' },
        { id: 'LIjntnvC9j0', title: 'Pop-top option',      note: 'Two more berths overhead.' },
        { id: 'O6-a_vsvzps', title: 'Firefly system',      note: 'The whole coach, one screen.' },
        { id: 'Ot9rXYgGzXY', title: 'Truma Combi',         note: 'Heat and hot water in one.' },
        { id: 'SXTud0c_wBI', title: 'SHOWERMI$TER',        note: 'More showers per tank.' },
        { id: 'MDFXVp04lBk', title: 'Technoform cabinetry',note: 'Lockers that stay shut.' },
        { id: 'ZoAWCXXmQE4', title: 'Thule package',       note: 'Awning, rack and shade.' },
      ],
    },

    /* ---- Full specifications ----
       Each group carries a `note`: one line that says what the numbers mean.
       A figure without one is data, not persuasion. */
    specs: {
      label: 'Specifications',
      heading: 'Every number.',
      columns: ['20E', '20T'],
      groups: [
        {
          group: 'Dimensions',
          note: 'It fits a standard parking space and clears most garage doors — the two measurements that decide whether this is a second vehicle or your only one.',
          rows: [
            ['Exterior length', '20′ 11″', '20′ 11″'],
            ['Exterior width', '6′ 11″', '6′ 11″'],
            ['Exterior height with A/C', '9′ 3″', '9′ 3″'],
            ['Interior height', '6′ 2″', '6′ 2″'],
            ['Awning length', '13′ 0″', '13′ 0″'],
          ],
        },
        {
          group: 'Weights',
          note: 'Under 10,000 lb loaded, so it drives on a standard licence and still tows a small trailer or a boat.',
          rows: [
            ['GVWR', '9,350 lbs', '9,350 lbs'],
            ['GCWR', '12,000 lbs', '12,000 lbs'],
            ['Hitch capacity', '3,500 lbs', '3,500 lbs'],
          ],
        },
        {
          group: 'Capacities',
          note: 'Enough water and fuel for a long weekend without hunting for a hookup. The 20T carries more fresh; the 20E carries more grey.',
          rows: [
            ['Fresh water', '21 gal', '24 gal'],
            ['Grey water', '20 gal', '13 gal'],
            ['Black water', '10 gal', '12 gal'],
            ['Fuel', '24 gal', '24 gal'],
            ['Sleeping capacity', 'Up to 2 (4 with pop-top)', 'Up to 2'],
          ],
        },
        {
          group: 'Chassis & powertrain',
          note: 'A RAM ProMaster service network across North America — this is a van chassis, so any RAM dealer knows it.',
          rows: [
            ['Chassis', 'RAM® ProMaster 3500', 'RAM® ProMaster 3500'],
            ['Engine', '3.6L V6 gas', '3.6L V6 gas'],
            ['Horsepower / torque', '276 hp / 250 lb-ft', '276 hp / 250 lb-ft'],
            ['Transmission', '9-speed automatic', '9-speed automatic'],
            ['Tire size', 'LT225/75R 16E', 'LT225/75R 16E'],
            ['Chassis battery', '12V', '12V'],
          ],
        },
        {
          group: 'Systems',
          note: 'Air conditioning, hot water, heat and 30-amp service, with the generator and inverter covering the nights you are not plugged in.',
          rows: [
            ['Air conditioner', '13,500 BTU', '13,500 BTU'],
            ['Water heater / furnace', 'Truma Combi® G Comfort Plus', 'Truma Combi® G Comfort Plus'],
            ['Generator', '2,800W gas', '2,800W gas'],
            ['House batteries', '(2) 12V AGM', '(2) 12V AGM'],
            ['Inverter', '2,000W', '2,000W'],
            ['Electrical service', '30 amp', '30 amp'],
            ['Solar', '200W or 250W optional', '200W optional'],
          ],
        },
      ],
      footnote: 'Specifications are current at publication and may change without notice. Confirm details with your dealer before purchase.',
    },

    /* ---- CTAs ----
       `visit` leads the closing band: the page's whole job is to get someone
       standing next to the coach. Brochure and compare sit beneath it. */
    visit: {
      label: 'See it in person',
      heading: 'Twenty-one feet is hard to picture.',
      body: 'Photographs flatten a van. Stand in one, swivel the seats, lie on the bed, open the garage — ten minutes at a dealer settles what a week of browsing cannot.',
      cta: { label: 'Find a Dealer', href: 'index.html#dealer-locator' },
      note: 'More than 200 Jayco dealers across North America.',
    },

    brochure: {
      label: 'Brochure',
      heading: 'Take the Swift with you.',
      body: 'The full 2027 Swift brochure — floorplans, standard equipment, option packages and specifications in one PDF.',
      cta: { label: 'Download Brochure', href: '#' },
      /* the CTA's background, not an inset render — a 1600px export of
         jayco-swift-brochure.jpg, whose 8256px original is 74MB */
      image: img('swift-brochure-bg.webp'),
    },

    compare: {
      label: 'Compare',
      heading: 'Not sure it’s the one?',
      body: 'Put the Swift beside the rest of the Class B lineup and see the differences in length, layout, chassis and price side by side.',
      cta: { label: 'Compare Class B Models', href: '#' },
    },

    /* ---- Similar models: pulled from window.JAYCO by slug ---- */
    similar: ['comet', 'terrain'],

    faqs: [
      {
        q: 'Do I need a special licence to drive the Swift?',
        a: 'No. At 20 feet 11 inches on a RAM ProMaster 3500 chassis, the Swift drives on a standard driver’s licence in every US state and Canadian province — and it handles much like a large van.',
      },
      {
        q: 'Will it fit in a standard parking space or my garage?',
        a: 'A standard space, yes — the Swift is under 21 feet long and under 7 feet wide. Garage clearance depends on your door: the coach stands 9′ 3″ with the roof air conditioner, which is taller than most residential garages.',
      },
      {
        q: 'How long can I stay off the grid?',
        a: 'Two 12V AGM house batteries and a 2,000W inverter cover a comfortable night or two of lights, fans, the refrigerator and device charging. Add the 200W or 250W roof solar to stretch that further, and the 2,800W onboard generator will run the air conditioner whenever you need it.',
      },
      {
        q: 'What is the difference between the 20E and the 20T?',
        a: 'The 20E keeps the rear of the coach open as a gear garage with the bed above it, and is the only plan that offers the pop-top. The 20T runs the galley forward with dual twin beds aft that convert to a king, plus the wet bath in the rear corner.',
      },
      {
        q: 'Is there a real bathroom on board?',
        a: 'Yes — a private wet bath with a shower, toilet and sink. The Aqua-View SHOWERMI$TER water management system recirculates water while it heats, so you get more showers out of the fresh tank.',
      },
      {
        q: 'What does the Customer Value Package include, and is it optional?',
        a: 'It is required on every Swift and covers the JRide ride-and-handling package, electric patio awning with LED lighting, Truma Combi G Comfort Plus water heater and furnace, 6-way adjustable cab seats and the 2,000W inverter.',
      },
    ],
  };

  /* ---- Comet: the template's degradation test ----
     A deliberately sparse record — one floorplan, no hotspots, no `fits`, no
     detail items, no pricing, no gallery. Load model.html?model=comet to prove
     every optional section drops cleanly instead of throwing. Replace this
     with the real Comet data when it arrives; do not delete it without
     providing another minimal record in its place. */
  const comet = {
    stub: true,                 /* not real content — never linked to as a model page */
    slug: 'comet',
    name: 'Comet',
    year: 2027,
    category: 'class-b',
    categoryLabel: 'Class B Motorhome',
    priceFrom: 131175,

    hero: {
      poster: img('swift-hero-poster.jpg'),
      heading: 'Comet',
      sub: 'Compact camper van, endless range.',
      ctas: [{ label: 'Find a Dealer', href: 'index.html#dealer-locator', style: 'secondary' }],
    },

    intro: {
      label: 'The Class B Life',
      heading: 'Smaller footprint,<br>same freedom.',
      body: ['Placeholder copy. The Comet record exists to prove the template renders from partial data — every optional section below is absent on purpose.'],
    },

    floorplans: [
      {
        id: '20A',
        name: '20A',
        image: img('floorplan-20e.webp'),
        price: 131175,
        sleeps: 'Up to 2',
        length: '19′ 6″',
        blurb: 'Placeholder floorplan with no hotspots — the plan section falls back to the drawing and its info panel.',
        specs: [['Fresh water', '21 gal']],
        tour360: null,
      },
    ],

    specs: {
      label: 'Specifications',
      heading: 'Every number.',
      columns: ['20A'],
      groups: [{ group: 'Dimensions', rows: [['Exterior length', '19′ 6″']] }],
    },

    faqs: [{ q: 'Is this the real Comet data?', a: 'No — this is a minimal record used to test that the model template degrades cleanly.' }],
  };

  return { swift, comet };
})();
