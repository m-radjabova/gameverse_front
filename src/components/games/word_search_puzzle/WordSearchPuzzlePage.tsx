import { 
  FaApple, 
  FaCarrot, 
  FaCrown, 
  FaStar, 
  FaUsers, 
  FaPuzzlePiece,
  FaSearch
} from "react-icons/fa";
import { 
  GiAchievement, 
  GiPodium, 
  GiFruitBowl, 
  GiBroccoli, 
  GiBrain
} from "react-icons/gi";
import { 
  MdTimer, 
  MdEmojiEvents, 
  MdGridOn,
  MdOutlineGridOn
} from "react-icons/md";
import GameFeedbackPanel from "../shared/GameFeedbackPanel";
import GamePagePlayButton from "../shared/GamePagePlayButton";
import wordSearchImg from "../../../assets/word_search_image.png";

function WordSearchPuzzlePage() {
  const gameStats = [
    { icon: FaUsers, label: "GURUHLAR", value: "2 jamoa", color: "from-emerald-400 to-teal-400" },
    { icon: MdTimer, label: "DAVOMIYLIK", value: "10-15 min", color: "from-teal-400 to-cyan-400" },
    { icon: MdGridOn, label: "JADVAL", value: "12x12", color: "from-cyan-400 to-emerald-400" },
    { icon: FaSearch, label: "SO'ZLAR", value: "Custom", color: "from-emerald-400 to-cyan-400" },
  ];

  const features = [
    { 
      icon: GiFruitBowl, 
      title: "1-guruh ro'yxati", 
      desc: "O'qituvchi xohlagan temadagi so'zlarni 1-guruhga biriktiradi",
      color: "from-emerald-400 to-teal-400",
      bgIcon: FaApple,
      stats: "Custom words"
    },
    { 
      icon: GiBroccoli, 
      title: "2-guruh ro'yxati", 
      desc: "O'qituvchi xohlagan temadagi so'zlarni 2-guruhga biriktiradi",
      color: "from-teal-400 to-cyan-400",
      bgIcon: FaCarrot,
      stats: "Custom words"
    },
    { 
      icon: MdOutlineGridOn, 
      title: "So'z qidirish", 
      desc: "8 tomonga so'zlarni topish imkoniyati",
      color: "from-cyan-400 to-emerald-400",
      bgIcon: FaSearch,
      stats: "8 direction"
    },
  ];

  const puzzleLevels = [
    { level: "BOSHLANG'ICH", words: "10-15 so'z", time: "45 soniya", icon: FaStar, color: "from-emerald-400 to-teal-400", progress: 33 },
    { level: "O'RTA", words: "15-25 so'z", time: "60 soniya", icon: GiBrain, color: "from-teal-400 to-cyan-400", progress: 66 },
    { level: "PROFESSIONAL", words: "25-35 so'z", time: "90 soniya", icon: FaCrown, color: "from-cyan-400 to-emerald-400", progress: 100 },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#0a2a1a] via-[#0a3a2a] to-[#0a2f3a] [&_button]:cursor-pointer [&_button]:transition-all [&_button]:duration-200 [&_button:hover]:brightness-110 [&_button:disabled]:cursor-not-allowed">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] animate-pulse rounded-full bg-emerald-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] animate-pulse rounded-full bg-teal-600/20 blur-3xl delay-1000" />
        <div className="absolute top-1/3 left-1/3 h-[500px] w-[500px] animate-pulse rounded-full bg-cyan-600/10 blur-3xl delay-500" />
        
        {/* Floating Particles */}
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="absolute h-1.5 w-1.5 rounded-full bg-emerald-200/20 animate-float"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
              opacity: 0.1 + Math.random() * 0.3
            }}
          />
        ))}

        {/* Grid Pattern */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(16, 185, 129, 0.03) 2px, transparent 0)',
          backgroundSize: '50px 50px'
        }} />

        {/* Game Icons Background */}
        <GiFruitBowl className="absolute left-[5%] top-[15%] animate-float text-8xl text-emerald-500/5" />
        <GiBroccoli className="absolute right-[8%] bottom-[20%] animate-float-delayed text-7xl text-teal-500/5" />
        <FaSearch className="absolute left-[15%] bottom-[10%] animate-float-slow text-7xl text-cyan-500/5" />
        <MdGridOn className="absolute right-[12%] top-[25%] animate-float text-8xl text-emerald-500/5" />
      </div>

      <div className="relative z-10 mx-auto min-h-screen w-full max-w-[2000px] px-4 py-6 md:px-6 md:py-8 lg:px-8 xl:px-10 motion-safe:animate-[fadeInUp_.35s_ease-out]">
        {/* Hero Section */}
        <div className="group relative mb-8 transform-gpu overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-900/40 via-teal-900/40 to-cyan-900/40 p-6 backdrop-blur-xl shadow-2xl md:p-8 lg:p-10">
          {/* Animated Gradient Border */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-500/30 via-teal-500/30 to-cyan-500/30 animate-gradient" />
          </div>

          <div className="relative grid gap-8 lg:grid-cols-2 lg:gap-12 lg:items-center">
            {/* Left Content */}
            <div className="space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 px-4 py-2 border border-emerald-500/30">
                <FaSearch className="text-emerald-400 animate-pulse" />
                <span className="text-sm font-black text-transparent bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text">
                  WORD SEARCH PUZZLE
                </span>
                <div className="ml-2 flex h-2 w-2">
                  <span className="absolute inline-flex h-2 w-2  rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-4xl font-black leading-tight md:text-5xl lg:text-6xl">
                <span className="bg-gradient-to-r from-emerald-200 via-teal-200 to-cyan-200 bg-clip-text text-transparent">
                  So'z qidirish
                </span>
                <br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  o'yini
                </span>
              </h1>

              {/* Description */}
              <p className="max-w-xl text-base text-emerald-100/80 md:text-lg leading-relaxed">
                O'qituvchi kiritgan istalgan temadagi so'zlarni qidiring. 
                1-guruh va 2-guruh o'z ro'yxatidagi so'zlarni topadi. Eng ko'p ball to'plagan guruh g'olib!
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {gameStats.map((stat, index) => (
                  <div
                    key={index}
                    className="group/stat relative transform-gpu overflow-hidden rounded-xl border border-emerald-500/20 bg-emerald-950/30 p-4 backdrop-blur-sm transition-all hover:scale-105 hover:bg-emerald-900/40"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover/stat:opacity-20 transition-opacity`} />
                    <div className="relative">
                      <div className={`mb-2 inline-flex rounded-lg bg-gradient-to-r ${stat.color} p-2`}>
                        <stat.icon className="text-lg text-white" />
                      </div>
                      <p className="text-xs font-bold text-emerald-200/70">{stat.label}</p>
                      <p className="text-sm font-black text-white">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            <GamePagePlayButton
                to="/games/word-search/play"
                colorClassName="from-emerald-500 to-cyan-500"
                className="pt-2"
                modeSelectionEnabled
              />
            </div>

            {/* Right Content - Image */}
            <div className="relative">
              {/* Decorative Elements */}
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-emerald-500/30 via-teal-500/30 to-cyan-500/30 blur-2xl animate-pulse" />
              <div className="absolute -top-6 -right-6 h-32 w-32 rounded-full bg-emerald-500/20 blur-xl" />
              
              {/* Image Container */}
              <div className="relative transform-gpu overflow-hidden rounded-2xl border-2 border-emerald-500/30 shadow-2xl transition-all group-hover:scale-[1.02] group-hover:border-emerald-400/50">
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a2a1a] via-transparent to-transparent z-10" />
                <img 
                  src={wordSearchImg} 
                  alt="Word Search Puzzle Game" 
                  className="h-[360px] w-full object-cover md:h-[440px] lg:h-[520px]"
                />
                
                {/* Overlay Content */}
                <div className="absolute bottom-0 left-0 right-0 z-20 p-6">
                  <div className="inline-flex items-center gap-3 rounded-2xl bg-black/50 backdrop-blur-md px-4 py-2 border border-emerald-500/30">
                    <FaPuzzlePiece className="text-emerald-400" />
                    <span className="text-sm font-black text-white">WORD SEARCH</span>
                    <div className="ml-2 flex gap-1">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse delay-150" />
                      <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse delay-300" />
                    </div>
                  </div>
                </div>

                {/* Floating Badges */}
                <div className="absolute top-4 right-4 z-20 flex gap-2">
                  <div className="rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-1 text-xs font-bold text-white shadow-lg">
                    12x12 jadval
                  </div>
                  <div className="rounded-full bg-gradient-to-r from-teal-600 to-cyan-600 px-3 py-1 text-xs font-bold text-white shadow-lg">
                    8 TOMON
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative transform-gpu overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/30 to-teal-950/30 p-6 backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:border-emerald-400/30"
            >
              {/* Animated Background */}
              <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
              
              {/* Decorative Icon */}
              <feature.bgIcon className="absolute right-2 top-2 text-4xl text-emerald-500/20 group-hover:text-emerald-400/30 transition-all group-hover:scale-110" />
              
              {/* Icon */}
              <div className={`relative mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r ${feature.color} text-white shadow-xl transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                <feature.icon className="text-2xl" />
              </div>
              
              {/* Content */}
              <h3 className="relative mb-2 text-lg font-black text-white">{feature.title}</h3>
              <p className="relative mb-3 text-sm text-emerald-200/80">{feature.desc}</p>
              
              {/* Stats */}
              <div className="relative flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-300">{feature.stats}</span>
                <div className="h-1 flex-1 rounded-full bg-emerald-500/20">
                  <div className={`h-full rounded-full bg-gradient-to-r ${feature.color}`} style={{ width: '75%' }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Puzzle Levels */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          {puzzleLevels.map((level, index) => (
            <div
              key={index}
              className="group relative transform-gpu overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/30 to-teal-950/30 p-6 backdrop-blur-sm transition-all hover:border-emerald-400/30"
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-r ${level.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
              
              {/* Icon */}
              <level.icon className={`relative mx-auto mb-3 text-4xl bg-gradient-to-r ${level.color} bg-clip-text text-transparent`} />
              
              {/* Title */}
              <h4 className="relative mb-2 text-center text-base font-black text-white">{level.level}</h4>
              <p className="relative mb-1 text-center text-xs text-emerald-200/70">{level.words}</p>
              <p className="relative mb-4 text-center text-xs text-emerald-200/70">{level.time}</p>
              
              {/* Progress Bar */}
              <div className="relative h-2 rounded-full bg-emerald-500/20">
                <div 
                  className={`h-full rounded-full bg-gradient-to-r ${level.color} transition-all group-hover:animate-pulse`}
                  style={{ width: `${level.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* WordSearchPuzzle Component Container */}
        <div className="relative">
          <GameFeedbackPanel gameKey="word-search" />
        </div>

        {/* Footer */}
        <div className="relative mt-10 flex justify-center gap-6 text-5xl text-emerald-500/20 md:text-6xl">
          <MdEmojiEvents className="animate-bounce" style={{ animationDelay: '0s' }} />
          <GiAchievement className="animate-bounce" style={{ animationDelay: '0.2s' }} />
          <FaCrown className="animate-bounce" style={{ animationDelay: '0.4s' }} />
          <GiPodium className="animate-bounce" style={{ animationDelay: '0.6s' }} />
          <FaStar className="animate-bounce" style={{ animationDelay: '0.8s' }} />
        </div>
      </div>
    </div>
  );
}

export default WordSearchPuzzlePage;







