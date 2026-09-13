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

    return env.ASSETS.fetch(request);
  },
};
