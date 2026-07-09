import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { applySeoMetadata } from './seoMetadata.mjs';

const outDir = join(process.cwd(), 'build');
const indexPath = join(outDir, 'index.html');
const notFoundPath = join(outDir, '404.html');
const sitemapPath = join(outDir, 'sitemap.xml');
const cleanHtml = (html) =>
  html
    .replace(/\r\n?/g, '\n')
    .trimStart()
    .replace(/[ \t]+$/gm, '')
    .trimEnd() + '\n';

const spaRoutes = [
  '/gallery',
  '/portfolio',
  '/products',
  '/ContractorDesk',
  '/contractor-desk',
  '/contractor-admin',
  '/OperatorDesk',
  '/operator-desk',
  '/operator-desk/dashboard',
  '/operator-desk/leads',
  '/operator-desk/jobs',
  '/operator-desk/cash',
  '/operator-desk/labour',
  '/operator-desk/materials',
  '/operator-desk/site-reports',
  '/operator-desk/disputes',
  '/operator-desk/reports',
  '/operator-desk/settings',
  '/modular-kitchen',
  '/modular-kitchen-near-me',
  '/modular-kitchen-ghaziabad',
  '/modular-kitchen-noida',
  '/custom-furniture-ghaziabad',
  '/custom-furniture-noida',
  '/custom-furniture-greater-noida',
  '/custom-furniture-maker-near-me',
  '/furniture-maker-ghaziabad',
  '/furniture-maker-modinagar-ghaziabad',
  '/furniture-maker-in-modinagar-ghaziabad',
  '/modular-kitchen-quotation-ghaziabad',
  '/wardrobe-quotation-ghaziabad',
  '/custom-furniture-quotation-ghaziabad',
  '/workstation-manufacturers-ghaziabad',
  '/ai-interior-design-planner',
  '/office-interior-ghaziabad',
  '/office-interior-noida',
  '/wardrobe-design-ghaziabad',
  '/wardrobe-ghaziabad',
  '/tv-unit-ghaziabad',
  '/office-furniture-ghaziabad',
  '/interiors-ghaziabad',
  '/bed-manufacturer-ghaziabad',
  '/shoe-rack-design',
  '/kitchen',
  '/designer-beds',
  '/beds',
  '/flush-doors',
  '/doors',
  '/wardrobes',
  '/storage',
  '/office-commercial',
  '/office',
  '/warranty-quality',
  '/warranty',
  '/about',
  '/contact',
  '/get-quote',
  '/ai-planner',
  '/ai-planner/start',
  '/ai-planner/upload',
  '/ai-planner/dimensions',
  '/ai-planner/requirements',
  '/ai-planner/confirm',
  '/ai-planner/submitted',
];

if (!existsSync(indexPath)) {
  throw new Error(`Missing build output: ${indexPath}`);
}

const indexHtml = cleanHtml(readFileSync(indexPath, 'utf8'));

writeFileSync(notFoundPath, cleanHtml(applySeoMetadata(indexHtml, '/404')));

const sitemapRoutes = existsSync(sitemapPath)
  ? Array.from(readFileSync(sitemapPath, 'utf8').matchAll(/<loc>https:\/\/www\.altercraft\.in([^<]+)<\/loc>/g))
      .map((match) => match[1])
      .filter((route) => !route.includes('/blog/'))
  : [];

const writeRouteCopy = (route) => {
  const cleanRoute = route.replace(/\/$/, '');
  if (!cleanRoute || cleanRoute.includes('.')) return false;
  const routeIndexPath = join(outDir, ...cleanRoute.replace(/^\/+/, '').split('/'), 'index.html');
  if (existsSync(routeIndexPath)) return false;
  mkdirSync(dirname(routeIndexPath), { recursive: true });
  writeFileSync(routeIndexPath, cleanHtml(applySeoMetadata(indexHtml, cleanRoute)));
  return true;
};

const routeCount = new Set([...spaRoutes, ...sitemapRoutes]).values();
let copiedRoutes = 0;
for (const route of routeCount) {
  if (writeRouteCopy(route)) copiedRoutes += 1;
}

console.log(`Created build/404.html and ${copiedRoutes} SPA route fallback pages for GitHub Pages.`);

// Flip-homepage: serve the scroll-flip landing at '/' while all other routes keep the React shell.
// (Runs AFTER 404.html and route fallbacks are generated from the original index.html.)
const flipHomePath = join(outDir, 'home-flip.html');
if (existsSync(flipHomePath)) {
  writeFileSync(indexPath, cleanHtml(readFileSync(flipHomePath, 'utf8')));
  console.log('Replaced build/index.html with home-flip.html (scroll-flip homepage).');
}
