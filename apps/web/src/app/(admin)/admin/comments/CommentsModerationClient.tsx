'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Comment } from '@compario/database';

const STATUS_TABS = [
  { key: 'pending',  label: 'Bekleyen',   color: '#C49A3C' },
  { key: 'approved', label: 'Onaylanan',  color: '#22c55e' },
  { key: 'rejected', label: 'Reddedilen', color: '#ef4444' },
] as const;

const TYPE_FILTERS = [
  { key: '',        label: 'Tümü' },
  { key: 'news',    label: 'Haberler' },
  { key: 'product', label: 'Ürünler' },
];

function CommentRow({ comment, onStatusChange, onDelete }: {
  comment: Comment;
  onStatusChange: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const date = new Date(comment.created_at).toLocaleDateString('tr-TR', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  const handleStatus = (status: string) => {
    startTransition(async () => {
      await fetch(`/api/comments/${comment.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      onStatusChange(comment.id);
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      await fetch(`/api/comments/${comment.id}/status`, { method: 'DELETE' });
      onDelete(comment.id);
    });
  };

  const entityLabel = comment.entity_type === 'news' ? '▶ Haber' : '◈ Ürün';
  const entityColor = comment.entity_type === 'news' ? 'rgba(183,36,255,0.6)' : 'rgba(0,255,247,0.6)';

  return (
    <div
      className="rounded-xl p-4 transition-opacity"
      style={{ background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.04)', opacity: isPending ? 0.5 : 1 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="flex-1 min-w-0">
          {/* Meta */}
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded"
              style={{ background: 'rgba(255,255,255,0.04)', color: entityColor, border: `1px solid ${entityColor}30` }}>
              {entityLabel}
            </span>
            <span className="font-mono text-xs text-gray-300 font-medium">
              {comment.author_name ?? 'Anonim'}
            </span>
            {comment.author_email && (
              <span className="font-mono text-[10px] text-gray-700">{comment.author_email}</span>
            )}
            <span className="font-mono text-[10px] text-gray-700">{date}</span>
            {comment.helpful_count > 0 && (
              <span className="font-mono text-[10px] text-gray-600">↑ {comment.helpful_count}</span>
            )}
          </div>
          <p className="font-mono text-sm text-gray-400 leading-relaxed mb-1">{comment.content}</p>
          <p className="font-mono text-[10px] text-gray-700">
            ID: {comment.entity_id.slice(0, 8)}...
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
          {comment.status !== 'approved' && (
            <button
              onClick={() => handleStatus('approved')}
              disabled={isPending}
              className="px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-wider"
              style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e' }}
            >
              Onayla
            </button>
          )}
          {comment.status !== 'rejected' && (
            <button
              onClick={() => handleStatus('rejected')}
              disabled={isPending}
              className="px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-wider"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444' }}
            >
              Reddet
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-wider"
            style={{ background: 'rgba(107,114,128,0.08)', border: '1px solid rgba(107,114,128,0.2)', color: '#6b7280' }}
          >
            Sil
          </button>
        </div>
      </div>
    </div>
  );
}

interface Props {
  comments: Comment[];
  activeStatus: string;
  activeType?: string;
}

export function CommentsModerationClient({ comments: initial, activeStatus, activeType }: Props) {
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>(initial);

  const remove = (id: string) => setComments((prev) => prev.filter((c) => c.id !== id));

  const pushFilter = (params: Record<string, string>) => {
    const sp = new URLSearchParams({ status: activeStatus, ...(activeType ? { type: activeType } : {}), ...params });
    router.push(`/admin/comments?${sp.toString()}`);
  };

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="font-orbitron text-xl font-black text-white mb-1">Yorum Moderasyonu</h1>
        <p className="font-mono text-xs text-gray-600">Haber ve ürün yorumlarını yönet</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Status tabs */}
        <div className="flex gap-2">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => pushFilter({ status: tab.key })}
              className="px-4 py-2 rounded-xl font-mono text-xs uppercase tracking-wider transition-all"
              style={{
                background: activeStatus === tab.key ? `rgba(${tab.key === 'approved' ? '34,197,94' : tab.key === 'rejected' ? '239,68,68' : '196,154,60'},0.12)` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${activeStatus === tab.key ? tab.color + '55' : 'rgba(255,255,255,0.08)'}`,
                color: activeStatus === tab.key ? tab.color : '#6b7280',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {/* Type filter */}
        <div className="flex gap-2 ml-auto">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => pushFilter({ type: f.key })}
              className="px-3 py-2 rounded-xl font-mono text-[10px] uppercase tracking-wider transition-all"
              style={{
                background: (activeType ?? '') === f.key ? 'rgba(0,255,247,0.1)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${(activeType ?? '') === f.key ? 'rgba(0,255,247,0.3)' : 'rgba(255,255,255,0.06)'}`,
                color: (activeType ?? '') === f.key ? '#00fff7' : '#6b7280',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {comments.length === 0 ? (
        <div className="rounded-xl p-12 text-center"
          style={{ background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.04)' }}>
          <p className="font-orbitron text-sm text-gray-600">Bu kategoride yorum yok</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="font-mono text-[10px] text-gray-700 uppercase tracking-wider mb-4">{comments.length} yorum</p>
          {comments.map((comment) => (
            <CommentRow
              key={comment.id}
              comment={comment}
              onStatusChange={remove}
              onDelete={remove}
            />
          ))}
        </div>
      )}
    </div>
  );
}
