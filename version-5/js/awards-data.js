/* ===================================================
   Jayco — Award-Winning RVs: the awards themselves
   ---------------------------------------------------
   PROVENANCE. Every row below is Jayco's own, harvested
   on 2026-09-07 from jayco.com/about/r&d/awards/ —
   the page Jayco links from its About menu as "See the
   Honors". Nothing here is inferred, rounded, or
   promoted from a lesser award to a better-sounding
   one, and no award has been added that Jayco does not
   itself claim.

   THE SHAPE OF A ROW is award / by / what / note:
     award  what the thing is called
     by     who gave it
     what   the coach that won it, or null
     note   the category, place or class, or null

   `what` IS ALLOWED TO BE NULL, and often is. A large
   share of these — every Reader's Choice, both Dealer
   Satisfaction Index awards every year — are awarded to
   Jayco as a brand or to a whole lineup, not to a
   floorplan. Filling that cell with the brand name
   would make sixty rows read as sixty product wins,
   which is the one thing an awards page must not do.
   awards.js prints "Jayco" in that cell only where the
   award really was Jayco's rather than a coach's, and
   the row is set apart from the ones that name a
   product.

   ORGANISATION NAMES CARRY JAYCO'S OWN SPELLING, and
   they change across the years on purpose: the
   Reader's Choice awards are credited to RV Magazine
   in 2021-2024 and 2026 and to Wildsam in 2025,
   because that is how Jayco credits them. Trailer Life
   and MotorHome appear in 2021 for the same reason.

   THE RECOGNITION BLOCK AT THE FOOT IS NO LONGER
   RENDERED. It is the running Gold Circle count, two
   RV Pro 40 Under 40 people and a design patent —
   things Jayco lists apart from its model years. The
   page had a section for it and that section was cut
   on 2026-09-08 at the client's request, so nothing
   reads `recognition` today.

   IT IS KEPT RATHER THAN DELETED because it is
   harvested source material, not scaffolding: it took
   a trip to jayco.com to get and it is correct. If the
   section comes back, render it with the same rowHTML
   the years use. If it is genuinely never coming back,
   delete this array — an unused export that nobody has
   decided about is how a data file starts rotting.
   =================================================== */

window.JAYCO_AWARDS = (function () {
  'use strict';

  /* Newest first: this is the order Jayco lists them in and the order a
     reader wants them. awards.js does not re-sort. */
  const years = [
    {
      year: 2026,
      rows: [
        { award: 'RV of the Year',   by: 'RV News',     what: 'Jay Feather Air SL 15TBSL', note: 'Single Axle Travel Trailer' },
        { award: 'RV of the Year',   by: 'RV News',     what: 'Jay Flight SLX 265MWS',     note: 'Lightweight Travel Trailer' },
        { award: 'Must-See RV',      by: 'RV Business', what: 'Jay Flight SLX Sport 130BH', note: null },
        { award: "Reader's Choice",  by: 'RV Magazine', what: null, note: 'Gold — Favorite Travel Trailer' },
        { award: "Reader's Choice",  by: 'RV Magazine', what: null, note: 'Gold — Favorite Tiny Trailer' },
        { award: "Reader's Choice",  by: 'RV Magazine', what: null, note: 'Gold — Favorite Off-Road Trailer' },
        { award: "Reader's Choice",  by: 'RV Magazine', what: null, note: 'Gold — Favorite Class B Motorhome' },
        { award: "Reader's Choice",  by: 'RV Magazine', what: null, note: 'Gold — Favorite Class C Motorhome' },
        { award: "Reader's Choice",  by: 'RV Magazine', what: null, note: 'Gold — Favorite 4x4 Motorhome' },
        { award: "Reader's Choice",  by: 'RV Magazine', what: null, note: 'Silver — Favorite Fifth-Wheel' },
        { award: "Reader's Choice",  by: 'RV Magazine', what: null, note: 'Silver — Favorite Toy Hauler' },
        { award: 'DSI Award',        by: 'RVDA',        what: null, note: 'Dealer Satisfaction Index — Jayco Towables' },
        { award: 'DSI Award',        by: 'RVDA',        what: null, note: 'Dealer Satisfaction Index — Jayco Motorized' },
      ],
    },
    {
      year: 2025,
      rows: [
        { award: 'Top 10 Finalist',  by: 'RV Business', what: 'Eagle HT 230MLCS', note: 'RV of the Year' },
        { award: 'Top Innovation',   by: 'RV Business', what: null, note: 'Water Filtration System — Jayco Towables' },
        { award: "Reader's Choice",  by: 'Wildsam',     what: null, note: 'Gold — Favorite Travel Trailer' },
        { award: "Reader's Choice",  by: 'Wildsam',     what: null, note: 'Gold — Favorite Tiny Trailer' },
        { award: "Reader's Choice",  by: 'Wildsam',     what: null, note: 'Gold — Favorite Off-Road Trailer' },
        { award: "Reader's Choice",  by: 'Wildsam',     what: null, note: 'Gold — Favorite Class B Motorhome' },
        { award: "Reader's Choice",  by: 'Wildsam',     what: null, note: 'Gold — Favorite Class C Motorhome' },
        { award: "Reader's Choice",  by: 'Wildsam',     what: 'Granite Ridge', note: 'Gold — Favorite 4x4 Motorhome' },
        { award: "Reader's Choice",  by: 'Wildsam',     what: null, note: 'Silver — Favorite Fifth-Wheel' },
        { award: "Reader's Choice",  by: 'Wildsam',     what: null, note: 'Silver — Favorite Toy Hauler' },
        { award: 'DSI Award',        by: 'RVDA',        what: null, note: 'Dealer Satisfaction Index — Jayco Towables' },
        { award: 'DSI Award',        by: 'RVDA',        what: null, note: 'Dealer Satisfaction Index — Jayco Motorized' },
      ],
    },
    {
      year: 2024,
      rows: [
        { award: 'RV of the Year',   by: 'RV News',     what: 'Pinnacle 38FBRK',  note: 'Luxury Fifth Wheel' },
        { award: 'RV of the Year',   by: 'RV News',     what: 'Jay Flight 235MBH', note: 'Entry Level Travel Trailer' },
        { award: 'Top Debut',        by: 'RV Business', what: 'Greyhawk XL 32U',  note: null },
        { award: "Reader's Choice",  by: 'RV Magazine', what: null, note: 'Gold — Favorite Tiny Travel Trailer' },
        { award: "Reader's Choice",  by: 'RV Magazine', what: null, note: 'Gold — Favorite Class C Motorhome' },
        { award: "Reader's Choice",  by: 'RV Magazine', what: null, note: 'Silver — Favorite Fifth Wheel' },
        { award: "Reader's Choice",  by: 'RV Magazine', what: null, note: 'Silver — Favorite Toy Hauler' },
        { award: "Reader's Choice",  by: 'RV Magazine', what: null, note: 'Bronze — Favorite Travel Trailer' },
        { award: "Reader's Choice",  by: 'RV Magazine', what: null, note: 'Bronze — Favorite 4x4 Motorhome' },
        { award: 'DSI Award',        by: 'RVDA',        what: null, note: 'Dealer Satisfaction Index — Jayco Towables' },
        { award: 'DSI Award',        by: 'RVDA',        what: null, note: 'Dealer Satisfaction Index — Jayco Motorized' },
      ],
    },
    {
      year: 2023,
      rows: [
        { award: 'RV of the Year',   by: 'RV News',     what: 'North Point 380RKGS', note: 'High-End Fifth Wheel' },
        { award: 'RV of the Year',   by: 'RV News',     what: 'Jay Feather Volaré',  note: 'Lightweight Travel Trailer' },
        { award: 'RV of the Year',   by: 'RV News',     what: 'Seneca XT 35L',       note: 'Class C / Super C Motorhome' },
        { award: 'Top 10 Finalist',  by: 'RV Business', what: 'Jay Feather Volaré',  note: 'RV of the Year' },
        { award: "Reader's Choice",  by: 'RV Magazine', what: null, note: 'Gold — Class C Manufacturer' },
        { award: "Reader's Choice",  by: 'RV Magazine', what: null, note: 'Silver — Small Camping Trailer Manufacturer' },
        { award: "Reader's Choice",  by: 'RV Magazine', what: null, note: 'Bronze — Travel Trailer Manufacturer' },
        { award: 'DSI Award',        by: 'RVDA',        what: null, note: 'Dealer Satisfaction Index — Jayco Towables' },
        { award: 'DSI Award',        by: 'RVDA',        what: null, note: 'Dealer Satisfaction Index — Jayco Motorized' },
      ],
    },
    {
      year: 2022,
      rows: [
        { award: 'RV of the Year',   by: 'RV News',     what: 'Pinnacle 38FLGS',            note: 'Luxury Fifth Wheel' },
        { award: 'Type B of the Year', by: 'RV News',   what: 'Terrain 19Y',                note: '2022 Type B' },
        { award: 'Best of 2022',     by: 'RV Pro',      what: 'North Point 340CKTS',        note: null },
        { award: 'Top Debut',        by: 'RV Business', what: 'Eagle Fifth Wheel 335RDOK',  note: null },
        { award: 'Top Debut',        by: 'RV Business', what: 'Terrain Class B Van',        note: null },
        { award: "Reader's Choice",  by: 'RV Magazine', what: null, note: 'Gold — Favorite Small Camping Trailer' },
        { award: "Reader's Choice",  by: 'RV Magazine', what: null, note: 'Silver — Favorite Class C' },
      ],
    },
    {
      year: 2021,
      rows: [
        { award: 'RV of the Year',   by: 'RV News',      what: 'Jay Feather Micro 166FBS', note: 'Lightweight Travel Trailer' },
        { award: 'RV of the Year',   by: 'RV News',      what: 'Eagle 340DROK',            note: 'Luxury Travel Trailer' },
        { award: 'RV of the Year',   by: 'RV News',      what: 'Jay Flight 34RLOK',        note: 'Mid-Priced Travel Trailer' },
        { award: 'RV of the Year',   by: 'RV News',      what: 'Eagle Half-Ton 24RE',      note: 'Mid-Priced Fifth Wheel' },
        { award: 'Must-See RV',      by: 'RV Business',  what: 'Eagle HT FW 24RE',         note: null },
        { award: 'Top 10 Debut',     by: 'RV Business',  what: 'Jay Feather Micro',        note: null },
        { award: 'Top 20 Debut',     by: 'RV Business',  what: 'Seneca Prestige',          note: null },
        { award: 'Top New RVs 2021', by: 'RV Pro',       what: 'Jay Feather Micro',        note: null },
        { award: 'Top New RVs 2021', by: 'RV Pro',       what: 'North Point 382FLRB',      note: null },
        { award: "Reader's Choice",  by: 'Trailer Life', what: null, note: 'Bronze — Jayco Fifth Wheels' },
        { award: "Reader's Choice",  by: 'MotorHome',    what: null, note: 'Bronze — Class C Motorhome Lineup' },
      ],
    },
  ];

  /* Not a model year, and not RVs. Jayco lists these apart from the yearly
     lineups and so does the page. */
  const recognition = [
    { award: 'DSI Gold Circle', by: 'RVDA', what: null,
      note: '103 awards to date' },
    { award: 'Patent Award', by: 'USPTO', what: 'Seismic 4113 Raised Kitchen', note: null },
    { award: '40 Under 40', by: 'RV Pro', what: null,
      note: 'Nic Martin, VP Sales' },
    { award: '40 Under 40', by: 'RV Pro', what: null,
      note: 'Ryan Eash, GM Jayco Motors' },
  ];

  return { years: years, recognition: recognition };
}());
