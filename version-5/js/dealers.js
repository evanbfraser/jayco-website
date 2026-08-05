/* ===================================================
   Jayco — Find a Dealer
   ---------------------------------------------------
   428 real dealers from window.JAYCO_DEALERS (see
   dealer-data.js for how they were harvested). Nothing
   on this page is invented: every name, address, phone
   and coordinate is Jayco's own published value.

   THE MAP IS OPTIONAL, THE PAGE IS NOT
   Google Maps needs an API key, and this repo has none
   yet. Rather than ship a page that is broken until a
   key arrives, the map is treated as an enhancement:
   search, geolocation, distance sorting, filtering and
   the result list all work without it, and the map area
   shows a real placeholder instead of Google's grey
   "for development purposes only" tile. Paste a key
   into GOOGLE_MAPS_KEY below and the map lights up with
   no other change.

   LOCATION IS OFFERED, NEVER TAKEN
   getCurrentPosition only ever runs from a press on
   "Use my location". It also needs a secure context, so
   on plain http (a phone hitting a LAN IP, for example)
   it will fail — which is why the typed-address path is
   built as an equal, not as an error state.
   =================================================== */

(function () {
  'use strict';

  /* ---------------------------------------------------
     Paste a Google Maps JavaScript API key here.
     Enable "Maps JavaScript API" and "Geocoding API" on
     the project, and restrict the key by HTTP referrer.
     Empty string = the page runs in list-only mode.
     --------------------------------------------------- */
  const GOOGLE_MAPS_KEY = '';

  const DATA = window.JAYCO_DEALERS || { dealers: [] };
  const ALL = DATA.dealers || [];
  const $ = (s, c) => (c || document).querySelector(s);

  if (!$('#dealers') || !ALL.length) return;

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const state = {
    origin: null,        // {lat,lng,label} once located
    service: 'all',
    model: '',
    query: '',           // free text, matched against dealer name and city
    stateCode: '',       // exact state/province filter, e.g. 'ID'
    zipPrefix: '',       // US ZIP region when a ZIP cannot be geocoded
    view: null,          // {lat,lng,zoom} the map should frame, if any
    hoisted: null,       // slug picked ON THE MAP, pinned to the top of the list
    selected: null,      // slug
    limit: 40,           // rendered rows; the full set is 428
  };

  /* Typing a place name is the fallback when geolocation is unavailable, so it
     has to resolve more than exact hits — the old homepage search matched 23
     city names by substring and silently did nothing for everything else.
     "Boise" has no dealer, but it is in Idaho and Meridian is 12 miles away. */
  const STATES = {
    alabama: 'AL', alaska: 'AK', arizona: 'AZ', arkansas: 'AR', california: 'CA',
    colorado: 'CO', connecticut: 'CT', delaware: 'DE', florida: 'FL', georgia: 'GA',
    hawaii: 'HI', idaho: 'ID', illinois: 'IL', indiana: 'IN', iowa: 'IA',
    kansas: 'KS', kentucky: 'KY', louisiana: 'LA', maine: 'ME', maryland: 'MD',
    massachusetts: 'MA', michigan: 'MI', minnesota: 'MN', mississippi: 'MS',
    missouri: 'MO', montana: 'MT', nebraska: 'NE', nevada: 'NV',
    'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM', 'new york': 'NY',
    'north carolina': 'NC', 'north dakota': 'ND', ohio: 'OH', oklahoma: 'OK',
    oregon: 'OR', pennsylvania: 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
    'south dakota': 'SD', tennessee: 'TN', texas: 'TX', utah: 'UT', vermont: 'VT',
    virginia: 'VA', washington: 'WA', 'west virginia': 'WV', wisconsin: 'WI',
    wyoming: 'WY', alberta: 'AB', 'british columbia': 'BC', manitoba: 'MB',
    'new brunswick': 'NB', 'newfoundland and labrador': 'NL', 'nova scotia': 'NS',
    ontario: 'ON', 'prince edward island': 'PE', quebec: 'QC', 'québec': 'QC',
    saskatchewan: 'SK',
  };
  const STATE_CODES = new Set(Object.values(STATES));

  const centroid = (rows) => ({
    lat: rows.reduce((s, d) => s + d.lat, 0) / rows.length,
    lng: rows.reduce((s, d) => s + d.lng, 0) / rows.length,
  });

  /* ---------- Distance ----------
     Haversine. Canada gets kilometres, everywhere else miles — a Canadian
     dealer listing distances in miles reads as an oversight. */
  const R_KM = 6371;
  const rad = (d) => (d * Math.PI) / 180;
  function distanceKm(a, b) {
    const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
    const s = Math.sin(dLat / 2) ** 2 +
      Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * R_KM * Math.asin(Math.sqrt(s));
  }
  function distanceLabel(km, country) {
    if (country === 'CA') return Math.round(km).toLocaleString('en-US') + ' km';
    return Math.round(km * 0.621371).toLocaleString('en-US') + ' mi';
  }

  /* ---------- Filtering ----------
     The query matches city, state, ZIP or dealer name so that typing
     "Boise", "ID" or "83702" all land somewhere sensible. */
  function matches(d) {
    if (state.model && d.models.indexOf(state.model) < 0) return false;
    /* hasService is null on every record — Jayco publishes none. The control is
       disabled in the markup; this guard is here so the filter starts working
       the moment real data lands, without a code change. */
    if (state.service === 'yes' && d.hasService !== true) return false;
    /* Exact, not substring: a two-letter code like "ID" appears inside plenty of
       dealer names, so loose matching would pull in unrelated states. */
    if (state.stateCode && d.state !== state.stateCode) return false;
    if (state.zipPrefix && (d.country !== 'US' || d.zip.indexOf(state.zipPrefix) !== 0)) return false;
    if (state.query) {
      const q = state.query.toLowerCase();
      if ((d.city + ' ' + d.name).toLowerCase().indexOf(q) < 0) return false;
    }
    return true;
  }

  function results() {
    const rows = ALL.filter(matches);
    if (state.origin) {
      rows.forEach((d) => { d._km = distanceKm(state.origin, d); });
      rows.sort((a, b) => a._km - b._km);
    } else {
      rows.sort((a, b) => (a.state + a.city).localeCompare(b.state + b.city));
    }
    /* A dealer picked on the MAP jumps to the top, so the answer to "what did I
       just tap?" is the first thing in the list rather than something to hunt
       for. Only map picks hoist — clicking a card would otherwise yank the row
       out from under the finger that just tapped it. The distance label still
       reads correctly, so the ordering below it stays honest. */
    if (state.hoisted) {
      const i = rows.findIndex((d) => d.slug === state.hoisted);
      if (i > 0) rows.unshift(rows.splice(i, 1)[0]);
    }
    return rows;
  }

  /* ---------- Result list ---------- */
  function card(d) {
    const dist = state.origin
      ? `<span class="dl-dist">${distanceLabel(d._km, d.country)}</span>` : '';
    const tel = d.phone
      ? `<a class="dl-tel" href="tel:${esc(d.phone.replace(/[^\d+]/g, ''))}">${esc(d.phone)}</a>` : '';
    const dir = `https://maps.google.com/maps?daddr=${encodeURIComponent(
      [d.street, d.city + ', ' + d.state + ' ' + d.zip, d.country].filter(Boolean).join(' '))}`;
    return `
    <li class="dl-card${state.selected === d.slug ? ' is-selected' : ''}" data-slug="${esc(d.slug)}">
      <button type="button" class="dl-card-hit" data-slug="${esc(d.slug)}">
        <span class="dl-card-top">
          <span class="dl-card-name">${esc(d.name)}</span>
          ${dist}
        </span>
        <span class="dl-card-addr">${esc(d.street)}<br />${esc(d.city)}, ${esc(d.state)} ${esc(d.zip)}</span>
      </button>
      <span class="dl-card-acts">
        ${tel}
        <a class="dl-link" href="${esc(dir)}" target="_blank" rel="noopener">Directions</a>
        <a class="dl-link" href="${esc(d.url || ('https://www.jayco.com/dealers/' + d.slug + '/'))}"
           target="_blank" rel="noopener">Dealer page</a>
      </span>
    </li>`;
  }

  function renderResults() {
    const rows = results();
    const shown = rows.slice(0, state.limit);
    let html = shown.map(card).join('');
    if (rows.length > shown.length) {
      html += `<li class="dl-more"><button type="button" id="dl-more">
        Show ${Math.min(40, rows.length - shown.length)} more</button></li>`;
    }
    $('#dl-results').innerHTML = html;
    $('#dl-empty').hidden = rows.length > 0;

    const near = state.origin ? ` near ${esc(state.origin.label)}`
      : state.zipPrefix ? ` in the ${esc(state.zipPrefix)} ZIP region` : '';
    $('#dl-count').innerHTML = rows.length === ALL.length
      ? `${ALL.length} dealers`
      : `${rows.length} of ${ALL.length} dealers${near}`;
    $('#dl-grip-label').textContent = rows.length === 1 ? '1 dealer' : rows.length + ' dealers';

    const dirty = !!(state.query || state.model || state.origin || state.zipPrefix || state.service !== 'all');
    $('#dl-reset').hidden = !dirty;

    drawMarkers(rows);
    refresh();
  }

  /* ---------- Map ----------
     Two renderers behind one small interface, chosen at boot:

       no key      -> Leaflet + CARTO tiles. No account, no key, a real map.
       key set     -> Google, with true brand cartography and real geocoding.
       neither     -> the placeholder panel.

     The page only ever asks a map for four things — init, setMarkers, focus,
     showInfo — so neither renderer knows the other exists. Leaflet is also what
     index.html already uses and what PRODUCT.md documents for this project. */
  let mapApi = null;                       // the active renderer
  let markers = [];                        // renderer-specific marker handles

  /* Brand cartography for the Google path. The Leaflet path gets the equivalent
     from a CSS filter over the tile pane — see .leaflet-tile-pane in dealers.css. */
  const MAP_STYLE = [
    { elementType: 'geometry', stylers: [{ color: '#FBFCFE' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#5C5652' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#FBFCFE' }] },
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', stylers: [{ visibility: 'off' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#FFFFFF' }] },
    { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#FFFFFF' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#E8E4DE' }] },
    { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#8A8580' }] },
    { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#E8E4DE' }] },
    { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#C9C3BA' }] },
    { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#F5F2EE' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#CFE4F2' }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#7FA8C4' }] },
  ];

  const popupHtml = (d) =>
    `<span class="dl-pop-name">${esc(d.name)}</span>
     <span class="dl-pop-sub">${esc(d.city)}, ${esc(d.state)}</span>`;

  const HOME = { lat: 44.5, lng: -95, zoom: 4 };

  /* ---- Leaflet: the keyless default ---- */
  function leafletRenderer() {
    let map = null, popup = null;
    return {
      init() {
        map = L.map('dl-map', {
          center: [HOME.lat, HOME.lng],
          zoom: HOME.zoom,
          zoomControl: false,
          /* Lenis owns page scrolling and this page still scrolls to its footer,
             so wheel-zoom would fight it. Pinch and double-click stay on. */
          scrollWheelZoom: false,
          /* Fractional zoom. With Leaflet's default zoomSnap of 1 every pinch is
             rounded to a whole level, so a gentle trackpad gesture computes
             something like 4.14, snaps back to 4, and the map appears frozen
             until the pinch passes ~1.41x. Zero lets the gesture move the map
             continuously, which is what makes it feel like it is working. */
          zoomSnap: 0,
        });
        L.control.zoom({ position: 'topright' }).addTo(map);

        /* Trackpad pinch. A pinch on a touchpad arrives as a wheel event with
           ctrlKey set — the browser's own convention — so we can zoom on that
           and leave a plain two-finger scroll to the page. Turning Leaflet's
           scrollWheelZoom on instead would swallow every scroll and trap the
           user on the map. Touch pinch on a phone is Leaflet's touchZoom, which
           is on by default. */
        const el = map.getContainer();

        /* Chrome and Firefox on macOS report a trackpad pinch as a wheel event
           with ctrlKey set. Lenis deliberately ignores those (`if (ctrlKey)
           return`), so this does not fight the page scroller. */
        el.addEventListener('wheel', (e) => {
          if (!e.ctrlKey) return;
          e.preventDefault();
          /* deltaY is roughly ±1–10 per pinch step; scale it down so a gesture
             glides instead of jumping whole zoom levels. */
          map.setZoomAround(
            map.mouseEventToLatLng(e),
            map.getZoom() - e.deltaY * 0.03
          );
        }, { passive: false });

        /* Safari does NOT synthesise ctrl+wheel for a trackpad pinch — it fires
           its own non-standard gesturestart/change/end instead, and Leaflet has
           no handling for them at all. Without this block, pinch-zoom simply
           does nothing on a Mac in Safari, which is most of the review audience.
           event.scale is cumulative since gesturestart, so log2 converts it to
           zoom levels, and anchoring on the latlng grabbed at the start keeps
           the point under the cursor still. */
        let gestureZoom = null, gestureAt = null;
        /* A Safari GestureEvent is not a MouseEvent. It does carry clientX/Y, but
           fall back to the centre rather than let a bad anchor kill the zoom. */
        const anchorOf = (e) => {
          try {
            if (e.clientX != null && e.clientY != null) return map.mouseEventToLatLng(e);
          } catch (err) { /* fall through */ }
          return map.getCenter();
        };
        el.addEventListener('gesturestart', (e) => {
          e.preventDefault();
          gestureZoom = map.getZoom();
          gestureAt = anchorOf(e);
        }, { passive: false });
        el.addEventListener('gesturechange', (e) => {
          e.preventDefault();
          if (gestureZoom == null || !e.scale) return;
          map.setZoomAround(gestureAt || map.getCenter(), gestureZoom + Math.log2(e.scale));
        }, { passive: false });
        el.addEventListener('gestureend', (e) => {
          e.preventDefault();
          gestureZoom = null; gestureAt = null;
        }, { passive: false });
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 18,
        }).addTo(map);
        popup = L.popup({ closeButton: false, offset: [0, -12] });
      },
      setMarkers(rows) {
        markers.forEach((m) => m.remove());
        markers = [];
        rows.forEach((d) => {
          const on = state.selected === d.slug;
          const m = L.marker([d.lat, d.lng], {
            title: d.name,
            icon: L.divIcon({
              className: 'dl-pin' + (on ? ' is-selected' : ''),
              html: '<span></span>',
              iconSize: [16, 16], iconAnchor: [8, 8], popupAnchor: [0, -6],
            }),
          }).addTo(map);
          m.on('click', () => select(d.slug, true));
          markers.push(m);
        });
      },
      focus(lat, lng, zoom) {
        map.panTo([lat, lng]);
        if (zoom && map.getZoom() < zoom) map.setZoom(zoom);
      },
      /* animate:false — a search result should arrive, not fly. A pan animation
         across the continent is slow to watch and leaves the pins mid-transform
         for anything that measures right after. */
      frame(lat, lng, zoom) { map.setView([lat, lng], zoom, { animate: false }); },
      showInfo(d) {
        popup.setLatLng([d.lat, d.lng]).setContent(popupHtml(d)).openOn(map);
      },
      /* Leaflet measures its container once; if the box changed since then it
         paints grey bands. app.js hits the same thing on the homepage map. */
      resize() { if (map) map.invalidateSize(); },
    };
  }

  /* ---- Google: the opt-in upgrade ---- */
  function googleRenderer() {
    let map = null, infow = null;
    const pin = (selected) => ({
      path: 'M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20c0-6.6-5.4-12-12-12z',
      fillColor: selected ? '#005E96' : '#007AC2',
      fillOpacity: 1,
      strokeColor: '#FFFFFF',
      strokeWeight: 2,
      scale: selected ? 1.05 : 0.8,
      anchor: new google.maps.Point(12, 32),
    });
    return {
      init() {
        map = new google.maps.Map($('#dl-map'), {
          center: { lat: HOME.lat, lng: HOME.lng },
          zoom: HOME.zoom,
          styles: MAP_STYLE,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          /* Top-right, matching the Leaflet renderer: the floating panel owns the
             top-left and the chat button owns bottom-right. */
          zoomControl: true,
          zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_TOP },
          clickableIcons: false,
        });
        infow = new google.maps.InfoWindow();
      },
      setMarkers(rows) {
        markers.forEach((m) => m.setMap(null));
        markers = [];
        rows.forEach((d) => {
          const m = new google.maps.Marker({
            position: { lat: d.lat, lng: d.lng },
            map, title: d.name, icon: pin(state.selected === d.slug),
          });
          m.addListener('click', () => select(d.slug, true));
          markers.push(m);
        });
      },
      focus(lat, lng, zoom) {
        map.panTo({ lat: lat, lng: lng });
        if (zoom && map.getZoom() < zoom) map.setZoom(zoom);
      },
      frame(lat, lng, zoom) { map.setCenter({ lat: lat, lng: lng }); map.setZoom(zoom); },
      showInfo(d) {
        infow.setContent(`<div class="dl-pop">${popupHtml(d)}</div>`);
        const m = markers.find((x) => x.getTitle() === d.name);
        if (m) infow.open({ anchor: m, map });
      },
      resize() {},
    };
  }

  /* How far to pull back depends on how sparse the dealers actually are around
     here, not on a fixed number. A flat city-level zoom framed Meridian, ID with
     exactly one pin on screen because the next dealer is 78 miles away, which
     reads as a broken map. Frame on the 5th nearest so there is always a
     neighbourhood to compare. */
  function autoZoom(rows) {
    const kth = rows[Math.min(4, rows.length - 1)];
    const km = kth && kth._km != null ? kth._km : 60;
    if (km < 25) return 10;
    if (km < 60) return 9;
    if (km < 150) return 8;
    if (km < 400) return 7;
    if (km < 900) return 6;
    return 5;
  }

  function drawMarkers(rows) {
    if (!mapApi) return;
    /* With no origin this is the overview of the whole network, so it has to be
       the whole network — an earlier cap of 120 silently kept only the
       alphabetically-first states and drew a continent with a hole in it.
       Once there IS an origin the nearest 120 is plenty, and that is also the
       case where marker count would otherwise cost the most. */
    mapApi.setMarkers(state.origin ? rows.slice(0, 120) : rows);
    /* frame(), not focus(): a new search sets the view outright. focus() only
       ever zooms IN, so searching a whole state right after selecting a single
       dealer would have kept the street-level zoom and shown one pin.
       Driven by state.view rather than state.origin, because a ZIP region has a
       place to look at but no honest point to measure distances from. */
    if (state.view) {
      const z = state.view.zoom === 'auto' ? autoZoom(rows) : state.view.zoom;
      mapApi.frame(state.view.lat, state.view.lng, z);
    }
  }

  function select(slug, fromMap) {
    state.selected = slug;
    state.hoisted = fromMap ? slug : null;
    const d = ALL.find((x) => x.slug === slug);
    renderResults();
    if (!d) return;
    if (mapApi) {
      mapApi.focus(d.lat, d.lng, 9);
      mapApi.showInfo(d);
    }
    if (!fromMap) return;

    const reveal = () => {
      /* Hoisting puts it at index 0, so this is a scroll to the top of the list
         rather than a hunt through it. */
      const list = $('#dl-results');
      if (list) {
        list.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      }
    };
    /* Tapping a pin on a phone should bring the sheet up with it — otherwise the
       selection happens somewhere the user cannot see. It goes to the top stop
       (80dvh), not the half stop, so the dealer that was just picked arrives with
       the rest of the list under it rather than alone in a letterbox. */
    if (isMobile() && snap < 2) snapTo(2, reveal); else reveal();
  }

  /* Only reached if neither renderer is available — Leaflet failed to load, or
     a key was set and Google's script errored. */
  function renderMapPlaceholder(msg) {
    const el = $('#dl-map-fallback');
    el.hidden = false;
    $('#dl-map').hidden = true;
    el.innerHTML = `
      <div class="dl-fallback-inner">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M9 20l-6 2V6l6-2 6 2 6-2v16l-6 2-6-2z" /><path d="M9 4v16M15 6v16" />
        </svg>
        <p class="dl-fallback-title">Map unavailable</p>
        <p class="dl-fallback-body">${esc(msg)} Search, distance and filtering all work without it.</p>
      </div>`;
  }

  /* Order matters. Leaflet fixes its projection origin against the container
     size it sees at init, and markers added before that settles land at stale
     pixel positions — scattered well outside the viewport rather than obviously
     broken. So: build, let layout settle, tell it the real size, and only then
     add pins. */
  function start(renderer) {
    mapApi = renderer;
    mapApi.init();
    requestAnimationFrame(() => {
      mapApi.resize();
      renderResults();
    });
  }

  function loadMap() {
    if (GOOGLE_MAPS_KEY) {
      window.__dlMapReady = () => start(googleRenderer());
      const s = document.createElement('script');
      s.src = 'https://maps.googleapis.com/maps/api/js?key=' +
        encodeURIComponent(GOOGLE_MAPS_KEY) + '&callback=__dlMapReady&loading=async';
      s.async = true;
      s.onerror = () => renderMapPlaceholder('Google Maps could not be loaded.');
      document.head.appendChild(s);
      return;
    }
    if (typeof L !== 'undefined') { start(leafletRenderer()); return; }
    renderMapPlaceholder('The map library could not be loaded.');
  }

  /* ---------- Locating ---------- */
  function note(msg, kind) {
    const el = $('#dl-note');
    el.hidden = !msg;
    el.textContent = msg || '';
    el.className = 'dl-note' + (kind ? ' is-' + kind : '');
  }

  /* zoom rides along with the origin: a whole state wants a wider frame than a
     single ZIP, and focusing every search at the same level made "Texas" look
     like a street map of one suburb. */
  function setOrigin(lat, lng, label, zoom) {
    state.origin = { lat: lat, lng: lng, label: label, zoom: zoom || 8 };
    state.view = { lat: lat, lng: lng, zoom: zoom || 8 };   // may be 'auto'
    state.limit = 40;
    renderResults();
  }

  function locate() {
    if (!navigator.geolocation) {
      note('This browser cannot share a location. Type a city or ZIP instead.', 'warn');
      $('#dl-input').focus();
      return;
    }
    /* Geolocation is a secure-context API. On plain http — a phone on a LAN
       address, say — it fails, so send people to the field rather than leaving
       a spinner running. */
    if (!window.isSecureContext) {
      note('Location needs a secure (https) connection. Type a city or ZIP instead.', 'warn');
      $('#dl-input').focus();
      return;
    }
    note('Finding you…');
    $('#dl-locate').disabled = true;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        $('#dl-locate').disabled = false;
        note('');
        setOrigin(pos.coords.latitude, pos.coords.longitude, 'you', 'auto');
      },
      (err) => {
        $('#dl-locate').disabled = false;
        note(err.code === err.PERMISSION_DENIED
          ? 'Location permission denied. Type a city or ZIP instead.'
          : 'Could not get your location. Type a city or ZIP instead.', 'warn');
        $('#dl-input').focus();
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 });
  }

  /* Typed search. With a key we geocode properly; without one we match against
     the dealers' own city/state/ZIP values, which is enough to centre the list
     on a real place because every dealer carries a real address. */
  function clearSearch() {
    state.query = ''; state.stateCode = ''; state.zipPrefix = ''; state.origin = null; state.view = null;
    state.hoisted = null;
  }

  function runSearch() {
    const raw = $('#dl-input').value.trim();
    state.limit = 40;
    if (!raw) { clearSearch(); note(''); renderResults(); return; }
    const q = raw.toLowerCase();

    /* 1. A state or province, by name or code. Anchors the list to that state
          and sorts from its centre, so "Idaho" is a useful answer. */
    const code = STATES[q] || (STATE_CODES.has(raw.toUpperCase()) ? raw.toUpperCase() : '');
    if (code) {
      const rows = ALL.filter((d) => d.state === code);
      if (rows.length) {
        clearSearch();
        state.stateCode = code;
        const c = centroid(rows);
        note('');
        setOrigin(c.lat, c.lng, code, 5);          // a state, not a street
        return;
      }
    }

    /* 2. An exact city, "City, ST", or ZIP that a dealer actually sits in. */
    const exact = ALL.find((d) =>
      d.zip.toLowerCase() === q ||
      d.city.toLowerCase() === q ||
      (d.city + ', ' + d.state).toLowerCase() === q);
    if (exact) {
      clearSearch(); note('');
      setOrigin(exact.lat, exact.lng, exact.city + ', ' + exact.state, 'auto');
      return;
    }

    /* 3. A ZIP with no dealer sitting in it. US ZIPs are allocated
          geographically, so a shared leading prefix is a real regional signal —
          but it is only that. Without a geocoder this ZIP has no coordinates, so
          the page narrows to the region and shows NO distances rather than
          measuring from a guessed point. An earlier pass anchored the origin on
          whichever prefix-sharing dealer happened to come first, which rendered
          a Boise ZIP as "Idaho Falls — 0 mi": a number that was simply invented.
          Region filtering is less precise and honest; a key upgrades it. */
    if (/^\d{5}(-\d{4})?$/.test(raw)) {
      for (let len = 3; len >= 2; len--) {
        const p = raw.slice(0, len);
        const inRegion = ALL.filter((d) => d.country === 'US' && d.zip.indexOf(p) === 0);
        if (inRegion.length) {
          clearSearch();
          state.zipPrefix = p;
          /* A view, not an origin: the map can look at the region, but with no
             geocoder there is no defensible point to measure distances from. */
          const c = centroid(inRegion);
          state.view = { lat: c.lat, lng: c.lng, zoom: inRegion.length > 3 ? 6 : 8 };
          note('Showing dealers in the ' + p + ' ZIP region. Add a Maps key for exact distances.');
          renderResults();
          return;
        }
      }
    }

    /* 4. With a key, ask Google — this is the only path that resolves a place
          with no dealer anywhere near it. */
    if (GOOGLE_MAPS_KEY && window.google && window.google.maps && google.maps.Geocoder) {
      new google.maps.Geocoder().geocode({ address: raw }, (res, status) => {
        if (status === 'OK' && res[0]) {
          clearSearch(); note('');
          const l = res[0].geometry.location;
          setOrigin(l.lat(), l.lng(), res[0].formatted_address.split(',').slice(0, 2).join(',').trim(), 'auto');
        } else {
          clearSearch(); state.query = raw;
          note('Nothing found for “' + raw + '”.', 'warn');
          renderResults();
        }
      });
      return;
    }

    /* 5. No key and nothing resolved: fall back to matching dealer and city
          names, and say so rather than showing a bare zero. */
    clearSearch();
    state.query = raw;
    const n = ALL.filter(matches).length;
    note(n ? '' : 'No dealer matches “' + raw + '”. Try a state, or a ZIP code.', 'warn');
    renderResults();
  }

  /* ---------- Mobile sheet ----------
     Peek / half / full, driven by a class. The height is published as a custom
     property so the map can keep its centre clear of the sheet, measured rather
     than assumed — the same lesson measureTray() records on the compare page. */
  const SNAPS = ['is-peek', 'is-half', 'is-full'];
  let snap = 1;

  const isMobile = () => window.matchMedia('(max-width: 900px)').matches;

  /* Collapsed still shows the eyebrow, the title and the search field — closing
     the sheet is for seeing the map, not for losing the way to search it. The
     CSS peek height is sized to the bottom of that input. */
  function snapTo(i, after) {
    const p = $('#dl-panel');
    const changed = i !== snap;
    snap = i;
    applySnap();
    if (!after) return;
    /* Wait for the slide to land before touching the list: at peek the results
       have no height to scroll within. */
    if (!changed || prefersReducedMotion()) { after(); return; }
    let done = false;
    const finish = (e) => {
      if (done || (e && e.propertyName !== 'transform')) return;
      done = true;
      p.removeEventListener('transitionend', finish);
      after();
    };
    p.addEventListener('transitionend', finish);
    setTimeout(finish, 420);      // transitionend can be skipped; never strand the callback
  }

  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Read the snap heights out of the CSS rather than restating them here. The
     numbers live in dealers.css (12rem / 52dvh / 80dvh), and a second
     copy in JS would drift the first time either is tuned. Measured while
     .is-dragging suppresses the transition, so the boxes report final values. */
  function snapHeights() {
    const p = $('#dl-panel');
    const keep = p.className;
    const out = SNAPS.map((c) => {
      p.className = 'dl-panel is-dragging ' + c;
      return Math.round(window.innerHeight - p.getBoundingClientRect().top);
    });
    p.className = keep;
    return out;
  }

  /* Drag the top of the sheet to size it by hand. Pointer events cover touch,
     pen and mouse in one path; touch-action:none on the grip stops the browser
     treating the same gesture as a page scroll. */
  let lastDragEnd = 0;

  function wireDrag() {
    const p = $('#dl-panel');
    const grip = $('#dl-grip');
    let d = null;

    grip.addEventListener('pointerdown', (e) => {
      if (!isMobile()) return;
      const heights = snapHeights();
      p.classList.add('is-dragging');
      d = {
        id: e.pointerId,
        y: e.clientY,
        from: Math.round(window.innerHeight - p.getBoundingClientRect().top),
        heights: heights,
        moved: false,
      };
      d.current = d.from;
      grip.setPointerCapture(e.pointerId);
    });

    grip.addEventListener('pointermove', (e) => {
      if (!d || e.pointerId !== d.id) return;
      const dy = d.y - e.clientY;                 // dragging up grows the sheet
      if (Math.abs(dy) > 4) d.moved = true;
      const lo = d.heights[0], hi = d.heights[d.heights.length - 1];
      d.current = Math.max(lo, Math.min(hi, d.from + dy));
      p.style.transform = 'translateY(' + (p.offsetHeight - d.current) + 'px)';
    });

    const end = (e) => {
      if (!d || (e && e.pointerId !== d.id)) return;
      const landed = d.current, heights = d.heights, moved = d.moved;
      d = null;
      p.style.transform = '';
      p.classList.remove('is-dragging');
      if (!moved) return;                        // a tap: leave it to the click handler
      /* Snap to whichever stop the drag finished nearest. */
      let best = 0;
      heights.forEach((h, i) => {
        if (Math.abs(h - landed) < Math.abs(heights[best] - landed)) best = i;
      });
      snapTo(best);
      /* A drag is followed by a click, which would immediately toggle the sheet
         back. Suppress by time rather than by a flag: a flag cleared on a timer
         can race the click, and a flag cleared BY the click lingers and eats the
         next genuine tap if no click ever arrives. */
      lastDragEnd = Date.now();
    };
    grip.addEventListener('pointerup', end);
    grip.addEventListener('pointercancel', end);
  }

  function applySnap() {
    const p = $('#dl-panel');
    SNAPS.forEach((c, i) => p.classList.toggle(c, i === snap));
    $('#dl-grip').setAttribute('aria-expanded', snap === 0 ? 'false' : 'true');
    $('#dl-grip').setAttribute('aria-label',
      snap === 0 ? 'Expand dealer list' : 'Collapse dealer list to see the map');
    p.classList.toggle('is-collapsed', snap === 0);
    /* At the top stop the sheet covers 80dvh and there is nowhere left to lift
       the chat button to — pushing it any higher parks it in the header. Fade it
       out instead; CSS keys off this class. */
    document.body.classList.toggle('dl-sheet-full', snap === 2);
    measurePanel();
  }

  /* The sheet is full-height and translated down, so its rect height is the
     whole thing — what the chat button and the map need is the VISIBLE strip,
     which is whatever sits below its translated top edge. Measured, not derived
     from the snap constants, so it stays correct if those change. */
  /* The map sits flush under the nav bar, so the bar's height has to be measured
     rather than assumed: it ranges from about 65px to 114px depending on how the
     nav wraps, and app.js shrinks it again via .scrolled. A fixed value put the
     map under the bar at some widths and left a gap at others. */
  function measureHeader() {
    const h = document.querySelector('.site-header');
    if (!h) return;
    const px = Math.round(h.getBoundingClientRect().height);
    if (px > 0) document.documentElement.style.setProperty('--dl-top', px + 'px');
    if (mapApi) mapApi.resize();
  }

  function measurePanel() {
    const p = $('#dl-panel');
    let h = 0;
    if (window.matchMedia('(max-width: 900px)').matches) {
      const top = p.getBoundingClientRect().top;
      h = Math.max(0, Math.round(window.innerHeight - top));
    }
    document.documentElement.style.setProperty('--dl-sheet-h', h + 'px');
    /* The stage is inset by that value on a phone, so the map's box just changed.
       Leaflet caches its container size and paints grey bands otherwise. This is
       the one place every size change funnels through — snap, resize and load. */
    if (mapApi) mapApi.resize();
  }

  /* ---------- ScrollTrigger ----------
     app.js reveals the footer with gsap.from(opacity:0) on a ScrollTrigger that
     caches its start against the layout at creation. Anything that changes
     document height has to refresh it or the footer stays invisible. */
  let queued = 0;
  function refresh() {
    if (queued || !window.ScrollTrigger) return;
    queued = requestAnimationFrame(() => { queued = 0; window.ScrollTrigger.refresh(); });
  }

  /* ---------- Wiring ---------- */
  function wire() {
    /* The Search button is type=submit, so the form handler covers both it and
       the Enter key — no separate click listener. */
    $('#dl-search').addEventListener('submit', (e) => { e.preventDefault(); runSearch(); });
    $('#dl-locate').addEventListener('click', locate);

    $('#dl-input').addEventListener('input', () => {
      $('#dl-clear').hidden = !$('#dl-input').value;
    });
    $('#dl-clear').addEventListener('click', () => {
      $('#dl-input').value = '';
      $('#dl-clear').hidden = true;
      state.query = ''; state.origin = null; note('');
      renderResults();
      $('#dl-input').focus();
    });

    $('.dl-seg').addEventListener('click', (e) => {
      const b = e.target.closest('[data-service]');
      if (!b || b.disabled) return;
      state.service = b.dataset.service;
      Array.from($('.dl-seg').children).forEach((x) => x.classList.toggle('is-active', x === b));
      renderResults();
    });

    $('#dl-model').addEventListener('change', (e) => {
      state.model = e.target.value; state.limit = 40; renderResults();
    });

    $('#dl-reset').addEventListener('click', () => {
      clearSearch(); state.model = ''; state.service = 'all';
      state.selected = null; state.limit = 40;
      $('#dl-input').value = ''; $('#dl-clear').hidden = true; $('#dl-model').value = '';
      Array.from($('.dl-seg').children).forEach((x, i) => x.classList.toggle('is-active', i === 0));
      note('');
      renderResults();
    });

    $('#dl-results').addEventListener('click', (e) => {
      const more = e.target.closest('#dl-more');
      if (more) { state.limit += 40; renderResults(); return; }
      const hit = e.target.closest('[data-slug]');
      if (hit && !e.target.closest('.dl-card-acts')) select(hit.dataset.slug, false);
    });

    /* A toggle, not a cycle: collapsed opens to half, anything open closes. The
       old behaviour made you tap through full to get the map back. */
    $('#dl-grip').addEventListener('click', () => {
      if (Date.now() - lastDragEnd < 300) return;    // the gesture already sized it
      snapTo(snap === 0 ? 1 : 0);
    });
    wireDrag();

    /* applySnap measures immediately, but the slide takes 320ms and the rect is
       still at the old position when the class flips. Re-measure once it lands
       so the chat button and the map inset settle on the real value. With
       reduced motion there is no transition and the first measure was already
       right, so this simply never fires. */
    $('#dl-panel').addEventListener('transitionend', (e) => {
      if (e.propertyName === 'transform') measurePanel();
    });

    window.addEventListener('resize', () => { measureHeader(); measurePanel(); });

    /* app.js adds .scrolled to the header from initHeader(), which runs inside
       initAnimations() — after this script has already booted. Measuring before
       that reads the taller, pre-shrink bar, so re-measure once app.js says it
       is done. This is what jayco:animations-ready is for. */
    document.addEventListener('jayco:animations-ready', measureHeader, { once: true });

    /* The header does not settle at a single moment: app.js adds .scrolled, which
       animates its padding and shrinks the logo, and the nav can rewrap as fonts
       load. Measuring on one event reads it mid-transition and leaves a white
       band between the bar and the map. Watch the box instead and re-measure
       whenever it actually changes. */
    const hdr = document.querySelector('.site-header');
    if (hdr && window.ResizeObserver) {
      new ResizeObserver(measureHeader).observe(hdr);
    } else if (hdr) {
      hdr.addEventListener('transitionend', measureHeader);
    }
  }

  /* ---------- Boot ---------- */
  const models = Array.from(new Set(ALL.flatMap((d) => d.models))).sort();
  $('#dl-model').innerHTML = '<option value="">Any model</option>' +
    models.map((m) => `<option value="${esc(m)}">${esc(m)}</option>`).join('');

  /* ---------- ?model= deep link ----------
     The quiz hands off here. The contract is the DEALER-FACING name — the
     exact string in dealer-data.js `models[]` and therefore the exact value of
     an <option> above — not a models-data slug. Passing a slug would mean a
     second copy of the three-way name table living in this file.

     An unrecognised value shows every dealer and says so, rather than
     filtering to nothing: matches() returns false for every record when
     state.model is a string no dealer carries, which would read as "there are
     no Jayco dealers near you". */
  const wanted = new URLSearchParams(window.location.search).get('model');
  if (wanted) {
    const opt = models.indexOf(wanted) >= 0
      ? wanted
      : models.filter((m) => m.toLowerCase() === wanted.toLowerCase())[0];
    if (opt) {
      state.model = opt;
      $('#dl-model').value = opt;
      note('Showing dealers who carry the ' + opt + '.');
    } else {
      note('We could not narrow that to one model, so this is every Jayco dealer.');
    }
  }

  renderResults();
  wire();
  measureHeader();
  applySnap();
  loadMap();
  window.addEventListener('load', () => { refresh(); measureHeader(); measurePanel(); }, { once: true });
}());
