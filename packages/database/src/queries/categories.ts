import { supabase, createAdminClient } from '../client';
import type {
  Category,
  CategoryInput,
  CategoryInsert,
  CategoryUpdate,
} from '../types';

export type CategoryWithChildren = Category & { children: CategoryWithChildren[] };

export async function getCategories(activeOnly = true): Promise<Category[]> {
  let query = supabase.from('categories').select('*').order('display_order', { ascending: true }).order('name', { ascending: true });
  if (activeOnly) query = query.eq('is_active', true);
  const { data, error } = await query;
  if (error) throw new Error(`Failed to fetch categories: ${error.message}`);
  return (data ?? []) as Category[];
}

/** Sadece üst düzey kategoriler (parent_id IS NULL) */
export async function getTopLevelCategories(activeOnly = true): Promise<Category[]> {
  let query = supabase.from('categories').select('*').is('parent_id', null)
    .order('display_order', { ascending: true }).order('name', { ascending: true });
  if (activeOnly) query = query.eq('is_active', true);
  const { data, error } = await query;
  if (error) throw new Error(`Failed to fetch top-level categories: ${error.message}`);
  return (data ?? []) as Category[];
}

/** Bir kategorinin alt kategorileri */
export async function getSubCategories(parentId: string, activeOnly = true): Promise<Category[]> {
  let query = supabase.from('categories').select('*').eq('parent_id', parentId)
    .order('display_order', { ascending: true }).order('name', { ascending: true });
  if (activeOnly) query = query.eq('is_active', true);
  const { data, error } = await query;
  if (error) throw new Error(`Failed to fetch sub-categories: ${error.message}`);
  return (data ?? []) as Category[];
}

/** Tam ağaç: tüm kategorileri çekip client-side tree yap */
export async function getCategoryTree(activeOnly = true): Promise<CategoryWithChildren[]> {
  const all = await getCategories(activeOnly);
  const map = new Map<string, CategoryWithChildren>();
  all.forEach(c => map.set(c.id, { ...c, children: [] }));
  const roots: CategoryWithChildren[] = [];
  map.forEach(node => {
    if (node.parent_id && map.has(node.parent_id)) {
      map.get(node.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

/** Aktif ürünlerin kategori başına sayısını döner: { [categoryId]: count } */
export async function getProductCountsByCategory(): Promise<Record<string, number>> {
  const { data } = await supabase.from('products').select('category_id').eq('status', 'active');
  const counts: Record<string, number> = {};
  for (const p of data ?? []) {
    if (p.category_id) counts[p.category_id] = (counts[p.category_id] ?? 0) + 1;
  }
  return counts;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const { data, error } = await supabase.from('categories').select('*').eq('slug', slug).single();
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to fetch category: ${error.message}`);
  }
  return data as Category;
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const { data, error } = await supabase.from('categories').select('*').eq('id', id).single();
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to fetch category: ${error.message}`);
  }
  return data as Category;
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  const admin = createAdminClient();
  const { data, error } = await admin.from('categories').insert(input as CategoryInsert).select().single();
  if (error) throw new Error(`Failed to create category: ${error.message}`);
  return data as Category;
}

export async function updateCategory(id: string, input: Partial<CategoryInput>): Promise<Category> {
  const admin = createAdminClient();
  const { data, error } = await admin.from('categories').update(input as CategoryUpdate).eq('id', id).select().single();
  if (error) throw new Error(`Failed to update category: ${error.message}`);
  return data as Category;
}

export async function deleteCategory(id: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from('categories').delete().eq('id', id);
  if (error) throw new Error(`Failed to delete category: ${error.message}`);
}
