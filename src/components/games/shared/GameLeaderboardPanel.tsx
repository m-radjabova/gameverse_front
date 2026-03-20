import { FaCrown, FaMedal, FaTrophy } from "react-icons/fa";
import useGameLeaderboard, {
  isSinglePlayerLeaderboardEntry,
} from "../../../hooks/useGameLeaderboard";
import { HiSparkles } from "react-icons/hi";

type Props = {
  gameKey: string;
  title?: string;
  limit?: number;
  singlePlayerOnly?: boolean;
};

function rankIcon(rank: number) {
  if (rank === 0) return <FaCrown className="text-yellow-300" />;
  if (rank === 1) return <FaTrophy className="text-slate-200" />;
  if (rank === 2) return <FaMedal className="text-amber-500" />;
  return <span className="text-xs font-black text-white/50">#{rank + 1}</span>;
}

function rankBadgeClass(rank: number) {
  if (rank === 0) return "from-yellow-400/30 to-orange-500/30 border-yellow-400/30";
  if (rank === 1) return "from-slate-200/20 to-slate-400/20 border-slate-200/30";
  return "from-amber-500/20 to-yellow-700/20 border-amber-500/30";
}

function topCardAccent(rank: number) {
  if (rank === 0) return "from-yellow-300/25 via-amber-300/10 to-transparent";
  if (rank === 1) return "from-slate-100/20 via-white/5 to-transparent";
  return "from-orange-300/20 via-amber-300/10 to-transparent";
}

function LeaderboardSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid gap-3 xl:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/[0.06] p-4"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="h-11 w-11 rounded-2xl bg-white/10" />
              <div className="h-3 w-20 rounded-full bg-white/10" />
            </div>
            <div className="h-5 w-2/3 rounded-full bg-white/10" />
            <div className="mt-2 h-3 w-20 rounded-full bg-white/10" />
            <div className="mt-6 h-7 w-16 rounded-full bg-white/10" />
          </div>
        ))}
      </div>

      <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.05] p-3">
        <div className="mb-3 flex items-center justify-between px-2">
          <div className="h-3 w-28 rounded-full bg-white/10" />
          <div className="h-3 w-24 rounded-full bg-white/10" />
        </div>

        <div className="space-y-2">
          {[0, 1, 2, 3].map((item) => (
            <div
              key={item}
              className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/15 px-3 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-white/10" />
                <div>
                  <div className="h-4 w-36 rounded-full bg-white/10" />
                  <div className="mt-2 h-3 w-16 rounded-full bg-white/10" />
                </div>
              </div>
              <div className="h-5 w-10 rounded-full bg-white/10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function GameLeaderboardPanel({
  gameKey,
  title = "Leaderboard",
  limit = 100,
  singlePlayerOnly = true,
}: Props) {
  const { entries, loading } = useGameLeaderboard(gameKey, limit);
  const visibleEntries = singlePlayerOnly
    ? entries.filter(isSinglePlayerLeaderboardEntry)
    : entries;
  const visibleTopThree = visibleEntries.slice(0, 3);

  return (
    <section className="mt-6 overflow-hidden rounded-[2rem] border border-white/12 bg-[linear-gradient(160deg,rgba(15,10,22,0.72),rgba(31,16,12,0.55))] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.22)] backdrop-blur-sm md:p-5">
      <div className="absolute" />

      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-amber-300">
              <HiSparkles className="text-sm" />
            </span>
            <div>
              <h3 className="text-base font-black uppercase tracking-[0.08em] text-white/90">
                {title}
              </h3>
              <p className="mt-1 text-xs text-white/45">
                Eng yuqori natijalar real vaqtga yaqin ko'rinishda
              </p>
            </div>
          </div>
        </div>
        <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs font-bold text-white/60">
          Top {visibleEntries.length || 0}
        </span>
      </div>

      {loading ? (
        <LeaderboardSkeleton />
      ) : visibleEntries.length === 0 ? (
        <div className="rounded-[1.6rem] border border-dashed border-white/12 bg-white/[0.04] px-5 py-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white/8 text-amber-300">
            <FaTrophy className="text-2xl" />
          </div>
          <p className="mt-4 text-sm font-bold text-white/85">
            Hozircha natijalar yo'q
          </p>
          <p className="mt-2 text-xs text-white/50">
            Birinchi bo'lib rekord o'rnating va reytingni boshlab bering.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid gap-3 xl:grid-cols-3">
            {visibleTopThree.map((entry, index) => (
              <div
                key={entry.id}
                className={`relative overflow-hidden rounded-[1.7rem] border bg-gradient-to-br ${rankBadgeClass(index)} p-4 shadow-[0_16px_40px_rgba(0,0,0,0.15)]`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${topCardAccent(index)}`} />
                <div className="absolute right-3 top-3 h-16 w-16 rounded-full bg-white/6 blur-2xl" />

                <div className="relative mb-3 flex items-center justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/15 text-lg">
                    {rankIcon(index)}
                  </div>
                  <span className="rounded-full bg-black/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-white/60">
                    {index + 1}-o'rin
                  </span>
                </div>

                <div className="relative">
                  <p className="truncate text-lg font-black text-white">
                    {entry.participant_name}
                  </p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-white/45">
                    {entry.participant_mode}
                  </p>
                </div>

                <div className="relative mt-5 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">
                      Score
                    </p>
                    <p className="mt-1 text-3xl font-black text-yellow-300">
                      {entry.score}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/8 px-3 py-2 text-right">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                      Rank
                    </p>
                    <p className="text-sm font-black text-white/85">#{index + 1}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.05] p-3">
            <div className="mb-3 flex items-center justify-between gap-3 px-2 pt-1">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-white/45">
                  Barcha natijalar
                </p>
                <p className="mt-1 text-[11px] text-white/40">
                  To'liq leaderboard ro'yxati
                </p>
              </div>
              <p className="rounded-full border border-white/10 bg-black/10 px-3 py-1 text-[11px] text-white/45">
                Scroll qilib ko'ring
              </p>
            </div>

            <div className="wheel-leaderboard-scroll max-h-72 space-y-2 overflow-y-auto pr-1">
              {visibleEntries.map((entry, index) => (
                <div
                  key={entry.id}
                  className="group flex items-center justify-between rounded-2xl border border-white/8 bg-[linear-gradient(90deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] px-3 py-3 transition-all hover:border-white/15 hover:bg-[linear-gradient(90deg,rgba(255,255,255,0.09),rgba(255,255,255,0.04))]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/15">
                      {rankIcon(index)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">
                        {entry.participant_name}
                      </p>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">
                        {entry.participant_mode}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">
                      Ball
                    </p>
                    <p className="text-xl font-black text-yellow-300">
                      {entry.score}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
