import { useState } from 'react';
import { Item, Rarity, Player } from '@/store/gameStore';

interface Props {
  items: Item[];
  player: Player;
  inventory: Item[];
  onBuy: (item: Item) => void;
}

const RARITY_LABELS: Record<Rarity, string> = {
  common: 'Обычный',
  rare: 'Редкий',
  legendary: 'Легендарный',
};

export default function ShopScreen({ items, player, inventory, onBuy }: Props) {
  const [filter, setFilter] = useState<'all' | Rarity>('all');
  const [selected, setSelected] = useState<Item | null>(null);

  const owned = new Set(inventory.map(i => i.id.split('_')[0]));
  const filtered = items.filter(i => filter === 'all' || i.rarity === filter);

  return (
    <div className="animate-pixel-enter space-y-4">
      {/* Header */}
      <div className="pixel-card pixel-border-gold" style={{ background: 'linear-gradient(135deg, hsl(20 30% 10%), hsl(20 15% 7%))' }}>
        <div className="flex justify-between items-center">
          <div>
            <p className="font-pixel text-[10px] text-amber-400">🏪 РЫНОК РИМА</p>
            <p className="font-pixel text-[6px] mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>Лучшее снаряжение Империи</p>
          </div>
          <div className="pixel-card text-center" style={{ padding: '8px 14px' }}>
            <div className="font-pixel text-amber-400 text-[14px]">{player.gold}</div>
            <div className="font-pixel text-[6px] mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>💰 ЗОЛОТО</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'common', 'rare', 'legendary'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`pixel-btn text-[7px] ${filter === f ? 'bg-amber-900/50' : ''}`}
            style={{
              padding: '6px 10px',
              borderColor: f === 'legendary' ? 'hsl(var(--legendary))' : f === 'rare' ? 'hsl(var(--rare))' : f === 'common' ? 'hsl(var(--common))' : 'hsl(var(--gold))',
              color: f === 'legendary' ? 'hsl(var(--legendary))' : f === 'rare' ? 'hsl(var(--rare))' : f === 'common' ? 'hsl(var(--common))' : 'hsl(var(--gold))',
            }}
          >
            {f === 'all' ? 'ВСЕ' : f === 'common' ? 'ОБЫЧНЫЕ' : f === 'rare' ? 'РЕДКИЕ' : '⚡ЛЕГЕНД.'}
          </button>
        ))}
      </div>

      {/* Items grid */}
      <div className="space-y-2">
        {filtered.map(item => {
          const alreadyOwned = owned.has(item.id);
          const canAfford = player.gold >= item.price;
          return (
            <button
              key={item.id}
              onClick={() => setSelected(item === selected ? null : item)}
              className={`w-full pixel-card flex items-center gap-3 text-left transition-all ${
                selected?.id === item.id ? 'pixel-border-gold' : ''
              } ${item.rarity === 'legendary' ? 'pixel-border-legendary' : item.rarity === 'rare' ? 'pixel-border-rare' : ''}`}
              style={{ padding: '10px', opacity: alreadyOwned ? 0.5 : 1 }}
            >
              <div className="text-3xl leading-none">{item.icon}</div>
              <div className="flex-1">
                <div className={`font-pixel text-[8px] rarity-${item.rarity}`}>{item.name}</div>
                <div className="font-pixel text-[6px] mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  {RARITY_LABELS[item.rarity]} • {item.type}
                </div>
                <div className="flex gap-2 mt-1 flex-wrap">
                  {Object.entries(item.stats).map(([k, v]) => (
                    <span key={k} className="font-pixel text-[6px] text-green-400">+{v} {k.toUpperCase()}</span>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <div className={`font-pixel text-[9px] ${canAfford ? 'text-amber-400' : 'text-red-400'}`}>{item.price} 💰</div>
                {alreadyOwned && <div className="font-pixel text-[6px] text-green-600 mt-1">ЕСТЬ</div>}
              </div>
            </button>
          );
        })}
      </div>

      {/* Buy panel */}
      {selected && (
        <div className={`pixel-card ${selected.rarity === 'legendary' ? 'pixel-border-legendary' : selected.rarity === 'rare' ? 'pixel-border-rare' : 'pixel-border-gold'}`}>
          <div className="flex items-start gap-4 mb-3">
            <div className="text-[48px] leading-none">{selected.icon}</div>
            <div className="flex-1">
              <div className={`font-pixel text-[10px] rarity-${selected.rarity}`}>{selected.name}</div>
              <div className="font-pixel text-[6px] mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>{selected.description}</div>
              <div className="flex flex-wrap gap-2 mt-2">
                {Object.entries(selected.stats).map(([k, v]) => (
                  <span key={k} className="font-pixel text-[7px] text-green-400">+{v} {k.toUpperCase()}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              className={`pixel-btn flex-1 ${player.gold < selected.price ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => { if (player.gold >= selected.price) { onBuy(selected); setSelected(null); } }}
              disabled={player.gold < selected.price}
            >
              КУПИТЬ {selected.price} 💰
            </button>
            <button className="pixel-btn pixel-btn-red" style={{ padding: '8px 12px' }} onClick={() => setSelected(null)}>✕</button>
          </div>
          {player.gold < selected.price && (
            <p className="font-pixel text-[6px] text-red-400 mt-2 text-center">Не хватает {selected.price - player.gold} 💰</p>
          )}
        </div>
      )}
    </div>
  );
}
