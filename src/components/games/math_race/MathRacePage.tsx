import { 
  FaCar, 
  FaCrown, 
  FaStar, 
  FaUsers,  
  FaBolt,
  FaFlagCheckered,
  FaRoad,
  FaGaugeHigh,
  FaRocket,
  FaCarBattery
} from "react-icons/fa6";
import { 
  GiAchievement, 
  GiPodium, 
  GiRaceCar, 
  GiCarWheel,
  GiSpeedometer,
  GiSteeringWheel,
  GiFinishLine
} from "react-icons/gi";
import { 
  MdTimer, 
  MdEmojiEvents, 
  MdSpeed,
  MdNumbers
} from "react-icons/md";
import { 
  IoFlashOutline
} from "react-icons/io5";
import MathRace from "./MathRace";
import GameFeedbackPanel from "../shared/GameFeedbackPanel";

function MathRacePage() {
  const raceImg = "https://media.istockphoto.com/id/1409623927/vector/formula-racing-sport-car-reach-on-race-circuit-the-finish-line-cartoon-illustration-to-win.jpg?s=612x612&w=0&k=20&c=n5leemMDNJv1g_EFkTJxW9T5XiVQXx0CIA6R2z6Op1U="
  const gameStats = [
    { icon: FaUsers, label: "O'YINCHILAR", value: "2 kishi", color: "from-amber-400 to-orange-400", bgColor: "from-amber-600/30 to-orange-600/30" },
    { icon: MdTimer, label: "DAVOMIYLIK", value: "5-10 min", color: "from-orange-400 to-red-400", bgColor: "from-orange-600/30 to-red-600/30" },
    { icon: GiRaceCar, label: "MASHINALAR", value: "2 ta", color: "from-red-400 to-rose-400", bgColor: "from-red-600/30 to-rose-600/30" },
    { icon: MdNumbers, label: "MISOLLAR", value: "10+ ta", color: "from-amber-400 to-red-400", bgColor: "from-amber-600/30 to-red-600/30" },
  ];

  const features = [
    { 
      icon: GiRaceCar, 
      title: "Tezkor poyga", 
      desc: "Har to'g'ri javobda mashinangiz oldinga yuradi",
      color: "from-amber-400 to-orange-400",
      bgIcon: FaCarBattery,
      stats: "8% harakat",
      gradient: "bg-gradient-to-br from-amber-500/20 to-orange-500/20"
    },
    { 
      icon: MdSpeed, 
      title: "Vaqt bonusi", 
      desc: "Tez javob bersangiz, qo'shimcha harakat",
      color: "from-orange-400 to-red-400",
      bgIcon: IoFlashOutline,
      stats: "0.2x vaqt",
      gradient: "bg-gradient-to-br from-orange-500/20 to-red-500/20"
    },
    { 
      icon: FaFlagCheckered, 
      title: "Marraga birinchi yeting", 
      desc: "100% masofani birinchi bosib o'ting",
      color: "from-red-400 to-rose-400",
      bgIcon: GiFinishLine,
      stats: "100% track",
      gradient: "bg-gradient-to-br from-red-500/20 to-rose-500/20"
    },
  ];

  const raceLevels = [
    { level: "OSON", questions: "5 + 5", time: "20 soniya", icon: FaStar, color: "from-emerald-400 to-green-400", progress: 33, bgColor: "bg-emerald-500/20" },
    { level: "O'RTACHA", questions: "7 ? 6", time: "15 soniya", icon: FaGaugeHigh, color: "from-amber-400 to-orange-400", progress: 66, bgColor: "bg-amber-500/20" },
    { level: "QIYIN", questions: "12 ? 12", time: "10 soniya", icon: FaCrown, color: "from-red-400 to-rose-400", progress: 100, bgColor: "bg-red-500/20" },
  ];

  const achievements = [
    { icon: GiAchievement, title: "Poyga ustasi", desc: "10 ta poygada g'alaba", progress: 70, color: "from-amber-400 to-orange-400" },
    { icon: FaCrown, title: "Chempion", desc: "50 ta misol ishlang", progress: 45, color: "from-orange-400 to-red-400" },
    { icon: FaStar, title: "Tezkor starter", desc: "3 soniyada javob bering", progress: 90, color: "from-red-400 to-rose-400" },
  ];

  const cars = [
    { name: "Qizil raketa", speed: 280, icon: FaCar, color: "from-red-500 to-rose-500", wins: 145 },
    { name: "Sariq chaqmoq", speed: 275, icon: FaBolt, color: "from-amber-500 to-yellow-500", wins: 132 },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      {/* Race Track Background */}
      <div className="fixed inset-0 -z-10">
        {/* Asphalt Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
        
        {/* Track Lines */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute left-0 right-0 top-1/4 h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
          <div className="absolute left-0 right-0 top-2/4 h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent" />
          <div className="absolute left-0 right-0 top-3/4 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent" />
        </div>

        {/* Moving Light Effect */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -inset-10 opacity-30">
            <div className="absolute top-0 h-full w-40 bg-gradient-to-r from-transparent via-white to-transparent animate-sweep" />
          </div>
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
        
        {/* Speed Lines */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent animate-speed-line"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${50 + Math.random() * 200}px`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div 
        className="relative z-10 mx-auto min-h-screen w-full max-w-[2000px] px-4 py-6 md:px-6 md:py-8 lg:px-8 xl:px-10 motion-safe:animate-[fadeInUp_.35s_ease-out]"
      >
        {/* Hero Section */}
        <div
          className="group relative mb-8 transform-gpu overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-xl shadow-2xl md:p-8 lg:p-10"
        >
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-red-500/5 animate-gradient" />
          
          {/* Decorative Elements */}
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-amber-500/20 blur-3xl animate-pulse-slow" />
          <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-red-500/20 blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />

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
                <span className="text-sm font-black bg-gradient-to-r from-amber-300 via-orange-300 to-red-300 bg-clip-text text-transparent">
                  MATH RACE
                </span>
                <GiSteeringWheel className="text-amber-400 animate-spin-slow" />
              </div>

              {/* Title */}
              <h1
                className="text-4xl font-black leading-tight md:text-5xl lg:text-6xl"
              >
                <span className="bg-gradient-to-r from-amber-200 via-orange-200 to-red-200 bg-clip-text text-transparent">
                  Matematik
                </span>
                <br />
                <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                  poyga
                </span>
              </h1>

              {/* Description */}
              <p
                className="max-w-xl text-base text-gray-300 md:text-lg leading-relaxed"
              >
                Ikki o'yinchi tezkor misol ishlash musobaqasida qatnashing. 
                Kim tez va to'g'ri javob bersa, uning mashinasi oldinga yuradi!
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
                      <p className="text-xs font-bold text-gray-400">{stat.label}</p>
                      <p className="text-sm font-black text-white">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Content - Image */}
            <div
              className="relative"
            >
              {/* Image Container */}
              <div className="relative transform-gpu overflow-hidden rounded-2xl border-2 border-white/10 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10" />
                
                <div className="relative h-[350px] md:h-[450px] lg:h-[500px]">
                  <img 
                    src={raceImg}
                    alt="Math Race"
                    className="h-full w-full object-cover"
                  />
                  
                  {/* Overlay Effects */}
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-transparent to-red-500/20" />
                  
                  {/* Floating Elements */}
                  <div className="absolute top-4 left-4 z-20 flex gap-2">
                    <div
                      className="flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-3 py-1.5 border border-white/20"
                    >
                      <FaRocket className="text-amber-300" />
                      <span className="text-xs font-bold text-white">READY</span>
                    </div>
                    <div
                      className="flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-3 py-1.5 border border-white/20"
                    >
                      <FaCarBattery className="text-orange-300" />
                      <span className="text-xs font-bold text-white">TURBO</span>
                    </div>
                  </div>

                  {/* Car Stats */}
                  <div className="absolute bottom-4 left-4 right-4 z-20">
                    <div className="grid grid-cols-2 gap-3">
                      {cars.map((car, index) => (
                        <div key={index} className="rounded-xl bg-white/10 backdrop-blur-md p-3 border border-white/20">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`rounded-lg bg-gradient-to-r ${car.color} p-1.5`}>
                              <car.icon className="text-white text-sm" />
                            </div>
                            <span className="text-xs font-bold text-white">{car.name}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-300">{car.speed} km/h</span>
                            <span className="text-amber-400">{car.wins} g'alaba</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Right Badge */}
                  <div
                    className="absolute top-4 right-4 z-20"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-500">
                      <GiSteeringWheel className="text-2xl text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Badges */}
              <div
                className="absolute -right-4 -top-4 z-30"
              >
                <div className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 shadow-xl">
                  <p className="text-xs font-bold text-white/90">BONUS</p>
                  <p className="text-sm font-black text-white">2x TEZLIK</p>
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
              <p className="relative mb-4 text-sm text-gray-300">{feature.desc}</p>
              
              {/* Stats */}
              <div className="relative flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400">{feature.stats}</span>
                <div className="h-1 flex-1 rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${feature.color}`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Difficulty Levels */}
        <div
          className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6"
        >
          {raceLevels.map((level, index) => (
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
              <p className="relative mb-1 text-center text-xs text-gray-400">{level.questions}</p>
              <p className="relative mb-4 text-center text-xs text-gray-400">{level.time}</p>
              
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
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <GiAchievement className="text-amber-400" />
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
                    <p className="text-xs text-gray-400">{achievement.desc}</p>
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

        {/* MathRace Component Container */}
        <div
          className="relative"
        >
          {/* Decorative Elements */}
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-red-500/5 blur-3xl" />
          
          {/* Main Game Container */}
          <div className="relative transform-gpu overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-xl shadow-2xl md:p-8">
            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div className="flex items-center gap-4">
                <div
                  className="relative"
                >
                  <div className="absolute -inset-1 animate-pulse rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 blur" />
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-r from-amber-600 to-orange-600">
                    <GiRaceCar className="text-2xl text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">Math Race</h2>
                  <p className="flex items-center gap-2 text-sm text-gray-300">
                    <GiCarWheel className="text-amber-400" />
                    Tezkor misollar · 2 o'yinchi
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 border border-white/10"
                >
                  <FaRoad className="text-amber-400" />
                  <span className="text-xs font-bold text-white">100% track</span>
                </div>
                <div
                  className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 border border-white/10"
                >
                  <GiSpeedometer className="text-orange-400" />
                  <span className="text-xs font-bold text-white">15s</span>
                </div>
              </div>
            </div>

            {/* MathRace Component */}
                        <GameFeedbackPanel gameKey="math-race" />
            <MathRace />
          </div>
        </div>

        {/* Footer */}
        <div
          className="relative mt-10 flex justify-center gap-6 text-5xl text-amber-500/20 md:text-6xl"
        >
          {[MdEmojiEvents, GiAchievement, FaCrown, GiPodium, FaStar].map((Icon, i) => (
            <div
              key={i}
            >
              <Icon className="hover:text-amber-400/40 transition-colors cursor-pointer" />
            </div>
          ))}
        </div>
      </div>
      
      <style>{`
        @keyframes sweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(500%); }
        }
        
        @keyframes speed-line {
          0% { transform: translateX(-100%) scaleX(0); opacity: 0; }
          50% { transform: translateX(0%) scaleX(1); opacity: 1; }
          100% { transform: translateX(100%) scaleX(0); opacity: 0; }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .animate-sweep {
          animation: sweep 8s linear infinite;
        }
        
        .animate-speed-line {
          animation: speed-line 3s ease-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 10s ease infinite;
        }
        
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default MathRacePage;

