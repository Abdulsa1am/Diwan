# Generated-page structural review — 2026-10-24

## Scope and method

Read-only sweep of the **current** `dist/` output after the lead's build. All 1,168 HTML files were inspected with inline Node commands; no app, script, data, or build file was written. Only this report was created. No browser was used: these results establish HTML structure and destination existence, **not visual correctness**, layout, focus behavior, console health, live HTTP status, or external-source availability. This is fresh evidence, not a reuse of previous audits.

A first general Python parser attempt did not complete and was interrupted. The completed results below come from the subsequent Node sweep. The Node checks use regular expressions against Astro's serialized markup, not a browser DOM or a full HTML conformance validator. IDs, local hrefs, known output classes, and source templates were checked together to avoid treating client-populated lists as missing content.

## Inventory

| Route family | HTML pages |
| --- | ---: |
| `/poem/<id>/` | 685 |
| `/word/<term>/` | 329 |
| `/place/<name>/` | 133 |
| `/explore/` and its generated tools | 14 |
| `/research/compare/` | 1 |
| `/about/`, `/diwan/`, `/saved/`, `/search/` | 4 |
| `/` | 1 |
| `404.html` | 1 |
| **Total** | **1,168** |

The dynamic route families account for 1,147 pages. Redirect-only routes are not generated HTML pages and are excluded from this inventory.

## Completed structural checks

- **81,165 local href references checked**, including anchor links, SVG sprite references and local assets/canonical links. Each relative or root-relative URL was resolved against its source route, query removed, percent-encoded paths decoded, and matched against a real generated file or index file. **Zero missing file targets.** This figure counts references rather than distinct URLs.
- **47,473 fragment references checked** against IDs in the resolved destination HTML, including same-document references. **Zero missing fragment IDs.** This proves a target exists; a hidden or collapsed target can still be a poor interaction, as described in the index-page report.
- **Zero duplicate IDs** found within a generated HTML file.
- Every HTML file has exactly one `<h1>`, a nonempty `<title>`, a description, and a canonical link. These checks did not assess the quality of every description or recheck uniqueness.
- All **685 poem pages** contain verse rows: **16,176 own-poem verse rows**, **zero empty poem lists**, and **zero empty rendered hemistich spans**. The source corpus contains 16,180 rows; the difference is the **four quoted-preface rows** rendered separately as quotations. `/poem/r2-273/` and `/poem/r2-274/` exercise that branch. This pass did not replace the existing verse-integrity verifier.
- All **329 word profiles** contain at least one glossary article: **344 articles total**, each with its linked explanatory verse. No glossary article lost its verse branch in the generated output.
- Place profiles contain **370 poem-fragment links** across direct and indirect witnesses. Every target exists. This is a reference count, not a count of unique verses.
- **31 place profiles** show the explicit no-direct-witness explanation; examples include `/place/أبانان/`, `/place/أحد/`, `/place/الخط/`, and `/place/الرصافة/`. This is an intentional state supported by `src/pages/place/[name].astro:40`, not an empty-page defect. Indirect witnesses or notes can still follow it.
- **109 word profiles** show “لم ترد بهذه الصورة في موضع آخر من الديوان.” Examples: `/word/أتسلّى/`, `/word/أرشية/`, `/word/أقلالهم/`. These still have their explanatory glossary verse; the message concerns additional occurrences.
- Exactly **five literally empty list elements** were found: search `#results`; phrases `#before`, `#after`, `#samples`; compare `#sharedWords`. These are expected client-rendered containers. No static poem, word-profile, or place-profile list was literally empty. This check does not prove that asynchronous scripts eventually populate them.
- All **1,168 HTML files** retain `noindex`, matching the approved friends-test deployment requirement. This is expected, not an SEO finding.

## Findings and metadata provenance

### 1. P2 — Frequency metadata still comes from the detached-waw corpus

**Evidence: source/data-confirmed; no visual claim.**

Location: `src/pages/explore/words.astro:8`–9 and `src/pages/explore/words.astro:24`–34. The extraction/space-joining pipeline only recursively changes strings, not numerical derivations (`tools/fix-detached-waw.mjs:47`–50, 60–73). The current `data/source/indices.json` and `data/edition/indices.json` have identical parsed `words` records. Their only changed top-level fields are `matali` and `longest` string content. `themes`, `entities`, `hijaz_ids`, and `hijaz_terms` also remain unchanged; their continued equality is provenance evidence, not by itself proof that each classification or count is wrong.

Impact: `/explore/words/` presents authoritative-looking current-edition occurrence and poem totals while its own source comment says its frequency list predates waw joining. This conflicts with AGENTS.md's requirement to rebuild precomputed lists. The frequency card's token count also differs conceptually from the search page's verse/subword count, so the destination cannot validate it.

Read-only diagnostic comparison against current own-poem verses:

| Term | Listed occurrences / poems | Current exact normalized tokens / poems | Current substring-matching verses / poems |
| --- | --- | --- | --- |
| `الزمان` | 300 / 163 | 291 / 159 | 293 / 165 |
| `يوم` | 426 / 230 | 388 / 220 | 825 / 333 |
| `الا` | 702 / 301 | 702 / 302 | 3,539 / 530 |

Diagnostic method: remove the same diacritic/tatweel ranges and fold the same Arabic letter forms as the search code, skip quoted-preface rows, tokenize with `[\u0621-\u064A]+`, count exact token matches and distinct poems, and separately count verses containing the normalized substring. These columns deliberately represent different units. They demonstrate that the existing figures are not reproducible as current exact-token totals under this documented method; they are **not proposed replacement editorial counts**, and do not establish how every legacy number was originally computed. The mismatch is not attributed solely to waw joining without a reproducible legacy tokenization specification.

Reproduction: open `/explore/words/`, read the `الزمان` or `يوم` card, and compare the current edition with the above tokenization, or follow the card to search and observe the different matching/counting unit.

Minimal identity-preserving fix: propose a dry-run index builder and report using explicitly documented tokenization against approved edition text, including an intentional policy for conjunction prefixes and quotes. Obtain owner approval before changing generated edition data. Keep current routes, cards, fonts and colors. Clarify the count unit and search handoff as described in the index report; a copy-only clarification does not repair stale derivations.

### 2. P3 — Glossary source citations put a middle dot next to Arabic page digits

**Evidence: current source and generated text confirmed; visual ambiguity not measured.**

Location: `src/pages/word/[term].astro:46` (the literal middle-dot separator; source citation block begins at line 41).

Impact: Source citations render patterns such as `ص ١٠ · الصفحة في النسخة الرقمية`. The project explicitly avoids `·` next to numbers because it resembles Arabic zero. This branch is present in generated glossary profiles, including `/word/السناء/` and `/word/السنى/`.

Reproduction: open a word profile, expand “نص الحاشية”, and read the page number followed by the digital-edition link.

Minimal fix: replace the UI separator with `،` or spacing/layout separation. Leave the note, verse and source page number untouched.

## Highest-risk manual capture fixtures

These are **test fixtures, not visually confirmed defects**. Lengths below are string-character counts of extracted text including Arabic diacritics, not glyph widths; they select candidates for rendering tests.

| Priority fixture | Reason and interaction to capture |
| --- | --- |
| `/poem/r1-236/` | Joint-longest rendered half by measured text length: 37 characters, `نائي الخنا، داني النّهى، صافي السّدى،`. At 375px, inspect font-fitting, wrapping/stacking and diacritics; then open size/layout settings. `/poem/r2-253/` ties at 37. |
| `/poem/r2-156/` | Largest folded residual-note block: 2,155 characters and 51 notes, with 89 own-poem rows. Open “حواشٍ أخرى”; check scanability and return to reading. |
| `/word/القعاقع/` | Longest generated glossary-note block: 338 characters including source UI. Expand note at 375px and inspect wrapping, citation separator, source-link target area. |
| `/word/عين/` | Two different gloss meanings; validate that both articles, verse destinations and “other occurrences” wording are understandable. Also reproduces the index-search omission documented separately. |
| `/place/الخط/` | Longest explanatory place note: 173 characters; zero direct witnesses but discussion of indirect usage. Check that the empty-state wording and subsequent evidence do not appear contradictory. |
| `/place/نجد/` | Highest generated place witness-link count: 33 links. Check long-list orientation and cross-page fragment landing. `/place/منى/` follows with 32. |

Additional compact coverage if the lead can capture more:

- `/poem/r1-227/`: longest poem, 119 rows; `/poem/r2-085/` follows at 111.
- `/poem/r2-070/`: joint-longest poem heading, 21 characters (`ما حاجتي إلاّ المعالي`); `/poem/r2-295/` ties (`قافية الواو علق القلب`).
- `/poem/r1-103/`: one-verse poem; `/poem/r1-086/`: contains a single-half verse; `/poem/r2-274/`: separate attributed quotation plus 93 own-poem rows.
- `/poem/r1-001/`: largest expanded introduction block, 445 characters including its summary and reviewed appendix.
- `/word/الشّدقميات/`: longest word-profile heading, 10 characters; `/word/أواخي/`: longest meaning preview, 61 characters.
- `/place/أبرق الحنان/`, `/place/جزع السمرات/`, `/place/دير الجماجم/`: longest place headings, 11 characters.

## Practical limits

The sweep cannot establish that browser-loaded controls work, links scroll below sticky bars, closed disclosures expose a targeted verse, font fitting handles each line, or profiles look correct in both themes. It does not verify live redirects, status codes, external sources, editorial identities, classification completeness, or printed-book text issues. Existing unknown text issues are neither corrected nor recast as new audit discoveries. No generated data or app change was made.
