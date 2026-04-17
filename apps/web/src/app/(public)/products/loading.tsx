export default function ProductsLoading() {
  return (
    <main className="min-h-screen bg-grid pb-24" style={{ paddingTop: '88px' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="py-10">
          <div className="h-3 w-48 bg-[rgba(255,255,255,0.04)] rounded animate-pulse mb-4" />
          <div className="h-8 w-40 bg-[rgba(255,255,255,0.05)] rounded animate-pulse mb-2" />
          <div className="h-3 w-64 bg-[rgba(255,255,255,0.03)] rounded animate-pulse" />
        </div>

        {/* Filter row skeleton */}
        <div className="flex gap-2 mb-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-7 w-20 bg-[rgba(196,154,60,0.05)] border border-[rgba(196,154,60,0.08)] rounded-full animate-pulse" />
          ))}
        </div>

        {/* Products grid skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl overflow-hidden"
              style={{ background: 'linear-gradient(135deg,#0f0f1a,#12121f)', border: '1px solid rgba(196,154,60,0.06)' }}
            >
              <div className="aspect-video bg-[rgba(196,154,60,0.03)] animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-2 w-16 bg-[rgba(255,255,255,0.04)] rounded animate-pulse" />
                <div className="h-4 w-full bg-[rgba(255,255,255,0.05)] rounded animate-pulse" />
                <div className="h-4 w-2/3 bg-[rgba(255,255,255,0.04)] rounded animate-pulse" />
                <div className="h-5 w-24 bg-[rgba(196,154,60,0.08)] rounded animate-pulse mt-2" />
                <div className="h-8 w-full bg-[rgba(196,154,60,0.04)] rounded-lg animate-pulse mt-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
