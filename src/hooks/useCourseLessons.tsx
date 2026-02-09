import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../apiClient/apiClient";
import type { LessonApi } from "../types/types";
import { isValidHttpUrl } from "../utils/validation";

type LessonPayload = {
  course_id: string;
  title: string;
  description?: string | null;
  order: number;
  is_free: boolean;
  video_url: string;
  duration_sec: number;
};

export function useCourseLessons(courseId: string) {
  const queryClient = useQueryClient();
  const listQuery = useQuery<LessonApi[]>({
    queryKey: ["lessons", courseId],
    queryFn: async () =>
      (await apiClient.get(`/courses/${courseId}/lessons`)).data,
    enabled: !!courseId,
  });

  const addLesson = useMutation({
    mutationFn: async (payload: LessonPayload) => {
      if (!isValidHttpUrl(payload.video_url)) {
        throw new Error("video_url http/https bo'lishi shart");
      }
      return (await apiClient.post("/lessons", payload)).data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["lessons"] }),
  });

  const updateLesson = useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & Partial<LessonPayload>) => {
      if (payload.video_url && !isValidHttpUrl(payload.video_url)) {
        throw new Error("video_url http/https bo'lishi shart");
      }
      return (await apiClient.put(`/lessons/${id}`, payload)).data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["lessons"] }),
  });

  const deleteLesson = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/lessons/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["lessons"] }),
  });

  return {
    ...listQuery,
    addLesson: addLesson.mutateAsync,
    updateLesson: updateLesson.mutateAsync,
    deleteLesson: deleteLesson.mutateAsync,
  };
}

export function useLessonDetail(lessonId: string) {
  return useQuery<LessonApi>({
    queryKey: ["lesson", lessonId],
    queryFn: async () => (await apiClient.get(`/lessons/${lessonId}`)).data,
    enabled: !!lessonId,
  });
}
