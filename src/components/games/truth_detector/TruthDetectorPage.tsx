import {
  FaUsers,
  FaTrophy,
  FaCrown,
  FaStar,
  FaCheck,
  FaTimes,
  FaEye,
  FaQuestion,
} from "react-icons/fa";
import {
  GiAchievement,
  GiPodium,
  GiSpinningWheel,
  GiBrain,
} from "react-icons/gi";
import { PiDetective } from "react-icons/pi";
import GamePagePlayButton from "../shared/GamePagePlayButton";
import GameFeedbackPanel from "../shared/GameFeedbackPanel";

function TruthDetectorPage() {
  const gameStats = [
    {
      icon: <FaUsers className="text-2xl text-white" />,
      label: "O'YINCHILAR",
      value: "3-5 kishi",
      color: "from-indigo-500 to-purple-500",
    },
    {
      icon: <PiDetective className="text-2xl text-white" />,
      label: "GAPLAR",
      value: "3 ta / raund",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: <FaQuestion className="text-2xl text-white" />,
      label: "Qiyinlik",
      value: "3 daraja",
      color: "from-pink-500 to-rose-500",
    },
    {
      icon: <FaTrophy className="text-2xl text-white" />,
      label: "BALL",
      value: "1 ball / FAKE",
      color: "from-rose-500 to-indigo-500",
    },
  ];

  const features = [
    {
      icon: PiDetective,
      title: "Yolg'on gapni toping",
      desc: "Har raundda 3 ta gap bo'ladi: 2 tasi rost, 1 tasi yolg'on.",
      color: "from-indigo-500 to-purple-500",
      bgIcon: FaEye,
      stats: "3 gap / raund",
    },
    {
      icon: GiBrain,
      title: "3 qiyinlik darajasi",
      desc: "Easy (1-4), Medium (5-8), Hard (9+)",
      color: "from-purple-500 to-pink-500",
      bgIcon: FaStar,
      stats: "Easy, Medium, Hard",
    },
    {
      icon: FaCrown,
      title: "Yetakchilar",
      desc: "Eng ko'p FAKE topgan o'yinchi yetakchi",
      color: "from-pink-500 to-rose-500",
      bgIcon: GiAchievement,
      stats: "3-5 o'yinchi",
    },
  ];

  const difficultyLevels = [
    {
      level: "OSON",
      rounds: "1-4 raundlar",
      desc: "Oddiy faktlar",
      icon: FaStar,
      color: "from-green-400 to-green-500",
      progress: 33,
      emoji: "🌱",
    },
    {
      level: "O'RTA",
      rounds: "5-8 raundlar",
      desc: "Murakkabroq faktlar",
      icon: FaStar,
      color: "from-yellow-400 to-amber-500",
      progress: 66,
      emoji: "⭐",
    },
    {
      level: "QIYIN",
      rounds: "9+ raundlar",
      desc: "Chalg'ituvchi faktlar",
      icon: FaCrown,
      color: "from-red-400 to-rose-500",
      progress: 100,
      emoji: "👑",
    },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] animate-pulse-slow rounded-full bg-indigo-300/20 blur-3xl dark:bg-indigo-600/20" />
        <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] animate-pulse-slower rounded-full bg-purple-300/20 blur-3xl dark:bg-purple-600/20" />
        
        {/* Pattern */}
        <div
          className="absolute inset-0 opacity-20 dark:opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 20px 20px, #6366f1 2px, transparent 2px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Floating Icons */}
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
              {["🔍", "🕵️", "📋", "❓", "✅", "❌"][i % 6]}
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 mx-auto min-h-screen w-full max-w-[2000px] px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8 lg:px-8 xl:px-10">
        {/* Hero Section */}
        <div className="group relative mb-8 transform-gpu overflow-hidden rounded-3xl border-2 border-indigo-400/30 bg-gradient-to-br from-indigo-100/80 via-purple-100/80 to-pink-100/80 dark:from-indigo-900/80 dark:via-purple-900/80 dark:to-pink-900/80 p-6 shadow-2xl backdrop-blur-sm md:p-8 lg:p-10">
          {/* Animated Border */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-indigo-400/30 via-purple-400/30 to-pink-400/30 animate-gradient" />
          </div>

          {/* Corner Decorations */}
          <div className="absolute top-0 left-0 text-4xl opacity-30 animate-bounce">🔍</div>
          <div className="absolute top-0 right-0 text-4xl opacity-30 animate-bounce delay-100">🕵️</div>
          <div className="absolute bottom-0 left-0 text-4xl opacity-30 animate-bounce delay-200">📋</div>
          <div className="absolute bottom-0 right-0 text-4xl opacity-30 animate-bounce delay-300">❓</div>

          <div className="relative grid gap-8 lg:grid-cols-2 lg:gap-12 lg:items-center">
            {/* Left Content */}
            <div className="space-y-6">
              {/* Game Badge */}
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 blur-xl rounded-full animate-pulse" />
                <div className="relative flex items-center gap-3 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-800 dark:to-purple-800 px-5 py-2 border-2 border-indigo-400/50 shadow-xl">
                  <PiDetective className="text-indigo-600 dark:text-indigo-300 text-xl animate-pulse" />
                  <span className="text-sm font-black tracking-wider text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-300 dark:to-purple-300 bg-clip-text">
                    TRUTH DETECTOR
                  </span>
                </div>
              </div>

              {/* Title */}
              <div className="relative">
                <h1 className="text-5xl font-black leading-tight md:text-6xl lg:text-7xl">
                  <span className="relative inline-block">
                    <span className="absolute -inset-2 bg-gradient-to-r from-indigo-400/30 to-purple-400/30 blur-2xl" />
                    <span className="relative bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-300 dark:to-purple-300 bg-clip-text text-transparent">
                      FAKE'ni
                    </span>
                  </span>
                  <br />
                  <span className="relative inline-block mt-2">
                    <span className="absolute -inset-2 bg-gradient-to-r from-purple-400/30 to-pink-400/30 blur-2xl" />
                    <span className="relative bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-300 dark:to-pink-300 bg-clip-text text-transparent">
                      toping
                    </span>
                  </span>
                </h1>

                {/* Decorative Line */}
                <div className="relative mt-4 h-1 w-32 overflow-hidden rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                  <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                </div>
              </div>

              {/* Description */}
              <div className="relative max-w-xl rounded-xl bg-white/50 dark:bg-slate-800/50 p-4 border-2 border-indigo-400/30 backdrop-blur-sm">
                <p className="text-base text-gray-700 dark:text-gray-200 md:text-lg leading-relaxed">
                  3-5 o'yinchi. Har raundda 3 ta claim beriladi. 2 tasi TRUE, 1 tasi FAKE.
                  FAKE'ni topgan o'yinchi +1 ball oladi. Eng ko'p ball to'plagan g'olib!
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {gameStats.map((stat, index) => (
                  <div
                    key={index}
                    className="group/stat relative transform-gpu overflow-hidden rounded-xl border-2 border-indigo-400/30 bg-white/50 dark:bg-slate-800/50 p-4 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-2xl"
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
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 tracking-wider">
                        {stat.label}
                      </p>
                      <p className="text-sm font-black text-gray-800 dark:text-white mt-1">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            <GamePagePlayButton
                to="/games/truth-detector/play"
                colorClassName="from-indigo-500 to-purple-500"
                className="pt-2"
                modeSelectionEnabled
              />
            </div>

            {/* Right Content - Preview */}
            <div className="relative">
              {/* Decorative Elements */}
              <div className="absolute -top-8 -left-8 text-6xl rotate-12 animate-bounce">🔍</div>
              <div className="absolute -bottom-8 -right-8 text-6xl -rotate-12 animate-bounce delay-200">🕵️</div>

              {/* Preview Cards */}
              <div className="relative transform-gpu overflow-hidden rounded-2xl border-4 border-indigo-400/30 bg-gradient-to-br from-indigo-500 to-purple-500 p-4 shadow-2xl">
                <div className="space-y-3">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white font-bold">A</div>
                      <span className="text-white font-semibold">Quyosh sharqdan chiqadi.</span>
                      <FaCheck className="text-green-300 ml-auto" />
                    </div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white font-bold">B</div>
                      <span className="text-white font-semibold">Bir hafta 8 kundan iborat.</span>
                      <FaTimes className="text-red-300 ml-auto" />
                    </div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white font-bold">C</div>
                      <span className="text-white font-semibold">Suv qattiq, suyuq va gaz holatida bo'ladi.</span>
                      <FaCheck className="text-green-300 ml-auto" />
                    </div>
                  </div>
                </div>

                {/* Overlay Badge */}
                <div className="absolute bottom-0 left-0 right-0 z-20 p-4">
                  <div className="inline-flex items-center gap-3 rounded-2xl bg-black/50 backdrop-blur-md px-4 py-2 border-2 border-indigo-400/50 shadow-xl">
                    <PiDetective className="text-indigo-300 text-lg animate-pulse" />
                    <span className="text-sm font-black text-white tracking-wider">
                      3 GAP · 2 ROST · 1 YOLG'ON
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
              className="group relative transform-gpu overflow-hidden rounded-2xl border-2 border-indigo-400/30 bg-white/50 dark:bg-slate-800/50 p-6 backdrop-blur-sm transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl hover:border-indigo-400/50"
            >
              {/* Animated Background */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-700"
                style={{
                  backgroundImage: `radial-gradient(circle at ${30 + index * 20}% ${40 + index * 10}%, #6366f1 0%, transparent 50%)`,
                }}
              />

              {/* Corner Decorations */}
              <div className="absolute top-2 left-2 h-6 w-6 border-l-2 border-t-2 border-indigo-400/50 group-hover:border-indigo-300 transition-colors" />
              <div className="absolute top-2 right-2 h-6 w-6 border-r-2 border-t-2 border-purple-400/50 group-hover:border-purple-300 transition-colors" />
              <div className="absolute bottom-2 left-2 h-6 w-6 border-l-2 border-b-2 border-pink-400/50 group-hover:border-pink-300 transition-colors" />
              <div className="absolute bottom-2 right-2 h-6 w-6 border-r-2 border-b-2 border-indigo-400/50 group-hover:border-indigo-300 transition-colors" />

              {/* Decorative Icon */}
              <feature.bgIcon className="absolute right-4 top-4 text-5xl text-indigo-500/20 group-hover:text-indigo-500/30 transition-all group-hover:scale-110 group-hover:rotate-12" />

              {/* Icon */}
              <div
                className={`relative mb-5 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r ${feature.color} text-white shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-2xl`}
              >
                <feature.icon className="text-2xl" />
              </div>

              {/* Content */}
              <h3 className="relative mb-2 text-xl font-black text-gray-800 dark:text-white">{feature.title}</h3>
              <p className="relative mb-4 text-sm text-gray-600 dark:text-gray-300">{feature.desc}</p>

              {/* Stats Bar */}
              <div className="relative flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{feature.stats}</span>
                <div className="h-1.5 flex-1 rounded-full bg-indigo-200 dark:bg-indigo-900/50 overflow-hidden">
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
        <div className="mb-8">
          <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-6 flex items-center gap-3">
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              QIYINLIK DARAJALARI
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-indigo-400/30 to-transparent" />
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {difficultyLevels.map((level, index) => (
              <div
                key={index}
                className="group relative transform-gpu overflow-hidden rounded-xl border-2 border-indigo-400/30 bg-white/50 dark:bg-slate-800/50 p-5 backdrop-blur-sm transition-all hover:scale-105 hover:shadow-xl text-center"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${level.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                <div className="relative">
                  <div className="text-4xl mb-2">{level.emoji}</div>
                  <h3 className="text-lg font-black text-gray-800 dark:text-white mb-2">{level.level}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">{level.rounds}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{level.desc}</p>
                  <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${level.color} transition-all duration-1000`}
                      style={{ width: `${level.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Game Component Container */}
        <div className="relative">
          <GameFeedbackPanel gameKey="truth-detector" />
        </div>

        {/* Footer */}
        <div className="relative mt-12 flex justify-center items-center gap-6">
          <div className="h-px w-12 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

          <div className="flex gap-4 text-4xl text-indigo-600/30">
            <GiAchievement
              className="hover:text-indigo-500/50 transition-colors animate-bounce"
              style={{ animationDelay: "0s" }}
            />
            <GiPodium
              className="hover:text-indigo-500/50 transition-colors animate-bounce"
              style={{ animationDelay: "0.2s" }}
            />
            <FaTrophy
              className="hover:text-indigo-500/50 transition-colors animate-bounce"
              style={{ animationDelay: "0.4s" }}
            />
            <GiSpinningWheel
              className="hover:text-indigo-500/50 transition-colors animate-bounce"
              style={{ animationDelay: "0.6s" }}
            />
            <FaCrown
              className="hover:text-indigo-500/50 transition-colors animate-bounce"
              style={{ animationDelay: "0.8s" }}
            />
          </div>

          <div className="h-px w-12 bg-gradient-to-r from-indigo-500/30 via-transparent to-transparent" />
        </div>
      </div>
    </div>
  );
}

export default TruthDetectorPage;



