import { supabase, createAdminClient } from '../client';
import type { Review, ReviewInsert, ReviewStatus } from '../types';

export interface RatingSummary {
  average: number;
  count: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

export async function getApprovedReviews(productId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .eq('status', 'approved')
    .order('helpful_count', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data ?? [];
}

export async function getRatingSummary(productId: string): Promise<RatingSummary> {
  const { data, error } = await supabase
    .from('reviews')
    .select('rating')
    .eq('product_id', productId)
    .eq('status', 'approved');

  if (error) throw error;

  const rows = data ?? [];
  const count = rows.length;
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  let sum = 0;
  for (const row of rows) {
    sum += row.rating;
    distribution[row.rating] = (distribution[row.rating] ?? 0) + 1;
  }

  return {
    average: count > 0 ? Math.round((sum / count) * 10) / 10 : 0,
    count,
    distribution: distribution as Record<1 | 2 | 3 | 4 | 5, number>,
  };
}

export async function createReview(data: {
  product_id: string;
  reviewer_name?: string | null;
  reviewer_email?: string | null;
  rating: number;
  comment: string;
}): Promise<Review> {
  const insert: ReviewInsert = {
    product_id: data.product_id,
    reviewer_name: data.reviewer_name ?? null,
    reviewer_email: data.reviewer_email ?? null,
    rating: data.rating,
    comment: data.comment,
    status: 'pending',
  };

  const { data: review, error } = await supabase
    .from('reviews')
    .insert(insert)
    .select()
    .single();

  if (error) throw error;
  return review;
}

export async function incrementHelpful(id: string): Promise<void> {
  const admin = createAdminClient();
  // Fetch current count then increment (RPC not required)
  const { data } = await admin.from('reviews').select('helpful_count').eq('id', id).single();
  const { error } = await admin
    .from('reviews')
    .update({ helpful_count: (data?.helpful_count ?? 0) + 1 })
    .eq('id', id);
  if (error) throw error;
}

// Admin queries
export async function getReviewsAdmin(filters: {
  status?: ReviewStatus;
  product_id?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<Review[]> {
  const admin = createAdminClient();
  let query = admin
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters.status) query = query.eq('status', filters.status);
  if (filters.product_id) query = query.eq('product_id', filters.product_id);
  if (filters.limit) query = query.limit(filters.limit);
  if (filters.offset) query = query.range(filters.offset, filters.offset + (filters.limit ?? 20) - 1);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function updateReviewStatus(id: string, status: ReviewStatus): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from('reviews')
    .update({ status })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteReview(id: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from('reviews').delete().eq('id', id);
  if (error) throw error;
}
