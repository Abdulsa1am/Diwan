# UX audit of the old site (2026-10-22)

Measured on the live old site (`diwan-alradi.pages.dev`) at phone size (375×812) unless noted.

## Poem page (`/poem/r1-001/`)
| Problem | Evidence | Fix in the rebuild |
|---|---|---|
| The poem is not on the first screen | First verse starts at 933px; the screen is 812px | Compact header; intro collapsed; verses start within the first screen |
| Too much fixed chrome | Top bar 61 + reading dock 103 + bottom nav 54 = 218px (27% of the screen) always covering text | One slim reading bar that appears only after scrolling past the title |
| Text too small | 85 text elements under 12px (chips 9–10px, buttons 11px) | Minimum 12px; chips 12px; buttons 14px |
| Too many controls | 239 buttons/links on one poem page (a lens button on every verse) | Verse actions open from the verse number; one menu, not one per verse |
| URL changes while scrolling | Address bar becomes `/verse/55` as you scroll; pollutes history and shares | URL changes only when the reader picks a verse |
| Title flickers | `… | الرَّضي` then `… | ديوان الشريف الرضي` | One fixed title, rendered in HTML |
| Two `<h1>` per page | Counted 2 | One `<h1>` |
| Floating "نبّهنا إلى خطأ" button | Covers verses at the bottom-left on phones | Moved into the page footer area (when error reporting is enabled) |
| "0. خبر القصيدة" | Stray "0." before the heading | Plain heading |
| Notes far from their verses | Notes listed apart; the user must match (1), (2)… by hand | Verified note links (1,764) shown under their verse |
| Confusing text-mode switch | "بالضبط المتاح / بلا تشكيل" with an explanation paragraph | Removed until vocalised text exists for more than 157 verses |

## Poem list (`/diwan`)
| Problem | Evidence | Fix |
|---|---|---|
| Filters push poems down | A large search/filter card sits above the list | Compact filter row (meter, rhyme, volume) |
| Mixed digits | `ج ١ · ص 9` mixes Arabic and Latin digits | Arabic digits everywhere |
| Only 39 cards rendered at a time | Rest loads by script | All poems in the HTML (searchable by Google), rendered lazily by the browser |

## Home (`/`)
| Problem | Evidence | Fix |
|---|---|---|
| Very long page | 4,087px tall on a phone, 8 sections | Keep the useful parts: hero, search, continue reading, verse of the day, entry points |

## Whole site
| Problem | Evidence | Fix |
|---|---|---|
| 5MB script on every page | `core.js` | Static HTML; small scripts only where needed |
| "⌘ K" shortcut shown on phones and Windows | Shown in the top bar and sidebar | Not shown |
| Unknown URLs return a page with status 200 | SPA fallback | Real 404 |
