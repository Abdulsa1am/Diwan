# Index and reference-page UX review — 2026-10-24

## Evidence and limits

This is a **current-source review**, supporting the lead's browser audit. No screenshots were supplied to this worker and no visual issue is claimed as confirmed. Read AGENTS.md and PROGRESS.md for current requirements, but did not use earlier audit reports as evidence. Reviewed all ten assigned page sources, IndexGroups, index/lexicon shaping, shared counts and Arabic normalization, navigation metadata, and relevant search behavior. Read current edition JSON only to validate examples and collection sizes. No implementation, data edits, builds, tests, commits, or browser actions were performed. Browser confirmation is still needed at approximately 375px and desktop, in light and dark, including focus, actual scroll burden, overflow, and screen-reader announcements.

Severity: P1 prevents a core task; P2 materially hinders or misleads a normal task; P3 localized clarity or convenience. No P1 identified in this source scope.

## Findings

### 1. P2 — Meaning search omits meanings after the first gloss

- Evidence: **source-confirmed functional gap**, not visually confirmed.
- Location: `src/pages/explore/lexicon.astro:38` and `src/pages/explore/lexicon.astro:54` (matching at line 63); source grouping retains all glosses in `src/lib/lexicon.ts:57`.
- Impact: The placeholder promises search by word or meaning, but the searchable text contains only the first meaning. A reader can receive an incomplete or empty result despite a matching definition being available on the word's own page.
- Reproduction: Open `/explore/lexicon/`; search `واسعة`. The current data gives `عين` the first gloss `رقيب، جاسوس.` and a later gloss `واسعة.`. The entry `عين` is hidden because the later gloss is absent from its index-card text. Other entries may remain; the missing matching entry is the defect.
- Minimal fix: Keep the first-meaning preview, but build a normalized search attribute from the headword plus **all** gloss meanings. Do not change any definition or poem text.

### 2. P2 — Group controls conceal their expandable affordance

- Evidence: **source-supported discoverability risk**; native keyboard semantics remain intact. Actual visual recognition needs browser confirmation.
- Location: `src/components/IndexGroups.astro:26`, `src/components/IndexGroups.astro:71`, `src/components/IndexGroups.astro:79`, `src/components/IndexGroups.astro:81`.
- Impact: Meters, rhyme letters, themes, and entities all present a label, comparison bar, and count. Both the standard marker and WebKit marker are removed, with no replacement arrow, plus, or visible expand label. Themes and entities do not explain that these rows open. A reader can mistake the rows for static statistics and miss the poem links.
- Reproduction: Open `/explore/themes/` or `/explore/entities/`; compare closed and open summaries. Inspect whether any visible element explains that the summary is actionable and whether its state is visible before interaction.
- Minimal fix: Add one small decorative chevron to the existing summary grid, rotate it for `details[open]`, and retain native details/summary semantics and the glass styles.

### 3. P2 — The useful filtered-list link is buried after the entire expanded group

- Evidence: **source-confirmed ordering; source-supported mobile effort risk**. Actual height and scroll effort not measured here.
- Location: `src/components/IndexGroups.astro:36` and `src/components/IndexGroups.astro:46`; meter use at `src/pages/explore/meters.astro:19`, rhyme use at `src/pages/explore/qafiya.astro:22`.
- Impact: Opening a large group immediately inserts every poem row. The more manageable destination, the filtered `/diwan/` view, is reachable only after that whole list. The raw current corpus contains 196 poems in الطويل; the component has no in-group limit or shortcut before those links. At phone width, a reader looking for a meter-specific list must traverse a long block before discovering the alternate view.
- Reproduction: On `/explore/meters/`, open الطويل, then try to find “عرضها بطاقاتٍ في الديوان” without a text find command. Repeat with a common rhyme at phone width.
- Minimal fix: Move or duplicate the existing filtered-list link immediately after the summary and before the poem list; use a clear current-view label such as `عرض القصائد في الديوان`. Preserve all static poem links and URLs.

### 4. P2 — Lexicon letter navigation targets sections that filtering has hidden

- Evidence: **source-confirmed inconsistent interaction state**, not visually confirmed.
- Location: `src/pages/explore/lexicon.astro:17` and `src/pages/explore/lexicon.astro:66`.
- Impact: The full alphabet remains a set of active links while filtered-out letter sections are `hidden`. Clicking one of those links changes the fragment but cannot take the reader to visible content, giving the appearance of broken navigation.
- Reproduction: Search for `عين`, then click a letter whose section has no matching entries. The selected letter target remains hidden. Search for a nonsense string and all letter targets become hidden while all navigation links remain active.
- Minimal fix: Hide the letter navigation while a query is active, or update it to include only sections with matches. A separate clear-search control can restore the complete alphabet.

### 5. P3 — Matali's per-rhyme counts do not reflect filtered results

- Evidence: **source-confirmed stale labels**, not visually confirmed.
- Location: `src/pages/explore/matali.astro:29`, `src/pages/explore/matali.astro:63`, and `src/pages/explore/matali.astro:70`.
- Impact: Search updates the overall output and hides individual rows, but each surviving rhyme heading continues to display its original total. The page can claim many openings in a visible group that contains only one matching opening, making the overall and local counts appear contradictory.
- Reproduction: Search a distinctive opening fragment so only one opening remains in a common rhyme. Compare the visible list with the small number next to its rhyme heading.
- Minimal fix: Recompute each visible group's count during the existing loop, or explicitly label the unchanged count as the total for that rhyme. Restore the totals when clearing the query.

### 6. P3 — Frequency cards lead to a different counting/matching concept without explaining it

- Evidence: **source-confirmed semantics mismatch; user confusion is a source-supported risk**, not visually confirmed.
- Location: `src/pages/explore/words.astro:24`, `src/pages/explore/words.astro:31`, `src/pages/explore/words.astro:34`; destination matching at `src/pages/search.astro:204` using substring `src/scripts/arabic-search.ts:54`; destination result count at `src/pages/search.astro:211`.
- Impact: A frequency card shows lexical occurrence counts and says the surface form matters (`الدهر` differs from `دهر`). Its destination performs folded substring matching and counts matching verses, including a short term inside longer words, rather than lexical occurrences. Readers cannot reconcile the card number with the search number. The source comment at words line 8 also explicitly says these frequencies predate joined waw, which deserves a separate data-method review rather than silently treating the counts as current search totals.
- Reproduction: Choose a short card word such as `يوم` on `/explore/words/`; inspect `/search/?q=يوم` for longer forms containing it and compare the search's verse results with the card's occurrence count.
- Minimal fix: Keep the existing search behavior and add a brief explanation on the frequency page: card counts are word occurrences; search shows verses and includes longer forms. Separately propose rebuilding frequency metadata from approved edition text if needed; do not alter edition data as a UX fix.

### 7. P3 — Long reference lists have uneven orientation aids

- Evidence: **source-confirmed information architecture; mobile effort risk requires browser confirmation**.
- Location: `src/pages/explore/matali.astro:25`, `src/pages/explore/words.astro:27`, `src/pages/explore/entities.astro:23` and `src/pages/explore/entities.astro:26`.
- Impact: The matali page renders all 685 openings grouped by rhyme but offers no rhyme jump navigation, although the adjacent qafiya page already has that pattern. Words renders 240 cards without a local word filter or alphabetic alternative. Entities places all people before all places without local section links. These pages work for sequential browsing but make targeted exploration unnecessarily dependent on long scrolling, especially on a phone.
- Reproduction: On a phone, try to browse matali under ي without knowing an opening; locate a particular frequency word without browser Find; or go directly to المواضع on entities. Record scroll distance and whether the destination is discoverable before assigning greater severity.
- Minimal fix: Reuse the existing 44px letter-link style for a matali rhyme jump row; add a lightweight client filter for the 240 frequency cards; add two small anchor links for الأعلام and المواضع. Retain the present cards, colors, fonts, and static content. These can be separate small changes.

## Coverage and checks without findings

| Surface | Source reviewed | Assessment and remaining check |
| --- | --- | --- |
| Explore hub | `src/pages/explore/index.astro`, `src/lib/nav.ts` | Fourteen cards have descriptive headings and working source destinations; phone CSS compacts them. Confirm card density visually. No source-supported blocker found. |
| Meters | `src/pages/explore/meters.astro`, IndexGroups | Native collapsible groups and filtered-list URLs; findings 2–3. |
| Qafiya | `src/pages/explore/qafiya.astro`, IndexGroups | 44px jump links; group keys use the same single-letter IDs. Findings 2–3. |
| Matali | `src/pages/explore/matali.astro` | Labeled input, normalized filtering, live total, explicit hidden styling, responsive grid. Findings 5 and 7. Zero-match feedback is a live zero count, without a recovery message; not classified as a broken state. |
| Themes | `src/pages/explore/themes.astro`, `src/lib/indices.ts` | Preliminary classification and multi-membership explained. Finding 2. Dedicated themes shell state is intentional in nav metadata. |
| Entities | `src/pages/explore/entities.astro`, `src/lib/indices.ts` | Matching limitation disclosed and mention count distinguished from poem count. Findings 2 and 7. |
| Hijaz | `src/pages/explore/hijaz.astro` | 23 current entries; selection by listed place names is explained; mapped places link to their profiles. No source-supported blocking issue found. Verify that styled spans versus links are visually distinguishable. |
| Stats | `src/pages/explore/stats.astro` | Totals use shaped poems and verified-note accounting; bar values appear as real text. Source grid has fixed label/value tracks; confirm bars remain legible at 375px and text zoom before reporting any overflow. |
| Lexicon | `src/pages/explore/lexicon.astro`, `src/lib/lexicon.ts` | Accessible search name, native links, normalized matching, sticky filter. Findings 1 and 4. |
| Words | `src/pages/explore/words.astro` and search handoff | 240 entries, Arabic count helper, frequency bars decorative. Findings 6–7. Confirm long count labels fit at 375px before reporting clipping. |

No visual contrast, overflow, touch-size failure, console-error absence, Arabic-rendering quality, or full accessibility compliance is claimed from source alone.
