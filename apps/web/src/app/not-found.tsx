import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-grid flex flex-col items-center justify-center px-4 text-center relative overflow-hidden">
      {/* Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(0,255,247,0.04) 0%, transparent 70%)', filter: 'blur(60px)' }}
      />

      <div className="relative z-10 max-w-lg">
        {/* Error code */}
        <p className="font-orbitron text-[120px] sm:text-[160px] font-black text-neon-cyan text-glow-cyan leading-none select-none">
          404
        </p>

        <div className="h-px bg-gradient-to-r from-transparent via-neon-cyan/30 to-transparent my-6" />

        <p className="font-mono text-[10px] text-neon-purple uppercase tracking-[0.4em] mb-3">
          Sayfa Bulunamadı
        </p>
        <h1 className="font-orbitron text-xl font-black text-white mb-4">
          Bu Sayfa Mevcut Değil
        </h1>
        <p className="font-mono text-sm text-gray-500 mb-10 leading-relaxed">
          Aradığınız sayfa taşınmış, silinmiş ya da hiç var olmamış olabilir.
        </p>

        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/" className="btn-neon">
            Ana Sayfaya Dön
          </Link>
          <Link href="/news" className="btn-neon-purple">
            Haberlere Git
          </Link>
          <Link href="/categories" className="px-4 py-2 border border-[rgba(0,255,247,0.15)] rounded font-mono text-xs text-gray-500 hover:text-gray-300 transition-colors">
            Kategoriler →
          </Link>
        </div>
      </div>
    </main>
  );
}
