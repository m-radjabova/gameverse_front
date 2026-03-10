import {
  FaUsers,
  FaTrophy,
  FaStar,
  FaCrown,
  FaImage,
  FaPuzzlePiece,
} from "react-icons/fa";
import {
  GiAchievement,
  GiPodium,
  GiSpinningWheel,
  GiJigsawPiece,
  GiJigsawBox,
} from "react-icons/gi";
import { MdTimer } from "react-icons/md";
import { RiTeamFill } from "react-icons/ri";
import GameFeedbackPanel from "../shared/GameFeedbackPanel";
import GamePagePlayButton from "../shared/GamePagePlayButton";

function MiniPuzzlePage() {
    // const img = "https://media.istockphoto.com/id/2249204910/photo/jigsaw-puzzle-pieces-colorful-background-with-small-puzzle-pieces-messy-some-colored-pieces.jpg?s=612x612&w=0&k=20&c=r43dtrUR7kvYbZHLZa6OVcbETVnFLOVhayJWwMwLUUc=";
  const gameStats = [
    {
      icon: <FaUsers className="text-2xl text-white" />,
      label: "JAMOALAR",
      value: "2 ta",
      color: "from-pink-500 to-rose-500",
    },
    {
      icon: <MdTimer className="text-2xl text-white" />,
      label: "DAVOMIYLIK",
      value: "5-10 daqiqa",
      color: "from-rose-500 to-pink-500",
    },
    {
      icon: <GiJigsawBox className="text-2xl text-white" />,
      label: "BO'LAKLAR",
      value: "4-9 ta",
      color: "from-pink-500 to-rose-500",
    },
    {
      icon: <FaTrophy className="text-2xl text-white" />,
      label: "MAKSIMUM",
      value: "500+ ball",
      color: "from-rose-500 to-pink-500",
    },
  ];

  const features = [
    {
      icon: GiJigsawPiece,
      title: "Rasmni yig'",
      desc: "4, 6 yoki 9 bo'lakli puzzle",
      color: "from-pink-500 to-rose-500",
      bgIcon: FaImage,
      stats: "3 xil qiyinlik",
    },
    {
      icon: FaUsers,
      title: "2 jamoa",
      desc: "Chap va o'ng jamoa musobaqalashadi",
      color: "from-rose-500 to-pink-500",
      bgIcon: RiTeamFill,
      stats: "2 jamoa",
    },
    {
      icon: FaCrown,
      title: "Ball tizimi",
      desc: "Tez yig'sangiz, ko'proq ball",
      color: "from-pink-500 to-rose-500",
      bgIcon: GiAchievement,
      stats: "50+ ball",
    },
  ];

  const difficultyLevels = [
    {
      level: "OSON",
      pieces: "4 bo'lak",
      time: "60 soniya",
      icon: FaStar,
      color: "from-green-400 to-emerald-400",
      progress: 33,
      emoji: "🌸",
    },
    {
      level: "O'RTACHA",
      pieces: "6 bo'lak",
      time: "60 soniya",
      icon: FaStar,
      color: "from-yellow-400 to-amber-400",
      progress: 66,
      emoji: "✨",
    },
    {
      level: "QIYIN",
      pieces: "9 bo'lak",
      time: "60 soniya",
      icon: FaCrown,
      color: "from-red-400 to-rose-400",
      progress: 100,
      emoji: "💮",
    },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-pink-50 via-rose-50 to-pink-50 dark:from-pink-950 dark:via-rose-950 dark:to-pink-950">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] animate-pulse-slow rounded-full bg-pink-300/20 blur-3xl dark:bg-pink-600/20" />
        <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] animate-pulse-slower rounded-full bg-rose-300/20 blur-3xl dark:bg-rose-600/20" />
        
        {/* Soft Pattern */}
        <div
          className="absolute inset-0 opacity-20 dark:opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 20px 20px, #f9a8d4 2px, transparent 2px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Floating Hearts */}
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
              {["🌸", "✨", "💮", "🌸", "✨", "💮"][i % 6]}
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 mx-auto min-h-screen w-full max-w-[2000px] px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8 lg:px-8 xl:px-10">
        {/* Hero Section */}
        <div className="group relative mb-8 transform-gpu overflow-hidden rounded-3xl border border-pink-500/20 bg-gradient-to-br from-pink-900/40 via-rose-900/40 to-pink-900/40 p-6 backdrop-blur-xl shadow-2xl md:p-8 lg:p-10">
          {/* Animated Gradient Border */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-pink-500/30 via-rose-500/30 to-pink-500/30 animate-gradient" />
          </div>

          {/* Corner Decorations */}
          <div className="absolute top-0 left-0 h-20 w-20 border-l-4 border-t-4 border-pink-500/30 rounded-tl-3xl" />
          <div className="absolute top-0 right-0 h-20 w-20 border-r-4 border-t-4 border-pink-500/30 rounded-tr-3xl" />
          <div className="absolute bottom-0 left-0 h-20 w-20 border-l-4 border-b-4 border-pink-500/30 rounded-bl-3xl" />
          <div className="absolute bottom-0 right-0 h-20 w-20 border-r-4 border-b-4 border-pink-500/30 rounded-br-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-2 lg:gap-12 lg:items-center">
            {/* Left Content */}
            <div className="space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-pink-500/20 to-rose-500/20 px-4 py-2 border border-pink-500/30">
                <GiJigsawPiece className="text-pink-400 animate-pulse" />
                <span className="text-sm font-black text-transparent bg-gradient-to-r from-pink-400 via-rose-400 to-pink-400 bg-clip-text">
                  RASMNI YIG'
                </span>
                <div className="ml-2 flex h-2 w-2">
                  <span className="absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-5xl font-black leading-tight md:text-6xl lg:text-7xl">
                <span className="relative inline-block">
                  <span className="absolute -inset-2 bg-gradient-to-r from-pink-500/30 to-rose-500/30 blur-2xl" />
                  <span className="relative bg-gradient-to-r from-pink-300 via-rose-300 to-pink-300 bg-clip-text text-transparent">
                    Mini
                  </span>
                </span>
                <br />
                <span className="relative inline-block mt-2">
                  <span className="absolute -inset-2 bg-gradient-to-r from-rose-500/30 to-pink-500/30 blur-2xl" />
                  <span className="relative bg-gradient-to-r from-rose-300 via-pink-300 to-rose-300 bg-clip-text text-transparent">
                    Puzzle
                  </span>
                </span>
              </h1>

              {/* Description */}
              <div className="relative max-w-xl rounded-xl bg-pink-950/30 p-4 border border-pink-500/30 backdrop-blur-sm">
                <p className="text-base text-pink-200/80 md:text-lg leading-relaxed">
                  2 jamoa musobaqalashadi. Rasm bo'laklarini yig'ing va birinchi bo'lib 
                  to'liq rasmni hosil qiling!
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {gameStats.map((stat, index) => (
                  <div
                    key={index}
                    className="group/stat relative transform-gpu overflow-hidden rounded-xl border border-pink-500/20 bg-pink-950/30 p-4 backdrop-blur-sm transition-all hover:scale-105 hover:bg-pink-900/40"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover/stat:opacity-20 transition-opacity`} />
                    <div className="relative">
                      <div className={`mb-2 inline-flex rounded-lg bg-gradient-to-r ${stat.color} p-2.5 shadow-lg`}>
                        {stat.icon}
                      </div>
                      <p className="text-xs font-bold text-pink-300/70">{stat.label}</p>
                      <p className="text-sm font-black text-white mt-1">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            <GamePagePlayButton
                to="/games/mini-puzzle/play"
                colorClassName="from-pink-500 to-rose-500"
                className="pt-2"
              />
            </div>

            {/* Right Content - Puzzle Preview */}
            <div className="relative">
              {/* Decorative Elements */}
              <div className="absolute -top-8 -left-8 text-6xl rotate-12 animate-float">🧩</div>
              <div className="absolute -bottom-8 -right-8 text-6xl -rotate-12 animate-float-delayed">🎨</div>

              {/* Preview Puzzle */}
              <div className="relative transform-gpu overflow-hidden rounded-2xl border-2 border-pink-500/30 bg-gradient-to-br from-pink-900/50 to-rose-900/50 p-6 shadow-2xl">
                <div className="grid grid-cols-2 gap-2">
                  <div className="aspect-square rounded-lg bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center">
                    <span className="text-2xl text-white">🌸</span>
                  </div>
                  <div className="aspect-square rounded-lg bg-gradient-to-br from-rose-400 to-pink-400 flex items-center justify-center">
                    <span className="text-2xl text-white">✨</span>
                  </div>
                  <div className="aspect-square rounded-lg bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center">
                    <span className="text-2xl text-white">💮</span>
                  </div>
                  <div className="aspect-square rounded-lg bg-gradient-to-br from-rose-400 to-pink-400 flex items-center justify-center">
                    <span className="text-2xl text-white">🌸</span>
                  </div>
                </div>

                {/* Overlay Badge */}
                <div className="absolute bottom-0 left-0 right-0 z-20 p-4">
                  <div className="inline-flex items-center gap-3 rounded-2xl bg-black/50 backdrop-blur-md px-4 py-2 border border-pink-500/30">
                    <FaPuzzlePiece className="text-pink-400 text-lg animate-bounce" />
                    <span className="text-sm font-black text-white">DRAG & DROP · 2 JAMOA</span>
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
              className="group relative transform-gpu overflow-hidden rounded-2xl border border-pink-500/20 bg-gradient-to-br from-pink-950/30 to-rose-950/30 p-6 backdrop-blur-sm transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl hover:border-pink-400/30"
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
              
              <feature.bgIcon className="absolute right-4 top-4 text-5xl text-pink-500/20 group-hover:text-pink-500/30 transition-all group-hover:scale-110 group-hover:rotate-12" />
              
              <div className={`relative mb-5 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r ${feature.color} text-white shadow-xl transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                <feature.icon className="text-2xl" />
              </div>
              
              <h3 className="relative mb-2 text-xl font-black text-white">{feature.title}</h3>
              <p className="relative mb-4 text-sm text-pink-200/70">{feature.desc}</p>
              
              <div className="relative flex items-center gap-2">
                <span className="text-xs font-bold text-pink-400">{feature.stats}</span>
                <div className="h-1.5 flex-1 rounded-full bg-pink-500/20 overflow-hidden">
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
              className="group relative transform-gpu overflow-hidden rounded-2xl border border-pink-500/20 bg-gradient-to-br from-pink-950/30 to-rose-950/30 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-pink-400/30 hover:shadow-2xl"
            >
              <div className="absolute -right-4 -bottom-4 text-6xl opacity-10 group-hover:opacity-20">
                {level.emoji}
              </div>

              <div className="relative mb-4 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-pink-500/30" />
                  <div
                    className={`relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r ${level.color} text-white text-2xl shadow-2xl border-2 border-white/30`}
                  >
                    <level.icon />
                  </div>
                </div>
              </div>

              <h4 className="relative mb-2 text-center text-lg font-black text-white">
                {level.level}
              </h4>

              <div className="relative mb-4 space-y-1 text-center text-sm">
                <p className="text-pink-200/70">{level.pieces}</p>
                <p className="text-pink-300/50">{level.time}</p>
              </div>

              <div className="relative h-2 rounded-full bg-pink-500/20 overflow-hidden">
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
           <GameFeedbackPanel gameKey="mini-puzzle" />
        </div>

        {/* Footer */}
        <div className="relative mt-10 flex justify-center items-center gap-6">
          <div className="h-px w-12 bg-gradient-to-r from-transparent via-pink-500/30 to-transparent" />

          <div className="flex gap-4 text-4xl text-pink-600/30">
            <GiAchievement
              className="hover:text-pink-500/50 transition-colors animate-bounce"
              style={{ animationDelay: "0s" }}
            />
            <GiPodium
              className="hover:text-pink-500/50 transition-colors animate-bounce"
              style={{ animationDelay: "0.2s" }}
            />
            <FaTrophy
              className="hover:text-pink-500/50 transition-colors animate-bounce"
              style={{ animationDelay: "0.4s" }}
            />
            <GiSpinningWheel
              className="hover:text-pink-500/50 transition-colors animate-bounce"
              style={{ animationDelay: "0.6s" }}
            />
            <FaCrown
              className="hover:text-pink-500/50 transition-colors animate-bounce"
              style={{ animationDelay: "0.8s" }}
            />
          </div>

          <div className="h-px w-12 bg-gradient-to-r from-pink-500/30 via-transparent to-transparent" />
        </div>
      </div>
    </div>
  );
}

export default MiniPuzzlePage;



