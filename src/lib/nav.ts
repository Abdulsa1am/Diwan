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
  indexes: { key: 'indexes', label: 'الفهارس', icon: 'i-orbit', href: '/explore/' },
  themes: { key: 'themes', label: 'أغراض الشعر', icon: 'i-network', href: '/explore/themes/' },
  saved: { key: 'saved', label: 'محفوظاتي', icon: 'i-bookmark', href: '/saved/' },
  search: { key: 'search', label: 'ابحث', icon: 'i-search', href: '/search/' },
  lexicon: { key: 'lexicon', label: 'معجم الألفاظ', icon: 'i-search' },
  atlas: { key: 'atlas', label: 'أطلس المواضع', icon: 'i-map' },
  about: { key: 'about', label: 'عن الشريف الرضي', icon: 'i-user', href: '/about/' },
};

export const mainMenu = [sections.home, sections.library, sections.indexes, sections.themes, sections.saved];
export const toolsMenu = [sections.lexicon, sections.atlas, sections.about];
export const mobileMenu = [sections.home, sections.library, sections.indexes, sections.search, sections.saved];

/** Tool cards shown on /explore after the indexes. Add one when its page exists. */
export const exploreTools: { href: string; icon: string; title: string; text: string }[] = [];

/** Pages listed in sitemap.xml besides the poems. Add a page here when it is built. */
export const indexablePages = [
  '/',
  '/diwan/',
  '/search/',
  '/explore/',
  '/explore/meters/',
  '/explore/qafiya/',
  '/explore/matali/',
  '/explore/themes/',
  '/explore/entities/',
  '/explore/stats/',
  '/about/',
];
