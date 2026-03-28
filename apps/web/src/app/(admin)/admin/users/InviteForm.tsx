'use client';

import { useState } from 'react';
import { inviteUser } from './actions';

export function InviteForm() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'editor'>('editor');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    try {
      await inviteUser(email, role);
      setStatus('success');
      setMessage(`Davet gönderildi → ${email}`);
      setEmail('');
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Davet gönderilemedi');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <input
        type="email"
        value={email}
        onChange={(e) => { setEmail(e.target.value); setStatus('idle'); }}
        placeholder="ornek@mail.com"
        required
        className="flex-1 px-4 py-2.5 rounded-lg font-mono text-xs outline-none transition-all"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(196,154,60,0.15)',
          color: '#EDE8DF', caretColor: '#C49A3C',
        }}
        onFocus={(e) => { e.currentTarget.style.border = '1px solid rgba(196,154,60,0.4)'; }}
        onBlur={(e) => { e.currentTarget.style.border = '1px solid rgba(196,154,60,0.15)'; }}
      />

      {/* Rol seçimi */}
      <div className="flex gap-2">
        {(['editor', 'admin'] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className="px-3 py-2.5 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all"
            style={{
              background: role === r ? (r === 'admin' ? 'rgba(139,155,172,0.12)' : 'rgba(16,185,129,0.1)') : 'rgba(255,255,255,0.03)',
              border: role === r
                ? `1px solid ${r === 'admin' ? 'rgba(139,155,172,0.3)' : 'rgba(16,185,129,0.25)'}`
                : '1px solid rgba(196,154,60,0.08)',
              color: role === r ? (r === 'admin' ? '#8B9BAC' : '#10B981') : '#4b5563',
            }}
          >
            {r === 'admin' ? 'Admin' : 'Editör'}
          </button>
        ))}
      </div>

      <button
        type="submit"
        disabled={status === 'loading' || !email}
        className="px-5 py-2.5 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all"
        style={{
          background: status === 'loading' || !email ? 'rgba(196,154,60,0.05)' : 'rgba(196,154,60,0.12)',
          border: '1px solid rgba(196,154,60,0.25)',
          color: status === 'loading' || !email ? 'rgba(196,154,60,0.3)' : '#C49A3C',
          cursor: status === 'loading' || !email ? 'not-allowed' : 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        {status === 'loading' ? 'Gönderiliyor...' : '→ Davet Gönder'}
      </button>

      {message && (
        <p className="sm:col-span-full font-mono text-[10px] mt-1"
          style={{ color: status === 'success' ? '#10B981' : '#DC2626' }}>
          {status === 'success' ? '✓' : '✕'} {message}
        </p>
      )}
    </form>
  );
}
