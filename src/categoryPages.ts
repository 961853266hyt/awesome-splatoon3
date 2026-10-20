// Copy for category landing pages. Categories with hand-written copy in the
// locale files use it; any other category that crosses the page threshold in
// scripts/generate-data.mjs gets a generic version built from its title.

import type { Category, Locale } from './data/resources.generated';
import { copy } from './i18n';
import { fill } from './i18n/format';

export interface CategoryPageCopy {
  /** <title> and og:title. */
  title: string;
  /** Meta and social description. */
  description: string;
  /** The page's <h1>. */
  heading: string;
  /** Lead paragraph under the heading. */
  intro: string;
  /** Questions people search for, answered from the resources on the page. */
  faq: readonly { question: string; answer: string }[];
}

export function categoryPageCopy(locale: Locale, category: Category): CategoryPageCopy {
  const dictionary = copy[locale];
  const written = (dictionary.categoryPages as Record<string, CategoryPageCopy | undefined>)[category.id];

  if (written) {
    return written;
  }

  const values = { category: category.title[locale] };

  return {
    title: fill(dictionary.categoryPageTitle, values),
    description: fill(dictionary.categoryPageDescription, values),
    heading: category.title[locale],
    intro: fill(dictionary.categoryPageIntro, values),
    faq: [],
  };
}
