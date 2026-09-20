// Type declaration for scripts/seo.mjs (a plain ESM JS module shared between
// the Vite config and the Node build scripts).

export type Locale = 'en' | 'zhCN';

export const locales: Locale[];
export const localePath: Record<Locale, string>;
export const localeTag: Record<Locale, string>;
export function localeUrl(locale: Locale): string;
export function headFor(locale: Locale): Promise<string>;
