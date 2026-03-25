'use server';

import { revalidatePath } from 'next/cache';
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from '@compario/database';
import type { CategoryInput } from '@compario/database';

export async function createCategoryAction(
  data: CategoryInput,
): Promise<{ error?: string }> {
  try {
    await createCategory(data);
  } catch (err) {
    return { error: String(err) };
  }
  revalidatePath('/admin/categories');
  return {};
}

export async function updateCategoryAction(
  id: string,
  data: Partial<CategoryInput>,
): Promise<{ error?: string }> {
  try {
    await updateCategory(id, data);
  } catch (err) {
    return { error: String(err) };
  }
  revalidatePath('/admin/categories');
  return {};
}

export async function deleteCategoryAction(
  id: string,
): Promise<{ error?: string }> {
  try {
    await deleteCategory(id);
  } catch (err) {
    return { error: String(err) };
  }
  revalidatePath('/admin/categories');
  return {};
}
