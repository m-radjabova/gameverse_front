import { useEffect, useMemo, useState } from "react";
import {
  FaArrowRight,
} from "react-icons/fa";
import { GiCherry, GiTwirlyFlower } from "react-icons/gi";
import { HiSparkles } from "react-icons/hi";
import { MdAutoAwesome } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import GameShowcaseCard from "./GameShowcaseCard";
import { gameCards } from "../../pages/games/data";
import {
  getFavoriteGameIds,
  subscribeFavoriteGames,
  toggleFavoriteGame,
} from "../../utils/gameFavorites";

function AppsServiceSection({ isDark = false }: { isDark?: boolean }) {
  const navigate = useNavigate();
  const [likedGames, setLikedGames] = useState<string[]>([]);

  const games = useMemo(
    () => gameCards.filter((game) => game.available),
    []
  );
  const maxSlidesPerView = 3;
  const shouldLoop = games.length > 1;
  const carouselGames = useMemo(() => {
    if (!shouldLoop) return games;

    const minimumLoopSlides = maxSlidesPerView * 2;
    const repeatedGames = [...games];

    while (repeatedGames.length < minimumLoopSlides) {
      repeatedGames.push(...games);
    }

    return repeatedGames;
  }, [games, maxSlidesPerView, shouldLoop]);

  useEffect(() => {
    setLikedGames(getFavoriteGameIds());
    return subscribeFavoriteGames(setLikedGames);
  }, []);

  const handleLikeToggle = (gameId: string) => {
    setLikedGames(toggleFavoriteGame(gameId));
  };

  return (
    <section
      className="relative overflow-hidden bg-[image:var(--home-section-games-bg)] py-20 transition-colors duration-500 lg:py-28"
    >
      <BackgroundDecorations />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-14 max-w-3xl text-center" data-aos="fade-up" data-aos-delay="80">
          <div
            className={`mb-6 inline-flex items-center gap-2 rounded-full border px-5 py-2.5 shadow-lg backdrop-blur-sm ${
              isDark ? "border-[var(--home-surface-border)] bg-[var(--home-surface-bg)]" : "border-[var(--home-surface-border)] bg-[var(--home-surface-bg)]"
            }`}
          >
            <div className="relative">
              <HiSparkles className="animate-pulse-soft text-sm text-[var(--home-accent)]" />
              <span className="absolute -right-1 -top-1 h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--home-accent)] opacity-75" />
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--home-muted)]">
              Interaktiv o'yinlar
            </span>
          </div>

          <h2 className="text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            <span className="text-[var(--home-heading)]">Mavjud barcha</span>
            <span
              className="block bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--home-accent-gradient)" }}
            >
              o'yinlarni sinab ko'ring
            </span>
          </h2>
        </div>

        <div className="relative px-4 md:px-10">
          <Swiper
            modules={[Autoplay, Pagination, Navigation]}
            spaceBetween={24}
            slidesPerView={1}
            loop={shouldLoop}
            loopAdditionalSlides={shouldLoop ? Math.min(carouselGames.length, maxSlidesPerView * 2) : 0}
            watchSlidesProgress
            observer
            observeParents
            slidesPerGroup={1}
            grabCursor
            speed={650}
            autoplay={
              shouldLoop
                ? {
                    delay: 3500,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: false,
                    stopOnLastSlide: false,
                    waitForTransition: false,
                  }
                : false
            }
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            navigation={{
              prevEl: ".games-swiper-prev",
              nextEl: ".games-swiper-next",
            }}
            breakpoints={{
              640: { slidesPerView: 2, spaceBetween: 20 },
              1024: { slidesPerView: 3, spaceBetween: 24 },
            }}
            className="games-swiper !overflow-visible !pb-14"
          >
            {carouselGames.map((game, index) => {
              // const isLiked = likedGames.includes(game.id);
              // const Icon = game.mainIcon;
              // const CategoryIcon = game.categoryIcon;
              // const LevelIcon = game.levelIcon;

              return (
                <SwiperSlide key={`${game.id}-${index}`} className="!h-auto">
                  <div
                    data-aos="fade-up"
                    data-aos-delay={120 + (index % 3) * 80}
                    className="h-full"
                  >
                    <GameShowcaseCard
                      game={game}
                      isDark={isDark}
                      isLiked={likedGames.includes(game.id)}
                      onLikeToggle={handleLikeToggle}
                      onOpen={(path) => navigate(path)}
                    />
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>

          <button className={`games-swiper-prev absolute left-0 top-1/2 z-20 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border shadow-sm transition-all hover:-translate-x-1 md:flex ${isDark ? "border-[var(--home-surface-border-soft)] bg-[var(--home-surface-bg)] hover:bg-[var(--home-surface-bg-hover)]" : "border-[var(--home-surface-border-soft)] bg-[var(--home-surface-bg)] hover:bg-[var(--home-surface-bg-hover)]"}`}>
            <FaArrowRight className="rotate-180 text-xs text-[var(--home-heading)]" />
          </button>

          <button className={`games-swiper-next absolute right-0 top-1/2 z-20 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border shadow-sm transition-all hover:translate-x-1 md:flex ${isDark ? "border-[var(--home-surface-border-soft)] bg-[var(--home-surface-bg)] hover:bg-[var(--home-surface-bg-hover)]" : "border-[var(--home-surface-border-soft)] bg-[var(--home-surface-bg)] hover:bg-[var(--home-surface-bg-hover)]"}`}>
            <FaArrowRight className="text-xs text-[var(--home-heading)]" />
          </button>
        </div>

        <div className="mt-16 text-center" data-aos="zoom-in-up" data-aos-delay="200">
          <div className="relative inline-block">
            <div
              className="absolute -inset-2 rounded-full opacity-50 blur-xl"
              style={{ backgroundImage: "var(--home-accent-gradient)" }}
            />
            <button
              onClick={() => navigate("/games")}
              className="relative inline-flex cursor-pointer items-center gap-3 rounded-full px-8 py-4 text-base font-bold text-white shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(89,185,230,0.34)]"
              style={{ backgroundImage: "var(--home-accent-gradient)" }}
            >
              <MdAutoAwesome className="text-xl" />
              Barcha o'yinlarni ko'rish
              <FaArrowRight className="text-sm transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .games-swiper .swiper-wrapper {
          align-items: stretch;
        }

        .games-swiper .swiper-slide {
          height: auto;
        }

        .swiper-pagination {
          bottom: 0 !important;
        }

        .swiper-pagination-bullet {
          width: 6px;
          height: 6px;
          background: ${isDark ? "var(--home-surface-border-soft)" : "var(--home-surface-border)"};
          opacity: 0.5;
          transition: all 0.3s ease;
        }

        .swiper-pagination-bullet-active {
          width: 20px;
          border-radius: 4px;
          background: var(--home-accent-gradient);
          opacity: 0.8;
        }

        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  );
}

function BackgroundDecorations() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute left-[5%] top-[10%] h-72 w-72 animate-float-soft rounded-full bg-[var(--home-blob-1)] blur-3xl" />
      <div className="absolute right-[8%] bottom-[15%] h-80 w-80 animate-float-slow rounded-full bg-[var(--home-blob-2)] blur-3xl" />

      <GiCherry
        className="absolute left-[12%] top-[20%] animate-petal-float text-4xl"
        style={{ color: "color-mix(in srgb, var(--home-accent) 10%, transparent)" }}
      />
      <GiTwirlyFlower
        className="absolute right-[15%] top-[40%] animate-float-soft text-5xl"
        style={{ color: "color-mix(in srgb, var(--home-muted) 10%, transparent)" }}
      />

      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, var(--home-accent) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
    </div>
  );
}

export default AppsServiceSection;
