import { 
  FaCrown,  
  FaStar, 
  FaUsers,
  FaVolumeUp,
  FaWaveSquare
} from "react-icons/fa";
import { 
  GiAchievement, 
  GiPodium, 
  GiFishMonster, 
  GiFishing, 
  GiFishingNet,
  GiFishingHook,
  GiHook,
  GiBubbles,
  GiCoral
} from "react-icons/gi";
import { 
  MdTimer, 
  MdEmojiEvents
} from "react-icons/md";
import { 
  IoWaterOutline,
  IoVolumeHighOutline 
} from "react-icons/io5";
import GameFeedbackPanel from "../shared/GameFeedbackPanel";
import GamePagePlayButton from "../shared/GamePagePlayButton";
import ocean from "../../../assets/ocean.jpg";


function OceanWordFishingPage() {
  const oceanImg = ocean;
  const gameStats = [
    { icon: FaUsers, label: "O'YINCHILAR", value: "1-4 kishi", color: "from-blue-500 to-cyan-400", bgColor: "from-blue-600/30 to-cyan-600/30" },
    { icon: MdTimer, label: "DAVOMIYLIK", value: "5-10 min", color: "from-cyan-500 to-teal-400", bgColor: "from-cyan-600/30 to-teal-600/30" },
    { icon: GiFishing, label: "BALIQLAR", value: "20+ ta", color: "from-teal-500 to-emerald-400", bgColor: "from-teal-600/30 to-emerald-600/30" },
    { icon: FaWaveSquare, label: "OKEAN", value: "Sarguzasht", color: "from-emerald-500 to-blue-400", bgColor: "from-emerald-600/30 to-blue-600/30" },
  ];

  const features = [
    { 
      icon: GiFishMonster, 
      title: "Baliqlar ustida harflar", 
      desc: "Har bir baliqda bitta harf bor. Baliqlarni bosing va so'z yig'ing",
      color: "from-blue-500 to-cyan-500",
      bgIcon: GiFishingNet,
      stats: "20+ baliq",
      gradient: "bg-gradient-to-br from-blue-500/20 to-cyan-500/20"
    },
    { 
      icon: GiFishingHook, 
      title: "So'z yig'ish", 
      desc: "Baliqlarni ketma-ket bosing va so'zni toping",
      color: "from-cyan-500 to-teal-500",
      bgIcon: GiHook,
      stats: "8+ harf",
      gradient: "bg-gradient-to-br from-cyan-500/20 to-teal-500/20"
    },
    { 
      icon: FaVolumeUp, 
      title: "Okean sadosi", 
      desc: "Haqiqiy okean tovushlari bilan o'ynang",
      color: "from-teal-500 to-emerald-500",
      bgIcon: IoVolumeHighOutline,
      stats: "MP3 audio",
      gradient: "bg-gradient-to-br from-teal-500/20 to-emerald-500/20"
    },
  ];

  const oceanLevels = [
    { level: "SOY", words: "3-4 harfli so'zlar", time: "45 soniya", icon: FaStar, color: "from-blue-500 to-cyan-500", progress: 33, bgColor: "bg-blue-500/20" },
    { level: "DENGIZ", words: "5-6 harfli so'zlar", time: "60 soniya", icon: GiFishing, color: "from-cyan-500 to-teal-500", progress: 66, bgColor: "bg-cyan-500/20" },
    { level: "OKEAN", words: "7+ harfli so'zlar", time: "90 soniya", icon: FaCrown, color: "from-teal-500 to-emerald-500", progress: 100, bgColor: "bg-teal-500/20" },
  ];

  const achievements = [
    { icon: GiAchievement, title: "Baliq ovchi", desc: "10 ta so'z yig'ing", progress: 70, color: "from-blue-500 to-cyan-500" },
    { icon: FaCrown, title: "Okean ustasi", desc: "Barcha so'zlarni toping", progress: 45, color: "from-cyan-500 to-teal-500" },
    { icon: FaStar, title: "Tezkor baliq", desc: "30 soniyada so'z toping", progress: 90, color: "from-teal-500 to-emerald-500" },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      {/* Animated Ocean Background */}
      <div className="fixed inset-0 -z-10">
        {/* Deep Ocean Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#020b1a] via-[#031f3c] to-[#04355f]" />
        
        {/* Animated Waves Layer */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1440 320\'%3E%3Cpath fill=\'%2300a8ff\' fill-opacity=\'0.3\' d=\'M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,170.7C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z\'%3E%3C/path%3E%3C/svg%3E')] bg-cover bg-bottom animate-wave" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1440 320\'%3E%3Cpath fill=\'%230088ff\' fill-opacity=\'0.3\' d=\'M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,208C672,213,768,203,864,176C960,149,1056,107,1152,106.7C1248,107,1344,149,1392,170.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z\'%3E%3C/path%3E%3C/svg%3E')] bg-cover bg-bottom animate-wave-slow" style={{ animationDelay: '1s' }} />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1440 320\'%3E%3Cpath fill=\'%230066cc\' fill-opacity=\'0.2\' d=\'M0,64L48,74.7C96,85,192,107,288,122.7C384,139,480,149,576,138.7C672,128,768,96,864,101.3C960,107,1056,149,1152,160C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z\'%3E%3C/path%3E%3C/svg%3E')] bg-cover bg-bottom animate-wave-slower" style={{ animationDelay: '2s' }} />
        </div>

        {/* Floating Bubbles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/5 backdrop-blur-sm animate-bubble"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${2 + Math.random() * 8}px`,
              height: `${2 + Math.random() * 8}px`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${8 + Math.random() * 7}s`,
              filter: `blur(${Math.random() * 2}px)`,
            }}
          />
        ))}

        {/* Light Rays */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(255,255,255,0.15)_0%,_transparent_50%)] animate-pulse-slow" />
      </div>

      <div 
        className="relative z-10 mx-auto min-h-screen w-full max-w-[2000px] px-4 py-6 md:px-6 md:py-8 lg:px-8 xl:px-10 motion-safe:animate-[fadeInUp_.35s_ease-out]"
      >
        {/* Hero Section */}
        <div
          className="group relative mb-8 transform-gpu overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-xl shadow-2xl md:p-8 lg:p-10"
        >
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-cyan-500/5 to-teal-500/5 animate-gradient" />
          
          {/* Decorative Elements */}
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl animate-pulse-slow" />
          <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />

          <div className="relative grid gap-8 lg:grid-cols-2 lg:gap-12 lg:items-center">
            {/* Left Content */}
            <div className="space-y-6">
              {/* Live Badge */}
              <div
                className="inline-flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-2 border border-white/10 backdrop-blur-sm"
              >
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-green-500" />
                  <div className="relative h-2 w-2 rounded-full bg-green-500" />
                </div>
                <span className="text-sm font-black bg-gradient-to-r from-blue-300 via-cyan-300 to-teal-300 bg-clip-text text-transparent">
                  OCEAN WORD FISHING
                </span>
                <IoWaterOutline className="text-blue-400 animate-float" />
              </div>

              {/* Title */}
              <h1
                className="text-4xl font-black leading-tight md:text-5xl lg:text-6xl"
              >
                <span className="bg-gradient-to-r from-blue-200 via-cyan-200 to-teal-200 bg-clip-text text-transparent">
                  Okean
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                  so'z baliqchiligi
                </span>
              </h1>

              {/* Description */}
              <p
                className="max-w-xl text-base text-blue-100/80 md:text-lg leading-relaxed"
              >
                Baliqlar ustidagi harflardan so'zlar yig'ing. Har bir baliqni bosib, 
                kerakli harflarni to'plang va so'zni toping. Okean sadosi bilan o'ynang!
              </p>

              {/* Stats Grid */}
              <div
                className="grid grid-cols-2 gap-3 md:gap-4"
              >
                {gameStats.map((stat, index) => (
                  <div
                    key={index}
                    className="group/stat relative transform-gpu overflow-hidden rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] p-4 backdrop-blur-sm border border-white/10"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${stat.bgColor} opacity-0 group-hover/stat:opacity-100 transition-opacity`} />
                    <div className="relative">
                      <div className={`mb-2 inline-flex rounded-lg bg-gradient-to-r ${stat.color} p-2.5`}>
                        <stat.icon className="text-lg text-white" />
                      </div>
                      <p className="text-xs font-bold text-blue-200/60">{stat.label}</p>
                      <p className="text-sm font-black text-white">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            <GamePagePlayButton
                to="/games/ocean-word-fishing/play"
                colorClassName="from-blue-500 to-cyan-500"
                className="pt-2"
              />
            </div>

            {/* Right Content - Image */}
            <div
              className="relative"
            >
              {/* Video/Image Container */}
              <div className="relative transform-gpu overflow-hidden rounded-2xl border-2 border-white/10 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-t from-[#020b1a] via-transparent to-transparent z-10" />
                
                {/* Ocean Video Background */}
                <div className="relative h-[350px] md:h-[450px] lg:h-[500px]">
                  <img 
                    src={oceanImg}
                    alt="Ocean Word Fishing"
                    className="h-full w-full object-cover"
                  />
                  
                  {/* Overlay Content */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-cyan-500/20" />
                  
                  {/* Floating Elements */}
                  <div className="absolute top-4 left-4 z-20 flex gap-2">
                    <div className="flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-3 py-1.5 border border-white/20">
                      <GiBubbles className="text-blue-300" />
                      <span className="text-xs font-bold text-white">LIVE</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-3 py-1.5 border border-white/20">
                      <GiCoral className="text-cyan-300" />
                      <span className="text-xs font-bold text-white">OCEAN</span>
                    </div>
                  </div>

                  {/* Bottom Stats */}
                  <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between">
                    <div className="rounded-xl bg-white/10 backdrop-blur-md px-4 py-2 border border-white/20">
                      <p className="text-xs text-blue-200">BALIQLAR</p>
                      <p className="text-lg font-black text-white">20+</p>
                    </div>
                    <div className="rounded-xl bg-white/10 backdrop-blur-md px-4 py-2 border border-white/20">
                      <p className="text-xs text-blue-200">HARFLAR</p>
                      <p className="text-lg font-black text-white">A-Z</p>
                    </div>
                    <div className="rounded-xl bg-white/10 backdrop-blur-md px-4 py-2 border border-white/20">
                      <p className="text-xs text-blue-200">SO'ZLAR</p>
                      <p className="text-lg font-black text-white">8+</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Badges */}
              <div
                className="absolute -right-4 -top-4 z-30"
              >
                <div className="rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 px-4 py-2 shadow-xl">
                  <p className="text-xs font-bold text-white/90">BONUS</p>
                  <p className="text-sm font-black text-white">x2 BALL</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div
          className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6"
        >
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative transform-gpu overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-sm transition-all"
            >
              {/* Hover Gradient */}
              <div className={`absolute inset-0 ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
              
              {/* Decorative Icon */}
              <feature.bgIcon className="absolute right-4 top-4 text-4xl text-white/5 group-hover:text-white/10 transition-all" />
              
              {/* Icon */}
              <div className={`relative mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r ${feature.color} text-white shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                <feature.icon className="text-2xl" />
              </div>
              
              {/* Content */}
              <h3 className="relative mb-2 text-lg font-black text-white">{feature.title}</h3>
              <p className="relative mb-4 text-sm text-blue-200/70">{feature.desc}</p>
              
              {/* Stats */}
              <div className="relative flex items-center gap-2">
                <span className="text-xs font-bold text-blue-300">{feature.stats}</span>
                <div className="h-1 flex-1 rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${feature.color}`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Ocean Levels */}
        <div
          className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6"
        >
          {oceanLevels.map((level, index) => (
            <div
              key={index}
              className="group relative transform-gpu overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-sm"
            >
              {/* Background Pattern */}
              <div className={`absolute inset-0 ${level.bgColor} opacity-30 group-hover:opacity-50 transition-opacity`} />
              
              {/* Icon */}
              <div
              >
                <level.icon className={`relative mx-auto mb-3 text-4xl bg-gradient-to-r ${level.color} bg-clip-text text-transparent`} />
              </div>
              
              {/* Title */}
              <h4 className="relative mb-2 text-center text-base font-black text-white">{level.level}</h4>
              <p className="relative mb-1 text-center text-xs text-blue-200/70">{level.words}</p>
              <p className="relative mb-4 text-center text-xs text-blue-200/70">{level.time}</p>
              
              {/* Progress Bar */}
              <div className="relative h-2 rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${level.color} transition-all group-hover:animate-pulse`}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Achievements Section */}
        <div
          className="mb-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-sm"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-black text-white">Yutuqlar</h3>
            <div className="flex items-center gap-2 text-xs text-blue-200/70">
              <GiAchievement className="text-blue-400" />
              <span>3/10</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <div className="flex items-start gap-3">
                  <div className={`rounded-lg bg-gradient-to-r ${achievement.color} p-2.5 text-white`}>
                    <achievement.icon className="text-xl" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-black text-white">{achievement.title}</h4>
                    <p className="text-xs text-blue-200/70">{achievement.desc}</p>
                    <div className="mt-2 h-1.5 rounded-full bg-white/10">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${achievement.color}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* OceanWordFishing Component Container */}
        <div
          className="relative"
        >
          <GameFeedbackPanel gameKey="ocean-word-fishing" />
        </div>

        {/* Footer */}
        <div
          className="relative mt-10 flex justify-center gap-6 text-5xl text-blue-500/20 md:text-6xl"
        >
          {[MdEmojiEvents, GiAchievement, FaCrown, GiPodium, FaStar].map((Icon, i) => (
            <div
              key={i}
            >
              <Icon className="hover:text-blue-400/40 transition-colors cursor-pointer" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default OceanWordFishingPage;