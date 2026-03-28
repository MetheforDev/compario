'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { NewsArticle, NewsArticleInput, Product } from '@compario/database';
import { MarkdownContent } from '@/components/MarkdownContent';
import { TiptapEditor } from '@/components/admin/TiptapEditor';

const CATEGORIES = [
  { value: 'yeni-model', label: 'Yeni Model' },
  { value: 'test', label: 'Test & İnceleme' },
  { value: 'karsilastirma', label: 'Karşılaştırma' },
  { value: 'fiyat', label: 'Fiyat Güncelleme' },
  { value: 'teknoloji', label: 'Teknoloji' },
  { value: 'genel', label: 'Genel' },
];

function makeCompareTemplate(count: number): string {
  const products = Array.from({ length: count }, (_, i) => ({
    name: `Ürün ${i + 1}`,
    price: '0 ₺',
    badge: i === 0 ? 'Önerilen' : '',
    winner: i === 0,
    specs: [
      { label: 'Motor', value: '-', better: i === 0 },
      { label: '0-100 km/s', value: '-', better: false },
      { label: 'Fiyat/Perf.', value: '-', better: i === 0 },
    ],
  }));
  return '```compare\n' + JSON.stringify({ products, verdict: 'Sonuç açıklaması...' }, null, 2) + '\n```';
}

function slugify(text: string): string {
  const trMap: Record<string, string> = {
    ç: 'c', Ç: 'c', ğ: 'g', Ğ: 'g', ı: 'i', İ: 'i',
    ö: 'o', Ö: 'o', ş: 's', Ş: 's', ü: 'u', Ü: 'u',
  };
  return text
    .split('')
    .map((c) => trMap[c] ?? c)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

interface NewsFormProps {
  initial?: Partial<NewsArticle & { categories?: string[] | null }>;
  products?: Product[];
  action: (data: Partial<NewsArticleInput>) => Promise<{ error?: string }>;
  submitLabel?: string;
}

export function NewsForm({ initial = {}, products = [], action, submitLabel = 'Kaydet' }: NewsFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const [title, setTitle] = useState(initial.title ?? '');
  const [slug, setSlug] = useState(initial.slug ?? '');
  const [slugManual, setSlugManual] = useState(!!initial.slug);

  const initialCategories: string[] =
    initial.categories?.length
      ? initial.categories
      : initial.category
      ? [initial.category]
      : [];
  const [categories, setCategories] = useState<string[]>(initialCategories);

  const [coverImage, setCoverImage] = useState(initial.cover_image ?? '');
  const [imagesRaw, setImagesRaw] = useState((initial.images ?? []).join('\n'));
  const [excerpt, setExcerpt] = useState(initial.excerpt ?? '');
  const [content, setContent] = useState(initial.content ?? '');
  const [tagsRaw, setTagsRaw] = useState((initial.tags ?? []).join(', '));
  const [author, setAuthor] = useState(initial.author ?? '');
  const [status, setStatus] = useState(initial.status ?? 'draft');
  const [isFeatured, setIsFeatured] = useState(initial.is_featured ?? false);
  const [publishedAt, setPublishedAt] = useState(
    initial.published_at ? initial.published_at.slice(0, 16) : '',
  );
  const [metaTitle, setMetaTitle] = useState(initial.meta_title ?? '');
  const [metaDesc, setMetaDesc] = useState(initial.meta_description ?? '');
  const [relatedIds, setRelatedIds] = useState<string[]>(initial.related_product_ids ?? []);

  const galleryImages = imagesRaw
    .split('\n')
    .map((u) => u.trim())
    .filter(Boolean);

  const isComparison = categories.includes('karsilastirma');

  function toggleCategory(value: string) {
    setCategories((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value],
    );
  }

  function insertTemplate(count: number) {
    const tpl = makeCompareTemplate(count);
    setContent((prev) => (prev ? `${prev}\n\n${tpl}` : tpl));
    setShowPreview(false);
  }

  function handleTitleChange(val: string) {
    setTitle(val);
    if (!slugManual) setSlug(slugify(val));
  }

  function handleSubmit(publishNow?: boolean) {
    const tags = tagsRaw.split(',').map((t) => t.trim()).filter(Boolean);

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      category: categories[0] ?? undefined,
      categories: categories.length ? categories : undefined,
      cover_image: coverImage.trim() || undefined,
      images: galleryImages.length ? galleryImages : undefined,
      excerpt: excerpt.trim() || undefined,
      content: content.trim(),
      tags,
      author: author.trim() || undefined,
      status: publishNow ? 'published' : status,
      is_featured: isFeatured,
      published_at: publishNow
        ? new Date().toISOString()
        : publishedAt
        ? new Date(publishedAt).toISOString()
        : undefined,
      meta_title: metaTitle.trim() || undefined,
      meta_description: metaDesc.trim() || undefined,
      related_product_ids: relatedIds.length ? relatedIds : undefined,
      source: 'manual',
    };

    startTransition(async () => {
      setError(null);
      const result = await action(payload as Partial<NewsArticleInput>);
      if (result?.error) setError(result.error);
    });
  }

  const inputClass =
    'w-full bg-[#0c0c16] border border-[rgba(0,255,247,0.15)] rounded px-3 py-2.5 font-mono text-xs text-gray-300 placeholder-gray-700 focus:outline-none focus:border-neon-cyan/50 transition-colors';
  const labelClass = 'block font-mono text-[10px] text-gray-600 uppercase tracking-wider mb-1.5';

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-8">
      {error && (
        <div className="border border-red-500/30 bg-red-500/10 rounded px-4 py-3 font-mono text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Main info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className={labelClass}>Başlık *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Haber başlığı..."
              className={inputClass}
            />
          </div>

          {/* Slug */}
          <div>
            <label className={labelClass}>Slug</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={slug}
                onChange={(e) => { setSlug(e.target.value); setSlugManual(true); }}
                placeholder="url-slug"
                className={`${inputClass} flex-1`}
              />
              {slugManual && (
                <button
                  type="button"
                  onClick={() => { setSlug(slugify(title)); setSlugManual(false); }}
                  className="px-3 border border-[rgba(0,255,247,0.15)] rounded font-mono text-[10px] text-gray-600 hover:text-neon-cyan transition-colors"
                >
                  Auto
                </button>
              )}
            </div>
          </div>

          {/* Categories — multi-select checkboxes */}
          <div>
            <label className={labelClass}>
              Kategoriler
              <span className="ml-2 text-gray-700 normal-case tracking-normal">
                ({categories.length} seçili)
              </span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => {
                const active = categories.includes(cat.value);
                return (
                  <label
                    key={cat.value}
                    className={`flex items-center gap-2 px-3 py-2 rounded border cursor-pointer transition-all select-none ${
                      active
                        ? 'border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan'
                        : 'border-[rgba(0,255,247,0.1)] text-gray-500 hover:border-neon-cyan/30 hover:text-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => toggleCategory(cat.value)}
                      className="accent-[#00fff7] w-3.5 h-3.5 flex-shrink-0"
                    />
                    <span className="font-mono text-[11px]">{cat.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Author */}
          <div>
            <label className={labelClass}>Yazar</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Yazar adı..."
              className={inputClass}
            />
          </div>

          {/* Cover Image */}
          <div>
            <label className={labelClass}>Kapak Görseli URL</label>
            <input
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://..."
              className={inputClass}
            />
            {coverImage && (
              <div className="mt-2 rounded overflow-hidden border border-[rgba(0,255,247,0.1)] aspect-video bg-[#0c0c16]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverImage} alt="kapak önizleme" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Image Gallery */}
          <div>
            <label className={labelClass}>
              Görsel Galerisi
              <span className="ml-2 text-gray-700 normal-case tracking-normal">
                ({galleryImages.length} görsel)
              </span>
            </label>
            <p className="font-mono text-[10px] text-gray-700 mb-2">
              Her satıra bir URL — haber sayfasında galeri olarak gösterilir
            </p>
            <textarea
              value={imagesRaw}
              onChange={(e) => setImagesRaw(e.target.value)}
              rows={4}
              placeholder={`https://example.com/image1.jpg\nhttps://example.com/image2.jpg`}
              className={`${inputClass} resize-none font-mono text-xs`}
            />
            {galleryImages.length > 0 && (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {galleryImages.map((url, i) => (
                  <div key={i} className="relative aspect-video bg-[#0c0c16] rounded overflow-hidden border border-[rgba(0,255,247,0.08)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Galeri ${i + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.style.borderColor = 'rgba(255,0,110,0.4)';
                      }}
                    />
                    <span className="absolute bottom-1 right-1 font-mono text-[9px] text-gray-600 bg-black/60 px-1 rounded">
                      {i + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {/* Tags */}
          <div>
            <label className={labelClass}>Etiketler (virgülle ayır)</label>
            <input
              type="text"
              value={tagsRaw}
              onChange={(e) => setTagsRaw(e.target.value)}
              placeholder="2026, suv, elektrikli, kia"
              className={inputClass}
            />
          </div>

          {/* Status */}
          <div>
            <label className={labelClass}>Durum</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
              <option value="draft">Taslak</option>
              <option value="published">Yayında</option>
              <option value="archived">Arşiv</option>
            </select>
          </div>

          {/* Published At */}
          <div>
            <label className={labelClass}>Yayın Tarihi</label>
            <input
              type="datetime-local"
              value={publishedAt}
              onChange={(e) => setPublishedAt(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Is Featured */}
          <div className="flex items-center gap-3 p-3 border border-[rgba(0,255,247,0.1)] rounded">
            <input
              type="checkbox"
              id="is_featured"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="accent-[#00fff7] w-4 h-4"
            />
            <label htmlFor="is_featured" className="font-mono text-xs text-gray-400 cursor-pointer">
              Ana sayfada öne çıkar
            </label>
          </div>

          {/* Related Products */}
          {products.length > 0 && (
            <div>
              <label className={labelClass}>İlgili Ürünler</label>
              <div className="border border-[rgba(0,255,247,0.1)] rounded max-h-36 overflow-y-auto">
                {products.map((p) => (
                  <label key={p.id} className="flex items-center gap-2 px-3 py-2 hover:bg-[rgba(0,255,247,0.03)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={relatedIds.includes(p.id)}
                      onChange={(e) => {
                        if (e.target.checked) setRelatedIds([...relatedIds, p.id]);
                        else setRelatedIds(relatedIds.filter((id) => id !== p.id));
                      }}
                      className="accent-[#00fff7]"
                    />
                    <span className="font-mono text-[10px] text-gray-400">{p.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Excerpt */}
      <div>
        <label className={labelClass}>Kısa Özet ({excerpt.length}/200)</label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value.slice(0, 200))}
          rows={3}
          placeholder="Haberin kısa özeti (200 karakter)..."
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Content with preview toggle */}
      <div>
        <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
          <label className={labelClass} style={{ marginBottom: 0 }}>İçerik * (Markdown)</label>
          <button
            type="button"
            onClick={() => setShowPreview((p) => !p)}
            className="font-mono text-[10px] text-neon-cyan hover:text-neon-purple transition-colors uppercase tracking-wider"
          >
            {showPreview ? '📝 Düzenle' : '👁 Önizleme'}
          </button>
        </div>

        {/* Comparison templates — shown only when karsilastirma category is selected */}
        {isComparison && !showPreview && (
          <div className="mb-3 p-3 border border-[rgba(183,36,255,0.25)] rounded bg-[rgba(183,36,255,0.04)]">
            <p className="font-mono text-[10px] text-neon-purple uppercase tracking-wider mb-2">
              ◈ Karşılaştırma Şablonları
            </p>
            <div className="flex gap-2 flex-wrap">
              {[2, 3, 4].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => insertTemplate(n)}
                  className="px-3 py-1.5 border border-neon-purple/40 rounded font-mono text-[11px] text-neon-purple hover:bg-neon-purple/10 transition-colors"
                >
                  + {n} Ürün Karşılaştırması
                </button>
              ))}
            </div>
            <p className="font-mono text-[10px] text-gray-700 mt-2">
              Şablon içeriğin sonuna eklenir — JSON'u düzenleyerek gerçek ürün bilgilerini girin
            </p>
          </div>
        )}

        {showPreview ? (
          <div className="w-full min-h-[300px] bg-[#0c0c16] border border-[rgba(0,255,247,0.15)] rounded px-4 py-3">
            <MarkdownContent content={content} />
          </div>
        ) : (
          <TiptapEditor
            value={content}
            onChange={setContent}
            placeholder="# Başlık&#10;&#10;Haber içeriğinizi buraya yazın..."
          />
        )}
      </div>

      {/* SEO */}
      <div className="border border-[rgba(183,36,255,0.15)] rounded p-4 space-y-4">
        <h3 className="font-orbitron text-xs text-neon-purple uppercase tracking-wider">SEO</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>
              Meta Başlık
              <span className={`ml-2 font-mono text-[10px] ${(metaTitle || title).length > 60 ? 'text-red-400' : (metaTitle || title).length > 50 ? 'text-yellow-400' : 'text-gray-600'}`}>
                {(metaTitle || title).length}/60
              </span>
            </label>
            <input
              type="text"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder="SEO başlığı (boş = haber başlığı)"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              Meta Açıklama
              <span className={`ml-2 font-mono text-[10px] ${(metaDesc || excerpt).length > 160 ? 'text-red-400' : (metaDesc || excerpt).length > 140 ? 'text-yellow-400' : 'text-gray-600'}`}>
                {(metaDesc || excerpt).length}/160
              </span>
            </label>
            <input
              type="text"
              value={metaDesc}
              onChange={(e) => setMetaDesc(e.target.value)}
              placeholder="SEO açıklaması (boş = kısa özet)"
              className={inputClass}
            />
          </div>
        </div>

        {/* Google Preview */}
        <div className="mt-2">
          <p className="font-mono text-[10px] text-gray-700 uppercase tracking-wider mb-2">Google Önizleme</p>
          <div className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-white/[0.02] p-4">
            {/* URL */}
            <p className="font-sans text-xs text-[#006621] mb-0.5 truncate">
              compario.tech › news › <span className="opacity-70">{slug || 'haber-slug'}</span>
            </p>
            {/* Title */}
            <p className="font-sans text-base text-[#1a0dab] leading-snug mb-1 line-clamp-1 hover:underline cursor-default"
              style={{ color: '#8ab4f8' }}>
              {(metaTitle || title || 'Haber Başlığı').slice(0, 60)}
              {(metaTitle || title).length > 60 && <span className="text-red-400">…</span>}
            </p>
            {/* Description */}
            <p className="font-sans text-sm leading-snug line-clamp-2" style={{ color: '#bdc1c6' }}>
              {(metaDesc || excerpt || 'Meta açıklama buraya gelecek. Haberin kısa özetini yazın.').slice(0, 160)}
              {(metaDesc || excerpt).length > 160 && <span className="text-red-400">…</span>}
            </p>
          </div>
          <div className="flex gap-4 mt-2">
            <p className={`font-mono text-[10px] ${(metaTitle || title).length === 0 ? 'text-yellow-500' : (metaTitle || title).length <= 60 ? 'text-green-500' : 'text-red-400'}`}>
              {(metaTitle || title).length === 0 ? '⚠ Başlık yok' : (metaTitle || title).length <= 60 ? '✓ Başlık ideal' : '✗ Başlık çok uzun'}
            </p>
            <p className={`font-mono text-[10px] ${(metaDesc || excerpt).length === 0 ? 'text-yellow-500' : (metaDesc || excerpt).length <= 160 ? 'text-green-500' : 'text-red-400'}`}>
              {(metaDesc || excerpt).length === 0 ? '⚠ Açıklama yok' : (metaDesc || excerpt).length <= 160 ? '✓ Açıklama ideal' : '✗ Açıklama çok uzun'}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="btn-neon disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Kaydediliyor...' : submitLabel}
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => handleSubmit(true)}
          className="btn-neon-purple disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? '...' : 'Kaydet & Yayınla'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-[rgba(0,255,247,0.1)] rounded font-mono text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          İptal
        </button>
      </div>
    </form>
  );
}
