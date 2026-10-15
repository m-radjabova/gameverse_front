import { useEffect, useMemo, useState } from "react";
import Lottie from "lottie-react";
import fiveStarsAnimation from "../Star rating.json";

function SiteLoader() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const syncTheme = () => {
      setIsDarkMode(window.localStorage.getItem("home-theme") === "dark");
    };

    syncTheme();
    window.addEventListener("storage", syncTheme);
    window.addEventListener("home-theme-change", syncTheme);

    return () => {
      window.removeEventListener("storage", syncTheme);
      window.removeEventListener("home-theme-change", syncTheme);
    };
  }, []);

  const theme = useMemo(
    () =>
      isDarkMode
        ? {
            pageBg:
              "bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.16),transparent_28%),radial-gradient(circle_at_bottom,rgba(245,158,11,0.14),transparent_24%),linear-gradient(180deg,#020617_0%,#0f172a_52%,#111827_100%)]",
          }
        : {
            pageBg:
              "bg-[radial-gradient(circle_at_top,rgba(89,185,230,0.18),transparent_28%),radial-gradient(circle_at_bottom,rgba(255,209,93,0.18),transparent_24%),linear-gradient(180deg,#fffefb_0%,#f7fbff_52%,#fff7ea_100%)]",
          },
    [isDarkMode],
  );

  return (
    <div className={`fixed inset-0 z-[100] overflow-hidden ${theme.pageBg}`}>
      <div className="relative z-10 flex h-full items-center justify-center px-4">
        <div className="flex flex-col items-center gap-5" aria-label="Yuklanmoqda" role="status">
          <Lottie
            animationData={fiveStarsAnimation}
            loop
            autoplay
            className="h-36 w-36 sm:h-44 sm:w-44"
            aria-label="Besh yulduzli yuklanish animatsiyasi"
          />
          <div className="text-center">
            <p className="text-sm font-black tracking-[0.18em] text-slate-800 dark:text-white">GAMEVERSE</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-300">Yuklanmoqda</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SiteLoader;
