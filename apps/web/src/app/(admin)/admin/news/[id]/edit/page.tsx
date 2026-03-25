import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getNewsArticleById, getProducts } from '@compario/database';
import { NewsForm } from '@/components/admin/NewsForm';
import { updateNewsAction } from '../../actions';
import { DeleteNewsButton } from '../../DeleteNewsButton';

export const metadata: Metadata = { title: 'Haber Düzenle' };

interface PageProps {
  params: { id: string };
}

export default async function EditNewsPage({ params }: PageProps) {
  let article: import('@compario/database').NewsArticle | null = null;
  let products: import('@compario/database').Product[] = [];

  try {
    [article, products] = await Promise.all([
      getNewsArticleById(params.id),
      getProducts({ status: 'active', limit: 100 }),
    ]);
  } catch {
    // db not available
  }

  if (!article) notFound();

  const boundAction = updateNewsAction.bind(null, params.id);

  return (
    <div className="p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <Link
            href="/admin/news"
            className="font-mono text-[10px] text-gray-600 hover:text-neon-cyan transition-colors uppercase tracking-widest"
          >
            ← Haberler
          </Link>
          <h1 className="font-orbitron text-2xl font-black text-neon-cyan text-glow-cyan mt-3">
            HABER DÜZENLE
          </h1>
          <p className="font-mono text-[10px] text-gray-600 mt-1">{article.slug}</p>
        </div>
        <div className="flex items-center gap-3 mt-6">
          {article.status === 'published' && (
            <Link
              href={`/news/${article.slug}`}
              target="_blank"
              className="px-3 py-1.5 border border-[rgba(0,255,247,0.2)] text-neon-cyan font-mono text-[10px] uppercase rounded hover:bg-neon-cyan/10 transition-colors"
            >
              Görüntüle ↗
            </Link>
          )}
          <DeleteNewsButton id={article.id} title={article.title} />
        </div>
      </div>

      <NewsForm
        initial={article}
        products={products}
        action={boundAction}
        submitLabel="Değişiklikleri Kaydet"
      />
    </div>
  );
}
