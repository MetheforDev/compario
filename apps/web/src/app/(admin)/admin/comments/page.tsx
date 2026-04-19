import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getCommentsAdmin } from '@compario/database';
import { CommentsModerationClient } from './CommentsModerationClient';

export const dynamic = 'force-dynamic';

export default async function AdminCommentsPage({
  searchParams,
}: {
  searchParams: { status?: string; type?: string };
}) {
  const cookieStore = cookies();
  if (cookieStore.get('admin_authed')?.value !== 'true') redirect('/admin-login');

  const status = (searchParams.status ?? 'pending') as 'pending' | 'approved' | 'rejected';
  const entityType = searchParams.type;

  const comments = await getCommentsAdmin({ status, entity_type: entityType, limit: 100 }).catch(() => []);

  return <CommentsModerationClient comments={comments} activeStatus={status} activeType={entityType} />;
}
