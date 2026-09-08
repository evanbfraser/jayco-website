/* ===================================================
   Jayco — Video library
   ---------------------------------------------------
   PROVENANCE. READ THIS BEFORE ADDING ANYTHING.

   Every id below is a real YouTube video on Jayco's own
   channel (@jayco, "JaycoRVs"), and every `title` is
   the video's actual title, not a description written
   here. Both were read from YouTube's oEmbed endpoint,
   the 11 originals on 2026-08-31 and the rest of the
   library on 2026-09-05:

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
   first. Everything here that carries no note is on
   Jayco's channel; the one block that is not says so
   over the top of itself, with the channel behind each
   id written out.

   WHAT IS HERE.
   All 67 videos jayco.com/videos/ embeds, read on
   2026-09-05, plus 3 that Jayco has since dropped from
   the page and that still play (the 2025 Jay Feather
   Air, the 2026 Pinnacle and the 2027 Greyhawk). 62 are
   Jayco's own; the last 8 are the "Jayco RV Reviews and
   Tours" band, filmed by other channels — see the note
   over that block.

   TITLES ARE COPIED, NOT TIDIED. Jayco's own titles
   carry the odd typo and double space — "Full Product
   Walkthrough- Jayco RV", "2+-3 Warranty" — and they
   are left exactly as the channel publishes them. The
   " - Jayco RV" suffix is trimmed for display in
   videos.js, not here.

   SHORTS. 22 of these are vertical Shorts, checked by
   requesting youtube.com/shorts/<id> and seeing whether
   it stays there or redirects to /watch. videos.js
   gives those a 9:16 player instead of 16:9 — a
   portrait film in a landscape box is two black bars
   and a stamp-sized picture.

   Thumbnails come from i.ytimg.com — maxresdefault is
   1280x720, with mqdefault as the 320x180 fallback
   wired in videos.js.

   NOTE ON THE LINEUP. `slug` is set only where the
   video's TITLE names a model this site carries, and
   videos.js checks window.JAYCO before linking. So
   Solstice carries none (it is newer than the 27 models
   in models-data.js), and neither do the questions —
   their titles ask about a class of RV, and the model
   is only named in the answer.
   =================================================== */

window.JAYCO_VIDEOS = {
  verified: '2026-09-05',
  channel: 'https://www.youtube.com/@jayco',

  categories: [
    { id: 'towable', name: 'Towable Walkthroughs' },
    { id: 'motorized', name: 'Motorized Walkthroughs' },
    { id: 'difference', name: 'The Jayco Difference' },
    { id: 'why', name: 'Why Buy a Jayco' },
    { id: 'owners', name: 'Owner Stories' },
    { id: 'questions', name: 'RV Questions' },
    { id: 'reviews', name: 'Reviews & Tours' },
  ],

  items: [
    /* ---- Towable walkthroughs ---- */
    { id: '9PF2Hs5L4OM', cat: 'towable', slug: 'eagle-sle-fw', year: 2027,
      title: '2027 Eagle SLE Fifth Wheel - Full Product Walkthrough - Jayco RV' },
    { id: 'sWDrIietbE4', cat: 'towable', slug: 'eagle-sle-fw', year: 2027,
      title: '2027 Eagle SLE Fifth Wheel - Product Preview - Jayco RV' },
    { id: 'wak5rFMdWlg', cat: 'towable', slug: 'seismic-tt', year: 2027,
      title: '2027 Seismic Toy Hauler Travel Trailer - Full Product Walkthrough - Jayco RV' },
    { id: 'RzWd0-bQIiA', cat: 'towable', slug: 'seismic-tt', year: 2027,
      title: '2027 Seismic Toy Hauler Travel Trailer - Product Preview - Jayco RV' },
    { id: 'topdFJog1eQ', cat: 'towable', slug: 'jay-feather-air', year: 2026,
      title: '2026 Jay Feather Air Travel Trailer - Full Product Walkthrough - Jayco RV' },
    { id: 'dxCRWMgGMiw', cat: 'towable', slug: 'jay-feather', year: 2026,
      title: '2026 Jay Feather Travel Trailer - Full Product Walkthrough - Jayco RV' },
    { id: '8leWGhYTHwI', cat: 'towable', slug: 'jay-flight-bungalow', year: 2026,
      title: '2026 Jay Flight Bungalow Jay Loft - Full Product Walkthrough - Jayco RV' },
    { id: '0Hp1fDPTwxM', cat: 'towable', slug: 'pinnacle', year: 2026,
      title: '2026 Pinnacle - Full Product Walkthrough - Jayco RV' },
    { id: 'LrkeHWCSkBc', cat: 'towable', slug: 'seismic-fw', year: 2026,
      title: '2026 Seismic 399 Toy Hauler - Full Product Walkthrough - Jayco RV' },
    { id: 'Hsm67pJ7y7c', cat: 'towable', slug: 'jay-feather-air', year: 2025,
      title: '2025 Jay Feather Air Travel Trailer - Full Product Walkthrough - Jayco RV' },

    /* ---- Motorized walkthroughs ---- */
    { id: 'Qqj5iuq4fr8', cat: 'motorized', slug: 'greyhawk', year: 2027,
      title: '2027 Greyhawk Class C Motorhome - Full Product Walkthrough - Jayco RV' },
    { id: 'lI9Upz9i3g8', cat: 'motorized', slug: 'seneca', year: 2027,
      title: '2027 Seneca Super Class C - Full Product Walkthrough  - Jayco RV' },
    { id: 'UjeTBTy4G00', cat: 'motorized', year: 2027,
      title: '2027 Solstice Class B Van - Full Product Walkthrough - Jayco RV' },
    { id: 'rMitKLaXLVs', cat: 'motorized', slug: 'alante-se', year: 2026,
      title: '2026 Alante SE Class A Motorhome - Full Product Walkthrough - Jayco RV' },
    { id: 'lEIr3SAuf2Q', cat: 'motorized', slug: 'comet', year: 2026,
      title: '2026 Comet Class B Van - Full Product Walkthrough - Jayco RV' },
    { id: '37CdBPFMG1g', cat: 'motorized', slug: 'greyhawk-xl', year: 2026,
      title: '2026 Greyhawk XL Super Class C Motorhome - Full Product Walkthrough - Jayco RV' },
    { id: 'lQv66p3Gk6Q', cat: 'motorized', slug: 'redhawk', year: 2026,
      title: '2026 Redhawk Class C Motorhome - Full Product Walkthrough- Jayco RV' },
    { id: 'sWunmfM7j7Q', cat: 'motorized', slug: 'redhawk-se', year: 2026,
      title: '2026 Redhawk SE Class C Motorhome - Full Product Walkthrough - Jayco RV' },
    { id: 'gyUHvnK_nU0', cat: 'motorized', slug: 'seneca-prestige', year: 2026,
      title: '2026 Seneca Prestige Super Class C Motorhome - Full Product Walkthrough - Jayco RV' },
    { id: 'uwFew5gawmU', cat: 'motorized', slug: 'seneca', year: 2026,
      title: '2026 Seneca Super Class C Motorhome - Full Product Walkthrough - Jayco RV' },
    { id: 'Tx-monMY3QE', cat: 'motorized', slug: 'seneca-xt', year: 2026,
      title: '2026 Seneca XT - Full Product Walkthrough - Jayco RV' },
    { id: '4NMjo1HqsKo', cat: 'motorized', year: 2026,
      title: '2026 Solstice Class B Van - Full Product Walkthrough - Jayco RV' },
    { id: 'lRd9mDowy8c', cat: 'motorized', slug: 'swift', year: 2026,
      title: '2026 Swift Class B Van - Full Product Walkthrough - Jayco RV' },

    /* ---- The Jayco Difference. Towables first, then motorhomes, in Jayco's
         own order. Fourteen of the fifteen are Shorts. ---- */
    { id: 'dQBxwqrSn-Y', cat: 'difference', short: true,
      title: 'JAYCOMMAND Smart RV System - The Jayco Difference, Towables - Jayco RV' },
    { id: 'V7zlRhZzrpw', cat: 'difference', short: true,
      title: 'JaySMART - The Jayco Difference, Towables - Jayco RV' },
    { id: 'o58t4ZTLpQU', cat: 'difference', short: true,
      title: 'Magnum Truss Roof System - The Jayco Difference, Towables - Jayco RV' },
    { id: 'VYm_kIRVHkM', cat: 'difference', short: true,
      title: 'RV Custom Frames - The Jayco Difference, Towables - Jayco RV' },
    { id: 'mEIQsliFLII', cat: 'difference', short: true,
      title: 'RV Custom Interior Design - The Jayco Difference, Towables - Jayco RV' },
    { id: '2-krjs6wV9A', cat: 'difference', short: true,
      title: 'Overlander Solar Packages - The Jayco Difference, Towables - Jayco RV' },
    { id: 'HcTNl1p8rpg', cat: 'difference', short: true,
      title: 'Additional RV Safety Features - The Jayco Difference, Towables - Jayco RV' },
    { id: 'QRMz5DKFDAs', cat: 'difference', short: true,
      title: 'The JRide Ride & Handling Package - The Jayco Difference, Motorized - Jayco RV' },
    { id: 'Rr9Aev3j1nQ', cat: 'difference', short: true,
      title: 'Stronghold VBL Laminated Walls - The Jayco Difference, Motorized - Jayco RV' },
    { id: 'NCL9aslk11Y', cat: 'difference',
      title: 'One-piece, Seamless Front Cap - The Jayco Difference, Motorized - Jayco RV' },
    { id: 'bNO1UlzcWBY', cat: 'difference', short: true,
      title: 'Third Brake Light & Rear Backup Camera - The Jayco Difference, Motorized - Jayco RV' },
    { id: 'iwBOOTfuJYI', cat: 'difference', short: true,
      title: 'Incredible Motorhome Bunk Ratings - The Jayco Difference, Motorized - Jayco RV' },
    { id: 'v82lekMm8cs', cat: 'difference', short: true,
      title: 'Higher Motorhome Resale Values - The Jayco Difference, Motorized - Jayco RV' },
    { id: 'tB5GYycnkhY', cat: 'difference', short: true,
      title: 'Motorhome Solar Power Prep & Packages - The Jayco Difference, Motorized - Jayco RV' },
    { id: 'GsTpMWThnUY', cat: 'difference', short: true,
      title: 'Catalytic Converter Theft Deterrent - The Jayco Difference, Motorized - Jayco RV' },

    /* ---- Why buy a Jayco ---- */
    { id: 'DLi3VOHvNCY', cat: 'why',
      title: 'Why Buy a Jayco RV - Over 50 Years of Proven Experience - Jayco RV' },
    { id: '2TdDuGQEHRQ', cat: 'why',
      title: 'Why Buy a Jayco RV - Extensive Dealer & Service Center Network - Jayco RV' },
    { id: 'CoTQ2Pcn1vk', cat: 'why',
      title: 'Why Buy a Jayco RV - Exceeds Industry Standards - Jayco RV' },
    { id: 'Ow5h3EuvUWc', cat: 'why',
      title: 'Why Buy a Jayco RV - 100% Dedicated PDI - Jayco RV' },
    { id: 'Q6B6KhvJj5E', cat: 'why',
      title: 'Why Buy a Jayco RV - Industry Leading 2+-3 Warranty - Jayco RV' },
    { id: '374N7y4da-M', cat: 'why',
      title: 'Industry Leading 2+3 Warranty - Jayco RV' },
    { id: 'EWg0cHHsCFI', cat: 'why',
      title: 'Extensive Dealer & Service Center Network - Jayco RV' },
    { id: 'AOKSDAfc3wo', cat: 'why',
      title: 'Exceeds Industry Standards - Jayco RV' },

    /* ---- Owner stories ---- */
    { id: '3GUuj65o1eM', cat: 'owners', slug: 'swift',
      title: 'Samantha Bose - Swift 20A - Owner Testimonials - Jayco RV' },
    { id: 'rVewi1gbaUc', cat: 'owners', slug: 'north-point',
      title: 'The Calls - North Point 377RLBH - Owner Testimonials - Jayco RV' },
    { id: 'PdfCkY8SgKc', cat: 'owners', slug: 'greyhawk',
      title: 'Michael Sapp - Greyhawk 29MV - Owner Testimonials - Jayco RV' },
    { id: 'G0JSVBDCIwc', cat: 'owners', slug: 'eagle-fw',
      title: 'The Walmers - Eagle HT FW 28.5RSTS - Owner Testimonials  - Jayco RV' },
    { id: 'y8f7UF1irVw', cat: 'owners', slug: 'eagle-fw',
      title: 'Andrea Vilani and Michael Rapp - Eagle Fifth Wheel 321RSTS - Owner Testimonials - Jayco RV' },
    { id: 'PzoHbQOGsi8', cat: 'owners', slug: 'seneca-prestige',
      title: 'The Walkers - Jayco Prestige 37M - Owner Testimonials - Jayco RV' },
    { id: 'Hg6PYjTT0Io', cat: 'owners', slug: 'redhawk',
      title: 'The Bautistas - Jayco Redhawk 24B - Owner Testimonials - Jayco RV' },
    { id: 'YyEu-mugShQ', cat: 'owners', slug: 'north-point',
      title: 'The Daigle Adventure Crew - North Point Fifth Wheel 377RLBH - Owner Testimonials - Jayco RV' },

    /* ---- Commonly asked questions. All eight are Shorts. ---- */
    { id: 'uFLY8M5tUGI', cat: 'questions', short: true,
      title: 'What is the Top-Rated Travel Trailer - Jayco RV' },
    { id: 'nrz2325w7ik', cat: 'questions', short: true,
      title: 'What is the Best Compact Class A Motorhome? - Jayco RV' },
    { id: 'qijpU8It2vo', cat: 'questions', short: true,
      title: 'What is the Best Fifth Wheel for Full-Time Living With a Family? - Jayco RV' },
    { id: 'de0Yn50I7TA', cat: 'questions', short: true,
      title: 'What is the Best Toy Hauler for Full-Time Living? - Jayco RV' },
    { id: 'o5YvDZiJ64k', cat: 'questions', short: true,
      title: 'What are the Top-Rated Small RV Trailers? - Jayco RV' },
    { id: '14D_Z7-qEu4', cat: 'questions', short: true,
      title: 'What is the Best Class B Motorhome? - Jayco RV' },
    { id: 'DI18XnCGmkw', cat: 'questions', short: true,
      title: 'What is the Best Camper for Long-Term Living? - Jayco RV' },
    { id: 'D6kULrxzX28', cat: 'questions', short: true,
      title: 'How Much Customization Do I have On My Class B Motorhome? - Jayco RV' },

    /* ---- Reviews & tours ----
       THE ONLY BLOCK ON THIS PAGE THAT IS NOT JAYCO'S OWN FILM. These are the
       eight jayco.com/videos/ carries under "Jayco RV Reviews and Tours", and
       every one is on someone else's channel — verified the same way as the
       rest, so what follows is what oEmbed reported for author_name:

         lyEqb46wRuA  Myles RVs
         O--FtXQnGMU  THATRVGIRL
         u9Y_y_t7HK0  Josh the RV Nerd at Bish's RV
         E3mCO0oUSJw  THATRVGIRL
         pw2Tw5stZvA  Myles RVs
         lN7PxNxj88M  Josh the RV Nerd at Bish's RV
         10fpXC-3ZXA  Camping World
         r1cLqWLIuC0  Apache Village RV Center

       They are shown without a byline, which is what jayco.com does and what
       was asked for here. The channel names are kept in this comment so the
       next person to read the file knows whose films these are; if a byline is
       ever wanted, it is a `channel` field on these eight and a line on the
       card. The page's own copy no longer says every film is Jayco's. ---- */
    { id: 'lyEqb46wRuA', cat: 'reviews', slug: 'jay-feather', year: 2026,
      title: 'Practical family camper, and we may need this soon! 2026 Jayco Jay Feather 27BH travel trailer RV' },
    { id: 'O--FtXQnGMU', cat: 'reviews', slug: 'jay-flight', year: 2026,
      title: 'GAME CHANGER! The 2026 Jayco Jay Flight 250BHW SPORT Bunkhouse Will Leave You SPEECHLESS!' },
    { id: 'u9Y_y_t7HK0', cat: 'reviews', slug: 'jay-feather-air', year: 2026,
      title: 'What did they DO to this?! 2026 Jayco Jay Feather Air 19MBS Compact Mini Camping Travel Trailer' },
    { id: 'E3mCO0oUSJw', cat: 'reviews', slug: 'jay-flight', year: 2026,
      title: 'BRAND NEW FLOORPLAN! 2026 Jayco Jay Flight 172DB SPORT Under 3,500LBS - No Slide, ALL WOW!' },
    { id: 'pw2Tw5stZvA', cat: 'reviews', slug: 'pinnacle', year: 2026,
      title: 'One of the BEST RVs in the world to live in full time, MASSIVE & LOADED 2026 Jayco Pinnacle 38FBRK' },
    { id: 'lN7PxNxj88M', cat: 'reviews', slug: 'jay-flight', year: 2026,
      title: 'Never camped before? Start with THIS! 2026 Jayco Jay Flight 250BH Travel Trailer' },
    { id: '10fpXC-3ZXA', cat: 'reviews', slug: 'jay-feather', year: 2026,
      title: 'Front Kitchen & Upscale Style! 2026 Jayco Jay Feather 26FK | RV Review' },
    { id: 'r1cLqWLIuC0', cat: 'reviews', slug: 'eagle-fw', year: 2026,
      title: 'JAYCO OPEN HOUSE!  NEW 2026 Jayco Eagle 335LSTS' },
  ],
};
