import { supabase, createAdminClient } from '../client';
import type {
  Category,
  CategoryInput,
  CategoryInsert,
  CategoryUpdate,
} from '../types';

export async function getCategories(activeOnly = true): Promise<Category[]> {
  let query = supabase.from('categories').select('*').order('name', { ascending: true });

  if (activeOnly) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Failed to fetch categories: ${error.message}`);
  return (data ?? []) as Category[];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to fetch category: ${error.message}`);
  }
  return data as Category;
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to fetch category: ${error.message}`);
  }
  return data as Category;
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('categories')
    .insert(input as CategoryInsert)
    .select()
    .single();

  if (error) throw new Error(`Failed to create category: ${error.message}`);
  return data as Category;
}

export async function updateCategory(id: string, input: Partial<CategoryInput>): Promise<Category> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('categories')
    .update(input as CategoryUpdate)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update category: ${error.message}`);
  return data as Category;
}

export async function deleteCategory(id: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from('categories').delete().eq('id', id);
  if (error) throw new Error(`Failed to delete category: ${error.message}`);
}
