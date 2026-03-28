export default function CategoriesLoading() {
  return (
    <main className="min-h-screen bg-grid pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="mb-10">
          <div className="h-3 w-24 bg-[rgba(0,255,247,0.08)] rounded animate-pulse mb-3" />
          <div className="h-8 w-48 bg-[rgba(255,255,255,0.05)] rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-[rgba(0,255,247,0.06)] bg-[rgba(255,255,255,0.02)] p-6 space-y-3">
              <div className="w-10 h-10 bg-[rgba(0,255,247,0.06)] rounded animate-pulse" />
              <div className="h-4 w-24 bg-[rgba(255,255,255,0.05)] rounded animate-pulse" />
              <div className="h-3 w-full bg-[rgba(255,255,255,0.03)] rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
