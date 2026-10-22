// Arabic-aware matching, same rules as the old site:
// ignore diacritics and tatweel, treat أ إ آ ٱ as ا, ى as ي, ؤ as و, ئ as ي, ة as ه, drop punctuation.
// Each normalized string keeps a map back to the original text so matches can be highlighted.

const DIACRITICS = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/;
const FOLD: Record<string, string> = { 'إ': 'ا', 'أ': 'ا', 'آ': 'ا', 'ٱ': 'ا', 'ى': 'ي', 'ؤ': 'و', 'ئ': 'ي', 'ة': 'ه' };

export interface Folded {
  text: string;
  /** For each character of `text`, its index in the original string. */
  map: number[];
}

/** Normalize and remember where each kept character came from. */
export function fold(original: string): Folded {
  let text = '';
  const map: number[] = [];
  let lastWasSpace = true;
  for (let i = 0; i < original.length; i++) {
    const ch = original[i];
    if (DIACRITICS.test(ch)) continue;
    const folded = FOLD[ch] ?? ch;
    const isLetter = /[\u0621-\u064A0-9a-z]/i.test(folded);
    if (!isLetter) {
      if (!lastWasSpace) {
        text += ' ';
        map.push(i);
        lastWasSpace = true;
      }
      continue;
    }
    text += folded.toLowerCase();
    map.push(i);
    lastWasSpace = false;
  }
  if (text.endsWith(' ')) {
    text = text.slice(0, -1);
    map.pop();
  }
  return { text, map };
}

/** Normalized query terms. In exact mode the whole query is one phrase. */
export function queryTerms(query: string, exact: boolean): string[] {
  const q = fold(query).text;
  if (!q) return [];
  return exact ? [q] : [...new Set(q.split(' ').filter(Boolean))];
}

/** Ranges [start, end) in the ORIGINAL text for every term, or null if a term is missing. */
export function findAll(f: Folded, terms: string[]): [number, number][] | null {
  const ranges: [number, number][] = [];
  for (const term of terms) {
    let at = f.text.indexOf(term);
    if (at < 0) return null;
    while (at >= 0) {
      const start = f.map[at];
      const endFolded = at + term.length - 1;
      // Extend the end over diacritics that follow the last matched letter.
      let end = f.map[endFolded] + 1;
      const nextKept = f.map[endFolded + 1];
      if (nextKept !== undefined) end = Math.max(end, nextKept);
      ranges.push([start, end]);
      at = f.text.indexOf(term, at + term.length);
    }
  }
  return ranges;
}

/** Wrap ranges of `original` in <mark>, escaping everything else. */
export function highlight(original: string, ranges: [number, number][]): string {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  if (!ranges.length) return esc(original);
  const sorted = [...ranges].sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  for (const r of sorted) {
    const last = merged.at(-1);
    if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
    else merged.push([...r]);
  }
  let out = '';
  let pos = 0;
  for (const [s, e] of merged) {
    // Trim trailing spaces out of the mark.
    let end = e;
    while (end > s && /\s/.test(original[end - 1])) end--;
    out += esc(original.slice(pos, s)) + '<mark>' + esc(original.slice(s, end)) + '</mark>';
    pos = end;
  }
  return out + esc(original.slice(pos));
}
