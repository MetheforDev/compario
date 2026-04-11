export default function GlobalLoading() {
  return (
    <main className="min-h-screen bg-grid flex flex-col items-center justify-center px-4 text-center">
      <div className="relative">
        {/* Spinning hex */}
        <div
          className="w-16 h-16 rounded-full border-2 animate-spin"
          style={{
            borderColor: 'rgba(196,154,60,0.15)',
            borderTopColor: '#C49A3C',
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-orbitron text-sm font-black" style={{ color: '#C49A3C' }}>⬡</span>
        </div>
      </div>
      <p className="font-mono text-[10px] uppercase tracking-[0.4em] mt-6" style={{ color: 'rgba(196,154,60,0.5)' }}>
        Yükleniyor...
      </p>
    </main>
  );
}
