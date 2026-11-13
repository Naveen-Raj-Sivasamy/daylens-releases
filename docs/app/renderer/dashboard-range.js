// Daylens 1.10.1 — the dashboard over a month or any dates.
// A bar above Home's dashboard: Week (the usual dashboard) · Month · Custom.
// Month and Custom show a summary of the same team, counted by the same
// rules as the week, set against the period of the same length just before.
// It only reads (Code.gs rangeSummary_), and only when someone asks for it,
// so Home opens exactly as fast as before.
(function () {
  'use strict';
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const plural = (n, a, b) => `${n} ${n === 1 ? a : (b || a + 's')}`;
  const short = (k) => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(k || ''); return m ? `${Number(m[3])} ${MONTHS[Number(m[2]) - 1].slice(0, 3)}` : String(k || ''); };

  const CSS = `
  .range-bar { display: flex; align-items: center; flex-wrap: wrap; gap: 10px 14px; margin: 0 0 14px; }
  .range-seg { display: inline-flex; padding: 4px; gap: 4px; border-radius: 14px; background: var(--card-bg-2, var(--card-bg)); border: 1px solid var(--card-border); }
  .range-seg button { border: 0; background: transparent; color: var(--card-text); font: inherit; font-size: 14px; font-weight: 700; padding: 7px 16px; border-radius: 10px; cursor: pointer; }
  .range-seg button[aria-pressed="true"] { background: var(--gold); color: var(--on-gold); }
  .range-seg button:focus-visible, .range-pick select:focus-visible, .range-pick input:focus-visible, .range-pick button:focus-visible { outline: 3px solid var(--gold-bright, var(--gold)); outline-offset: 2px; }
  .range-pick { display: inline-flex; align-items: center; flex-wrap: wrap; gap: 8px; color: var(--card-text); font-size: 13.5px; font-weight: 600; }
  .range-pick select, .range-pick input { font: inherit; font-size: 14px; color: var(--card-text); background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 10px; padding: 6px 10px; color-scheme: light dark; }
  .range-pick button { font: inherit; font-size: 14px; font-weight: 700; border: 0; border-radius: 10px; padding: 7px 16px; background: var(--gold); color: var(--on-gold); cursor: pointer; }
  .range-err { color: var(--card-text); font-size: 13.5px; font-weight: 600; }
  .range-view { margin: 0 0 22px; padding: 20px 22px; border-radius: 22px; background: var(--card-bg); border: 1px solid var(--card-border); color: var(--card-text); }
  .range-view h2 { margin: 0; font-size: 22px; font-weight: 800; }
  .range-view .rv-sub { margin: 4px 0 16px; font-size: 13.5px; color: var(--card-text); opacity: 0.9; }
  .rv-kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 12px; margin-bottom: 18px; }
  .rv-kpi { padding: 14px 16px; border-radius: 16px; background: var(--card-bg-2, var(--card-bg)); border: 1px solid var(--card-border); }
  .rv-kpi b { display: block; font-size: 28px; line-height: 1.1; font-weight: 800; }
  .rv-kpi span { display: block; font-size: 13px; margin-top: 2px; }
  .rv-kpi .rv-d { margin-top: 6px; font-weight: 700; }
  .rv-grid { display: grid; grid-template-columns: minmax(0, 3fr) minmax(0, 2fr); gap: 18px; }
  @media (max-width: 900px) { .rv-grid { grid-template-columns: minmax(0, 1fr); } }
  .range-view h3 { margin: 0 0 8px; font-size: 15px; font-weight: 800; }
  .rv-chart { width: 100%; height: 150px; display: block; }
  .rv-chart rect { fill: var(--gold); }
  .rv-chart text { fill: var(--card-text); font-size: 10px; }
  .rv-table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
  .rv-table th, .rv-table td { text-align: left; padding: 6px 8px; border-bottom: 1px solid var(--card-border); }
  .rv-table th { font-weight: 800; }
  .rv-table td.n, .rv-table th.n { text-align: right; font-variant-numeric: tabular-nums; }
  .rv-tabs { list-style: none; margin: 0; padding: 0; }
  .rv-tabs li { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 2px 10px; margin-bottom: 9px; font-size: 13.5px; }
  .rv-tabs .bar { grid-column: 1 / -1; height: 7px; border-radius: 4px; background: var(--card-bg-2, var(--card-border)); overflow: hidden; }
  .rv-tabs .bar i { display: block; height: 100%; background: var(--gold); border-radius: 4px; }
  .range-view details { margin-top: 14px; font-size: 13.5px; }
  .range-view summary { cursor: pointer; font-weight: 700; }
  .home-dash.range-on > .d2-hero, .home-dash.range-on > .d2-body { display: none; }
  .home-split.range-on > #home-dash { display: none; }
  .home-split.range-on { grid-template-columns: minmax(0, 1fr); }
  `;

  function mount(wrapTarget, beforeEl) {
    if (!document.getElementById('range-css')) { const st = document.createElement('style'); st.id = 'range-css'; st.textContent = CSS; document.head.appendChild(st); }
    const bar = document.createElement('div');
    bar.className = 'range-bar';
    bar.id = 'range-bar';
    const today = new Date();
    const monthOpts = [];
    for (let i = 0; i >= -12; i--) { const d = new Date(today.getFullYear(), today.getMonth() + i, 1); monthOpts.push(`<option value="${i}">${MONTHS[d.getMonth()]} ${d.getFullYear()}${i === 0 ? ' (so far)' : ''}</option>`); }
    const d30 = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29);
    bar.innerHTML = `<div class="range-seg" role="group" aria-label="Dashboard period">
        <button type="button" data-m="week" aria-pressed="true">Week</button>
        <button type="button" data-m="month" aria-pressed="false">Month</button>
        <button type="button" data-m="custom" aria-pressed="false">Custom</button></div>
      <span class="range-pick" id="range-month" hidden><label for="range-month-sel">Month</label><select id="range-month-sel">${monthOpts.join('')}</select></span>
      <span class="range-pick" id="range-custom" hidden><label for="range-from">From</label><input type="date" id="range-from" value="${ymd(d30)}" max="${ymd(today)}"><label for="range-to">to</label><input type="date" id="range-to" value="${ymd(today)}" max="${ymd(today)}"><button type="button" id="range-go">Show</button></span>`;
    const view = document.createElement('section');
    view.className = 'range-view';
    view.id = 'range-view';
    view.hidden = true;
    view.setAttribute('aria-live', 'polite');
    wrapTarget.insertBefore(bar, beforeEl || null);
    wrapTarget.insertBefore(view, beforeEl || null);

    let mode = 'week';
    let ticket = 0;
    const setOn = (on) => { const el = wrapTarget.querySelector('.home-split') || wrapTarget.querySelector('#home-dash'); if (el) el.classList.toggle('range-on', on); };
    const setMode = (m) => {
      mode = m;
      bar.querySelectorAll('.range-seg button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.m === m)));
      bar.querySelector('#range-month').hidden = m !== 'month';
      bar.querySelector('#range-custom').hidden = m !== 'custom';
      view.hidden = m === 'week';
      setOn(m !== 'week');
      if (m === 'month') load({ kind: 'month', offset: Number(bar.querySelector('#range-month-sel').value) });
      if (m === 'custom') load(null);
    };
    async function load(body) {
      const my = ++ticket;
      if (!body) {
        const f = bar.querySelector('#range-from').value, t = bar.querySelector('#range-to').value;
        if (!f || !t) { view.innerHTML = '<p class="range-err">Pick a start and an end date, then Show.</p>'; return; }
        body = { kind: 'custom', from: f, to: t };
      }
      view.innerHTML = '<p class="rv-sub" role="status">Counting entries…</p>';
      const r = await (window.statusApp.getRangeSummary ? window.statusApp.getRangeSummary(body) : Promise.resolve({ ok: false })).catch((e) => ({ ok: false, error: e.message }));
      if (my !== ticket || !document.body.contains(view)) return;
      view.innerHTML = r && r.ok ? html(r) : `<p class="range-err" role="alert">${esc((r && r.error) || 'Couldn\'t load this period just now.')}${/update/i.test((r && r.error) || '') ? '' : ''}</p>`;
    }
    bar.querySelectorAll('.range-seg button').forEach((b) => { b.onclick = () => setMode(b.dataset.m); });
    bar.querySelector('#range-month-sel').onchange = () => mode === 'month' && load({ kind: 'month', offset: Number(bar.querySelector('#range-month-sel').value) });
    bar.querySelector('#range-go').onclick = () => load(null);
    return { setMode, bar, view };
  }

  function delta(now, before, what) {
    const diff = now - before;
    return diff > 0 ? `<span class="rv-d"><span aria-hidden="true">▲</span> ${diff} more than ${what}</span>`
      : diff < 0 ? `<span class="rv-d"><span aria-hidden="true">▼</span> ${-diff} fewer than ${what}</span>`
      : `<span class="rv-d">Same as ${what}</span>`;
  }

  function chart(r) {
    const n = r.series.length;
    if (!n) return '';
    const max = Math.max(1, ...r.series);
    const W = 600, H = 120, gap = 2, bw = Math.max(2, (W - gap * (n - 1)) / n);
    const bars = r.series.map((v, i) => {
      const h = Math.round((v / max) * (H - 4));
      const label = r.unit === 'week' ? `Week of ${short(r.seriesKeys[i])}` : short(r.seriesKeys[i]);
      return `<rect x="${(i * (bw + gap)).toFixed(1)}" y="${H - h}" width="${bw.toFixed(1)}" height="${Math.max(h, v ? 2 : 0)}" rx="2"><title>${esc(label)}: ${plural(v, 'entry', 'entries')}</title></rect>`;
    }).join('');
    const first = r.unit === 'week' ? `Week of ${short(r.seriesKeys[0])}` : short(r.seriesKeys[0]);
    const last = r.unit === 'week' ? `Week of ${short(r.seriesKeys[n - 1])}` : short(r.seriesKeys[n - 1]);
    return `<svg class="rv-chart" viewBox="0 0 ${W} ${H + 14}" preserveAspectRatio="none" role="img" aria-label="Entries per ${r.unit}, from ${esc(first)} to ${esc(last)}, busiest ${max}">${bars}</svg>
      <details><summary>Entries per ${r.unit} as a table</summary><table class="rv-table"><thead><tr><th>${r.unit === 'week' ? 'Week of' : 'Day'}</th><th class="n">Entries</th></tr></thead><tbody>${r.series.map((v, i) => `<tr><td>${esc(short(r.seriesKeys[i]))}</td><td class="n">${v}</td></tr>`).join('')}</tbody></table></details>`;
  }

  function html(r) {
    const t = r.totals || {};
    const what = r.kind === 'month' ? 'the period before' : 'the period before';
    const prev = `${short(r.prev.from)} – ${short(r.prev.to)}`;
    const people = (r.people || []).map((p) => `<tr><td>${esc(p.name)}</td><td class="n">${p.entries}</td><td class="n">${p.prevEntries}</td><td class="n">${p.activeDays} of ${r.workdays}</td><td class="n">${p.leaveDays}</td></tr>`).join('');
    const maxTab = Math.max(1, ...(r.byTab || []).map((x) => x.n));
    const tabs = (r.byTab || []).map((x) => `<li><span>${esc(x.tab)}</span><b>${x.n}</b><span class="bar"><i style="width:${Math.round((x.n / maxTab) * 100)}%"></i></span></li>`).join('');
    return `<h2>${esc(r.label)}</h2>
      <p class="rv-sub">${plural(r.days, 'day')}, ${plural(r.workdays, 'working day')}${r.partial ? ' so far' : ''}. Set against ${esc(prev)}.</p>
      <div class="rv-kpis">
        <div class="rv-kpi"><b>${t.entries || 0}</b><span>entries</span>${delta(t.entries || 0, t.prevEntries || 0, what)}</div>
        <div class="rv-kpi"><b>${t.logged || 0} of ${t.people || 0}</b><span>people with entries</span></div>
        <div class="rv-kpi"><b>${t.ticketsOpened || 0}</b><span>tickets opened</span>${delta(t.ticketsOpened || 0, t.prevTicketsOpened || 0, what)}</div>
      </div>
      <div class="rv-grid">
        <div><h3>Entries per ${r.unit}</h3>${chart(r) || '<p class="rv-sub">No entries in this period.</p>'}</div>
        <div><h3>By tab</h3>${tabs ? `<ul class="rv-tabs">${tabs}</ul>` : '<p class="rv-sub">No entries in this period.</p>'}</div>
      </div>
      <h3 style="margin-top:18px">By person</h3>
      <table class="rv-table"><thead><tr><th>Person</th><th class="n">Entries</th><th class="n">Before</th><th class="n">Days with entries</th><th class="n">Leave days</th></tr></thead><tbody>${people}</tbody></table>`;
  }

  window.DaylensRange = { mount, html };
})();
