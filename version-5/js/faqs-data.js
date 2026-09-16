/* ===================================================
   Jayco — FAQs
   ---------------------------------------------------
   ONE LIST FOR THE WHOLE SITE. faqs.html renders every
   category; owner-services.html, warranty.html and
   recalls.html carry the matching category as their own
   FAQ, written into their markup from this file (see
   the note in each), so a question is answered in one
   place and reads the same wherever it appears.

   PROVENANCE
   • General, About Jayco, Buying & Selling and Current
     RV Owners are jayco.com/faqs/, read 2026-09-16 from
     its four category pages. Four answers were brought
     up to date against Jayco's own current sources
     rather than left quoting retired products:
       – "Which brands does Jayco own?" follows the
         May 2026 Jayco Family of Companies boilerplate
         (newsroom). The old answer listed Starcraft and
         "Highland Ridge (formerly Open Range)".
       – "Where are Jayco RVs made?" follows the same
         boilerplate: Middlebury, Indiana and Twin Falls,
         Idaho.
       – "What are the easiest towing models" named the
         Jay Feather Micro and Jay Flight SLX 7, neither
         in the 2027 lineup. It now names the lightest
         2027 plans in build-data.js.
       – "Class A and Class C" only ever described the
         Class C. The Class A half is added, with the
         chassis names from models-data.js.
     "Revise current towing capacity" was an editor's
     note published as a question; the question is
     reworded to what its answer answers. One duplicate
     (de-winterizing, listed twice) is dropped. "Do Jayco
     RVs have Wi-Fi?" is dropped: it names Seismic Alpha,
     which is not built for 2027, and nothing current
     confirms which models ship with an extender. The
     Melbourne sentence goes from the fuel-economy
     answer for the same reason.
   • Warranty and Recalls are written from the 2027
     Jayco Towable Warranty Guide, jayco.com/about/
     warranty/, and jaycofamily.com/canadian-recalls/.
   • Links to jayco.com pages point at this site's own
     page for the same thing.
   =================================================== */

window.JAYCO_FAQS = {
  categories: [
    {
      id: 'general',
      name: 'General',
      items: [
        { q: 'How do I contact Jayco?',
          a: '<p>Owners can reach Jayco Customer Service at 800-283-8267, or by email and online form from <a href="owner-services.html#contact">Owner Services</a>. For questions about buying a Jayco, call Sales at 800-785-2926, option 3, or email info@jayco.com.</p>' },
        { q: 'What is the difference between Class A and Class C motorhomes?',
          a: '<p>Both are built on a motorized chassis. A Class A starts from a bare chassis, such as the Ford F-53, and Jayco builds the whole coach around it, cab included. A Class C starts from a cutaway chassis, such as the Ford E-450; that is, the cab portion is installed by the chassis manufacturer.</p>' },
        { q: 'What is the easiest RV to drive?',
          a: '<p>Class B RVs are generally considered the easiest to drive. Also called camper vans, these RVs are a similar size to a van or large SUV with built-in kitchen and bathroom features. They range from 17 to 23 feet long, 7 feet wide and anywhere from 9 to 11 feet high. Class B RVs usually don’t have issues with height clearances. Driving a Class B RV makes it more comfortable for individuals transitioning from regular vehicles since the length is similar to pickup trucks. They also offer improved maneuverability, making it easier to navigate through narrow streets, parking lots, and campgrounds. Additionally, Class B RVs often have better fuel efficiency and offer more convenient parking options compared to larger motorhomes.</p>' },
        { q: 'When it comes to towing an RV, what are the most important terms to understand?',
          a: '<p>Many people focus on the dry weight of the trailer, but to be safe, your tow vehicle should be equipped to handle the Gross Vehicle Weight Rating of the trailer you intend to tow. The <a href="towing.html">Tow Capability Calculator</a> checks your vehicle against every Jayco towable that way.</p>' },
        { q: 'Where is the closest Jayco dealer?',
          a: '<p>You can find your nearest Jayco dealer with <a href="dealers.html">Find a Dealer</a>, at the top of every page.</p>' },
        { q: 'What is the difference between travel trailers vs. fifth wheels?',
          a: '<p>A travel trailer is designed to be towed by a vehicle that has a ball hitch located below the bumper of the tow vehicle. A fifth wheel is designed to be towed with a hitch that is mounted in the bed of the truck, either directly above or forward of its rear axle.</p>' },
      ],
    },
    {
      id: 'about-jayco',
      name: 'About Jayco',
      items: [
        { q: 'Are Jayco RVs good quality?',
          a: '<p>Jayco has always focused on building quality products. All Jayco products are put through extensive systems testing and quality assurance inspections before leaving the factory, and every unit goes through a <a href="pdi.html">100% pre-delivery inspection</a> in its own building before it ships.</p>' },
        { q: 'What types of RVs does Jayco manufacture?',
          a: '<p>Jayco currently manufactures every type of RV except pop-up campers and truck campers: <a href="type.html?type=travel-trailers">travel trailers</a>, <a href="type.html?type=destination">destination trailers</a>, <a href="type.html?type=fifth-wheels">fifth wheels</a>, <a href="type.html?type=toy-haulers">toy haulers</a>, and Class A, B, C and Super C motorhomes.</p>' },
        { q: 'Where are Jayco RVs made?',
          a: '<p>Jayco RVs are manufactured in Middlebury, Indiana, where the company started in 1968, and in Twin Falls, Idaho. You can <a href="visit-us.html">tour the Middlebury plant</a>.</p>' },
        { q: 'Which brands does Jayco own?',
          a: '<p>The Jayco Family of Companies manufactures and markets towable and motorized RVs through its Jayco, Entegra Coach®, Heartland RV® and Open Range RV® divisions.</p>' },
      ],
    },
    {
      id: 'buying-selling',
      name: 'Buying & Selling',
      items: [
        { q: 'Are RVs easy to drive?',
          a: '<p>Driving an RV is as easy as driving a van or truck. The smaller the RV, the easier it is to drive and maneuver. To learn more check out this article on <a href="blog-post.html?post=whats-different-about-driving-with-an-rv">what’s different about driving an RV</a> on the Jayco Journal.</p>' },
        { q: 'Are RVs safe?',
          a: '<p>RV manufacturers are building in more safety features than ever before. Check out our <a href="safety.html">safety page</a> to learn more.</p>' },
        { q: 'How do I find my towing capacity?',
          a: '<p>Your tow vehicle should be equipped to handle the Gross Vehicle Weight Rating (GVWR) of the trailer you intend to tow. If you do not know your towing capacity, contact your local auto dealer with your tow vehicle’s VIN, then put the number into the <a href="towing.html">Tow Capability Calculator</a>.</p>' },
        { q: 'What are the easiest towing models from Jayco?',
          a: '<p>Our lightest towables are the <a href="type.html?type=travel-trailers">Jay Flight</a>, from 2,450 lbs unloaded on the 130BHW, and the Jay Feather Air SL, from 2,515 lbs on the 15TBSL. The <a href="towing.html">Tow Capability Calculator</a> shows which floorplans your vehicle can pull.</p>' },
        { q: 'What is the average gas mileage of Jayco motorhomes?',
          a: '<p>Generally speaking, with our Class A and Class C motorhomes, you may average between 8 and 14 mpg. In the Class B Swift, you may average between 12 and 15 mpg.</p>' },
      ],
    },
    {
      id: 'owners',
      name: 'Current RV Owners',
      items: [
        { q: 'Can I buy Jayco replacement parts?',
          a: '<p>Jayco does not sell replacement parts directly to Jayco owners. Your best resource for replacement parts is your local Jayco <a href="dealers.html">dealer</a>. For a question about a part, Jayco Parts is at 800-283-8267, option 1, or parts@jayco.com.</p>' },
        { q: 'Where do I find my VIN?',
          a: '<p>On the weight sticker. On a travel trailer or fifth wheel it is on the inside of the entrance door and on the outside roadside wall. On a Class B it is on the driver’s doorjamb; on a Class C, inside the entrance door and on the driver’s doorjamb; on a Class A, inside the entrance door and on the wall behind the driver’s seat.</p>' },
        { q: 'I bought a used Jayco. How do I register it?',
          a: '<p>Fill out the <a href="https://qrco.de/bg45ju" target="_blank" rel="noopener noreferrer">Change of Ownership Form</a> (<a href="https://qrco.de/bgAriU" target="_blank" rel="noopener noreferrer">en français</a>). Federal record-keeping law requires Jayco to keep owner files, and it is how a <a href="recalls.html">recall notice</a> reaches you.</p>' },
        { q: 'How do I de-winterize my RV?',
          a: '<p>De-winterizing instructions can be found in your Jayco <a href="manuals.html">owner’s manual</a>. You can also find helpful resources on the Jayco Journal including this article called <a href="blog-post.html?post=the-waking-your-rv-from-winter-hibernation-checklist">The waking your RV from winter hibernation checklist</a>.</p>' },
        { q: 'How do I winterize my RV?',
          a: '<p>Winterizing instructions can be found in your Jayco <a href="manuals.html">owner’s manual</a>. You can also find helpful resources on the Jayco Journal like this article on <a href="blog-post.html?post=rv-winterizing-tips">winterizing your RV</a>.</p>' },
      ],
    },
    {
      id: 'warranty',
      name: 'Warranty',
      items: [
        { q: 'How long does Jayco’s warranty last?',
          a: '<p>All Jayco towable products come with a 2-year limited/3-year structural warranty. The limited warranty on Jayco motorhomes covers you for 24 months or 24,000 miles, whichever comes first. The 3-year structural coverage does not apply to Class B motorhomes.</p>' },
        { q: 'What does Jayco warranty cover?',
          a: '<p>The Jayco warranty covers substantial defects in materials or workmanship that are attributable to Jayco. Components with their own manufacturer’s warranty, such as the refrigerator, generator, tires and air conditioner, are covered by that manufacturer. <a href="warranty.html#coverage">What is and is not covered</a>.</p>' },
        { q: 'Can you transfer a Jayco warranty?',
          a: '<p>Our Jayco 2-year limited warranty/3-year limited structural warranty applies to the first consumer purchaser and is non-transferable. The chassis warranty on a Jayco motorhome is transferable if it has not yet expired.</p>' },
        { q: 'Does Jayco offer an extended warranty?',
          a: '<p>Extended warranties on Jayco products are provided by your local Jayco dealer. You can find your nearest Jayco dealer using <a href="dealers.html">Find a Dealer</a>.</p>' },
        { q: 'Do I need to register my warranty?',
          a: '<p>Your dealer does it. The selling dealer completes Jayco’s online Warranty Registration and Customer Delivery Form within 10 days of delivery, and the limited warranty becomes active once they have. Ask them to confirm it at handover.</p>' },
        { q: 'How soon do I have to report a problem?',
          a: '<p>Within 10 days of discovering it, and within the coverage period. Tell an authorized Jayco dealer, or Jayco, then book the repair. If two or more attempts have not fixed a covered defect, or repairs have taken longer than 30 days, notify Jayco in writing at 903 S. Main Street, P.O. Box 460, Middlebury, Indiana 46540.</p>' },
      ],
    },
    {
      id: 'recalls',
      name: 'Recalls',
      items: [
        { q: 'How do I find out if my Jayco has an open recall?',
          a: '<p>In the United States, enter your 17-character VIN at <a href="https://www.nhtsa.gov/recalls" target="_blank" rel="noopener noreferrer">NHTSA’s recall lookup</a>. In Canada, Jayco lists the recalls it has filed with Transport Canada since January 1, 2026 on the <a href="recalls.html#canada">Canada tab</a>, with each notice and owner’s letter.</p>' },
        { q: 'How will Jayco tell me about a recall?',
          a: '<p>By mail, to the owner Jayco has on file. If you bought your Jayco used or have moved, send the <a href="https://qrco.de/bg45ju" target="_blank" rel="noopener noreferrer">Change of Ownership Form</a> so the letter reaches you.</p>' },
        { q: 'What do I do if my RV is part of a recall?',
          a: '<p>Contact an authorized Jayco <a href="dealers.html">dealer</a> to schedule the repair, and have your VIN and the recall number ready. Jayco Customer Service can help at 800-283-8267 or service@jayco.com.</p>' },
        { q: 'I found a Canadian recall from before 2026. Where is it?',
          a: '<p>Recalls filed with Transport Canada before January 1, 2026 are not listed online. Contact Jayco Customer Service at 800-283-8267, service@jayco.com, or Jayco, Inc., Customer Service, P.O. Box 460, 903 S. Main Street, Middlebury, IN 46540.</p>' },
      ],
    },
    {
      id: 'app',
      name: 'Jayco Companion App',
      items: [
        { q: 'Is the Jayco Companion app free?',
          a: '<p>Yes. <a href="https://apps.apple.com/us/app/jayco-companion/id6792838188" target="_blank" rel="noopener noreferrer">Jayco Companion</a> is free on the App Store.</p>' },
        { q: 'Which devices does it run on?',
          a: '<p>iPhone and iPad, on iOS 17 or later. It is available on the App Store; there is no Google Play version.</p>' },
        { q: 'What can I do with it?',
          a: '<p>Ask questions and get answers drawn from Jayco’s manuals, tips and FAQs; pull up your RV’s specs, manuals, videos and warranty; work through pre-trip checklists; and find service and parts from certified dealers near you. <a href="jayco-companion.html">See the app</a>.</p>' },
      ],
    },
    {
      id: 'events',
      name: 'Events',
      items: [
        { q: 'Will Jayco be at the show?',
          a: '<p>Every regional show on Jayco’s <a href="events.html">events list</a> has a Jayco display and a Jayco sales rep. The list is accurate when it is published and can change, so check the show’s own website before you go.</p>' },
        { q: 'How do I find a show near me?',
          a: '<p>On the <a href="events.html">events page</a>, choose your state or province, and towable or motorized if you know which you are shopping for.</p>' },
        { q: 'Can I see a Jayco without going to a show?',
          a: '<p>Yes. Jayco dealers keep coaches on the lot all year: <a href="dealers.html">find one near you</a>. Or <a href="visit-us.html">tour the factory</a> in Middlebury, Indiana.</p>' },
      ],
    },
  ],
};
