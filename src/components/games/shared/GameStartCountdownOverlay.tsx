type CountdownValue = 3 | 2 | 1 | "BOSHLANDI" | null;

type Props = {
  visible: boolean;
  value: CountdownValue;
};

export default function GameStartCountdownOverlay({ visible, value }: Props) {
  if (!visible || value === null) return null;

  const isStarted = value === "BOSHLANDI";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-md">
      <div className="rounded-3xl border border-white/25 bg-black/45 px-10 py-7 text-center shadow-2xl">
        <p className="text-sm font-bold uppercase tracking-[0.35em] text-white/70">Tayyorlaning</p>
        <p className={`mt-3 font-black text-white ${isStarted ? "text-5xl md:text-6xl" : "text-7xl md:text-8xl"}`}>
          {isStarted ? "BOSHLANDI!" : value}
        </p>
      </div>
    </div>
  );
}
