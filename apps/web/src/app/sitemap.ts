import type { MetadataRoute } from 'next';
import { getCategories, getProducts, getNewsArticles } from '@compario/database';

const BASE = 'https://compario.tech';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE,                    lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE}/categories`,    lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/news`,          lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE}/compare`,       lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/search`,        lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
  ];

  let categoryRoutes: MetadataRoute.Sitemap = [];
  let productRoutes:  MetadataRoute.Sitemap = [];
  let newsRoutes:     MetadataRoute.Sitemap = [];

  try {
    const categories = await getCategories(true);
    categoryRoutes = categories.map((cat) => ({
      url:             `${BASE}/categories/${cat.slug}`,
      lastModified:    new Date(cat.updated_at),
      changeFrequency: 'weekly' as const,
      priority:        0.7,
    }));
  } catch { /* DB unavailable during build */ }

  try {
    const products = await getProducts({ status: 'active', limit: 2000 });
    productRoutes = products.map((p) => ({
      url:             `${BASE}/products/${p.slug}`,
      lastModified:    new Date(p.updated_at),
      changeFrequency: 'weekly' as const,
      priority:        0.6,
    }));
  } catch { /* DB unavailable during build */ }

  try {
    const { data: news } = await getNewsArticles({ limit: 1000 });
    newsRoutes = news.map((article) => ({
      url:             `${BASE}/news/${article.slug}`,
      lastModified:    new Date(article.updated_at),
      changeFrequency: 'monthly' as const,
      priority:        0.8,
    }));
  } catch { /* DB unavailable during build */ }

  return [...staticRoutes, ...categoryRoutes, ...productRoutes, ...newsRoutes];
}
