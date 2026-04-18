import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { getPublicUser } from '@/lib/auth';
import { getUserFavorites, getUserPriceAlerts } from '@compario/database';

export const metadata: Metadata = {
  title: 'Profilim | Compario',
};

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const user = await getPublicUser();
  if (!user) redirect('/giris?next=/profil');

  const [favorites, alerts] = await Promise.all([
    getUserFavorites(user.id).catch(() => []),
    getUserPriceAlerts(user.id).catch(() => []),
  ]);

  return (
    <main className="min-h-screen bg-grid pb-24" style={{ paddingTop: '88px' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-12">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="font-mono text-[10px] text-neon-purple uppercase tracking-[0.4em] opacity-70 mb-1">
              ⬡ Compario
            </p>
            <h1 className="font-orbitron text-3xl font-black text-neon-cyan text-glow-cyan">
              PROFİLİM
            </h1>
            <p className="font-mono text-xs text-gray-600 mt-1">{user.email}</p>
          </div>
          <LogoutButton />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          {[
            { label: 'Favori Ürün', value: favorites.length, color: '#00fff7' },
            { label: 'Fiyat Alarmı', value: alerts.length, color: '#C49A3C' },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-5 text-center"
              style={{ background: '#0c0c18', border: '1px solid rgba(255,255,255,0.04)' }}>
              <p className="font-orbitron text-3xl font-black" style={{ color: s.color }}>{s.value}</p>
              <p className="font-mono text-[10px] uppercase tracking-wider text-gray-600 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Favorites */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-5">
            <h2 className="font-orbitron text-xs uppercase tracking-[0.3em] text-neon-cyan opacity-80">
              ⬡ Favori Ürünler
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-neon-cyan/10 to-transparent" />
          </div>

          {favorites.length === 0 ? (
            <div className="text-center py-12 rounded-xl border border-[rgba(0,255,247,0.06)]">
              <p className="font-mono text-sm text-gray-600 mb-3">Henüz favori ürün yok.</p>
              <Link href="/products" className="btn-neon text-xs">Ürünlere Göz At →</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {favorites.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="flex gap-3 p-3 rounded-xl border border-[rgba(0,255,247,0.08)] bg-[rgba(255,255,255,0.02)] hover:border-neon-cyan/25 transition-all group"
                >
                  <div className="relative w-14 h-14 rounded-lg bg-[#0a0a14] flex-shrink-0 overflow-hidden border border-[rgba(0,255,247,0.08)]">
                    {product.image_url
                      ? <Image src={product.image_url} alt={product.name} fill className="object-cover" sizes="56px" />
                      : <span className="w-full h-full flex items-center justify-center text-gray-700">◈</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    {product.brand && (
                      <p className="font-mono text-[9px] text-gray-600 uppercase tracking-wider">{product.brand}</p>
                    )}
                    <p className="font-orbitron text-xs font-bold text-gray-200 group-hover:text-neon-cyan transition-colors truncate">
                      {product.name}
                    </p>
                    {product.price_min && (
                      <p className="font-mono text-xs font-bold mt-0.5" style={{ color: '#C49A3C' }}>
                        ₺{product.price_min.toLocaleString('tr-TR')}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Price Alerts */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <h2 className="font-orbitron text-xs uppercase tracking-[0.3em] opacity-80" style={{ color: '#C49A3C' }}>
              ⬡ Fiyat Alarmları
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-[rgba(196,154,60,0.15)] to-transparent" />
          </div>

          {alerts.length === 0 ? (
            <div className="text-center py-12 rounded-xl border border-[rgba(196,154,60,0.08)]">
              <p className="font-mono text-sm text-gray-600 mb-3">Aktif fiyat alarmın yok.</p>
              <Link href="/products" className="font-mono text-xs" style={{ color: '#C49A3C' }}>
                Ürünlere Göz At →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert: {
                id: string;
                target_price: number | null;
                last_price: number | null;
                products: { id: string; name: string; slug: string; brand: string | null; image_url: string | null; price_min: number | null } | null;
              }) => {
                const product = alert.products;
                if (!product) return null;
                return (
                  <div key={alert.id}
                    className="flex items-center gap-4 p-4 rounded-xl border border-[rgba(196,154,60,0.1)] bg-[rgba(255,255,255,0.02)]">
                    <div className="relative w-12 h-12 rounded-lg bg-[#0a0a14] flex-shrink-0 overflow-hidden border border-[rgba(196,154,60,0.1)]">
                      {product.image_url
                        ? <Image src={product.image_url} alt={product.name} fill className="object-cover" sizes="48px" />
                        : <span className="w-full h-full flex items-center justify-center text-gray-700 text-xs">◈</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${product.slug}`} className="font-orbitron text-xs font-bold text-gray-200 hover:text-neon-cyan transition-colors truncate block">
                        {product.name}
                      </Link>
                      <div className="flex items-center gap-3 mt-1">
                        {product.price_min && (
                          <span className="font-mono text-[10px] text-gray-500">
                            Şu an: <span style={{ color: '#C49A3C' }}>₺{product.price_min.toLocaleString('tr-TR')}</span>
                          </span>
                        )}
                        {alert.target_price && (
                          <span className="font-mono text-[10px] text-gray-500">
                            Hedef: <span className="text-neon-cyan">₺{alert.target_price.toLocaleString('tr-TR')}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="font-mono text-[9px] px-2 py-1 rounded-full border"
                      style={{ borderColor: 'rgba(34,197,94,0.3)', color: '#22c55e', background: 'rgba(34,197,94,0.05)' }}>
                      Aktif
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function LogoutButton() {
  return (
    <form action="/api/auth/logout" method="POST">
      <button
        type="submit"
        className="font-mono text-[10px] uppercase tracking-wider px-4 py-2 rounded-lg transition-all"
        style={{ border: '1px solid rgba(220,38,38,0.3)', color: 'rgba(220,38,38,0.7)' }}
      >
        Çıkış Yap
      </button>
    </form>
  );
}
