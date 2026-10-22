// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  // Change here if the site moves to its own domain (see PROGRESS.md, open questions).
  site: 'https://diwan-alradi.pages.dev',
  output: 'static',
  build: { format: 'directory' },
});
