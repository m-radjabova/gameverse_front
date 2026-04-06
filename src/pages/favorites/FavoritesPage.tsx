import { useEffect, useMemo, useState } from "react";
import { FaHeart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import GameShowcaseCard from "../../components/main/GameShowcaseCard";
import { gameCards } from "../games/data";
import {
  getFavoriteGameIds,
  subscribeFavoriteGames,
  toggleFavoriteGame,
} from "../../utils/gameFavorites";

export default function FavoritesPage() {
  const navigate = useNavigate();
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    setFavoriteIds(getFavoriteGameIds());
    return subscribeFavoriteGames(setFavoriteIds);
  }, []);

  useEffect(() => {
    const syncTheme = () => {
      setIsDarkMode(window.localStorage.getItem("home-theme") === "dark");
    };

    syncTheme();
    window.addEventListener("storage", syncTheme);

    return () => {
      window.removeEventListener("storage", syncTheme);
    };
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
      className={`min-h-screen px-3 pb-12 pt-24 transition-colors duration-500 sm:px-6 sm:pb-16 sm:pt-28 lg:px-8 ${
        isDarkMode
          ? "bg-[radial-gradient(circle_at_top,#1b2a41_0%,#111827_42%,#0f172a_100%)]"
          : "bg-[radial-gradient(circle_at_top,#ffffff_0%,#f6fcff_45%,#fff8ef_100%)]"
      }`}
    >
      <div className="mx-auto max-w-7xl">
        {favoriteGames.length ? (
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
            {favoriteGames.map((game, index) => (
              <div key={game.id} data-aos="fade-up" data-aos-delay={100 + index * 60}>
                <GameShowcaseCard
                  game={game}
                  isDark={isDarkMode}
                  isLiked
                  onLikeToggle={handleLikeToggle}
                  onOpen={(path) => navigate(path)}
                  priorityLabel={`Favourite ${index + 1}`}
                />
              </div>
            ))}
          </div>
        ) : (
          <div
            className={`rounded-[28px] border px-4 py-12 text-center backdrop-blur-md sm:px-6 sm:py-16 ${
              isDarkMode
                ? "border-[var(--home-surface-border)] bg-[var(--home-surface-bg-soft)]"
                : "border-[var(--home-surface-border)] bg-white/80"
            }`}
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[24px] bg-[linear-gradient(135deg,#59b9e6_0%,#ffd15d_100%)] text-white shadow-[0_20px_60px_rgba(89,185,230,0.28)] sm:h-20 sm:w-20 sm:rounded-[28px]">
              <FaHeart className="text-2xl" />
            </div>
            <h2 className={`mt-6 text-2xl font-black sm:text-3xl ${isDarkMode ? "text-white" : "text-[#203572]"}`}>
              Hali sevimli o'yinlaringiz yo'q
            </h2>
            <button
              type="button"
              onClick={() => navigate("/")}
              className={`mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition hover:-translate-y-0.5 ${
                isDarkMode
                  ? "bg-[linear-gradient(90deg,#59b9e6_0%,#ffd15d_100%)] text-[#0f172a]"
                  : "bg-[linear-gradient(90deg,#59b9e6_0%,#ffd15d_100%)] text-white"
              }`}
            >
              O'yinlarni ko'rish
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
