import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/icon';

const PLAYER_POKEMON = {
  name: 'Листвозавр',
  emoji: '🦖',
  type: 'grass',
  level: 5,
  maxHp: 120,
  moves: [
    { name: 'Листовой шторм', power: 40, type: 'grass', emoji: '🍃', pp: 15 },
    { name: 'Корневой удар', power: 55, type: 'normal', emoji: '🌿', pp: 10 },
    { name: 'Ядовитый плющ', power: 35, type: 'grass', emoji: '☠️', pp: 20 },
    { name: 'Солнечный луч', power: 80, type: 'fire', emoji: '☀️', pp: 5 },
  ],
};

const ENEMY_POKEMONS = [
  { name: 'Огнедыш', emoji: '🔥', type: 'fire', level: 4, maxHp: 100 },
  { name: 'Лесной Эльф', emoji: '🧝', type: 'grass', level: 3, maxHp: 90 },
  { name: 'Дельфиний', emoji: '🐬', type: 'water', level: 6, maxHp: 110 },
];

type BattlePhase = 'idle' | 'player_move' | 'enemy_move' | 'battle_end';
type PokemonState = 'idle' | 'attack' | 'hit' | 'faint';
interface BattleLog { text: string; type: 'player' | 'enemy' | 'system'; }
interface Projectile { id: number; emoji: string; fromPlayer: boolean; color: string; }
interface DamageNum { id: number; value: number; critical: boolean; fromPlayer: boolean; }
interface Particle { id: number; x: number; y: number; color: string; angle: number; }

interface BattleSystemProps {
  zone?: { name: string; emoji: string } | null;
  onBack: () => void;
}

export default function BattleSystem({ zone, onBack }: BattleSystemProps) {
  const [playerHp, setPlayerHp] = useState(PLAYER_POKEMON.maxHp);
  const [enemy] = useState(ENEMY_POKEMONS[Math.floor(Math.random() * ENEMY_POKEMONS.length)]);
  const [enemyHp, setEnemyHp] = useState(enemy.maxHp);
  const [phase, setPhase] = useState<BattlePhase>('idle');
  const [isAnimating, setIsAnimating] = useState(false);
  const [winner, setWinner] = useState<'player' | 'enemy' | null>(null);
  const [expGained, setExpGained] = useState(0);
  const [log, setLog] = useState<BattleLog[]>([
    { text: `${zone?.name || 'Дикая местность'}! Появился дикий ${enemy.name}!`, type: 'system' }
  ]);

  // 3D animation states
  const [playerState, setPlayerState] = useState<PokemonState>('idle');
  const [enemyState, setEnemyState] = useState<PokemonState>('idle');
  const [arenaShake, setArenaShake] = useState(false);
  const [flashColor, setFlashColor] = useState<string | null>(null);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [damageNums, setDamageNums] = useState<DamageNum[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [cameraAngle, setCameraAngle] = useState(0);

  const pidRef = useRef(0);
  const didRef = useRef(0);
  const partRef = useRef(0);
  const frameRef = useRef<number>(0);
  const timeRef = useRef(0);

  // Idle camera sway
  useEffect(() => {
    const animate = (t: number) => {
      if (!timeRef.current) timeRef.current = t;
      setCameraAngle(Math.sin((t - timeRef.current) / 2200) * 1.8);
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  const addLog = (text: string, type: BattleLog['type']) =>
    setLog(prev => [...prev.slice(-5), { text, type }]);

  const hpColor = (pct: number) =>
    pct > 50 ? '#2ed573' : pct > 25 ? '#ffe500' : '#ff4757';

  const spawnProjectile = (emoji: string, fromPlayer: boolean, color: string) => {
    const id = pidRef.current++;
    setProjectiles(p => [...p, { id, emoji, fromPlayer, color }]);
    setTimeout(() => setProjectiles(p => p.filter(x => x.id !== id)), 750);
  };

  const spawnDamage = (value: number, critical: boolean, fromPlayer: boolean) => {
    const id = didRef.current++;
    setDamageNums(d => [...d, { id, value, critical, fromPlayer }]);
    setTimeout(() => setDamageNums(d => d.filter(x => x.id !== id)), 1000);
  };

  const spawnParticles = (color: string, count = 8) => {
    const newP: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: partRef.current++,
      x: 30 + Math.random() * 40,
      y: 15 + Math.random() * 50,
      color,
      angle: (360 / count) * i + Math.random() * 20,
    }));
    setParticles(p => [...p, ...newP]);
    setTimeout(() => setParticles(p => p.filter(x => !newP.find(n => n.id === x.id))), 900);
  };

  const shakeArena = () => {
    setArenaShake(true);
    setTimeout(() => setArenaShake(false), 420);
  };

  const flash = (color: string) => {
    setFlashColor(color);
    setTimeout(() => setFlashColor(null), 200);
  };

  const handleMove = async (move: typeof PLAYER_POKEMON.moves[0]) => {
    if (phase !== 'idle' || isAnimating || winner) return;
    setIsAnimating(true);
    setPhase('player_move');

    const dmg = Math.floor(move.power * (0.8 + Math.random() * 0.4));
    const critical = Math.random() < 0.15;
    const finalDmg = critical ? Math.floor(dmg * 1.5) : dmg;
    const projColor = move.type === 'grass' ? '#2ed573' : move.type === 'fire' ? '#ff6b35' : move.type === 'water' ? '#00b4d8' : '#ffe500';

    setPlayerState('attack');
    await new Promise(r => setTimeout(r, 190));

    spawnProjectile(move.emoji, true, projColor);
    spawnParticles(projColor, 6);
    await new Promise(r => setTimeout(r, 390));

    setPlayerState('idle');
    setEnemyState('hit');
    shakeArena();
    flash(critical ? 'rgba(255,229,0,0.3)' : 'rgba(255,71,87,0.18)');
    spawnDamage(finalDmg, critical, true);
    if (critical) spawnParticles('#ffe500', 14);

    const newEnemyHp = Math.max(0, enemyHp - finalDmg);
    setEnemyHp(newEnemyHp);
    addLog(`${PLAYER_POKEMON.name} → ${move.name}!${critical ? ' 💥 КРИТ!' : ''} −${finalDmg} HP`, 'player');

    await new Promise(r => setTimeout(r, 460));
    setEnemyState(newEnemyHp <= 0 ? 'faint' : 'idle');

    if (newEnemyHp <= 0) {
      flash('rgba(255,229,0,0.5)');
      spawnParticles('#ffe500', 18);
      const exp = Math.floor(enemy.level * 15 + Math.random() * 20);
      setExpGained(exp);
      addLog(`${enemy.name} повержен! +${exp} EXP!`, 'system');
      setWinner('player');
      setPhase('battle_end');
      setIsAnimating(false);
      return;
    }

    await new Promise(r => setTimeout(r, 360));

    setPhase('enemy_move');
    setEnemyState('attack');
    await new Promise(r => setTimeout(r, 190));

    spawnProjectile('💢', false, '#ff4757');
    spawnParticles('#ff4757', 5);
    await new Promise(r => setTimeout(r, 390));

    setEnemyState('idle');
    setPlayerState('hit');
    shakeArena();
    flash('rgba(255,71,87,0.22)');

    const enemyDmg = Math.floor(enemy.level * 8 + Math.random() * 15);
    spawnDamage(enemyDmg, false, false);
    const newPlayerHp = Math.max(0, playerHp - enemyDmg);
    setPlayerHp(newPlayerHp);
    addLog(`${enemy.name} атакует! −${enemyDmg} HP`, 'enemy');

    await new Promise(r => setTimeout(r, 460));
    setPlayerState(newPlayerHp <= 0 ? 'faint' : 'idle');

    if (newPlayerHp <= 0) {
      addLog(`${PLAYER_POKEMON.name} не может сражаться...`, 'system');
      setWinner('enemy');
      setPhase('battle_end');
    } else {
      setPhase('idle');
    }
    setIsAnimating(false);
  };

  const handleRestart = () => {
    setPlayerHp(PLAYER_POKEMON.maxHp);
    setEnemyHp(enemy.maxHp);
    setPhase('idle');
    setWinner(null);
    setExpGained(0);
    setPlayerState('idle');
    setEnemyState('idle');
    setProjectiles([]);
    setDamageNums([]);
    setParticles([]);
    setLog([{ text: `Реванш! ${enemy.name} снова в бою!`, type: 'system' }]);
  };

  const playerHpPct = Math.max(0, (playerHp / PLAYER_POKEMON.maxHp) * 100);
  const enemyHpPct = Math.max(0, (enemyHp / enemy.maxHp) * 100);

  const getPlayerTransform = () => {
    if (playerState === 'attack') return 'translateZ(70px) translateX(45px) translateY(-22px) rotateY(-18deg) rotateX(5deg) scale(1.28)';
    if (playerState === 'hit')    return 'translateZ(-25px) translateX(-22px) rotateY(22deg) rotateZ(-10deg) scale(0.86)';
    if (playerState === 'faint')  return 'translateZ(-35px) rotateZ(-90deg) translateY(36px) scale(0.68) rotateX(20deg)';
    return `translateZ(12px) rotateY(${cameraAngle * 0.6}deg) rotateX(${Math.sin(cameraAngle) * 0.5}deg)`;
  };

  const getEnemyTransform = () => {
    if (enemyState === 'attack') return 'translateZ(70px) translateX(-45px) translateY(-22px) rotateY(18deg) rotateX(5deg) scale(1.28)';
    if (enemyState === 'hit')    return 'translateZ(-25px) translateX(22px) rotateY(-22deg) rotateZ(10deg) scale(0.86)';
    if (enemyState === 'faint')  return 'translateZ(-35px) rotateZ(90deg) translateY(36px) scale(0.68) rotateX(20deg)';
    return `translateZ(12px) rotateY(${-cameraAngle * 0.6}deg) rotateX(${Math.sin(cameraAngle) * 0.5}deg)`;
  };

  return (
    <div className="h-full flex flex-col p-4 gap-3">

      {/* Header */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <button onClick={onBack}
          className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center hover:bg-slate-700 transition-colors">
          <Icon name="ChevronLeft" size={16} className="text-slate-300" />
        </button>
        <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center border border-red-500/30">
          <Icon name="Swords" size={16} className="text-red-400" />
        </div>
        <h2 className="font-orbitron text-lg font-bold text-red-400"
          style={{ textShadow: '0 0 10px rgba(255,71,87,0.5)' }}>БОЕВАЯ АРЕНА</h2>
        {zone && <span className="ml-auto text-xs font-rubik text-slate-400">{zone.emoji} {zone.name}</span>}
        {phase !== 'idle' && phase !== 'battle_end' && (
          <span className={`ml-auto text-xs font-orbitron font-bold animate-pulse ${phase === 'player_move' ? 'text-cyan-400' : 'text-red-400'}`}>
            {phase === 'player_move' ? '⚡ Атака!' : '💢 Враг!'}
          </span>
        )}
      </div>

      {/* ═══ 3D ARENA ═══ */}
      <div
        className="relative rounded-2xl overflow-hidden flex-shrink-0"
        style={{
          height: '250px',
          perspective: '900px',
          background: 'linear-gradient(180deg,#080f1e 0%,#0c1830 55%,#172540 100%)',
          boxShadow: 'inset 0 0 60px rgba(0,0,0,0.7)',
          animation: arenaShake ? 'arena-shake 0.42s ease-in-out' : 'none',
        }}
      >
        {/* Flash overlay */}
        {flashColor && (
          <div className="absolute inset-0 z-30 rounded-2xl pointer-events-none"
            style={{ background: flashColor }} />
        )}

        {/* BG image */}
        <div className="absolute inset-0 opacity-25" style={{
          backgroundImage: `url(https://cdn.poehali.dev/projects/e60ed1f2-73a4-4900-9745-54d5b123f2c9/files/4f140a94-4d0b-492c-a249-f07af83eeec8.jpg)`,
          backgroundSize: 'cover', backgroundPosition: 'center',
        }} />

        {/* 3D ground perspective grid */}
        <svg className="absolute bottom-0 left-0 w-full" style={{ height: '80px' }} viewBox="0 0 800 80" preserveAspectRatio="none">
          <defs>
            <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(0,245,255,0)" />
              <stop offset="100%" stopColor="rgba(0,245,255,0.15)" />
            </linearGradient>
          </defs>
          <rect width="800" height="80" fill="url(#groundGrad)" />
          {[0,1,2,3,4,5,6].map(i => (
            <line key={`v${i}`} x1={i * 133} y1="0" x2={400 + (i - 3) * 44} y2="80"
              stroke="rgba(0,245,255,0.18)" strokeWidth="0.8" />
          ))}
          {[0,1,2,3].map(i => (
            <line key={`h${i}`} x1="0" y1={i * 22} x2="800" y2={i * 22}
              stroke="rgba(0,245,255,0.08)" strokeWidth="0.6" />
          ))}
        </svg>

        {/* Particles */}
        {particles.map(p => (
          <div key={p.id} className="absolute pointer-events-none rounded-full z-10"
            style={{
              left: `${p.x}%`, top: `${p.y}%`,
              width: 7, height: 7,
              background: p.color,
              boxShadow: `0 0 8px ${p.color}`,
              animation: 'particle-burst 0.85s ease-out forwards',
              '--dx': `${Math.cos(p.angle * Math.PI / 180) * 55}px`,
              '--dy': `${Math.sin(p.angle * Math.PI / 180) * 55}px`,
            } as React.CSSProperties} />
        ))}

        {/* Projectiles */}
        {projectiles.map(p => (
          <div key={p.id} className="absolute z-20 text-2xl pointer-events-none select-none"
            style={{
              top: p.fromPlayer ? '57%' : '26%',
              left: p.fromPlayer ? '16%' : '72%',
              filter: `drop-shadow(0 0 12px ${p.color})`,
              animation: p.fromPlayer
                ? 'proj-ltr 0.7s cubic-bezier(.25,.46,.45,.94) forwards'
                : 'proj-rtl 0.7s cubic-bezier(.25,.46,.45,.94) forwards',
            }}>
            {p.emoji}
          </div>
        ))}

        {/* Damage numbers */}
        {damageNums.map(d => (
          <div key={d.id} className="absolute z-25 pointer-events-none font-orbitron font-black select-none"
            style={{
              left: d.fromPlayer ? '64%' : '16%',
              top: d.fromPlayer ? '18%' : '48%',
              fontSize: d.critical ? 25 : 17,
              color: d.critical ? '#ffe500' : '#ff4757',
              textShadow: d.critical
                ? '0 0 16px rgba(255,229,0,1),0 0 32px rgba(255,229,0,0.5)'
                : '0 0 10px rgba(255,71,87,0.8)',
              animation: 'dmg-float 1s ease-out forwards',
            }}>
            {d.critical && '💥'}-{d.value}
          </div>
        ))}

        {/* ── Enemy info ── */}
        <div className="absolute top-3 left-4 w-52 z-10">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <span className="font-orbitron text-xs font-bold text-white">{enemy.name}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded type-${enemy.type} font-rubik text-white`}>{enemy.type}</span>
            </div>
            <span className="text-xs font-orbitron text-slate-400">Ур.{enemy.level}</span>
          </div>
          <div className="flex justify-between text-xs font-rubik text-slate-400 mb-1">
            <span>HP</span><span>{enemyHp}/{enemy.maxHp}</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div className="h-2 rounded-full transition-all duration-700"
              style={{ width: `${enemyHpPct}%`, backgroundColor: hpColor(enemyHpPct) }} />
          </div>
        </div>

        {/* ── Enemy Pokemon 3D ── */}
        <div style={{ position: 'absolute', top: 16, right: 40, transformStyle: 'preserve-3d', perspective: '500px' }}>
          <div style={{
            fontSize: 72, lineHeight: 1, userSelect: 'none',
            transform: getEnemyTransform(),
            transition: 'transform 0.24s cubic-bezier(.36,.07,.19,.97), filter 0.15s, opacity 0.3s',
            filter: enemyState === 'hit'
              ? 'brightness(5) saturate(0) drop-shadow(0 0 22px #fff)'
              : enemyState === 'faint'
              ? 'grayscale(1) brightness(0.35)'
              : `drop-shadow(0 0 16px rgba(255,100,50,0.6)) drop-shadow(0 6px 12px rgba(0,0,0,0.6))`,
            opacity: enemyState === 'faint' ? 0.25 : 1,
          }}>
            {enemy.emoji}
          </div>
          <div style={{
            position: 'absolute', bottom: -10, left: '50%',
            transform: 'translateX(-50%)',
            width: 52, height: 10,
            background: 'radial-gradient(ellipse, rgba(0,0,0,0.55) 0%, transparent 70%)',
            filter: 'blur(5px)',
          }} />
        </div>

        {/* ── Player Pokemon 3D ── */}
        <div style={{ position: 'absolute', bottom: 64, left: 40, transformStyle: 'preserve-3d', perspective: '500px' }}>
          <div style={{
            fontSize: 60, lineHeight: 1, userSelect: 'none',
            transform: getPlayerTransform(),
            transition: 'transform 0.24s cubic-bezier(.36,.07,.19,.97), filter 0.15s, opacity 0.3s',
            filter: playerState === 'hit'
              ? 'brightness(5) saturate(0) drop-shadow(0 0 22px #fff)'
              : playerState === 'faint'
              ? 'grayscale(1) brightness(0.35)'
              : `drop-shadow(0 0 16px rgba(0,245,255,0.55)) drop-shadow(0 6px 12px rgba(0,0,0,0.6))`,
            opacity: playerState === 'faint' ? 0.25 : 1,
          }}>
            {PLAYER_POKEMON.emoji}
          </div>
          <div style={{
            position: 'absolute', bottom: -8, left: '50%',
            transform: 'translateX(-50%)',
            width: 44, height: 9,
            background: 'radial-gradient(ellipse, rgba(0,0,0,0.5) 0%, transparent 70%)',
            filter: 'blur(4px)',
          }} />
        </div>

        {/* ── Player HP ── */}
        <div className="absolute bottom-3 right-4 w-52 z-10">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <span className="font-orbitron text-xs font-bold text-white">{PLAYER_POKEMON.name}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded type-grass font-rubik text-white">grass</span>
            </div>
            <span className="text-xs font-orbitron text-slate-400">Ур.{PLAYER_POKEMON.level}</span>
          </div>
          <div className="flex justify-between text-xs font-rubik text-slate-400 mb-1">
            <span>HP</span><span>{playerHp}/{PLAYER_POKEMON.maxHp}</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div className="h-2 rounded-full transition-all duration-700"
              style={{ width: `${playerHpPct}%`, backgroundColor: hpColor(playerHpPct) }} />
          </div>
        </div>

        {/* Win / Lose overlay */}
        {winner && (
          <div className="absolute inset-0 bg-black/78 flex flex-col items-center justify-center gap-3 z-30 animate-fade-in">
            {winner === 'player' ? (
              <>
                <div className="text-5xl" style={{ animation: 'bounce-win 0.7s ease forwards' }}>🏆</div>
                <p className="font-orbitron text-2xl font-black text-yellow-400"
                  style={{ textShadow: '0 0 30px rgba(255,229,0,1)' }}>ПОБЕДА!</p>
                <p className="text-sm font-rubik text-slate-300">+{expGained} EXP получено</p>
              </>
            ) : (
              <>
                <div className="text-5xl">💀</div>
                <p className="font-orbitron text-2xl font-black text-red-400"
                  style={{ textShadow: '0 0 20px rgba(255,71,87,0.9)' }}>ПОРАЖЕНИЕ</p>
                <p className="text-sm font-rubik text-slate-400">Не сдавайся!</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Battle log */}
      <div className="glass-card rounded-xl px-3 py-2 border border-slate-700 flex-shrink-0" style={{ minHeight: 68 }}>
        <div className="flex flex-col gap-0.5 justify-end" style={{ minHeight: 50 }}>
          {log.slice(-3).map((l, i) => (
            <p key={i} className={`text-xs font-rubik animate-fade-in leading-snug ${
              l.type === 'player' ? 'text-cyan-300' : l.type === 'enemy' ? 'text-red-300' : 'text-yellow-300'}`}>
              {l.text}
            </p>
          ))}
        </div>
      </div>

      {/* Moves / Result */}
      {!winner ? (
        <div className="grid grid-cols-2 gap-2">
          {PLAYER_POKEMON.moves.map((move, i) => (
            <button key={i} onClick={() => handleMove(move)} disabled={isAnimating}
              className="glass-card rounded-xl p-3 border border-slate-700 text-left transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 hover:border-cyan-500/50">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{move.emoji}</span>
                <span className="font-orbitron text-xs font-bold text-white">{move.name}</span>
              </div>
              <div className="flex gap-2">
                <span className={`text-[10px] px-1.5 py-0.5 rounded type-${move.type} font-rubik text-white`}>{move.type}</span>
                <span className="text-[10px] font-rubik text-slate-400">Сила: {move.power}</span>
                <span className="text-[10px] font-rubik text-slate-500 ml-auto">PP {move.pp}</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex gap-3">
          <button onClick={handleRestart}
            className="flex-1 py-3 rounded-xl font-orbitron text-sm font-bold text-black hover:scale-105 active:scale-95 transition-all"
            style={{ background: 'linear-gradient(135deg,#00f5ff,#00b4d8)', boxShadow: '0 0 16px rgba(0,245,255,0.4)' }}>
            СНОВА В БОЙ
          </button>
          <button onClick={onBack}
            className="flex-1 py-3 rounded-xl font-orbitron text-sm font-bold text-slate-300 border border-slate-600 hover:bg-slate-800 hover:scale-105 transition-all">
            НА КАРТУ
          </button>
        </div>
      )}

      {!winner && (
        <button
          onClick={() => { addLog('Вы сбежали!', 'system'); setTimeout(onBack, 600); }}
          disabled={isAnimating}
          className="py-2 rounded-xl font-rubik text-xs text-slate-500 border border-slate-800 hover:border-slate-600 hover:text-slate-300 transition-all disabled:opacity-40">
          Сбежать
        </button>
      )}

      <style>{`
        @keyframes proj-ltr {
          0%   { transform: translate(0,0) scale(1) rotate(0deg); opacity:1; }
          55%  { transform: translate(310px,-55px) scale(1.5) rotate(200deg); opacity:1; }
          100% { transform: translate(420px,-15px) scale(0.15) rotate(380deg); opacity:0; }
        }
        @keyframes proj-rtl {
          0%   { transform: translate(0,0) scale(1) rotate(0deg); opacity:1; }
          55%  { transform: translate(-310px,48px) scale(1.5) rotate(-200deg); opacity:1; }
          100% { transform: translate(-420px,15px) scale(0.15) rotate(-380deg); opacity:0; }
        }
        @keyframes dmg-float {
          0%   { transform: translateY(0) scale(0.4); opacity:0; }
          18%  { transform: translateY(-10px) scale(1.35); opacity:1; }
          60%  { transform: translateY(-28px) scale(1.05); opacity:1; }
          100% { transform: translateY(-52px) scale(0.85); opacity:0; }
        }
        @keyframes particle-burst {
          0%   { transform: translate(0,0) scale(1); opacity:1; }
          100% { transform: translate(var(--dx), var(--dy)) scale(0); opacity:0; }
        }
        @keyframes arena-shake {
          0%,100% { transform: translate(0,0) rotateZ(0); }
          20%  { transform: translate(-5px,2px) rotateZ(-0.6deg); }
          40%  { transform: translate(5px,-2px) rotateZ(0.6deg); }
          60%  { transform: translate(-3px,1px) rotateZ(-0.3deg); }
          80%  { transform: translate(3px,-1px) rotateZ(0.3deg); }
        }
        @keyframes bounce-win {
          0%   { transform: scale(0.2) rotate(-20deg); opacity:0; }
          50%  { transform: scale(1.22) rotate(5deg); }
          75%  { transform: scale(0.92) rotate(-3deg); }
          100% { transform: scale(1) rotate(0deg); opacity:1; }
        }
      `}</style>
    </div>
  );
}
