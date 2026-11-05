// Daylens in a browser — small touches each screen gets on the website:
// the ☰ menu on phones, "Keep me signed in", and desktop-only settings
// left out. The screens themselves are the desktop app's, unchanged.
(function () {
  const api = window.statusApp;
  if (!api || !api.isWeb) return;
  const $ = (s, r) => (r || document).querySelector(s);

  // ---------- the app's frame (app.html): ☰ menu for narrow screens ----------
  function setUpShell() {
    const nav = $('#nav'), strip = $('.titlestrip');
    if (!nav || !strip || $('#web-menu')) return;
    document.documentElement.classList.add('dl-shell');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'web-menu';
    btn.className = 'web-menu';
    btn.setAttribute('aria-label', 'Menu');
    btn.setAttribute('aria-controls', 'nav');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
    strip.insertBefore(btn, strip.firstChild);
    const scrim = document.createElement('div');
    scrim.className = 'web-scrim';
    document.body.appendChild(scrim);
    const set = (open) => {
      document.body.classList.toggle('web-nav-open', open);
      btn.setAttribute('aria-expanded', String(open));
      if (open) { const first = nav.querySelector('button:not([disabled]), a'); if (first) first.focus(); }
    };
    btn.onclick = () => set(!document.body.classList.contains('web-nav-open'));
    scrim.onclick = () => set(false);
    nav.addEventListener('click', (e) => {
      // Picking a section closes the menu (the team card opens its own list).
      if (e.target.closest('.nav-item, [data-section]') && !e.target.closest('.team-card')) set(false);
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && document.body.classList.contains('web-nav-open')) { set(false); btn.focus(); } });
    window.addEventListener('message', (e) => { if (e.data && e.data.__webCloseNav) set(false); });
    const dock = $('#fab-dock'); // Refresh / Reminders / Ask (1.8): the menu folds away too
    if (dock) dock.addEventListener('click', () => set(false));
  }

  // ---------- "Keep me signed in" on the join and sign-in forms ----------
  let keep = null;
  api.webInfo().then((i) => { keep = !!(i && i.keepSignedIn); document.querySelectorAll('.web-keep input').forEach((c) => { c.checked = keep; }); }).catch(() => {});
  function addKeep(beforeEl, id) {
    if (!beforeEl || document.getElementById(id)) return;
    const label = document.createElement('label');
    label.className = 'web-keep';
    label.innerHTML = `<input type="checkbox" id="${id}" ${keep === false ? '' : 'checked'} /> <span>Keep me signed in on this device</span>`;
    const hint = document.createElement('div');
    hint.className = 'web-keep-hint';
    hint.textContent = 'Untick on a shared or public computer: you\'re signed out when you close the tab.';
    beforeEl.parentNode.insertBefore(label, beforeEl);
    beforeEl.parentNode.insertBefore(hint, beforeEl);
    label.querySelector('input').addEventListener('change', (e) => { keep = e.target.checked; api.webSetKeepSignedIn(keep); });
    // Saved as you sign in, so the sign-in lands in the right place.
    beforeEl.addEventListener('click', () => api.webSetKeepSignedIn(label.querySelector('input').checked), true);
  }

  // ---------- desktop-only settings ----------
  function tidyScreens() {
    const sww = $('#start-with-windows-btn');
    if (sww) sww.remove();
    const check = $('#ab-check');
    if (check) check.remove();
    const note = $('#ab-app-note');
    if (note && !note.dataset.web) { note.dataset.web = '1'; note.textContent = 'This is Daylens on the web: it\'s always the newest version. Reload the page to get a change your admin just made.'; }
    addKeep($('#login-submit-btn'), 'web-keep-login');
    addKeep($('#join-btn'), 'web-keep-join');
  }

  let queued = false;
  const run = () => { queued = false; setUpShell(); tidyScreens(); };
  const start = () => {
    run();
    new MutationObserver(() => { if (!queued) { queued = true; requestAnimationFrame(run); } }).observe(document.body, { childList: true, subtree: true });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
