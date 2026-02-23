import { FaStar, FaPlus, FaArrowLeft, FaArrowRight, FaRegSmile, FaMeh, FaSurprise, FaCloud } from "react-icons/fa";
import { GiPlanetCore, GiSparkles, GiOrbit, GiBookshelf, GiBrain, GiTrophy } from "react-icons/gi";
import { HiOutlineAcademicCap } from "react-icons/hi";
import trialCharacter from "../../assets/trialSection.png";
import { useNavigate } from "react-router-dom";

const features = [
  {
    title: "O‘QISH HAM O‘YINDEK\nQIZIQ",
    text: "QIZIQARLI MASHQLAR ORQALI \n OSSON O'RGANING",
    mood: "smile" as const,
  },
  {
    title: "SINFXONADA HAM AJOYIB",
    text: "DOSKADA VA PROYEKTORDA \n ISHLATISH UCHUN HAM QULAY.",
    mood: "neutral" as const,
  },
  {
    title: "ISTALGAN PAYT O'YNASH MUMKIN",
    text: "UYDA HAM, MAKTABDA HAM...",
    mood: "shock" as const,
  },
];

function TrialSection() {
  const navigate = useNavigate();
  return (
    <section
      className={`section-reveal relative min-h-screen overflow-hidden bg-transparent py-16 lg:py-24`}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Left to Right floating icons */}
        <div className="absolute top-[10%] left-[-100px] animate-float">
          <GiBookshelf className="text-8xl text-white/10 hover:text-white/20 transition-all duration-1000" />
        </div>
        <div className="absolute top-[30%] right-[-100px] animate-float-delayed">
          <HiOutlineAcademicCap className="text-9xl text-white/10 hover:text-white/20 transition-all duration-1000" />
        </div>
        <div className="absolute bottom-[20%] left-[-150px] animate-float-slow">
          <GiBrain className="text-8xl text-white/10 hover:text-white/20 transition-all duration-1000" />
        </div>
        <div className="absolute bottom-[40%] right-[-120px] animate-bounce-slow">
          <GiTrophy className="text-9xl text-[#ffd700]/20 hover:text-[#ffd700]/30 transition-all duration-1000" />
        </div>

        {/* Additional floating elements */}
        <div className="absolute top-20 left-10 animate-float-slow">
          <GiSparkles className="text-8xl text-white/10" />
        </div>
        <div className="absolute bottom-40 right-20 animate-bounce-slow">
          <GiOrbit className="text-9xl text-white/5" />
        </div>
      </div>

      <BgStickers />

      <div className="relative z-20 mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
        {/* Main Container */}
        <div className="relative flex flex-col lg:flex-row lg:items-start lg:justify-center lg:gap-8">

          {/* Right White Card - Animate from Right */}
          <div
            className="relative order-2 lg:order-1 lg:w-[700px] mb-8 lg:mb-0"
            data-aos="fade-left"
            data-aos-delay="120"
          >
            {/* Rotated Card Container */}
            <div className="relative transform -rotate-2 hover:rotate-0 transition-transform duration-700">
              {/* Shadow */}
              <div className="absolute -inset-4 bg-black/20 rounded-[48px] blur-2xl animate-pulse-slow" />
              
              {/* Card */}
              <div className="relative rounded-[40px] bg-white p-6 lg:p-8 shadow-[0_30px_50px_rgba(0,0,0,0.2)] 
                            hover:shadow-[0_40px_60px_rgba(0,0,0,0.3)] transition-shadow duration-500">
                <div className="transform rotate-2">
                  <CardStickers />
                  
                  <div className="grid items-center gap-8 lg:grid-cols-2">
                    {/* Left Image - Animate from Bottom */}
                    <div className="relative flex justify-center animate-fade-in-up">
                      <div className="relative group">
                        <div className="absolute -inset-4 bg-gradient-to-r from-[#ffd966] to-[#ffb347] rounded-full blur-2xl opacity-30 group-hover:opacity-50 transition-opacity animate-pulse-slow" />
                        <img
                          src={trialCharacter}
                          alt="Trial character"
                          className="relative z-10 w-[280px] lg:w-[320px] select-none object-contain 
                                   drop-shadow-[0_25px_15px_rgba(0,0,0,0.2)] transform group-hover:scale-105 
                                   "
                          draggable={false}
                        />
                      </div>
                    </div>

                    {/* Right Content - Animated Text */}
                    <div className="text-center lg:text-left">
                      {/* Rating - Animate from Top */}
                      <div className="inline-flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full mb-6 animate-fade-in-up">
                        <FaStar className="text-[#ffd966] text-xl animate-pulse-slow" />
                        <span className="font-black text-gray-800">4.9</span>
                        <span className="text-xs text-gray-500">((2,3 ming izohlar))</span>
                      </div>

                      {/* Title - Animated Letters */}
                      <h2 className="font-bebas text-5xl sm:text-6xl lg:text-7xl text-[#1f1f1f] leading-none">
                        <span className="block transform hover:scale-105 hover:translate-x-2 transition-all duration-300 animate-slide-in-left">
                          7 KUNLIK
                        </span>
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#ffd966] to-[#ffb347] drop-shadow-[0_4px_0_#b94b1f] animate-slide-in-right delay-200">
                          BEPUL
                        </span>
                        <span className="block animate-slide-in-left" style={{ animationDelay: "400ms" }}>
                          SINOV
                        </span>
                      </h2>

                      {/* Description - Animate from Bottom */}
                      <p className="mt-6 font-inter text-sm font-semibold text-gray-600 leading-relaxed animate-fade-in-up delay-300">
                        O‘yinlar o‘rganishni qiziqarli qiladi
                        <span className="block">Bolalar ota-onasi bilan birga mazmunli vaqt o‘tkazadi</span>
                        <span className="block text-[#d42d73] hover:scale-105 transition-transform duration-300">O‘yin — bilimga yo‘l!</span>
                      </p>

                      {/* Play Button - Animate with Bounce */}
                      <button onClick={() => navigate("/games")} className="group relative mt-8 overflow-hidden rounded-full border-2 border-[#ffe24d] bg-gradient-to-b from-[#ffd966] to-[#ffb347] px-12 py-4 text-lg font-black tracking-wider text-[#1a1a1a] shadow-[0_12px_0_0_rgba(230,126,34,0.95),0_15px_25px_rgba(0,0,0,0.2)] transition-all hover:translate-y-1 hover:shadow-[0_10px_0_0_rgba(230,126,34,0.95)] active:translate-y-3 active:shadow-[0_8px_0_0_rgba(230,126,34,0.95)] animate-fade-in-up">
                        <span className="relative z-10 flex items-center gap-3">
                          <FaRegSmile className="text-xl animate-bounce-slow" />
                          SINAB KO‘RING
                        </span>
                        <span className="absolute inset-0 -translate-x-full group-hover:translate-x-0 transition-transform duration-700 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12" />
                      </button>

                      {/* Navigation Dots */}
                      <div className="mt-10 flex items-center justify-center lg:justify-start gap-4 animate-fade-in-up delay-500">
                        <button className="group w-10 h-10 rounded-xl bg-gradient-to-br from-[#ffd966] to-[#ffb347] shadow-[0_6px_0_rgba(200,100,0,0.5)] hover:shadow-[0_4px_0_rgba(200,100,0,0.5)] active:shadow-[0_2px_0_rgba(200,100,0,0.5)] transition-all">
                          <FaArrowLeft className="mx-auto text-[#1a1a1a]" />
                        </button>
                        
                        <div className="flex gap-2">
                          {[0, 1, 2, 3, 4].map((dot) => (
                            <span
                              key={dot}
                              className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                                dot === 0 
                                  ? "bg-[#ff7f74] scale-125 animate-pulse" 
                                  : "bg-gray-300 hover:bg-gray-400 hover:scale-125"
                              }`}
                            />
                          ))}
                        </div>

                        <button className="group w-10 h-10 rounded-xl bg-gradient-to-br from-[#ffd966] to-[#ffb347] shadow-[0_6px_0_rgba(200,100,0,0.5)] hover:shadow-[0_4px_0_rgba(200,100,0,0.5)] active:translate-y-2 active:shadow-[0_2px_0_rgba(200,100,0,0.5)] transition-all">
                          <FaArrowRight className="mx-auto text-[#1a1a1a] " />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Left Red Panel - Animate from Left */}
          <div
            className="relative order-1 lg:order-2 lg:w-[580px] lg:mt-16"
            data-aos="fade-right"
            data-aos-delay="220"
          >
            <div className="relative rounded-[48px] bg-gradient-to-br from-[#e22b73] to-[#c2185b] p-8 lg:p-10 shadow-[0_30px_50px_rgba(0,0,0,0.25)] transform hover:scale-[1.02] transition-transform duration-500">
              {/* Inner Glow */}
              <div className="absolute inset-0 rounded-[48px] bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_70%)] pointer-events-none animate-pulse-slow" />
              
              {/* Content */}
              <div className="relative space-y-8">
                {features.map((feature, index) => (
                  <div 
                    key={index} 
                    className="flex items-start gap-6 group"
                    style={{ animationDelay: `${index * 200}ms` }}
                  >
                    <div className="relative transform group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300 animate-fade-in-up" 
                         style={{ animationDelay: `${index * 200}ms` }}>
                      <StickerAvatar3D mood={feature.mood} />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#ffd966] rounded-full" />
                    </div>
                    <div className="flex-1 pt-2 animate-slide-in-right" 
                         style={{ animationDelay: `${index * 200 + 100}ms` }}>
                      <h3 className="font-bebas text-2xl lg:text-3xl text-white leading-tight tracking-wide">
                        {feature.title.split('\n').map((line, i) => (
                          <span key={i} className="block hover:translate-x-2 transition-transform duration-300">
                            {line}
                          </span>
                        ))}
                      </h3>
                      <p className="mt-3 font-inter text-sm font-semibold text-white/70 leading-relaxed">
                        {feature.text.split('\n').map((line, i) => (
                          <span key={i} className="block hover:translate-x-2 transition-transform duration-300">
                            {line}
                          </span>
                        ))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* More Games Button */}
              <button
                  onClick={() => navigate("/games")}
                className="group relative mt-10 w-full lg:w-auto overflow-hidden rounded-full bg-white/10 backdrop-blur-sm px-8 py-4 text-white font-black tracking-wider border border-white/20 shadow-[0_10px_0_rgba(0,0,0,0.15)] hover:translate-y-1 hover:shadow-[0_8px_0_rgba(0,0,0,0.15)] active:translate-y-2 active:shadow-[0_6px_0_rgba(0,0,0,0.15)] transition-all animate-fade-in-up"
                style={{ animationDelay: "600ms" }}
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[#ffd966] to-[#ffb347] shadow-[0_5px_0_rgba(200,100,0,0.5)] group-hover:rotate-90 transition-transform duration-300">
                    <FaPlus className="text-lg text-[#1a1a1a] group-hover:scale-125 transition-transform" />
                  </span>
                  <span className="text-sm tracking-[0.15em]">BOSHQA O'YINLAR</span>
                </span>
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-0 transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================
   Sticker Components
   ========================= */

function BgStickers() {
  return (
    <>
      {/* Floating Clouds with different animations */}
      <div className="absolute top-20 right-10 animate-float-slow">
        <FaCloud className="text-9xl text-white/20 hover:text-white/30 transition-colors duration-1000" />
      </div>
      <div className="absolute bottom-40 left-10 animate-float-delayed">
        <FaCloud className="text-8xl text-white/15 hover:text-white/25 transition-colors duration-1000" />
      </div>
      
      {/* Orbital Rings */}
      <div className="absolute left-1/2 top-1/3 -translate-x-1/2">
        <div className="relative w-96 h-96">
          <div className="absolute inset-0 border-4 border-white/10 rounded-full animate-spin-slow" />
          <div className="absolute inset-8 border-2 border-white/20 rounded-full animate-spin-slower" />
          <div className="absolute inset-16 border border-white/30 rounded-full animate-pulse-slow" />
        </div>
      </div>

      {/* Floating particles */}
      <div className="absolute top-[15%] left-[5%] w-2 h-2 bg-white/30 rounded-full " />
      <div className="absolute bottom-[25%] right-[8%] w-3 h-3 bg-[#ffd966]/30 rounded-full" />
      <div className="absolute top-[45%] left-[12%] w-2 h-2 bg-white/20 rounded-full" />
    </>
  );
}

function CardStickers() {
  return (
    <>
      {/* Planet Sticker */}
      <div className="absolute -left-6 -top-6 animate-float-slow">
        <div className="relative group">
          <GiPlanetCore className="text-7xl text-[#f2c15b] opacity-40 group-hover:opacity-60 transition-all duration-500 group-hover:rotate-12" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/30 rounded-full blur-sm animate-pulse-slow" />
        </div>
      </div>

      {/* Orbital Sticker */}
      <div className="absolute right-10 top-10 animate-spin-slow group">
        <GiOrbit className="text-5xl text-[#ffd966] opacity-30 group-hover:opacity-50 transition-all duration-500" />
      </div>

      {/* Sparkles */}
      <div className="absolute left-20 bottom-20 animate-pulse-slow">
        <GiSparkles className="text-4xl text-[#ffd966] opacity-40 group-hover:opacity-60 transition-all duration-500" />
      </div>
      <div className="absolute right-20 bottom-40 animate-pulse-slow delay-1000">
        <GiSparkles className="text-3xl text-[#ffb347] opacity-30 group-hover:opacity-50 transition-all duration-500" />
      </div>

      {/* Additional floating icons */}
      <div className="absolute left-40 top-40 animate-float-delayed">
        <GiBookshelf className="text-4xl text-[#ffd966]/20" />
      </div>
      <div className="absolute right-40 top-60 animate-float">
        <HiOutlineAcademicCap className="text-5xl text-[#ffb347]/20" />
      </div>
    </>
  );
}

function StickerAvatar3D({ mood }: { mood: "smile" | "neutral" | "shock" }) {
  const getIcon = () => {
    switch(mood) {
      case "smile": return <FaRegSmile className="text-4xl text-[#ffd966] group-hover:scale-110 transition-transform" />;
      case "neutral": return <FaMeh className="text-4xl text-[#ffb347] group-hover:scale-110 transition-transform" />;
      case "shock": return <FaSurprise className="text-4xl text-[#ff8c42] group-hover:scale-110 transition-transform" />;
    }
  };

  return (
    <div className="relative group">
      {/* 3D Sphere */}
      <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[#fff2a6] via-[#ffd84a] to-[#e89000] 
                      shadow-[0_15px_0_rgba(180,100,0,0.5),inset_0_-5px_10px_rgba(0,0,0,0.2),inset_0_5px_10px_rgba(255,255,255,0.8)]
                      transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300
                      animate-fade-in-up">
        {/* Inner Shadow */}
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.8),transparent_70%)] 
                      group-hover:animate-pulse-slow" />
        
        {/* Face Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          {getIcon()}
        </div>
      </div>

      {/* Highlight */}
      <div className="absolute -top-1 -left-1 w-6 h-6 bg-white/40 rounded-full blur-sm animate-pulse-slow" />
      <div className="absolute top-1 left-1 w-3 h-3 bg-white/60 rounded-full animate-ping" />
      
      {/* Glow effect */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#ffd966] to-[#ffb347] rounded-full blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
    </div>
  );
}

export default TrialSection;
