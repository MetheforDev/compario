import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getUserProfile, getUserFavorites } from '@compario/database';

interface PageProps {
  params: { userId: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const profile = await getUserProfile(params.userId).catch(() => null);
  const name = profile?.display_name ?? 'Kullanıcı';
  return {
    title: `${name} | Compario`,
    description: profile?.bio ?? `${name} adlı kullanıcının Compario profili.`,
  };
}

const SOCIAL_ICONS: Record<string, { label: string; icon: string; color: string; buildUrl: (v: string) => string }> = {
  twitter:   { label: 'X',         icon: '𝕏', color: '#e7e7e7', buildUrl: v => `https://x.com/${v.replace('@','')}` },
  instagram: { label: 'Instagram', icon: '◎', color: '#E1306C', buildUrl: v => `https://instagram.com/${v.replace('@','')}` },
  youtube:   { label: 'YouTube',   icon: '▶', color: '#FF0000', buildUrl: v => `https://youtube.com/@${v}` },
  website:   { label: 'Website',   icon: '⬡', color: '#00fff7', buildUrl: v => v.startsWith('http') ? v : `https://${v}` },
};

export default async function PublicProfilePage({ params }: PageProps) {
  const [profile, favorites] = await Promise.all([
    getUserProfile(params.userId).catch(() => null),
    getUserFavorites(params.userId).catch(() => []),
  ]);

  if (!profile && favorites.length === 0) notFound();

  const displayName = profile?.display_name ?? 'Compario Kullanıcısı';
  const initials = displayName.slice(0, 2).toUpperCase();

  const socialLinks = Object.entries(SOCIAL_ICONS).filter(
    ([key]) => profile?.[key as keyof typeof profile],
  );

  return (
    <main className="min-h-screen bg-grid pb-24" style={{ paddingTop: '88px' }}>

      {/* Hero banner */}
      <div className="relative h-36 sm:h-44 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0a0a18 0%, #0d0820 50%, #080d18 100%)' }}>
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 80% 100% at 30% 50%, rgba(0,255,247,0.06) 0%, transparent 60%)' }} />
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 60% 100% at 80% 50%, rgba(183,36,255,0.06) 0%, transparent 60%)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-20"
          style={{ background: 'linear-gradient(to top, #08090e, transparent)' }} />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(0,255,247,1) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">

        {/* Profile header */}
        <div className="relative -mt-14 sm:-mt-16 mb-10">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">

            {/* Avatar */}
            <div
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center font-orbitron text-2xl font-black flex-shrink-0 relative"
              style={{
                background: 'linear-gradient(135deg, rgba(0,255,247,0.18) 0%, rgba(183,36,255,0.18) 100%)',
                border: '2px solid rgba(0,255,247,0.25)',
                color: '#00fff7',
                boxShadow: '0 0 30px rgba(0,255,247,0.12)',
              }}
            >
              {profile?.avatar_url ? (
                <Image src={profile.avatar_url} alt={displayName} fill className="object-cover rounded-2xl" sizes="96px" />
              ) : initials}
            </div>

            {/* Name + bio */}
            <div className="flex-1 pb-1">
              <h1 className="font-orbitron text-2xl sm:text-3xl font-black text-white mb-1">
                {displayName}
              </h1>
              {profile?.bio && (
                <p className="font-mono text-sm text-gray-500 max-w-lg leading-relaxed">{profile.bio}</p>
              )}

              {/* Sosyal linkler */}
              {socialLinks.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {socialLinks.map(([key, s]) => {
                    const val = profile![key as keyof typeof profile] as string;
                    return (
                      <a
                        key={key}
                        href={s.buildUrl(val)}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="flex items-center gap-1.5 font-mono text-[10px] px-3 py-1 rounded-full transition-all hover:opacity-80"
                        style={{ border: `1px solid ${s.color}30`, background: `${s.color}0f`, color: s.color }}
                      >
                        <span>{s.icon}</span>
                        <span>{val.replace('@', '')}</span>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6 mt-5 pt-5 border-t border-[rgba(255,255,255,0.04)]">
            <div className="text-center">
              <p className="font-orbitron text-xl font-black text-neon-cyan">{favorites.length}</p>
              <p className="font-mono text-[9px] uppercase tracking-wider text-gray-600">Favori</p>
            </div>
            <div className="text-center">
              <p className="font-orbitron text-xl font-black" style={{ color: '#b724ff' }}>0</p>
              <p className="font-mono text-[9px] uppercase tracking-wider text-gray-600">Yorum</p>
            </div>
          </div>
        </div>

        {/* Favoriler */}
        {favorites.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <h2 className="font-orbitron text-[10px] uppercase tracking-[0.3em] text-neon-cyan opacity-80">
                ⬡ Favori Ürünler
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-neon-cyan/10 to-transparent" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {favorites.map(product => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group flex flex-col rounded-xl overflow-hidden border border-[rgba(0,255,247,0.08)] bg-[rgba(255,255,255,0.02)] hover:border-neon-cyan/25 transition-all hover:-translate-y-0.5"
                >
                  <div className="relative w-full h-36 bg-[#0a0a14]">
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
          </section>
        )}

        {favorites.length === 0 && (
          <div className="text-center py-20 rounded-xl border border-[rgba(0,255,247,0.06)]">
            <p className="text-4xl mb-4 opacity-20">◈</p>
            <p className="font-mono text-sm text-gray-600">Bu kullanıcının henüz favori ürünü yok.</p>
          </div>
        )}

        <div className="mt-10 text-center">
          <Link href="/products" className="btn-neon text-xs">Ürünlere Göz At →</Link>
        </div>
      </div>
    </main>
  );
}
