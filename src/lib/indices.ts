// Index data for /explore pages: groups of poems by meter, rhyme, theme, and names.
import indices from '../../data/edition/indices.json';
import { poems, poemById } from './diwan';
import type { Poem } from './diwan';
import { arCount } from '../scripts/shared';

export interface Group {
  key: string;
  label: string;
  poems: Poem[];
  /** Extra line under the label. */
  note?: string;
}

function groupBy(key: (p: Poem) => string, label: (k: string) => string = (k) => k): Group[] {
  const map = new Map<string, Poem[]>();
  for (const p of poems) {
    const k = key(p);
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(p);
  }
  return [...map].map(([k, list]) => ({ key: k, label: label(k), poems: list }));
}

/** Meters, most used first. */
export const meterGroups = groupBy((p) => p.meter).sort((a, b) => b.poems.length - a.poems.length);

/** Rhyme letters in alphabetical (abjad-hija'i) order, as the diwan orders them. */
export const rhymeGroups = groupBy((p) => p.rhyme, (k) => `قافية ${k}`);

/** Themes (أغراض) from the friend's classification; a poem can have several. */
export const themeGroups: Group[] = Object.entries(indices.themes as Record<string, string[]>)
  .map(([theme, ids]) => ({
    key: theme,
    label: theme,
    poems: ids.map((id) => poemById.get(id)).filter((p): p is Poem => Boolean(p)),
  }))
  .sort((a, b) => b.poems.length - a.poems.length);

export const themedPoemCount = new Set(themeGroups.flatMap((g) => g.poems.map((p) => p.id))).size;

type Entity = { name: string; type: string; count: number; poems: number; ids: string[] };
const entities = indices.entities as Entity[];

/** Names that occur in the verses: people and places. */
export const entityGroups = (type: 'علم' | 'موضع'): Group[] =>
  entities
    .filter((e) => e.type === type)
    .map((e) => ({
      key: e.name,
      label: e.name,
      poems: e.ids.map((id) => poemById.get(id)).filter((p): p is Poem => Boolean(p)),
      note: `ورد ${arCount(e.count, ['مرة واحدة', 'مرتين', 'مرات', 'مرة'])} في الأبيات`,
    }));

/** Stable, readable fragment id for an index group. */
export const anchor = (key: string) => key.replace(/\s+/g, '-');
