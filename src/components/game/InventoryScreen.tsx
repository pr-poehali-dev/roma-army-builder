import { useState } from 'react';
import { Item, Rarity } from '@/store/gameStore';

interface Props {
  inventory: Item[];
  onEquip: (id: string) => void;
  onUseConsumable: (id: string) => void;
}

const RARITY_LABELS: Record<Rarity, string> = {
  common: 'Обычный',
  rare: 'Редкий',
  legendary: 'Легендарный',
};

const RARITY_ORDER: Record<Rarity, number> = { common: 0, rare: 1, legendary: 2 };

export default function InventoryScreen({ inventory, onEquip, onUseConsumable }: Props) {
  const [filter, setFilter] = useState<'all' | Rarity>('all');
  const [selected, setSelected] = useState<Item | null>(null);

  const filtered = [...inventory]
    .filter(i => filter === 'all' || i.rarity === filter)
    .sort((a, b) => RARITY_ORDER[b.rarity] - RARITY_ORDER[a.rarity]);

  const counts = {
    all: inventory.length,
    common: inventory.filter(i => i.rarity === 'common').length,
    rare: inventory.filter(i => i.rarity === 'rare').length,
    legendary: inventory.filter(i => i.rarity === 'legendary').length,
  };

  return (
    <div className="animate-pixel-enter space-y-4">
      <div className="pixel-card pixel-border-gold">
        <p className="font-pixel text-amber-400 text-[10px] mb-3">📦 ИНВЕНТАРЬ</p>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'common', 'rare', 'legendary'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`pixel-btn text-[7px] ${filter === f ? 'bg-amber-900' : ''}`}
              style={{
                padding: '6px 10px',
                borderColor: f === 'legendary' ? 'hsl(var(--legendary))' : f === 'rare' ? 'hsl(var(--rare))' : f === 'common' ? 'hsl(var(--common))' : 'hsl(var(--gold))',
                color: f === 'legendary' ? 'hsl(var(--legendary))' : f === 'rare' ? 'hsl(var(--rare))' : f === 'common' ? 'hsl(var(--common))' : 'hsl(var(--gold))',
              }}
            >
              {f === 'all' ? `ВСЕ (${counts.all})` : f === 'common' ? `ОБЫЧН. (${counts.common})` : f === 'rare' ? `РЕДК. (${counts.rare})` : `ЛЕГЕНД. (${counts.legendary})`}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="pixel-card text-center py-8">
          <p className="text-4xl mb-3">📦</p>
          <p className="font-pixel text-[8px] text-amber-400">Инвентарь пуст</p>
          <p className="font-pixel text-[6px] mt-2" style={{ color: 'hsl(var(--muted-foreground))' }}>Купи предметы в магазине!</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        {filtered.map(item => (
          <button
            key={item.id}
            onClick={() => setSelected(item === selected ? null : item)}
            className={`pixel-card text-left transition-all ${selected?.id === item.id ? 'pixel-border-gold' : ''} ${
              item.rarity === 'legendary' ? 'pixel-border-legendary' : item.rarity === 'rare' ? 'pixel-border-rare' : ''
            }`}
            style={{ padding: '12px' }}
          >
            <div className="text-3xl mb-2 leading-none">{item.icon}</div>
            <div className={`font-pixel text-[8px] rarity-${item.rarity} mb-1`}>{item.name}</div>
            <div className="font-pixel text-[6px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
              {RARITY_LABELS[item.rarity]}
            </div>
            {item.equipped && <div className="font-pixel text-[6px] text-amber-400 mt-1">✓ НАДЕТ</div>}
          </button>
        ))}
      </div>

      {/* Detail panel */}
      {selected && (
        <div className={`pixel-card ${selected.rarity === 'legendary' ? 'pixel-border-legendary' : selected.rarity === 'rare' ? 'pixel-border-rare' : 'pixel-border-gold'}`}>
          <div className="flex items-start gap-4">
            <div className="text-[48px] leading-none">{selected.icon}</div>
            <div className="flex-1">
              <div className={`font-pixel text-[10px] rarity-${selected.rarity}`}>{selected.name}</div>
              <div className="font-pixel text-[7px] mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>{RARITY_LABELS[selected.rarity]}</div>
              <div className="font-pixel text-[6px] mt-2" style={{ color: 'hsl(var(--muted-foreground))' }}>{selected.description}</div>
              <div className="flex flex-wrap gap-2 mt-2">
                {Object.entries(selected.stats).map(([k, v]) => (
                  <span key={k} className="font-pixel text-[7px] text-green-400">+{v} {k.toUpperCase()}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            {selected.type === 'consumable'
              ? <button className="pixel-btn pixel-btn-blue flex-1" onClick={() => { onUseConsumable(selected.id); setSelected(null); }}>💊 ИСПОЛЬЗОВАТЬ</button>
              : <button className={`pixel-btn flex-1 ${selected.equipped ? 'pixel-btn-red' : ''}`} onClick={() => onEquip(selected.id)}>
                  {selected.equipped ? '❌ СНЯТЬ' : '✓ НАДЕТЬ'}
                </button>
            }
            <button className="pixel-btn text-[8px]" style={{ padding: '8px 12px' }} onClick={() => setSelected(null)}>✕</button>
          </div>
        </div>
      )}
    </div>
  );
}
