# U12 approved frequency rebuild — worker handoff, 2026-10-24

The owner approved full normalized surface tokens, exclusion of the four quoted-preface rows, joining only explicit tatweel-before-# splits in derived analysis, and retaining the legacy shortlist with its two normalized duplicate groups merged. No data files were created or modified by this worker. No valid --apply invocation or npm run data was executed. No browser or commit.

## Implementation

- `src/scripts/analysis-words.mjs` is the pure tokenizer/normalizer shared by runtime corpus analysis and the production builder. Original offsets, diacritics and split-word phrase highlighting are preserved. Arabic regex ranges are escaped. Punctuation and ordinary # are boundaries; attached waw stays attached; detached waw is its own token.
- `tools/build-word-index.mjs` exports the pure builder, canonical serializer, artifact validator, input reader and injectable CLI. Plain `node tools/build-word-index.mjs` is read-only. Only an explicit single --apply flag permits writing the fixed `data/edition/word-frequencies.json` target. Unknown/duplicate flags fail before I/O. Existing indices.json is never rewritten.
- Output contains schema/policy versions, canonical input SHA-256 with no clock, full policy/provenance, corpus totals and the 238 retained normalized shortlist records. Each record includes its key, selected original legacy label, occurrence count, distinct poem count and sorted source poem IDs. Unique legacy labels stay unchanged; duplicate groups select only among candidate legacy labels by edition spelling frequency after marks/tatweel removal without folding, then Unicode order. Record order is descending count, then Unicode key. Source poem IDs account for about 301 KB of pretty-printed build-time JSON; no corpus or frequency JSON is downloaded by the word-page browser script.
- `src/pages/explore/words.astro` imports the artifact at build time. The existing filter and styling remain. Arabic copy explains normalized complete-word occurrences, attached conjunctions, quote exclusion and the distinction from substring-matching verse search; the stale-count warning is removed.
- `package.json` appends the builder --apply as the final data-pipeline step, after extraction and the two already approved spacing stages. npm test now also runs the focused Node tests; no dependencies or lockfile changes.
- `tools/verify-build.mjs` first recomputes and compares the entire artifact against current inputs. Missing, stale, malformed, changed-count/label/ID, extra-field and changed-policy artifacts fail with a rebuild command before inspecting dist. Pure recomputation validation also catches tokenizer behavior changes even if a developer forgets to bump the policy version.
- The lead's complete proposal CSV logic and all earlier lead/worker changes were retained. The proposal script/report were not regenerated or changed in this follow-up.

## Read-only result

- 240 legacy rows → 238 normalized records.
- 149,549 tokens in 16,176 own-poem verses across 685 poems.
- Duplicate groups: مني / منى → display مني; ابي / ابى → display ابي.
- Current canonical input hash: `526c908962104da8c39e6e42e7e4b3207aa677190ab1ea3f7acf29d9aa136465`.

## Checks and limitations

- `node tools/build-word-index.mjs`: passed with a no-files-written summary.
- `node --test tools/_word-index.test.mjs`: seven tests passed.
- `npm test`: existing Arabic search tests plus all seven focused tests passed.
- Focused coverage: repeated occurrences versus distinct poems; attached and detached waw; ordinary versus marked half boundaries; punctuation; quote exclusion; merged labels and frequency/Unicode selection; unchanged source strings; exact original offsets and phrase highlight preservation; deterministic sorting/hash; normalization agreement with search; tampered/stale artifact rejection; approved production shortlist/totals; read-only CLI writer spy and before/after input/artifact hashes.
- `npm run check`: blocked by exactly one error, the intentionally missing initial word-frequencies.json import; two existing hints remain (clipboard fallback and detached-waw script).
- `npm run build`: blocked by the same missing initial JSON import.
- `npm run verify`: correctly rejects the missing initial artifact with the lead apply command. Build output was not manually edited.
- The actual filesystem write branch remains for the lead to execute and review; tests exercised pure building/validation and dry-run safety without creating data output.

## Lead next step

Review the full diff, then run exactly:

```powershell
node tools/build-word-index.mjs --apply
```

This creates only the standalone approved derived artifact. Then run npm run build, npm run verify, npm run check and npm test, and review the frequency page in the browser. No other worker/source changes are needed before applying. Do not run npm run data merely to create this initial artifact; the single builder command avoids unnecessary extraction and spacing rewrites.
