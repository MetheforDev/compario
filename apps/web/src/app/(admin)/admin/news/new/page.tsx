import type { Metadata } from 'next';
import Link from 'next/link';
import { getProducts } from '@compario/database';
import { NewsForm } from '@/components/admin/NewsForm';
import { createNewsAction } from '../actions';

export const metadata: Metadata = { title: 'Yeni Haber' };

export default async function NewNewsPage() {
  let products: import('@compario/database').Product[] = [];
  try {
    products = await getProducts({ status: 'active', limit: 100 });
  } catch {
    // db not available
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link
          href="/admin/news"
          className="font-mono text-[10px] text-gray-600 hover:text-neon-cyan transition-colors uppercase tracking-widest"
        >
          ← Haberler
        </Link>
        <h1 className="font-orbitron text-2xl font-black text-neon-cyan text-glow-cyan mt-3">
          YENİ HABER EKLE
        </h1>
      </div>

      <NewsForm
        products={products}
        action={createNewsAction}
        submitLabel="Taslak Kaydet"
      />
    </div>
  );
}
