/* ===================================================
   Jayco — Decor & Paint: exterior paint schemes and
   interior decors, per model and per floorplan
   ---------------------------------------------------
   Harvested 2026-09-24 from the Build and Price table on
   each jayco.com floorplan page: its "Exteriors" rows
   (option category 3) and "Interior Designs" rows
   (category 2), with the image each row's tooltip shows.
   Images are re-encoded to WebP in
   assets/model details/finishes/<model>__<paint|decor>-<id>.webp;
   paint drawings are trimmed to the coach.

   • `plans` lists which ids each floorplan offers. Absent
     when every plan offers the model's whole set; the
     Eagle TT, Bungalow, North Point, Pinnacle and
     Seismic TT differ plan to plan.
   • No prices. jayco.com lists placeholder figures
     ($20, $30) against many of these rows, so a price
     here would be wrong more often than right.
   • Names are Jayco's, less their prefixes ("Fabric
     Package - ", "Interior Design - "); a paint's
     finish ("Full-body paint") is split into `kind`.
   • Rows with no image on jayco.com (Comet and Greyhawk
     XL paint, Swift Silver, Greyhawk XL and Pinnacle
     Griffin decor) carry no `img` and render as a name.
   • Wood and tile upgrade rows, and "Graphics Delete",
     are left out: they are not a paint or a decor.
   =================================================== */

window.JAYCO_FINISHES = (function () {
  'use strict';
  const D = '../assets/model%20details/finishes/';
  const i = (id, name, kind, img, w, h) => {
    const o = { id: id, name: name };
    if (kind) o.kind = kind;
    if (img) { o.img = D + img; o.w = w; o.h = h; }
    return o;
  };

  return {
    'alante': {
      exterior: [
        i("standard-graphics", "Standard Graphics", "Graphics", "alante__paint-standard-graphics.webp", 639, 258),
        i("sydney", "Sydney", "Full-body paint", "alante__paint-sydney.webp", 630, 219),
        i("venice", "Venice", "Full-body paint", "alante__paint-venice.webp", 636, 222),
      ],
      interior: [
        i("glendale", "Glendale", "", "alante__decor-glendale.webp", 1200, 276),
        i("coastal", "Coastal", "", "alante__decor-coastal.webp", 1200, 276),
      ],
    },
    'comet': {
      exterior: [
        i("ceramic", "Ceramic", "Exterior color"),
        i("silver", "Silver", "Exterior color"),
      ],
      interior: [
        i("acadia", "Acadia", "", "comet__decor-acadia.webp", 1200, 276),
      ],
    },
    'eagle-fw': {
      exterior: [
      ],
      interior: [
        i("calli-linen", "Calli Linen", "", "eagle-fw__decor-calli-linen.webp", 1200, 276),
      ],
    },
    'eagle-sle-fw': {
      exterior: [
      ],
      interior: [
        i("calli-sand", "Calli Sand", "", "eagle-sle-fw__decor-calli-sand.webp", 1200, 276),
      ],
    },
    'eagle-tt': {
      exterior: [
      ],
      interior: [
        i("calli-sand", "Calli Sand", "", "eagle-tt__decor-calli-sand.webp", 1200, 276),
      ],
      plans: {
        "230mlcs": { exterior: [], interior: ["calli-sand"] },
        "265fkds": { exterior: [], interior: ["calli-sand"] },
        "294ckbs": { exterior: [], interior: ["calli-sand"] },
        "312bhok": { exterior: [], interior: ["calli-sand"] },
        "270ddbr": { exterior: [], interior: [] },
        "320mkts": { exterior: [], interior: ["calli-sand"] },
      },
    },
    'greyhawk': {
      exterior: [
        i("standard-graphics", "Standard Graphics", "Graphics", "greyhawk__paint-standard-graphics.webp", 648, 232),
        i("california", "California", "Full-body paint", "greyhawk__paint-california.webp", 564, 196),
        i("utah", "Utah", "Full-body paint", "greyhawk__paint-utah.webp", 576, 199),
        i("idaho", "Idaho", "Full-body paint", "greyhawk__paint-idaho.webp", 566, 196),
        i("arizona", "Arizona", "Full-body paint", "greyhawk__paint-arizona.webp", 549, 190),
        i("alaska", "Alaska", "Full-body paint", "greyhawk__paint-alaska.webp", 543, 189),
      ],
      interior: [
        i("glendale", "Glendale", "", "greyhawk__decor-glendale.webp", 1200, 276),
        i("coastal", "Coastal", "", "greyhawk__decor-coastal.webp", 1200, 276),
      ],
    },
    'greyhawk-xl': {
      exterior: [
        i("argent-silver", "Argent Silver", "Partial paint"),
        i("harvest-moon", "Harvest Moon", "Full-body paint"),
        i("summer-solstice", "Summer Solstice", "Full-body paint"),
        i("icy-blast", "Icy Blast", "Full-body paint"),
        i("winter-equinox", "Winter Equinox", "Full-body paint"),
      ],
      interior: [
        i("bridgewood", "Bridgewood", ""),
      ],
    },
    'jay-feather': {
      exterior: [
      ],
      interior: [
        i("dune-gray", "Dune Gray", "", "jay-feather__decor-dune-gray.webp", 1200, 276),
      ],
    },
    'jay-feather-air': {
      exterior: [
      ],
      interior: [
        i("dune-gray", "Dune Gray", "", "jay-feather-air__decor-dune-gray.webp", 1200, 276),
      ],
    },
    'jay-feather-air-sl': {
      exterior: [
      ],
      interior: [
        i("dune-gray", "Dune Gray", "", "jay-feather-air-sl__decor-dune-gray.webp", 1200, 276),
      ],
    },
    'jay-feather-sl': {
      exterior: [
      ],
      interior: [
        i("dune-gray", "Dune Gray", "", "jay-feather-sl__decor-dune-gray.webp", 1200, 276),
      ],
    },
    'jay-flight': {
      exterior: [
      ],
      interior: [
        i("dune-gray", "Dune Gray", "", "jay-flight__decor-dune-gray.webp", 1200, 276),
      ],
    },
    'jay-flight-bungalow': {
      exterior: [
      ],
      interior: [
        i("dune-gray", "Dune Gray", "", "jay-flight-bungalow__decor-dune-gray.webp", 1200, 276),
      ],
      plans: {
        "401flts": { exterior: [], interior: ["dune-gray"] },
        "401loft": { exterior: [], interior: ["dune-gray"] },
        "404loft": { exterior: [], interior: ["dune-gray"] },
        "402dlft": { exterior: [], interior: [] },
        "402rlts": { exterior: [], interior: [] },
        "jayloft": { exterior: [], interior: ["dune-gray"] },
      },
    },
    'north-point': {
      exterior: [
        i("mineral", "Mineral", "Full-body paint", "north-point__paint-mineral.webp", 663, 210),
        i("pearl", "Pearl", "Full-body paint", "north-point__paint-pearl.webp", 662, 210),
        i("smoke", "Smoke", "Full-body paint", "north-point__paint-smoke.webp", 660, 209),
      ],
      interior: [
        i("dune-gray", "Dune Gray", "", "north-point__decor-dune-gray.webp", 1400, 322),
      ],
      plans: {
        "310rlts": { exterior: ["mineral", "pearl", "smoke"], interior: ["dune-gray"] },
        "365rkts": { exterior: ["mineral", "pearl", "smoke"], interior: ["dune-gray"] },
        "381ckre": { exterior: ["mineral", "pearl", "smoke"], interior: ["dune-gray"] },
        "395dsdb": { exterior: ["mineral", "pearl", "smoke"], interior: ["dune-gray"] },
        "361rlbh": { exterior: [], interior: [] },
        "375tbdb": { exterior: ["mineral", "pearl", "smoke"], interior: ["dune-gray"] },
        "380fbrk": { exterior: [], interior: [] },
        "391tbbh": { exterior: ["mineral", "pearl", "smoke"], interior: ["dune-gray"] },
      },
    },
    'pinnacle': {
      exterior: [
        i("midnight-gold", "Midnight Gold", "Full-body paint", "pinnacle__paint-midnight-gold.webp", 665, 212),
        i("silver-metallic", "Silver Metallic", "Full-body paint", "pinnacle__paint-silver-metallic.webp", 666, 212),
        i("midnight-charcoal", "Midnight Charcoal", "Full-body paint", "pinnacle__paint-midnight-charcoal.webp", 662, 211),
      ],
      interior: [
        i("modern-farmhouse", "Modern Farmhouse", "", "pinnacle__decor-modern-farmhouse.webp", 1400, 322),
        i("griffin", "Griffin", ""),
      ],
      plans: {
        "32rlts": { exterior: ["midnight-gold", "silver-metallic", "midnight-charcoal"], interior: ["modern-farmhouse", "griffin"] },
        "36fbts": { exterior: ["midnight-gold", "silver-metallic", "midnight-charcoal"], interior: ["modern-farmhouse", "griffin"] },
        "38fbrk": { exterior: ["midnight-gold", "silver-metallic", "midnight-charcoal"], interior: ["modern-farmhouse", "griffin"] },
        "38ssws": { exterior: ["midnight-gold", "silver-metallic", "midnight-charcoal"], interior: ["modern-farmhouse", "griffin"] },
        "39dsdb": { exterior: ["midnight-gold", "silver-metallic", "midnight-charcoal"], interior: ["modern-farmhouse", "griffin"] },
        "39flok": { exterior: ["midnight-gold", "silver-metallic", "midnight-charcoal"], interior: ["modern-farmhouse", "griffin"] },
        "38rlmd": { exterior: [], interior: [] },
        "39fbrl": { exterior: ["midnight-gold", "silver-metallic", "midnight-charcoal"], interior: ["modern-farmhouse", "griffin"] },
      },
    },
    'precept': {
      exterior: [
        i("alloy-block-graphics", "Alloy Block Graphics", "Graphics", "precept__paint-alloy-block-graphics.webp", 674, 261),
        i("blue-bird", "Blue Bird", "Full-body paint", "precept__paint-blue-bird.webp", 657, 272),
        i("cardinal", "Cardinal", "Full-body paint", "precept__paint-cardinal.webp", 659, 262),
        i("black-bird", "Black Bird", "Full-body paint", "precept__paint-black-bird.webp", 656, 262),
      ],
      interior: [
        i("glendale", "Glendale", "", "precept__decor-glendale.webp", 1200, 276),
        i("coastal", "Coastal", "", "precept__decor-coastal.webp", 1200, 276),
      ],
    },
    'precept-prestige': {
      exterior: [
        i("hamilton", "Hamilton", "Full-body paint", "precept-prestige__paint-hamilton.webp", 540, 210),
        i("westfield", "Westfield", "Full-body paint", "precept-prestige__paint-westfield.webp", 540, 210),
        i("noblesville", "Noblesville", "Full-body paint", "precept-prestige__paint-noblesville.webp", 537, 209),
        i("greenwood", "Greenwood", "Full-body paint", "precept-prestige__paint-greenwood.webp", 538, 209),
      ],
      interior: [
        i("bridgewood", "Bridgewood", "", "precept-prestige__decor-bridgewood.webp", 1200, 276),
        i("avalon", "Avalon", "", "precept-prestige__decor-avalon.webp", 1200, 276),
      ],
    },
    'redhawk': {
      exterior: [
      ],
      interior: [
        i("coastal", "Coastal", "", "redhawk__decor-coastal.webp", 1200, 276),
        i("glendale", "Glendale", "", "redhawk__decor-glendale.webp", 1200, 276),
      ],
    },
    'redhawk-se': {
      exterior: [
        i("standard-graphics", "Standard Graphics", "Graphics", "redhawk-se__paint-standard-graphics.webp", 465, 202),
      ],
      interior: [
        i("avalon", "Avalon", "", "redhawk-se__decor-avalon.webp", 1200, 276),
      ],
    },
    'seismic-fw': {
      exterior: [
        i("charcoal", "Charcoal", "Full-body paint", "seismic-fw__paint-charcoal.webp", 646, 171),
        i("metallic-blue", "Metallic Blue", "Full-body paint", "seismic-fw__paint-metallic-blue.webp", 646, 171),
        i("metallic-red", "Metallic Red", "Full-body paint", "seismic-fw__paint-metallic-red.webp", 646, 171),
        i("midnight-gold-satin", "Midnight Gold Satin", "Full-body paint", "seismic-fw__paint-midnight-gold-satin.webp", 639, 175),
        i("shadow-flat", "Shadow Flat", "Full-body paint", "seismic-fw__paint-shadow-flat.webp", 657, 180),
        i("titanium", "Titanium", "Full-body paint", "seismic-fw__paint-titanium.webp", 646, 171),
      ],
      interior: [
        i("dune-gray", "Dune Gray", "", "seismic-fw__decor-dune-gray.webp", 1200, 276),
      ],
    },
    'seismic-tt': {
      exterior: [
      ],
      interior: [
        i("dune-gray", "Dune Gray", "", "seismic-tt__decor-dune-gray.webp", 1200, 276),
      ],
      plans: {
        "214": { exterior: [], interior: ["dune-gray"] },
        "265": { exterior: [], interior: ["dune-gray"] },
        "286": { exterior: [], interior: [] },
      },
    },
    'seneca': {
      exterior: [
        i("trinity-black", "Trinity Black", "Full-body paint", "seneca__paint-trinity-black.webp", 664, 210),
        i("golden-eclipse", "Golden Eclipse", "Full-body paint", "seneca__paint-golden-eclipse.webp", 667, 212),
        i("midnight-shadow", "Midnight Shadow", "Full-body paint", "seneca__paint-midnight-shadow.webp", 667, 212),
        i("ocean-blue", "Ocean Blue", "Full-body paint", "seneca__paint-ocean-blue.webp", 668, 212),
        i("starlight-silver", "Starlight Silver", "Full-body paint", "seneca__paint-starlight-silver.webp", 669, 212),
      ],
      interior: [
        i("beachwood", "Beachwood", "", "seneca__decor-beachwood.webp", 1200, 276),
        i("oakmont", "Oakmont", "", "seneca__decor-oakmont.webp", 1200, 276),
      ],
    },
    'seneca-prestige': {
      exterior: [
        i("carbon-grey", "Carbon Grey", "Full-body paint", "seneca-prestige__paint-carbon-grey.webp", 655, 208),
        i("crimson-charge", "Crimson Charge", "Full-body paint", "seneca-prestige__paint-crimson-charge.webp", 656, 208),
        i("lunar-black", "Lunar Black", "Full-body paint", "seneca-prestige__paint-lunar-black.webp", 655, 208),
        i("white-frost", "White Frost", "Full-body paint", "seneca-prestige__paint-white-frost.webp", 656, 208),
        i("sapphire-blue", "Sapphire Blue", "Full-body paint", "seneca-prestige__paint-sapphire-blue.webp", 659, 209),
        i("sterling-silver", "Sterling Silver", "Full-body paint", "seneca-prestige__paint-sterling-silver.webp", 663, 211),
        i("white-mist", "White Mist", "Full-body paint", "seneca-prestige__paint-white-mist.webp", 656, 208),
      ],
      interior: [
        i("bridle", "Bridle", "", "seneca-prestige__decor-bridle.webp", 1200, 276),
        i("saddle", "Saddle", "", "seneca-prestige__decor-saddle.webp", 1200, 276),
        i("trail", "Trail", "", "seneca-prestige__decor-trail.webp", 1200, 276),
        i("tribeca", "Tribeca", "", "seneca-prestige__decor-tribeca.webp", 1200, 276),
      ],
    },
    'seneca-xt': {
      exterior: [
        i("blindfold", "Blindfold", "Full-body paint", "seneca-xt__paint-blindfold.webp", 660, 198),
        i("deep-river", "Deep River", "Full-body paint", "seneca-xt__paint-deep-river.webp", 659, 198),
        i("hibernate", "Hibernate", "Full-body paint", "seneca-xt__paint-hibernate.webp", 659, 198),
        i("midnight", "Midnight", "Full-body paint", "seneca-xt__paint-midnight.webp", 659, 198),
        i("voyage", "Voyage", "Full-body paint", "seneca-xt__paint-voyage.webp", 657, 198),
      ],
      interior: [
        i("bradford", "Bradford", "", "seneca-xt__decor-bradford.webp", 1200, 276),
      ],
    },
    'swift': {
      exterior: [
        i("silver", "Silver", "Exterior color"),
        i("ceramic", "Ceramic", "Exterior color", "swift__paint-ceramic.webp", 356, 232),
      ],
      interior: [
        i("acadia", "Acadia", "", "swift__decor-acadia.webp", 1200, 276),
      ],
    },
    'terrain': {
      exterior: [
        i("sandstone", "Sandstone", "Standard", "terrain__paint-sandstone.webp", 616, 319),
        i("silver", "Silver", "Standard", "terrain__paint-silver.webp", 619, 320),
        i("selenite", "Selenite", "Standard", "terrain__paint-selenite.webp", 604, 312),
      ],
      interior: [
        i("timberland", "Timberland", "", "terrain__decor-timberland.webp", 1200, 276),
      ],
    },
  };
}());
