import { useMemo, useRef, useState } from "react";
import {
  FaStar,
  FaQuoteRight,
  FaRegHeart,
  FaRegSmile,
  FaGraduationCap,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { GiCherry, GiFlowerTwirl, GiCrown, GiSpiralBloom } from "react-icons/gi";
import { HiSparkles } from "react-icons/hi";
import { MdOutlineRateReview } from "react-icons/md";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, EffectCoverflow } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper/types";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-coverflow";
import { comments } from "./commentsData";

const getAvatarFallback = (name: string) => {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56">
      <defs>
        <linearGradient id="avatarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f3a6b7" />
          <stop offset="100%" stop-color="#d88b6a" />
        </linearGradient>
      </defs>
      <rect width="56" height="56" rx="28" fill="url(#avatarGradient)" />
      <text
        x="50%"
        y="50%"
        dominant-baseline="central"
        text-anchor="middle"
        font-family="Arial, sans-serif"
        font-size="20"
        font-weight="700"
        fill="#ffffff"
      >
        ${initials}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

function CommentsSection({ isDark = false }: { isDark?: boolean }) {
  const [likedComments, setLikedComments] = useState<number[]>([]);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const swiperRef = useRef<SwiperType | null>(null);

  const handleLike = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedComments((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const totalComments = comments.length;
  const maxSlidesPerView = 3;
  const shouldLoop = comments.length > 1;
  const carouselComments = useMemo(() => {
    if (!shouldLoop) return comments;

    const minimumLoopSlides = maxSlidesPerView * 2;
    const repeatedComments = [...comments];

    while (repeatedComments.length < minimumLoopSlides) {
      repeatedComments.push(...comments);
    }

    return repeatedComments;
  }, [maxSlidesPerView, shouldLoop]);

  return (
    <section
      className="relative overflow-hidden bg-[image:var(--home-section-comments-bg)] py-20 transition-colors duration-300 lg:py-28"
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -right-20 -top-40 h-[500px] w-[500px] animate-pulse-slow rounded-full bg-[var(--home-blob-4)] blur-3xl" />
        <div className="absolute -bottom-40 -left-20 h-[600px] w-[600px] animate-pulse-slower rounded-full bg-[var(--home-blob-5)] blur-3xl" />
        <div className="absolute left-1/4 top-1/3 h-80 w-80 rounded-full bg-[var(--home-blob-6)] blur-[100px]" />

        <div className="absolute top-[15%] left-[5%] opacity-20 animate-float-soft">
          <GiSpiralBloom className={`text-7xl ${isDark ? "text-[#ffd98a]" : "text-[#59b9e6]"}`} />
        </div>
        <div
          className="absolute bottom-[10%] right-[3%] opacity-15 animate-float-soft"
          style={{ animationDelay: "2s" }}
        >
          <GiFlowerTwirl className={`text-6xl ${isDark ? "text-[#7fd3ef]" : "text-[#d99f8b]"}`} />
        </div>

        {[...Array(12)].map((_, i) => (
          <GiCherry
            key={i}
            className={`absolute animate-float ${isDark ? "text-[#7fd3ef]/10" : "text-[#78cfee]/15"}`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              fontSize: `${18 + Math.random() * 45}px`,
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${12 + Math.random() * 12}s`,
              opacity: 0.4 + Math.random() * 0.3,
            }}
          />
        ))}

        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `
            repeating-linear-gradient(45deg, #78cfee 0px, #78cfee 1px, transparent 1px, transparent 30px),
            repeating-linear-gradient(135deg, #ffd76d 0px, #ffd76d 1px, transparent 1px, transparent 40px)
          `,
            backgroundSize: "60px 60px, 80px 80px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-4xl text-center lg:mb-20" data-aos="fade-up" data-aos-delay="80">
          <div
            className={`mb-6 inline-flex items-center gap-3 rounded-full border px-5 py-2.5 shadow-sm backdrop-blur-md transition-all hover:shadow-md ${
              isDark
                ? "border-[var(--home-surface-border)] bg-[var(--home-surface-bg-soft)] hover:bg-[var(--home-surface-bg-hover)]"
                : "border-[var(--home-surface-border-soft)] bg-[var(--home-surface-bg-soft)] hover:bg-[var(--home-surface-bg-hover)]"
            }`}
          >
            <HiSparkles className="animate-twinkle text-sm text-[var(--home-accent)]" />
            <span
              className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--home-soft-text)]"
            >
              Hurmatli hamkasblar fikri
            </span>
            <MdOutlineRateReview className="text-xs text-[var(--home-soft-text)]" />
          </div>

          <h2 className="text-4xl font-light leading-[1.2] tracking-tight sm:text-5xl lg:text-6xl">
            <span className="text-[var(--home-heading)]">Nima uchun</span>
            <span
              className="mt-2 block bg-clip-text font-semibold text-transparent"
              style={{ backgroundImage: "var(--home-accent-gradient)" }}
            >
              bizni tanlashadi?
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base font-light text-[var(--home-body)]">
            Yurtimizning 50 dan ortiq maktab va litseylaridagi tajribali pedagoglar platformamiz haqida o'z
            fikrlarini bildirishdi
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {[
              {
                icon: FaRegSmile,
                label: "Faol izohlar",
                value: `${totalComments}+`,
                color: "#59b9e6",
                gradient: "from-sky-100 to-cyan-100",
              },
              {
                icon: FaStar,
                label: "Umumiy reyting",
                value: "4.9/5",
                color: "#ffb347",
                gradient: "from-amber-100 to-yellow-100",
              },
              {
                icon: FaGraduationCap,
                label: "Hamkor maktablar",
                value: "50+",
                color: "#59b9e6",
                gradient: "from-sky-100 to-blue-100",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 rounded-2xl border px-5 py-2.5 backdrop-blur-sm transition-all duration-300 hover:scale-105 ${
                  isDark
                    ? "border-[#2a2a3a] bg-[#15151f]/70 hover:bg-[#1e1e2a]"
                    : "border-white/60 bg-white/50 hover:bg-white/70"
                }`}
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${stat.gradient}`}>
                  <stat.icon className="text-sm" style={{ color: stat.color }} />
                </div>
                <div className="text-left">
                  <div className="text-lg font-bold text-[var(--home-heading)]">{stat.value}</div>
                  <div
                    className={`text-[10px] font-medium uppercase tracking-wide ${
                      isDark ? "text-[#8ba0bf]" : "text-[#b28a8a]"
                    }`}
                  >
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative px-2 md:px-12">
          <Swiper
            modules={[Autoplay, Pagination, Navigation, EffectCoverflow]}
            spaceBetween={28}
            slidesPerView={1}
            centeredSlides={false}
            loop={shouldLoop}
            loopAdditionalSlides={shouldLoop ? Math.min(carouselComments.length, maxSlidesPerView * 2) : 0}
            watchSlidesProgress
            observer
            observeParents
            slidesPerGroup={1}
            grabCursor
            speed={700}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            onTouchEnd={() => {
              if (shouldLoop) {
                swiperRef.current?.autoplay?.start();
              }
            }}
            onSlideChangeTransitionEnd={() => {
              if (shouldLoop && swiperRef.current && !swiperRef.current.autoplay.running) {
                swiperRef.current.autoplay.start();
              }
            }}
            autoplay={
              shouldLoop
                ? {
                    delay: 4800,
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
              dynamicMainBullets: 4,
            }}
            navigation={{
              prevEl: ".swiper-button-prev-custom",
              nextEl: ".swiper-button-next-custom",
            }}
            breakpoints={{
              640: { slidesPerView: 2, spaceBetween: 24 },
              1024: { slidesPerView: 3, spaceBetween: 28 },
              1280: { slidesPerView: 3, spaceBetween: 32 },
            }}
            className="comments-swiper !overflow-visible !pb-14"
          >
            {carouselComments.map((item, index) => {
              const isLiked = likedComments.includes(item.id);
              const displayLikes = item.likes + (isLiked ? 1 : 0);
              const isHovered = hoveredCard === item.id;

              return (
                <SwiperSlide key={`${item.id}-${index}`} className="!h-auto">
                  <article
                    onMouseEnter={() => setHoveredCard(item.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    className="group relative h-full transition-all duration-500"
                  >
                    <div
                      className={`absolute -inset-0.5 rounded-3xl bg-gradient-to-r ${item.color} opacity-0 blur-xl transition-opacity duration-500 ${
                        isHovered ? "opacity-30" : "opacity-0"
                      }`}
                    />

                    <div
                      className={`card-hover-effect relative flex h-full flex-col rounded-3xl border p-6 shadow-[0_10px_35px_rgba(0,0,0,0.03)] backdrop-blur-md transition-all duration-500 hover:shadow-[0_20px_45px_rgba(89,185,230,0.14)] ${
                        isDark
                          ? "border-[#2e2e42] bg-[#14141f]/80 shadow-xl hover:bg-[#181825]"
                          : `${item.bgColor} border-white/70 bg-white/50 hover:bg-white/70`
                      }`}
                    >
                      <div
                        className={`absolute -top-3 -right-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${item.color} shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}
                      >
                        <FaQuoteRight className="text-sm text-white drop-shadow-sm" />
                      </div>

                      <div className="mb-5 flex items-start gap-4">
                        <div className="relative flex-shrink-0">
                          <img
                            src={item.avatar}
                            alt={item.fullName}
                            onError={(event) => {
                              event.currentTarget.onerror = null;
                              event.currentTarget.src = getAvatarFallback(item.fullName);
                            }}
                            className="relative h-14 w-14 rounded-full border-3 border-white/80 object-cover shadow-md transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute -right-0.5 -bottom-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400 shadow-sm animate-pulse-soft" />
                          {item.rating === 5 && (
                            <div className="absolute -top-1 -right-1">
                              <GiCrown className="text-xs text-[#f5b042] drop-shadow-md" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3
                            className={`flex items-center gap-1.5 truncate text-base font-semibold ${
                              isDark ? "text-[#f0f0f0]" : "text-[#203572]"
                            }`}
                          >
                            {item.fullName}
                            {item.rating === 5 && (
                              <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100/50 px-1.5 py-0.5">
                                <FaStar className="text-[8px] text-[#f5b042]" />
                                <span className="text-[8px] font-bold text-amber-600">5</span>
                              </span>
                            )}
                          </h3>
                          <p className={`mt-0.5 text-[11px] font-medium ${isDark ? "text-[#b0b0c4]" : "text-[#b27a7a]"}`}>
                            {item.role}
                          </p>
                          <p
                            className={`mt-0.5 flex items-center gap-1 text-[9px] ${
                              isDark ? "text-[#8888a0]" : "text-[#b89292]"
                            }`}
                          >
                            <FaGraduationCap className="text-[8px]" />
                            {item.school}
                          </p>
                        </div>
                      </div>

                      <div className="mb-4 flex items-center gap-1.5">
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <FaStar
                              key={i}
                              className={`transition-all duration-200 ${
                                i < item.rating
                                  ? "text-[#ffb347] drop-shadow-sm"
                                  : isDark
                                    ? "text-[#2e2e42]"
                                    : "text-[#e6ceca]"
                              }`}
                              size={13}
                            />
                          ))}
                        </div>
                        <span
                          className={`ml-2 rounded-full px-2 py-0.5 text-[9px] font-medium ${
                            isDark ? "bg-[#2a2a3a] text-[#b0b0c4]" : "bg-[#eef9ff] text-[#5f78a6]"
                          }`}
                        >
                          {item.game}
                        </span>
                      </div>

                      <div className="relative mb-5 min-h-[100px]">
                        <p
                          className={`line-clamp-3 text-[14px] leading-relaxed font-light italic ${
                            isDark ? "text-[#cacadc]" : "text-[#7e5c5f]"
                          }`}
                        >
                          "{item.comment}"
                        </p>
                      </div>

                      <div
                        className={`mt-auto flex items-center justify-between border-t pt-4 ${
                          isDark ? "border-[#2a2a3a]" : "border-[#d8eef7]"
                        }`}
                      >
                        <button
                          onClick={(e) => handleLike(item.id, e)}
                          className={`flex items-center gap-2 rounded-full px-3 py-1.5 transition-all duration-300 ${
                            isLiked
                              ? "bg-sky-100/60 text-sky-600"
                              : isDark
                                ? "text-[#a0a0b4] hover:bg-[#252536]"
                                : "text-[#6d7aa6] hover:bg-white/60"
                          }`}
                        >
                          <FaRegHeart
                            className={`transition-all duration-300 ${
                              isLiked ? "scale-110 fill-sky-600 text-sky-600" : "group-hover/btn:scale-110"
                            }`}
                            size={12}
                          />
                          <span className="text-[11px] font-medium">{displayLikes}</span>
                        </button>

                        <div className={`flex items-center gap-1 text-[9px] ${isDark ? "text-[#6a6a82]" : "text-[#8ca0c8]"}`}>
                          {item.timeAgo}
                        </div>
                      </div>

                      <div className="absolute bottom-3 left-3 opacity-20 transition-opacity group-hover:opacity-30">
                        <GiFlowerTwirl className={`text-base ${isDark ? "text-[#ffd98a]" : "text-[#d99f8b]"}`} />
                      </div>
                    </div>
                  </article>
                </SwiperSlide>
              );
            })}
          </Swiper>

          <button
            className={`swiper-button-prev-custom absolute top-1/2 left-0 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border shadow-md backdrop-blur-xl transition-all duration-300 hover:scale-110 md:flex ${
              isDark
                ? "border-[#3a3a52] bg-[#1f1f2c]/80 text-[#7fd3ef] hover:bg-[#2a2a3a]"
                : "border-white/70 bg-white/70 text-[#b27a7a] hover:bg-white"
            }`}
          >
            <FaChevronLeft className="text-sm" />
          </button>

          <button
            className={`swiper-button-next-custom absolute top-1/2 right-0 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border shadow-md backdrop-blur-xl transition-all duration-300 hover:scale-110 md:flex ${
              isDark
                ? "border-[#3a3a52] bg-[#1f1f2c]/80 text-[#7fd3ef] hover:bg-[#2a2a3a]"
                : "border-white/70 bg-white/70 text-[#b27a7a] hover:bg-white"
            }`}
          >
            <FaChevronRight className="text-sm" />
          </button>
        </div>

        <div className="mt-12 flex justify-center">
          <div
            className={`inline-flex items-center gap-3 rounded-full border border-white/30 px-5 py-2 backdrop-blur-sm ${
              isDark ? "bg-[#1a1a2a]/40" : "bg-white/40"
            }`}
          >
        </div>
        </div>
      </div>

      <style>{`
        .comments-swiper .swiper-wrapper {
          align-items: stretch;
        }

        .comments-swiper .swiper-slide {
          height: auto;
          transition: all 0.3s ease;
        }

        .swiper-pagination {
          bottom: 0 !important;
        }
        
        .swiper-pagination-bullet {
          width: 7px;
          height: 7px;
          background: ${isDark ? "var(--home-surface-border-soft)" : "#e0bcb5"};
          opacity: 0.5;
          transition: all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1);
        }
        
        .swiper-pagination-bullet-active {
          width: 24px;
          border-radius: 12px;
          background: var(--home-accent-gradient);
          opacity: 1;
        }
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(1.05); }
        }
        
        @keyframes pulse-slower {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.25; transform: scale(1.08); }
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        
        @keyframes pulse-soft {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 5s ease-in-out infinite;
        }
        
        .animate-pulse-slower {
          animation: pulse-slower 8s ease-in-out infinite;
        }
        
        .animate-twinkle {
          animation: twinkle 2s ease-in-out infinite;
        }
        
        .animate-float {
          animation: float 10s ease-in-out infinite;
        }
        
        .animate-pulse-soft {
          animation: pulse-soft 1.8s ease-in-out infinite;
        }
        
        .card-hover-effect {
          transition: all 0.4s cubic-bezier(0.2, 0.8, 0.4, 1.1);
        }
      `}</style>
    </section>
  );
}

export default CommentsSection;
