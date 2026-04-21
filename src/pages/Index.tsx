import { useState, useEffect, useCallback, useRef } from 'react';
import {
  loadGameState,
  saveGameState,
  formatLeaves,
  getItemPrice,
  type GameState,
} from '@/lib/gameStore';

type Tab = 'home' | 'achievements' | 'shop' | 'inventory' | 'settings';

const SQUIRREL_IMG = 'https://cdn.poehali.dev/projects/dc25b253-70be-4403-8236-7e436e54997b/files/9b0a6982-83be-48cf-b747-0a9a9a022200.jpg';
const BG_IMG = 'https://cdn.poehali.dev/projects/dc25b253-70be-4403-8236-7e436e54997b/files/2216d4dd-16e0-4d38-a8b7-11b76380503a.jpg';

interface Particle {
  id: number;
  x: number;
  y: number;
  emoji: string;
}

interface FloatText {
  id: number;
  x: number;
  y: number;
  text: string;
}

export default function Index() {
  const [state, setState] = useState<GameState>(() => loadGameState());
  const [tab, setTab] = useState<Tab>('home');
  const [particles, setParticles] = useState<Particle[]>([]);
  const [floatTexts, setFloatTexts] = useState<FloatText[]>([]);
  const [treeShake, setTreeShake] = useState(false);
  const [offlineModal, setOfflineModal] = useState<number | null>(null);
  const [newAchievement, setNewAchievement] = useState<string | null>(null);
  const particleId = useRef(0);
  const saveTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const loaded = loadGameState() as GameState & { offlineBonus?: number };
    setState(loaded);
    const bonus = (loaded as GameState & { offlineBonus?: number }).offlineBonus;
    if (bonus && bonus > 0) {
      setOfflineModal(bonus);
    }
  }, []);

  useEffect(() => {
    tickTimer.current = setInterval(() => {
      setState(prev => {
        const earned = prev.leavesPerSecond / 10;
        return {
          ...prev,
          leaves: prev.leaves + earned,
          totalLeavesEarned: prev.totalLeavesEarned + earned,
        };
      });
    }, 100);
    saveTimer.current = setInterval(() => {
      setState(prev => {
        saveGameState(prev);
        return prev;
      });
    }, 5000);
    return () => {
      if (tickTimer.current) clearInterval(tickTimer.current);
      if (saveTimer.current) clearInterval(saveTimer.current);
    };
  }, []);

  useEffect(() => {
    setState(prev => {
      const newUnlocked: string[] = [];
      const achievements = prev.achievements.map(a => {
        if (!a.unlocked && a.condition(prev)) {
          newUnlocked.push(a.id);
          return { ...a, unlocked: true };
        }
        return a;
      });
      if (newUnlocked.length > 0) {
        const last = achievements.find(a => newUnlocked.includes(a.id));
        if (last) setNewAchievement(`${last.emoji} ${last.name}`);
        return {
          ...prev,
          achievements,
          unlockedAchievements: [...prev.unlockedAchievements, ...newUnlocked],
        };
      }
      return prev;
    });
  }, [Math.floor(state.totalLeavesEarned / 10), state.totalClicks]);

  useEffect(() => {
    if (newAchievement) {
      const t = setTimeout(() => setNewAchievement(null), 3000);
      return () => clearTimeout(t);
    }
  }, [newAchievement]);

  const spawnParticles = useCallback((x: number, y: number) => {
    const emojis = ['🍃', '🍂', '🌿', '✨', '💚'];
    const newParticles = Array.from({ length: 4 }, (_, _i) => ({
      id: ++particleId.current,
      x: x + (Math.random() - 0.5) * 60,
      y: y + (Math.random() - 0.5) * 30,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
    }));
    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(n => n.id === p.id)));
    }, 1000);
  }, []);

  const spawnFloatText = useCallback((x: number, y: number, text: string) => {
    const ft = { id: ++particleId.current, x, y, text };
    setFloatTexts(prev => [...prev, ft]);
    setTimeout(() => {
      setFloatTexts(prev => prev.filter(f => f.id !== ft.id));
    }, 1000);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const cx = e.clientX;
    const cy = e.clientY;
    spawnParticles(cx, cy);
    spawnFloatText(cx, cy - 20, `+${formatLeaves(state.leavesPerClick)} 🍃`);
    setTreeShake(true);
    setTimeout(() => setTreeShake(false), 400);
    setState(prev => ({
      ...prev,
      leaves: prev.leaves + prev.leavesPerClick,
      totalLeavesEarned: prev.totalLeavesEarned + prev.leavesPerClick,
      totalClicks: prev.totalClicks + 1,
    }));
  }, [state.leavesPerClick, spawnParticles, spawnFloatText]);

  const handleBuy = useCallback((itemId: string) => {
    setState(prev => {
      const item = prev.shopItems.find(i => i.id === itemId);
      if (!item) return prev;
      const price = getItemPrice(item);
      if (prev.leaves < price) return prev;
      const shopItems = prev.shopItems.map(i =>
        i.id === itemId ? { ...i, owned: i.owned + 1 } : i
      );
      const lps = shopItems.reduce((acc, i) => acc + i.leafPerSecond * i.owned, 0);
      const lpc = 1 + shopItems.reduce((acc, i) => acc + i.leafPerClick * i.owned, 0);
      return { ...prev, leaves: prev.leaves - price, shopItems, leavesPerSecond: lps, leavesPerClick: lpc };
    });
  }, []);

  const tabs: { id: Tab; emoji: string; label: string }[] = [
    { id: 'home', emoji: '🌳', label: 'Главная' },
    { id: 'achievements', emoji: '🏆', label: 'Награды' },
    { id: 'shop', emoji: '🛒', label: 'Магазин' },
    { id: 'inventory', emoji: '🎒', label: 'Вещи' },
    { id: 'settings', emoji: '⚙️', label: 'Меню' },
  ];

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto relative overflow-hidden" style={{ background: '#E8F5E9' }}>
      {/* Particles */}
      {particles.map(p => (
        <div
          key={p.id}
          className="leaf-particle"
          style={{ left: p.x, top: p.y }}
        >
          {p.emoji}
        </div>
      ))}
      {floatTexts.map(f => (
        <div
          key={f.id}
          className="animate-float-up fixed pointer-events-none z-[9998] font-bold text-green-700 text-sm"
          style={{ left: f.x - 30, top: f.y, fontFamily: 'Nunito, sans-serif', textShadow: '0 1px 4px rgba(255,255,255,0.9)' }}
        >
          {f.text}
        </div>
      ))}

      {/* Achievement Toast */}
      {newAchievement && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] animate-pop-in">
          <div className="bg-yellow-400 text-yellow-900 px-5 py-3 rounded-2xl font-bold text-sm shadow-xl card-cartoon font-ui">
            🎉 Достижение: {newAchievement}
          </div>
        </div>
      )}

      {/* Offline Modal */}
      {offlineModal !== null && offlineModal > 0 && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-3xl p-8 m-4 text-center card-cartoon animate-pop-in max-w-xs w-full">
            <div className="text-5xl mb-3">💤</div>
            <h2 className="font-game text-2xl text-green-700 mb-2">Пока ты спал...</h2>
            <p className="text-gray-600 mb-4 font-ui text-sm">Зверушки не дремали и собрали для тебя:</p>
            <div className="bg-green-50 rounded-2xl p-4 mb-5 border-2 border-green-200">
              <span className="text-3xl font-black text-green-600 font-ui">+{formatLeaves(offlineModal)} 🍃</span>
            </div>
            <button
              onClick={() => setOfflineModal(null)}
              className="w-full bg-green-500 text-white font-bold py-3 rounded-2xl btn-cartoon text-lg font-ui"
            >
              Забрать! 🎉
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-green-600 text-white px-4 pt-4 pb-3 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="font-game text-2xl text-white drop-shadow-sm">Листоград</h1>
            <p className="text-green-200 text-xs font-ui font-semibold">🌿 лесной кликер</p>
          </div>
          <div className="text-right">
            <div className="bg-white/20 rounded-2xl px-4 py-2 backdrop-blur-sm">
              <div className="text-2xl font-black font-ui text-white">{formatLeaves(state.leaves)} 🍃</div>
              {state.leavesPerSecond > 0 && (
                <div className="text-green-200 text-xs font-ui">+{formatLeaves(state.leavesPerSecond)}/сек</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        {tab === 'home' && (
          <HomeTab
            state={state}
            treeShake={treeShake}
            onTreeClick={handleClick}
          />
        )}
        {tab === 'achievements' && <AchievementsTab state={state} />}
        {tab === 'shop' && <ShopTab state={state} onBuy={handleBuy} />}
        {tab === 'inventory' && <InventoryTab state={state} />}
        {tab === 'settings' && <SettingsTab state={state} setState={setState} />}
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t-2 border-green-200 px-2 py-2 shadow-xl">
        <div className="flex justify-around">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`nav-tab flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-2xl transition-all ${
                tab === t.id ? 'active bg-green-100 text-green-700' : 'text-gray-400'
              }`}
            >
              <span className="text-xl">{t.emoji}</span>
              <span className="text-[10px] font-bold font-ui">{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function HomeTab({ state, treeShake, onTreeClick }: {
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

      <div className="flex flex-col items-center -mt-16 pb-4 px-4">
        <div
          onClick={onTreeClick}
          className={`tree-btn relative cursor-pointer select-none ${treeShake ? 'animate-tree-shake' : ''}`}
          style={{ width: 150, height: 150 }}
        >
          <img
            src={SQUIRREL_IMG}
            alt="Белочка"
            className="w-full h-full object-contain rounded-full border-4 border-white shadow-xl"
            style={{ background: 'radial-gradient(circle, #E8F5E9, #C8E6C9)' }}
          />
          <div className="absolute -bottom-1 -right-1 bg-yellow-400 rounded-full w-9 h-9 flex items-center justify-center text-lg border-2 border-white shadow">
            🍃
          </div>
        </div>

        <p className="text-green-600 font-bold text-sm mt-3 mb-1 font-ui">Нажми на белочку!</p>
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

function AchievementsTab({ state }: { state: GameState }) {
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

function ShopTab({ state, onBuy }: { state: GameState; onBuy: (id: string) => void }) {
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

function InventoryTab({ state }: { state: GameState }) {
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

function SettingsTab({ state, setState }: {
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