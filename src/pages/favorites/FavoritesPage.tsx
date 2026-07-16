import { useEffect, useMemo, useState } from "react";
import {
  FaHeart,
  FaGamepad,
  FaSearch,
  FaArrowLeft,
  FaStar,
  FaFire,
  FaTrophy,
} from "react-icons/fa";
import { GiFlowerTwirl } from "react-icons/gi";
import { useNavigate } from "react-router-dom";
import GameShowcaseCard from "../../components/main/GameShowcaseCard";
import { gameCards } from "../games/data";
import {
  getFavoriteGameIds,
  subscribeFavoriteGames,
  toggleFavoriteGame,
} from "../../utils/gameFavorites";
import useHomeTheme from "../../hooks/useHomeTheme";

export default function FavoritesPage() {
  const navigate = useNavigate();
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const isDarkMode = useHomeTheme();

  useEffect(() => {
    setFavoriteIds(getFavoriteGameIds());
    return subscribeFavoriteGames(setFavoriteIds);
  }, []);

  const favoriteGames = useMemo(
    () => gameCards.filter((game) => game.available && favoriteIds.includes(game.id)),
    [favoriteIds]
  );

  const handleLikeToggle = (gameId: string) => {
    setFavoriteIds(toggleFavoriteGame(gameId));
  };

  return (
    <section
      data-home-theme={isDarkMode ? "dark" : "light"}
      className={`relative min-h-screen overflow-hidden px-3 pb-16 pt-24 transition-colors duration-500 sm:px-6 sm:pb-20 sm:pt-28 lg:px-8 ${
        isDarkMode
          ? "bg-[radial-gradient(circle_at_top,#1b2a41_0%,#111827_42%,#0f172a_100%)]"
          : "bg-[radial-gradient(circle_at_top,#ffffff_0%,#f6fcff_45%,#fff8ef_100%)]"
      }`}
    >
      {/* ── Decorative background blobs ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Large blob top-right */}
        <div
          className={`absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full opacity-[0.08] blur-3xl sm:h-[600px] sm:w-[600px] ${
            isDarkMode
              ? "bg-[radial-gradient(circle,#59b9e6_0%,transparent_70%)]"
              : "bg-[radial-gradient(circle,#ffd15d_0%,transparent_70%)]"
          }`}
        />
        {/* Medium blob bottom-left */}
        <div
          className={`absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full opacity-[0.06] blur-3xl sm:h-[500px] sm:w-[500px] ${
            isDarkMode
              ? "bg-[radial-gradient(circle,#ffd15d_0%,transparent_70%)]"
              : "bg-[radial-gradient(circle,#59b9e6_0%,transparent_70%)]"
          }`}
        />
        {/* Small floating dots pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 24px 24px, ${
              isDarkMode ? "#59b9e6" : "#59b9e6"
            } 2px, transparent 2px)`,
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* ════════════════════════════════════════
             HEADER
           ════════════════════════════════════════ */}
        <div className="mb-8 sm:mb-12">
          {/* Back button */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            className={`mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] transition-all hover:-translate-x-0.5 ${
              isDarkMode
                ? "text-[#a1a1aa] hover:bg-white/5 hover:text-white"
                : "text-[#6d7aa6] hover:bg-black/5 hover:text-[#203572]"
            }`}
          >
            <FaArrowLeft className="text-[10px]" />
            Orqaga
          </button>

          {/* Title row */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-center gap-4">
              {/* Icon circle */}
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-gradient-to-br shadow-lg sm:h-16 sm:w-16 sm:rounded-[22px] ${
                  isDarkMode
                    ? "from-[#59b9e6]/30 to-[#ffd15d]/20 shadow-[#59b9e6]/20"
                    : "from-[#59b9e6]/20 to-[#ffd15d]/20 shadow-[#59b9e6]/16"
                }`}
              >
                <FaHeart className="text-xl text-[#ff6b8a] sm:text-2xl" />
              </div>

              <div>
                <h1
                  className={`text-3xl font-black leading-tight sm:text-4xl lg:text-5xl ${
                    isDarkMode ? "text-white" : "text-[#203572]"
                  }`}
                >
                  Sevimli o'yinlar
                </h1>
                <p
                  className={`mt-1.5 text-sm font-medium sm:text-base ${
                    isDarkMode ? "text-[#a1a1aa]" : "text-[#6d7aa6]"
                  }`}
                >
                  Eng sevimli o'yinlaringiz bir joyda
                </p>
              </div>
            </div>

            {/* Stats badge */}
            {favoriteGames.length > 0 && (
              <div
                className={`inline-flex items-center gap-3 rounded-[20px] border px-5 py-3 backdrop-blur-sm ${
                  isDarkMode
                    ? "border-[#2b3146] bg-[#1a1a28]/60"
                    : "border-[#d8eef7] bg-white/70"
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-[14px] bg-gradient-to-br ${
                    isDarkMode
                      ? "from-[#59b9e6]/20 to-[#ffd15d]/20"
                      : "from-[#59b9e6]/20 to-[#ffd15d]/20"
                  }`}
                >
                  <FaGamepad
                    className={`text-sm ${isDarkMode ? "text-[#59b9e6]" : "text-[#59b9e6]"}`}
                  />
                </div>
                <div>
                  <p
                    className={`text-[10px] font-bold uppercase tracking-[0.18em] ${
                      isDarkMode ? "text-[#a1a1aa]" : "text-[#6d7aa6]"
                    }`}
                  >
                    Jami
                  </p>
                  <p
                    className={`text-lg font-black ${
                      isDarkMode ? "text-white" : "text-[#203572]"
                    }`}
                  >
                    {favoriteGames.length}{" "}
                    <span className="text-xs font-semibold">
                      {favoriteGames.length === 1 ? "o'yin" : "o'yin"}
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ════════════════════════════════════════
             GAMES GRID
           ════════════════════════════════════════ */}
        {favoriteGames.length > 0 ? (
          <>
            {/* Mini stats row */}
            <div
              className={`mb-6 flex flex-wrap items-center gap-3 rounded-[20px] border px-5 py-3 text-xs font-semibold backdrop-blur-sm sm:gap-4 sm:px-6 ${
                isDarkMode
                  ? "border-[#2b3146] bg-[#1a1a28]/40 text-[#a1a1aa]"
                  : "border-[#d8eef7] bg-white/50 text-[#6d7aa6]"
              }`}
            >
              <span className="inline-flex items-center gap-1.5">
                <FaStar className="text-[10px] text-[#ffd15d]" />
                Sevimlilar
              </span>
              <span className="inline-flex items-center gap-1.5">
                <FaFire className="text-[10px] text-[#ff6b8a]" />
                Top o'yinlar
              </span>
              <span className="inline-flex items-center gap-1.5">
                <FaTrophy className="text-[10px] text-[#59b9e6]" />
                {favoriteGames.length} ta o'yin
              </span>
            </div>

            {/* Grid */}
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
              {favoriteGames.map((game, index) => (
                <div key={game.id} data-aos="fade-up" data-aos-delay={100 + index * 60}>
                  <GameShowcaseCard
                    game={game}
                    isDark={isDarkMode}
                    isLiked
                    onLikeToggle={handleLikeToggle}
                    onOpen={(path) => navigate(path)}
                    priorityLabel={`Sevimli ${index + 1}`}
                  />
                </div>
              ))}
            </div>
          </>
        ) : (
          /* ════════════════════════════════════════
               EMPTY STATE
             ════════════════════════════════════════ */
          <div className="flex items-center justify-center py-8 sm:py-12">
            <div className="w-full max-w-lg">
              <div
                className={`relative overflow-hidden rounded-[32px] border p-8 text-center backdrop-blur-md sm:p-12 ${
                  isDarkMode
                    ? "border-[var(--home-surface-border)] bg-[var(--home-surface-bg-soft)]"
                    : "border-[var(--home-surface-border)] bg-white/80"
                }`}
              >
                {/* Decorative gradient orb inside card */}
                <div
                  className={`pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full opacity-[0.06] blur-3xl ${
                    isDarkMode
                      ? "bg-[radial-gradient(circle,#59b9e6_0%,transparent_70%)]"
                      : "bg-[radial-gradient(circle,#ffd15d_0%,transparent_70%)]"
                  }`}
                />

                {/* Animated heart icon container */}
                <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center sm:h-24 sm:w-24">
                  {/* Outer glow */}
                  <div className="absolute inset-0 animate-pulse rounded-[28px] bg-[linear-gradient(135deg,#59b9e6_0%,#ffd15d_100%)] opacity-20 blur-xl" />
                  {/* Icon bg */}
                  <div className="relative flex h-full w-full items-center justify-center rounded-[28px] bg-[linear-gradient(135deg,#59b9e6_0%,#ffd15d_100%)] shadow-[0_20px_60px_rgba(89,185,230,0.28)]">
                    <FaHeart className="text-3xl text-white sm:text-4xl" />
                  </div>
                  {/* Floating hearts decoration */}
                  <FaHeart className="absolute -right-3 -top-2 animate-bounce text-[10px] text-[#ff6b8a]/40" />
                  <FaHeart className="absolute -bottom-1 -left-3 animate-bounce text-[8px] text-[#ffd15d]/40" style={{ animationDelay: "0.3s" }} />
                </div>

                {/* Title */}
                <h2
                  className={`text-2xl font-black sm:text-3xl ${
                    isDarkMode ? "text-white" : "text-[#203572]"
                  }`}
                >
                  Hali sevimli o'yinlaringiz yo'q
                </h2>

                {/* Description */}
                <p
                  className={`mx-auto mt-3 max-w-xs text-sm leading-relaxed sm:text-base ${
                    isDarkMode ? "text-[#a1a1aa]" : "text-[#6d7aa6]"
                  }`}
                >
                  O'yinlarni ko'rib chiqing va eng sevimlilarini yulduzcha bilan belgilang!
                </p>

                {/* Action button */}
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className={`group relative mx-auto mt-8 inline-flex items-center gap-3 overflow-hidden rounded-full px-8 py-3.5 text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 ${
                    isDarkMode
                      ? "bg-[linear-gradient(90deg,#59b9e6_0%,#ffd15d_100%)] text-[#0f172a]"
                      : "bg-[linear-gradient(90deg,#59b9e6_0%,#ffd15d_100%)] text-white"
                  }`}
                >
                  <span className="absolute inset-0 translate-y-full bg-white/20 transition-transform duration-300 group-hover:translate-y-0" />
                  <FaSearch className="relative text-sm" />
                  <span className="relative">O'yinlarni ko'rish</span>
                  <GiFlowerTwirl className="relative text-base" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}