# Progress

Where the rebuild stands. Short and current: what's done, what's next, what's open.
Rules and lasting decisions live in `AGENTS.md`; this file is the running log.

## Now
- Astro site built with the old site's identity: home, `/diwan/` (poem cards), 685 poem pages, 404, sitemap, robots. No JavaScript except the theme toggle and random poem buttons.

## Next
1. Poem page features from the old site: the "أنت تقرأ" bar, save (محفوظاتي), copy poem, reading settings.
2. Search (`/search`), with the word lists rebuilt from the edition text so `الزمان` finds `والزمان`. Then the filters on `/diwan/` (meter, rhyme).
3. The indexes (`/explore`) and the about page (`/about`), then the old tools one by one, each loading only on its own page.
4. Before launch: check performance and SEO on real phones, and submit the sitemap to Google Search Console and Bing.

## Open questions
- Custom domain or keep `diwan-alradi.pages.dev`? Easier to switch now, before the site is indexed.
- When to review the postponed text issues (detached hamza, punctuation spacing — see `AGENTS.md`).
- The old share image (`public/share.png`) shows empty boxes where the dots between words should be. Redraw it?
- Some poem intros (خبر القصيدة) contain stray note glosses mixed into the text (e.g. r1-001). Part of the text review.

## Done
- 2026-10-22: Old site reviewed; chose Astro, kept the URL structure, decisions recorded in `AGENTS.md`.
- 2026-10-22: Old site data extracted unchanged into `data/source/` (`tools/extract-legacy-data.mjs`).
- 2026-10-22: Detached waw joined into `data/edition/` (`tools/fix-detached-waw.mjs`), approved by the owner. Every change is listed in `reports/waw-changes.csv`.
- 2026-10-22: Old site unzipped into one clean `_original/` folder (deploy zip only; the code zip was a stripped copy of it). Removed generated poem pages, AI work logs, the Google verification file and the owner's email.
- 2026-10-22: Git set up. `_original/` and the zip files are left out of the repo (large, and they hold the owner's email).
- 2026-10-22: Astro site set up and rebuilt in the old site's identity (glass theme, Katibeh/Tajawal/Amiri, sidebar/top bar/bottom nav, light and dark). Poem page ~12KB gzipped (was over 1MB); CSS 12KB (was ~290KB); fonts ~175KB (was ~1.7MB plus Google Fonts). All 32,342 verse halves checked present and unchanged.
