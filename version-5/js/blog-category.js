/* ===================================================
   Jayco — Blog topic (blog-category.html?cat=<topic>)
   ---------------------------------------------------
   One page for eleven topics. The parameter is the
   page: model.html and type.html already work this way
   here, and 377 posts across eleven topics is not
   eleven files that differ only in a heading.

   A BAD PARAMETER IS A REDIRECT, NOT AN EMPTY PAGE.
   With no ?cat, or one no post carries, there is
   nothing to show and no way to choose from here — so
   the reader is sent to blog.html, which is the page
   that offers the choice. replace(), not assign(), so
   the back button goes where they came from rather than
   bouncing off this page again.

   POSTS ARRIVE A PAGE AT A TIME. Travel Ideas holds
   128, each card with a picture; rendering all of them
   is 128 image requests for a screen that shows six.
   =================================================== */

(function () {
  'use strict';

  const DATA = window.JAYCO_BLOG;
  const UI = window.JAYCO_BLOG_UI;
  if (!DATA || !UI) return;

  const $ = (s, c) => (c || document).querySelector(s);
  const esc = UI.esc;
  const PAGE = 24;
  const ART = '../assets/blog/web/';

  const id = (UI.param('cat') || '').toLowerCase();
  const topic = UI.topic(id);
  if (!topic) { location.replace('blog.html'); return; }

  const posts = UI.inTopic(id);
  let shown = 0;

  function head() {
    document.title = topic.name + ' — Jayco Blog (v5)';
    $('#bl-band-h').textContent = topic.name;
    $('#bl-band-meta').textContent = topic.blurb;

    /* The SAME picture the overview gives this topic, so arriving here from a
       tile lands on the image that was just clicked rather than on a different
       one — the tile is the door and this is the room behind it. For Travel
       Ideas, whose tile is a film, that is the film's own poster frame.

       Falls back to the topic's newest post, which is what the band showed
       before any art was supplied and is still the honest stand-in if a plate
       ever goes missing. */
    const lead = posts[0];
    const img = $('#bl-band-img');
    const src = topic.art ? ART + topic.art + '-1600.webp'
              : lead ? UI.fullImg(lead.slug) : '';
    if (src) {
      img.src = src;
      /* The band is decoration for a heading that already says the topic, so
         the picture is announced as nothing rather than described twice. */
      img.alt = '';
      img.addEventListener('error', function () {
        /* No picture: the band keeps its dark ground and the type still reads
           against it, which is why .bl-band carries a background of its own. */
        this.remove();
      }, { once: true });
    } else {
      img.remove();
    }

    $('#bl-chips').innerHTML = DATA.topics.map((t) =>
      `<a class="bl-chip${t.id === id ? ' is-on' : ''}" href="${esc(UI.topicHref(t.id))}"
        ${t.id === id ? 'aria-current="page"' : ''}>${esc(t.name)}
        <span class="bl-chip-n">${UI.inTopic(t.id).length}</span></a>`).join('');
  }

  function more() {
    const next = posts.slice(shown, shown + PAGE);
    $('#bl-grid').insertAdjacentHTML('beforeend',
      next.map((p, i) => UI.card(p, { eager: shown === 0 && i < 3 })).join(''));
    UI.wireCards($('#bl-grid'));
    shown += next.length;

    const left = posts.length - shown;
    const btn = $('#bl-more');
    btn.hidden = left <= 0;
    /* Says how many are left rather than "load more": the reader is 24 into a
       list whose length they have no other way to feel. */
    btn.textContent = left > 0 ? 'Show ' + Math.min(PAGE, left) + ' more of ' + left : '';

    /* A new run of cards changes the document height, and every ScrollTrigger
       on the page caches its start against the old layout — the footer's
       reveal is a gsap.from(opacity:0) and would stay invisible. */
    if (window.ScrollTrigger) requestAnimationFrame(() => window.ScrollTrigger.refresh());
  }

  head();
  more();

  $('#bl-more').addEventListener('click', () => {
    const first = $('#bl-grid').children[shown];
    more();
    /* Focus the first of the new cards, or the reader who pressed the button
       is left at the bottom of the page with no idea what changed. */
    const link = first && first.querySelector('.bl-card-link');
    if (link) link.focus({ preventScroll: true });
  });
}());
