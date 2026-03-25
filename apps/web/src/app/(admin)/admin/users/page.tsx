import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Kullanıcılar' };

const ROADMAP = [
  { step: '01', label: 'Login Sistemi', desc: 'E-posta + şifre ile güvenli admin girişi', done: false },
  { step: '02', label: 'Kullanıcı Rolleri', desc: 'Süper Admin · Editör · Yazar · Okuyucu', done: false },
  { step: '03', label: 'Editör Paneli', desc: 'Editörler sadece haber yönetebilir', done: false },
  { step: '04', label: 'Davet Sistemi', desc: 'E-posta ile editör/yazar davet et', done: false },
];

export default function UsersPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-10">
        <p className="font-mono text-[10px] text-neon-purple uppercase tracking-[0.4em] opacity-60 mb-1">
          Admin
        </p>
        <h1 className="font-orbitron text-3xl font-black text-neon-cyan text-glow-cyan">
          KULLANICILAR
        </h1>
        <p className="font-mono text-xs text-gray-600 mt-1">
          Yazarlar, editörler ve yöneticiler
        </p>
      </div>

      {/* Coming soon card */}
      <div className="max-w-2xl">
        <div className="border border-[rgba(183,36,255,0.2)] rounded-xl p-8 bg-[rgba(183,36,255,0.03)] text-center mb-8">
          <div
            className="w-16 h-16 rounded-full border-2 border-neon-purple flex items-center justify-center mx-auto mb-4 font-orbitron text-2xl text-neon-purple"
            style={{ boxShadow: '0 0 30px rgba(183,36,255,0.3)' }}
          >
            ◎
          </div>
          <h2 className="font-orbitron text-lg font-black text-white mb-2">
            Kullanıcı Yönetimi
          </h2>
          <p className="font-mono text-xs text-gray-500 leading-relaxed mb-2">
            Bu bölüm login sistemi kurulduktan sonra aktif olacak.
          </p>
          <p className="font-mono text-xs text-gray-600">
            Yazarlar ve editörler kullanıcı adı + şifre ile giriş yapabilecek,
            sadece yetkili oldukları bölümlere erişebilecekler.
          </p>
        </div>

        {/* Roadmap */}
        <div>
          <p className="font-mono text-[10px] text-gray-600 uppercase tracking-widest mb-4">
            ⬡ Yol Haritası
          </p>
          <div className="space-y-3">
            {ROADMAP.map((item) => (
              <div
                key={item.step}
                className="flex items-start gap-4 p-4 border border-[rgba(0,255,247,0.06)] rounded-lg bg-[rgba(0,255,247,0.01)]"
              >
                <div className="font-orbitron text-xs font-black text-gray-700 w-8 flex-shrink-0 mt-0.5">
                  {item.step}
                </div>
                <div>
                  <p className="font-mono text-xs text-gray-400 font-semibold mb-0.5">{item.label}</p>
                  <p className="font-mono text-[11px] text-gray-600">{item.desc}</p>
                </div>
                <div className="ml-auto flex-shrink-0">
                  <span className="font-mono text-[10px] text-yellow-500 border border-yellow-500/20 bg-yellow-500/10 px-2 py-0.5 rounded uppercase tracking-wider">
                    Yakında
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[rgba(0,255,247,0.06)]">
          <p className="font-mono text-[10px] text-gray-700 mb-3">
            Şimdilik Supabase üzerinden kullanıcı ekleyebilirsiniz:
          </p>
          <Link
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 border border-[rgba(0,255,247,0.15)] rounded font-mono text-xs text-gray-500 hover:text-neon-cyan hover:border-neon-cyan/40 transition-colors"
          >
            <span>Supabase Dashboard</span>
            <span className="opacity-50">↗</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
