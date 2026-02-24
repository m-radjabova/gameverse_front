import { FaUsers, FaTrophy, FaClock, FaBolt } from "react-icons/fa";
import { GiPuzzle, GiBrain, GiAchievement, GiPodium, GiConsoleController} from "react-icons/gi";
import { MdGames, MdSportsEsports, MdTimer, MdSpeed, MdEmojiEvents } from "react-icons/md";
import { RiTeamFill} from "react-icons/ri";
import ClassicArcade from "./ClassicArcade";
import GameFeedbackPanel from "../shared/GameFeedbackPanel";

function ClassicArcadePage() {
  const classicArcadeImg =
    "https://media.istockphoto.com/id/1582151789/vector/vector-arcade-premium-alphabet-in-purple-violet-blue-colors-vector-3d-font-text-elements.jpg?s=612x612&w=0&k=20&c=x6f1QrMBy4O6ac6IFTWDG13A9D3vQFK8cIPXGrvA6aA=";

  const gameStats = [
    { icon: FaUsers, label: "2 GURUH", value: "JAMOAVIY", color: "from-fuchsia-400 to-pink-400" },
    { icon: MdTimer, label: "DAVOMIYLIK", value: "5-15 min", color: "from-rose-400 to-red-400" },
    { icon: GiBrain, label: "TUR", value: "MANTIQIY", color: "from-orange-400 to-amber-400" },
    { icon: FaTrophy, label: "MUKOFOT", value: "CHALLENGE", color: "from-yellow-400 to-amber-400" },
  ];

  const features = [
    {
      icon: GiPuzzle,
      title: "Mini Challenge'lar",
      desc: "Har xil mantiqiy topshiriqlar",
      color: "from-fuchsia-500 to-pink-500",
      bgIcon: GiBrain,
      stats: "12+ tur",
    },
    {
      icon: GiAchievement,
      title: "Guruhli o'yin",
      desc: "2 guruh bellashuvi",
      color: "from-rose-500 to-red-500",
      bgIcon: RiTeamFill,
      stats: "2 jamoa",
    },
    {
      icon: MdSpeed,
      title: "Tezkor javob",
      desc: "Vaqt chegarasi bilan",
      color: "from-orange-500 to-amber-500",
      bgIcon: FaBolt,
      stats: "20s round",
    },
  ];

  const challengeLevels = [
    { name: "BOSHLANG'ICH", icon: GiBrain, desc: "Yengil savollar", color: "from-fuchsia-400 to-pink-400", progress: 33 },
    { name: "O'RTA", icon: GiPuzzle, desc: "Aralash challenge", color: "from-rose-400 to-red-400", progress: 66 },
    { name: "KUCHLI", icon: FaTrophy, desc: "Tezkor bosim", color: "from-orange-400 to-amber-400", progress: 100 },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#140214] via-[#2d0a2a] to-[#1f0a18] [&_button]:cursor-pointer [&_button]:transition-all [&_button]:duration-200 [&_button:hover]:brightness-110 [&_button:disabled]:cursor-not-allowed">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] animate-pulse rounded-full bg-fuchsia-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] animate-pulse rounded-full bg-rose-600/20 blur-3xl delay-1000" />
        <div className="absolute top-1/3 left-1/3 h-[500px] w-[500px] animate-pulse rounded-full bg-orange-600/10 blur-3xl delay-500" />
        
        {/* Floating Particles */}
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="absolute h-1.5 w-1.5 rounded-full bg-white/20 animate-float"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
              opacity: 0.2 + Math.random() * 0.4
            }}
          />
        ))}

        {/* Grid Pattern */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />

        {/* Gaming Icons Background */}
        <MdSportsEsports className="absolute left-[5%] top-[15%] animate-float text-8xl text-white/5" />
        <GiPuzzle className="absolute right-[8%] bottom-[20%] animate-float-delayed text-7xl text-white/5" />
        <FaTrophy className="absolute left-[15%] bottom-[10%] animate-float-slow text-7xl text-white/5" />
        <GiBrain className="absolute right-[12%] top-[25%] animate-float text-8xl text-white/5" />
      </div>

      <div className="relative z-10 mx-auto min-h-screen w-full max-w-[2000px] px-4 py-6 md:px-6 md:py-8 lg:px-8 xl:px-10 motion-safe:animate-[fadeInUp_.35s_ease-out]">
        {/* Hero Section */}
        <div className="group relative mb-8 transform-gpu overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-fuchsia-900/40 via-rose-900/40 to-orange-900/40 p-6 backdrop-blur-xl shadow-2xl md:p-8 lg:p-10">
          {/* Animated Gradient Border */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-fuchsia-500/30 via-rose-500/30 to-orange-500/30 animate-gradient" />
          </div>

          <div className="relative grid gap-8 lg:grid-cols-2 lg:gap-12 lg:items-center">
            {/* Left Content */}
            <div className="space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-fuchsia-500/20 to-rose-500/20 px-4 py-2 border border-fuchsia-500/30">
                <GiConsoleController className="text-fuchsia-400 animate-pulse" />
                <span className="text-sm font-black text-transparent bg-gradient-to-r from-fuchsia-400 via-rose-400 to-orange-400 bg-clip-text">
                  CLASSIC ARCADE CHALLENGE
                </span>
                <div className="ml-2 flex h-2 w-2">
                  <span className="absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-4xl font-black leading-tight md:text-5xl lg:text-6xl">
                <span className="bg-gradient-to-r from-fuchsia-200 via-rose-200 to-orange-200 bg-clip-text text-transparent">
                  Mantiqiy
                </span>
                <br />
                <span className="bg-gradient-to-r from-fuchsia-400 via-rose-400 to-orange-400 bg-clip-text text-transparent">
                  mini challenge
                </span>
              </h1>

              {/* Description */}
              <p className="max-w-xl text-base text-gray-300 md:text-lg leading-relaxed">
                O'qituvchi oldindan challenge qo'shadi, keyin guruhlar navbat bilan o'ynaydi. 
                Har xil mantiqiy topshiriqlar va tezkor javoblar.
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {gameStats.map((stat, index) => (
                  <div
                    key={index}
                    className="group/stat relative transform-gpu overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-all hover:scale-105 hover:bg-white/10"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover/stat:opacity-20 transition-opacity`} />
                    <div className="relative">
                      <div className={`mb-2 inline-flex rounded-lg bg-gradient-to-r ${stat.color} p-2`}>
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
            <div className="relative">
              {/* Decorative Elements */}
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-fuchsia-500/30 via-rose-500/30 to-orange-500/30 blur-2xl animate-pulse" />
              <div className="absolute -top-6 -right-6 h-32 w-32 rounded-full bg-fuchsia-500/20 blur-xl" />
              
              {/* Image Container */}
              <div className="relative transform-gpu overflow-hidden rounded-2xl border-2 border-white/20 shadow-2xl transition-all group-hover:scale-[1.02] group-hover:border-white/30">
                <div className="absolute inset-0 bg-gradient-to-t from-[#140214] via-transparent to-transparent z-10" />
                <img 
                  src={classicArcadeImg} 
                  alt="Classic Arcade Game" 
                  className="h-[300px] w-full object-cover md:h-[400px] lg:h-[450px]"
                />
                
                {/* Overlay Content */}
                <div className="absolute bottom-0 left-0 right-0 z-20 p-6">
                  <div className="inline-flex items-center gap-3 rounded-2xl bg-black/50 backdrop-blur-md px-4 py-2 border border-white/10">
                    <GiPuzzle className="text-fuchsia-400" />
                    <span className="text-sm font-black text-white">ARCADE CHALLENGE</span>
                    <div className="ml-2 flex gap-1">
                      <span className="h-2 w-2 rounded-full bg-fuchsia-400 animate-pulse" />
                      <span className="h-2 w-2 rounded-full bg-rose-400 animate-pulse delay-150" />
                      <span className="h-2 w-2 rounded-full bg-orange-400 animate-pulse delay-300" />
                    </div>
                  </div>
                </div>

                {/* Floating Badges */}
                <div className="absolute top-4 right-4 z-20 flex gap-2">
                  <div className="rounded-full bg-gradient-to-r from-fuchsia-600 to-rose-600 px-3 py-1 text-xs font-bold text-white shadow-lg">
                    3 DARAJA
                  </div>
                  <div className="rounded-full bg-gradient-to-r from-rose-600 to-orange-600 px-3 py-1 text-xs font-bold text-white shadow-lg">
                    LIVE
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
              className="group relative transform-gpu overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-6 backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:border-white/20"
            >
              {/* Animated Background */}
              <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
              
              {/* Decorative Icon */}
              <feature.bgIcon className="absolute right-2 top-2 text-4xl text-white/10 group-hover:text-white/20 transition-all group-hover:scale-110" />
              
              {/* Icon */}
              <div className={`relative mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r ${feature.color} text-white shadow-xl transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                <feature.icon className="text-2xl" />
              </div>
              
              {/* Content */}
              <h3 className="relative mb-2 text-lg font-black text-white">{feature.title}</h3>
              <p className="relative mb-3 text-sm text-gray-300">{feature.desc}</p>
              
              {/* Stats */}
              <div className="relative flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400">{feature.stats}</span>
                <div className="h-1 flex-1 rounded-full bg-white/10">
                  <div className={`h-full rounded-full bg-gradient-to-r ${feature.color}`} style={{ width: '60%' }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Challenge Levels */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          {challengeLevels.map((level, index) => (
            <div
              key={index}
              className="group relative transform-gpu overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-6 backdrop-blur-sm transition-all hover:border-white/20"
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-r ${level.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
              
              {/* Icon */}
              <level.icon className={`relative mx-auto mb-3 text-4xl bg-gradient-to-r ${level.color} bg-clip-text text-transparent`} />
              
              {/* Title */}
              <h4 className="relative mb-2 text-center text-base font-black text-white">{level.name}</h4>
              <p className="relative mb-4 text-center text-xs text-gray-400">{level.desc}</p>
              
              {/* Progress Bar */}
              <div className="relative h-2 rounded-full bg-white/10">
                <div 
                  className={`h-full rounded-full bg-gradient-to-r ${level.color} transition-all group-hover:animate-pulse`}
                  style={{ width: `${level.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Game Component Container */}
        <div className="relative">
          {/* Decorative Elements */}
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-fuchsia-500/20 via-rose-500/20 to-orange-500/20 blur-3xl" />
          
          {/* Main Game Container */}
          <div className="relative transform-gpu overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-fuchsia-900/30 via-rose-900/30 to-orange-900/30 p-6 backdrop-blur-xl shadow-2xl md:p-8">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute -inset-1 animate-pulse rounded-xl bg-fuchsia-500/50 blur" />
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-r from-fuchsia-500 to-rose-500">
                    <MdSportsEsports className="text-2xl text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">Classic Arcade</h2>
                  <p className="flex items-center gap-2 text-sm text-gray-300">
                    <RiTeamFill className="text-fuchsise-400" />
                    Guruhli bellashuv · Navbat bilan o'ynash
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5">
                  <FaClock className="text-rose-400" />
                  <span className="text-xs font-bold text-white">5-15 min</span>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5">
                  <GiAchievement className="text-fuchsia-400" />
                  <span className="text-xs font-bold text-white">Challenge</span>
                </div>
              </div>
            </div>

            {/* ClassicArcade Component */}
                        <GameFeedbackPanel gameKey="classic-arcade" />
            <ClassicArcade />
          </div>
        </div>

        {/* Footer */}
        <div className="relative mt-10 flex justify-center gap-6 text-5xl text-white/10 md:text-6xl">
          <MdEmojiEvents className="animate-bounce" style={{ animationDelay: '0s' }} />
          <GiAchievement className="animate-bounce" style={{ animationDelay: '0.2s' }} />
          <FaTrophy className="animate-bounce" style={{ animationDelay: '0.4s' }} />
          <GiPodium className="animate-bounce" style={{ animationDelay: '0.6s' }} />
          <MdGames className="animate-bounce" style={{ animationDelay: '0.8s' }} />
        </div>
      </div>
    </div>
  );
}

export default ClassicArcadePage;




