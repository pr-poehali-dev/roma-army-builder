import { useState, useEffect, useCallback } from 'react';
import { User, AdminUser, adminGetUsers, adminBanUser, adminUnbanUser, adminSetRole } from '@/lib/api';

interface Props {
  currentUser: User;
  onClose: () => void;
}

const ROLE_LABELS: Record<string, string> = {
  player: '👤 Игрок',
  admin: '🛡️ Админ',
  creator: '👑 Создатель',
};

const ROLE_COLORS: Record<string, string> = {
  player: 'text-gray-400',
  admin: 'text-blue-400',
  creator: 'rarity-legendary',
};

export default function AdminPanel({ currentUser, onClose }: Props) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [banReason, setBanReason] = useState('');
  const [banTarget, setBanTarget] = useState<AdminUser | null>(null);
  const [msg, setMsg] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const list = await adminGetUsers();
      setUsers(list);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const handleBan = async (u: AdminUser) => {
    if (!banReason.trim()) { setBanTarget(u); return; }
    try {
      await adminBanUser(u.id, banReason);
      flash(`${u.name} заблокирован`);
      setBanTarget(null);
      setBanReason('');
      fetchUsers();
    } catch (e: unknown) {
      flash(e instanceof Error ? e.message : 'Ошибка');
    }
  };

  const handleUnban = async (u: AdminUser) => {
    try {
      await adminUnbanUser(u.id);
      flash(`${u.name} разблокирован`);
      fetchUsers();
    } catch (e: unknown) {
      flash(e instanceof Error ? e.message : 'Ошибка');
    }
  };

  const handleRole = async (u: AdminUser, newRole: string) => {
    try {
      await adminSetRole(u.id, newRole);
      flash(`Роль ${u.name} изменена на ${newRole}`);
      fetchUsers();
    } catch (e: unknown) {
      flash(e instanceof Error ? e.message : 'Ошибка');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: 'rgba(0,0,0,0.9)' }}>
      <div className="min-h-screen px-3 py-4">
        <div className="max-w-2xl mx-auto animate-pixel-enter">

          {/* Header */}
          <div className="pixel-card pixel-border-legendary mb-4 flex items-center justify-between">
            <div>
              <p className="font-pixel text-[10px] rarity-legendary">👑 ПАНЕЛЬ УПРАВЛЕНИЯ</p>
              <p className="font-pixel text-[6px] mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
                {currentUser.email} • {ROLE_LABELS[currentUser.role]}
              </p>
            </div>
            <button className="pixel-btn pixel-btn-red text-[8px]" style={{ padding: '8px 12px' }} onClick={onClose}>✕ ЗАКРЫТЬ</button>
          </div>

          {/* Flash message */}
          {msg && (
            <div className="pixel-card pixel-border-gold mb-4 text-center" style={{ padding: '10px' }}>
              <p className="font-pixel text-[8px] text-amber-400">{msg}</p>
            </div>
          )}

          {/* Ban dialog */}
          {banTarget && (
            <div className="pixel-card pixel-border-gold mb-4" style={{ padding: '12px' }}>
              <p className="font-pixel text-[8px] text-amber-400 mb-3">⛔ БАН: {banTarget.name}</p>
              <input
                className="w-full mb-3 font-pixel text-[8px] text-amber-400 bg-transparent"
                style={{ border: '2px solid hsl(var(--border))', padding: '8px', outline: 'none' }}
                placeholder="Причина блокировки..."
                value={banReason}
                onChange={e => setBanReason(e.target.value)}
              />
              <div className="flex gap-2">
                <button className="pixel-btn pixel-btn-red flex-1" onClick={() => handleBan(banTarget)}>⛔ ЗАБЛОКИРОВАТЬ</button>
                <button className="pixel-btn flex-1" onClick={() => { setBanTarget(null); setBanReason(''); }}>ОТМЕНА</button>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              ['👤', 'Игроков', users.filter(u => u.role === 'player').length],
              ['⛔', 'Забанено', users.filter(u => u.banned).length],
              ['🛡️', 'Админов', users.filter(u => u.role === 'admin').length],
            ].map(([icon, label, val]) => (
              <div key={String(label)} className="pixel-card text-center" style={{ padding: '10px' }}>
                <div className="text-2xl mb-1">{icon}</div>
                <div className="font-pixel text-amber-400 text-[14px]">{val}</div>
                <div className="font-pixel text-[6px] mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Users list */}
          <div className="pixel-card">
            <p className="font-pixel text-[8px] text-amber-400 mb-3">
              👥 ПОЛЬЗОВАТЕЛИ ({users.length})
            </p>
            {loading && <p className="font-pixel text-[7px] text-center py-4" style={{ color: 'hsl(var(--muted-foreground))' }}>Загрузка...</p>}
            {error && <p className="font-pixel text-[7px] text-red-400 text-center">{error}</p>}
            <div className="space-y-2">
              {users.map(u => (
                <div key={u.id} className={`pixel-card ${u.banned ? 'opacity-60' : ''}`} style={{ padding: '10px' }}>
                  <div className="flex items-start gap-3">
                    {u.avatar
                      ? <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-none pixel-sprite" style={{ border: '2px solid hsl(var(--border))' }} />
                      : <div className="w-10 h-10 flex items-center justify-center text-2xl" style={{ border: '2px solid hsl(var(--border))' }}>👤</div>
                    }
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-pixel text-[8px] text-amber-300">{u.name}</span>
                        <span className={`font-pixel text-[6px] ${ROLE_COLORS[u.role] || 'text-gray-400'}`}>
                          {ROLE_LABELS[u.role] || u.role}
                        </span>
                        {u.banned && <span className="font-pixel text-[6px] text-red-400">⛔ БАН</span>}
                        {u.email === 'pavelgladkov74@gmail.com' && <span className="font-pixel text-[6px] rarity-legendary">👑</span>}
                      </div>
                      <div className="font-pixel text-[6px] mt-0.5 truncate" style={{ color: 'hsl(var(--muted-foreground))' }}>{u.email}</div>
                      {u.banned && u.ban_reason && (
                        <div className="font-pixel text-[6px] text-red-400 mt-1">Причина: {u.ban_reason}</div>
                      )}
                    </div>

                    {/* Actions (not for self and not for creator) */}
                    {u.id !== currentUser.id && u.role !== 'creator' && (
                      <div className="flex flex-col gap-1">
                        {u.banned
                          ? <button className="pixel-btn pixel-btn-blue text-[6px]" style={{ padding: '4px 6px' }} onClick={() => handleUnban(u)}>✓ РАЗБАН</button>
                          : <button className="pixel-btn pixel-btn-red text-[6px]" style={{ padding: '4px 6px' }} onClick={() => setBanTarget(u)}>⛔ БАН</button>
                        }
                        {currentUser.role === 'creator' && (
                          <select
                            className="pixel-btn text-[6px] cursor-pointer"
                            style={{ padding: '4px 4px' }}
                            value={u.role}
                            onChange={e => handleRole(u, e.target.value)}
                          >
                            <option value="player">Игрок</option>
                            <option value="admin">Админ</option>
                            <option value="creator">Создатель</option>
                          </select>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
