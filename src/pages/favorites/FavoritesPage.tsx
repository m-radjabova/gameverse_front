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
    <section className="min-h-screen bg-[radial-gradient(circle_at_top,#2a1b2f_0%,#161625_45%,#0f172a_100%)] px-4 pb-16 pt-32 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {favoriteGames.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
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
          <div className="px-6 py-16 text-center backdrop-blur-md">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-gradient-to-br from-rose-400 to-pink-500 text-white shadow-[0_20px_60px_rgba(244,114,182,0.3)]">
              <FaHeart className="text-2xl" />
            </div>
            <h2 className="mt-6 text-3xl font-black text-white">Hali sevimli o'yinlaringiz yo'q</h2>
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
