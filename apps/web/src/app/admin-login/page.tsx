'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') ?? '/admin/dashboard';

  const [tab, setTab] = useState<'password' | 'email'>('password');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const supabase = createClientComponentClient();

  // ── Super admin: şifre ile giriş ──────────────────────────────────────
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push(from);
        router.refresh();
      } else {
        const d = await res.json();
        setError(d.error ?? 'Şifre hatalı');
        setPassword('');
      }
    } catch {
      setError('Bağlantı hatası');
    } finally {
      setLoading(false);
    }
  };

  // ── Editör / kullanıcı: e-posta ile giriş ─────────────────────────────
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error: sbError } = await supabase.auth.signInWithPassword({
        email,
        password: emailPassword,
      });
      if (sbError) {
        setError('E-posta veya şifre hatalı');
        setEmailPassword('');
      } else {
        router.push(from);
        router.refresh();
      }
    } catch {
      setError('Bağlantı hatası');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Tabs */}
      <div
        className="flex rounded-xl p-1 gap-1"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(196,154,60,0.08)' }}
      >
        {(['password', 'email'] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setError(''); }}
            className="flex-1 py-2 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all"
            style={{
              background: tab === t ? 'rgba(196,154,60,0.12)' : 'transparent',
              color: tab === t ? '#C49A3C' : '#4b5563',
              border: tab === t ? '1px solid rgba(196,154,60,0.25)' : '1px solid transparent',
            }}
          >
            {t === 'password' ? '◆ Süper Admin' : '◉ Kullanıcı Girişi'}
          </button>
        ))}
      </div>

      {/* Password tab */}
      {tab === 'password' && (
        <form onSubmit={handlePasswordLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] uppercase tracking-[0.3em]"
              style={{ color: 'rgba(196,154,60,0.5)' }}>Şifre</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 rounded-xl font-mono text-sm outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: error ? '1px solid rgba(220,38,38,0.5)' : '1px solid rgba(196,154,60,0.15)',
                color: '#EDE8DF', caretColor: '#C49A3C',
              }}
              onFocus={(e) => { if (!error) e.currentTarget.style.border = '1px solid rgba(196,154,60,0.4)'; }}
              onBlur={(e) => { if (!error) e.currentTarget.style.border = '1px solid rgba(196,154,60,0.15)'; }}
            />
          </div>
          {error && <p className="font-mono text-[11px] text-center" style={{ color: '#DC2626' }}>✕ {error}</p>}
          <SubmitButton loading={loading} disabled={!password} />
        </form>
      )}

      {/* Email tab */}
      {tab === 'email' && (
        <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] uppercase tracking-[0.3em]"
              style={{ color: 'rgba(196,154,60,0.5)' }}>E-posta</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              placeholder="ornek@mail.com"
              required
              className="w-full px-4 py-3 rounded-xl font-mono text-sm outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(196,154,60,0.15)',
                color: '#EDE8DF', caretColor: '#C49A3C',
              }}
              onFocus={(e) => { e.currentTarget.style.border = '1px solid rgba(196,154,60,0.4)'; }}
              onBlur={(e) => { e.currentTarget.style.border = '1px solid rgba(196,154,60,0.15)'; }}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] uppercase tracking-[0.3em]"
              style={{ color: 'rgba(196,154,60,0.5)' }}>Şifre</label>
            <input
              type="password"
              value={emailPassword}
              onChange={(e) => setEmailPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 rounded-xl font-mono text-sm outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: error ? '1px solid rgba(220,38,38,0.5)' : '1px solid rgba(196,154,60,0.15)',
                color: '#EDE8DF', caretColor: '#C49A3C',
              }}
              onFocus={(e) => { if (!error) e.currentTarget.style.border = '1px solid rgba(196,154,60,0.4)'; }}
              onBlur={(e) => { if (!error) e.currentTarget.style.border = '1px solid rgba(196,154,60,0.15)'; }}
            />
          </div>
          {error && <p className="font-mono text-[11px] text-center" style={{ color: '#DC2626' }}>✕ {error}</p>}
          <SubmitButton loading={loading} disabled={!email || !emailPassword} />
        </form>
      )}
    </div>
  );
}

function SubmitButton({ loading, disabled }: { loading: boolean; disabled: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className="w-full py-3 rounded-xl font-orbitron text-xs font-bold uppercase tracking-[0.2em] transition-all duration-200"
      style={{
        background: loading || disabled ? 'rgba(196,154,60,0.06)' : 'rgba(196,154,60,0.12)',
        border: '1px solid rgba(196,154,60,0.3)',
        color: loading || disabled ? 'rgba(196,154,60,0.3)' : '#C49A3C',
        cursor: loading || disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {loading ? '◆ Giriş yapılıyor...' : '◆ Giriş Yap'}
    </button>
  );
}

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 relative"
      style={{ background: '#08090E' }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 600px 400px at 50% 40%, rgba(196,154,60,0.04) 0%, transparent 70%)' }} />
      <div className="absolute inset-0 pointer-events-none opacity-15"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(196,154,60,0.2) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-7 p-8 rounded-2xl"
        style={{
          background: 'rgba(12,12,22,0.85)',
          border: '1px solid rgba(196,154,60,0.12)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
        }}>
        <div className="absolute top-0 left-8 right-8 h-px rounded-full"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(196,154,60,0.6), transparent)' }} />

        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <span style={{ color: 'rgba(196,154,60,0.4)', fontSize: '9px' }}>◆</span>
            <span className="font-orbitron font-black tracking-widest"
              style={{ fontSize: '22px', color: '#C49A3C', textShadow: '0 0 30px rgba(196,154,60,0.3)' }}>
              COMPARIO
            </span>
            <span style={{ color: 'rgba(196,154,60,0.4)', fontSize: '9px' }}>◆</span>
          </div>
          <p className="font-mono text-[9px] uppercase tracking-[0.4em]" style={{ color: 'rgba(139,155,172,0.5)' }}>
            Admin Panel
          </p>
        </div>

        <div className="w-full h-px" style={{ background: 'rgba(196,154,60,0.07)' }} />

        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
