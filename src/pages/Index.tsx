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

export default function Index() {
  const [screen, setScreen] = useState<Screen>('home');
  const [activeZone, setActiveZone] = useState<{ name: string; emoji: string } | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const handleSave = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 1000);
  };

  const handleStartBattle = (zone: { name: string; emoji: string }) => {
    setActiveZone(zone);
    setScreen('battle');
  };

  return (
    <div className="stars-bg ambient-bg min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="relative z-10 flex items-center px-4 py-3 border-b border-slate-800/60"
        style={{ backdropFilter: 'blur(20px)', background: 'rgba(6,13,26,0.8)' }}>

        {/* Logo */}
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-orbitron text-sm font-black text-black"
            style={{ background: 'linear-gradient(135deg, #00f5ff, #bf5fff)' }}
          >
            P
          </div>
          <span className="font-orbitron text-sm font-bold neon-text-cyan">ПОКЕМИР</span>
        </div>

        {/* Player info */}
        <div className="ml-6 flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-sm">
            🧑‍🚀
          </div>
          <div>
            <p className="font-orbitron text-xs font-bold text-white">{PLAYER.name}</p>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-rubik text-purple-400">УР. {PLAYER.level}</span>
              <div className="w-16 bg-slate-800 rounded-full h-1">
                <div
                  className="h-1 rounded-full"
                  style={{
                    width: `${(PLAYER.exp / PLAYER.maxExp) * 100}%`,
                    background: 'linear-gradient(90deg, #bf5fff, #7b2ff7)'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 ml-6">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">🏅</span>
            <span className="font-orbitron text-xs font-bold text-yellow-400">{PLAYER.badges}</span>
            <span className="text-[10px] font-rubik text-slate-500">значка</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm">💰</span>
            <span className="font-orbitron text-xs font-bold text-yellow-400">{PLAYER.coins.toLocaleString()}</span>
          </div>
        </div>

        {/* Save button */}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-orbitron font-bold transition-all duration-200 ${
              saveStatus === 'saved'
                ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                : saveStatus === 'saving'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40 animate-pulse'
                : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20'
            }`}
          >
            <Icon name={saveStatus === 'saved' ? 'Check' : 'Cloud'} size={12} />
            {saveStatus === 'saving' ? 'СОХРАНЕНИЕ...' : saveStatus === 'saved' ? 'СОХРАНЕНО' : 'СОХРАНИТЬ'}
          </button>
        </div>
      </header>

      {/* Main layout */}
      <div className="relative z-10 flex flex-1 min-h-0" style={{ height: 'calc(100vh - 57px)' }}>
        {/* Sidebar nav */}
        <nav className="flex flex-col items-center py-4 gap-2 border-r border-slate-800/60 w-16"
          style={{ backdropFilter: 'blur(20px)', background: 'rgba(6,13,26,0.6)' }}>

          {[
            { id: 'home', icon: 'Home', label: 'Главная', color: 'cyan' },
            { id: 'map', icon: 'Map', label: 'Карта', color: 'cyan' },
            { id: 'battle', icon: 'Swords', label: 'Бой', color: 'red' },
            { id: 'inventory', icon: 'Briefcase', label: 'Рюкзак', color: 'purple' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setScreen(item.id as Screen)}
              className={`
                w-10 h-10 rounded-xl flex flex-col items-center justify-center gap-0.5
                transition-all duration-200 hover:scale-110 relative group
                ${screen === item.id
                  ? item.color === 'red'
                    ? 'bg-red-500/20 border border-red-500/50'
                    : item.color === 'purple'
                    ? 'bg-purple-500/20 border border-purple-500/50'
                    : 'bg-cyan-500/20 border border-cyan-500/50'
                  : 'border border-transparent hover:bg-slate-800/60'
                }
              `}
            >
              <Icon
                name={item.icon}
                size={16}
                className={
                  screen === item.id
                    ? item.color === 'red' ? 'text-red-400' : item.color === 'purple' ? 'text-purple-400' : 'text-cyan-400'
                    : 'text-slate-400 group-hover:text-slate-200'
                }
              />
              {screen === item.id && (
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r"
                  style={{
                    background: item.color === 'red' ? '#ff4757' : item.color === 'purple' ? '#bf5fff' : '#00f5ff',
                    boxShadow: `0 0 8px ${item.color === 'red' ? '#ff4757' : item.color === 'purple' ? '#bf5fff' : '#00f5ff'}`
                  }}
                />
              )}
            </button>
          ))}

          <div className="flex-1" />

          <button className="w-10 h-10 rounded-xl flex items-center justify-center border border-transparent hover:bg-slate-800/60 transition-all duration-200 group">
            <Icon name="Settings" size={16} className="text-slate-500 group-hover:text-slate-300" />
          </button>
        </nav>

        {/* Content area */}
        <main className="flex-1 overflow-hidden">
          {screen === 'home' && (
            <div className="h-full flex flex-col items-center justify-center p-8 gap-8 animate-fade-in overflow-y-auto">
              {/* Hero */}
              <div className="text-center">
                <div className="text-7xl mb-4 animate-float">🌍</div>
                <h1 className="font-orbitron text-4xl font-black mb-3"
                  style={{
                    background: 'linear-gradient(135deg, #00f5ff, #bf5fff, #ffe500)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}>
                  ПОКЕМИР
                </h1>
                <p className="font-rubik text-slate-400 text-lg max-w-md mx-auto leading-relaxed">
                  Твоё межгалактическое приключение начинается здесь. Исследуй миры, побеждай в боях, собирай покемонов.
                </p>
              </div>

              {/* Map preview */}
              <div
                className="w-full max-w-2xl h-40 rounded-2xl overflow-hidden border border-slate-700 relative"
                style={{ boxShadow: '0 0 40px rgba(0,245,255,0.1)' }}
              >
                <img
                  src="https://cdn.poehali.dev/projects/e60ed1f2-73a4-4900-9745-54d5b123f2c9/files/a36b0038-b816-4364-97b6-fd14adfae4b7.jpg"
                  alt="World map"
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="font-orbitron text-xs text-cyan-400 mb-0.5">ТЕКУЩАЯ ЛОКАЦИЯ</p>
                  <p className="font-rubik text-sm text-white">🌿 Изумрудный лес · Уровень 1-5</p>
                </div>
              </div>

              {/* Action cards */}
              <div className="grid grid-cols-3 gap-4 w-full max-w-2xl">
                {[
                  {
                    screen: 'map' as Screen,
                    emoji: '🗺️',
                    title: 'Карта мира',
                    desc: '6 зон для исследования',
                    gradient: 'linear-gradient(135deg, rgba(0,245,255,0.08), rgba(0,180,216,0.08))',
                    border: 'border-cyan-500/30',
                  },
                  {
                    screen: 'battle' as Screen,
                    emoji: '⚔️',
                    title: 'Битва',
                    desc: 'Пошаговые сражения',
                    gradient: 'linear-gradient(135deg, rgba(255,71,87,0.08), rgba(255,107,53,0.08))',
                    border: 'border-red-500/30',
                  },
                  {
                    screen: 'inventory' as Screen,
                    emoji: '🎒',
                    title: 'Инвентарь',
                    desc: '3 покемона · 8 предметов',
                    gradient: 'linear-gradient(135deg, rgba(191,95,255,0.08), rgba(123,47,247,0.08))',
                    border: 'border-purple-500/30',
                  },
                ].map(card => (
                  <button
                    key={card.screen}
                    onClick={() => setScreen(card.screen)}
                    className={`glass-card rounded-2xl p-5 border ${card.border} text-left card-3d transition-all duration-200 hover:scale-105 active:scale-95`}
                    style={{ background: card.gradient }}
                  >
                    <div className="text-3xl mb-3">{card.emoji}</div>
                    <h3 className="font-orbitron text-sm font-bold text-white mb-1">{card.title}</h3>
                    <p className="font-rubik text-xs text-slate-400">{card.desc}</p>
                  </button>
                ))}
              </div>

              {/* Pokemon showcase */}
              <div className="flex items-center gap-6 glass-card rounded-2xl px-5 py-3 border border-slate-700">
                <img
                  src="https://cdn.poehali.dev/projects/e60ed1f2-73a4-4900-9745-54d5b123f2c9/files/3f135ee1-0153-4163-9374-6f07b3926b65.jpg"
                  alt="Pokemon"
                  className="w-14 h-14 rounded-xl object-cover"
                />
                <div>
                  <p className="font-orbitron text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Команда покемонов</p>
                  <div className="flex gap-3">
                    <span className="text-sm font-rubik text-white">🦖 Листвозавр</span>
                    <span className="text-sm font-rubik text-white">🔥 Огнедыш</span>
                    <span className="text-sm font-rubik text-white">⚡ Неонит</span>
                  </div>
                </div>
                <button
                  onClick={() => setScreen('inventory')}
                  className="ml-4 px-3 py-1.5 rounded-lg text-xs font-orbitron text-purple-400 border border-purple-500/30 hover:bg-purple-500/10 transition-colors"
                >
                  СМОТРЕТЬ
                </button>
              </div>
            </div>
          )}

          {screen === 'map' && (
            <div className="h-full animate-fade-in">
              <WorldMap onStartBattle={handleStartBattle} />
            </div>
          )}

          {screen === 'battle' && (
            <div className="h-full animate-fade-in">
              <BattleSystem
                zone={activeZone}
                onBack={() => setScreen('map')}
              />
            </div>
          )}

          {screen === 'inventory' && (
            <div className="h-full animate-fade-in">
              <Inventory />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
