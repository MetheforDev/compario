'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

const CSV_COLUMNS = [
  { key: 'name', required: true, note: 'Zorunlu' },
  { key: 'brand', required: false, note: 'Marka' },
  { key: 'model', required: false, note: 'Model kodu' },
  { key: 'model_year', required: false, note: 'Örn: 2025' },
  { key: 'category', required: false, note: 'Kategori slug (örn: telefonlar)' },
  { key: 'price_min', required: false, note: 'Minimum fiyat' },
  { key: 'price_max', required: false, note: 'Maksimum fiyat' },
  { key: 'currency', required: false, note: 'TRY (varsayılan)' },
  { key: 'status', required: false, note: 'active / draft / inactive' },
  { key: 'short_description', required: false, note: 'Kısa açıklama' },
  { key: 'image_url', required: false, note: 'Görsel URL' },
];

interface ImportResult {
  total: number;
  created: number;
  skipped: number;
  errors: string[];
}

function downloadTemplate() {
  const headers = CSV_COLUMNS.map((c) => c.key).join(',');
  const example = [
    'iPhone 16 Pro', 'Apple', 'A3291', '2024', 'telefonlar',
    '74999', '89999', 'TRY', 'active', 'Apple akıllı telefon', '',
  ].join(',');
  const csv = `${headers}\n${example}\n`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'urunler-sablonu.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function ProductImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File | null) {
    if (!f) return;
    if (!f.name.endsWith('.csv')) {
      setError('Sadece .csv dosyası kabul edilir');
      return;
    }
    setFile(f);
    setError(null);
    setResult(null);
  }

  async function handleImport() {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/admin/import/products', { method: 'POST', body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Import başarısız');
      setResult(json as ImportResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Hata oluştu');
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    'w-full bg-[#0c0c16] border border-[rgba(0,255,247,0.15)] rounded px-3 py-2.5 font-mono text-xs text-gray-300 placeholder-gray-700 focus:outline-none focus:border-neon-cyan/50 transition-colors';

  return (
    <div className="p-8 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/products"
          className="font-mono text-[10px] text-gray-600 hover:text-gray-300 transition-colors uppercase tracking-wider"
        >
          ← Ürünlere Dön
        </Link>
        <h1 className="font-orbitron text-3xl font-black text-neon-cyan mt-3">CSV IMPORT</h1>
        <p className="font-mono text-xs text-gray-600 mt-2">
          Toplu ürün yükleme. CSV hazırla, yükle.
        </p>
      </div>

      {/* Columns reference */}
      <div
        className="rounded-xl p-5 mb-6"
        style={{ background: '#0c0c18', border: '1px solid rgba(196,154,60,0.1)' }}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <p className="font-orbitron text-xs text-neon-cyan">KOLON REHBERİ</p>
          <button onClick={downloadTemplate} className="btn-neon text-xs py-1.5 px-4 flex-shrink-0">
            Şablon İndir
          </button>
        </div>
        <div className="space-y-1.5">
          {CSV_COLUMNS.map((col) => (
            <div key={col.key} className="flex items-center gap-3">
              <code
                className="font-mono text-[10px] w-36 flex-shrink-0"
                style={{ color: col.required ? '#00fff7' : '#6b7280' }}
              >
                {col.key}
              </code>
              <span className="font-mono text-[10px] text-gray-700">{col.note}</span>
              {col.required && (
                <span className="font-mono text-[9px] text-red-500 uppercase tracking-wider">zorunlu</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Drop zone */}
      <div
        className="rounded-xl mb-6 transition-all cursor-pointer flex items-center justify-center"
        style={{
          background: dragOver ? 'rgba(0,255,247,0.05)' : '#0b0b15',
          border: `2px dashed ${dragOver ? 'rgba(0,255,247,0.4)' : 'rgba(196,154,60,0.15)'}`,
          minHeight: '140px',
        }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0] ?? null); }}
      >
        <div className="text-center px-8 py-8">
          {file ? (
            <>
              <p className="font-mono text-xs text-neon-cyan mb-1">{file.name}</p>
              <p className="font-mono text-[10px] text-gray-600">{(file.size / 1024).toFixed(1)} KB</p>
              <p className="font-mono text-[10px] text-gray-700 mt-2">Değiştirmek için tıkla</p>
            </>
          ) : (
            <>
              <p className="font-mono text-xs text-gray-500 mb-1">CSV dosyasını buraya bırak</p>
              <p className="font-mono text-[10px] text-gray-700">veya tıkla seç</p>
            </>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
      </div>

      {/* Error */}
      {error && (
        <div
          className="rounded-lg px-4 py-3 mb-4 font-mono text-xs text-red-400"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div
          className="rounded-xl p-5 mb-6"
          style={{ background: '#0c0c18', border: '1px solid rgba(196,154,60,0.1)' }}
        >
          <p className="font-orbitron text-xs text-neon-cyan mb-4">IMPORT SONUCU</p>
          <div className="grid grid-cols-3 gap-4 mb-4">
            {[
              { label: 'Toplam Satır', value: result.total, color: '#9ca3af' },
              { label: 'Eklendi', value: result.created, color: '#00fff7' },
              { label: 'Atlandı', value: result.skipped, color: '#C49A3C' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-orbitron text-2xl font-black" style={{ color: s.color }}>
                  {s.value}
                </p>
                <p className="font-mono text-[10px] text-gray-600 uppercase tracking-wider mt-1">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
          {result.errors.length > 0 && (
            <div
              className="rounded-lg p-3"
              style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)' }}
            >
              <p className="font-mono text-[10px] text-red-400 uppercase tracking-wider mb-2">Hatalar</p>
              <ul className="space-y-1">
                {result.errors.map((e, i) => (
                  <li key={i} className="font-mono text-[10px] text-red-400">{e}</li>
                ))}
              </ul>
            </div>
          )}
          {result.created > 0 && (
            <Link href="/admin/products" className="btn-neon text-xs mt-4 inline-block">
              Ürünleri Gör →
            </Link>
          )}
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleImport}
        disabled={!file || loading}
        className="btn-neon disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? 'Yükleniyor...' : 'Import Başlat'}
      </button>
    </div>
  );
}
