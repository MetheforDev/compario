export default function ProductLoading() {
  return (
    <main className="min-h-screen bg-grid">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-28 pb-20 animate-pulse">
        {/* Breadcrumb */}
        <div className="flex gap-2 mb-8">
          <div className="h-3 w-16 bg-[rgba(255,255,255,0.04)] rounded" />
          <div className="h-3 w-3 bg-[rgba(255,255,255,0.04)] rounded" />
          <div className="h-3 w-24 bg-[rgba(255,255,255,0.04)] rounded" />
          <div className="h-3 w-3 bg-[rgba(255,255,255,0.04)] rounded" />
          <div className="h-3 w-32 bg-[rgba(255,255,255,0.04)] rounded" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
          {/* Image */}
          <div className="rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(0,255,247,0.06)]" style={{ aspectRatio: '4/3' }} />

          {/* Info */}
          <div className="space-y-4">
            <div className="h-3 w-20 bg-[rgba(196,154,60,0.15)] rounded" />
            <div className="h-8 w-3/4 bg-[rgba(255,255,255,0.06)] rounded" />
            <div className="h-5 w-1/3 bg-[rgba(196,154,60,0.2)] rounded" />
            <div className="space-y-2 mt-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-3 bg-[rgba(255,255,255,0.03)] rounded" style={{ width: `${70 + (i % 3) * 10}%` }} />
              ))}
            </div>
            <div className="flex gap-3 mt-8">
              <div className="h-9 w-32 bg-[rgba(0,255,247,0.06)] rounded-lg border border-[rgba(0,255,247,0.1)]" />
              <div className="h-9 w-32 bg-[rgba(196,154,60,0.06)] rounded-lg border border-[rgba(196,154,60,0.1)]" />
            </div>
          </div>
        </div>

        {/* Specs skeleton */}
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-xl border border-[rgba(0,255,247,0.06)] overflow-hidden">
              <div className="px-6 py-4 bg-[rgba(255,255,255,0.02)]">
                <div className="h-3 w-40 bg-[rgba(0,255,247,0.1)] rounded" />
              </div>
              <div className="px-6 py-4 space-y-3">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="flex justify-between">
                    <div className="h-3 w-28 bg-[rgba(255,255,255,0.03)] rounded" />
                    <div className="h-3 w-36 bg-[rgba(255,255,255,0.05)] rounded" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
