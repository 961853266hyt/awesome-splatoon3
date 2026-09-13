import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import { cloudflare } from "@cloudflare/vite-plugin";

import { SITE_URL } from './site.config.mjs';

// Replaces %SITE_URL% placeholders in index.html with the configured site URL.
const htmlSiteUrl = {
  name: 'html-site-url',
  transformIndexHtml(html: string) {
    return html.replaceAll('%SITE_URL%', SITE_URL);
  },
};

export default defineConfig(() => ({
  base: '/',
  plugins: [react(), cloudflare(), htmlSiteUrl],
  // Inlined at build time so the Worker redirect target always matches the
  // canonical URL baked into index.html / sitemap.xml.
  define: {
    __SITE_URL__: JSON.stringify(SITE_URL),
  },
}));
