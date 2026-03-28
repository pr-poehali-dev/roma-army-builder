import { useEffect, useRef } from 'react';
import { Player, Enemy } from '@/store/gameStore';

interface BattleState {
  active: boolean;
  enemy: Enemy | null;
  log: string[];
  phase: 'idle' | 'fighting' | 'win' | 'lose';
  playerAnimClass: string;
  enemyAnimClass: string;
  turn: number;
}

interface Props {
  battle: BattleState;
  player: Player;
  onAttack: () => void;
  onFlee: () => void;
  onClose: () => void;
}

export default function BattleModal({ battle, player, onAttack, onFlee, onClose }: Props) {
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [battle.log]);

  if (!battle.active || !battle.enemy) return null;

  const enemy = battle.enemy;
  const enemyHpPct = Math.round((enemy.hp / enemy.maxHp) * 100);
  const playerHpPct = Math.round((player.hp / player.maxHp) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.85)' }}>
      <div className="w-full max-w-md mx-4 animate-pixel-enter">
        <div className={`pixel-card ${enemy.isBoss ? 'pixel-border-legendary' : 'pixel-border-gold'}`} style={{ background: 'hsl(20 15% 7%)' }}>

          {/* Title */}
          <div className="text-center mb-4">
            <p className="font-pixel text-[8px]" style={{ color: 'hsl(var(--muted-foreground))' }}>⚔️ БОЙ ⚔️</p>
            {enemy.isBoss && <p className="font-pixel text-[7px] mt-1 rarity-legendary animate-pulse">— БИТВА С БОССОМ —</p>}
          </div>

          {/* Battle arena */}
          <div className="flex items-center justify-between mb-4 px-2">
            {/* Player side */}
            <div className={`text-center ${battle.playerAnimClass}`}>
              <div className="text-[48px] leading-none mb-2 pixel-sprite">🏛️</div>
              <div className="font-pixel text-[7px] text-amber-400 mb-1">{player.name}</div>
              <div className="font-pixel text-[6px] text-red-400 mb-1">HP {player.hp}/{player.maxHp}</div>
              <div className="pixel-bar" style={{ width: '80px' }}>
                <div className="pixel-bar-fill" style={{ width: `${playerHpPct}%`, background: 'hsl(120 60% 45%)' }} />
              </div>
            </div>

            {/* VS */}
            <div className="text-center">
              <div className="font-pixel text-amber-400 text-[14px]">VS</div>
              <div className="font-pixel text-[8px] mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>Ход {battle.turn + 1}</div>
            </div>

            {/* Enemy side */}
            <div className={`text-center ${battle.enemyAnimClass}`}>
              <div className="text-[48px] leading-none mb-2 pixel-sprite">{enemy.icon}</div>
              <div className={`font-pixel text-[7px] mb-1 ${enemy.isBoss ? 'rarity-legendary' : 'text-red-400'}`}>{enemy.name}</div>
              <div className="font-pixel text-[6px] text-red-400 mb-1">HP {enemy.hp}/{enemy.maxHp}</div>
              <div className="pixel-bar" style={{ width: '80px' }}>
                <div className="pixel-bar-fill" style={{ width: `${enemyHpPct}%`, background: 'hsl(0 70% 50%)' }} />
              </div>
            </div>
          </div>

          {/* Battle log */}
          <div ref={logRef} className="pixel-card mb-4 overflow-y-auto space-y-1" style={{ height: '100px', background: 'hsl(20 15% 5%)' }}>
            {battle.log.map((line, i) => (
              <p key={i} className="font-pixel text-[6px] leading-relaxed" style={{ color: i === battle.log.length - 1 ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))' }}>
                {line}
              </p>
            ))}
          </div>

          {/* Actions */}
          {battle.phase === 'fighting' && (
            <div className="flex gap-2">
              <button className="pixel-btn pixel-btn-red flex-1" onClick={onAttack}>⚔️ АТАКА</button>
              <button className="pixel-btn flex-1" style={{ borderColor: 'hsl(220 70% 60%)', color: 'hsl(220 70% 75%)', fontSize: '9px' }} onClick={onFlee}>🏃 БЕЖАТЬ</button>
            </div>
          )}

          {battle.phase === 'win' && (
            <div className="text-center space-y-3">
              <div className="font-pixel text-[10px] text-yellow-400">🏆 ПОБЕДА!</div>
              <div className="font-pixel text-[7px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
                +{enemy.reward.gold} 🪙 &nbsp; +{enemy.reward.xp} XP
              </div>
              <button className="pixel-btn w-full" onClick={onClose}>ПРОДОЛЖИТЬ →</button>
            </div>
          )}

          {battle.phase === 'lose' && (
            <div className="text-center space-y-3">
              <div className="font-pixel text-[10px] text-red-400">💀 ПОРАЖЕНИЕ</div>
              <div className="font-pixel text-[7px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
                Ты пал в бою. Восстанови силы и вернись!
              </div>
              <button className="pixel-btn pixel-btn-red w-full" onClick={onClose}>ОТСТУПИТЬ</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
