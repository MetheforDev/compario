export default function NewsLoading() {
  return (
    <main className="min-h-screen bg-grid pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        {/* Header skeleton */}
        <div className="mb-12">
          <div className="h-3 w-32 bg-[rgba(0,255,247,0.08)] rounded animate-pulse mb-4" />
          <div className="h-8 w-64 bg-[rgba(255,255,255,0.05)] rounded animate-pulse mb-3" />
          <div className="h-3 w-80 bg-[rgba(255,255,255,0.03)] rounded animate-pulse" />
        </div>

        {/* Cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="rounded-xl overflow-hidden border border-[rgba(0,255,247,0.06)] bg-[rgba(255,255,255,0.02)]">
              <div className="aspect-video bg-[rgba(0,255,247,0.04)] animate-pulse" />
              <div className="p-5 space-y-3">
                <div className="h-3 w-20 bg-[rgba(0,255,247,0.08)] rounded animate-pulse" />
                <div className="h-5 w-full bg-[rgba(255,255,255,0.05)] rounded animate-pulse" />
                <div className="h-5 w-3/4 bg-[rgba(255,255,255,0.04)] rounded animate-pulse" />
                <div className="h-3 w-full bg-[rgba(255,255,255,0.03)] rounded animate-pulse" />
                <div className="h-3 w-2/3 bg-[rgba(255,255,255,0.02)] rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
