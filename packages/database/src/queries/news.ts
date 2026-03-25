import { supabase, createAdminClient } from '../client';
import type { Inserts, Updates } from '../types';

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  images: string[] | null;
  category: string | null;
  tags: string[];
  related_product_ids: string[] | null;
  meta_title: string | null;
  meta_description: string | null;
  source: string;
  source_url: string | null;
  author: string | null;
  status: string;
  is_featured: boolean;
  view_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export type NewsArticleInput = Omit<NewsArticle, 'id' | 'created_at' | 'updated_at' | 'view_count'>;

export interface NewsFilters {
  category?: string;
  tags?: string[];
  status?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
  search?: string;
}

export async function getNewsArticles(filters: NewsFilters = {}): Promise<{ data: NewsArticle[]; total: number }> {
  let query = supabase
    .from('news_articles')
    .select('*', { count: 'exact' });

  const status = filters.status ?? 'published';
  query = query.eq('status', status);

  if (filters.category) {
    query = query.eq('category', filters.category);
  }

  if (filters.featured !== undefined) {
    query = query.eq('is_featured', filters.featured);
  }

  if (filters.tags?.length) {
    query = query.contains('tags', filters.tags);
  }

  if (filters.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,excerpt.ilike.%${filters.search}%`,
    );
  }

  const limit = filters.limit ?? 10;
  const offset = filters.offset ?? 0;

  query = query
    .order('published_at', { ascending: false, nullsFirst: false })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) throw new Error(`Failed to fetch news: ${error.message}`);
  return { data: (data ?? []) as unknown as NewsArticle[], total: count ?? 0 };
}

export async function getNewsArticleBySlug(slug: string): Promise<NewsArticle | null> {
  const { data, error } = await supabase
    .from('news_articles')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to fetch article: ${error.message}`);
  }
  return data as unknown as NewsArticle;
}

export async function getNewsArticleById(id: string): Promise<NewsArticle | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('news_articles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to fetch article: ${error.message}`);
  }
  return data as unknown as NewsArticle;
}

export async function createNewsArticle(input: Partial<NewsArticleInput>): Promise<NewsArticle> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('news_articles')
    .insert(input as Inserts<'news_articles'>)
    .select()
    .single();

  if (error) throw new Error(`Failed to create article: ${error.message}`);
  return data as unknown as NewsArticle;
}

export async function updateNewsArticle(id: string, input: Partial<NewsArticleInput>): Promise<NewsArticle> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('news_articles')
    .update(input as Updates<'news_articles'>)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update article: ${error.message}`);
  return data as unknown as NewsArticle;
}

export async function deleteNewsArticle(id: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from('news_articles').delete().eq('id', id);
  if (error) throw new Error(`Failed to delete article: ${error.message}`);
}

export async function incrementNewsView(id: string): Promise<void> {
  const { error } = await supabase.rpc('increment_news_view', { article_uuid: id });
  if (error) console.warn(`incrementNewsView failed: ${error.message}`);
}

export async function getFeaturedNews(limit: number = 3): Promise<NewsArticle[]> {
  const { data, error } = await supabase
    .from('news_articles')
    .select('*')
    .eq('status', 'published')
    .eq('is_featured', true)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Failed to fetch featured news: ${error.message}`);
  return (data ?? []) as unknown as NewsArticle[];
}

export async function getRelatedNews(tags: string[], excludeId: string, limit: number = 3): Promise<NewsArticle[]> {
  const { data, error } = await supabase
    .from('news_articles')
    .select('*')
    .eq('status', 'published')
    .neq('id', excludeId)
    .overlaps('tags', tags)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Failed to fetch related news: ${error.message}`);
  return (data ?? []) as unknown as NewsArticle[];
}
