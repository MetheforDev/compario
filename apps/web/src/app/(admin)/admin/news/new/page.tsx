import type { Metadata } from 'next';
import Link from 'next/link';
import { getProducts } from '@compario/database';
import { NewsForm } from '@/components/admin/NewsForm';
import { createNewsAction } from '../actions';

export const metadata: Metadata = { title: 'Yeni Haber' };

interface Props {
  searchParams: { title?: string; source?: string; source_url?: string };
}

export default async function NewNewsPage({ searchParams }: Props) {
  let products: import('@compario/database').Product[] = [];
  try {
    products = await getProducts({ status: 'active', limit: 100 });
  } catch {
    // db not available
  }

  // Pre-fill from Haber Akışı "Haber Yaz" quick action
  const prefill = {
    title: searchParams.title ?? '',
    source_url: searchParams.source_url ?? '',
    source_name: searchParams.source ?? '',
  };

  const fromFeed = !!(prefill.title || prefill.source_url);

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link
          href={fromFeed ? '/admin/feed' : '/admin/news'}
          className="font-mono text-[10px] text-gray-600 hover:text-neon-cyan transition-colors uppercase tracking-widest"
        >
          ← {fromFeed ? 'Haber Akışı' : 'Haberler'}
        </Link>
        <h1 className="font-orbitron text-2xl font-black text-neon-cyan text-glow-cyan mt-3">
          YENİ HABER EKLE
        </h1>
        {fromFeed && (
          <p className="font-mono text-[10px] text-neon-purple mt-1 opacity-70">
            ◈ Haber Akışı&apos;ndan aktarıldı
            {prefill.source_name ? ` — ${prefill.source_name}` : ''}
          </p>
        )}
      </div>

      <NewsForm
        products={products}
        action={createNewsAction}
        submitLabel="Taslak Kaydet"
        prefill={prefill}
      />
    </div>
  );
}
