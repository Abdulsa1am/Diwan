# Index UX fixes — 2026-10-24

Implementation worker scope: only the nine assigned source files and this report. No commit, browser, dependency, new helper script, poetry/definition edits, data edits, basemap edits, global styles, or other worker files. Existing glass palette, fonts, routes and static links retained.

## Findings addressed

- **U07:** `Word.searchText` derives a normalized headword plus every glossary definition. Lexicon cards filter this attribute while still showing the original first-definition preview.
- **U08:** Lexicon alphabet hides during an active normalized query and restores on clearing, so no active letter link targets a filtered-out section. Native search-clear is handled too.
- **U09:** IndexGroups now has an SVG chevron that rotates with native disclosure state, plus scoped keyboard focus styling. This covers entities, meters, rhymes and themes. Relations remains the tools worker’s scope.
- **U10:** The existing filtered catalogue shortcut is duplicated immediately above each expanded poem list, retaining the bottom shortcut and every static poem link.
- **U11:** Matali recalculates each rhyme group’s visible opening count, restoring totals on clear. Counts use Arabic count forms.
- **U13:** Words plainly identifies legacy counts from before waw joining and the pending approved rebuild. It distinguishes word occurrences/poems from search’s matching verses and inclusion inside longer forms. No figures were recalculated or replaced.
- **U22:** Qafiya opens and scrolls to the target group on initial hash arrival and hashchange. Malformed or unknown hashes are ignored safely; native details remain usable without JavaScript.
- **U27:** Search precedes lexicon alphabet; matali has a 44px rhyme jump row with unavailable filtered letters hidden; words has Arabic-aware local filtering and a live count; entities has people/place section jumps. Static lists and links remain present.
- **U29:** AtlasMap has a native checkbox for a map at least 1100px wide within a keyboard-focusable, horizontally/vertically scrollable viewport. The large view works without JavaScript and avoids the compact map’s oversized mobile hit circles. A visible complete-list link is present on the atlas and place profiles; the atlas list has a stable heading target. Base geography and label-placement data are untouched.

## Validation

- `npm run build`: passed, 1,168 pages (rerun after final source edits).
- `npm run verify`: passed on retry, 35,785 internal links, 32,342 verse halves, 1,166 sitemap URLs. First attempt encountered transient `dist/.prerender/.vite/manifest.json` ENOENT while another worker was building; no build output was manually changed.
- `npm run check`: passed, zero errors/warnings; three hints outside owned files (home unused import, shared clipboard fallback deprecation, existing waw script unused parameter).
- `npm test`: passed, Arabic search suite.
- Read-only generated-HTML/Node-VM checks: later definition `واسعة` is indexed for `عين` using production normalization; original `رقيب، جاسوس.` preview remains; lexicon input precedes alphabet; qafiya target opens and scrolls on arrival and hashchange; malformed hash does not throw. The initial ad hoc assertion compared raw spelling to normalized text and was corrected to use production `fold`; this did not require an application change.

## Limits and handoff

No browser was opened as instructed. Lead should check ~375px and desktop, light/dark: chevrons and focus, clearing/restoring filters and jump rows, matali per-group counts, qafiya wheel arrival/hashchange, no document horizontal overflow, enlarged map touch/keyboard scrolling, readable Arabic/diacritics and no console errors. Check a place profile as well as atlas because AtlasMap is shared.

No additional implementation cross-file needs. **U12 remains separate:** legacy word metadata needs a documented dry-run rebuild and owner approval before any data replacement; the UI disclosure does not repair its provenance. Relations disclosure cues remain assigned to the tools worker. AGENTS.md/PROGRESS.md updates and commits belong to the lead and were not made.
