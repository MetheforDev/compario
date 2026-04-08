'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!EMAIL_RE.test(email)) {
      toast.error('Geçerli bir e-posta adresi girin.');
      return;
    }

    setStatus('loading');

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json() as { error?: string; message?: string };

      if (res.status === 409) {
        toast('Zaten abonesiniz!', { icon: '✓' });
        setStatus('idle');
        setEmail('');
        return;
      }
      if (!res.ok) {
        throw new Error(data.error ?? 'Abonelik oluşturulamadı.');
      }

      setStatus('done');
      toast.success('Abone oldunuz! Hoş geldiniz 🎉');
    } catch (err) {
      setStatus('idle');
      toast.error(err instanceof Error ? err.message : 'Bir hata oluştu.');
    }
  };

  if (status === 'done') {
    return (
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl"
        style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}
      >
        <span className="text-green-400 text-lg flex-shrink-0">✓</span>
        <div>
          <p className="font-mono text-xs text-green-400 font-medium">Abone oldunuz!</p>
          <p className="font-mono text-[10px] text-gray-600">Hoş geldiniz, yakında görüşürüz.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-posta adresiniz"
          required
          disabled={status === 'loading'}
          className="flex-1 min-w-0 rounded-lg px-3.5 py-2.5 font-mono text-xs text-gray-300 placeholder-gray-700 focus:outline-none transition-colors disabled:opacity-60"
          style={{
            background: '#0a0a14',
            border: '1px solid rgba(196,154,60,0.2)',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(196,154,60,0.5)'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(196,154,60,0.2)'; }}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="flex-shrink-0 px-4 py-2.5 rounded-lg font-mono text-[11px] uppercase tracking-wider transition-all disabled:opacity-60 whitespace-nowrap"
          style={{
            background: 'linear-gradient(135deg, rgba(196,154,60,0.2), rgba(196,154,60,0.1))',
            border: '1px solid rgba(196,154,60,0.4)',
            color: '#C49A3C',
          }}
        >
          {status === 'loading' ? (
            <span className="inline-block w-3.5 h-3.5 border-2 border-[rgba(196,154,60,0.3)] border-t-[#C49A3C] rounded-full animate-spin" />
          ) : 'Abone Ol'}
        </button>
      </div>
      <p className="font-mono text-[9px] text-gray-700">
        Spam yok. İstediğin zaman aboneliği iptal edebilirsin.
      </p>
    </form>
  );
}
