export interface SpecEntry {
  key: string;
  value: string;
  highlight?: boolean;
}

export interface SpecCategory {
  title: string;
  specs: SpecEntry[];
}

const HIGHLIGHT_KEYS = ['ram', 'storage', 'depolama', 'screen', 'ekran', 'motor', 'guc', 'güç', 'power', 'battery', 'pil', 'cpu', 'gpu', 'processor', 'işlemci'];

function isHighlightable(key: string): boolean {
  const lower = key.toLowerCase();
  return HIGHLIGHT_KEYS.some((hk) => lower.includes(hk));
}

function formatKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? '✓ Var' : '✗ Yok';
  if (Array.isArray(value)) return value.map(String).join(', ');
  return String(value);
}

export function parseSpecs(specs: unknown): SpecCategory[] {
  if (!specs || typeof specs !== 'object' || Array.isArray(specs)) return [];

  const entries = Object.entries(specs as Record<string, unknown>);
  if (entries.length === 0) return [];

  // Check if any top-level value is a non-array object → nested format
  const isNested = entries.some(
    ([, v]) => v !== null && typeof v === 'object' && !Array.isArray(v),
  );

  if (isNested) {
    const categories: SpecCategory[] = [];
    for (const [catKey, catVal] of entries) {
      if (catVal !== null && typeof catVal === 'object' && !Array.isArray(catVal)) {
        categories.push({
          title: formatKey(catKey),
          specs: Object.entries(catVal as Record<string, unknown>).map(([k, v]) => ({
            key: formatKey(k),
            value: formatValue(v),
            highlight: isHighlightable(k),
          })),
        });
      } else {
        // Mixed: flat entry inside nested structure — add to "Genel" bucket
        const general = categories.find((c) => c.title === 'Genel');
        const entry = { key: formatKey(catKey), value: formatValue(catVal), highlight: isHighlightable(catKey) };
        if (general) {
          general.specs.push(entry);
        } else {
          categories.push({ title: 'Genel', specs: [entry] });
        }
      }
    }
    return categories;
  }

  // Flat format
  return [
    {
      title: 'Teknik Özellikler',
      specs: entries.map(([k, v]) => ({
        key: formatKey(k),
        value: formatValue(v),
        highlight: isHighlightable(k),
      })),
    },
  ];
}
