import { useState, useEffect, useCallback, useRef } from 'react';
import { loadGameState, saveGameState, formatLeaves, getItemPrice, type GameState } from '@/lib/gameStore';
import GameOverlays from '@/components/game/GameOverlays';
import GameHeader from '@/components/game/GameHeader';
import BottomNav, { type Tab } from '@/components/game/BottomNav';
import { HomeTab, AchievementsTab, ShopTab, InventoryTab, SettingsTab } from '@/components/game/TabScreens';
import { useGameAudio } from '@/hooks/useGameAudio';

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
  const [secretLeaf, setSecretLeaf] = useState<{ x: number; y: number } | null>(null);
  const particleId = useRef(0);
  const saveTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const { playClick, playBuy, playAchievement, startMusic } = useGameAudio(state.settings.sound);

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
      playAchievement();
      const t = setTimeout(() => setNewAchievement(null), 3000);
      return () => clearTimeout(t);
    }
  }, [newAchievement, playAchievement]);

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
    playClick();
    startMusic();

    if (Math.random() < 0.001) {
      setSecretLeaf({ x: cx, y: cy });
    }

    setState(prev => ({
      ...prev,
      leaves: prev.leaves + prev.leavesPerClick,
      totalLeavesEarned: prev.totalLeavesEarned + prev.leavesPerClick,
      totalClicks: prev.totalClicks + 1,
    }));
  }, [state.leavesPerClick, spawnParticles, spawnFloatText, playClick, startMusic]);

  const handleBuy = useCallback((itemId: string) => {
    setState(prev => {
      const item = prev.shopItems.find(i => i.id === itemId);
      if (!item) return prev;
      const price = getItemPrice(item);
      if (prev.leaves < price) return prev;
      playBuy();
      const shopItems = prev.shopItems.map(i =>
        i.id === itemId ? { ...i, owned: i.owned + 1 } : i
      );
      const lps = shopItems.reduce((acc, i) => acc + i.leafPerSecond * i.owned, 0);
      const lpc = 1 + shopItems.reduce((acc, i) => acc + i.leafPerClick * i.owned, 0);
      return { ...prev, leaves: prev.leaves - price, shopItems, leavesPerSecond: lps, leavesPerClick: lpc };
    });
  }, [playBuy]);

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto relative overflow-hidden" style={{ background: '#E8F5E9' }}>
      <GameOverlays
        particles={particles}
        floatTexts={floatTexts}
        newAchievement={newAchievement}
        offlineModal={offlineModal}
        onCloseOfflineModal={() => setOfflineModal(null)}
        secretLeaf={secretLeaf}
        onCloseSecretLeaf={() => setSecretLeaf(null)}
      />

      <GameHeader state={state} />

      <div className="flex-1 overflow-y-auto pb-20">
        {tab === 'home' && (
          <HomeTab state={state} treeShake={treeShake} onTreeClick={handleClick} />
        )}
        {tab === 'achievements' && <AchievementsTab state={state} />}
        {tab === 'shop' && <ShopTab state={state} onBuy={handleBuy} />}
        {tab === 'inventory' && <InventoryTab state={state} />}
        {tab === 'settings' && <SettingsTab state={state} setState={setState} />}
      </div>

      <BottomNav tab={tab} onTabChange={setTab} />
    </div>
  );
}