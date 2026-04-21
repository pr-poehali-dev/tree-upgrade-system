import { useRef, useEffect } from 'react';
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

const SECRET_MESSAGES = [
  { emoji: '🌟', title: 'Звёздный листик!', text: 'Этот листик упал с самой верхушки дерева. Говорят, он исполняет желания.' },
  { emoji: '🔮', title: 'Магический листик!', text: 'Листик, пропитанный лесным волшебством. Очень редкая находка.' },
  { emoji: '💎', title: 'Кристальный листик!', text: 'Раз в тысячу лет листик превращается в кристалл. Тебе повезло!' },
  { emoji: '🌈', title: 'Радужный листик!', text: 'Листик, окрашенный утренней радугой. Хранит тепло солнца.' },
  { emoji: '🦋', title: 'Листик-бабочка!', text: 'На этом листике жила бабочка. Она оставила частичку своей магии.' },
  { emoji: '🌙', title: 'Лунный листик!', text: 'Этот листик всю ночь купался в лунном свете. Он светится в темноте!' },
  { emoji: '🍀', title: 'Листик удачи!', text: 'Четырёхлистный клевер завидует этому листику. Удача с тобой!' },
  { emoji: '⚡', title: 'Листик-молния!', text: 'В него ударила молния — и он стал особенным навсегда.' },
];

interface GameOverlaysProps {
  particles: Particle[];
  floatTexts: FloatText[];
  newAchievement: string | null;
  offlineModal: number | null;
  onCloseOfflineModal: () => void;
  secretLeaf: { x: number; y: number } | null;
  onCloseSecretLeaf: () => void;
}

export default function GameOverlays({
  particles,
  floatTexts,
  newAchievement,
  offlineModal,
  onCloseOfflineModal,
  secretLeaf,
  onCloseSecretLeaf,
}: GameOverlaysProps) {
  const secretRef = useRef(SECRET_MESSAGES[0]);
  useEffect(() => {
    if (secretLeaf) {
      secretRef.current = SECRET_MESSAGES[Math.floor(Math.random() * SECRET_MESSAGES.length)];
    }
  }, [secretLeaf]);
  const secret = secretRef.current;
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

      {secretLeaf && secret && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-3xl p-8 m-4 text-center card-cartoon animate-pop-in max-w-xs w-full relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 30%, rgba(255,215,0,0.15), transparent 70%)' }} />
            <div className="text-6xl mb-3 animate-bounce">{secret.emoji}</div>
            <div className="inline-block bg-yellow-100 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full mb-3 font-ui border border-yellow-300">
              ✨ РЕДКАЯ НАХОДКА · шанс 0.1%
            </div>
            <h2 className="font-game text-xl text-green-700 mb-3">{secret.title}</h2>
            <p className="text-gray-500 text-sm font-ui mb-6 leading-relaxed">{secret.text}</p>
            <button
              onClick={onCloseSecretLeaf}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-bold py-3 rounded-2xl btn-cartoon text-lg font-ui"
            >
              Забрать! {secret.emoji}
            </button>
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