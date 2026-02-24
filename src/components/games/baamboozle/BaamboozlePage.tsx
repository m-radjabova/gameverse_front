import {
  FaUsers,
  FaTrophy,
  FaClock,
  FaCrown,
  FaStar,
  FaMedal,
  FaQuestion,
  FaDice,
  FaGift,
  FaSkull,
  FaCopy,
  FaGem,
} from "react-icons/fa";
import {
  GiAchievement,
  GiPodium,
  GiSpinningWheel,
  GiGamepad,
  GiPuzzle,
  GiBrain,
  GiSwordsEmblem,
} from "react-icons/gi";
import {
  MdTimer,
  MdOutlineGamepad,
  MdSportsEsports,
} from "react-icons/md";
import { RiTeamFill} from "react-icons/ri";
import BaamboozleOyini from "./Baamboozle";
import GameFeedbackPanel from "../shared/GameFeedbackPanel";

function BaamboozlePage() {
  const baamboozleImg =
    "https://media.istockphoto.com/id/1268465415/photo/quiz-time-concept-speech-bubble-with-pencil-on-yellow-background.jpg?s=612x612&w=0&k=20&c=ZowfYpCJeyknpWhnfyWqV1_If6aJmFUiSqqqEUBhvAg=";
  const gameStats = [
    {
      icon: <FaUsers className="text-2xl text-white" />,
      label: "JAMOALAR",
      value: "2 ta",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: <MdTimer className="text-2xl text-white" />,
      label: "DAVOMIYLIK",
      value: "15-25 min",
      color: "from-cyan-500 to-teal-500",
      bgColor: "bg-cyan-500/10",
    },
    {
      icon: <FaDice className="text-2xl text-white" />,
      label: "KATAKLAR",
      value: "25 ta",
      color: "from-teal-500 to-emerald-500",
      bgColor: "bg-teal-500/10",
    },
    {
      icon: <FaTrophy className="text-2xl text-white" />,
      label: "MAKSIMUM",
      value: "5000+ ball",
      color: "from-emerald-500 to-blue-500",
      bgColor: "bg-emerald-500/10",
    },
  ];

  const specialCards = [
    {
      icon: <FaGift className="text-2xl" />,
      title: "Bonus",
      desc: "Kartadagi ball qo'shiladi",
      color: "from-green-500 to-emerald-500",
      bgIcon: FaStar,
      stats: "50-500 ball",
    },
    {
      icon: <FaSkull className="text-2xl" />,
      title: "Jarima",
      desc: "Kartadagi ball ayriladi",
      color: "from-red-500 to-rose-500",
      bgIcon: FaSkull,
      stats: "50-500 ball",
    },
    {
      icon: <FaCopy className="text-2xl" />,
      title: "Steal",
      desc: "Yetakchidan ball olib qo'yish",
      color: "from-purple-500 to-pink-500",
      bgIcon: FaCopy,
      stats: "50-500 ball",
    },
    {
      icon: <FaGem className="text-2xl" />,
      title: "Double",
      desc: "Kartadagi ball ×2",
      color: "from-yellow-500 to-amber-500",
      bgIcon: FaGem,
      stats: "100-1000 ball",
    },
  ];

  const gameLevels = [
    {
      level: "BOSHLANG'ICH",
      tiles: "25 katak",
      time: "15 min",
      icon: FaStar,
      color: "from-green-500 to-emerald-500",
      progress: 33,
      emoji: "🌱",
    },
    {
      level: "O'RTA",
      tiles: "30 katak",
      time: "20 min",
      icon: FaMedal,
      color: "from-yellow-500 to-amber-500",
      progress: 66,
      emoji: "🌿",
    },
    {
      level: "PROFESSIONAL",
      tiles: "40 katak",
      time: "25 min",
      icon: FaCrown,
      color: "from-red-500 to-rose-500",
      progress: 100,
      emoji: "🌳",
    },
  ];

  const features = [
    {
      icon: GiPuzzle,
      title: "Savol kataklari",
      desc: "25 xil savol, turli mavzularda",
      color: "from-blue-500 to-cyan-500",
      bgIcon: FaQuestion,
      stats: "20+ savol",
    },
    {
      icon: GiSwordsEmblem,
      title: "Jamoa bellashuvi",
      desc: "2 jamoa navbat bilan o'ynaydi",
      color: "from-cyan-500 to-teal-500",
      bgIcon: RiTeamFill,
      stats: "2 jamoa",
    },
    {
      icon: GiBrain,
      title: "Maxsus kartalar",
      desc: "Bonus, jarima, steal, double",
      color: "from-teal-500 to-emerald-500",
      bgIcon: GiSpinningWheel,
      stats: "4 xil",
    },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] animate-pulse-slow rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] animate-pulse-slower rounded-full bg-purple-600/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-cyan-600/10 blur-3xl" />

        {/* Game Board Pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Floating Game Icons */}
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
              {i % 4 === 0 && "❓"}
              {i % 4 === 1 && "🎮"}
              {i % 4 === 2 && "🎲"}
              {i % 4 === 3 && "🏆"}
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 mx-auto min-h-screen w-full max-w-[2000px] px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8 lg:px-8 xl:px-10">
        {/* Hero Section - Game Board Style */}
        <div className="group relative mb-8 transform-gpu overflow-hidden rounded-3xl border-2 border-indigo-500/30 bg-gradient-to-br from-indigo-900/60 via-purple-900/50 to-indigo-900/60 p-6 shadow-2xl backdrop-blur-sm md:p-8 lg:p-10">
          {/* Game Board Grid Overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
                                linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          />

          {/* Corner Decorations */}
          <div className="absolute top-0 left-0 h-20 w-20 border-l-4 border-t-4 border-indigo-400/30 rounded-tl-3xl" />
          <div className="absolute top-0 right-0 h-20 w-20 border-r-4 border-t-4 border-indigo-400/30 rounded-tr-3xl" />
          <div className="absolute bottom-0 left-0 h-20 w-20 border-l-4 border-b-4 border-indigo-400/30 rounded-bl-3xl" />
          <div className="absolute bottom-0 right-0 h-20 w-20 border-r-4 border-b-4 border-indigo-400/30 rounded-br-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-2 lg:gap-12 lg:items-center">
            {/* Left Content */}
            <div className="space-y-6">
              {/* Game Badge */}
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 blur-xl rounded-full" />
                <div className="relative flex items-center gap-3 rounded-full bg-gradient-to-r from-indigo-900/80 to-purple-900/80 px-5 py-2 border border-indigo-400/50 shadow-xl backdrop-blur-sm">
                  <MdSportsEsports className="text-indigo-400 text-xl animate-pulse" />
                  <span className="text-sm font-black tracking-wider text-transparent bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text">
                    BAAMBOOZLE GAME SHOW
                  </span>
                  <div className="flex gap-1">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
                    </span>
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="relative">
                <h1 className="text-5xl font-black leading-tight md:text-6xl lg:text-7xl">
                  <span className="relative inline-block">
                    <span className="absolute -inset-2 bg-gradient-to-r from-indigo-500/30 to-purple-500/30 blur-2xl" />
                    <span className="relative bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                      Baamboozle
                    </span>
                  </span>
                </h1>
                <p className="mt-4 text-xl text-indigo-200/80 font-light">
                  Qiziqarli savollar, maxsus kartalar va jamoa bellashuvi
                </p>

                {/* Decorative Dice */}
                <div className="absolute -top-4 -right-4 text-4xl rotate-12 animate-bounce">
                  🎲
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {gameStats.map((stat, index) => (
                  <div
                    key={index}
                    className="group/stat relative transform-gpu overflow-hidden rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/40 to-purple-950/40 p-4 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                  >
                    {/* Animated Background */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover/stat:opacity-20 transition-opacity duration-500`}
                    />

                    {/* Corner Glow */}
                    <div className="absolute top-0 left-0 h-8 w-8 bg-gradient-to-br from-indigo-400/20 to-transparent rounded-tl-xl" />

                    <div className="relative">
                      <div
                        className={`mb-2 inline-flex rounded-lg bg-gradient-to-r ${stat.color} p-2.5 shadow-lg`}
                      >
                        {stat.icon}
                      </div>
                      <p className="text-xs font-bold text-indigo-300/80 tracking-wider">
                        {stat.label}
                      </p>
                      <p className="text-sm font-black text-white mt-1">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Content - Game Image */}
            <div className="relative">
              {/* 3D Dice Decorations */}
              <div className="absolute -top-8 -left-8 text-6xl rotate-12 animate-float">🎲</div>
              <div className="absolute -bottom-8 -right-8 text-6xl -rotate-12 animate-float-delayed">
                🎮
              </div>

              {/* Main Image */}
              <div className="relative transform-gpu overflow-hidden rounded-2xl border-4 border-indigo-500/30 shadow-2xl transition-all duration-500 hover:scale-[1.02] group-hover:border-indigo-400/50">
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/80 via-indigo-900/20 to-transparent z-10" />

                <img
                  src={baamboozleImg}
                  alt="Baamboozle Game"
                  className="h-[300px] w-full object-cover md:h-[400px] lg:h-[450px] transition-transform duration-700 group-hover:scale-110"
                />

                {/* Overlay Content */}
                <div className="absolute bottom-0 left-0 right-0 z-20 p-6">
                  <div className="inline-flex items-center gap-3 rounded-2xl bg-black/60 backdrop-blur-md px-4 py-2 border border-indigo-400/50 shadow-xl">
                    <GiGamepad className="text-indigo-400 text-lg" />
                    <span className="text-sm font-black text-white tracking-wider">
                      INTERAKTIV O'YIN
                    </span>
                    <div className="flex gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
                      <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse delay-150" />
                      <span className="h-2 w-2 rounded-full bg-pink-400 animate-pulse delay-300" />
                    </div>
                  </div>
                </div>

                {/* Floating Badges */}
                <div className="absolute top-4 right-4 z-20 flex gap-2">
                  <div className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-3 py-1.5 text-xs font-bold text-white shadow-xl border border-indigo-400/30 backdrop-blur-sm">
                    <span className="flex items-center gap-1">
                      <FaStar className="text-yellow-300" /> 25 KATAK
                    </span>
                  </div>
                  <div className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1.5 text-xs font-bold text-white shadow-xl border border-purple-400/30 backdrop-blur-sm">
                    2 JAMOA
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
              className="group relative transform-gpu overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 p-6 backdrop-blur-sm transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl hover:border-indigo-400/50"
            >
              {/* Animated Background Pattern */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-700"
                style={{
                  backgroundImage: `radial-gradient(circle at ${30 + index * 20}% ${40 + index * 10}%, rgba(99,102,241,0.3) 0%, transparent 50%)`,
                }}
              />

              {/* Corner Decorations */}
              <div className="absolute top-2 left-2 h-8 w-8 border-l-2 border-t-2 border-indigo-400/30 group-hover:border-indigo-300/50 transition-colors" />
              <div className="absolute top-2 right-2 h-8 w-8 border-r-2 border-t-2 border-indigo-400/30 group-hover:border-indigo-300/50 transition-colors" />
              <div className="absolute bottom-2 left-2 h-8 w-8 border-l-2 border-b-2 border-indigo-400/30 group-hover:border-indigo-300/50 transition-colors" />
              <div className="absolute bottom-2 right-2 h-8 w-8 border-r-2 border-b-2 border-indigo-400/30 group-hover:border-indigo-300/50 transition-colors" />

              {/* Decorative Background Icon */}
              <feature.bgIcon className="absolute right-4 top-4 text-5xl text-indigo-600/20 group-hover:text-indigo-500/30 transition-all group-hover:scale-110 group-hover:rotate-12" />

              {/* Icon */}
              <div
                className={`relative mb-5 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r ${feature.color} text-white shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-2xl`}
              >
                <feature.icon className="text-2xl" />
                <div className="absolute inset-0 rounded-xl bg-white/20 blur-md group-hover:blur-xl transition-all" />
              </div>

              {/* Content */}
              <h3 className="relative mb-2 text-xl font-black text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-indigo-200 group-hover:to-purple-200 group-hover:bg-clip-text transition-all">
                {feature.title}
              </h3>
              <p className="relative mb-4 text-sm text-indigo-200/70 leading-relaxed">
                {feature.desc}
              </p>

              {/* Stats Bar */}
              <div className="relative flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-400">{feature.stats}</span>
                <div className="h-1.5 flex-1 rounded-full bg-indigo-700/30 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${feature.color} transition-all duration-500 group-hover:animate-pulse`}
                    style={{ width: "85%" }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Special Cards Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              MAXSUS KARTALAR
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-indigo-500/30 to-transparent" />
          </h2>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
            {specialCards.map((card, index) => (
              <div
                key={index}
                className="group relative transform-gpu overflow-hidden rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-900/30 to-purple-900/30 p-4 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-indigo-400/40"
              >
                {/* Card Glow */}
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${card.color} opacity-0 group-hover:opacity-20 transition-opacity`}
                />

                {/* Icon */}
                <div
                  className={`relative mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r ${card.color} text-white shadow-lg transition-transform group-hover:scale-110`}
                >
                  {card.icon}
                </div>

                {/* Title */}
                <h3 className="relative mb-1 text-base font-black text-white">{card.title}</h3>
                <p className="relative mb-2 text-xs text-indigo-200/70">{card.desc}</p>

                {/* Stats */}
                <div className="relative flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-400">{card.stats}</span>
                  <div className="h-1 w-12 rounded-full bg-indigo-700/30 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${card.color}`}
                      style={{ width: "70%" }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Game Levels */}
        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
          {gameLevels.map((level, index) => (
            <div
              key={index}
              className="group relative transform-gpu overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-900/30 to-purple-900/30 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-indigo-400/40 hover:shadow-2xl"
            >
              {/* Level Emoji Background */}
              <div className="absolute -right-4 -bottom-4 text-7xl opacity-10 group-hover:opacity-20 transition-opacity">
                {level.emoji}
              </div>

              {/* Icon */}
              <div className="relative mb-4 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-indigo-500/30" />
                  <div
                    className={`relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r ${level.color} text-white text-2xl shadow-2xl border-2 border-white/30`}
                  >
                    {level.icon === FaStar && "⭐"}
                    {level.icon === FaMedal && "🏅"}
                    {level.icon === FaCrown && "👑"}
                  </div>
                </div>
              </div>

              {/* Title */}
              <h4 className="relative mb-2 text-center text-lg font-black text-white tracking-wider">
                {level.level}
              </h4>

              {/* Details */}
              <div className="relative mb-4 space-y-1 text-center">
                <p className="text-sm font-bold text-indigo-300 flex items-center justify-center gap-2">
                  <FaDice className="text-sm" />
                  {level.tiles}
                </p>
                <p className="text-xs text-indigo-200/70 flex items-center justify-center gap-2">
                  <FaClock className="text-xs" />
                  {level.time}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="relative h-2 rounded-full bg-indigo-900/50 border border-indigo-700/30 overflow-hidden">
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

        {/* Baamboozle Component Container */}
        <div className="relative">
          {/* Decorative Border */}
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600/30 via-purple-600/30 to-pink-600/30 rounded-3xl blur-xl" />

          {/* Main Container */}
          <div className="relative transform-gpu overflow-hidden rounded-3xl border-2 border-indigo-500/30 bg-gradient-to-br from-indigo-950/90 via-purple-950/80 to-indigo-950/90 p-6 shadow-2xl backdrop-blur-sm md:p-8">
            {/* Game Board Pattern Overlay */}
            <div
              className="absolute inset-0 opacity-5 pointer-events-none"
              style={{
                backgroundImage: `repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 2px, transparent 2px, transparent 10px)`,
              }}
            />

            {/* Header */}
            <div className="relative mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-indigo-500/30 pb-4">
              <div className="flex items-center gap-4">
                {/* Icon with Glow */}
                <div className="relative">
                  <div className="absolute -inset-1 animate-pulse rounded-xl bg-indigo-600/50 blur" />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 shadow-2xl border-2 border-indigo-400/30">
                    <MdOutlineGamepad className="text-3xl text-white" />
                  </div>
                </div>

                {/* Title */}
                <div>
                  <h2 className="text-2xl font-black text-white tracking-wider flex items-center gap-2">
                    Baamboozle
                    <span className="text-sm font-normal text-indigo-400/70">🎲</span>
                  </h2>
                  <p className="flex items-center gap-2 text-sm text-indigo-200/70">
                    <RiTeamFill className="text-indigo-400" />
                    2 jamoa · 25 katak · Maxsus kartalar
                  </p>
                </div>
              </div>

              {/* Badges */}
              <div className="flex gap-2">
                <div className="flex items-center gap-2 rounded-full bg-indigo-900/50 px-4 py-2 border border-indigo-500/30 backdrop-blur-sm">
                  <GiPuzzle className="text-indigo-400 text-sm" />
                  <span className="text-xs font-bold text-white">Savollar</span>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-indigo-900/50 px-4 py-2 border border-indigo-500/30 backdrop-blur-sm">
                  <GiSwordsEmblem className="text-purple-400 text-sm" />
                  <span className="text-xs font-bold text-white">Bellashuv</span>
                </div>
              </div>
            </div>

            {/* Baamboozle Component */}
            <div className="relative">
              <GameFeedbackPanel gameKey="baamboozle" />
              <BaamboozleOyini />
            </div>
          </div>
        </div>

        {/* Footer with Game Icons */}
        <div className="relative mt-12 flex justify-center items-center gap-6">
          <div className="h-px w-12 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

          <div className="flex gap-4 text-4xl text-indigo-600/30">
            <GiAchievement
              className="hover:text-indigo-400/50 transition-colors animate-bounce"
              style={{ animationDelay: "0s" }}
            />
            <GiPodium
              className="hover:text-indigo-400/50 transition-colors animate-bounce"
              style={{ animationDelay: "0.2s" }}
            />
            <FaTrophy
              className="hover:text-indigo-400/50 transition-colors animate-bounce"
              style={{ animationDelay: "0.4s" }}
            />
            <GiSpinningWheel
              className="hover:text-indigo-400/50 transition-colors animate-bounce"
              style={{ animationDelay: "0.6s" }}
            />
            <FaCrown
              className="hover:text-indigo-400/50 transition-colors animate-bounce"
              style={{ animationDelay: "0.8s" }}
            />
          </div>

          <div className="h-px w-12 bg-gradient-to-r from-indigo-500/30 via-transparent to-transparent" />
        </div>
      </div>
    </div>
  );
}

export default BaamboozlePage;
