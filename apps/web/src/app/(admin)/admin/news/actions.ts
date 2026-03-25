'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  createNewsArticle,
  updateNewsArticle,
  deleteNewsArticle,
} from '@compario/database';
import type { NewsArticleInput } from '@compario/database';

export async function createNewsAction(
  data: Partial<NewsArticleInput>,
): Promise<{ error?: string }> {
  let id: string | undefined;
  try {
    const article = await createNewsArticle(data);
    id = article.id;
  } catch (err) {
    return { error: String(err) };
  }
  revalidatePath('/admin/news');
  revalidatePath('/news');
  revalidatePath('/');
  redirect(`/admin/news/${id}/edit`);
}

export async function updateNewsAction(
  id: string,
  data: Partial<NewsArticleInput>,
): Promise<{ error?: string }> {
  try {
    await updateNewsArticle(id, data);
  } catch (err) {
    return { error: String(err) };
  }
  revalidatePath('/admin/news');
  revalidatePath(`/admin/news/${id}/edit`);
  revalidatePath('/news');
  revalidatePath('/');
  return {};
}

export async function deleteNewsAction(
  id: string,
): Promise<{ error?: string }> {
  try {
    await deleteNewsArticle(id);
  } catch (err) {
    return { error: String(err) };
  }
  revalidatePath('/admin/news');
  revalidatePath('/news');
  revalidatePath('/');
  return {};
}
