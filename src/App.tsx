import { useEffect, useMemo, useRef, useState } from 'react';
import Fuse from 'fuse.js';
import { Button, Card, Input, Select, Tabs } from 'animal-island-ui';
import { FaGithub, FaSearch } from 'react-icons/fa';
import { categories, resources, type Locale } from './data/resources.generated';
import { Footer } from 'animal-island-ui';

const localeLabels: Record<Locale, string> = {
  en: 'English',
  zhCN: '简体中文',
};

const copy = {
  en: {
    title: 'Awesome Splatoon3',
    searchLabel: 'Search resources',
    searchPlaceholder: 'Search resources…',
    all: 'All',
    resources: 'resources',
    noResults: 'No resources found.',
    clear: 'Clear search',
    contribute: 'Contribute',
    source: 'GitHub',
    unofficial: 'Splatoon 3 is owned by Nintendo. This is an unofficial community-maintained resource list.',
    attribution: 'UI components powered by animal-island-ui.',
  },
  zhCN: {
    title: 'Awesome Splatoon3',
    searchLabel: '搜索资源',
    searchPlaceholder: '搜索资源…',
    all: '全部',
    resources: '个资源',
    noResults: '没有找到匹配资源。',
    clear: '清空搜索',
    contribute: '贡献资源',
    source: 'GitHub',
    unofficial: '斯普拉遁 3 归任天堂所有。本项目是一个非官方的社区维护资源列表。',
    attribution: 'UI 组件基于 animal-island-ui。',
  },
} satisfies Record<Locale, Record<string, string>>;

function parseLocale(value: string | null): Locale | null {
  if (value === 'zh-CN' || value === 'zhCN') {
    return 'zhCN';
  }

  if (value === 'en') {
    return 'en';
  }

  return null;
}

function getInitialLocale(): Locale {
  const params = new URLSearchParams(window.location.search);
  const queryLocale = parseLocale(params.get('lang'));

  if (queryLocale) {
    return queryLocale;
  }

  const storedLocale = parseLocale(window.localStorage.getItem('awesome-splatoon3-locale'));

  if (storedLocale) {
    return storedLocale;
  }

  return window.navigator.language.toLowerCase().startsWith('zh') ? 'zhCN' : 'en';
}

function getInitialCategory() {
  const params = new URLSearchParams(window.location.search);
  const category = params.get('category');

  if (category && categories.some((item) => item.id === category)) {
    return category;
  }

  return 'all';
}

function getInitialQuery() {
  return new URLSearchParams(window.location.search).get('q') ?? '';
}

function getDomain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function App() {
  const [locale, setLocale] = useState<Locale>(getInitialLocale);
  const [query, setQuery] = useState(getInitialQuery);
  const [selectedCategory, setSelectedCategory] = useState(getInitialCategory);
  const dictionary = copy[locale];
  const searchRef = useRef<HTMLDivElement>(null);
  const isMac = useMemo(
    () => typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform),
    [],
  );

  const categoryMap = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [],
  );

  const fuse = useMemo(
    () =>
      new Fuse(resources, {
        keys: [
          'name.en',
          'name.zhCN',
          'description.en',
          'description.zhCN',
          'url',
          'categoryId',
        ],
        threshold: 0.32,
        ignoreLocation: true,
      }),
    [],
  );

  const filteredResources = useMemo(() => {
    const normalizedQuery = query.trim();
    const searchedResources = normalizedQuery
      ? fuse.search(normalizedQuery).map((result) => result.item)
      : resources;

    if (selectedCategory === 'all') {
      return searchedResources;
    }

    return searchedResources.filter((resource) => resource.categoryId === selectedCategory);
  }, [fuse, query, selectedCategory]);

  useEffect(() => {
    window.localStorage.setItem('awesome-splatoon3-locale', locale);

    const params = new URLSearchParams();

    if (locale !== 'en') {
      params.set('lang', 'zh-CN');
    }

    if (query.trim()) {
      params.set('q', query.trim());
    }

    if (selectedCategory !== 'all') {
      params.set('category', selectedCategory);
    }

    const nextUrl = params.toString() ? `${window.location.pathname}?${params}` : window.location.pathname;
    window.history.replaceState(null, '', nextUrl);
  }, [locale, query, selectedCategory]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchRef.current?.querySelector('input')?.focus();
      }
    };

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  const resultsContent = (
    <>
      <section className="result-summary" aria-live="polite">
        <strong>{filteredResources.length}</strong> {dictionary.resources}
      </section>

      {filteredResources.length > 0 ? (
        <section className="resource-grid" aria-label="Resources">
          {filteredResources.map((resource) => {
            const category = categoryMap.get(resource.categoryId);

            return (
              <Card className="resource-card" key={resource.id}>
                <span className="resource-category">{category?.title[locale] ?? resource.categoryId}</span>
                <h2>
                  <a href={resource.url}>{resource.name[locale]}</a>
                </h2>
                <p>{resource.description[locale]}</p>
                <a className="resource-domain" href={resource.url} aria-label={resource.name[locale]}>
                  {getDomain(resource.url)}
                </a>
              </Card>
            );
          })}
        </section>
      ) : (
        <Card className="empty-state">
          <p>{dictionary.noResults}</p>
          <Button type="primary" htmlType="button" onClick={() => setQuery('')}>
            {dictionary.clear}
          </Button>
        </Card>
      )}
    </>
  );

  const tabItems = [
    { key: 'all', label: dictionary.all },
    ...categories.map((category) => ({ key: category.id, label: category.title[locale] })),
  ].map((item) => ({
    ...item,
    // Tabs only renders the active panel's children, so attach results to it.
    children: item.key === selectedCategory ? resultsContent : null,
  }));

  return (
    <div className="app-shell">
      <header className="site-header">
        <nav className="topbar" aria-label="Primary navigation">
          <a className="brand" href="./" aria-label="Awesome Splatoon3 home">
            Awesome Splatoon3
          </a>
          <div className="topbar-actions">
            <div className="header-search" ref={searchRef}>
              <Input
                type="search"
                value={query}
                placeholder={dictionary.searchPlaceholder}
                aria-label={dictionary.searchLabel}
                prefix={<FaSearch size={14} aria-hidden="true" />}
                suffix={
                  query ? undefined : (
                    <kbd className="kbd-hint" aria-hidden="true">
                      {isMac ? '⌘' : 'Ctrl'} K
                    </kbd>
                  )
                }
                allowClear
                shadow
                onChange={(event) => setQuery(event.target.value)}
                onClear={() => setQuery('')}
              />
            </div>
            <div className="language-select" aria-label="Language">
              <Select
                value={locale}
                onChange={(value) => setLocale(value as Locale)}
                options={Object.entries(localeLabels).map(([key, label]) => ({ key, label }))}
              />
            </div>
            <a
              className="button-link button-link--icon"
              href="https://github.com/961853266hyt/awesome-splatoon3"
              aria-label={dictionary.source}
              title={dictionary.source}
              target="_blank"
              rel="noreferrer"
            >
              <FaGithub size={20} aria-hidden="true" />
            </a>
          </div>
        </nav>
      </header>

      <main className="content">
        <Tabs
          className="category-tabs"
          aria-label="Categories"
          activeKey={selectedCategory}
          onChange={setSelectedCategory}
          items={tabItems}
        />
      </main>

      <Footer seamless />
    </div>
  );
}
