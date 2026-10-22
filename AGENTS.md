# Diwan

## Overview
A website presenting the diwan (collected poems) of al-Sharif al-Radi (الشريف الرضي).
This is a rebuild of an existing site made by a friend. The old site works but needs a lot of improvement.

## Goals
- **Correct**: no bugs, no broken pages, and the poetry text stays exactly as the edition data has it.
- **Light**: fast loads, small pages, few dependencies. Don't add a library without a clear reason.
- **Works on all screens**: built for phones first, and just as good on desktop.
- **Found in search**: people searching for a line of a poem, or for al-Sharif al-Radi, should land here.

## Content rules
- The poetry text is the heart of the site. Never change, "fix" or reformat a verse's words or diacritics (تشكيل) without asking.
- Arabic-first: `lang="ar"` and `dir="rtl"` on the page, and an Arabic font that renders diacritics correctly.
- Lay out each verse's two halves (صدر and عجز) side by side on wide screens, and stack them cleanly on narrow ones.
- In the data a verse is one string with `#` between its two halves. A tatweel before `#` (`بالعفـ # و`) means one word is split across the halves.

## Decisions
- **Stack**: Astro, building static pages. JavaScript only where a page needs interaction.
- **Keep the old site's identity** (owner's decision). Don't redesign; rebuild the old look, lighter. Reference: the live old site (`diwan-alradi.pages.dev`) and `_original/assets/styles/`.
  - Colours: the "glass" layer (v24.2) — light `#eaf0f7` background, ink `#1c3043`, accent `#486c88`; dark navy `#111d2b`. All tokens are in `src/styles/global.css`.
  - Fonts (self-hosted via @fontsource, Arabic subset only): Katibeh for headings and the sidebar brand, Tajawal (400/500/700) for the interface and the top-bar logo, Amiri 400 for the poetry. Don't add font families.
  - Shell: sidebar on screens over 1000px, top bar with action buttons, bottom nav on smaller screens. Nav items for sections not built yet are shown dimmed and not linked.
- **URLs stay as the old site had them** (owner's decision). Never rename one. From the old `cleanPathForRoute`:
  - Poem: `/poem/r1-227/` (r1 = volume 1, poem 227). One verse: `/poem/r1-227/verse/3` (send to the poem page at anchor `#v3`).
  - `/diwan` (poem list), `/search`, `/about`, `/saved`, `/explore` (indexes).
  - Tools under `/explore/…`: `atlas`, `rhymes`, `relations`, `openings`, `matali`, `themes`, `words`, `hijaz`, `stats`, `lexicon`, `phrases`, `qafiya`, `meters`, `entities`; and `/research/compare`, `/research/observatory`.
  - Profiles: `/word/<term>`, `/place/<name>`, `/relation/<term>`.
- **Keep all the old site's tools** (atlas, rhyme wheel, phrase tree, compare, etc.). Each one gets its own page and loads its code and data only when someone opens it.
- **SEO**: every verse is visible text in the page HTML (not in `<noscript>`, not built by JS). One `<h1>` per page. Unknown URLs return a real 404.
- **Detached waw joined** (approved by the owner): the source EPUB writes the conjunction apart (`و إنّما`). The edition joins it (`وإنّما`), as the reference editions do.

## Data
- `data/source/` — the old site's data blocks, extracted unchanged by `tools/extract-legacy-data.mjs`. Never edit by hand.
- `data/edition/` — what the site uses. Built from `data/source/` by `tools/fix-detached-waw.mjs`, which only removes spaces and stops if any letter would change. Every change is listed in `reports/waw-changes.csv`.
- To rebuild: `node tools/extract-legacy-data.mjs` then `node tools/fix-detached-waw.mjs`.
- Search must still find `الزمان` inside `والزمان` now that the waw is joined. The old precomputed word lists (`indices.json`) were built from the detached text, so rebuild them instead of reusing them.

## Postponed text issues (fix later, not now)
- Detached interrogative hamza: `أ ما لي` instead of `أما` (287 verses).
- Punctuation glued to the next word: `للّه!أيّ` (94 verses).

## Commands
- Install: `npm install`
- Dev server: `npm run dev`
- Build: `npm run build` (output in `dist/`), then preview with `npm run preview`
- Rebuild the data from the old site: `npm run data`
- Type check: `npm run check`
- Verify the build (verse text intact, no broken links, one h1, no email): `npm run verify` — run before every commit that touches pages
- Nav sections are switched on in `src/lib/nav.ts` (add `href` when a section's page exists)

## Project structure
- `_original/` — the friend's old site (v24.8.23), unzipped and cleaned. Reference only; don't edit it.
  - Its data lives as `const AL_RADI_*` objects at the top of `assets/scripts/core.js`.
  - `tools/build-seo.py` regenerates the 685 `poem/<id>/index.html` pages (removed as build output): `python -X utf8 tools/build-seo.py`.
  - `content-review/` — the friend's editorial review lists (pending notes, theme reviews). Useful when reviewing the text later.
  - Removed: the generated poem pages, the AI work logs (`REPORT-*.md`), the Google Search Console verification file (tied to the friend's account), and the owner's email in `report-config.js`.
- The two `.zip` files are the untouched originals. They still hold the owner's email; never publish or commit them.
- `tools/` — data scripts and `verify-build.mjs`. `data/` — data (see above). `reports/` — change logs and the UX audit.
- `src/lib/` — build-time data shaping: `diwan.ts` (poems, verses, notes linked to verses, cleaned intros), `indices.ts` (meters, rhymes, themes, names), `lexicon.ts`, `atlas.ts`, `nav.ts` (sections, tool cards, sitemap pages).
- `src/pages/` — one file per route; dynamic routes: `poem/[id]`, `word/[term]`, `place/[name]`. `search-index.json.ts` and `search-notes.json.ts` build the search data.
- `src/scripts/` — browser code: `reader.ts` (poem page), `arabic-search.ts` (matching rules, tested by `npm test`), `corpus.ts` (loads the verse index for tools), `shared.ts` (storage, toast, copy, Arabic counts).
- `src/components/` — `Icons` (the old site's icon sprite), `PageHead`, `IndexGroups`, `VerseList`, `AtlasMap`, `NavLink`.
- Browser storage keys: `radi-theme`, `radi-reading` (font size, layout), `radi-saved`, `radi-last` (continue reading).

## Arabic writing rules in the UI
- Use Arabic-Indic digits (`ar()` in `src/lib/diwan.ts`).
- Counts: use `arCount()` (`src/scripts/shared.ts`) so the noun agrees: نتيجة واحدة، نتيجتان، ٤ نتائج، ١١ نتيجة.
- Don't put `·` next to a number: it looks like the Arabic zero `٠`. Use `،`.
- In regexes, write Arabic ranges as `\u` escapes, not literal characters.

## Known problems in the old site (what this rebuild fixes)
- Every page loads one 5MB `core.js` (~1.1MB gzipped) that holds all the data for every poem.
- Each poem page is ~190KB of HTML, mostly a full list of links to every poem.
- 15 CSS files (~290KB), 13 local font files, and 5 Google Fonts families.
- Verse text for search engines sits inside `<noscript>`. There are two `<h1>`s, and unknown URLs return 200.
- Internal review files (`REPORT-*.md`, `content-review/`) are shipped with the public site.
- Lexicon shards (`lexicon-data/*.json`) and vocalization batches (`batch-*.json`) are referenced but missing from the deploy.

## Keeping track of progress
- Read `PROGRESS.md` at the start of a session to see where things stand.
- Update it at the end of every task: move finished items to **Done** (with the date), refresh **Now** and **Next**, and add any question waiting on the owner under **Open questions**.
- A decision that should hold for the whole project (stack, URLs, content rules) goes in `AGENTS.md`, not `PROGRESS.md`.
- Keep `PROGRESS.md` short: if **Done** grows long, fold old entries into one line per milestone.
- Commit after each finished task, with a message that says what changed and why. Never commit `_original/` or the zip files.

## Quality checks before calling work done
- Check at phone width (~375px) and desktop width; no horizontal scrolling.
- No console errors.
- Arabic text and diacritics render correctly.
