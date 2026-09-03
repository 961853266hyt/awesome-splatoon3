import type { Locale } from '../data/resources.generated';
import en from './en.json';
import zhCN from './zh-CN.json';

export type Messages = typeof en.messages;

// Every locale must define exactly the same message keys as English.
const locales: Record<Locale, { label: string; messages: Messages }> = { en, zhCN };

/** Human-readable language names, keyed by locale, for the language switcher. */
export const localeLabels: Record<Locale, string> = {
  en: locales.en.label,
  zhCN: locales.zhCN.label,
};

/** UI strings keyed by locale. */
export const copy: Record<Locale, Messages> = {
  en: locales.en.messages,
  zhCN: locales.zhCN.messages,
};
