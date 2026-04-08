-- ============================================================
-- Compario: reviews tablosu migration
-- Supabase SQL Editor'da çalıştır
-- ============================================================

CREATE TABLE IF NOT EXISTS reviews (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id         UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewer_name   TEXT,
  reviewer_email  TEXT,
  rating          SMALLINT    NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment         TEXT        NOT NULL,
  helpful_count   INTEGER     NOT NULL DEFAULT 0,
  status          TEXT        NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- İndeksler
CREATE INDEX IF NOT EXISTS reviews_product_status_idx
  ON reviews(product_id, status);

CREATE INDEX IF NOT EXISTS reviews_status_created_idx
  ON reviews(status, created_at DESC);

-- Row Level Security
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Herkes onaylı yorumları okuyabilir
CREATE POLICY "reviews_select_approved" ON reviews
  FOR SELECT
  USING (status = 'approved');

-- Herkes yeni yorum ekleyebilir (pending olarak)
CREATE POLICY "reviews_insert_pending" ON reviews
  FOR INSERT
  WITH CHECK (status = 'pending');

-- Service role tüm işlemleri yapabilir (admin paneli için)
-- Not: Supabase service_role zaten RLS'i bypass eder,
--      bu satır ek güvence olarak bırakılmıştır.

-- ============================================================
-- Email/password auth zaten Supabase Dashboard > Auth > Providers
-- altında "Email" toggle ile aktif edilebilir.
-- Anonymous yorumlar için email zorunlu değil (reviewer_email nullable).
-- ============================================================
