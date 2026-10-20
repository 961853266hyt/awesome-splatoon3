import { Card } from 'animal-island-ui';
import { categoryPageIds, type Category, type Locale } from '../data/resources.generated';
import type { CategoryPageCopy } from '../categoryPages';
import { copy } from '../i18n';
import { fill } from '../i18n/format';
import { categoryPath, localePath } from '../i18n/routing';
import './CategoryPage.css';

export interface CategoryIntroProps {
  locale: Locale;
  category: Category;
  pageCopy: CategoryPageCopy;
}

/** Top of a category landing page: breadcrumb, the page's h1 and a lead paragraph. */
export function CategoryIntro({ locale, category, pageCopy }: CategoryIntroProps) {
  const dictionary = copy[locale];

  return (
    <section className="category-section category-intro" aria-labelledby="category-heading">
      <Card className="category-card">
        <nav aria-label={dictionary.breadcrumbLabel}>
          <ol className="breadcrumb">
            <li>
              <a href={localePath[locale]}>{dictionary.breadcrumbHome}</a>
            </li>
            <li aria-current="page">{category.title[locale]}</li>
          </ol>
        </nav>
        <h1 id="category-heading">{pageCopy.heading}</h1>
        <p className="category-intro-lead">{pageCopy.intro}</p>
      </Card>
    </section>
  );
}

export interface FaqProps {
  locale: Locale;
  items: CategoryPageCopy['faq'];
}

/**
 * Short Q&A answering the questions people search for, on the home page and
 * on category pages.
 */
export function Faq({ locale, items }: FaqProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="category-section category-faq" aria-labelledby="category-faq-title">
      <Card className="category-card">
        <h2 id="category-faq-title">{copy[locale].faqTitle}</h2>
        {items.map((item) => (
          <div className="category-faq-item" key={item.question}>
            <h3>{item.question}</h3>
            <p>{item.answer}</p>
          </div>
        ))}
      </Card>
    </section>
  );
}

export interface CategoryLinksProps {
  locale: Locale;
  categories: readonly Category[];
  currentId: string;
  totalResources: number;
}

/**
 * Links from a category page to every other category page and back to the
 * full list, so each landing page passes visitors and crawlers on.
 */
export function CategoryLinks({ locale, categories, currentId, totalResources }: CategoryLinksProps) {
  const dictionary = copy[locale];
  const others = categories.filter(
    (category) => category.id !== currentId && categoryPageIds.includes(category.id),
  );

  return (
    <section className="category-section category-links" aria-labelledby="category-links-title">
      <Card className="category-card">
        <h2 id="category-links-title">{dictionary.moreCategoriesTitle}</h2>
        <ul>
          {others.map((category) => (
            <li key={category.id}>
              <a className="button-link" href={categoryPath(locale, category.id)}>
                {category.title[locale]}
              </a>
            </li>
          ))}
          <li>
            <a className="button-link" href={localePath[locale]}>
              {fill(dictionary.allResourcesLink, { count: totalResources })}
            </a>
          </li>
        </ul>
      </Card>
    </section>
  );
}
