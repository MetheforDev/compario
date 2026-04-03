import { parseSpecs } from '@/lib/specsParser';

interface SpecsTableProps {
  specs: unknown;
}

export default function SpecsTable({ specs }: SpecsTableProps) {
  const categories = parseSpecs(specs);

  if (categories.length === 0) {
    return (
      <div className="text-center py-10 font-mono text-xs text-gray-600 uppercase tracking-widest">
        [ Teknik özellik bilgisi bulunmuyor ]
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {categories.map((category, idx) => (
        <div key={idx}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1 h-5 rounded-full" style={{ background: 'rgba(196,154,60,0.7)' }} />
            <h3 className="font-orbitron text-sm font-bold text-neon-cyan uppercase tracking-wider">
              {category.title}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {category.specs.map((spec, si) => (
              <div
                key={si}
                className="flex gap-4 px-4 py-3 rounded-lg"
                style={{
                  background: spec.highlight ? 'rgba(196,154,60,0.05)' : 'rgba(255,255,255,0.02)',
                  border: spec.highlight
                    ? '1px solid rgba(196,154,60,0.2)'
                    : '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <dt className="font-mono text-[11px] text-gray-500 uppercase tracking-wide w-32 flex-shrink-0 pt-0.5">
                  {spec.key}
                </dt>
                <dd className="font-mono text-[11px] text-gray-200 flex-1 leading-relaxed">
                  {spec.value}
                </dd>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
