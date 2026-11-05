// "Ask Daylens" — the assistant drawer in the main window (app.html).
// It finds things in the team's records (only what this person can see),
// explains how to do things with a button to the right screen, and
// prepares entries (e.g. a leave request) that are saved ONLY when the
// person presses Confirm here — through the same save as the form.
(function () {
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const rich = (t) => (window.DaylensRichText ? window.DaylensRichText.render(t) : esc(t).replace(/\n/g, '<br>'));

  // Where things are — the assistant's "how do I…?" knowledge, in the
  // app's own words. Admin-only items are only given to admins.
  const MAP_ALL = [
    'Log something (daily status, tickets, meeting notes…): Home → its category tile → the tab → "Add new entry" → fill it in → Submit.',
    'Apply for leave: Home → the category with Leave → Leave → "Add new entry" (your name is filled in) → Date, Type, Reason → Submit. The assistant can also fill it in for you; you confirm before it is saved.',
    'Change or remove one of your entries: open its tab → click the entry → change it → Save (or 🗑 to remove it).',
    'Reminders: the Reminders button by Ask (bottom right) → "New reminder" (ticket, mail or request, for you or teammates). When one falls due Daylens comes to the front, pulses red and rings until Snooze (5/15/60 min), Stop or Done; due ones also show under the bell (Today).',
    'Refresh: the round ⟳ button by Ask (bottom right) — fresh data from the Sheet for the screen you are on (a half-filled form keeps what is typed).',
    'Leave on a day someone else is off: before it is saved a pop-up says who — "Change my plan" or "Submit anyway" (a holiday that day is pointed out too).',
    'Waiting for a date someone asked for: set the entry\'s Status to "Waiting for Requested Date" and a reminder for that day opens, filled in from the entry (admins add that option in one click: Tabs & fields → Dropdown & Multiselect Options → the Status list).',
    'Themes: Settings → Theme — 15 themes, 7 light (Light is the standard) and 8 dark.',
    'Reports: menu → Reports → pick the report and the period → View report, Email report or Download (Excel).',
    'AI digest (a written summary of a period): menu → AI digest.',
    'Team dashboard: Home, on the right: who added entries on which day this week (an entry dated this week; signing in does not count), totals, ‹ › for earlier weeks, PDF/Picture download, 🎉 kudos.',
    'Theme: Settings → Theme. Change your password: Settings → Change my password. Sound on/off: Settings → Sound.',
    'Updates: Settings → About Daylens → Check for updates.',
    'Several teams: the team card at the top of the menu → switch team, or Join another team with an invite code.',
    'Something not working: "Contact Admin" at the bottom of every screen.',
  ];
  const MAP_ADMIN = [
    'Add a category to Home: menu → Tabs & fields → Landing-Screen Categories → "+ Add category" → name it, tick its tabs → Save Categories. Its icon: the icon button next to its name.',
    'Add a tab: Tabs & fields → Tabs → choose a template (Daily status, Leave, Ticket tracker, Weekly meeting, Custom). Rename, hide ("Show in app") or delete it there too.',
    'Dropdown choices: Tabs & fields → Dropdown & Multiselect Options. Field types (date, dropdown, week…): Tabs & fields → Field Types.',
    'People: menu → People → Add user (gives a ready-to-send invite), Reset password, Rename, Email, role Admin/User, Deactivate/Delete.',
    'Scheduled report emails (with a reminder message): Reports → Scheduled reports. Friday check-in: Reports → Friday check-in.',
    'Clean-up & backups (older rows emailed to admins monthly, then removed): Tabs & fields → Clean-up & backups.',
    'Activity log (who did what): menu → Activity log. Gemini key, Teams channel, admin contact emails: Tabs & fields → App Settings.',
    'Update the team\'s Sheet: Settings → About Daylens → Your team\'s Sheet → Update.',
  ];

  function navList(isAdmin, tabs) {
    const nav = [
      { id: 'home', label: 'Home' }, { id: 'reminders', label: 'Reminders' }, { id: 'new-reminder', label: 'New reminder' },
      { id: 'report', label: 'Reports' }, { id: 'digest', label: 'AI digest' }, { id: 'settings', label: 'Settings' },
      { id: 'theme', label: 'Theme' }, { id: 'change-password', label: 'Change my password' }, { id: 'about', label: 'About Daylens' },
      { id: 'features', label: 'Features' }, { id: 'today', label: 'Today (the bell)' },
    ];
    (tabs || []).forEach((t) => { nav.push({ id: 'tab:' + t, label: t }); nav.push({ id: 'new:' + t, label: 'New ' + t + ' entry' }); });
    // The admin screens: everyone may open them; for a regular user
    // they're view only (and say so on the button).
    const vo = isAdmin ? '' : ' (view only)';
    [{ id: 'users', label: 'People' }, { id: 'directory', label: 'Team directory' }, { id: 'manage', label: 'Tabs & fields' }, { id: 'logs', label: 'Activity log' },
      { id: 'manage:tabs-section', label: 'Tabs' }, { id: 'manage:categories-section', label: 'Landing-Screen Categories' },
      { id: 'manage:options-section', label: 'Dropdown & Multiselect Options' }, { id: 'manage:field-types-section', label: 'Field Types' },
      { id: 'manage:app-settings-section', label: 'App Settings' }, { id: 'manage:cleanup-section', label: 'Clean-up & backups' },
      { id: 'manage:report-configs-section', label: 'Scheduled reports' }, { id: 'manage:weekly-check-section', label: 'Friday check-in' },
    ].forEach((n) => nav.push({ id: n.id, label: n.label + vo }));
    nav.push({ id: 'documents', label: 'Document Centre' });
    // Each document this person may open (the Document Centre) — the
    // script tells Gemini their names and purposes; the links stay here.
    // Documents ("doc:<id>") are added by the team's script, from what this person may see.
    return nav;
  }

  function helpText(isAdmin) {
    const g = window.APP_GUIDE;
    const faq = g && Array.isArray(g.troubleshooting) ? g.troubleshooting.map((t) => `Q: ${t.q}\nA: ${t.a}`).join('\n') : '';
    // The Features list (features.js) is the one source; the short map
    // below is only a fallback if it didn't load.
    const FX = window.DAYLENS_FEATURES;
    if (FX) {
      return ['WHERE THINGS ARE (Daylens features — the Features screen in the menu lists them all, with search):', ...FX.helpLines(isAdmin),
        ...(isAdmin ? [] : ['(This person is not an admin. They can LOOK at the Admin screens — view only; keys, links and email addresses are hidden from them. Only an admin can change any of it: for a change, tell them to ask their admin, and you may show the screen so they can see how it is set up now.)']),
        '', 'FAQ:', faq].join('\n');
    }
    return ['WHERE THINGS ARE:', ...MAP_ALL, ...(isAdmin ? MAP_ADMIN : [
      '(This person is not an admin. They can LOOK at People, Tabs & fields, Scheduled reports, the Friday check-in, Clean-up & backups and the Activity log — view only; keys, links and email addresses are hidden from them. Only an admin can change any of it: for a change, tell them to ask their admin, and you may show the screen so they can see how it is set up now.)',
    ]), '', 'FAQ:', faq].join('\n');
  }

  function init(opts) {
    const btn = document.getElementById('ask-btn');
    if (!btn) return { reset() {}, open() {} };
    let panel = null;
    let messages = [];
    let busy = false;

    function close() {
      if (!panel) return;
      panel.remove();
      panel = null;
      btn.setAttribute('aria-expanded', 'false');
      btn.focus();
    }
    function open() {
      if (panel) { close(); return; }
      panel = document.createElement('aside');
      panel.className = 'ask-panel';
      panel.id = 'ask-panel';
      panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-label', 'Ask Daylens');
      panel.innerHTML = `
        <div class="ask-head"><b>🔍 Ask Daylens</b><span class="ask-sub">about your team's records, or how to do something</span>
          <button type="button" class="ask-x" id="ask-new" title="Start over">New chat</button><button type="button" class="ask-x" id="ask-close" aria-label="Close">✕</button></div>
        <div class="ask-log" id="ask-log" aria-live="polite"></div>
        <div class="ask-suggest" id="ask-suggest"></div>
        <form class="ask-form" id="ask-form">
          <textarea id="ask-input" rows="2" maxlength="1500" placeholder="e.g. What did I log last week? · Apply leave for me on Friday · How do I add a category?" aria-label="Your question"></textarea>
          <button type="submit" id="ask-send">Ask</button>
        </form>
        <div class="ask-foot">Uses only what you can see in Daylens. Answers come from Google Gemini with your team's key — check important ones. Nothing is saved unless you press Confirm.</div>`;
      document.body.appendChild(panel);
      btn.setAttribute('aria-expanded', 'true');
      panel.querySelector('#ask-close').onclick = close;
      panel.querySelector('#ask-new').onclick = () => { messages = []; draw(); };
      panel.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
      const input = panel.querySelector('#ask-input');
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } });
      panel.querySelector('#ask-form').onsubmit = (e) => { e.preventDefault(); send(); };
      draw();
      input.focus();
    }
    btn.onclick = open;
    // Signed out, or someone else signed in: the conversation goes with them.
    return {
      reset() { messages = []; busy = false; if (panel) { panel.remove(); panel = null; btn.setAttribute('aria-expanded', 'false'); } },
      open() { if (!panel && !btn.hidden) open(); },
    };

    function draw() {
      if (!panel) return;
      const log = panel.querySelector('#ask-log');
      log.innerHTML = '';
      if (!messages.length) {
        log.innerHTML = '<div class="ask-msg bot"><div class="ask-bubble">Hi! I can find things in your team\'s records, explain how to do something in Daylens, or fill in an entry for you to confirm.</div></div>';
      }
      messages.forEach((m, i) => {
        const row = document.createElement('div');
        row.className = 'ask-msg ' + (m.role === 'user' ? 'me' : 'bot');
        const b = document.createElement('div');
        b.className = 'ask-bubble' + (m.error ? ' err' : '');
        b.innerHTML = m.role === 'user' ? esc(m.text).replace(/\n/g, '<br>') : rich(m.text);
        row.appendChild(b);
        (m.actions || []).forEach((a) => {
          const go = document.createElement('button');
          go.type = 'button';
          go.className = 'ask-go';
          go.textContent = '→ ' + a.label;
          go.onclick = () => opts.navigate(a.target);
          row.appendChild(go);
        });
        if (m.draft) row.appendChild(draftCard(m.draft, i));
        log.appendChild(row);
      });
      if (busy) log.insertAdjacentHTML('beforeend', '<div class="ask-msg bot"><div class="ask-bubble ask-typing">Thinking…</div></div>');
      log.scrollTop = log.scrollHeight;
      const sug = panel.querySelector('#ask-suggest');
      sug.innerHTML = '';
      if (!messages.length) {
        ['What did I log last week?', 'Apply leave for me on Friday', opts.isAdmin() ? 'How do I add a category to Home?' : 'How do I set a reminder?'].forEach((q) => {
          const c = document.createElement('button');
          c.type = 'button';
          c.className = 'ask-chip';
          c.textContent = q;
          c.onclick = () => { panel.querySelector('#ask-input').value = q; send(); };
          sug.appendChild(c);
        });
      }
    }

    // The entry the assistant prepared: every field, editable; Confirm
    // saves it through the normal save (same checks as the form).
    function draftCard(d, idx) {
      const card = document.createElement('div');
      card.className = 'ask-draft';
      card.dataset.tab = d.tab;
      card.innerHTML = `<div class="ad-title">Ready to add to <b>${esc(d.tab)}</b> — check it, then confirm</div><div class="ad-fields"></div>
        <div class="ad-missing" hidden></div>
        <div class="ad-actions"><button type="button" class="ad-cancel">Not now</button><button type="button" class="ad-ok">Confirm and save</button></div>
        <div class="ad-msg" role="status"></div>`;
      const host = card.querySelector('.ad-fields');
      const inputs = {};
      (d.fields || []).forEach((f) => {
        if (f.type === 'sequence' || f.type === 'week-auto' || f.type === 'attachment') return;
        const row = document.createElement('label');
        row.className = 'ad-field';
        row.innerHTML = `<span>${esc(f.name)}${(d.missing || []).includes(f.name) ? ' <em>needed</em>' : ''}</span>`;
        let input;
        if (f.type === 'select' && (f.options || []).length) {
          input = document.createElement('select');
          input.appendChild(new Option('— choose —', ''));
          f.options.forEach((o) => input.appendChild(new Option(o, o)));
        } else if (f.type === 'date' || /(^|\s)date$/i.test(f.name)) {
          input = document.createElement('input');
          input.type = 'date';
        } else {
          input = document.createElement('input');
          input.type = 'text';
        }
        input.value = d.values[f.name] || '';
        if (f.name.toLowerCase() === 'name') input.readOnly = true;
        input.className = 'ad-input';
        input.dataset.field = f.name;
        row.appendChild(input);
        host.appendChild(row);
        inputs[f.name] = input;
      });
      const okBtn = card.querySelector('.ad-ok');
      const miss = card.querySelector('.ad-missing');
      const check = () => {
        Object.keys(inputs).forEach((k) => { d.values[k] = inputs[k].value; }); // kept if the chat redraws
        const left = (d.missing || []).filter((m) => inputs[m] && !String(inputs[m].value || '').trim());
        miss.hidden = !left.length;
        miss.textContent = left.length ? 'Still needed: ' + left.join(', ') + ' — fill it in above or tell me in the chat.' : '';
        okBtn.disabled = !!left.length || d.saved;
      };
      Object.values(inputs).forEach((i) => i.addEventListener('input', check));
      Object.values(inputs).forEach((i) => i.addEventListener('change', check));
      check();
      if (d.saved) { okBtn.textContent = 'Saved ✓'; card.querySelector('.ad-cancel').hidden = true; card.classList.add('done'); }
      if (d.dismissed) card.classList.add('dismissed');
      card.querySelector('.ad-cancel').onclick = () => { d.dismissed = true; card.classList.add('dismissed'); };
      okBtn.onclick = async () => {
        const values = {};
        Object.keys(inputs).forEach((k) => { const v = String(inputs[k].value || '').trim(); if (v) values[k] = v; });
        okBtn.disabled = true; okBtn.textContent = 'Saving…';
        const msg = card.querySelector('.ad-msg');
        let r;
        try { r = await window.statusApp.submitEntry(d.tab, values); } catch (e) { r = { ok: false, error: e.message }; }
        if (r && r.ok !== false) {
          d.saved = true; d.values = values;
          okBtn.textContent = 'Saved ✓';
          card.querySelector('.ad-cancel').hidden = true;
          card.classList.add('done');
          msg.textContent = `Saved to ${d.tab}.`;
          messages.push({ role: 'assistant', text: `Done — it's saved to **${d.tab}**.`, actions: [{ type: 'open', target: 'tab:' + d.tab, label: 'Open ' + d.tab }] });
          setTimeout(draw, 400);
        } else {
          okBtn.disabled = false; okBtn.textContent = 'Confirm and save';
          msg.textContent = (r && r.error) || 'Couldn\'t save it — nothing was saved.';
          msg.classList.add('err');
        }
      };
      return card;
    }

    async function send() {
      if (!panel || busy) return;
      const input = panel.querySelector('#ask-input');
      const text = input.value.trim();
      if (!text) return;
      input.value = '';
      messages.push({ role: 'user', text });
      busy = true;
      draw();
      const isAdmin = opts.isAdmin();
      let tabs = [];
      try { tabs = ((await window.statusApp.getTabs()) || {}).tabs || []; } catch { tabs = []; }
      const history = messages.filter((m) => !m.error).map((m) => ({ role: m.role, text: m.text })).slice(-10);
      let r;
      try {
        r = await window.statusApp.askAssistant({ messages: history, help: helpText(isAdmin), nav: navList(isAdmin, tabs) });
      } catch (e) {
        r = { ok: false, error: e.message };
      }
      busy = false;
      if (!r || !r.ok) {
        messages.push({ role: 'assistant', error: true, text: (r && r.error) || 'Something went wrong — try again.', actions: r && r.noKey && isAdmin ? [{ type: 'open', target: 'manage:app-settings-section', label: 'Open App Settings' }] : [] });
      } else {
        // A newer draft replaces any earlier one that wasn't saved.
        if (r.draft) messages.forEach((m) => { if (m.draft && !m.draft.saved) m.draft.dismissed = true; });
        messages.push({ role: 'assistant', text: r.reply || 'Done.', actions: r.actions || [], draft: r.draft || null });
      }
      draw();
      if (panel) panel.querySelector('#ask-input').focus();
    }
  }

  window.DaylensAssistant = { init, navList, helpText };
})();
