import { useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import apiClient from "../../apiClient/apiClient";
import useCourses from "../../hooks/useCourses";
import useContextPro from "../../hooks/useContextPro";
import type { CourseApi, CourseProgressOut } from "../../types/types";
import { toMediaUrl } from "../../utils";

import {
  FiPlayCircle,
  FiTrendingUp,
  FiBookOpen,
  FiClock,
  FiChevronLeft,
  FiChevronRight,
  FiTarget,
  FiLoader
} from "react-icons/fi";
import { HiOutlineSparkles, HiOutlineAcademicCap } from "react-icons/hi2";
import { MdOutlineAutoStories } from "react-icons/md";

type ContinueCourseCard = {
  id: string;
  title: string;
  lessonText: string;
  progress: number;
  image: string;
  completedLessons: number;
  totalLessons: number;
  lastAccessed?: string;
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=600&auto=format&fit=crop";

function buildLessonText(progress: CourseProgressOut): string {
  const completed = progress.completed_lessons ?? 0;
  const total = progress.total_lessons ?? 0;
  if (!total) return "No lessons available";
  if (completed >= total) return "Course Completed! 🎉";
  return `Lesson ${Math.min(completed + 1, total)} of ${total}`;
}

function formatLastAccessed(date: string): string {
  const now = new Date();
  const last = new Date(date);
  const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

function mapToCard(course: CourseApi, progress: CourseProgressOut): ContinueCourseCard {
  return {
    id: course.id,
    title: course.title,
    lessonText: buildLessonText(progress),
    progress: Math.max(0, Math.min(100, Math.round(progress.progress_percent ?? 0))),
    image: course.image ? toMediaUrl(course.image) : FALLBACK_IMAGE,
    completedLessons: progress.completed_lessons ?? 0,
    totalLessons: progress.total_lessons ?? 0
  };
}

function WelcomeBack() {
  const navigate = useNavigate();
  const { courses, loading: coursesLoading, isError: coursesError } = useCourses();
  const { state: { user } } = useContextPro();

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
      .filter((item): item is ContinueCourseCard => item !== null)
      .sort((a, b) => b.progress - a.progress);
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

  const totalProgress = continueCourses.reduce((sum, course) => sum + course.progress, 0);
  const avgProgress = continueCourses.length > 0 ? Math.round(totalProgress / continueCourses.length) : 0;
  const totalLessonsCompleted = continueCourses.reduce((sum, course) => sum + course.completedLessons, 0);
  const totalLessons = continueCourses.reduce((sum, course) => sum + course.totalLessons, 0);

  if (coursesLoading || isProgressLoading) {
    return (
      <section className="rounded-3xl p-6 md:p-10 mt-10 bg-gradient-to-br from-teal-50 via-white to-emerald-50/30 shadow-xl border border-slate-100">
        <div className="animate-pulse">
          <div className="flex justify-between items-center mb-8">
            <div>
              <div className="h-9 bg-slate-200 rounded-lg w-64 mb-2" />
              <div className="h-4 bg-slate-200 rounded w-48" />
            </div>
            <div className="h-11 bg-slate-200 rounded-xl w-36" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200 h-[380px]">
                <div className="h-[180px] bg-slate-200 rounded-xl mb-4" />
                <div className="h-6 bg-slate-200 rounded mb-3" />
                <div className="h-4 bg-slate-200 rounded w-32 mb-6" />
                <div className="h-2 bg-slate-100 rounded-full mb-2" />
                <div className="h-10 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (coursesError) {
    return (
      <section className="rounded-3xl p-6 md:p-10 mt-10 bg-gradient-to-br from-rose-50 via-white to-pink-50/30 shadow-xl border border-rose-100">
        <div className="text-center py-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-rose-100 to-pink-100 flex items-center justify-center">
            <FiLoader className="w-8 h-8 text-rose-500 animate-spin" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Unable to Load Courses</h3>
          <p className="text-slate-600 mb-6">Please check your connection and try again</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white font-semibold rounded-xl hover:shadow-xl transition-all"
          >
            Retry Loading
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className=" max-w-[1700px] mx-auto px-4 rounded-3xl p-2 md:p-10 ">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500">
              <HiOutlineAcademicCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                Welcome back, {profileName}! 👋
              </h2>
              <p className="text-slate-600 mt-2">
                Continue your learning journey where you left off
              </p>
            </div>
          </div>

          {/* Progress Stats */}
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-teal-50 to-emerald-50 flex items-center justify-center">
                  <FiTarget className="w-4 h-4 text-teal-600" />
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-900">{avgProgress}%</div>
                  <div className="text-xs text-slate-500">Avg. Progress</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 flex items-center justify-center">
                  <FiBookOpen className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-900">{totalLessonsCompleted}/{totalLessons}</div>
                  <div className="text-xs text-slate-500">Lessons</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 flex items-center justify-center">
                  <FiTrendingUp className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-900">{continueCourses.length}</div>
                  <div className="text-xs text-slate-500">Active Courses</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate("/courses/explore")}
          className="mt-6 lg:mt-0 px-6 py-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-slate-300/50 transition-all duration-300 hover:scale-[1.02] flex items-center gap-2 group"
        >
          <MdOutlineAutoStories className="w-5 h-5" />
          Explore All Courses
        </button>
      </div>

      {/* Main Content */}
      {visible.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-gradient-to-br from-white to-slate-50/50 p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-slate-100 to-slate-200 flex items-center justify-center">
            <FiPlayCircle className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No Active Courses</h3>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">
            Start learning to see your progress here. Browse courses and begin your journey!
          </p>
          <button
            onClick={() => navigate("/courses/explore")}
            className="px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
          >
            Start Learning
          </button>
        </div>
      ) : (
        <>
          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {visible.map((course) => (
              <div
                key={course.id}
                onClick={() => navigate(`/courses/${course.id}`)}
                className="group bg-white rounded-2xl overflow-hidden border border-slate-200
                shadow-[0_8px_30px_rgba(0,0,0,0.05)]
                hover:shadow-[0_25px_60px_rgba(2,132,199,0.15)]
                hover:border-teal-200 hover:translate-y-[-8px]
                transition-all duration-500 cursor-pointer
                flex flex-col h-full"
              >
                {/* Image Section */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />
                  
                  {/* Progress Badge */}
                  <div className="absolute top-4 right-4">
                    <div className="px-3 py-1.5 bg-white/95 backdrop-blur-sm text-slate-800 text-xs font-bold rounded-full border border-slate-200">
                      {course.progress}% Complete
                    </div>
                  </div>
                  
                  {/* User Avatar */}
                  <div className="absolute bottom-4 left-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full border-2 border-white/80 bg-gradient-to-r from-teal-500 to-emerald-500 flex items-center justify-center">
                        {profileAvatar ? (
                          <img src={profileAvatar} alt={profileName} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold text-white">{profileInitial}</span>
                        )}
                      </div>
                      <span className="text-sm font-medium text-white/95">{profileName}</span>
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-5 flex-1 flex flex-col">
                  {/* Lesson Info */}
                  <div className="flex items-center justify-between text-sm mb-3">
                    <div className="flex items-center gap-2 text-slate-600">
                      <FiClock className="w-4 h-4" />
                      <span>{course.lessonText}</span>
                    </div>
                    {course.lastAccessed && (
                      <div className="text-xs text-slate-500">
                        {formatLastAccessed(course.lastAccessed)}
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-slate-900 text-lg mb-3 group-hover:text-teal-700 transition-colors duration-300 line-clamp-2 min-h-[56px]">
                    {course.title}
                  </h3>

                  {/* Progress Bar */}
                  <div className="mt-auto">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-700 font-medium">Your Progress</span>
                      <span className="text-teal-600 font-bold">{course.progress}%</span>
                    </div>
                    <div className="relative h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="absolute h-full rounded-full bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-500 transition-all duration-700 group-hover:shadow-[0_0_20px_rgba(6,148,162,0.4)]"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>{course.completedLessons} completed</span>
                      <span>{course.totalLessons} total</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button className="mt-6 w-full py-3 bg-gradient-to-r from-teal-50 to-emerald-50 text-teal-700 font-semibold rounded-xl border border-teal-100 hover:from-teal-100 hover:to-emerald-100 hover:border-teal-300 hover:text-teal-800 transition-all duration-300 flex items-center justify-center gap-2 group/btn">
                    <FiPlayCircle className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                    {course.progress >= 100 ? "Review Course" : "Continue Learning"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalCards > perPage && (
            <div className="mt-8 flex items-center justify-center">
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={!canPrev}
                  className={`flex items-center justify-center w-12 h-12 rounded-xl border transition-all ${
                    canPrev
                      ? "bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 hover:scale-105 active:scale-95"
                      : "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  <FiChevronLeft className="w-5 h-5" />
                </button>
                <div>
                  {maxPage > 2 && (
                    <>
                      <span className="text-slate-400">...</span>
                      <button
                        onClick={() => setPage(maxPage)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                          page === maxPage
                            ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white"
                            : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {maxPage + 1}
                      </button>
                    </>
                  )}
                </div>
                <button
                  onClick={() => setPage(p => Math.min(maxPage, p + 1))}
                  disabled={!canNext}
                  className={`flex items-center justify-center w-12 h-12 rounded-xl border transition-all ${
                    canNext
                      ? "bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 hover:scale-105 active:scale-95"
                      : "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  <FiChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Learning Tip */}
          <div className="mt-8 rounded-2xl border border-teal-100 bg-gradient-to-r from-teal-50 to-emerald-50 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-teal-500 to-emerald-500 flex items-center justify-center">
                <HiOutlineSparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-teal-900">Learning Tip</h4>
                <p className="text-sm text-teal-700">
                  Consistency is key! Try to spend at least 30 minutes each day on your courses for optimal progress.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export default WelcomeBack;
