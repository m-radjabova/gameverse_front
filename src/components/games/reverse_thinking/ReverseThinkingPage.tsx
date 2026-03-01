import {
  FaUsers,
  FaTrophy,
  FaClock,
  FaCrown,
  FaBrain,
} from "react-icons/fa";
import {
  GiAchievement,
  GiPodium,
  GiSpinningWheel,
  GiBrain,
  GiLightBulb,
} from "react-icons/gi";
import { MdTimer } from "react-icons/md";
import { RiTeamFill } from "react-icons/ri";
import ReverseThinking from './ReverseThinking';
import GameFeedbackPanel from "../shared/GameFeedbackPanel";

function ReverseThinkingPage() {
  const gameStats = [
    {
      icon: <FaUsers className="text-2xl text-white" />,
      label: "JAMOALAR",
      value: "2 ta",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: <MdTimer className="text-2xl text-white" />,
      label: "DAVOMIYLIK",
      value: "10-15 daqiqa",
      color: "from-emerald-500 to-green-500",
    },
    {
      icon: <GiBrain className="text-2xl text-white" />,
      label: "SAVOLLAR",
      value: "15+ ta",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: <FaTrophy className="text-2xl text-white" />,
      label: "MAKSIMUM",
      value: "500+ ball",
      color: "from-emerald-500 to-green-500",
    },
  ];

  const features = [
    {
      icon: GiBrain,
      title: "Teskari fikr",
      desc: "Mantiqiy tuzoqlar va chalg'ituvchi savollar",
      color: "from-green-500 to-emerald-500",
      bgIcon: FaBrain,
      stats: "15+ savol",
    },
    {
      icon: FaUsers,
      title: "2 jamoa",
      desc: "Chap va o'ng jamoa musobaqalashadi",
      color: "from-emerald-500 to-green-500",
      bgIcon: RiTeamFill,
      stats: "2 jamoa",
    },
    {
      icon: FaCrown,
      title: "Combo tizimi",
      desc: "3 ketma-ket to'g'ri javob +20 bonus",
      color: "from-green-500 to-emerald-500",
      bgIcon: GiAchievement,
      stats: "x3 combo",
    },
  ];

  const levelInfo = [
    { level: 1, name: "Oddiy chalg'ituvchi", color: "from-green-400 to-emerald-400", desc: "Sizni chalg'itishga urinadi" },
    { level: 2, name: "Mantiqiy tuzoq", color: "from-yellow-400 to-amber-400", desc: "Mantiqni sinovchi savollar" },
    { level: 3, name: "Juda tricky", color: "from-orange-400 to-red-400", desc: "Hiyla bilan yozilgan savollar" },
    { level: 4, name: "Tezkor qaror", color: "from-purple-400 to-pink-400", desc: "Tez o'ylashni talab qiladi" },
  ];

  return (
    <div className="relative min-h-screen  w-full overflow-x-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 dark:from-green-950 dark:via-emerald-950 dark:to-green-950">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] animate-pulse-slow rounded-full bg-green-300/20 blur-3xl dark:bg-green-600/20" />
        <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] animate-pulse-slower rounded-full bg-emerald-300/20 blur-3xl dark:bg-emerald-600/20" />
        
        {/* Soft Pattern */}
        <div
          className="absolute inset-0 opacity-20 dark:opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 20px 20px, #86efac 2px, transparent 2px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Floating Brain Icons */}
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
              {["🤔", "🧠", "💭", "🤯", "🤔", "🧠"][i % 6]}
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 mx-auto min-h-screen w-full max-w-[2000px] px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8 lg:px-8 xl:px-10">
        {/* Hero Section */}
        <div className="group relative mb-8 transform-gpu overflow-hidden rounded-3xl border border-green-500/20 bg-gradient-to-br from-green-900/40 via-emerald-900/40 to-green-900/40 p-6 backdrop-blur-xl shadow-2xl md:p-8 lg:p-10">
          {/* Animated Gradient Border */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-green-500/30 via-emerald-500/30 to-green-500/30 animate-gradient" />
          </div>

          {/* Corner Decorations */}
          <div className="absolute top-0 left-0 h-20 w-20 border-l-4 border-t-4 border-green-500/30 rounded-tl-3xl" />
          <div className="absolute top-0 right-0 h-20 w-20 border-r-4 border-t-4 border-green-500/30 rounded-tr-3xl" />
          <div className="absolute bottom-0 left-0 h-20 w-20 border-l-4 border-b-4 border-green-500/30 rounded-bl-3xl" />
          <div className="absolute bottom-0 right-0 h-20 w-20 border-r-4 border-b-4 border-green-500/30 rounded-br-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-2 lg:gap-12 lg:items-center">
            {/* Left Content */}
            <div className="space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 px-4 py-2 border border-green-500/30">
                <GiLightBulb className="text-green-400 animate-pulse" />
                <span className="text-sm font-black text-transparent bg-gradient-to-r from-green-400 via-emerald-400 to-green-400 bg-clip-text">
                  TESKARI FIKR
                </span>
                <div className="ml-2 flex h-2 w-2">
                  <span className="absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-5xl font-black leading-tight md:text-6xl lg:text-7xl">
                <span className="relative inline-block">
                  <span className="absolute -inset-2 bg-gradient-to-r from-green-500/30 to-emerald-500/30 blur-2xl" />
                  <span className="relative bg-gradient-to-r from-green-300 via-emerald-300 to-green-300 bg-clip-text text-transparent">
                    Teskari
                  </span>
                </span>
                <br />
                <span className="relative inline-block mt-2">
                  <span className="absolute -inset-2 bg-gradient-to-r from-emerald-500/30 to-green-500/30 blur-2xl" />
                  <span className="relative bg-gradient-to-r from-emerald-300 via-green-300 to-emerald-300 bg-clip-text text-transparent">
                    Fikr
                  </span>
                </span>
              </h1>

              {/* Description */}
              <div className="relative max-w-xl rounded-xl bg-green-950/30 p-4 border border-green-500/30 backdrop-blur-sm">
                <p className="text-base text-green-200/80 md:text-lg leading-relaxed">
                  Mantiqiy tuzoqlar va chalg'ituvchi savollar orqali fikrlash qobiliyatingizni sinang. 
                  Jamoalar navbat bilan o'ynab, eng aqlli jamoa g'olib bo'ladi!
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {gameStats.map((stat, index) => (
                  <div
                    key={index}
                    className="group/stat relative transform-gpu overflow-hidden rounded-xl border border-green-500/20 bg-green-950/30 p-4 backdrop-blur-sm transition-all hover:scale-105 hover:bg-green-900/40"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover/stat:opacity-20 transition-opacity`} />
                    <div className="relative">
                      <div className={`mb-2 inline-flex rounded-lg bg-gradient-to-r ${stat.color} p-2.5 shadow-lg`}>
                        {stat.icon}
                      </div>
                      <p className="text-xs font-bold text-green-300/70">{stat.label}</p>
                      <p className="text-sm font-black text-white mt-1">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Content - Preview */}
            <div className="relative pointer-events-none">
              {/* Decorative Elements */}
              <div className="absolute -top-8 -left-8 text-6xl rotate-12 animate-float">🤔</div>
              <div className="absolute -bottom-8 -right-8 text-6xl -rotate-12 animate-float-delayed">🧠</div>

              {/* Preview Card */}
              <div className="relative transform-gpu overflow-hidden rounded-2xl border-2 border-green-500/30 bg-gradient-to-br from-green-900/50 to-emerald-900/50 p-6 shadow-2xl">
                <div className="space-y-4">
                  <div className="bg-green-800/30 rounded-xl p-4 border border-green-500/30">
                    <p className="text-white text-lg mb-2">Qaysi oyda 28 kun bor?</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 bg-green-900/50 rounded-lg text-white text-sm">Fevral</div>
                      <div className="p-2 bg-green-900/50 rounded-lg text-white text-sm">Yanvar</div>
                      <div className="p-2 bg-green-900/50 rounded-lg text-white text-sm">Mart</div>
                      <div className="p-2 bg-green-500/30 rounded-lg text-white text-sm font-bold border-2 border-green-400">Hammasida</div>
                    </div>
                  </div>
                  <div className="text-center text-green-300 text-sm">
                    🤯 Mantiqiy tuzoq: Har bir oyda 28 kun bor!
                  </div>
                </div>

                {/* Overlay Badge */}
                <div className="absolute bottom-0 left-0 right-0 z-20 p-4">
                  <div className="inline-flex items-center gap-3 rounded-2xl bg-black/50 backdrop-blur-md px-4 py-2 border border-green-500/30">
                    <GiBrain className="text-green-400 text-lg animate-bounce" />
                    <span className="text-sm font-black text-white">4 LEVEL · 15+ SAVOL</span>
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
              className="group relative transform-gpu overflow-hidden rounded-2xl border border-green-500/20 bg-gradient-to-br from-green-950/30 to-emerald-950/30 p-6 backdrop-blur-sm transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl hover:border-green-400/30"
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
              
              <feature.bgIcon className="absolute right-4 top-4 text-5xl text-green-500/20 group-hover:text-green-500/30 transition-all group-hover:scale-110 group-hover:rotate-12" />
              
              <div className={`relative mb-5 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r ${feature.color} text-white shadow-xl transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                <feature.icon className="text-2xl" />
              </div>
              
              <h3 className="relative mb-2 text-xl font-black text-white">{feature.title}</h3>
              <p className="relative mb-4 text-sm text-green-200/70">{feature.desc}</p>
              
              <div className="relative flex items-center gap-2">
                <span className="text-xs font-bold text-green-400">{feature.stats}</span>
                <div className="h-1.5 flex-1 rounded-full bg-green-500/20 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${feature.color} transition-all duration-500 group-hover:animate-pulse`}
                    style={{ width: "85%" }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Level Info */}
        <div className="mb-8">
          <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
            <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              QIYINLIK DARAJALARI
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-green-500/30 to-transparent" />
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {levelInfo.map((level) => (
              <div
                key={level.level}
                className="group relative transform-gpu overflow-hidden rounded-xl border border-green-500/20 bg-gradient-to-br from-green-950/30 to-emerald-950/30 p-5 backdrop-blur-sm transition-all duration-300 hover:scale-105"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${level.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                <div className="relative text-center">
                  <div className={`inline-block px-3 py-1 rounded-full bg-gradient-to-r ${level.color} text-white text-xs font-bold mb-3`}>
                    LEVEL {level.level}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{level.name}</h3>
                  <p className="text-xs text-green-200/70">{level.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Game Component Container */}
        <div className="relative">
          {/* Decorative Border */}
          <div className="absolute -inset-1 bg-gradient-to-r from-green-600/30 via-emerald-600/30 to-green-600/30 rounded-3xl blur-xl" />

          {/* Main Container */}
          <div className="relative transform-gpu overflow-hidden rounded-3xl border border-green-500/30 bg-gradient-to-br from-green-900/40 via-emerald-900/40 to-green-900/40 p-6 backdrop-blur-xl shadow-2xl md:p-8">
            {/* Header */}
            <div className="relative mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-green-500/30 pb-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute -inset-1 animate-pulse rounded-xl bg-green-500/50 blur" />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 shadow-2xl border-2 border-green-400/30">
                    <GiBrain className="text-3xl text-white" />
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-black text-white tracking-wider">
                    Teskari Fikr
                  </h2>
                  <p className="flex items-center gap-2 text-sm text-green-200/80">
                    <RiTeamFill className="text-green-400" />
                    Mantiqiy tuzoqlar · 2 jamoa
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <div className="flex items-center gap-2 rounded-full bg-green-900/50 px-4 py-2 border border-green-500/30 backdrop-blur-sm">
                  <FaClock className="text-green-400 text-sm" />
                  <span className="text-xs font-bold text-white">30 soniya</span>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-green-900/50 px-4 py-2 border border-green-500/30 backdrop-blur-sm">
                  <FaBrain className="text-emerald-400 text-sm" />
                  <span className="text-xs font-bold text-white">4 level</span>
                </div>
              </div>
            </div>

            {/* Game Component */}
            <div className="relative">
            <GameFeedbackPanel gameKey="reverse-thinking" />
              <ReverseThinking />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative mt-10 flex justify-center items-center gap-6">
          <div className="h-px w-12 bg-gradient-to-r from-transparent via-green-500/30 to-transparent" />

          <div className="flex gap-4 text-4xl text-green-600/30">
            <GiAchievement
              className="hover:text-green-500/50 transition-colors animate-bounce"
              style={{ animationDelay: "0s" }}
            />
            <GiPodium
              className="hover:text-green-500/50 transition-colors animate-bounce"
              style={{ animationDelay: "0.2s" }}
            />
            <FaTrophy
              className="hover:text-green-500/50 transition-colors animate-bounce"
              style={{ animationDelay: "0.4s" }}
            />
            <GiSpinningWheel
              className="hover:text-green-500/50 transition-colors animate-bounce"
              style={{ animationDelay: "0.6s" }}
            />
            <FaCrown
              className="hover:text-green-500/50 transition-colors animate-bounce"
              style={{ animationDelay: "0.8s" }}
            />
          </div>

          <div className="h-px w-12 bg-gradient-to-r from-green-500/30 via-transparent to-transparent" />
        </div>
      </div>
    </div>
  );
}

export default ReverseThinkingPage;