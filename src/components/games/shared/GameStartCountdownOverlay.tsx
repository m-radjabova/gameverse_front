type CountdownValue = 3 | 2 | 1 | "BOSHLANDI" | null;

type Props = {
  visible: boolean;
  value: CountdownValue;
};

function getPositionClass(value: CountdownValue): string {
  if (value === 3) return "countdown-right";
  if (value === 2) return "countdown-left";
  return "countdown-center";
}

export default function GameStartCountdownOverlay({ visible, value }: Props) {
  if (!visible || value === null) return null;

  const isStarted = value === "BOSHLANDI";
  const positionClass = getPositionClass(value);

  return (
    <div className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-md">
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
        <div className="pointer-events-none absolute bottom-10 flex items-end gap-3 opacity-60 md:gap-6">
          <div className="h-20 w-14 rounded-t-2xl bg-white/10 md:h-24 md:w-16" />
          <div className="h-28 w-16 rounded-t-2xl bg-white/15 md:h-32 md:w-20" />
          <div className="h-16 w-12 rounded-t-2xl bg-white/10 md:h-20 md:w-14" />
        </div>

        {isStarted ? (
          <div className="countdown-card countdown-center rounded-3xl border border-emerald-200/50 bg-emerald-500/20 px-10 py-7 text-center shadow-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-100/80">Boshladik</p>
            <p className="mt-2 text-5xl font-black text-white md:text-6xl">BOSHLANDI!</p>
          </div>
        ) : (
          <div className={`countdown-card ${positionClass} rounded-3xl border border-white/35 bg-black/45 px-10 py-7 text-center shadow-2xl`}>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/70">{value}-o'rin</p>
            <p className="mt-2 text-7xl font-black leading-none text-white md:text-8xl">{value}</p>
          </div>
        )}
      </div>

      <style>{`
        .countdown-card {
          animation: countdown-pop 0.42s ease-out;
        }
        .countdown-left {
          transform: translateX(-28vw);
        }
        .countdown-right {
          transform: translateX(28vw);
        }
        .countdown-center {
          transform: translateX(0);
        }
        @media (max-width: 768px) {
          .countdown-left {
            transform: translateX(-20vw);
          }
          .countdown-right {
            transform: translateX(20vw);
          }
        }
        @keyframes countdown-pop {
          0% {
            opacity: 0;
            filter: blur(3px);
          }
          100% {
            opacity: 1;
            filter: blur(0);
          }
        }
      `}</style>
    </div>
  );
}
