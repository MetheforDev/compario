'use client';

import { useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') ?? '/admin/dashboard';

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
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
        const data = await res.json();
        setError(data.error ?? 'Giriş başarısız');
        setPassword('');
        inputRef.current?.focus();
      }
    } catch {
      setError('Bağlantı hatası, tekrar deneyin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
      {/* Password input */}
      <div className="flex flex-col gap-1.5">
        <label className="font-mono text-[10px] uppercase tracking-[0.3em]"
          style={{ color: 'rgba(196,154,60,0.6)' }}>
          Şifre
        </label>
        <input
          ref={inputRef}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          autoComplete="current-password"
          className="w-full px-4 py-3 rounded-xl font-mono text-sm outline-none transition-all duration-200"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: error
              ? '1px solid rgba(220,38,38,0.5)'
              : '1px solid rgba(196,154,60,0.15)',
            color: '#EDE8DF',
            caretColor: '#C49A3C',
          }}
          onFocus={(e) => {
            if (!error) e.currentTarget.style.border = '1px solid rgba(196,154,60,0.4)';
          }}
          onBlur={(e) => {
            if (!error) e.currentTarget.style.border = '1px solid rgba(196,154,60,0.15)';
          }}
          placeholder="••••••••"
          required
        />
      </div>

      {/* Error */}
      {error && (
        <p className="font-mono text-[11px] text-center" style={{ color: '#DC2626' }}>
          ✕ {error}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !password}
        className="w-full py-3 rounded-xl font-orbitron text-xs font-bold uppercase tracking-[0.2em] transition-all duration-200"
        style={{
          background: loading || !password
            ? 'rgba(196,154,60,0.06)'
            : 'rgba(196,154,60,0.12)',
          border: '1px solid rgba(196,154,60,0.3)',
          color: loading || !password ? 'rgba(196,154,60,0.3)' : '#C49A3C',
          cursor: loading || !password ? 'not-allowed' : 'pointer',
        }}
        onMouseEnter={(e) => {
          if (!loading && password) {
            (e.currentTarget as HTMLElement).style.background = 'rgba(196,154,60,0.18)';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px rgba(196,154,60,0.15)';
          }
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = loading || !password
            ? 'rgba(196,154,60,0.06)' : 'rgba(196,154,60,0.12)';
          (e.currentTarget as HTMLElement).style.boxShadow = '';
        }}
      >
        {loading ? '◆ Giriş yapılıyor...' : '◆ Giriş Yap'}
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: '#08090E' }}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 600px 400px at 50% 40%, rgba(196,154,60,0.04) 0%, transparent 70%)',
        }}
      />

      {/* Background dots */}
      <div
        className="absolute inset-0 pointer-events-none opacity-15"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(196,154,60,0.2) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-sm flex flex-col items-center gap-8 p-8 rounded-2xl"
        style={{
          background: 'rgba(12, 12, 22, 0.8)',
          border: '1px solid rgba(196,154,60,0.12)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(196,154,60,0.05)',
        }}
      >
        {/* Top accent */}
        <div
          className="absolute top-0 left-8 right-8 h-px rounded-full"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(196,154,60,0.6), transparent)' }}
        />

        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <span style={{ color: 'rgba(196,154,60,0.4)', fontSize: '9px' }}>◆</span>
            <span
              className="font-orbitron font-black tracking-widest"
              style={{
                fontSize: '22px',
                color: '#C49A3C',
                textShadow: '0 0 30px rgba(196,154,60,0.3)',
              }}
            >
              COMPARIO
            </span>
            <span style={{ color: 'rgba(196,154,60,0.4)', fontSize: '9px' }}>◆</span>
          </div>
          <p className="font-mono text-[9px] uppercase tracking-[0.4em]"
            style={{ color: 'rgba(139,155,172,0.5)' }}>
            Admin Panel
          </p>
        </div>

        {/* Divider */}
        <div
          className="w-full h-px"
          style={{ background: 'rgba(196,154,60,0.07)' }}
        />

        {/* Form */}
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
