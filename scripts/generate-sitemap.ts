import fs from 'node:fs';
import path from 'node:path';

const BASE_URL = process.env.APP_URL ?? 'https://edra.app';

/** Static routes known at build time */
const staticRoutes = [
  '/',
  '/login',
  '/signup',
  '/forgot-password',
  '/blog',
  '/docs',
  '/privacy',
  '/terms',
];

/** Read blog slugs from content/blog directory */
function getBlogSlugs(): string[] {
  const blogDir = path.resolve(import.meta.dirname, '../content/blog');
  if (!fs.existsSync(blogDir)) return [];

  return fs
    .readdirSync(blogDir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''));
}

/** Read doc slugs from content/docs directory */
function getDocSlugs(): string[] {
  const docsDir = path.resolve(import.meta.dirname, '../content/docs');
  if (!fs.existsSync(docsDir)) return [];

  return fs
    .readdirSync(docsDir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''));
}

function buildSitemap(): string {
  const blogSlugs = getBlogSlugs();
  const docSlugs = getDocSlugs();

  const blogRoutes = blogSlugs.map((slug) => `/blog/${slug}`);
  const docRoutes = docSlugs.map((slug) => `/docs/${slug}`);

  const allRoutes = [...staticRoutes, ...blogRoutes, ...docRoutes];
  const today = new Date().toISOString().split('T')[0];

  const urls = allRoutes
    .map(
      (route) => `  <url>
    <loc>${BASE_URL}${route}</loc>
    <lastmod>${today}</lastmod>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemapindex.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

const outputPath = path.resolve(import.meta.dirname, '../public/sitemap.xml');
fs.writeFileSync(outputPath, buildSitemap(), 'utf-8');
console.log(`Sitemap generated at ${outputPath}`);
