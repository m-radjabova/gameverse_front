import React, { useEffect, useMemo, useState } from "react";
import {
  FaArrowRight,
  FaPlay,
  FaHeart,
  FaRegHeart,
  FaTrophy,
} from "react-icons/fa";
import { GiCherry, GiTwirlyFlower } from "react-icons/gi";
import { HiSparkles } from "react-icons/hi";
import { MdAutoAwesome } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { Autoplay, Navigation, Pagination, EffectCoverflow } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";

import { gameCards } from "../../pages/games/data";
import { supportsGameLeaderboard } from "../../hooks/gameSession";
import {
  getFavoriteGameIds,
  subscribeFavoriteGames,
  toggleFavoriteGame,
} from "../../utils/gameFavorites";

function AppsServiceSection({ isDark = false }: { isDark?: boolean }) {
  const navigate = useNavigate();
  const [likedGames, setLikedGames] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const games = useMemo(
    () => gameCards.filter((game) => game.available),
    []
  );
  const shouldLoop = games.length > 1;

  useEffect(() => {
    setLikedGames(getFavoriteGameIds());
    return subscribeFavoriteGames(setLikedGames);
  }, []);

  const handleLikeToggle = (gameId: string) => {
    setLikedGames(toggleFavoriteGame(gameId));
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[var(--home-section-games-bg-start)] to-[var(--home-section-games-bg-end)] py-20 transition-colors duration-500 lg:py-28">
      <BackgroundDecorations isDark={isDark} />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-14 max-w-3xl text-center" data-aos="fade-up" data-aos-delay="80">
          <div
            className={`mb-6 inline-flex items-center gap-2 rounded-full border px-5 py-2.5 shadow-lg backdrop-blur-sm ${
              isDark 
                ? "border-white/10 bg-white/5" 
                : "border-black/10 bg-black/5"
            }`}
          >
            <div className="relative">
              <HiSparkles className="animate-pulse text-sm text-[var(--home-accent)]" />
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
          <p className="mx-auto mt-6 max-w-2xl text-[var(--home-muted)]">
            Eng zo'r o'yinlarni kashf eting va ularni bepul sinab ko'ring. Har bir o'yin siz uchun maxsus tayyorlangan.
          </p>
        </div>

        <div className="relative px-0 md:px-10">
          <Swiper
            modules={[Autoplay, Pagination, Navigation, EffectCoverflow]}
            effect="coverflow"
            coverflowEffect={{
              rotate: 0,
              stretch: 0,
              depth: 200,
              modifier: 1.5,
              slideShadows: false,
            }}
            spaceBetween={-80}
            slidesPerView={1}
            centeredSlides={true}
            loop={shouldLoop}
            grabCursor={true}
            speed={800}
            autoplay={
              shouldLoop
                ? {
                    delay: 4000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                  }
                : false
            }
            pagination={{
              clickable: true,
              dynamicBullets: false,
              renderBullet: (index, className) => {
                return `<span class="${className}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); opacity: ${activeIndex === index ? '1' : '0.4'}; width: ${activeIndex === index ? '32px' : '8px'}; height: 8px; border-radius: 4px; transition: all 0.3s;"></span>`;
              },
            }}
            navigation={{
              prevEl: ".games-swiper-prev",
              nextEl: ".games-swiper-next",
            }}
            onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
            breakpoints={{
              768: {
                slidesPerView: 1.5,
                spaceBetween: -60,
              },
              1024: {
                slidesPerView: 2.5,
                spaceBetween: -80,
              },
              1280: {
                slidesPerView: 3,
                spaceBetween: -80,
              },
            }}
            className="games-swiper !overflow-visible !pb-16"
          >
            {games.map((game) => (
              <SwiperSlide key={game.id} className="!h-auto transition-all duration-500">
                {({ isActive }) => (
                  <div
                    className={`transform-gpu transition-all duration-700 ease-out ${
                      isActive 
                        ? "scale-100 opacity-100" 
                        : isDark
                          ? "scale-90 opacity-45 blur-[1px]"
                          : "scale-90 opacity-55 blur-[0.8px]"
                    }`}
                  >
                    <ModernGameCard
                      game={game}
                      isDark={isDark}
                      isActive={isActive}
                      isLiked={likedGames.includes(game.id)}
                      onLikeToggle={() => handleLikeToggle(game.id)}
                      onOpen={() => {
                        if ("externalUrl" in game && typeof game.externalUrl === "string") {
                          window.location.href = game.externalUrl;
                          return;
                        }
                        navigate(game.path);
                      }}
                    />
                  </div>
                )}
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Navigation Buttons */}
          <button className={`games-swiper-prev group absolute left-0 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full backdrop-blur-lg transition-all hover:shadow-xl md:flex ${
            isDark ? "bg-white/10 hover:bg-white/20" : "bg-white/90 hover:bg-white border border-slate-200"
          }`}>
            <FaArrowRight className={`rotate-180 text-lg transition-transform group-hover:-translate-x-0.5 ${
              isDark ? "text-white" : "text-slate-700"
            }`} />
          </button>

          <button className={`games-swiper-next group absolute right-0 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full backdrop-blur-lg transition-all hover:shadow-xl md:flex ${
            isDark ? "bg-white/10 hover:bg-white/20" : "bg-white/90 hover:bg-white border border-slate-200"
          }`}>
            <FaArrowRight className={`text-lg transition-transform group-hover:translate-x-0.5 ${
              isDark ? "text-white" : "text-slate-700"
            }`} />
          </button>
        </div>

        <div className="mt-20 text-center" data-aos="zoom-in-up" data-aos-delay="200">
          <div className="group relative inline-block">
            <div className="absolute -inset-2 rounded-full opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100"
              style={{ backgroundImage: "var(--home-accent-gradient)" }}
            />
            <button
              onClick={() => navigate("/games")}
              className="relative inline-flex cursor-pointer items-center gap-3 rounded-full bg-gradient-to-r from-[var(--home-accent)] to-[var(--home-accent-secondary)] px-8 py-4 text-base font-bold text-white shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(89,185,230,0.34)]"
            >
              <MdAutoAwesome className="text-xl" />
              Barcha o'yinlarni ko'rish
              <FaArrowRight className="text-sm transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .games-swiper {
          padding: 20px 0 40px 0;
        }

        .games-swiper .swiper-wrapper {
          align-items: center;
          padding: 20px 0;
        }

        .games-swiper .swiper-slide {
          height: auto;
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .swiper-pagination {
          bottom: 0 !important;
        }

        .swiper-pagination-bullet {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          margin: 0 6px !important;
        }

        .swiper-pagination-bullet-active {
          width: 32px !important;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes pulse-glow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </section>
  );
}

// Yangi zamonaviy Game Card komponenti
function ModernGameCard({ game, isDark, isActive, isLiked, onLikeToggle, onOpen } : {
  game: typeof gameCards[0];
  isDark?: boolean;
  isActive: boolean;
  isLiked: boolean;
  onLikeToggle: () => void;
  onOpen: () => void;
  
}) {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = game.mainIcon;
  const hasLeaderboard = supportsGameLeaderboard(game.id, game.players);

  return (
    <div
      className={`group relative cursor-pointer transition-all duration-500 ${
        isActive ? "z-10" : "z-0"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onOpen}
    >
      {/* Gradient Border */}
      <div className={`absolute -inset-[1px] rounded-2xl bg-gradient-to-r opacity-0 blur-sm transition-all duration-700 group-hover:opacity-100 ${
        isDark
          ? "from-cyan-400/80 via-fuchsia-500/80 to-pink-500/80"
          : "from-sky-400/80 via-indigo-400/70 to-pink-400/80"
      }`} />
      
      {/* Card Content */}
      <div className={`relative overflow-hidden rounded-2xl transition-all duration-500 ${
        isActive
          ? isDark
            ? "bg-gradient-to-br from-slate-900/95 via-slate-900/92 to-slate-950/95 shadow-2xl"
            : "bg-gradient-to-br from-white via-sky-50/75 to-indigo-50/70 shadow-[0_18px_36px_rgba(30,64,175,0.18)]"
          : isDark
            ? "bg-slate-900/75 shadow-lg"
            : "bg-white/80 shadow-lg"
      } ${isHovered && isActive ? "scale-105 shadow-2xl" : ""}`}>
        
        {/* Image Container */}
        <div className="relative overflow-hidden">
          <div className="aspect-[16/10] w-full overflow-hidden rounded-t-2xl">
            <img
              src={game.image}
              alt={game.title}
              className={`h-full w-full object-cover object-center transition-all duration-700 ${
                isHovered && isActive ? "scale-110" : "scale-100"
              }`}
            />
          </div>
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <div className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/25 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
            <game.badgeIcon className="text-[10px]" />
            {game.badge}
          </div>
          <div className={`absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${game.iconBg} shadow-lg`}>
            <Icon className="text-white" />
          </div>

          {hasLeaderboard ? (
            <div className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full border border-amber-200/45 bg-slate-950/65 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-amber-300 shadow-lg backdrop-blur-md">
              <FaTrophy className="text-[10px]" />
              Leaderboard
            </div>
          ) : null}
          
          {/* Play Button Overlay */}
          <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform transition-all duration-500 ${
            isHovered && isActive ? "scale-100 opacity-100" : "scale-75 opacity-0"
          }`}>
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-xl transition-all hover:scale-110">
              <FaPlay className="ml-1 text-2xl text-white" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Category & Rating */}
          <div className="mb-3 flex items-center justify-between">
            <span className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm ${
              isDark ? "bg-white/10 text-white/80" : "bg-slate-100 text-slate-700"
            }`}>
              {React.createElement(game.categoryIcon)} {game.category}
            </span>
          </div>

          {/* Title */}
          <h3 className={`mb-2 line-clamp-1 text-xl font-black ${isDark ? "text-white" : "text-[#203572]"}`}>
            {game.title}
          </h3>

          {/* Description */}
          <p className={`mb-4 line-clamp-2 text-sm leading-relaxed ${isDark ? "text-white/70" : "text-slate-600"}`}>
            {game.description}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between">
            {/* Play Count */}
            <div className={`flex items-center gap-1 text-xs ${isDark ? "text-white/55" : "text-slate-500"}`}>
              <FaPlay className="text-[10px]" />
              <span>{game.players || "1 o'yinchi"}</span>
            </div>

            {/* Like Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLikeToggle();
              }}
              className={`group/like flex items-center gap-2 rounded-full px-3 py-1.5 backdrop-blur-sm transition-all ${
                isDark ? "bg-white/10 hover:bg-white/20" : "bg-slate-100 hover:bg-slate-200"
              }`}
            >
              {isLiked ? (
                <FaHeart className="text-red-500 transition-all group-hover/like:scale-110" />
              ) : (
                <FaRegHeart className={`transition-all group-hover/like:scale-110 group-hover/like:text-red-500 ${
                  isDark ? "text-white/70" : "text-slate-500"
                }`} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BackgroundDecorations({ isDark }: { isDark?: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Animated Blobs */}
      <div className="absolute -left-20 -top-20 h-96 w-96 animate-[float_8s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl" />
      <div className="absolute -bottom-20 -right-20 h-96 w-96 animate-[float_10s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-pink-500/20 to-orange-500/20 blur-3xl" />
      <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 animate-[pulse-glow_4s_ease-in-out_infinite] rounded-full bg-purple-500/10 blur-3xl" />

      {/* Decorative Icons */}
      <GiCherry
        className="absolute left-[5%] top-[15%] animate-[float_6s_ease-in-out_infinite] text-5xl opacity-20"
        style={{ color: "var(--home-accent)" }}
      />
      <GiTwirlyFlower
        className="absolute right-[8%] top-[25%] animate-[float_7s_ease-in-out_infinite_0.5s] text-6xl opacity-20"
        style={{ color: "var(--home-accent-secondary)" }}
      />

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, ${isDark ? "#fff" : "#000"} 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      />
    </div>
  );
}

export default AppsServiceSection;
