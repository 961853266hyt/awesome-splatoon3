import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import { cloudflare } from "@cloudflare/vite-plugin";
import type { Plugin as PostcssPlugin } from 'postcss';

import { SITE_URL } from './site.config.mjs';
import { headFor } from './scripts/seo.mjs';

// Fills the <!--seo-head--> slot in index.html with the English head, so dev
// and the client build both serve a valid document. scripts/prerender.mjs
// rewrites the same slot per locale afterwards.
const seoHead = {
  name: 'seo-head',
  async transformIndexHtml(html: string) {
    return html.replace(
      '<!--seo-head-start--><!--seo-head-end-->',
      `<!--seo-head-start-->${await headFor('en')}<!--seo-head-end-->`,
    );
  },
};

// animal-island-ui ships "Noto Sans SC" as one ~1.1 MB file per weight with no
// unicode-range, so any page with a single Chinese character pulls megabytes
// of font. Dropping those faces lets CJK text fall through the library's font
// stack to the system font (PingFang SC, Microsoft YaHei, ...); Latin text
// keeps Nunito.
//
// `Once`, not an `AtRule` visitor: Vite resolves (and emits) url() assets in
// its own `Once` pass, which runs before any visitor would get to the rule.
const dropCjkWebfont: PostcssPlugin = {
  postcssPlugin: 'drop-cjk-webfont',
  Once(root) {
    root.walkAtRules('font-face', (rule) => {
      const family = rule.nodes?.find((node) => node.type === 'decl' && node.prop === 'font-family');

      if (family?.type === 'decl' && /Noto Sans SC/i.test(family.value)) {
        rule.remove();
      }
    });
  },
};

export default defineConfig(({ isSsrBuild }) => ({
  base: '/',
  // The Cloudflare plugin builds the Worker bundle, which has nothing to do
  // with the prerender pass and errors out during an SSR build.
  plugins: [react(), ...(isSsrBuild ? [] : [cloudflare()]), seoHead],
  // animal-island-ui ships CSS imports that plain Node cannot load, so it has
  // to go through Vite's pipeline rather than being externalised.
  ssr: { noExternal: ['animal-island-ui'] },
  css: { postcss: { plugins: [dropCjkWebfont] } },
  // Inlined at build time so the Worker redirect target always matches the
  // canonical URL baked into index.html / sitemap.xml.
  define: {
    __SITE_URL__: JSON.stringify(SITE_URL),
  },
}));
