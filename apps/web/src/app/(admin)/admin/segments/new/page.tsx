'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { createSegmentAction } from '../actions';
import { getCategories } from '@compario/database';
import type { Category } from '@compario/database';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[çÇ]/g, 'c').replace(/[şŞ]/g, 's').replace(/[ğĞ]/g, 'g')
    .replace(/[üÜ]/g, 'u').replace(/[öÖ]/g, 'o').replace(/[ıİ]/g, 'i')
    .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

const inputCls =
  'w-full bg-[#0d0d17] border border-[rgba(0,255,247,0.12)] rounded px-3 py-2.5 text-sm text-gray-200 ' +
  'font-mono placeholder-gray-700 focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-[rgba(0,255,247,0.2)] transition-colors';

const labelCls = 'block font-mono text-[10px] uppercase tracking-widest text-neon-cyan opacity-70 mb-1.5';

export default function NewSegmentPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [categories, setCategories] = useState<Category[]>([]);

  const [categoryId, setCategoryId] = useState('');
  const [name, setName]             = useState('');
  const [slug, setSlug]             = useState('');
  const [slugLocked, setSlugLocked] = useState(false);
  const [priceMin, setPriceMin]     = useState('');
  const [priceMax, setPriceMax]     = useState('');
  const [isActive, setIsActive]     = useState(true);

  useEffect(() => {
    getCategories(false).then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (!slugLocked) setSlug(generateSlug(name));
  }, [name, slugLocked]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!categoryId || !name.trim() || !slug.trim()) {
      toast.error('Kategori, Ad ve Slug zorunludur.');
      return;
    }
    startTransition(async () => {
      const result = await createSegmentAction({
        category_id: categoryId,
        name:        name.trim(),
        slug:        slug.trim(),
        price_min:   priceMin ? Number(priceMin) : null,
        price_max:   priceMax ? Number(priceMax) : null,
        is_active:   isActive,
      });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Segment eklendi!');
        router.push('/admin/segments');
        router.refresh();
      }
    });
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link href="/admin/segments" className="font-mono text-[10px] text-gray-600 hover:text-neon-cyan transition-colors uppercase tracking-widest">
          ← Segmentler
        </Link>
        <h1 className="font-orbitron text-2xl font-black text-neon-cyan text-glow-cyan mt-3">
          YENİ SEGMENT
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
        <div className="card-neon p-6 space-y-5">
          <div>
            <label className={labelCls}>Kategori *</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputCls}>
              <option value="">— Kategori Seçiniz —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Segment Adı *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Örn: Orta Segment" className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>
              Slug *
              <button type="button" onClick={() => setSlugLocked((l) => !l)}
                className="ml-2 text-neon-purple normal-case tracking-normal">
                {slugLocked ? '(kilitli — düzenle)' : '(otomatik)'}
              </button>
            </label>
            <input type="text" value={slug}
              onChange={(e) => { setSlug(e.target.value); setSlugLocked(true); }}
              placeholder="orta-segment" className={inputCls} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Min Fiyat (₺)</label>
              <input type="number" value={priceMin} onChange={(e) => setPriceMin(e.target.value)}
                placeholder="0" min={0} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Max Fiyat (₺)</label>
              <input type="number" value={priceMax} onChange={(e) => setPriceMax(e.target.value)}
                placeholder="0" min={0} className={inputCls} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="seg_active" checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)} className="w-4 h-4 accent-[#00fff7]" />
            <label htmlFor="seg_active" className="font-mono text-xs text-gray-400 cursor-pointer uppercase tracking-wider">
              Aktif
            </label>
          </div>
        </div>

        <div className="flex gap-4">
          <button type="submit" disabled={isPending}
            className="px-8 py-3 font-orbitron text-sm font-bold uppercase tracking-widest rounded
                       bg-gradient-to-r from-neon-cyan to-neon-purple text-black
                       hover:opacity-90 transition-opacity disabled:opacity-40">
            {isPending ? 'Kaydediliyor...' : 'Segmenti Kaydet'}
          </button>
          <button type="button" onClick={() => router.back()}
            className="px-6 py-3 font-mono text-xs uppercase tracking-widest border border-[rgba(0,255,247,0.2)]
                       text-gray-500 rounded hover:border-neon-cyan hover:text-neon-cyan transition-all">
            İptal
          </button>
        </div>
      </form>
    </div>
  );
}
