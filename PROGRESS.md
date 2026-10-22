# Progress

Where the rebuild stands. Short and current: what's done, what's next, what's open.
Rules and lasting decisions live in `AGENTS.md`; this file is the running log.

## Now
- Data is extracted and the edition is built. The Astro site hasn't started yet.

## Next
1. Set up the Astro project and fill in **Commands** in `AGENTS.md`.
2. Build the poem page (`/poem/r1-227/`) from `data/edition/`: verse layout, font, RTL, every verse as visible HTML.
3. Rebuild the search word lists from the edition text, so `الزمان` finds `والزمان`.
4. Home page and the poem index (by volume, meter, rhyme).
5. Check performance and SEO on phone and desktop widths.
6. Move the old tools over one by one, each loading only on its own page.

## Open questions
- Custom domain or keep `diwan-alradi.pages.dev`? Easier to switch now, before the site is indexed.
- When to review the postponed text issues (detached hamza, punctuation spacing — see `AGENTS.md`).

## Done
- 2026-10-22: Old site reviewed; chose Astro, kept the URL structure, decisions recorded in `AGENTS.md`.
- 2026-10-22: Old site data extracted unchanged into `data/source/` (`tools/extract-legacy-data.mjs`).
- 2026-10-22: Detached waw joined into `data/edition/` (`tools/fix-detached-waw.mjs`), approved by the owner. Every change is listed in `reports/waw-changes.csv`.
- 2026-10-22: Git set up. `_original/` and the zip files are left out of the repo (large, and they hold the owner's email).
