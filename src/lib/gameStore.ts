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
    id: 'snail',
    name: 'Улитка-тихоня',
    emoji: '🐌',
    description: 'Медленно, но верно тащит листики',
    price: 40,
    leafPerSecond: 0.3,
    leafPerClick: 0,
    owned: 0,
  },
  {
    id: 'hedgehog',
    name: 'Ёжик-сборщик',
    emoji: '🦔',
    description: 'Шустрый ёжик носит листики на иголках',
    price: 120,
    leafPerSecond: 0.8,
    leafPerClick: 1,
    owned: 0,
  },
  {
    id: 'rabbit',
    name: 'Зайчик-прыгун',
    emoji: '🐇',
    description: 'Прыгает по полянке и собирает листья',
    price: 350,
    leafPerSecond: 2,
    leafPerClick: 1,
    owned: 0,
  },
  {
    id: 'beaver',
    name: 'Бобёр-строитель',
    emoji: '🦫',
    description: 'Бобёр строит листосборник',
    price: 900,
    leafPerSecond: 5,
    leafPerClick: 0,
    owned: 0,
  },
  {
    id: 'frog',
    name: 'Лягушка-квакушка',
    emoji: '🐸',
    description: 'Ловит листики прямо на лету',
    price: 2200,
    leafPerSecond: 10,
    leafPerClick: 2,
    owned: 0,
  },
  {
    id: 'owl',
    name: 'Сова-мудрец',
    emoji: '🦉',
    description: 'Мудрая сова знает секреты леса',
    price: 5000,
    leafPerSecond: 20,
    leafPerClick: 4,
    owned: 0,
  },
  {
    id: 'fox',
    name: 'Лисичка-хитрюшка',
    emoji: '🦊',
    description: 'Хитрая лиса находит редкие листья',
    price: 12000,
    leafPerSecond: 45,
    leafPerClick: 8,
    owned: 0,
  },
  {
    id: 'deer',
    name: 'Олень-великан',
    emoji: '🦌',
    description: 'Трясёт рогами — листья сыплются градом',
    price: 30000,
    leafPerSecond: 100,
    leafPerClick: 15,
    owned: 0,
  },
  {
    id: 'bear',
    name: 'Медведь-лесник',
    emoji: '🐻',
    description: 'Хозяин леса командует всеми зверями',
    price: 80000,
    leafPerSecond: 250,
    leafPerClick: 25,
    owned: 0,
  },
  {
    id: 'wolf',
    name: 'Волк-вожак',
    emoji: '🐺',
    description: 'Организует всю стаю на сбор листьев',
    price: 200000,
    leafPerSecond: 600,
    leafPerClick: 50,
    owned: 0,
  },
  {
    id: 'dragon',
    name: 'Дракончик листовой',
    emoji: '🐲',
    description: 'Волшебный дракон выдыхает листики',
    price: 500000,
    leafPerSecond: 1500,
    leafPerClick: 100,
    owned: 0,
  },
  {
    id: 'phoenix',
    name: 'Феникс лесной',
    emoji: '🦅',
    description: 'Возрождается и приносит горы листьев',
    price: 2000000,
    leafPerSecond: 5000,
    leafPerClick: 300,
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
    id: 'fifty_leaves',
    name: 'Пригоршня листьев',
    emoji: '🤲',
    description: 'Собери 50 листиков',
    unlocked: false,
    condition: (s) => s.totalLeavesEarned >= 50,
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
    description: 'Собери 1 000 листиков',
    unlocked: false,
    condition: (s) => s.totalLeavesEarned >= 1000,
  },
  {
    id: 'ten_thousand_leaves',
    name: 'Лесной богач',
    emoji: '🪙',
    description: 'Собери 10 000 листиков',
    unlocked: false,
    condition: (s) => s.totalLeavesEarned >= 10_000,
  },
  {
    id: 'hundred_thousand_leaves',
    name: 'Хранитель леса',
    emoji: '🏕️',
    description: 'Собери 100 000 листиков',
    unlocked: false,
    condition: (s) => s.totalLeavesEarned >= 100_000,
  },
  {
    id: 'millionaire',
    name: 'Миллионер леса',
    emoji: '💰',
    description: 'Собери 1 000 000 листиков',
    unlocked: false,
    condition: (s) => s.totalLeavesEarned >= 1_000_000,
  },
  {
    id: 'billionaire',
    name: 'Лесной магнат',
    emoji: '👑',
    description: 'Собери 1 000 000 000 листиков',
    unlocked: false,
    condition: (s) => s.totalLeavesEarned >= 1_000_000_000,
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
    id: 'three_helpers',
    name: 'Бригада',
    emoji: '👥',
    description: 'Купи 3 разных помощника',
    unlocked: false,
    condition: (s) => s.shopItems.filter(i => i.owned > 0).length >= 3,
  },
  {
    id: 'five_helpers',
    name: 'Лесная артель',
    emoji: '🏘️',
    description: 'Купи 5 разных помощников',
    unlocked: false,
    condition: (s) => s.shopItems.filter(i => i.owned > 0).length >= 5,
  },
  {
    id: 'ten_of_one',
    name: 'Десяток',
    emoji: '🔟',
    description: 'Купи 10 одного помощника',
    unlocked: false,
    condition: (s) => s.shopItems.some(i => i.owned >= 10),
  },
  {
    id: 'click_10',
    name: 'Первые шаги',
    emoji: '🌱',
    description: 'Кликни 10 раз',
    unlocked: false,
    condition: (s) => s.totalClicks >= 10,
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
    id: 'click_5000',
    name: 'Неутомимый',
    emoji: '🔥',
    description: 'Кликни 5 000 раз',
    unlocked: false,
    condition: (s) => s.totalClicks >= 5000,
  },
  {
    id: 'lps_1',
    name: 'Лесная фабрика',
    emoji: '⚙️',
    description: 'Достигни 1 листик/сек',
    unlocked: false,
    condition: (s) => s.leavesPerSecond >= 1,
  },
  {
    id: 'lps_100',
    name: 'Поток листьев',
    emoji: '🌊',
    description: 'Достигни 100 листиков/сек',
    unlocked: false,
    condition: (s) => s.leavesPerSecond >= 100,
  },
  {
    id: 'lps_1000',
    name: 'Листяной торнадо',
    emoji: '🌪️',
    description: 'Достигни 1 000 листиков/сек',
    unlocked: false,
    condition: (s) => s.leavesPerSecond >= 1000,
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
    id: 'lpc_10',
    name: 'Золотые руки',
    emoji: '✋',
    description: 'Получай 10 листиков за клик',
    unlocked: false,
    condition: (s) => s.leavesPerClick >= 10,
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