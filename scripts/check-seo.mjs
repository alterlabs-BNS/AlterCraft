import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { resolveSeoMetadata } from './seoMetadata.mjs';

const outDir = join(process.cwd(), 'build');
const baseUrl = 'https://www.altercraft.in';

const routesToCheck = [
  '/',
  '/blog',
  '/modular-kitchen',
  '/modular-kitchen-ghaziabad',
  '/modular-kitchen-noida',
  '/beds',
  '/ContractorDesk',
  '/custom-furniture-maker-near-me',
  '/furniture-maker-ghaziabad',
  '/furniture-maker-modinagar-ghaziabad',
  '/modular-kitchen-quotation-ghaziabad',
  '/wardrobe-quotation-ghaziabad',
  '/custom-furniture-quotation-ghaziabad',
  '/workstation-manufacturers-ghaziabad',
  '/custom-furniture-ghaziabad',
  '/custom-furniture-noida',
  '/office-interior-ghaziabad',
  '/wardrobe-design-ghaziabad',
  '/wardrobe-ghaziabad',
  '/tv-unit-ghaziabad',
  '/office-furniture-ghaziabad',
  '/interiors-ghaziabad',
  '/shoe-rack-design',
  '/ai-interior-design-planner',
  '/ai-planner',
  '/ai-planner/upload',
  '/ai-planner/submitted',
  '/product/wardrobe-01',
];

const privateRoutes = [
  '/admin',
  '/admin/leads',
  '/admin/projects',
  '/my-projects',
  '/ai-planner/start',
  '/ai-planner/upload',
  '/ai-planner/dimensions',
  '/ai-planner/requirements',
  '/ai-planner/confirm',
  '/ai-planner/submitted',
];

const blogRoot = join(outDir, 'blog');
const blogRoutesToCheck = existsSync(blogRoot)
  ? readdirSync(blogRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => `/blog/${entry.name}/`)
      .sort()
  : [];

const errors = [];

const readRouteHtml = (route) => {
  const routePath =
    route === '/'
      ? join(outDir, 'index.html')
      : join(outDir, ...route.replace(/^\/+/, '').split('/'), 'index.html');

  if (!existsSync(routePath)) {
    errors.push(`Missing generated HTML for ${route}: ${routePath}`);
    return '';
  }

  return readFileSync(routePath, 'utf8');
};

const extract = (html, pattern) => html.match(pattern)?.[1]?.trim() || '';

for (const route of routesToCheck) {
  const html = readRouteHtml(route);
  if (!html) continue;

  const expected = resolveSeoMetadata(route);
  const title = extract(html, /<title>([\s\S]*?)<\/title>/i);
  const description = extract(html, /<meta\s+name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i);
  const robots = extract(html, /<meta\s+name=["']robots["'][^>]*content=["']([^"']+)["'][^>]*>/i);
  const canonical = extract(html, /<link\s+rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i);

  if (!title) errors.push(`${route} is missing <title>.`);
  if (!description) errors.push(`${route} is missing meta description.`);
  if (!robots) errors.push(`${route} is missing robots meta.`);
  if (!canonical) errors.push(`${route} is missing canonical link.`);
  if (canonical && !canonical.startsWith(`${baseUrl}/`)) {
    errors.push(`${route} canonical should use the preferred www host.`);
  }

  if (route !== '/' && canonical === `${baseUrl}/`) {
    errors.push(`${route} still points canonical to homepage.`);
  }

  if (canonical && canonical !== expected.canonical) {
    errors.push(`${route} canonical mismatch. Expected ${expected.canonical}, found ${canonical}.`);
  }

  if (robots && robots !== expected.robots) {
    errors.push(`${route} robots mismatch. Expected ${expected.robots}, found ${robots}.`);
  }

  if (route.includes('modular-kitchen') && !description.includes('INR 1,200')) {
    errors.push(`${route} description is missing modular kitchen starting price.`);
  }
}

for (const route of blogRoutesToCheck) {
  const html = readRouteHtml(route);
  if (!html) continue;

  const title = extract(html, /<title>([\s\S]*?)<\/title>/i);
  const description = extract(html, /<meta\s+name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i);
  const canonical = extract(html, /<link\s+rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i);
  const expectedCanonical = `${baseUrl}${route}`;

  if (!title) errors.push(`${route} is missing blog <title>.`);
  if (!description) errors.push(`${route} is missing blog meta description.`);
  if (canonical !== expectedCanonical) {
    errors.push(`${route} blog canonical mismatch. Expected ${expectedCanonical}, found ${canonical || 'none'}.`);
  }
  if (!html.includes('"@type":"Article"')) {
    errors.push(`${route} is missing Article structured data.`);
  }
  if (!html.includes('https://wa.me/918817503658')) {
    errors.push(`${route} is missing WhatsApp lead CTA.`);
  }
}

const sitemapPath = join(outDir, 'sitemap.xml');
if (!existsSync(sitemapPath)) {
  errors.push('Missing build/sitemap.xml.');
} else {
  const sitemap = readFileSync(sitemapPath, 'utf8');
  for (const route of privateRoutes) {
    if (sitemap.includes(`${baseUrl}${route}`)) {
      errors.push(`Private route ${route} should not be listed in sitemap.xml.`);
    }
  }
  for (const route of blogRoutesToCheck) {
    if (!sitemap.includes(`${baseUrl}${route}`)) {
      errors.push(`Blog route ${route} is missing from sitemap.xml.`);
    }
  }
  if (!sitemap.includes(`${baseUrl}/blog/`)) {
    errors.push('Blog index /blog/ is missing from sitemap.xml.');
  }
  if (!sitemap.includes('<lastmod>')) {
    errors.push('sitemap.xml is missing lastmod entries.');
  }
}

const robotsPath = join(outDir, 'robots.txt');
if (!existsSync(robotsPath)) {
  errors.push('Missing build/robots.txt.');
} else {
  const robotsTxt = readFileSync(robotsPath, 'utf8');
  for (const directive of ['Disallow: /admin/', 'Disallow: /my-projects/', 'Disallow: /ai-planner/submitted', 'Disallow: /downloads/']) {
    if (!robotsTxt.includes(directive)) {
      errors.push(`robots.txt is missing ${directive}`);
    }
  }
}

if (errors.length) {
  console.error('SEO check failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`SEO check passed for ${routesToCheck.length} representative routes and ${blogRoutesToCheck.length} blog routes.`);
}
