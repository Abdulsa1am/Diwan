// Checks the built site in dist/. Run after `npm run build`: `npm run verify`.
// - every verse half of every poem appears unchanged in its page
// - every internal link points to a page or file that exists
// - every page has one <h1>, a <title>, a description and a canonical link
// - no personal email leaks into the site
// Exits with code 1 if anything fails.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { verifyWordIndexFile } from './build-word-index.mjs';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');
const data = JSON.parse(fs.readFileSync(path.join(root, 'data/edition/data.json'), 'utf8'));
const quoted = JSON.parse(fs.readFileSync(path.join(root, 'data/edition/poem-edition.json'), 'utf8')).quoted_preface_verses;

const problems = [];
// Derived metadata must match current approved text, policy, shortlist and all recomputed counts.
try {
  await verifyWordIndexFile();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const files = fs.readdirSync(dist, { recursive: true }).map((f) => f.replaceAll('\\', '/'));
const htmlFiles = files.filter((f) => f.endsWith('.html'));
const fileSet = new Set(files);

// 1. Verse integrity
let halves = 0;
for (const p of data.poems) {
  const html = fs.readFileSync(path.join(dist, 'poem', p.id, 'index.html'), 'utf8');
  const skip = quoted[p.id]?.count ?? 0;
  p.verses.forEach((v, i) => {
    const parts = i < skip ? [v] : v.split('#').map((s) => s.trim()).filter(Boolean);
    for (const part of parts) {
      halves += 1;
      if (!html.includes(escapeHtml(part))) problems.push(`missing verse text in ${p.id} verse ${i + 1}`);
    }
  });
}

// 2–4. Links, page basics, privacy
const resolves = (href) => {
  const clean = decodeURIComponent(href.split('#')[0].split('?')[0]).replace(/^\//, '');
  if (clean === '') return fileSet.has('index.html');
  return fileSet.has(clean) || fileSet.has(`${clean.replace(/\/$/, '')}/index.html`) || fileSet.has(`${clean}.html`);
};
let links = 0;
let largest = { file: '', gzip: 0 };
for (const f of htmlFiles) {
  const html = fs.readFileSync(path.join(dist, f), 'utf8');
  for (const [, href] of html.matchAll(/\shref="(\/[^"]*)"/g)) {
    links += 1;
    if (!resolves(href)) problems.push(`broken link in ${f}: ${href}`);
  }
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) problems.push(`${f} has ${h1} <h1>`);
  if (!/<title>[^<]+<\/title>/.test(html)) problems.push(`${f} has no <title>`);
  if (!/<meta name="description" content="[^"]+"/.test(html)) problems.push(`${f} has no description`);
  if (!/<link rel="canonical"/.test(html)) problems.push(`${f} has no canonical link`);
  if (/@gmail\.com|dimaa\.thalatha/.test(html)) problems.push(`${f} contains an email address`);
  for (const [, json] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(json);
    } catch {
      problems.push(`${f} has invalid structured data (ld+json)`);
    }
  }
  const gz = zlib.gzipSync(html).length;
  if (gz > largest.gzip) largest = { file: f, gzip: gz };
}
for (const f of files.filter((f) => /\.(js|css|json|xml|txt)$/.test(f))) {
  if (/dimaa\.thalatha/.test(fs.readFileSync(path.join(dist, f), 'utf8'))) problems.push(`${f} contains the owner's email`);
}

// 5. Titles and descriptions are unique (search engines treat duplicates as the same page)
const seen = { title: new Map(), description: new Map() };
for (const f of htmlFiles) {
  if (f === '404.html') continue;
  const html = fs.readFileSync(path.join(dist, f), 'utf8');
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  const desc = html.match(/<meta name="description" content="([^"]+)"/)?.[1];
  for (const [kind, value] of [['title', title], ['description', desc]]) {
    if (!value) continue;
    if (seen[kind].has(value)) problems.push(`duplicate ${kind} in ${f} and ${seen[kind].get(value)}`);
    else seen[kind].set(value, f);
  }
}

// 6. Every sitemap URL is a real page
const sitemap = fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8');
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
for (const loc of locs) if (!resolves(loc)) problems.push(`sitemap lists a missing page: ${loc}`);

console.log(`Pages: ${htmlFiles.length}, internal links: ${links}, verse halves checked: ${halves}, sitemap URLs: ${locs.length}`);
console.log(`Largest page: ${largest.file} (${(largest.gzip / 1024).toFixed(1)} KB gzipped)`);
if (problems.length) {
  console.log(`\n${problems.length} problem(s):`);
  for (const p of problems.slice(0, 50)) console.log(' - ' + p);
  process.exit(1);
}
console.log('All checks passed.');
