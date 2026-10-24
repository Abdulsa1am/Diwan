// Poem page: reading progress, save, copy, share, verse menu, reading settings.
import { load, save, toast, copyText, shareOrCopy, SAVED_KEY, LAST_KEY, READING_KEY, READING_SCALES } from './shared';
import type { PoemRef, ReadingSettings } from './shared';

const reader = document.querySelector<HTMLElement>('.reader')!;
let settings = load<ReadingSettings>(READING_KEY, {});
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
  const scale = settings.scale ?? 1;
  // Fit the default once, then scale that result. Explicit enlargement must not
  // disappear into a wider fitting cap; stacking/wrapping makes room instead.
  const designSize = parseFloat(style.fontSize) / scale;
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
  size *= scale;
  if (side && widths.some((width, i) => width * size > (paired[i] ? pairWidth : fullWidth) - 1.5)) {
    side = false;
  }
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
let placeFailureReported = false;
function rememberPlace() {
  window.clearTimeout(placeTimer);
  placeTimer = window.setTimeout(() => {
    const last: PoemRef = { id, title, first, verse: current, total, t: Date.now() };
    if (!save(LAST_KEY, last) && !placeFailureReported) {
      toast('تعذّر حفظ موضع القراءة على هذا الجهاز');
      placeFailureReported = true;
    }
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
  const removing = list.some((p) => p.id === id);
  const next = removing ? list.filter((p) => p.id !== id) : [{ id, title, first, t: Date.now() }, ...list];
  const persisted = save(SAVED_KEY, next);
  toast(persisted ? (removing ? 'أُزيلت القصيدة من محفوظاتي' : 'حُفظت القصيدة في محفوظاتي')
    : 'تعذّر تحديث محفوظاتك على هذا الجهاز، حاول مجددًا');
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
const SCALES = READING_SCALES;

function applySettings(persist = false) {
  const scale = settings.scale ?? 1;
  root.style.setProperty('--poem-scale', String(scale));
  sizeOut.textContent = `${digits.format(Math.round(scale * 100))}٪`;
  const layout = settings.layout ?? 'auto';
  if (layout === 'auto') delete root.dataset.verseLayout;
  else root.dataset.verseLayout = layout;
  panel.querySelectorAll<HTMLButtonElement>('[data-layout]').forEach((b) => {
    const checked = b.dataset.layout === layout;
    b.setAttribute('aria-checked', String(checked));
    b.tabIndex = checked ? 0 : -1;
  });
  reader.classList.toggle('show-annotations', settings.notes === true);
  notesBtn?.setAttribute('aria-pressed', String(settings.notes === true));
  if (persist && !save(READING_KEY, settings)) toast('تغيّرت صفة القراءة لهذه الزيارة فقط؛ تعذّر حفظها على هذا الجهاز');
  scheduleFit();
}
applySettings();

notesBtn?.addEventListener('click', () => {
  settings = { ...settings, notes: !settings.notes };
  // Switching all annotations off also clears any individually revealed verses.
  if (!settings.notes) verses.forEach((v) => v.classList.remove('annotations-revealed'));
  applySettings(true);
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
    settings = { ...settings, layout: btn.dataset.layout as ReadingSettings['layout'] };
  }
  applySettings(true);
});

panel.querySelector('[role="radiogroup"]')!.addEventListener('keydown', (event) => {
  const e = event as KeyboardEvent;
  const items = [...panel.querySelectorAll<HTMLButtonElement>('[data-layout]')];
  const i = items.indexOf(document.activeElement as HTMLButtonElement);
  if (i < 0 || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) return;
  e.preventDefault();
  // Visual order is RTL: left advances to the next option.
  const next = e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1
    : (i + (e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
  items[next].click();
  items[next].focus();
});

const residualNotes = document.querySelector<HTMLDetailsElement>('#residualNotes');
function openResidualNotes() {
  if (location.hash === '#residualNotes' && residualNotes) residualNotes.open = true;
}
openResidualNotes();
window.addEventListener('hashchange', openResidualNotes);
document.querySelector('[href="#residualNotes"]')?.addEventListener('click', () => {
  if (!residualNotes) return;
  residualNotes.open = true;
  residualNotes.querySelector('summary')?.focus({ preventScroll: true });
});

/* ---------- Verse menu ---------- */
const menu = document.getElementById('verseMenu')!;
const menuTitle = menu.querySelector('[data-menu-title]')!;
const verseNotesBtn = menu.querySelector<HTMLButtonElement>('[data-verse-action="notes"]')!;
let menuVerse: HTMLLIElement | null = null;
let menuOpener: HTMLElement | null = null;
let menuPoint: { x: number; y: number } | undefined;

const verseOpeners = verses.map((v) => v.querySelector<HTMLElement>('.verse-no')!);
verseOpeners.forEach((opener) => {
  opener.setAttribute('aria-controls', 'verseMenu');
  opener.setAttribute('aria-expanded', 'false');
});

function closeMenu(restoreFocus = true) {
  if (menu.hidden) return;
  menu.hidden = true;
  menuVerse?.classList.remove('is-active');
  menuOpener?.setAttribute('aria-expanded', 'false');
  if (restoreFocus) menuOpener?.focus();
  menuVerse = menuOpener = null;
  menuPoint = undefined;
}

function positionMenu() {
  if (menu.hidden || !menuOpener) return;
  const viewport = window.visualViewport;
  const left = (viewport?.offsetLeft ?? 0) + 8;
  const top = (viewport?.offsetTop ?? 0) + 8;
  const right = left + (viewport?.width ?? window.innerWidth) - 16;
  let bottom = top + (viewport?.height ?? window.innerHeight) - 16;
  const nav = document.querySelector<HTMLElement>('.mobile-nav');
  if (nav && nav.getClientRects().length) {
    const navRect = nav.getBoundingClientRect();
    if (navRect.top < bottom && navRect.bottom > top) bottom = navRect.top - 8;
  }
  menu.style.maxWidth = `${Math.max(0, right - left)}px`;
  menu.style.minWidth = `${Math.min(210, Math.max(0, right - left))}px`;
  menu.style.maxHeight = `${Math.max(0, bottom - top)}px`;
  const r = menuOpener.getBoundingClientRect();
  const x = menuPoint?.x ?? (r.left + r.right) / 2;
  const below = (menuPoint?.y ?? r.bottom) + 8;
  const above = (menuPoint?.y ?? r.top) - menu.offsetHeight - 8;
  const y = below + menu.offsetHeight <= bottom ? below : above;
  menu.style.left = `${Math.max(left, Math.min(x - menu.offsetWidth / 2, right - menu.offsetWidth))}px`;
  menu.style.top = `${Math.max(top, Math.min(y, bottom - menu.offsetHeight))}px`;
}

function openMenu(opener: HTMLElement, point?: { x: number; y: number }) {
  menuVerse = opener.closest('.verse');
  menuOpener = opener;
  if (!menuVerse) return;
  menuPoint = point;
  menuVerse.classList.add('is-active');
  opener.setAttribute('aria-expanded', 'true');
  menuTitle.textContent = `البيت ${digits.format(Number(menuVerse.dataset.n))}`;
  verseNotesBtn.hidden = !menuVerse.hasAttribute('data-annotated');
  menu.hidden = false;
  positionMenu();
  menu.querySelector<HTMLButtonElement>('button:not([hidden])')!.focus({ preventScroll: true });
}

// Observe gestures without cancelling native selection, scrolling or context menus.
// Delay a single click so a second/triple click can select words/lines normally.
const hasSelection = () => window.getSelection()?.isCollapsed === false;
const interactive = 'a, button, input, select, textarea, summary, details, label, [role="button"], [role="link"], [contenteditable]:not([contenteditable="false"]), [tabindex], .verse-notes, .verse-words';
const pointers = new Set<number>();
type VerseGesture = {
  pointer: number; verse: HTMLLIElement; x: number; y: number;
  started: number; invalid: boolean; ended: boolean; wasOpen: boolean;
};
let gesture: VerseGesture | undefined;
let tapTimer: number | undefined;
function cancelTap() {
  window.clearTimeout(tapTimer);
  tapTimer = undefined;
  if (gesture) gesture.invalid = true;
}
document.addEventListener('pointerdown', (e) => {
  cancelTap();
  pointers.add(e.pointerId);
  const target = e.target instanceof Element ? e.target : null;
  const verse = target?.closest<HTMLLIElement>('.verse');
  const control = target?.closest(interactive);
  if (pointers.size !== 1 || !e.isPrimary || e.button !== 0 || e.ctrlKey || e.metaKey || e.altKey || e.shiftKey
      || !verse || (control && !control.matches('.verse-no'))) return;
  gesture = {
    pointer: e.pointerId, verse, x: e.clientX, y: e.clientY,
    started: performance.now(), invalid: hasSelection(), ended: false,
    wasOpen: !menu.hidden && menuVerse === verse,
  };
}, { capture: true, passive: true });
document.addEventListener('pointermove', (e) => {
  if (gesture?.pointer === e.pointerId && Math.hypot(e.clientX - gesture.x, e.clientY - gesture.y) > 8) cancelTap();
}, { capture: true, passive: true });
document.addEventListener('pointerup', (e) => {
  pointers.delete(e.pointerId);
  if (gesture?.pointer !== e.pointerId) return;
  gesture.ended = true;
  if (performance.now() - gesture.started >= 450 || hasSelection()
      || Math.hypot(e.clientX - gesture.x, e.clientY - gesture.y) > 8) cancelTap();
}, { capture: true, passive: true });
document.addEventListener('pointercancel', (e) => {
  pointers.delete(e.pointerId);
  cancelTap();
}, { capture: true, passive: true });
document.addEventListener('contextmenu', cancelTap, { capture: true, passive: true });
document.addEventListener('selectionchange', () => {
  if (hasSelection()) cancelTap();
});
document.addEventListener('scroll', (e) => {
  cancelTap();
  if (!(e.target instanceof Node) || !menu.contains(e.target)) closeMenu(false);
}, { capture: true, passive: true });
window.addEventListener('blur', () => { pointers.clear(); cancelTap(); });
window.addEventListener('resize', positionMenu, { passive: true });
window.visualViewport?.addEventListener('resize', positionMenu, { passive: true });
window.visualViewport?.addEventListener('scroll', () => { cancelTap(); closeMenu(false); }, { passive: true });

function toggleVerseMenu(opener: HTMLElement, point?: { x: number; y: number }) {
  if (!menu.hidden && menuOpener === opener) closeMenu();
  else {
    closeMenu(false);
    openMenu(opener, point);
  }
}

reader.addEventListener('click', (e) => {
  if (e.button !== 0 || e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;
  const target = e.target instanceof Element ? e.target : null;
  const verse = target?.closest<HTMLLIElement>('.verse');
  const opener = verse?.querySelector<HTMLElement>('.verse-no');
  const control = target?.closest(interactive);
  if (!verse || !opener || (control && control !== opener)) return;
  if (target?.closest('.verse-no') && e.detail === 0) {
    e.preventDefault();
    e.stopPropagation();
    cancelTap();
    toggleVerseMenu(opener);
    return;
  }
  // Even rejected pointer clicks on the marker must not jump after a long hold.
  if (control === opener) e.preventDefault();
  const tap = gesture;
  if (e.detail !== 1 || !tap || tap.verse !== verse || !tap.ended || tap.invalid || hasSelection()) {
    cancelTap();
    return;
  }
  e.stopPropagation(); // The accepted row click is not an outside-menu click.
  const point = { x: e.clientX, y: e.clientY };
  tapTimer = window.setTimeout(() => {
    tapTimer = undefined;
    if (gesture !== tap || tap.invalid || hasSelection() || pointers.size) return;
    // Native pointer focus may already have closed this menu via focusout.
    if (tap.wasOpen) {
      closeMenu(false);
      opener.focus({ preventScroll: true });
    } else toggleVerseMenu(opener, point);
  }, 450);
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
  if (!menu.hidden && !menu.contains(t) && !t.closest('.verse-no')) closeMenu(false);
});
menu.addEventListener('focusout', (e) => {
  if (!menu.contains(e.relatedTarget as Node | null)) closeMenu(false);
});
menu.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    // Continue through the page from this verse; never restore the opener on Tab.
    const stops = [...document.querySelectorAll<HTMLElement>('a[href], button, input, select, textarea, summary, [tabindex]')]
      .filter((el) => el.tabIndex >= 0 && !el.matches(':disabled') && !menu.contains(el) && el.getClientRects().length > 0);
    const i = stops.indexOf(menuOpener!);
    const next = stops[i + (e.shiftKey ? -1 : 1)];
    if (next) {
      e.preventDefault();
      next.focus();
    }
    closeMenu(false);
    return;
  }
  if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'Home' && e.key !== 'End') return;
  e.preventDefault();
  const items = [...menu.querySelectorAll<HTMLButtonElement>('button:not([hidden])')];
  const i = items.indexOf(document.activeElement as HTMLButtonElement);
  const next = e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1
    : (i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
  items[next].focus();
});
document.addEventListener('keydown', (e) => {
  cancelTap();
  if (e.key === 'Escape') {
    if (!menu.hidden) {
      e.preventDefault();
      closeMenu();
      return;
    }
    if (!panel.hidden) {
      panel.hidden = true;
      settingsBtn.setAttribute('aria-expanded', 'false');
      settingsBtn.focus();
    }
  }
});
