// Text-review proposals, not editorial authorization. Dry-run is the default.
// node tools/fix-text-issues.mjs [--apply | --self-test]
// Only --apply writes existing edition JSON files. Source data, reports, keys,
// URLs, unreviewed readings and punctuation marks are never rewritten.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EDITION = path.join(ROOT, 'data/edition');
const MARKS = /[\u064B-\u065F]/gu;
const LETTER = '[\\u0621-\\u063A\\u0641-\\u064A]';
const TOKEN = `[\\u0621-\\u063A\\u0641-\\u065F]+`;
const plain = (s) => s.replace(MARKS, '').replace(/\u0640/gu, '');
const HAMZA = new RegExp(`(^|[ #\u060C\u061B:!\u061F.\u00AB\u00BB()])أ( +)(${TOKEN})`, 'gu');
const GLUED = new RegExp(`([\u060C\u061B:!\u061F.,?])(?=${LETTER})`, 'gu');
const BEFORE_PUNCT = / +(?=[\u060C\u061B:!\u061F.,?])/gu;

// A deliberately finite whitelist, checked in this corpus. No general rule
// joins every standalone alef/hamza. Initial أ/إ/آ after the prefix is excluded.
const CERTAIN_WORDS = new Set(`ما لا لم ليس لست ترى تراني ترانا تراهم في كذا من حين تحسب ترضى كل تطمع ترجو يسمح هذا وما وليس ولم فلا فالآن وبعد يرجى يجزع يخفى يكون ينسبني تخلع تظنني رأيت تطلب تصد يصاح يخاف كنت تنأين يصرعني يطلع للواجد بذاك علي بتالدي بمعشري يعوم توعدني تحننا عاينت تقتص تريد تزحم تذكراني يرجع تنظر عندك تظن عذلتما بالمخازي تروي للطعن يوعدنا يعرقني يجرني تذهل يعلم يسنح فيها يضعفني`.split(' '));
const VOCATIVES = new Set(`بني بغداد معاهد أخي آل إبراهيم عامر أميم حسود يوم بغاة مرشحي معيني عقيلة مريد ساكنة ذات مقاصر عاذلتي صاح ملتمسا`.split(' '));
const SPECIAL = new Map([
  ['r1-179:19', 'hamza-oath-or-vocative'],
  ['r2-026:3', 'hamza-oath-or-vocative'],
  ['r1-028:11', 'hamza-syntax-review'],
  ['r1-124:48', 'hamza-syntax-review'],
  ['r1-224:60', 'hamza-syntax-review'],
  ['r1-306:1', 'hamza-syntax-review'],
  ['r2-072:52', 'hamza-before-alef-review'],
  ['r1-243:12', 'broken-word-afala'],
  ['r2-198:2', 'broken-word-alam'],
  ['r2-275:7', 'broken-word-adaan'],
  ['r2-297:44', 'broken-word-asadiqa'],
]);

function hamzaDecision(text, match, context) {
  const word = plain(match[3]);
  const at = match.index + match[1].length;
  // The first character after a marked split may complete the previous word.
  if (/\u0640\s*#\s*$/u.test(text.slice(0, at))) return { keep: 'split-continuation' };
  const special = context.field === 'verse' ? SPECIAL.get(`${context.poem_id}:${context.raw_number}`) : undefined;
  if (special === 'hamza-oath-or-vocative') return { keep: special };
  if (special?.startsWith('broken-word-')) return { category: special, confidence: 'needs-review' };
  if (special) return { category: special, confidence: 'needs-review' };
  if (VOCATIVES.has(word)) return { keep: 'hamza-vocative' };
  if (/^[\u0623\u0625\u0622]/u.test(word)) return { category: 'hamza-before-alef-review', confidence: 'needs-review' };
  if (CERTAIN_WORDS.has(word)) return { category: `hamza-join-${word}`, confidence: 'certain' };
  return { category: 'hamza-other-interrogative', confidence: 'likely' };
}

// All edit offsets refer to the ORIGINAL field value. Each proposal changes
// exactly one occurrence, so before/after pairs are independent, not a chain.
export function spacingEdits(text, context) {
  const edits = [];
  const kept = [];
  for (const m of text.matchAll(HAMZA)) {
    const decision = hamzaDecision(text, m, context);
    if (decision.keep) { kept.push({ ...decision, token: m[3], at: m.index }); continue; }
    const start = m.index + m[1].length + 1;
    edits.push({ start, end: start + m[2].length, insert: '', ...decision });
  }
  for (const m of text.matchAll(GLUED)) {
    // An unreadable ??? is evidence of damage, not three missing spaces.
    if (/[\u060C\u061B:!\u061F.,?]/u.test(text[m.index - 1] ?? '')) continue;
    edits.push({ start: m.index + 1, end: m.index + 1, insert: ' ', category: 'space-after-punctuation', confidence: 'certain' });
  }
  for (const m of text.matchAll(BEFORE_PUNCT)) {
    edits.push({ start: m.index, end: m.index + m[0].length, insert: '', category: 'space-before-punctuation', confidence: 'certain' });
  }
  return { edits, kept };
}

function applyEdits(text, edits) {
  let lastStart = text.length + 1;
  let result = text;
  for (const e of [...edits].sort((a, b) => b.start - a.start || b.end - a.end)) {
    assert(e.start >= 0 && e.start <= e.end && e.end <= text.length, 'Bad edit bounds');
    assert(e.end <= lastStart, 'Overlapping edits');
    result = result.slice(0, e.start) + e.insert + result.slice(e.end);
    lastStart = e.start;
  }
  return result;
}

function checkCertain(before, after, edits) {
  for (const e of edits) {
    assert.equal(e.confidence, 'certain');
    if (e.category.startsWith('hamza-join-')) {
      assert(/^ +$/u.test(before.slice(e.start, e.end)) && e.insert === '');
      assert.equal(before[e.start - 1], 'أ');
    } else if (e.category === 'space-before-punctuation') {
      assert(/^ +$/u.test(before.slice(e.start, e.end)) && e.insert === '');
      assert(/^[\u060C\u061B:!\u061F.,?]$/u.test(before[e.end]));
    } else if (e.category === 'space-after-punctuation') {
      assert(e.start === e.end && e.insert === ' ');
      assert(/^[\u060C\u061B:!\u061F.,?]$/u.test(before[e.start - 1]));
      assert(new RegExp(`^${LETTER}$`, 'u').test(before[e.start]));
    } else throw new Error(`Unapproved rule: ${e.category}`);
  }
  // Stronger than a letters-only comparison: every non-ASCII-space code point
  // (including diacritics, tatweels, punctuation, # and unusual whitespace)
  // must remain byte-for-byte identical, in the same order.
  assert.equal(before.replace(/ /gu, ''), after.replace(/ /gu, ''), 'Non-space character changed');
  assert.equal(applyEdits(before, edits), after, 'Change not explained by approved edits');
  assert.equal(before.split('#').length, after.split('#').length);
}

export function readEdition() {
  return new Map(fs.readdirSync(EDITION).filter((f) => f.endsWith('.json')).sort().map((file) => {
    const bytes = fs.readFileSync(path.join(EDITION, file));
    return [file, { bytes, data: JSON.parse(bytes.toString('utf8')) }];
  }));
}

export function auditCorpus(files = readEdition()) {
  const poems = files.get('data.json').data.poems;
  const quotes = files.get('poem-edition.json').data.quoted_preface_verses;
  const linked = files.get('note-edition.json').data.notes;
  const noteLinks = new Map();
  for (const [id, notes] of Object.entries(linked)) {
    for (const n of notes) {
      const list = noteLinks.get(`${n.source_poem}:${n.source_index}`) ?? [];
      list.push({ poem: id, verse: n.verse - (quotes[id]?.count ?? 0) });
      noteLinks.set(`${n.source_poem}:${n.source_index}`, list);
    }
  }
  const fields = [];
  for (const p of poems) {
    const skip = quotes[p.id]?.count ?? 0;
    p.verses.forEach((text, i) => fields.push({ poem_id: p.id, verse_number: i < skip ? '' : i + 1 - skip, raw_number: i + 1, field: 'verse', text, at: `poems[${poems.indexOf(p)}].verses[${i}]` }));
    for (const field of ['title', 'intro']) fields.push({ poem_id: p.id, verse_number: '', field, text: p[field] ?? '', at: `poems[${poems.indexOf(p)}].${field}` });
    (p.notes ?? []).forEach((text, i) => {
      const links = noteLinks.get(`${p.id}:${i}`) ?? [];
      const same = links.length === 1 && links[0].poem === p.id && links[0].verse > 0;
      fields.push({ poem_id: p.id, verse_number: same ? links[0].verse : '', field: 'note', note_index: i, links, text, at: `poems[${poems.indexOf(p)}].notes[${i}]` });
    });
  }
  const proposals = [];
  const keptHamza = [];
  const canonicalChanges = [];
  const add = (f, category, confidence, after, detail = '') => proposals.push({ poem_id: f.poem_id, verse_number: f.verse_number, field: f.field, category, confidence, before: f.text, after, at: f.at, detail });
  for (const f of fields) {
    const { edits, kept } = spacingEdits(f.text, f);
    keptHamza.push(...kept.map((k) => ({ ...k, ...f })));
    for (const e of edits) add(f, e.category, e.confidence, applyEdits(f.text, [e]));
    const certain = edits.filter((e) => e.confidence === 'certain');
    if (certain.length) {
      const after = applyEdits(f.text, certain);
      checkCertain(f.text, after, certain);
      canonicalChanges.push({ ...f, after, edits: certain });
    }
    if ((f.field === 'note' || f.field === 'intro') && f.text.trimEnd().endsWith(':')) add(f, 'possibly-truncated-gloss', 'needs-review', '', 'No reconstructed reading; inspect the printed page and adjacent intro/notes.');
    if (f.field === 'verse' && /\u061F{2,}/u.test(f.text)) add(f, 'unresolved-question-mark-placeholder', 'needs-review', '', 'Do not delete ??? without checking the edition.');
    if (f.field === 'verse' && f.poem_id === 'r1-035' && f.raw_number === 6) add(f, 'internal-period-review', 'needs-review', f.text.replace('للحلم. أوقات', 'للحلم أوقات'), 'A period splits a noun phrase; check the edition before removing the mark.');
    if (f.field === 'verse' && f.poem_id === 'r2-042' && [19, 20].includes(f.raw_number)) add(f, 'broken-verse-wrap-review', 'needs-review', '', 'Possible single verse stored in two entries; requires structural review and renumbering, not a string-only fix.');
    if (f.field === 'verse' && f.text.includes('ن ابي')) add(f, 'broken-word-nabi', 'likely', f.text.replace('ن ابي', 'نابي'));
    if (f.field === 'verse' && /(?:إلى|على) م /u.test(f.text)) add(f, 'detached-interrogative-ma', 'needs-review', f.text.replace(/إلى م /u, 'إلام ').replace(/على م /u, 'علام '), 'Requires changing the alif maqsura as well as spacing; not an automatic rule.');
  }

  // Candidate split markers: lexical corroboration is only a heuristic.
  // No automatic tatweel insertion and no moving letters across #.
  const clean = (s) => plain(s).replace(/[\u060C\u061B\u061F!.,:]/gu, '');
  const freq = new Map();
  for (const p of poems) for (const v of p.verses) for (const w of v.replaceAll('#', ' ').split(/ +/u)) freq.set(clean(w), (freq.get(clean(w)) ?? 0) + 1);
  const known = new Set(freq.keys());
  for (const p of poems) for (const v of p.verses) if (/\u0640\s*#/u.test(v)) {
    const [a, b] = v.split('#'); known.add(clean(a.trim().split(/ +/u).at(-1)) + clean(b.trim().split(/ +/u)[0]));
  }
  // Manually checked ordinary word boundaries which happened to make a word
  // when concatenated; not split-word proposals.
  const normalBoundaries = new Set(['r1-007:5', 'r1-031:35', 'r1-198:3', 'r1-217:11', 'r2-053:28', 'r2-067:3', 'r2-068:27', 'r2-086:35', 'r2-131:24', 'r2-223:21', 'r2-228:6', 'r2-267:42']);
  const splitCandidates = [];
  for (const f of fields.filter((f) => f.field === 'verse' && f.text.split('#').length === 2)) {
    const [a, b] = f.text.split('#');
    const l = a.trim().split(/ +/u).at(-1), r = b.trim().split(/ +/u)[0];
    const lc = clean(l), rc = clean(r);
    if (/\u0640$/u.test(l) || /[\u060C\u061B\u061F!.,:]$/u.test(l) || normalBoundaries.has(`${f.poem_id}:${f.raw_number}`)) continue;
    const oneLetterContinuation = rc.length === 1 && rc !== 'أ';
    if (oneLetterContinuation || (known.has(lc + rc) && (rc.length <= 2 || freq.get(rc) === 1))) {
      splitCandidates.push({ ...f, left: l, right: r, joined: lc + rc });
      add(f, 'unmarked-split-word-candidate', 'needs-review', f.text.replace(/(\S)( *)#/u, '$1ـ$2#'), `Possible تدوير: ${l} + ${r}; marker only, no word reconstruction.`);
    }
  }
  return { files, poems, fields, proposals, keptHamza, canonicalChanges, splitCandidates };
}

export function planEdition(audit) {
  const replacements = new Map();
  for (const c of audit.canonicalChanges) {
    const prev = replacements.get(c.text);
    assert(!prev || prev === c.after, 'Conflicting canonical replacements');
    replacements.set(c.text, c.after);
  }
  const changedIntros = audit.canonicalChanges.filter((c) => c.field === 'intro');
  const mirrorCounts = {};
  const planned = [];
  function walk(value, key, file, at) {
    if (typeof value === 'string') {
      if (/https?:\/\//u.test(value)) return value;
      let after = replacements.get(value);
      if (after === undefined && ['main', 'appendix', 'start_of_appendix'].includes(key) && value) {
        const variants = new Set();
        for (const intro of changedIntros) {
          const start = intro.text.indexOf(value);
          if (start < 0) continue;
          const end = start + value.length;
          const edits = intro.edits.filter((e) => e.start >= start && e.end <= end).map((e) => ({ ...e, start: e.start - start, end: e.end - start }));
          if (edits.length) {
            const variant = applyEdits(value, edits);
            checkCertain(value, variant, edits);
            variants.add(variant);
          }
        }
        assert(variants.size <= 1, `Ambiguous intro mirror at ${file}:${at}`);
        after = [...variants][0];
      }
      if (after === undefined || after === value) return value;
      assert.equal(value.replace(/ /gu, ''), after.replace(/ /gu, ''), `Unsafe mirror ${file}:${at}`);
      mirrorCounts[file] = (mirrorCounts[file] ?? 0) + 1;
      return after;
    }
    if (Array.isArray(value)) return value.map((v, i) => walk(v, key, file, `${at}[${i}]`));
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, walk(v, k, file, `${at}.${k}`)]));
    return value;
  }
  for (const [file, { data, bytes }] of audit.files) {
    const after = walk(data, '', file, '$');
    if (mirrorCounts[file]) {
      const json = JSON.stringify(after);
      // Validate the entire JSON as well as each modified string.
      assert.equal(JSON.stringify(data).replace(/ /gu, ''), json.replace(/ /gu, ''), `Unsafe JSON change in ${file}`);
      planned.push({ file, before: bytes, after: json + (bytes.toString('utf8').endsWith('\n') ? '\n' : '') });
    }
  }
  return { planned, mirrorCounts };
}

export function selfTest() {
  const fix = (s, ctx = {}) => {
    const edits = spacingEdits(s, { poem_id: 'test', field: 'verse', raw_number: 1, ...ctx }).edits.filter((e) => e.confidence === 'certain');
    const after = applyEdits(s, edits); checkCertain(s, after, edits); return after;
  };
  assert.equal(fix('أ ما # أ لم'), 'أما # ألم');
  assert.equal(fix('أ لا تقول؟وكيف ،'), 'ألا تقول؟ وكيف،');
  assert.equal(fix('أ بغداد'), 'أ بغداد');
  assert.equal(fix('أ # ما'), 'أ # ما');
  assert.equal(fix('الجزأـ # أ ما'), 'الجزأـ # أ ما');
  assert.equal(fix('أ أرجو'), 'أ أرجو');
  assert.equal(fix('و؟؟؟الفا # رج'), 'و؟؟؟الفا # رج');
  assert.equal(fix('قد أ فلا', { poem_id: 'r1-243', raw_number: 12 }), 'قد أ فلا');
  assert.equal(fix('من النّدى أ لم', { poem_id: 'r2-198', raw_number: 2 }), 'من النّدى أ لم');
  assert.equal(fix('أ اللّه'), 'أ اللّه');
  assert.equal(fix('كلمة\u00A0،'), 'كلمة\u00A0،');
  assert.throws(() => checkCertain('أ ما', 'إما', [{ start: 1, end: 2, insert: '', confidence: 'certain', category: 'hamza-join-ما' }]));
  const a = auditCorpus();
  for (const c of a.canonicalChanges) {
    assert.equal(fix(c.after, c), c.after, `Non-idempotent: ${c.at}`);
  }
  const p = planEdition(a);
  const simulated = new Map([...a.files].map(([name, f]) => [name, { ...f, data: JSON.parse(p.planned.find((x) => x.file === name)?.after ?? f.bytes.toString('utf8')) }]));
  assert.equal(auditCorpus(simulated).canonicalChanges.length, 0, 'Second pass would make more certain changes');
  return { tests: 'passed', canonicalFields: a.canonicalChanges.length, files: p.planned.length };
}

function main() {
  const args = process.argv.slice(2);
  if (args.some((a) => !['--apply', '--self-test'].includes(a)) || args.length > 1) throw new Error('Usage: node tools/fix-text-issues.mjs [--apply | --self-test]');
  if (args.includes('--self-test')) { console.log(selfTest()); return; }
  const audit = auditCorpus();
  const plan = planEdition(audit);
  const counts = {};
  for (const row of audit.proposals.filter((r) => r.confidence === 'certain')) counts[row.category] = (counts[row.category] ?? 0) + 1;
  console.log(args.includes('--apply') ? 'APPLY: all safety checks passed before writes.' : 'DRY RUN: no files will be written.');
  console.table(counts);
  console.log(`Canonical fields: ${audit.canonicalChanges.length}; certain occurrences: ${Object.values(counts).reduce((a, b) => a + b, 0)}`);
  console.table(plan.mirrorCounts);
  console.log(`Edition files ${args.includes('--apply') ? 'to write' : 'that would change'}: ${plan.planned.length}`);
  if (args.includes('--apply')) {
    // Check all inputs for concurrent edits before writing the first file.
    for (const [file, { bytes }] of audit.files) assert(fs.readFileSync(path.join(EDITION, file)).equals(bytes), `Input changed during review: ${file}`);
    for (const f of plan.planned) fs.writeFileSync(path.join(EDITION, f.file), f.after, 'utf8');
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
