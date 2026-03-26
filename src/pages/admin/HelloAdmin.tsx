import { Link } from "react-router-dom";
import { ArrowRight, LayoutDashboard, MessageSquareMore, Users } from "lucide-react";

const quickLinks = [
  {
    title: "Dashboard",
    to: "/admin/dashboard",
    icon: LayoutDashboard,
    description: "Asosiy statistika va tizim ko'rinishi",
  },
  {
    title: "Users",
    to: "/admin/users",
    icon: Users,
    description: "Foydalanuvchilar va rollarni boshqarish",
  },
  {
    title: "Feedbacks",
    to: "/admin/feedbacks",
    icon: MessageSquareMore,
    description: "Teacher feedbacklarini moderatsiya qilish",
  },
];

export default function HelloAdmin() {

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {quickLinks.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.title}
              to={item.to}
              className="group rounded-[28px] border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.06]"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-black">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/55">{item.description}</p>
              <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white/78 transition group-hover:text-white">
                Ochish
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
