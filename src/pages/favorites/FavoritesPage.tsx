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
    <section className="min-h-screen bg-[radial-gradient(circle_at_top,#2a1b2f_0%,#161625_45%,#0f172a_100%)] px-3 pb-12 pt-24 sm:px-6 sm:pb-16 sm:pt-28 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {favoriteGames.length ? (
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
            {favoriteGames.map((game, index) => (
              <div key={game.id} data-aos="fade-up" data-aos-delay={100 + index * 60}>
                <GameShowcaseCard
                  game={game}
                  isDark
                  isLiked
                  onLikeToggle={handleLikeToggle}
                  onOpen={(path) => navigate(path)}
                  priorityLabel={`Favourite ${index + 1}`}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[28px] border border-white/10 bg-white/5 px-4 py-12 text-center backdrop-blur-md sm:px-6 sm:py-16">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[24px] bg-gradient-to-br from-rose-400 to-pink-500 text-white shadow-[0_20px_60px_rgba(244,114,182,0.3)] sm:h-20 sm:w-20 sm:rounded-[28px]">
              <FaHeart className="text-2xl" />
            </div>
            <h2 className="mt-6 text-2xl font-black text-white sm:text-3xl">Hali sevimli o'yinlaringiz yo'q</h2>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-400 to-pink-500 px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5"
            >
              O'yinlarni ko'rish
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
