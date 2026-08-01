// Fills the SPA fallback pages with real HTML.
//
// Every route except '/' shipped an empty <div id="root"></div>, so the crawlable
// HTML for ~100 pages carried metadata but no headline, body copy or address.
// This renders each public route in Node and writes the result inside that div.
// main.tsx uses createRoot (not hydrateRoot), so React discards this markup on
// mount — there is no hydration contract to mismatch. It exists for crawlers,
// answer engines and the first paint.
//
// Runs after postbuild, so '/' has already been replaced by the flip homepage
// and is skipped here.
import { build } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { applySeoMetadata } from './seoMetadata.mjs';

const escapeHtml = (value) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const root = process.cwd();
const outDir = resolve(root, 'build');
const ssrDir = resolve(root, 'tmp/ssr');

// Private or per-user routes: what a signed-out crawler would see is either an
// empty shell or a redirect, and neither belongs in the indexable HTML.
const SKIP = [
  /^\/account/,
  /^\/admin/,
  /^\/operator-desk/,
  /^\/contractor-admin/,
  /^\/my-projects/,
];

const collectRoutes = () => {
  const found = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        if (entry === 'assets' || entry === 'blog' || entry === 'images' || entry === 'downloads') continue;
        walk(full);
      } else if (entry === 'index.html') {
        const rel = relative(outDir, full).split(sep).slice(0, -1).join('/');
        if (rel) found.push({ route: `/${rel}`, file: full });
      }
    }
  };
  walk(outDir);
  return found.filter(({ route }) => !SKIP.some((re) => re.test(route)));
};

await build({
  root,
  logLevel: 'error',
  plugins: [react()],
  build: {
    ssr: resolve(root, 'scripts/prerenderEntry.tsx'),
    outDir: ssrDir,
    emptyOutDir: true,
    rollupOptions: { output: { entryFileNames: 'entry.mjs' } },
  },
});

const { renderRoute, productRoutes } = await import(pathToFileURL(resolve(ssrDir, 'entry.mjs')).href);

const EMPTY_ROOT = '<div id="root"></div>';

// Product pages have no entry in postbuild's static list, so create the shell
// here, then fill it below like any other page. The template is a normal route
// shell rather than 404.html — that one carries noindex and a canonical pointing
// at '/', which would have quietly de-indexed all 64 products.
const shellTemplate = readFileSync(join(outDir, 'shop', 'index.html'), 'utf8');
const setMeta = (html, pattern, replacement) =>
  pattern.test(html) ? html.replace(pattern, replacement) : html;

let createdProductPages = 0;
for (const { route, title, description } of productRoutes()) {
  const file = join(outDir, ...route.replace(/^\/+/, '').split('/'), 'index.html');
  if (existsSync(file)) continue;
  let shell = applySeoMetadata(shellTemplate, route);
  const t = escapeHtml(title);
  const d = escapeHtml(description);
  shell = setMeta(shell, /<title>[\s\S]*?<\/title>/i, `<title>${t}</title>`);
  shell = setMeta(shell, /<meta\s+name=["']description["'][\s\S]*?>/i, `<meta name="description" content="${d}" />`);
  shell = setMeta(shell, /<meta\s+property=["']og:title["'][\s\S]*?>/i, `<meta property="og:title" content="${t}" />`);
  shell = setMeta(shell, /<meta\s+property=["']og:description["'][\s\S]*?>/i, `<meta property="og:description" content="${d}" />`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, shell);
  createdProductPages += 1;
}
if (createdProductPages) console.log(`Created ${createdProductPages} product detail pages.`);

const targets = collectRoutes();
console.log(`Prerendering ${targets.length} routes...`);
let filled = 0;
const failures = [];

for (const { route, file } of targets) {
  try {
    const html = await renderRoute(route);
    const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    // A page that renders almost nothing means the route resolved to a shell or
    // an error boundary; writing that in would be worse than leaving it empty.
    if (text.length < 400) {
      failures.push(`${route} (only ${text.length} chars of text)`);
      continue;
    }
    const shell = readFileSync(file, 'utf8');
    if (!shell.includes(EMPTY_ROOT)) {
      failures.push(`${route} (no empty root div to fill)`);
      continue;
    }
    // ElegantLayout adds this class in an effect, which is too late once there
    // is real markup to look at: the page would paint cream content on the dark
    // body elegant-site.css still sets, until React mounts. Stamping it into the
    // static HTML makes the first paint correct; the effect's add() is then a
    // no-op, and its cleanup still hands the surface back on unmount.
    const withSurface = shell.replace(/<body(\s[^>]*)?>/i, (match, attrs = '') =>
      /class=/.test(attrs || '')
        ? match.replace(/class=(["'])(.*?)\1/i, (_m, q, value) => `class=${q}${value} ac-cream-surface${q}`)
        : `<body${attrs || ''} class="ac-cream-surface">`,
    );
    writeFileSync(file, withSurface.replace(EMPTY_ROOT, `<div id="root">${html}</div>`));
    filled += 1;
  } catch (error) {
    failures.push(`${route} (${(error && error.message) || error})`);
  }
}

console.log(`Prerendered ${filled}/${targets.length} route pages with real HTML.`);
if (failures.length) {
  // Loud on purpose: a silently skipped route is a page that stays invisible.
  console.log(`Left as empty shells (${failures.length}):`);
  for (const failure of failures) console.log(`  - ${failure}`);
}
