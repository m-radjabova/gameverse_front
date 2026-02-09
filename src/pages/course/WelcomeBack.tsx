import { useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import apiClient from "../../apiClient/apiClient";
import useCourses from "../../hooks/useCourses";
import useContextPro from "../../hooks/useContextPro";
import type { CourseApi, CourseProgressOut } from "../../types/types";
import { toMediaUrl } from "../../utils";

type ContinueCourseCard = {
  id: string;
  title: string;
  lessonText: string;
  progress: number;
  image: string;
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop";

function buildLessonText(progress: CourseProgressOut): string {
  const completed = progress.completed_lessons ?? 0;
  const total = progress.total_lessons ?? 0;
  if (!total) return "No lessons yet";
  return `Lesson ${Math.min(completed + 1, total)} of ${total}`;
}

function mapToCard(course: CourseApi, progress: CourseProgressOut): ContinueCourseCard {
  return {
    id: course.id,
    title: course.title,
    lessonText: buildLessonText(progress),
    progress: Math.max(0, Math.min(100, Math.round(progress.progress_percent ?? 0))),
    image: course.image ? toMediaUrl(course.image) : FALLBACK_IMAGE,
  };
}

function WelcomeBack() {
  const navigate = useNavigate();
  const { courses, loading: coursesLoading, isError: coursesError } = useCourses();
  const {
    state: { user },
  } = useContextPro();

  const progressQueries = useQueries({
    queries: courses.map((course) => ({
      queryKey: ["course-progress", course.id],
      queryFn: async () => (await apiClient.get<CourseProgressOut>(`/progress/courses/${course.id}`)).data,
      retry: false,
    })),
  });

  const continueCourses = useMemo(() => {
    return courses
      .map((course, index) => {
        const progress = progressQueries[index]?.data;
        if (!progress) return null;
        if ((progress.progress_percent ?? 0) <= 0) return null;
        return mapToCard(course, progress);
      })
      .filter((item): item is ContinueCourseCard => item !== null);
  }, [courses, progressQueries]);

  const isProgressLoading = progressQueries.some((query) => query.isLoading);

  const [page, setPage] = useState(0);
  const perPage = 3;

  const totalCards = continueCourses.length;
  const maxPage = Math.max(0, Math.ceil(totalCards / perPage) - 1);
  const safePage = Math.min(page, maxPage);
  const start = safePage * perPage;
  const visible = continueCourses.slice(start, start + perPage);

  const canPrev = safePage > 0;
  const canNext = start + perPage < totalCards;
  const profileName = user?.username || "Learner";
  const profileAvatar = user?.avatar ? toMediaUrl(user.avatar) : null;
  const profileInitial = profileName.charAt(0).toUpperCase();

  if (coursesLoading || isProgressLoading) {
    return (
      <section className="bg-gradient-to-br from-sky-50/80 to-white rounded-3xl p-6 md:p-10 shadow-lg">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Welcome back!</h2>
        <p className="text-slate-600 mt-2">Loading your course progress...</p>
      </section>
    );
  }

  if (coursesError) {
    return (
      <section className="bg-gradient-to-br from-sky-50/80 to-white rounded-3xl p-6 md:p-10 shadow-lg">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Welcome back!</h2>
        <p className="text-rose-600 mt-2">Failed to load your courses.</p>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-br from-sky-50/80 to-white rounded-3xl p-6 md:p-10 shadow-lg">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Welcome back!
          </h2>
          <div className="mt-3 inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
            {profileAvatar ? (
              <img src={profileAvatar} alt={profileName} className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 text-xs font-bold text-white">
                {profileInitial}
              </span>
            )}
            <p className="text-sm text-slate-700">
              Continue from where you left off, <span className="font-semibold">{profileName}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("/courses")}
          className="mt-4 md:mt-0 px-6 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-teal-200 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
        >
          View all courses
        </button>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-6 text-center">
          <p className="text-slate-700 font-semibold">You have not started any course yet.</p>
          <p className="text-slate-500 text-sm mt-1">Open courses and start learning to see progress here.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {visible.map((course) => (
              <div
                key={course.id}
                className="group bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden border border-slate-100 hover:shadow-[0_20px_60px_rgba(2,8,23,0.12)] hover:border-teal-100 hover:translate-y-[-4px] transition-all duration-300"
              >
                <div className="p-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent z-0" />
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-[180px] object-cover rounded-xl group-hover:scale-[1.03] transition-transform duration-500"
                  />
                  <div className="absolute top-6 left-6 z-10">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-semibold rounded-full">
                      {course.lessonText}
                    </span>
                  </div>
                  <div className="absolute bottom-6 left-6 z-10 inline-flex items-center gap-2 rounded-full bg-slate-900/60 px-2.5 py-1.5 backdrop-blur-sm">
                    {profileAvatar ? (
                      <img src={profileAvatar} alt={profileName} className="h-6 w-6 rounded-full object-cover ring-1 ring-white/60" />
                    ) : (
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-white/90 text-[10px] font-bold text-slate-800">
                        {profileInitial}
                      </span>
                    )}
                    <span className="text-[11px] font-medium text-white/95">{profileName}</span>
                  </div>
                </div>

                <div className="px-6 pb-6">
                  <h3 className="font-bold text-slate-900 text-lg group-hover:text-teal-700 transition-colors duration-300 line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-500">Learning profile: @{profileName}</p>

                  <div className="mt-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-700 font-medium">Progress</span>
                      <span className="text-teal-600 font-bold">{course.progress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/courses/${course.id}`)}
                    className="mt-6 w-full py-3 bg-gradient-to-r from-slate-50 to-white text-slate-800 font-semibold rounded-xl border border-slate-200 hover:border-teal-300 hover:bg-gradient-to-r hover:from-teal-50 hover:to-emerald-50 hover:text-teal-700 transition-all duration-300"
                  >
                    Continue learning
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
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
              onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
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
        </>
      )}
    </section>
  );
}

export default WelcomeBack;
