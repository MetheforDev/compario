import { NextResponse } from 'next/server';
import { searchProducts, searchNews } from '@compario/database';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim() ?? '';

  if (q.length < 2) {
    return NextResponse.json({ products: [], news: [] });
  }

  try {
    const [products, news] = await Promise.all([
      searchProducts(q, 5).catch(() => []),
      searchNews(q, 4).catch(() => []),
    ]);

    return NextResponse.json(
      {
        products: products.map((p) => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          brand: p.brand,
          model: p.model,
          price_min: p.price_min,
          price_max: p.price_max,
          currency: p.currency,
          image_url: p.image_url,
          _matchType: p._matchType,
        })),
        news: news.map((a) => ({
          id: a.id,
          slug: a.slug,
          title: a.title,
          category: a.category,
          categories: a.categories,
          cover_image: a.cover_image,
          published_at: a.published_at,
        })),
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
      },
    );
  } catch {
    return NextResponse.json({ products: [], news: [] });
  }
}
