import { createAdminClient, supabase } from '../client';

export interface PricePoint {
  id: string;
  product_id: string;
  price: number;
  currency: string;
  recorded_at: string;
}

export interface PriceAlert {
  id: string;
  product_id: string;
  email: string;
  target_price: number;
  is_active: boolean;
  created_at: string;
  notified_at: string | null;
}

// ─── Price History ───────────────────────────────────────────────────────────

export async function getPriceHistory(productId: string, days = 30): Promise<PricePoint[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data, error } = await supabase
    .from('price_history')
    .select('*')
    .eq('product_id', productId)
    .gte('recorded_at', since.toISOString())
    .order('recorded_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as PricePoint[];
}

export async function recordPrice(
  productId: string,
  price: number,
  currency = 'TRY',
): Promise<PricePoint> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('price_history')
    .insert({ product_id: productId, price, currency })
    .select()
    .single();

  if (error) throw error;
  return data as PricePoint;
}

// Record today's price for all products that have a price — skip if already recorded today
export async function recordDailyPrices(): Promise<{ recorded: number; skipped: number }> {
  const admin = createAdminClient();

  // Get all active products with a price
  const { data: products, error: pErr } = await admin
    .from('products')
    .select('id, price_min, currency')
    .eq('status', 'active')
    .not('price_min', 'is', null);

  if (pErr) throw pErr;
  if (!products || products.length === 0) return { recorded: 0, skipped: 0 };

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  let recorded = 0;
  let skipped = 0;

  for (const product of products) {
    // Check if we already recorded today
    const { count } = await admin
      .from('price_history')
      .select('id', { count: 'exact', head: true })
      .eq('product_id', product.id)
      .gte('recorded_at', todayStart.toISOString());

    if ((count ?? 0) > 0) {
      skipped++;
      continue;
    }

    await admin.from('price_history').insert({
      product_id: product.id,
      price: product.price_min,
      currency: product.currency ?? 'TRY',
    });
    recorded++;
  }

  return { recorded, skipped };
}

// ─── Price Alerts ────────────────────────────────────────────────────────────

export async function createPriceAlert(
  productId: string,
  email: string,
  targetPrice: number,
): Promise<PriceAlert> {
  const admin = createAdminClient();

  // Upsert: one alert per product+email combo
  const { data, error } = await admin
    .from('price_alerts')
    .upsert(
      { product_id: productId, email: email.toLowerCase().trim(), target_price: targetPrice, is_active: true, notified_at: null },
      { onConflict: 'product_id,email' },
    )
    .select()
    .single();

  if (error) throw error;
  return data as PriceAlert;
}

export async function getActiveAlerts(): Promise<
  (PriceAlert & { product_name: string; product_slug: string; current_price: number | null })[]
> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from('price_alerts')
    .select(`
      *,
      products (name, slug, price_min)
    `)
    .eq('is_active', true);

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    ...row,
    product_name: row.products?.name ?? '',
    product_slug: row.products?.slug ?? '',
    current_price: row.products?.price_min ?? null,
  }));
}

export async function deactivateAlert(id: string, notifiedAt?: string): Promise<void> {
  const admin = createAdminClient();
  await admin
    .from('price_alerts')
    .update({ is_active: false, notified_at: notifiedAt ?? new Date().toISOString() })
    .eq('id', id);
}

export async function unsubscribePriceAlert(productId: string, email: string): Promise<void> {
  const admin = createAdminClient();
  await admin
    .from('price_alerts')
    .update({ is_active: false })
    .eq('product_id', productId)
    .eq('email', email.toLowerCase().trim());
}
