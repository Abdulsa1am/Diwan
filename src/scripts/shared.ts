// Small helpers shared by page scripts: storage that never throws, a toast, copy and share.

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const value: unknown = JSON.parse(raw);
    // Validate known keys here so every caller (including the home resume card)
    // gets the same safe shape. Unknown keys retain the existing generic API.
    if (key === SAVED_KEY) {
      if (!Array.isArray(value)) return fallback;
      const seen = new Set<string>();
      return value.filter((item) => {
        if (!isPoemRef(item) || seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      }) as T;
    }
    if (key === LAST_KEY) return isPoemRef(value) ? value as T : fallback;
    if (key === READING_KEY) return readingSettings(value) as T;
    return value as T;
  } catch {
    return fallback;
  }
}

export function save(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

let toastTimer: number | undefined;
export function toast(message: string) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = message;
  el.hidden = false;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => (el.hidden = true), 2400);
}

export async function copyText(text: string, done: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Fallback for browsers without clipboard access.
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.append(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    if (!ok) return toast('تعذّر النسخ، انسخ النص يدويًا');
  }
  toast(done);
}

export async function shareOrCopy(data: { title: string; text: string; url: string }) {
  if (navigator.share) {
    try {
      await navigator.share(data);
      return;
    } catch (e) {
      if ((e as DOMException).name === 'AbortError') return;
    }
  }
  copyText(data.url, 'نُسخ الرابط');
}

/** A poem the reader saved or read recently. */
export interface PoemRef {
  id: string;
  title: string;
  first: string;
  /** Verse number, for "continue reading". */
  verse?: number;
  total?: number;
  t: number;
}

export const SAVED_KEY = 'radi-saved';
export const LAST_KEY = 'radi-last';
export const READING_KEY = 'radi-reading';

export const READING_SCALES = [0.85, 0.92, 1, 1.1, 1.2, 1.32];
export type ReadingSettings = { scale?: number; layout?: 'auto' | 'side' | 'stacked'; notes?: boolean };

function readingSettings(value: unknown): ReadingSettings {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const v = value as Record<string, unknown>;
  return {
    scale: typeof v.scale === 'number' && READING_SCALES.includes(v.scale) ? v.scale : 1,
    layout: v.layout === 'side' || v.layout === 'stacked' ? v.layout : 'auto',
    notes: v.notes === true,
  };
}

function isPoemRef(value: unknown): value is PoemRef {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const v = value as Record<string, unknown>;
  return typeof v.id === 'string' && /^r[12]-\d{3}$/.test(v.id)
    && typeof v.title === 'string' && typeof v.first === 'string'
    && typeof v.t === 'number' && Number.isFinite(v.t) && v.t >= 0
    && (v.verse === undefined || (Number.isSafeInteger(v.verse) && (v.verse as number) > 0))
    && (v.total === undefined || (Number.isSafeInteger(v.total) && (v.total as number) > 0))
    && (v.verse === undefined || v.total === undefined || (v.verse as number) <= (v.total as number));
}

const arDigits = new Intl.NumberFormat('ar-EG');
/**
 * Arabic count with the right noun form.
 * forms: [one, two, 3–10, 11+], e.g. ['نتيجة واحدة', 'نتيجتان', 'نتائج', 'نتيجة'].
 */
export function arCount(n: number, [one, two, few, many]: [string, string, string, string]) {
  if (n === 1) return one;
  if (n === 2) return two;
  const tail = n % 100;
  return `${arDigits.format(n)} ${tail >= 3 && tail <= 10 ? few : many}`;
}
