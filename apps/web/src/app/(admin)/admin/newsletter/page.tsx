import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getNewsletterSubscribers, getSubscriberCount } from '@compario/database';
import { NewsletterAdminClient } from './NewsletterAdminClient';

export const dynamic = 'force-dynamic';

export default async function AdminNewsletterPage() {
  const cookieStore = cookies();
  if (cookieStore.get('admin_authed')?.value !== 'true') {
    redirect('/admin-login');
  }

  const [subscribers, counts] = await Promise.all([
    getNewsletterSubscribers().catch(() => []),
    getSubscriberCount().catch(() => ({ active: 0, total: 0 })),
  ]);

  return <NewsletterAdminClient subscribers={subscribers} counts={counts} />;
}
