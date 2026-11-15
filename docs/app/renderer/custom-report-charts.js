// Custom report (1.11.1): the pictures and the plain-words summary.
//
//  - highlights(data)        the report in a few sentences, written by rule from the numbers (no AI)
//  - render(host, data)      charts for the report, drawn as SVG:
//      two or more periods → a line chart of entries per working day, and grouped bars of entries
//      one period          → a bar for each person
//    One series per person, up to six. With more people the chart shows everyone together, and
//    the table below it still has each person.
//
// Colours: a fixed set of six, in a fixed order, checked for colour-blind separation and drawn
// on the chart's own light or dark surface so they stay readable in every Daylens theme. A
// legend and labels name every series, and the Summary table carries the same numbers.
(function () {
  var LIGHT = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300'];
  var DARK = ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300'];
  var MAX_SERIES = 6;
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); };
  var num = function (n) { return n === null || n === undefined || n === '' ? '–' : String(Math.round(n * 100) / 100); };
  var plural = function (n, one, many) { return num(n) + ' ' + (n === 1 ? one : many); };

  /** The series to draw: [{name, entries: [], perDay: []}] and whether people were folded together. */
  function seriesOf(data) {
    var P = data.periods.length;
    if (data.people.length <= MAX_SERIES) return { folded: false, list: data.people.map(function (p) { return { name: p.person, entries: p.entries.slice(), perDay: p.perDay.slice() }; }) };
    var entries = [], perDay = [];
    for (var i = 0; i < P; i++) {
      var e = 0, wd = 0;
      data.people.forEach(function (p) { e += p.entries[i]; wd += p.workingDays[i]; });
      entries.push(e); perDay.push(wd > 0 ? Math.round((e / wd) * 100) / 100 : null);
    }
    return { folded: true, list: [{ name: 'Everyone picked (' + data.people.length + ' people)', entries: entries, perDay: perDay }] };
  }

  /** The report in plain sentences. Returns an array of lines. */
  function highlights(data) {
    var P = data.periods, last = P.length - 1, out = [];
    var word = function (d) { return d > 0 ? 'up ' + num(d) : d < 0 ? 'down ' + num(-d) : 'the same'; };
    var pctTxt = function (c) { return c.pct === null || !c.diff ? '' : ' (' + (c.pct > 0 ? '+' : '') + num(c.pct) + '%)'; };
    var total = function (i) { return data.people.reduce(function (n, p) { return n + p.entries[i]; }, 0); };
    if (data.people.length > 1) {
      var t = plural(total(last), 'entry', 'entries') + ' from ' + data.people.length + ' people in ' + P[last].label;
      if (P.length > 1) { var a = total(last - 1), b = total(last); t += ', ' + word(b - a) + (a && b !== a ? ' (' + (b > a ? '+' : '') + num(Math.round(((b - a) / a) * 1000) / 10) + '%)' : '') + ' on ' + P[last - 1].label; }
      out.push('Everyone picked: ' + t + '.');
    }
    data.people.slice(0, 8).forEach(function (p) {
      var s = p.person + ': ' + plural(p.entries[last], 'entry', 'entries') + ' in ' + P[last].label;
      if (p.perDay[last] !== null) s += ' (' + num(p.perDay[last]) + ' per working day)';
      if (P.length > 1) {
        var c = p.changes[last - 1];
        s += ', ' + word(c.diff) + pctTxt(c) + ' on ' + P[last - 1].label;
        if (P.length > 2) { var w = p.changes[p.changes.length - 1]; s += '; ' + word(w.diff) + pctTxt(w) + ' on ' + P[0].label; }
      }
      var leave = p.leaveDays.reduce(function (n, x) { return n + x; }, 0);
      s += '. Leave: ' + (leave ? plural(leave, 'day', 'days') + (P.length > 1 ? ' across the periods' : '') : 'none') + '.';
      out.push(s);
    });
    if (data.people.length > 8) out.push('…and ' + (data.people.length - 8) + ' more people in the table below.');
    return out;
  }

  // the top of the scale: four equal steps of a round size (1, 2, 2.5, 5 or 10, times a power of ten)
  function niceMax(v) {
    if (!(v > 0)) return 4;
    var raw = v / 4, p = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / p;
    var step = (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p;
    return Math.round(step * 4 * 1e6) / 1e6;
  }
  function frame(W, H, m, max, labels, band) {
    var iw = W - m.l - m.r, ih = H - m.t - m.b, g = '';
    for (var k = 0; k <= 4; k++) {
      var v = (max * k) / 4, y = m.t + ih - (ih * k) / 4;
      g += '<line x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + y + '" y2="' + y + '" class="' + (k ? 'viz-grid' : 'viz-axis') + '"/>';
      g += '<text x="' + (m.l - 8) + '" y="' + (y + 4) + '" text-anchor="end" class="viz-tick">' + num(v) + '</text>';
    }
    labels.forEach(function (lab, i) {
      var x = band ? m.l + (iw * (i + 0.5)) / labels.length : (labels.length === 1 ? m.l + iw / 2 : m.l + (iw * i) / (labels.length - 1));
      g += '<text x="' + x + '" y="' + (H - m.b + 18) + '" text-anchor="middle" class="viz-tick">' + esc(lab) + '</text>';
    });
    return { g: g, iw: iw, ih: ih };
  }
  function lineChart(labels, list, colors, unit) {
    var W = 480, H = 240, direct = list.length <= 4, m = { l: 40, r: direct ? 112 : 16, t: 14, b: 30 };
    var max = niceMax(Math.max.apply(null, [0].concat(list.map(function (s) { return Math.max.apply(null, s.vals.map(function (v) { return v || 0; })); }))));
    var f = frame(W, H, m, max, labels, false), body = '';
    var X = function (i) { return labels.length === 1 ? m.l + f.iw / 2 : m.l + (f.iw * i) / (labels.length - 1); };
    var Y = function (v) { return m.t + f.ih - (f.ih * v) / max; };
    var ends = [];
    list.forEach(function (s, si) {
      var d = '', pen = false;
      s.vals.forEach(function (v, i) { if (v === null || v === undefined) { pen = false; return; } d += (pen ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1) + ' '; pen = true; });
      body += '<path d="' + d + '" fill="none" stroke="' + colors[si] + '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>';
      s.vals.forEach(function (v, i) {
        if (v === null || v === undefined) return;
        body += '<circle cx="' + X(i).toFixed(1) + '" cy="' + Y(v).toFixed(1) + '" r="4.5" fill="' + colors[si] + '" class="viz-dot" data-tip="' + esc(s.name + ' · ' + labels[i] + ': ' + num(v) + ' ' + unit) + '"/>';
      });
      var lastI = -1; s.vals.forEach(function (v, i) { if (v !== null && v !== undefined) lastI = i; });
      if (direct && lastI !== -1) ends.push({ y: Y(s.vals[lastI]), x: X(lastI), name: s.name, val: s.vals[lastI], color: colors[si] });
    });
    // labels at the line ends, nudged apart so they never sit on top of each other
    ends.sort(function (a, b) { return a.y - b.y; });
    for (var i = 1; i < ends.length; i++) if (ends[i].y - ends[i - 1].y < 15) ends[i].y = ends[i - 1].y + 15;
    ends.forEach(function (e) {
      var name = e.name.length > 13 ? e.name.slice(0, 12) + '…' : e.name;
      body += (ends.length > 1 ? '<circle cx="' + (W - m.r + 12) + '" cy="' + e.y + '" r="4" fill="' + e.color + '"/>' : '') + '<text x="' + (W - m.r + (ends.length > 1 ? 21 : 10)) + '" y="' + (e.y + 4) + '" class="viz-label">' + esc(name) + ' ' + num(e.val) + '</text>';
    });
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" class="viz-svg">' + f.g + body + '</svg>';
  }
  function barChart(labels, list, colors, unit) {
    var W = 480, H = 240, m = { l: 40, r: 16, t: 14, b: 30 };
    var max = niceMax(Math.max.apply(null, [0].concat(list.map(function (s) { return Math.max.apply(null, s.vals.map(function (v) { return v || 0; })); }))));
    var f = frame(W, H, m, max, labels, true), body = '';
    var bandW = f.iw / labels.length, bw = Math.min(30, (bandW * 0.78) / list.length - 2);
    labels.forEach(function (lab, i) {
      var x0 = m.l + bandW * (i + 0.5) - ((bw + 2) * list.length - 2) / 2;
      list.forEach(function (s, si) {
        var v = s.vals[i] || 0, h = (f.ih * v) / max, x = x0 + si * (bw + 2), y = m.t + f.ih - h, r = Math.min(4, h, bw / 2);
        if (h > 0) body += '<path d="M' + x.toFixed(1) + ' ' + (y + h).toFixed(1) + 'V' + (y + r).toFixed(1) + 'a' + r + ' ' + r + ' 0 0 1 ' + r + ' -' + r + 'h' + (bw - 2 * r).toFixed(1) + 'a' + r + ' ' + r + ' 0 0 1 ' + r + ' ' + r + 'V' + (y + h).toFixed(1) + 'z" fill="' + colors[si] + '"/>';
        body += '<rect x="' + (x - 1).toFixed(1) + '" y="' + m.t + '" width="' + (bw + 2).toFixed(1) + '" height="' + f.ih + '" fill="transparent" class="viz-hit" data-tip="' + esc(s.name + ' · ' + lab + ': ' + num(v) + ' ' + unit) + '"/>';
        if (list.length * labels.length <= 8) body += '<text x="' + (x + bw / 2).toFixed(1) + '" y="' + (y - 5).toFixed(1) + '" text-anchor="middle" class="viz-label">' + num(v) + '</text>';
      });
    });
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" class="viz-svg">' + f.g + body + '</svg>';
  }
  function legend(list, colors) {
    if (list.length < 2) return '';
    return '<div class="viz-legend">' + list.map(function (s, i) { return '<span><i style="background:' + colors[i] + '"></i>' + esc(s.name) + '</span>'; }).join('') + '</div>';
  }

  /** Draws the charts into host. Returns how many were drawn. */
  function render(host, data) {
    var dark = document.documentElement.getAttribute('data-mode') !== 'light';
    var colors = dark ? DARK : LIGHT;
    var sr = seriesOf(data), P = data.periods, labels = P.map(function (p) { return p.label; });
    var blocks = [];
    var note = sr.folded ? '<div class="viz-note">More than ' + MAX_SERIES + ' people: the charts show everyone together. The table below has each person.</div>' : '';
    if (P.length >= 2) {
      var rate = sr.list.map(function (s) { return { name: s.name, vals: s.perDay }; });
      var count = sr.list.map(function (s) { return { name: s.name, vals: s.entries }; });
      blocks.push('<figure class="viz-fig" id="cr-chart-rate"><figcaption>Entries per working day, period by period</figcaption>' + legend(rate, colors) + lineChart(labels, rate, colors, 'per working day') + '</figure>');
      blocks.push('<figure class="viz-fig" id="cr-chart-count"><figcaption>Entries in each period</figcaption>' + legend(count, colors) + barChart(labels, count, colors, 'entries') + '</figure>');
    } else {
      // one period: a bar for each person (their names are the labels, one colour)
      var people = data.people.slice(0, 12);
      var one = [{ name: P[0].label, vals: people.map(function (p) { return p.entries[0]; }) }];
      blocks.push('<figure class="viz-fig" id="cr-chart-count"><figcaption>Entries in ' + esc(P[0].label) + ', by person' + (data.people.length > 12 ? ' (the first 12)' : '') + '</figcaption>' +
        barChart(people.map(function (p) { return p.person.length > 10 ? p.person.slice(0, 9) + '…' : p.person; }), one, colors, 'entries') + '</figure>');
      note = '';
    }
    host.innerHTML = '<div class="viz-root' + (dark ? ' viz-dark' : '') + '">' + '<div class="viz-grid2">' + blocks.join('') + '</div>' + note + '<div class="viz-tip" hidden></div></div>';
    var root = host.firstChild, tip = root.querySelector('.viz-tip');
    var show = function (e) {
      var t = e.target.getAttribute && e.target.getAttribute('data-tip');
      if (!t) { tip.hidden = true; return; }
      tip.textContent = t; tip.hidden = false;
      var r = root.getBoundingClientRect(), x = e.clientX - r.left + 12, y = e.clientY - r.top - 34;
      tip.style.left = Math.max(4, Math.min(r.width - tip.offsetWidth - 4, x)) + 'px';
      tip.style.top = Math.max(4, y) + 'px';
    };
    root.addEventListener('mousemove', show);
    root.addEventListener('mouseleave', function () { tip.hidden = true; });
    return blocks.length;
  }

  var api = { render: render, highlights: highlights, seriesOf: seriesOf, LIGHT: LIGHT, DARK: DARK };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof window !== 'undefined') window.DaylensCRCharts = api;
})();
