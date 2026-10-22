// @ts-check
import { defineConfig } from 'astro/config';

// The site's public address, used for canonical links, the sitemap and robots.txt.
// It is the Cloudflare Pages address of this project (see README.md). Override with SITE_URL if it moves.
const site = process.env.SITE_URL ?? 'https://diwan-alradi.pages.dev';

export default defineConfig({
  site,
  output: 'static',
  build: { format: 'directory' },
});
