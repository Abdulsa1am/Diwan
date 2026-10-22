// Joins the detached conjunction waw ("و إنّما" -> "وإنّما") in every text value of the data.
// The detached form is an artifact of the EPUB the text came from; reference editions write it joined.
//
// Reads data/source/*.json (left untouched), writes data/edition/*.json and
// reports/waw-changes.csv listing every changed string.
// Safety check: for every change, the text with all whitespace removed must be identical
// before and after, so only spaces can ever be removed. The script stops if that fails.
//
// Usage: node tools/fix-detached-waw.mjs
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const srcDir = path.join(root, 'data/source');
const outDir = path.join(root, 'data/edition');
const reportDir = path.join(root, 'reports');

// One or more standalone "و" (at the start, or after a space, hemistich mark "#" or punctuation),
// each followed by spaces, and then an Arabic letter. "و و اللّه" -> "وواللّه".
const DETACHED_WAW = /(^|[\s#،,.!?؟:؛«»"()\-—])((?:و\s+)+)(?=[\u0621-\u064A])/g;

// A word split across the two halves of a verse is marked with a tatweel before "#":
// in "بالعفـ # و و كشّاف" the first "و" ends the word "العفو", so it keeps its space.
const SPLIT_WORD_BEFORE = /ـ\s*#\s*$/;

export const joinDetachedWaw = (text) =>
  text.replace(DETACHED_WAW, (match, pre, chain, offset, whole) => {
    let waws = chain.match(/و/g).length;
    let kept = '';
    if (SPLIT_WORD_BEFORE.test(whole.slice(0, offset) + pre)) {
      kept = chain.match(/^و\s+/)[0];
      waws -= 1;
    }
    return pre + kept + 'و'.repeat(waws);
  });

const stripSpace = (s) => s.replace(/\s+/g, '');
const csvCell = (s) => '"' + String(s).replace(/"/g, '""') + '"';

function walk(value, at, onChange) {
  if (typeof value === 'string') {
    if (/^https?:\/\//.test(value)) return value; // never touch links
    const fixed = joinDetachedWaw(value);
    if (fixed !== value) onChange(at, value, fixed);
    return fixed;
  }
  if (Array.isArray(value)) return value.map((v, i) => walk(v, `${at}[${i}]`, onChange));
  if (value && typeof value === 'object') {
    // Keys are ids and field names, so only values are changed.
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, walk(v, `${at}.${k}`, onChange)]));
  }
  return value;
}

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(reportDir, { recursive: true });

const rows = ["file,path,removed_spaces,before,after"];
const summary = {};
for (const file of fs.readdirSync(srcDir).filter((f) => f.endsWith('.json')).sort()) {
  const data = JSON.parse(fs.readFileSync(path.join(srcDir, file), 'utf8'));
  let strings = 0;
  let joins = 0;
  const fixed = walk(data, '$', (at, before, after) => {
    if (stripSpace(before) !== stripSpace(after)) {
      throw new Error(`Letters changed in ${file} at ${at} — stopping.`);
    }
    const removedSpaces = before.length - after.length;
    strings += 1;
    joins += removedSpaces;
    rows.push([file, at, removedSpaces, before, after].map(csvCell).join(','));
  });
  fs.writeFileSync(path.join(outDir, file), JSON.stringify(fixed));
  summary[file] = { changedStrings: strings, joins };
}

fs.writeFileSync(path.join(reportDir, 'waw-changes.csv'), '﻿' + rows.join('\n'));
console.table(summary);
