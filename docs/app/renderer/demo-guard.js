// Demo accounts (1.7): look around, take nothing away.
// Loaded by every Daylens screen. While a Demo account is signed in, text
// can't be selected, copied or dragged out, there's no right-click menu,
// printing and its shortcuts do nothing, and the buttons for downloads,
// exports, the Sheet, Ask, People and the activity log are hidden. (The
// team's Sheet refuses every change from a Demo account anyway, and the
// app refuses its downloads — this is the part you can see.)
(function () {
  const api = window.statusApp;
  if (!api || window.__demoGuard) return;
  window.__demoGuard = true;
  let on = false;
  const root = document.documentElement;
  const set = (v) => { on = !!v; root.classList.toggle('dl-demo', on); };

  const style = document.createElement('style');
  style.textContent = [
    'html.dl-demo, html.dl-demo * { -webkit-user-select: none !important; user-select: none !important; -webkit-touch-callout: none !important; }',
    'html.dl-demo input, html.dl-demo textarea, html.dl-demo [contenteditable="true"] { -webkit-user-select: text !important; user-select: text !important; }',
    // What a Demo account doesn't get (the Sheet and the app refuse them too).
    'html.dl-demo .nav-item[data-section="users"], html.dl-demo .nav-item[data-section="logs"], html.dl-demo .nav-item[data-section="digest"],',
    'html.dl-demo #open-sheet-item, html.dl-demo #ask-btn, html.dl-demo #dash-pdf, html.dl-demo #dash-png, html.dl-demo .dash-dl,',
    'html.dl-demo #ppt-report-btn, html.dl-demo #ppt-open, html.dl-demo #download-report-btn, html.dl-demo #users-btn, html.dl-demo #team-btn,',
    'html.dl-demo #change-pass-btn, html.dl-demo #tp-setup, html.dl-demo .doc-more, html.dl-demo #ai-digest-tile { display: none !important; }',
    'html.dl-demo #submit-btn, html.dl-demo #kc-admin-contact-bar, html.dl-demo #kc-admin-contact-panel { display: none !important; }',
    '.demo-note { display: none; } html.dl-demo .demo-note { display: inline-flex; align-items: center; font-size: 13px; font-weight: 600; opacity: 0.85; }',
    '@media print { html.dl-demo body { display: none !important; } }',
  ].join('\n');
  (document.head || root).appendChild(style);

  const stop = (e) => { if (!on) return; e.preventDefault(); e.stopPropagation(); };
  ['copy', 'cut', 'contextmenu', 'dragstart'].forEach((ev) => document.addEventListener(ev, stop, true));
  document.addEventListener('selectstart', (e) => {
    if (!on) return;
    const t = e.target && e.target.nodeType === 1 ? e.target : e.target && e.target.parentElement;
    if (t && t.closest && t.closest('input, textarea, [contenteditable="true"]')) return; // typing in a box still works
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
