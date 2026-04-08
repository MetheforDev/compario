'use client';

import { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface PricePoint {
  id: string;
  product_id: string;
  price: number;
  currency: string;
  recorded_at: string;
}

interface Props {
  productId: string;
  currentPrice?: number | null;
  currency?: string;
}

function fmt(n: number) {
  return n.toLocaleString('tr-TR');
}

function shortDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

// ─── Custom Tooltip ──────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const price = payload[0]?.value as number;
  return (
    <div
      className="rounded-lg px-3 py-2 text-xs font-mono"
      style={{
        background: '#0f0f1a',
        border: '1px solid rgba(196,154,60,0.25)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
      }}
    >
      <p style={{ color: 'rgba(196,154,60,0.6)', marginBottom: 2 }}>{label}</p>
      <p style={{ color: '#C49A3C', fontWeight: 900, fontSize: 14 }}>₺{fmt(price)}</p>
    </div>
  );
}

// ─── Alert Form ──────────────────────────────────────────────────────────────
function AlertForm({
  productId,
  currentPrice,
}: {
  productId: string;
  currentPrice: number | null;
}) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [targetPrice, setTargetPrice] = useState(
    currentPrice ? String(Math.floor(currentPrice * 0.9)) : '',
  );
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch('/api/prices/alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          email: email.trim(),
          targetPrice: Number(targetPrice),
        }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? 'Hata');
      }
      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message ?? 'Bir hata oluştu');
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 hover:-translate-y-px"
        style={{
          background: 'rgba(196,154,60,0.06)',
          border: '1px solid rgba(196,154,60,0.2)',
          color: '#C49A3C',
        }}
      >
        <span style={{ fontSize: 14 }}>🔔</span>
        Fiyat Düşünce Haber Ver
      </button>
    );
  }

  if (status === 'success') {
    return (
      <div
        className="rounded-xl px-5 py-4 text-sm font-mono"
        style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)' }}
      >
        <p className="font-bold" style={{ color: '#22c55e' }}>✓ Alarm kuruldu!</p>
        <p className="text-xs text-gray-500 mt-1">
          Fiyat hedef fiyatınıza düştüğünde <span style={{ color: '#C49A3C' }}>{email}</span> adresine bildirim göndereceğiz.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-xl p-5 space-y-4"
      style={{ background: '#0c0c18', border: '1px solid rgba(196,154,60,0.12)' }}
    >
      <div className="flex items-center justify-between">
        <p className="font-orbitron text-[10px] uppercase tracking-[0.3em]" style={{ color: '#C49A3C' }}>
          🔔 Fiyat Alarmı
        </p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="font-mono text-xs text-gray-700 hover:text-gray-400 transition-colors"
        >
          ✕
        </button>
      </div>

      <div>
        <label className="block font-mono text-[10px] uppercase tracking-wider text-gray-600 mb-1.5">
          E-posta
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ornek@email.com"
          className="w-full rounded-lg px-3 py-2.5 text-sm font-mono bg-[#0a0a14] text-gray-300 outline-none transition-colors"
          style={{ border: '1px solid rgba(196,154,60,0.15)', color: '#e5e7eb' }}
        />
      </div>

      <div>
        <label className="block font-mono text-[10px] uppercase tracking-wider text-gray-600 mb-1.5">
          Hedef Fiyat (₺)
        </label>
        <input
          type="number"
          required
          min={1}
          value={targetPrice}
          onChange={(e) => setTargetPrice(e.target.value)}
          placeholder="Örn: 850000"
          className="w-full rounded-lg px-3 py-2.5 text-sm font-mono bg-[#0a0a14] text-gray-300 outline-none transition-colors"
          style={{ border: '1px solid rgba(196,154,60,0.15)', color: '#e5e7eb' }}
        />
        {currentPrice && (
          <p className="font-mono text-[10px] text-gray-700 mt-1">
            Şu anki fiyat: ₺{fmt(currentPrice)}
          </p>
        )}
      </div>

      {status === 'error' && (
        <p className="font-mono text-xs" style={{ color: '#f87171' }}>✕ {errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full py-2.5 rounded-lg font-mono text-xs font-bold uppercase tracking-wider transition-all"
        style={{
          background: status === 'loading' ? 'rgba(196,154,60,0.2)' : 'rgba(196,154,60,0.15)',
          border: '1px solid rgba(196,154,60,0.3)',
          color: '#C49A3C',
          cursor: status === 'loading' ? 'not-allowed' : 'pointer',
        }}
      >
        {status === 'loading' ? 'Kaydediliyor...' : 'Alarm Kur →'}
      </button>

      <p className="font-mono text-[9px] text-gray-700 text-center">
        Fiyat hedef fiyatınıza düştüğünde tek seferlik bildirim gönderilir.
      </p>
    </form>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function PriceHistory({ productId, currentPrice, currency = 'TRY' }: Props) {
  const [history, setHistory] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/prices/${productId}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setHistory(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [productId]);

  // If no history and no current price, don't render
  if (!loading && history.length === 0 && !currentPrice) return null;

  const chartData = history.map((p) => ({
    date: shortDate(p.recorded_at),
    price: p.price,
  }));

  // Stats
  const prices = history.map((p) => p.price);
  const minPrice = prices.length ? Math.min(...prices) : null;
  const maxPrice = prices.length ? Math.max(...prices) : null;
  const avgPrice = prices.length ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : null;
  const firstPrice = prices[0] ?? null;
  const lastPrice = prices[prices.length - 1] ?? currentPrice ?? null;
  const trend = firstPrice && lastPrice ? lastPrice - firstPrice : null;
  const trendPct = firstPrice && trend !== null ? ((trend / firstPrice) * 100).toFixed(1) : null;

  return (
    <section
      className="rounded-xl overflow-hidden"
      style={{ border: '1px solid rgba(196,154,60,0.1)', background: '#0a0a14' }}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b flex items-center justify-between flex-wrap gap-3"
        style={{ borderColor: 'rgba(196,154,60,0.08)', background: '#0d0d18' }}>
        <h2 className="font-orbitron text-[10px] uppercase tracking-[0.3em] text-neon-cyan opacity-70">
          ⬡ 30 Günlük Fiyat Geçmişi
        </h2>
        {trendPct !== null && (
          <span
            className="font-mono text-[10px] uppercase tracking-wider px-2 py-1 rounded"
            style={{
              background: trend! < 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
              color: trend! < 0 ? '#22c55e' : '#ef4444',
              border: `1px solid ${trend! < 0 ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
            }}
          >
            {trend! < 0 ? '▼' : '▲'} {Math.abs(Number(trendPct))}% 30 günde
          </span>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Stats row */}
        {prices.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'En Düşük', value: minPrice, color: '#22c55e' },
              { label: 'Ortalama', value: avgPrice, color: '#C49A3C' },
              { label: 'En Yüksek', value: maxPrice, color: '#ef4444' },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-lg px-3 py-2.5 text-center"
                style={{ background: '#0c0c18', border: '1px solid rgba(196,154,60,0.06)' }}>
                <p className="font-mono text-[9px] uppercase tracking-wider text-gray-600 mb-1">{label}</p>
                <p className="font-orbitron text-sm font-black" style={{ color }}>
                  {value !== null ? `₺${fmt(value)}` : '—'}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Chart */}
        {loading ? (
          <div className="h-48 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 animate-spin"
              style={{ borderColor: 'rgba(196,154,60,0.1)', borderTopColor: '#C49A3C' }} />
          </div>
        ) : chartData.length > 1 ? (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C49A3C" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#C49A3C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#4b5563', fontSize: 9, fontFamily: 'monospace' }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fill: '#4b5563', fontSize: 9, fontFamily: 'monospace' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₺${(v / 1000).toFixed(0)}k`}
                  width={52}
                />
                <Tooltip content={<CustomTooltip />} />
                {currentPrice && (
                  <ReferenceLine
                    y={currentPrice}
                    stroke="rgba(0,255,247,0.3)"
                    strokeDasharray="4 4"
                    label={{ value: 'Şu an', fill: 'rgba(0,255,247,0.5)', fontSize: 9, fontFamily: 'monospace' }}
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#C49A3C"
                  strokeWidth={2}
                  fill="url(#priceGradient)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#C49A3C', stroke: '#08090E', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : chartData.length === 1 ? (
          <div className="h-24 flex items-center justify-center">
            <p className="font-mono text-xs text-gray-600">
              Grafik için en az 2 veri noktası gerekli. Yarın kontrol edin.
            </p>
          </div>
        ) : (
          <div className="h-24 flex items-center justify-center">
            <p className="font-mono text-xs text-gray-700">
              Henüz fiyat geçmişi yok — yarından itibaren kaydedilmeye başlanacak.
            </p>
          </div>
        )}

        {/* Alert form */}
        <AlertForm productId={productId} currentPrice={currentPrice ?? null} />
      </div>
    </section>
  );
}
