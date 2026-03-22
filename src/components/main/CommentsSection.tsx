import { useRef, useState } from "react";
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
  const shouldLoop = comments.length > 1;

  return (
    <section
      className={`relative overflow-hidden py-20 lg:py-28 transition-colors duration-300 ${
        isDark
          ? "bg-gradient-to-br from-[#0a0a1a] via-[#111122] to-[#0f0f1f]"
          : "bg-gradient-to-br from-[#fffbf8] via-[#fff6f2] to-[#fef0ea]"
      }`}
    >
      {/* Enhanced Background Decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Large soft blurs with depth */}
        <div
          className={`absolute -top-40 -right-20 h-[500px] w-[500px] rounded-full blur-3xl animate-pulse-slow ${
            isDark ? "bg-[#ff6b8a]/5" : "bg-[#ffd9de]/30"
          }`}
        />
        <div
          className={`absolute -bottom-40 -left-20 h-[600px] w-[600px] rounded-full blur-3xl animate-pulse-slower ${
            isDark ? "bg-[#4a3b6e]/10" : "bg-[#ffe1d6]/30"
          }`}
        />
        <div
          className={`absolute top-1/3 left-1/4 h-80 w-80 rounded-full blur-[100px] ${
            isDark ? "bg-[#ff9f6e]/5" : "bg-[#fbc4b0]/20"
          }`}
        />

        {/* Floating organic shapes */}
        <div className="absolute top-[15%] left-[5%] opacity-20 animate-float-soft">
          <GiSpiralBloom className={`text-7xl ${isDark ? "text-[#ffb48a]" : "text-[#e07c8e]"}`} />
        </div>
        <div
          className="absolute bottom-[10%] right-[3%] opacity-15 animate-float-soft"
          style={{ animationDelay: "2s" }}
        >
          <GiFlowerTwirl className={`text-6xl ${isDark ? "text-[#c9b6ff]" : "text-[#d99f8b]"}`} />
        </div>

        {/* Floating cherry blossoms - more elegant */}
        {[...Array(12)].map((_, i) => (
          <GiCherry
            key={i}
            className={`absolute animate-float ${isDark ? "text-[#ff8a9f]/10" : "text-[#e07c8e]/15"}`}
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

        {/* Soft grid pattern - more refined */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `
            repeating-linear-gradient(45deg, #e07c8e 0px, #e07c8e 1px, transparent 1px, transparent 30px),
            repeating-linear-gradient(135deg, #c9a59b 0px, #c9a59b 1px, transparent 1px, transparent 40px)
          `,
            backgroundSize: "60px 60px, 80px 80px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Section - More premium & spacious */}
        <div className="mx-auto mb-16 max-w-4xl text-center lg:mb-20" data-aos="fade-up" data-aos-delay="80">
          {/* Elegant badge with sparkle */}
          <div
            className={`mb-6 inline-flex items-center gap-3 rounded-full border px-5 py-2.5 shadow-sm backdrop-blur-md transition-all hover:shadow-md ${
              isDark
                ? "border-[#ff6b8a]/30 bg-[#1a1a2a]/70 hover:bg-[#1f1f32]"
                : "border-white/70 bg-white/60 hover:bg-white/80"
            }`}
          >
            <HiSparkles className="animate-twinkle text-sm text-[#e07c8e]" />
            <span
              className={`text-[10px] font-semibold uppercase tracking-[0.25em] ${
                isDark ? "text-[#ffb7c5]" : "text-[#b27a7a]"
              }`}
            >
              Hurmatli hamkasblar fikri
            </span>
            <MdOutlineRateReview className={`text-xs ${isDark ? "text-[#ff9faa]" : "text-[#c98888]"}`} />
          </div>

          {/* Main title with gradient and elegance */}
          <h2 className="text-4xl font-light leading-[1.2] tracking-tight sm:text-5xl lg:text-6xl">
            <span className={isDark ? "text-[#f0f0f0]" : "text-[#6b4e52]"}>Nima uchun</span>
            <span className="mt-2 block bg-gradient-to-r from-[#e07c8e] via-[#d46b7a] to-[#b85c6b] bg-clip-text font-semibold text-transparent">
              bizni tanlashadi?
            </span>
          </h2>

          {/* Elegant description */}
          <p className={`mx-auto mt-5 max-w-2xl text-base font-light ${isDark ? "text-[#a1a1b5]" : "text-[#9b7578]"}`}>
            Yurtimizning 50 dan ortiq maktab va litseylaridagi tajribali pedagoglar platformamiz haqida o'z
            fikrlarini bildirishdi
          </p>

          {/* Stats with refined cards */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {[
              {
                icon: FaRegSmile,
                label: "Faol izohlar",
                value: `${totalComments}+`,
                color: "#e07c8e",
                gradient: "from-rose-100 to-orange-100",
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
                color: "#a66466",
                gradient: "from-pink-100 to-rose-100",
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
                  <div className={`text-lg font-bold ${isDark ? "text-white" : "text-[#5e3e42]"}`}>{stat.value}</div>
                  <div
                    className={`text-[10px] font-medium uppercase tracking-wide ${
                      isDark ? "text-[#8888a0]" : "text-[#b28a8a]"
                    }`}
                  >
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Swiper Carousel - Premium & Smooth */}
        <div className="relative px-2 md:px-12">
          <Swiper
            modules={[Autoplay, Pagination, Navigation, EffectCoverflow]}
            spaceBetween={28}
            slidesPerView={1}
            centeredSlides={false}
            loop={shouldLoop}
            loopAdditionalSlides={Math.min(comments.length, 3)}
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
              swiperRef.current?.autoplay?.start();
            }}
            onSlideChangeTransitionEnd={() => {
              if (swiperRef.current && !swiperRef.current.autoplay.running) {
                swiperRef.current.autoplay.start();
              }
            }}
            autoplay={{
              delay: 4800,
              disableOnInteraction: false,
              pauseOnMouseEnter: false,
              stopOnLastSlide: false,
              waitForTransition: false,
            }}
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
            {comments.map((item) => {
              const isLiked = likedComments.includes(item.id);
              const displayLikes = item.likes + (isLiked ? 1 : 0);
              const isHovered = hoveredCard === item.id;

              return (
                <SwiperSlide key={item.id} className="!h-auto">
                  <article
                    onMouseEnter={() => setHoveredCard(item.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    className="group relative h-full transition-all duration-500"
                  >
                    {/* Glow effect on hover */}
                    <div
                      className={`absolute -inset-0.5 rounded-3xl bg-gradient-to-r ${item.color} opacity-0 blur-xl transition-opacity duration-500 ${
                        isHovered ? "opacity-30" : "opacity-0"
                      }`}
                    />

                    {/* Main Card - Premium glassmorphism */}
                    <div
                      className={`card-hover-effect relative flex h-full flex-col rounded-3xl border p-6 shadow-[0_10px_35px_rgba(0,0,0,0.03)] backdrop-blur-md transition-all duration-500 hover:shadow-[0_20px_45px_rgba(224,124,142,0.12)] ${
                        isDark
                          ? "border-[#2e2e42] bg-[#14141f]/80 shadow-xl hover:bg-[#181825]"
                          : `${item.bgColor} border-white/70 bg-white/50 hover:bg-white/70`
                      }`}
                    >
                      {/* Decorative quote orb - premium */}
                      <div
                        className={`absolute -top-3 -right-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${item.color} shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}
                      >
                        <FaQuoteRight className="text-sm text-white drop-shadow-sm" />
                      </div>

                      {/* User section with elegant layout */}
                      <div className="mb-5 flex items-start gap-4">
                        <div className="relative flex-shrink-0">
                          <img
                            src={item.avatar}
                            alt={item.fullName}
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
                              isDark ? "text-[#f0f0f0]" : "text-[#5e3e42]"
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

                      {/* Rating with stars - refined */}
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
                            isDark ? "bg-[#2a2a3a] text-[#b0b0c4]" : "bg-[#f7e6e3] text-[#b27a7a]"
                          }`}
                        >
                          {item.game}
                        </span>
                      </div>

                      {/* Comment with elegant typography */}
                      <div className="relative mb-5 min-h-[100px]">
                        <p
                          className={`line-clamp-3 text-[14px] leading-relaxed font-light italic ${
                            isDark ? "text-[#cacadc]" : "text-[#7e5c5f]"
                          }`}
                        >
                          "{item.comment}"
                        </p>
                      </div>

                      {/* Footer with interaction */}
                      <div
                        className={`mt-auto flex items-center justify-between border-t pt-4 ${
                          isDark ? "border-[#2a2a3a]" : "border-[#f0dbd5]/50"
                        }`}
                      >
                        <button
                          onClick={(e) => handleLike(item.id, e)}
                          className={`flex items-center gap-2 rounded-full px-3 py-1.5 transition-all duration-300 ${
                            isLiked
                              ? "bg-rose-100/50 text-rose-500"
                              : isDark
                                ? "text-[#a0a0b4] hover:bg-[#252536]"
                                : "text-[#b27a7a] hover:bg-white/60"
                          }`}
                        >
                          <FaRegHeart
                            className={`transition-all duration-300 ${
                              isLiked ? "scale-110 fill-rose-500 text-rose-500" : "group-hover/btn:scale-110"
                            }`}
                            size={12}
                          />
                          <span className="text-[11px] font-medium">{displayLikes}</span>
                        </button>

                        <div className={`flex items-center gap-1 text-[9px] ${isDark ? "text-[#6a6a82]" : "text-[#c8a2a2]"}`}>
                          <span aria-hidden="true">🕊️</span>
                          {item.timeAgo}
                        </div>
                      </div>

                      {/* Subtle decorative flower */}
                      <div className="absolute bottom-3 left-3 opacity-20 transition-opacity group-hover:opacity-30">
                        <GiFlowerTwirl className={`text-base ${isDark ? "text-[#ffb48a]" : "text-[#d99f8b]"}`} />
                      </div>
                    </div>
                  </article>
                </SwiperSlide>
              );
            })}
          </Swiper>

          {/* Custom Navigation Buttons - Premium minimal */}
          <button
            className={`swiper-button-prev-custom absolute top-1/2 left-0 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border shadow-md backdrop-blur-xl transition-all duration-300 hover:scale-110 md:flex ${
              isDark
                ? "border-[#3a3a52] bg-[#1f1f2c]/80 text-[#ffb7c5] hover:bg-[#2a2a3a]"
                : "border-white/70 bg-white/70 text-[#b27a7a] hover:bg-white"
            }`}
          >
            <FaChevronLeft className="text-sm" />
          </button>

          <button
            className={`swiper-button-next-custom absolute top-1/2 right-0 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border shadow-md backdrop-blur-xl transition-all duration-300 hover:scale-110 md:flex ${
              isDark
                ? "border-[#3a3a52] bg-[#1f1f2c]/80 text-[#ffb7c5] hover:bg-[#2a2a3a]"
                : "border-white/70 bg-white/70 text-[#b27a7a] hover:bg-white"
            }`}
          >
            <FaChevronRight className="text-sm" />
          </button>
        </div>

        {/* Trusted by badge - extra social proof */}
        <div className="mt-12 flex justify-center">
          <div
            className={`inline-flex items-center gap-3 rounded-full border border-white/30 px-5 py-2 backdrop-blur-sm ${
              isDark ? "bg-[#1a1a2a]/40" : "bg-white/40"
            }`}
          >
            <span className={`text-[10px] font-medium tracking-wide ${isDark ? "text-[#a0a0b8]" : "text-[#a77a7a]"}`}>
              🌟 500+ o'qituvchilar ishonchi • 98% tavsiya etadi
            </span>
          </div>
        </div>
      </div>

      {/* Enhanced Swiper & Animation Styles */}
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
          background: ${isDark ? "#3a3a52" : "#e0bcb5"};
          opacity: 0.5;
          transition: all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1);
        }
        
        .swiper-pagination-bullet-active {
          width: 24px;
          border-radius: 12px;
          background: linear-gradient(135deg, #e07c8e, #c06779);
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
