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
   • Swift specs, MSRP, floorplan codes, package and option
     pricing are the real 2027 figures from jayco.com.
   • Photography is Jayco/Entegra studio + lifestyle assets
     supplied for this build (some studio shots are of the
     equivalent MY25 coach, which shares the interior).
   =================================================== */

window.JAYCO_MODEL_DETAIL = (function () {
  'use strict';

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
        { label: 'Build & Price', href: 'build-price.html?model=swift', style: 'primary' },
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
      cta: { label: 'Find a Dealer', href: 'dealers.html' },
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
      cta: { label: 'Compare Class B Models', href: 'compare.html' },
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
     The only floorplan with its own photography — seven frames, so it is the
     only one that gets hotspots. The other fifteen fall back to the drawing
     and its info panel, which is exactly how the template is built to degrade.
     Coordinates are percentages of the 1800x920 drawing export. */
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
    const TOURS = {
      '18rbf': 'ZXK81dW5BzW',
      '19mrk': 'dPPsKuKYr2W',
      '21mbh': '5uijhpVu1ym',
      '21mml': 'Ujr3WT8Vnxn',
      '23mbd': 'LPDBt7fkUpn',
      '24fk':  'LuiPLPmW6Ed',
      '25bh':  'hC84MC3emEz',
      '25rb':  'nHT6XTvNyAz',
      '26fk':  'hGZZv1CeN5P',
      '27bh':  'nmzZHq3wCT4',
      '27mk':  'j7i3th8UMmS',
      '29bhb': 'kuEjvCcL8Tg',
      '29qbh': 'guqqhXsbD9z',
      '30rkb': '4GuJB9u464t',
    };

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
      tour360: TOURS[p.id] ? 'https://my.matterport.com/show/?m=' + TOURS[p.id] : null,
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
        { label: 'Build & Price', href: 'build-price.html?model=jay-feather', style: 'primary' },
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
      label: 'The Layout',
      /* No <br> — only intro.heading is rendered raw; every other heading
         goes through esc(), so a tag here prints as text. */
      heading: 'Sixteen ways to lay it out.',
      body: 'Pick a floorplan to see its drawing and its real numbers. The 19MRK is photographed corner by corner — tap a number on the drawing.',
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
      note: 'Construction element names are Jayco’s own, from the 2027 Jay Feather specification.',
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

    /* Real 2027 figures from build-data.js's option table. Customer Value and
       JaySport are both mandatory, which is why the "from" price on this page
       is not what anyone actually pays. */
    pricing: {
      label: 'Pricing',
      heading: 'What it costs.',
      msrp: 37493,
      msrpNote: 'Starting MSRP, 2027 Jay Feather 18RBF. Excludes freight, dealer prep, taxes and title.',
      mandatory: {
        name: 'Customer Value Package',
        price: 6000,
        note: 'Required on every Jay Feather, alongside the Jay Sport Package',
        items: [
          '13,500 BTU ducted Quiet Series air conditioner',
          '55-gallon fresh water tank and four stabiliser jacks',
          'Power awning with LED lights and a power tongue jack',
          'On-demand tankless water heater and NuvoH2O prep',
          'Radiant-barrier-backed roller shades',
          'Aluminium rims and 20 lb LP bottles with auto regulator',
        ],
      },
      options: [
        { name: 'Jay Sport Package', price: 4500, note: 'Also mandatory — InVision™ appliances, Climate Shield™ insulation, 200W solar, LED smart TV, rear ladder' },
        { name: 'Premier Package', price: 2243, note: 'Dual MaxxAir® fans, multi-function stainless sink, power 5-point stabilisation, solid-surface countertops' },
        { name: 'Overlander II Solar Package', price: 1193, note: 'Replaces the Overlander I package' },
        { name: '2nd 13,500 BTU A/C in bedroom', price: 1043 },
        { name: 'Theater seating with table trays, in place of the dinette', price: 1043 },
        { name: '50 amp service with 2nd A/C prep', price: 488 },
        { name: '120V heated tank pads', price: 413 },
        { name: 'Theater seating in place of the tri-fold sofa', price: 368 },
        { name: '15,000 BTU A/C', price: 300 },
        { name: 'King bed', price: 293, note: 'Select floorplans' },
        { name: 'App-monitored in-stem TPMS', price: 270 },
        { name: 'Free-standing table with four chairs', price: 233 },
        { name: '30 lb LP bottles with auto regulator and fill gauge', price: 113 },
      ],
      disclaimer: 'Jayco publishes no-haggle MSRP. Your dealer confirms final pricing, availability and any regional fees.',
    },

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
      cta: { label: 'Find a Dealer', href: 'dealers.html' },
      note: 'More than 200 Jayco dealers across North America.',
    },

    brochure: {
      label: 'Brochure',
      heading: 'Take the Jay Feather with you.',
      body: 'The full 2027 Jay Feather brochure — every floorplan, standard equipment, package contents and specifications in one PDF.',
      cta: { label: 'Download Brochure', href: '#' },   /* no PDF in the repo yet */
      image: jfImg('jf-kitchen.jpg'),
    },

    compare: {
      label: 'Compare',
      heading: 'Not sure it’s the one?',
      body: 'Put the Jay Feather beside the rest of the travel trailer lineup and compare length, weight, layout and price side by side.',
      cta: { label: 'Compare travel trailers', href: 'compare.html' },
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
  return { swift, 'jay-feather': jayFeather, comet };
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
