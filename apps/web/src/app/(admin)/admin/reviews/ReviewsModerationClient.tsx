'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Review } from '@compario/database';

const STATUS_TABS = [
  { key: 'pending',  label: 'Bekleyen',   color: '#C49A3C' },
  { key: 'approved', label: 'Onaylanan',  color: '#22c55e' },
  { key: 'rejected', label: 'Reddedilen', color: '#ef4444' },
] as const;

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span className="inline-flex text-sm">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ color: s <= rating ? '#C49A3C' : 'rgba(255,255,255,0.1)' }}>★</span>
      ))}
    </span>
  );
}

function ReviewRow({ review, onStatusChange, onDelete }: {
  review: Review;
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const date = new Date(review.created_at).toLocaleDateString('tr-TR', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  const handleStatus = (status: string) => {
    startTransition(async () => {
      await fetch(`/api/reviews/${review.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      onStatusChange(review.id, status);
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      await fetch(`/api/reviews/${review.id}/status`, { method: 'DELETE' });
      onDelete(review.id);
    });
  };

  return (
    <div
      className="rounded-xl p-5 transition-opacity"
      style={{
        background: '#0d0d1a',
        border: '1px solid rgba(196,154,60,0.08)',
        opacity: isPending ? 0.5 : 1,
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <StarDisplay rating={review.rating} />
            <span className="font-mono text-xs text-gray-400 font-medium">
              {review.reviewer_name ?? 'Anonim'}
            </span>
            {review.reviewer_email && (
              <span className="font-mono text-[10px] text-gray-700">{review.reviewer_email}</span>
            )}
            <span className="font-mono text-[10px] text-gray-700">{date}</span>
            {review.helpful_count > 0 && (
              <span className="font-mono text-[10px] text-gray-600">↑ {review.helpful_count}</span>
            )}
          </div>
          <p className="font-mono text-sm text-gray-400 leading-relaxed mb-1">{review.comment}</p>
          <p className="font-mono text-[10px] text-gray-700">
            Ürün ID: {review.product_id.slice(0, 8)}...
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
          {review.status !== 'approved' && (
            <button
              onClick={() => handleStatus('approved')}
              disabled={isPending}
              className="px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all"
              style={{
                background: 'rgba(34,197,94,0.1)',
                border: '1px solid rgba(34,197,94,0.3)',
                color: '#22c55e',
              }}
            >
              Onayla
            </button>
          )}
          {review.status !== 'rejected' && (
            <button
              onClick={() => handleStatus('rejected')}
              disabled={isPending}
              className="px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all"
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.25)',
                color: '#ef4444',
              }}
            >
              Reddet
            </button>
          )}
          {review.status === 'pending' && (
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all"
              style={{
                background: 'rgba(107,114,128,0.08)',
                border: '1px solid rgba(107,114,128,0.2)',
                color: '#6b7280',
              }}
            >
              Sil
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface Props {
  reviews: Review[];
  activeStatus: string;
}

export function ReviewsModerationClient({ reviews: initial, activeStatus }: Props) {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>(initial);

  const handleStatusChange = (id: string, status: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
    void status; // status change removes from current list
    router.refresh();
  };

  const handleDelete = (id: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-orbitron text-xl font-black text-white mb-1">Yorum Moderasyonu</h1>
        <p className="font-mono text-xs text-gray-600">Kullanıcı yorumlarını onayla veya reddet</p>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => router.push(`/admin/reviews?status=${tab.key}`)}
            className="px-4 py-2 rounded-xl font-mono text-xs uppercase tracking-wider transition-all"
            style={{
              background: activeStatus === tab.key ? `rgba(${tab.key === 'approved' ? '34,197,94' : tab.key === 'rejected' ? '239,68,68' : '196,154,60'},0.12)` : 'rgba(255,255,255,0.04)',
              border: `1px solid ${activeStatus === tab.key ? `rgba(${tab.key === 'approved' ? '34,197,94' : tab.key === 'rejected' ? '239,68,68' : '196,154,60'},0.35)` : 'rgba(255,255,255,0.08)'}`,
              color: activeStatus === tab.key ? tab.color : '#6b7280',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reviews */}
      {reviews.length === 0 ? (
        <div
          className="rounded-xl p-12 text-center"
          style={{ background: '#0d0d1a', border: '1px solid rgba(196,154,60,0.08)' }}
        >
          <p className="font-orbitron text-sm text-gray-600">Bu kategoride yorum yok</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="font-mono text-[10px] text-gray-700 uppercase tracking-wider mb-4">
            {reviews.length} yorum
          </p>
          {reviews.map((review) => (
            <ReviewRow
              key={review.id}
              review={review}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
