# Compario — Claude Project Instructions

## Proje Nedir?
Compario, Türkiye'nin ürün karşılaştırma platformudur. Kullanıcılar araçlar, akıllı telefonlar, laptoplar ve diğer ürünleri karşılaştırabilir. Aynı zamanda haber/makale sistemi vardır.

**GitHub:** https://github.com/MetheforDev/compario
**Domain:** compario.com.tr
**Deploy:** Vercel (otomatik main push ile)

---

## Tech Stack

| Katman | Teknoloji |
|---|---|
| Monorepo | Turborepo |
| Frontend | Next.js 14 (App Router) |
| Styling | Tailwind CSS 3 |
| Database | Supabase (PostgreSQL + Storage) |
| ORM/Query | Custom package: `@compario/database` |
| Fonts | Orbitron (başlık), JetBrains Mono (body) |
| Markdown | react-markdown + custom renderers |
| Deploy | Vercel |

---

## Monorepo Yapısı

```
compario/
├── apps/
│   └── web/                    # Next.js uygulaması
│       └── src/
│           ├── app/
│           │   ├── (admin)/admin/   # Admin sayfaları
│           │   └── (public)/        # Public sayfalar
│           └── components/
│               ├── admin/           # Admin bileşenleri
│               └── *.tsx            # Public bileşenler
└── packages/
    └── database/               # Supabase sorguları + tipler
        └── src/
            ├── client.ts       # supabase + createAdminClient
            ├── types.ts        # Supabase tablo tipleri
            └── queries/
                ├── news.ts
                ├── products.ts
                ├── categories.ts
                └── segments.ts
```

---

## Design System (Lüks Tema)

Tema siber punk değil, **lüks / premium / modern**dir.

### Tailwind Renk Token'ları
```
neon-cyan   → #C49A3C  (Sıcak Altın)
neon-purple → #8B9BAC  (Soğuk Platin)
neon-green  → #10B981  (Zümrüt)
neon-pink   → #DC2626  (Koyu Kırmızı)
```

### CSS Değişkenleri (globals.css)
```css
--gold:     #C49A3C
--platinum: #8B9BAC
--bg-primary: #08090E
```

### Tipografi
- Başlıklar: `font-orbitron` sınıfı
- Body/UI: `font-mono` sınıfı (JetBrains Mono)

### Bileşen Sınıfları
- `card-neon` → lüks kart (altın border, dark bg)
- `btn-neon` → altın buton
- `btn-neon-purple` → platin buton
- `text-neon-cyan` → altın metin
- `text-neon-purple` → platin metin
- `text-glow-cyan` → altın glow efektli metin

---

## Veritabanı Şeması (Özet)

### `products` tablosu
```
id, category_id, segment_id, name, slug, brand, model, model_year,
price_min, price_max, currency, image_url, images (JSON), specs (JSON),
description, short_description, status (active/draft/inactive),
is_featured, view_count, compare_count, published_at, created_at, updated_at
```

### `news_articles` tablosu
```
id, title, slug, excerpt, content (markdown), cover_image,
images (TEXT[]),          -- galeri görselleri
category (TEXT),          -- legacy tek kategori
categories (TEXT[]),      -- yeni çoklu kategori
tags (TEXT[]), related_product_ids (TEXT[]),
source, author, status (draft/published/archived),
is_featured, view_count, published_at, created_at, updated_at
```

### `categories` tablosu
```
id, name, slug, description, parent_id, icon, is_active, sort_order
```

### `segments` tablosu
```
id, category_id, name, slug, description, min_price, max_price, is_active
```

---

## Haber Kategorileri
```
yeni-model    → Yeni Model
test          → Test
karsilastirma → Karşılaştırma
fiyat         → Fiyat
teknoloji     → Teknoloji
genel         → Genel
```

---

## Admin Panel

**URL:** `/admin`
**Sayfalar:**
- `/admin/dashboard` — istatistikler, son ürünler, hızlı işlemler
- `/admin/products` — ürün listesi, ekle/düzenle/sil
- `/admin/news` — haber listesi, ekle/düzenle/sil
- `/admin/categories` — kategori yönetimi
- `/admin/segments` — segment yönetimi
- `/admin/users` — (henüz stub, auth sistemi bekliyor)

**Not:** Admin rotaları `(admin)/admin/` layout grubunda. Şu an auth yok, ileride eklenecek.

---

## Veritabanı Query Fonksiyonları

### News
```typescript
import {
  getNewsArticles,         // public, sadece published
  getNewsArticlesAdmin,    // admin, tüm statuslar
  getNewsArticleBySlug,
  getNewsArticleById,
  createNewsArticle,
  updateNewsArticle,
  deleteNewsArticle,
  getFeaturedNews,
  getRelatedNews,
  incrementNewsView,
} from '@compario/database';
```

### Products
```typescript
import {
  getProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '@compario/database';
```

### Categories / Segments
```typescript
import {
  getCategories,
  createCategory, updateCategory, deleteCategory,
  getAllSegments, getSegmentsByCategory,
  createSegment, updateSegment, deleteSegment,
} from '@compario/database';
```

---

## Markdown İçerik Sistemi

Haberler markdown ile yazılır. `MarkdownContent.tsx` özel blokları işler:

### Karşılaştırma Kartı
Haber içeriğine ` ```compare ``` ` bloğu eklenerek görsel karşılaştırma kartı render edilir.

```json
{
  "products": [
    {
      "name": "BMW 3 Serisi",
      "price": "1.850.000 ₺",
      "image": "https://...",
      "badge": "Ekonomik",
      "winner": true,
      "specs": [
        { "label": "Motor", "value": "2.0L 184 HP" },
        { "label": "0-100", "value": "7.1 sn", "better": true }
      ]
    },
    { "name": "Mercedes C200", "price": "2.100.000 ₺", "specs": [...] }
  ],
  "verdict": "Bütçe dostu tercih"
}
```

- 2 ürün: VS rozetli yan yana layout
- 3 ürün: 3 sütun grid
- 4 ürün: 2x2 (mobil) / 4 sütun (masaüstü)
- `winner: true` → altın border + KAZANAN rozeti
- `better: true` → altın renk + ▲ ikon

### Galeri Bloğu
```markdown
::gallery
https://image1.jpg
https://image2.jpg
::
```

---

## Çevre Değişkenleri (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=           # admin işlemleri için (createAdminClient)
ADMIN_PASSWORD=Compario1-       # admin panel şifresi
ADMIN_SECRET=tOd9czvKrqT5nOWWfDyepenmLpJXwaBJn2r6r1cBn5I4Wb2URGHadrEtXLlAXCEg
```

## Admin Panel Erişimi
- **URL:** `compario.com.tr/admin-login` (veya `/admin` → otomatik yönlendirir)
- **Şifre:** `Compario1-`
- **Oturum süresi:** 30 gün (httpOnly cookie)
- Vercel'de `ADMIN_PASSWORD` ve `ADMIN_SECRET` env var'ları set edilmeli

---

## Önemli Notlar

1. **Admin client:** RLS bypass için `createAdminClient()` kullan, public işlemler için `supabase` client.
2. **Slug:** Tüm ürün ve haberler slug ile erişilir, SEO dostu URL'ler.
3. **Görseller:** Supabase Storage'da saklanır, URL direkt olarak veritabanına yazılır.
4. **`categories` vs `category`:** Haberler artık `categories TEXT[]` kullanıyor. `category` legacy backward compat için korundu. Form her ikisini de yazıyor.
5. **OG Images:** Her haber için `/news/[slug]/opengraph-image.tsx` ile dinamik OG görsel üretiliyor.
6. **Deploy:** `git push origin main` → Vercel otomatik deploy eder.
7. **Windows PAT sorunu:** Git push 403 alırsa `git remote set-url origin https://TOKEN@github.com/MetheforDev/compario.git` ile push, sonra URL'yi temizle.
8. **Admin auth:** Middleware `ADMIN_SECRET` cookie'yi kontrol eder. Secret veya password değişirse tüm aktif oturumlar geçersiz olur.

---

## Geliştirme

```bash
# Kök dizinde
npm run dev      # tüm workspace'i başlatır (turbo)

# Sadece web uygulaması
cd apps/web && npm run dev

# Database paketi build
cd packages/database && npm run build
```
