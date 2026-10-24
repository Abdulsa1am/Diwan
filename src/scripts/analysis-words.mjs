// Pure approved U12 surface-word analysis, shared by Node builders and browser tools.
// Bump policy version in the builder when changing these rules.
const FOLDS = /** @type {Record<string, string>} */ ({ 'إ': 'ا', 'أ': 'ا', 'آ': 'ا', 'ٱ': 'ا', 'ى': 'ي', 'ؤ': 'و', 'ئ': 'ي', 'ة': 'ه' });
/** Remove marks without folding letters, for approved legacy display-label selection.
 * @param {string} text */
export const unmarkedWord = (text) => text.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, '');
/** @param {string} text */
export const normalizeWord = (text) => unmarkedWord(text).replace(/[\u0625\u0623\u0622\u0671\u0649\u0624\u0626\u0629]/g, (ch) => FOLDS[ch]);

/** Join only explicitly marked hemistich splits in the analysis copy. */
/** @param {string} text */
export function analysisWords(text) {
  const removed = new Set();
  for (const match of text.matchAll(/\u0640[\u064B-\u065F\u0670]*\s*#\s*/g)) {
    for (let i = match.index; i < match.index + match[0].length; i++) removed.add(i);
  }
  let analysis = '';
  /** @type {number[]} */
  const offsets = [];
  for (let i = 0; i < text.length; i++) {
    if (!removed.has(i)) { analysis += text[i]; offsets.push(i); }
  }
  /** @type {string[]} */
  const words = [];
  /** @type {string[]} */
  const originals = [];
  /** @type {[number, number][]} */
  const wordRanges = [];
  for (const match of analysis.matchAll(/[\u0621-\u063A\u0641-\u064A\u0671][\u0621-\u065F\u0670\u0671]*/g)) {
    const normalized = normalizeWord(match[0]);
    if (!normalized) continue;
    words.push(normalized);
    originals.push(match[0].replace(/\u0640/g, ''));
    wordRanges.push([offsets[match.index], offsets[match.index + match[0].length - 1] + 1]);
  }
  return { words, originals, wordRanges };
}
