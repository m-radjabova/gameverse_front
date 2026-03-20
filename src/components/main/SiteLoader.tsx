import { useState, useEffect } from "react";
import { GiCherry, GiFlowerTwirl, GiFlowerEmblem } from "react-icons/gi";
import { HiSparkles } from "react-icons/hi";
import { FaGraduationCap } from "react-icons/fa";

function SiteLoader() {
  const [progress, setProgress] = useState(0);
  const [petalCount, setPetalCount] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const syncTheme = () => {
      setIsDarkMode(window.localStorage.getItem("home-theme") === "dark");
    };

    syncTheme();
    window.addEventListener("storage", syncTheme);
    return () => window.removeEventListener("storage", syncTheme);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 30);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Gul ochilishi animatsiyasi
    const petalInterval = setInterval(() => {
      setPetalCount(prev => {
        if (prev >= 8) {
          clearInterval(petalInterval);
          return 8;
        }
        return prev + 1;
      });
    }, 150);

    return () => clearInterval(petalInterval);
  }, []);

  const theme = isDarkMode
    ? {
        pageBg: "bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#111827]",
        blurOne: "bg-cyan-400/10",
        blurTwo: "bg-fuchsia-500/10",
        gridColor: "#7dd3fc",
        card: "bg-slate-950/65 border border-white/10",
        cardGlow: "bg-[radial-gradient(circle_at_30%_20%,rgba(34,211,238,0.14),transparent_70%)]",
        orbOne: "from-cyan-400/20",
        orbTwo: "from-fuchsia-500/20",
        core: "from-cyan-400 to-fuchsia-500",
        coreInner: "bg-white/10",
        petal: "text-cyan-300",
        petalShadow: "rgba(34,211,238,0.28)",
        cherry: "text-fuchsia-300",
        title: "from-cyan-300 via-sky-200 to-fuchsia-300",
        sparkleOne: "text-cyan-300",
        sparkleTwo: "text-fuchsia-300",
        label: "text-slate-300",
        progressTrack: "bg-white/10",
        progressBar: "from-cyan-400 via-sky-400 to-fuchsia-500",
        progressText: "text-slate-400",
        progressValue: "text-cyan-300",
        emblemOne: "text-cyan-300",
        emblemTwo: "text-fuchsia-300",
      }
    : {
        pageBg: "bg-gradient-to-br from-[#fff9f8] via-[#fff1f0] to-[#fae6df]",
        blurOne: "bg-[#f6d4da]/30",
        blurTwo: "bg-[#fbe5dd]/30",
        gridColor: "#e07c8e",
        card: "bg-white/70 border border-white/60",
        cardGlow: "bg-[radial-gradient(circle_at_30%_20%,rgba(224,124,142,0.1),transparent_70%)]",
        orbOne: "from-[#e07c8e]/20",
        orbTwo: "from-[#a66466]/20",
        core: "from-[#e07c8e] to-[#a66466]",
        coreInner: "bg-white/30",
        petal: "text-[#e07c8e]",
        petalShadow: "rgba(224,124,142,0.3)",
        cherry: "text-[#e07c8e]",
        title: "from-[#e07c8e] to-[#a66466]",
        sparkleOne: "text-[#e07c8e]",
        sparkleTwo: "text-[#a66466]",
        label: "text-[#8f6d70]",
        progressTrack: "bg-[#f0d9d6]",
        progressBar: "from-[#e07c8e] to-[#a66466]",
        progressText: "text-[#b38b8d]",
        progressValue: "text-[#e07c8e]",
        emblemOne: "text-[#e07c8e]",
        emblemTwo: "text-[#a66466]",
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
        <div className="relative w-full max-w-md">
          
          {/* Main Card */}
          <div className={`relative overflow-hidden rounded-[48px] p-8 shadow-2xl backdrop-blur-xl ${theme.card}`}>
            
            {/* Inner glow */}
            <div className={`absolute inset-0 ${theme.cardGlow}`} />
            
            {/* Floating particles */}
            <div className={`absolute top-0 right-0 h-32 w-32 rounded-full bg-gradient-to-br to-transparent blur-xl animate-pulse-slow ${theme.orbOne}`} />
            <div className={`absolute bottom-0 left-0 h-40 w-40 rounded-full bg-gradient-to-tr to-transparent blur-xl animate-pulse-slow animation-delay-1000 ${theme.orbTwo}`} />

            <div className="relative">
              
              {/* Flower Animation */}
              <div className="relative mx-auto mb-8 w-48 h-48 flex items-center justify-center">
                
                {/* Center of flower */}
                <div className={`absolute z-10 h-20 w-20 rounded-full bg-gradient-to-br shadow-xl animate-pulse-soft ${theme.core}`}>
                  <div className={`absolute inset-2 rounded-full backdrop-blur-sm ${theme.coreInner}`} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FaGraduationCap className="text-white text-2xl" />
                  </div>
                </div>

                {/* Petals - opening animation */}
                {[...Array(8)].map((_, i) => {
                  const angle = (i * 45) * (Math.PI / 180);
                  const distance = petalCount > i ? 70 : 0;
                  const x = Math.cos(angle) * distance;
                  const y = Math.sin(angle) * distance;
                  const rotation = i * 45;
                  const delay = i * 0.1;
                  
                  return (
                    <div
                      key={i}
                      className="absolute transition-all duration-700 ease-out"
                      style={{
                        transform: `translate(${x}px, ${y}px) rotate(${rotation}deg)`,
                        opacity: petalCount > i ? 1 : 0,
                        transitionDelay: `${delay}s`,
                      }}
                    >
                      <GiFlowerTwirl 
                        className={`text-4xl drop-shadow-lg ${theme.petal}`}
                        style={{
                          filter: `drop-shadow(0 10px 15px ${theme.petalShadow})`,
                        }}
                      />
                    </div>
                  );
                })}

                {/* Floating petals around */}
                {[...Array(5)].map((_, i) => (
                  <GiCherry
                    key={`floating-${i}`}
                    className={`absolute text-xl animate-petal-float ${theme.cherry}`}
                    style={{
                      left: `${20 + i * 15}%`,
                      top: `${10 + i * 10}%`,
                      animationDelay: `${i * 0.5}s`,
                      opacity: 0.3,
                    }}
                  />
                ))}
              </div>

              {/* Title with gradient */}
              <h1 className="text-4xl font-light text-center">
                <span className={`block bg-gradient-to-r bg-clip-text text-transparent font-medium ${theme.title}`}>
                  yuklanmoqda...
                </span>
              </h1>

              {/* Loading text */}
              <div className="mt-4 flex items-center justify-center gap-2">
                <HiSparkles className={`text-sm animate-pulse-soft ${theme.sparkleOne}`} />
                <span className={`text-xs font-medium tracking-wider ${theme.label}`}>
                  TAYYORLANMOQDA
                </span>
                <HiSparkles className={`text-sm animate-pulse-soft animation-delay-500 ${theme.sparkleTwo}`} />
              </div>

              {/* Progress Bar */}
              <div className="mt-6 space-y-2">
                <div className={`relative h-2 overflow-hidden rounded-full ${theme.progressTrack}`}>
                  <div 
                    className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r transition-all duration-300 ease-out ${theme.progressBar}`}
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                  </div>
                </div>
                
                <div className={`flex items-center justify-between text-[10px] ${theme.progressText}`}>
                  <span className={`font-bold ${theme.progressValue}`}>{progress}%</span>
                  <span>{progress < 100 ? "Iltimos kuting..." : "Tayyor!"}</span>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -left-8 -top-8 opacity-20">
                <GiFlowerEmblem className={`text-6xl ${theme.emblemOne}`} />
              </div>
              <div className="absolute -right-8 -bottom-8 opacity-20 rotate-180">
                <GiFlowerEmblem className={`text-6xl ${theme.emblemTwo}`} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        
        @keyframes pulse-soft {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        
        .animate-pulse-soft {
          animation: pulse-soft 2s ease-in-out infinite;
        }
        
        .animation-delay-500 {
          animation-delay: 500ms;
        }
        
        .animation-delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </div>
  );
}

export default SiteLoader;
