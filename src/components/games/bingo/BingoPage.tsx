import {
  FaUsers,
  FaTrophy,
  FaStar,
  FaQuestion,
  FaBolt,
  FaMagic,
  FaDice,
} from "react-icons/fa";
import {
  GiAchievement,
  GiPodium,
  GiSpinningWheel,
  GiBrain,
  GiJigsawPiece
} from "react-icons/gi";
import {MdQuiz } from "react-icons/md";
import GamePagePlayButton from "../shared/GamePagePlayButton";
import GameFeedbackPanel from "../shared/GameFeedbackPanel";

function BingoPage() {
  // const bingoImg = "https://media.istockphoto.com/id/495611580/vector/bingo-or-lottery-retro-game-illustration-with-balls-and-cards.jpg?s=612x612&w=0&k=20&c=lyncdZNnRRPcClMJuAGV10F-a-6iTutSKilAuxaHKu4=";

  const gameStats = [
    {
      icon: <FaUsers className="text-2xl text-white" />,
      label: "O'YINCHILAR",
      value: "2-30 kishi",
      color: "from-indigo-500 to-purple-500",
    },
    {
      icon: <MdQuiz className="text-2xl text-white" />,
      label: "KATAKLAR",
      value: "16 ta",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: <GiBrain className="text-2xl text-white" />,
      label: "TURLAR",
      value: "Quiz, TF, Task",
      color: "from-pink-500 to-rose-500",
    },
    {
      icon: <FaBolt className="text-2xl text-white" />,
      label: "BONUSLAR",
      value: "x2, Joker, Swap",
      color: "from-rose-500 to-indigo-500",
    },
  ];

  const features = [
    {
      icon: GiBrain,
      title: "3 xil katak turi",
      desc: "Quiz (3 variant), True/False, Task (amaliy topshiriq)",
      color: "from-indigo-500 to-purple-500",
      bgIcon: FaQuestion,
      stats: "16 katak",
    },
    {
      icon: FaBolt,
      title: "Maxsus bonuslar",
      desc: "x2 ball, Joker (yarim ball), Swap (katak almashish)",
      color: "from-purple-500 to-pink-500",
      bgIcon: FaMagic,
      stats: "4 bonus katak",
    },
    {
      icon: FaDice,
      title: "Qiyinlik darajasi",
      desc: "Oson (10), O'rtacha (20), Qiyin (30) ball",
      color: "from-pink-500 to-rose-500",
      bgIcon: FaStar,
      stats: "3 daraja",
    },
  ];

  const cellTypes = [
    { type: "Quiz", icon: "❓", desc: "3 variantli test", color: "from-blue-500 to-cyan-500" },
    { type: "True/False", icon: "✓✗", desc: "To'g'ri yoki noto'g'ri", color: "from-green-500 to-emerald-500" },
    { type: "Task", icon: "🎯", desc: "Amaliy topshiriq", color: "from-orange-500 to-red-500" },
  ];

  const bonusTypes = [
    { name: "x2", icon: "⚡", desc: "Ikki barobar ball", color: "from-blue-500 to-cyan-500" },
    { name: "Joker", icon: "🃏", desc: "Yarim ball bilan yopish", color: "from-purple-500 to-pink-500" },
    { name: "Swap", icon: "🔄", desc: "2 katak o'rnini almashtirish", color: "from-emerald-500 to-green-500" },
  ];

  const difficultyLevels = [
    {
      level: "OSON",
      points: "10 ball",
      color: "from-green-500 to-emerald-500",
      progress: 33,
      emoji: "🌱",
    },
    {
      level: "O'RTACHA",
      points: "20 ball",
      color: "from-yellow-500 to-amber-500",
      progress: 66,
      emoji: "⭐",
    },
    {
      level: "QIYIN",
      points: "30 ball",
      color: "from-red-500 to-rose-500",
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
        <div className="absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-pink-300/10 blur-3xl dark:bg-pink-600/10" />

        {/* Floating Quiz Icons */}
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
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
              {["❓", "✓", "✗", "🎯", "⚡", "🃏", "🔄", "🧠"][i % 8]}
            </div>
          ))}
        </div>

        {/* Quiz Pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%236366f1' fill-opacity='0.2'%3E%3Ccircle cx='30' cy='30' r='5'/%3E%3Ccircle cx='15' cy='15' r='3'/%3E%3Ccircle cx='45' cy='45' r='4'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto min-h-screen w-full max-w-[2000px] px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8 lg:px-8 xl:px-10">
        {/* Hero Section */}
        <div className="group relative mb-8 transform-gpu overflow-hidden rounded-3xl border-2 border-indigo-400/30 bg-gradient-to-br from-indigo-100/80 via-purple-100/80 to-pink-100/80 dark:from-indigo-900/80 dark:via-purple-900/80 dark:to-pink-900/80 p-6 shadow-2xl backdrop-blur-sm md:p-8 lg:p-10">
          {/* Animated Border */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-indigo-400/30 via-purple-400/30 to-pink-400/30" />
          </div>

          {/* Corner Decorations */}
          <div className="absolute top-0 left-0 text-4xl opacity-30 animate-bounce">❓</div>
          <div className="absolute top-0 right-0 text-4xl opacity-30 animate-bounce delay-100">✓</div>
          <div className="absolute bottom-0 left-0 text-4xl opacity-30 animate-bounce delay-200">✗</div>
          <div className="absolute bottom-0 right-0 text-4xl opacity-30 animate-bounce delay-300">🎯</div>

          <div className="relative grid gap-8 lg:grid-cols-2 lg:gap-12 lg:items-center">
            {/* Left Content */}
            <div className="space-y-6">
              {/* Game Badge */}
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 blur-xl rounded-full animate-pulse" />
                <div className="relative flex items-center gap-3 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-800 dark:to-purple-800 px-5 py-2 border-2 border-indigo-400/50 shadow-xl">
                  <GiJigsawPiece className="text-indigo-500 dark:text-indigo-300 text-xl animate-spin-slow" />
                  <span className="text-sm font-black tracking-wider text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-300 dark:to-purple-300 bg-clip-text">
                    O'QITUVCHI QUIZ BINGO
                  </span>
                </div>
              </div>

              {/* Title */}
              <div className="relative">
                <h1 className="text-5xl font-black leading-tight md:text-6xl lg:text-7xl">
                  <span className="relative inline-block">
                    <span className="absolute -inset-2 bg-gradient-to-r from-indigo-400/30 to-purple-400/30 blur-2xl" />
                    <span className="relative bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-300 dark:to-purple-300 bg-clip-text text-transparent">
                      Quiz
                    </span>
                  </span>
                  <br />
                  <span className="relative inline-block mt-2">
                    <span className="absolute -inset-2 bg-gradient-to-r from-purple-400/30 to-pink-400/30 blur-2xl" />
                    <span className="relative bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-300 dark:to-pink-300 bg-clip-text text-transparent">
                      Challenge Bingo
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
                  O'qituvchi 16 ta katakni tayyorlaydi: quiz, true/false va task topshiriqlari. 
                  O'quvchilar navbat bilan kataklarni ochib, savollarga javob beradi va ball to'playdi.
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
                to="/games/bingo/play"
                colorClassName="from-indigo-500 to-fuchsia-500"
                className="pt-2"
              />
            </div>

            {/* Right Content - Bingo Preview */}
            <div className="relative">
              {/* Decorative Elements */}
              <div className="absolute -top-8 -left-8 text-6xl rotate-12 animate-bounce">🎲</div>
              <div className="absolute -bottom-8 -right-8 text-6xl -rotate-12 animate-bounce delay-200">🏆</div>

              {/* Bingo Card Preview */}
              <div className="relative transform-gpu overflow-hidden rounded-2xl border-4 border-indigo-400/30 bg-gradient-to-br from-indigo-500 to-purple-500 p-6 shadow-2xl">
                <div className="grid grid-cols-4 gap-2">
                  <div className="aspect-square rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-2xl">❓</div>
                  <div className="aspect-square rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-2xl">✓</div>
                  <div className="aspect-square rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-2xl">🎯</div>
                  <div className="aspect-square rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-2xl">⚡</div>
                  <div className="aspect-square rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-2xl">✗</div>
                  <div className="aspect-square rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-2xl">❓</div>
                  <div className="aspect-square rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-2xl">🃏</div>
                  <div className="aspect-square rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-2xl">🎯</div>
                  <div className="aspect-square rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-2xl">✓</div>
                  <div className="aspect-square rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-2xl">❓</div>
                  <div className="aspect-square rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-2xl">✗</div>
                  <div className="aspect-square rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-2xl">🔄</div>
                  <div className="aspect-square rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-2xl">⚡</div>
                  <div className="aspect-square rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-2xl">❓</div>
                  <div className="aspect-square rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-2xl">🎯</div>
                  <div className="aspect-square rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-2xl">✓</div>
                </div>

                {/* Overlay Badge */}
                <div className="absolute bottom-0 left-0 right-0 z-20 p-4">
                  <div className="inline-flex items-center gap-3 rounded-2xl bg-black/50 backdrop-blur-md px-4 py-2 border-2 border-indigo-400/50 shadow-xl">
                    <GiJigsawPiece className="text-indigo-300 text-lg animate-pulse" />
                    <span className="text-sm font-black text-white tracking-wider">
                      16 KATAK · 3 TUR · 3 DARAJA
                    </span>
                  </div>
                </div>

                {/* Floating Badges */}
                <div className="absolute top-4 right-4 z-20 flex gap-2">
                  <div className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-3 py-1.5 text-xs font-bold text-white shadow-xl border border-indigo-400">
                    <span className="flex items-center gap-1">
                      <FaBolt /> x2, 🃏, 🔄
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
                  backgroundImage: `radial-gradient(circle at ${30 + index * 20}% ${40 + index * 10}%, #818cf8 0%, transparent 50%)`,
                }}
              />

              {/* Corner Decorations */}
              <div className="absolute top-2 left-2 h-6 w-6 border-l-2 border-t-2 border-indigo-400/50 group-hover:border-indigo-300 transition-colors" />
              <div className="absolute top-2 right-2 h-6 w-6 border-r-2 border-t-2 border-indigo-400/50 group-hover:border-indigo-300 transition-colors" />
              <div className="absolute bottom-2 left-2 h-6 w-6 border-l-2 border-b-2 border-indigo-400/50 group-hover:border-indigo-300 transition-colors" />
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

        {/* Cell Types */}
        <div className="mb-8">
          <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-6 flex items-center gap-3">
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              KATAK TURLARI
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-indigo-400/30 to-transparent" />
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {cellTypes.map((cell, index) => (
              <div
                key={index}
                className="group relative transform-gpu overflow-hidden rounded-xl border-2 border-indigo-400/30 bg-white/50 dark:bg-slate-800/50 p-5 backdrop-blur-sm transition-all hover:scale-105 hover:shadow-xl text-center"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${cell.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                <div className="relative">
                  <div className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-r ${cell.color} text-white text-2xl`}>
                    {cell.icon}
                  </div>
                  <h3 className="text-lg font-black text-gray-800 dark:text-white mb-1">{cell.type}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{cell.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bonus Types */}
        <div className="mb-8">
          <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-6 flex items-center gap-3">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              MAXSUS BONUSLAR
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-purple-400/30 to-transparent" />
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bonusTypes.map((bonus, index) => (
              <div
                key={index}
                className="group relative transform-gpu overflow-hidden rounded-xl border-2 border-indigo-400/30 bg-white/50 dark:bg-slate-800/50 p-5 backdrop-blur-sm transition-all hover:scale-105 hover:shadow-xl text-center"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${bonus.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                <div className="relative">
                  <div className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-r ${bonus.color} text-white text-2xl`}>
                    {bonus.icon}
                  </div>
                  <h3 className="text-lg font-black text-gray-800 dark:text-white mb-1">{bonus.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{bonus.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Difficulty Levels */}
        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
          {difficultyLevels.map((level, index) => (
            <div
              key={index}
              className="group relative transform-gpu overflow-hidden rounded-2xl border-2 border-indigo-400/30 bg-white/50 dark:bg-slate-800/50 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-indigo-400/50 hover:shadow-2xl"
            >
              {/* Level Emoji Background */}
              <div className="absolute -right-4 -bottom-4 text-6xl opacity-10 group-hover:opacity-20 transition-opacity">
                {level.emoji}
              </div>

              {/* Icon */}
              <div className="relative mb-4 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-indigo-400/30" />
                  <div
                    className={`relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r ${level.color} text-white text-2xl shadow-2xl border-2 border-white/30`}
                  >
                    <FaStar />
                  </div>
                </div>
              </div>

              {/* Title */}
              <h4 className="relative mb-2 text-center text-lg font-black text-gray-800 dark:text-white">
                {level.level}
              </h4>

              {/* Points */}
              <div className="relative mb-4 text-center">
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{level.points}</p>
              </div>

              {/* Progress Bar */}
              <div className="relative h-2 rounded-full bg-indigo-200 dark:bg-indigo-900/50 overflow-hidden">
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

        {/* Game Component Container */}
        <div className="relative">
          <GameFeedbackPanel gameKey="bingo" />
        </div>

        {/* Footer */}
        <div className="relative mt-12 flex justify-center items-center gap-6">
          <div className="h-px w-12 bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent" />

          <div className="flex gap-4 text-4xl text-indigo-500/30">
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
            <FaStar
              className="hover:text-indigo-500/50 transition-colors animate-bounce"
              style={{ animationDelay: "0.8s" }}
            />
          </div>

          <div className="h-px w-12 bg-gradient-to-r from-indigo-400/30 via-transparent to-transparent" />
        </div>
      </div>
    </div>
  );
}

export default BingoPage;



