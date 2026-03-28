'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@compario/database';

export async function inviteUser(email: string, role: 'admin' | 'editor') {
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { role },
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/admin-login`,
  });
  if (error) throw new Error(error.message);
  revalidatePath('/admin/users');
}

export async function changeUserRole(userId: string, role: 'admin' | 'editor') {
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, {
    user_metadata: { role },
  });
  if (error) throw new Error(error.message);
  revalidatePath('/admin/users');
}

export async function deleteUser(userId: string) {
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/users');
}
