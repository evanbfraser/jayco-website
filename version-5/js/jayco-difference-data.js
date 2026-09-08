/* ===================================================
   Jayco — The Jayco Difference: feature data
   ---------------------------------------------------
   Two lists, one per kind of RV, and the page is a
   switch between them.

   PROVENANCE — every feature below is Jayco's own,
   harvested 2026-09-07 from three pages:
     • jayco.com/about/the-jayco-difference/
       the hub, and the source of the page's own
       heading, tagline and intro claims.
     • jayco.com/about/Jayco-Difference-Towables
       the nine towable entries.
     • jayco.com/about/Jayco-Difference-Motorized
       the eleven motorized entries.

   Names carry Jayco's own capitalisation and marks —
   Magnum Truss™, Stronghold VBL™, JAYCOMMAND®,
   JaySMART™, NuvoH2O™, JRide®. The descriptions are
   written from Jayco's copy and claim nothing it does
   not; where Jayco says "select models", so does this.

   WHAT IS NOT HERE. Jayco publishes no photography per
   feature, so the cards are icon-led rather than
   showing a picture of a roof truss this repo does not
   have. The icon set is thematic and deliberately
   reused across features — see ICONS in
   jayco-difference.js — because eight honest symbols
   beat twenty invented ones.

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
      body: 'The roof framework carries up to 50% more weight than competing designs, which is what lets it take a snow load rather than merely shed rain.' },
    { icon: 'wall', name: 'Stronghold VBL™ Laminated Walls',
      body: 'Aluminium frame, fibreglass, metal backers and the interior panel, vacuum-bonded into one wall — strength without the weight that usually buys it.' },
    { icon: 'frame', name: 'Custom Frames',
      body: 'The steel frame is designed around the floorplan sitting on it rather than a stock frame the floorplan is made to fit.' },
    { icon: 'shield', name: 'The Jayco 2+3 Warranty',
      body: 'Two years of limited coverage plus three years of structural protection — twice the term the industry treats as standard. Some components carry longer again from Jayco\'s supplier partners.' },
    { icon: 'solar', name: 'Overlander Solar Packages',
      body: 'Every towable leaves the line either solar-prepped or with a complete system fitted, at a range of capacities.' },
    { icon: 'tech', name: 'JAYCOMMAND® Smart RV System',
      body: 'Monitor and control the coach from your phone, wherever you happen to be standing. Available on select models.' },
    { icon: 'light', name: 'JaySMART™ Lighting',
      body: 'A patented lighting system that signals your turns, stops, reversing and hazards to the drivers behind you. Standard on select models.' },
    { icon: 'water', name: 'NuvoH2O™ Water Filtration',
      body: 'Citrus-based filtration that cuts hard-water build-up without salt or harsh chemicals. Available on select Eagle, North Point, Pinnacle and Seismic models.' },
    { icon: 'interior', name: 'Custom Interior Design',
      body: 'Chosen fabrics and fixtures, higher bunk ratings, thicker bunk mats and carpetless slides — with two design schemes on select products.' },
  ];

  const motorized = [
    { icon: 'ride', name: 'The JRide® Ride and Handling Package',
      body: 'Premium shocks and balanced drive-shaft technology, blended for handling and stability rather than bolted on one part at a time.' },
    { icon: 'shield', name: 'The Jayco 2+3 Warranty',
      body: 'Two years of limited coverage — 24 months or 24,000 miles, whichever comes first — plus three years of structural protection, twice the term the industry treats as standard.' },
    { icon: 'cap', name: 'One-Piece Seamless Front Caps',
      body: 'A single moulded cap with no seam for moisture or road debris to work at, which is one less thing to service later.' },
    { icon: 'view', name: '120" Windshield',
      body: 'The largest windshield on the market, on Class A motorhomes — the view is the reason to sit up front.' },
    { icon: 'belt', name: 'Safety Belts on All Seats',
      body: 'A stress-tested belt at every designated seating position, not only the ones up front.' },
    { icon: 'wall', name: 'Stronghold VBL™ Laminated Walls',
      body: 'The same vacuum-bonded wall the towables are built with: frame, fibreglass and interior panel bonded through the whole process.' },
    { icon: 'lock', name: 'Catalytic Converter Theft Deterrent',
      body: 'An impenetrable strip over the exhaust, held by a heat-activated bond and secured under the heat shield.' },
    { icon: 'tow', name: 'Towing Capability',
      body: 'Engineered so tongue capacity is ten percent of towing capacity, which is what lets you tow without a weight-distribution hitch.' },
    { icon: 'brake', name: 'Brake Lighting and Back-Up Camera',
      body: 'A third brake light and a rear camera, both standard rather than a line on the options sheet.' },
    { icon: 'bunk', name: 'Bunk Ratings',
      body: 'Bunks rated to 750 lbs — three hundred pounds above the industry standard, which matters more the longer the trip.' },
    { icon: 'solar', name: 'Solar Power',
      body: 'Every motorhome comes solar-prepped, with full Overlander solar packages available on top.' },
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

     Towables divide evenly at 3+3+3. Motorized are eleven, so they run 4+4+3 —
     the rows carry what belongs together rather than padding to a grid. */
  const pick = (list, names) => names.map((n) => {
    const f = list.find((x) => x.name === n);
    if (!f) throw new Error('unknown feature: ' + n);
    return f;
  });

  return {
    groups: [
      { id: 'towable',   label: 'Towables',
        title: 'The towable difference',
        lead: 'Travel trailers, fifth wheels and toy haulers — built to last through what goes into them, not what gets said about them.',
        rows: [
          { img: 'tow-1', title: 'How it goes together',
            alt: 'Travel trailers on the Jayco assembly line, staff fitting them out',
            features: pick(towable, ['Magnum Truss™ Roof System', 'Stronghold VBL™ Laminated Walls', 'Custom Frames']) },
          { img: 'tow-2', title: 'Once it is yours',
            alt: 'Two people at a picnic table beside a Jayco travel trailer in the forest, awning out and bikes in the foreground',
            features: pick(towable, ['The Jayco 2+3 Warranty', 'Overlander Solar Packages', 'JAYCOMMAND® Smart RV System']) },
          { img: 'tow-3', title: 'Living with it',
            alt: 'Two people preparing food together at the galley counter of a Jayco travel trailer',
            features: pick(towable, ['JaySMART™ Lighting', 'NuvoH2O™ Water Filtration', 'Custom Interior Design']) },
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
            features: pick(motorized, ['Catalytic Converter Theft Deterrent', 'Towing Capability', 'Solar Power']) },
        ] },
    ],
  };
}());
