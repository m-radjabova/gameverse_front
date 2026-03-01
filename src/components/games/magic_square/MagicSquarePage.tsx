import {
  FaUsers,
  FaTrophy,
  FaClock,
  FaCrown,
  FaMagic,
} from "react-icons/fa";
import {
  GiAchievement,
  GiPodium,
  GiSpinningWheel,
  GiMagicSwirl,
  GiMagicLamp,
} from "react-icons/gi";
import { MdTimer } from "react-icons/md";
import { RiTeamFill } from "react-icons/ri";
import MagicSquare from './MagicSquare';
import GameFeedbackPanel from "../shared/GameFeedbackPanel";

function MagicSquarePage() {
  const gameStats = [
    {
      icon: <FaUsers className="text-2xl text-white" />,
      label: "JAMOALAR",
      value: "2 ta",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: <MdTimer className="text-2xl text-white" />,
      label: "DAVOMIYLIK",
      value: "5-8 daqiqa",
      color: "from-pink-500 to-purple-500",
    },
    {
      icon: <GiMagicSwirl className="text-2xl text-white" />,
      label: "MASALALAR",
      value: "3 ta",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: <FaTrophy className="text-2xl text-white" />,
      label: "MAKSIMUM",
      value: "300+ ball",
      color: "from-pink-500 to-purple-500",
    },
  ];

  const features = [
    {
      icon: GiMagicSwirl,
      title: "Sehrli kvadrat",
      desc: "3x3 rangli sudoku",
      color: "from-purple-500 to-pink-500",
      bgIcon: FaMagic,
      stats: "3 rang",
    },
    {
      icon: FaUsers,
      title: "2 jamoa",
      desc: "Chap va o'ng jamoa musobaqalashadi",
      color: "from-pink-500 to-purple-500",
      bgIcon: RiTeamFill,
      stats: "2 jamoa",
    },
    {
      icon: FaCrown,
      title: "Ball tizimi",
      desc: "Tez yechsangiz, ko'proq ball",
      color: "from-purple-500 to-pink-500",
      bgIcon: GiAchievement,
      stats: "30+ ball",
    },
  ];

  const colors = [
    { name: "Qizil", emoji: "🔴", color: "bg-red-500" },
    { name: "Ko'k", emoji: "🔵", color: "bg-blue-500" },
    { name: "Sariq", emoji: "🟡", color: "bg-yellow-500" },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 dark:from-purple-950 dark:via-pink-950 dark:to-purple-950">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] animate-pulse-slow rounded-full bg-purple-300/20 blur-3xl dark:bg-purple-600/20" />
        <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] animate-pulse-slower rounded-full bg-pink-300/20 blur-3xl dark:bg-pink-600/20" />
        
        {/* Soft Pattern */}
        <div
          className="absolute inset-0 opacity-20 dark:opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 20px 20px, #c084fc 2px, transparent 2px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Floating Magic Icons */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute text-4xl opacity-20 animate-float dark:opacity-10"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${15 + Math.random() * 20}s`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            >
              {["✨", "🌟", "💫", "⭐", "✨", "🌟"][i % 6]}
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 mx-auto min-h-screen w-full max-w-[2000px] px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8 lg:px-8 xl:px-10">
        {/* Hero Section */}
        <div className="group relative mb-8 transform-gpu overflow-hidden rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-900/40 via-pink-900/40 to-purple-900/40 p-6 backdrop-blur-xl shadow-2xl md:p-8 lg:p-10">
          {/* Animated Gradient Border */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-purple-500/30 animate-gradient" />
          </div>

          {/* Corner Decorations */}
          <div className="absolute top-0 left-0 h-20 w-20 border-l-4 border-t-4 border-purple-500/30 rounded-tl-3xl" />
          <div className="absolute top-0 right-0 h-20 w-20 border-r-4 border-t-4 border-purple-500/30 rounded-tr-3xl" />
          <div className="absolute bottom-0 left-0 h-20 w-20 border-l-4 border-b-4 border-purple-500/30 rounded-bl-3xl" />
          <div className="absolute bottom-0 right-0 h-20 w-20 border-r-4 border-b-4 border-purple-500/30 rounded-br-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-2 lg:gap-12 lg:items-center">
            {/* Left Content */}
            <div className="space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-4 py-2 border border-purple-500/30">
                <GiMagicSwirl className="text-purple-400 animate-pulse" />
                <span className="text-sm font-black text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text">
                  SEHRLI KVADRAT
                </span>
                <div className="ml-2 flex h-2 w-2">
                  <span className="absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-5xl font-black leading-tight md:text-6xl lg:text-7xl">
                <span className="relative inline-block">
                  <span className="absolute -inset-2 bg-gradient-to-r from-purple-500/30 to-pink-500/30 blur-2xl" />
                  <span className="relative bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
                    Sehrli
                  </span>
                </span>
                <br />
                <span className="relative inline-block mt-2">
                  <span className="absolute -inset-2 bg-gradient-to-r from-pink-500/30 to-purple-500/30 blur-2xl" />
                  <span className="relative bg-gradient-to-r from-pink-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                    Kvadrat
                  </span>
                </span>
              </h1>

              {/* Description */}
              <div className="relative max-w-xl rounded-xl bg-purple-950/30 p-4 border border-purple-500/30 backdrop-blur-sm">
                <p className="text-base text-purple-200/80 md:text-lg leading-relaxed">
                  3x3 rangli sudoku. Har bir qator va ustunda barcha 3 rang bo'lishi kerak. 
                  Jamoalar navbat bilan o'ynaydi!
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {gameStats.map((stat, index) => (
                  <div
                    key={index}
                    className="group/stat relative transform-gpu overflow-hidden rounded-xl border border-purple-500/20 bg-purple-950/30 p-4 backdrop-blur-sm transition-all hover:scale-105 hover:bg-purple-900/40"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover/stat:opacity-20 transition-opacity`} />
                    <div className="relative">
                      <div className={`mb-2 inline-flex rounded-lg bg-gradient-to-r ${stat.color} p-2.5 shadow-lg`}>
                        {stat.icon}
                      </div>
                      <p className="text-xs font-bold text-purple-300/70">{stat.label}</p>
                      <p className="text-sm font-black text-white mt-1">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Content - Magic Square Preview */}
            <div className="relative">
              {/* Decorative Elements */}
              <div className="absolute -top-8 -left-8 text-6xl rotate-12 animate-float">✨</div>
              <div className="absolute -bottom-8 -right-8 text-6xl -rotate-12 animate-float-delayed">🌟</div>

              {/* Preview Puzzle */}
              <div className="relative transform-gpu overflow-hidden rounded-2xl border-2 border-purple-500/30 bg-gradient-to-br from-purple-900/50 to-pink-900/50 p-6 shadow-2xl">
                <div className="grid grid-cols-3 gap-2 w-48 mx-auto">
                  <div className="aspect-square rounded-lg bg-red-500 flex items-center justify-center text-3xl shadow-lg">🔴</div>
                  <div className="aspect-square rounded-lg bg-blue-500 flex items-center justify-center text-3xl shadow-lg">🔵</div>
                  <div className="aspect-square rounded-lg bg-yellow-500 flex items-center justify-center text-3xl shadow-lg">🟡</div>
                  <div className="aspect-square rounded-lg bg-yellow-500 flex items-center justify-center text-3xl shadow-lg">🟡</div>
                  <div className="aspect-square rounded-lg bg-red-500 flex items-center justify-center text-3xl shadow-lg">🔴</div>
                  <div className="aspect-square rounded-lg bg-blue-500 flex items-center justify-center text-3xl shadow-lg">🔵</div>
                  <div className="aspect-square rounded-lg bg-purple-100/20 border-2 border-dashed border-purple-400/50 flex items-center justify-center text-3xl text-purple-400">❓</div>
                  <div className="aspect-square rounded-lg bg-yellow-500 flex items-center justify-center text-3xl shadow-lg">🟡</div>
                  <div className="aspect-square rounded-lg bg-red-500 flex items-center justify-center text-3xl shadow-lg">🔴</div>
                </div>

                {/* Overlay Badge */}
                <div className="absolute bottom-0 left-0 right-0 z-20 p-4">
                  <div className="inline-flex items-center gap-3 rounded-2xl bg-black/50 backdrop-blur-md px-4 py-2 border border-purple-500/30">
                    <GiMagicLamp className="text-purple-400 text-lg animate-bounce" />
                    <span className="text-sm font-black text-white">3x3 RANGLI SUDOKU</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative transform-gpu overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-950/30 to-pink-950/30 p-6 backdrop-blur-sm transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl hover:border-purple-400/30"
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
              
              <feature.bgIcon className="absolute right-4 top-4 text-5xl text-purple-500/20 group-hover:text-purple-500/30 transition-all group-hover:scale-110 group-hover:rotate-12" />
              
              <div className={`relative mb-5 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r ${feature.color} text-white shadow-xl transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                <feature.icon className="text-2xl" />
              </div>
              
              <h3 className="relative mb-2 text-xl font-black text-white">{feature.title}</h3>
              <p className="relative mb-4 text-sm text-purple-200/70">{feature.desc}</p>
              
              <div className="relative flex items-center gap-2">
                <span className="text-xs font-bold text-purple-400">{feature.stats}</span>
                <div className="h-1.5 flex-1 rounded-full bg-purple-500/20 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${feature.color} transition-all duration-500 group-hover:animate-pulse`}
                    style={{ width: "85%" }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Colors */}
        <div className="mb-8">
          <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              SEHRLI RANGLAR
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-purple-500/30 to-transparent" />
          </h2>

          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            {colors.map((color, index) => (
              <div
                key={index}
                className="group relative transform-gpu overflow-hidden rounded-xl border border-purple-500/20 bg-gradient-to-br from-purple-950/30 to-pink-950/30 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-105 text-center"
              >
                <div className="relative">
                  <div className={`w-16 h-16 rounded-full ${color.color} mx-auto mb-3 shadow-xl border-4 border-white/30 flex items-center justify-center`}>
                    <span className="text-3xl">{color.emoji}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{color.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Game Component Container */}
        <div className="relative">
          {/* Decorative Border */}
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/30 via-pink-600/30 to-purple-600/30 rounded-3xl blur-xl" />

          {/* Main Container */}
          <div className="relative transform-gpu overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-900/40 via-pink-900/40 to-purple-900/40 p-6 backdrop-blur-xl shadow-2xl md:p-8">
            {/* Header */}
            <div className="relative mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-purple-500/30 pb-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute -inset-1 animate-pulse rounded-xl bg-purple-500/50 blur" />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 shadow-2xl border-2 border-purple-400/30">
                    <GiMagicSwirl className="text-3xl text-white" />
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-black text-white tracking-wider">
                    Sehrli Kvadrat
                  </h2>
                  <p className="flex items-center gap-2 text-sm text-purple-200/80">
                    <RiTeamFill className="text-purple-400" />
                    3x3 Rangli Sudoku · 2 jamoa
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <div className="flex items-center gap-2 rounded-full bg-purple-900/50 px-4 py-2 border border-purple-500/30 backdrop-blur-sm">
                  <FaClock className="text-purple-400 text-sm" />
                  <span className="text-xs font-bold text-white">60 soniya</span>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-purple-900/50 px-4 py-2 border border-purple-500/30 backdrop-blur-sm">
                  <GiMagicSwirl className="text-pink-400 text-sm" />
                  <span className="text-xs font-bold text-white">3 rang</span>
                </div>
              </div>
            </div>

            {/* Game Component */}
            <div className="relative">
              <GameFeedbackPanel gameKey="magic-square" />
              <MagicSquare />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative mt-10 flex justify-center items-center gap-6">
          <div className="h-px w-12 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

          <div className="flex gap-4 text-4xl text-purple-600/30">
            <GiAchievement
              className="hover:text-purple-500/50 transition-colors animate-bounce"
              style={{ animationDelay: "0s" }}
            />
            <GiPodium
              className="hover:text-purple-500/50 transition-colors animate-bounce"
              style={{ animationDelay: "0.2s" }}
            />
            <FaTrophy
              className="hover:text-purple-500/50 transition-colors animate-bounce"
              style={{ animationDelay: "0.4s" }}
            />
            <GiSpinningWheel
              className="hover:text-purple-500/50 transition-colors animate-bounce"
              style={{ animationDelay: "0.6s" }}
            />
            <FaCrown
              className="hover:text-purple-500/50 transition-colors animate-bounce"
              style={{ animationDelay: "0.8s" }}
            />
          </div>

          <div className="h-px w-12 bg-gradient-to-r from-purple-500/30 via-transparent to-transparent" />
        </div>
      </div>
    </div>
  );
}

export default MagicSquarePage;