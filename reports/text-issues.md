# مراجعة نص الديوان — ٢٢ أكتوبر ٢٠٢٦

## قرارات مقترحة للمالك

لم أغيّر نصوص الديوان. هذه مقترحات، والقرار لك:

- **الموافقة على إصلاح المسافات الواضحة:** وجدت فصلًا بعد الهمزة في ٢٨٧ بيتًا، لكنه ليس كله استفهامًا. أوصي بوصل ٢٠٠ موضع واضح في الأبيات والعناوين والحواشي، مثل «أ ما» ← «أما» و«أ لم» ← «ألم». أرجأت الحالات المحتملة للنداء، مثل «أ بغداد»، واجتماع الهمزتين. لا تتغير الحروف أو الحركات في الإصلاح الآلي المقترح.
- **الموافقة على ضبط المسافات حول الترقيم:** إضافة مسافة في ٩٥ موضعًا، مثل «للّه!أيّ» ← «للّه! أيّ»، وحذف مسافة قبل العلامة في ٦٦ موضعًا، مثل «وقور ،» ← «وقور،». لا أوصي بحذف علامات الترقيم نفسها.
- **تقديم موضعين على بقية المراجعة:** في `r2-016`، البيت ١٦، «و؟؟؟الفا» قراءة غير محسومة. وفي `r2-042` يبدو أن البيت انقسم إلى المدخلين ١٩ و٢٠: «وركب أغذّوا بالرّكاب، فنشّفوا # ثمائلها» ثم «بالجوب غربا ومشرقا». يلزم الرجوع إلى الطبعة قبل أي تغيير، خصوصًا أن الدمج سيغيّر الترقيم اللاحق.
- **مراجعة الكلمات المنقسمة دون علامة وصل:** سجّلت ٥٥٢ موضعًا مرشحًا، مثل «كا # ن». التدوير في الشعر صحيح؛ موضع المراجعة هو غياب علامة تدل على اتصال الكلمة. هذه قائمة مساعدة وليست حكمًا بصحة كل اقتراح. وهناك أيضًا «ن ابي الوسادة» و«قد أ فلا» وكلمات قليلة تحتاج مقابلة.
- **مراجعة الشروح الناقصة ظاهريًا:** تنتهي ٢٢٨ حاشية و١٥ مقدمة بنقطتين دون شرح بعدهما، مثل «المراء:». قد يكون الشرح انتقل إلى موضع آخر أثناء الاستخراج؛ لا أقترح اختلاقه.
- **إبقاء الفواصل كما في الطبعة:** تنتهي صدور ٧٬٧٣٨ بيتًا بفاصلة، وفي ٤٬٦٩٥ بيتًا فواصل داخلية. أوصي بإظهارها كما طُبعت؛ فهي تساعد على فهم التركيب وإن كثرت وقفاتها على قارئ الشعر. ويمكن لاحقًا إتاحة خيار عرض يخفي فاصلة نهاية الشطر فقط، مع بقاء النص المحفوظ كما هو. هذا أخف بصريًا، لكنه قد يحجب وقفة قصدها المحقق، ولا سيما حين يمتد المعنى بين الشطرين.

## Technical notes

### Scope and CSV conventions

Reviewed all 685 poems: 16,180 stored verse strings (16,176 after excluding four quoted-preface strings), 685 titles, 685 intros and 6,324 notes. This is a corpus-level extraction/spacing audit, not a word-by-word collation against scans. No external edition was consulted; attribution of commas to the print edition follows the task brief. Source and edition agree in every reviewed field after whitespace removal, so these findings predate the approved waw joining.

`text-issues.csv` is UTF-8 with BOM, with the requested seven columns. It contains **1,239 occurrence-level proposals/review flags: 361 certain, 26 likely, 852 needs-review**. Multiple rows can refer to the same field. Each `before` is the full original field and each nonempty `after` changes just that row's occurrence; rows are independent, not a sequential patch. **An empty `after` means “reading/structural repair unresolved”, never an instruction to delete the text.** Diagnostic flags without a defensible reconstruction are retained to make the review list complete.

Verse numbers subtract `quoted_preface_verses[id].count`, as `src/lib/diwan.ts` does. Title/intro numbers are blank. A note gets a verse number only when `note-edition.json` links it uniquely within that same poem; otherwise it is blank. `poem_id` for notes identifies their original `data.json` container, even if the site relocates the note to another poem. Full `before` text identifies the note without inventing a verse link. Four quoted strings have no numbered-site-verse identity. Derived copies are not extra CSV rows.

### Rules and counts

| Category | Occurrences | Confidence / action |
| --- | ---: | --- |
| `hamza-join-*` | 200 | certain; remove ASCII spaces only: 194 verse, 3 title, 3 note |
| `hamza-other-interrogative` | 25 | likely; 23 verse, 1 title, 1 note; no automatic edit |
| `hamza-before-alef-review` | 42 | needs-review; 39 verse, 1 title, 2 note |
| `hamza-syntax-review` | 4 | needs-review; possible interrogative/vocative or other reading |
| `space-after-punctuation` | 95 | certain; 94 occurrences in 93 verses, plus 1 note |
| `space-before-punctuation` | 66 | certain; 10 verse, 3 intro, 53 occurrences in 42 notes |
| `unmarked-split-word-candidate` | 552 | needs-review; tentative tatweel marker only |
| `possibly-truncated-gloss` | 243 | needs-review; 228 notes and 15 intros ending in `:` |
| `broken-word-nabi` | 1 | likely; `r1-081:6`, «ن ابي» → «نابي» |
| `broken-word-afala`, `-alam`, `-adaan`, `-asadiqa` | 4 | needs-review; details below |
| `detached-interrogative-ma` | 3 | needs-review; orthographic repair changes a letter |
| `unresolved-question-mark-placeholder` | 1 | needs-review; no reconstructed reading |
| `broken-verse-wrap-review` | 2 | needs-review; two entries possibly belonging to one verse |
| `internal-period-review` | 1 | needs-review; period inside «للحلم. أوقات» |

Counts for every certain hamza rule follow. Tokens are shown without diacritics for grouping; the fixer preserves their original diacritics. “يرجى” includes «يرجّى» and «يرجى».

| Occurrences per token | Following token(s), with `أ + space` joined |
| ---: | --- |
| 33 | «ما» |
| 17 | «لم» |
| 13 | «ترى»، «لا» |
| 12 | «في» |
| 11 | «ليس» |
| 8 | «كذا» |
| 7 | «وما» |
| 5 | «من» |
| 4 | «ترضى» |
| 3 | «هذا»، «تطمع»، «ترجو»، «تراني» |
| 2 | «يرجى»، «حين»، «تحسب»، «لست»، «كل»، «يسمح»، «يعرقني»، «يعلم» |
| 1 | «فيها»، «يجزع»، «تراهم»، «يخفى»، «يكون»، «ينسبني»، «تخلع»، «تظنني»، «رأيت»، «تطلب»، «تصد»، «يصاح»، «يخاف»، «كنت»، «فلا»، «تنأين»، «يصرعني»، «يطلع»، «للواجد»، «بذاك»، «علي»، «بتالدي»، «بمعشري»، «يعوم»، «ترانا»، «توعدني»، «تحننا»، «عاينت»، «تقتص»، «تريد»، «تزحم»، «تذكراني»، «يرجع»، «وليس»، «تنظر»، «عندك»، «تظن»، «عذلتما»، «بالمخازي»، «ولم»، «تروي»، «للطعن»، «يوعدنا»، «يضعفني»، «يجرني»، «فالآن»، «وبعد»، «تذهل»، «يسنح» |

The broad standalone-hamza pattern has **292 occurrences in 287 verse strings**, plus 5 occurrences in 5 titles and 6 in 4 notes; none in intros. Of the 292 verse occurrences: 194 are certain joins, 23 likely joins, 47 require review (including the four broken-word cases), and 28 are held without a replacement proposal. The 28 held cases are 26 apparent vocatives and two «أ اللّه» oath/vocative cases (`r1-179:19`, `r2-026:3`). Keeping these out of the fixer is a conservative editorial-policy choice, not a claim that joining a vocative hamza is always wrong.

Important exceptions:

- `r1-243:12` «قد أ فلا» probably contains the verb «أفلا» (the two stars set), unlike interrogative «أ فلا» in `r1-244:1`.
- `r2-198:2` «فما لجرحي من النّدى أ لم» probably ends in the noun «ألم», not interrogative «ألم». `r2-275:7` «أ ضأن» and `r2-297:44` «أ صادقا» also need lexical review. CSV joins are tentative space-only candidates, not certified readings.
- «أ أرجو»، «أ أبقى»، «أ إلى»، «أ ألآن» and «أ الآن» are held: merely removing the space can leave an inappropriate hamza/alef spelling. No contraction to آ, letter deletion or hamza normalization is inferred.
- The four syntax-review locations are `r1-028:11`, `r1-124:48`, `r1-224:60`, `r1-306:1`. Remaining noun-led interrogatives are conservatively “likely”, even when joining appears natural.
- `r2-161:32` and `r2-166:62` have «إلى م»; `r2-178:62` has «فعلى م». Suggested «إلام» / «فعلام» requires changing ى to ا. These are excluded from automatic edits; spelled-out «إلى ما» at rhyme endings is not automatically shortened.

### Punctuation, characters and commas

The broad glued-punctuation scan flags **94 verses**, matching the brief. One is the damaged `r2-016:16` «و؟؟؟الفا»; its final question mark must not be treated as a normal sentence boundary. Excluding it leaves the 94 fixable occurrences in 93 verses above (one verse has two). They are 84 exclamation marks and 10 question marks; the note adds one more question mark (`r2-154`, raw note index 21, «بمطره؟وفي»). No glued comma, semicolon, colon, period or ASCII question mark was found.

Two adjacent-mark sequences occur: the unresolved «؟؟؟» above and the plausible rhetorical «؟!» at `r2-117:27`. Do not collapse either automatically. Verse punctuation comprises 13,339 Arabic commas, 283 ASCII colons, 276 Arabic semicolons, 102 ASCII exclamation marks, 102 Arabic question marks and 2 ASCII periods. One period splits «وللحلم. أوقات» at `r1-035:6` (CSV review proposal); the other ends quoted line 2 of `r2-273`. Latin-style punctuation is not itself evidence of corruption. No ASCII commas or ASCII question marks occur in the reviewed fields. Hyphens occur in 2,982 notes and 45 intros, usually separating glossary entries; no automatic punctuation-style conversion is proposed.

The full code-point inventory found **zero Latin letters, Persian ی/ک, zero-width/bidi format characters, Arabic presentation forms, replacement characters, non-ASCII whitespace, orphan combining marks, or unbalanced parentheses/guillemets** in the four reviewed field types. No digits occur in verses or titles. There are 369 ASCII digit characters in 123 intros and 6,377 in 6,316 notes, chiefly dates and printed note labels; these are not demonstrated extraction errors. Six asterisks occur as `***` in two intros: the volume-ending colophon at `r1-380`, and a gloss divider at `r2-052`; neither is silently deleted.

Comma definitions: trim each half; count a terminal comma separately from all earlier commas. **7,738 paired verses** have a terminal sadr comma; **2** have a terminal ajuz comma (`r1-046:13`, `r2-233:15`). **4,695 strings have an internal comma**: 4,692 paired strings plus `r1-281:2`, `r2-015:39`, `r2-134:5`. The quoted `r2-274` line 1 has only a terminal comma. Across paired strings there are 5,595 internal comma characters. These are punctuation observations, not CSV deletion proposals. Recommended default: keep printed punctuation visible. Any future hiding must affect only a terminal half-verse comma in the rendering layer, with stored/copyable text retained and the choice reversible; avoid treating a metrical half-line as necessarily a syntactic stopping point.

### Verse structure and extraction artifacts

Exactly 16,162 strings have one `#`; 18 have none; none has multiple separators or an empty half. Of those 18:

- Four are already documented quoted prefaces: the first two strings in each of `r2-273`, `r2-274`. No repair is proposed.
- Thirteen are final single lines of poems labelled الرجز: `r1-086:3`, `r1-090:17`, `r1-164:25`, `r1-281:2`, `r1-328:14`, `r2-015:39`, `r2-044:28`, `r2-122:4`, `r2-134:5`, `r2-167:3`, `r2-192:2`, `r2-227:15`, `r2-291:25`. Their form may be intentional; do not invent a missing half or insert `#`.
- `r2-042:20` occurs inside a poem labelled الطويل. Together with the unusually short ajuz at 19, it suggests a wrapped verse. A possible combined reading is «وركب أغذّوا بالرّكاب، فنشّفوا # ثمائلها بالجوب غربا ومشرقا». Check the printed page before merging, updating counts, and remapping later verse/note references. The CSV leaves both readings unresolved.

674 strings already mark تدوير with tatweel before `#`. Nine also put a tatweel at the start of the second half (`r1-015:4`, `r1-099:2`, `r1-217:27`, `r1-228:49`, `r1-318:39`, `r2-118:1`, `r2-119:34`, `r2-203:26`, `r2-297:4`); this is a consistent continuation convention, not a proven error.

The **552 additional unmarked-split candidates** are a review shortlist, not an exhaustive or certified count: 480 have a concatenated token attested elsewhere in the corpus or in an explicitly marked split; 72 more end in a single-letter continuation. The heuristic excludes punctuation-ended sadrs, a leading standalone interrogative أ in the ajuz, and 12 manually checked ordinary boundaries which happen to concatenate into a word. Examples: «كا # ن» (`r1-008:5`), «خال أ # مي» (`r1-175:4`), «ولو أ # نّي» (`r2-038:24`), «إ # لا» (`r2-267:27`). Do not join across `#` or call metrical تدوير a textual error. All proposed tatweels require review.

228 colon-ended notes and 15 colon-ended intros are listed individually in the CSV. For example `r1-001` raw note indices 6, 10 and 16 end with «الكوم، جمع كوماء:»، «المراء:»، «النقع:». These may reflect gloss material displaced between notes and intros, not necessarily lost words. They require page/context comparison. Existing reviewed intro boundaries were not overridden.

### Fixer safety and validation

Run `node tools/fix-text-issues.mjs` for counts only. `--self-test` also writes nothing. **`--apply` was not run.** It would modify 337 canonical fields (286 verse, 3 title, 45 note, 3 intro), using only the 361 certain space edits. It never applies likely/review proposals, reconstructs words, inserts tatweels, removes punctuation, merges entries or moves text across a hemistich boundary.

All edition JSON files are read. Rules run on canonical `data.json` text fields; exact full-string copies elsewhere are synchronized. The three changed intros also support exact-substring synchronization of reviewed `main`, `appendix` and `start_of_appendix` fields. Unrelated prose, links, identifiers and object keys are untouched; this is deliberately narrower than a recursive spelling normalizer. Planned changed-string counts, including canonical fields and mirrors:

| File | Strings |
| --- | ---: |
| data.json | 337 |
| meta.json | 64 |
| indices.json | 47 |
| note-edition.json | 13 |
| glossary-edition.json | 7 |
| atlas.json | 4 |
| person-identification.json | 3 |
| editorial.json | 1 |

Every certain edit must match its allowed local operation. Removing only ASCII spaces must leave the entire original code-point sequence identical, including letters, diacritics, punctuation, tatweels and `#`. The complete serialized JSON receives the same invariant check. All files are planned and checked before writing; input bytes are checked again for concurrent changes. Exact copies with conflicting proposed readings abort. This does not rebuild token indexes or generated site files; those need the normal rebuild/verification after any owner-approved application. Rerunning the existing source-to-edition data pipeline would recreate the pre-review edition unless this opt-in step is deliberately included later.

Validation: script syntax, targeted safety/exception assertions, corpus-wide idempotence including mirrored JSON, CSV schema/BOM/numbering, count reconciliation, and unchanged hashes across dry-run/self-test. No `data/`, `src/`, `public/` or git changes were made. Per the task's narrower write permission, `PROGRESS.md` was not updated and no commit was made.

Audit snapshot SHA-256 (`data/edition/data.json`): `f1c9980279312de85869fe69e6ca02be140c5b8363f82cf0e9754231f497b2de`.
