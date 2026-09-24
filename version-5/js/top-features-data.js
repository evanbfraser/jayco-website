/* ===================================================
   Jayco — Top features: the "Top Feature Gallery" on each
   jayco.com floorplan page
   ---------------------------------------------------
   Harvested 2026-09-24 from all 209 jayco.com floorplan
   pages. Each item is one photograph and Jayco's own
   caption, split at its "|" into a title and a line
   under it; `cat` is the Interior/Exterior tab Jayco
   files it under. Images re-encoded to WebP in
   assets/model details/top-features/<model>__<id>.webp.

   • `plans` lists which items each floorplan's page
     shows. A plan absent from it has no gallery on
     jayco.com (26 of 58 Jay Flight plans, the Jay
     Feather 33BH), and its page drops the section.
   • Gallery items that are a paint scheme or an
     interior decor are left out — the Decor & Paint
     section already shows those. That empties North
     Point, Pinnacle and Seismic, whose galleries are
     paint alone.
   =================================================== */

window.JAYCO_TOP_FEATURES = (function () {
  'use strict';
  const D = '../assets/model%20details/top-features/';
  const i = (id, title, body, cat, img, w, h) =>
    ({ id: id, title: title, body: body, cat: cat, img: D + img, w: w, h: h });

  return {
    'eagle-fw': {
      items: [
        i("342", "\"Blue Sync\" & MB Quart Speaker", "Stay connected and entertained with Blue Sync integration and premium MB Quart speakers, delivering seamless audio control and exceptional sound quality.", "Interior", "eagle-fw__342.webp", 1200, 600),
        i("343", "NuvoH20 Water Filtration System", "Enjoy cleaner, better-tasting water on every adventure with the NuvoH2O Water Filtration System, designed to help reduce sediment and hard water scale throughout your RV.", "Exterior", "eagle-fw__343.webp", 1200, 600),
        i("344", "30 in. x 22 in. Shower Skylight", "With built-in LED light", "Interior", "eagle-fw__344.webp", 1200, 600),
        i("409", "Exterior Speaker", "", "Exterior", "eagle-fw__409.webp", 1200, 600),
        i("410", "4 Star Handling Package Includes MORryde\u00ae CRE-3000\u2122 Rubberized Suspension", "", "Exterior", "eagle-fw__410.webp", 1200, 600),
        i("412", "Extra Large Windows for Views", "", "Exterior", "eagle-fw__412.webp", 1200, 600),
        i("413", "4 Star Handling Package Includes \"E\" Rated or \"H\" Rated Tires", "", "Exterior", "eagle-fw__413.webp", 1200, 600),
        i("414", "100% No Floor Vents", "", "Interior", "eagle-fw__414.webp", 1200, 600),
        i("415", "Dove Tail Drawers", "", "Interior", "eagle-fw__415.webp", 1200, 600),
        i("416", "Performance Furniture Fabric", "", "Interior", "eagle-fw__416.webp", 1200, 600),
        i("417", "Hardwood Cabinets and Drawer Fronts", "", "Interior", "eagle-fw__417.webp", 1200, 600),
        i("408", "Rear Ladder", "", "Exterior", "eagle-fw__408.webp", 1137, 900),
      ],
      plans: {
        "29ddb": ["342", "343", "344", "409", "410", "412", "413", "414", "415", "416", "417"],
        "29rlc": ["342", "343", "344", "409", "410", "412", "413", "414", "415", "416", "417"],
        "31qbh": ["342", "343", "344", "409", "410", "412", "413", "414", "415", "416", "417"],
        "28rlt": ["342", "343", "344", "409", "410", "412", "413", "414", "415", "416", "417"],
        "31rlt": ["342", "343", "344", "409", "410", "412", "413", "414", "415", "416", "417"],
        "321rsts": ["342", "343", "344", "408", "409", "410", "412", "413", "414", "415", "416", "417"],
        "335lsts": ["342", "343", "344", "408", "409", "410", "412", "413", "414", "415", "416", "417"],
        "365ukts": ["342", "343", "344", "408", "409", "410", "412", "413", "414", "415", "416", "417"],
        "367tbts": ["342", "343", "344", "408", "409", "410", "412", "413", "414", "415", "416", "417"],
        "360dbok": ["342", "343", "344", "408", "409", "410", "412", "413", "414", "415", "416", "417"],
        "355mbqs": ["342", "343", "344", "408", "409", "410", "412", "413", "414", "415", "416", "417"],
      },
    },
    'eagle-sle-fw': {
      items: [
        i("345", "MB Quart speakers", "Stay connected and entertained with Blue Sync integration and premium MB Quart speakers, delivering seamless audio control and exceptional sound quality.", "Interior", "eagle-sle-fw__345.webp", 1200, 600),
        i("346", "30 in. X 22 in Shower Skylight", "", "Interior", "eagle-sle-fw__346.webp", 1200, 600),
        i("347", "NUVOH20 filtration & Softening System", "Enjoy cleaner, better-tasting water on every adventure with the NuvoH2O Water Filtration System, designed to help reduce sediment and hard water scale throughout your RV.", "Exterior", "eagle-sle-fw__347.webp", 1200, 600),
        i("407", "Ladder Prep", "", "Exterior", "eagle-sle-fw__407.webp", 1200, 600),
        i("406", "Computer Desk", "30RLT Entertainment Center", "Interior", "eagle-sle-fw__406.webp", 1200, 600),
      ],
      plans: {
        "24mle": ["345", "346", "347", "407"],
        "28bhu": ["345", "346", "347", "407"],
        "28rks": ["345", "346", "347", "407"],
        "30rlt": ["406", "345", "346", "347", "407"],
      },
    },
    'eagle-tt': {
      items: [
        i("348", "MB Quart speakers", "Stay connected and entertained with Blue Sync integration and premium MB Quart speakers, delivering seamless audio control and exceptional sound quality.", "Interior", "eagle-tt__348.webp", 1200, 600),
        i("349", "Teak Seat Shower Prep", "Shower prep for an optional teak seat adds a touch of comfort and convenience, creating a more spa-like bathroom experience.", "Interior", "eagle-tt__349.webp", 1200, 600),
        i("350", "NuvoH20 Water Filtration System", "Enjoy cleaner, better-tasting water on every adventure with the NuvoH2O Water Filtration System, designed to help reduce sediment and hard water scale throughout your RV.", "Exterior", "eagle-tt__350.webp", 1200, 600),
        i("351", "30 in. x 22 in. Shower Skylight", "", "Interior", "eagle-tt__351.webp", 1200, 600),
        i("418", "Exterior Kitchen (Select Models)", "", "Exterior", "eagle-tt__418.webp", 1200, 711),
      ],
      plans: {
        "230mlcs": ["348", "349", "350", "351"],
        "265fkds": ["348", "349", "350", "351", "418"],
        "294ckbs": ["348", "349", "350", "351"],
        "312bhok": ["348", "349", "350", "351", "418"],
        "270ddbr": ["418"],
        "320mkts": ["348", "349", "350", "351"],
      },
    },
    'jay-feather': {
      items: [
        i("336", "MaxxAir Vent - Premier Package only", "Vent fan in living room and bathroom", "Interior", "jay-feather__336.webp", 1200, 800),
        i("337", "Solid-surface countertop - Premier Package only", "Available with the Premier Package", "Interior", "jay-feather__337.webp", 1131, 900),
        i("338", "Multi-function \"All in One\" black stainless steel kitchen sink - Premier Package Only", "Available with the Premier Package", "Interior", "jay-feather__338.webp", 921, 900),
        i("340", "Power 5-point stabilization system - Premier Package only", "Available with the Premier Package", "Exterior", "jay-feather__340.webp", 1200, 800),
      ],
      plans: {
        "18rbf": ["336", "337", "338", "340"],
        "19mrk": ["336", "337", "338", "340"],
        "21mml": ["336", "337", "338", "340"],
        "21mbh": ["336", "337", "338", "340"],
        "23rk": ["336", "337", "338", "340"],
        "25rb": ["336", "337", "338", "340"],
        "25bh": ["336", "337", "338", "340"],
        "23mbd": ["336", "337", "338", "340"],
        "24fk": ["336", "337", "338", "340"],
        "27bh": ["336", "337", "338", "340"],
        "29bhb": ["336", "337", "338", "340"],
        "27mk": ["336", "337", "338", "340"],
        "26fk": ["336", "337", "338", "340"],
        "30rkb": ["336", "337", "338", "340"],
        "29qbh": ["336", "337", "338", "340"],
      },
    },
    'jay-feather-air': {
      items: [
        i("341", "Jay Feather Air Travel Trailer Exterior", "", "Exterior", "jay-feather-air__341.webp", 1060, 721),
        i("401", "Jay Feather Air Baja Package Stabilizer", "", "Exterior", "jay-feather-air__401.webp", 1200, 800),
        i("402", "Jay Feather Air Baja Package Tire", "", "Exterior", "jay-feather-air__402.webp", 1200, 800),
      ],
      plans: {
        "15mrb": ["341", "401", "402"],
        "16db": ["341", "401", "402"],
        "16rb": ["341", "401", "402"],
        "19mbs": ["341", "401", "402"],
        "18fbs": ["341", "401", "402"],
      },
    },
    'jay-feather-sl': {
      items: [
        i("405", "2027 Jay Feather SL Travel Trailer Ladder Prep", "", "Exterior", "jay-feather-sl__405.webp", 1200, 731),
      ],
      plans: {
        "25rlsl": ["405"],
        "26bhsl": ["405"],
      },
    },
    'jay-flight': {
      items: [
        i("403", "Jay Flight Travel Trailer Elite Package Aluminum Rims", "", "Interior", "jay-flight__403.webp", 1200, 800),
        i("404", "Jay Flight Travel Trailer Elite Package Pull-Out Kitchen Faucet", "", "Interior", "jay-flight__404.webp", 1200, 800),
      ],
      plans: {
        "210qb": ["403", "404"],
        "260bh": ["403", "404"],
        "210qbw": ["403", "404"],
        "260bhw": ["403", "404"],
        "211mbw": ["403", "404"],
        "200mks": ["403", "404"],
        "245bhs": ["403", "404"],
        "261bhs": ["403", "404"],
        "262rls": ["403", "404"],
        "200mksw": ["403", "404"],
        "265mws": ["403", "404"],
        "225mls": ["403", "404"],
        "263bhs": ["403", "404"],
        "245bhsw": ["403", "404"],
        "265th": ["404"],
        "261bhsw": ["403", "404"],
        "262rlsw": ["403", "404"],
        "265mwsw": ["403", "404"],
        "225mlsw": ["403", "404"],
        "263bhsw": ["403", "404"],
        "280bhs": ["403", "404"],
        "330tbs": ["403", "404"],
        "295tbs": ["403", "404"],
        "321bds": ["403", "404"],
        "290rls": ["403", "404"],
        "325bht": ["403", "404"],
        "380dqs": ["403", "404"],
        "333bts": ["403", "404"],
        "334rts": ["403", "404"],
        "270mks": ["403", "404"],
        "280bhsw": ["403", "404"],
        "335bhs": ["403", "404"],
      },
    },
  };
}());
