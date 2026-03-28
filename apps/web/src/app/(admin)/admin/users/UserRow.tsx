'use client';

import { useState } from 'react';
import { changeUserRole, deleteUser } from './actions';

interface Props {
  user: { id: string; email: string; role: string };
  roleLabel: string;
  roleColor: string;
  joinedAt: string;
  lastSeen: string;
  isPending: boolean;
}

export function UserRow({ user, roleLabel, roleColor, joinedAt, lastSeen, isPending }: Props) {
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleRoleChange = async (newRole: 'admin' | 'editor') => {
    if (newRole === user.role) return;
    setLoading(true);
    try { await changeUserRole(user.id, newRole); }
    catch (e) { alert(e instanceof Error ? e.message : 'Hata'); }
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setLoading(true);
    try { await deleteUser(user.id); }
    catch (e) { alert(e instanceof Error ? e.message : 'Hata'); setLoading(false); }
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-lg group"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(196,154,60,0.06)' }}>
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs flex-shrink-0"
        style={{ background: `${roleColor}15`, color: roleColor, border: `1px solid ${roleColor}30` }}>
        {user.email[0].toUpperCase()}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-mono text-xs text-white truncate">{user.email}</p>
          {isPending && (
            <span className="font-mono text-[9px] px-1.5 py-0.5 rounded"
              style={{ background: 'rgba(234,179,8,0.1)', color: '#EAB308', border: '1px solid rgba(234,179,8,0.2)' }}>
              Davet bekleniyor
            </span>
          )}
        </div>
        <p className="font-mono text-[10px] text-gray-600">
          Katıldı: {joinedAt} · Son giriş: {lastSeen}
        </p>
      </div>

      {/* Role badge */}
      <span className="font-mono text-[10px] px-2.5 py-1 rounded-full flex-shrink-0 hidden sm:block"
        style={{ background: `${roleColor}15`, color: roleColor, border: `1px solid ${roleColor}30` }}>
        {roleLabel}
      </span>

      {/* Actions — visible on hover */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {/* Role toggle */}
        <button
          disabled={loading}
          onClick={() => handleRoleChange(user.role === 'admin' ? 'editor' : 'admin')}
          className="px-2 py-1 rounded font-mono text-[9px] uppercase tracking-wider transition-all opacity-0 group-hover:opacity-100"
          style={{
            background: 'rgba(139,155,172,0.08)',
            border: '1px solid rgba(139,155,172,0.15)',
            color: '#8B9BAC',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
          title={user.role === 'admin' ? 'Editöre düşür' : 'Admin yap'}
        >
          {user.role === 'admin' ? '↓ Editör' : '↑ Admin'}
        </button>

        {/* Delete */}
        <button
          disabled={loading}
          onClick={handleDelete}
          className="px-2 py-1 rounded font-mono text-[9px] uppercase tracking-wider transition-all opacity-0 group-hover:opacity-100"
          style={{
            background: confirmDelete ? 'rgba(220,38,38,0.15)' : 'rgba(220,38,38,0.05)',
            border: confirmDelete ? '1px solid rgba(220,38,38,0.4)' : '1px solid rgba(220,38,38,0.1)',
            color: confirmDelete ? '#DC2626' : 'rgba(220,38,38,0.5)',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
          onBlur={() => setConfirmDelete(false)}
          title="Kullanıcıyı sil"
        >
          {confirmDelete ? 'Emin misin?' : '✕ Sil'}
        </button>
      </div>
    </div>
  );
}
