import { FaBolt, FaPuzzlePiece, FaUsers, FaRocket, FaStar } from "react-icons/fa";
import { MdTimer, MdOutlineLeaderboard} from "react-icons/md";
import { RiSwordFill } from "react-icons/ri";
import { GiBrain, GiLightBulb, GiSwordsEmblem } from "react-icons/gi";
import WordBattle from "./WordBattle";
import GameFeedbackPanel from "../shared/GameFeedbackPanel";

function WordBattlePage() {
  const bannerImg =
    "https://images.unsplash.com/photo-1611996575749-79a3a250f948?auto=format&fit=crop&w=1200&q=80";

  const stats = [
    { icon: FaUsers, label: "2 JAMOA", color: "from-blue-500 to-cyan-500" },
    { icon: MdTimer, label: "35s RAUND", color: "from-yellow-500 to-orange-500" },
    { icon: FaPuzzlePiece, label: "SO'Z TOPISH", color: "from-green-500 to-emerald-500" },
    { icon: MdOutlineLeaderboard, label: "LIVE SCORE", color: "from-purple-500 to-pink-500" },
  ];

  const features = [
    { icon: GiBrain, text: "Mantiqiy fikrlash" },
    { icon: GiLightBulb, text: "Tez javob" },
    { icon: GiSwordsEmblem, text: "Jamoaviy duel" },
    { icon: FaRocket, text: "Real vaqt" },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#0a0618] via-[#1a0f2a] to-[#0f1a2a] [&_button]:cursor-pointer [&_button]:transition-all [&_button]:duration-200 [&_button:hover]:brightness-110 [&_button:disabled]:cursor-not-allowed">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] animate-pulse rounded-full bg-purple-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] animate-pulse rounded-full bg-blue-600/20 blur-3xl delay-1000" />
        <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-cyan-600/10 blur-3xl" />
        
        {/* Floating Particles */}
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-white/30 animate-float"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
              opacity: 0.3 + Math.random() * 0.5
            }}
          />
        ))}

        {/* Grid Lines */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 mx-auto min-h-screen w-full max-w-[2000px] px-4 py-6 md:px-6 md:py-8 lg:px-8 xl:px-10 motion-safe:animate-[fadeInUp_.35s_ease-out]">
        {/* Hero Section */}
        <div className="group relative mb-8 transform-gpu overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1a1f35]/90 via-[#1f2a45]/90 to-[#1a2f3f]/90 p-6 backdrop-blur-xl shadow-2xl transition-all hover:shadow-3xl md:p-8 lg:p-10">
          {/* Animated Border */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-500/30 via-purple-500/30 to-pink-500/30 animate-gradient" />
          </div>

          <div className="relative grid gap-8 lg:grid-cols-2 lg:gap-12 lg:items-center">
            {/* Left Content */}
            <div className="space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 px-4 py-2 border border-yellow-500/30">
                <RiSwordFill className="text-yellow-400 animate-pulse" />
                <span className="text-sm font-black text-transparent bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text">
                  WORD BATTLE ARENA
                </span>
                <div className="ml-2 flex h-2 w-2">
                  <span className="absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-4xl font-black leading-tight md:text-5xl lg:text-6xl">
                <span className="bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent">
                  Puzzle your mind
                </span>
                <br />
                <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                  guruh o'yini
                </span>
              </h1>

              {/* Description */}
              <p className="max-w-xl text-base text-gray-300 md:text-lg leading-relaxed">
                Elektron doska uchun yirik tugmalar, navbatli harf tanlash 
                va real vaqt natijasi. Jamoa bo'lib o'ynang va g'olib bo'ling!
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {stats.map((item) => (
                  <div
                    key={item.label}
                    className="group/stat relative transform-gpu overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-all hover:scale-105 hover:bg-white/10"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 group-hover/stat:opacity-20 transition-opacity`} />
                    <div className="relative">
                      <div className={`mb-2 inline-flex rounded-lg bg-gradient-to-r ${item.color} p-2`}>
                        <item.icon className="text-lg text-white" />
                      </div>
                      <p className="text-xs font-bold text-gray-400">{item.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-3 pt-4">
                {features.map((feature) => (
                  <div
                    key={feature.text}
                    className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 border border-white/10"
                  >
                    <feature.icon className="text-sm text-cyan-400" />
                    <span className="text-xs font-medium text-gray-300">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Content - Image */}
            <div className="relative">
              {/* Decorative Elements */}
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-cyan-500/30 via-purple-500/30 to-pink-500/30 blur-2xl animate-pulse" />
              <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-yellow-500/20 blur-xl" />
              
              {/* Image Container */}
              <div className="relative transform-gpu overflow-hidden rounded-2xl border-2 border-white/20 shadow-2xl transition-all ">
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0618] via-transparent to-transparent z-10" />
                <img 
                  src={bannerImg} 
                  alt="Word Battle Arena" 
                  className="h-[300px] w-full object-cover md:h-[400px] lg:h-[450px]"
                />
                
                {/* Overlay Content */}
                <div className="absolute bottom-0 left-0 right-0 z-20 p-6">
                  <div className="inline-flex items-center gap-3 rounded-2xl bg-black/50 backdrop-blur-md px-4 py-2 border border-white/10">
                    <FaBolt className="text-yellow-400" />
                    <span className="text-sm font-black text-white">SMART BOARD MODE</span>
                    <div className="ml-2 h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                  </div>
                </div>

                {/* Floating Badges */}
                <div className="absolute top-4 right-4 z-20 flex gap-2">
                  <div className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1 text-xs font-bold text-white shadow-lg">
                    #1 GAME
                  </div>
                  <div className="rounded-full bg-gradient-to-r from-yellow-600 to-orange-600 px-3 py-1 text-xs font-bold text-white shadow-lg">
                    NEW
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Game Component */}
        <div className="relative">
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 blur-3xl" />
          <div className="relative">
                        <GameFeedbackPanel gameKey="word-battle" />
            <WordBattle />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 border border-white/10">
            <FaStar className="text-yellow-400" />
            <span className="text-xs text-gray-400">
              © 2026 WORD BATTLE ARENA | BARCHA HUQUQLAR HIMOYALANGAN
            </span>
            <FaStar className="text-yellow-400" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default WordBattlePage;




