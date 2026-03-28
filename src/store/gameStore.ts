import { useState, useCallback } from 'react';

export type Rarity = 'common' | 'rare' | 'legendary';
export type ItemType = 'weapon' | 'armor' | 'helmet' | 'boots' | 'ring' | 'amulet' | 'consumable';
export type UnitType = 'legionary' | 'archer' | 'cavalry' | 'siege';
export type Tab = 'home' | 'character' | 'army' | 'quests' | 'inventory' | 'shop' | 'achievements';

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  rarity: Rarity;
  icon: string;
  stats: Partial<{ atk: number; def: number; hp: number; crit: number; speed: number }>;
  description: string;
  price: number;
  equipped?: boolean;
}

export interface Unit {
  id: UnitType;
  name: string;
  icon: string;
  count: number;
  atk: number;
  def: number;
  hp: number;
  cost: number;
  description: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  icon: string;
  completed: boolean;
  claimed: boolean;
  progress: number;
  goal: number;
  reward: { gold: number; xp: number; item?: Item };
  type: 'kill' | 'buy' | 'collect' | 'army' | 'level';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface Enemy {
  id: string;
  name: string;
  icon: string;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  reward: { gold: number; xp: number };
  isBoss?: boolean;
}

export interface Player {
  name: string;
  level: number;
  xp: number;
  xpToNext: number;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  crit: number;
  speed: number;
  gold: number;
  kills: number;
  battlesWon: number;
  title: string;
}

// ─── Items pool ─────────────────────────────────────────────────────────────

export const SHOP_ITEMS: Item[] = [
  { id: 'gladius', name: 'Гладиус', type: 'weapon', rarity: 'common', icon: '⚔️', stats: { atk: 8 }, description: 'Короткий меч легиона', price: 150, equipped: false },
  { id: 'pilum', name: 'Пилум', type: 'weapon', rarity: 'common', icon: '🗡️', stats: { atk: 12, speed: 2 }, description: 'Метательное копьё', price: 220, equipped: false },
  { id: 'spatha', name: 'Спата', type: 'weapon', rarity: 'rare', icon: '🔱', stats: { atk: 22, crit: 5 }, description: 'Длинный кавалерийский меч', price: 600, equipped: false },
  { id: 'blade_mars', name: 'Клинок Марса', type: 'weapon', rarity: 'legendary', icon: '⚡', stats: { atk: 45, crit: 15, speed: 5 }, description: 'Оружие бога войны — несёт огонь битвы', price: 2500, equipped: false },
  { id: 'scutum', name: 'Скутум', type: 'armor', rarity: 'common', icon: '🛡️', stats: { def: 10, hp: 20 }, description: 'Большой щит легионера', price: 180, equipped: false },
  { id: 'lorica', name: 'Лорика Сегментата', type: 'armor', rarity: 'rare', icon: '🪖', stats: { def: 25, hp: 50 }, description: 'Сегментированный доспех', price: 750, equipped: false },
  { id: 'aegis_rome', name: 'Эгида Рима', type: 'armor', rarity: 'legendary', icon: '🏛️', stats: { def: 55, hp: 120, crit: 5 }, description: 'Священный доспех Рима — благословлён Юпитером', price: 3000, equipped: false },
  { id: 'galea', name: 'Галеа', type: 'helmet', rarity: 'common', icon: '⛑️', stats: { def: 6, hp: 15 }, description: 'Классический шлем легионера', price: 120, equipped: false },
  { id: 'crested', name: 'Шлем Центуриона', type: 'helmet', rarity: 'rare', icon: '🎖️', stats: { def: 18, hp: 30, speed: 3 }, description: 'Шлем с красным гребнем', price: 500, equipped: false },
  { id: 'caligae', name: 'Калигэ', type: 'boots', rarity: 'common', icon: '👢', stats: { speed: 8, def: 3 }, description: 'Сандалии легионера', price: 100, equipped: false },
  { id: 'ring_victory', name: 'Кольцо Победы', type: 'ring', rarity: 'rare', icon: '💍', stats: { crit: 10, atk: 8 }, description: 'Носят лишь триумфаторы', price: 800, equipped: false },
  { id: 'amulet_jupiter', name: 'Амулет Юпитера', type: 'amulet', rarity: 'legendary', icon: '⚡', stats: { atk: 30, crit: 20, hp: 80 }, description: 'Молния самого Юпитера — уничтожает врагов', price: 3500, equipped: false },
  { id: 'potion_hp', name: 'Зелье лечения', type: 'consumable', rarity: 'common', icon: '🧪', stats: { hp: 50 }, description: 'Восстанавливает 50 HP', price: 80, equipped: false },
  { id: 'potion_atk', name: 'Зелье силы', type: 'consumable', rarity: 'rare', icon: '💪', stats: { atk: 15 }, description: 'Временно усиливает атаку', price: 250, equipped: false },
];

const ENEMIES: Enemy[] = [
  { id: 'barbarian', name: 'Варвар', icon: '👹', hp: 80, maxHp: 80, atk: 12, def: 4, reward: { gold: 25, xp: 30 } },
  { id: 'gaul', name: 'Галл', icon: '⚔️', hp: 120, maxHp: 120, atk: 18, def: 7, reward: { gold: 40, xp: 50 } },
  { id: 'carthaginian', name: 'Карфагенянин', icon: '🐘', hp: 180, maxHp: 180, atk: 24, def: 12, reward: { gold: 65, xp: 80 } },
  { id: 'gladiator', name: 'Гладиатор', icon: '🗡️', hp: 250, maxHp: 250, atk: 35, def: 18, reward: { gold: 100, xp: 130 } },
  { id: 'boss_hannibal', name: '⚡ ГАННИБАЛ ⚡', icon: '🦁', hp: 600, maxHp: 600, atk: 55, def: 30, reward: { gold: 400, xp: 500 }, isBoss: true },
  { id: 'boss_spartacus', name: '⚡ СПАРТАК ⚡', icon: '🔥', hp: 900, maxHp: 900, atk: 75, def: 40, reward: { gold: 700, xp: 900 }, isBoss: true },
];

const INITIAL_QUESTS: Quest[] = [
  {
    id: 'q1', title: 'Первая кровь', description: 'Победи 3 врагов в бою', icon: '⚔️',
    completed: false, claimed: false, progress: 0, goal: 3, type: 'kill',
    reward: { gold: 150, xp: 100 }
  },
  {
    id: 'q2', title: 'Вооружись', description: 'Купи первый предмет в магазине', icon: '🛡️',
    completed: false, claimed: false, progress: 0, goal: 1, type: 'buy',
    reward: { gold: 200, xp: 150 }
  },
  {
    id: 'q3', title: 'Легион Рима', description: 'Набери 5 легионеров', icon: '🪖',
    completed: false, claimed: false, progress: 0, goal: 5, type: 'army',
    reward: { gold: 300, xp: 200 }
  },
  {
    id: 'q4', title: 'Путь воина', description: 'Достигни 5-го уровня', icon: '⭐',
    completed: false, claimed: false, progress: 0, goal: 5, type: 'level',
    reward: { gold: 500, xp: 300, item: SHOP_ITEMS[2] }
  },
  {
    id: 'q5', title: 'Охотник на варваров', description: 'Убей 10 врагов', icon: '💀',
    completed: false, claimed: false, progress: 0, goal: 10, type: 'kill',
    reward: { gold: 400, xp: 350, item: SHOP_ITEMS[5] }
  },
  {
    id: 'q6', title: 'Казна Рима', description: 'Накопи 1000 золота', icon: '💰',
    completed: false, claimed: false, progress: 0, goal: 1000, type: 'collect',
    reward: { gold: 0, xp: 250, item: SHOP_ITEMS[9] }
  },
  {
    id: 'q7', title: 'Убийца Ганнибала', description: 'Победи Ганнибала в бою', icon: '🦁',
    completed: false, claimed: false, progress: 0, goal: 1, type: 'kill',
    reward: { gold: 800, xp: 1000, item: SHOP_ITEMS[3] }
  },
];

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'a1', title: 'Новобранец', description: 'Начало пути в Риме', icon: '🌟', unlocked: true, unlockedAt: 'Сейчас' },
  { id: 'a2', title: 'Первая победа', description: 'Победи в первом бою', icon: '⚔️', unlocked: false },
  { id: 'a3', title: 'Ветеран', description: 'Выиграй 10 боёв', icon: '🏆', unlocked: false },
  { id: 'a4', title: 'Центурион', description: 'Достигни 10-го уровня', icon: '🎖️', unlocked: false },
  { id: 'a5', title: 'Богатый купец', description: 'Накопи 5000 золота', icon: '💰', unlocked: false },
  { id: 'a6', title: 'Легат', description: 'Набери армию из 20 воинов', icon: '⚡', unlocked: false },
  { id: 'a7', title: 'Легендарный', description: 'Получи легендарный предмет', icon: '👑', unlocked: false },
  { id: 'a8', title: 'Победитель Спартака', description: 'Победи финального босса', icon: '🔥', unlocked: false },
];

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useGameStore() {
  const [tab, setTab] = useState<Tab>('home');
  const [player, setPlayer] = useState<Player>({
    name: 'Центурион', level: 1, xp: 0, xpToNext: 100,
    hp: 120, maxHp: 120, atk: 15, def: 8, crit: 5, speed: 10,
    gold: 350, kills: 0, battlesWon: 0, title: 'Новобранец',
  });
  const [inventory, setInventory] = useState<Item[]>([]);
  const [units, setUnits] = useState<Unit[]>([
    { id: 'legionary', name: 'Легионер', icon: '🗡️', count: 0, atk: 15, def: 12, hp: 100, cost: 80, description: 'Основа армии Рима' },
    { id: 'archer', name: 'Лучник', icon: '🏹', count: 0, atk: 25, def: 5, hp: 70, cost: 120, description: 'Дальний бой, высокий урон' },
    { id: 'cavalry', name: 'Кавалерия', icon: '🐎', count: 0, atk: 35, def: 15, hp: 150, cost: 250, description: 'Быстрые и мощные всадники' },
    { id: 'siege', name: 'Баллиста', icon: '🏹', count: 0, atk: 60, def: 2, hp: 50, cost: 500, description: 'Осадное орудие огромной силы' },
  ]);
  const [quests, setQuests] = useState<Quest[]>(INITIAL_QUESTS);
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
  const [shopItems] = useState<Item[]>(SHOP_ITEMS);
  const [battle, setBattle] = useState<{ active: boolean; enemy: Enemy | null; log: string[]; phase: 'idle' | 'fighting' | 'win' | 'lose'; playerAnimClass: string; enemyAnimClass: string; turn: number }>({
    active: false, enemy: null, log: [], phase: 'idle', playerAnimClass: '', enemyAnimClass: '', turn: 0
  });
  const [advisorMsg, setAdvisorMsg] = useState<string>('Ave! Я Сенека, твой советник. Начни с боёв, чтобы добыть золото, и вооружи себя в магазине!');
  const [advisorVisible, setAdvisorVisible] = useState(true);

  // ── XP & Level ──────────────────────────────────────────────────────────────
  const addXP = useCallback((amount: number) => {
    setPlayer(p => {
      let newXP = p.xp + amount;
      let level = p.level;
      let xpToNext = p.xpToNext;
      let maxHp = p.maxHp;
      let atk = p.atk;
      let def = p.def;
      let crit = p.crit;

      while (newXP >= xpToNext) {
        newXP -= xpToNext;
        level++;
        xpToNext = Math.floor(xpToNext * 1.4);
        maxHp += 20;
        atk += 5;
        def += 3;
        crit += 1;
      }

      const titles: Record<number, string> = {
        1: 'Новобранец', 3: 'Легионер', 5: 'Ветеран', 8: 'Декурион',
        10: 'Центурион', 15: 'Трибун', 20: 'Легат',
      };
      const title = Object.entries(titles).filter(([lv]) => +lv <= level).pop()?.[1] ?? p.title;

      // check achievements
      setAchievements(prev => prev.map(a => {
        if (a.id === 'a4' && level >= 10 && !a.unlocked)
          return { ...a, unlocked: true, unlockedAt: `Уровень ${level}` };
        return a;
      }));

      return { ...p, xp: newXP, level, xpToNext, maxHp, atk, def, crit, title, hp: Math.min(p.hp + 30, maxHp) };
    });
    updateQuestProgress('level');
  }, []);

  // ── Gold ─────────────────────────────────────────────────────────────────────
  const addGold = useCallback((amount: number) => {
    setPlayer(p => {
      const newGold = p.gold + amount;
      // achievement
      if (newGold >= 5000) {
        setAchievements(prev => prev.map(a => a.id === 'a5' && !a.unlocked ? { ...a, unlocked: true, unlockedAt: 'Собрано 5000 золота' } : a));
      }
      return { ...p, gold: newGold };
    });
    updateQuestProgress('collect');
  }, []);

  // ── Quest progress ───────────────────────────────────────────────────────────
  const updateQuestProgress = useCallback((type: Quest['type'], amount = 1) => {
    setQuests(prev => prev.map(q => {
      if (q.completed || q.type !== type) return q;
      let newProg = q.progress;
      if (type === 'collect') {
        setPlayer(pp => { newProg = pp.gold; return pp; });
      } else {
        newProg = Math.min(q.progress + amount, q.goal);
      }
      const completed = newProg >= q.goal;
      return { ...q, progress: newProg, completed };
    }));
  }, []);

  // ── Buy item ─────────────────────────────────────────────────────────────────
  const buyItem = useCallback((item: Item) => {
    setPlayer(p => {
      if (p.gold < item.price) return p;
      setInventory(inv => [...inv, { ...item, id: item.id + '_' + Date.now(), equipped: false }]);
      setQuests(prev => prev.map(q => {
        if (q.type === 'buy' && !q.completed) {
          const np = Math.min(q.progress + 1, q.goal);
          return { ...q, progress: np, completed: np >= q.goal };
        }
        return q;
      }));
      if (item.rarity === 'legendary') {
        setAchievements(prev => prev.map(a => a.id === 'a7' && !a.unlocked ? { ...a, unlocked: true, unlockedAt: item.name } : a));
      }
      setAdvisorMsg(`Отличный выбор! ${item.name} усилит тебя в бою!`);
      return { ...p, gold: p.gold - item.price };
    });
  }, []);

  // ── Equip item ───────────────────────────────────────────────────────────────
  const equipItem = useCallback((itemId: string) => {
    setInventory(inv => {
      const item = inv.find(i => i.id === itemId);
      if (!item || item.type === 'consumable') return inv;
      return inv.map(i => {
        if (i.type === item.type && i.id !== itemId) return { ...i, equipped: false };
        if (i.id === itemId) return { ...i, equipped: !i.equipped };
        return i;
      });
    });
    setPlayer(p => {
      const item = inventory.find(i => i.id === itemId);
      if (!item || item.type === 'consumable') return p;
      const mult = item.equipped ? -1 : 1;
      return {
        ...p,
        atk: p.atk + (item.stats.atk ?? 0) * mult,
        def: p.def + (item.stats.def ?? 0) * mult,
        maxHp: p.maxHp + (item.stats.hp ?? 0) * mult,
        hp: Math.min(p.hp + (item.stats.hp ?? 0) * mult, p.maxHp + (item.stats.hp ?? 0) * mult),
        crit: p.crit + (item.stats.crit ?? 0) * mult,
        speed: p.speed + (item.stats.speed ?? 0) * mult,
      };
    });
  }, [inventory]);

  // ── Use consumable ────────────────────────────────────────────────────────────
  const useConsumable = useCallback((itemId: string) => {
    const item = inventory.find(i => i.id === itemId);
    if (!item || item.type !== 'consumable') return;
    setPlayer(p => ({
      ...p,
      hp: Math.min(p.maxHp, p.hp + (item.stats.hp ?? 0)),
      atk: p.atk + (item.stats.atk ?? 0),
    }));
    setInventory(inv => inv.filter(i => i.id !== itemId));
    setAdvisorMsg(`Использовано ${item.name}!`);
  }, [inventory]);

  // ── Hire unit ─────────────────────────────────────────────────────────────────
  const hireUnit = useCallback((unitId: UnitType) => {
    const unit = units.find(u => u.id === unitId);
    if (!unit) return;
    setPlayer(p => {
      if (p.gold < unit.cost) { setAdvisorMsg('Недостаточно золота для найма!'); return p; }
      setUnits(prev => {
        const updated = prev.map(u => u.id === unitId ? { ...u, count: u.count + 1 } : u);
        const total = updated.reduce((s, u) => s + u.count, 0);
        setQuests(prev2 => prev2.map(q => {
          if (q.type === 'army' && !q.completed) {
            const legCount = updated.find(u => u.id === 'legionary')?.count ?? 0;
            const np = Math.min(legCount, q.goal);
            return { ...q, progress: np, completed: np >= q.goal };
          }
          return q;
        }));
        if (total >= 20) {
          setAchievements(prev3 => prev3.map(a => a.id === 'a6' && !a.unlocked ? { ...a, unlocked: true, unlockedAt: '20 воинов в армии' } : a));
        }
        return updated;
      });
      setAdvisorMsg(`${unit.name} присоединился к твоему легиону!`);
      return { ...p, gold: p.gold - unit.cost };
    });
  }, [units]);

  // ── Dismiss unit ──────────────────────────────────────────────────────────────
  const dismissUnit = useCallback((unitId: UnitType) => {
    setUnits(prev => prev.map(u => u.id === unitId && u.count > 0 ? { ...u, count: u.count - 1 } : u));
  }, []);

  // ── Claim quest ───────────────────────────────────────────────────────────────
  const claimQuest = useCallback((questId: string) => {
    setQuests(prev => prev.map(q => {
      if (q.id !== questId || !q.completed || q.claimed) return q;
      addGold(q.reward.gold);
      addXP(q.reward.xp);
      if (q.reward.item) {
        setInventory(inv => [...inv, { ...q.reward.item!, id: q.reward.item!.id + '_reward_' + Date.now(), equipped: false }]);
      }
      setAdvisorMsg(`Квест "${q.title}" завершён! Получено: ${q.reward.gold} золота, ${q.reward.xp} опыта${q.reward.item ? `, ${q.reward.item.name}` : ''}!`);
      return { ...q, claimed: true };
    }));
  }, [addGold, addXP]);

  // ── Battle ────────────────────────────────────────────────────────────────────
  const startBattle = useCallback((enemyId: string) => {
    const enemy = ENEMIES.find(e => e.id === enemyId);
    if (!enemy) return;
    setBattle({ active: true, enemy: { ...enemy }, log: [`⚔️ Начался бой с ${enemy.name}!`], phase: 'fighting', playerAnimClass: '', enemyAnimClass: '', turn: 0 });
    setAdvisorMsg(`Внимание! Бой с ${enemy.name}! Атакуй смело!`);
  }, []);

  const attackEnemy = useCallback(() => {
    setBattle(b => {
      if (!b.enemy || b.phase !== 'fighting') return b;
      const dmg = Math.max(1, player.atk - b.enemy.def + Math.floor(Math.random() * 8));
      const isCrit = Math.random() * 100 < player.crit;
      const finalDmg = isCrit ? Math.floor(dmg * 1.8) : dmg;
      const newEnemyHp = Math.max(0, b.enemy.hp - finalDmg);
      const critText = isCrit ? ' 💥 КРИТИЧЕСКИЙ УДАР!' : '';

      if (newEnemyHp <= 0) {
        // Win
        setPlayer(p => ({ ...p, kills: p.kills + 1, battlesWon: p.battlesWon + 1 }));
        addGold(b.enemy!.reward.gold);
        addXP(b.enemy!.reward.xp);
        setQuests(prev => prev.map(q => {
          if (q.type === 'kill' && !q.completed) {
            const np = Math.min(q.progress + 1, q.goal);
            const completed = np >= q.goal;
            if (b.enemy?.isBoss && q.id === 'q7' && b.enemy.id === 'boss_hannibal') return { ...q, progress: np, completed };
            if (!b.enemy?.isBoss) return { ...q, progress: np, completed };
          }
          return q;
        }));
        setAchievements(prev => prev.map(a => {
          if (a.id === 'a2' && !a.unlocked) return { ...a, unlocked: true, unlockedAt: b.enemy!.name };
          if (a.id === 'a3' && player.battlesWon + 1 >= 10 && !a.unlocked) return { ...a, unlocked: true, unlockedAt: '10 побед' };
          if (a.id === 'a8' && b.enemy?.id === 'boss_spartacus' && !a.unlocked) return { ...a, unlocked: true, unlockedAt: 'Спартак повержен' };
          return a;
        }));
        setAdvisorMsg(`Победа над ${b.enemy!.name}! +${b.enemy!.reward.gold} золота, +${b.enemy!.reward.xp} опыта!`);
        return { ...b, enemy: { ...b.enemy!, hp: 0 }, log: [...b.log, `${critText}🗡️ Ты нанёс ${finalDmg} урона. ПОБЕДА!`], phase: 'win', enemyAnimClass: 'hit-flash' };
      }

      // Enemy attacks back
      const eDmg = Math.max(1, b.enemy.atk - player.def + Math.floor(Math.random() * 6));
      const newHp = player.hp - eDmg;

      if (newHp <= 0) {
        setPlayer(p => ({ ...p, hp: 10 }));
        setAdvisorMsg('Ты пал в бою! Восстанови здоровье и вернись!');
        return { ...b, enemy: { ...b.enemy!, hp: newEnemyHp }, log: [...b.log, `🗡️ Ты нанёс ${finalDmg}${critText}. 💀 ${b.enemy!.name} нанёс ${eDmg}. ТЫ ПРОИГРАЛ.`], phase: 'lose', playerAnimClass: 'battle-shake' };
      }

      setPlayer(p => ({ ...p, hp: newHp }));
      return {
        ...b,
        enemy: { ...b.enemy!, hp: newEnemyHp },
        log: [...b.log, `🗡️ Ты нанёс ${finalDmg}${critText}. ⚡ Враг нанёс ${eDmg} урона.`],
        turn: b.turn + 1,
        playerAnimClass: 'battle-shake',
        enemyAnimClass: 'hit-flash',
      };
    });
  }, [player, addGold, addXP]);

  const fleeeBattle = useCallback(() => {
    setBattle(b => ({ ...b, active: false, phase: 'idle', log: [] }));
    setAdvisorMsg('Ты отступил с поля боя. Иногда мудрость важнее храбрости.');
  }, []);

  const closeBattle = useCallback(() => {
    setBattle(b => ({ ...b, active: false, phase: 'idle', log: [] }));
  }, []);

  const healPlayer = useCallback(() => {
    setPlayer(p => {
      const cost = 50;
      if (p.gold < cost) { setAdvisorMsg('Нет золота на лечение!'); return p; }
      setAdvisorMsg('Лекарь вылечил твои раны!');
      return { ...p, gold: p.gold - cost, hp: p.maxHp };
    });
  }, []);

  return {
    tab, setTab,
    player, setPlayer,
    inventory, setInventory,
    units, quests, achievements,
    shopItems, battle,
    advisorMsg, advisorVisible, setAdvisorVisible, setAdvisorMsg,
    buyItem, equipItem, useConsumable, hireUnit, dismissUnit,
    claimQuest, startBattle, attackEnemy, fleeeBattle, closeBattle,
    healPlayer, addGold, addXP,
  };
}
