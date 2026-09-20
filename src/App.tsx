import { useEffect, useMemo, useRef, useState } from 'react';
import Fuse from 'fuse.js';
import { Button, Card, Form, Input, Modal, Tabs, Wallet } from 'animal-island-ui';
import { FaSearch } from 'react-icons/fa';
import { categories, resources, type Locale } from './data/resources.generated';
import { Footer } from 'animal-island-ui';
import { FallingLeaves } from './components/FallingLeaves';
import { copy } from './i18n';
import { useMounted } from './useMounted';
import { localePath, localeTag, locales } from './i18n/routing';
import { Hero } from './components/Hero';

const GITHUB_REPO = '961853266hyt/awesome-splatoon3';

function getDomain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export interface AppProps {
  /** Locale this page is being rendered for, derived from the URL path. */
  locale: Locale;
}

export function App({ locale }: AppProps) {
  // Every piece of state below starts at its default rather than reading the
  // URL, so the first client render matches the prerendered HTML exactly.
  // Anything URL- or browser-dependent waits for `mounted`.
  const mounted = useMounted();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stars, setStars] = useState<number | undefined>(undefined);
  const [contributeOpen, setContributeOpen] = useState(false);
  const [contributeForm] = Form.useForm();
  const dictionary = copy[locale];
  const searchRef = useRef<HTMLDivElement>(null);
  const isMac = mounted && /Mac|iPhone|iPad|iPod/.test(navigator.platform);
  const otherLocale = locales.find((item) => item !== locale) ?? 'en';

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

  // Adopt the search/category from the URL once, after hydration has matched
  // the prerendered markup.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('category');

    if (category && categories.some((item) => item.id === category)) {
      setSelectedCategory(category);
    }

    const initialQuery = params.get('q');

    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, []);

  // Mirror search/category back into the URL so results stay shareable. The
  // locale is no longer a parameter -- it is the path this page was served
  // from, so the pathname is preserved as-is.
  useEffect(() => {
    if (!mounted) {
      return;
    }

    const params = new URLSearchParams();

    if (query.trim()) {
      params.set('q', query.trim());
    }

    if (selectedCategory !== 'all') {
      params.set('category', selectedCategory);
    }

    const nextUrl = params.toString()
      ? `${window.location.pathname}?${params}`
      : window.location.pathname;
    window.history.replaceState(null, '', nextUrl);
  }, [mounted, query, selectedCategory]);

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
      {/* Leaf positions are random, so they would never match the prerendered
          markup -- mount them only after hydration. Purely decorative. */}
      {mounted && <FallingLeaves />}
      <header className="site-header">
        <nav className="topbar" aria-label="Primary navigation">
          <div className="topbar-brand">
            <a className="brand" href={localePath[locale]} aria-label="Awesome Splatoon3 home">
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
            {/* A real link, not a Select: this is how crawlers discover the
                other language version, and it keeps the locale in the URL. */}
            <a
              className="button-link language-link"
              href={localePath[otherLocale]}
              hrefLang={localeTag[otherLocale]}
              lang={localeTag[otherLocale]}
            >
              {dictionary.switchLocale}
            </a>
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
          headline: dictionary.heroHeadline,
          lead: dictionary.heroLead,
          browse: dictionary.heroBrowse,
          source: dictionary.heroSource,
          proof: dictionary.heroProof,
          proofNoStars: dictionary.heroProofNoStars,
          proofStars: dictionary.heroProofStars,
          exploreTitle: dictionary.heroExploreTitle,
          exploreHint: dictionary.heroExploreHint,
          islandTime: dictionary.heroIslandTime,
        }}
        categories={categories}
        counts={categoryCounts}
        totalResources={resources.length}
        stars={stars}
        githubUrl={`https://github.com/${GITHUB_REPO}`}
        onBrowse={scrollToResources}
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

      <section className="final-cta" aria-labelledby="final-cta-title">
        <Card className="final-cta-card" color="app-yellow">
          <div>
            <h2 id="final-cta-title">{dictionary.ctaTitle}</h2>
            <p>{dictionary.ctaLead}</p>
          </div>
          <Button type="primary" size="large" htmlType="button" onClick={() => setContributeOpen(true)}>
            {dictionary.contribute}
          </Button>
        </Card>
      </section>

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
