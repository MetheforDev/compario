import Link from 'next/link';
import type { Category, Segment } from '@compario/database';

const SORT_OPTIONS = [
  { value: 'newest',     label: 'En Yeni'  },
  { value: 'price_asc',  label: 'Fiyat ↑'  },
  { value: 'price_desc', label: 'Fiyat ↓'  },
  { value: 'name_asc',   label: 'İsim A→Z' },
] as const;

interface Props {
  slug: string;
  category: Category;
  parentCategory: Category | null;
  subCategories: Category[];
  segments: Segment[];
  brands: { brand: string; count: number }[];
  activeBrand: string;
  activeSegment: string;
  activeSort: string;
}

function buildHref(
  slug: string,
  opts: { brand?: string; segment?: string; sort?: string },
) {
  const params = new URLSearchParams();
  if (opts.brand)   params.set('brand',   opts.brand);
  if (opts.segment) params.set('segment', opts.segment);
  if (opts.sort && opts.sort !== 'newest') params.set('sort', opts.sort);
  const qs = params.toString();
  return `/categories/${slug}${qs ? `?${qs}` : ''}`;
}

export function CategorySidebar({
  slug,
  category,
  parentCategory,
  subCategories,
  segments,
  brands,
  activeBrand,
  activeSegment,
  activeSort,
}: Props) {
  const hasFilters = !!(activeBrand || activeSegment || activeSort !== 'newest');

  return (
    <nav className="flex flex-col gap-6 text-sm">
      {/* ── Kategori Ağacı ── */}
      <div>
        <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-neon-purple opacity-60 mb-3">
          ⬡ Kategoriler
        </p>

        {parentCategory && (
          <Link
            href={`/categories/${parentCategory.slug}`}
            className="flex items-center gap-1.5 font-mono text-[10px] text-gray-500 hover:text-neon-cyan transition-colors mb-2 uppercase tracking-wider"
          >
            <span>←</span> {parentCategory.name}
          </Link>
        )}

        <div className="flex flex-col gap-0.5">
          {/* Current category */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{
              background: 'rgba(0,255,247,0.06)',
              border: '1px solid rgba(0,255,247,0.15)',
            }}
          >
            {(() => {
              const isLogo = category.image_url &&
                (category.image_url.includes('simpleicons.org') || category.image_url.endsWith('.svg'));
              return isLogo ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={category.image_url!} alt={category.name} className="w-4 h-4 object-contain opacity-80" />
              ) : category.icon ? (
                <span className="text-base">{category.icon}</span>
              ) : null;
            })()}
            <span className="font-orbitron text-[10px] font-bold text-neon-cyan uppercase tracking-wider">
              {category.name}
            </span>
          </div>

          {/* Subcategories */}
          {subCategories.map((sub) => {
            const isLogo = sub.image_url &&
              (sub.image_url.includes('simpleicons.org') || sub.image_url.endsWith('.svg'));
            return (
              <Link
                key={sub.id}
                href={`/categories/${sub.slug}`}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-[10px] text-gray-500 hover:text-gray-200 hover:bg-white/5 transition-all uppercase tracking-wider ml-3"
              >
                {isLogo ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={sub.image_url!} alt={sub.name} className="w-4 h-4 object-contain opacity-70" />
                ) : sub.icon ? (
                  <span className="text-sm">{sub.icon}</span>
                ) : null}
                {sub.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Aktif Filtreler ── */}
      {hasFilters && (
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-amber-500/60 mb-2">
            ◆ Aktif Filtreler
          </p>
          <Link
            href={`/categories/${slug}`}
            className="inline-flex items-center gap-1.5 font-mono text-[9px] px-3 py-1.5 rounded-full transition-all"
            style={{
              background: 'rgba(196,154,60,0.08)',
              border: '1px solid rgba(196,154,60,0.25)',
              color: '#C49A3C',
            }}
          >
            ✕ Tümünü Temizle
          </Link>
        </div>
      )}

      {/* ── Marka Filtresi ── */}
      {brands.length > 0 && (
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-neon-purple opacity-60 mb-3">
            ◈ Marka
          </p>
          <div className="flex flex-col gap-0.5">
            {/* Tümü */}
            <Link
              href={buildHref(slug, { segment: activeSegment, sort: activeSort })}
              className="flex items-center justify-between px-3 py-1.5 rounded-lg transition-all"
              style={{
                background: !activeBrand ? 'rgba(0,255,247,0.06)' : 'transparent',
                border: !activeBrand ? '1px solid rgba(0,255,247,0.12)' : '1px solid transparent',
              }}
            >
              <span
                className="font-mono text-[10px] uppercase tracking-wider"
                style={{ color: !activeBrand ? '#00fff7' : '#6b7280' }}
              >
                Tümü
              </span>
              <span
                className="font-mono text-[9px] px-1.5 py-0.5 rounded"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#4b5563' }}
              >
                {brands.reduce((s, b) => s + b.count, 0)}
              </span>
            </Link>

            {brands.map(({ brand, count }) => {
              const isActive = activeBrand.toLowerCase() === brand.toLowerCase();
              return (
                <Link
                  key={brand}
                  href={buildHref(slug, { brand, segment: activeSegment, sort: activeSort })}
                  className="flex items-center justify-between px-3 py-1.5 rounded-lg transition-all"
                  style={{
                    background: isActive ? 'rgba(0,255,247,0.06)' : 'transparent',
                    border: isActive ? '1px solid rgba(0,255,247,0.12)' : '1px solid transparent',
                  }}
                >
                  <span
                    className="font-mono text-[10px] uppercase tracking-wider"
                    style={{ color: isActive ? '#00fff7' : '#6b7280' }}
                  >
                    {brand}
                  </span>
                  <span
                    className="font-mono text-[9px] px-1.5 py-0.5 rounded"
                    style={{ background: 'rgba(255,255,255,0.05)', color: '#4b5563' }}
                  >
                    {count}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Segment Filtresi ── */}
      {segments.length > 0 && (
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-neon-purple opacity-60 mb-3">
            ◈ Segment
          </p>
          <div className="flex flex-col gap-0.5">
            <Link
              href={buildHref(slug, { brand: activeBrand, sort: activeSort })}
              className="flex items-center px-3 py-1.5 rounded-lg transition-all"
              style={{
                background: !activeSegment ? 'rgba(196,154,60,0.06)' : 'transparent',
                border: !activeSegment ? '1px solid rgba(196,154,60,0.15)' : '1px solid transparent',
              }}
            >
              <span
                className="font-mono text-[10px] uppercase tracking-wider"
                style={{ color: !activeSegment ? '#C49A3C' : '#6b7280' }}
              >
                Tümü
              </span>
            </Link>
            {segments.map((seg) => {
              const isActive = activeSegment === seg.slug;
              return (
                <Link
                  key={seg.id}
                  href={buildHref(slug, { brand: activeBrand, segment: seg.slug, sort: activeSort })}
                  className="flex items-center px-3 py-1.5 rounded-lg transition-all"
                  style={{
                    background: isActive ? 'rgba(196,154,60,0.06)' : 'transparent',
                    border: isActive ? '1px solid rgba(196,154,60,0.15)' : '1px solid transparent',
                  }}
                >
                  <span
                    className="font-mono text-[10px] uppercase tracking-wider"
                    style={{ color: isActive ? '#C49A3C' : '#6b7280' }}
                  >
                    {seg.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Sıralama ── */}
      <div>
        <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-neon-purple opacity-60 mb-3">
          ↕ Sıralama
        </p>
        <div className="flex flex-col gap-0.5">
          {SORT_OPTIONS.map((opt) => {
            const isActive = activeSort === opt.value;
            return (
              <Link
                key={opt.value}
                href={buildHref(slug, { brand: activeBrand, segment: activeSegment, sort: opt.value })}
                className="flex items-center px-3 py-1.5 rounded-lg transition-all"
                style={{
                  background: isActive ? 'rgba(139,155,172,0.08)' : 'transparent',
                  border: isActive ? '1px solid rgba(139,155,172,0.15)' : '1px solid transparent',
                }}
              >
                <span
                  className="font-mono text-[10px] uppercase tracking-wider"
                  style={{ color: isActive ? '#8B9BAC' : '#4b5563' }}
                >
                  {opt.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
