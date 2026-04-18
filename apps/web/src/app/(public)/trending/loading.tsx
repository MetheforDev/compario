export default function TrendingLoading() {
  return (
    <main className="min-h-screen bg-grid pb-24" style={{ paddingTop: '88px' }}>
      <section className="px-4 pt-16 pb-12 text-center animate-pulse">
        <div className="h-3 w-20 mx-auto bg-[rgba(196,154,60,0.15)] rounded mb-4" />
        <div className="h-10 w-32 mx-auto bg-[rgba(196,154,60,0.12)] rounded mb-3" />
        <div className="h-3 w-64 mx-auto bg-[rgba(255,255,255,0.03)] rounded" />
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {[0, 1].map((col) => (
            <section key={col}>
              <div className="flex items-center gap-3 mb-5">
                <div className="h-px flex-1 bg-[rgba(196,154,60,0.1)]" />
                <div className="h-3 w-36 bg-[rgba(196,154,60,0.12)] rounded" />
                <div className="h-px flex-1 bg-[rgba(196,154,60,0.1)]" />
              </div>
              <div className="space-y-3">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-4 rounded-xl border border-[rgba(196,154,60,0.06)] bg-[#0c0c18]">
                    <div className="w-9 h-6 bg-[rgba(196,154,60,0.08)] rounded" />
                    <div className="w-16 h-12 bg-[rgba(255,255,255,0.03)] rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="h-2 w-16 bg-[rgba(255,255,255,0.03)] rounded" />
                      <div className="h-3 w-4/5 bg-[rgba(255,255,255,0.05)] rounded" />
                    </div>
                    <div className="h-6 w-12 bg-[rgba(196,154,60,0.08)] rounded" />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
