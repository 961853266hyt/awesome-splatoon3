import { Card } from 'animal-island-ui';
import type { Locale } from '../data/resources.generated';
import { copy } from '../i18n';
import { localePath } from '../i18n/routing';

export interface NotFoundProps {
  locale: Locale;
}

/**
 * Body of the per-locale 404.html. It is prerendered without the client
 * bundle, so it stays plain markup: links only, nothing that needs hydrating.
 */
export function NotFound({ locale }: NotFoundProps) {
  const dictionary = copy[locale];
  const home = localePath[locale];

  return (
    <div className="app-shell">
      <header className="site-header">
        <nav className="topbar" aria-label="Primary navigation">
          <a className="brand" href={home}>
            Awesome Splatoon3
          </a>
        </nav>
      </header>

      <main className="content not-found">
        <Card className="not-found-card">
          <h1>{dictionary.notFoundHeading}</h1>
          <p>{dictionary.notFoundLead}</p>
          <a className="button-link" href={home}>
            {dictionary.notFoundHome}
          </a>
        </Card>
      </main>
    </div>
  );
}
