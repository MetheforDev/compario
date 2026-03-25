import { supabase, createAdminClient } from '../client';
import type {
  Segment,
  SegmentInput,
  SegmentInsert,
  SegmentUpdate,
} from '../types';

export async function getSegmentsByCategory(categoryId: string): Promise<Segment[]> {
  const { data, error } = await supabase
    .from('segments')
    .select('*')
    .eq('category_id', categoryId)
    .eq('is_active', true)
    .order('price_min', { ascending: true });

  if (error) throw new Error(`Failed to fetch segments: ${error.message}`);
  return (data ?? []) as Segment[];
}

export async function getAllSegments(activeOnly = false): Promise<Segment[]> {
  let query = supabase.from('segments').select('*').order('name', { ascending: true });

  if (activeOnly) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Failed to fetch segments: ${error.message}`);
  return (data ?? []) as Segment[];
}

export async function getSegmentBySlug(categorySlug: string, segmentSlug: string): Promise<Segment | null> {
  const { data: category, error: catError } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', categorySlug)
    .single();

  if (catError) {
    if (catError.code === 'PGRST116') return null;
    throw new Error(`Failed to fetch category: ${catError.message}`);
  }

  const { data, error } = await supabase
    .from('segments')
    .select('*')
    .eq('category_id', category.id)
    .eq('slug', segmentSlug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to fetch segment: ${error.message}`);
  }
  return data as Segment;
}

export async function createSegment(input: SegmentInput): Promise<Segment> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('segments')
    .insert(input as SegmentInsert)
    .select()
    .single();

  if (error) throw new Error(`Failed to create segment: ${error.message}`);
  return data as Segment;
}

export async function updateSegment(id: string, input: Partial<SegmentInput>): Promise<Segment> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('segments')
    .update(input as SegmentUpdate)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update segment: ${error.message}`);
  return data as Segment;
}

export async function deleteSegment(id: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from('segments').delete().eq('id', id);
  if (error) throw new Error(`Failed to delete segment: ${error.message}`);
}
