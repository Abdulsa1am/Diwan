# Mobile UX audit of the new site (2026-10-22)

Measured at 375×812 on 23 page types (tap targets under 40px, text under 13px, page height, sideways scroll), plus a visual pass.
No page scrolls sideways. Problems found:

## Whole site
| # | Problem | Evidence | Fix |
|---|---|---|---|
| S1 | Top-bar icon buttons are small | 38×40px on every page (recommended 44×44) | 44×44 |
| S2 | Logo link is a small target | 70×26px | Taller hit area (≥44px) |
| S3 | Small text | Chips, card meta, footer, labels at 12px | 13px minimum |
| S4 | Back links ("← الفهارس") are short targets | 76×36px | ≥44px tall |

## Home
| # | Problem | Evidence | Fix |
|---|---|---|---|
| H1 | The hero fills the whole first screen; the search box is below it | Search starts around 820px | Tighter hero on phones; search visible in the first screen |

## Poem list (`/diwan/`)
| # | Problem | Evidence | Fix |
|---|---|---|---|
| D1 | Far too long | 219,234px tall on a phone: each card ~320px, about 1.5 poems per screen | Compact rows on phones (title, opening half-line, meter and length): 5–6 poems per screen |
| D2 | Filters take three rows before any poem | ~250px | Collapsed "تصفية" button with the number of active filters |
| D3 | No way to jump through 685 poems | — | Rhyme-letter jump bar |

## Poem page
| # | Problem | Evidence | Fix |
|---|---|---|---|
| P1 | Toolbar wraps onto two rows | 5 buttons, 34px tall | One row; secondary actions icon-only on phones; 44px |
| P2 | Note chips «شرح» are small | 32px tall | ≥40px |

## Search
| # | Problem | Evidence | Fix |
|---|---|---|---|
| R1 | Filters take ~280px before the first result | Mode, field, meter, rhyme, volume always open | Query + "خيارات البحث" (collapsed, with active count) |

## Indexes and tools
| # | Problem | Evidence | Fix |
|---|---|---|---|
| T1 | Atlas dots are nearly impossible to tap | 9–26px hit areas | Larger invisible hit area per dot |
| T2 | Relations chips are small | 3,650 targets under 40px (~29px tall) | ≥40px chips |
| T3 | Lexicon letter jump links are small | 24×35px | ≥44×44 |
| T4 | Footnote numbers on the about page | 12px text links | Larger hit area |
| T5 | "عرضها بطاقاتٍ في الديوان" link | 25px tall | ≥44px |
