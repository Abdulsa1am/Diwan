# U12 — word-index proposal (policy approved 2026-10-24)

Generated deterministically by `node tools/propose-word-index.mjs --report`. No clock, network, dependencies or data writes. Parsed input SHA-256: `1e328d7621e21f83068e7610705fbb5bbc7e665c6fed1ab1067f098a5d8881b2`. The only optional write target is this report; unsupported flags fail. No metadata is applied or added to the normal data pipeline.

## Approved counting contract

- Read approved edition verses only. Exclude titles, introductions, notes and the four quoted-preface rows identified by poem-edition.json. Count 16176 own-poem rows; including quotes would count 16180 rows and 25 additional tokens. Own-verse numbering starts after the excluded preface.
- Extract Arabic letter runs, preserving attached diacritics until normalization. Punctuation and ordinary # boundaries separate tokens; they do not concatenate surrounding words. Remove diacritics/tatweel and fold alef variants, alef maqsura, hamza seats and ta marbuta exactly as documented in search. No stemming, article removal, stop-word filtering, minimum length or inferred word repair. Latin letters and numerals are excluded.
- Join only the explicitly documented tatweel-before-# boundary in an in-memory analysis copy. There are 674 such own-verse rows. Ambiguous unmarked fragments remain separate pending printed-book review. Display text and edition files remain byte-for-byte untouched. A future builder should retain source poem/verse and token offsets, as corpus.ts now does for runtime highlighting.
- Recommended baseline: attached conjunctions remain attached surface tokens. Search for الزمان can still match والزمان; that is a different unit from exact-token frequency. Do not strip initial waw blindly: it also begins lexical words such as ورد. The sensitivity column below deliberately strips *every* initial waw from tokens longer than one letter to quantify the risk; it is not a linguistic recommendation. Detached conjunction و remains its own token if one survives the approved edition.
- Count occurrences (repetitions within one verse count again) and distinct poem IDs independently. Choose display spellings by frequency, then a deterministic Unicode tie break; sort records by descending occurrences then normalized Unicode key. Selection of which words to publish is a separate editorial decision, not inferred from the old shortlist.

## Reproducible numeric differences

Baseline: 149549 tokens, 44311 distinct normalized forms. Without joining marked splits: 150223 tokens, 44455 forms. With all quoted rows: 149574 tokens, 44316 forms. Blind initial-waw stripping: 149549 tokens, 39868 forms.

208 of 240 current legacy shortlist records differ from baseline occurrence and/or poem totals. These are diagnostic candidate counts, not approved replacement totals. Differences cannot be attributed solely to waw joining because the original tokenization/selection contract is unknown.

Cells below are occurrences / distinct poems; no column counts matching verses or substrings.

| Term | Legacy | Baseline candidate | Without split joining | Blind waw sensitivity |
| --- | --- | --- | --- | --- |
| الزمان | 300 / 163 | 291 / 159 | 291 / 159 | 300 / 163 |
| يوم | 426 / 230 | 387 / 220 | 388 / 220 | 425 / 230 |
| الا | 702 / 301 | 702 / 302 | 702 / 302 | 715 / 303 |
| بالخيف | — | 5 / 5 | 4 / 4 | 5 / 5 |
| غير | 486 / 198 | 474 / 193 | 473 / 193 | 487 / 198 |
| الدهر | 296 / 187 | 292 / 179 | 277 / 177 | 312 / 190 |
| كنت | 286 / 184 | 234 / 155 | 231 / 153 | 288 / 186 |
| العلى | 264 / 149 | 252 / 145 | 252 / 145 | 264 / 149 |
| اني | 257 / 171 | 177 / 134 | 177 / 134 | 284 / 186 |
| المجد | 245 / 135 | 236 / 132 | 228 / 129 | 253 / 138 |
| القنا | 227 / 144 | 192 / 127 | 191 / 126 | 228 / 145 |
| لما | 204 / 151 | 150 / 123 | 150 / 123 | 205 / 151 |
| الله | 198 / 131 | 188 / 126 | 189 / 127 | 195 / 129 |
| فلا | 198 / 149 | 196 / 148 | 196 / 148 | 197 / 148 |
| علي | 196 / 134 | 2245 / 478 | 2250 / 478 | 2286 / 481 |
| الليالي | 186 / 134 | 180 / 131 | 180 / 131 | 186 / 134 |
| الايام | 185 / 128 | 174 / 124 | 171 / 123 | 188 / 129 |
| ليس | 180 / 136 | 83 / 76 | 82 / 75 | 169 / 129 |
| الردى | 171 / 118 | 168 / 115 | 168 / 115 | 171 / 118 |
| منك | 170 / 117 | 169 / 117 | 167 / 116 | 172 / 118 |
| لقد | 165 / 124 | 121 / 93 | 121 / 93 | 165 / 124 |

## Marked split samples

- r1-008, own verse 4: «وتعمّد ذكري، إذا كنت بالخيـ # ف، لظبي من بعض تلك الظّباء» → analysis tokens: وتعمد، ذكري، اذا، كنت، بالخيف، لظبي، من، بعض، تلك، الظباء
- r1-008, own verse 7: «كنت خبّرتني بأنّك في الوجـ # د عقيدي، وأنّ داءك دائي» → analysis tokens: كنت، خبرتني، بانك، في، الوجد، عقيدي، وان، داءك، دايي
- r1-008, own verse 8: «ما ترى النّفر والتّحمّل للبيـ # ن، فما ذا انتظارنا للبكاء» → analysis tokens: ما، تري، النفر، والتحمل، للبين، فما، ذا، انتظارنا، للبكاء
- r1-015, own verse 4: «إلى أن ظفرنا بكأس النّجيـ # ـع، فالرّمح يشرب حتى انتشى» → analysis tokens: الي، ان، ظفرنا، بكاس، النجيع، فالرمح، يشرب، حتي، انتشي
- r1-015, own verse 38: «لهم كلّ يوم إلى الغادريـ # ن جمع تقلقل عنه الفضا» → analysis tokens: لهم، كل، يوم، الي، الغادرين، جمع، تقلقل، عنه، الفضا
- r1-015, own verse 40: «وتنهض في صهوات الهجيـ # ر بين النّعام وبين المها» → analysis tokens: وتنهض، في، صهوات، الهجير، بين، النعام، وبين، المها
- r1-015, own verse 50: «بكلّ معوّذة بالحديـ # د، إن روّعتها نبال العدى» → analysis tokens: بكل، معوذه، بالحديد، ان، روعتها، نبال، العدي
- r1-015, own verse 55: «فلا زلت في رقدات النّعيـ # م تهفو بلا موقظ من أذى» → analysis tokens: فلا، زلت، في، رقدات، النعيم، تهفو، بلا، موقظ، من، اذي

## Review record and implementation

The owner approved the exact surface-form baseline, search-style folding, quotation exclusion, marked-split joining and retention of the legacy shortlist with its two duplicate normalized groups merged. Attached conjunctions remain part of the full word. The lead applied the derived artifact only after approval.

Production implementation: `tools/build-word-index.mjs` and the shared pure tokenizer `src/scripts/analysis-words.mjs`. The explicit `--apply` writes only `data/edition/word-frequencies.json`; the full data pipeline runs it after the two approved spacing steps. The artifact carries policy/provenance, 238 records and their source poem IDs. Verification recomputes it and rejects stale or changed contents. The original sensitivity columns and 240-row CSV preserve the diagnostic review evidence. Display labels remain the existing legacy labels; for either merged group, the most frequent candidate legacy spelling in the edition wins, with Unicode ordering for ties.

## Complete review artifacts

The [full CSV comparison](word-index-proposed-changes.csv) lists all 240 legacy rows, their candidate counts, deltas and normalized keys. No rows are silently removed or applied.

Search-style normalization merges 2 pairs of existing labels: «مني» / «منى» → «مني»، «ابي» / «ابى» → «ابي». The approved rebuild merges each pair into one frequency record and retains the other shortlist terms. The CSV intentionally preserves every old row for comparison, including the two pairs before merging.
