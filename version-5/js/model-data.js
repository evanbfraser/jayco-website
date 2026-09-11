/* ===================================================
   Jayco — Model Detail data
   ---------------------------------------------------
   One record per model, keyed by slug. model-detail.js
   renders every section from these fields, so a third
   model is close to a data-only change — it needs its
   own kit() below for its asset folder, and nothing
   else unless it brings a section the template has not
   met before.

   TEMPLATE RULES the renderer follows
   • floorplanFilters  → the filter row renders only when a
     model has 4+ floorplans (Swift has 2, so it is skipped;
     Jay Feather has 16, which is what first exercised it).
   • cutaway           → the cutaway band renders only when the
     model supplies one (Swift has no cutaway art).
   • videos            → dropped when absent. Jay Feather's five
     walkthroughs exist but their YouTube ids do not, and a
     guessed id is a dead player, so the section is omitted
     rather than faked.
   • any featureGroup with an empty items[] is skipped.
   • sleeps / length / price are each dropped per floorplan
     when Jayco has not published them.

   DATA PROVENANCE
   • Swift specs, MSRP and floorplan codes are the real
     2027 figures from jayco.com.
   • Photography is Jayco/Entegra studio + lifestyle assets
     supplied for this build (some studio shots are of the
     equivalent MY25 coach, which shares the interior).
   =================================================== */

window.JAYCO_MODEL_DETAIL = (function () {
  'use strict';

  /* Which plans have a Matterport walkthrough is a question the configurator
     asks too, so the ids live in models-data.js — the light library both pages
     load — rather than in this 64KB file. See JAYCO_TOURS there. The guard is
     for the console, not for production: this file is never loaded without the
     library, and a page that managed it would otherwise fail on the first plan
     rather than say why. */
  const TOUR = (slug, planId) => {
    if (!window.JAYCO_TOUR_URL) {
      console.warn('[jayco] models-data.js has not loaded — no floorplan tours.');
      return null;
    }
    return window.JAYCO_TOUR_URL(slug, planId);
  };

  /* ---------- One image kit per model folder ----------
     IMG and WIDE used to be module-level consts, which held while Swift was
     the only record. A second model has its own folder and its own set of
     2000px exports, so the helpers are built per model now.

     `folder` arrives PRE-ENCODED — these names contain spaces, and the path is
     assembled as a plain string rather than run through encodeURI. */
  function kit(folder, wideList) {
    const IMG   = '../assets/model%20details/' + folder + '/web/';
    const WIDE  = wideList || [];
    const img   = (f) => IMG + f;
    const wide  = (f) => IMG + 'wide/' + f;     /* 2000px — full-bleed media */
    const mid   = (f) => IMG + 'mid/' + f;      /* 1100px — contained media */
    const thumb = (f) => IMG + 'thumbs/' + f;   /*  800px — gallery grid */
    return {
      img: img, wide: wide, mid: mid, thumb: thumb,
      /* one filename → every size the page needs (full-size `src` is the
         lightbox). `wide` only resolves for files exported at 2000px — the
         renderer falls back to `src` when a full-bleed slot has no wide
         version, which is what an empty WIDE list relies on. */
      shot: (file, alt) => ({
        src: img(file),
        wide: WIDE.indexOf(file) !== -1 ? wide(file) : img(file),
        mid: mid(file),
        thumb: thumb(file),
        alt: alt,
      }),
      /* Scenery carousel cards. One 1600px export each and the copy that rides
         under it — these never open the lightbox, so no thumb and no wide. */
      card: (file, alt, title, body) => ({ src: img(file), alt: alt, title: title, body: body }),
    };
  }

  /* Swift keeps the bare helper names its record was written against, so the
     540 lines below are untouched and every URL they build is unchanged. */
  const SW = kit('swift', [
    '20251016-0323.jpg', '20251016-3113.jpg', '20251016-3165.jpg', '20251016-3170.jpg',
    '20251016-3200.jpg', '20251016-3274.jpg', '20251016-3424.jpg', '20251016-3439.jpg',
    '20251016-4338.jpg', 'ethos-btf-lagun-table.jpg', 'swift-20y-firefly.jpg',
    'swift-20y-kitchen.jpg', 'swift-20y-wetbath.jpg', 'swift-ext-btf.jpg',
  ]);
  const img = SW.img, shot = SW.shot, card = SW.card;

  /* Jay Feather. The wide list is empty on purpose: shot().wide is only read
     by a non-render intro image and the scenery band's full-bleed slot, and
     this model uses neither, so nothing would ever request a 2000px export. */
  const JF = kit('Jay%20Feather', []);
  const jfImg = JF.img, jfShot = JF.shot, jfCard = JF.card;

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
        { label: 'View Floorplans', href: 'build-price.html?model=swift&step=floorplan', style: 'primary' },
        { label: 'Find a Dealer', href: 'dealers.html', style: 'secondary' },
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

    /* ---- The Layout ----
       `hotspots` IS NO LONGER RENDERED. The section used to put numbered points
       on the drawing, each opening the real photograph of that zone; it now
       shows the drawing alone with an enlarge and a 3D tour beside it. See the
       renderer's note in model-detail.js for why.

       The arrays are left in place rather than deleted: they are authored copy
       and photography that took a shoot to produce, and x/y are measured
       percentages of the 1800×920 drawing export that would have to be measured
       again. Nothing reads them today. */
    plan: {
      label: 'Floorplans',
      heading: 'Twenty-one feet, laid out.',
      body: 'Two ways to arrange the same van. Open either drawing full size, or walk it in 3D.',
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
        tour360: TOUR('swift', '20E'),        /* no scan published — resolves to null */
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
        /* The capture ids all live in models-data.js now — see JAYCO_TOURS
           there for why. The field keeps its 360 name because that is the
           capture format; the button is labelled "3D Tour" per the client's
           wording. */
        tour360: TOUR('swift', '20T'),
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
      /* Two asks, in the order they happen: find the dealer, then see what is
         actually standing on their lot. Inventory is "#" until that page is
         built — renderCtas neutralises the click so it does nothing rather
         than jumping the page to the top. */
      ctas: [
        { label: 'Find a Dealer', href: 'dealers.html', style: 'primary' },
        { label: 'View Inventory', href: '#', style: 'secondary' },
      ],
      note: 'More than 300 Jayco dealers across North America.',
    },

    compare: {
      label: 'Compare',
      heading: 'Not sure it’s the one?',
      body: 'Put the Swift beside the rest of the Class B lineup and see the differences in length, layout, chassis and price side by side.',
      cta: { label: 'Compare Class B Models', href: 'compare.html' },
    },

    /* ---- Resources: earlier years, brochure, manual (renderResources) ----
       The years are the ones jayco.com still gives a page of their own: each
       URL was requested on 2026-09-11 and its <title> read back as that year's
       Swift. 2022 and earlier redirect to the Class B listing instead, so they
       are left out rather than linked to a page that is not the one promised.
       The manual is Jayco's 2027 Class B book — the same PDF manuals-data.js
       lists. No 2027 brochure PDF exists, so the brochure goes through the
       request form, as the brochures page does. */
    resources: {
      years: [2026, 2025, 2024, 2023].map((y) => ({
        year: y, href: 'https://www.jayco.com/rvs/class-b-motorhomes/' + y + '-swift/' })),
      brochure: { href: 'brochures.html?model=swift', open: 'swift' },
      manual: {
        href: 'https://www.jayco.com/uploads/rvs/manuals/656-Jayco-B---Book-MY27.pdf',
        note: 'Jayco’s 2027 Swift owner’s manual, as a PDF.',
      },
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

  /* ---------- 19MRK zones ----------
     UNRENDERED — see the note on `hotspots` in the Swift record above. Seven
     frames of the 19MRK, the only floorplan with its own photography, written
     when the Layout section opened a zone per numbered dot. Kept because the
     copy and the shoot are real; coordinates are percentages of the 1800x920
     drawing export. */
  const JF_19MRK_ZONES = [
    { id: 'front', x: 22, y: 34, eyebrow: 'Sleep',
      title: 'Murphy bed, up',
      body: 'The bed folds flat into the front wall, so the front of the trailer is a sitting room for as long as you want it to be.',
      image: jfShot('jf-19mrk-bed-up.jpg', 'The Jay Feather 19MRK with the Murphy bed folded up into the front wall') },
    { id: 'bed-down', x: 22, y: 62, eyebrow: 'Sleep',
      title: 'Murphy bed, down',
      body: 'Folded down it is a queen, and the theater seating opposite stays where it is.',
      image: jfShot('jf-19mrk-bed-down.jpg', 'The Jay Feather 19MRK with the Murphy bed folded down') },
    { id: 'living', x: 44, y: 30, eyebrow: 'Sit',
      title: 'Front living room',
      body: 'Theater seating faces the folded bed wall. This plan is one of five in the range with a front living room.',
      image: jfShot('jf-19mrk-btf.jpg', 'The Jay Feather 19MRK interior looking from the back toward the front') },
    { id: 'bath', x: 72, y: 62, eyebrow: 'Wash',
      title: 'The bathroom',
      body: 'Skylight over the shower, porcelain foot-flush toilet, roller-style enclosure.',
      image: jfShot('jf-19mrk-bath.jpg', 'The bathroom of a Jay Feather 19MRK') },
    { id: 'entry', x: 58, y: 78, eyebrow: 'Enter',
      title: 'The entry',
      body: 'Wide steps down to the ground, with the galley immediately to hand as you come in.',
      image: jfShot('jf-19mrk-stairs.jpg', 'The entry steps of a Jay Feather 19MRK') },
    { id: 'storage', x: 88, y: 74, eyebrow: 'Pack',
      title: 'Pass-through storage',
      body: 'A hold that runs the full width of the trailer, reachable from either side.',
      stat: 'Both sides',
      image: jfShot('jf-19mrk-pass-thru.jpg', 'The pass-through storage compartment of a Jay Feather 19MRK') },
    { id: 'front-cap', x: 8, y: 20, eyebrow: 'Tow',
      title: 'The front cap',
      body: 'The aerodynamic rounded profile, with steel diamond plating below it taking the stone chips.',
      image: jfShot('jf-19mrk-front-cap.jpg', 'The front cap and diamond plating of a Jay Feather 19MRK') },
  ];

  /* ---------- The 16 floorplans ----------
     DERIVED from build-data.js, not retyped. Every code, sleeps figure,
     length, weight and price delta on this page is therefore the same number
     the builder and the compare page quote, and stays that way when the
     harvest is refreshed. Two plans are deliberately incomplete because Jayco
     has not published the data: 33BH has no price, 21MBH no length. The
     renderer omits the rows rather than printing "undefined" or "$0".

     `blurb` and the 19MRK hotspot copy are the only authored strings, and both
     are written from the plan's own feature flags and measurements. */
  const JF_PLANS = (function () {
    const B = (window.JAYCO_BUILD && window.JAYCO_BUILD['jay-feather']) || {};
    const FEAT = (window.JAYCO_FEATURES && window.JAYCO_FEATURES.plans) || {};
    const plans = B.floorplans || [];
    const BASE = 37493;

    /* One line per plan, written to what its flags and numbers actually say. */
    const BLURBS = {
      '18rbf': 'The shortest one. Rear bath, front queen, and a pass-through hold under the bed.',
      '19mrk': 'A Murphy bed folds into the front wall, so the lounge is a lounge until bedtime.',
      '21mml': 'Front living room with theater seating and a hide-a-bed — two up, comfortably.',
      '21mbh': 'Bunks behind, a bed in front, and an outside kitchen for the middle of the day.',
      '23rk':  'Rear kitchen. The galley gets the back wall and the windows that come with it.',
      '25rb':  'Rear bath and a free-standing table, with an outside kitchen under the awning.',
      '25bh':  'Bunkhouse for eight in under thirty feet.',
      '23mbd': 'Murphy bed and bunks in the same twenty-eight feet — seven sleep here.',
      '24fk':  'Front kitchen, built for two. The largest galley in the shorter half of the range.',
      '27bh':  'Ten berths, an outside kitchen and a fireplace, on a thirty-two foot box.',
      '29bhb': 'Bunks at the back with their own door, and ten places to sleep.',
      '27mk':  'A kitchen island — the only Jay Feather that has one.',
      '26fk':  'Front kitchen, theater seating and washer/dryer prep. The long-stay plan.',
      '30rkb': 'Rear kitchen, outside kitchen and washer/dryer prep at thirty-six feet.',
      '29qbh': 'The longest, and the one that sleeps eleven.',
      '33bh':  'The newest plan in the range — bunkhouse, outside kitchen, and a pantry.',
    };

    /* Matterport walkthroughs, read off jayco.com/rvs/travel-trailers/
       2027-jay-feather/floorplans/ — the "360°" badge on each floorplan card is
       a lightbox onto my.matterport.com/show/?m=<id>. Fourteen of the sixteen
       plans have one; 23RK and 33BH have not been scanned yet, and those two
       simply render without the tour button.

       Keyed by build-data id, and each id was taken from inside its own card's
       anchor rather than by proximity — the two plans with no tour sit between
       plans that have one, so a looser read would have shifted them by one. All
       fourteen were requested and returned 200 (a made-up id returns 400). */

    /* Rows the info panel shows beneath sleeps and length. Read from the
       harvested spec sheet; a plan missing a group simply shows fewer rows. */
    function specRows(p) {
      const s = p.specs || {};
      const w = s.Weights || {}, t = s['Tank Capacities'] || {}, m = s.Miscellaneous || {};
      const out = [];
      const pick = (obj, re) => {
        const hit = Object.keys(obj).filter((k) => re.test(k))[0];
        return hit ? obj[hit] : null;
      };
      const dry = pick(w, /unloaded/i);
      const fresh = pick(t, /fresh/i);
      const grey = pick(t, /gray|grey/i);
      const black = pick(t, /black/i);
      if (dry) out.push(['Unloaded weight', dry + ' lbs']);
      if (fresh) out.push(['Fresh water', Math.round(parseFloat(fresh)) + ' gal']);
      if (grey && black) out.push(['Grey / black', Math.round(parseFloat(grey)) + ' / ' + Math.round(parseFloat(black)) + ' gal']);
      const furn = pick(m, /furnace/i);
      if (furn) out.push(['Furnace', Number(furn).toLocaleString('en-US') + ' BTU']);
      return out;
    }

    return plans.map((p) => ({
      id: p.id,
      name: p.name,
      blurb: BLURBS[p.id] || '',
      /* undefined rather than 0 when Jayco publishes nothing — the renderer
         drops the row on a falsy value. */
      sleeps: p.sleeps ? 'Up to ' + p.sleeps : undefined,
      sleepsMax: p.sleeps || 0,          /* read by the Sleeps 8+ filter */
      length: p.length || undefined,
      /* null stays null: "Pricing to come", never $0. Every one of the fifteen
         published sums here was checked against the MSRP jayco.com prints on
         the floorplans page and matches to the dollar; 33BH is unpriced there
         too. */
      price: p.price == null ? null : BASE + p.price,
      tour360: TOUR('jay-feather', p.id),
      image: jfImg('floorplan-' + p.id + '.webp'),
      specs: specRows(p),
      tags: FEAT['jay-feather__' + p.id] || [],
      hotspots: p.id === '19mrk' ? JF_19MRK_ZONES : undefined,
    }));
  }());

  /* ===================================================
     Jay Feather — the template's second real model, and
     the first that exercises it properly: 16 floorplans
     against Swift's 2, a cutaway band Swift does not
     have, and two plans whose data Jayco has not
     finished publishing.

     PROVENANCE. Every number here is read from the repo
     or quoted from jayco.com/rvs/travel-trailers/
     2027-jay-feather/. Floorplan codes, sleeps, lengths,
     weights, tank capacities and package prices come
     from build-data.js, which was harvested from Jayco's
     own configurator. Nothing is estimated.
     =================================================== */
  const jayFeather = {
    slug: 'jay-feather',
    name: 'Jay Feather',
    year: 2027,
    category: 'travel-trailers',
    categoryLabel: 'Travel Trailer',
    priceFrom: 37493,

    hero: {
      /* ?v= on the media itself, not just on the scripts. The filename is
         stable because it names the role, so replacing the footage leaves the
         URL identical and anyone who has already loaded the page keeps the old
         cut from cache. Bump this when the source video is replaced.
         v2 = the 24-second cut supplied 2026-08-04. */
      video:  jfImg('jf-hero.mp4') + '?v=2',
      poster: jfImg('jf-hero-poster.jpg') + '?v=2',
      heading: 'Jay Feather',
      sub: 'Sixteen floorplans on a half-ton hitch — from a 23-foot couple’s coach to a 36-foot bunkhouse that sleeps eleven.',
      ctas: [
        { label: 'View Floorplans', href: 'build-price.html?model=jay-feather&step=floorplan', style: 'primary' },
        { label: 'Find a Dealer', href: 'dealers.html', style: 'secondary' },
      ],
    },

    intro: {
      label: 'The Jay Feather Life',
      heading: 'One hitch,<br>sixteen answers.',
      body: [
        'Every Jay Feather tows behind a half-ton pickup and every one of them has a slide-out. What changes across the range is what you do with the floor: a rear kitchen, a Murphy bed that folds into the front wall, a bunkhouse with beds stacked three deep.',
        'The lightest sits at 4,655 lbs unloaded and 23 feet on the ball. The longest runs 36 feet and sleeps eleven. Both start from the same construction — the same Magnum Truss™ roof, the same Stronghold VBL™ floor, the same American-made Norco® Z-frame underneath.',
      ],
      image: {
        src: jfImg('jf-render.webp'),
        alt: '2027 Jayco Jay Feather travel trailer, three-quarter front view',
        type: 'render',
        w: 1600, h: 1056,
        /* Cropped to the render's own alpha bounding box on export, so the ink
           is centred by construction rather than by eye. Nudge only if the
           crease reads off against the A-frame, which hangs below the body. */
        inkCentre: 0.5,
      },
    },

    /* Exactly six — .md-stats is repeat(6, 1fr) with nth-child(3n+1) corrections
       at 1280 and 768. All six are read from build-data.js/models-data.js. */
    highlights: [
      { value: 'Up to 11', label: 'Sleeps',      note: '29QBH, the longest plan' },
      { value: '23–36 ft', label: 'Length',      note: '16 floorplans' },
      { value: '4,655 lbs', label: 'Lightest',   note: '18RBF unloaded' },
      { value: '55 gal',   label: 'Fresh water', note: 'Every floorplan' },
      { value: '13,500 BTU', label: 'Air conditioner', note: 'Coleman® Mach Quiet Series' },
      { value: 'Tankless', label: 'Water heater', note: '60,000 BTU, on demand' },
    ],

    scenery: {
      heading: 'Where it ends up.',
      image: {
        src: jfImg('jf-scenery.jpg'),
        alt: 'A Jayco Jay Feather set up at a forest campsite with chairs and a picnic table',
      },
      items: [
        jfCard('jf-21mb-btf.jpg', 'The Jay Feather interior looking from the back toward the front',
          'Back to front', 'The slide-out opens the main floor once you have parked, so the walkway is not the whole room.'),
        jfCard('jf-21mb-ftb.jpg', 'The Jay Feather interior looking from the front toward the back',
          'Front to back', 'Seamless countertops, handcrafted hardwood door and drawer fronts, residential vinyl floor.'),
        jfCard('jf-kitchen.jpg', 'The galley of a Jayco Jay Feather with the InVision appliance package',
          'The galley', 'The InVision™ Suite brings an 11 cubic-foot 12V refrigerator with a black glass, two-door front.'),
        jfCard('jf-29bhb-sink.jpg', 'A stainless steel sink in a Jayco Jay Feather kitchen',
          'Stainless sink', 'Standard in the Jay Sport Package; the Premier Package upgrades it to a multi-function sink.'),
        jfCard('jf-21mb-bath.jpg', 'The bathroom of a Jayco Jay Feather with a skylight over the shower',
          'The bathroom', 'A skylight over the shower, a porcelain foot-flush toilet and a roller-style enclosure.'),
        jfCard('jf-29bhb-fan.jpg', 'A powered roof vent fan in a Jayco Jay Feather',
          'Moving the air', 'Fourteen-inch power roof vents in the living room and the bathroom.'),
      ],
    },

    plan: {
      label: 'Floorplans',
      /* No <br> — only intro.heading is rendered raw; every other heading
         goes through esc(), so a tag here prints as text. */
      heading: 'Sixteen ways to lay it out.',
      body: 'Pick a floorplan to see its drawing and its real numbers. Open the drawing full size, or walk the plan in 3D.',
    },

    /* First real use of the filter row anywhere: it renders only for a model
       with 4+ floorplans, and Swift has 2. Tags come from floorplan-features.js
       rather than being retyped, and the whole array collapses to [] if that
       script has not loaded — a dropped filter row beats chips that match
       nothing. Counts in the comments are as harvested. */
    floorplanFilters: (function () {
      const F = (window.JAYCO_FEATURES && window.JAYCO_FEATURES.plans) || null;
      if (!F) return [];
      const L = window.JAYCO_FEATURES.labels || {};
      const has = (id, tag) => (F['jay-feather__' + id] || []).indexOf(tag) !== -1;
      return [
        { id: 'bunkhouse',    label: L.bunkhouse    || 'Bunkhouse',    match: (p) => has(p.id, 'bunkhouse') },       /* 6 */
        { id: 'outside_kitchen', label: L.outside_kitchen || 'Outside kitchen', match: (p) => has(p.id, 'outside_kitchen') }, /* 7 */
        { id: 'fireplace',    label: L.fireplace    || 'Fireplace',    match: (p) => has(p.id, 'fireplace') },       /* 9 */
        { id: 'couples',      label: L.couples_coach || "Couple's coach", match: (p) => has(p.id, 'couples_coach') }, /* 9 */
        { id: 'sleeps8',      label: 'Sleeps 8+',   match: (p) => (p.sleepsMax || 0) >= 8 },                          /* 4 */
      ];
    }()),

    floorplans: JF_PLANS,

    features: {
      label: 'Features',
      heading: 'What comes with it.',
    },

    /* ---------- The construction cutaway ----------
       Below the features, per the section it illustrates.

       THE EIGHT TITLES ARE JAYCO'S, VERBATIM, from the "Superior Construction
       Elements" band on jayco.com/rvs/travel-trailers/2027-jay-feather/. Their
       page publishes NO description under any of them and their construction
       pages 404, so there is no `body` here — a named system on a diagram is
       the whole callout. The renderer treats `body` as optional precisely so
       approved copy can drop in later as data, without touching code.

       ORDER IS JAYCO'S 1-8. The array index drives the visible numeral, the
       tab/panel pairing and the screen-reader order, so REORDERING THIS ARRAY
       RENUMBERS THE DIAGRAM.

       x/y are percentages of the 1636x838 export. The art's ink reaches all
       four edges, so they map onto the image with no padding correction —
       provided .md-cutaway-stage stays padding-free, which its CSS comment
       spells out. */
    cutaway: {
      label: 'Superior construction',
      heading: 'What is under the skin.',
      body: 'The same frame, floor, walls and roof under all sixteen floorplans. Tap a number to see what each one is.',
      image: {
        src: jfImg('jf-cutaway.webp'),
        mid: jfImg('mid/jf-cutaway.webp'),
        alt: '2027 Jayco Jay Feather construction cutaway, with the roof and sidewall opened to show the structure',
        w: 1636, h: 838,
      },
      pins: [
        { x: 5,  y: 10,   title: 'Rear marker observation camera prep' },
        { x: 57, y: 24,   title: 'Magnum Truss™ roof system' },
        { x: 56, y: 62,   title: '2 in. Stronghold VBL™ floor with 2 lb. density foam' },
        { x: 33, y: 40,   title: 'Stronghold VBL™ sidewalls with interior and exterior Azdel®' },
        { x: 77, y: 47.5, title: 'Aluminum framed front wall structure' },
        { x: 84, y: 82,   title: 'Front steel diamond plating' },
        { x: 52, y: 13,   title: 'Coleman® Mach Quiet Series A/C' },
        { x: 95, y: 85,   title: 'American-made Norco® Z-frame with integrated A-frame' },
      ],
    },


    featureGroups: [
      {
        id: 'living',
        name: 'Kitchen & living',
        items: [
          { title: 'Seamless countertops',
            body: 'No seam to catch crumbs, over a stainless steel sink. The Premier Package upgrades both to solid-surface and a multi-function sink.' },
          { title: 'The InVision™ Suite',
            body: 'An 11 cubic-foot 12V refrigerator with a black glass, two-door front — part of the mandatory Jay Sport Package.' },
          { title: 'A residential bed',
            body: 'Sixty by eighty inches as standard. Select floorplans take a 72 by 80 king for $293.' },
          { title: 'Handcrafted hardwood',
            body: 'Door and drawer fronts are hardwood, on plywood furniture bases rather than particleboard.' },
          { title: 'Floors and cushions',
            body: 'Residential vinyl flooring and high-density dinette cushions — the two surfaces that wear first.' },
          { title: 'Power where you sit',
            body: 'LED lighting throughout, with USB charging points through the living area.' },
        ],
      },
      {
        id: 'bath',
        name: 'Bath',
        items: [
          { title: 'A skylight over the shower',
            body: 'Daylight in the one room that usually has none, and the headroom that comes with it.' },
          { title: 'Porcelain, not plastic',
            body: 'A porcelain foot-flush toilet with a soft-close seat.' },
          { title: 'Roller-style enclosure',
            body: 'The shower closes with a roller door rather than a curtain that clings.' },
          { title: 'Fourteen-inch vent',
            body: 'A power roof vent in the bathroom, and a second in the living room.' },
        ],
      },
      {
        id: 'climate',
        name: 'Climate & power',
        items: [
          { title: '13,500 BTU Coleman® Mach',
            body: 'The Quiet Series unit — Jayco rates it more efficient and 10% quieter than other brands.' },
          { title: 'Climate Shield™',
            body: 'Jayco tests the package from 0 to 100 degrees Fahrenheit. It arrives with the Jay Sport Package.' },
          { title: 'Radiant-barrier insulation',
            body: 'Backed roller shades and a radiant barrier, so the coach sheds heat before the air conditioner has to.' },
          { title: 'Solar as standard',
            body: 'An Overlander 200W panel with a 30-amp controller. The Overlander II package doubles it.' },
          { title: 'Auto-ignition furnace',
            body: 'Twenty thousand BTU on the shortest plans, thirty-five thousand on the longest.' },
        ],
      },
      {
        id: 'water',
        name: 'Water',
        items: [
          { title: 'Tankless, on demand',
            body: 'A 60,000 BTU on-demand water heater — hot water for as long as the fresh tank lasts.' },
          { title: 'Fifty-five gallons',
            body: 'The same fresh water capacity on all sixteen floorplans, from the 23-footer to the 36.' },
          { title: 'NuvoH2O prep',
            body: 'Plumbed for the filtration system, which drops in without cutting into the lines.' },
        ],
      },
    ],

    /* Three of sixteen. The mobile switcher slices to three columns and the CSS
       only defines is-col-0/1/2, so this is a hard ceiling rather than a choice
       about what fits — smallest, middle and largest, with the rest a click away
       in Build & Price. */
    specs: {
      label: 'Specifications',
      heading: 'Every number.',
      columns: ['18RBF', '25BH', '29QBH'],
      groups: [
        {
          group: 'Dimensions',
          note: 'Three of the sixteen floorplans — the shortest, one in the middle and the longest. Every plan’s full sheet is in Build & Price.',
          rows: [
            ['Exterior length (overall)', '23′ 1″', '29′ 8″', '36′ 1″'],
            ['Exterior width', '8′ 0″', '8′ 0″', '8′ 0″'],
            ['Exterior width with slides out', '11′ 0″', '10′ 11″', '10′ 11″'],
            ['Exterior height with A/C', '10′ 9″', '10′ 9″', '11′ 2″'],
            ['Interior height', '6′ 6″', '6′ 6″', '6′ 9″'],
            ['Awning length', '14′ 0″', '21′ 0″', '20′ 0″'],
          ],
        },
        {
          group: 'Weights',
          note: 'Unloaded vehicle weight is what leaves the factory; cargo capacity is what you may add to it.',
          rows: [
            ['Unloaded vehicle weight', '4,655 lbs', '6,015 lbs', '7,335 lbs'],
            ['Cargo carrying capacity', '1,545 lbs', '1,585 lbs', '1,660 lbs'],
            ['Gross vehicle weight rating', '6,200 lbs', '7,600 lbs', '8,995 lbs'],
            ['Dry hitch weight', '490 lbs', '665 lbs', '835 lbs'],
          ],
        },
        {
          group: 'Tanks',
          rows: [
            ['Fresh water', '55 gal', '55 gal', '55 gal'],
            ['Grey water', '38 gal', '76 gal', '60 gal'],
            ['Black water', '38 gal', '38 gal', '30 gal'],
            ['Propane', '40 lbs', '40 lbs', '40 lbs'],
          ],
        },
        {
          group: 'Systems',
          rows: [
            ['Sleeps', 'Up to 4', 'Up to 8', 'Up to 11'],
            ['Water heater', 'Tankless', 'Tankless', 'Tankless'],
            ['Furnace', '20,000 BTU', '35,000 BTU', '35,000 BTU'],
            ['Outside storage compartments', '2', '3', '3'],
            ['Tire size', 'ST205/75R14 “D”', 'ST205/75R14 “D”', 'ST225/75R15 “E”'],
          ],
        },
      ],
    },

    visit: {
      label: 'See it in person',
      heading: 'Sixteen floorplans is a lot to picture.',
      body: 'A drawing tells you where the bed goes. It does not tell you whether you can pass someone in the galley, or how the bunk room feels with the door shut. Twenty minutes at a dealer settles both.',
      /* Two asks, in the order they happen: find the dealer, then see what is
         actually standing on their lot. Inventory is "#" until that page is
         built — renderCtas neutralises the click so it does nothing rather
         than jumping the page to the top. */
      ctas: [
        { label: 'Find a Dealer', href: 'dealers.html', style: 'primary' },
        { label: 'View Inventory', href: '#', style: 'secondary' },
      ],
      note: 'More than 300 Jayco dealers across North America.',
    },

    compare: {
      label: 'Compare',
      heading: 'Not sure it’s the one?',
      body: 'Put the Jay Feather beside the rest of the travel trailer lineup and compare length, weight, layout and price side by side.',
      cta: { label: 'Compare travel trailers', href: 'compare.html' },
    },

    /* Resources — the same rules as Swift's. 2023–2026 each have their own
       jayco.com page (checked 2026-09-11, titles read back); 2022 and earlier
       redirect to the travel trailer listing or 404, so they are left out. The
       manual is Jayco's single 2027 towable book, which covers every trailer. */
    resources: {
      years: [2026, 2025, 2024, 2023].map((y) => ({
        year: y, href: 'https://www.jayco.com/rvs/travel-trailers/' + y + '-jay-feather/' })),
      brochure: { href: 'brochures.html?model=jay-feather', open: 'jay-feather' },
      manual: {
        href: 'https://www.jayco.com/uploads/rvs/manuals/659-Towable-Manual---Book-2027.pdf',
        note: 'Jayco’s 2027 Jay Feather owner’s manual, as a PDF.',
      },
    },

    similar: ['jay-feather-air', 'jay-feather-sl', 'jay-flight'],

    faqs: [
      { q: 'What do I need to tow a Jay Feather?',
        a: 'A half-ton pickup covers the range. Unloaded weights run from 4,655 lbs on the 18RBF to 7,335 lbs on the 29QBH, with gross ratings from 6,200 to 8,995 lbs — check your vehicle’s tow rating against the gross figure for the floorplan you want, not the unloaded one.' },
      { q: 'Which packages are mandatory?',
        a: 'Two. The Customer Value Package at $6,000 and the Jay Sport Package at $4,500 are both required on every Jay Feather, so the real starting figure is those on top of the $37,493 base. The Premier Package at $2,243 is optional.' },
      { q: 'Can I get a king bed?',
        a: 'On select floorplans, yes. The standard residential bed is 60 x 80 inches; the king option takes it to 72 x 80 for $293. Build & Price shows which floorplans allow it.' },
      { q: 'What is Climate Shield™?',
        a: 'Jayco’s insulation package, tested from 0 to 100 degrees Fahrenheit. It comes with the Jay Sport Package, alongside radiant-barrier insulation and dual 12V vent fans.' },
      { q: 'Why is the 33BH not priced?',
        a: 'It is too new for Jayco to have published pricing. The floorplan and its drawing are final; your dealer can quote it.' },
    ],
  };

  /* ===================================================
     Greyhawk — the first Class C, and the first
     motorhome to carry a construction cutaway (Swift
     has none). Motorized, so it keeps the "Every
     number." specs table that towables drop, and its
     carousel arrows ride on the intro line.

     PROVENANCE. Copy, the eight construction elements
     (titles, descriptions and pin positions), the video
     ids and the standard-feature list are read from
     jayco.com/rvs/class-c-motorhomes/2027-greyhawk/ on
     2026-09-11. Floorplan codes, sleeps, lengths, tanks,
     ratings and price deltas come from build-data.js.
     The 27U's Matterport id is from its own floorplan
     page — the other three pages carry no tour.
     Photography and the hero film were supplied for
     this build, in assets/model details/Greyhawk.
     =================================================== */
  const GH = kit('Greyhawk', []);
  const ghImg = GH.img, ghCard = GH.card;

  /* ---------- The four floorplans ----------
     DERIVED from build-data.js, as Jay Feather's are, so every figure matches
     the builder and the compare page. The drawings are the builder's own
     exports (p.img) — the same files, so no second copy to drift.

     30Z-CSA is left out: it is the Canadian-standards build of the 30Z, with
     the same drawing and the same numbers, and jayco.com lists four layouts.
     A motorhome publishes ratings, not an unloaded weight, so the rows under
     each plan are GVWR, tanks, outside storage and awning instead. */
  const GH_PLANS = (function () {
    const B = (window.JAYCO_BUILD && window.JAYCO_BUILD.greyhawk) || {};
    const FEAT = (window.JAYCO_FEATURES && window.JAYCO_FEATURES.plans) || {};
    const plans = (B.floorplans || []).filter((p) => p.id !== '30z-csa');
    const BASE = 172793;

    /* One line per plan, written to its own feature flags and spec sheet. */
    const BLURBS = {
      '27u':  'The shortest, and the only Greyhawk with a king — plus a front living room with a hide-a-bed.',
      '29mv': 'A couple’s coach at 32 feet, with a booth dinette and theater seating.',
      '31f':  'The family plan: bunks rated for 300 lbs each, and room for seven.',
      '30z':  'Front living room, an electric fireplace and 95 cu. ft. of outside storage — the most in the range.',
    };

    function specRows(p) {
      const s = p.specs || {};
      const w = s.Weights || {}, t = s['Tank Capacities'] || {};
      const m = s.Miscellaneous || {}, me = s.Measurements || {};
      const pick = (obj, re) => {
        const hit = Object.keys(obj).filter((k) => re.test(k))[0];
        return hit ? obj[hit] : null;
      };
      const out = [];
      const gvwr = pick(w, /gross vehicle/i);
      const fresh = pick(t, /fresh/i);
      const grey = pick(t, /gray|grey/i);
      const black = pick(t, /black/i);
      const cargo = pick(m, /cargo/i);
      const awning = pick(me, /awning/i);
      if (gvwr) out.push(['GVWR', gvwr + ' lbs']);
      if (fresh) out.push(['Fresh water', Math.round(parseFloat(fresh)) + ' gal']);
      if (grey && black) out.push(['Grey / black', Math.round(parseFloat(grey)) + ' / ' + Math.round(parseFloat(black)) + ' gal']);
      if (cargo) out.push(['Outside storage', cargo + ' cu. ft.']);
      if (awning) out.push(['Awning', awning]);
      return out;
    }

    return plans.map((p) => ({
      id: p.id,
      name: p.name,
      blurb: BLURBS[p.id] || '',
      sleeps: p.sleeps ? 'Up to ' + p.sleeps : undefined,
      sleepsMax: p.sleeps || 0,
      length: p.length || undefined,
      price: p.price == null ? null : BASE + p.price,
      tour360: TOUR('greyhawk', p.id),
      image: p.img,
      specs: specRows(p),
      tags: FEAT['greyhawk__' + p.id] || [],
    }));
  }());

  const greyhawk = {
    slug: 'greyhawk',
    name: 'Greyhawk',
    year: 2027,
    category: 'class-c',
    categoryLabel: 'Class C Motorhome',
    priceFrom: 172793,

    hero: {
      video:  ghImg('gh-hero.mp4'),
      poster: ghImg('gh-hero-poster.jpg'),
      heading: 'Greyhawk',
      sub: 'Jayco’s top-of-the-line gas Class C — a Ford® E-450 underneath, a seamless one-piece cap up front, and room for up to seven.',
      ctas: [
        { label: 'View Floorplans', href: 'build-price.html?model=greyhawk&step=floorplan', style: 'primary' },
        { label: 'Find a Dealer', href: 'dealers.html', style: 'secondary' },
      ],
    },

    intro: {
      label: 'The Class C Life',
      heading: 'All the coach,<br>none of the hitch.',
      body: [
        'The Greyhawk drives on a Ford® E-450 with a 7.3L V8, and the JRide® Plus package underneath — Koni® FSD shocks, stabilizer bars front and rear, Hellwig® helper springs — keeps it settled on the highway and on the way into camp.',
        'Off the grid it looks after itself: a 4,000W generator that starts on its own when the batteries need it, 200W of roof solar and a 1,000W inverter. Inside, a walk-around queen (a king in the 27U), a legless dinette that turns into a bed, and seat belts at every seat.',
      ],
      image: {
        src: ghImg('gh-render.webp'),
        alt: '2027 Jayco Greyhawk 30Z Class C motorhome, three-quarter front view',
        type: 'render',
        w: 1600, h: 859,
        /* Cropped to the render's own alpha bounding box on export, as Jay
           Feather's was, so the ink is centred by construction. */
        inkCentre: 0.5,
      },
    },

    /* Exactly six — .md-stats is repeat(6, 1fr). Every figure is Jayco's, from
       the standard-feature list or build-data.js. */
    highlights: [
      { value: 'Up to 7',    label: 'Sleeps',        note: '31F, with bunks' },
      { value: '30–33 ft',   label: 'Length',        note: '29′ 11″ to 32′ 6″ overall' },
      { value: '7.3L V8',    label: 'Engine',        note: '325 hp, 450 lb-ft' },
      { value: '4,000W',     label: 'Generator',     note: 'Auto-gen start' },
      { value: '15,000 BTU', label: 'Air conditioner', note: 'With heat pump' },
      { value: '750 lbs',    label: 'Overhead bunk', note: '300 over industry standard' },
    ],

    scenery: {
      heading: 'Where it takes you.',
      image: {
        src: ghImg('gh-ext-03045.jpg'),
        alt: 'Two people standing beside a Jayco Greyhawk with its awning out at a pine forest campsite',
      },
      items: [
        ghCard('gh-27u-btf.jpg', 'The Greyhawk 27U interior looking from the back toward the cab',
          'Back to front', 'Galley down one side, sofa and dinette down the other, and the cab at the far end.'),
        ghCard('gh-kitchen.jpg', 'The galley of a Jayco Greyhawk',
          'The galley', 'An all-in-one cooktop and oven, a residential-size microwave and a recessed stainless sink with a cutting-board cover.'),
        ghCard('gh-29mv-seating.jpg', 'Theater seating in a Jayco Greyhawk 29MV',
          'Theater seating', 'Power theater seating is on the option list in place of the sofa.'),
        ghCard('gh-27u-bed.jpg', 'The bedroom of a Jayco Greyhawk 27U',
          'The bedroom', 'The 27U carries a king; the others a walk-around queen. Wireless charging pads sit in the nightstands.'),
        ghCard('gh-29mv-bath-shower.jpg', 'The bathroom and shower of a Jayco Greyhawk 29MV',
          'The shower', 'Glass door, skylight overhead, and the Aqua View® SHOWERMI$ER™ saving the water that runs while it heats.'),
        ghCard('gh-29mv-bunk.jpg', 'The overhead bunk above the cab of a Jayco Greyhawk',
          'Over the cab', 'The overhead bunk is rated for 750 lbs — two full-sized adults, or the gear.'),
        ghCard('gh-29mv-dash.jpg', 'The cab and dashboard of a Jayco Greyhawk',
          'The cab', 'Sony® infotainment with Apple® CarPlay and Android Auto™, and backup and side-view cameras.'),
      ],
    },

    plan: {
      label: 'Floorplans',
      heading: 'Four ways to lay it out.',
      body: 'Scroll through the four floorplans to see each drawing and its real numbers. Open any drawing full size, or walk the 27U in 3D.',
    },

    /* No floorplanFilters: four plans read at a glance on the rail, and a chip
       row over four slides would be more control than content. */
    floorplans: GH_PLANS,

    features: {
      label: 'Features',
      heading: 'What comes with it.',
    },

    /* ---------- The construction cutaway ----------
       Jayco's own "Superior Construction Elements" band, verbatim: the eight
       titles and descriptions, in their 1-8 order, and the pin positions from
       their markup (left/top percentages of this same 1920x1080 art). The art
       is shared with the Redhawk on jayco.com. It is NOT cropped to its ink —
       Jayco's percentages are measured against the full frame, so cropping
       would move every pin. REORDERING THIS ARRAY RENUMBERS THE DIAGRAM. */
    cutaway: {
      label: 'Superior construction',
      heading: 'What is under the skin.',
      body: 'Eight things Jayco builds into every Greyhawk. Tap a number to read about each one.',
      image: {
        src: ghImg('gh-cutaway.webp'),
        mid: ghImg('mid/gh-cutaway.webp'),
        alt: '2027 Jayco Greyhawk construction cutaway, with the sidewall opened to show the structure',
        w: 1920, h: 1080,
      },
      pins: [
        { x: 80, y: 77, title: 'The JRide® Plus ride and handling package',
          body: 'A quiet, comfortable drive from a computer-balanced driveshaft, Koni® FSD shocks, a heavy-duty rear stabilizer bar, a front stabilizer bar, Hellwig® helper springs and rubber isolation mounts.' },
        { x: 25, y: 39, title: 'StrongholdVBL® roof, floor and sidewalls',
          body: 'A vacuum-bond process presses the wall layers — fiberglass siding, welded aluminum framing, block foam, metal backers and interior panels — at 144 tons for 16 to 18 minutes. Jayco builds every wall, floor and roof in a temperature- and humidity-controlled plant.' },
        { x: 83, y: 28, title: 'One-piece seamless front cap with panoramic window',
          body: 'The seamless cap resists fading and moisture damage over the years, and an automotive-bonded panoramic window with a power shade lets the daylight in.' },
        { x: 13, y: 20, title: 'One-piece fiberglass roof',
          body: 'A crowned, one-piece fiberglass roof for durability.' },
        { x: 65, y: 37, title: '750 lb. overhead bunk rating',
          body: 'Three hundred pounds over the industry standard — enough for two full-sized adults, or extra gear on the road.' },
        { x: 26, y: 20, title: 'Standard solar power',
          body: 'A 200W panel with a dual controller that charges the house and chassis batteries at the same time.' },
        { x: 43, y: 41, title: 'Frameless windows',
          body: 'Easier to keep clean outside, and a sleeker line down the side of the coach.' },
        { x: 36, y: 47, title: 'Seatbelts in all designated seating positions',
          body: 'Stress-tested belts at every designated seat, so the whole family rides belted.' },
      ],
    },

    featureGroups: [
      {
        id: 'driving',
        name: 'Chassis & driving',
        items: [
          { title: 'Ford® E-450 chassis',
            body: 'A 7.3L V8 making 325 hp and 450 lb-ft, through a six-speed TorqShift® transmission with overdrive.' },
          { title: 'JRide® Plus',
            body: 'Koni® FSD shocks, stabilizer bars front and rear, Hellwig® helper springs and a computer-balanced driveshaft — in the mandatory Customer Value Package.' },
          { title: 'Automatic leveling',
            body: 'Hydraulic jacks level the coach at the campsite, also part of the Customer Value Package.' },
          { title: 'Driver assistance',
            body: 'Automatic emergency braking, electronic stability and traction control, and hill start assist.' },
          { title: 'Cameras',
            body: 'Backup and side-view cameras, with remote-controlled, heated side mirrors.' },
          { title: 'Tows too',
            body: 'A 7,500 lb. hitch with a 750 lb. tongue capacity and a 7-pin plug.' },
        ],
      },
      {
        id: 'living',
        name: 'Kitchen & living',
        items: [
          { title: 'The legless dinette',
            body: 'A Jayco-exclusive table that converts from dining to sleeping and stays solid either way, with car seat tethers on select floorplans.' },
          { title: 'Hardwood, soft-close',
            body: 'Hardwood cabinet doors and drawer fronts on soft-close hinges and ball-bearing guides.' },
          { title: 'The galley',
            body: 'A 10.6 cu. ft. 12V refrigerator, an all-in-one cooktop and oven, and a residential-size microwave.' },
          { title: 'Sony® infotainment',
            body: 'Tilt and swivel, with Apple® CarPlay and Android Auto™ — plus an LED HD Smart TV in the living area.' },
          { title: 'BMPRO coach control',
            body: 'Tanks, batteries and systems on one wall-mounted touchscreen, and in a mobile app.' },
          { title: 'Seven feet inside',
            body: 'An 84-inch ceiling with recessed LED lighting and blackout night roller shades.' },
        ],
      },
      {
        id: 'sleep',
        name: 'Sleep & bath',
        items: [
          { title: 'Walk-around bed',
            body: 'A queen with nightstands on three plans and a king on the 27U, with USB ports and wireless charging in the nightstands.' },
          { title: 'A 750 lb. overhead bunk',
            body: 'Three hundred pounds over the industry standard, with a safety net.' },
          { title: 'Bunks on the 31F',
            body: 'Rated for an industry-exclusive 300 lbs each.' },
          { title: 'A proper shower',
            body: 'Glass door, decorative surround, a skylight and its own light.' },
          { title: 'SHOWERMI$ER™',
            body: 'Aqua View®’s water management system catches the water that runs while the shower heats.' },
        ],
      },
      {
        id: 'power',
        name: 'Power & climate',
        items: [
          { title: '4,000W generator',
            body: 'Auto-gen start, drawing from the fuel tank, so power is there when the batteries need it.' },
          { title: '200W solar',
            body: 'A dual controller and a second house battery, charging house and chassis together.' },
          { title: '1,000W inverter',
            body: 'Household outlets from the batteries, without the generator running.' },
          { title: '15,000 BTU A/C',
            body: 'With a heat pump as standard; dual 13,500 BTU units with power management are an option.' },
          { title: 'Heat and hot water',
            body: 'A 30,000 BTU auto-ignition furnace and a Suburban tankless water heater.' },
          { title: 'Heated tanks',
            body: '12V pads on the holding tanks, for shoulder-season camping.' },
        ],
      },
      {
        id: 'outside',
        name: 'Outside',
        items: [
          { title: 'Seamless front cap',
            body: 'One piece of fiberglass, with an automotive-bonded panoramic window and a power shade.' },
          { title: 'Crowned fiberglass roof',
            body: 'One piece, seamless, over StrongholdVBL™ construction.' },
          { title: 'Frameless windows',
            body: 'A cleaner line down the side, and less to maintain.' },
          { title: 'Electric awning',
            body: 'A power patio awning with LED lights, in the Customer Value Package.' },
          { title: 'Storage that hoses clean',
            body: 'Large rotocast compartments with lockable slam latches.' },
          { title: 'Connected',
            body: 'A Winegard 2.0 Wi-Fi/4G antenna, satellite prep and an outside shower.' },
        ],
      },
    ],

    videos: {
      label: 'Videos',
      heading: 'The walkthrough, and nine features.',
      /* Jayco's own "Greyhawk Videos" gallery, in its order. */
      items: [
        { id: 'Qqj5iuq4fr8', title: 'Full walkthrough',   note: 'The 2027 Greyhawk, end to end.' },
        { id: 'OeVeMgaoRIU', title: 'JRide®',             note: 'Ride and handling package.' },
        { id: 'o2A1jffHjUk', title: 'Leveling system',    note: 'Automatic hydraulic jacks.' },
        { id: 'Q-A_KGx3qzQ', title: 'BMPRO',              note: 'The whole coach, one screen.' },
        { id: 'Mopd4FXlOw4', title: 'Frameless windows',  note: 'Sleeker, and easier to clean.' },
        { id: '46AexFE9QOE', title: '200W solar',         note: 'House and chassis, charged together.' },
        { id: 'hJvDS4RDvHM', title: '15,000 BTU A/C',     note: 'Cooling, with a heat pump.' },
        { id: 'uZv5DX1C9bQ', title: 'Seamless front cap', note: 'One piece, nothing to seal.' },
        { id: 'D4lHWqWd3Ac', title: 'Exclusive dinette',  note: 'The legless table.' },
        { id: 'tUEEbK3uXX4', title: 'Sony® infotainment', note: 'CarPlay and Android Auto.' },
      ],
    },

    /* Three of four — the CSS only defines three columns. The shortest, the
       one with the most outside storage, and the one that sleeps seven. All
       figures from build-data.js except the fuel tank, which the 31F's sheet
       omits and Jayco's standard-feature list gives as 55 gal. on every plan. */
    specs: {
      label: 'Specifications',
      heading: 'Every number.',
      columns: ['27U', '30Z', '31F'],
      groups: [
        {
          group: 'Dimensions',
          note: 'Three of the four floorplans. The 29MV matches the 30Z’s length and height; its full sheet is in Build & Price.',
          rows: [
            ['Exterior length (overall)', '29′ 11″', '32′ 6″', '32′ 6″'],
            ['Exterior width', '8′ 4″', '8′ 4″', '8′ 4″'],
            ['Exterior width with slides out', '10′ 4″', '10′ 2″', '9′ 10″'],
            ['Exterior height with A/C', '11′ 8″', '11′ 8″', '11′ 8″'],
            ['Interior height', '7′ 0″', '7′ 0″', '7′ 0″'],
            ['Awning length', '18′ 0″', '18′ 0″', '18′ 0″'],
          ],
        },
        {
          group: 'Ratings',
          note: 'A motorhome publishes ratings rather than an unloaded weight: GVWR is the most the coach may weigh loaded, GCWR the most with a vehicle in tow.',
          rows: [
            ['Gross vehicle weight rating', '14,500 lbs', '14,500 lbs', '14,500 lbs'],
            ['Gross combined weight rating', '22,000 lbs', '22,000 lbs', '22,000 lbs'],
            ['Hitch rating', '7,500 lbs', '7,500 lbs', '7,500 lbs'],
          ],
        },
        {
          group: 'Tanks',
          rows: [
            ['Fresh water', '42 gal', '43 gal', '47 gal'],
            ['Grey water', '41 gal', '41 gal', '41 gal'],
            ['Black water', '31 gal', '31 gal', '31 gal'],
            ['Propane', '56 lbs', '56 lbs', '56 lbs'],
            ['Fuel', '55 gal', '55 gal', '55 gal'],
          ],
        },
        {
          group: 'Chassis & systems',
          rows: [
            ['Sleeps', 'Up to 5', 'Up to 6', 'Up to 7'],
            ['Engine', '7.3L V8', '7.3L V8', '7.3L V8'],
            ['Tire size', 'LT225/75R16E', 'LT225/75R16E', 'LT225/75R16E'],
            ['Water heater', 'Tankless', 'Tankless', 'Tankless'],
            ['Furnace', '30,000 BTU', '30,000 BTU', '30,000 BTU'],
            ['Outside storage', '37 cu. ft.', '95 cu. ft.', '51 cu. ft.'],
          ],
        },
      ],
    },

    visit: {
      label: 'See it in person',
      heading: 'Drive one before you decide.',
      body: 'A drawing shows you where the bed goes. It cannot tell you how the E-450 feels with JRide® Plus underneath, or how the overhead bunk sits with two adults in it. A dealer can.',
      ctas: [
        { label: 'Find a Dealer', href: 'dealers.html', style: 'primary' },
        { label: 'View Inventory', href: '#', style: 'secondary' },
      ],
      note: 'More than 300 Jayco dealers across North America.',
    },

    compare: {
      label: 'Compare',
      heading: 'Not sure it’s the one?',
      body: 'Put the Greyhawk beside the rest of the Class C lineup and compare length, sleeping, chassis and price side by side.',
      cta: { label: 'Compare Class C Models', href: 'compare.html' },
    },

    /* Resources — the same rules as the other two. 2023–2026 each have their
       own jayco.com page (checked 2026-09-11, titles read back); 2022 falls
       back to the Class C listing, so it is left out. The manual is Jayco's
       2027 Class C book (manuals-data.js lists the same PDF). */
    resources: {
      years: [2026, 2025, 2024, 2023].map((y) => ({
        year: y, href: 'https://www.jayco.com/rvs/class-c-motorhomes/' + y + '-greyhawk/' })),
      brochure: { href: 'brochures.html?model=greyhawk', open: 'greyhawk' },
      manual: {
        href: 'https://www.jayco.com/uploads/rvs/manuals/657-Jayco-C---Book-MY27.pdf',
        note: 'Jayco’s 2027 Greyhawk owner’s manual, as a PDF.',
      },
    },

    /* Jayco's own "You may also like" lists Melbourne, Redhawk and Redhawk SE;
       Melbourne has no record in models-data.js, so Greyhawk XL takes its
       place — the same coach, longer, on a diesel. */
    similar: ['redhawk', 'redhawk-se', 'greyhawk-xl'],

    faqs: [
      { q: 'What chassis is the Greyhawk built on?',
        a: 'A Ford® E-450 with a 7.3L V8 making 325 hp and 450 lb-ft of torque, through a six-speed TorqShift® transmission. It is rated at 14,500 lbs GVWR and 22,000 lbs GCWR.' },
      { q: 'Can I tow a car behind it?',
        a: 'Yes — the hitch is rated for 7,500 lbs with a 750 lb. tongue capacity and a 7-pin plug. Keep the loaded coach and the towed vehicle together under the 22,000 lb. GCWR.' },
      { q: 'How long can I stay off the grid?',
        a: 'Longer than most. The 4,000W generator has auto-gen start and draws from the fuel tank, the 200W solar panel charges the house and chassis batteries together through a dual controller, and a 1,000W inverter runs household outlets from the batteries.' },
      { q: 'Which floorplan sleeps the most?',
        a: 'The 31F sleeps seven, with bunks rated for 300 lbs each. The 30Z sleeps six, and the 27U and 29MV sleep five. Every plan has the 750 lb. overhead bunk.' },
      { q: 'What is in the Customer Value Package, and is it optional?',
        a: 'It is mandatory, at $12,750, and it brings JRide® Plus, automatic hydraulic leveling jacks, frameless windows, an electric awning with LED lights, the 15,000 BTU A/C with heat pump, a 1,000W inverter, the Sony® infotainment center, backup and side-view cameras, and an LED HD Smart TV.' },
    ],
  };

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
      ctas: [{ label: 'Find a Dealer', href: 'dealers.html', style: 'secondary' }],
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

  /* Key is what ?model= matches, so it is the slug. Comet stays last: its
     own comment asks to remain the degradation test at the end. */
  return { swift, 'jay-feather': jayFeather, greyhawk, comet };
})();

/* The list in models-data.js tells every OTHER page which slugs have a real
   page here — it exists because this file is 64KB and only model.html loads
   it. This is the check that the two never drift: it runs on the one page that
   has both, costs a set comparison, and says which side is missing what. */
(function () {
  const real = Object.keys(window.JAYCO_MODEL_DETAIL)
    .filter((k) => !window.JAYCO_MODEL_DETAIL[k].stub).sort();
  const listed = (window.JAYCO_MODEL_PAGES || []).slice().sort();
  const missing = real.filter((s) => listed.indexOf(s) < 0);
  const extra = listed.filter((s) => real.indexOf(s) < 0);
  if (missing.length || extra.length) {
    console.warn('[jayco] JAYCO_MODEL_PAGES is out of date. ' +
      (missing.length ? 'Add: ' + missing.join(', ') + '. ' : '') +
      (extra.length ? 'Remove (no real record here): ' + extra.join(', ') + '.' : ''));
  }
}());
