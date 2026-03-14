import { useState, useEffect } from "react";
import { GiCherry, GiFlowerTwirl, GiFlowerEmblem } from "react-icons/gi";
import { HiSparkles } from "react-icons/hi";
import { FaGraduationCap } from "react-icons/fa";

function SiteLoader() {
  const [progress, setProgress] = useState(0);
  const [petalCount, setPetalCount] = useState(0);

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

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden bg-gradient-to-br from-[#fff9f8] via-[#fff1f0] to-[#fae6df]">
      
      {/* Minimal Background */}
      <div className="absolute inset-0">
        {/* Soft blurs */}
        <div className="absolute left-[5%] top-[10%] h-72 w-72 rounded-full bg-[#f6d4da]/30 blur-3xl animate-float-soft" />
        <div className="absolute right-[8%] bottom-[15%] h-80 w-80 rounded-full bg-[#fbe5dd]/30 blur-3xl animate-float-slow" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #e07c8e 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="relative z-10 flex h-full items-center justify-center px-4">
        <div className="relative w-full max-w-md">
          
          {/* Main Card */}
          <div className="relative rounded-[48px] bg-white/70 backdrop-blur-xl p-8 shadow-2xl border border-white/60 overflow-hidden">
            
            {/* Inner glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(224,124,142,0.1),transparent_70%)]" />
            
            {/* Floating particles */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#e07c8e]/20 to-transparent rounded-full blur-xl animate-pulse-slow" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-[#a66466]/20 to-transparent rounded-full blur-xl animate-pulse-slow animation-delay-1000" />

            <div className="relative">
              
              {/* Flower Animation */}
              <div className="relative mx-auto mb-8 w-48 h-48 flex items-center justify-center">
                
                {/* Center of flower */}
                <div className="absolute w-20 h-20 rounded-full bg-gradient-to-br from-[#e07c8e] to-[#a66466] shadow-xl animate-pulse-soft z-10">
                  <div className="absolute inset-2 rounded-full bg-white/30 backdrop-blur-sm" />
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
                        className="text-4xl text-[#e07c8e] drop-shadow-lg"
                        style={{
                          filter: `drop-shadow(0 10px 15px rgba(224,124,142,0.3))`,
                        }}
                      />
                    </div>
                  );
                })}

                {/* Floating petals around */}
                {[...Array(5)].map((_, i) => (
                  <GiCherry
                    key={`floating-${i}`}
                    className="absolute text-[#e07c8e] text-xl animate-petal-float"
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
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#e07c8e] to-[#a66466] font-medium">
                  yuklanmoqda...
                </span>
              </h1>

              {/* Loading text */}
              <div className="mt-4 flex items-center justify-center gap-2">
                <HiSparkles className="text-[#e07c8e] text-sm animate-pulse-soft" />
                <span className="text-xs font-medium text-[#8f6d70] tracking-wider">
                  TAYYORLANMOQDA
                </span>
                <HiSparkles className="text-[#a66466] text-sm animate-pulse-soft animation-delay-500" />
              </div>

              {/* Progress Bar */}
              <div className="mt-6 space-y-2">
                <div className="relative h-2 bg-[#f0d9d6] rounded-full overflow-hidden">
                  <div 
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#e07c8e] to-[#a66466] rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-[10px] text-[#b38b8d]">
                  <span className="font-bold text-[#e07c8e]">{progress}%</span>
                  <span>{progress < 100 ? "Iltimos kuting..." : "Tayyor!"}</span>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -left-8 -top-8 opacity-20">
                <GiFlowerEmblem className="text-6xl text-[#e07c8e]" />
              </div>
              <div className="absolute -right-8 -bottom-8 opacity-20 rotate-180">
                <GiFlowerEmblem className="text-6xl text-[#a66466]" />
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