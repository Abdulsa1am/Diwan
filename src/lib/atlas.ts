// Places named in the diwan (the friend's reviewed atlas) and the base map they sit on.
import atlas from '../../data/edition/atlas.json';
import basemap from '../../data/edition/basemap.json';
import poemEdition from '../../data/edition/poem-edition.json';
import { poemById } from './diwan';
import type { Poem, Verse } from './diwan';

type Ref = [string, number];
type RawPlace = {
  kind: string;
  lat: number | null;
  lon: number | null;
  certainty: string;
  modern?: string;
  note?: string;
  sources?: { label: string; url: string }[];
  corpus: { confirmedVerseRefs: Ref[]; derivedVerseRefs?: Ref[]; genericVerseRefs?: Ref[] };
  evidence?: { poem: string; kind: string; text: string }[];
};

const quoted = poemEdition.quoted_preface_verses as Record<string, { count: number }>;

export const KIND_LABELS: Record<string, string> = {
  city: 'مدينة',
  place: 'موضع',
  mountain: 'جبل',
  valley: 'وادٍ',
  historical: 'موضع تاريخي',
  region: 'إقليم',
  'sacred-site': 'مشهد ومقام',
  settlement: 'بلدة',
  water: 'ماء',
  river: 'نهر',
  pass: 'ثنيّة',
  well: 'بئر',
};

export interface VerseRef {
  poem: Poem;
  verse: Verse;
}

export interface Place {
  name: string;
  kind: string;
  kindLabel: string;
  lat?: number;
  lon?: number;
  certainty: string;
  modern?: string;
  note?: string;
  sources: { label: string; url: string }[];
  verses: VerseRef[];
  /** Mentions by relation (e.g. a people or product named after the place). */
  indirect: VerseRef[];
  notes: { poem: Poem; text: string }[];
}

const resolve = (refs: Ref[] = []): VerseRef[] =>
  refs.flatMap(([id, n]) => {
    const poem = poemById.get(id);
    const verse = poem?.verses[n - 1 - (quoted[id]?.count ?? 0)];
    return poem && verse ? [{ poem, verse }] : [];
  });

export const places: Place[] = Object.entries(atlas.entries as unknown as Record<string, RawPlace>)
  .map(([name, p]) => ({
    name,
    kind: p.kind,
    kindLabel: KIND_LABELS[p.kind] ?? 'موضع',
    lat: p.lat ?? undefined,
    lon: p.lon ?? undefined,
    certainty: p.certainty,
    modern: p.modern && p.modern !== name ? p.modern : undefined,
    note: p.note,
    sources: (p.sources ?? []).filter((s) => s.url),
    verses: resolve(p.corpus.confirmedVerseRefs),
    indirect: resolve([...(p.corpus.derivedVerseRefs ?? []), ...(p.corpus.genericVerseRefs ?? [])]),
    notes: (p.evidence ?? [])
      .filter((e) => e.kind === 'حاشية')
      .flatMap((e) => {
        const poem = poemById.get(e.poem);
        return poem ? [{ poem, text: e.text.replace(/^\s*\(\s*[\d٠-٩]+\s*\)\s*/, '') }] : [];
      }),
  }))
  .sort((a, b) => b.verses.length - a.verses.length || a.name.localeCompare(b.name, 'ar'));

export const placeHref = (p: Place | string) => `/place/${typeof p === 'string' ? p : p.name}/`;

/* ---------- Map projection (same as the old site's base map) ---------- */
const [lonMin, latMin, lonMax, latMax] = basemap.extent as [number, number, number, number];
const [, , width, height] = basemap.viewBox as [number, number, number, number];
export const mapViewBox = basemap.viewBox.join(' ');
export const project = (lat: number, lon: number) => ({
  x: ((lon - lonMin) / (lonMax - lonMin)) * width,
  y: ((latMax - lat) / (latMax - latMin)) * height,
});
export const countryPaths = Object.entries(basemap.paths as Record<string, string>);

/** Rivers as SVG polylines from [lat, lon] pairs. */
export const rivers = Object.entries(atlas.riverPaths as unknown as Record<string, [number, number][]>).map(
  ([name, coords]) => ({
    name,
    points: coords
      .map(([lat, lon]) => {
        const { x, y } = project(lat, lon);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' '),
  }),
);
