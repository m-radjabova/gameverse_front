import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaExclamationTriangle, FaGamepad } from "react-icons/fa";
import { MdFullscreen, MdFullscreenExit } from "react-icons/md";

export default function GameLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isExitDialogOpen, setIsExitDialogOpen] = useState(false);
  const pendingExitRef = useRef<(() => void) | null>(null);
  const isIntentionalExitRef = useRef(false);
  const lastScrollYRef = useRef(0);
  const controlTheme = (() => {
    if (location.pathname.includes("/mini-puzzle")) {
      return {
        button: "bg-gradient-to-r from-pink-500 to-rose-500",
        backShadow: "hover:shadow-[0_0_30px_rgba(236,72,153,0.7)]",
        fullscreenShadow: "hover:shadow-[0_0_30px_rgba(244,114,182,0.7)]",
      };
    }

    if (location.pathname.includes("/reverse-thinking")) {
      return {
        button: "bg-gradient-to-r from-green-500 to-emerald-500",
        backShadow: "hover:shadow-[0_0_30px_rgba(16,185,129,0.7)]",
        fullscreenShadow: "hover:shadow-[0_0_30px_rgba(52,211,153,0.7)]",
      };
    }

    if (
      location.pathname.includes("/jumanji") ||
      location.pathname.includes("/millionaire") ||
      location.pathname.includes("/math-race") ||
      location.pathname.includes("/quiz-battle") ||
      location.pathname.includes("/treasure-hunt") ||
      location.pathname.includes("/pizza-master") ||
      location.pathname.includes("/baamboozle") ||
      location.pathname.includes("/hangman")
    ) {
      return {
        button: "bg-gradient-to-r from-yellow-500 to-orange-500",
        backShadow: "hover:shadow-[0_0_30px_rgba(245,158,11,0.7)]",
        fullscreenShadow: "hover:shadow-[0_0_30px_rgba(249,115,22,0.7)]",
      };
    }

    if (
      location.pathname.includes("/truth-detector") ||
      location.pathname.includes("/wheel-of-fortune") ||
      location.pathname.includes("/classic-arcade") ||
      location.pathname.includes("/word-chain") ||
      location.pathname.includes("/word-battle") ||
      location.pathname.includes("/bingo")
    ) {
      return {
        button: "bg-gradient-to-r from-indigo-500 to-pink-500",
        backShadow: "hover:shadow-[0_0_30px_rgba(99,102,241,0.7)]",
        fullscreenShadow: "hover:shadow-[0_0_30px_rgba(236,72,153,0.7)]",
      };
    }

    if (
      location.pathname.includes("/flag-battle") ||
      location.pathname.includes("/find-color") ||
      location.pathname.includes("/memory-rush") ||
      location.pathname.includes("/memory-chain") ||
      location.pathname.includes("/word-search") ||
      location.pathname.includes("/ocean-word-fishing")
    ) {
      return {
        button: "bg-gradient-to-r from-cyan-500 to-blue-500",
        backShadow: "hover:shadow-[0_0_30px_rgba(6,182,212,0.7)]",
        fullscreenShadow: "hover:shadow-[0_0_30px_rgba(59,130,246,0.7)]",
      };
    }

    return {
      button: "bg-gradient-to-r from-purple-500 to-pink-500",
      backShadow: "hover:shadow-[0_0_30px_rgba(168,85,247,0.7)]",
      fullscreenShadow: "hover:shadow-[0_0_30px_rgba(236,72,153,0.7)]",
    };
  })();

  const showGameControls = location.pathname.startsWith("/games/") && location.pathname !== "/games";
  const showFullscreenControl = location.pathname.endsWith("/play");
  const isActiveGameplay = location.pathname.endsWith("/play");
  const isPizzaMasterRoute = location.pathname.startsWith("/games/pizza-master");
  const controlsAreVisible = isPizzaMasterRoute || showControls;
  const isMobileViewport =
    typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

  useEffect(() => {
    if (!isActiveGameplay) return;

    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isIntentionalExitRef.current) return;
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [isActiveGameplay]);

  useEffect(() => {
    if (!isExitDialogOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        pendingExitRef.current = null;
        setIsExitDialogOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isExitDialogOpen]);

  // Hide/show buttons on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const nextShowControls = !(currentScrollY > lastScrollYRef.current && currentScrollY > 100);
      setShowControls((prev) => (prev === nextShowControls ? prev : nextShowControls));
      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleFullscreen = async () => {
    if (isMobileViewport) {
      return;
    }

    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // ignore browser restrictions
    }
  };

  const requestGameExit = (onConfirm: () => void) => {
    pendingExitRef.current = onConfirm;
    setIsExitDialogOpen(true);
  };

  const confirmExit = () => {
    const exit = pendingExitRef.current;
    pendingExitRef.current = null;
    setIsExitDialogOpen(false);

    // Pizza Master mode selector o'z state'ini gameplay ichida ushlab turadi.
    // Shu sabab chiqishda callbackdan qat'i nazar landingga aniq qaytamiz.
    if (location.pathname === "/games/pizza-master/play") {
      isIntentionalExitRef.current = true;
      window.location.replace("/games/pizza-master");
      return;
    }

    // Dialog yopilgach yo'naltiramiz, shunda callback UI holatiga bog'lanib qolmaydi.
    window.setTimeout(() => exit?.(), 0);
  };

  const cancelExit = () => {
    pendingExitRef.current = null;
    setIsExitDialogOpen(false);
  };

  const goBack = () => {
    if (isActiveGameplay) {
      requestGameExit(() => navigate(location.pathname.endsWith("/play") ? location.pathname.replace(/\/play$/, "") : "/games"));
      return;
    }
    navigate("/games");
  };

  return (
    <div className={`game-layout relative min-h-screen ${isPizzaMasterRoute ? "bg-[#fff7df]" : "bg-[#04111f]"}`}>
      {showGameControls && (
        <>
          <div
            className={`fixed left-4 top-1/2 z-[120] hidden -translate-y-1/2 transition-all duration-300 md:block ${
              controlsAreVisible ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
            }`}
          >
            <button
              type="button"
              onClick={goBack}
              title="O'yin sahifasiga qaytish"
              className={`group relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl ${controlTheme.button} text-white shadow-2xl transition-all hover:scale-110 active:scale-95 ${controlTheme.backShadow}`}
              aria-label="O'yin sahifasiga qaytish"
            >
              <span className="absolute inset-0 translate-y-full bg-white/20 transition-transform duration-300 group-hover:translate-y-0" />
              <FaArrowLeft className="relative text-xl" />
              <span className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/80 px-3 py-1.5 text-xs font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">
                Orqaga
              </span>
            </button>
          </div>

          {showFullscreenControl ? (
            <div
              className={`fixed right-4 top-1/2 z-[120] hidden -translate-y-1/2 transition-all duration-300 md:block ${
                controlsAreVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
              }`}
            >
              <button
                type="button"
                onClick={toggleFullscreen}
                className={`group relative h-14 w-14 overflow-hidden rounded-2xl ${controlTheme.button} text-white shadow-2xl transition-all hover:scale-110 active:scale-95 ${controlTheme.fullscreenShadow}`}
                aria-label={isFullscreen ? "Fullscreen dan chiqish" : "Fullscreen"}
              >
                <div className="absolute inset-0 translate-y-full bg-white/20 transition-transform duration-300 group-hover:translate-y-0" />
                {isFullscreen ? (
                  <MdFullscreenExit className="relative mx-auto text-xl" />
                ) : (
                  <MdFullscreen className="relative mx-auto text-xl" />
                )}
                <span className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/80 px-3 py-1.5 text-xs font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">
                  {isFullscreen ? "Chiqish" : "To'liq ekran"}
                </span>
              </button>
            </div>
          ) : null}
        </>
      )}

      {/* Main Content */}
      <main className={`min-h-[100dvh] pb-20 md:pb-0 ${isPizzaMasterRoute ? "bg-[#fff7df]" : "bg-[#04111f]"}`}>
        <Outlet context={{ requestGameExit }} />
      </main>

      {isExitDialogOpen ? (
        <div className="fixed inset-0 z-[100] grid place-items-center p-4" role="dialog" aria-modal="true" aria-labelledby="game-exit-title">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm"
            onClick={cancelExit}
            aria-label="Dialogni yopish"
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-lg border border-white/15 bg-[#101a2b] p-6 text-white shadow-[0_28px_80px_rgba(0,0,0,0.52)] sm:p-7">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500" />
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-amber-300/25 bg-amber-300/10 text-amber-300">
                <FaExclamationTriangle className="text-lg" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-200/70">O'yin jarayoni</p>
                <h2 id="game-exit-title" className="mt-1 text-xl font-black">O'yinni tark etmoqchimisiz?</h2>
                <p className="mt-2 text-sm leading-6 text-white/65">Hozir chiqilsa, tugallanmagan o'yin jarayoni saqlanmasligi mumkin.</p>
              </div>
            </div>
            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={cancelExit}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.06] px-4 py-3 text-sm font-bold text-white/85 transition hover:bg-white/[0.12]"
              >
                <FaGamepad /> Davom etaman
              </button>
              <button
                type="button"
                onClick={confirmExit}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-rose-500 to-orange-500 px-4 py-3 text-sm font-bold text-white transition hover:brightness-110"
              >
                <FaArrowLeft /> Ha, chiqaman
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
