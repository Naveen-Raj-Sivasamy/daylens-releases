// A soft two-note chime, synthesized (no sound file to ship). Played when
// a reminder pop-up or today's leave card appears — if Sound is on in
// Settings (the main process decides; pages just call playChime()).
(function () {
  window.__chimes = 0; // tests count plays
  window.playChime = function () {
    window.__chimes++;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const t0 = ctx.currentTime + 0.02;
      [[784, 0], [1175, 0.17]].forEach(([freq, delay]) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, t0 + delay);
        gain.gain.exponentialRampToValueAtTime(0.16, t0 + delay + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + delay + 0.7);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t0 + delay);
        osc.stop(t0 + delay + 0.75);
      });
      setTimeout(() => ctx.close().catch(() => {}), 1400);
    } catch (e) {
      /* no audio device — the pop-up still shows */
    }
  };
  // The reminder alarm (1.8): three short, brighter beeps — repeated by the
  // reminder pop-up every few seconds until the reminder is snoozed,
  // stopped or done (if Sound is on in Settings).
  window.__alarms = 0; // tests count plays
  window.playAlarm = function () {
    window.__alarms++;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const t0 = ctx.currentTime + 0.02;
      [0, 0.28, 0.56].forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = 988;
        gain.gain.setValueAtTime(0.0001, t0 + delay);
        gain.gain.exponentialRampToValueAtTime(0.22, t0 + delay + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + delay + 0.2);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t0 + delay);
        osc.stop(t0 + delay + 0.22);
      });
      setTimeout(() => ctx.close().catch(() => {}), 1200);
    } catch (e) {
      /* no audio device — the pop-up still shows */
    }
  };
})();
