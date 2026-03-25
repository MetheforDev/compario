import Link from 'next/link';

const CATEGORY_LABELS: Record<string, string> = {
  'yeni-model': 'Yeni Model',
  test: 'Test',
  karsilastirma: 'Karşılaştırma',
  fiyat: 'Fiyat',
  teknoloji: 'Teknoloji',
  genel: 'Genel',
};

const CATEGORY_COLORS: Record<string, string> = {
  'yeni-model': 'text-neon-cyan bg-neon-cyan/10 border-neon-cyan/20',
  test: 'text-neon-green bg-neon-green/10 border-neon-green/20',
  karsilastirma: 'text-neon-purple bg-neon-purple/10 border-neon-purple/20',
  fiyat: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  teknoloji: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  genel: 'text-gray-400 bg-gray-400/10 border-gray-400/20',
};

interface NewsCardProps {
  article: {
    id: string;
    slug: string;
    title: string;
    excerpt?: string | null;
    cover_image?: string | null;
    category?: string | null;
    published_at?: string | null;
    view_count?: number;
  };
}

export function NewsCard({ article }: NewsCardProps) {
  const categoryColor = article.category
    ? (CATEGORY_COLORS[article.category] ?? CATEGORY_COLORS.genel)
    : CATEGORY_COLORS.genel;

  return (
    <Link
      href={`/news/${article.slug}`}
      className="group card-neon flex flex-col overflow-hidden hover:-translate-y-1 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative aspect-video bg-[#0c0c16] overflow-hidden flex-shrink-0">
        {article.cover_image ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.cover_image}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a26]/80 via-transparent to-transparent" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-mono text-3xl opacity-10">◈</span>
          </div>
        )}

        {/* Category badge overlay */}
        {article.category && (
          <div className="absolute top-3 left-3">
            <span className={`px-2 py-0.5 rounded border font-mono text-[10px] uppercase tracking-wider ${categoryColor}`}>
              {CATEGORY_LABELS[article.category] ?? article.category}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        <h3 className="font-orbitron text-sm font-bold text-gray-200 line-clamp-2 group-hover:text-neon-cyan transition-colors leading-snug">
          {article.title}
        </h3>

        {article.excerpt && (
          <p className="font-mono text-xs text-gray-600 line-clamp-2 leading-relaxed flex-1">
            {article.excerpt}
          </p>
        )}

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-[rgba(0,255,247,0.06)]">
          <span className="font-mono text-[10px] text-gray-700">
            {article.published_at
              ? new Date(article.published_at).toLocaleDateString('tr-TR', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : ''}
          </span>
          {article.view_count !== undefined && (
            <span className="font-mono text-[10px] text-gray-700">
              {article.view_count} görüntülenme
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
