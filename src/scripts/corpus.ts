// Loads the verse index (/search-index.json) once, for tools that work on the whole diwan.
import { analysisWords } from './analysis-words.mjs';
export { analysisWords } from './analysis-words.mjs';

export type PoemRow = [id: string, title: string, meter: string, rhyme: string, volume: number];
export interface CorpusVerse {
  poem: number;
  n: number;
  text: string;
  /** Normalized words of the verse, in order (both halves). */
  words: string[];
  /** Original-text offsets, including both fragments of a marked split word. */
  wordRanges: [number, number][];
}
export interface Corpus {
  poems: PoemRow[];
  verses: CorpusVerse[];
  /** The most common spelling in the diwan of a normalized word (e.g. "الي" -> "إلى"). */
  spell: (folded: string) => string;
}

/** Exact token matches mapped to unchanged display text, including split words. */
export function phraseRanges(verse: CorpusVerse, terms: string[]): [number, number][] {
  const ranges: [number, number][] = [];
  for (let i = 0; i + terms.length <= verse.words.length; i++) {
    if (terms.every((term, k) => verse.words[i + k] === term)) {
      ranges.push([verse.wordRanges[i][0], verse.wordRanges[i + terms.length - 1][1]]);
    }
  }
  return ranges;
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
        const { words, originals, wordRanges } = analysisWords(text);
        words.forEach((word, i) => {
          if (!spellings.has(word)) spellings.set(word, new Map());
          const m = spellings.get(word)!;
          m.set(originals[i], (m.get(originals[i]) ?? 0) + 1);
        });
        return { poem, n, text, words, wordRanges };
      });
      const best = new Map(
        [...spellings].map(([folded, m]) => [folded, [...m].sort((a, b) => b[1] - a[1])[0][0]]),
      );
      return { poems: data.poems, verses, spell: (w: string) => best.get(w) ?? w };
    })
    .catch((error: unknown) => {
      loading = null;
      throw error;
    });
  return loading;
}
