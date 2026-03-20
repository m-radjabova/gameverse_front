import { 
  FaUsers, 
  FaTrophy, 
  FaClock,  
  FaCrown, 
  FaStar,
  FaMedal
} from "react-icons/fa";
import { 
  GiSpinningWheel, 
  GiAchievement, 
  GiPodium,
  GiPodiumWinner
} from "react-icons/gi";
import { 
  MdTimer, 
  MdEmojiEvents, 
  MdQuiz 
} from "react-icons/md";
import { RiTeamFill } from "react-icons/ri";
import GameFeedbackPanel from "../shared/GameFeedbackPanel";
import GamePagePlayButton from "../shared/GamePagePlayButton";
import wheelOfFortuneImg from "../../../assets/wheel_of_fortune_image.png";

function WheelOfFortunePage() {
  const gameStats = [
    { icon: FaUsers, label: "O'QUVCHILAR", value: "2-20 o'quvchi", color: "from-purple-400 to-pink-400" },
    { icon: MdTimer, label: "DAVOMIYLIK", value: "10-15 min", color: "from-pink-400 to-rose-400" },
    { icon: GiSpinningWheel, label: "BARABAN", value: "Tasodifiy", color: "from-rose-400 to-purple-400" },
    { icon: FaTrophy, label: "BALL", value: "500+", color: "from-purple-400 to-rose-400" },
  ];

  const features = [
    { 
      icon: GiSpinningWheel, 
      title: "Tasodifiy tanlov", 
      desc: "Baraban aylanadi va o'quvchi tanlanadi",
      color: "from-purple-400 to-pink-400",
      bgIcon: RiTeamFill,
      stats: "2-20 o'quvchi"
    },
    { 
      icon: MdQuiz, 
      title: "Savol-javob", 
      desc: "Har bir o'quvchiga alohida savol",
      color: "from-pink-400 to-rose-400",
      bgIcon: FaClock,
      stats: "30-45 soniya"
    },
    { 
      icon: FaCrown, 
      title: "G'olib aniqlanadi", 
      desc: "Eng ko'p ball to'plagan o'quvchi g'olib",
      color: "from-rose-400 to-purple-400",
      bgIcon: GiPodium,
      stats: "1-2-3 o'rinlar"
    },
  ];

  const wheelLevels = [
    { level: "10 SAVOL", students: "2-4 o'quvchi", time: "10 min", icon: FaStar, color: "from-purple-400 to-pink-400", progress: 33 },
    { level: "15 SAVOL", students: "5-7 o'quvchi", time: "12 min", icon: FaMedal, color: "from-pink-400 to-rose-400", progress: 66 },
    { level: "20 SAVOL", students: "8-10 o'quvchi", time: "15 min", icon: FaCrown, color: "from-rose-400 to-purple-400", progress: 100 },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#2a0a2a] via-[#3a1a3a] to-[#2a1a3a] [&_button]:cursor-pointer [&_button]:transition-all [&_button]:duration-200 [&_button:hover]:brightness-110 [&_button:disabled]:cursor-not-allowed">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] animate-pulse rounded-full bg-purple-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] animate-pulse rounded-full bg-pink-600/20 blur-3xl delay-1000" />
        <div className="absolute top-1/3 left-1/3 h-[500px] w-[500px] animate-pulse rounded-full bg-rose-600/10 blur-3xl delay-500" />
        
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="absolute h-1.5 w-1.5 rounded-full bg-purple-200/20 animate-float"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
              opacity: 0.1 + Math.random() * 0.3
            }}
          />
        ))}

        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(168, 85, 247, 0.03) 2px, transparent 0)',
          backgroundSize: '50px 50px'
        }} />

        <GiSpinningWheel className="absolute left-[5%] top-[15%] animate-float text-8xl text-purple-500/5" />
        <GiPodiumWinner className="absolute right-[8%] bottom-[20%] animate-float-delayed text-7xl text-pink-500/5" />
        <GiPodium className="absolute left-[15%] bottom-[10%] animate-float-slow text-7xl text-rose-500/5" />
        <FaCrown className="absolute right-[12%] top-[25%] animate-float text-8xl text-purple-500/5" />
      </div>

      <div className="relative z-10 mx-auto min-h-screen w-full max-w-[2000px] px-4 py-6 md:px-6 md:py-8 lg:px-8 xl:px-10 motion-safe:animate-[fadeInUp_.35s_ease-out]">
        {/* Hero Section */}
        <div className="group relative mb-8 transform-gpu overflow-hidden rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-900/40 via-pink-900/40 to-rose-900/40 p-6 backdrop-blur-xl shadow-2xl md:p-8 lg:p-10">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-rose-500/30 animate-gradient" />
          </div>

          <div className="relative grid gap-8 lg:grid-cols-2 lg:gap-12 lg:items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-4 py-2 border border-purple-500/30">
                <GiSpinningWheel className="text-purple-400 animate-pulse" />
                <span className="text-sm font-black text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text">
                  WHEEL OF FORTUNE
                </span>
                <div className="ml-2 flex h-2 w-2">
                  <span className="absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                </div>
              </div>

              <h1 className="text-4xl font-black leading-tight md:text-5xl lg:text-6xl">
                <span className="bg-gradient-to-r from-purple-200 via-pink-200 to-rose-200 bg-clip-text text-transparent">
                  Baraban
                </span>
                <br />
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
                  o'yini
                </span>
              </h1>

              <p className="max-w-xl text-base text-purple-100/80 md:text-lg leading-relaxed">
                O'quvchilar ismlarini kiriting, barabanni aylantiring va tasodifiy tanlangan 
                o'quvchiga savol bering. Eng ko'p ball to'plagan g'olib bo'ladi!
              </p>

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {gameStats.map((stat, index) => (
                  <div
                    key={index}
                    className="group/stat relative transform-gpu overflow-hidden rounded-xl border border-purple-500/20 bg-purple-950/30 p-4 backdrop-blur-sm transition-all hover:scale-105 hover:bg-purple-900/40"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover/stat:opacity-20 transition-opacity`} />
                    <div className="relative">
                      <div className={`mb-2 inline-flex rounded-lg bg-gradient-to-r ${stat.color} p-2`}>
                        <stat.icon className="text-lg text-white" />
                      </div>
                      <p className="text-xs font-bold text-purple-200/70">{stat.label}</p>
                      <p className="text-sm font-black text-white">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <GamePagePlayButton
                to="/games/wheel-of-fortune/play"
                colorClassName="from-purple-500 to-rose-500"
                className="pt-2"
              />
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-rose-500/30 blur-2xl animate-pulse" />
              <div className="absolute -top-6 -right-6 h-32 w-32 rounded-full bg-purple-500/20 blur-xl" />
              
              <div className="relative transform-gpu overflow-hidden rounded-2xl border-2 border-purple-500/30 shadow-2xl transition-all group-hover:scale-[1.02] group-hover:border-purple-400/50">
                <div className="absolute inset-0 bg-gradient-to-t from-[#2a0a2a] via-transparent to-transparent z-10" />
                <img 
                  src={wheelOfFortuneImg} 
                  alt="Wheel of Fortune Game" 
                  className="h-[360px] w-full object-cover md:h-[440px] lg:h-[520px]"
                />
                
                <div className="absolute bottom-0 left-0 right-0 z-20 p-6">
                  <div className="inline-flex items-center gap-3 rounded-2xl bg-black/50 backdrop-blur-md px-4 py-2 border border-purple-500/30">
                    <GiSpinningWheel className="text-purple-400" />
                    <span className="text-sm font-black text-white">BARABAN O'YINI</span>
                    <div className="ml-2 flex gap-1">
                      <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
                      <span className="h-2 w-2 rounded-full bg-pink-400 animate-pulse delay-150" />
                      <span className="h-2 w-2 rounded-full bg-rose-400 animate-pulse delay-300" />
                    </div>
                  </div>
                </div>

                <div className="absolute top-4 right-4 z-20 flex gap-2">
                  <div className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1 text-xs font-bold text-white shadow-lg">
                    20+ SAVOL
                  </div>
                  <div className="rounded-full bg-gradient-to-r from-pink-600 to-rose-600 px-3 py-1 text-xs font-bold text-white shadow-lg">
                    2-10 O'QUVCHI
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
              className="group relative transform-gpu overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-950/30 to-pink-950/30 p-6 backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:border-purple-400/30"
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
              <feature.bgIcon className="absolute right-2 top-2 text-4xl text-purple-500/20 group-hover:text-purple-400/30 transition-all group-hover:scale-110" />
              
              <div className={`relative mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r ${feature.color} text-white shadow-xl transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                <feature.icon className="text-2xl" />
              </div>
              
              <h3 className="relative mb-2 text-lg font-black text-white">{feature.title}</h3>
              <p className="relative mb-3 text-sm text-purple-200/80">{feature.desc}</p>
              
              <div className="relative flex items-center gap-2">
                <span className="text-xs font-bold text-purple-300">{feature.stats}</span>
                <div className="h-1 flex-1 rounded-full bg-purple-500/20">
                  <div className={`h-full rounded-full bg-gradient-to-r ${feature.color}`} style={{ width: '75%' }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Wheel Levels */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          {wheelLevels.map((level, index) => (
            <div
              key={index}
              className="group relative transform-gpu overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-950/30 to-pink-950/30 p-6 backdrop-blur-sm transition-all hover:border-purple-400/30"
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${level.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
              <level.icon className={`relative mx-auto mb-3 text-4xl bg-gradient-to-r ${level.color} bg-clip-text text-transparent`} />
              
              <h4 className="relative mb-2 text-center text-base font-black text-white">{level.level}</h4>
              <p className="relative mb-1 text-center text-xs text-purple-200/70">{level.students}</p>
              <p className="relative mb-4 text-center text-xs text-purple-200/70">{level.time}</p>
              
              <div className="relative h-2 rounded-full bg-purple-500/20">
                <div 
                  className={`h-full rounded-full bg-gradient-to-r ${level.color} transition-all group-hover:animate-pulse`}
                  style={{ width: `${level.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* WheelOfFortune Component Container */}
        <div className="relative">
          <GameFeedbackPanel gameKey="wheel-of-fortune" />
        </div>

        {/* Footer */}
        <div className="relative mt-10 flex justify-center gap-6 text-5xl text-purple-500/20 md:text-6xl">
          <MdEmojiEvents className="animate-bounce" style={{ animationDelay: '0s' }} />
          <GiAchievement className="animate-bounce" style={{ animationDelay: '0.2s' }} />
          <FaTrophy className="animate-bounce" style={{ animationDelay: '0.4s' }} />
          <GiPodium className="animate-bounce" style={{ animationDelay: '0.6s' }} />
          <FaCrown className="animate-bounce" style={{ animationDelay: '0.8s' }} />
        </div>
      </div>
    </div>
  );
}

export default WheelOfFortunePage;




