import { FaCrown, FaMedal, FaTrophy } from "react-icons/fa";
import useGameLeaderboard, {
  isSinglePlayerLeaderboardEntry,
} from "../../../hooks/useGameLeaderboard";

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
    <section className="mt-6 rounded-2xl border border-white/15 bg-black/30 p-4 backdrop-blur-sm md:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-black uppercase tracking-wide text-white/80">
          {title}
        </h3>
        <span className="text-xs text-white/50">Top {visibleEntries.length || 0}</span>
      </div>

      {loading ? (
        <p className="text-xs text-white/60">Leaderboard yuklanmoqda...</p>
      ) : visibleEntries.length === 0 ? (
        <p className="text-xs text-white/60">
          Hozircha natijalar yo'q. Birinchi bo'lib rekord o'rnating.
        </p>
      ) : (
        <div className="space-y-3">
          <div className="grid gap-3 md:grid-cols-3">
            {visibleTopThree.map((entry, index) => (
              <div
                key={entry.id}
                className={`rounded-2xl border bg-gradient-to-br ${rankBadgeClass(index)} p-4`}
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-lg">
                    {rankIcon(index)}
                  </div>
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-white/55">
                    {index + 1}-o'rin
                  </span>
                </div>
                <p className="truncate text-base font-black text-white">
                  {entry.participant_name}
                </p>
                <p className="mt-1 text-[11px] text-white/45">
                  {entry.participant_mode}
                </p>
                <p className="mt-4 text-xl font-black text-yellow-300">
                  {entry.score}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-2">
            <div className="mb-2 flex items-center justify-between gap-3 px-2 pt-1">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/45">
                Barcha natijalar
              </p>
              <p className="text-[11px] text-white/45">
                Scroll qilib ko'ring
              </p>
            </div>

            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {visibleEntries.map((entry, index) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5">
                      {rankIcon(index)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">
                        {entry.participant_name}
                      </p>
                      <p className="text-[11px] text-white/45">
                        {entry.participant_mode}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-black text-yellow-300">
                    {entry.score}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
