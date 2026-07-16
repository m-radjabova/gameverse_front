import { useEffect, useRef, useState } from "react";
import { FaRegStar, FaStar } from "react-icons/fa";
import {
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiMessageCircle,
  FiSend,
  FiSmile,
  FiStar,
} from "react-icons/fi";

import useContextPro from "../../../hooks/useContextPro";
import useGameFeedback from "../../../hooks/useGameFeedback";
import { hasAnyRole } from "../../../utils/roles";
import { toMediaUrl } from "../../../utils";

type Props = { gameKey: string };

const QUICK_EMOJIS = ["😊", "😍", "🔥", "👏", "🎮", "🧠", "🚀", "💡", "⭐", "❤️", "✨", "🎯", "💪", "🏆", "🌟"];
const MAX_COMMENT_LENGTH = 500;

function formatFeedbackDate(dateString?: string): string {
  if (!dateString) return "";
  const parsed = new Date(dateString);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toLocaleDateString("uz-UZ");
}

function buildAvatar(username?: string | null): string {
  const seed = (username || "teacher").replace(/\s+/g, "-").toLowerCase();
  return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(seed)}`;
}

function getInitial(username?: string | null): string {
  return (username || "Teacher").trim().charAt(0).toUpperCase() || "T";
}

function FeedbackAvatar({
  username,
  avatar,
}: {
  username?: string | null;
  avatar?: string | null;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const src = avatar ? toMediaUrl(avatar) : buildAvatar(username);

  if (imageFailed || !src) {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-yellow-500/25 text-xs font-black text-[#2b160b]">
        {getInitial(username)}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={username || "Teacher"}
      onError={() => setImageFailed(true)}
      className="h-10 w-10 shrink-0 rounded-[14px] object-cover ring-2 ring-white/10 shadow-lg"
    />
  );
}

function AnimatedStar({
  filled,
  size = "text-lg",
  onClick,
  delay = 0,
}: {
  filled: boolean;
  size?: string;
  onClick?: () => void;
  delay?: number;
}) {
  const Comp = filled ? FaStar : FaRegStar;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${size} transition-all duration-300 ease-out hover:scale-125 active:scale-95`}
      style={{
        color: filled ? "#fbbf24" : "rgba(255,255,255,0.2)",
        filter: filled ? "drop-shadow(0 0 8px rgba(251,191,36,0.5))" : "none",
        animation: filled ? `starPop 0.4s ease-out ${delay}s both` : "none",
      }}
    >
      <Comp />
    </button>
  );
}

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

  useEffect(() => {
    if (summary?.my_rating) setRatingInput(summary.my_rating);
  }, [summary?.my_rating]);

  const addEmoji = (emoji: string) => {
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? commentInput.length;
    const end = textarea?.selectionEnd ?? commentInput.length;
    const nextValue = `${commentInput.slice(0, start)}${emoji}${commentInput.slice(end)}`.slice(
      0,
      MAX_COMMENT_LENGTH
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
    if (!user)
      return setError("Iltimos, avval ro'yxatdan o'ting. Keyin comment yozishingiz mumkin.");
    if (!canLeaveFeedback) return setError("Faqat teacher reyting va comment yubora oladi.");
    const comment = commentInput.trim();
    if (!ratingInput || ratingInput < 1 || ratingInput > 5)
      return setError("1 dan 5 gacha reyting bering.");
    if (comment.length < 2) return setError("Comment kamida 2 ta belgidan iborat bo'lsin.");

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
    const scrollAmount = direction === "left" ? -280 : 280;
    el.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  return (
    <section className="feedback-panel relative mb-10 mt-6 overflow-hidden rounded-[2.5rem] border border-white/[0.08] bg-gradient-to-br from-[#1a0f0b]/95 via-[#1c1410]/95 to-[#1a0f0b]/95 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl">
      {/* Subtle ambient glow */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-64 w-64 rounded-full bg-yellow-500/5 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-orange-500/5 blur-[100px]" />

      <div className="relative z-10 p-5 md:p-8">
        {/* ─── Header ─── */}
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-gradient-to-br from-yellow-400/20 to-amber-500/20 shadow-lg shadow-yellow-500/10 ring-1 ring-yellow-400/20">
              <FiMessageCircle className="text-xl text-yellow-400" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-lg font-extrabold tracking-tight text-white md:text-xl">
                  O'yin haqida fikringiz?
                </h3>
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg shadow-yellow-500/30">
                  <FiStar className="text-[10px] text-[#1a0f0b]" />
                </span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-white/40">
                Sizning fikringiz GameVerse'ni yanada yaxshilaydi
              </p>
            </div>
          </div>

          {/* Summary rating badge */}
          <div className="group flex items-center gap-2.5 rounded-[16px] border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 transition-all duration-300 hover:border-yellow-400/20 hover:bg-white/[0.06] hover:shadow-lg hover:shadow-yellow-500/5">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={`summary-star-${star}`}
                  className={`text-xs transition-all duration-300 ${
                    star <= Math.round(average)
                      ? "text-yellow-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.4)]"
                      : "text-white/15"
                  }`}
                />
              ))}
            </div>
            <span className="text-base font-extrabold tracking-tight text-white">
              {average.toFixed(1)}
            </span>
            <span className="text-[11px] font-medium text-white/35">
              ({summary?.ratings_count ?? 0})
            </span>
          </div>
        </div>

        {/* ─── Comments Section ─── */}
        {loading ? (
          <div className="mb-8 flex items-center justify-center rounded-[20px] border border-white/[0.04] bg-white/[0.02] px-6 py-10">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-yellow-400/30 border-t-yellow-400" />
              <span className="text-sm text-white/40">Feedbacklar yuklanmoqda...</span>
            </div>
          </div>
        ) : comments.length > 0 ? (
          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="inline-block h-2 w-2 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 shadow-[0_0_8px_rgba(251,191,36,0.3)]" />
                <p className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-white/35">
                  So'nggi izohlar
                </p>
              </div>
              <div className="flex items-center gap-2">
                {comments.length > 6 && (
                  <span className="text-[10px] text-white/25">Yon tomonga suring →</span>
                )}
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => scrollComments("left")}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.03] text-xs text-white/40 transition hover:border-white/10 hover:bg-white/[0.06] hover:text-white/70"
                  >
                    <FiChevronLeft />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollComments("right")}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.03] text-xs text-white/40 transition hover:border-white/10 hover:bg-white/[0.06] hover:text-white/70"
                  >
                    <FiChevronRight />
                  </button>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute -left-2 top-0 z-10 h-full w-6 bg-gradient-to-r from-[#1a0f0b] to-transparent" />
              <div className="pointer-events-none absolute -right-2 top-0 z-10 h-full w-6 bg-gradient-to-l from-[#1a0f0b] to-transparent" />
              <div
                ref={scrollContainerRef}
                className="feedback-scroll -mx-2 overflow-x-auto px-2 pb-2"
              >
                <div className="flex min-w-full snap-x snap-mandatory gap-4">
                  {comments.map((item, idx) => (
                    <article
                      key={item.id}
                      className="group/card min-h-[160px] w-[calc((100%-0rem)/1.15)] shrink-0 snap-start rounded-[20px] border border-white/[0.06] bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-5 shadow-lg shadow-black/10 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-yellow-400/20 hover:bg-white/[0.08] hover:shadow-xl hover:shadow-yellow-500/5 sm:w-[300px] lg:w-[270px]"
                      style={{
                        animation: `fadeSlideUp 0.5s ease-out ${idx * 0.06}s both`,
                      }}
                    >
                      {/* Card top: avatar + rating */}
                      <div className="mb-3.5 flex items-center gap-3">
                        <FeedbackAvatar username={item.username} avatar={item.avatar} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-white/90">
                            {item.username || "Teacher"}
                          </p>
                          <p className="mt-0.5 text-[11px] text-white/30">
                            {formatFeedbackDate(item.created_at)}
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <FaStar
                              key={`${item.id}-star-${star}`}
                              className={`text-[10px] transition-all duration-200 ${
                                star <= item.rating
                                  ? "text-yellow-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.3)]"
                                  : "text-white/10"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Card comment */}
                      <p className="line-clamp-4 text-sm leading-6 text-white/60 group-hover/card:text-white/70 transition-colors duration-200">
                        {item.comment}
                      </p>

                      {/* Card shimmer line */}
                      <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent opacity-0 transition-opacity duration-300 group-hover/card:opacity-100" />
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="group mb-8 flex flex-col items-center justify-center gap-2 rounded-[20px] border border-dashed border-white/[0.06] bg-white/[0.02] px-6 py-10 transition-all duration-300 hover:border-yellow-400/15 hover:bg-white/[0.035]">
            <span className="text-2xl opacity-40 transition-opacity duration-300 group-hover:opacity-60">
              💬
            </span>
            <p className="text-sm text-white/30 transition-colors duration-300 group-hover:text-white/40">
              Hozircha izohlar yo'q. Birinchi bo'lib fikr qoldiring ✨
            </p>
          </div>
        )}

        {/* ─── Feedback Form ─── */}
        {canShowFeedbackForm && (
          <div className="rounded-[1.75rem] border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-5 shadow-lg shadow-black/10 backdrop-blur-sm md:p-6">
            {/* Form header */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
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
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold text-white/45">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-yellow-400/60 shadow-[0_0_6px_rgba(251,191,36,0.3)]" />
                {user ? "Teacher" : "Guest"}
              </span>
            </div>

            {/* Star rating */}
            <div className="mb-5 inline-flex flex-wrap items-center gap-1 rounded-[16px] border border-white/[0.05] bg-white/[0.02] p-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <div
                    key={`input-star-${star}`}
                    className="relative"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
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
                    {/* Glow on hover */}
                    {star <= (hoverRating || ratingInput) && (
                      <div className="pointer-events-none absolute inset-0 rounded-full bg-yellow-400/10 blur-lg transition-opacity duration-300" />
                    )}
                  </div>
                ))}
              </div>
              <div className="ml-2 mr-1 h-8 w-px bg-white/10" />
              <span className="min-w-[55px] text-center text-sm font-bold tracking-tight">
                {ratingInput ? (
                  <span className="bg-gradient-to-r from-yellow-300 to-amber-400 bg-clip-text text-transparent">
                    {ratingInput}/5
                  </span>
                ) : (
                  <span className="text-white/35">Baho</span>
                )}
              </span>
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
                className="w-full resize-none rounded-[18px] border border-white/[0.06] bg-white/[0.02] px-5 py-4 pb-12 text-sm leading-7 text-white/80 outline-none transition-all duration-200 placeholder:text-white/25 focus:border-yellow-400/30 focus:bg-white/[0.04] focus:shadow-[0_0_30px_rgba(251,191,36,0.04)]"
              />
              {/* Textarea bottom bar */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowEmojis((value) => !value)}
                  className={`rounded-xl p-2 transition-all duration-200 hover:bg-yellow-400/10 ${
                    showEmojis
                      ? "text-yellow-400 shadow-[0_0_12px_rgba(251,191,36,0.15)]"
                      : "text-white/35 hover:text-yellow-400"
                  }`}
                  aria-label="Emoji qo'shish"
                >
                  <FiSmile className="text-xl" />
                </button>
                <span className="text-[11px] font-medium text-white/25">
                  {commentInput.length}/{MAX_COMMENT_LENGTH}
                </span>
              </div>
            </div>

            {/* Emoji picker */}
            {showEmojis && (
              <div className="mb-4 flex animate-fadeIn flex-wrap gap-2 rounded-[16px] border border-white/[0.05] bg-gradient-to-r from-[#1f110b] via-[#24150f] to-[#1f110b] p-3 shadow-lg">
                {QUICK_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => addEmoji(emoji)}
                    className="rounded-xl p-2 text-xl transition-all duration-200 hover:scale-125 hover:bg-white/10 hover:shadow-[0_0_16px_rgba(255,255,255,0.06)] active:scale-95"
                    aria-label={`${emoji} qo'shish`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            {/* Messages */}
            {error && (
              <div className="mb-3 flex items-center gap-2.5 rounded-[14px] border border-red-400/10 bg-red-400/5 px-4 py-3 text-sm text-red-300 shadow-lg shadow-red-500/5">
                <span className="shrink-0 text-base">⚠️</span>
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="mb-3 flex items-center gap-2.5 rounded-[14px] border border-emerald-400/10 bg-emerald-400/5 px-4 py-3 text-sm text-emerald-300 shadow-lg shadow-emerald-500/5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/20">
                  <FiCheck className="text-[10px] text-emerald-400" />
                </span>
                <span>{success}</span>
              </div>
            )}

            {/* Submit button */}
            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={submitting}
              className="group/btn relative mt-2 flex w-full items-center justify-center gap-3 overflow-hidden rounded-[16px] bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 px-6 py-4 text-sm font-extrabold tracking-tight text-[#1a0a04] shadow-[0_12px_40px_-8px_rgba(251,191,36,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_50px_-8px_rgba(251,191,36,0.45)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {/* Button shine */}
              <div className="pointer-events-none absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all duration-700 group-hover/btn:left-full" />

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
        .feedback-scroll::-webkit-scrollbar {
          display: none;
        }
        .feedback-scroll:active {
          cursor: grabbing;
        }

        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes starPop {
          0% {
            transform: scale(0.3) rotate(-15deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.3) rotate(5deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out both;
        }
      `}</style>
    </section>
  );
}

export default GameFeedbackPanel;