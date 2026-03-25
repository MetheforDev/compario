import Link from 'next/link';

type NeonColor = 'cyan' | 'purple' | 'green' | 'pink';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  href: string;
  color?: NeonColor;
}

const colors: Record<NeonColor, { top: string; text: string; shadow: string }> = {
  cyan:   { top: 'bg-neon-cyan',   text: 'text-neon-cyan',   shadow: 'hover:shadow-neon-cyan' },
  purple: { top: 'bg-neon-purple', text: 'text-neon-purple', shadow: 'hover:shadow-neon-purple' },
  green:  { top: 'bg-neon-green',  text: 'text-neon-green',  shadow: 'hover:shadow-neon-green' },
  pink:   { top: 'bg-neon-pink',   text: 'text-neon-pink',   shadow: 'hover:shadow-neon-pink' },
};

export function StatCard({ label, value, icon, href, color = 'cyan' }: StatCardProps) {
  const c = colors[color];

  return (
    <Link
      href={href}
      className={`card-neon p-6 group relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 ${c.shadow}`}
    >
      {/* Top color bar */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] ${c.top} opacity-60 group-hover:opacity-100 transition-opacity`} />

      <div className="flex items-start justify-between mb-4">
        <span className="text-2xl">{icon}</span>
        <span className={`font-mono text-xs uppercase tracking-widest ${c.text} opacity-40 group-hover:opacity-70 transition-opacity`}>
          MANAGE →
        </span>
      </div>

      <p className="font-mono text-xs text-gray-500 uppercase tracking-widest mb-1">{label}</p>
      <p className={`font-orbitron text-4xl font-black ${c.text}`}>{value}</p>
    </Link>
  );
}
