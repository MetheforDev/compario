'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { createCategoryAction } from '../actions';

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

interface FlatCat { id: string; name: string; parent_id: string | null; depth: number }

function buildFlatTree(cats: FlatCat[]): FlatCat[] {
  const map = new Map<string, FlatCat & { children: FlatCat[] }>();
  cats.forEach(c => map.set(c.id, { ...c, children: [] }));
  const roots: (FlatCat & { children: FlatCat[] })[] = [];
  map.forEach(node => {
    if (node.parent_id && map.has(node.parent_id)) map.get(node.parent_id)!.children.push(node);
    else roots.push(node);
  });
  const result: FlatCat[] = [];
  const walk = (nodes: typeof roots, depth: number) => {
    nodes.forEach(n => { result.push({ ...n, depth }); walk(n.children as typeof roots, depth + 1); });
  };
  walk(roots, 0);
  return result;
}

export default function NewCategoryPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [name, setName]         = useState('');
  const [slug, setSlug]         = useState('');
  const [slugLocked, setSlugLocked] = useState(false);
  const [icon, setIcon]         = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [parentId, setParentId] = useState('');
  const [description, setDesc]  = useState('');
  const [isActive, setIsActive] = useState(true);
  const [allCats, setAllCats]   = useState<FlatCat[]>([]);

  useEffect(() => {
    fetch('/api/admin/categories')
      .then(r => r.ok ? r.json() : [])
      .then((cats: FlatCat[]) => setAllCats(buildFlatTree(cats)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!slugLocked) setSlug(generateSlug(name));
  }, [name, slugLocked]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) { toast.error('Ad ve Slug zorunludur.'); return; }
    startTransition(async () => {
      const result = await createCategoryAction({
        name: name.trim(),
        slug: slug.trim(),
        icon: icon.trim() || null,
        image_url: imageUrl.trim() || null,
        parent_id: parentId || null,
        description: description.trim() || null,
        is_active: isActive,
      });
      if (result.error) { toast.error(result.error); }
      else { toast.success('Kategori eklendi!'); router.push('/admin/categories'); router.refresh(); }
    });
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link href="/admin/categories" className="font-mono text-[10px] text-gray-600 hover:text-neon-cyan transition-colors uppercase tracking-widest">
          ← Kategoriler
        </Link>
        <h1 className="font-orbitron text-2xl font-black text-neon-cyan text-glow-cyan mt-3">YENİ KATEGORİ</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
        <div className="card-neon p-6 space-y-5">
          <div>
            <label className={labelCls}>Kategori Adı *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Örn: Gaming Laptop" className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>
              Slug *
              <button type="button" onClick={() => setSlugLocked(l => !l)} className="ml-2 text-neon-purple normal-case tracking-normal">
                {slugLocked ? '(kilitli — düzenle)' : '(otomatik)'}
              </button>
            </label>
            <input type="text" value={slug}
              onChange={(e) => { setSlug(e.target.value); setSlugLocked(true); }}
              placeholder="gaming-laptop" className={inputCls} />
          </div>

          {/* Üst Kategori */}
          <div>
            <label className={labelCls}>Üst Kategori (Opsiyonel)</label>
            <select value={parentId} onChange={(e) => setParentId(e.target.value)} className={inputCls}>
              <option value="">— Üst düzey kategori (parent yok) —</option>
              {allCats.map(c => (
                <option key={c.id} value={c.id}>
                  {'　'.repeat(c.depth)}{c.depth > 0 ? '└ ' : ''}{c.name}
                </option>
              ))}
            </select>
            {parentId && (
              <p className="font-mono text-[10px] text-neon-purple mt-1 opacity-70">
                ✓ Bu kategori seçilen kategorinin alt kategorisi olarak eklenecek
              </p>
            )}
          </div>

          <div>
            <label className={labelCls}>İkon (Emoji)</label>
            <input type="text" value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="📱" className={inputCls} maxLength={4} />
          </div>

          <div>
            <label className={labelCls}>Görsel URL (Opsiyonel)</label>
            <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." className={inputCls} />
            {imageUrl && <img src={imageUrl} alt="önizleme" className="mt-2 h-24 w-full object-cover rounded opacity-70" />}
          </div>

          <div>
            <label className={labelCls}>Açıklama</label>
            <textarea value={description} onChange={(e) => setDesc(e.target.value)} placeholder="Kategori açıklaması..." rows={3} className={inputCls + ' resize-none'} />
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="is_active" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="w-4 h-4 accent-[#00fff7]" />
            <label htmlFor="is_active" className="font-mono text-xs text-gray-400 cursor-pointer uppercase tracking-wider">Aktif</label>
          </div>
        </div>

        <div className="flex gap-4">
          <button type="submit" disabled={isPending}
            className="px-8 py-3 font-orbitron text-sm font-bold uppercase tracking-widest rounded bg-gradient-to-r from-neon-cyan to-neon-purple text-black hover:opacity-90 transition-opacity disabled:opacity-40">
            {isPending ? 'Kaydediliyor...' : 'Kategoriyi Kaydet'}
          </button>
          <button type="button" onClick={() => router.back()}
            className="px-6 py-3 font-mono text-xs uppercase tracking-widest border border-[rgba(0,255,247,0.2)] text-gray-500 rounded hover:border-neon-cyan hover:text-neon-cyan transition-all">
            İptal
          </button>
        </div>
      </form>
    </div>
  );
}
