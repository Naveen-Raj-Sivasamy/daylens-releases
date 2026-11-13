// Saving feels like nothing happening — so say so (1.10.1).
//
// While a Save, Add or Delete waits for the Sheet, a small "Saving…" note
// appears in the corner at once (after a third of a second, so quick saves
// stay quiet). If the wait goes past two seconds, a "Did you know?" card joins
// it with a fact about AI and IT, so the wait has something in it. It never
// blocks anything, can be skipped, and can be switched off in Settings.
//
// The list below never goes out of date. Fresher facts come from the Daylens
// website once a day (main.js: get-facts); a news item carries its date and
// leaves the app after 45 days.
(function () {
  if (window.__dlBusy || !window.statusApp || !window.statusApp.onBusy) return;
  window.__dlBusy = true;
  var SHOW_NOTE_MS = 350, SHOW_FACT_MS = 2000, LINGER_MS = 3000;
  var EMOJI = ['🤔', '💡', '🧠', '📚', '🎓', '🔬', '🚀', '🤖'], emojiTimer = null;

  var BUILT_IN = [
    ['AI', 'A token is a small chunk of text, often part of a word, that an AI language model reads and writes. A long word can be several tokens.'],
    ['AI', 'A context window is how much text an AI model can look at at once. It is the model\'s working memory for one conversation.'],
    ['AI', 'A hallucination is when an AI states something false with confidence. That is why Daylens asks you to confirm before anything is saved.'],
    ['AI', 'RAG (retrieval-augmented generation) lets an AI look up your documents first, then answer from what it found.'],
    ['AI', 'A prompt is the instruction you give an AI. Saying who the answer is for and what format you want usually gives a better result.'],
    ['AI', 'Machine learning finds patterns in examples instead of following rules a person wrote by hand.'],
    ['AI', 'A large language model learns by predicting the next word across huge amounts of text. Chat assistants are then tuned to follow instructions.'],
    ['AI', 'Multimodal AI can work with more than text: images, audio and sometimes video.'],
    ['AI', 'An AI agent is an assistant that can take steps with tools, such as searching, editing files or calling apps, instead of only answering in text.'],
    ['AI', 'MCP (Model Context Protocol) is an open standard that lets AI assistants connect to apps and data in one common way.'],
    ['AI', 'Fine-tuning gives an existing AI model extra training on a narrow set of examples so it does one job better.'],
    ['Web', 'An API is a menu a program offers to other programs: you ask in a fixed format and it answers in a fixed format.'],
    ['Web', 'A webhook is a web address another program calls when something happens, like a message arriving in a Teams channel.'],
    ['Web', 'A CDN keeps copies of a site\'s files in many cities, so a page loads from somewhere close to the visitor.'],
    ['Web', 'Caching keeps a copy of something slow to fetch so the next request is instant. Daylens does it with your tabs and lists.'],
    ['Web', 'HTTPS encrypts the connection between your browser and a site, so people on the same Wi-Fi can\'t read it.'],
    ['Web', 'WCAG is the web accessibility standard: enough colour contrast, everything usable from the keyboard, and labels a screen reader can read.'],
    ['Web', 'Responsive design lets one page work on a phone, a tablet and a desktop by letting its layout flex.'],
    ['Web', 'Unicode gives every character in every language its own number, which is why Tamil text and emoji can share one page.'],
    ['CMS', 'A CMS separates what a page says from how it looks, so editors can update content without touching code. Drupal and Sitecore are both CMSs.'],
    ['CMS', 'A headless CMS stores content and serves it through an API, so any site or app can show it.'],
    ['CMS', 'Open source means anyone can read, use and improve the code. Linux, Firefox and Drupal are examples.'],
    ['Security', 'Two-factor sign-in means a stolen password alone is not enough to get into an account.'],
    ['Security', 'A password manager makes a different long password for every site, so one leak can\'t open your other accounts.'],
    ['Security', 'A phishing email pretends to be someone you trust. Check the sender\'s real address before you click.'],
    ['Security', 'Zero trust assumes nobody is trusted just for being inside the network: every request is checked.'],
    ['Security', 'Single sign-on lets one login open many work apps, and lets an admin switch off one account in one place.'],
    ['Engineering', 'Git stores every change as a snapshot, so you can go back to any earlier version of a project.'],
    ['Engineering', 'Semantic versioning numbers releases as major.minor.patch. 1.10.1 means a small fix on the 1.10 line.'],
    ['Engineering', 'Idempotent means doing something twice has the same effect as once. Daylens uses it so a retried save never adds a second row.'],
    ['Engineering', 'Rate limits cap how many requests a service accepts, so one busy user can\'t slow it down for everyone.'],
    ['Engineering', 'Observability means telling what a system is doing from the logs, metrics and traces it produces.'],
    ['Engineering', 'Low-code tools let people build apps mostly by setting up blocks and rules, with code only where it is needed.'],
    ['Infrastructure', 'The cloud is other people\'s computers, in large data centres, rented by the hour.'],
    ['Infrastructure', 'Latency is the delay before something responds; bandwidth is how much can flow at once. A fast connection can still feel slow when latency is high.'],
    ['Infrastructure', 'The 3-2-1 backup rule: three copies, on two kinds of storage, with one kept somewhere else.'],
    ['Infrastructure', 'Edge computing does work close to where the data is created instead of in a far-away data centre.'],
    ['Infrastructure', 'Quantum computers use qubits, which can hold combinations of 0 and 1. They help with some problems, not every program.'],
    ['History', 'In 1947 a moth was found stuck in a relay of the Harvard Mark II computer, and the log called it the first actual case of a bug being found.'],
  ];

  var box = null, noteEl = null, factEl = null, noteTimer = null, factTimer = null, hideTimer = null;
  var pending = 0, enabled = true, remote = [], seen = [];
  var reduce = false;
  try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { /* older engine */ }

  function css() {
    if (document.getElementById('dl-busy-css')) return;
    var st = document.createElement('style');
    st.id = 'dl-busy-css';
    st.textContent =
      '#dl-busy{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:16px;pointer-events:none;font:inherit}' +
      '#dl-busy.has-fact{background:rgba(8,16,12,.38)}' +
      '#dl-busy .dl-note{position:absolute;right:16px;bottom:16px;background:var(--brand,#12372a);color:var(--on-brand,#fff);border-radius:999px;padding:7px 14px;font-size:12.5px;font-weight:700;display:flex;align-items:center;gap:8px;box-shadow:0 6px 18px rgba(0,0,0,.25)}' +
      '#dl-busy .dl-spin{width:12px;height:12px;border-radius:50%;border:2px solid currentColor;border-right-color:transparent;animation:dl-spin .8s linear infinite}' +
      '#dl-busy .dl-fact{pointer-events:auto;width:min(470px,100%);text-align:center;background:var(--brand,#12372a);color:var(--on-brand,#fff);border-radius:24px;padding:22px 26px 20px;box-shadow:0 18px 48px rgba(0,0,0,.4)}' +
      '#dl-busy .dl-emoji{display:block;font-size:64px;line-height:1.1;margin:0 0 6px;animation:dl-bob 1.1s ease-in-out infinite}' +
      '#dl-busy .dl-fact .dl-top{font-size:13px;font-weight:800;margin:0 0 8px}' +
      '#dl-busy .dl-fact .dl-text{font-size:17px;line-height:1.5;margin:0;font-weight:600}' +
      '#dl-busy .dl-fact .dl-saving{display:flex;align-items:center;justify-content:center;gap:8px;margin:14px 0 0;font-size:12.5px;font-weight:700;opacity:.95}' +
      '#dl-busy .dl-fact .dl-acts{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;justify-content:center}' +
      '#dl-busy .dl-fact button{background:transparent;color:inherit;border:0;box-shadow:inset 0 0 0 1.5px currentColor;border-radius:8px;padding:5px 10px;font:inherit;font-size:12px;font-weight:700;cursor:pointer}' +
      '#dl-busy .dl-fact button:focus-visible{outline:2px solid currentColor;outline-offset:2px}' +
      '#dl-busy .dl-fact{animation:dl-in .25s ease-out}' +
      '@keyframes dl-spin{to{transform:rotate(360deg)}}@keyframes dl-in{from{opacity:0;transform:translateY(8px) scale(.97)}to{opacity:1;transform:none}}@keyframes dl-bob{0%,100%{transform:translateY(0) rotate(-4deg)}50%{transform:translateY(-10px) rotate(4deg)}}' +
      '@media (prefers-reduced-motion:reduce){#dl-busy .dl-spin,#dl-busy .dl-fact,#dl-busy .dl-emoji{animation:none}}';
    document.head.appendChild(st);
  }

  function ensureBox() {
    if (box && box.isConnected) return;
    css();
    box = document.createElement('div');
    box.id = 'dl-busy';
    noteEl = document.createElement('div');
    noteEl.className = 'dl-note';
    noteEl.setAttribute('role', 'status');
    noteEl.innerHTML = '<span class="dl-spin" aria-hidden="true"></span><span>Saving…</span>';
    box.appendChild(noteEl);
    document.body.appendChild(box);
  }

  function pickFact() {
    var pool = [];
    remote.forEach(function (f) { pool.push({ topic: f.topic || (f.news ? 'News' : 'Tech'), text: f.text, news: f.news, asof: f.asof }); });
    BUILT_IN.forEach(function (f) { pool.push({ topic: f[0], text: f[1], news: false, asof: '' }); });
    var fresh = pool.filter(function (f) { return seen.indexOf(f.text) < 0; });
    if (!fresh.length) { seen = []; fresh = pool; }
    var f = fresh[Math.floor(Math.random() * fresh.length)];
    seen.push(f.text);
    return f;
  }

  function showFact() {
    if (!enabled || !pending || !box || (factEl && factEl.isConnected)) return;
    var f = pickFact();
    var when = '';
    if (f.news && f.asof) { var d = new Date(f.asof + 'T00:00:00Z'); if (!isNaN(d)) when = ' · as of ' + d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }); }
    factEl = document.createElement('div');
    factEl.className = 'dl-fact';
    factEl.setAttribute('role', 'complementary');
    factEl.setAttribute('aria-label', 'A fact while you wait');
    var em = document.createElement('span'); em.className = 'dl-emoji'; em.setAttribute('aria-hidden', 'true'); em.textContent = EMOJI[0];
    var ei = 0;
    emojiTimer = setInterval(function () { ei = (ei + 1) % EMOJI.length; em.textContent = EMOJI[ei]; }, 1300);
    var top = document.createElement('p'); top.className = 'dl-top'; top.textContent = 'Did you know? ' + f.topic + when;
    var tx = document.createElement('p'); tx.className = 'dl-text'; tx.textContent = f.text;
    var acts = document.createElement('div'); acts.className = 'dl-acts';
    var skip = document.createElement('button'); skip.type = 'button'; skip.textContent = 'Skip';
    skip.onclick = function () { removeFact(); };
    var off = document.createElement('button'); off.type = 'button'; off.textContent = 'Stop showing these';
    off.onclick = function () { enabled = false; removeFact(); try { window.statusApp.setFactsOn(false); } catch (e) { /* ignore */ } };
    acts.appendChild(skip); acts.appendChild(off);
    var sv = document.createElement('p'); sv.className = 'dl-saving'; sv.innerHTML = '<span class="dl-spin" aria-hidden="true"></span><span>Still saving…</span>';
    factEl.appendChild(em); factEl.appendChild(top); factEl.appendChild(tx); factEl.appendChild(sv); factEl.appendChild(acts);
    box.classList.add('has-fact');
    if (noteEl) noteEl.style.display = 'none'; // the card says it
    box.insertBefore(factEl, noteEl);
  }
  function removeFact() { clearInterval(emojiTimer); emojiTimer = null; if (factEl && factEl.parentNode) factEl.parentNode.removeChild(factEl); factEl = null; if (box) box.classList.remove('has-fact'); if (noteEl && pending) noteEl.style.display = ''; }

  function teardown() {
    clearTimeout(noteTimer); clearTimeout(factTimer); clearTimeout(hideTimer);
    noteTimer = factTimer = hideTimer = null;
    removeFact();
    if (box && box.parentNode) box.parentNode.removeChild(box);
    box = noteEl = null;
  }

  function loadFacts() {
    try {
      window.statusApp.getFacts().then(function (r) { if (r) { enabled = r.on !== false; remote = Array.isArray(r.items) ? r.items : []; } }, function () { /* built-in only */ });
    } catch (e) { /* built-in only */ }
  }

  window.statusApp.onBusy(function (n) {
    var was = pending;
    pending = n;
    if (n > 0 && was === 0) {
      clearTimeout(hideTimer); hideTimer = null;
      loadFacts();
      noteTimer = setTimeout(function () { if (pending) ensureBox(); }, SHOW_NOTE_MS);
      factTimer = setTimeout(function () { if (pending) { ensureBox(); showFact(); } }, SHOW_FACT_MS);
    } else if (n === 0 && was > 0) {
      clearTimeout(noteTimer); clearTimeout(factTimer);
      if (factEl && factEl.isConnected) {
        // a fact is up: let it be read, then go
        if (noteEl) noteEl.style.display = 'none';
        hideTimer = setTimeout(teardown, LINGER_MS);
      } else teardown();
    }
  });
  // For tests and for Settings: what the card would draw from.
  window.__dlBusyInfo = function () { return { builtIn: BUILT_IN.length, remote: remote.length, enabled: enabled }; };
})();
