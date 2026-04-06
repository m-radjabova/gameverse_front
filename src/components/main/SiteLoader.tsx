import { useState, useEffect } from "react";
import { FaGraduationCap } from "react-icons/fa";

function SiteLoader() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const syncTheme = () => {
      setIsDarkMode(window.localStorage.getItem("home-theme") === "dark");
    };

    syncTheme();
    window.addEventListener("storage", syncTheme);
    return () => window.removeEventListener("storage", syncTheme);
  }, []);

  const theme = isDarkMode
    ? {
        pageBg: "bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#111827]",
        blurOne: "bg-cyan-400/10",
        blurTwo: "bg-amber-400/10",
        gridColor: "#7dd3fc",
        orbOne: "from-cyan-400/20",
        orbTwo: "from-amber-400/20",
        core: "from-cyan-400 to-amber-400",
        coreInner: "bg-white/10",
        ring: "border-white/10",
        orbitRing: "border-cyan-300/25",
        orbitDotPrimary: "bg-cyan-300",
        orbitDotSecondary: "bg-amber-300",
        orbitTrail: "from-cyan-400/0 via-cyan-300/30 to-amber-400/0",
        halo: "from-cyan-400/25 via-sky-300/10 to-amber-400/20",
      }
    : {
        pageBg: "bg-gradient-to-br from-[#ffffff] via-[#f6fcff] to-[#fff6df]",
        blurOne: "bg-[#d8f1fb]/40",
        blurTwo: "bg-[#fff0bf]/30",
        gridColor: "#59b9e6",
        orbOne: "from-[#59b9e6]/20",
        orbTwo: "from-[#ffd15d]/20",
        core: "from-[#59b9e6] to-[#ffd15d]",
        coreInner: "bg-white/30",
        ring: "border-white/60",
        orbitRing: "border-[#d8eef7]",
        orbitDotPrimary: "bg-[#59b9e6]",
        orbitDotSecondary: "bg-[#ffd15d]",
        orbitTrail: "from-[#59b9e6]/0 via-[#59b9e6]/25 to-[#ffd15d]/0",
        halo: "from-[#d8f1fb]/70 via-white/20 to-[#fff0bf]/60",
      };

  return (
    <div className={`fixed inset-0 z-[100] overflow-hidden ${theme.pageBg}`}>
      
      {/* Minimal Background */}
      <div className="absolute inset-0">
        {/* Soft blurs */}
        <div className={`absolute left-[5%] top-[10%] h-72 w-72 rounded-full blur-3xl animate-float-soft ${theme.blurOne}`} />
        <div className={`absolute right-[8%] bottom-[15%] h-80 w-80 rounded-full blur-3xl animate-float-slow ${theme.blurTwo}`} />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, ${theme.gridColor} 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="relative z-10 flex h-full items-center justify-center px-4">
        <div className="relative w-full max-w-md py-8">
          <div className={`absolute right-8 top-0 h-32 w-32 rounded-full bg-gradient-to-br to-transparent blur-xl animate-pulse-slow ${theme.orbOne}`} />
          <div className={`absolute bottom-0 left-8 h-40 w-40 rounded-full bg-gradient-to-tr to-transparent blur-xl animate-pulse-slow animation-delay-1000 ${theme.orbTwo}`} />

          <div className="relative">
              
              {/* Dot Circle Animation */}
              <div className="relative mx-auto mb-8 flex h-48 w-48 items-center justify-center">
                <div className={`absolute inset-3 rounded-full bg-gradient-to-br blur-2xl animate-pulse-soft ${theme.halo}`} />
                <div className={`absolute inset-4 rounded-full border ${theme.ring}`} />
                <div className={`absolute inset-7 rounded-full border border-dashed ${theme.orbitRing} animate-spin-slow`} />
                <div className={`absolute h-24 w-24 rounded-full bg-gradient-to-br shadow-xl animate-pulse-soft ${theme.core}`}>
                  <div className={`absolute inset-2 rounded-full backdrop-blur-sm ${theme.coreInner}`} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FaGraduationCap className="text-white text-2xl" />
                  </div>
                </div>
                <div className="absolute h-full w-full animate-loader-spin">
                  {[...Array(12)].map((_, i) => {
                    const angle = i * 30;
                    const dotClass = i % 2 === 0 ? theme.orbitDotPrimary : theme.orbitDotSecondary;
                    const opacity = 0.18 + i * 0.06;
                    const scale = 0.55 + i * 0.035;

                    return (
                      <div
                        key={i}
                        className="absolute h-full w-full"
                        style={{ transform: `rotate(${angle}deg)` }}
                      >
                        <div
                          className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-[78px] rounded-full shadow-lg"
                          style={{
                            opacity,
                            transform: `translate(-50%, -78px) scale(${scale})`,
                          }}
                        >
                          <div className={`h-full w-full rounded-full ${dotClass}`} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className={`absolute h-40 w-40 rounded-full bg-gradient-to-r blur-xl animate-pulse-soft ${theme.orbitTrail}`} />
              </div>

          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes pulse-soft {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        
        .animate-pulse-soft {
          animation: pulse-soft 2s ease-in-out infinite;
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }

        .animate-loader-spin {
          animation: spin-slow 2.8s linear infinite;
        }
        .animation-delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </div>
  );
}

export default SiteLoader;
