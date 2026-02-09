import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import useCourses from "../../hooks/useCourses";
import useCategories from "../../hooks/useCategories";
import { toMediaUrl } from "../../utils";
import type { Category } from "../../types/types";

function GetChoise() {
  const { courses, loading: coursesLoading, isError: coursesError } = useCourses();
  const { categories, loading: categoriesLoading } = useCategories();
  const [index, setIndex] = useState(0);
  const [categoryMap, setCategoryMap] = useState<Map<string, string>>(new Map());
  const navigate = useNavigate();

  const visible = courses.slice(index, index + 4);
  const canPrev = index > 0;
  const canNext = index + 4 < courses.length;

  useEffect(() => {
    if (!categories?.length) return;

    const map = new Map<string, string>();
    categories.forEach((cat: Category) => {
      map.set(String(cat.id), cat.name);
    });
    setCategoryMap(map);
  }, [categories]);

  const getCategoryName = (categoryId: string | number | undefined) => {
    if (categoryId === undefined || categoryId === null) return "Design";
    return categoryMap.get(String(categoryId)) || "Design";
  };

  const resolveImage = (image?: string | null) => {
    if (!image) {
      return "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop";
    }
    return toMediaUrl(image);
  };

  const formatDuration = (duration: number | string | null | undefined) => {
    const totalMinutes = Number(duration);
    if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) return "0m";

    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);

    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  };

  const pageCount = useMemo(() => Math.ceil(courses.length / 4), [courses.length]);

  if (coursesLoading || categoriesLoading) {
    return (
      <div className="bg-gradient-to-br from-sky-50/80 via-white to-emerald-50/50 rounded-3xl p-6 md:p-10 mt-10 shadow-lg">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-64 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow p-5">
                <div className="h-[200px] bg-slate-200 rounded mb-4" />
                <div className="h-4 bg-slate-200 rounded mb-2" />
                <div className="h-6 bg-slate-200 rounded mb-3" />
                <div className="h-12 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (coursesError) {
    return (
      <div className="bg-gradient-to-br from-sky-50/80 via-white to-emerald-50/50 rounded-3xl p-6 md:p-10 mt-10 shadow-lg text-center">
        <h3 className="text-xl font-semibold text-slate-900 mb-2">Failed to load courses</h3>
        <p className="text-slate-600">Please try again later</p>
      </div>
    );
  }

  return (
    <section className="rounded-3xl p-6 md:p-10 mt-10 shadow-lg">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Get Choise of your courses
          </h2>
          <p className="text-slate-600 mt-2">Choose from a wide range of courses</p>
        </div>

        <button
          onClick={() => navigate("/courses")}
          className="mt-4 md:mt-0 px-6 py-2.5 bg-gradient-to-r from-slate-900 to-slate-700 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-slate-300 transition-all duration-300 hover:scale-[1.02]"
        >
          See All Courses
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {visible.map((c) => {
          const oldPrice = Math.round(c.price * 1.3);
          const discount = Math.round(((oldPrice - c.price) / oldPrice) * 100);

          return (
            <div
              key={c.id}
              onClick={() => navigate(`/courses/${c.id}`)}
              className="group bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden border border-slate-100 hover:shadow-[0_25px_60px_rgba(2,8,23,0.15)] hover:border-teal-100 hover:translate-y-[-6px] transition-all duration-500 cursor-pointer"
            >
              <div className="relative overflow-hidden">
                <img
                  src={resolveImage(c.image)}
                  alt={c.title}
                  className="w-full h-[200px] object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-semibold rounded-full">
                    {getCategoryName(c.category_id)}
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white/90 to-transparent" />
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="text-slate-600">{formatDuration(c.duration)}</span>
                  <span className="flex items-center gap-2 text-amber-600 font-semibold">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {c.rating} 
                </span>
                </div>

                <h3 className="font-bold text-slate-900 text-lg mb-3 group-hover:text-teal-700 transition-colors duration-300 line-clamp-2">
                  {c.title}
                </h3>

                <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                  {c.description || "Comprehensive course covering essential concepts with practical examples."}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-slate-900">${c.price}</span>
                    <span className="text-sm text-slate-400 line-through">${oldPrice}</span>
                    <span className="px-2 py-1 bg-gradient-to-r from-rose-100 to-pink-100 text-rose-600 text-xs font-bold rounded">
                      {discount}% OFF
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Array.from({ length: pageCount }).map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i * 4)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === i * 4 ? "bg-teal-500 w-8" : "bg-slate-300 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setIndex((v) => Math.max(0, v - 4))}
            disabled={!canPrev}
            className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-xl font-bold transition-all duration-300 ${
              canPrev
                ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:scale-105 active:scale-95"
                : "bg-slate-100 border-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            &lt;
          </button>
          <button
            onClick={() => setIndex((v) => Math.min(v + 4, Math.max(courses.length - 4, 0)))}
            disabled={!canNext}
            className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-xl font-bold transition-all duration-300 ${
              canNext
                ? "bg-gradient-to-r from-teal-500 to-emerald-500 border-teal-500 text-white hover:shadow-lg hover:shadow-teal-200 hover:scale-105 active:scale-95"
                : "bg-slate-100 border-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            &gt;
          </button>
        </div>
      </div>
    </section>
  );
}

export default GetChoise;
