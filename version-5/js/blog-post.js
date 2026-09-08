/* ===================================================
   Jayco — Blog post (blog-post.html?post=<slug>)
   ---------------------------------------------------
   One page for 377 articles. The heading, date, topics
   and picture come from the index every blog page
   already loads; the BODY does not — it is one file per
   post under js/blog/, injected here as a <script> once
   the page knows which one it wants.

   WHY A SCRIPT TAG AND NOT fetch().
   Two reasons, and the second is the load-bearing one:
     1. 377 bodies average 4KB. Shipping them together
        would be a 1.8MB download to read one of them.
     2. A fetch() of a local file is blocked on file://,
        and this site is opened that way — quiz.js and
        brochure-form.js both carry the same note about
        the difference between a local preview and the
        deployed site. A <script> is not subject to that
        rule, so the page works from a folder as well as
        from Netlify.

   The file defines window.JAYCO_BLOG_ARTICLE. onerror
   is what a missing file looks like, and it lands in
   the same place a bad slug does.
   =================================================== */

(function () {
  'use strict';

  const DATA = window.JAYCO_BLOG;
  const UI = window.JAYCO_BLOG_UI;
  if (!DATA || !UI) return;

  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.prototype.slice.call((c || document).querySelectorAll(s));
  const esc = UI.esc;
  const RELATED = 3;

  const slug = (UI.param('post') || '').toLowerCase();
  const post = UI.bySlug(slug);

  function missing() {
    $('#bl-loading').hidden = true;
    $('#bl-post-h').textContent = 'Post not found';
    $('#bl-missing').hidden = false;
    document.title = 'Post not found — Jayco Blog (v5)';
  }

  if (!post) { missing(); return; }

  /* ---------- The parts that come from the index ----------
     Through UI.displayTitle, like every other surface that prints a title —
     see the note over it in blog-ui.js. The tab title too: a browser tab
     reading "A SHOPPING GUIDE FOR NEW RVERS" shouts in the same way. */
  const title = UI.displayTitle(post.title);
  document.title = title + ' — Jayco Blog (v5)';
  $('#bl-post-h').textContent = title;
  $('#bl-post-date').textContent = post.date;

  /* Every topic the post carries, not just the first: this is the one page
     with room for the full set, and they are the way back into the archive. */
  $('#bl-post-topics').innerHTML = post.topics.map((t) =>
    `<a class="bl-post-topic" href="${esc(UI.topicHref(t))}">${esc(UI.topicName(t))}</a>`).join('');

  /* The back link goes to the archive, not to the post's own topic, and says
     so: the topic row directly under it already links there, and two controls
     one line apart reading "Ambassador" is one control too many. */
  const home = post.topics[0];

  const fig = $('#bl-post-figure');
  const img = $('#bl-post-img');
  img.src = UI.fullImg(post.slug);
  img.alt = post.alt || '';
  img.addEventListener('error', () => { fig.hidden = true; }, { once: true });
  fig.hidden = false;

  summary();

  /* ---------- The standfirst ----------
     Jayco's own summary line, the one its listings run under the title. Shown
     in a panel above the article.

     AND THEN NOT SHOWN TWICE. For about a fifth of posts that line IS the
     article's opening paragraph, word for word — the standfirst was written by
     lifting it. Promoting it to a panel and leaving it in place would print the
     same sentence twice, six inches apart, so the paragraph goes. Compared on
     letters and digits alone, because the two copies differ in curly quotes and
     stray spaces often enough to defeat a plain === . */
  const flatten = (s) => s.replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;|&#\d+;/gi, ' ')
    .replace(/[^a-z0-9]+/gi, '')
    .toLowerCase();

  function dropRepeatedOpener(root) {
    const first = root.querySelector('p');
    if (!first) return;
    const a = flatten(first.innerHTML);
    const b = flatten(post.excerpt || '');
    if (!a || !b) return;
    const same = a === b ||
      (b.length > 40 && a.startsWith(b.slice(0, 60))) ||
      (a.length > 40 && b.startsWith(a.slice(0, 60)));
    if (same) first.remove();
  }

  function summary() {
    if (!post.excerpt) return;
    $('#bl-summary-text').textContent = post.excerpt;
    $('#bl-summary').hidden = false;
  }

  /* ---------- The body ---------- */
  function render(html) {
    $('#bl-loading').hidden = true;
    /* Jayco's own markup, already reduced to a fixed set of tags when the file
       was written — see js/blog-data.js. Nothing from the URL reaches this. */
    const body = $('#bl-body');
    body.innerHTML = html;
    dropRepeatedOpener(body);
  }

  const s = document.createElement('script');
  s.src = 'js/blog/' + encodeURIComponent(post.slug) + '.js?v=v5-bl-1';
  s.onload = () => {
    const art = window.JAYCO_BLOG_ARTICLE;
    if (art && art.slug === post.slug && art.html) render(art.html);
    else missing();
    related();
    motion();
    if (window.ScrollTrigger) requestAnimationFrame(() => window.ScrollTrigger.refresh());
  };
  s.onerror = () => { missing(); related(); motion(); };
  document.head.appendChild(s);

  /* ---------- Motion ----------
     Two pieces, both keyed to the scroll and neither of them running on their
     own: the picture opens up as the page moves past it, and the article
     arrives a block at a time as it comes into view.

     Bound AFTER the body is in the DOM — there is nothing to reveal before
     that, and ScrollTrigger would cache its measurements against a page that
     is about to get 4,000 words taller.

     Under prefers-reduced-motion neither is bound: the picture sits at its
     natural size and the text is simply there, which is DESIGN.md's rule that
     every section must be legible with the animation layer dead. */
  function motion() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    grow();
    reveal();
  }

  /* The picture fills its frame at rest and reaches 120% by the time the frame
     leaves the top of the screen — the frame clips, so what a reader sees is
     the photograph opening up rather than the box changing size. Linear and
     scrubbed, per DESIGN.md: it tracks the scrollbar rather than performing.

     START IS THE TOP OF THE PAGE, NOT THE TOP OF THE PICTURE. The usual
     'top bottom' means "when this element enters from below", and this one has
     not entered from anywhere — it is already on screen when the page loads.
     Measured that way it opened at 1.076 before the reader had touched
     anything, spending the first eighth of the effect on nobody. From scroll
     position 0 it is at rest until the first scroll, which is what "grows as
     you scroll" should mean. */
  function grow() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    const frame = $('.bl-post-frame');
    if (!frame || fig.hidden) return;
    gsap.fromTo(img, { scale: 1 }, {
      scale: 1.2,
      ease: 'none',
      scrollTrigger: {
        trigger: frame,
        start: 0,
        endTrigger: frame,
        end: 'bottom top',
        scrub: true,
      },
    });
  }

  /* One observer for the whole article rather than a ScrollTrigger per
     paragraph: a long post is 60-odd blocks, and they are all the same
     arrival. Each block is unobserved as it fires, so nothing is watched
     twice, and the ones that arrive together are staggered as a group — which
     is what makes a list read as a list rather than as 20 separate events. */
  function reveal() {
    if (typeof gsap === 'undefined' || !('IntersectionObserver' in window)) return;
    const blocks = $$('#bl-body > *');
    if (!blocks.length) return;

    const io = new IntersectionObserver((entries, obs) => {
      const arriving = entries.filter((e) => e.isIntersecting).map((e) => e.target);
      if (!arriving.length) return;
      arriving.forEach((el) => obs.unobserve(el));
      arriving.sort((a, b) =>
        (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) ? -1 : 1);
      gsap.to(arriving, {
        opacity: 1, y: 0,
        duration: 0.5, ease: 'power2.out',
        stagger: 0.06,
        clearProps: 'all',
      });
    }, { rootMargin: '0px 0px -8% 0px' });

    /* Hidden here rather than in the stylesheet, so a reader with this script
       dead gets the article rather than a blank column. */
    gsap.set(blocks, { opacity: 0, y: 16 });
    blocks.forEach((el) => io.observe(el));
  }

  /* ---------- More like this ----------
     From the post's first topic. The fifteen posts that carry no topic fall
     back to the newest overall — a reader at the end of an article should
     always have somewhere to go next, and "nothing related" is not a state
     worth rendering. */
  function related() {
    const pool = (home ? UI.inTopic(home) : DATA.posts).filter((p) => p.slug !== post.slug);
    if (!pool.length) return;
    const list = pool.slice(0, RELATED);
    $('#bl-more-grid').innerHTML = UI.cards(list);
    UI.wireCards($('#bl-more-grid'));
    $('#bl-more-h').textContent = home ? 'More in ' + UI.topicName(home) : 'Latest posts';
    const all = $('#bl-more-all');
    all.href = home ? UI.topicHref(home) : 'blog.html';
    all.textContent = home ? 'All ' + pool.length + ' posts' : 'All topics';
    $('#bl-more-posts').hidden = false;
  }
}());
