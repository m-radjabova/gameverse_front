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
        button: "bg-gradient-to-br from-pink-500 via-rose-500 to-red-600",
        shadow: "hover:shadow-[0_0_35px_rgba(244,63,94,0.6)]",
        border: "border-pink-400/30",
      };
    }
    if (location.pathname.includes("/reverse-thinking")) {
      return {
        button: "bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600",
        shadow: "hover:shadow-[0_0_35px_rgba(16,185,129,0.6)]",
        border: "border-emerald-400/30",
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
        button: "bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-600",
        shadow: "hover:shadow-[0_0_35px_rgba(245,158,11,0.6)]",
        border: "border-amber-400/30",
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
        button: "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-600",
        shadow: "hover:shadow-[0_0_35px_rgba(129,140,248,0.6)]",
        border: "border-indigo-400/30",
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
        button: "bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600",
        shadow: "hover:shadow-[0_0_35px_rgba(6,182,212,0.6)]",
        border: "border-cyan-400/30",
      };
    }

    return {
      button: "bg-gradient-to-br from-violet-600 via-purple-500 to-pink-600",
      shadow: "hover:shadow-[0_0_35px_rgba(168,85,247,0.6)]",
      border: "border-purple-400/30",
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
    if (isMobileViewport) return;
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

    if (location.pathname === "/games/pizza-master/play") {
      isIntentionalExitRef.current = true;
      window.location.replace("/games/pizza-master");
      return;
    }

    window.setTimeout(() => exit?.(), 0);
  };

  const cancelExit = () => {
    pendingExitRef.current = null;
    setIsExitDialogOpen(false);
  };

  const goBack = () => {
    if (isActiveGameplay) {
      requestGameExit(() =>
        navigate(location.pathname.endsWith("/play") ? location.pathname.replace(/\/play$/, "") : "/games")
      );
      return;
    }
    navigate("/games");
  };

  return (
    <div
      className={`game-layout relative selection:bg-purple-500 selection:text-white ${
        isActiveGameplay ? "h-[100dvh] overflow-hidden" : "min-h-[100dvh]"
      } ${isPizzaMasterRoute ? "bg-[#fff7df]" : "bg-[#070b14]"}`}
    >
      {/* Floating Control Buttons */}
      {showGameControls && (
        <>
          {/* Back Button */}
          <div
            className={`fixed left-5 top-1/2 z-[120] hidden -translate-y-1/2 transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) md:block ${
              controlsAreVisible ? "translate-x-0 opacity-100 scale-100" : "-translate-x-12 opacity-0 scale-90 pointer-events-none"
            }`}
          >
            <button
              type="button"
              onClick={goBack}
              title="Orqaga qaytish"
              className={`group relative flex h-13 w-13 items-center justify-center overflow-hidden rounded-2xl border ${controlTheme.border} ${controlTheme.button} text-white shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 ${controlTheme.shadow}`}
              aria-label="O'yin sahifasiga qaytish"
            >
              <span className="absolute inset-0 bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <FaArrowLeft className="relative text-lg transition-transform duration-300 group-hover:-translate-x-0.5" />
              <span className="pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-xl bg-slate-900/90 px-3 py-1 text-[11px] font-semibold text-white/90 shadow-lg backdrop-blur-md opacity-0 transition-all duration-200 group-hover:-translate-y-2 group-hover:opacity-100 border border-white/10">
                Orqaga
              </span>
            </button>
          </div>

          {/* Fullscreen Button */}
          {showFullscreenControl ? (
            <div
              className={`fixed right-5 top-1/2 z-[120] hidden -translate-y-1/2 transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) md:block ${
                controlsAreVisible ? "translate-x-0 opacity-100 scale-100" : "translate-x-12 opacity-0 scale-90 pointer-events-none"
              }`}
            >
              <button
                type="button"
                onClick={toggleFullscreen}
                className={`group relative flex h-13 w-13 items-center justify-center overflow-hidden rounded-2xl border ${controlTheme.border} ${controlTheme.button} text-white shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 ${controlTheme.shadow}`}
                aria-label={isFullscreen ? "Fullscreen dan chiqish" : "Fullscreen"}
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                {isFullscreen ? (
                  <MdFullscreenExit className="relative text-xl transition-transform duration-300 group-hover:scale-110" />
                ) : (
                  <MdFullscreen className="relative text-xl transition-transform duration-300 group-hover:scale-110" />
                )}
                <span className="pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-xl bg-slate-900/90 px-3 py-1 text-[11px] font-semibold text-white/90 shadow-lg backdrop-blur-md opacity-0 transition-all duration-200 group-hover:-translate-y-2 group-hover:opacity-100 border border-white/10">
                  {isFullscreen ? "Kichraytirish" : "To'liq ekran"}
                </span>
              </button>
            </div>
          ) : null}
        </>
      )}

      {/* Main Content Viewport */}
      <main
        className={`${
          isActiveGameplay ? "h-[100dvh] overflow-y-auto" : "min-h-[100dvh]"
        } pb-20 md:pb-0 transition-colors duration-500 ${isPizzaMasterRoute ? "bg-[#fff7df]" : "bg-[#070b14]"}`}
      >
        <Outlet context={{ requestGameExit }} />
      </main>

      {/* Premium Exit Dialog Modal */}
      {isExitDialogOpen ? (
        <div
          className="fixed inset-0 z-[200] grid place-items-center p-4 animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="game-exit-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
            onClick={cancelExit}
            aria-label="Dialogni yopish"
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-slate-900/90 p-6 text-white shadow-[0_25px_60px_rgba(0,0,0,0.7)] backdrop-blur-2xl sm:p-8 animate-scaleUp">
            {/* Top Glowing Accent Line */}
            <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-cyan-400 via-indigo-500 to-pink-500" />
            
            <div className="flex items-start gap-4">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-inner">
                <FaExclamationTriangle className="text-2xl animate-pulse" />
              </div>
              <div className="space-y-1">
                <span className="inline-block rounded-full bg-cyan-500/10 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 border border-cyan-500/20">
                  Diqqat
                </span>
                <h2 id="game-exit-title" className="text-xl font-black tracking-tight text-white">
                  O'yinni tark etmoqchimisiz?
                </h2>
                <p className="text-sm leading-relaxed text-slate-400">
                  Hozir chiqib ketsangiz, joriy natijalaringiz saqlanmasligi va o'yin to'xtab qolishi mumkin.
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={cancelExit}
                className="inline-flex items-center justify-center gap-2.5 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3.5 text-sm font-bold text-slate-300 transition-all duration-200 hover:bg-white/[0.08] hover:text-white active:scale-95"
              >
                <FaGamepad className="text-base text-purple-400" /> Davom etaman
              </button>
              <button
                type="button"
                onClick={confirmExit}
                className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-rose-500/25 transition-all duration-200 hover:brightness-110 active:scale-95"
              >
                <FaArrowLeft className="text-sm" /> Ha, chiqaman
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}