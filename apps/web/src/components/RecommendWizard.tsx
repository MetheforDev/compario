'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

interface Recommendation {
  rank: number;
  product_name: string;
  product_slug: string;
  badge: string;
  summary: string;
  pros: string[];
  cons: string[];
  verdict: string;
  price_min?: number | null;
  price_max?: number | null;
}

interface ApiResult {
  recommendations: Recommendation[];
  ai_note?: string | null;
}

const PRIORITY_OPTIONS = [
  { value: 'performans',     label: 'Performans',     icon: '⚡' },
  { value: 'batarya',        label: 'Uzun Batarya',   icon: '🔋' },
  { value: 'kamera',         label: 'Kamera',         icon: '📸' },
  { value: 'fiyat-performans',label: 'Fiyat/Performans',icon: '💎' },
  { value: 'tasarim',        label: 'Tasarım',        icon: '✨' },
  { value: 'hafiflik',       label: 'Hafiflik',       icon: '🪶' },
  { value: 'ekran',          label: 'Ekran Kalitesi', icon: '🖥️' },
  { value: 'dayaniklilik',   label: 'Dayanıklılık',   icon: '🛡️' },
];

const BUDGET_PRESETS = [
  { label: '₺10.000\'e kadar',  value: 10000  },
  { label: '₺25.000\'e kadar',  value: 25000  },
  { label: '₺50.000\'e kadar',  value: 50000  },
  { label: '₺75.000\'e kadar',  value: 75000  },
  { label: '₺100.000\'e kadar', value: 100000 },
  { label: 'Sınırsız',          value: 0      },
];

type Step = 'category' | 'budget' | 'priorities' | 'loading' | 'result' | 'error';

export function RecommendWizard({ categories }: { categories: Category[] }) {
  const [step, setStep] = useState<Step>('category');
  const [selectedCat, setSelectedCat] = useState<Category | null>(null);
  const [budgetMax, setBudgetMax] = useState<number>(0);
  const [priorities, setPriorities] = useState<string[]>([]);
  const [customNote, setCustomNote] = useState('');
  const [result, setResult] = useState<ApiResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  function togglePriority(v: string) {
    setPriorities(prev =>
      prev.includes(v) ? prev.filter(p => p !== v) : prev.length < 3 ? [...prev, v] : prev
    );
  }

  async function submit() {
    setStep('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category_slug: selectedCat?.slug,
          budget_max: budgetMax || null,
          priorities,
          custom_note: customNote,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Öneri alınamadı');
      setResult(data);
      setStep('result');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Hata oluştu');
      setStep('error');
    }
  }

  function reset() {
    setStep('category');
    setSelectedCat(null);
    setBudgetMax(0);
    setPriorities([]);
    setCustomNote('');
    setResult(null);
  }

  const goldBorder = { border: '1px solid rgba(196,154,60,0.15)', background: '#0c0c18' };
  const stepLabel = 'font-mono text-[9px] uppercase tracking-[0.3em] mb-6 block';

  // ── Step 1: Kategori ──────────────────────────────────────────────────────
  if (step === 'category') {
    return (
      <div className="rounded-2xl p-6 sm:p-8" style={goldBorder}>
        <span className={stepLabel} style={{ color: '#C49A3C' }}>Adım 1 / 3 — Kategori</span>
        <h2 className="font-orbitron text-lg font-black text-white mb-6">Ne arıyorsun?</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          {categories.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCat(cat)}
              className="flex flex-col items-center gap-2 py-4 px-3 rounded-xl transition-all"
              style={{
                background: selectedCat?.id === cat.id ? 'rgba(196,154,60,0.1)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${selectedCat?.id === cat.id ? 'rgba(196,154,60,0.5)' : 'rgba(255,255,255,0.06)'}`,
              }}
            >
              <span className="text-2xl">{cat.icon ?? '📦'}</span>
              <span className="font-mono text-[10px] text-gray-400 uppercase tracking-wider text-center leading-tight">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
        <button
          type="button"
          disabled={!selectedCat}
          onClick={() => setStep('budget')}
          className="w-full py-3 rounded-xl font-mono text-[11px] uppercase tracking-wider transition-all"
          style={{
            background: selectedCat ? 'rgba(196,154,60,0.12)' : 'rgba(196,154,60,0.03)',
            border: `1px solid ${selectedCat ? 'rgba(196,154,60,0.5)' : 'rgba(196,154,60,0.1)'}`,
            color: selectedCat ? '#C49A3C' : 'rgba(196,154,60,0.3)',
          }}
        >
          Devam →
        </button>
      </div>
    );
  }

  // ── Step 2: Bütçe ─────────────────────────────────────────────────────────
  if (step === 'budget') {
    return (
      <div className="rounded-2xl p-6 sm:p-8" style={goldBorder}>
        <span className={stepLabel} style={{ color: '#C49A3C' }}>Adım 2 / 3 — Bütçe</span>
        <h2 className="font-orbitron text-lg font-black text-white mb-2">Bütçen ne kadar?</h2>
        <p className="font-mono text-xs text-gray-600 mb-6">
          {selectedCat?.icon} {selectedCat?.name} için
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          {BUDGET_PRESETS.map(preset => (
            <button
              key={preset.value}
              type="button"
              onClick={() => setBudgetMax(preset.value)}
              className="py-3 px-4 rounded-xl font-mono text-[10px] transition-all"
              style={{
                background: budgetMax === preset.value ? 'rgba(196,154,60,0.1)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${budgetMax === preset.value ? 'rgba(196,154,60,0.5)' : 'rgba(255,255,255,0.06)'}`,
                color: budgetMax === preset.value ? '#C49A3C' : '#9ca3af',
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={() => setStep('category')}
            className="px-5 py-3 rounded-xl font-mono text-[10px] uppercase tracking-wider text-gray-600 transition-colors hover:text-gray-400"
            style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
            ← Geri
          </button>
          <button
            type="button"
            onClick={() => setStep('priorities')}
            className="flex-1 py-3 rounded-xl font-mono text-[11px] uppercase tracking-wider transition-all"
            style={{
              background: 'rgba(196,154,60,0.12)',
              border: '1px solid rgba(196,154,60,0.5)',
              color: '#C49A3C',
            }}
          >
            Devam →
          </button>
        </div>
      </div>
    );
  }

  // ── Step 3: Öncelikler ───────────────────────────────────────────────────
  if (step === 'priorities') {
    return (
      <div className="rounded-2xl p-6 sm:p-8" style={goldBorder}>
        <span className={stepLabel} style={{ color: '#C49A3C' }}>Adım 3 / 3 — Öncelikler</span>
        <h2 className="font-orbitron text-lg font-black text-white mb-2">En önemli özelliğin ne?</h2>
        <p className="font-mono text-xs text-gray-600 mb-6">En fazla 3 seçebilirsin</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
          {PRIORITY_OPTIONS.map(opt => {
            const active = priorities.includes(opt.value);
            const maxed = !active && priorities.length >= 3;
            return (
              <button
                key={opt.value}
                type="button"
                disabled={maxed}
                onClick={() => togglePriority(opt.value)}
                className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl font-mono text-[9px] uppercase tracking-wider transition-all"
                style={{
                  background: active ? 'rgba(0,255,247,0.08)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${active ? 'rgba(0,255,247,0.3)' : 'rgba(255,255,255,0.06)'}`,
                  color: active ? 'rgba(0,255,247,0.9)' : maxed ? '#374151' : '#6b7280',
                  opacity: maxed ? 0.4 : 1,
                }}
              >
                <span className="text-lg">{opt.icon}</span>
                {opt.label}
              </button>
            );
          })}
        </div>

        <div className="mb-6">
          <label className="block font-mono text-[9px] uppercase tracking-wider text-gray-600 mb-2">
            Ek not (opsiyonel)
          </label>
          <textarea
            value={customNote}
            onChange={e => setCustomNote(e.target.value)}
            placeholder="Örn: Fotoğraf çekmeyi çok seviyorum, taşınabilirlik önemli..."
            rows={2}
            className="w-full bg-[#08090e] border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 font-mono text-xs text-gray-300 placeholder-gray-700 focus:outline-none focus:border-[rgba(196,154,60,0.3)] transition-colors resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => setStep('budget')}
            className="px-5 py-3 rounded-xl font-mono text-[10px] uppercase tracking-wider text-gray-600 transition-colors hover:text-gray-400"
            style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
            ← Geri
          </button>
          <button
            type="button"
            onClick={submit}
            className="flex-1 py-3 rounded-xl font-orbitron text-xs font-bold uppercase tracking-wider transition-all"
            style={{
              background: 'linear-gradient(135deg, rgba(196,154,60,0.2), rgba(196,154,60,0.08))',
              border: '1px solid rgba(196,154,60,0.6)',
              color: '#C49A3C',
              boxShadow: '0 0 20px rgba(196,154,60,0.1)',
            }}
          >
            ◆ AI Önerisi Al
          </button>
        </div>
      </div>
    );
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (step === 'loading') {
    return (
      <div className="rounded-2xl p-12 text-center" style={goldBorder}>
        <div className="inline-block w-8 h-8 border-2 border-t-[#C49A3C] border-[rgba(196,154,60,0.1)] rounded-full animate-spin mb-6" />
        <p className="font-orbitron text-sm text-white mb-2">Analiz ediliyor...</p>
        <p className="font-mono text-xs text-gray-600">
          {selectedCat?.name} ürünleri tercihlerinle karşılaştırılıyor
        </p>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (step === 'error') {
    return (
      <div className="rounded-2xl p-8 text-center" style={{ ...goldBorder, borderColor: 'rgba(239,68,68,0.2)' }}>
        <p className="font-mono text-sm text-red-400 mb-4">{errorMsg}</p>
        <button onClick={reset} className="font-mono text-[10px] uppercase tracking-wider text-gray-400 hover:text-white transition-colors">
          ← Tekrar Dene
        </button>
      </div>
    );
  }

  // ── Result ────────────────────────────────────────────────────────────────
  if (step === 'result' && result) {
    return (
      <div className="space-y-4">
        {result.ai_note && (
          <div className="px-4 py-3 rounded-xl font-mono text-xs text-gray-400"
            style={{ background: 'rgba(196,154,60,0.04)', border: '1px solid rgba(196,154,60,0.12)' }}>
            💡 {result.ai_note}
          </div>
        )}

        {result.recommendations.map((rec, i) => (
          <div key={i} className="rounded-2xl overflow-hidden"
            style={{
              border: i === 0 ? '1px solid rgba(196,154,60,0.4)' : '1px solid rgba(255,255,255,0.06)',
              background: i === 0 ? 'linear-gradient(135deg, #0f0e18, #0c0c18)' : '#0a0a12',
              boxShadow: i === 0 ? '0 0 30px rgba(196,154,60,0.08)' : undefined,
            }}>

            {/* Header */}
            <div className="px-6 py-4 border-b flex items-center justify-between flex-wrap gap-2"
              style={{ borderColor: i === 0 ? 'rgba(196,154,60,0.15)' : 'rgba(255,255,255,0.04)' }}>
              <div className="flex items-center gap-3">
                {i === 0 && (
                  <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-1 rounded-full"
                    style={{ background: 'rgba(196,154,60,0.15)', color: '#C49A3C', border: '1px solid rgba(196,154,60,0.3)' }}>
                    ◆ {rec.badge || 'AI Önerisi'}
                  </span>
                )}
                {i > 0 && (
                  <span className="font-mono text-[9px] uppercase tracking-wider text-gray-600">
                    #{i + 1} Alternatif
                  </span>
                )}
              </div>
              {rec.price_min && (
                <span className="font-orbitron text-sm font-black" style={{ color: '#C49A3C' }}>
                  ₺{rec.price_min.toLocaleString('tr-TR')}
                  {rec.price_max && rec.price_max !== rec.price_min && (
                    <span className="font-mono text-xs font-normal text-gray-600 ml-1">
                      — ₺{rec.price_max.toLocaleString('tr-TR')}
                    </span>
                  )}
                </span>
              )}
            </div>

            <div className="px-6 py-5">
              <h3 className="font-orbitron text-base font-black text-white mb-3">{rec.product_name}</h3>
              <p className="font-mono text-xs text-gray-400 leading-relaxed mb-4">{rec.summary}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {rec.pros?.length > 0 && (
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-wider text-green-500 mb-2">✓ Artılar</p>
                    <ul className="space-y-1">
                      {rec.pros.map((p, j) => (
                        <li key={j} className="font-mono text-[10px] text-gray-400 flex items-start gap-1.5">
                          <span className="text-green-500 mt-0.5">+</span>{p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {rec.cons?.length > 0 && (
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-wider text-red-400 mb-2">✗ Eksiler</p>
                    <ul className="space-y-1">
                      {rec.cons.map((c, j) => (
                        <li key={j} className="font-mono text-[10px] text-gray-400 flex items-start gap-1.5">
                          <span className="text-red-400 mt-0.5">−</span>{c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t flex items-center justify-between gap-3 flex-wrap"
                style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                <p className="font-mono text-[10px] text-gray-500 italic">"{rec.verdict}"</p>
                {rec.product_slug && (
                  <Link
                    href={`/products/${rec.product_slug}`}
                    className="px-4 py-2 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all"
                    style={{
                      background: i === 0 ? 'rgba(196,154,60,0.12)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${i === 0 ? 'rgba(196,154,60,0.4)' : 'rgba(255,255,255,0.08)'}`,
                      color: i === 0 ? '#C49A3C' : '#9ca3af',
                    }}
                  >
                    Ürünü İncele →
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={reset}
          className="w-full py-3 rounded-xl font-mono text-[10px] uppercase tracking-wider text-gray-600 hover:text-gray-400 transition-colors"
          style={{ border: '1px solid rgba(255,255,255,0.04)' }}
        >
          ↩ Yeniden Dene
        </button>
      </div>
    );
  }

  return null;
}
