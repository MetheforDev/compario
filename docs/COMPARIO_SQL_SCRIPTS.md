# 🎯 COMPARIO - Database Schema SQL Scripts
# ADIM 3: Database Schema Oluşturma

## 📋 Kullanım Talimatları

1. Supabase Dashboard'a git: https://supabase.com/dashboard/project/bxcwpdfeiyrfekzvvujj
2. Sol sidebar > "SQL Editor"
3. "New Query" butonuna tıkla
4. Aşağıdaki script'leri SIRASIYLA kopyala-yapıştır-çalıştır
5. Her script'ten sonra "RUN" butonuna bas
6. "Success" mesajını gör ✅

---

## 📝 SCRIPT 1: Extensions (PostgreSQL Uzantıları)

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Verify extensions
SELECT * FROM pg_extension WHERE extname IN ('uuid-ossp', 'pg_trgm');
```

**Beklenen Sonuç:** "Success. Rows: 2"

---

## 📝 SCRIPT 2: User Profiles Table

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

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Verify table
SELECT * FROM user_profiles LIMIT 1;
```

**Beklenen Sonuç:** "Success. Table created."

---

## 📝 SCRIPT 3: Categories Table

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

-- Indexes
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_active ON categories(is_active);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies
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

**Beklenen Sonuç:** "Success"

---

## 📝 SCRIPT 4: Segments Table

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

-- Indexes
CREATE INDEX idx_segments_category ON segments(category_id);
CREATE INDEX idx_segments_price_range ON segments(price_min, price_max);
CREATE INDEX idx_segments_active ON segments(is_active);

-- Enable RLS
ALTER TABLE segments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
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

**Beklenen Sonuç:** "Success"

---

## 📝 SCRIPT 5: Products Table (EN ÖNEMLİ!)

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

-- Indexes
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_segment ON products(segment_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_price ON products(price_min, price_max);
CREATE INDEX idx_products_specs ON products USING GIN (specs);
CREATE INDEX idx_products_search ON products USING GIN (
  to_tsvector('turkish', coalesce(name, '') || ' ' || coalesce(brand, '') || ' ' || coalesce(description, ''))
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- RLS Policies
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

**Beklenen Sonuç:** "Success"

---

## 📝 SCRIPT 6: Comparisons & Favorites

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

-- Indexes
CREATE INDEX idx_comparisons_user ON comparisons(user_id);
CREATE INDEX idx_comparisons_category ON comparisons(category_id);
CREATE INDEX idx_comparisons_created ON comparisons(created_at DESC);

-- Enable RLS
ALTER TABLE comparisons ENABLE ROW LEVEL SECURITY;

-- RLS Policies
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

-- Indexes
CREATE INDEX idx_favorites_user ON user_favorites(user_id);
CREATE INDEX idx_favorites_product ON user_favorites(product_id);

-- Enable RLS
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own favorites"
  ON user_favorites FOR ALL
  USING (auth.uid() = user_id);
```

**Beklenen Sonuç:** "Success"

---

## 📝 SCRIPT 7: Scraper Tables

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

-- Enable RLS
ALTER TABLE scraper_configs ENABLE ROW LEVEL SECURITY;

-- RLS Policy
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

-- Indexes
CREATE INDEX idx_scraper_logs_config ON scraper_logs(scraper_config_id);
CREATE INDEX idx_scraper_logs_created ON scraper_logs(created_at DESC);

-- Enable RLS
ALTER TABLE scraper_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Only admins can view scraper logs"
  ON scraper_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

**Beklenen Sonuç:** "Success"

---

## 📝 SCRIPT 8: Functions & Triggers

```sql
-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to tables
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

CREATE TRIGGER update_scraper_configs_updated_at 
  BEFORE UPDATE ON scraper_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Increment product view count function
CREATE OR REPLACE FUNCTION increment_product_view(product_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE products
  SET view_count = view_count + 1
  WHERE id = product_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Beklenen Sonuç:** "Success"

---

## 📝 SCRIPT 9: Seed Data - Categories

```sql
-- Insert categories
INSERT INTO categories (name, slug, icon, description, display_order) VALUES
  ('Araçlar', 'araclar', '🚗', 'Otomobil ve araç karşılaştırmaları', 1),
  ('Telefonlar', 'telefonlar', '📱', 'Akıllı telefon karşılaştırmaları', 2),
  ('Laptoplar', 'laptoplar', '💻', 'Dizüstü bilgisayar karşılaştırmaları', 3),
  ('TV & Monitörler', 'tv-monitorler', '📺', 'Televizyon ve monitör karşılaştırmaları', 4),
  ('Beyaz Eşya', 'beyaz-esya', '🏠', 'Ev aletleri karşılaştırmaları', 5),
  ('Ses Sistemleri', 'ses-sistemleri', '🎧', 'Kulaklık ve hoparlör karşılaştırmaları', 6);

-- Verify
SELECT id, name, slug, icon FROM categories ORDER BY display_order;
```

**Beklenen Sonuç:** "Success. 6 rows inserted"

---

## 📝 SCRIPT 10: Seed Data - Segments

```sql
-- Insert segments for Araçlar category
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

-- Verify
SELECT s.name, c.name as category, s.price_min, s.price_max
FROM segments s
JOIN categories c ON s.category_id = c.id
ORDER BY s.display_order;
```

**Beklenen Sonuç:** "Success. 4 rows inserted"

---

## 📝 SCRIPT 11: Test Product

```sql
-- Insert test product (Kia Sportage)
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
      "tuketim_sehir": "8.5 L/100km",
      "tuketim_karayolu": "5.8 L/100km"
    },
    "boyutlar": {
      "uzunluk": "4515 mm",
      "genislik": "1865 mm",
      "yukseklik": "1650 mm",
      "bagaj": "591 L"
    },
    "guvenlik": {
      "ncap_rating": 5,
      "airbag": 6,
      "abs": true,
      "esp": true,
      "otonom_fren": true
    },
    "donanim": {
      "sunroof": true,
      "deri_koltuk": true,
      "navigasyon": true,
      "kamera_360": true
    }
  }'::jsonb,
  'Kia Sportage yeni nesil hibrit motoruyla güçlü performans ve düşük yakıt tüketimi sunuyor. 5 yıldızlı Euro NCAP güvenlik notu ile aileniz için ideal SUV.',
  'Güçlü, ekonomik ve güvenli SUV',
  'active'
FROM categories c
JOIN segments s ON s.category_id = c.id
WHERE c.slug = 'araclar' AND s.slug = 'suv';

-- Verify
SELECT 
  p.name,
  p.brand,
  p.model,
  c.name as category,
  s.name as segment,
  p.price_min,
  p.status
FROM products p
JOIN categories c ON p.category_id = c.id
JOIN segments s ON p.segment_id = s.id;
```

**Beklenen Sonuç:** "Success. 1 row inserted"

---

## ✅ TAMAMLANDI!

### Checklist
- [ ] Script 1: Extensions ✅
- [ ] Script 2: User Profiles ✅
- [ ] Script 3: Categories ✅
- [ ] Script 4: Segments ✅
- [ ] Script 5: Products ✅
- [ ] Script 6: Comparisons & Favorites ✅
- [ ] Script 7: Scraper Tables ✅
- [ ] Script 8: Functions & Triggers ✅
- [ ] Script 9: Seed Categories ✅
- [ ] Script 10: Seed Segments ✅
- [ ] Script 11: Test Product ✅

---

## 🔍 Verify (Final Check)

```sql
-- Check all tables
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Count data
SELECT 
  'categories' as table_name, COUNT(*) as row_count FROM categories
UNION ALL
SELECT 'segments', COUNT(*) FROM segments
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'user_profiles', COUNT(*) FROM user_profiles;
```

**Beklenen Sonuç:** 
- categories: 6
- segments: 4
- products: 1
- user_profiles: 0

---

## 🎯 Sonraki Adım

**ADIM 4: Storage Bucket Oluştur**

1. Sol sidebar > "Storage"
2. "Create a new bucket"
3. Name: `product-images`
4. Public: YES
5. Create!

---

**Tüm script'ler başarıyla çalıştı mı? ✅**
**Sonraki adıma geçelim! 🚀**
