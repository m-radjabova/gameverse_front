import {
    FaHome,
  FaTrophy,
  FaBolt,
  FaCrown,
  FaStar,
  FaEye,
  FaPalette,
} from "react-icons/fa";
import {
  GiAchievement,
  GiPodium,
  GiSpinningWheel,
  GiBrain,
  GiLevelFour,
} from "react-icons/gi";
import {
  MdTimer,
} from "react-icons/md";
import { Link } from "react-router-dom";
import FindDifferentColor from "./FindDifferentColor";
import GameFeedbackPanel from "../games/shared/GameFeedbackPanel";

function FindDifferentColorPage() {
  const gameStats = [
    {
      icon: <GiBrain className="text-2xl text-white" />,
      label: "DARAJALAR",
      value: "100+",
      color: "from-cyan-500 to-blue-500",
      bgColor: "bg-cyan-500/10",
    },
    {
      icon: <MdTimer className="text-2xl text-white" />,
      label: "VAQT",
      value: "20s boshlang'ich",
      color: "from-blue-500 to-indigo-500",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: <FaBolt className="text-2xl text-white" />,
      label: "BONUS",
      value: "+2s har to'g'ri",
      color: "from-indigo-500 to-violet-500",
      bgColor: "bg-indigo-500/10",
    },
    {
      icon: <FaCrown className="text-2xl text-white" />,
      label: "REKORD",
      value: "310 ball",
      color: "from-violet-500 to-cyan-500",
      bgColor: "bg-violet-500/10",
    },
  ];

  const features = [
    {
      icon: FaPalette,
      title: "Rang farqini toping",
      desc: "Har bir darajada boshqa rangdagi katakni topishingiz kerak",
      color: "from-cyan-500 to-blue-500",
      bgIcon: FaEye,
      stats: "3-18% farq",
    },
    {
      icon: GiLevelFour,
      title: "Murakkablik oshib boradi",
      desc: "Daraja oshgan sari ranglar farqi kamayib boradi",
      color: "from-blue-500 to-indigo-500",
      bgIcon: GiBrain,
      stats: "100+ daraja",
    },
    {
      icon: FaTrophy,
      title: "Reyting tizimi",
      desc: "Eng yaxshi natijalar global reytingda saqlanadi",
      color: "from-indigo-500 to-violet-500",
      bgIcon: GiAchievement,
      stats: "Top 10",
    },
  ];

  const gameLevels = [
    {
      level: "BOSHLANG'ICH",
      grid: "4x4",
      diff: "18% farq",
      time: "20s",
      icon: FaStar,
      color: "from-green-500 to-emerald-500",
      progress: 25,
      emoji: "🌱",
    },
    {
      level: "O'RTA",
      grid: "8x8",
      diff: "10% farq",
      time: "20s",
      icon: FaBolt,
      color: "from-yellow-500 to-amber-500",
      progress: 50,
      emoji: "⚡",
    },
    {
      level: "PROFESSIONAL",
      grid: "10x10",
      diff: "5% farq",
      time: "20s",
      icon: FaCrown,
      color: "from-red-500 to-rose-500",
      progress: 75,
      emoji: "👑",
    },
    {
      level: "AFSONAVIY",
      grid: "12x12",
      diff: "3% farq",
      time: "20s",
      icon: GiBrain,
      color: "from-purple-500 to-pink-500",
      progress: 100,
      emoji: "🧠",
    },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] animate-pulse-slow rounded-full bg-cyan-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] animate-pulse-slower rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-indigo-600/10 blur-3xl" />

        {/* Color Dots Pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 15px 15px, rgba(6,182,212,0.15) 2px, transparent 2px)`,
            backgroundSize: '30px 30px',
          }}
        />

        {/* Floating Color Icons */}
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute text-white/5 animate-float"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${15 + Math.random() * 20}s`,
                fontSize: `${20 + Math.random() * 30}px`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            >
              {i % 4 === 0 && "🎨"}
              {i % 4 === 1 && "🌈"}
              {i % 4 === 2 && "🖌️"}
              {i % 4 === 3 && "🎯"}
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 mx-auto min-h-screen w-full max-w-[2000px] px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8 lg:px-8 xl:px-10">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-5 py-2.5 border border-cyan-500/30 backdrop-blur-sm">
            <FaPalette className="text-cyan-400 text-xl animate-pulse" />
            <span className="text-sm font-black tracking-wider text-transparent bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text">
              FIND DIFFERENT COLOR
            </span>
            <div className="flex gap-1">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500" />
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              to="/games"
              className="group relative overflow-hidden rounded-xl bg-slate-800/80 px-5 py-2.5 text-sm font-bold text-slate-200 border border-slate-700/50 transition-all hover:border-cyan-500/30 hover:bg-slate-800"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex items-center gap-2">
                <FaHome className="text-cyan-400" />
                O'yinlar
              </span>
            </Link>
          </div>
        </div>

        {/* Hero Section */}
        <div className="group relative mb-8 transform-gpu overflow-hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/80 via-indigo-900/80 to-slate-900/80 p-6 shadow-2xl backdrop-blur-sm md:p-8 lg:p-10">
          {/* Animated Border */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-500/30 via-blue-500/30 to-indigo-500/30 animate-gradient" />
          </div>

          {/* Corner Decorations */}
          <div className="absolute top-0 left-0 h-20 w-20 border-l-4 border-t-4 border-cyan-400/30 rounded-tl-3xl" />
          <div className="absolute top-0 right-0 h-20 w-20 border-r-4 border-t-4 border-blue-400/30 rounded-tr-3xl" />
          <div className="absolute bottom-0 left-0 h-20 w-20 border-l-4 border-b-4 border-indigo-400/30 rounded-bl-3xl" />
          <div className="absolute bottom-0 right-0 h-20 w-20 border-r-4 border-b-4 border-indigo-400/30 rounded-br-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-2 lg:gap-12 lg:items-center">
            {/* Left Content */}
            <div className="space-y-6">
              {/* Title */}
              <div className="relative">
                <h1 className="text-5xl font-black leading-tight md:text-6xl lg:text-7xl">
                  <span className="relative inline-block">
                    <span className="absolute -inset-2 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 blur-2xl" />
                    <span className="relative bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-300 bg-clip-text text-transparent">
                      Farqli rang
                    </span>
                  </span>
                  <br />
                  <span className="relative inline-block mt-2">
                    <span className="absolute -inset-2 bg-gradient-to-r from-blue-500/30 to-indigo-500/30 blur-2xl" />
                    <span className="relative bg-gradient-to-r from-blue-300 via-indigo-300 to-violet-300 bg-clip-text text-transparent">
                      topish o'yini
                    </span>
                  </span>
                </h1>

                <div className="relative mt-4 h-1 w-32 overflow-hidden rounded-full bg-gradient-to-r from-cyan-500/50 via-blue-500/50 to-indigo-500/50">
                  <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                </div>
              </div>

              {/* Description */}
              <div className="relative max-w-xl rounded-xl bg-slate-800/50 p-4 border border-cyan-500/30 backdrop-blur-sm">
                <p className="text-base text-slate-200/90 md:text-lg leading-relaxed">
                  Ko'z bilan ranglarni farqlash qobiliyatingizni sinang. 
                  Har bir darajada boshqa rangdagi katakni toping va vaqt qo'shib oling.
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {gameStats.map((stat, index) => (
                  <div
                    key={index}
                    className="group/stat relative transform-gpu overflow-hidden rounded-xl border border-cyan-500/20 bg-gradient-to-br from-slate-800/50 to-indigo-800/50 p-4 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover/stat:opacity-20 transition-opacity duration-500`}
                    />

                    <div className="relative">
                      <div
                        className={`mb-2 inline-flex rounded-lg bg-gradient-to-r ${stat.color} p-2.5 shadow-lg`}
                      >
                        {stat.icon}
                      </div>
                      <p className="text-xs font-bold text-slate-300/80 tracking-wider">
                        {stat.label}
                      </p>
                      <p className="text-sm font-black text-white mt-1">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Content - Visual Preview */}
            <div className="relative">
              {/* Decorative Elements */}
              <div className="absolute -top-8 -left-8 text-6xl rotate-12 animate-float">🎨</div>
              <div className="absolute -bottom-8 -right-8 text-6xl -rotate-12 animate-float-delayed">
                🎯
              </div>

              {/* Color Grid Preview */}
              <div className="relative transform-gpu overflow-hidden rounded-2xl border-4 border-cyan-500/30 shadow-2xl transition-all duration-500 hover:scale-[1.02] group-hover:border-cyan-400/50">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/20 to-transparent z-10" />

                <div className="bg-slate-900 p-6">
                  <div className="grid grid-cols-4 gap-3">
                    {Array.from({ length: 16 }).map((_, i) => {
                      const isOdd = i === 7;
                      const baseColor = "hsl(200 70% 50%)";
                      const oddColor = "hsl(200 70% 42%)";
                      
                      return (
                        <div
                          key={i}
                          className="aspect-square rounded-lg border border-white/10 shadow-lg transition-transform hover:scale-105"
                          style={{
                            background: isOdd ? oddColor : baseColor,
                          }}
                        >
                          {isOdd && (
                            <div className="absolute -top-2 -right-2 text-xs bg-yellow-400 text-slate-900 rounded-full w-5 h-5 flex items-center justify-center font-bold">
                              !
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Overlay Badge */}
                <div className="absolute bottom-0 left-0 right-0 z-20 p-4">
                  <div className="inline-flex items-center gap-3 rounded-2xl bg-black/60 backdrop-blur-md px-4 py-2 border border-cyan-400/50 shadow-xl">
                    <FaEye className="text-cyan-400 text-lg" />
                    <span className="text-sm font-black text-white tracking-wider">
                      FARQLI RANGNI TOPING
                    </span>
                    <div className="flex gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                      <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse delay-150" />
                      <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse delay-300" />
                    </div>
                  </div>
                </div>

                {/* Difficulty Badge */}
                <div className="absolute top-4 right-4 z-20">
                  <div className="rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-xl border border-cyan-400/30 backdrop-blur-sm">
                    <span className="flex items-center gap-1">
                      <GiBrain className="text-sm" /> 100+ DARAJA
                    </span>
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
              className="group relative transform-gpu overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-800/50 to-indigo-800/50 p-6 backdrop-blur-sm transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl hover:border-cyan-400/50"
            >
              {/* Animated Background */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-700"
                style={{
                  backgroundImage: `radial-gradient(circle at ${30 + index * 20}% ${40 + index * 10}%, rgba(6,182,212,0.3) 0%, transparent 50%)`,
                }}
              />

              {/* Corner Decorations */}
              <div className="absolute top-2 left-2 h-8 w-8 border-l-2 border-t-2 border-cyan-400/30 group-hover:border-cyan-300/50 transition-colors" />
              <div className="absolute top-2 right-2 h-8 w-8 border-r-2 border-t-2 border-blue-400/30 group-hover:border-blue-300/50 transition-colors" />
              <div className="absolute bottom-2 left-2 h-8 w-8 border-l-2 border-b-2 border-indigo-400/30 group-hover:border-indigo-300/50 transition-colors" />
              <div className="absolute bottom-2 right-2 h-8 w-8 border-r-2 border-b-2 border-indigo-400/30 group-hover:border-indigo-300/50 transition-colors" />

              {/* Decorative Icon */}
              <feature.bgIcon className="absolute right-4 top-4 text-5xl text-cyan-600/20 group-hover:text-cyan-500/30 transition-all group-hover:scale-110 group-hover:rotate-12" />

              {/* Icon */}
              <div
                className={`relative mb-5 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r ${feature.color} text-white shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-2xl`}
              >
                <feature.icon className="text-2xl" />
                <div className="absolute inset-0 rounded-xl bg-white/20 blur-md group-hover:blur-xl transition-all" />
              </div>

              {/* Content */}
              <h3 className="relative mb-2 text-xl font-black text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-200 group-hover:to-blue-200 group-hover:bg-clip-text transition-all">
                {feature.title}
              </h3>
              <p className="relative mb-4 text-sm text-slate-200/70 leading-relaxed">
                {feature.desc}
              </p>

              {/* Stats Bar */}
              <div className="relative flex items-center gap-2">
                <span className="text-xs font-bold text-cyan-400">{feature.stats}</span>
                <div className="h-1.5 flex-1 rounded-full bg-slate-700/50 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${feature.color} transition-all duration-500 group-hover:animate-pulse`}
                    style={{ width: "85%" }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Game Levels */}
        <div className="mb-8">
          <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              QIYINLIK DARAJALARI
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-cyan-500/30 to-transparent" />
          </h2>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
            {gameLevels.map((level, index) => (
              <div
                key={index}
                className="group relative transform-gpu overflow-hidden rounded-xl border border-cyan-500/20 bg-gradient-to-br from-slate-800/50 to-indigo-800/50 p-4 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-cyan-400/40"
              >
                {/* Level Emoji Background */}
                <div className="absolute -right-4 -bottom-4 text-5xl opacity-10 group-hover:opacity-20 transition-opacity">
                  {level.emoji}
                </div>

                {/* Icon */}
                <div className="relative mb-3 flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-cyan-500/30" />
                    <div
                      className={`relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r ${level.color} text-white text-xl shadow-2xl border-2 border-white/30`}
                    >
                      {level.icon === FaStar && "⭐"}
                      {level.icon === FaBolt && "⚡"}
                      {level.icon === FaCrown && "👑"}
                      {level.icon === GiBrain && "🧠"}
                    </div>
                  </div>
                </div>

                {/* Title */}
                <h4 className="relative mb-2 text-center text-sm font-black text-white tracking-wider">
                  {level.level}
                </h4>

                {/* Details */}
                <div className="relative mb-3 space-y-1 text-center text-xs">
                  <p className="text-cyan-300 font-bold">{level.grid}</p>
                  <p className="text-slate-300">{level.diff}</p>
                  <p className="text-slate-400">{level.time}</p>
                </div>

                {/* Progress Bar */}
                <div className="relative h-1.5 rounded-full bg-slate-700/50 overflow-hidden">
                  <div
                    className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${level.color} transition-all duration-1000`}
                    style={{ width: `${level.progress}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Game Component Container */}
        <div className="relative">
          {/* Decorative Border */}
          <div className="absolute bg-gradient-to-r from-cyan-600/30 via-blue-600/30 to-indigo-600/30 rounded-3xl blur-xl" />

          {/* Main Container */}
          <div className="relative transform-gpu overflow-hidden rounded-3xl border-2 border-cyan-500/30 bg-gradient-to-br from-slate-900/90 via-indigo-900/80 to-slate-900/90 p-6 shadow-2xl backdrop-blur-sm md:p-8">
            {/* Grid Pattern Overlay */}
            <div
              className="absolute inset-0 opacity-5 pointer-events-none"
              style={{
                backgroundImage: `repeating-linear-gradient(45deg, rgba(6,182,212,0.1) 0px, rgba(6,182,212,0.1) 2px, transparent 2px, transparent 10px)`,
              }}
            />

            {/* Header */}
            <div className="relative mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-cyan-500/30 pb-4">
              <div className="flex items-center gap-4">
                {/* Icon with Glow */}
                <div className="relative">
                  <div className="absolute -inset-1 animate-pulse rounded-xl bg-cyan-600/50 blur" />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 shadow-2xl border-2 border-cyan-400/30">
                    <FaPalette className="text-3xl text-white" />
                  </div>
                </div>

                {/* Title */}
                <div>
                  <h2 className="text-2xl font-black text-white tracking-wider flex items-center gap-2">
                    Find Different Color
                    <span className="text-sm font-normal text-cyan-400/70">🎨</span>
                  </h2>
                  <p className="flex items-center gap-2 text-sm text-slate-200/70">
                    <FaEye className="text-cyan-400" />
                    Farqli rangni topish · 100+ daraja
                  </p>
                </div>
              </div>

              {/* Badges */}
              <div className="flex gap-2">
                <div className="flex items-center gap-2 rounded-full bg-cyan-900/50 px-4 py-2 border border-cyan-500/30 backdrop-blur-sm">
                  <GiBrain className="text-cyan-400 text-sm" />
                  <span className="text-xs font-bold text-white">Diqqat</span>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-cyan-900/50 px-4 py-2 border border-cyan-500/30 backdrop-blur-sm">
                  <FaBolt className="text-blue-400 text-sm" />
                  <span className="text-xs font-bold text-white">Tezlik</span>
                </div>
              </div>
            </div>

            {/* FindDifferentColor Component */}
            <div className="relative">
                          <GameFeedbackPanel gameKey="find-color" />
            <FindDifferentColor />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative mt-12 flex justify-center items-center gap-6">
          <div className="h-px w-12 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />

          <div className="flex gap-4 text-4xl text-cyan-600/30">
            <GiAchievement
              className="hover:text-cyan-400/50 transition-colors animate-bounce"
              style={{ animationDelay: "0s" }}
            />
            <GiPodium
              className="hover:text-cyan-400/50 transition-colors animate-bounce"
              style={{ animationDelay: "0.2s" }}
            />
            <FaTrophy
              className="hover:text-cyan-400/50 transition-colors animate-bounce"
              style={{ animationDelay: "0.4s" }}
            />
            <GiSpinningWheel
              className="hover:text-cyan-400/50 transition-colors animate-bounce"
              style={{ animationDelay: "0.6s" }}
            />
            <FaCrown
              className="hover:text-cyan-400/50 transition-colors animate-bounce"
              style={{ animationDelay: "0.8s" }}
            />
          </div>

          <div className="h-px w-12 bg-gradient-to-r from-cyan-500/30 via-transparent to-transparent" />
        </div>
      </div>
    </div>
  );
}

export default FindDifferentColorPage;
