import { Link } from "react-router-dom";
import { ArrowRight, ChartColumn, MessageSquareMore, TrendingUp, UsersRound } from "lucide-react";
import useContextPro from "../../hooks/useContextPro";
import { comments } from "../../components/main/commentsData";

const panels = [
  {
    title: "Users management",
    text: "Akkountlar, rollar va foydalanuvchilar ro'yxatini boshqaring.",
    to: "/admin/users",
    icon: UsersRound,
  },
  {
    title: "Feedback moderation",
    text: "Kutilayotgan va tasdiqlangan feedbacklarni nazorat qiling.",
    to: "/admin/feedbacks",
    icon: MessageSquareMore,
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
    { label: "Feedbacks", value: totalFeedbacks, note: "Total reviews", icon: MessageSquareMore },
    { label: "Average rating", value: averageRating, note: "Current score", icon: ChartColumn },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-white/10 bg-white px-6 py-8 text-black shadow-[0_24px_70px_rgba(255,255,255,0.08)] md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-black/45">Overview</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Admin dashboard</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-black/65">
              <span className="font-semibold text-black">{user?.username || "Admin"}</span> uchun asosiy metrikalar,
              feedback ko'rsatkichlari va boshqaruv bo'limlariga tezkor kirish.
            </p>
          </div>

          <div className="flex h-20 w-20 items-center justify-center rounded-[28px] bg-black text-white">
            <TrendingUp className="h-9 w-9" />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <article
              key={item.label}
              className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 transition hover:border-white/20 hover:bg-white/[0.05]"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-black">
                <Icon className="h-6 w-6" />
              </div>
              <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/42">{item.label}</p>
              <p className="mt-3 text-4xl font-semibold text-white">{item.value}</p>
              <p className="mt-2 text-sm text-white/50">{item.note}</p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {panels.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.title}
              to={item.to}
              className="group rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 transition hover:-translate-y-0.5 hover:border-white/20"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-black">
                <Icon className="h-6 w-6" />
              </div>
              <div className="mt-5 flex items-center justify-between gap-4">
                <h3 className="text-2xl font-semibold text-white">{item.title}</h3>
                <ArrowRight className="h-5 w-5 text-white/45 transition group-hover:translate-x-1 group-hover:text-white" />
              </div>
              <p className="mt-3 max-w-md text-sm leading-7 text-white/55">{item.text}</p>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
