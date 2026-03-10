import { 
  FaFlag, 
  FaUsers, 
  FaTrophy,
  FaBolt, 
  FaCrown, 
  FaGlobe
} from "react-icons/fa";
import { 
  GiEarthAfricaEurope, 
  GiEarthAsiaOceania,
  GiAchievement,
  GiPodium
} from "react-icons/gi";
import { 
  MdTimer, 
  MdEmojiEvents, 
  MdPublic,
  MdLanguage
} from "react-icons/md";
import GameFeedbackPanel from "../shared/GameFeedbackPanel";
import GamePagePlayButton from "../shared/GamePagePlayButton";

function FlagBattlePage() {
  const flagBattleImg = "https://media.istockphoto.com/id/1030295058/photo/flags-of-different-countries-together-us-flag-in-focus.jpg?s=612x612&w=0&k=20&c=fZ67LXjSvX6LlHflpGF5YpD8bZHNUfzcQW_DvtU3lNQ="
  const gameStats = [
    { icon: FaUsers, label: "O'YINCHILAR", value: "2 guruh", color: "from-blue-400 to-cyan-400" },
    { icon: MdTimer, label: "DAVOMIYLIK", value: "5-8 min", color: "from-cyan-400 to-teal-400" },
    { icon: FaFlag, label: "BAYROQLAR", value: "30+ davlat", color: "from-teal-400 to-blue-400" },
    { icon: FaTrophy, label: "BALL", value: "1000+", color: "from-blue-400 to-teal-400" },
  ];

  const features = [
    { 
      icon: FaGlobe, 
      title: "Dunyo bo'ylab", 
      desc: "30 dan ortiq davlat bayroqlari",
      color: "from-blue-400 to-cyan-400",
      bgIcon: GiEarthAfricaEurope,
      stats: "6 qit'a"
    },
    { 
      icon: FaBolt, 
      title: "Tezkor javob", 
      desc: "20 soniya vaqt, bonus ball",
      color: "from-cyan-400 to-teal-400",
      bgIcon: MdTimer,
      stats: "20s"
    },
    { 
      icon: FaCrown, 
      title: "Streak bonus", 
      desc: "Ketma-ket to'g'ri javoblar uchun qo'shimcha ball",
      color: "from-teal-400 to-blue-400",
      bgIcon: GiAchievement,
      stats: "+15"
    },
  ];

  const continentLevels = [
    { level: "YEVROPA", flags: "8 ta bayroq", time: "oson", icon: GiEarthAfricaEurope, color: "from-blue-400 to-cyan-400", progress: 33 },
    { level: "OSIYO", flags: "8 ta bayroq", time: "o'rtacha", icon: GiEarthAsiaOceania, color: "from-cyan-400 to-teal-400", progress: 66 },
    { level: "AFRIKA", flags: "4 ta bayroq", time: "qiyin", icon: GiEarthAfricaEurope, color: "from-teal-400 to-blue-400", progress: 100 },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#0a1f2a] via-[#0a2a3a] to-[#0a2f4a] [&_button]:cursor-pointer [&_button]:transition-all [&_button]:duration-200 [&_button:hover]:brightness-110 [&_button:disabled]:cursor-not-allowed">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] animate-pulse rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] animate-pulse rounded-full bg-cyan-600/20 blur-3xl delay-1000" />
        <div className="absolute top-1/3 left-1/3 h-[500px] w-[500px] animate-pulse rounded-full bg-teal-600/10 blur-3xl delay-500" />
        
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="absolute h-1.5 w-1.5 rounded-full bg-blue-200/20 animate-float"
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
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(59, 130, 246, 0.03) 2px, transparent 0)',
          backgroundSize: '50px 50px'
        }} />

        <FaFlag className="absolute left-[5%] top-[15%] animate-float text-8xl text-blue-500/5" />
        <FaGlobe className="absolute right-[8%] bottom-[20%] animate-float-delayed text-7xl text-cyan-500/5" />
        <MdPublic className="absolute left-[15%] bottom-[10%] animate-float-slow text-7xl text-teal-500/5" />
        <MdLanguage className="absolute right-[12%] top-[25%] animate-float text-8xl text-blue-500/5" />
      </div>

      <div className="relative z-10 mx-auto min-h-screen w-full max-w-[2000px] px-4 py-6 md:px-6 md:py-8 lg:px-8 xl:px-10 motion-safe:animate-[fadeInUp_.35s_ease-out]">
        {/* Hero Section */}
        <div className="group relative mb-8 transform-gpu overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-900/40 via-cyan-900/40 to-teal-900/40 p-6 backdrop-blur-xl shadow-2xl md:p-8 lg:p-10">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/30 via-cyan-500/30 to-teal-500/30 animate-gradient" />
          </div>

          <div className="relative grid gap-8 lg:grid-cols-2 lg:gap-12 lg:items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 px-4 py-2 border border-blue-500/30">
                <FaFlag className="text-blue-400 animate-pulse" />
                <span className="text-sm font-black text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text">
                  FLAG BATTLE ARENA
                </span>
                <div className="ml-2 flex h-2 w-2">
                  <span className="absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                </div>
              </div>

              <h1 className="text-4xl font-black leading-tight md:text-5xl lg:text-6xl">
                <span className="bg-gradient-to-r from-blue-200 via-cyan-200 to-teal-200 bg-clip-text text-transparent">
                  Bayroqlarni
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                  toping
                </span>
              </h1>

              <p className="max-w-xl text-base text-blue-100/80 md:text-lg leading-relaxed">
                Dunyo davlatlarining bayroqlarini toping, guruh bo'lib o'ynang 
                va eng bilimdon jamoa bo'ling!
              </p>

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {gameStats.map((stat, index) => (
                  <div
                    key={index}
                    className="group/stat relative transform-gpu overflow-hidden rounded-xl border border-blue-500/20 bg-blue-950/30 p-4 backdrop-blur-sm transition-all hover:scale-105 hover:bg-blue-900/40"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover/stat:opacity-20 transition-opacity`} />
                    <div className="relative">
                      <div className={`mb-2 inline-flex rounded-lg bg-gradient-to-r ${stat.color} p-2`}>
                        <stat.icon className="text-lg text-white" />
                      </div>
                      <p className="text-xs font-bold text-blue-200/70">{stat.label}</p>
                      <p className="text-sm font-black text-white">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <GamePagePlayButton
                to="/games/flag-battle/play"
                colorClassName="from-blue-500 to-teal-500"
                className="pt-2"
              />
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-blue-500/30 via-cyan-500/30 to-teal-500/30 blur-2xl animate-pulse" />
              <div className="absolute -top-6 -right-6 h-32 w-32 rounded-full bg-blue-500/20 blur-xl" />
              
              <div className="relative transform-gpu overflow-hidden rounded-2xl border-2 border-blue-500/30 shadow-2xl transition-all group-hover:scale-[1.02] group-hover:border-blue-400/50">
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a1f2a] via-transparent to-transparent z-10" />
                <img 
                  src={flagBattleImg} 
                  alt="Flag Battle Game" 
                  className="h-[300px] w-full object-cover md:h-[400px] lg:h-[450px]"
                />
                
                <div className="absolute bottom-0 left-0 right-0 z-20 p-6">
                  <div className="inline-flex items-center gap-3 rounded-2xl bg-black/50 backdrop-blur-md px-4 py-2 border border-blue-500/30">
                    <FaFlag className="text-blue-400" />
                    <span className="text-sm font-black text-white">FLAG BATTLE</span>
                    <div className="ml-2 flex gap-1">
                      <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                      <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse delay-150" />
                      <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse delay-300" />
                    </div>
                  </div>
                </div>

                <div className="absolute top-4 right-4 z-20 flex gap-2">
                  <div className="rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 px-3 py-1 text-xs font-bold text-white shadow-lg">
                    30+ BAYROQ
                  </div>
                  <div className="rounded-full bg-gradient-to-r from-cyan-600 to-teal-600 px-3 py-1 text-xs font-bold text-white shadow-lg">
                    6 QIT'A
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 z-30 flex gap-2">
                <div className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2 shadow-2xl">
                  <p className="text-xs font-bold text-white/80">BONUS</p>
                  <p className="text-lg font-black text-white">+15</p>
                </div>
                <div className="rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 px-4 py-2 shadow-2xl">
                  <p className="text-xs font-bold text-white/80">STREAK</p>
                  <p className="text-lg font-black text-white">x3</p>
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
              className="group relative transform-gpu overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-950/30 to-cyan-950/30 p-6 backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:border-blue-400/30"
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
              <feature.bgIcon className="absolute right-2 top-2 text-4xl text-blue-500/20 group-hover:text-blue-400/30 transition-all group-hover:scale-110" />
              
              <div className={`relative mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r ${feature.color} text-white shadow-xl transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                <feature.icon className="text-2xl" />
              </div>
              
              <h3 className="relative mb-2 text-lg font-black text-white">{feature.title}</h3>
              <p className="relative mb-3 text-sm text-blue-200/80">{feature.desc}</p>
              
              <div className="relative flex items-center gap-2">
                <span className="text-xs font-bold text-blue-300">{feature.stats}</span>
                <div className="h-1 flex-1 rounded-full bg-blue-500/20">
                  <div className={`h-full rounded-full bg-gradient-to-r ${feature.color}`} style={{ width: '75%' }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Continent Levels */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          {continentLevels.map((level, index) => (
            <div
              key={index}
              className="group relative transform-gpu overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-950/30 to-cyan-950/30 p-6 backdrop-blur-sm transition-all hover:border-blue-400/30"
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${level.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
              <level.icon className={`relative mx-auto mb-3 text-4xl bg-gradient-to-r ${level.color} bg-clip-text text-transparent`} />
              
              <h4 className="relative mb-2 text-center text-base font-black text-white">{level.level}</h4>
              <p className="relative mb-1 text-center text-xs text-blue-200/70">{level.flags}</p>
              <p className="relative mb-4 text-center text-xs text-blue-200/70">{level.time}</p>
              
              <div className="relative h-2 rounded-full bg-blue-500/20">
                <div 
                  className={`h-full rounded-full bg-gradient-to-r ${level.color} transition-all group-hover:animate-pulse`}
                  style={{ width: `${level.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* FlagBattle Component Container */}
        <div className="relative">
          <GameFeedbackPanel gameKey="flag-battle" />
        </div>

        {/* Footer */}
        <div className="relative mt-10 flex justify-center gap-6 text-5xl text-blue-500/20 md:text-6xl">
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

export default FlagBattlePage;




