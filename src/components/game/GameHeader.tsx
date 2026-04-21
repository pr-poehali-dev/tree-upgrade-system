import { formatLeaves } from '@/lib/gameStore';
import type { GameState } from '@/lib/gameStore';

interface GameHeaderProps {
  state: GameState;
}

export default function GameHeader({ state }: GameHeaderProps) {
  return (
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
  );
}
