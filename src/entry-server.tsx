// Build-time entry: scripts/prerender.mjs imports this to turn the app into
// static HTML, one document per locale. Never runs at request time.

import { renderToString } from 'react-dom/server';
import { App } from './App';
import { NotFound } from './components/NotFound';
import type { Locale } from './data/resources.generated';

export function render(locale: Locale): string {
  return renderToString(<App locale={locale} />);
}

/** Body of the 404.html written for each locale. */
export function renderNotFound(locale: Locale): string {
  return renderToString(<NotFound locale={locale} />);
}
