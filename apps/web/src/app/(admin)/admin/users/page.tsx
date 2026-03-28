import type { Metadata } from 'next';
import { createAdminClient } from '@compario/database';
import { getAdminUser, canManageUsers } from '@/lib/admin-auth';
import { redirect } from 'next/navigation';
import { InviteForm } from './InviteForm';
import { UserRow } from './UserRow';

export const metadata: Metadata = { title: 'Kullanıcılar' };
export const dynamic = 'force-dynamic';

const ROLE_LABELS: Record<string, string> = {
  superadmin: 'Süper Admin',
  admin: 'Admin',
  editor: 'Editör',
};
const ROLE_COLORS: Record<string, string> = {
  superadmin: '#C49A3C',
  admin: '#8B9BAC',
  editor: '#10B981',
};

export default async function UsersPage() {
  const currentUser = await getAdminUser();
  if (!canManageUsers(currentUser)) redirect('/admin/dashboard');

  let users: Array<{
    id: string; email: string; role: string;
    created_at: string; last_sign_in_at: string | null; invited_at: string | null;
  }> = [];

  try {
    const admin = createAdminClient();
    const { data } = await admin.auth.admin.listUsers({ perPage: 100 });
    if (data) {
      users = data.users.map((u) => ({
        id: u.id,
        email: u.email ?? '',
        role: (u.user_metadata?.role as string) ?? 'editor',
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at ?? null,
        invited_at: (u as Record<string, unknown>).invited_at as string | null ?? null,
      }));
    }
  } catch { /* ignore */ }

  const fmt = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <div className="p-6 sm:p-8 max-w-4xl">
      {/* Başlık */}
      <div className="mb-8">
        <p className="font-mono text-[10px] text-neon-purple uppercase tracking-[0.3em] opacity-60 mb-1">Admin Panel</p>
        <h1 className="font-orbitron text-2xl font-black text-neon-cyan">KULLANICILAR</h1>
        <p className="font-mono text-xs text-gray-500 mt-1">Editör ve admin hesaplarını yönetin, davet gönderin.</p>
      </div>

      {/* Rol kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        {[
          { role: 'superadmin', desc: 'Tam erişim. Admin şifresiyle giriş.' },
          { role: 'admin',      desc: 'Tüm içerik + kullanıcı yönetimi.' },
          { role: 'editor',     desc: 'Sadece haber ekler / düzenler.' },
        ].map(({ role, desc }) => (
          <div key={role} className="p-4 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(196,154,60,0.07)' }}>
            <p className="font-orbitron text-[10px] font-bold mb-1" style={{ color: ROLE_COLORS[role] }}>
              {ROLE_LABELS[role]}
            </p>
            <p className="font-mono text-[10px] text-gray-600">{desc}</p>
          </div>
        ))}
      </div>

      {/* Davet formu */}
      <div className="mb-8 p-5 rounded-xl"
        style={{ background: 'rgba(196,154,60,0.03)', border: '1px solid rgba(196,154,60,0.1)' }}>
        <h2 className="font-orbitron text-xs font-bold text-neon-cyan mb-4 uppercase tracking-wider">
          + Yeni Kullanıcı Davet Et
        </h2>
        <InviteForm />
      </div>

      {/* Kullanıcı listesi */}
      <div>
        <h2 className="font-mono text-[10px] text-gray-600 uppercase tracking-widest mb-3">
          Kayıtlı Kullanıcılar ({users.length + 1})
        </h2>

        {/* Süper admin (statik satır) */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg mb-2"
          style={{ background: 'rgba(196,154,60,0.04)', border: '1px solid rgba(196,154,60,0.1)' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-orbitron text-xs font-black flex-shrink-0"
            style={{ background: 'rgba(196,154,60,0.1)', color: '#C49A3C', border: '1px solid rgba(196,154,60,0.2)' }}>
            ◆
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-mono text-xs text-white truncate">
              {process.env.ADMIN_EMAIL ?? 'admin@compario.tech'}
            </p>
            <p className="font-mono text-[10px] text-gray-600">Şifre ile giriş · Silinemez</p>
          </div>
          <span className="font-mono text-[10px] px-2.5 py-1 rounded-full flex-shrink-0"
            style={{ background: 'rgba(196,154,60,0.1)', color: '#C49A3C', border: '1px solid rgba(196,154,60,0.2)' }}>
            Süper Admin
          </span>
        </div>

        {users.length === 0 ? (
          <div className="py-10 text-center font-mono text-xs text-gray-700 rounded-xl"
            style={{ border: '1px solid rgba(196,154,60,0.06)' }}>
            Henüz davet edilmiş kullanıcı yok.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {users.map((u) => (
              <UserRow
                key={u.id}
                user={u}
                roleLabel={ROLE_LABELS[u.role] ?? u.role}
                roleColor={ROLE_COLORS[u.role] ?? '#6b7280'}
                joinedAt={fmt(u.created_at)}
                lastSeen={fmt(u.last_sign_in_at)}
                isPending={!u.last_sign_in_at}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
