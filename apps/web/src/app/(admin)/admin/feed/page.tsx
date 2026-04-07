import type { Metadata } from 'next';
import { FeedPanel } from '@/components/admin/FeedPanel';

export const metadata: Metadata = { title: 'Haber Akışı' };

export default function FeedPage() {
  return <FeedPanel />;
}
