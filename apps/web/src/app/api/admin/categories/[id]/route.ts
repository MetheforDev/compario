import { NextResponse } from 'next/server';
import { getCategoryById } from '@compario/database';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const category = await getCategoryById(params.id);
    if (!category) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(category);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
