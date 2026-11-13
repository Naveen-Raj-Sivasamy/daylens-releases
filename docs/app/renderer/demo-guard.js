// Demo accounts (1.7, locked tighter in 1.10.4): look around, change and take nothing.
// Loaded by every Daylens screen. While a Demo account is signed in, text
// can't be selected, copied or dragged out, there's no right-click menu,
// printing and its shortcuts do nothing, no box, menu, tick or date can be
// typed in or changed (only the search and filter boxes work, since they
// change nothing), and the buttons for downloads,
// exports, the Sheet, Ask, People and the activity log are hidden. (The
// team's Sheet refuses every change from a Demo account anyway, and the
// app refuses its downloads — this is the part you can see.)
(function () {
  const api = window.statusApp;
  if (!api || window.__demoGuard) return;
  window.__demoGuard = true;
  let on = false;
  const root = document.documentElement;
  const set = (v) => { on = !!v; root.classList.toggle('dl-demo', on); if (on) seal(document); };

  const style = document.createElement('style');
  style.textContent = [
    'html.dl-demo, html.dl-demo * { -webkit-user-select: none !important; user-select: none !important; -webkit-touch-callout: none !important; }',
    // Only the search and filter boxes take typing (they change nothing).
    'html.dl-demo input[type="search"], html.dl-demo [data-demo-ok], html.dl-demo #srch-input, html.dl-demo #log-search-input { -webkit-user-select: text !important; user-select: text !important; }',
    'html.dl-demo input:not([type="search"]):not([data-demo-ok]):not(#srch-input):not(#log-search-input), html.dl-demo textarea:not([data-demo-ok]), html.dl-demo select:not([data-demo-ok]), html.dl-demo [contenteditable] { caret-color: transparent; cursor: default; }',
    // What a Demo account doesn't get (the Sheet and the app refuse them too).
    'html.dl-demo .nav-item[data-section="users"], html.dl-demo .nav-item[data-section="logs"], html.dl-demo .nav-item[data-section="digest"],',
    'html.dl-demo #open-sheet-item, html.dl-demo #open-web-item, html.dl-demo #ask-btn, html.dl-demo #dash-pdf, html.dl-demo #dash-png, html.dl-demo .dash-dl,',
    'html.dl-demo #ppt-report-btn, html.dl-demo #ppt-open, html.dl-demo #download-report-btn, html.dl-demo #users-btn, html.dl-demo #team-btn,',
    'html.dl-demo #change-pass-btn, html.dl-demo #tp-setup, html.dl-demo .doc-more, html.dl-demo #ai-digest-tile { display: none !important; }',
    'html.dl-demo #submit-btn, html.dl-demo #kc-admin-contact-bar, html.dl-demo #kc-admin-contact-panel { display: none !important; }',
    '.demo-note { display: none; } html.dl-demo .demo-note { display: inline-flex; align-items: center; font-size: 13px; font-weight: 600; opacity: 0.85; }',
    '@media print { html.dl-demo body { display: none !important; } }',
  ].join('\n');
  (document.head || root).appendChild(style);

  const stop = (e) => { if (!on) return; e.preventDefault(); e.stopPropagation(); };
  // A box a Demo account must not change: everything except the search and filter boxes.
  const fieldOf = (t) => {
    const el = t && t.nodeType === 1 ? t : t && t.parentElement;
    return el && el.closest ? el.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])') : null;
  };
  const isLocked = (f) => {
    if (!f) return false;
    if (f.matches('[data-demo-ok], input[type="search"], #srch-input, #log-search-input') || f.closest('[data-demo-ok]')) return false;
    return true;
  };
  const lockedTarget = (e) => { const f = fieldOf(e.target); return on && isLocked(f) ? f : null; };
  const seal = (root2) => {
    if (!on) return;
    root2.querySelectorAll && root2.querySelectorAll('input, textarea, select').forEach((f) => {
      if (!isLocked(f)) return;
      if (f.tagName === 'SELECT' || /^(checkbox|radio|range|color|file|date|time|datetime-local|month|week)$/i.test(f.type || '')) { f.setAttribute('tabindex', '-1'); f.style.pointerEvents = 'none'; }
      else { f.readOnly = true; f.setAttribute('aria-readonly', 'true'); }
    });
  };
  ['beforeinput', 'input', 'paste', 'cut', 'drop', 'change'].forEach((ev) => document.addEventListener(ev, (e) => { if (lockedTarget(e)) { e.preventDefault(); e.stopPropagation(); } }, true));
  ['mousedown', 'click', 'dblclick'].forEach((ev) => document.addEventListener(ev, (e) => {
    const f = lockedTarget(e);
    if (f && (f.tagName === 'SELECT' || /^(checkbox|radio|range|color|file|date|time|datetime-local|month|week)$/i.test(f.type || ''))) { e.preventDefault(); e.stopPropagation(); }
  }, true));
  document.addEventListener('keydown', (e) => {
    const f = lockedTarget(e);
    if (!f) return;
    // Moving around is fine; anything that would type, delete, pick or open a menu is not.
    if (['Tab', 'Shift', 'Escape', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Control', 'Alt', 'Meta'].includes(e.key)) return;
    e.preventDefault(); e.stopPropagation();
  }, true);
  let sealQueued = false;
  try { new MutationObserver(() => { if (!on || sealQueued) return; sealQueued = true; requestAnimationFrame(() => { sealQueued = false; seal(document); }); }).observe(document.documentElement, { childList: true, subtree: true }); } catch { /* old browser */ }
  ['copy', 'cut', 'contextmenu', 'dragstart'].forEach((ev) => document.addEventListener(ev, stop, true));
  document.addEventListener('selectstart', (e) => {
    if (!on) return;
    const t = e.target && e.target.nodeType === 1 ? e.target : e.target && e.target.parentElement;
    if (t && t.closest && t.closest('input[type="search"], [data-demo-ok], #srch-input, #log-search-input')) return; // the search and filter boxes still work
    e.preventDefault();
  }, true);
  document.addEventListener('keydown', (e) => {
    if (!on || !(e.ctrlKey || e.metaKey)) return;
    const k = String(e.key || '').toLowerCase();
    if (['c', 'x', 'a', 'p', 's'].includes(k)) { e.preventDefault(); e.stopPropagation(); }
  }, true);
  const realPrint = window.print ? window.print.bind(window) : null;
  window.print = () => { if (!on && realPrint) realPrint(); };

  const check = () => api.getSessionStatus().then((s) => set(!!(s && s.loggedIn && String(s.role || '').toLowerCase() === 'demo'))).catch(() => {});
  check();
  if (api.onDemoMode) api.onDemoMode(set);
  window.addEventListener('focus', check);
})();
