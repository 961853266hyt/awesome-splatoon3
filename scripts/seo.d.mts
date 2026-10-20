// Type declaration for scripts/seo.mjs (a plain ESM JS module shared between
// the Vite config and the Node build scripts).

export type Locale = 'en' | 'zhCN';

export const locales: Locale[];
export const localePath: Record<Locale, string>;
export const localeTag: Record<Locale, string>;
export function localeUrl(locale: Locale, slug?: string): string;

export interface PageHead {
  /** "" for the home page, "<category>/" for a category landing page. */
  slug?: string;
  title?: string;
  description?: string;
}

export function headFor(locale: Locale, page?: PageHead): Promise<string>;
export function notFoundHeadFor(locale: Locale): Promise<string>;
