// Search data for /search, downloaded only when someone searches.
// Compact arrays keep it small: poems as [id, title, meter, rhyme, volume], verses as [poem, n, text].
import type { APIRoute } from 'astro';
import { poems } from '../lib/diwan';

export const GET: APIRoute = () => {
  const body = {
    poems: poems.map((p) => [p.id, p.title, p.meter, p.rhyme, p.volume]),
    verses: poems.flatMap((p, i) => p.verses.map((v) => [i, v.n, v.ajuz ? `${v.sadr} # ${v.ajuz}` : v.sadr])),
  };
  return new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json' } });
};
