-- ============================================================
-- Compario: newsletter_subscribers tablosu migration
-- Supabase SQL Editor'da çalıştır
-- ============================================================

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email            TEXT        NOT NULL UNIQUE,
  status           TEXT        NOT NULL DEFAULT 'active'
                               CHECK (status IN ('active', 'unsubscribed')),
  subscribed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unsubscribed_at  TIMESTAMPTZ
);

-- İndeks
CREATE INDEX IF NOT EXISTS newsletter_status_idx
  ON newsletter_subscribers(status);

CREATE INDEX IF NOT EXISTS newsletter_subscribed_at_idx
  ON newsletter_subscribers(subscribed_at DESC);

-- Row Level Security
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Okuma izni yok (service role üzerinden yönetilir)
-- Insert izni yok (sadece API route üzerinden)
-- Service role tüm işlemleri yapabilir (RLS'i bypass eder)

-- ============================================================
-- Vercel'e eklenecek environment variable:
--
-- Key:   RESEND_API_KEY
-- Value: re_xxxxxxxxxxxxxxxxxxxxxxxxx   (Resend Dashboard > API Keys)
--
-- Opsiyonel:
-- Key:   RESEND_FROM_EMAIL
-- Value: Compario <noreply@compario.tech>
--
-- NOT: compario.tech domainini Resend Dashboard > Domains altında
--      doğrulamanız gerekiyor. DNS kayıtlarını ekleyin.
--      Test için onboarding@resend.dev kullanabilirsiniz.
-- ============================================================
