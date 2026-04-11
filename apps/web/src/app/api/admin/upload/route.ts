import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createAdminClient } from '@compario/database';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

const BUCKET = 'media';
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']);

async function checkAuth(): Promise<boolean> {
  const cookieStore = cookies();
  const c = cookieStore.get('compario-admin');
  if (c?.value && process.env.ADMIN_SECRET && c.value === process.env.ADMIN_SECRET) return true;
  try {
    const supabase = createServerComponentClient({ cookies: () => cookieStore });
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  } catch { return false; }
}

export async function POST(request: Request) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
  }
  try {
    const form = await request.formData();
    const file = form.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'Dosya gerekli' }, { status: 400 });
    if (file.size > MAX_SIZE) return NextResponse.json({ error: "Dosya 10MB'ı aşamaz" }, { status: 400 });
    if (!ALLOWED.has(file.type)) return NextResponse.json({ error: 'Desteklenmeyen format (JPEG/PNG/WebP/GIF/AVIF)' }, { status: 400 });

    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const buf = Buffer.from(await file.arrayBuffer());

    const admin = createAdminClient();
    const { error } = await admin.storage.from(BUCKET).upload(path, buf, {
      contentType: file.type,
      upsert: false,
    });
    if (error) throw new Error(error.message);

    const { data: { publicUrl } } = admin.storage.from(BUCKET).getPublicUrl(path);
    return NextResponse.json({ url: publicUrl });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Yükleme başarısız' },
      { status: 500 },
    );
  }
}
