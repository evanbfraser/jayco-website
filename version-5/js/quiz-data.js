/* ===================================================
   Jayco — RV Selector Quiz data
   ---------------------------------------------------
   Everything the quiz needs that is NOT already a fact
   in models-data.js or build-data.js: the question
   flow, the scoring weights, the category adjacency
   graph, and one row per model line carrying the three
   vocabularies that have to agree.

   SOURCE. Adapted from `jayco-rv-models.json` at the
   repo root, which stays there as the editorial master
   and is NOT loaded at runtime. It is JSON here as JS
   for two reasons: fetch() fails under file:// and
   every page in this repo opens by double-click today,
   and every other data file in version-5 is a
   window.X = (function(){…}()) module. quiz-score.js
   reads JAYCO_QUIZ.lines and never names a line, which
   is what the spec's "do not hard-code model names in
   components" actually asks for.

   WHAT IS DELIBERATELY NOT HERE
   • sleeps — derived from build-data.js at runtime.
     The source JSON's ranges contradict the real 2027
     floorplans on 18 of 31 lines; Jay Feather SL is
     listed 2–4 and its plans sleep 6–10. Two models
     publish no per-plan sleeps at all (terrain,
     seneca-prestige) and fall back to the "Up to N" in
     models-data.js — see deriveSleeps() in
     quiz-score.js.
   • category — read from JAYCO.models[slug].category.
     That is the single source of truth, and it fixes
     the source JSON's Super C problem for free: the
     JSON files all three Senecas under type class_c
     with Super C surviving only as free text, while
     this site treats super-c as a first-class category
     with its own homepage chip.
   • price and tier bands — computed from real MSRP at
     score time. See `weights.budget` below.

   PROVENANCE, and it matters for the copy. tier,
   campStyleFit and cadenceFit are authored judgements
   — the source JSON says so itself ("sensible
   defaults"). They are NOT Jayco-published facts, and
   the result screen must not present them as Jayco's
   claims. Anything quoted as a number on screen comes
   from models-data.js or build-data.js instead.

   DROPPED. Solstice, Melbourne, Melbourne Prestige and
   Granite Ridge are in the source JSON's 2026 lineup
   but have no 2027 record — no render, no MSRP, no
   page. A quiz should not recommend something the site
   cannot show. All four are premium motorhomes, which
   is why the budget axis scores on price rank rather
   than the tier word; see weights.budget.
   =================================================== */

window.JAYCO_QUIZ = (function () {
  'use strict';

  /* Bump `version` whenever a question is added, removed, reordered, or an
     option token is renamed. Shared result links carry it, and quiz.js refuses
     to decode a link from a different version rather than silently resolving
     the same tokens against different questions. Failing loudly is the whole
     point of the field. */
  const meta = { version: 1 };

  /* The tunable config the spec asks for, so marketing can re-weight without a
     redesign. Integers, so ties are exact and a score is debuggable by hand. */
  const weights = {
    /* Highest, per the spec — but scored against the model's real MSRP rank
       inside the surviving pool, NOT the `tier` word below. The source JSON's
       tiers contradict real prices (Greyhawk XL is "mid" at $277,050, dearer
       than Precept at "premium" $227,693) and most categories are missing at
       least one tier entirely. A price rank is never empty, so this axis can
       never be the thing that leaves a shopper with no result. */
    budget: 40,
    capacity: 24,
    campStyle: 14,
    cadence: 14,
    /* Motorized only, and only once MQ2 has been answered. */
    towHeadroom: 8,
    /* The authored tier, kept as a nudge so the editorial judgement still
       counts for something without being able to override real money. */
    tierAgreement: 6,
    /* Applied only when a minimum sleeps figure is actually known. */
    oversizePenalty: -10,
    /* Large enough that any un-relaxed candidate outranks any relaxed one,
       whatever the other axes say. */
    relaxationPenalty: -1000,
  };

  /* Which categories may stand in for which when a filter has to be relaxed.
     Declared, never inferred from price or size — "what is a reasonable
     alternative to a Class B" is a product judgement, and a graph in the data
     is reviewable in a way a heuristic is not. Directional on purpose: a
     Class B shopper who needs more beds moves up to a Class C, but a Class C
     shopper is not pushed down into a van. */
  const adjacency = {
    'class-b': ['class-c'],
    'class-c': ['super-c', 'class-a'],
    'class-a': ['super-c'],
    'super-c': ['class-a'],
    'travel-trailers': ['fifth-wheels'],
    'fifth-wheels': ['travel-trailers'],
    'toy-haulers': ['travel-trailers', 'fifth-wheels'],
    'destination': ['travel-trailers'],
  };

  /* Tow-vehicle capability ranks. A line is eligible only when its required
     rank is <= the user's. `delivered` (the Bungalow, which is sited rather
     than towed) is exempt and handled separately in quiz-score.js. */
  const towRank = {
    suv: 1,
    half_ton: 2,
    three_quarter_ton: 3,
    one_ton: 4,
  };

  /* ---------- The lines ----------
     One row, three vocabularies, aligned in one column so the whole join can be
     eyeballed at once:
       line       — the source JSON's editorial name
       slug       — the key in models-data.js / build-data.js
       dealerName — the exact string in dealer-data.js `models[]`

     The three do not agree, and none of it is string-matchable. models-data
     says "Eagle Fifth Wheels" where the dealers say "Eagle Fifth Wheel"; it
     says "Seismic Travel Trailer Toy Hauler" where they say "Seismic Travel
     Trailer". Every slug is stated explicitly rather than derived.

     dealerFallback names the sibling those same dealers actually stock, and it
     is present on exactly the five lines Jayco's own dealer directory barely
     mentions. Counted against the 428 harvested records on 2026-08-03:

       Alante SE               0 dealers   -> Alante              (254)
       Jay Feather SL          1           -> Jay Feather         (367)
       Seismic Travel Trailer  1           -> Seismic Fifth Wheel (363)
       Eagle SLE FW            2           -> Eagle Fifth Wheel   (367)
       Jay Feather Air SL      2           -> Jay Feather Air     (354)

     Everything else sits at 249 or more, so the split is not a judgement call.
     Linking the thin ones straight through would tell a shopper "nobody near
     you sells this", which is a gap in the harvest presented as a fact about
     the market. Re-run the count when dealer-data.js is next refreshed. */
  const lines = [

    /* ---- Motorized ---- */
    { line: 'Comet', slug: 'comet', dealerName: 'Comet',
      family: 'motorized', towVehicle: null, tier: 'value', toyHauler: false,
      campStyleFit: ['mixed', 'offgrid'], cadenceFit: ['weekend', 'extended'] },

    { line: 'Swift', slug: 'swift', dealerName: 'Swift',
      family: 'motorized', towVehicle: null, tier: 'value', toyHauler: false,
      campStyleFit: ['mixed', 'offgrid'], cadenceFit: ['weekend', 'extended'] },

    { line: 'Terrain', slug: 'terrain', dealerName: 'Terrain',
      family: 'motorized', towVehicle: null, tier: 'premium', toyHauler: false,
      campStyleFit: ['offgrid', 'mixed'], cadenceFit: ['weekend', 'extended'] },

    { line: 'Redhawk SE', slug: 'redhawk-se', dealerName: 'Redhawk SE',
      family: 'motorized', towVehicle: null, tier: 'value', toyHauler: false,
      campStyleFit: ['mixed'], cadenceFit: ['weekend', 'extended'] },

    { line: 'Redhawk', slug: 'redhawk', dealerName: 'Redhawk',
      family: 'motorized', towVehicle: null, tier: 'value', toyHauler: false,
      campStyleFit: ['mixed', 'hookups'], cadenceFit: ['weekend', 'extended'] },

    { line: 'Greyhawk', slug: 'greyhawk', dealerName: 'Greyhawk',
      family: 'motorized', towVehicle: null, tier: 'mid', toyHauler: false,
      campStyleFit: ['mixed', 'hookups'], cadenceFit: ['weekend', 'extended'] },

    { line: 'Greyhawk XL', slug: 'greyhawk-xl', dealerName: 'Greyhawk XL',
      family: 'motorized', towVehicle: null, tier: 'mid', toyHauler: false,
      campStyleFit: ['mixed', 'hookups'], cadenceFit: ['extended', 'fulltime'] },

    { line: 'Seneca XT', slug: 'seneca-xt', dealerName: 'Seneca XT',
      family: 'motorized', towVehicle: null, tier: 'premium', toyHauler: false,
      campStyleFit: ['mixed', 'hookups'], cadenceFit: ['extended', 'fulltime'] },

    { line: 'Seneca', slug: 'seneca', dealerName: 'Seneca',
      family: 'motorized', towVehicle: null, tier: 'premium', toyHauler: false,
      campStyleFit: ['mixed', 'hookups'], cadenceFit: ['extended', 'fulltime'] },

    { line: 'Seneca Prestige', slug: 'seneca-prestige', dealerName: 'Seneca Prestige',
      family: 'motorized', towVehicle: null, tier: 'premium', toyHauler: false,
      campStyleFit: ['hookups', 'mixed'], cadenceFit: ['fulltime', 'extended'] },

    /* Zero dealers carry the "Alante SE" string; 254 carry "Alante". */
    { line: 'Alante SE', slug: 'alante-se', dealerName: 'Alante SE', dealerFallback: 'Alante',
      family: 'motorized', towVehicle: null, tier: 'value', toyHauler: false,
      campStyleFit: ['mixed', 'hookups'], cadenceFit: ['extended'] },

    { line: 'Alante', slug: 'alante', dealerName: 'Alante',
      family: 'motorized', towVehicle: null, tier: 'value', toyHauler: false,
      campStyleFit: ['mixed', 'hookups'], cadenceFit: ['extended', 'fulltime'] },

    { line: 'Precept', slug: 'precept', dealerName: 'Precept',
      family: 'motorized', towVehicle: null, tier: 'premium', toyHauler: false,
      campStyleFit: ['hookups', 'mixed'], cadenceFit: ['extended', 'fulltime'] },

    { line: 'Precept Prestige', slug: 'precept-prestige', dealerName: 'Precept Prestige',
      family: 'motorized', towVehicle: null, tier: 'premium', toyHauler: false,
      campStyleFit: ['hookups'], cadenceFit: ['fulltime', 'extended'] },

    /* ---- Towable ---- */
    { line: 'Jay Feather Air SL', slug: 'jay-feather-air-sl',
      dealerName: 'Jay Feather Air SL', dealerFallback: 'Jay Feather Air',
      family: 'towable', towVehicle: 'suv', tier: 'value', toyHauler: false,
      campStyleFit: ['offgrid', 'mixed'], cadenceFit: ['weekend', 'extended'] },

    { line: 'Jay Feather SL', slug: 'jay-feather-sl',
      dealerName: 'Jay Feather SL', dealerFallback: 'Jay Feather',
      family: 'towable', towVehicle: 'suv', tier: 'value', toyHauler: false,
      campStyleFit: ['offgrid', 'mixed'], cadenceFit: ['weekend', 'extended'] },

    { line: 'Jay Feather Air', slug: 'jay-feather-air', dealerName: 'Jay Feather Air',
      family: 'towable', towVehicle: 'half_ton', tier: 'mid', toyHauler: false,
      campStyleFit: ['mixed', 'offgrid'], cadenceFit: ['weekend', 'extended'] },

    { line: 'Jay Feather', slug: 'jay-feather', dealerName: 'Jay Feather',
      family: 'towable', towVehicle: 'half_ton', tier: 'mid', toyHauler: false,
      campStyleFit: ['mixed', 'offgrid'], cadenceFit: ['weekend', 'extended'] },

    { line: 'Jay Flight', slug: 'jay-flight', dealerName: 'Jay Flight',
      family: 'towable', towVehicle: 'half_ton', tier: 'value', toyHauler: false,
      campStyleFit: ['mixed', 'hookups'], cadenceFit: ['weekend', 'extended'] },

    { line: 'Eagle', slug: 'eagle-tt', dealerName: 'Eagle Travel Trailer',
      family: 'towable', towVehicle: 'half_ton', tier: 'premium', toyHauler: false,
      campStyleFit: ['hookups', 'mixed'], cadenceFit: ['extended', 'fulltime'] },

    /* Sited by the dealer rather than towed, so it is exempt from the tow gate
       and only surfaces for a full-time answer. */
    { line: 'Jay Flight Bungalow', slug: 'jay-flight-bungalow', dealerName: 'Jay Flight Bungalow',
      family: 'towable', towVehicle: 'delivered', tier: 'mid', toyHauler: false,
      campStyleFit: ['hookups'], cadenceFit: ['fulltime'] },

    { line: 'Eagle SLE', slug: 'eagle-sle-fw',
      dealerName: 'Eagle SLE FW', dealerFallback: 'Eagle Fifth Wheel',
      family: 'towable', towVehicle: 'three_quarter_ton', tier: 'value', toyHauler: false,
      campStyleFit: ['mixed', 'hookups'], cadenceFit: ['extended'] },

    { line: 'Eagle Fifth Wheel', slug: 'eagle-fw', dealerName: 'Eagle Fifth Wheel',
      family: 'towable', towVehicle: 'three_quarter_ton', tier: 'mid', toyHauler: false,
      campStyleFit: ['mixed', 'hookups'], cadenceFit: ['extended', 'fulltime'] },

    { line: 'North Point', slug: 'north-point', dealerName: 'North Point',
      family: 'towable', towVehicle: 'one_ton', tier: 'premium', toyHauler: false,
      campStyleFit: ['hookups'], cadenceFit: ['extended', 'fulltime'] },

    { line: 'Pinnacle', slug: 'pinnacle', dealerName: 'Pinnacle',
      family: 'towable', towVehicle: 'one_ton', tier: 'premium', toyHauler: false,
      campStyleFit: ['hookups'], cadenceFit: ['fulltime'] },

    { line: 'Seismic Travel Trailer', slug: 'seismic-tt',
      dealerName: 'Seismic Travel Trailer', dealerFallback: 'Seismic Fifth Wheel',
      family: 'towable', towVehicle: 'half_ton', tier: 'mid', toyHauler: true,
      campStyleFit: ['mixed', 'offgrid'], cadenceFit: ['weekend', 'extended'] },

    { line: 'Seismic Fifth Wheel', slug: 'seismic-fw', dealerName: 'Seismic Fifth Wheel',
      family: 'towable', towVehicle: 'three_quarter_ton', tier: 'premium', toyHauler: true,
      campStyleFit: ['mixed', 'hookups'], cadenceFit: ['extended', 'fulltime'] },
  ];

  /* ---------- The flow ----------
     Questions are data so the pending UX-writing pass touches no code.

     Every option `token` is unique across ALL questions. Decoding a shared
     link builds a token -> (question, value) index from this array, so the
     link is position-independent and reordering the questions cannot silently
     resolve someone's answers to different meanings.

     `sets` is what choosing writes into state.answers. `categories` is a hard
     filter; `addCategories` unions in (MQ2 is the only door to super-c, since
     the source JSON has no such type).

     Screen budget, every path:
       drive             fork, mq, mq2, s1..s4              = 7
       tow               fork, tq1, tq2, s1..s4             = 7
       unsure -> tow     fork, help, tq2, s1..s4            = 7
       unsure -> drive   fork, help, mq, mq2, s1..s4        = 8
     The source spec's own path was 9 (Q1 + H1 + H2 + TQ1 + TQ2 + S1-S4).
     Two moves fix it: HELP carries both helper questions on one screen, and
     its first group IS the tow-vehicle question, so a helper that resolves
     towable has already answered TQ1 and skips it. */
  /* ---------- Photography ----------
     One photograph per screen, exported from assets/quiz/ — Jayco's own
     library. Each is chosen to show what its screen is asking about, which is
     the whole test: the fork question opens on a track that forks, the tow
     question on a rig and the truck that brought it, the toy hauler question
     on a ramp door lowered into a deck.

     Two of them were argued over and are worth recording. `q-mq2` asks whether
     you will tow anything behind the motorhome, and nothing in the library
     shows a coach with something hitched to it — so it shows the Super C,
     which is the chassis that question is really about. `q-s1` asks how many
     sleep on board and shows a family rather than a made bed, because the
     count is of people.

     Source files, since the exports are named for their screen and that loses
     the shoot numbers:
       q-intro   20221021_00423     q-tq2     20221021_02682
       q-fork    20260610_06156     q-s1      20260610_05200
       q-help    20241022_02828     q-s2      06132025-1903
       q-mq      _CEM0935           q-s3      DJI_0231
       q-mq2     20221021_01381     q-s4      20231022_01989
       q-tq1     06132025-1361                                             */
  const PH = '../assets/quiz/web/';

  /* The opening screen. Copy lives here with the questions rather than in the
     renderer, so every word the quiz says is in one file. */
  const intro = {
    label: 'Find Your RV',
    heading: 'Your next adventure starts with the right RV.',
    body: 'Answer a few quick questions and we’ll match you to the Jayco models that ' +
          'fit how you travel. Takes about a minute.',
    cta: 'Let’s Go',
    /* Kept from the screen it replaced: someone who already knows what they
       want should not have to answer seven questions to leave. */
    skip: { label: 'I already know what I want', href: 'compare.html' },
    photo: PH + 'q-intro.webp',
    alt: 'A motorhome on a desert highway at sunrise',
  };

  const questions = [

    {
      id: 'fork',
      photo: PH + 'q-fork.webp',
      alt: 'A motorhome parked at a forest campsite where the track forks in two',
      question: 'Do you want to drive it, or tow it?',
      why: 'This is the one big fork. Everything after it follows from here.',
      options: [
        { token: 'drive', label: 'Drive it',
          clarifier: 'One vehicle. Park it and you are set up.',
          sets: { family: 'motorized' } },
        { token: 'tow', label: 'Tow it',
          clarifier: 'Unhitch at camp and keep your vehicle for the day.',
          sets: { family: 'towable' } },
        { token: 'unsure', label: 'I am not sure yet',
          clarifier: 'Two quick questions and we will work it out.',
          sets: { family: null } },
      ],
    },

    {
      id: 'help',
      when: (a) => a.family === null,
      photo: PH + 'q-help.webp',
      alt: 'Two people in camp chairs beside a motorhome, a dog asleep on the mat',
      question: 'Then let us work it out.',
      why: 'What you already own decides most of this.',
      /* Two groups on one screen. It advances when both are answered — this is
         one decision in the user's head, and splitting it across two screens is
         what pushed the source spec's path to nine. */
      groups: [
        {
          key: 'driveway',
          label: 'What is in your driveway?',
          options: [
            /* half_ton, not three_quarter_ton. Someone who answered "I am not
               sure" and "a pickup" should not be gated into a fifth wheel that
               needs a ¾-ton. The tow gate is the one place this quiz makes a
               safety claim, so it takes the conservative reading. */
            { token: 'dw-truck', label: 'A pickup truck',
              clarifier: 'Most of the lineup is open to you.',
              sets: { towVehicle: 'half_ton' }, score: { tow: 2 } },
            { token: 'dw-suv', label: 'An SUV or crossover',
              clarifier: 'Plenty of trailers are built for this.',
              sets: { towVehicle: 'suv' }, score: { tow: 1 } },
            { token: 'dw-car', label: 'A car, or nothing that tows',
              clarifier: 'Then the RV brings its own engine.',
              sets: { towVehicle: 'suv' }, score: { drive: 2 } },
          ],
        },
        {
          key: 'campvehicle',
          label: 'At camp, would you rather have…',
          options: [
            { token: 'cp-one', label: 'One vehicle, all in',
              clarifier: 'Nothing to hitch, nothing to leave behind.',
              score: { drive: 2 } },
            { token: 'cp-two', label: 'Your daily driver free',
              clarifier: 'Set up camp, then go and find dinner.',
              score: { tow: 2 } },
            { token: 'cp-cost', label: 'The lower price up front',
              clarifier: 'Towables start well under motorhomes.',
              score: { tow: 1 } },
          ],
        },
      ],
    },

    {
      id: 'mq',
      when: (a) => a.family === 'motorized',
      photo: PH + 'q-mq.webp',
      alt: 'The driver’s seat of a motorhome, looking out over the desert through the windshield',
      question: 'How big a vehicle do you want to drive?',
      why: 'You will be driving this every mile of the trip, not just living in it.',
      options: [
        { token: 'van', label: 'Nimble, like a van',
          clarifier: 'Fits a normal parking space. Sleeps two, four at most.',
          sets: { categories: ['class-b'] } },
        { token: 'mid', label: 'Mid-size, with real room',
          clarifier: 'A cab in front, a house behind. The middle ground.',
          sets: { categories: ['class-c'] } },
        { token: 'big', label: 'Go big',
          clarifier: 'Flat front, widest floor, most storage underneath.',
          sets: { categories: ['class-a'] } },
      ],
    },

    {
      id: 'mq2',
      when: (a) => a.family === 'motorized',
      /* No photograph in the library shows a motorhome with anything hitched to
         it, so this shows the Super C — the heavy chassis this question exists
         to sort out. */
      photo: PH + 'q-mq2.webp',
      alt: 'A Super C motorhome on a desert track, built on a heavy-duty truck chassis',
      question: 'Will you tow anything behind it?',
      why: 'Towing capacity is the difference between two coaches that look alike.',
      options: [
        { token: 'tow-none', label: 'Nothing',
          clarifier: 'The RV is the whole rig.' },
        { token: 'tow-car', label: 'A car',
          clarifier: 'Something small to run errands in.',
          needsHeadroom: 'light' },
        /* The only door to super-c: the source JSON has no such type and files
           all three Senecas under class_c. This unions the category in rather
           than selecting it — Greyhawk XL matches Seneca's 12,000 lb headroom
           at $277k against $344k, so hard-filtering here would push people to a
           coach three times the price for a capability they can already get. */
        { token: 'tow-trailer', label: 'A trailer, or a large SUV',
          clarifier: 'Boat, horses, a car hauler.',
          needsHeadroom: 'heavy', addCategories: ['super-c'] },
      ],
    },

    {
      id: 'tq1',
      /* Skipped when the helper already asked it — the helper's first group IS
         this question. Keyed on _helped rather than on towVehicle being unset:
         the value survives going back to the fork, so testing it there would
         silently skip this screen on the way forward again, and quietly shorten
         the count from 7 to 6. */
      when: (a) => a.family === 'towable' && !a._helped,
      photo: PH + 'q-tq1.webp',
      alt: 'A fifth wheel and the pickup that brought it, parked in an open field',
      question: 'What will you tow it with?',
      why: 'This is a hard limit, so it is the one answer we will not bend later.',
      options: [
        { token: 'tv-suv', label: 'An SUV or crossover',
          clarifier: 'Lighter trailers, built to sit behind one.',
          sets: { towVehicle: 'suv' } },
        { token: 'tv-half', label: 'A half-ton pickup',
          clarifier: 'The most common tow vehicle in the country.',
          sets: { towVehicle: 'half_ton' } },
        { token: 'tv-34t', label: 'A three-quarter-ton pickup',
          clarifier: 'Fifth wheels open up at this end.',
          sets: { towVehicle: 'three_quarter_ton' } },
        /* Without this rung North Point and Pinnacle are unreachable — they
           are the only two lines that ask for a one-ton, and rolling them into
           "three-quarter-ton or bigger" would gate a ¾-ton owner into a
           trailer their truck may not be rated to pull. */
        { token: 'tv-1t', label: 'A one-ton or dually',
          clarifier: 'Everything Jayco tows is open to you.',
          sets: { towVehicle: 'one_ton' } },
        { token: 'tv-unsure', label: 'I do not know yet',
          clarifier: 'We will keep to what a half-ton can pull.',
          sets: { towVehicle: 'half_ton' } },
      ],
    },

    {
      id: 'tq2',
      when: (a) => a.family === 'towable',
      photo: PH + 'q-tq2.webp',
      alt: 'A Seismic toy hauler with its rear ramp lowered into a patio deck',
      question: 'Bringing anything with a motor?',
      why: 'A toy hauler is a different shape of trailer, not an add-on.',
      options: [
        { token: 'toys-yes', label: 'Yes — bikes, ATVs, a side-by-side',
          clarifier: 'You need a garage with a ramp.',
          sets: { toyHauler: 'yes' } },
        { token: 'toys-maybe', label: 'Maybe, one day',
          clarifier: 'We will show you both.',
          sets: { toyHauler: 'maybe' } },
        { token: 'toys-no', label: 'No',
          clarifier: 'Then the floor is all living space.',
          sets: { toyHauler: 'no' } },
      ],
    },

    {
      id: 's1',
      photo: PH + 'q-s1.webp',
      alt: 'A family sitting on the step of a Class C motorhome at a forest site',
      question: 'How many people sleep on board?',
      why: 'Counted in real beds, from Jayco’s published floorplans.',
      options: [
        { token: 'sl-2', label: 'One or two', clarifier: 'Just you, or the two of you.',
          sets: { sleeps: 2 } },
        { token: 'sl-4', label: 'Three or four', clarifier: 'A small family, or friends along.',
          sets: { sleeps: 4 } },
        { token: 'sl-5', label: 'Five or more', clarifier: 'You will want bunks.',
          sets: { sleeps: 5 } },
      ],
    },

    {
      id: 's2',
      photo: PH + 'q-s2.webp',
      alt: 'A fifth wheel on mown grass at a campground, chairs set out beside it',
      question: 'Where do you see yourself parked?',
      why: 'Off-grid asks more of the tanks, the battery and the roof.',
      options: [
        { token: 'cs-offgrid', label: 'Off the grid', clarifier: 'No power post, no water spigot.',
          sets: { campStyle: 'offgrid' } },
        { token: 'cs-mixed', label: 'Some of each', clarifier: 'A campground some nights, a field others.',
          sets: { campStyle: 'mixed' } },
        { token: 'cs-hookups', label: 'Full hookups', clarifier: 'Power, water and sewer at the site.',
          sets: { campStyle: 'hookups' } },
      ],
    },

    {
      id: 's3',
      photo: PH + 'q-s3.webp',
      alt: 'Looking down on a fifth wheel parked among pines, long evening shadows',
      question: 'How long are you out for?',
      why: 'A weekend and a winter want different amounts of tank and storage.',
      options: [
        { token: 'cd-weekend', label: 'Weekends and long weekends', clarifier: 'Out Friday, back Sunday.',
          sets: { cadence: 'weekend' } },
        { token: 'cd-extended', label: 'Weeks at a time', clarifier: 'Real trips, a few times a year.',
          sets: { cadence: 'extended' } },
        { token: 'cd-fulltime', label: 'Seasons, or full-time', clarifier: 'This is where you live.',
          sets: { cadence: 'fulltime' } },
      ],
    },

    {
      id: 's4',
      photo: PH + 'q-s4.webp',
      alt: 'A fifth wheel galley with an island, a fireplace and a pantry',
      question: 'Where should we start on price?',
      /* The three option labels are written at runtime from the actual MSRP of
         whatever survived the earlier answers, so the question is asked in real
         money rather than in the words value / mid / premium. See
         priceBandLabels() in quiz-score.js. Skipped when two or fewer
         candidates remain — with nothing to choose between, asking is theatre. */
      why: 'Every figure here is Jayco’s published 2027 starting price.',
      dynamic: 'priceBands',
      options: [
        { token: 'bd-low', label: 'The lower end', sets: { budget: 0 } },
        { token: 'bd-mid', label: 'The middle', sets: { budget: 1 } },
        { token: 'bd-high', label: 'The top of the range', sets: { budget: 2 } },
      ],
    },
  ];

  return { meta, weights, adjacency, towRank, lines, intro, questions };
}());
