// Scheduled reports, in words — shared by Reports (the summary list) and
// the Scheduled reports editor. Matches the backend's rules exactly
// (Code.gs: reportRepeat_, isSendHour_, scheduledRange_).
(function () {
  var WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  var REPEATS = [
    ['', 'Only when someone sends it'],
    ['daily', 'Every day'],
    ['weekdays', 'Every weekday (Mon–Fri)'],
    ['weekly', 'Once a week'],
    ['monthly', 'Once a month'],
    ['custom', 'On days I choose'],
  ];
  function hourLabel(h) {
    h = Number(h);
    return (h % 12 === 0 ? 12 : h % 12) + (h < 12 ? ' am' : ' pm');
  }
  function ordinal(n) {
    n = Number(n);
    var s = (n % 100 >= 11 && n % 100 <= 13) ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] || 'th');
    return n + s;
  }
  function list(words) {
    return words.length <= 1 ? words.join('') : words.slice(0, -1).join(', ') + ' and ' + words[words.length - 1];
  }
  // A report saved before "repeat" existed: a weekday means weekly.
  function repeatOf(c) {
    var r = String((c && c.repeat) || '').toLowerCase();
    if (REPEATS.some(function (x) { return x[0] === r && r; })) return r;
    return WEEK.indexOf(String((c && c.scheduleDay) || '').trim()) !== -1 ? 'weekly' : '';
  }
  function customDays(c) {
    var picked = String((c && c.scheduleDay) || '').split(',').map(function (d) { return d.trim(); });
    return WEEK.filter(function (d) { return picked.indexOf(d) !== -1; });
  }
  function scheduled(c) {
    var r = repeatOf(c);
    if (!r || c.scheduleHour === null || c.scheduleHour === undefined || c.scheduleHour === '' || isNaN(c.scheduleHour)) return false;
    if (r === 'weekly') return WEEK.indexOf(String(c.scheduleDay).trim()) !== -1;
    if (r === 'custom') return customDays(c).length > 0;
    if (r === 'monthly') return /^last$/i.test(String(c.scheduleDay)) || (Number(c.scheduleDay) >= 1 && Number(c.scheduleDay) <= 28);
    return true;
  }
  // "Every weekday (Mon–Fri) at 6 pm"
  function when(c) {
    if (!scheduled(c)) return 'Only when someone sends it';
    var at = ' at ' + hourLabel(c.scheduleHour);
    switch (repeatOf(c)) {
      case 'daily': return 'Every day' + at;
      case 'weekdays': return 'Every weekday (Mon–Fri)' + at;
      case 'weekly': return 'Every ' + String(c.scheduleDay).trim() + at;
      case 'monthly': return /^last$/i.test(String(c.scheduleDay)) ? 'On the last day of every month' + at : 'On the ' + ordinal(c.scheduleDay) + ' of every month' + at;
      case 'custom': return 'Every ' + list(customDays(c)) + at;
    }
    return '';
  }
  // "with that day's entries. Skips holidays."
  function covers(c) {
    if (!scheduled(c)) return 'Sent only when someone clicks Email report.';
    switch (repeatOf(c)) {
      case 'daily': return "With that day's entries. Skips holidays.";
      case 'weekdays': return "With that day's entries. Skips weekends and holidays.";
      case 'weekly': return "With that week's entries, from Monday.";
      case 'monthly': return "With that month's entries so far.";
      case 'custom': return 'With the entries since the previous one. Skips holidays.';
    }
    return '';
  }
  window.ReportSchedule = { WEEK: WEEK, REPEATS: REPEATS, hourLabel: hourLabel, ordinal: ordinal, repeatOf: repeatOf, customDays: customDays, scheduled: scheduled, when: when, covers: covers };
})();
