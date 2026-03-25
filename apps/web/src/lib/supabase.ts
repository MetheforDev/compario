import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@compario/database';

// Client-side Supabase client (use inside 'use client' components)
export function createBrowserClient() {
  return createClientComponentClient<Database>();
}

// Server-side Supabase client (use inside Server Components / Route Handlers)
export function createServerClient() {
  const cookieStore = cookies();
  return createServerComponentClient<Database>({ cookies: () => cookieStore });
}
