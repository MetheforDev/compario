import type { Metadata } from 'next';
import Link from 'next/link';
import { getProducts, getCategories } from '@compario/database';
import type { ProductStatus, Product, Category } from '@compario/database';
import { ProductTable } from '@/components/admin/ProductTable';
import { ProductFilters } from './ProductFilters';

export const metadata: Metadata = { title: 'Ürünler' };

interface PageProps {
  searchParams: {
    category?: string;
    status?: string;
    page?: string;
  };
}

const PER_PAGE = 20;

export default async function ProductsPage({ searchParams }: PageProps) {
  const page     = Math.max(1, Number(searchParams.page ?? 1));
  const offset   = (page - 1) * PER_PAGE;

  const validStatuses: ProductStatus[] = ['active', 'inactive', 'draft'];
  const statusFilter = validStatuses.includes(searchParams.status as ProductStatus)
    ? (searchParams.status as ProductStatus)
    : undefined;

  const [products, categories] = await Promise.allSettled([
    getProducts({
      category:    searchParams.category,
      status:      statusFilter,
      limit:       PER_PAGE,
      offset,
    }),
    getCategories(false),
  ]).then(([p, c]) => [
    p.status === 'fulfilled' ? p.value : [],
    c.status === 'fulfilled' ? c.value : [],
  ] as [Product[], Category[]]);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="font-mono text-[10px] text-neon-purple uppercase tracking-[0.4em] opacity-60 mb-1">
            Admin
          </p>
          <h1 className="font-orbitron text-3xl font-black text-neon-cyan text-glow-cyan">
            ÜRÜNLER
          </h1>
          <p className="font-mono text-xs text-gray-600 mt-1">
            {products.length} ürün listeleniyor
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/products/import" className="btn-neon-purple text-sm">
            CSV Import
          </Link>
          <Link href="/admin/products/new" className="btn-neon">
            + Yeni Ürün
          </Link>
        </div>
      </div>

      {/* Filters */}
      <ProductFilters categories={categories} currentParams={searchParams} />

      {/* Table */}
      <ProductTable products={products} />

      {/* Pagination */}
      {products.length === PER_PAGE && (
        <div className="mt-6 flex gap-3 justify-end">
          {page > 1 && (
            <Link
              href={`/admin/products?page=${page - 1}${searchParams.category ? `&category=${searchParams.category}` : ''}${searchParams.status ? `&status=${searchParams.status}` : ''}`}
              className="btn-neon text-xs py-1.5 px-4"
            >
              ← Önceki
            </Link>
          )}
          <Link
            href={`/admin/products?page=${page + 1}${searchParams.category ? `&category=${searchParams.category}` : ''}${searchParams.status ? `&status=${searchParams.status}` : ''}`}
            className="btn-neon text-xs py-1.5 px-4"
          >
            Sonraki →
          </Link>
        </div>
      )}
    </div>
  );
}
