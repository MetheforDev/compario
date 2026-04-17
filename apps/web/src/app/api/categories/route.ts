import { NextResponse } from 'next/server';
import { getCategoryTree } from '@compario/database';

export const revalidate = 3600; // 1 saat cache

export async function GET() {
  try {
    const tree = await getCategoryTree(true);
    return NextResponse.json(tree);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
