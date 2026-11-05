// Home's Classic look (the default; as before 1.5): the team dashboard in
// the right-hand column — this week, or an earlier one, per person: which
// days they logged, how many entries, leave; the team's totals; tickets
// waiting more than a week (1.5); kudos; and a PDF / picture download for a
// meeting. Numbers come from the team's Sheet (Code.gs teamDashboard_),
// computed there so the app never downloads every row. The Trendy look is
// dashboard.js; both read the same answer.
(function () {
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const short = (key) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(key || ''));
    if (!m) return String(key || '');
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return `${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
  };
  const initials = (n) => String(n || '?').replace(/[._-]+/g, ' ').trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  function weekLabel(d) { return `${short(d.week.start)} – ${short(d.week.end)}`; }

  function dayCell(p, i, d) {
    if (p.days[i]) return '<span class="dd on" title="Logged">●</span>';
    if (p.leaveDays && p.leaveDays[i]) return '<span class="dd leave" title="On leave">🌴</span>';
    if (p.pendingDays && p.pendingDays[i]) return '<span class="dd pending" title="Leave requested — waiting for approval">⏳</span>';
    if (d.week.holidays && d.week.holidays[i]) return '<span class="dd hol" title="Holiday">✦</span>';
    if (d.weekOffset === 0 && d.week.today >= 0 && i > d.week.today) return '<span class="dd later" title="Later this week">·</span>';
    return '<span class="dd off" title="No entries">○</span>';
  }

  // A plain, printable page of the same numbers (for the PDF / picture).
  function printableHtml(d) {
    const t = d.totals || {};
    const rows = (d.people || []).map((p) => `<tr><td class="n">${esc(p.name)}</td>${DAYS.map((x, i) => `<td class="c">${p.days[i] ? '✓' : p.leaveDays && p.leaveDays[i] ? 'Leave' : p.pendingDays && p.pendingDays[i] ? 'Leave (pending)' : d.week.holidays && d.week.holidays[i] ? 'Holiday' : ''}</td>`).join('')}<td class="c">${p.entries}</td><td>${esc(p.lastEntry ? short(p.lastEntry) : '—')}</td></tr>`).join('');
    const byTab = Object.keys(t.byTab || {}).map((k) => `<li>${esc(k)}: ${t.byTab[k]}</li>`).join('');
    return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(d.teamName || 'Team')} — ${esc(weekLabel(d))}</title><style>
      body{font-family:"Segoe UI",Arial,sans-serif;color:#1d2433;margin:28px;background:#fff}
      h1{font-size:22px;margin:0 0 2px} .sub{color:#5b6475;margin:0 0 18px;font-size:13px}
      .stats{display:flex;gap:12px;margin:0 0 18px} .st{flex:1;border:1px solid #e3e6ee;border-radius:10px;padding:10px 12px}
      .st b{display:block;font-size:22px} .st span{color:#5b6475;font-size:12px}
      table{border-collapse:collapse;width:100%;font-size:13px} th,td{border-bottom:1px solid #e9ecf2;padding:7px 8px;text-align:left}
      th{background:#f5f7fb;font-size:12px;color:#4a5263} td.c,th.c{text-align:center} td.n{font-weight:700}
      ul{margin:6px 0 0 18px;padding:0;font-size:13px} .foot{margin-top:22px;color:#8a92a3;font-size:11px}
    </style></head><body>
      <h1>${esc(d.teamName || 'Team')} — this week</h1><p class="sub">${esc(weekLabel(d))}</p>
      <div class="stats"><div class="st"><b>${t.entries || 0}</b><span>entries</span></div><div class="st"><b>${t.logged || 0} of ${t.people || 0}</b><span>people with entries</span></div><div class="st"><b>${t.onLeaveToday || 0}</b><span>on leave today</span></div><div class="st"><b>${t.openTickets || 0}</b><span>open tickets</span></div></div>
      <table><thead><tr><th>Person</th>${DAYS.map((x) => `<th class="c">${x}</th>`).join('')}<th class="c">Entries</th><th>Last entry</th></tr></thead><tbody>${rows}</tbody></table>
      ${byTab ? `<p class="sub" style="margin-top:16px">Entries by tab</p><ul>${byTab}</ul>` : ''}
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

  function render(host, opts) {
    opts = opts || {};
    let offset = 0;
    let data = null;
    let notesOpen = false;
    const isAdmin = !!opts.isAdmin;
    // 1.5: Pending / in progress for more than a week — the top three.
    const waitingHtml = () => {
      if (!data || offset !== 0 || !Array.isArray(data.stuck) || !data.stuck.length) return '';
      const n = (data.totals && data.totals.stuckTickets) || data.stuck.length;
      return `<div class="dash-wait" id="dash-wait" role="status"><div class="dw-head"><span aria-hidden="true">⏳</span> ${n} ticket${n === 1 ? '' : 's'} waiting more than a week</div><ul>${data.stuck.slice(0, 3).map((s, i) => `<li><button type="button" class="dw-item" data-i="${i}"><span class="dw-t">${s.id ? '<b>' + esc(s.id) + '</b> ' : ''}${esc(s.title || '(no description)')} — ${esc(s.status)}${s.owner ? ', ' + esc(s.owner) : ''}</span><span class="dw-age ${s.days >= 14 ? 'crit' : 'warn'}">${s.days >= 14 ? '⏱' : ''} ${s.days} days</span></button></li>`).join('')}</ul>${n > 3 && opts.ticketTabs ? `<button type="button" class="dw-more" id="dash-wait-more">See all ${n}</button>` : ''}</div>`;
    };
    const draw = () => {
      if (!data) return;
      if (!data.ok) {
        host.innerHTML = `<div class="dash-head"><div><div class="dash-title">Team this week</div></div></div><div class="dash-body"><p class="dash-note">${esc(data.error || "Couldn't load the dashboard just now.")}</p>${isAdmin && /update/i.test(data.error || '') ? '<button type="button" class="mini-btn go" id="dash-update">Update the team\'s Sheet</button>' : ''}</div>`;
        const u = host.querySelector('#dash-update');
        if (u && opts.onUpdate) u.onclick = opts.onUpdate;
        return;
      }
      const t = data.totals || {};
      const canKudos = (p) => data.teams || p.canEmail;
      host.innerHTML = `
        <div class="dash-head">
          <div><div class="dash-title">${offset === 0 ? 'This week' : offset === -1 ? 'Last week' : `${-offset} weeks ago`}</div><div class="dash-sub">${esc(weekLabel(data))}${updating ? ' · <span class="dash-upd">updating…</span>' : data.stale ? ' · <span class="dash-upd">couldn\'t refresh — last saved numbers</span>' : ''}</div></div>
          <div class="dash-nav">
            <button type="button" class="dash-btn" id="dash-prev" title="The week before" aria-label="The week before">‹</button>
            <button type="button" class="dash-btn" id="dash-next" title="The week after" aria-label="The week after" ${offset >= 0 ? 'disabled' : ''}>›</button>
          </div>
        </div>
        <div class="dash-body">
        <div class="dash-stats">
          <div class="dash-stat"><b>${t.entries || 0}</b><span>entries</span></div>
          <div class="dash-stat"><b>${t.logged || 0}<small>/${t.people || 0}</small></b><span>people with entries</span></div>
          <div class="dash-stat"><b>${t.onLeaveToday || 0}</b><span>${offset === 0 ? 'on leave today' : 'on leave Mon'}</span></div>
          <div class="dash-stat"><b>${t.openTickets || 0}</b><span>open tickets</span></div>
        </div>
        ${waitingHtml()}
        <div class="dash-people" role="table" aria-label="Who added entries on which day">
          <div class="dp-row dp-head" role="row"><span class="dp-name" role="columnheader">Person</span>${DAYS.map((x) => `<span class="dp-day" role="columnheader">${x[0]}</span>`).join('')}<span class="dp-n" role="columnheader" title="Entries">#</span><span class="dp-k"></span></div>
          ${(data.people || []).map((p, idx) => `
            <div class="dp-row" role="row" data-person="${esc(p.name)}">
              <span class="dp-name" role="cell"><span class="dp-av">${esc(initials(p.name))}</span><span class="dp-nm" title="${esc(p.lastEntry ? 'Last entry ' + short(p.lastEntry) : 'No entries in the last few weeks')}">${esc(p.name)}</span></span>
              ${DAYS.map((x, i) => `<span class="dp-day" role="cell">${dayCell(p, i, data)}</span>`).join('')}
              <span class="dp-n" role="cell">${p.entries}</span>
              <span class="dp-k">${canKudos(p) ? `<button type="button" class="dash-btn kudos-btn" data-i="${idx}" title="Send ${esc(p.name)} kudos" aria-label="Send ${esc(p.name)} kudos">🎉</button>` : ''}</span>
            </div>`).join('') || '<p class="dash-note">No one in the team yet.</p>'}
        </div>
        <div class="dash-kudos" id="dash-kudos" hidden></div>
        <div class="dash-foot">
          <span class="dash-key"><span class="dd on">●</span> entries <span class="dd leave">🌴</span> leave${(data.people || []).some((p) => (p.pendingDays || []).some(Boolean)) ? ' <span class="dd pending">⏳</span> leave waiting for approval' : ''} <span class="dd hol">✦</span> holiday</span>
          <span class="dash-dl"><button type="button" class="dash-btn" id="dash-pdf" title="Save as a PDF for a meeting">⬇ PDF</button><button type="button" class="dash-btn" id="dash-png" title="Save as a picture">⬇ Picture</button></span>
        </div>
        <div class="dash-msg" id="dash-msg" role="status"></div>
        ${isAdmin ? notesHtml(data.notes, notesOpen) : ''}
        </div>`;
      host.querySelectorAll('.dw-item').forEach((b) => { b.onclick = () => opts.onOpenTicket && opts.onOpenTicket(data.stuck[Number(b.dataset.i)]); });
      const more = host.querySelector('#dash-wait-more');
      if (more) more.onclick = () => opts.onOpenBoard && opts.onOpenBoard({ stuck: true });
      const notes = host.querySelector('#dash-notes');
      if (notes) {
        notes.addEventListener('toggle', () => { notesOpen = notes.open; });
        const ig = Object.assign({ names: [], tabs: [] }, (data.notes && data.notes.ignored) || {});
        const change = async (next) => {
          const m = host.querySelector('#dn-msg');
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
      host.querySelector('#dash-prev').onclick = () => load(offset - 1);
      host.querySelector('#dash-next').onclick = () => { if (offset < 0) load(offset + 1); };
      const msg = (text, err) => { const m = host.querySelector('#dash-msg'); m.className = 'dash-msg' + (err ? ' err' : ''); m.textContent = text; };
      const exportAs = async (format) => {
        msg('Preparing…');
        const r = await window.statusApp.exportDashboard({ format, html: printableHtml(data), name: `${data.teamName || 'Team'} week ${data.week.start}` }).catch((e) => ({ ok: false, error: e.message }));
        if (r && r.canceled) msg('');
        else if (r && r.ok) msg('Saved.');
        else msg((r && r.error) || 'Couldn\'t save it.', true);
      };
      host.querySelector('#dash-pdf').onclick = () => exportAs('pdf');
      host.querySelector('#dash-png').onclick = () => exportAs('png');
      host.querySelectorAll('.kudos-btn').forEach((b) => {
        b.onclick = () => openKudos(data.people[Number(b.dataset.i)]);
      });
      function openKudos(p) {
        const box = host.querySelector('#dash-kudos');
        box.hidden = false;
        box.innerHTML = `
          <div class="dk-title">🎉 Kudos to ${esc(p.name)}</div>
          <textarea class="dk-text" rows="3" maxlength="500" aria-label="Your message"></textarea>
          <div class="dk-via">
            <label><input type="checkbox" class="dk-teams" ${data.teams ? 'checked' : 'disabled'} /> Teams channel</label>
            <label><input type="checkbox" class="dk-email" ${p.canEmail ? 'checked' : 'disabled'} /> Email ${esc(p.name)}</label>
          </div>
          ${!data.teams || !p.canEmail ? `<div class="dk-hint">${!data.teams ? 'No Teams channel is set (App Settings).' : ''} ${!p.canEmail ? `${esc(p.name)} has no email in People.` : ''}</div>` : ''}
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
    };
    async function load(off, how) {
      offset = off;
      // This week: the last saved numbers straight away, then fresh ones.
      if (off === 0 && !(how && how.fresh) && window.statusApp.getSavedDashboard) {
        const saved = await window.statusApp.getSavedDashboard().catch(() => null);
        // Only a copy of THIS week (on Monday morning the saved one is last week's).
        if (saved && saved.ok && saved.week && saved.week.start === thisMonday() && off === offset && document.body.contains(host)) { data = saved; updating = true; draw(); }
      }
      if (!data || data.weekOffset !== off) host.innerHTML = skeleton(off);
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
      const m = new Date(n.getFullYear(), n.getMonth(), n.getDate() - ((n.getDay() + 6) % 7));
      return `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, '0')}-${String(m.getDate()).padStart(2, '0')}`;
    }
    // The shape of the panel while the first numbers arrive (not an empty box).
    function skeleton(off) {
      const title = !off ? 'This week' : off === -1 ? 'Last week' : `${-off} weeks ago`;
      return `<div class="dash-head"><div><div class="dash-title">${title}</div><div class="dash-sub">Getting the team's week…</div></div></div>
        <div class="dash-body"><div class="dash-stats">${['entries', 'people with entries', 'on leave today', 'open tickets'].map((l) => `<div class="dash-stat"><b class="sk">—</b><span>${l}</span></div>`).join('')}</div>
        <div class="dash-people">${[1, 2, 3].map(() => '<div class="dp-row"><span class="dp-name"><span class="dp-av sk"> </span><span class="sk-bar"></span></span></div>').join('')}</div></div>`;
    }
    let updating = false;
    load(0);
  }

  window.DaylensDashboardClassic = { render, printableHtml };
})();
