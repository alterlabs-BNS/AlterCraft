// Viability probe for prerendering. Builds the SSR bundle with Vite, renders a
// couple of routes in Node, and reports how much real text each produced.
// Not part of the deploy pipeline — run it by hand: node scripts/prerenderProbe.mjs
import { build } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const root = process.cwd();
const outDir = resolve(root, 'tmp/ssr');

const ROUTES = process.argv.slice(2).length ? process.argv.slice(2) : ['/about', '/modular-kitchen'];

console.log('Building SSR bundle...');
await build({
  root,
  logLevel: 'error',
  plugins: [react()],
  build: {
    ssr: resolve(root, 'scripts/prerenderEntry.tsx'),
    outDir,
    emptyOutDir: true,
    rollupOptions: { output: { entryFileNames: 'entry.mjs' } },
  },
});

const { renderRoute } = await import(pathToFileURL(resolve(outDir, 'entry.mjs')).href);

const stripTags = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

for (const route of ROUTES) {
  try {
    const html = await renderRoute(route);
    const text = stripTags(html);
    console.log(`\n=== ${route} ===`);
    console.log(`   html: ${html.length} bytes | visible text: ${text.length} chars`);
    console.log(`   first 160: ${text.slice(0, 160)}`);
  } catch (error) {
    console.log(`\n=== ${route} ===`);
    console.log(`   FAILED: ${(error && error.message) || error}`);
  }
}

process.exit(0);
