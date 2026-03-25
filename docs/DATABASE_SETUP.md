# CompareHub - Database Setup Guide

## 🗄️ Supabase Configuration

### Why Supabase?
- ✅ Free Tier: 500MB database, 1GB file storage, 2GB bandwidth
- ✅ Built-in Auth (JWT, email verification, social login)
- ✅ Real-time subscriptions
- ✅ Auto-generated REST API
- ✅ Row Level Security (RLS)
- ✅ Storage for product images

---

## 📦 Database Schema

### Core Tables

#### 1. users (Supabase Auth - built-in)
```sql
-- Supabase otomatik oluşturur, biz sadece profil tablosu ekleriz
```

#### 2. user_profiles
```sql
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

#### 3. categories
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT, -- Emoji veya icon kodu
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_active ON categories(is_active);

-- RLS Policies
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

#### 4. segments
```sql
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

-- RLS Policies
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

#### 5. products
```sql
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
  images JSONB DEFAULT '[]', -- Array of image URLs
  
  -- Specifications (flexible JSONB for different product types)
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
  source TEXT, -- 'manual', 'scraped', 'api'
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

-- Full-text search
CREATE INDEX idx_products_search ON products USING GIN (
  to_tsvector('turkish', coalesce(name, '') || ' ' || coalesce(brand, '') || ' ' || coalesce(description, ''))
);

-- RLS Policies
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

#### 6. comparisons
```sql
CREATE TABLE comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT, -- For anonymous users
  
  product_ids UUID[] NOT NULL,
  category_id UUID REFERENCES categories(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CHECK (array_length(product_ids, 1) >= 2 AND array_length(product_ids, 1) <= 10)
);

-- Indexes
CREATE INDEX idx_comparisons_user ON comparisons(user_id);
CREATE INDEX idx_comparisons_category ON comparisons(category_id);
CREATE INDEX idx_comparisons_created ON comparisons(created_at DESC);

-- RLS Policies
ALTER TABLE comparisons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own comparisons"
  ON comparisons FOR SELECT
  USING (
    auth.uid() = user_id 
    OR session_id = current_setting('app.session_id', true)
  );

CREATE POLICY "Users can create comparisons"
  ON comparisons FOR INSERT
  WITH CHECK (true);
```

#### 7. user_favorites
```sql
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

-- RLS Policies
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own favorites"
  ON user_favorites FOR ALL
  USING (auth.uid() = user_id);
```

#### 8. scraper_configs
```sql
CREATE TABLE scraper_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  target_url TEXT NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  
  -- Scraper settings
  selectors JSONB NOT NULL, -- CSS selectors for data extraction
  schedule TEXT DEFAULT '0 3 * * *', -- Cron expression
  is_active BOOLEAN DEFAULT true,
  
  -- Stats
  last_run_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  total_runs INTEGER DEFAULT 0,
  total_products_scraped INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE scraper_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can access scraper configs"
  ON scraper_configs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

#### 9. scraper_logs
```sql
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

-- RLS Policies
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

---

## 🔄 Database Functions

### Update timestamp trigger
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_segments_updated_at BEFORE UPDATE ON segments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Product view counter
```sql
CREATE OR REPLACE FUNCTION increment_product_view(product_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE products
  SET view_count = view_count + 1
  WHERE id = product_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 🌱 Seed Data

### Initial Categories
```sql
INSERT INTO categories (name, slug, icon, description, display_order) VALUES
  ('Araçlar', 'araclar', '🚗', 'Otomobil ve araç karşılaştırmaları', 1),
  ('Telefonlar', 'telefonlar', '📱', 'Akıllı telefon karşılaştırmaları', 2),
  ('Laptoplar', 'laptoplar', '💻', 'Dizüstü bilgisayar karşılaştırmaları', 3),
  ('TV & Monitörler', 'tv-monitorler', '📺', 'Televizyon ve monitör karşılaştırmaları', 4),
  ('Beyaz Eşya', 'beyaz-esya', '🏠', 'Ev aletleri karşılaştırmaları', 5),
  ('Ses Sistemleri', 'ses-sistemleri', '🎧', 'Kulaklık ve hoparlör karşılaştırmaları', 6);
```

### Initial Segments (Araçlar kategorisi için)
```sql
-- Get category_id first
DO $$
DECLARE
  arac_category_id UUID;
BEGIN
  SELECT id INTO arac_category_id FROM categories WHERE slug = 'araclar';
  
  INSERT INTO segments (category_id, name, slug, description, price_min, price_max, display_order) VALUES
    (arac_category_id, 'SUV', 'suv', 'Şehir içi ve arazi araçları', 800000, 2000000, 1),
    (arac_category_id, 'Sedan', 'sedan', 'Klasik sedan otomobiller', 600000, 1500000, 2),
    (arac_category_id, 'Hatchback', 'hatchback', 'Kompakt şehir araçları', 400000, 900000, 3),
    (arac_category_id, 'Elektrikli', 'elektrikli', 'Elektrikli araçlar', 1000000, 3000000, 4);
END $$;
```

---

## 📊 Views for Analytics

### Product statistics view
```sql
CREATE VIEW product_stats AS
SELECT 
  c.name as category_name,
  s.name as segment_name,
  COUNT(p.id) as product_count,
  AVG(p.price_min) as avg_price_min,
  AVG(p.price_max) as avg_price_max,
  SUM(p.view_count) as total_views,
  SUM(p.compare_count) as total_comparisons
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN segments s ON p.segment_id = s.id
WHERE p.status = 'active'
GROUP BY c.name, s.name;
```

### Popular products view
```sql
CREATE VIEW popular_products AS
SELECT 
  p.*,
  c.name as category_name,
  s.name as segment_name,
  (p.view_count * 0.3 + p.compare_count * 0.7) as popularity_score
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN segments s ON p.segment_id = s.id
WHERE p.status = 'active'
ORDER BY popularity_score DESC;
```

---

## 🔐 Storage Buckets (Supabase Storage)

### Product Images Bucket
```sql
-- Supabase Dashboard'dan oluşturulacak
-- Bucket name: product-images
-- Public access: true
-- File size limit: 5MB
-- Allowed file types: image/jpeg, image/png, image/webp
```

### Storage Policies
```sql
-- Anyone can view images
CREATE POLICY "Public images are viewable by everyone"
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

## 🚀 Quick Setup Commands

### 1. Create Supabase Project
```bash
# supabase.com'a git
# New Project oluştur
# Project name: ComparHub
# Database Password: [güçlü şifre]
# Region: Frankfurt (en yakın)
```

### 2. Run All SQL Scripts
```sql
-- Yukarıdaki tüm SQL scriptleri sırasıyla Supabase SQL Editor'de çalıştır:
-- 1. Tables
-- 2. Indexes
-- 3. RLS Policies
-- 4. Functions
-- 5. Triggers
-- 6. Views
-- 7. Seed Data
```

### 3. Get Connection Strings
```bash
# Project Settings > API
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc... (admin access)
```

---

## 📝 Notes

### Specs JSONB Structure Examples

**Araçlar:**
```json
{
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
    "360_kamera": true
  }
}
```

**Telefonlar:**
```json
{
  "ekran": {
    "boyut": "6.7 inch",
    "cozunurluk": "2796 x 1290",
    "teknoloji": "LTPO OLED",
    "yenileme": "120 Hz"
  },
  "islemci": {
    "marka": "Apple",
    "model": "A17 Pro",
    "cekirdek": "6",
    "gpu": "6-core"
  },
  "kamera": {
    "ana": "48 MP",
    "ultra_wide": "12 MP",
    "telefoto": "12 MP",
    "on": "12 MP"
  },
  "batarya": {
    "kapasite": "4422 mAh",
    "sarj_hizi": "27W"
  },
  "bellek": {
    "ram": "8 GB",
    "depolama": ["256 GB", "512 GB", "1 TB"]
  }
}
```

---

## 🔄 Migration Strategy

### From manual to scraped data
1. Manuel ürünlerde `source = 'manual'` set et
2. Scraper çalışınca `source = 'scraped'` ve `source_url` ekle
3. Conflict'lerde: slug bazlı merge yap
4. `last_scraped_at` ile freshness kontrol et

### Data quality
- Manuel data = 100% güvenilir
- Scraped data = validation sonrası active
- Admin approval için `status = 'draft'` kullan

---

## 📚 Additional Resources

- **Supabase Docs:** https://supabase.com/docs
- **RLS Guide:** https://supabase.com/docs/guides/auth/row-level-security
- **Realtime:** https://supabase.com/docs/guides/realtime
- **Storage:** https://supabase.com/docs/guides/storage
