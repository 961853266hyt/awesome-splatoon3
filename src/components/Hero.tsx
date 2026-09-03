import { useEffect, useState } from 'react';
import { Button, Card, Divider, Icon, Tag, Time, Title, Typewriter, type IconName } from 'animal-island-ui';
import { FaGithub } from 'react-icons/fa';
import wandIcon from 'animal-island-ui/items/item-001.png';
import axeIcon from 'animal-island-ui/items/item-012.png';
import tulipIcon from 'animal-island-ui/items/item-077.png';
import fishIcon from 'animal-island-ui/items/item-150.png';
import type { Category, Locale } from '../data/resources.generated';
import './Hero.css';

export interface HeroCopy {
  badge: string;
  headline: string;
  lead: string;
  browse: string;
  contribute: string;
  source: string;
  statResources: string;
  statCategories: string;
  statLanguages: string;
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
  githubUrl: string;
  onBrowse: () => void;
  onContribute: () => void;
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

/** Tracks a CSS media query so component props (not just CSS) can respond to viewport size. */
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const update = () => setMatches(mediaQuery.matches);
    update();
    mediaQuery.addEventListener('change', update);
    return () => mediaQuery.removeEventListener('change', update);
  }, [query]);

  return matches;
}

const FLOATING_ITEMS = [
  { src: wandIcon, className: 'hero-item hero-item--wand' },
  { src: fishIcon, className: 'hero-item hero-item--fish' },
  { src: tulipIcon, className: 'hero-item hero-item--tulip' },
  { src: axeIcon, className: 'hero-item hero-item--axe' },
];

export function Hero({
  locale,
  copy,
  categories,
  counts,
  totalResources,
  githubUrl,
  onBrowse,
  onContribute,
  onSelectCategory,
}: HeroProps) {
  // The ribbon Title sizes to its text; the large variant overflows narrow phones.
  const isNarrow = useMediaQuery('(max-width: 640px)');
  const stats = [
    { value: totalResources, label: copy.statResources },
    { value: categories.length, label: copy.statCategories },
    { value: 2, label: copy.statLanguages },
  ];

  return (
    <section className="hero" aria-labelledby="hero-headline">
      <div className="hero-inner">
        <div className="hero-copy">
          <Tag variant="soft" color="app-yellow" size="medium">
            {copy.badge}
          </Tag>

          <div className="hero-ribbon">
            <Title size={isNarrow ? 'middle' : 'large'} color="app-teal">
              Awesome Splatoon3
            </Title>
          </div>

          <h1 id="hero-headline" className="hero-headline">
            <Typewriter speed={55} trigger={locale}>
              {copy.headline}
            </Typewriter>
          </h1>

          <p className="hero-lead">{copy.lead}</p>

          <div className="hero-actions">
            <Button type="primary" size="large" htmlType="button" onClick={onBrowse}>
              {copy.browse}
            </Button>
            <Button size="large" htmlType="button" onClick={onContribute}>
              {copy.contribute}
            </Button>
            <a className="hero-github" href={githubUrl} target="_blank" rel="noreferrer">
              <FaGithub size={18} aria-hidden="true" />
              {copy.source}
            </a>
          </div>

          <dl className="hero-stats">
            {stats.map((stat) => (
              <Card className="hero-stat" key={stat.label}>
                <dd>{stat.value}</dd>
                <dt>{stat.label}</dt>
              </Card>
            ))}
          </dl>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <Card className="hero-passport" color="app-teal" pattern="app-teal">
            <span className="hero-passport-label">{copy.islandTime}</span>
            <Time type="game" />
          </Card>
          {FLOATING_ITEMS.map((item) => (
            <span className={item.className} key={item.className}>
              <Icon src={item.src} size={64} />
            </span>
          ))}
        </div>
      </div>

      <div className="hero-explore">
        <div className="hero-explore-heading">
          <h2>{copy.exploreTitle}</h2>
          <p>{copy.exploreHint}</p>
        </div>

        <div className="hero-categories">
          {categories.map((category, index) => (
            <Card
              key={category.id}
              className="hero-category"
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
              <span className="hero-category-title">{category.title[locale]}</span>
              <span className="hero-category-count">{counts.get(category.id) ?? 0}</span>
            </Card>
          ))}
        </div>
      </div>

      <Divider type="wave-yellow" className="hero-divider" />
    </section>
  );
}
