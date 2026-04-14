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
    <div className="h-full flex flex-col gap-3 p-4">
      {/* Header */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="w-8 h-8 rounded-xl neon-border-cyan border flex items-center justify-center"
          style={{ background: 'rgba(0,245,255,0.1)' }}>
          <Icon name="Map" size={16} className="text-cyan-400" />
        </div>
        <h2 className="font-orbitron text-lg font-black neon-text-cyan tracking-wider">КАРТА МИРА</h2>
        {nearZone
          ? <span className="chip chip-yellow animate-pulse ml-1">⚡ {nearZone.name} — Пробел/Войти</span>
          : <span className="text-xs font-rubik text-slate-500 ml-1">WASD · стрелки · клик</span>
        }
        <div className="ml-auto flex items-center gap-2">
          <span className="chip chip-cyan">6 зон</span>
          <span className="chip chip-purple">18 покемонов</span>
        </div>
      </div>

      <div className="flex gap-3 flex-1 min-h-0">
        {/* ═══ MAP AREA ═══ */}
        <div
          ref={mapRef}
          className="relative flex-1 rounded-2xl overflow-hidden cursor-crosshair scanlines"
          style={{
            border: '1px solid rgba(0,245,255,0.15)',
            background: `
              radial-gradient(ellipse at 20% 25%, rgba(46,213,115,0.07) 0%, transparent 35%),
              radial-gradient(ellipse at 65% 18%, rgba(0,180,216,0.07) 0%, transparent 30%),
              radial-gradient(ellipse at 75% 62%, rgba(255,71,87,0.07) 0%, transparent 30%),
              radial-gradient(ellipse at 35% 65%, rgba(255,229,0,0.06) 0%, transparent 28%),
              radial-gradient(ellipse at 48% 10%, rgba(116,185,255,0.05) 0%, transparent 22%),
              radial-gradient(ellipse at 85% 38%, rgba(191,95,255,0.05) 0%, transparent 22%),
              linear-gradient(135deg, #04090f 0%, #070f1c 50%, #04090f 100%)`,
            boxShadow: '0 0 40px rgba(0,245,255,0.06), inset 0 0 60px rgba(0,0,0,0.4)',
          }}
          onClick={handleMapClick}
        >
          {/* Fine grid */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.07 }} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#00f5ff" strokeWidth="0.5"/>
              </pattern>
              <pattern id="grid-lg" width="160" height="160" patternUnits="userSpaceOnUse">
                <path d="M 160 0 L 0 0 0 160" fill="none" stroke="#00f5ff" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            <rect width="100%" height="100%" fill="url(#grid-lg)" />
          </svg>

          {/* Atmospheric zone glow blobs */}
          <div className="absolute pointer-events-none" style={{ left: '8%', top: '12%', width: 120, height: 120, background: 'radial-gradient(circle, rgba(46,213,115,0.09) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(20px)' }} />
          <div className="absolute pointer-events-none" style={{ left: '53%', top: '6%', width: 100, height: 100, background: 'radial-gradient(circle, rgba(0,180,216,0.08) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(18px)' }} />
          <div className="absolute pointer-events-none" style={{ left: '65%', top: '50%', width: 110, height: 110, background: 'radial-gradient(circle, rgba(255,71,87,0.08) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(18px)' }} />
          <div className="absolute pointer-events-none" style={{ left: '23%', top: '55%', width: 100, height: 100, background: 'radial-gradient(circle, rgba(255,229,0,0.07) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(16px)' }} />

          {/* Connection lines with glow */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <filter id="glow"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            </defs>
            {[
              { x1:'15%',y1:'20%',x2:'60%',y2:'15%', color:'rgba(0,245,255,0.2)' },
              { x1:'15%',y1:'20%',x2:'30%',y2:'62%', color:'rgba(46,213,115,0.15)' },
              { x1:'60%',y1:'15%',x2:'72%',y2:'58%', color:'rgba(0,245,255,0.15)' },
              { x1:'45%',y1:'8%', x2:'60%',y2:'15%', color:'rgba(116,185,255,0.12)' },
              { x1:'72%',y1:'58%',x2:'82%',y2:'35%', color:'rgba(191,95,255,0.12)' },
            ].map((l,i) => (
              <g key={i} filter="url(#glow)">
                <line x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={l.color} strokeWidth="1.5" strokeDasharray="5,5" />
              </g>
            ))}
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
            const zoneColors: Record<string, string> = {
              forest: '#2ed573', ocean: '#00b4d8', volcano: '#ff4757',
              desert: '#ffa502', ice: '#74b9ff', city: '#bf5fff',
            };
            const zoneColor = zoneColors[zone.type] || '#00f5ff';
            return (
              <button
                key={zone.id}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                  zone.unlocked ? 'cursor-pointer' : 'cursor-not-allowed'
                } ${isSelected ? 'scale-130' : 'hover:scale-115'}`}
                style={{ left: `${zone.x}%`, top: `${zone.y}%`, zIndex: 5 }}
                onClick={e => { e.stopPropagation(); if (zone.unlocked) setSelectedZone(zone); }}
                onMouseEnter={() => setHoveredZone(zone.id)}
                onMouseLeave={() => setHoveredZone(null)}
              >
                {/* Zone glow halo */}
                {(isNear || isSelected) && (
                  <div className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{
                      transform: 'scale(1.8)',
                      background: `radial-gradient(circle, ${zoneColor}25 0%, transparent 70%)`,
                      filter: 'blur(8px)',
                      animation: isNear ? 'zone-pulse 1.2s ease-in-out infinite' : 'none',
                    }} />
                )}
                <div
                  className={`zone-${zone.type} relative w-14 h-14 rounded-2xl border-2 flex flex-col items-center justify-center transition-all duration-300`}
                  style={{
                    boxShadow: isNear
                      ? `0 0 24px ${zoneColor}cc, 0 0 48px ${zoneColor}44, inset 0 0 12px ${zoneColor}22`
                      : isSelected
                      ? `0 0 18px ${zoneColor}88, inset 0 0 8px ${zoneColor}15`
                      : hoveredZone === zone.id
                      ? `0 0 12px ${zoneColor}55`
                      : `0 4px 16px rgba(0,0,0,0.4)`,
                    borderColor: isNear ? '#ffe500' : isSelected ? zoneColor : undefined,
                    opacity: zone.unlocked ? 1 : 0.4,
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <span className="text-2xl" style={{ filter: `drop-shadow(0 0 6px ${zoneColor}88)` }}>{zone.emoji}</span>
                  {!zone.unlocked && (
                    <div className="absolute inset-0 rounded-2xl bg-black/70 flex items-center justify-center">
                      <Icon name="Lock" size={14} className="text-slate-400" />
                    </div>
                  )}
                </div>
                <div className="mt-1 text-center">
                  <p className="text-[11px] font-rubik font-semibold whitespace-nowrap leading-none" style={{ color: zone.unlocked ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.35)' }}>
                    {zone.name.split(' ')[0]}
                  </p>
                  <p className="text-[9px] font-rubik leading-none mt-0.5" style={{ color: zone.unlocked ? zoneColor + 'aa' : '#475569' }}>
                    Ур. {zone.level}
                  </p>
                </div>
                {hoveredZone === zone.id && zone.unlocked && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-44 glass-card-bright rounded-xl p-2.5 z-20 animate-fade-in pointer-events-none"
                    style={{ border: `1px solid ${zoneColor}44`, boxShadow: `0 0 16px ${zoneColor}22` }}>
                    <p className="text-xs font-orbitron font-bold mb-0.5" style={{ color: zoneColor }}>{zone.name}</p>
                    <p className="text-[10px] font-rubik text-slate-400 leading-snug">{zone.description}</p>
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

          {/* D-pad */}
          <div className="absolute bottom-3 left-3 z-10">
            <div className="grid grid-cols-3 gap-1" style={{ width: 90 }}>
              <div />
              <button onClick={() => dpadMove(0, -STEP, 'up')}
                className="w-7 h-7 rounded-lg flex items-center justify-center active:scale-90 transition-all hover:scale-110"
                style={{ background: 'rgba(0,245,255,0.12)', border: '1px solid rgba(0,245,255,0.25)', backdropFilter: 'blur(8px)' }}>
                <Icon name="ChevronUp" size={13} className="text-cyan-400" />
              </button>
              <div />
              <button onClick={() => dpadMove(-STEP, 0, 'left')}
                className="w-7 h-7 rounded-lg flex items-center justify-center active:scale-90 transition-all hover:scale-110"
                style={{ background: 'rgba(0,245,255,0.12)', border: '1px solid rgba(0,245,255,0.25)', backdropFilter: 'blur(8px)' }}>
                <Icon name="ChevronLeft" size={13} className="text-cyan-400" />
              </button>
              <button onClick={() => dpadMove(0, STEP, 'down')}
                className="w-7 h-7 rounded-lg flex items-center justify-center active:scale-90 transition-all hover:scale-110"
                style={{ background: 'rgba(0,245,255,0.12)', border: '1px solid rgba(0,245,255,0.25)', backdropFilter: 'blur(8px)' }}>
                <Icon name="ChevronDown" size={13} className="text-cyan-400" />
              </button>
              <button onClick={() => dpadMove(STEP, 0, 'right')}
                className="w-7 h-7 rounded-lg flex items-center justify-center active:scale-90 transition-all hover:scale-110"
                style={{ background: 'rgba(0,245,255,0.12)', border: '1px solid rgba(0,245,255,0.25)', backdropFilter: 'blur(8px)' }}>
                <Icon name="ChevronRight" size={13} className="text-cyan-400" />
              </button>
            </div>
          </div>

          {/* Coords HUD */}
          <div className="absolute bottom-3 right-3 z-10">
            <div className="chip chip-cyan" style={{ fontFamily: 'monospace', fontSize: 9 }}>
              📍 {Math.round(pos.x)}, {Math.round(pos.y)}
            </div>
          </div>
        </div>

        {/* ═══ Side panel ═══ */}
        <div className="w-60 flex flex-col gap-2.5">
          {nearZone ? (
            <ZonePanel zone={nearZone} isNear onBattle={() => onStartBattle(nearZone)} />
          ) : selectedZone ? (
            <ZonePanel zone={selectedZone} onBattle={() => onStartBattle(selectedZone)} />
          ) : (
            <div className="glass-card rounded-2xl p-4 flex flex-col items-center justify-center gap-3 text-center flex-1"
              style={{ border: '1px solid rgba(0,245,255,0.1)' }}>
              <div className="text-4xl animate-float-slow" style={{ filter: 'drop-shadow(0 0 12px rgba(255,229,0,0.6))' }}>🦖</div>
              <div>
                <p className="text-sm font-orbitron font-bold text-white mb-1">Управление</p>
                <div className="neon-divider mb-3" />
                <div className="text-xs font-rubik space-y-1.5">
                  {[['⬆⬇⬅➡', 'Клавиши WASD'], ['🖱️ Клик', 'Перейти в точку'], ['⎵ Пробел', 'Войти в зону']].map(([key, desc]) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="chip chip-cyan text-[9px] flex-shrink-0">{key}</span>
                      <span className="text-slate-400">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Progress */}
          <div className="glass-card rounded-2xl p-3.5" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[9px] font-orbitron text-slate-500 uppercase tracking-widest mb-2.5">Прогресс</p>
            <div className="flex flex-col gap-2">
              {[
                { label: 'Зоны открыты', val: 4, max: 6, color: 'linear-gradient(90deg,#00f5ff,#bf5fff)', textColor: '#00f5ff' },
                { label: 'Покемоны', val: 3, max: 18, color: 'linear-gradient(90deg,#bf5fff,#7b2ff7)', textColor: '#bf5fff' },
              ].map(({ label, val, max, color, textColor }) => (
                <div key={label}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-rubik text-slate-400">{label}</span>
                    <span className="text-[10px] font-orbitron font-bold" style={{ color: textColor }}>{val}/{max}</span>
                  </div>
                  <div className="w-full rounded-full h-1.5 overflow-hidden progress-shine"
                    style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-1.5 rounded-full" style={{ width: `${(val/max)*100}%`, background: color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes zone-pulse {
          0%,100% { opacity:0.7; }
          50%      { opacity:1; }
        }
        @keyframes float-label {
          0%,100% { transform: translateX(-50%) translateY(0); }
          50%      { transform: translateX(-50%) translateY(-4px); }
        }
        @keyframes target-pulse {
          0%   { transform: translate(-50%,-50%) scale(0.5); opacity:0.9; }
          100% { transform: translate(-50%,-50%) scale(2.5); opacity:0; }
        }
      `}</style>
    </div>
  );
}

/* Zone side panel */
function ZonePanel({ zone, isNear, onBattle }: { zone: typeof ZONES[0]; isNear?: boolean; onBattle: () => void }) {
  const zoneColors: Record<string, string> = {
    forest: '#2ed573', ocean: '#00b4d8', volcano: '#ff4757',
    desert: '#ffa502', ice: '#74b9ff', city: '#bf5fff',
  };
  const color = zoneColors[zone.type] || '#00f5ff';
  return (
    <div
      className="glass-card-bright rounded-2xl p-4 flex flex-col gap-3 animate-scale-in"
      style={{
        border: `1px solid ${color}40`,
        boxShadow: `0 0 24px ${color}18, inset 0 0 20px ${color}06`,
        flex: isNear ? undefined : 1,
      }}
    >
      {/* Zone header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ background: `${color}18`, border: `1px solid ${color}40`, boxShadow: `0 0 12px ${color}30` }}>
          {zone.emoji}
        </div>
        <div>
          <h3 className="font-orbitron text-sm font-black text-white leading-none mb-1">{zone.name}</h3>
          <div className="flex items-center gap-1.5">
            {isNear && <span className="chip chip-yellow" style={{ fontSize: 9 }}>📍 Рядом!</span>}
            <span className="chip" style={{ fontSize: 9, color, borderColor: `${color}50`, background: `${color}10` }}>
              УР. {zone.level}
            </span>
          </div>
        </div>
      </div>

      <div className="neon-divider" style={{ background: `linear-gradient(90deg, transparent, ${color}60, transparent)` }} />

      <p className="text-[11px] font-rubik leading-relaxed" style={{ color: 'rgba(148,163,184,0.9)' }}>{zone.description}</p>

      {/* Pokemon list */}
      <div>
        <p className="text-[9px] font-orbitron uppercase tracking-widest text-slate-500 mb-2">Покемоны зоны</p>
        <div className="flex flex-col gap-1">
          {zone.pokemon.map(p => (
            <div key={p} className="flex items-center gap-2 text-[11px] font-rubik py-0.5">
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color, boxShadow: `0 0 4px ${color}` }} />
              <span style={{ color: 'rgba(203,213,225,0.85)' }}>{p}</span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onBattle}
        className="w-full py-2.5 rounded-xl font-orbitron text-sm font-bold transition-all duration-200 hover:scale-105 active:scale-95"
        style={{
          background: isNear
            ? 'linear-gradient(135deg,#ffe500,#ffa502)'
            : `linear-gradient(135deg, ${color}, ${color}aa)`,
          color: isNear ? '#000' : '#fff',
          boxShadow: `0 0 20px ${isNear ? 'rgba(255,229,0,0.5)' : color + '55'}`,
        }}
      >
        {isNear ? '⚔️ В БИТВУ!' : 'ИССЛЕДОВАТЬ'}
      </button>
    </div>
  );
}