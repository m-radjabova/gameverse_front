import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../apiClient/apiClient";
import type { CourseProgressOut, LessonProgressOut } from "../types/types";

export type LessonProgressPayload = {
  lessonId: string;
  progress_percent: number;
  last_position_sec: number;
  is_completed?: boolean;
};

export function useCourseProgress(courseId: string) {
  return useQuery<CourseProgressOut>({
    queryKey: ["course-progress", courseId],
    queryFn: async () => (await apiClient.get(`/progress/courses/${courseId}`)).data,
    enabled: !!courseId,
  });
}

export function useLessonProgressActions(courseId: string) {
  const queryClient = useQueryClient();

  const updateLessonProgress = useMutation({
    mutationFn: async (payload: LessonProgressPayload) => {
      const { lessonId, ...body } = payload;
      return (
        await apiClient.put<LessonProgressOut>(
          `/progress/courses/${courseId}/lessons/${lessonId}`,
          body,
        )
      ).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-progress", courseId] });
    },
  });

  return {
    updateLessonProgress: updateLessonProgress.mutateAsync,
  };
}
