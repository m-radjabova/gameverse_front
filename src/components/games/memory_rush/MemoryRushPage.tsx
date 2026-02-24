import { 
  FaStar, FaUsers, FaTrophy, FaHeart, FaLayerGroup, FaBolt,
  FaCrown} from "react-icons/fa";
import { 
  GiBrain, GiPodium, GiBrainStem, GiAchievement,
  GiLeak} from "react-icons/gi";
import { 
  MdTimer, MdSpeed, MdStars, MdMemory,
  MdEmojiEvents} from "react-icons/md";
import { RiBrainFill} from "react-icons/ri";
import MemoryRush from "./MemoryRush";
import GameFeedbackPanel from "../shared/GameFeedbackPanel";

function MemoryRushPage() {
  const memoryRushImg = "https://media.istockphoto.com/id/1434154110/vector/reminder-yellow-note-circled.jpg?s=612x612&w=0&k=20&c=2mfjGFRNi7htNGB47t3fzlfg5mCGLQSfUXMoWBogWL0=";

  const gameStats = [
    { icon: FaUsers, label: "3.8k+ o'yinchi", value: "ONLINE", color: "from-emerald-400 to-teal-400" },
    { icon: MdTimer, label: "DAVOMIYLIK", value: "5-8 min", color: "from-teal-400 to-cyan-400" },
    { icon: GiBrain, label: "XOTIRA", value: "TREENING", color: "from-cyan-400 to-emerald-400" },
    { icon: FaTrophy, label: "REKORD", value: "800+ ball", color: "from-emerald-400 to-cyan-400" },
  ];

  const features = [
    { 
      icon: GiBrain, 
      title: "Xotira mashqi", 
      desc: "Kartochkalarni eslab qoling va juftini toping",
      color: "from-emerald-400 to-teal-400",
      bgIcon: GiBrainStem,
      stats: "12-20 karta"
    },
    { 
      icon: MdSpeed, 
      title: "Tezkor javob", 
      desc: "Vaqt chegarasi bilan xotirangizni sinang",
      color: "from-teal-400 to-cyan-400",
      bgIcon: FaBolt,
      stats: "3s preview"
    },
    { 
      icon: GiPodium, 
      title: "Reytinglar", 
      desc: "Eng kuchli xotira egalari bilan raqobat",
      color: "from-cyan-400 to-emerald-400",
      bgIcon: GiAchievement,
      stats: "Top 100"
    },
  ];

  const memoryLevels = [
    { level: "BOSHLANG'ICH", cards: "12 ta kartochka", time: "60 soniya", icon: FaStar, color: "from-emerald-400 to-teal-400", progress: 33 },
    { level: "O'RTA", cards: "16 ta kartochka", time: "90 soniya", icon: MdStars, color: "from-teal-400 to-cyan-400", progress: 66 },
    { level: "PROFESSIONAL", cards: "20 ta kartochka", time: "120 soniya", icon: GiBrain, color: "from-cyan-400 to-emerald-400", progress: 100 },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#0a1f1a] via-[#0f2e26] to-[#0a282f] [&_button]:cursor-pointer [&_button]:transition-all [&_button]:duration-200 [&_button:hover]:brightness-110 [&_button:disabled]:cursor-not-allowed">
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
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(16, 185, 129, 0.03) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />

        {/* Memory Icons Background */}
        <GiBrain className="absolute left-[5%] top-[15%] animate-float text-8xl text-emerald-500/5" />
        <MdMemory className="absolute right-[8%] bottom-[20%] animate-float-delayed text-7xl text-teal-500/5" />
        <RiBrainFill className="absolute left-[15%] bottom-[10%] animate-float-slow text-7xl text-cyan-500/5" />
        <GiLeak className="absolute right-[12%] top-[25%] animate-float text-8xl text-emerald-500/5" />
      </div>

      <div className="relative z-10 mx-auto min-h-screen w-full max-w-[2000px] px-4 py-6 md:px-6 md:py-8 lg:px-8 xl:px-10 motion-safe:animate-[fadeInUp_.35s_ease-out]">
        {/* Hero Section */}
        <div className="group relative mb-8 transform-gpu overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-900/40 via-teal-900/40 to-cyan-900/40 p-6 backdrop-blur-xl shadow-2xl md:p-8 lg:p-10">
          {/* Animated Gradient Border */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-500/30 via-teal-500/30 to-cyan-500/30" />
          </div>

          <div className="relative grid gap-8 lg:grid-cols-2 lg:gap-12 lg:items-center">
            {/* Left Content */}
            <div className="space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 px-4 py-2 border border-emerald-500/30">
                <MdMemory className="text-emerald-400 animate-pulse" />
                <span className="text-sm font-black text-transparent bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text">
                  MEMORY RUSH CHALLENGE
                </span>
                <div className="ml-2 flex h-2 w-2">
                  <span className="absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-4xl font-black leading-tight md:text-5xl lg:text-6xl">
                <span className="bg-gradient-to-r from-emerald-200 via-teal-200 to-cyan-200 bg-clip-text text-transparent">
                  Xotirangizni
                </span>
                <br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  charxlang
                </span>
              </h1>

              {/* Description */}
              <p className="max-w-xl text-base text-gray-300 md:text-lg leading-relaxed">
                Kartochkalarni eslab qoling, juftlarini toping va eng yuqori natijaga erishing. 
                Xotirangizni sinash va rivojlantirish uchun ajoyib imkoniyat!
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
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-emerald-500/30 via-teal-500/30 to-cyan-500/30 blur-2xl animate-pulse" />
              <div className="absolute -top-6 -right-6 h-32 w-32 rounded-full bg-emerald-500/20 blur-xl" />
              
              {/* Image Container */}
              <div className="relative transform-gpu overflow-hidden rounded-2xl border-2 border-white/20 shadow-2xl transition-all group-hover:scale-[1.02] group-hover:border-white/30">
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a1f1a] via-transparent to-transparent z-10" />
                <img 
                  src={memoryRushImg} 
                  alt="Memory Rush Game" 
                  className="h-[300px] w-full object-cover md:h-[400px] lg:h-[450px]"
                />
                
                {/* Overlay Content */}
                <div className="absolute bottom-0 left-0 right-0 z-20 p-6">
                  <div className="inline-flex items-center gap-3 rounded-2xl bg-black/50 backdrop-blur-md px-4 py-2 border border-white/10">
                    <GiBrain className="text-emerald-400" />
                    <span className="text-sm font-black text-white">XOTIRA O'YINI</span>
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
                    3 DARAJA
                  </div>
                  <div className="rounded-full bg-gradient-to-r from-teal-600 to-cyan-600 px-3 py-1 text-xs font-bold text-white shadow-lg">
                    AKTIV 98%
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
                  <div className={`h-full rounded-full bg-gradient-to-r ${feature.color}`} style={{ width: '70%' }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Memory Levels */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          {memoryLevels.map((level, index) => (
            <div
              key={index}
              className="group relative transform-gpu overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-6 backdrop-blur-sm transition-all hover:border-white/20"
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-r ${level.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
              
              {/* Icon */}
              <level.icon className={`relative mx-auto mb-3 text-4xl bg-gradient-to-r ${level.color} bg-clip-text text-transparent`} />
              
              {/* Title */}
              <h4 className="relative mb-2 text-center text-base font-black text-white">{level.level}</h4>
              <p className="relative mb-1 text-center text-xs text-gray-400">{level.cards}</p>
              <p className="relative mb-4 text-center text-xs text-gray-400">{level.time}</p>
              
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

        {/* Memory Rush Component Container */}
        <div className="relative">
          {/* Decorative Elements */}
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 blur-3xl" />
          
          {/* Main Game Container */}
          <div className="relative transform-gpu overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-900/30 via-teal-900/30 to-cyan-900/30 p-6 backdrop-blur-xl shadow-2xl md:p-8">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute -inset-1 animate-pulse rounded-xl bg-emerald-500/50 blur" />
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500">
                    <MdMemory className="text-2xl text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">Memory Rush</h2>
                  <p className="flex items-center gap-2 text-sm text-gray-300">
                    <RiBrainFill className="text-emerald-400" />
                    Xotirangizni sinang · Juftlarni toping
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5">
                  <FaLayerGroup className="text-emerald-400" />
                  <span className="text-xs font-bold text-white">3 daraja</span>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5">
                  <FaHeart className="text-teal-400" />
                  <span className="text-xs font-bold text-white">5 hayot</span>
                </div>
              </div>
            </div>

            {/* MemoryRush Component */}
                        <GameFeedbackPanel gameKey="memory-rush" />
            <MemoryRush />
          </div>
        </div>

        {/* Footer */}
        <div className="relative mt-10 flex justify-center gap-6 text-5xl text-white/10 md:text-6xl">
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

export default MemoryRushPage;




