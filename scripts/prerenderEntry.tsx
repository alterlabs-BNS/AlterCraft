// SSR entry used only by scripts/prerender.mjs. Kept out of the client bundle:
// it imports the route tree directly rather than the browser router, so nothing
// here touches window at module load.
import React, { Suspense } from 'react';
import { renderToPipeableStream } from 'react-dom/server';
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router';
import { Writable } from 'node:stream';
import { routes } from '../src/routes';
import { AuthProvider } from '../src/contexts/AuthContext';
import { getLocalProducts } from '../src/lib/localCatalogue';

// The product detail routes are dynamic, so postbuild's static list cannot know
// them. Without a page each they fall through to 404.html — the SPA still boots
// on GitHub Pages, but every product answers with a 404 status and stays out of
// the index.
// Title and description come from the product itself so the 64 pages do not all
// land on the shared default, which would hand the site 64 duplicate titles.
export function productRoutes(): Array<{ route: string; title: string; description: string }> {
  return getLocalProducts().map((product) => {
    const price =
      product.basePricePaise == null
        ? 'Made to order'
        : `From INR ${Math.round(product.basePricePaise / 100).toLocaleString('en-IN')}`;
    return {
      route: `/shop/p/${product.slug}`,
      title: `${product.name} — ${price} | AlterCraft`,
      description: `${product.name}: ${product.description} ${price}. Delivered and installed Pan-India by AlterCraft.`,
    };
  });
}

// renderToString cannot resolve React.lazy, and every route in this app is lazy,
// so it would emit the Suspense fallback instead of the page. The streaming
// renderer resolves them and onAllReady fires once the tree is complete.
export async function renderRoute(url: string): Promise<string> {
  const handler = createStaticHandler(routes);
  const context = await handler.query(new Request(`https://www.altercraft.in${url}`));

  if (context instanceof Response) {
    throw new Error(`route ${url} returned a Response (${context.status}), not a render context`);
  }

  const staticRouter = createStaticRouter(routes, context);

  return await new Promise<string>((resolve, reject) => {
    let html = '';
    const sink = new Writable({
      write(chunk, _enc, cb) {
        html += chunk.toString();
        cb();
      },
    });
    sink.on('finish', () => resolve(html));

    const { pipe, abort } = renderToPipeableStream(
      <AuthProvider>
        <Suspense fallback="">
          <StaticRouterProvider router={staticRouter} context={context} hydrate={false} />
        </Suspense>
      </AuthProvider>,
      {
        onAllReady() {
          pipe(sink);
        },
        onError(error) {
          reject(error);
        },
      },
    );

    setTimeout(() => {
      abort();
      reject(new Error(`render of ${url} timed out`));
    }, 20000);
  });
}
