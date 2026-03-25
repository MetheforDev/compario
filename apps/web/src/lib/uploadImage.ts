import { createBrowserClient } from '@/lib/supabase';

const BUCKET = 'product-images';
const MAX_SIZE_MB = 5;

export async function uploadProductImage(
  file: File,
  folderId: string,
): Promise<{ url: string; error?: string }> {
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return { url: '', error: `Dosya boyutu ${MAX_SIZE_MB}MB'dan büyük olamaz.` };
  }

  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowed.includes(file.type)) {
    return { url: '', error: 'Sadece JPG, PNG ve WebP formatları desteklenir.' };
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const filename = `${folderId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const supabase = createBrowserClient();
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filename, file, { cacheControl: '3600', upsert: false });

  if (error) return { url: '', error: error.message };

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
  return { url: data.publicUrl };
}

export async function deleteProductImage(publicUrl: string): Promise<void> {
  try {
    const supabase = createBrowserClient();
    // Extract storage path from public URL
    // URL format: .../storage/v1/object/public/<bucket>/<path>
    const marker = `/object/public/${BUCKET}/`;
    const idx = publicUrl.indexOf(marker);
    if (idx === -1) return;
    const filePath = decodeURIComponent(publicUrl.slice(idx + marker.length));
    await supabase.storage.from(BUCKET).remove([filePath]);
  } catch {
    // Non-critical
  }
}

export async function compressImage(file: File): Promise<File> {
  try {
    const imageCompression = (await import('browser-image-compression')).default;
    return await imageCompression(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    });
  } catch {
    return file; // Fall back to original if compression fails
  }
}
