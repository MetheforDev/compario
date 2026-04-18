export default function NewsArticleLoading() {
  return (
    <main className="min-h-screen bg-grid">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-20 animate-pulse">
        {/* Breadcrumb */}
        <div className="flex gap-2 mb-8">
          <div className="h-3 w-16 bg-[rgba(255,255,255,0.04)] rounded" />
          <div className="h-3 w-3 bg-[rgba(255,255,255,0.04)] rounded" />
          <div className="h-3 w-20 bg-[rgba(255,255,255,0.04)] rounded" />
        </div>

        {/* Category badge */}
        <div className="h-5 w-24 bg-[rgba(183,36,255,0.1)] rounded-full mb-4" />

        {/* Title */}
        <div className="space-y-2 mb-6">
          <div className="h-8 w-full bg-[rgba(255,255,255,0.06)] rounded" />
          <div className="h-8 w-4/5 bg-[rgba(255,255,255,0.06)] rounded" />
        </div>

        {/* Meta */}
        <div className="flex gap-4 mb-8">
          <div className="h-3 w-24 bg-[rgba(255,255,255,0.03)] rounded" />
          <div className="h-3 w-32 bg-[rgba(255,255,255,0.03)] rounded" />
        </div>

        {/* Cover image */}
        <div className="w-full rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(183,36,255,0.08)] mb-10" style={{ aspectRatio: '16/9' }} />

        {/* Article body */}
        <div className="space-y-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-full bg-[rgba(255,255,255,0.04)] rounded" />
              <div className="h-3 bg-[rgba(255,255,255,0.04)] rounded" style={{ width: `${75 + (i % 4) * 6}%` }} />
              {i % 3 === 2 && <div className="h-3 w-1/2 bg-[rgba(255,255,255,0.04)] rounded" />}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
