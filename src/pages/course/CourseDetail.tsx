import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { API_ORIGIN, toMediaUrl } from "../../utils";
import { useCourseDetail } from "../../hooks/useCourseDetail";
import { useCourseLessons } from "../../hooks/useCourseLessons";
import {
  useCourseProgress,
  useLessonProgressActions,
} from "../../hooks/useCourseProgress";
import type {
  AssignmentOut,
  LessonApi,
  LessonChatMessageOut,
} from "../../types/types";
import useContextPro from "../../hooks/useContextPro";
import { hasAnyRole } from "../../utils/roles";
import {
  useLessonChatActions,
  useLessonThreads,
  useMyLessonMessages,
  useThreadMessages,
} from "../../hooks/useLessonChat";
import {
  useAssignmentActions,
  useLessonAssignments,
  useSubmissionActions,
} from "../../hooks/useAssignments";
import { useCourseRating } from "../../hooks/useCourseRating";
import { getErrorMessage } from "../../utils/error";
import CourseHeroSection from "./course-detail/CourseHeroSection";
import LessonsSidebar from "./course-detail/LessonsSidebar";
import LessonPlayerSection from "./course-detail/LessonPlayerSection";
import LessonChatSection from "./course-detail/LessonChatSection";
import AssignmentsSection from "./course-detail/AssignmentsSection";
import {
  COURSE_FALLBACK_IMAGE,
  DEFAULT_ASSIGNMENT_FORM,
  getYouTubeEmbedUrl,
  type AssignmentFormState,
} from "./course-detail/utils";

import { MdAssignment, MdChat, MdCheckCircle } from "react-icons/md";
import { useQueryClient } from "@tanstack/react-query";
import { getAccessToken } from "../../utils/auth";
function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const courseId = id ?? "";
  const {
    state: { user },
  } = useContextPro();

  const canManageAssignments = hasAnyRole(user, ["admin", "teacher"]);
  const canModerateChat = hasAnyRole(user, ["admin", "teacher"]);
  const isStudent = hasAnyRole(user, ["student"]) || hasAnyRole(user, ["user"]);

  const { data: course, isLoading: courseLoading } = useCourseDetail(courseId);
  const {
    summary: courseRatingSummary,
    rateCourse,
    isRatingPending,
  } = useCourseRating(courseId, !!courseId);
  const { data: lessons = [], isLoading: lessonLoading } =
    useCourseLessons(courseId);
  const { data: courseProgress } = useCourseProgress(courseId);
  const { updateLessonProgress } = useLessonProgressActions(courseId);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [activeLesson, setActiveLesson] = useState<LessonApi | null>(null);
  const [assignmentForm, setAssignmentForm] = useState<AssignmentFormState>(
    DEFAULT_ASSIGNMENT_FORM,
  );
  const [editingAssignment, setEditingAssignment] =
    useState<AssignmentOut | null>(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>("");
  const [studentSubmit, setStudentSubmit] = useState({
    text_answer: "",
    file_url: "",
  });
  const [gradeDrafts, setGradeDrafts] = useState<Record<string, string>>({});
  const [chatDraft, setChatDraft] = useState("");
  const [selectedThreadId, setSelectedThreadId] = useState("");
  const [activeTab, setActiveTab] = useState<
    "assignments" | "chat" | "submissions"
  >("assignments");

  const sortedLessons = useMemo(
    () => [...lessons].sort((a, b) => a.order - b.order),
    [lessons],
  );
  const moduleOne = sortedLessons.slice(0, Math.ceil(sortedLessons.length / 2));
  const moduleTwo = sortedLessons.slice(Math.ceil(sortedLessons.length / 2));
  const activeIndex = useMemo(
    () => sortedLessons.findIndex((lesson) => lesson.id === activeLesson?.id),
    [sortedLessons, activeLesson],
  );
  const lessonProgressMap = useMemo(
    () =>
      new Map(
        (courseProgress?.lessons ?? []).map((item) => [item.lesson_id, item]),
      ),
    [courseProgress],
  );

  useEffect(() => {
    if (activeLesson || sortedLessons.length === 0) return;
    setActiveLesson(sortedLessons[0]);
  }, [activeLesson, sortedLessons]);

  const { data: assignments = [], refetch: refetchAssignments } =
    useLessonAssignments(activeLesson?.id ?? "");
  const { createAssignment, updateAssignment, deleteAssignment } =
    useAssignmentActions(activeLesson?.id ?? "");

  useEffect(() => {
    if (!assignments.length) {
      setSelectedAssignmentId("");
      return;
    }
    if (!selectedAssignmentId) setSelectedAssignmentId(assignments[0].id);
  }, [assignments, selectedAssignmentId]);

  const {
    mySubmission,
    submissions,
    submitAssignment,
    uploadAssignmentFile,
    isUploadingAssignmentFile,
    gradeSubmission,
  } = useSubmissionActions(selectedAssignmentId, {
    canViewMySubmission: isStudent,
    canViewSubmissions: canManageAssignments,
  });
  const myLessonMessages = useMyLessonMessages(
    activeLesson?.id ?? "",
    activeTab === "chat" && !canModerateChat,
  );
  const lessonThreads = useLessonThreads(
    activeLesson?.id ?? "",
    canModerateChat,
  );
  const threadMessages = useThreadMessages(selectedThreadId, canModerateChat);
  const {
    sendMyMessage,
    sendThreadMessage,
    updateMessage,
    deleteMessage,
    isSending,
    isMessageActionPending,
  } = useLessonChatActions(activeLesson?.id ?? "", selectedThreadId);
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (activeTab !== "chat") return;

    if (!canModerateChat) return;

    if (!selectedThreadId) return;

    const token = getAccessToken();
    if (!token) return;

    const wsBase = API_ORIGIN
      .replace("https://", "wss://")
      .replace("http://", "ws://");

    const url = `${wsBase}/lesson-chat/ws/threads/${selectedThreadId}?token=${token}`;

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      // console.log("WS connected:", url);
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        if (msg?.type === "new_message" && msg?.data) {
          const newMessage = msg.data;

          queryClient.setQueryData(
            ["lesson-chat", "thread-messages", selectedThreadId],
            (old: LessonChatMessageOut[] | undefined) => {
              const prev = Array.isArray(old) ? old : [];
              if (prev.some((m) => m.id === newMessage.id)) return prev;
              return [...prev, newMessage];
            },
          );
        }

        if (msg?.type === "message_updated" && msg?.data) {
          const updatedMessage = msg.data;
          queryClient.setQueryData(
            ["lesson-chat", "thread-messages", selectedThreadId],
            (old: LessonChatMessageOut[] | undefined) => {
              const prev = Array.isArray(old) ? old : [];
              return prev.map((item) =>
                item.id === updatedMessage.id ? { ...item, ...updatedMessage } : item,
              );
            },
          );
        }

        if (msg?.type === "message_deleted" && msg?.data?.id) {
          const deletedId = msg.data.id as string;
          queryClient.setQueryData(
            ["lesson-chat", "thread-messages", selectedThreadId],
            (old: LessonChatMessageOut[] | undefined) => {
              const prev = Array.isArray(old) ? old : [];
              return prev.filter((item) => item.id !== deletedId);
            },
          );
        }

        if (
          activeLesson?.id &&
          (msg?.type === "new_message" ||
            msg?.type === "message_updated" ||
            msg?.type === "message_deleted")
        ) {
          queryClient.invalidateQueries({
            queryKey: ["lesson-chat", "threads", activeLesson.id],
          });
        }
      } catch (e) {
        console.error("WS parse error", e);
      }
    };

    ws.onerror = (e) => {
      console.error("WS error", e);
    };

    ws.onclose = () => {
      // console.log("WS disconnected");
    };

    return () => {
      ws.close();
    };
  }, [
    activeTab,
    canModerateChat,
    selectedThreadId,
    queryClient,
    activeLesson?.id,
  ]);

  useEffect(() => {
    if (!canModerateChat) {
      setSelectedThreadId("");
      return;
    }
    const threads = lessonThreads.data ?? [];
    if (!threads.length) {
      setSelectedThreadId("");
      return;
    }
    const exists = threads.some((thread) => thread.id === selectedThreadId);
    if (!exists) setSelectedThreadId(threads[0].id);
  }, [canModerateChat, lessonThreads.data, selectedThreadId]);

  const resetAssignmentForm = () => {
    setAssignmentForm(DEFAULT_ASSIGNMENT_FORM);
    setEditingAssignment(null);
  };

  const persistLessonProgress = async (
    lesson: LessonApi,
    forceComplete = false,
  ) => {
    if (!courseId || !lesson.id) return;

    const existing = lessonProgressMap.get(lesson.id);
    const currentPosition = Math.max(
      0,
      Math.floor(videoRef.current?.currentTime ?? 0),
    );
    const currentDuration = Math.max(
      lesson.duration_sec || 0,
      Math.floor(videoRef.current?.duration || 0),
    );
    let progressPercent =
      currentDuration > 0
        ? Math.min(100, Math.round((currentPosition / currentDuration) * 100))
        : 0;
    progressPercent = Math.max(
      progressPercent,
      existing?.progress_percent ?? 0,
    );
    if (forceComplete) progressPercent = 100;

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
    if (activeLesson && activeLesson.id !== lesson.id)
      void persistLessonProgress(activeLesson);
    setActiveLesson(lesson);
  };

  const handleAssignmentSubmit = async () => {
    if (!activeLesson?.id) return;
    try {
      if (editingAssignment) {
        await updateAssignment({
          assignmentId: editingAssignment.id,
          payload: {
            ...assignmentForm,
            max_score: assignmentForm.max_score || null,
          },
        });
      } else {
        await createAssignment({
          ...assignmentForm,
          max_score: assignmentForm.max_score || null,
        });
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

  const handleAssignmentFileUpload = async (file: File) => {
    try {
      const uploadedUrl = await uploadAssignmentFile(file);
      setStudentSubmit((prev) => ({ ...prev, file_url: uploadedUrl }));
      toast.success("File attached");
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    }
  };

  const handleGrade = async (
    submissionId: string,
    fallbackScore?: number | null,
  ) => {
    try {
      const score =
        gradeDrafts[submissionId] ??
        (fallbackScore != null ? String(fallbackScore) : "");
      await gradeSubmission({ submissionId, score, status: "graded" });
      toast.success("Graded");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleRateCourse = async (score: number) => {
    try {
      await rateCourse(score);
      toast.success("Rating saved");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleSendChatMessage = async () => {
    const text = chatDraft.trim();
    if (!text) return;
    try {
      if (canModerateChat) await sendThreadMessage(text);
      else await sendMyMessage(text);
      setChatDraft("");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleUpdateChatMessage = async (messageId: string, text: string) => {
    try {
      await updateMessage({ messageId, text });
      toast.success("Message updated");
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    }
  };

  const handleDeleteChatMessage = async (
    messageId: string,
    targetThreadId: string,
  ) => {
    try {
      await deleteMessage({ messageId, targetThreadId });
      toast.success("Message deleted");
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    }
  };

  if (courseLoading)
    return (
      <div className="min-h-screen grid place-items-center text-slate-500">
        Loading...
      </div>
    );
  if (!course)
    return (
      <div className="min-h-screen grid place-items-center text-slate-500">
        Course not found
      </div>
    );

  const courseImage = course.image
    ? toMediaUrl(course.image)
    : COURSE_FALLBACK_IMAGE;
  const completedLessons =
    courseProgress?.completed_lessons ??
    Array.from(lessonProgressMap.values()).filter((item) => item.is_completed)
      .length;
  const completedPercent =
    courseProgress?.progress_percent ??
    (sortedLessons.length > 0 && activeIndex >= 0
      ? Math.round(((activeIndex + 1) / sortedLessons.length) * 100)
      : 0);
  const youtubeEmbedUrl = getYouTubeEmbedUrl(activeLesson?.video_url);
  const videoSource =
    activeLesson?.video_url && !youtubeEmbedUrl
      ? toMediaUrl(activeLesson.video_url)
      : "";
  const chatMessages = canModerateChat
    ? (threadMessages.data ?? [])
    : (myLessonMessages.data ?? []);
  const isChatLoading = canModerateChat
    ? threadMessages.isLoading
    : myLessonMessages.isLoading;
  const selectedThread =
    (lessonThreads.data ?? []).find((item) => item.id === selectedThreadId) ??
    null;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#e0f2fe,_#f8fafc_40%,_#ecfeff_100%)] py-8 md:py-10">
      <div className="mx-auto max-w-[1700px] space-y-6 px-4 md:px-6">
        <CourseHeroSection
          course={course}
          courseImage={courseImage}
          lessonsCount={sortedLessons.length}
          completedPercent={completedPercent}
          completedLessons={completedLessons}
          ratingSummary={courseRatingSummary.data ?? null}
          onRate={handleRateCourse}
          isRatingPending={isRatingPending}
        />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[400px_1fr]">
          <LessonsSidebar
            lessonLoading={lessonLoading}
            moduleOne={moduleOne}
            moduleTwo={moduleTwo}
            activeLesson={activeLesson}
            lessonProgressMap={lessonProgressMap}
            switchLesson={switchLesson}
          />

          <main className="space-y-5">
            <LessonPlayerSection
              activeLesson={activeLesson}
              activeIndex={activeIndex}
              lessonsCount={sortedLessons.length}
              youtubeEmbedUrl={youtubeEmbedUrl}
              videoSource={videoSource}
              videoRef={videoRef}
              lessonProgressMap={lessonProgressMap}
              persistLessonProgress={persistLessonProgress}
              onMarkCompleted={() => {
                if (!activeLesson) return;
                void persistLessonProgress(activeLesson, true);
                toast.success("Lesson marked as completed");
              }}
            />

            <section className="rounded-3xl bg-gradient-to-b from-white to-slate-50/50 p-5 shadow-xl border border-slate-200/50">
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("assignments")}
                  className={`group relative rounded-2xl p-4 text-sm font-semibold transition-all duration-300 flex flex-col items-center gap-3 overflow-hidden ${
                    activeTab === "assignments"
                      ? "bg-gradient-to-br from-cyan-50 to-emerald-50 border-2 border-cyan-400 text-cyan-700 shadow-lg shadow-cyan-200/50"
                      : "bg-white border-2 border-slate-200 text-slate-600 hover:border-cyan-300 hover:text-cyan-700 hover:shadow-md"
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`p-3 rounded-xl transition-all duration-300 ${
                      activeTab === "assignments"
                        ? "bg-gradient-to-br from-cyan-500 to-emerald-500 text-white"
                        : "bg-gradient-to-b from-slate-100 to-slate-200 text-slate-500 group-hover:from-cyan-100 group-hover:to-emerald-100 group-hover:text-cyan-600"
                    }`}
                  >
                    <MdAssignment size={24} />
                  </div>

                  {/* Label */}
                  <span>Assignments</span>

                  {/* Active indicator */}
                  {activeTab === "assignments" && (
                    <div className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 border-2 border-white" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("chat")}
                  className={`group relative rounded-2xl p-4 text-sm font-semibold transition-all duration-300 flex flex-col items-center gap-3 overflow-hidden ${
                    activeTab === "chat"
                      ? "bg-gradient-to-br from-violet-50 to-purple-50 border-2 border-violet-400 text-violet-700 shadow-lg shadow-violet-200/50"
                      : "bg-white border-2 border-slate-200 text-slate-600 hover:border-violet-300 hover:text-violet-700 hover:shadow-md"
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`p-3 rounded-xl transition-all duration-300 ${
                      activeTab === "chat"
                        ? "bg-gradient-to-br from-violet-500 to-purple-500 text-white"
                        : "bg-gradient-to-b from-slate-100 to-slate-200 text-slate-500 group-hover:from-violet-100 group-hover:to-purple-100 group-hover:text-violet-600"
                    }`}
                  >
                    <MdChat size={24} />
                  </div>

                  {/* Label */}
                  <span>Chat</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("submissions")}
                  className={`group relative rounded-2xl p-4 text-sm font-semibold transition-all duration-300 flex flex-col items-center gap-3 overflow-hidden ${
                    activeTab === "submissions"
                      ? "bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-400 text-amber-700 shadow-lg shadow-amber-200/50"
                      : "bg-white border-2 border-slate-200 text-slate-600 hover:border-amber-300 hover:text-amber-700 hover:shadow-md"
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`p-3 rounded-xl transition-all duration-300 ${
                      activeTab === "submissions"
                        ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white"
                        : "bg-gradient-to-b from-slate-100 to-slate-200 text-slate-500 group-hover:from-amber-100 group-hover:to-orange-100 group-hover:text-amber-600"
                    }`}
                  >
                    <MdCheckCircle size={24} />
                  </div>

                  {/* Label */}
                  <span>Submissions</span>
                </button>
              </div>

              {/* Animated underline */}
              <div className="mt-6 relative">
                <div className="h-1.5 w-full bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r rounded-full transition-all duration-500 ease-out ${
                      activeTab === "assignments"
                        ? "w-1/3 from-cyan-500 to-emerald-500 ml-0"
                        : activeTab === "chat"
                          ? "w-1/3 from-violet-500 to-purple-500 ml-1/3"
                          : "w-1/3 from-amber-500 to-orange-500 ml-2/3"
                    }`}
                  />
                </div>
              </div>
            </section>

            {activeTab === "chat" && (
              <LessonChatSection
                canModerateChat={canModerateChat}
                threads={lessonThreads.data ?? []}
                selectedThreadId={selectedThreadId}
                setSelectedThreadId={setSelectedThreadId}
                selectedThread={selectedThread}
                messages={chatMessages}
                isChatLoading={isChatLoading}
                userId={user?.id}
                chatDraft={chatDraft}
                setChatDraft={setChatDraft}
                onSend={handleSendChatMessage}
                isSending={isSending}
                onUpdateMessage={handleUpdateChatMessage}
                onDeleteMessage={handleDeleteChatMessage}
                isMessageActionPending={isMessageActionPending}
              />
            )}

            {activeTab === "assignments" && (
              <AssignmentsSection
                mode="assignments"
                assignments={assignments}
                selectedAssignmentId={selectedAssignmentId}
                setSelectedAssignmentId={setSelectedAssignmentId}
                canManageAssignments={canManageAssignments}
                assignmentForm={assignmentForm}
                setAssignmentForm={setAssignmentForm}
                editingAssignment={editingAssignment}
                setEditingAssignment={setEditingAssignment}
                onAssignmentSubmit={handleAssignmentSubmit}
                onDeleteAssignment={handleDeleteAssignment}
                isStudent={isStudent}
                studentSubmit={studentSubmit}
                setStudentSubmit={setStudentSubmit}
                onUploadFile={handleAssignmentFileUpload}
                isUploadingFile={isUploadingAssignmentFile}
                onStudentSubmit={handleStudentSubmit}
                mySubmission={mySubmission.data ?? null}
                submissions={submissions.data ?? []}
                gradeDrafts={gradeDrafts}
                setGradeDrafts={setGradeDrafts}
                onGrade={handleGrade}
              />
            )}

            {activeTab === "submissions" && (
              <AssignmentsSection
                mode="submissions"
                assignments={assignments}
                selectedAssignmentId={selectedAssignmentId}
                setSelectedAssignmentId={setSelectedAssignmentId}
                canManageAssignments={canManageAssignments}
                assignmentForm={assignmentForm}
                setAssignmentForm={setAssignmentForm}
                editingAssignment={editingAssignment}
                setEditingAssignment={setEditingAssignment}
                onAssignmentSubmit={handleAssignmentSubmit}
                onDeleteAssignment={handleDeleteAssignment}
                isStudent={isStudent}
                studentSubmit={studentSubmit}
                setStudentSubmit={setStudentSubmit}
                onUploadFile={handleAssignmentFileUpload}
                isUploadingFile={isUploadingAssignmentFile}
                onStudentSubmit={handleStudentSubmit}
                mySubmission={mySubmission.data ?? null}
                submissions={submissions.data ?? []}
                gradeDrafts={gradeDrafts}
                setGradeDrafts={setGradeDrafts}
                onGrade={handleGrade}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default CourseDetail;
