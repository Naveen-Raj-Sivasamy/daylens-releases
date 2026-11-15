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
    // 1.10.9: general knowledge, so the same few don't keep coming round
    ['Space', 'Light from the Sun takes about 8 minutes and 20 seconds to reach the Earth.'],
    ['Space', 'A day on Venus is longer than its year: it turns once in about 243 Earth days and goes round the Sun in about 225.'],
    ['Space', 'The Moon moves away from the Earth by about 3.8 centimetres every year.'],
    ['Space', 'Jupiter is so large that all the other planets of the solar system could fit inside it.'],
    ['Space', 'Chandrayaan-3 landed near the Moon\'s south pole on 23 August 2023, making India the first country to land there.'],
    ['Space', 'India\'s Mangalyaan reached Mars orbit in 2014 on its first attempt.'],
    ['Space', 'The International Space Station goes round the Earth about 16 times a day.'],
    ['Space', 'A light-year is a distance, not a time: how far light travels in one year, about 9.46 trillion kilometres.'],
    ['Space', 'Saturn\'s rings are made mostly of pieces of water ice, from grains to boulders.'],
    ['Space', 'The footprints left on the Moon can last for millions of years, because there is no wind or rain to wear them away.'],
    ['Space', 'Neptune takes about 165 Earth years to go round the Sun once.'],
    ['Space', 'The Sun holds about 99.8% of all the mass in the solar system.'],
    ['Space', 'Mars looks red because of iron oxide, which is rust, in its soil.'],
    ['Space', 'Olympus Mons on Mars is the tallest known volcano in the solar system, about two and a half times the height of Mount Everest.'],
    ['Space', 'Aryabhata, India\'s first satellite, was launched in 1975 and named after the 5th-century mathematician and astronomer.'],
    ['Science', 'Water is one of the few substances that expands when it freezes, which is why ice floats.'],
    ['Science', 'Sound travels about four times faster in water than in air.'],
    ['Science', 'Lightning is several times hotter than the surface of the Sun.'],
    ['Science', 'Diamond and the graphite in a pencil are both made only of carbon; the atoms are just arranged differently.'],
    ['Science', 'Honey kept sealed almost never spoils. Its low water content and acidity stop microbes from growing.'],
    ['Science', 'At sea level water boils at 100 °C, but on top of Mount Everest it boils at about 70 °C because the air pressure is lower.'],
    ['Science', 'Glass is made mainly from sand that is melted and then cooled.'],
    ['Science', 'A rainbow is a full circle. From the ground we usually see only the top half.'],
    ['Science', 'Helium is the second most common element in the universe, but it is scarce on Earth because it escapes into space.'],
    ['Science', 'Stainless steel resists rust because the chromium in it forms a thin protective layer.'],
    ['Science', 'Absolute zero, the lowest possible temperature, is −273.15 °C.'],
    ['Science', 'Sir C. V. Raman won the 1930 Nobel Prize in Physics for discovering how light changes when it scatters, now called the Raman effect.'],
    ['Science', 'The speed of light in a vacuum is about 299,792 kilometres per second.'],
    ['Science', 'DNA carries the instructions for building a living thing, written with just four chemical letters: A, T, G and C.'],
    ['Science', 'Photosynthesis lets plants make food from sunlight, water and carbon dioxide, and releases the oxygen we breathe.'],
    ['Human body', 'An adult human body has 206 bones. A baby is born with around 300, and many of them fuse as the child grows.'],
    ['Human body', 'The heart beats roughly 100,000 times a day.'],
    ['Human body', 'The smallest bone in the body is the stapes, in the middle ear. It is about 3 millimetres long.'],
    ['Human body', 'Your fingerprints are unique. Even identical twins have different ones.'],
    ['Human body', 'The skin is the body\'s largest organ.'],
    ['Human body', 'Tooth enamel is the hardest substance in the human body.'],
    ['Human body', 'The brain uses about a fifth of the body\'s energy while making up only about 2% of its weight.'],
    ['Human body', 'Red blood cells live for about 120 days before the body replaces them.'],
    ['Nature', 'An octopus has three hearts and blue blood.'],
    ['Nature', 'A group of flamingos is called a flamboyance.'],
    ['Nature', 'Bamboo is a grass, and some kinds can grow nearly a metre in a single day.'],
    ['Nature', 'The blue whale is the largest animal alive today, and one of the largest known to have ever lived.'],
    ['Nature', 'Bees tell each other where flowers are with a waggle dance.'],
    ['Nature', 'A cheetah can reach about 100 km/h, but only in short bursts.'],
    ['Nature', 'Bananas are botanically berries, while strawberries are not.'],
    ['Nature', 'The banyan is India\'s national tree. One tree can spread wide enough to look like a small forest.'],
    ['Nature', 'A hummingbird can fly backwards.'],
    ['Nature', 'Sharks existed before trees: sharks are over 400 million years old, trees about 350 million.'],
    ['Nature', 'An ostrich egg is the largest egg laid by any living bird.'],
    ['Nature', 'The peacock is India\'s national bird and the Bengal tiger is its national animal.'],
    ['Nature', 'Coral reefs cover under 1% of the ocean floor but are home to about a quarter of all sea species.'],
    ['Geography', 'Mount Everest is the highest mountain above sea level, at 8,849 metres.'],
    ['Geography', 'The Pacific is the largest ocean. It covers more area than all the land on Earth put together.'],
    ['Geography', 'The Nile and the Amazon are the two longest rivers in the world; which one is longer is still debated.'],
    ['Geography', 'Russia spans 11 time zones.'],
    ['Geography', 'India has one time zone, Indian Standard Time, which is 5 hours 30 minutes ahead of UTC.'],
    ['Geography', 'The Sahara is the largest hot desert; Antarctica is the largest desert of all, because it gets so little rain or snow.'],
    ['Geography', 'The Dead Sea shore is the lowest land on Earth, more than 400 metres below sea level.'],
    ['Geography', 'Canada has the longest coastline of any country.'],
    ['Geography', 'Vatican City is the smallest country in the world, at about 0.44 square kilometres.'],
    ['Geography', 'The Mariana Trench in the Pacific is the deepest part of the ocean, nearly 11 kilometres down.'],
    ['Geography', 'Mawsynram in Meghalaya is among the wettest places on Earth.'],
    ['Geography', 'The Ganga is India\'s longest river, about 2,500 kilometres from the Himalayas to the Bay of Bengal.'],
    ['Geography', 'The Thar Desert, mostly in Rajasthan, is also called the Great Indian Desert.'],
    ['Geography', 'Kanyakumari is the southern tip of mainland India, where the Arabian Sea, the Bay of Bengal and the Indian Ocean meet.'],
    ['Geography', 'The Marina in Chennai is one of the longest urban beaches in the world.'],
    ['India', 'India\'s Constitution came into effect on 26 January 1950, which is why that day is Republic Day.'],
    ['India', 'India\'s national anthem, Jana Gana Mana, was written by Rabindranath Tagore.'],
    ['India', 'The Indian rupee symbol ₹ was adopted in 2010. It blends the Devanagari letter Ra with the Roman R.'],
    ['India', 'Chess is widely believed to have grown out of chaturanga, a game played in India around the 6th century.'],
    ['India', 'The wheel in the centre of the Indian flag, the Ashoka Chakra, has 24 spokes.'],
    ['India', 'Tamil is one of the world\'s oldest living languages and was the first to be declared a classical language of India, in 2004.'],
    ['India', 'The Brihadisvara Temple in Thanjavur was completed around 1010 CE under Rajaraja Chola I.'],
    ['India', 'The Kallanai (Grand Anicut) on the Kaveri, built in Chola times, is one of the oldest water-diversion structures still in use.'],
    ['India', 'Indian Railways is one of the largest railway networks in the world.'],
    ['India', 'The Tirukkural by Thiruvalluvar has 1,330 couplets on virtue, wealth and love.'],
    ['India', 'India\'s first general election ran from October 1951 to February 1952.'],
    ['India', 'Hockey gave India eight Olympic gold medals between 1928 and 1980.'],
    ['History', 'The Indus Valley cities of Harappa and Mohenjo-daro had planned streets and covered drains more than 4,000 years ago.'],
    ['History', 'Paper was invented in China about 2,000 years ago.'],
    ['History', 'Gutenberg\'s printing press, built around 1440, made books far cheaper to produce in Europe.'],
    ['History', 'The Great Wall of China was built in sections over many centuries, not all at once.'],
    ['History', 'The first modern Olympic Games were held in Athens in 1896.'],
    ['History', 'The Wright brothers\' first powered flight in 1903 lasted 12 seconds.'],
    ['History', 'The first email was sent by Ray Tomlinson in 1971. He also chose the @ sign for addresses.'],
    ['History', 'Tim Berners-Lee proposed the World Wide Web in 1989 while working at CERN.'],
    ['History', 'The first text message, sent in 1992, said "Merry Christmas".'],
    ['History', 'Ada Lovelace wrote what is often called the first computer program, in the 1840s, for a machine that was never finished.'],
    ['History', 'The QWERTY keyboard layout dates from typewriters of the 1870s.'],
    ['History', 'ENIAC, an early electronic computer finished in 1945, weighed about 27 tonnes.'],
    ['Maths', 'Zero as a number with its own rules was described by the Indian mathematician Brahmagupta in 628 CE.'],
    ['Maths', 'Pi has been calculated to trillions of digits, and no repeating pattern has ever been found.'],
    ['Maths', 'A googol is 1 followed by 100 zeros. The name Google comes from it.'],
    ['Maths', '1729 is the Hardy–Ramanujan number: the smallest number that is the sum of two cubes in two different ways.'],
    ['Maths', 'There are more ways to shuffle a deck of 52 cards than there are atoms on Earth.'],
    ['Maths', 'In a room of just 23 people there is about a 50% chance that two share a birthday.'],
    ['Maths', 'A prime number can be divided only by 1 and itself. 2 is the only even prime.'],
    ['Maths', 'The Fibonacci sequence (1, 1, 2, 3, 5, 8…) shows up in the spirals of sunflowers and pine cones.'],
    ['Maths', 'Roman numerals have no symbol for zero.'],
    ['Maths', 'The decimal place-value system used worldwide today was developed in India.'],
    ['Language', '"The quick brown fox jumps over the lazy dog" uses every letter of the English alphabet.'],
    ['Language', 'The dot over a small i or j is called a tittle.'],
    ['Language', 'The word "robot" comes from a Czech word for forced labour, first used in a 1920 play.'],
    ['Language', 'The ampersand (&) began as the Latin word "et", meaning "and", written as one joined shape.'],
    ['Language', '"Emoji" comes from Japanese: e (picture) and moji (character). It is unrelated to the word emotion.'],
    ['Language', 'The word "bug" for a fault in a machine was already used by engineers in the 1870s, including Thomas Edison.'],
    ['Language', 'A pangram uses every letter of the alphabet; a palindrome, like "level", reads the same backwards.'],
    ['Language', 'English words taken from Tamil include catamaran, curry and mango.'],
    ['Tech', 'The first computer mouse, shown in 1968, was made of wood.'],
    ['Tech', 'A byte is 8 bits. A kilobyte was traditionally 1,024 bytes, because computers count in powers of two.'],
    ['Tech', 'Wi-Fi does not stand for anything. It was a brand name chosen because it sounded like hi-fi.'],
    ['Tech', 'Bluetooth is named after Harald Bluetooth, a 10th-century king who united parts of Denmark and Norway.'],
    ['Tech', 'The first webcam watched a coffee pot at the University of Cambridge, so people could check whether it was empty.'],
    ['Tech', 'CAPTCHA stands for Completely Automated Public Turing test to tell Computers and Humans Apart.'],
    ['Tech', 'The first 1 GB hard drive, sold in 1980, weighed about 250 kilograms.'],
    ['Tech', 'QR codes were invented in Japan in 1994 to track car parts.'],
    ['Tech', 'USB was designed so that one kind of plug could replace many different connectors.'],
    ['Tech', 'Linux was started in 1991 by Linus Torvalds, then a student in Finland.'],
    ['Tech', 'The first domain name ever registered was symbolics.com, in 1985.'],
    ['Tech', 'GPS works by timing signals from satellites. Your phone needs at least four of them to fix a position.'],
    ['Tech', 'UPI, launched in India in 2016, lets money move between bank accounts instantly from a phone.'],
    ['Tech', 'A pixel is one dot of a picture. A 4K screen has more than 8 million of them.'],
    ['Tech', 'JavaScript was created in about ten days in 1995.'],
    ['Tech', 'Python is named after the comedy group Monty Python, not the snake.'],
    ['Work', 'The Pomodoro technique: work for 25 minutes, rest for 5, and take a longer break after four rounds.'],
    ['Work', 'The two-minute rule: if a task takes less than two minutes, do it now instead of writing it down.'],
    ['Work', 'Parkinson\'s law says work expands to fill the time available for it.'],
    ['Work', 'The Pareto principle suggests that about 80% of results often come from 20% of the effort.'],
    ['Work', 'A stand-up meeting is kept short on purpose: what was done, what is next, and what is in the way.'],
    ['Work', 'Kanban means "signboard" in Japanese. It began at Toyota as a way to show work in progress.'],
    ['Work', 'Writing down tomorrow\'s top three tasks before you stop for the day makes the next morning easier to start.'],
    ['Work', 'An Eisenhower matrix sorts tasks by two questions: is it urgent, and is it important?'],
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

  function factKey(t) { var h = 5381; t = String(t); for (var i = 0; i < t.length; i++) h = ((h << 5) + h + t.charCodeAt(i)) | 0; return (h >>> 0).toString(36); }
  function loadSeen() {
    try { var j = JSON.parse(localStorage.getItem('dl-facts-seen') || '[]'); if (Array.isArray(j)) seen = j.filter(function (x) { return typeof x === 'string'; }).slice(-600); } catch (e) { /* private window, or storage blocked: remembered for this screen only */ }
  }
  function saveSeen() {
    try { localStorage.setItem('dl-facts-seen', JSON.stringify(seen.slice(-600))); } catch (e) { /* ignore */ }
  }
  function pickFact() {
    var pool = [];
    remote.forEach(function (f) { pool.push({ topic: f.topic || (f.news ? 'News' : 'Tech'), text: f.text, news: f.news, asof: f.asof }); });
    BUILT_IN.forEach(function (f) { pool.push({ topic: f[0], text: f[1], news: false, asof: '' }); });
    // 1.10.9: what has been shown is remembered on this computer (and shared by every Daylens screen), so a fact
    // doesn't come back until all the others have had their turn, even after closing and reopening Daylens.
    loadSeen();
    var fresh = pool.filter(function (f) { return seen.indexOf(factKey(f.text)) < 0; });
    if (!fresh.length) { seen = []; fresh = pool; }
    // news first now and then, so fresh items aren't buried under the built-in list
    var news = fresh.filter(function (f) { return f.news; });
    var from = news.length && Math.random() < 0.35 ? news : fresh;
    var f = from[Math.floor(Math.random() * from.length)];
    seen.push(factKey(f.text));
    saveSeen();
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
