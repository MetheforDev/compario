import { supabase, createAdminClient } from '../client';
import type { Product } from '../types';

export async function getUserFavorites(userId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('user_favorites')
    .select('product_id, products(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row: { products: unknown }) => row.products as Product);
}

export async function addFavorite(userId: string, productId: string): Promise<void> {
  const { error } = await supabase
    .from('user_favorites')
    .insert({ user_id: userId, product_id: productId });
  if (error && error.code !== '23505') throw error; // ignore duplicate
}

export async function removeFavorite(userId: string, productId: string): Promise<void> {
  const { error } = await supabase
    .from('user_favorites')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId);
  if (error) throw error;
}

export async function isFavorite(userId: string, productId: string): Promise<boolean> {
  const { data } = await supabase
    .from('user_favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .maybeSingle();
  return !!data;
}

export async function getUserPriceAlerts(userId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('price_alerts')
    .select('*, products(id, name, slug, brand, image_url, price_min)')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}
