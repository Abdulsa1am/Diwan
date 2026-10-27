# Declutter pass — 2026-10-27

Goal (owner): less filler text, tidier stacking of UI pieces. Not a redesign: same identity, colours, fonts, URLs.

Method: all 23 page types measured at 375px (an iframe inside the preview) and looked at at ~760px.
Numbers are "page height at 375px" and "controls on the first phone screen".

## Findings

### Poem page (`/poem/<id>/`)
- P1. Seven metadata chips under the title (meter, rhyme, verse count, volume, pages, «شروح الأبيات ٥», «حواشٍ أخرى (٣٧)») wrap onto 2–3 lines at 375px. «شروح الأبيات» repeats the count already on the «الشروح» button.
- P2. Back link «العودة إلى الديوان» takes its own 44px row above the title; the bottom nav and sidebar already lead to the catalogue.

### Home (`/`)
- H1. Six full-width cards in one column on phones (~75px each, page 1,255px). «الفهارس» and «محفوظاتي» repeat the bottom nav one thumb away.
- H2. Eyebrow line «نص الديوان • فهارس • أدوات قراءة» over the title says nothing the page doesn't.

### Atlas and place pages (`/explore/atlas/`, `/place/<name>/`)
- A1. Before the map: lede, a checkbox «خريطة كبيرة قابلة للتمرير», a link «قائمة جميع المواضع», and a two-sentence help paragraph. After it, another caption paragraph. Same block repeats on every place page.
- A2. The 133-place list is one tall card per place in a single column (12,975px at 375px). Most cards say «بلا إحداثيات» — the same words 100 times.

### Long index pages
- L1. `/explore/matali/`: the 28 rhyme letters fill the first phone screen as a 5-row grid; the page is 107,350px tall at 375px.
- L2. `/explore/relations/`: two lede paragraphs, then 284 accordions, each repeating «يجتمع في القصائد مع (الأرقام عدد القصائد المشتركة):» (284 copies). 66 controls on the first phone screen, 19,773px.
- L3. `/explore/words/`: a four-line counting-method paragraph sits between the lede and the list.
- L4. `/explore/rhymes/`: two explanation paragraphs; the second («كل الحروف متاحة هنا…») is filler.
- L5. `/explore/stats/`: four count cards wrap as 3 + 1 (an orphan card) at tablet/desktop widths.
- L6. `/explore/themes/`, `/explore/entities/`: caveat sentences sit as full paragraphs under the lede.

### Small pages
- S1. Ledes that restate the title: `/explore/` «طرق أخرى للوصول إلى القصائد.», `/explore/stats/` «أرقام الديوان كما في هذه النسخة.», `/explore/meters/` «…افتح البحر لترى قصائده.», `/explore/lexicon/` «…افتح اللفظة لترى مواضعها الأخرى.»
- S2. `/search/`: lede + empty-state sentence + examples box say the same thing three times before any result.
- S3. `/research/compare/`: selects and swap button are boxes inside a box.
- S4. `/word/<term>/`: the source line reads «الجزء ١، ص ١٦١ ، الصفحة في النسخة الرقمية» (stray space before the comma, unclear wording).

## Out of scope
- Poetry text, notes, intros and the biography text on `/about/` (content, not UI filler).
- `/diwan/` catalogue (reworked and reviewed 2026-10-24).
- Colours, fonts, URLs, the font lab.

## Work split (Codex `gpt-6.1-terra`, high)
| Worker | Findings | Files |
|---|---|---|
| reader | P1, P2 | `src/pages/poem/[id].astro`, `src/scripts/reader.ts` |
| home-small | H1, H2, S1 (explore hub), S2, S3 | `src/pages/index.astro`, `src/pages/explore/index.astro`, `src/lib/nav.ts`, `src/pages/search.astro`, `src/pages/research/compare.astro`, `src/pages/explore/phrases.astro`, `src/pages/saved.astro` |
| atlas | A1, A2, S1 (lexicon), S4 | `src/components/AtlasMap.astro`, `src/scripts/atlas-map.ts`, `src/pages/explore/atlas.astro`, `src/pages/place/[name].astro`, `src/pages/explore/lexicon.astro`, `src/pages/word/[term].astro` |
| indexes | L1–L6, S1 (stats, meters) | `src/pages/explore/{matali,relations,words,rhymes,stats,themes,entities,meters,qafiya,hijaz}.astro`, `src/components/IndexGroups.astro` |

## Result
All four workers finished; build, verify (1,168 pages, 32,342 verse halves), type check and tests pass. Poetry and data unchanged.

| Page (375px) | Before | After |
|---|---|---|
| Home height | 1,255px | 1,013px |
| Poem: first verse top | 455px | 406px; metadata on one line (two at 320px) |
| Atlas height | 12,975px | 6,604px |
| First lines (matali) height | 107,350px | 81,888px |
| Lexicon height | 31,194px | 25,258px |
| Relations: repeated sentence | 284 copies | 1 line at the top, plus a filter |

Changed in review by the lead:
- Poem page: the worker's markup change was missing (only CSS landed). Lead wrote it: top row = back link «الديوان» + «الجزء N، ص A–B»; under the title = meter, rhyme, verse count, and a quiet «حواشٍ أخرى» link. «شروح الأبيات N» chip removed.
- Atlas: removed the «قائمة المواضع» heading that sat right above «مواضع على الخريطة» (two big headings in a row); the `#places-list` anchor moved to the first group. Kind sub-headings made smaller than group headings.
- First lines: hid the letter row's desktop scrollbar; letters wrap from 700px up.
- Phrases: lede «اختر كلمة لتمدّ العبارة بها.» (meaningless before a search) → «اكتب لفظة لترى ما يسبقها وما يليها في الأبيات.»; example chips given a visible border (they were invisible in dark mode).
- Home: entries also in two columns from 621–800px (were still one column of six at tablet width).
- Line endings normalized to LF (workers wrote CRLF; `nav.ts`, `hijaz.astro` and `explore/index.astro` had been committed as CRLF against `.gitattributes`).

Browser: 21 pages × 320/375/760/1280px × light/dark (168 loads): no horizontal scroll, one h1, no script errors. Map enlarge toggle, relations filter and phrase examples tried by hand.

Not checked: real phones; screen readers.
