'use client';

import { useState } from 'react';

export default function UnsubscribePage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Hata');
      setStatus('done');
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Hata');
      setStatus('error');
    }
  };

  return (
    <main className="min-h-screen bg-grid flex items-center justify-center px-4" style={{ paddingTop: '88px' }}>
      <div className="w-full max-w-md rounded-2xl p-8 text-center"
        style={{ background: '#0c0c18', border: '1px solid rgba(196,154,60,0.12)' }}>
        {status === 'done' ? (
          <>
            <p className="font-orbitron text-lg font-black text-gray-300 mb-2">Aboneliğiniz İptal Edildi</p>
            <p className="font-mono text-xs text-gray-600">E-posta listemizden çıkarıldınız. Üzgünüz, görüşmek üzere.</p>
          </>
        ) : (
          <>
            <p className="font-orbitron text-sm font-black text-gray-300 mb-2 uppercase tracking-wider">
              Abonelikten Çık
            </p>
            <p className="font-mono text-xs text-gray-600 mb-6">E-posta adresinizi girin, sizi listeden çıkaralım.</p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@mail.com"
                className="w-full rounded-lg px-4 py-3 font-mono text-sm text-gray-300 placeholder-gray-700 focus:outline-none"
                style={{ background: '#0a0a14', border: '1px solid rgba(196,154,60,0.15)' }}
              />
              {status === 'error' && <p className="font-mono text-xs text-red-400">{msg}</p>}
              <button
                type="submit"
                disabled={status === 'loading'}
                className="px-6 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider disabled:opacity-60"
                style={{ background: 'rgba(196,154,60,0.12)', border: '1px solid rgba(196,154,60,0.3)', color: '#C49A3C' }}
              >
                {status === 'loading' ? 'İşleniyor...' : 'Aboneliği İptal Et'}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
