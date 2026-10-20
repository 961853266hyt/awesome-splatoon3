// Build-time entry: scripts/prerender.mjs imports this to turn the app into
// static HTML, one document per locale. Never runs at request time.

import { renderToString } from 'react-dom/server';
import { App } from './App';
import { NotFound } from './components/NotFound';
import { categories, type Locale } from './data/resources.generated';
import { categoryPageCopy } from './categoryPages';

export { categoryPageIds } from './data/resources.generated';
export { structuredData } from './structuredData';

/** A locale's home page, or one of its category landing pages. */
export function render(locale: Locale, categoryId?: string): string {
  return renderToString(<App locale={locale} categoryId={categoryId} />);
}

/** Head overrides for a category landing page (see headFor in scripts/seo.mjs). */
export function categoryHead(locale: Locale, categoryId: string) {
  const category = categories.find((item) => item.id === categoryId);

  if (!category) {
    throw new Error(`Unknown category page: ${categoryId}`);
  }

  const { title, description } = categoryPageCopy(locale, category);

  return { slug: `${categoryId}/`, title, description };
}

/** Body of the 404.html written for each locale. */
export function renderNotFound(locale: Locale): string {
  return renderToString(<NotFound locale={locale} />);
}
