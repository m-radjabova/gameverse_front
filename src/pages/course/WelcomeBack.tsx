import { useMemo, useState } from "react";

type Slide = {
  id: number;
  title: string;
  author: string;
  lessonText: string;
  progress: number;
  image: string;
  avatar?: string;
};

function WelcomeBack() {
  const slides: Slide[] = useMemo(
    () => [
      {
        id: 1,
        title: "AWS Certified Solutions Architect",
        author: "Lina",
        lessonText: "Lesson 5 of 7",
        progress: 70,
        image:
          "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop",
        avatar: "https://i.pravatar.cc/40?img=12",
      },
      {
        id: 2,
        title: "Full Stack Web Development",
        author: "Alex",
        lessonText: "Lesson 3 of 10",
        progress: 30,
        image:
          "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1200&auto=format&fit=crop",
        avatar: "https://i.pravatar.cc/40?img=11",
      },
      {
        id: 3,
        title: "UI/UX Design Fundamentals",
        author: "Sophia",
        lessonText: "Lesson 8 of 12",
        progress: 85,
        image:
          "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1200&auto=format&fit=crop",
        avatar: "https://i.pravatar.cc/40?img=8",
      },
      {
        id: 4,
        title: "Data Science Essentials",
        author: "Michael",
        lessonText: "Lesson 6 of 9",
        progress: 60,
        image:
          "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop",
        avatar: "https://i.pravatar.cc/40?img=15",
      },
    ],
    []
  );

  const [page, setPage] = useState(0);
  const perPage = 3;

  const start = page * perPage;
  const visible = slides.slice(start, start + perPage);

  const canPrev = page > 0;
  const canNext = start + perPage < slides.length;

  return (
    <section className="bg-gradient-to-br from-sky-50/80 to-white rounded-3xl p-6 md:p-10 shadow-lg">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Welcome back! 👋
          </h2>
          <p className="text-slate-600 mt-2">Ready for your next lesson?</p>
        </div>

        <button className="mt-4 md:mt-0 px-6 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-teal-200 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
          View history
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {visible.map((s) => (
          <div
            key={s.id}
            className="group bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden border border-slate-100 hover:shadow-[0_20px_60px_rgba(2,8,23,0.12)] hover:border-teal-100 hover:translate-y-[-4px] transition-all duration-300"
          >
            <div className="p-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent z-0" />
              <img
                src={s.image}
                alt={s.title}
                className="w-full h-[180px] object-cover rounded-xl group-hover:scale-[1.03] transition-transform duration-500"
              />
              <div className="absolute top-6 left-6 z-10">
                <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-semibold rounded-full">
                  {s.lessonText}
                </span>
              </div>
            </div>

            <div className="px-6 pb-6">
              <h3 className="font-bold text-slate-900 text-lg group-hover:text-teal-700 transition-colors duration-300">
                {s.title}
              </h3>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={s.avatar || "https://i.pravatar.cc/40?img=12"}
                      alt={s.author}
                      className="w-10 h-10 rounded-full object-cover border-2 border-white shadow"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-slate-800">
                      {s.author}
                    </span>
                    <p className="text-xs text-slate-500">Instructor</p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-700 font-medium">Progress</span>
                  <span className="text-teal-600 font-bold">{s.progress}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${s.progress}%` }}
                  />
                </div>
              </div>

              <button className="mt-6 w-full py-3 bg-gradient-to-r from-slate-50 to-white text-slate-800 font-semibold rounded-xl border border-slate-200 hover:border-teal-300 hover:bg-gradient-to-r hover:from-teal-50 hover:to-emerald-50 hover:text-teal-700 transition-all duration-300">
                Continue Learning
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end gap-3">
        <button
          onClick={() => setPage((p) => p - 1)}
          disabled={!canPrev}
          className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-xl font-bold transition-all duration-300 ${
            canPrev
              ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:scale-105 active:scale-95"
              : "bg-slate-100 border-slate-100 text-slate-400 cursor-not-allowed"
          }`}
        >
          ‹
        </button>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={!canNext}
          className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-xl font-bold transition-all duration-300 ${
            canNext
              ? "bg-gradient-to-r from-teal-500 to-emerald-500 border-teal-500 text-white hover:shadow-lg hover:shadow-teal-200 hover:scale-105 active:scale-95"
              : "bg-slate-100 border-slate-100 text-slate-400 cursor-not-allowed"
          }`}
        >
          ›
        </button>
      </div>
    </section>
  );
}

export default WelcomeBack