/* ===================================================
   Jayco — Share row (blog posts, news articles)
   ---------------------------------------------------
   window.JAYCO_SHARE.mount(el, { title, label })
   fills an empty [data-share] element with three
   controls and shows it. The page script calls it once
   it knows the article, so a bad slug never gets a
   share row for "Post not found".

     • Facebook — the sharer URL. A real link, so it
       still works where the popup is blocked.
     • Copy link — the Clipboard API where the page is a
       secure context, and a selected textarea where it
       is not (a phone on the local Wi-Fi address is not).
     • Email — a mailto: with the title and the link.

   The link shared is this page's address without its
   hash, so it is the Netlify URL once deployed.
   =================================================== */

(function () {
  'use strict';

  const ICON = {
    facebook: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.5V4.4c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.4H8v3h2.6V21z"/></svg>',
    link: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
    check: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
    mail: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
  };

  const pageUrl = () => location.href.split('#')[0];

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise((resolve, reject) => {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;';
      document.body.appendChild(ta);
      ta.select();
      ta.setSelectionRange(0, text.length);
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      ta.remove();
      ok ? resolve() : reject(new Error('copy'));
    });
  }

  function mount(el, opts) {
    if (!el) return;
    const title = opts.title || document.title;
    const url = pageUrl();
    const fb = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url);
    const mail = 'mailto:?subject=' + encodeURIComponent(title) +
      '&body=' + encodeURIComponent(title + '\n\n' + url);

    el.innerHTML = `
      <span class="share-label">${opts.label || 'Share'}</span>
      <ul class="share-list" role="list">
        <li><a class="share-btn" href="${fb}" target="_blank" rel="noopener noreferrer" data-share="facebook">
          ${ICON.facebook}<span class="sr-only">Share on Facebook (opens in a new window)</span></a></li>
        <li><button class="share-btn" type="button" data-share="copy">
          <span class="share-icon">${ICON.link}</span><span class="sr-only">Copy link</span></button></li>
        <li><a class="share-btn" href="${mail}" data-share="email">
          ${ICON.mail}<span class="sr-only">Share by email</span></a></li>
      </ul>
      <span class="share-status" role="status" aria-live="polite"></span>`;
    el.hidden = false;

    el.querySelector('[data-share="facebook"]').addEventListener('click', (e) => {
      const w = 600, h = 560;
      const left = Math.max(0, (window.screenX || 0) + (window.outerWidth - w) / 2);
      const top = Math.max(0, (window.screenY || 0) + (window.outerHeight - h) / 2);
      const win = window.open(fb, 'jayco-share', `width=${w},height=${h},left=${left},top=${top}`);
      /* a blocked popup returns null, and then the link opens its tab as usual */
      if (win) { win.opener = null; e.preventDefault(); }
    });

    const copy = el.querySelector('[data-share="copy"]');
    const icon = copy.querySelector('.share-icon');
    const status = el.querySelector('.share-status');
    let timer = null;
    copy.addEventListener('click', () => {
      copyText(url).then(() => {
        copy.classList.add('is-done');
        icon.innerHTML = ICON.check;
        status.textContent = 'Link copied';
      }).catch(() => {
        status.textContent = 'Copy failed — select the address bar instead';
      }).then(() => {
        el.classList.add('has-status');
        clearTimeout(timer);
        timer = setTimeout(() => {
          el.classList.remove('has-status');
          copy.classList.remove('is-done');
          icon.innerHTML = ICON.link;
          setTimeout(() => { status.textContent = ''; }, 300);
        }, 2600);
      });
    });
  }

  window.JAYCO_SHARE = { mount };
}());
