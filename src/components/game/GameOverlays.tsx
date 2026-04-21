import { formatLeaves } from '@/lib/gameStore';

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

interface GameOverlaysProps {
  particles: Particle[];
  floatTexts: FloatText[];
  newAchievement: string | null;
  offlineModal: number | null;
  onCloseOfflineModal: () => void;
}

export default function GameOverlays({
  particles,
  floatTexts,
  newAchievement,
  offlineModal,
  onCloseOfflineModal,
}: GameOverlaysProps) {
  return (
    <>
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

      {newAchievement && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] animate-pop-in">
          <div className="bg-yellow-400 text-yellow-900 px-5 py-3 rounded-2xl font-bold text-sm shadow-xl card-cartoon font-ui">
            🎉 Достижение: {newAchievement}
          </div>
        </div>
      )}

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
              onClick={onCloseOfflineModal}
              className="w-full bg-green-500 text-white font-bold py-3 rounded-2xl btn-cartoon text-lg font-ui"
            >
              Забрать! 🎉
            </button>
          </div>
        </div>
      )}
    </>
  );
}
