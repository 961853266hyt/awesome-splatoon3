// Locale <-> URL mapping, shared by the client entry, the SSR entry and the
// prerender script so all three agree on where a locale lives.

import { categoryPageIds, type Locale } from '../data/resources.generated';

/** Every locale the site is built for, in sitemap / hreflang order. */
export const locales: readonly Locale[] = ['en', 'zhCN'];

/**
 * URL prefix each locale is served from. English sits at the root so the bare
 * domain stays the x-default entry point; other locales get a path segment.
 *
 * Deliberately a path and not a "?lang=" parameter: Cloudflare's edge cache
 * keys ignore the query string, so every "?lang=" variant would share a single
 * cached HTML document once the pages are prerendered per locale.
 */
export const localePath: Record<Locale, string> = {
  en: '/',
  zhCN: '/zh/',
};

/** BCP-47 tags for <html lang> and hreflang annotations. */
export const localeTag: Record<Locale, string> = {
  en: 'en',
  zhCN: 'zh-CN',
};

/** Open Graph locale codes, which use underscores rather than hyphens. */
export const ogLocale: Record<Locale, string> = {
  en: 'en_US',
  zhCN: 'zh_CN',
};

/** The locale a given pathname is serving, defaulting to English at the root. */
export function localeFromPathname(pathname: string): Locale {
  return /^\/zh(\/|$)/.test(pathname) ? 'zhCN' : 'en';
}

/** Path of a category's landing page, e.g. "/tools/" or "/zh/tools/". */
export function categoryPath(locale: Locale, categoryId: string): string {
  return `${localePath[locale]}${categoryId}/`;
}

/** Every prerendered page path: each locale's home page and category pages. */
export const pagePaths: readonly string[] = locales.flatMap((locale) => [
  localePath[locale],
  ...categoryPageIds.map((id) => categoryPath(locale, id)),
]);

export interface Page {
  locale: Locale;
  /** Set on a category landing page, undefined on the home page. */
  categoryId?: string;
}

/** The page a pathname is serving. Unknown category segments fall back to home. */
export function pageFromPathname(pathname: string): Page {
  const locale = localeFromPathname(pathname);
  const match = /^([a-z0-9-]+)\/?$/.exec(pathname.slice(localePath[locale].length));
  const categoryId = match && categoryPageIds.includes(match[1]) ? match[1] : undefined;

  return { locale, categoryId };
}
