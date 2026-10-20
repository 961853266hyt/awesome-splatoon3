// Tells IndexNow search engines (Bing, Yandex, Naver, Seznam, ...) that every
// page in sitemap.xml has changed, so they recrawl it now instead of whenever
// they next visit. Run after a deploy has gone live:
//   npm run indexnow
//
// IndexNow verifies ownership by fetching the key file below from the site,
// so it has to be deployed (it lives in public/) before this is run.

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { SITE_URL } from '../site.config.mjs';

const KEY = '2150d3af10313cdaf52c734b9e736271';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sitemap = await readFile(path.join(root, 'public/sitemap.xml'), 'utf8');
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);

const response = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({
    host: new URL(SITE_URL).host,
    key: KEY,
    keyLocation: `${SITE_URL}/${KEY}.txt`,
    urlList,
  }),
});

// 200 = accepted, 202 = accepted while the key is still being verified.
console.log(`IndexNow: ${response.status} ${response.statusText} for ${urlList.length} URLs`);

if (!response.ok) {
  console.error(await response.text());
  process.exitCode = 1;
}
