// Daylens website: sticky header border, the hero demo, the feature tour.
(function () {
  var head = document.querySelector('.site-head');
  if (head) {
    var onScroll = function () { head.classList.toggle('scrolled', window.scrollY > 4); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ---- Hero demo: type an update, watch the Sheet row fill, save it. ----
  var demo = document.getElementById('demo');
  if (demo) {
    var TEXT = 'Homepage hero refreshed';
    var input = demo.querySelector('[data-typed]');
    var cell = demo.querySelector('[data-cell]');
    var row = demo.querySelector('[data-row]');
    var status = demo.querySelector('[data-status]');
    var submit = demo.querySelector('.demo-submit');
    var replay = demo.querySelector('.replay');
    var field = input.parentElement;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var timers = [];
    var later = function (fn, ms) { timers.push(setTimeout(fn, ms)); };

    var showSaved = function () {
      field.classList.remove('active');
      input.textContent = '';
      cell.classList.remove('focus');
      row.classList.remove('new');
      row.classList.add('saved');
      status.innerHTML = '<span class="ok">Row 8 saved to your Sheet</span>';
      replay.hidden = false;
    };
    var run = function () {
      timers.forEach(clearTimeout);
      timers = [];
      replay.hidden = true;
      row.classList.remove('saved');
      row.classList.add('new');
      input.textContent = '';
      cell.textContent = '';
      cell.classList.add('focus');
      field.classList.add('active');
      status.textContent = 'Yellow row 8 is what will be added when you submit.';
      var caret = document.createElement('span');
      caret.className = 'caret';
      var i = 0;
      var type = function () {
        i++;
        input.textContent = TEXT.slice(0, i);
        input.appendChild(caret);
        cell.textContent = TEXT.slice(0, i);
        if (i < TEXT.length) later(type, 55 + Math.random() * 60);
        else later(press, 700);
      };
      var press = function () {
        submit.classList.add('pressed');
        later(function () { submit.classList.remove('pressed'); showSaved(); }, 260);
      };
      later(type, 900);
    };

    if (reduce) {
      cell.textContent = TEXT;
      showSaved();
    } else if ('IntersectionObserver' in window) {
      var started = false;
      new IntersectionObserver(function (entries, obs) {
        if (!started && entries.some(function (e) { return e.isIntersecting; })) { started = true; obs.disconnect(); run(); }
      }, { threshold: 0.4 }).observe(demo);
    } else {
      run();
    }
    replay.addEventListener('click', run);
  }

  // ---- Feature tour: tabs swap the screenshot (arrow keys move between tabs). ----
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tour-tab'));
  if (tabs.length) {
    var select = function (tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
      if (focus) tab.focus();
    };
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t); });
      t.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
        if (e.key === 'Home') next = tabs[0];
        if (e.key === 'End') next = tabs[tabs.length - 1];
        if (next) { e.preventDefault(); select(next, true); }
      });
    });
  }
})();
