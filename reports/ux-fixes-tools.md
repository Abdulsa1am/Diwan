# Interactive-tool UX fixes — 2026-10-24

Implementation-worker handoff. Changes are limited to the five owned source files, the dry-run proposal script and these two reports. No browser opened, commit made, dependency added, edition/source/original text changed, metadata applied, or normal data pipeline modified. Other workers’ concurrent changes were retained.

- **U14:** Corpus HTTP failures and rejected downloads reset the shared cached promise. Phrase preload catches rejection. Phrase and comparison show Arabic recoverable errors with explicit retry, preserve typed/select values, hide stale output while pending/failed, and ignore superseded asynchronous work. Retry focus survives both success and another failure. Scoped hidden rules prevent button display styles from exposing unavailable controls.
- **U17:** Comparison validates incoming IDs against rendered options before assigning selectors. Empty/unknown parameters recover to valid defaults with an explanation and corrected share URL. Missing corpus poems or empty verse collections produce a usable message instead of reading an absent first verse. Native form submission is intercepted.
- **U18:** `analysisWords()` joins only the explicit tatweel-before-# marker in memory, tokenizes Arabic runs, and retains original offsets. Comparison uses those tokens. Phrase highlighting maps exact token matches back to original halves, clipping ranges at the display boundary. All original letters, diacritics and tatweel remain in displayed examples; joined derived spellings are used only as analysis labels. Ordinary punctuation remains a word boundary.
- **U19:** Both continuation directions append batches of fourteen; examples append batches of thirty. Each has a displayed/total label and a more button until exhausted. No branch or example is silently discarded.
- **U20:** Choosing a continuation focuses the stable current-phrase element after rebuilding and announces phrase/result state. More buttons focus the first appended control/link and announce the displayed total. Errors during branch expansion focus retry. Long phrase/branch text has scoped width/wrapping safeguards.
- **U21:** Empty submission, ordinary input clearing and native `search` clear invalidate pending work, clear derived containers, hide results/retry, restore the initial prompt and remove q from the URL. Editing a nonempty phrase hides analysis for the prior input until submission.
- **U09/U28:** Relations retain native details semantics with a visible rotating chevron. Local copy explains shared-poem counts; linked chips’ accessible names include the unit, and nonlinked chips spell it out.
- **U30:** Wheel has a prominent pre-wheel link to its full letter legend, a titled/explained legend, minimum 44px legend targets, and letter/count accessible names. Proportional sectors remain unchanged.
- **U12:** `node tools/propose-word-index.mjs --report` writes only the fixed proposal report. Without the flag it prints to stdout; unsupported flags fail. The report defines exact token, conjunction, quote, split-word and counting policies; reports hashes/totals, differing legacy records and samples; compares unjoined and blind-waw sensitivities; and lays out approval decisions and a future rebuild. Candidate baseline: 149,549 tokens / 44,311 forms; 208 of 240 legacy shortlist records differ. These are diagnostic candidates, never replacement metadata.

## Checks

- `npm run build`: passed, 1,168 pages.
- `npm run verify`: passed, 32,342 verse halves checked. Early attempts encountered missing dist files during concurrent builds; retried after generation completed.
- `npm run check`: passed, zero errors/warnings; two existing/unowned hints in the final check (shared clipboard fallback and detached-waw script).
- `npm test`: passed, Arabic search suite.
- Additional inline Node assertions: joined split-token offsets and unchanged original text, punctuation boundaries, HTTP 503 recovery, network rejection recovery, one shared in-flight request, and successful cached corpus all passed.
- Proposal reproducibility: two stdout runs and the saved report matched byte for byte.

## Limitations and cross-file handoff

Lead browser verification remains required at phone/desktop widths in light/dark, with keyboard continuation, native search clearing, invalid comparison URLs, repeated offline/retry and assistive-technology announcements. No browser geometry, console or spoken-screen-reader claim is made here. The comparison empty-poem guard is source/type checked; the current corpus has no empty own-poem collection.

U22 (opening the qafiya fragment’s details after wheel navigation) belongs to the destination/index worker; no destination files were changed here. U14 on the standalone search page belongs to the search worker. U09 on other index pages belongs to their owner. U12 requires explicit owner approval and a separately authorized derived-artifact/UI/pipeline change; no such application was attempted. There are no additional source-file changes required to use this worker’s tool fixes.
