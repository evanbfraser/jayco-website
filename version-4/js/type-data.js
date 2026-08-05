/* ===================================================
   Jayco — RV type overview data
   ---------------------------------------------------
   One record per CATEGORY, keyed by the same id the
   category carries in models-data.js. type-page.js
   renders every section from these fields, so adding
   Class C is a data-only change.

   WHAT LIVES HERE AND WHAT DOES NOT
   • The lineup lists model SLUGS, never copies of the
     model records. Names, taglines, prices, renders and
     specs are read from window.JAYCO.models at render
     time — retyping them here is how two pages start
     quoting different prices for the same coach.
   • Photography and copy are per-category and live here.

   DATA PROVENANCE
   • Price and dimension ranges in the prose are derived
     from the four fifth wheel records in models-data.js
     ($52,643–$140,568 · 33–45 ft · sleeps up to 9), which
     are real 2027 "Starting at" figures from jayco.com.
   • The feature copy describes what a fifth wheel is —
     king-pin hitch geometry, a raised front deck, a
     pass-through basement — and each row is written to
     the photograph standing beside it. No claim here is
     made that its photo cannot show.
   =================================================== */

window.JAYCO_TYPE = (function () {
  'use strict';

  /* Both folder names contain a space — keep every path URL-encoded, the same
     way model-data.js handles `model details`. */
  const MEDIA = '../assets/model%20types/fifth%20wheel/web/';

  const fifthWheels = {
    id: 'fifth-wheels',
    name: 'Fifth Wheels',
    year: 2027,
    typeLabel: 'Towable',

    hero: {
      video:   MEDIA + 'fifth-wheel-hero.mp4',
      poster:  MEDIA + 'fifth-wheel-hero-poster.jpg',
      heading: 'Fifth Wheels',
      sub: 'Hitch it over the truck bed and tow a full-height home to the far end of the map.',
      ctas: [
        { label: 'Build & Price', href: '#', style: 'primary' },   /* v4 has no builder page yet */
        { label: 'Find a Dealer', href: 'index.html#dealer-locator', style: 'secondary' },
      ],
    },

    intro: {
      label: 'The Fifth Wheel Life',
      heading: 'The most home<br>you can tow.',
      body: [
        'A fifth wheel hitches inside the bed of a pickup rather than behind its bumper. That one change is what lets a towable stand two storeys at the front, run 45 feet long, and still track behind the truck like it belongs there.',
        'Jayco builds four of them, from the 33-foot Eagle SLE at $52,643 to the Pinnacle at $140,568 — sleeping up to nine, with as many as five slide-outs opening the main floor once you have parked.',
      ],
    },

    lineup: {
      label: 'The Lineup',
      heading: 'Four ways to tow one.',
      body: 'Every Jayco fifth wheel is a full-height coach with a front bedroom over the hitch. What changes down the range is length, weight and how much of it opens up when you stop.',
      models: ['eagle-sle-fw', 'eagle-fw', 'north-point', 'pinnacle'],
    },

    /* Two feature sections, outside then inside. Each is one full-bleed
       photograph under its headline, then four cards that arrive as the row
       scrolls into view. Card copy is the client's, verbatim. */
    featureSections: [
      {
        id: 'exterior',
        label: 'Exterior',
        heading: 'Built around<br>the hitch.',
        band: {
          src: MEDIA + 'ext-band.jpg',
          alt: 'A Jayco fifth wheel and its tow truck parked in an open field below a mountain ridge',
        },
        cards: [
          {
            title: 'More Confident Towing',
            body: 'The bed-mounted hitch places the connection over the truck’s rear axle for greater stability and tighter, more controlled turns.',
            image: { src: MEDIA + 'ext-towing.jpg', alt: 'A pickup towing a Jayco fifth wheel along a road lined with live oaks' },
          },
          {
            title: 'More Room at Camp',
            body: 'Slide-outs expand the living space after you park, giving you more room without adding width while towing.',
            image: { src: MEDIA + 'ext-camp.jpg', alt: 'A Jayco fifth wheel seen from above at a campsite, awning out over a mat and chairs' },
          },
          {
            title: 'Pass-Through Storage',
            body: 'Large exterior storage compartments keep chairs, tools and campsite gear accessible—and out of the living area.',
            image: { src: MEDIA + 'ext-storage.jpg', alt: 'Inside the pass-through storage bay of a Jayco fifth wheel, loaded with bags and gear' },
          },
          {
            title: 'Simplified Setup',
            body: 'Powered awnings, convenient exterior connections and available automatic leveling help you settle in faster.',
            image: { src: MEDIA + 'ext-setup.jpg', alt: 'A man stepping into a Jayco fifth wheel under its extended powered awning' },
          },
        ],
      },
      {
        id: 'interior',
        label: 'Interior',
        heading: 'Room to<br>actually live.',
        band: {
          src: MEDIA + 'int-band.jpg',
          alt: 'The main living area of a Jayco fifth wheel, looking past the dinette to the galley',
        },
        cards: [
          {
            title: 'Residential Living Space',
            body: 'Tall ceilings, wide slide rooms and comfortable seating create a space that feels more like a home than a trailer.',
            image: { src: MEDIA + 'int-living.jpg', alt: 'Sofa, dinette and windows in the living area of a Jayco fifth wheel' },
          },
          {
            title: 'A Private Front Bedroom',
            body: 'The raised front section creates a dedicated bedroom separated from the main living area.',
            image: { src: MEDIA + 'int-bedroom.jpg', alt: 'The front bedroom of a Jayco fifth wheel, with a made bed and an adjoining bathroom door' },
          },
          {
            title: 'A Kitchen Made for Real Meals',
            body: 'Generous counter space, ample storage and residential-style appliances make longer trips easier.',
            image: { src: MEDIA + 'int-kitchen.jpg', alt: 'The galley of a Jayco fifth wheel, with a range, microwave and island counter' },
          },
          {
            title: 'Roomier Bathrooms',
            body: 'Full bathrooms with spacious showers, storage and residential touches provide everyday comfort on the road.',
            image: { src: MEDIA + 'int-bathroom.jpg', alt: 'The bathroom of a Jayco fifth wheel, with a tiled walk-in shower and vanity' },
          },
        ],
      },
    ],

    quiz: {
      label: 'Find Your Match',
      /* two short lines: the text column is capped at 420px and the heading
         runs to ~55px, so "Which fifth wheel" alone would wrap */
      heading: 'Which one<br>is yours?',
      body: 'Four coaches, twelve feet of spread between the shortest and the longest. Answer a few questions and we will point you at the one built for how you travel.',
      cta: { label: 'Start the Quiz', href: '#' },
      /* A still from the hero footage, NOT the homepage's model-morph video —
         that clip is a Class B camper van, and DESIGN.md is explicit that the
         coach in the frame has to be the coach on the page. */
      image: {
        src: MEDIA + 'quiz-interior.jpg',
        alt: 'A family in the living area of a Jayco fifth wheel',
      },
    },

    faq: {
      label: 'Frequently Asked Questions',
      heading: 'Before you<br>hitch up.',
      items: [
        {
          q: 'What kind of truck do I need to tow a fifth wheel?',
          a: 'A pickup with a bed-mounted hitch and enough capacity for the pin weight as well as the trailer. Jayco fifth wheels run from about 9,400 pounds unloaded on the Eagle SLE to roughly 16,200 on the North Point, so the answer ranges from a well-specified half-ton at the light end to a one-ton dually at the top. Check your truck’s payload and towing figures against the model you are considering, and ask your dealer to confirm before you buy.',
        },
        {
          q: 'How is a fifth wheel different from a travel trailer?',
          a: 'Where it connects. A travel trailer uses a ball hitch behind the bumper; a fifth wheel uses a king pin mounted in the truck bed, over the rear axle. That puts the weight on the axle rather than behind it, which improves stability and tightens the turning circle — and it frees the space above the hitch for a raised front bedroom.',
        },
        {
          q: 'Which Jayco fifth wheel sleeps the most people?',
          a: 'North Point, at up to nine, across floorplans from 36 to 45 feet. Eagle Fifth Wheels sleep up to seven, Eagle SLE and Pinnacle up to six.',
        },
        {
          q: 'Can I use a fifth wheel in cold weather?',
          a: 'Jayco fifth wheels are built for a wide range of conditions, and cold-weather protection is one of the areas where packages differ between models. Availability changes by model year and floorplan, so confirm the exact specification with your dealer for the coach you are looking at.',
        },
        {
          q: 'Where can I see one in person?',
          a: 'Use the dealer locator to find an authorized Jayco dealer near you, check what they have on the lot and book a walkthrough. Standing inside one settles the length question faster than any floorplan drawing.',
        },
      ],
    },
  };

  return { 'fifth-wheels': fifthWheels };
}());
