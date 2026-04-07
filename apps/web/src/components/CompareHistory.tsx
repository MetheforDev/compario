'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCompareHistory, clearCompareHistory, type CompareHistoryEntry } from '@/lib/compare-history';

export function CompareHistory() {
  const [history, setHistory] = useState<CompareHistoryEntry[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setHistory(getCompareHistory());
  }, []);

  if (!mounted || history.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center gap-4 mb-6">
        <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, rgba(139,155,172,0.2), transparent)' }} />
        <div className="flex items-center gap-3">
          <h2 className="font-orbitron text-[10px] uppercase tracking-[0.4em] text-neon-purple opacity-70 whitespace-nowrap">
            Son Karşılaştırmalarım
          </h2>
          <button
            onClick={() => { clearCompareHistory(); setHistory([]); }}
            className="font-mono text-[9px] text-gray-700 hover:text-gray-500 transition-colors uppercase tracking-wider"
          >
            Temizle
          </button>
        </div>
        <div className="h-px flex-1" style={{ background: 'linear-gradient(270deg, rgba(139,155,172,0.2), transparent)' }} />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        {history.map((entry, i) => (
          <Link
            key={i}
            href={`/compare?ids=${entry.ids.join(',')}`}
            className="group flex items-center gap-3 px-4 py-3 rounded-xl border transition-all hover:-translate-y-px"
            style={{
              background: '#0c0c18',
              border: '1px solid rgba(139,155,172,0.12)',
            }}
          >
            <span className="font-mono text-[9px] uppercase tracking-widest text-gray-700 flex-shrink-0">
              {new Date(entry.savedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
            </span>
            <span className="font-mono text-xs text-gray-400 group-hover:text-gray-200 transition-colors truncate max-w-[240px]">
              {entry.names.join(' vs ')}
            </span>
            <span className="font-mono text-[10px] text-neon-purple opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
