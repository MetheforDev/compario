import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductById, getCategories, getAllSegments } from '@compario/database';
import { ProductForm } from '@/components/admin/ProductForm';
import { updateProductAction, deleteProductAction } from '../../actions';
import type { ProductInput } from '@compario/database';

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const product = await getProductById(params.id);
    return { title: product ? `Düzenle: ${product.name}` : 'Ürün Bulunamadı' };
  } catch {
    return { title: 'Düzenle' };
  }
}

export default async function EditProductPage({ params }: PageProps) {
  const [product, categories, allSegments] = await Promise.allSettled([
    getProductById(params.id),
    getCategories(false),
    getAllSegments(),
  ]).then(([p, c, s]) => [
    p.status === 'fulfilled' ? p.value : null,
    c.status === 'fulfilled' ? c.value : [],
    s.status === 'fulfilled' ? s.value : [],
  ]);

  if (!product) notFound();

  // Bind the product id into the update action
  async function updateAction(data: ProductInput) {
    'use server';
    return updateProductAction(params.id, data);
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <Link
            href="/admin/products"
            className="font-mono text-[10px] text-gray-600 hover:text-neon-cyan transition-colors uppercase tracking-widest"
          >
            ← Ürünler
          </Link>
          <h1 className="font-orbitron text-2xl font-black text-neon-cyan text-glow-cyan mt-3">
            ÜRÜN DÜZENLE
          </h1>
          <p className="font-mono text-xs text-gray-600 mt-1">{product.name}</p>
        </div>

        {/* Delete */}
        <form action={async () => {
          'use server';
          await deleteProductAction(params.id);
        }}>
          <button
            type="submit"
            className="px-4 py-2 font-mono text-[10px] uppercase tracking-wider border border-[rgba(255,0,110,0.3)]
                       text-[rgba(255,0,110,0.7)] rounded hover:border-neon-pink hover:text-neon-pink transition-all"
            onClick={(e) => {
              if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) e.preventDefault();
            }}
          >
            🗑 Ürünü Sil
          </button>
        </form>
      </div>

      <ProductForm
        categories={categories}
        allSegments={allSegments}
        product={product}
        action={updateAction}
        submitLabel="Değişiklikleri Kaydet"
      />
    </div>
  );
}
