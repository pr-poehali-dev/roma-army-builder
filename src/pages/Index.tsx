import { useGameStore, Tab } from '@/store/gameStore';
import HomeScreen from '@/components/game/HomeScreen';
import CharacterScreen from '@/components/game/CharacterScreen';
import ArmyScreen from '@/components/game/ArmyScreen';
import QuestsScreen from '@/components/game/QuestsScreen';
import InventoryScreen from '@/components/game/InventoryScreen';
import ShopScreen from '@/components/game/ShopScreen';
import AchievementsScreen from '@/components/game/AchievementsScreen';
import BattleModal from '@/components/game/BattleModal';
import AdvisorWidget from '@/components/game/AdvisorWidget';

const NAV_ITEMS: { id: Tab; label: string; emoji: string }[] = [
  { id: 'home', label: 'Главная', emoji: '🏛️' },
  { id: 'character', label: 'Персонаж', emoji: '⚔️' },
  { id: 'army', label: 'Армия', emoji: '🪖' },
  { id: 'quests', label: 'Квесты', emoji: '📜' },
  { id: 'inventory', label: 'Инвент.', emoji: '📦' },
  { id: 'shop', label: 'Магазин', emoji: '🏪' },
  { id: 'achievements', label: 'Нагр.', emoji: '🏆' },
];

export default function Index() {
  const game = useGameStore();
  const readyQuests = game.quests.filter(q => q.completed && !q.claimed).length;

  const renderScreen = () => {
    switch (game.tab) {
      case 'home':
        return (
          <HomeScreen
            player={game.player}
            battlesWon={game.player.battlesWon}
            onSetTab={game.setTab}
            onHeal={game.healPlayer}
          />
        );
      case 'character':
        return (
          <CharacterScreen
            player={game.player}
            inventory={game.inventory}
            onEquip={game.equipItem}
            onUseConsumable={game.useConsumable}
          />
        );
      case 'army':
        return (
          <ArmyScreen
            units={game.units}
            player={game.player}
            onHire={game.hireUnit}
            onDismiss={game.dismissUnit}
            onStartBattle={game.startBattle}
          />
        );
      case 'quests':
        return <QuestsScreen quests={game.quests} onClaim={game.claimQuest} />;
      case 'inventory':
        return (
          <InventoryScreen
            inventory={game.inventory}
            onEquip={game.equipItem}
            onUseConsumable={game.useConsumable}
          />
        );
      case 'shop':
        return (
          <ShopScreen
            items={game.shopItems}
            player={game.player}
            inventory={game.inventory}
            onBuy={game.buyItem}
          />
        );
      case 'achievements':
        return <AchievementsScreen achievements={game.achievements} />;
      default:
        return null;
    }
  };

  return (
    <div className="scanlines min-h-screen flex flex-col" style={{ background: 'hsl(var(--background))' }}>
      {/* Top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-2"
        style={{ background: 'hsl(var(--card))', borderBottom: '2px solid hsl(var(--border))' }}>
        <div>
          <p className="font-pixel text-amber-400 text-[9px] leading-tight">ROMA</p>
          <p className="font-pixel text-[6px]" style={{ color: 'hsl(var(--muted-foreground))' }}>IMPERIALIS</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="pixel-card flex items-center gap-1" style={{ padding: '4px 8px' }}>
            <span className="font-pixel text-amber-400 text-[8px]">⭐ Ур.{game.player.level}</span>
          </div>
          <div className="pixel-card flex items-center gap-1" style={{ padding: '4px 8px' }}>
            <span className="font-pixel text-amber-400 text-[8px]">💰 {game.player.gold}</span>
          </div>
          <div className="pixel-card flex items-center gap-1" style={{ padding: '4px 8px' }}>
            <span className="font-pixel text-red-400 text-[8px]">❤️ {game.player.hp}</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-3 pt-4 pb-28"
        style={{ maxWidth: '520px', margin: '0 auto', width: '100%' }}>
        {renderScreen()}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30"
        style={{ background: 'hsl(var(--card))', borderTop: '2px solid hsl(var(--border))' }}>
        <div className="flex" style={{ maxWidth: '520px', margin: '0 auto' }}>
          {NAV_ITEMS.map(item => {
            const badge = item.id === 'quests' ? readyQuests : 0;
            return (
              <button
                key={item.id}
                className={`nav-item flex-1 relative`}
                style={{
                  padding: '8px 2px 10px',
                  color: game.tab === item.id ? 'hsl(var(--gold))' : 'hsl(var(--muted-foreground))',
                  borderColor: game.tab === item.id ? 'hsl(var(--gold))' : 'transparent',
                  background: game.tab === item.id ? 'hsl(var(--secondary))' : 'transparent',
                }}
                onClick={() => game.setTab(item.id)}
              >
                <span className="text-[16px] leading-none">{item.emoji}</span>
                <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '5px', marginTop: '3px', display: 'block' }}>
                  {item.label.toUpperCase()}
                </span>
                {badge > 0 && (
                  <span className="absolute top-1 right-1 font-mono text-[7px] text-white bg-red-600 rounded-full w-4 h-4 flex items-center justify-center leading-none">
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Battle modal */}
      <BattleModal
        battle={game.battle}
        player={game.player}
        onAttack={game.attackEnemy}
        onFlee={game.fleeeBattle}
        onClose={game.closeBattle}
      />

      {/* Advisor */}
      <AdvisorWidget
        message={game.advisorMsg}
        visible={game.advisorVisible}
        onClose={() => game.setAdvisorVisible(false)}
      />
    </div>
  );
}
