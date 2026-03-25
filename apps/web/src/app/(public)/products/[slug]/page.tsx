import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductBySlug } from '@compario/database';
import type { Json } from '@compario/database';

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const product = await getProductBySlug(params.slug);
    if (!product) return { title: 'Product Not Found' };
    return {
      title: product.name,
      description: `Compare ${product.name} by ${product.brand}. Model: ${product.model}.`,
    };
  } catch {
    return { title: 'Product' };
  }
}

function SpecsTable({ specs }: { specs: Json }) {
  if (!specs || typeof specs !== 'object' || Array.isArray(specs)) return null;

  const entries = Object.entries(specs as Record<string, Json>);
  if (entries.length === 0) return null;

  return (
    <div className="card-neon p-6">
      <h2 className="font-orbitron text-xs text-neon-cyan uppercase tracking-widest mb-4">
        ⬡ Specifications
      </h2>
      <dl className="divide-y divide-[rgba(0,255,247,0.06)]">
        {entries.map(([key, value]) => (
          <div key={key} className="flex gap-4 py-2.5">
            <dt className="font-mono text-xs text-gray-500 uppercase tracking-wide w-40 flex-shrink-0">
              {key.replace(/_/g, ' ')}
            </dt>
            <dd className="font-mono text-xs text-gray-300 flex-1">
              {String(value ?? '—')}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default async function ProductPage({ params }: PageProps) {
  let product;

  try {
    product = await getProductBySlug(params.slug);
  } catch {
    notFound();
  }

  if (!product) notFound();

  const priceDisplay =
    product.price_min && product.price_max
      ? `$${product.price_min.toLocaleString()} – $${product.price_max.toLocaleString()}`
      : product.price_min
      ? `From $${product.price_min.toLocaleString()}`
      : 'Price unavailable';

  return (
    <main className="min-h-screen bg-grid">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 font-mono text-xs text-gray-600 mb-10">
          <Link href="/" className="hover:text-neon-cyan transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/categories" className="hover:text-neon-cyan transition-colors">
            Categories
          </Link>
          <span>/</span>
          <span className="text-gray-400">{product.name}</span>
        </nav>

        {/* Product header */}
        <div className="card-neon p-8 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div>
              <p className="font-mono text-xs text-neon-purple uppercase tracking-widest mb-2">
                {product.brand}
              </p>
              <h1 className="font-orbitron text-2xl sm:text-3xl font-black text-white mb-1">
                {product.name}
              </h1>
              <p className="font-mono text-sm text-gray-500">
                Model: {product.model}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-orbitron text-xl font-bold text-neon-green text-glow-green">
                {priceDisplay}
              </p>
              <span
                className={`inline-block mt-2 font-mono text-xs uppercase tracking-widest px-3 py-1 rounded border ${
                  product.status === 'active'
                    ? 'border-neon-green text-neon-green'
                    : 'border-gray-600 text-gray-600'
                }`}
              >
                {product.status}
              </span>
            </div>
          </div>
        </div>

        {/* Specs */}
        <SpecsTable specs={product.specs} />

        {/* Actions */}
        <div className="mt-6 flex gap-4">
          <Link href="/categories" className="btn-neon text-sm">
            ← Back
          </Link>
        </div>
      </div>
    </main>
  );
}
