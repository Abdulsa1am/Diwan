// Notes and intros for /search, downloaded only when someone searches in them.
// Entries are [poem index, verse number (0 = not tied to a verse), text].
import type { APIRoute } from 'astro';
import { poems } from '../lib/diwan';

export const GET: APIRoute = () => {
  const notes = poems.flatMap((p, i) => [
    ...p.verses.flatMap((v) => v.notes.map((text) => [i, v.n, text])),
    ...p.notes.map((text) => [i, 0, text]),
  ]);
  const intros = poems.flatMap((p, i) => (p.intro ? [[i, 0, p.intro]] : []));
  return new Response(JSON.stringify({ notes, intros }), { headers: { 'Content-Type': 'application/json' } });
};
