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
- **Identity «وَرَق» (Waraq)** (owner's decision, 2026-10-27; replaces the old blue-grey look). Parchment and walnut brown with Liquid Glass surfaces. Reference: sample A on branch `claude/identity-samples-38540b` (`design-samples/home/a-waraq.html`, report `reports/identity-samples-2026-10-27.md`).
  - Colours: light `#f3ebdf` background, ink `#3a2819`, accent `#835230`; dark `#1b1410` background, ink `#f3e7d6`, accent `#e2b383`. All tokens (light and dark) are in `src/styles/global.css`; text keeps WCAG AA (4.5:1) on glass.
  - Three themes (owner's decision, 2026-10-27), picked from the settings (gear) button in the top bar: «فاتح» (Waraq light), «داكن» (Waraq dark) and «كحلي» (the old site's navy dark). `radi-theme` stores `light`, `dark` or `navy`. Navy sets `data-theme="dark"` plus `data-palette="navy"`, so every dark rule applies and only the palette tokens change; a page with its own fixed dark colours needs a `[data-palette='navy']` override.
  - Glass: `.glass` = translucent surface (no blur), gradient rim (`::before`), top sheen (`::after`), warm shadow, over a backdrop of warm glows and a faint star lattice. The backdrop blur goes only on surfaces that float over scrolling content (fixed, sticky, menus): add `glass-float`. Never blur in-flow cards or put a fixed background on `body`; both made scrolling stutter on phones (2026-10-27). Solid fallbacks for no `backdrop-filter`, reduced transparency, more contrast and forced colours.
  - Font: **one family, Mirza** (400 and 600), self-hosted via @fontsource, Arabic subset only, for headings, interface and poetry. `--display-font`, `--ui-font` and `--poem-font` all point to `--font`. Don't add font families. Mirza is drawn small: use the type tokens `--fs-xs` (16px), `--fs-sm` (17px), `--fs-md` (19px, body) instead of smaller px sizes.
  - Shell: sidebar on screens over 1000px, top bar with action buttons, bottom nav on smaller screens. Nav items for sections not built yet are shown dimmed and not linked.
- **URLs stay as the old site had them** (owner's decision). Never rename one. From the old `cleanPathForRoute`:
  - Poem: `/poem/r1-227/` (r1 = volume 1, poem 227). One verse: `/poem/r1-227/verse/3` (send to the poem page at anchor `#v3`).
  - `/diwan` (poem list), `/search`, `/about`, `/saved`, `/explore` (indexes).
  - Tools under `/explore/…`: `atlas`, `rhymes`, `relations`, `openings`, `matali`, `themes`, `words`, `hijaz`, `stats`, `lexicon`, `phrases`, `qafiya`, `meters`, `entities`; and `/research/compare`, `/research/observatory`.
  - Profiles: `/word/<term>`, `/place/<name>`, `/relation/<term>`.
- **Keep all the old site's tools** (atlas, rhyme wheel, phrase tree, compare, etc.). Each one gets its own page and loads its code and data only when someone opens it.
- **SEO**: every verse is visible text in the page HTML (not in `<noscript>`, not built by JS). One `<h1>` per page. Unknown URLs return a real 404.
- **Detached waw joined** (approved by the owner): the source EPUB writes the conjunction apart (`و إنّما`). The edition joins it (`وإنّما`), as the reference editions do.
- **Certain spacing fixes applied** (approved 2026-10-23): 361 edits from the text review; see Data.

## Data
- `data/source/` — the old site's data blocks, extracted unchanged by `tools/extract-legacy-data.mjs`. Never edit by hand.
- `data/edition/` — what the site uses. Edition text is built from `data/source/` in two approved steps that only touch spaces and stop if any letter would change; a third step rebuilds derived word counts:
  1. `tools/fix-detached-waw.mjs` — joins the detached waw (log: `reports/waw-changes.csv`).
  2. `tools/fix-text-issues.mjs --apply` — the 361 "certain" spacing fixes from the text review (log: `reports/text-issues.csv`, report: `reports/text-issues.md`), approved by the owner 2026-10-23: detached interrogative hamza joined («أ ما» → «أما»), a space after «!»/«؟», no space before punctuation.
  3. `tools/build-word-index.mjs --apply` — `word-frequencies.json`, approved by the owner 2026-10-24 after reviewing `reports/word-index-proposal.md` and the full CSV comparison. Count complete normalized surface words: attached waw stays attached; exclude quoted prefaces; join only explicitly marked split words for analysis. Keep the legacy shortlist, merging its two normalization duplicates (240 rows → 238 entries). Count occurrences and distinct poems separately. Search-style letter folding is intentional; these are spelling counts, not linguistic senses. Never change poetry text to calculate them. The artifact records its counting policy and input hash; verification rejects stale or altered counts.
- To rebuild: `npm run data` (runs extraction and all three steps). The standalone word builder defaults to a read-only dry run without `--apply`.
- Search must still find `الزمان` inside `والزمان` now that the waw is joined. The old precomputed word lists (`indices.json`) were built from the detached text, so rebuild them instead of reusing them.

## Text issues still open (need the printed book)
- The "likely" and "needs-review" rows in `reports/text-issues.csv` (878): vocative or ambiguous hamza, 552 possible split words, 243 notes ending in «:», r2-016 v16 «و؟؟؟الفا», r2-042 v19–20 (one verse split in two).
- Commas stay as printed (owner kept the recommendation).

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
- Browser storage keys: `radi-theme` (`light`/`dark`/`navy`), `radi-reading` (font size, layout), `radi-saved`, `radi-last` (continue reading).

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

## Deployment
- Cloudflare Pages project `diwan-alradi` in the owner's account: https://diwan-alradi-ce6.pages.dev (the old site keeps `diwan-alradi.pages.dev`, which belongs to the friend).
- Current deployment is a **test for friends**: built with `NOINDEX=1` and the font lab on. Remove `NOINDEX` and the font lab only when the owner says the site is final.
- Redeploy: `SITE_URL=https://diwan-alradi-ce6.pages.dev NOINDEX=1 npm run build`, `npm run verify`, then `npx wrangler pages deploy dist --project-name=diwan-alradi --branch=main` (or through the Codex Cloudflare plugin with `--approve-for-me`; without it MCP calls fail with "approval policy is never").
- After every deploy, check the live site: pages 200, `/does-not-exist/` 404, `/poem/r1-227/verse/3` 301 to `#v3`, sitemap on the right address.

## Working with sub-agents (owner's decision)
- Implementation work is delegated to **Codex CLI workers**: model `gpt-6.1-sol`, reasoning effort **medium**. The lead agent plans, writes the briefs, reviews, tests and commits; workers only implement.
- Command (Codex is not on PATH here; the app ships it at `%LOCALAPPDATA%\OpenAI\Codex\bin\<hash>\codex.exe`):
  `codex exec -m gpt-6.1-sol -c model_reasoning_effort="medium" -s workspace-write -C <project> -o <result.md> - < <brief.md>`
- Every brief says: the goal, the exact files the worker may change (and which are off limits), the checks to pass (`npm run build`, `npm run verify`, `npm run check`, `npm test`), and to end with a short summary.
- Workers running at the same time never share files. Warn them that parallel builds can collide in `dist/` and to retry.
- Before committing a worker's change: read the whole diff, rerun all checks, and test in the browser at ~375px and desktop, light and dark (workers can't open the browser). Fix what they missed; say in the commit message that a worker did it and what was changed in review.
- Text and data: workers only propose (report + dry-run script). Nothing in `data/` changes without the owner's approval.
- **If you are a worker:** stay inside the files your brief allows, don't commit, don't touch `data/` or `_original/`, and report anything you could not verify.

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
