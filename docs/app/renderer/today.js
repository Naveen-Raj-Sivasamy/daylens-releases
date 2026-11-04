// "Today" — what needs your attention: your due reminders, who's on leave,
// a holiday, the team's message. ONE renderer for both places it shows:
// the bell panel (app.html, every screen) and the strip at the top of Home
// (index.html). Items stay until you dismiss them (✕); a reminder can also
// be marked Done or snoozed for an hour, right here. The list itself comes
// from the main process (get-today), so both places always agree.
(function () {
  const ICON = { reminder: '⏰', leave: '🌴', holiday: '🎉', message: '📣' };
  const ORDER = { reminder: 0, leave: 1, holiday: 2, message: 3 };
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function sorted(items) {
    return (items || []).slice().sort((a, b) => (ORDER[a.kind] ?? 9) - (ORDER[b.kind] ?? 9));
  }

  // opts: { limit, onMore(count) } — limit shows the first N (Home strip)
  function render(host, items, opts) {
    opts = opts || {};
    const list = sorted(items);
    const shown = opts.limit ? list.slice(0, opts.limit) : list;
    host.innerHTML = '';
    shown.forEach((it) => {
      const row = document.createElement('div');
      row.className = 'today-item kind-' + it.kind;
      row.dataset.key = it.key;
      row.innerHTML = `
        <span class="today-ic" aria-hidden="true">${ICON[it.kind] || '•'}</span>
        <span class="today-text"><span class="today-title">${esc(it.title)}</span>${it.detail ? `<span class="today-detail">${esc(it.detail)}</span>` : ''}
          ${it.kind === 'reminder' ? '<span class="today-actions"><button type="button" class="today-btn go" data-a="done">Done</button><button type="button" class="today-btn" data-a="snooze">Snooze 1 hour</button></span>' : ''}
        </span>
        <button type="button" class="today-x" data-a="dismiss" title="Dismiss — I've seen it" aria-label="Dismiss ${esc(it.title)}">✕</button>`;
      row.querySelectorAll('[data-a]').forEach((b) => {
        b.onclick = async () => {
          b.disabled = true;
          const a = b.dataset.a;
          if (a === 'done') await window.statusApp.setReminderDone(it.id, true).catch(() => {});
          else if (a === 'snooze') await window.statusApp.snoozeReminder(it.id, new Date(Date.now() + 60 * 60 * 1000).toISOString()).catch(() => {});
          else await window.statusApp.dismissToday(it.key).catch(() => {});
          // the main process sends today-changed; both places re-render
        };
      });
      host.appendChild(row);
    });
    if (opts.limit && list.length > shown.length && opts.onMore) {
      const more = document.createElement('button');
      more.type = 'button';
      more.className = 'today-more';
      more.textContent = `Show all ${list.length}`;
      more.onclick = () => opts.onMore(list.length);
      host.appendChild(more);
    }
    return list.length;
  }

  window.TodayList = { render, sorted };
})();
