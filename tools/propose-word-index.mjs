// Dry run only. --report writes a proposal and complete CSV comparison under reports/.
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

if (process.argv.slice(2).some((arg) => arg !== '--report')) throw new Error('Only --report is supported; this script cannot apply metadata.');
const read = async (path) => JSON.parse(await readFile(new URL(`../${path}`, import.meta.url), 'utf8'));
const data = await read('data/edition/data.json');
const edition = await read('data/edition/poem-edition.json');
const legacy = (await read('data/edition/indices.json')).words;
const folds = { 'إ': 'ا', 'أ': 'ا', 'آ': 'ا', 'ٱ': 'ا', 'ى': 'ي', 'ؤ': 'و', 'ئ': 'ي', 'ة': 'ه' };
const normalize = (text) => text.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, '').replace(/[\u0625\u0623\u0622\u0671\u0649\u0624\u0626\u0629]/g, (ch) => folds[ch]);
const tokenize = (text, join = true) => {
  const copy = join ? text.replace(/\u0640[\u064B-\u065F\u0670]*\s*#\s*/g, '') : text;
  return [...copy.matchAll(/[\u0621-\u063A\u0641-\u064A\u0671][\u0621-\u065F\u0670\u0671]*/g)].map((m) => normalize(m[0])).filter(Boolean);
};
const build = ({ join = true, quotes = false, stripWaw = false } = {}) => {
  const index = new Map();
  let tokens = 0, verses = 0;
  for (const poem of data.poems) {
    const skip = quotes ? 0 : (edition.quoted_preface_verses[poem.id]?.count ?? 0);
    for (const line of poem.verses.slice(skip)) {
      verses++;
      for (let word of tokenize(line, join)) {
        if (stripWaw && word.startsWith('و') && word.length > 1) word = word.slice(1);
        const row = index.get(word) ?? { count: 0, poems: new Set() };
        row.count++; row.poems.add(poem.id); index.set(word, row); tokens++;
      }
    }
  }
  return { index, tokens, verses };
};
const exact = build();
const unjoined = build({ join: false });
const quotes = build({ quotes: true });
const waw = build({ stripWaw: true });
const get = (result, word) => { const row = result.index.get(normalize(word)); return row ? `${row.count} / ${row.poems.size}` : '0 / 0'; };
const changed = legacy.filter((row) => get(exact, row.word) !== `${row.count} / ${row.poems}`);
const normalizedLabels = new Map();
for (const row of legacy) {
  const key = normalize(row.word);
  normalizedLabels.set(key, [...(normalizedLabels.get(key) ?? []), row.word]);
}
const collisions = [...normalizedLabels].filter(([, labels]) => labels.length > 1);
const csvCell = (value) => `"${String(value).replace(/"/g, '""')}"`;
const csv = [
  ['legacy_word', 'normalized_key', 'legacy_occurrences', 'legacy_poems', 'candidate_occurrences', 'candidate_poems', 'occurrence_delta', 'poem_delta', 'shared_normalized_key'],
  ...legacy.map((row) => {
    const key = normalize(row.word);
    const candidate = exact.index.get(key);
    const count = candidate?.count ?? 0;
    const poems = candidate?.poems.size ?? 0;
    return [row.word, key, row.count, row.poems, count, poems, count - row.count, poems - row.poems,
      (normalizedLabels.get(key) ?? []).length > 1 ? normalizedLabels.get(key).join(' / ') : ''];
  }),
].map((row) => row.map(csvCell).join(',')).join('\n') + '\n';
const splits = [];
for (const poem of data.poems) {
  const skip = edition.quoted_preface_verses[poem.id]?.count ?? 0;
  poem.verses.slice(skip).forEach((line, i) => {
    if (/\u0640[\u064B-\u065F\u0670]*\s*#\s*/.test(line)) splits.push({ id: poem.id, n: i + 1, line, tokens: tokenize(line) });
  });
}
const hash = createHash('sha256').update(JSON.stringify({ data, edition, legacy })).digest('hex');
const table = [...new Set(['الزمان', 'يوم', 'الا', 'بالخيف', ...changed.slice(0, 20).map((row) => row.word)])].map((word) => {
  const old = legacy.find((row) => row.word === word);
  return `| ${word} | ${old ? `${old.count} / ${old.poems}` : '—'} | ${get(exact, word)} | ${get(unjoined, word)} | ${get(waw, word)} |`;
}).join('\n');
const report = `# U12 — word-index proposal (policy approved 2026-10-24)\n\nGenerated deterministically by \`node tools/propose-word-index.mjs --report\`. No clock, network, dependencies or data writes. Parsed input SHA-256: \`${hash}\`. The only optional write target is this report; unsupported flags fail. No metadata is applied or added to the normal data pipeline.\n\n## Approved counting contract\n\n- Read approved edition verses only. Exclude titles, introductions, notes and the four quoted-preface rows identified by poem-edition.json. Count ${exact.verses} own-poem rows; including quotes would count ${quotes.verses} rows and ${quotes.tokens - exact.tokens} additional tokens. Own-verse numbering starts after the excluded preface.\n- Extract Arabic letter runs, preserving attached diacritics until normalization. Punctuation and ordinary # boundaries separate tokens; they do not concatenate surrounding words. Remove diacritics/tatweel and fold alef variants, alef maqsura, hamza seats and ta marbuta exactly as documented in search. No stemming, article removal, stop-word filtering, minimum length or inferred word repair. Latin letters and numerals are excluded.\n- Join only the explicitly documented tatweel-before-# boundary in an in-memory analysis copy. There are ${splits.length} such own-verse rows. Ambiguous unmarked fragments remain separate pending printed-book review. Display text and edition files remain byte-for-byte untouched. A future builder should retain source poem/verse and token offsets, as corpus.ts now does for runtime highlighting.\n- Recommended baseline: attached conjunctions remain attached surface tokens. Search for الزمان can still match والزمان; that is a different unit from exact-token frequency. Do not strip initial waw blindly: it also begins lexical words such as ورد. The sensitivity column below deliberately strips *every* initial waw from tokens longer than one letter to quantify the risk; it is not a linguistic recommendation. Detached conjunction و remains its own token if one survives the approved edition.\n- Count occurrences (repetitions within one verse count again) and distinct poem IDs independently. Choose display spellings by frequency, then a deterministic Unicode tie break; sort records by descending occurrences then normalized Unicode key. Selection of which words to publish is a separate editorial decision, not inferred from the old shortlist.\n\n## Reproducible numeric differences\n\nBaseline: ${exact.tokens} tokens, ${exact.index.size} distinct normalized forms. Without joining marked splits: ${unjoined.tokens} tokens, ${unjoined.index.size} forms. With all quoted rows: ${quotes.tokens} tokens, ${quotes.index.size} forms. Blind initial-waw stripping: ${waw.tokens} tokens, ${waw.index.size} forms.\n\n${changed.length} of ${legacy.length} current legacy shortlist records differ from baseline occurrence and/or poem totals. These are diagnostic candidate counts, not approved replacement totals. Differences cannot be attributed solely to waw joining because the original tokenization/selection contract is unknown.\n\nCells below are occurrences / distinct poems; no column counts matching verses or substrings.\n\n| Term | Legacy | Baseline candidate | Without split joining | Blind waw sensitivity |\n| --- | --- | --- | --- | --- |\n${table}\n\n## Marked split samples\n\n${splits.slice(0, 8).map((s) => `- ${s.id}, own verse ${s.n}: «${s.line}» → analysis tokens: ${s.tokens.join('، ')}`).join('\n')}\n\n## Review record and implementation\n\nThe owner approved the exact surface-form baseline, search-style folding, quotation exclusion, marked-split joining and retention of the legacy shortlist with its two duplicate normalized groups merged. Attached conjunctions remain part of the full word. The lead applied the derived artifact only after approval.\n\nProduction implementation: \`tools/build-word-index.mjs\` and the shared pure tokenizer \`src/scripts/analysis-words.mjs\`. The explicit \`--apply\` writes only \`data/edition/word-frequencies.json\`; the full data pipeline runs it after the two approved spacing steps. The artifact carries policy/provenance, 238 records and their source poem IDs. Verification recomputes it and rejects stale or changed contents. The original sensitivity columns and 240-row CSV preserve the diagnostic review evidence. Display labels remain the existing legacy labels; for either merged group, the most frequent candidate legacy spelling in the edition wins, with Unicode ordering for ties.\n`;
const completeReport = report + `\n## Complete review artifacts\n\nThe [full CSV comparison](word-index-proposed-changes.csv) lists all ${legacy.length} legacy rows, their candidate counts, deltas and normalized keys. No rows are silently removed or applied.\n\nSearch-style normalization merges ${collisions.length} pairs of existing labels: ${collisions.map(([key, labels]) => `«${labels.join('» / «')}» → «${key}»`).join('، ')}. The approved rebuild merges each pair into one frequency record and retains the other shortlist terms. The CSV intentionally preserves every old row for comparison, including the two pairs before merging.\n`;
if (process.argv.includes('--report')) {
  await writeFile(new URL('../reports/word-index-proposal.md', import.meta.url), completeReport);
  await writeFile(new URL('../reports/word-index-proposed-changes.csv', import.meta.url), csv);
  console.log('Dry-run proposal and full CSV comparison written under reports/; no data files changed.');
} else process.stdout.write(completeReport);
