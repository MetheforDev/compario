import type { Metadata } from 'next';
import { getTopLevelCategories } from '@compario/database';
import { RecommendWizard } from '@/components/RecommendWizard';

export const metadata: Metadata = {
  title: 'Bana Göre En İyisi — AI Öneri',
  description: 'Kullanım alışkanlıklarına ve bütçene göre en uygun ürünü AI ile bul.',
  openGraph: {
    title: 'Bana Göre En İyisi | Compario',
    description: 'AI destekli kişisel ürün önerisi',
  },
};

export const revalidate = 3600;

export default async function RecommendPage() {
  const categories = await getTopLevelCategories(true).catch(() => []);

  return (
    <main className="min-h-screen bg-grid pb-24" style={{ paddingTop: '88px' }}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">

        {/* Hero */}
        <div className="text-center mb-12">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-mono text-[9px] uppercase tracking-[0.3em] mb-6"
            style={{ background: 'rgba(196,154,60,0.08)', border: '1px solid rgba(196,154,60,0.2)', color: '#C49A3C' }}
          >
            ◆ AI Destekli Öneri
          </div>
          <h1 className="font-orbitron text-3xl sm:text-4xl font-black text-white mb-4 leading-tight">
            Bana Göre<br />
            <span style={{ color: '#C49A3C' }}>En İyisi</span>
          </h1>
          <p className="font-mono text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
            3 soruyu yanıtla, yapay zeka bütçen ve kullanım alışkanlıklarına göre en uygun ürünü seçsin.
          </p>
        </div>

        <RecommendWizard categories={categories} />
      </div>
    </main>
  );
}
