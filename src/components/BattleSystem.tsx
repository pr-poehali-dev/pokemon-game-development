import { useState, useRef } from 'react';
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

interface Projectile {
  id: number;
  emoji: string;
  fromPlayer: boolean;
  color: string;
}

interface DamageNumber {
  id: number;
  value: number;
  critical: boolean;
  x: number;
  fromPlayer: boolean;
}

interface BattleSystemProps {
  zone?: { name: string; emoji: string } | null;
  onBack: () => void;
}

export default function BattleSystem({ zone, onBack }: BattleSystemProps) {
  const [playerHp, setPlayerHp] = useState(PLAYER_POKEMON.maxHp);
  const [enemy] = useState(ENEMY_POKEMONS[Math.floor(Math.random() * ENEMY_POKEMONS.length)]);
  const [enemyCurrentHp, setEnemyCurrentHp] = useState(enemy.maxHp);
  const [phase, setPhase] = useState<BattlePhase>('idle');
  const [battleLog, setBattleLog] = useState<BattleLog[]>([
    { text: `${zone?.name || 'Дикая местность'}! Появился дикий ${enemy.name}!`, type: 'system' }
  ]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [winner, setWinner] = useState<'player' | 'enemy' | null>(null);
  const [expGained, setExpGained] = useState(0);

  // Animation states
  const [playerAttacking, setPlayerAttacking] = useState(false);
  const [enemyAttacking, setEnemyAttacking] = useState(false);
  const [playerHit, setPlayerHit] = useState(false);
  const [enemyHit, setEnemyHit] = useState(false);
  const [screenFlash, setScreenFlash] = useState<string | null>(null);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [damageNumbers, setDamageNumbers] = useState<DamageNumber[]>([]);
  const projectileIdRef = useRef(0);
  const damageIdRef = useRef(0);

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

  const spawnProjectile = (emoji: string, fromPlayer: boolean, color: string) => {
    const id = projectileIdRef.current++;
    setProjectiles(prev => [...prev, { id, emoji, fromPlayer, color }]);
    setTimeout(() => setProjectiles(prev => prev.filter(p => p.id !== id)), 700);
  };

  const spawnDamage = (value: number, critical: boolean, fromPlayer: boolean) => {
    const id = damageIdRef.current++;
    const x = fromPlayer ? 65 + Math.random() * 20 : 15 + Math.random() * 20;
    setDamageNumbers(prev => [...prev, { id, value, critical, x, fromPlayer }]);
    setTimeout(() => setDamageNumbers(prev => prev.filter(d => d.id !== id)), 900);
  };

  const triggerFlash = (color: string) => {
    setScreenFlash(color);
    setTimeout(() => setScreenFlash(null), 250);
  };

  const handleMove = async (move: typeof PLAYER_POKEMON.moves[0]) => {
    if (phase !== 'idle' || isAnimating || winner) return;

    setIsAnimating(true);
    setPhase('player_move');

    const damage = Math.floor(move.power * (0.8 + Math.random() * 0.4));
    const critical = Math.random() < 0.15;
    const finalDamage = critical ? Math.floor(damage * 1.5) : damage;

    // Player jumps forward
    setPlayerAttacking(true);
    await new Promise(r => setTimeout(r, 200));

    // Projectile flies to enemy
    const projColor = move.type === 'grass' ? '#2ed573' : move.type === 'fire' ? '#ff6b35' : move.type === 'water' ? '#00b4d8' : '#ffe500';
    spawnProjectile(move.emoji, true, projColor);
    await new Promise(r => setTimeout(r, 350));

    // Enemy gets hit
    setPlayerAttacking(false);
    setEnemyHit(true);
    if (critical) triggerFlash('rgba(255,229,0,0.25)');
    else triggerFlash('rgba(255,71,87,0.15)');
    spawnDamage(finalDamage, critical, true);

    const newEnemyHp = Math.max(0, enemyCurrentHp - finalDamage);
    setEnemyCurrentHp(newEnemyHp);

    addLog(
      `${PLAYER_POKEMON.name} → ${move.name}! ${critical ? '💥 КРИТ! ' : ''}−${finalDamage} HP`,
      'player'
    );

    await new Promise(r => setTimeout(r, 400));
    setEnemyHit(false);

    if (newEnemyHp <= 0) {
      triggerFlash('rgba(255,229,0,0.4)');
      const exp = Math.floor(enemy.level * 15 + Math.random() * 20);
      setExpGained(exp);
      addLog(`${enemy.name} повержен! +${exp} EXP!`, 'system');
      setWinner('player');
      setPhase('battle_end');
      setIsAnimating(false);
      return;
    }

    await new Promise(r => setTimeout(r, 400));

    // Enemy turn
    setPhase('enemy_move');
    const enemyDmg = Math.floor(enemy.level * 8 + Math.random() * 15);

    // Enemy jumps
    setEnemyAttacking(true);
    await new Promise(r => setTimeout(r, 200));

    spawnProjectile('💢', false, '#ff4757');
    await new Promise(r => setTimeout(r, 350));

    setEnemyAttacking(false);
    setPlayerHit(true);
    triggerFlash('rgba(255,71,87,0.2)');
    spawnDamage(enemyDmg, false, false);

    const newPlayerHp = Math.max(0, playerHp - enemyDmg);
    setPlayerHp(newPlayerHp);
    addLog(`${enemy.name} атакует! −${enemyDmg} HP`, 'enemy');

    await new Promise(r => setTimeout(r, 500));
    setPlayerHit(false);

    if (newPlayerHp <= 0) {
      addLog(`${PLAYER_POKEMON.name} не может сражаться...`, 'system');
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
    setProjectiles([]);
    setDamageNumbers([]);
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
        {phase !== 'idle' && phase !== 'battle_end' && (
          <span className={`ml-auto text-xs font-orbitron font-bold animate-pulse ${
            phase === 'player_move' ? 'text-cyan-400' : 'text-red-400'
          }`}>
            {phase === 'player_move' ? '⚡ Атака!' : '💢 Враг атакует!'}
          </span>
        )}
      </div>

      {/* Battle field */}
      <div
        className="relative rounded-2xl overflow-hidden flex-shrink-0"
        style={{
          height: '230px',
          background: 'linear-gradient(180deg, #0a0f1e 0%, #0d1a2e 60%, #1a2a40 100%)',
          boxShadow: 'inset 0 0 40px rgba(0,0,0,0.5)'
        }}
      >
        {/* Screen flash overlay */}
        {screenFlash && (
          <div
            className="absolute inset-0 z-30 pointer-events-none rounded-2xl"
            style={{ background: screenFlash, transition: 'opacity 0.1s' }}
          />
        )}

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

        {/* Projectiles */}
        {projectiles.map(p => (
          <div
            key={p.id}
            className="absolute z-20 text-2xl pointer-events-none"
            style={{
              top: p.fromPlayer ? '55%' : '30%',
              left: p.fromPlayer ? '20%' : '75%',
              animation: p.fromPlayer
                ? 'projectile-ltr 0.65s cubic-bezier(0.25,0.46,0.45,0.94) forwards'
                : 'projectile-rtl 0.65s cubic-bezier(0.25,0.46,0.45,0.94) forwards',
              filter: `drop-shadow(0 0 8px ${p.color})`,
            }}
          >
            {p.emoji}
          </div>
        ))}

        {/* Damage numbers */}
        {damageNumbers.map(d => (
          <div
            key={d.id}
            className="absolute z-20 pointer-events-none font-orbitron font-black"
            style={{
              left: `${d.x}%`,
              top: d.fromPlayer ? '25%' : '55%',
              fontSize: d.critical ? '22px' : '16px',
              color: d.critical ? '#ffe500' : '#ff4757',
              textShadow: d.critical
                ? '0 0 12px rgba(255,229,0,0.9), 0 0 24px rgba(255,229,0,0.5)'
                : '0 0 8px rgba(255,71,87,0.7)',
              animation: 'damage-float 0.9s ease-out forwards',
            }}
          >
            {d.critical && <span className="text-xs mr-0.5">💥</span>}
            -{d.value}
          </div>
        ))}

        {/* Enemy side info */}
        <div className="absolute top-3 left-4 w-52">
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
          className="absolute text-7xl select-none"
          style={{
            top: '20px',
            right: '40px',
            filter: enemyHit
              ? 'brightness(4) saturate(0) drop-shadow(0 0 16px #fff)'
              : 'drop-shadow(0 0 12px rgba(255,100,50,0.4))',
            transform: enemyAttacking
              ? 'translateX(-30px) scale(1.15)'
              : enemyHit
              ? 'translateX(12px) scale(0.9) rotate(8deg)'
              : winner === 'enemy' ? 'scale(1.2)' : 'scale(1)',
            transition: 'transform 0.25s cubic-bezier(0.36,0.07,0.19,0.97), filter 0.15s',
            animation: !enemyAttacking && !enemyHit && !winner ? 'float 3s ease-in-out infinite' : 'none',
            opacity: winner === 'player' ? 0.2 : 1,
          }}
        >
          {enemy.emoji}
        </div>

        {/* Player pokemon */}
        <div
          className="absolute text-6xl select-none"
          style={{
            bottom: '60px',
            left: '40px',
            filter: playerHit
              ? 'brightness(4) saturate(0) drop-shadow(0 0 16px #fff)'
              : 'drop-shadow(0 0 12px rgba(0,245,255,0.4))',
            transform: playerAttacking
              ? 'translateX(40px) translateY(-12px) scale(1.2)'
              : playerHit
              ? 'translateX(-12px) scale(0.9) rotate(-8deg)'
              : winner === 'player' ? 'scale(1.2) translateY(-6px)' : 'scale(1)',
            transition: 'transform 0.25s cubic-bezier(0.36,0.07,0.19,0.97), filter 0.15s',
            opacity: winner === 'enemy' ? 0.2 : 1,
          }}
        >
          {PLAYER_POKEMON.emoji}
        </div>

        {/* Player HP */}
        <div className="absolute bottom-3 right-4 w-52">
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
          <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center gap-3 animate-fade-in z-20">
            {winner === 'player' ? (
              <>
                <div className="text-5xl" style={{ animation: 'bounce-in 0.6s cubic-bezier(0.36,0.07,0.19,0.97) forwards' }}>🏆</div>
                <p className="font-orbitron text-2xl font-black text-yellow-400" style={{ textShadow: '0 0 24px rgba(255,229,0,0.9)' }}>
                  ПОБЕДА!
                </p>
                <p className="text-sm font-rubik text-slate-300">+{expGained} EXP получено</p>
              </>
            ) : (
              <>
                <div className="text-5xl">💀</div>
                <p className="font-orbitron text-2xl font-black text-red-400" style={{ textShadow: '0 0 16px rgba(255,71,87,0.7)' }}>
                  ПОРАЖЕНИЕ
                </p>
                <p className="text-sm font-rubik text-slate-400">Не сдавайся!</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Battle log */}
      <div className="glass-card rounded-xl px-3 py-2 border border-slate-700 flex-shrink-0" style={{ minHeight: '72px' }}>
        <div className="flex flex-col gap-1 justify-end" style={{ minHeight: '54px' }}>
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

      {/* Keyframes injected inline */}
      <style>{`
        @keyframes projectile-ltr {
          0%   { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 1; }
          60%  { transform: translate(320px, -60px) scale(1.3) rotate(180deg); opacity: 1; }
          100% { transform: translate(400px, -20px) scale(0.3) rotate(360deg); opacity: 0; }
        }
        @keyframes projectile-rtl {
          0%   { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 1; }
          60%  { transform: translate(-320px, 50px) scale(1.3) rotate(-180deg); opacity: 1; }
          100% { transform: translate(-400px, 20px) scale(0.3) rotate(-360deg); opacity: 0; }
        }
        @keyframes damage-float {
          0%   { transform: translateY(0) scale(0.5); opacity: 0; }
          20%  { transform: translateY(-8px) scale(1.2); opacity: 1; }
          60%  { transform: translateY(-24px) scale(1); opacity: 1; }
          100% { transform: translateY(-44px) scale(0.8); opacity: 0; }
        }
        @keyframes bounce-in {
          0%   { transform: scale(0.3); opacity: 0; }
          50%  { transform: scale(1.15); }
          70%  { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
