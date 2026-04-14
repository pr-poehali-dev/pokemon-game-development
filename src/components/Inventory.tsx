import { useState } from 'react';
import Icon from '@/components/ui/icon';

const POKEMONS = [
  {
    id: 1, name: 'Листвозавр', emoji: '🦖', type: 'grass',
    level: 5, exp: 320, maxExp: 500, hp: 120, maxHp: 120,
    attack: 45, defense: 40, speed: 55,
    rarity: 'common', moves: ['Листовой шторм', 'Корневой удар'],
    caught: true,
  },
  {
    id: 2, name: 'Огнедыш', emoji: '🔥', type: 'fire',
    level: 7, exp: 480, maxExp: 700, hp: 95, maxHp: 110,
    attack: 65, defense: 35, speed: 70,
    rarity: 'rare', moves: ['Огненный шар', 'Жаровая волна'],
    caught: true,
  },
  {
    id: 3, name: 'Неонит', emoji: '⚡', type: 'electric',
    level: 3, exp: 80, maxExp: 250, hp: 70, maxHp: 70,
    attack: 55, defense: 30, speed: 85,
    rarity: 'epic', moves: ['Молния', 'Разряд'],
    caught: true,
  },
];

const ITEMS = [
  { id: 1, name: 'Покебол', emoji: '⚪', count: 12, rarity: 'common', description: 'Ловит слабых покемонов' },
  { id: 2, name: 'Суперболл', emoji: '🔵', count: 4, rarity: 'rare', description: 'Улучшенный шанс поимки' },
  { id: 3, name: 'Зелье HP', emoji: '🧪', count: 8, rarity: 'common', description: 'Восстанавливает 50 HP' },
  { id: 4, name: 'Супер-зелье', emoji: '💊', count: 3, rarity: 'rare', description: 'Восстанавливает 200 HP' },
  { id: 5, name: 'Редкая конфета', emoji: '🍬', count: 1, rarity: 'epic', description: '+1 уровень покемону' },
  { id: 6, name: 'Жетон мастера', emoji: '🏅', count: 1, rarity: 'legendary', description: 'Ловит любого покемона' },
  { id: 7, name: 'Огненный камень', emoji: '🔴', count: 2, rarity: 'rare', description: 'Эволюция огненных' },
  { id: 8, name: 'Громовой камень', emoji: '💛', count: 1, rarity: 'epic', description: 'Эволюция электрических' },
];

const rarityLabel: Record<string, string> = {
  common: 'Обычный',
  rare: 'Редкий',
  epic: 'Эпический',
  legendary: 'Легендарный',
};

const rarityColor: Record<string, string> = {
  common: 'text-slate-400',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legendary: 'text-yellow-400',
};

type Tab = 'pokemons' | 'items';

export default function Inventory() {
  const [tab, setTab] = useState<Tab>('pokemons');
  const [selectedPokemon, setSelectedPokemon] = useState(POKEMONS[0]);
  const [selectedItem, setSelectedItem] = useState<typeof ITEMS[0] | null>(null);

  return (
    <div className="h-full flex flex-col p-4 gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
          <Icon name="Briefcase" size={16} className="text-purple-400" />
        </div>
        <h2 className="font-orbitron text-lg font-bold neon-text-purple">ИНВЕНТАРЬ</h2>
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => setTab('pokemons')}
            className={`px-3 py-1.5 rounded-lg text-xs font-orbitron font-bold transition-all duration-200 ${
              tab === 'pokemons'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            ПОКЕМОНЫ ({POKEMONS.length})
          </button>
          <button
            onClick={() => setTab('items')}
            className={`px-3 py-1.5 rounded-lg text-xs font-orbitron font-bold transition-all duration-200 ${
              tab === 'items'
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            ПРЕДМЕТЫ ({ITEMS.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex gap-4 flex-1 min-h-0">
        {tab === 'pokemons' ? (
          <>
            {/* Pokemon list */}
            <div className="flex flex-col gap-2 w-52 overflow-y-auto">
              {POKEMONS.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPokemon(p)}
                  className={`glass-card rounded-xl p-3 border text-left transition-all duration-200 hover:scale-102 ${
                    selectedPokemon.id === p.id
                      ? 'border-purple-500/60 bg-purple-500/10'
                      : 'border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-2xl rarity-${p.rarity}`}
                      style={{ background: 'rgba(255,255,255,0.05)' }}
                    >
                      {p.emoji}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-orbitron text-xs font-bold text-white truncate">{p.name}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className={`text-[10px] px-1 py-0.5 rounded type-${p.type} font-rubik text-white`}>{p.type}</span>
                        <span className="text-[10px] font-rubik text-slate-400">Ур.{p.level}</span>
                      </div>
                    </div>
                  </div>
                  {/* HP mini bar */}
                  <div className="mt-2">
                    <div className="w-full bg-slate-800 rounded-full h-1">
                      <div
                        className="h-1 rounded-full"
                        style={{
                          width: `${(p.hp / p.maxHp) * 100}%`,
                          backgroundColor: p.hp / p.maxHp > 0.5 ? '#2ed573' : p.hp / p.maxHp > 0.25 ? '#ffe500' : '#ff4757'
                        }}
                      />
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Pokemon detail */}
            <div className="flex-1 glass-card rounded-2xl p-4 border border-purple-500/30 animate-scale-in flex flex-col gap-4">
              <div className="flex items-start gap-4">
                <div
                  className={`w-20 h-20 rounded-2xl flex items-center justify-center text-5xl rarity-${selectedPokemon.rarity} flex-shrink-0`}
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                >
                  {selectedPokemon.emoji}
                </div>
                <div className="flex-1">
                  <h3 className="font-orbitron text-lg font-bold text-white">{selectedPokemon.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded type-${selectedPokemon.type} font-rubik text-white`}>
                      {selectedPokemon.type}
                    </span>
                    <span className={`text-xs font-rubik ${rarityColor[selectedPokemon.rarity]}`}>
                      {rarityLabel[selectedPokemon.rarity]}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-xs font-orbitron text-purple-400">УР. {selectedPokemon.level}</span>
                    <span className="text-xs font-rubik text-slate-500 ml-2">{selectedPokemon.exp}/{selectedPokemon.maxExp} EXP</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 mt-1">
                    <div
                      className="h-1.5 rounded-full"
                      style={{
                        width: `${(selectedPokemon.exp / selectedPokemon.maxExp) * 100}%`,
                        background: 'linear-gradient(90deg, #bf5fff, #7b2ff7)'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* HP */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-rubik text-slate-400">HP</span>
                  <span className="text-xs font-orbitron text-white">{selectedPokemon.hp}/{selectedPokemon.maxHp}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-2.5 rounded-full transition-all duration-500"
                    style={{
                      width: `${(selectedPokemon.hp / selectedPokemon.maxHp) * 100}%`,
                      background: selectedPokemon.hp / selectedPokemon.maxHp > 0.5 ? 'linear-gradient(90deg, #2ed573, #1e8449)' : 'linear-gradient(90deg, #ffe500, #ffa502)'
                    }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Атака', value: selectedPokemon.attack, color: '#ff4757' },
                  { label: 'Защита', value: selectedPokemon.defense, color: '#00b4d8' },
                  { label: 'Скорость', value: selectedPokemon.speed, color: '#ffe500' },
                ].map(stat => (
                  <div key={stat.label} className="bg-slate-800/60 rounded-xl p-2.5 text-center">
                    <div className="font-orbitron text-lg font-bold" style={{ color: stat.color }}>{stat.value}</div>
                    <div className="text-[10px] font-rubik text-slate-400">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Moves */}
              <div>
                <p className="text-xs font-orbitron text-slate-400 mb-2 uppercase tracking-wider">Приёмы</p>
                <div className="grid grid-cols-2 gap-2">
                  {selectedPokemon.moves.map((move, i) => (
                    <div key={i} className="bg-slate-800/60 rounded-lg px-3 py-2 text-xs font-rubik text-slate-300">
                      {move}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Items grid */}
            <div className="grid grid-cols-4 gap-2 content-start overflow-y-auto flex-1">
              {ITEMS.map(item => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}
                  className={`glass-card rounded-xl p-3 border text-center transition-all duration-200 hover:scale-105 rarity-${item.rarity} ${
                    selectedItem?.id === item.id
                      ? 'border-yellow-500/60'
                      : 'border-slate-700'
                  }`}
                >
                  <div className="text-3xl mb-1">{item.emoji}</div>
                  <div className="text-[10px] font-orbitron text-white leading-tight">{item.name}</div>
                  <div className={`text-[10px] font-rubik mt-0.5 ${rarityColor[item.rarity]}`}>×{item.count}</div>
                </button>
              ))}
            </div>

            {/* Item detail */}
            <div className="w-52 flex flex-col gap-3">
              {selectedItem ? (
                <div className={`glass-card rounded-2xl p-4 border rarity-${selectedItem.rarity} border-slate-600 animate-scale-in flex flex-col gap-3`}>
                  <div className="text-center">
                    <div className="text-5xl mb-2">{selectedItem.emoji}</div>
                    <h3 className="font-orbitron text-sm font-bold text-white">{selectedItem.name}</h3>
                    <p className={`text-xs font-rubik mt-0.5 ${rarityColor[selectedItem.rarity]}`}>
                      {rarityLabel[selectedItem.rarity]}
                    </p>
                  </div>
                  <p className="text-xs font-rubik text-slate-300 text-center leading-relaxed">
                    {selectedItem.description}
                  </p>
                  <div className="text-center">
                    <span className="text-xs font-rubik text-slate-400">В наличии: </span>
                    <span className="font-orbitron text-sm font-bold text-white">×{selectedItem.count}</span>
                  </div>
                  <button
                    className="w-full py-2 rounded-xl font-orbitron text-xs font-bold text-black transition-all duration-200 hover:scale-105"
                    style={{ background: 'linear-gradient(135deg, #ffe500, #ffa502)', boxShadow: '0 0 12px rgba(255,229,0,0.4)' }}
                  >
                    ИСПОЛЬЗОВАТЬ
                  </button>
                </div>
              ) : (
                <div className="glass-card rounded-2xl p-4 border border-slate-700 flex flex-col items-center justify-center gap-3 text-center flex-1">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                    <Icon name="Package" size={20} className="text-yellow-400/50" />
                  </div>
                  <p className="text-xs font-rubik text-slate-400">Выбери предмет для просмотра</p>
                </div>
              )}

              {/* Inventory summary */}
              <div className="glass-card rounded-xl p-3 border border-slate-700">
                <p className="text-xs font-orbitron text-slate-400 mb-2">СТАТИСТИКА</p>
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between">
                    <span className="text-xs font-rubik text-slate-400">Предметов</span>
                    <span className="text-xs font-orbitron text-white">{ITEMS.length}/20</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs font-rubik text-slate-400">Покеболов</span>
                    <span className="text-xs font-orbitron text-cyan-400">16</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs font-rubik text-slate-400">Легендарных</span>
                    <span className="text-xs font-orbitron text-yellow-400">1</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
