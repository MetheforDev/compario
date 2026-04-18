export default function CategoryLoading() {
  return (
    <main className="min-h-screen bg-grid pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb skeleton */}
        <div className="flex items-center gap-2 mb-8">
          {[60, 40, 80, 40, 120].map((w, i) => (
            <div key={i} className={`h-2.5 rounded animate-pulse bg-[#1a1a2a] ${i % 2 === 1 ? 'w-3' : ''}`}
              style={i % 2 === 0 ? { width: w } : {}} />
          ))}
        </div>

        {/* Header skeleton */}
        <div className="mb-10">
          <div className="h-8 w-64 rounded animate-pulse bg-[#1a1a2a] mb-3" />
          <div className="h-3 w-96 rounded animate-pulse bg-[#14141e]" />
        </div>

        {/* Sub-categories skeleton */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-7 w-24 rounded-full animate-pulse bg-[#1a1a2a]" />
          ))}
        </div>

        {/* Products grid skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="rounded-xl overflow-hidden animate-pulse" style={{ background: '#0c0c18', border: '1px solid rgba(196,154,60,0.06)' }}>
              <div className="aspect-video bg-[#12121f]" />
              <div className="p-4 space-y-2">
                <div className="h-2 w-16 rounded bg-[#1a1a2a]" />
                <div className="h-3.5 w-full rounded bg-[#1a1a2a]" />
                <div className="h-3.5 w-3/4 rounded bg-[#14141e]" />
                <div className="h-4 w-20 rounded bg-[#1a1a2a] mt-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
