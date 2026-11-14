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
      text: '#1c3a2f', 'text-dim': '#68635e',
      'on-brand': '#f3ede0', 'on-brand-dim': '#b9ab86', muted: '#8b9a90',
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
      text: '#0d2840', 'text-dim': '#586879',
      'on-brand': '#eaf4fd', 'on-brand-dim': '#8fb4d6', muted: '#7d95ab',
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
      text: '#3a1426', 'text-dim': '#7d5f5a',
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
      text: '#1f1147', 'text-dim': '#665d80',
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
      text: '#3b0d2c', 'text-dim': '#7d576b',
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
      text: '#06363e', 'text-dim': '#4e6d6e',
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
      text: '#1f2328', 'text-dim': '#606773',
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
      'on-brand': '#1d2433', 'on-brand-dim': '#5f6b85', muted: '#686e7e',
      gold: '#118452', 'gold-bright': '#0d7447', 'on-gold': '#ffffff', 'accent-soft': 'rgba(17,132,82,0.12)', // 1.9: deeper, so white text on it reads well (it's the default now)
      mode: 'light', 'page-bg': '#f4f6fb',
      'card-bg': '#ffffff', 'card-bg-2': '#f8f9fd', 'card-border': '#e7eaf3', 'card-shadow': '0 8px 24px rgba(30,45,90,0.08)',
      'card-text': '#1d2433', 'card-text-dim': '#5f6b85',
      'input-bg': '#ffffff', 'input-border': '#d9deea', 'input-text': '#1d2433',
      'accent-grad': 'linear-gradient(135deg, #139158, #0e7d4d)', 'on-accent': '#ffffff', 'accent-glow': '0 6px 16px rgba(17,132,82,0.30)',
      'strip-bg': 'linear-gradient(90deg, #12372b, #1f5a45)', 'strip-text': '#ffffff', 'overlay-color': '#1f5a45', 'overlay-symbol': '#ffffff',
    },
    cloud: {
      label: 'Cloud', hint: 'Soft grey-blue light with blue accents',
      brand: '#eef2f8', 'brand-hover': '#e2e8f2', chrome: '#ffffff',
      surface: '#ffffff', 'surface-hover': '#f3f6fb', 'tile-hover': '#ffffff',
      chip: '#e8eef8', 'chip-hover': '#dbe4f3', border: '#dbe3ef',
      text: '#172033', 'text-dim': '#56637a',
      'on-brand': '#172033', 'on-brand-dim': '#56637a', muted: '#646c7c',
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
      'on-brand': '#2b2118', 'on-brand-dim': '#6f6254', muted: '#776b5e',
      gold: '#c2410c', 'gold-bright': '#af3a0b', 'on-gold': '#ffffff', 'accent-soft': 'rgba(194,65,12,0.12)',
      mode: 'light', 'page-bg': 'linear-gradient(180deg, #f8f4ec, #f0e9dd)',
      'card-bg': '#fffdf9', 'card-bg-2': '#faf6ef', 'card-border': '#ebe2d3', 'card-shadow': '0 8px 24px rgba(60,40,20,0.08)',
      'card-text': '#2b2118', 'card-text-dim': '#6f6254',
      'input-bg': '#ffffff', 'input-border': '#ddd1bf', 'input-text': '#2b2118',
      'accent-grad': 'linear-gradient(135deg, #f97316, #c2410c)', 'on-accent': '#ffffff', 'accent-glow': '0 6px 16px rgba(194,65,12,0.25)',
      'strip-bg': 'linear-gradient(90deg, #3b2a1d, #5a3e28)', 'strip-text': '#ffffff', 'overlay-color': '#5a3e28', 'overlay-symbol': '#ffffff'
    },
    // 1.9: four more light themes.
    mint: {
      label: 'Mint', hint: 'Fresh mint white with deep green accents', 'brand': '#eef8f4', 'brand-hover': '#e1f2ea', 'chrome': '#ffffff', 'surface': '#ffffff', 'surface-hover': '#f2faf6', 'tile-hover': '#ffffff', 'chip': '#e3f4ec', 'chip-hover': '#d4ede1', 'border': '#d5eadf', 'text': '#123b2f', 'text-dim': '#4e6b61', 'on-brand': '#123b2f', 'on-brand-dim': '#4e6b61', 'muted': '#61736b', 'gold': '#0f7f63', 'gold-bright': '#0b6e55', 'on-gold': '#ffffff', 'accent-soft': 'rgba(15,127,99,0.12)', mode: 'light', 'page-bg': 'linear-gradient(180deg, #f1faf6, #e4f3ec)', 'card-bg': '#ffffff', 'card-bg-2': '#f5fbf8', 'card-border': '#dcefe6', 'card-shadow': '0 8px 24px rgba(18,59,47,0.08)', 'card-text': '#123b2f', 'card-text-dim': '#4e6b61', 'input-bg': '#ffffff', 'input-border': '#c9e2d6', 'input-text': '#123b2f', 'accent-grad': 'linear-gradient(135deg, #14b48a, #0b6e55)', 'on-accent': '#ffffff', 'accent-glow': '0 6px 16px rgba(15,127,99,0.26)', 'strip-bg': 'linear-gradient(90deg, #0c4a3b, #13715a)', 'overlay-color': '#13715a', 'strip-text': '#ffffff', 'overlay-symbol': '#ffffff'
    },
    blossom: {
      label: 'Blossom', hint: 'Soft blush white with rose accents', 'brand': '#fbf1f4', 'brand-hover': '#f6e3ea', 'chrome': '#ffffff', 'surface': '#ffffff', 'surface-hover': '#fdf4f7', 'tile-hover': '#ffffff', 'chip': '#f8e6ed', 'chip-hover': '#f2d6e1', 'border': '#f0dbe4', 'text': '#3d1426', 'text-dim': '#7a5464', 'on-brand': '#3d1426', 'on-brand-dim': '#7a5464', 'muted': '#826671', 'gold': '#c2185b', 'gold-bright': '#ad1457', 'on-gold': '#ffffff', 'accent-soft': 'rgba(194,24,91,0.10)', mode: 'light', 'page-bg': 'linear-gradient(180deg, #fdf5f8, #f8e9ef)', 'card-bg': '#ffffff', 'card-bg-2': '#fdf7f9', 'card-border': '#f3dfe7', 'card-shadow': '0 8px 24px rgba(61,20,38,0.08)', 'card-text': '#3d1426', 'card-text-dim': '#7a5464', 'input-bg': '#ffffff', 'input-border': '#ebcfdb', 'input-text': '#3d1426', 'accent-grad': 'linear-gradient(135deg, #ec4899, #be185d)', 'on-accent': '#ffffff', 'accent-glow': '0 6px 16px rgba(194,24,91,0.25)', 'strip-bg': 'linear-gradient(90deg, #5c1631, #8e2450)', 'overlay-color': '#8e2450', 'strip-text': '#ffffff', 'overlay-symbol': '#ffffff'
    },
    lilac: {
      label: 'Lilac', hint: 'Pale lavender with violet accents', 'brand': '#f4f2fc', 'brand-hover': '#e9e5f8', 'chrome': '#ffffff', 'surface': '#ffffff', 'surface-hover': '#f7f5fd', 'tile-hover': '#ffffff', 'chip': '#ece8fa', 'chip-hover': '#dfd8f5', 'border': '#e2ddf3', 'text': '#231a45', 'text-dim': '#5f5880', 'on-brand': '#231a45', 'on-brand-dim': '#5f5880', 'muted': '#706b84', 'gold': '#6d3fd6', 'gold-bright': '#5b30c2', 'on-gold': '#ffffff', 'accent-soft': 'rgba(109,63,214,0.11)', mode: 'light', 'page-bg': 'linear-gradient(180deg, #f6f4fd, #ece8f9)', 'card-bg': '#ffffff', 'card-bg-2': '#f8f7fd', 'card-border': '#e6e1f5', 'card-shadow': '0 8px 24px rgba(35,26,69,0.08)', 'card-text': '#231a45', 'card-text-dim': '#5f5880', 'input-bg': '#ffffff', 'input-border': '#d6cfee', 'input-text': '#231a45', 'accent-grad': 'linear-gradient(135deg, #8b5cf6, #5b30c2)', 'on-accent': '#ffffff', 'accent-glow': '0 6px 16px rgba(109,63,214,0.26)', 'strip-bg': 'linear-gradient(90deg, #2e1f66, #4a33a0)', 'overlay-color': '#4a33a0', 'strip-text': '#ffffff', 'overlay-symbol': '#ffffff'
    },
    paper: {
      label: 'Paper', hint: 'Plain white and grey, black accents — no colour', 'brand': '#f5f5f4', 'brand-hover': '#ebebea', 'chrome': '#ffffff', 'surface': '#ffffff', 'surface-hover': '#f7f7f6', 'tile-hover': '#ffffff', 'chip': '#eeeeec', 'chip-hover': '#e3e3e0', 'border': '#e2e2df', 'text': '#1c1c1a', 'text-dim': '#5f5f5a', 'on-brand': '#1c1c1a', 'on-brand-dim': '#5f5f5a', 'muted': '#6f6f6a', 'gold': '#1c1c1a', 'gold-bright': '#000000', 'on-gold': '#ffffff', 'accent-soft': 'rgba(28,28,26,0.08)', mode: 'light', 'page-bg': '#f5f5f4', 'card-bg': '#ffffff', 'card-bg-2': '#fafaf9', 'card-border': '#e7e7e4', 'card-shadow': '0 8px 24px rgba(0,0,0,0.06)', 'card-text': '#1c1c1a', 'card-text-dim': '#5f5f5a', 'input-bg': '#ffffff', 'input-border': '#d6d6d2', 'input-text': '#1c1c1a', 'accent-grad': 'linear-gradient(135deg, #3a3a36, #111110)', 'on-accent': '#ffffff', 'accent-glow': '0 6px 16px rgba(0,0,0,0.18)', 'strip-bg': 'linear-gradient(90deg, #1c1c1a, #3a3a36)', 'overlay-color': '#3a3a36', 'strip-text': '#ffffff', 'overlay-symbol': '#ffffff'
    },
    // 1.10.5: four Gen Z looks.
    lofi: {
      label: 'Lo-fi', hint: 'Soft lavender and peach, study-playlist mood',
      brand: '#f5efff', 'brand-hover': '#ebe1fb', chrome: '#ffffff',
      surface: '#ffffff', 'surface-hover': '#f8f3ff', 'tile-hover': '#ffffff',
      chip: '#eee6ff', 'chip-hover': '#e2d7f8', border: '#e4d9f7',
      text: '#2a1f4d', 'text-dim': '#5d527f',
      'on-brand': '#2a1f4d', 'on-brand-dim': '#5d527f', muted: '#6c6290',
      gold: '#6a47d9', 'gold-bright': '#5a39c4', 'on-gold': '#ffffff', 'accent-soft': 'rgba(106,71,217,0.12)',
      mode: 'light', 'page-bg': 'linear-gradient(160deg, #efe7ff, #ffe9dc)',
      'card-bg': '#ffffff', 'card-bg-2': '#fff3ea', 'card-border': '#eadff8', 'card-shadow': '0 8px 24px rgba(42,31,77,0.09)',
      'card-text': '#2a1f4d', 'card-text-dim': '#5d527f',
      'input-bg': '#ffffff', 'input-border': '#d9cdf0', 'input-text': '#2a1f4d',
      'accent-grad': 'linear-gradient(135deg, #8b6cf0, #5a39c4)', 'on-accent': '#ffffff', 'accent-glow': '0 6px 16px rgba(106,71,217,0.28)',
      'strip-bg': 'linear-gradient(90deg, #3a2a78, #6a47d9)', 'strip-text': '#ffffff', 'overlay-color': '#5a39c4', 'overlay-symbol': '#ffffff'
    },
    y2k: {
      label: 'Y2K', hint: 'Bubblegum pink and sky blue',
      brand: '#fdeefa', 'brand-hover': '#f9ddf3', chrome: '#ffffff',
      surface: '#ffffff', 'surface-hover': '#fff4fb', 'tile-hover': '#ffffff',
      chip: '#fbe3f5', 'chip-hover': '#f6d2ee', border: '#f1cde8',
      text: '#2b1740', 'text-dim': '#6a4f80',
      'on-brand': '#2b1740', 'on-brand-dim': '#6a4f80', muted: '#76608a',
      gold: '#a21fc4', 'gold-bright': '#8f17ad', 'on-gold': '#ffffff', 'accent-soft': 'rgba(162,31,196,0.12)',
      mode: 'light', 'page-bg': 'linear-gradient(160deg, #ffe3f5, #dff0ff)',
      'card-bg': '#ffffff', 'card-bg-2': '#fff7fc', 'card-border': '#f6d9ee', 'card-shadow': '0 8px 24px rgba(43,23,64,0.10)',
      'card-text': '#2b1740', 'card-text-dim': '#6a4f80',
      'input-bg': '#ffffff', 'input-border': '#e3c4dc', 'input-text': '#2b1740',
      'accent-grad': 'linear-gradient(135deg, #c8359f, #8f17ad)', 'on-accent': '#ffffff', 'accent-glow': '0 6px 16px rgba(162,31,196,0.28)',
      'strip-bg': 'linear-gradient(90deg, #5b1a7a, #a21fc4)', 'strip-text': '#ffffff', 'overlay-color': '#a21fc4', 'overlay-symbol': '#ffffff'
    },
    brat: {
      label: 'Brat', hint: 'Loud lime green with black outlines',
      brand: '#b7ee4a', 'brand-hover': '#a6dd35', chrome: '#f4ffd0',
      surface: '#f4ffd0', 'surface-hover': '#eaf9b5', 'tile-hover': '#fbffe6',
      chip: '#dff59a', 'chip-hover': '#d2ec7d', border: '#2a3a05',
      text: '#111111', 'text-dim': '#34430a',
      'on-brand': '#111111', 'on-brand-dim': '#34430a', muted: '#3b4a0c',
      gold: '#111111', 'gold-bright': '#000000', 'on-gold': '#8ace00', 'accent-soft': 'rgba(17,17,17,0.10)',
      mode: 'light', 'page-bg': '#8ace00',
      'card-bg': '#f4ffd0', 'card-bg-2': '#eaf9b5', 'card-border': '#111111', 'card-shadow': '4px 4px 0 #111111',
      'card-text': '#111111', 'card-text-dim': '#34430a',
      'input-bg': '#ffffff', 'input-border': '#111111', 'input-text': '#111111',
      'accent-grad': 'linear-gradient(135deg, #111111, #111111)', 'on-accent': '#8ace00', 'accent-glow': '3px 3px 0 rgba(17,17,17,0.45)',
      'strip-bg': '#111111', 'strip-text': '#c4f55a', 'overlay-color': '#111111', 'overlay-symbol': '#8ace00'
    },
    neon: {
      label: 'Neon night', hint: 'Dark with electric lime and pink',
      brand: '#14142a', 'brand-hover': '#1f1f3d', chrome: '#0c0c18',
      surface: '#f1f1ff', 'surface-hover': '#e6e6fb', 'tile-hover': '#f8f8ff',
      chip: '#e2e2f7', 'chip-hover': '#d6d6f2', border: '#cfcfee',
      text: '#17173a', 'text-dim': '#55557a',
      'on-brand': '#eeeeff', 'on-brand-dim': '#a9a9d6', muted: '#9a9ac8',
      gold: '#c6ff3d', 'gold-bright': '#d9ff7a', 'on-gold': '#14142a', 'accent-soft': 'rgba(198,255,61,0.16)',
      mode: 'dark', 'page-bg': 'radial-gradient(1200px 600px at 85% -10%, rgba(255,95,210,0.26), transparent 60%), radial-gradient(900px 500px at 10% 110%, rgba(198,255,61,0.16), transparent 60%), linear-gradient(160deg, #15152e, #090912 70%)',
      'card-bg': 'rgba(255,255,255,0.07)', 'card-bg-2': 'rgba(255,255,255,0.06)', 'card-border': 'rgba(255,255,255,0.13)', 'card-shadow': '0 10px 30px rgba(0,0,0,0.35)',
      'card-text': '#ffffff', 'card-text-dim': 'rgba(255,255,255,0.70)',
      'input-bg': 'rgba(255,255,255,0.09)', 'input-border': 'rgba(255,255,255,0.18)', 'input-text': '#ffffff',
      'accent-grad': 'linear-gradient(135deg, #c6ff3d, #7be000)', 'on-accent': '#0c1400', 'accent-glow': '0 6px 18px rgba(198,255,61,0.22)',
      'strip-bg': 'rgba(0,0,0,0.30)', 'strip-text': '#ffffff', 'overlay-color': '#090912', 'overlay-symbol': '#ffffff'
    },
  };
  var KEY = 'statusApp.theme';
  var DEFAULT = 'brat'; // 1.10.7: Brat unless the person picks another (Settings → Theme). 1.9–1.10.6 it was Light.

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
        // (and the window's own colour, so the next start opens in this theme — no flash of another)
        window.statusApp.setTitleBarColors(t['overlay-color'], t['overlay-symbol'], t.mode === 'light' ? t.brand : t.chrome);
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
