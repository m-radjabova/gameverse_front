import { useEffect, useState } from "react";
import { FaRegStar, FaStar } from "react-icons/fa";

import {
  fetchGameComments,
  fetchGameRatingSummary,
  submitMyGameFeedback,
} from "../../../apiClient/gameFeedback";
import useContextPro from "../../../hooks/useContextPro";
import type { GameComment, GameRatingSummary } from "../../../types/types";
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

function GameFeedbackPanel({ gameKey }: Props) {
  const {
    state: { user },
  } = useContextPro();

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<GameRatingSummary | null>(null);
  const [comments, setComments] = useState<GameComment[]>([]);
  const [ratingInput, setRatingInput] = useState(0);
  const [commentInput, setCommentInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canLeaveFeedback = hasAnyRole(user, ["teacher"]);

  const reload = async () => {
    setLoading(true);
    const [summaryData, commentsData] = await Promise.all([
      fetchGameRatingSummary(gameKey),
      fetchGameComments(gameKey),
    ]);
    setSummary(summaryData);
    setComments(commentsData);
    if (summaryData?.my_rating) setRatingInput(summaryData.my_rating);
    setLoading(false);
  };

  useEffect(() => {
    void reload();
  }, [gameKey]);

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

    setSubmitting(true);
    setError("");
    setSuccess("");

    const ok = await submitMyGameFeedback(gameKey, { rating, comment });
    if (!ok) {
      setSubmitting(false);
      setError("Yuborishda xatolik. Qayta urinib ko'ring.");
      return;
    }

    await reload();
    setSubmitting(false);
    setSuccess("Saqlandi.");
    setCommentInput("");
  };

  return (
    <section className="mb-8 rounded-2xl border border-white/15 bg-black/30 p-4 backdrop-blur-sm md:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-black uppercase tracking-wide text-white/80">Reyting va Izohlar</h3>
        <p className="text-xs font-semibold text-white/75">
          {(summary?.average_rating ?? 0).toFixed(1)} / 5 ({summary?.ratings_count ?? 0})
        </p>
      </div>

      <div className="mb-4 flex items-center gap-1">
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
        <div className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-2">
          {comments.slice(0, 6).map((item) => (
            <article key={item.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="mb-2 flex items-center gap-2">
                <img
                  src={item.avatar ? toMediaUrl(item.avatar) : buildAvatar(item.username)}
                  alt={item.username || "Teacher"}
                  className="h-8 w-8 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-white/85">{item.username || "Teacher"}</p>
                  <p className="text-[11px] text-white/50">{formatFeedbackDate(item.created_at)}</p>
                </div>
              </div>
              <div className="mb-1 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={`${item.id}-star-${star}`}
                    className={`text-[10px] ${star <= item.rating ? "text-yellow-300" : "text-white/20"}`}
                  />
                ))}
              </div>
              <p className="text-xs leading-5 text-white/75">{item.comment}</p>
            </article>
          ))}
        </div>
      ) : (
        <p className="mb-4 text-xs text-white/60">Hozircha comment yo'q.</p>
      )}

      {canLeaveFeedback && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-white/70">Teacher feedback</p>

          <div className="mb-2 flex items-center gap-1">
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
                  className="rounded p-1 hover:scale-110"
                >
                  {selected ? (
                    <FaStar className="text-base text-yellow-300" />
                  ) : (
                    <FaRegStar className="text-base text-white/45" />
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
            className="w-full resize-none rounded-lg border border-white/15 bg-black/35 px-3 py-2 text-xs text-white outline-none placeholder:text-white/40 focus:border-yellow-300/60"
          />

          {error && <p className="mt-2 text-xs text-red-300">{error}</p>}
          {success && <p className="mt-2 text-xs text-emerald-300">{success}</p>}

          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={submitting}
            className="w-full relative mt-8 mb-2 overflow-hidden rounded-full border-2 border-[#ffe24d] bg-gradient-to-b from-[#ffd966] to-[#ffb347] px-12 py-4 text-lg font-black tracking-wider text-[#1a1a1a] shadow-[0_12px_0_0_rgba(230,126,34,0.95),0_15px_25px_rgba(0,0,0,0.2)] transition-all hover:translate-y-1 hover:shadow-[0_10px_0_0_rgba(230,126,34,0.95)] active:translate-y-3 active:shadow-[0_8px_0_0_rgba(230,126,34,0.95)] animate-fade-in-up"
          >
            {submitting ? "Yuborilmoqda..." : "Reyting va comment yuborish"}
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-0 transition-transform duration-700 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12" />
            
          </button>
        </div>
      )}
    </section>
  );
}

export default GameFeedbackPanel;
