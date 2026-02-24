import { FaStar, FaQuoteRight, FaRegSmile, FaRegHeart, FaRegCommentDots } from "react-icons/fa";
import { FiMoreHorizontal } from "react-icons/fi";
import { GiCrown, GiSparkles, GiPartyPopper } from "react-icons/gi";
import { useMemo, useState, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

import { fetchRecentGameComments } from "../../apiClient/gameFeedback";
import { gameCards } from "../../pages/games/data";
import type { GameCommentOut } from "../../types/types";
import { toMediaUrl } from "../../utils";

type CommentItem = {
  id: string;
  fullName: string;
  game: string;
  rating: number;
  comment: string;
  avatar: string;
  likes: number;
  timeAgo: string;
};

function timeAgoFromISO(value?: string): string {
  if (!value) return "hozir";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "hozir";

  const diffMs = Date.now() - date.getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "hozir";
  if (min < 60) return `${min} daqiqa oldin`;

  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours} soat oldin`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} kun oldin`;

  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} hafta oldin`;

  const months = Math.floor(days / 30);
  return `${Math.max(1, months)} oy oldin`;
}

function buildAvatar(username?: string | null): string {
  const seed = (username || "teacher").replace(/\s+/g, "-").toLowerCase();
  return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(seed)}`;
}

function CommentsSection() {
  const [likedComments, setLikedComments] = useState<string[]>([]);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const gameTitleByKey = useMemo(
    () => Object.fromEntries(gameCards.map((g) => [g.id, g.title])),
    [],
  );

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: "ease-out-cubic",
    });
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadComments = async () => {
      setLoading(true);
      const rows = await fetchRecentGameComments(60);
      if (!mounted) return;

      const next: CommentItem[] = rows
        .filter((item: GameCommentOut) => item.rating === 5)
        .slice(0, 6)
        .map((item: GameCommentOut, index) => ({
          id: item.id,
          fullName: item.username || "Teacher",
          game: gameTitleByKey[item.game_key] || item.game_key,
          rating: item.rating,
          comment: item.comment,
          avatar: item.avatar ? toMediaUrl(item.avatar) : buildAvatar(item.username),
          likes: item.rating * 6 + (index % 5) + 8,
          timeAgo: timeAgoFromISO(item.created_at),
        }));

      setComments(next);
      setLoading(false);
      AOS.refresh();
    };

    void loadComments();

    return () => {
      mounted = false;
    };
  }, [gameTitleByKey]);

  const handleLike = (id: string) => {
    setLikedComments((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const averageRating = comments.length
    ? comments.reduce((sum, item) => sum + item.rating, 0) / comments.length
    : 0;

  return (
    <section
      id="comments"
      className="relative overflow-hidden bg-gradient-to-br from-[#0f0c1f] via-[#1a1a2e] to-[#16213e] py-20 lg:py-28"
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-[10%] animate-float-slow">
          <GiSparkles className="text-6xl text-[#ffd966]/10" />
        </div>
        <div className="absolute bottom-20 right-[15%] animate-float">
          <GiCrown className="text-7xl text-[#ffb347]/10" />
        </div>
        <div className="absolute top-1/3 right-[5%] animate-pulse-slow">
          <GiPartyPopper className="text-8xl text-[#d42d73]/10" />
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20">
          <div className="relative h-[800px] w-[800px]">
            <div className="absolute inset-0 animate-spin-slow rounded-full border-4 border-white/5" />
            <div className="absolute inset-32 animate-spin-slower rounded-full border-2 border-white/10" />
            <div className="absolute inset-64 animate-pulse rounded-full border border-white/20" />
          </div>
        </div>

        <div className="absolute top-0 -left-20 h-96 w-96 animate-blob rounded-full bg-[#d42d73] opacity-20 mix-blend-multiply blur-3xl filter" />
        <div className="animation-delay-2000 absolute top-0 -right-20 h-96 w-96 animate-blob rounded-full bg-[#ffb347] opacity-20 mix-blend-multiply blur-3xl filter" />
        <div className="animation-delay-4000 absolute bottom-0 left-20 h-96 w-96 animate-blob rounded-full bg-[#4f46e5] opacity-20 mix-blend-multiply blur-3xl filter" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center lg:mb-16" data-aos="fade-down">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-2 backdrop-blur-sm">
            <GiSparkles className="animate-pulse text-[#ffd966]" />
            <span className="text-xs font-black tracking-[0.2em] text-white/80">FOYDALANUVCHILAR FIKRI</span>
            <GiSparkles className="animate-pulse text-[#ffb347]" />
          </div>

          <h2 className="mb-4 font-bebas text-5xl leading-none text-white sm:text-6xl lg:text-7xl">
            NIMA UCHUN BIZNI
            <span className="block bg-gradient-to-r from-[#ffd966] to-[#ffb347] bg-clip-text text-transparent">
              TANLASHADI?
            </span>
          </h2>

          <p className="mx-auto max-w-2xl text-sm text-white/60" data-aos="fade-up" data-aos-delay="200">
            Teacherlar tomonidan yozilgan real izohlar backenddan yuklanmoqda
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-8" data-aos="fade-up" data-aos-delay="300">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#ffd966] to-[#ffb347]">
                <FaRegSmile className="text-[#1a1a2e]" />
              </div>
              <div className="text-left">
                <p className="text-lg font-bold text-white">{comments.length}+</p>
                <p className="text-xs text-white/60">Real izohlar</p>
              </div>
            </div>
            <div className="hidden h-8 w-px bg-white/20 sm:block" />
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#ffd966] to-[#ffb347]">
                <FaStar className="text-[#1a1a2e]" />
              </div>
              <div className="text-left">
                <p className="text-lg font-bold text-white">{averageRating.toFixed(1)}</p>
                <p className="text-xs text-white/60">O'rtacha reyting</p>
              </div>
            </div>
            <div className="hidden h-8 w-px bg-white/20 sm:block" />
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#ffd966] to-[#ffb347]">
                <FaRegCommentDots className="text-[#1a1a2e]" />
              </div>
              <div className="text-left">
                <p className="text-lg font-bold text-white">{Math.max(0, comments.length - 1)}+</p>
                <p className="text-xs text-white/60">Faol sharhlar</p>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-10 text-center text-sm text-white/70">Izohlar yuklanmoqda...</div>
        ) : comments.length === 0 ? (
          <div className="py-10 text-center text-sm text-white/70">Hozircha izohlar yo'q.</div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {comments.map((item, index) => (
                <article
                  key={item.id}
                  className="group relative"
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                >
                  <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-[#ffd966] to-[#ffb347] opacity-0 blur transition-opacity duration-500 group-hover:opacity-30" />

                  <div className="relative rounded-2xl border border-white/20 bg-gradient-to-br from-white/10 to-white/5 p-6 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-white/30">
                    <div className="absolute -top-2 -right-2 rotate-12 transform rounded-full bg-gradient-to-r from-[#ffd966] to-[#ffb347] p-2 shadow-lg transition-transform duration-500 group-hover:rotate-0">
                      <FaQuoteRight className="text-xs text-[#1a1a2e]" />
                    </div>

                    <div className="mb-4 flex items-start gap-3">
                      <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#ffd966] to-[#ffb347] opacity-50 blur-md transition-opacity group-hover:opacity-100" />
                        <img
                          src={item.avatar}
                          alt={item.fullName}
                          className="relative h-12 w-12 rounded-full border-2 border-white/20 object-cover transition-all group-hover:border-white/40"
                        />
                        <div className="absolute -right-1 -bottom-1 h-4 w-4 animate-pulse rounded-full border-2 border-[#1a1a2e] bg-emerald-500" />
                      </div>
                      <div className="flex-1">
                        <h3 className="flex items-center gap-1 text-sm font-bold text-white">
                          {item.fullName}
                          {item.rating === 5 && <GiCrown className="text-xs text-[#ffd966]" />}
                        </h3>
                        <p className="text-xs font-semibold text-[#ffb347]">{item.game}</p>
                        <p className="mt-0.5 text-[10px] text-white/40">{item.timeAgo}</p>
                      </div>
                    </div>

                    <div className="mb-3 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <FaStar
                          key={i}
                          className={`transition-all duration-300 ${
                            i < item.rating
                              ? "text-[#ffd966] drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]"
                              : "text-white/20"
                          }`}
                          size={14}
                        />
                      ))}
                    </div>

                    <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-white/80">"{item.comment}"</p>

                    <div className="flex items-center justify-between border-t border-white/10 pt-3">
                      <button onClick={() => handleLike(item.id)} className="group/btn flex items-center gap-1.5">
                        <FaRegHeart
                          className={`transition-all duration-300 ${
                            likedComments.includes(item.id)
                              ? "scale-110 text-[#ff4d4d]"
                              : "text-white/40 group-hover/btn:scale-110 group-hover/btn:text-[#ff4d4d]"
                          }`}
                          size={14}
                        />
                        <span className="text-xs text-white/40 transition-colors group-hover/btn:text-white/60">
                          {item.likes + (likedComments.includes(item.id) ? 1 : 0)}
                        </span>
                      </button>

                      <button className="text-white/40 transition-colors hover:text-white/60">
                        <FiMoreHorizontal size={16} />
                      </button>
                    </div>

                    <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-t from-transparent via-transparent to-white/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  </div>
                </article>
              ))}
            </div>

          </>
        )}
      </div>
    </section>
  );
}

export default CommentsSection;
