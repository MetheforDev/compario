'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  { key: 'website',   label: 'Website',     placeholder: 'https://...',prefix: '' },
] as const;

export function ProfileEditForm({ userId, profile, email }: Props) {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [twitter, setTwitter] = useState(profile?.twitter ?? '');
  const [instagram, setInstagram] = useState(profile?.instagram ?? '');
  const [youtube, setYoutube] = useState(profile?.youtube ?? '');
  const [website, setWebsite] = useState(profile?.website ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const vals: Record<string, string> = { twitter, instagram, youtube, website };
  const setters: Record<string, (v: string) => void> = {
    twitter: setTwitter, instagram: setInstagram, youtube: setYoutube, website: setWebsite,
  };

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
    } catch {
      setError('Kaydedilemedi, tekrar dene.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Temel bilgiler */}
      <div
        className="rounded-2xl p-6 space-y-5"
        style={{ background: '#0d0d1a', border: '1px solid rgba(0,255,247,0.08)' }}
      >
        <h3 className="font-orbitron text-[10px] uppercase tracking-[0.3em] text-neon-cyan opacity-70">
          ⬡ Temel Bilgiler
        </h3>

        {/* Avatar placeholder */}
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 font-orbitron text-2xl font-black"
            style={{
              background: 'linear-gradient(135deg, rgba(0,255,247,0.15), rgba(183,36,255,0.15))',
              border: '2px solid rgba(0,255,247,0.25)',
              color: '#00fff7',
            }}
          >
            {(displayName || email)[0]?.toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="font-mono text-[10px] text-gray-600 mb-1">Profil fotoğrafı</p>
            <p className="font-mono text-[9px] text-gray-700">
              Yakında — URL ile fotoğraf ekleyebileceksin
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] uppercase tracking-[0.25em] text-gray-600">
              Görünen Ad
            </label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              maxLength={40}
              placeholder={email.split('@')[0]}
              className="w-full px-4 py-2.5 rounded-xl font-mono text-sm outline-none transition-all bg-[rgba(255,255,255,0.03)] text-gray-200 placeholder-gray-700"
              style={{ border: '1px solid rgba(0,255,247,0.1)', caretColor: '#00fff7' }}
              onFocus={e => { e.currentTarget.style.border = '1px solid rgba(0,255,247,0.3)'; }}
              onBlur={e => { e.currentTarget.style.border = '1px solid rgba(0,255,247,0.1)'; }}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] uppercase tracking-[0.25em] text-gray-600">
              E-posta
            </label>
            <input
              type="text"
              value={email}
              disabled
              className="w-full px-4 py-2.5 rounded-xl font-mono text-sm bg-[rgba(255,255,255,0.02)] text-gray-600 cursor-not-allowed"
              style={{ border: '1px solid rgba(255,255,255,0.04)' }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[10px] uppercase tracking-[0.25em] text-gray-600">
            Hakkımda
          </label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            maxLength={200}
            rows={3}
            placeholder="Kendinden kısaca bahset — teknoloji tutkunu, araba meraklısı..."
            className="w-full px-4 py-3 rounded-xl font-mono text-sm outline-none transition-all bg-[rgba(255,255,255,0.03)] text-gray-200 placeholder-gray-700 resize-none"
            style={{ border: '1px solid rgba(0,255,247,0.1)', caretColor: '#00fff7' }}
            onFocus={e => { e.currentTarget.style.border = '1px solid rgba(0,255,247,0.3)'; }}
            onBlur={e => { e.currentTarget.style.border = '1px solid rgba(0,255,247,0.1)'; }}
          />
          <p className="font-mono text-[9px] text-gray-700 text-right">{bio.length}/200</p>
        </div>
      </div>

      {/* Sosyal bağlantılar */}
      <div
        className="rounded-2xl p-6 space-y-4"
        style={{ background: '#0d0d1a', border: '1px solid rgba(183,36,255,0.08)' }}
      >
        <h3 className="font-orbitron text-[10px] uppercase tracking-[0.3em] text-neon-purple opacity-70">
          ⬡ Sosyal Hesaplar
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SOCIAL_FIELDS.map(f => (
            <div key={f.key} className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] uppercase tracking-[0.25em] text-gray-600">
                {f.label}
              </label>
              <div className="flex items-center rounded-xl overflow-hidden" style={{ border: '1px solid rgba(183,36,255,0.1)' }}>
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
                  onFocus={e => { (e.currentTarget.closest('div') as HTMLElement).style.borderColor = 'rgba(183,36,255,0.35)'; }}
                  onBlur={e => { (e.currentTarget.closest('div') as HTMLElement).style.borderColor = 'rgba(183,36,255,0.1)'; }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save */}
      {error && <p className="font-mono text-[11px] text-red-400">✕ {error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="w-full py-3 rounded-xl font-orbitron text-xs font-bold uppercase tracking-[0.2em] transition-all"
        style={{
          background: saved ? 'rgba(34,197,94,0.1)' : saving ? 'rgba(0,255,247,0.04)' : 'rgba(0,255,247,0.08)',
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
