import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import 'animal-island-ui/style';
import './styles.css';
import { App } from './App';
import { localeFromPathname } from './i18n/routing';

const container = document.getElementById('root') as HTMLElement;
const app = (
  <React.StrictMode>
    <App locale={localeFromPathname(window.location.pathname)} />
  </React.StrictMode>
);

// Production HTML is prerendered per locale, so the usual path is a hydrate.
// `vite dev` serves the bare template, whose root holds only the <!--app-html-->
// placeholder comment -- no element child means there is nothing to hydrate
// against, so fall back to a plain client render there.
if (container.firstElementChild) {
  hydrateRoot(container, app);
} else {
  createRoot(container).render(app);
}
