import type { Metadata } from 'next';
import Link from 'next/link';
import { getCategories } from '@compario/database';
import type { Category } from '@compario/database';

export const metadata: Metadata = {
  title: 'Categories',
  description: 'Browse all product categories on Compario.',
};

function CategoryRow({ category }: { category: Category }) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="card-neon p-5 flex items-center gap-5 group"
    >
      <span className="text-4xl w-12 text-center flex-shrink-0">
        {category.icon ?? '📦'}
      </span>
      <div className="flex-1 min-w-0">
        <h2 className="font-orbitron text-sm font-bold text-neon-cyan uppercase tracking-wider group-hover:text-glow-cyan transition-all">
          {category.name}
        </h2>
        {category.description && (
          <p className="text-xs text-gray-500 mt-1 truncate">{category.description}</p>
        )}
      </div>
      <span className="text-neon-purple font-mono text-xs opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        VIEW →
      </span>
    </Link>
  );
}

export default async function CategoriesPage() {
  let categories: Category[] = [];

  try {
    categories = await getCategories(true);
  } catch {
    // env vars may not be present at build time
  }

  return (
    <main className="min-h-screen bg-grid">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/"
            className="font-mono text-xs text-gray-600 hover:text-neon-cyan transition-colors uppercase tracking-widest"
          >
            ← Home
          </Link>
          <h1 className="font-orbitron text-3xl font-black text-neon-cyan text-glow-cyan mt-4">
            CATEGORIES
          </h1>
          <p className="text-gray-500 font-mono text-sm mt-2">
            {categories.length} categories available
          </p>
        </div>

        {/* List */}
        {categories.length === 0 ? (
          <div className="text-center py-20 text-gray-600 font-mono text-sm">
            [ NO CATEGORIES FOUND ]
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {categories.map((cat) => (
              <CategoryRow key={cat.id} category={cat} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
