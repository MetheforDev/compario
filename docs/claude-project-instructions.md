# Compario — Claude Project Instructions

## Proje Nedir?
Compario, Türkiye'nin teknoloji ürünleri karşılaştırma ve haber platformudur. Kullanıcılar araçlar, akıllı telefonlar, laptoplar ve diğer ürünleri karşılaştırabilir; haber okuyabilir ve yorum yapabilir. İçerik, sosyal medyaya (Instagram, Twitter/X, YouTube) uygun şablonlarla da üretilecektir.

**GitHub:** https://github.com/MetheforDev/compario
**Domain:** compario.tech
**Deploy:** Vercel (otomatik — `git push origin main` yeterli)

---

## Tech Stack

| Katman | Teknoloji |
|---|---|
| Monorepo | Turborepo + npm workspaces |
| Frontend | Next.js 14 (App Router, Server Components) |
| Styling | Tailwind CSS 3 |
| Rich Text | Tiptap v2 + tiptap-markdown (markdown olarak kaydeder) |
| Database | Supabase (PostgreSQL + Storage) |
| DB Package | `@compario/database` (workspace paketi, src doğrudan transpile edilir) |
| Fonts | Orbitron (başlık), JetBrains Mono (body) |
| Markdown | react-markdown + custom renderers (MarkdownContent.tsx) |
| Auth | Tek şifre + httpOnly cookie (middleware koruması) |
| Deploy | Vercel |

---

## Monorepo Yapısı

```
compario/
├── apps/
│   └── web/                         # Next.js uygulaması
│       └── src/
│           ├── app/
│           │   ├── layout.tsx        # Root layout (font, metadata, CompareProvider)
│           │   ├── page.tsx          # Ana sayfa (Hero + DailyComparison + Categories + News)
│           │   ├── not-found.tsx     # Global 404 sayfası
│           │   ├── error.tsx         # Global 500 hata sayfası
│           │   ├── robots.ts         # /robots.txt (otomatik)
│           │   ├── sitemap.ts        # /sitemap.xml (dinamik, DB'den)
│           │   ├── (admin)/admin/    # Admin sayfaları (middleware korumalı)
│           │   ├── (public)/         # Public sayfalar
│           │   ├── admin-login/      # Giriş sayfası
│           │   ├── api/admin/        # login + logout API routes
│           │   └── links/            # Bio link sayfası (/links)
│           ├── components/
│           │   ├── admin/            # Admin bileşenleri
│           │   │   ├── TiptapEditor.tsx  # WYSIWYG rich text editör
│           │   │   ├── NewsForm.tsx      # Haber ekleme/düzenleme formu (SEO preview dahil)
│           │   │   ├── ProductForm.tsx   # Ürün ekleme/düzenleme formu
│           │   │   ├── ProductTable.tsx  # Ürün listesi tablosu
│           │   │   ├── ImageUpload.tsx   # Drag & drop görsel yükleme
│           │   │   ├── Sidebar.tsx       # Admin kenar menüsü
│           │   │   └── StatCard.tsx      # Dashboard istatistik kartı
│           │   ├── Header.tsx            # Sticky header (arama ikonu dahil)
│           │   ├── CompareBar.tsx        # Alt sabit karşılaştırma çubuğu
│           │   ├── NewsCard.tsx          # Haber listesi kartı
│           │   ├── ProductCard.tsx       # Ürün kartı (karşılaştırmaya ekle butonu)
│           │   ├── MarkdownContent.tsx   # Markdown renderer (compare bloğu dahil)
│           │   ├── ComparisonCard.tsx    # Ürün karşılaştırma kartı (compare bloğu render'ı)
│           │   ├── ShareButtons.tsx      # Twitter/WhatsApp/Copy link
│           │   └── SearchInput.tsx       # Arama kutusu (URL param tabanlı)
│           └── lib/
│               ├── compare-store.tsx    # Karşılaştırma state (Context + localStorage)
│               ├── uploadImage.ts        # Supabase Storage görsel yükleme
│               └── supabase.ts           # Client-side supabase instance
└── packages/
    └── database/                    # @compario/database workspace paketi
        └── src/
            ├── client.ts            # supabase + createAdminClient
            ├── types.ts             # Supabase tablo tipleri (TypeScript)
            └── queries/
                ├── news.ts          # Tüm haber sorguları
                ├── products.ts      # Tüm ürün sorguları
                ├── categories.ts    # Kategori sorguları
                └── segments.ts      # Segment sorguları
```

---

## Public Sayfalar (Route'lar)

| Route | Açıklama |
|---|---|
| `/` | Ana sayfa: Hero → Günün Karşılaştırması → Kategoriler → Öne Çıkan Haberler |
| `/categories` | Tüm kategoriler listesi |
| `/categories/[slug]` | Kategori detay — ürün grid, segment filtresi, sıralama |
| `/news` | Haberler listesi (kategori filtresi + sayfalama) |
| `/news/[slug]` | Haber detay — Markdown içerik, galeri, paylaşım, ilgili haberler |
| `/products/[slug]` | Ürün detay — özellikler tablosu, JSON-LD Product şeması |
| `/compare` | Karşılaştırma sayfası (`?ids=id1,id2,id3,id4`) |
| `/search` | Arama sayfası — ürün + haber tam metin arama |
| `/links` | Bio link sayfası (sosyal medya + site linkleri) |

---

## Admin Panel Sayfaları

**Base URL:** `/admin` (middleware ile korumalı)

| Route | Açıklama |
|---|---|
| `/admin/dashboard` | İstatistikler, son ürünler, hızlı işlemler |
| `/admin/news` | Haber listesi (durum/kategori filtresi, sayfalama) |
| `/admin/news/new` | Yeni haber — Tiptap editör + SEO Google önizleme |
| `/admin/news/[id]/edit` | Haber düzenle |
| `/admin/products` | Ürün listesi |
| `/admin/products/new` | Yeni ürün — spec şablon sistemi (Araç/Telefon/Laptop) |
| `/admin/products/[id]/edit` | Ürün düzenle |
| `/admin/categories` | Kategori yönetimi |
| `/admin/categories/new` | Yeni kategori |
| `/admin/segments` | Segment yönetimi |
| `/admin/segments/new` | Yeni segment |
| `/admin/users` | Stub (henüz geliştirilmedi) |

### Admin Erişimi
- **Login URL:** `compario.tech/admin-login`
- **Şifre:** `Compario1-`
- **Oturum:** 30 gün (httpOnly cookie, `compario-admin`)
- **Middleware:** `ADMIN_SECRET` cookie'yi kontrol eder

---

## Design System (Lüks / Premium Tema)

Tema siber punk **değil**, lüks/premium/moderndır. Altın + Platin + Koyu lacivert-siyah.

### Tailwind Renk Token'ları (tailwind.config.js'te tanımlı)
```
neon-cyan   → #C49A3C  (Sıcak Altın — ana renk)
neon-purple → #8B9BAC  (Soğuk Platin — ikincil)
neon-green  → #10B981  (Zümrüt — başarı/fiyat)
neon-pink   → #DC2626  (Koyu Kırmızı — hata/uyarı)
```

### CSS Değişkenleri (globals.css)
```css
--gold:        #C49A3C
--gold-dim:    rgba(196,154,60,0.12)
--platinum:    #8B9BAC
--bg-primary:  #08090E
--bg-secondary:#0C1018
--bg-card:     #101622
```

### Tipografi
- Başlıklar: `font-orbitron` (geometrik, futuristik)
- Body/UI: `font-mono` (JetBrains Mono)

### Utility Sınıfları
- `card-neon` → lüks kart (altın border, koyu bg)
- `btn-neon` → altın buton (ana CTA)
- `btn-neon-purple` → platin buton (ikincil CTA)
- `text-neon-cyan` → altın metin rengi
- `text-neon-purple` → platin metin rengi
- `text-glow-cyan` → altın glow efektli metin
- `bg-grid` → arka plan grid deseni
- `tiptap-content` → Tiptap editör içerik stili

---

## Veritabanı Şeması

### `products` tablosu
```
id (uuid), category_id, segment_id, name, slug (unique),
brand, model, model_year, price_min, price_max, currency,
image_url, images (jsonb), specs (jsonb),
description, short_description,
meta_title, meta_description, meta_keywords,
status (active/draft/inactive), is_featured,
view_count, compare_count,
source, source_url, last_scraped_at,
published_at, created_at, updated_at
```

### `news_articles` tablosu
```
id (uuid), title, slug (unique),
excerpt, content (markdown metni),
cover_image, images (text[]),      -- galeri görselleri
category (text),                   -- legacy tek kategori (backward compat)
categories (text[]),               -- çoklu kategori (yeni)
tags (text[]), related_product_ids (text[]),
meta_title, meta_description,
source, source_url, author,
status (draft/published/archived), is_featured,
view_count, published_at, created_at, updated_at
```

### `categories` tablosu
```
id, name, slug, icon, description,
display_order, is_active, created_at, updated_at
```

### `segments` tablosu
```
id, category_id, name, slug, description,
price_min, price_max, display_order, is_active,
created_at, updated_at
```

### Supabase RPC Fonksiyonları
```sql
increment_product_view(product_uuid uuid)  -- view_count + 1
increment_news_view(article_uuid uuid)      -- view_count + 1
```

---

## Haber Kategorileri
```
yeni-model    → Yeni Model
test          → Test & İnceleme
karsilastirma → Karşılaştırma   ← "Günün Karşılaştırması" bu kategoriyi kullanır
fiyat         → Fiyat Güncelleme
teknoloji     → Teknoloji
genel         → Genel
```

---

## Veritabanı Query Fonksiyonları

### News (`packages/database/src/queries/news.ts`)
```typescript
import {
  getNewsArticles,         // public — sadece published, sayfalama destekli
  getNewsArticlesAdmin,    // admin — tüm statuslar, filtreli
  getNewsArticleBySlug,    // public tek haber
  getNewsArticleById,      // admin tek haber (id ile)
  createNewsArticle,       // admin client kullanır
  updateNewsArticle,       // admin client kullanır
  deleteNewsArticle,       // admin client kullanır
  getFeaturedNews,         // is_featured=true, published
  getDailyComparison,      // is_featured=true + kategori=karsilastirma → tek makale
  getRelatedNews,          // tag benzerleri (exclude current)
  incrementNewsView,       // fire-and-forget
} from '@compario/database';
```

### Products (`packages/database/src/queries/products.ts`)
```typescript
import {
  getProducts,             // filtreli liste (search, category, segment, price, status, sortBy)
  getProductBySlug,        // public tek ürün
  getProductById,          // admin tek ürün
  getProductsByIds,        // batch fetch (compare sayfası için)
  createProduct,           // admin client
  updateProduct,           // admin client
  deleteProduct,           // admin client
  incrementViewCount,      // fire-and-forget
} from '@compario/database';
```

### Categories & Segments
```typescript
import {
  getCategories,           // activeOnly?: boolean
  getCategoryBySlug,
  getCategoryById,
  createCategory, updateCategory, deleteCategory,

  getAllSegments,           // activeOnly?: boolean
  getSegmentsByCategory,   // kategori bazlı segment listesi
  getSegmentBySlug,
  createSegment, updateSegment, deleteSegment,
} from '@compario/database';
```

---

## İçerik Sistemi

### Tiptap Rich Text Editör (Admin)
- `TiptapEditor.tsx` — admin haber formunda kullanılır
- İçerik Tiptap'ta düzenlenir, **markdown olarak kaydedilir** (tiptap-markdown extension)
- Araç çubuğu: Bold/İtalik/Strike/Kod, H1-H3, Listeler, Alıntı, Kod bloğu, Görsel URL, Bağlantı, Geri al/İleri al
- Bubble menu: Metin seçilince üstte hızlı format çubuğu

### Markdown Render (Public)
`MarkdownContent.tsx` — react-markdown tabanlı, özel bloklar destekler:

#### Karşılaştırma Kartı
Haber içinde ` ```compare ``` ` bloğu eklenerek `ComparisonCard.tsx` render edilir:
```json
{
  "products": [
    {
      "name": "BMW 3 Serisi",
      "price": "1.850.000 ₺",
      "image": "https://...",
      "badge": "Önerilen",
      "winner": true,
      "specs": [
        { "label": "Motor", "value": "2.0L 184 HP" },
        { "label": "0-100 km/s", "value": "7.1 sn", "better": true }
      ]
    }
  ],
  "verdict": "Fiyat/performans dengesi açısından BMW daha avantajlı."
}
```
- `winner: true` → altın border + "KAZANAN" rozeti
- `better: true` → altın renk + ▲ ikon
- 2 ürün: VS rozetli yan yana; 3 ürün: 3 sütun; 4 ürün: 2x2 grid

### SEO Preview (Admin NewsForm)
- Meta başlık karakter sayacı (60 limit) — yeşil/sarı/kırmızı
- Meta açıklama karakter sayacı (160 limit)
- Canlı Google SERP snippet önizlemesi
- Boşken title → haber başlığından, description → excerpt'ten fallback

---

## SEO Altyapısı

| Dosya | İşlev |
|---|---|
| `app/robots.ts` | /robots.txt — /admin ve /api'yi engeller |
| `app/sitemap.ts` | /sitemap.xml — tüm kategoriler/ürünler/haberler |
| `app/not-found.tsx` | Global 404 sayfası (markalı) |
| `app/error.tsx` | Global 500 hata sayfası (markalı) |
| `news/[slug]/opengraph-image.tsx` | Dinamik OG görsel her haber için |
| `news/[slug]/page.tsx` | JSON-LD: NewsArticle + BreadcrumbList şeması |
| `products/[slug]/page.tsx` | JSON-LD: Product + BreadcrumbList şeması |

---

## Ana Sayfa Bölümleri

```
1. Header (sticky, scroll'da küçülür, arama ikonu dahil)
2. Hero (COMPARIO başlığı, slogan, CTA butonları)
3. ─── divider ───
4. Günün Karşılaştırması (is_featured=true + kategori=karsilastirma, hero kart)
5. ─── divider ───
6. Kategoriler (5'li grid)
7. ─── divider ───
8. Son Haberler (is_featured=true, 3'lü grid)
9. CompareBar (sabit alt çubuk, 2+ ürün seçilince görünür)
10. Footer
```

---

## Karşılaştırma Sistemi

- `compare-store.tsx` — Context + localStorage, max 4 ürün
- `CompareBar.tsx` — sabit alt çubuk, ürün chip'leri, temizle/karşılaştır butonları
- `/compare?ids=id1,id2` — karşılaştırma sayfası
  - `getProductsByIds()` ile batch fetch
  - Spec key'lerini akıllıca birleştirir
  - Fiyat/ağırlık gibi değerlerde "küçük = iyi" mantığı
  - "En Uygun" rozeti en ucuz ürüne verilir

---

## Arama Sistemi

- `/search?q=...` — URL param tabanlı, 2+ karakter gerektirir
- `getProducts({ search: q })` → `name.ilike + brand.ilike + model.ilike`
- `getNewsArticles({ search: q })` → `title.ilike + excerpt.ilike`
- `SearchInput.tsx` — header'da (masaüstü nav + mobil), arama sayfasında tekrar kullanılır

---

## Çevre Değişkenleri

### `.env.local` (local geliştirme)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://bxcwpdfeiyrfekzvvujj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<Supabase anon key — .env.local dosyasına bak>
SUPABASE_SERVICE_KEY=<Supabase service key — .env.local dosyasına bak>
ADMIN_PASSWORD=<admin panel şifresi — .env.local dosyasına bak>
ADMIN_SECRET=<cookie doğrulama secret — .env.local dosyasına bak>
ADMIN_EMAIL=rumeliskelesi@gmail.com
```

### Vercel Production (Dashboard → Settings → Environment Variables)
Aynı değerler Vercel'e de eklenmelidir. `ADMIN_PASSWORD` ve `ADMIN_SECRET` eksikse login 500 hatası verir.

---

## Önemli Kurallar ve Notlar

1. **Admin client:** RLS bypass için daima `createAdminClient()` kullan. Public read işlemleri için `supabase` (anon) client.
2. **Transpile:** `@compario/database` paketi `./src/index.ts`'e işaret eder. `next.config.js`'te `transpilePackages: ['@compario/database']` zorunludur — `dist/` build gerekmez.
3. **Slug:** Tüm ürün ve haberler slug ile erişilir. Türkçe karakter normalize edilir (ç→c, ğ→g, vb.).
4. **`categories` vs `category`:** Haberler artık `categories TEXT[]` kullanıyor. `category` alanı backward compat için korundu. Admin formu her ikisine de yazar.
5. **OG Images:** `/news/[slug]/opengraph-image.tsx` dinamik OG görsel üretir. Sosyal medya paylaşımlarında otomatik görünür.
6. **Tiptap & Markdown:** Admin'de Tiptap ile yazılan içerik markdown formatında DB'ye kaydedilir. `MarkdownContent.tsx` public sayfada render eder. Eski markdown içerikler bozulmaz.
7. **İçerik Editörü Önizleme:** NewsForm'daki "👁 Önizleme" toggle'ı ile yazılan içeriği public'teki gibi render edebilirsin.
8. **Deploy:** `git push origin main` → Vercel otomatik deploy eder (~2-3 dk).
9. **Windows PAT sorunu:** `git push` 403 alırsa: `git remote set-url origin https://TOKEN@github.com/MetheforDev/compario.git` ile push, sonra URL'yi temizle.
10. **Auth:** Middleware `ADMIN_SECRET` cookie'yi kontrol eder. Secret değişirse tüm aktif oturumlar geçersiz olur.
11. **Build:** `/links` sayfası `'use client'` direktifi gerektirir (`onMouseEnter` handlers). Metadata `links/layout.tsx`'te tutulur.

---

## Geliştirme Komutları

```bash
# Tüm workspace (önerilen)
npm run dev

# Sadece web uygulaması
cd apps/web && npm run dev

# TypeScript kontrol
npx tsc --noEmit -p apps/web/tsconfig.json

# Build (production test)
cd apps/web && npm run build
```

---

## Yakında Eklenecek Özellikler (Öncelik Sırasına Göre)

1. **Yorum & tartışma sistemi** — haberler ve ürünler için kullanıcı yorumları
2. **Kullanıcı hesapları** — favori kaydetme, karşılaştırma geçmişi
3. **Trend / Popüler ürünler** — ana sayfaya view_count tabanlı bölüm
4. **Admin activity log** — kim ne değiştirdi
5. **Karşılaştırma paylaşımı** — URL ile karşılaştırma paylaşma
6. **Mobil uygulama** — Expo (React Native)
7. **Sosyal medya şablonları** — Instagram/Twitter/YouTube içerik üretimi
