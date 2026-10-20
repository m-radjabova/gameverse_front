
import { FaArrowRight, FaGraduationCap } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import { useNavigate } from "react-router-dom";

import darkHeroImg from "../../assets/dark_hero_img.webp";
import heroImg from "../../assets/hero_img_new.webp";
import Header from "../header/Header";

type HeroProps = {
  activeNav?: "O'yinlar" | "Haqida" | "Izohlar" | "Bog'lanish";
  isDark?: boolean;
  onNavClick?: (section: string) => void;
  onThemeToggle?: () => void;
};

function Hero({
  activeNav,
  isDark = false,
  onNavClick,
  onThemeToggle,
}: HeroProps) {
  const navigate = useNavigate();
  const currentImage = isDark ? darkHeroImg : heroImg;

  return (
    <section className="relative min-h-screen overflow-hidden bg-[var(--home-section-hero-bg)] transition-colors duration-500">
      {/* ───── Orqa fon ───── */}
      <div className="absolute inset-0" aria-hidden="true">
        {/* Asosiy rasm (aniqroq va xiraligi minimal) */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={currentImage}
            alt=""
            fetchPriority="high"
            decoding="async"
            className="h-full w-full object-cover blur-[0.5px] saturate-[0.95] opacity-85 animate-hero-ken-burns"
          />
          {/* Yengil ustki qoplama (matn yaxshi o'qilishi uchun) */}
          <div className={`absolute inset-0 ${isDark ? "bg-[#070b18]/60" : "bg-white/50"}`} />
        </div>

        {/* Matn o'qilishi uchun chap tomondagi yumshoq gradient */}
        <div
          className={`absolute inset-0 ${
            isDark
              ? "bg-[linear-gradient(90deg,rgba(8,14,28,0.75)_0%,rgba(10,18,34,0.4)_50%,transparent_100%)]"
              : "bg-[linear-gradient(90deg,rgba(255,255,255,0.8)_0%,rgba(255,255,255,0.45)_50%,transparent_100%)]"
          }`}
        />
      </div>

      <Header
        active={activeNav}
        isDark={isDark}
        onNavClick={onNavClick}
        onThemeToggle={onThemeToggle}
      />

      {/* ───── Mazmun ───── */}
      <div className="relative z-20 mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 pb-14 pt-26 sm:px-6 sm:pt-30 lg:justify-start">
        <div className="w-full max-w-4xl text-center lg:ml-20 lg:max-w-[54rem] lg:translate-y-4 lg:text-left xl:translate-y-2">
          <div
            className={`mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 backdrop-blur-md animate-hero-scale-in animate-hero-pulse-soft ${
              isDark
                ? "border-[#59b9e6]/25 bg-[#121c2d]/78"
                : "border-[var(--home-surface-border)] bg-[var(--home-surface-bg)]"
            }`}
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full ${
                isDark ? "bg-[#59b9e6]/18 text-[#7fd3ef]" : "bg-[#eef9ff] text-[var(--home-accent)]"
              }`}
            >
              <HiSparkles className="text-sm" />
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-[var(--home-muted)] sm:text-[11px]">
              Zamonaviy ta'lim platformasi
            </span>
          </div>

          <h1
            className="animate-hero-fade-in-up mx-auto max-w-4xl text-4xl font-black leading-[1.03] tracking-tight sm:text-5xl md:text-6xl lg:mx-0 lg:max-w-[54rem] lg:text-[clamp(4rem,4.25vw,5rem)]"
            style={{ animationDelay: "0.15s", animationFillMode: "both" }}
          >
            Ta'lim jarayonini
            <span
              className="mt-2 block bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--home-accent-gradient)" }}
            >
              yanada qiziqarli
            </span>
            <span className="mt-2 block text-[var(--home-heading)]">va samarali qiling</span>
          </h1>

          <p
            className="animate-hero-fade-in-up mx-auto mt-6 max-w-2xl text-sm leading-7 sm:text-base sm:leading-8 md:text-lg lg:mx-0 lg:max-w-[44rem]"
            style={{ animationDelay: "0.3s", animationFillMode: "both" }}
          >
            Interaktiv topshiriqlar, oson boshqaruv va natijalarni qulay
            kuzatish imkoniyati. O'qituvchi, o'quvchi va maktab uchun mos,
            chiroyli va zamonaviy yagona platforma.
          </p>

          <div
            className="animate-hero-fade-in-up mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start"
            style={{ animationDelay: "0.45s", animationFillMode: "both" }}
          >
            <button
              onClick={() => navigate("/games")}
              className="group relative inline-flex cursor-pointer items-center gap-3 overflow-hidden rounded-full px-7 py-4 text-sm font-extrabold tracking-[0.06em] text-white shadow-[0_18px_34px_rgba(89,185,230,0.28)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_40px_rgba(255,209,93,0.32)]"
              style={{ backgroundImage: "var(--home-accent-gradient)" }}
            >
              <span className="absolute inset-0 animate-hero-shimmer bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.18)_50%,transparent_100%)]" />
              <span className="relative z-10 flex items-center gap-3">
                <FaGraduationCap className="text-base" />
                Boshlash
                <FaArrowRight className="text-xs transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;