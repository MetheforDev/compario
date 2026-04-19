import { NextResponse } from 'next/server';
import { incrementCommentHelpful } from '@compario/database';

export const runtime = 'nodejs';

export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    if (!id) return NextResponse.json({ error: 'ID gerekli' }, { status: 400 });

    const helpful_count = await incrementCommentHelpful(id);
    return NextResponse.json({ helpful_count });
  } catch (err) {
    console.error('[Comments Helpful]', err);
    return NextResponse.json({ error: 'İşlem başarısız' }, { status: 500 });
  }
}
