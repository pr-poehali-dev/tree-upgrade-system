import { formatLeaves, getItemPrice } from '@/lib/gameStore';
import type { GameState } from '@/lib/gameStore';

const TREE_IMG = 'https://cdn.poehali.dev/projects/dc25b253-70be-4403-8236-7e436e54997b/files/623086bb-4016-4cd1-b5ce-439f13a66fd3.jpg';
const BG_IMG = 'https://cdn.poehali.dev/projects/dc25b253-70be-4403-8236-7e436e54997b/files/2216d4dd-16e0-4d38-a8b7-11b76380503a.jpg';

export function HomeTab({ state, treeShake, onTreeClick }: {
  state: GameState;
  treeShake: boolean;
  onTreeClick: (e: React.MouseEvent) => void;
}) {
  return (
    <div className="relative">
      <div
        className="relative h-64 overflow-hidden"
        style={{
          backgroundImage: `url(${BG_IMG})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center bottom',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#E8F5E9]/80" />
        <div className="absolute top-4 left-6 animate-cloud">
          <div className="bg-white/80 rounded-full px-5 py-2 text-2xl shadow-sm">☁️</div>
        </div>
        <div className="absolute top-8 right-8 animate-cloud" style={{ animationDelay: '2s', animationDuration: '8s' }}>
          <div className="bg-white/70 rounded-full px-4 py-1.5 text-xl shadow-sm">☁️</div>
        </div>
      </div>

      <div className="flex flex-col items-center -mt-20 pb-4 px-4">
        <div
          onClick={onTreeClick}
          className={`tree-btn relative cursor-pointer select-none ${treeShake ? 'animate-tree-shake' : ''}`}
          style={{ width: 180, height: 180 }}
        >
          <img
            src={TREE_IMG}
            alt="Дерево"
            className="w-full h-full object-contain drop-shadow-xl"
          />
          <div className="absolute -bottom-1 -right-1 bg-yellow-400 rounded-full w-9 h-9 flex items-center justify-center text-lg border-2 border-white shadow">
            🍃
          </div>
        </div>

        <p className="text-green-600 font-bold text-sm mt-2 mb-1 font-ui">Нажми на дерево!</p>
        <p className="text-green-400 text-xs font-ui">+{formatLeaves(state.leavesPerClick)} 🍃 за клик</p>

        <div className="w-full mt-5 grid grid-cols-3 gap-3">
          {[
            { label: 'Листиков', value: formatLeaves(Math.floor(state.leaves)), emoji: '🍃' },
            { label: 'В секунду', value: formatLeaves(state.leavesPerSecond), emoji: '⚡' },
            { label: 'Кликов', value: formatLeaves(state.totalClicks), emoji: '👆' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-3 text-center card-cartoon">
              <div className="text-xl mb-0.5">{s.emoji}</div>
              <div className="font-black text-green-700 text-sm font-ui">{s.value}</div>
              <div className="text-gray-400 text-[10px] font-ui">{s.label}</div>
            </div>
          ))}
        </div>

        {state.shopItems.some(i => i.owned > 0) && (
          <div className="w-full mt-4 bg-white rounded-2xl p-4 card-cartoon">
            <h3 className="font-bold text-green-700 text-sm mb-3 font-ui">🏡 Мои помощники</h3>
            <div className="flex flex-wrap gap-2">
              {state.shopItems.filter(i => i.owned > 0).map(item => (
                <div key={item.id} className="flex items-center gap-1.5 bg-green-50 rounded-xl px-3 py-1.5 border border-green-200">
                  <span className="text-lg">{item.emoji}</span>
                  <span className="text-xs font-bold text-green-700 font-ui">×{item.owned}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function AchievementsTab({ state }: { state: GameState }) {
  const unlocked = state.achievements.filter(a => a.unlocked).length;
  return (
    <div className="p-4">
      <div className="bg-yellow-400 rounded-2xl p-4 mb-4 card-cartoon text-center">
        <div className="font-game text-xl text-yellow-900">🏆 Достижения</div>
        <div className="text-yellow-800 text-sm font-ui mt-1">{unlocked} / {state.achievements.length} открыто</div>
        <div className="mt-2 bg-yellow-300 rounded-full h-3 overflow-hidden">
          <div className="bg-yellow-600 h-full rounded-full transition-all" style={{ width: `${(unlocked / state.achievements.length) * 100}%` }} />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {state.achievements.map(a => (
          <div
            key={a.id}
            className={`flex items-center gap-3 p-4 rounded-2xl card-cartoon transition-all ${
              a.unlocked ? 'bg-white' : 'bg-gray-50 opacity-60'
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${a.unlocked ? 'bg-yellow-100' : 'bg-gray-100'}`}>
              {a.unlocked ? a.emoji : '🔒'}
            </div>
            <div className="flex-1">
              <div className={`font-bold text-sm font-ui ${a.unlocked ? 'text-gray-800' : 'text-gray-400'}`}>{a.name}</div>
              <div className="text-gray-400 text-xs font-ui">{a.description}</div>
            </div>
            {a.unlocked && <div className="text-green-500 text-lg">✓</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ShopTab({ state, onBuy }: { state: GameState; onBuy: (id: string) => void }) {
  return (
    <div className="p-4">
      <div className="bg-green-500 rounded-2xl p-4 mb-4 card-cartoon text-center">
        <div className="font-game text-xl text-white">🛒 Магазин леса</div>
        <div className="text-green-100 text-sm font-ui mt-1">У тебя: {formatLeaves(state.leaves)} 🍃</div>
      </div>
      <div className="flex flex-col gap-3">
        {state.shopItems.map(item => {
          const price = getItemPrice(item);
          const canBuy = state.leaves >= price;
          return (
            <div key={item.id} className="bg-white rounded-2xl p-4 card-cartoon flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-3xl border-2 border-green-200 flex-shrink-0">
                {item.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-gray-800 text-sm font-ui">{item.name}</div>
                <div className="text-gray-400 text-xs font-ui truncate">{item.description}</div>
                <div className="flex gap-2 mt-1">
                  {item.leafPerSecond > 0 && (
                    <span className="text-[10px] bg-green-100 text-green-700 rounded-full px-2 py-0.5 font-ui font-bold">
                      +{item.leafPerSecond}/сек
                    </span>
                  )}
                  {item.leafPerClick > 0 && (
                    <span className="text-[10px] bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 font-ui font-bold">
                      +{item.leafPerClick}/клик
                    </span>
                  )}
                </div>
                {item.owned > 0 && (
                  <div className="text-[10px] text-gray-400 font-ui mt-0.5">Есть: {item.owned} шт.</div>
                )}
              </div>
              <button
                onClick={() => onBuy(item.id)}
                disabled={!canBuy}
                className={`flex-shrink-0 px-3 py-2 rounded-xl font-bold text-sm btn-cartoon font-ui flex flex-col items-center min-w-[60px] ${
                  canBuy
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                }`}
              >
                <span className="text-xs">{formatLeaves(price)}</span>
                <span>🍃</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function InventoryTab({ state }: { state: GameState }) {
  const hasItems = state.inventory.some(i => i.quantity > 0);
  return (
    <div className="p-4">
      <div className="bg-purple-500 rounded-2xl p-4 mb-4 card-cartoon text-center">
        <div className="font-game text-xl text-white">🎒 Инвентарь</div>
        <div className="text-purple-100 text-sm font-ui mt-1">Особые предметы</div>
      </div>
      {!hasItems ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-3">📦</div>
          <p className="text-gray-400 font-ui text-sm">Пока пусто...</p>
          <p className="text-gray-300 font-ui text-xs mt-1">Предметы можно найти, играя</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {state.inventory.filter(i => i.quantity > 0).map(item => (
            <div key={item.id} className="bg-white rounded-2xl p-4 card-cartoon text-center">
              <div className="text-4xl mb-2">{item.emoji}</div>
              <div className="font-bold text-gray-800 text-sm font-ui">{item.name}</div>
              <div className="text-gray-400 text-xs font-ui mt-1">{item.effect}</div>
              <div className="mt-2 bg-purple-100 rounded-full px-3 py-1 text-purple-700 font-bold text-sm font-ui">
                ×{item.quantity}
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-4 bg-amber-50 rounded-2xl p-4 border-2 border-amber-200">
        <h3 className="font-bold text-amber-700 text-sm font-ui mb-3">✨ Все предметы</h3>
        <div className="flex flex-col gap-2">
          {state.inventory.map(item => (
            <div key={item.id} className="flex items-center gap-3">
              <span className="text-xl">{item.emoji}</span>
              <div className="flex-1">
                <div className="text-sm font-bold text-gray-700 font-ui">{item.name}</div>
                <div className="text-xs text-gray-400 font-ui">{item.effect}</div>
              </div>
              <span className="text-sm font-bold text-gray-500 font-ui">×{item.quantity}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SettingsTab({ state, setState }: {
  state: GameState;
  setState: React.Dispatch<React.SetStateAction<GameState>>;
}) {
  const toggleSetting = (key: keyof typeof state.settings) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, [key]: !prev.settings[key] },
    }));
  };

  const resetGame = () => {
    if (window.confirm('Сбросить всю игру? Это нельзя отменить!')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const settingsList = [
    { key: 'sound' as const, label: 'Звуки', emoji: '🔊', desc: 'Звуковые эффекты' },
    { key: 'animations' as const, label: 'Анимации', emoji: '✨', desc: 'Красивые эффекты' },
    { key: 'notifications' as const, label: 'Уведомления', emoji: '🔔', desc: 'Оффлайн-бонусы' },
  ];

  return (
    <div className="p-4">
      <div className="bg-gray-600 rounded-2xl p-4 mb-4 card-cartoon text-center">
        <div className="font-game text-xl text-white">⚙️ Настройки</div>
        <div className="text-gray-300 text-sm font-ui mt-1">Всего листиков: {formatLeaves(state.totalLeavesEarned)} 🍃</div>
      </div>

      <div className="flex flex-col gap-3 mb-4">
        {settingsList.map(s => (
          <div key={s.key} className="bg-white rounded-2xl p-4 card-cartoon flex items-center gap-3">
            <span className="text-2xl">{s.emoji}</span>
            <div className="flex-1">
              <div className="font-bold text-gray-800 text-sm font-ui">{s.label}</div>
              <div className="text-gray-400 text-xs font-ui">{s.desc}</div>
            </div>
            <button
              onClick={() => toggleSetting(s.key)}
              className={`w-12 h-6 rounded-full transition-all relative border-2 ${
                state.settings[s.key] ? 'bg-green-500 border-green-600' : 'bg-gray-200 border-gray-300'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow ${
                state.settings[s.key] ? 'left-6' : 'left-0.5'
              }`} />
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-4 card-cartoon mb-3">
        <h3 className="font-bold text-gray-700 text-sm font-ui mb-3">📊 Статистика</h3>
        <div className="flex flex-col gap-2">
          {[
            ['Всего листиков', formatLeaves(state.totalLeavesEarned) + ' 🍃'],
            ['Всего кликов', formatLeaves(state.totalClicks) + ' 👆'],
            ['Помощники', state.shopItems.filter(i => i.owned > 0).length + ' шт.'],
            ['Достижений', state.unlockedAchievements.length + ' / ' + state.achievements.length],
          ].map(([label, val]) => (
            <div key={label} className="flex justify-between">
              <span className="text-gray-500 text-sm font-ui">{label}</span>
              <span className="font-bold text-gray-700 text-sm font-ui">{val}</span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={resetGame}
        className="w-full bg-red-100 text-red-500 font-bold py-3 rounded-2xl btn-cartoon text-sm font-ui"
      >
        🗑️ Сбросить игру
      </button>
    </div>
  );
}