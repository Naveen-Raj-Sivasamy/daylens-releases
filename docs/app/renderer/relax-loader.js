// "Sit back and relax" (1.11.1): what a loading screen shows while the Sheet answers.
//
// An employee leans back in an office chair with a cup of tea and Daylens on
// their lap, while a small Daylens robot does the running across the office.
// A line under the picture changes every few seconds. It is a picture, not a
// progress bar: it loops for as long as the screen is loading.
//
//  - The office and the person are drawn here on a canvas (no image files).
//  - The robot's run is 16 small pictures in one file (relax-robot.webp, about
//    75 KB), rendered once from a 3D model, so nothing heavy runs in the app.
//    Model: "RobotExpressive" by Tomás Laulhé (Quaternius), CC0, with changes
//    by Don McCurdy.
//  - Colours come from the current Daylens theme. With "reduce motion" on, it
//    is a still picture.
//  - It stops by itself as soon as it is taken off the screen.
//
// Use:  DaylensRelax.mount(element)   → fills the element with the scene
(function () {
  if (window.DaylensRelax) return;
  var FR = 16, FW = 300, FH = 250, RUN_MS = 958 * 0.75, CROSS_MS = 6000, LINE_MS = 3200;
  var LINES = ['Sit back and relax. Daylens is on it.', 'Sip your tea. Daylens is doing the running.', 'Nearly there. Your work is in good hands.'];
  var sprite = null;
  function robot() {
    if (!sprite) { sprite = new Image(); sprite.src = 'relax-robot.webp'; }
    return sprite;
  }
  function css() {
    if (document.getElementById('dl-relax-css')) return;
    var st = document.createElement('style');
    st.id = 'dl-relax-css';
    st.textContent =
      '.dl-relax{position:relative;width:min(56vw,760px);max-width:100%;aspect-ratio:575/298;margin:0 auto;border-radius:18px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.22);-webkit-app-region:no-drag}' +
      '.dl-relax canvas{position:absolute;inset:0;width:100%;height:100%;display:block}' +
      '.dl-relax .dl-relax-cap{position:absolute;left:8px;right:8px;bottom:8px;text-align:center;font-weight:800;font-size:13.5px;line-height:1.3;color:#fff;text-shadow:0 1px 6px rgba(0,0,0,.7)}' +
      '@media (max-width:560px){.dl-relax{width:100%}.dl-relax .dl-relax-cap{font-size:12px}}';
    document.head.appendChild(st);
  }

  // ---- colours from the theme ----
  function toRgb(v) {
    v = String(v || '').trim();
    var m = /^#([0-9a-f]{3,8})$/i.exec(v);
    if (m) { var h = m[1]; if (h.length === 3) h = h.replace(/./g, '$&$&'); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
    m = /^rgba?\(([^)]+)\)/i.exec(v);
    if (m) { var p = m[1].split(/[ ,\/]+/).map(Number); if (p.length >= 3 && p.slice(0, 3).every(isFinite)) return p.slice(0, 3); }
    return null;
  }
  function toHsl(c) {
    var r = c[0] / 255, g = c[1] / 255, b = c[2] / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, h = 0, s = 0, d = mx - mn;
    if (d) { s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? ((g - b) / d + (g < b ? 6 : 0)) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; }
    return [h, s, l];
  }
  function hsl(h, s, l) { return 'hsl(' + Math.round(h) + ',' + Math.round(Math.max(0, Math.min(1, s)) * 100) + '%,' + Math.round(Math.max(0, Math.min(1, l)) * 100) + '%)'; }
  function palette() {
    var cs = getComputedStyle(document.documentElement);
    var light = document.documentElement.getAttribute('data-mode') === 'light';
    // the theme's own colour: the most colourful of its main colours
    var best = null;
    ['--page-bg', '--brand', '--gold', '--gold-bright', '--on-gold'].forEach(function (name) {
      var rgb = toRgb(cs.getPropertyValue(name));
      if (!rgb) return;
      var x = toHsl(rgb);
      var score = x[1] * (1 - Math.abs(x[2] - 0.5) * 1.4);
      if (!best || score > best.score) best = { h: x[0], s: x[1], score: score };
    });
    var h = best && best.score > 0.08 ? best.h : 150, s = best && best.score > 0.08 ? Math.max(0.35, Math.min(0.85, best.s)) : 0.12;
    var acc = toRgb(cs.getPropertyValue('--gold-bright')) || toRgb(cs.getPropertyValue('--gold'));
    var ah = h, as = s;
    if (acc) { var a = toHsl(acc); if (a[1] > 0.2 && a[2] > 0.25 && a[2] < 0.85) { ah = a[0]; as = a[1]; } }
    return light
      ? { a: hsl(h, s * 0.9, 0.80), b: hsl(h, s * 0.6, 0.94), c1: hsl(h, s * 0.7, 0.62), c2: hsl(h, s * 0.85, 0.42), c3: hsl(h, s * 0.9, 0.22), dark: hsl(h, s, 0.11), glow: '255,255,255', steam: hsl(h, s * 0.9, 0.22) }
      : { a: hsl(h, s * 0.8, 0.20), b: hsl(ah, as * 0.75, 0.62), c1: hsl(h, s * 0.6, 0.36), c2: hsl(h, s * 0.7, 0.27), c3: hsl(h, s * 0.8, 0.15), dark: hsl(h, s * 0.8, 0.07), glow: '255,240,214', steam: '#ffffff' };
  }

  function rng(seed) { var s = seed >>> 0; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.lineTo(x + w - r, y); c.quadraticCurveTo(x + w, y, x + w, y + r); c.lineTo(x + w, y + h - r); c.quadraticCurveTo(x + w, y + h, x + w - r, y + h); c.lineTo(x + r, y + h); c.quadraticCurveTo(x, y + h, x, y + h - r); c.lineTo(x, y + r); c.quadraticCurveTo(x, y, x + r, y); c.closePath(); }

  // The office: a wall of windows with the city outside, desks with monitors, plants, the floor.
  function office(c, p, W, H, GY) {
    var r = rng(20261115);
    var g = c.createLinearGradient(0, 0, 0, GY); g.addColorStop(0, p.a); g.addColorStop(1, p.b); c.fillStyle = g; c.fillRect(0, 0, W, GY);
    var wy = H * 0.10, wh = GY - H * 0.26, n = Math.max(4, Math.round(W / 120)), ww = W / n;
    for (var i = 0; i < n; i++) {
      c.save(); rr(c, i * ww + 6, wy, ww - 12, wh, 4); c.clip();
      var sg = c.createLinearGradient(0, wy, 0, wy + wh); sg.addColorStop(0, 'rgba(' + p.glow + ',0.85)'); sg.addColorStop(1, 'rgba(' + p.glow + ',0.35)'); c.fillStyle = sg; c.fillRect(i * ww, wy, ww, wh);
      c.fillStyle = p.c1; c.globalAlpha = 0.55;
      for (var b = 0; b < 4; b++) { var bw = ww * (0.16 + 0.12 * r()), bh = wh * (0.25 + 0.5 * r()); c.fillRect(i * ww + 6 + b * ww * 0.24, wy + wh - bh, bw, bh); }
      c.globalAlpha = 1; c.restore();
      c.strokeStyle = p.c3; c.lineWidth = 2; rr(c, i * ww + 6, wy, ww - 12, wh, 4); c.stroke();
    }
    var dy = GY - H * 0.035;
    for (var d = 0; d < 5; d++) {
      var dx = W * (0.30 + d * 0.145), dw = W * 0.085;
      c.fillStyle = p.c3; c.fillRect(dx, dy - H * 0.10, dw, H * 0.012); c.fillRect(dx + 3, dy - H * 0.10, 3, H * 0.10); c.fillRect(dx + dw - 6, dy - H * 0.10, 3, H * 0.10);
      c.fillStyle = p.dark; rr(c, dx + dw * 0.28, dy - H * 0.20, dw * 0.44, H * 0.085, 2); c.fill(); c.fillRect(dx + dw * 0.48, dy - H * 0.115, dw * 0.04, H * 0.02);
      c.fillStyle = 'rgba(' + p.glow + ',0.8)'; c.fillRect(dx + dw * 0.31, dy - H * 0.19, dw * 0.38, H * 0.065);
    }
    [0.27, 0.985].forEach(function (u) { c.fillStyle = p.c3; rr(c, u * W - 8, dy - H * 0.05, 16, H * 0.05, 2); c.fill(); c.fillStyle = p.c2; for (var k = -2; k <= 2; k++) { c.beginPath(); c.ellipse(u * W + k * 5, dy - H * 0.09, 4, H * 0.05, k * 0.35, 0, 7); c.fill(); } });
    c.fillStyle = p.c2; c.fillRect(0, GY - H * 0.035, W, H * 0.035);
    var fg = c.createLinearGradient(0, GY, 0, H); fg.addColorStop(0, p.c3); fg.addColorStop(1, p.dark); c.fillStyle = fg; c.fillRect(0, GY, W, H - GY);
  }

  // The employee: leaning back, one hand behind the head, a cup of tea in the other, feet up, Daylens on the lap.
  function person(c, x0, s, GY, H) {
    var X = function (v) { return x0 + v * s; }, Y = function (v) { return GY + (v - 300) * s + (H - GY) * 0.42; };
    var skin = '#c98f6b', hair = '#2b211c', shirt = '#ffffff', trouser = '#27364a', shoe = '#15191f', chair = '#2f353d', seat = '#454d57';
    var limb = function (pts, w, col) { c.strokeStyle = col; c.lineWidth = w * s; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); pts.forEach(function (q, i) { if (i) c.lineTo(X(q[0]), Y(q[1])); else c.moveTo(X(q[0]), Y(q[1])); }); c.stroke(); };
    c.fillStyle = 'rgba(0,0,0,.22)'; c.beginPath(); c.ellipse(X(150), Y(300), 135 * s, 9 * s, 0, 0, 7); c.fill();
    limb([[78, 292], [142, 292]], 6, chair); [80, 110, 140].forEach(function (wx) { c.fillStyle = chair; c.beginPath(); c.arc(X(wx), Y(296), 5 * s, 0, 7); c.fill(); });
    limb([[110, 292], [110, 232]], 7, chair);
    limb([[70, 228], [158, 228]], 14, seat);
    limb([[72, 222], [44, 118]], 13, seat);
    c.fillStyle = seat; rr(c, X(232), Y(236), 62 * s, 14 * s, 5 * s); c.fill(); limb([[244, 250], [240, 296]], 5, chair); limb([[282, 250], [286, 296]], 5, chair);
    limb([[70, 138], [36, 108], [58, 88]], 13, '#e6ebf0');
    limb([[108, 214], [176, 206], [246, 226]], 22, trouser);
    limb([[104, 210], [74, 136]], 44, shirt);
    limb([[110, 216], [182, 202], [252, 220]], 22, trouser);
    limb([[250, 222], [262, 200]], 13, shoe); limb([[244, 228], [254, 208]], 13, shoe);
    // neck, then the head in profile (leaning back, eyes closed, a small smile)
    limb([[74, 128], [69, 108]], 17, skin);
    c.save(); c.translate(X(66), Y(88)); c.rotate(-0.32); c.scale(s * 1.18, s * 1.18);
    c.fillStyle = skin; c.beginPath();
    c.moveTo(5, -21); c.bezierCurveTo(12, -19, 16, -13, 16, -7);
    c.lineTo(17.5, -3); c.quadraticCurveTo(24, 3, 22.5, 5.5); c.lineTo(17.5, 6.5);
    c.quadraticCurveTo(19.5, 9, 17.5, 10.5); c.lineTo(18.5, 12.5); c.quadraticCurveTo(18.5, 15, 16.5, 15.5);
    c.quadraticCurveTo(18, 22, 12, 23.5); c.quadraticCurveTo(4, 25, -4, 20);
    c.lineTo(-10, 16); c.bezierCurveTo(-22, 8, -22, -14, -8, -21); c.closePath(); c.fill();
    c.fillStyle = 'rgba(120,60,30,.09)'; c.beginPath(); c.ellipse(7, 13, 8, 5, 0.3, 0, 7); c.fill();
    c.fillStyle = hair; c.beginPath(); c.moveTo(9, -19.5); c.bezierCurveTo(4, -29, -18, -27, -21, -8); c.bezierCurveTo(-23, 2, -19, 10, -12, 15);
    c.lineTo(-9, 6); c.quadraticCurveTo(-11, -2, -5, -5); c.lineTo(-3.5, 3); c.lineTo(-1, 3); c.quadraticCurveTo(-2, -9, 5, -12); c.quadraticCurveTo(10, -14, 9, -19.5); c.closePath(); c.fill();
    c.fillStyle = '#b57a58'; c.beginPath(); c.ellipse(-6, 3.5, 3.2, 5, 0.15, 0, 7); c.fill();
    c.strokeStyle = hair; c.lineCap = 'round'; c.lineWidth = 1.7; c.beginPath(); c.moveTo(6.5, -8.5); c.quadraticCurveTo(10.5, -11, 14.5, -8.5); c.stroke();
    c.lineWidth = 1.4; c.beginPath(); c.moveTo(8, -3.6); c.quadraticCurveTo(10.5, -1.6, 13.4, -3.6); c.stroke();
    c.strokeStyle = '#7a3f2c'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(11.5, 11.5); c.quadraticCurveTo(15, 13.6, 18, 11); c.stroke();
    c.restore();
    // the near arm holds a cup of tea in front of the chest
    limb([[84, 142], [112, 172], [134, 146]], 14, shirt);
    c.fillStyle = skin; c.beginPath(); c.arc(X(136), Y(143), 7.5 * s, 0, 7); c.fill();
    c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(X(128), Y(122)); c.lineTo(X(152), Y(122)); c.quadraticCurveTo(X(151), Y(140), X(140), Y(140)); c.quadraticCurveTo(X(129), Y(140), X(128), Y(122)); c.closePath(); c.fill();
    c.strokeStyle = '#ffffff'; c.lineWidth = 2.4 * s; c.beginPath(); c.arc(X(153), Y(129), 4.5 * s, -1.3, 1.5); c.stroke();
    c.fillStyle = '#b5651d'; c.beginPath(); c.ellipse(X(140), Y(122.5), 11 * s, 2.2 * s, 0, 0, 7); c.fill();
    // Daylens on the lap: a tablet with a green screen and the lens mark
    c.save(); c.translate(X(150), Y(190)); c.rotate(-0.42);
    c.fillStyle = '#1b2026'; rr(c, -26 * s, -34 * s, 52 * s, 38 * s, 4 * s); c.fill();
    c.fillStyle = '#0f6b46'; rr(c, -23 * s, -31 * s, 46 * s, 32 * s, 2.5 * s); c.fill();
    c.strokeStyle = '#ffffff'; c.lineWidth = 2.6 * s; c.beginPath(); c.arc(-2 * s, -16 * s, 7 * s, 0, 7); c.stroke(); c.beginPath(); c.moveTo(3.5 * s, -10.5 * s); c.lineTo(9 * s, -5 * s); c.stroke();
    c.restore();
  }

  function mount(host) {
    if (!host) return null;
    if (host.__dlRelax && host.__dlRelax.alive()) return host.__dlRelax;
    css();
    host.innerHTML = '';
    var box = document.createElement('div');
    box.className = 'dl-relax';
    var canvas = document.createElement('canvas');
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', 'An employee relaxing in an office chair with a cup of tea while a small Daylens robot does the running');
    var cap = document.createElement('div');
    cap.className = 'dl-relax-cap';
    cap.setAttribute('aria-hidden', 'true'); // decoration: the screen's own "Loading…" line is what a screen reader hears
    cap.textContent = LINES[0];
    box.appendChild(canvas); box.appendChild(cap); host.appendChild(box);
    var ctx = canvas.getContext('2d'), back = document.createElement('canvas'), bctx = back.getContext('2d');
    var W = 0, H = 0, GY = 0, dpr = 1, pal = null, themeKey = '', alive = true, t0 = performance.now(), line = 0;
    var reduce = false; try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { /* older engine */ }
    var img = robot();
    function size() {
      var b = canvas.getBoundingClientRect();
      if (b.width < 2 || b.height < 2) return false;
      var key = document.documentElement.getAttribute('data-theme') + '|' + document.documentElement.getAttribute('data-mode');
      if (Math.abs(b.width - W) < 0.5 && Math.abs(b.height - H) < 0.5 && key === themeKey) return true;
      themeKey = key; pal = palette();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = b.width; H = b.height; GY = H * 0.74;
      canvas.width = back.width = Math.round(W * dpr); canvas.height = back.height = Math.round(H * dpr);
      bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      office(bctx, pal, W, H, GY);
      return true;
    }
    function frame(now) {
      if (!alive) return;
      if (!canvas.isConnected) { alive = false; return; }            // taken off the screen: stop
      if (canvas.offsetParent === null || !size()) { setTimeout(function () { requestAnimationFrame(frame); }, 250); return; } // hidden for now
      var t = reduce ? 2000 : now - t0;
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(back, 0, 0); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var u = reduce ? 0.5 : (t % CROSS_MS) / CROSS_MS;
      var li = reduce ? 0 : Math.floor(t / LINE_MS) % LINES.length;
      if (li !== line) { line = li; cap.textContent = LINES[li]; }
      if (img.complete && img.naturalWidth) {
        var sc = H / 540, dw = FW * sc, dh = FH * sc, f = Math.floor(((t % RUN_MS) / RUN_MS) * FR) % FR;
        ctx.drawImage(img, f * FW, 0, FW, FH, W * 0.24 + u * W * 0.86 - dw * 0.5, GY - dh * 0.80, dw, dh);
      }
      var ps = H / 430;
      person(ctx, W * 0.03, ps, GY, H);
      // steam from the tea (dark on a light theme, so it can be seen)
      var mx = W * 0.03 + 134 * ps, my = GY + (119 - 300) * ps + (H - GY) * 0.42;
      ctx.strokeStyle = pal.steam; ctx.lineWidth = Math.max(1.6, 2.2 * ps); ctx.lineCap = 'round';
      for (var k = 0; k < 3; k++) {
        var ph = (t / 1100 + k * 0.33) % 1, sx = mx + k * 6 * ps, sy = my - ph * 22 * ps;
        ctx.globalAlpha = (1 - ph) * 0.9; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.bezierCurveTo(sx + 6 * ps, sy - 5 * ps, sx - 6 * ps, sy - 10 * ps, sx, sy - 16 * ps); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      if (reduce) { setTimeout(function () { requestAnimationFrame(frame); }, 600); return; } // a still picture: only re-drawn if the size or theme changes
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    host.__dlRelax = { alive: function () { return alive && canvas.isConnected; }, stop: function () { alive = false; }, el: box };
    return host.__dlRelax;
  }

  window.DaylensRelax = { mount: mount, LINES: LINES };
})();
