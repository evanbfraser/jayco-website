/* ===================================================
   Jayco — Owner stories
   ---------------------------------------------------
   PROVENANCE. READ THIS BEFORE EDITING.

   PRODUCT.md lists testimonials under "Absences future
   work must not fabricate — there are no customer
   testimonials, no review scores, no case studies, no
   press quotes in this repo. Do not invent any of them
   to fill a layout." DESIGN.md repeats it: "Don't state
   a claim the product can't prove — no invented
   testimonials, review scores, or benchmarks."

   So none of these are written. Every quote below is
   verbatim from an owner story Jayco has itself
   published on jayco.com, and every record carries the
   URL and the publication date it came from. They were
   collected 2026-08-31. If a quote here cannot be found
   at its `source`, it does not belong on the page.

   WHAT IS NOT HERE, AND WHY
   No star ratings and no aggregate score. Jayco
   publishes neither, and the independent sites that do
   (RV Insider, Trustpilot, the BBB) carry a far more
   mixed picture than these stories — averaging or
   badging them here would be inventing a number the
   company has never claimed. The FAQ points at those
   sites by name instead.

   Quotes are reproduced as published. Where one is
   joined from two consecutive sentences in the same
   answer, `joined: true` marks it. Nothing is reworded,
   and no ellipsis hides a qualification.

   One household, one card. The Tantsits and the Brewers
   were each interviewed at length and several of their
   answers would stand on their own, but running two
   cards for one family reads as two families — and in
   the Brewers' case the two cards ARE two people, Chad
   and Heather, answering separately.

   `family` exists so the page can count households
   without guessing. It is not the source URL: the
   Potters and the Puglisis are two families quoted in
   one article, and it is not the name either, since
   Chad and Heather share one.
   =================================================== */

window.JAYCO_STORIES = {
  collected: '2026-08-31',

  items: [
    {
      quote: 'Thank you Jayco. Your camper gave us a few years of joy, and we loved it. However, in the end, it did its job and protected us from danger.',
      name: 'Michael Jarvi',
      family: 'jarvi',
      model: 'Jay Flight SLX 174BH',
      place: 'Van Riper State Park, Michigan',
      year: 2019,
      note: 'After a tree fell on their camper with his family inside.',
      source: 'https://www.jayco.com/blog/jayco-survival-story/',
    },
    {
      quote: 'Buying the RV has been the best decision we’ve ever made for our family. We spend more quality time together. We have become stronger and more bonded as a family.',
      joined: true,
      name: 'Matt Rewis',
      family: 'rewis',
      model: 'Jay Sport 8SD',
      year: 2017,
      source: 'https://www.jayco.com/blog/meet-the-rewises/',
    },
    {
      quote: 'My favorite part of RVing is the flexibility and freedom. You’re on your own schedule, you can pull off anywhere to make lunch, take a nap, or go on a hike.',
      name: 'Heather Brewer',
      family: 'brewer',
      model: 'Jay Flight 32BHDS',
      note: 'Eleven years a Jayco owner, fourteen years RVing.',
      year: 2017,
      source: 'https://www.jayco.com/blog/meet-the-brewers/',
    },
    {
      quote: 'The outdoor kitchen and the family living space—there’s room for everyone without being on top of each other.',
      name: 'Chad Brewer',
      family: 'brewer',
      model: 'Jay Flight 32BHDS',
      year: 2017,
      source: 'https://www.jayco.com/blog/meet-the-brewers/',
    },
    {
      quote: 'We have had several brands of RVs and Jayco has been the best quality thus far.',
      name: 'James Tantsits',
      family: 'tantsits',
      model: 'Greyhawk 31FS',
      place: 'New Jersey',
      note: 'Drives it 1,400 miles round trip, twice a year.',
      year: 2017,
      source: 'https://www.jayco.com/blog/meet-the-tantsits/',
    },
    {
      quote: 'Now that I have a family of my own, I wanted to start building memories for my kids.',
      name: 'The Potters',
      family: 'potters',
      model: 'Jay Feather',
      year: 2019,
      source: 'https://www.jayco.com/blog/new-rver-tips-from-jayco-families/',
    },
    {
      quote: 'If you’re considering purchasing an RV and entering the lifestyle—just do it now.',
      name: 'The Puglisis',
      family: 'puglisis',
      year: 2019,
      source: 'https://www.jayco.com/blog/new-rver-tips-from-jayco-families/',
    },
    {
      quote: 'We bought our 2021 Jayco Luxury Seismic because it delivers luxury and exceptional comfort on the road, while thoughtfully connecting the interior with the outdoors. Every trip has felt more enjoyable thanks to smart design and high-quality construction.',
      name: 'Adventure Bandits',
      family: 'adventure-bandits',
      model: 'Seismic',
      year: 2021,
      source: 'https://www.jayco.com/testimonials-reviews/',
    },
  ],
};

/* ===================================================
   Jayco — recent owner reviews (Google)
   ---------------------------------------------------
   PROVENANCE. READ THIS BEFORE EDITING.

   The same rule as JAYCO_STORIES above: none of these
   are written. Every one is verbatim from the review
   widget Jayco itself embeds on
   https://www.jayco.com/testimonials-reviews/ — served
   by Jayco's review partner at
   https://widgets.reviews.rhino-reviews.com/e6efad18
   and collected 2026-09-02.

   The reviews originate on GOOGLE; the widget marks
   each one with Google's logo. That is why the page
   badges them as Google reviews and not as anything
   else.

   STARS are per-review and real: each is the rating
   that reviewer gave, carried in the widget's own
   aria-valuenow. There is still NO aggregate score
   anywhere on this page, because Jayco publishes none —
   the same position JAYCO_STORIES states above. Ten
   five-star reviews is what the widget was showing on
   the day it was read, not a claim about Jayco's
   average.

   ATTRIBUTION was the hazard here and it is worth
   recording how it was checked. The widget renders each
   card as name, then stars, then quote, then date — so
   reading the page as a stream of text attaches every
   quote to its NEIGHBOUR's name. Two passes did exactly
   that before a screenshot caught it. These records
   come from per-card extraction (.card.incoming-review,
   .name) and the attribution was then confirmed against
   a rendered screenshot of the widget. If you re-scrape
   this, verify against a picture, not the text order.

   Quotes are reproduced exactly, including the
   spelling and grammar the reviewers used.
   =================================================== */

window.JAYCO_REVIEWS = {
  collected: '2026-09-02',
  source: 'https://www.jayco.com/testimonials-reviews/',
  platform: 'Google',

  items: [
    { name: 'Lewis J.', stars: 5, date: '2026-08-31',
      quote: 'I purchased a 2026 Jayco Jay Flight SLX 210QB. I was looking for this particular model with the seating at the back surrounded by windows. I like the solar pkg that keep 2 six volt batteries charged as l mostly boondock. The fresh water tank is great at 84 gallons. The steps are good and sturdy. I like the blinds and modern interior finish. I am missing the outside griddle that it was supposed to come with, the dealer is looking for one for me. I pull the trailer with a Chevy Silverado 3500 diesel so you hardly know it’s there. So far so good, l am enjoying my purchase.' },
    { name: 'Paul P.', stars: 5, date: '2026-08-31',
      quote: 'First RV we have ever bought. So far meets all our expectations, except for the mattress. It is an MRB 15. Suits a Senior couple perfectly. Easy to tow, easy to back into a campground.' },
    { name: 'William J.', stars: 5, date: '2026-08-31',
      quote: 'Haven’t used it yet but appears to be what we wanted' },
    { name: 'Rick B.', stars: 5, date: '2026-08-20',
      quote: 'Well built with only a few adjustments necessary. Subwoofer was missing from the unit, but I was upgrading anyway. Overall, 5 stars' },
    { name: 'T.', stars: 5, date: '2026-08-17',
      quote: 'Love our new 2025 Jayco Eagle HT 230mlcs!! Outside of a couple of minor issues… She’s a beaut!! Love the layout…Love the finishings… Love the Quality. We owned our Jayco Jayflight for 12 years and loved it for the same reasons. I hope we have the same future with this one. I would recommend this trailer to anyone. Great job Jayco.' },
    { name: 'Cheri C.', stars: 5, date: '2026-08-17',
      quote: 'We used our new Jayco Jay Feather on our day’s off for a trip to Pagosa Hot Springs RV, and we have fallen in love with it. We get one we a month off each month and are making our plans to use our new camper as often as we can. Next spring we will be heading to Glen Rose, Texas for a week and who knows where else we’ll go. Boon docking is definitely in our future plans, and hopefully we will meet up with some of our friends.' },
    { name: 'Laura O.', stars: 5, date: '2026-08-17',
      quote: 'Rhones RV is an excellent place to take your RV. I recently needed my travel trailer inspected and hitch checked out. They went above and beyond and found a recall on my RV. They fix that too.' },
    { name: 'Kyle P.', stars: 5, date: '2026-08-17',
      quote: 'Sales person was very knowledgeable.' },
    { name: 'Tim E.', stars: 5, date: '2026-08-17',
      quote: 'Happy with my Jayco for the time I have had it. Only issue was a leak on the shower door that was not sealed properly.' },
    { name: 'Jim K.', stars: 5, date: '2026-08-10',
      quote: 'Jayco completed the project on time and under budget. Had 1 minor issue that was immediately resolved. I could not be happier and will certainly go back if the need arises.' },
  ],
};
