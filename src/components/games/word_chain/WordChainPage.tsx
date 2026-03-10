import {
  FaUsers,
  FaTrophy,
  FaClock,
  FaStar,
  FaCrown,
  FaBook,
  FaPencilAlt,
} from "react-icons/fa";
import {
  GiAchievement,
  GiPodium,
  GiSpinningWheel,
  GiConversation,
  GiLetterBomb,
  GiBrain,
} from "react-icons/gi";
import GameFeedbackPanel from "../shared/GameFeedbackPanel";
import GamePagePlayButton from "../shared/GamePagePlayButton";

function WordChainPage() {
    const rightImg = "https://media.istockphoto.com/id/1503421139/photo/multi-colored-alphabet-letters-and-magnifying-glass-on-the-yellow-background.jpg?s=612x612&w=0&k=20&c=losfLdOo6_oPE5GQmJGdfzC1haNnVSIGiAeOs7VCGDo=";
  const gameStats = [
    {
      icon: <FaUsers className="text-2xl text-white" />,
      label: "O'QUVCHILAR",
      value: "2-6 kishi",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: <FaClock className="text-2xl text-white" />,
      label: "VAQT",
      value: "30 soniya",
      color: "from-pink-500 to-rose-500",
    },
    {
      icon: <FaBook className="text-2xl text-white" />,
      label: "SO'ZLAR",
      value: "100+",
      color: "from-rose-500 to-purple-500",
    },
    {
      icon: <FaTrophy className="text-2xl text-white" />,
      label: "G'OLIB",
      value: "Eng ko'p so'z",
      color: "from-purple-500 to-rose-500",
    },
  ];

  const features = [
    {
      icon: GiConversation,
      title: "So'zlar zanjiri",
      desc: "Har bir so'z oldingi so'zning oxirgi harfi bilan boshlanadi",
      color: "from-purple-500 to-pink-500",
      bgIcon: FaPencilAlt,
      stats: "2-6 o'quvchi",
    },
    {
      icon: FaClock,
      title: "Vaqt chegarasi",
      desc: "Har bir o'quvchiga 30 soniya vaqt beriladi",
      color: "from-pink-500 to-rose-500",
      bgIcon: FaClock,
      stats: "30s",
    },
    {
      icon: GiLetterBomb,
      title: "Lug'at boyligi",
      desc: "O'zbek tilidagi 100+ so'z bilan o'ynang",
      color: "from-rose-500 to-purple-500",
      bgIcon: FaBook,
      stats: "100+ so'z",
    },
  ];

  const gameLevels = [
    {
      level: "BOSHLANG'ICH",
      players: "2-3 o'quvchi",
      time: "30 soniya",
      icon: FaStar,
      color: "from-green-500 to-emerald-500",
      progress: 33,
      emoji: "🌱",
    },
    {
      level: "O'RTA",
      players: "4-5 o'quvchi",
      time: "25 soniya",
      icon: FaStar,
      color: "from-yellow-500 to-amber-500",
      progress: 66,
      emoji: "⭐",
    },
    {
      level: "PROFESSIONAL",
      players: "6 o'quvchi",
      time: "20 soniya",
      icon: FaCrown,
      color: "from-red-500 to-rose-500",
      progress: 100,
      emoji: "👑",
    },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-purple-950 dark:via-pink-950 dark:to-rose-950">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] animate-pulse-slow rounded-full bg-purple-300/20 blur-3xl dark:bg-purple-600/20" />
        <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] animate-pulse-slower rounded-full bg-pink-300/20 blur-3xl dark:bg-pink-600/20" />
        
        {/* Floating Letters */}
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
              {String.fromCharCode(65 + Math.floor(Math.random() * 26))}
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 mx-auto min-h-screen w-full max-w-[2000px] px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8 lg:px-8 xl:px-10">
        {/* Hero Section */}
        <div className="group relative mb-8 transform-gpu overflow-hidden rounded-3xl border-2 border-purple-400/30 bg-gradient-to-br from-purple-100/80 via-pink-100/80 to-rose-100/80 dark:from-purple-900/80 dark:via-pink-900/80 dark:to-rose-900/80 p-6 shadow-2xl backdrop-blur-sm md:p-8 lg:p-10">
          <div className="relative grid gap-8 lg:grid-cols-2 lg:gap-12 lg:items-center">
            {/* Left Content */}
            <div className="space-y-6">
              {/* Game Badge */}
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 blur-xl rounded-full animate-pulse" />
                <div className="relative flex items-center gap-3 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-800 dark:to-pink-800 px-5 py-2 border-2 border-purple-400/50 shadow-xl">
                  <GiLetterBomb className="text-purple-500 dark:text-purple-300 text-xl animate-bounce" />
                  <span className="text-sm font-black tracking-wider text-transparent bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-300 dark:to-pink-300 bg-clip-text">
                    SO'ZLAR ZANJIRI
                  </span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-5xl font-black leading-tight md:text-6xl lg:text-7xl">
                <span className="relative inline-block">
                  <span className="absolute -inset-2 bg-gradient-to-r from-purple-400/30 to-pink-400/30 blur-2xl" />
                  <span className="relative bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-300 dark:to-pink-300 bg-clip-text text-transparent">
                    So'zlar
                  </span>
                </span>
                <br />
                <span className="relative inline-block mt-2">
                  <span className="absolute -inset-2 bg-gradient-to-r from-pink-400/30 to-rose-400/30 blur-2xl" />
                  <span className="relative bg-gradient-to-r from-pink-600 to-rose-600 dark:from-pink-300 dark:to-rose-300 bg-clip-text text-transparent">
                    zanjiri
                  </span>
                </span>
              </h1>

              {/* Description */}
              <div className="relative max-w-xl rounded-xl bg-white/50 dark:bg-slate-800/50 p-4 border-2 border-purple-400/30 backdrop-blur-sm">
                <p className="text-base text-gray-700 dark:text-gray-200 md:text-lg leading-relaxed">
                  Har bir so'z oldingi so'zning oxirgi harfi bilan boshlanadi. 
                  Kim eng ko'p so'z topsa, o'sha g'olib!
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {gameStats.map((stat, index) => (
                  <div
                    key={index}
                    className="group/stat relative transform-gpu overflow-hidden rounded-xl border-2 border-purple-400/30 bg-white/50 dark:bg-slate-800/50 p-4 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-2xl"
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
                to="/games/word-chain/play"
                colorClassName="from-violet-500 to-fuchsia-500"
                className="pt-2"
              />
            </div>

            {/* Right Content */}
            <div className="relative">
                          {/* Decorative Elements */}
                          <div className="absolute -top-8 -left-8 text-6xl rotate-12 animate-bounce">🔖</div>
                          <div className="absolute -bottom-8 -right-8 text-6xl -rotate-12 animate-bounce delay-200">📚</div>
            
                          {/* Main Image */}
                          <div className="relative transform-gpu overflow-hidden rounded-2xl border-4 border-purple-400/30 bg-gradient-to-br from-purple-500 to-pink-500 shadow-2xl transition-all duration-500 hover:scale-[1.02] group-hover:border-yellow-400/50">
                            <div className="absolute inset-0 bg-gradient-to-t from-yellow-100/50 via-transparent to-transparent dark:from-yellow-900/50 z-10" />
            
                            <img
                              src={rightImg}
                              alt="So'zlar Zanjiri O'yini"
                              className="h-[300px] w-full object-cover md:h-[400px] lg:h-[450px] transition-transform duration-700 group-hover:scale-110"
                            />
            
                            {/* Overlay Badge */}
                            <div className="absolute bottom-0 left-0 right-0 z-20 p-6">
                              <div className="inline-flex items-center gap-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md px-4 py-2 border-2 border-yellow-400/50 shadow-xl">
                                <GiBrain className="text-yellow-500 text-lg" />
                                <span className="text-sm font-black text-gray-800 dark:text-white tracking-wider">
                                    So'zlar Zanjiri!
                                </span>
                                <div className="flex gap-1.5">
                                  <span className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
                                  <span className="h-2 w-2 rounded-full bg-orange-400 animate-pulse delay-150" />
                                  <span className="h-2 w-2 rounded-full bg-pink-400 animate-pulse delay-300" />
                                </div>
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
              className="group relative transform-gpu overflow-hidden rounded-2xl border-2 border-purple-400/30 bg-white/50 dark:bg-slate-800/50 p-6 backdrop-blur-sm transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl hover:border-purple-400/50"
            >
              <feature.bgIcon className="absolute right-4 top-4 text-5xl text-purple-500/20 group-hover:text-purple-500/30 transition-all group-hover:scale-110 group-hover:rotate-12" />

              <div
                className={`relative mb-5 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r ${feature.color} text-white shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}
              >
                <feature.icon className="text-2xl" />
              </div>

              <h3 className="relative mb-2 text-xl font-black text-gray-800 dark:text-white">
                {feature.title}
              </h3>
              <p className="relative mb-4 text-sm text-gray-600 dark:text-gray-300">
                {feature.desc}
              </p>

              <div className="relative flex items-center gap-2">
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400">{feature.stats}</span>
                <div className="h-1.5 flex-1 rounded-full bg-purple-200 dark:bg-purple-900/50 overflow-hidden">
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
        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
          {gameLevels.map((level, index) => (
            <div
              key={index}
              className="group relative transform-gpu overflow-hidden rounded-2xl border-2 border-purple-400/30 bg-white/50 dark:bg-slate-800/50 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-purple-400/50 hover:shadow-2xl"
            >
              <div className="absolute -right-4 -bottom-4 text-6xl opacity-10 group-hover:opacity-20">
                {level.emoji}
              </div>

              <div className="relative mb-4 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-purple-400/30" />
                  <div
                    className={`relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r ${level.color} text-white text-2xl shadow-2xl border-2 border-white/30`}
                  >
                    <level.icon />
                  </div>
                </div>
              </div>

              <h4 className="relative mb-2 text-center text-lg font-black text-gray-800 dark:text-white">
                {level.level}
              </h4>

              <div className="relative mb-4 space-y-1 text-center text-sm">
                <p className="text-gray-600 dark:text-gray-300">{level.players}</p>
                <p className="text-gray-500 dark:text-gray-400">{level.time}</p>
              </div>

              <div className="relative h-2 rounded-full bg-purple-200 dark:bg-purple-900/50 overflow-hidden">
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
          <GameFeedbackPanel gameKey="word-chain" />
        </div>

        {/* Footer */}
        <div className="relative mt-12 flex justify-center items-center gap-6">
          <div className="h-px w-12 bg-gradient-to-r from-transparent via-purple-400/30 to-transparent" />

          <div className="flex gap-4 text-4xl text-purple-500/30">
            <GiAchievement className="hover:text-purple-500/50 transition-colors animate-bounce" />
            <GiPodium className="hover:text-purple-500/50 transition-colors animate-bounce delay-100" />
            <FaTrophy className="hover:text-purple-500/50 transition-colors animate-bounce delay-200" />
            <GiSpinningWheel className="hover:text-purple-500/50 transition-colors animate-bounce delay-300" />
            <FaStar className="hover:text-purple-500/50 transition-colors animate-bounce delay-400" />
          </div>

          <div className="h-px w-12 bg-gradient-to-r from-purple-400/30 via-transparent to-transparent" />
        </div>
      </div>
    </div>
  );
}

export default WordChainPage;



