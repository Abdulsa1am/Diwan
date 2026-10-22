// Loads the verse index (/search-index.json) once, for tools that work on the whole diwan.
import { fold } from './arabic-search';

export type PoemRow = [id: string, title: string, meter: string, rhyme: string, volume: number];
export interface CorpusVerse {
  poem: number;
  n: number;
  text: string;
  /** Normalized words of the verse, in order (both halves). */
  words: string[];
}
export interface Corpus {
  poems: PoemRow[];
  verses: CorpusVerse[];
  /** The most common spelling in the diwan of a normalized word (e.g. "الي" -> "إلى"). */
  spell: (folded: string) => string;
}

let loading: Promise<Corpus> | null = null;

export function loadCorpus(): Promise<Corpus> {
  loading ??= fetch('/search-index.json')
    .then((r) => {
      if (!r.ok) throw new Error(`search index: ${r.status}`);
      return r.json();
    })
    .then((data: { poems: PoemRow[]; verses: [number, number, string][] }) => {
      const spellings = new Map<string, Map<string, number>>();
      const verses = data.verses.map(([poem, n, text]) => {
        const words: string[] = [];
        for (const raw of text.replace(' # ', ' ').split(/\s+/)) {
          // Keep Arabic letters and diacritics only (drops punctuation and tatweel).
          const original = raw.replace(/[^\u0621-\u0652\u0670]/g, '');
          const folded = fold(original).text;
          if (!folded) continue;
          words.push(folded);
          if (!spellings.has(folded)) spellings.set(folded, new Map());
          const m = spellings.get(folded)!;
          m.set(original, (m.get(original) ?? 0) + 1);
        }
        return { poem, n, text, words };
      });
      const best = new Map(
        [...spellings].map(([folded, m]) => [folded, [...m].sort((a, b) => b[1] - a[1])[0][0]]),
      );
      return { poems: data.poems, verses, spell: (w: string) => best.get(w) ?? w };
    });
  return loading;
}
