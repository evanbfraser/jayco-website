/* ===================================================
   Jayco — RV Selector Quiz scoring
   ---------------------------------------------------
   Pure. No DOM, no events, no rendering. Given a map of
   answers it returns a match, its alternates and the
   floorplans that fit — and the reasons, so the result
   screen can say why rather than just assert.

   Kept separate from quiz.js so the whole thing can be
   swept in a console before any UI exists:

     JAYCO_QUIZ_SCORE.score({ family:'towable',
       towVehicle:'half_ton', toyHauler:'no', sleeps:5,
       campStyle:'mixed', cadence:'weekend', budget:1 })

   Reads window.JAYCO (models-data.js), JAYCO_BUILD
   (build-data.js), JAYCO_FEATURES (floorplan-features.js)
   and JAYCO_QUIZ (quiz-data.js).
   =================================================== */

window.JAYCO_QUIZ_SCORE = (function () {
  'use strict';

  const Q = window.JAYCO_QUIZ || {};
  const W = Q.weights || {};

  /* "18,000" -> 18000. Returns null rather than NaN so a missing spec is
     distinguishable from a genuine zero. */
  function num(v) {
    if (typeof v === 'number') return v;
    if (typeof v !== 'string') return null;
    const n = Number(v.replace(/[^0-9.-]/g, ''));
    return isFinite(n) ? n : null;
  }

  /* ---------- The derived index ----------
     Built once. Everything the scorer needs about a line, joined from the
     three data files, with the derived figures computed here rather than
     recomputed inside the scoring loop. */
  let INDEX = null;

  function index() {
    if (INDEX) return INDEX;
    const models = (window.JAYCO && window.JAYCO.models) || {};
    const build = window.JAYCO_BUILD || {};

    INDEX = (Q.lines || []).map((L) => {
      const m = models[L.slug];
      if (!m) return null;                        // no 2027 record: not offerable
      const plans = ((build[L.slug] && build[L.slug].floorplans) || []).slice();

      /* SLEEPS IS DERIVED, NEVER READ FROM THE QUIZ DATA. The source JSON's
         ranges contradict the real floorplans on 18 of 31 lines. Two models
         publish no per-plan figure at all (terrain, seneca-prestige); for
         those we fall back to the "Up to N" on the model card and record that
         we did, so nothing downstream claims a minimum we do not have. */
      const nums = plans.map((p) => p.sleeps).filter((n) => typeof n === 'number' && n > 0);
      let sleepsMax = nums.length ? Math.max.apply(null, nums) : null;
      let sleepsMin = nums.length ? Math.min.apply(null, nums) : null;
      let sleepsSource = nums.length ? 'plans' : null;
      if (sleepsMax == null) {
        const spec = (m.specs && m.specs.Sleeps) || '';
        const n = num(spec);
        if (n) { sleepsMax = n; sleepsMin = null; sleepsSource = 'model-spec'; }
      }

      /* GCWR minus GVWR is what the coach can pull. Published per plan, so
         take the best the line offers. Motorized only — a trailer's ratings
         describe the trailer, not what it can tow. */
      let towHeadroom = 0;
      if (L.family === 'motorized') {
        plans.forEach((p) => {
          const w = (p.specs && p.specs.Weights) || {};
          let gcwr = null, gvwr = null;
          Object.keys(w).forEach((k) => {
            if (/combined/i.test(k)) gcwr = num(w[k]);
            else if (/vehicle/i.test(k)) gvwr = num(w[k]);
          });
          if (gcwr != null && gvwr != null) towHeadroom = Math.max(towHeadroom, gcwr - gvwr);
        });
      }

      return {
        line: L.line,
        slug: L.slug,
        name: m.name,
        tagline: m.tagline,
        img: m.img,
        year: m.year,
        basePrice: m.basePrice,
        specs: m.specs || {},
        category: m.category,               // the site's truth, not the quiz JSON's `type`
        family: L.family,
        towVehicle: L.towVehicle,
        tier: L.tier,
        toyHauler: !!L.toyHauler,
        campStyleFit: L.campStyleFit || [],
        cadenceFit: L.cadenceFit || [],
        dealerName: L.dealerName,
        dealerFallback: L.dealerFallback || null,
        plans: plans,
        planCount: plans.length,
        sleepsMax: sleepsMax,
        sleepsMin: sleepsMin,
        sleepsSource: sleepsSource,
        towHeadroom: towHeadroom,
      };
    }).filter(Boolean);

    return INDEX;
  }

  /* ---------- Hard filters ----------
     Each is named and independently droppable, because the relaxation ladder
     undoes them one at a time and has to say which one it undid. */
  const TOW = Q.towRank || {};

  const FILTERS = {
    family: (r, a) => !a.family || r.family === a.family,

    category: (r, a) => {
      const set = categorySet(a);
      return !set.length || set.indexOf(r.category) >= 0;
    },

    toyHauler: (r, a) => {
      if (a.toyHauler === 'yes') return r.toyHauler === true;
      if (a.toyHauler === 'no') return r.toyHauler === false;
      return true;                                  // 'maybe', or motorized
    },

    /* NEVER RELAXED. Everything else in this ladder is a matter of taste;
       putting a 15,350 lb North Point behind someone who told us they drive an
       SUV is a claim about what their vehicle can safely pull, and this site
       has no business making it. */
    towGate: (r, a) => {
      if (r.family !== 'towable') return true;
      if (r.towVehicle === 'delivered') return true;   // sited by the dealer, never towed
      if (!a.towVehicle) return true;
      return (TOW[r.towVehicle] || 99) <= (TOW[a.towVehicle] || 0);
    },

    /* sleepsMax >= need, NOT the range-overlap the source spec describes.
       That rule was written for hand-typed ranges; against the real plans Jay
       Flight and Jay Feather both span 2–11 and would win every capacity
       question by covering everything. */
    capacity: (r, a) => {
      if (!a.sleeps || r.sleepsMax == null) return true;
      return r.sleepsMax >= a.sleeps;
    },

    /* A park model is not an answer to "where should we go this weekend". */
    destination: (r, a) => r.category !== 'destination' || a.cadence === 'fulltime',
  };

  /* MQ2's `tow-trailer` unions super-c in rather than selecting it — see the
     note in quiz-data.js. Everything else is whatever the branch question set. */
  function categorySet(a) {
    const base = (a.categories || []).slice();
    (a.addCategories || []).forEach((c) => { if (base.indexOf(c) < 0) base.push(c); });
    return base;
  }

  /* ---------- The relaxation ladder ----------
     Undo one filter at a time, in a fixed order, re-testing after each. Every
     step is recorded with a sentence, because a result that quietly ignored
     what someone told us is worse than no result.

     ORDER IS BY CONSEQUENCE, cheapest concession first. Capacity is LAST
     because it is the only rung that returns something which does not work:
     a different shape of vehicle is a conversation, a bed short is a family
     with nowhere to sleep. Ordering capacity earlier handed a family of five a
     four-berth camper van instead of the Class C that actually fits them. */
  const LADDER = [
    {
      key: 'destination',
      apply: (a) => Object.assign({}, a, { _skipDestination: true }),
      message: () => 'Nothing in the lineup matched exactly, so we included the destination trailer — it is sited by the dealer rather than towed.',
    },
    {
      key: 'category',
      apply: (a) => {
        const adj = Q.adjacency || {};
        const set = categorySet(a).slice();
        categorySet(a).forEach((c) => (adj[c] || []).forEach((n) => {
          if (set.indexOf(n) < 0) set.push(n);
        }));
        return Object.assign({}, a, { categories: set, addCategories: [] });
      },
      message: (a, next) => {
        const from = categorySet(a), to = categorySet(next);
        const added = to.filter((c) => from.indexOf(c) < 0);
        /* The one case the source spec calls out by name, and it falls out of
           the general ladder rather than needing a rule of its own. */
        if (from.indexOf('class-b') >= 0 && added.indexOf('class-c') >= 0) {
          return 'A camper van sleeps two, four at most. For ' + (a.sleeps || 5) +
                 ' you need a Class C — the same idea, with a cab in front instead of one shell.';
        }
        return 'Nothing in that exact shape fit, so we looked at ' +
               added.map(categoryWord).join(' and ') + ' too.';
      },
    },
    {
      key: 'toyHauler',
      apply: (a) => Object.assign({}, a, { toyHauler: 'maybe' }),
      message: () => 'No toy hauler fit the rest of your answers, so we included trailers without a garage.',
    },
    /* Last resort. See the note above the ladder. */
    {
      key: 'capacity',
      apply: (a) => Object.assign({}, a, { sleeps: Math.max(1, (a.sleeps || 1) - 1) }),
      message: (a) => 'Nothing in the lineup sleeps ' + a.sleeps +
                      ' once your other answers are applied, so this one is a berth short.',
    },
  ];

  function categoryWord(id) {
    return {
      'travel-trailers': 'travel trailers',
      'destination': 'destination trailers',
      'fifth-wheels': 'fifth wheels',
      'toy-haulers': 'toy haulers',
      'class-a': 'Class A motorhomes',
      'class-b': 'camper vans',
      'class-c': 'Class C motorhomes',
      'super-c': 'Super C motorhomes',
    }[id] || id;
  }

  function applyFilters(rows, a) {
    return rows.filter((r) =>
      FILTERS.family(r, a) &&
      FILTERS.category(r, a) &&
      FILTERS.toyHauler(r, a) &&
      FILTERS.towGate(r, a) &&
      FILTERS.capacity(r, a) &&
      (a._skipDestination || FILTERS.destination(r, a)));
  }

  function pool(answers) {
    const all = index();
    const original = answers;
    let a = answers;
    let rows = applyFilters(all, a);
    const applied = [];

    /* The ladder is cumulative: a rung that does not fill the pool on its own
       is still kept, because the next one usually needs it. */
    for (let i = 0; i < LADDER.length && !rows.length; i++) {
      const step = LADDER[i];
      const next = step.apply(a);
      applied.push({ step: step, before: a, after: next });
      a = next;
      rows = applyFilters(all, a);
    }

    /* Family plus the tow gate is the floor. If nothing survives those, we do
       not have an answer and should say so rather than invent one — the spec's
       "always show a way out". */
    return { rows: rows, answers: a, original: original, applied: applied, dead: !rows.length };
  }

  /* Turn the applied rungs into sentences — but ONLY the ones that are
     actually true of the match we ended up with. The ladder widens
     speculatively, so a rung can fire without changing the answer; telling
     someone "we included the destination trailer" when we recommended a Class
     C is the kind of small lie that costs the whole page its credibility. */
  function explain(p, primary) {
    const orig = p.original;
    const out = [];
    p.applied.forEach((rec) => {
      const key = rec.step.key;
      if (key === 'destination' && primary.category !== 'destination') return;
      if (key === 'capacity' && !(orig.sleeps && bestFit(primary, orig.sleeps) == null)) return;
      if (key === 'category' && categorySet(orig).indexOf(primary.category) >= 0) return;
      if (key === 'toyHauler' && !(orig.toyHauler === 'yes' && !primary.toyHauler)) return;
      out.push({ key: key, message: rec.step.message(rec.before, rec.after) });
    });
    return out;
  }

  /* ---------- Price bands ----------
     Terciles of real MSRP inside whatever survived. Never empty, which is why
     this replaces the source JSON's `tier` as the budget axis: most categories
     are missing at least one tier outright, and where all three exist the
     labels contradict the prices. */
  function bandOf(row, sorted) {
    if (sorted.length < 2) return 1;
    const i = sorted.indexOf(row);
    return Math.min(2, Math.floor((i / sorted.length) * 3));
  }

  const TIER_BAND = { value: 0, mid: 1, premium: 2 };

  /* How many berths past the need the closest suitable plan carries. 0 is an
     exact fit. Falls back to the line's published maximum for the two models
     that list no per-plan figure. Returns null when nothing fits. */
  function bestFit(r, need) {
    let best = null;
    r.plans.forEach((p) => {
      if (typeof p.sleeps !== 'number' || p.sleeps < need) return;
      const over = p.sleeps - need;
      if (best == null || over < best) best = over;
    });
    if (best != null) return best;
    if (r.sleepsSource === 'model-spec' && r.sleepsMax != null && r.sleepsMax >= need) {
      return r.sleepsMax - need;
    }
    return null;
  }

  function scoreRow(r, a, sorted) {
    let s = 0;
    const why = [];

    const band = bandOf(r, sorted);
    if (a.budget != null) {
      const d = Math.abs(a.budget - band);
      s += W.budget * (1 - d / 2);
    }

    /* Scored on the BEST-FITTING PLAN, not on the line's ceiling. We recommend
       a line and then pick floorplans out of it, so the question is "does this
       line have a plan that fits" — measuring the maximum instead scored Jay
       Flight at zero for a couple, because it also offers an 11-berth plan,
       while four of its 58 plans sleep exactly two. */
    if (a.sleeps) {
      const fit = bestFit(r, a.sleeps);
      if (fit != null) {
        s += W.capacity * Math.max(0, 1 - Math.max(0, fit - 2) / 6);
      }
      /* Only when a minimum is genuinely published. terrain and
         seneca-prestige are never penalised rather than guessed at. */
      if (r.sleepsMin != null && r.sleepsMin > a.sleeps) s += W.oversizePenalty;
    }

    if (a.campStyle) {
      const i = r.campStyleFit.indexOf(a.campStyle);
      s += i === 0 ? W.campStyle : i > 0 ? W.campStyle / 2 : 0;
    }
    if (a.cadence) {
      const i = r.cadenceFit.indexOf(a.cadence);
      s += i === 0 ? W.cadence : i > 0 ? W.cadence / 2 : 0;
    }

    if (a.towNeed && r.family === 'motorized') {
      const target = a.towNeed === 'heavy' ? 12000 : 5000;
      s += W.towHeadroom * Math.min(1, r.towHeadroom / target);
    }

    if (a.budget != null && TIER_BAND[r.tier] === a.budget) s += W.tierAgreement;

    return { row: r, score: s, band: band, why: why };
  }

  /* Deterministic all the way down, so the same answers give the same match on
     every machine and every run. Lower price wins a genuine tie: it is the
     safer error to make on someone's behalf. */
  function rank(list) {
    return list.slice().sort((x, y) =>
      y.score - x.score ||
      x.row.basePrice - y.row.basePrice ||
      y.row.planCount - x.row.planCount ||
      (x.row.slug < y.row.slug ? -1 : 1));
  }

  /* ---------- Alternates, chosen by role ----------
     So the three read as a comparison rather than a list. A role that cannot
     be filled is dropped — a filler card is worse than two cards. */
  function alternates(primary, scored, all) {
    const out = [];
    const seen = { [primary.row.slug]: true };
    const take = (cand, role) => {
      if (!cand || seen[cand.row.slug]) return;
      seen[cand.row.slug] = true;
      out.push({ row: cand.row, score: cand.score, role: role });
    };

    const same = scored.filter((c) => c.row.category === primary.row.category);
    take(rank(same.filter((c) => c.row.basePrice < primary.row.basePrice))[0], 'One step down');

    const up = rank(same.filter((c) => c.row.basePrice > primary.row.basePrice))[0];
    if (up) take(up, 'One step up');
    else {
      const adj = rank(scored.filter((c) => c.row.category !== primary.row.category))[0];
      if (adj) take(adj, 'The next size up is a different kind of vehicle');
    }

    /* "The other shape" — the spec's large-TT-beside-an-entry-fifth-wheel
       case. Only when it is genuinely competitive; a distant third is noise. */
    const other = rank(scored.filter((c) =>
      c.row.category !== primary.row.category && !seen[c.row.slug]))[0];
    if (other && other.score >= primary.score * 0.75) take(other, 'A different shape');

    return out.slice(0, 3);
  }

  /* ---------- Floorplans ----------
     Real plans from build-data. Unpriced (`isNew`) plans stay in the pool —
     jay-flight__280BHSW sleeps 10 and has no published price, and dropping it
     would hide the best answer to "we need to sleep ten". They sort last
     within their tier and render with the same honest treatment build.js
     already uses. */
  function pickPlans(row, a, limit) {
    const feats = (window.JAYCO_FEATURES && window.JAYCO_FEATURES.plans) || {};
    const need = a.sleeps || 0;
    const target = row.basePrice;

    const scored = row.plans.map((p) => {
      const f = feats[row.slug + '__' + p.id] || [];
      let s = 0;
      if (typeof p.sleeps === 'number') {
        if (need && p.sleeps >= need) s += 40;
        if (need) s -= Math.max(0, p.sleeps - need - 2) * 3;
      }
      if (need >= 5 && f.indexOf('bunkhouse') >= 0) s += 18;
      if (need <= 2 && f.indexOf('couples_coach') >= 0) s += 18;
      /* price is a delta from the model's base, so a plan near the base is
         near the price the user was shown. */
      if (p.price != null) s += Math.max(0, 12 - Math.abs(p.price) / (target * 0.05));
      else s -= 6;                                 // unpriced: keep, but rank below
      return { plan: p, score: s, features: f };
    });

    return scored
      .sort((x, y) => y.score - x.score ||
                      (x.plan.price == null) - (y.plan.price == null) ||
                      (x.plan.name < y.plan.name ? -1 : 1))
      .slice(0, limit || 3);
  }

  /* ---------- Public ---------- */

  function score(answers) {
    const a = Object.assign({}, answers);
    const p = pool(a);
    if (p.dead) {
      return { dead: true, relaxations: [],
               reason: 'Nothing in the lineup tows behind what you told us you drive.' };
    }

    const sorted = p.rows.slice().sort((x, y) => x.basePrice - y.basePrice);
    const scored = rank(p.rows.map((r) => scoreRow(r, p.answers, sorted)));
    const primary = scored[0];

    return {
      dead: false,
      primary: primary.row,
      primaryScore: primary.score,
      band: primary.band,
      alternates: alternates(primary, scored.slice(1), scored),
      plans: pickPlans(primary.row, p.answers, 3),
      relaxations: explain(p, primary.row),
      poolSize: p.rows.length,
      answers: p.answers,
      /* What the user actually asked for, for the "why this fits" lines. */
      asked: p.original,
    };
  }

  /* Labels for S4, written from the real prices of whatever survived the
     earlier answers — so the budget question is asked in money rather than in
     the words value / mid / premium, which this data cannot support. Returns
     null when there is nothing to choose between, and the question is skipped. */
  function priceBands(answers) {
    const a = Object.assign({}, answers);
    delete a.budget;
    const p = pool(a);
    if (p.dead || p.rows.length < 3) return null;

    const sorted = p.rows.slice().sort((x, y) => x.basePrice - y.basePrice);
    const money = (n) => '$' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const at = (i) => sorted[Math.min(sorted.length - 1, Math.max(0, i))].basePrice;
    const third = Math.floor(sorted.length / 3);

    return [
      { from: at(0), to: at(third) },
      { from: at(third), to: at(third * 2) },
      { from: at(third * 2), to: at(sorted.length - 1) },
    ].map((b) => b.from === b.to ? money(b.from) : money(b.from) + ' – ' + money(b.to));
  }

  return { index: index, score: score, priceBands: priceBands, pool: pool, categoryWord: categoryWord };
}());
