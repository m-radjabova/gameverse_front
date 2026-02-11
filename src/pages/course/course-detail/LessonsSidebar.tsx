import type { LessonApi, LessonProgressOut } from "../../../types/types";
import {
  MdLock,
  MdLockOpen,
  MdPlayCircle,
  MdCheckCircle,
  MdSchedule,
  MdExpandMore,
  MdExpandLess,
  MdArrowForward,
  MdBook,
  MdVideoLibrary
} from "react-icons/md";
import { FiBarChart2, FiClock } from "react-icons/fi";
import { TbProgress } from "react-icons/tb";
import { useState } from "react";

type Props = {
  lessonLoading: boolean;
  moduleOne: LessonApi[];
  moduleTwo: LessonApi[];
  activeLesson: LessonApi | null;
  lessonProgressMap: Map<string, LessonProgressOut>;
  switchLesson: (lesson: LessonApi) => void;
};

function renderLessonItem(
  lesson: LessonApi,
  isActive: boolean,
  lessonPercent: number,
  isCompleted: boolean,
  onClick: () => void,
) {
  return (
    <button
      key={lesson.id}
      onClick={onClick}
      className={`group w-full rounded-2xl border p-4 text-left transition-all duration-300 ${
        isActive
          ? "border-cyan-500 bg-gradient-to-r from-cyan-50 to-cyan-50/80 shadow-lg shadow-cyan-200/50 border-l-4 border-l-cyan-500"
          : "border-slate-200 bg-white hover:border-cyan-300 hover:bg-cyan-50/30 hover:shadow-md"
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Lesson Number Badge */}
        <div className={`relative flex-shrink-0 ${
          isActive ? "scale-110" : ""
        }`}>
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
            isCompleted
              ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white"
              : isActive
              ? "bg-gradient-to-br from-cyan-500 to-emerald-500 text-white"
              : "bg-gradient-to-b from-slate-100 to-slate-200 text-slate-600"
          }`}>
            {isCompleted ? (
              <MdCheckCircle size={24} />
            ) : (
              <span className="text-lg font-bold">{lesson.order}</span>
            )}
          </div>
          {lessonPercent > 0 && lessonPercent < 100 && !isCompleted && (
            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-white border border-slate-200 flex items-center justify-center">
              <div className="h-3 w-3 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400" />
            </div>
          )}
        </div>

        {/* Lesson Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <h3 className={`text-sm font-semibold line-clamp-2 ${
              isActive ? "text-cyan-800" : "text-slate-800"
            }`}>
              {lesson.title}
            </h3>
            <div className={`ml-2 flex-shrink-0 rounded-full p-1.5 ${
              lesson.is_free
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
            }`}>
              {lesson.is_free ? (
                <MdLockOpen size={14} />
              ) : (
                <MdLock size={14} />
              )}
            </div>
          </div>

          <div className="mt-2 space-y-2">
            {/* Duration & Type */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <FiClock size={12} />
                <span>{lesson.duration || 0} min</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <MdVideoLibrary size={12} />
                <span>Video Lesson</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isCompleted
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                      : lessonPercent > 0
                      ? "bg-gradient-to-r from-cyan-400 to-emerald-400"
                      : "bg-gradient-to-r from-slate-300 to-slate-400"
                  }`}
                  style={{ width: `${lessonPercent}%` }}
                />
              </div>
              <div className="mt-1 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs">
                  <TbProgress className={isCompleted ? "text-emerald-500" : "text-cyan-500"} size={12} />
                  <span className={isCompleted ? "text-emerald-600 font-medium" : "text-cyan-600 font-medium"}>
                    {lessonPercent}% complete
                  </span>
                </div>
                <span className={`text-xs font-medium ${
                  isCompleted
                    ? "text-emerald-600"
                    : lessonPercent > 0
                    ? "text-cyan-600"
                    : "text-slate-500"
                }`}>
                  {isCompleted ? (
                    <span className="flex items-center gap-1">
                      <MdCheckCircle size={12} />
                      Completed
                    </span>
                  ) : (
                    "In Progress"
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Play Button Indicator */}
        <div className={`flex-shrink-0 self-center transition-transform duration-300 ${
          isActive ? "scale-125" : "group-hover:translate-x-1"
        }`}>
          <MdPlayCircle className={
            isActive
              ? "text-cyan-500"
              : isCompleted
              ? "text-emerald-500"
              : "text-slate-400 group-hover:text-cyan-400"
          } size={24} />
        </div>
      </div>
    </button>
  );
}

function LessonsSidebar({
  lessonLoading,
  moduleOne,
  moduleTwo,
  activeLesson,
  lessonProgressMap,
  switchLesson,
}: Props) {
  const [expandedModules, setExpandedModules] = useState<number[]>([1, 2]);

  const toggleModule = (moduleNumber: number) => {
    setExpandedModules(prev =>
      prev.includes(moduleNumber)
        ? prev.filter(m => m !== moduleNumber)
        : [...prev, moduleNumber]
    );
  };

  const calculateModuleProgress = (lessons: LessonApi[]) => {
    if (!lessons.length) return 0;
    const totalProgress = lessons.reduce((acc, lesson) => {
      const progress = lessonProgressMap.get(lesson.id);
      return acc + (progress?.progress_percent || 0);
    }, 0);
    return Math.round(totalProgress / lessons.length);
  };

  const moduleOneProgress = calculateModuleProgress(moduleOne);
  const moduleTwoProgress = calculateModuleProgress(moduleTwo);
  const totalProgress = moduleTwo.length > 0
    ? Math.round((moduleOneProgress + moduleTwoProgress) / 2)
    : moduleOneProgress;

  return (
    <aside className="sticky top-20 h-fit rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-xl backdrop-blur-sm">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Course Content
            </h2>
            <p className="mt-1 text-sm text-slate-500">Interactive lesson journey</p>
          </div>
          <div className="rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 p-2 text-white">
            <MdBook size={24} />
          </div>
        </div>

        {/* Overall Progress */}
        <div className="mt-6 rounded-2xl bg-gradient-to-r from-cyan-50 to-emerald-50 p-4 border border-cyan-100/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <FiBarChart2 className="text-cyan-600" size={20} />
              <span className="font-semibold text-slate-800">Overall Progress</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-emerald-600 bg-clip-text text-transparent">
              {totalProgress}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/80">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-1000"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
            <span>{moduleOne.length + moduleTwo.length} total lessons</span>
            <span className="flex items-center gap-1">
              <MdSchedule size={12} />
              Track your learning
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      {lessonLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-24 rounded-2xl bg-slate-200" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Module 1 */}
          <div className="rounded-2xl border border-slate-200/50 overflow-hidden">
            <button
              onClick={() => toggleModule(1)}
              className="w-full bg-gradient-to-r from-cyan-50 to-emerald-50 p-4 flex items-center justify-between hover:from-cyan-100/50 hover:to-emerald-100/50 transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center">
                    <span className="text-white font-bold">01</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                    <div className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400" />
                  </div>
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-slate-900">Core Concepts</h3>
                  <p className="text-sm text-slate-500">{moduleOne.length} lessons • {moduleOneProgress}% complete</p>
                </div>
              </div>
              {expandedModules.includes(1) ? (
                <MdExpandLess className="text-slate-500" size={24} />
              ) : (
                <MdExpandMore className="text-slate-500" size={24} />
              )}
            </button>

            {expandedModules.includes(1) && (
              <div className="p-4 space-y-3">
                {moduleOne.map((lesson) => {
                  const lessonProgress = lessonProgressMap.get(lesson.id);
                  return renderLessonItem(
                    lesson,
                    activeLesson?.id === lesson.id,
                    lessonProgress?.progress_percent ?? 0,
                    !!lessonProgress?.is_completed,
                    () => switchLesson(lesson),
                  );
                })}
              </div>
            )}
          </div>

          {/* Module 2 */}
          {moduleTwo.length > 0 && (
            <div className="rounded-2xl border border-slate-200/50 overflow-hidden">
              <button
                onClick={() => toggleModule(2)}
                className="w-full bg-gradient-to-r from-violet-50 to-purple-50 p-4 flex items-center justify-between hover:from-violet-100/50 hover:to-purple-100/50 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                      <span className="text-white font-bold">02</span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                      <div className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-violet-400 to-purple-400" />
                    </div>
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-slate-900">Advanced Topics</h3>
                    <p className="text-sm text-slate-500">{moduleTwo.length} lessons • {moduleTwoProgress}% complete</p>
                  </div>
                </div>
                {expandedModules.includes(2) ? (
                  <MdExpandLess className="text-slate-500" size={24} />
                ) : (
                  <MdExpandMore className="text-slate-500" size={24} />
                )}
              </button>

              {expandedModules.includes(2) && (
                <div className="p-4 space-y-3">
                  {moduleTwo.map((lesson) => {
                    const lessonProgress = lessonProgressMap.get(lesson.id);
                    return renderLessonItem(
                      lesson,
                      activeLesson?.id === lesson.id,
                      lessonProgress?.progress_percent ?? 0,
                      !!lessonProgress?.is_completed,
                      () => switchLesson(lesson),
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Next Lesson Prompt */}
          {activeLesson && (
            <div className="rounded-2xl bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 border border-cyan-200/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Continue Learning</p>
                  <p className="text-xs text-slate-600 mt-1">Next up: Lesson {activeLesson.order + 1}</p>
                </div>
                <button className="rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 p-2 text-white hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <MdArrowForward size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}

export default LessonsSidebar;