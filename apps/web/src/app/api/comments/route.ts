import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createComment } from '@compario/database';
import type { Database } from '@compario/database';
import { notifyAdminComment } from '@/lib/email';

export const runtime = 'nodejs';

const VALID_ENTITY_TYPES = ['news', 'product'];

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      entity_type?: string;
      entity_id?: string;
      author_name?: string;
      author_email?: string;
      content?: string;
    };

    const { entity_type, entity_id, author_name, author_email, content } = body;

    if (!entity_type || !VALID_ENTITY_TYPES.includes(entity_type)) {
      return NextResponse.json({ error: 'Geçersiz entity_type' }, { status: 400 });
    }
    if (!entity_id) {
      return NextResponse.json({ error: 'entity_id gerekli' }, { status: 400 });
    }
    if (!content || content.trim().length < 2) {
      return NextResponse.json({ error: 'Yorum en az 2 karakter olmalı' }, { status: 400 });
    }
    if (content.trim().length > 2000) {
      return NextResponse.json({ error: 'Yorum en fazla 2000 karakter olabilir' }, { status: 400 });
    }

    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id ?? null;
    const userEmail = session?.user?.email ?? null;

    const comment = await createComment({
      entity_type,
      entity_id,
      user_id: userId,
      author_name: author_name?.trim() || null,
      author_email: author_email?.trim() || userEmail,
      content: content.trim(),
    });

    // Admin'e asenkron bildirim gönder (ürün/haber başlığını çek)
    notifyAdminComment({
      entityType: entity_type as 'news' | 'product',
      entityTitle: entity_id, // slug/id — title lookup opsiyonel iyileştirme
      entitySlug: entity_id,
      authorName: author_name?.trim() || null,
      content: content.trim(),
    }).catch(() => {});

    return NextResponse.json({ comment, message: 'Yorumunuz moderasyon bekliyor.' }, { status: 201 });
  } catch (err) {
    console.error('[Comments POST]', err);
    return NextResponse.json({ error: 'Yorum gönderilemedi' }, { status: 500 });
  }
}
