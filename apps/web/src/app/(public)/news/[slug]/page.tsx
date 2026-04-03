import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  getNewsArticleBySlug,
  getRelatedNews,
  getAdjacentNews,
  incrementNewsView,
} from '@compario/database';
import { NewsCard } from '@/components/NewsCard';
import { ShareButtons } from '@/components/ShareButtons';
import { MarkdownContent } from '@/components/MarkdownContent';
import NewsGallery from '@/components/NewsGallery';
import { calculateReadingTime } from '@/lib/readingTime';

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
    return {
      title: `${article.meta_title ?? article.title} | Compario`,
      description: article.meta_description ?? article.excerpt ?? '',
      openGraph: {
        title: article.meta_title ?? article.title,
        description: article.meta_description ?? article.excerpt ?? '',
        images: article.cover_image ? [article.cover_image] : [],
        type: 'article',
        publishedTime: article.published_at ?? undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title: article.meta_title ?? article.title,
        description: article.meta_description ?? article.excerpt ?? '',
        images: article.cover_image ? [article.cover_image] : [],
        creator: '@compariotech',
        site: '@compariotech',
      },
    };
  } catch {
    return {};
  }
}

export default async function NewsDetailPage({ params }: PageProps) {
  let article: import('@compario/database').NewsArticle | null = null;
  let related: import('@compario/database').NewsArticle[] = [];
  let adjacent: { previous: { id: string; title: string; slug: string } | null; next: { id: string; title: string; slug: string } | null } = { previous: null, next: null };

  try {
    article = await getNewsArticleBySlug(params.slug);
    if (article) {
      incrementNewsView(article.id).catch(() => {});

      [related, adjacent] = await Promise.all([
        article.tags?.length ? getRelatedNews(article.tags, article.id, 3) : Promise.resolve([]),
        getAdjacentNews(params.slug).catch(() => ({ previous: null, next: null })),
      ]);
    }
  } catch {
    // db not available
  }

  if (!article) notFound();

  const articleWithCats = article as typeof article & { categories?: string[] | null };
  const allCategories = articleWithCats.categories?.length
    ? articleWithCats.categories
    : article.category
    ? [article.category]
    : [];

  const readingTime = calculateReadingTime(article.content);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.meta_title ?? article.title,
    description: article.meta_description ?? article.excerpt ?? '',
    image: article.cover_image ? [article.cover_image] : [],
    datePublished: article.published_at ?? article.created_at,
    dateModified: article.updated_at,
    author: { '@type': 'Person', name: article.author ?? 'Compario' },
    publisher: {
      '@type': 'Organization',
      name: 'Compario',
      url: 'https://compario.tech',
      logo: { '@type': 'ImageObject', url: 'https://compario.tech/images/logos/favicon.png' },
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
        <div className="relative w-full h-[400px] sm:h-[500px] overflow-hidden">
          <Image
            src={article.cover_image}
            alt={article.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#08090E] via-[#08090E]/40 to-transparent" />
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
          {/* Category badges + featured badge */}
          {(allCategories.length > 0 || article.is_featured) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {allCategories.map((cat) => (
                <span
                  key={cat}
                  className={`inline-block px-3 py-1 rounded-full border text-xs font-mono uppercase tracking-wider ${CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.genel}`}
                >
                  {CATEGORY_LABELS[cat] ?? cat}
                </span>
              ))}
              {article.is_featured && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-mono uppercase tracking-wider"
                  style={{ background: 'rgba(196,154,60,0.1)', borderColor: 'rgba(196,154,60,0.3)', color: '#C49A3C' }}>
                  <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Öne Çıkan
                </span>
              )}
            </div>
          )}

          <h1 className="font-orbitron text-3xl sm:text-4xl font-black text-white leading-tight mb-6">
            {article.title}
          </h1>

          {/* Meta: author, date, views, reading time */}
          <div className="flex flex-wrap items-center gap-3 text-gray-600 font-mono text-xs">
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
                  year: 'numeric', month: 'long', day: 'numeric',
                })}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <span className="text-gray-700">◆</span>
              {article.view_count} görüntülenme
            </span>
            <span className="flex items-center gap-1.5">
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
              </svg>
              {readingTime} dk okuma
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

        {/* Excerpt block */}
        {article.excerpt && (
          <div className="mb-10 p-6 rounded-xl border-l-4"
            style={{ background: 'rgba(196,154,60,0.04)', borderLeftColor: 'rgba(196,154,60,0.5)', border: '1px solid rgba(196,154,60,0.1)', borderLeft: '4px solid rgba(196,154,60,0.5)' }}>
            <p className="font-mono text-sm text-gray-300 leading-relaxed italic">
              {article.excerpt}
            </p>
          </div>
        )}

        {/* Image Gallery */}
        <NewsGallery images={article.images ?? []} title={article.title} />

        {/* Content */}
        <article>
          <MarkdownContent content={article.content} />
        </article>

        {/* Divider */}
        <div className="border-t border-[rgba(0,255,247,0.08)] mt-12 mb-8" />

        {/* Share */}
        <ShareButtons title={article.title} slug={article.slug} />

        {/* Adjacent Navigation */}
        {(adjacent.previous || adjacent.next) && (
          <nav className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {adjacent.previous ? (
              <Link
                href={`/news/${adjacent.previous.slug}`}
                className="group block rounded-xl p-5 transition-all hover:scale-[1.02]"
                style={{ background: 'rgba(12,12,22,0.8)', border: '1px solid rgba(196,154,60,0.1)' }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(196,154,60,0.3)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(196,154,60,0.1)')}
              >
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider mb-2"
                  style={{ color: 'rgba(139,155,172,0.7)' }}>
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                  Önceki Haber
                </div>
                <p className="font-orbitron text-sm text-neon-cyan line-clamp-2 group-hover:text-white transition-colors">
                  {adjacent.previous.title}
                </p>
              </Link>
            ) : <div />}

            {adjacent.next ? (
              <Link
                href={`/news/${adjacent.next.slug}`}
                className="group block rounded-xl p-5 text-right transition-all hover:scale-[1.02] sm:col-start-2"
                style={{ background: 'rgba(12,12,22,0.8)', border: '1px solid rgba(196,154,60,0.1)' }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(196,154,60,0.3)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(196,154,60,0.1)')}
              >
                <div className="flex items-center justify-end gap-2 font-mono text-[10px] uppercase tracking-wider mb-2"
                  style={{ color: 'rgba(139,155,172,0.7)' }}>
                  Sonraki Haber
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </div>
                <p className="font-orbitron text-sm text-neon-cyan line-clamp-2 group-hover:text-white transition-colors">
                  {adjacent.next.title}
                </p>
              </Link>
            ) : <div />}
          </nav>
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
