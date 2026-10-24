import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { buildWordIndex, canonical, validateWordIndex, runCLI, readWordIndexInputs } from './build-word-index.mjs';
import { analysisWords, normalizeWord } from '../src/scripts/analysis-words.mjs';
import { fold, highlight } from '../src/scripts/arabic-search.ts';
import { phraseRanges } from '../src/scripts/corpus.ts';

const fixture = () => ({
  data: { poems: [
    { id: 'p2', verses: ['قمر قمر، والزمان و الزمان # نور', 'بالخيـ # فِ، نُور'] },
    { id: 'p1', verses: ['قمر نور، زمان'] },
  ] },
  edition: { quoted_preface_verses: {} },
  legacy: ['قمر', 'نور', 'والزمان', 'و', 'الزمان', 'بالخيف', 'زمان'].map((word) => ({ word, count: 999, poems: 999 })),
});
const row = (result, key) => result.words.find((word) => word.key === key);

test('independent occurrence and poem counts; attached waw stays distinct; punctuation separates', () => {
  const input = fixture();
  const before = JSON.stringify(input);
  const result = buildWordIndex(input);
  assert.deepEqual(result.totals, { tokens: 11, ownVerses: 3, poems: 2, shortlistRows: 7, words: 7 });
  assert.deepEqual(row(result, 'قمر'), { key: 'قمر', word: 'قمر', count: 3, poems: 2, ids: ['p1', 'p2'] });
  assert.equal(row(result, 'نور').count, 3);
  for (const key of ['والزمان', 'و', 'الزمان']) assert.equal(row(result, key).count, 1);
  assert.equal(row(result, 'بالخيف').count, 1);
  assert.equal(JSON.stringify(input), before);
});

test('only explicit marked boundaries join; offsets retain original diacritics and display fragments', () => {
  const text = 'بالخيـ # فِ ثم نور # قمر';
  const result = analysisWords(text);
  assert.deepEqual(result.words, ['بالخيف', 'ثم', 'نور', 'قمر']);
  assert.equal(text.slice(...result.wordRanges[0]), 'بالخيـ # فِ');
  const ranges = phraseRanges({ ...result, text, n: 1, poem: 0 }, ['بالخيف']);
  assert.deepEqual(ranges, [result.wordRanges[0]]);
  assert.equal(highlight(text, ranges).replace(/<\/?mark>/g, ''), text);
  assert.deepEqual(analysisWords('بالخي # ف').words, ['بالخي', 'ف']);
  assert.equal(text, 'بالخيـ # فِ ثم نور # قمر');
});

test('exactly four fixture preface rows excluded while own verse numbering/count remains independent', () => {
  const input = fixture();
  input.data.poems.forEach((poem) => { poem.verses.unshift('شاهد شاهد', 'شاهد'); });
  input.edition.quoted_preface_verses = { p1: { count: 2 }, p2: { count: 2 } };
  input.legacy.push({ word: 'شاهد' });
  const result = buildWordIndex(input);
  assert.equal(result.totals.ownVerses, 3);
  assert.equal(result.totals.tokens, 11);
  assert.equal(row(result, 'شاهد').count, 0);
  input.edition.quoted_preface_verses.p1.count = -1;
  assert.throws(() => buildWordIndex(input), /quotation count/);
});

test('normalization collisions choose only candidate legacy labels by unmarked frequency, with Unicode ties', () => {
  const input = {
    data: { poems: [{ id: 'x', verses: ['فَتَى فَتَى فتي، إلا الا'] }] },
    edition: { quoted_preface_verses: {} },
    legacy: ['فتى', 'فتي', 'إلا', 'الا'].map((word) => ({ word })),
  };
  const result = buildWordIndex(input);
  assert.equal(result.words.length, 2);
  assert.equal(row(result, 'فتي').word, 'فتى');
  assert.equal(row(result, 'فتي').count, 3);
  assert.equal(row(result, 'الا').word, 'إلا'); // same frequency; hamza below sorts before bare alef
  assert.equal(row(result, 'الا').count, 2);
});

test('normalization agrees with search on Arabic forms; no punctuation concatenation', () => {
  for (const word of ['إلى', 'أُمّة', 'ٱلدهر', 'رؤى', 'سُئل', 'قـمر']) {
    assert.equal(normalizeWord(word), fold(word).text);
  }
  assert.deepEqual(analysisWords('قمر،نور! قمر؟نور').words, ['قمر', 'نور', 'قمر', 'نور']);
});

test('deterministic sort/hash, canonical property order and provenance reject stale or tampered artifacts', () => {
  const input = fixture();
  const result = buildWordIndex(input);
  assert.deepEqual(result.words.map((word) => word.key), ['قمر', 'نور', 'الزمان', 'بالخيف', 'زمان', 'و', 'والزمان']);
  assert.deepEqual(buildWordIndex(structuredClone(input)), result);
  const reordered = { legacy: input.legacy, edition: input.edition, data: input.data };
  assert.equal(buildWordIndex(reordered).provenance.inputHash, result.provenance.inputHash);
  assert.match(result.provenance.inputHash, /^[0-9a-f]{64}$/);
  assert.deepEqual(validateWordIndex(result, input), result);
  for (const mutate of [
    (copy) => { copy.words[0].count++; },
    (copy) => { copy.words[0].ids = ['wrong']; },
    (copy) => { copy.provenance.inputHash = 'stale'; },
    (copy) => { copy.policy.version = 'old'; },
    (copy) => { copy.words.push(copy.words[0]); },
    (copy) => { copy.extra = true; },
  ]) {
    const copy = structuredClone(result); mutate(copy);
    assert.throws(() => validateWordIndex(copy, input), /stale or malformed/);
  }
  assert.throws(() => validateWordIndex({}, input), /stale or malformed/);
  input.data.poems[0].verses[0] += ' قمر';
  assert.notEqual(buildWordIndex(input).provenance.inputHash, result.provenance.inputHash);
  assert.throws(() => validateWordIndex(result, input), /stale or malformed/);
});


test('production shortlist has two merged groups; read-only CLI never invokes writer or changes data files', async () => {
  const paths = ['data.json', 'poem-edition.json', 'indices.json', 'word-frequencies.json'];
  const snapshots = async () => Promise.all(paths.map(async (path) => {
    try { return createHash('sha256').update(await readFile(new URL(`../data/edition/${path}`, import.meta.url))).digest('hex'); }
    catch (error) { if (error.code === 'ENOENT') return null; throw error; }
  }));
  const before = await snapshots();
  const inputs = await readWordIndexInputs();
  const result = buildWordIndex(inputs);
  assert.equal(result.totals.shortlistRows, 240);
  assert.equal(result.words.length, 238);
  assert.equal(result.totals.ownVerses, 16176);
  assert.equal(result.totals.tokens, 149549);
  let writes = 0;
  const options = { readInputs: async () => inputs, writeArtifact: async () => { writes++; }, log: () => {} };
  assert.deepEqual(await runCLI([], options), result);
  await assert.rejects(runCLI(['--output=data/edition/data.json'], options), /Usage/);
  await assert.rejects(runCLI(['--apply', '--apply'], options), /Usage/);
  assert.equal(writes, 0);
  assert.deepEqual(await snapshots(), before);
  assert.equal(canonical(buildWordIndex(inputs)), canonical(result));
});
