import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaBookOpen,
  FaCompass,
  FaGamepad,
  FaGraduationCap,
  FaHome,
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

  useEffect(() => {
    if (countdown > 0) {
      const timer = window.setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => window.clearTimeout(timer);
    }

    navigate("/games");
  }, [countdown, navigate]);

  const suggestions = [
    { name: "Baamboozle", path: "/games/baamboozle", icon: "🎲", color: "from-amber-400 to-orange-400" },
    { name: "Treasure Hunt", path: "/games/treasure-hunt", icon: "🗺️", color: "from-yellow-400 to-amber-500" },
    { name: "Jumanji", path: "/games/jumanji", icon: "🌴", color: "from-emerald-400 to-teal-500" },
    { name: "Quiz Battle", path: "/games/quiz-battle", icon: "⚡", color: "from-sky-400 to-cyan-500" },
    { name: "Memory Rush", path: "/games/memory-rush", icon: "🧠", color: "from-violet-400 to-fuchsia-500" },
    { name: "Word Battle", path: "/games/word-battle", icon: "📝", color: "from-blue-500 to-indigo-500" },
  ];

  const quotes = useMemo(
    () => [
      { text: "Har bir yo'qolish, yangi kashfiyotning boshlanishi", author: "GameVerse" },
      { text: "Sahifa topilmasa ham, yaxshi yo'nalish hali ham bor", author: "Navigator" },
      { text: "404 bu yakun emas, boshqa eshik ochilgan joy", author: "Quest Mode" },
      { text: "Yo'qolgan sahifalar ham yangi o'yinlarga olib boradi", author: "Play Hub" },
      { text: "Bilim va o'yin yo'li har doim davom etadi", author: "Home Theme" },
    ],
    [],
  );
  const randomQuote = quotes[3];

  return (
    <div
      data-home-theme={isDarkMode ? "dark" : "light"}
      className="relative min-h-screen overflow-hidden bg-[var(--home-page-bg)] text-[var(--home-page-text)] transition-colors duration-500"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,var(--home-blob-1),transparent_28%),radial-gradient(circle_at_80%_18%,var(--home-blob-3),transparent_24%),radial-gradient(circle_at_24%_82%,var(--home-blob-4),transparent_26%),linear-gradient(180deg,transparent,rgba(255,255,255,0.03))]" />
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, var(--home-muted) 1px, transparent 0)",
            backgroundSize: "36px 36px",
          }}
        />
        <GiFlowerTwirl className="absolute left-[10%] top-[18%] text-6xl text-[var(--home-muted)]/20 animate-float-soft" />
        <GiPlanetCore className="absolute right-[12%] top-[20%] text-8xl text-[var(--home-accent-strong)]/15 animate-spin-slow" />
        <GiBookshelf className="absolute bottom-[14%] left-[14%] text-7xl text-[var(--home-soft-text)]/20 animate-float-slow" />
        <FaBookOpen className="absolute right-[10%] bottom-[18%] text-4xl text-[var(--home-muted)]/20 animate-float-soft" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-center gap-4">
          <div className="rounded-2xl border border-[var(--home-surface-border)] bg-[var(--home-surface-bg)] px-4 py-3 shadow-[0_18px_40px_var(--home-shadow-card-soft)] backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <FaGraduationCap className="text-lg text-[var(--home-accent)]" />
              <div>
                <p className="text-xs font-bold text-[var(--home-heading)]">50K+</p>
                <p className="text-[11px] text-[var(--home-body)]">O'quvchilar</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-[var(--home-surface-border)] bg-[var(--home-surface-bg)] px-4 py-3 shadow-[0_18px_40px_var(--home-shadow-card-soft)] backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <FaStar className="text-lg text-[var(--home-accent-strong)]" />
              <div>
                <p className="text-xs font-bold text-[var(--home-heading)]">4.9 ★</p>
                <p className="text-[11px] text-[var(--home-body)]">Reyting</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative mb-8 text-center">
          <div className="absolute inset-0 blur-3xl">
            <div className="bg-[var(--home-accent-gradient)] bg-clip-text text-9xl font-black text-transparent opacity-25">
              404
            </div>
          </div>
          <div className="relative flex items-center justify-center gap-2 sm:gap-4">
            <span className="text-7xl font-light text-[var(--home-heading)] sm:text-9xl">4</span>
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-[var(--home-accent-gradient)] blur-2xl opacity-55" />
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-white/30 bg-[var(--home-accent-gradient)] shadow-[0_20px_50px_var(--home-shadow-card)] sm:h-32 sm:w-32">
                <GiPlanetCore className="text-5xl text-white sm:text-6xl" />
              </div>
              <HiSparkles className="absolute -right-1 -top-1 text-xl text-[var(--home-accent-strong)]" />
            </div>
            <span className="text-7xl font-light text-[var(--home-heading)] sm:text-9xl">4</span>
          </div>
        </div>

        <div className="mb-8 max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--home-surface-border)] bg-[var(--home-surface-bg)] px-5 py-2.5 shadow-[0_16px_36px_var(--home-shadow-card-soft)] backdrop-blur-xl">
            <HiSparkles className="text-sm text-[var(--home-accent)]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--home-body)]">
              Sahifa topilmadi
            </span>
          </div>

          <h1 className="mb-4 text-4xl font-light leading-tight sm:text-5xl lg:text-6xl">
            <span className="text-[var(--home-heading)]">Yo'l biroz </span>
            <span className="bg-[var(--home-accent-gradient)] bg-clip-text font-medium text-transparent">
              adashib qoldi
            </span>
          </h1>

          <p className="mb-6 text-base leading-relaxed text-[var(--home-body)] sm:text-lg">
            Siz ochmoqchi bo'lgan sahifa mavjud emas yoki boshqa joyga ko'chirilgan.
            Eng to'g'ri yo'l hozir bosh sahifa yoki o'yinlar bo'limiga qaytish.
          </p>

          <div className="mx-auto max-w-xl rounded-3xl border border-[var(--home-surface-border)] bg-[var(--home-surface-bg-soft)] p-5 shadow-[0_20px_46px_var(--home-shadow-card-soft)] backdrop-blur-xl">
            <p className="mb-2 text-sm italic text-[var(--home-heading)]">"{randomQuote.text}"</p>
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--home-soft-text)]">{randomQuote.author}</p>
          </div>
        </div>

        <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-[var(--home-surface-border)] bg-[var(--home-surface-bg)] px-5 py-2.5 shadow-[0_16px_36px_var(--home-shadow-card-soft)] backdrop-blur-xl">
          <MdOutlineRocketLaunch className="text-sm text-[var(--home-accent)]" />
          <span className="text-xs text-[var(--home-body)]">
            <span className="font-bold text-[var(--home-accent)]">{countdown}</span> soniyadan keyin o'yinlarga o'tamiz
          </span>
        </div>

        <div className="mb-12 flex flex-wrap justify-center gap-3">
          <Link
            to="/games"
            className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[var(--home-accent-gradient)] px-6 py-3 text-sm font-bold text-slate-950 shadow-[0_18px_40px_var(--home-shadow-card)] transition-all hover:-translate-y-1 hover:shadow-[0_24px_50px_var(--home-shadow-card)]"
          >
            <FaGamepad className="text-sm" />
            O'yinlarga o'tish
          </Link>

          <Link
            to="/"
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[var(--home-surface-border)] bg-[var(--home-surface-bg)] px-6 py-3 text-sm font-bold text-[var(--home-heading)] shadow-[0_16px_36px_var(--home-shadow-card-soft)] backdrop-blur-xl transition-all hover:-translate-y-1 hover:bg-[var(--home-surface-bg-hover)]"
          >
            <FaHome className="text-sm" />
            Bosh sahifa
          </Link>

          <button
            onClick={() => navigate(-1)}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[var(--home-surface-border)] bg-[var(--home-surface-bg)] px-6 py-3 text-sm font-bold text-[var(--home-heading)] shadow-[0_16px_36px_var(--home-shadow-card-soft)] backdrop-blur-xl transition-all hover:-translate-y-1 hover:bg-[var(--home-surface-bg-hover)]"
          >
            <FaArrowLeft className="text-sm" />
            Orqaga
          </button>
        </div>

        <div className="w-full max-w-5xl rounded-[2rem] border border-[var(--home-surface-border)] bg-[var(--home-surface-bg-soft)] p-5 shadow-[0_24px_60px_var(--home-shadow-card-soft)] backdrop-blur-xl sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <MdAutoAwesome className="text-xl text-[var(--home-accent)]" />
            <h2 className="text-lg font-semibold text-[var(--home-heading)]">Sizga tavsiya qilamiz</h2>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {suggestions.map((game) => (
              <Link
                key={game.path}
                to={game.path}
                className="group relative cursor-pointer overflow-hidden rounded-2xl border border-[var(--home-surface-border)] bg-[var(--home-surface-bg)] p-4 text-center shadow-[0_16px_34px_var(--home-shadow-card-soft)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[var(--home-accent)]/40 hover:bg-[var(--home-surface-bg-hover)]"
              >
                <div className={`mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-r ${game.color} text-lg text-white shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                  <span>{game.icon}</span>
                </div>
                <h3 className="text-xs font-semibold text-[var(--home-heading)]">{game.name}</h3>
                <div className="absolute inset-x-4 bottom-0 h-1 rounded-full bg-[var(--home-accent-gradient)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </Link>
            ))}
          </div>
        </div>

        <FaCompass className="pointer-events-none absolute bottom-20 right-6 text-3xl text-[var(--home-muted)]/20 animate-float-slow" />
      </div>
    </div>
  );
}

export default NotFoundPage;
