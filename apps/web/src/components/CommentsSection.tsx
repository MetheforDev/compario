'use client';

import { useState, useTransition } from 'react';
import type { Comment } from '@compario/database';

interface CurrentUser {
  id: string;
  name: string | null;
  email: string;
}

interface CommentsSectionProps {
  entityType: 'news' | 'product';
  entityId: string;
  initialComments: Comment[];
  currentUser?: CurrentUser | null;
}

function HelpfulButton({ commentId, initial }: { commentId: string; initial: number }) {
  const [count, setCount] = useState(initial);
  const [voted, setVoted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    if (voted) return;
    startTransition(async () => {
      try {
        const res = await fetch(`/api/comments/${commentId}/helpful`, { method: 'POST' });
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
      className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-lg transition-all"
      style={{
        background: voted ? 'rgba(0,255,247,0.08)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${voted ? 'rgba(0,255,247,0.25)' : 'rgba(255,255,255,0.06)'}`,
        color: voted ? '#00fff7' : '#6b7280',
        cursor: voted ? 'default' : 'pointer',
      }}
    >
      <span>{voted ? '✓' : '↑'}</span>
      <span>Faydalı {count > 0 ? `(${count})` : ''}</span>
    </button>
  );
}

function CommentCard({ comment }: { comment: Comment }) {
  const date = new Date(comment.created_at).toLocaleDateString('tr-TR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  const initial = (comment.author_name ?? 'A')[0]?.toUpperCase();

  return (
    <div className="flex gap-3">
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center font-orbitron text-xs font-black flex-shrink-0 mt-0.5"
        style={{
          background: 'linear-gradient(135deg, rgba(0,255,247,0.15), rgba(183,36,255,0.15))',
          border: '1px solid rgba(0,255,247,0.2)',
          color: '#00fff7',
        }}
      >
        {initial}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="font-mono text-xs text-gray-300 font-medium">
            {comment.author_name ?? 'Anonim'}
          </span>
          <span className="font-mono text-[9px] text-gray-700">{date}</span>
        </div>
        <p className="font-mono text-sm text-gray-400 leading-relaxed mb-2">{comment.content}</p>
        <HelpfulButton commentId={comment.id} initial={comment.helpful_count} />
      </div>
    </div>
  );
}

function CommentForm({
  entityType,
  entityId,
  currentUser,
  onSuccess,
}: {
  entityType: string;
  entityId: string;
  currentUser?: CurrentUser | null;
  onSuccess: (comment: Comment) => void;
}) {
  const [content, setContent] = useState('');
  const [name, setName] = useState(currentUser?.name ?? '');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || content.trim().length < 2) {
      setErrorMsg('Yorum en az 2 karakter olmalı');
      return;
    }
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity_type: entityType,
          entity_id: entityId,
          content: content.trim(),
          author_name: name.trim() || null,
        }),
      });
      const data = await res.json() as { error?: string; comment?: Comment };
      if (!res.ok) throw new Error(data.error ?? 'Hata');
      setStatus('done');
      setContent('');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gönderilemedi');
      setStatus('error');
    }
  };

  if (status === 'done') {
    return (
      <div className="rounded-xl p-4 text-center"
        style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.2)' }}>
        <p className="font-mono text-sm text-green-400 font-medium">Yorumunuz alındı!</p>
        <p className="font-mono text-[10px] text-gray-600 mt-0.5">Moderasyon sonrası yayınlanacak.</p>
        <button
          onClick={() => setStatus('idle')}
          className="font-mono text-[10px] text-gray-600 hover:text-gray-400 mt-2 underline"
        >
          Yeni yorum yaz
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* User info row */}
      {currentUser ? (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
          style={{ background: 'rgba(0,255,247,0.04)', border: '1px solid rgba(0,255,247,0.1)' }}>
          <div className="w-6 h-6 rounded-full flex items-center justify-center font-orbitron text-[10px] font-black"
            style={{ background: 'rgba(0,255,247,0.15)', color: '#00fff7', border: '1px solid rgba(0,255,247,0.3)' }}>
            {(currentUser.name ?? currentUser.email)[0].toUpperCase()}
          </div>
          <p className="font-mono text-xs text-gray-400">
            <span className="text-gray-300">{currentUser.name ?? currentUser.email.split('@')[0]}</span>
            <span className="text-gray-600 ml-1">olarak yorum yapıyorsun</span>
          </p>
        </div>
      ) : (
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Adınız (opsiyonel)"
          maxLength={60}
          className="w-full rounded-lg px-3 py-2 font-mono text-sm text-gray-300 placeholder-gray-700 focus:outline-none transition-colors"
          style={{ background: '#0a0a14', border: '1px solid rgba(0,255,247,0.08)' }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(0,255,247,0.25)'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(0,255,247,0.08)'; }}
        />
      )}

      {/* Textarea */}
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Düşüncelerinizi paylaşın..."
          rows={3}
          maxLength={2000}
          className="w-full rounded-xl px-4 py-3 font-mono text-sm text-gray-300 placeholder-gray-700 resize-none focus:outline-none transition-colors"
          style={{ background: '#0a0a14', border: '1px solid rgba(0,255,247,0.08)' }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(0,255,247,0.25)'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(0,255,247,0.08)'; }}
        />
        <p className="font-mono text-[9px] text-gray-700 absolute bottom-2 right-3">{content.length}/2000</p>
      </div>

      {errorMsg && <p className="font-mono text-xs text-red-400">{errorMsg}</p>}

      <div className="flex items-center justify-between">
        {!currentUser && (
          <p className="font-mono text-[9px] text-gray-700">
            <a href="/giris" className="text-neon-cyan hover:opacity-80">Giriş yap</a> — yorumun adınla görünsün
          </p>
        )}
        <button
          type="submit"
          disabled={status === 'loading'}
          className="ml-auto px-5 py-2 rounded-lg font-mono text-xs uppercase tracking-wider transition-all disabled:opacity-50"
          style={{
            background: 'rgba(0,255,247,0.08)',
            border: '1px solid rgba(0,255,247,0.25)',
            color: '#00fff7',
          }}
        >
          {status === 'loading' ? 'Gönderiliyor...' : 'Gönder'}
        </button>
      </div>
    </form>
  );
}

export function CommentsSection({
  entityType,
  entityId,
  initialComments,
  currentUser,
}: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [showForm, setShowForm] = useState(false);

  return (
    <section
      className="rounded-2xl overflow-hidden"
      style={{ border: '1px solid rgba(0,255,247,0.08)', background: '#0a0a14' }}
    >
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between gap-4"
        style={{ borderBottom: '1px solid rgba(0,255,247,0.06)', background: '#0d0d1a' }}>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[9px] text-neon-cyan opacity-50">⬡</span>
          <h2 className="font-orbitron text-[10px] uppercase tracking-[0.3em] text-neon-cyan opacity-70">
            Yorumlar
          </h2>
          {comments.length > 0 && (
            <span className="font-mono text-[9px] px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(0,255,247,0.08)', color: 'rgba(0,255,247,0.5)', border: '1px solid rgba(0,255,247,0.15)' }}>
              {comments.length}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="font-mono text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all"
          style={{
            background: showForm ? 'rgba(0,255,247,0.12)' : 'rgba(0,255,247,0.06)',
            border: '1px solid rgba(0,255,247,0.2)',
            color: '#00fff7',
          }}
        >
          {showForm ? '✕ İptal' : '+ Yorum Yaz'}
        </button>
      </div>

      <div className="px-6 py-5 space-y-5">
        {/* Form */}
        {showForm && (
          <div className="rounded-xl p-4"
            style={{ background: '#0d0d1a', border: '1px solid rgba(0,255,247,0.08)' }}>
            <CommentForm
              entityType={entityType}
              entityId={entityId}
              currentUser={currentUser}
              onSuccess={() => setShowForm(false)}
            />
          </div>
        )}

        {/* List */}
        {comments.length === 0 ? (
          <div className="py-10 text-center">
            <p className="font-mono text-sm text-gray-600 mb-1">Henüz yorum yok</p>
            <p className="font-mono text-[10px] text-gray-700">İlk yorumu sen yaz!</p>
          </div>
        ) : (
          <div className="space-y-5 divide-y divide-[rgba(255,255,255,0.03)]">
            {comments.map((c) => (
              <div key={c.id} className="pt-5 first:pt-0">
                <CommentCard comment={c} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
