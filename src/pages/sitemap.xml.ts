import type { APIRoute } from 'astro';
import { poems } from '../lib/diwan';
import { indexablePages } from '../lib/nav';

export const GET: APIRoute = ({ site }) => {
  const paths = [...indexablePages, ...poems.map((p) => `/poem/${p.id}/`)];
  const urls = paths.map((path) => `<url><loc>${new URL(path, site).href}</loc></url>`).join('');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml' } },
  );
};
