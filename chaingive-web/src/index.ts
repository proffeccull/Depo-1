// Cloudflare Worker entry point for Next.js static export
import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

export interface Env {
  __STATIC_CONTENT: KVNamespace;
  __STATIC_CONTENT_MANIFEST: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: any): Promise<Response> {
    try {
      // Handle static assets
      const page = await getAssetFromKV(
        {
          request,
          waitUntil: ctx.waitUntil.bind(ctx),
        },
        {
          ASSET_NAMESPACE: env.__STATIC_CONTENT,
          ASSET_MANIFEST: JSON.parse(env.__STATIC_CONTENT_MANIFEST),
          cacheControl: {
            browserTTL: 60 * 60 * 24 * 30, // 30 days
            edgeTTL: 60 * 60 * 24 * 30,
            bypassCache: false,
          },
        }
      );

      // Add security headers
      const response = new Response(page.body, page);
      response.headers.set('X-Frame-Options', 'DENY');
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

      return response;
    } catch (e) {
      // Fallback to index.html for SPA routing
      try {
        const notFoundResponse = await getAssetFromKV(
          {
            request: new Request(`${new URL(request.url).origin}/index.html`, request),
            waitUntil: ctx.waitUntil.bind(ctx),
          },
          {
            ASSET_NAMESPACE: env.__STATIC_CONTENT,
            ASSET_MANIFEST: JSON.parse(env.__STATIC_CONTENT_MANIFEST),
          }
        );

        return new Response(notFoundResponse.body, {
          ...notFoundResponse,
          status: 200,
          headers: {
            ...notFoundResponse.headers,
            'X-Frame-Options': 'DENY',
            'X-Content-Type-Options': 'nosniff',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
          },
        });
      } catch (e) {
        return new Response('Not Found', { status: 404 });
      }
    }
  },
};