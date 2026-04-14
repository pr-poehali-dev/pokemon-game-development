import { useState, useEffect, useRef, useCallback } from 'react';
import Icon from '@/components/ui/icon';

const ZONES = [
  { id: 'forest', name: 'Изумрудный лес', emoji: '🌿', type: 'forest', level: '1-5',
    description: 'Густые леса, полные травяных покемонов',
    pokemon: ['Листвозавр', 'Лесной Эльф', 'Кустовик'], x: 15, y: 20, unlocked: true },
  { id: 'ocean', name: 'Лазурный океан', emoji: '🌊', type: 'ocean', level: '3-8',
    description: 'Бескрайние воды с водными существами',
    pokemon: ['Жемчужница', 'Дельфиний', 'Кораллик'], x: 60, y: 15, unlocked: true },
  { id: 'volcano', name: 'Вулкан Инферно', emoji: '🌋', type: 'volcano', level: '8-15',
    description: 'Огненные недра с мощными покемонами',
    pokemon: ['Огнедыш', 'Лавовик', 'Пепловник'], x: 72, y: 58, unlocked: true },
  { id: 'desert', name: 'Золотая пустыня', emoji: '🏜️', type: 'desert', level: '6-12',
    description: 'Раскалённые пески с редкими покемонами',
    pokemon: ['Песчаный Лис', 'Каменная Черепаха', 'Дюновик'], x: 30, y: 62, unlocked: true },
  { id: 'ice', name: 'Ледяные пики', emoji: '🏔️', type: 'ice', level: '12-20',
    description: 'Вечные льды с ледяными покемонами',
    pokemon: ['Морозник', 'Ледяной Волк', 'Снежница'], x: 45, y: 8, unlocked: false },
  { id: 'city', name: 'Неоновый город', emoji: '🏙️', type: 'city', level: '15-25',
    description: 'Мегаполис с электрическими покемонами',
    pokemon: ['Вольтик', 'Неонит', 'Электровинт'], x: 82, y: 35, unlocked: false },
];

// Walk step size (% of map)
const STEP = 3;
const MOVE_INTERVAL = 120; // ms between steps when key held

interface WorldMapProps {
  onStartBattle: (zone: typeof ZONES[0]) => void;
}

type Dir = 'up' | 'down' | 'left' | 'right';

const FOOTPRINTS_MAX = 12;

interface Footprint { id: number; x: number; y: number; dir: Dir; }

export default function WorldMap({ onStartBattle }: WorldMapProps) {
  const [pos, setPos] = useState({ x: 15, y: 20 }); // player position %
  const [dir, setDir] = useState<Dir>('down');
  const [walking, setWalking] = useState(false);
  const [walkFrame, setWalkFrame] = useState(0);
  const [footprints, setFootprints] = useState<Footprint[]>([]);
  const [selectedZone, setSelectedZone] = useState<typeof ZONES[0] | null>(null);
  const [nearZone, setNearZone] = useState<typeof ZONES[0] | null>(null);
  const [targetPos, setTargetPos] = useState<{ x: number; y: number } | null>(null);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  const keysRef = useRef<Set<string>>(new Set());
  const moveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const walkFrameRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const footIdRef = useRef(0);
  const mapRef = useRef<HTMLDivElement>(null);

  // Check if player is near a zone
  const checkNear = useCallback((px: number, py: number) => {
    const near = ZONES.find(z => {
      const dx = Math.abs(z.x - px);
      const dy = Math.abs(z.y - py);
      return dx < 8 && dy < 8 && z.unlocked;
    });
    setNearZone(near || null);
  }, []);

  const addFootprint = useCallback((px: number, py: number, d: Dir) => {
    const id = footIdRef.current++;
    setFootprints(fp => [...fp.slice(-(FOOTPRINTS_MAX - 1)), { id, x: px, y: py, dir: d }]);
  }, []);

  const movePlayer = useCallback((dx: number, dy: number, newDir: Dir) => {
    setPos(prev => {
      const nx = Math.max(2, Math.min(97, prev.x + dx));
      const ny = Math.max(2, Math.min(97, prev.y + dy));
      addFootprint(prev.x, prev.y, newDir);
      checkNear(nx, ny);
      return { x: nx, y: ny };
    });
    setDir(newDir);
    setWalking(true);
  }, [addFootprint, checkNear]);

  // Keyboard walking
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d',' '].includes(e.key)) return;
      e.preventDefault();
      keysRef.current.add(e.key);

      if (e.key === ' ') {
        if (nearZone) onStartBattle(nearZone);
        return;
      }

      if (moveTimerRef.current) return;

      const doMove = () => {
        const keys = keysRef.current;
        if (keys.has('ArrowUp') || keys.has('w')) movePlayer(0, -STEP, 'up');
        else if (keys.has('ArrowDown') || keys.has('s')) movePlayer(0, STEP, 'down');
        else if (keys.has('ArrowLeft') || keys.has('a')) movePlayer(-STEP, 0, 'left');
        else if (keys.has('ArrowRight') || keys.has('d')) movePlayer(STEP, 0, 'right');
      };
      doMove();
      moveTimerRef.current = setInterval(doMove, MOVE_INTERVAL);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key);
      if (keysRef.current.size === 0 || !['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d'].some(k => keysRef.current.has(k))) {
        if (moveTimerRef.current) { clearInterval(moveTimerRef.current); moveTimerRef.current = null; }
        setWalking(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      if (moveTimerRef.current) clearInterval(moveTimerRef.current);
    };
  }, [movePlayer, nearZone, onStartBattle]);

  // Walk frame animation
  useEffect(() => {
    if (walking) {
      walkFrameRef.current = setInterval(() => setWalkFrame(f => (f + 1) % 4), 150);
    } else {
      if (walkFrameRef.current) clearInterval(walkFrameRef.current);
      setWalkFrame(0);
    }
    return () => { if (walkFrameRef.current) clearInterval(walkFrameRef.current); };
  }, [walking]);

  // Click-to-move: animate toward target
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const tx = ((e.clientX - rect.left) / rect.width) * 100;
    const ty = ((e.clientY - rect.top) / rect.height) * 100;
    setTargetPos({ x: tx, y: ty });
  };

  // Animate toward targetPos
  useEffect(() => {
    if (!targetPos) return;
    const interval = setInterval(() => {
      setPos(prev => {
        const dx = targetPos.x - prev.x;
        const dy = targetPos.y - prev.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < STEP) {
          setTargetPos(null);
          setWalking(false);
          checkNear(targetPos.x, targetPos.y);
          return { x: targetPos.x, y: targetPos.y };
        }
        const speed = STEP * 0.7;
        const nx = prev.x + (dx / dist) * speed;
        const ny = prev.y + (dy / dist) * speed;
        // direction
        if (Math.abs(dx) > Math.abs(dy)) setDir(dx > 0 ? 'right' : 'left');
        else setDir(dy > 0 ? 'down' : 'up');
        setWalking(true);
        addFootprint(prev.x, prev.y, dx > 0 ? 'right' : dy > 0 ? 'down' : dy < 0 ? 'up' : 'left');
        checkNear(nx, ny);
        return { x: nx, y: ny };
      });
    }, MOVE_INTERVAL);
    return () => clearInterval(interval);
  }, [targetPos, addFootprint, checkNear]);

  // D-pad button
  const dpadMove = (dx: number, dy: number, d: Dir) => {
    movePlayer(dx, dy, d);
    setTimeout(() => setWalking(false), 200);
  };

  // Walk sprite offsets (simple bob + lean)
  const getPlayerStyle = () => {
    const bob = walking ? Math.sin(walkFrame * Math.PI / 2) * 3 : 0;
    const lean = dir === 'left' ? -8 : dir === 'right' ? 8 : 0;
    const scaleX = dir === 'left' ? -1 : 1;
    return {
      transform: `translateY(${bob}px) rotate(${lean}deg) scaleX(${scaleX})`,
      transition: walking ? 'none' : 'transform 0.2s',
      filter: 'drop-shadow(0 0 8px rgba(255,229,0,0.9)) drop-shadow(0 4px 8px rgba(0,0,0,0.6))',
    };
  };

  return (
    <div className="h-full flex flex-col gap-4 p-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center neon-border-cyan border">
          <Icon name="Map" size={16} className="text-cyan-400" />
        </div>
        <h2 className="font-orbitron text-lg font-bold neon-text-cyan">КАРТА МИРА</h2>
        <span className="text-xs font-rubik text-slate-400 ml-2">
          {nearZone
            ? <span className="text-yellow-400 animate-pulse">⚡ Рядом: {nearZone.name} — нажми Пробел или Войти</span>
            : 'Стрелки / WASD или клик для движения'}
        </span>
        <span className="ml-auto text-xs font-rubik text-slate-400">6 зон · 18 покемонов</span>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* ═══ MAP AREA ═══ */}
        <div
          ref={mapRef}
          className="relative flex-1 rounded-2xl overflow-hidden border border-slate-700 cursor-crosshair"
          style={{
            background: 'radial-gradient(ellipse at 30% 40%, rgba(0,245,255,0.05) 0%, transparent 50%), radial-gradient(ellipse at 70% 70%, rgba(191,95,255,0.05) 0%, transparent 50%), linear-gradient(135deg,#060d1a 0%,#0a1628 50%,#060d1a 100%)',
          }}
          onClick={handleMapClick}
        >
          {/* Grid */}
          <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#00f5ff" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* Connection lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <line x1="15%" y1="20%" x2="60%" y2="15%" stroke="rgba(0,245,255,0.12)" strokeWidth="1" strokeDasharray="4,4" />
            <line x1="15%" y1="20%" x2="30%" y2="62%" stroke="rgba(0,245,255,0.12)" strokeWidth="1" strokeDasharray="4,4" />
            <line x1="60%" y1="15%" x2="72%" y2="58%" stroke="rgba(0,245,255,0.12)" strokeWidth="1" strokeDasharray="4,4" />
            <line x1="45%" y1="8%" x2="60%" y2="15%" stroke="rgba(116,185,255,0.08)" strokeWidth="1" strokeDasharray="4,4" />
            <line x1="72%" y1="58%" x2="82%" y2="35%" stroke="rgba(191,95,255,0.08)" strokeWidth="1" strokeDasharray="4,4" />
          </svg>

          {/* Target indicator */}
          {targetPos && (
            <div
              className="absolute pointer-events-none z-5"
              style={{ left: `${targetPos.x}%`, top: `${targetPos.y}%`, transform: 'translate(-50%,-50%)' }}
            >
              <div className="w-6 h-6 rounded-full border-2 border-cyan-400 opacity-60"
                style={{ animation: 'target-pulse 0.8s ease-out forwards' }} />
            </div>
          )}

          {/* Footprints */}
          {footprints.map((fp, i) => (
            <div key={fp.id} className="absolute pointer-events-none"
              style={{
                left: `${fp.x}%`, top: `${fp.y}%`,
                transform: 'translate(-50%,-50%)',
                fontSize: 8,
                opacity: (i / FOOTPRINTS_MAX) * 0.5,
                filter: 'blur(0.5px)',
              }}>
              {fp.dir === 'up' || fp.dir === 'down' ? '⬤' : '⬤'}
            </div>
          ))}

          {/* Zone nodes */}
          {ZONES.map((zone) => {
            const isNear = nearZone?.id === zone.id;
            const isSelected = selectedZone?.id === zone.id;
            return (
              <button
                key={zone.id}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                  zone.unlocked ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                } ${isSelected ? 'scale-125' : 'hover:scale-110'}`}
                style={{ left: `${zone.x}%`, top: `${zone.y}%`, zIndex: 5 }}
                onClick={e => { e.stopPropagation(); if (zone.unlocked) setSelectedZone(zone); }}
                onMouseEnter={() => setHoveredZone(zone.id)}
                onMouseLeave={() => setHoveredZone(null)}
              >
                <div
                  className={`zone-${zone.type} relative w-14 h-14 rounded-2xl border-2 flex flex-col items-center justify-center transition-all duration-300`}
                  style={{
                    boxShadow: isNear
                      ? `0 0 28px rgba(255,229,0,0.8), 0 0 8px rgba(255,229,0,0.4)`
                      : isSelected ? `0 0 20px rgba(0,245,255,0.5)` : hoveredZone === zone.id ? `0 0 12px rgba(0,245,255,0.3)` : 'none',
                    borderColor: isNear ? '#ffe500' : undefined,
                    animation: isNear ? 'zone-pulse 1s ease-in-out infinite' : 'none',
                  }}
                >
                  <span className="text-xl">{zone.emoji}</span>
                  {!zone.unlocked && (
                    <div className="absolute inset-0 rounded-2xl bg-black/60 flex items-center justify-center">
                      <Icon name="Lock" size={16} className="text-slate-400" />
                    </div>
                  )}
                </div>
                <div className="mt-1 text-center">
                  <p className="text-xs font-rubik font-medium text-white/80 whitespace-nowrap leading-none">{zone.name.split(' ')[0]}</p>
                  <p className="text-[10px] font-rubik text-slate-500 leading-none mt-0.5">Ур. {zone.level}</p>
                </div>
                {hoveredZone === zone.id && zone.unlocked && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 glass-card rounded-xl p-2 border border-cyan-500/30 z-20 animate-fade-in pointer-events-none">
                    <p className="text-xs font-orbitron text-cyan-400 mb-1">{zone.name}</p>
                    <p className="text-[10px] font-rubik text-slate-300">{zone.description}</p>
                  </div>
                )}
              </button>
            );
          })}

          {/* ── Player Pokemon (walking sprite) ── */}
          <div
            className="absolute z-10 pointer-events-none"
            style={{
              left: `${pos.x}%`, top: `${pos.y}%`,
              transform: 'translate(-50%, -50%)',
              transition: targetPos ? 'none' : 'left 0.12s, top 0.12s',
            }}
          >
            {/* Glow ring */}
            <div className="absolute inset-0 flex items-center justify-center" style={{ transform: 'translateY(8px)' }}>
              <div className="w-8 h-3 rounded-full"
                style={{ background: 'radial-gradient(ellipse, rgba(255,229,0,0.6) 0%, transparent 70%)', filter: 'blur(3px)' }} />
            </div>
            {/* Pokemon emoji with walk animation */}
            <div style={{ fontSize: 28, ...getPlayerStyle() }}>
              🦖
            </div>
            {/* Near-zone enter prompt */}
            {nearZone && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <div className="bg-yellow-400 text-black text-[10px] font-orbitron font-bold px-2 py-0.5 rounded-lg"
                  style={{ animation: 'float-label 1s ease-in-out infinite' }}>
                  [Пробел] Войти
                </div>
              </div>
            )}
          </div>

          {/* D-pad (mobile / convenience) */}
          <div className="absolute bottom-3 left-3 z-10" style={{ opacity: 0.85 }}>
            <div className="grid grid-cols-3 gap-0.5" style={{ width: 84 }}>
              <div />
              <button onClick={() => dpadMove(0, -STEP, 'up')}
                className="w-6 h-6 rounded glass-card border border-slate-600 flex items-center justify-center hover:bg-slate-700 active:scale-90 transition-all">
                <Icon name="ChevronUp" size={12} className="text-slate-300" />
              </button>
              <div />
              <button onClick={() => dpadMove(-STEP, 0, 'left')}
                className="w-6 h-6 rounded glass-card border border-slate-600 flex items-center justify-center hover:bg-slate-700 active:scale-90 transition-all">
                <Icon name="ChevronLeft" size={12} className="text-slate-300" />
              </button>
              <button onClick={() => dpadMove(0, STEP, 'down')}
                className="w-6 h-6 rounded glass-card border border-slate-600 flex items-center justify-center hover:bg-slate-700 active:scale-90 transition-all">
                <Icon name="ChevronDown" size={12} className="text-slate-300" />
              </button>
              <button onClick={() => dpadMove(STEP, 0, 'right')}
                className="w-6 h-6 rounded glass-card border border-slate-600 flex items-center justify-center hover:bg-slate-700 active:scale-90 transition-all">
                <Icon name="ChevronRight" size={12} className="text-slate-300" />
              </button>
            </div>
          </div>
        </div>

        {/* ═══ Side panel ═══ */}
        <div className="w-64 flex flex-col gap-3">
          {nearZone ? (
            <div className={`glass-card rounded-2xl p-4 border-2 zone-${nearZone.type} animate-scale-in flex flex-col gap-3`}
              style={{ borderColor: '#ffe500', boxShadow: '0 0 20px rgba(255,229,0,0.3)' }}>
              <div className="flex items-center gap-2">
                <span className="text-3xl">{nearZone.emoji}</span>
                <div>
                  <h3 className="font-orbitron text-sm font-bold text-white">{nearZone.name}</h3>
                  <p className="text-xs font-rubik text-yellow-400">Рядом с тобой!</p>
                </div>
              </div>
              <p className="text-xs font-rubik text-slate-300 leading-relaxed">{nearZone.description}</p>
              <div>
                <p className="text-xs font-orbitron text-slate-400 mb-2 uppercase tracking-wider">Покемоны</p>
                {nearZone.pokemon.map(p => (
                  <div key={p} className="flex items-center gap-2 text-xs font-rubik text-slate-300 mb-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                    {p}
                  </div>
                ))}
              </div>
              <button
                onClick={() => onStartBattle(nearZone)}
                className="w-full py-2.5 rounded-xl font-orbitron text-sm font-bold text-black transition-all duration-200 hover:scale-105 active:scale-95"
                style={{ background: 'linear-gradient(135deg,#ffe500,#ffa502)', boxShadow: '0 0 16px rgba(255,229,0,0.5)' }}>
                ⚔️ В БИТВУ!
              </button>
            </div>
          ) : selectedZone ? (
            <div className={`glass-card rounded-2xl p-4 border-2 zone-${selectedZone.type} animate-scale-in flex flex-col gap-3`}>
              <div className="flex items-center gap-2">
                <span className="text-3xl">{selectedZone.emoji}</span>
                <div>
                  <h3 className="font-orbitron text-sm font-bold text-white">{selectedZone.name}</h3>
                  <p className="text-xs font-rubik text-slate-400">Уровень {selectedZone.level}</p>
                </div>
              </div>
              <p className="text-xs font-rubik text-slate-300 leading-relaxed">{selectedZone.description}</p>
              <div>
                <p className="text-xs font-orbitron text-slate-400 mb-2 uppercase tracking-wider">Покемоны зоны</p>
                {selectedZone.pokemon.map(p => (
                  <div key={p} className="flex items-center gap-2 text-xs font-rubik text-slate-300 mb-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    {p}
                  </div>
                ))}
              </div>
              <button
                onClick={() => onStartBattle(selectedZone)}
                className="w-full py-2.5 rounded-xl font-orbitron text-sm font-bold text-black transition-all duration-200 hover:scale-105 active:scale-95"
                style={{ background: 'linear-gradient(135deg,#00f5ff,#00b4d8)', boxShadow: '0 0 16px rgba(0,245,255,0.4)' }}>
                ИССЛЕДОВАТЬ
              </button>
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-4 border border-slate-700 flex flex-col items-center justify-center gap-3 text-center flex-1">
              <div className="text-4xl animate-float">🦖</div>
              <p className="text-sm font-orbitron text-slate-400">Управление</p>
              <div className="text-xs font-rubik text-slate-500 space-y-1">
                <p>⬆⬇⬅➡ / WASD — ходьба</p>
                <p>Клик на карту — переместиться</p>
                <p>Пробел — войти в зону</p>
              </div>
            </div>
          )}

          {/* Coords + progress */}
          <div className="glass-card rounded-2xl p-3 border border-slate-700">
            <div className="flex justify-between mb-2">
              <p className="text-xs font-orbitron text-slate-400">ПОЗИЦИЯ</p>
              <span className="text-xs font-orbitron text-cyan-400">{Math.round(pos.x)},{Math.round(pos.y)}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-rubik text-slate-300">Зоны открыты</span>
                <span className="text-xs font-orbitron text-cyan-400">4/6</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5">
                <div className="h-1.5 rounded-full" style={{ width: '66%', background: 'linear-gradient(90deg,#00f5ff,#bf5fff)' }} />
              </div>
              <div className="flex justify-between items-center mt-0.5">
                <span className="text-xs font-rubik text-slate-300">Покемоны</span>
                <span className="text-xs font-orbitron text-purple-400">3/18</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5">
                <div className="h-1.5 rounded-full" style={{ width: '17%', background: 'linear-gradient(90deg,#bf5fff,#7b2ff7)' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes zone-pulse {
          0%,100% { box-shadow: 0 0 16px rgba(255,229,0,0.6); }
          50%      { box-shadow: 0 0 32px rgba(255,229,0,1); }
        }
        @keyframes float-label {
          0%,100% { transform: translateX(-50%) translateY(0); }
          50%      { transform: translateX(-50%) translateY(-3px); }
        }
        @keyframes target-pulse {
          0%   { transform: translate(-50%,-50%) scale(0.5); opacity:0.9; }
          100% { transform: translate(-50%,-50%) scale(2); opacity:0; }
        }
      `}</style>
    </div>
  );
}