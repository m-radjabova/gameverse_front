import {
  FaUsers,
  FaTrophy,
  FaCrown,
  FaSkull,
  FaKeyboard,
  FaLightbulb,
  FaExchangeAlt,
} from "react-icons/fa";
import {
  GiAchievement,
  GiPodium,
  GiSpinningWheel,
  GiBrain,
  GiSwordsEmblem
} from "react-icons/gi";
import { RiTeamFill, RiSwordFill } from "react-icons/ri";
import GameFeedbackPanel from "../shared/GameFeedbackPanel";
import GamePagePlayButton from "../shared/GamePagePlayButton";

function HangmanPage() {
  const gameStats = [
    {
      icon: <FaUsers className="text-2xl text-white" />,
      label: "JAMOALAR",
      value: "2 ta",
      color: "from-amber-600 to-red-600",
    },
    {
      icon: <FaCrown className="text-2xl text-white" />,
      label: "JONLAR",
      value: "6 ta",
      color: "from-red-600 to-rose-600",
    },
    {
      icon: <FaKeyboard className="text-2xl text-white" />,
      label: "HARFLAR",
      value: "26+",
      color: "from-rose-600 to-amber-600",
    },
    {
      icon: <FaTrophy className="text-2xl text-white" />,
      label: "BALL",
      value: "Raund +1",
      color: "from-amber-600 to-rose-600",
    },
  ];

  const features = [
    {
      icon: GiSwordsEmblem,
      title: "2 jamoa",
      desc: "Bir jamoa so'z yashiradi, ikkinchisi topadi",
      color: "from-amber-500 to-red-500",
      bgIcon: RiTeamFill,
      stats: "A vs B",
    },
    {
      icon: RiSwordFill,
      title: "Klassik hangman",
      desc: "6 ta xato, har xato uchun rasm chiziladi",
      color: "from-red-500 to-rose-500",
      bgIcon: FaSkull,
      stats: "MAX 6 xato",
    },
    {
      icon: FaLightbulb,
      title: "Hint va Solve",
      desc: "Hint (+1 xato), Solve noto'g'ri bo'lsa +2 xato",
      color: "from-rose-500 to-amber-500",
      bgIcon: GiBrain,
      stats: "Bonus imkoniyat",
    },
  ];

  const rules = [
    { text: "So'z yashiruvchi jamoa so'zni kiritadi", icon: "🔐" },
    { text: "Topuvchi jamoa harflarni tanlaydi", icon: "🎯" },
    { text: "Har noto'g'ri harf uchun 1 xato qo'shiladi", icon: "❌" },
    { text: "6 xato bo'lsa, so'z yashirgan jamoa g'olib", icon: "💀" },
    { text: "So'z topsa, topuvchi jamoa g'olib", icon: "🏆" },
    { text: "Hint: 1 xato evaziga bir harf ochiladi", icon: "💡" },
    { text: "Solve: noto'g'ri bo'lsa 2 xato qo'shiladi", icon: "⚡" },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-amber-50 via-red-50 to-rose-50 dark:from-amber-950 dark:via-red-950 dark:to-rose-950">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] animate-pulse-slow rounded-full bg-amber-300/20 blur-3xl dark:bg-amber-600/20" />
        <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] animate-pulse-slower rounded-full bg-red-300/20 blur-3xl dark:bg-red-600/20" />
        
        {/* Hangman Pattern */}
        <div
          className="absolute inset-0 opacity-20 dark:opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 20px 20px, #f59e0b 2px, transparent 2px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Floating Letters */}
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
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
              {["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"][i % 26]}
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 mx-auto min-h-screen w-full max-w-[2000px] px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8 lg:px-8 xl:px-10">
        {/* Hero Section */}
        <div className="group relative mb-8 transform-gpu overflow-hidden rounded-3xl border-2 border-amber-400/30 bg-gradient-to-br from-amber-100/80 via-red-100/80 to-rose-100/80 dark:from-amber-900/80 dark:via-red-900/80 dark:to-rose-900/80 p-6 shadow-2xl backdrop-blur-sm md:p-8 lg:p-10">
          {/* Animated Border */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-amber-400/30 via-red-400/30 to-rose-400/30 animate-gradient" />
          </div>

          {/* Corner Decorations */}
          <div className="absolute top-0 left-0 text-4xl opacity-30 animate-bounce">💀</div>
          <div className="absolute top-0 right-0 text-4xl opacity-30 animate-bounce delay-100">🔤</div>
          <div className="absolute bottom-0 left-0 text-4xl opacity-30 animate-bounce delay-200">🏆</div>
          <div className="absolute bottom-0 right-0 text-4xl opacity-30 animate-bounce delay-300">🎯</div>

          <div className="relative grid gap-8 lg:grid-cols-2 lg:gap-12 lg:items-center">
            {/* Left Content */}
            <div className="space-y-6">
              {/* Game Badge */}
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-red-400 blur-xl rounded-full animate-pulse" />
                <div className="relative flex items-center gap-3 rounded-full bg-gradient-to-r from-amber-100 to-red-100 dark:from-amber-800 dark:to-red-800 px-5 py-2 border-2 border-amber-400/50 shadow-xl">
                  <FaUsers className="text-amber-600 dark:text-amber-300 text-xl animate-pulse" />
                  <span className="text-sm font-black tracking-wider text-transparent bg-gradient-to-r from-amber-600 to-red-600 dark:from-amber-300 dark:to-red-300 bg-clip-text">
                    JAMOALI HANGMAN
                  </span>
                </div>
              </div>

              {/* Title */}
              <div className="relative">
                <h1 className="text-5xl font-black leading-tight md:text-6xl lg:text-7xl">
                  <span className="relative inline-block">
                    <span className="absolute -inset-2 bg-gradient-to-r from-amber-400/30 to-red-400/30 blur-2xl" />
                    <span className="relative bg-gradient-to-r from-amber-600 to-red-600 dark:from-amber-300 dark:to-red-300 bg-clip-text text-transparent">
                      2 Jamoali
                    </span>
                  </span>
                  <br />
                  <span className="relative inline-block mt-2">
                    <span className="absolute -inset-2 bg-gradient-to-r from-red-400/30 to-rose-400/30 blur-2xl" />
                    <span className="relative bg-gradient-to-r from-red-600 to-rose-600 dark:from-red-300 dark:to-rose-300 bg-clip-text text-transparent">
                      Hangman
                    </span>
                  </span>
                </h1>

                {/* Decorative Line */}
                <div className="relative mt-4 h-1 w-32 overflow-hidden rounded-full bg-gradient-to-r from-amber-400 via-red-400 to-rose-400">
                  <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                </div>
              </div>

              {/* Description */}
              <div className="relative max-w-xl rounded-xl bg-white/50 dark:bg-slate-800/50 p-4 border-2 border-amber-400/30 backdrop-blur-sm">
                <p className="text-base text-gray-700 dark:text-gray-200 md:text-lg leading-relaxed">
                  Bir jamoa so'z yashiradi, ikkinchi jamoa harflar tanlab so'zni topishga harakat qiladi.
                  6 xato - o'yin tugaydi!
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {gameStats.map((stat, index) => (
                  <div
                    key={index}
                    className="group/stat relative transform-gpu overflow-hidden rounded-xl border-2 border-amber-400/30 bg-white/50 dark:bg-slate-800/50 p-4 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-2xl"
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
                to="/games/hangman/play"
                colorClassName="from-amber-500 to-red-500"
                className="pt-2"
              />
            </div>

            {/* Right Content - Preview */}
            <div className="relative">
              {/* Decorative Elements */}
              <div className="absolute -top-8 -left-8 text-6xl rotate-12 animate-bounce">💀</div>
              <div className="absolute -bottom-8 -right-8 text-6xl -rotate-12 animate-bounce delay-200">🔤</div>

              {/* Hangman Preview */}
              <div className="relative transform-gpu overflow-hidden rounded-2xl border-4 border-amber-400/30 bg-gradient-to-br from-amber-500 to-red-500 p-6 shadow-2xl">
                <div className="aspect-[4/3] bg-white/20 backdrop-blur-sm rounded-xl border-2 border-white/30 flex items-center justify-center p-4">
                  <svg viewBox="0 0 320 260" className="w-full h-full text-white">
                    <line x1="20" y1="240" x2="300" y2="240" stroke="currentColor" strokeWidth="6" />
                    <line x1="70" y1="240" x2="70" y2="30" stroke="currentColor" strokeWidth="6" />
                    <line x1="70" y1="30" x2="210" y2="30" stroke="currentColor" strokeWidth="6" />
                    <line x1="210" y1="30" x2="210" y2="60" stroke="currentColor" strokeWidth="6" />
                    <circle cx="210" cy="85" r="25" fill="none" stroke="currentColor" strokeWidth="6" />
                    <line x1="210" y1="110" x2="210" y2="170" stroke="currentColor" strokeWidth="6" />
                    <line x1="210" y1="130" x2="175" y2="150" stroke="currentColor" strokeWidth="6" />
                    <line x1="210" y1="130" x2="245" y2="150" stroke="currentColor" strokeWidth="6" />
                    <line x1="210" y1="170" x2="185" y2="210" stroke="currentColor" strokeWidth="6" />
                    <line x1="210" y1="170" x2="235" y2="210" stroke="currentColor" strokeWidth="6" />
                  </svg>
                </div>

                {/* Word Preview */}
                <div className="mt-4 flex justify-center gap-2">
                  {["_", "_", "_", "_", "_", "_", "_"].map((_, i) => (
                    <div key={i} className="w-8 h-10 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white font-bold">
                      {i === 2 ? "E" : "_"}
                    </div>
                  ))}
                </div>

                {/* Overlay Badge */}
                <div className="absolute bottom-0 left-0 right-0 z-20 p-4">
                  <div className="inline-flex items-center gap-3 rounded-2xl bg-black/50 backdrop-blur-md px-4 py-2 border-2 border-amber-400/50 shadow-xl">
                    <GiSwordsEmblem className="text-amber-300 text-lg animate-pulse" />
                    <span className="text-sm font-black text-white tracking-wider">
                      A TEAM vs B TEAM · 6 JON
                    </span>
                  </div>
                </div>

                {/* Floating Badges */}
                <div className="absolute top-4 right-4 z-20 flex gap-2">
                  <div className="rounded-full bg-gradient-to-r from-amber-600 to-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-xl border border-amber-400">
                    <span className="flex items-center gap-1">
                      <FaExchangeAlt /> A↔B
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
              className="group relative transform-gpu overflow-hidden rounded-2xl border-2 border-amber-400/30 bg-white/50 dark:bg-slate-800/50 p-6 backdrop-blur-sm transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl hover:border-amber-400/50"
            >
              {/* Animated Background */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-700"
                style={{
                  backgroundImage: `radial-gradient(circle at ${30 + index * 20}% ${40 + index * 10}%, #f59e0b 0%, transparent 50%)`,
                }}
              />

              {/* Corner Decorations */}
              <div className="absolute top-2 left-2 h-6 w-6 border-l-2 border-t-2 border-amber-400/50 group-hover:border-amber-300 transition-colors" />
              <div className="absolute top-2 right-2 h-6 w-6 border-r-2 border-t-2 border-red-400/50 group-hover:border-red-300 transition-colors" />
              <div className="absolute bottom-2 left-2 h-6 w-6 border-l-2 border-b-2 border-rose-400/50 group-hover:border-rose-300 transition-colors" />
              <div className="absolute bottom-2 right-2 h-6 w-6 border-r-2 border-b-2 border-amber-400/50 group-hover:border-amber-300 transition-colors" />

              {/* Decorative Icon */}
              <feature.bgIcon className="absolute right-4 top-4 text-5xl text-amber-500/20 group-hover:text-amber-500/30 transition-all group-hover:scale-110 group-hover:rotate-12" />

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
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{feature.stats}</span>
                <div className="h-1.5 flex-1 rounded-full bg-amber-200 dark:bg-amber-900/50 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${feature.color} transition-all duration-500 group-hover:animate-pulse`}
                    style={{ width: "85%" }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Rules Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-6 flex items-center gap-3">
            <span className="bg-gradient-to-r from-amber-600 to-red-600 dark:from-amber-400 dark:to-red-400 bg-clip-text text-transparent">
              O'YIN QOIDALARI
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-amber-400/30 to-transparent" />
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {rules.map((rule, index) => (
              <div
                key={index}
                className="group relative transform-gpu overflow-hidden rounded-xl border-2 border-amber-400/30 bg-white/50 dark:bg-slate-800/50 p-4 backdrop-blur-sm transition-all hover:scale-105 hover:shadow-xl text-center"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <span className="text-3xl mb-2 block">{rule.icon}</span>
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{rule.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Game Component Container */}
        <div className="relative">
          <GameFeedbackPanel gameKey="hangman" />
        </div>

        {/* Footer */}
        <div className="relative mt-12 flex justify-center items-center gap-6">
          <div className="h-px w-12 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

          <div className="flex gap-4 text-4xl text-amber-600/30">
            <GiAchievement
              className="hover:text-amber-500/50 transition-colors animate-bounce"
              style={{ animationDelay: "0s" }}
            />
            <GiPodium
              className="hover:text-amber-500/50 transition-colors animate-bounce"
              style={{ animationDelay: "0.2s" }}
            />
            <FaTrophy
              className="hover:text-amber-500/50 transition-colors animate-bounce"
              style={{ animationDelay: "0.4s" }}
            />
            <GiSpinningWheel
              className="hover:text-amber-500/50 transition-colors animate-bounce"
              style={{ animationDelay: "0.6s" }}
            />
            <FaCrown
              className="hover:text-amber-500/50 transition-colors animate-bounce"
              style={{ animationDelay: "0.8s" }}
            />
          </div>

          <div className="h-px w-12 bg-gradient-to-r from-amber-500/30 via-transparent to-transparent" />
        </div>
      </div>
    </div>
  );
}

export default HangmanPage;



