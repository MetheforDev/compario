'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/profil';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const supabase = createClientComponentClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) { setError('Şifre en az 8 karakter olmalı.'); return; }
    setError('');
    setLoading(true);
    try {
      const { error: sbError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: `${location.origin}/auth/callback?next=${next}`,
        },
      });
      if (sbError) {
        setError(sbError.message === 'User already registered'
          ? 'Bu e-posta adresi zaten kayıtlı.'
          : 'Kayıt başarısız. Tekrar dene.');
      } else {
        setDone(true);
      }
    } catch {
      setError('Bağlantı hatası.');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="text-center space-y-4">
        <div className="text-4xl">✉️</div>
        <p className="font-orbitron text-sm font-bold text-neon-cyan">E-postanı Kontrol Et</p>
        <p className="font-mono text-xs text-gray-500 leading-relaxed">
          <span className="text-gray-300">{email}</span> adresine doğrulama bağlantısı gönderdik.
          Bağlantıya tıklayarak hesabını aktive et.
        </p>
        <Link href="/giris" className="inline-block font-mono text-xs text-neon-cyan hover:underline mt-2">
          Giriş sayfasına dön →
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
      <div className="flex flex-col gap-1.5">
        <label className="font-mono text-[10px] uppercase tracking-[0.3em] text-gray-600">Ad Soyad</label>
        <input
          type="text"
          required
          value={name}
          onChange={e => setName(e.target.value)}
          autoFocus
          placeholder="Adın"
          className="w-full px-4 py-3 rounded-xl font-mono text-sm outline-none transition-all bg-[rgba(255,255,255,0.04)] text-gray-200 placeholder-gray-700"
          style={{ border: '1px solid rgba(0,255,247,0.12)', caretColor: '#00fff7' }}
          onFocus={e => { e.currentTarget.style.border = '1px solid rgba(0,255,247,0.35)'; }}
          onBlur={e => { e.currentTarget.style.border = '1px solid rgba(0,255,247,0.12)'; }}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="font-mono text-[10px] uppercase tracking-[0.3em] text-gray-600">E-posta</label>
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="ornek@mail.com"
          className="w-full px-4 py-3 rounded-xl font-mono text-sm outline-none transition-all bg-[rgba(255,255,255,0.04)] text-gray-200 placeholder-gray-700"
          style={{ border: '1px solid rgba(0,255,247,0.12)', caretColor: '#00fff7' }}
          onFocus={e => { e.currentTarget.style.border = '1px solid rgba(0,255,247,0.35)'; }}
          onBlur={e => { e.currentTarget.style.border = '1px solid rgba(0,255,247,0.12)'; }}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="font-mono text-[10px] uppercase tracking-[0.3em] text-gray-600">Şifre</label>
        <input
          type="password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="En az 8 karakter"
          className="w-full px-4 py-3 rounded-xl font-mono text-sm outline-none transition-all bg-[rgba(255,255,255,0.04)] text-gray-200 placeholder-gray-700"
          style={{ border: error ? '1px solid rgba(220,38,38,0.5)' : '1px solid rgba(0,255,247,0.12)', caretColor: '#00fff7' }}
          onFocus={e => { e.currentTarget.style.border = '1px solid rgba(0,255,247,0.35)'; }}
          onBlur={e => { e.currentTarget.style.border = error ? '1px solid rgba(220,38,38,0.5)' : '1px solid rgba(0,255,247,0.12)'; }}
        />
      </div>

      {error && <p className="font-mono text-[11px] text-red-400 text-center">✕ {error}</p>}

      <button
        type="submit"
        disabled={loading || !email || !password || !name}
        className="w-full py-3 rounded-xl font-orbitron text-xs font-bold uppercase tracking-[0.2em] transition-all mt-1"
        style={{
          background: loading ? 'rgba(0,255,247,0.04)' : 'rgba(0,255,247,0.08)',
          border: '1px solid rgba(0,255,247,0.25)',
          color: loading ? 'rgba(0,255,247,0.3)' : '#00fff7',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Kaydediliyor...' : 'Kayıt Ol'}
      </button>

      <p className="font-mono text-[11px] text-center text-gray-600 mt-2">
        Zaten hesabın var mı?{' '}
        <Link href="/giris" className="text-neon-cyan hover:underline">Giriş yap</Link>
      </p>
    </form>
  );
}

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-grid">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 600px 400px at 50% 40%, rgba(0,255,247,0.03) 0%, transparent 70%)' }} />

      <div className="relative z-10 w-full max-w-sm">
        <div
          className="flex flex-col items-center gap-7 p-8 rounded-2xl"
          style={{
            background: 'rgba(12,12,22,0.85)',
            border: '1px solid rgba(0,255,247,0.1)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
          }}
        >
          <div className="absolute top-0 left-8 right-8 h-px rounded-full"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(0,255,247,0.4), transparent)' }} />

          <div className="flex flex-col items-center gap-1 text-center">
            <Link href="/" className="font-orbitron font-black text-xl text-neon-cyan text-glow-cyan tracking-widest">
              COMPARIO
            </Link>
            <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-gray-600">
              Ücretsiz Hesap Oluştur
            </p>
          </div>

          <div className="w-full h-px" style={{ background: 'rgba(0,255,247,0.06)' }} />

          <Suspense fallback={null}>
            <RegisterForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
