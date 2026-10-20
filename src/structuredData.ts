// schema.org JSON-LD for each prerendered page, inlined into <head> by
// scripts/prerender.mjs. Describes the site, the page and the resources listed
// on it; category pages also carry a breadcrumb back to the home page.

import { categories, resources, type Locale } from './data/resources.generated';
import { categoryPageCopy } from './categoryPages';
import { copy } from './i18n';
import { categoryPath, localePath, localeTag, locales } from './i18n/routing';

/** JSON-LD for a locale's home page, or for one of its category pages. */
export function structuredData(locale: Locale, categoryId?: string): string {
  const dictionary = copy[locale];
  const siteUrl = `${__SITE_URL__}/`;
  const homeUrl = `${__SITE_URL__}${localePath[locale]}`;
  const category = categoryId === undefined ? undefined : categories.find((item) => item.id === categoryId);
  const pageCopy = category && categoryPageCopy(locale, category);
  const pageUrl = category ? `${__SITE_URL__}${categoryPath(locale, category.id)}` : homeUrl;
  const listed = category ? resources.filter((resource) => resource.categoryId === category.id) : resources;

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
        name: pageCopy?.title ?? dictionary.metaTitle,
        description: pageCopy?.description ?? dictionary.metaDescription,
        inLanguage: localeTag[locale],
        isPartOf: { '@id': `${siteUrl}#website` },
        about: { '@type': 'VideoGame', name: 'Splatoon 3' },
        ...(category && {
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: dictionary.breadcrumbHome, item: homeUrl },
              { '@type': 'ListItem', position: 2, name: category.title[locale], item: pageUrl },
            ],
          },
        }),
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: listed.length,
          itemListElement: listed.map((resource, index) => ({
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
