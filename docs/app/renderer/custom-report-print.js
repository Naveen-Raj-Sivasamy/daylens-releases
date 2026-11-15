// Custom report (1.11.2): the report as a page for paper and for email.
//
//  - html(outEl, data, meta)   one self-contained page made from what is on the screen (the "In short"
//                              sentences, the charts, the Summary, By tab and the list), on white, so the
//                              PDF looks like the View whatever theme the app is in
//  - chartImages(data)         the same charts as PNG pictures, for the body of the email (mail programs
//                              don't show SVG)
//
// Nothing here runs in the page it makes: it is plain HTML and CSS, and the window that prints it has
// scripts switched off.
(function () {
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); };

  // the chart colours on paper (the light set from the app's stylesheet)
  var VIZ = '.viz-grid{stroke:#e6e5df;stroke-width:1}.viz-axis{stroke:#c3c2b7;stroke-width:1}' +
    '.viz-tick{fill:#6f6d68;font-size:11px;font-family:Arial,Helvetica,sans-serif}' +
    '.viz-label{fill:#52514e;font-size:11px;font-weight:700;font-family:Arial,Helvetica,sans-serif}' +
    '.viz-dot{stroke:#ffffff;stroke-width:2}';

  var CSS = [
    '@page{size:A4 landscape;margin:11mm}',
    '*{box-sizing:border-box}',
    'html,body{margin:0;padding:0;background:#fff;color:#14201a;font-family:"Segoe UI",Arial,Helvetica,sans-serif;font-size:12px;line-height:1.45;-webkit-print-color-adjust:exact;print-color-adjust:exact}',
    '.pr-head{display:flex;gap:14px;align-items:center;border:2px solid #111;border-radius:12px;background:#8ace00;color:#111;padding:12px 16px;margin-bottom:12px}',
    '.pr-head h1{margin:0;font-size:19px;line-height:1.2}',
    '.pr-head .pr-meta{font-size:11.5px;font-weight:600;margin-top:3px}',
    '.pr-brand{margin-left:auto;font-weight:800;font-size:13px;white-space:nowrap}',
    '.cr-card{border:1px solid #cfd8d2;border-radius:10px;padding:11px 13px;margin-bottom:11px;background:#fff}',
    '.cr-card.keep{break-inside:avoid}',
    '.cr-card h3{margin:0 0 6px;font-size:14px}',
    '.cr-dim{color:#52605a;font-size:11px;margin:4px 0}',
    '.cr-actions{display:block}',
    '.cr-high{margin:0;padding-left:18px;font-size:12.5px;line-height:1.55}',
    '.cr-high li{margin:2px 0}',
    '.cr-scroll{overflow:visible;max-height:none!important;border:0}',
    'table.cr-table{border-collapse:collapse;width:100%;font-size:11px}',
    'table.cr-table thead{display:table-header-group}',
    'table.cr-table tr{break-inside:avoid}',
    'table.cr-table th,table.cr-table td{border:1px solid #cfd8d2;padding:4px 7px;text-align:right;vertical-align:top}',
    'table.cr-table thead th{background:#eef3ea;font-weight:800}',
    'table.cr-table thead th[colspan]{text-align:center}',
    'table.cr-table th:first-child,table.cr-table td:first-child,table.cr-table .cr-left{text-align:left}',
    'table.cr-table tbody tr:nth-child(even) td{background:#f8faf6}',
    '.cr-sub{color:#52605a;font-size:10px;font-weight:600}',
    '.cr-up{color:#0a6b35;font-weight:800}.cr-down{color:#a8221b;font-weight:800}.cr-flat{color:#52605a;font-weight:800}',
    '.visually-hidden{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}',
    '.viz-grid2{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}',
    '.viz-grid2.one{grid-template-columns:minmax(0,62%)}',
    '.viz-fig{margin:0;break-inside:avoid}',
    '.viz-fig figcaption{font-size:12.5px;font-weight:800;margin-bottom:4px}',
    '.viz-svg{width:100%;height:auto;display:block}',
    '.viz-legend{display:flex;flex-wrap:wrap;gap:3px 14px;font-size:11px;font-weight:600;color:#52514e;margin-bottom:4px}',
    '.viz-legend span{display:inline-flex;align-items:center;gap:5px}',
    '.viz-legend i{width:10px;height:10px;border-radius:3px;display:inline-block}',
    '.viz-note{font-size:11px;color:#52514e;margin-top:6px}',
    '.pr-foot{color:#52605a;font-size:10.5px;margin-top:4px}',
    VIZ
  ].join('\n');

  // the charts once more, on a light surface, away from the screen
  function lightCharts(data) {
    if (!window.DaylensCRCharts) return null;
    var host = document.createElement('div');
    window.DaylensCRCharts.render(host, data, { dark: false });
    var tip = host.querySelector('.viz-tip'); if (tip) tip.remove();
    host.querySelectorAll('.viz-hit').forEach(function (n) { n.remove(); });
    host.querySelectorAll('[data-tip]').forEach(function (n) { n.removeAttribute('data-tip'); });
    return host;
  }

  /** The page. outEl is the report as drawn on the screen; data is what drew it. */
  function html(outEl, data, meta) {
    meta = meta || {};
    var copy = outEl.cloneNode(true);
    copy.querySelectorAll('button, input, select, script, style, link, iframe, .viz-tip').forEach(function (n) { n.remove(); });
    copy.querySelectorAll('[id]').forEach(function (n) { n.removeAttribute('id'); });
    copy.querySelectorAll('[style]').forEach(function (n) { if (!n.closest('.viz-legend')) n.removeAttribute('style'); });
    copy.querySelectorAll('*').forEach(function (n) {
      Array.prototype.slice.call(n.attributes).forEach(function (a) { if (/^on/i.test(a.name)) n.removeAttribute(a.name); });
    });
    var charts = copy.querySelector('.viz-root');
    if (charts) {
      var light = lightCharts(data);
      if (light && light.firstElementChild) {
        var grid = light.querySelector('.viz-grid2');
        if (grid && grid.children.length === 1) grid.classList.add('one');
        charts.parentNode.replaceChild(light.firstElementChild, charts);
      }
    }
    // the short cards stay whole on a page; the long list may run over pages
    var cards = copy.querySelectorAll('.cr-card');
    cards.forEach(function (c, i) { if (i < cards.length - 1 && c.querySelectorAll('tr').length < 26) c.classList.add('keep'); });
    var P = data.periods || [];
    var title = meta.title || ('Custom report: ' + P.map(function (p) { return p.label; }).join(', '));
    var who = (data.people || []).map(function (p) { return p.person; });
    var bits = [];
    if (who.length) bits.push(who.length <= 6 ? who.join(', ') : who.length + ' people');
    if ((data.sources || []).length) bits.push('From: ' + data.sources.join(', '));
    var made = [];
    if (meta.team) made.push(meta.team);
    if (meta.by) made.push('made by ' + meta.by);
    made.push(meta.when || new Date().toLocaleString());
    return '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>' + esc(title) + '</title><style>' + CSS + '</style></head><body>' +
      '<div class="pr-head"><div><h1>' + esc(title) + '</h1><div class="pr-meta">' + esc(bits.join('  |  ')) + '</div><div class="pr-meta">' + esc(made.join(', ')) + '</div></div><div class="pr-brand">Daylens</div></div>' +
      copy.innerHTML +
      '<div class="pr-foot">Made in Daylens from the team\'s own entries. Counting entries shows how much was logged, not how hard each piece of work was.</div>' +
      '</body></html>';
  }

  function svgToPng(svg, scale) {
    return new Promise(function (resolve) {
      try {
        var vb = (svg.getAttribute('viewBox') || '0 0 560 300').split(/\s+/).map(Number);
        var W = vb[2], H = vb[3];
        var copy = svg.cloneNode(true);
        copy.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        copy.setAttribute('width', W); copy.setAttribute('height', H);
        var src = new XMLSerializer().serializeToString(copy).replace(/^<svg([^>]*)>/, '<svg$1><style>' + VIZ + '</style><rect width="100%" height="100%" fill="#ffffff"/>');
        var img = new Image();
        img.onload = function () {
          try {
            var c = document.createElement('canvas');
            c.width = Math.round(W * scale); c.height = Math.round(H * scale);
            var ctx = c.getContext('2d');
            ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, c.width, c.height);
            ctx.drawImage(img, 0, 0, c.width, c.height);
            resolve({ png: c.toDataURL('image/png').split(',')[1] || '', width: W, height: H });
          } catch (e) { resolve(null); }
        };
        img.onerror = function () { resolve(null); };
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(src);
      } catch (e) { resolve(null); }
    });
  }

  /** The charts as pictures: [{caption, legend: [{name, color}], png, width, height}]. Empty when they can't be made. */
  function chartImages(data) {
    var host = lightCharts(data);
    if (!host) return Promise.resolve([]);
    var figs = Array.prototype.slice.call(host.querySelectorAll('.viz-fig')).slice(0, 3);
    return Promise.all(figs.map(function (fig) {
      var cap = fig.querySelector('figcaption');
      var legend = Array.prototype.slice.call(fig.querySelectorAll('.viz-legend span')).map(function (s) {
        var i = s.querySelector('i');
        return { name: s.textContent, color: i ? rgbToHex(i.style.background || i.style.backgroundColor) : '#52514e' };
      });
      var svg = fig.querySelector('svg');
      if (!svg) return null;
      return svgToPng(svg, 2).then(function (r) { return r && r.png ? { caption: cap ? cap.textContent : '', legend: legend, png: r.png, width: r.width, height: r.height } : null; });
    })).then(function (list) { return list.filter(Boolean); });
  }

  function rgbToHex(v) {
    v = String(v || '').trim();
    if (/^#[0-9a-f]{6}$/i.test(v)) return v.toLowerCase();
    var m = v.match(/rgba?\((\d+)\D+(\d+)\D+(\d+)/);
    if (!m) return '#52514e';
    return '#' + [m[1], m[2], m[3]].map(function (n) { return ('0' + Number(n).toString(16)).slice(-2); }).join('');
  }

  window.DaylensCRPrint = { html: html, chartImages: chartImages };
})();
