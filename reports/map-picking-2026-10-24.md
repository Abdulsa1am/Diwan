# Selecting overlapping map points — 2026-10-24

On a 375px phone viewport, 19 of the 28 point centers inside the current map bounds hit another place's SVG link. Oversized invisible hit circles and SVG paint order hid smaller places; tapping Karbala could open Iraq. Baseline: `output/playwright/map-picking-2026-10-24/before.json` and `before-mobile.png`.

A tap now resolves nearby point centers in live screen coordinates. One candidate opens its profile; multiple candidates open a native dialog with named links, ordered by distance. The radius stays 26 CSS pixels when the map is resized or scrolled. All choices have at least 44px targets. The dialog uses the existing palette and fonts; its list scrolls while the heading and close button remain visible.

A GPT-6.1 Sol Medium CLI worker implemented the shared map component, browser interaction, geometric helper and regression tests. Lead review corrected two details: mobile Chrome adjusts click coordinates toward nearby links, so picking uses the original pointer contact; dense lists need an independently scrolling list to keep close visible. Drag, cancellation, scrolling, multiple pointers and long holds do not count as taps. Keyboard activation and modified clicks retain native link behavior.

No dependencies, map coordinates, poetry or data changed. Static SVG/profile links, the full place list and the native large-map checkbox remain available without JavaScript. Four of the 32 geocoded points already lie outside the map's original view box; their existing list links remain available. This task does not change that geographic coverage.

Validation:

- Build with the friends' test URL and `NOINDEX=1`; verify: 1,168 pages, 35,917 internal links and 32,342 verse halves, all passed.
- `npm run check`: zero errors/warnings, two existing hints. `npm test`: Arabic search, word-index and new picking regression tests passed.
- Browser: all 28 in-map centers selectable across 375px/1440px, light/dark, atlas/Baghdad profile and compact/large views: 448 selections. Dense-group choices actually navigated to Karbala's profile. No horizontal overflow or page errors.
- Keyboard Enter, modal focus, Escape and focus restoration; touch drag/cancellation/two-finger gestures; no-JS static links and enlargement; forced colors at 375×568 all passed. Native modal focus can visit browser chrome, without exposing background page controls.
- Additional 320/375/620px resize checks confirmed the original contact determines the nearest choice; no console or page errors. Browser emulation does not replace real-device or spoken screen-reader testing.

Results: `output/playwright/map-picking-2026-10-24/checks.json`, `extras.json`. Final screenshots: `chooser-light-atlas.png`, `chooser-dark-atlas.png`, `chooser-light-profile.png`, `chooser-dark-profile.png`, `chooser-forced-colors-short.png` in the same folder.

Local change only; not deployed.
