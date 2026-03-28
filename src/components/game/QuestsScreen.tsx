import { Quest } from '@/store/gameStore';

interface Props {
  quests: Quest[];
  onClaim: (id: string) => void;
}

export default function QuestsScreen({ quests, onClaim }: Props) {
  const active = quests.filter(q => !q.completed && !q.claimed);
  const ready = quests.filter(q => q.completed && !q.claimed);
  const done = quests.filter(q => q.claimed);

  const QuestCard = ({ q }: { q: Quest }) => {
    const pct = Math.min(100, Math.round((q.progress / q.goal) * 100));
    return (
      <div className={`pixel-card ${q.completed && !q.claimed ? 'pixel-border-gold' : q.claimed ? '' : ''}`} style={{ padding: '12px' }}>
        <div className="flex items-start gap-3">
          <div className="text-3xl leading-none mt-0.5">{q.icon}</div>
          <div className="flex-1">
            <div className={`font-pixel text-[9px] ${q.claimed ? 'text-gray-500' : q.completed ? 'text-amber-400' : 'text-amber-300'}`}>
              {q.title} {q.claimed && '✓'}
            </div>
            <div className="font-pixel text-[6px] mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>{q.description}</div>

            {!q.claimed && (
              <div className="mt-2">
                <div className="flex justify-between mb-1">
                  <span className="font-pixel text-[6px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
                    {q.progress} / {q.goal}
                  </span>
                  <span className="font-pixel text-[6px] text-amber-400">{pct}%</span>
                </div>
                <div className="pixel-bar">
                  <div className="pixel-bar-fill" style={{ width: `${pct}%`, background: q.completed ? 'hsl(45 85% 55%)' : 'hsl(220 70% 55%)' }} />
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 mt-2">
              {q.reward.gold > 0 && <span className="font-pixel text-[6px] text-yellow-400">💰 {q.reward.gold}</span>}
              {q.reward.xp > 0 && <span className="font-pixel text-[6px] text-green-400">⭐ {q.reward.xp} XP</span>}
              {q.reward.item && <span className={`font-pixel text-[6px] rarity-${q.reward.item.rarity}`}>{q.reward.item.icon} {q.reward.item.name}</span>}
            </div>
          </div>

          {q.completed && !q.claimed && (
            <button className="pixel-btn text-[7px]" style={{ padding: '8px 10px', whiteSpace: 'nowrap' }} onClick={() => onClaim(q.id)}>
              🎁 ВЗЯТЬ
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="animate-pixel-enter space-y-4">
      <div className="pixel-card pixel-border-gold">
        <p className="font-pixel text-amber-400 text-[10px] mb-1">📜 КВЕСТЫ</p>
        <div className="grid grid-cols-3 gap-2 text-center mt-3">
          <div><div className="font-pixel text-[16px] text-blue-400">{active.length}</div><div className="font-pixel text-[6px] mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>АКТИВНЫХ</div></div>
          <div><div className="font-pixel text-[16px] text-amber-400">{ready.length}</div><div className="font-pixel text-[6px] mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>ГОТОВО</div></div>
          <div><div className="font-pixel text-[16px] text-green-400">{done.length}</div><div className="font-pixel text-[6px] mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>ВЫПОЛНЕНО</div></div>
        </div>
      </div>

      {ready.length > 0 && (
        <div>
          <p className="font-pixel text-[7px] text-amber-400 mb-2">🎁 ГОТОВО К ПОЛУЧЕНИЮ</p>
          <div className="space-y-2">{ready.map(q => <QuestCard key={q.id} q={q} />)}</div>
        </div>
      )}

      {active.length > 0 && (
        <div>
          <p className="font-pixel text-[7px]" style={{ color: 'hsl(var(--muted-foreground))' }} >📌 АКТИВНЫЕ КВЕСТЫ</p>
          <div className="space-y-2 mt-2">{active.map(q => <QuestCard key={q.id} q={q} />)}</div>
        </div>
      )}

      {done.length > 0 && (
        <div>
          <p className="font-pixel text-[7px] text-green-700 mb-2">✅ ВЫПОЛНЕННЫЕ</p>
          <div className="space-y-2 opacity-60">{done.map(q => <QuestCard key={q.id} q={q} />)}</div>
        </div>
      )}
    </div>
  );
}
