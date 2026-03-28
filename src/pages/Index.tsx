import { useEffect, useRef, useState } from 'react';
import { useGameStore, Tab } from '@/store/gameStore';
import { useAuth } from '@/hooks/useAuth';
import HomeScreen from '@/components/game/HomeScreen';
import CharacterScreen from '@/components/game/CharacterScreen';
import ArmyScreen from '@/components/game/ArmyScreen';
import QuestsScreen from '@/components/game/QuestsScreen';
import InventoryScreen from '@/components/game/InventoryScreen';
import ShopScreen from '@/components/game/ShopScreen';
import AchievementsScreen from '@/components/game/AchievementsScreen';
import BattleModal from '@/components/game/BattleModal';
import AdvisorWidget from '@/components/game/AdvisorWidget';
import LoginScreen from '@/components/game/LoginScreen';
import AdminPanel from '@/components/game/AdminPanel';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';
const DEMO_MODE = true;
const AUTO_SAVE_INTERVAL = 30_000;

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
  const auth = useAuth();
  const [showAdmin, setShowAdmin] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [demoMode, setDemoMode] = useState(false);
  const autoSaveTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const readyQuests = game.quests.filter(q => q.completed && !q.claimed).length;

  const isLoggedIn = demoMode || !!auth.user;
  const canAdmin = auth.user && ['admin', 'creator'].includes(auth.user.role);

  // ── Auto-save ─────────────────────────────────────────────────────────────
  const doSave = async () => {
    if (demoMode || !auth.user) return;
    setSaveStatus('saving');
    try {
      const snapshot = {
        player: game.player,
        inventory: game.inventory,
        units: game.units.map(u => ({ id: u.id, count: u.count })),
        quests: game.quests,
        achievements: game.achievements,
        savedAt: new Date().toISOString(),
      };
      await auth.saveGame(snapshot);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  useEffect(() => {
    if (!isLoggedIn || demoMode) return;
    // Load save on login
    auth.loadGame().then(save => {
      if (save && typeof save === 'object') {
        const s = save as Record<string, unknown>;
        if (s.player) game.setPlayer(s.player as Parameters<typeof game.setPlayer>[0]);
        if (s.inventory) game.setInventory(s.inventory as Parameters<typeof game.setInventory>[0]);
      }
    }).catch(() => {});
    // Start auto-save
    autoSaveTimer.current = setInterval(doSave, AUTO_SAVE_INTERVAL);
    return () => { if (autoSaveTimer.current) clearInterval(autoSaveTimer.current); };
  }, [isLoggedIn, demoMode]);

  // ── Google login handler ──────────────────────────────────────────────────
  const handleLogin = async (idToken: string) => {
    if (idToken === 'demo_mode') { setDemoMode(true); return; }
    await auth.handleGoogleLogin(idToken);
  };

  // ── Show login screen ─────────────────────────────────────────────────────
  if (auth.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'hsl(var(--background))' }}>
        <div className="text-center">
          <div className="text-6xl mb-4">🏛️</div>
          <p className="font-pixel text-amber-400 text-[10px]">Загрузка легиона...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <LoginScreen
        onLogin={handleLogin}
        error={auth.error}
        loading={auth.loading}
        googleClientId={GOOGLE_CLIENT_ID}
      />
    );
  }

  const renderScreen = () => {
    switch (game.tab) {
      case 'home':
        return <HomeScreen player={game.player} battlesWon={game.player.battlesWon} onSetTab={game.setTab} onHeal={game.healPlayer} />;
      case 'character':
        return <CharacterScreen player={game.player} inventory={game.inventory} onEquip={game.equipItem} onUseConsumable={game.useConsumable} />;
      case 'army':
        return <ArmyScreen units={game.units} player={game.player} onHire={game.hireUnit} onDismiss={game.dismissUnit} onStartBattle={game.startBattle} />;
      case 'quests':
        return <QuestsScreen quests={game.quests} onClaim={game.claimQuest} />;
      case 'inventory':
        return <InventoryScreen inventory={game.inventory} onEquip={game.equipItem} onUseConsumable={game.useConsumable} />;
      case 'shop':
        return <ShopScreen items={game.shopItems} player={game.player} inventory={game.inventory} onBuy={game.buyItem} />;
      case 'achievements':
        return <AchievementsScreen achievements={game.achievements} />;
      default: return null;
    }
  };

  return (
    <div className="scanlines min-h-screen flex flex-col" style={{ background: 'hsl(var(--background))' }}>
      {/* Top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-3 py-2"
        style={{ background: 'hsl(var(--card))', borderBottom: '2px solid hsl(var(--border))' }}>
        <div className="flex items-center gap-2">
          <div>
            <p className="font-pixel text-amber-400 text-[9px] leading-tight">ROMA</p>
            <p className="font-pixel text-[5px]" style={{ color: 'hsl(var(--muted-foreground))' }}>IMPERIALIS</p>
          </div>
          {/* Save indicator */}
          {!demoMode && (
            <button
              onClick={doSave}
              className="pixel-card font-pixel text-[6px] cursor-pointer"
              style={{
                padding: '3px 6px',
                color: saveStatus === 'saved' ? 'hsl(120 60% 55%)' : saveStatus === 'saving' ? 'hsl(var(--gold))' : saveStatus === 'error' ? 'hsl(var(--destructive))' : 'hsl(var(--muted-foreground))',
              }}
              title="Сохранить прогресс"
            >
              {saveStatus === 'saving' ? '⏳' : saveStatus === 'saved' ? '✅' : saveStatus === 'error' ? '❌' : '💾'}
            </button>
          )}
          {demoMode && (
            <span className="font-pixel text-[6px] text-amber-600/70" style={{ padding: '3px 6px' }}>ДЕМО</span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <div className="pixel-card" style={{ padding: '3px 6px' }}>
            <span className="font-pixel text-amber-400 text-[8px]">⭐{game.player.level}</span>
          </div>
          <div className="pixel-card" style={{ padding: '3px 6px' }}>
            <span className="font-pixel text-amber-400 text-[8px]">💰{game.player.gold}</span>
          </div>
          <div className="pixel-card" style={{ padding: '3px 6px' }}>
            <span className="font-pixel text-red-400 text-[8px]">❤️{game.player.hp}</span>
          </div>
          {/* Admin button */}
          {canAdmin && (
            <button
              className="pixel-btn text-[8px]"
              style={{ padding: '3px 6px', borderColor: 'hsl(35 95% 55%)', color: 'hsl(35 95% 65%)' }}
              onClick={() => setShowAdmin(true)}
              title="Панель управления"
            >
              👑
            </button>
          )}
          {/* User avatar / logout */}
          {auth.user && (
            <button
              className="pixel-btn pixel-btn-red text-[7px]"
              style={{ padding: '3px 6px' }}
              onClick={auth.logout}
              title="Выйти"
            >
              {auth.user.avatar
                ? <img src={auth.user.avatar} alt="" className="w-5 h-5 inline pixel-sprite" />
                : '🚪'
              }
            </button>
          )}
          {demoMode && (
            <button
              className="pixel-btn pixel-btn-red text-[7px]"
              style={{ padding: '3px 6px' }}
              onClick={() => setDemoMode(false)}
            >🚪</button>
          )}
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
                className="nav-item flex-1 relative"
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
      <BattleModal battle={game.battle} player={game.player} onAttack={game.attackEnemy} onFlee={game.fleeeBattle} onClose={game.closeBattle} />

      {/* Advisor */}
      <AdvisorWidget message={game.advisorMsg} visible={game.advisorVisible} onClose={() => game.setAdvisorVisible(false)} />

      {/* Admin panel */}
      {showAdmin && auth.user && canAdmin && (
        <AdminPanel currentUser={auth.user} onClose={() => setShowAdmin(false)} />
      )}
    </div>
  );
}
