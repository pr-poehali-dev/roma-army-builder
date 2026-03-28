import { Player, Tab } from '@/store/gameStore';

interface Props {
  player: Player;
  battlesWon: number;
  onSetTab: (t: Tab) => void;
  onHeal: () => void;
}

export default function HomeScreen({ player, battlesWon, onSetTab, onHeal }: Props) {
  const hpPct = Math.round((player.hp / player.maxHp) * 100);
  const xpPct = Math.round((player.xp / player.xpToNext) * 100);

  return (
    <div className="animate-pixel-enter space-y-4">
      {/* Hero banner */}
      <div className="pixel-card pixel-border-gold relative overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(20 30% 10%), hsl(20 15% 7%))' }}>
        <div className="absolute top-0 right-0 text-[80px] opacity-10 leading-none select-none">🏛️</div>
        <div className="relative z-10">
          <p className="font-pixel text-[8px] text-amber-400/60 mb-1">ROMA IMPERIALIS</p>
          <h1 className="font-pixel text-amber-400 text-[14px] leading-relaxed">{player.name}</h1>
          <p className="font-pixel text-[8px] mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>{player.title} • Уровень {player.level}</p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <div className="font-pixel text-[7px] text-red-400 mb-1">❤️ HP {player.hp}/{player.maxHp}</div>
            <div className="pixel-bar">
              <div className="pixel-bar-fill" style={{ width: `${hpPct}%`, background: 'hsl(var(--hp-color))' }} />
            </div>
          </div>
          <div>
            <div className="font-pixel text-[7px] text-yellow-400 mb-1">⭐ XP {player.xp}/{player.xpToNext}</div>
            <div className="pixel-bar">
              <div className="pixel-bar-fill" style={{ width: `${xpPct}%`, background: 'hsl(var(--xp-color))' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { icon: '⚔️', label: 'Атака', val: player.atk },
          { icon: '🛡️', label: 'Защита', val: player.def },
          { icon: '💥', label: 'Крит', val: `${player.crit}%` },
          { icon: '💰', label: 'Золото', val: player.gold },
        ].map(s => (
          <div key={s.label} className="pixel-card text-center">
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="font-pixel text-amber-400 text-[10px]">{s.val}</div>
            <div className="font-pixel text-[6px] mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="pixel-card">
        <p className="font-pixel text-[8px] text-amber-400 mb-3">⚡ БЫСТРЫЕ ДЕЙСТВИЯ</p>
        <div className="grid grid-cols-2 gap-2">
          <button className="pixel-btn" onClick={() => onSetTab('quests')}>📜 КВЕСТЫ</button>
          <button className="pixel-btn pixel-btn-red" onClick={() => onSetTab('army')}>⚔️ АРМИЯ</button>
          <button className="pixel-btn pixel-btn-blue" onClick={() => onSetTab('shop')}>🏪 МАГАЗИН</button>
          <button className="pixel-btn" onClick={onHeal} style={{ borderColor: 'hsl(120 60% 45%)', color: 'hsl(120 60% 60%)' }}>
            💊 ЛЕЧИТЬ (50🪙)
          </button>
        </div>
      </div>

      {/* Stats summary */}
      <div className="pixel-card">
        <p className="font-pixel text-[8px] text-amber-400 mb-3">📊 СТАТИСТИКА</p>
        <div className="space-y-2">
          {[
            ['⚔️ Убито врагов', player.kills],
            ['🏆 Побед в боях', battlesWon],
            ['💰 Золото', player.gold],
            ['📦 Предметов', '—'],
          ].map(([label, val]) => (
            <div key={String(label)} className="flex justify-between items-center border-b border-amber-900/30 pb-1">
              <span className="font-pixel text-[7px]" style={{ color: 'hsl(var(--muted-foreground))' }}>{label}</span>
              <span className="font-pixel text-[8px] text-amber-400">{val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
