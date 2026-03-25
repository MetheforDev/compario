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
    category, segment, minPrice, maxPrice, status,
    limit = 20, offset = 0, search, sortBy = 'newest',
  } = filters;

  let query = supabase.from('products').select('*');

  if (category) {
    const { data: cat } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', category)
      .single();
    if (cat) query = query.eq('category_id', cat.id);
  }

  if (segment) {
    const { data: seg } = await supabase
      .from('segments')
      .select('*')
      .eq('slug', segment)
      .single();
    if (seg) query = query.eq('segment_id', seg.id);
  }

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

export async function incrementViewCount(id: string): Promise<void> {
  const { error } = await supabase.rpc('increment_product_view', { product_uuid: id });
  if (error) console.warn(`incrementViewCount failed: ${error.message}`);
}
