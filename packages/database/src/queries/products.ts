import { supabase, createAdminClient } from '../client';
import type {
  Product,
  ProductInsert,
  ProductUpdate,
  ProductInput,
  ProductFilters,
} from '../types';

export async function getProducts(filters: ProductFilters = {}): Promise<Product[]> {
  const {
    category, segment, brand, minPrice, maxPrice, status,
    limit = 20, offset = 0, search, sortBy = 'newest',
  } = filters;

  let query = supabase.from('products').select('*');

  if (category) {
    const { data: cat } = await supabase
      .from('categories').select('id').eq('slug', category).single();
    if (cat) {
      const { data: subs } = await supabase
        .from('categories').select('id').eq('parent_id', cat.id);
      const ids = [cat.id, ...(subs ?? []).map((s: { id: string }) => s.id)];
      query = query.in('category_id', ids);
    }
  }

  if (segment) {
    const { data: seg } = await supabase
      .from('segments')
      .select('*')
      .eq('slug', segment)
      .single();
    if (seg) query = query.eq('segment_id', seg.id);
  }

  if (brand) query = query.ilike('brand', brand);

  if (minPrice !== undefined) query = query.gte('price_min', minPrice);
  if (maxPrice !== undefined) query = query.lte('price_max', maxPrice);
  if (status)                 query = query.eq('status', status);

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,brand.ilike.%${search}%,model.ilike.%${search}%`,
    );
  }

  switch (sortBy) {
    case 'price_asc':  query = query.order('price_min', { ascending: true });  break;
    case 'price_desc': query = query.order('price_min', { ascending: false }); break;
    case 'name_asc':   query = query.order('name',      { ascending: true });  break;
    default:           query = query.order('created_at', { ascending: false }); break;
  }

  query = query.range(offset, offset + limit - 1);

  const { data, error } = await query;
  if (error) throw new Error(`Failed to fetch products: ${error.message}`);
  return (data ?? []) as Product[];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to fetch product: ${error.message}`);
  }
  return data as Product;
}

export async function getProductById(id: string): Promise<Product | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to fetch product: ${error.message}`);
  }
  return data as Product;
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('products')
    .insert(input as ProductInsert)
    .select()
    .single();

  if (error) throw new Error(`Failed to create product: ${error.message}`);
  return data as Product;
}

export async function updateProduct(id: string, input: Partial<ProductInput>): Promise<Product> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('products')
    .update(input as ProductUpdate)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update product: ${error.message}`);
  return data as Product;
}

export async function deleteProduct(id: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from('products').delete().eq('id', id);
  if (error) throw new Error(`Failed to delete product: ${error.message}`);
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (!ids.length) return [];
  const { data, error } = await supabase.from('products').select('*').in('id', ids);
  if (error) throw new Error(`Failed to fetch products by ids: ${error.message}`);
  const map = new Map((data ?? []).map((p) => [p.id, p]));
  return ids.map((id) => map.get(id)).filter(Boolean) as Product[];
}

export async function incrementViewCount(id: string): Promise<void> {
  const { error } = await supabase.rpc('increment_product_view', { product_uuid: id });
  if (error) console.warn(`incrementViewCount failed: ${error.message}`);
}

export async function getSimilarProducts(
  categoryId: string,
  currentProductId: string,
  limit: number = 4,
): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', categoryId)
    .eq('status', 'active')
    .neq('id', currentProductId)
    .order('view_count', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Failed to fetch similar products: ${error.message}`);
  return (data ?? []) as Product[];
}

export async function incrementCompareCount(ids: string[]): Promise<void> {
  if (!ids.length) return;
  // Fire individual updates; non-critical — swallow errors
  await Promise.all(
    ids.map((id) =>
      supabase.rpc('increment_compare_count', { product_uuid: id }).then(() => null, () => null),
    ),
  );
}

export async function getTrendingProducts(limit = 6): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'active')
    .order('compare_count', { ascending: false })
    .order('view_count', { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Failed to fetch trending: ${error.message}`);
  return (data ?? []) as Product[];
}

export async function getTopProductsByViews(limit = 10): Promise<Product[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('products')
    .select('*')
    .order('view_count', { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Failed to fetch top by views: ${error.message}`);
  return (data ?? []) as Product[];
}

export async function getTopProductsByCompares(limit = 10): Promise<Product[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('products')
    .select('*')
    .order('compare_count', { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Failed to fetch top by compares: ${error.message}`);
  return (data ?? []) as Product[];
}

export async function bulkCreateProducts(inputs: ProductInput[]): Promise<{ created: number; errors: string[] }> {
  if (!inputs.length) return { created: 0, errors: [] };
  const admin = createAdminClient();
  const errors: string[] = [];
  let created = 0;

  // Insert in batches of 50
  const BATCH = 50;
  for (let i = 0; i < inputs.length; i += BATCH) {
    const batch = inputs.slice(i, i + BATCH);
    const { data, error } = await admin
      .from('products')
      .insert(batch as ProductInsert[])
      .select('id');
    if (error) {
      errors.push(`Satır ${i + 1}–${i + batch.length}: ${error.message}`);
    } else {
      created += (data ?? []).length;
    }
  }
  return { created, errors };
}

export async function getBrandsByCategory(
  categorySlug: string,
): Promise<{ brand: string; count: number }[]> {
  const { data: cat } = await supabase
    .from('categories').select('id').eq('slug', categorySlug).single();
  if (!cat) return [];

  const { data: subs } = await supabase
    .from('categories').select('id').eq('parent_id', cat.id);
  const ids = [cat.id, ...(subs ?? []).map((s: { id: string }) => s.id)];

  const { data } = await supabase
    .from('products')
    .select('brand')
    .in('category_id', ids)
    .eq('status', 'active')
    .not('brand', 'is', null);

  if (!data) return [];

  const counts = new Map<string, number>();
  for (const p of data) {
    if (p.brand) counts.set(p.brand, (counts.get(p.brand) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([brand, count]) => ({ brand, count }))
    .sort((a, b) => b.count - a.count);
}

export interface SearchProductResult extends Product {
  _matchType: 'exact' | 'prefix' | 'contains';
}

export async function searchProducts(
  query: string,
  limit = 8,
  categoryIds?: string[],
): Promise<SearchProductResult[]> {
  if (!query || query.trim().length < 2) return [];
  const q = query.trim();

  // Run exact/prefix and contains searches in parallel
  const [exactRes, containsRes] = await Promise.all([
    (categoryIds && categoryIds.length > 0
      ? supabase.from('products').select('*').eq('status', 'active').in('category_id', categoryIds)
      : supabase.from('products').select('*').eq('status', 'active')
    )
      .or(`name.ilike.${q}%,brand.ilike.${q}%,model.ilike.${q}%`)
      .order('view_count', { ascending: false })
      .limit(limit),
    (categoryIds && categoryIds.length > 0
      ? supabase.from('products').select('*').eq('status', 'active').in('category_id', categoryIds)
      : supabase.from('products').select('*').eq('status', 'active')
    )
      .or(
        `name.ilike.%${q}%,brand.ilike.%${q}%,model.ilike.%${q}%,description.ilike.%${q}%,short_description.ilike.%${q}%`,
      )
      .order('view_count', { ascending: false })
      .limit(limit),
  ]);

  const exactIds = new Set<string>();
  const results: SearchProductResult[] = [];

  for (const p of exactRes.data ?? []) {
    exactIds.add(p.id);
    const lowerName = (p.name ?? '').toLowerCase();
    const lowerQ = q.toLowerCase();
    const matchType = lowerName === lowerQ || (p.brand ?? '').toLowerCase() === lowerQ
      ? 'exact'
      : 'prefix';
    results.push({ ...(p as Product), _matchType: matchType });
  }

  for (const p of containsRes.data ?? []) {
    if (!exactIds.has(p.id)) {
      results.push({ ...(p as Product), _matchType: 'contains' });
    }
  }

  return results.slice(0, limit);
}
