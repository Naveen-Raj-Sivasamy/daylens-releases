// Builds docs/facts.json: the short "Did you know?" news items Daylens shows
// while a save is waiting. Run daily by .github/workflows/facts.yml.
//
// What it does, and only this:
//   1. reads a few public tech-news feeds (RSS or Atom),
//   2. keeps recent headlines about AI, big-company appointments and launches,
//   3. drops anything that isn't workplace-friendly,
//   4. writes the headline as the publisher wrote it, with the source and date.
// Nothing is rewritten, so nothing can be made up. If every feed fails, the
// existing file is left exactly as it is.
//
// Local test:  FEEDS_DIR=./some-folder-of-xml-files node scripts/build-facts.mjs --print
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const FEEDS = [
  ['TechCrunch', 'https://techcrunch.com/feed/'],
  ['The Verge', 'https://www.theverge.com/rss/index.xml'],
  ['Ars Technica', 'https://feeds.arstechnica.com/arstechnica/index'],
  ['BBC Technology', 'https://feeds.bbci.co.uk/news/technology/rss.xml'],
  ['The Register', 'https://www.theregister.com/headlines.atom'],
  ['VentureBeat AI', 'https://venturebeat.com/category/ai/feed/'],
];
const DAY = 86400000;
const NEW_WITHIN_DAYS = 14;   // a headline must be this recent to be added
const KEEP_DAYS = 30;         // ...and is kept this long (the app drops news after 45)
const PER_FEED = 3;
const MAX_ITEMS = 30;

const AI = /\b(AI|A\.I\.|artificial intelligence|OpenAI|Anthropic|Gemini|Claude|ChatGPT|Copilot|LLMs?|chatbots?|AI agents?|machine learning|Nvidia|DeepMind|Mistral)\b/;
const APPOINT = /\b(appoints?|appointed|names? (?:a )?new|new (?:CEO|CTO|CFO|COO|chief)|steps? down|to step down|resigns?|joins as|hires?|hired as|promoted to|succeeds)\b/i;
const LAUNCH = /\b(launch(?:es|ed)?|unveils?|releases?|rolls? out|introduces?|announces?|acquires?|acquisition|partnership)\b/i;
const ITWORD = /\b(cloud|software|chip|semiconductor|cyber|data ?cent(?:er|re)|startup|developer|open[- ]source|browser|android|iphone|windows|linux|api|robot)\b/i;
// not for a work screen
const AVOID = /\b(shoot(?:ing|er)?|kill(?:ed|s|ing)?|dead|dies|died|death|murder|war|attack(?:s|ed)?|lawsuit|sues?|sued|arrest(?:ed|s)?|sex(?:ual)?|porn|nude|trump|biden|election|vote|ransomware|hack(?:ed|ers?)?|breach(?:ed)?|leak(?:ed|s)?|scam|fraud|suicide|abuse|racis[tm]|layoffs?|fired|lays? off)\b/i;

const decode = (s) => String(s || '')
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
  .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
  .replace(/<[^>]*>/g, ' ')
  .replace(/&(#x?[0-9a-f]+|amp|lt|gt|quot|apos|nbsp|rsquo|lsquo|rdquo|ldquo|ndash|mdash);/gi, (m, e) => {
    const t = e.toLowerCase();
    if (t[0] === '#') { const n = t[1] === 'x' ? parseInt(t.slice(2), 16) : parseInt(t.slice(1), 10); return Number.isFinite(n) && n > 31 && n < 0x110000 ? String.fromCodePoint(n) : ' '; }
    return ({ amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', ndash: '–', mdash: '—' })[t] || ' ';
  })
  .replace(/\s+/g, ' ').trim();

// Items out of an RSS (<item>) or Atom (<entry>) document: [{title, date}]
export function parseFeed(xml) {
  const out = [];
  const blocks = String(xml || '').match(/<(item|entry)[\s>][\s\S]*?<\/\1>/gi) || [];
  blocks.forEach((b) => {
    const t = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(b);
    const d = /<(pubDate|published|updated|dc:date)[^>]*>([\s\S]*?)<\/\1>/i.exec(b);
    const title = decode(t && t[1]);
    const ms = d ? Date.parse(decode(d[2])) : NaN;
    if (title && Number.isFinite(ms)) out.push({ title, ms });
  });
  return out;
}

export function classify(title) {
  if (AVOID.test(title)) return '';
  if (APPOINT.test(title) && (AI.test(title) || ITWORD.test(title) || /\b(CEO|CTO|CFO|chief|president|chair)\b/i.test(title))) return 'Appointment';
  if (AI.test(title)) return 'AI news';
  if (LAUNCH.test(title) && ITWORD.test(title)) return 'Tech news';
  return '';
}

const dateLabel = (ms) => new Date(ms).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

// feeds: [{source, xml}]  ->  items in the shape the app reads
export function buildItems(feeds, previous, now) {
  const fresh = [];
  feeds.forEach(({ source, xml }) => {
    let n = 0;
    parseFeed(xml).sort((a, b) => b.ms - a.ms).forEach((it) => {
      if (n >= PER_FEED || now - it.ms > NEW_WITHIN_DAYS * DAY || it.ms > now + DAY) return;
      const topic = classify(it.title);
      if (!topic || it.title.length < 20 || it.title.length > 170) return;
      n++;
      fresh.push({ text: `${it.title} (${source}, ${dateLabel(it.ms)})`, topic, news: true, asof: new Date(it.ms).toISOString().slice(0, 10), ms: it.ms });
    });
  });
  const seen = new Set();
  const kept = (previous || []).filter((p) => p && p.news && p.asof && now - Date.parse(p.asof + 'T00:00:00Z') <= KEEP_DAYS * DAY)
    .map((p) => Object.assign({}, p, { ms: Date.parse(p.asof + 'T00:00:00Z') }));
  return fresh.concat(kept).filter((x) => { const k = x.text.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; })
    .sort((a, b) => b.ms - a.ms).slice(0, MAX_ITEMS)
    .map(({ text, topic, news, asof }) => ({ text, topic, news, asof }));
}

async function main() {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const file = path.join(here, '..', 'docs', 'facts.json');
  let previous = [];
  try { previous = JSON.parse(fs.readFileSync(file, 'utf8')).items || []; } catch { /* first run */ }
  const feeds = [];
  if (process.env.FEEDS_DIR) {
    fs.readdirSync(process.env.FEEDS_DIR).filter((f) => f.endsWith('.xml')).forEach((f) => feeds.push({ source: f.replace(/\.xml$/, ''), xml: fs.readFileSync(path.join(process.env.FEEDS_DIR, f), 'utf8') }));
  } else {
    await Promise.all(FEEDS.map(async ([source, url]) => {
      try {
        const r = await fetch(url, { headers: { 'user-agent': 'daylens-facts/1 (+https://naveen-raj-sivasamy.github.io/daylens-releases/)' }, signal: AbortSignal.timeout(20000) });
        if (r.ok) feeds.push({ source, xml: await r.text() });
        else console.log(`skipped ${source}: HTTP ${r.status}`);
      } catch (e) { console.log(`skipped ${source}: ${e.message}`); }
    }));
  }
  if (!feeds.length) { console.log('No feed answered; facts.json left as it is.'); return; }
  const items = buildItems(feeds, previous, Date.now());
  if (process.argv.includes('--print')) { console.log(JSON.stringify(items, null, 2)); return; }
  const same = JSON.stringify(previous) === JSON.stringify(items);
  if (same && fs.existsSync(file)) { console.log('Nothing new.'); return; }
  fs.writeFileSync(file, JSON.stringify({ updated: new Date().toISOString().slice(0, 10), items }, null, 2) + '\n');
  console.log(`Wrote ${items.length} items.`);
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
