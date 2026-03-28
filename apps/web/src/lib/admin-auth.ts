import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

export type AdminRole = 'superadmin' | 'admin' | 'editor' | null;

export interface AdminUser {
  id: string;
  email: string;
  role: AdminRole;
  isSuperAdmin: boolean;
}

/**
 * Returns the current admin user from either:
 * 1. Simple cookie (super admin)
 * 2. Supabase session (admin / editor)
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  const cookieStore = cookies();

  // Check simple cookie first (super admin)
  const sessionCookie = cookieStore.get('compario-admin');
  if (
    process.env.ADMIN_SECRET &&
    sessionCookie?.value === process.env.ADMIN_SECRET
  ) {
    return {
      id: 'superadmin',
      email: process.env.ADMIN_EMAIL ?? 'admin@compario.tech',
      role: 'superadmin',
      isSuperAdmin: true,
    };
  }

  // Check Supabase session
  try {
    const supabase = createServerComponentClient({ cookies: () => cookieStore });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const role = (session.user.user_metadata?.role as string) ?? 'editor';
    return {
      id: session.user.id,
      email: session.user.email ?? '',
      role: role as AdminRole,
      isSuperAdmin: false,
    };
  } catch {
    return null;
  }
}

export function canManageUsers(user: AdminUser | null): boolean {
  return user?.isSuperAdmin || user?.role === 'admin';
}

export function canManageContent(user: AdminUser | null): boolean {
  return user !== null;
}
