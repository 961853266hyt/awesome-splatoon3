import { Button, Card, Icon, Time, Typewriter, type IconName } from 'animal-island-ui';
import { FaGithub } from 'react-icons/fa';
import wandIcon from 'animal-island-ui/items/item-001.png';
import fishIcon from 'animal-island-ui/items/item-150.png';
import type { Category, Locale } from '../data/resources.generated';
import './Hero.css';

export interface HeroCopy {
  headline: string;
  lead: string;
  /** Primary CTA label; `{count}` is replaced with the resource total. */
  browse: string;
  source: string;
  /** Social proof line; `{categories}` and `{stars}` are replaced. */
  proof: string;
  /** Fallback for the `{stars}` slot while the GitHub star count is unknown. */
  proofNoStars: string;
  /** Wording for the `{stars}` slot once the count is known; `{stars}` is replaced. */
  proofStars: string;
  exploreTitle: string;
  exploreHint: string;
  islandTime: string;
}

export interface HeroProps {
  locale: Locale;
  copy: HeroCopy;
  categories: readonly Category[];
  /** Resource count per category id. */
  counts: ReadonlyMap<string, number>;
  totalResources: number;
  stars?: number;
  githubUrl: string;
  onBrowse: () => void;
  onSelectCategory: (categoryId: string) => void;
}

const CATEGORY_ICONS: Record<string, IconName> = {
  official: 'icon-map',
  wiki: 'icon-critterpedia',
  tools: 'icon-diy',
  development: 'icon-design',
  assets: 'icon-camera',
  miscellaneous: 'icon-variant',
  apps: 'icon-shopping',
  bots: 'icon-chat',
};

const CATEGORY_COLORS = [
  'app-teal',
  'app-yellow',
  'app-pink',
  'app-blue',
  'app-orange',
  'app-green',
  'purple',
  'lime-green',
] as const;

function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

export function Hero({
  locale,
  copy,
  categories,
  counts,
  totalResources,
  stars,
  githubUrl,
  onBrowse,
  onSelectCategory,
}: HeroProps) {
  const proof = fill(copy.proof, {
    categories: categories.length,
    stars:
      stars === undefined
        ? copy.proofNoStars
        : fill(copy.proofStars, { stars: stars.toLocaleString() }),
  });

  return (
    <>
      {/* Above the fold: one headline, one subheadline, one primary CTA, one text link, one proof line. */}
      <section className="hero" aria-labelledby="hero-headline">
        <div className="hero-inner">
          <div className="hero-copy">
            <h1 id="hero-headline" className="hero-headline">
              {/* Invisible copy reserves the final height so the typewriter never reflows the page. */}
              <span className="hero-headline-ghost" aria-hidden="true">
                {copy.headline}
              </span>
              <span>
                <Typewriter speed={55} trigger={locale}>
                  {copy.headline}
                </Typewriter>
              </span>
            </h1>

            <p className="hero-lead">{copy.lead}</p>

            <div className="hero-actions">
              <Button type="primary" size="large" htmlType="button" onClick={onBrowse}>
                {fill(copy.browse, { count: totalResources })}
              </Button>
              <a className="hero-secondary" href={githubUrl} target="_blank" rel="noreferrer">
                <FaGithub size={16} aria-hidden="true" />
                {copy.source}
              </a>
            </div>

            <p className="hero-proof">{proof}</p>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <Card className="hero-passport" color="app-teal" pattern="app-teal">
              <span className="hero-passport-label">{copy.islandTime}</span>
              <Time type="game" />
            </Card>
            <span className="hero-item hero-item--wand">
              <Icon src={wandIcon} size={60} />
            </span>
            <span className="hero-item hero-item--fish">
              <Icon src={fishIcon} size={60} />
            </span>
          </div>
        </div>
      </section>

      {/* Second screen: category entry points. */}
      <section className="explore" aria-labelledby="explore-title">
        <div className="explore-heading">
          <h2 id="explore-title">{copy.exploreTitle}</h2>
          <p>{copy.exploreHint}</p>
        </div>

        <div className="explore-grid">
          {categories.map((category, index) => (
            <Card
              key={category.id}
              className="explore-card"
              color={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
              hoverable
              role="button"
              tabIndex={0}
              onClick={() => onSelectCategory(category.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSelectCategory(category.id);
                }
              }}
            >
              <Icon name={CATEGORY_ICONS[category.id] ?? 'icon-miles'} size={40} />
              <span className="explore-card-title">{category.title[locale]}</span>
              <span className="explore-card-count">{counts.get(category.id) ?? 0}</span>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
