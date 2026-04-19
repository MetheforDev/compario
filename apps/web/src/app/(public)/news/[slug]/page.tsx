import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const revalidate = 3600;
import {
  getNewsArticleBySlug,
  getRelatedNews,
  getProductsByIds,
  incrementNewsView,
  getComments,
} from '@compario/database';
import type { Product } from '@compario/database';
import { MarkdownContent } from '@/components/MarkdownContent';
import { NewsCard } from '@/components/NewsCard';
import { ShareButtons } from '@/components/ShareButtons';
import { CommentsSection } from '@/components/CommentsSection';
import { getPublicUser } from '@/lib/auth';

const CATEGORY_LABELS: Record<string, string> = {
  'yeni-model': 'Yeni Model',
  test: 'Test & İnceleme',
  karsilastirma: 'Karşılaştırma',
  fiyat: 'Fiyat Güncelleme',
  teknoloji: 'Teknoloji',
  genel: 'Genel',
};

const CATEGORY_COLORS: Record<string, string> = {
  'yeni-model': 'text-neon-cyan border-neon-cyan/30 bg-neon-cyan/10',
  test: 'text-neon-green border-neon-green/30 bg-neon-green/10',
  karsilastirma: 'text-neon-purple border-neon-purple/30 bg-neon-purple/10',
  fiyat: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10',
  teknoloji: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
  genel: 'text-gray-400 border-gray-400/30 bg-gray-400/10',
};

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const article = await getNewsArticleBySlug(params.slug);
    if (!article) return {};
    const title = article.meta_title ?? article.title;
    const description = article.meta_description ?? article.excerpt ?? '';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://compario.tech';
    const ogImage = `${appUrl}/api/og/news?slug=${params.slug}`;
    const canonical = `${appUrl}/news/${params.slug}`;
    return {
      title: `${title} | Compario`,
      description,
      alternates: { canonical },
      openGraph: {
        title,
        description,
        images: [{ url: ogImage, width: 1200, height: 630, type: 'image/png' }],
        type: 'article',
        publishedTime: article.published_at ?? undefined,
        siteName: 'Compario',
        url: canonical,
        locale: 'tr_TR',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [ogImage],
        site: '@compariotech',
      },
    };
  } catch {
    return {};
  }
}

function readingTime(content: string | null | undefined): number {
  if (!content) return 1;
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}


export default async function NewsDetailPage({ params }: PageProps) {
  let article: import('@compario/database').NewsArticle | null = null;
  let related: import('@compario/database').NewsArticle[] = [];
  let relatedProducts: Product[] = [];

  try {
    article = await getNewsArticleBySlug(params.slug);
    if (article) {
      incrementNewsView(article.id).catch(() => {});

      const articleAny = article as typeof article & { related_product_ids?: string[] | null };
      const [relNews, relProds] = await Promise.all([
        article.tags?.length ? getRelatedNews(article.tags, article.id, 3) : Promise.resolve([]),
        articleAny.related_product_ids?.length
          ? getProductsByIds(articleAny.related_product_ids)
          : Promise.resolve([]),
      ]);
      related = relNews;
      relatedProducts = relProds;
    }
  } catch {
    // db not available
  }

  if (!article) notFound();

  const [comments, currentUser] = await Promise.all([
    getComments('news', article.id).catch(() => []),
    getPublicUser().catch(() => null),
  ]);

  const minutes = readingTime(article.content);
  const articleWithCats = article as typeof article & { categories?: string[] | null };
  const allCategories = articleWithCats.categories?.length
    ? articleWithCats.categories
    : article.category
    ? [article.category]
    : [];
  const primaryCategory = allCategories[0] ?? null;
  const categoryColor = primaryCategory ? (CATEGORY_COLORS[primaryCategory] ?? CATEGORY_COLORS.genel) : '';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.meta_title ?? article.title,
    description: article.meta_description ?? article.excerpt ?? '',
    image: article.cover_image ? [article.cover_image] : [],
    datePublished: article.published_at ?? article.created_at,
    dateModified: article.updated_at,
    author: {
      '@type': 'Person',
      name: article.author ?? 'Compario',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Compario',
      url: 'https://compario.tech',
      logo: {
        '@type': 'ImageObject',
        url: 'https://compario.tech/images/logos/compario-logo-icon-only.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://compario.tech/news/${article.slug}`,
    },
    keywords: article.tags?.join(', ') ?? '',
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: 'https://compario.tech' },
      { '@type': 'ListItem', position: 2, name: 'Haberler', item: 'https://compario.tech/news' },
      { '@type': 'ListItem', position: 3, name: article.title, item: `https://compario.tech/news/${article.slug}` },
    ],
  };

  return (
    <main className={`min-h-screen bg-grid ${!article.cover_image ? 'pt-20' : ''}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      {/* Cover Image */}
      {article.cover_image && (
        <div className="w-full h-[400px] sm:h-[500px] relative overflow-hidden">
          <Image
            src={article.cover_image}
            alt={article.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/40 to-transparent" />
        </div>
      )}

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 font-mono text-[10px] text-gray-600 uppercase tracking-wider mb-8 flex-wrap">
          <Link href="/" className="hover:text-neon-cyan transition-colors">Ana Sayfa</Link>
          <span>/</span>
          <Link href="/news" className="hover:text-neon-cyan transition-colors">Haberler</Link>
          {article.category && (
            <>
              <span>/</span>
              <Link href={`/news?category=${article.category}`} className="hover:text-neon-cyan transition-colors">
                {CATEGORY_LABELS[article.category] ?? article.category}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-gray-500 truncate max-w-[200px]">{article.title}</span>
        </nav>

        {/* Article Header */}
        <header className="mb-10">
          {allCategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {allCategories.map((cat) => (
                <span
                  key={cat}
                  className={`inline-block px-3 py-1 rounded-full border text-xs font-mono uppercase tracking-wider ${CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.genel}`}
                >
                  {CATEGORY_LABELS[cat] ?? cat}
                </span>
              ))}
            </div>
          )}

          <h1 className="font-orbitron text-3xl sm:text-4xl font-black text-white leading-tight mb-6">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-gray-600 font-mono text-xs">
            {article.author && (
              <span className="flex items-center gap-1.5">
                <span className="text-gray-700">◈</span>
                {article.author}
              </span>
            )}
            {article.published_at && (
              <span className="flex items-center gap-1.5">
                <span className="text-gray-700">◇</span>
                {new Date(article.published_at).toLocaleDateString('tr-TR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <span className="text-gray-700">◆</span>
              {article.view_count} görüntülenme
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-gray-700">◈</span>
              {minutes} dk okuma
            </span>
          </div>

          {/* Tags */}
          {article.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-5">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 border border-[rgba(0,255,247,0.12)] rounded-full font-mono text-[10px] text-gray-500 uppercase tracking-wider"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Divider */}
        <div className="border-t border-[rgba(0,255,247,0.08)] mb-10" />

        {/* Image Gallery */}
        {article.images && article.images.length > 0 && (
          <div className="mb-10">
            <h2 className="font-mono text-[10px] text-gray-600 uppercase tracking-wider mb-4">
              Görsel Galerisi ({article.images.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {article.images.map((imageUrl, index) => (
                <div
                  key={index}
                  className="relative aspect-video bg-[#0c0c16] rounded overflow-hidden border border-[rgba(0,255,247,0.1)] hover:border-neon-cyan/40 transition-colors"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt={`${article.title} — görsel ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        <MarkdownContent content={article.content ?? ''} />

        {/* Divider */}
        <div className="border-t border-[rgba(0,255,247,0.08)] mt-12 mb-8" />

        {/* Share */}
        <ShareButtons title={article.title} slug={article.slug} />

        {/* Comments */}
        <div className="mt-12">
          <CommentsSection
            entityType="news"
            entityId={article.id}
            initialComments={comments}
            currentUser={currentUser ? { id: currentUser.id, name: currentUser.name, email: currentUser.email } : null}
          />
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-14">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, rgba(196,154,60,0.2), transparent)' }} />
              <h2 className="font-orbitron text-[10px] uppercase tracking-[0.4em] whitespace-nowrap" style={{ color: '#C49A3C' }}>
                İlgili Ürünler
              </h2>
              <div className="h-px flex-1" style={{ background: 'linear-gradient(270deg, rgba(196,154,60,0.2), transparent)' }} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedProducts.map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.slug}`}
                  className="group flex flex-col rounded-xl overflow-hidden border transition-all"
                  style={{ background: '#0f0f1a', borderColor: 'rgba(196,154,60,0.08)' }}
                >
                  <div className="aspect-video w-full bg-[#0c0c16] flex items-center justify-center overflow-hidden">
                    {p.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <span className="text-3xl opacity-10">◈</span>
                    )}
                  </div>
                  <div className="px-4 py-4 flex flex-col gap-1.5">
                    {p.brand && <p className="font-mono text-[9px] uppercase tracking-widest text-gray-600">{p.brand}</p>}
                    <h3 className="font-orbitron text-xs font-bold text-gray-300 line-clamp-2 group-hover:text-neon-cyan transition-colors">{p.name}</h3>
                    <div className="flex items-center justify-between mt-1">
                      {p.price_min && (
                        <p className="font-orbitron text-sm font-black" style={{ color: '#C49A3C' }}>
                          ₺{p.price_min.toLocaleString('tr-TR')}
                        </p>
                      )}
                      <span className="font-mono text-[9px] text-neon-cyan opacity-0 group-hover:opacity-100 transition-opacity">
                        İncele →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Related News */}
        {related.length > 0 && (
          <section className="mt-16">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[rgba(0,255,247,0.15)]" />
              <h2 className="font-orbitron text-xs uppercase tracking-[0.4em] text-neon-cyan opacity-70">
                İlgili Haberler
              </h2>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[rgba(0,255,247,0.15)]" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {related.map((rel) => (
                <NewsCard key={rel.id} article={rel} />
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="pb-20" />
    </main>
  );
}
