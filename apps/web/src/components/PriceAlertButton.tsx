'use client';

import { useState } from 'react';

interface Props {
  productId: string;
  productName: string;
  currentPrice?: number | null;
}

type State = 'idle' | 'open' | 'loading' | 'success' | 'error';

export function PriceAlertButton({ productId, productName, currentPrice }: Props) {
  const [state, setState] = useState<State>('idle');
  const [email, setEmail] = useState('');
  const [targetPrice, setTargetPrice] = useState(
    currentPrice ? Math.floor(currentPrice * 0.9).toString() : '',
  );
  const [errorMsg, setErrorMsg] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/price-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          email,
          target_price: targetPrice ? parseFloat(targetPrice) : null,
          last_price: currentPrice ?? null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Hata oluştu');

      setState('success');
      setEmail('');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Hata oluştu');
      setState('error');
    }
  }

  if (state === 'success') {
    return (
      <div
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-mono text-[10px]"
        style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e' }}
      >
        ✓ Fiyat düşünce {email || 'e-postana'} bildirim gönderilecek
      </div>
    );
  }

  if (state === 'idle') {
    return (
      <button
        type="button"
        onClick={() => setState('open')}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all"
        style={{
          background: 'rgba(196,154,60,0.05)',
          border: '1px solid rgba(196,154,60,0.2)',
          color: 'rgba(196,154,60,0.7)',
        }}
      >
        🔔 Fiyat Düşünce Haber Ver
      </button>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-xl overflow-hidden w-full max-w-sm"
      style={{ border: '1px solid rgba(196,154,60,0.2)', background: '#0c0c18' }}
    >
      <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'rgba(196,154,60,0.1)' }}>
        <p className="font-mono text-[10px] uppercase tracking-wider" style={{ color: '#C49A3C' }}>
          🔔 Fiyat Alarmı — {productName}
        </p>
        <button
          type="button"
          onClick={() => setState('idle')}
          className="font-mono text-[10px] text-gray-600 hover:text-gray-400"
        >
          ✕
        </button>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <label className="block font-mono text-[9px] uppercase tracking-wider text-gray-600 mb-1">
            E-posta Adresin
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="ornek@mail.com"
            className="w-full bg-[#08090e] border border-[rgba(196,154,60,0.15)] rounded px-3 py-2 font-mono text-xs text-gray-300 placeholder-gray-700 focus:outline-none focus:border-[rgba(196,154,60,0.4)] transition-colors"
          />
        </div>

        {currentPrice && (
          <div>
            <label className="block font-mono text-[9px] uppercase tracking-wider text-gray-600 mb-1">
              Hedef Fiyat (₺) — opsiyonel
            </label>
            <input
              type="number"
              value={targetPrice}
              onChange={e => setTargetPrice(e.target.value)}
              placeholder={currentPrice ? `Mevcut: ₺${currentPrice.toLocaleString('tr-TR')}` : 'Herhangi bir düşüşte bildir'}
              className="w-full bg-[#08090e] border border-[rgba(196,154,60,0.15)] rounded px-3 py-2 font-mono text-xs text-gray-300 placeholder-gray-700 focus:outline-none focus:border-[rgba(196,154,60,0.4)] transition-colors"
            />
            <p className="font-mono text-[9px] text-gray-700 mt-1">
              Boş bırakırsan her fiyat düşüşünde bildirim alırsın
            </p>
          </div>
        )}

        {(state === 'error') && (
          <p className="font-mono text-[10px] text-red-400">{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={state === 'loading'}
          className="w-full py-2.5 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all"
          style={{
            background: state === 'loading' ? 'rgba(196,154,60,0.05)' : 'rgba(196,154,60,0.1)',
            border: '1px solid rgba(196,154,60,0.3)',
            color: state === 'loading' ? 'rgba(196,154,60,0.4)' : '#C49A3C',
          }}
        >
          {state === 'loading' ? 'Kaydediliyor...' : 'Alarm Kur'}
        </button>
      </div>
    </form>
  );
}
