// Shared by every screen the main desktop-app window embeds (index.html,
// manage.html, connect.html). Loaded first, before each page's own script.
//
// Those pages were originally standalone windows. Inside the main
// window they run in an <iframe> of app.html instead — this file is the
// one place that difference is detected and smoothed over, so each page
// only needs a couple of small `if (window.__appMode)` touches rather
// than a second copy of itself. Outside the main window (the first-run
// Connect window) it does nothing at all.
(function () {
  var inFrame = false;
  try { inFrame = window.self !== window.top; } catch (e) { inFrame = true; }
  var params = new URLSearchParams(location.search);
  var appMode = inFrame && params.get('mode') === 'app';
  window.__appMode = appMode;
  if (!appMode) return;

  document.documentElement.classList.add('app-mode');

  // Message to the shell (app.html). '*' is fine: both sides are this
  // app's own local file:// pages, and the shell only acts on known types.
  window.__appPost = function (msg) {
    try { window.parent.postMessage(Object.assign({ __statusApp: true }, msg), '*'); } catch (e) { /* best-effort */ }
  };

  // These pages "close" themselves with window.close() (✕, Cancel, Close,
  // after saving a connection). In an iframe that silently does nothing —
  // instead, go back to the main window's Home section.
  window.close = function () { window.__appPost({ type: 'close-section' }); };

  // Shared app-mode chrome tweaks: no window-drag regions inside embedded
  // screens (the shell's own title strip handles moving the window), and
  // no per-page ✕ buttons (the sidebar is how you leave a section).
  var style = document.createElement('style');
  style.textContent =
    'html.app-mode *, html.app-mode body { -webkit-app-region: no-drag !important; }' +
    'html.app-mode #titlebar-close-btn, html.app-mode .drag-footer { display: none !important; }';
  (document.head || document.documentElement).appendChild(style);
})();
