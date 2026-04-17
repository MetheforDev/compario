# Compario Projesi

Türkiye'nin #1 çok işlevli karşılaştırma + teknoloji haber platformu.
Hedef: Epey.com (ürün karşılaştırma) + Webtekno.com (teknoloji haberleri) kombinasyonu.
Ana odak: Google SEO trafiği, kullanıcıyı sitede tutmak, eşi benzeri olmayan özellikler.

## Tech Stack
- Next.js 14 (App Router, Server Components first)
- Supabase (PostgreSQL + Auth)
- Turborepo monorepo
- Tailwind CSS + custom neon/dark theme
- TypeScript strict

## Proje Yapısı
- `/apps/web` — Next.js uygulaması
- `/packages/database` — Supabase queries & types
- `/scripts` — Seed & migration scripts (Node ESM .mjs)
- `/apps/web/src/app/(public)` — Public sayfalar
- `/apps/web/src/app/(admin)` — Admin panel
- `/apps/web/src/components` — Paylaşılan bileşenler

## Benim Hakkımda
İsim: Metehan
Rol: Founder & Developer
Hedef: Compario'yu Türkiye'nin #1 karşılaştırma platformu yapmak
Zaman: Yan proje, günde 2-4 saat
E-posta: methefor@gmail.com

---

## ÜRÜN MİMARİSİ KURALLARI (kritik)

### Doğru format
- **Ürün adı = base model** (marka adı olmadan): "Golf", "iPhone 16 Pro Max", "Galaxy S25"
- **Motor/powertrain/storage = specs içinde varyant array**
- **Marka = `brand` field**
- **Model = `model` field**

### Yanlış vs Doğru
```
YANLIŞ: { name: "Golf 2.0 TDI", brand: "Volkswagen" }
DOĞRU:  { name: "Golf", brand: "Volkswagen", model: "Golf",
          specs: { "Donanım Seçenekleri": [{ "Motor": "2.0 TDI", "Fiyat": "..." }] } }

YANLIŞ: { name: "Yaris Hybrid", brand: "Toyota" }
DOĞRU:  { name: "Yaris", brand: "Toyota",
          specs: { "Motor": "1.5 Hybrid (116 HP)", "Donanım Seçenekleri": [...] } }

YANLIŞ: { name: "iPhone 16 Pro Max 256GB" }
DOĞRU:  { name: "iPhone 16 Pro Max",
          specs: { "Depolama Seçenekleri": [{ "Kapasite": "256 GB", "Fiyat": "..." }] } }
```

### Varyant array formatı
```json
"Donanım Seçenekleri": [
  { "Versiyon": "Advance", "Motor": "1.5 TSI 150 HP", "Fiyat": "1.250.000 ₺" },
  { "Versiyon": "R-Line", "Motor": "2.0 TSI 190 HP", "Fiyat": "1.650.000 ₺" }
]
```
- İlk sütun = versiyon/donanım adı (kalın gösterilir)
- "Fiyat" içeren sütun = altın renk (#C49A3C)

---

## SEO KURALLARI

Her public sayfada şunlar ZORUNLU:
1. `generateMetadata` export (title, description, openGraph, twitter)
2. JSON-LD structured data (`<script type="application/ld+json">`)
3. Canonical URL

### Schema türleri (sayfaya göre)
- Ürün sayfası: `schema.org/Product` + `AggregateOffer` + `BreadcrumbList`
- Haber sayfası: `schema.org/NewsArticle` + `BreadcrumbList`
- Kategori sayfası: `schema.org/CollectionPage` + `BreadcrumbList`
- Ana sayfa (layout): `schema.org/Organization` + `WebSite` + `SearchAction`

### Öncelik sırası (en önemli → en az)
1. title + meta description (her sayfada unique)
2. JSON-LD structured data
3. OpenGraph (sosyal paylaşım önizleme)
4. Canonical URL
5. robots meta

---

## PERFORMANCE KURALLARI

- Her server page'de `export const revalidate = 3600` (en azından)
- İlk ekranda görünen görsellerde `priority` prop zorunlu
- Listeler için `loading.tsx` skeleton
- Sayfa başına max 20-24 ürün (pagination)
- `<img>` tag yasak — her zaman Next.js `<Image>` kullan
- API route'larında `export const revalidate = 3600`

---

## EDİTÖRYEL / HABER KURALLARI

- Haber yazımı: kısa, net, Webtekno tarzı (fazla detay yok)
- Admin panel: makale → Instagram şablonu + Twitter thread otomatik üretilmeli
- Editor rolleri: superadmin > admin > editor (editor sadece kendi haberlerini görür)
- Fotoğraf: her haberde cover_image zorunlu

---

## ÖZGÜN ÖZELLİKLER (rekabet avantajı)

Kimsenin yapmadığı, Compario'nun sahip çıkacağı özellikler:
1. **AI "Bana Göre En İyisi"** — kullanım profiline göre kişisel öneri
2. **1 Tıkla Sosyal Medya Paylaşımı** — haber/ürün → hazır Instagram infografik + Twitter thread
3. **Fiyat Takibi + Bildirim** — kullanıcı kaydedince fiyat düşünce e-posta/push
4. **"Türkiye'de Ne Zaman?"** — yurt dışı ürünler için tahmini çıkış tarihi + fiyat
5. **Satıcı Fiyat Karşılaştırması** — Trendyol, Hepsiburada, Amazon TR fiyatları yan yana

---

## ROADMAP (öncelik sırası)

### Faz 1 — Temel (şimdi)
- [x] Kategori sistemi (hiyerarşi, breadcrumb, mega menu)
- [x] Ürün mimarisi (base model + varyant specs)
- [x] Sitemap.xml
- [ ] SEO schema (BreadcrumbList JSON-LD, CollectionPage, Organization)
- [ ] Performance (revalidate, image priority, pagination, loading.tsx)

### Faz 2 — İçerik
- [ ] Boş kategorilere ürün seed (iPhone tam liste, Tablet, Gaming, Akıllı Saat, Konsol)
- [ ] Instagram/Twitter şablon üreticisi (admin → hazır post)

### Faz 3 — Büyüme
- [ ] Fiyat takibi sistemi
- [ ] Satıcı fiyat karşılaştırması (Trendyol/Hepsiburada entegrasyon)
- [ ] AI "Bana göre en iyisi" öneri sistemi
- [ ] Kullanıcı yorumları + puanlama

---

## ÇALIŞMA KURALLARI

- **Türkçe yaz** (kod yorumları İngilizce olabilir)
- **Kısa ve net** — dolgu ifade, "mükemmel!", "harika!" yok
- **Önce kod, sonra açıklama** — çalışan kod ver
- **TypeScript strict** — `any` kullanma
- **Server Components first** — sadece gerektiğinde `'use client'`
- **Paralel ajan kullan** — karmaşık analizlerde 3-5 ajan aynı anda çalıştır
- **Ürün adına motor/storage yazma** — her zaman specs varyant array
- **Hata alırsan dur, kullanıcıya sor** — tahmin yürütme

## Asla Yapma
- Ürün adına motor/versiyon/depolama bilgisi yazma
- `<img>` tag kullan (Next.js Image kullan)
- `any` type kullan
- Kullanılmayan kod yaz
- Over-engineering yap
- `revalidate` koymadan data fetch eden page yaz
- Breaking change öner (migration plan olmadan)
- Dependencies ekle (önce sor)
