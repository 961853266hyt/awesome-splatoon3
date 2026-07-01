// Single source of truth for the public site URL used in SEO metadata
// (canonical link, Open Graph, hreflang, robots.txt, sitemap.xml).
// Override at build time with the SITE_URL env var, e.g. in CI:
//   SITE_URL=https://example.com npm run build
// No trailing slash.
export const SITE_URL =
  process.env.SITE_URL ?? 'https://awesome-splatoon3.961853266.workers.dev';
