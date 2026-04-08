import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { updateReviewStatus, deleteReview } from '@compario/database';
import type { ReviewStatus } from '@compario/database';

export const runtime = 'nodejs';

function isAdminAuthed(): boolean {
  const cookieStore = cookies();
  return cookieStore.get('admin_authed')?.value === 'true';
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  if (!isAdminAuthed()) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
  }

  try {
    const { id } = params;
    const body = await request.json() as { status?: string };
    const status = body.status as ReviewStatus;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Geçersiz durum' }, { status: 400 });
    }

    await updateReviewStatus(id, status);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Reviews Status PATCH]', err);
    return NextResponse.json({ error: 'İşlem başarısız' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  if (!isAdminAuthed()) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
  }

  try {
    await deleteReview(params.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Reviews DELETE]', err);
    return NextResponse.json({ error: 'Silinemedi' }, { status: 500 });
  }
}
