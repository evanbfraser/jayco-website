/* ===================================================
   Jayco — Top-selling RVs
   ---------------------------------------------------
   PROVENANCE. jayco.com/top-selling-rvs/, read on
   2026-09-06. Jayco publishes this as a sales-sheet
   library: three model years, each grouped by product
   type, each model a downloadable PDF. The years, the
   grouping, the model names and the sheets themselves
   are all Jayco's — nothing here is a selection made by
   this build, and "top-selling" is Jayco's claim on its
   own page rather than one invented for this site.

   WHAT WAS BROUGHT OVER
   51 sheets and the render that sits above each one,
   under assets/top-selling/. The PDFs are the point of
   the page: a Download Sales Sheet button that 404s is
   worse than no button, so they are committed rather
   than hotlinked to jayco.com.

   LEARN MORE, AND WHERE IT GOES
   `slug` is set where the model is one of the 27 in
   models-data.js, and the button goes to its page.
   Melbourne Prestige is Jayco's but not in that set,
   and "Seismic" names the series rather than either of
   the two Seismic models here — both fall back to their
   product type's page, which is a real answer rather
   than a dead link.

   A MODEL APPEARS ONCE PER YEAR IT IS PUBLISHED FOR,
   and its `key` carries that year: the 2027 Pinnacle
   sheet is not the 2025 one, and they are different
   files under the same model name.
   =================================================== */

window.JAYCO_TOP_SELLING = {
  read: '2026-09-06',
  source: 'https://www.jayco.com/top-selling-rvs/',

  /* The Reading section's three posts, by slug into js/blog-data.js. Named
     here rather than picked by a rule at render — see the note in build_ts.py
     for what the rule was and why it was dropped. */
  reading: ["choosing-a-home-that-could-grow-with-our-family", "discover-rvs-floorplans-class-c-motorhomes", "rv-storage-tips-and-solutions"],

  years: [
    { year: "2027", groups: [
      { cat: "Travel Trailers", id: "travel-trailers", models: [
        { name: "Jay Feather Air", key: "jay-feather-air-2027", slug: "jay-feather-air" },
        { name: "Jay Flight SLX", key: "jay-flight-slx-2027", slug: "jay-flight" },
        { name: "Eagle HT Travel Trailers", key: "eagle-ht-travel-trailers-2027", slug: "eagle-tt" },
      ] },
      { cat: "Destination Travel Trailers", id: "destination", models: [
        { name: "Jay Flight Bungalow", key: "jay-flight-bungalow-2027", slug: "jay-flight-bungalow" },
      ] },
      { cat: "Fifth Wheels", id: "fifth-wheels", models: [
        { name: "Eagle HT Fifth Wheels", key: "eagle-ht-fifth-wheels-2027", slug: "eagle-fw" },
        { name: "North Point", key: "north-point-2027", slug: "north-point" },
        { name: "Pinnacle", key: "pinnacle-2027", slug: "pinnacle" },
      ] },
      { cat: "Class B Motorhomes", id: "class-b", models: [
        { name: "Swift", key: "swift-2027", slug: "swift" },
        { name: "Terrain", key: "terrain-2027", slug: "terrain" },
      ] },
      { cat: "Class C Motorhomes", id: "class-c", models: [
        { name: "Greyhawk", key: "greyhawk-2027", slug: "greyhawk" },
        { name: "Redhawk SE", key: "redhawk-se-2027", slug: "redhawk-se" },
        { name: "Redhawk", key: "redhawk-2027", slug: "redhawk" },
        { name: "Melbourne Prestige", key: "melbourne-prestige-2027" },
        { name: "Seneca XT", key: "seneca-xt-2027", slug: "seneca-xt" },
        { name: "Seneca", key: "seneca-2027", slug: "seneca" },
      ] },
      { cat: "Class A Motorhomes", id: "class-a", models: [
        { name: "Alante SE", key: "alante-se-2027", slug: "alante-se" },
        { name: "Alante", key: "alante-2027", slug: "alante" },
      ] },
    ] },
    { year: "2026", groups: [
      { cat: "Travel Trailers", id: "travel-trailers", models: [
        { name: "Jay Feather Air", key: "jay-feather-air-2026", slug: "jay-feather-air" },
        { name: "Jay Flight SLX", key: "jay-flight-slx-2026", slug: "jay-flight" },
      ] },
      { cat: "Destination Travel Trailers", id: "destination", models: [
        { name: "Jay Flight Bungalow", key: "jay-flight-bungalow-2026", slug: "jay-flight-bungalow" },
      ] },
      { cat: "Fifth Wheels", id: "fifth-wheels", models: [
        { name: "North Point", key: "north-point-2026", slug: "north-point" },
        { name: "Pinnacle", key: "pinnacle-2026", slug: "pinnacle" },
      ] },
      { cat: "Toy Haulers", id: "toy-haulers", models: [
        { name: "Seismic", key: "seismic-2026" },
      ] },
      { cat: "Class B Motorhomes", id: "class-b", models: [
        { name: "Swift", key: "swift-2026", slug: "swift" },
        { name: "Terrain", key: "terrain-2026", slug: "terrain" },
      ] },
      { cat: "Class C Motorhomes", id: "class-c", models: [
        { name: "Greyhawk", key: "greyhawk-2026", slug: "greyhawk" },
        { name: "Redhawk SE", key: "redhawk-se-2026", slug: "redhawk-se" },
        { name: "Redhawk", key: "redhawk-2026", slug: "redhawk" },
        { name: "Melbourne Prestige", key: "melbourne-prestige-2026" },
        { name: "Seneca XT", key: "seneca-xt-2026", slug: "seneca-xt" },
        { name: "Seneca", key: "seneca-2026", slug: "seneca" },
      ] },
      { cat: "Class A Motorhomes", id: "class-a", models: [
        { name: "Alante SE", key: "alante-se-2026", slug: "alante-se" },
        { name: "Alante", key: "alante-2026", slug: "alante" },
      ] },
    ] },
    { year: "2025", groups: [
      { cat: "Travel Trailers", id: "travel-trailers", models: [
        { name: "Jay Feather Air", key: "jay-feather-air-2025", slug: "jay-feather-air" },
        { name: "Jay Flight SLX", key: "jay-flight-slx-2025", slug: "jay-flight" },
        { name: "Eagle HT Travel Trailers", key: "eagle-ht-travel-trailers-2025", slug: "eagle-tt" },
      ] },
      { cat: "Destination Travel Trailers", id: "destination", models: [
        { name: "Jay Flight Bungalow", key: "jay-flight-bungalow-2025", slug: "jay-flight-bungalow" },
      ] },
      { cat: "Fifth Wheels", id: "fifth-wheels", models: [
        { name: "Eagle HT Fifth Wheels", key: "eagle-ht-fifth-wheels-2025", slug: "eagle-fw" },
        { name: "North Point", key: "north-point-2025", slug: "north-point" },
        { name: "Pinnacle", key: "pinnacle-2025", slug: "pinnacle" },
      ] },
      { cat: "Toy Haulers", id: "toy-haulers", models: [
        { name: "Seismic", key: "seismic-2025" },
      ] },
      { cat: "Class B Motorhomes", id: "class-b", models: [
        { name: "Swift", key: "swift-2025", slug: "swift" },
        { name: "Terrain", key: "terrain-2025", slug: "terrain" },
      ] },
      { cat: "Class C Motorhomes", id: "class-c", models: [
        { name: "Greyhawk", key: "greyhawk-2025", slug: "greyhawk" },
        { name: "Redhawk SE", key: "redhawk-se-2025", slug: "redhawk-se" },
        { name: "Redhawk", key: "redhawk-2025", slug: "redhawk" },
        { name: "Melbourne Prestige", key: "melbourne-prestige-2025" },
        { name: "Seneca XT", key: "seneca-xt-2025", slug: "seneca-xt" },
        { name: "Seneca", key: "seneca-2025", slug: "seneca" },
      ] },
      { cat: "Class A Motorhomes", id: "class-a", models: [
        { name: "Alante SE", key: "alante-se-2025", slug: "alante-se" },
        { name: "Alante", key: "alante-2025", slug: "alante" },
      ] },
    ] },
  ],
};
