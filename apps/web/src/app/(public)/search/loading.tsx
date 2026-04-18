export default function SearchLoading() {
  return (
    <main className="min-h-screen bg-grid">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-32 pb-20 animate-pulse">
        {/* Header */}
        <div className="mb-8">
          <div className="h-2 w-12 bg-[rgba(183,36,255,0.15)] rounded mb-2" />
          <div className="h-8 w-48 bg-[rgba(0,255,247,0.1)] rounded mb-6" />
          <div className="h-11 w-full bg-[rgba(255,255,255,0.03)] rounded-lg border border-[rgba(0,255,247,0.08)]" />
          <div className="mt-4 flex flex-wrap gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-7 rounded-full bg-[rgba(0,255,247,0.04)] border border-[rgba(0,255,247,0.08)]" style={{ width: `${60 + i * 12}px` }} />
            ))}
          </div>
        </div>

        {/* Results skeleton */}
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex gap-4 p-4 rounded-xl border border-[rgba(0,255,247,0.06)] bg-[rgba(255,255,255,0.01)]">
              <div className="w-16 h-16 rounded-lg bg-[rgba(255,255,255,0.03)] flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-3/4 bg-[rgba(255,255,255,0.05)] rounded" />
                <div className="h-2 w-1/3 bg-[rgba(255,255,255,0.03)] rounded" />
                <div className="h-3 w-24 bg-[rgba(196,154,60,0.15)] rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
