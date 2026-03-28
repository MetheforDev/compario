import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Compario — Linkler',
  description: 'Compario — Her Şeyi Karşılaştır, En İyisine Karar Ver',
};

export default function LinksLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
