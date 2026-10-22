// Quick self-test for arabic-search.ts. Run: npx tsx src/scripts/_arabic-search.test.mts
import assert from 'node:assert/strict';
import { fold, queryTerms, findAll, highlight } from './arabic-search.ts';

const verse = 'أؤمّل ما أبقى الزّمان، وإنّما # سوالفه معقودة بالغوابر';
const f = fold(verse);
assert.equal(f.text, 'اومل ما ابقي الزمان وانما سوالفه معقوده بالغوابر');

// Diacritics and hamza forms in the query or the text don't matter.
assert.ok(findAll(f, queryTerms('الزمان', false)));
assert.ok(findAll(f, queryTerms('إنما', false)), 'inside joined waw');
assert.ok(findAll(f, queryTerms('معقودة', false)), 'ta marbuta');
assert.ok(findAll(f, queryTerms('ابقى الزمان', true)), 'exact phrase across punctuation');
assert.equal(findAll(f, queryTerms('الزمان ابقى', true)), null, 'exact keeps order');
assert.ok(findAll(f, queryTerms('الزمان ابقى', false)), 'flexible ignores order');
assert.equal(findAll(f, queryTerms('الدهر', false)), null);

// Highlight covers the original letters including the shadda.
const html = highlight(verse, findAll(f, queryTerms('الزمان', false))!);
assert.ok(html.includes('<mark>الزّمان</mark>'), html);
const html2 = highlight(verse, findAll(f, queryTerms('اومل', false))!);
assert.ok(html2.startsWith('<mark>أؤمّل</mark>'), html2);
assert.equal(highlight('<b>', []), '&lt;b&gt;');

console.log('arabic-search: all tests passed');
