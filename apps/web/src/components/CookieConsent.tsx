'use client';

import { useState, useEffect } from 'react';

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('cookie-consent');
      if (!consent) setShow(true);
    } catch { /* private browsing */ }
  }, []);

  const handleAccept = () => {
    try { localStorage.setItem('cookie-consent', 'accepted'); } catch { /* */ }
    setShow(false);
  };

  const handleDecline = () => {
    try { localStorage.setItem('cookie-consent', 'declined'); } catch { /* */ }
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[60] px-4 pb-4 sm:pb-5"
      style={{ pointerEvents: 'none' }}
    >
      <div
        className="max-w-2xl mx-auto rounded-2xl px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3"
        style={{
          background: 'rgba(10,10,16,0.97)',
          border: '1px solid rgba(196,154,60,0.2)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
          pointerEvents: 'auto',
        }}
      >
        {/* Top accent */}
        <div
          className="absolute top-0 left-8 right-8 h-px rounded-full"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(196,154,60,0.4), transparent)' }}
        />

        <div className="flex-1 min-w-0">
          <p className="font-mono text-xs text-gray-400 leading-relaxed">
            <span style={{ color: '#C49A3C' }}>🍪</span>{' '}
            Daha iyi deneyim için analitik çerezler kullanıyoruz.
            Google Analytics aracılığıyla anonim kullanım verisi topluyoruz.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleDecline}
            className="font-mono text-[10px] uppercase tracking-wider px-3 py-2 rounded-lg transition-all"
            style={{
              color: '#6b7280',
              border: '1px solid rgba(107,114,128,0.2)',
              background: 'transparent',
            }}
          >
            Reddet
          </button>
          <button
            onClick={handleAccept}
            className="font-mono text-[10px] uppercase tracking-wider px-4 py-2 rounded-lg transition-all"
            style={{
              color: '#C49A3C',
              border: '1px solid rgba(196,154,60,0.4)',
              background: 'rgba(196,154,60,0.1)',
            }}
          >
            Kabul Et
          </button>
        </div>
      </div>
    </div>
  );
}
