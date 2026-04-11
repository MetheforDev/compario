/**
 * Seed script: İlk karşılaştırma haberi
 * Çalıştır: node scripts/seed-first-article.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// .env.local'dan oku (monorepo root'undan apps/web/.env.local)
const __dir = dirname(fileURLToPath(import.meta.url));
let env = {};
try {
  const raw = readFileSync(resolve(__dir, '../apps/web/.env.local'), 'utf8');
  raw.split('\n').forEach((line) => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
} catch { /* env vars zaten set edilmiş olabilir */ }

const SUPABASE_URL     = process.env.NEXT_PUBLIC_SUPABASE_URL  || env['NEXT_PUBLIC_SUPABASE_URL'];
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY  || env['SUPABASE_SERVICE_KEY'];

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL veya SUPABASE_SERVICE_KEY eksik');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ─── Makale İçeriği ───────────────────────────────────────────────────────────

const CONTENT = `
2026 yılında Türkiye elektrikli ve hybrid araç pazarı, tarihin en hareketli dönemini yaşıyor. Artan şarj altyapısı, devam eden ÖTV teşvikleri ve yeni modellerin piyasaya çıkmasıyla birlikte 2 milyon TL bütçesiyle gerçek anlamda rekabetçi seçenekler masaya geliyor.

Bu karşılaştırmada üç güçlü rakibi inceliyoruz: süpriz fiyat politikasıyla çıkış yapan **Kia EV2**, Çin otomotiv devinin amiral gemisi **BYD Atto 3** ve güvenilirliğiyle öne çıkan **Toyota C-HR Hybrid**. Hangisi paranızın gerçek karşılığını veriyor?

## Türkiye Elektrikli Araç Pazarı: 2026 Durumu

Türkiye Otomotiv Distribütörleri Derneği verilerine göre 2026'nın ilk çeyreğinde sıfır emisyonlu araç satışları geçen yılın aynı dönemine kıyasla %38 arttı. Hızlı şarj istasyonu sayısı 18.000'i geçti; otoyollarda ortalama her 80 km'de bir hızlı şarj noktasına ulaşmak mümkün.

2 milyon TL segmentinde üç isim özellikle dikkat çekiyor. Fiyat/menzil dengesi, şarj hızı ve pratik günlük kullanım kabiliyeti açısından bu üçlüyü masaya yatırdık.

---

## Kia EV2 — Segment Bombası

Kia'nın en uygun fiyatlı elektrikli modeli olan EV2, 1.800.000 ₺ başlangıç fiyatıyla bu segmentin en çekici girişi. 61 kWh'lik bataryasıyla WLTP'ye göre 448 km menzil sunuyor; gerçek dünya koşullarında şehir içi kullanımda bu rakam 370-400 km bandına oturuyor.

145 HP gücünde tek ön motorlu tahrik sistemi sunuyor. 0-100 km/s hızlanması 8,5 saniye ile spor bir his vermese de trafik içinde son derece çevik. 100 kW DC hızlı şarj desteğiyle 10'dan 80'e yalnızca 28 dakika yeterli.

**Güçlü yönleri:** Fiyat, garanti paketi (7 yıl/150.000 km batarya), şarj hızı ve iç mekan kalitesi segmentin üzerinde.
**Zayıf yönleri:** Bagaj hacmi kompakt (352L), yüksek hızda menzil önemli ölçüde düşüyor.

---

## BYD Atto 3 — Teknoloji Yüklü Rakip

BYD Atto 3, Blade batarya teknolojisiyle güvenlik alanında gerçek bir atılım sunuyor. 60,5 kWh'lik LFP bataryasıyla 420 km menzil vaat ediyor. 204 HP'lik motoru ve 7,3 saniyelik 0-100 performansıyla bu segmentte en güçlü seçenek.

Döner ekran, 12,8 inç çapraz dönen infotainment sistemi ve zengin donanım paketi dikkat çekiyor. Ancak fiyatı 2.250.000 ₺'ye çıkmış; bu karşılaştırmanın başlık rakamı olan 2M'nin üzerinde.

**Güçlü yönleri:** Motor gücü, hızlanma, batarya güvenliği (LFP kimyası), büyük bagaj (440L).
**Zayıf yönleri:** Şarj hızı (80 kW), marka servis ağının gelişmekte olması, fiyat.

---

## Toyota C-HR Hybrid — Konvansiyonel Güvenilirlik

C-HR Hybrid, tam elektrikli değil ama segment için çok önemli: her yerde şarj sorunu yaşamadan, benzin istasyonlarına erişimle hibrit rahatlık. 2.090.000 ₺ fiyatıyla elektrikli rakiplerine kıyasla uygun konumda.

2.0 litrelik hibrit sistemi 197 HP toplam güç üretiyor, 0-100 km/s süresini 8,0 saniyede tamamlıyor. Ortalama yakıt tüketimi 5,3 L/100 km ile segmentin en ekonomikleri arasında. Şarj altyapısı endişesi yoksa ve uzun yol ağırlıklı bir kullanıcıysanız değerlendirmeye alın.

**Güçlü yönleri:** Şarj bağımlılığı yok, düşük yakıt tüketimi, Toyota güvenilirliği, servis ağı.
**Zayıf yönleri:** Tam elektrikli değil, günlük şehir içi verimlilikte EV'lerin gerisinde.

---

\`\`\`compare
{
  "products": [
    {
      "name": "Kia EV2",
      "price": "1.800.000 ₺",
      "badge": "En Uygun Fiyat",
      "winner": true,
      "specs": [
        { "label": "Menzil", "value": "448 km", "better": true },
        { "label": "Güç", "value": "145 HP" },
        { "label": "Batarya", "value": "61 kWh", "better": true },
        { "label": "0-100 km/s", "value": "8.5 sn" },
        { "label": "Hızlı Şarj", "value": "100 kW", "better": true }
      ]
    },
    {
      "name": "BYD Atto 3",
      "price": "2.250.000 ₺",
      "badge": "En Güçlü",
      "specs": [
        { "label": "Menzil", "value": "420 km" },
        { "label": "Güç", "value": "204 HP", "better": true },
        { "label": "Batarya", "value": "60.5 kWh" },
        { "label": "0-100 km/s", "value": "7.3 sn", "better": true },
        { "label": "Hızlı Şarj", "value": "80 kW" }
      ]
    },
    {
      "name": "Toyota C-HR Hybrid",
      "price": "2.090.000 ₺",
      "badge": "En Güvenilir",
      "specs": [
        { "label": "Menzil", "value": "Sınırsız (Hibrit)" },
        { "label": "Güç", "value": "197 HP" },
        { "label": "Tüketim", "value": "5.3 L/100km", "better": true },
        { "label": "0-100 km/s", "value": "8.0 sn" },
        { "label": "Şarj", "value": "Gereksiz", "better": true }
      ]
    }
  ],
  "verdict": "Fiyat/performans dengesinde Kia EV2 açık ara öne çıkıyor. 448 km menzil ve 100 kW hızlı şarj desteğiyle hem şehir hem yol için güçlü bir seçenek — üstelik rakiplerine göre 250.000-450.000 ₺ daha uygun."
}
\`\`\`

---

## Sonuç: Kia EV2 Neden Kazanıyor?

Rakamlar konuşuyor: Kia EV2, bu segmentte fiyat-menzil-şarj hızı üçgeninde en dengeli konumu işgal ediyor.

BYD Atto 3 daha güçlü ve daha büyük bagajlı ama 450.000 ₺ fark zor savunuluyor. Toyota C-HR Hybrid şarj altyapısı olmayanlar için harika bir seçenek; ancak uzun vadeli yakıt maliyetleri düşünüldüğünde tam elektrikli araçların avantajı her yıl artıyor.

**Kim için ne almalı?**

- **Şehir içi + ara yolculuk, bütçe öncelikli:** Kia EV2
- **Yüksek performans ve büyük bagaj:** BYD Atto 3 _(fiyat toleransınız varsa)_
- **Şarj altyapısı olmayan bölge, uzun yol ağırlıklı:** Toyota C-HR Hybrid

Kia EV2, 2026'nın bu segmentindeki **en iyi fiyat/değer teklifini** sunuyor. Bütçeniz müsaadeyse BYD Atto 3'ün gücünü değerlendirin; ancak 1,8 milyon bütçeyle 448 km menzil vaat eden başka bir araç şu an yok.
`.trim();

// ─── Makale Verisi ────────────────────────────────────────────────────────────

const article = {
  title: '2 Milyon TL Altı En İyi Elektrikli ve Hybrid Araçlar (2026)',
  slug: '2m-alti-en-iyi-elektrikli-hybrid-2026',
  excerpt: '2 milyon TL bütçeyle elektrikli veya hybrid araç mı almalısınız? Kia EV2, BYD Atto 3 ve Toyota C-HR Hybrid detaylı karşılaştırması.',
  content: CONTENT,
  categories: ['karsilastirma', 'yeni-model'],
  category: 'karsilastirma',
  tags: ['elektrikli araç', 'hybrid', '2026 model', 'kia ev2', 'byd atto 3', 'toyota c-hr'],
  author: 'Compario Editörü',
  status: 'published',
  is_featured: true,
  published_at: new Date().toISOString(),
  meta_title: '2026 Elektrikli Araç Karşılaştırması: Kia EV2 vs BYD Atto 3 vs Toyota C-HR Hybrid',
  meta_description: '2 milyon TL altı en iyi elektrikli ve hybrid araçlar: Kia EV2, BYD Atto 3 ve Toyota C-HR Hybrid menzil, fiyat ve şarj hızı karşılaştırması (2026).',
  source: 'manual',
};

// ─── Insert ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('🚀 Makale ekleniyor:', article.title);

  // Aynı slug varsa önce sil (idempotent çalışma)
  const { error: delErr } = await supabase
    .from('news_articles')
    .delete()
    .eq('slug', article.slug);

  if (delErr && delErr.code !== 'PGRST116') {
    console.warn('⚠ Silme hatası (görmezden geliniyor):', delErr.message);
  }

  const { data, error } = await supabase
    .from('news_articles')
    .insert(article)
    .select()
    .single();

  if (error) {
    console.error('❌ Hata:', error.message);
    process.exit(1);
  }

  console.log('✅ Makale eklendi!');
  console.log('   ID   :', data.id);
  console.log('   Slug :', data.slug);
  console.log('   URL  : https://compario.tech/news/' + data.slug);
  console.log('   Local: http://localhost:3000/news/' + data.slug);
}

main();
