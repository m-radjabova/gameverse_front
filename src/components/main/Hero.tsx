import { useMemo } from "react";
import { FaArrowRight, FaGraduationCap} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import { useNavigate } from "react-router-dom";

import darkHeroImg from "../../assets/hero_dark_mode.png";
import heroImg from "../../assets/hero_img.png";
import Header from "../header/Header";

type Petal = {
  id: number;
  left: string;
  delay: string;
  duration: string;
  scale: number;
  opacity: number;
  drift: number;
  rotate: number;
};

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

  const petals = useMemo<Petal[]>(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 10}s`,
        duration: `${12 + Math.random() * 10}s`,
        scale: 0.45 + Math.random() * 0.9,
        opacity: 0.18 + Math.random() * 0.45,
        drift: -40 + Math.random() * 80,
        rotate: Math.random() * 360,
      })),
    [],
  );

  return (
    <section
      className={`relative min-h-screen overflow-hidden transition-colors duration-500 ${
        isDark ? "bg-[#0f172a]" : ""
      }`}
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
              ? "bg-[linear-gradient(180deg,rgba(15,23,42,0.35)_0%,rgba(15,23,42,0.45)_35%,rgba(15,23,42,0.55)_72%,rgba(15,23,42,0.65)_100%)]"
              : "bg-[linear-gradient(180deg,rgba(255,250,249,0.20)_0%,rgba(255,248,247,0.30)_35%,rgba(255,248,247,0.50)_72%,rgba(255,248,247,0.70)_100%)]"
          }`}
        />
        <div
          className={`absolute inset-0 ${
            isDark
              ? "bg-[radial-gradient(circle_at_center,rgba(255,107,138,0.20),rgba(30,30,47,0.08)_35%,transparent_70%)]"
              : "bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.18),rgba(255,255,255,0.05)_35%,transparent_70%)]"
          }`}
        />
        <div
          className={`absolute inset-0 ${
            isDark
              ? "bg-[linear-gradient(90deg,rgba(15,23,42,0.92)_0%,rgba(15,23,42,0.74)_26%,rgba(30,30,47,0.48)_52%,rgba(15,23,42,0.32)_100%)]"
              : "bg-[linear-gradient(90deg,rgba(255,248,247,0.82)_0%,rgba(255,248,247,0.62)_26%,rgba(255,248,247,0.32)_52%,rgba(255,248,247,0.20)_100%)]"
          }`}
        />
      </div>

      <BackgroundDecorations isDark={isDark} />
      <FallingPetals isDark={isDark} petals={petals} />

      <Header
        active={activeNav}
        isDark={isDark}
        onNavClick={onNavClick}
        onThemeToggle={onThemeToggle}
      />

      <div className="relative z-20 mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 pb-14 pt-32 sm:px-6 sm:pt-36">
        <div className="w-full max-w-4xl text-center">
          <div
            data-aos="zoom-in"
            data-aos-delay="120"
            className={`mb-7 inline-flex items-center gap-2 rounded-full border px-4 py-2 shadow-[0_10px_30px_rgba(166,100,102,0.10)] backdrop-blur-md ${
              isDark
                ? "border-[#ff6b8a]/25 bg-[#1e1e2f]/72"
                : "border-[#f0d9d6] bg-white/85"
            }`}
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full ${
                isDark
                  ? "bg-[#ff6b8a]/18 text-[#ff6b8a]"
                  : "bg-[#fbe7e5] text-[#e07c8e]"
              }`}
            >
              <HiSparkles className="text-sm" />
            </span>
            <span
              className={`text-[10px] font-extrabold uppercase tracking-[0.22em] sm:text-[11px] ${
                isDark ? "text-[#a1a1aa]" : "text-[#a66466]"
              }`}
            >
              Zamonaviy ta'lim platformasi
            </span>
          </div>

          <h1
            data-aos="fade-up"
            data-aos-delay="180"
            className={`mx-auto max-w-4xl text-4xl font-black leading-[1.02] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl ${
              isDark ? "text-[#f1f1f1]" : "text-[#7b4f53]"
            }`}
          >
            Ta'lim jarayonini
            <span className="mt-1 block bg-gradient-to-r from-[#ff6b8a] via-[#ff4f74] to-[#ff8ba3] bg-clip-text text-transparent">
              yanada qiziqarli
            </span>
            <span
              className={`mt-1 block ${isDark ? "text-[#f1f1f1]" : "text-[#7b4f53]"}`}
            >
              va samarali qiling
            </span>
          </h1>

          <p
            data-aos="fade-up"
            data-aos-delay="240"
            className={`mx-auto mt-6 max-w-2xl text-sm leading-7 sm:text-base sm:leading-8 md:text-lg ${
              isDark ? "text-[#a1a1aa]" : "text-[#8f6d70]"
            }`}
          >
            Interaktiv topshiriqlar, oson boshqaruv va natijalarni qulay
            kuzatish imkoniyati. O'qituvchi, o'quvchi va maktab uchun mos,
            chiroyli va zamonaviy yagona platforma.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row" data-aos="fade-up" data-aos-delay="300">
            <button
              onClick={() => navigate("/games")}
              className="group inline-flex cursor-pointer items-center gap-3 rounded-full bg-gradient-to-r from-[#ff6b8a] to-[#ff4f74] px-7 py-4 text-sm font-extrabold tracking-[0.06em] text-white shadow-[0_16px_30px_rgba(255,107,138,0.30)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_36px_rgba(255,79,116,0.36)]"
            >
              <FaGraduationCap className="text-base" />
              Boshlash
              <FaArrowRight className="text-xs transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function FallingPetals({
  isDark = false,
  petals,
}: {
  isDark?: boolean;
  petals: Petal[];
}) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      {petals.map((petal) => (
        <span
          key={petal.id}
          className="absolute top-[-10%] animate-petal-fall"
          style={{
            left: petal.left,
            animationDelay: petal.delay,
            animationDuration: petal.duration,
            opacity: petal.opacity,
            transform: `scale(${petal.scale}) rotate(${petal.rotate}deg)`,
            ["--drift" as string]: `${petal.drift}px`,
          }}
        >
          <svg
            width="24"
            height="18"
            viewBox="0 0 24 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-[0_6px_12px_rgba(224,124,142,0.14)]"
          >
            <path
              d="M11.463 1.07C8.632-1.419 3.319 0.023 1.744 3.739C0.233 7.304 2.751 11.317 6.342 12.159C7.981 12.544 9.53 12.298 10.906 11.616C10.846 13.431 11.308 15.315 12.612 16.744C15.356 19.739 20.706 19.196 22.68 15.438C24.734 11.528 22.119 6.502 17.588 6.037C16.618 5.938 15.662 6.048 14.775 6.334C15.198 4.293 14.562 2.136 12.571 1.112L11.463 1.07Z"
              fill={isDark ? "#ff6b8a" : "#f4c7cf"}
            />
          </svg>
        </span>
      ))}
    </div>
  );
}

function BackgroundDecorations({ isDark = false }: { isDark?: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      <div
        className={`absolute left-[8%] top-[18%] h-28 w-28 rounded-full blur-3xl ${
          isDark ? "bg-[#ff6b8a]/20" : "bg-[#f6d9db]/35"
        }`}
      />
      <div
        className={`absolute right-[10%] top-[24%] h-32 w-32 rounded-full blur-3xl ${
          isDark ? "bg-[#1e1e2f]/80" : "bg-[#f1c5cd]/30"
        }`}
      />
      <div
        className={`absolute bottom-[12%] left-[20%] h-36 w-36 rounded-full blur-3xl ${
          isDark ? "bg-[#ff4f74]/16" : "bg-[#f7ebe0]/55"
        }`}
      />

      <div
        className={`absolute left-[14%] top-[22%] h-2.5 w-2.5 rounded-full ${isDark ? "bg-[#f1f1f1]/60" : "bg-white/70"}`}
      />
      <div
        className={`absolute right-[20%] top-[30%] h-2 w-2 rounded-full ${isDark ? "bg-[#ff6b8a]/70" : "bg-[#f3cbd1]/70"}`}
      />
      <div
        className={`absolute left-[22%] bottom-[22%] h-3 w-3 rounded-full ${isDark ? "bg-[#1e1e2f]" : "bg-[#eed0d4]/50"}`}
      />
      <div
        className={`absolute right-[14%] bottom-[18%] h-2.5 w-2.5 rounded-full ${isDark ? "bg-[#f1f1f1]/50" : "bg-white/60"}`}
      />
    </div>
  );
}

export default Hero;
