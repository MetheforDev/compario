import { NextResponse } from 'next/server';
import { updateCommentStatus, deleteComment } from '@compario/database';
import type { CommentStatus } from '@compario/database';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';

function isAuthed() {
  const cookieStore = cookies();
  return cookieStore.get('admin_authed')?.value === 'true';
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  if (!isAuthed()) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  try {
    const { status } = await request.json() as { status?: CommentStatus };
    if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json({ error: 'Geçersiz status' }, { status: 400 });
    }
    await updateCommentStatus(params.id, status);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[Comments Status PATCH]', err);
    return NextResponse.json({ error: 'Güncelleme başarısız' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  if (!isAuthed()) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  try {
    await deleteComment(params.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[Comments Status DELETE]', err);
    return NextResponse.json({ error: 'Silme başarısız' }, { status: 500 });
  }
}
