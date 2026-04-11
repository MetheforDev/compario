'use client';

interface ContentStatsProps {
  content: string;
}

function stripMarkdown(md: string) {
  return md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]+`/g, ' ')
    .replace(/#{1,6}\s/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/[*_~>|]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function computeStats(content: string) {
  const plain = stripMarkdown(content);
  const words = plain === '' ? 0 : plain.split(/\s+/).length;
  const chars = content.length;
  const readingMin = Math.max(1, Math.round(words / 200));
  const paragraphs = content.split(/\n\n+/).filter((p) => p.trim()).length;
  const h2 = (content.match(/^## /gm) ?? []).length;
  const h3 = (content.match(/^### /gm) ?? []).length;
  const images = (content.match(/!\[/g) ?? []).length;

  let lengthLabel: string;
  let lengthColor: string;
  if (words === 0) { lengthLabel = 'Boş'; lengthColor = '#4b5563'; }
  else if (words < 300) { lengthLabel = 'Çok kısa'; lengthColor = '#ef4444'; }
  else if (words < 600) { lengthLabel = 'Kısa'; lengthColor = '#C49A3C'; }
  else if (words < 1000) { lengthLabel = 'İyi'; lengthColor = '#10B981'; }
  else { lengthLabel = 'Uzun form'; lengthColor = '#00fff7'; }

  return { words, chars, readingMin, paragraphs, h2, h3, images, lengthLabel, lengthColor };
}

export function ContentStats({ content }: ContentStatsProps) {
  const s = computeStats(content);

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 px-3 py-2.5 rounded-lg bg-[#0a0a18] border border-[rgba(0,255,247,0.08)]">
      {/* Words */}
      <div className="flex items-center gap-1.5">
        <span className="font-mono text-[10px] text-gray-600 uppercase tracking-wider">Kelime</span>
        <span className="font-mono text-[11px] font-bold" style={{ color: s.lengthColor }}>{s.words}</span>
        <span className="font-mono text-[9px] px-1.5 py-0.5 rounded" style={{ background: s.lengthColor + '18', color: s.lengthColor }}>{s.lengthLabel}</span>
      </div>

      <div className="w-px h-3 bg-white/5" />

      {/* Reading time */}
      <div className="flex items-center gap-1.5">
        <span className="font-mono text-[10px] text-gray-600 uppercase tracking-wider">Okuma</span>
        <span className="font-mono text-[11px] text-gray-400">{s.readingMin} dk</span>
      </div>

      <div className="w-px h-3 bg-white/5" />

      {/* Chars */}
      <div className="flex items-center gap-1.5">
        <span className="font-mono text-[10px] text-gray-600 uppercase tracking-wider">Karakter</span>
        <span className="font-mono text-[11px] text-gray-400">{s.chars}</span>
      </div>

      <div className="w-px h-3 bg-white/5" />

      {/* Structure */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] text-gray-600 uppercase tracking-wider">Yapı</span>
        <span className="font-mono text-[10px] text-gray-500">
          {s.paragraphs}§
          {s.h2 > 0 && <span className="ml-1 text-neon-cyan">{s.h2}×H2</span>}
          {s.h3 > 0 && <span className="ml-1 text-neon-purple">{s.h3}×H3</span>}
          {s.images > 0 && <span className="ml-1 text-[#C49A3C]">{s.images}×IMG</span>}
        </span>
      </div>

      {/* Progress bar for content length */}
      <div className="ml-auto flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-24 h-1.5 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, (s.words / 1000) * 100)}%`,
                background: s.lengthColor,
                boxShadow: `0 0 6px ${s.lengthColor}88`,
              }}
            />
          </div>
          <span className="font-mono text-[9px] text-gray-600">/1000</span>
        </div>
      </div>
    </div>
  );
}
