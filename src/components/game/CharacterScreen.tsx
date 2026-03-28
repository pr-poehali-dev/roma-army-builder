import { Player, Item } from '@/store/gameStore';

interface Props {
  player: Player;
  inventory: Item[];
  onEquip: (id: string) => void;
  onUseConsumable: (id: string) => void;
}

const SLOT_LABELS: Record<string, string> = {
  weapon: '⚔️ Оружие', armor: '🛡️ Доспех', helmet: '⛑️ Шлем',
  boots: '👢 Обувь', ring: '💍 Кольцо', amulet: '📿 Амулет',
};

export default function CharacterScreen({ player, inventory, onEquip, onUseConsumable }: Props) {
  const hpPct = Math.round((player.hp / player.maxHp) * 100);
  const xpPct = Math.round((player.xp / player.xpToNext) * 100);
  const equippedItems = inventory.filter(i => i.equipped);

  return (
    <div className="animate-pixel-enter space-y-4">
      {/* Character card */}
      <div className="pixel-card pixel-border-gold">
        <div className="flex items-start gap-4">
          <div className="text-[64px] leading-none pixel-sprite select-none">🏛️</div>
          <div className="flex-1">
            <div className="font-pixel text-amber-400 text-[12px]">{player.name}</div>
            <div className="font-pixel text-[8px] mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
              {player.title} • Ур. {player.level}
            </div>
            <div className="mt-3 space-y-2">
              <div>
                <div className="font-pixel text-[7px] text-red-400 mb-1">❤️ {player.hp} / {player.maxHp}</div>
                <div className="pixel-bar"><div className="pixel-bar-fill" style={{ width: `${hpPct}%`, background: 'hsl(0 70% 50%)' }} /></div>
              </div>
              <div>
                <div className="font-pixel text-[7px] text-yellow-400 mb-1">⭐ XP {player.xp} / {player.xpToNext}</div>
                <div className="pixel-bar"><div className="pixel-bar-fill" style={{ width: `${xpPct}%`, background: 'hsl(120 60% 45%)' }} /></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="pixel-card">
        <p className="font-pixel text-[8px] text-amber-400 mb-3">📊 ХАРАКТЕРИСТИКИ</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            ['⚔️ Атака', player.atk],
            ['🛡️ Защита', player.def],
            ['❤️ Макс. HP', player.maxHp],
            ['💥 Крит', `${player.crit}%`],
            ['⚡ Скорость', player.speed],
            ['💰 Золото', player.gold],
          ].map(([label, val]) => (
            <div key={String(label)} className="pixel-card flex justify-between items-center" style={{ padding: '8px 10px' }}>
              <span className="font-pixel text-[7px]" style={{ color: 'hsl(var(--muted-foreground))' }}>{label}</span>
              <span className="font-pixel text-amber-400 text-[9px]">{val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Equipment slots */}
      <div className="pixel-card">
        <p className="font-pixel text-[8px] text-amber-400 mb-3">🗡️ СНАРЯЖЕНИЕ</p>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(SLOT_LABELS).map(([slotType, label]) => {
            const equipped = equippedItems.find(i => i.type === slotType);
            return (
              <div key={slotType} className={`pixel-card flex items-center gap-2 ${equipped ? 'pixel-border-' + (equipped.rarity === 'legendary' ? 'legendary' : equipped.rarity === 'rare' ? 'rare' : '') : ''}`} style={{ padding: '8px' }}>
                <div className="text-lg leading-none">{equipped ? equipped.icon : '🔲'}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-pixel text-[6px]" style={{ color: 'hsl(var(--muted-foreground))' }}>{label}</div>
                  {equipped
                    ? <div className={`font-pixel text-[7px] truncate rarity-${equipped.rarity}`}>{equipped.name}</div>
                    : <div className="font-pixel text-[7px]" style={{ color: 'hsl(var(--muted-foreground))' }}>— пусто —</div>
                  }
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Inventory quick */}
      <div className="pixel-card">
        <p className="font-pixel text-[8px] text-amber-400 mb-3">📦 ИНВЕНТАРЬ ({inventory.length})</p>
        {inventory.length === 0 && (
          <p className="font-pixel text-[7px] text-center py-4" style={{ color: 'hsl(var(--muted-foreground))' }}>
            Инвентарь пуст. Купи предметы в магазине!
          </p>
        )}
        <div className="space-y-2">
          {inventory.map(item => (
            <div key={item.id} className={`pixel-card flex items-center gap-3 ${item.equipped ? 'pixel-border-gold' : ''}`} style={{ padding: '8px' }}>
              <div className="text-2xl">{item.icon}</div>
              <div className="flex-1">
                <div className={`font-pixel text-[8px] rarity-${item.rarity}`}>{item.name}</div>
                <div className="font-pixel text-[6px] mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  {Object.entries(item.stats).map(([k, v]) => `+${v} ${k.toUpperCase()}`).join(', ')}
                </div>
              </div>
              {item.type === 'consumable'
                ? <button className="pixel-btn pixel-btn-blue text-[7px]" style={{ padding: '6px 8px' }} onClick={() => onUseConsumable(item.id)}>ИСПОЛЬ.</button>
                : <button className={`pixel-btn text-[7px] ${item.equipped ? 'pixel-btn-red' : ''}`} style={{ padding: '6px 8px' }} onClick={() => onEquip(item.id)}>
                    {item.equipped ? 'СНЯТЬ' : 'НАДЕТЬ'}
                  </button>
              }
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
