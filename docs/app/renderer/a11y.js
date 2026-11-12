// Accessibility helpers shared by every screen (1.10).
//
// Labels: Daylens draws most forms as  <div class="field"><label>…</label>
// <input …></div>  — the label sits beside its control but isn't tied to it,
// so a screen reader says only "edit text". This ties every such label to
// its control (for/id; a group of chips gets aria-labelledby), now and
// whenever a screen draws new fields. Nothing visible changes.
(function () {
  var n = 0;
  var CONTROL = 'input:not([type="hidden"]), select, textarea';
  function link(field) {
    var label = null;
    for (var i = 0; i < field.children.length; i++) if (field.children[i].tagName === 'LABEL') { label = field.children[i]; break; }
    if (!label || label.htmlFor || label.querySelector(CONTROL)) return;
    var control = field.querySelector(CONTROL);
    if (control) {
      if (control.getAttribute('aria-label') || control.getAttribute('aria-labelledby')) return;
      if (!control.id) control.id = 'dl-f' + (++n);
      label.htmlFor = control.id;
      return;
    }
    var group = field.querySelector('.chip-group, [role="group"], [role="radiogroup"], [contenteditable="true"]');
    if (group && !group.getAttribute('aria-label') && !group.getAttribute('aria-labelledby')) {
      if (!label.id) label.id = 'dl-l' + (++n);
      group.setAttribute('aria-labelledby', label.id);
      if (!group.getAttribute('role')) group.setAttribute('role', 'group');
    }
  }
  function linkAll(root) {
    if (!root || !root.querySelectorAll) return;
    if (root.classList && root.classList.contains('field')) link(root);
    var fields = root.querySelectorAll('.field');
    for (var i = 0; i < fields.length; i++) link(fields[i]);
  }
  var queued = false;
  function later() {
    if (queued) return;
    queued = true;
    (window.requestAnimationFrame || setTimeout)(function () { queued = false; linkAll(document.body); });
  }
  function start() {
    linkAll(document.body);
    try { new MutationObserver(later).observe(document.body, { childList: true, subtree: true }); } catch (e) { /* older engines: labels stay as they were */ }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  window.__a11yLink = function () { linkAll(document.body); };

  // Windows: after a built-in "OK / Cancel" box (confirm, alert) closes, the
  // window can stop taking typing until it's clicked away from and back —
  // a long-standing Electron fault. Daylens asks the window to take the
  // keyboard back straight after every such box (1.10).
  ['confirm', 'alert'].forEach(function (name) {
    var native = window[name];
    if (typeof native !== 'function') return;
    window[name] = function () {
      try { return native.apply(window, arguments); }
      finally { try { if (window.statusApp && window.statusApp.refocusWindow) window.statusApp.refocusWindow(); } catch (e) { /* the web version: nothing to do */ } }
    };
  });
})();
