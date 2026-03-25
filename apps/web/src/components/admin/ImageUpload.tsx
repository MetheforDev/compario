'use client';

import { useState, useRef, useCallback, useId } from 'react';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { uploadProductImage, deleteProductImage, compressImage } from '@/lib/uploadImage';

interface ImageItem {
  id: string;
  url: string;
  uploading?: boolean;
  error?: string;
}

interface ImageUploadProps {
  folderId?: string;
  initialUrls?: string[];
  maxImages?: number;
  onChange: (urls: string[]) => void;
}

export function ImageUpload({
  folderId,
  initialUrls = [],
  maxImages = 5,
  onChange,
}: ImageUploadProps) {
  const uid        = useId();
  const folderRef  = useRef(folderId ?? crypto.randomUUID());
  const inputRef   = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [images, setImages] = useState<ImageItem[]>(() =>
    initialUrls.map((url, i) => ({ id: `init-${i}`, url })),
  );

  // Push URLs to parent whenever images change
  function notifyParent(imgs: ImageItem[]) {
    onChange(imgs.filter((i) => i.url && !i.uploading && !i.error).map((i) => i.url));
  }

  async function processFiles(files: FileList | File[]) {
    const arr = Array.from(files);
    const available = maxImages - images.filter((i) => !i.error).length;
    if (available <= 0) {
      toast.error(`En fazla ${maxImages} görsel yükleyebilirsiniz.`);
      return;
    }
    const toUpload = arr.slice(0, available);

    // Add placeholder items
    const placeholders: ImageItem[] = toUpload.map((_, idx) => ({
      id: `uploading-${Date.now()}-${idx}`,
      url: '',
      uploading: true,
    }));
    const newImages = [...images, ...placeholders];
    setImages(newImages);

    // Upload each
    for (let i = 0; i < toUpload.length; i++) {
      const file = toUpload[i];
      const placeholderId = placeholders[i].id;

      const compressed = await compressImage(file);
      const result = await uploadProductImage(compressed, folderRef.current);

      setImages((prev) => {
        const updated = prev.map((item) =>
          item.id === placeholderId
            ? result.error
              ? { id: placeholderId, url: '', error: result.error }
              : { id: placeholderId, url: result.url }
            : item,
        );
        notifyParent(updated);
        return updated;
      });

      if (result.error) toast.error(`Yükleme hatası: ${result.error}`);
    }
  }

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    processFiles(files);
  }, [images, maxImages]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  async function handleRemove(img: ImageItem) {
    if (img.url) await deleteProductImage(img.url);
    setImages((prev) => {
      const updated = prev.filter((i) => i.id !== img.id);
      notifyParent(updated);
      return updated;
    });
  }

  function handleSetMain(imgId: string) {
    setImages((prev) => {
      const idx = prev.findIndex((i) => i.id === imgId);
      if (idx <= 0) return prev;
      const updated = [prev[idx], ...prev.filter((_, i) => i !== idx)];
      notifyParent(updated);
      return updated;
    });
  }

  const uploadedCount = images.filter((i) => i.url && !i.uploading && !i.error).length;
  const canAdd = uploadedCount < maxImages;

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      {canAdd && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`h-36 flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed
                      cursor-pointer transition-all select-none
                      ${isDragging
                        ? 'border-neon-cyan bg-[rgba(0,255,247,0.06)]'
                        : 'border-[rgba(0,255,247,0.2)] bg-[#0d0d17] hover:border-[rgba(0,255,247,0.4)] hover:bg-[rgba(0,255,247,0.03)]'
                      }`}
        >
          <span className="text-2xl">📸</span>
          <p className="font-mono text-xs text-gray-500 uppercase tracking-wider">
            Sürükle & bırak veya tıkla
          </p>
          <p className="font-mono text-[10px] text-gray-700">
            JPG · PNG · WebP · maks {maxImages} görsel · {5}MB
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        id={uid}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Preview grid */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {images.map((img, idx) => (
            <div
              key={img.id}
              className="relative w-24 h-24 rounded-lg overflow-hidden border border-[rgba(0,255,247,0.15)] group"
            >
              {img.uploading ? (
                <div className="w-full h-full bg-[#0d0d17] flex items-center justify-center">
                  <span className="font-mono text-[10px] text-neon-cyan animate-pulse">...</span>
                </div>
              ) : img.error ? (
                <div className="w-full h-full bg-[#1a0010] flex items-center justify-center p-1">
                  <span className="font-mono text-[9px] text-neon-pink text-center">{img.error}</span>
                </div>
              ) : (
                <Image
                  src={img.url}
                  alt={`Görsel ${idx + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              )}

              {/* Main indicator */}
              {idx === 0 && img.url && !img.uploading && (
                <span className="absolute top-1 left-1 font-mono text-[8px] text-black bg-neon-cyan rounded px-1">
                  ★ Ana
                </span>
              )}

              {/* Overlay actions */}
              {!img.uploading && (
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                  {idx !== 0 && img.url && (
                    <button
                      type="button"
                      onClick={() => handleSetMain(img.id)}
                      title="Ana görsel yap"
                      className="w-7 h-7 bg-neon-cyan text-black rounded text-xs font-bold flex items-center justify-center"
                    >
                      ★
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemove(img)}
                    title="Kaldır"
                    className="w-7 h-7 bg-neon-pink text-white rounded text-xs font-bold flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="font-mono text-[10px] text-gray-700">
        {uploadedCount} / {maxImages} görsel · İlk görsel ana görsel olarak kullanılır
      </p>
    </div>
  );
}
