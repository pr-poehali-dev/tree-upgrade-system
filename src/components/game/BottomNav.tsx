type Tab = 'home' | 'achievements' | 'shop' | 'inventory' | 'settings';

interface BottomNavProps {
  tab: Tab;
  onTabChange: (tab: Tab) => void;
}

const TABS: { id: Tab; emoji: string; label: string }[] = [
  { id: 'home', emoji: '🌳', label: 'Главная' },
  { id: 'achievements', emoji: '🏆', label: 'Награды' },
  { id: 'shop', emoji: '🛒', label: 'Магазин' },
  { id: 'inventory', emoji: '🎒', label: 'Вещи' },
  { id: 'settings', emoji: '⚙️', label: 'Меню' },
];

export default function BottomNav({ tab, onTabChange }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t-2 border-green-200 px-2 py-2 shadow-xl">
      <div className="flex justify-around">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => onTabChange(t.id)}
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
  );
}

export type { Tab };
