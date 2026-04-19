import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createReview, getProductById } from '@compario/database';
import type { Database } from '@compario/database';
import { notifyAdminReview } from '@/lib/email';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      product_id?: string;
      reviewer_name?: string;
      reviewer_email?: string;
      rating?: number;
      comment?: string;
    };

    const { product_id, reviewer_name, reviewer_email, rating, comment } = body;

    if (!product_id) {
      return NextResponse.json({ error: 'product_id gerekli' }, { status: 400 });
    }
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Geçerli bir puan seçin (1-5)' }, { status: 400 });
    }
    if (!comment || comment.trim().length < 10) {
      return NextResponse.json({ error: 'Yorum en az 10 karakter olmalı' }, { status: 400 });
    }
    if (comment.trim().length > 1000) {
      return NextResponse.json({ error: 'Yorum en fazla 1000 karakter olabilir' }, { status: 400 });
    }

    // Giriş yapan kullanıcıyı al (opsiyonel)
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id ?? null;
    const userEmail = session?.user?.email ?? null;

    const review = await createReview({
      product_id,
      user_id: userId,
      reviewer_name: reviewer_name?.trim() || null,
      reviewer_email: reviewer_email?.trim() || userEmail,
      rating,
      comment: comment.trim(),
    });

    // Admin'e asenkron bildirim gönder
    getProductById(product_id).then((product) => {
      if (!product) return;
      notifyAdminReview({
        productName: `${product.brand ? product.brand + ' ' : ''}${product.name}`,
        productSlug: product.slug,
        reviewerName: reviewer_name?.trim() || 'Anonim',
        rating,
        comment: comment.trim(),
      }).catch(() => {});
    }).catch(() => {});

    return NextResponse.json({ review, message: 'Yorumunuz moderasyon bekliyor.' }, { status: 201 });
  } catch (err) {
    console.error('[Reviews POST]', err);
    return NextResponse.json({ error: 'Yorum gönderilemedi' }, { status: 500 });
  }
}
