# Reader, saved poems and authored prose UX fixes — 2026-10-24

Implementation worker; no commit, browser, data, original-site, package, AGENTS or PROGRESS changes. Read the consolidated audit and its reading/core appendices. Existing routes, glass tokens, fonts and static verse HTML retained.

- **U02:** Fit the default poem size, then multiply that fitted size by the selected reading scale. Enlargement therefore increases rendered text even on width-limited poems. Stack halves when enlarged side-by-side text no longer fits; allow wrapping and emergency long-word breaks when needed. Default fitting, smaller scales, responsive floors and font-lab measurement invalidation remain supported.
- **U04:** Menu arrows/Home/End operate only inside the menu. Focus departure and outside click dismiss without returning to the opener. Tab/Shift+Tab dismiss and continue from the opener's position in page order. Escape closes only the menu and restores its verse opener, even if reading settings are also open.
- **U06:** After successful removal, focus the next removal button, previous last button, or empty-state catalogue link. A sticky, persistent last-removal notice offers undo until another removal or navigation; restore the item at its prior position and focus its removal button. Failed removal/undo retains the previous state and reports failure.
- **U23:** `save()` now returns a boolean compatibly. Reader saves/removals, saved-list removal/undo, reading settings and reading-position writes inspect it. Failed settings writes explicitly mean this visit only; automatic progress failure is reported once per page. No false persistence success or hidden session bookmark fallback.
- **U24:** Shared `load()` validates known saved, last-read and reading keys. Saved arrays filter invalid references and duplicate IDs; invalid shapes use safe defaults. References require expected string fields, route-safe ID, finite timestamp and valid optional verse/total values. Reading scale is restricted to the supported steps, layout to the allowed choices, and notes to boolean true. Generic unrelated-key API stays compatible; home resume benefits from last-read validation.
- **U25:** Layout radiogroup has one Tab stop, checked-state updates, wrapping RTL Left/Right and Up/Down selection, and Home/End. Existing visual buttons retained.
- **U31:** Saved removal and undo buttons have minimum 44px height.
- **U35:** Glossary citation separator is an Arabic comma.
- **U36:** Three authored biography year occurrences use Arabic-Indic digits. Machine-readable schema dates and edition data untouched.
- **U37:** Header chip links to the separately counted residual-footnote disclosure. Click, initial matching fragment and hash changes open that block. Summary receives focus on shortcut activation, and the block has fixed-header scroll clearance. Notes are not reassigned or rewritten.

## Validation

- `npm run build`: passed (1,168 pages); concurrent builds also caused missing `dist` pages/prerender chunks on retries.
- `npm run verify`: passed after rebuilding: 1,168 pages, 35,785 internal links, 32,342 verse halves, 1,166 sitemap URLs.
- `npm run check`: passed, zero errors/warnings, three existing hints (unused home import, clipboard fallback deprecation, unused data-script argument).
- `npm test`: passed, Arabic search tests.
- Targeted Node assertions against the actual shared module passed: wrong-shape/null/invalid-item saved JSON, duplicates, invalid reading settings, valid reading settings, inconsistent last-read verse/total, write success, quota failure retaining persisted values, and denied reads.
- Owned-file `git diff --check`: passed. Other workers' files were not reverted or edited.

## Lead review and cross-file need

- **U24, `src/layouts/Base.astro` early inline restoration:** it still directly parses `radi-reading` and applies truthy arbitrary `scale`/`layout` values before the reader initializes. The reader now safely resets these, but early paint and non-reader pages need the same supported-scale/layout validation in Base. This file is outside ownership and was not edited.
- No font-lab.ts conflict found: its `radi:fontchange` event and font-loading invalidation remain intact. No font-lab edits.
- Per assignment, no browser opened. Lead must verify 375px/desktop, light/dark, default/lab fonts, actual increasing computed font sizes, no overflow, all menu/layout keyboard paths, first/middle/last saved removal and undo, denied storage UI, and residual-note arrival (e.g. r2-156). Node/build checks do not establish these browser outcomes.
