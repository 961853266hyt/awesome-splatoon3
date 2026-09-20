// Cloudflare Worker entry.
//
// The site was originally served from awesome-splatoon3.961853266.workers.dev.
// After moving to the custom domain, every request that still arrives on the
// old *.workers.dev hostname is permanently redirected (301) to the same path
// on the site URL so existing links and search-engine index entries carry over.
// Requests on the custom domain fall through to the static assets.

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.hostname.endsWith('.workers.dev')) {
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

    return env.ASSETS.fetch(request);
  },
};
