import type { Metadata } from 'next';
import Link from 'next/link';
import { getCategories, getAllSegments } from '@compario/database';
import type { Category, Segment } from '@compario/database';
import { ProductForm } from '@/components/admin/ProductForm';
import { createProductAction } from '../actions';

export const metadata: Metadata = { title: 'Yeni Ürün' };

export default async function NewProductPage() {
  const [categories, allSegments] = await Promise.allSettled([
    getCategories(false),
    getAllSegments(),
  ]).then(([c, s]) => [
    c.status === 'fulfilled' ? c.value : [],
    s.status === 'fulfilled' ? s.value : [],
  ] as [Category[], Segment[]]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link
          href="/admin/products"
          className="font-mono text-[10px] text-gray-600 hover:text-neon-cyan transition-colors uppercase tracking-widest"
        >
          ← Ürünler
        </Link>
        <h1 className="font-orbitron text-2xl font-black text-neon-cyan text-glow-cyan mt-3">
          YENİ ÜRÜN EKLE
        </h1>
      </div>

      <ProductForm
        categories={categories}
        allSegments={allSegments}
        action={createProductAction}
        submitLabel="Ürünü Kaydet"
      />
    </div>
  );
}
