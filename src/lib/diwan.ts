// Reads the edition data (data/edition/) and shapes it for the pages.
import corpus from '../../data/edition/data.json';
import poemEdition from '../../data/edition/poem-edition.json';

export interface Verse {
  /** 1-based number among the poet's own verses (quoted lines are not counted). */
  n: number;
  sadr: string;
  /** Missing for single-line verses (no "#" in the data). */
  ajuz?: string;
}

export interface Quotation {
  attribution: string;
  lines: string[];
}

export interface Poem {
  id: string;
  volume: number;
  title: string;
  meter: string;
  rhyme: string;
  qafiya: string;
  startPage: string;
  endPage: string;
  intro: string;
  notes: string[];
  verses: Verse[];
  /** Lines by another poet that open the entry (e.g. al-Sabi's letter), shown apart. */
  quotation?: Quotation;
}

type RawPoem = (typeof corpus.poems)[number];
type QuotedPreface = { count: number; attribution: string };
type MeterNote = { display: string };

const quoted = poemEdition.quoted_preface_verses as Record<string, QuotedPreface>;
const meterDisplay = poemEdition.meter_normalization as Record<string, MeterNote>;

function shape(raw: RawPoem): Poem {
  const skip = quoted[raw.id]?.count ?? 0;
  const verses = raw.verses.slice(skip).map((line, i) => {
    const [sadr, ajuz] = line.split('#').map((part) => part.trim());
    return { n: i + 1, sadr, ajuz: ajuz || undefined };
  });
  return {
    id: raw.id,
    volume: raw.volume,
    title: raw.title,
    meter: meterDisplay[raw.id]?.display ?? raw.meter,
    rhyme: raw.rhyme,
    qafiya: raw.qafiya,
    startPage: raw.start_page,
    endPage: raw.end_page,
    intro: raw.intro ?? '',
    notes: raw.notes ?? [],
    verses,
    quotation: skip
      ? { attribution: quoted[raw.id].attribution, lines: raw.verses.slice(0, skip) }
      : undefined,
  };
}

export const poems: Poem[] = corpus.poems.map(shape);

export const poemById = new Map(poems.map((p) => [p.id, p]));

/** Poems per volume. Ids run without gaps (r1-001 … r1-380), so the random-poem button only needs these. */
export const volumeSizes = [1, 2].map((v) => poems.filter((p) => p.volume === v).length);

const arabicDigits = new Intl.NumberFormat('ar-EG', { useGrouping: false });
/** 227 -> "٢٢٧" */
export const ar = (n: number | string) => arabicDigits.format(Number(n));

/** Verse count with the right Arabic noun form: بيت، بيتان، ٥ أبيات، ٥٥ بيتًا. */
export function versesLabel(n: number) {
  if (n === 1) return 'بيت واحد';
  if (n === 2) return 'بيتان';
  const tail = n % 100;
  if (tail >= 3 && tail <= 10) return `${ar(n)} أبيات`;
  return `${ar(n)} بيتًا`;
}

/** One hemistich pair as plain text, for titles and descriptions. */
export const verseText = (v: Verse) => (v.ajuz ? `${v.sadr} ... ${v.ajuz}` : v.sadr);

export const POET = 'الشريف الرضي';
export const SITE_NAME = 'ديوان الشريف الرضي';
