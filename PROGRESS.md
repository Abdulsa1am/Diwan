# Progress

Where the rebuild stands. Short and current: what's done, what's next, what's open.
Rules and lasting decisions live in `AGENTS.md`; this file is the running log.

## Now
- M8: other tools.

## Plan (working through it without stopping; commit + update this file after each milestone)
UX problems to fix are listed with evidence in `reports/ux-audit.md`.

- [x] **M1 Poem page reading.** Notes under their verses (verified links), cleaned intros, slim reading bar with progress, verse menu (copy verse, copy link), copy poem, save poem, reading settings (font size, side-by-side or stacked). Poem visible on the first phone screen.
- [x] **M2 Saved and home.** `/saved` (محفوظاتي), "continue reading", verse of the day, home entry points.
- [x] **M3 Search.** `/search` with Arabic-aware matching (diacritics, alef/ya forms, joined waw), filters, highlighted results linking to the verse. Filters on `/diwan/`.
- [x] **M4 Indexes.** `/explore` hub, meters, rhymes (qafiya), first lines (matali), themes (أغراض الشعر), people (entities).
- [x] **M5 About.** `/about` (the poet and the edition), from the old site's text and the people catalog.
- [x] **M6 Lexicon.** `/explore/lexicon` from the glossary (344 entries).
- [x] **M7 Atlas.** `/explore/atlas` map of places from the atlas data.
- [ ] **M8 Other tools.** Rhyme wheel, relations, phrases, compare, stats: build what the data supports; list what can't be.
- [ ] **M9 Final QA.** Broken-link check over the whole build, accessibility, performance, SEO, phone and desktop, light and dark.

## Open questions
- Custom domain or keep `diwan-alradi.pages.dev`? Easier to switch now, before the site is indexed.
- When to review the postponed text issues (detached hamza, punctuation spacing — see `AGENTS.md`).
- The old share image (`public/share.png`) shows empty boxes where the dots between words should be. Redraw it?
- The old base map has no Iran outline, so al-Ahwaz sits on empty ground. Add Iran to `basemap.json`?
- Intros: 121 poems are cleaned using the friend's reviewed boundaries (M1). Other intros may still hold stray glosses. Part of the text review.

## Done
- 2026-10-22: **M7** `/explore/atlas/`: static SVG map (the old base map, Tigris and Euphrates, 32 mapped places sized by citations, labels placed without overlaps) and all 133 places by kind. A page per place at `/place/<name>/` (old URL format): kind, modern name, certainty, note, verified verses (349 links, all checked), indirect mentions, notes, sources, and the place highlighted on the map. No map library; no JavaScript.
- 2026-10-22: **M6** `/explore/lexicon/` (329 words, letter navigation, filter) and a page per word at `/word/<word>/` (old URL format): meaning, the verse it explains, the note and its source page, and other verses where the word occurs. All 344 glosses checked against their verses. Poem pages link glossed words ("في المعجم").
- 2026-10-22: **M5** `/about`: the friend's sourced biography (life, offices, works, critics, numbered sources), the people catalog (32 people from the poet's life, each with their poems), and a note on this edition (source print, joined waw, verified note links). Person structured data for search engines.
- 2026-10-22: **M4** `/explore` hub and indexes: meters, rhymes (qafiya), first lines (matali, with a filter), themes (أغراض الشعر, marked as a first-pass classification), people and places (entities), stats. Each group folds open to its poems (links stay in the HTML for search engines) and links to the filtered `/diwan/`. Sitemap pages now listed in `src/lib/nav.ts`; `npm run verify` also checks every sitemap URL exists.
- 2026-10-22: **M3** `/search`: Arabic-aware matching (diacritics, hamza forms, ta marbuta, finds words inside joined waw), any-words or exact phrase, fields (verses, titles, notes, intros), meter/rhyme/volume filters, highlighted results linking to the verse, shareable URL. Index loads only on the search page (543KB gzipped for verses, 171KB for notes). `/diwan/` filter bar (title/opening, meter, rhyme, volume) kept in the URL. Home search box. `npm test` for the matching rules.
- 2026-10-22: **M2** `/saved` (محفوظاتي, kept on the device, with an empty state), home: continue-reading card, verse of the day (60 openings, changes daily), entry points to built sections only.
- 2026-10-22: **M1** Poem page: 1,764 verified notes under their verses (all 6,324 notes accounted for), cleaned intros for 121 poems, verse menu (copy, cite, link, share), save, copy/share poem, reading settings (size, layout), reading bar with progress, bars hide while reading on phones. First verse now on the first phone screen (457px; old site 933px). Added `npm run verify` (verse integrity, broken links, page basics, privacy) and `npm run check`.
- 2026-10-22: Old site reviewed; chose Astro, kept the URL structure, decisions recorded in `AGENTS.md`.
- 2026-10-22: Old site data extracted unchanged into `data/source/` (`tools/extract-legacy-data.mjs`).
- 2026-10-22: Detached waw joined into `data/edition/` (`tools/fix-detached-waw.mjs`), approved by the owner. Every change is listed in `reports/waw-changes.csv`.
- 2026-10-22: Old site unzipped into one clean `_original/` folder (deploy zip only; the code zip was a stripped copy of it). Removed generated poem pages, AI work logs, the Google verification file and the owner's email.
- 2026-10-22: Git set up. `_original/` and the zip files are left out of the repo (large, and they hold the owner's email).
- 2026-10-22: Astro site set up and rebuilt in the old site's identity (glass theme, Katibeh/Tajawal/Amiri, sidebar/top bar/bottom nav, light and dark). Poem page ~12KB gzipped (was over 1MB); CSS 12KB (was ~290KB); fonts ~175KB (was ~1.7MB plus Google Fonts). All 32,342 verse halves checked present and unchanged.
