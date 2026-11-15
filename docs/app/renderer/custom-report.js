// Custom report (1.11): the parts that need no screen, so they can be tested on their own.
//
//  - periodsFor(form)        the form's dates → the list of periods the Sheet counts
//  - quickRange(key, today)  "Last 3 months", "This quarter"… → from / to / breakdown
//  - readAsk(text, options)  a request typed in words → the form's choices, by plain rules
//                            (names, tab names, months, "last 3 months", "vs"). No AI here:
//                            Gemini is only asked when these rules can't make sense of it.
//
// Dates travel as 'YYYY-MM-DD' text; "to" is the last day itself (inclusive).
(function () {
  var MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  var SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var MAX_PERIODS = 12;

  function parse(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || '').trim());
    if (!m) return null;
    var d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return d.getFullYear() === Number(m[1]) && d.getMonth() === Number(m[2]) - 1 && d.getDate() === Number(m[3]) ? d : null;
  }
  function key(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function addDays(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }
  function monthStart(y, m) { return new Date(y, m, 1); }
  function monthEnd(y, m) { return new Date(y, m + 1, 0); }
  function isMonthStart(d) { return d.getDate() === 1; }
  function isMonthEnd(d) { return addDays(d, 1).getDate() === 1; }
  function label(a, b) {
    if (isMonthStart(a) && isMonthEnd(b) && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()) return SHORT[a.getMonth()] + ' ' + a.getFullYear();
    if (isMonthStart(a) && isMonthEnd(b)) return SHORT[a.getMonth()] + (a.getFullYear() !== b.getFullYear() ? ' ' + a.getFullYear() : '') + ' – ' + SHORT[b.getMonth()] + ' ' + b.getFullYear();
    if (key(a) === key(b)) return a.getDate() + ' ' + SHORT[a.getMonth()] + ' ' + a.getFullYear();
    return a.getDate() + ' ' + SHORT[a.getMonth()] + (a.getFullYear() !== b.getFullYear() ? ' ' + a.getFullYear() : '') + ' – ' + b.getDate() + ' ' + SHORT[b.getMonth()] + ' ' + b.getFullYear();
  }
  function piece(a, b) { return { label: label(a, b), start: key(a), end: key(b) }; }

  /** { periods: [{label, start, end}] } or { error } */
  function periodsFor(form) {
    var from = parse(form && form.from), to = parse(form && form.to);
    if (!from || !to) return { error: 'Pick the first and last day of the period.' };
    if (from > to) return { error: 'The first day is after the last day.' };
    var out = [];
    var breakdown = form.breakdown === 'month' || form.breakdown === 'week' ? form.breakdown : 'none';
    if (breakdown === 'month') {
      for (var y = from.getFullYear(), m = from.getMonth(); monthStart(y, m) <= to; m++) {
        if (m > 11) { m = 0; y++; }
        var a = monthStart(y, m), b = monthEnd(y, m);
        if (a > to) break;
        out.push(piece(a < from ? from : a, b > to ? to : b));
        if (out.length > MAX_PERIODS) break;
      }
    } else if (breakdown === 'week') {
      var start = from;
      while (start <= to && out.length <= MAX_PERIODS) {
        var sunday = addDays(start, (7 - start.getDay()) % 7); // the week ends on Sunday
        var end = sunday > to ? to : sunday;
        out.push(piece(start, end));
        start = addDays(end, 1);
      }
    } else {
      if (form.comparePrevious) {
        var pa, pb;
        if (isMonthStart(from) && isMonthEnd(to)) {
          var months = (to.getFullYear() - from.getFullYear()) * 12 + to.getMonth() - from.getMonth() + 1;
          pa = monthStart(from.getFullYear(), from.getMonth() - months);
          pb = monthEnd(from.getFullYear(), from.getMonth() - 1);
        } else {
          var days = Math.round((to - from) / 86400000) + 1;
          pb = addDays(from, -1);
          pa = addDays(from, -days);
        }
        out.push(piece(pa, pb));
      }
      out.push(piece(from, to));
    }
    if (out.length > MAX_PERIODS) return { error: 'That makes more than ' + MAX_PERIODS + ' periods. Pick a shorter range, or break it down by month instead of week.' };
    return { periods: out };
  }

  /** The quick choices. `today` is 'YYYY-MM-DD'. */
  function quickRange(k, today) {
    var t = parse(today) || new Date();
    var y = t.getFullYear(), m = t.getMonth();
    var q = Math.floor(m / 3) * 3;
    var monday = addDays(t, -((t.getDay() + 6) % 7));
    switch (k) {
      case 'this-week': return { from: key(monday), to: key(addDays(monday, 6)), breakdown: 'none' };
      case 'last-week': return { from: key(addDays(monday, -7)), to: key(addDays(monday, -1)), breakdown: 'none' };
      case 'this-month': return { from: key(monthStart(y, m)), to: key(monthEnd(y, m)), breakdown: 'none' };
      case 'last-month': return { from: key(monthStart(y, m - 1)), to: key(monthEnd(y, m - 1)), breakdown: 'none' };
      case 'last-3-months': return { from: key(monthStart(y, m - 3)), to: key(monthEnd(y, m - 1)), breakdown: 'month' };
      case 'last-6-months': return { from: key(monthStart(y, m - 6)), to: key(monthEnd(y, m - 1)), breakdown: 'month' };
      case 'this-quarter': return { from: key(monthStart(y, q)), to: key(monthEnd(y, q + 2)), breakdown: 'month' };
      case 'last-quarter': return { from: key(monthStart(y, q - 3)), to: key(monthEnd(y, q - 1)), breakdown: 'month' };
      case 'this-year': return { from: key(monthStart(y, 0)), to: key(monthEnd(y, 11)), breakdown: 'month' };
      default: return null;
    }
  }
  var QUICK = [['this-week', 'This week'], ['last-week', 'Last week'], ['this-month', 'This month'], ['last-month', 'Last month'],
    ['last-3-months', 'Last 3 months'], ['last-6-months', 'Last 6 months'], ['this-quarter', 'This quarter'], ['last-quarter', 'Last quarter'], ['this-year', 'This year']];

  var squash = function (s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ''); };
  var WORD_NUM = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12 };

  /**
   * A request in words → { fill: {people, sources, from, to, breakdown, comparePrevious}, understood, why }.
   * options: { people: [names], tabs: [{tab, type, category}], me, today }
   */
  function readAsk(text, options) {
    var raw = String(text || '');
    var t = ' ' + raw.toLowerCase().replace(/[’']/g, '\'').replace(/\s+/g, ' ') + ' ';
    var flat = squash(raw);
    var opt = options || {};
    var today = parse(opt.today) || new Date();
    var fill = { people: [], sources: [], from: '', to: '', breakdown: 'none', comparePrevious: false };
    var why = [];

    // who
    var everyone = /\b(everyone|everybody|whole team|all (the )?(people|members|resources)|the team|team[- ]wide)\b/.test(t);
    (opt.people || []).forEach(function (name) {
      var parts = String(name).toLowerCase().split(/[^a-z0-9]+/).filter(function (p) { return p.length >= 3; });
      var whole = squash(name);
      var hit = (whole.length >= 3 && flat.indexOf(whole) !== -1) || parts.some(function (p) { return new RegExp('\\b' + p + '(\'s)?\\b').test(t); });
      if (hit && fill.people.indexOf(name) === -1) fill.people.push(name);
    });
    // a short form of one person's name ("Surya" for "Suryaraj"), when only one name starts that way
    (t.match(/[a-z]{5,}/g) || []).forEach(function (w) {
      var starts = (opt.people || []).filter(function (name) { return String(name).toLowerCase().split(/[^a-z0-9]+/).some(function (p) { return p.length > w.length && p.indexOf(w) === 0; }); });
      if (starts.length === 1 && fill.people.indexOf(starts[0]) === -1) fill.people.push(starts[0]);
    });
    if (!fill.people.length && !everyone && /\b(my|me|mine|myself|i)\b/.test(t) && opt.me) fill.people.push(opt.me);

    // what
    var tabs = opt.tabs || [];
    var add = function (tab) { if (fill.sources.indexOf(tab) === -1) fill.sources.push(tab); };
    if (/\b(everything|all (the )?(tabs|entries|work)|overall|complete|full)\b/.test(t)) tabs.forEach(function (x) { add(x.tab); });
    tabs.forEach(function (x) {
      var n = squash(x.tab);
      if (n.length >= 3 && flat.indexOf(n) !== -1) add(x.tab);
    });
    var cats = {};
    tabs.forEach(function (x) { if (x.category) (cats[x.category] = cats[x.category] || []).push(x.tab); });
    Object.keys(cats).forEach(function (c) { var n = squash(c); if (n.length >= 4 && flat.indexOf(n) !== -1) cats[c].forEach(add); });
    if (/\bleaves?\b|\btime off\b|\bdays? off\b|\babsen/.test(t)) tabs.forEach(function (x) { if (x.type === 'leave') add(x.tab); });
    if (/\bad[- ]?hoc\b/.test(t)) tabs.forEach(function (x) { if (/adhoc/.test(squash(x.tab))) add(x.tab); });
    if (/\btasks?\b/.test(t)) tabs.forEach(function (x) { if (/task/.test(squash(x.tab)) || x.type === 'daily-status') add(x.tab); });
    if (/\btickets?\b/.test(t)) tabs.forEach(function (x) { if (x.type === 'ticket-tracker' || /ticket/.test(squash(x.tab))) add(x.tab); });
    if (/\b(productivity|performance|output|how (much|many))\b/.test(t) && !fill.sources.length) tabs.forEach(function (x) { if (x.type !== 'leave') add(x.tab); });
    if (/\b(productivity|performance)\b/.test(t)) tabs.forEach(function (x) { if (x.type === 'leave') add(x.tab); }); // leave explains a quiet month

    // when
    var y = today.getFullYear(), m = today.getMonth();
    var set = function (r) { if (r) { fill.from = r.from; fill.to = r.to; fill.breakdown = r.breakdown; } };
    var mN = /\b(?:last|past|previous) (\d{1,2}|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve) months?\b/.exec(t);
    var iso = t.match(/\b\d{4}-\d{2}-\d{2}\b/g) || [];
    var named = [];
    var re = /\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b\.?(?: (\d{4}))?/g, mm;
    while ((mm = re.exec(t))) {
      var idx = MONTHS.findIndex(function (full) { return full.indexOf(mm[1].slice(0, 3)) === 0; });
      if (mm[1] === 'may' && !/\b(in|of|for|during|vs|versus|and|to|from|,) may\b|\bmay (\d{4}|vs|versus|and|to)\b/.test(t)) continue; // "may" the verb
      if (idx !== -1) named.push({ m: idx, y: mm[2] ? Number(mm[2]) : null });
    }
    if (iso.length >= 2 && parse(iso[0]) && parse(iso[1])) {
      var a0 = parse(iso[0]), b0 = parse(iso[1]);
      fill.from = key(a0 < b0 ? a0 : b0); fill.to = key(a0 < b0 ? b0 : a0);
    } else if (mN) {
      var n = Math.min(12, Math.max(1, Number(mN[1]) || WORD_NUM[mN[1]] || 1));
      fill.from = key(monthStart(y, m - n)); fill.to = key(monthEnd(y, m - 1)); fill.breakdown = n > 1 ? 'month' : 'none';
    } else if (named.length) {
      // a month with no year is the latest one that isn't in the future
      var dates = named.map(function (x) { var yy = x.y !== null ? x.y : (x.m > m ? y - 1 : y); return monthStart(yy, x.m); }).sort(function (p, q2) { return p - q2; });
      fill.from = key(dates[0]);
      var lastM = dates[dates.length - 1];
      fill.to = key(monthEnd(lastM.getFullYear(), lastM.getMonth()));
      if (dates.length > 1 && key(dates[0]) !== key(lastM)) fill.breakdown = 'month';
    } else if (/\blast week\b/.test(t)) set(quickRange('last-week', key(today)));
    else if (/\bthis week\b/.test(t)) set(quickRange('this-week', key(today)));
    else if (/\blast month\b/.test(t)) set(quickRange('last-month', key(today)));
    else if (/\bthis month\b/.test(t)) set(quickRange('this-month', key(today)));
    else if (/\blast quarter\b/.test(t)) set(quickRange('last-quarter', key(today)));
    else if (/\b(this|current) quarter\b/.test(t)) set(quickRange('this-quarter', key(today)));
    else if (/\b(this|current) year\b/.test(t)) set(quickRange('this-year', key(today)));
    else if (/\blast year\b/.test(t)) { fill.from = key(monthStart(y - 1, 0)); fill.to = key(monthEnd(y - 1, 11)); fill.breakdown = 'month'; }
    if (/\b(month by month|monthly|each month|per month|month wise|monthwise)\b/.test(t) && fill.from) fill.breakdown = 'month';
    if (/\b(week by week|weekly|each week|per week|week wise|weekwise)\b/.test(t) && fill.from) fill.breakdown = 'week';
    if (fill.breakdown === 'none' && fill.from && /\b(vs|versus|compare[ds]?|comparison|before and (now|after)|then and now|previous|earlier|improv|trend|growth|drop)\b/.test(t)) fill.comparePrevious = true;

    if (!fill.from) why.push('the period');
    if (!fill.sources.length) why.push('which tabs');
    return { fill: fill, understood: !!fill.from && !!fill.sources.length, why: why };
  }

  var api = { periodsFor: periodsFor, quickRange: quickRange, readAsk: readAsk, QUICK: QUICK, MAX_PERIODS: MAX_PERIODS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof window !== 'undefined') window.DaylensCustomReport = api;
})();
