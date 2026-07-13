import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { resolveSeoMetadata } from './seoMetadata.mjs';

const baseUrl = 'https://www.altercraft.in';
const publicDir = join(process.cwd(), 'public');
const blogDir = join(publicDir, 'blog');
const sitemapPath = join(publicDir, 'sitemap.xml');
const blogIndexPath = join(blogDir, 'index.html');
const lastmod = process.env.SITE_LASTMOD || '2026-06-19';
const whatsappNumber = '918817503658';

const blogSeoOverrides = {
  'wardrobe-internal-layout-guide': {
    title: 'Modular Wardrobe Planning Guide for Small Bedrooms | AlterCraft Ghaziabad',
    description:
      'Plan a modular wardrobe for small bedrooms with hanging space, drawers, lofts, saree storage, luggage zones and a quotation-ready internal layout.',
  },
  'sliding-vs-swing-wardrobe-small-bedroom': {
    title: 'Sliding vs Swing Wardrobe for Small Bedrooms | AlterCraft Ghaziabad',
    description:
      'Compare sliding and swing wardrobes for compact bedrooms with clearance, access, maintenance, storage planning, hardware and quote guidance.',
  },
  'tv-unit-planning-guide': {
    title: 'TV Unit Planning Guide: Cost, Storage and Cable Access | AlterCraft',
    description:
      'Plan a custom TV unit wall with storage, cable access, panel depth, lighting, ventilation, service clearance and quotation inputs.',
  },
  'hettich-vs-blum-vs-hafele-kitchen-wardrobe': {
    title: 'Soft Close Hinges Guide: Hettich vs Blum vs Hafele | AlterCraft',
    description:
      'Compare Hettich, Blum and Hafele soft-close hinges, channels and lift-ups for modular kitchens and wardrobes before final quotation.',
  },
  'small-kitchen-storage-ideas-noida-ghaziabad': {
    title: 'Modular Kitchen Storage Zones for Small Flats | AlterCraft NCR',
    description:
      'Storage-zone ideas for small modular kitchens in Noida, Ghaziabad and Greater Noida flats, including pantry, drawers, corners and tall units.',
  },
  'modular-kitchen-warm-profile-lights': {
    title: 'Modular Kitchen Warm Profile Lights and Storage Guide | AlterCraft',
    description:
      'Plan warm profile lights in a modular kitchen with practical storage, sink durability, appliance spacing, finish selection and quote guidance.',
  },
};

const publicRoutes = [
  '/',
  '/gallery',
  '/products',
  '/ContractorDesk',
  '/blog',
  '/ai-planner',
  '/ai-interior-design-planner',
  '/modular-kitchen',
  '/modular-kitchen-near-me',
  '/modular-kitchen-ghaziabad',
  '/modular-kitchen-noida',
  '/custom-furniture-maker-near-me',
  '/furniture-maker-ghaziabad',
  '/furniture-maker-modinagar-ghaziabad',
  '/modular-kitchen-quotation-ghaziabad',
  '/wardrobe-quotation-ghaziabad',
  '/custom-furniture-quotation-ghaziabad',
  '/workstation-manufacturers-ghaziabad',
  '/custom-furniture-ghaziabad',
  '/custom-furniture-noida',
  '/custom-furniture-greater-noida',
  '/office-interior-ghaziabad',
  '/office-interior-noida',
  '/wardrobe-design-ghaziabad',
  '/wardrobe-ghaziabad',
  '/tv-unit-ghaziabad',
  '/office-furniture-ghaziabad',
  '/interiors-ghaziabad',
  '/bed-manufacturer-ghaziabad',
  '/shoe-rack-design',
  '/designer-beds',
  '/beds',
  '/flush-doors',
  '/wardrobes',
  '/office-commercial',
  '/warranty-quality',
  '/about',
  '/contact',
  '/product/wardrobe-01',
  '/product/wardrobe-02',
  '/product/study-01',
  '/product/mandir-01',
  '/product/panel-01',
  '/product/nameplate-01',
  '/product/rental-01',
  '/cancellation-policy',
  '/disclaimer',
  '/privacy-policy',
  '/terms-and-conditions',
  '/return-refund-policy',
];

const routePriority = new Map([
  ['/', '1.0'],
  ['/ContractorDesk', '0.95'],
  ['/blog', '0.92'],
  ['/ai-planner', '0.95'],
  ['/ai-interior-design-planner', '0.95'],
  ['/modular-kitchen-near-me', '0.95'],
  ['/modular-kitchen-ghaziabad', '0.95'],
  ['/custom-furniture-maker-near-me', '0.95'],
  ['/furniture-maker-ghaziabad', '0.95'],
  ['/furniture-maker-modinagar-ghaziabad', '0.94'],
  ['/modular-kitchen-quotation-ghaziabad', '0.95'],
  ['/wardrobe-quotation-ghaziabad', '0.92'],
  ['/custom-furniture-quotation-ghaziabad', '0.92'],
  ['/workstation-manufacturers-ghaziabad', '0.9'],
  ['/custom-furniture-ghaziabad', '0.95'],
  ['/modular-kitchen', '0.9'],
  ['/designer-beds', '0.85'],
  ['/beds', '0.93'],
  ['/flush-doors', '0.85'],
  ['/wardrobes', '0.85'],
  ['/office-commercial', '0.85'],
  ['/gallery', '0.9'],
  ['/products', '0.8'],
  ['/contact', '0.8'],
]);

const xmlEscape = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const htmlEscape = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const decodeHtmlEntities = (value) => {
  let text = String(value || '');
  for (let i = 0; i < 40; i += 1) {
    const nextText = text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&#39;/g, "'");
    if (nextText === text) break;
    text = nextText;
  }
  return text.trim();
};

const titleWithBrand = (title) => (/\bAlterCraft\b/i.test(title) ? title : `${title} | AlterCraft`);

const extract = (html, pattern) => html.match(pattern)?.[1]?.trim() || '';

const absoluteUrl = (url) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return `${baseUrl}${url.startsWith('/') ? url : `/${url}`}`;
};

const cleanHtml = (html) =>
  html
    .replace(/\r\n?/g, '\n')
    .trimStart()
    .replace(/[ \t]+$/gm, '')
    .trimEnd() + '\n';

const getBlogSlugs = () =>
  readdirSync(blogDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((slug) => existsSync(join(blogDir, slug, 'index.html')))
    .sort((a, b) => a.localeCompare(b));

const readBlogMeta = (slug) => {
  const filePath = join(blogDir, slug, 'index.html');
  const html = readFileSync(filePath, 'utf8');
  const override = blogSeoOverrides[slug] || {};
  const title = decodeHtmlEntities(
    extract(html, /<title>([\s\S]*?)<\/title>/i).replace(/\s+\|\s+AlterCraft.*$/i, ''),
  );
  const description = decodeHtmlEntities(
    extract(html, /<meta\s+name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i),
  );
  const canonical = extract(html, /<link\s+rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i) || `${baseUrl}/blog/${slug}/`;
  const image =
    extract(html, /<meta\s+property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i) ||
    extract(html, /<img\s+class=["'][^"']*cover[^"']*["'][^>]*src=["']([^"']+)["'][^>]*>/i) ||
    '/images/generated/v1/brand-hero.webp';
  const category =
    decodeHtmlEntities(extract(html, /<p\s+class=["']k["'][^>]*>([\s\S]*?)<\/p>/i).replace(/<[^>]+>/g, '')) ||
    'AlterCraft Guide';
  const published =
    extract(html, /"datePublished"\s*:\s*"([^"]+)"/i) ||
    extract(html, /<meta\s+property=["']article:published_time["'][^>]*content=["']([^"']+)["'][^>]*>/i) ||
    lastmod;
  const modified =
    extract(html, /"dateModified"\s*:\s*"([^"]+)"/i) ||
    extract(html, /<meta\s+property=["']article:modified_time["'][^>]*content=["']([^"']+)["'][^>]*>/i) ||
    published ||
    lastmod;

  return {
    slug,
    filePath,
    html,
    title: override.title || title || slug.replace(/-/g, ' '),
    description: override.description || description,
    canonical,
    image: absoluteUrl(image),
    category,
    published: published.slice(0, 10),
    modified: modified.slice(0, 10),
  };
};

const insertBeforeHeadEnd = (html, snippet) => html.replace(/<\/head>/i, `  ${snippet}\n</head>`);

const upsertTag = (html, pattern, snippet) =>
  pattern.test(html) ? html.replace(pattern, snippet) : insertBeforeHeadEnd(html, snippet);

const upsertJsonLd = (html, type, schema) => {
  const snippet = `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
  let replaced = false;
  const nextHtml = html.replace(
    /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    (fullMatch, jsonText) => {
      if (replaced) return fullMatch;
      try {
        const parsed = JSON.parse(jsonText.trim());
        if (parsed?.['@type'] === type) {
          replaced = true;
          return snippet;
        }
      } catch {
        return fullMatch;
      }
      return fullMatch;
    },
  );

  return replaced ? nextHtml : insertBeforeHeadEnd(nextHtml, snippet);
};

const encodedWhatsAppMessage = (meta) =>
  encodeURIComponent(
    `Hi AlterCraft, I read your guide "${meta.title}" and want a free quotation. I can share photos and dimensions.`,
  );

const blogLeadCta = (meta, label) => `
  <div class="blog-lead-cta" data-ac-blog-cta="${label}">
    <strong>Need this design for your home?</strong>
    <p>Get a free quotation on WhatsApp. Share photos, wall sizes, budget and location so AlterCraft can guide the next practical step.</p>
    <a href="https://wa.me/${whatsappNumber}?text=${encodedWhatsAppMessage(meta)}">Get free quotation on WhatsApp</a>
  </div>`;

const insertBlogCtasAfterParagraphs = (html, insertions) => {
  let seen = 0;
  let insertedCount = 0;
  let nextHtml = html.replace(/<\/p>/gi, (match) => {
    seen += 1;
    const snippet = insertions.get(seen);
    if (!snippet) return match;
    insertedCount += 1;
    return `${match}${snippet}`;
  });

  for (const snippet of insertions.values()) {
    if (nextHtml.includes(snippet)) continue;
    nextHtml = nextHtml.replace(/<\/main>/i, `${snippet}\n</main>`);
  }

  return insertedCount ? nextHtml : html.replace(/<\/main>/i, `${Array.from(insertions.values()).join('\n')}\n</main>`);
};

const stripBlogLeadCtas = (html) =>
  html.replace(/\s*<div\s+class=["']blog-lead-cta["']\s+data-ac-blog-cta=["'][^"']+["']>[\s\S]*?<\/div>/gi, '');

const ensureBlogLeadCtas = (html, meta) => {
  let nextHtml = html;
  if (!/href=["']\/blog\/blog-style\.css["']/i.test(nextHtml)) {
    nextHtml = insertBeforeHeadEnd(nextHtml, '<link rel="stylesheet" href="/blog/blog-style.css" />');
  }
  nextHtml = stripBlogLeadCtas(nextHtml);

  const paragraphCount = (nextHtml.match(/<\/p>/gi) || []).length;
  const introParagraph = Math.min(2, Math.max(paragraphCount, 1));
  const middleParagraph = Math.min(Math.max(3, Math.ceil(paragraphCount / 2)), Math.max(paragraphCount, 1));
  const introCta = blogLeadCta(meta, 'intro');
  const middleCta = blogLeadCta(meta, 'middle');
  const insertions = new Map([[introParagraph, introCta]]);
  if (middleParagraph !== introParagraph) {
    insertions.set(middleParagraph, middleCta);
  }
  nextHtml = insertBlogCtasAfterParagraphs(nextHtml, insertions);
  if (middleParagraph === introParagraph) {
    nextHtml = /<h2[\s>]/i.test(nextHtml)
      ? nextHtml.replace(/<h2/i, `${middleCta}\n  <h2`)
      : nextHtml.replace(/<\/main>/i, `${middleCta}\n</main>`);
  }
  nextHtml = nextHtml.replace(/<\/main>/i, `${blogLeadCta(meta, 'final')}\n</main>`);
  return nextHtml;
};

const ensureBlogSeo = (meta) => {
  let html = meta.html;
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: meta.title,
    description: meta.description,
    image: meta.image,
    datePublished: meta.published,
    dateModified: meta.modified === meta.published ? lastmod : meta.modified,
    author: { '@type': 'Organization', name: 'AlterCraft' },
    publisher: { '@type': 'Organization', name: 'AlterCraft', logo: { '@type': 'ImageObject', url: `${baseUrl}/altercraft-logo.png` } },
    mainEntityOfPage: meta.canonical,
  };
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${baseUrl}/` },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${baseUrl}/blog/` },
      { '@type': 'ListItem', position: 3, name: meta.title, item: meta.canonical },
    ],
  };

  html = upsertTag(html, /<title>[\s\S]*?<\/title>/i, `<title>${htmlEscape(titleWithBrand(meta.title))}</title>`);
  html = upsertTag(
    html,
    /<meta\s+name=["']description["'][^>]*>/i,
    `<meta name="description" content="${htmlEscape(meta.description)}" />`,
  );
  html = upsertTag(
    html,
    /<link\s+rel=["']canonical["'][^>]*>/i,
    `<link rel="canonical" href="${htmlEscape(meta.canonical)}" />`,
  );
  html = upsertTag(
    html,
    /<meta\s+property=["']og:title["'][^>]*>/i,
    `<meta property="og:title" content="${htmlEscape(meta.title)}" />`,
  );
  html = upsertTag(
    html,
    /<meta\s+property=["']og:description["'][^>]*>/i,
    `<meta property="og:description" content="${htmlEscape(meta.description)}" />`,
  );
  html = upsertTag(
    html,
    /<meta\s+property=["']og:image["'][^>]*>/i,
    `<meta property="og:image" content="${htmlEscape(meta.image)}" />`,
  );
  html = upsertTag(
    html,
    /<meta\s+property=["']og:url["'][^>]*>/i,
    `<meta property="og:url" content="${htmlEscape(meta.canonical)}" />`,
  );
  html = upsertTag(
    html,
    /<meta\s+property=["']og:type["'][^>]*>/i,
    '<meta property="og:type" content="article" />',
  );
  html = upsertJsonLd(html, 'Article', articleSchema);
  html = upsertJsonLd(html, 'BreadcrumbList', breadcrumbSchema);
  html = ensureBlogLeadCtas(html, meta);

  const nextHtml = cleanHtml(html);
  if (nextHtml !== meta.html) {
    writeFileSync(meta.filePath, nextHtml);
  }

  return { ...meta, html: nextHtml };
};

const renderBlogIndex = (blogMeta) => {
  const featured = blogMeta.filter((post) =>
    [
      'contractor-desk-apk-for-contractors',
      'contractor-management-app-india',
      'modular-kitchen-price-per-sq-ft-ghaziabad',
      'custom-furniture-maker-near-me-checklist',
      'wardrobe-cost-ghaziabad',
      'daily-site-report-app-for-contractors',
    ].includes(post.slug),
  );
  const byCategory = new Map();
  for (const post of blogMeta) {
    const key = post.category || 'AlterCraft Guide';
    if (!byCategory.has(key)) byCategory.set(key, []);
    byCategory.get(key).push(post);
  }
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'AlterCraft Blog',
    description: 'AlterCraft guides for modular kitchens, custom furniture, wardrobes, office interiors, Contractor Desk APK and site execution.',
    url: `${baseUrl}/blog/`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: blogMeta.map((post, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: post.title,
        url: post.canonical,
      })),
    },
  };

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>AlterCraft Blog | Modular Kitchen, Furniture and Contractor Desk Guides</title>
  <meta name="description" content="Read AlterCraft guides on modular kitchen pricing, custom furniture, wardrobes, office interiors, Contractor Desk APK, payment gates and site execution." />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="${baseUrl}/blog/" />
  <meta property="og:title" content="AlterCraft Blog | Furniture, Interiors and Contractor Desk Guides" />
  <meta property="og:description" content="SEO-friendly guides for modular kitchens, custom furniture, wardrobes, office interiors, Contractor Desk APK and execution control." />
  <meta property="og:url" content="${baseUrl}/blog/" />
  <meta property="og:type" content="website" />
  <meta property="og:image" content="${baseUrl}/images/generated/v1/brand-hero.webp" />
  <link rel="stylesheet" href="/blog/blog-style.css" />
  <script type="application/ld+json">${JSON.stringify(itemListSchema)}</script>
</head>
<body>
<main>
  <p class="k">AlterCraft Knowledge Hub</p>
  <h1>Planning guides for better furniture, interiors and execution control.</h1>
  <p class="lede">Use these guides to understand modular kitchen pricing, custom furniture decisions, wardrobe planning, office interiors, Contractor Desk APK workflows and site execution systems before you request a quote.</p>
  <div class="note strong"><p>For Google indexing, this page acts as a clean crawl hub linking every live AlterCraft guide from one place.</p></div>
  <h2>Featured guides</h2>
  <div class="grid">
    ${featured
      .map(
        (post) => `<a class="card accent" href="/blog/${post.slug}/"><strong>${htmlEscape(post.title)}</strong><p>${htmlEscape(post.description)}</p></a>`,
      )
      .join('\n    ')}
  </div>
  ${Array.from(byCategory.entries())
    .map(
      ([category, posts]) => `<section><h2>${htmlEscape(category)}</h2><div class="grid">${posts
        .map((post) => `<a class="card" href="/blog/${post.slug}/"><strong>${htmlEscape(post.title)}</strong><p>${htmlEscape(post.description)}</p></a>`)
        .join('\n      ')}</div></section>`,
    )
    .join('\n  ')}
  <div class="cta dark">
    <strong>Need a measured quote?</strong>
    <p>Share photos, dimensions, budget and location with AlterCraft. We will guide you from planning to execution.</p>
    <a href="https://wa.me/918817503658">Start on WhatsApp</a>
  </div>
</main>
</body>
</html>
`;
};

const routeEntry = ({ loc, changefreq = 'weekly', priority = '0.8', image = '' }) => {
  const imageXml = image
    ? `
    <image:image>
      <image:loc>${xmlEscape(image)}</image:loc>
    </image:image>`
    : '';
  return `  <url>
    <loc>${xmlEscape(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>${imageXml}
  </url>`;
};

const writeSitemap = (blogMeta) => {
  const seen = new Set();
  const entries = [];
  const addEntry = (entry) => {
    if (seen.has(entry.loc)) return;
    seen.add(entry.loc);
    entries.push(entry);
  };

  for (const route of publicRoutes) {
    const seo = resolveSeoMetadata(route);
    const loc = route === '/blog' ? `${baseUrl}/blog/` : seo.canonical;
    const isPolicy = /policy|terms|disclaimer|cancellation|return-refund/.test(route);
    addEntry({
      loc,
      changefreq: route === '/' ? 'weekly' : isPolicy ? 'yearly' : 'weekly',
      priority: routePriority.get(route) || (isPolicy ? '0.35' : route.startsWith('/product/') ? '0.75' : '0.85'),
    });
  }

  for (const post of blogMeta) {
    addEntry({
      loc: post.canonical,
      changefreq: 'monthly',
      priority: post.slug.includes('contractor') || post.slug.includes('modular-kitchen') || post.slug.includes('custom-furniture') || post.slug.includes('wardrobe')
        ? '0.9'
        : '0.8',
      image: post.image,
    });
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries.map(routeEntry).join('\n')}
</urlset>
`;
  writeFileSync(sitemapPath, xml);
};

if (!existsSync(blogDir)) mkdirSync(blogDir, { recursive: true });

const blogMeta = getBlogSlugs().map(readBlogMeta).map(ensureBlogSeo);
writeFileSync(blogIndexPath, cleanHtml(renderBlogIndex(blogMeta)));
writeSitemap(blogMeta);

console.log(`Generated blog index, repaired ${blogMeta.length} blog SEO records, and wrote sitemap.xml.`);
