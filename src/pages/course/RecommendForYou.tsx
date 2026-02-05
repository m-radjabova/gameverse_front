import { useMemo, useState } from "react";

type Course = {
  id: number;
  title: string;
  image: string;
  category: string;
  duration: string;
  author: string;
  avatar?: string;
  price: number;
  oldPrice: number;
  rating: number;
  students: number;
};

function RecommendForYou() {
  const courses: Course[] = useMemo(
    () => [
      {
        id: 1,
        title: "AWS Certified Solutions Architect",
        image:
          "https://images.unsplash.com/photo-1584697964190-16c2a6f6d8a2?q=80&w=1200&auto=format&fit=crop",
        category: "Cloud",
        duration: "3 Months",
        author: "Lina",
        avatar: "https://i.pravatar.cc/40?img=10",
        price: 79.99,
        oldPrice: 99.99,
        rating: 4.8,
        students: 1245,
      },
      {
        id: 2,
        title: "UI/UX Design Masterclass",
        image:
          "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=1200&auto=format&fit=crop",
        category: "Design",
        duration: "2 Months",
        author: "Alex",
        avatar: "https://i.pravatar.cc/40?img=11",
        price: 89.99,
        oldPrice: 119.99,
        rating: 4.9,
        students: 892,
      },
      {
        id: 3,
        title: "React Native Mobile Development",
        image:
          "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=1200&auto=format&fit=crop",
        category: "Development",
        duration: "4 Months",
        author: "Sophia",
        avatar: "https://i.pravatar.cc/40?img=8",
        price: 94.99,
        oldPrice: 129.99,
        rating: 4.7,
        students: 1567,
      },
      {
        id: 4,
        title: "Data Science with Python",
        image:
          "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop",
        category: "Data Science",
        duration: "5 Months",
        author: "Michael",
        avatar: "https://i.pravatar.cc/40?img=15",
        price: 109.99,
        oldPrice: 149.99,
        rating: 4.8,
        students: 2134,
      },
      {
        id: 5,
        title: "Digital Marketing Pro",
        image:
          "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop",
        category: "Marketing",
        duration: "2 Months",
        author: "Emma",
        avatar: "https://i.pravatar.cc/40?img=13",
        price: 69.99,
        oldPrice: 89.99,
        rating: 4.6,
        students: 987,
      },
      {
        id: 6,
        title: "Full Stack Web Development",
        image:
          "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop",
        category: "Development",
        duration: "6 Months",
        author: "David",
        avatar: "https://i.pravatar.cc/40?img=14",
        price: 129.99,
        oldPrice: 179.99,
        rating: 4.9,
        students: 2456,
      },
    ],
    []
  );

  const [index, setIndex] = useState(0);
  const visible = courses.slice(index, index + 4);
  const canPrev = index > 0;
  const canNext = index + 4 < courses.length;

  return (
    <section className="bg-gradient-to-br from-sky-50/80 via-white to-emerald-50/50 rounded-3xl p-6 md:p-10 mt-10 shadow-lg">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Recommended For You ✨
          </h2>
          <p className="text-slate-600 mt-2">Top picks based on your interests</p>
        </div>

        <button className="mt-4 md:mt-0 px-6 py-2.5 bg-gradient-to-r from-slate-900 to-slate-700 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-slate-300 transition-all duration-300 hover:scale-[1.02]">
          See All Courses
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {visible.map((c) => (
          <div
            key={c.id}
            className="group bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden border border-slate-100 hover:shadow-[0_25px_60px_rgba(2,8,23,0.15)] hover:border-teal-100 hover:translate-y-[-6px] transition-all duration-500"
          >
            <div className="relative overflow-hidden">
              <img
                src={c.image}
                alt={c.title}
                className="w-full h-[200px] object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-semibold rounded-full">
                  {c.category}
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white/90 to-transparent" />
            </div>

            <div className="p-5">
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="flex items-center gap-2 text-slate-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  {c.duration}
                </span>
                <span className="flex items-center gap-2 text-amber-600 font-semibold">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {c.rating} ({c.students})
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-lg mb-3 group-hover:text-teal-700 transition-colors duration-300 line-clamp-2">
                {c.title}
              </h3>

              <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                Comprehensive course covering all essential concepts with real-world projects.
              </p>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={c.avatar || "https://i.pravatar.cc/40?img=12"}
                    alt={c.author}
                    className="w-9 h-9 rounded-full object-cover border-2 border-white shadow"
                  />
                  <span className="text-sm font-semibold text-slate-800">
                    {c.author}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-slate-900">
                    ${c.price}
                  </span>
                  <span className="text-sm text-slate-400 line-through">
                    ${c.oldPrice}
                  </span>
                  <span className="px-2 py-1 bg-gradient-to-r from-rose-100 to-pink-100 text-rose-600 text-xs font-bold rounded">
                    {Math.round((1 - c.price / c.oldPrice) * 100)}% OFF
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Array.from({ length: Math.ceil(courses.length / 4) }).map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i * 4)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === i * 4
                  ? "bg-teal-500 w-8"
                  : "bg-slate-300 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => setIndex((v) => Math.max(0, v - 1))}
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
            onClick={() => setIndex((v) => v + 1)}
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
      </div>
    </section>
  );
}

export default RecommendForYou