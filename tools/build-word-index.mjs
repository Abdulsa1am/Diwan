// Approved U12 builder. Default is read-only; only explicit --apply writes the standalone artifact.
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { analysisWords, normalizeWord, unmarkedWord } from '../src/scripts/analysis-words.mjs';

export const ARTIFACT = new URL('../data/edition/word-frequencies.json', import.meta.url);
export const POLICY = Object.freeze({
  version: 'approved-surface-words-v1',
  tokens: 'Arabic letter runs; punctuation and ordinary hemistich separators are boundaries',
  normalization: 'remove Arabic marks/tatweel; fold alef variants, maqsura, hamza seats and ta marbuta as search',
  conjunctions: 'full attached surface forms; detached waw is a separate token; no stemming',
  quotations: 'exclude poem-edition.quoted_preface_verses counts',
  splits: 'join only explicit tatweel-before-# in derived analysis',
  shortlist: 'retain legacy normalized keys; merge collisions; no stop-word or length filters',
  labels: 'unique legacy label unchanged; collision label by unmarked edition frequency then Unicode order',
  order: 'descending occurrences then Unicode normalized key; source poem IDs in Unicode order',
});
/** Locale-independent Unicode/code-unit ordering for Arabic keys and ASCII poem IDs. */
export const unicodeOrder = (a, b) => a < b ? -1 : a > b ? 1 : 0;
/** Canonical JSON makes input object property order irrelevant; array order is meaningful. */
export function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value !== null && typeof value === 'object') {
    return `{${Object.keys(value).sort(unicodeOrder).map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

/** Pure: never mutates inputs or reads/writes files. Legacy numerical counts are not reused. */
export function buildWordIndex({ data, edition, legacy }) {
  const groups = new Map();
  for (const row of legacy) {
    const tokens = analysisWords(row.word).words;
    const key = normalizeWord(row.word);
    if (tokens.length !== 1 || tokens[0] !== key) throw new Error(`Invalid legacy shortlist label: ${row.word}`);
    if (!groups.has(key)) groups.set(key, new Set());
    groups.get(key).add(row.word);
  }
  const counts = new Map([...groups.keys()].map((key) => [key, { count: 0, ids: new Set(), spellings: new Map() }]));
  const seenIDs = new Set();
  let totalTokens = 0, ownVerses = 0;
  const prefaces = edition.quoted_preface_verses;
  for (const id of Object.keys(prefaces)) {
    if (!data.poems.some((poem) => poem.id === id)) throw new Error(`Unknown quoted-preface poem: ${id}`);
  }
  for (const poem of data.poems) {
    if (typeof poem.id !== 'string' || seenIDs.has(poem.id)) throw new Error('Missing or duplicate poem ID');
    seenIDs.add(poem.id);
    const skip = prefaces[poem.id]?.count ?? 0;
    if (!Number.isInteger(skip) || skip < 0 || skip > poem.verses.length) throw new Error(`Invalid quotation count: ${poem.id}`);
    for (const line of poem.verses.slice(skip)) {
      const { words, originals } = analysisWords(line);
      ownVerses++;
      totalTokens += words.length;
      words.forEach((key, i) => {
        const row = counts.get(key);
        if (!row) return;
        row.count++;
        row.ids.add(poem.id);
        const spelling = unmarkedWord(originals[i]);
        row.spellings.set(spelling, (row.spellings.get(spelling) ?? 0) + 1);
      });
    }
  }
  const words = [...groups].map(([key, labels]) => {
    const row = counts.get(key);
    const candidates = [...labels].sort((a, b) =>
      (row.spellings.get(unmarkedWord(b)) ?? 0) - (row.spellings.get(unmarkedWord(a)) ?? 0) || unicodeOrder(a, b));
    const ids = [...row.ids].sort(unicodeOrder);
    return { key, word: candidates[0], count: row.count, poems: ids.length, ids };
  }).sort((a, b) => b.count - a.count || unicodeOrder(a.key, b.key));
  const inputHash = createHash('sha256').update(canonical({ policy: POLICY, data, edition, legacy })).digest('hex');
  return {
    schemaVersion: 1,
    policy: POLICY,
    provenance: {
      algorithm: 'sha256-canonical-json', inputHash,
      inputs: ['data/edition/data.json', 'data/edition/poem-edition.json', 'data/edition/indices.json#words'],
    },
    totals: { tokens: totalTokens, ownVerses, poems: seenIDs.size, shortlistRows: legacy.length, words: words.length },
    words,
  };
}

export async function readWordIndexInputs() {
  const read = async (file) => JSON.parse(await readFile(new URL(`../data/edition/${file}`, import.meta.url), 'utf8'));
  const [data, edition, indices] = await Promise.all([read('data.json'), read('poem-edition.json'), read('indices.json')]);
  return { data, edition, legacy: indices.words };
}
export function validateWordIndex(artifact, inputs) {
  // Full pure recomputation rejects stale hashes/policy, altered labels/counts/IDs, bad shape and extra fields.
  const expected = buildWordIndex(inputs);
  if (canonical(artifact) !== canonical(expected)) {
    throw new Error('Word-frequency artifact is stale or malformed. Rebuild with node tools/build-word-index.mjs --apply');
  }
  return expected;
}
export async function verifyWordIndexFile() {
  try {
    const [inputs, text] = await Promise.all([readWordIndexInputs(), readFile(ARTIFACT, 'utf8')]);
    return validateWordIndex(JSON.parse(text), inputs);
  } catch (error) {
    throw new Error(`Word-frequency validation failed: ${error.message}. Lead: node tools/build-word-index.mjs --apply`);
  }
}
/** Injectable I/O keeps CLI dry-run safety testable without ever touching edition data. */
export async function runCLI(args, {
  readInputs = readWordIndexInputs,
  writeArtifact = (text) => writeFile(ARTIFACT, text),
  log = console.log,
} = {}) {
  if (args.length > 1 || (args.length === 1 && args[0] !== '--apply')) throw new Error('Usage: node tools/build-word-index.mjs [--apply]');
  const inputs = await readInputs();
  const artifact = buildWordIndex(inputs);
  if (artifact.totals.shortlistRows !== 240 || artifact.totals.words !== 238) {
    throw new Error('Approved shortlist contract changed: expected 240 legacy rows and 238 normalized keys. Review before applying.');
  }
  if (args[0] === '--apply') await writeArtifact(JSON.stringify(artifact, null, 2) + '\n');
  log(`${args[0] === '--apply' ? 'Wrote' : 'Dry run; no files written:'} data/edition/word-frequencies.json: ${artifact.words.length} words, ${artifact.totals.tokens} tokens, ${artifact.totals.ownVerses} own verses; sha256 ${artifact.provenance.inputHash}`);
  return artifact;
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  await runCLI(process.argv.slice(2));
}
