type HUDProps = {
  totalCountries: number;
  completedCount: number;
  score: number;
  levelLabel: string;
  badgeLabel: string;
};

export default function HUD({
  totalCountries,
  completedCount,
  score,
  levelLabel,
  badgeLabel,
}: HUDProps) {
  const progress = Math.round((completedCount / Math.max(totalCountries, 1)) * 100);

  return (
    <div className="absolute left-4 top-4 z-20 flex w-[min(92vw,440px)] flex-col gap-3 md:left-6 md:top-6">
      <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(3,7,18,0.88),rgba(5,10,24,0.82))] p-6 text-slate-100 shadow-[0_24px_80px_rgba(15,23,42,0.38)] backdrop-blur-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-cyan-200/80">
          Virtual Dunyo Sayohati
        </p>
        <h1 className="mt-4 max-w-[12ch] text-4xl font-semibold leading-[1.12] tracking-tight text-white md:text-[3.15rem]">
          Dunyoni o'rganing va ma'lumot to'plang
        </h1>
        <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
          Davlat nuqtasini tanlang, batafsil ma'lumotlarni o'qing va yangi badge oching.
        </p>

        <div className="mt-6 rounded-[22px] border border-white/8 bg-white/5 p-4">
          <div className="mb-3 flex items-center justify-between text-sm text-slate-300">
            <span>O'rganilgan davlatlar</span>
            <span className="font-semibold text-slate-100">{completedCount}/{totalCountries}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/8">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-[24px] border border-white/10 bg-white/7 p-5 text-slate-100 shadow-[0_18px_48px_rgba(15,23,42,0.24)] backdrop-blur-xl">
          <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Ball</p>
          <p className="mt-3 text-4xl font-semibold">{score}</p>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-white/7 p-5 text-slate-100 shadow-[0_18px_48px_rgba(15,23,42,0.24)] backdrop-blur-xl">
          <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Kashfiyotlar</p>
          <p className="mt-3 text-4xl font-semibold">{completedCount}</p>
        </div>

        <div className="rounded-[24px] border border-cyan-300/15 bg-cyan-300/8 p-5 text-slate-100 shadow-[0_18px_48px_rgba(15,23,42,0.22)] backdrop-blur-xl">
          <p className="text-[11px] uppercase tracking-[0.3em] text-cyan-100/70">Level</p>
          <p className="mt-3 text-2xl font-semibold">{levelLabel}</p>
        </div>
        <div className="rounded-[24px] border border-amber-300/15 bg-amber-300/8 p-5 text-slate-100 shadow-[0_18px_48px_rgba(15,23,42,0.22)] backdrop-blur-xl">
          <p className="text-[11px] uppercase tracking-[0.3em] text-amber-100/70">Badge</p>
          <p className="mt-3 text-2xl font-semibold leading-tight">{badgeLabel}</p>
        </div>
      </div>
    </div>
  );
}
