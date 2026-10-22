# Progress

Where the rebuild stands. Short and current: what's done, what's next, what's open.
Rules and lasting decisions live in `AGENTS.md`; this file is the running log.

## Now
- M2: saved poems and the home page.

## Plan (working through it without stopping; commit + update this file after each milestone)
UX problems to fix are listed with evidence in `reports/ux-audit.md`.

- [x] **M1 Poem page reading.** Notes under their verses (verified links), cleaned intros, slim reading bar with progress, verse menu (copy verse, copy link), copy poem, save poem, reading settings (font size, side-by-side or stacked). Poem visible on the first phone screen.
- [ ] **M2 Saved and home.** `/saved` (محفوظاتي), "continue reading", verse of the day, home entry points.
- [ ] **M3 Search.** `/search` with Arabic-aware matching (diacritics, alef/ya forms, joined waw), filters, highlighted results linking to the verse. Filters on `/diwan/`.
- [ ] **M4 Indexes.** `/explore` hub, meters, rhymes (qafiya), first lines (matali), themes (أغراض الشعر), people (entities).
- [ ] **M5 About.** `/about` (the poet and the edition), from the old site's text and the people catalog.
- [ ] **M6 Lexicon.** `/explore/lexicon` from the glossary (344 entries).
- [ ] **M7 Atlas.** `/explore/atlas` map of places from the atlas data.
- [ ] **M8 Other tools.** Rhyme wheel, relations, phrases, compare, stats: build what the data supports; list what can't be.
- [ ] **M9 Final QA.** Broken-link check over the whole build, accessibility, performance, SEO, phone and desktop, light and dark.

## Open questions
- Custom domain or keep `diwan-alradi.pages.dev`? Easier to switch now, before the site is indexed.
- When to review the postponed text issues (detached hamza, punctuation spacing — see `AGENTS.md`).
- The old share image (`public/share.png`) shows empty boxes where the dots between words should be. Redraw it?
- Some poem intros (خبر القصيدة) contain stray note glosses mixed into the text (e.g. r1-001). Part of the text review.

## Done
- 2026-10-22: **M1** Poem page: 1,764 verified notes under their verses (all 6,324 notes accounted for), cleaned intros for 121 poems, verse menu (copy, cite, link, share), save, copy/share poem, reading settings (size, layout), reading bar with progress, bars hide while reading on phones. First verse now on the first phone screen (457px; old site 933px). Added `npm run verify` (verse integrity, broken links, page basics, privacy) and `npm run check`.
- 2026-10-22: Old site reviewed; chose Astro, kept the URL structure, decisions recorded in `AGENTS.md`.
- 2026-10-22: Old site data extracted unchanged into `data/source/` (`tools/extract-legacy-data.mjs`).
- 2026-10-22: Detached waw joined into `data/edition/` (`tools/fix-detached-waw.mjs`), approved by the owner. Every change is listed in `reports/waw-changes.csv`.
- 2026-10-22: Old site unzipped into one clean `_original/` folder (deploy zip only; the code zip was a stripped copy of it). Removed generated poem pages, AI work logs, the Google verification file and the owner's email.
- 2026-10-22: Git set up. `_original/` and the zip files are left out of the repo (large, and they hold the owner's email).
- 2026-10-22: Astro site set up and rebuilt in the old site's identity (glass theme, Katibeh/Tajawal/Amiri, sidebar/top bar/bottom nav, light and dark). Poem page ~12KB gzipped (was over 1MB); CSS 12KB (was ~290KB); fonts ~175KB (was ~1.7MB plus Google Fonts). All 32,342 verse halves checked present and unchanged.
