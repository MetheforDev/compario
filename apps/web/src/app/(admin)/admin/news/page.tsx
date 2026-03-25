import type { Metadata } from 'next';
import Link from 'next/link';
import { getNewsArticles } from '@compario/database';
import { DeleteNewsButton } from './DeleteNewsButton';

export const metadata: Metadata = { title: 'Haberler' };

const CATEGORY_LABELS: Record<string, string> = {
  'yeni-model': 'Yeni Model',
  test: 'Test',
  karsilastirma: 'Karşılaştırma',
  fiyat: 'Fiyat',
  teknoloji: 'Teknoloji',
  genel: 'Genel',
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'Taslak',
  published: 'Yayında',
  archived: 'Arşiv',
};

const STATUS_COLORS: Record<string, string> = {
  draft: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  published: 'text-neon-cyan bg-neon-cyan/10 border-neon-cyan/20',
  archived: 'text-gray-500 bg-gray-500/10 border-gray-500/20',
};

interface PageProps {
  searchParams: {
    category?: string;
    status?: string;
    featured?: string;
    page?: string;
  };
}

const PER_PAGE = 20;

export default async function NewsPage({ searchParams }: PageProps) {
  const page = Math.max(1, Number(searchParams.page ?? 1));
  const offset = (page - 1) * PER_PAGE;

  let articles: import('@compario/database').NewsArticle[] = [];
  let total = 0;

  try {
    const result = await getNewsArticles({
      category: searchParams.category,
      status: searchParams.status || undefined,
      featured: searchParams.featured === 'true' ? true : undefined,
      limit: PER_PAGE,
      offset,
    });
    articles = result.data;
    total = result.total;
  } catch {
    // db not available
  }

  const buildQuery = (extra: Record<string, string>) => {
    const params = new URLSearchParams();
    if (searchParams.category) params.set('category', searchParams.category);
    if (searchParams.status) params.set('status', searchParams.status);
    if (searchParams.featured) params.set('featured', searchParams.featured);
    Object.entries(extra).forEach(([k, v]) => v ? params.set(k, v) : params.delete(k));
    const str = params.toString();
    return str ? `?${str}` : '';
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="font-mono text-[10px] text-neon-purple uppercase tracking-[0.4em] opacity-60 mb-1">
            Admin
          </p>
          <h1 className="font-orbitron text-3xl font-black text-neon-cyan text-glow-cyan">
            HABERLER
          </h1>
          <p className="font-mono text-xs text-gray-600 mt-1">
            {total} haber
          </p>
        </div>
        <Link href="/admin/news/new" className="btn-neon">
          + Yeni Haber
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Status filter */}
        <div className="flex gap-2 items-center">
          <span className="font-mono text-[10px] text-gray-600 uppercase tracking-wider">Durum:</span>
          {['', 'draft', 'published', 'archived'].map((s) => (
            <Link
              key={s}
              href={`/admin/news${buildQuery({ status: s, page: '1' })}`}
              className={`px-3 py-1 rounded border font-mono text-[10px] uppercase tracking-wider transition-colors ${
                (searchParams.status ?? '') === s
                  ? 'border-neon-cyan text-neon-cyan bg-neon-cyan/10'
                  : 'border-[rgba(0,255,247,0.1)] text-gray-500 hover:text-neon-cyan hover:border-neon-cyan/40'
              }`}
            >
              {s === '' ? 'Tümü' : STATUS_LABELS[s]}
            </Link>
          ))}
        </div>

        {/* Category filter */}
        <div className="flex gap-2 items-center flex-wrap">
          <span className="font-mono text-[10px] text-gray-600 uppercase tracking-wider">Kategori:</span>
          {['', 'yeni-model', 'test', 'karsilastirma', 'fiyat', 'teknoloji', 'genel'].map((c) => (
            <Link
              key={c}
              href={`/admin/news${buildQuery({ category: c, page: '1' })}`}
              className={`px-3 py-1 rounded border font-mono text-[10px] uppercase tracking-wider transition-colors ${
                (searchParams.category ?? '') === c
                  ? 'border-neon-purple text-neon-purple bg-neon-purple/10'
                  : 'border-[rgba(183,36,255,0.1)] text-gray-500 hover:text-neon-purple hover:border-neon-purple/40'
              }`}
            >
              {c === '' ? 'Tümü' : CATEGORY_LABELS[c]}
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      {articles.length === 0 ? (
        <div className="text-center py-24 border border-[rgba(0,255,247,0.08)] rounded-lg">
          <p className="font-mono text-xs text-gray-600 uppercase tracking-widest">
            [ HABER BULUNAMADI ]
          </p>
          <Link href="/admin/news/new" className="btn-neon mt-6 inline-block">
            İlk Haberi Ekle
          </Link>
        </div>
      ) : (
        <div className="border border-[rgba(0,255,247,0.08)] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(0,255,247,0.08)] bg-[rgba(0,255,247,0.02)]">
                <th className="text-left px-4 py-3 font-mono text-[10px] text-gray-600 uppercase tracking-wider">Başlık</th>
                <th className="text-left px-4 py-3 font-mono text-[10px] text-gray-600 uppercase tracking-wider">Kategori</th>
                <th className="text-left px-4 py-3 font-mono text-[10px] text-gray-600 uppercase tracking-wider">Durum</th>
                <th className="text-left px-4 py-3 font-mono text-[10px] text-gray-600 uppercase tracking-wider">Öne Çıkan</th>
                <th className="text-left px-4 py-3 font-mono text-[10px] text-gray-600 uppercase tracking-wider">Görüntülenme</th>
                <th className="text-left px-4 py-3 font-mono text-[10px] text-gray-600 uppercase tracking-wider">Yayın Tarihi</th>
                <th className="text-right px-4 py-3 font-mono text-[10px] text-gray-600 uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article, i) => (
                <tr
                  key={article.id}
                  className={`border-b border-[rgba(0,255,247,0.04)] hover:bg-[rgba(0,255,247,0.02)] transition-colors ${
                    i % 2 === 0 ? '' : 'bg-[rgba(0,0,0,0.1)]'
                  }`}
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-mono text-xs text-gray-300 line-clamp-1">{article.title}</p>
                      <p className="font-mono text-[10px] text-gray-600 mt-0.5">{article.slug}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {article.category && (
                      <span className="px-2 py-0.5 rounded border border-neon-purple/20 text-neon-purple bg-neon-purple/10 font-mono text-[10px] uppercase">
                        {CATEGORY_LABELS[article.category] ?? article.category}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded border font-mono text-[10px] uppercase ${STATUS_COLORS[article.status] ?? STATUS_COLORS.draft}`}>
                      {STATUS_LABELS[article.status] ?? article.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-mono text-xs ${article.is_featured ? 'text-neon-cyan' : 'text-gray-700'}`}>
                      {article.is_featured ? '★' : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-gray-500">{article.view_count}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-[10px] text-gray-500">
                      {article.published_at
                        ? new Date(article.published_at).toLocaleDateString('tr-TR')
                        : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <Link
                        href={`/admin/news/${article.id}/edit`}
                        className="px-3 py-1 border border-[rgba(0,255,247,0.2)] text-neon-cyan font-mono text-[10px] uppercase rounded hover:bg-neon-cyan/10 transition-colors"
                      >
                        Düzenle
                      </Link>
                      <DeleteNewsButton id={article.id} title={article.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {(articles.length === PER_PAGE || page > 1) && (
        <div className="mt-6 flex gap-3 justify-end">
          {page > 1 && (
            <Link href={`/admin/news${buildQuery({ page: String(page - 1) })}`} className="btn-neon text-xs py-1.5 px-4">
              ← Önceki
            </Link>
          )}
          {articles.length === PER_PAGE && (
            <Link href={`/admin/news${buildQuery({ page: String(page + 1) })}`} className="btn-neon text-xs py-1.5 px-4">
              Sonraki →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
