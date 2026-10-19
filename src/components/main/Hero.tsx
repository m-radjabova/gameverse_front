import { useEffect, useRef, useState, type CSSProperties } from "react";
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

/**
 * Rasm faqat sichqoncha (yoki barmoq) atrofida ochiladi.
 * --hx / --hy / --hr CSS o'zgaruvchilari JS tomonidan har kadrda yangilanadi
 * (React state ishlatilmaydi, shuning uchun qayta render bo'lmaydi).
 */
const REVEAL_MASK =
  "radial-gradient(circle var(--hr) at var(--hx) var(--hy), #000 0%, rgba(0,0,0,0.94) 36%, rgba(0,0,0,0.5) 66%, transparent 100%)";

function Hero({
  activeNav,
  isDark = false,
  onNavClick,
  onThemeToggle,
}: HeroProps) {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);
  const [hintVisible, setHintVisible] = useState(true);
  const hintHiddenRef = useRef(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = section.clientWidth;
    let height = section.clientHeight;

    const baseRadius = () => Math.max(150, Math.min(320, width * 0.21));
    const idlePoint = (time: number) => ({
      x: width * 0.64 + Math.sin(time * 0.00035) * width * 0.22,
      y: height * 0.46 + Math.sin(time * 0.00052 + 1.2) * height * 0.17,
    });

    const state = {
      x: width * 0.64,
      y: height * 0.46,
      r: reduceMotion ? baseRadius() * 0.9 : 1,
      targetX: width * 0.64,
      targetY: height * 0.46,
      targetR: baseRadius() * 0.9,
      pointerActive: false,
      isTouch: false,
      lastMove: 0,
      boost: 1,
      pressed: false,
    };

    const apply = () => {
      section.style.setProperty("--hx", `${state.x.toFixed(1)}px`);
      section.style.setProperty("--hy", `${state.y.toFixed(1)}px`);
      section.style.setProperty("--hr", `${Math.max(1, state.r).toFixed(1)}px`);
    };

    const updateTargetRadius = () => {
      state.targetR = baseRadius() * state.boost * (state.pressed ? 1.35 : 1);
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = section.getBoundingClientRect();
      state.targetX = event.clientX - rect.left;
      state.targetY = event.clientY - rect.top;
      state.pointerActive = true;
      state.isTouch = event.pointerType === "touch";
      state.lastMove = performance.now();

      const target = event.target as HTMLElement | null;
      state.boost = target?.closest("button, a, [data-hero-interactive]") ? 1.3 : 1;
      updateTargetRadius();

      if (!hintHiddenRef.current) {
        hintHiddenRef.current = true;
        setHintVisible(false);
      }
      if (reduceMotion) {
        state.x = state.targetX;
        state.y = state.targetY;
        state.r = state.targetR;
        apply();
      }
    };
    const onPointerLeave = () => {
      state.pointerActive = false;
      state.boost = 1;
      updateTargetRadius();
    };
    const onPointerDown = () => {
      state.pressed = true;
      updateTargetRadius();
    };
    const onPointerUp = () => {
      state.pressed = false;
      updateTargetRadius();
    };

    section.addEventListener("pointermove", onPointerMove, { passive: true });
    section.addEventListener("pointerleave", onPointerLeave);
    section.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    window.addEventListener("pointercancel", onPointerUp, { passive: true });

    const resizeObserver = new ResizeObserver(() => {
      width = section.clientWidth;
      height = section.clientHeight;
      updateTargetRadius();
      if (reduceMotion) apply();
    });
    resizeObserver.observe(section);

    apply();

    let frame = 0;
    let last = performance.now();
    let running = false;

    const tick = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;

      // Sichqoncha ekranda bo'lmasa (yoki barmoq qo'yilganiga biroz bo'lsa) — o'zi sekin suzib yuradi.
      const idle = !state.pointerActive || (state.isTouch && now - state.lastMove > 1400);
      if (idle) {
        const point = idlePoint(now);
        state.targetX = point.x;
        state.targetY = point.y;
        state.targetR = baseRadius() * 0.62;
      }

      const positionEase = 1 - Math.exp(-dt / 120);
      const radiusEase = 1 - Math.exp(-dt / 220);
      state.x += (state.targetX - state.x) * positionEase;
      state.y += (state.targetY - state.y) * positionEase;
      state.r += (state.targetR - state.r) * radiusEase;
      apply();

      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running || reduceMotion) return;
      running = true;
      last = performance.now();
      frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(frame);
    };

    // Hero ko'rinmay qolganda animatsiya to'xtaydi (batareya va CPU tejaladi).
    const visibilityObserver = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()), {
      threshold: 0.01,
    });
    visibilityObserver.observe(section);

    return () => {
      stop();
      visibilityObserver.disconnect();
      resizeObserver.disconnect();
      section.removeEventListener("pointermove", onPointerMove);
      section.removeEventListener("pointerleave", onPointerLeave);
      section.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, []);

  const currentImage = isDark ? darkHeroImg : heroImg;

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen overflow-hidden bg-[var(--home-section-hero-bg)] transition-colors duration-500"
      style={{ "--hx": "64%", "--hy": "46%", "--hr": "1px" } as CSSProperties}
    >
      {/* ───── Orqa fon ───── */}
      <div className="absolute inset-0" aria-hidden="true">
        {/* 1) Xira, "tuman" ichidagi rasm */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={currentImage}
            alt=""
            fetchPriority="high"
            decoding="async"
            className="h-full w-full object-cover blur-[3px] saturate-[0.3] animate-hero-ken-burns"
          />
          <div className={`absolute inset-0 ${isDark ? "bg-[#070b18]/80" : "bg-white/78"}`} />
        </div>

        {/* 2) Kursor atrofida ochiladigan, to'liq rangli rasm */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            WebkitMaskImage: REVEAL_MASK,
            maskImage: REVEAL_MASK,
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
          }}
        >
          <img
            src={currentImage}
            alt=""
            fetchPriority="high"
            decoding="async"
            className="h-full w-full object-cover animate-hero-ken-burns"
          />
        </div>

        {/* 3) Ochilgan joy atrofidagi yumshoq nur */}
        <div
          className="absolute inset-0 mix-blend-screen"
          style={{
            background: `radial-gradient(circle calc(var(--hr) * 1.15) at var(--hx) var(--hy), ${
              isDark ? "rgba(89,185,230,0.22)" : "rgba(126,201,232,0.28)"
            }, transparent 70%)`,
          }}
        />

        {/* 4) Matn o'qilishi uchun chap tomondagi yengil qoplama va yuqori/past silliqlash */}
        <div
          className={`absolute inset-0 ${
            isDark
              ? "bg-[linear-gradient(90deg,rgba(8,14,28,0.66)_0%,rgba(10,18,34,0.36)_36%,transparent_70%)]"
              : "bg-[linear-gradient(90deg,rgba(255,248,248,0.62)_0%,rgba(255,248,248,0.32)_36%,transparent_70%)]"
          }`}
        />
        <div
          className={`absolute inset-x-0 top-0 h-40 ${
            isDark
              ? "bg-[linear-gradient(180deg,rgba(7,11,24,0.55),transparent)]"
              : "bg-[linear-gradient(180deg,rgba(255,255,255,0.55),transparent)]"
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
        <div className="w-full max-w-4xl text-center lg:ml-40 lg:max-w-[54rem] lg:translate-y-4 lg:text-left xl:translate-y-2">
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

      {/* Kichik ko'rsatma: birinchi harakatdan keyin yo'qoladi */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute bottom-8 left-1/2 z-20 -translate-x-1/2 transition-opacity duration-700 ${
          hintVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold backdrop-blur-md ${
            isDark
              ? "border-white/15 bg-[#121c2d]/70 text-white/80"
              : "border-[var(--home-surface-border)] bg-[var(--home-surface-bg)] text-[var(--home-muted)]"
          }`}
        >
          <HiSparkles className="text-sm text-[var(--home-accent)]" />
        </div>
      </div>
    </section>
  );
}

export default Hero;