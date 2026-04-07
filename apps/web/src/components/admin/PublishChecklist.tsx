'use client';

interface PublishChecklistProps {
  title: string;
  slug: string;
  metaTitle: string;
  metaDesc: string;
  excerpt: string;
  content: string;
  coverImage: string;
  categories: string[];
  author: string;
  onPublish: () => void;
  onClose: () => void;
}

function wordCount(text: string) {
  const plain = text.replace(/```[\s\S]*?```/g, ' ').replace(/[#*_~`>|]/g, '').trim();
  return plain === '' ? 0 : plain.split(/\s+/).length;
}

interface CheckItem {
  label: string;
  ok: boolean;
  hint: string;
  critical: boolean;
}

export function PublishChecklist({
  title, slug, metaTitle, metaDesc, excerpt, content, coverImage, categories, author,
  onPublish, onClose,
}: PublishChecklistProps) {
  const words = wordCount(content);
  const effectiveTitle = metaTitle || title;
  const effectiveMeta = metaDesc || excerpt;

  const items: CheckItem[] = [
    {
      label: 'Başlık doldurulmuş',
      ok: title.length >= 10,
      hint: 'Başlık en az 10 karakter olmalı',
      critical: true,
    },
    {
      label: `Başlık uzunluğu ideal (${effectiveTitle.length}/60)`,
      ok: effectiveTitle.length >= 30 && effectiveTitle.length <= 60,
      hint: '30-60 karakter arası Google için ideal',
      critical: false,
    },
    {
      label: 'URL slug oluşturulmuş',
      ok: slug.length > 0,
      hint: 'Slug otomatik oluşturulmalı ya da elle girilmeli',
      critical: true,
    },
    {
      label: `Meta açıklama (${effectiveMeta.length}/160)`,
      ok: effectiveMeta.length >= 100 && effectiveMeta.length <= 160,
      hint: '100-160 karakter arası arama sonucu için optimal',
      critical: false,
    },
    {
      label: 'Kapak görseli yüklendi',
      ok: coverImage.length > 0,
      hint: 'Sosyal medya paylaşımları için gerekli (OG image)',
      critical: true,
    },
    {
      label: 'Kısa özet yazıldı',
      ok: excerpt.length >= 50,
      hint: 'En az 50 karakter özet önerilir',
      critical: false,
    },
    {
      label: 'Kategori seçildi',
      ok: categories.length > 0,
      hint: 'En az bir kategori seçilmeli',
      critical: true,
    },
    {
      label: `İçerik yeterli uzunlukta (${words} kelime)`,
      ok: words >= 300,
      hint: 'En az 300 kelime önerilir; 600+ daha iyi sıralama sağlar',
      critical: true,
    },
    {
      label: 'H2 başlık yapısı kurulmuş',
      ok: /^## /m.test(content),
      hint: 'İçeriğe ## ile başlık ekleyin',
      critical: false,
    },
    {
      label: 'Yazar bilgisi girildi',
      ok: author.length > 0,
      hint: 'Yazara güven sinyali için önemli',
      critical: false,
    },
  ];

  const criticalFail = items.filter((i) => i.critical && !i.ok);
  const warnings = items.filter((i) => !i.critical && !i.ok);
  const passed = items.filter((i) => i.ok);
  const score = Math.round((passed.length / items.length) * 100);

  const canPublish = criticalFail.length === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-lg bg-[#080812] border border-[rgba(0,255,247,0.15)] rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[rgba(0,255,247,0.06)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-orbitron text-sm font-black text-neon-cyan uppercase tracking-widest">
                Yayın Kontrolü
              </h2>
              <p className="font-mono text-[10px] text-gray-600 mt-1">
                {passed.length}/{items.length} kontrol geçildi
              </p>
            </div>
            <div className="text-right">
              <div
                className="font-orbitron text-3xl font-black"
                style={{ color: score >= 80 ? '#00fff7' : score >= 60 ? '#C49A3C' : '#ef4444' }}
              >
                {score}
              </div>
              <div className="font-mono text-[9px] text-gray-600 uppercase">puan</div>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="px-6 py-4 space-y-2 max-h-80 overflow-y-auto">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-3 px-3 py-2 rounded-lg transition-all"
              style={{
                background: item.ok
                  ? 'rgba(0,255,247,0.05)'
                  : item.critical
                  ? 'rgba(239,68,68,0.06)'
                  : 'rgba(196,154,60,0.05)',
              }}
            >
              <span
                className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5"
                style={{
                  background: item.ok ? '#00fff744' : item.critical ? '#ef444422' : '#C49A3C22',
                  color: item.ok ? '#00fff7' : item.critical ? '#ef4444' : '#C49A3C',
                  border: `1px solid ${item.ok ? '#00fff766' : item.critical ? '#ef444466' : '#C49A3C66'}`,
                }}
              >
                {item.ok ? '✓' : item.critical ? '✗' : '!'}
              </span>
              <div className="flex-1 min-w-0">
                <p
                  className="font-mono text-[11px]"
                  style={{ color: item.ok ? '#9ca3af' : item.critical ? '#ef4444' : '#C49A3C' }}
                >
                  {item.label}
                  {item.critical && !item.ok && (
                    <span className="ml-2 font-mono text-[8px] px-1 py-0.5 rounded bg-red-500/20 text-red-400 uppercase">
                      kritik
                    </span>
                  )}
                </p>
                {!item.ok && (
                  <p className="font-mono text-[10px] text-gray-700 mt-0.5">{item.hint}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-[rgba(0,255,247,0.06)]">
          {criticalFail.length > 0 && (
            <p className="font-mono text-[11px] text-red-400 mb-4">
              ✗ {criticalFail.length} kritik sorun var — düzeltilmeden yayınlanması önerilmez
            </p>
          )}
          {criticalFail.length === 0 && warnings.length > 0 && (
            <p className="font-mono text-[11px] text-[#C49A3C] mb-4">
              ! {warnings.length} uyarı mevcut — yayınlayabilirsiniz ama iyileştirilebilir
            </p>
          )}
          {criticalFail.length === 0 && warnings.length === 0 && (
            <p className="font-mono text-[11px] text-neon-cyan mb-4">
              ✓ Tüm kontroller geçildi — yayınlamaya hazır!
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-[rgba(0,255,247,0.15)] rounded-lg font-mono text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Geri Dön
            </button>
            <button
              type="button"
              onClick={onPublish}
              disabled={!canPublish}
              className="flex-1 px-4 py-2.5 rounded-lg font-mono text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: canPublish ? 'rgba(0,255,247,0.1)' : 'rgba(239,68,68,0.1)',
                border: `1px solid ${canPublish ? 'rgba(0,255,247,0.4)' : 'rgba(239,68,68,0.4)'}`,
                color: canPublish ? '#00fff7' : '#ef4444',
                boxShadow: canPublish ? '0 0 20px rgba(0,255,247,0.15)' : 'none',
              }}
            >
              {canPublish ? 'Yayınla' : 'Kritik Sorunları Gider'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
