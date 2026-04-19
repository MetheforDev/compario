'use client';

import { useState, useTransition } from 'react';
import type { Review, RatingSummary } from '@compario/database';

interface CurrentUser {
  id: string;
  name: string | null;
  email: string;
}

interface ProductReviewsProps {
  productId: string;
  initialReviews: Review[];
  initialSummary: RatingSummary;
  currentUser?: CurrentUser | null;
}

function StarSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="text-2xl transition-transform hover:scale-110 focus:outline-none"
          aria-label={`${star} yıldız`}
        >
          <span style={{ color: star <= (hover || value) ? '#C49A3C' : 'rgba(255,255,255,0.15)' }}>
            ★
          </span>
        </button>
      ))}
      {value > 0 && (
        <span className="font-mono text-xs text-gray-500 ml-2">
          {['', 'Çok kötü', 'Kötü', 'Orta', 'İyi', 'Mükemmel'][value]}
        </span>
      )}
    </div>
  );
}

function StarDisplay({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const px = size === 'lg' ? 'text-2xl' : 'text-sm';
  return (
    <span className={`inline-flex ${px}`} aria-label={`${rating} yıldız`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ color: s <= Math.round(rating) ? '#C49A3C' : 'rgba(255,255,255,0.15)' }}>★</span>
      ))}
    </span>
  );
}

function RatingBar({ label, count, total }: { label: number; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="font-mono text-gray-500 w-4 text-right flex-shrink-0">{label}</span>
      <span style={{ color: '#C49A3C', fontSize: '10px' }}>★</span>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #C49A3C, #e5c77a)' }}
        />
      </div>
      <span className="font-mono text-gray-600 w-4 flex-shrink-0">{count}</span>
    </div>
  );
}

function HelpfulButton({ reviewId, initial }: { reviewId: string; initial: number }) {
  const [count, setCount] = useState(initial);
  const [voted, setVoted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    if (voted) return;
    startTransition(async () => {
      try {
        const res = await fetch(`/api/reviews/${reviewId}/helpful`, { method: 'POST' });
        if (res.ok) {
          const data = await res.json() as { helpful_count: number };
          setCount(data.helpful_count);
          setVoted(true);
        }
      } catch { /* silent */ }
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={voted || isPending}
      className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded transition-all"
      style={{
        background: voted ? 'rgba(196,154,60,0.1)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${voted ? 'rgba(196,154,60,0.3)' : 'rgba(255,255,255,0.06)'}`,
        color: voted ? '#C49A3C' : '#6b7280',
        cursor: voted ? 'default' : 'pointer',
      }}
    >
      <span>{voted ? '✓' : '↑'}</span>
      <span>Faydalı {count > 0 ? `(${count})` : ''}</span>
    </button>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const date = new Date(review.created_at).toLocaleDateString('tr-TR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div
      className="rounded-xl p-5"
      style={{ background: '#0d0d1a', border: '1px solid rgba(196,154,60,0.08)' }}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-orbitron text-xs font-black flex-shrink-0"
            style={{ background: 'rgba(196,154,60,0.12)', color: '#C49A3C', border: '1px solid rgba(196,154,60,0.2)' }}
          >
            {(review.reviewer_name ?? 'A')[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-mono text-xs text-gray-300 font-medium">
              {review.reviewer_name ?? 'Anonim Kullanıcı'}
            </p>
            <p className="font-mono text-[10px] text-gray-700">{date}</p>
          </div>
        </div>
        <StarDisplay rating={review.rating} />
      </div>
      <p className="font-mono text-sm text-gray-400 leading-relaxed mb-4">{review.comment}</p>
      <HelpfulButton reviewId={review.id} initial={review.helpful_count} />
    </div>
  );
}

function ReviewForm({ productId, onSuccess, currentUser }: { productId: string; onSuccess: () => void; currentUser?: CurrentUser | null }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [name, setName] = useState(currentUser?.name ?? '');
  const [email, setEmail] = useState(currentUser?.email ?? '');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { setErrorMsg('Lütfen bir puan seçin'); return; }
    if (!comment.trim() || comment.trim().length < 10) { setErrorMsg('Yorum en az 10 karakter olmalı'); return; }

    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, rating, comment, reviewer_name: name || null, reviewer_email: email || null }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Hata');
      setStatus('done');
      onSuccess();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Yorum gönderilemedi');
      setStatus('error');
    }
  };

  if (status === 'done') {
    return (
      <div
        className="rounded-xl p-6 text-center"
        style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.2)' }}
      >
        <p className="font-orbitron text-sm text-green-400 font-bold mb-1">Yorumunuz alındı!</p>
        <p className="font-mono text-xs text-gray-500">Moderasyon sonrası yayınlanacak.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-mono text-[10px] uppercase tracking-wider text-gray-600 mb-2">
          Puanınız <span className="text-red-500">*</span>
        </label>
        <StarSelector value={rating} onChange={setRating} />
      </div>

      <div>
        <label className="block font-mono text-[10px] uppercase tracking-wider text-gray-600 mb-2">
          Yorumunuz <span className="text-red-500">*</span>
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Bu ürün hakkında deneyiminizi paylaşın..."
          rows={4}
          maxLength={1000}
          className="w-full rounded-lg px-4 py-3 font-mono text-sm text-gray-300 placeholder-gray-700 resize-none focus:outline-none transition-colors"
          style={{
            background: '#0a0a14',
            border: '1px solid rgba(196,154,60,0.15)',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(196,154,60,0.4)'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(196,154,60,0.15)'; }}
        />
        <p className="font-mono text-[10px] text-gray-700 mt-1 text-right">{comment.length}/1000</p>
      </div>

      {currentUser ? (
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg"
          style={{ background: 'rgba(0,255,247,0.04)', border: '1px solid rgba(0,255,247,0.1)' }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center font-orbitron text-xs font-black flex-shrink-0"
            style={{ background: 'rgba(0,255,247,0.15)', color: '#00fff7', border: '1px solid rgba(0,255,247,0.3)' }}>
            {(currentUser.name ?? currentUser.email)[0].toUpperCase()}
          </div>
          <div>
            <p className="font-mono text-xs text-gray-300">{currentUser.name ?? currentUser.email.split('@')[0]}</p>
            <p className="font-mono text-[9px] text-gray-600">Hesabınla yorum yapıyorsun</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-gray-600 mb-2">
              İsim <span className="text-gray-700">(opsiyonel)</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Adınız"
              maxLength={60}
              className="w-full rounded-lg px-4 py-2.5 font-mono text-sm text-gray-300 placeholder-gray-700 focus:outline-none transition-colors"
              style={{ background: '#0a0a14', border: '1px solid rgba(196,154,60,0.15)' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(196,154,60,0.4)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(196,154,60,0.15)'; }}
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-gray-600 mb-2">
              E-posta <span className="text-gray-700">(opsiyonel, gizli)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@mail.com"
              maxLength={120}
              className="w-full rounded-lg px-4 py-2.5 font-mono text-sm text-gray-300 placeholder-gray-700 focus:outline-none transition-colors"
              style={{ background: '#0a0a14', border: '1px solid rgba(196,154,60,0.15)' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(196,154,60,0.4)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(196,154,60,0.15)'; }}
            />
          </div>
        </div>
      )}

      {errorMsg && (
        <p className="font-mono text-xs text-red-400">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider transition-all disabled:opacity-60"
        style={{
          background: 'linear-gradient(135deg, rgba(196,154,60,0.15), rgba(196,154,60,0.08))',
          border: '1px solid rgba(196,154,60,0.35)',
          color: '#C49A3C',
        }}
      >
        {status === 'loading' ? (
          <>
            <span className="inline-block w-3 h-3 border-2 border-neon-gold/30 border-t-neon-gold rounded-full animate-spin" />
            <span>Gönderiliyor...</span>
          </>
        ) : (
          <span>Yorumu Gönder</span>
        )}
      </button>
    </form>
  );
}

export function ProductReviews({ productId, initialReviews, initialSummary, currentUser }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [showForm, setShowForm] = useState(false);
  const summary = initialSummary;

  return (
    <section className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(196,154,60,0.1)', background: '#0a0a14' }}>
      {/* Header */}
      <div className="px-6 py-5 border-b" style={{ borderColor: 'rgba(196,154,60,0.08)', background: '#0d0d18' }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h2 className="font-orbitron text-[10px] uppercase tracking-[0.3em] text-neon-cyan opacity-70">
            ⬡ Kullanıcı Yorumları
          </h2>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="font-mono text-xs uppercase tracking-wider px-4 py-2 rounded-lg transition-all"
            style={{
              background: showForm ? 'rgba(196,154,60,0.15)' : 'rgba(196,154,60,0.08)',
              border: '1px solid rgba(196,154,60,0.25)',
              color: '#C49A3C',
            }}
          >
            {showForm ? '✕ İptal' : '+ Yorum Yaz'}
          </button>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Rating Summary */}
        {summary.count > 0 && (
          <div className="flex flex-col sm:flex-row gap-6 pb-6 border-b" style={{ borderColor: 'rgba(196,154,60,0.08)' }}>
            <div className="flex flex-col items-center justify-center gap-1 sm:w-32 flex-shrink-0">
              <span className="font-orbitron text-4xl font-black" style={{ color: '#C49A3C' }}>
                {summary.average.toFixed(1)}
              </span>
              <StarDisplay rating={summary.average} size="lg" />
              <span className="font-mono text-[10px] text-gray-600">{summary.count} yorum</span>
            </div>
            <div className="flex-1 space-y-2">
              {([5, 4, 3, 2, 1] as const).map((star) => (
                <RatingBar key={star} label={star} count={summary.distribution[star]} total={summary.count} />
              ))}
            </div>
          </div>
        )}

        {/* Review Form */}
        {showForm && (
          <div
            className="rounded-xl p-5"
            style={{ background: '#0d0d1a', border: '1px solid rgba(196,154,60,0.12)' }}
          >
            <p className="font-orbitron text-xs font-bold text-gray-400 mb-4 uppercase tracking-wider">
              Yorum Yaz
            </p>
            <ReviewForm
              productId={productId}
              currentUser={currentUser}
              onSuccess={() => {
                setShowForm(false);
              }}
            />
          </div>
        )}

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="py-10 text-center">
            <p className="font-orbitron text-xs text-gray-600 mb-1">Henüz yorum yok</p>
            <p className="font-mono text-[11px] text-gray-700">Bu ürünü deneyenler için ilk yorumu sen yaz!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
