import { FaArrowRight, FaGraduationCap } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import { useNavigate } from "react-router-dom";

import darkHeroImg from "../../assets/dark_hero_img.png";
import heroImg from "../../assets/hero_img_new.png";
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

  return (
    <section
      className="relative min-h-screen overflow-hidden bg-[var(--home-section-hero-bg)] transition-colors duration-500"
    >
      <div className="absolute inset-0">
        <img
          src={isDark ? darkHeroImg : heroImg}
          alt="Hero background"
          className={`h-full w-full object-cover transition-all duration-700 ${
            isDark ? "scale-105" : ""
          }`}
        />

        <div
          className={`absolute inset-0 ${
            isDark
              ? "bg-[linear-gradient(180deg,rgba(7,11,24,0.30)_0%,rgba(10,15,30,0.46)_28%,rgba(12,18,36,0.58)_62%,rgba(12,18,36,0.72)_100%)]"
              : "bg-[linear-gradient(180deg,rgba(255,250,250,0.16)_0%,rgba(255,248,248,0.28)_30%,rgba(255,247,247,0.46)_62%,rgba(255,246,246,0.62)_100%)]"
          }`}
        />
        <div
          className={`absolute inset-0 ${
            isDark
              ? "bg-[radial-gradient(circle_at_50%_42%,rgba(89,185,230,0.18),rgba(89,185,230,0.06)_28%,transparent_62%)]"
              : "bg-[radial-gradient(circle_at_50%_42%,rgba(126,201,232,0.18),rgba(126,201,232,0.08)_28%,transparent_62%)]"
          }`}
        />
        <div
          className={`absolute inset-0 ${
            isDark
              ? "bg-[linear-gradient(90deg,rgba(8,14,28,0.88)_0%,rgba(10,18,34,0.72)_26%,rgba(14,22,40,0.46)_54%,rgba(12,18,36,0.30)_100%)]"
              : "bg-[linear-gradient(90deg,rgba(255,248,248,0.78)_0%,rgba(255,248,248,0.56)_26%,rgba(255,248,248,0.30)_54%,rgba(255,248,248,0.16)_100%)]"
          }`}
        />
        <div className="absolute inset-0">
          <div className="absolute left-[5%] top-[16%] h-52 w-52 rounded-full bg-[var(--home-blob-1)] blur-3xl animate-hero-float-slow" />
          <div className="absolute left-[14%] top-[48%] h-72 w-72 rounded-full bg-[var(--home-blob-3)] blur-[110px] animate-hero-drift" />
          <div className="absolute right-[10%] top-[14%] h-56 w-56 rounded-full bg-[var(--home-blob-4)] blur-3xl animate-hero-float-delayed" />
          <div className="absolute right-[18%] bottom-[12%] h-64 w-64 rounded-full bg-[var(--home-blob-6)] blur-[120px] animate-hero-float-slow" />
        </div>
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[10%] top-[22%] animate-hero-orbit text-[var(--home-accent)]/25">
            <HiSparkles className="text-xl" />
          </div>
          <div className="absolute left-[22%] top-[66%] animate-hero-float text-[var(--home-accent-strong)]/30">
            <HiSparkles className="text-2xl" />
          </div>
          <div className="absolute right-[14%] top-[28%] animate-hero-float-delayed text-[var(--home-soft-text)]/30">
            <HiSparkles className="text-xl" />
          </div>
          <div className="absolute right-[24%] bottom-[20%] animate-hero-drift text-[var(--home-accent)]/20">
            <HiSparkles className="text-2xl" />
          </div>
        </div>
      </div>
      <Header
        active={activeNav}
        isDark={isDark}
        onNavClick={onNavClick}
        onThemeToggle={onThemeToggle}
      />

      <div className="relative z-20 mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 pb-14 pt-26 sm:px-6 sm:pt-30 lg:justify-start">
        <div className="w-full max-w-4xl text-center lg:-translate-y-20 lg:ml-40 lg:max-w-[50rem] lg:text-left xl:-translate-y-24">
          <div
            data-aos="zoom-in"
            data-aos-delay="120"
            className={`mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 shadow-[0_10px_35px_rgba(89,185,230,0.16)] backdrop-blur-md ${
              isDark
                ? "border-[#59b9e6]/25 bg-[#121c2d]/78"
                : "border-[var(--home-surface-border)] bg-[var(--home-surface-bg)]"
            }`}
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full ${
                isDark
                  ? "bg-[#59b9e6]/18 text-[#7fd3ef]"
                  : "bg-[#eef9ff] text-[var(--home-accent)]"
              }`}
            >
              <HiSparkles className="text-sm" />
            </span>
            <span
              className={`text-[10px] font-extrabold uppercase tracking-[0.22em] sm:text-[11px] ${
                isDark ? "text-[var(--home-muted)]" : "text-[var(--home-muted)]"
              }`}
            >
              Zamonaviy ta'lim platformasi
            </span>
          </div>

          <h1
            data-aos="fade-up"
            data-aos-delay="180"
            className={`mx-auto max-w-4xl text-4xl font-black leading-[0.96] tracking-tight sm:text-5xl md:text-6xl lg:mx-0 lg:max-w-[46rem] lg:text-[5.25rem] ${
              isDark ? "text-[var(--home-heading)]" : "text-[var(--home-heading)]"
            }`}
          >
            Ta'lim jarayonini
            <span
              className="mt-1 block bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--home-accent-gradient)" }}
            >
              yanada qiziqarli
            </span>
            <span
              className={`mt-1 block ${
                isDark ? "text-[var(--home-heading)]" : "text-[var(--home-heading)]"
              }`}
            >
              va samarali qiling
            </span>
          </h1>

          <p
            data-aos="fade-up"
            data-aos-delay="240"
            className={`mx-auto mt-5 max-w-2xl text-sm leading-7 sm:text-base sm:leading-8 md:text-lg lg:mx-0 lg:max-w-[44rem] ${
              isDark ? "text-[var(--home-body)]" : "text-[var(--home-body)]"
            }`}
          >
            Interaktiv topshiriqlar, oson boshqaruv va natijalarni qulay
            kuzatish imkoniyati. O'qituvchi, o'quvchi va maktab uchun mos,
            chiroyli va zamonaviy yagona platforma.
          </p>

          <div
            className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            <button
              onClick={() => navigate("/games")}
              className="group inline-flex cursor-pointer items-center gap-3 rounded-full px-7 py-4 text-sm font-extrabold tracking-[0.06em] text-white shadow-[0_18px_34px_rgba(89,185,230,0.28)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_40px_rgba(255,209,93,0.32)]"
              style={{ backgroundImage: "var(--home-accent-gradient)" }}
            >
              <FaGraduationCap className="text-base" />
              Boshlash
              <FaArrowRight className="text-xs transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[34rem] xl:block">
          <div className="absolute right-20 top-30 h-80 w-80 rounded-full bg-[var(--home-blob-2)] blur-[120px] animate-hero-glow" />
          <div className="absolute bottom-[18%] right-[32%] animate-hero-float">
            <div className="flex h-18 w-18 items-center justify-center rounded-[1.75rem] border border-white/30 bg-[var(--home-accent-gradient)] shadow-[0_20px_40px_var(--home-shadow-card)]">
              <HiSparkles className="text-2xl text-white" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
