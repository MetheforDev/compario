import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getReviewsAdmin } from '@compario/database';
import { ReviewsModerationClient } from './ReviewsModerationClient';

export const dynamic = 'force-dynamic';

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const cookieStore = cookies();
  if (cookieStore.get('admin_authed')?.value !== 'true') {
    redirect('/admin-login');
  }

  const status = (searchParams.status ?? 'pending') as 'pending' | 'approved' | 'rejected';

  const reviews = await getReviewsAdmin({ status, limit: 100 }).catch(() => []);

  return <ReviewsModerationClient reviews={reviews} activeStatus={status} />;
}
