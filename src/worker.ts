// Cloudflare Worker entry.
//
// The site was originally served from awesome-splatoon3.961853266.workers.dev.
// After moving to the custom domain, every request that still arrives on the
// old *.workers.dev hostname is permanently redirected (301) to the same path
// on the site URL so existing links and search-engine index entries carry over.
// Plain-HTTP requests on the custom domain are upgraded the same way.
// Everything else falls through to the static assets.

import { pagePaths } from './i18n/routing';

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.hostname.endsWith('.workers.dev')) {
      return Response.redirect(`${__SITE_URL__}${url.pathname}${url.search}`, 301);
    }

    // Plain HTTP on the custom domain would otherwise serve the whole site
    // under a second, insecure URL. Only the site's own host is redirected so
    // `wrangler dev` on http://localhost keeps working.
    if (url.protocol === 'http:' && url.hostname === new URL(__SITE_URL__).hostname) {
      return Response.redirect(`${__SITE_URL__}${url.pathname}${url.search}`, 301);
    }

    // Locales used to be selected with "?lang=zh-CN" on a single URL. They now
    // live at their own paths, so old links and indexed entries are forwarded
    // to the matching path with the rest of the query string intact.
    const legacyLocale = url.searchParams.get('lang');

    if (legacyLocale !== null) {
      url.searchParams.delete('lang');

      const pathname = legacyLocale.toLowerCase().startsWith('zh') ? '/zh/' : '/';
      const search = url.searchParams.toString();

      return Response.redirect(`${url.origin}${pathname}${search ? `?${search}` : ''}`, 301);
    }

    // A page path without its trailing slash ("/zh", "/tools") would otherwise
    // get the asset layer's temporary (307) redirect; make it permanent so
    // search engines settle on the slashed URL.
    if (!url.pathname.endsWith('/') && pagePaths.includes(`${url.pathname}/`)) {
      return Response.redirect(`${url.origin}${url.pathname}/${url.search}`, 301);
    }

    return env.ASSETS.fetch(request);
  },
};
