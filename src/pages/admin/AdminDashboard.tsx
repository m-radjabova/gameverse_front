import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChartColumn,
  MessageSquareHeart,
  UsersRound,
  Flower2,
  Heart,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import useContextPro from "../../hooks/useContextPro";
import { comments } from "../../components/main/commentsData";

const panels = [
  {
    title: "Users boshqaruvi",
    value: "01",
    text: "Users boshqaruvi",
    to: "/admin/users",
    icon: UsersRound,
    gradient: "from-pink-400 to-rose-400",
    bgGlow: "from-pink-200/20 to-rose-200/20",
  },
  {
    title: "Feedback monitoring",
    value: "02",
    text: "Feedback monitoring",
    to: "/admin/feedbacks",
    icon: MessageSquareHeart,
    gradient: "from-rose-400 to-pink-400",
    bgGlow: "from-rose-200/20 to-pink-200/20",
  },
];

export default function AdminDashboard() {
  const {
    state: { user },
  } = useContextPro();

  const totalFeedbacks = comments.length;
  const averageRating = (
    comments.reduce((sum, item) => sum + item.rating, 0) / Math.max(comments.length, 1)
  ).toFixed(1);
  
  const stats = [
    {
      label: "Feedbacks",
      value: totalFeedbacks,
      note: "Feedbacks",
      icon: MessageSquareHeart,
      gradient: "from-pink-400 to-rose-400",
      iconBg: "from-pink-100 to-rose-100",
    },
    {
      label: "O'rtacha reyting",
      value: averageRating,
      note: "Rating",
      icon: ChartColumn,
      gradient: "from-amber-400 to-pink-400",
      iconBg: "from-amber-100 to-pink-100",
    }
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-amber-50">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 opacity-20 animate-float-slow">
          <Flower2 className="h-24 w-24 text-pink-300" strokeWidth={1} />
        </div>
        <div className="absolute bottom-20 right-10 opacity-20 animate-float-delay">
          <Heart className="h-20 w-20 text-rose-300" fill="currentColor" />
        </div>
        <div className="absolute top-1/3 right-1/4 opacity-10 animate-pulse-slow">
          <Sparkles className="h-16 w-16 text-pink-400" />
        </div>
      </div>

      <div className="relative z-10 space-y-8 p-6 md:p-8">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl bg-white/40 backdrop-blur-xl shadow-2xl border border-white/60">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-200/20 via-rose-200/20 to-amber-200/20" />
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-pink-300/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-rose-300/20 rounded-full blur-3xl" />
          
          <div className="relative p-8 md:p-10">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div>
                <h2 className="mt-6 text-3xl md:text-4xl font-bold tracking-tight">
                  <span className="bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 bg-clip-text text-transparent">
                    Admin dashboard
                  </span>
                </h2>
                
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-rose-700/80">
                  <span className="font-semibold text-rose-800">{user?.username || "Admin"}</span> 
                  {" "} — users va feedbacks bo'limlariga tez o'tish imkoniyati.
                </p>
              </div>
              
              <div className="relative">
                <div className="absolute -top-2 -right-2 animate-ping-slow">
                  <div className="h-3 w-3 rounded-full bg-pink-400" />
                </div>
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-400 via-rose-400 to-amber-400 shadow-lg">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Cards */}
        <section className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {stats.map((item, index) => {
            const Icon = item.icon;
            return (
              <article
                key={item.label}
                className="group relative overflow-hidden rounded-2xl bg-white/40 backdrop-blur-sm border border-white/60 p-6 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 hover:bg-white/60"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {/* Decorative Flower */}
                <div className="absolute -top-8 -right-8 opacity-0 group-hover:opacity-20 transition-opacity duration-500">
                  <Flower2 className="h-24 w-24 text-pink-300" strokeWidth={1} />
                </div>
                
                <div className="relative z-10">
                  <div className={`inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} shadow-md`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  
                  <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-rose-500/70">
                    {item.label}
                  </p>
                  <p className="mt-2 text-4xl font-bold text-rose-800">{item.value}</p>
                  <p className="mt-2 text-sm text-rose-600/60 flex items-center gap-1">
                    <Heart className="h-3 w-3 text-pink-400" fill="currentColor" />
                    {item.note}
                  </p>
                </div>
                
                {/* Bottom Gradient */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-300 via-rose-300 to-amber-300 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </article>
            );
          })}
        </section>

        {/* Management Panels */}
        <section className="grid gap-6 md:grid-cols-2">
          {panels.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                to={item.to}
                className="group relative overflow-hidden rounded-2xl bg-white/40 backdrop-blur-sm border border-white/60 p-6 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 hover:bg-white/60"
                style={{
                  animationDelay: `${index * 150}ms`,
                }}
              >
                {/* Background Glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                <div className="relative z-10">
                  <div className={`inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} shadow-md`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  
                  <div className="mt-5 flex items-center justify-between gap-4">
                    <h3 className="text-xl md:text-2xl font-bold text-rose-800 group-hover:text-rose-900 transition-colors">
                      {item.title}
                    </h3>
                    <span className="text-sm font-bold text-rose-400/70 bg-white/40 px-3 py-1 rounded-full">
                      {item.value}
                    </span>
                  </div>
                  
                  <p className="mt-3 text-sm leading-relaxed text-rose-600/70">
                    {item.text}
                  </p>
                  
                  <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-rose-500 group-hover:text-rose-600 transition-colors">
                    <span>Bo'limni ochish</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
                
                {/* Decorative Corner */}
                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Flower2 className="h-8 w-8 text-pink-300/40" strokeWidth={1} />
                </div>
              </Link>
            );
          })}
        </section>
      </div>
    </div>
  );
}