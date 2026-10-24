# Reading and profile UX audit — 2026-10-24

Scope: source review of the poem reader, word/place profiles, biography, VerseList, AtlasMap and temporary font lab. No implementation, data changes or commits. Evidence below comes from current source, not earlier audit reports. Browser verification is delegated to the lead; **every browser outcome below is a source-derived hypothesis until reproduced**.

Severity: P2 = a functional/accessibility problem worth fixing; P3 = smaller clarity or consistency problem. No P0/P1 issue established by this review.

## Findings

### R1 — P2: Increasing the reading size can leave the actual poem unchanged

- Evidence: `src/scripts/reader.ts:62` calculates the minimum size fitting every half-line; `src/scripts/reader.ts:71` clamps only to the fixed floor. `src/scripts/reader.ts:189` and `src/scripts/reader.ts:191` nevertheless display the selected percentage. `src/pages/poem/[id].astro:504` applies the fitted size rather than the percentage directly.
- Source-derived hypothesis: once a poem is width-limited at a size above the floor, changing from 100% to 132% increases the cap but does not change the fitting constraint. A reader who needs larger text sees a larger percentage while the poem stays the same size. This also means one long half-line controls the size of the entire poem.
- Reproduce: at 375px open `/poem/r1-227/`, open صفة القراءة, compare the rendered `.hemistich` font size at 100% and 132%; repeat `/poem/r1-236/` and with stacked layout. Inspect actual computed font size, not the output label. At desktop compare auto and stacked layouts too.
- Minimal fix: let an explicit accessibility size increase take priority over keeping every half-line unwrapped; allow wrapping or use a scale-dependent minimum size. Keep original text and diacritics intact. If fitting is retained as a separate mode, explain when it caps the requested size.

### R2 — P2: Failed storage writes still announce a successful save/removal

- Evidence: `src/scripts/shared.ts:12` catches and silently discards storage write errors; `src/scripts/reader.ts:166` immediately announces that the poem was saved, and `src/scripts/reader.ts:169` rereads storage to paint the button. The removal branch at `src/scripts/reader.ts:163` behaves similarly.
- Source-derived hypothesis: when browser storage is denied or full, the success toast conflicts with the unchanged button. The reader can leave believing the poem is saved and find it absent from محفوظاتي.
- Reproduce: deny/fill localStorage, open a poem and select احفظ; compare the toast, pressed state and `/saved/`. Repeat removal with a pre-existing saved poem. Storage blocking must affect writes rather than merely prevent access to an unrelated origin.
- Minimal fix: return a success/failure result from storage writes; show a specific persistence failure rather than success. If keeping an in-memory session save, make that limitation explicit. Font lab already distinguishes failure to persist (`src/scripts/font-lab.ts:132`).

### R3 — P2: A valid JSON value of the wrong shape can stop reader controls

- Evidence: `src/scripts/shared.ts:6` parses storage without shape validation. `src/scripts/reader.ts:153` assumes `radi-saved` is an array, calls `.some`, and `src/scripts/reader.ts:159` executes that assumption before the copy/share/settings/menu listeners are registered.
- Source-derived hypothesis: a stale or malformed saved payload such as `{}`, `null` or an array containing `null` throws during initialization. The poem remains readable, but several unrelated controls become inert and the console contains an uncaught error. This needs an invalid stored value; normal fresh storage does not trigger it.
- Reproduce on a disposable test profile: set `localStorage.setItem('radi-saved', '{}')`, reload `/poem/r1-227/`, then try copy, settings and verse actions. Repeat with `'null'` and `'[null]'`; remove the test key afterward.
- Minimal fix: validate that saved items form an array with expected item fields and fall back to an empty list before use. Validate reading preferences against allowed scale/layout values too, so storage cannot inject nonsensical styles.

### R4 — P2: Verse menu continues capturing arrow keys after focus leaves it

- Evidence: `src/scripts/reader.ts:297` installs a document-wide keydown handler. At `src/scripts/reader.ts:307`, any ArrowUp/ArrowDown while the menu is visible is prevented and moves focus into the menu. There is no Tab or focus-out dismissal in the module.
- Source-derived hypothesis: keyboard readers Tab out of a verse menu to subsequent page content, then press an arrow to read/scroll; focus unexpectedly returns to the old menu. A visible but abandoned menu also remains attached to its old verse while scrolling.
- Reproduce: open a verse menu by keyboard, Tab through and beyond its last item, then press ArrowDown while focused on the next page link. Check whether the page scrolls or focus jumps to the first menu option.
- Minimal fix: restrict menu key handling to focus inside the menu, and close on Tab/focus leaving the menu without restoring focus to the opener in that dismissal path. Preserve Escape focus restoration.

### R5 — P3: Layout selector advertises radio behavior without its keyboard behavior

- Evidence: `src/pages/poem/[id].astro:114` declares a radiogroup with three role=radio buttons; `src/scripts/reader.ts:216` handles only clicks. All three buttons remain in the normal Tab sequence and there is no radiogroup ArrowLeft/ArrowRight handler.
- Source-derived hypothesis: keyboard/screen-reader users encounter radio semantics but cannot change the selected layout with the expected arrows; they must discover that each option requires Tab then Enter/Space.
- Reproduce: focus تلقائي in صفة القراءة; press left/right arrows and inspect checked state; Tab to count stops.
- Minimal fix: use native radio inputs with labels, or implement one tab stop with correct arrow navigation and checked state updates.

### R6 — P3: Word profile puts a middle dot immediately after the page number

- Evidence: `src/pages/word/[term].astro:42` emits the volume/page number, followed by `src/pages/word/[term].astro:46` emitting `·` before the digital-source link.
- Source-confirmed UI inconsistency; visual confusion needs browser verification. The repository explicitly forbids a middle dot beside numbers because it resembles Arabic zero. A bibliographic page number can therefore be misread.
- Reproduce: open a word profile whose note has a digital source, expand نص الحاشية and inspect the page/source separator.
- Minimal fix: replace the UI separator with `،`. This does not require changing poetry or source data.

### R7 — P3: Biography dates switch to Western digits inside Arabic prose

- Evidence: `src/pages/about.astro:66` contains `359هـ` and `406هـ`, while the lead at `src/pages/about.astro:44` uses Arabic-Indic digits and the remainder of the interface uses `ar()`.
- Source-confirmed inconsistency, with browser visual verification pending. The same dates change digit style within one short page, reducing typographic consistency and violating the project's UI writing rule.
- Reproduce: compare the lead with النسب والنشأة on `/about/`.
- Minimal fix: use Arabic-Indic digits in this authored UI prose. Do not alter edition data.

## Additional browser checks to resolve before promoting hypotheses

- Verse-menu placement (`src/scripts/reader.ts:253`): placement clamps horizontally but always opens below the number; there is no bottom-edge clamp or max-height. At 375px place a number near the bottom edge, open its menu and check whether all actions are reachable without an unexpected page jump. Focus may scroll enough to mitigate this; no separate finding established.
- Continue reading (`src/scripts/reader.ts:123`): progress tracks a narrow 35–45% viewport band, is saved after 600ms, and has no pagehide flush. Test leaving immediately after a large scroll, opening a deep link, reading the final verse, and returning to the home card. A slow-font initial reflow may change which verse intersects. No observed data-loss claim established.
- Split words: test `/poem/r1-008/#v4` (also v7/v8), with side and stacked layouts, copying/citing and Amiri/alternate lab fonts. Source keeps both original halves; no editorial correction proposed.
- Annotations: test global الشروح on/off, per-verse شرح البيت, switching global notes off after revealing one verse, a glossary-only verse, and navigation to/from word profiles. CSS intentionally hides annotations until enabled; original verse text stays in HTML.
- AtlasMap (`src/components/AtlasMap.astro:153`): enlarged mobile hit circles can overlap and later-painted places win. On a place profile test tapping the visible focused dot and nearby labels at 375px; compare link destinations. Confirm text legibility after the 900-unit SVG shrinks. No hit-testing result established here.
- Font lab: test blocked Google Fonts, persisted choices on a fresh page, font reset while a previous request is pending, keyboard listbox navigation, and panel scroll at small heights. Its code includes error feedback, revision guards and persistence-failure feedback; these are positive source observations, not browser pass claims.

## Coverage and limits

Read `AGENTS.md`, `PROGRESS.md`, all assigned page/component files, `reader.ts`, `font-lab.ts`, `shared.ts`, relevant `Base.astro` initialization/progress handling, home resume integration and `lexicon.ts` shaping. Read current edition JSON solely to select fixtures; no data changed.

Read-only fixture query found longest raw poem: r1-227 (119 verses), then r2-085 (111) and r2-274 (95). Longest raw half-lines by character count include r1-236 v39 and r2-253 v30 (37 characters each); character count is not rendered glyph width. Quoted prefaces may change displayed verse numbering for other fixtures.

Not run by this source-review worker: build, verify, type check, tests, dev server, live HTTP checks, browser screenshots, phone/desktop overflow checks, light/dark contrast, console capture, screen reader, real device sharing/clipboard, storage denial/quota simulation, actual font-size measurement. The lead owns browser verification. No prior reports used as new evidence.
