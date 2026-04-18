'use client';

import { useState, useRef, useCallback, DragEvent, KeyboardEvent } from 'react';

// ─── Types ─────────────────────────────────────────────────────────────────────

type SingleProps = {
  multiple?: false;
  value: string;
  onChange: (url: string) => void;
};

type MultiProps = {
  multiple: true;
  value: string[];
  onChange: (urls: string[]) => void;
};

type Props = (SingleProps | MultiProps) & {
  accept?: string;
};

// ─── Upload helper ──────────────────────────────────────────────────────────────

async function uploadFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
  const json = await res.json() as { url?: string; error?: string };
  if (!res.ok) throw new Error(json.error ?? 'Yükleme başarısız');
  return json.url!;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function ImageUpload(props: Props) {
  const accept = props.accept ?? 'image/jpeg,image/png,image/webp,image/gif,image/avif';
  const multiple = props.multiple === true;

  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  const currentUrls: string[] = multiple
    ? (props as MultiProps).value
    : (props as SingleProps).value
    ? [(props as SingleProps).value]
    : [];

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      setUploadError('');
      setLoading(true);
      try {
        const urls = await Promise.all(Array.from(files).map(uploadFile));
        if (multiple) {
          const p = props as MultiProps;
          p.onChange([...p.value, ...urls]);
        } else {
          (props as SingleProps).onChange(urls[0] ?? '');
        }
      } catch (e) {
        setUploadError(e instanceof Error ? e.message : 'Yükleme hatası');
      } finally {
        setLoading(false);
        if (inputRef.current) inputRef.current.value = '';
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [multiple, multiple ? (props as MultiProps).value : (props as SingleProps).value],
  );

  const handleUrlAdd = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (multiple) {
      const p = props as MultiProps;
      p.onChange([...p.value, trimmed]);
    } else {
      (props as SingleProps).onChange(trimmed);
    }
    setUrlInput('');
    setShowUrlInput(false);
  };

  const removeUrl = (url: string) => {
    if (multiple) {
      const p = props as MultiProps;
      p.onChange(p.value.filter((u) => u !== url));
    } else {
      (props as SingleProps).onChange('');
    }
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-2">
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && !loading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !loading && inputRef.current?.click()}
        className="flex flex-col items-center justify-center gap-2 py-5 rounded-lg border transition-all cursor-pointer select-none"
        style={{
          background: dragging ? 'rgba(0,255,247,0.05)' : 'rgba(255,255,255,0.015)',
          borderColor: dragging
            ? 'rgba(0,255,247,0.5)'
            : loading
            ? 'rgba(196,154,60,0.4)'
            : 'rgba(0,255,247,0.12)',
          borderStyle: 'dashed',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => e.target.files?.length && handleFiles(e.target.files)}
        />

        {loading ? (
          <>
            <div className="w-4 h-4 rounded-full border-2 border-[rgba(196,154,60,0.3)] border-t-[#C49A3C] animate-spin" />
            <p className="font-mono text-[10px] text-[#C49A3C] uppercase tracking-wider">Yükleniyor...</p>
          </>
        ) : (
          <div className="text-center">
            <p className="font-mono text-[10px] text-neon-cyan uppercase tracking-wider opacity-60">
              {multiple
                ? '+ Görsel ekle'
                : currentUrls.length
                ? '↑ Görseli değiştir'
                : '↑ Görsel yükle'}
            </p>
            <p className="font-mono text-[9px] text-gray-700 mt-0.5">
              Sürükle bırak veya tıkla · JPEG / PNG / WebP · max 10MB
            </p>
          </div>
        )}
      </div>

      {/* URL input toggle */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => { setShowUrlInput((v) => !v); setUrlInput(''); setUploadError(''); }}
          className="font-mono text-[9px] uppercase tracking-wider text-gray-600 hover:text-neon-cyan transition-colors"
        >
          {showUrlInput ? '✕ İptal' : '🔗 URL\'den ekle'}
        </button>
      </div>

      {showUrlInput && (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && (e.preventDefault(), handleUrlAdd())}
            placeholder="https://example.com/image.jpg"
            className="flex-1 bg-[#0c0c16] border border-[rgba(0,255,247,0.12)] rounded px-3 py-1.5 font-mono text-[11px] text-gray-300 placeholder-gray-700 focus:outline-none focus:border-neon-cyan/40"
          />
          <button
            type="button"
            onClick={handleUrlAdd}
            disabled={!urlInput.trim()}
            className="px-3 py-1.5 rounded font-mono text-[10px] uppercase tracking-wider transition-all disabled:opacity-30"
            style={{ background: 'rgba(0,255,247,0.08)', border: '1px solid rgba(0,255,247,0.2)', color: '#00fff7' }}
          >
            Ekle
          </button>
        </div>
      )}

      {uploadError && (
        <p className="font-mono text-[10px] text-red-400">✕ {uploadError}</p>
      )}

      {/* Preview */}
      {currentUrls.length > 0 && (
        <div className={`grid gap-2 ${multiple ? 'grid-cols-3 sm:grid-cols-4' : 'grid-cols-1'}`}>
          {currentUrls.map((url) => (
            <div
              key={url}
              className="relative group rounded overflow-hidden border border-[rgba(0,255,247,0.08)] bg-[#0c0c16]"
              style={{ aspectRatio: multiple ? '1/1' : '16/9' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeUrl(url); }}
                className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity z-10"
                style={{ background: 'rgba(220,38,38,0.9)', color: '#fff' }}
                title="Kaldır"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
