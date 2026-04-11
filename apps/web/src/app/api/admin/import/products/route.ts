import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { bulkCreateProducts, getCategories } from '@compario/database';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import type { ProductInput } from '@compario/database';

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

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter((l) => l.trim());
  if (lines.length < 2) return [];

  // Parse headers
  const headers = parseCSVLine(lines[0]).map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'));

  return lines.slice(1).map((line) => {
    const values = parseCSVLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = (values[i] ?? '').trim(); });
    return row;
  }).filter((row) => Object.values(row).some((v) => v));
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current); current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

function slugify(text: string): string {
  const trMap: Record<string, string> = {
    ç: 'c', ğ: 'g', ı: 'i', İ: 'i', ö: 'o', ş: 's', ü: 'u',
    Ç: 'c', Ğ: 'g', Ö: 'o', Ş: 's', Ü: 'u',
  };
  return text.split('').map((c) => trMap[c] ?? c).join('')
    .toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim()
    .replace(/\s+/g, '-').replace(/-+/g, '-');
}

export async function POST(request: Request) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
  }

  try {
    const form = await request.formData();
    const file = form.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'CSV dosyası gerekli' }, { status: 400 });
    if (!file.name.endsWith('.csv')) return NextResponse.json({ error: 'Sadece .csv dosyası kabul edilir' }, { status: 400 });

    const text = await file.text();
    const rows = parseCSV(text);
    if (!rows.length) return NextResponse.json({ error: 'CSV boş veya hatalı format' }, { status: 400 });

    // Load categories for slug→id lookup
    const categories = await getCategories(false).catch(() => []);
    const catMap = new Map(categories.map((c) => [c.slug, c.id]));

    const validRows: ProductInput[] = [];
    const rowErrors: string[] = [];

    rows.forEach((row, idx) => {
      const lineNum = idx + 2; // 1-based + header
      const name = row['name'] || row['isim'] || row['ürün_adı'];
      if (!name) { rowErrors.push(`Satır ${lineNum}: "name" alanı zorunlu`); return; }

      const slug = row['slug'] || slugify(name);
      const categorySlug = row['category'] || row['kategori'];
      const categoryId = categorySlug ? catMap.get(categorySlug) : null;
      if (!categoryId && !categorySlug) {
        // category_id is required in DB; skip rows without a valid category
      }

      const priceMin = row['price_min'] || row['fiyat'] || row['price'];
      const priceMax = row['price_max'];

      validRows.push({
        name,
        slug,
        brand: row['brand'] || row['marka'] || null,
        model: row['model'] || null,
        model_year: row['model_year'] || row['model_yılı'] ? Number(row['model_year'] || row['model_yılı']) : null,
        category_id: categoryId as string,
        status: (row['status'] || row['durum'] || 'draft') as 'active' | 'inactive' | 'draft',
        price_min: priceMin ? parseFloat(priceMin.replace(/[^0-9.]/g, '')) : null,
        price_max: priceMax ? parseFloat(priceMax.replace(/[^0-9.]/g, '')) : null,
        currency: row['currency'] || row['para_birimi'] || 'TRY',
        short_description: row['short_description'] || row['kısa_açıklama'] || null,
        description: row['description'] || row['açıklama'] || null,
        image_url: row['image_url'] || row['görsel_url'] || null,
        meta_title: row['meta_title'] || null,
        meta_description: row['meta_description'] || null,
        specs: null,
        segment_id: null,
      });
    });

    const { created, errors: dbErrors } = await bulkCreateProducts(validRows);

    return NextResponse.json({
      total: rows.length,
      created,
      skipped: rowErrors.length,
      errors: [...rowErrors, ...dbErrors],
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Import başarısız' },
      { status: 500 },
    );
  }
}
