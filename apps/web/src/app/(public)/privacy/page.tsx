import type { Metadata } from 'next';
import Link from 'next/link';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Gizlilik Politikası | Compario',
  description: "Compario'nun gizlilik politikası, KVKK kapsamında kişisel veri işleme ve çerez kullanımı hakkında bilgi.",
  alternates: { canonical: 'https://compario.tech/privacy' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Gizlilik Politikası | Compario',
    description: "KVKK kapsamında kişisel veri işleme politikamız.",
    url: 'https://compario.tech/privacy',
    siteName: 'Compario',
    locale: 'tr_TR',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Gizlilik Politikası',
  url: 'https://compario.tech/privacy',
  description: 'Compario gizlilik politikası ve KVKK aydınlatma metni',
  isPartOf: { '@type': 'WebSite', name: 'Compario', url: 'https://compario.tech' },
};

interface SectionProps {
  title: string;
  children: React.ReactNode;
  accent?: 'cyan' | 'purple' | 'gold';
}

function Section({ title, children, accent = 'cyan' }: SectionProps) {
  const colors = {
    cyan: { border: 'rgba(0,255,247,0.12)', heading: '#00fff7', label: 'rgba(0,255,247,0.4)' },
    purple: { border: 'rgba(183,36,255,0.12)', heading: '#b724ff', label: 'rgba(183,36,255,0.4)' },
    gold: { border: 'rgba(196,154,60,0.12)', heading: '#C49A3C', label: 'rgba(196,154,60,0.4)' },
  }[accent];

  return (
    <section className="mb-10 rounded-2xl p-7 sm:p-9" style={{ background: '#0c0c18', border: `1px solid ${colors.border}` }}>
      <h2 className="font-orbitron text-base font-black mb-5" style={{ color: colors.heading }}>{title}</h2>
      <div className="font-mono text-sm text-gray-500 leading-loose space-y-3">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-grid pb-24" style={{ paddingTop: '88px' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(183,36,255,0.05) 0%, transparent 70%)' }}
        />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-16 pb-14 text-center">
          <div
            className="inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.4em] px-3 py-1.5 rounded-full mb-6"
            style={{ border: '1px solid rgba(183,36,255,0.15)', color: 'rgba(183,36,255,0.6)' }}
          >
            ◆ Yasal Bildirim
          </div>
          <h1 className="font-orbitron text-3xl sm:text-4xl font-black text-white leading-tight mb-4">
            Gizlilik Politikası
          </h1>
          <p className="font-mono text-xs text-gray-600">
            Son güncelleme: Nisan 2025 · KVKK Aydınlatma Metni
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 font-mono text-[10px] text-gray-700 uppercase tracking-wider mb-10">
          <Link href="/" className="hover:text-neon-cyan transition-colors">Ana Sayfa</Link>
          <span>/</span>
          <span className="text-gray-600">Gizlilik Politikası</span>
        </nav>

        <Section title="1. Veri Sorumlusu" accent="purple">
          <p>
            Bu gizlilik politikası, <span className="text-gray-300">Compario</span> (compario.tech) web sitesinin
            kişisel verileri nasıl topladığını, kullandığını ve koruduğunu açıklar.
          </p>
          <p>
            Veri sorumlusu: <span className="text-gray-300">Metehan Arslan</span><br />
            İletişim: <a href="mailto:methefor@gmail.com" className="text-neon-purple hover:opacity-80 transition-opacity">methefor@gmail.com</a>
          </p>
        </Section>

        <Section title="2. Toplanan Veriler" accent="cyan">
          <p>Aşağıdaki kişisel veriler toplanabilir:</p>
          <ul className="list-none space-y-2 mt-2">
            {[
              ['E-posta adresi', 'Hesap oluşturma ve fiyat bildirimleri için'],
              ['Kullanıcı adı ve profil bilgileri', 'İsteğe bağlı, kullanıcı tarafından girilir'],
              ['Görüntülenen ürün ve haberler', 'Kişiselleştirme ve analitik için'],
              ['IP adresi', 'Güvenlik ve hizmet kalitesi için'],
              ['Çerez verileri', 'Oturum yönetimi ve tercihler için'],
            ].map(([label, desc]) => (
              <li key={label} className="flex gap-3">
                <span style={{ color: '#00fff7' }}>◈</span>
                <span><span className="text-gray-300">{label}</span> — {desc}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="3. Verilerin Kullanım Amaçları" accent="gold">
          <ul className="list-none space-y-2">
            {[
              'Hesap oluşturma ve kimlik doğrulama',
              'Fiyat düşüş bildirimleri ve e-posta bildirimleri',
              'Site performansını iyileştirme ve hata ayıklama',
              'Kötüye kullanım ve sahtekârlığı önleme',
              'Yasal yükümlülüklerin yerine getirilmesi',
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <span style={{ color: '#C49A3C' }}>◆</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="4. Çerezler (Cookies)" accent="cyan">
          <p>Compario aşağıdaki çerez türlerini kullanır:</p>
          <div className="mt-4 space-y-3">
            {[
              { name: 'Zorunlu Çerezler', desc: 'Oturum yönetimi ve güvenlik. Devre dışı bırakılamaz.', color: '#00fff7' },
              { name: 'Analitik Çerezler', desc: 'Ziyaretçi sayısı ve sayfa görüntülemeleri (anonim).', color: '#C49A3C' },
              { name: 'Tercih Çerezleri', desc: 'Dil ve tema gibi kullanıcı tercihleri.', color: '#b724ff' },
            ].map((c) => (
              <div key={c.name} className="flex gap-3">
                <span style={{ color: c.color }}>⬡</span>
                <span><span className="text-gray-300">{c.name}</span> — {c.desc}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-gray-600">
            Tarayıcı ayarlarınızdan çerezleri reddedebilirsiniz; ancak bazı özellikler çalışmayabilir.
          </p>
        </Section>

        <Section title="5. Üçüncü Taraf Hizmetler" accent="purple">
          <p>Compario aşağıdaki üçüncü taraf hizmetlerden yararlanır:</p>
          <ul className="list-none space-y-2 mt-2">
            {[
              ['Supabase', 'Veritabanı ve kimlik doğrulama (AB/ABD sunucuları)'],
              ['Vercel', 'Hosting ve CDN (küresel sunucular)'],
              ['Resend', 'E-posta bildirimleri'],
            ].map(([name, desc]) => (
              <li key={name} className="flex gap-3">
                <span style={{ color: '#b724ff' }}>◉</span>
                <span><span className="text-gray-300">{name}</span> — {desc}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-gray-600">
            Bu hizmetler kendi gizlilik politikalarına tabidir. Verileriniz yalnızca hizmet sunumu için paylaşılır,
            üçüncü taraflara satılmaz.
          </p>
        </Section>

        <Section title="6. KVKK Kapsamında Haklarınız" accent="gold">
          <p>6698 sayılı KVKK uyarınca aşağıdaki haklara sahipsiniz:</p>
          <ul className="list-none space-y-2 mt-2">
            {[
              'Kişisel verilerinizin işlenip işlenmediğini öğrenme',
              'İşlenmişse buna ilişkin bilgi talep etme',
              'Verilerin düzeltilmesini isteme',
              'Silinmesini veya yok edilmesini talep etme',
              'Otomatik sistemler aracılığıyla aleyhinize bir sonucun ortaya çıkmasına itiraz etme',
              'Zarara uğramanız hâlinde zararın giderilmesini talep etme',
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <span style={{ color: '#C49A3C' }}>▸</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4">
            Bu haklarınızı kullanmak için{' '}
            <a href="mailto:methefor@gmail.com" className="text-neon-cyan hover:opacity-80 transition-opacity">
              methefor@gmail.com
            </a>{' '}
            adresine e-posta gönderebilirsiniz.
          </p>
        </Section>

        <Section title="7. Veri Güvenliği" accent="cyan">
          <p>
            Verileriniz; SSL/TLS şifreleme, güvenli bulut altyapısı ve erişim kontrolleri ile korunmaktadır.
            Compario hiçbir ödeme bilgisi toplamaz veya işlemez.
          </p>
          <p>
            Güvenlik açığı bildirimleri için:{' '}
            <a href="mailto:methefor@gmail.com" className="text-neon-cyan hover:opacity-80 transition-opacity">
              methefor@gmail.com
            </a>
          </p>
        </Section>

        <Section title="8. Politika Güncellemeleri" accent="purple">
          <p>
            Bu politika zaman zaman güncellenebilir. Önemli değişiklikler kayıtlı kullanıcılara e-posta ile
            bildirilir. Güncel versiyonu her zaman bu sayfada bulabilirsiniz.
          </p>
        </Section>

        {/* CTA */}
        <div className="mt-4 mb-10 text-center py-10 rounded-2xl"
          style={{ background: 'rgba(0,255,247,0.03)', border: '1px solid rgba(0,255,247,0.07)' }}>
          <p className="font-mono text-xs text-gray-600 mb-4">Sorularınız için bize ulaşın</p>
          <a
            href="mailto:methefor@gmail.com"
            className="inline-flex items-center gap-2 font-mono text-xs px-5 py-2.5 rounded-lg transition-all hover:opacity-80"
            style={{ border: '1px solid rgba(0,255,247,0.2)', color: '#00fff7', background: 'rgba(0,255,247,0.05)' }}
          >
            ⬡ methefor@gmail.com
          </a>
          <div className="mt-5">
            <Link href="/about" className="font-mono text-xs text-gray-700 hover:text-neon-cyan transition-colors">
              Hakkında sayfasına git →
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}
