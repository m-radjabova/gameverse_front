import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { toMediaUrl } from "../../utils";
import { useCourseDetail } from "../../hooks/useCourseDetail";
import { useCourseLessons } from "../../hooks/useCourseLessons";
import { useCourseProgress, useLessonProgressActions } from "../../hooks/useCourseProgress";
import type { AssignmentOut, LessonApi } from "../../types/types";
import useContextPro from "../../hooks/useContextPro";
import { hasAnyRole } from "../../utils/roles";
import {
  useAssignmentActions,
  useLessonAssignments,
  useSubmissionActions,
} from "../../hooks/useAssignments";
import { getErrorMessage } from "../../utils/error";

type AssignmentFormState = {
  title: string;
  description: string;
  order: number;
  due_at: string;
  max_score: string;
  is_required: boolean;
};

const DEFAULT_ASSIGNMENT_FORM: AssignmentFormState = {
  title: "",
  description: "",
  order: 1,
  due_at: "",
  max_score: "",
  is_required: true,
};

const COURSE_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1600&auto=format&fit=crop";

function getYouTubeEmbedUrl(rawUrl?: string | null): string | null {
  if (!rawUrl) return null;

  try {
    const url = new URL(rawUrl);
    const host = url.hostname.toLowerCase();

    if (host.includes("youtu.be")) {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (host.includes("youtube.com") || host.includes("youtube-nocookie.com")) {
      const videoId = url.searchParams.get("v");
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }

      const parts = url.pathname.split("/").filter(Boolean);
      if (parts[0] === "embed" && parts[1]) {
        return `https://www.youtube.com/embed/${parts[1]}`;
      }
      if (parts[0] === "shorts" && parts[1]) {
        return `https://www.youtube.com/embed/${parts[1]}`;
      }
    }
  } catch {
    return null;
  }

  return null;
}

function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const courseId = id ?? "";
  const {
    state: { user },
  } = useContextPro();

  const canManageAssignments = hasAnyRole(user, ["admin", "teacher"]);
  const isStudent = hasAnyRole(user, ["student"]) || hasAnyRole(user, ["user"]);

  const { data: course, isLoading: courseLoading } = useCourseDetail(courseId);
  const { data: lessons = [], isLoading: lessonLoading } = useCourseLessons(courseId);
  const { data: courseProgress } = useCourseProgress(courseId);
  const { updateLessonProgress } = useLessonProgressActions(courseId);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [activeLesson, setActiveLesson] = useState<LessonApi | null>(null);

  const sortedLessons = useMemo(() => [...lessons].sort((a, b) => a.order - b.order), [lessons]);
  const activeIndex = useMemo(
    () => sortedLessons.findIndex((lesson) => lesson.id === activeLesson?.id),
    [sortedLessons, activeLesson],
  );

  const lessonProgressMap = useMemo(
    () => new Map((courseProgress?.lessons ?? []).map((item) => [item.lesson_id, item])),
    [courseProgress],
  );

  useEffect(() => {
    if (activeLesson || sortedLessons.length === 0) return;
    setActiveLesson(sortedLessons[0]);
  }, [activeLesson, sortedLessons]);

  const moduleOne = sortedLessons.slice(0, Math.ceil(sortedLessons.length / 2));
  const moduleTwo = sortedLessons.slice(Math.ceil(sortedLessons.length / 2));

  const { data: assignments = [], refetch: refetchAssignments } = useLessonAssignments(
    activeLesson?.id ?? "",
  );
  const { createAssignment, updateAssignment, deleteAssignment } = useAssignmentActions(
    activeLesson?.id ?? "",
  );

  const [assignmentForm, setAssignmentForm] = useState<AssignmentFormState>(DEFAULT_ASSIGNMENT_FORM);
  const [editingAssignment, setEditingAssignment] = useState<AssignmentOut | null>(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>("");
  const [studentSubmit, setStudentSubmit] = useState({ text_answer: "", file_url: "" });
  const [gradeDrafts, setGradeDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!assignments.length) {
      setSelectedAssignmentId("");
      return;
    }
    if (!selectedAssignmentId) setSelectedAssignmentId(assignments[0].id);
  }, [assignments, selectedAssignmentId]);

  const { mySubmission, submissions, submitAssignment, gradeSubmission } = useSubmissionActions(
    selectedAssignmentId,
  );

  const formatDuration = (duration: number | string | null | undefined) => {
    const totalMinutes = Number(duration);
    if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) return "0m";

    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);

    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  };

  const formatDate = (value?: string | null) => {
    if (!value) return "No deadline";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Invalid date";
    return date.toLocaleString();
  };

  const getSubmitterLabel = (item: {
    user_id: string;
    username?: string | null;
    full_name?: string | null;
    user?: { username?: string | null; full_name?: string | null; name?: string | null } | null;
  }) => {
    return (
      item.full_name ||
      item.username ||
      item.user?.full_name ||
      item.user?.name ||
      item.user?.username ||
      item.user_id
    );
  };

  const resetAssignmentForm = () => {
    setAssignmentForm(DEFAULT_ASSIGNMENT_FORM);
    setEditingAssignment(null);
  };

  const persistLessonProgress = async (lesson: LessonApi, forceComplete = false) => {
    if (!courseId || !lesson?.id) return;

    const existing = lessonProgressMap.get(lesson.id);
    const currentPosition = Math.max(0, Math.floor(videoRef.current?.currentTime ?? 0));
    const currentDuration = Math.max(lesson.duration_sec || 0, Math.floor(videoRef.current?.duration || 0));

    let progressPercent =
      currentDuration > 0 ? Math.min(100, Math.round((currentPosition / currentDuration) * 100)) : 0;
    progressPercent = Math.max(progressPercent, existing?.progress_percent ?? 0);

    if (forceComplete) {
      progressPercent = 100;
    }

    try {
      await updateLessonProgress({
        lessonId: lesson.id,
        progress_percent: progressPercent,
        last_position_sec: forceComplete ? currentDuration : currentPosition,
        is_completed: forceComplete || progressPercent >= 100,
      });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const switchLesson = (lesson: LessonApi) => {
    if (activeLesson && activeLesson.id !== lesson.id) {
      void persistLessonProgress(activeLesson);
    }
    setActiveLesson(lesson);
  };

  const handleAssignmentSubmit = async () => {
    if (!activeLesson?.id) return;
    try {
      if (editingAssignment) {
        await updateAssignment({
          assignmentId: editingAssignment.id,
          payload: { ...assignmentForm, max_score: assignmentForm.max_score || null },
        });
      } else {
        await createAssignment({ ...assignmentForm, max_score: assignmentForm.max_score || null });
      }
      resetAssignmentForm();
      await refetchAssignments();
      toast.success("Saved");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    try {
      await deleteAssignment(assignmentId);
      await refetchAssignments();
      toast.success("Deleted");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleStudentSubmit = async () => {
    try {
      await submitAssignment(studentSubmit);
      setStudentSubmit({ text_answer: "", file_url: "" });
      toast.success("Submitted");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleGrade = async (submissionId: string) => {
    try {
      await gradeSubmission({
        submissionId,
        score: gradeDrafts[submissionId] ?? "",
        status: "graded",
      });
      toast.success("Graded");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (courseLoading) {
    return <div className="min-h-screen grid place-items-center text-slate-500">Loading...</div>;
  }

  if (!course) {
    return <div className="min-h-screen grid place-items-center text-slate-500">Course not found</div>;
  }

  const courseImage = course.image ? toMediaUrl(course.image) : COURSE_FALLBACK_IMAGE;
  const completedLessons =
    courseProgress?.completed_lessons ??
    Array.from(lessonProgressMap.values()).filter((item) => item.is_completed).length;
  const completedPercent =
    courseProgress?.progress_percent ??
    (sortedLessons.length > 0 && activeIndex >= 0
      ? Math.round(((activeIndex + 1) / sortedLessons.length) * 100)
      : 0);
  const youtubeEmbedUrl = getYouTubeEmbedUrl(activeLesson?.video_url);
  const videoSource =
    activeLesson?.video_url && !youtubeEmbedUrl ? toMediaUrl(activeLesson.video_url) : "";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#e0f2fe,_#f8fafc_40%,_#ecfeff_100%)] py-8 md:py-10">
      <div className="mx-auto max-w-[1240px] px-4 md:px-6 space-y-6">
        <section className="relative overflow-hidden rounded-3xl border border-cyan-100 bg-white shadow-[0_25px_80px_rgba(14,116,144,0.18)]">
          <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-cyan-200/40 blur-3xl" />
          <div className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-emerald-200/40 blur-3xl" />

          <div className="relative grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-5 p-5 md:p-8">
            <div>
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="inline-flex items-center rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-700">
                  {course.level || "All levels"}
                </span>
                <Link
                  to="/courses"
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-cyan-200 hover:text-cyan-700"
                >
                  Back to courses
                </Link>
              </div>

              <h1 className="text-2xl md:text-4xl font-extrabold leading-tight text-slate-900">{course.title}</h1>
              <p className="mt-3 max-w-2xl text-sm md:text-base leading-relaxed text-slate-600">
                {course.description || "This course covers practical theory, lesson walkthroughs and guided assignments."}
              </p>

              <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">Price</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">${course.price}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">Rating</p>
                  <p className="mt-1 text-lg font-bold text-amber-500">{course.rating || 0}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">Duration</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">{formatDuration(course.duration || 0)}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">Lessons</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">{sortedLessons.length}</p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-cyan-100 bg-gradient-to-r from-cyan-50 to-emerald-50 p-4">
                <div className="mb-2 flex items-center justify-between text-xs text-slate-600">
                  <span>Current progress</span>
                  <span className="font-semibold text-cyan-700">{completedPercent}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/80">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500"
                    style={{ width: `${completedPercent}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Completed lessons: {completedLessons}/{sortedLessons.length || 0}
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-100">
              <img src={courseImage} alt={course.title} className="h-full min-h-[320px] w-full object-cover" />
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-6">
          <aside className="h-fit rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-bold text-slate-900">Course content</h2>
            {lessonLoading ? (
              <p className="text-xs text-slate-500">Loading lessons...</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                    Module 1: Core concepts
                  </p>
                  <div className="space-y-2">
                    {moduleOne.map((lesson) => {
                      const isActive = activeLesson?.id === lesson.id;
                      const lessonProgress = lessonProgressMap.get(lesson.id);
                      const lessonPercent = lessonProgress?.progress_percent ?? 0;

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => switchLesson(lesson)}
                          className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                            isActive
                              ? "border-cyan-500 bg-cyan-50 shadow-sm"
                              : "border-slate-200 bg-white hover:border-cyan-300"
                          }`}
                        >
                          <p className="text-sm font-semibold text-slate-800 line-clamp-2">
                            Lesson {lesson.order}: {lesson.title}
                          </p>
                          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                            <span>{lesson.duration || 0} min</span>
                            <span>{lesson.is_free ? "Free" : "Locked"}</span>
                          </div>
                          <div className="mt-1 flex items-center justify-between text-[11px]">
                            <span className="text-cyan-600">{lessonPercent}% watched</span>
                            <span className={lessonProgress?.is_completed ? "text-emerald-600" : "text-slate-500"}>
                              {lessonProgress?.is_completed ? "Completed" : "In progress"}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {moduleTwo.length > 0 && (
                  <div>
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                      Module 2: Deep dive
                    </p>
                    <div className="space-y-2">
                      {moduleTwo.map((lesson) => {
                        const isActive = activeLesson?.id === lesson.id;
                        const lessonProgress = lessonProgressMap.get(lesson.id);
                        const lessonPercent = lessonProgress?.progress_percent ?? 0;

                        return (
                          <button
                            key={lesson.id}
                            onClick={() => switchLesson(lesson)}
                            className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                              isActive
                                ? "border-cyan-500 bg-cyan-50 shadow-sm"
                                : "border-slate-200 bg-white hover:border-cyan-300"
                            }`}
                          >
                            <p className="text-sm font-semibold text-slate-800 line-clamp-2">
                              Lesson {lesson.order}: {lesson.title}
                            </p>
                            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                              <span>{lesson.duration || 0} min</span>
                              <span>{lesson.is_free ? "Free" : "Locked"}</span>
                            </div>
                            <div className="mt-1 flex items-center justify-between text-[11px]">
                              <span className="text-cyan-600">{lessonPercent}% watched</span>
                              <span className={lessonProgress?.is_completed ? "text-emerald-600" : "text-slate-500"}>
                                {lessonProgress?.is_completed ? "Completed" : "In progress"}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </aside>

          <main className="space-y-5">
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-gradient-to-r from-white to-cyan-50 px-4 py-3 md:px-5">
                <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
                  <span>{activeLesson ? formatDuration(activeLesson.duration_sec || 0) : "8-12 min"}</span>
                  <span>
                    Lesson {Math.max(activeIndex + 1, 1)} of {sortedLessons.length || 1}
                  </span>
                </div>
                <h3 className="mt-2 text-xl md:text-2xl font-bold text-slate-900">
                  Lesson {activeLesson?.order || 1}: {activeLesson?.title || "Lesson"}
                </h3>
              </div>

              <div className="p-4 md:p-5">
                <div className="overflow-hidden rounded-2xl bg-black shadow-lg">
                  {youtubeEmbedUrl ? (
                    <iframe
                      className="aspect-video w-full"
                      src={youtubeEmbedUrl}
                      title={activeLesson?.title || "YouTube lesson"}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : activeLesson?.video_url ? (
                    <video
                      ref={videoRef}
                      className="aspect-video w-full object-cover"
                      controls
                      autoPlay
                      src={videoSource}
                      onLoadedMetadata={(event) => {
                        if (!activeLesson) return;
                        const saved = lessonProgressMap.get(activeLesson.id);
                        if (!saved || saved.is_completed || saved.last_position_sec <= 0) return;

                        const video = event.currentTarget;
                        const safeMax = Math.max(0, Math.floor((video.duration || activeLesson.duration_sec || 0) - 3));
                        video.currentTime = Math.min(saved.last_position_sec, safeMax);
                      }}
                      onPause={() => {
                        if (activeLesson) {
                          void persistLessonProgress(activeLesson);
                        }
                      }}
                      onEnded={() => {
                        if (activeLesson) {
                          void persistLessonProgress(activeLesson, true);
                        }
                      }}
                    />
                  ) : (
                    <div className="aspect-video grid place-items-center text-slate-300">Video not available</div>
                  )}
                </div>

                <p className="mt-4 text-sm leading-relaxed text-slate-600">
                  {activeLesson?.description || "Lesson content with examples and practice tasks."}
                </p>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[11px] uppercase tracking-wider text-slate-400">Order</p>
                    <p className="mt-1 text-base font-semibold text-slate-900">{activeLesson?.order || 1}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[11px] uppercase tracking-wider text-slate-400">Type</p>
                    <p className="mt-1 text-base font-semibold text-slate-900">
                      {activeLesson?.is_free ? "Free preview" : "Premium lesson"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[11px] uppercase tracking-wider text-slate-400">Rating</p>
                    <p className="mt-1 text-base font-semibold text-slate-900">{activeLesson?.rating ?? 0}</p>
                  </div>
                </div>

                {activeLesson && (
                  <div className="mt-4">
                    <button
                      onClick={async () => {
                        await persistLessonProgress(activeLesson, true);
                        toast.success("Lesson marked as completed");
                      }}
                      className="rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-2 text-xs font-semibold text-white"
                    >
                      Mark Lesson as Completed
                    </button>
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-800">Lesson chat</p>
                <button className="rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-1.5 text-xs font-semibold text-white shadow-sm">
                  Chat
                </button>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-slate-900">Assignments</p>
                <p className="text-xs text-slate-500">Total: {assignments.length}</p>
              </div>

              {!assignments.length && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                  Assignments yo'q
                </div>
              )}

              {!!assignments.length && (
                <div className="space-y-2">
                  {assignments
                    .slice()
                    .sort((a, b) => a.order - b.order)
                    .map((assignment) => (
                      <div
                        key={assignment.id}
                        className={`rounded-2xl border p-3 transition ${
                          selectedAssignmentId === assignment.id
                            ? "border-cyan-500 bg-cyan-50"
                            : "border-slate-200 bg-white"
                        }`}
                      >
                        <button
                          className="w-full text-left"
                          onClick={() => setSelectedAssignmentId(assignment.id)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-semibold text-slate-800">{assignment.title}</p>
                            <span className="rounded-full bg-white px-2 py-0.5 text-[11px] text-slate-500">
                              #{assignment.order}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-500">{assignment.description || "No description"}</p>
                          <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-500">
                            <span className="rounded-full bg-white px-2 py-0.5">Due: {formatDate(assignment.due_at)}</span>
                            <span className="rounded-full bg-white px-2 py-0.5">
                              Max score: {assignment.max_score ?? "-"}
                            </span>
                            <span className="rounded-full bg-white px-2 py-0.5">
                              Required: {assignment.is_required ? "Yes" : "No"}
                            </span>
                          </div>
                        </button>

                        {canManageAssignments && (
                          <div className="mt-3 flex gap-2">
                            <button
                              className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
                              onClick={() => {
                                setEditingAssignment(assignment);
                                setAssignmentForm({
                                  title: assignment.title,
                                  description: assignment.description || "",
                                  order: assignment.order,
                                  due_at: assignment.due_at
                                    ? new Date(assignment.due_at).toISOString().slice(0, 16)
                                    : "",
                                  max_score: assignment.max_score ? String(assignment.max_score) : "",
                                  is_required: assignment.is_required,
                                });
                              }}
                            >
                              Edit
                            </button>
                            <button
                              className="rounded-lg bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700"
                              onClick={() => handleDeleteAssignment(assignment.id)}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}

              {canManageAssignments && (
                <div className="space-y-2 border-t border-slate-200 pt-4">
                  <p className="text-sm font-semibold text-slate-800">
                    {editingAssignment ? "Update assignment" : "Create assignment"}
                  </p>
                  <input
                    value={assignmentForm.title}
                    onChange={(e) => setAssignmentForm((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Title"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                  <textarea
                    value={assignmentForm.description}
                    onChange={(e) =>
                      setAssignmentForm((prev) => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="Description"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <input
                      type="number"
                      value={assignmentForm.order}
                      onChange={(e) =>
                        setAssignmentForm((prev) => ({ ...prev, order: Number(e.target.value) }))
                      }
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      placeholder="Order"
                    />
                    <input
                      type="number"
                      value={assignmentForm.max_score}
                      onChange={(e) =>
                        setAssignmentForm((prev) => ({ ...prev, max_score: e.target.value }))
                      }
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      placeholder="Max score"
                    />
                    <input
                      type="datetime-local"
                      value={assignmentForm.due_at}
                      onChange={(e) =>
                        setAssignmentForm((prev) => ({ ...prev, due_at: e.target.value }))
                      }
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <button
                    onClick={handleAssignmentSubmit}
                    className="rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-3 py-2 text-sm font-semibold text-white"
                  >
                    {editingAssignment ? "Update" : "Create"}
                  </button>
                </div>
              )}

              {isStudent && selectedAssignmentId && (
                <div className="space-y-2 border-t border-slate-200 pt-4">
                  <p className="text-sm font-semibold text-slate-800">My submission</p>
                  <textarea
                    value={studentSubmit.text_answer}
                    onChange={(e) =>
                      setStudentSubmit((prev) => ({ ...prev, text_answer: e.target.value }))
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    placeholder="Text answer"
                  />
                  <input
                    value={studentSubmit.file_url}
                    onChange={(e) =>
                      setStudentSubmit((prev) => ({ ...prev, file_url: e.target.value }))
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    placeholder="File URL"
                  />
                  <button
                    onClick={handleStudentSubmit}
                    className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white"
                  >
                    Submit
                  </button>
                  {mySubmission.data && (
                    <p className="text-xs text-slate-500">
                      Status: {mySubmission.data.status}, score: {mySubmission.data.score ?? "-"}
                    </p>
                  )}
                </div>
              )}

              {canManageAssignments && selectedAssignmentId && !!submissions.data?.length && (
                <div className="space-y-2 border-t border-slate-200 pt-4">
                  <p className="text-sm font-semibold text-slate-800">Submissions</p>
                  {submissions.data.map((item) => (
                    <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs text-slate-600">User: {getSubmitterLabel(item)}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Submitted: {formatDate(item.submitted_at)} | Status: {item.status}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <input
                          type="number"
                          value={gradeDrafts[item.id] ?? ""}
                          onChange={(e) =>
                            setGradeDrafts((prev) => ({ ...prev, [item.id]: e.target.value }))
                          }
                          className="w-24 rounded border border-slate-200 px-2 py-1 text-xs"
                          placeholder="Score"
                        />
                        <button
                          onClick={() => handleGrade(item.id)}
                          className="rounded bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white"
                        >
                          Grade
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

export default CourseDetail;
