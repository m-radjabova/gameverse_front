import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaGamepad,
  FaArrowLeft,
  FaCompass,
  FaBookOpen,
  FaGraduationCap,
  FaStar,
} from "react-icons/fa";
import { GiCherry, GiFlowerTwirl, GiPlanetCore, GiBookshelf } from "react-icons/gi";
import { HiSparkles } from "react-icons/hi";
import { MdAutoAwesome, MdOutlineRocketLaunch } from "react-icons/md";

function NotFoundPage() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);
  const [, setIsHovered] = useState(false);
  
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      navigate("/games");
    }
  }, [countdown, navigate]);

  // Random aesthetic suggestions
  const suggestions = [
    { name: "Baamboozle", path: "/games/baamboozle", icon: "🎲", color: "from-[#f7c66d] to-[#e48b52]" },
    { name: "Treasure Hunt", path: "/games/treasure-hunt", icon: "🗺️", color: "from-[#e7b16d] to-[#c67a59]" },
    { name: "Jumanji", path: "/games/jumanji", icon: "🌴", color: "from-[#e58ca0] to-[#bc5c74]" },
    { name: "Quiz Battle", path: "/games/quiz-battle", icon: "⚡", color: "from-[#e07c8e] to-[#a66466]" },
    { name: "Memory Rush", path: "/games/memory-rush", icon: "🧠", color: "from-[#a66466] to-[#7b4f53]" },
    { name: "Word Battle", path: "/games/word-battle", icon: "📝", color: "from-[#8f6d70] to-[#6d4f52]" },
  ];

  // Random aesthetic quotes
  const quotes = [
    { text: "Har bir yo'qolish, yangi kashfiyotning boshlanishi", author: "🌸" },
    { text: "Sahifa topilmasa ham, bilim abadiy", author: "📚" },
    { text: "404 - bu xato emas, bu sarguzasht", author: "✨" },
    { text: "Yo'qolgan sahifalar orqali yangi olamlar ochiladi", author: "🌺" },
    { text: "Bilim yo'li hech qachon tugamaydi", author: "🎓" },
  ];

  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#fff9f8] via-[#fff1f0] to-[#fae6df]">
      
      {/* Minimal Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Soft blurs */}
        <div className="absolute left-[5%] top-[10%] h-72 w-72 rounded-full bg-[#f6d4da]/20 blur-3xl animate-float-soft" />
        <div className="absolute right-[8%] bottom-[15%] h-80 w-80 rounded-full bg-[#fbe5dd]/20 blur-3xl animate-float-slow" />
        
        {/* Floating flowers */}
        <GiCherry className="absolute left-[12%] top-[20%] text-6xl text-[#e07c8e]/10 animate-petal-float" />
        <GiFlowerTwirl className="absolute right-[15%] top-[40%] text-7xl text-[#a66466]/10 animate-float-soft" />
        <GiPlanetCore className="absolute left-[20%] bottom-[15%] text-8xl text-[#7b4f53]/10 animate-spin-slow" />
        <GiBookshelf className="absolute right-[10%] top-[60%] text-8xl text-[#8f6d70]/10 animate-float-slow" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #e07c8e 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 mx-auto min-h-screen w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
        
        {/* Floating Badge */}
        <div className="absolute top-20 left-10 hidden lg:block">
          <div className="relative group">
            <div className="absolute inset-0 bg-[#e07c8e] rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-3 border border-[#f0d9d6] shadow-lg">
              <div className="flex items-center gap-2">
                <FaGraduationCap className="text-[#e07c8e] text-xl" />
                <div>
                  <p className="text-[#7b4f53] text-xs font-bold">50K+</p>
                  <p className="text-[#8f6d70] text-[10px]">O'quvchilar</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-20 right-10 hidden lg:block">
          <div className="relative group">
            <div className="absolute inset-0 bg-[#a66466] rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-3 border border-[#f0d9d6] shadow-lg">
              <div className="flex items-center gap-2">
                <FaStar className="text-[#ffb347] text-xl" />
                <div>
                  <p className="text-[#7b4f53] text-xs font-bold">4.9 ★</p>
                  <p className="text-[#8f6d70] text-[10px]">Reyting</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 404 Number with Aesthetic Style */}
        <div className="relative mb-8 text-center">
          <div className="absolute inset-0">
            <div className="text-9xl font-black text-transparent bg-gradient-to-r from-[#e07c8e]/20 to-[#a66466]/20 bg-clip-text blur-3xl">
              404
            </div>
          </div>
          
          <div className="relative flex items-center justify-center gap-2">
            <span className="text-8xl sm:text-9xl font-light text-[#7b4f53]">4</span>
            <div className="relative">
              <div className="absolute inset-0 bg-[#e07c8e] rounded-full blur-2xl animate-pulse-soft" />
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-[#e07c8e] to-[#a66466] flex items-center justify-center shadow-xl">
                <GiPlanetCore className="text-5xl sm:text-6xl text-white" />
              </div>
              <div className="absolute -top-2 -right-2">
                <HiSparkles className="text-[#ffd966] text-xl animate-pulse-soft" />
              </div>
            </div>
            <span className="text-8xl sm:text-9xl font-light text-[#7b4f53]">4</span>
          </div>

          {/* Decorative flowers */}
          <div className="absolute -top-10 -left-10 animate-float-soft">
            <GiFlowerTwirl className="text-4xl text-[#e07c8e]/30" />
          </div>
          <div className="absolute -bottom-10 -right-10 animate-float-slow">
            <GiCherry className="text-4xl text-[#a66466]/30" />
          </div>
        </div>

        {/* Error Message */}
        <div className="relative mb-8 text-center max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-5 py-2.5 rounded-full border border-[#f0d9d6] shadow-sm mb-5">
            <HiSparkles className="text-[#e07c8e] text-sm animate-pulse-soft" />
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#a66466]">
              Sahifa topilmadi
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light leading-tight mb-4">
            <span className="text-[#7b4f53]">Oops! </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e07c8e] to-[#a66466] font-medium">
              Yo'qolib qoldingizmi?
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[#8f6d70] leading-relaxed mb-6">
            Qidirayotgan sahifangiz boshqa manzilga ko'chib ketgan bo'lishi mumkin. 
            Xuddi gul barglari shamolda uchgandek...
          </p>

          {/* Aesthetic Quote */}
          <div className="max-w-lg mx-auto p-5 rounded-2xl bg-white/70 backdrop-blur-sm border border-[#f0d9d6] shadow-sm">
            <p className="text-sm text-[#7b4f53] italic mb-2">
              "{randomQuote.text}"
            </p>
            <p className="text-xs text-[#b38b8d]">{randomQuote.author}</p>
          </div>
        </div>

        {/* Auto-redirect Counter */}
        <div className="relative mb-8 text-center">
          <div className="inline-flex items-center gap-3 bg-white/70 backdrop-blur-sm px-5 py-2.5 rounded-full border border-[#f0d9d6] shadow-sm">
            <MdOutlineRocketLaunch className="text-[#e07c8e] text-sm animate-float-soft" />
            <span className="text-xs text-[#8f6d70]">
              <span className="font-bold text-[#e07c8e]">{countdown}</span> soniyadan keyin o'yinlarga o'tamiz
            </span>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="relative mb-12 flex flex-wrap justify-center gap-3">
          <Link
            to="/games"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative overflow-hidden rounded-full bg-gradient-to-r from-[#e07c8e] to-[#a66466] px-6 py-3 text-sm font-medium text-white shadow-lg hover:-translate-y-1 transition-all"
          >
            <span className="relative flex items-center gap-2">
              <FaGamepad className="text-sm" />
              O'yinlarga o'tish
              <FaArrowLeft className="text-xs rotate-180 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <Link
            to="/"
            className="group relative overflow-hidden rounded-full bg-white/80 backdrop-blur-sm px-6 py-3 text-sm font-medium text-[#7b4f53] border border-[#f0d9d6] hover:bg-white hover:-translate-y-1 transition-all"
          >
            <span className="relative flex items-center gap-2">
              <FaHome className="text-sm" />
              Bosh sahifa
            </span>
          </Link>

          <button
            onClick={() => navigate(-1)}
            className="group relative overflow-hidden rounded-full bg-white/80 backdrop-blur-sm px-6 py-3 text-sm font-medium text-[#7b4f53] border border-[#f0d9d6] hover:bg-white hover:-translate-y-1 transition-all"
          >
            <span className="relative flex items-center gap-2">
              <FaArrowLeft className="text-sm" />
              Orqaga
            </span>
          </button>
        </div>

        {/* Game Suggestions */}
        <div className="relative w-full max-w-4xl">
          <div className="flex items-center gap-2 mb-6">
            <MdAutoAwesome className="text-[#e07c8e] text-xl" />
            <h2 className="text-lg font-medium text-[#7b4f53]">
              Sizga tavsiya qilamiz
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {suggestions.map((game, index) => (
              <Link
                key={index}
                to={game.path}
                className="group relative overflow-hidden"
              >
                <div className="relative p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-[#f0d9d6] hover:-translate-y-1 transition-all duration-300 hover:shadow-lg">
                  
                  {/* Icon */}
                  <div className={`relative mb-2 w-10 h-10 mx-auto rounded-lg bg-gradient-to-r ${game.color} flex items-center justify-center text-white text-lg shadow-md group-hover:scale-110 transition-transform`}>
                    <span>{game.icon}</span>
                    <div className="absolute inset-0 rounded-lg bg-white/20 blur-md group-hover:blur-lg transition-all" />
                  </div>

                  {/* Title */}
                  <h3 className="text-xs font-medium text-[#7b4f53] text-center">
                    {game.name}
                  </h3>

                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#e07c8e]/5 to-[#a66466]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-40 left-5 text-3xl text-[#e07c8e]/20 animate-float-soft">
          <FaBookOpen />
        </div>
        <div className="absolute bottom-40 right-5 text-3xl text-[#a66466]/20 animate-float-slow">
          <FaCompass />
        </div>
        <div className="absolute top-1/3 right-10 text-2xl text-[#7b4f53]/20 animate-spin-slow">
          <GiFlowerTwirl />
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
