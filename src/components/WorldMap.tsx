import { useState } from 'react';
import Icon from '@/components/ui/icon';

const ZONES = [
  {
    id: 'forest',
    name: 'Изумрудный лес',
    emoji: '🌿',
    type: 'forest',
    level: '1-5',
    description: 'Густые леса, полные травяных покемонов',
    pokemon: ['Листвозавр', 'Лесной Эльф', 'Кустовик'],
    x: 15, y: 20,
    unlocked: true,
  },
  {
    id: 'ocean',
    name: 'Лазурный океан',
    emoji: '🌊',
    type: 'ocean',
    level: '3-8',
    description: 'Бескрайние воды с водными существами',
    pokemon: ['Жемчужница', 'Дельфиний', 'Кораллик'],
    x: 60, y: 15,
    unlocked: true,
  },
  {
    id: 'volcano',
    name: 'Вулкан Инферно',
    emoji: '🌋',
    type: 'volcano',
    level: '8-15',
    description: 'Огненные недра с мощными покемонами',
    pokemon: ['Огнедыш', 'Лавовик', 'Пепловник'],
    x: 72, y: 58,
    unlocked: true,
  },
  {
    id: 'desert',
    name: 'Золотая пустыня',
    emoji: '🏜️',
    type: 'desert',
    level: '6-12',
    description: 'Раскалённые пески с редкими покемонами',
    pokemon: ['Песчаный Лис', 'Каменная Черепаха', 'Дюновик'],
    x: 30, y: 62,
    unlocked: true,
  },
  {
    id: 'ice',
    name: 'Ледяные пики',
    emoji: '🏔️',
    type: 'ice',
    level: '12-20',
    description: 'Вечные льды с ледяными покемонами',
    pokemon: ['Морозник', 'Ледяной Волк', 'Снежница'],
    x: 45, y: 8,
    unlocked: false,
  },
  {
    id: 'city',
    name: 'Неоновый город',
    emoji: '🏙️',
    type: 'city',
    level: '15-25',
    description: 'Мегаполис с электрическими покемонами',
    pokemon: ['Вольтик', 'Неонит', 'Электровинт'],
    x: 82, y: 35,
    unlocked: false,
  },
];

interface WorldMapProps {
  onStartBattle: (zone: typeof ZONES[0]) => void;
}

export default function WorldMap({ onStartBattle }: WorldMapProps) {
  const [selectedZone, setSelectedZone] = useState<typeof ZONES[0] | null>(null);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  return (
    <div className="h-full flex flex-col gap-4 p-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center neon-border-cyan border">
          <Icon name="Map" size={16} className="text-cyan-400" />
        </div>
        <h2 className="font-orbitron text-lg font-bold neon-text-cyan">КАРТА МИРА</h2>
        <span className="ml-auto text-xs font-rubik text-slate-400">6 зон · 18 покемонов</span>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Map */}
        <div
          className="relative flex-1 rounded-2xl overflow-hidden border border-slate-700"
          style={{
            background: 'radial-gradient(ellipse at 30% 40%, rgba(0,245,255,0.05) 0%, transparent 50%), radial-gradient(ellipse at 70% 70%, rgba(191,95,255,0.05) 0%, transparent 50%), linear-gradient(135deg, #060d1a 0%, #0a1628 50%, #060d1a 100%)',
          }}
        >
          {/* Grid lines */}
          <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#00f5ff" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* Connection lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <line x1="15%" y1="20%" x2="60%" y2="15%" stroke="rgba(0,245,255,0.15)" strokeWidth="1" strokeDasharray="4,4" />
            <line x1="15%" y1="20%" x2="30%" y2="62%" stroke="rgba(0,245,255,0.15)" strokeWidth="1" strokeDasharray="4,4" />
            <line x1="60%" y1="15%" x2="72%" y2="58%" stroke="rgba(0,245,255,0.15)" strokeWidth="1" strokeDasharray="4,4" />
            <line x1="45%" y1="8%" x2="60%" y2="15%" stroke="rgba(116,185,255,0.1)" strokeWidth="1" strokeDasharray="4,4" />
            <line x1="72%" y1="58%" x2="82%" y2="35%" stroke="rgba(191,95,255,0.1)" strokeWidth="1" strokeDasharray="4,4" />
          </svg>

          {/* Zone nodes */}
          {ZONES.map((zone) => (
            <button
              key={zone.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                zone.unlocked ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
              } ${selectedZone?.id === zone.id ? 'scale-125' : 'hover:scale-110'}`}
              style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
              onClick={() => zone.unlocked && setSelectedZone(zone)}
              onMouseEnter={() => setHoveredZone(zone.id)}
              onMouseLeave={() => setHoveredZone(null)}
            >
              <div
                className={`zone-${zone.type} relative w-14 h-14 rounded-2xl border-2 flex flex-col items-center justify-center transition-all duration-300 ${
                  selectedZone?.id === zone.id ? `neon-border-${zone.type === 'forest' ? 'green' : zone.type === 'ocean' ? 'cyan' : 'yellow'}` : ''
                }`}
                style={{
                  boxShadow: selectedZone?.id === zone.id
                    ? `0 0 20px rgba(0,245,255,0.5)`
                    : hoveredZone === zone.id ? `0 0 12px rgba(0,245,255,0.3)` : 'none'
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
                <p className="text-xs font-rubik font-medium text-white/80 whitespace-nowrap leading-none">
                  {zone.name.split(' ')[0]}
                </p>
                <p className="text-[10px] font-rubik text-slate-500 leading-none mt-0.5">Ур. {zone.level}</p>
              </div>

              {/* Tooltip */}
              {hoveredZone === zone.id && zone.unlocked && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 glass-card rounded-xl p-2 border border-cyan-500/30 z-10 animate-fade-in pointer-events-none">
                  <p className="text-xs font-orbitron text-cyan-400 mb-1">{zone.name}</p>
                  <p className="text-[10px] font-rubik text-slate-300">{zone.description}</p>
                </div>
              )}
            </button>
          ))}

          {/* Player position indicator */}
          <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2 animate-float z-10"
            style={{ left: '14%', top: '21%' }}
          >
            <div className="w-5 h-5 bg-yellow-400 rounded-full border-2 border-yellow-300 shadow-lg"
              style={{ boxShadow: '0 0 12px rgba(255,229,0,0.8)' }} />
          </div>
        </div>

        {/* Zone detail panel */}
        <div className="w-64 flex flex-col gap-3">
          {selectedZone ? (
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
                <div className="flex flex-col gap-1">
                  {selectedZone.pokemon.map((p) => (
                    <div key={p} className="flex items-center gap-2 text-xs font-rubik text-slate-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      {p}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => onStartBattle(selectedZone)}
                className="w-full py-2.5 rounded-xl font-orbitron text-sm font-bold text-black transition-all duration-200 hover:scale-105 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #00f5ff, #00b4d8)', boxShadow: '0 0 16px rgba(0,245,255,0.4)' }}
              >
                ИССЛЕДОВАТЬ
              </button>
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-4 border border-slate-700 flex flex-col items-center justify-center gap-3 text-center flex-1">
              <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center">
                <Icon name="MapPin" size={24} className="text-cyan-400/50" />
              </div>
              <p className="text-sm font-rubik text-slate-400">Выбери зону на карте для исследования</p>
            </div>
          )}

          {/* Stats mini */}
          <div className="glass-card rounded-2xl p-3 border border-slate-700">
            <p className="text-xs font-orbitron text-slate-400 mb-2 uppercase tracking-wider">Прогресс</p>
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-rubik text-slate-300">Зоны открыты</span>
                <span className="text-xs font-orbitron text-cyan-400">4/6</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5">
                <div className="h-1.5 rounded-full" style={{ width: '66%', background: 'linear-gradient(90deg, #00f5ff, #bf5fff)' }} />
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs font-rubik text-slate-300">Покемоны</span>
                <span className="text-xs font-orbitron text-purple-400">3/18</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5">
                <div className="h-1.5 rounded-full" style={{ width: '17%', background: 'linear-gradient(90deg, #bf5fff, #7b2ff7)' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
