// Poem page: reading progress, save, copy, share, verse menu, reading settings.
import { load, save, toast, copyText, shareOrCopy, SAVED_KEY, LAST_KEY, READING_KEY } from './shared';
import type { PoemRef } from './shared';

const reader = document.querySelector<HTMLElement>('.reader')!;
type Reading = { scale?: number; layout?: string; notes?: boolean };
let settings = load<Reading>(READING_KEY, {}) ?? {};
// This module is deferred; restore annotations as its first DOM update. CSS hides
// them before it runs, so the default reader never sees a flash of annotations.
reader.classList.toggle('show-annotations', settings.notes === true);
const { poem: id, title, first, citation } = reader.dataset as Record<string, string>;
const verses = [...document.querySelectorAll<HTMLLIElement>('.verse')];
const total = verses.length;
const root = document.documentElement;
const digits = new Intl.NumberFormat('ar-EG', { useGrouping: false });

const verseText = (li: HTMLElement) =>
  [...li.querySelectorAll('.hemistich')].map((h) => h.textContent!.trim()).join('    ');
const pageUrl = () => location.origin + location.pathname;

/* ---------- One fitted size for the whole poem ---------- */
const sheet = document.getElementById('poemSheet')!;
const hemistichs = [...sheet.querySelectorAll<HTMLElement>('.hemistich')];
const firstBody = sheet.querySelector<HTMLElement>('.verse-body')!;
const paired = hemistichs.map((h) => !h.closest('.verse.single'));
const MEASURE_SIZE = 30;
let naturalWidths: number[] | undefined;
let fitFrame = 0;

function measureHemistichs() {
  // Keep the actual Amiri shaping/features and Astro-scoped styles. Insert all
  // probes together, read their natural widths together, then remove them. There
  // is one layout pass, not a write/read loop over hundreds of hemistichs.
  const probes = hemistichs.map((h) => {
    const probe = h.cloneNode(true) as HTMLElement;
    probe.classList.remove('can-wrap');
    probe.style.cssText = `display:block;width:max-content;max-width:none;font-size:${MEASURE_SIZE}px;white-space:nowrap;text-wrap:nowrap`;
    return probe;
  });
  const measure = document.createElement('div');
  measure.setAttribute('aria-hidden', 'true');
  measure.style.cssText = 'position:fixed;inset:0 auto auto 0;width:0;height:0;visibility:hidden;pointer-events:none;contain:strict';
  measure.append(...probes);
  sheet.append(measure);
  naturalWidths = probes.map((probe) => probe.getBoundingClientRect().width / MEASURE_SIZE);
  measure.remove();
}

function fitPoem() {
  if (!naturalWidths) measureHemistichs();
  const widths = naturalWidths!;
  const style = getComputedStyle(sheet);
  const designSize = parseFloat(style.fontSize);
  // Respect an explicitly smaller reading size: the floor must not exceed its cap.
  const floor = Math.min(designSize, parseFloat(style.getPropertyValue('--verse-floor')));
  const fullWidth = firstBody.getBoundingClientRect().width;
  if (fullWidth <= 0) return;
  const gap = parseFloat(style.getPropertyValue('--verse-gap'));
  let side = style.getPropertyValue('--verse-columns').trim() === '2';
  let pairWidth = side ? Math.max(0, (fullWidth - gap) / 2) : fullWidth;
  // A small inset leaves room for subpixel rounding and glyph overhangs.
  const fitSize = () => Math.min(designSize, ...widths.map((width, i) =>
    width > 0 ? Math.max(0, (paired[i] ? pairWidth : fullWidth) - 2) / width : designSize,
  ));
  let size = fitSize();
  if (side && size < floor) {
    side = false;
    pairWidth = fullWidth;
    size = fitSize();
  }
  size = Math.max(floor, size);
  // All geometry reads are above; these writes never trigger another width read.
  sheet.dataset.fittedLayout = side ? 'side' : 'stacked';
  sheet.style.setProperty('--poem-fitted-size', `${size}px`);
  hemistichs.forEach((h, i) => {
    h.classList.toggle('can-wrap', !side && widths[i] * size > fullWidth - 2);
  });
  sheet.classList.add('is-fitted');
}

function scheduleFit() {
  if (fitFrame) return;
  fitFrame = requestAnimationFrame(() => {
    fitFrame = 0;
    fitPoem();
  });
}

// Annotation visibility and fitting change height. Only width changes require a
// refit, so observing the sheet cannot feed back into a resize/fit loop.
let observedWidth = -1;
new ResizeObserver(([entry]) => {
  if (entry.contentRect.width === observedWidth) return;
  observedWidth = entry.contentRect.width;
  scheduleFit();
}).observe(sheet);
window.addEventListener('resize', scheduleFit, { passive: true });
function fontsChanged() {
  naturalWidths = undefined;
  scheduleFit();
}
// The first fit runs as soon as the fonts are ready, not on the next animation frame:
// it settles the layout sooner and still works where frames are paused (hidden tabs).
document.fonts.ready.then(() => {
  naturalWidths = undefined;
  fitPoem();
});
document.fonts.addEventListener('loadingdone', fontsChanged);
// TEMPORARY font lab: invalidate measured widths and refit after a font choice changes.
window.addEventListener('radi:fontchange', fontsChanged);

/* ---------- Reading progress and "continue reading" ---------- */
const head = document.getElementById('readerHead')!;
const pos = document.querySelector<HTMLElement>('[data-reading-pos]');
const bar = document.getElementById('readingProgress');
let current = 1;

new IntersectionObserver(([entry]) => root.classList.toggle('is-reading', !entry.isIntersecting), {
  rootMargin: '-60px 0px 0px 0px',
}).observe(head);

const visible = new Set<number>();
const verseObserver = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      const n = Number((e.target as HTMLElement).dataset.n);
      if (e.isIntersecting) visible.add(n);
      else visible.delete(n);
    }
    if (!visible.size) return;
    current = Math.min(...visible);
    if (pos) pos.textContent = `البيت ${digits.format(current)} من ${digits.format(total)}`;
    if (bar) bar.style.width = `${(current / total) * 100}%`;
    rememberPlace();
  },
  { rootMargin: '-35% 0px -55% 0px' },
);
verses.forEach((v) => verseObserver.observe(v));

let placeTimer: number | undefined;
function rememberPlace() {
  window.clearTimeout(placeTimer);
  placeTimer = window.setTimeout(() => {
    const last: PoemRef = { id, title, first, verse: current, total, t: Date.now() };
    save(LAST_KEY, last);
  }, 600);
}
rememberPlace();

/* ---------- Save ---------- */
const saveBtn = document.querySelector<HTMLButtonElement>('[data-action="save"]')!;
const saveLabel = saveBtn.querySelector('[data-save-label]')!;
const isSaved = () => load<PoemRef[]>(SAVED_KEY, []).some((p) => p.id === id);
function paintSave() {
  const on = isSaved();
  saveBtn.setAttribute('aria-pressed', String(on));
  saveLabel.textContent = on ? 'محفوظة' : 'احفظ';
}
paintSave();
saveBtn.addEventListener('click', () => {
  const list = load<PoemRef[]>(SAVED_KEY, []);
  if (isSaved()) {
    save(SAVED_KEY, list.filter((p) => p.id !== id));
    toast('أُزيلت القصيدة من محفوظاتي');
  } else {
    save(SAVED_KEY, [{ id, title, first, t: Date.now() }, ...list]);
    toast('حُفظت القصيدة في محفوظاتي');
  }
  paintSave();
});

/* ---------- Copy and share the poem ---------- */
document.querySelector('[data-action="copy-poem"]')!.addEventListener('click', () => {
  const text = [title, '', ...verses.map(verseText), '', citation, pageUrl()].join('\n');
  copyText(text, 'نُسخت القصيدة');
});
document.querySelector('[data-action="share"]')!.addEventListener('click', () => {
  shareOrCopy({ title: `${title} | الشريف الرضي`, text: first, url: pageUrl() });
});

/* ---------- Reading settings ---------- */
const settingsBtn = document.querySelector<HTMLButtonElement>('[data-action="settings"]')!;
const panel = document.getElementById('readerSettings')!;
const sizeOut = panel.querySelector('[data-size-value]')!;
const notesBtn = document.querySelector<HTMLButtonElement>('[data-action="notes"]');
const SCALES = [0.85, 0.92, 1, 1.1, 1.2, 1.32];

function applySettings() {
  const scale = settings.scale ?? 1;
  root.style.setProperty('--poem-scale', String(scale));
  sizeOut.textContent = `${digits.format(Math.round(scale * 100))}٪`;
  const layout = settings.layout ?? 'auto';
  if (layout === 'auto') delete root.dataset.verseLayout;
  else root.dataset.verseLayout = layout;
  panel.querySelectorAll<HTMLButtonElement>('[data-layout]').forEach((b) =>
    b.setAttribute('aria-checked', String(b.dataset.layout === layout)),
  );
  reader.classList.toggle('show-annotations', settings.notes === true);
  notesBtn?.setAttribute('aria-pressed', String(settings.notes === true));
  save(READING_KEY, settings);
  scheduleFit();
}
applySettings();

notesBtn?.addEventListener('click', () => {
  settings = { ...settings, notes: !settings.notes };
  // Switching all annotations off also clears any individually revealed verses.
  if (!settings.notes) verses.forEach((v) => v.classList.remove('annotations-revealed'));
  applySettings();
});

settingsBtn.addEventListener('click', () => {
  panel.hidden = !panel.hidden;
  settingsBtn.setAttribute('aria-expanded', String(!panel.hidden));
});
panel.addEventListener('click', (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('button');
  if (!btn) return;
  if (btn.dataset.size) {
    const i = SCALES.indexOf(settings.scale ?? 1);
    const next = SCALES[Math.min(SCALES.length - 1, Math.max(0, (i < 0 ? 2 : i) + Number(btn.dataset.size)))];
    settings = { ...settings, scale: next };
  } else if (btn.dataset.layout) {
    settings = { ...settings, layout: btn.dataset.layout };
  }
  applySettings();
});

/* ---------- Verse menu ---------- */
const menu = document.getElementById('verseMenu')!;
const menuTitle = menu.querySelector('[data-menu-title]')!;
const verseNotesBtn = menu.querySelector<HTMLButtonElement>('[data-verse-action="notes"]')!;
let menuVerse: HTMLLIElement | null = null;
let menuOpener: HTMLElement | null = null;

function closeMenu() {
  if (menu.hidden) return;
  menu.hidden = true;
  menuVerse?.classList.remove('is-active');
  menuOpener?.focus();
  menuVerse = menuOpener = null;
}

function openMenu(opener: HTMLElement) {
  menuVerse = opener.closest('.verse');
  menuOpener = opener;
  if (!menuVerse) return;
  menuVerse.classList.add('is-active');
  menuTitle.textContent = `البيت ${opener.textContent!.trim()}`;
  verseNotesBtn.hidden = !menuVerse.hasAttribute('data-annotated');
  menu.hidden = false;
  // Place the menu just under the verse number, kept inside the screen.
  const r = opener.getBoundingClientRect();
  const width = menu.offsetWidth;
  const right = Math.min(Math.max(8, window.innerWidth - r.right), window.innerWidth - width - 8);
  menu.style.top = `${r.bottom + window.scrollY + 6}px`;
  menu.style.right = `${right}px`;
  menu.querySelector<HTMLButtonElement>('button:not([hidden])')!.focus();
}

reader.addEventListener('click', (e) => {
  const opener = (e.target as HTMLElement).closest<HTMLElement>('.verse-no');
  if (!opener) return;
  e.preventDefault();
  if (!menu.hidden && menuOpener === opener) closeMenu();
  else {
    closeMenu();
    openMenu(opener);
  }
});

menu.addEventListener('click', (e) => {
  const action = (e.target as HTMLElement).closest<HTMLElement>('[data-verse-action]')?.dataset.verseAction;
  if (!action || !menuVerse) return;
  const n = menuVerse.dataset.n!;
  const text = verseText(menuVerse);
  const link = `${pageUrl()}#v${n}`;
  if (action === 'notes') {
    menuVerse.classList.add('annotations-revealed');
    const notes = menuVerse.querySelector<HTMLDetailsElement>('.verse-notes');
    if (notes) notes.open = true;
  }
  if (action === 'copy') copyText(text, 'نُسخ البيت');
  if (action === 'cite') copyText(`${text}\n${citation}، البيت ${digits.format(Number(n))}`, 'نُسخ البيت مع الإحالة');
  if (action === 'link') {
    history.replaceState(null, '', `#v${n}`);
    copyText(link, 'نُسخ رابط البيت');
  }
  if (action === 'share') shareOrCopy({ title: `${title} | الشريف الرضي`, text, url: link });
  closeMenu();
});

document.addEventListener('click', (e) => {
  const t = e.target as HTMLElement;
  if (!menu.hidden && !menu.contains(t) && !t.closest('.verse-no')) closeMenu();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeMenu();
    if (!panel.hidden) {
      panel.hidden = true;
      settingsBtn.setAttribute('aria-expanded', 'false');
      settingsBtn.focus();
    }
  }
  // Arrow keys move between menu items.
  if (!menu.hidden && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
    e.preventDefault();
    const items = [...menu.querySelectorAll<HTMLButtonElement>('button:not([hidden])')];
    const i = items.indexOf(document.activeElement as HTMLButtonElement);
    items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length].focus();
  }
});
