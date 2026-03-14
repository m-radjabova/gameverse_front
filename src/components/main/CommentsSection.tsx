import { useState } from "react";
import { 
  FaStar, 
  FaQuoteRight, 
  FaRegHeart, 
  FaRegSmile,
  FaGraduationCap,
  FaChevronLeft,
  FaChevronRight
} from "react-icons/fa";
import { GiCherry, GiFlowerTwirl, GiCrown } from "react-icons/gi";
import { HiSparkles } from "react-icons/hi";

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectCoverflow } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';
import 'swiper/css/effect-coverflow';
import { comments } from "./commentsData";

function CommentsSection({ isDark = false }: { isDark?: boolean }) {
  const [likedComments, setLikedComments] = useState<number[]>([]);
  const [swiperRef, setSwiperRef] = useState<any>(null);

  const handleLike = (id: number) => {
    setLikedComments((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const totalComments = comments.length;
  const shouldLoop = comments.length > 3;

  return (
    <section className={`relative overflow-hidden py-16 lg:py-24 ${
      isDark
        ? "bg-gradient-to-br from-[#111827] via-[#0f172a] to-[#131a2d]"
        : "bg-gradient-to-br from-[#fff9f8] via-[#fff3f1] to-[#faeae5]"
    }`}>
      
      {/* Soft Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Large soft blurs */}
        <div className={`absolute -left-32 -top-32 w-96 h-96 rounded-full blur-3xl animate-pulse-slow ${isDark ? "bg-[#ff6b8a]/10" : "bg-[#f6d4da]/20"}`} />
        <div className={`absolute -right-32 top-1/2 w-96 h-96 rounded-full blur-3xl animate-pulse-slower ${isDark ? "bg-[#1e1e2f]" : "bg-[#fbe5dd]/20"}`} />
        <div className={`absolute left-1/3 bottom-0 w-80 h-80 rounded-full blur-3xl animate-float-soft ${isDark ? "bg-[#ff4f74]/10" : "bg-[#e07c8e]/10"}`} />
        
        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <GiCherry
            key={i}
            className={`absolute animate-float ${isDark ? "text-[#ff6b8a]/10" : "text-[#e07c8e]/10"}`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              fontSize: `${20 + Math.random() * 40}px`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${8 + Math.random() * 8}s`
            }}
          />
        ))}
        
        {/* Soft grid */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `
            radial-gradient(circle at 20px 20px, #e07c8e 1px, transparent 1px),
            linear-gradient(45deg, #f0d9d6 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px, 60px 60px'
        }} />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header Section - More subtle */}
        <div className="text-center max-w-3xl mx-auto mb-12" data-aos="fade-up" data-aos-delay="80">
          {/* Minimal badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm mb-5 backdrop-blur-sm ${
            isDark ? "border-[#ff6b8a]/20 bg-[#1e1e2f]/80" : "border-white/60 bg-white/80"
          }`}>
            <HiSparkles className="text-[#ff6b8a] text-xs animate-twinkle" />
            <span className={`text-[9px] font-medium uppercase tracking-[0.2em] ${isDark ? "text-[#a1a1aa]" : "text-[#a66466]"}`}>
              O'qituvchilar fikri
            </span>
          </div>

          {/* Soft title */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light leading-tight">
            <span className={isDark ? "text-[#f1f1f1]" : "text-[#7b4f53]"}>Nima uchun</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#e07c8e] to-[#a66466] font-medium">
              bizni tanlashadi?
            </span>
          </h2>

          {/* Soft stats */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
            {[
              { icon: FaRegSmile, text: `${totalComments}+ izohlar`, color: "#e07c8e" },
              { icon: FaStar, text: "4.9 reyting", color: "#ffb347" },
              { icon: FaGraduationCap, text: "50+ maktab", color: "#a66466" },
            ].map((stat, i) => (
              <div key={i} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border backdrop-blur-sm ${isDark ? "border-[#2b3146] bg-[#1e1e2f]" : "border-white/60 bg-white/60"}`}>
                <stat.icon className="text-xs" style={{ color: stat.color }} />
                <span className={`text-xs font-medium ${isDark ? "text-[#f1f1f1]" : "text-[#7b4f53]"}`}>{stat.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Swiper Carousel - Soft & Smooth */}
        <div className="relative px-4 md:px-10">
          <Swiper
            onSwiper={setSwiperRef}
            modules={[Autoplay, Pagination, Navigation, EffectCoverflow]}
            spaceBetween={24}
            slidesPerView={1}
            centeredSlides={false}
            loop={shouldLoop}
            loopAdditionalSlides={comments.length}
            loopedSlides={comments.length}
            watchSlidesProgress
            observer
            observeParents
            slidesPerGroup={1}
            speed={650}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: false,
              stopOnLastSlide: false,
              waitForTransition: false,
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
              dynamicMainBullets: 5,
            }}
            navigation={{
              prevEl: '.swiper-button-prev-custom',
              nextEl: '.swiper-button-next-custom',
            }}
            breakpoints={{
              640: { slidesPerView: 2, spaceBetween: 20 },
              1024: { slidesPerView: 3, spaceBetween: 24 },
            }}
            className="comments-swiper !overflow-visible !pb-12"
          >
            {comments.map((item, index) => (
              <SwiperSlide key={item.id} className="!h-auto">
                  <article
                    data-aos="fade-up"
                    data-aos-delay={120 + (index % 3) * 80}
                    className="group relative h-full"
                  >
                    {/* Soft glow on active */}
                    <div className={`absolute -inset-0.5 rounded-3xl bg-gradient-to-r ${item.color} opacity-10 blur-lg`} />
                    
                    {/* Main Card - Very soft */}
                    <div className={`relative h-full rounded-3xl border ${isDark ? "border-[#2b3146] bg-[#1a1a28]/88" : `border-white/60 ${item.bgColor} bg-white/40`} backdrop-blur-sm p-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)] transition-all duration-500 hover:shadow-[0_15px_40px_rgba(224,124,142,0.08)]`}>
                      
                      {/* Quote icon - soft */}
                      <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-r ${item.color} bg-opacity-20 flex items-center justify-center shadow-sm`}>
                        <FaQuoteRight className="text-white text-xs opacity-80" />
                      </div>
                      
                      {/* User info */}
                      <div className="flex items-start gap-3 mb-4">
                        <div className="relative">
                          <img
                            src={item.avatar}
                            alt={item.fullName}
                            className="relative w-12 h-12 rounded-full border-2 border-white/80 shadow-sm"
                          />
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-400/80 border border-white animate-pulse-soft" />
                        </div>
                        
                        <div className="flex-1">
                          <h3 className={`text-base font-semibold flex items-center gap-1 ${isDark ? "text-[#f1f1f1]" : "text-[#7b4f53]"}`}>
                            {item.fullName}
                            {item.rating === 5 && (
                              <GiCrown className="text-[#e07c8e] text-xs opacity-70" />
                            )}
                          </h3>
                          <p className={`text-[10px] font-medium opacity-80 ${isDark ? "text-[#a1a1aa]" : "text-[#a66466]"}`}>{item.role}</p>
                          <p className={`text-[8px] mt-0.5 opacity-70 ${isDark ? "text-[#a1a1aa]" : "text-[#8f6d70]"}`}>{item.school}</p>
                        </div>
                      </div>
                      
                      {/* Rating - soft */}
                      <div className="flex items-center gap-1 mb-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <FaStar
                            key={i}
                            className={`${
                              i < item.rating ? 'text-[#ffb347]' : isDark ? 'text-[#2b3146]' : 'text-[#f0d9d6]'
                            } drop-shadow-none`}
                            size={12}
                          />
                        ))}
                        <span className={`ml-2 text-[9px] font-medium opacity-70 ${isDark ? "text-[#a1a1aa]" : "text-[#a66466]"}`}>
                          {item.game}
                        </span>
                      </div>
                      
                      {/* Comment - soft */}
                      <p className={`text-xs leading-relaxed mb-4 line-clamp-3 font-light ${isDark ? "text-[#a1a1aa]" : "text-[#8f6d70]"}`}>
                        "{item.comment}"
                      </p>
                      
                      {/* Footer - minimal */}
                      <div className={`flex items-center justify-between border-t pt-3 ${isDark ? "border-[#2b3146]" : "border-[#f0d9d6]/30"}`}>
                        <button
                          onClick={() => handleLike(item.id)}
                          className="flex items-center gap-1.5 group/btn"
                        >
                          <FaRegHeart
                            className={`transition-all duration-300 ${
                              likedComments.includes(item.id)
                                ? 'text-[#e07c8e] scale-110'
                                : 'text-[#b38b8d]/50 group-hover/btn:text-[#e07c8e] group-hover/btn:scale-110'
                            }`}
                            size={11}
                          />
                          <span className={`text-[9px] font-medium group-hover/btn:text-[#7b4f53] ${isDark ? "text-[#a1a1aa]" : "text-[#8f6d70]/70"}`}>
                            {item.likes + (likedComments.includes(item.id) ? 1 : 0)}
                          </span>
                        </button>
                        
                        <span className={`text-[8px] ${isDark ? "text-[#a1a1aa]/60" : "text-[#b38b8d]/60"}`}>
                          {item.timeAgo}
                        </span>
                      </div>
                      
                      {/* Soft decorative element */}
                      <div className="absolute bottom-2 left-2 opacity-10">
                        <GiFlowerTwirl className={`text-base bg-gradient-to-r ${item.color} bg-clip-text text-transparent`} />
                      </div>
                    </div>
                  </article>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Navigation Buttons - Minimal */}
          <button className={`swiper-button-prev-custom absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full backdrop-blur-sm border shadow-sm flex items-center justify-center transition-all hover:-translate-x-1 md:flex hidden ${isDark ? "border-[#2b3146] bg-[#1e1e2f] hover:bg-[#25253a]" : "border-white/60 bg-white/80 hover:bg-white"}`}>
            <FaChevronLeft className={`text-xs ${isDark ? "text-[#f1f1f1]" : "text-[#a66466]"}`} />
          </button>
          
          <button className={`swiper-button-next-custom absolute right-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full backdrop-blur-sm border shadow-sm flex items-center justify-center transition-all hover:translate-x-1 md:flex hidden ${isDark ? "border-[#2b3146] bg-[#1e1e2f] hover:bg-[#25253a]" : "border-white/60 bg-white/80 hover:bg-white"}`}>
            <FaChevronRight className={`text-xs ${isDark ? "text-[#f1f1f1]" : "text-[#a66466]"}`} />
          </button>
        </div>
      </div>

      {/* Custom Swiper Styles */}
      <style>{`
        .comments-swiper .swiper-wrapper {
          align-items: stretch;
        }

        .comments-swiper .swiper-slide {
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
        
        .swiper-pagination-bullet-active-main {
          transform: scale(1);
        }
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.3; }
        }
        
        @keyframes pulse-slower {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.25; }
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        
        .animate-pulse-slower {
          animation: pulse-slower 6s ease-in-out infinite;
        }
        
        .animate-twinkle {
          animation: twinkle 2s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}

export default CommentsSection;
