'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { UserProfile } from '@compario/database';

interface SocialLink {
  key: string;
  label: string;
  icon: string;
  color: string;
  url: string;
  val: string;
}

interface Props {
  userId: string;
  profile: UserProfile | null;
  displayName: string;
  initials: string;
  bio: string | null;
  socialLinks: SocialLink[];
  stats: { label: string; value: number; color: string }[];
}

export function ProfileHeroEdit({ userId, profile, displayName, initials, bio, socialLinks, stats }: Props) {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [coverUrl, setCoverUrl] = useState(profile?.cover_image ?? '');
  const [coverPos, setCoverPos] = useState(profile?.cover_position ?? 50);
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? '');
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const coverRef = useRef<HTMLInputElement>(null);
  const avatarRef = useRef<HTMLInputElement>(null);

  async function uploadAndSave(
    file: File,
    folder: 'avatars' | 'covers',
    field: 'avatar_url' | 'cover_image',
    setUrl: (u: string) => void,
    setUploading: (b: boolean) => void,
  ) {
    setUploading(true);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
      const path = `${userId}/${folder}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('user-media')
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from('user-media').getPublicUrl(path);
      setUrl(data.publicUrl);
      await supabase.from('user_profiles').upsert(
        { user_id: userId, [field]: data.publicUrl, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' },
      );
      router.refresh();
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  }

  const isGif = (url: string) => url.toLowerCase().endsWith('.gif');

  return (
    <>
      {/* ── Cover banner ───────────────────────────────────────────── */}
      <div
        className="relative h-44 sm:h-56 overflow-hidden cursor-pointer group"
        onClick={() => !uploadingCover && coverRef.current?.click()}
      >
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt="Kapak"
            fill
            className="object-cover"
            style={{ objectPosition: `center ${coverPos}%` }}
            sizes="100vw"
            priority
            unoptimized={isGif(coverUrl)}
          />
        ) : (
          <GradientBg />
        )}

        {/* Hover overlay */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'rgba(0,0,0,0.48)' }}
        >
          {uploadingCover ? (
            <Spinner />
          ) : (
            <>
              <span className="text-3xl opacity-80">⬡</span>
              <span className="font-mono text-[11px] text-white/70 uppercase tracking-wider">
                {coverUrl ? 'Kapak Görselini Değiştir' : 'Kapak Görseli Ekle'}
              </span>
            </>
          )}
        </div>

        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
          style={{ background: 'linear-gradient(to top, #0D0F1A, transparent)' }}
        />

        <input
          ref={coverRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => {
            const f = e.target.files?.[0];
            if (f) uploadAndSave(f, 'covers', 'cover_image', setCoverUrl, setUploadingCover);
            e.target.value = '';
          }}
        />
      </div>

      {/* ── Profile header ──────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="relative -mt-16 sm:-mt-20 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">

            {/* Avatar */}
            <div
              className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl flex items-center justify-center font-orbitron text-3xl font-black flex-shrink-0 cursor-pointer group/av"
              style={{
                background: avatarUrl
                  ? 'transparent'
                  : 'linear-gradient(135deg, rgba(0,255,247,0.2), rgba(183,36,255,0.2))',
                border: '2px solid rgba(0,255,247,0.3)',
                outline: '4px solid #0D0F1A',
                color: '#00fff7',
                boxShadow: '0 0 40px rgba(0,255,247,0.15), 0 0 80px rgba(183,36,255,0.08)',
              }}
              onClick={() => !uploadingAvatar && avatarRef.current?.click()}
            >
              {avatarUrl && (
                <Image
                  src={avatarUrl}
                  alt={displayName}
                  fill
                  className="object-cover rounded-2xl"
                  sizes="112px"
                  unoptimized={isGif(avatarUrl)}
                />
              )}
              {!avatarUrl && initials}

              {/* Hover overlay */}
              <div
                className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center gap-1 opacity-0 group-hover/av:opacity-100 transition-opacity"
                style={{ background: 'rgba(0,0,0,0.65)' }}
              >
                {uploadingAvatar ? (
                  <Spinner size="sm" />
                ) : (
                  <>
                    <span className="text-lg">⬡</span>
                    <span className="font-mono text-[8px] text-white/60 uppercase">Değiştir</span>
                  </>
                )}
              </div>

              <input
                ref={avatarRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) uploadAndSave(f, 'avatars', 'avatar_url', setAvatarUrl, setUploadingAvatar);
                  e.target.value = '';
                }}
              />
            </div>

            {/* Name + bio + social */}
            <div className="flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="font-orbitron text-2xl sm:text-3xl font-black text-white">
                  {displayName}
                </h1>
                <Link
                  href={`/u/${userId}`}
                  className="font-mono text-[9px] px-2 py-1 rounded-full uppercase tracking-wider"
                  style={{ border: '1px solid rgba(0,255,247,0.15)', color: 'rgba(0,255,247,0.5)' }}
                >
                  Genel Profil →
                </Link>
              </div>
              {bio && (
                <p className="font-mono text-sm text-gray-500 max-w-lg leading-relaxed">{bio}</p>
              )}
              {socialLinks.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {socialLinks.map(s => (
                    <a
                      key={s.key}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="flex items-center gap-1.5 font-mono text-[10px] px-3 py-1 rounded-full transition-all hover:opacity-80"
                      style={{ border: `1px solid ${s.color}30`, background: `${s.color}10`, color: s.color }}
                    >
                      <span className="text-[11px]">{s.icon}</span>
                      <span>{s.val.replace('@', '')}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Logout */}
            <form action="/api/auth/logout" method="POST" className="flex-shrink-0">
              <button
                type="submit"
                className="font-mono text-[10px] uppercase tracking-wider px-4 py-2 rounded-lg transition-all"
                style={{ border: '1px solid rgba(220,38,38,0.25)', color: 'rgba(220,38,38,0.6)' }}
              >
                Çıkış
              </button>
            </form>
          </div>

          {/* Stats */}
          <div className="flex gap-6 mt-5 pt-5 border-t border-[rgba(255,255,255,0.04)]">
            {stats.map(s => (
              <div key={s.label} className="text-center">
                <p className="font-orbitron text-xl font-black" style={{ color: s.color }}>{s.value}</p>
                <p className="font-mono text-[9px] uppercase tracking-wider text-gray-600">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function GradientBg() {
  return (
    <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,#0a0a18,#0d0820,#080d18)' }}>
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 100% at 30% 50%,rgba(0,255,247,0.07),transparent 60%)' }} />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 100% at 80% 50%,rgba(183,36,255,0.07),transparent 60%)' }} />
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'radial-gradient(circle,rgba(0,255,247,1) 1px,transparent 1px)', backgroundSize: '28px 28px' }} />
    </div>
  );
}

function Spinner({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const cls = size === 'sm' ? 'w-4 h-4 border-2' : 'w-6 h-6 border-2';
  return <div className={`${cls} border-white/40 border-t-white rounded-full animate-spin`} />;
}
