/* ===================================================
   Jayco — The Jayco Difference: feature data
   ---------------------------------------------------
   Two lists, one per kind of RV, and the page is a
   switch between them — plus the fact sections the
   client asked for on 2026-09-13 (stats, layers,
   warranties, milestones, community, badges).

   PROVENANCE — every feature below is Jayco's own,
   harvested 2026-09-07 from three pages:
     • jayco.com/about/the-jayco-difference/
       the hub, and the source of the page's own
       heading, tagline and intro claims.
     • jayco.com/about/Jayco-Difference-Towables
       the original nine towable entries.
     • jayco.com/about/Jayco-Difference-Motorized
       the eleven motorized entries.

   ADDED 2026-09-13, each re-read on jayco.com that day:
     • /rvs/toy-haulers/2023-seismic/ — "withstood 4,500
       pounds—50 percent more than competitors' roofs";
       "a minimum of 16 minutes under 144 tons of
       pressure"; the frame "specifically designed … for
       its size and shape".
     • /about/safety/ — "the strongest roof in the
       business"; standard on all fifth wheels and travel
       trailers; a tested belt in every seat.
     • /rvs/travel-trailers/2027-eagle-travel-trailers/
       320MKTS/ — Climate Shield (0°F to 100°F, and what
       it includes), the 5" truss / plywood / Alpha Ply
       TPO roof, the 4-Star Handling Package.
     • /rvs/class-c-motorhomes/2026-seneca-xt/ — Starlink
       standard, in the Customer Value Package.
     • /about/warranty/ — the supplier warranty terms, and
       "twice as long … than any other manufacturer".
     • /owners-resources/owners-support/ — Tredit
       Advantage (45,000+ vehicles, 24/7/365, no dues) and
       Jayco University (76 videos, 3+ hours, free).
     • /about/history/ — the milestones, and Jay Flight's
       "15 consecutive years" (2020).
     • /about/r&d/ — "the industry's largest team of
       engineers" and the four material tests.
     • /about/r&d/awards/ — "103 DSI Gold Circle Awards".
     • /blog/Owners-Groups-and-Forums/ — Jayco RV Club
       52,870 members, "updated as of 02/25/2025".
     • /blog/Jayco-Extensive-Service-Center-and-Dealer-
       Network-First/ — "hundreds of dealers and service
       centers", Jayco Masters annual training.

   CHECKED AND LEFT OUT: a dealer count of 300 (not on
   jayco.com — it says "hundreds"), "730 days" and "15
   additional component warranties" (not on the warranty
   page), and "I-beam" for the frame (the Seismic page
   does not say it). The 2025 RV Business Top Innovation
   award is for a "Water Filtration System" and Jayco
   does not name the product, so it is not pinned to the
   NuvoH2O card.

   Names carry Jayco's own capitalisation and marks —
   Magnum Truss™, Stronghold VBL™, JAYCOMMAND®,
   JaySMART™, NuvoH2O™, JRide®. Climate Shield carries
   no mark here because none was seen on the source.

   `stat` IS OPTIONAL. A card gets a figure only where
   Jayco publishes one for that feature; the rest keep
   the name and the sentence rather than a number made
   up to match.

   THREE FEATURES APPEAR IN BOTH LISTS. The 2+3
   warranty, Stronghold VBL walls and the solar
   programme are on both of Jayco's own pages, because
   they are true of both kinds of RV. They are repeated
   here rather than hoisted into a shared list: a reader
   who switches to Motorized is asking what a motorhome
   gets, and an answer that omits the warranty because
   the towables already claimed it would be wrong.
   =================================================== */

window.JAYCO_DIFFERENCE = (function () {
  'use strict';

  const towable = [
    { icon: 'roof', name: 'Magnum Truss™ Roof System',
      stat: { fig: '4,500 lb', cap: 'Withstood in testing' },
      body: 'Standard on every Jayco travel trailer and fifth wheel, and Jayco calls it the strongest roof in the business — 50% more weight than competitors\' roofs.' },
    { icon: 'wall', name: 'Stronghold VBL™ Laminated Walls',
      stat: { fig: '144 tons', cap: 'Of pressure, for 16+ minutes' },
      body: 'Aluminium frame, fibreglass, metal backers and the interior panel, vacuum-bonded into one wall — what Jayco calls the lightest, yet strongest, construction in the RV industry.' },
    { icon: 'frame', name: 'Custom Frames',
      body: 'Designed by Jayco\'s engineers for the size and shape of the floorplan sitting on it, rather than a stock frame the floorplan is made to fit.' },
    { icon: 'temp', name: 'Climate Shield',
      stat: { fig: '0°F – 100°F', cap: 'Built-in protection at both ends' },
      body: 'A fully enclosed, heated underbelly, a 35,000 BTU furnace, double-layer fibreglass insulation and a double-sided radiant barrier. On select models, such as Eagle.' },
    { icon: 'shield', name: 'The Jayco 2+3 Warranty',
      stat: { fig: '2 + 3', cap: 'Years limited + structural' },
      body: 'Two years of limited coverage plus three years of structural protection — a limited warranty Jayco says is twice as long as any other manufacturer\'s. Supplier warranties run to a lifetime on top.' },
    { icon: 'solar', name: 'Overlander Solar Packages',
      stat: { fig: '100%', cap: 'Solar-equipped or solar-prepped' },
      body: 'Every towable comes standard or prepped for solar, with complete systems available at a range of capacities.' },
    { icon: 'tech', name: 'JAYCOMMAND® Smart RV System',
      body: 'Monitor and control the coach from your phone, wherever you happen to be standing. Available on select models.' },
    { icon: 'light', name: 'JaySMART™ Lighting',
      stat: { fig: 'Patented', cap: 'Syncs with any tow vehicle' },
      body: 'Signals your turns, stops, reversing and hazards to the drivers behind you, with zero adjustments needed. Standard on select models.' },
    { icon: 'water', name: 'NuvoH2O™ Water Filtration',
      body: 'Citrus-based filtration that cuts hard-water build-up without salt or harsh chemicals. Available on select Eagle, North Point, Pinnacle and Seismic models.' },
    { icon: 'interior', name: 'Custom Interior Design',
      body: 'Chosen fabrics and fixtures, higher bunk ratings, thicker bunk mats and carpetless slides — with two design schemes on select products.' },
    { icon: 'tow', name: '4-Star Handling Package',
      body: 'Dexter® axles with NEV-R-Adjust® brakes and E-Z Lube hubs, MORryde® CRE-3000™ rubberized suspension, and wet-bolt fasteners with bronze bushings, for towing stability. On select models, such as Eagle.' },
  ];

  const motorized = [
    { icon: 'ride', name: 'The JRide® Ride and Handling Package',
      stat: { fig: 'Standard', cap: 'On every Jayco motorhome' },
      body: 'A Jayco-exclusive package of premium shocks and balanced drive-shaft technology, blended for handling and stability rather than bolted on one part at a time.' },
    { icon: 'shield', name: 'The Jayco 2+3 Warranty',
      stat: { fig: '24,000 mi', cap: 'Or 24 months, + 3 years structural' },
      body: 'Two years of limited coverage — 24 months or 24,000 miles, whichever comes first — plus three years of structural protection. Jayco says its limited warranty is twice as long as any other manufacturer\'s.' },
    { icon: 'cap', name: 'One-Piece Seamless Front Caps',
      body: 'A single moulded cap with no seam for moisture or road debris to work at, which is one less thing to service later.' },
    { icon: 'view', name: '120" Windshield',
      stat: { fig: '120"', cap: 'The largest on the market' },
      body: 'On Class A motorhomes — the view is the reason to sit up front.' },
    { icon: 'belt', name: 'Safety Belts on All Seats',
      stat: { fig: 'Every seat', cap: 'Belted and stress-tested' },
      body: 'Jayco installs and tests a belt at each seating position of every motorhome it builds, not only the ones up front.' },
    { icon: 'wall', name: 'Stronghold VBL™ Laminated Walls',
      body: 'The same vacuum-bonded wall the towables are built with: frame, fibreglass and interior panel bonded through the whole process.' },
    { icon: 'lock', name: 'Catalytic Converter Theft Deterrent',
      body: 'An impenetrable strip over the exhaust, held by a heat-activated bond and secured under the heat shield.' },
    { icon: 'tow', name: 'Towing Capability',
      stat: { fig: '10%', cap: 'Tongue-to-towing capacity' },
      body: 'Engineered so tongue capacity is ten percent of towing capacity, which is what lets you tow without a weight-distribution hitch.' },
    { icon: 'brake', name: 'Brake Lighting and Back-Up Camera',
      body: 'A third brake light and a rear camera, both standard rather than a line on the options sheet.' },
    { icon: 'bunk', name: 'Bunk Ratings',
      stat: { fig: '750 lb', cap: '300 lb over industry standard' },
      body: 'Motorhome bunks rated three hundred pounds above what the industry treats as standard, which matters more the longer the trip.' },
    { icon: 'solar', name: 'Solar Power',
      stat: { fig: '100%', cap: 'Of motorhomes solar-prepped' },
      body: 'Every motorhome comes solar-prepped, with full Overlander solar packages available on top.' },
    { icon: 'starlink', name: 'Starlink Satellite Internet',
      body: 'Standard on the 2026 Seneca XT as part of its Customer Value Package, so the connection goes where the coach goes.' },
  ];

  /* ---------- Rows ----------
     Each group is read as a run of rows: one photograph, and the features that
     belong beside it. The page alternates which side the picture takes, so the
     order here is the order down the page.

     Each row carries a TITLE, which is the subject the photograph and its
     highlights share — printed over the bottom-left of the plate. They name
     what the group is about and claim nothing beyond it; every claim on this
     page lives in a highlight, where it is Jayco's own words.

     THE GROUPING IS BY SUBJECT, not by slicing the list into threes. Row one of
     the towables is what holds the trailer together and the picture is the line
     it is built on; row two is what you get once it is yours and the picture is
     one parked up. A photograph next to three unrelated features would be
     decoration.

     Towables are eleven and run 4+4+3; motorized are twelve and run 4+4+4 —
     the rows carry what belongs together rather than padding to a grid. */
  const pick = (list, names) => names.map((n) => {
    const f = list.find((x) => x.name === n);
    if (!f) throw new Error('unknown feature: ' + n);
    return f;
  });

  /* ---------- By the numbers ----------
     The six figures at the top of the page. Four of them also stand on a card
     below; that repetition is the point of a summary. */
  const stats = [
    { fig: '1,000,000+', cap: 'RVs built across Jayco\'s four divisions — the millionth in 2016' },
    { fig: '4,500 lb', cap: 'Withstood by the Magnum Truss™ roof in testing — 50% more than competitors\' roofs' },
    { fig: '144 tons', cap: 'Of pressure bonding each Stronghold VBL™ wall, for at least 16 minutes' },
    { fig: '2 + 3', cap: 'Years of limited warranty plus structural protection' },
    { fig: '103', cap: 'RVDA DSI Gold Circle awards for dealer satisfaction' },
    { fig: '15 years', cap: 'Jay Flight named North America\'s #1-selling travel trailer, consecutively' },
  ];

  /* ---------- Inside the wall ----------
     One panel per kind of RV, behind the section's own switch. The photographs
     are client-supplied factory shots (assets/jayco-difference/, served from
     web/construction-<id>-800|1200.webp). They are photographs of real coaches
     on the line, NOT diagrams, so nothing is pinned onto them — the numbered
     list beside each one is where the claims are.

     The towable roof, underbelly and flooring specifics are the Eagle's, and
     the motorized insulation figures are the 2026 Seneca XT's. There is no
     caption under the photographs (client, 2026-09-13), so the list item
     carrying each of those specifics names the model itself. The 144-ton lamination figure is NOT on the motorized panel:
     Jayco publishes it on a towable page, and its motorized copy says only that
     the wall is bonded through the whole process. */
  const cutaways = [
    { id: 'towable', label: 'Towables', img: 'construction-towable',
      alt: 'A Jayco fifth wheel on the production line with its slide-out open and crew working on the roof',
      layers: [
    { where: 'Roof', name: 'Magnum Truss™ Roof System',
      body: 'Standard on every travel trailer and fifth wheel and tested to 4,500 lb. On the Eagle it is a 5-inch truss under plywood decking and an Alpha Ply TPO membrane — one of the thickest in the industry, with a limited lifetime warranty.' },
    { where: 'Walls', name: 'Stronghold VBL™ Laminated Walls',
      body: 'Aluminium frame, fibreglass, metal backers and interior panel, vacuum-bonded under 144 tons of pressure for a minimum of 16 minutes.' },
    { where: 'Underbelly', name: 'Climate Shield',
      body: 'Fully enclosed and heated, with double-layer fibreglass insulation in the ceiling and floor and a double-sided radiant barrier — for camping from 0°F to 100°F. On select models, such as Eagle.' },
    { where: 'Floor and frame', name: 'A frame drawn for the floorplan',
      body: 'Designed by Jayco\'s engineers for the size and shape of each floorplan — under 5/8-inch tongue-and-groove plywood flooring on the Eagle.' },
      ] },
    { id: 'motorized', label: 'Motorized', img: 'construction-motorized',
      alt: 'A Jayco motorhome body on its chassis on the production line, walls up and cabinetry going in',
      layers: [
    { where: 'Walls', name: 'Stronghold VBL™ Laminated Walls',
      body: 'The same vacuum-bonded wall the towables are built with — frame, fibreglass and interior panel bonded into one through the whole process.' },
    { where: 'Roof, walls and floor', name: 'Bead-foam insulation',
      body: 'Rated up to R-24 in the roof, R-8 in the walls and R-9 in the floor on the 2026 Seneca XT.' },
    { where: 'Front', name: 'One-Piece Seamless Front Cap',
      body: 'A single moulded cap with no seam for moisture or road debris to work at, which is one less thing to service later.' },
    { where: 'Chassis', name: 'The JRide® Ride and Handling Package',
      body: 'Standard on every Jayco motorhome: premium shocks and balanced drive-shaft technology, blended for handling and stability.' },
      ] },
  ];

  /* ---------- The warranty ladder ----------
     Shortest to longest. `years: null` is a lifetime term and draws full width.
     `jayco: true` marks Jayco's own coverage; everything else is a supplier's.
     Samsung's refrigerator (5 years) and its compressor (10) are one row, at the
     longer term, with the shorter one in the sentence. */
  const warranties = [
    { what: 'Limited warranty', who: 'Jayco — 24 months or 24,000 miles on motorized', years: 2, jayco: true },
    { what: 'Structural protection', who: 'Jayco', years: 3, jayco: true },
    { what: 'Flooring, pin box, generator, fuel pump', who: 'Congoleum®, MORryde®, Onan®, Standard Technologies', years: 3 },
    { what: 'Axles and antennas', who: 'Dexter®, Winegard®', years: 5 },
    { what: 'Tires and vacuum', who: 'Goodyear®, Intervac™', years: 6 },
    { what: 'Vinyl flooring', who: 'Shaw®', years: 7 },
    { what: 'Refrigerator compressor', who: 'Samsung® — five years on the refrigerator itself', years: 10 },
    { what: 'Roofing material', who: 'Dicor', years: 20 },
    { what: 'Floor decking', who: 'Huber', years: 25 },
    { what: 'Aluminium wheels', who: 'Tredit™', years: null },
  ];

  /* ---------- Milestones ----------
     Jay Flight's streak and the million are in the numbers band already, so the
     row carries the million as a date rather than restating the streak. */
  const milestones = [
    { when: '1968', fig: 'Founded', body: 'Lloyd Bontrager\'s lifter system for pop-up campers starts the company in Middlebury, Indiana.' },
    { when: '1969', fig: '132', body: 'Camping trailers sold in the first full year, by fifteen employees.' },
    { when: '2006', fig: '500,000th', body: 'Unit built and shipped.' },
    { when: '2011', fig: 'World\'s largest', body: 'Privately held RV manufacturer.' },
    { when: '2016', fig: '1,000,000th', body: 'Unit built across Jayco\'s four divisions.' },
    { when: '2017', fig: 'Nearly 4,000', body: 'Employees — the largest workforce in the company\'s history.' },
  ];

  /* ---------- Owners and dealers ----------
     The club figure is dated because Jayco dates it. */
  const community = [
    { fig: '52,870', cap: 'Members of the Jayco RV Club, the largest owners group Jayco lists (as of February 2025)' },
    { fig: '76', cap: 'Free training videos — more than three hours — for owners at Jayco University' },
    { fig: 'Every year', cap: 'Jayco dealers take the exclusive Jayco Masters training, across hundreds of dealers and service centers in North America' },
  ];

  /* ---------- Award badges ----------
     The four marks the client supplied on 2026-09-13 as transparent PNGs in
     assets/jayco-difference/, served as transparent WebP from web/. They sit
     on the panel with no tile behind them, at the client's request. The alt
     text is what each mark itself says. */
  const badges = [
    { file: 'award-rvda-dsi.webp', alt: 'RVDA Dealer Satisfaction Index award' },
    { file: 'award-rv-news-rv-of-the-year.webp', alt: 'RV News 2026 RV of the Year, Single Axle Travel Trailer: Jayco Jay Feather Air SL 15TBSL' },
    { file: 'award-rv-business-must-see.webp', alt: 'RV Business 2026 Must-See RV' },
    { file: 'award-wildsam-readers-choice-gold.webp', alt: 'Wildsam Readers\' Choice Awards 2025 winner, Gold' },
  ];

  return {
    stats: stats,
    cutaways: cutaways,
    warranties: warranties,
    milestones: milestones,
    community: community,
    badges: badges,
    groups: [
      { id: 'towable',   label: 'Towables',
        title: 'The towable difference',
        lead: 'Travel trailers, fifth wheels and toy haulers — built to last through what goes into them, not what gets said about them.',
        rows: [
          { img: 'tow-1', title: 'How it goes together',
            alt: 'Travel trailers on the Jayco assembly line, staff fitting them out',
            features: pick(towable, ['Magnum Truss™ Roof System', 'Stronghold VBL™ Laminated Walls', 'Custom Frames', 'Climate Shield']) },
          { img: 'tow-2', title: 'Once it is yours',
            alt: 'Two people at a picnic table beside a Jayco travel trailer in the forest, awning out and bikes in the foreground',
            features: pick(towable, ['The Jayco 2+3 Warranty', 'Overlander Solar Packages', 'JAYCOMMAND® Smart RV System', 'NuvoH2O™ Water Filtration']) },
          { img: 'tow-3', title: 'Living with it',
            alt: 'Two people preparing food together at the galley counter of a Jayco travel trailer',
            features: pick(towable, ['JaySMART™ Lighting', '4-Star Handling Package', 'Custom Interior Design']) },
        ] },
      { id: 'motorized', label: 'Motorized',
        title: 'The motorized difference',
        lead: 'Class A, B and C — upgraded production, a ride package of its own, and the materials you would want under you at highway speed.',
        rows: [
          { img: 'mot-1', title: 'How it drives',
            alt: 'A Jayco Class B camper van driving a tree-lined road in autumn',
            features: pick(motorized, ['The JRide® Ride and Handling Package', 'The Jayco 2+3 Warranty', 'One-Piece Seamless Front Caps', 'Stronghold VBL™ Laminated Walls']) },
          { img: 'mot-2', title: 'Up front and inside',
            alt: 'A woman preparing food at the galley counter inside a Jayco motorhome',
            features: pick(motorized, ['120" Windshield', 'Safety Belts on All Seats', 'Brake Lighting and Back-Up Camera', 'Bunk Ratings']) },
          { img: 'mot-3', title: 'Off the grid, and secure',
            alt: 'A Jayco Class B camper van parked by a creek with its side door open and chairs out',
            features: pick(motorized, ['Catalytic Converter Theft Deterrent', 'Towing Capability', 'Solar Power', 'Starlink Satellite Internet']) },
        ] },
    ],
  };
}());
