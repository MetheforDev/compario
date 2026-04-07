-- ============================================================
-- COMPARIO — Supabase SQL Setup
-- Supabase Dashboard → SQL Editor → yeni query → yapıştır → Run
-- ============================================================


-- ============================================================
-- 1. TABLES
-- ============================================================

-- categories
CREATE TABLE IF NOT EXISTS public.categories (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  slug          text NOT NULL UNIQUE,
  icon          text,
  description   text,
  display_order integer NOT NULL DEFAULT 0,
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- segments
CREATE TABLE IF NOT EXISTS public.segments (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id   uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name          text NOT NULL,
  slug          text NOT NULL,
  description   text,
  price_min     numeric,
  price_max     numeric,
  display_order integer NOT NULL DEFAULT 0,
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (category_id, slug)
);

-- products
CREATE TABLE IF NOT EXISTS public.products (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id       uuid NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  segment_id        uuid REFERENCES public.segments(id) ON DELETE SET NULL,
  name              text NOT NULL,
  slug              text NOT NULL UNIQUE,
  brand             text,
  model             text,
  model_year        integer,
  price_min         numeric,
  price_max         numeric,
  currency          text NOT NULL DEFAULT 'TRY',
  image_url         text,
  images            jsonb NOT NULL DEFAULT '[]',
  specs             jsonb NOT NULL DEFAULT '{}',
  description       text,
  short_description text,
  meta_title        text,
  meta_description  text,
  meta_keywords     text[],
  status            text NOT NULL DEFAULT 'draft'
                      CHECK (status IN ('draft', 'active', 'inactive')),
  is_featured       boolean NOT NULL DEFAULT false,
  view_count        integer NOT NULL DEFAULT 0,
  compare_count     integer NOT NULL DEFAULT 0,
  source            text NOT NULL DEFAULT 'manual',
  source_url        text,
  last_scraped_at   timestamptz,
  published_at      timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- news_articles
CREATE TABLE IF NOT EXISTS public.news_articles (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title               text NOT NULL,
  slug                text NOT NULL UNIQUE,
  excerpt             text,
  content             text NOT NULL DEFAULT '',
  cover_image         text,
  images              text[],
  category            text,
  categories          text[],
  tags                text[],
  related_product_ids uuid[],
  meta_title          text,
  meta_description    text,
  source              text NOT NULL DEFAULT 'manual',
  source_url          text,
  author              text,
  status              text NOT NULL DEFAULT 'draft'
                        CHECK (status IN ('draft', 'published', 'archived')),
  is_featured         boolean NOT NULL DEFAULT false,
  view_count          integer NOT NULL DEFAULT 0,
  published_at        timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);


-- ============================================================
-- 2. INDEXES
-- ============================================================

-- categories
CREATE INDEX IF NOT EXISTS idx_categories_slug      ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active    ON public.categories(is_active);

-- segments
CREATE INDEX IF NOT EXISTS idx_segments_category    ON public.segments(category_id);
CREATE INDEX IF NOT EXISTS idx_segments_slug        ON public.segments(slug);

-- products
CREATE INDEX IF NOT EXISTS idx_products_category    ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_segment     ON public.products(segment_id);
CREATE INDEX IF NOT EXISTS idx_products_slug        ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_status      ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_trending    ON public.products(compare_count DESC, view_count DESC);
CREATE INDEX IF NOT EXISTS idx_products_featured    ON public.products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_search      ON public.products USING gin(
  to_tsvector('turkish', coalesce(name,'') || ' ' || coalesce(brand,'') || ' ' || coalesce(model,''))
);

-- news_articles
CREATE INDEX IF NOT EXISTS idx_news_slug            ON public.news_articles(slug);
CREATE INDEX IF NOT EXISTS idx_news_status          ON public.news_articles(status);
CREATE INDEX IF NOT EXISTS idx_news_published       ON public.news_articles(published_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_news_featured        ON public.news_articles(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_news_categories      ON public.news_articles USING gin(categories);
CREATE INDEX IF NOT EXISTS idx_news_tags            ON public.news_articles USING gin(tags);


-- ============================================================
-- 3. AUTO updated_at TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$ BEGIN
  CREATE TRIGGER trg_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_segments_updated_at
    BEFORE UPDATE ON public.segments
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_news_updated_at
    BEFORE UPDATE ON public.news_articles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ============================================================
-- 4. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.categories    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.segments      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;

-- categories
DROP POLICY IF EXISTS "categories_public_read"  ON public.categories;
DROP POLICY IF EXISTS "categories_service_write" ON public.categories;
CREATE POLICY "categories_public_read"
  ON public.categories FOR SELECT TO anon, authenticated
  USING (is_active = true);
CREATE POLICY "categories_service_write"
  ON public.categories FOR ALL TO service_role USING (true);

-- segments
DROP POLICY IF EXISTS "segments_public_read"  ON public.segments;
DROP POLICY IF EXISTS "segments_service_write" ON public.segments;
CREATE POLICY "segments_public_read"
  ON public.segments FOR SELECT TO anon, authenticated
  USING (is_active = true);
CREATE POLICY "segments_service_write"
  ON public.segments FOR ALL TO service_role USING (true);

-- products
DROP POLICY IF EXISTS "products_public_read"  ON public.products;
DROP POLICY IF EXISTS "products_service_write" ON public.products;
CREATE POLICY "products_public_read"
  ON public.products FOR SELECT TO anon, authenticated
  USING (status = 'active');
CREATE POLICY "products_service_write"
  ON public.products FOR ALL TO service_role USING (true);

-- news_articles
DROP POLICY IF EXISTS "news_public_read"  ON public.news_articles;
DROP POLICY IF EXISTS "news_service_write" ON public.news_articles;
CREATE POLICY "news_public_read"
  ON public.news_articles FOR SELECT TO anon, authenticated
  USING (status = 'published');
CREATE POLICY "news_service_write"
  ON public.news_articles FOR ALL TO service_role USING (true);


-- ============================================================
-- 5. RPC FUNCTIONS
-- ============================================================

-- Ürün görüntülenme sayacı
CREATE OR REPLACE FUNCTION public.increment_product_view(product_uuid uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE public.products
  SET view_count = view_count + 1
  WHERE id = product_uuid;
$$;

-- Haber görüntülenme sayacı
CREATE OR REPLACE FUNCTION public.increment_news_view(article_uuid uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE public.news_articles
  SET view_count = view_count + 1
  WHERE id = article_uuid;
$$;

-- Karşılaştırma sayacı (YENİ)
CREATE OR REPLACE FUNCTION public.increment_compare_count(product_uuid uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE public.products
  SET compare_count = compare_count + 1
  WHERE id = product_uuid;
$$;

-- Anon kullanıcıların bu fonksiyonları çağırmasına izin ver
GRANT EXECUTE ON FUNCTION public.increment_product_view  TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_news_view     TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_compare_count TO anon, authenticated;


-- ============================================================
-- 6. STORAGE — media bucket
-- ============================================================
-- Dashboard'dan manuel yapılacak (SQL ile oluşturulamıyor):
--   Storage → New bucket → Name: media → Public: ON → Save
--
-- Bucket oluşturduktan sonra bu policy'leri çalıştır:

INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Herkes okuyabilir
DROP POLICY IF EXISTS "media_public_read"  ON storage.objects;
DROP POLICY IF EXISTS "media_service_write" ON storage.objects;
DROP POLICY IF EXISTS "media_service_delete" ON storage.objects;
CREATE POLICY "media_public_read"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'media');
CREATE POLICY "media_service_write"
  ON storage.objects FOR INSERT TO service_role
  WITH CHECK (bucket_id = 'media');
CREATE POLICY "media_service_delete"
  ON storage.objects FOR DELETE TO service_role
  USING (bucket_id = 'media');


-- ============================================================
-- TAMAMLANDI
-- ============================================================
-- Kontrol sorguları:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
-- SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public';
