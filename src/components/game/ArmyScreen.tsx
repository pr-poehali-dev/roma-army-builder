import { Unit, UnitType, Player } from '@/store/gameStore';

interface Props {
  units: Unit[];
  player: Player;
  onHire: (id: UnitType) => void;
  onDismiss: (id: UnitType) => void;
  onStartBattle: (enemyId: string) => void;
}

const ENEMIES_LIST = [
  { id: 'barbarian', name: 'Варвар', icon: '👹', level: 1, hp: 80, atk: 12, def: 4, reward: '25🪙 30XP' },
  { id: 'gaul', name: 'Галл', icon: '⚔️', level: 3, hp: 120, atk: 18, def: 7, reward: '40🪙 50XP' },
  { id: 'carthaginian', name: 'Карфагенянин', icon: '🐘', level: 5, hp: 180, atk: 24, def: 12, reward: '65🪙 80XP' },
  { id: 'gladiator', name: 'Гладиатор', icon: '🗡️', level: 8, hp: 250, atk: 35, def: 18, reward: '100🪙 130XP' },
  { id: 'boss_hannibal', name: 'Ганнибал', icon: '🦁', level: 12, hp: 600, atk: 55, def: 30, reward: '400🪙 500XP', isBoss: true },
  { id: 'boss_spartacus', name: 'Спартак', icon: '🔥', level: 18, hp: 900, atk: 75, def: 40, reward: '700🪙 900XP', isBoss: true },
];

export default function ArmyScreen({ units, player, onHire, onDismiss, onStartBattle }: Props) {
  const totalArmy = units.reduce((s, u) => s + u.count, 0);
  const totalAtk = units.reduce((s, u) => s + u.atk * u.count, 0);

  return (
    <div className="animate-pixel-enter space-y-4">
      {/* Army summary */}
      <div className="pixel-card pixel-border-gold">
        <p className="font-pixel text-[8px] text-amber-400 mb-3">⚔️ МОЙ ЛЕГИОН</p>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="pixel-card" style={{ padding: '10px' }}>
            <div className="font-pixel text-amber-400 text-[16px]">{totalArmy}</div>
            <div className="font-pixel text-[6px] mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>ВОИНОВ</div>
          </div>
          <div className="pixel-card" style={{ padding: '10px' }}>
            <div className="font-pixel text-red-400 text-[16px]">{totalAtk + player.atk}</div>
            <div className="font-pixel text-[6px] mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>АТК ЛЕГИОНА</div>
          </div>
          <div className="pixel-card" style={{ padding: '10px' }}>
            <div className="font-pixel text-yellow-400 text-[16px]">{player.gold}</div>
            <div className="font-pixel text-[6px] mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>ЗОЛОТО</div>
          </div>
        </div>
      </div>

      {/* Hire units */}
      <div className="pixel-card">
        <p className="font-pixel text-[8px] text-amber-400 mb-3">🪖 НАЙМ ВОИНОВ</p>
        <div className="space-y-3">
          {units.map(unit => (
            <div key={unit.id} className="pixel-card" style={{ padding: '10px' }}>
              <div className="flex items-center gap-3">
                <div className="text-3xl leading-none">{unit.icon}</div>
                <div className="flex-1">
                  <div className="font-pixel text-amber-400 text-[9px]">{unit.name}</div>
                  <div className="font-pixel text-[6px] mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>{unit.description}</div>
                  <div className="flex gap-3 mt-1">
                    <span className="font-pixel text-[6px] text-red-400">⚔️ {unit.atk}</span>
                    <span className="font-pixel text-[6px] text-blue-400">🛡️ {unit.def}</span>
                    <span className="font-pixel text-[6px] text-green-400">❤️ {unit.hp}</span>
                    <span className="font-pixel text-[6px] text-yellow-400">💰 {unit.cost}</span>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="font-pixel text-amber-400 text-[14px]">{unit.count}</div>
                  <div className="flex gap-1">
                    <button className="pixel-btn text-[8px]" style={{ padding: '5px 8px', minWidth: 0 }} onClick={() => onHire(unit.id as UnitType)}>+</button>
                    {unit.count > 0 && (
                      <button className="pixel-btn pixel-btn-red text-[8px]" style={{ padding: '5px 8px', minWidth: 0 }} onClick={() => onDismiss(unit.id as UnitType)}>-</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Battles */}
      <div className="pixel-card">
        <p className="font-pixel text-[8px] text-amber-400 mb-3">⚔️ ВРАГИ РИМ</p>
        <div className="space-y-2">
          {ENEMIES_LIST.map(enemy => (
            <div key={enemy.id} className={`pixel-card flex items-center gap-3 ${enemy.isBoss ? 'pixel-border-legendary' : ''}`} style={{ padding: '10px' }}>
              <div className="text-3xl leading-none">{enemy.icon}</div>
              <div className="flex-1">
                <div className={`font-pixel text-[8px] ${enemy.isBoss ? 'rarity-legendary' : 'text-amber-400'}`}>
                  {enemy.isBoss ? '⚡ БОСС: ' : ''}{enemy.name}
                </div>
                <div className="flex gap-3 mt-1">
                  <span className="font-pixel text-[6px] text-red-400">HP {enemy.hp}</span>
                  <span className="font-pixel text-[6px] text-orange-400">⚔️ {enemy.atk}</span>
                  <span className="font-pixel text-[6px] text-blue-400">🛡️ {enemy.def}</span>
                </div>
                <div className="font-pixel text-[6px] mt-1 text-yellow-400">Награда: {enemy.reward}</div>
              </div>
              <button
                className={`pixel-btn ${enemy.isBoss ? '' : 'pixel-btn-red'} text-[7px]`}
                style={enemy.isBoss ? { borderColor: 'hsl(35 95% 55%)', color: 'hsl(35 95% 65%)', padding: '8px 10px' } : { padding: '8px 10px' }}
                onClick={() => onStartBattle(enemy.id)}
              >
                {enemy.isBoss ? '⚡БОЙ' : 'АТАКА'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
