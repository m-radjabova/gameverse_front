import { useMemo, useState } from "react";
import {
  FaArrowRight,
  FaClock,
  FaLayerGroup,
  FaRocket,
  FaUsers,
} from "react-icons/fa";
import { GiCherry, GiFlowerTwirl, GiTwirlyFlower } from "react-icons/gi";
import { HiSparkles } from "react-icons/hi";
import { MdAutoAwesome } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { gameCards } from "../../pages/games/data";

function AppsServiceSection({ isDark = false }: { isDark?: boolean }) {
  const navigate = useNavigate();
  const [likedGames, setLikedGames] = useState<string[]>([]);

  const games = useMemo(
    () => gameCards.filter((game) => game.available),
    []
  );
  const shouldLoop = games.length > 3;

  const handleLikeToggle = (gameId: string) => {
    setLikedGames((prev) =>
      prev.includes(gameId)
        ? prev.filter((item) => item !== gameId)
        : [...prev, gameId]
    );
  };

  return (
    <section
      className={`relative overflow-hidden py-20 transition-colors duration-500 lg:py-28 ${
        isDark
          ? "bg-gradient-to-br from-[#111827] via-[#0f172a] to-[#131a2d]"
          : "bg-gradient-to-br from-[#fff9f8] via-[#fff3f1] to-[#faeae5]"
      }`}
    >
      <BackgroundDecorations isDark={isDark} />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-14 max-w-3xl text-center" data-aos="fade-up" data-aos-delay="80">
          <div
            className={`mb-6 inline-flex items-center gap-2 rounded-full border px-5 py-2.5 shadow-lg backdrop-blur-sm ${
              isDark ? "border-[#ff6b8a]/20 bg-[#1e1e2f]/80" : "border-[#f0d9d6] bg-white/90"
            }`}
          >
            <div className="relative">
              <HiSparkles className="animate-pulse-soft text-sm text-[#ff6b8a]" />
              <span className="absolute -right-1 -top-1 h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff6b8a] opacity-75" />
              </span>
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isDark ? "text-[#a1a1aa]" : "text-[#a66466]"}`}>
              Interaktiv o'yinlar
            </span>
          </div>

          <h2 className="text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            <span className={isDark ? "text-[#f1f1f1]" : "text-[#7b4f53]"}>Mavjud barcha</span>
            <span className="block bg-gradient-to-r from-[#ff6b8a] via-[#ff4f74] to-[#ff8ca6] bg-clip-text text-transparent">
              o'yinlarni sinab ko'ring
            </span>
          </h2>

          <p className={`mt-4 text-base leading-relaxed sm:text-lg ${isDark ? "text-[#a1a1aa]" : "text-[#8f6d70]"}`}>
            Faqat faol o'yinlar chiqarildi. Har bir karta darsga mos format,
            vaqt va yo'nalish bilan carousel ichida ko'rsatiladi.
          </p>
        </div>

        <div className="relative px-4 md:px-10">
          <Swiper
            modules={[Autoplay, Pagination, Navigation]}
            spaceBetween={24}
            slidesPerView={1}
            loop={shouldLoop}
            loopAdditionalSlides={games.length}
            watchSlidesProgress
            observer
            observeParents
            centeredSlides={false}
            slidesPerGroup={1}
            speed={650}
            autoplay={{
              delay: 3500,
              disableOnInteraction: false,
              pauseOnMouseEnter: false,
              stopOnLastSlide: false,
              waitForTransition: false,
            }}
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
            {games.map((game, index) => {
              const isLiked = likedGames.includes(game.id);
              const Icon = game.mainIcon;
              const CategoryIcon = game.categoryIcon;
              const LevelIcon = game.levelIcon;

              return (
                <SwiperSlide key={game.id} className="!h-auto">
                  <article
                    data-aos="fade-up"
                    data-aos-delay={120 + (index % 3) * 80}
                    className="group relative h-full"
                  >
                      <div
                        className={`absolute -inset-0.5 rounded-[30px] bg-gradient-to-r ${game.gradient} opacity-10 blur-lg`}
                      />

                      <div
                        className={`relative h-full overflow-hidden rounded-[30px] border p-5 backdrop-blur-md ${
                          isDark
                            ? "border-[#2b3146] bg-[#1a1a28]/88 shadow-[0_12px_36px_rgba(0,0,0,0.22)] hover:shadow-[0_18px_44px_rgba(255,107,138,0.12)]"
                            : "border-white/70 bg-white/45 shadow-[0_12px_36px_rgba(166,100,102,0.08)] hover:shadow-[0_18px_44px_rgba(224,124,142,0.12)]"
                        }`}
                      >
                        <div
                          className="absolute inset-0 opacity-50"
                          style={{
                            backgroundImage: `radial-gradient(circle at 20px 20px, ${
                              isDark
                                ? "#ff6b8a18"
                                : game.gradient.includes("yellow")
                                  ? "#f7c66d20"
                                  : "#e07c8e14"
                            } 2px, transparent 2px)`,
                            backgroundSize: "38px 38px",
                          }}
                        />

                        <div className={`relative mb-4 overflow-hidden rounded-[24px] border ${isDark ? "border-[#2b3146] bg-[#1e1e2f]" : "border-white/80 bg-white/60"}`}>
                          <img
                            src={game.image}
                            alt={game.title}
                            className="h-52 w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />

                          <div className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-3 py-1.5 backdrop-blur-sm">
                            <game.badgeIcon className="text-[11px] text-white" />
                            <span className="text-[10px] font-bold tracking-[0.18em] text-white">
                              {game.badge}
                            </span>
                          </div>

                          <div className={`absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${game.iconBg} shadow-lg`}>
                            <Icon className="text-lg text-white" />
                          </div>

                          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
                            <div className="rounded-2xl bg-white/18 px-3 py-2 backdrop-blur-sm">
                              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80">
                                Kategoriya
                              </p>
                              <p className="mt-1 text-sm font-bold text-white">
                                {game.category}
                              </p>
                            </div>

                            <button
                              onClick={() => handleLikeToggle(game.id)}
                              className={`rounded-full border border-white/35 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] backdrop-blur-sm transition-all ${
                                isLiked
                                  ? "bg-white text-[#ff6b8a]"
                                  : "bg-white/20 text-white hover:bg-white/30"
                              }`}
                            >
                              {isLiked ? "Saqlandi" : "Like"}
                            </button>
                          </div>
                        </div>

                        <div className="relative space-y-4">
                          <div className="flex flex-wrap gap-2">
                            {[
                              { icon: FaLayerGroup, value: game.players },
                              { icon: FaClock, value: game.time },
                              { icon: FaUsers, value: game.points },
                            ].map((item) => (
                              <span
                                key={`${game.id}-${item.value}`}
                                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-bold ${
                                  isDark
                                    ? "border-[#2b3146] bg-[#1e1e2f] text-[#a1a1aa]"
                                    : "border-white/70 bg-white/70 text-[#8f6d70]"
                                }`}
                              >
                                <item.icon className="text-[9px]" />
                                {item.value}
                              </span>
                            ))}
                          </div>

                          <div>
                            <h3 className={`text-2xl font-black ${isDark ? "text-[#f1f1f1]" : "text-[#7b4f53]"}`}>
                              {game.title}
                            </h3>
                            <p className={`mt-2 line-clamp-3 text-sm leading-relaxed ${isDark ? "text-[#a1a1aa]" : "text-[#8f6d70]"}`}>
                              {game.description}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className={`rounded-2xl border px-4 py-3 ${isDark ? "border-[#2b3146] bg-[#1e1e2f]" : "border-white/70 bg-white/65"}`}>
                              <p className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] ${isDark ? "text-[#a1a1aa]" : "text-[#a66466]"}`}>
                                <CategoryIcon className="text-[11px]" />
                                Yo'nalish
                              </p>
                              <p className={`mt-2 text-sm font-semibold ${isDark ? "text-[#f1f1f1]" : "text-[#7b4f53]"}`}>
                                {game.category}
                              </p>
                            </div>
                            <div className={`rounded-2xl border px-4 py-3 ${isDark ? "border-[#2b3146] bg-[#1e1e2f]" : "border-white/70 bg-white/65"}`}>
                              <p className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] ${isDark ? "text-[#a1a1aa]" : "text-[#a66466]"}`}>
                                <LevelIcon className="text-[11px]" />
                                Daraja
                              </p>
                              <p className={`mt-2 text-sm font-semibold ${isDark ? "text-[#f1f1f1]" : "text-[#7b4f53]"}`}>
                                {game.level}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => navigate(game.path)}
                            className={`group/btn relative w-full overflow-hidden rounded-2xl bg-gradient-to-r ${game.gradient} p-3.5 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-1`}
                          >
                            <span className="absolute inset-0 translate-y-full bg-white/20 transition-transform duration-300 group-hover/btn:translate-y-0" />
                            <span className="relative flex items-center justify-center gap-2">
                              <FaRocket className="text-sm" />
                              O'yinni boshlash
                              <FaArrowRight className="text-xs transition-transform group-hover/btn:translate-x-1" />
                            </span>
                          </button>
                        </div>

                        <div className="absolute bottom-3 right-3 opacity-10">
                          <GiFlowerTwirl className={`text-xl bg-gradient-to-r ${game.gradient} bg-clip-text text-transparent`} />
                        </div>
                      </div>
                    </article>
                </SwiperSlide>
              );
            })}
          </Swiper>

          <button className={`games-swiper-prev absolute left-0 top-1/2 z-20 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border shadow-sm transition-all hover:-translate-x-1 md:flex ${isDark ? "border-[#2b3146] bg-[#1e1e2f] hover:bg-[#25253a]" : "border-white/70 bg-white/85 hover:bg-white"}`}>
            <FaArrowRight className={`rotate-180 text-xs ${isDark ? "text-[#f1f1f1]" : "text-[#a66466]"}`} />
          </button>

          <button className={`games-swiper-next absolute right-0 top-1/2 z-20 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border shadow-sm transition-all hover:translate-x-1 md:flex ${isDark ? "border-[#2b3146] bg-[#1e1e2f] hover:bg-[#25253a]" : "border-white/70 bg-white/85 hover:bg-white"}`}>
            <FaArrowRight className={`text-xs ${isDark ? "text-[#f1f1f1]" : "text-[#a66466]"}`} />
          </button>
        </div>

        <div className="mt-16 text-center" data-aos="zoom-in-up" data-aos-delay="200">
          <div className="relative inline-block">
            <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-[#ff6b8a] to-[#ff4f74] opacity-50 blur-xl" />
            <button
              onClick={() => navigate("/games")}
              className="relative cursor-pointer inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#ff6b8a] to-[#ff4f74] px-8 py-4 text-base font-bold text-white shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(255,107,138,0.4)]"
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
          background: ${isDark ? "#2b3146" : "#f0d9d6"};
          opacity: 0.5;
          transition: all 0.3s ease;
        }

        .swiper-pagination-bullet-active {
          width: 20px;
          border-radius: 4px;
          background: linear-gradient(to right, #ff6b8a, #ff4f74);
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

function BackgroundDecorations({ isDark = false }: { isDark?: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className={`absolute left-[5%] top-[10%] h-72 w-72 rounded-full blur-3xl animate-float-soft ${isDark ? "bg-[#ff6b8a]/12" : "bg-[#f6d4da]/20"}`} />
      <div className={`absolute right-[8%] bottom-[15%] h-80 w-80 rounded-full blur-3xl animate-float-slow ${isDark ? "bg-[#1e1e2f]" : "bg-[#fbe5dd]/20"}`} />

      <GiCherry className={`absolute left-[12%] top-[20%] text-4xl animate-petal-float ${isDark ? "text-[#ff6b8a]/10" : "text-[#e07c8e]/10"}`} />
      <GiTwirlyFlower className={`absolute right-[15%] top-[40%] text-5xl animate-float-soft ${isDark ? "text-[#a1a1aa]/10" : "text-[#a66466]/10"}`} />

      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, ${isDark ? "#ff6b8a" : "#e07c8e"} 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />
    </div>
  );
}

export default AppsServiceSection;
