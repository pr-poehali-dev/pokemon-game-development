import { useState } from 'react';
import Icon from '@/components/ui/icon';
import WorldMap from '@/components/WorldMap';
import BattleSystem from '@/components/BattleSystem';
import Inventory from '@/components/Inventory';

type Screen = 'home' | 'map' | 'battle' | 'inventory';

const PLAYER = {
  name: 'Тренер Алекс',
  level: 12,
  exp: 2840,
  maxExp: 3500,
  badges: 3,
  coins: 1250,
};

const NAV_ITEMS = [
  { id: 'home',      icon: 'Home',      label: 'Главная', accent: '#00f5ff', bg: 'rgba(0,245,255,0.12)',  border: 'rgba(0,245,255,0.4)'  },
  { id: 'map',       icon: 'Map',       label: 'Карта',   accent: '#00b4d8', bg: 'rgba(0,180,216,0.12)', border: 'rgba(0,180,216,0.4)'  },
  { id: 'battle',    icon: 'Swords',    label: 'Бой',     accent: '#ff4757', bg: 'rgba(255,71,87,0.12)', border: 'rgba(255,71,87,0.4)'  },
  { id: 'inventory', icon: 'Briefcase', label: 'Рюкзак',  accent: '#bf5fff', bg: 'rgba(191,95,255,0.12)',border: 'rgba(191,95,255,0.4)' },
];

export default function Index() {
  const [screen, setScreen] = useState<Screen>('home');
  const [activeZone, setActiveZone] = useState<{ name: string; emoji: string } | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const handleSave = () => {
    setSaveStatus('saving');
    setTimeout(() => { setSaveStatus('saved'); setTimeout(() => setSaveStatus('idle'), 2000); }, 1000);
  };

  const handleStartBattle = (zone: { name: string; emoji: string }) => {
    setActiveZone(zone);
    setScreen('battle');
  };

  return (
    <div className="stars-bg ambient-bg min-h-screen flex flex-col">

      {/* ═══════════ HEADER ═══════════ */}
      <header
        className="relative z-20 flex items-center px-5 py-2.5 border-b"
        style={{
          backdropFilter: 'blur(28px) saturate(1.5)',
          background: 'rgba(4,9,15,0.88)',
          borderColor: 'rgba(255,255,255,0.07)',
          boxShadow: '0 1px 0 rgba(0,245,255,0.08)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-orbitron text-base font-black text-black relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #00f5ff 0%, #bf5fff 100%)' }}
          >
            <span className="relative z-10">P</span>
            <div className="absolute inset-0 opacity-30"
              style={{ background: 'conic-gradient(from 0deg, transparent, rgba(255,255,255,0.6), transparent)', animation: 'spin-slow 4s linear infinite' }} />
          </div>
          <div>
            <span className="font-orbitron text-sm font-black neon-text-cyan tracking-widest">ПОКЕМИР</span>
            <div className="neon-divider mt-0.5" style={{ width: 64 }} />
          </div>
        </div>

        {/* Player avatar + xp */}
        <div className="ml-6 flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-base relative"
            style={{
              background: 'linear-gradient(135deg, rgba(191,95,255,0.3), rgba(123,47,247,0.2))',
              border: '1.5px solid rgba(191,95,255,0.5)',
              boxShadow: '0 0 12px rgba(191,95,255,0.4)',
            }}
          >
            🧑‍🚀
          </div>
          <div>
            <p className="font-orbitron text-xs font-bold text-white leading-none mb-1">{PLAYER.name}</p>
            <div className="flex items-center gap-1.5">
              <span className="chip chip-purple">УР.{PLAYER.level}</span>
              <div className="w-20 bg-slate-800/80 rounded-full h-1.5 overflow-hidden progress-shine"
                style={{ boxShadow: 'inset 0 0 4px rgba(0,0,0,0.5)' }}>
                <div className="h-1.5 rounded-full"
                  style={{ width: `${(PLAYER.exp / PLAYER.maxExp) * 100}%`, background: 'linear-gradient(90deg, #bf5fff, #7b2ff7)' }} />
              </div>
              <span className="text-[9px] font-rubik text-slate-500">{PLAYER.exp}/{PLAYER.maxExp}</span>
            </div>
          </div>
        </div>

        {/* Stats chips */}
        <div className="flex items-center gap-2.5 ml-5">
          <div className="chip chip-yellow">
            <span>🏅</span>
            <span>{PLAYER.badges} значка</span>
          </div>
          <div className="chip chip-yellow">
            <span>💰</span>
            <span>{PLAYER.coins.toLocaleString()}</span>
          </div>
        </div>

        {/* Save */}
        <div className="ml-auto">
          <button
            onClick={handleSave}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-orbitron font-bold transition-all duration-200 ${
              saveStatus === 'saved'   ? 'chip-green  chip border-green-500/40  text-green-400'
            : saveStatus === 'saving' ? 'chip-cyan   chip border-cyan-500/40   text-cyan-400 animate-pulse'
            :                          'chip-cyan   chip hover:bg-cyan-500/15 text-cyan-400'}`}
          >
            <Icon name={saveStatus === 'saved' ? 'Check' : saveStatus === 'saving' ? 'Loader' : 'Cloud'} size={11} />
            {saveStatus === 'saving' ? 'СОХРАНЕНИЕ...' : saveStatus === 'saved' ? 'СОХРАНЕНО' : 'СОХРАНИТЬ'}
          </button>
        </div>
      </header>

      {/* ═══════════ MAIN ═══════════ */}
      <div className="relative z-10 flex flex-1 min-h-0" style={{ height: 'calc(100vh - 53px)' }}>

        {/* ── Sidebar ── */}
        <nav
          className="flex flex-col items-center py-4 gap-1.5 border-r w-[58px] flex-shrink-0"
          style={{
            backdropFilter: 'blur(24px)',
            background: 'rgba(4,9,15,0.75)',
            borderColor: 'rgba(255,255,255,0.06)',
          }}
        >
          {NAV_ITEMS.map(item => {
            const active = screen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setScreen(item.id as Screen)}
                title={item.label}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 relative group"
                style={{
                  background: active ? item.bg : 'transparent',
                  border: `1px solid ${active ? item.border : 'transparent'}`,
                  boxShadow: active ? `0 0 14px ${item.accent}55, inset 0 0 8px ${item.accent}15` : 'none',
                }}
              >
                <Icon
                  name={item.icon}
                  size={17}
                  style={{ color: active ? item.accent : undefined }}
                  className={active ? '' : 'text-slate-500 group-hover:text-slate-200 transition-colors'}
                />
                {/* Active indicator */}
                {active && (
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full"
                    style={{ background: item.accent, boxShadow: `0 0 10px ${item.accent}` }}
                  />
                )}
                {/* Tooltip */}
                <div className="absolute left-full ml-2 px-2 py-1 rounded-lg text-[10px] font-orbitron font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"
                  style={{ background: 'rgba(10,22,40,0.95)', border: `1px solid ${item.border}`, color: item.accent }}>
                  {item.label}
                </div>
              </button>
            );
          })}

          <div className="flex-1" />

          <button className="w-10 h-10 rounded-xl flex items-center justify-center border border-transparent hover:bg-slate-800/60 transition-all group">
            <Icon name="Settings" size={16} className="text-slate-600 group-hover:text-slate-300 transition-colors" />
          </button>
        </nav>

        {/* ── Content ── */}
        <main className="flex-1 overflow-hidden relative">
          {screen === 'home' && <HomeScreen onNavigate={setScreen} />}
          {screen === 'map'  && <div className="h-full animate-fade-in"><WorldMap onStartBattle={handleStartBattle} /></div>}
          {screen === 'battle' && <div className="h-full animate-fade-in"><BattleSystem zone={activeZone} onBack={() => setScreen('map')} /></div>}
          {screen === 'inventory' && <div className="h-full animate-fade-in"><Inventory /></div>}
        </main>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   HOME SCREEN — modern redesign
═══════════════════════════════════════════ */
function HomeScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <div className="h-full overflow-y-auto flex flex-col items-center justify-center p-8 gap-7 animate-fade-in-up">

      {/* Hero section */}
      <div className="text-center relative">
        {/* Glow ring behind globe */}
        <div className="relative inline-block mb-4">
          <div className="absolute inset-0 rounded-full blur-2xl"
            style={{ background: 'radial-gradient(circle, rgba(0,245,255,0.25) 0%, rgba(191,95,255,0.15) 50%, transparent 70%)', transform: 'scale(1.8)' }} />
          <div className="text-7xl animate-float-slow relative z-10" style={{ filter: 'drop-shadow(0 0 20px rgba(0,245,255,0.5))' }}>🌍</div>
        </div>

        <h1
          className="font-orbitron text-5xl font-black mb-3 tracking-wider"
          style={{
            background: 'linear-gradient(135deg, #00f5ff 0%, #bf5fff 50%, #ffe500 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: 'none',
            filter: 'drop-shadow(0 0 24px rgba(0,245,255,0.4))',
          }}
        >
          ПОКЕМИР
        </h1>
        <p className="font-rubik text-slate-400 text-base max-w-sm mx-auto leading-relaxed">
          Межгалактическое приключение. Исследуй миры, побеждай в боях, собирай покемонов.
        </p>
      </div>

      {/* Map preview banner */}
      <div
        className="w-full max-w-2xl h-36 rounded-2xl overflow-hidden relative holo-card scanlines"
        style={{
          border: '1px solid rgba(0,245,255,0.2)',
          boxShadow: '0 0 40px rgba(0,245,255,0.1), 0 0 80px rgba(0,245,255,0.04)',
        }}
      >
        <img
          src="https://cdn.poehali.dev/projects/e60ed1f2-73a4-4900-9745-54d5b123f2c9/files/a36b0038-b816-4364-97b6-fd14adfae4b7.jpg"
          alt="World map"
          className="w-full h-full object-cover opacity-55"
          style={{ filter: 'saturate(1.3) brightness(0.8)' }}
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(4,9,15,0.6) 0%, transparent 40%, transparent 60%, rgba(4,9,15,0.4) 100%)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 40%, rgba(4,9,15,0.8) 100%)' }} />
        {/* Animated scan line */}
        <div className="absolute left-0 right-0 h-px opacity-30 pointer-events-none"
          style={{ background: 'linear-gradient(90deg, transparent, #00f5ff, transparent)', animation: 'scan-line 3s linear infinite', top: 0 }} />
        {/* Location label */}
        <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
          <div>
            <p className="font-orbitron text-[10px] text-cyan-400 uppercase tracking-widest mb-0.5">Текущая локация</p>
            <p className="font-rubik text-sm font-medium text-white">🌿 Изумрудный лес · Уровень 1-5</p>
          </div>
          <button
            onClick={() => onNavigate('map')}
            className="px-3 py-1.5 rounded-xl text-xs font-orbitron font-bold text-black transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg,#00f5ff,#00b4d8)', boxShadow: '0 0 14px rgba(0,245,255,0.5)' }}
          >
            ОТКРЫТЬ
          </button>
        </div>
      </div>

      {/* Action cards */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-2xl">
        {[
          {
            screen: 'map' as Screen,
            emoji: '🗺️', title: 'Карта мира',
            desc: '6 зон для исследования',
            gradient: 'linear-gradient(135deg, rgba(0,245,255,0.1), rgba(0,180,216,0.06))',
            border: 'rgba(0,245,255,0.25)', accent: '#00f5ff',
            glow: 'rgba(0,245,255,0.2)',
          },
          {
            screen: 'battle' as Screen,
            emoji: '⚔️', title: 'Битва',
            desc: 'Пошаговые сражения',
            gradient: 'linear-gradient(135deg, rgba(255,71,87,0.1), rgba(255,107,53,0.06))',
            border: 'rgba(255,71,87,0.25)', accent: '#ff4757',
            glow: 'rgba(255,71,87,0.2)',
          },
          {
            screen: 'inventory' as Screen,
            emoji: '🎒', title: 'Инвентарь',
            desc: '3 покемона · 8 предметов',
            gradient: 'linear-gradient(135deg, rgba(191,95,255,0.1), rgba(123,47,247,0.06))',
            border: 'rgba(191,95,255,0.25)', accent: '#bf5fff',
            glow: 'rgba(191,95,255,0.2)',
          },
        ].map((card, i) => (
          <button
            key={card.screen}
            onClick={() => onNavigate(card.screen)}
            className="glass-card rounded-2xl p-5 text-left card-3d transition-all duration-250 hover:scale-[1.04] active:scale-95 relative overflow-hidden group"
            style={{
              background: card.gradient,
              border: `1px solid ${card.border}`,
              boxShadow: `0 4px 24px rgba(0,0,0,0.3), 0 0 0 0 ${card.glow}`,
              animationDelay: `${i * 0.08}s`,
            }}
          >
            {/* Hover glow */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"
              style={{ background: `radial-gradient(circle at 50% 120%, ${card.glow} 0%, transparent 60%)` }} />
            <div className="text-3xl mb-3 relative z-10" style={{ filter: `drop-shadow(0 0 8px ${card.accent}88)` }}>
              {card.emoji}
            </div>
            <h3 className="font-orbitron text-sm font-bold text-white mb-1 relative z-10">{card.title}</h3>
            <p className="font-rubik text-xs relative z-10" style={{ color: 'rgba(148,163,184,0.8)' }}>{card.desc}</p>
            {/* Corner accent */}
            <div className="absolute top-0 right-0 w-12 h-12 opacity-20 group-hover:opacity-40 transition-opacity"
              style={{ background: `radial-gradient(circle at top right, ${card.accent}, transparent)` }} />
          </button>
        ))}
      </div>

      {/* Pokemon team showcase */}
      <div
        className="glass-card-bright w-full max-w-2xl rounded-2xl px-5 py-3.5 flex items-center gap-4 relative overflow-hidden"
        style={{ border: '1px solid rgba(191,95,255,0.2)', boxShadow: '0 0 30px rgba(191,95,255,0.06)' }}
      >
        {/* BG glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 10% 50%, rgba(191,95,255,0.07) 0%, transparent 60%)' }} />

        <img
          src="https://cdn.poehali.dev/projects/e60ed1f2-73a4-4900-9745-54d5b123f2c9/files/3f135ee1-0153-4163-9374-6f07b3926b65.jpg"
          alt="Pokemon"
          className="w-12 h-12 rounded-xl object-cover relative z-10 flex-shrink-0"
          style={{ border: '1.5px solid rgba(191,95,255,0.4)', boxShadow: '0 0 14px rgba(191,95,255,0.3)' }}
        />
        <div className="relative z-10 flex-1">
          <p className="font-orbitron text-[9px] text-slate-500 uppercase tracking-widest mb-1.5">Команда покемонов</p>
          <div className="flex gap-2">
            {[['🦖','Листвозавр','#2ed573'],['🔥','Огнедыш','#ff6b35'],['⚡','Неонит','#ffe500']].map(([emoji, name, color]) => (
              <div key={name} className="flex items-center gap-1 px-2 py-1 rounded-lg"
                style={{ background: `${color}12`, border: `1px solid ${color}30` }}>
                <span className="text-sm">{emoji}</span>
                <span className="font-rubik text-xs font-medium" style={{ color }}>{name}</span>
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={() => onNavigate('inventory')}
          className="relative z-10 px-3 py-2 rounded-xl text-xs font-orbitron font-bold transition-all hover:scale-105 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, rgba(191,95,255,0.2), rgba(123,47,247,0.15))',
            border: '1px solid rgba(191,95,255,0.4)',
            color: '#bf5fff',
            boxShadow: '0 0 14px rgba(191,95,255,0.2)',
          }}
        >
          СМОТРЕТЬ
        </button>
      </div>
    </div>
  );
}
