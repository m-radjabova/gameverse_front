import { Link } from "react-router-dom";
import { formatDuration } from "../../../utils";
import type { CourseApi, CourseRatingSummary } from "../../../types/types";
import {
  MdArrowBack,
  MdStar,
  MdAccessTime,
  MdMenuBook,
  MdAttachMoney,
  MdCheckCircle,
  MdPlayCircleOutline,
} from "react-icons/md";
import { FiBarChart2 } from "react-icons/fi";
import { IoMdTime, IoMdSchool } from "react-icons/io";
import { TbCertificate } from "react-icons/tb";

type Props = {
  course: CourseApi;
  courseImage: string;
  lessonsCount: number;
  completedPercent: number;
  completedLessons: number;
  ratingSummary: CourseRatingSummary | null;
  onRate: (score: number) => Promise<void> | void;
  isRatingPending: boolean;
};

function CourseHeroSection({
  course,
  courseImage,
  lessonsCount,
  completedPercent,
  completedLessons,
  ratingSummary,
  onRate,
  isRatingPending,
}: Props) {
  const averageRating =
    ratingSummary?.average_rating ?? Number(course.rating || 0);
  const displayAverage = averageRating > 0 ? averageRating.toFixed(1) : "0.0";
  const myRating = ratingSummary?.my_rating ?? null;
  const ratingsCount = ratingSummary?.ratings_count ?? 0;

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-cyan-50/30 to-emerald-50/30 border border-cyan-100/50 shadow-2xl shadow-cyan-500/10">
      {/* Background decorative elements */}
      <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-gradient-to-br from-cyan-300/20 to-emerald-300/20 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-gradient-to-br from-emerald-300/20 to-teal-300/20 blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-gradient-to-r from-cyan-200/10 to-emerald-200/10 blur-3xl" />

      <div className="relative grid grid-cols-1 gap-8 p-2 md:p-10 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left Content */}
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 px-4 py-2 text-sm font-semibold text-cyan-700 border border-cyan-200/50">
                <IoMdSchool className="text-cyan-600" />
                {course.level || "All Levels"}
              </span>
            </div>
            <Link
              to="/courses"
              className="group inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <MdArrowBack className="transition-transform group-hover:-translate-x-1" />
              Back to Courses
            </Link>
          </div>

          {/* Title & Description */}
          <div>
            <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent leading-tight">
              {course.title}
            </h1>
            <p className="mt-4 text-lg text-slate-600 leading-relaxed">
              {course.description ||
                "Master practical skills through theory, hands-on lessons, and guided assignments in this comprehensive course."}
            </p>
          </div>

          {/* Stats Grid - 2 ta ustun */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Price Card */}
            <div className="group relative rounded-2xl border border-slate-200 bg-white p-8 hover:border-cyan-200 hover:shadow-xl transition-all">
              <div className="absolute -top-3 left-6">
                <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-1.5 text-sm font-semibold text-white shadow-md">
                  <MdAttachMoney size={14} />
                  Price
                </span>
              </div>
              <div className="mt-6">
                <p className="text-5xl font-bold text-slate-800">
                  ${course.price}
                </p>
                {course.price && (
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-lg text-slate-400 line-through">
                      ${course.price * 1.2}
                    </span>
                    <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                      Save 20%
                    </span>
                  </div>
                )}
                <p className="text-sm text-slate-500 mt-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  One-time payment
                </p>
                <p className="text-sm text-slate-500 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  Lifetime access
                </p>
              </div>
            </div>

            {/* Duration Card */}
            <div className="group relative rounded-2xl border border-slate-200 bg-white p-8 hover:border-emerald-200 hover:shadow-xl transition-all">
              <div className="absolute -top-3 left-6">
                <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-1.5 text-sm font-semibold text-white shadow-md">
                  <MdAccessTime size={14} />
                  Duration
                </span>
              </div>
              <div className="mt-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg">
                    <IoMdTime size={36} />
                  </div>
                  <div>
                    <p className="text-4xl font-bold text-emerald-700">
                      {formatDuration(course.duration || 0)}
                    </p>
                    <p className="text-base text-slate-500 mt-1">
                      Total course time
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      {Math.ceil((course.duration || 0) / 60)} hours of video
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Lessons Card */}
            <div className="group relative rounded-2xl border border-slate-200 bg-white p-8 hover:border-violet-200 hover:shadow-xl transition-all">
              <div className="absolute -top-3 left-6">
                <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 px-4 py-1.5 text-sm font-semibold text-white shadow-md">
                  <MdMenuBook size={14} />
                  Lessons
                </span>
              </div>
              <div className="mt-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 text-white shadow-lg">
                    <MdMenuBook size={36} />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <p className="text-5xl font-bold text-violet-700">
                        {lessonsCount}
                      </p>
                      <span className="text-lg text-slate-500">lessons</span>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1 text-sm text-slate-500">
                        <MdPlayCircleOutline
                          size={16}
                          className="text-violet-400"
                        />
                        <span>{lessonsCount} video lessons</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-slate-500">
                        <FiBarChart2 size={16} className="text-violet-400" />
                        <span>All levels</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rating Card */}
            <div className="group relative rounded-2xl border border-slate-200 bg-white p-8 hover:border-amber-200 hover:shadow-xl transition-all">
              <div className="absolute -top-3 left-6">
                <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-1.5 text-sm font-semibold text-white shadow-md">
                  <MdStar size={14} />
                  Rating
                </span>
              </div>

              <div className="mt-6">
                <div className="flex items-center gap-6 mb-4">
                  <p className="text-5xl font-bold text-amber-600">
                    {displayAverage}
                  </p>
                  <div>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <MdStar
                          key={i}
                          className={
                            i < Math.round(averageRating)
                              ? "text-amber-400"
                              : "text-slate-200"
                          }
                          size={20}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-slate-500 mt-2">
                      {ratingsCount} total ratings
                    </p>
                  </div>
                </div>

                {/* Your Rating */}
                <div className="mt-6 pt-4 border-t border-dashed border-slate-200">
                  <p className="text-sm font-medium text-slate-600 mb-3">
                    Rate this course
                  </p>
                  <div className="flex items-center gap-3">
                    {[1, 2, 3, 4, 5].map((score) => (
                      <button
                        key={score}
                        onClick={() => void onRate(score)}
                        disabled={isRatingPending}
                        className="group/btn relative"
                      >
                        <div
                          className={`absolute inset-0 rounded-full transition-all ${
                            score <= (myRating ?? 0)
                              ? "bg-amber-400 blur-md opacity-60 scale-125"
                              : "bg-transparent"
                          }`}
                        />
                        <div
                          className={`relative p-3 rounded-full transition-all ${
                            score <= (myRating ?? 0)
                              ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg scale-110"
                              : "bg-slate-100 text-slate-400 hover:bg-amber-50 hover:text-amber-400"
                          }`}
                        >
                          <MdStar size={20} />
                        </div>
                        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-slate-400">
                          {score}
                        </span>
                      </button>
                    ))}
                  </div>
                  {myRating && (
                    <p className="text-xs text-amber-600 mt-4 flex items-center gap-1">
                      <MdStar size={12} />
                      You rated this course {myRating}/5
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Progress Section */}
          <div className="rounded-2xl bg-gradient-to-r from-cyan-50/80 to-emerald-50/80 border border-cyan-100/50 p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 text-white">
                  <FiBarChart2 size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">
                    Learning Progress
                  </h3>
                  <p className="text-sm text-slate-500">
                    Track your course completion
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-emerald-600 bg-clip-text text-transparent">
                  {completedPercent}%
                </span>
                <p className="text-xs text-slate-500">Complete</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="h-3 w-full overflow-hidden rounded-full bg-white/80 backdrop-blur-sm">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-emerald-500 to-teal-500 shadow-lg shadow-cyan-500/30 transition-all duration-1000"
                  style={{ width: `${completedPercent}%` }}
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MdCheckCircle className="text-emerald-500" />
                  <span className="font-medium">
                    {completedLessons} completed
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MdPlayCircleOutline className="text-cyan-500" />
                    <span>{lessonsCount - completedLessons} remaining</span>
                  </div>
                  <div className="text-sm font-medium text-cyan-700">
                    {lessonsCount} total lessons
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Image Section */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/50 bg-gradient-to-br from-slate-50 to-slate-100 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-emerald-500/5 to-teal-500/5" />
          <img
            src={courseImage}
            alt={course.title}
            className="relative h-full min-h-[400px] w-full object-cover transition-transform duration-700 hover:scale-105"
          />

          {/* Image overlay badges */}
          <div className="absolute top-4 left-4">
            <div className="flex items-center gap-2 rounded-full bg-white/90 backdrop-blur-sm px-4 py-2 shadow-lg">
              <TbCertificate className="text-cyan-600" size={20} />
              <span className="text-sm font-semibold text-slate-800">
                Certificate
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CourseHeroSection;
