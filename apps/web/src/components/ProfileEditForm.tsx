'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { UserProfile } from '@compario/database';

interface Props {
  userId: string;
  profile: UserProfile | null;
  email: string;
}

const SOCIAL_FIELDS = [
  { key: 'twitter',   label: 'X / Twitter', placeholder: '@kullanici', prefix: 'x.com/' },
  { key: 'instagram', label: 'Instagram',   placeholder: '@kullanici', prefix: 'instagram.com/' },
  { key: 'youtube',   label: 'YouTube',     placeholder: 'kanal adı',  prefix: 'youtube.com/@' },
  { key: 'website',   label: 'Website',     placeholder: 'https://...', prefix: '' },
] as const;

function fieldBorderStyle(focused: boolean, color = '0,255,247') {
  return { border: `1px solid rgba(${color},${focused ? 0.35 : 0.1})` };
}

export function ProfileEditForm({ userId, profile, email }: Props) {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [twitter, setTwitter] = useState(profile?.twitter ?? '');
  const [instagram, setInstagram] = useState(profile?.instagram ?? '');
  const [youtube, setYoutube] = useState(profile?.youtube ?? '');
  const [website, setWebsite] = useState(profile?.website ?? '');

  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? '');
  const [coverUrl, setCoverUrl] = useState(profile?.cover_image ?? '');
  const [coverPos, setCoverPos] = useState(profile?.cover_position ?? 50);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const avatarRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  const vals: Record<string, string> = { twitter, instagram, youtube, website };
  const setters: Record<string, (v: string) => void> = {
    twitter: setTwitter, instagram: setInstagram, youtube: setYoutube, website: setWebsite,
  };

  async function uploadImage(
    file: File,
    folder: 'avatars' | 'covers',
    setUrl: (u: string) => void,
    setUploading: (b: boolean) => void,
  ) {
    setUploading(true);
    try {
      const ext = file.name.split('.').pop() ?? 'jpg';
      const path = `${userId}/${folder}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('user-media')
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;

      const { data } = supabase.storage.from('user-media').getPublicUrl(path);
      setUrl(data.publicUrl);
    } catch {
      setError('Görsel yüklenemedi.');
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const { error: sbError } = await supabase.from('user_profiles').upsert(
        {
          user_id: userId,
          display_name: displayName.trim() || null,
          bio: bio.trim() || null,
          avatar_url: avatarUrl || null,
          cover_image: coverUrl || null,
          cover_position: coverPos,
          twitter: twitter.trim() || null,
          instagram: instagram.trim() || null,
          youtube: youtube.trim() || null,
          website: website.trim() || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      );
      if (sbError) throw sbError;
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Kaydedilemedi: ${msg}`);
    } finally {
      setSaving(false);
    }
  }

  const initials = (displayName || email)[0]?.toUpperCase() ?? '?';

  return (
    <form onSubmit={handleSave} className="space-y-5">

      {/* ── Kapak görseli ───────────────────────────────────────── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: '1px solid rgba(0,255,247,0.08)' }}
      >
        {/* Cover upload area */}
        <div
          className="relative h-36 sm:h-44 cursor-pointer group"
          style={{
            background: coverUrl ? 'transparent' : 'linear-gradient(135deg,#0a0a18,#0d0820)',
          }}
          onClick={() => coverRef.current?.click()}
        >
          {coverUrl && (
            <Image
              src={coverUrl}
              alt="Kapak"
              fill
              className="object-cover transition-all duration-200"
              style={{ objectPosition: `center ${coverPos}%` }}
              sizes="100vw"
              unoptimized={coverUrl.endsWith('.gif')}
            />
          )}
          {/* Hover overlay */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: 'rgba(0,0,0,0.55)' }}
          >
            {uploadingCover ? (
              <div className="w-5 h-5 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span className="text-2xl">⬡</span>
                <span className="font-mono text-[10px] text-neon-cyan uppercase tracking-wider">
                  {coverUrl ? 'Görseli Değiştir' : 'Kapak Görseli Yükle'}
                </span>
              </>
            )}
          </div>
          <input
            ref={coverRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => {
              const f = e.target.files?.[0];
              if (f) uploadImage(f, 'covers', setCoverUrl, setUploadingCover);
              e.target.value = '';
            }}
          />
        </div>

        {/* Position slider — only when cover is set */}
        {coverUrl && (
          <div
            className="px-5 py-3 flex items-center gap-3"
            style={{ background: '#0a0a14', borderTop: '1px solid rgba(0,255,247,0.06)' }}
            onClick={e => e.stopPropagation()}
          >
            <span className="font-mono text-[9px] text-gray-600 uppercase tracking-wider shrink-0">↕ Konum</span>
            <input
              type="range"
              min={0}
              max={100}
              value={coverPos}
              onChange={e => setCoverPos(Number(e.target.value))}
              className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
              style={{ accentColor: '#00fff7' }}
            />
            <span className="font-mono text-[9px] text-gray-600 w-8 text-right shrink-0">{coverPos}%</span>
          </div>
        )}

        {/* Avatar + name */}
        <div className="px-5 pb-5 pt-0 bg-[#0d0d1a]">
          <div className="flex items-end gap-4 -mt-10">
            {/* Avatar */}
            <div
              className="relative w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0 font-orbitron text-2xl font-black cursor-pointer group/av ring-4 ring-[#0d0d1a]"
              style={{
                background: avatarUrl ? 'transparent' : 'linear-gradient(135deg,rgba(0,255,247,0.2),rgba(183,36,255,0.2))',
                border: '2px solid rgba(0,255,247,0.25)',
                color: '#00fff7',
              }}
              onClick={() => avatarRef.current?.click()}
            >
              {avatarUrl && (
                <Image src={avatarUrl} alt="Avatar" fill className="object-cover rounded-xl" sizes="80px" />
              )}
              {!avatarUrl && initials}
              <div
                className="absolute inset-0 rounded-xl flex items-center justify-center opacity-0 group-hover/av:opacity-100 transition-opacity"
                style={{ background: 'rgba(0,0,0,0.6)' }}
              >
                {uploadingAvatar
                  ? <div className="w-4 h-4 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
                  : <span className="text-[18px]">⬡</span>
                }
              </div>
              <input
                ref={avatarRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) uploadImage(f, 'avatars', setAvatarUrl, setUploadingAvatar);
                }}
              />
            </div>

            <div className="pb-1">
              <p className="font-orbitron text-base font-bold text-white">
                {displayName || email.split('@')[0]}
              </p>
              <p className="font-mono text-[9px] text-gray-600 mt-0.5">
                Avatara veya kapağa tıkla → yükle
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Temel bilgiler ───────────────────────────────────────── */}
      <div
        className="rounded-2xl p-5 space-y-4"
        style={{ background: '#0d0d1a', border: '1px solid rgba(0,255,247,0.08)' }}
      >
        <h3 className="font-orbitron text-[10px] uppercase tracking-[0.3em] text-neon-cyan opacity-60">
          ⬡ Temel Bilgiler
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Görünen Ad">
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              maxLength={40}
              placeholder={email.split('@')[0]}
              className="w-full px-4 py-2.5 rounded-xl font-mono text-sm outline-none bg-[rgba(255,255,255,0.03)] text-gray-200 placeholder-gray-700 transition-all"
              style={fieldBorderStyle(false)}
              onFocus={e => Object.assign(e.currentTarget.style, fieldBorderStyle(true))}
              onBlur={e => Object.assign(e.currentTarget.style, fieldBorderStyle(false))}
            />
          </Field>
          <Field label="E-posta">
            <input
              type="text"
              value={email}
              disabled
              className="w-full px-4 py-2.5 rounded-xl font-mono text-sm bg-[rgba(255,255,255,0.02)] text-gray-600 cursor-not-allowed"
              style={{ border: '1px solid rgba(255,255,255,0.04)' }}
            />
          </Field>
        </div>

        <Field label="Hakkımda">
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            maxLength={200}
            rows={3}
            placeholder="Kendinden kısaca bahset..."
            className="w-full px-4 py-3 rounded-xl font-mono text-sm outline-none bg-[rgba(255,255,255,0.03)] text-gray-200 placeholder-gray-700 resize-none transition-all"
            style={fieldBorderStyle(false)}
            onFocus={e => Object.assign(e.currentTarget.style, fieldBorderStyle(true))}
            onBlur={e => Object.assign(e.currentTarget.style, fieldBorderStyle(false))}
          />
          <p className="font-mono text-[9px] text-gray-700 text-right -mt-1">{bio.length}/200</p>
        </Field>
      </div>

      {/* ── Sosyal hesaplar ─────────────────────────────────────── */}
      <div
        className="rounded-2xl p-5 space-y-4"
        style={{ background: '#0d0d1a', border: '1px solid rgba(183,36,255,0.08)' }}
      >
        <h3 className="font-orbitron text-[10px] uppercase tracking-[0.3em] text-neon-purple opacity-60">
          ⬡ Sosyal Hesaplar
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SOCIAL_FIELDS.map(f => (
            <Field key={f.key} label={f.label}>
              <div
                className="flex items-center rounded-xl overflow-hidden transition-all"
                style={{ border: '1px solid rgba(183,36,255,0.12)' }}
                onFocusCapture={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(183,36,255,0.35)'; }}
                onBlurCapture={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(183,36,255,0.12)'; }}
              >
                {f.prefix && (
                  <span className="px-3 py-2.5 font-mono text-[10px] text-gray-700 bg-[rgba(183,36,255,0.04)] border-r border-[rgba(183,36,255,0.1)] whitespace-nowrap">
                    {f.prefix}
                  </span>
                )}
                <input
                  type="text"
                  value={vals[f.key]}
                  onChange={e => setters[f.key](e.target.value)}
                  placeholder={f.placeholder}
                  className="flex-1 px-3 py-2.5 font-mono text-sm outline-none bg-[rgba(255,255,255,0.02)] text-gray-200 placeholder-gray-700"
                  style={{ caretColor: '#b724ff' }}
                />
              </div>
            </Field>
          ))}
        </div>
      </div>

      {error && <p className="font-mono text-[11px] text-red-400">✕ {error}</p>}

      <button
        type="submit"
        disabled={saving || uploadingAvatar || uploadingCover}
        className="w-full py-3 rounded-xl font-orbitron text-xs font-bold uppercase tracking-[0.2em] transition-all"
        style={{
          background: saved ? 'rgba(34,197,94,0.1)' : 'rgba(0,255,247,0.08)',
          border: saved ? '1px solid rgba(34,197,94,0.4)' : '1px solid rgba(0,255,247,0.25)',
          color: saved ? '#22c55e' : saving ? 'rgba(0,255,247,0.3)' : '#00fff7',
          cursor: saving ? 'not-allowed' : 'pointer',
        }}
      >
        {saved ? '✓ Kaydedildi' : saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-mono text-[10px] uppercase tracking-[0.25em] text-gray-600">{label}</label>
      {children}
    </div>
  );
}
