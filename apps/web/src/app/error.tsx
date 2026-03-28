'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen bg-grid flex flex-col items-center justify-center px-4 text-center relative overflow-hidden">
      {/* Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(255,0,110,0.04) 0%, transparent 70%)', filter: 'blur(60px)' }}
      />

      <div className="relative z-10 max-w-lg">
        <p className="font-orbitron text-[120px] sm:text-[160px] font-black text-neon-pink leading-none select-none"
          style={{ textShadow: '0 0 40px rgba(255,0,110,0.4)' }}>
          500
        </p>

        <div className="h-px bg-gradient-to-r from-transparent via-neon-pink/30 to-transparent my-6" />

        <p className="font-mono text-[10px] text-neon-pink uppercase tracking-[0.4em] mb-3">
          Sistem Hatası
        </p>
        <h1 className="font-orbitron text-xl font-black text-white mb-4">
          Beklenmeyen Bir Hata Oluştu
        </h1>
        <p className="font-mono text-sm text-gray-500 mb-10 leading-relaxed">
          Sunucuda bir hata meydana geldi. Sayfayı yenilemeyi deneyin.
        </p>

        {error.digest && (
          <p className="font-mono text-[10px] text-gray-700 mb-6 border border-[rgba(255,0,110,0.1)] rounded px-3 py-2">
            Hata kodu: {error.digest}
          </p>
        )}

        <div className="flex flex-wrap gap-3 justify-center">
          <button onClick={() => reset()} className="btn-neon">
            Tekrar Dene
          </button>
          <Link href="/" className="btn-neon-purple">
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </main>
  );
}
