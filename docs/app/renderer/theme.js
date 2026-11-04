// Colour themes — loaded first by every page (app shell, embedded screens,
// first-run Connect, banner) so the whole app switches together.
//
// Each theme is one set of CSS variables. Page styles only ever use
// var(--…) for these core colours; fixed meaning colours (green "Done",
// red "Failed", amber "Open") stay the same in every theme on purpose.
//
// The choice is saved per person on this computer (localStorage, shared by
// every page of the app) and changed from Settings → Theme. Other open
// pages pick the change up instantly via the 'storage' event.
(function () {
  var THEMES = {
    forest: {
      label: 'Forest', hint: 'Deep green & gold (the original)',
      brand: '#16332a', 'brand-hover': '#234c3d', chrome: '#10261f',
      surface: '#f6f1e6', 'surface-hover': '#efe6d3', 'tile-hover': '#fbf7ee',
      chip: '#ece4d2', 'chip-hover': '#e6dcc3', border: '#ddd3bd',
      text: '#1c3a2f', 'text-dim': '#86807a',
      'on-brand': '#f3ede0', 'on-brand-dim': '#b9ab86', muted: '#7f8f84',
      gold: '#c9a15f', 'gold-bright': '#d8b877', 'on-gold': '#1c3a2f', 'accent-soft': 'rgba(201,161,95,0.16)',
      mode: 'dark', 'page-bg': 'radial-gradient(1200px 600px at 85% -10%, rgba(232,180,80,0.26), transparent 60%), radial-gradient(900px 500px at 10% 110%, rgba(46,170,120,0.30), transparent 60%), linear-gradient(160deg, #123a2e, #0b211a 70%)',
      'card-bg': 'rgba(255,255,255,0.07)', 'card-bg-2': 'rgba(255,255,255,0.06)', 'card-border': 'rgba(255,255,255,0.11)', 'card-shadow': '0 10px 30px rgba(0,0,0,0.25)',
      'card-text': '#ffffff', 'card-text-dim': 'rgba(255,255,255,0.68)',
      'input-bg': 'rgba(255,255,255,0.09)', 'input-border': 'rgba(255,255,255,0.16)', 'input-text': '#ffffff',
      'accent-grad': 'linear-gradient(135deg, #ffc24d, #ff8a3d)', 'on-accent': '#2a1a05', 'accent-glow': '0 6px 18px rgba(0,0,0,0.30)',
      'strip-bg': 'rgba(0,0,0,0.25)', 'strip-text': '#ffffff', 'overlay-color': '#0b211a', 'overlay-symbol': '#ffffff'
    },
    ocean: {
      label: 'Ocean', hint: 'Navy & bright sky blue',
      brand: '#0e2a47', 'brand-hover': '#16395f', chrome: '#091d33',
      surface: '#eef6fc', 'surface-hover': '#e0eef9', 'tile-hover': '#f7fbfe',
      chip: '#dbe9f5', 'chip-hover': '#cfe1f1', border: '#c6d9ea',
      text: '#0d2840', 'text-dim': '#6b7f93',
      'on-brand': '#eaf4fd', 'on-brand-dim': '#8fb4d6', muted: '#7891a8',
      gold: '#22b8f0', 'gold-bright': '#5cd0fa', 'on-gold': '#06243b', 'accent-soft': 'rgba(34,184,240,0.16)',
      mode: 'dark', 'page-bg': 'radial-gradient(1200px 600px at 85% -10%, rgba(34,184,240,0.28), transparent 60%), radial-gradient(900px 500px at 10% 110%, rgba(91,108,255,0.28), transparent 60%), linear-gradient(160deg, #0f2f50, #081a2e 70%)',
      'card-bg': 'rgba(255,255,255,0.07)', 'card-bg-2': 'rgba(255,255,255,0.06)', 'card-border': 'rgba(255,255,255,0.11)', 'card-shadow': '0 10px 30px rgba(0,0,0,0.25)',
      'card-text': '#ffffff', 'card-text-dim': 'rgba(255,255,255,0.68)',
      'input-bg': 'rgba(255,255,255,0.09)', 'input-border': 'rgba(255,255,255,0.16)', 'input-text': '#ffffff',
      'accent-grad': 'linear-gradient(135deg, #5cd0fa, #5b6cff)', 'on-accent': '#05192b', 'accent-glow': '0 6px 18px rgba(0,0,0,0.30)',
      'strip-bg': 'rgba(0,0,0,0.25)', 'strip-text': '#ffffff', 'overlay-color': '#081a2e', 'overlay-symbol': '#ffffff'
    },
    sunset: {
      label: 'Sunset', hint: 'Plum & warm orange',
      brand: '#3a1426', 'brand-hover': '#4d1c33', chrome: '#2a0e1b',
      surface: '#fff3ea', 'surface-hover': '#fde6d6', 'tile-hover': '#fff9f4',
      chip: '#fbe2d0', 'chip-hover': '#f8d5bd', border: '#f1cdb5',
      text: '#3a1426', 'text-dim': '#94706a',
      'on-brand': '#ffeee3', 'on-brand-dim': '#e7a98c', muted: '#b0857a',
      gold: '#ff7a45', 'gold-bright': '#ff9b6e', 'on-gold': '#2a0e1b', 'accent-soft': 'rgba(255,122,69,0.18)',
      mode: 'dark', 'page-bg': 'radial-gradient(1200px 600px at 85% -10%, rgba(255,122,69,0.30), transparent 60%), radial-gradient(900px 500px at 10% 110%, rgba(255,94,154,0.26), transparent 60%), linear-gradient(160deg, #45182c, #220a15 70%)',
      'card-bg': 'rgba(255,255,255,0.07)', 'card-bg-2': 'rgba(255,255,255,0.06)', 'card-border': 'rgba(255,255,255,0.11)', 'card-shadow': '0 10px 30px rgba(0,0,0,0.25)',
      'card-text': '#ffffff', 'card-text-dim': 'rgba(255,255,255,0.68)',
      'input-bg': 'rgba(255,255,255,0.09)', 'input-border': 'rgba(255,255,255,0.16)', 'input-text': '#ffffff',
      'accent-grad': 'linear-gradient(135deg, #ffb347, #ff5e62)', 'on-accent': '#2a0e05', 'accent-glow': '0 6px 18px rgba(0,0,0,0.30)',
      'strip-bg': 'rgba(0,0,0,0.25)', 'strip-text': '#ffffff', 'overlay-color': '#220a15', 'overlay-symbol': '#ffffff'
    },
    royal: {
      label: 'Royal', hint: 'Indigo & lavender',
      brand: '#1f1147', 'brand-hover': '#2c1a61', chrome: '#160b35',
      surface: '#f3f0ff', 'surface-hover': '#e8e2ff', 'tile-hover': '#faf8ff',
      chip: '#e3dcfb', 'chip-hover': '#d7cdf8', border: '#d4caf5',
      text: '#1f1147', 'text-dim': '#7a7099',
      'on-brand': '#efeaff', 'on-brand-dim': '#b3a5e6', muted: '#8d82b3',
      gold: '#a78bfa', 'gold-bright': '#c4b5fd', 'on-gold': '#160b35', 'accent-soft': 'rgba(167,139,250,0.18)',
      mode: 'dark', 'page-bg': 'radial-gradient(1200px 600px at 85% -10%, rgba(167,139,250,0.30), transparent 60%), radial-gradient(900px 500px at 10% 110%, rgba(56,189,248,0.22), transparent 60%), linear-gradient(160deg, #24145a, #120a30 70%)',
      'card-bg': 'rgba(255,255,255,0.07)', 'card-bg-2': 'rgba(255,255,255,0.06)', 'card-border': 'rgba(255,255,255,0.11)', 'card-shadow': '0 10px 30px rgba(0,0,0,0.25)',
      'card-text': '#ffffff', 'card-text-dim': 'rgba(255,255,255,0.68)',
      'input-bg': 'rgba(255,255,255,0.09)', 'input-border': 'rgba(255,255,255,0.16)', 'input-text': '#ffffff',
      'accent-grad': 'linear-gradient(135deg, #c4b5fd, #8b5cf6)', 'on-accent': '#140a30', 'accent-glow': '0 6px 18px rgba(0,0,0,0.30)',
      'strip-bg': 'rgba(0,0,0,0.25)', 'strip-text': '#ffffff', 'overlay-color': '#120a30', 'overlay-symbol': '#ffffff'
    },
    berry: {
      label: 'Berry', hint: 'Dark berry & hot pink',
      brand: '#3b0d2c', 'brand-hover': '#511440', chrome: '#2a0820',
      surface: '#fff0f7', 'surface-hover': '#fde2f0', 'tile-hover': '#fff7fb',
      chip: '#fbd9ea', 'chip-hover': '#f8cbe2', border: '#f2c5dc',
      text: '#3b0d2c', 'text-dim': '#9a6c84',
      'on-brand': '#ffeef7', 'on-brand-dim': '#e9a3c8', muted: '#b17c98',
      gold: '#f0509b', 'gold-bright': '#f77fb7', 'on-gold': '#2a0820', 'accent-soft': 'rgba(240,80,155,0.18)',
      mode: 'dark', 'page-bg': 'radial-gradient(1200px 600px at 85% -10%, rgba(240,80,155,0.30), transparent 60%), radial-gradient(900px 500px at 10% 110%, rgba(255,170,90,0.22), transparent 60%), linear-gradient(160deg, #46102f, #22071a 70%)',
      'card-bg': 'rgba(255,255,255,0.07)', 'card-bg-2': 'rgba(255,255,255,0.06)', 'card-border': 'rgba(255,255,255,0.11)', 'card-shadow': '0 10px 30px rgba(0,0,0,0.25)',
      'card-text': '#ffffff', 'card-text-dim': 'rgba(255,255,255,0.68)',
      'input-bg': 'rgba(255,255,255,0.09)', 'input-border': 'rgba(255,255,255,0.16)', 'input-text': '#ffffff',
      'accent-grad': 'linear-gradient(135deg, #ff8fc7, #f0509b)', 'on-accent': '#2a0820', 'accent-glow': '0 6px 18px rgba(0,0,0,0.30)',
      'strip-bg': 'rgba(0,0,0,0.25)', 'strip-text': '#ffffff', 'overlay-color': '#22071a', 'overlay-symbol': '#ffffff'
    },
    lagoon: {
      label: 'Lagoon', hint: 'Deep teal & coral — bright and playful',
      brand: '#06363e', 'brand-hover': '#0a4852', chrome: '#042a31',
      surface: '#effbfa', 'surface-hover': '#ddf5f3', 'tile-hover': '#f6fdfc',
      chip: '#d3f1ee', 'chip-hover': '#c2ebe7', border: '#bfe5e1',
      text: '#06363e', 'text-dim': '#5b7f80',
      'on-brand': '#e9fbf9', 'on-brand-dim': '#8fd3cc', muted: '#79aaa6',
      gold: '#ff7a59', 'gold-bright': '#ff9a80', 'on-gold': '#2a0d05', 'accent-soft': 'rgba(255,122,89,0.18)',
      mode: 'dark', 'page-bg': 'radial-gradient(1200px 600px at 85% -10%, rgba(255,122,89,0.30), transparent 60%), radial-gradient(900px 500px at 10% 110%, rgba(0,212,200,0.34), transparent 60%), linear-gradient(160deg, #07505a, #032a30 70%)',
      'card-bg': 'rgba(255,255,255,0.08)', 'card-bg-2': 'rgba(255,255,255,0.06)', 'card-border': 'rgba(255,255,255,0.12)', 'card-shadow': '0 10px 30px rgba(0,0,0,0.25)',
      'card-text': '#ffffff', 'card-text-dim': 'rgba(255,255,255,0.70)',
      'input-bg': 'rgba(255,255,255,0.09)', 'input-border': 'rgba(255,255,255,0.18)', 'input-text': '#ffffff',
      'accent-grad': 'linear-gradient(135deg, #ffc46b, #ff6b81)', 'on-accent': '#2a0d05', 'accent-glow': '0 6px 18px rgba(0,0,0,0.30)',
      'strip-bg': 'rgba(0,0,0,0.25)', 'strip-text': '#ffffff', 'overlay-color': '#032a30', 'overlay-symbol': '#ffffff'
    },
    graphite: {
      label: 'Graphite', hint: 'Plain dark grey, no colour tint — easy for long days',
      brand: '#1d1f23', 'brand-hover': '#272a30', chrome: '#141518',
      surface: '#f3f4f6', 'surface-hover': '#e7e9ed', 'tile-hover': '#fafafb',
      chip: '#e5e7eb', 'chip-hover': '#d9dce1', border: '#d6d9de',
      text: '#1f2328', 'text-dim': '#6b7280',
      'on-brand': '#eceef1', 'on-brand-dim': '#a3a9b3', muted: '#8b919b',
      gold: '#7aa2f7', 'gold-bright': '#9ab8fa', 'on-gold': '#0e1525', 'accent-soft': 'rgba(122,162,247,0.16)',
      mode: 'dark', 'page-bg': 'linear-gradient(160deg, #25282d, #151618 70%)',
      'card-bg': 'rgba(255,255,255,0.06)', 'card-bg-2': 'rgba(255,255,255,0.05)', 'card-border': 'rgba(255,255,255,0.10)', 'card-shadow': '0 10px 30px rgba(0,0,0,0.30)',
      'card-text': '#ffffff', 'card-text-dim': 'rgba(255,255,255,0.68)',
      'input-bg': 'rgba(255,255,255,0.08)', 'input-border': 'rgba(255,255,255,0.16)', 'input-text': '#ffffff',
      'accent-grad': 'linear-gradient(135deg, #9ab8fa, #6b8cf0)', 'on-accent': '#0b1222', 'accent-glow': '0 6px 18px rgba(0,0,0,0.35)',
      'strip-bg': 'rgba(0,0,0,0.25)', 'strip-text': '#ffffff', 'overlay-color': '#151618', 'overlay-symbol': '#ffffff'
    },
    contrast: {
      label: 'High contrast', hint: 'Black & white with yellow — the easiest to read',
      brand: '#000000', 'brand-hover': '#1a1a1a', chrome: '#000000',
      surface: '#ffffff', 'surface-hover': '#f0f0f0', 'tile-hover': '#ffffff',
      chip: '#e8e8e8', 'chip-hover': '#dcdcdc', border: '#000000',
      text: '#000000', 'text-dim': '#333333',
      'on-brand': '#ffffff', 'on-brand-dim': '#e6e6e6', muted: '#d0d0d0',
      gold: '#ffd400', 'gold-bright': '#ffe14d', 'on-gold': '#000000', 'accent-soft': 'rgba(255,212,0,0.22)',
      mode: 'dark', 'page-bg': '#000000',
      'card-bg': '#0d0d0d', 'card-bg-2': '#141414', 'card-border': '#ffffff', 'card-shadow': 'none',
      'card-text': '#ffffff', 'card-text-dim': '#e6e6e6',
      'input-bg': '#000000', 'input-border': '#ffffff', 'input-text': '#ffffff',
      'accent-grad': 'linear-gradient(135deg, #ffe14d, #ffd400)', 'on-accent': '#000000', 'accent-glow': 'none',
      'strip-bg': '#000000', 'strip-text': '#ffffff', 'overlay-color': '#000000', 'overlay-symbol': '#ffffff'
    },
    light: {
      label: 'Light', hint: 'Bright white cards with bold colour accents',
      brand: '#f4f6fb', 'brand-hover': '#e9edf7', chrome: '#ffffff',
      surface: '#ffffff', 'surface-hover': '#f5f7fc', 'tile-hover': '#ffffff',
      chip: '#eef1f8', 'chip-hover': '#e3e8f4', border: '#e3e7f0',
      text: '#1d2433', 'text-dim': '#5f6b85',
      'on-brand': '#1d2433', 'on-brand-dim': '#5f6b85', muted: '#8a93a8',
      gold: '#18a965', 'gold-bright': '#1fc078', 'on-gold': '#ffffff', 'accent-soft': 'rgba(24,169,101,0.12)',
      mode: 'light', 'page-bg': '#f4f6fb',
      'card-bg': '#ffffff', 'card-bg-2': '#f8f9fd', 'card-border': '#e7eaf3', 'card-shadow': '0 8px 24px rgba(30,45,90,0.08)',
      'card-text': '#1d2433', 'card-text-dim': '#5f6b85',
      'input-bg': '#ffffff', 'input-border': '#d9deea', 'input-text': '#1d2433',
      'accent-grad': 'linear-gradient(135deg, #1fc078, #12804f)', 'on-accent': '#ffffff', 'accent-glow': '0 6px 16px rgba(24,169,101,0.30)',
      'strip-bg': 'linear-gradient(90deg, #12372b, #1f5a45)', 'strip-text': '#ffffff', 'overlay-color': '#1f5a45', 'overlay-symbol': '#ffffff',
    },
    cloud: {
      label: 'Cloud', hint: 'Soft grey-blue light with blue accents',
      brand: '#eef2f8', 'brand-hover': '#e2e8f2', chrome: '#ffffff',
      surface: '#ffffff', 'surface-hover': '#f3f6fb', 'tile-hover': '#ffffff',
      chip: '#e8eef8', 'chip-hover': '#dbe4f3', border: '#dbe3ef',
      text: '#172033', 'text-dim': '#56637a',
      'on-brand': '#172033', 'on-brand-dim': '#56637a', muted: '#7d889c',
      gold: '#2563eb', 'gold-bright': '#1d4ed8', 'on-gold': '#ffffff', 'accent-soft': 'rgba(37,99,235,0.12)',
      mode: 'light', 'page-bg': 'linear-gradient(180deg, #f3f6fb, #e8edf6)',
      'card-bg': '#ffffff', 'card-bg-2': '#f6f8fc', 'card-border': '#e1e7f1', 'card-shadow': '0 8px 24px rgba(23,32,51,0.07)',
      'card-text': '#172033', 'card-text-dim': '#56637a',
      'input-bg': '#ffffff', 'input-border': '#cfd8e6', 'input-text': '#172033',
      'accent-grad': 'linear-gradient(135deg, #3b82f6, #1d4ed8)', 'on-accent': '#ffffff', 'accent-glow': '0 6px 16px rgba(37,99,235,0.28)',
      'strip-bg': 'linear-gradient(90deg, #1e3a8a, #2557d6)', 'strip-text': '#ffffff', 'overlay-color': '#2557d6', 'overlay-symbol': '#ffffff'
    },
    sand: {
      label: 'Sand', hint: 'Warm light with burnt-orange accents',
      brand: '#f6f1e8', 'brand-hover': '#eee6d8', chrome: '#fffdf9',
      surface: '#fffdf9', 'surface-hover': '#f8f2e8', 'tile-hover': '#ffffff',
      chip: '#f1e8da', 'chip-hover': '#e9dcc8', border: '#e6dccb',
      text: '#2b2118', 'text-dim': '#6f6254',
      'on-brand': '#2b2118', 'on-brand-dim': '#6f6254', muted: '#958676',
      gold: '#c2410c', 'gold-bright': '#b43c0b', 'on-gold': '#ffffff', 'accent-soft': 'rgba(194,65,12,0.12)',
      mode: 'light', 'page-bg': 'linear-gradient(180deg, #f8f4ec, #f0e9dd)',
      'card-bg': '#fffdf9', 'card-bg-2': '#faf6ef', 'card-border': '#ebe2d3', 'card-shadow': '0 8px 24px rgba(60,40,20,0.08)',
      'card-text': '#2b2118', 'card-text-dim': '#6f6254',
      'input-bg': '#ffffff', 'input-border': '#ddd1bf', 'input-text': '#2b2118',
      'accent-grad': 'linear-gradient(135deg, #f97316, #c2410c)', 'on-accent': '#ffffff', 'accent-glow': '0 6px 16px rgba(194,65,12,0.25)',
      'strip-bg': 'linear-gradient(90deg, #3b2a1d, #5a3e28)', 'strip-text': '#ffffff', 'overlay-color': '#5a3e28', 'overlay-symbol': '#ffffff'
    },
  };
  var KEY = 'statusApp.theme';
  var DEFAULT = 'forest';

  var styleEl = document.createElement('style');
  styleEl.id = 'theme-vars';
  (document.head || document.documentElement).appendChild(styleEl);

  function read() {
    try { var t = localStorage.getItem(KEY); return THEMES[t] ? t : DEFAULT; } catch (e) { return DEFAULT; }
  }
  function apply(name) {
    var t = THEMES[name] || THEMES[DEFAULT];
    var css = ':root{' + Object.keys(t).filter(function (k) { return k !== 'label' && k !== 'hint' && k !== 'mode'; })
      .map(function (k) { return '--' + k + ':' + t[k] + ';'; }).join('') +
      // Native controls (dropdown lists, date pickers, scrollbars) follow
      // the theme too — otherwise a dark theme gets white OS pop-ups.
      'color-scheme:' + (t.mode === 'light' ? 'light' : 'dark') + ';' +
      // Six fixed vibrant colours for colour-coding cards/chips — the same
      // in every theme, so "SITES is green" stays true when you switch.
      '--h1:#3ddc97;--h2:#7aa7ff;--h3:#ff8fc7;--h4:#ffc24d;--h5:#b18cff;--h6:#4dd8e6;}' +
      // A drop-down's open list is drawn from the OPTIONS' colours; left
      // unset, Windows took the see-through field colour and showed light
      // text on white. Solid theme colours — every page, every theme.
      'select option,select optgroup{background-color:var(--chrome);color:var(--on-brand);}' +
      'select option:disabled{color:var(--on-brand-dim);}';
    styleEl.textContent = css;
    document.documentElement.setAttribute('data-theme', THEMES[name] ? name : DEFAULT);
    document.documentElement.setAttribute('data-mode', t.mode === 'light' ? 'light' : 'dark');
    // Top-level window only: recolour the native minimise/maximise/close
    // buttons to sit on this theme's title strip.
    try {
      if (window.top === window && window.statusApp && window.statusApp.setTitleBarColors) {
        window.statusApp.setTitleBarColors(t['overlay-color'], t['overlay-symbol']);
      }
    } catch (e) { /* not available on this page */ }
  }

  apply(read());
  window.addEventListener('storage', function (e) { if (e.key === KEY) apply(read()); });
  window.addEventListener('message', function (e) {
    var m = e.data;
    if (m && m.__statusApp && m.type === 'theme' && THEMES[m.name]) apply(m.name);
  });

  window.__theme = {
    list: function () {
      return Object.keys(THEMES).map(function (k) {
        return { id: k, label: THEMES[k].label, hint: THEMES[k].hint, brand: THEMES[k].brand, accent: THEMES[k].gold, surface: THEMES[k].surface, mode: THEMES[k].mode };
      });
    },
    current: read,
    set: function (name) {
      if (!THEMES[name]) return;
      try { localStorage.setItem(KEY, name); } catch (e) { /* private/locked profile — still applies to this page */ }
      apply(name);
      // The 'storage' event only reaches OTHER pages; tell the shell too,
      // which re-broadcasts to every embedded screen (belt and braces).
      try { if (window.parent !== window) window.parent.postMessage({ __statusApp: true, type: 'theme', name: name }, '*'); } catch (e) { /* ignore */ }
    },
    apply: apply,
  };
})();
