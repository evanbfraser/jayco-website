/* ===================================================
   Jayco — Video library
   ---------------------------------------------------
   PROVENANCE. READ THIS BEFORE ADDING ANYTHING.

   Every id below is a real YouTube video on Jayco's own
   channel (@jayco, "JaycoRVs"), and every `title` is
   the video's actual title, not a description written
   here. Both were read from YouTube's oEmbed endpoint
   on 2026-08-31:

     https://www.youtube.com/oembed?url=<watch url>&format=json

   which returns the live title and author_name, and
   404s on an id that does not exist. That check is not
   ceremony. Two ids that a search engine returned with
   plausible titles — wYm2NH0BE20 and 3EmiOmCQimI, both
   "2022 Jay Feather Walkthrough" — came back 404, and
   would have shipped as two dead players. Three more
   (the JAYCOMMAND TechTip series) turned out to be on
   BMPRO's channel rather than Jayco's, and were dropped
   rather than passed off as Jayco's own.

   So: if you add a video, verify the id the same way
   first, and only keep it if author_name is JaycoRVs.

   Thumbnails come from i.ytimg.com — maxresdefault is
   1280x720 and present for all of these; mqdefault is
   the 320x180 fallback wired in videos.js.

   NOTE ON THE LINEUP. Solstice is not in models-data.js
   — it is newer than the 27 models this site carries —
   so those two cards carry no model link. `slug` is set
   only where the video's model really is in the lineup,
   and videos.js checks window.JAYCO before linking.
   =================================================== */

window.JAYCO_VIDEOS = {
  verified: '2026-08-31',
  channel: 'https://www.youtube.com/@jayco',

  categories: [
    { id: 'towable', name: 'Towable Walkthroughs' },
    { id: 'motorized', name: 'Motorized Walkthroughs' },
    { id: 'difference', name: 'The Jayco Difference' },
  ],

  items: [
    { id: 'topdFJog1eQ', cat: 'towable', slug: 'jay-feather-air', year: 2026,
      title: '2026 Jay Feather Air Travel Trailer - Full Product Walkthrough - Jayco RV' },
    { id: 'Hsm67pJ7y7c', cat: 'towable', slug: 'jay-feather-air', year: 2025,
      title: '2025 Jay Feather Air Travel Trailer - Full Product Walkthrough - Jayco RV' },
    { id: '0Hp1fDPTwxM', cat: 'towable', slug: 'pinnacle', year: 2026,
      title: '2026 Pinnacle - Full Product Walkthrough - Jayco RV' },
    { id: 'sWDrIietbE4', cat: 'towable', slug: 'eagle-sle-fw', year: 2027,
      title: '2027 Eagle SLE Fifth Wheel - Product Preview - Jayco RV' },

    { id: 'Qqj5iuq4fr8', cat: 'motorized', slug: 'greyhawk', year: 2027,
      title: '2027 Greyhawk Class C Motorhome - Full Product Walkthrough - Jayco RV' },
    { id: 'lRd9mDowy8c', cat: 'motorized', slug: 'swift', year: 2026,
      title: '2026 Swift Class B Van - Full Product Walkthrough - Jayco RV' },
    { id: 'lEIr3SAuf2Q', cat: 'motorized', slug: 'comet', year: 2026,
      title: '2026 Comet Class B Van - Full Product Walkthrough - Jayco RV' },
    { id: 'UjeTBTy4G00', cat: 'motorized', year: 2027,
      title: '2027 Solstice Class B Van - Full Product Walkthrough - Jayco RV' },
    { id: '4NMjo1HqsKo', cat: 'motorized', year: 2026,
      title: '2026 Solstice Class B Van - Full Product Walkthrough - Jayco RV' },

    /* Both published as YouTube Shorts, so they are vertical. videos.js gives
       the player a 9:16 frame for these instead of 16:9 — a portrait film in a
       landscape box is two black bars and a stamp-sized picture. */
    { id: 'dQBxwqrSn-Y', cat: 'difference', short: true,
      title: 'JAYCOMMAND Smart RV System - The Jayco Difference, Towables - Jayco RV' },
    { id: '2-krjs6wV9A', cat: 'difference', short: true,
      title: 'Overlander Solar Packages - The Jayco Difference, Towables - Jayco RV' },
  ],
};
