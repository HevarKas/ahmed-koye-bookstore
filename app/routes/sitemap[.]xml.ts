import { getAllIds, getMeta } from '~/lib/catalog.server';
import { SITE_URL } from '~/shared/store';

export function loader() {
  const urls = [
    `<url><loc>${SITE_URL}/</loc></url>`,
    `<url><loc>${SITE_URL}/books</loc></url>`,
    `<url><loc>${SITE_URL}/categories</loc></url>`,
    `<url><loc>${SITE_URL}/visit</loc></url>`,
    ...getMeta().categories.map((c) => `<url><loc>${SITE_URL}/books?category=${c.id}</loc></url>`),
    ...getAllIds().map(
      (b) =>
        `<url><loc>${SITE_URL}/books/${b.id}</loc>${b.updated_at ? `<lastmod>${b.updated_at.slice(0, 10)}</lastmod>` : ''}</url>`,
    ),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`;
  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
}
