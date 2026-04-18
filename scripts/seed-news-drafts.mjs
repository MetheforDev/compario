import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = readFileSync(resolve(__dirname, '../apps/web/.env.local'), 'utf-8');
const getEnv = k => env.match(new RegExp('^' + k + '=(.+)$', 'm'))?.[1]?.trim();
const supabase = createClient(getEnv('NEXT_PUBLIC_SUPABASE_URL'), getEnv('SUPABASE_SERVICE_KEY'));

const drafts = [
  {
    slug: 'samsung-galaxy-s25-vs-iphone-16-karsilastirma-2025',
    title: 'Samsung Galaxy S25 vs iPhone 16: 2025\'in Amiral Gemileri Karşı Karşıya',
    excerpt: 'Snapdragon 8 Elite ile A18 Bionic arasındaki güç savaşı: kamera, pil, fiyat ve performans açısından hangi telefon gerçekten üstün?',
    category: 'karsilastirma',
    source: 'Compario Editörü',
    content: `## Samsung Galaxy S25 vs iPhone 16: 2025'in Amiral Gemileri

İki teknoloji devinin amiral gemileri bu yıl da birbirini zorlayacak. Compario'nun kapsamlı karşılaştırmasında Galaxy S25 ve iPhone 16'yı her açıdan ele aldık.

### İşlemci ve Performans

**Samsung Galaxy S25** bu yıl Snapdragon 8 Elite ile geliyor. 3nm üretim süreci, önceki nesle kıyasla %40 daha hızlı CPU performansı sunuyor. **iPhone 16**'da ise Apple'ın A18 Bionic çipi var. Neural Engine konusunda rakipsiz olan bu çip, özellikle Apple Intelligence özelliklerini desteklemek için optimize edildi.

**Kazanan:** Yapay zeka görevlerinde iPhone 16, ham işlem gücünde Galaxy S25 biraz önde.

### Kamera Sistemi

Galaxy S25'in 200MP ana sensörü ve 50MP telefoto lensi, gece fotoğrafçılığında etkileyici sonuçlar veriyor. iPhone 16'nın 48MP Fusion kamerası ise video kayıt kalitesiyle öne çıkıyor; Camera Control düğmesi kullanım deneyimini farklılaştırıyor.

**Kazanan:** Fotoğrafçılık için S25, video için iPhone 16.

### Pil Ömrü

Galaxy S25'in 4000 mAh pili 45W hızlı şarjı destekliyor. iPhone 16'nın 3561 mAh pili daha küçük görünse de iOS optimizasyonu sayesinde benzer kullanım süresi sunuyor.

**Kazanan:** Hızlı şarjda S25, verimlilik optimizasyonunda iPhone 16.

### Fiyat

| Model | Başlangıç Fiyatı |
|-------|-----------------|
| Samsung Galaxy S25 | ₺42.999 |
| iPhone 16 | ₺54.999 |

### Sonuç

Fiyat-performans odaklıysanız Galaxy S25, Apple ekosistemi kullanıcısıysanız iPhone 16 mantıklı tercih.`,
  },
  {
    slug: 'elektrikli-araba-almadan-once-bilmeniz-gerekenler-2025',
    title: 'Elektrikli Araç Almadan Önce Bilmeniz Gereken 10 Şey',
    excerpt: 'Şarj altyapısı, menzil kaygısı, sigorta maliyetleri ve ikinci el değer kaybı — EV sahipliğinin gerçek yüzü.',
    category: 'yeni-model',
    source: 'Compario Editörü',
    content: `## Elektrikli Araç Almadan Önce Bilmeniz Gereken 10 Şey

Türkiye'de elektrikli araç satışları her yıl ikiye katlanıyor. Peki gerçekten hazır mısınız?

### 1. Şarj Altyapınızı Planlayın

Evde AC şarj istasyonu kurmak yaklaşık ₺8.000-15.000 arası maliyet. Apartmanda yaşıyorsanız yönetim onayı gerekiyor.

### 2. Gerçek Menzil vs. İddia Edilen Menzil

WLTP değerleri kış koşullarında %20-30 düşebilir. Günlük kullanımınızı %70 menzil üzerinden planlayın.

### 3. DC Hızlı Şarj Ücretleri

Türkiye'de DC hızlı şarj kWh başına ₺12-18 arası. Bunu benzin maliyetiyle karşılaştırın.

### 4. Sigorta ve Bakım

Batarya değiştirme maliyeti (₺80.000-200.000 arası) ve sigorta primleri daha yüksek olabilir.

### 5. ÖTV ve Vergi Avantajları

ÖTV muafiyeti ve düşük MTV EV sahipliğini vergi açısından avantajlı kılıyor.

### 6. İkinci El Değer Kaybı

Batarya sağlığı ikinci el fiyatını doğrudan etkiler. Satın alırken batarya raporunu isteyin.

### 7. Soğuk Hava Performansı

-10°C'de menzil %30-40 düşebilir. Kışın yoğun kullananlar için kritik bir faktör.

### 8. V2G (Vehicle-to-Grid) Hazırlığı

Bazı modeller evinizi şarj edebiliyor. Bu özellik Türkiye'de henüz yaygın değil.

### 9. Garantiler

Batarya garantisi genellikle 8 yıl veya 160.000 km. Kasım tarzı garantilerden kaçının.

### 10. Hangi Model Size Uyar?

Compario'nun EV karşılaştırma sayfasında güncel Türkiye fiyatları ve özelliklerini inceleyin.`,
  },
  {
    slug: 'laptop-alimlari-icin-rehber-2025-gaming-ultrabook-ofis',
    title: 'Hangi Laptop Size Göre? 2025 Alım Rehberi: Gaming, Ultrabook, Ofis',
    excerpt: 'Bütçenize ve kullanım amacınıza göre doğru laptop kategorisini nasıl seçersiniz? M4, RTX 4060, Core Ultra karşılaştırması.',
    category: 'yeni-model',
    source: 'Compario Editörü',
    content: `## Hangi Laptop Size Göre? 2025 Alım Rehberi

Laptop seçimi kişisel ihtiyaçlarınıza göre büyük farklılıklar gösteriyor. Bu rehberde üç ana kategoriyi karşılaştırdık.

### Ultrabook / İnce-Hafif Laptoplar

**Kimler İçin:** Seyahat edenler, öğrenciler, yazılımcılar
**Önerilen:** MacBook Air M3, Dell XPS 13 Plus, LG Gram 16

Günlük görevler, tarayıcı, ofis uygulamaları ve hafif yaratıcı işler için idealdir. 13-16 inç, 1-1.5 kg.

**Bütçe Aralığı:** ₺35.000 — ₺75.000

### Gaming Laptoplar

**Kimler İçin:** Oyun severler, video editörler, 3D tasarımcılar
**Önerilen:** ASUS ROG G16, Lenovo Legion Pro 7i, MSI Titan GT77

RTX 4060/4070 GPU, yüksek yenileme hızlı ekran (144Hz-240Hz) ve güçlü soğutma sistemi.

**Bütçe Aralığı:** ₺45.000 — ₺120.000+

### İş ve Ofis Laptopları

**Kimler İçin:** Kurumsal kullanım, uzun pil gerektiren işler
**Önerilen:** Lenovo ThinkPad X1 Carbon, HP EliteBook 840

Güvenilirlik, uzun pil ömrü ve kurumsal güvenlik özellikleri ön planda.

**Bütçe Aralığı:** ₺30.000 — ₺60.000

### İşlemci Seçimi: 2025'te Ne Almalı?

| İşlemci | Güçlü Yönü | Uygun Profil |
|---------|-----------|-------------|
| Apple M4 | Pil + performans | MacOS kullanıcısı |
| Intel Core Ultra 7 | Windows + yapay zeka | İş & ofis |
| AMD Ryzen 9 | Fiyat-performans | Gaming & yaratıcı |
| Snapdragon X Elite | Uzun pil, ince | Seyahat odaklı |

Compario'nun laptop karşılaştırma sayfasında güncel fiyat ve testlere bakabilirsiniz.`,
  },
  {
    slug: 'apple-watch-ultra-2-vs-garmin-fenix-8-sporcu-saati',
    title: 'Apple Watch Ultra 2 vs Garmin fēnix 8: Hangi Sporcu Saati Daha İyi?',
    excerpt: 'GPS doğruluğu, pil ömrü, su altı performansı ve fiyat. İki premium sporcu saatini detaylıca karşılaştırdık.',
    category: 'karsilastirma',
    source: 'Compario Editörü',
    content: `## Apple Watch Ultra 2 vs Garmin fēnix 8

Premium sporcu saatlerinde iki dev karşı karşıya: Apple'ın Ultra serisi ve Garmin'in legendası fēnix.

### GPS Performansı

Garmin fēnix 8, multiband GPS konusunda endüstri standardını belirliyor. Ultra 2 de çift frekans L1+L5 GPS ile bu alanda rakip olmaya başladı. Yoğun orman ve derin vadilerde Garmin hâlâ üstün.

### Pil Ömrü

| Model | Normal Mod | Tasarruf Modu |
|-------|-----------|--------------|
| Apple Watch Ultra 2 | 60 saat | 72 saat |
| Garmin fēnix 8 | 16-18 gün | 34 gün |

Ultramaraton veya çok günlü yürüyüşler için Garmin tartışmasız kazanıyor.

### Ekosistem

Apple Watch Ultra 2 seamless şekilde iPhone ile entegre çalışıyor. Apple Pay, iMessage, Siri — hepsi mükemmel. Garmin ise daha bağımsız; Android ve iOS'la çalışıyor.

### Sağlık Özellikleri

Her ikisi de EKG, SpO2, uyku takibi sunuyor. Apple Watch, düşme algılama ve acil SOS'ta öne çıkıyor.

### Fiyat

- Apple Watch Ultra 2: ₺34.999
- Garmin fēnix 8: ₺38.999 – 54.999 (versiyona göre)

### Karar

Spor performansı ve uzun pil istiyorsanız → **Garmin fēnix 8**
iPhone ekosistemi ve günlük akıllı saat deneyimi istiyorsanız → **Apple Watch Ultra 2**`,
  },
  {
    slug: 'ipad-pro-m4-vs-surface-pro-11-tablet-karsilastirma',
    title: 'iPad Pro M4 vs Surface Pro 11: En İyi Premium Tablet Hangisi?',
    excerpt: 'OLED vs PixelSense, M4 vs Snapdragon X Elite, iPadOS vs Windows 11 — iki premium tablet detaylı karşılaştırması.',
    category: 'karsilastirma',
    source: 'Compario Editörü',
    content: `## iPad Pro M4 vs Surface Pro 11

Her ikisi de piyasanın en pahalı tabletleri. Peki hangisi paranızın karşılığını veriyor?

### Ekran Kalitesi

iPad Pro M4'ün Ultra Retina XDR OLED ekranı muhteşem. 1000000:1 kontrast oranı, HDR10 ve Dolby Vision desteği. Surface Pro 11'in PixelSense LCD ekranı da kaliteli ama OLED'in parlaklık ve kontrast üstünlüğüyle rekabet etmesi zor.

**Kazanan:** iPad Pro M4

### İşlemci Performansı

Apple M4 çipi mevcut durumda Snapdragon X Elite'i CPU benchmarklarda geride bırakıyor. Ancak Surface Pro 11 gerçek Windows uygulamaları çalıştırma avantajına sahip.

### Kullanım Esnekliği

Bu karşılaştırmanın kalbi burası. Surface Pro 11 tam Windows 11 deneyimi sunuyor — gerçek masaüstü programlar, fare-klavye desteği, USB-A çokluk. iPad Pro M4'ün iPadOS'u ise gelişiyor ama hâlâ sınırlı.

**Kazanan:** Surface Pro 11

### Aksesuar Maliyeti

Her iki ürün de klavye ve kalem için ek ücret alıyor. iPad Pro için Apple Pencil Pro + Magic Keyboard toplam +₺12.000, Surface için Type Cover + Slim Pen 2 benzer aralıkta.

### Fiyat

| Model | Başlangıç |
|-------|----------|
| iPad Pro M4 11" | ₺44.999 |
| Surface Pro 11 | ₺45.999 |

### Sonuç

Yaratıcı işler ve tüketim için → **iPad Pro M4**
Profesyonel iş akışı ve Windows gerektiriyorsa → **Surface Pro 11**`,
  },
  {
    slug: 'playstation-5-pro-vs-xbox-series-x-2025-konsol-karsilastirma',
    title: 'PS5 Pro vs Xbox Series X: 2025\'de Hangi Konsolu Almalısınız?',
    excerpt: 'PSSR vs. FidelityFX, 33.5 TFLOPS vs 12 TFLOPS, özel oyunlar vs Game Pass. İki konsol savaşının 2025 analizi.',
    category: 'karsilastirma',
    source: 'Compario Editörü',
    content: `## PS5 Pro vs Xbox Series X: 2025 Konsol Savaşı

Sony'nin yeni amirali PS5 Pro, Xbox Series X'e meydan okuyor. Hangisi daha iyi yatırım?

### Donanım Gücü

PS5 Pro'nun RDNA 3 tabanlı GPU'su 33.5 TFLOPS güç sunuyor — Xbox Series X'in 12 TFLOPS değerinin neredeyse üç katı. Ama bu fark gerçek hayatta ne anlama geliyor?

### Görsel Kalite

**PlayStation Spectral Super Resolution (PSSR):** PS5 Pro'nun yapay zeka tabanlı upscaling teknolojisi, 1080p içeriği 4K'ya yükseltiyor. Xbox'ın FidelityFX Super Resolution ile karşılaştırdığında PSSR belirgin şekilde daha iyi sonuç veriyor.

### Oyun Kütüphanesi

Sony'nin özel başlıkları (Spider-Man, God of War, Horizon) PS5 Pro'da 60fps 4K deneyim sunuyor. Xbox ise Game Pass ile büyük avantaj sağlıyor — aylık ücret karşılığında yüzlerce oyun.

### Fiyat Karşılaştırması

| Ürün | Fiyat |
|------|-------|
| PS5 Pro | ₺38.999 |
| Xbox Series X | ₺22.999 |
| Xbox Game Pass Ultimate (yıllık) | ₺3.600 |

### Karar

En iyi grafik ve PlayStation özel oyunları → **PS5 Pro**
Uygun fiyat ve geniş kütüphane → **Xbox Series X + Game Pass**`,
  },
  {
    slug: 'akilli-saat-rehberi-2025-hangi-saat-size-gore',
    title: 'Akıllı Saat Rehberi 2025: Apple Watch, Samsung Galaxy Watch, Garmin veya Xiaomi Band?',
    excerpt: 'Bütçenize ve kullanım amacınıza göre doğru akıllı saat nasıl seçilir? ₺1.000\'den ₺35.000\'e tüm seçenekler.',
    category: 'yeni-model',
    source: 'Compario Editörü',
    content: `## Akıllı Saat Rehberi 2025

Akıllı saat pazarı artık çok geniş. ₺1.000 bütçeden ₺35.000'e kadar seçenekler mevcut. Hangisi sizin için doğru?

### ₺1.000 — ₺3.000: Fitness Bantları

**Xiaomi Smart Band 9, Huawei Band 9**

Adım sayar, nabız takibi, uyku analizi. Büyük beklenti olmadan günlük aktivite takibi için ideal. 14-21 gün pil ömrü.

**Kimler İçin:** Akıllı saat dünyasına ilk adım atmak isteyenler.

### ₺10.000 — ₺20.000: Ana Akım Akıllı Saatler

**Apple Watch Series 10, Samsung Galaxy Watch 7**

Uygulama ekosistemi, EKG, SpO2, NFC ödeme. Apple Watch için iPhone, Galaxy Watch için Samsung telefon tercih edilmeli.

**Kimler İçin:** Teknoloji meraklıları, sağlık takibini ciddiye alanlar.

### ₺20.000 — ₺40.000: Premium ve Spor

**Apple Watch Ultra 2, Samsung Galaxy Watch Ultra, Garmin fēnix 8**

Titanyum kasa, çift frekans GPS, 60+ saat pil (Garmin için günler). Ciddi sporcular ve outdoor tutkunları için.

**Kimler İçin:** Triatlet, dağcı, ultramaraton koşucuları.

### Özet Tablo

| Model | Fiyat | Pil | En İyi Özelliği |
|-------|-------|-----|----------------|
| Xiaomi Band 9 | ₺1.299 | 21 gün | Fiyat |
| Galaxy Watch 7 | ₺12.999 | 2-3 gün | Android entegrasyonu |
| Apple Watch S10 | ₺16.999 | 18 saat | iOS ekosistemi |
| Garmin fēnix 8 | ₺38.999 | 16 gün | GPS & spor |`,
  },
  {
    slug: 'toyota-rav4-hybrid-vs-volkswagen-id4-suv-karsilastirma',
    title: 'Toyota RAV4 Hybrid vs Volkswagen ID.4: Hibrit mi Elektrikli mi?',
    excerpt: 'Türkiye şarj altyapısı gerçekliğiyle hibrit vs tam elektrikli SUV karşılaştırması. Uzun vadede hangisi daha ekonomik?',
    category: 'karsilastirma',
    source: 'Compario Editörü',
    content: `## Toyota RAV4 Hybrid vs VW ID.4: Türkiye Gerçekliğinde Hibrit mi Elektrikli mi?

Türkiye'de SUV seçimi yapanların gündemindeki iki model. Peki hangisi Türkiye koşullarına daha uygun?

### Şarj vs. Yakıt

**RAV4 Hybrid:** Konvansiyonel benzin istasyonları her yerde. Hibritte şarj altyapısı endişesi yok — 100 km'de ortalama 5.5L yakıt.

**ID.4:** Türkiye'de DC hızlı şarj noktaları hâlâ sınırlı. Uzun yol öncesi mutlaka planlama gerekiyor.

### Menzil Gerçeği

RAV4 Hybrid, 50 litre depoda yaklaşık 900 km menzil sunuyor. ID.4'ün 77 kWh pili ideal koşulda 520 km, kış koşullarında 380-400 km sağlıyor.

### Toplam Sahip Olma Maliyeti (5 Yıl, 100.000 km)

| Gider | RAV4 Hybrid | VW ID.4 |
|-------|------------|---------|
| Yakıt/Şarj | ₺275.000 | ₺90.000 |
| Bakım | ₺45.000 | ₺25.000 |
| Sigorta | ₺80.000 | ₺95.000 |
| Toplam Fark | — | ~₺190.000 tasarruf |

### Fiyat

- Toyota RAV4 Hybrid: ₺1.850.000
- Volkswagen ID.4: ₺1.980.000

ID.4, enerji maliyetinde önemli tasarruf sağlasa da şarj altyapısına bağımlılığı Türkiye'de risk faktörü olmaya devam ediyor.

### Karar

Uzun yol + şarj kaygısı → **RAV4 Hybrid**
Şehir kullanımı + evde şarj → **VW ID.4**`,
  },
  {
    slug: 'samsung-galaxy-tab-s10-plus-inceleme-2025',
    title: 'Samsung Galaxy Tab S10+ İnceleme: Android Tablet Tahtı Değişti Mi?',
    excerpt: '12.4" Dynamic AMOLED, Snapdragon 8 Gen 3, S Pen dahil. iPad dominasyonuna meydan okuyan Tab S10+ modeli test edildi.',
    category: 'yeni-model',
    source: 'Compario Editörü',
    content: `## Samsung Galaxy Tab S10+ İnceleme

Android tablet dünyasının en iddialı modeli Tab S10+, iPadOS hegemonyasını kırmak istiyor.

### Tasarım ve Ekran

12.4 inç Dynamic AMOLED 2X ekran, 120Hz yenileme hızı ve 2800x1752 piksel çözünürlük sunuyor. Parlaklık 930 nit'e ulaşabiliyor — güneş altında kullanım sorunsuz.

Alüminyum çerçeve ve Gorilla Glass Victus+ arka kaplama premium his veriyor. 5.5 mm inceliğiyle iPad Pro'ya yakın bir profil yakalamış.

### S Pen Deneyimi

Kutusunda gelen S Pen (2.8ms gecikme) özellikle not alma ve çizim için mükemmel. iPad için Apple Pencil Pro ayrıca satın alındığında ek ₺3.000+ maliyet doğuruyor.

### Performans

Snapdragon 8 Gen 3 + 12GB RAM kombinasyonu tüm uygulamalarda tereddütsüz çalışıyor. Multitasking, Samsung DeX modu ile masaüstü deneyimine dönüşüyor.

### Android Tablet Sorunu

Tab S10+'ın en büyük handikabı Android'in tablet uygulaması ekosistemi. Birçok popüler uygulama hâlâ telefon arayüzüyle geliyor.

### Pil ve Şarj

10090 mAh pil, orta yoğunlukta kullanımda 12-14 saat dayanıyor. 45W şarjla 1.5 saatte tam şarj.

### Fiyat ve Karar

₺32.999'dan başlayan fiyatla iPad Air M2'ye (₺28.999) göre biraz pahalı. S Pen dahil olduğunu düşününce fiyat makul.

**Kimler Almalı:** Android ekosistemi kullananlar, not almayı seven öğrenciler ve içerik üreticiler.`,
  },
  {
    slug: 'fiyat-performans-telefon-rehberi-2025-en-iyi-orta-sinif',
    title: 'En İyi Fiyat-Performans Telefonlar 2025: ₺15.000 — ₺25.000 Aralığı',
    excerpt: 'Galaxy A55, Xiaomi 14T, Pixel 8a ve daha fazlası. Orta sınıf telefon pazarının 2025\'teki en güçlü isimleri.',
    category: 'yeni-model',
    source: 'Compario Editörü',
    content: `## En İyi Fiyat-Performans Telefonlar 2025

₺15.000-25.000 aralığı telefon pazarının en rekabetçi segmenti. Amiral gemi özellikleri, uygun fiyatla buluşuyor.

### Samsung Galaxy A55 5G — ₺18.999

**Güçlü Yanları:** IP67 su direnci, Gorilla Glass Victus+, 120Hz Super AMOLED, 50MP OIS kamera
**Zayıf Yanları:** Exynos 1480 performansı bazen sınırlı

### Xiaomi 14T — ₺22.999

**Güçlü Yanları:** Leica kamera sistemi, MediaTek Dimensity 8300 Ultra, 144Hz AMOLED, 67W hızlı şarj
**Zayıf Yanları:** MIUI bloatware

### Google Pixel 8a — ₺24.999

**Güçlü Yanları:** Tensor G3 çip, 7 yıl yazılım desteği, yapay zeka fotoğraf özellikleri, temiz Android
**Zayıf Yanları:** Kablosuz şarj yok, pil biraz küçük

### Karşılaştırma Tablosu

| Özellik | Galaxy A55 | Xiaomi 14T | Pixel 8a |
|---------|-----------|-----------|---------|
| İşlemci | Exynos 1480 | Dimensity 8300 | Tensor G3 |
| Ekran | 6.6" 120Hz | 6.67" 144Hz | 6.1" 120Hz |
| Kamera | 50MP OIS | 50MP Leica | 64MP AI |
| Pil | 5000 mAh | 5000 mAh | 4492 mAh |
| Şarj | 25W | 67W | 18W |
| Su Direnci | IP67 | IP68 | IP67 |

### Sonuç

- En uzun yazılım desteği → **Pixel 8a**
- En hızlı şarj + Leica kamera → **Xiaomi 14T**
- Ekosistem ve güvenilirlik → **Galaxy A55**

Compario'da bu modelleri detaylı karşılaştırabilirsiniz.`,
  },
];

async function run() {
  let ok = 0, fail = 0;

  for (const draft of drafts) {
    const { error } = await supabase.from('news_articles').upsert(
      {
        ...draft,
        status: 'draft',
        author: 'Compario Editörü',
        tags: [],
      },
      { onConflict: 'slug' },
    );

    if (error) {
      console.error(`HATA ${draft.slug}: ${error.message}`);
      fail++;
    } else {
      console.log(`✓ ${draft.title.substring(0, 60)}...`);
      ok++;
    }
  }

  console.log(`\nTamamlandı: ${ok} taslak eklendi, ${fail} hata.`);
}

run().catch(console.error);
