import { useMemo } from "react";
import { FaArrowRight, FaGraduationCap } from "react-icons/fa";
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
      Array.from({ length: 32 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 12}s`,
        duration: `${10 + Math.random() * 9}s`,
        scale: 0.55 + Math.random() * 0.85,
        opacity: 0.22 + Math.random() * 0.5,
        drift: -70 + Math.random() * 140,
        rotate: Math.random() * 360,
      })),
    [],
  );

  return (
    <section
      className={`relative min-h-screen overflow-hidden transition-colors duration-500 ${
        isDark ? "bg-[#0f172a]" : "bg-[#fff8f8]"
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
              ? "bg-[linear-gradient(180deg,rgba(7,11,24,0.30)_0%,rgba(10,15,30,0.46)_28%,rgba(12,18,36,0.58)_62%,rgba(12,18,36,0.72)_100%)]"
              : "bg-[linear-gradient(180deg,rgba(255,250,250,0.16)_0%,rgba(255,248,248,0.28)_30%,rgba(255,247,247,0.46)_62%,rgba(255,246,246,0.62)_100%)]"
          }`}
        />
        <div
          className={`absolute inset-0 ${
            isDark
              ? "bg-[radial-gradient(circle_at_50%_42%,rgba(255,107,138,0.18),rgba(255,107,138,0.06)_28%,transparent_62%)]"
              : "bg-[radial-gradient(circle_at_50%_42%,rgba(255,172,194,0.18),rgba(255,172,194,0.08)_28%,transparent_62%)]"
          }`}
        />
        <div
          className={`absolute inset-0 ${
            isDark
              ? "bg-[linear-gradient(90deg,rgba(8,14,28,0.88)_0%,rgba(10,18,34,0.72)_26%,rgba(14,22,40,0.46)_54%,rgba(12,18,36,0.30)_100%)]"
              : "bg-[linear-gradient(90deg,rgba(255,248,248,0.78)_0%,rgba(255,248,248,0.56)_26%,rgba(255,248,248,0.30)_54%,rgba(255,248,248,0.16)_100%)]"
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
            className={`mb-7 inline-flex items-center gap-2 rounded-full border px-4 py-2 shadow-[0_10px_35px_rgba(255,120,150,0.14)] backdrop-blur-md ${
              isDark
                ? "border-[#ff6b8a]/25 bg-[#181b2b]/70"
                : "border-[#f3d6dd] bg-white/80"
            }`}
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full ${
                isDark
                  ? "bg-[#ff6b8a]/18 text-[#ff6b8a]"
                  : "bg-[#ffe7ee] text-[#e07c8e]"
              }`}
            >
              <HiSparkles className="text-sm" />
            </span>
            <span
              className={`text-[10px] font-extrabold uppercase tracking-[0.22em] sm:text-[11px] ${
                isDark ? "text-[#c1c4d0]" : "text-[#a66466]"
              }`}
            >
              Zamonaviy ta'lim platformasi
            </span>
          </div>

          <h1
            data-aos="fade-up"
            data-aos-delay="180"
            className={`mx-auto max-w-4xl text-4xl font-black leading-[1.02] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl ${
              isDark ? "text-[#f5f7fb]" : "text-[#7b4f53]"
            }`}
          >
            Ta'lim jarayonini
            <span className="mt-1 block bg-gradient-to-r from-[#ff7c9b] via-[#ff547c] to-[#ff9cb6] bg-clip-text text-transparent">
              yanada qiziqarli
            </span>
            <span
              className={`mt-1 block ${
                isDark ? "text-[#f5f7fb]" : "text-[#7b4f53]"
              }`}
            >
              va samarali qiling
            </span>
          </h1>

          <p
            data-aos="fade-up"
            data-aos-delay="240"
            className={`mx-auto mt-6 max-w-2xl text-sm leading-7 sm:text-base sm:leading-8 md:text-lg ${
              isDark ? "text-[#b5bac9]" : "text-[#8f6d70]"
            }`}
          >
            Interaktiv topshiriqlar, oson boshqaruv va natijalarni qulay
            kuzatish imkoniyati. O'qituvchi, o'quvchi va maktab uchun mos,
            chiroyli va zamonaviy yagona platforma.
          </p>

          <div
            className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            <button
              onClick={() => navigate("/games")}
              className="group inline-flex cursor-pointer items-center gap-3 rounded-full bg-gradient-to-r from-[#ff6b8a] to-[#ff4f74] px-7 py-4 text-sm font-extrabold tracking-[0.06em] text-white shadow-[0_18px_34px_rgba(255,107,138,0.32)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_40px_rgba(255,79,116,0.38)]"
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
      {petals.map((petal, index) => (
        <span
          key={petal.id}
          className="absolute top-[-12%] animate-petal-fall will-change-transform"
          style={{
            left: petal.left,
            animationDelay: petal.delay,
            animationDuration: petal.duration,
            opacity: petal.opacity,
            transform: `scale(${petal.scale}) rotate(${petal.rotate}deg)`,
            ["--drift" as string]: `${petal.drift}px`,
            filter: isDark
              ? "drop-shadow(0 8px 18px rgba(255,107,138,0.18))"
              : "drop-shadow(0 8px 18px rgba(244,160,180,0.24))",
          }}
        >
          {index % 3 === 0 ? (
            <PetalOne />
          ) : index % 3 === 1 ? (
            <PetalTwo />
          ) : (
            <PetalThree />
          )}
        </span>
      ))}
    </div>
  );
}

function PetalOne() {
  return (
    <svg
      width="28"
      height="32"
      viewBox="0 0 28 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-7 w-6"
    >
      <path
        d="M14.085 2.188C16.241 5.532 20.201 7.711 22.771 11.021C25.357 14.352 26.203 18.95 24.159 22.566C21.914 26.537 17.343 29.355 12.977 28.358C8.92 27.432 6.297 23.601 5.003 19.898C3.732 16.262 2.964 11.74 5.066 8.443C7.122 5.218 10.77 2.319 14.085 2.188Z"
        fill="url(#petal1-main)"
      />
      <path
        d="M8.7 22.4C11.6 20 15.5 15.6 18.8 9.8"
        stroke="url(#petal1-vein)"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.55"
      />
      <ellipse
        cx="17.8"
        cy="8.4"
        rx="3.1"
        ry="1.7"
        transform="rotate(-26 17.8 8.4)"
        fill="white"
        opacity="0.28"
      />
      <defs>
        <linearGradient
          id="petal1-main"
          x1="5"
          y1="4"
          x2="24"
          y2="28"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FFE5EE" />
          <stop offset="0.42" stopColor="#FFB7CB" />
          <stop offset="0.78" stopColor="#F58BA9" />
          <stop offset="1" stopColor="#E56E93" />
        </linearGradient>
        <linearGradient
          id="petal1-vein"
          x1="9"
          y1="21"
          x2="18"
          y2="10"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F7B6C8" />
          <stop offset="1" stopColor="#FFF4F8" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function PetalTwo() {
  return (
    <svg
      width="26"
      height="30"
      viewBox="0 0 26 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-7 w-6"
    >
      <path
        d="M12.826 1.725C14.292 4.759 17.554 7.078 19.661 9.796C22.147 13.002 23.191 17.177 21.762 20.976C20.276 24.927 16.232 28.258 12.008 27.786C7.944 27.331 4.978 24.28 3.376 20.836C1.901 17.666 1.061 13.691 2.74 10.484C4.605 6.919 8.849 3.621 12.826 1.725Z"
        fill="url(#petal2-main)"
      />
      <path
        d="M7.5 20.8C10.2 18.3 13.2 14.3 15.8 8.8"
        stroke="url(#petal2-vein)"
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.5"
      />
      <ellipse
        cx="15.7"
        cy="8.8"
        rx="2.6"
        ry="1.4"
        transform="rotate(-18 15.7 8.8)"
        fill="#FFF7FA"
        opacity="0.3"
      />
      <defs>
        <linearGradient
          id="petal2-main"
          x1="3"
          y1="3"
          x2="22"
          y2="27"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FFF0F5" />
          <stop offset="0.45" stopColor="#FFC2D3" />
          <stop offset="0.8" stopColor="#F79AB3" />
          <stop offset="1" stopColor="#EA7698" />
        </linearGradient>
        <linearGradient
          id="petal2-vein"
          x1="8"
          y1="19"
          x2="16"
          y2="9"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F4AFC1" />
          <stop offset="1" stopColor="#FFFFFF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function PetalThree() {
  return (
    <svg
      width="24"
      height="28"
      viewBox="0 0 24 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-5"
    >
      <path
        d="M11.96 1.681C13.883 4.263 16.925 5.996 19.144 8.606C21.429 11.294 22.257 14.948 20.907 18.136C19.27 22.002 15.085 25.034 10.97 24.636C7.309 24.282 4.888 21.28 3.63 18.189C2.46 15.312 1.937 11.692 3.525 8.986C5.245 6.054 8.61 2.882 11.96 1.681Z"
        fill="url(#petal3-main)"
      />
      <path
        d="M7.2 18.7C9.4 16.7 12 13.4 14.3 8.8"
        stroke="url(#petal3-vein)"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.45"
      />
      <ellipse
        cx="14.4"
        cy="8"
        rx="2.2"
        ry="1.2"
        transform="rotate(-20 14.4 8)"
        fill="white"
        opacity="0.24"
      />
      <defs>
        <linearGradient
          id="petal3-main"
          x1="3"
          y1="2"
          x2="20.5"
          y2="24"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FFEAF1" />
          <stop offset="0.5" stopColor="#FFBDD0" />
          <stop offset="0.82" stopColor="#F08CA8" />
          <stop offset="1" stopColor="#DB6B8D" />
        </linearGradient>
        <linearGradient
          id="petal3-vein"
          x1="7"
          y1="18"
          x2="14.5"
          y2="9"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F1A9BB" />
          <stop offset="1" stopColor="#FFF9FB" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function BackgroundDecorations({ isDark = false }: { isDark?: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      <div
        className={`absolute left-[8%] top-[14%] h-36 w-36 rounded-full blur-3xl ${
          isDark ? "bg-[#ff6b8a]/18" : "bg-[#ffd5df]/38"
        }`}
      />
      <div
        className={`absolute right-[10%] top-[20%] h-40 w-40 rounded-full blur-3xl ${
          isDark ? "bg-[#1e1e2f]/80" : "bg-[#ffd9e1]/28"
        }`}
      />
      <div
        className={`absolute bottom-[10%] left-[18%] h-40 w-40 rounded-full blur-3xl ${
          isDark ? "bg-[#ff4f74]/14" : "bg-[#ffe8ee]/56"
        }`}
      />
      <div
        className={`absolute bottom-[18%] right-[15%] h-28 w-28 rounded-full blur-3xl ${
          isDark ? "bg-[#f8a1b8]/10" : "bg-[#ffeef3]/55"
        }`}
      />

      <div
        className={`absolute left-[12%] top-[22%] h-2.5 w-2.5 rounded-full ${
          isDark ? "bg-white/60" : "bg-white/85"
        }`}
      />
      <div
        className={`absolute right-[18%] top-[31%] h-2 w-2 rounded-full ${
          isDark ? "bg-[#ff8ba3]/70" : "bg-[#f5bfd0]/80"
        }`}
      />
      <div
        className={`absolute left-[21%] bottom-[24%] h-3 w-3 rounded-full ${
          isDark ? "bg-[#20263b]" : "bg-[#f2d1d8]/60"
        }`}
      />
      <div
        className={`absolute right-[14%] bottom-[18%] h-2.5 w-2.5 rounded-full ${
          isDark ? "bg-white/50" : "bg-white/75"
        }`}
      />
    </div>
  );
}

export default Hero;