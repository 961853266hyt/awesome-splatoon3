// Turns the built SPA into one static HTML document per locale.
//
// Runs after `vite build` (client) and `vite build --ssr` (server bundle):
//   dist/client/index.html     -> English, rendered
//   dist/client/zh/index.html  -> Chinese, rendered
//   dist/client/404.html       -> English "page not found"
//   dist/client/zh/404.html    -> Chinese "page not found"
//
// Crawlers and social scrapers get the full resource list in the initial HTML
// instead of an empty <div id="root">, and each locale carries its own title,
// description, canonical and <html lang>.

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { headFor, localePath, localeTag, locales, notFoundHeadFor } from './seo.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const clientDir = path.join(root, 'dist/client');

const { render, renderNotFound } = await import(path.join(root, 'dist/server/entry-server.js'));

// The English page is written back over dist/client/index.html, which is also
// where the template comes from -- so the untouched template is kept aside,
// letting this script be re-run without a fresh `vite build` in between.
const templateCopy = path.join(root, 'dist/template.html');
let template = await readFile(path.join(clientDir, 'index.html'), 'utf8');

if (template.includes('<!--app-html-->')) {
  await writeFile(templateCopy, template);
} else {
  template = await readFile(templateCopy, 'utf8').catch(() => {
    throw new Error(
      'dist/client/index.html has already been prerendered and no dist/template.html ' +
        'snapshot exists. Run `vite build` first.',
    );
  });
}

for (const marker of ['<!--seo-head-start-->', '<!--app-html-->']) {
  if (!template.includes(marker)) {
    throw new Error(`The prerender template is missing the ${marker} placeholder`);
  }
}

// The 404 pages ship without the client bundle: nothing on them needs
// hydrating, and the App bundle would try to hydrate them as the home page.
const staticTemplate = template
  .replace(/\s*<script type="module"[^>]*><\/script>/g, '')
  .replace(/\s*<link rel="modulepreload"[^>]*>/g, '');

if (staticTemplate.includes('<script')) {
  throw new Error('Could not strip the client bundle from the 404 template');
}

function fill(source, locale, head, appHtml) {
  // Function replacements, so a "$" in the content is never read as a pattern.
  return source
    .replace(/<html lang="[^"]*"/, `<html lang="${localeTag[locale]}"`)
    .replace(
      /<!--seo-head-start-->[\s\S]*?<!--seo-head-end-->/,
      () => `<!--seo-head-start-->${head}<!--seo-head-end-->`,
    )
    .replace('<!--app-html-->', () => appHtml);
}

async function write(locale, fileName, html) {
  // "/" -> dist/client/<fileName>, "/zh/" -> dist/client/zh/<fileName>
  const outFile = path.join(clientDir, localePath[locale].replace(/^\//, ''), fileName);

  await mkdir(path.dirname(outFile), { recursive: true });
  await writeFile(outFile, html);

  const relative = path.relative(root, outFile);
  console.log(`Prerendered ${relative} (${(html.length / 1024).toFixed(1)} kB)`);
}

for (const locale of locales) {
  await write(locale, 'index.html', fill(template, locale, await headFor(locale), render(locale)));

  // wrangler.jsonc serves the nearest 404.html with a 404 status, so anything
  // under /zh/ that does not exist gets the Chinese page.
  await write(
    locale,
    '404.html',
    fill(staticTemplate, locale, await notFoundHeadFor(locale), renderNotFound(locale)),
  );
}
