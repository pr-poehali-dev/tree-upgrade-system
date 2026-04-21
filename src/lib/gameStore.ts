export interface ShopItem {
  id: string;
  name: string;
  emoji: string;
  description: string;
  price: number;
  leafPerSecond: number;
  leafPerClick: number;
  owned: number;
  maxOwned?: number;
}

export interface Achievement {
  id: string;
  name: string;
  emoji: string;
  description: string;
  unlocked: boolean;
  condition: (state: GameState) => boolean;
}

export interface InventoryItem {
  id: string;
  name: string;
  emoji: string;
  description: string;
  quantity: number;
  effect: string;
}

export interface GameState {
  leaves: number;
  totalLeavesEarned: number;
  leavesPerClick: number;
  leavesPerSecond: number;
  totalClicks: number;
  lastSaveTime: number;
  shopItems: ShopItem[];
  achievements: Achievement[];
  inventory: InventoryItem[];
  unlockedAchievements: string[];
  settings: {
    sound: boolean;
    animations: boolean;
    notifications: boolean;
  };
}

const DEFAULT_SHOP_ITEMS: ShopItem[] = [
  {
    id: 'mushroom',
    name: 'Гриб-помощник',
    emoji: '🍄',
    description: 'Маленький грибок собирает листики сам',
    price: 10,
    leafPerSecond: 0.1,
    leafPerClick: 0,
    owned: 0,
  },
  {
    id: 'hedgehog',
    name: 'Ёжик-сборщик',
    emoji: '🦔',
    description: 'Шустрый ёжик носит листики на иголках',
    price: 75,
    leafPerSecond: 0.5,
    leafPerClick: 1,
    owned: 0,
  },
  {
    id: 'beaver',
    name: 'Бобёр-строитель',
    emoji: '🦫',
    description: 'Бобёр строит листосборник',
    price: 250,
    leafPerSecond: 2,
    leafPerClick: 0,
    owned: 0,
  },
  {
    id: 'owl',
    name: 'Сова-мудрец',
    emoji: '🦉',
    description: 'Мудрая сова знает секреты леса',
    price: 800,
    leafPerSecond: 6,
    leafPerClick: 2,
    owned: 0,
  },
  {
    id: 'fox',
    name: 'Лисичка-хитрюшка',
    emoji: '🦊',
    description: 'Хитрая лиса находит редкие листья',
    price: 2500,
    leafPerSecond: 15,
    leafPerClick: 5,
    owned: 0,
  },
  {
    id: 'bear',
    name: 'Медведь-лесник',
    emoji: '🐻',
    description: 'Хозяин леса командует всеми зверями',
    price: 8000,
    leafPerSecond: 40,
    leafPerClick: 10,
    owned: 0,
  },
  {
    id: 'dragon',
    name: 'Дракончик листовой',
    emoji: '🐲',
    description: 'Волшебный дракон выдыхает листики',
    price: 25000,
    leafPerSecond: 120,
    leafPerClick: 30,
    owned: 0,
  },
];

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_leaf',
    name: 'Первый листик',
    emoji: '🍃',
    description: 'Собери первый листик',
    unlocked: false,
    condition: (s) => s.totalLeavesEarned >= 1,
  },
  {
    id: 'hundred_leaves',
    name: 'Сотня листиков',
    emoji: '🌿',
    description: 'Собери 100 листиков',
    unlocked: false,
    condition: (s) => s.totalLeavesEarned >= 100,
  },
  {
    id: 'thousand_leaves',
    name: 'Тысячелист',
    emoji: '🌳',
    description: 'Собери 1000 листиков',
    unlocked: false,
    condition: (s) => s.totalLeavesEarned >= 1000,
  },
  {
    id: 'first_buy',
    name: 'Первая покупка',
    emoji: '🛒',
    description: 'Купи первого помощника',
    unlocked: false,
    condition: (s) => s.shopItems.some(i => i.owned > 0),
  },
  {
    id: 'click_50',
    name: 'Кликер',
    emoji: '👆',
    description: 'Кликни 50 раз',
    unlocked: false,
    condition: (s) => s.totalClicks >= 50,
  },
  {
    id: 'click_500',
    name: 'Мастер-кликер',
    emoji: '⚡',
    description: 'Кликни 500 раз',
    unlocked: false,
    condition: (s) => s.totalClicks >= 500,
  },
  {
    id: 'offline_bonus',
    name: 'Трудяга',
    emoji: '💤',
    description: 'Получи оффлайн-бонус',
    unlocked: false,
    condition: (s) => s.inventory.some(i => i.id === 'offline_leaves' && i.quantity > 0),
  },
  {
    id: 'millionaire',
    name: 'Миллионер леса',
    emoji: '💰',
    description: 'Собери 1 000 000 листиков',
    unlocked: false,
    condition: (s) => s.totalLeavesEarned >= 1_000_000,
  },
];

const DEFAULT_INVENTORY: InventoryItem[] = [
  {
    id: 'golden_leaf',
    name: 'Золотой листик',
    emoji: '🌟',
    description: 'Редкий листик из волшебного дерева',
    quantity: 0,
    effect: 'x2 листика на 60 сек',
  },
  {
    id: 'mushroom_potion',
    name: 'Грибное зелье',
    emoji: '🧪',
    description: 'Волшебное зелье из лесных грибов',
    quantity: 0,
    effect: '+50 листиков мгновенно',
  },
  {
    id: 'acorn',
    name: 'Заколдованный жёлудь',
    emoji: '🌰',
    description: 'Жёлудь, несущий удачу',
    quantity: 0,
    effect: '+10% к скорости навсегда',
  },
];

const SAVE_KEY = 'leafgrad_save_v1';

export function loadGameState(): GameState {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return createDefaultState();
    const saved = JSON.parse(raw) as Partial<GameState>;

    const shopItems = DEFAULT_SHOP_ITEMS.map(def => {
      const found = saved.shopItems?.find(s => s.id === def.id);
      return found ? { ...def, owned: found.owned } : def;
    });

    const lps = shopItems.reduce((acc, item) => acc + item.leafPerSecond * item.owned, 0);
    const lpc = 1 + shopItems.reduce((acc, item) => acc + item.leafPerClick * item.owned, 0);

    const lastSaveTime = saved.lastSaveTime || Date.now();
    const offlineSeconds = Math.min((Date.now() - lastSaveTime) / 1000, 8 * 3600);
    const offlineLeaves = Math.floor(offlineSeconds * lps);

    const inventory = DEFAULT_INVENTORY.map(def => {
      const found = saved.inventory?.find(i => i.id === def.id);
      return found ? { ...def, quantity: found.quantity } : def;
    });

    const unlockedAchievements = saved.unlockedAchievements || [];
    const achievements = DEFAULT_ACHIEVEMENTS.map(a => ({
      ...a,
      unlocked: unlockedAchievements.includes(a.id),
    }));

    return {
      leaves: (saved.leaves || 0) + offlineLeaves,
      totalLeavesEarned: (saved.totalLeavesEarned || 0) + offlineLeaves,
      leavesPerClick: lpc,
      leavesPerSecond: lps,
      totalClicks: saved.totalClicks || 0,
      lastSaveTime: Date.now(),
      shopItems,
      achievements,
      inventory,
      unlockedAchievements,
      settings: saved.settings || { sound: true, animations: true, notifications: true },
      offlineBonus: offlineLeaves > 0 ? offlineLeaves : undefined,
    } as GameState & { offlineBonus?: number };
  } catch {
    return createDefaultState();
  }
}

function createDefaultState(): GameState {
  return {
    leaves: 0,
    totalLeavesEarned: 0,
    leavesPerClick: 1,
    leavesPerSecond: 0,
    totalClicks: 0,
    lastSaveTime: Date.now(),
    shopItems: DEFAULT_SHOP_ITEMS,
    achievements: DEFAULT_ACHIEVEMENTS,
    inventory: DEFAULT_INVENTORY,
    unlockedAchievements: [],
    settings: { sound: true, animations: true, notifications: true },
  };
}

export function saveGameState(state: GameState): void {
  try {
    const toSave = {
      leaves: state.leaves,
      totalLeavesEarned: state.totalLeavesEarned,
      totalClicks: state.totalClicks,
      lastSaveTime: Date.now(),
      shopItems: state.shopItems.map(i => ({ id: i.id, owned: i.owned })),
      inventory: state.inventory.map(i => ({ id: i.id, quantity: i.quantity })),
      unlockedAchievements: state.unlockedAchievements,
      settings: state.settings,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(toSave));
  } catch (e) {
    console.warn('Save failed', e);
  }
}

export function formatLeaves(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return Math.floor(n).toString();
}

export function getItemPrice(item: ShopItem): number {
  return Math.ceil(item.price * Math.pow(1.15, item.owned));
}