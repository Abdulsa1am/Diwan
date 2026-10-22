// Site sections, in the old site's order. A section without `href` is not built yet:
// it shows dimmed and unlinked. Add `href` when its page exists.
export type SectionKey =
  | 'home'
  | 'library'
  | 'indexes'
  | 'themes'
  | 'saved'
  | 'search'
  | 'lexicon'
  | 'atlas'
  | 'about';

export interface NavItem {
  key: SectionKey;
  label: string;
  icon: string;
  href?: string;
}

export const sections: Record<SectionKey, NavItem> = {
  home: { key: 'home', label: 'الرئيسية', icon: 'i-home', href: '/' },
  library: { key: 'library', label: 'الديوان', icon: 'i-book', href: '/diwan/' },
  indexes: { key: 'indexes', label: 'الفهارس', icon: 'i-orbit' },
  themes: { key: 'themes', label: 'أغراض الشعر', icon: 'i-network' },
  saved: { key: 'saved', label: 'محفوظاتي', icon: 'i-bookmark' },
  search: { key: 'search', label: 'ابحث', icon: 'i-search' },
  lexicon: { key: 'lexicon', label: 'معجم الألفاظ', icon: 'i-search' },
  atlas: { key: 'atlas', label: 'أطلس المواضع', icon: 'i-map' },
  about: { key: 'about', label: 'عن الشريف الرضي', icon: 'i-user' },
};

export const mainMenu = [sections.home, sections.library, sections.indexes, sections.themes, sections.saved];
export const toolsMenu = [sections.lexicon, sections.atlas, sections.about];
export const mobileMenu = [sections.home, sections.library, sections.indexes, sections.search, sections.saved];
