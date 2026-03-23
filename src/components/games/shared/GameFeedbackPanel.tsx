import { useEffect, useState } from "react";
import { FaRegStar, FaStar } from "react-icons/fa";

import useContextPro from "../../../hooks/useContextPro";
import useGameFeedback from "../../../hooks/useGameFeedback";
import { hasAnyRole } from "../../../utils/roles";
import { toMediaUrl } from "../../../utils";

type Props = {
  gameKey: string;
};

function formatFeedbackDate(dateString?: string): string {
  if (!dateString) return "";
  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString("uz-UZ");
}

function buildAvatar(username?: string | null): string {
  const seed = (username || "teacher").replace(/\s+/g, "-").toLowerCase();
  return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(seed)}`;
}

function getInitial(username?: string | null): string {
  const value = (username || "Teacher").trim();
  return value.charAt(0).toUpperCase() || "T";
}

function FeedbackAvatar({ username, avatar }: { username?: string | null; avatar?: string | null }) {
  const [imageFailed, setImageFailed] = useState(false);
  const src = avatar ? toMediaUrl(avatar) : buildAvatar(username);

  if (imageFailed || !src) {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 text-xs font-black text-[#3a2216]">
        {getInitial(username)}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={username || "Teacher"}
      onError={() => setImageFailed(true)}
      className="h-8 w-8 rounded-full object-cover"
    />
  );
}

function GameFeedbackPanel({ gameKey }: Props) {
  const {
    state: { user },
  } = useContextPro();
  const { loading, summary, comments, submitting, submitFeedback } = useGameFeedback(gameKey);
  const [ratingInput, setRatingInput] = useState(0);
  const [commentInput, setCommentInput] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canLeaveFeedback = hasAnyRole(user, ["teacher"]);
  const hasOverflowComments = comments.length > 6;

  useEffect(() => {
    if (summary?.my_rating) {
      setRatingInput(summary.my_rating);
    }
  }, [summary?.my_rating]);

  const handleSubmit = async () => {
    if (!canLeaveFeedback) {
      setError("Faqat teacher reyting va comment yubora oladi.");
      return;
    }

    const rating = ratingInput;
    const comment = commentInput.trim();

    if (!rating || rating < 1 || rating > 5) {
      setError("1 dan 5 gacha reyting bering.");
      return;
    }
    if (comment.length < 2) {
      setError("Comment kamida 2 ta belgidan iborat bo'lsin.");
      return;
    }

    setError("");
    setSuccess("");

    const ok = await submitFeedback({ rating, comment });
    if (!ok) {
      setError("Yuborishda xatolik. Qayta urinib ko'ring.");
      return;
    }

    setSuccess("Izoh yuborildi. Admin tasdiqlagandan keyin ko'rinadi.");
    setCommentInput("");
  };

  return (
    <section className="mb-8 mt-4 overflow-hidden rounded-[1.75rem] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] p-4 shadow-[0_24px_60px_rgba(0,0,0,0.18)] backdrop-blur-md md:p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.24em] text-white/90">Reyting va Izohlar</h3>
          <p className="mt-1 text-xs text-white/50">O'yin bo'yicha teacher feedbacklari va umumiy baho</p>
        </div>
        <p className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/75">
          {(summary?.average_rating ?? 0).toFixed(1)} / 5 ({summary?.ratings_count ?? 0})
        </p>
      </div>

      <div className="mb-4 flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={`summary-star-${star}`}
            className={`text-sm ${
              star <= Math.round(summary?.average_rating ?? 0) ? "text-yellow-300" : "text-white/25"
            }`}
          />
        ))}
      </div>

      {loading ? (
        <p className="mb-4 text-xs text-white/60">Feedback yuklanmoqda...</p>
      ) : comments.length ? (
        <div className="mb-5">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/45">
              So'nggi izohlar
            </p>
            {hasOverflowComments ? (
              <p className="text-[11px] text-white/40">Yana ko'rish uchun yon tomonga suring</p>
            ) : null}
          </div>
          <div className="relative">
            {hasOverflowComments ? (
              <>
                <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 rounded-l-2xl bg-gradient-to-r from-[rgba(27,14,10,0.92)] via-[rgba(27,14,10,0.55)] to-transparent" />
                <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 rounded-r-2xl bg-gradient-to-l from-[rgba(27,14,10,0.92)] via-[rgba(27,14,10,0.55)] to-transparent" />
              </>
            ) : null}
            <div className="feedback-scroll -mx-1 overflow-x-auto px-1 pb-1">
              <div className="flex min-w-full snap-x snap-mandatory gap-3">
              {comments.map((item) => (
                <article
                  key={item.id}
                  className="min-h-[148px] w-[calc((100%-0rem)/1.15)] shrink-0 snap-start rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-transform duration-200 hover:-translate-y-0.5 sm:w-[280px] lg:w-[240px] xl:w-[210px]"
                >
                  <div className="mb-3 flex items-center gap-2.5">
                    <FeedbackAvatar username={item.username} avatar={item.avatar} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-white/90">{item.username || "Teacher"}</p>
                      <p className="text-[11px] text-white/45">{formatFeedbackDate(item.created_at)}</p>
                    </div>
                  </div>
                  <div className="mb-2 flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={`${item.id}-star-${star}`}
                        className={`text-[11px] ${star <= item.rating ? "text-yellow-300" : "text-white/20"}`}
                      />
                    ))}
                  </div>
                  <p className="line-clamp-4 text-xs leading-5 text-white/72">{item.comment}</p>
                </article>
              ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="mb-4 text-xs text-white/60">Hozircha comment yo'q.</p>
      )}

      {canLeaveFeedback && (
        <div className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/72">Teacher feedback</p>
            <span className="rounded-full border border-white/10 bg-black/15 px-2.5 py-1 text-[11px] text-white/45">
              Baho + izoh
            </span>
          </div>

          <div className="mb-3 flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => {
              const selected = star <= ratingInput;
              return (
                <button
                  key={`input-star-${star}`}
                  type="button"
                  onClick={() => {
                    setRatingInput(star);
                    setError("");
                    setSuccess("");
                  }}
                  className="rounded-xl border border-transparent bg-white/0 p-2 transition hover:scale-110 hover:border-white/10 hover:bg-white/5"
                >
                  {selected ? (
                    <FaStar className="text-lg text-yellow-300" />
                  ) : (
                    <FaRegStar className="text-lg text-white/45" />
                  )}
                </button>
              );
            })}
          </div>

          <textarea
            value={commentInput}
            onChange={(e) => {
              setCommentInput(e.target.value);
              setError("");
              setSuccess("");
            }}
            placeholder="Comment yozing(sizning fikringiz biz uchun muhim)..."
            rows={3}
            className="w-full resize-none rounded-2xl border border-white/12 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-yellow-300/60 focus:bg-black/25"
          />

          {error && <p className="mt-2 text-xs text-red-300">{error}</p>}
          {success && <p className="mt-2 text-xs text-emerald-300">{success}</p>}

          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={submitting}
            className="mt-5 w-full rounded-2xl border border-yellow-300/60 bg-gradient-to-r from-yellow-300 via-amber-300 to-orange-300 px-5 py-3.5 text-sm font-black uppercase tracking-[0.18em] text-[#2b160b] shadow-[0_12px_30px_rgba(255,191,64,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(255,191,64,0.28)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Yuborilmoqda..." : "Reyting va comment yuborish"}
          </button>
        </div>
      )}
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
      `}</style>
    </section>
  );
}

export default GameFeedbackPanel;
