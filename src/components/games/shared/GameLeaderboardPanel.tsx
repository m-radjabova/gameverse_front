import {
  FaCrown,
  FaMedal,
  FaTrophy,
  FaStar,
  FaFire,
  FaBolt,
  FaChevronUp
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import {
  FiSearch,
  FiTrendingUp,
  FiUsers,
  FiAward,
  FiX,
} from "react-icons/fi";
import useGameLeaderboard, {
  isSinglePlayerLeaderboardEntry,
} from "../../../hooks/useGameLeaderboard";
import type { GameLeaderboardEntry as LeaderboardEntry } from "../../../types/types";
import { useState, useEffect, useRef, useMemo } from "react";

type Props = {
  gameKey: string;
  title?: string;
  limit?: number;
  singlePlayerOnly?: boolean;
  currentUserName?: string;
};

/* ───────────────────────── Helpers ───────────────────────── */

function getInitials(name: string): string {
  return (
    name
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?"
  );
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

function AnimatedScore({
  score,
  className = "",
}: {
  score: number;
  className?: string;
}) {
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

const RANK_META: Record<
  number,
  { icon: React.ReactNode; bg: string; border: string; text: string }
> = {
  0: {
    icon: (
      <FaCrown className="text-yellow-300 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
    ),
    bg: "bg-gradient-to-br from-yellow-400/30 to-amber-500/15",
    border: "border-yellow-400/40 shadow-[0_0_20px_rgba(250,204,21,0.2)]",
    text: "text-yellow-300",
  },
  1: {
    icon: (
      <FaTrophy className="text-slate-100 drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]" />
    ),
    bg: "bg-gradient-to-br from-slate-100/20 to-white/10",
    border: "border-slate-200/25",
    text: "text-slate-100",
  },
  2: {
    icon: (
      <FaMedal className="text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.4)]" />
    ),
    bg: "bg-gradient-to-br from-amber-400/25 to-orange-400/12",
    border: "border-amber-400/30",
    text: "text-amber-300",
  },
};

function rankBadge(rank: number) {
  if (RANK_META[rank]) return RANK_META[rank];
  return {
    icon: <span className="text-xs font-black text-white/60">#{rank + 1}</span>,
    bg: "bg-white/[0.06]",
    border: "border-white/10",
    text: "text-white/60",
  };
}

function cardBorder(rank: number) {
  if (rank === 0)
    return "border-yellow-400/35 ring-1 ring-yellow-400/25 shadow-[0_20px_60px_-15px_rgba(250,204,21,0.3)]";
  if (rank === 1)
    return "border-slate-200/20 ring-1 ring-white/10 shadow-[0_20px_50px_-15px_rgba(255,255,255,0.1)]";
  if (rank === 2)
    return "border-amber-400/30 ring-1 ring-amber-400/15 shadow-[0_20px_50px_-15px_rgba(251,191,36,0.15)]";
  return "border-white/10";
}

function placementLabel(rank: number) {
  return ["1-o'rin", "2-o'rin", "3-o'rin"][rank] || `${rank + 1}-o'rin`;
}

/* ───────────────────────── Skeleton ───────────────────────── */

function SkeletonBar({
  width = "100%",
  height = "12px",
  className = "",
}: {
  width?: string;
  height?: string;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-full bg-white/[0.05] ${className}`}
      style={{ width, height }}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/[0.1] to-transparent" />
    </div>
  );
}

function PodiumSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <div
      className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5"
      style={{ animation: `fadeIn 0.4s ease-out ${delay}s both` }}
    >
      <div className="mb-5 flex items-center justify-between">
        <div className="h-12 w-12 rounded-2xl bg-white/[0.06]" />
        <SkeletonBar width="60px" height="10px" />
      </div>
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-white/[0.06]" />
        <div className="flex-1 space-y-2">
          <SkeletonBar width="70%" height="12px" />
          <SkeletonBar width="40%" height="9px" />
        </div>
      </div>
      <div className="mt-5 space-y-2">
        <SkeletonBar width="100%" height="8px" />
        <div className="flex justify-between">
          <SkeletonBar width="40%" height="10px" />
          <SkeletonBar width="20%" height="10px" />
        </div>
      </div>
    </div>
  );
}

function ListRowSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <div
      className="flex items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-3.5"
      style={{ animation: `fadeIn 0.4s ease-out ${delay}s both` }}
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-white/[0.06]" />
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-white/[0.06]" />
          <div className="space-y-1.5">
            <SkeletonBar width="120px" height="10px" />
            <SkeletonBar width="60px" height="8px" />
          </div>
        </div>
      </div>
      <SkeletonBar width="50px" height="14px" />
    </div>
  );
}

function LeaderboardSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <PodiumSkeleton delay={0.05} />
        <PodiumSkeleton delay={0.1} />
        <PodiumSkeleton delay={0.15} />
      </div>
      <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
        <div className="mb-4 flex items-center justify-between px-1">
          <SkeletonBar width="140px" height="12px" />
          <SkeletonBar width="80px" height="10px" />
        </div>
        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <ListRowSkeleton key={i} delay={0.2 + i * 0.05} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Podium ───────────────────────── */

function PodiumCard({
  entry,
  rank,
  maxScore,
  isCurrentUser,
}: {
  entry: LeaderboardEntry;
  rank: number;
  maxScore: number;
  isCurrentUser: boolean;
}) {
  const badge = rankBadge(rank);
  const progressPercent = maxScore > 0 ? (entry.score / maxScore) * 100 : 0;

  const progressColors = [
    "bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400",
    "bg-gradient-to-r from-slate-200 via-white to-slate-100",
    "bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400",
  ];

  const bgGradient = [
    "from-yellow-400/15 via-amber-400/8 to-transparent",
    "from-slate-100/10 via-white/5 to-transparent",
    "from-amber-300/12 via-orange-400/6 to-transparent",
  ];

  const isChampion = rank === 0;

  return (
    <article
      aria-label={`${placementLabel(rank)}: ${entry.participant_name}`}
      className={`group relative overflow-hidden rounded-[1.5rem] border p-5 transition-all duration-500 hover:-translate-y-1.5 ${cardBorder(
        rank,
      )} ${isCurrentUser ? "ring-2 ring-cyan-400/50 ring-offset-2 ring-offset-slate-950" : ""}`}
    >
      {/* Background gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${bgGradient[rank] || "from-cyan-400/8 via-transparent to-transparent"}`}
      />

      {/* Shine effects */}
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white/10 blur-3xl opacity-50 transition-all duration-700 group-hover:scale-150 group-hover:opacity-80" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

      {/* Champion animated sparkles */}
      {isChampion && (
        <>
          <div className="pointer-events-none absolute right-4 top-4 text-yellow-300/60 animate-pulse">
            <FaStar className="text-xs" />
          </div>
          <div className="pointer-events-none absolute right-8 top-6 text-yellow-300/40 animate-pulse [animation-delay:0.5s]">
            <FaStar className="text-[8px]" />
          </div>
        </>
      )}

      <div className="relative">
        {/* Rank badge */}
        <div className="mb-4 flex items-center justify-between">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${badge.bg} ${badge.border} shadow-inner shadow-black/20 transition-transform duration-300 group-hover:scale-110`}
          >
            {badge.icon}
          </div>
          <div className="flex items-center gap-2">
            {isCurrentUser && (
              <span className="rounded-full border border-cyan-400/40 bg-cyan-400/15 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-cyan-200">
                Siz
              </span>
            )}
            <span
              className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] ${
                rank === 0
                  ? "border-yellow-400/25 bg-yellow-400/10 text-yellow-200"
                  : rank === 1
                  ? "border-white/10 bg-white/[0.06] text-slate-100"
                  : "border-amber-400/20 bg-amber-400/10 text-amber-200"
              }`}
            >
              {placementLabel(rank)}
            </span>
          </div>
        </div>

        {/* Avatar + name */}
        <div className="flex items-center gap-3">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${getAvatarColor(
              entry.participant_name,
            )} text-sm font-black text-white shadow-lg ring-2 ring-white/10`}
          >
            {getInitials(entry.participant_name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-black leading-tight text-white md:text-xl">
              {entry.participant_name}
            </p>
            <p className="mt-0.5 truncate text-[10px] uppercase tracking-[0.24em] text-white/45">
              {entry.participant_mode}
            </p>
          </div>
        </div>

        {/* Score */}
        <div className="mt-5">
          <div className="mb-2 flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.32em] text-white/35">
                Ball
              </p>
              <div className="mt-1 flex items-baseline gap-1">
                <span className={`text-3xl font-black leading-none ${badge.text}`}>
                  <AnimatedScore score={entry.score} />
                </span>
                {isChampion && (
                  <FaStar className="ml-1 text-xs text-yellow-300 animate-pulse" />
                )}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-right backdrop-blur-sm">
              <p className="text-[9px] uppercase tracking-[0.22em] text-white/40">
                Rank
              </p>
              <p className="text-base font-black text-white/90">#{rank + 1}</p>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out ${
                progressColors[rank] ||
                "bg-gradient-to-r from-cyan-400 to-blue-400"
              }`}
              style={{ width: `${Math.max(progressPercent, 5)}%` }}
            />
          </div>
        </div>
      </div>
    </article>
  );
}

/* ───────────────────────── List Row ───────────────────────── */

function ListRow({
  entry,
  rank,
  maxScore,
  prevEntry,
  isCurrentUser,
}: {
  entry: LeaderboardEntry;
  rank: number;
  maxScore: number;
  prevEntry?: LeaderboardEntry;
  isCurrentUser: boolean;
}) {
  const badge = rankBadge(rank);
  const progressPercent = maxScore > 0 ? (entry.score / maxScore) * 100 : 0;
  const isTop3 = rank < 3;
  const scoreDiff = prevEntry ? prevEntry.score - entry.score : 0;

  const rowBorder = isCurrentUser
    ? "border-cyan-400/40 bg-gradient-to-r from-cyan-400/12 via-cyan-400/5 to-transparent ring-1 ring-cyan-400/25"
    : isTop3
    ? "border-white/15 bg-gradient-to-r from-white/[0.06] via-white/[0.03] to-transparent"
    : "border-white/[0.06] bg-white/[0.02]";

  return (
    <article
      aria-label={`${rank + 1}-o'rin: ${entry.participant_name}`}
      className={`group relative overflow-hidden rounded-xl border px-4 py-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.06] ${rowBorder}`}
    >
      {/* Left accent bar */}
      {isTop3 && (
        <div
          className={`absolute inset-y-0 left-0 w-0.5 ${
            rank === 0
              ? "bg-gradient-to-b from-yellow-400 to-amber-500"
              : rank === 1
              ? "bg-gradient-to-b from-slate-100 to-slate-300"
              : "bg-gradient-to-b from-amber-400 to-orange-500"
          }`}
        />
      )}

      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {/* Rank badge */}
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${badge.bg} ${badge.border} shadow-sm transition-transform duration-300 group-hover:scale-105`}
          >
            {badge.icon}
          </div>

          {/* Avatar + name */}
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${getAvatarColor(
                entry.participant_name,
              )} text-[11px] font-black text-white shadow-md ring-1 ring-white/10`}
            >
              {getInitials(entry.participant_name)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-bold text-white md:text-base">
                  {entry.participant_name}
                </p>
                {isCurrentUser && (
                  <span className="shrink-0 rounded-full bg-cyan-400/20 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-cyan-200">
                    Siz
                  </span>
                )}
              </div>
              <p className="truncate text-[10px] uppercase tracking-[0.18em] text-white/40">
                {entry.participant_mode}
              </p>
            </div>
          </div>
        </div>

        {/* Score */}
        <div className="flex shrink-0 items-center gap-3">
          {/* Score diff */}
          {rank > 0 && scoreDiff > 0 && (
            <div className="hidden items-center gap-1 rounded-full bg-white/[0.04] px-2 py-1 sm:flex">
              <FaChevronUp className="text-[7px] text-rose-400" />
              <span className="text-[9px] font-bold text-white/40">
                {scoreDiff.toLocaleString()}
              </span>
            </div>
          )}

          <div className="text-right">
            <p className="text-[9px] uppercase tracking-[0.22em] text-white/35">
              Ball
            </p>
            <div className="flex items-baseline justify-end gap-1">
              <span
                className={`text-lg font-black leading-none md:text-xl ${
                  isTop3 ? badge.text : "text-white/85"
                }`}
              >
                {entry.score.toLocaleString()}
              </span>
              {rank === 0 && (
                <FaCrown className="text-[9px] text-yellow-400" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.04]">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${
            isTop3
              ? "bg-gradient-to-r from-yellow-400/70 to-amber-500/70"
              : "bg-gradient-to-r from-cyan-400/60 to-blue-400/60"
          }`}
          style={{ width: `${Math.max(progressPercent, 2)}%` }}
        />
      </div>
    </article>
  );
}

/* ───────────────────────── Main ───────────────────────── */

export default function GameLeaderboardPanel({
  gameKey,
  title = "Leaderboard",
  limit = 100,
  singlePlayerOnly = true,
  currentUserName,
}: Props) {
  const { entries, loading } = useGameLeaderboard(gameKey, limit);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "top">("all");

  const visibleEntries = useMemo(
    () =>
      singlePlayerOnly
        ? entries.filter(isSinglePlayerLeaderboardEntry)
        : entries,
    [entries, singlePlayerOnly],
  );

  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return visibleEntries;
    const q = searchQuery.toLowerCase().trim();
    return visibleEntries.filter((e) =>
      e.participant_name.toLowerCase().includes(q),
    );
  }, [visibleEntries, searchQuery]);

  const podiumEntries = visibleEntries.slice(0, 3);
  const maxScore = visibleEntries[0]?.score ?? 0;

  const stats = useMemo(() => {
    const total = visibleEntries.length;
    const avg =
      total > 0
        ? Math.round(
            visibleEntries.reduce((s, e) => s + e.score, 0) / total,
          )
        : 0;
    const top = visibleEntries[0]?.score ?? 0;
    return { total, avg, top };
  }, [visibleEntries]);

  const isCurrentUserEntry = (entry: LeaderboardEntry) =>
    currentUserName && entry.participant_name === currentUserName;

  return (
    <section className="relative mt-6 overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(8,15,25,0.98),rgba(11,18,31,0.94),rgba(8,12,20,0.98))] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl md:p-6">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(34,211,238,0.14),transparent_25%),radial-gradient(circle_at_88%_0%,rgba(251,191,36,0.13),transparent_25%),radial-gradient(circle_at_50%_100%,rgba(168,85,247,0.12),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(255,255,255,0.9)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.9)_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="pointer-events-none absolute -left-20 top-10 h-48 w-48 rounded-full bg-cyan-400/10 blur-[80px]" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-60 w-60 rounded-full bg-fuchsia-500/10 blur-[80px]" />

      {/* ─── Header ─── */}
      <div className="relative mb-5 rounded-[1.5rem] border border-white/[0.08] bg-white/[0.03] p-4 md:mb-6 md:p-5">
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
                Eng yaxshi o'yinchilar · real vaqtda yangilanadi
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <FaFire className="text-orange-400 text-xs animate-pulse" />
            <span className="rounded-full border border-orange-300/25 bg-orange-400/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-orange-100/90">
              Live
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/[0.06] pt-4">
          <StatItem
            icon={<FiUsers className="text-cyan-300" />}
            label="Ishtirokchi"
            value={stats.total}
          />
          <StatItem
            icon={<FiTrendingUp className="text-emerald-300" />}
            label="O'rtacha"
            value={stats.avg}
          />
          <StatItem
            icon={<FiAward className="text-yellow-300" />}
            label="Eng yuqori"
            value={stats.top}
          />
        </div>
      </div>

      {/* ─── Content ─── */}
      {loading ? (
        <LeaderboardSkeleton />
      ) : visibleEntries.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="relative space-y-5">
          {/* Tabs + search */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex rounded-full border border-white/[0.08] bg-white/[0.03] p-1">
              <TabButton
                active={activeTab === "top"}
                onClick={() => setActiveTab("top")}
                icon={<FaTrophy className="text-[10px]" />}
              >
                Top 3
              </TabButton>
              <TabButton
                active={activeTab === "all"}
                onClick={() => setActiveTab("all")}
                icon={<FiUsers className="text-[10px]" />}
              >
                Barchasi
              </TabButton>
            </div>

            <div className="relative flex-1 sm:max-w-xs">
              <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/30" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ishtirokchi qidirish..."
                className="w-full rounded-full border border-white/[0.08] bg-white/[0.03] py-2 pl-9 pr-9 text-xs text-white/80 outline-none transition-all placeholder:text-white/30 focus:border-cyan-400/30 focus:bg-white/[0.06]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-white/40 transition hover:bg-white/10 hover:text-white"
                  aria-label="Tozalash"
                >
                  <FiX className="text-xs" />
                </button>
              )}
            </div>
          </div>

          {/* Podium */}
          {activeTab === "top" && (
            <>
              <div className="mb-1 flex items-center gap-2 px-1">
                <span className="h-1.5 w-1.5 rounded-full bg-yellow-300 shadow-[0_0_10px_rgba(253,224,71,0.8)]" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/45">
                  Top 3 natijalar
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {podiumEntries.map((entry, index) => (
                  <div
                    key={entry.id}
                    className="animate-fadeInUp"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <PodiumCard
                      entry={entry}
                      rank={index}
                      maxScore={maxScore}
                      isCurrentUser={!!isCurrentUserEntry(entry)}
                    />
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Full list */}
          {activeTab === "all" && (
            <div className="rounded-[1.5rem] border border-white/[0.08] bg-white/[0.03] p-3 md:p-4">
              <div className="mb-3 flex items-center justify-between gap-3 px-1">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/50">
                    {searchQuery
                      ? `${filteredEntries.length} natija topildi`
                      : "Barcha natijalar"}
                  </p>
                </div>
                <span className="text-[10px] font-medium text-white/35">
                  {filteredEntries.length} ta
                </span>
              </div>

              <div className="scrollbar-thin max-h-[420px] space-y-2 overflow-y-auto pr-1">
                {filteredEntries.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 py-10">
                    <FiSearch className="text-2xl text-white/20" />
                    <p className="text-xs text-white/40">
                      Hech narsa topilmadi
                    </p>
                  </div>
                ) : (
                  filteredEntries.map((entry, index) => (
                    <div
                      key={entry.id}
                      className="animate-fadeInUp"
                      style={{ animationDelay: `${Math.min(index * 30, 400)}ms` }}
                    >
                      <ListRow
                        entry={entry}
                        rank={index}
                        maxScore={maxScore}
                        prevEntry={filteredEntries[index - 1]}
                        isCurrentUser={!!isCurrentUserEntry(entry)}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .animate-fadeInUp { animation: fadeInUp 0.4s ease-out both; }
        .animate-shimmer  { animation: shimmer 1.8s infinite; }

        .scrollbar-thin::-webkit-scrollbar { width: 4px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.08);
          border-radius: 9999px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.16);
        }
      `}</style>
    </section>
  );
}

/* ───────────────────────── Sub-components ───────────────────────── */

function StatItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/[0.05] bg-white/[0.02] px-2.5 py-2 transition hover:bg-white/[0.05]">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white/[0.04] text-xs">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="truncate text-[9px] font-black uppercase tracking-[0.16em] text-white/40">
          {label}
        </p>
        <p className="truncate text-sm font-black text-white">
          {value.toLocaleString()}
        </p>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] transition-all ${
        active
          ? "bg-gradient-to-r from-cyan-400/20 to-blue-400/15 text-cyan-200 shadow-[0_0_16px_rgba(34,211,238,0.15)] ring-1 ring-cyan-400/30"
          : "text-white/40 hover:text-white/70"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function EmptyState() {
  return (
    <div className="relative overflow-hidden rounded-[1.5rem] border border-dashed border-white/[0.1] bg-white/[0.02] px-6 py-14 text-center">
      {/* Glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-[80px]" />

      <div className="relative">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-cyan-400/15 to-purple-500/15">
          <div className="relative">
            <FaTrophy className="text-3xl text-cyan-300/80" />
            <FaStar className="absolute -right-2 -top-2 text-[10px] text-yellow-400 animate-pulse" />
            <FaStar className="absolute -left-2 bottom-0 text-[8px] text-amber-400 animate-pulse [animation-delay:0.4s]" />
          </div>
        </div>
        <p className="text-base font-black text-white">Hozircha natijalar yo'q</p>
        <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-white/50">
          Birinchi bo'lib rekord o'rnating va leaderboardni boshlang.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-yellow-200">
          <FaBolt className="text-yellow-400" />
          O'ynashni boshlash
        </div>
      </div>
    </div>
  );
}