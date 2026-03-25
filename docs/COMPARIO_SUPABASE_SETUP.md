# Compario - Supabase Setup Guide (Step-by-Step)

## 🎯 Supabase Project Bilgileri

```
Project Name: Compario
Database Password: [ŞİMDİ BELİRLEYECEĞİZ - KAYDET!]
Region: Frankfurt (Europe Central)
Organization: Compario Tech
```

---

## 📋 ADIM 1: Supabase Project Oluştur

### 1.1 Supabase Dashboard
```
1. Git: https://supabase.com/dashboard
2. Sign in with: rumeliskelesi@gmail.com
3. Click: "New Project"
```

### 1.2 Project Ayarları
```
Organization: Create new → "Compario Tech"
Name: compario-production
Database Password: [GÜÇLÜ ŞİFRE OLUŞTUR]
Region: Europe Central (Frankfurt) - en yakın
Pricing Plan: Free (şimdilik)
```

### 1.3 Password Örneği (Güçlü)
```
Öneri format: Compario2026!Tech@Prod
VEYA şu şekilde oluştur:
1. Git: https://passwordsgenerator.net/
2. Length: 20 characters
3. Include: uppercase, lowercase, numbers, symbols
4. KAYDET: LastPass, 1Password veya güvenli bir yerde!
```

---

## 📋 ADIM 2: API Keys ve Connection Strings Al

### 2.1 Project Settings
```
1. Supabase Dashboard'da sol sidebar
2. "Settings" > "API"
3. Şunları kopyala:
```

### 2.2 Kopyalanacak Bilgiler
```env
# Project URL
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co

# Anon (Public) Key - Frontend için
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Service Role Key - Backend/Admin için (GİZLİ TUT!)
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Project Reference ID
SUPABASE_PROJECT_REF=xxxxxxxxxxxxxx
```

### 2.3 Bu Bilgileri Kaydet
```
1. Bir text dosyasına yapıştır: "compario-supabase-keys.txt"
2. Google Drive'a yükle (gizli klasöre)
3. VEYA 1Password/LastPass'e kaydet
```

---

## 📋 ADIM 3: Database Schema Oluştur

### 3.1 SQL Editor'e Git
```
1. Supabase Dashboard'da sol sidebar
2. "SQL Editor"
3. "New Query" butonu
```

### 3.2 Schema Scripts (Sırasıyla Çalıştır)

#### Script 1: Extensions
```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search
```

#### Script 2: User Profiles Table
```sql
-- User profiles (extends Supabase Auth)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);
```

**✅ Test: "RUN" butonuna tıkla. "Success" görmelisin!**

---

#### Script 3: Categories Table
```sql
-- Categories (Araçlar, Telefonlar, etc.)
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_active ON categories(is_active);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active categories"
  ON categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Only admins can modify categories"
  ON categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

**✅ Test: RUN > "Success"**

---

#### Script 4: Segments Table
```sql
-- Segments (SUV, Sedan, Flagship, etc.)
CREATE TABLE segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  price_min DECIMAL(12, 2),
  price_max DECIMAL(12, 2),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category_id, slug)
);

CREATE INDEX idx_segments_category ON segments(category_id);
CREATE INDEX idx_segments_price_range ON segments(price_min, price_max);
CREATE INDEX idx_segments_active ON segments(is_active);

ALTER TABLE segments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active segments"
  ON segments FOR SELECT
  USING (is_active = true);

CREATE POLICY "Only admins can modify segments"
  ON segments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

**✅ Test: RUN > "Success"**

---

#### Script 5: Products Table (EN ÖNEMLİ!)
```sql
-- Products (Ana tablo)
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE RESTRICT,
  segment_id UUID REFERENCES segments(id) ON DELETE SET NULL,
  
  -- Basic Info
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  brand TEXT,
  model TEXT,
  model_year INTEGER,
  
  -- Pricing
  price_min DECIMAL(12, 2),
  price_max DECIMAL(12, 2),
  currency TEXT DEFAULT 'TRY',
  
  -- Media
  image_url TEXT,
  images JSONB DEFAULT '[]',
  
  -- Specifications (flexible JSONB)
  specs JSONB DEFAULT '{}',
  
  -- Meta
  description TEXT,
  short_description TEXT,
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  is_featured BOOLEAN DEFAULT false,
  
  -- Tracking
  view_count INTEGER DEFAULT 0,
  compare_count INTEGER DEFAULT 0,
  
  -- Data Source
  source TEXT DEFAULT 'manual',
  source_url TEXT,
  last_scraped_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_segment ON products(segment_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_price ON products(price_min, price_max);
CREATE INDEX idx_products_specs ON products USING GIN (specs);
CREATE INDEX idx_products_search ON products USING GIN (
  to_tsvector('turkish', coalesce(name, '') || ' ' || coalesce(brand, '') || ' ' || coalesce(description, ''))
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  USING (status = 'active');

CREATE POLICY "Only admins can modify products"
  ON products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

**✅ Test: RUN > "Success"**

---

#### Script 6: Comparisons & Favorites
```sql
-- Comparisons
CREATE TABLE comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  product_ids UUID[] NOT NULL,
  category_id UUID REFERENCES categories(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (array_length(product_ids, 1) >= 2 AND array_length(product_ids, 1) <= 10)
);

CREATE INDEX idx_comparisons_user ON comparisons(user_id);
CREATE INDEX idx_comparisons_category ON comparisons(category_id);
CREATE INDEX idx_comparisons_created ON comparisons(created_at DESC);

ALTER TABLE comparisons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own comparisons"
  ON comparisons FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create comparisons"
  ON comparisons FOR INSERT
  WITH CHECK (true);

-- User Favorites
CREATE TABLE user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX idx_favorites_user ON user_favorites(user_id);
CREATE INDEX idx_favorites_product ON user_favorites(product_id);

ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own favorites"
  ON user_favorites FOR ALL
  USING (auth.uid() = user_id);
```

**✅ Test: RUN > "Success"**

---

#### Script 7: Scraper Tables
```sql
-- Scraper Configs
CREATE TABLE scraper_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  target_url TEXT NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  selectors JSONB NOT NULL,
  schedule TEXT DEFAULT '0 3 * * *',
  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  total_runs INTEGER DEFAULT 0,
  total_products_scraped INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE scraper_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can access scraper configs"
  ON scraper_configs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Scraper Logs
CREATE TABLE scraper_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scraper_config_id UUID REFERENCES scraper_configs(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('running', 'success', 'failed')),
  products_found INTEGER DEFAULT 0,
  products_updated INTEGER DEFAULT 0,
  products_created INTEGER DEFAULT 0,
  error_message TEXT,
  execution_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scraper_logs_config ON scraper_logs(scraper_config_id);
CREATE INDEX idx_scraper_logs_created ON scraper_logs(created_at DESC);

ALTER TABLE scraper_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view scraper logs"
  ON scraper_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

**✅ Test: RUN > "Success"**

---

#### Script 8: Functions & Triggers
```sql
-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_categories_updated_at 
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_segments_updated_at 
  BEFORE UPDATE ON segments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at 
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Increment product view count
CREATE OR REPLACE FUNCTION increment_product_view(product_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE products
  SET view_count = view_count + 1
  WHERE id = product_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**✅ Test: RUN > "Success"**

---

## 📋 ADIM 4: Test Data (Seed)

### 4.1 Categories Seed
```sql
INSERT INTO categories (name, slug, icon, description, display_order) VALUES
  ('Araçlar', 'araclar', '🚗', 'Otomobil ve araç karşılaştırmaları', 1),
  ('Telefonlar', 'telefonlar', '📱', 'Akıllı telefon karşılaştırmaları', 2),
  ('Laptoplar', 'laptoplar', '💻', 'Dizüstü bilgisayar karşılaştırmaları', 3),
  ('TV & Monitörler', 'tv-monitorler', '📺', 'Televizyon ve monitör karşılaştırmaları', 4),
  ('Beyaz Eşya', 'beyaz-esya', '🏠', 'Ev aletleri karşılaştırmaları', 5),
  ('Ses Sistemleri', 'ses-sistemleri', '🎧', 'Kulaklık ve hoparlör karşılaştırmaları', 6);
```

**✅ Test: RUN > "Success. 6 rows inserted"**

---

### 4.2 Segments Seed (Araçlar için)
```sql
-- Get araclar category_id
INSERT INTO segments (category_id, name, slug, description, price_min, price_max, display_order)
SELECT 
  id,
  'SUV',
  'suv',
  'Şehir içi ve arazi araçları',
  800000,
  2000000,
  1
FROM categories WHERE slug = 'araclar'
UNION ALL
SELECT 
  id,
  'Sedan',
  'sedan',
  'Klasik sedan otomobiller',
  600000,
  1500000,
  2
FROM categories WHERE slug = 'araclar'
UNION ALL
SELECT 
  id,
  'Hatchback',
  'hatchback',
  'Kompakt şehir araçları',
  400000,
  900000,
  3
FROM categories WHERE slug = 'araclar'
UNION ALL
SELECT 
  id,
  'Elektrikli',
  'elektrikli',
  'Elektrikli araçlar',
  1000000,
  3000000,
  4
FROM categories WHERE slug = 'araclar';
```

**✅ Test: RUN > "Success. 4 rows inserted"**

---

### 4.3 Test Product (İlk ürün!)
```sql
INSERT INTO products (
  category_id,
  segment_id,
  name,
  slug,
  brand,
  model,
  model_year,
  price_min,
  price_max,
  specs,
  description,
  short_description,
  status
)
SELECT 
  c.id,
  s.id,
  'Kia Sportage 1.6 T-GDI',
  'kia-sportage-1-6-t-gdi-2024',
  'Kia',
  'Sportage',
  2024,
  1250000,
  1450000,
  '{
    "motor": {
      "hacim": "1.6 T-GDI",
      "guc": "180 HP",
      "tork": "265 Nm",
      "yakit": "Benzin"
    },
    "performans": {
      "hiz_0_100": "9.2 sn",
      "max_hiz": "210 km/h",
      "tuketim_sehir": "8.5 L/100km"
    },
    "guvenlik": {
      "ncap_rating": 5,
      "airbag": 6,
      "abs": true,
      "esp": true
    }
  }'::jsonb,
  'Kia Sportage yeni nesil hibrit motoruyla güçlü performans ve düşük yakıt tüketimi sunuyor.',
  'Güçlü, ekonomik ve güvenli SUV',
  'active'
FROM categories c
JOIN segments s ON s.category_id = c.id
WHERE c.slug = 'araclar' AND s.slug = 'suv';
```

**✅ Test: RUN > "Success. 1 row inserted"**

---

## 📋 ADIM 5: Verify (Kontrol Et!)

### 5.1 Table Editor'de Kontrol
```
1. Sol sidebar > "Table Editor"
2. Sırasıyla kontrol et:
   - categories → 6 row olmalı
   - segments → 4 row olmalı
   - products → 1 row olmalı
```

### 5.2 SQL Query ile Kontrol
```sql
-- Tüm kategorileri göster
SELECT * FROM categories;

-- Segment'leri kategoriyle birlikte
SELECT 
  c.name as category,
  s.name as segment,
  s.price_min,
  s.price_max
FROM segments s
JOIN categories c ON s.category_id = c.id;

-- İlk ürünü göster
SELECT 
  p.name,
  p.brand,
  p.model,
  c.name as category,
  s.name as segment,
  p.price_min,
  p.specs
FROM products p
JOIN categories c ON p.category_id = c.id
JOIN segments s ON p.segment_id = s.id;
```

**Her query "Success" dönmeli ve data görülmeli!**

---

## 📋 ADIM 6: Storage Bucket Oluştur

### 6.1 Storage'a Git
```
1. Sol sidebar > "Storage"
2. "Create a new bucket"
```

### 6.2 Bucket Ayarları
```
Name: product-images
Public: YES (ürün resimleri herkese açık)
File size limit: 5 MB
Allowed MIME types: image/jpeg, image/png, image/webp
```

### 6.3 Policies Ekle
```
SQL Editor > New Query:
```

```sql
-- Anyone can view images
CREATE POLICY "Public images are viewable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Only admins can upload
CREATE POLICY "Admins can upload images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images' 
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

---

## 📋 ADIM 7: İlk Admin User Oluştur

### 7.1 Signup Yap (Manuel)
```
Şimdilik manuel:
1. Compario web app hazır olunca
2. Normal signup yap (email: rumeliskelesi@gmail.com)
3. Sonra SQL ile admin yap
```

### 7.2 Admin Yapma SQL (Sonra çalıştırılacak)
```sql
-- Email ile user bul ve admin yap
UPDATE user_profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'rumeliskelesi@gmail.com'
);
```

---

## ✅ TAMAMLANDI!

### Supabase Setup Checklist
- [x] Project oluşturuldu
- [x] API keys alındı
- [x] Database schema çalıştırıldı
- [x] Test data eklendi
- [x] Storage bucket oluşturuldu
- [x] Policies eklendi

---

## 📝 Sonraki Adımlar

1. **GitHub Repo Oluştur**
2. **Local Project Setup**
3. **.env dosyası oluştur**
4. **Database package yaz**
5. **Next.js app başlat**

---

## 🔑 ÖNEMLİ: Keys'leri Sakla!

```env
# compario/.env.local
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...
SUPABASE_PROJECT_REF=xxxxxxxx
```

**Bu dosyayı GIT'E EKLEME! (.gitignore'da olmalı)**

---

**Hazır mısınız? GitHub repo oluşturalım! 🚀**
