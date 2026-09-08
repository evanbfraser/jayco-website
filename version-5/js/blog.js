/* ===================================================
   Jayco — Blog overview (blog.html)
   ---------------------------------------------------
   The front door, and only that: eleven topics, each a
   photographic tile with its name set large over it. No
   post cards here — a reader arriving at an archive of
   377 is choosing a subject, not a headline.

   THE PICTURE COMES FROM THE DATA. Every topic carries
   `art`, a supplied photograph exported at 800 and
   1600. picture() still falls back to `lead` — the
   topic's own newest post's picture — for the day a
   plate goes missing, which the build resolves so that
   two topics cannot fall back onto the same one.

   TRAVEL IDEAS IS A FILM. On a pointer device the scroll
   is its transport — see initScrub(). On a phone it
   loops instead, because iOS will not repaint a seeked
   frame; see initFilmLoop().
   =================================================== */

(function () {
  'use strict';

  const DATA = window.JAYCO_BLOG;
  const UI = window.JAYCO_BLOG_UI;
  if (!DATA || !UI) return;

  const $ = (s, c) => (c || document).querySelector(s);
  const esc = UI.esc;

  /* The first tile runs the full width and the rest pair off. Eleven is one
     and then five rows of two, which is why the feature is not decoration —
     without it the last tile would sit alone at the bottom of the grid. */
  const FEATURE = 1;
  const ART = '../assets/blog/web/';

  /* A PHONE CANNOT SCRUB, so it is given the film instead. Confirmed on an
     iPhone: the clip downloads, decodes, and paints its first frame, and then
     every currentTime seek after that leaves the picture exactly where it was.
     The seeks resolve — iOS reports them done — it simply never repaints, so
     the tile reads as a photograph while you scroll past it. Keyframe density
     does not help; the frames are cheap to decode and were never the problem.

     (hover: none) and (pointer: coarse) is the test rather than a width, since
     the thing that fails is the touch stack, not the screen. A small window on
     a laptop still scrubs correctly and still gets the scrub. */
  const COARSE = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

  /* Two widths, and the feature is the one that needs the big one: it is a
     full-width band, where the paired tiles are half of it. */
  function picture(t, feature) {
    const base = t.art || null;
    const src = base ? ART + base + (feature ? '-1600' : '-800') + '.webp'
                     : ART + t.lead + '-1600.webp';
    const srcset = base
      ? ART + base + '-800.webp 800w, ' + ART + base + '-1600.webp 1600w'
      : '';
    return `<img class="bl-tile-img" src="${esc(src)}" alt=""
      ${srcset ? `srcset="${esc(srcset)}" sizes="${feature ? '100vw' : '50vw'}"` : ''}
      ${feature ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" />`;
  }

  /* The film sits where the picture would, with that picture as its poster —
     so the tile looks right before a single byte of video has arrived, and
     looks right for good if it never does.

     muted + playsinline are not politeness here, they are what lets a browser
     hold a video it was never asked to autoplay. preload="auto" is the
     load-bearing one: currentTime cannot be set on a video whose frames have
     not been fetched, so without it the first scroll scrubs a blank box.

     TWO CUTS, CHOSEN IN JS. A <source media="..."> is not honoured for video
     the way it is for a picture — browsers pick the first source they can
     decode and ignore the query — so the choice is made here instead, once, at
     render. A phone gets the 960 at 4.7MB rather than the 1440 at 10.7, which
     on a screen 390 points wide is the same picture for less than half the
     download. */
  function film(t) {
    const small = window.innerWidth <= 820 && t.video960;
    return `<video class="bl-tile-video" id="bl-film-${esc(t.id)}"
      poster="${esc(ART + t.art + '-1600.webp')}"
      muted playsinline preload="auto" aria-hidden="true" tabindex="-1">
      <source src="${esc(ART + (small ? t.video960 : t.video))}" type="video/mp4" />
    </video>`;
  }

  function tile(t, i) {
    const posts = UI.inTopic(t.id);
    if (!posts.length) return '';
    const feature = i < FEATURE;
    return `<li class="bl-tile${feature ? ' is-feature' : ''}">
      <a class="bl-tile-link" href="${esc(UI.topicHref(t.id))}">
        <span class="bl-tile-media">${t.video ? film(t) : picture(t, feature)}</span>
        <span class="bl-tile-scrim" aria-hidden="true"></span>
        <span class="bl-tile-body">
          <span class="bl-tile-n">${posts.length} ${posts.length === 1 ? 'post' : 'posts'}</span>
          <h3 class="bl-tile-name">${esc(t.name)}</h3>
          <span class="bl-tile-blurb">${esc(t.blurb)}</span>
        </span>
      </a>
    </li>`;
  }

  function render() {
    $('#bl-tiles').innerHTML = DATA.topics.map(tile).join('');

    /* A tile with no picture is a dark panel with type on it — which still
       reads, because that ground is painted on the tile rather than on the
       image. So a failed picture is left to fall through to it. */
    Array.prototype.slice.call(document.querySelectorAll('.bl-tile-img')).forEach((img) => {
      img.addEventListener('error', function () { this.remove(); }, { once: true });
    });
  }

  /* ---------- The scroll drives the film ----------
     The tile's pass through the viewport IS the film's timeline: at the moment
     it enters from the bottom the clip is at 0, when it leaves past the top it
     is at the last frame, and the scrollbar is the transport in between. Scrub
     rather than play, so the reader is never watching something they did not
     start, and it runs backwards when they scroll back up.

     DESIGN.md allows one authored motion moment per page and asks that media
     scrub linearly across its pass — this is that moment, and there is nothing
     else moving on this page.

     WHY currentTime AND NOT play(). A play() would run at its own pace and
     ignore the scroll; the clip is encoded for seeking instead — 5.5 seconds
     at 20fps with a keyframe every four frames, so landing on an arbitrary
     frame costs at most three frames of decode, which is microseconds.

     It WAS all-intra, at the same file size, and it looked soft: every frame
     paying full price left about a third of the bitrate for the picture, and
     drone footage of a forest canopy is the worst case for that — SSIM 0.81
     against the source, where a keyframe every four frames scores 0.97 for the
     same bytes. Seek latency was never the thing worth optimising.

     Under prefers-reduced-motion nothing is bound at all: the poster is a
     frame of the film, so the tile still shows what it is a picture of. */
  function initScrub() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (COARSE) return;                       // initFilmLoop has the tile instead

    DATA.topics.filter((t) => t.video).forEach((t) => {
      const video = document.getElementById('bl-film-' + t.id);
      const tile = video && video.closest('.bl-tile');
      if (!video || !tile) return;

      const bind = () => {
        const dur = video.duration;
        if (!dur || !isFinite(dur)) return;
        ScrollTrigger.create({
          trigger: tile,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
          onUpdate: (self) => {
            /* Clamped a hair inside the ends: seeking to exactly duration
               parks some browsers on a blank frame rather than the last one. */
            const at = Math.min(Math.max(self.progress, 0), 0.999) * dur;
            if (Math.abs(video.currentTime - at) > 0.01) video.currentTime = at;
          },
        });
      };

      /* iOS WILL NOT DECODE A FILM NOBODY PLAYED, and this is why the tile
         was a still on a phone while it scrubbed correctly on a desktop.
         preload="auto" is advisory and Safari on iOS declines it: a muted,
         paused <video> that is only ever seeked is never fetched at all, so
         loadedmetadata never fires, bind() below never runs, no ScrollTrigger
         is ever created, and the poster sits there looking like a photograph.
         Nothing errors and nothing logs, which is the hard part.

         The unlock is an actual play(). muted + playsinline is what makes one
         permitted without a user gesture, and pausing the instant it starts
         leaves a decoded frame on screen and a duration in hand — after which
         currentTime seeks render the way they always did. It is harmless
         where preload was already honoured: the clip is silent, it advances
         by a frame at most, and the first scroll overwrites currentTime.

         If play() is refused — iOS Low Power Mode declines even muted inline
         video — load() is the weaker second ask, and if that is refused too
         the tile stays on its poster, which is a frame of the film and reads
         as a deliberate still rather than as a fault. */
      const prime = () => {
        let p;
        try { p = video.play(); } catch (e) { p = null; }
        if (p && p.then) {
          p.then(() => video.pause()).catch(() => { try { video.load(); } catch (e) {} });
        } else {
          video.pause();
        }
      };

      /* Primed as the tile comes within about two screens rather than at
         load: the unlock costs the download, and a phone should not pay for
         a film that is eight screens further down the grid. */
      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries, obs) => {
          if (!entries.some((e) => e.isIntersecting)) return;
          obs.disconnect();
          prime();
        }, { rootMargin: '200% 0px' });
        io.observe(tile);
      } else {
        prime();
      }

      if (video.readyState >= 1) bind();
      else video.addEventListener('loadedmetadata', bind, { once: true });
    });
  }

  /* ---------- Hero parallax ----------
     The plate scrubbed across its own pass at the small magnitude DESIGN.md
     asks for. The travel is read from the CSS so the JS cannot drift past the
     media overhangs: --bl-drift sets both the negative inset on
     .bl-hero-media and the distance moved here. Under prefers-reduced-motion
     the stylesheet sets it to 0 and this returns before binding.

     The hero starts ON SCREEN, so its pass runs from the top of the document
     to the point the band leaves — 'top bottom' would be a start it is already
     past, and the plate would jump to mid-travel on the first scroll.

     Ported from initParallax() in new-to-rving.js and about.js. */
  function initHeroParallax() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    const page = document.querySelector('.blog-page');
    const media = document.querySelector('.bl-hero-media');
    const hero = document.querySelector('.bl-hero');
    if (!page || !media || !hero) return;

    const px = parseFloat(getComputedStyle(page).getPropertyValue('--bl-drift')) || 0;
    if (!px) return;

    gsap.fromTo(media, { yPercent: -px / 2 }, {
      yPercent: px / 2, ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
    });
  }

  /* ---------- The film, on a phone ----------
     Muted, looping, and playing only while the tile is on screen — a film
     that moves is nearer the intent than a still that was meant to.

     THIS IS A DELIBERATE DEVIATION from scroll-as-transport, and it is
     confined to touch devices; every pointer device still gets the scrub the
     page was designed around.

     It is bound off render() rather than off jayco:animations-ready, because
     that event is dispatched at the foot of app.js only once GSAP is up. A
     loop needs no GSAP, and a phone should not lose its film to a CDN that
     did not answer.

     Under prefers-reduced-motion nothing plays and the poster stands, which
     is itself a frame of the film. Pausing off screen is not politeness: an
     autoplaying loop nobody can see is battery for nothing. */
  function initFilmLoop() {
    if (!COARSE) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    DATA.topics.filter((t) => t.video).forEach((t) => {
      const video = document.getElementById('bl-film-' + t.id);
      const tile = video && video.closest('.bl-tile');
      if (!video || !tile) return;

      video.loop = true;
      const play = () => {
        const p = video.play();
        if (p && p.catch) p.catch(() => {});   // refused: the poster stands
      };

      if (!('IntersectionObserver' in window)) { play(); return; }
      new IntersectionObserver((entries) => {
        entries.forEach((e) => (e.isIntersecting ? play() : video.pause()));
      }, { threshold: 0.01 }).observe(tile);
    });
  }

  render();
  initFilmLoop();
  document.addEventListener('jayco:animations-ready', () => {
    initScrub();
    initHeroParallax();
  }, { once: true });
}());
