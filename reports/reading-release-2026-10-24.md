# Home, catalogue and reading follow-up — 24 October 2026

The owner authorized GitHub publication followed by Cloudflare deployment, superseding the earlier local-review hold. This release includes the previously reviewed minimal mobile home and two-column catalogue (100 poems/50 rows, seven pages), full wrapping titles, letters inside filters and bottom-only pagination.

New changes:

- Catalogue numbers are small top-border labels outside normal card flow. Verse numbers sit on the center of the divider; symmetric inline padding centers poetry across the complete verse rectangle. Native verse anchors and keyboard menu access remain.
- A single primary tap/click on the verse body or padding opens its existing actions after a 450ms multi-click selection window. Passive pointer observation rejects holds, movement, scrolling, cancellation, multiple pointers, context menus and active/new selections. No pointer capture, selection disabling or prevented native context menus. Annotation controls and glossary links retain their own actions. Popup positioning flips/clamps within the screen above mobile navigation, with native focus/Escape/Tab behavior retained.
- The standalone continue-reading card is removed. A single reading card occupies the former search-card slot among home entries. Valid history restores its title, progress and verse link; missing/malformed/unavailable storage and no-JS get a native first-poem link labeled «ابدأ القراءة». Header/bottom navigation search and the desktop search field remain.
- Meter, rhyme and verse count moved below the poem title into the existing volume/page metadata group.

Implementation used separate GPT-6.1 Sol Medium CLI workers with disjoint file ownership; the later header worker preserved the first worker's pending reader edits. Lead reviewed complete diffs and performed real-browser QA. No poetry, edition data, route, dependency or font changes.

Validation:

- Build with `SITE_URL=https://diwan-alradi-ce6.pages.dev NOINDEX=1`: 1,168 pages. Verify passed: 35,917 internal links, 32,342 verse halves and 1,166 sitemap URLs. Type check: zero errors/warnings, two existing hints. All existing tests passed.
- [Numbering/tap tests](../output/playwright/numbering-tap-2026-10-24/checks.json): 25 passed. Phone 320/375px and desktop 1440px, light/dark, three poem fixtures; centered geometry, text/padding taps, exact copy/link payloads, keyboard, annotations, desktop native drag/double/triple selection, long holds, cancelled/multi-touch and no-JS anchors. Catalogue markers checked in six viewport/theme states including three-digit numbers. No console/page errors or horizontal overflow.
- [Maximum reading size/layouts](../output/playwright/numbering-tap-2026-10-24/layouts.json): 12 passed, all three layouts, both themes and phone/desktop, including verse119. Markers do not overlap text or move its center.
- [Home resume/header tests](../output/playwright/resume-meta-2026-10-24/checks.json): 18 passed, fresh/returning/malformed/denied storage, phone/desktop and both themes, plus no-JS navigation. No duplicate resume/search entry, exact saved verse URL, retained navigation search, metadata below h1 and no overflow/errors.
- Earlier [catalogue grid regression](../output/playwright/catalogue-grid-2026-10-24/checks.json) covered all seven pages/all685 links in eight viewport/theme states, five longest titles each, opening searches, filter letters, history and no-JS fallback. The later marker change does not alter paging/search logic.

Mobile Chrome emulation confirmed long-hold suppression; it did not expose native text-selection handles. Desktop native selection was observed. Native touch selection handles and spoken screen-reader output still need physical-device verification; the application leaves their native events untouched.

## Publication and live verification

Application source `afd31d7ae483e830c6f4b72ec5c96b70a4c52d6b` was pushed to GitHub before publication. Cloudflare deployment `4d4f8d46-3383-4d28-b688-619f152949df` succeeded at [the deployment address](https://4d4f8d46.diwan-alradi-ce6.pages.dev) and serves [the friends' test](https://diwan-alradi-ce6.pages.dev). Its manifest contains 1,206 assets plus the redirect configuration: 726 newly uploaded and 480 reused. No credentials were written to project files or printed.

All [17 live checks](../output/playwright/reading-release-live-2026-10-24/checks.json) passed: ten page routes returned200 with one h1 and noindex; an unknown URL returned404; the legacy verse route returned301 to #v3; sitemap/robots used the assigned address. At375/1440px in light/dark, real-browser checks confirmed the home resume-entry URL, 100-card catalogue and one bottom pager, grouped poem metadata, text-tap verse actions and atlas/profile selection. No console/page errors or horizontal overflow were observed. The friends' test retains `NOINDEX=1` and the font lab.

The final documentation-only commit records these results; application assets correspond to source `afd31d7`.
