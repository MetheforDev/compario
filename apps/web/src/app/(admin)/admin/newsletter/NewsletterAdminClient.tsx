'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { NewsletterSubscriber } from '@compario/database';

interface Props {
  subscribers: NewsletterSubscriber[];
  counts: { active: number; total: number };
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div
      className="rounded-xl px-5 py-4 flex flex-col gap-1"
      style={{ background: '#0d0d1a', border: '1px solid rgba(196,154,60,0.08)' }}
    >
      <span className="font-mono text-[10px] uppercase tracking-wider text-gray-600">{label}</span>
      <span className="font-orbitron text-2xl font-black" style={{ color }}>{value}</span>
    </div>
  );
}

function BulkEmailForm() {
  const [subject, setSubject] = useState('');
  const [html, setHtml] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [result, setResult] = useState<{ sent: number; failed: number; total: number } | null>(null);
  const [error, setError] = useState('');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !html.trim()) return;
    if (!confirm(`"${subject}" konulu e-postayı tüm aktif abonelere göndermek istiyor musunuz?`)) return;

    setStatus('loading');
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, html, text: '' }),
      });
      const data = await res.json() as { sent?: number; failed?: number; total?: number; error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Gönderilemedi');
      setResult({ sent: data.sent ?? 0, failed: data.failed ?? 0, total: data.total ?? 0 });
      setStatus('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hata');
      setStatus('error');
    }
  };

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: '1px solid rgba(196,154,60,0.1)', background: '#0a0a14' }}
    >
      <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(196,154,60,0.08)', background: '#0d0d18' }}>
        <h2 className="font-orbitron text-[10px] uppercase tracking-[0.3em] text-neon-cyan opacity-70">
          ✉ Toplu E-posta Gönder
        </h2>
      </div>

      <form onSubmit={handleSend} className="p-6 space-y-4">
        <div>
          <label className="block font-mono text-[10px] uppercase tracking-wider text-gray-600 mb-2">Konu</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            placeholder="E-posta konusu"
            className="w-full rounded-lg px-4 py-2.5 font-mono text-sm text-gray-300 placeholder-gray-700 focus:outline-none"
            style={{ background: '#0a0a14', border: '1px solid rgba(196,154,60,0.2)' }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(196,154,60,0.5)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(196,154,60,0.2)'; }}
          />
        </div>
        <div>
          <label className="block font-mono text-[10px] uppercase tracking-wider text-gray-600 mb-2">
            HTML İçerik
          </label>
          <textarea
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            required
            rows={10}
            placeholder="<h1>Merhaba</h1><p>Bu ay en çok karşılaştırılan ürünler...</p>"
            className="w-full rounded-lg px-4 py-3 font-mono text-xs text-gray-300 placeholder-gray-700 resize-y focus:outline-none"
            style={{ background: '#0a0a14', border: '1px solid rgba(196,154,60,0.2)' }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(196,154,60,0.5)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(196,154,60,0.2)'; }}
          />
        </div>

        {error && <p className="font-mono text-xs text-red-400">{error}</p>}

        {status === 'done' && result && (
          <div
            className="rounded-lg px-4 py-3"
            style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}
          >
            <p className="font-mono text-xs text-green-400">
              ✓ Gönderildi: {result.sent} / {result.total}
              {result.failed > 0 && <span className="text-red-400 ml-2">· Başarısız: {result.failed}</span>}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={status === 'loading'}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider transition-all disabled:opacity-60"
          style={{
            background: 'rgba(196,154,60,0.12)',
            border: '1px solid rgba(196,154,60,0.35)',
            color: '#C49A3C',
          }}
        >
          {status === 'loading' ? (
            <>
              <span className="inline-block w-3 h-3 border-2 border-[rgba(196,154,60,0.3)] border-t-[#C49A3C] rounded-full animate-spin" />
              Gönderiliyor...
            </>
          ) : 'Tüm Abonelere Gönder'}
        </button>
      </form>
    </div>
  );
}

function SubscriberRow({ sub, onRemove }: { sub: NewsletterSubscriber; onRemove: (id: string) => void }) {
  const [isPending, startTransition] = useTransition();
  const date = new Date(sub.subscribed_at).toLocaleDateString('tr-TR', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  const handleUnsubscribe = () => {
    startTransition(async () => {
      await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: sub.email }),
      });
      onRemove(sub.id);
    });
  };

  return (
    <div
      className="flex items-center justify-between gap-4 px-4 py-3 rounded-lg transition-opacity"
      style={{
        background: '#0d0d1a',
        border: '1px solid rgba(196,154,60,0.06)',
        opacity: isPending ? 0.5 : 1,
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] font-bold flex-shrink-0"
          style={{ background: sub.status === 'active' ? 'rgba(34,197,94,0.12)' : 'rgba(107,114,128,0.1)', color: sub.status === 'active' ? '#22c55e' : '#6b7280' }}
        >
          {sub.email[0]?.toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="font-mono text-xs text-gray-300 truncate">{sub.email}</p>
          <p className="font-mono text-[10px] text-gray-700">{date}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <span
          className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded"
          style={{
            background: sub.status === 'active' ? 'rgba(34,197,94,0.1)' : 'rgba(107,114,128,0.1)',
            color: sub.status === 'active' ? '#22c55e' : '#6b7280',
          }}
        >
          {sub.status === 'active' ? 'Aktif' : 'Çıktı'}
        </span>
        {sub.status === 'active' && (
          <button
            onClick={handleUnsubscribe}
            disabled={isPending}
            className="font-mono text-[10px] text-gray-700 hover:text-red-400 transition-colors uppercase tracking-wider"
          >
            Çıkar
          </button>
        )}
      </div>
    </div>
  );
}

export function NewsletterAdminClient({ subscribers: initial, counts }: Props) {
  const router = useRouter();
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>(initial);
  const [filter, setFilter] = useState<'all' | 'active' | 'unsubscribed'>('all');
  const [search, setSearch] = useState('');

  const handleRemove = (id: string) => {
    setSubscribers((prev) =>
      prev.map((s) => s.id === id ? { ...s, status: 'unsubscribed' } : s)
    );
    router.refresh();
  };

  const filtered = subscribers
    .filter((s) => filter === 'all' || s.status === filter)
    .filter((s) => !search || s.email.includes(search.toLowerCase()));

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-orbitron text-xl font-black text-white mb-1">Newsletter</h1>
        <p className="font-mono text-xs text-gray-600">Abone yönetimi ve toplu e-posta</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard label="Aktif Abone" value={counts.active} color="#22c55e" />
        <StatCard label="Toplam Kayıt" value={counts.total} color="#C49A3C" />
        <StatCard label="Çıkan" value={counts.total - counts.active} color="#6b7280" />
      </div>

      {/* Bulk email */}
      <BulkEmailForm />

      {/* Subscriber list */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: '1px solid rgba(196,154,60,0.1)', background: '#0a0a14' }}
      >
        <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(196,154,60,0.08)', background: '#0d0d18' }}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h2 className="font-orbitron text-[10px] uppercase tracking-[0.3em] text-neon-cyan opacity-70">
              Abone Listesi
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="search"
                placeholder="E-posta ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-lg px-3 py-1.5 font-mono text-xs text-gray-400 placeholder-gray-700 focus:outline-none"
                style={{ background: '#0a0a14', border: '1px solid rgba(196,154,60,0.15)', width: 160 }}
              />
              {(['all', 'active', 'unsubscribed'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all"
                  style={{
                    background: filter === f ? 'rgba(196,154,60,0.12)' : 'transparent',
                    border: `1px solid ${filter === f ? 'rgba(196,154,60,0.3)' : 'rgba(255,255,255,0.06)'}`,
                    color: filter === f ? '#C49A3C' : '#6b7280',
                  }}
                >
                  {f === 'all' ? 'Tümü' : f === 'active' ? 'Aktif' : 'Çıkan'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 space-y-2">
          {filtered.length === 0 ? (
            <p className="font-mono text-xs text-gray-700 text-center py-8">Abone bulunamadı</p>
          ) : (
            filtered.map((sub) => (
              <SubscriberRow key={sub.id} sub={sub} onRemove={handleRemove} />
            ))
          )}
        </div>

        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t" style={{ borderColor: 'rgba(196,154,60,0.06)' }}>
            <p className="font-mono text-[10px] text-gray-700">{filtered.length} kayıt</p>
          </div>
        )}
      </div>
    </div>
  );
}
