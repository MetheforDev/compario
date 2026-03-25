'use server';

import { revalidatePath } from 'next/cache';
import {
  createProduct,
  updateProduct,
  deleteProduct,
} from '@compario/database';
import type { ProductInput } from '@compario/database';

export async function createProductAction(
  data: ProductInput,
): Promise<{ error?: string }> {
  try {
    await createProduct(data);
  } catch (err) {
    return { error: String(err) };
  }
  revalidatePath('/admin/products');
  return {};
}

export async function updateProductAction(
  id: string,
  data: Partial<ProductInput>,
): Promise<{ error?: string }> {
  try {
    await updateProduct(id, data);
  } catch (err) {
    return { error: String(err) };
  }
  revalidatePath('/admin/products');
  revalidatePath(`/admin/products/${id}/edit`);
  return {};
}

export async function deleteProductAction(
  id: string,
): Promise<{ error?: string }> {
  try {
    await deleteProduct(id);
  } catch (err) {
    return { error: String(err) };
  }
  revalidatePath('/admin/products');
  return {};
}
