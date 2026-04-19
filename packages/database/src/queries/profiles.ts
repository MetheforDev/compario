import { supabase } from '../client';

export interface UserProfile {
  user_id: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  cover_image: string | null;
  twitter: string | null;
  instagram: string | null;
  youtube: string | null;
  website: string | null;
  updated_at: string;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  return data ?? null;
}

export async function upsertUserProfile(
  userId: string,
  fields: Partial<Omit<UserProfile, 'user_id' | 'updated_at'>>,
): Promise<void> {
  const { error } = await supabase.from('user_profiles').upsert(
    { user_id: userId, ...fields, updated_at: new Date().toISOString() },
    { onConflict: 'user_id' },
  );
  if (error) throw error;
}
