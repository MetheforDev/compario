import { supabase, createAdminClient } from '../client';
import type { NewsletterSubscriber } from '../types';

export async function subscribeNewsletter(email: string): Promise<{
  subscriber: NewsletterSubscriber;
  isNew: boolean;
}> {
  const admin = createAdminClient();

  // Check existing
  const { data: existing } = await admin
    .from('newsletter_subscribers')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();

  if (existing) {
    if (existing.status === 'active') {
      throw new Error('Bu e-posta zaten abone.');
    }
    // Re-subscribe
    const { data, error } = await admin
      .from('newsletter_subscribers')
      .update({ status: 'active', unsubscribed_at: null })
      .eq('email', email.toLowerCase())
      .select()
      .single();
    if (error) throw error;
    return { subscriber: data, isNew: false };
  }

  const { data, error } = await admin
    .from('newsletter_subscribers')
    .insert({ email: email.toLowerCase(), status: 'active' })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') throw new Error('Bu e-posta zaten abone.');
    throw error;
  }

  return { subscriber: data, isNew: true };
}

export async function getNewsletterSubscribers(status?: string): Promise<NewsletterSubscriber[]> {
  const admin = createAdminClient();
  let query = admin
    .from('newsletter_subscribers')
    .select('*')
    .order('subscribed_at', { ascending: false });

  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getSubscriberCount(): Promise<{ active: number; total: number }> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('newsletter_subscribers')
    .select('status');
  if (error) throw error;
  const rows = data ?? [];
  return {
    active: rows.filter((r) => r.status === 'active').length,
    total: rows.length,
  };
}

export async function unsubscribeNewsletter(email: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from('newsletter_subscribers')
    .update({ status: 'unsubscribed', unsubscribed_at: new Date().toISOString() })
    .eq('email', email.toLowerCase());
  if (error) throw error;
}

export async function deleteSubscriber(id: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from('newsletter_subscribers').delete().eq('id', id);
  if (error) throw error;
}
