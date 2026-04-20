import { Header } from '@/components/Header';
import { CompareBar } from '@/components/CompareBar';
import { Footer } from '@/components/Footer';
import { MobileBottomNav } from '@/components/MobileBottomNav';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
      <CompareBar />
      <MobileBottomNav />
    </>
  );
}
