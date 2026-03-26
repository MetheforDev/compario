import { NextResponse } from 'next/server';

const COOKIE_NAME = 'compario-admin';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminSecret = process.env.ADMIN_SECRET;

    if (!adminPassword || !adminSecret) {
      return NextResponse.json(
        { error: 'Sunucu yapılandırması eksik' },
        { status: 500 },
      );
    }

    if (password !== adminPassword) {
      // Delay to prevent brute force
      await new Promise((r) => setTimeout(r, 500));
      return NextResponse.json({ error: 'Şifre hatalı' }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(COOKIE_NAME, adminSecret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });
  }
}
