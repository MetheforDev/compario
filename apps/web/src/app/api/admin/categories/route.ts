import { NextResponse } from 'next/server';
import { getCategories } from '@compario/database';

export async function GET() {
  try {
    const categories = await getCategories(false);
    return NextResponse.json(categories);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
