/* ===================================================
   Jayco — the Side by side comparison table
   ---------------------------------------------------
   Shared by compare.html and floorplans.html, so the two pages draw ONE table
   rather than two copies that drift apart. This file is markup only: it turns
   a list of plans into the table. Each page owns where it goes and how it opens
   — below the grid on the compare page, in an overlay on the floorplans page.

   Ported from version-4's renderSpecs(): a label column plus one column per
   plan, rows unioned across the columns so a spec one plan publishes and
   another does not still gets a row, filled with an em dash. Group keys are
   stable across Jayco's data; row keys are not.

   A plan here needs: key, name, model, year, modelImg, img, price, sleeps,
   lengthText, weight, slide, specs.
   =================================================== */

window.JAYCO_COMPARE_TABLE = (function () {
  'use strict';

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = (n) => '$' + Math.round(n).toLocaleString('en-US');

  const GROUPS = ['Weights', 'Measurements', 'Tank Capacities', 'Miscellaneous'];

  /* The label is wrapped rather than set directly on the cell so it can be made
     sticky on a phone. A sticky element is clamped to its containing block, and
     this cell already spans the whole table — no room to shift, so sticking the
     cell itself does nothing. The span has the full cell to slide within. */
  const groupRow = (name, n) =>
    `<tr class="cmp-group"><th colspan="${n + 1}"><span class="cmp-group-label">${esc(name)}</span></th></tr>`;

  function specRow(label, vals) {
    return `<tr>
      <td class="cmp-key">${esc(label)}</td>
      ${vals.map((v, i) => `<td class="cmp-col cmp-col-${i}">${v == null || v === '' ? '&mdash;' : esc(v)}</td>`).join('')}
    </tr>`;
  }

  function html(cols) {
    const head = `<tr><th class="cmp-key">Specification</th>${cols.map((r, i) => `
      <th class="cmp-col cmp-col-${i}">
        <span class="cmp-col-head">
          <span class="cmp-col-media">
            <span class="cmp-col-render-box"><img class="cmp-col-render" src="${esc(r.modelImg)}" alt="" /><span class="cmp-media-note">Exterior images may differ.</span></span>
            <span class="cmp-col-plan-box"><img class="cmp-col-plan" src="${esc(r.img)}" alt="${esc(r.model + ' ' + r.name)} floorplan" /></span>
          </span>
          <span class="cmp-col-text">
            <span class="cmp-col-name">${esc(r.name)}</span>
            <span class="cmp-col-model"><span class="cmp-col-year">${esc(r.year)} </span>${esc(r.model)}</span>
            <span class="cmp-col-price">${r.price == null ? 'Pricing to come' : money(r.price)}</span>
          </span>
        </span>
      </th>`).join('')}</tr>`;

    /* The headline four first — they are why someone opened this view. */
    const lead = [
      ['Sleeps',     cols.map((r) => (r.sleeps || null))],
      ['Length',     cols.map((r) => r.lengthText)],
      ['Dry weight', cols.map((r) => (r.weight ? r.weight.toLocaleString('en-US') + ' lb' : null))],
      ['Slide-out',  cols.map((r) => (r.slide ? 'Yes' : 'No'))],
    ];

    const body = [];
    body.push(groupRow('At a glance', cols.length));
    lead.forEach(([label, vals]) => body.push(specRow(label, vals)));

    GROUPS.forEach((g) => {
      /* union of row keys, in the order Jayco lists them */
      const keys = [];
      cols.forEach((r) => Object.keys((r.specs && r.specs[g]) || {}).forEach((k) => {
        if (keys.indexOf(k) === -1) keys.push(k);
      }));
      if (!keys.length) return;
      body.push(groupRow(g, cols.length));
      keys.forEach((k) => body.push(specRow(k, cols.map((r) => (r.specs && r.specs[g] && r.specs[g][k]) || null))));
    });

    /* No column switcher. On a phone the table scrolls sideways instead, which
       keeps all three plans in one continuous surface — the whole point of the
       view is reading them against each other, and a switcher made that a memory
       test. The spec label column stays pinned so a row never loses its name. */
    return `
      <div class="cmp-table-scroll" tabindex="0" role="region" aria-label="Floorplan specifications, scrolls sideways">
        <div class="cmp-view-head">
          <h2 class="cmp-view-title">Side by side</h2>
        </div>
        <table class="cmp-table">
          <thead>${head}</thead>
          <tbody>${body.join('')}</tbody>
        </table>
      </div>`;
  }

  return { html: html };
}());
