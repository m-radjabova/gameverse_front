import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaGamepad,
  FaSearch,
  FaArrowLeft,
  FaRocket,
  FaQuestion,
  FaCompass,
} from "react-icons/fa";
import { GiSpinningWheel, GiPirateFlag, GiTreasureMap } from "react-icons/gi";
import { MdErrorOutline } from "react-icons/md";

function NotFoundPage() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);
  
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      navigate("/games");
    }
  }, [countdown, navigate]);

  // Random game suggestions
  const suggestions = [
    { name: "Quiz Battle", path: "/games/quiz-battle", icon: "📚", color: "from-yellow-500 to-orange-500" },
    { name: "Memory Rush", path: "/games/memory-rush", icon: "🧠", color: "from-emerald-500 to-teal-500" },
    { name: "Treasure Hunt", path: "/games/treasure-hunt", icon: "🗺️", color: "from-amber-500 to-orange-500" },
    { name: "Word Battle", path: "/games/word-battle", icon: "📝", color: "from-blue-500 to-cyan-500" },
    { name: "Classic Arcade", path: "/games/classic-arcade", icon: "🎮", color: "from-purple-500 to-pink-500" },
    { name: "Flag Battle", path: "/games/flag-battle", icon: "🏁", color: "from-blue-500 to-cyan-500" },
  ];

  // Random fun facts
  const funFacts = [
    "Bu sahifa topilmasa ham, sizning o'yin ruhingiz hech qachon yo'qolmaydi! 🎮",
    "404 - bu xato emas, bu yangi sarguzashtning boshlanishi! 🚀",
    "O'yinlar dunyosida har bir xato yangi imkoniyatdir! ✨",
    "Bu sahifa xuddi yashirin bonus kabi - uni topish qiyin! 🎁",
    "Ba'zida eng yaxshi o'yinlar kutilmagan joylarda boshlanadi! 🎯",
  ];

  const randomFact = funFacts[Math.floor(Math.random() * funFacts.length)];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] animate-pulse-slow rounded-full bg-purple-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] animate-pulse-slower rounded-full bg-pink-600/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-indigo-600/10 blur-3xl" />

        {/* Floating Game Icons */}
        <div className="absolute inset-0">
          {[...Array(40)].map((_, i) => (
            <div
              key={i}
              className="absolute text-white/5 animate-float"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${15 + Math.random() * 20}s`,
                fontSize: `${20 + Math.random() * 40}px`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            >
              {i % 6 === 0 && "🎮"}
              {i % 6 === 1 && "🎲"}
              {i % 6 === 2 && "🎯"}
              {i % 6 === 3 && "🎨"}
              {i % 6 === 4 && "🧩"}
              {i % 6 === 5 && "🏆"}
            </div>
          ))}
        </div>

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 20px 20px, rgba(255,255,255,0.05) 2px, transparent 2px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 mx-auto min-h-screen w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
        {/* 404 Number with Glitch Effect */}
        <div className="relative mb-8 text-center">
          <div className="absolute inset-0 animate-pulse">
            <div className="text-9xl font-black text-transparent bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-indigo-500/30 bg-clip-text blur-2xl">
              404
            </div>
          </div>
          <div className="relative">
            <span className="text-9xl font-black text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text animate-glitch">
              404
            </span>
          </div>
          <div className="absolute -top-4 -right-4 animate-bounce">
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-yellow-400/30" />
              <FaQuestion className="relative text-4xl text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="relative mb-8 text-center">
          <div className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-6 py-3 border border-purple-500/30 backdrop-blur-sm mb-4">
            <MdErrorOutline className="text-purple-400 text-2xl animate-pulse" />
            <span className="text-sm font-black tracking-wider text-transparent bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text">
              SAHIFA TOPILMADI
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-black text-white mb-4">
            <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 bg-clip-text text-transparent">
              Oops! Yo'qolib qoldingizmi?
            </span>
          </h1>

          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-6">
            Qidirayotgan sahifangiz boshqa o'lchamga ko'chib ketganga o'xshaydi. 
            Xuddi yashirin bonusdek topish qiyin!
          </p>

          {/* Fun Fact */}
          <div className="max-w-lg mx-auto p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 backdrop-blur-sm">
            <p className="text-sm text-slate-300 italic">
              <span className="text-purple-400 font-bold">🎮 Fun Fact:</span> {randomFact}
            </p>
          </div>
        </div>

        {/* Auto-redirect Counter */}
        <div className="relative mb-12 text-center">
          <div className="inline-flex items-center gap-3 rounded-full bg-slate-800/50 px-6 py-3 border border-slate-700/50 backdrop-blur-sm">
            <FaRocket className="text-purple-400 animate-pulse" />
            <span className="text-slate-300">
              {countdown} soniyadan keyin o'yinlar sahifasiga o'tkaziladi...
            </span>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="relative mb-12 flex flex-wrap justify-center gap-4">
          <Link
            to="/games"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 text-lg font-bold text-white transition-all hover:scale-105 active:scale-95"
          >
            <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
            <span className="relative flex items-center gap-3">
              <FaGamepad className="text-xl" />
              O'YINLARGA O'TISH
            </span>
          </Link>

          <Link
            to="/"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-4 text-lg font-bold text-white transition-all hover:scale-105 active:scale-95"
          >
            <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
            <span className="relative flex items-center gap-3">
              <FaHome className="text-xl" />
              ASOSIY SAHIFA
            </span>
          </Link>

          <button
            onClick={() => navigate(-1)}
            className="group relative overflow-hidden rounded-2xl bg-slate-800/80 px-8 py-4 text-lg font-bold text-white border border-slate-700/50 transition-all hover:bg-slate-800 hover:scale-105 active:scale-95"
          >
            <span className="relative flex items-center gap-3">
              <FaArrowLeft className="text-xl" />
              ORQAGA QAYTISH
            </span>
          </button>
        </div>

        {/* Game Suggestions */}
        <div className="relative w-full max-w-4xl">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <GiSpinningWheel className="text-purple-400 animate-spin-slow" />
            <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              SIZGA TAVSIYA
            </span>
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {suggestions.map((game, index) => (
              <Link
                key={index}
                to={game.path}
                className="group relative overflow-hidden rounded-xl border-2 border-purple-500/30 bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-4 text-center transition-all hover:scale-105 hover:border-purple-400/50"
              >
                {/* Icon */}
                <div className={`relative mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r ${game.color} text-2xl text-white mx-auto transition-transform group-hover:scale-110`}>
                  <span className="relative z-10">{game.icon}</span>
                  <div className="absolute inset-0 rounded-lg bg-white/20 blur-md group-hover:blur-xl transition-all" />
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-white mb-1">{game.name}</h3>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </Link>
            ))}
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 text-6xl text-purple-500/10 rotate-12 animate-float">
          <GiPirateFlag />
        </div>
        <div className="absolute bottom-20 right-10 text-6xl text-pink-500/10 -rotate-12 animate-float-delayed">
          <GiTreasureMap />
        </div>
        <div className="absolute top-1/2 left-5 text-4xl text-indigo-500/10 animate-float-slow">
          <FaCompass />
        </div>
        <div className="absolute bottom-1/3 right-5 text-4xl text-purple-500/10 animate-float-slower">
          <FaSearch />
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }

        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-5deg); }
        }

        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes float-slower {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-25px); }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }

        @keyframes pulse-slower {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }

        @keyframes glitch {
          0%, 100% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .animate-float {
          animation: float 8s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 7s ease-in-out infinite;
        }

        .animate-float-slow {
          animation: float-slow 10s ease-in-out infinite;
        }

        .animate-float-slower {
          animation: float-slower 12s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .animate-pulse-slower {
          animation: pulse-slower 6s ease-in-out infinite;
        }

        .animate-glitch {
          animation: glitch 0.5s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default NotFoundPage;