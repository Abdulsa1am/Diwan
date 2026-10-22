// TEMPORARY font lab: shared catalogue (also used at build time) and lazy browser controller.
type Font = { name: string; arabic: string; weights: number[] };
const font = (name: string, arabic: string, weights = [400]): Font => ({ name, arabic, weights });
export const fontGroups = {
  poem: { label: 'خط الأبيات', variable: '--poem-font', fallback: 'serif', fonts: [
    font('Amiri', 'أميري'), font('Scheherazade New', 'شهرزاد الجديد'),
    font('Noto Naskh Arabic', 'نوتو نسخ عربي'), font('Lateef', 'لطيف'),
    font('Markazi Text', 'مركزي'), font('Amiri Quran', 'أميري قرآن'),
    font('Aref Ruqaa', 'عارف رقعة'), font('Gulzar', 'گلزار'),
  ] },
  display: { label: 'خط العناوين', variable: '--display-font', fallback: 'serif', fonts: [
    font('Katibeh', 'كتيبة'), font('Aref Ruqaa', 'عارف رقعة', [400, 700]),
    font('Reem Kufi', 'ريم كوفي', [400, 500, 600, 700]),
    font('El Messiri', 'المسيري', [400, 500, 600, 700]), font('Lalezar', 'لاله زار'),
    font('Marhey', 'مرحي', [400, 500, 600, 700]), font('Rakkas', 'رقّاص'),
    font('Noto Kufi Arabic', 'نوتو كوفي عربي', [400, 500, 600, 700]), font('Amiri', 'أميري', [400, 700]),
  ] },
  ui: { label: 'خط الواجهة', variable: '--ui-font', fallback: 'sans-serif', fonts: [
    font('Tajawal', 'تجوال', [400, 500, 700]), font('IBM Plex Sans Arabic', 'آي بي إم بلكس عربي', [400, 500, 700]),
    font('Noto Sans Arabic', 'نوتو سانس عربي', [400, 500, 700]), font('Cairo', 'القاهرة', [400, 500, 700]),
    font('Readex Pro', 'ريدكس برو', [400, 500, 700]), font('Almarai', 'المراعي', [400, 700]),
    font('Alexandria', 'الإسكندرية', [400, 500, 700]), font('Vazirmatn', 'وزيرمتن', [400, 500, 700]),
  ] },
};
type Role = keyof typeof fontGroups;
type Choice = Record<Role, string> & { weight: number };
const roles = Object.keys(fontGroups) as Role[];
const defaults: Choice = { poem: 'Amiri', display: 'Katibeh', ui: 'Tajawal', weight: 400 };
const key = 'radi-fontlab';
const sample = 'الشريف الرضي، سطر للمعاينة';

export function initFontLab() {
  const root = document.documentElement;
  const panel = document.querySelector<HTMLElement>('#fontLab')!;
  const status = panel.querySelector<HTMLElement>('[data-fontlab-status]')!;
  const weight = panel.querySelector<HTMLSelectElement>('[data-fontlab-weight]')!;
  const copy = panel.querySelector<HTMLButtonElement>('[data-fontlab-copy]')!;
  const openers = [...document.querySelectorAll<HTMLButtonElement>('[data-fontlab-open]')];
  const requests = new Map<string, Promise<void>>();
  let choice = { ...defaults }, pending = choice, revision = 0;
  let opener: HTMLElement | null = null;
  const getFont = (role: Role, name: string) => fontGroups[role].fonts.find((f) => f.name === name)!;
  const say = (message: string) => { status.textContent = message; };

  // Only a requested/previewed family and its required weights are fetched. Local faces stay local.
  async function loadFont(f: Font, weights: number[]) {
    const remote = weights.filter((w) => !(
      (f.name === 'Amiri' || f.name === 'Katibeh') && w === 400 ||
      f.name === 'Tajawal' && [400, 500, 700].includes(w)
    ));
    const requestKey = `${f.name}:${weights.join(';')}`;
    if (!requests.has(requestKey)) {
      const task = (async () => {
        if (remote.length) {
          const family = `${f.name}:wght@${remote.join(';')}`;
          let link = [...document.querySelectorAll<HTMLLinkElement>('link[data-fontlab-family]')]
            .find((l) => l.dataset.fontlabFamily === family);
          if (!link) {
            link = document.createElement('link');
            link.rel = 'stylesheet';
            link.dataset.fontlabFamily = family;
            link.href = `https://fonts.googleapis.com/css2?${new URLSearchParams({ family, display: 'swap' })}`;
          }
          const stylesheet = link;
          if (!stylesheet.sheet) await new Promise<void>((resolve, reject) => {
            const finish = (ok: boolean) => {
              clearTimeout(timer);
              stylesheet.removeEventListener('load', loaded);
              stylesheet.removeEventListener('error', failed);
              if (ok) resolve();
              else { stylesheet.remove(); reject(new Error('Font stylesheet unavailable')); }
            };
            const loaded = () => finish(true), failed = () => finish(false);
            const timer = window.setTimeout(failed, 15000);
            stylesheet.addEventListener('load', loaded);
            stylesheet.addEventListener('error', failed);
            if (!stylesheet.isConnected) document.head.append(stylesheet);
          });
        }
        await Promise.all(weights.map(async (w) => {
          const loaded = await document.fonts.load(`${w} 24px "${f.name}"`, sample);
          if (!loaded.length) throw new Error('Font face unavailable');
        }));
        panel.querySelectorAll<HTMLElement>('[data-fontlab-font]').forEach((option) => {
          if (option.dataset.fontlabFont === f.name) {
            option.style.fontFamily = `"${f.name}", ${fontGroups[option.dataset.fontlabRole as Role].fallback}`;
          }
        });
      })();
      requests.set(requestKey, task);
      task.catch(() => requests.delete(requestKey));
    }
    return requests.get(requestKey)!;
  }

  function paint(next: Choice) {
    for (const role of roles) {
      const selected = getFont(role, next[role]);
      panel.querySelector<HTMLElement>(`[data-fontlab-value="${role}"]`)!.textContent = `${selected.arabic} — ${selected.name}`;
      panel.querySelectorAll<HTMLElement>(`[data-fontlab-role="${role}"]`).forEach((option) => {
        option.setAttribute('aria-selected', String(option.dataset.fontlabFont === next[role]));
      });
    }
    weight.replaceChildren(...getFont('display', next.display).weights.map((w) => {
      const option = new Option(new Intl.NumberFormat('ar-EG', { useGrouping: false }).format(w), String(w));
      option.selected = w === next.weight;
      return option;
    }));
    weight.disabled = weight.options.length === 1;
  }

  function originalStyles() {
    roles.forEach((role) => root.style.removeProperty(fontGroups[role].variable));
    root.style.removeProperty('--fontlab-heading-weight');
    delete root.dataset.fontlabActive;
  }

  async function apply(next: Choice, persist = true) {
    const current = ++revision;
    pending = next;
    paint(next);
    copy.disabled = true;
    say('جارٍ تحميل الخط…');
    try {
      await Promise.all(roles.map((role) => loadFont(getFont(role, next[role]),
        role === 'display' ? [next.weight] : role === 'ui' ? getFont(role, next[role]).weights : [400])));
      if (current !== revision) return;
      choice = next;
      for (const role of roles) root.style.setProperty(fontGroups[role].variable, `"${next[role]}", ${fontGroups[role].fallback}`);
      root.style.setProperty('--fontlab-heading-weight', String(next.weight));
      root.dataset.fontlabActive = '';
      let stored = true;
      if (persist) try { localStorage.setItem(key, JSON.stringify(next)); } catch { stored = false; }
      // The reader must invalidate cached widths even when this face was already loaded.
      window.dispatchEvent(new Event('radi:fontchange'));
      say(stored ? 'طُبّق الاختيار.' : 'طُبّق الاختيار، وتعذّر حفظه على هذا الجهاز.');
    } catch {
      if (current !== revision) return;
      pending = choice;
      paint(choice);
      if (!persist) {
        originalStyles();
        await document.fonts.load('400 24px "Amiri"', sample).catch(() => []);
        if (current !== revision) return;
        window.dispatchEvent(new Event('radi:fontchange'));
      }
      say('تعذّر تحميل الخط. تحقّق من الاتصال ثم أعد المحاولة.');
    } finally {
      if (current === revision) copy.disabled = false;
    }
  }

  function closeLists() {
    panel.querySelectorAll<HTMLElement>('[role="listbox"]').forEach((list) => { list.hidden = true; });
    panel.querySelectorAll('[data-fontlab-select]').forEach((button) => button.setAttribute('aria-expanded', 'false'));
  }
  function close() {
    closeLists();
    panel.hidden = true;
    openers.forEach((button) => button.setAttribute('aria-expanded', 'false'));
    opener?.focus({ preventScroll: true });
  }
  const open = (button: HTMLElement) => {
    opener = button;
    panel.hidden = false;
    root.classList.remove('bars-hidden');
    openers.forEach((b) => b.setAttribute('aria-expanded', 'true'));
    panel.querySelector<HTMLButtonElement>('[data-fontlab-close]')!.focus({ preventScroll: true });
  };
  openers.forEach((button) => button.addEventListener('click', () => panel.hidden ? open(button) : close()));
  panel.querySelector('[data-fontlab-close]')!.addEventListener('click', close);
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || panel.hidden) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    close();
  }, true);
  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element) || !event.target.closest('[data-fontlab-picker]')) closeLists();
  });

  for (const role of roles) {
    const button = panel.querySelector<HTMLButtonElement>(`[data-fontlab-select="${role}"]`)!;
    const list = panel.querySelector<HTMLElement>(`#fontlab-${role}-options`)!;
    const options = [...list.querySelectorAll<HTMLButtonElement>('[role="option"]')];
    const focusOption = (index: number) => {
      options.forEach((o, i) => { o.tabIndex = i === index ? 0 : -1; });
      options[index].focus({ preventScroll: true });
      options[index].scrollIntoView({ block: 'nearest' });
    };
    const expand = () => {
      closeLists();
      list.hidden = false;
      button.setAttribute('aria-expanded', 'true');
      focusOption(Math.max(0, options.findIndex((o) => o.dataset.fontlabFont === pending[role])));
    };
    button.addEventListener('click', () => list.hidden ? expand() : closeLists());
    button.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); expand(); }
    });
    list.addEventListener('keydown', (event) => {
      const index = options.indexOf(document.activeElement as HTMLButtonElement);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 :
        event.key === 'ArrowDown' ? (index + 1) % options.length :
        event.key === 'ArrowUp' ? (index + options.length - 1) % options.length : -1;
      if (next >= 0) { event.preventDefault(); focusOption(next); }
      if (event.key === 'Tab') {
        event.preventDefault();
        closeLists();
        const nextRole = roles[roles.indexOf(role) + 1];
        const nextControl = nextRole ? panel.querySelector<HTMLButtonElement>(`[data-fontlab-select="${nextRole}"]`)! :
          weight.disabled ? copy : weight;
        (event.shiftKey ? button : nextControl).focus({ preventScroll: true });
      }
    });
    for (const option of options) {
      const selected = getFont(role, option.dataset.fontlabFont!);
      const preview = async () => {
        try {
          await loadFont(selected, [400]);
          option.style.fontFamily = `"${selected.name}", ${fontGroups[role].fallback}`;
          option.title = '';
        } catch { option.title = 'تعذّرت معاينة الخط؛ أعد المحاولة.'; }
      };
      option.addEventListener('pointerenter', preview);
      option.addEventListener('focus', preview);
      option.addEventListener('click', () => {
        closeLists();
        button.focus({ preventScroll: true });
        void apply({ ...pending, [role]: selected.name, ...(role === 'display' ? { weight: 400 } : {}) });
      });
    }
  }
  weight.addEventListener('change', () => { void apply({ ...pending, weight: Number(weight.value) }); });
  panel.querySelector('[data-fontlab-reset]')!.addEventListener('click', async () => {
    const current = ++revision;
    choice = pending = { ...defaults };
    originalStyles();
    paint(choice);
    closeLists();
    copy.disabled = false;
    let stored = true;
    try { localStorage.removeItem(key); } catch { stored = false; }
    await document.fonts.load('400 24px "Amiri"', sample).catch(() => []);
    if (current !== revision) return;
    window.dispatchEvent(new Event('radi:fontchange'));
    say(stored ? 'أُعيدت الخطوط الأصلية.' : 'أُعيدت الخطوط، وتعذّر مسح الاختيار المحفوظ.');
  });
  copy.addEventListener('click', async () => {
    const text = `الأبيات: ${choice.poem} | العناوين: ${choice.display} ${choice.weight} | الواجهة: ${choice.ui}`;
    try { await navigator.clipboard.writeText(text); say('نُسخ الاختيار.'); }
    catch { say(`تعذّر النسخ؛ يمكنك نسخ هذا النص: ${text}`); }
  });

  paint(choice);
  try {
    const saved = JSON.parse(localStorage.getItem(key) || 'null');
    if (saved && roles.every((role) => getFont(role, saved[role]))) {
      const weight = getFont('display', saved.display).weights.includes(saved.weight) ? saved.weight : 400;
      void apply({ poem: saved.poem, display: saved.display, ui: saved.ui, weight }, false);
    }
  } catch { /* Storage is optional. */ }
  return { open };
}
