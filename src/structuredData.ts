// schema.org JSON-LD for each locale's home page, inlined into <head> by
// scripts/prerender.mjs. Describes the site itself and the resource list on it.

import { resources, type Locale } from './data/resources.generated';
import { copy } from './i18n';
import { localePath, localeTag, locales } from './i18n/routing';

export function structuredData(locale: Locale): string {
  const dictionary = copy[locale];
  const siteUrl = `${__SITE_URL__}/`;
  const pageUrl = `${__SITE_URL__}${localePath[locale]}`;

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}#website`,
        url: siteUrl,
        // Matches the header brand and og:site_name; the spaced form is what
        // people type into search.
        name: 'Awesome Splatoon3',
        alternateName: 'Awesome Splatoon 3',
        inLanguage: locales.map((item) => localeTag[item]),
      },
      {
        '@type': 'CollectionPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: dictionary.metaTitle,
        description: dictionary.metaDescription,
        inLanguage: localeTag[locale],
        isPartOf: { '@id': `${siteUrl}#website` },
        about: { '@type': 'VideoGame', name: 'Splatoon 3' },
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: resources.length,
          itemListElement: resources.map((resource, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: resource.name[locale],
            url: resource.url,
          })),
        },
      },
    ],
  };

  // Escape "<" so no resource text can close the <script> element early.
  return JSON.stringify(graph).replace(/</g, '\\u003c');
}
