import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getNewsArticleBySlug,
  getRelatedNews,
  incrementNewsView,
} from '@compario/database';
import { NewsCard } from '@/components/NewsCard';
import { ShareButtons } from '@/components/ShareButtons';
import { MarkdownContent } from '@/components/MarkdownContent';

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
    };
  } catch {
    return {};
  }
}

export default async function NewsDetailPage({ params }: PageProps) {
  let article: import('@compario/database').NewsArticle | null = null;
  let related: import('@compario/database').NewsArticle[] = [];

  try {
    article = await getNewsArticleBySlug(params.slug);
    if (article) {
      // Increment view count (fire & forget)
      incrementNewsView(article.id).catch(() => {});

      if (article.tags?.length) {
        related = await getRelatedNews(article.tags, article.id, 3);
      }
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
  const primaryCategory = allCategories[0] ?? null;
  const categoryColor = primaryCategory ? (CATEGORY_COLORS[primaryCategory] ?? CATEGORY_COLORS.genel) : '';

  return (
    <main className={`min-h-screen bg-grid ${!article.cover_image ? 'pt-20' : ''}`}>
      {/* Cover Image */}
      {article.cover_image && (
        <div className="w-full h-[400px] sm:h-[500px] relative overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.cover_image}
            alt={article.title}
            className="w-full h-full object-cover"
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
        <article>
          <MarkdownContent content={article.content} />
        </article>

        {/* Divider */}
        <div className="border-t border-[rgba(0,255,247,0.08)] mt-12 mb-8" />

        {/* Share */}
        <ShareButtons title={article.title} slug={article.slug} />

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
