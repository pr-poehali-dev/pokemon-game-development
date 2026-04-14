import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';

const PLAYER_POKEMON = {
  name: 'Листвозавр',
  emoji: '🦖',
  type: 'grass',
  level: 5,
  maxHp: 120,
  hp: 120,
  moves: [
    { name: 'Листовой шторм', power: 40, type: 'grass', emoji: '🍃', pp: 15 },
    { name: 'Корневой удар', power: 55, type: 'normal', emoji: '🌿', pp: 10 },
    { name: 'Ядовитый плющ', power: 35, type: 'grass', emoji: '☠️', pp: 20 },
    { name: 'Солнечный луч', power: 80, type: 'fire', emoji: '☀️', pp: 5 },
  ],
};

const ENEMY_POKEMONS = [
  { name: 'Огнедыш', emoji: '🔥', type: 'fire', level: 4, maxHp: 100, hp: 100 },
  { name: 'Лесной Эльф', emoji: '🧝', type: 'grass', level: 3, maxHp: 90, hp: 90 },
  { name: 'Дельфиний', emoji: '🐬', type: 'water', level: 6, maxHp: 110, hp: 110 },
];

type BattlePhase = 'idle' | 'player_move' | 'enemy_move' | 'battle_end';

interface BattleLog {
  text: string;
  type: 'player' | 'enemy' | 'system';
}

interface BattleSystemProps {
  zone?: { name: string; emoji: string } | null;
  onBack: () => void;
}

export default function BattleSystem({ zone, onBack }: BattleSystemProps) {
  const [playerHp, setPlayerHp] = useState(PLAYER_POKEMON.maxHp);
  const [enemyHp, setEnemyHp] = useState(ENEMY_POKEMONS[0].maxHp);
  const [enemy] = useState(ENEMY_POKEMONS[Math.floor(Math.random() * ENEMY_POKEMONS.length)]);
  const [enemyCurrentHp, setEnemyCurrentHp] = useState(enemy.maxHp);
  const [phase, setPhase] = useState<BattlePhase>('idle');
  const [battleLog, setBattleLog] = useState<BattleLog[]>([
    { text: `${zone?.name || 'Дикая местность'}! Появился дикий ${enemy.name}!`, type: 'system' }
  ]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [flashPlayer, setFlashPlayer] = useState(false);
  const [flashEnemy, setFlashEnemy] = useState(false);
  const [winner, setWinner] = useState<'player' | 'enemy' | null>(null);
  const [expGained, setExpGained] = useState(0);

  const addLog = (text: string, type: BattleLog['type']) => {
    setBattleLog(prev => [...prev.slice(-6), { text, type }]);
  };

  const playerHpPct = Math.max(0, (playerHp / PLAYER_POKEMON.maxHp) * 100);
  const enemyHpPct = Math.max(0, (enemyCurrentHp / enemy.maxHp) * 100);

  const hpColor = (pct: number) => {
    if (pct > 50) return '#2ed573';
    if (pct > 25) return '#ffe500';
    return '#ff4757';
  };

  const handleMove = async (move: typeof PLAYER_POKEMON.moves[0]) => {
    if (phase !== 'idle' || isAnimating || winner) return;

    setIsAnimating(true);
    setPhase('player_move');

    const damage = Math.floor(move.power * (0.8 + Math.random() * 0.4));
    const critical = Math.random() < 0.15;
    const finalDamage = critical ? Math.floor(damage * 1.5) : damage;

    setFlashEnemy(true);
    setTimeout(() => setFlashEnemy(false), 400);

    const newEnemyHp = Math.max(0, enemyCurrentHp - finalDamage);
    setEnemyCurrentHp(newEnemyHp);

    addLog(
      `${PLAYER_POKEMON.name} применяет ${move.name}! ${critical ? '💥 Критический удар! ' : ''}−${finalDamage} HP`,
      'player'
    );

    await new Promise(r => setTimeout(r, 900));

    if (newEnemyHp <= 0) {
      const exp = Math.floor(enemy.level * 15 + Math.random() * 20);
      setExpGained(exp);
      addLog(`${enemy.name} проиграл! +${exp} опыта!`, 'system');
      setWinner('player');
      setPhase('battle_end');
      setIsAnimating(false);
      return;
    }

    // Enemy turn
    setPhase('enemy_move');
    const enemyDmg = Math.floor(enemy.level * 8 + Math.random() * 15);

    await new Promise(r => setTimeout(r, 500));

    setFlashPlayer(true);
    setTimeout(() => setFlashPlayer(false), 400);

    const newPlayerHp = Math.max(0, playerHp - enemyDmg);
    setPlayerHp(newPlayerHp);
    addLog(`${enemy.name} атакует! −${enemyDmg} HP`, 'enemy');

    await new Promise(r => setTimeout(r, 700));

    if (newPlayerHp <= 0) {
      addLog(`${PLAYER_POKEMON.name} проиграл...`, 'system');
      setWinner('enemy');
      setPhase('battle_end');
    } else {
      setPhase('idle');
    }

    setIsAnimating(false);
  };

  const handleFlee = () => {
    addLog('Вы сбежали из боя!', 'system');
    setTimeout(onBack, 800);
  };

  const handleRestart = () => {
    setPlayerHp(PLAYER_POKEMON.maxHp);
    setEnemyCurrentHp(enemy.maxHp);
    setPhase('idle');
    setWinner(null);
    setExpGained(0);
    setBattleLog([{ text: `Новый бой! ${enemy.name} снова атакует!`, type: 'system' }]);
  };

  return (
    <div className="h-full flex flex-col p-4 gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center hover:bg-slate-700 transition-colors"
        >
          <Icon name="ChevronLeft" size={16} className="text-slate-300" />
        </button>
        <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center border border-red-500/30">
          <Icon name="Swords" size={16} className="text-red-400" />
        </div>
        <h2 className="font-orbitron text-lg font-bold text-red-400" style={{ textShadow: '0 0 10px rgba(255,71,87,0.5)' }}>
          БОЕВАЯ АРЕНА
        </h2>
        {zone && (
          <span className="ml-auto text-xs font-rubik text-slate-400">{zone.emoji} {zone.name}</span>
        )}
      </div>

      {/* Battle field */}
      <div
        className="relative rounded-2xl overflow-hidden flex-shrink-0"
        style={{
          height: '220px',
          background: 'linear-gradient(180deg, #0a0f1e 0%, #0d1a2e 60%, #1a2a40 100%)',
          boxShadow: 'inset 0 0 40px rgba(0,0,0,0.5)'
        }}
      >
        {/* Background image */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(https://cdn.poehali.dev/projects/e60ed1f2-73a4-4900-9745-54d5b123f2c9/files/4f140a94-4d0b-492c-a249-f07af83eeec8.jpg)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />

        {/* Ground lines */}
        <div className="absolute bottom-12 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
        <div className="absolute bottom-8 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/15 to-transparent" />

        {/* Enemy side */}
        <div className="absolute top-4 left-6 w-52">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="font-orbitron text-xs font-bold text-white">{enemy.name}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded type-${enemy.type} font-rubik font-medium text-white text-[10px]`}>
                {enemy.type}
              </span>
            </div>
            <span className="text-xs font-orbitron text-slate-400">Ур.{enemy.level}</span>
          </div>
          <div className="flex justify-between text-xs font-rubik text-slate-400 mb-1">
            <span>HP</span>
            <span>{enemyCurrentHp}/{enemy.maxHp}</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="h-2 rounded-full transition-all duration-700"
              style={{ width: `${enemyHpPct}%`, backgroundColor: hpColor(enemyHpPct) }}
            />
          </div>
        </div>

        {/* Enemy pokemon */}
        <div
          className={`absolute top-8 right-8 text-7xl transition-all duration-300 ${flashEnemy ? 'opacity-30 scale-110' : 'opacity-100 scale-100'} animate-float`}
          style={{ filter: flashEnemy ? 'brightness(3) saturate(0)' : 'drop-shadow(0 0 12px rgba(255,255,255,0.2))' }}
        >
          {enemy.emoji}
        </div>

        {/* Player pokemon */}
        <div
          className={`absolute bottom-16 left-10 text-6xl transition-all duration-300 ${flashPlayer ? 'opacity-30 scale-110' : 'opacity-100 scale-100'}`}
          style={{
            transform: flashPlayer ? 'scale(1.1) translateX(-8px)' : 'scale(1)',
            filter: 'drop-shadow(0 0 12px rgba(0,245,255,0.3))'
          }}
        >
          {PLAYER_POKEMON.emoji}
        </div>

        {/* Player HP */}
        <div className="absolute bottom-4 right-6 w-52">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="font-orbitron text-xs font-bold text-white">{PLAYER_POKEMON.name}</span>
              <span className="text-xs px-1.5 py-0.5 rounded type-grass font-rubik font-medium text-white text-[10px]">grass</span>
            </div>
            <span className="text-xs font-orbitron text-slate-400">Ур.{PLAYER_POKEMON.level}</span>
          </div>
          <div className="flex justify-between text-xs font-rubik text-slate-400 mb-1">
            <span>HP</span>
            <span>{playerHp}/{PLAYER_POKEMON.maxHp}</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="h-2 rounded-full transition-all duration-700"
              style={{ width: `${playerHpPct}%`, backgroundColor: hpColor(playerHpPct) }}
            />
          </div>
        </div>

        {/* Win/Lose overlay */}
        {winner && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3 animate-fade-in">
            {winner === 'player' ? (
              <>
                <div className="text-5xl animate-bounce-in">🏆</div>
                <p className="font-orbitron text-xl font-bold text-yellow-400" style={{ textShadow: '0 0 20px rgba(255,229,0,0.8)' }}>
                  ПОБЕДА!
                </p>
                <p className="text-sm font-rubik text-slate-300">+{expGained} опыта получено</p>
              </>
            ) : (
              <>
                <div className="text-5xl">💀</div>
                <p className="font-orbitron text-xl font-bold text-red-400">ПОРАЖЕНИЕ</p>
                <p className="text-sm font-rubik text-slate-400">Попробуй снова!</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Battle log */}
      <div className="glass-card rounded-xl p-3 border border-slate-700 flex-shrink-0" style={{ minHeight: '80px' }}>
        <div className="flex flex-col gap-1 justify-end" style={{ minHeight: '60px' }}>
          {battleLog.slice(-3).map((log, i) => (
            <p
              key={i}
              className={`text-xs font-rubik animate-fade-in ${
                log.type === 'player' ? 'text-cyan-300' :
                log.type === 'enemy' ? 'text-red-300' :
                'text-yellow-300'
              }`}
            >
              {log.text}
            </p>
          ))}
        </div>
      </div>

      {/* Actions */}
      {!winner ? (
        <div className="grid grid-cols-2 gap-2">
          {PLAYER_POKEMON.moves.map((move, i) => (
            <button
              key={i}
              onClick={() => handleMove(move)}
              disabled={isAnimating}
              className={`
                glass-card rounded-xl p-3 border border-slate-700 text-left
                transition-all duration-200 hover:scale-105 active:scale-95
                disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100
                hover:border-cyan-500/50
              `}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{move.emoji}</span>
                <span className="font-orbitron text-xs font-bold text-white">{move.name}</span>
              </div>
              <div className="flex gap-2">
                <span className={`text-[10px] px-1.5 py-0.5 rounded type-${move.type} font-rubik text-white`}>
                  {move.type}
                </span>
                <span className="text-[10px] font-rubik text-slate-400">Сила: {move.power}</span>
                <span className="text-[10px] font-rubik text-slate-500 ml-auto">PP {move.pp}</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex gap-3">
          <button
            onClick={handleRestart}
            className="flex-1 py-3 rounded-xl font-orbitron text-sm font-bold text-black transition-all duration-200 hover:scale-105 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #00f5ff, #00b4d8)', boxShadow: '0 0 16px rgba(0,245,255,0.4)' }}
          >
            СНОВА В БОЙ
          </button>
          <button
            onClick={onBack}
            className="flex-1 py-3 rounded-xl font-orbitron text-sm font-bold text-slate-300 border border-slate-600 transition-all duration-200 hover:bg-slate-800 hover:scale-105"
          >
            НА КАРТУ
          </button>
        </div>
      )}

      {!winner && (
        <button
          onClick={handleFlee}
          disabled={isAnimating}
          className="py-2 rounded-xl font-rubik text-xs text-slate-500 border border-slate-800 hover:border-slate-600 hover:text-slate-300 transition-all duration-200 disabled:opacity-40"
        >
          Сбежать
        </button>
      )}
    </div>
  );
}
