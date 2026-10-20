import { useEffect, useMemo, useRef, useState } from "react";
import { FaRegStar, FaStar, FaQuoteRight } from "react-icons/fa";
import {
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiMessageCircle,
  FiSend,
  FiSmile,
  FiStar,
  FiX,
} from "react-icons/fi";

import useContextPro from "../../../hooks/useContextPro";
import useGameFeedback from "../../../hooks/useGameFeedback";
import { hasAnyRole } from "../../../utils/roles";
import { toMediaUrl } from "../../../utils";

type Props = { gameKey: string };

const QUICK_EMOJIS = [
  "😊", "😍", "🔥", "👏", "🎮", "🧠", "🚀", "💡",
  "⭐", "❤️", "✨", "🎯", "💪", "🏆", "🌟", "🤩",
  "👍", "🎉", "💯", "🫶", "😎", "🙌", "⚡", "🌈",
];
const MAX_COMMENT_LENGTH = 500;

/* ───────────────────────── Helpers ───────────────────────── */

function formatFeedbackDate(dateString?: string): string {
  if (!dateString) return "";
  const parsed = new Date(dateString);
  return Number.isNaN(parsed.getTime())
    ? ""
    : parsed.toLocaleDateString("uz-UZ", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
}

function buildAvatar(username?: string | null): string {
  const seed = (username || "teacher").replace(/\s+/g, "-").toLowerCase();
  return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(seed)}`;
}

function getInitial(username?: string | null): string {
  return (username || "Teacher").trim().charAt(0).toUpperCase() || "T";
}

/* ───────────────────────── Sub-components ───────────────────────── */

function FeedbackAvatar({
  username,
  avatar,
  size = "md",
}: {
  username?: string | null;
  avatar?: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const src = avatar ? toMediaUrl(avatar) : buildAvatar(username);

  const sizeClass =
    size === "lg"
      ? "h-12 w-12 rounded-[16px] text-sm"
      : size === "sm"
      ? "h-8 w-8 rounded-[10px] text-[10px]"
      : "h-11 w-11 rounded-[14px] text-xs";

  if (imageFailed || !src) {
    return (
      <div
        className={`flex ${sizeClass} shrink-0 items-center justify-center bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-500 font-black text-[#2b160b] shadow-lg shadow-amber-500/25`}
      >
        {getInitial(username)}
      </div>
    );
  }
  return (
    <div className="relative shrink-0">
      <img
        src={src}
        alt={username || "Teacher"}
        loading="lazy"
        decoding="async"
        onError={() => setImageFailed(true)}
        className={`${sizeClass} object-cover ring-2 ring-white/10 shadow-lg`}
      />
      {/* Verified dot */}
      <span className="absolute -bottom-0.5 -right-0.5 grid h-3.5 w-3.5 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 ring-2 ring-[#1a0f0b]">
        <FiCheck className="text-[7px] text-white" strokeWidth={4} />
      </span>
    </div>
  );
}

function StarRatingDisplay({
  value,
  size = "text-xs",
}: {
  value: number;
  size?: string;
}) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <FaStar
          key={star}
          className={`${size} transition-all duration-200 ${
            star <= value
              ? "text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.4)]"
              : "text-white/10"
          }`}
        />
      ))}
    </div>
  );
}

function AnimatedStar({
  filled,
  size = "text-lg",
  onClick,
  delay = 0,
  onMouseEnter,
}: {
  filled: boolean;
  size?: string;
  onClick?: () => void;
  delay?: number;
  onMouseEnter?: () => void;
}) {
  const Comp = filled ? FaStar : FaRegStar;
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={`${size} transition-all duration-300 ease-out hover:scale-125 active:scale-95`}
      style={{
        color: filled ? "#fbbf24" : "rgba(255,255,255,0.18)",
        filter: filled
          ? "drop-shadow(0 0 10px rgba(251,191,36,0.55))"
          : "none",
        animation: filled ? `starPop 0.4s ease-out ${delay}s both` : "none",
      }}
    >
      <Comp />
    </button>
  );
}

/* ───────────────────────── Skeleton ───────────────────────── */

function SkeletonLine({
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
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
    </div>
  );
}

function CommentCardSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <div
      className="w-[280px] shrink-0 rounded-[20px] border border-white/[0.05] bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-5 sm:w-[300px]"
      style={{ animation: `fadeIn 0.4s ease-out ${delay}s both` }}
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-[14px] bg-white/[0.06]">
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
        <div className="flex-1 space-y-2">
          <SkeletonLine width="60%" height="10px" />
          <SkeletonLine width="40%" height="8px" />
        </div>
      </div>
      <div className="space-y-2">
        <SkeletonLine width="100%" height="9px" />
        <SkeletonLine width="90%" height="9px" />
        <SkeletonLine width="70%" height="9px" />
      </div>
    </div>
  );
}

function FeedbackSkeleton() {
  return (
    <div className="mb-8">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-block h-2 w-2 rounded-full bg-white/10" />
          <SkeletonLine width="140px" height="10px" />
        </div>
        <div className="flex gap-1">
          <div className="h-7 w-7 rounded-full bg-white/[0.04]" />
          <div className="h-7 w-7 rounded-full bg-white/[0.04]" />
        </div>
      </div>
      <div className="flex gap-4 overflow-hidden">
        <CommentCardSkeleton delay={0.05} />
        <CommentCardSkeleton delay={0.1} />
        <CommentCardSkeleton delay={0.15} />
        <CommentCardSkeleton delay={0.2} />
      </div>
    </div>
  );
}

/* ───────────────────────── Main ───────────────────────── */

function GameFeedbackPanel({ gameKey }: Props) {
  const {
    state: { user },
  } = useContextPro();
  const { loading, summary, comments, submitting, submitFeedback } =
    useGameFeedback(gameKey);

  const [ratingInput, setRatingInput] = useState(0);
  const [commentInput, setCommentInput] = useState("");
  const [showEmojis, setShowEmojis] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const canLeaveFeedback = hasAnyRole(user, ["teacher"]);
  const canShowFeedbackForm = !user || canLeaveFeedback;
  const average = summary?.average_rating ?? 0;
  const totalCount = summary?.ratings_count ?? 0;

  const charPercent = useMemo(
    () => Math.min((commentInput.length / MAX_COMMENT_LENGTH) * 100, 100),
    [commentInput.length],
  );

  useEffect(() => {
    if (summary?.my_rating) setRatingInput(summary.my_rating);
  }, [summary?.my_rating]);

  const addEmoji = (emoji: string) => {
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? commentInput.length;
    const end = textarea?.selectionEnd ?? commentInput.length;
    const nextValue = `${commentInput.slice(0, start)}${emoji}${commentInput.slice(end)}`.slice(
      0,
      MAX_COMMENT_LENGTH,
    );
    setCommentInput(nextValue);
    setError("");
    setSuccess("");
    requestAnimationFrame(() => {
      textarea?.focus();
      const cursor = Math.min(start + emoji.length, nextValue.length);
      textarea?.setSelectionRange(cursor, cursor);
    });
  };

  const handleSubmit = async () => {
    if (!user) return setError("Iltimos, avval ro'yxatdan o'ting.");
    if (!canLeaveFeedback) return setError("Faqat teacher reyting yubora oladi.");
    const comment = commentInput.trim();
    if (!ratingInput || ratingInput < 1 || ratingInput > 5)
      return setError("1 dan 5 gacha reyting bering.");
    if (comment.length < 2)
      return setError("Comment kamida 2 ta belgidan iborat bo'lsin.");

    setError("");
    setSuccess("");
    const ok = await submitFeedback({ rating: ratingInput, comment });
    if (!ok) return setError("Yuborishda xatolik. Qayta urinib ko'ring.");
    setSuccess("Izohingiz yuborildi — admin tasdiqlagach ko'rinadi.");
    setCommentInput("");
    setShowEmojis(false);
  };

  const scrollComments = (direction: "left" | "right") => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollAmount = direction === "left" ? -300 : 300;
    el.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  return (
    <section className="feedback-panel relative mb-10 mt-6 overflow-hidden rounded-[2.5rem] border border-white/[0.08] bg-gradient-to-br from-[#1a0f0b]/95 via-[#1c1410]/95 to-[#1a0f0b]/95 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full bg-amber-500/[0.07] blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-72 w-72 rounded-full bg-orange-500/[0.06] blur-[100px]" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />

      <div className="relative z-10 p-5 md:p-8">
        {/* ─── Header ─── */}
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-gradient-to-br from-amber-400/25 to-orange-500/20 shadow-lg shadow-amber-500/15 ring-1 ring-amber-400/25">
              <FiMessageCircle className="text-xl text-amber-400" />
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 animate-ping rounded-full bg-amber-400/60" />
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-lg font-extrabold tracking-tight text-white md:text-xl">
                  O'yin haqida fikringiz?
                </h3>
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30">
                  <FiStar className="text-[10px] text-[#1a0f0b]" />
                </span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-white/40">
                Sizning fikringiz GameVerse'ni yanada yaxshilaydi
              </p>
            </div>
          </div>

          {/* Summary badge */}
          {loading ? (
            <div className="flex items-center gap-2.5 rounded-[16px] border border-white/[0.06] bg-white/[0.03] px-4 py-2.5">
              <SkeletonLine width="80px" height="14px" />
            </div>
          ) : (
            <div className="group flex items-center gap-3 rounded-[16px] border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 transition-all duration-300 hover:border-amber-400/25 hover:bg-white/[0.06] hover:shadow-lg hover:shadow-amber-500/10">
              <RatingRing value={average} total={totalCount} />
              <div className="flex flex-col">
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-extrabold tracking-tight text-white">
                    {average.toFixed(1)}
                  </span>
                  <span className="text-[10px] font-medium text-white/30">/5</span>
                </div>
                <StarRatingDisplay value={Math.round(average)} size="text-[9px]" />
              </div>
            </div>
          )}
        </div>

        {/* ─── Comments ─── */}
        {loading ? (
          <FeedbackSkeleton />
        ) : comments.length > 0 ? (
          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-gradient-to-br from-amber-400 to-orange-500" />
                </span>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-white/35">
                  So'nggi izohlar
                  <span className="ml-2 rounded-full bg-white/[0.05] px-2 py-0.5 text-[10px] text-white/50">
                    {comments.length}
                  </span>
                </p>
              </div>
              {comments.length > 3 && (
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => scrollComments("left")}
                    aria-label="Chapga"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.03] text-xs text-white/40 transition-all hover:border-amber-400/25 hover:bg-white/[0.06] hover:text-amber-400"
                  >
                    <FiChevronLeft />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollComments("right")}
                    aria-label="O'ngga"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.03] text-xs text-white/40 transition-all hover:border-amber-400/25 hover:bg-white/[0.06] hover:text-amber-400"
                  >
                    <FiChevronRight />
                  </button>
                </div>
              )}
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute -left-2 top-0 z-10 h-full w-8 bg-gradient-to-r from-[#1a0f0b] to-transparent" />
              <div className="pointer-events-none absolute -right-2 top-0 z-10 h-full w-8 bg-gradient-to-l from-[#1a0f0b] to-transparent" />
              <div
                ref={scrollContainerRef}
                className="feedback-scroll -mx-2 overflow-x-auto px-2 pb-3 pt-1"
              >
                <div className="flex min-w-full snap-x snap-mandatory gap-4">
                  {comments.map((item, idx) => (
                    <article
                      key={item.id}
                      className="group/card relative min-h-[170px] w-[280px] shrink-0 snap-start overflow-hidden rounded-[20px] border border-white/[0.06] bg-gradient-to-b from-white/[0.06] to-white/[0.015] p-5 shadow-lg shadow-black/20 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-400/25 hover:bg-white/[0.08] hover:shadow-xl hover:shadow-amber-500/10 sm:w-[300px] lg:w-[280px]"
                      style={{
                        animation: `fadeSlideUp 0.5s ease-out ${idx * 0.07}s both`,
                      }}
                    >
                      {/* Top shine */}
                      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover/card:opacity-100" />

                      {/* Quote mark */}
                      <FaQuoteRight className="pointer-events-none absolute right-4 top-4 text-2xl text-white/[0.04] transition-all duration-300 group-hover/card:text-amber-400/15" />

                      {/* Header */}
                      <div className="relative mb-3 flex items-center gap-3">
                        <FeedbackAvatar
                          username={item.username}
                          avatar={item.avatar}
                          size="md"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-white/90">
                            {item.username || "Teacher"}
                          </p>
                          <p className="mt-0.5 text-[11px] text-white/30">
                            {formatFeedbackDate(item.created_at)}
                          </p>
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] px-2 py-1">
                        <StarRatingDisplay value={item.rating} size="text-[10px]" />
                        <span className="text-[10px] font-bold text-amber-400/80">
                          {item.rating}.0
                        </span>
                      </div>

                      {/* Comment */}
                      <p className="line-clamp-4 text-sm leading-6 text-white/60 transition-colors duration-200 group-hover/card:text-white/75">
                        {item.comment}
                      </p>

                      {/* Bottom accent */}
                      <div className="pointer-events-none absolute bottom-0 left-5 right-5 h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent opacity-0 transition-opacity duration-300 group-hover/card:opacity-100" />
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <EmptyCommentsState />
        )}

        {/* ─── Form ─── */}
        {canShowFeedbackForm && (
          <div className="relative overflow-hidden rounded-[1.75rem] border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-5 shadow-lg shadow-black/10 backdrop-blur-sm md:p-6">
            <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-amber-500/[0.05] blur-[60px]" />

            {/* Header */}
            <div className="relative mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-base font-extrabold tracking-tight text-white">
                  Baholang va izoh qoldiring
                </p>
                <p className="mt-1 text-xs leading-relaxed text-white/35">
                  {user
                    ? "Faqat teacherlar feedback qoldira oladi"
                    : "Feedback yozish uchun tizimga kiring"}
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold ${
                  user
                    ? "border-emerald-400/20 bg-emerald-400/[0.06] text-emerald-300"
                    : "border-white/10 bg-white/[0.04] text-white/45"
                }`}
              >
                <span
                  className={`inline-block h-1.5 w-1.5 rounded-full ${
                    user
                      ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]"
                      : "bg-white/40"
                  }`}
                />
                {user ? "Teacher" : "Guest"}
              </span>
            </div>

            {/* Star rating */}
            <div className="relative mb-5 flex flex-wrap items-center gap-3 rounded-[16px] border border-white/[0.05] bg-white/[0.02] p-3">
              <div
                className="flex items-center gap-1"
                onMouseLeave={() => setHoverRating(0)}
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <div
                    key={`input-star-${star}`}
                    className="relative"
                    onMouseEnter={() => setHoverRating(star)}
                  >
                    <AnimatedStar
                      filled={star <= (hoverRating || ratingInput)}
                      size="text-2xl"
                      delay={star * 0.05}
                      onClick={() => {
                        setRatingInput(star);
                        setError("");
                        setSuccess("");
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="min-w-[60px]">
                {ratingInput ? (
                  <span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-sm font-bold text-transparent">
                    {ratingInput} / 5
                  </span>
                ) : (
                  <span className="text-sm font-medium text-white/35">
                    Baholang
                  </span>
                )}
              </div>
              {ratingInput > 0 && (
                <span className="ml-auto rounded-full bg-amber-400/10 px-2.5 py-1 text-[10px] font-bold text-amber-400 animate-pop-in">
                  {["", "Yomon", "O'rtacha", "Yaxshi", "Zo'r", "Mukammal"][ratingInput]}
                </span>
              )}
            </div>

            {/* Textarea */}
            <div className="relative mb-3">
              <textarea
                ref={textareaRef}
                value={commentInput}
                maxLength={MAX_COMMENT_LENGTH}
                onChange={(e) => {
                  setCommentInput(e.target.value);
                  setError("");
                  setSuccess("");
                }}
                placeholder="O'yin sizga qanday taassurot qoldirdi? Fikringizni yozing..."
                rows={4}
                className="w-full resize-none rounded-[18px] border border-white/[0.06] bg-white/[0.02] px-5 py-4 pb-14 text-sm leading-7 text-white/80 outline-none transition-all duration-200 placeholder:text-white/25 focus:border-amber-400/30 focus:bg-white/[0.04] focus:shadow-[0_0_30px_rgba(251,191,36,0.06)]"
              />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowEmojis((v) => !v)}
                  className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                    showEmojis
                      ? "bg-amber-400/15 text-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.15)]"
                      : "text-white/35 hover:bg-amber-400/10 hover:text-amber-400"
                  }`}
                  aria-label="Emoji qo'shish"
                >
                  {showEmojis ? <FiX /> : <FiSmile className="text-base" />}
                  <span className="hidden sm:inline">Emoji</span>
                </button>

                {/* Circular counter */}
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] font-medium ${
                      charPercent >= 90
                        ? "text-rose-400"
                        : charPercent >= 70
                        ? "text-amber-400"
                        : "text-white/30"
                    }`}
                  >
                    {commentInput.length}/{MAX_COMMENT_LENGTH}
                  </span>
                  <svg
                    className="h-6 w-6 -rotate-90"
                    viewBox="0 0 36 36"
                    aria-hidden="true"
                  >
                    <circle
                      cx="18"
                      cy="18"
                      r="15"
                      fill="none"
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth="2.5"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="15"
                      fill="none"
                      stroke={
                        charPercent >= 90
                          ? "#fb7185"
                          : charPercent >= 70
                          ? "#fbbf24"
                          : "#34d399"
                      }
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeDasharray={`${(charPercent / 100) * 94.2} 94.2`}
                      className="transition-all duration-300"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Emoji picker */}
            {showEmojis && (
              <div className="mb-4 animate-fadeIn rounded-[16px] border border-white/[0.05] bg-gradient-to-r from-[#1f110b] via-[#24150f] to-[#1f110b] p-3 shadow-lg">
                <div className="grid grid-cols-8 gap-1 sm:grid-cols-12">
                  {QUICK_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => addEmoji(emoji)}
                      className="rounded-xl p-1.5 text-xl transition-all duration-200 hover:scale-125 hover:bg-white/10 active:scale-95"
                      aria-label={`${emoji} qo'shish`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Error / Success */}
            {error && (
              <div className="mb-3 flex animate-slideDown items-center gap-2.5 rounded-[14px] border border-rose-400/15 bg-rose-400/[0.06] px-4 py-3 text-sm text-rose-300">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-rose-400/15 text-xs">
                  !
                </span>
                {error}
              </div>
            )}
            {success && (
              <div className="mb-3 flex animate-slideDown items-center gap-2.5 rounded-[14px] border border-emerald-400/15 bg-emerald-400/[0.06] px-4 py-3 text-sm text-emerald-300">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-400/20">
                  <FiCheck className="text-[10px]" strokeWidth={3} />
                </span>
                {success}
              </div>
            )}

            {/* Submit */}
            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={submitting}
              className="group/btn relative mt-2 flex w-full items-center justify-center gap-3 overflow-hidden rounded-[16px] bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 px-6 py-4 text-sm font-extrabold tracking-tight text-[#1a0a04] shadow-[0_12px_40px_-8px_rgba(251,191,36,0.4)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_50px_-8px_rgba(251,191,36,0.55)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-1000 group-hover/btn:translate-x-full" />

              {submitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#1a0a04]/30 border-t-[#1a0a04]" />
                  <span>Yuborilmoqda...</span>
                </>
              ) : (
                <>
                  <FiSend className="text-base transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                  <span>Reyting va izohni yuborish</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* ─── Styles ─── */}
      <style>{`
        .feedback-scroll {
          -ms-overflow-style: none;
          scrollbar-width: none;
          scroll-behavior: smooth;
          cursor: grab;
        }
        .feedback-scroll::-webkit-scrollbar { display: none; }
        .feedback-scroll:active { cursor: grabbing; }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes starPop {
          0%   { transform: scale(0.3) rotate(-15deg); opacity: 0; }
          50%  { transform: scale(1.3) rotate(5deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.7); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes ringProgress {
          from { stroke-dashoffset: 94.2; }
        }

        .animate-shimmer   { animation: shimmer 1.8s infinite; }
        .animate-fadeIn    { animation: fadeIn 0.25s ease-out both; }
        .animate-slideDown { animation: slideDown 0.25s ease-out both; }
        .animate-pop-in    { animation: popIn 0.3s ease-out both; }
      `}</style>
    </section>
  );
}

/* ───────────────────────── Extra components ───────────────────────── */

function RatingRing({ value }: { value: number; total: number }) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const percent = Math.max(0, Math.min(value / 5, 1));
  const offset = circumference * (1 - percent);

  return (
    <div className="relative grid h-11 w-11 shrink-0 place-items-center">
      <svg className="absolute -rotate-90" viewBox="0 0 44 44" aria-hidden="true">
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="3"
        />
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 0.8s ease-out",
            animation: "ringProgress 1s ease-out",
          }}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>
      </svg>
      <FaStar className="relative text-sm text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
    </div>
  );
}

function EmptyCommentsState() {
  return (
    <div className="group mb-8 flex flex-col items-center justify-center gap-3 rounded-[20px] border border-dashed border-white/[0.08] bg-white/[0.015] px-6 py-12 transition-all duration-300 hover:border-amber-400/20 hover:bg-white/[0.03]">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-amber-400/10 blur-2xl transition-all duration-300 group-hover:bg-amber-400/20" />
        <div className="relative grid h-16 w-16 place-items-center rounded-full border border-white/[0.06] bg-white/[0.04] transition-transform duration-300 group-hover:scale-110">
          <FiMessageCircle className="text-2xl text-white/30 transition-colors duration-300 group-hover:text-amber-400/70" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-bold text-white/50 transition-colors duration-300 group-hover:text-white/70">
          Hozircha izohlar yo'q
        </p>
        <p className="mt-1 text-xs text-white/30">
          Birinchi bo'lib fikr qoldiring ✨
        </p>
      </div>
    </div>
  );
}

export default GameFeedbackPanel;