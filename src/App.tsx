import { useEffect, useMemo, useRef, useState } from 'react';
import Fuse from 'fuse.js';
import { Button, Card, Form, Input, Modal, Select, Tabs, Wallet } from 'animal-island-ui';
import { FaSearch } from 'react-icons/fa';
import { categories, resources, type Locale } from './data/resources.generated';
import { Footer } from 'animal-island-ui';
import { FallingLeaves } from './components/FallingLeaves';
import { Hero } from './components/Hero';

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
    contributeTitle: 'Contribute a resource',
    fieldName: 'Resource name',
    fieldNamePlaceholder: 'e.g. Splatoon 3 Official Site',
    fieldNameRequired: 'Please enter the resource name.',
    fieldUrl: 'URL',
    fieldUrlPlaceholder: 'https://example.com',
    fieldUrlRequired: 'Please enter the resource URL.',
    fieldUrlInvalid: 'Please enter a valid URL.',
    fieldDescription: 'Description',
    fieldDescriptionPlaceholder: 'A short description of the resource.',
    fieldDescriptionRequired: 'Please enter a description.',
    submit: 'Submit on GitHub',
    cancel: 'Cancel',
    source: 'GitHub',
    unofficial: 'Splatoon 3 is owned by Nintendo. This is an unofficial community-maintained resource list.',
    attribution: 'UI components powered by animal-island-ui.',
    heroBadge: 'Unofficial · community-maintained',
    heroHeadline: 'Your island of Splatoon 3 resources.',
    heroLead:
      'Official links, wikis, tools, assets and apps, hand-picked by the community and searchable in one place.',
    heroBrowse: 'Browse resources',
    heroStatResources: 'Resources',
    heroStatCategories: 'Categories',
    heroStatLanguages: 'Languages',
    heroExploreTitle: 'Explore by category',
    heroExploreHint: 'Pick a category to jump straight to it.',
    heroIslandTime: 'Island time',
  },
  zhCN: {
    title: 'Awesome Splatoon3',
    searchLabel: '搜索资源',
    searchPlaceholder: '搜索资源…',
    all: '全部',
    resources: '个资源',
    noResults: '没有找到匹配资源。',
    clear: '清空搜索',
    contribute: '贡献',
    contributeTitle: '贡献资源',
    fieldName: '资源名称',
    fieldNamePlaceholder: '例如：Splatoon 3 官方网站',
    fieldNameRequired: '请输入资源名称。',
    fieldUrl: '链接',
    fieldUrlPlaceholder: 'https://example.com',
    fieldUrlRequired: '请输入资源链接。',
    fieldUrlInvalid: '请输入有效的链接。',
    fieldDescription: '描述',
    fieldDescriptionPlaceholder: '简要描述这个资源。',
    fieldDescriptionRequired: '请输入描述。',
    submit: '提交到 GitHub',
    cancel: '取消',
    source: 'GitHub',
    unofficial: '斯普拉遁 3 归任天堂所有。本项目是一个非官方的社区维护资源列表。',
    attribution: 'UI 组件基于 animal-island-ui。',
    heroBadge: '非官方 · 社区共同维护',
    heroHeadline: '斯普拉遁 3 玩家的资源小岛',
    heroLead: '官方链接、Wiki、工具、素材和应用，由社区精选整理，在这里一搜即达。',
    heroBrowse: '浏览资源',
    heroStatResources: '个资源',
    heroStatCategories: '个分类',
    heroStatLanguages: '种语言',
    heroExploreTitle: '按分类探索',
    heroExploreHint: '选一个分类，直接跳到对应资源。',
    heroIslandTime: '岛屿时间',
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

const GITHUB_REPO = '961853266hyt/awesome-splatoon3';

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
  const [stars, setStars] = useState<number | undefined>(undefined);
  const [contributeOpen, setContributeOpen] = useState(false);
  const [contributeForm] = Form.useForm();
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

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const resource of resources) {
      counts.set(resource.categoryId, (counts.get(resource.categoryId) ?? 0) + 1);
    }
    return counts;
  }, []);

  const scrollToResources = () => {
    document.getElementById('resources')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const jumpToCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    scrollToResources();
  };

  const closeContribute = () => {
    setContributeOpen(false);
    contributeForm.resetFields();
  };

  const handleContributeFinish = (values: { name: string; url: string; description: string }) => {
    const title = `[Resource] ${values.name}`;
    const body = [
      '### Resource name',
      values.name,
      '',
      '### URL',
      values.url,
      '',
      '### Description',
      values.description,
      '',
      '---',
      '_Submitted via the Awesome Splatoon3 contribution form._',
    ].join('\n');

    const issueUrl = `https://github.com/${GITHUB_REPO}/issues/new?title=${encodeURIComponent(
      title,
    )}&body=${encodeURIComponent(body)}`;

    window.open(issueUrl, '_blank', 'noopener,noreferrer');
    closeContribute();
  };

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

  useEffect(() => {
    let cancelled = false;

    fetch(`https://api.github.com/repos/${GITHUB_REPO}`)
      .then((response) => (response.ok ? response.json() : Promise.reject(response.status)))
      .then((data) => {
        if (!cancelled && typeof data?.stargazers_count === 'number') {
          setStars(data.stargazers_count);
        }
      })
      .catch(() => {
        /* keep placeholder balance on failure */
      });

    return () => {
      cancelled = true;
    };
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
      <FallingLeaves />
      <header className="site-header">
        <nav className="topbar" aria-label="Primary navigation">
          <div className="topbar-brand">
            <a className="brand" href="./" aria-label="Awesome Splatoon3 home">
              Awesome Splatoon3
            </a>
            <Button
              className="contribute-button"
              type="primary"
              size="small"
              htmlType="button"
              onClick={() => setContributeOpen(true)}
            >
              {dictionary.contribute}
            </Button>
          </div>
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
              className="button-link button-link--wallet"
              href={`https://github.com/${GITHUB_REPO}`}
              aria-label={`${dictionary.source}${stars !== undefined ? ` · ${stars} stars` : ''}`}
              title={dictionary.source}
              target="_blank"
              rel="noreferrer"
            >
              <Wallet value={stars} size="medium" />
            </a>
          </div>
        </nav>
      </header>

      <Hero
        locale={locale}
        copy={{
          badge: dictionary.heroBadge,
          headline: dictionary.heroHeadline,
          lead: dictionary.heroLead,
          browse: dictionary.heroBrowse,
          contribute: dictionary.contribute,
          source: dictionary.source,
          statResources: dictionary.heroStatResources,
          statCategories: dictionary.heroStatCategories,
          statLanguages: dictionary.heroStatLanguages,
          exploreTitle: dictionary.heroExploreTitle,
          exploreHint: dictionary.heroExploreHint,
          islandTime: dictionary.heroIslandTime,
        }}
        categories={categories}
        counts={categoryCounts}
        totalResources={resources.length}
        githubUrl={`https://github.com/${GITHUB_REPO}`}
        onBrowse={scrollToResources}
        onContribute={() => setContributeOpen(true)}
        onSelectCategory={jumpToCategory}
      />

      <main className="content" id="resources">
        <Tabs
          className="category-tabs"
          aria-label="Categories"
          activeKey={selectedCategory}
          onChange={setSelectedCategory}
          items={tabItems}
        />
      </main>

      <Footer seamless />

      <Modal
        open={contributeOpen}
        title={dictionary.contributeTitle}
        typewriter={false}
        width={520}
        onClose={closeContribute}
        footer={
          <div className="contribute-actions">
            <Button htmlType="button" onClick={closeContribute}>
              {dictionary.cancel}
            </Button>
            <Button type="primary" htmlType="button" onClick={() => contributeForm.submit()}>
              {dictionary.submit}
            </Button>
          </div>
        }
      >
        <Form
          className="contribute-form"
          form={contributeForm}
          layout="vertical"
          initialValues={{ name: '', url: '', description: '' }}
          onFinish={(values) =>
            handleContributeFinish(values as { name: string; url: string; description: string })
          }
        >
          <Form.Item
            name="name"
            label={dictionary.fieldName}
            rules={[{ required: true, whitespace: true, message: dictionary.fieldNameRequired }]}
          >
            <Input placeholder={dictionary.fieldNamePlaceholder} />
          </Form.Item>
          <Form.Item
            name="url"
            label={dictionary.fieldUrl}
            rules={[
              { required: true, whitespace: true, message: dictionary.fieldUrlRequired },
              { type: 'url', message: dictionary.fieldUrlInvalid },
            ]}
          >
            <Input placeholder={dictionary.fieldUrlPlaceholder} />
          </Form.Item>
          <Form.Item
            name="description"
            label={dictionary.fieldDescription}
            rules={[{ required: true, whitespace: true, message: dictionary.fieldDescriptionRequired }]}
          >
            <textarea
              className="contribute-textarea"
              rows={4}
              placeholder={dictionary.fieldDescriptionPlaceholder}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
