// Locale <-> URL mapping, shared by the client entry, the SSR entry and the
// prerender script so all three agree on where a locale lives.

import type { Locale } from '../data/resources.generated';

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
