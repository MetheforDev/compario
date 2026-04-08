'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

interface AICompareButtonProps {
  productIds: string[];
  productNames: string[];
}

type Status = 'idle' | 'loading' | 'done' | 'error';

export function AICompareButton({ productIds, productNames }: AICompareButtonProps) {
  const [status, setStatus] = useState<Status>('idle');
  const [analysis, setAnalysis] = useState('');
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  // Lock body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const handleClick = async () => {
    if (status === 'done') { setOpen(true); return; }

    setStatus('loading');
    setOpen(true);
    setError('');

    try {
      const res = await fetch('/api/ai/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? 'AI analizi başarısız');
      }

      setAnalysis(data.analysis);
      setStatus('done');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Bilinmeyen hata');
      setStatus('error');
    }
  };

  const handleRetry = () => {
    setStatus('idle');
    setAnalysis('');
    handleClick();
  };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={handleClick}
        disabled={status === 'loading'}
        className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        style={{
          background: 'linear-gradient(135deg, rgba(183,36,255,0.12) 0%, rgba(0,255,247,0.06) 100%)',
          border: '1px solid rgba(183,36,255,0.35)',
          color: status === 'loading' ? '#9ca3af' : '#b724ff',
          boxShadow: status === 'loading' ? 'none' : '0 0 20px rgba(183,36,255,0.12)',
        }}
        onMouseEnter={(e) => {
          if (status !== 'loading') {
            (e.currentTarget as HTMLElement).style.boxShadow = '0 0 30px rgba(183,36,255,0.25)';
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(183,36,255,0.6)';
          }
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px rgba(183,36,255,0.12)';
          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(183,36,255,0.35)';
        }}
      >
        {status === 'loading' ? (
          <>
            <span className="inline-block w-3.5 h-3.5 border-2 border-neon-purple/30 border-t-neon-purple rounded-full animate-spin" />
            <span>Analiz yapılıyor...</span>
          </>
        ) : (
          <>
            <span className="text-base leading-none">🤖</span>
            <span>AI Asistanından Öneri Al</span>
            {status === 'done' && <span className="text-neon-cyan">✓</span>}
          </>
        )}
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div
            className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(160deg, #0a0a18 0%, #0d0d1e 100%)',
              border: '1px solid rgba(183,36,255,0.25)',
              boxShadow: '0 0 60px rgba(183,36,255,0.15), 0 0 120px rgba(0,0,0,0.6)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-4 flex-shrink-0"
              style={{ borderBottom: '1px solid rgba(183,36,255,0.12)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
                  style={{ background: 'rgba(183,36,255,0.15)', border: '1px solid rgba(183,36,255,0.3)' }}
                >
                  🤖
                </div>
                <div>
                  <p className="font-orbitron text-xs font-black text-neon-purple uppercase tracking-widest">
                    AI Karşılaştırma Asistanı
                  </p>
                  <p className="font-mono text-[10px] text-gray-600 mt-0.5">
                    {productNames.join(' vs ')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg font-mono text-gray-600 hover:text-gray-300 transition-colors"
                style={{ background: 'rgba(255,255,255,0.04)' }}
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {status === 'loading' && (
                <div className="flex flex-col items-center justify-center py-16 gap-6">
                  {/* Animated rings */}
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-2 border-neon-purple/20 animate-ping" />
                    <div className="absolute inset-2 rounded-full border-2 border-neon-purple/40 animate-pulse" />
                    <div className="absolute inset-0 flex items-center justify-center text-2xl">🤖</div>
                  </div>
                  <div className="text-center">
                    <p className="font-orbitron text-sm text-neon-purple animate-pulse">Analiz yapılıyor</p>
                    <p className="font-mono text-[11px] text-gray-600 mt-1">
                      Claude AI ürünleri karşılaştırıyor...
                    </p>
                  </div>
                  <div className="flex gap-1.5 mt-2">
                    {['Özellikler okunuyor', 'Fiyat analizi', 'Öneri hazırlanıyor'].map((step, i) => (
                      <span
                        key={step}
                        className="font-mono text-[9px] px-2 py-1 rounded"
                        style={{
                          background: 'rgba(183,36,255,0.08)',
                          color: 'rgba(183,36,255,0.5)',
                          border: '1px solid rgba(183,36,255,0.15)',
                          animationDelay: `${i * 0.5}s`,
                        }}
                      >
                        {step}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {status === 'error' && (
                <div className="py-12 flex flex-col items-center gap-4 text-center">
                  <span className="text-3xl">⚠</span>
                  <div>
                    <p className="font-mono text-sm text-red-400">{error}</p>
                    <p className="font-mono text-[11px] text-gray-600 mt-1">
                      ANTHROPIC_API_KEY ayarlandı mı?
                    </p>
                  </div>
                  <button
                    onClick={handleRetry}
                    className="px-4 py-2 rounded-lg border font-mono text-xs text-neon-purple hover:bg-neon-purple/10 transition-colors"
                    style={{ borderColor: 'rgba(183,36,255,0.3)' }}
                  >
                    Tekrar Dene
                  </button>
                </div>
              )}

              {status === 'done' && analysis && (
                <div
                  className="prose prose-invert max-w-none"
                  style={{
                    '--tw-prose-headings': '#00fff7',
                    '--tw-prose-bold': '#e5e7eb',
                    '--tw-prose-bullets': 'rgba(183,36,255,0.6)',
                  } as React.CSSProperties}
                >
                  <ReactMarkdown
                    components={{
                      h2: ({ children }) => (
                        <h2 className="font-orbitron text-sm font-black text-neon-cyan uppercase tracking-wider mt-6 mb-3 pb-2"
                          style={{ borderBottom: '1px solid rgba(0,255,247,0.1)' }}>
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="font-orbitron text-xs font-bold text-neon-purple uppercase tracking-wider mt-4 mb-2">
                          {children}
                        </h3>
                      ),
                      p: ({ children }) => (
                        <p className="font-mono text-xs text-gray-400 leading-relaxed mb-3">{children}</p>
                      ),
                      ul: ({ children }) => (
                        <ul className="space-y-1.5 mb-3 pl-4">{children}</ul>
                      ),
                      li: ({ children }) => (
                        <li className="font-mono text-xs text-gray-400 leading-relaxed list-none flex items-start gap-2">
                          <span className="text-neon-purple flex-shrink-0 mt-0.5">◈</span>
                          <span>{children}</span>
                        </li>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-bold text-gray-200">{children}</strong>
                      ),
                    }}
                  >
                    {analysis}
                  </ReactMarkdown>
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-between px-6 py-3 flex-shrink-0"
              style={{ borderTop: '1px solid rgba(183,36,255,0.08)', background: 'rgba(0,0,0,0.2)' }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                  style={{ background: 'rgba(183,36,255,0.08)', border: '1px solid rgba(183,36,255,0.15)' }}
                >
                  <span className="font-mono text-[9px] text-neon-purple uppercase tracking-wider">
                    Powered by
                  </span>
                  <span className="font-orbitron text-[9px] font-black text-neon-purple">Claude AI</span>
                </div>
                {status === 'done' && (
                  <span className="font-mono text-[9px] text-gray-700">claude-sonnet-4-6</span>
                )}
              </div>
              {status === 'done' && (
                <button
                  onClick={handleRetry}
                  className="font-mono text-[10px] text-gray-600 hover:text-gray-400 transition-colors uppercase tracking-wider"
                >
                  ↺ Yenile
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
