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
- **URLs stay as they are**: `/poem/r1-227/` (r1 = volume 1, poem 227). Never rename a poem URL.
  Planned additions: `/poem/<id>/#<verse>` for one verse, `/meters/<slug>/`, `/rhymes/<slug>/`, `/themes/<slug>/`, `/about/`, `/tools/<name>/`.
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
<!-- TBD once the Astro project exists: install / dev / build / test -->

## Project structure
- `_original/` — the friend's old site, kept for reference only. Don't edit it.
  - `_original/deploy/` — the full published site (v24.8.23). Its data lives as `const AL_RADI_*` objects at the top of `assets/scripts/core.js`.
  - `_original/code/` — the same code with the data stripped out.
- `_original/deploy/assets/scripts/report-config.js` holds the owner's personal email. Never copy it into the new site or publish it.
- `tools/` — data scripts. `data/` — data (see above). `reports/` — change logs for review.

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
