import {
  FaCompass,
  FaCrown,
  FaGem,
  FaMapMarkedAlt,
  FaStar,
  FaTrophy,
  FaUsers,
  FaBolt,
  FaShip,
} from "react-icons/fa";
import {
  GiTreasureMap,
  GiChest,
  GiPathDistance,
  GiAchievement,
  GiPodium,
  GiShipWheel,
  GiAnchor,
  GiPirateFlag
} from "react-icons/gi";
import { MdEmojiEvents} from "react-icons/md";
import { RiTreasureMapFill } from "react-icons/ri";
import GameFeedbackPanel from "../shared/GameFeedbackPanel";
import GamePagePlayButton from "../shared/GamePagePlayButton";

import image from "../../../assets/treasure_hunt_img.png"

function TreasureHuntPage() {
  const treasureHuntImg = image;
  const gameStats = [
    {
      icon: <FaUsers className="text-amber-400" />,
      label: "O'YINCHILAR",
      value: "1-3 kishi",
      color: "from-amber-500 to-yellow-500",
      bgGlow: "bg-amber-500/20",
    },
    {
      icon: <GiPathDistance className="text-amber-400" />,
      label: "NODELAR",
      value: "12 ta",
      color: "from-yellow-500 to-amber-600",
      bgGlow: "bg-yellow-500/20",
    },
    {
      icon: <FaTrophy className="text-amber-400" />,
      label: "MAKSIMUM",
      value: "1500+ ball",
      color: "from-amber-500 to-orange-500",
      bgGlow: "bg-amber-500/20",
    },
    {
      icon: <FaCompass className="text-amber-400" />,
      label: "TOPSHIRIQ",
      value: "Kreativ",
      color: "from-orange-500 to-amber-600",
      bgGlow: "bg-orange-500/20",
    },
  ];

  const features = [
    {
      icon: <FaMapMarkedAlt className="text-2xl" />,
      title: "Xarita bo'ylab yurish",
      desc: "Har bosqichda yangi hikoya va topishmoq kutadi",
      color: "from-amber-400 to-yellow-400",
      bgIcon: RiTreasureMapFill,
      stats: "12 node",
      bgImage: "radial-gradient(circle at 30% 50%, rgba(245,158,11,0.1) 0%, transparent 50%)",
    },
    {
      icon: <FaGem className="text-2xl" />,
      title: "Ball va bonus",
      desc: "Tez javob bersangiz speed bonus, ba'zida x2 reward",
      color: "from-yellow-400 to-amber-500",
      bgIcon: FaBolt,
      stats: "x2 bonus",
      bgImage: "radial-gradient(circle at 70% 30%, rgba(245,158,11,0.1) 0%, transparent 50%)",
    },
    {
      icon: <GiChest className="text-2xl" />,
      title: "Yakuniy xazina",
      desc: "Oxirida natija, reyting va qayta o'ynash imkoniyati",
      color: "from-amber-500 to-orange-400",
      bgIcon: FaCrown,
      stats: "Grand prize",
      bgImage: "radial-gradient(circle at 50% 70%, rgba(245,158,11,0.1) 0%, transparent 50%)",
    },
  ];

  const treasureLevels = [
    {
      level: "BOSHLANG'ICH",
      reward: "Bronza sandiq",
      time: "5-7 min",
      icon: FaStar,
      color: "from-amber-400 to-yellow-400",
      progress: 33,
      chest: "🥉",
    },
    {
      level: "O'RTA",
      reward: "Kumush sandiq",
      time: "8-10 min",
      icon: FaGem,
      color: "from-yellow-400 to-amber-500",
      progress: 66,
      chest: "🥈",
    },
    {
      level: "PROFESSIONAL",
      reward: "Oltin sandiq",
      time: "12 min",
      icon: FaCrown,
      color: "from-amber-500 to-orange-400",
      progress: 100,
      chest: "🥇",
    },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-[#1a0f0a] via-[#2d1a0f] to-[#3d2a1a]">
      {/* Vintage paper texture overlay */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }}
      />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs with more depth */}
        <div className="absolute -top-40 -left-40 h-[800px] w-[800px] animate-pulse-slow rounded-full bg-amber-800/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[800px] w-[800px] animate-pulse-slower rounded-full bg-orange-800/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 animate-pulse-slow rounded-full bg-yellow-800/10 blur-3xl" />

        {/* Floating treasure map elements */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute text-amber-700/10 animate-float"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${15 + Math.random() * 20}s`,
                fontSize: `${20 + Math.random() * 40}px`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            >
              {i % 3 === 0 ? "🗺️" : i % 3 === 1 ? "⚓" : "☠️"}
            </div>
          ))}
        </div>

        {/* Decorative pirate elements */}
        <div className="absolute left-[2%] top-[10%] text-6xl text-amber-700/10 rotate-12 animate-float-slow">
          <GiShipWheel />
        </div>
        <div className="absolute right-[5%] bottom-[15%] text-7xl text-amber-700/10 -rotate-12 animate-float">
          <GiAnchor />
        </div>
        <div className="absolute left-[10%] bottom-[20%] text-6xl text-amber-700/10 rotate-45 animate-float-delayed">
          <GiPirateFlag />
        </div>
      </div>

      <div className="relative z-10 mx-auto min-h-screen w-full max-w-[2000px] px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8 lg:px-8 xl:px-10">
        {/* Hero Section - Vintage Treasure Map Style */}
        <div className="group relative mb-8 transform-gpu overflow-hidden rounded-3xl border-2 border-amber-700/30 bg-gradient-to-br from-amber-900/60 via-amber-800/50 to-amber-900/60 p-6 shadow-2xl md:p-8 lg:p-10">
          {/* Aged paper texture */}
          <div
            className="absolute inset-0 opacity-30 mix-blend-multiply"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, rgba(139, 69, 19, 0.1) 0px, rgba(139, 69, 19, 0.1) 2px, transparent 2px, transparent 8px)`,
            }}
          />

          {/* Burned edges effect */}
          <div className="absolute inset-0 rounded-3xl shadow-[inset_0_0_30px_rgba(0,0,0,0.5)]" />
          <div className="absolute top-0 left-0 h-32 w-32 rounded-tl-3xl bg-gradient-to-br from-amber-950/30 to-transparent" />
          <div className="absolute top-0 right-0 h-32 w-32 rounded-tr-3xl bg-gradient-to-bl from-amber-950/30 to-transparent" />
          <div className="absolute bottom-0 left-0 h-32 w-32 rounded-bl-3xl bg-gradient-to-tr from-amber-950/30 to-transparent" />
          <div className="absolute bottom-0 right-0 h-32 w-32 rounded-br-3xl bg-gradient-to-tl from-amber-950/30 to-transparent" />

          <div className="relative grid gap-8 lg:grid-cols-2 lg:gap-12 lg:items-center">
            {/* Left Content */}
            <div className="space-y-6">
              {/* Vintage Badge */}
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-amber-500/30 blur-xl rounded-full" />
                <div className="relative flex items-center gap-3 rounded-full bg-gradient-to-r from-amber-900/80 to-amber-800/80 px-5 py-2 border border-amber-500/50 shadow-xl backdrop-blur-sm">
                  <GiTreasureMap className="text-amber-400 text-xl" />
                  <span className="text-sm font-black tracking-wider text-transparent bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-300 bg-clip-text">
                    TREASURE HUNT ADVENTURE
                  </span>
                  <div className="flex gap-1">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
                    </span>
                  </div>
                </div>
              </div>

              {/* Title with vintage style */}
              <div className="relative">
                <h1 className="text-5xl font-black leading-tight md:text-6xl lg:text-7xl">
                  <span className="relative inline-block">
                    <span className="absolute -inset-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 blur-2xl" />
                    <span className="relative bg-gradient-to-r from-amber-300 via-yellow-300 to-orange-300 bg-clip-text text-transparent">
                      Xazina
                    </span>
                  </span>
                  <br />
                  <span className="relative inline-block mt-2">
                    <span className="absolute -inset-2 bg-gradient-to-r from-amber-600/20 to-orange-600/20 blur-2xl" />
                    <span className="relative bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 bg-clip-text text-transparent">
                      izlovchilar
                    </span>
                  </span>
                </h1>

                {/* Decorative divider */}
                <div className="relative mt-4 h-1 w-32 overflow-hidden rounded-full bg-gradient-to-r from-amber-500/50 via-yellow-500/50 to-orange-500/50">
                  <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                </div>
              </div>

              {/* Description with vintage paper effect */}
              <div className="relative max-w-xl rounded-xl bg-amber-950/30 p-4 border border-amber-700/30 backdrop-blur-sm">
                <p className="text-base text-amber-200/90 md:text-lg leading-relaxed">
                  Xarita bo'ylab yurib, topishmoqlarni yeching va yakunda xazinani qo'lga kiriting.
                  Tezlik, mantiq va diqqat hammasi kerak bo'ladi.
                </p>
              </div>

              {/* Stats Grid with vintage cards */}
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {gameStats.map((stat, index) => (
                  <div
                    key={index}
                    className="group/stat relative transform-gpu overflow-hidden rounded-xl border border-amber-700/30 bg-gradient-to-br from-amber-950/40 to-amber-900/40 p-4 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                  >
                    {/* Animated background */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover/stat:opacity-20 transition-opacity duration-500`}
                    />

                    {/* Vintage corner decoration */}
                    <div className="absolute top-0 left-0 h-6 w-6 border-l-2 border-t-2 border-amber-500/30" />
                    <div className="absolute top-0 right-0 h-6 w-6 border-r-2 border-t-2 border-amber-500/30" />
                    <div className="absolute bottom-0 left-0 h-6 w-6 border-l-2 border-b-2 border-amber-500/30" />
                    <div className="absolute bottom-0 right-0 h-6 w-6 border-r-2 border-b-2 border-amber-500/30" />

                    <div className="relative">
                      <div className={`mb-2 inline-flex rounded-lg bg-gradient-to-r ${stat.color} p-2.5 shadow-lg`}>
                        <span className="text-lg text-white">{stat.icon}</span>
                      </div>
                      <p className="text-xs font-bold text-amber-300/80 tracking-wider">{stat.label}</p>
                      <p className="text-sm font-black text-white mt-1">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            <GamePagePlayButton
                to="/games/treasure-hunt/play"
                colorClassName="from-amber-500 to-yellow-500"
                className="pt-2"
                modeSelectionEnabled
              />
            </div>

            {/* Right Content - Vintage Map Image */}
            <div className="relative">
              {/* Decorative rope corners */}
              <div className="absolute -top-4 -left-4 text-3xl text-amber-700/50 rotate-45">⚓</div>
              <div className="absolute -top-4 -right-4 text-3xl text-amber-700/50 -rotate-45">⚓</div>
              <div className="absolute -bottom-4 -left-4 text-3xl text-amber-700/50 -rotate-45">⚓</div>
              <div className="absolute -bottom-4 -right-4 text-3xl text-amber-700/50 rotate-45">⚓</div>

              {/* Main image container with vintage frame */}
              <div className="relative transform-gpu overflow-hidden rounded-2xl border-4 border-amber-700/50 shadow-2xl transition-all duration-500 hover:scale-[1.02] group-hover:border-amber-600/70">
                {/* Aged photo effect */}
                <div
                  className="absolute inset-0 z-10 opacity-30 mix-blend-multiply pointer-events-none"
                  style={{
                    backgroundImage: `linear-gradient(145deg, rgba(139,69,19,0.3) 0%, transparent 30%, transparent 70%, rgba(139,69,19,0.3) 100%)`,
                  }}
                />

                <img
                  src={treasureHuntImg}
                  alt="Treasure Hunt Game"
                  className="h-[360px] w-full object-cover md:h-[440px] lg:h-[520px] transition-transform duration-700 group-hover:scale-110"
                />

                {/* Vintage overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-amber-950/80 via-amber-900/20 to-transparent" />

                {/* Content overlay */}
                <div className="absolute bottom-0 left-0 right-0 z-20 p-6">
                  <div className="inline-flex items-center gap-3 rounded-2xl bg-black/60 backdrop-blur-md px-4 py-2 border border-amber-500/50 shadow-xl">
                    <GiShipWheel className="text-amber-400 text-lg animate-spin-slow" />
                    <span className="text-sm font-black text-white tracking-wider">SARGUZASHT O'YINI</span>
                    <div className="flex gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                      <span className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse delay-150" />
                      <span className="h-2 w-2 rounded-full bg-orange-400 animate-pulse delay-300" />
                    </div>
                  </div>
                </div>

                {/* Floating badges */}
                <div className="absolute top-4 right-4 z-20 flex gap-2">
                  <div className="rounded-full bg-gradient-to-r from-amber-700 to-amber-600 px-3 py-1.5 text-xs font-bold text-white shadow-xl border border-amber-400/30 backdrop-blur-sm">
                    <span className="flex items-center gap-1">
                      <FaStar className="text-yellow-300" /> 4.8
                    </span>
                  </div>
                  <div className="rounded-full bg-gradient-to-r from-amber-800 to-amber-700 px-3 py-1.5 text-xs font-bold text-white shadow-xl border border-amber-400/30 backdrop-blur-sm">
                    1.2k+ o'ynagan
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid with 3D effect */}
        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative transform-gpu overflow-hidden rounded-2xl border border-amber-700/30 bg-gradient-to-br from-amber-900/40 to-amber-800/40 p-6 backdrop-blur-sm transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl hover:border-amber-500/50"
              style={{
                boxShadow: "0 10px 30px -15px rgba(0,0,0,0.5)",
              }}
            >
              {/* Animated background pattern */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                style={{
                  backgroundImage: feature.bgImage,
                }}
              />

              {/* Vintage corner decorations */}
              <div className="absolute top-2 left-2 h-8 w-8 border-l-2 border-t-2 border-amber-500/30 group-hover:border-amber-400/50 transition-colors" />
              <div className="absolute top-2 right-2 h-8 w-8 border-r-2 border-t-2 border-amber-500/30 group-hover:border-amber-400/50 transition-colors" />
              <div className="absolute bottom-2 left-2 h-8 w-8 border-l-2 border-b-2 border-amber-500/30 group-hover:border-amber-400/50 transition-colors" />
              <div className="absolute bottom-2 right-2 h-8 w-8 border-r-2 border-b-2 border-amber-500/30 group-hover:border-amber-400/50 transition-colors" />

              {/* Decorative icon */}
              <feature.bgIcon className="absolute right-4 top-4 text-5xl text-amber-600/20 group-hover:text-amber-500/30 transition-all group-hover:scale-110 group-hover:rotate-12" />

              {/* Icon container */}
              <div
                className={`relative mb-5 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r ${feature.color} text-white shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-2xl`}
              >
                {feature.icon}
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-xl bg-white/20 blur-md group-hover:blur-xl transition-all" />
              </div>

              {/* Content */}
              <h3 className="relative mb-2 text-xl font-black text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-amber-200 group-hover:to-yellow-200 group-hover:bg-clip-text transition-all">
                {feature.title}
              </h3>
              <p className="relative mb-4 text-sm text-amber-200/80 leading-relaxed">{feature.desc}</p>

              {/* Stats bar */}
              <div className="relative flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400">{feature.stats}</span>
                <div className="h-1.5 flex-1 rounded-full bg-amber-700/30 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${feature.color} transition-all duration-500 group-hover:animate-pulse`}
                    style={{ width: "80%" }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Treasure Levels with pirate chests */}
        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
          {treasureLevels.map((level, index) => (
            <div
              key={index}
              className="group relative transform-gpu overflow-hidden rounded-2xl border border-amber-700/30 bg-gradient-to-br from-amber-900/40 to-amber-800/40 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-amber-500/50 hover:shadow-2xl"
            >
              {/* Chest emoji background */}
              <div className="absolute -right-6 -bottom-6 text-8xl opacity-10 group-hover:opacity-20 transition-opacity rotate-12">
                {level.chest}
              </div>

              {/* Icon */}
              <div className="relative mb-4 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-amber-500/30" />
                  <div
                    className={`relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r ${level.color} text-white text-3xl shadow-2xl border-2 border-white/30`}
                  >
                    {level.icon === FaStar && "⭐"}
                    {level.icon === FaGem && "💎"}
                    {level.icon === FaCrown && "👑"}
                  </div>
                </div>
              </div>

              {/* Title */}
              <h4 className="relative mb-2 text-center text-xl font-black text-white tracking-wider">
                {level.level}
              </h4>

              {/* Details */}
              <div className="relative mb-4 space-y-2 text-center">
                <p className="text-sm font-bold text-amber-300 flex items-center justify-center gap-2">
                  <GiChest className="text-lg" />
                  {level.reward}
                </p>
                <p className="text-xs text-amber-200/70 flex items-center justify-center gap-2">
                  <FaShip className="text-sm" />
                  {level.time}
                </p>
              </div>

              {/* Progress bar with treasure theme */}
              <div className="relative h-3 rounded-full bg-amber-900/50 border border-amber-700/30 overflow-hidden">
                <div
                  className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${level.color} transition-all duration-1000`}
                  style={{ width: `${level.progress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                </div>
              </div>

              {/* Progress text */}
              <p className="relative mt-2 text-center text-xs font-bold text-amber-400">
                {level.progress}% completed
              </p>
            </div>
          ))}
        </div>

        {/* Treasure Hunt Component Container - Vintage Chest Style */}
        <div className="relative">
          <GameFeedbackPanel gameKey="treasure-hunt" />
        </div>

        {/* Footer with animated treasure icons */}
        <div className="relative mt-12 flex justify-center items-center gap-6">
          {/* Decorative line */}
          <div className="h-px w-12 bg-gradient-to-r from-transparent via-amber-700/30 to-transparent" />

          <div className="flex gap-4 text-4xl text-amber-600/30">
            <MdEmojiEvents className="hover:text-amber-400/50 transition-colors animate-bounce" style={{ animationDelay: "0s" }} />
            <GiAchievement className="hover:text-amber-400/50 transition-colors animate-bounce" style={{ animationDelay: "0.2s" }} />
            <FaTrophy className="hover:text-amber-400/50 transition-colors animate-bounce" style={{ animationDelay: "0.4s" }} />
            <GiPodium className="hover:text-amber-400/50 transition-colors animate-bounce" style={{ animationDelay: "0.6s" }} />
            <FaCrown className="hover:text-amber-400/50 transition-colors animate-bounce" style={{ animationDelay: "0.8s" }} />
          </div>

          <div className="h-px w-12 bg-gradient-to-r from-amber-700/30 via-transparent to-transparent" />
        </div>
      </div>
    </div>
  );
}

export default TreasureHuntPage;



