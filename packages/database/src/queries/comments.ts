import { supabase, createAdminClient } from '../client';

export interface Comment {
  id: string;
  entity_type: string;
  entity_id: string;
  user_id: string | null;
  author_name: string | null;
  author_email: string | null;
  content: string;
  helpful_count: number;
  status: string;
  created_at: string;
}

export type CommentStatus = 'pending' | 'approved' | 'rejected';

export async function getComments(entityType: string, entityId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .eq('status', 'approved')
    .order('helpful_count', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) throw error;
  return data ?? [];
}

export async function getCommentCount(entityType: string, entityId: string): Promise<number> {
  const { count, error } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .eq('status', 'approved');

  if (error) throw error;
  return count ?? 0;
}

export async function getUserCommentCount(userId: string): Promise<number> {
  const admin = createAdminClient();
  const { count, error } = await admin
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'approved');

  if (error) throw error;
  return count ?? 0;
}

export async function getUserComments(userId: string): Promise<(Comment & { product_name?: string; product_slug?: string })[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('comments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;

  const comments = data ?? [];
  const productIds = comments.filter(c => c.entity_type === 'product').map(c => c.entity_id);

  if (!productIds.length) return comments;

  const { data: products } = await admin
    .from('products')
    .select('id, name, slug')
    .in('id', productIds);

  const productMap = new Map((products ?? []).map(p => [p.id, p]));
  return comments.map(c => ({
    ...c,
    product_name: productMap.get(c.entity_id)?.name,
    product_slug: productMap.get(c.entity_id)?.slug,
  }));
}

export async function createComment(data: {
  entity_type: string;
  entity_id: string;
  user_id?: string | null;
  author_name?: string | null;
  author_email?: string | null;
  content: string;
}): Promise<Comment> {
  const { data: comment, error } = await supabase
    .from('comments')
    .insert({
      entity_type: data.entity_type,
      entity_id: data.entity_id,
      user_id: data.user_id ?? null,
      author_name: data.author_name ?? null,
      author_email: data.author_email ?? null,
      content: data.content,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return comment;
}

export async function incrementCommentHelpful(id: string): Promise<number> {
  const admin = createAdminClient();
  const { data } = await admin.from('comments').select('helpful_count, status').eq('id', id).single();
  if (!data || data.status !== 'approved') throw new Error('Yorum bulunamadı');

  const newCount = data.helpful_count + 1;
  const { error } = await admin.from('comments').update({ helpful_count: newCount }).eq('id', id);
  if (error) throw error;
  return newCount;
}

export async function getCommentsAdmin(filters: {
  status?: CommentStatus;
  entity_type?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<Comment[]> {
  const admin = createAdminClient();
  let query = admin
    .from('comments')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters.status) query = query.eq('status', filters.status);
  if (filters.entity_type) query = query.eq('entity_type', filters.entity_type);
  if (filters.limit) query = query.limit(filters.limit);
  if (filters.offset) query = query.range(filters.offset, filters.offset + (filters.limit ?? 20) - 1);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function updateCommentStatus(id: string, status: CommentStatus): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from('comments').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function deleteComment(id: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from('comments').delete().eq('id', id);
  if (error) throw error;
}
