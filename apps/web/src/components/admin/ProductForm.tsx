'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import type { Category, Segment, Product, ProductInput, ProductStatus } from '@compario/database';

// ─── Spec Templates ───────────────────────────────────────────────────────────

const CAR_SPECS = [
  'engine_displacement', 'horsepower', 'torque_nm', 'fuel_type',
  'acceleration_0_100', 'max_speed_kmh', 'fuel_consumption_l100km',
  'length_mm', 'width_mm', 'height_mm', 'trunk_volume_l',
  'ncap_rating', 'airbag_count', 'abs', 'esp',
];

const PHONE_SPECS = [
  'screen_size_inch', 'screen_resolution', 'screen_technology', 'refresh_rate_hz',
  'processor', 'ram_gb', 'storage_gb',
  'main_camera_mp', 'ultra_wide_mp', 'front_camera_mp',
  'battery_mah', 'charging_speed_w', 'os',
];

const LAPTOP_SPECS = [
  'processor', 'ram_gb', 'storage_gb', 'storage_type',
  'screen_size_inch', 'screen_resolution', 'refresh_rate_hz',
  'gpu', 'battery_wh', 'weight_kg', 'os',
];

const SPEC_TEMPLATES = [
  { label: '🚗 Araba', keys: CAR_SPECS },
  { label: '📱 Telefon', keys: PHONE_SPECS },
  { label: '💻 Laptop', keys: LAPTOP_SPECS },
];

// ─── Types ────────────────────────────────────────────────────────────────────

type SpecEntry = { id: number; key: string; value: string };

interface ProductFormProps {
  categories: Category[];
  allSegments: Segment[];
  product?: Product;
  action: (data: ProductInput) => Promise<{ error?: string }>;
  submitLabel?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[çÇ]/g, 'c').replace(/[şŞ]/g, 's').replace(/[ğĞ]/g, 'g')
    .replace(/[üÜ]/g, 'u').replace(/[öÖ]/g, 'o').replace(/[ıİ]/g, 'i')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// ─── Shared input styles ───────────────────────────────────────────────────────

const inputCls =
  'w-full bg-[#0d0d17] border border-[rgba(0,255,247,0.12)] rounded px-3 py-2.5 text-sm text-gray-200 ' +
  'font-mono placeholder-gray-700 focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-[rgba(0,255,247,0.2)] transition-colors';

const labelCls = 'block font-mono text-[10px] uppercase tracking-widest text-neon-cyan opacity-70 mb-1.5';

const errorCls = 'mt-1 font-mono text-[10px] text-neon-pink';

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="font-orbitron text-[10px] uppercase tracking-widest text-neon-cyan opacity-60 whitespace-nowrap">
        ⬡ {children}
      </span>
      <div className="flex-1 h-px bg-[rgba(0,255,247,0.08)]" />
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function ProductForm({
  categories,
  allSegments,
  product,
  action,
  submitLabel = 'Kaydet',
}: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Basic fields
  const [categoryId, setCategoryId]   = useState(product?.category_id ?? '');
  const [segmentId, setSegmentId]     = useState(product?.segment_id ?? '');
  const [name, setName]               = useState(product?.name ?? '');
  const [slug, setSlug]               = useState(product?.slug ?? '');
  const [slugLocked, setSlugLocked]   = useState(!!product);
  const [brand, setBrand]             = useState(product?.brand ?? '');
  const [model, setModel]             = useState(product?.model ?? '');
  const [priceMin, setPriceMin]       = useState(product?.price_min?.toString() ?? '');
  const [priceMax, setPriceMax]       = useState(product?.price_max?.toString() ?? '');
  const [status, setStatus]           = useState<ProductStatus>((product?.status as ProductStatus) ?? 'draft');

  // Specs
  const [specEntries, setSpecEntries] = useState<SpecEntry[]>(() => {
    if (product?.specs && typeof product.specs === 'object' && !Array.isArray(product.specs)) {
      return Object.entries(product.specs as Record<string, unknown>).map(([key, val], i) => ({
        id: i,
        key,
        value: String(val ?? ''),
      }));
    }
    return [];
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Derived
  const filteredSegments = allSegments.filter((s) => s.category_id === categoryId);

  // Auto-slug
  useEffect(() => {
    if (!slugLocked) setSlug(generateSlug(name));
  }, [name, slugLocked]);

  // Reset segment on category change
  useEffect(() => {
    if (!product) setSegmentId('');
  }, [categoryId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Spec helpers ──────────────────────────────────────────────────────────

  function addSpec() {
    setSpecEntries((p) => [...p, { id: Date.now(), key: '', value: '' }]);
  }

  function removeSpec(id: number) {
    setSpecEntries((p) => p.filter((e) => e.id !== id));
  }

  function updateSpec(id: number, field: 'key' | 'value', val: string) {
    setSpecEntries((p) => p.map((e) => (e.id === id ? { ...e, [field]: val } : e)));
  }

  function applyTemplate(keys: string[]) {
    setSpecEntries(keys.map((key, i) => ({ id: Date.now() + i, key, value: '' })));
  }

  // ─── Validation ────────────────────────────────────────────────────────────

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!categoryId)        errs.categoryId = 'Kategori seçiniz';
    if (!name.trim())       errs.name       = 'Ürün adı gereklidir';
    if (!slug.trim())       errs.slug       = 'Slug gereklidir';
    if (!brand.trim())      errs.brand      = 'Marka gereklidir';
    if (!model.trim())      errs.model      = 'Model gereklidir';
    if (priceMin && Number.isNaN(Number(priceMin))) errs.priceMin = 'Geçerli fiyat giriniz';
    if (priceMax && Number.isNaN(Number(priceMax))) errs.priceMax = 'Geçerli fiyat giriniz';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  // ─── Submit ────────────────────────────────────────────────────────────────

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) {
      toast.error('Lütfen zorunlu alanları doldurunuz.');
      return;
    }

    const specs: Record<string, string> = Object.fromEntries(
      specEntries.filter((e) => e.key.trim()).map((e) => [e.key.trim(), e.value]),
    );

    const data: ProductInput = {
      category_id: categoryId,
      segment_id:  segmentId || null,
      name:        name.trim(),
      slug:        slug.trim(),
      brand:       brand.trim(),
      model:       model.trim(),
      price_min:   priceMin ? Number(priceMin) : null,
      price_max:   priceMax ? Number(priceMax) : null,
      specs,
      status,
    };

    startTransition(async () => {
      const result = await action(data);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(`Ürün ${product ? 'güncellendi' : 'eklendi'}!`);
        router.push('/admin/products');
        router.refresh();
      }
    });
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">

      {/* ── 1. Temel Bilgiler ── */}
      <section className="card-neon p-6">
        <SectionTitle>Temel Bilgiler</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Kategori */}
          <div className="md:col-span-2">
            <label className={labelCls}>Kategori *</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={inputCls}
            >
              <option value="">— Kategori Seçiniz —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.categoryId && <p className={errorCls}>{errors.categoryId}</p>}
          </div>

          {/* Segment */}
          <div className="md:col-span-2">
            <label className={labelCls}>Segment</label>
            <select
              value={segmentId}
              onChange={(e) => setSegmentId(e.target.value)}
              disabled={!categoryId || filteredSegments.length === 0}
              className={inputCls + ' disabled:opacity-40 disabled:cursor-not-allowed'}
            >
              <option value="">— Segment Seçiniz (opsiyonel) —</option>
              {filteredSegments.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Ürün Adı */}
          <div className="md:col-span-2">
            <label className={labelCls}>Ürün Adı *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Örn: Samsung Galaxy S24 Ultra"
              className={inputCls}
            />
            {errors.name && <p className={errorCls}>{errors.name}</p>}
          </div>

          {/* Slug */}
          <div className="md:col-span-2">
            <label className={labelCls}>
              Slug *
              <button
                type="button"
                onClick={() => setSlugLocked((l) => !l)}
                className="ml-2 text-neon-purple normal-case tracking-normal hover:opacity-80"
              >
                {slugLocked ? '(kilitli — düzenle)' : '(otomatik — kilitle)'}
              </button>
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => { setSlug(e.target.value); setSlugLocked(true); }}
              readOnly={!slugLocked}
              placeholder="urun-adi-slug"
              className={inputCls + (!slugLocked ? ' opacity-60' : '')}
            />
            {errors.slug && <p className={errorCls}>{errors.slug}</p>}
          </div>

          {/* Marka */}
          <div>
            <label className={labelCls}>Marka *</label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Örn: Samsung"
              className={inputCls}
            />
            {errors.brand && <p className={errorCls}>{errors.brand}</p>}
          </div>

          {/* Model */}
          <div>
            <label className={labelCls}>Model *</label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="Örn: S24 Ultra"
              className={inputCls}
            />
            {errors.model && <p className={errorCls}>{errors.model}</p>}
          </div>

        </div>
      </section>

      {/* ── 2. Fiyat & Durum ── */}
      <section className="card-neon p-6">
        <SectionTitle>Fiyat & Durum</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          <div>
            <label className={labelCls}>Min Fiyat (₺)</label>
            <input
              type="number"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              placeholder="0"
              min={0}
              className={inputCls}
            />
            {errors.priceMin && <p className={errorCls}>{errors.priceMin}</p>}
          </div>

          <div>
            <label className={labelCls}>Max Fiyat (₺)</label>
            <input
              type="number"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              placeholder="0"
              min={0}
              className={inputCls}
            />
            {errors.priceMax && <p className={errorCls}>{errors.priceMax}</p>}
          </div>

          <div>
            <label className={labelCls}>Durum</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProductStatus)}
              className={inputCls}
            >
              <option value="draft">Taslak</option>
              <option value="active">Aktif</option>
              <option value="inactive">Pasif</option>
            </select>
          </div>

        </div>
      </section>

      {/* ── 3. Teknik Özellikler (Specs) ── */}
      <section className="card-neon p-6">
        <SectionTitle>Teknik Özellikler</SectionTitle>

        {/* Template buttons */}
        <div className="flex flex-wrap gap-2 mb-5">
          <span className="font-mono text-[10px] text-gray-600 uppercase tracking-widest self-center mr-1">
            Şablon:
          </span>
          {SPEC_TEMPLATES.map((t) => (
            <button
              key={t.label}
              type="button"
              onClick={() => applyTemplate(t.keys)}
              className="px-3 py-1.5 font-mono text-[10px] border border-[rgba(0,255,247,0.2)] text-gray-400
                         rounded hover:border-neon-cyan hover:text-neon-cyan transition-all uppercase tracking-wider"
            >
              {t.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setSpecEntries([])}
            className="px-3 py-1.5 font-mono text-[10px] border border-[rgba(255,0,110,0.2)] text-gray-600
                       rounded hover:border-neon-pink hover:text-neon-pink transition-all uppercase tracking-wider"
          >
            Temizle
          </button>
        </div>

        {/* Spec rows */}
        <div className="space-y-2 mb-4">
          {specEntries.map((entry) => (
            <div key={entry.id} className="flex gap-2 items-center">
              <input
                type="text"
                value={entry.key}
                onChange={(e) => updateSpec(entry.id, 'key', e.target.value)}
                placeholder="anahtar (örn: horsepower)"
                className={inputCls + ' flex-1'}
              />
              <input
                type="text"
                value={entry.value}
                onChange={(e) => updateSpec(entry.id, 'value', e.target.value)}
                placeholder="değer"
                className={inputCls + ' flex-1'}
              />
              <button
                type="button"
                onClick={() => removeSpec(entry.id)}
                className="w-9 h-9 flex items-center justify-center font-mono text-gray-600 border
                           border-[rgba(255,0,110,0.2)] rounded hover:border-neon-pink hover:text-neon-pink transition-all flex-shrink-0"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addSpec}
          className="flex items-center gap-2 font-mono text-xs text-neon-cyan opacity-60
                     hover:opacity-100 transition-opacity uppercase tracking-wider"
        >
          + Özellik Ekle
        </button>
      </section>

      {/* ── Actions ── */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isPending}
          className="px-8 py-3 font-orbitron text-sm font-bold uppercase tracking-widest rounded
                     bg-gradient-to-r from-neon-cyan to-neon-purple text-black
                     hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isPending ? 'Kaydediliyor...' : submitLabel}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 font-mono text-xs uppercase tracking-widest border border-[rgba(0,255,247,0.2)]
                     text-gray-500 rounded hover:border-neon-cyan hover:text-neon-cyan transition-all"
        >
          İptal
        </button>
      </div>

    </form>
  );
}
