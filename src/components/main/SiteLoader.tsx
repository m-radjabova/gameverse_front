import { useEffect, useMemo, useState } from "react";
import Lottie from "lottie-react";
import starRatingAnimation from "../Star rating.json";

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
        <Lottie
          animationData={starRatingAnimation}
          loop
          autoplay
          className="h-[280px] w-[280px] drop-shadow-[0_18px_36px_rgba(245,158,11,0.28)] sm:h-[360px] sm:w-[360px]"
          aria-label="Gameverse star rating loading animation"
        />
      </div>
    </div>
  );
}

export default SiteLoader;
