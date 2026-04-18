import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

const COOKIE_NAME = 'compario-admin';

const ADMIN_ONLY_ROUTES = ['/admin/products', '/admin/categories', '/admin/segments', '/admin/users'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Pass-through: login/register pages + auth callbacks + API routes
  if (
    pathname === '/admin-login' ||
    pathname === '/giris' ||
    pathname === '/kayit' ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/api/admin/') ||
    pathname.startsWith('/api/auth/')
  ) {
    return NextResponse.next();
  }

  // ── Public user profile: require Supabase session ─────────────────────────
  if (pathname.startsWith('/profil')) {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req: request, res });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.redirect(new URL(`/giris?next=${pathname}`, request.url));
    }
    return res;
  }

  // ── Non-admin routes pass through ─────────────────────────────────────────
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const res = NextResponse.next();

  // ── Method 1: Super admin cookie ──────────────────────────────────────────
  const sessionCookie = request.cookies.get(COOKIE_NAME);
  const isSuperAdmin =
    !!process.env.ADMIN_SECRET &&
    sessionCookie?.value === process.env.ADMIN_SECRET;

  if (isSuperAdmin) return res;

  // ── Method 2: Supabase session (editors) ──────────────────────────────────
  const supabase = createMiddlewareClient({ req: request, res });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    const loginUrl = new URL('/admin-login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = (session.user.user_metadata?.role as string) ?? 'editor';
  const isAdmin = role === 'admin';

  const isAdminOnlyRoute = ADMIN_ONLY_ROUTES.some((r) => pathname.startsWith(r));
  if (isAdminOnlyRoute && !isAdmin) {
    return NextResponse.redirect(new URL('/admin/news', request.url));
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*', '/admin-login', '/api/admin/:path*', '/profil/:path*', '/profil', '/giris', '/kayit'],
};
