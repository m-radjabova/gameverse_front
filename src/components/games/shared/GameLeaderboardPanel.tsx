import { FaCrown, FaMedal, FaTrophy } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import useGameLeaderboard, { isSinglePlayerLeaderboardEntry } from "../../../hooks/useGameLeaderboard";

type Props = {
  gameKey: string;
  title?: string;
  limit?: number;
  singlePlayerOnly?: boolean;
};

type LeaderboardEntry = ReturnType<typeof useGameLeaderboard>["entries"][number];

function rankIcon(rank: number) {
  if (rank === 0) return <FaCrown className="text-yellow-300" />;
  if (rank === 1) return <FaTrophy className="text-slate-100" />;
  if (rank === 2) return <FaMedal className="text-amber-400" />;
  return <span className="text-xs font-black text-white/65">#{rank + 1}</span>;
}

function rankTint(rank: number) {
  if (rank === 0) return "from-yellow-400/20 via-amber-400/8 to-transparent";
  if (rank === 1) return "from-slate-100/12 via-white/6 to-transparent";
  if (rank === 2) return "from-amber-300/16 via-orange-400/8 to-transparent";
  return "from-cyan-400/8 via-transparent to-transparent";
}

function cardBorder(rank: number) {
  if (rank === 0) return "border-yellow-400/25";
  if (rank === 1) return "border-slate-200/14";
  if (rank === 2) return "border-amber-300/20";
  return "border-white/10";
}

function tagTone(rank: number) {
  if (rank === 0) return "text-yellow-200 border-yellow-400/20 bg-yellow-400/10";
  if (rank === 1) return "text-slate-100 border-white/10 bg-white/8";
  if (rank === 2) return "text-amber-200 border-amber-400/15 bg-amber-400/10";
  return "text-cyan-100 border-cyan-400/10 bg-cyan-400/8";
}

function placementLabel(rank: number) {
  return `${rank + 1}-o'rin`;
}

function LeaderboardSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/[0.05] p-4"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="h-10 w-10 rounded-2xl bg-white/10" />
              <div className="h-3 w-20 rounded-full bg-white/10" />
            </div>
            <div className="h-5 w-2/3 rounded-full bg-white/10" />
            <div className="mt-2 h-3 w-20 rounded-full bg-white/10" />
            <div className="mt-6 h-8 w-20 rounded-full bg-white/10" />
          </div>
        ))}
      </div>

      <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-4">
        <div className="mb-3 flex items-center justify-between px-1">
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

function PodiumCard({
  entry,
  rank,
}: {
  entry: LeaderboardEntry;
  rank: number;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-[1.7rem] border p-4 shadow-[0_18px_50px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-1 md:p-5 ${cardBorder(rank)}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${rankTint(rank)}`} />
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/8 blur-3xl opacity-60 transition-opacity group-hover:opacity-90" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/15 text-lg shadow-inner shadow-black/20">
            {rankIcon(rank)}
          </div>
          <div className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] ${tagTone(rank)}`}>
            {placementLabel(rank)}
          </div>
        </div>
      </div>

      <div className="relative mt-5">
        <p className="truncate text-lg font-black leading-tight text-white md:text-[1.45rem]">
          {entry.participant_name}
        </p>
        <p className="mt-1 truncate text-[11px] uppercase tracking-[0.24em] text-white/45">
          {entry.participant_mode}
        </p>
      </div>

      <div className="relative mt-6 flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.32em] text-white/38">Score</p>
          <p className="mt-1 font-black leading-none text-yellow-300 md:text-[1.3rem]">
            {entry.score}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/15 px-3 py-2 text-right backdrop-blur-sm">
          <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">Rank</p>
          <p className="text-base font-black text-white/85">#{rank + 1}</p>
        </div>
      </div>
    </div>
  );
}

function ListRow({
  entry,
  rank,
}: {
  entry: LeaderboardEntry;
  rank: number;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/8 bg-[linear-gradient(90deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] px-3 py-3 transition-all hover:border-white/16 hover:bg-[linear-gradient(90deg,rgba(255,255,255,0.09),rgba(255,255,255,0.05))] md:px-4">
      <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-transparent via-white/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/15 text-base">
            {rankIcon(rank)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white md:text-base">
              {entry.participant_name}
            </p>
            <p className="truncate text-[11px] uppercase tracking-[0.18em] text-white/40">
              {entry.participant_mode}
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-[10px] uppercase tracking-[0.22em] text-white/35">Ball</p>
          <p className="text-xl font-black leading-none text-yellow-300 md:text-2xl">
            {entry.score}
          </p>
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
  const podiumEntries = visibleEntries.slice(0, 3);

  return (
    <section className="relative mt-6 overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(8,15,25,0.95),rgba(11,18,31,0.9),rgba(8,12,20,0.96))] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl md:p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(34,211,238,0.14),transparent_22%),radial-gradient(circle_at_88%_0%,rgba(251,191,36,0.13),transparent_22%),radial-gradient(circle_at_50%_100%,rgba(168,85,247,0.12),transparent_26%)]" />
      <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.9)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.9)_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="absolute -left-24 top-8 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="absolute -right-24 bottom-0 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-3xl" />

      <div className="relative mb-5 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 md:gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/7 text-cyan-300 shadow-inner shadow-black/20 md:h-14 md:w-14">
            <HiSparkles className="text-xl md:text-2xl" />
          </div>
          <div>
            <h3 className="text-lg font-black uppercase tracking-[0.12em] text-white md:text-2xl">
              {title}
            </h3>
          </div>
        </div>

        <span className="shrink-0 rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-white/65">
          Top {visibleEntries.length || 0}
        </span>
      </div>

      {loading ? (
        <LeaderboardSkeleton />
      ) : visibleEntries.length === 0 ? (
        <div className="relative rounded-[1.7rem] border border-dashed border-white/12 bg-white/[0.04] px-5 py-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/8 text-cyan-300">
            <FaTrophy className="text-2xl" />
          </div>
          <p className="mt-4 text-sm font-bold text-white/90">
            Hozircha natijalar yo'q
          </p>
          <p className="mt-2 text-xs text-white/50">
            Birinchi bo'lib rekord o'rnating va leaderboardni boshlang.
          </p>
        </div>
      ) : (
        <div className="relative space-y-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {podiumEntries.map((entry, index) => (
              <PodiumCard key={entry.id} entry={entry} rank={index} />
            ))}
          </div>

          <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.04] p-3 md:p-4">
            <div className="mb-3 flex items-center justify-between gap-3 px-2 pt-1">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-white/46">
                  Barcha natijalar
                </p>
                <p className="mt-1 text-[11px] text-white/40">
                  To'liq leaderboard ro'yxati
                </p>
              </div>
            </div>

            <div className="wheel-leaderboard-scroll max-h-72 space-y-2 overflow-y-auto pr-1 md:max-h-80">
              {visibleEntries.map((entry, index) => (
                <ListRow key={entry.id} entry={entry} rank={index} />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
