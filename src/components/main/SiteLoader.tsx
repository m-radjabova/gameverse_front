import { useEffect, useMemo, useState } from "react";
import bunnyLogo from "../../assets/bunny.png";

function SiteLoader() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [progress, setProgress] = useState(14);

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

  useEffect(() => {
    const interval = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 95) {
          return 95;
        }

        const step = current < 40 ? 7 : current < 70 ? 4 : 2;
        return Math.min(95, current + step);
      });
    }, 180);

    return () => window.clearInterval(interval);
  }, []);

  const theme = useMemo(
    () =>
      isDarkMode
        ? {
            pageBg:
              "bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.16),transparent_28%),radial-gradient(circle_at_bottom,rgba(245,158,11,0.14),transparent_24%),linear-gradient(180deg,#020617_0%,#0f172a_52%,#111827_100%)]",
            card: "border-white/10 bg-white/5",
            ring: "border-white/10",
            title: "text-white",
            subtitle: "text-slate-300",
            barTrack: "bg-white/8",
            barFill: "from-cyan-400 via-sky-400 to-amber-300",
            glow: "bg-cyan-300/20",
          }
        : {
            pageBg:
              "bg-[radial-gradient(circle_at_top,rgba(89,185,230,0.18),transparent_28%),radial-gradient(circle_at_bottom,rgba(255,209,93,0.18),transparent_24%),linear-gradient(180deg,#fffefb_0%,#f7fbff_52%,#fff7ea_100%)]",
            card: "border-[#d9edf8] bg-white/70",
            ring: "border-[#dbeef8]",
            title: "text-slate-900",
            subtitle: "text-slate-500",
            barTrack: "bg-sky-100/80",
            barFill: "from-[#59b9e6] via-[#78cfee] to-[#ffd15d]",
            glow: "bg-sky-200/40",
          },
    [isDarkMode],
  );

  return (
    <div className={`fixed inset-0 z-[100] overflow-hidden ${theme.pageBg}`}>
      <div className="pointer-events-none absolute inset-0">
        <div className={`absolute left-1/2 top-[18%] h-44 w-44 -translate-x-1/2 rounded-full blur-3xl ${theme.glow} animate-loader-float`} />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at center, currentColor 1px, transparent 1px)", backgroundSize: "36px 36px" }} />
      </div>

      <div className="relative z-10 flex h-full items-center justify-center px-4">
        <div className={`w-full max-w-[360px] rounded-[34px] border p-6 text-center shadow-[0_24px_80px_rgba(15,23,42,0.16)] backdrop-blur-2xl sm:p-8 ${theme.card}`}>
          <div className={`mx-auto flex h-28 w-28 items-center justify-center rounded-full border ${theme.ring} bg-white/10 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.12)] sm:h-32 sm:w-32`}>
            <img
              src={bunnyLogo}
              alt="Gameverse bunny logo"
              className="h-full w-full object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.18)] animate-loader-bob"
            />
          </div>

          <h1 className={`mt-6 text-3xl font-black tracking-[0.18em] sm:text-[2.2rem] ${theme.title}`}>
            GAMEVERSE
          </h1>
          <p className={`mt-2 text-sm font-medium tracking-[0.18em] sm:text-base ${theme.subtitle}`}>
            Yuklanmoqda...
          </p>

          <div className="mt-7">
            <div className={`h-3.5 rounded-full p-[3px] ${theme.barTrack}`}>
              <div
                className={`h-full rounded-full bg-gradient-to-r ${theme.barFill} transition-[width] duration-300 shadow-[0_10px_24px_rgba(89,185,230,0.35)]`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className={`mt-3 text-xs font-semibold tracking-[0.14em] ${theme.subtitle}`}>{progress}%</div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes loader-bob {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-6px) scale(1.02); }
        }

        @keyframes loader-float {
          0%, 100% { transform: translate(-50%, 0px); opacity: 0.65; }
          50% { transform: translate(-50%, 10px); opacity: 1; }
        }

        .animate-loader-bob {
          animation: loader-bob 2.4s ease-in-out infinite;
        }

        .animate-loader-float {
          animation: loader-float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default SiteLoader;
