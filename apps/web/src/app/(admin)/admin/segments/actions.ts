'use server';

import { revalidatePath } from 'next/cache';
import {
  createSegment,
  updateSegment,
  deleteSegment,
} from '@compario/database';
import type { SegmentInput } from '@compario/database';

export async function createSegmentAction(
  data: SegmentInput,
): Promise<{ error?: string }> {
  try {
    await createSegment(data);
  } catch (err) {
    return { error: String(err) };
  }
  revalidatePath('/admin/segments');
  return {};
}

export async function updateSegmentAction(
  id: string,
  data: Partial<SegmentInput>,
): Promise<{ error?: string }> {
  try {
    await updateSegment(id, data);
  } catch (err) {
    return { error: String(err) };
  }
  revalidatePath('/admin/segments');
  return {};
}

export async function deleteSegmentAction(
  id: string,
): Promise<{ error?: string }> {
  try {
    await deleteSegment(id);
  } catch (err) {
    return { error: String(err) };
  }
  revalidatePath('/admin/segments');
  return {};
}
