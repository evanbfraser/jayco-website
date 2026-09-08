/* ===================================================
   Jayco — Blog, shared pieces
   ---------------------------------------------------
   The three blog pages each have their own script, and
   all three draw the same post card. This is that card,
   plus the two lookups every one of them needs.

   A FOURTH FILE RATHER THAN A THIRD COPY. compare.css's
   port-and-rename rule exists so a reader who greps a
   class finds one owner; the same argument applies to a
   card that would otherwise be written out three times
   and drift the first time one of them is edited.

   Loaded before each page's own script and after
   blog-data.js. It renders; it holds no state.
   =================================================== */

(function () {
  'use strict';

  const DATA = window.JAYCO_BLOG;
  if (!DATA || !DATA.posts) return;

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* All derived from the slug rather than stored — there is exactly one of each
     per post, and 377 repeated paths would be 30KB of nothing. */
  const cardImg = (slug) => '../assets/blog/web/' + slug + '-400.webp';
  const fullImg = (slug) => '../assets/blog/web/' + slug + '-1000.webp';
  /* A card is about 420px wide in a three-up row, which the 400 covers exactly
     once — and on any 2x screen, at half the resolution it should be. Both
     widths are offered and the browser takes the one it needs. */
  const cardSet = (slug) => cardImg(slug) + ' 400w, ' + fullImg(slug) + ' 1000w';
  const CARD_SIZES = '(max-width: 768px) 92vw, (max-width: 1023px) 46vw, 31vw';

  /* ---------- Titles ----------
     JAYCO SHOUTS IN 59 OF THE 377. Its own titles are a mix — "A SHOPPING GUIDE
     FOR NEW RVERS" sits beside "Winter RV Living" — and a wall of capitals in a
     card grid reads as an error rather than as emphasis. Every surface that
     prints a post title runs it through here, so the rule is one rule.

     THIS IS TITLE CASE, NOT STRICT SENTENCE CASE, and the archive is why. A
     good few of these are place pieces — "WINDOW TO WICHITA MOUNTAINS,
     OKLAHOMA", "A WINDOW TO BANFF, ALBERTA, CANADA" — and sentence case has no
     way of knowing Banff from a noun. It would print "Window to banff, alberta,
     canada", which is a worse error than the shouting it fixed. Capitalising
     the significant words and lowering the joins gets every one of the 59 right
     without a gazetteer.

     A title that is not shouting is returned untouched: the test is a run of
     four or more capitals, so RV, TV and SLX in an otherwise normal title never
     trip it. */
  const ACRONYMS = {
    RV: 'RV', RVS: 'RVs', RVING: 'RVing', RVER: 'RVer', RVERS: 'RVers',
    TV: 'TV', DIY: 'DIY', GPS: 'GPS', LED: 'LED', PDI: 'PDI', USA: 'USA',
    US: 'US', UK: 'UK', ATV: 'ATV', UTV: 'UTV', SUV: 'SUV', MPG: 'MPG',
    GVWR: 'GVWR', LP: 'LP', AC: 'AC', NASCAR: 'NASCAR', JAYCOMMAND: 'JAYCOMMAND',
    SLX: 'SLX', HT: 'HT', XT: 'XT', SE: 'SE', XL: 'XL', KOA: 'KOA', FAQ: 'FAQ',
  };
  const SMALL = new Set(['a','an','and','as','at','but','by','for','from','in','into',
    'nor','of','on','onto','or','over','the','to','up','with','via','vs']);

  const word = (w) => {
    const bare = w.replace(/[^A-Za-z0-9']/g, '');
    if (ACRONYMS[bare.toUpperCase()] && bare.toUpperCase() === bare) {
      return w.replace(bare, ACRONYMS[bare.toUpperCase()]);
    }
    // split on hyphens so FULL-TIME becomes Full-Time
    return w.split('-').map((part) => {
      const up = part.toUpperCase();
      if (ACRONYMS[up]) return ACRONYMS[up];
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    }).join('-');
  };

  function displayTitle(t) {
    if (!t || !/[A-Z]{4,}/.test(t)) return t;
    const parts = t.split(/(\s+)/);
    let started = false;
    return parts.map((p, i) => {
      if (/^\s+$/.test(p)) return p;
      const bare = p.replace(/[^A-Za-z0-9'-]/g, '');
      if (!bare) return p;
      const isShout = bare === bare.toUpperCase() && /[A-Z]/.test(bare) && bare.length > 1;
      if (!isShout) { started = true; return p; }
      const first = !started;
      started = true;
      const low = bare.toLowerCase();
      const last = !parts.slice(i + 1).some((q) => /[A-Za-z]/.test(q));
      if (!first && !last && SMALL.has(low) && !ACRONYMS[bare.toUpperCase()]) {
        return p.replace(bare, low);
      }
      return p.replace(bare, word(bare));
    }).join('');
  }

  const topic = (id) => DATA.topics.find((t) => t.id === id) || null;
  const topicName = (id) => (topic(id) ? topic(id).name : '');
  const inTopic = (id) => DATA.posts.filter((p) => p.topics.indexOf(id) >= 0);
  const bySlug = (slug) => DATA.posts.find((p) => p.slug === slug) || null;

  const postHref = (p) => 'blog-post.html?post=' + encodeURIComponent(p.slug);
  const topicHref = (id) => 'blog-category.html?cat=' + encodeURIComponent(id);

  /* The card's kicker is the post's FIRST topic, not all of them: 94 posts
     carry two or three, and a card that lists them spends its second line on
     taxonomy instead of on what the post says. The article page shows the
     full set. Sixteen posts carry none at all — those get their date there
     instead, which is the one thing every post has. */
  function card(p, opts) {
    const o = opts || {};
    const kicker = o.kicker || (p.topics.length ? topicName(p.topics[0]) : p.date);
    /* Learn More is a SPAN, not a link. The whole card is already one anchor —
       the picture, the title and the standfirst all go to the same post — and
       an anchor inside an anchor is not something a browser will build. It
       reads as the call to action and behaves as part of the card. */
    return `<li class="bl-card">
      <a class="bl-card-link" href="${esc(postHref(p))}">
        <span class="bl-card-media">
          <img class="bl-card-img" src="${esc(cardImg(p.slug))}"
               srcset="${esc(cardSet(p.slug))}" sizes="${esc(CARD_SIZES)}" alt=""
               width="400" height="225"${o.eager ? '' : ' loading="lazy"'} decoding="async" />
        </span>
        <span class="bl-card-meta">${esc(kicker)}</span>
        <h3 class="bl-card-title">${esc(displayTitle(p.title))}</h3>
        <p class="bl-card-excerpt">${esc(p.excerpt)}</p>
        <span class="bl-card-more">Learn More
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M7 17L17 7"/><path d="M8 7h9v9"/>
          </svg>
        </span>
      </a>
    </li>`;
  }

  /* A card image that never arrives leaves a card with a grey hole in it. The
     source images are Jayco's own uploads and a handful are missing from the
     archive; the card keeps its text and closes the gap instead. */
  function wireCards(root) {
    Array.prototype.slice.call((root || document).querySelectorAll('.bl-card-img'))
      .forEach((img) => {
        img.addEventListener('error', function () {
          const media = this.closest('.bl-card-media');
          if (media) media.remove();
        }, { once: true });
      });
  }

  window.JAYCO_BLOG_UI = {
    esc: esc,
    displayTitle: displayTitle,
    card: card,
    cards: (list, opts) => list.map((p) => card(p, opts)).join(''),
    wireCards: wireCards,
    cardImg: cardImg,
    cardSet: cardSet,
    cardSizes: CARD_SIZES,
    fullImg: fullImg,
    topic: topic,
    topicName: topicName,
    inTopic: inTopic,
    bySlug: bySlug,
    postHref: postHref,
    topicHref: topicHref,
    param: (name) => new URLSearchParams(location.search).get(name),
  };
}());
