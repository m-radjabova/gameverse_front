import {
  FaUsers,
  FaTrophy,
  FaClock,
  FaStar,
  FaCrown,
  FaBrain,
  FaBolt,
} from "react-icons/fa";
import {
  GiAchievement,
  GiPodium,
  GiSpinningWheel,
  GiBrain,
} from "react-icons/gi";
import { MdTimer, MdSpeed } from "react-icons/md";
import {RiMentalHealthFill } from "react-icons/ri";
import MemoryChainArena from './MemoryChainArena';
import GameFeedbackPanel from "../shared/GameFeedbackPanel";

import memoryChain from "../../../assets/Gemini_Generated_Image_cbujqgcbujqgcbuj.png";


function MemoryChainArenaPage() {
  const gameStats = [
    {
      icon: <FaUsers className="text-2xl text-white" />,
      label: "JAMOALAR",
      value: "2 ta",
      color: "from-cyan-500 to-blue-500",
    },
    {
      icon: <MdTimer className="text-2xl text-white" />,
      label: "VAQT",
      value: "30 soniya",
      color: "from-blue-500 to-indigo-500",
    },
    {
      icon: <GiBrain className="text-2xl text-white" />,
      label: "ZANJIR",
      value: "3-10 belgi",
      color: "from-indigo-500 to-purple-500",
    },
    {
      icon: <FaTrophy className="text-2xl text-white" />,
      label: "BALL",
      value: "1000+",
      color: "from-purple-500 to-pink-500",
    },
  ];

  const features = [
    {
      icon: GiBrain,
      title: "Xotira zanjiri",
      desc: "Ketma-ketlikni eslab qoling va tezda takrorlang",
      color: "from-cyan-500 to-blue-500",
      bgIcon: FaBrain,
      stats: "3-10 belgi",
    },
    {
      icon: FaBolt,
      title: "Tezlik bonusi",
      desc: "Qancha tez topsangiz, shuncha ko'p ball",
      color: "from-blue-500 to-indigo-500",
      bgIcon: MdSpeed,
      stats: "×3-5 bonus",
    },
    {
      icon: FaCrown,
      title: "Combo tizimi",
      desc: "Ketma-ket to'g'ri javoblar uchun qo'shimcha ball",
      color: "from-indigo-500 to-purple-500",
      bgIcon: GiAchievement,
      stats: "+7-11 combo",
    },
  ];

  const difficultyLevels = [
    {
      level: "OSON",
      rounds: "6 raund",
      length: "3-8 belgi",
      time: "30 soniya",
      icon: FaStar,
      color: "from-green-500 to-emerald-500",
      progress: 33,
      emoji: "🌱",
    },
    {
      level: "O'RTA",
      rounds: "8 raund",
      length: "4-11 belgi",
      time: "30 soniya",
      icon: FaStar,
      color: "from-yellow-500 to-amber-500",
      progress: 66,
      emoji: "⚡",
    },
    {
      level: "QIYIN",
      rounds: "10 raund",
      length: "5-14 belgi",
      time: "30 soniya",
      icon: FaCrown,
      color: "from-red-500 to-rose-500",
      progress: 100,
      emoji: "👑",
    },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-slate-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] animate-pulse-slow rounded-full bg-cyan-300/20 blur-3xl dark:bg-cyan-600/20" />
        <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] animate-pulse-slower rounded-full bg-fuchsia-300/20 blur-3xl dark:bg-fuchsia-600/20" />
        
        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-20 dark:opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 20px 20px, #06b6d4 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Floating Memory Icons */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute text-4xl opacity-10 animate-float dark:opacity-5"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${15 + Math.random() * 20}s`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            >
              {["🧠", "🔷", "🔶", "⭐", "🎯", "🧩", "🎵", "🚀"][i % 8]}
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 mx-auto min-h-screen w-full max-w-[2000px] px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8 lg:px-8 xl:px-10">
        {/* Hero Section */}
        <div className="group relative mb-8 transform-gpu overflow-hidden rounded-3xl border-2 border-cyan-400/30 bg-gradient-to-br from-white/80 via-cyan-50/80 to-white/80 dark:from-slate-800/90 dark:via-indigo-900/80 dark:to-slate-800/90 p-6 shadow-2xl backdrop-blur-sm md:p-8 lg:p-10">
          <div className="relative grid gap-8 lg:grid-cols-2 lg:gap-12 lg:items-center">
            {/* Left Content */}
            <div className="space-y-6">
              {/* Game Badge */}
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-400 blur-xl rounded-full animate-pulse" />
                <div className="relative flex items-center gap-3 rounded-full bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-800 dark:to-blue-800 px-5 py-2 border-2 border-cyan-400/50 shadow-xl">
                  <GiBrain className="text-cyan-500 dark:text-cyan-300 text-xl animate-pulse" />
                  <span className="text-sm font-black tracking-wider text-transparent bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-300 dark:to-blue-300 bg-clip-text">
                    XOTIRA ZANJIRI
                  </span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-5xl font-black leading-tight md:text-6xl lg:text-7xl">
                <span className="relative inline-block">
                  <span className="absolute -inset-2 bg-gradient-to-r from-cyan-400/30 to-blue-400/30 blur-2xl" />
                  <span className="relative bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-300 dark:to-blue-300 bg-clip-text text-transparent">
                    Memory
                  </span>
                </span>
                <br />
                <span className="relative inline-block mt-2">
                  <span className="absolute -inset-2 bg-gradient-to-r from-blue-400/30 to-indigo-400/30 blur-2xl" />
                  <span className="relative bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-300 dark:to-indigo-300 bg-clip-text text-transparent">
                    Chain Arena
                  </span>
                </span>
              </h1>

              {/* Description */}
              <div className="relative max-w-xl rounded-xl bg-white/50 dark:bg-slate-800/50 p-4 border-2 border-cyan-400/30 backdrop-blur-sm">
                <p className="text-base text-slate-700 dark:text-slate-300 md:text-lg leading-relaxed">
                  2 jamoa navbat bilan zanjirni eslab qoladi va tezda takrorlaydi. 
                  Kim tez va to'g'ri topsa, o'sha ball oladi!
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {gameStats.map((stat, index) => (
                  <div
                    key={index}
                    className="group/stat relative transform-gpu overflow-hidden rounded-xl border-2 border-cyan-400/30 bg-white/50 dark:bg-slate-800/50 p-4 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-2xl"
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
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                        {stat.label}
                      </p>
                      <p className="text-sm font-black text-slate-800 dark:text-white mt-1">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Content - Preview */}
            <div className="relative">
              {/* Decorative Elements */}
              <div className="absolute -top-8 -left-8 text-6xl rotate-12 animate-float">🧠</div>
              <div className="absolute -bottom-8 -right-8 text-6xl -rotate-12 animate-float-delayed">⚡</div>

              {/* Preview Panel */}
              <div className="relative transform-gpu overflow-hidden rounded-2xl border-2 border-cyan-400/30 bg-gradient-to-br from-cyan-900/40 to-blue-900/40 p-4 shadow-2xl">
                <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent" />

                <img
                  src={memoryChain}
                  alt="Memory Chain Arena Preview"
                  className="relative z-0 aspect-[16/9] w-full rounded-xl border border-cyan-300/25 object-cover object-center shadow-[0_12px_30px_rgba(8,47,73,0.45)]"
                />

                <div className="absolute bottom-3 left-3 z-20">
                  <div className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/40 bg-slate-950/55 px-3 py-1.5 backdrop-blur-sm">
                    <GiBrain className="text-cyan-300 text-sm" />
                    <span className="text-[11px] font-black uppercase tracking-[0.1em] text-cyan-100">
                      2 JAMOA · XOTIRA ARENA
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
              className="group relative transform-gpu overflow-hidden rounded-2xl border-2 border-cyan-400/30 bg-white/50 dark:bg-slate-800/50 p-6 backdrop-blur-sm transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl hover:border-cyan-400/50"
            >
              <feature.bgIcon className="absolute right-4 top-4 text-5xl text-cyan-500/20 group-hover:text-cyan-500/30 transition-all group-hover:scale-110 group-hover:rotate-12" />

              <div
                className={`relative mb-5 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r ${feature.color} text-white shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}
              >
                <feature.icon className="text-2xl" />
              </div>

              <h3 className="relative mb-2 text-xl font-black text-slate-800 dark:text-white">{feature.title}</h3>
              <p className="relative mb-4 text-sm text-slate-600 dark:text-slate-400">{feature.desc}</p>

              <div className="relative flex items-center gap-2">
                <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">{feature.stats}</span>
                <div className="h-1.5 flex-1 rounded-full bg-cyan-200 dark:bg-cyan-900/50 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${feature.color} transition-all duration-500 group-hover:animate-pulse`}
                    style={{ width: "85%" }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Difficulty Levels */}
        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
          {difficultyLevels.map((level, index) => (
            <div
              key={index}
              className="group relative transform-gpu overflow-hidden rounded-2xl border-2 border-cyan-400/30 bg-white/50 dark:bg-slate-800/50 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-cyan-400/50 hover:shadow-2xl"
            >
              <div className="absolute -right-4 -bottom-4 text-6xl opacity-10 group-hover:opacity-20">
                {level.emoji}
              </div>

              <div className="relative mb-4 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-cyan-400/30" />
                  <div
                    className={`relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r ${level.color} text-white text-2xl shadow-2xl border-2 border-white/30`}
                  >
                    <level.icon />
                  </div>
                </div>
              </div>

              <h4 className="relative mb-2 text-center text-lg font-black text-slate-800 dark:text-white">
                {level.level}
              </h4>

              <div className="relative mb-4 space-y-1 text-center text-sm">
                <p className="text-slate-600 dark:text-slate-400">{level.rounds}</p>
                <p className="text-slate-500 dark:text-slate-500">{level.length}</p>
                <p className="text-slate-500 dark:text-slate-500">{level.time}</p>
              </div>

              <div className="relative h-2 rounded-full bg-cyan-200 dark:bg-cyan-900/50 overflow-hidden">
                <div
                  className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${level.color} transition-all duration-1000`}
                  style={{ width: `${level.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Game Component Container */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400/30 via-blue-400/30 to-indigo-400/30 rounded-3xl blur-xl" />

          <div className="relative transform-gpu overflow-hidden rounded-3xl border-2 border-cyan-400/30 bg-white/80 dark:bg-slate-900/80 p-6 shadow-2xl backdrop-blur-sm md:p-8">
            {/* Header */}
            <div className="relative mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-cyan-400/30 pb-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute -inset-1 animate-pulse rounded-xl bg-cyan-500/50 blur" />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 shadow-2xl border-2 border-white/30">
                    <GiBrain className="text-3xl text-white" />
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-wider">
                    Memory Chain Arena
                  </h2>
                  <p className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <RiMentalHealthFill className="text-cyan-500" />
                    Xotira zanjiri · 2 jamoa
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <div className="flex items-center gap-2 rounded-full bg-cyan-100 dark:bg-cyan-900/50 px-4 py-2 border-2 border-cyan-400/30">
                  <FaClock className="text-cyan-500 text-sm" />
                  <span className="text-xs font-bold text-slate-700 dark:text-white">30 soniya</span>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-cyan-100 dark:bg-cyan-900/50 px-4 py-2 border-2 border-cyan-400/30">
                  <FaBolt className="text-blue-500 text-sm" />
                  <span className="text-xs font-bold text-slate-700 dark:text-white">Tezlik bonusi</span>
                </div>
              </div>
            </div>

            {/* Game Component */}
            <div className="relative">
              <GameFeedbackPanel gameKey="memory-chain" />
              <MemoryChainArena
                gameTitle="Memory Chain"
                gameTone="from-cyan-500 to-blue-500"
                leftTeamName="1-Jamoa"
                rightTeamName="2-Jamoa"
                initialDifficulty="O'rta"
              />
            </div>
          </div>

          
        </div>

        {/* Footer */}
        <div className="relative mt-12 flex justify-center items-center gap-6">
          <div className="h-px w-12 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />

          <div className="flex gap-4 text-4xl text-cyan-500/30">
            <GiAchievement className="hover:text-cyan-500/50 transition-colors animate-bounce" />
            <GiPodium className="hover:text-cyan-500/50 transition-colors animate-bounce delay-100" />
            <FaTrophy className="hover:text-cyan-500/50 transition-colors animate-bounce delay-200" />
            <GiSpinningWheel className="hover:text-cyan-500/50 transition-colors animate-bounce delay-300" />
            <FaCrown className="hover:text-cyan-500/50 transition-colors animate-bounce delay-400" />
          </div>

          <div className="h-px w-12 bg-gradient-to-r from-cyan-500/30 via-transparent to-transparent" />
        </div>
      </div>
    </div>
  );
}

export default MemoryChainArenaPage;
