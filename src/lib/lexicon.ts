// The glossary: words explained in the diwan's notes, each tied to the verse it explains.
import glossary from '../../data/edition/glossary-edition.json';
import poemEdition from '../../data/edition/poem-edition.json';
import { poems, poemById } from './diwan';
import type { Poem, Verse } from './diwan';
import { fold } from '../scripts/arabic-search';

type RawEntry = (typeof glossary.entries)[number];
const quoted = poemEdition.quoted_preface_verses as Record<string, { count: number }>;

export interface Gloss {
  meaning: string;
  note: string;
  poem: Poem;
  verse?: Verse;
  page: number;
  source?: string;
}

export interface Word {
  headword: string;
  /** For sorting and grouping: the word without the article. */
  bare: string;
  letter: string;
  glosses: Gloss[];
  /** Other verses in the diwan that contain the word (first 12) and the total. */
  occurrences: { poem: Poem; verse: Verse }[];
  occurrenceCount: number;
}

const stripArticle = (w: string) => w.replace(/^ال(?=..)/, '');

const words = new Map<string, Word>();
for (const e of glossary.entries as RawEntry[]) {
  const poem = poemById.get(e.poem_id);
  if (!poem) continue;
  const n = e.verse - (quoted[e.poem_id]?.count ?? 0);
  const gloss: Gloss = {
    meaning: e.meaning,
    note: e.note_text.replace(/^\s*\(\s*[\d٠-٩]+\s*\)\s*/, ''),
    poem,
    verse: poem.verses[n - 1],
    page: e.page,
    source: e.source_url || undefined,
  };
  const bare = stripArticle(e.headword);
  if (!words.has(e.headword)) {
    words.set(e.headword, {
      headword: e.headword,
      bare,
      letter: fold(bare).text[0] ?? '',
      glosses: [],
      occurrences: [],
      occurrenceCount: 0,
    });
  }
  words.get(e.headword)!.glosses.push(gloss);
}

// Find the word elsewhere in the diwan (diacritics and hamza forms ignored).
const foldedVerses = poems.flatMap((poem) =>
  poem.verses.map((verse) => ({ poem, verse, text: ` ${fold(`${verse.sadr} ${verse.ajuz ?? ''}`).text} ` })),
);
for (const word of words.values()) {
  const needle = fold(word.headword).text;
  const hits = foldedVerses.filter((v) => v.text.includes(needle));
  word.occurrenceCount = hits.length;
  const glossed = new Set(word.glosses.map((g) => `${g.poem.id}#${g.verse?.n}`));
  word.occurrences = hits.filter((h) => !glossed.has(`${h.poem.id}#${h.verse.n}`)).slice(0, 12);
}

export const lexicon: Word[] = [...words.values()].sort((a, b) => a.bare.localeCompare(b.bare, 'ar'));

/** Words grouped by their first letter (after the article). */
export const lexiconByLetter = (() => {
  const groups = new Map<string, Word[]>();
  for (const w of lexicon) {
    if (!groups.has(w.letter)) groups.set(w.letter, []);
    groups.get(w.letter)!.push(w);
  }
  return [...groups];
})();

export const wordHref = (w: Word | string) => `/word/${typeof w === 'string' ? w : w.headword}/`;

/** Glossary words per verse, keyed "poemId#verseNumber", for links from poem pages. */
export const wordsByVerse = (() => {
  const map = new Map<string, string[]>();
  for (const w of lexicon) {
    for (const g of w.glosses) {
      if (!g.verse) continue;
      const key = `${g.poem.id}#${g.verse.n}`;
      if (!map.has(key)) map.set(key, []);
      if (!map.get(key)!.includes(w.headword)) map.get(key)!.push(w.headword);
    }
  }
  return map;
})();
