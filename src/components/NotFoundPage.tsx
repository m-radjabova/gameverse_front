import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaBookOpen,
  FaCompass,
  FaGamepad,
  FaGraduationCap,
  FaHome,
  FaRocket,
  FaStar,
} from "react-icons/fa";
import { GiBookshelf, GiFlowerTwirl, GiPlanetCore } from "react-icons/gi";
import { HiSparkles } from "react-icons/hi";
import { MdAutoAwesome, MdOutlineRocketLaunch } from "react-icons/md";
import useHomeTheme from "../hooks/useHomeTheme";

function NotFoundPage() {
  const navigate = useNavigate();
  const isDarkMode = useHomeTheme();
  const [countdown, setCountdown] = useState(10);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (countdown > 0) {
      const timer = window.setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => window.clearTimeout(timer);
    }
    navigate("/games");
  }, [countdown, navigate]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({
          x: ((e.clientX - rect.left) / rect.width - 0.5) * 20,
          y: ((e.clientY - rect.top) / rect.height - 0.5) * 20,
        });
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const suggestions = [
    { name: "Baamboozle", path: "/games/baamboozle", icon: "🎲", color: "from-amber-400 to-orange-500", bgColor: "bg-amber-50 dark:bg-amber-950/30" },
    { name: "Treasure Hunt", path: "/games/treasure-hunt", icon: "🗺️", color: "from-yellow-400 to-amber-600", bgColor: "bg-yellow-50 dark:bg-yellow-950/30" },
    { name: "Jumanji", path: "/games/jumanji", icon: "🌴", color: "from-emerald-400 to-teal-600", bgColor: "bg-emerald-50 dark:bg-emerald-950/30" },
    { name: "Quiz Battle", path: "/games/quiz-battle", icon: "⚡", color: "from-sky-400 to-cyan-600", bgColor: "bg-sky-50 dark:bg-sky-950/30" },
    { name: "Memory Rush", path: "/games/memory-rush", icon: "🧠", color: "from-violet-400 to-fuchsia-500", bgColor: "bg-violet-50 dark:bg-violet-950/30" },
    { name: "Word Battle", path: "/games/word-battle", icon: "📝", color: "from-blue-500 to-indigo-600", bgColor: "bg-blue-50 dark:bg-blue-950/30" },
  ];

  const quotes = useMemo(
    () => [
      { text: "Har bir yo'qolish, yangi kashfiyotning boshlanishi", author: "GameVerse" },
      { text: "Sahifa topilmasa ham, yaxshi yo'nalish hali ham bor", author: "Navigator" },
      { text: "404 bu yakun emas, balki yangi eshik ochilgan joy", author: "Quest Mode" },
      { text: "Yo'qolgan sahifalar ham yangi o'yinlarga olib boradi", author: "Play Hub" },
      { text: "Bilim va o'yin yo'li har doim davom etadi", author: "Home Theme" },
    ],
    [],
  );
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  const parallaxStyle = (factor: number) => ({
    transform: `translate(${mousePos.x * factor}px, ${mousePos.y * factor}px)`,
    transition: "transform 0.15s ease-out",
  });

  return (
    <div
      ref={containerRef}
      data-home-theme={isDarkMode ? "dark" : "light"}
      className="relative min-h-screen overflow-hidden bg-[var(--home-page-bg)] text-[var(--home-page-text)] transition-colors duration-500"
    >
      {/* Animated background blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,var(--home-blob-1),transparent_28%),radial-gradient(circle_at_80%_18%,var(--home-blob-3),transparent_24%),radial-gradient(circle_at_24%_82%,var(--home-blob-4),transparent_26%),linear-gradient(180deg,transparent,rgba(255,255,255,0.03))]" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, var(--home-muted) 1px, transparent 0)",
            backgroundSize: "36px 36px",
          }}
        />

        {/* Floating decorative elements with parallax */}
        <div style={parallaxStyle(0.4)} className="absolute left-[8%] top-[15%]">
          <div className="relative">
            <GiFlowerTwirl className="text-7xl text-[var(--home-muted)]/15 animate-[float_6s_ease-in-out_infinite]" />
            <div className="absolute -inset-4 rounded-full bg-[var(--home-accent)]/5 blur-2xl" />
          </div>
        </div>

        <div style={parallaxStyle(-0.3)} className="absolute right-[10%] top-[18%]">
          <div className="relative">
            <GiPlanetCore className="text-9xl text-[var(--home-accent-strong)]/10 animate-[spinSlow_20s_linear_infinite]" />
            <div className="absolute -inset-6 rounded-full bg-[var(--home-accent-strong)]/5 blur-3xl" />
          </div>
        </div>

        <div style={parallaxStyle(0.2)} className="absolute bottom-[12%] left-[12%]">
          <GiBookshelf className="text-8xl text-[var(--home-soft-text)]/15 animate-[float_8s_ease-in-out_infinite]" />
        </div>

        <div style={parallaxStyle(-0.25)} className="absolute right-[8%] bottom-[15%]">
          <FaBookOpen className="text-5xl text-[var(--home-muted)]/15 animate-[float_7s_ease-in-out_infinite]" />
        </div>

        {/* Additional floating particles */}
        <div style={parallaxStyle(0.15)} className="absolute left-[30%] top-[40%]">
          <div className="h-3 w-3 rounded-full bg-[var(--home-accent)]/10 animate-[float_5s_ease-in-out_infinite]" />
        </div>
        <div style={parallaxStyle(-0.2)} className="absolute right-[25%] top-[55%]">
          <div className="h-2 w-2 rounded-full bg-[var(--home-accent-strong)]/15 animate-[float_6s_ease-in-out_infinite_1s]" />
        </div>
        <div style={parallaxStyle(0.1)} className="absolute left-[60%] bottom-[30%]">
          <div className="h-4 w-4 rounded-full bg-[var(--home-accent)]/8 animate-[float_7s_ease-in-out_infinite_0.5s]" />
        </div>
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        {/* Top stats badges */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-4">
          <div className="group rounded-2xl border border-[var(--home-surface-border)] bg-[var(--home-surface-bg)] px-4 py-3 shadow-[0_18px_40px_var(--home-shadow-card-soft)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_var(--home-shadow-card)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--home-accent)]/10 transition-colors duration-300 group-hover:bg-[var(--home-accent)]/20">
                <FaGraduationCap className="text-lg text-[var(--home-accent)]" />
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--home-heading)]">50K+</p>
                <p className="text-[11px] text-[var(--home-body)]">O'quvchilar</p>
              </div>
            </div>
          </div>

          <div className="group rounded-2xl border border-[var(--home-surface-border)] bg-[var(--home-surface-bg)] px-4 py-3 shadow-[0_18px_40px_var(--home-shadow-card-soft)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_var(--home-shadow-card)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--home-accent-strong)]/10 transition-colors duration-300 group-hover:bg-[var(--home-accent-strong)]/20">
                <FaStar className="text-lg text-[var(--home-accent-strong)]" />
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--home-heading)]">4.9 ★</p>
                <p className="text-[11px] text-[var(--home-body)]">Reyting</p>
              </div>
            </div>
          </div>

          <div className="group rounded-2xl border border-[var(--home-surface-border)] bg-[var(--home-surface-bg)] px-4 py-3 shadow-[0_18px_40px_var(--home-shadow-card-soft)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_var(--home-shadow-card)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--home-accent-soft)]/10 transition-colors duration-300 group-hover:bg-[var(--home-accent-soft)]/20">
                <FaGamepad className="text-lg text-[var(--home-accent)]" />
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--home-heading)]">30+</p>
                <p className="text-[11px] text-[var(--home-body)]">O'yinlar</p>
              </div>
            </div>
          </div>
        </div>

        {/* 404 Hero Section */}
        <div className="relative mb-8 text-center">
          {/* Glow behind 404 */}
          <div className="absolute inset-0 flex items-center justify-center blur-3xl">
            <div
              className="bg-clip-text text-9xl font-black text-transparent opacity-20"
              style={{ backgroundImage: "var(--home-accent-gradient)" }}
            >
              404
            </div>
          </div>

          {/* 404 digits with planet */}
          <div className="relative flex items-center justify-center gap-2 sm:gap-4">
            <span
              style={parallaxStyle(-0.3)}
              className="text-8xl font-bold text-[var(--home-heading)] sm:text-[10rem] lg:text-[12rem] select-none"
            >
              4
            </span>

            <div
              style={parallaxStyle(0.2)}
              className="relative"
            >
              {/* Planet glow */}
              <div
                className="absolute inset-0 rounded-full blur-3xl opacity-40 animate-[pulse_3s_ease-in-out_infinite]"
                style={{ backgroundImage: "var(--home-accent-gradient)" }}
              />

              {/* Planet */}
              <div
                className="relative flex h-28 w-28 items-center justify-center rounded-full border border-white/30 shadow-[0_20px_60px_var(--home-shadow-card)] sm:h-36 sm:w-36 animate-[float_4s_ease-in-out_infinite]"
                style={{ backgroundImage: "var(--home-accent-gradient)" }}
              >
                <GiPlanetCore className="text-6xl text-white sm:text-7xl" />
                {/* Ring around planet */}
                <div className="absolute -inset-3 rounded-full border border-white/10" />
                <div className="absolute -inset-6 rounded-full border border-white/5" />
              </div>

              {/* Sparkles around planet */}
              <HiSparkles className="absolute -right-2 -top-2 text-2xl text-[var(--home-accent-strong)] animate-[sparkle_2s_ease-in-out_infinite]" />
              <HiSparkles className="absolute -left-3 -bottom-1 text-lg text-[var(--home-accent)] animate-[sparkle_2.5s_ease-in-out_infinite_0.5s]" />
              <HiSparkles className="absolute -right-1 bottom-0 text-base text-[var(--home-accent-soft)] animate-[sparkle_3s_ease-in-out_infinite_1s]" />
            </div>

            <span
              style={parallaxStyle(0.3)}
              className="text-8xl font-bold text-[var(--home-heading)] sm:text-[10rem] lg:text-[12rem] select-none"
            >
              4
            </span>
          </div>
        </div>

        {/* Content section */}
        <div className="mb-8 max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--home-surface-border)] bg-[var(--home-surface-bg)] px-5 py-2.5 shadow-[0_16px_36px_var(--home-shadow-card-soft)] backdrop-blur-xl transition-all duration-300 hover:shadow-[0_20px_44px_var(--home-shadow-card)]">
            <HiSparkles className="text-sm text-[var(--home-accent)]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--home-body)]">
              Sahifa topilmadi
            </span>
          </div>

          {/* Title */}
          <h1 className="mb-5 text-4xl font-light leading-tight sm:text-5xl lg:text-6xl">
            <span className="text-[var(--home-heading)]">Yo'l biroz </span>
            <span
              className="bg-clip-text font-semibold text-transparent"
              style={{ backgroundImage: "var(--home-accent-gradient)" }}
            >
              adashib qoldi
            </span>
          </h1>

          {/* Description */}
          <p className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-[var(--home-body)] sm:text-lg">
            Siz ochmoqchi bo'lgan sahifa mavjud emas yoki boshqa joyga ko'chirilgan.
            Eng to'g'ri yo'l hozir bosh sahifa yoki o'yinlar bo'limiga qaytish.
          </p>

          {/* Quote card */}
          <div className="group relative mx-auto max-w-xl cursor-default">
            {/* Subtle glow behind */}
            <div className="absolute -inset-4 rounded-3xl bg-[var(--home-accent)]/5 blur-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            <div className="relative rounded-3xl border border-[var(--home-surface-border)] bg-[var(--home-surface-bg-soft)] p-6 shadow-[0_20px_46px_var(--home-shadow-card-soft)] backdrop-blur-xl transition-all duration-500 hover:border-[var(--home-accent)]/30 hover:shadow-[0_28px_60px_var(--home-shadow-card)]">
              {/* Quote mark */}
              <div className="mb-2 text-left">
                <span className="text-4xl leading-none text-[var(--home-accent)]/30 font-serif">"</span>
              </div>

              <p className="mb-3 text-base font-medium italic leading-relaxed text-[var(--home-heading)]">
                {randomQuote.text}
              </p>

              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--home-soft-text)]">
                  — {randomQuote.author}
                </p>
                <div className="flex gap-1">
                  {[1, 2, 3].map((i) => (
                    <span key={i} className="h-1.5 w-1.5 rounded-full bg-[var(--home-accent)]/30" />
                  ))}
                </div>
              </div>

              <div className="mt-1 text-right">
                <span className="text-4xl leading-none text-[var(--home-accent)]/30 font-serif">"</span>
              </div>
            </div>
          </div>
        </div>

        {/* Countdown and action buttons */}
        <div className="mb-10 flex flex-col items-center gap-5">
          {/* Countdown indicator */}
          <div className="group inline-flex items-center gap-3 rounded-full border border-[var(--home-surface-border)] bg-[var(--home-surface-bg)] px-5 py-2.5 shadow-[0_16px_36px_var(--home-shadow-card-soft)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_44px_var(--home-shadow-card)]">
            <div className="relative flex h-6 w-6 items-center justify-center">
              {/* Countdown ring */}
              <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 24 24">
                <circle
                  cx="12" cy="12" r="10"
                  fill="none"
                  stroke="var(--home-surface-border)"
                  strokeWidth="2"
                />
                <circle
                  cx="12" cy="12" r="10"
                  fill="none"
                  stroke="var(--home-accent)"
                  strokeWidth="2"
                  strokeDasharray={`${(countdown / 10) * 62.83} 62.83`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <span className="text-[10px] font-bold text-[var(--home-accent)]">{countdown}</span>
            </div>
            <span className="text-xs text-[var(--home-body)]">
              <span className="font-semibold text-[var(--home-accent)]">{countdown}</span> soniyadan keyin o'yinlarga o'tamiz
            </span>
            <MdOutlineRocketLaunch className="text-sm text-[var(--home-accent)]" />
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/games"
              className="group relative inline-flex cursor-pointer items-center gap-2 overflow-hidden rounded-full px-7 py-3.5 text-sm font-bold text-slate-950 shadow-[0_18px_40px_var(--home-shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_56px_var(--home-shadow-card)] active:translate-y-0"
              style={{ backgroundImage: "var(--home-accent-gradient)" }}
            >
              <span className="relative z-10 flex items-center gap-2">
                <FaGamepad className="text-sm transition-transform duration-300 group-hover:rotate-12" />
                O'yinlarga o'tish
              </span>
              <div className="absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-500 group-hover:translate-x-0" />
            </Link>

            <Link
              to="/"
              className="group inline-flex cursor-pointer items-center gap-2 rounded-full border border-[var(--home-surface-border)] bg-[var(--home-surface-bg)] px-7 py-3.5 text-sm font-bold text-[var(--home-heading)] shadow-[0_16px_36px_var(--home-shadow-card-soft)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[var(--home-accent)]/30 hover:bg-[var(--home-surface-bg-hover)] hover:shadow-[0_22px_50px_var(--home-shadow-card)] active:translate-y-0"
            >
              <FaHome className="text-sm transition-transform duration-300 group-hover:-translate-y-0.5" />
              Bosh sahifa
            </Link>

            <button
              onClick={() => navigate(-1)}
              className="group inline-flex cursor-pointer items-center gap-2 rounded-full border border-[var(--home-surface-border)] bg-[var(--home-surface-bg)] px-7 py-3.5 text-sm font-bold text-[var(--home-heading)] shadow-[0_16px_36px_var(--home-shadow-card-soft)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[var(--home-accent)]/30 hover:bg-[var(--home-surface-bg-hover)] hover:shadow-[0_22px_50px_var(--home-shadow-card)] active:translate-y-0"
            >
              <FaArrowLeft className="text-sm transition-transform duration-300 group-hover:-translate-x-1" />
              Orqaga
            </button>
          </div>
        </div>

        {/* Suggested games section */}
        <div className="w-full max-w-5xl rounded-[2rem] border border-[var(--home-surface-border)] bg-[var(--home-surface-bg-soft)] p-6 shadow-[0_24px_60px_var(--home-shadow-card-soft)] backdrop-blur-xl transition-all duration-500 hover:shadow-[0_32px_76px_var(--home-shadow-card)] sm:p-8">
          {/* Section header */}
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--home-accent)]/10">
              <MdAutoAwesome className="text-xl text-[var(--home-accent)]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--home-heading)]">Sizga tavsiya qilamiz</h2>
              <p className="text-xs text-[var(--home-body)]">Eng mashhur o'yinlarimizni sinab ko'ring</p>
            </div>
          </div>

          {/* Game cards grid */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {suggestions.map((game, index) => (
              <Link
                key={game.path}
                to={game.path}
                className="group relative cursor-pointer overflow-hidden rounded-2xl border border-[var(--home-surface-border)] bg-[var(--home-surface-bg)] p-4 text-center shadow-[0_16px_34px_var(--home-shadow-card-soft)] transition-all duration-300 hover:-translate-y-2 hover:border-[var(--home-accent)]/40 hover:bg-[var(--home-surface-bg-hover)] hover:shadow-[0_24px_48px_var(--home-shadow-card)]"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Hover background effect */}
                <div className={`absolute inset-0 ${game.bgColor} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />

                {/* Icon */}
                <div className={`relative mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r ${game.color} text-xl text-white shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl`}>
                  <span className="drop-shadow-sm">{game.icon}</span>
                </div>

                {/* Name */}
                <h3 className="relative text-sm font-semibold text-[var(--home-heading)] transition-colors duration-300 group-hover:text-[var(--home-accent)]">
                  {game.name}
                </h3>

                {/* Bottom accent bar */}
                <div className={`absolute inset-x-4 bottom-0 h-1 rounded-full bg-gradient-to-r ${game.color} opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:h-1.5`} />

                {/* Top-right corner indicator */}
                <div className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--home-accent)]/0 transition-all duration-300 group-hover:bg-[var(--home-accent)]/40" />
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom decoration */}
        <FaCompass className="pointer-events-none fixed bottom-8 right-8 text-4xl text-[var(--home-muted)]/10 animate-[float_6s_ease-in-out_infinite]" />
        <FaRocket className="pointer-events-none fixed bottom-8 left-8 text-3xl text-[var(--home-accent)]/10 animate-[float_7s_ease-in-out_infinite_1s]" />
      </div>
    </div>
  );
}

export default NotFoundPage;
