// Search everything (1.5): the box in the top strip of the window. Finds a
// ticket ID, a mail subject or a name across every tab the team can see,
// and opens the row. The team's script keeps each tab's text in its cache,
// so a search doesn't wait on the Sheet; focusing the box warms it up.
(function () {
  const S = {};
  let wrap, input, panel, kbd;
  let seq = 0, timer = null, active = -1, items = [], warmedAt = 0, enabled = false, opts = {};
  // The Document Centre's list (1.5.1): matched here, by name, category and
  // what each document is for — the app keeps it a minute.
  let docs = [];
  const loadDocs = () => (window.statusApp.getDocuments ? window.statusApp.getDocuments().then((d) => { docs = d && d.ok ? (d.docs || []).concat((d.team || []).map((t) => Object.assign({ category: 'Team Sheet' }, t))) : []; return docs; }).catch(() => docs) : Promise.resolve(docs));
  function docHits(q) {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    return docs.filter((d) => { const t = [d.title, d.category, d.purpose].join(' ').toLowerCase(); return words.every((w) => t.includes(w)); }).slice(0, 5);
  }

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function mark(text, terms) {
    let out = esc(text);
    terms.forEach((t) => {
      if (!t) return;
      const re = new RegExp(esc(t).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      out = out.replace(re, (m) => `<mark>${m}</mark>`);
    });
    return out;
  }

  S.init = function (o) {
    opts = o || {};
    const strip = document.querySelector('.titlestrip');
    wrap = document.createElement('div');
    wrap.className = 'srch';
    wrap.id = 'srch';
    wrap.setAttribute('role', 'search');
    wrap.hidden = true;
    const mac = /Mac/i.test(navigator.platform || '');
    wrap.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/></svg>
      <input id="srch-input" type="text" spellcheck="false" autocomplete="off" placeholder="Search tickets, names, documents…" aria-label="Search everything" aria-controls="srch-panel" aria-expanded="false" aria-autocomplete="list" />
      <kbd>${mac ? '⌘K' : 'Ctrl K'}</kbd>`;
    strip.insertBefore(wrap, document.getElementById('bell'));
    input = wrap.querySelector('input');
    kbd = wrap.querySelector('kbd');
    panel = document.createElement('div');
    panel.className = 'srch-panel';
    panel.id = 'srch-panel';
    panel.setAttribute('role', 'listbox');
    panel.hidden = true;
    document.body.appendChild(panel);

    input.addEventListener('focus', () => {
      kbd.hidden = true;
      if (Date.now() - warmedAt > 5 * 60 * 1000) { warmedAt = Date.now(); window.statusApp.warmSearch().catch(() => {}); }
      loadDocs();
      if (input.value.trim().length >= 2 && items.length) show();
    });
    input.addEventListener('blur', () => { kbd.hidden = !!input.value; setTimeout(() => { if (!panel.contains(document.activeElement)) hide(); }, 150); });
    input.addEventListener('input', () => {
      clearTimeout(timer);
      const q = input.value.trim();
      if (q.length < 2) { seq++; hide(); items = []; return; }
      timer = setTimeout(() => run(q), 220);
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        if (!items.length) return;
        e.preventDefault();
        setActive(active + (e.key === 'ArrowDown' ? 1 : -1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (items.length) open(items[Math.max(active, 0)]);
        else if (input.value.trim().length >= 2) { clearTimeout(timer); run(input.value.trim()); }
      } else if (e.key === 'Escape') {
        if (!panel.hidden) { hide(); } else { input.value = ''; input.blur(); }
      }
    });
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && !e.altKey && String(e.key).toLowerCase() === 'k') { e.preventDefault(); S.focus(); }
    });
    document.addEventListener('mousedown', (e) => {
      if (panel.hidden || panel.contains(e.target) || wrap.contains(e.target)) return;
      hide();
    });
  };

  S.setEnabled = function (v) {
    enabled = !!v;
    if (!wrap) return;
    wrap.hidden = !enabled;
    if (!enabled) { input.value = ''; items = []; hide(); }
  };
  S.focus = function () { if (enabled && input) { input.focus(); input.select(); } };
  S.reset = function () { warmedAt = 0; if (input) input.value = ''; items = []; hide(); };

  function show() { panel.hidden = false; input.setAttribute('aria-expanded', 'true'); }
  function hide() { panel.hidden = true; input.setAttribute('aria-expanded', 'false'); active = -1; }

  async function run(q) {
    const my = ++seq;
    const slow = setTimeout(() => { if (my === seq) { panel.innerHTML = '<div class="srch-note">Searching…</div>'; show(); } }, 300);
    const [res] = await Promise.all([window.statusApp.searchAll(q).catch((err) => ({ ok: false, error: err.message })), loadDocs()]);
    clearTimeout(slow);
    if (my !== seq) return; // a newer search is on its way
    render(q, res, docHits(q));
  }

  function render(q, res, dHits) {
    items = [];
    active = -1;
    dHits = dHits || [];
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    let docHtml = '';
    if (dHits.length) {
      docHtml = '<div class="srch-group" role="presentation">Documents</div>' + dHits.map((d) => {
        const i = items.length;
        items.push({ doc: d });
        return `<button type="button" class="srch-item" role="option" id="srch-i${i}" data-i="${i}"><span class="si-top"><b>${mark(d.title, terms)}</b><span class="si-exact">${esc(d.category || '')}</span></span>${d.purpose ? `<span class="si-hit">${mark(d.purpose, terms)}</span>` : ''}</button>`;
      }).join('');
    }
    if ((!res || !res.ok) && dHits.length) res = { ok: true, results: [], total: 0, cut: [] }; // documents still found on an older Sheet
    if (!res || !res.ok) {
      const err = String((res && res.error) || '');
      panel.innerHTML = `<div class="srch-note">${/update/i.test(err) ? 'Search needs the latest update of your team\'s Sheet. An admin can install it in Settings → About Daylens → Update.' : esc(err || 'Search isn\'t answering right now — try again in a moment.')}</div>`;
      show();
      return;
    }
    const results = res.results || [];
    if (!results.length && dHits.length) {
      panel.innerHTML = docHtml + `<div class="srch-foot">${dHits.length} document${dHits.length === 1 ? '' : 's'}</div>`;
      wireItems();
      show();
      return;
    }
    if (!results.length) {
      panel.innerHTML = `<div class="srch-note">Nothing matches “${esc(q)}”. Try a ticket ID, a name or a word from the subject.</div>`;
      show();
      return;
    }
    const byTab = [];
    results.forEach((r) => {
      let g = byTab.find((x) => x.tab === r.tab);
      if (!g) { g = { tab: r.tab, list: [] }; byTab.push(g); }
      g.list.push(r);
    });
    let html = docHtml;
    byTab.forEach((g) => {
      html += `<div class="srch-group" role="presentation">${esc(g.tab)}</div>`;
      g.list.forEach((r) => {
        const i = items.length;
        items.push(r);
        const meta = (r.fields || []).map(([k, v]) => `<span><em>${esc(k)}</em> ${mark(v, terms)}</span>`).join('');
        html += `<button type="button" class="srch-item" role="option" id="srch-i${i}" data-i="${i}">
          <span class="si-top">${r.text && r.title ? `<span class="si-id" title="${esc(r.titleCol)}">${mark(r.title, terms)}</span><b>${mark(r.text, terms)}</b>` : `<b>${mark(r.title || r.text || '(no details)', terms)}</b>`}${r.exact ? '<span class="si-exact">exact match</span>' : ''}</span>
          ${r.hit ? `<span class="si-hit"><em>${esc(r.hit[0])}</em> ${mark(r.hit[1], terms)}</span>` : ''}
          ${meta ? `<span class="si-meta">${meta}</span>` : ''}
        </button>`;
      });
    });
    const more = res.total > results.length ? `Showing ${results.length} of ${res.total} matches — add a word to narrow it down.` : `${res.total} match${res.total === 1 ? '' : 'es'}`;
    const cut = (res.cut || []).length ? ` Older rows of ${res.cut.map(esc).join(', ')} aren't searched (only the newest 5,000).` : '';
    html += `<div class="srch-foot">${esc(more)}${dHits.length ? ` · ${dHits.length} document${dHits.length === 1 ? '' : 's'}` : ''}${cut}</div>`;
    panel.innerHTML = html;
    wireItems();
    show();
  }
  function wireItems() {
    panel.querySelectorAll('.srch-item').forEach((b) => {
      b.addEventListener('mousedown', (e) => e.preventDefault()); // keep the box focused
      b.addEventListener('click', () => open(items[Number(b.dataset.i)]));
      b.addEventListener('mousemove', () => setActive(Number(b.dataset.i), true));
    });
  }

  function setActive(i, fromMouse) {
    if (!items.length) return;
    active = (i + items.length) % items.length;
    panel.querySelectorAll('.srch-item').forEach((b) => b.classList.toggle('on', Number(b.dataset.i) === active));
    const el = document.getElementById('srch-i' + active);
    if (el) {
      input.setAttribute('aria-activedescendant', el.id);
      if (!fromMouse) el.scrollIntoView({ block: 'nearest' });
    }
  }

  function open(r) {
    if (!r) return;
    hide();
    input.blur();
    if (r.doc) { window.statusApp.openDocument(r.doc.id); return; } // a document opens in the browser
    if (opts.onOpen) opts.onOpen(r);
  }

  window.DaylensSearch = S;
})();
