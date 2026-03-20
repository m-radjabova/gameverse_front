import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { MdFullscreen, MdFullscreenExit } from "react-icons/md";

export default function GameLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
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
      // location.pathname.includes("/pictionary") ||
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

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate("/games");
  };

  return (
    <div className="game-layout relative min-h-screen bg-[#04111f]">
      {showGameControls && (
        <>
          {/* Left Button - Back to Games */}
          <div
            className={`fixed left-4 top-1/2 z-50 transform -translate-y-1/2 transition-all duration-300 ${
              showControls ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-full"
            } hidden md:block`}
          >
            <button
              onClick={goBack}
              className={`group relative h-14 w-14 overflow-hidden rounded-2xl ${controlTheme.button} text-white shadow-2xl transition-all hover:scale-110 active:scale-95 ${controlTheme.backShadow}`}
              aria-label="O'yinlar ro'yxatiga qaytish"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <FaArrowLeft className="relative mx-auto text-xl" />
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap rounded-full bg-black/80 px-3 py-1.5 text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                O'yinlar
              </span>
            </button>
          </div>

          {/* Right Button - Fullscreen Toggle */}
          <div
            className={`fixed right-4 top-1/2 z-50 transform -translate-y-1/2 transition-all duration-300 ${
              showControls ? "opacity-100 translate-x-0" : "opacity-100 translate-x-0"
            } hidden md:block`}
          >
            <button
              onClick={toggleFullscreen}
              className={`group relative h-14 w-14 overflow-hidden rounded-2xl ${controlTheme.button} text-white shadow-2xl transition-all hover:scale-110 active:scale-95 ${controlTheme.fullscreenShadow}`}
              aria-label={isFullscreen ? "Fullscreen dan chiqish" : "Fullscreen"}
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              {isFullscreen ? (
                <MdFullscreenExit className="relative mx-auto text-xl" />
              ) : (
                <MdFullscreen className="relative mx-auto text-xl" />
              )}
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap rounded-full bg-black/80 px-3 py-1.5 text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {isFullscreen ? "Chiqish" : "To'liq ekran"}
              </span>
            </button>
          </div>

          {/* Mobile Bottom Buttons (for small screens) */}
          <div
            className={`fixed bottom-4 left-0 right-0 z-50 flex justify-center gap-4 md:hidden transition-all duration-300 ${
              showControls ? "translate-y-0" : "translate-y-full"
            }`}
          >
            {/* Back to Games */}
            <button
              onClick={goBack}
              className={`group relative h-11 w-11 overflow-hidden rounded-xl ${controlTheme.button} text-white shadow-2xl transition-all active:scale-95`}
              aria-label="O'yinlar"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <FaArrowLeft className="relative mx-auto text-base" />
            </button>
          </div>
        </>
      )}

      {/* Main Content */}
      <main className="min-h-[100dvh] bg-[#04111f] pb-20 md:pb-0">
        <Outlet />
      </main>
    </div>
  );
}
