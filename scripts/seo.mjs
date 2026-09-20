// Builds the locale-dependent part of <head>: title, description, canonical,
// hreflang alternates and social cards.
//
// Used from three places, which is why it lives in plain .mjs rather than in
// src/: the Vite plugin that fills index.html during dev and the client build,
// and scripts/prerender.mjs when it writes one HTML file per locale.

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { SITE_URL } from '../site.config.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Keep in sync with src/i18n/routing.ts. */
export const locales = ['en', 'zhCN'];

export const localePath = {
  en: '/',
  zhCN: '/zh/',
};

export const localeTag = {
  en: 'en',
  zhCN: 'zh-CN',
};

const ogLocale = {
  en: 'en_US',
  zhCN: 'zh_CN',
};

const messageFiles = {
  en: 'src/i18n/en.json',
  zhCN: 'src/i18n/zh-CN.json',
};

/** Absolute URL for a locale's home page. */
export function localeUrl(locale) {
  return `${SITE_URL}${localePath[locale]}`;
}

async function readMessages(locale) {
  const raw = await readFile(path.join(root, messageFiles[locale]), 'utf8');
  return JSON.parse(raw).messages;
}

function escapeAttribute(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * hreflang annotations. Every locale lists every locale (including itself);
 * Google ignores one-sided annotations.
 */
function alternates() {
  const links = locales.map(
    (locale) =>
      `    <link rel="alternate" hreflang="${localeTag[locale]}" href="${localeUrl(locale)}" />`,
  );

  links.push(`    <link rel="alternate" hreflang="x-default" href="${localeUrl('en')}" />`);

  return links.join('\n');
}

/** The full locale-dependent <head> block for one locale. */
export async function headFor(locale) {
  const messages = await readMessages(locale);
  const title = escapeAttribute(messages.metaTitle);
  const description = escapeAttribute(messages.metaDescription);
  const url = localeUrl(locale);

  return `<title>${title}</title>
    <meta name="description" content="${description}" />

    <link rel="canonical" href="${url}" />
${alternates()}

    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Awesome Splatoon3" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:locale" content="${ogLocale[locale]}" />
${locales
  .filter((other) => other !== locale)
  .map((other) => `    <meta property="og:locale:alternate" content="${ogLocale[other]}" />`)
  .join('\n')}

    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />`;
}
