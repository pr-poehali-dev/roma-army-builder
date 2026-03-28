import { Achievement } from '@/store/gameStore';

interface Props {
  achievements: Achievement[];
}

export default function AchievementsScreen({ achievements }: Props) {
  const unlocked = achievements.filter(a => a.unlocked);
  const locked = achievements.filter(a => !a.unlocked);
  const pct = Math.round((unlocked.length / achievements.length) * 100);

  return (
    <div className="animate-pixel-enter space-y-4">
      <div className="pixel-card pixel-border-gold">
        <p className="font-pixel text-amber-400 text-[10px] mb-3">🏆 ДОСТИЖЕНИЯ</p>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="font-pixel text-amber-400 text-[24px]">{unlocked.length}/{achievements.length}</div>
            <div className="font-pixel text-[6px] mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>ОТКРЫТО</div>
          </div>
          <div className="flex-1">
            <div className="flex justify-between mb-1">
              <span className="font-pixel text-[6px]" style={{ color: 'hsl(var(--muted-foreground))' }}>Прогресс</span>
              <span className="font-pixel text-[6px] text-amber-400">{pct}%</span>
            </div>
            <div className="pixel-bar">
              <div className="pixel-bar-fill" style={{ width: `${pct}%`, background: 'hsl(45 85% 55%)' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Unlocked */}
      {unlocked.length > 0 && (
        <div>
          <p className="font-pixel text-[7px] text-amber-400 mb-2">✅ ПОЛУЧЕНО</p>
          <div className="space-y-2">
            {unlocked.map(a => (
              <div key={a.id} className="pixel-card pixel-border-gold flex items-center gap-3" style={{ padding: '12px' }}>
                <div className="text-3xl leading-none">{a.icon}</div>
                <div className="flex-1">
                  <div className="font-pixel text-[9px] text-amber-400">{a.title}</div>
                  <div className="font-pixel text-[6px] mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>{a.description}</div>
                  {a.unlockedAt && (
                    <div className="font-pixel text-[6px] mt-1 text-green-500">🏅 {a.unlockedAt}</div>
                  )}
                </div>
                <div className="text-2xl">🏅</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locked */}
      {locked.length > 0 && (
        <div>
          <p className="font-pixel text-[7px] mb-2" style={{ color: 'hsl(var(--muted-foreground))' }}>🔒 ЗАБЛОКИРОВАНО</p>
          <div className="space-y-2">
            {locked.map(a => (
              <div key={a.id} className="pixel-card flex items-center gap-3 opacity-50" style={{ padding: '12px' }}>
                <div className="text-3xl leading-none grayscale">?</div>
                <div className="flex-1">
                  <div className="font-pixel text-[9px]" style={{ color: 'hsl(var(--muted-foreground))' }}>???</div>
                  <div className="font-pixel text-[6px] mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>{a.description}</div>
                </div>
                <div className="font-pixel text-[16px]">🔒</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
