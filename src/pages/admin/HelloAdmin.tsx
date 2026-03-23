import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  LayoutDashboard, 
  MessageSquareMore, 
  Sparkles, 
  Users,
  Flower2,
  Heart,
  ChevronRight
} from "lucide-react";
import { FaUserShield } from "react-icons/fa";
import useContextPro from "../../hooks/useContextPro";

const quickLinks = [
  {
    title: "Dashboard",
    to: "/admin/dashboard",
    icon: LayoutDashboard,
    gradient: "from-pink-300 to-rose-300",
    petalColor: "bg-pink-200/30",
  },
  {
    title: "Users",
    to: "/admin/users",
    icon: Users,
    gradient: "from-amber-200 to-pink-200",
    petalColor: "bg-amber-200/30",
  },
  {
    title: "Feedbacks",
    to: "/admin/feedbacks",
    icon: MessageSquareMore,
    gradient: "from-rose-200 to-pink-200",
    petalColor: "bg-rose-200/30",
  },
];

export default function HelloAdmin() {
  const {
    state: { user },
  } = useContextPro();

  // Generate random falling petals
  const petals = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 10,
    duration: 5 + Math.random() * 5,
    size: 8 + Math.random() * 12,
  }));

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-pink-50 via-rose-50 to-amber-50">
      {/* Falling Cherry Blossom Petals Animation */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {petals.map((petal) => (
          <div
            key={petal.id}
            className="absolute animate-fall"
            style={{
              left: `${petal.left}%`,
              animationDelay: `${petal.delay}s`,
              animationDuration: `${petal.duration}s`,
              width: petal.size,
              height: petal.size,
            }}
          >
            <div className="relative w-full h-full">
              <div 
                className="absolute inset-0 rounded-full bg-pink-200/40 blur-[1px]"
                style={{
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              />
              <Flower2 className="w-full h-full text-pink-300/60" strokeWidth={1.5} />
            </div>
          </div>
        ))}
      </div>

      <div className="relative z-10 space-y-8 p-6 md:p-8">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl bg-white/40 backdrop-blur-xl shadow-2xl border border-white/60">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-200/20 via-rose-200/20 to-amber-200/20" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-300/20 rounded-full blur-3xl" />
          
          <div className="relative p-8 md:p-12">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/60 backdrop-blur-sm px-5 py-2 border border-pink-200/50 shadow-sm">
                  <Sparkles className="h-4 w-4 text-pink-500" />
                  <span className="text-xs font-medium text-rose-700 tracking-wide">
                    BAHOR FASLI
                  </span>
                  <Heart className="h-3 w-3 text-pink-400" fill="currentColor" />
                </div>
                
                <h1 className="mt-6 text-4xl md:text-6xl font-bold tracking-tight">
                  <span className="bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 bg-clip-text text-transparent">
                    Xush kelibsiz
                  </span>
                  <br />
                  <span className="text-rose-800">
                    {user?.username || "Admin"} 🌸
                  </span>
                </h1>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
                    to="/admin/dashboard"
                    className="group relative inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-3.5 font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <span>Dashboard'ga o'tish</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-rose-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
                  </Link>
                  <Link
                    to="/admin/users"
                    className="inline-flex items-center gap-2 rounded-2xl bg-white/60 backdrop-blur-sm px-6 py-3.5 font-semibold text-rose-700 border border-pink-200/50 hover:bg-white/80 transition-all duration-300"
                  >
                    <Users className="h-4 w-4" />
                    <span>Users ochish</span>
                  </Link>
                </div>
              </div>

              {/* Profile Card */}
              <div className="relative">
                <div className="rounded-2xl bg-white/60 backdrop-blur-xl p-6 border border-white/60 shadow-lg">
                  <div className="relative">
                    <div className="absolute -top-3 -right-3">
                      <div className="animate-pulse">
                        <Heart className="h-6 w-6 text-pink-400" fill="currentColor" />
                      </div>
                    </div>
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-300 via-rose-300 to-amber-300 shadow-lg">
                      <FaUserShield className="text-3xl text-white" />
                    </div>
                  </div>
                  
                  <h3 className="mt-4 text-2xl font-bold text-rose-800">HelloAdmin</h3>
                  <p className="mt-2 text-sm leading-relaxed text-rose-600/70">
                     Admin paneliga xush kelibsiz.
                  </p>

                  <div className="mt-5 space-y-3">
                    <div className="rounded-xl bg-white/40 backdrop-blur-sm px-4 py-3 border border-pink-100">
                      <p className="mt-1 truncate text-sm font-semibold text-rose-800">
                        {user?.email || "admin@example.com"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Links Cards */}
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                to={item.to}
                className="group relative overflow-hidden rounded-2xl bg-white/40 backdrop-blur-sm border border-white/60 p-6 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 hover:bg-white/60"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {/* Background Petal Effect */}
                <div className="absolute -top-10 -right-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="relative">
                    <div className="absolute inset-0 bg-pink-300/20 rounded-full blur-xl" />
                    <Flower2 className="relative h-24 w-24 text-pink-200/40" strokeWidth={1} />
                  </div>
                </div>
                
                <div className="relative z-10">
                  <div className={`inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} shadow-md`}>
                    <Icon className="h-6 w-6 text-rose-700" />
                  </div>
                  
                  <h3 className="mt-5 text-xl font-bold text-rose-800 group-hover:text-rose-900 transition-colors">
                    {item.title}
                  </h3>
                  <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-rose-500 group-hover:text-rose-600 transition-colors">
                    <span>Ochish</span>
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
                
                {/* Decorative Border */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-300 via-rose-300 to-amber-300 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </Link>
            );
          })}
        </section>

        {/* Decorative Elements */}
        <div className="absolute bottom-8 left-8 opacity-30 pointer-events-none">
          <Flower2 className="h-12 w-12 text-pink-300" strokeWidth={1} />
        </div>
        <div className="absolute top-32 right-12 opacity-20 pointer-events-none animate-float">
          <Heart className="h-16 w-16 text-pink-300" fill="currentColor" />
        </div>
      </div>

      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(-20vh) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          90% {
            opacity: 0.4;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }
        
        .animate-fall {
          animation: fall linear infinite;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}