# Core UX fixes — 2026-10-24

Implementation worker scope: `src/pages/index.astro`, `src/pages/search.astro`, `src/pages/diwan.astro`, `src/layouts/Base.astro`, `src/styles/global.css`, and this report. Read `AGENTS.md`, `PROGRESS.md`, the consolidated 2026-10-24 audit and its linked core report. No commits, browser sessions, dependencies, data, poetry, routes, progress or project-instruction changes.

## Implemented

- **U01:** Home heading uses two explicit blocks, «ديوان» and the unbroken «الشريف الرضي», with whitespace retained in its accessible text. Heading sizing follows the actual hero-copy container, with viewport fallbacks. Reduced heading leading, margins and hero padding; removed the repeated welcome title. Existing glass art, palette and fonts remain.
- **U03:** Only poem pages auto-hide navigation. Both bars become visible on focus entry; scrolling cannot hide a bar containing focus. CSS also excludes focused bars from the hidden transform. Existing reduced-motion handling remains.
- **U05:** More focuses the first newly appended result link, including the final batch. Result links have scroll margins for the fixed/sticky shell.
- **U14:** Both search downloads check HTTP success, reset their cached promise after rejection and catch failure at the search boundary. Arabic error feedback offers a retry button while preserving all fields. Intent prefetch handles rejection. Retry restores focus to the query.
- **U15:** Every run invalidates earlier work before the empty-query branch. Every input event also invalidates immediately, including the debounce window and native search clear. Explicit submit, filter changes, reset and retry cancel queued typing work. Removed the unconditional input blur on submission.
- **U16:** Pending runs clear previous results and disable/hide More immediately. Appending uses the completed search state instead of live form fields. Busy state and query/field metadata track the current run; stale completions and stale errors cannot overwrite newer state. Invalid select values from shared search URLs retain their valid defaults.
- **U26:** Search and catalogue show the actual non-default restrictions outside their collapsible controls. A persistent «إزالة القيود» action clears restrictions while keeping the current query and updates the shareable URL. Search resets matching mode and field as well as meter/rhyme/volume. Catalogue reset clears its selects and keeps title/opening text. Catalogue no-match guidance remains useful when the query alone has no matches.
- **U32:** Catalogue search input is 16px.
- **U33:** Theme button has a stable «الوضع الليلي» accessible label and `aria-pressed` initialized from the effective restored theme, then updated on every toggle.
- **U34:** Catalogue inputs/selects are disabled in static HTML. A visible full-list/JavaScript notice remains until the filtering script initializes, covering disabled JavaScript and a failed bundle download. Static poem links remain available. Controls are enabled before URL restoration/filter application.

Global CSS additions are limited to navigation focus visibility and the compact restrictions/reset presentation shared by the two owned pages. Other workers' changes were left intact.

## Checks

- `npm run build`: passed, 1,168 pages. The first build failed with a missing `dist/.prerender/chunks/compare_*.mjs` during route generation, consistent with concurrent builds. Retried successfully, then ran another successful build after the final source edits. No generated files were edited by hand.
- `npm run verify`: passed; 1,168 pages, 35,785 internal links, 32,342 verse halves and 1,166 sitemap URLs checked.
- `npm run check`: passed, zero errors/warnings; two hints in unowned `shared.ts` and `tools/fix-detached-waw.mjs`.
- `npm test`: passed, Arabic-search tests.
- `git diff --check` on the five owned source files: passed.
- Temporary in-memory Node/TypeScript mock-DOM regression harness: passed HTTP failure/retry, failed main promise reset, More focus to result 41, pending notes-load More guard, clear during pending notes download, submit/debounce cancellation and query-preserving reset. No harness file or dependency was added.
- Separate in-memory loader harness: both loaders passed network rejection, HTTP 500 and invalid JSON failures followed by successful fresh requests.

## Limitations and handoff

Mock-DOM checks establish controller transitions, not browser rendering, native event behavior or screen-reader announcements. No browser was opened, as required for this worker. Lead should check 320/375/810/1024px and desktop home layout (including font-lab choices), light/dark focus visibility, Tab after More, native search clear under throttled main/notes requests, failed-load retry and pending-query races, catalogue with JavaScript/bundle disabled, and theme accessible state. Actual iPhone Safari input/keyboard behavior remains a real-device check.

No cross-file implementation changes are required for these assigned fixes. Other tools' U14 recovery is outside this worker's ownership and remains with their worker. Lead must perform final combined review, browser QA and any progress/commit work.
