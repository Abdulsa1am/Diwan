// Small helpers shared by page scripts: storage that never throws, a toast, copy and share.

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode or storage full: the feature just doesn't persist */
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
