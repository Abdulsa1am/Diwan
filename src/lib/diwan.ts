// Reads the edition data (data/edition/) and shapes it for the pages.
import corpus from '../../data/edition/data.json';
import poemEdition from '../../data/edition/poem-edition.json';
import noteEdition from '../../data/edition/note-edition.json';
import editorial from '../../data/edition/editorial.json';

export interface Verse {
  /** 1-based number among the poet's own verses (quoted lines are not counted). */
  n: number;
  sadr: string;
  /** Missing for single-line verses (no "#" in the data). */
  ajuz?: string;
  /** Notes verified against the printed page to belong to this verse. */
  notes: string[];
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
  /** The poem's story (خبر القصيدة), without glosses that the source mixed into it. */
  intro: string;
  /** Glosses that sat inside the intro in the source, with no verse attached. */
  introGlosses: string;
  /** Notes of this poem that are not linked to a verse. */
  notes: string[];
  /** Count of notes linked to verses. */
  linkedNoteCount: number;
  verses: Verse[];
  /** Lines by another poet that open the entry (e.g. al-Sabi's letter), shown apart. */
  quotation?: Quotation;
}

type RawPoem = (typeof corpus.poems)[number];
type QuotedPreface = { count: number; attribution: string };
type MeterNote = { display: string };
type LinkedNote = { source_poem: string; source_index: number; verse: number; text: string };
type IntroSegment = { main: string; appendix: string };
type Boundary = { start_of_appendix: string };

const quoted = poemEdition.quoted_preface_verses as Record<string, QuotedPreface>;
const meterDisplay = poemEdition.meter_normalization as Record<string, MeterNote>;
const linkedNotes = noteEdition.notes as Record<string, LinkedNote[]>;
const introSegments = editorial.reviewed_intro_segments as Record<string, IntroSegment>;
const introBoundaries = {
  ...(editorial.intro_boundaries as Record<string, Boundary>),
  ...(noteEdition.intro.confirmed_boundaries as Record<string, Boundary>),
};

/** Raw notes ("poem#index") that the note edition placed under a verse somewhere. */
const placedRawNotes = new Set(
  Object.values(linkedNotes).flatMap((list) => list.map((n) => `${n.source_poem}#${n.source_index}`)),
);

/** "(3) الذّماء: …" -> "الذّماء: …" when shown under its verse. */
const stripNoteNumber = (text: string) => text.replace(/^\s*\(\s*[\d٠-٩]+\s*\)\s*/, '');

function splitIntro(id: string, intro: string): { intro: string; introGlosses: string } {
  const segment = introSegments[id];
  if (segment) return { intro: segment.main.trim(), introGlosses: segment.appendix.trim() };
  const boundary = introBoundaries[id]?.start_of_appendix;
  const at = boundary ? intro.indexOf(boundary) : -1;
  if (at > 0) return { intro: intro.slice(0, at).trim(), introGlosses: intro.slice(at).trim() };
  return { intro: intro.trim(), introGlosses: '' };
}

function shape(raw: RawPoem): Poem {
  const skip = quoted[raw.id]?.count ?? 0;
  const verses: Verse[] = raw.verses.slice(skip).map((line, i) => {
    const [sadr, ajuz] = line.split('#').map((part) => part.trim());
    return { n: i + 1, sadr, ajuz: ajuz || undefined, notes: [] };
  });

  let linkedNoteCount = 0;
  const strays: string[] = [];
  for (const note of linkedNotes[raw.id] ?? []) {
    const verse = verses[note.verse - 1 - skip];
    if (verse) {
      verse.notes.push(stripNoteNumber(note.text));
      linkedNoteCount += 1;
    } else {
      strays.push(note.text);
    }
  }

  const ownNotes = (raw.notes ?? []).filter((_, i) => !placedRawNotes.has(`${raw.id}#${i}`));

  return {
    id: raw.id,
    volume: raw.volume,
    title: raw.title,
    meter: meterDisplay[raw.id]?.display ?? raw.meter,
    rhyme: raw.rhyme,
    qafiya: raw.qafiya,
    startPage: raw.start_page,
    endPage: raw.end_page,
    ...splitIntro(raw.id, raw.intro ?? ''),
    notes: [...strays, ...ownNotes],
    linkedNoteCount,
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
