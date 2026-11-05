// The team dashboard — Home (1.5): a sentence that says how the week is
// going, four numbers, who logged what each day, tickets waiting more than a
// week, this week against last, where the tickets stand and who's off next.
// Everything comes from ONE answer of the team's Sheet (Code.gs
// teamDashboard_, cached there), and the last saved copy is drawn first, so
// Home is never slower than before. A PDF / picture of the week for a
// meeting; kudos; and, for admins, "Something missing?".
(function () {
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const toDate = (key) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(key || ''));
    return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
  };
  const short = (key) => {
    const d = toDate(key);
    return d ? `${WEEKDAYS[d.getDay()].slice(0, 3)} ${d.getDate()} ${MONTHS[d.getMonth()]}` : String(key || '');
  };
  const dayNum = (key) => { const d = toDate(key); return d ? d.getDate() : ''; };
  const initials = (n) => String(n || '?').replace(/[._-]+/g, ' ').trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many || one + 's'}`;
  const sum = (a) => (a || []).reduce((x, y) => x + (Number(y) || 0), 0);
  const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  function weekLabel(d) { return `${short(d.week.start)} – ${short(d.week.end)}`; }
  function offsetLabel(off) { return off === 0 ? 'This week' : off === -1 ? 'Last week' : `${-off} weeks ago`; }
  function agoText(at) {
    if (!at) return '';
    const m = Math.round((Date.now() - Number(at)) / 60000);
    if (m < 1) return 'updated just now';
    if (m < 60) return `updated ${plural(m, 'minute')} ago`;
    const h = Math.round(m / 60);
    return h < 24 ? `updated ${plural(h, 'hour')} ago` : `updated ${short(ymd(new Date(Number(at))))}`;
  }

  // One cell of "The team's week": how many entries that day, else why not.
  function dayCell(p, i, d, max) {
    const n = (p.counts && p.counts[i]) || (p.days[i] ? 1 : 0);
    if (n) {
      const lvl = Math.max(1, Math.min(4, Math.ceil((4 * n) / Math.max(1, max))));
      return `<span class="dd on l${lvl}" title="${esc(plural(n, 'entry', 'entries'))}">${n}</span>`;
    }
    if (p.leaveDays && p.leaveDays[i]) return '<span class="dd leave" title="On leave">🌴</span>';
    if (p.pendingDays && p.pendingDays[i]) return '<span class="dd pending" title="Leave requested — waiting for approval">⏳</span>';
    if (d.week.holidays && d.week.holidays[i]) return '<span class="dd hol" title="Holiday">✦</span>';
    if (d.weekOffset === 0 && d.week.today >= 0 && i > d.week.today) return '<span class="dd later" title="Later this week"></span>';
    return '<span class="dd off" title="No entries"></span>';
  }

  // A plain, printable page of the same numbers (for the PDF / picture).
  function printableHtml(d) {
    const t = d.totals || {};
    const rows = (d.people || []).map((p) => `<tr><td class="n">${esc(p.name)}</td>${DAYS.map((x, i) => `<td class="c">${p.days[i] ? ((p.counts && p.counts[i]) || '✓') : p.leaveDays && p.leaveDays[i] ? 'Leave' : p.pendingDays && p.pendingDays[i] ? 'Leave (pending)' : d.week.holidays && d.week.holidays[i] ? 'Holiday' : ''}</td>`).join('')}<td class="c">${p.entries}</td><td>${esc(p.lastEntry ? short(p.lastEntry) : '—')}</td></tr>`).join('');
    const byTab = Object.keys(t.byTab || {}).map((k) => `<li>${esc(k)}: ${t.byTab[k]}</li>`).join('');
    const stuck = (d.weekOffset === 0 && d.stuck && d.stuck.length) ? `<p class="sub" style="margin-top:16px">Waiting more than a week</p><ul>${d.stuck.map((s) => `<li>${esc(s.id ? s.id + ' — ' : '')}${esc(s.title || '(no description)')}: ${esc(s.status)}${s.owner ? ', ' + esc(s.owner) : ''} — ${s.days} days</li>`).join('')}</ul>` : '';
    return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(d.teamName || 'Team')} — ${esc(weekLabel(d))}</title><style>
      body{font-family:"Segoe UI",Arial,sans-serif;color:#1d2433;margin:28px;background:#fff}
      h1{font-size:22px;margin:0 0 2px} .sub{color:#5b6475;margin:0 0 18px;font-size:13px}
      .stats{display:flex;gap:12px;margin:0 0 18px} .st{flex:1;border:1px solid #e3e6ee;border-radius:10px;padding:10px 12px}
      .st b{display:block;font-size:22px} .st span{color:#5b6475;font-size:12px}
      table{border-collapse:collapse;width:100%;font-size:13px} th,td{border-bottom:1px solid #e9ecf2;padding:7px 8px;text-align:left}
      th{background:#f5f7fb;font-size:12px;color:#4a5263} td.c,th.c{text-align:center} td.n{font-weight:700}
      ul{margin:6px 0 0 18px;padding:0;font-size:13px} .foot{margin-top:22px;color:#8a92a3;font-size:11px}
    </style></head><body>
      <h1>${esc(d.teamName || 'Team')} — ${esc(offsetLabel(d.weekOffset || 0).toLowerCase())}</h1><p class="sub">${esc(weekLabel(d))}</p>
      <div class="stats"><div class="st"><b>${t.entries || 0}</b><span>entries</span></div><div class="st"><b>${t.logged || 0} of ${t.people || 0}</b><span>people with entries</span></div><div class="st"><b>${t.onLeaveToday || 0}</b><span>on leave today</span></div><div class="st"><b>${t.openTickets || 0}</b><span>open tickets</span></div></div>
      <table><thead><tr><th>Person</th>${DAYS.map((x) => `<th class="c">${x}</th>`).join('')}<th class="c">Entries</th><th>Last entry</th></tr></thead><tbody>${rows}</tbody></table>
      ${byTab ? `<p class="sub" style="margin-top:16px">Entries by tab</p><ul>${byTab}</ul>` : ''}${stuck}
      <p class="foot">Made with Daylens · ${esc(new Date().toLocaleString())}</p></body></html>`;
  }

  // Admins: why someone's entries might not show up, with what to do. A
  // line goes away by itself once it's fixed; "Ignore" hides one for the
  // whole team (kept in the Sheet), and "Ignored" lists them to undo.
  function notesHtml(n, open) {
    n = n || {};
    const un = n.unmatched || [], tabs = n.tabs || [];
    const unLeave = n.unmatchedLeave || [], leaveTabs = n.leaveTabs || []; // 1.9
    const ig = n.ignored || { names: [], tabs: [] };
    const nIgnored = (ig.names || []).length + (ig.tabs || []).length;
    if (!un.length && !tabs.length && !unLeave.length && !leaveTabs.length && !nIgnored) return '';
    const lines = [];
    // 1.9: leave that "Who's off" can't show — a tab that isn't set as the leave tab, or a name nobody has.
    leaveTabs.forEach((t) => lines.push(`<li><b>${esc(t)}</b> looks like your leave tab, but it isn't set as one, so its rows count as work entries and nobody shows as off. <button type="button" class="dn-btn dn-leave-tab" data-v="${esc(t)}">It's our leave tab</button></li>`));
    unLeave.forEach((u) => lines.push(`<li><b>${esc(u.name)}</b>: ${u.days} ${u.days === 1 ? 'day' : 'days'} of leave this week or next, but nobody in People has that name, so it isn't in "Who's off". <button type="button" class="dn-btn dn-ignore-name" data-v="${esc(u.name)}">Ignore</button></li>`));
    un.forEach((u) => lines.push(`<li><b>${esc(u.name)}</b>: ${u.entries} ${u.entries === 1 ? 'entry' : 'entries'} this week, but nobody in People has that name. <button type="button" class="dn-btn dn-ignore-name" data-v="${esc(u.name)}">Ignore</button></li>`));
    // 1.8: a holiday list isn't anyone's entries: one click makes it the team's holiday list.
    tabs.forEach((x) => lines.push(`<li><b>${esc(x.tab)}</b>: ${esc(x.why)}. ${/holiday/i.test(x.tab) ? `<button type="button" class="dn-btn dn-holiday-tab" data-v="${esc(x.tab)}">It's our holiday list</button> ` : ''}<button type="button" class="dn-btn dn-ignore-tab" data-v="${esc(x.tab)}">Don't count this tab</button></li>`));
    const hint = (un.length || unLeave.length ? '<p class="dn-hint">For a name: rename the person in People to match (or fix the Name on those rows) and the entries count.</p>' : '') +
      (tabs.length ? '<p class="dn-hint">For a tab: if people log their own work there, add a Name field to it in Tabs &amp; fields and it counts. If it\'s a list (a project\'s pages, holidays), it doesn\'t need counting.</p>' : '');
    const ignored = nIgnored ? `<details class="dn-ignored" id="dash-ignored"><summary>Ignored (${nIgnored})</summary><ul>${(ig.names || []).map((v) => `<li>${esc(v)} <button type="button" class="dn-btn dn-unignore-name" data-v="${esc(v)}">Stop ignoring</button></li>`).join('')}${(ig.tabs || []).map((v) => `<li>${esc(v)} (tab) <button type="button" class="dn-btn dn-unignore-tab" data-v="${esc(v)}">Count it again</button></li>`).join('')}</ul></details>` : '';
    const title = lines.length ? `Something missing? (${lines.length})` : 'Nothing missing';
    return `<details class="dash-notes" id="dash-notes" ${open ? 'open' : ''}><summary>${title}</summary>${lines.length ? `<ul>${lines.join('')}</ul>${hint}` : ''}${ignored}<div class="dn-msg" id="dn-msg" role="status"></div></details>`;
  }

  // ---------------- the parts ----------------

  function headline(d) {
    const t = d.totals || {};
    const off = d.weekOffset || 0;
    const stuck = t.stuckTickets || 0;
    if (!t.people) return 'No one is in the team yet.';
    if (off < 0) return `${offsetLabel(off)}, ${t.logged || 0} of ${t.people} people added ${plural(t.entries || 0, 'entry', 'entries')}.`;
    const who = t.logged === t.people ? 'Everyone has added entries this week'
      : !t.logged ? 'Nobody has added anything yet this week'
      : `${t.logged} of ${t.people} people have added entries this week`;
    return stuck ? `${who}, and ${stuck === 1 ? '1 ticket has' : stuck + ' tickets have'} waited more than a week.` : who + '.';
  }

  function quietPeople(d) {
    if ((d.weekOffset || 0) !== 0) return [];
    return (d.people || []).filter((p) => !p.entries && !p.onLeaveAllWeek && !(p.leaveDays && d.week.today >= 0 && p.leaveDays[d.week.today]));
  }

  function kpis(d) {
    const t = d.totals || {};
    const off = d.weekOffset || 0;
    // 1 — entries, against last week "by now" (same days so far)
    let k1 = '';
    if (Array.isArray(d.prevDays)) {
      const upTo = off === 0 && d.week.today >= 0 ? d.week.today : 4;
      const before = sum(d.prevDays.slice(0, upTo + 1));
      const diff = (t.entries || 0) - before;
      const when = off === 0 && d.week.today >= 0 && d.week.today < 4 ? ' by now' : '';
      k1 = diff > 0 ? `<span class="k-note up"><span aria-hidden="true">▲</span> ${diff} more than the week before${when}</span>`
        : diff < 0 ? `<span class="k-note down"><span aria-hidden="true">▼</span> ${-diff} fewer than the week before${when}</span>`
        : `<span class="k-note">Same as the week before${when}</span>`;
    }
    // 2 — people logged, with a ring
    const quiet = quietPeople(d);
    const frac = t.people ? (t.logged || 0) / t.people : 0;
    const C = 2 * Math.PI * 16;
    const ring = `<svg class="k-ring" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="16" class="k-ring-track"/><circle cx="20" cy="20" r="16" class="k-ring-fill" stroke-dasharray="${(C * frac).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 20 20)"/></svg>`;
    const k2 = off !== 0 ? '' : !t.people ? '' : !quiet.length ? '<span class="k-note up">Everyone\'s in</span>'
      : quiet.length === 1 ? `<span class="k-note warn">${esc(quiet[0].name)}: nothing yet this week</span>`
      : `<span class="k-note warn">${quiet.length} haven't added anything yet</span>`;
    // 3 — leave
    let k3 = '', leaveN = t.onLeaveToday || 0, leaveLabel = 'on leave today';
    if (off !== 0) {
      leaveN = sum((d.people || []).map((p) => (p.leaveDays || []).filter(Boolean).length));
      leaveLabel = leaveN === 1 ? 'day of leave' : 'days of leave';
    } else if (Array.isArray(d.upcoming)) {
      const todayKey = ymd(new Date());
      const first = (d.nextDays || [])[0], next = (d.nextDays || [])[first === todayKey ? 1 : 0];
      const away = (k) => d.upcoming.filter((u) => u.date === k && !u.wfh && u.kind !== 'pending').map((u) => u.name);
      const now = first === todayKey ? away(first) : [];
      const soon = next ? away(next).filter((n) => !now.includes(n)) : [];
      const nextLabel = next === ymd(new Date(Date.now() + 86400000)) ? 'tomorrow' : 'on ' + short(next).slice(0, 3);
      const bits = [];
      if (now.length) bits.push(esc(now.slice(0, 2).join(', ')) + (now.length > 2 ? ` +${now.length - 2}` : ''));
      if (soon.length) bits.push(`${esc(soon[0])}${soon.length > 1 ? ` +${soon.length - 1}` : ''} off ${nextLabel}`);
      k3 = bits.length ? `<span class="k-note">${bits.join(' · ')}</span>` : '<span class="k-note">Nobody off in the next day or two</span>';
    }
    // 4 — tickets
    const stuck = t.stuckTickets;
    const k4 = off !== 0 || stuck == null ? '' : stuck ? `<span class="k-note warn"><span aria-hidden="true">⏳</span> ${stuck} waiting over a week</span>` : '<span class="k-note up">None waiting over a week</span>';
    return `<div class="d2-kpis">
      <div class="dash-stat"><b>${t.entries || 0}</b><span>entries ${off === 0 ? 'this week' : 'that week'}</span>${k1}</div>
      <div class="dash-stat has-ring"><b>${t.logged || 0}<small>/${t.people || 0}</small></b><span>people with entries</span>${k2}${ring}</div>
      <div class="dash-stat"><b>${leaveN}</b><span>${leaveLabel}</span>${k3}</div>
      <button type="button" class="dash-stat as-btn" id="dash-k-tickets" title="Open the ticket board"><b>${t.openTickets || 0}</b><span>open tickets</span>${k4}</button>
    </div>`;
  }

  function weekPanel(d, canKudos) {
    const people = d.people || [];
    const max = Math.max(1, ...people.map((p) => Math.max(0, ...(p.counts || [0]))));
    const today = d.weekOffset === 0 ? d.week.today : -1;
    const quiet = new Set(quietPeople(d).map((p) => p.name));
    const hasPending = people.some((p) => (p.pendingDays || []).some(Boolean));
    const days = d.week.days || [];
    return `<section class="d2-panel d2-week" aria-labelledby="d2-week-h">
      <div class="d2-ph"><h3 id="d2-week-h">The team's week</h3><p>Entries per person per day</p></div>
      <div class="dash-people" role="table" aria-label="Entries per person per day">
        <div class="dp-row dp-head" role="row"><span class="dp-name" role="columnheader">Person</span>${DAYS.map((x, i) => `<span class="dp-day${i === today ? ' today' : ''}" role="columnheader">${x} ${dayNum(days[i])}</span>`).join('')}<span class="dp-n" role="columnheader">Total</span><span class="dp-k"></span></div>
        ${people.map((p, idx) => `
          <div class="dp-row" role="row" data-person="${esc(p.name)}">
            <span class="dp-name" role="cell"><span class="dp-av">${esc(initials(p.name))}</span><span class="dp-nm" title="${esc(p.lastEntry ? 'Last entry ' + short(p.lastEntry) : 'No entries in the last few weeks')}">${esc(p.name)}</span>${quiet.has(p.name) && today > 0 ? '<span class="dp-quiet" title="No entries dated this week yet (signing in doesn\'t count)">no entries yet</span>' : ''}</span>
            ${DAYS.map((x, i) => `<span class="dp-day" role="cell">${dayCell(p, i, d, max)}</span>`).join('')}
            <span class="dp-n" role="cell">${p.entries}</span>
            <span class="dp-k">${canKudos(p) ? `<button type="button" class="dash-btn kudos-btn" data-i="${idx}" title="Send ${esc(p.name)} kudos" aria-label="Send ${esc(p.name)} kudos">🎉</button>` : ''}</span>
          </div>`).join('') || '<p class="dash-note">No one in the team yet.</p>'}
      </div>
      <div class="dash-kudos" id="dash-kudos" hidden></div>
      <div class="dash-key"><span class="dk-ramp" aria-hidden="true"><i class="l1"></i><i class="l2"></i><i class="l3"></i><i class="l4"></i></span> fewer → more entries <span class="dd leave">🌴</span> on leave${hasPending ? ' <span class="dd pending">⏳</span> waiting for approval' : ''} <span class="dd hol">✦</span> holiday</div>
    </section>`;
  }

  function waitingPanel(d, opts) {
    let body;
    if ((d.weekOffset || 0) !== 0) {
      body = '<p class="d2-empty">How long tickets have waited is shown for this week. <button type="button" class="d2-link" id="dash-to-now">Go to this week</button></p>';
    } else if (!Array.isArray(d.stuck)) {
      body = '<p class="d2-empty">This needs the latest update of your team\'s Sheet.</p>';
    } else if (!d.stuck.length) {
      body = '<p class="d2-empty">Nothing has been pending or in progress for more than a week.</p>';
    } else {
      const span = Math.max(14, ...d.stuck.map((s) => s.days));
      const shown = d.stuck.slice(0, 5);
      const startKey = ymd(new Date(Date.now() - span * 86400000));
      body = `<ul class="wt-list">${shown.map((s, i) => {
        const crit = s.days >= 14;
        return `<li><button type="button" class="wt-item" data-i="${i}">
          <span class="wt-top">${s.id ? `<span class="wt-id">${esc(s.id)}</span>` : ''}<span class="wt-title">${esc(s.title || '(no description)')}</span></span>
          <span class="wt-meta"><span>${esc(s.status)}${s.owner ? ' · ' + esc(s.owner) : ''}${s.tab && opts.ticketTabs > 1 ? ' · ' + esc(s.tab) : ''}</span><span class="wt-age ${crit ? 'crit' : 'warn'}"><span aria-hidden="true">${crit ? '⏱' : '⏳'}</span> ${s.days} days</span></span>
          <span class="wt-track" aria-hidden="true"><span class="wt-bar ${crit ? 'crit' : 'warn'}" style="left:${(100 * (1 - s.days / span)).toFixed(1)}%"></span><span class="wt-week" style="left:${(100 * (1 - 7 / span)).toFixed(1)}%"></span></span>
        </button></li>`;
      }).join('')}</ul>
      <div class="wt-axis" aria-hidden="true"><span>${esc(short(startKey).replace(/^\w+ /, ''))}</span><span style="left:${(100 * (1 - 7 / span)).toFixed(1)}%">1 week ago</span><span>today</span></div>
      ${d.stuck.length > shown.length || (d.totals.stuckTickets || 0) > shown.length ? `<button type="button" class="d2-link" id="dash-all-stuck">See all ${d.totals.stuckTickets || d.stuck.length} on the board</button>` : ''}`;
    }
    const pend = (d.weekOffset || 0) === 0 && d.pendingLeave ? `<div class="wt-leave"><span aria-hidden="true">🌴</span><span class="grow"><b>${plural(d.pendingLeave, 'leave request')}</b> ${d.pendingLeave === 1 ? 'is' : 'are'} waiting for an approver</span>${opts.canApprove ? '<button type="button" class="d2-link" id="dash-approvals">Approvals</button>' : ''}</div>` : '';
    return `<section class="d2-panel d2-wait" aria-labelledby="d2-wait-h">
      <div class="d2-ph"><h3 id="d2-wait-h">Waiting more than a week</h3><p>Pending or in progress, by how long</p></div>
      ${body}${pend}
    </section>`;
  }

  function perDayPanel(d) {
    const people = d.people || [];
    const now = Array.isArray(d.dayTotals) ? d.dayTotals : DAYS.map((x, i) => sum(people.map((p) => (p.counts && p.counts[i]) || 0)));
    const prev = Array.isArray(d.prevDays) ? d.prevDays : null;
    const today = d.weekOffset === 0 ? d.week.today : -1;
    const later = (i) => d.weekOffset === 0 && d.week.today >= 0 && i > d.week.today;
    const top = Math.max(4, ...now, ...(prev || [0]));
    const step = Math.max(1, Math.ceil(top / 4));
    const ceil = step * 4;
    const grid = [0, 1, 2, 3, 4].map((g) => `<span class="pd-grid" style="bottom:${g * 25}%"><em>${g * step}</em></span>`).join('');
    const cols = DAYS.map((x, i) => {
      const tip = `${short(d.week.days[i])}: ${later(i) ? 'later this week' : plural(now[i], 'entry', 'entries')}${prev ? ` · the week before: ${prev[i]}` : ''}`;
      return `<div class="pd-col" tabindex="0" data-tip="${esc(tip)}" aria-label="${esc(tip)}">
        <div class="pd-bars">${later(i) ? '<span class="pd-bar now later"></span>' : `<span class="pd-bar now" style="height:${(100 * now[i] / ceil).toFixed(1)}%"></span>`}${prev ? `<span class="pd-bar prev" style="height:${(100 * prev[i] / ceil).toFixed(1)}%"></span>` : ''}</div>
        ${i === today ? `<em class="pd-lab" style="bottom:${(100 * Math.max(now[i], prev ? prev[i] : 0) / ceil).toFixed(1)}%">${now[i]} so far</em>` : ''}
        <span class="pd-x">${x}</span></div>`;
    }).join('');
    return `<section class="d2-panel d2-perday" aria-labelledby="d2-pd-h">
      <div class="d2-ph"><h3 id="d2-pd-h">Entries each day</h3><p>${prev ? 'This week against the week before' : 'This week'}</p></div>
      <div class="pd-chart"><div class="pd-plot">${grid}<div class="pd-cols">${cols}</div></div></div>
      ${prev ? '<div class="pd-legend"><span><i class="now"></i>This week</span><span><i class="prev"></i>The week before</span></div>' : ''}
    </section>`;
  }

  function ticketsPanel(d, opts) {
    const tk = d.tickets;
    if (!tk || !opts.ticketTabs) return '';
    const open = tk.byStatus.filter((s) => !s.closed), closed = tk.byStatus.filter((s) => s.closed);
    const max = Math.max(1, ...open.map((s) => s.n));
    const doneN = sum(closed.map((s) => s.n));
    return `<section class="d2-panel d2-tickets" aria-labelledby="d2-tk-h">
      <div class="d2-ph"><h3 id="d2-tk-h">Tickets</h3><p>Where every open ticket stands now</p></div>
      ${open.length ? `<ul class="tk-list">${open.slice(0, 6).map((s) => `<li><span class="tk-s">${esc(s.status)}</span><span class="tk-track"><span class="tk-bar" style="width:${(100 * s.n / max).toFixed(1)}%"></span></span><b>${s.n}</b></li>`).join('')}</ul>` : '<p class="d2-empty">No open tickets.</p>'}
      <p class="tk-foot">${plural(tk.opened || 0, 'ticket')} raised ${d.weekOffset ? 'that' : 'this'} week${doneN ? ` · ${doneN} done in all` : ''}</p>
      <button type="button" class="d2-link" id="dash-board">Open the ticket board</button>
    </section>`;
  }

  function offPanel(d, opts) {
    const off = d.weekOffset || 0;
    let rows = [];
    let title = "Who's off next", sub = 'The next 7 working days';
    if (off !== 0) {
      title = 'Who was off'; sub = weekLabel(d);
      (d.week.days || []).forEach((k, i) => {
        const names = (d.people || []).filter((p) => p.leaveDays && p.leaveDays[i]).map((p) => ({ name: p.name, type: 'Leave' }));
        if (d.week.holidays && d.week.holidays[i]) rows.push({ date: k, hol: 'Holiday' });
        names.forEach((n) => rows.push({ date: k, name: n.name, type: n.type, kind: 'taken' }));
      });
    } else if (Array.isArray(d.upcoming)) {
      const hol = d.upcomingHolidays || [];
      (d.nextDays || []).forEach((k) => {
        hol.filter((h) => h.date === k).forEach((h) => rows.push({ date: k, hol: h.name }));
        d.upcoming.filter((u) => u.date === k).forEach((u) => rows.push(u));
      });
    } else {
      return '';
    }
    const todayKey = ymd(new Date()), tomorrowKey = ymd(new Date(Date.now() + 86400000));
    const when = (k) => (off === 0 && k === todayKey ? 'Today' : off === 0 && k === tomorrowKey ? 'Tomorrow' : short(k).replace(/ \w+$/, ''));
    const list = rows.slice(0, 7);
    const more = rows.length - list.length;
    let last = '';
    const html = list.map((r) => {
      const label = r.date !== last ? when(r.date) : '';
      last = r.date;
      if (r.hol) return `<li class="off-hol"><span class="off-d">${esc(label)}</span><span class="off-w"><b>✦ ${esc(r.hol)}</b></span></li>`;
      const chips = [r.half ? '<span class="off-chip">half day</span>' : '', r.kind === 'planned' ? '<span class="off-chip planned">planned</span>' : '', r.kind === 'pending' ? '<span class="off-chip pending"><span aria-hidden="true">⏳</span> waiting</span>' : '', r.wfh ? '<span class="off-chip">from home</span>' : ''].join('');
      return `<li><span class="off-d">${esc(label)}</span><span class="off-w"><b>${esc(r.name)}</b><span class="off-t">${esc(r.type || 'Leave')}${chips}</span></span></li>`;
    }).join('');
    return `<section class="d2-panel d2-off" aria-labelledby="d2-off-h">
      <div class="d2-ph"><h3 id="d2-off-h">${title}</h3><p>${esc(sub)}</p></div>
      ${html ? `<ul class="off-list">${html}</ul>${more > 0 ? `<p class="tk-foot">+ ${more} more</p>` : ''}` : ''}
      ${off === 0 && !opts.hasLeave ? '<p class="d2-empty">No tab is set up for leave yet, so Daylens can\'t tell who\'s off. An admin can pick the leave tab in Tabs &amp; fields → Tabs ("For: Leave").</p>' : html ? '' : `<p class="d2-empty">${off !== 0 ? 'Nobody was off that week.' : 'Nobody is off in the next 7 working days.'}</p>`}
      ${opts.hasLeave ? '<button type="button" class="d2-link" id="dash-leave">Open the leave calendar</button>' : ''}
    </section>`;
  }

  // Admins, in December and January: the year's holidays aren't in yet.
  function holidayNudge(d, isAdmin, now) {
    if (!isAdmin || (d.weekOffset || 0) !== 0 || !d.holidaysByYear) return '';
    now = now || new Date();
    const y = now.getMonth() === 11 ? now.getFullYear() + 1 : now.getMonth() === 0 ? now.getFullYear() : 0;
    if (!y || d.holidaysByYear[y] !== 0) return '';
    return `<div class="d2-nudge" role="status"><span aria-hidden="true">✦</span><span class="grow"><b>Add the ${y} holidays.</b> The leave calendar shows them, and scheduled reports and the Friday check-in skip those days.</span><button type="button" class="mini-btn go" id="dash-holidays" data-year="${y}">Add ${y} holidays</button></div>`;
  }

  // ---------------- drawing ----------------

  function render(host, opts) {
    opts = opts || {};
    let offset = 0;
    let data = null;
    let notesOpen = false;
    let updating = false;
    const isAdmin = !!opts.isAdmin;
    const hero = host.querySelector('.d2-hero') || host;
    const body = host.querySelector('.d2-body') || host;
    const heroHtml = (title, sub, off) => `
      <div class="d2-hl"><h2 class="d2-headline">${esc(title)}</h2><div class="dash-sub">${sub}</div></div>
      <div class="d2-ctl">
        <div class="dash-nav" role="group" aria-label="Which week">
          <button type="button" class="dash-btn" id="dash-prev" title="The week before" aria-label="The week before">‹</button>
          <span class="dash-title">${offsetLabel(off)}</span>
          <button type="button" class="dash-btn" id="dash-next" title="The week after" aria-label="The week after" ${off >= 0 ? 'disabled' : ''}>›</button>
        </div>
        <button type="button" class="dash-btn" id="dash-pdf" title="Save as a PDF for a meeting">⬇ PDF</button><button type="button" class="dash-btn" id="dash-png" title="Save as a picture">⬇ Picture</button>
      </div>
      <div class="dash-msg" id="dash-msg" role="status"></div>`;
    const wireHero = () => {
      hero.querySelector('#dash-prev').onclick = () => load(offset - 1);
      hero.querySelector('#dash-next').onclick = () => { if (offset < 0) load(offset + 1); };
      hero.querySelector('#dash-pdf').onclick = () => exportAs('pdf');
      hero.querySelector('#dash-png').onclick = () => exportAs('png');
    };
    const msg = (text, err) => { const m = hero.querySelector('#dash-msg'); if (!m) return; m.className = 'dash-msg' + (err ? ' err' : ''); m.textContent = text; };
    const exportAs = async (format) => {
      if (!data || !data.ok) return;
      msg('Preparing…');
      const r = await window.statusApp.exportDashboard({ format, html: printableHtml(data), name: `${data.teamName || 'Team'} week ${data.week.start}` }).catch((e) => ({ ok: false, error: e.message }));
      if (r && r.canceled) msg('');
      else if (r && r.ok) msg('Saved.');
      else msg((r && r.error) || 'Couldn\'t save it.', true);
    };

    const draw = () => {
      if (!data) return;
      if (!data.ok) {
        hero.innerHTML = heroHtml('Your team this week', esc(data.error || "Couldn't load the dashboard just now."), offset);
        wireHero();
        body.innerHTML = isAdmin && /update/i.test(data.error || '') ? '<div class="d2-panel"><p class="dash-note">The dashboard needs the latest update of your team\'s Sheet.</p><button type="button" class="mini-btn go" id="dash-update">Update the team\'s Sheet</button></div>' : '';
        const u = body.querySelector('#dash-update');
        if (u && opts.onUpdate) u.onclick = opts.onUpdate;
        return;
      }
      const d = data;
      const off = d.weekOffset || 0;
      const today = new Date();
      const when = off === 0 ? `${WEEKDAYS[today.getDay()]} ${today.getDate()} ${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][today.getMonth()]}` : esc(weekLabel(d));
      const state = updating ? '<span class="dash-upd">updating…</span>' : d.stale ? '<span class="dash-upd">couldn\'t refresh — last saved numbers</span>' : esc(agoText(d.at));
      hero.innerHTML = heroHtml(headline(d), [when, state].filter(Boolean).join(' · '), off);
      wireHero();
      const canKudos = (p) => d.teams || p.canEmail;
      const small = [perDayPanel(d), ticketsPanel(d, opts), offPanel(d, opts)].filter(Boolean);
      body.innerHTML = `${holidayNudge(d, isAdmin)}${kpis(d)}
        <div class="d2-row">${weekPanel(d, canKudos)}${waitingPanel(d, opts)}</div>
        <div class="d2-row d2-row-${small.length}">${small.join('')}</div>
        ${isAdmin ? notesHtml(d.notes, notesOpen) : ''}
        <div class="d2-tip" id="d2-tip" role="tooltip" hidden></div>`;
      wireBody(d);
    };

    function wireBody(d) {
      const on = (sel, fn) => { const el = body.querySelector(sel); if (el) el.onclick = fn; };
      on('#dash-k-tickets', () => opts.onOpenBoard && opts.onOpenBoard({}));
      on('#dash-board', () => opts.onOpenBoard && opts.onOpenBoard({}));
      on('#dash-all-stuck', () => opts.onOpenBoard && opts.onOpenBoard({ stuck: true }));
      on('#dash-leave', () => opts.onOpenLeave && opts.onOpenLeave());
      on('#dash-approvals', () => opts.onApprovals && opts.onApprovals());
      on('#dash-to-now', () => load(0));
      const hn = body.querySelector('#dash-holidays');
      if (hn) hn.onclick = () => opts.onHolidays && opts.onHolidays(Number(hn.dataset.year));
      const kt = body.querySelector('#dash-k-tickets');
      if (kt && !opts.ticketTabs) { kt.disabled = true; kt.removeAttribute('title'); }
      body.querySelectorAll('.wt-item').forEach((b) => { b.onclick = () => opts.onOpenTicket && opts.onOpenTicket(d.stuck[Number(b.dataset.i)]); });
      // The day chart's numbers on hover / focus.
      const tip = body.querySelector('#d2-tip');
      body.querySelectorAll('.pd-col').forEach((c) => {
        const show = () => {
          tip.textContent = c.dataset.tip;
          tip.hidden = false;
          const r = c.getBoundingClientRect(), hr = body.getBoundingClientRect();
          const half = tip.offsetWidth / 2;
          tip.style.left = `${Math.min(hr.width - half, Math.max(half, r.left - hr.left + r.width / 2))}px`;
          tip.style.top = `${r.top - hr.top - 8}px`;
        };
        c.addEventListener('mouseenter', show);
        c.addEventListener('focus', show);
        c.addEventListener('mouseleave', () => { tip.hidden = true; });
        c.addEventListener('blur', () => { tip.hidden = true; });
      });
      const notes = body.querySelector('#dash-notes');
      if (notes) {
        notes.addEventListener('toggle', () => { notesOpen = notes.open; });
        const ig = Object.assign({ names: [], tabs: [] }, (d.notes && d.notes.ignored) || {});
        const change = async (next) => {
          const m = body.querySelector('#dn-msg');
          m.textContent = 'Saving…';
          const r = await window.statusApp.saveDashboardIgnore(next).catch((e) => ({ ok: false, error: e.message }));
          if (!r || !r.ok) { m.textContent = (r && r.error) || 'Couldn\'t save that.'; return; }
          notesOpen = true;
          load(offset, { fresh: true });
        };
        const without = (list, v) => list.filter((x) => String(x).toLowerCase() !== String(v).toLowerCase());
        notes.querySelectorAll('.dn-ignore-name').forEach((b) => { b.onclick = () => change({ names: ig.names.concat([b.dataset.v]), tabs: ig.tabs }); });
        notes.querySelectorAll('.dn-ignore-tab').forEach((b) => { b.onclick = () => change({ names: ig.names, tabs: ig.tabs.concat([b.dataset.v]) }); });
        notes.querySelectorAll('.dn-holiday-tab, .dn-leave-tab').forEach((b) => {
          b.onclick = async () => {
            const m = notes.querySelector('#dn-msg');
            m.textContent = 'Saving…';
            const r = await window.statusApp.setTabType(b.dataset.v, b.classList.contains('dn-leave-tab') ? 'leave' : 'holiday').catch((e) => ({ ok: false, error: e.message }));
            if (!r || !r.ok) { m.textContent = (r && r.error) || 'Couldn\'t save that.'; return; }
            notesOpen = true;
            if (opts.onTabTypesChanged) opts.onTabTypesChanged(); // Home redraws with the new leave / holiday tab
            else load(offset, { fresh: true });
          };
        });
        notes.querySelectorAll('.dn-unignore-name').forEach((b) => { b.onclick = () => change({ names: without(ig.names, b.dataset.v), tabs: ig.tabs }); });
        notes.querySelectorAll('.dn-unignore-tab').forEach((b) => { b.onclick = () => change({ names: ig.names, tabs: without(ig.tabs, b.dataset.v) }); });
      }
      body.querySelectorAll('.kudos-btn').forEach((b) => { b.onclick = () => openKudos(d.people[Number(b.dataset.i)]); });
      function openKudos(p) {
        const box = body.querySelector('#dash-kudos');
        box.hidden = false;
        box.innerHTML = `
          <div class="dk-title">🎉 Kudos to ${esc(p.name)}</div>
          <textarea class="dk-text" rows="3" maxlength="500" aria-label="Your message"></textarea>
          <div class="dk-via">
            <label><input type="checkbox" class="dk-teams" ${d.teams ? 'checked' : 'disabled'} /> Teams channel</label>
            <label><input type="checkbox" class="dk-email" ${p.canEmail ? 'checked' : 'disabled'} /> Email ${esc(p.name)}</label>
          </div>
          ${!d.teams || !p.canEmail ? `<div class="dk-hint">${!d.teams ? 'No Teams channel is set (App Settings).' : ''} ${!p.canEmail ? `${esc(p.name)} has no email in People.` : ''}</div>` : ''}
          <div class="dk-actions"><button type="button" class="mini-btn" id="dk-cancel">Cancel</button><button type="button" class="mini-btn go" id="dk-send">Send kudos</button></div>`;
        const ta = box.querySelector('.dk-text');
        ta.value = `Thanks for the great work this week, ${p.name}! 🎉`;
        ta.focus();
        box.querySelector('#dk-cancel').onclick = () => { box.hidden = true; box.innerHTML = ''; };
        box.querySelector('#dk-send').onclick = async () => {
          const teams = box.querySelector('.dk-teams').checked, email = box.querySelector('.dk-email').checked;
          if (!teams && !email) { msg('Choose Teams or email.', true); return; }
          const btn = box.querySelector('#dk-send');
          btn.disabled = true; btn.textContent = 'Sending…';
          const r = await window.statusApp.sendKudos({ to: p.name, message: ta.value, teams, email }).catch((e) => ({ ok: false, error: e.message }));
          btn.disabled = false; btn.textContent = 'Send kudos';
          if (!r || !r.ok) { msg((r && r.error) || 'Couldn\'t send it.', true); return; }
          box.hidden = true; box.innerHTML = '';
          msg(r.message || `Kudos sent to ${p.name}.`);
        };
      }
    }

    async function load(off, how) {
      offset = off;
      // This week: the last saved numbers straight away, then fresh ones.
      if (off === 0 && !(how && how.fresh) && window.statusApp.getSavedDashboard) {
        const saved = await window.statusApp.getSavedDashboard().catch(() => null);
        // Only a copy of THIS week (on Monday morning the saved one is last week's).
        if (saved && saved.ok && saved.week && saved.week.start === thisMonday() && off === offset && document.body.contains(host)) { data = saved; updating = true; draw(); }
      }
      if (!data || data.weekOffset !== off) skeleton(off);
      const r = await window.statusApp.getTeamDashboard(off).catch((e) => ({ ok: false, error: e.message }));
      if (!document.body.contains(host) || off !== offset) return; // moved on meanwhile
      updating = false;
      if (r && r.ok) data = r;
      else if (data && data.ok && data.weekOffset === off) { data = Object.assign({}, data, { stale: true }); }
      else data = r || { ok: false };
      draw();
    }
    function thisMonday() {
      const n = new Date();
      return ymd(new Date(n.getFullYear(), n.getMonth(), n.getDate() - ((n.getDay() + 6) % 7)));
    }
    // The shape of the page while the first numbers arrive (not an empty box).
    function skeleton(off) {
      hero.innerHTML = heroHtml(off === 0 ? 'Your team this week' : offsetLabel(off), 'Getting the team\'s week…', off);
      wireHero();
      body.innerHTML = `<div class="d2-kpis">${['entries', 'people with entries', 'on leave today', 'open tickets'].map((l) => `<div class="dash-stat"><b class="sk">—</b><span>${l}</span></div>`).join('')}</div>
        <div class="d2-row"><section class="d2-panel d2-week"><div class="d2-ph"><h3>The team's week</h3></div><div class="dash-people">${[1, 2, 3].map(() => '<div class="dp-row"><span class="dp-name"><span class="dp-av sk"> </span><span class="sk-bar"></span></span></div>').join('')}</div></section><section class="d2-panel d2-wait"><div class="d2-ph"><h3>Waiting more than a week</h3></div><span class="sk-bar"></span></section></div>`;
    }
    load(0);
  }

  window.DaylensDashboard = { render, printableHtml, headline, holidayNudge };
})();
