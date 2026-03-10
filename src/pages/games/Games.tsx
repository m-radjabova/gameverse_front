import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaLock,
  FaStar,
  FaCrown,
  FaUsers,
  FaHome,
  FaGamepad,
  FaTrophy,
  FaFire,
  FaBolt
} from "react-icons/fa";
import {
  GiAchievement,
  GiPodium,
  GiJoystick,
  GiDragonHead,
  GiLightningStorm,
  GiWizardStaff,
} from "react-icons/gi";
import { IoMdTimer } from "react-icons/io";
import { gameCards } from "./data";

function Games() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("Barchasi");
  const [hoveredCard, setHoveredCard] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const categories = useMemo(
    () => ["Barchasi", ...Array.from(new Set(gameCards.map((game) => game.category)))],
    [],
  );

  const filteredGames = useMemo(
    () =>
      activeCategory === "Barchasi"
        ? gameCards
        : gameCards.filter((game) => game.category === activeCategory),
    [activeCategory],
  );
  const totalGames = gameCards.length;

  // Har bir karta uchun gradient va iconBg ni saqlab qolamiz
  const getCardGradient = (game) => {
    return game.gradient || 'from-purple-500 to-pink-500';
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#030014]">
      {/* Murakkab gradient fon */}
      <div 
        className="fixed inset-0 transition-opacity duration-1000"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(98, 0, 255, 0.15) 0%, rgba(0, 0, 0, 0) 50%),
                      radial-gradient(circle at 80% 20%, rgba(255, 0, 255, 0.1) 0%, transparent 40%),
                      radial-gradient(circle at 20% 80%, rgba(0, 255, 255, 0.1) 0%, transparent 40%),
                      linear-gradient(135deg, #030014 0%, #0a0a2a 50%, #1a0a2a 100%)`
        }}
      />

      {/* Animatsion zarralar tizimi */}
      <div className="fixed inset-0 overflow-hidden">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float-particle"
            style={{
              width: `${Math.random() * 4 + 1}px`,
              height: `${Math.random() * 4 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              background: `radial-gradient(circle, ${
                i % 3 === 0 ? '#ff00ff' : i % 3 === 1 ? '#00ffff' : '#ffffff'
              } 0%, transparent 70%)`,
              boxShadow: `0 0 ${Math.random() * 20 + 10}px ${
                i % 3 === 0 ? '#ff00ff' : i % 3 === 1 ? '#00ffff' : '#ffffff'
              }`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${10 + Math.random() * 20}s`,
              opacity: 0.2 + Math.random() * 0.3,
            }}
          />
        ))}
      </div>

      {/* Neon chiziqlar */}
      <div className="fixed inset-0">
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-purple-500/20 to-transparent" />
        <div className="absolute top-0 left-2/4 w-px h-full bg-gradient-to-b from-transparent via-pink-500/20 to-transparent" />
        <div className="absolute top-0 left-3/4 w-px h-full bg-gradient-to-b from-transparent via-blue-500/20 to-transparent" />
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
        <div className="absolute top-2/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
        <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
      </div>

      {/* Asosiy kontent */}
      <div className={`relative z-10 mx-auto min-h-screen w-full max-w-[2000px] px-4 py-6 md:px-6 md:py-8 lg:px-8 xl:px-10 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        {/* Orqaga qaytish tugmasi */}
        <button
          onClick={() => navigate("/home")}
          className="group relative mb-8 inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-white/5 to-white/10 px-6 py-3 text-sm font-bold text-white border border-white/10 backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-white/20 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]"
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
          <FaHome className="text-base transition-transform group-hover:-translate-x-1" />
          <span>Bosh sahifa</span>
          <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-purple-500/50 to-pink-500/50 blur opacity-0 group-hover:opacity-30 transition-opacity" />
        </button>

        {/* Sarlavha qismi */}
        <div className="relative mb-16 text-center">
          {/* 3D effektli sarlavha */}
          <div className="relative inline-block perspective-1000">
            <div className="relative animate-float-3d">
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter">
                <span className="relative inline-block">
                  <span className="absolute inset-0 blur-2xl bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 opacity-50 animate-pulse-slow" />
                  <span className="relative bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent animate-gradient-x me-3">
                    O'YINLAR 
                  </span>
                </span>
                <span className="relative inline-block mt-[-0.3em]">
                  <span className="absolute inset-0 blur-2xl bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 opacity-50 animate-pulse-slow" />
                  <span className="relative bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent animate-gradient-x-reverse">
                    MASKANI
                  </span>
                </span>
              </h1>
            </div>

            {/* Animatsion yulduzlar */}
            <div className="absolute -top-12 -right-12">
              <div className="relative">
                <FaStar className="absolute text-4xl text-yellow-400 animate-ping-slow opacity-50" />
                <FaStar className="relative text-4xl text-yellow-400 animate-spin-slow" />
                <FaStar className="absolute top-0 left-0 text-2xl text-yellow-300 animate-pulse" style={{ animationDelay: '0.5s' }} />
              </div>
            </div>
            
            <div className="absolute -bottom-8 -left-12">
              <div className="relative">
                <FaCrown className="absolute text-5xl text-pink-400 animate-ping-slow opacity-50" />
                <FaCrown className="relative text-5xl text-pink-400 animate-bounce-slow" />
              </div>
            </div>
          </div>

          {/* Ta'rif */}
          <p className="mt-6 text-xl text-transparent bg-gradient-to-r from-white/80 via-white/60 to-white/80 bg-clip-text max-w-3xl mx-auto leading-relaxed">
            Eng sara o'yinlar, ajoyib sarguzashtlar va unutilmas lahzalar sizni kutmoqda!
          </p>

          {/* Dekorativ chiziq */}
          <div className="mt-8 flex justify-center gap-2">
            <div className="h-1 w-16 rounded-full bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
            <div className="h-1 w-32 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 animate-pulse"></div>
            <div className="h-1 w-16 rounded-full bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
          </div>
        </div>

        {/* Kategoriya filtrlari */}
        <div className="mb-12 flex flex-wrap items-center justify-center gap-4">
          {categories.map((category, index) => {
            const isActive = activeCategory === category;
            const colors = [
              'from-purple-500 to-pink-500',
              'from-blue-500 to-cyan-500',
              'from-green-500 to-emerald-500',
              'from-orange-500 to-red-500',
              'from-yellow-500 to-amber-500',
            ];
            const colorIndex = index % colors.length;

            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`group relative overflow-hidden rounded-2xl px-6 py-3 text-sm font-bold transition-all duration-500 transform hover:scale-110 ${
                  isActive
                    ? `bg-gradient-to-r ${colors[colorIndex]} text-white shadow-[0_0_30px_rgba(168,85,247,0.5)]`
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                {/* Hover effekti */}
                <div className={`absolute inset-0 bg-gradient-to-r ${colors[colorIndex]} opacity-0 group-hover:opacity-20 blur-xl transition-opacity`} />
                
                {/* Ichki glow */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity`}>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white to-transparent" />
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white to-transparent" />
                </div>

                <span className="relative z-10">{category}</span>
              </button>
            );
          })}
        </div>

        {/* Statistik ma'lumotlar */}
        <div className="mb-12 flex justify-center">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity" />
            <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-black/40 backdrop-blur-xl px-8 py-4">
              <div className="flex flex-wrap items-center justify-center gap-8">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-yellow-400 rounded-full blur-md animate-ping-slow" />
                    <FaGamepad className="relative text-xl text-yellow-400" />
                  </div>
                  <span className="text-white font-bold">
                    <span className="text-yellow-400">{totalGames}</span> ta o'yin
                  </span>
                </div>
                
                <div className="w-px h-8 bg-white/20" />
                
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-green-400 rounded-full blur-md animate-ping-slow" />
                    <FaUsers className="relative text-xl text-green-400" />
                  </div>
                  <span className="text-white font-bold">
                    <span className="text-green-400">5k+</span> foydalanuvchi
                  </span>
                </div>
                
                <div className="w-px h-8 bg-white/20" />
                
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-400 rounded-full blur-md animate-ping-slow" />
                    <FaFire className="relative text-xl text-blue-400" />
                  </div>
                  <span className="text-white font-bold">
                    <span className="text-blue-400">24/7</span> jonli
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* O'yin kartochkalari */}
        <div className="relative z-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:gap-10">
          {filteredGames.map((game, index) => {
            const isHovered = hoveredCard === game.id;
            const delay = index * 0.1;
            const cardGradient = getCardGradient(game);

            return (
              <div
                key={game.id}
                className={`group relative transform-gpu transition-all duration-700 hover:scale-[1.03] hover:-translate-y-3 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
                }`}
                style={{ transitionDelay: `${delay}s` }}
                onMouseEnter={() => setHoveredCard(game.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Karta gradienti - bu qatlam icon ustida emas */}
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${cardGradient} rounded-3xl blur-2xl opacity-0 group-hover:opacity-70 transition-opacity duration-500`} />
                
                {/* Asosiy karta */}
                <div
                  className={`relative w-full overflow-hidden rounded-3xl border-2 transition-all duration-500 ${
                    game.available
                      ? `${game.bgPattern || ''} border-white/20 hover:border-white/40 ${game.borderGlow || ''}`
                      : 'border-white/10 bg-gray-800/50 backdrop-blur-xl cursor-not-allowed'
                  }`}
                  style={{
                    // Agar bgPattern bo'lmasa, gradient fon qo'shamiz
                    background: game.bgPattern ? undefined : `linear-gradient(135deg, rgba(20,20,30,0.9) 0%, rgba(30,20,40,0.9) 100%)`
                  }}
                >
                  {/* Rasm qismi */}
                  <div className="relative h-56 w-full overflow-hidden sm:h-64">
                    <img
                      src={game.image}
                      alt={game.title}
                      className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    {/* Neon chiziqlar */}
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-scan" />
                    <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-pink-500 to-transparent animate-scan-reverse" />

                    {/* Badge */}
                    <div className="absolute left-4 top-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full blur-md animate-pulse" />
                        <div className="relative flex items-center gap-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xl">
                          <game.badgeIcon className="text-sm" />
                          <span>{game.badge}</span>
                        </div>
                      </div>
                    </div>

                    {/* Level */}
                    <div className="absolute right-4 top-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-black rounded-full blur-md" />
                        <div className="relative flex items-center gap-2 rounded-full bg-black/80 backdrop-blur-sm px-4 py-2 text-xs font-bold text-white border border-white/20">
                          <game.levelIcon className="text-yellow-300" />
                          <span>{game.level}</span>
                        </div>
                      </div>
                    </div>

                    {/* O'yin iconkasi - endi bu gradient ustida va ko'rinadi */}
                    <div className="absolute -bottom-7 left-6 z-20">
                      <div className="relative">
                        <div className={`absolute inset-0 bg-gradient-to-r ${cardGradient} rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity`} />
                        <div
                          className={`relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${game.iconBg} text-white shadow-2xl border-2 border-white/30 transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-6`}
                        >
                          <game.icon className="text-3xl" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Kontent qismi */}
                  <div className="p-6 pt-10">
                    <h3 className="mb-2 text-2xl font-black text-white flex items-center gap-2">
                      {game.title}
                      {game.available && (
                        <FaBolt className="text-yellow-400 animate-pulse" />
                      )}
                    </h3>

                    <p className="mb-4 text-sm text-white/60 line-clamp-2">{game.description}</p>

                    {/* Ma'lumotlar gridi */}
                    <div className="mb-5 grid grid-cols-2 gap-3">
                      <div className="relative group/item">
                        <div className={`absolute inset-0 bg-gradient-to-r ${cardGradient} rounded-xl blur-md opacity-0 group-hover/item:opacity-30 transition-opacity`} />
                        <div className="relative flex items-center gap-2 rounded-xl bg-white/5 p-2.5 border border-white/10 backdrop-blur-sm">
                          <FaUsers className="text-sm text-white/60" />
                          <span className="text-xs font-bold text-white/80">{game.players}</span>
                        </div>
                      </div>
                      
                      <div className="relative group/item">
                        <div className={`absolute inset-0 bg-gradient-to-r ${cardGradient} rounded-xl blur-md opacity-0 group-hover/item:opacity-30 transition-opacity`} />
                        <div className="relative flex items-center gap-2 rounded-xl bg-white/5 p-2.5 border border-white/10 backdrop-blur-sm">
                          <IoMdTimer className="text-sm text-white/60" />
                          <span className="text-xs font-bold text-white/80">{game.time}</span>
                        </div>
                      </div>
                      
                      <div className="relative group/item">
                        <div className={`absolute inset-0 bg-gradient-to-r ${cardGradient} rounded-xl blur-md opacity-0 group-hover/item:opacity-30 transition-opacity`} />
                        <div className="relative flex items-center gap-2 rounded-xl bg-white/5 p-2.5 border border-white/10 backdrop-blur-sm">
                          <FaTrophy className="text-sm text-yellow-300" />
                          <span className="text-xs font-bold text-white/80">{game.points}</span>
                        </div>
                      </div>
                      
                      <div className="relative group/item">
                        <div className={`absolute inset-0 bg-gradient-to-r ${cardGradient} rounded-xl blur-md opacity-0 group-hover/item:opacity-30 transition-opacity`} />
                        <div className="relative flex items-center gap-2 rounded-xl bg-white/5 p-2.5 border border-white/10 backdrop-blur-sm">
                          <game.categoryIcon className={`text-sm ${game.iconColor}`} />
                          <span className="text-xs font-bold text-white/80">{game.category}</span>
                        </div>
                      </div>
                    </div>

                    {/* O'ynash tugmasi */}
                    <div className="relative">
                      <div className={`absolute inset-0 bg-gradient-to-r ${cardGradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-70 transition-opacity`} />
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          if (game.available) navigate(game.path);
                        }}
                        disabled={!game.available}
                        className={`relative w-full overflow-hidden rounded-2xl border-2 transition-all duration-500 ${
                          game.available
                            ? `border-yellow-400/50 bg-gradient-to-r ${cardGradient} hover:scale-[1.02] active:scale-[0.98] cursor-pointer group/btn`
                            : 'border-gray-600 bg-gray-700/50 cursor-not-allowed'
                        }`}
                      >
                        <div className="px-6 py-4">
                          <span className="relative z-10 flex items-center justify-center gap-3 text-sm font-black text-white">
                            {game.available ? (
                              <>
                                <game.mainIcon className="text-base animate-bounce-slow" />
                                <span>O'YNASH</span>
                                <FaArrowRight className="text-sm transition-transform group-hover/btn:translate-x-2" />
                              </>
                            ) : (
                              <>
                                <FaLock className="text-sm" />
                                <span>TEZ KUNDA</span>
                              </>
                            )}
                          </span>
                        </div>

                        {/* Animatsion chiziq */}
                        {game.available && (
                          <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Hover effektlari */}
                  {isHovered && game.available && (
                    <>
                      <div className={`absolute top-0 left-0 w-20 h-20 bg-gradient-to-r ${cardGradient} rounded-full blur-3xl animate-pulse opacity-30`} />
                      <div className={`absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-r ${cardGradient} rounded-full blur-3xl animate-pulse opacity-30`} />
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer ikonkalar */}
        <div className="relative mt-20 flex justify-center gap-8 text-white/20">
          {[
            GiAchievement,
            GiPodium,
            FaTrophy,
            FaGamepad,
            GiJoystick,
            GiDragonHead,
            GiLightningStorm,
            GiWizardStaff
          ].map((Icon, index) => (
            <div key={index} className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-2xl opacity-0 group-hover:opacity-70 transition-opacity" />
              <Icon className={`relative text-4xl animate-float-particle transition-all duration-300 group-hover:text-white group-hover:scale-150 group-hover:rotate-12`} 
                style={{ animationDelay: `${index * 0.2}s` }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Games;