import { Header } from '@/components/Header';
import { CompareBar } from '@/components/CompareBar';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <CompareBar />
    </>
  );
}
