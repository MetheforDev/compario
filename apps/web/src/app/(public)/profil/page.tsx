import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { getPublicUser } from '@/lib/auth';
import {
  getUserFavorites,
  getUserPriceAlerts,
  getUserProfile,
  getUserCommentCount,
  getUserComments,
} from '@compario/database';
import { ProfileEditForm } from '@/components/ProfileEditForm';
import { ProfileHeroEdit } from '@/components/ProfileHeroEdit';

export const metadata: Metadata = { title: 'Profilim | Compario' };
export const dynamic = 'force-dynamic';

const SOCIAL_DEFS: Record<string, { label: string; icon: string; color: string; buildUrl: (v: string) => string }> = {
  twitter:   { label: 'X',         icon: '𝕏', color: '#e7e7e7', buildUrl: v => `https://x.com/${v.replace('@','')}` },
  instagram: { label: 'Instagram', icon: '◎', color: '#E1306C', buildUrl: v => `https://instagram.com/${v.replace('@','')}` },
  youtube:   { label: 'YouTube',   icon: '▶', color: '#FF0000', buildUrl: v => `https://youtube.com/@${v}` },
  website:   { label: 'Website',   icon: '⬡', color: '#00fff7', buildUrl: v => v.startsWith('http') ? v : `https://${v}` },
};

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const user = await getPublicUser();
  if (!user) redirect('/giris?next=/profil');

  const tab = searchParams.tab ?? 'favoriler';

  const [profile, favorites, alerts, commentCount, comments] = await Promise.all([
    getUserProfile(user.id).catch(() => null),
    getUserFavorites(user.id).catch(() => []),
    getUserPriceAlerts(user.id).catch(() => []),
    getUserCommentCount(user.id).catch(() => 0),
    tab === 'yorumlar' ? getUserComments(user.id).catch(() => []) : Promise.resolve([]),
  ]);

  const displayName = profile?.display_name ?? user.name ?? user.email.split('@')[0];
  const initials = displayName.slice(0, 2).toUpperCase();

  const socialLinks = Object.entries(SOCIAL_DEFS)
    .filter(([key]) => profile?.[key as keyof typeof profile])
    .map(([key, s]) => {
      const val = profile![key as keyof typeof profile] as string;
      return { key, ...s, val, url: s.buildUrl(val) };
    });

  const stats = [
    { label: 'Favori',       value: favorites.length, color: '#00fff7' },
    { label: 'Fiyat Alarmı', value: alerts.length,   color: '#C49A3C' },
    { label: 'Yorum',        value: commentCount,     color: '#b724ff' },
  ];

  return (
    <main className="min-h-screen bg-grid pb-24" style={{ paddingTop: '88px' }}>

      {/* ── Cover + Avatar + Name — client component (hover upload) ── */}
      <ProfileHeroEdit
        userId={user.id}
        profile={profile}
        displayName={displayName}
        initials={initials}
        bio={profile?.bio ?? null}
        socialLinks={socialLinks}
        stats={stats}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6">

        {/* ── Tabs ──────────────────────────────────────────────────── */}
        <div className="flex gap-0 mb-8 border-b border-[rgba(0,255,247,0.06)] overflow-x-auto">
          {[
            { key: 'favoriler', label: 'Favoriler',       count: favorites.length },
            { key: 'alarmlar',  label: 'Fiyat Alarmları', count: alerts.length },
            { key: 'yorumlar',  label: 'Yorumlar',         count: commentCount },
            { key: 'duzenle',   label: 'Profili Düzenle',  count: null },
          ].map(t => (
            <Link
              key={t.key}
              href={`/profil?tab=${t.key}`}
              className={`flex items-center gap-1.5 px-4 py-2.5 font-mono text-[11px] uppercase tracking-wider border-b-2 transition-colors -mb-px whitespace-nowrap ${
                tab === t.key
                  ? 'border-neon-cyan text-neon-cyan'
                  : 'border-transparent text-gray-600 hover:text-gray-400'
              }`}
            >
              {t.label}
              {t.count !== null && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${
                  tab === t.key
                    ? 'border-neon-cyan/30 bg-neon-cyan/10 text-neon-cyan'
                    : 'border-gray-700 text-gray-700'
                }`}>
                  {t.count}
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* ── Tab: Favoriler ─────────────────────────────────────────── */}
        {tab === 'favoriler' && (
          favorites.length === 0 ? (
            <EmptyState icon="♡" text="Henüz favori ürün eklemedin."
              cta={{ href: '/products', label: 'Ürünlere Göz At →' }} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {favorites.map(product => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group flex flex-col rounded-xl overflow-hidden border border-[rgba(0,255,247,0.08)] bg-[rgba(255,255,255,0.02)] hover:border-neon-cyan/25 transition-all hover:-translate-y-0.5"
                >
                  <div className="relative w-full h-36 bg-[#0a0a14] overflow-hidden">
                    {product.image_url ? (
                      <Image src={product.image_url} alt={product.name} fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width:640px) 100vw, 33vw" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-700 text-4xl">◈</div>
                    )}
                  </div>
                  <div className="p-4">
                    {product.brand && (
                      <p className="font-mono text-[9px] uppercase tracking-widest text-gray-600">{product.brand}</p>
                    )}
                    <p className="font-orbitron text-xs font-bold text-gray-200 group-hover:text-neon-cyan transition-colors line-clamp-2 mt-0.5">
                      {product.name}
                    </p>
                    {product.price_min && (
                      <p className="font-orbitron text-sm font-black mt-2" style={{ color: '#C49A3C' }}>
                        ₺{product.price_min.toLocaleString('tr-TR')}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )
        )}

        {/* ── Tab: Fiyat Alarmları ───────────────────────────────────── */}
        {tab === 'alarmlar' && (
          alerts.length === 0 ? (
            <EmptyState icon="🔔" text="Aktif fiyat alarmın yok."
              cta={{ href: '/products', label: 'Ürün Bak ve Alarm Kur →' }} />
          ) : (
            <div className="space-y-3">
              {alerts.map((alert: {
                id: string;
                target_price: number | null;
                products: { name: string; slug: string; brand: string | null; image_url: string | null; price_min: number | null } | null;
              }) => {
                const p = alert.products;
                if (!p) return null;
                return (
                  <div key={alert.id}
                    className="flex items-center gap-4 p-4 rounded-xl border border-[rgba(196,154,60,0.1)] bg-[rgba(255,255,255,0.02)]">
                    <div className="relative w-14 h-14 rounded-lg bg-[#0a0a14] flex-shrink-0 overflow-hidden border border-[rgba(196,154,60,0.1)]">
                      {p.image_url
                        ? <Image src={p.image_url} alt={p.name} fill className="object-cover" sizes="56px" />
                        : <span className="w-full h-full flex items-center justify-center text-gray-700">◈</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      {p.brand && <p className="font-mono text-[9px] text-gray-600 uppercase">{p.brand}</p>}
                      <Link href={`/products/${p.slug}`}
                        className="font-orbitron text-sm font-bold text-gray-200 hover:text-neon-cyan transition-colors truncate block">
                        {p.name}
                      </Link>
                      <div className="flex flex-wrap items-center gap-3 mt-1">
                        {p.price_min && (
                          <span className="font-mono text-[10px] text-gray-500">
                            Şu an: <span style={{ color: '#C49A3C' }}>₺{p.price_min.toLocaleString('tr-TR')}</span>
                          </span>
                        )}
                        {alert.target_price && (
                          <span className="font-mono text-[10px] text-gray-500">
                            Hedef: <span className="text-neon-cyan">₺{alert.target_price.toLocaleString('tr-TR')}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="font-mono text-[9px] px-2 py-1 rounded-full border flex-shrink-0"
                      style={{ borderColor: 'rgba(34,197,94,0.3)', color: '#22c55e', background: 'rgba(34,197,94,0.05)' }}>
                      ● Aktif
                    </span>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* ── Tab: Yorumlar ──────────────────────────────────────────── */}
        {tab === 'yorumlar' && (
          comments.length === 0 ? (
            <EmptyState icon="💬" text="Henüz yorum yapmadın."
              cta={{ href: '/products', label: 'Ürünlere Göz At ve Yorum Yap →' }} />
          ) : (
            <div className="space-y-3">
              {comments.map(c => (
                <div key={c.id}
                  className="p-4 rounded-xl border border-[rgba(183,36,255,0.1)] bg-[rgba(255,255,255,0.02)]">
                  {c.product_slug && (
                    <Link
                      href={`/products/${c.product_slug}`}
                      className="font-mono text-[9px] uppercase tracking-widest text-neon-purple opacity-60 hover:opacity-100 transition-opacity mb-2 block"
                    >
                      ◈ {c.product_name ?? c.entity_id}
                    </Link>
                  )}
                  <p className="font-mono text-sm text-gray-300 leading-relaxed">{c.content}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="font-mono text-[9px] text-gray-700">
                      {new Date(c.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    <span className="font-mono text-[9px] px-2 py-0.5 rounded-full border"
                      style={
                        c.status === 'approved'
                          ? { borderColor: 'rgba(34,197,94,0.3)', color: '#22c55e', background: 'rgba(34,197,94,0.05)' }
                          : c.status === 'pending'
                          ? { borderColor: 'rgba(196,154,60,0.3)', color: '#C49A3C', background: 'rgba(196,154,60,0.05)' }
                          : { borderColor: 'rgba(220,38,38,0.3)', color: '#dc2626', background: 'rgba(220,38,38,0.05)' }
                      }
                    >
                      {c.status === 'approved' ? '✓ Onaylandı' : c.status === 'pending' ? '⏳ Bekliyor' : '✕ Reddedildi'}
                    </span>
                    {c.helpful_count > 0 && (
                      <span className="font-mono text-[9px] text-gray-700">▲ {c.helpful_count} faydalı</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* ── Tab: Profili Düzenle ───────────────────────────────────── */}
        {tab === 'duzenle' && (
          <ProfileEditForm userId={user.id} profile={profile} email={user.email} />
        )}
      </div>
    </main>
  );
}

function EmptyState({ icon, text, cta }: { icon: string; text: string; cta: { href: string; label: string } }) {
  return (
    <div className="text-center py-20 rounded-xl border border-[rgba(0,255,247,0.06)]">
      <p className="text-4xl mb-4 opacity-30">{icon}</p>
      <p className="font-mono text-sm text-gray-600 mb-4">{text}</p>
      <Link href={cta.href} className="btn-neon text-xs">{cta.label}</Link>
    </div>
  );
}
