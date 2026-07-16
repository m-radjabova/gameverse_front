import { FaCrown, FaMedal, FaTrophy, FaStar, FaFire, FaBolt } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import useGameLeaderboard, { isSinglePlayerLeaderboardEntry } from "../../../hooks/useGameLeaderboard";
import type { GameLeaderboardEntry as LeaderboardEntry } from "../../../types/types";
import { useState, useEffect, useRef } from "react";

type Props = {
  gameKey: string;
  title?: string;
  limit?: number;
  singlePlayerOnly?: boolean;
};

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";
}

function getAvatarColor(name: string): string {
  const colors = [
    "from-cyan-400 to-blue-500",
    "from-fuchsia-400 to-purple-500",
    "from-amber-300 to-orange-500",
    "from-emerald-400 to-teal-500",
    "from-pink-400 to-rose-500",
    "from-violet-400 to-indigo-500",
    "from-lime-400 to-green-500",
    "from-sky-400 to-cyan-500",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function AnimatedScore({ score, className = "" }: { score: number; className?: string }) {
  const [displayed, setDisplayed] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;
    const duration = 1200;
    const steps = 30;
    const increment = score / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setDisplayed(score);
        clearInterval(timer);
      } else {
        setDisplayed(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [score]);

  return <span className={className}>{displayed.toLocaleString()}</span>;
}

function rankBadge(rank: number) {
  const badges: Record<number, { icon: React.ReactNode; bg: string; border: string }> = {
    0: {
      icon: <FaCrown className="text-yellow-300 drop-shadow-[0_0_6px_rgba(250,204,21,0.5)]" />,
      bg: "bg-gradient-to-br from-yellow-400/25 to-amber-500/15",
      border: "border-yellow-400/30 shadow-[0_0_15px_rgba(250,204,21,0.15)]",
    },
    1: {
      icon: <FaTrophy className="text-slate-100 drop-shadow-[0_0_6px_rgba(255,255,255,0.3)]" />,
      bg: "bg-gradient-to-br from-slate-100/20 to-white/10",
      border: "border-slate-200/20",
    },
    2: {
      icon: <FaMedal className="text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.3)]" />,
      bg: "bg-gradient-to-br from-amber-400/20 to-orange-400/10",
      border: "border-amber-400/25",
    },
  };
  const def = { icon: <span className="text-xs font-black text-white/60">#{rank + 1}</span>, bg: "bg-white/[0.06]", border: "border-white/10" };
  return badges[rank] || def;
}

function cardBorder(rank: number) {
  if (rank === 0) return "border-yellow-400/30 ring-1 ring-yellow-400/20";
  if (rank === 1) return "border-slate-200/15 ring-1 ring-white/10";
  if (rank === 2) return "border-amber-400/25 ring-1 ring-amber-400/10";
  return "border-white/10";
}

function placementLabel(rank: number) {
  const labels = ["1-o'rin", "2-o'rin", "3-o'rin"];
  return labels[rank] || `${rank + 1}-o'rin`;
}

function LeaderboardSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      {/* Podium skeleton */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="overflow-hidden rounded-[1.8rem] border border-white/10 bg-white/[0.05] p-5"
          >
            <div className="mb-5 flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-white/10" />
              <div className="h-4 w-16 rounded-full bg-white/10" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white/10" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-2/3 rounded-full bg-white/10" />
                <div className="h-3 w-1/3 rounded-full bg-white/10" />
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between">
              <div className="space-y-1">
                <div className="h-3 w-12 rounded-full bg-white/10" />
                <div className="h-7 w-16 rounded-full bg-white/10" />
              </div>
              <div className="h-10 w-16 rounded-xl bg-white/10" />
            </div>
          </div>
        ))}
      </div>

      {/* List skeleton */}
      <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-4">
        <div className="mb-4 px-1">
          <div className="h-4 w-32 rounded-full bg-white/10" />
        </div>
        <div className="space-y-2">
          {[0, 1, 2, 3].map((item) => (
            <div
              key={item}
              className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/15 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/10" />
                <div className="space-y-2">
                  <div className="h-4 w-32 rounded-full bg-white/10" />
                  <div className="h-3 w-16 rounded-full bg-white/10" />
                </div>
              </div>
              <div className="text-right space-y-1">
                <div className="h-3 w-10 rounded-full bg-white/10" />
                <div className="h-6 w-12 rounded-full bg-white/10" />
              </div>
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
  maxScore,
}: {
  entry: LeaderboardEntry;
  rank: number;
  maxScore: number;
}) {
  const badge = rankBadge(rank);
  const progressPercent = maxScore > 0 ? (entry.score / maxScore) * 100 : 0;

  const progressColors = [
    "bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400",
    "bg-gradient-to-r from-slate-200 via-white to-slate-100",
    "bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400",
  ];

  const glowColors = [
    "shadow-yellow-400/20",
    "shadow-white/10",
    "shadow-amber-400/15",
  ];

  return (
    <article
      aria-label={`${placementLabel(rank)}: ${entry.participant_name}`}
      className={`group relative overflow-hidden rounded-[1.8rem] border p-5 shadow-lg transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl ${cardBorder(rank)} ${glowColors[rank] || "shadow-black/10"}`}
    >
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${rank === 0 ? "from-yellow-400/15 via-amber-400/8 to-transparent" : rank === 1 ? "from-slate-100/10 via-white/5 to-transparent" : rank === 2 ? "from-amber-300/12 via-orange-400/6 to-transparent" : "from-cyan-400/8 via-transparent to-transparent"}`} />

      {/* Glow orbs */}
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white/10 blur-3xl opacity-50 transition-all duration-700 group-hover:scale-150 group-hover:opacity-80" />
      <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-white/5 blur-2xl opacity-0 transition-all duration-700 group-hover:opacity-60" />

      {/* Top shine line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

      <div className="relative">
        {/* Rank badge + label */}
        <div className="mb-4 flex items-center justify-between">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${badge.bg} ${badge.border} border shadow-inner shadow-black/20`}>
            {badge.icon}
          </div>
          <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] ${rank === 0 ? "text-yellow-200 border-yellow-400/20 bg-yellow-400/10" : rank === 1 ? "text-slate-100 border-white/10 bg-white/8" : rank === 2 ? "text-amber-200 border-amber-400/15 bg-amber-400/10" : "text-cyan-100 border-cyan-400/10 bg-cyan-400/8"}`}>
            {placementLabel(rank)}
          </span>
        </div>

        {/* Participant info with avatar */}
        <div className="flex items-center gap-3">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${getAvatarColor(entry.participant_name)} text-sm font-black text-white shadow-lg`}>
            {getInitials(entry.participant_name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-black leading-tight text-white md:text-[1.3rem]">
              {entry.participant_name}
            </p>
            <p className="mt-0.5 truncate text-[11px] uppercase tracking-[0.24em] text-white/45">
              {entry.participant_mode}
            </p>
          </div>
        </div>

        {/* Score section with progress bar */}
        <div className="mt-5">
          <div className="mb-2 flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.32em] text-white/38">Ball</p>
              <div className="mt-1 flex items-baseline gap-1">
                <span className={`text-2xl font-black leading-none ${rank === 0 ? "text-yellow-300" : rank === 1 ? "text-white" : rank === 2 ? "text-amber-300" : "text-cyan-200"}`}>
                  <AnimatedScore score={entry.score} />
                </span>
                {rank === 0 && <FaStar className="ml-1 text-xs text-yellow-300 animate-pulse" />}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-right backdrop-blur-sm">
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">Rank</p>
              <p className="text-base font-black text-white/85">#{rank + 1}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/8">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out ${progressColors[rank] || "bg-gradient-to-r from-cyan-400 to-blue-400"}`}
              style={{ width: `${Math.max(progressPercent, 5)}%` }}
            />
          </div>
        </div>
      </div>
    </article>
  );
}

function ListRow({
  entry,
  rank,
  maxScore,
}: {
  entry: LeaderboardEntry;
  rank: number;
  maxScore: number;
}) {
  const badge = rankBadge(rank);
  const progressPercent = maxScore > 0 ? (entry.score / maxScore) * 100 : 0;
  const isTop3 = rank < 3;
  const delay = Math.min((rank - 3) * 30, 300);

  const rowBorder = rank === 0
    ? "border-yellow-400/20 bg-gradient-to-r from-yellow-400/8 via-yellow-400/3 to-transparent"
    : rank === 1
    ? "border-slate-100/12 bg-gradient-to-r from-slate-100/6 via-white/3 to-transparent"
    : rank === 2
    ? "border-amber-400/15 bg-gradient-to-r from-amber-400/6 via-amber-400/3 to-transparent"
    : "border-white/8 bg-[linear-gradient(90deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))]";

  return (
    <article
      aria-label={`${rank + 1}-o'rin: ${entry.participant_name}`}
      className={`group relative overflow-hidden rounded-2xl border px-4 py-3.5 transition-all duration-300 hover:border-white/20 hover:bg-[linear-gradient(90deg,rgba(255,255,255,0.10),rgba(255,255,255,0.05))] ${rowBorder}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Left accent bar */}
      <div className={`absolute inset-y-0 left-0 w-0.5 bg-gradient-to-b from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${isTop3 ? "opacity-80" : ""}`} />

      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          {/* Rank badge */}
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${badge.bg} ${badge.border} border shadow-sm`}>
            {badge.icon}
          </div>

          {/* Avatar + Name */}
          <div className="flex items-center gap-3 min-w-0">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${getAvatarColor(entry.participant_name)} text-[11px] font-black text-white shadow-md`}>
              {getInitials(entry.participant_name)}
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
        </div>

        {/* Score */}
        <div className="text-right shrink-0">
          <p className="text-[10px] uppercase tracking-[0.22em] text-white/35">Ball</p>
          <div className="flex items-baseline gap-1.5 justify-end">
            <span className={`text-xl font-black leading-none md:text-2xl ${isTop3 ? "text-yellow-300" : "text-white/80"}`}>
              {entry.score.toLocaleString()}
            </span>
            {rank === 0 && <FaCrown className="text-[10px] text-yellow-400" />}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-white/6">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400/60 to-blue-400/60 transition-all duration-700 ease-out"
          style={{ width: `${Math.max(progressPercent, 2)}%` }}
        />
      </div>
    </article>
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
  const maxScore = visibleEntries.length > 0 ? visibleEntries[0].score : 0;

  return (
    <section className="relative mt-6 overflow-hidden rounded-[2rem] border border-white/12 bg-[linear-gradient(180deg,rgba(8,15,25,0.98),rgba(11,18,31,0.94),rgba(8,12,20,0.98))] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.3)] backdrop-blur-xl md:p-6">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(34,211,238,0.15),transparent_22%),radial-gradient(circle_at_88%_0%,rgba(251,191,36,0.14),transparent_22%),radial-gradient(circle_at_50%_100%,rgba(168,85,247,0.13),transparent_28%)]" />
      <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,0.9)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.9)_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="absolute -left-20 top-10 h-48 w-48 rounded-full bg-cyan-400/10 blur-[80px]" />
      <div className="absolute -right-20 bottom-0 h-60 w-60 rounded-full bg-fuchsia-500/10 blur-[80px]" />

      {/* Header */}
      <div className="relative mb-5 rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-4 md:mb-6 md:p-5">
        <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 md:gap-4">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/20 bg-gradient-to-br from-cyan-300/15 to-blue-500/10 text-cyan-300 shadow-[0_0_24px_rgba(34,211,238,0.12)] md:h-14 md:w-14">
            <HiSparkles className="text-xl md:text-2xl" />
            <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-cyan-400 animate-ping opacity-50" />
          </div>
          <div>
            <h3 className="text-lg font-black uppercase leading-tight tracking-[0.1em] text-white md:text-2xl">
              {title}
            </h3>
            <p className="mt-1 text-xs leading-relaxed tracking-wide text-white/45 md:text-sm">
              Eng yaxshi o'yinchilar reytingi · natijalar real vaqtda yangilanadi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <FaFire className="text-orange-400 text-xs animate-pulse" />
          <span className="rounded-full border border-orange-300/20 bg-orange-400/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-orange-100/80">
            Top {Math.min(visibleEntries.length, 3) || 0}
          </span>
        </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/8 pt-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/40 md:gap-5">
          <span><b className="text-white/80">{visibleEntries.length}</b> ishtirokchi</span>
          <span className="hidden h-1 w-1 rounded-full bg-cyan-300/60 sm:block" />
          <span><b className="text-cyan-200">{podiumEntries.length}</b> sovrindor</span>
          <span className="hidden h-1 w-1 rounded-full bg-cyan-300/60 sm:block" />
          <span className="text-cyan-200/70">Eng yuqori natijalar</span>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LeaderboardSkeleton />
      ) : visibleEntries.length === 0 ? (
        <div className="relative rounded-[1.8rem] border border-dashed border-white/12 bg-white/[0.04] px-6 py-12 text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-cyan-400/10 to-purple-500/10">
            <div className="relative">
              <FaTrophy className="text-3xl text-cyan-300/70" />
              <FaStar className="absolute -right-2 -top-2 text-[10px] text-yellow-400 animate-pulse" />
            </div>
          </div>
          <p className="text-base font-bold text-white/90">
            Hozircha natijalar yo'q
          </p>
          <p className="mt-2 text-sm text-white/50 max-w-xs mx-auto leading-relaxed">
            Birinchi bo'lib rekord o'rnating va leaderboardni boshlang.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.15em] text-white/50">
            <FaBolt className="text-yellow-400" />
            O'ynashni boshlash
          </div>
        </div>
      ) : (
        <div className="relative space-y-5">
          {/* Podium */}
          <div className="mb-1 flex items-center gap-2 px-1">
            <span className="h-1.5 w-1.5 rounded-full bg-yellow-300 shadow-[0_0_10px_rgba(253,224,71,0.8)]" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/45">Top 3 natijalar</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {podiumEntries.map((entry, index) => (
              <div
                key={entry.id}
                className="animate-fadeInUp"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <PodiumCard entry={entry} rank={index} maxScore={maxScore} />
              </div>
            ))}
          </div>

          {/* All results */}
          <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-4 md:p-5">
            <div className="mb-4 flex items-center justify-between gap-3 px-1">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-white/46">
                    Barcha natijalar
                  </p>
                  <p className="mt-0.5 text-[11px] text-white/40">
                    To'liq leaderboard ro'yxati
                  </p>
                </div>
              </div>
              {visibleEntries.length > 3 && (
                <span className="text-[11px] text-white/35 font-medium">
                  {visibleEntries.length - 3} ta qatnashchi
                </span>
              )}
            </div>

            <div className="scrollbar-thin max-h-72 space-y-2 overflow-y-auto pr-1 md:max-h-80 scrollbar-track-transparent scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
              {visibleEntries.map((entry, index) => (
                <div
                  key={entry.id}
                  className="animate-fadeInUp"
                  style={{ animationDelay: `${(index + 3) * 50}ms` }}
                >
                  <ListRow entry={entry} rank={index} maxScore={maxScore} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.4s ease-out both;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.08);
          border-radius: 9999px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.15);
        }
      `}</style>
    </section>
  );
}
