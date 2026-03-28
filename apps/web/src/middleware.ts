import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

const COOKIE_NAME = 'compario-admin';

// Editor-only routes (editors can access)
const EDITOR_ROUTES = ['/admin/dashboard', '/admin/news'];
// Admin-only routes (editors cannot access)
const ADMIN_ONLY_ROUTES = ['/admin/products', '/admin/categories', '/admin/segments', '/admin/users'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow login page and auth API through
  if (pathname === '/admin-login' || pathname.startsWith('/api/admin/')) {
    return NextResponse.next();
  }

  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const res = NextResponse.next();

  // ── Method 1: Super admin cookie (simple password) ──────────────────────
  const sessionCookie = request.cookies.get(COOKIE_NAME);
  const isSuperAdmin =
    !!process.env.ADMIN_SECRET &&
    sessionCookie?.value === process.env.ADMIN_SECRET;

  if (isSuperAdmin) return res;

  // ── Method 2: Supabase session (email/password for editors) ──────────────
  const supabase = createMiddlewareClient({ req: request, res });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    const loginUrl = new URL('/admin-login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check role-based access
  const role = (session.user.user_metadata?.role as string) ?? 'editor';
  const isAdmin = role === 'admin';

  const isAdminOnlyRoute = ADMIN_ONLY_ROUTES.some((r) => pathname.startsWith(r));
  if (isAdminOnlyRoute && !isAdmin) {
    return NextResponse.redirect(new URL('/admin/news', request.url));
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*', '/admin-login', '/api/admin/:path*'],
};
