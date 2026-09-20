// Turns the built SPA into one static HTML document per locale.
//
// Runs after `vite build` (client) and `vite build --ssr` (server bundle):
//   dist/client/index.html     -> English, rendered
//   dist/client/zh/index.html  -> Chinese, rendered
//
// Crawlers and social scrapers get the full resource list in the initial HTML
// instead of an empty <div id="root">, and each locale carries its own title,
// description, canonical and <html lang>.

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { headFor, localePath, localeTag, locales } from './seo.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const clientDir = path.join(root, 'dist/client');

const { render } = await import(path.join(root, 'dist/server/entry-server.js'));

const template = await readFile(path.join(clientDir, 'index.html'), 'utf8');

for (const marker of ['<!--seo-head-start-->', '<!--app-html-->']) {
  if (!template.includes(marker)) {
    throw new Error(`dist/client/index.html is missing the ${marker} placeholder`);
  }
}

for (const locale of locales) {
  const appHtml = render(locale);

  const html = template
    .replace(/<html lang="[^"]*"/, `<html lang="${localeTag[locale]}"`)
    .replace(
      /<!--seo-head-start-->[\s\S]*?<!--seo-head-end-->/,
      `<!--seo-head-start-->${await headFor(locale)}<!--seo-head-end-->`,
    )
    .replace('<!--app-html-->', appHtml);

  // "/" -> dist/client/index.html, "/zh/" -> dist/client/zh/index.html
  const outFile = path.join(clientDir, localePath[locale].replace(/^\//, ''), 'index.html');

  await mkdir(path.dirname(outFile), { recursive: true });
  await writeFile(outFile, html);

  const relative = path.relative(root, outFile);
  console.log(`Prerendered ${localePath[locale]} -> ${relative} (${(html.length / 1024).toFixed(1)} kB)`);
}
