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
     badge  the awarding body's own mark, under
            assets/awards/badges/
     href   where Jayco's own awards page sends that
            card — the coach, the lineup, or the
            article announcing the award

   THE BADGES ARE PAIRED, NOT ASSIGNED. Each one was
   read off the same card on jayco.com that carries the
   award's title, category and coach, then matched back
   to the row here on those three fields within its own
   model year — 58 of 63 on an exact string, the last
   five once a brand prefix, an &eacute; and an "of the
   Year" suffix were accounted for. All 63 rows carry a
   DISTINCT file: no badge is shared between two awards,
   which is the check that the pairing is real rather
   than a plausible-looking fill.

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

   `photo` IS OPTIONAL, and marks a featured award. A
   row that carries one renders as a wide photograph
   card with the badge and the award's name laid over
   it, two columns of the four on a desktop, beside
   two ordinary cards and staggered right, left, right
   down the year. The files are client photography
   supplied for 2026 in assets/awards/, served from the
   1000px and 1600px WebP copies in assets/awards/web/
   named `<file>-1000.webp` and `<file>-1600.webp`.
   `alt` describes the photograph, not the award — the
   card's text already names the award. `focus` is the
   object-position the crop holds on, because a 3:2
   photograph is cut to a much wider card.

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
        { award: 'RV of the Year',   by: 'RV News',     what: 'Jay Feather Air SL 15TBSL', note: 'Single Axle Travel Trailer', badge: '1502-img-15tbsl.webp', href: 'https://www.jayco.com/rvs/travel-trailers/2026-jay-feather-air-sl/15tbsl/' },
        { award: 'RV of the Year',   by: 'RV News',     what: 'Jay Flight SLX 265MWS',     note: 'Lightweight Travel Trailer', badge: '1503-img-265mws.webp', href: 'https://www.jayco.com/rvs/travel-trailers/2026-jay-flight-slx/265mws/' },
        { award: 'Must-See RV',      by: 'RV Business', what: 'Jay Flight SLX Sport 130BH', note: null, badge: '1483-img-must-see-rv.webp', href: 'https://www.jayco.com/rvs/travel-trailers/2026-jay-flight-slx/130bh/',
          photo: { file: '2026-rv-business-must-see', focus: '50% 72%',
                   alt: 'A Jay Flight SLX travel trailer parked in tall grass at dusk, a family sitting beside it' } },
        { award: "Reader's Choice",  by: 'RV Magazine', what: null, note: 'Gold — Favorite Travel Trailer', badge: '1506-img-gold.webp', href: 'https://www.jayco.com/rvs/travel-trailers/' },
        { award: "Reader's Choice",  by: 'RV Magazine', what: null, note: 'Gold — Favorite Tiny Trailer', badge: '1508-img-gold.webp', href: 'https://www.rv.com/rv/announcing-the-2025-wildsam-readers-choice-award-winners/' },
        { award: "Reader's Choice",  by: 'RV Magazine', what: null, note: 'Gold — Favorite Off-Road Trailer', badge: '1504-img-gold.webp', href: 'https://www.rv.com/rv/announcing-the-2025-wildsam-readers-choice-award-winners/',
          photo: { file: '2026-rv-magazine-favorite-off-road', focus: '50% 62%',
                   alt: 'A Jay Flight travel trailer with its awning out at a forest campsite, a family at the picnic table' } },
        { award: "Reader's Choice",  by: 'RV Magazine', what: null, note: 'Gold — Favorite Class B Motorhome', badge: '1509-img-gold.webp', href: 'https://www.jayco.com/rvs/class-b-motorhomes/' },
        { award: "Reader's Choice",  by: 'RV Magazine', what: null, note: 'Gold — Favorite Class C Motorhome', badge: '1510-img-gold.webp', href: 'https://www.jayco.com/rvs/class-c-motorhomes/' },
        { award: "Reader's Choice",  by: 'RV Magazine', what: null, note: 'Gold — Favorite 4x4 Motorhome', badge: '1511-img-gold.webp', href: 'https://www.rv.com/rv/announcing-the-2025-wildsam-readers-choice-award-winners/' },
        { award: "Reader's Choice",  by: 'RV Magazine', what: null, note: 'Silver — Favorite Fifth-Wheel', badge: '1505-img-silver.webp', href: 'https://www.jayco.com/rvs/fifth-wheels/' },
        { award: "Reader's Choice",  by: 'RV Magazine', what: null, note: 'Silver — Favorite Toy Hauler', badge: '1507-img-silver.webp', href: 'https://www.jayco.com/rvs/toy-haulers/' },
        { award: 'DSI Award',        by: 'RVDA',        what: null, note: 'Dealer Satisfaction Index — Jayco Towables', badge: '1481-img-dsi.webp', href: 'https://www.rvnews.com/rvda-honors-manufacturers-with-quality-circle-awards/',
          photo: { file: '2026-dsi-towables', focus: '50% 22%',
                   alt: 'A Jayco fifth wheel on the production line, a crew working on its roof' } },
        { award: 'DSI Award',        by: 'RVDA',        what: null, note: 'Dealer Satisfaction Index — Jayco Motorized', badge: '1482-img-dsi.webp', href: 'https://www.rvnews.com/rvda-honors-manufacturers-with-quality-circle-awards/' },
      ],
    },
    {
      year: 2025,
      rows: [
        { award: 'Top 10 Finalist',  by: 'RV Business', what: 'Eagle HT 230MLCS', note: 'RV of the Year', badge: '1475-img-rv-business-finalist-of-the-year.webp', href: 'https://www.jayco.com/rvs/travel-trailers/2026-eagle-ht-travel-trailers/230mlcs/',
          photo: { file: '2025-rv-business-rv-year-eagle', focus: '50% 58%',
                   alt: 'A Jayco Eagle fifth wheel with its awning out at a lakeside campsite, a family unloading bikes beside it' } },
        { award: 'Top Innovation',   by: 'RV Business', what: null, note: 'Water Filtration System — Jayco Towables', badge: '1476-img-2025-top-innovation.webp', href: 'https://www.youtube.com/watch?v=H3lQNYhKsVQ',
          photo: { file: '2025-rv-business-innovation-water', focus: '50% 30%',
                   alt: 'A father and two daughters washing dishes at the kitchen island of a Jayco RV' } },
        { award: "Reader's Choice",  by: 'Wildsam',     what: null, note: 'Gold — Favorite Travel Trailer', badge: '1472-img-rc-gold.webp', href: 'https://www.jayco.com/rvs/travel-trailers/' },
        { award: "Reader's Choice",  by: 'Wildsam',     what: null, note: 'Gold — Favorite Tiny Trailer', badge: '1470-img-rc-gold.webp', href: 'https://www.jayco.com/rvs/travel-trailers/' },
        { award: "Reader's Choice",  by: 'Wildsam',     what: null, note: 'Gold — Favorite Off-Road Trailer', badge: '1471-img-rc-gold.webp', href: 'https://www.jayco.com/rvs/travel-trailers/' },
        { award: "Reader's Choice",  by: 'Wildsam',     what: null, note: 'Gold — Favorite Class B Motorhome', badge: '1477-img-rc-gold.webp', href: 'https://www.jayco.com/rvs/class-b-motorhomes/',
          photo: { file: '2025-readers-choice-class-b-van', focus: '50% 50%',
                   alt: 'A Jayco Class B van with its sliding door open and the galley counter folded out, a picnic basket and a cutting board of vegetables on it' } },
        { award: "Reader's Choice",  by: 'Wildsam',     what: null, note: 'Gold — Favorite Class C Motorhome', badge: '1478-img-rc-gold.webp', href: 'https://www.jayco.com/rvs/class-c-motorhomes/' },
        { award: "Reader's Choice",  by: 'Wildsam',     what: 'Granite Ridge', note: 'Gold — Favorite 4x4 Motorhome', badge: '1479-img-rc-gold.webp', href: 'https://www.jayco.com/rvs/class-c-motorhomes/2025-granite-ridge/' },
        { award: "Reader's Choice",  by: 'Wildsam',     what: null, note: 'Silver — Favorite Fifth-Wheel', badge: '1474-img-rc-silver.webp', href: 'https://www.jayco.com/rvs/toy-haulers/' },
        { award: "Reader's Choice",  by: 'Wildsam',     what: null, note: 'Silver — Favorite Toy Hauler', badge: '1473-img-rc-silver.webp', href: 'https://www.jayco.com/rvs/toy-haulers/' },
        { award: 'DSI Award',        by: 'RVDA',        what: null, note: 'Dealer Satisfaction Index — Jayco Towables', badge: '1467-img-dsi-center-crop.webp', href: 'https://www.rvnews.com/rvda-honors-manufacturers-with-quality-circle-awards/' },
        { award: 'DSI Award',        by: 'RVDA',        what: null, note: 'Dealer Satisfaction Index — Jayco Motorized', badge: '1468-img-dsi-center-crop.webp', href: 'https://www.rvnews.com/rvda-honors-manufacturers-with-quality-circle-awards/' },
      ],
    },
    {
      year: 2024,
      rows: [
        { award: 'RV of the Year',   by: 'RV News',     what: 'Pinnacle 38FBRK',  note: 'Luxury Fifth Wheel', badge: '1120-img-rv-year-pinn.webp', href: 'https://www.jayco.com/rvs/fifth-wheels/2024-pinnacle/38fbrk/' },
        { award: 'RV of the Year',   by: 'RV News',     what: 'Jay Flight 235MBH', note: 'Entry Level Travel Trailer', badge: '1106-img-untitled-2-0005-jayco-jay-flight-235mbh.webp', href: 'https://www.jayco.com/rvs/travel-trailers/2024-jay-flight/235mbh/' },
        { award: 'Top Debut',        by: 'RV Business', what: 'Greyhawk XL 32U',  note: null, badge: '1105-img-untitled-2-0004-toprvdebut-2024.webp', href: 'https://www.jayco.com/rvs/class-c-motorhomes/2024-greyhawk-xl/32u/' },
        { award: "Reader's Choice",  by: 'RV Magazine', what: null, note: 'Gold — Favorite Tiny Travel Trailer', badge: '1110-img-untitled-2-0000-untitled-1-0002-rvm-2023-rca-gold.webp', href: 'https://www.jayco.com/rvs/travel-trailers/' },
        { award: "Reader's Choice",  by: 'RV Magazine', what: null, note: 'Gold — Favorite Class C Motorhome', badge: '1111-img-untitled-2-0000-untitled-1-0002-rvm-2023-rca-gold.webp', href: 'https://www.jayco.com/rvs/class-c-motorhomes/' },
        { award: "Reader's Choice",  by: 'RV Magazine', what: null, note: 'Silver — Favorite Fifth Wheel', badge: '1107-img-untitled-2-0001-untitled-1-0001-rvm-2023-rca-silver.webp', href: 'https://www.jayco.com/rvs/fifth-wheels/' },
        { award: "Reader's Choice",  by: 'RV Magazine', what: null, note: 'Silver — Favorite Toy Hauler', badge: '1109-img-untitled-2-0001-untitled-1-0001-rvm-2023-rca-silver.webp', href: 'https://www.jayco.com/rvs/toy-haulers/' },
        { award: "Reader's Choice",  by: 'RV Magazine', what: null, note: 'Bronze — Favorite Travel Trailer', badge: '1108-img-untitled-2-0006-untitled-1-0000-rvm-2023-rca-bronze.webp', href: 'https://www.jayco.com/rvs/travel-trailers/' },
        { award: "Reader's Choice",  by: 'RV Magazine', what: null, note: 'Bronze — Favorite 4x4 Motorhome', badge: '1112-img-untitled-2-0006-untitled-1-0000-rvm-2023-rca-bronze.webp', href: 'https://www.jayco.com/rvs/class-b-motorhomes/' },
        { award: 'DSI Award',        by: 'RVDA',        what: null, note: 'Dealer Satisfaction Index — Jayco Towables', badge: '1113-img-untitled-2-0002-dsi-logo-red-and-blue-2.webp', href: 'https://www.rvda.org/RVDA/Media/News_Releases/NewsReleases23/October/RVDA_Recognizes_Top-Rated_RV_Manufacturer_Brands_in_Dealer_Satisfaction_Index.aspx' },
        { award: 'DSI Award',        by: 'RVDA',        what: null, note: 'Dealer Satisfaction Index — Jayco Motorized', badge: '1114-img-untitled-2-0002-dsi-logo-red-and-blue-2.webp', href: 'https://www.rvda.org/RVDA/Media/News_Releases/NewsReleases23/October/RVDA_Recognizes_Top-Rated_RV_Manufacturer_Brands_in_Dealer_Satisfaction_Index.aspx' },
      ],
    },
    {
      year: 2023,
      rows: [
        { award: 'RV of the Year',   by: 'RV News',     what: 'North Point 380RKGS', note: 'High-End Fifth Wheel', badge: '837-img-25.webp', href: 'https://www.jayco.com/rvs/fifth-wheels/2023-north-point/380rkgs/' },
        { award: 'RV of the Year',   by: 'RV News',     what: 'Jay Feather Volaré',  note: 'Lightweight Travel Trailer', badge: '831-img-untitled-design-62.webp', href: 'https://rvbusiness.com/slideshow-jayco-unveils-volare-seneca-xt-at-homecoming/' },
        { award: 'RV of the Year',   by: 'RV News',     what: 'Seneca XT 35L',       note: 'Class C / Super C Motorhome', badge: '839-img-24.webp', href: 'https://www.jayco.com/rvs/class-c-motorhomes/2023-seneca-xt/35l/' },
        { award: 'Top 10 Finalist',  by: 'RV Business', what: 'Jay Feather Volaré',  note: 'RV of the Year', badge: '838-img-23.webp', href: 'https://www.jayco.com/newsroom/2022-Homecoming/' },
        { award: "Reader's Choice",  by: 'RV Magazine', what: null, note: 'Gold — Class C Manufacturer', badge: '832-img-18.webp', href: 'https://www.jayco.com/rvs/class-c-motorhomes/' },
        { award: "Reader's Choice",  by: 'RV Magazine', what: null, note: 'Silver — Small Camping Trailer Manufacturer', badge: '833-img-19.webp', href: 'https://www.jayco.com/rvs/travel-trailers/' },
        { award: "Reader's Choice",  by: 'RV Magazine', what: null, note: 'Bronze — Travel Trailer Manufacturer', badge: '834-img-20.webp', href: 'https://www.jayco.com/rvs/travel-trailers/' },
        { award: 'DSI Award',        by: 'RVDA',        what: null, note: 'Dealer Satisfaction Index — Jayco Towables', badge: '835-img-untitled-design-61.webp', href: 'http://www.rvda.org/RVDA/Media/News_Releases/NewsReleases22/October/RVDA_Recognizes_Top-Rated_RV_Manufacturer_Brands_in_Dealer_Satisfaction_Index__DSI__Survey_.aspx' },
        { award: 'DSI Award',        by: 'RVDA',        what: null, note: 'Dealer Satisfaction Index — Jayco Motorized', badge: '836-img-untitled-design-61.webp', href: 'http://www.rvda.org/RVDA/Media/News_Releases/NewsReleases22/October/RVDA_Recognizes_Top-Rated_RV_Manufacturer_Brands_in_Dealer_Satisfaction_Index__DSI__Survey_.aspx' },
      ],
    },
    {
      year: 2022,
      rows: [
        { award: 'RV of the Year',   by: 'RV News',     what: 'Pinnacle 38FLGS',            note: 'Luxury Fifth Wheel', badge: '828-img-15.webp', href: 'https://www.jayco.com/rvs/fifth-wheels/2022-pinnacle/38flgs/' },
        { award: 'Type B of the Year', by: 'RV News',   what: 'Terrain 19Y',                note: '2022 Type B', badge: '829-img-16.webp', href: 'https://www.jayco.com/rvs/class-b-motorhomes/2022-terrain/19y/' },
        { award: 'Best of 2022',     by: 'RV Pro',      what: 'North Point 340CKTS',        note: null, badge: '827-img-14.webp', href: 'https://www.jayco.com/rvs/fifth-wheels/2022-north-point/340ckts/' },
        { award: 'Top Debut',        by: 'RV Business', what: 'Eagle Fifth Wheel 335RDOK',  note: null, badge: '825-img-13.webp', href: 'https://www.jayco.com/rvs/fifth-wheels/2022-eagle-fifth-wheels/335rdok/' },
        { award: 'Top Debut',        by: 'RV Business', what: 'Terrain Class B Van',        note: null, badge: '826-img-13.webp', href: 'https://www.jayco.com/rvs/class-b-motorhomes/2022-terrain/' },
        { award: "Reader's Choice",  by: 'RV Magazine', what: null, note: 'Gold — Favorite Small Camping Trailer', badge: '823-img-11.webp', href: 'https://www.jayco.com/rvs/archives/2022/travel-trailers/' },
        { award: "Reader's Choice",  by: 'RV Magazine', what: null, note: 'Silver — Favorite Class C', badge: '824-img-12.webp', href: 'https://www.jayco.com/rvs/archives/2022/class-c-motorhomes/' },
      ],
    },
    {
      year: 2021,
      rows: [
        { award: 'RV of the Year',   by: 'RV News',      what: 'Jay Feather Micro 166FBS', note: 'Lightweight Travel Trailer', badge: '818-img-7.webp', href: 'https://www.jayco.com/rvs/travel-trailers/2021-jay-feather-micro/166fbs/' },
        { award: 'RV of the Year',   by: 'RV News',      what: 'Eagle 340DROK',            note: 'Luxury Travel Trailer', badge: '819-img-8.webp', href: 'https://www.jayco.com/rvs/travel-trailers/2021-eagle-travel-trailers/340drok/' },
        { award: 'RV of the Year',   by: 'RV News',      what: 'Jay Flight 34RLOK',        note: 'Mid-Priced Travel Trailer', badge: '820-img-10.webp', href: 'https://www.jayco.com/rvs/travel-trailers/2021-jay-flight/34rlok/' },
        { award: 'RV of the Year',   by: 'RV News',      what: 'Eagle Half-Ton 24RE',      note: 'Mid-Priced Fifth Wheel', badge: '821-img-9.webp', href: 'https://www.jayco.com/rvs/fifth-wheels/2021-eagle-ht-fifth-wheels/24re/' },
        { award: 'Must-See RV',      by: 'RV Business',  what: 'Eagle HT FW 24RE',         note: null, badge: '812-img-2.webp', href: 'https://www.jayco.com/rvs/fifth-wheels/2021-eagle-ht-fifth-wheels/24re/' },
        { award: 'Top 10 Debut',     by: 'RV Business',  what: 'Jay Feather Micro',        note: null, badge: '811-img-untitled-design-59.webp', href: 'https://www.jayco.com/rvs/travel-trailers/2021-jay-feather-micro/' },
        { award: 'Top 20 Debut',     by: 'RV Business',  what: 'Seneca Prestige',          note: null, badge: '813-img-3.webp', href: 'https://www.jayco.com/rvs/class-c-motorhomes/2021-seneca-prestige/' },
        { award: 'Top New RVs 2021', by: 'RV Pro',       what: 'Jay Feather Micro',        note: null, badge: '815-img-4.webp', href: 'https://www.jayco.com/rvs/travel-trailers/2021-jay-feather-micro/' },
        { award: 'Top New RVs 2021', by: 'RV Pro',       what: 'North Point 382FLRB',      note: null, badge: '816-img-4.webp', href: 'https://www.jayco.com/rvs/fifth-wheels/2021-north-point/382flrb/' },
        { award: "Reader's Choice",  by: 'Trailer Life', what: null, note: 'Bronze — Jayco Fifth Wheels', badge: '814-img-5.webp', href: 'https://www.jayco.com/rvs/fifth-wheels/' },
        { award: "Reader's Choice",  by: 'MotorHome',    what: null, note: 'Bronze — Class C Motorhome Lineup', badge: '817-img-6.webp', href: 'https://www.jayco.com/rvs/class-c-motorhomes/' },
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
